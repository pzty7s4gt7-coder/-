'use strict';
/* =========================================================
 *  白室十日 — 謎解き（2D仮実装）
 *  rooms.js の部屋定義を読み、調べる場所・持ち物・錠前を扱う。
 *  将来3D化するときは、この Puzzle と rooms.js の hotspot を
 *  3D空間のオブジェクトに差し替える想定。
 * ========================================================= */

const Puzzle = {
  get R(){ return ROOMS[S.puzzle.room]; },

  start(n, fresh){
    S.mode = 'puzzle';
    if(fresh || !S.puzzle) S.puzzle = { room:n, items:[], flags:{}, hintLv:0, sel:null, talk:0 };
    setBg('room', 'r' + n);
    S.sprite = { on:true, pos:'stand', face:'' }; renderSprite();
    stage.classList.add('puzzle');
    $('#phud').classList.remove('hidden');
    this.render();
    if(fresh && this.R.enter) this.say(this.R.enter);
  },
  teardown(){
    stage.classList.remove('puzzle', 'show-spots', 'using');
    $('#phud').classList.add('hidden');
    $('#deco').innerHTML = ''; $('#hotspots').innerHTML = '';
    $('#btn-spots').classList.remove('on');
  },

  /* ---------- 描画 ---------- */
  render(){
    const R = this.R, P = S.puzzle;
    $('#deco').innerHTML = typeof R.deco === 'function' ? R.deco(P.flags) : (R.deco || '');
    const hs = $('#hotspots'); hs.innerHTML = '';
    for(const h of R.hotspots){
      if(h.if && !h.if(P.flags)) continue;
      const d = document.createElement('div');
      d.className = 'hs'; d.dataset.label = h.label;
      Object.assign(d.style, { left:h.x + '%', top:h.y + '%', width:h.w + '%', height:h.h + '%' });
      d.onclick = e => { e.stopPropagation(); this.click(h); };
      d.onmousemove = e => this.label(h.label, e);
      d.onmouseleave = () => { $('#hs-label').style.opacity = 0; };
      hs.appendChild(d);
    }
    // 広（クリックで会話）
    const hh = document.createElement('div');
    hh.className = 'hs'; hh.dataset.label = '篠澤広';
    Object.assign(hh.style, { left:'40.5%', top:'43%', width:'9%', height:'54%' });
    hh.onclick = e => { e.stopPropagation(); this.talk(); };
    hh.onmousemove = e => this.label('篠澤広（話しかける）', e);
    hh.onmouseleave = () => { $('#hs-label').style.opacity = 0; };
    hs.appendChild(hh);
    this.hud();
  },
  label(t, e){
    const L = $('#hs-label'), r = stage.getBoundingClientRect(), k = r.width / 1280;
    L.textContent = t; L.style.opacity = 1;
    L.style.left = ((e.clientX - r.left) / k + 16) + 'px';
    L.style.top = ((e.clientY - r.top) / k + 14) + 'px';
  },
  hud(){
    const R = this.R, P = S.puzzle;
    $('#ph-room').innerHTML = `<small>DAY ${S.day} ／ ROOM ${String(P.room).padStart(2, '0')}</small>「${esc(R.theme)}」の部屋`;
    const cap = dayCap();
    $('#ph-cap').innerHTML = `今日の上限 <span class="pips">${Array.from({ length: DAY_MAX }, (_, i) => `<i class="${i < cap ? 'on' : 'lost'}"></i>`).join('')}</span><b>${cap}</b>`;
    const inv = $('#inv'); inv.innerHTML = '';
    P.items.forEach(id => {
      const it = ITEMS[id];
      const d = document.createElement('div');
      d.className = 'slot' + (P.sel === id ? ' sel' : '') + (this._new === id ? ' new' : '');
      d.innerHTML = `${it.icon}<small>${esc(it.name)}</small>`;
      d.title = it.name;
      d.onclick = e => { e.stopPropagation(); if(TB.onNext){ advance(); return; } Snd.play('click'); P.sel = P.sel === id ? null : id; this.hud(); };
      inv.appendChild(d);
    });
    this._new = null;
    $('#btn-inspect').classList.toggle('hidden', !P.sel);
    stage.classList.toggle('using', !!P.sel);
    $('#btn-hint').textContent = P.hintLv >= 3 ? '広に聞く（済）' : `広に聞く（${P.hintLv}/3）`;
  },

  /* ---------- 操作 ---------- */
  busy(){ return !!TB.onNext || !$('#modal').classList.contains('hidden'); },
  click(h){
    if(TB.onNext){ advance(); return; }
    if(this.busy()) return;
    Snd.play('click');
    const P = S.puzzle, g = this.api();
    if(P.sel){
      const sel = P.sel;
      P.sel = null; this.hud();
      if(h.use && h.use[sel]) h.use[sel](g);
      else this.say(`（${ITEMS[sel].name}を${h.label}に使ってみた。……何も起きない。）`);
      return;
    }
    h.act(g);
  },
  talk(){
    if(TB.onNext){ advance(); return; }
    if(this.busy()) return;
    const P = S.puzzle, R = this.R;
    if(!P.sel && R.talkAct && R.talkAct(this.api())) return;
    if(P.sel){
      const sel = P.sel; P.sel = null; this.hud();
      const t = (R.show && R.show[sel]) || (ITEMS[sel].hiro) || `広「${ITEMS[sel].name}。……うん、見た。それで？」`;
      this.say(t); return;
    }
    const lines = (R.talkIf && R.talkIf(P.flags)) || R.talk[P.talk % R.talk.length];
    P.talk++;
    S.sprite.face = 'smile'; renderSprite();
    this.say(lines);
  },
  say(text, done){
    sayLines(parseScript(text).filter(c => c.t === 'say'), () => { if(S.mode === 'puzzle'){ this.render(); } done && done(); });
  },

  /* 部屋定義から呼ばれる操作の窓口 */
  api(){
    const P = S.puzzle, self = this;
    return {
      f: k => P.flags[k],
      set: (k, v = true) => { P.flags[k] = v; },
      has: id => P.items.includes(id),
      give(id){ if(!P.items.includes(id)){ P.items.push(id); self._new = id; Snd.play('item'); toast(`${ITEMS[id].icon} ${ITEMS[id].name} を手に入れた`); } self.hud(); },
      drop(id){ P.items = P.items.filter(x => x !== id); self.hud(); },
      say: (t, done) => self.say(t, done),
      doc: (title, html, done) => self.doc(title, html, done),
      lock: id => self.lock(id),
      note(t){ if(!S.notes.includes(t)){ S.notes.push(t); toast('手帳に書き留めた'); } },
      miss: line => self.miss(line),
      sfx: n => Snd.play(n),
      clear: () => self.clear(),
      render: () => self.render(),
    };
  },
  doc(title, html, done){
    const b = openModal(`<h2>${esc(title)}</h2>${html}`, { onClose: done });
    return b;
  },

  /* ---------- 間違い・ヒント ---------- */
  nextMissLine(extra){
    const pool = (this.R.missLines || []).concat(MISS_LINES);
    let i; do { i = Math.floor(Math.random() * pool.length); } while(pool.length > 1 && i === this._lastMiss);
    this._lastMiss = i;
    return extra || pool[i];
  },
  miss(line){
    S.mistakes++; S.totalMiss++;
    Snd.play('ng');
    this.hud();
    const t = this.nextMissLine(line);
    toast(`今日の上限が下がった（${dayCap()}）`, 'capped');
    return t;
  },
  hint(){
    if(this.busy()) return;
    const P = S.puzzle, R = this.R;
    if(P.hintLv >= 3){ this.say(`広「もう、ぜんぶ言ったよ。……あとは、プロデューサーの番」`); return; }
    const b = openModal(`<h2>広に聞く<small>HINT ${P.hintLv + 1} / 3</small></h2>
      <p class="muted">広にヒントをもらいます。<br>今日の上限が <b style="color:var(--accent)">1</b> 下がります（現在 ${dayCap()}）。</p>
      <div class="m-row"><button class="mbtn" id="h-no">自分で考える</button><button class="mbtn pri" id="h-yes">聞く</button></div>`);
    b.querySelector('#h-no').onclick = closeModal;
    b.querySelector('#h-yes').onclick = () => {
      closeModal();
      S.hints++; S.totalHint++; P.hintLv++;
      this.hud();
      this.say(R.hints[P.hintLv - 1]);
    };
  },

  /* ---------- 錠前 ---------- */
  lock(id){
    const L = this.R.locks[id];
    const g = this.api();
    let val = [];
    const kana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('');
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const COLORS = { Y:'#f2d23c', R:'#e04848', G:'#3db86a', B:'#3f78e0', W:'#f4f4f4' };
    let keys = '';
    if(L.type === 'digits' || L.type === 'clock'){
      keys = `<div class="keys">${[1,2,3,4,5,6,7,8,9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button class="fn" data-k="del">消す</button><button data-k="0">0</button><button class="ok" data-k="ok">決定</button></div>`;
    } else if(L.type === 'alpha'){
      keys = `<div class="keys alpha">${alpha.map(c => `<button data-k="${c}">${c}</button>`).join('')}<button class="fn" data-k="del">消す</button></div><div class="keys" style="grid-template-columns:200px"><button class="ok" data-k="ok">決定</button></div>`;
    } else if(L.type === 'kana'){
      keys = `<div class="keys kana">${kana.map(c => `<button data-k="${c}">${c}</button>`).join('')}<button class="fn wide" data-k="del">消す</button></div><div class="keys" style="grid-template-columns:200px"><button class="ok" data-k="ok">決定</button></div>`;
    } else if(L.type === 'seq'){
      keys = `<div class="seq">${L.colors.map(c => `<button data-k="${c}" style="background:${COLORS[c]}" aria-label="${c}"></button>`).join('')}</div>`;
    }
    const b = openModal(`<h2>${esc(L.title)}</h2><div class="lock"><div class="prompt">${esc(L.prompt)}</div><div class="disp ${L.type}"></div>${keys}<div class="fb"></div></div>`);
    const disp = b.querySelector('.disp'), fb = b.querySelector('.fb'), lk = b.querySelector('.lock');
    const draw = () => {
      if(L.type === 'seq'){
        disp.className = 'seq-disp';
        disp.innerHTML = Array.from({ length: L.len }, (_, i) => `<i style="background:${val[i] ? COLORS[val[i]] : 'transparent'}"></i>`).join('');
        return;
      }
      disp.innerHTML = Array.from({ length: L.len }, (_, i) => `<span class="${i === val.length ? 'cur' : ''}">${val[i] || ''}</span>`).join('');
      if(L.type === 'clock') disp.children[1].insertAdjacentHTML('afterend', '<span style="width:20px;background:none;border:0">:</span>');
    };
    const check = () => {
      if(val.length < L.len){ fb.innerHTML = '……桁が足りない。'; return; }
      const v = val.join('');
      if(L.answer.includes(v)){
        Snd.play('ok');
        closeModal();
        L.ok(g);
      } else {
        const line = this.miss();
        lk.classList.remove('ng'); void lk.offsetWidth; lk.classList.add('ng');
        const m = line.match(/^広「(.*)」$/);
        fb.innerHTML = m ? `<b>広</b>「${esc(m[1])}」` : esc(line);
        pushLog('篠澤 広', line.replace(/^広/, ''));
        val = []; draw();
      }
    };
    b.querySelectorAll('[data-k]').forEach(btn => btn.onclick = () => {
      const k = btn.dataset.k;
      Snd.play('key');
      if(k === 'del') val.pop();
      else if(k === 'ok') return check();
      else if(val.length < L.len) val.push(k);
      draw();
      if(L.type === 'seq' && val.length === L.len) setTimeout(check, 250);
    });
    draw();
    // キーボード入力（PC向け）
    const onKey = e => {
      if($('#modal').classList.contains('hidden') || !b.isConnected){ document.removeEventListener('keydown', onKey); return; }
      let k = e.key;
      if(k === 'Enter') k = 'ok';
      else if(k === 'Backspace') k = 'del';
      else k = k.toUpperCase();
      if(L.type === 'seq') k = { '1':'R', '2':'B', '3':'Y', '4':'G' }[e.key] || k;
      const btn = [...b.querySelectorAll('[data-k]')].find(x => x.dataset.k === k);
      if(btn){ e.preventDefault(); btn.click(); }
    };
    document.addEventListener('keydown', onKey);
  },

  /* ---------- クリア ---------- */
  clear(){
    const n = S.puzzle.room, R = this.R;
    S.answers[n] = R.answerText;
    S.letters[n] = R.letter;
    Snd.play('door');
    this.say(R.clearText, () => {
      this.teardown();
      S.mode = 'novel'; S.puzzle = null;
      S.pc = S.cur + 1;
      step();
    });
  },

  /* ---------- 手帳 ---------- */
  notebook(){
    const rows = [];
    for(let i = 1; i <= 10; i++){
      if(S.answers[i] === undefined) continue;
      rows.push(`<li>ROOM ${String(i).padStart(2, '0')}「${ROOMS[i].theme}」 ― <b style="color:#fff">${esc(S.answers[i])}</b></li>`);
    }
    const letters = [];
    for(let i = 1; i <= 9; i++){
      if(S.letters[i] === undefined) continue;
      letters.push(`<span class="${S.letters[i] ? '' : 'blank'}"><small>${i}</small>${S.letters[i] || '?'}</span>`);
    }
    const hist = S.history.map(h => `<tr><td>${ROMAN[h.day]}日目</td><td>ミス ${h.miss}</td><td>ヒント ${h.hint}</td><td style="color:var(--accent)">${'♥'.repeat(h.gain)}</td></tr>`).join('');
    openModal(`<h2>手帳<small>プロデューサーのメモ</small></h2><div class="note-wrap">
      <div>
        <h3>開けた扉</h3><ul class="note-list">${rows.join('') || '<li class="muted">まだ、ひとつも開けていない。</li>'}</ul>
        <h3 style="margin-top:18px">扉の裏のプレート</h3><div class="letters">${letters.join('') || '<span class="muted" style="width:auto;background:none;color:#888;font-size:13px">―</span>'}</div>
        <h3 style="margin-top:18px">記録</h3><table class="memo-hist">${hist || '<tr><td class="muted">―</td></tr>'}</table>
      </div>
      <div><h3>書き留めたこと</h3><ul class="note-list">${S.notes.map(t => `<li>${esc(t)}</li>`).join('') || '<li class="muted">―</li>'}</ul></div>
    </div>`);
  },
};

/* ---------- HUDボタン ---------- */
$('#btn-note').onclick = e => { e.stopPropagation(); Snd.play('click'); if(TB.onNext) return; Puzzle.notebook(); };
$('#btn-hint').onclick = e => { e.stopPropagation(); Snd.play('click'); Puzzle.hint(); };
$('#btn-spots').onclick = e => { e.stopPropagation(); Snd.play('click'); const on = stage.classList.toggle('show-spots'); e.target.classList.toggle('on', on); };
$('#btn-inspect').onclick = e => {
  e.stopPropagation(); if(Puzzle.busy()) return;
  const P = S.puzzle, it = ITEMS[P.sel];
  P.sel = null; Puzzle.hud();
  if(it.doc) Puzzle.doc(it.name, typeof it.doc === 'function' ? it.doc() : it.doc);
  else Puzzle.say(it.desc);
};
