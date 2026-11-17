package id.novamusic.app

import android.net.Uri
import android.os.Bundle
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import java.util.Locale

data class Track(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val streamUrl: String,
    val durationMs: Long = 0L,
    val localUri: Uri? = null,
    val downloadUrl: String? = null,
    val source: String = "Internet Archive",
    val artUrl: String? = null
)

data class Playlist(val id: String, val name: String, val tracks: List<Track>)

data class LyricLine(val timeMs: Long, val text: String)

data class Lyrics(val plain: String?, val synced: List<LyricLine>)

enum class NavTab { HOME, SEARCH, LIBRARY }

enum class LibTab(val label: String) {
    SONGS("Songs"),
    LIKED("Liked"),
    PLAYLISTS("Playlists")
}

/** Track -> MediaItem. Metadata ikut dikirim ke MediaSession (notifikasi, lock screen). */
fun Track.toMediaItem(): MediaItem {
    val extras = Bundle().apply {
        putLong("durationMs", durationMs)
        putString("localUri", localUri?.toString())
        putString("downloadUrl", downloadUrl)
        putString("source", source)
    }
    val metadata = MediaMetadata.Builder()
        .setTitle(title)
        .setArtist(artist)
        .setAlbumTitle(album)
        .setArtworkUri(artUrl?.let { Uri.parse(it) })
        .setExtras(extras)
        .build()
    return MediaItem.Builder()
        .setMediaId(id)
        .setUri(streamUrl)
        .setMediaMetadata(metadata)
        .build()
}

/** MediaItem -> Track, supaya UI bisa dibangun ulang dari state service. */
fun MediaItem.toTrack(): Track {
    val md = mediaMetadata
    val ex = md.extras
    return Track(
        id = mediaId,
        title = md.title?.toString() ?: "Unknown title",
        artist = md.artist?.toString() ?: "Unknown artist",
        album = md.albumTitle?.toString() ?: "",
        streamUrl = localConfiguration?.uri?.toString() ?: "",
        durationMs = ex?.getLong("durationMs") ?: 0L,
        localUri = ex?.getString("localUri")?.takeIf { it.isNotBlank() }?.let { Uri.parse(it) },
        downloadUrl = ex?.getString("downloadUrl")?.takeIf { it.isNotBlank() },
        source = ex?.getString("source") ?: "",
        artUrl = md.artworkUri?.toString()
    )
}

fun formatTime(ms: Long): String {
    val total = (ms / 1000).coerceAtLeast(0)
    return String.format(Locale.US, "%d:%02d", total / 60, total % 60)
}
