package id.novamusic.app

import android.Manifest
import android.app.DownloadManager
import android.content.ContentUris
import android.content.Context
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.MutableTransitionState
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import kotlin.math.roundToInt

private val Ink = Color(0xFFE8ECE4)
private val Panel = Color(0xFFF4F6F0)
private val Panel2 = Color(0xFFE0E7DD)
private val Green = Color(0xFF526B55)
private val Muted = Color(0xFF718074)
private val Cream = Color(0xFF26352A)
private val GlassTint = Color(0xFFFFFFFF)

private fun Modifier.glassSurface(shape: Shape, tint: Color = GlassTint): Modifier =
    this.clip(shape)
        .background(
            Brush.verticalGradient(
                listOf(
                    Color.White.copy(alpha = 0.78f),
                    tint.copy(alpha = 0.66f),
                    tint.copy(alpha = 0.42f)
                )
            ),
            shape
        )
        .border(
            BorderStroke(
                1.dp,
                Brush.verticalGradient(
                    listOf(
                        Color.White.copy(alpha = 0.92f),
                        Color(0xFF879889).copy(alpha = 0.14f),
                        Color(0xFF879889).copy(alpha = 0.22f)
                    )
                )
            ),
            shape
        )

data class Track(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val streamUrl: String,
    val durationMs: Long = 0L,
    val localUri: Uri? = null,
    val downloadUrl: String? = null,
    val source: String = "Internet Archive"
)

enum class Tab { HOME, SEARCH, LIBRARY, FAVORITES }

class MainActivity : ComponentActivity() {
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var mediaController: MediaController? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Target SDK 35+ forces edge-to-edge; keep status/navigation icons dark on the light UI.
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT)
        )

        // Bind to the dedicated playback service. The service owns the player,
        // so playback survives Activity destruction and app backgrounding.
        val token = SessionToken(this, ComponentName(this, NovaPlaybackService::class.java))
        val future = MediaController.Builder(this, token).buildAsync()
        controllerFuture = future
        future.addListener({
            try {
                mediaController = future.get()
                setContent {
                    NovaMusicApp(
                        player = mediaController!!,
                        loadLocalTracks = { loadLocalTracks() },
                        hasAudioPermission = { hasAudioPermission() }
                    )
                }
            } catch (e: Exception) {
                Toast.makeText(this, "Playback service could not start: ${e.message}", Toast.LENGTH_LONG).show()
                finish()
            }
        }, mainExecutor)
    }

    private fun hasAudioPermission(): Boolean {
        val p = if (Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_AUDIO
        else Manifest.permission.READ_EXTERNAL_STORAGE
        return ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED
    }

    private fun loadLocalTracks(): List<Track> {
        val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID, MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST, MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION
        )
        val cursor = contentResolver.query(
            collection, projection, "${MediaStore.Audio.Media.IS_MUSIC} != 0",
            null, "${MediaStore.Audio.Media.TITLE} COLLATE NOCASE ASC"
        )
        val result = mutableListOf<Track>()
        cursor?.use {
            val idC = it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleC = it.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistC = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumC = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durationC = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            while (it.moveToNext()) {
                val id = it.getLong(idC)
                val uri = ContentUris.withAppendedId(collection, id)
                result += Track(
                    id = "local:$id",
                    title = it.getString(titleC) ?: "Unknown title",
                    artist = it.getString(artistC)?.takeUnless { a -> a == "<unknown>" } ?: "Unknown artist",
                    album = it.getString(albumC) ?: "Unknown album",
                    streamUrl = uri.toString(),
                    durationMs = it.getLong(durationC),
                    localUri = uri,
                    source = "On device"
                )
            }
        }
        return result
    }

    override fun onDestroy() {
        controllerFuture?.let { MediaController.releaseFuture(it) }
        controllerFuture = null
        mediaController = null
        // Do not stop the service here. The service owns playback and should
        // continue while the Activity is merely closed or backgrounded.
        super.onDestroy()
    }
}

