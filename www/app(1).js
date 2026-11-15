const APP='MusikGlass',$=s=>document.querySelector(s);
const A1=new Audio(),A2=new Audio();A2.crossOrigin='anonymous';let A=A1;
let HOST='https://api.audius.co';
const L=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const S={q:[],i:-1,shuf:false,rep:0,off:L('off',[]),eqv:L('eqv',[0,0,0,0,0]),eq:localStorage.getItem('eq')==='1',fav:L('fav',[]),hist:L('hist',[]),pl:L('pl',{}),src:localStorage.getItem('src')||'audius',jid:localStorage.getItem('jid')||''};
const save=()=>['fav','hist','pl','off'].forEach(k=>localStorage.setItem(k,JSON.stringify(S[k])));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=s=>isFinite(s)&&s>0?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'';
const enc=encodeURIComponent,J=async u=>(await fetch(u)).json();
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};

/* ===== SUMBER MUSIK ===== */
const ok=t=>t.is_streamable!==false&&!t.is_stream_gated&&!t.is_delete&&(t.duration||0)>60;
const aud=async p=>(await J(`${HOST}/v1${p}${p.includes('?')?'&':'?'}app_name=${APP}`)).data;
const an=t=>({id:t.id,title:t.title,artist:t.user.name,art:t.artwork?(t.artwork['480x480']||t.artwork['150x150']||''):'',dur:t.duration});
const RB='https://de1.api.radio-browser.info/json/stations/search?limit=40&hidebroken=true&order=clickcount&reverse=true';
const SRC={
 audius:{n:'Audius',g:['Semua','Pop','Electronic','Hip-Hop/Rap','Rock','Lo-Fi','Ambient','R&B/Soul','Jazz','Metal','Latin','Reggae','Acoustic','Classical','Country','Folk'],
  async get(g,q){const d=q?await aud('/tracks/search?limit=40&query='+enc(q)):await aud('/tracks/trending?limit=40'+(g!=='Semua'?'&genre='+enc(g):''));return d.filter(ok).map(an)}},
 jamendo:{n:'Jamendo',g:['Semua','pop','rock','electronic','hiphop','jazz','lounge','classical','ambient','metal','reggae','folk'],
  async get(g,q){if(!S.jid)throw'key';
   const u=`https://api.jamendo.com/v3.0/tracks/?client_id=${enc(S.jid)}&format=json&limit=40&audioformat=mp32&imagesize=300&`+(q?'search='+enc(q):'order=popularity_week'+(g!=='Semua'?'&tags='+g:''));
   return (await J(u)).results.map(t=>({id:'j'+t.id,title:t.name,artist:t.artist_name,art:t.image,dur:t.duration,url:t.audio}))}},
 archive:{n:'Archive',g:['Semua','jazz','rock','classical','folk','blues','live'],
  async get(g,q){const qs=(q?`(${q}) AND `:'')+'mediatype:audio'+(g!=='Semua'?` AND subject:(${g})`:'');
   const d=(await J(`https://archive.org/advancedsearch.php?q=${enc(qs)}&fl[]=identifier&fl[]=title&fl[]=creator&rows=40&sort[]=downloads+desc&output=json`)).response.docs;
   return d.map(x=>({id:x.identifier,title:x.title,artist:[].concat(x.creator||'Internet Archive')[0],art:`https://archive.org/services/img/${x.identifier}`,dur:0,album:x.identifier}))}},
 radio:{n:'Radio',g:['Indonesia','Dunia','Pop','Dangdut','Rock','Jazz','K-pop','Dance'],
  async get(g,q){const u=RB+(q?'&name='+enc(q):g==='Indonesia'?'&countrycode=ID':g==='Dunia'?'':'&tag='+enc(g.toLowerCase()));const seen={};
   return (await J(u)).filter(s=>!seen[s.name.trim()]&&(seen[s.name.trim()]=1)).map(s=>({id:'r'+s.stationuuid,title:s.name.trim(),artist:(s.tags||s.country||'Radio').split(',').slice(0,2).join(', '),art:s.favicon,dur:0,url:s.url_resolved,live:true}))}}
};
async function openAlbum(t){
  toast('Membuka album…');
  try{const m=await J(`https://archive.org/metadata/${t.album}`);let f=m.files.filter(x=>/\.mp3$/i.test(x.name));
   const v=f.filter(x=>x.format==='VBR MP3');if(v.length)f=v;
   if(!f.length)return toast('Tidak ada file MP3 di item ini');
   play(f.map(x=>{const l=String(x.length||'0');const d=l.includes(':')?l.split(':').reduce((a,b)=>a*60+ +b,0):parseFloat(l);
    return{id:t.album+x.name,title:x.title||x.name.replace(/\.mp3$/i,''),artist:x.creator||t.artist,art:t.art,dur:d,url:`https://archive.org/download/${t.album}/${enc(x.name)}`}}),0)
  }catch(e){toast('Gagal membuka album')}
}
async function pickHost(){try{const h=(await J('https://api.audius.co')).data;HOST=h[Math.floor(Math.random()*h.length)]}catch(e){}}

