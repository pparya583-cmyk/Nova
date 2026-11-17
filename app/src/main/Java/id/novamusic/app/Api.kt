package id.novamusic.app

import android.app.DownloadManager
import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

// ---------------------------------------------------------------- HTTP

suspend fun httpGet(address: String): String = withContext(Dispatchers.IO) {
    val connection = (URL(address).openConnection() as HttpURLConnection).apply {
        connectTimeout = 12_000
        readTimeout = 18_000
        requestMethod = "GET"
        setRequestProperty("User-Agent", "NovaMusic/2.0 (Android)")
    }
    try {
        val code = connection.responseCode
        if (code !in 200..299) throw IllegalStateException("Server returned $code")
        connection.inputStream.bufferedReader().use { it.readText() }
    } finally {
        connection.disconnect()
    }
}

private fun enc(value: String): String = URLEncoder.encode(value, "UTF-8")

// ------------------------------------------------------ Internet Archive

/** Cari audio di Internet Archive. Metadata tiap item diambil paralel (maks 6 sekaligus). */
suspend fun searchInternetArchive(term: String, rows: Int = 24): List<Track> = coroutineScope {
    val q = enc("($term) AND mediatype:audio AND NOT access-restricted-item:true")
    val api = "https://archive.org/advancedsearch.php?q=$q" +
        "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator" +
        "&sort%5B%5D=downloads+desc&rows=$rows&page=1&output=json"

    val docs = JSONObject(httpGet(api)).optJSONObject("response")?.optJSONArray("docs")
        ?: return@coroutineScope emptyList<Track>()

    val gate = Semaphore(6)
    val jobs = (0 until docs.length()).mapNotNull { docs.optJSONObject(it) }.map { doc ->
        async {
            gate.withPermit {
                try {
                    resolveArchiveItem(doc)
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    null // item tanpa metadata valid dilewati
                }
            }
        }
    }
    jobs.awaitAll().filterNotNull()
}

private fun anyToString(value: Any?): String? = when (value) {
    is String -> value.takeIf { it.isNotBlank() }
    is JSONArray -> if (value.length() > 0) value.optString(0).takeIf { it.isNotBlank() } else null
    else -> null
}

private fun parseLength(raw: String): Long {
    raw.toDoubleOrNull()?.let { return (it * 1000).toLong() }
    val parts = raw.split(":").mapNotNull { it.toDoubleOrNull() }
    if (parts.isEmpty() || parts.size != raw.split(":").size) return 0L
    var seconds = 0.0
    for (p in parts) seconds = seconds * 60 + p
    return (seconds * 1000).toLong()
}

private fun isAudioFile(f: JSONObject): Boolean {
    val name = f.optString("name")
    val format = f.optString("format").lowercase()
    if (name.isBlank() || f.optString("private") == "true") return false
    return format.contains("mp3") || format.contains("ogg") || format.contains("flac") ||
        format.contains("wave") || name.endsWith(".mp3", true) || name.endsWith(".ogg", true) ||
        name.endsWith(".flac", true) || name.endsWith(".wav", true)
}

private suspend fun resolveArchiveItem(doc: JSONObject): Track? {
    val identifier = doc.optString("identifier")
    if (identifier.isBlank()) return null

    val meta = JSONObject(httpGet("https://archive.org/metadata/$identifier"))
    if (meta.optBoolean("is_dark")) return null
    if (meta.optJSONObject("metadata")?.optString("access-restricted-item") == "true") return null
    val files = meta.optJSONArray("files") ?: return null

    val candidates = mutableListOf<JSONObject>()
    for (i in 0 until files.length()) {
        val f = files.optJSONObject(i) ?: continue
        if (isAudioFile(f)) candidates += f
    }
    // Utamakan MP3 derivative (ringan, selalu ada), lalu MP3 apa pun, lalu format audio lain.
    val file = candidates.firstOrNull {
        it.optString("source") == "derivative" && it.optString("name").endsWith(".mp3", true)
    } ?: candidates.firstOrNull { it.optString("name").endsWith(".mp3", true) }
        ?: candidates.firstOrNull()
        ?: return null

    val fileName = file.optString("name")
    val encodedName = fileName.split("/").joinToString("/") { enc(it).replace("+", "%20") }
    val url = "https://archive.org/download/$identifier/$encodedName"

    return Track(
        id = "ia:$identifier:$fileName",
        title = anyToString(doc.opt("title")) ?: identifier,
        artist = anyToString(doc.opt("creator")) ?: "Unknown artist",
        album = identifier,
        streamUrl = url,
        durationMs = parseLength(file.optString("length")),
        downloadUrl = url,
        source = "Internet Archive",
        artUrl = "https://archive.org/services/img/$identifier"
    )
}

// ---------------------------------------------------------------- Lyrics

