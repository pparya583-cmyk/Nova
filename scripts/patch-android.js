// Dijalankan setelah `npx cap add android`: pasang plugin Music native, izin, dan service.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), app = path.join(root, 'android', 'app', 'src', 'main');
if (!fs.existsSync(app)) { console.error('Folder android/ belum ada. Jalankan: npm run android:init'); process.exit(1); }
const jdir = path.join(app, 'java', 'com', 'novamusic', 'app'); fs.mkdirSync(jdir, { recursive: true });
for (const f of ['MusicService.java', 'MusicPlugin.java', 'MainActivity.java']) fs.copyFileSync(path.join(root, 'native', f), path.join(jdir, f));
const mf = path.join(app, 'AndroidManifest.xml'); let x = fs.readFileSync(mf, 'utf8');
const perms = ['INTERNET', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK', 'POST_NOTIFICATIONS'];
for (const p of perms) if (!x.includes('android.permission.' + p + '"')) x = x.replace('</manifest>', `    <uses-permission android:name="android.permission.${p}" />\n</manifest>`);
if (!x.includes('.MusicService')) x = x.replace('</application>', '    <service android:name=".MusicService" android:exported="false" android:foregroundServiceType="mediaPlayback" />\n    </application>');
fs.writeFileSync(mf, x); console.log('Android dipatch: plugin Music + izin + service');
