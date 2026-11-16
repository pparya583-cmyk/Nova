'use strict';
/* ===== NovaMusic · mesin: data, sumber musik, pemutar, equalizer ===== */
const APP = 'NovaMusic';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => isFinite(s) && s > 0 ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
const enc = encodeURIComponent, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const dedupe = a => a.filter((t, i, s) => s.findIndex(x => x.id === t.id) === i);

/* ----- data tersimpan ----- */
const DEF = {
  fav: [], hist: [], pl: {}, off: [], hid: {}, pin: '', fol: [], nlog: [],
  st: { sec: 0, n: {}, a: {}, t: {} },
  eqv: [0, 0, 0, 0, 0], eq: false, pre: 'Normal', bass: false, virt: false, surr: false,
  theme: 'spotify', qual: 'High', ds: false, offm: false, notif: true, xf: 0, viz: false,
  name: 'Arya Music', src: 'audius', ytkey: ''
};
let P; try { P = { ...DEF, ...JSON.parse(localStorage.getItem('nova') || '{}') }; delete P['cf' + 'url'] } catch (e) { P = { ...DEF } }
const save = () => { try { localStorage.setItem('nova', JSON.stringify(P)) } catch (e) { } };
setInterval(save, 15000); addEventListener('pagehide', save); document.addEventListener('visibilitychange', () => document.hidden && save());

const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2300) };
const notify = m => { if (P.notif) { P.nlog.unshift({ m, t: Date.now() }); P.nlog = P.nlog.slice(0, 30); save() } };
const errTxt = e => e === 'offm' ? 'Mode Offline aktif. Matikan di Pengaturan untuk memuat dari internet.' : e === 'ytkey' ? 'YouTube API key belum diatur. Isi di Pengaturan › Sumber Musik.' : 'Gagal memuat. Cek internet atau coba lagi.';

