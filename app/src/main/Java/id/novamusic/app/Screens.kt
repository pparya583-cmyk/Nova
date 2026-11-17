package id.novamusic.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.FavoriteBorder
import androidx.compose.material.icons.rounded.GraphicEq
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.LibraryMusic
import androidx.compose.material.icons.rounded.MoreVert
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Shuffle
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

val Genres = listOf("Jazz", "Classical", "Lo-fi", "Rock", "Electronic", "Ambient", "Folk", "Blues", "Hip hop", "Indie")

private val ListPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 210.dp)

/** Semua aksi yang bisa dipicu dari daftar lagu. */
@Stable
class Actions(
    val play: (Track, List<Track>) -> Unit,
    val playAll: (List<Track>, Boolean) -> Unit,
    val playNext: (Track) -> Unit,
    val enqueue: (Track) -> Unit,
    val toggleFav: (Track) -> Unit,
    val addToPlaylist: (Track) -> Unit,
    val download: (Track) -> Unit
)

// ------------------------------------------------------------ building blocks

@Composable
fun ScreenTitle(overline: String, title: String, modifier: Modifier = Modifier) {
    Row(
        modifier.fillMaxWidth().padding(top = 18.dp, bottom = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(overline, color = Accent, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
            Text(title, fontSize = 30.sp, lineHeight = 34.sp, fontWeight = FontWeight.ExtraBold)
        }
        Box(Modifier.size(44.dp).glass(CircleShape, 0.10f), contentAlignment = Alignment.Center) {
            Icon(Icons.Rounded.GraphicEq, null, tint = Accent)
        }
    }
}

@Composable
fun GlassButton(text: String, icon: ImageVector? = null, filled: Boolean = false, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Row(
        Modifier
            .then(if (filled) Modifier.background(Accent, shape) else Modifier.glass(shape, 0.12f))
            .clickable(onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 11.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val c = if (filled) Color(0xFF00382A) else Color.White
        if (icon != null) {
            Icon(icon, null, tint = c, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(7.dp))
        }
        Text(text, color = c, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun InfoPanel(icon: ImageVector, title: String, detail: String, action: @Composable (() -> Unit)? = null) {
    Column(
        Modifier.fillMaxWidth().padding(vertical = 10.dp).glass(RoundedCornerShape(24.dp), 0.08f).padding(22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, null, tint = Accent, modifier = Modifier.size(34.dp))
        Spacer(Modifier.height(10.dp))
        Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Spacer(Modifier.height(5.dp))
        Text(detail, color = TextLow, fontSize = 13.sp)
        if (action != null) {
            Spacer(Modifier.height(14.dp))
            action()
        }
    }
}

@Composable
fun GlassSearchField(value: String, onChange: (String) -> Unit, onSearch: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().glass(RoundedCornerShape(22.dp), 0.10f),
        verticalAlignment = Alignment.CenterVertically
    ) {
        TextField(
            value = value,
            onValueChange = onChange,
            modifier = Modifier.weight(1f),
            placeholder = { Text("Songs, artists, recordings", color = TextLow) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { onSearch() }),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Accent
            )
        )
        if (value.isNotEmpty()) {
            IconButton(onClick = { onChange("") }) { Icon(Icons.Rounded.Close, "Clear", tint = TextLow) }
        }
        IconButton(onClick = onSearch) { Icon(Icons.Rounded.Search, "Search", tint = Accent) }
    }
}

@Composable
fun GenreChips(onGenre: (String) -> Unit) {
    Row(
        Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Genres.forEach { g -> GlassChip(g) { onGenre(g) } }
    }
}

@Composable
fun ArtCard(track: Track, onClick: () -> Unit) {
    Column(Modifier.width(150.dp).clickable(onClick = onClick)) {
        Artwork(track, Modifier.size(150.dp).glass(RoundedCornerShape(20.dp), 0.05f), corner = 20.dp)
        Spacer(Modifier.height(8.dp))
        Text(track.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Text(track.artist, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp, color = TextLow)
    }
}

@Composable
fun TrackCarousel(tracks: List<Track>, act: Actions) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        items(tracks, key = { it.id }) { t -> ArtCard(t) { act.play(t, tracks) } }
    }
}

@Composable
fun TrackRow(
    track: Track,
    isCurrent: Boolean,
    isPlaying: Boolean,
    liked: Boolean,
    act: Actions,
    onClick: () -> Unit,
    onRemoveFromPlaylist: (() -> Unit)? = null
) {
    var menu by remember { mutableStateOf(false) }
    Row(
        Modifier
            .fillMaxWidth()
            .glass(RoundedCornerShape(20.dp), alpha = if (isCurrent) 0.20f else 0.07f)
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Artwork(track, Modifier.size(50.dp), corner = 13.dp)
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text(
                track.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold, color = if (isCurrent) Accent else Color.White
            )
            Text(
                listOf(track.artist, track.source).filter { it.isNotBlank() }.joinToString(" · "),
                maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 12.sp, color = TextLow
            )
        }
        if (isCurrent && isPlaying) {
            Icon(Icons.Rounded.GraphicEq, null, tint = Accent, modifier = Modifier.size(20.dp))
        }
        IconButton(onClick = { act.toggleFav(track) }) {
            Icon(
                if (liked) Icons.Rounded.Favorite else Icons.Rounded.FavoriteBorder,
                if (liked) "Unlike" else "Like",
                tint = if (liked) Accent else TextLow
            )
        }
        Box {
            IconButton(onClick = { menu = true }) { Icon(Icons.Rounded.MoreVert, "More", tint = TextLow) }
            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }, containerColor = DialogBg) {
                DropdownMenuItem(text = { Text("Play next") }, onClick = { menu = false; act.playNext(track) })
                DropdownMenuItem(text = { Text("Add to queue") }, onClick = { menu = false; act.enqueue(track) })
                DropdownMenuItem(text = { Text("Add to playlist") }, onClick = { menu = false; act.addToPlaylist(track) })
                if (track.downloadUrl != null) {
                    DropdownMenuItem(text = { Text("Download") }, onClick = { menu = false; act.download(track) })
                }
                if (onRemoveFromPlaylist != null) {
                    DropdownMenuItem(
                        text = { Text("Remove from playlist") },
                        onClick = { menu = false; onRemoveFromPlaylist() }
                    )
                }
            }
        }
    }
}

