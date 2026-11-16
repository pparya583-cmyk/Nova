'use strict';
/* ===== NovaMusic · tampilan dan fitur ===== */

/* ----- ikon ----- */
const pa = d => `<path d="${d}"/>`;
const IC = {
  home: pa('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'),
  search: pa('M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'),
  music: pa('M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'),
  user: pa('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'),
  bell: pa('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0'),
  mic: pa('M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4'),
  sliders: pa('M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6'),
  left: pa('M15 18l-6-6 6-6'), right: pa('M9 18l6-6-6-6'), down: pa('M6 9l6 6 6-6'), up: pa('M18 15l-6-6-6 6'),
  play: pa('M7 4l13 8-13 8z'), pause: pa('M6 4h4v16H6z M14 4h4v16h-4z'),
  next: pa('M5 4l10 8-10 8z M19 5v14'), prev: pa('M19 20L9 12l10-8z M5 19V5'),
  shuffle: pa('M16 3h5v5 M4 20L21 3 M21 16v5h-5 M15 15l6 6 M4 4l5 5'),
  repeat: pa('M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3'),
  heart: pa('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'),
  dl: pa('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3'),
  plus: pa('M12 5v14 M5 12h14'), more: pa('M12 5h.01 M12 12h.01 M12 19h.01'),
  list: pa('M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'),
  share: pa('M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13'),
  users: pa('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'),
  x: pa('M18 6L6 18 M6 6l12 12'), moon: pa('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'),
  clock: pa('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2'),
  star: pa('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'),
  car: pa('M5 17h14 M3 13l2-6h14l2 6v4H3z M7 17v2 M17 17v2'),
  eyeoff: pa('M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22'),
  lock: pa('M5 11h14v10H5z M7 11V7a5 5 0 0 1 10 0v4'),
  bt: pa('M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11'),
  bars: pa('M12 20V10 M18 20V4 M6 20v-4'),
  smile: pa('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01'),
  vol: pa('M11 5L6 9H2v6h4l5 4z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07'),
  reset: pa('M1 4v6h6 M3.51 15a9 9 0 1 0 2.13-9.36L1 10'),
  check: pa('M20 6L9 17l-5-5'),
  crown: pa('M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z'),
  widget: pa('M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z'),
  layers: pa('M12 2l10 5-10 5L2 7z M2 12l10 5 10-5 M2 17l10 5 10-5'),
  trash: pa('M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6'),
  pencil: pa('M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),
  phones: pa('M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'),
  mic2: pa('M9 18V5l12-2v13'),
  gear: pa('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'),
  info: pa('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01'),
  folder: pa('M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'),
  palette: pa('M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 22 11c0-5-4.5-9-10-9z M7.5 11h.01 M10 7h.01 M15 7h.01 M17.5 11h.01'),
  expand: pa('M15 3h6v6 M9 21H3v-6 M21 3l-7 7 M3 21l7-7'),
  lyric: pa('M4 7h16 M4 12h16 M4 17h10'),
  mono: pa('M2 12h3 M7 8v8 M11 5v14 M15 9v6 M19 7v10 M22 12h0')
};
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(IC).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</defs></svg>`);
const FILLABLE = new Set(['play', 'pause', 'next', 'prev', 'heart', 'star', 'crown', 'moon']);
const ic = (n, c = '') => `<svg class="ic ${FILLABLE.has(n) ? c : c.replace(/\bf\b/, '')}"><use href="#i-${n}"/></svg>`;
const logo = s => `<div class="logo" style="width:${s}px;height:${s}px"><svg class="ic" style="width:${Math.round(s * .58)}px;height:${Math.round(s * .58)}px"><use href="#i-music"/></svg></div>`;
const grad = c => `linear-gradient(145deg,${c[0]},${c[1]})`;
const hh = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h };
const art = t => `<div class="art" style="--h:${hh((t.title || '') + (t.artist || ''))}">${t.art ? `<img src="${esc(t.art)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>`;
const sw = (k, on) => `<button class="sw ${on ? 'on' : ''}" data-sw="${k}" role="switch" aria-checked="${!!on}"><i></i></button>`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ----- tema ----- */
const THEMES = {
  spotify: { n: 'Spotify Glass', kind: 'bubble', bg0: '#06110b', bg1: '#123d27', acc: '#1ed760', acc2: '#a7ffc4', pb: 'radial-gradient(circle at 35% 25%,#d8ffe4,#1ed760 60%,#087a36)', pi: '#052b16', pv: 'radial-gradient(circle at 35% 30%,#baffce,#1ed760 45%,#052412 85%)' },
  glass: { n: 'Glass Blue', kind: 'bubble', bg0: '#030a24', bg1: '#0b3bb0', acc: '#3a8dff', acc2: '#9fd4ff', pb: 'radial-gradient(circle at 35% 25%,#fff,#c9dcff 60%,#9ebcff)', pi: '#1a3fa8', pv: 'radial-gradient(circle at 35% 30%,#bfe3ff,#2f7bff 45%,#06185a 85%)' },
  purple: { n: 'Purple', kind: 'butterfly', bg0: '#0b0222', bg1: '#4a1396', acc: '#a24dff', acc2: '#d9a6ff', pb: 'radial-gradient(circle at 35% 25%,#c58bff,#8a2be2 60%,#5a14b0)', pi: '#fff', pv: 'radial-gradient(circle at 35% 30%,#e0b8ff,#8a2be2 45%,#1a0640 85%)' },
  pink: { n: 'Pink', kind: 'petal', bg0: '#3a1330', bg1: '#c25a8a', acc: '#ff7fb8', acc2: '#ffc2e0', pb: 'radial-gradient(circle at 35% 25%,#ffe0ef,#ff9cc6 65%,#ff7fb8)', pi: '#fff', pv: 'radial-gradient(circle at 35% 30%,#ffe3f0,#ff8fc0 45%,#8a2a5e 85%)' },
  dark: { n: 'Dark', kind: 'smoke', bg0: '#040405', bg1: '#2a2b31', acc: '#9aa0ab', acc2: '#e6e8ee', pb: 'radial-gradient(circle at 35% 25%,#555861,#1b1c20 70%)', pi: '#fff', pr: '0 0 0 2px rgba(255,255,255,.28) inset,0 0 22px rgba(255,255,255,.14)', pv: 'radial-gradient(circle at 35% 30%,#8d9099,#222 40%,#000 85%)' },
  sunset: { n: 'Sunset', kind: 'glow', bg0: '#33104a', bg1: '#e8743a', acc: '#ff9a4d', acc2: '#ffd59a', pb: 'radial-gradient(circle at 35% 25%,#fff,#ffe3c8 70%)', pi: '#ff6a3d', pv: 'radial-gradient(circle at 40% 70%,#ffd36a,#ff7a3d 40%,#6a2a8a 85%)' },
  ocean: { n: 'Ocean', kind: 'bubble', bg0: '#021a1c', bg1: '#0b8077', acc: '#19d4b8', acc2: '#8ffff0', pb: 'radial-gradient(circle at 35% 25%,#b9fff4,#2fe0c4 65%,#12b8a0)', pi: '#04403a', pv: 'radial-gradient(circle at 35% 30%,#9bfff0,#12b8a0 45%,#033a3a 85%)' },
  galaxy: { n: 'Galaxy', kind: 'star', bg0: '#070722', bg1: '#3a2aa8', acc: '#8a7bff', acc2: '#cbbcff', pb: 'radial-gradient(circle at 35% 25%,#e6deff,#a898ff 65%,#7a6cff)', pi: '#2a1a80', pv: 'radial-gradient(circle at 35% 30%,#d8ccff,#5a4cff 45%,#0a0a3a 85%)' },
  neon: { n: 'Neon', kind: 'streak', bg0: '#05030f', bg1: '#3a0a52', acc: '#ff2f9a', acc2: '#35d6ff', pb: 'rgba(12,4,24,.7)', pi: '#ff4fb0', pr: '0 0 0 2.5px #ff2f9a inset,0 0 28px #ff2f9a,0 0 0 1px rgba(255,255,255,.25)', pv: 'radial-gradient(circle at 35% 30%,#ff9be0,#ff2f9a 40%,#2a0a5a 85%)' }
};
if (!THEMES[P.theme]) P.theme = 'glass';
const TC = {};
var uiKey = '';
/* ilustrasi cadangan (abstrak) saat lagu tidak punya sampul */
const SCN = {
  spotify: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1ed760"/><stop offset="1" stop-color="#062514"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><circle cx="150" cy="150" r="94" fill="none" stroke="#d8ffe4" stroke-width="2" opacity=".45"/><path d="M68 118q84-35 164 8M78 151q72-27 142 8M91 183q58-19 116 7" fill="none" stroke="#f4fff7" stroke-width="13" stroke-linecap="round" opacity=".9"/>',
  glass: '<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a7bff"/><stop offset="1" stop-color="#06155a"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g fill="#fff" opacity=".85"><ellipse cx="60" cy="70" rx="62" ry="24"/><ellipse cx="110" cy="56" rx="48" ry="28"/><ellipse cx="240" cy="220" rx="70" ry="26"/></g><circle cx="150" cy="150" r="60" fill="none" stroke="#9fd4ff" stroke-width="10" opacity=".85"/><circle cx="150" cy="150" r="34" fill="#9fd4ff" opacity=".35"/>',
  purple: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2bff"/><stop offset="1" stop-color="#14052e"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><circle cx="190" cy="110" r="64" fill="#e0b8ff" opacity=".28"/><g fill="#fff"><circle cx="40" cy="50" r="2"/><circle cx="90" cy="30" r="1.6"/><circle cx="250" cy="40" r="2.4"/><circle cx="60" cy="190" r="1.8"/><circle cx="230" cy="230" r="2"/><circle cx="140" cy="250" r="1.6"/></g><path d="M0 300V230q70-50 150-10t150-20v100z" fill="#12042a"/>',
  pink: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc0dc"/><stop offset="1" stop-color="#b8528a"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g fill="#ff6fae" opacity=".9" stroke="#fff" stroke-width="2"><g transform="translate(90 100)"><ellipse rx="13" ry="26" transform="rotate(0)"/><ellipse rx="13" ry="26" transform="rotate(72)"/><ellipse rx="13" ry="26" transform="rotate(144)"/><ellipse rx="13" ry="26" transform="rotate(216)"/><ellipse rx="13" ry="26" transform="rotate(288)"/></g><g transform="translate(210 190) scale(.8)"><ellipse rx="13" ry="26"/><ellipse rx="13" ry="26" transform="rotate(72)"/><ellipse rx="13" ry="26" transform="rotate(144)"/><ellipse rx="13" ry="26" transform="rotate(216)"/><ellipse rx="13" ry="26" transform="rotate(288)"/></g></g><circle cx="90" cy="100" r="9" fill="#ffd34d"/><circle cx="210" cy="190" r="7" fill="#ffd34d"/>',
  dark: '<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a8d96"/><stop offset="1" stop-color="#0a0a0c"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g fill="#d9dbe1" opacity=".5"><ellipse cx="70" cy="80" rx="70" ry="28"/><ellipse cx="220" cy="60" rx="60" ry="24"/><ellipse cx="170" cy="130" rx="80" ry="24"/></g><circle cx="150" cy="190" r="40" fill="#050506" opacity=".8"/>',
  sunset: '<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a8a"/><stop offset=".55" stop-color="#ff7a3d"/><stop offset="1" stop-color="#ffd36a"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><circle cx="150" cy="190" r="56" fill="#fff2b0" opacity=".9"/><g fill="#fff" opacity=".35"><ellipse cx="70" cy="90" rx="70" ry="10"/><ellipse cx="230" cy="125" rx="60" ry="9"/></g><path d="M0 300V240q60-40 120-12t180-26v98z" fill="#2a1030"/>',
  ocean: '<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fe0c8"/><stop offset="1" stop-color="#033a3a"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g fill="none" stroke="#fff" opacity=".6"><circle cx="70" cy="200" r="16"/><circle cx="110" cy="130" r="9"/><circle cx="220" cy="90" r="20"/><circle cx="240" cy="220" r="11"/><circle cx="160" cy="250" r="7"/></g><path d="M0 220q40-30 80 0t80 0 80 0 60-10v90H0z" fill="#042e30" opacity=".7"/>',
  galaxy: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3cff"/><stop offset="1" stop-color="#0a0a3a"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g fill="#fff"><circle cx="50" cy="60" r="2"/><circle cx="120" cy="40" r="1.6"/><circle cx="260" cy="90" r="2.2"/><circle cx="40" cy="160" r="1.6"/><circle cx="210" cy="170" r="2"/><circle cx="100" cy="120" r="1.4"/></g><path d="M250 40L150 110" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/><circle cx="250" cy="40" r="5" fill="#fff"/><path d="M0 300V250q80-40 160-5t140-15v70z" fill="#0b0a2e"/>',
  neon: '<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a5a"/><stop offset="1" stop-color="#05030f"/></linearGradient></defs><rect width="300" height="300" fill="url(#a)"/><g opacity=".9"><rect x="30" y="120" width="50" height="180" fill="#120830" stroke="#35d6ff" stroke-width="2"/><rect x="95" y="80" width="60" height="220" fill="#120830" stroke="#ff2f9a" stroke-width="2"/><rect x="170" y="140" width="45" height="160" fill="#120830" stroke="#35d6ff" stroke-width="2"/><rect x="228" y="100" width="52" height="200" fill="#120830" stroke="#ff2f9a" stroke-width="2"/></g><path d="M0 40L300 220" stroke="#ff2f9a" stroke-width="3" opacity=".8"/>'
};
const scene = () => { const k = P.theme, svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">${SCN[k] || SCN.glass}</svg>`, u = 'data:image/svg+xml,' + encodeURIComponent(svg); return { u, h: `<div class="art"><img src="${u}" alt=""></div>` } };
function decoBuild() {
  const d = $('#full .deco'); if (!d) return; const k = THEMES[P.theme].kind, n = { petal: 16, bubble: 14, butterfly: 8, star: 40, streak: 7, smoke: 5, glow: 16 }[k] || 10; let h = '';
  for (let i = 0; i < n; i++) h += `<i style="--l:${Math.random() * 100}%;--tp:${Math.random() * 100}%;--d:${(-Math.random() * 14).toFixed(1)}s;--t:${(k === 'streak' ? 3 + Math.random() * 3 : k === 'star' ? 2 + Math.random() * 4 : 9 + Math.random() * 9).toFixed(1)}s;--s:${(k === 'star' ? 1.5 + Math.random() * 2.5 : 8 + Math.random() * 22).toFixed(0)}px"></i>`;
  d.className = 'deco dk-' + k; d.innerHTML = h;
}
function applyTheme(k) {
  const t = THEMES[k] || THEMES.glass, s = document.documentElement.style;
  document.documentElement.setAttribute('data-theme', k);
  ['bg0', 'bg1', 'acc', 'acc2'].forEach(x => s.setProperty('--' + x, t[x])); TC.acc = t.acc; TC.acc2 = t.acc2;
  s.setProperty('--pb', t.pb); s.setProperty('--pi', t.pi); s.setProperty('--pr', t.pr || '0 0 0 1px rgba(255,255,255,.4) inset,0 0 30px ' + t.acc);
  const m = $('meta[name=theme-color]'); if (m) m.content = t.bg0;
  if (applyTheme.last !== k) { applyTheme.last = k; decoBuild(); if (typeof cur === 'function' && cur()) { uiKey = ''; ui() } }
}
applyTheme(P.theme);

/* ----- navigasi ----- */
const R = { tab: 'home', stack: [] }, OVS = [];
let skip = 0, after = null;
let prevDepth = 0, prevTab = 'home', navSync = () => { };
const colS = { scroll: false, force: false, y: 0 };
const TABICON = { home: 'home', search: 'search', lib: 'music', set: 'user' };
function updateCol() {
  const app = $('#app'), was = app.classList.contains('col'), c = (colS.scroll && !colS.force) || R.stack.length > 0; app.classList.toggle('col', c);
  const b = $('.ncol'); if (b) b.innerHTML = ic(R.stack.length ? 'home' : TABICON[R.tab]);
  if (was && !c) setTimeout(() => navSync(true), 500);
}
function render() {
  applyTheme(P.theme);
  const top = R.stack[R.stack.length - 1], [n, a] = top || [R.tab], el = $('#view');
  const d = R.stack.length, dir = d > prevDepth ? 'fwd' : d < prevDepth ? 'bck' : R.tab !== prevTab ? 'tab' : ''; prevDepth = d; prevTab = R.tab;
  el.classList.remove('pg-fwd', 'pg-bck', 'pg-tab'); if (dir) { void el.offsetWidth; el.classList.add('pg-' + dir) }
  revReset(); colS.scroll = false; colS.force = false; colS.y = 0; updateCol();
  $('#app').classList.toggle('sub', !!top);
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.t === R.tab));
  el.scrollTop = 0; el.innerHTML = ''; V[n](el, a); navSync();
}
function go(n, a) { R.stack.push([n, a]); history.pushState({ n }, ''); render() }
function rewind(k, cb) {
  if (!k) return cb && cb();
  skip = 1; after = cb; history.go(-k);
  setTimeout(() => { if (skip) { skip = 0; const f = after; after = null; f && f() } }, 450);
}
function hideOv(id) { const e = $('#' + id); e.classList.remove('opening'); e.classList.add('closing'); clearTimeout(e._t); e._t = setTimeout(() => { e.classList.remove('closing'); e.classList.add('hide') }, 240) }
function closeOvs(cb) { const k = OVS.length; OVS.splice(0).forEach(hideOv); rewind(k, cb) }
function unwind(cb) { const k = OVS.length + R.stack.length; OVS.splice(0).forEach(hideOv); R.stack = []; rewind(k, cb) }
function tab(n) { R.tab = n; unwind(render) }
function openOv(id) { if (OVS.includes(id)) return; const e = $('#' + id); clearTimeout(e._t); e.classList.remove('closing', 'hide'); e.classList.remove('opening'); void e.offsetWidth; e.classList.add('opening'); OVS.push(id); history.pushState({ o: id }, '') }
addEventListener('popstate', () => {
  if (skip) { skip = 0; const f = after; after = null; f && f(); return }
  if (OVS.length) { hideOv(OVS.pop()); return }
  if (R.stack.length) { R.stack.pop(); render() }
});
const back = () => history.back();
const sub = (title, right = '') => `<header class="sub-top"><button class="ib" id="bk" aria-label="Kembali">${ic('left')}</button><h1>${title}</h1><div class="hr">${right}</div></header>`;
const bindBack = el => { const b = $('#bk', el); if (b) b.onclick = back };
const safe = fn => async (...a) => { try { await fn(...a) } catch (e) { toast(errTxt(e)) } };

/* ----- sheet & dialog ----- */
function sheet(title, html, fn) {
  const s = $('#sheet'); clearTimeout(s._t);
  s.innerHTML = `<div class="scrim"></div><div class="panel glass"><div class="grab"></div><h3>${title}</h3><div class="sbd">${html}</div></div>`;
  s.classList.remove('hide'); requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('open')));
  $('.scrim', s).onclick = closeSheet; if (fn) fn($('.sbd', s));
}
function closeSheet() { const s = $('#sheet'); s.classList.remove('open'); clearTimeout(s._t); s._t = setTimeout(() => s.classList.add('hide'), 260) }
function menu(title, items) {
  sheet(title, items.map((it, i) => `<button class="mn ${it[3] === 'bad' ? 'dng' : ''}" data-i="${i}">${ic(it[0])}<span style="flex:1">${esc(it[1])}</span>${it[3] === true ? ic('check') : ''}</button>`).join(''),
    el => $$('.mn', el).forEach(b => b.onclick = () => { closeSheet(); items[+b.dataset.i][2]() }));
}
function ask(title, ph, cb, val = '', type = 'text') {
  sheet(title, `<input class="inp" id="ai" type="${type}" ${type === 'password' ? 'inputmode="numeric" maxlength="4" autocomplete="off"' : ''} placeholder="${esc(ph)}" value="${esc(val)}"><button class="btn blk" id="ao">OK</button>`, el => {
    const i = $('#ai', el), fin = () => { const v = i.value.trim(); if (!v) return; closeSheet(); cb(v) };
    $('#ao', el).onclick = fin; i.onkeydown = e => e.key === 'Enter' && fin(); setTimeout(() => i.focus(), 280)
  });
}

