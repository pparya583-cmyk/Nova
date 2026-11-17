package id.novamusic.app

import android.content.Intent
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

/**
 * Owns audio playback independently from MainActivity.
 *
 * MediaSessionService publishes the system media notification while playing,
 * allowing playback controls on the notification shade and lock screen.
 */
class NovaPlaybackService : MediaSessionService() {
    private var player: ExoPlayer? = null
    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()

        val exoPlayer = ExoPlayer.Builder(this).build().apply {
            repeatMode = androidx.media3.common.Player.REPEAT_MODE_OFF
            shuffleModeEnabled = true
        }
        player = exoPlayer
        mediaSession = MediaSession.Builder(this, exoPlayer).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    /**
     * If the user explicitly dismisses NovaMusic from Android Recents,
     * stop playback and remove the media session/notification.
     * Merely switching apps or turning the screen off does not call this.
     */
    override fun onTaskRemoved(rootIntent: Intent?) {
        player?.run {
            pause()
            clearMediaItems()
        }
        stopSelf()
    }

    override fun onDestroy() {
        mediaSession?.release()
        mediaSession = null
        player?.release()
        player = null
        super.onDestroy()
    }
}