@Composable
private fun NovaMusicApp(
    player: Player,
    loadLocalTracks: () -> List<Track>,
    hasAudioPermission: () -> Boolean
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var tab by remember { mutableStateOf(Tab.HOME) }
    var query by remember { mutableStateOf("") }
    var onlineResults by remember { mutableStateOf<List<Track>>(emptyList()) }
    var localTracks by remember { mutableStateOf(emptyList<Track>()) }
    var favorites by remember { mutableStateOf(loadFavorites(context)) }
    var current by remember { mutableStateOf<Track?>(null) }
    var queueTracks by remember { mutableStateOf<List<Track>>(emptyList()) }
    var playing by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var lyrics by remember { mutableStateOf<String?>(null) }
    var showLyrics by remember { mutableStateOf(false) }
    var permission by remember { mutableStateOf(hasAudioPermission()) }
    var showSplash by remember { mutableStateOf(true) }

    // Android 13+ needs a runtime grant before the media notification/lock-screen controls can show.
    val notificationLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    LaunchedEffect(Unit) {
        delay(2100)
        showSplash = false
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    val permissionName = if (Build.VERSION.SDK_INT >= 33)
        Manifest.permission.READ_MEDIA_AUDIO else Manifest.permission.READ_EXTERNAL_STORAGE
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        permission = granted
        if (granted) localTracks = loadLocalTracks()
    }

    LaunchedEffect(Unit) {
        if (permission) localTracks = loadLocalTracks()
    }
    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                playing = isPlaying
            }

            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                current = mediaItem?.let { item ->
                    queueTracks.firstOrNull { it.id == item.mediaId }
                        ?: Track(
                            id = item.mediaId,
                            title = item.mediaMetadata.title?.toString() ?: "Now playing",
                            artist = item.mediaMetadata.artist?.toString() ?: "Unknown artist",
                            album = item.mediaMetadata.albumTitle?.toString() ?: "Unknown album",
                            streamUrl = item.localConfiguration?.uri?.toString().orEmpty(),
                            source = "Now playing"
                        )
                }
            }
        }
        player.addListener(listener)
        playing = player.isPlaying
        player.currentMediaItem?.let { item ->
            current = queueTracks.firstOrNull { it.id == item.mediaId }
                ?: Track(
                    id = item.mediaId,
                    title = item.mediaMetadata.title?.toString() ?: "Now playing",
                    artist = item.mediaMetadata.artist?.toString() ?: "Unknown artist",
                    album = item.mediaMetadata.albumTitle?.toString() ?: "Unknown album",
                    streamUrl = item.localConfiguration?.uri?.toString().orEmpty(),
                    source = "Now playing"
                )
        }
        onDispose { player.removeListener(listener) }
    }

    fun playTrack(track: Track, list: List<Track>) {
        val safeQueue = list.distinctBy { it.id }
        val index = safeQueue.indexOfFirst { it.id == track.id }.coerceAtLeast(0)
        val items = safeQueue.map {
            MediaItem.Builder()
                .setMediaId(it.id)
                .setUri(it.streamUrl)
                .setMediaMetadata(
                    MediaMetadata.Builder()
                        .setTitle(it.title)
                        .setArtist(it.artist)
                        .setAlbumTitle(it.album)
                        .build()
                )
                .build()
        }
        queueTracks = safeQueue
        player.repeatMode = Player.REPEAT_MODE_OFF
        player.setMediaItems(items, index, 0L)
        // Shuffle the remaining queue so tracks continue in a random order.
        player.shuffleModeEnabled = true
        player.prepare()
        player.play()
        current = track
        lyrics = null
        showLyrics = false
    }

    fun searchOnline() {
        if (query.isBlank()) return
        loading = true
        error = null
        scope.launch {
            try {
                onlineResults = withContext(Dispatchers.IO) { searchInternetArchive(query.trim()) }
                if (onlineResults.isEmpty()) error = "No full-track results found. Try another keyword."
            } catch (e: Exception) {
                error = e.message ?: "Search failed. Check your internet connection."
            } finally { loading = false }
        }
    }

    fun toggleFavorite(track: Track) {
        favorites = if (favorites.any { it.id == track.id }) favorites.filterNot { it.id == track.id }
                    else favorites + track
        saveFavorites(context, favorites)
    }

    MaterialTheme(colorScheme = lightColorScheme(
        primary = Green, onPrimary = Color.White, background = Ink, surface = Panel,
        onSurface = Cream, onBackground = Cream, secondary = Muted
    )) {
        if (showSplash) {
            NovaSplashScreen()
        } else {
        Scaffold(
            containerColor = Ink,
            bottomBar = {
                Column {
                    AnimatedVisibility(
                        visible = current != null,
                        enter = slideInVertically(initialOffsetY = { it / 2 }, animationSpec = tween(260)) +
                            fadeIn(animationSpec = tween(220)) + scaleIn(initialScale = 0.97f, animationSpec = tween(260)),
                        exit = slideOutVertically(targetOffsetY = { it / 3 }, animationSpec = tween(180)) +
                            fadeOut(animationSpec = tween(150))
                    ) {
                        current?.let { track ->
                            MiniPlayer(
                                track, playing,
                                onToggle = { if (player.isPlaying) player.pause() else player.play() },
                                onNext = { player.seekToNextMediaItem() },
                                onLyrics = {
                                    showLyrics = true
                                    lyrics = null
                                    scope.launch {
                                        lyrics = withContext(Dispatchers.IO) { fetchLyrics(track.title, track.artist) }
                                            ?: "No lyrics found for this track."
                                    }
                                }
                            )
                        }
                    }
                    NavigationBar(containerColor = Color(0xFFF8FAF5).copy(alpha = 0.94f), contentColor = Green) {
                        listOf(
                            Tab.HOME to (Icons.Default.Home to "Home"),
                            Tab.SEARCH to (Icons.Default.Search to "Search"),
                            Tab.LIBRARY to (Icons.Default.LibraryMusic to "Library"),
                            Tab.FAVORITES to (Icons.Default.Favorite to "Favorites")
                        ).forEach { (dest, pair) ->
                            NavigationBarItem(
                                selected = tab == dest,
                                onClick = { tab = dest },
                                icon = { Icon(pair.first, null) },
                                label = { Text(pair.second) }
                            )
                        }
                    }
                }
            }
        ) { padding ->
            Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp)) {
                Spacer(Modifier.height(20.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier.size(42.dp).glassSurface(RoundedCornerShape(15.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.GraphicEq, null, tint = Green, modifier = Modifier.size(23.dp))
                    }
                    Spacer(Modifier.width(11.dp))
                    Column(Modifier.weight(1f)) {
                        Text("NOVA MUSIC", color = Cream, fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                        Text("A quieter kind of listening", color = Muted, fontSize = 11.sp)
                    }
                    Box(
                        Modifier.glassSurface(RoundedCornerShape(30.dp)).padding(horizontal = 11.dp, vertical = 7.dp)
                    ) {
                        Text(
                            when (tab) {
                                Tab.HOME -> "HOME"
                                Tab.SEARCH -> "SEARCH"
                                Tab.LIBRARY -> "LIBRARY"
                                Tab.FAVORITES -> "SAVED"
                            },
                            color = Green, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp
                        )
                    }
                }
                Spacer(Modifier.height(10.dp))
                DraggableGlassBubble(Modifier.fillMaxWidth().height(54.dp))
                Spacer(Modifier.height(14.dp))
                if (tab == Tab.HOME) {
                    Column(
                        Modifier.fillMaxWidth().glassSurface(RoundedCornerShape(26.dp))
                            .padding(20.dp)
                    ) {
                        Text("YOUR MUSIC,\nYOUR MOMENT.", color = Cream, fontSize = 25.sp,
                            lineHeight = 30.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.3.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("Find something worth listening to.", color = Muted, fontSize = 12.sp)
                        Spacer(Modifier.height(15.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.width(25.dp).height(2.dp).background(Green))
                            Spacer(Modifier.width(8.dp))
                            Text("LISTEN AT YOUR OWN PACE", color = Green, fontSize = 9.sp,
                                fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
                        }
                    }
                    Spacer(Modifier.height(20.dp))
                }

                AnimatedContent(
                    targetState = tab,
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    transitionSpec = {
                        (fadeIn(tween(220)) + scaleIn(initialScale = 0.985f, animationSpec = tween(220))) togetherWith
                            fadeOut(tween(130))
                    },
                    label = "nova-tab-transition"
                ) { activeTab ->
                // AnimatedContent stacks children in a Box, so a Column is required to lay them out
                // vertically; verticalScroll keeps long content reachable on small screens.
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                when (activeTab) {
                    Tab.HOME -> {
                        SearchBox(query, { query = it }, ::searchOnline)
                        Spacer(Modifier.height(18.dp))
                        SectionTitle("Explore music", "ONLINE")
                        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth(), color = Green)
                        error?.let { Text(it, color = Color(0xFFD7A49A), fontSize = 12.sp) }
                        TrackList(onlineResults, favorites, onPlay = { playTrack(it, onlineResults) }, onFavorite = ::toggleFavorite,
                            onDownload = { downloadTrack(context, it) })
                        if (onlineResults.isEmpty() && !loading) {
                            InfoPanel(
                                "Search the archive",
                                "Search recordings and music released for streaming or download. Results depend on the rights and formats supplied by each uploader."
                            )
                        }
                        Spacer(Modifier.height(10.dp))
                        SectionTitle("Your collection", "${localTracks.size} TRACKS")
                        if (!permission) {
                            Button(onClick = { permissionLauncher.launch(permissionName) }) { Text("Allow audio access") }
                        } else {
                            TrackList(localTracks.take(5), favorites, onPlay = { playTrack(it, localTracks) },
                                onFavorite = ::toggleFavorite, onDownload = {})
                        }
                    }
                    Tab.SEARCH -> {
                        SearchBox(query, { query = it }, ::searchOnline)
                        Spacer(Modifier.height(14.dp))
                        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth(), color = Green)
                        error?.let { Text(it, color = Color(0xFFD7A49A), fontSize = 12.sp) }
                        TrackList(onlineResults, favorites, onPlay = { playTrack(it, onlineResults) },
                            onFavorite = ::toggleFavorite, onDownload = { downloadTrack(context, it) })
                        if (onlineResults.isEmpty() && !loading) InfoPanel("Search music", "Online search uses Internet Archive metadata and downloadable audio files.")
                    }
                    Tab.LIBRARY -> {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Device music", fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.weight(1f))
                            TextButton(onClick = {
                                if (hasAudioPermission()) localTracks = loadLocalTracks()
                                else permissionLauncher.launch(permissionName)
                            }) { Text("Refresh", color = Green) }
                        }
                        if (!permission) InfoPanel("Audio permission needed", "Allow access to scan songs stored on this device.")
                        else TrackList(localTracks, favorites, onPlay = { playTrack(it, localTracks) },
                            onFavorite = ::toggleFavorite, onDownload = {})
                    }
                    Tab.FAVORITES -> {
                        Text("${favorites.size} saved tracks", color = Muted, fontSize = 12.sp)
                        TrackList(favorites, favorites, onPlay = { playTrack(it, favorites) },
                            onFavorite = ::toggleFavorite, onDownload = { if (it.downloadUrl != null) downloadTrack(context, it) })
                    }
                }
                }
                }
            }
        }
        }
    }

    if (showLyrics) {
        AlertDialog(
            onDismissRequest = { showLyrics = false },
            containerColor = Color(0xFFF8FAF5),
            title = { Text("Lyrics", color = Green) },
            text = {
                Text(
                    lyrics ?: "Looking for lyrics…",
                    color = Cream,
                    modifier = Modifier.heightIn(max = 420.dp)
                )
            },
            confirmButton = { TextButton(onClick = { showLyrics = false }) { Text("Close", color = Green) } }
        )
    }
}