/* ----- tampilan pemutar (diperbarui dari mesin) ----- */
const QUAL = { Low: ['Rendah (96 kbps)', 'LQ'], Normal: ['Normal (160 kbps)', 'SQ'], High: ['Tinggi (320 kbps)', 'HQ'], 'Hi-Res': ['Hi-Res (lossless)', 'Hi-Res'] };
const isFav = t => t && P.fav.some(x => x.id === t.id);
function ui() {
  const t = cur(); document.body.classList.toggle('has', !!t);
  $$('.bplay').forEach(b => b.innerHTML = ic(A.paused ? 'play' : 'pause', 'f'));
  const fu = $('#full'); fu.classList.toggle('playing', !A.paused); fu.classList.toggle('noviz', !P.viz);
  $$('.bshuf').forEach(b => b.classList.toggle('on', S.shuf));
  $$('.brep').forEach(b => { b.classList.toggle('on', S.rep > 0); b.classList.toggle('one', S.rep === 2) });
  $$('.btmr').forEach(b => b.classList.toggle('on', !!(S.dl || S.dlEnd)));
  if (!t) return;
  if (uiKey !== t.id) {
    uiKey = t.id;
    const sc = t.art ? null : scene(); $$('.nArt').forEach(e => e.innerHTML = sc && e.closest('.pa') ? sc.h : art(t));
    $$('.nT').forEach(e => e.textContent = t.title); $$('.nA').forEach(e => e.textContent = t.artist);
    const pb = $('.pbg', $('#full')); if (pb) pb.style.backgroundImage = t.art ? `url("${t.art}")` : `url("${sc.u}")`;
    $$('.seek').forEach(s => { s.disabled = !!t.live; s.value = 0; s.style.setProperty('--p', '0%') }); miniTint(t);
  }
  const mf = $('#mfol'); if (mf) mf.classList.toggle('on', P.fol.includes(t.artist)); $$('.mpp').forEach(e => e.innerHTML = A.paused ? ic('play', 'f s') : '');
  $$('.bfav').forEach(b => { const f = isFav(t); b.classList.toggle('on', f); b.innerHTML = ic('heart', f ? 'f' : '') });
  $$('.bdl').forEach(b => b.innerHTML = ic(P.off.some(x => x.id === t.id) ? 'check' : 'dl'));
}
function uiTime() {
  const t = cur(); if (!t) return; const D = A.duration, c = A.currentTime;
  $('#mini').style.setProperty('--pp', (D && isFinite(D) ? c / D * 100 : 0) + '%');
  const mb = $('#mbar i'); if (mb) mb.style.width = D && isFinite(D) ? c / D * 100 + '%' : '0%';
  $$('.cur').forEach(e => e.textContent = t.live ? 'LIVE' : fmt(c)); $$('.dur').forEach(e => e.textContent = t.live ? '' : fmt(D));
  if (D && isFinite(D) && !t.live) $$('.seek').forEach(s => { if (!s.drag) { s.value = c / D * 1000; s.style.setProperty('--p', c / D * 100 + '%') } });
}