/* ===== DAFTAR & PEMUTAR ===== */
function list(el,tr){
  el.innerHTML=tr.map((t,i)=>`<div class="row glass" data-i="${i}"><img src="${t.art||''}" alt="" onerror="this.style.visibility='hidden'"><div><b${cur()&&cur().id===t.id?' class="g"':''}>${esc(t.title)}</b><span>${esc(t.artist)}</span></div><em>${t.album?'Album':t.live?'LIVE':fmt(t.dur)}</em>${t.album?'':'<button class="qa">＋</button>'}</div>`).join('')||'<p class="empty">Belum ada lagu di sini.</p>';
  el.querySelectorAll('.row').forEach(r=>r.onclick=e=>{const t=tr[+r.dataset.i];if(e.target.classList.contains('qa'))return addQ(t);t.album?openAlbum(t):play(tr,+r.dataset.i)});
}
async function fill(el,g,q){
  el.innerHTML='<p class="empty">Memuat…</p>';
  try{list(el,await SRC[S.src].get(g,q))}
  catch(e){el.innerHTML=e==='key'?'<p class="empty">Jamendo butuh client ID. Isi di tab Setelan.</p>':'<p class="empty">Gagal memuat. Cek internet atau coba sumber lain.</p>'}
}
const chips=(a,cls)=>`<div class="chips">${a.map((x,i)=>`<button data-v="${esc(x[0])}" class="${x[1]?'on':''}">${esc(x[2])}</button>`).join('')}</div>`;
const srcChips=()=>chips(Object.keys(SRC).map(k=>[k,k===S.src,SRC[k].n]));
function bind(el,fn){el.querySelectorAll('button').forEach(b=>b.onclick=()=>{el.querySelectorAll('.on').forEach(x=>x.classList.remove('on'));b.classList.add('on');fn(b.dataset.v)})}
const setSrc=(k,re)=>{S.src=k;localStorage.setItem('src',k);re()};