@Composable
private fun NovaSplashScreen() {
    val motion = rememberInfiniteTransition(label = "nova-splash-motion")
    val haloScale by motion.animateFloat(
        initialValue = 0.94f,
        targetValue = 1.06f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500),
            repeatMode = RepeatMode.Reverse
        ),
        label = "splash-halo"
    )

    Box(
        Modifier.fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFFF4F7F0), Color(0xFFE8EEE4), Color(0xFFDCE6D9))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        // Quiet glass orbs keep the intro from feeling empty without adding visual noise.
        Box(
            Modifier.align(Alignment.TopStart).offset(x = (-72).dp, y = 115.dp)
                .size(210.dp).clip(CircleShape)
                .background(Color.White.copy(alpha = 0.20f))
        )
        Box(
            Modifier.align(Alignment.BottomEnd).offset(x = 86.dp, y = (-70).dp)
                .size(240.dp).clip(CircleShape)
                .background(Color(0xFF9FB39B).copy(alpha = 0.16f))
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth().padding(28.dp)
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.size(224.dp)) {
                Box(
                    Modifier.size(204.dp)
                        .graphicsLayer { scaleX = haloScale; scaleY = haloScale }
                        .border(1.dp, Green.copy(alpha = 0.18f), CircleShape)
                )
                Box(
                    Modifier.size(178.dp)
                        .border(1.dp, Color.White.copy(alpha = 0.78f), RoundedCornerShape(48.dp))
                        .background(Color.White.copy(alpha = 0.18f), RoundedCornerShape(48.dp))
                )
                // Starting from false makes the entrance animation actually play on first composition.
                val logoVisible = remember { MutableTransitionState(false).apply { targetState = true } }
                androidx.compose.animation.AnimatedVisibility(
                    visibleState = logoVisible,
                    enter =fadeIn(tween(650)) + scaleIn(
                        initialScale = 0.78f,
                        animationSpec = spring(stiffness = 170f, dampingRatio = 0.72f)
                    )
                ) {
                    androidx.compose.foundation.Image(
                        painter = painterResource(id = R.drawable.novamusic_logo),
                        contentDescription = "NovaMusic logo",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.size(154.dp).clip(RoundedCornerShape(38.dp))
                    )
                }
            }

            Spacer(Modifier.height(18.dp))
            Text(
                "NovaMusic",
                color = Color(0xFF2D4030),
                fontSize = 31.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = (-0.7).sp
            )
            Spacer(Modifier.height(5.dp))
            Text(
                "YOUR MUSIC SPACE",
                color = Muted,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 2.4.sp
            )
            Spacer(Modifier.height(30.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.height(30.dp)
            ) {
                repeat(5) { index ->
                    val barHeight by motion.animateFloat(
                        initialValue = 0.28f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(430, delayMillis = index * 95),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "splash-eq-$index"
                    )
                    Box(
                        Modifier.width(4.dp)
                            .height(7.dp + 19.dp * barHeight)
                            .clip(CircleShape)
                            .background(Green.copy(alpha = 0.72f))
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            Text("A quieter kind of listening", color = Muted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun DraggableGlassBubble(modifier: Modifier = Modifier) {
    var x by remember { mutableFloatStateOf(0f) }
    var y by remember { mutableFloatStateOf(0f) }
    var dragging by remember { mutableStateOf(false) }
    val bubbleScale by animateFloatAsState(
        targetValue = if (dragging) 1.08f else 1f,
        animationSpec = spring(stiffness = 420f, dampingRatio = 0.68f),
        label = "glass-bubble-scale"
    )
    BoxWithConstraints(modifier = modifier) {
        val density = androidx.compose.ui.platform.LocalDensity.current
        val maxX = with(density) { (maxWidth - 46.dp).toPx() }.coerceAtLeast(0f)
        val maxY = with(density) { (maxHeight - 46.dp).toPx() }.coerceAtLeast(0f)
        Box(
            Modifier
                .offset { IntOffset(x.roundToInt(), y.roundToInt()) }
                .size(46.dp)
                .graphicsLayer { scaleX = bubbleScale; scaleY = bubbleScale }
                .glassSurface(CircleShape, Color.White)
                .pointerInput(maxX, maxY) {
                    detectDragGestures(
                        onDragStart = { dragging = true },
                        onDragEnd = { dragging = false },
                        onDragCancel = { dragging = false }
                    ) { change, dragAmount ->
                        change.consume()
                        x = (x + dragAmount.x).coerceIn(0f, maxX)
                        y = (y + dragAmount.y).coerceIn(0f, maxY)
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.GraphicEq, contentDescription = "Drag glass bubble", tint = Green, modifier = Modifier.size(21.dp))
        }
    }
}

@Composable
private fun SearchBox(value: String, onChange: (String) -> Unit, onSearch: () -> Unit) {
    OutlinedTextField(
        value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth(),
        placeholder = { Text("Search tracks, artists, recordings", color = Muted) },
        leadingIcon = { Icon(Icons.Default.Search, null, tint = Muted) },
        trailingIcon = {
            IconButton(onClick = onSearch) { Icon(Icons.AutoMirrored.Filled.ArrowForward, "Search", tint = Green) }
        },
        singleLine = true, shape = RoundedCornerShape(19.dp),
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
        keyboardActions = KeyboardActions(onSearch = { onSearch() }),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Green.copy(alpha = 0.75f), unfocusedBorderColor = Color(0xFF879889).copy(alpha = 0.22f),
            focusedTextColor = Cream, unfocusedTextColor = Cream, cursorColor = Green,
            focusedContainerColor = Color.White.copy(alpha = 0.82f), unfocusedContainerColor = Color.White.copy(alpha = 0.62f)
        )
    )
}

@Composable
private fun SectionTitle(title: String, detail: String) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
        Text(detail, fontSize = 10.sp, color = Muted, letterSpacing = 0.6.sp)
    }
    Spacer(Modifier.height(9.dp))
}

@Composable
private fun TrackList(
    tracks: List<Track>,
    favorites: List<Track>,
    onPlay: (Track) -> Unit,
    onFavorite: (Track) -> Unit,
    onDownload: (Track) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth().heightIn(max = 430.dp),
        contentPadding = PaddingValues(bottom = 10.dp),
        verticalArrangement = Arrangement.spacedBy(7.dp)
    ) {
        items(tracks, key = { it.id }) { track ->
            val interaction = remember(track.id) { MutableInteractionSource() }
            val pressed by interaction.collectIsPressedAsState()
            val pressScale by animateFloatAsState(
                targetValue = if (pressed) 0.975f else 1f,
                animationSpec = spring(stiffness = 520f, dampingRatio = 0.72f),
                label = "track-press-scale"
            )
            Row(
                Modifier.fillMaxWidth()
                    .animateItem()
                    .graphicsLayer { scaleX = pressScale; scaleY = pressScale }
                    .glassSurface(RoundedCornerShape(18.dp))
                    .clickable(interactionSource = interaction, indication = null) { onPlay(track) }
                    .padding(horizontal = 12.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(Modifier.size(44.dp).glassSurface(RoundedCornerShape(14.dp), Panel2), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.MusicNote, null, tint = Green)
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(track.title, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 13.sp)
                    Text("${track.artist} • ${track.source}", color = Muted, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp)
                }
                IconButton(onClick = { onFavorite(track) }) {
                    Icon(
                        if (favorites.any { it.id == track.id }) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        null, tint = Green
                    )
                }
                if (track.downloadUrl != null) {
                    IconButton(onClick = { onDownload(track) }) { Icon(Icons.Default.Download, "Download", tint = Muted) }
                }
                IconButton(onClick = { onPlay(track) }) { Icon(Icons.Default.PlayArrow, "Play", tint = Green) }
            }
        }
    }
}

@Composable
private fun MiniPlayer(
    track: Track, playing: Boolean, onToggle: () -> Unit, onNext: () -> Unit, onLyrics: () -> Unit
) {
    val albumRotation = androidx.compose.animation.core.rememberInfiniteTransition(label = "album-spin")
        .animateFloat(
            initialValue = 0f,
            targetValue = 360f,
            animationSpec = androidx.compose.animation.core.infiniteRepeatable(
                animation = tween(durationMillis = 9000, easing = androidx.compose.animation.core.LinearEasing)
            ),
            label = "album-rotation"
        )
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 7.dp)
            .glassSurface(RoundedCornerShape(19.dp)).padding(horizontal = 10.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            Icons.Default.Album, null, tint = Green,
            modifier = Modifier.size(30.dp).graphicsLayer { rotationZ = if (playing) albumRotation.value else 0f }
        )
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            Text(track.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text(track.artist, color = Muted, fontSize = 10.sp)
        }
        IconButton(onClick = onLyrics) { Icon(Icons.Default.Lyrics, "Lyrics", tint = Muted) }
        IconButton(onClick = onToggle) { Icon(if (playing) Icons.Default.Pause else Icons.Default.PlayArrow, null, tint = Green) }
        IconButton(onClick = onNext) { Icon(Icons.Default.SkipNext, null, tint = Green) }
    }
}