private fun parseLrc(lrc: String): List<LyricLine> {
    val re = Regex("""^\[(\d+):(\d+(?:\.\d+)?)](.*)$""")
    return lrc.lineSequence()
        .mapNotNull { line ->
            val m = re.find(line.trim()) ?: return@mapNotNull null
            val minutes = m.groupValues[1].toLong()
            val seconds = m.groupValues[2].toDouble()
            LyricLine(minutes * 60_000 + (seconds * 1000).toLong(), m.groupValues[3].trim())
        }
        .sortedBy { it.timeMs }
        .toList()
}

private fun JSONObject.toLyrics(): Lyrics? {
    val plain = optString("plainLyrics").takeIf { it.isNotBlank() && it != "null" }
    val synced = optString("syncedLyrics").takeIf { it.isNotBlank() && it != "null" }
        ?.let { parseLrc(it) }.orEmpty()
    if (plain == null && synced.isEmpty()) return null
    return Lyrics(plain, synced)
}

/** Lyrics dari LRCLIB. Coba exact match dulu, lalu fallback ke search. */
suspend fun fetchLyrics(title: String, artist: String): Lyrics? {
    val cleanTitle = title.replace(Regex("""\s*[\(\[].*?[\)\]]"""), "").trim().ifBlank { title }
    val cleanArtist = artist.takeUnless { it.startsWith("Unknown", true) }.orEmpty()
    try {
        if (cleanArtist.isNotBlank()) {
            try {
                val exact = JSONObject(
                    httpGet("https://lrclib.net/api/get?track_name=${enc(cleanTitle)}&artist_name=${enc(cleanArtist)}")
                ).toLyrics()
                if (exact != null) return exact
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                // 404 = tidak ketemu, lanjut ke search
            }
        }
        val searchUrl = "https://lrclib.net/api/search?track_name=${enc(cleanTitle)}" +
            if (cleanArtist.isNotBlank()) "&artist_name=${enc(cleanArtist)}" else ""
        val arr = JSONArray(httpGet(searchUrl))
        for (i in 0 until arr.length()) {
            arr.optJSONObject(i)?.toLyrics()?.let { return it }
        }
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        // jaringan / parsing gagal -> anggap tidak ada lyrics
    }
    return null
}

// ----------------------------------------------------------- Local audio

suspend fun loadLocalTracks(context: Context): List<Track> = withContext(Dispatchers.IO) {
    val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
    val projection = arrayOf(
        MediaStore.Audio.Media._ID, MediaStore.Audio.Media.TITLE,
        MediaStore.Audio.Media.ARTIST, MediaStore.Audio.Media.ALBUM,
        MediaStore.Audio.Media.DURATION
    )
    val result = mutableListOf<Track>()
    try {
        context.contentResolver.query(
            collection, projection, "${MediaStore.Audio.Media.IS_MUSIC} != 0", null, null
        )?.use { c ->
            val idC = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleC = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistC = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumC = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durC = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            while (c.moveToNext()) {
                val id = c.getLong(idC)
                val uri = ContentUris.withAppendedId(collection, id)
                result += Track(
                    id = "local:$id",
                    title = c.getString(titleC) ?: "Unknown title",
                    artist = c.getString(artistC)?.takeUnless { it == "<unknown>" } ?: "Unknown artist",
                    album = c.getString(albumC) ?: "Unknown album",
                    streamUrl = uri.toString(),
                    durationMs = c.getLong(durC),
                    localUri = uri,
                    source = "On device"
                )
            }
        }
    } catch (_: SecurityException) {
        // izin dicabut
    }
    // Sort di Kotlin, bukan lewat "COLLATE NOCASE" di SQL (bisa ditolak MediaProvider di Android baru).
    result.sortedBy { it.title.lowercase() }
}

// -------------------------------------------------------------- Download

private fun safeFileName(value: String): String =
    value.replace(Regex("[^a-zA-Z0-9._ -]"), "_").take(80).ifBlank { "track" }

fun downloadTrack(context: Context, track: Track) {
    val url = track.downloadUrl ?: return
    try {
        val ext = Uri.parse(url).lastPathSegment
            ?.substringAfterLast('.', "")
            ?.lowercase()
            ?.takeIf { it.length in 2..4 && it.all { ch -> ch.isLetterOrDigit() } }
            ?: "mp3"
        val relative = "NovaMusic/${safeFileName(track.title)}.$ext"
        val request = DownloadManager.Request(Uri.parse(url))
            .setTitle(track.title)
            .setDescription("Downloading from Internet Archive")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(false)
        if (Build.VERSION.SDK_INT >= 29) {
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_MUSIC, relative)
        } else {
            // Android 8-9: folder publik butuh izin WRITE_EXTERNAL_STORAGE, folder app tidak.
            request.setDestinationInExternalFilesDir(context, Environment.DIRECTORY_MUSIC, relative)
        }
        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        manager.enqueue(request)
        Toast.makeText(context, "Download started", Toast.LENGTH_SHORT).show()
    } catch (_: Exception) {
        Toast.makeText(context, "Could not start download", Toast.LENGTH_SHORT).show()
    }
}