const cur=()=>S.q[S.i];
function play(q,i){S.q=[...q];S.i=i;loadTrack()}
function loadTrack(){
  const t=cur();if(!t)return;
  const want=S.eq&&!t.noeq?A2:A1;
  if(want!==A){const o=A;A=want;o.pause();o.removeAttribute('src');o.load()}
  if(A===A2){graph();if(ctx.resume)ctx.resume();A2.ok=0}
  const off=S.off.find(x=>x.id===t.id);
  A.src=off?conv(off.uri):(t.url||`${HOST}/v1/tracks/${t.id}/stream?app_name=${APP}`);
  A.addEventListener('loadedmetadata',()=>{if(S.pos){A.currentTime=S.pos;S.pos=0}},{once:true});
  A.play().catch(()=>{});
  S.hist=[t,...S.hist.filter(x=>x.id!==t.id)].slice(0,50);save();ui();tint(t);svc();lyRefresh();
  if('mediaSession' in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,artwork:t.art?[{src:t.art,sizes:'480x480'}]:[]});
}
function next(){
  if(!S.q.length)return;
  if(S.shuf)S.i=Math.floor(Math.random()*S.q.length);
  else if(S.i+1<S.q.length)S.i++;else if(S.rep===1)S.i=0;else return;
  loadTrack();
}
function prev(){if(A.currentTime>3&&!cur().live){A.currentTime=0;return}S.i=(S.i-1+S.q.length)%S.q.length;loadTrack()}
function ui(){
  const t=cur();if(!t)return;
  $('#mini').classList.remove('hide');
  $('#mArt').src=$('#fArt').src=t.art||'';
  $('#mT').textContent=$('#fT').textContent=t.title;$('#mA').textContent=$('#fA').textContent=t.artist;
  $('#mPlay').textContent=$('#play').textContent=A.paused?'▶':'⏸';
  $('#fav').textContent=S.fav.some(x=>x.id===t.id)?'♥':'♡';$('#dlb').textContent=S.off.some(x=>x.id===t.id)?'✓':'⬇';$('#mFav').textContent=$('#fav').textContent;
  $('#seek').disabled=!!t.live;
  $('#shuf').classList.toggle('on',S.shuf);$('#rep').classList.toggle('on',S.rep>0);$('#rep').textContent=S.rep===2?'↻1':'↻';
}
A.onplay=()=>{ui();svc()};A.onpause=()=>{ui();svc()};
A.onended=()=>{if(S.rep===2){A.currentTime=0;A.play()}else next()};
A.onerror=e=>{if(e&&e.target!==A)return;const t=cur();if(A===A2&&!A2.ok&&t&&!t.noeq){t.noeq=true;toast('Sumber ini tidak mendukung equalizer, diputar tanpa EQ');loadTrack();return}toast('Gagal diputar, lanjut ke berikutnya…');setTimeout(next,900)};
A.ontimeupdate=()=>{lyTick();const mb=$('#mbar i');if(mb&&A.duration)mb.style.width=A.currentTime/A.duration*100+'%';if(S.dl&&Date.now()>=S.dl){S.dl=0;A.pause();$('#tmr').textContent='⏲';toast('Timer tidur selesai')}const t=cur();if(t&&t.live){$('#cur').textContent='LIVE';$('#dur').textContent='';return}
  $('#cur').textContent=fmt(A.currentTime)||'0:00';$('#dur').textContent=fmt(A.duration);if(A.duration){$('#seek').value=A.currentTime/A.duration*1000;$('#seek').style.setProperty('--p',A.currentTime/A.duration*100+'%')}};
['onplay','onpause','onended','onerror','ontimeupdate'].forEach(k=>A2[k]=A1[k]);A2.addEventListener('playing',()=>{A2.ok=1});
$('#seek').oninput=e=>{if(A.duration)A.currentTime=e.target.value/1000*A.duration};
$('#play').onclick=$('#mPlay').onclick=e=>{e.stopPropagation();A.paused?A.play():A.pause()};
$('#next').onclick=e=>{e.stopPropagation();next()};
$('#prev').onclick=prev;
$('#shuf').onclick=()=>{S.shuf=!S.shuf;ui()};
$('#rep').onclick=()=>{S.rep=(S.rep+1)%3;ui()};
$('#fav').onclick=()=>{const t=cur(),k=S.fav.findIndex(x=>x.id===t.id);k<0?S.fav.unshift(t):S.fav.splice(k,1);save();ui();toast(k<0?'Ditambahkan ke Favorit':'Dihapus dari Favorit')};
$('#addpl').onclick=()=>{const n=prompt('Nama playlist (baru atau yang sudah ada):\n'+Object.keys(S.pl).join(', '));if(!n)return;const p=S.pl[n]=S.pl[n]||[];if(!p.some(x=>x.id===cur().id))p.push(cur());save();toast('Masuk ke playlist '+n)};
$('#mFav').onclick=e=>{e.stopPropagation();$('#fav').click()};
$('#mini').onclick=()=>$('#full').classList.remove('hide');
$('#close').onclick=()=>$('#full').classList.add('hide');
if('mediaSession' in navigator){const m=navigator.mediaSession;m.setActionHandler('play',()=>A.play());m.setActionHandler('pause',()=>A.pause());m.setActionHandler('nexttrack',next);m.setActionHandler('previoustrack',prev)}

