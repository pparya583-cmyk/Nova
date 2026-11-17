package id.novamusic.app

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/** Penyimpanan lokal (SharedPreferences, JSON). Format "favorites" kompatibel dengan versi 1.x. */
object Store {
    private const val PREFS = "novamusic"

    private fun prefs(c: Context) = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun trackToJson(t: Track) = JSONObject().apply {
        put("id", t.id); put("title", t.title); put("artist", t.artist)
        put("album", t.album); put("streamUrl", t.streamUrl)
        put("durationMs", t.durationMs); put("localUri", t.localUri?.toString() ?: "")
        put("downloadUrl", t.downloadUrl ?: ""); put("source", t.source)
        put("artUrl", t.artUrl ?: "")
    }

    private fun trackFromJson(o: JSONObject) = Track(
        id = o.optString("id"),
        title = o.optString("title"),
        artist = o.optString("artist"),
        album = o.optString("album"),
        streamUrl = o.optString("streamUrl"),
        durationMs = o.optLong("durationMs"),
        localUri = o.optString("localUri").takeIf { it.isNotBlank() }?.let { Uri.parse(it) },
        downloadUrl = o.optString("downloadUrl").takeIf { it.isNotBlank() },
        source = o.optString("source", "Saved"),
        artUrl = o.optString("artUrl").takeIf { it.isNotBlank() }
    )

    private fun tracksFromArray(array: JSONArray): List<Track> {
        val out = mutableListOf<Track>()
        for (i in 0 until array.length()) {
            val o = array.optJSONObject(i) ?: continue
            val t = trackFromJson(o)
            if (t.id.isNotBlank() && t.streamUrl.isNotBlank()) out += t
        }
        return out
    }

    private fun tracksToArray(tracks: List<Track>) = JSONArray().also { a -> tracks.forEach { a.put(trackToJson(it)) } }

    fun loadTracks(c: Context, key: String): List<Track> = try {
        tracksFromArray(JSONArray(prefs(c).getString(key, "[]") ?: "[]"))
    } catch (_: Exception) {
        emptyList()
    }

    fun saveTracks(c: Context, key: String, tracks: List<Track>) {
        prefs(c).edit().putString(key, tracksToArray(tracks).toString()).apply()
    }

    fun loadPlaylists(c: Context): List<Playlist> = try {
        val arr = JSONArray(prefs(c).getString("playlists", "[]") ?: "[]")
        val out = mutableListOf<Playlist>()
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            out += Playlist(
                id = o.optString("id"),
                name = o.optString("name", "Playlist"),
                tracks = tracksFromArray(o.optJSONArray("tracks") ?: JSONArray())
            )
        }
        out
    } catch (_: Exception) {
        emptyList()
    }

    fun savePlaylists(c: Context, playlists: List<Playlist>) {
        val arr = JSONArray()
        playlists.forEach { p ->
            arr.put(JSONObject().apply {
                put("id", p.id); put("name", p.name); put("tracks", tracksToArray(p.tracks))
            })
        }
        prefs(c).edit().putString("playlists", arr.toString()).apply()
    }
}

/** Favorit, riwayat putar, dan playlist. Semua berupa state Compose. */
@Stable
class LibraryState(private val ctx: Context) {
    var favorites by mutableStateOf(Store.loadTracks(ctx, "favorites"))
        private set
    var recents by mutableStateOf(Store.loadTracks(ctx, "recents"))
        private set
    var playlists by mutableStateOf(Store.loadPlaylists(ctx))
        private set

    fun toggleFavorite(t: Track) {
        favorites = if (favorites.any { it.id == t.id }) favorites.filterNot { it.id == t.id }
        else listOf(t) + favorites
        Store.saveTracks(ctx, "favorites", favorites)
    }

    fun addRecent(t: Track) {
        recents = (listOf(t) + recents.filterNot { it.id == t.id }).take(30)
        Store.saveTracks(ctx, "recents", recents)
    }

    fun createPlaylist(name: String, first: Track? = null): Playlist {
        val p = Playlist(UUID.randomUUID().toString(), name.trim().ifBlank { "My playlist" }, listOfNotNull(first))
        playlists = playlists + p
        Store.savePlaylists(ctx, playlists)
        return p
    }

    fun deletePlaylist(id: String) {
        playlists = playlists.filterNot { it.id == id }
        Store.savePlaylists(ctx, playlists)
    }

    /** @return false kalau lagu sudah ada di playlist itu. */
    fun addToPlaylist(playlistId: String, t: Track): Boolean {
        val target = playlists.firstOrNull { it.id == playlistId } ?: return false
        if (target.tracks.any { it.id == t.id }) return false
        playlists = playlists.map { if (it.id == playlistId) it.copy(tracks = it.tracks + t) else it }
        Store.savePlaylists(ctx, playlists)
        return true
    }

    fun removeFromPlaylist(playlistId: String, trackId: String) {
        playlists = playlists.map {
            if (it.id == playlistId) it.copy(tracks = it.tracks.filterNot { t -> t.id == trackId }) else it
        }
        Store.savePlaylists(ctx, playlists)
    }
}
