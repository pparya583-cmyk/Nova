package id.novamusic.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.media3.common.C
import androidx.media3.common.Player
import kotlinx.coroutines.delay

/** State player yang bisa dibaca Compose. Sumber kebenarannya tetap Player (MediaController). */
@Stable
class PlayerUi {
    var isPlaying by mutableStateOf(false)
    var buffering by mutableStateOf(false)
    var current by mutableStateOf<Track?>(null)
    var queue by mutableStateOf<List<Track>>(emptyList())
    var currentIndex by mutableIntStateOf(-1)
    var shuffle by mutableStateOf(false)
    var repeatMode by mutableIntStateOf(Player.REPEAT_MODE_OFF)
    var positionMs by mutableLongStateOf(0L)
    var durationMs by mutableLongStateOf(0L)

    internal fun sync(p: Player, rebuildQueue: Boolean) {
        isPlaying = p.isPlaying
        buffering = p.playbackState == Player.STATE_BUFFERING
        shuffle = p.shuffleModeEnabled
        repeatMode = p.repeatMode
        currentIndex = p.currentMediaItemIndex
        if (rebuildQueue) {
            queue = List(p.mediaItemCount) { p.getMediaItemAt(it).toTrack() }
        }
        current = p.currentMediaItem?.toTrack()
        positionMs = p.currentPosition.coerceAtLeast(0L)
        val d = p.duration
        durationMs = if (d != C.TIME_UNSET && d > 0) d else (current?.durationMs ?: 0L)
    }

    internal fun reset() {
        isPlaying = false
        buffering = false
        current = null
        queue = emptyList()
        currentIndex = -1
        positionMs = 0L
        durationMs = 0L
    }
}

@Composable
fun rememberPlayerUi(player: Player?): PlayerUi {
    val ui = remember { PlayerUi() }

    DisposableEffect(player) {
        if (player == null) {
            ui.reset()
            onDispose { }
        } else {
            val listener = object : Player.Listener {
                override fun onEvents(player: Player, events: Player.Events) {
                    ui.sync(player, events.contains(Player.EVENT_TIMELINE_CHANGED))
                }
            }
            player.addListener(listener)
            ui.sync(player, true)
            onDispose { player.removeListener(listener) }
        }
    }

    // Posisi lagu di-poll tiap 300 ms hanya saat lagi play.
    LaunchedEffect(player, ui.isPlaying) {
        val p = player ?: return@LaunchedEffect
        while (true) {
            ui.positionMs = p.currentPosition.coerceAtLeast(0L)
            if (!ui.isPlaying) break
            delay(300)
        }
    }
    return ui
}