@Composable
private fun InfoPanel(title: String, detail: String) {
    Column(
        Modifier.fillMaxWidth().padding(vertical = 24.dp).clip(RoundedCornerShape(16.dp))
            .glassSurface(RoundedCornerShape(18.dp)).padding(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(Icons.Default.LibraryMusic, null, tint = Green, modifier = Modifier.size(34.dp))
        Spacer(Modifier.height(10.dp))
        Text(title, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(5.dp))
        Text(detail, color = Muted, fontSize = 12.sp)
    }
}

private fun escapeLucene(value: String): String = buildString {
    val reserved = "+-!(){}[]^\"~*?:\\/"
    value.forEach { ch ->
        if (ch in reserved) append('\\')
        append(ch)
    }
}

private suspend fun searchInternetArchive(term: String): List<Track> = coroutineScope {
    val safeTerm = escapeLucene(term.trim())
    val encoded = URLEncoder.encode("($safeTerm) AND mediatype:audio", "UTF-8")
    val api = "https://archive.org/advancedsearch.php?q=$encoded&fl[]=identifier,title,creator&rows=30&page=1&output=json"
    val response = httpGet(api)
    val docs = JSONObject(response).optJSONObject("response")?.optJSONArray("docs")
        ?: return@coroutineScope emptyList<Track>()
    val items = (0 until docs.length()).mapNotNull { docs.optJSONObject(it) }
    // Metadata is fetched in parallel (max 6 at once) instead of 30 sequential requests.
    val gate = Semaphore(6)
    items.map { doc -> async<Track?> { gate.withPermit { resolveArchiveTrack(doc) } } }
        .awaitAll()
        .filterNotNull()
}

private suspend fun resolveArchiveTrack(doc: JSONObject): Track? {
    val identifier = doc.optString("identifier")
    if (identifier.isBlank()) return null
    return try {
        val metadata = JSONObject(httpGet("https://archive.org/metadata/${identifier}"))
        val files = metadata.optJSONArray("files") ?: return null
        // Prefer MP3/OGG (small, stream-friendly) over FLAC/WAV.
        fun rank(f: JSONObject): Int {
            val name = f.optString("name").lowercase()
            val format = f.optString("format").lowercase()
            return when {
                name.endsWith(".mp3") || format.contains("mp3") -> 0
                name.endsWith(".ogg") || format.contains("ogg") -> 1
                name.endsWith(".flac") || format.contains("flac") -> 2
                name.endsWith(".wav") || format.contains("wave") -> 3
                else -> -1
            }
        }
        var chosen: JSONObject? = null
        var chosenRank = Int.MAX_VALUE
        for (j in 0 until files.length()) {
            val f = files.optJSONObject(j) ?: continue
            val r = rank(f)
            if (r < 0 || f.optBoolean("private", false) || f.optString("name").isBlank()) continue
            if (r < chosenRank) { chosen = f; chosenRank = r }
            if (r == 0) break
        }
        val file = chosen ?: return null
        val fileName = file.optString("name")
        val encodedName = fileName.split("/").joinToString("/") { URLEncoder.encode(it, "UTF-8").replace("+", "%20") }
        val stream = "https://archive.org/download/${identifier}/${encodedName}"
        val creator = when (val c = doc.opt("creator")) {
            is String -> c
            is org.json.JSONArray -> if (c.length() > 0) c.optString(0) else "Unknown artist"
            else -> "Unknown artist"
        }
        val ms = file.optString("length").toDoubleOrNull()?.times(1000)?.toLong() ?: 0L
        Track(
            id = "ia:$identifier:$fileName",
            title = doc.optString("title", identifier),
            artist = creator,
            album = identifier,
            streamUrl = stream,
            durationMs = ms,
            downloadUrl = stream,
            source = "Internet Archive"
        )
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        null // Skip individual archive items with unavailable metadata.
    }
}

private suspend fun fetchLyrics(title: String, artist: String): String? {
    return try {
        val t = URLEncoder.encode(title, "UTF-8")
        val a = URLEncoder.encode(artist, "UTF-8")
        val body = httpGet("https://lrclib.net/api/get?track_name=$t&artist_name=$a")
        val obj = JSONObject(body)
        obj.optString("plainLyrics").takeIf { it.isNotBlank() }
            ?: obj.optString("syncedLyrics").takeIf { it.isNotBlank() }
    } catch (_: Exception) { null }
}

private suspend fun httpGet(address: String): String = withContext(Dispatchers.IO) {
    val connection = (URL(address).openConnection() as HttpURLConnection).apply {
        connectTimeout = 12000
        readTimeout = 18000
        requestMethod = "GET"
        setRequestProperty("User-Agent", "NovaMusic/1.1 (Android)")
    }
    try {
        if (connection.responseCode !in 200..299) error("Server returned ${connection.responseCode}")
        connection.inputStream.bufferedReader().use { it.readText() }
    } finally { connection.disconnect() }
}

private fun downloadTrack(context: Context, track: Track) {
    val url = track.downloadUrl ?: return
    try {
        val sourceName = Uri.parse(url).lastPathSegment.orEmpty()
        val extension = sourceName.substringAfterLast('.', "mp3").lowercase()
            .takeIf { it in setOf("mp3", "ogg", "flac", "wav") } ?: "mp3"
        val mimeType = when (extension) {
            "ogg" -> "audio/ogg"
            "flac" -> "audio/flac"
            "wav" -> "audio/wav"
            else -> "audio/mpeg"
        }
        val request = DownloadManager.Request(Uri.parse(url))
            .setTitle(track.title)
            .setDescription("Downloading from Internet Archive")
            .setMimeType(mimeType)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_MUSIC, "NovaMusic/${safeFileName(track.title)}.$extension")
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(false)
        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        manager.enqueue(request)
        Toast.makeText(context, "Download started", Toast.LENGTH_SHORT).show()
    } catch (_: Exception) {
        Toast.makeText(context, "Could not start download", Toast.LENGTH_SHORT).show()
    }
}