/** Menambahkan daftar TrackRow ke LazyColumn. */
fun LazyListScope.trackRows(
    tracks: List<Track>,
    ui: PlayerUi,
    favIds: Set<String>,
    act: Actions,
    onRemove: ((Track) -> Unit)? = null
) {
    items(tracks, key = { it.id }) { t ->
        Box(Modifier.padding(bottom = 8.dp)) {
            TrackRow(
                track = t,
                isCurrent = ui.current?.id == t.id,
                isPlaying = ui.isPlaying,
                liked = t.id in favIds,
                act = act,
                onClick = { act.play(t, tracks) },
                onRemoveFromPlaylist = onRemove?.let { r -> { r(t) } }
            )
        }
    }
}

// ----------------------------------------------------------------- screens

@Composable
fun HomeScreen(
    greeting: String,
    ui: PlayerUi,
    recents: List<Track>,
    favorites: List<Track>,
    featured: List<Track>,
    featuredLoading: Boolean,
    local: List<Track>,
    permission: Boolean,
    onAllow: () -> Unit,
    favIds: Set<String>,
    act: Actions,
    onGenre: (String) -> Unit,
    onOpenSearch: () -> Unit
) {
    LazyColumn(Modifier.fillMaxSize(), contentPadding = ListPadding) {
        item { ScreenTitle("NOVAMUSIC", greeting) }
        item {
            Row(
                Modifier.fillMaxWidth().glass(RoundedCornerShape(22.dp), 0.10f)
                    .clickable(onClick = onOpenSearch).padding(horizontal = 16.dp, vertical = 15.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Rounded.Search, null, tint = TextLow)
                Spacer(Modifier.width(12.dp))
                Text("Search songs, artists, recordings", color = TextLow, fontSize = 15.sp)
            }
        }
        item { Spacer(Modifier.height(14.dp)); GenreChips(onGenre) }

        if (recents.isNotEmpty()) {
            item { SectionTitle("Recently played") }
            item { TrackCarousel(recents.take(12), act) }
        }
        if (favorites.isNotEmpty()) {
            item { SectionTitle("Your liked songs") }
            item { TrackCarousel(favorites.take(12), act) }
        }

        item { SectionTitle("Trending on Internet Archive") }
        if (featuredLoading && featured.isEmpty()) {
            item { LinearProgressIndicator(Modifier.fillMaxWidth(), color = Accent, trackColor = Color.White.copy(alpha = 0.1f)) }
        } else if (featured.isEmpty()) {
            item {
                InfoPanel(Icons.Rounded.LibraryMusic, "Nothing to show yet", "Check your connection, or pick a genre above to search.")
            }
        } else {
            item { TrackCarousel(featured, act) }
        }

        item { SectionTitle("On your device") }
        if (!permission) {
            item {
                InfoPanel(
                    Icons.Rounded.LibraryMusic, "Audio permission needed",
                    "Allow access to play songs stored on this phone."
                ) { GlassButton("Allow audio access", filled = true, onClick = onAllow) }
            }
        } else if (local.isEmpty()) {
            item { InfoPanel(Icons.Rounded.LibraryMusic, "No songs found", "Music files on this phone will show up here.") }
        } else {
            trackRows(local.take(6), ui, favIds, act)
        }
    }
}

