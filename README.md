# NovaMusic 2.0.0

Pemutar musik Android (Jetpack Compose) dengan tema **liquid glass**: musik lokal + streaming/download dari Internet Archive.

## Fitur
- Tema liquid glass: latar aurora bergerak, panel kaca semi-transparan dengan tepi berkilau
- Home: sapaan, genre chips, Recently played, Liked songs, Trending, lagu di perangkat
- Search Internet Archive (metadata diambil paralel, jadi lebih cepat)
- Library: Songs (MediaStore), Liked, Playlists (buat / hapus / tambah / hapus lagu)
- Mini player + layar Now Playing penuh: cover, seek bar, play/pause, next/prev, shuffle, repeat (off/all/one)
- Queue: lihat antrean, loncat ke lagu, "Play next", "Add to queue"
- Lyrics dari LRCLIB, termasuk lyrics tersinkron yang menyorot baris aktif (tap baris untuk seek)
- Background playback via Media3 `MediaSessionService`: lanjut main saat app ditutup, ada notifikasi + kontrol lock screen
- Download lewat DownloadManager (ekstensi file mengikuti format asli)
- Favorit, riwayat, dan playlist disimpan lokal

## Build
Butuh JDK 17 dan Android SDK Platform 36.

```bash
gradle assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`.
GitHub Actions membangun debug APK saat push ke `main` atau dijalankan manual. Signing produksi pakai keystore pribadi lewat GitHub secrets; jangan commit keystore.

## Catatan sumber & hak
Hasil online berasal dari uploader Internet Archive. Ketersediaan, pemutaran, dan hak download berbeda per item; hormati lisensi tiap item. Tidak ada SDK/akun Discord, token, atau API privat.

## Layanan eksternal
- Internet Archive (advanced search, metadata, download)
- LRCLIB (lyrics)
