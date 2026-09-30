'use strict';
/* =========================================================
 *  白室十日 — ノベルエンジン
 *  スクリプト（scenario.js）を解釈して、テキスト・選択肢・
 *  日付カード・演出・セーブ／ロードを扱う。
 *  謎解きパートは puzzle.js が担当する。
 * ========================================================= */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const CFG = Object.assign({ textSpeed: 32, autoWait: 1400, sound: true, volume: .5, showAff: true }, store.get('hk_cfg') || {});
const saveCfg = () => store.set('hk_cfg', CFG);

/* ---------- 定数 ---------- */
const TRUE_LINE = 70, NORMAL_LINE = 40;   // エンディング分岐の好感度
const DAY_MAX = 10;                         // 1日に縮められる距離の最大
const SPEAKERS = {
  '広': { name: '篠澤 広' },
  'P': { name: 'プロデューサー', cls: 'p' },
  'ハク': { name: 'HAKU', cls: 'sys' },
  '？？？': { name: '？？？' },
  '幼い声': { name: '？？？', cls: 'p' },
};

/* ---------- スクリプト解析 ---------- */
function parseScript(src){
  const out = [];
  for(const raw of src.split('\n')){
    const line = raw.trim();
    if(!line || line.startsWith('//')) continue;
    if(line[0] === '*'){ out.push({ t:'label', name: line.slice(1).trim() }); continue; }
    if(line[0] === '>'){
      const [text, label, aff] = line.slice(1).split('|').map(s => s.trim());
      const last = out[out.length - 1];
      if(last && last.t === 'choice') last.opts.push({ text, label, aff: +aff || 0 });
      continue;
    }
    if(line[0] === '@'){
      const [cmd, ...args] = line.slice(1).split(/\s+/);
      out.push(mkCmd(cmd, args));
      continue;
    }
    out.push(parseLine(line));
  }
  out.labels = {};
  out.forEach((c, i) => { if(c.t === 'label') out.labels[c.name] = i; });
  return out;
}
function parseLine(line){
  const m = line.match(/^([^「」\s]{1,6})「([\s\S]*)」$/);
  if(m && SPEAKERS[m[1]]) return { t:'say', who: m[1], text: '「' + m[2] + '」' };
  return { t:'say', who:'', text: line };
}
function mkCmd(cmd, a){
  switch(cmd){
    case 'bg': return { t:'bg', name:a[0], mode:a[1] || '' };
    case 'show': return { t:'show', pos:a[0] || 'center' };
    case 'hide': return { t:'hide' };
    case 'face': return { t:'face', f:a[0] || '' };
    case 'day': return { t:'day', n:+a[0] };
    case 'dayend': return { t:'dayend' };
    case 'puzzle': return { t:'puzzle', n:+a[0] };
    case 'choice': return { t:'choice', opts:[] };
    case 'jump': return { t:'jump', label:a[0] };
    case 'if': return { t:'if', cond:a[0], label:a[1] };
    case 'set': return { t:'set', flag:a[0] };
    case 'fx': return { t:'fx', name:a[0] };
    case 'wait': return { t:'wait', ms:+a[0] || 600 };
    case 'chapter': return { t:'chapter', text:a.join(' ').replace(/\\n/g, '\n'), dark: false };
    case 'chapterdark': return { t:'chapter', text:a.join(' ').replace(/\\n/g, '\n'), dark: true };
    case 'ending': return { t:'ending' };
    case 'endcard': return { t:'endcard', kind:a[0] };
    case 'goto': return { t:'goto', name:a[0] };
    case 'title': return { t:'title' };
    case 'aff': return { t:'aff', n:+a[0] };
    case 'note': return { t:'note', text:a.join(' ') };
    case 'sfx': return { t:'sfx', name:a[0] };
    default: console.warn('unknown command', cmd); return { t:'label', name:'_' };
  }
}
const SCRIPTS = {};
for(const k in SCRIPT_SRC) SCRIPTS[k] = parseScript(SCRIPT_SRC[k]);

