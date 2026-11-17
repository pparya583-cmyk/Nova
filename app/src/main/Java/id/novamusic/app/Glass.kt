package id.novamusic.app

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.MusicNote
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

val Accent = Color(0xFF7CF5C8)
val TextLow = Color.White.copy(alpha = 0.62f)
val DeepBg = Color(0xFF080B1C)
val DialogBg = Color(0xFF1B1737)

private val DefaultBlobs = listOf(Color(0xFF6C5CE7), Color(0xFF00C2A8), Color(0xFFFF6FB1))

private val GlassEdge = Brush.linearGradient(
    listOf(
        Color.White.copy(alpha = 0.60f),
        Color.White.copy(alpha = 0.06f),
        Color.White.copy(alpha = 0.22f),
        Color.White.copy(alpha = 0.04f)
    )
)

/**
 * Efek "liquid glass": permukaan semi-transparan dengan sheen atas dan tepi yang memantulkan cahaya.
 * (Ini glass tanpa blur backdrop asli, karena Compose bawaan belum punya blur belakang.)
 */
fun Modifier.glass(
    shape: Shape = RoundedCornerShape(24.dp),
    alpha: Float = 0.10f,
    tint: Color = Color.White
): Modifier = this
    .clip(shape)
    .background(
        Brush.verticalGradient(
            listOf(tint.copy(alpha = alpha + 0.07f), tint.copy(alpha = alpha * 0.4f))
        )
    )
    .border(1.dp, GlassEdge, shape)

/** Latar "aurora": gumpalan warna besar yang bergerak pelan, supaya kaca punya sesuatu untuk dibiaskan. */
@Composable
fun AuroraBackground(modifier: Modifier = Modifier, blobs: List<Color> = DefaultBlobs) {
    val transition = rememberInfiniteTransition(label = "aurora")
    val p by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(16_000, easing = LinearEasing), RepeatMode.Reverse),
        label = "aurora-progress"
    )
    Canvas(modifier.fillMaxSize()) {
        drawRect(DeepBg)
        val w = size.width
        val h = size.height
        val r = maxOf(w, h) * 0.75f

        fun blob(color: Color, center: Offset, radius: Float) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(color.copy(alpha = 0.55f), Color.Transparent),
                    center = center,
                    radius = radius
                ),
                radius = radius,
                center = center
            )
        }
        blob(blobs[0 % blobs.size], Offset(w * (0.10f + 0.40f * p), h * (0.10f + 0.10f * p)), r)
        blob(blobs[1 % blobs.size], Offset(w * (0.95f - 0.35f * p), h * (0.45f + 0.15f * p)), r * 0.9f)
        blob(blobs[2 % blobs.size], Offset(w * (0.15f + 0.45f * p), h * (0.98f - 0.20f * p)), r * 0.8f)
    }
}

@Composable
fun GlassIconButton(
    icon: ImageVector,
    description: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 46.dp,
    iconSize: Dp = 22.dp,
    tint: Color = Color.White,
    strong: Boolean = false
) {
    Box(
        modifier
            .size(size)
            .glass(CircleShape, alpha = if (strong) 0.24f else 0.10f)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, description, tint = tint, modifier = Modifier.size(iconSize))
    }
}

@Composable
fun GlassChip(text: String, selected: Boolean = false, onClick: () -> Unit) {
    Box(
        Modifier
            .glass(RoundedCornerShape(50), alpha = if (selected) 0.26f else 0.08f)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 9.dp)
    ) {
        Text(
            text,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (selected) Accent else Color.White
        )
    }
}

@Composable
fun SectionTitle(title: String, modifier: Modifier = Modifier) {
    Text(
        title,
        modifier = modifier.padding(top = 24.dp, bottom = 10.dp),
        fontSize = 19.sp,
        fontWeight = FontWeight.Bold
    )
}

/** Warna turunan dari id lagu, dipakai sebagai cover cadangan dan warna latar Now Playing. */
fun artColors(id: String): Pair<Color, Color> {
    val hue = ((id.hashCode().toLong() and 0x7fffffffL) % 360).toFloat()
    return Color.hsv(hue, 0.60f, 0.85f) to Color.hsv((hue + 50f) % 360f, 0.70f, 0.50f)
}

@Composable
fun Artwork(track: Track, modifier: Modifier = Modifier, corner: Dp = 14.dp) {
    val (c1, c2) = remember(track.id) { artColors(track.id) }
    Box(
        modifier
            .clip(RoundedCornerShape(corner))
            .background(Brush.linearGradient(listOf(c1, c2))),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            Icons.Rounded.MusicNote, null,
            tint = Color.White.copy(alpha = 0.85f),
            modifier = Modifier.fillMaxSize(0.45f)
        )
        if (!track.artUrl.isNullOrBlank()) {
            AsyncImage(
                model = track.artUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}