/* ----- visualizer ----- */
const vbuf = new Uint8Array(64);
function vizLoop(ts) {
  requestAnimationFrame(vizLoop);
  const cs = $$('canvas.viz').filter(c => c.offsetParent !== null && (P.viz || !c.dataset.p)); if (!cs.length) return;
  const live = AN && A === A2 && !A.paused; if (live) AN.getByteFrequencyData(vbuf);
  cs.forEach(c => {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
    const g = c.getContext('2d'), n = 36, bw = w / n; g.clearRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, TC.acc); gr.addColorStop(1, TC.acc2); g.fillStyle = gr;
    for (let i = 0; i < n; i++) {
      const v = live ? vbuf[Math.floor(i * 1.3)] / 255 : A.paused ? .05 : .2 + .5 * Math.abs(Math.sin(ts / 360 + i * .62)) * (.55 + .45 * Math.sin(ts / 870 + i * 1.3));
      const bh = Math.max(3 * dpr, v * h * .95); g.beginPath(); g.roundRect ? g.roundRect(i * bw + bw * .2, h - bh, bw * .6, bh, bw * .3) : g.rect(i * bw + bw * .2, h - bh, bw * .6, bh); g.fill()
    }
  });
}
requestAnimationFrame(vizLoop);

/* ----- komponen berulang ----- */
const ctrls = () => `<div class="ctrl"><button class="cb bshuf" aria-label="Acak">${ic('shuffle')}</button><button class="cb bprev" aria-label="Sebelumnya">${ic('prev', 'f')}</button><button class="main bplay" aria-label="Putar">${ic('play', 'f')}</button><button class="cb bnext" aria-label="Berikutnya">${ic('next', 'f')}</button><button class="cb brep" aria-label="Ulangi">${ic('repeat')}</button></div>`;
const seekw = () => `<div class="seekw"><input type="range" class="seek" min="0" max="1000" value="0" aria-label="Posisi lagu"><div class="times"><span class="cur">0:00</span><span class="dur">0:00</span></div></div>`;

function rows(el, tr, o = {}) {
  el.innerHTML = tr.length ? tr.map((t, i) => `<div class="tr" data-i="${i}">${o.num ? `<em class="n">${i + 1}</em>` : ''}<div class="cov">${art(t)}</div><div class="mi"><b class="${cur() && cur().id === t.id ? 'g' : ''}">${esc(t.title)}</b><span>${esc(t.artist)}</span></div>${t.youtubeId ? '<span class="tag">YouTube</span>' : t.source ? `<span class="tag">${esc(t.source)}</span>` : t.album ? '<span class="tag">Album</span>' : t.live ? '<span class="tag live">LIVE</span>' : ''}${t.youtubeId ? '' : o.num ? `<button class="pl" aria-label="Putar">${ic('play', 'f')}</button>` : `<button class="more" data-m="1" aria-label="Menu">${ic('more')}</button>`}</div>`).join('') : `<p class="empty">${o.empty || 'Belum ada lagu di sini.'}</p>`;
  $$('.tr', el).forEach(r => r.onclick = e => { const i = +r.dataset.i, t = tr[i]; if (t.youtubeId) { if (e.target.closest('[data-m]')) return; const url = 'https://www.youtube.com/watch?v=' + encodeURIComponent(t.youtubeId); window.open(url, '_blank'); return } if (e.target.closest('[data-m]')) return tmenu(t); t.album ? openAlbum(t) : play(tr, i) });
}
const failBox = (el, e, retry) => { if (!el) return; el.innerHTML = `<div class="empty">${esc(errTxt(e))}${e === 'offm' ? '' : '<br><button class="btn g2" id="rt">Coba lagi</button>'}</div>`; const b = $('#rt', el); if (b && retry) b.onclick = retry };

function tmenu(t) {
  menu(t.title, [
    ['list', 'Putar berikutnya', () => addQ(t)], ['plus', 'Tambah ke antrean', () => enq(t)],
    ['music', 'Tambah ke playlist', () => addToPl(t)],
    ['heart', isFav(t) ? 'Hapus dari Favorit' : 'Tambah ke Favorit', () => favT(t)],
    ['dl', P.off.some(x => x.id === t.id) ? 'Hapus unduhan' : 'Unduh untuk offline', () => dl(t)],
    ['user', P.fol.includes(t.artist) ? `Berhenti ikuti ${t.artist}` : `Ikuti ${t.artist}`, () => follow(t.artist)],
    ['share', 'Bagikan', () => shareT(t)]]);
}
function favT(t) { const k = P.fav.findIndex(x => x.id === t.id); k < 0 ? P.fav.unshift(t) : P.fav.splice(k, 1); save(); ui(); toast(k < 0 ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit') }
function follow(a) { const k = P.fol.indexOf(a); k < 0 ? P.fol.push(a) : P.fol.splice(k, 1); save(); ui(); toast(k < 0 ? `Mengikuti ${a}` : `Berhenti mengikuti ${a}`) }
async function shareT(t) {
  const x = `🎵 Aku lagi dengerin "${t.title}" oleh ${t.artist} di NovaMusic`;
  try { if (navigator.share) await navigator.share({ text: x }); else { await navigator.clipboard.writeText(x); toast('Teks disalin, tinggal tempel') } } catch (e) { }
}
function addToPl(t) {
  const put = n => { const p = P.pl[n] = P.pl[n] || []; if (!p.some(x => x.id === t.id)) p.push(t); save(); toast('Masuk ke playlist ' + n) };
  sheet('Tambah ke playlist', `<button class="mn" data-n="">${ic('plus')}<span>Playlist baru…</span></button>` + Object.keys(P.pl).map(n => `<button class="mn" data-n="${esc(n)}">${ic('list')}<span>${esc(n)}</span></button>`).join(''),
    el => $$('.mn', el).forEach(b => b.onclick = () => { const n = b.dataset.n; closeSheet(); if (!n) ask('Nama playlist baru', 'Mis. Santai sore', put); else put(n) }));
}
function queueSheet() {
  sheet('Queue Manager', '<div id="ql"></div><div id="qf"></div>', () => drawQ());
}
function drawQ() {
  const l = $('#ql'); if (!l) return;
  l.innerHTML = S.q.map((t, i) => `<div class="qrow ${i === S.i ? 'now' : ''}" data-i="${i}"><div class="cov" style="width:40px;height:40px;border-radius:12px">${art(t)}</div><div class="mi" data-a="go"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div><button data-a="up" aria-label="Naik">${ic('up', 's')}</button><button data-a="dn" aria-label="Turun">${ic('down', 's')}</button><button data-a="rm" aria-label="Hapus">${ic('x', 's')}</button></div>`).join('') || '<p class="empty">Antrean kosong.</p>';
  $('#qf').innerHTML = S.q.length ? '<button class="btn g2 blk" id="qc" style="margin-top:10px">Kosongkan antrean</button>' : '';
  const qc = $('#qc'); if (qc) qc.onclick = () => { S.q = []; S.i = -1; A.pause(); ui(); drawQ(); closeOvs() };
  $$('.qrow', l).forEach(r => r.onclick = e => {
    const i = +r.dataset.i, a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a;
    if (k === 'go') { S.i = i; loadTrack() }
    else if (k === 'rm') { S.q.splice(i, 1); if (i < S.i) S.i--; else if (i === S.i) { if (S.q.length) { S.i = Math.min(i, S.q.length - 1); loadTrack() } else { A.pause(); S.i = -1; ui() } } }
    else { const j = k === 'up' ? i - 1 : i + 1; if (j < 0 || j >= S.q.length) return;[S.q[i], S.q[j]] = [S.q[j], S.q[i]]; if (S.i === i) S.i = j; else if (S.i === j) S.i = i }
    drawQ();
  });
}
function setTimer(m) { S.dl = 0; S.dlEnd = false; if (m > 0) S.dl = Date.now() + m * 6e4; if (m < 0) S.dlEnd = true; ui(); toast(m > 0 ? `Berhenti otomatis dalam ${m} menit` : m < 0 ? 'Berhenti di akhir lagu ini' : 'Timer dimatikan') }
const timerLabel = () => S.dl ? `Aktif · ${Math.max(1, Math.ceil((S.dl - Date.now()) / 6e4))} menit lagi` : S.dlEnd ? 'Sampai akhir lagu' : 'Matikan';
const timerSheet = () => menu('Sleep Timer', [['x', 'Matikan', () => setTimer(0)], ['clock', '15 menit', () => setTimer(15)], ['clock', '30 menit', () => setTimer(30)], ['clock', '45 menit', () => setTimer(45)], ['clock', '60 menit', () => setTimer(60)], ['music', 'Sampai akhir lagu ini', () => setTimer(-1)]]);
const xfSheet = () => menu('Crossfade & Gapless', [0, 3, 5, 8].map(s => ['layers', s ? `Crossfade ${s} detik` : 'Mati (gapless saja)', () => { P.xf = s; save(); toast(s ? `Fade antar lagu ${s} detik` : 'Crossfade dimatikan') }, P.xf === s]));
const toggleOff = () => { P.offm = !P.offm; save(); toast(P.offm ? 'Mode Offline aktif: hanya lagu unduhan' : 'Mode Offline dimatikan'); if (P.offm) notify('Mode Offline diaktifkan') };
function btSheet() {
  const okm = 'mediaSession' in navigator;
  sheet('Bluetooth Control', `<p class="note" style="font-size:14px;color:#fff">${okm ? 'Aktif.' : 'Perangkat ini belum mendukung Media Session.'} Tombol <b>putar/jeda, berikutnya, sebelumnya</b> dan <b>geser posisi</b> pada earbud, headset, dan layar mobil Bluetooth mengendalikan NovaMusic, termasuk saat layar terkunci.</p><p class="note">Pasangkan perangkat lewat pengaturan Bluetooth HP, lalu putar lagu seperti biasa.</p>`);
}
function toggleViz() { P.viz = !P.viz; save(); ui(); toast(P.viz ? 'Audio Visualizer aktif di pemutar' : 'Audio Visualizer dimatikan'); if (P.viz && cur()) openOv('full') }
const wakeL = { l: null };
async function openCar() { openOv('car'); try { wakeL.l = await navigator.wakeLock.request('screen') } catch (e) { } }

function themeBar() { return `<div class="tbar glass"><span class="tl">${ic('palette')}<b>Pilih Tema :</b></span><div class="tsw">${Object.entries(THEMES).map(([k, t]) => `<button data-k="${k}" class="${k === P.theme ? 'on' : ''}" aria-label="${t.n}"><i style="background:${t.pv}"></i><span>${t.n}</span></button>`).join('')}</div></div>` }
function themeSheet() {
  sheet('Tema Aplikasi', themeBar(), el => $$('.tsw button', el).forEach(b => b.onclick = () => { P.theme = b.dataset.k; save(); applyTheme(P.theme); $$('.tsw button', el).forEach(x => x.classList.toggle('on', x === b)) }));
}
function moreSheet() {
  const t = cur(); if (!t) return;
  menu(t.title, [['sliders', 'Equalizer', () => unwind(() => go('eq'))], ['dl', P.off.some(x => x.id === t.id) ? 'Hapus unduhan' : 'Unduh untuk offline', () => dl(t)], ['music', 'Tambah ke playlist', () => addToPl(t)], ['car', 'Car Mode', openCar], ['share', 'Bagikan', () => shareT(t)], ['bars', P.viz ? 'Matikan Audio Visualizer' : 'Nyalakan Audio Visualizer', toggleViz], ['palette', 'Ganti tema', themeSheet]]);
}
/* ----- data penemuan ----- */
const A_ = SRC.audius; let TRN = null;
const trend = async () => TRN || (TRN = await A_.get('Semua'));
async function smartMix() {
  const cnt = {}; [...P.fav, ...P.hist].forEach(t => cnt[t.artist] = (cnt[t.artist] || 0) + 1); P.fol.forEach(a => cnt[a] = (cnt[a] || 0) + 3);
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]); let out = [];
  for (const a of top) { try { out.push(...(await A_.get('Semua', a)).slice(0, 12)) } catch (e) { if (e === 'offm') throw e } }
  const seen = new Set(P.hist.map(t => t.id)); out = dedupe(out); out = [...out.filter(t => !seen.has(t.id)), ...out.filter(t => seen.has(t.id))];
  if (out.length < 12) out = dedupe([...out, ...await trend()]);
  return shuffle(out).slice(0, 40);
}
const MOODS = {
  senang: { e: '😄', n: 'Senang', q: 'happy', g: 'Pop' }, sedih: { e: '😢', n: 'Galau', q: 'sad', g: 'Acoustic' },
  semangat: { e: '🔥', n: 'Semangat', q: 'energy', g: 'Electronic' }, santai: { e: '😌', n: 'Santai', q: 'chill', g: 'Lo-Fi' },
  fokus: { e: '🎯', n: 'Fokus', q: 'focus', g: 'Ambient' }, romantis: { e: '💕', n: 'Romantis', q: 'love', g: 'R&B/Soul' }
};
async function moodTracks(m) { let tr = await A_.get('Semua', m.q); if (tr.length < 8) tr = dedupe([...tr, ...await A_.get(m.g)]); return tr }
const PRESETS = [
  { n: 'Mood Booster', s: 'Pop ceria', c: ['#ff9a3d', '#b8236a'], i: 'smile', g: 'Pop' }, { n: 'Chill Vibes', s: 'Tenang & santai', c: ['#2fd1c5', '#2a6fdb'], i: 'moon', g: 'Lo-Fi' },
  { n: 'Workout Playlist', s: 'Elektronik bertenaga', c: ['#ff5a36', '#7a1fa2'], i: 'bars', g: 'Electronic' }, { n: 'Indie Music', s: 'Akustik & indie', c: ['#f2b84b', '#c2512d'], i: 'music', g: 'Acoustic' }
];
const FY = [
  { n: 'Daily Mix', s: 'Mix Favoritmu', c: ['#ffb347', '#d6336c'], i: 'star', get: smartMix },
  { n: 'Chill Vibes', s: 'Tenang & Santai', c: ['#35c8ff', '#2a47c9'], i: 'moon', get: () => A_.get('Lo-Fi') },
  { n: 'Top 50', s: 'Sedang naik', c: ['#c0307a', '#3a1c8c'], i: 'crown', get: async () => (await trend()).slice(0, 50) },
  { n: 'Mood Booster', s: 'Pop ceria', c: ['#ff9a3d', '#b8236a'], i: 'smile', get: () => A_.get('Pop') }
];
const col = (title, get, o = {}) => go('col', { title, get, ...o });

