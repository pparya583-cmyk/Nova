# NovaMusic 2.0

Pemutar musik bergaya liquid glass (Capacitor + HTML/CSS/JS murni, tanpa framework).

## Struktur
- `www/core.js`  : mesin (sumber musik, pemutar, equalizer/efek, lirik, unduhan)
- `www/ui.js`    : semua layar dan fitur
- `www/style.css`: gaya liquid glass dan 6 tema
- `native/`      : layanan putar di latar belakang (Android), tidak diubah
- `.github/workflows/build-apk.yml`: build APK lewat GitHub Actions (tidak diubah, hanya nama artifact)

## Coba di browser
`cd www && python3 -m http.server 8000` lalu buka http://localhost:8000
