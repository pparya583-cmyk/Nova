package id.novamusic.app

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.FavoriteBorder
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.LibraryMusic
import androidx.compose.material.icons.rounded.Lyrics
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Repeat
import androidx.compose.material.icons.rounded.RepeatOne
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Shuffle
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material.icons.rounded.SkipPrevious
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.Player
import kotlinx.coroutines.CancellationException

// ------------------------------------------------------------ bottom bar

@Composable
fun MiniPlayer(ui: PlayerUi, track: Track, onToggle: () -> Unit, onNext: () -> Unit, onOpen: () -> Unit) {
    Column(
        Modifier.fillMaxWidth().glass(RoundedCornerShape(28.dp), 0.14f).clickable(onClick = onOpen)
    ) {
        Row(
            Modifier.padding(start = 8.dp, end = 4.dp, top = 8.dp, bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Artwork(track, Modifier.size(44.dp), corner = 12.dp)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(track.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                Text(track.artist, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 12.sp, color = TextLow)
            }
            IconButton(onClick = onToggle) {
                Icon(if (ui.isPlaying) Icons.Rounded.Pause else Icons.Rounded.PlayArrow, "Play/Pause", tint = Accent, modifier = Modifier.size(30.dp))
            }
            IconButton(onClick = onNext) { Icon(Icons.Rounded.SkipNext, "Next", modifier = Modifier.size(28.dp)) }
        }
        val progress = if (ui.durationMs > 0) (ui.positionMs.toFloat() / ui.durationMs).coerceIn(0f, 1f) else 0f
        Box(Modifier.padding(horizontal = 18.dp).padding(bottom = 8.dp).fillMaxWidth().height(3.dp).background(Color.White.copy(alpha = 0.15f), CircleShape)) {
            Box(Modifier.fillMaxWidth(progress).height(3.dp).background(Accent, CircleShape))
        }
    }
}

@Composable
fun GlassNav(tab: NavTab, onTab: (NavTab) -> Unit) {
    val navItems = listOf(
        Triple(NavTab.HOME, Icons.Rounded.Home, "Home"),
        Triple(NavTab.SEARCH, Icons.Rounded.Search, "Search"),
        Triple(NavTab.LIBRARY, Icons.Rounded.LibraryMusic, "Library")
    )
    Row(
        Modifier.fillMaxWidth().glass(RoundedCornerShape(32.dp), 0.12f).padding(6.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        navItems.forEach { (t, icon, label) ->
            val selected = tab == t
            Column(
                Modifier
                    .weight(1f)
                    .glass(RoundedCornerShape(26.dp), alpha = if (selected) 0.20f else 0.0f, tint = Color.White)
                    .clickable { onTab(t) }
                    .padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(icon, label, tint = if (selected) Accent else TextLow, modifier = Modifier.size(24.dp))
                Text(label, fontSize = 11.sp, color = if (selected) Accent else TextLow, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ----------------------------------------------------------- now playing

enum class NpPage { ART, LYRICS, QUEUE }

@Composable
fun NowPlayingScreen(
    ui: PlayerUi,
    player: Player,
    track: Track,
    liked: Boolean,
    act: Actions,
    onClose: () -> Unit
) {
    var page by rememberSaveable { mutableStateOf(NpPage.ART) }
    var lyrics by remember(track.id) { mutableStateOf<Lyrics?>(null) }
    var lyricsLoading by remember(track.id) { mutableStateOf(false) }
    var lyricsTried by remember(track.id) { mutableStateOf(false) }

    LaunchedEffect(track.id, page) {
        if (page == NpPage.LYRICS && !lyricsTried) {
            lyricsLoading = true
            try {
                lyrics = fetchLyrics(track.title, track.artist)
                lyricsTried = true
            } catch (e: CancellationException) {
                throw e
            } finally {
                lyricsLoading = false
            }
        }
    }

    val (c1, c2) = remember(track.id) { artColors(track.id) }

    Box(
        Modifier
            .fillMaxSize()
            // Layar ini menutupi semuanya, jadi sentuhan tidak boleh tembus ke layar di bawahnya.
            .pointerInput(Unit) { detectTapGestures { } }
    ) {
        AuroraBackground(blobs = listOf(c1, c2, Color(0xFF6C5CE7)))
        Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.25f)))

        Column(
            Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp, vertical = 10.dp)
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                GlassIconButton(Icons.Rounded.KeyboardArrowDown, "Close", onClose, size = 42.dp)
                Text(
                    "NOW PLAYING", modifier = Modifier.weight(1f), textAlign = TextAlign.Center,
                    fontSize = 11.sp, letterSpacing = 3.sp, fontWeight = FontWeight.Bold, color = TextLow
                )
                Spacer(Modifier.width(42.dp))
            }
            Spacer(Modifier.height(14.dp))

            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                when (page) {
                    NpPage.ART -> {
                        val scale by animateFloatAsState(if (ui.isPlaying) 1f else 0.88f, label = "art-scale")
                        Artwork(
                            track,
                            Modifier.fillMaxWidth().aspectRatio(1f).scale(scale).glass(RoundedCornerShape(32.dp), 0.05f),
                            corner = 32.dp
                        )
                    }
                    NpPage.LYRICS -> LyricsView(ui, lyrics, lyricsLoading) { player.seekTo(it) }
                    NpPage.QUEUE -> QueueView(ui) { index ->
                        player.seekTo(index, 0L)
                        player.play()
                    }
                }
            }

            Spacer(Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(track.title, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(track.artist, fontSize = 15.sp, color = TextLow, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                GlassIconButton(
                    if (liked) Icons.Rounded.Favorite else Icons.Rounded.FavoriteBorder,
                    if (liked) "Unlike" else "Like",
                    { act.toggleFav(track) },
                    tint = if (liked) Accent else Color.White
                )
            }

            Spacer(Modifier.height(6.dp))
            SeekBar(ui, player)

            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                GlassIconButton(
                    Icons.Rounded.Shuffle, "Shuffle", { player.shuffleModeEnabled = !ui.shuffle },
                    tint = if (ui.shuffle) Accent else Color.White
                )
                GlassIconButton(Icons.Rounded.SkipPrevious, "Previous", { player.seekToPrevious() }, size = 56.dp, iconSize = 28.dp)
                GlassIconButton(
                    if (ui.isPlaying) Icons.Rounded.Pause else Icons.Rounded.PlayArrow, "Play/Pause",
                    { if (ui.isPlaying) player.pause() else player.play() },
                    size = 78.dp, iconSize = 40.dp, strong = true
                )
                GlassIconButton(Icons.Rounded.SkipNext, "Next", { player.seekToNext() }, size = 56.dp, iconSize = 28.dp)
                GlassIconButton(
                    if (ui.repeatMode == Player.REPEAT_MODE_ONE) Icons.Rounded.RepeatOne else Icons.Rounded.Repeat,
                    "Repeat",
                    {
                        player.repeatMode = when (ui.repeatMode) {
                            Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL
                            Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE
                            else -> Player.REPEAT_MODE_OFF
                        }
                    },
                    tint = if (ui.repeatMode != Player.REPEAT_MODE_OFF) Accent else Color.White
                )
            }

            Spacer(Modifier.height(18.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                GlassIconButton(
                    Icons.Rounded.Lyrics, "Lyrics",
                    { page = if (page == NpPage.LYRICS) NpPage.ART else NpPage.LYRICS },
                    tint = if (page == NpPage.LYRICS) Accent else Color.White
                )
                GlassIconButton(
                    Icons.Rounded.LibraryMusic, "Queue",
                    { page = if (page == NpPage.QUEUE) NpPage.ART else NpPage.QUEUE },
                    tint = if (page == NpPage.QUEUE) Accent else Color.White
                )
                GlassIconButton(Icons.Rounded.Add, "Add to playlist", { act.addToPlaylist(track) })
                if (track.downloadUrl != null) {
                    GlassIconButton(Icons.Rounded.Download, "Download", { act.download(track) })
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun SeekBar(ui: PlayerUi, player: Player) {
    var drag by remember { mutableStateOf<Float?>(null) }
    val duration = ui.durationMs.coerceAtLeast(1L)
    val fraction = drag ?: (ui.positionMs.toFloat() / duration).coerceIn(0f, 1f)
    val shownMs = if (drag != null) (fraction * duration).toLong() else ui.positionMs

    Column(Modifier.fillMaxWidth()) {
        Slider(
            value = fraction,
            onValueChange = { drag = it },
            onValueChangeFinished = {
                drag?.let { player.seekTo((it * duration).toLong()) }
                drag = null
            },
            colors = SliderDefaults.colors(
                thumbColor = Color.White,
                activeTrackColor = Accent,
                inactiveTrackColor = Color.White.copy(alpha = 0.2f)
            )
        )
        Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp)) {
            Text(formatTime(shownMs), fontSize = 12.sp, color = TextLow)
            Spacer(Modifier.weight(1f))
            Text(formatTime(ui.durationMs), fontSize = 12.sp, color = TextLow)
        }
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun LyricsView(ui: PlayerUi, lyrics: Lyrics?, loading: Boolean, onSeek: (Long) -> Unit) {
    Box(
        Modifier.fillMaxSize().glass(RoundedCornerShape(28.dp), 0.08f).padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        when {
            loading -> Text("Looking for lyrics…", color = TextLow)
            lyrics == null -> Text("No lyrics found for this song.", color = TextLow, textAlign = TextAlign.Center)
            lyrics.synced.isNotEmpty() -> {
                val lines = lyrics.synced
                val active = lines.indexOfLast { it.timeMs <= ui.positionMs }.coerceAtLeast(0)
                val state = rememberLazyListState()
                LaunchedEffect(active) { state.animateScrollToItem((active - 2).coerceAtLeast(0)) }
                LazyColumn(Modifier.fillMaxSize(), state = state, verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    itemsIndexed(lines) { i, line ->
                        Text(
                            line.text.ifBlank { "♪" },
                            fontSize = if (i == active) 24.sp else 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (i == active) Color.White else Color.White.copy(alpha = 0.38f),
                            modifier = Modifier.fillMaxWidth().clickable { onSeek(line.timeMs) }
                        )
                    }
                }
            }
            else -> Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                Text(lyrics.plain.orEmpty(), fontSize = 18.sp, lineHeight = 28.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun QueueView(ui: PlayerUi, onPick: (Int) -> Unit) {
    Box(Modifier.fillMaxSize().glass(RoundedCornerShape(28.dp), 0.08f).padding(8.dp)) {
        if (ui.queue.isEmpty()) {
            Text("Queue is empty", color = TextLow, modifier = Modifier.align(Alignment.Center))
        } else {
            val state = rememberLazyListState()
            LaunchedEffect(ui.currentIndex) {
                if (ui.currentIndex >= 0) state.scrollToItem(ui.currentIndex.coerceAtMost(ui.queue.lastIndex))
            }
            LazyColumn(Modifier.fillMaxSize(), state = state) {
                itemsIndexed(ui.queue) { i, t ->
                    val current = i == ui.currentIndex
                    Row(
                        Modifier.fillMaxWidth().clickable { onPick(i) }.padding(horizontal = 8.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Artwork(t, Modifier.size(42.dp), corner = 10.dp)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                t.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold, color = if (current) Accent else Color.White
                            )
                            Text(t.artist, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 12.sp, color = TextLow)
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------- dialogs

/** track != null -> pilih playlist tujuan (atau buat baru). track == null -> hanya buat playlist baru. */
@Composable
fun PlaylistDialog(
    track: Track?,
    playlists: List<Playlist>,
    onPick: (Playlist) -> Unit,
    onCreate: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DialogBg,
        titleContentColor = Color.White,
        textContentColor = Color.White,
        title = { Text(if (track != null) "Add to playlist" else "New playlist") },
        text = {
            Column(Modifier.heightIn(max = 360.dp).verticalScroll(rememberScrollState())) {
                TextField(
                    value = name,
                    onValueChange = { name = it },
                    singleLine = true,
                    placeholder = { Text("Playlist name", color = TextLow) },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.White.copy(alpha = 0.08f),
                        unfocusedContainerColor = Color.White.copy(alpha = 0.08f),
                        focusedIndicatorColor = Accent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = Accent
                    )
                )
                TextButton(onClick = { onCreate(name) }, enabled = name.isNotBlank()) {
                    Text(if (track != null) "Create & add" else "Create", color = Accent)
                }
                if (track != null) {
                    playlists.forEach { pl ->
                        TextButton(onClick = { onPick(pl) }, modifier = Modifier.fillMaxWidth()) {
                            Text("${pl.name}  ·  ${pl.tracks.size}", color = Color.White, modifier = Modifier.fillMaxWidth())
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Cancel", color = TextLow) } }
    )
}
