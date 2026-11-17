# NovaMusic 1.1.0

An independent Android music player with a Daylight Glass interface, local audio playback, and online discovery from Internet Archive.

## Features
- Local audio library through Android MediaStore
- Online audio search through Internet Archive Advanced Search and metadata endpoints
- Streaming of audio files exposed by Internet Archive
- Favorites stored locally on the device
- Lyrics lookup through LRCLIB when a matching entry exists
- Downloads that preserve supported source extensions (MP3, OGG, FLAC, WAV)
- Queue playback through AndroidX Media3 ExoPlayer
- Daylight Glass UI: soft ivory surfaces, translucent cards, and botanical green accents
- GitHub Actions workflow to build and publish a downloadable debug APK artifact
- No Discord SDK, OAuth, or Discord integration

## Build on GitHub
1. Create a new GitHub repository.
2. Upload the **contents of this project folder** to the repository root (the `.github` folder must be at the root).
3. Push to `main` or `master`, or open **Actions → Android APK Build → Run workflow**.
4. Open the completed workflow run and download the `NovaMusic-debug-apk` artifact.

The workflow provisions JDK 17, Android SDK Platform 35, Build Tools 35.0.0, and Gradle 8.13, then runs `gradle assembleDebug`.

## Build locally
Requirements: JDK 17, Gradle 8.13, Android SDK Platform 35, and Build Tools 35.0.0.

```bash
gradle assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`.

The debug APK is signed with the standard debug key and is intended for testing. A Play Store or production release requires a private signing key of your own. Store the keystore and passwords in GitHub Secrets; never commit them to the repository.

## Sources and rights
Online results are provided by Internet Archive uploaders. Availability, streaming, and download rights vary by item. Users must follow each item's license and terms. This project does not bypass access controls or use private endpoints, credentials, branding, or source code from another app.

## External services
- Internet Archive Advanced Search and metadata/download endpoints
- LRCLIB public lyrics API


## Motion and interaction
- Track rows use spring press-scale feedback and stable-key list placement animation.
- Tab changes use a short fade/scale transition.
- The mini-player slides and fades into view when a track starts; its album glyph rotates slowly during playback.
- A frosted-glass bubble can be dragged within its dedicated strip below the header.
- Motion adapts to the device refresh rate. A fixed 120 FPS cannot be guaranteed by an app: actual frame rate depends on the display, Android scheduler, GPU load, and power mode.


## Background playback and queue
- Playback is owned by `NovaPlaybackService` (`MediaSessionService`), not by the Activity.
- Audio continues when the user switches apps, minimizes NovaMusic, or turns off the screen.
- Android's media notification and lock-screen controls are supplied by Media3 MediaSessionService.
- Dismissing NovaMusic from Android Recents calls `onTaskRemoved`, pauses playback, clears the queue, and stops the service.
- The queue uses shuffle mode and repeat-off. When one track ends, ExoPlayer advances automatically to the next shuffled track.
- Media3 promotes the service while playback is active and supplies media controls/track metadata to Android. The app does not manually start an idle foreground service.


## Branding and launch intro
- Added the NovaMusic glass-note launcher icon.
- Added a 2.1-second Compose intro screen with a soft pulsing glass halo, logo scale/fade entrance, and animated sage equalizer bars.
- The intro is deliberately lightweight and uses native Compose animations rather than a heavy video/GIF.