/* ----- sumber musik ----- */
let HOST = 'https://api.audius.co';
const J = async u => { if (P.offm) throw 'offm'; const r = await fetch(u); if (!r.ok) throw 'http'; return r.json() };
const ok = t => t.is_streamable !== false && !t.is_stream_gated && !t.is_delete && (t.duration || 0) > 60;
const aud = async p => (await hostReady, await J(`${HOST}/v1${p}${p.includes('?') ? '&' : '?'}app_name=${APP}`)).data;
const an = t => ({ id: t.id, title: t.title, artist: t.user.name, art: t.artwork ? (t.artwork[P.ds ? '150x150' : '480x480'] || t.artwork['150x150'] || '') : '', dur: t.duration });
const RB = 'https://de1.api.radio-browser.info/json/stations/search?limit=40&hidebroken=true&order=clickcount&reverse=true';
const SRC = {
  audius: {
    n: 'Audius', async get(g, q) {
      const d = q ? await aud('/tracks/search?limit=40&query=' + enc(q)) : await aud('/tracks/trending?limit=40' + (g && g !== 'Semua' ? '&genre=' + enc(g) : ''));
      return d.filter(ok).map(an)
    }
  },
  archive: {
    n: 'Archive', async get(g, q) {
      const qs = (q ? `(${q}) AND ` : '') + 'mediatype:audio' + (g && g !== 'Semua' ? ` AND subject:(${g})` : '');
      const d = (await J(`https://archive.org/advancedsearch.php?q=${enc(qs)}&fl[]=identifier&fl[]=title&fl[]=creator&rows=40&sort[]=downloads+desc&output=json`)).response.docs;
      return d.map(x => ({ id: x.identifier, title: x.title, artist: [].concat(x.creator || 'Internet Archive')[0], art: `https://archive.org/services/img/${x.identifier}`, dur: 0, album: x.identifier }))
    }
  },
  freetouse: {
    n: 'Free To Use', async get(g, q) {
      if (!q) return [];
      const d = await J(`https://api.freetouse.com/v3/music/tracks/search?query=${enc(q)}&limit=30&order=plays&sort=desc`);
      return (d.data || []).filter(t => t.status === 1 && !t.is_premium && t.files && t.files.mp3).map(t => ({
        id: 'ftu-' + t.id, title: t.title || 'Tanpa judul',
        artist: (t.artists || []).map(a => Array.isArray(a) ? a[1]?.name : a?.name).filter(Boolean).join(', ') || 'Free To Use artist',
        art: t.thumbnails?.md || t.thumbnails?.sm || '', dur: Number(t.duration) || 0,
        url: t.files.mp3, source: 'Free To Use', license: 'Free To Use License', licenseUrl: 'https://freetouse.com/license'
      }));
    }
  },
  wikimedia: {
    n: 'Wikimedia Commons', async get(g, q) {
      if (!q) return [];
      const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${enc(q + ' filetype:audio')}&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
      const d = await J(u), pages = Object.values(d.query?.pages || {});
      return pages.filter(x => x.imageinfo?.[0]?.url && /^audio\/(mpeg|ogg|flac|wav|opus)/i.test(x.imageinfo[0].mime || '')).map(x => {
        const ii = x.imageinfo[0], meta = ii.extmetadata || {}, plain = v => String(v?.value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
        const name = x.title.replace(/^File:/, '').replace(/\.[^.]+$/, '');
        return { id: 'wm-' + x.pageid, title: name, artist: plain(meta.Artist) || 'Wikimedia Commons contributor', art: '', dur: 0, url: ii.url, source: 'Wikimedia Commons', license: plain(meta.LicenseShortName) || 'Periksa lisensi file', licenseUrl: meta.LicenseUrl?.value || ii.descriptionurl };
      });
    }
  },
  youtube: {
    n: 'YouTube', async get(g, q) {
      if (!P.ytkey) throw 'ytkey';
      if (!q) return [];
      const u = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&regionCode=ID&relevanceLanguage=id&safeSearch=moderate&q=${enc(q)}&key=${enc(P.ytkey)}`;
      const d = await J(u);
      return (d.items || []).filter(x => x.id && x.id.videoId && x.snippet).map(x => ({
        id: 'yt' + x.id.videoId, youtubeId: x.id.videoId, source: 'YouTube',
        title: x.snippet.title, artist: x.snippet.channelTitle || 'YouTube',
        art: x.snippet.thumbnails?.medium?.url || x.snippet.thumbnails?.default?.url || '',
        dur: 0, external: true
      }));
    }
  },
  radio: {
    n: 'Radio', async get(g, q) {
      const u = RB + (q ? '&name=' + enc(q) : g === 'Indonesia' || !g ? '&countrycode=ID' : g === 'Dunia' ? '' : '&tag=' + enc(g.toLowerCase())); const seen = {};
      return (await J(u)).filter(s => !seen[s.name.trim()] && (seen[s.name.trim()] = 1)).map(s => ({ id: 'r' + s.stationuuid, title: s.name.trim(), artist: (s.tags || s.country || 'Radio').split(',').slice(0, 2).join(', '), art: s.favicon, dur: 0, url: s.url_resolved, live: true }))
    }
  }
};

// Pencarian terpadu: gabungkan katalog yang menyediakan audio atau file audio terbuka.
// Semua sumber ini dicari otomatis; tidak perlu Client ID tambahan. Lisensi tetap mengikuti tiap penyedia/file.
// Kata kunci Indonesia diarahkan ke beberapa pencarian tematik agar hasil lokal lebih kaya.
// Ini adalah pencarian katalog terbuka, bukan klaim playlist resmi/komersial.
const ID_PRESETS = {
  'indonesia hits': ['indonesia', 'indonesian indie', 'pop indonesia'],
  'pop indonesia': ['pop indonesia', 'indonesian pop', 'lagu indonesia'],
  'dangdut': ['dangdut', 'dangdut koplo', 'orkes melayu'],
  'lagu daerah': ['lagu daerah indonesia', 'musik tradisional indonesia', 'nusantara folk'],
  'gamelan': ['gamelan jawa', 'gamelan bali', 'karawitan'],
  'keroncong': ['keroncong indonesia', 'langgam jawa', 'orkes keroncong'],
  'indie indonesia': ['indonesian indie', 'indie indonesia', 'musik independen indonesia']
};
async function searchAll(q) {
  const key = String(q || '').trim().toLowerCase();
  const terms = [...new Set((ID_PRESETS[key] || [String(q || '').trim()]).filter(Boolean))];
  if (!terms.length) return [];

  // SEMUA katalog audio dipanggil bersamaan untuk SETIAP kata kunci,
  // termasuk preset Indonesia. Tidak ada pemilihan sumber manual.
  const providers = [
    { name: 'Audius', get: term => SRC.audius.get('Semua', term) },
    { name: 'Internet Archive', get: term => SRC.archive.get('Semua', term) },
    { name: 'Free To Use', get: term => SRC.freetouse.get('Semua', term) },
    { name: 'Wikimedia Commons', get: term => SRC.wikimedia.get('Semua', term) }
  ];
  const jobs = terms.flatMap(term => providers.map(provider => ({
    name: provider.name, term, run: () => provider.get(term)
  })));

  // Promise.allSettled memastikan satu server yang gagal tidak membatalkan hasil sumber lain.
  const settled = await Promise.allSettled(jobs.map(job => job.run()));
  const results = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      (result.value || []).forEach(track => results.push({
        ...track,
        source: track.source || jobs[index].name
      }));
    }
  });
  const merged = dedupe(results);
  if (!merged.length) {
    const failure = settled.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
  }
  return merged;
}

async function pickHost() { try { const h = (await J('https://api.audius.co')).data; HOST = h[Math.floor(Math.random() * h.length)] } catch (e) { } }
const hostReady = Promise.race([pickHost(), new Promise(r => setTimeout(r, 3000))]);
async function openAlbum(t) {
  toast('Membuka album…');
  try {
    const m = await J(`https://archive.org/metadata/${t.album}`); let f = m.files.filter(x => /\.mp3$/i.test(x.name));
    const v = f.filter(x => x.format === 'VBR MP3'); if (v.length) f = v;
    if (!f.length) return toast('Tidak ada file MP3 di item ini');
    play(f.map(x => { const l = String(x.length || '0'); const d = l.includes(':') ? l.split(':').reduce((a, b) => a * 60 + +b, 0) : parseFloat(l); return { id: t.album + x.name, title: x.title || x.name.replace(/\.mp3$/i, ''), artist: x.creator || t.artist, art: t.art, dur: d, url: `https://archive.org/download/${t.album}/${enc(x.name)}` } }), 0)
  } catch (e) { toast('Gagal membuka album') }
}

/* ----- pemutar ----- */
const A1 = new Audio(), A2 = new Audio(); A2.crossOrigin = 'anonymous'; let A = A1;
const S = { q: [], i: -1, shuf: false, rep: 0, dl: 0, dlEnd: false, pos: 0, svc: 0, pre: '' };
const cur = () => S.q[S.i];
const conv = u => window.Capacitor && Capacitor.convertFileSrc ? Capacitor.convertFileSrc(u) : u;
const urlOf = t => {
  if (!t || t.external || t.youtubeId) return '';
  const off = P.off.find(x => x.id === t.id);
  return off ? conv(off.uri) : (t.url || `${HOST}/v1/tracks/${t.id}/stream?app_name=${APP}`);
};

function openExternalTrack(t) {
  if (!t || !t.youtubeId) return false;
  const url = `https://www.youtube.com/watch?v=${encodeURIComponent(t.youtubeId)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
function play(q, i) {
  if (!Array.isArray(q) || !q.length) return;
  const index = clamp(Number(i) || 0, 0, q.length - 1);
  if (openExternalTrack(q[index])) return toast('Konten YouTube dibuka di YouTube, bukan diputar di NovaMusic.');
  const playable = q.filter(t => t && !t.external && !t.youtubeId);
  if (!playable.length) return toast('Tidak ada audio yang dapat diputar di NovaMusic.');
  const selected = q[index];
  S.q = playable; S.i = Math.max(0, playable.findIndex(t => t.id === selected?.id)); loadTrack();
}
function loadTrack() {
  const t = cur(); if (!t) return;
  if (t.external || t.youtubeId) { toast('Konten ini hanya metadata dan tidak dapat diputar di player internal.'); return; }
  const want = P.eq && !t.noeq ? A2 : A1;
  if (want !== A) { const o = A; A = want; o.pause(); o.removeAttribute('src'); o.load() }
  if (A === A2) { graph(); if (ctx.resume) ctx.resume(); A2.ok = 0 }
  A.volume = 1; lastT = 0;
  A.src = urlOf(t);
  A.addEventListener('loadedmetadata', () => { if (S.pos) { A.currentTime = S.pos; S.pos = 0 } }, { once: true });
  A.play().catch(() => { });
  P.hist = [t, ...P.hist.filter(x => x.id !== t.id)].slice(0, 60);
  const st = P.st; st.n[t.id] = (st.n[t.id] || 0) + 1; st.a[t.artist] = (st.a[t.artist] || 0) + 1; st.t[t.id] = { title: t.title, artist: t.artist, art: t.art };
  save(); ui(); svc(); lyRefresh();
  if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: APP, artwork: t.art ? [{ src: t.art, sizes: '480x480' }] : [] });
}
function next(auto) {
  if (!S.q.length) return;
  if (S.shuf && S.q.length > 1) { let j; do { j = Math.floor(Math.random() * S.q.length) } while (j === S.i); S.i = j }
  else if (S.i + 1 < S.q.length) S.i++; else if (S.rep === 1) S.i = 0; else { if (auto) autoMore(); return }
  loadTrack();
}
/* antrean habis: lanjutkan otomatis dengan lagu trending yang belum ada di antrean */
let moreBusy = 0;
async function autoMore() {
  if (moreBusy) return; moreBusy = 1;
  try {
    const have = new Set(S.q.map(t => t.id));
    const more = ((await trend()) || []).filter(t => t && !t.external && !t.youtubeId && !have.has(t.id));
    if (more.length) { S.q.push(...more); S.i++; loadTrack(); return }
  } catch (e) { }
  finally { moreBusy = 0 }
  A.pause(); ui()
}
function prev() { const t = cur(); if (!t) return; if (A.currentTime > 3 && !t.live) { A.currentTime = 0; return } S.i = (S.i - 1 + S.q.length) % S.q.length; loadTrack() }
const toggle = () => { if (!cur()) return; A.paused ? A.play().catch(() => { }) : A.pause() };
function addQ(t) { if (t && (t.external || t.youtubeId)) return toast('Konten eksternal tidak dapat dimasukkan ke antrean audio internal.'); if (!S.q.length) return play([t], 0); S.q.splice(S.i + 1, 0, t); toast('Diputar berikutnya') }
function enq(t) { if (t && (t.external || t.youtubeId)) return toast('Konten eksternal tidak dapat dimasukkan ke antrean audio internal.'); if (!S.q.length) return play([t], 0); S.q.push(t); toast('Masuk antrean') }

let lastT = 0, msT = 0;
A1.onplay = A2.onplay = () => { ui(); svc() };
A1.onpause = A2.onpause = () => { ui(); svc(); save() };
A1.onended = A2.onended = () => { if (S.dlEnd) { S.dlEnd = false; S.dl = 0; A.pause(); toast('Timer tidur selesai'); notify('Timer tidur selesai'); return } if (S.rep === 2) { A.currentTime = 0; A.play() } else next(true) };
A1.onerror = A2.onerror = e => {
  if (e && e.target !== A) return; const t = cur();
  if (A === A2 && !A2.ok && t && !t.noeq) { t.noeq = true; toast('Sumber ini tidak mendukung equalizer, diputar tanpa EQ'); loadTrack(); return }
  if (!t) return; toast('Gagal diputar, lanjut ke berikutnya…'); setTimeout(() => next(true), 900)
};
A2.addEventListener('playing', () => { A2.ok = 1 });
A1.ontimeupdate = A2.ontimeupdate = () => {
  const t = cur(); if (!t) return; const ct = A.currentTime;
  if (!A.paused) { const d = ct - lastT; if (d > 0 && d < 2) P.st.sec += d } lastT = ct;
  if (S.dl && Date.now() >= S.dl) { S.dl = 0; A.pause(); toast('Timer tidur selesai'); notify('Timer tidur selesai') }
  const D = A.duration;
  if (P.xf && D && isFinite(D) && !t.live) A.volume = clamp(Math.min((D - ct) / P.xf, ct / (P.xf * .6 + .01)), 0, 1); else if (A.volume !== 1) A.volume = 1;
  if (D && isFinite(D) && !t.live && !P.ds && D - ct < 12 && S.pre !== t.id && S.i + 1 < S.q.length && !S.shuf) { S.pre = t.id; try { const p = new Audio(); p.preload = 'auto'; p.src = urlOf(S.q[S.i + 1]) } catch (e) { } }
  if ('mediaSession' in navigator && Date.now() - msT > 1000 && D && isFinite(D)) { msT = Date.now(); try { navigator.mediaSession.setPositionState({ duration: D, position: clamp(ct, 0, D), playbackRate: 1 }) } catch (e) { } }
  uiTime(); lyTick();
};
if ('mediaSession' in navigator) {
  const m = navigator.mediaSession, h = (a, f) => { try { m.setActionHandler(a, f) } catch (e) { } };
  h('play', () => A.play()); h('pause', () => A.pause()); h('nexttrack', () => next()); h('previoustrack', prev);
  h('seekto', d => { if (d.seekTime != null) A.currentTime = d.seekTime });
  h('seekbackward', () => { A.currentTime = Math.max(0, A.currentTime - 10) }); h('seekforward', () => { A.currentTime += 10 });
}

/* ----- layanan latar belakang (Android) ----- */
const MP = () => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Music;
function svc() { const m = MP(), t = cur(); if (!m || !t) return; const p = { title: t.title, artist: t.artist, playing: !A.paused }; if (S.svc) m.update(p); else if (!A.paused) { S.svc = 1; m.start(p) } }

/* ----- unduhan offline ----- */
const FS = () => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Filesystem;
async function dl(t) {
  t = t || cur(); const f = FS(); if (!t) return; if (t.external || t.youtubeId) return toast('Konten YouTube tidak dapat diunduh dari NovaMusic.'); if (t.live) return toast('Radio siaran langsung tidak bisa diunduh');
  if (!f) return toast('Unduhan hanya tersedia di aplikasi Android');
  const o = P.off.find(x => x.id === t.id);
  if (o) { try { await f.deleteFile({ path: o.path, directory: 'DATA' }) } catch (e) { } P.off = P.off.filter(x => x.id !== t.id); save(); ui(); return toast('Unduhan dihapus') }
  if (t.url && t.url.startsWith('blob:')) return toast('Lagu dari HP sudah ada di perangkat');
  if (P.offm) return toast('Mode Offline aktif, tidak bisa mengunduh');
  const url = urlOf(t), path = 'dl/' + String(t.id).replace(/[^\w-]/g, '_') + '.mp3';
  toast('Mengunduh…');
  try { await f.downloadFile({ url, path, directory: 'DATA', recursive: true }); const u = await f.getUri({ path, directory: 'DATA' }); P.off.unshift({ ...t, url: undefined, path, uri: u.uri }); save(); ui(); toast('Tersimpan untuk didengar offline'); notify('Unduhan selesai: ' + t.title) }
  catch (e) { toast('Gagal mengunduh lagu ini') }
}

/* ----- equalizer & efek ----- */
let ctx, F = [], AN = null, FX = {};
const BANDS = [[60, 'lowshelf', '60Hz'], [230, 'peaking', '230Hz'], [910, 'peaking', '910Hz'], [3600, 'peaking', '3.6kHz'], [14000, 'highshelf', '14kHz']];
const PRE = { Normal: [0, 0, 0, 0, 0], Bass: [8, 5, 0, -1, 0], Treble: [-1, 0, 1, 5, 8], Vokal: [-2, 1, 4, 3, 0], Rock: [5, 2, -2, 3, 5], Pop: [-1, 2, 4, 2, -1] };
function graph() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)(); let n = ctx.createMediaElementSource(A2);
  F = BANDS.map((b, i) => { const f = ctx.createBiquadFilter(); f.type = b[1]; f.frequency.value = b[0]; f.gain.value = P.eqv[i]; n.connect(f); n = f; return f });
  FX.bass = ctx.createBiquadFilter(); FX.bass.type = 'lowshelf'; FX.bass.frequency.value = 110; n.connect(FX.bass);
  const dry = FX.dry = ctx.createGain(), wide = FX.wide = ctx.createGain(), mix = ctx.createGain(), out = ctx.createGain();
  FX.bass.connect(dry); dry.connect(mix);
  /* virtualizer: pelebar stereo dengan silang tunda singkat */
  const sp = ctx.createChannelSplitter(2), mg = ctx.createChannelMerger(2), dL = ctx.createDelay(.05), dR = ctx.createDelay(.05), xL = ctx.createGain(), xR = ctx.createGain();
  dL.delayTime.value = dR.delayTime.value = .013; xL.gain.value = xR.gain.value = -.35;
  FX.bass.connect(sp); sp.connect(mg, 0, 0); sp.connect(mg, 1, 1); sp.connect(dL, 0); sp.connect(dR, 1); dL.connect(xL); dR.connect(xR); xL.connect(mg, 0, 1); xR.connect(mg, 0, 0);
  mg.connect(wide); wide.connect(mix);
  /* surround: gema pendek (ruang) */
  const dl_ = ctx.createDelay(.2), fb = ctx.createGain(), sg = FX.surr = ctx.createGain(); dl_.delayTime.value = .045; fb.gain.value = .38; sg.gain.value = 0;
  mix.connect(dl_); dl_.connect(fb); fb.connect(dl_); dl_.connect(sg); sg.connect(out); mix.connect(out);
  AN = ctx.createAnalyser(); AN.fftSize = 128; AN.smoothingTimeConstant = .78; out.connect(AN); AN.connect(ctx.destination);
  fxApply();
}
function fxApply() {
  if (!ctx) return;
  F.forEach((f, i) => f.gain.value = P.eqv[i]);
  FX.bass.gain.value = P.bass ? 7 : 0; FX.dry.gain.value = P.virt ? 0 : 1; FX.wide.gain.value = P.virt ? 1 : 0; FX.surr.gain.value = P.surr ? .32 : 0; save()
}
function setEq(on) { P.eq = on; save(); (P.hist.concat(S.q)).forEach(t => delete t.noeq); if (cur()) { S.pos = A.currentTime; loadTrack() } }

/* ----- lirik ----- */
let LY = { lines: [], i: -1 }; const LYS = { sync: true };
const lyOpen = () => !$('#lyr').classList.contains('hide');
async function loadLyrics() {
  const t = cur(), b = $('#lb'); LY = { lines: [], i: -1 }; if (!t) { b.innerHTML = '<p class="empty">Putar lagu untuk melihat lirik.</p>'; return }
  if (t.live) { b.innerHTML = '<p class="empty">Radio siaran langsung tidak punya lirik.</p>'; return }
  b.innerHTML = '<p class="empty">Mencari lirik…</p>';
  try {
    const r = await J(`https://lrclib.net/api/search?track_name=${enc(t.title)}&artist_name=${enc(t.artist)}`);
    if (cur() !== t) return;
    const x = r.find(a => a.syncedLyrics) || r.find(a => a.plainLyrics);
    if (!x) { b.innerHTML = '<p class="empty">Lirik tidak ditemukan untuk lagu ini.</p>'; return }
    if (x.syncedLyrics) {
      LY.lines = x.syncedLyrics.split('\n').map(l => { const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)/); return m ? { t: +m[1] * 60 + +m[2], x: m[3].trim() } : null }).filter(l => l && l.x);
      b.innerHTML = LY.lines.map((l, i) => `<p data-i="${i}">${esc(l.x)}</p>`).join('');
      $$('p', b).forEach(p => p.onclick = () => { A.currentTime = LY.lines[+p.dataset.i].t });
    } else b.innerHTML = `<pre>${esc(x.plainLyrics)}</pre>`;
  } catch (e) { b.innerHTML = `<p class="empty">${e === 'offm' ? 'Mode Offline aktif, lirik tidak dimuat.' : 'Gagal memuat lirik. Cek internet.'}</p>` }
}
const lyRefresh = () => { if (lyOpen()) loadLyrics() };
function lyTick() {
  if (!LY.lines.length || !lyOpen()) return;
  const T = A.currentTime + .3; let k = -1; LY.lines.forEach((l, i) => { if (l.t <= T) k = i });
  if (k === LY.i) return; LY.i = k; const b = $('#lb'), o = $('.on', b); if (o) o.classList.remove('on');
  const n = $(`[data-i="${k}"]`, b); if (n) { n.classList.add('on'); if (LYS.sync) n.scrollIntoView({ block: 'center', behavior: 'smooth' }) }
}