/* ---------- ゲーム状態 ---------- */
let S = null;
function newState(){
  return {
    script:'day1', pc:0, cur:0, mode:'novel',
    day:0, aff:0, dayGain:0, mistakes:0, hints:0,
    totalMiss:0, totalHint:0,
    history:[], flags:{}, notes:[], answers:{}, letters:{},
    bg:{ name:'black', mode:'' }, sprite:{ on:false, pos:'center', face:'' },
    puzzle:null, lastText:'',
  };
}
const dayCap = () => Math.max(2, DAY_MAX - 2 * S.mistakes - S.hints);

/* ---------- 画面 ---------- */
const stage = $('#stage');
function fit(){
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.setProperty('--s', s);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();

function setBg(name, mode){
  S.bg = { name, mode: mode || '' };
  renderBg();
}
function renderBg(){
  const bg = $('#bg');
  bg.className = '';
  const { name, mode } = S.bg;
  if(name !== 'room') bg.classList.add(name);
  if(mode) bg.classList.add(mode);
  stage.classList.toggle('nightmode', mode === 'night');
  stage.classList.toggle('darkmode', mode === 'dark' || name === 'black');
  stage.classList.toggle('flashmode', mode === 'flash');
  stage.classList.toggle('warmmode', mode === 'warm');
  stage.classList.toggle('dawnmode', name === 'dawn');
  stage.classList.toggle('day-late', S.day >= 7);
}
function renderSprite(){
  const h = $('#hiro');
  const sp = S.sprite;
  h.className = '';
  if(sp.on) h.classList.add('on');
  h.classList.add('pos-' + sp.pos);
  if(sp.face){ void h.offsetWidth; h.classList.add('face-' + sp.face); }
}

/* ---------- 効果音（WebAudioで合成。素材ファイル不要） ---------- */
const Snd = {
  ctx:null,
  init(){ if(!this.ctx){ try{ this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} } if(this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone(freq, dur, type='sine', vol=.2, when=0, slide=0){
    if(!CFG.sound || !this.ctx) return;
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if(slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * CFG.volume, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
  },
  play(name){
    switch(name){
      case 'click': this.tone(1200, .05, 'square', .05); break;
      case 'key': this.tone(880, .07, 'square', .06); break;
      case 'ok': [660, 880, 1320].forEach((f, i) => this.tone(f, .25, 'sine', .15, i * .09)); break;
      case 'ng': this.tone(160, .35, 'sawtooth', .12); this.tone(120, .4, 'sawtooth', .1, .12); break;
      case 'item': this.tone(990, .12, 'triangle', .15); this.tone(1480, .2, 'triangle', .12, .08); break;
      case 'door': this.tone(90, 1.1, 'sawtooth', .08, 0, 40); this.tone(300, .8, 'sine', .05, .2, 150); break;
      case 'sys': this.tone(1567, .12, 'sine', .08); this.tone(1046, .2, 'sine', .08, .13); break;
      case 'heart': this.tone(784, .15, 'sine', .1); this.tone(1175, .3, 'sine', .08, .1); break;
      case 'glitch': for(let i = 0; i < 6; i++) this.tone(200 + Math.random() * 1600, .05, 'square', .05, i * .05); break;
      case 'thud': this.tone(70, .3, 'sine', .3, 0, 40); break;
    }
  }
};

/* ---------- テキスト表示 ---------- */
const TB = { typing:false, timer:null, full:'', idx:0, onNext:null, autoT:null };
let AUTO = false, SKIP = false;

function interp(t){
  return t.replace(/\{(\w+)\}/g, (_, k) => ({
    miss: S.totalMiss, hint: S.totalHint, aff: S.aff, day: S.day,
  }[k] ?? ''));
}
function showLine(who, text, onNext){
  text = interp(text);
  const tb = $('#textbox'), nb = $('#namebox'), tx = $('#text');
  tb.classList.remove('hidden', 'done');
  const sp = SPEAKERS[who];
  nb.textContent = sp ? sp.name : '';
  nb.className = sp && sp.cls ? sp.cls : '';
  tx.className = !who ? (text.startsWith('（') ? 'inner' : 'narr') : (sp && sp.cls === 'sys' ? 'sys' : '');
  if(who === 'ハク') Snd.play('sys');
  TB.full = text; TB.idx = 0; TB.onNext = onNext; S.lastText = text;
  pushLog(sp ? sp.name : '', text, who === 'ハク');
  clearTimeout(TB.timer); clearTimeout(TB.autoT);
  if(SKIP || CFG.textSpeed >= 100){ tx.textContent = text; finishType(); return; }
  TB.typing = true; tx.textContent = '';
  const tick = () => {
    TB.idx += 1;
    tx.textContent = TB.full.slice(0, TB.idx);
    if(TB.idx >= TB.full.length){ finishType(); return; }
    const ch = TB.full[TB.idx - 1];
    const d = Math.max(6, 70 - CFG.textSpeed * .65) * ('。、……！？」'.includes(ch) ? 4 : 1);
    TB.timer = setTimeout(tick, d);
  };
  tick();
}
function finishType(){
  TB.typing = false; clearTimeout(TB.timer);
  $('#text').textContent = TB.full;
  $('#textbox').classList.add('done');
  if(SKIP){ TB.autoT = setTimeout(advance, 40); }
  else if(AUTO){ TB.autoT = setTimeout(advance, CFG.autoWait + TB.full.length * 45); }
}
function advance(){
  if(!$('#modal').classList.contains('hidden')) return;
  if(stage.classList.contains('hideui')){ stage.classList.remove('hideui'); return; }
  if(TB.typing){ finishType(); return; }
  if(!TB.onNext) return;
  const f = TB.onNext; TB.onNext = null;
  clearTimeout(TB.autoT);
  f();
}
function hideText(){ $('#textbox').classList.add('hidden'); TB.onNext = null; }

/* 汎用：複数行のテキストを順に表示 */
function sayLines(lines, done){
  let i = 0;
  const next = () => {
    if(i >= lines.length){ hideText(); done && done(); return; }
    const c = lines[i++];
    if(c.t === 'say') showLine(c.who, c.text, next);
    else next();
  };
  next();
}

/* ---------- ログ ---------- */
const LOG = [];
function pushLog(name, text, sys){ LOG.push({ name, text, sys }); if(LOG.length > 400) LOG.shift(); }

/* ---------- 演出 ---------- */
function toast(msg, cls){
  const d = document.createElement('div');
  d.textContent = msg; if(cls) d.className = cls;
  $('#toast').appendChild(d);
  setTimeout(() => d.remove(), 2700);
}
function heartFx(){
  for(let i = 0; i < 3; i++){
    const h = document.createElement('div');
    h.className = 'heartfly'; h.textContent = '♥';
    h.style.left = (560 + Math.random() * 160) + 'px';
    h.style.top = (330 + Math.random() * 60) + 'px';
    h.style.animationDelay = (i * .15) + 's';
    stage.appendChild(h); setTimeout(() => h.remove(), 1800);
  }
}
function addAff(n){
  if(n <= 0) return 0;
  const room = Math.max(0, dayCap() - S.dayGain);
  const g = Math.min(n, room);
  S.dayGain += g; S.aff += g;
  if(CFG.showAff){
    if(g > 0){ heartFx(); Snd.play('heart'); toast(`♥ 広との距離が縮まった（+${g}）`, 'aff'); }
    if(g < n) toast('……今日は、これ以上近づけない（今日の上限）', 'capped');
  }
  return g;
}
function doFx(name, done){
  const fx = $('#fx');
  switch(name){
    case 'flash': fx.className = ''; void fx.offsetWidth; fx.className = 'flash'; Snd.play('glitch'); setTimeout(done, 450); break;
    case 'shake': stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); Snd.play('thud'); setTimeout(() => { stage.classList.remove('shake'); done(); }, 460); break;
    case 'glitch': stage.classList.add('glitch'); Snd.play('glitch'); setTimeout(() => { stage.classList.remove('glitch'); done(); }, 1250); break;
    case 'blackout': fx.className = 'blackout'; setTimeout(done, 950); break;
    case 'whiteout': fx.className = 'whiteout'; setTimeout(done, 950); break;
    case 'fadein': fx.className = 'clear'; setTimeout(() => { fx.className = ''; done(); }, 950); break;
    case 'door': Snd.play('door'); setTimeout(done, 700); break;
    default: done();
  }
}
function showCard(html, dark, done, clickable = true){
  const c = $('#card');
  c.innerHTML = html; c.className = dark ? 'dark' : '';
  hideText();
  let fired = false;
  const go = () => { if(fired) return; fired = true; c.classList.add('hidden'); c.onclick = null; done && done(); };
  if(clickable){ setTimeout(() => { c.onclick = go; if(SKIP) go(); }, SKIP ? 50 : 700); c.insertAdjacentHTML('beforeend', '<div class="c-hint">CLICK</div>'); }
  return go;
}

/* ---------- 実行 ---------- */
function cmds(){ return SCRIPTS[S.script]; }
function evalCond(c){
  let m;
  if((m = c.match(/^(!?)flag:(\w+)$/))) return !!S.flags[m[2]] !== !!m[1];
  if((m = c.match(/^(aff|miss|dmiss|hint|gain)(>=|<=|==|>|<)(\d+)$/))){
    const v = { aff:S.aff, miss:S.totalMiss, dmiss:S.mistakes, hint:S.totalHint, gain:S.dayGain }[m[1]];
    const n = +m[3];
    return { '>=':v >= n, '<=':v <= n, '==':v === n, '>':v > n, '<':v < n }[m[2]];
  }
  console.warn('bad cond', c); return false;
}
function step(){
  if(S.mode !== 'novel') return;
  const list = cmds();
  while(S.pc < list.length){
    const c = list[S.pc]; S.cur = S.pc; S.pc++;
    switch(c.t){
      case 'label': continue;
      case 'bg': setBg(c.name, c.mode); continue;
      case 'show': S.sprite.on = true; S.sprite.pos = c.pos; S.sprite.face = ''; renderSprite(); continue;
      case 'hide': S.sprite.on = false; renderSprite(); continue;
      case 'face': S.sprite.face = c.f === 'normal' ? '' : c.f; renderSprite(); continue;
      case 'set': S.flags[c.flag] = true; continue;
      case 'jump': S.pc = list.labels[c.label]; continue;
      case 'if': if(evalCond(c.cond)) S.pc = list.labels[c.label]; continue;
      case 'aff': addAff(c.n); continue;
      case 'note': S.notes.push(c.text); continue;
      case 'sfx': Snd.play(c.name); continue;
      case 'goto': S.script = c.name; S.pc = 0; return step();
      case 'say': showLine(c.who, c.text, step); return;
      case 'choice': showChoice(c); return;
      case 'day': startDay(c.n); return;
      case 'dayend': endDay(); return;
      case 'puzzle': hideText(); Puzzle.start(c.n, true); return;
      case 'fx': hideText(); doFx(c.name, step); return;
      case 'wait': hideText(); setTimeout(step, SKIP ? 50 : c.ms); return;
      case 'chapter': showCard(`<div class="c-text">${esc(c.text)}</div>`, c.dark, step); return;
      case 'ending': chooseEnding(); return;
      case 'endcard': showEndCard(c.kind); return;
      case 'title': toTitle(); return;
    }
  }
}

function showChoice(c){
  SKIP = false; updateSysbar();
  const box = $('#choices');
  box.innerHTML = '';
  // 選択肢の並びは毎回シャッフル（「いつも一番上が正解」にならないように）
  const opts = c.opts.slice();
  for(let i = opts.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  opts.forEach(o => {
    const b = document.createElement('button');
    b.textContent = o.text; b.dataset.aff = o.aff;
    b.onclick = e => {
      e.stopPropagation(); Snd.play('click');
      box.classList.add('hidden');
      pushLog('▶', o.text);
      addAff(o.aff);
      S.pc = cmds().labels[o.label];
      step();
    };
    box.appendChild(b);
  });
  box.classList.remove('hidden');
}

const ROMAN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function startDay(n){
  S.day = n; S.dayGain = 0; S.mistakes = 0; S.hints = 0;
  renderBg();
  autoSave();
  const r = ROOMS[n];
  showCard(`<div class="c-day">DAY ${n} / 10</div><div class="c-main">${ROMAN[n]}日目</div><div class="c-sub">ROOM ${String(n).padStart(2, '0')} ─ ${esc(r.theme)}</div>`, false, step);
}
function endDay(){
  S.history.push({ day:S.day, gain:S.dayGain, cap:dayCap(), miss:S.mistakes, hint:S.hints });
  const cap = dayCap();
  const pips = Array.from({ length: DAY_MAX }, (_, i) => i < S.dayGain ? '♥' : (i < cap ? '♡' : '·')).join('');
  showCard(`<div class="c-day">DAY ${S.day} ─ END</div><div class="c-main" style="font-size:44px">${ROMAN[S.day]}日目、終了</div>
    <table>
      <tr><td>扉の前で間違えた回数</td><td>${S.mistakes}</td></tr>
      <tr><td>広に頼ったヒント</td><td>${S.hints}</td></tr>
      <tr><td>今日の上限</td><td>${cap} / ${DAY_MAX}</td></tr>
      <tr><td>縮まった距離</td><td style="color:var(--accent);letter-spacing:.1em">${pips}</td></tr>
    </table>`, false, step);
}
function chooseEnding(){
  const kind = S.aff >= TRUE_LINE ? 'true' : S.aff >= NORMAL_LINE ? 'normal' : 'bad';
  S.script = 'end_' + kind; S.pc = 0;
  step();
}
const END_INFO = {
  true: { kind:'TRUE END', title:'ふたりで解く', sub:'The problem she couldn\'t solve alone.' },
  normal: { kind:'NORMAL END', title:'白紙のまま', sub:'Some answers are left blank, for now.' },
  bad: { kind:'BAD END', title:'観察対象', sub:'Now, she observes you.' },
};
function showEndCard(kind){
  const seen = store.get('hk_endings') || {};
  seen[kind] = true; store.set('hk_endings', seen);
  const e = END_INFO[kind];
  showCard(`<div class="end-kind">${e.kind}</div><div class="end-title">${esc(e.title)}</div><div class="c-sub">${esc(e.sub)}</div>
    <table><tr><td>最終的な広との距離</td><td>${S.aff} / 100</td></tr><tr><td>十日間の間違い</td><td>${S.totalMiss}</td></tr><tr><td>十日間のヒント</td><td>${S.totalHint}</td></tr></table>`, true, step);
}

/* ---------- セーブ／ロード ---------- */
const SLOT_N = 8;
function snapshot(){ return JSON.parse(JSON.stringify(S)); }
function saveTo(slot){
  const data = { s: snapshot(), at: Date.now() };
  if(store.set('hk_save_' + slot, data)) toast(slot === 'auto' ? 'オートセーブしました' : `スロット${slot}にセーブしました`);
  else toast('セーブできませんでした（ブラウザの保存領域が使えません）');
}
function autoSave(){ store.set('hk_save_auto', { s: snapshot(), at: Date.now() }); }
function loadFrom(slot){
  const d = store.get('hk_save_' + slot);
  if(!d) return false;
  resume(d.s);
  return true;
}
function resume(state){
  S = state;
  closeModal(); $('#title').classList.add('hidden'); $('#card').classList.add('hidden'); $('#choices').classList.add('hidden');
  $('#fx').className = '';
  $('#sysbar').classList.remove('hidden');
  renderBg(); renderSprite();
  Puzzle.teardown();
  if(S.mode === 'puzzle'){ hideText(); Puzzle.start(S.puzzle.room, false); }
  else { S.pc = S.cur; step(); }
}
function latestSave(){
  let best = null, key = null;
  for(const k of ['auto', ...Array.from({ length: SLOT_N }, (_, i) => i + 1)]){
    const d = store.get('hk_save_' + k);
    if(d && (!best || d.at > best.at)){ best = d; key = k; }
  }
  return key;
}

/* ---------- モーダル ---------- */
function openModal(html, opts = {}){
  const m = $('#modal'), b = $('#modal-box');
  b.innerHTML = (opts.noClose ? '' : '<button class="m-close" aria-label="閉じる">×</button>') + html;
  m.classList.remove('hidden');
  const close = () => { closeModal(); opts.onClose && opts.onClose(); };
  if(!opts.noClose) b.querySelector('.m-close').onclick = close;
  m.onclick = e => { if(e.target === m && !opts.noClose) close(); };
  return b;
}
function closeModal(){ $('#modal').classList.add('hidden'); $('#modal-box').innerHTML = ''; }

function fmtDate(t){ const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function slotHtml(k){
  const d = store.get('hk_save_' + k);
  const label = k === 'auto' ? 'AUTO' : 'SLOT ' + k;
  if(!d) return `<button class="slotbtn empty" data-slot="${k}"><b>${label}</b><span>― 空き ―</span></button>`;
  const s = d.s;
  const where = s.day ? `${ROMAN[s.day]}日目 ${s.mode === 'puzzle' ? '（謎解き中）' : ''}` : 'プロローグ';
  return `<button class="slotbtn" data-slot="${k}"><b>${label}</b><span>${where} ／ ${fmtDate(d.at)}</span><em>${esc(s.lastText || '')}</em></button>`;
}
function openSave(){
  const b = openModal(`<h2>SAVE<small>保存するスロットを選んでください</small></h2><div class="slots">${Array.from({ length: SLOT_N }, (_, i) => slotHtml(i + 1)).join('')}</div>`);
  b.querySelectorAll('.slotbtn').forEach(x => x.onclick = () => { saveTo(x.dataset.slot); openSave(); });
}
function openLoad(){
  const b = openModal(`<h2>LOAD<small>再開するデータを選んでください</small></h2><div class="slots">${slotHtml('auto')}${Array.from({ length: SLOT_N }, (_, i) => slotHtml(i + 1)).join('')}</div>`);
  b.querySelectorAll('.slotbtn').forEach(x => x.onclick = () => { if(!x.classList.contains('empty')) loadFrom(x.dataset.slot); });
}
function openLog(){
  const b = openModal(`<h2>LOG</h2><div class="log">${LOG.map(l => `<div class="${l.sys ? 'sys' : ''}">${l.name ? `<b>${esc(l.name)}</b>` : ''}${esc(l.text)}</div>`).join('')}</div>`);
  b.scrollTop = b.scrollHeight;
}
function openConfig(){
  const tog = (key, on, off) => `<div class="tog" data-key="${key}"><button data-v="1" class="${CFG[key] ? 'on' : ''}">${on}</button><button data-v="0" class="${CFG[key] ? '' : 'on'}">${off}</button></div>`;
  const b = openModal(`<h2>CONFIG</h2><div class="cfg">
    <label>文字の速さ</label><input type="range" min="0" max="100" value="${CFG.textSpeed}" data-k="textSpeed">
    <label>オートの待ち時間</label><input type="range" min="400" max="4000" step="100" value="${CFG.autoWait}" data-k="autoWait">
    <label>効果音</label>${tog('sound', 'ON', 'OFF')}
    <label>音量</label><input type="range" min="0" max="1" step=".05" value="${CFG.volume}" data-k="volume">
    <label>好感度の通知</label>${tog('showAff', '表示', '非表示')}
  </div><p class="muted" style="margin-top:18px">好感度の通知を「非表示」にすると、選択肢の手応えが見えなくなります。二周目以降におすすめ。</p>`);
  b.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => { CFG[r.dataset.k] = +r.value; saveCfg(); });
  b.querySelectorAll('.tog').forEach(t => t.querySelectorAll('button').forEach(x => x.onclick = () => {
    CFG[t.dataset.key] = x.dataset.v === '1'; saveCfg();
    t.querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x));
  }));
}

/* ---------- システムバー ---------- */
function updateSysbar(){
  $('[data-sys=auto]').classList.toggle('on', AUTO);
  $('[data-sys=skip]').classList.toggle('on', SKIP);
}
$('#sysbar').addEventListener('click', e => {
  const k = e.target.dataset && e.target.dataset.sys; if(!k) return;
  e.stopPropagation(); Snd.init(); Snd.play('click');
  switch(k){
    case 'log': openLog(); break;
    case 'auto': AUTO = !AUTO; SKIP = false; updateSysbar(); if(AUTO && !TB.typing && TB.onNext) finishType(); break;
    case 'skip': SKIP = !SKIP; AUTO = false; updateSysbar(); if(SKIP && TB.onNext) advance(); break;
    case 'save': openSave(); break;
    case 'load': openLoad(); break;
    case 'config': openConfig(); break;
    case 'hide': stage.classList.add('hideui'); break;
    case 'title': {
      const b = openModal(`<h2>タイトルへ戻る</h2><p class="muted">セーブしていない進行は失われます（日付の始まりにオートセーブがあります）。</p><div class="m-row"><button class="mbtn" id="t-no">やめる</button><button class="mbtn pri" id="t-yes">戻る</button></div>`);
      b.querySelector('#t-no').onclick = closeModal;
      b.querySelector('#t-yes').onclick = () => { closeModal(); toTitle(); };
    }
  }
});

$('#textbox').addEventListener('click', e => { e.stopPropagation(); Snd.init(); advance(); });
$('#card').addEventListener('click', e => e.stopPropagation());
stage.addEventListener('click', e => {
  if(stage.classList.contains('hideui')){ stage.classList.remove('hideui'); return; }
  if(S && S.mode === 'novel' && TB.onNext && e.target.closest('#bg,#sprite-layer,#deco,#vignette')) advance();
});
addEventListener('keydown', e => {
  if(!S || !$('#title').classList.contains('hidden')) return;
  if(e.key === 'Escape'){ closeModal(); return; }
  if(!$('#modal').classList.contains('hidden')) return;
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); advance(); }
  if(e.key === 'Control'){ SKIP = true; updateSysbar(); if(TB.onNext) advance(); }
});
addEventListener('keyup', e => { if(e.key === 'Control'){ SKIP = false; updateSysbar(); } });
stage.addEventListener('wheel', e => { if(e.deltaY < 0 && $('#modal').classList.contains('hidden') && S && $('#title').classList.contains('hidden')) openLog(); }, { passive:true });

/* ---------- タイトル ---------- */
function toTitle(){
  AUTO = SKIP = false; updateSysbar();
  hideText(); closeModal();
  Puzzle.teardown();
  $('#choices').classList.add('hidden'); $('#card').classList.add('hidden');
  $('#sysbar').classList.add('hidden');
  $('#fx').className = '';
  $('#title').classList.remove('hidden');
  $('[data-title=continue]').disabled = !latestSave();
}
function newGame(script = 'day1', preset){
  S = newState();
  if(preset) Object.assign(S, preset);
  S.script = script;
  LOG.length = 0;
  AUTO = SKIP = false; updateSysbar();
  hideText(); closeModal(); Puzzle.teardown();
  $('#choices').classList.add('hidden'); $('#card').classList.add('hidden'); $('#fx').className = '';
  $('#title').classList.add('hidden');
  $('#sysbar').classList.remove('hidden');
  renderBg(); renderSprite();
  step();
}