/* ===== LATAR BELAKANG, WARNA, ANTREAN, TIMER ===== */
const MP=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Music;
function svc(){const m=MP(),t=cur();if(!m||!t)return;const p={title:t.title,artist:t.artist,playing:!A.paused};
  if(S.svc)m.update(p);else if(!A.paused){S.svc=1;m.start(p)}}
const rs=document.documentElement.style;
function theme(h){rs.setProperty('--d',`hsl(${h},42%,26%)`)}
const hue=(r,g,b)=>{r/=255;g/=255;b/=255;const x=Math.max(r,g,b),n=Math.min(r,g,b),d=x-n;if(!d)return 260;const h=x===r?((g-b)/d)%6:x===g?(b-r)/d+2:(r-g)/d+4;return Math.round((h*60+360)%360)};
function tint(t){
  let h=0;for(const c of t.title+t.artist)h=(h*31+c.charCodeAt(0))%360;theme(h);
  if(!t.art)return;
  const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(im,0,0,8,8);const d=x.getImageData(0,0,8,8).data;let r=0,g=0,b=0,n=0;
    for(let i=0;i<d.length;i+=4){if(Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])>30){r+=d[i];g+=d[i+1];b+=d[i+2];n++}}
    if(n)theme(hue(r/n,g/n,b/n))}catch(e){}};
  im.src=t.art;
}
function addQ(t){if(!S.q.length)return play([t],0);S.q.splice(S.i+1,0,t);toast('Diputar berikutnya')}
function renderQ(){
  const l=$('#ql');
  l.innerHTML=S.q.map((t,i)=>`<div class="row ${i===S.i?'now':''}" data-i="${i}"><div><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div><button class="rm">✕</button></div>`).join('')||'<p class="empty">Antrean kosong.</p>';
  l.querySelectorAll('.row').forEach(r=>r.onclick=e=>{const i=+r.dataset.i;
    if(e.target.classList.contains('rm')){S.q.splice(i,1);if(i<S.i)S.i--;else if(i===S.i){if(S.q.length){S.i=Math.min(i,S.q.length-1);loadTrack()}else{A.pause();S.i=-1}}}
    else{S.i=i;loadTrack()}
    renderQ()});
}
$('#qbtn').onclick=()=>{renderQ();$('#queue').classList.remove('hide')};
$('#qx').onclick=()=>$('#queue').classList.add('hide');
let tmI=0;const TM=[0,15,30,60];
$('#tmr').onclick=()=>{tmI=(tmI+1)%TM.length;const m=TM[tmI];S.dl=m?Date.now()+m*60000:0;$('#tmr').textContent=m?`⏲${m}`:'⏲';toast(m?`Berhenti otomatis dalam ${m} menit`:'Timer dimatikan')};

/* ===== LIRIK, EQUALIZER, UNDUHAN ===== */
const conv=u=>window.Capacitor&&Capacitor.convertFileSrc?Capacitor.convertFileSrc(u):u;
const FS=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Filesystem;
async function dl(){
  const t=cur(),f=FS();if(!t||t.live)return toast('Radio siaran langsung tidak bisa diunduh');
  if(!f)return toast('Unduhan hanya tersedia di aplikasi Android');
  const o=S.off.find(x=>x.id===t.id);
  if(o){try{await f.deleteFile({path:o.path,directory:'DATA'})}catch(e){}S.off=S.off.filter(x=>x.id!==t.id);save();ui();return toast('Unduhan dihapus')}
  if(t.url&&t.url.startsWith('blob:'))return toast('Lagu dari HP sudah ada di perangkat');
  const url=t.url||`${HOST}/v1/tracks/${t.id}/stream?app_name=${APP}`,path='dl/'+String(t.id).replace(/[^\w-]/g,'_')+'.mp3';
  toast('Mengunduh…');
  try{await f.downloadFile({url,path,directory:'DATA',recursive:true});const u=await f.getUri({path,directory:'DATA'});
    S.off.unshift({...t,url:undefined,path,uri:u.uri});save();ui();toast('Tersimpan untuk didengar offline')}
  catch(e){toast('Gagal mengunduh lagu ini')}
}
$('#dlb').onclick=dl;

