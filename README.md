# NovaMusic — Web + Android

## Jalankan di browser
Buka `index.html` (atau `npx serve .`).

## Jadikan APK (Android)
Syarat: Node 18+, JDK 17, Android SDK.

    npm install
    npm run android:init     # buat folder android/ + pasang plugin Music (notifikasi & musik latar)
    npm run android:apk      # hasil: android/app/build/outputs/apk/debug/app-debug.apk

Setelah mengubah kode web: `npm run android:sync`, lalu build ulang.

Tanpa Android SDK lokal: upload folder ini ke GitHub, buka tab **Actions → Build APK → Run workflow**,
lalu unduh APK dari bagian Artifacts.

## Yang dipakai fitur native
- `Music` (folder `native/`): foreground service agar lagu tetap jalan saat layar mati + notifikasi pemutar.
- `@capacitor/filesystem`: unduhan lagu untuk mode offline.

## Belum tersedia
- Widget layar utama Android (butuh komponen native tambahan).
- Listening Party / status teman real-time (butuh server).