private fun safeFileName(value: String): String =
    value.replace(Regex("[^a-zA-Z0-9._ -]"), "_").take(80).ifBlank { "track" }

private fun loadFavorites(context: Context): List<Track> {
    val raw = context.getSharedPreferences("novamusic", Context.MODE_PRIVATE).getString("favorites", "[]") ?: "[]"
    val array = try { org.json.JSONArray(raw) } catch (_: Exception) { org.json.JSONArray() }
    val result = mutableListOf<Track>()
    for (i in 0 until array.length()) {
        val o = array.optJSONObject(i) ?: continue
        result += Track(
            id = o.optString("id"), title = o.optString("title"),
            artist = o.optString("artist"), album = o.optString("album"),
            streamUrl = o.optString("streamUrl"), durationMs = o.optLong("durationMs"),
            localUri = o.optString("localUri").takeIf { it.isNotBlank() }?.let(Uri::parse),
            downloadUrl = o.optString("downloadUrl").takeIf { it.isNotBlank() },
            source = o.optString("source", "Saved")
        )
    }
    return result
}

private fun saveFavorites(context: Context, tracks: List<Track>) {
    val array = org.json.JSONArray()
    tracks.forEach { t ->
        array.put(JSONObject().apply {
            put("id", t.id); put("title", t.title); put("artist", t.artist)
            put("album", t.album); put("streamUrl", t.streamUrl)
            put("durationMs", t.durationMs); put("localUri", t.localUri?.toString() ?: "")
            put("downloadUrl", t.downloadUrl ?: ""); put("source", t.source)
        })
    }
    context.getSharedPreferences("novamusic", Context.MODE_PRIVATE)
        .edit().putString("favorites", array.toString()).apply()
}