let LY={lines:[],i:-1};
const lyOpen=()=>!$('#lyr').classList.contains('hide');
async function loadLyrics(){
  const t=cur(),b=$('#lb');LY={lines:[],i:-1};if(!t)return;
  if(t.live){b.innerHTML='<p class="empty">Radio siaran langsung tidak punya lirik.</p>';return}
  b.innerHTML='<p class="empty">Mencari lirik…</p>';
  try{
    const r=await J(`https://lrclib.net/api/search?track_name=${enc(t.title)}&artist_name=${enc(t.artist)}`);
    if(cur()!==t)return;
    const x=r.find(a=>a.syncedLyrics)||r.find(a=>a.plainLyrics);
    if(!x){b.innerHTML='<p class="empty">Lirik tidak ditemukan untuk lagu ini.</p>';return}
    if(x.syncedLyrics){
      LY.lines=x.syncedLyrics.split('\n').map(l=>{const m=l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)/);return m?{t:+m[1]*60+ +m[2],x:m[3].trim()}:null}).filter(l=>l&&l.x);
      b.innerHTML=LY.lines.map((l,i)=>`<p data-i="${i}">${esc(l.x)}</p>`).join('');
    }else b.innerHTML=`<pre>${esc(x.plainLyrics)}</pre>`;
  }catch(e){b.innerHTML='<p class="empty">Gagal memuat lirik. Cek internet.</p>'}
}
const lyRefresh=()=>{if(lyOpen())loadLyrics()};
function lyTick(){
  if(!LY.lines.length||!lyOpen())return;
  const T=A.currentTime+.3;let k=-1;LY.lines.forEach((l,i)=>{if(l.t<=T)k=i});
  if(k===LY.i)return;LY.i=k;const b=$('#lb'),o=b.querySelector('.on');if(o)o.classList.remove('on');
  const n=b.querySelector(`[data-i="${k}"]`);if(n){n.classList.add('on');n.scrollIntoView({block:'center',behavior:'smooth'})}
}
$('#lybtn').onclick=()=>{$('#lyr').classList.remove('hide');loadLyrics()};
$('#lyx').onclick=()=>$('#lyr').classList.add('hide');

let ctx,F=[];
const BANDS=[[60,'lowshelf','60'],[230,'peaking','230'],[910,'peaking','910'],[3600,'peaking','3,6k'],[14000,'highshelf','14k']];
const PRE={Normal:[0,0,0,0,0],Bass:[8,5,0,-1,0],Vokal:[-2,1,4,3,0],Treble:[-1,0,1,5,8],Rock:[5,2,-2,3,5],Pop:[-1,2,4,2,-1]};
function graph(){
  if(ctx)return;ctx=new(window.AudioContext||window.webkitAudioContext)();let n=ctx.createMediaElementSource(A2);
  F=BANDS.map((b,i)=>{const f=ctx.createBiquadFilter();f.type=b[1];f.frequency.value=b[0];f.gain.value=S.eqv[i];n.connect(f);n=f;return f});
  n.connect(ctx.destination);
}
const eqApply=()=>{F.forEach((f,i)=>f.gain.value=S.eqv[i]);localStorage.setItem('eqv',JSON.stringify(S.eqv))};
function eqRender(){
  const pr=$('#eqpre');pr.innerHTML=Object.keys(PRE).map(k=>`<button data-k="${k}">${k}</button>`).join('');
  pr.querySelectorAll('button').forEach(b=>b.onclick=()=>{S.eqv=[...PRE[b.dataset.k]];eqApply();eqRender()});
  const sl=$('#eqs');sl.innerHTML=BANDS.map((b,i)=>`<label class="eqr"><span>${b[2]} Hz</span><input type="range" min="-12" max="12" step="1" value="${S.eqv[i]}" data-i="${i}"><em>${S.eqv[i]} dB</em></label>`).join('');
  sl.querySelectorAll('input').forEach(r=>r.oninput=()=>{S.eqv[+r.dataset.i]=+r.value;r.nextElementSibling.textContent=r.value+' dB';eqApply()});
  $('#eqon').checked=S.eq;
}
$('#eqbtn').onclick=()=>{eqRender();$('#eqp').classList.remove('hide')};
$('#eqx').onclick=()=>$('#eqp').classList.add('hide');
$('#eqon').onchange=e=>{S.eq=e.target.checked;localStorage.setItem('eq',S.eq?'1':'0');S.q.forEach(t=>delete t.noeq);if(cur()){S.pos=A.currentTime;loadTrack()}};

