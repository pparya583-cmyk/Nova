package id.novamusic.app

import android.Manifest
import android.content.ComponentName
import android.content.pm.PackageManager
import android.graphics.Color as AndroidColor
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.concurrent.Future
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    private val controllerState = mutableStateOf<MediaController?>(null)
    private var controllerFuture: Future<MediaController>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT)
        )
        setContent { NovaApp(controllerState.value) }
    }

    // Controller dihubungkan saat app terlihat, dilepas saat tidak. Service tetap memutar musik.
    override fun onStart() {
        super.onStart()
        val token = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        val future = MediaController.Builder(this, token).buildAsync()
        controllerFuture = future
        future.addListener({
            try {
                if (controllerFuture === future) controllerState.value = future.get()
            } catch (_: Exception) {
                // service gagal start; UI tetap jalan tanpa player
            }
        }, ContextCompat.getMainExecutor(this))
    }

    override fun onStop() {
        controllerState.value = null
        controllerFuture?.let { MediaController.releaseFuture(it) }
        controllerFuture = null
        super.onStop()
    }
}

private fun greeting(): String = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
    in 5..11 -> "Good morning."
    in 12..16 -> "Good afternoon."
    in 17..20 -> "Good evening."
    else -> "Late night vibes."
}

@Composable
fun NovaApp(controller: MediaController?) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val lib = remember { LibraryState(ctx) }
    val ui = rememberPlayerUi(controller)

    var tab by rememberSaveable { mutableStateOf(NavTab.HOME) }
    var libTab by rememberSaveable { mutableStateOf(LibTab.SONGS) }
    var openPlaylistId by rememberSaveable { mutableStateOf<String?>(null) }
    var showNowPlaying by rememberSaveable { mutableStateOf(false) }
    var askedNotifications by rememberSaveable { mutableStateOf(false) }

    var query by rememberSaveable { mutableStateOf("") }
    var results by remember { mutableStateOf<List<Track>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    var searchError by remember { mutableStateOf<String?>(null) }
    var searchSeq by remember { mutableIntStateOf(0) }

    var featured by remember { mutableStateOf<List<Track>>(emptyList()) }
    var featuredLoading by remember { mutableStateOf(true) }

    var local by remember { mutableStateOf<List<Track>>(emptyList()) }
    val audioPermission = if (Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_AUDIO
    else Manifest.permission.READ_EXTERNAL_STORAGE
    var permission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(ctx, audioPermission) == PackageManager.PERMISSION_GRANTED)
    }

    var playlistTarget by remember { mutableStateOf<Track?>(null) }
    var showNewPlaylist by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        permission = granted
    }
    val notificationLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }

    fun toast(message: String) = Toast.makeText(ctx, message, Toast.LENGTH_SHORT).show()

    LaunchedEffect(permission) {
        if (permission) local = loadLocalTracks(ctx)
    }

    LaunchedEffect(Unit) {
        try {
            featured = searchInternetArchive("jazz OR classical OR ambient", 12)
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            // offline: Home menampilkan pesan kosong
        } finally {
            featuredLoading = false
        }
    }

    // Riwayat putar: simpan lagu tiap kali lagu yang sedang diputar berganti.
    LaunchedEffect(ui.current?.id) {
        ui.current?.let { lib.addRecent(it) }
    }

    fun search(term: String) {
        val q = term.trim()
        if (q.isEmpty()) return
        searchSeq += 1
        val mySeq = searchSeq
        searching = true
        searchError = null
        scope.launch {
            try {
                val found = searchInternetArchive(q)
                if (mySeq != searchSeq) return@launch
                results = found
                if (found.isEmpty()) searchError = "No full-track results found. Try another keyword."
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                if (mySeq == searchSeq) searchError = "Search failed: ${e.message ?: "check your internet connection"}"
            } finally {
                if (mySeq == searchSeq) searching = false
            }
        }
    }

    fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && !askedNotifications &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            askedNotifications = true
            notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    fun startQueue(items: List<Track>, startIndex: Int, shuffle: Boolean?) {
        val c = controller
        if (c == null) {
            toast("Player is still starting, try again")
            return
        }
        if (items.isEmpty()) return
        // Antrean dibatasi 300 lagu di sekitar lagu yang dipilih (library lokal bisa ribuan).
        val window = 300
        var list = items
        var index = startIndex.coerceIn(0, items.lastIndex)
        if (items.size > window) {
            val start = (index - window / 3).coerceAtLeast(0)
            list = items.subList(start, minOf(items.size, start + window))
            index -= start
        }
        if (shuffle != null) c.shuffleModeEnabled = shuffle
        c.setMediaItems(list.map { it.toMediaItem() }, index, 0L)
        c.prepare()
        c.play()
        askNotificationPermission()
    }

    val act = Actions(
        play = { track, list ->
            val source = if (list.any { it.id == track.id }) list else listOf(track)
            startQueue(source, source.indexOfFirst { it.id == track.id }, null)
        },
        playAll = { list, shuffle ->
            if (list.isNotEmpty()) startQueue(list, if (shuffle) Random.nextInt(list.size) else 0, shuffle)
        },
        playNext = { track ->
            val c = controller
            if (c == null || c.mediaItemCount == 0) {
                startQueue(listOf(track), 0, null)
            } else {
                c.addMediaItem(c.currentMediaItemIndex + 1, track.toMediaItem())
                toast("Playing next")
            }
        },
        enqueue = { track ->
            val c = controller
            if (c == null || c.mediaItemCount == 0) {
                startQueue(listOf(track), 0, null)
            } else {
                c.addMediaItem(track.toMediaItem())
                toast("Added to queue")
            }
        },
        toggleFav = { lib.toggleFavorite(it) },
        addToPlaylist = { playlistTarget = it },
        download = { downloadTrack(ctx, it) }
    )

    val favIds = remember(lib.favorites) { lib.favorites.map { it.id }.toSet() }
    val openPlaylist = lib.playlists.firstOrNull { it.id == openPlaylistId }
    val current = ui.current

    BackHandler(enabled = showNowPlaying) { showNowPlaying = false }
    BackHandler(enabled = !showNowPlaying && tab == NavTab.LIBRARY && openPlaylist != null) { openPlaylistId = null }

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Accent, onPrimary = Color(0xFF00382A),
            background = DeepBg, onBackground = Color.White,
            surface = DialogBg, onSurface = Color.White,
            secondary = TextLow
        )
    ) {
        CompositionLocalProvider(LocalContentColor provides Color.White) {
            Box(Modifier.fillMaxSize()) {
                AuroraBackground()

                Column(Modifier.fillMaxSize().statusBarsPadding()) {
                    when (tab) {
                        NavTab.HOME -> HomeScreen(
                            greeting = greeting(), ui = ui,
                            recents = lib.recents, favorites = lib.favorites,
                            featured = featured, featuredLoading = featuredLoading,
                            local = local, permission = permission,
                            onAllow = { permissionLauncher.launch(audioPermission) },
                            favIds = favIds, act = act,
                            onGenre = { g -> query = g; tab = NavTab.SEARCH; search(g) },
                            onOpenSearch = { tab = NavTab.SEARCH }
                        )
                        NavTab.SEARCH -> SearchScreen(
                            query = query, onQuery = { query = it }, onSearch = { search(query) },
                            onGenre = { g -> query = g; search(g) },
                            results = results, searching = searching, error = searchError,
                            ui = ui, favIds = favIds, act = act
                        )
                        NavTab.LIBRARY -> LibraryScreen(
                            libTab = libTab, onLibTab = { libTab = it; openPlaylistId = null },
                            ui = ui, local = local, permission = permission,
                            onAllow = { permissionLauncher.launch(audioPermission) },
                            onRefresh = {
                                scope.launch { local = loadLocalTracks(ctx) }
                            },
                            liked = lib.favorites, playlists = lib.playlists,
                            openPlaylist = openPlaylist,
                            onOpenPlaylist = { openPlaylistId = it },
                            onNewPlaylist = { showNewPlaylist = true },
                            onDeletePlaylist = { id -> lib.deletePlaylist(id); openPlaylistId = null },
                            onRemoveFromPlaylist = { pid, tid -> lib.removeFromPlaylist(pid, tid) },
                            favIds = favIds, act = act
                        )
                    }
                }

                Column(
                    Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (current != null && controller != null) {
                        MiniPlayer(
                            ui = ui, track = current,
                            onToggle = { if (ui.isPlaying) controller.pause() else controller.play() },
                            onNext = { controller.seekToNext() },
                            onOpen = { showNowPlaying = true }
                        )
                    }
                    GlassNav(tab) { tab = it }
                }

                AnimatedVisibility(
                    visible = showNowPlaying && current != null && controller != null,
                    enter = slideInVertically { it } + fadeIn(),
                    exit = slideOutVertically { it } + fadeOut()
                ) {
                    if (current != null && controller != null) {
                        NowPlayingScreen(
                            ui = ui, player = controller, track = current,
                            liked = current.id in favIds, act = act,
                            onClose = { showNowPlaying = false }
                        )
                    }
                }

                playlistTarget?.let { t ->
                    PlaylistDialog(
                        track = t, playlists = lib.playlists,
                        onPick = { pl ->
                            toast(if (lib.addToPlaylist(pl.id, t)) "Added to ${pl.name}" else "Already in ${pl.name}")
                            playlistTarget = null
                        },
                        onCreate = { name ->
                            val pl = lib.createPlaylist(name, t)
                            toast("Added to ${pl.name}")
                            playlistTarget = null
                        },
                        onDismiss = { playlistTarget = null }
                    )
                }
                if (showNewPlaylist) {
                    PlaylistDialog(
                        track = null, playlists = lib.playlists,
                        onPick = { },
                        onCreate = { name ->
                            lib.createPlaylist(name)
                            showNewPlaylist = false
                        },
                        onDismiss = { showNewPlaylist = false }
                    )
                }
            }
        }
    }
}