@Composable
fun SearchScreen(
    query: String,
    onQuery: (String) -> Unit,
    onSearch: () -> Unit,
    onGenre: (String) -> Unit,
    results: List<Track>,
    searching: Boolean,
    error: String?,
    ui: PlayerUi,
    favIds: Set<String>,
    act: Actions
) {
    LazyColumn(Modifier.fillMaxSize(), contentPadding = ListPadding) {
        item { ScreenTitle("SEARCH", "Find your next track.") }
        item { GlassSearchField(query, onQuery, onSearch) }
        item { Spacer(Modifier.height(12.dp)); GenreChips(onGenre); Spacer(Modifier.height(14.dp)) }
        if (searching) {
            item { LinearProgressIndicator(Modifier.fillMaxWidth(), color = Accent, trackColor = Color.White.copy(alpha = 0.1f)) }
        }
        if (error != null) {
            item { Text(error, color = Color(0xFFFFB4AB), fontSize = 13.sp, modifier = Modifier.padding(vertical = 8.dp)) }
        }
        if (results.isNotEmpty()) {
            item {
                Row(Modifier.fillMaxWidth().padding(bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("${results.size} results", color = TextLow, fontSize = 12.sp, modifier = Modifier.weight(1f))
                    GlassButton("Shuffle", Icons.Rounded.Shuffle) { act.playAll(results, true) }
                }
            }
            trackRows(results, ui, favIds, act)
        } else if (!searching && error == null) {
            item {
                InfoPanel(
                    Icons.Rounded.Search, "Search the archive",
                    "Results come from Internet Archive. Availability and rights vary by uploader."
                )
            }
        }
    }
}

@Composable
fun LibraryScreen(
    libTab: LibTab,
    onLibTab: (LibTab) -> Unit,
    ui: PlayerUi,
    local: List<Track>,
    permission: Boolean,
    onAllow: () -> Unit,
    onRefresh: () -> Unit,
    liked: List<Track>,
    playlists: List<Playlist>,
    openPlaylist: Playlist?,
    onOpenPlaylist: (String?) -> Unit,
    onNewPlaylist: () -> Unit,
    onDeletePlaylist: (String) -> Unit,
    onRemoveFromPlaylist: (String, String) -> Unit,
    favIds: Set<String>,
    act: Actions
) {
    LazyColumn(Modifier.fillMaxSize(), contentPadding = ListPadding) {
        if (openPlaylist != null) {
            item {
                Row(Modifier.fillMaxWidth().padding(top = 18.dp, bottom = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                    GlassIconButton(Icons.AutoMirrored.Rounded.ArrowBack, "Back", { onOpenPlaylist(null) })
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text("PLAYLIST", color = Accent, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
                        Text(openPlaylist.name, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    GlassIconButton(Icons.Rounded.Delete, "Delete playlist", { onDeletePlaylist(openPlaylist.id) })
                }
            }
            item {
                Row(Modifier.padding(bottom = 14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GlassButton("Play", Icons.Rounded.PlayArrow, filled = true) { act.playAll(openPlaylist.tracks, false) }
                    GlassButton("Shuffle", Icons.Rounded.Shuffle) { act.playAll(openPlaylist.tracks, true) }
                }
            }
            if (openPlaylist.tracks.isEmpty()) {
                item {
                    InfoPanel(
                        Icons.Rounded.LibraryMusic, "Empty playlist",
                        "Use the ⋮ menu on any song and pick \"Add to playlist\"."
                    )
                }
            } else {
                trackRows(openPlaylist.tracks, ui, favIds, act) { t -> onRemoveFromPlaylist(openPlaylist.id, t.id) }
            }
            return@LazyColumn
        }

        item { ScreenTitle("LIBRARY", "Your music.") }
        item {
            Row(Modifier.fillMaxWidth().padding(bottom = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                LibTab.values().forEach { t -> GlassChip(t.label, selected = t == libTab) { onLibTab(t) } }
            }
        }

        when (libTab) {
            LibTab.SONGS -> {
                if (!permission) {
                    item {
                        InfoPanel(
                            Icons.Rounded.LibraryMusic, "Audio permission needed",
                            "Allow access to scan songs stored on this device."
                        ) { GlassButton("Allow audio access", filled = true, onClick = onAllow) }
                    }
                } else {
                    item {
                        Row(
                            Modifier.fillMaxWidth().padding(bottom = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text("${local.size} songs", color = TextLow, fontSize = 12.sp, modifier = Modifier.weight(1f))
                            GlassButton("Refresh", onClick = onRefresh)
                            if (local.isNotEmpty()) GlassButton("Shuffle", Icons.Rounded.Shuffle) { act.playAll(local, true) }
                        }
                    }
                    if (local.isEmpty()) {
                        item { InfoPanel(Icons.Rounded.LibraryMusic, "No songs found", "Music files on this phone will show up here.") }
                    } else {
                        trackRows(local, ui, favIds, act)
                    }
                }
            }
            LibTab.LIKED -> {
                if (liked.isEmpty()) {
                    item { InfoPanel(Icons.Rounded.Favorite, "No liked songs yet", "Tap the heart on any song to save it here.") }
                } else {
                    item {
                        Row(Modifier.padding(bottom = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            GlassButton("Play", Icons.Rounded.PlayArrow, filled = true) { act.playAll(liked, false) }
                            GlassButton("Shuffle", Icons.Rounded.Shuffle) { act.playAll(liked, true) }
                        }
                    }
                    trackRows(liked, ui, favIds, act)
                }
            }
            LibTab.PLAYLISTS -> {
                item {
                    Box(Modifier.padding(bottom = 14.dp)) { GlassButton("New playlist", Icons.Rounded.Add, filled = true, onClick = onNewPlaylist) }
                }
                if (playlists.isEmpty()) {
                    item { InfoPanel(Icons.Rounded.LibraryMusic, "No playlists yet", "Create one and start adding songs.") }
                } else {
                    items(playlists, key = { it.id }) { pl ->
                        val cover = pl.tracks.firstOrNull()
                            ?: Track(id = pl.id, title = pl.name, artist = "", album = "", streamUrl = "")
                        Row(
                            Modifier.padding(bottom = 8.dp).fillMaxWidth().glass(RoundedCornerShape(20.dp), 0.07f)
                                .clickable { onOpenPlaylist(pl.id) }.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Artwork(cover, Modifier.size(54.dp), corner = 14.dp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(pl.name, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("${pl.tracks.size} songs", color = TextLow, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