const shelf=a=>'<div class="hs">'+a.map((t,i)=>`<div class="card" data-i="${i}"><img src="${t.art||''}" alt="" onerror="this.style.visibility='hidden'"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div>`).join('')+'</div>';
function goLib(n){document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t==='lib'));V.lib($('#view'),n)}
/* ===== HALAMAN ===== */
const V={
  home(el){
    const s=SRC[S.src],h=new Date().getHours(),gr=h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam';
    const qs=[{title:'Lagu yang Disukai',fav:1},...S.hist.slice(0,5)];
    el.innerHTML=`<h1>${gr}</h1><div class="qg">${qs.map((t,i)=>`<div class="qc" data-i="${i}">${t.fav?'<div class="lk">♥</div>':`<img src="${t.art||''}" alt="" onerror="this.style.visibility='hidden'">`}<b>${esc(t.title)}</b></div>`).join('')}</div>
    ${S.hist.length?'<h2>Dengarkan lagi</h2>'+shelf(S.hist.slice(0,12)):''}
    <h2>Untuk Anda</h2><div id="sc">${srcChips()}</div><div id="gc">${chips(s.g.map((g,i)=>[g,!i,g]))}</div><div id="l"></div>`;
    el.querySelectorAll('.qc').forEach(c=>c.onclick=()=>{const i=+c.dataset.i;i?play(S.hist,i-1):goLib('__fav')});
    el.querySelectorAll('.card').forEach(c=>c.onclick=()=>play(S.hist,+c.dataset.i));
    bind($('#sc'),k=>setSrc(k,()=>V.home(el)));bind($('#gc'),g=>fill($('#l'),g));
    fill($('#l'),s.g[0]);
  },
  search(el){
    const s=SRC[S.src];
    el.innerHTML=`<h1>Cari</h1><input type="search" id="q" placeholder="Apa yang ingin Anda dengarkan?"><div id="sc">${srcChips()}</div><div id="cats"><h2>Jelajahi semua</h2><div class="cats">${s.g.map((g,i)=>`<div class="cat" style="background:hsl(${(i*47)%360},55%,38%)" data-g="${esc(g)}">${esc(g)}</div>`).join('')}</div></div><div id="l"></div>`;
    bind($('#sc'),k=>setSrc(k,()=>V.search(el)));
    el.querySelectorAll('.cat').forEach(c=>c.onclick=()=>{$('#cats').style.display='none';fill($('#l'),c.dataset.g)});
    let tm;$('#q').oninput=e=>{clearTimeout(tm);const v=e.target.value.trim();if(!v){$('#l').innerHTML='';$('#cats').style.display='';return}
      $('#cats').style.display='none';tm=setTimeout(()=>fill($('#l'),s.g[0],v),450)};
  },
  lib(el,open){
    el.innerHTML=`<div class="lh"><h1>Koleksi Anda</h1><button id="np">＋</button></div>${chips([['pl',1,'Playlist'],['off',0,'Unduhan'],['hist',0,'Riwayat']])}<div id="l"></div>`;
    const openL=(n,tr,del)=>{
      $('#l').innerHTML=`<div class="ph"><div><b>${esc(n)}</b><span>${tr.length} lagu</span></div><button id="shf">⇄</button><button class="pbtn" id="pp">▶</button></div><div id="l2"></div>`+(del?'<button class="btn" id="dp">Hapus playlist</button>':'');
      list($('#l2'),tr);
      $('#pp').onclick=()=>tr.length&&play(tr,0);
      $('#shf').onclick=()=>{if(tr.length){S.shuf=true;play(tr,Math.floor(Math.random()*tr.length))}};
      if(del)$('#dp').onclick=()=>{delete S.pl[n];save();show('pl')};
    };
    const show=k=>{const l=$('#l');
      if(k==='off')return list(l,S.off.map(x=>({...x,url:conv(x.uri)})));
      if(k==='hist')return list(l,S.hist);
      l.innerHTML=`<div class="row" data-n="__fav"><div class="lk">♥</div><div><b>Lagu yang Disukai</b><span>Playlist · ${S.fav.length} lagu</span></div></div>`
        +Object.keys(S.pl).map(x=>`<div class="row" data-n="${esc(x)}"><img src="${S.pl[x][0]?S.pl[x][0].art:''}" alt="" onerror="this.style.visibility='hidden'"><div><b>${esc(x)}</b><span>Playlist · ${S.pl[x].length} lagu</span></div></div>`).join('');
      l.querySelectorAll('.row').forEach(r=>r.onclick=()=>{const x=r.dataset.n;x==='__fav'?openL('Lagu yang Disukai',S.fav):openL(x,S.pl[x],1)});
    };
    bind(el.querySelector('.chips'),show);
    $('#np').onclick=()=>{const n=prompt('Nama playlist baru');if(n){S.pl[n]=S.pl[n]||[];save();show('pl')}};
    open==='__fav'?openL('Lagu yang Disukai',S.fav):show('pl');
  },
  set(el){
    el.innerHTML=`<div class="set"><h1>Setelan</h1>
    <h2>Jamendo client ID</h2><p>Gratis di devportal.jamendo.com. Dipakai untuk sumber Jamendo.</p>
    <input type="text" id="jid" placeholder="Tempel client ID" value="${esc(S.jid)}"><button class="btn" id="sj">Simpan</button>
    <h2>Lagu dari HP</h2><p>Putar file MP3 atau FLAC milik Anda. Daftarnya hilang saat aplikasi ditutup.</p>
    <label class="btn">Pilih lagu<input type="file" id="fl" accept="audio/*" multiple hidden></label>
    <h2>Cadangan favorit dan playlist</h2><p>Salin cadangan, simpan di catatan. Untuk memulihkan, tempel teksnya di kotak lalu tekan Pulihkan.</p>
    <button class="btn" id="bk">Salin cadangan</button> <button class="btn" id="rs">Pulihkan</button><textarea id="bt" placeholder="Teks cadangan"></textarea></div>`;
    $('#bk').onclick=async()=>{const j=JSON.stringify({fav:S.fav,pl:S.pl});$('#bt').value=j;try{await navigator.clipboard.writeText(j);toast('Cadangan disalin')}catch(e){toast('Salin teks di kotak secara manual')}};
    $('#rs').onclick=()=>{try{const d=JSON.parse($('#bt').value);(d.fav||[]).forEach(t=>{if(!S.fav.some(x=>x.id===t.id))S.fav.push(t)});Object.keys(d.pl||{}).forEach(n=>{const p=S.pl[n]=S.pl[n]||[];d.pl[n].forEach(t=>{if(!p.some(x=>x.id===t.id))p.push(t)})});save();toast('Berhasil dipulihkan')}catch(e){toast('Format cadangan tidak valid')}};
    $('#sj').onclick=()=>{S.jid=$('#jid').value.trim();localStorage.setItem('jid',S.jid);toast('Client ID tersimpan')};
    $('#fl').onchange=e=>{const f=[...e.target.files];if(!f.length)return;play(f.map((x,i)=>({id:'l'+i+x.name,title:x.name.replace(/\.[^.]+$/,''),artist:'Dari HP',art:'',dur:0,url:URL.createObjectURL(x)})),0)};
  }
};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav .on').forEach(x=>x.classList.remove('on'));b.classList.add('on');V[b.dataset.t]($('#view'))});
pickHost().then(()=>V.home($('#view')));