/* ===== HALAMAN ===== */
const HEADPH = `<svg class="hp" viewBox="0 0 120 120"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9fc4ff"/></linearGradient></defs><path d="M22 74V62a38 38 0 0 1 76 0v12" fill="none" stroke="url(#hg)" stroke-width="9" stroke-linecap="round"/><rect x="12" y="68" width="24" height="38" rx="11" fill="url(#hg)"/><rect x="84" y="68" width="24" height="38" rx="11" fill="url(#hg)"/><circle cx="60" cy="40" r="9" fill="#2f8cff" opacity=".85"/></svg>`;
const ROBOT = `<svg viewBox="0 0 160 160"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b9c8ff"/></linearGradient></defs><ellipse cx="80" cy="152" rx="38" ry="6" fill="rgba(0,0,0,.3)"/><rect x="52" y="108" width="56" height="40" rx="20" fill="url(#rg)"/><path d="M30 80a50 50 0 0 1 100 0" fill="none" stroke="#2f8cff" stroke-width="8" stroke-linecap="round"/><rect x="22" y="70" width="17" height="34" rx="8" fill="#2f8cff"/><rect x="121" y="70" width="17" height="34" rx="8" fill="#2f8cff"/><rect x="36" y="42" width="88" height="70" rx="32" fill="url(#rg)"/><rect x="46" y="56" width="68" height="42" rx="20" fill="#0a1230"/><circle cx="65" cy="76" r="7" fill="#5fe0ff"/><circle cx="95" cy="76" r="7" fill="#5fe0ff"/><path d="M72 88q8 6 16 0" stroke="#5fe0ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

const FEATS = [
  { n: 'Smart Recommendation', i: 'star', c: ['#ffc83d', '#e07b00'], f: () => col('Daily Mix', smartMix, { fresh: 1 }) },
  { n: 'Mood Detector', i: 'smile', c: ['#ffd84a', '#f08a00'], f: () => go('mood') },
  { n: 'Playlist Pribadi', i: 'folder', c: ['#b07bff', '#5a3bd6'], f: () => { LIBT = 'pl'; tab('lib') } },
  { n: 'Hidden Playlist', i: 'eyeoff', c: ['#ff6fb0', '#c42a7a'], f: () => go('hidden') },
  { n: 'Replay Stats', i: 'bars', c: ['#4aa8ff', '#1f55d8'], f: () => go('stats') },
  { n: 'Queue Manager', i: 'list', c: ['#35d6c8', '#1f86d8'], f: queueSheet },
  { n: 'Crossfade & Gapless', i: 'layers', c: ['#a56bff', '#5b2fd6'], f: xfSheet },
  { n: 'Mode Offline', i: 'dl', c: ['#59b4ff', '#2a62d8'], f: toggleOff },
  { n: 'Widget Android', i: 'widget', c: ['#78aaff', '#3a5ad8'], f: () => toast('Widget layar utama butuh komponen native Android, belum ada di versi ini') },
  { n: 'Car Mode', i: 'car', c: ['#8aa4ff', '#4a5fd8'], f: openCar },
  { n: 'Bluetooth Control', i: 'bt', c: ['#3a8bff', '#1740c0'], f: btSheet },
  { n: 'Audio Visualizer', i: 'bars', c: ['#5aa0ff', '#7b3bd6'], f: toggleViz }
];
let LIBT = 'pl';
const li = (_, t, s, k, i) => `<div class="li" data-a="${k}"><div class="gi">${ic(i)}</div><div class="mi"><b>${t}</b><span>${esc(s)}</span></div>${ic('right', 's')}</div>`;
const V = {
  home(el) {
    el.innerHTML = `<header class="top"><div class="brand">${logo(36)}<b>Nova<span>Music</span></b></div><button class="ib" id="bell" aria-label="Notifikasi">${ic('bell')}${P.notif && P.nlog.length ? '<i class="dot"></i>' : ''}</button></header>
    <div class="hero" id="hero">${HEADPH}<h2>Enjoy Your<br>Music Journey</h2><button class="pbig" id="hp" aria-label="Putar">${ic('play', 'f')}</button></div>
    <div class="sh"><h3>Untuk Kamu</h3><a id="fa">Lihat Semua ›</a></div><div class="hs" id="fy">${FY.map((c, i) => `<div class="cv" data-i="${i}"><div class="c" style="background:${grad(c.c)}">${ic(c.i, 'f')}<b>${c.n}</b></div><span>${c.s}</span></div>`).join('')}</div>
    <div class="sh"><h3>Sedang Trending</h3><a id="ta">Lihat Semua ›</a></div><div id="tr"><p class="empty">Memuat…</p></div>
    <div class="sh"><h3>Fitur Unggulan Lainnya</h3><a id="fl">Semua ›</a></div>
    <div class="fs glass">${FEATS.map((f, i) => `<button data-i="${i}"><span class="gi" style="background:${grad(f.c)}">${ic(f.i, f.i === 'star' ? 'f' : '')}</span>${f.n}</button>`).join('')}</div>`;
    $('#bell').onclick = bellSheet;
    $('#hero').onclick = safe(async () => play(await trend(), 0));
    $$('#fy .cv').forEach(c => c.onclick = () => { const f = FY[+c.dataset.i]; col(f.n, f.get, { fresh: f.n === 'Daily Mix' }) });
    $('#fa').onclick = () => go('fitur'); $('#fl').onclick = () => go('fitur');
    $('#ta').onclick = () => col('Sedang Trending', trend);
    $$('.fs button', el).forEach(b => b.onclick = () => FEATS[+b.dataset.i].f());
    const load = async () => { try { rows($('#tr'), (await trend()).slice(0, 5), { num: 1 }) } catch (e) { failBox($('#tr'), e, load) } }; load();
  },
  search(el) {
    el.innerHTML = `<header class="top"><h1 style="font-size:26px">Cari</h1><span class="note" style="padding:0">Katalog gabungan</span></header>
    <div class="sb glass">${ic('search')}<input id="q" type="search" placeholder="Cari lagu, artis, atau playlist..." enterkeyhint="search"><button id="mic" class="ib" style="width:34px;height:34px;border:0;background:none" aria-label="Cari dengan suara">${ic('mic')}</button></div>
    <div id="idle"><div class="sh" style="margin-top:6px"><h3>Trending Search 🔥</h3></div><div class="chips">${['Lagu Galau', 'Pop Terbaru', 'DJ Remix', 'Tulus', 'Mahalini', 'Jazz', 'Rock'].map(x => `<button class="chip">${x}</button>`).join('')}</div>
    <div class="sh"><h3>Playlist & Musik Indonesia</h3></div><div class="chips">${['Indonesia Hits', 'Pop Indonesia', 'Dangdut', 'Lagu Daerah', 'Gamelan', 'Keroncong', 'Indie Indonesia'].map(x => `<button class="chip">${x}</button>`).join('')}</div><div class="sh"><h3>Kategori Musik</h3></div><div class="cats">${[['Pop', 'Pop', ['#ff5bd6', '#8a2be2'], 'mic'], ['Rock', 'Rock', ['#ff3b3b', '#7a0d1a'], 'bars'], ['Hip-Hop', 'Hip-Hop/Rap', ['#3a8bff', '#2a2fc0'], 'headphones'], ['EDM', 'Electronic', ['#7b4dff', '#2b1a8a'], 'bars'], ['Jazz', 'Jazz', ['#f0b232', '#8a5a0a'], 'music'], ['K-Pop', '', ['#ff5fa8', '#8a2be2'], 'heart']].map((c, i) => `<div class="cat" data-i="${i}" style="background:${grad(c[2])}">${c[0]}${ic(c[3] === 'headphones' ? 'phones' : c[3], c[3] === 'heart' ? 'f' : '')}</div>`).join('')}</div>
    <div class="sh"><h3>Rekomendasi Playlist</h3></div>${PRESETS.map((p, i) => `<div class="pr" data-i="${i}"><div class="cov" style="background:${grad(p.c)};display:grid;place-items:center;border-radius:15px">${ic(p.i, 'f')}</div><div class="mi"><b>${p.n}</b><span>${p.s}</span></div><button class="pl">${ic('play', 'f')}</button></div>`).join('')}</div>
    <div id="res"></div>`;
    const CATS = [['Pop', 'Pop'], ['Rock', 'Rock'], ['Hip-Hop', 'Hip-Hop/Rap'], ['EDM', 'Electronic'], ['Jazz', 'Jazz'], ['K-Pop', '']];
    $$('.cat', el).forEach(c => c.onclick = () => { const k = CATS[+c.dataset.i]; col(k[0], () => k[1] ? A_.get(k[1]) : A_.get('Semua', 'kpop')) });
    $$('.pr', el).forEach(c => c.onclick = () => { const p = PRESETS[+c.dataset.i]; col(p.n, () => A_.get(p.g)) });
    const q = $('#q'); let tm;
    const run = async v => { const idle = $('#idle'), res = $('#res'); if (!v) { idle.classList.remove('hide'); res.innerHTML = ''; return } idle.classList.add('hide'); res.innerHTML = '<p class="empty">Mencari…</p>'; try { const tr = await searchAll(v); if (q.value.trim() === v) rows(res, tr, { empty: 'Tidak ada hasil untuk "' + esc(v) + '". Coba kata kunci lain atau periksa koneksi internet.' }) } catch (e) { failBox(res, e, () => run(v)) } };
    q.oninput = () => { clearTimeout(tm); const v = q.value.trim(); tm = setTimeout(() => run(v), v ? 450 : 0) };
    q.onkeydown = e => { if (e.key === 'Enter') { clearTimeout(tm); run(q.value.trim()); q.blur() } };
    $$('.chip', el).forEach(c => c.onclick = () => { q.value = c.textContent; run(q.value) });
    $('#mic').onclick = e => listen(v => { q.value = v; run(v) }, e.currentTarget);
  },
  lib(el) {
    const tabs = [['pl', 'Playlist'], ['ar', 'Artis'], ['al', 'Album'], ['po', 'Podcast']];
    el.innerHTML = `<header class="top"><h1 style="font-size:26px">Library</h1><button class="ib" id="lg" aria-label="Pengaturan">${ic('gear')}</button></header><div class="tabs" id="lt">${tabs.map(t => `<button data-k="${t[0]}" class="${t[0] === LIBT ? 'on' : ''}">${t[1]}</button>`).join('')}</div><div id="lc"></div>`;
    $('#lg').onclick = () => tab('set');
    $$('#lt button').forEach(b => b.onclick = () => { LIBT = b.dataset.k; $$('#lt button').forEach(x => x.classList.toggle('on', x === b)); show() });
    const cv = (c, i, f) => `<div class="cov" style="background:${grad(c)};display:grid;place-items:center">${ic(i, f ? 'f' : '')}</div>`;
    function show() {
      const c = $('#lc');
      if (LIBT === 'pl') {
        c.innerHTML = `<div class="gr glass add" id="np"><div class="cov">${ic('plus')}</div><div class="mi"><b>Buat Playlist Baru</b><span>Atur playlist favoritmu</span></div>${ic('right', 's')}</div>
        <div class="gr glass" data-k="fav">${cv(['#6a5cff', '#2f8cff'], 'heart', 1)}<div class="mi"><b>Favorit Saya</b><span>${P.fav.length} lagu</span></div></div>
        <div class="gr glass" data-k="off">${cv(['#2fb86a', '#0f6a3a'], 'dl')}<div class="mi"><b>Lagu Offline</b><span>${P.off.length} lagu</span></div></div>
        ${Object.keys(P.pl).map(n => `<div class="gr glass" data-k="pl" data-n="${esc(n)}"><div class="cov">${P.pl[n][0] ? art(P.pl[n][0]) : cv(['#5a7bff', '#2a2f8a'], 'music')}</div><div class="mi"><b>${esc(n)}</b><span>${P.pl[n].length} lagu</span></div><button class="more" data-m="1" style="width:34px;height:34px;display:grid;place-items:center">${ic('more')}</button></div>`).join('')}
        ${PRESETS.map((p, i) => `<div class="gr glass" data-k="pre" data-i="${i}">${cv(p.c, p.i, 1)}<div class="mi"><b>${p.n}</b><span>Playlist pintar</span></div></div>`).join('')}
        <div class="gr glass" data-k="hid">${cv(['#ff6fb0', '#7a1fa2'], 'lock')}<div class="mi"><b>Hidden Playlist</b><span>Dikunci dengan PIN</span></div></div>`;
        $('#np').onclick = () => ask('Nama playlist baru', 'Mis. Santai sore', n => { P.pl[n] = P.pl[n] || []; save(); show() });
        $$('.gr[data-k]', c).forEach(r => r.onclick = e => {
          const k = r.dataset.k, n = r.dataset.n;
          if (e.target.closest('[data-m]')) return plMenu(n);
          if (k === 'fav') col('Favorit Saya', () => P.fav, { fresh: 1 }); else if (k === 'off') col('Lagu Offline', () => P.off.map(x => ({ ...x, url: conv(x.uri) })), { fresh: 1 });
          else if (k === 'pl') col(n, () => P.pl[n] || [], { fresh: 1 }); else if (k === 'pre') { const p = PRESETS[+r.dataset.i]; col(p.n, () => A_.get(p.g)) } else go('hidden');
        });
      } else if (LIBT === 'ar') {
        const m = {}; [...P.fav, ...P.hist, ...Object.values(P.pl).flat()].forEach(t => { (m[t.artist] = m[t.artist] || { n: 0, t })['n']++ }); P.fol.forEach(a => m[a] = m[a] || { n: 0, t: { title: a, artist: a } });
        const ar = Object.entries(m).sort((a, b) => (P.fol.includes(b[0]) - P.fol.includes(a[0])) || b[1].n - a[1].n);
        c.innerHTML = ar.length ? ar.map(([n, v], i) => `<div class="gr glass" data-i="${i}"><div class="cov" style="border-radius:50%">${art(v.t)}</div><div class="mi"><b>${esc(n)}</b><span>${v.n ? v.n + ' lagu didengar' : 'Diikuti'}</span></div><button class="more" data-f="1" style="width:38px;height:34px;display:grid;place-items:center;color:${P.fol.includes(n) ? 'var(--acc2)' : 'var(--mut)'}">${ic(P.fol.includes(n) ? 'check' : 'plus')}</button></div>`).join('') : '<p class="empty">Artis dari lagu yang kamu dengar atau ikuti muncul di sini.</p>';
        $$('.gr', c).forEach(r => r.onclick = e => { const n = ar[+r.dataset.i][0]; if (e.target.closest('[data-f]')) { follow(n); return show() } col(n, () => A_.get('Semua', n)) });
      } else {
        c.innerHTML = '<p class="empty">Memuat…</p>'; const ld = async () => { try { rows(c, await SRC[LIBT === 'al' ? 'archive' : 'radio'].get(LIBT === 'al' ? 'Semua' : 'Indonesia'), { empty: 'Kosong.' }) } catch (e) { failBox(c, e, ld) } }; ld();
      }
    }
    show();
  },
  set(el) {
    const T = THEMES[P.theme].n;
    el.innerHTML = `<header class="sub-top"><button class="ib" id="bk" aria-label="Beranda">${ic('left')}</button><h1>Pengaturan</h1><div class="hr"><button class="ib" id="hs" aria-label="Cari">${ic('search')}</button></div></header>
    <div class="prof glass" id="pf"><div class="av">${esc((P.name[0] || 'N').toUpperCase())}</div><div class="mi"><b style="font-size:18px">${esc(P.name)}</b><span>Premium Member ${ic('crown', 'f s crown')}</span></div>${ic('right', 's')}</div>
    <div class="box glass">
    ${li('palette', 'Tema Aplikasi', T, 'th', 'sliders')}${li('', 'Kualitas Audio', QUAL[P.qual][0], 'ql', 'vol')}
    <div class="li"><div class="gi">${ic('dl')}</div><div class="mi"><b>Mode Offline</b><span>${P.offm ? 'Aktif · hanya lagu unduhan' : 'Download lagu'}</span></div>${sw('offm', P.offm)}</div>
    ${li('', 'Sleep Timer', timerLabel(), 'tm', 'clock')}
    <div class="li"><div class="gi">${ic('bell')}</div><div class="mi"><b>Notifikasi</b><span>${P.notif ? 'Aktif' : 'Nonaktif'}</span></div>${sw('notif', P.notif)}</div>
    <div class="li"><div class="gi">${ic('mono')}</div><div class="mi"><b>Data Saver</b><span>${P.ds ? 'Hemat kuota aktif' : 'Nonaktif'}</span></div>${sw('ds', P.ds)}</div></div>
    <div class="box glass">${li('', 'AI Music Assistant', 'Cari lagu lewat obrolan atau suara', 'ai', 'star')}${li('', 'Sosial & Komunitas', 'Bagikan, ikuti artis, playlist bersama', 'so', 'users')}${li('', 'Fitur Unggulan Lainnya', 'Mood, Replay Stats, Car Mode, dll.', 'fi', 'layers')}${li('', 'Replay Stats', 'Statistik mendengarmu', 'st', 'bars')}${li('', 'Hidden Playlist', 'Playlist rahasia berkunci PIN', 'hp', 'lock')}</div>
    <div class="box glass">${li('', 'Sumber Musik', 'Audius, Internet Archive, Free To Use + Wikimedia', 'sr', 'music')}${li('', 'Lagu dari HP', 'Putar file MP3/FLAC milikmu', 'lf', 'folder')}${li('', 'Cadangan & Pulihkan', 'Favorit, playlist, artis diikuti', 'bk2', 'share')}${li('', 'Tentang NovaMusic', 'Versi 2.3', 'ab', 'info')}</div>`;
    $('#bk').onclick = () => tab('home'); $('#hs').onclick = () => tab('search');
    $('#pf').onclick = () => ask('Nama profil', 'Namamu', v => { P.name = v.slice(0, 24); save(); render() }, P.name);
    const A2_ = {
      th: () => go('theme'), ql: qualSheet, tm: timerSheet, ai: () => go('ai'), so: () => go('social'), fi: () => go('fitur'), st: () => go('stats'), hp: () => go('hidden'),
      sr: srcSheet, lf: pickLocal, bk2: backupSheet, ab: () => sheet('NovaMusic 2.0', `<p class="note" style="font-size:14px;color:#fff">Pemutar musik bergaya liquid glass. Musik dialirkan dari Audius, Internet Archive, Free To Use, Wikimedia Commons, dan radio internet. Semua data (favorit, playlist, statistik) tersimpan di perangkatmu saja.</p>`)
    };
    $$('.li[data-a]', el).forEach(r => r.onclick = () => A2_[r.dataset.a]());
  },
  col: safe(async (el, a) => {
    el.innerHTML = `${sub(esc(a.title))}<div id="ch"></div><div id="cl"><p class="empty">Memuat…</p></div>`; bindBack(el);
    const load = async () => {
      let tr; try { tr = a.tr || (!a.fresh && COLC[a.title]) || await a.get(); if (!a.fresh) COLC[a.title] = tr } catch (e) { return failBox($('#cl'), e, load) }
      if (!$('#cl')) return;
      $('#ch').innerHTML = `<div class="ph"><div class="t"><b>${esc(a.title)}</b><span>${tr.length} lagu</span></div><button class="ib" id="cs" aria-label="Acak">${ic('shuffle')}</button><button class="pbig" id="cp" aria-label="Putar semua">${ic('play', 'f')}</button></div>`;
      rows($('#cl'), tr, { empty: 'Belum ada lagu di sini.' });
      $('#cp').onclick = () => tr.length && play(tr, 0); $('#cs').onclick = () => { if (tr.length) { S.shuf = true; play(tr, Math.floor(Math.random() * tr.length)) } };
    }; await load();
  }),
  eq(el) {
    el.innerHTML = `${sub('Equalizer')}
    <div class="box glass"><div class="li"><div class="mi"><b>Aktifkan Equalizer</b></div>${sw('eq', P.eq)}</div></div>
    <div class="eqbox glass ${P.eq ? '' : 'dim'}" id="eqb"><div class="tabs eqp" id="pre">${Object.keys(PRE).map(k => `<button data-k="${k}" class="${P.pre === k ? 'on' : ''}">${k}</button>`).join('')}</div>
    <div class="eqs">${BANDS.map((b, i) => `<div class="vs" data-i="${i}"><div class="tk"><div class="fl"></div><div class="th"></div></div><em></em><span>${b[2]}</span></div>`).join('')}</div></div>
    <div class="box glass"><div class="li"><div class="mi"><b>Bass Boost</b></div>${sw('bass', P.bass)}</div><div class="li"><div class="mi"><b>Virtualizer</b></div>${sw('virt', P.virt)}</div><div class="li"><div class="mi"><b>Surround Sound</b></div>${sw('surr', P.surr)}</div><div class="li" id="rs" style="justify-content:center">${ic('reset', 's')}<b>Reset</b></div></div>
    <div class="box glass" style="padding:10px"><canvas class="viz"></canvas></div>
    <p class="note">Equalizer dan efek butuh sumber lagu yang mengizinkannya. Jika tidak, lagu tetap diputar tanpa EQ. Efek terdengar paling jelas dengan earphone.</p>`;
    bindBack(el);
    const paint = () => $$('.vs', el).forEach(s => {
      const i = +s.dataset.i, v = P.eqv[i], pos = (12 - v) / 24 * 100, fl = $('.fl', s), th = $('.th', s);
      th.style.top = pos + '%'; if (v >= 0) { fl.style.top = pos + '%'; fl.style.height = (50 - pos) + '%' } else { fl.style.top = '50%'; fl.style.height = (pos - 50) + '%' }
      $('em', s).textContent = (v > 0 ? '+' : '') + v + ' dB';
    });
    paint();
    $$('.vs .tk', el).forEach(tk => {
      const i = +tk.parentNode.dataset.i, set = e => { const r = tk.getBoundingClientRect(); P.eqv[i] = Math.round(clamp(12 - 24 * (e.clientY - r.top) / r.height, -12, 12)); P.pre = ''; $$('#pre button', el).forEach(b => b.classList.remove('on')); fxApply(); paint() };
      tk.onpointerdown = e => { tk.setPointerCapture(e.pointerId); tk.drag = 1; set(e) }; tk.onpointermove = e => tk.drag && set(e); tk.onpointerup = tk.onpointercancel = () => tk.drag = 0;
    });
    $$('#pre button', el).forEach(b => b.onclick = () => { P.eqv = [...PRE[b.dataset.k]]; P.pre = b.dataset.k; fxApply(); $$('#pre button', el).forEach(x => x.classList.toggle('on', x === b)); paint() });
    $('#rs').onclick = () => { P.eqv = [0, 0, 0, 0, 0]; P.pre = 'Normal'; P.bass = P.virt = P.surr = false; fxApply(); toast('Equalizer direset'); render() };
  },
  theme(el) {
    let sel = P.theme;
    el.innerHTML = `${sub('Tema Aplikasi')}${themeBar()}<p class="note" style="padding:10px 4px">Ketuk tema untuk melihat pratinjau, lalu tekan Terapkan.</p><div class="thg">${Object.entries(THEMES).map(([k, t]) => `<div class="th-c ${k === sel ? 'sel' : ''}" data-k="${k}" style="background:${t.pv}">${t.n}${k === sel ? `<span class="ck">${ic('check')}</span>` : ''}</div>`).join('')}</div><button class="btn blk" id="ap">Terapkan</button>`; bindBack(el);
    $$('.tsw button', el).forEach(b => b.onclick = () => { const c = $(`.th-c[data-k="${b.dataset.k}"]`, el); c && c.click() });
    $$('.th-c', el).forEach(c => c.onclick = () => { sel = c.dataset.k; $$('.tsw button', el).forEach(x => x.classList.toggle('on', x.dataset.k === sel)); $$('.th-c', el).forEach(x => { const on = x === c; x.classList.toggle('sel', on); const k = $('.ck', x); if (k) k.remove(); if (on) x.insertAdjacentHTML('beforeend', `<span class="ck">${ic('check')}</span>`) }); applyTheme(sel) });
    $('#ap').onclick = () => { P.theme = sel; save(); applyTheme(sel); toast('Tema diterapkan'); back() };
  },
  ai(el) {
    el.innerHTML = `${sub('AI Music Assistant')}<div class="bot">${ROBOT}</div><div class="log" id="log"><div class="bub b glass">Halo! ${ic('crown', 'f s crown')}<br>Mau dengerin lagu apa hari ini?</div></div>
    <div class="sug">${['Lagu galau', 'Lagu semangat', 'Musik santai', 'Sesuai mood'].map(x => `<button>${x}</button>`).join('')}</div>
    <div class="vbar glass"><input id="ain" placeholder="Ketik permintaanmu…" enterkeyhint="send"><button class="ib" id="asend" aria-label="Kirim">${ic('right')}</button><button class="micb" id="amic" aria-label="Bicara">${ic('mic')}</button></div>
    <p class="note">Asisten ini membaca kata kunci (galau, semangat, santai, fokus, romantis, trending…). Kata lain dicari sebagai judul lagu atau artis.</p>`; bindBack(el);
    const ask_ = safe(async t => { await aiAsk(t) });
    $$('.sug button', el).forEach(b => b.onclick = () => ask_(b.textContent));
    const send = () => { const v = $('#ain').value.trim(); if (v) { $('#ain').value = ''; ask_(v) } };
    $('#asend').onclick = send; $('#ain').onkeydown = e => e.key === 'Enter' && send(); $('#amic').onclick = e => listen(v => ask_(v), e.currentTarget);
  },
  mood(el) {
    const h = new Date().getHours(), sug = h >= 5 && h < 10 ? 'senang' : h < 15 && h >= 10 ? 'fokus' : h >= 15 && h < 19 ? 'semangat' : 'santai';
    el.innerHTML = `${sub('Mood Detector')}<p class="note" style="font-size:14px;color:#fff;padding-bottom:12px">Berdasarkan waktu sekarang, mood yang cocok: <b>${MOODS[sug].e} ${MOODS[sug].n}</b>. Pilih moodmu, aku carikan lagunya.</p><div class="moods">${Object.entries(MOODS).map(([k, m]) => `<button class="glass ${k === sug ? 'sug1' : ''}" data-k="${k}"><em>${m.e}</em>${m.n}</button>`).join('')}</div>`; bindBack(el);
    $$('.moods button', el).forEach(b => b.onclick = () => { const m = MOODS[b.dataset.k]; col(`Mood · ${m.n}`, () => moodTracks(m)) });
  },
  social(el) {
    el.innerHTML = `${sub('Sosial & Komunitas')}<div class="sh" style="margin-top:0"><h3>Artis Diikuti</h3></div>
    <div class="avs">${P.fol.map(n => `<div class="avi" data-n="${esc(n)}"><div class="av" style="background:linear-gradient(145deg,hsl(${hh(n)},70%,60%),hsl(${hh(n) + 50},70%,30%))">${esc(n[0].toUpperCase())}</div>${esc(n.length > 9 ? n.slice(0, 8) + '…' : n)}</div>`).join('')}<div class="avi" id="fa2"><div class="av" style="background:rgba(255,255,255,.12)">${ic('plus')}</div>Cari</div></div>
    <p class="note">Status teman real-time dan Listening Party butuh server, belum tersedia di versi ini.</p>
    <div class="tiles">
    <button class="tile glass" data-a="party"><span class="gi" style="background:${grad(['#8a6bff', '#3a3ad8'])}">${ic('users')}</span><span><b>Listening Party</b><span>Dengarkan bersama (segera)</span></span></button>
    <button class="tile glass" data-a="share"><span class="gi" style="background:${grad(['#4aa8ff', '#1f55d8'])}">${ic('share')}</span><span><b>Share Music</b><span>Bagikan lagu ke teman</span></span></button>
    <button class="tile glass" data-a="collab"><span class="gi" style="background:${grad(['#7a6bff', '#4a2fd8'])}">${ic('list')}</span><span><b>Collaborative Playlist</b><span>Bagikan lewat kode</span></span></button>
    <button class="tile glass" data-a="follow"><span class="gi" style="background:${grad(['#6a8bff', '#3a4ad8'])}">${ic('user')}</span><span><b>Follow Artist</b><span>Ikuti artis favorit</span></span></button></div>
    <div class="box glass"><div class="li" data-a="import"><div class="gi">${ic('users')}</div><div class="mi"><b>Playlist bersama</b><span>Impor playlist dari kode teman</span></div>${ic('right', 's')}</div><div class="li" data-a="stats"><div class="gi">${ic('bars')}</div><div class="mi"><b>Profil Musik</b><span>Lihat statistik & selera musikmu</span></div>${ic('right', 's')}</div></div>`; bindBack(el);
    $$('.avi[data-n]', el).forEach(a => a.onclick = () => col(a.dataset.n, () => A_.get('Semua', a.dataset.n)));
    $('#fa2').onclick = () => ask('Nama artis', 'Cari artis…', n => col(n, () => A_.get('Semua', n)));
    const act = {
      party: () => toast('Listening Party butuh server real-time, belum tersedia'), share: () => cur() ? shareT(cur()) : toast('Putar lagu dulu untuk membagikannya'),
      collab: () => menu('Collaborative Playlist', [['share', 'Bagikan playlist (buat kode)', sharePlSheet], ['plus', 'Impor dari kode', importPl]]),
      follow: () => cur() ? (follow(cur().artist), render()) : ask('Nama artis', 'Artis yang mau diikuti', n => { follow(n); render() }), import: importPl, stats: () => go('stats')
    };
    $$('[data-a]', el).forEach(b => b.onclick = () => act[b.dataset.a]());
  },
  stats(el) {
    const st = P.st, top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 5), ta = top(st.a), tt = top(st.n), mx = ta[0] ? ta[0][1] : 1;
    el.innerHTML = `${sub('Replay Stats')}<div class="stat"><div class="glass"><b>${Math.round(st.sec / 60)}</b><span>menit mendengarkan</span></div><div class="glass"><b>${Object.values(st.n).reduce((a, b) => a + b, 0)}</b><span>lagu diputar</span></div><div class="glass"><b>${Object.keys(st.a).length}</b><span>artis berbeda</span></div><div class="glass"><b>${P.fav.length}</b><span>lagu favorit</span></div></div>
    <div class="sh" style="margin-top:6px"><h3>Artis Teratas</h3></div><div class="box glass" style="padding:6px 14px">${ta.map(([n, c]) => `<div style="padding:9px 0"><div style="display:flex;justify-content:space-between"><b>${esc(n)}</b><span class="note" style="padding:0">${c}×</span></div><div class="bar"><i style="width:${c / mx * 100}%"></i></div></div>`).join('') || '<p class="empty">Putar beberapa lagu dulu.</p>'}</div>
    <div class="sh"><h3>Lagu Teratas</h3></div>${tt.map(([id, c], i) => { const t = st.t[id] || { title: id, artist: '' }; return `<div class="tr"><em class="n">${i + 1}</em><div class="cov">${art(t)}</div><div class="mi"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div><span class="tag">${c}×</span></div>` }).join('') || '<p class="empty">Belum ada data.</p>'}
    <button class="btn g2 blk" id="rst" style="margin-top:10px">Reset statistik</button>`; bindBack(el);
    $('#rst').onclick = () => { P.st = { sec: 0, n: {}, a: {}, t: {} }; save(); render() };
  },
  fitur(el) {
    el.innerHTML = `${sub('Fitur Unggulan')}<div class="fg">${FEATS.map((f, i) => `<button class="fgt glass" data-i="${i}"><span class="gi" style="background:${grad(f.c)}">${ic(f.i, f.i === 'star' ? 'f' : '')}</span>${f.n}</button>`).join('')}</div>`; bindBack(el);
    $$('.fgt', el).forEach(b => b.onclick = () => FEATS[+b.dataset.i].f());
  },
  hidden(el) {
    el.innerHTML = `${sub('Hidden Playlist')}<div id="hb"></div>`; bindBack(el);
    const draw = () => {
      const ks = Object.keys(P.hid);
      $('#hb').innerHTML = `<button class="btn blk" id="hn" style="margin-bottom:10px">${ic('plus', 's')} Buat Hidden Playlist</button>` + (ks.map(n => `<div class="gr glass" data-n="${esc(n)}"><div class="cov" style="display:grid;place-items:center;background:${grad(['#ff6fb0', '#7a1fa2'])}">${ic('lock')}</div><div class="mi"><b>${esc(n)}</b><span>${P.hid[n].length} lagu</span></div><button class="more" data-m="1" style="width:34px;height:34px;display:grid;place-items:center">${ic('more')}</button></div>`).join('') || '<p class="empty">Belum ada playlist tersembunyi. Sembunyikan playlist lewat menu ⋮ di Library.</p>');
      $('#hn').onclick = () => ask('Nama hidden playlist', 'Nama', n => { P.hid[n] = P.hid[n] || []; save(); draw() });
      $$('.gr', $('#hb')).forEach(r => r.onclick = e => {
        const n = r.dataset.n; if (e.target.closest('[data-m]')) return menu(n, [['eyeoff', 'Tampilkan kembali di Library', () => { P.pl[n] = P.hid[n]; delete P.hid[n]; save(); draw() }], ['trash', 'Hapus playlist', () => { delete P.hid[n]; save(); draw() }, 'bad']]);
        col(n, () => P.hid[n] || [], { fresh: 1 })
      });
    };
    if (S.unl) return draw();
    $('#hb').innerHTML = `<div class="empty">${ic('lock', 'l')}<p style="margin-top:8px">${P.pin ? 'Masukkan PIN untuk membuka playlist tersembunyi.' : 'Buat PIN 4 digit untuk mengunci playlist tersembunyi.'}</p><button class="btn" id="hu">${P.pin ? 'Buka' : 'Buat PIN'}</button></div>`;
    $('#hu').onclick = () => pinFlow(draw);
  }
};
const COLC = {};
const hashPin = v => String([...v].reduce((a, c) => (a * 31 + c.charCodeAt(0) + 7919) >>> 0, 7));
function pinFlow(cb) {
  if (S.unl) return cb();
  if (!P.pin) return ask('Buat PIN 4 digit', '••••', v => { if (!/^\d{4}$/.test(v)) return toast('PIN harus 4 angka'); P.pin = hashPin(v); S.unl = 1; save(); toast('PIN dibuat'); cb() }, '', 'password');
  ask('Masukkan PIN', '••••', v => { if (hashPin(v) === P.pin) { S.unl = 1; cb() } else toast('PIN salah') }, '', 'password');
}
function plMenu(n) {
  menu(n, [['play', 'Putar', () => P.pl[n].length && play(P.pl[n], 0)], ['pencil', 'Ubah nama', () => ask('Nama baru', 'Nama playlist', v => { if (v !== n) { P.pl[v] = P.pl[n]; delete P.pl[n]; save(); render() } }, n)],
  ['lock', 'Sembunyikan (Hidden Playlist)', () => pinFlow(() => { P.hid[n] = P.pl[n]; delete P.pl[n]; save(); render(); toast('Dipindah ke Hidden Playlist') })], ['share', 'Bagikan lewat kode', () => sharePlSheet(n)], ['trash', 'Hapus playlist', () => { delete P.pl[n]; save(); render() }, 'bad']]);
}
const b64 = s => btoa(unescape(encodeURIComponent(s))), unb64 = s => decodeURIComponent(escape(atob(s)));
function sharePlSheet(name) {
  const go_ = n => { const code = b64(JSON.stringify({ n, t: (P.pl[n] || []).slice(0, 60).map(({ id, title, artist, art, dur, url }) => ({ id, title, artist, art, dur, url })) })); sheet('Kode playlist: ' + esc(n), `<textarea class="inp" id="pcode" rows="4" readonly style="font:11px monospace">${code}</textarea><button class="btn blk" id="cpy">Salin kode</button><p class="note">Kirim kode ini ke temanmu, lalu mereka pilih "Impor dari kode".</p>`, el => $('#cpy', el).onclick = async () => { try { await navigator.clipboard.writeText(code); toast('Kode disalin') } catch (e) { $("#pcode").select(); toast('Salin teks di kotak secara manual') } }) };
  if (typeof name === 'string') return go_(name);
  const ks = Object.keys(P.pl); if (!ks.length) return toast('Belum ada playlist untuk dibagikan');
  menu('Pilih playlist', ks.map(n => ['list', n, () => go_(n)]));
}
function importPl() {
  ask('Tempel kode playlist', 'Kode dari temanmu', v => { try { const d = JSON.parse(unb64(v)); if (!d.n || !Array.isArray(d.t)) throw 0; const p = P.pl[d.n] = P.pl[d.n] || []; d.t.forEach(t => { if (t.id && !p.some(x => x.id === t.id)) p.push(t) }); save(); toast(`Playlist "${d.n}" diimpor (${d.t.length} lagu)`) } catch (e) { toast('Kode tidak valid') } });
}
function bellSheet() {
  sheet('Notifikasi', !P.notif ? '<p class="empty">Notifikasi dimatikan di Pengaturan.</p>' : P.nlog.length ? P.nlog.map(n => `<div class="qrow"><div class="mi"><b style="white-space:normal">${esc(n.m)}</b><span>${new Date(n.t).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span></div></div>`).join('') + '<button class="btn g2 blk" id="nc" style="margin-top:10px">Bersihkan</button>' : '<p class="empty">Belum ada notifikasi.</p>',
    el => { const b = $('#nc', el); if (b) b.onclick = () => { P.nlog = []; save(); closeSheet(); render() } });
}
const qualSheet = () => menu('Kualitas Audio', Object.entries(QUAL).map(([k, v]) => ['vol', v[0], () => { P.qual = k; save(); ui(); toast('Pengaturan kualitas tersimpan'); render() }, P.qual === k]));
function srcSheet() {
  sheet('Sumber Musik', `<p class="note">Pencarian terpadu otomatis mencari Audius, Internet Archive, Free To Use, dan Wikimedia Commons. Sumber audio terbuka memiliki lisensi yang berbeda-beda; periksa lisensi tiap lagu sebelum membagikan aplikasi.</p><label class="note" for="ytk">YouTube Data API key (opsional)</label><input class="inp" id="ytk" autocomplete="off" placeholder="YouTube API key" value="${esc(P.ytkey)}"><button class="btn blk" id="sj">Simpan pengaturan sumber</button>`,
    el => { $('#sj', el).onclick = () => { P.ytkey = $('#ytk').value.trim(); delete P.jid; save(); toast('Pengaturan sumber tersimpan'); closeSheet(); render() } });
}
function pickLocal() { const f = document.createElement('input'); f.type = 'file'; f.accept = 'audio/*'; f.multiple = true; f.onchange = () => { const a = [...f.files]; if (a.length) play(a.map((x, i) => ({ id: 'l' + i + x.name, title: x.name.replace(/\.[^.]+$/, ''), artist: 'Dari HP', art: '', dur: 0, url: URL.createObjectURL(x), noeq: false })), 0) }; f.click() }
function backupSheet() {
  sheet('Cadangan & Pulihkan', `<textarea class="inp" id="bt" rows="5" placeholder="Teks cadangan" style="font:11px monospace"></textarea><button class="btn" id="bk1">Salin cadangan</button> <button class="btn g2" id="rs1">Pulihkan</button>`, el => {
    $('#bk1', el).onclick = async () => { const j = JSON.stringify({ fav: P.fav, pl: P.pl, fol: P.fol }); $('#bt').value = j; try { await navigator.clipboard.writeText(j); toast('Cadangan disalin') } catch (e) { toast('Salin teks di kotak secara manual') } };
    $('#rs1', el).onclick = () => { try { const d = JSON.parse($('#bt').value); (d.fav || []).forEach(t => { if (!P.fav.some(x => x.id === t.id)) P.fav.push(t) }); (d.fol || []).forEach(a => { if (!P.fol.includes(a)) P.fol.push(a) }); Object.keys(d.pl || {}).forEach(n => { const p = P.pl[n] = P.pl[n] || []; d.pl[n].forEach(t => { if (!p.some(x => x.id === t.id)) p.push(t) }) }); save(); toast('Berhasil dipulihkan') } catch (e) { toast('Format cadangan tidak valid') } };
  });
}
function listen(cb, btn) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return toast('Pengenalan suara belum didukung di perangkat ini. Ketik saja permintaanmu.');
  const r = new SR(); r.lang = 'id-ID'; btn && btn.classList.add('rec'); r.onresult = e => cb(e.results[0][0].transcript); r.onerror = () => toast('Suara tidak terdeteksi'); r.onend = () => btn && btn.classList.remove('rec'); try { r.start() } catch (e) { }
}

/* ----- AI Assistant (berbasis kata kunci) ----- */
const INTENT = [[/galau|sedih|patah|kecewa|nangis|\bsad\b/, 'sedih'], [/semangat|energi|olahraga|gym|workout|lari|\bparty\b/, 'semangat'], [/santai|chill|tenang|tidur|rileks|relax/, 'santai'], [/fokus|belajar|kerja|study|konsentrasi/, 'fokus'], [/romantis|cinta|love|pacar|sayang/, 'romantis'], [/senang|bahagia|happy|ceria/, 'senang'], [/mood|perasaan|suasana/, 'MOOD'], [/trending|populer|hits|viral|top/, 'trend'], [/rekomendasi|saran|acak|terserah|favorit/, 'rec']];
async function aiAsk(text) {
  const log = $('#log'); if (!log) return;
  const add = (cls, h) => { const d = document.createElement('div'); d.className = 'bub ' + cls; d.innerHTML = h; log.appendChild(d); d.scrollIntoView({ block: 'center', behavior: 'smooth' }); return d };
  add('u', esc(text)); const k = (INTENT.find(i => i[0].test(text.toLowerCase())) || [])[1];
  if (k === 'MOOD') { add('b glass', 'Oke, pilih moodmu dulu ya.'); return go('mood') }
  const w = add('b glass', 'Sebentar, aku cari dulu…'); let tr, label;
  if (MOODS[k]) { tr = await moodTracks(MOODS[k]); label = `lagu ${MOODS[k].n.toLowerCase()} ${MOODS[k].e}` }
  else if (k === 'trend') { tr = await trend(); label = 'lagu yang lagi trending 🔥' }
  else if (k === 'rec') { tr = await smartMix(); label = 'mix dari seleramu ✨' }
  else { tr = await A_.get('Semua', text); label = `hasil untuk "${esc(text)}"` }
  if (!tr.length) { w.innerHTML = 'Belum ketemu. Coba kata lain, ya.'; return }
  w.innerHTML = `Ini ${label}:`; const r = add('b res glass', '<div id="air"></div><button class="btn blk" id="aip" style="margin:6px 0">Putar semua</button>');
  const box = $('#air', r); box.removeAttribute('id'); rows(box, tr.slice(0, 5)); const pb = $('#aip', r); pb.removeAttribute('id'); pb.onclick = () => play(tr, 0); r.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

/* ===== INISIALISASI ===== */
function build() {
  $('#nav').innerHTML = [['home', 'Home', 'home'], ['search', 'Search', 'search'], ['lib', 'Library', 'music'], ['set', 'Profile', 'user']].map(t => `<button data-t="${t[0]}">${ic(t[2])}<span>${t[1]}</span></button>`).join('');
  navInit();
  $('#mini').innerHTML = `<div class="mcov"><div class="rg"></div><div class="cov nArt"></div><span class="mpp"></span></div><div class="mi"><b class="nT"></b><span class="nA"></span></div><button class="mb n bplay" aria-label="Putar">${ic('play', 'f')}</button><button class="mb n bnext" aria-label="Berikutnya">${ic('next', 'f')}</button><button class="mb c" id="mfol" aria-label="Ikuti artis">${ic('user')}</button><button class="mb c" id="madd" aria-label="Tambah ke playlist">${ic('plus')}</button><button class="mb c bfav" aria-label="Favorit">${ic('heart')}</button><div id="mbar"><i></i></div>`;
  $('#nav').insertAdjacentHTML('beforeend', `<button class="ncol" aria-label="Menu">${ic('home')}</button>`);
  $('.mcov').onclick = e => { if ($('#app').classList.contains('col')) { e.stopPropagation(); toggle() } };
  $('#mfol').onclick = () => cur() && follow(cur().artist); $('#madd').onclick = () => cur() && addToPl(cur());
  $('.ncol').onclick = () => { if (R.stack.length) return tab('home'); colS.force = true; updateCol() };
  $('#mini').onclick = e => { if (!e.target.closest('button') && !$('#mini').dataset.skipClick) openOv('full') };
  // Swipe mini-player: geser kiri/kanan dengan efek spring, lalu snap dan ganti lagu.
  (() => {
    const mini = $('#mini'); if (!mini) return;
    const st = {drag:false, x:0, sx:0, last:0, vx:0, moved:false};
    const reset = () => { mini.classList.remove('is-dragging','swipe-settle'); mini.style.transform=''; st.drag=false; st.moved=false; };
    mini.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      st.drag=true; st.moved=false; st.sx=e.clientX; st.last=e.clientX; st.vx=0;
      mini.classList.add('is-dragging');
      try { mini.setPointerCapture(e.pointerId); } catch (_) {}
    });
    mini.addEventListener('pointermove', e => {
      if (!st.drag) return;
      const dx=e.clientX-st.sx; st.vx=e.clientX-st.last; st.last=e.clientX;
      if (Math.abs(dx)>6) st.moved=true;
      const damp=Math.sign(dx)*Math.min(92,Math.abs(dx)*0.72);
      mini.style.transform=`translate3d(${damp}px,0,0) scale(${1-Math.min(.025,Math.abs(damp)/4000)})`;
    });
    const end = () => {
      if (!st.drag) return; st.drag=false; mini.classList.remove('is-dragging');
      const dx=st.last-st.sx;
      if (Math.abs(dx)>55 || Math.abs(st.vx)>1.4) {
        const dir=dx<0?'next':'prev';
        mini.classList.add(dir==='next'?'swipe-next':'swipe-prev');
        mini.style.transform='';
        setTimeout(() => { if (dir==='next') next(); else prev(); mini.classList.remove('swipe-next','swipe-prev'); }, 120);
      } else {
        mini.classList.add('swipe-settle'); mini.style.transform='';
        setTimeout(()=>mini.classList.remove('swipe-settle'),520);
      }
      if (st.moved) mini.dataset.skipClick='1';
      setTimeout(()=>delete mini.dataset.skipClick,80);
    };
    mini.addEventListener('pointerup', end); mini.addEventListener('pointercancel', end);
  })();

  $('#full').innerHTML = `<div class="pbg"></div><div class="deco"></div>
    <div class="phd"><button class="phb" id="fc" aria-label="Tutup">${ic('left')}</button><div class="phc"><b>Sedang Diputar</b><span class="nA"></span></div><button class="phb" id="fc2" aria-label="Perkecil">${ic('down')}</button></div>
    <div class="pa"><div class="nArt" style="position:absolute;inset:0"></div><button class="amore" id="amore" aria-label="Menu lainnya">${ic('expand')}</button></div>
    <div class="pt"><div class="mi"><b class="nT"></b><span class="nA"></span></div><button class="ib bfav" aria-label="Favorit" style="border:0;background:none">${ic('heart')}</button></div>
    ${seekw()}${ctrls()}<canvas class="viz" data-p="1"></canvas>
    <div class="pbar glass"><button class="bq">${ic('list', 's')}<span>Antrean</span></button><button class="btmr">${ic('clock', 's')}<span>Waktu tidur</span></button><button id="lyo">${ic('lyric', 's')}<span>Lirik</span></button></div>`;
  $('#lyr').innerHTML = `<div class="pbg" style="background:radial-gradient(circle at 50% 0,var(--acc),transparent 70%)"></div>
    <div class="sub-top"><button class="ib" id="lyc" aria-label="Kembali">${ic('left')}</button><h1>Lirik</h1><div class="hr"></div></div>
    <div class="tr" style="cursor:default"><div class="cov nArt" style="width:56px;height:56px"></div><div class="mi"><b class="nT" style="font-size:17px"></b><span class="nA"></span></div></div>
    <div id="lb"></div>${seekw()}${ctrls()}
    <div class="lsync"><span>Sinkronisasi lirik</span>${sw('lsync', LYS.sync)}</div>`;
  $('#car').innerHTML = `<div class="row2"><button class="ib" id="cc" aria-label="Tutup">${ic('x')}</button><b>Car Mode</b><span style="width:40px"></span></div>
    <div class="carv"><div class="pa nArt" style="position:relative;width:min(46vw,200px);margin:0 auto;border-radius:26px"></div><div class="mi"><b class="nT"></b><span class="nA"></span></div>${seekw()}${ctrls()}</div>`;
  $('#fc').onclick = back; $('#fc2').onclick = back; $('#amore').onclick = moreSheet; decoBuild(); $('#lyc').onclick = back; $('#cc').onclick = () => { try { wakeL.l && wakeL.l.release() } catch (e) { } back() };
  $('#lyo').onclick = () => { openOv('lyr'); loadLyrics() };
}
/* ----- gelembung navigasi yang bisa digeser ----- */
function navInit() {
  const nav = $('#nav'), bs = $$('#nav button'), TABS = ['home', 'search', 'lib', 'set'], bub = document.createElement('div'); bub.className = 'nb'; nav.prepend(bub);
  const st = { x: 6, v: 0, t: 6, w: 0, drag: false, raf: 0, rx: 0 };
  const geom = () => { st.w = (nav.clientWidth - 12) / 4; bub.style.width = st.w + 'px' }, posOf = i => 6 + i * st.w, idxAt = x => clamp(Math.round((x - 6) / st.w), 0, 3);
  function paint() {
    const sx = 1 + clamp(Math.abs(st.v) / 38, 0, .38) + (st.drag ? .1 : 0), sy = 1 + (st.drag ? .06 : 0) - clamp(Math.abs(st.v) / 120, 0, .12);
    bub.style.transform = `translateX(${st.x}px) scale(${sx},${sy})`; const n = idxAt(st.x); bs.forEach((b, i) => b.classList.toggle('on', i === n));
  }
  function loop() {
    cancelAnimationFrame(st.raf);
    const f = () => {
      if (st.drag) { const nx = st.x + (st.t - st.x) * .38; st.v = nx - st.x; st.x = nx } else { st.v += (st.t - st.x) * .2; st.v *= .7; st.x += st.v }
      paint();
      if (!st.drag && Math.abs(st.v) < .05 && Math.abs(st.t - st.x) < .3) { st.x = st.t; st.v = 0; paint(); return }
      st.raf = requestAnimationFrame(f);
    }; st.raf = requestAnimationFrame(f);
  }
  navSync = snap => { if (st.drag || nav.clientWidth < 150) return; geom(); st.t = posOf(Math.max(0, TABS.indexOf(R.tab))); if (snap || !st.moved0) { st.x = st.t; st.v = 0; st.moved0 = 1; paint() } else loop() };
  const setT = cx => { st.t = clamp(cx - st.rx - st.w / 2, 6, 6 + 3 * st.w) };
  nav.onpointerdown = e => { if ($('#app').classList.contains('col')) return; geom(); try { nav.setPointerCapture(e.pointerId) } catch (_) { } st.drag = true; st.rx = nav.getBoundingClientRect().left; setT(e.clientX); loop() };
  nav.onpointermove = e => { if (st.drag) setT(e.clientX) };
  nav.onpointerup = () => { if (!st.drag) return; st.drag = false; const n = idxAt(st.t); st.t = posOf(n); loop(); if (TABS[n] !== R.tab || R.stack.length) tab(TABS[n]) };
  nav.onpointercancel = () => { st.drag = false; navSync() };
  bs.forEach((b, i) => b.onclick = e => { if (e.detail === 0) tab(TABS[i]) });
  addEventListener('resize', () => { if (nav.clientWidth < 150) return; geom(); st.x = st.t = posOf(Math.max(0, TABS.indexOf(R.tab))); paint() });
}

/* ----- bar bawah mengecil saat scroll ke bawah ----- */
$('#view').addEventListener('scroll', () => {
  const view = $('#view'), y = view.scrollTop, dy = y - colS.y; colS.y = y;
  // Hero mengecil saat scroll turun dan kembali membesar saat scroll naik.
  const hero = $('#hero');
  if (hero && R.tab === 'home' && !R.stack.length) {
    const p = Math.max(0, Math.min(1, y / 230));
    hero.style.setProperty('--hero-scale', (1 - p * .105).toFixed(3));
    hero.style.setProperty('--hero-y', (p * -13).toFixed(1) + 'px');
    hero.style.setProperty('--hero-fade', (1 - p * .12).toFixed(3));
  }
  if (y < 24) { if (colS.scroll || colS.force) { colS.scroll = false; colS.force = false; updateCol() } return }
  if (dy > 6 && (!colS.scroll || colS.force)) { colS.scroll = true; colS.force = false; updateCol() }
  else if (dy < -6 && colS.scroll) { colS.scroll = false; colS.force = false; updateCol() }
}, { passive: true });
const hue = (r, g, b) => { r /= 255; g /= 255; b /= 255; const x = Math.max(r, g, b), n = Math.min(r, g, b), d = x - n; if (!d) return 260; const h = x === r ? ((g - b) / d) % 6 : x === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round((h * 60 + 360) % 360) };
function miniTint(t) {
  const m = $('#mini'); m.style.setProperty('--mh', hh(t.title + t.artist)); if (!t.art) return;
  const im = new Image(); im.crossOrigin = 'anonymous';
  im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 8, 8); const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 30) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++ } } if (n && cur() && cur().id === t.id) m.style.setProperty('--mh', hue(r / n, g / n, b / n)) } catch (e) { } };
  im.src = t.art;
}

/* ----- animasi muncul saat scroll (naik & turun) ----- */
const REV = '.tr,.gr,.cv,.cat,.fgt,.tile,.box,.prof,.pr,.sh,.hero,.stat>div,.th-c,.moods button,.chips .chip,.eqbox,.avi,.fs,.ph,.bub,.top';
let sdir = 1, sl = 0;
const io = new IntersectionObserver(es => {
  let i = 0; es.forEach(e => {
    const t = e.target;
    if (e.isIntersecting) { if (!t.classList.contains('in')) { t.style.setProperty('--dy', (sdir > 0 ? 34 : -34) + 'px'); t.style.setProperty('--d', Math.min(i++, 8) * 45 + 'ms'); t.classList.add('in') } }
    else t.classList.remove('in');
  });
}, { root: $('#view'), rootMargin: '0px 0px -3% 0px', threshold: .04 });
function revReset() { io.disconnect(); sdir = 1; sl = 0 }
const revWatch = n => { if (n.nodeType !== 1) return; if (n.matches(REV)) { n.classList.add('rv'); io.observe(n) } n.querySelectorAll(REV).forEach(x => { x.classList.add('rv'); io.observe(x) }) };
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(revWatch))).observe($('#view'), { childList: true, subtree: true });
$('#view').addEventListener('scroll', () => { const y = $('#view').scrollTop; if (Math.abs(y - sl) > 2) { sdir = y > sl ? 1 : -1; sl = y } }, { passive: true });

const SWF = {
  eq: v => { setEq(v); const b = $('#eqb'); if (b) b.classList.toggle('dim', !v) },
  bass: v => { P.bass = v; fxApply(); if (!P.eq) toast('Aktifkan Equalizer agar efek terdengar') },
  virt: v => { P.virt = v; fxApply(); if (!P.eq) toast('Aktifkan Equalizer agar efek terdengar') },
  surr: v => { P.surr = v; fxApply(); if (!P.eq) toast('Aktifkan Equalizer agar efek terdengar') },
  offm: v => { P.offm = v; save(); notify(v ? 'Mode Offline diaktifkan' : 'Mode Offline dimatikan'); keepScroll() }, notif: v => { P.notif = v; save(); keepScroll() }, ds: v => { P.ds = v; save(); TRN = null; keepScroll() },
  lsync: v => { LYS.sync = v }
};
const keepScroll = () => { const y = $('#view').scrollTop; render(); $('#view').scrollTop = y };
document.addEventListener('click', e => {
  const s = e.target.closest('.sw'); if (s) { const nv = !s.classList.contains('on'); s.classList.toggle('on', nv); s.setAttribute('aria-checked', nv); return SWF[s.dataset.sw](nv) }
  const b = e.target.closest('button'); if (!b) return; const c = b.classList;
  if (c.contains('bplay')) toggle(); else if (c.contains('bnext')) next(); else if (c.contains('bprev')) prev();
  else if (c.contains('bshuf')) { S.shuf = !S.shuf; ui() } else if (c.contains('brep')) { S.rep = (S.rep + 1) % 3; ui() }
  else if (c.contains('bfav')) cur() && favT(cur()); else if (c.contains('bdl')) dl(); else if (c.contains('bshare')) cur() && shareT(cur());
  else if (c.contains('bq')) queueSheet(); else if (c.contains('btmr')) timerSheet(); else if (c.contains('bap')) cur() && addToPl(cur());
  else if (c.contains('beq')) unwind(() => go('eq')); else if (c.contains('bcar')) openCar();
});
document.addEventListener('input', e => { const s = e.target; if (s.classList && s.classList.contains('seek') && A.duration && isFinite(A.duration)) { s.drag = 1; A.currentTime = s.value / 1000 * A.duration; s.style.setProperty('--p', s.value / 10 + '%'); clearTimeout(s._d); s._d = setTimeout(() => s.drag = 0, 300) } });
build(); ui(); render(); updateCol();

/* ----- startup splash: logo + loading animation ----- */
(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const started = performance.now();
  const finish = () => {
    const wait = Math.max(0, 850 - (performance.now() - started));
    setTimeout(() => splash.classList.add('done'), wait);
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
  setTimeout(finish, 1600);
})();
