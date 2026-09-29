/*
 * DEBUG MODE — check genetics quickly.
 *  - change time speed, grow instantly, set stats
 *  - edit the current pet's 5 genes
 *  - pick any partner (preset / random / custom) and marry any time
 *  - simulate many children to see the inheritance
 */
(function () {
  'use strict';
  const GM = TM.game;
  const GN = TM.genetics;
  const D = (TM.debug = {});
  const KEYS = () => GN.KEYS;

  const h = (tag, attrs, kids) => {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'on') Object.entries(v).forEach(([ev, fn]) => e.addEventListener(ev, fn));
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    });
    (kids || []).forEach((c) => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };
  const btn = (text, fn) => h('button', { on: { click: () => { fn(); D.refresh(); } } }, [text]);

  // big (x3) preview canvas of a character
  function preview(genes, stage, scale) {
    scale = scale || 3;
    const c = h('canvas', { width: TM.look.W * scale, height: TM.look.H * scale });
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(TM.look.canvas(genes, stage || 'adult', { eyes: 'open', mouth: 'smile' }, 0), 0, 0, TM.look.W * scale, TM.look.H * scale);
    return c;
  }
  function geneSelects(genes, onChange) {
    const box = h('div', { class: 'genes' });
    KEYS().forEach((k) => {
      const sel = h('select', { on: { change: () => { genes[k] = sel.value; onChange(); } } });
      TM.list(k).forEach((p) => sel.appendChild(h('option', { value: p.id, text: p.name })));
      sel.value = genes[k];
      box.appendChild(h('span', { text: TM.look.GENE_NAMES[k] }));
      box.appendChild(sel);
    });
    return box;
  }

  D.partner = null;
  D.init = function () {
    const panel = document.getElementById('debug');
    const b = document.getElementById('debugBtn');
    b.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      GM.s.debug = !panel.hidden;
      b.classList.toggle('on', !panel.hidden);
      if (!panel.hidden) D.refresh();
    });
    const m = document.getElementById('muteBtn');
    m.addEventListener('click', () => { TM.muted = !TM.muted; m.textContent = 'おと: ' + (TM.muted ? 'OFF' : 'ON'); });
    if (GM.s.debug) { panel.hidden = false; b.classList.add('on'); D.refresh(); }
  };

  D.refresh = function () {
    const panel = document.getElementById('debug');
    if (panel.hidden) return;
    panel.innerHTML = '';
    const s = GM.s, p = s.pet;
    if (!D.partner) D.partner = { name: TM.util.makeName(), gender: p.gender === 'm' ? 'f' : 'm', genes: GN.random() };

    // ---- time & growth ----
    panel.appendChild(h('h3', { text: 'じかん・せいちょう' }));
    const speed = h('select', { on: { change: () => { s.timeScale = +speed.value; } } });
    [[1, '1ばい'], [60, '60ばい（1ぷん/びょう）'], [600, '600ばい'], [3600, '3600ばい（1じかん/びょう）']].forEach(([v, t]) => speed.appendChild(h('option', { value: v, text: t })));
    speed.value = s.timeScale;
    const clock = h('select', { on: { change: () => { s.clockOffset = +clock.value; } } });
    for (let o = -12; o <= 12; o++) clock.appendChild(h('option', { value: o, text: (o >= 0 ? '+' : '') + o + 'じかん' }));
    clock.value = s.clockOffset || 0;
    panel.appendChild(h('div', { class: 'row' }, [h('label', {}, ['はやさ ', speed]), h('label', {}, ['とけい ', clock])]));
    panel.appendChild(h('div', { class: 'row' }, [
      h('span', { text: 'いま: ' + TM.STAGE_NAME[p.stage] + ' / だい' + p.gen + 'せだい / ' + p.name }),
    ]));
    panel.appendChild(h('div', { class: 'row' }, [
      btn('つぎへ せいちょう', () => {
        if (p.stage === 'egg') { p.stageT = GM.CFG.stageTime.egg; TM.sc.go('home'); return; }
        const from = p.stage;
        if (GM.grow(true)) TM.sc.go('grow', { from });
      }),
      btn('すぐ おとなに', () => {
        const from = p.stage;
        while (p.stage !== 'adult') GM.grow(true);
        TM.sc.go('grow', { from: from === 'adult' ? 'child' : from });
      }),
      btn('たまごに もどす', () => { p.stage = 'egg'; p.stageT = 0; TM.sc.go('home'); }),
    ]));

    // ---- stats ----
    panel.appendChild(h('h3', { text: 'ステータス' }));
    panel.appendChild(h('div', { class: 'row' }, [
      btn('おなかMAX', () => (p.hunger = 4)),
      btn('ごきげんMAX', () => (p.happy = 4)),
      btn('おなか0', () => (p.hunger = 0)),
      btn('うんち', () => p.poops.length < 4 && p.poops.push({ x: 10 + TM.util.rand(100), t: 0 })),
      btn('びょうき', () => (p.sick = true)),
      btn('なおす', () => (p.sick = false)),
      btn('+100P', () => (s.points += 100)),
      btn('おこす', () => { p.sleeping = false; s.clockOffset = 12 - new Date().getHours(); }),
    ]));

    // ---- current pet genes ----
    panel.appendChild(h('h3', { text: 'いまのキャラの いでんし' }));
    const pair = h('div', { class: 'pair' });
    const left = h('div');
    left.appendChild(preview(p.genes, 'adult'));
    left.appendChild(geneSelects(p.genes, () => { GM.markSeen(p.genes); D.refresh(); }));
    left.appendChild(h('div', { class: 'row' }, [btn('ランダム', () => { p.genes = GN.random(); GM.markSeen(p.genes); })]));

    // ---- partner ----
    const right = h('div');
    right.appendChild(preview(D.partner.genes, 'adult'));
    right.appendChild(geneSelects(D.partner.genes, () => D.refresh()));
    const preset = h('select', {
      on: {
        change: () => {
          const c = TM.get('character', preset.value);
          if (c) D.partner = { name: c.name, gender: c.gender, genes: Object.assign({}, c.genes) };
          D.refresh();
        },
      },
    });
    preset.appendChild(h('option', { value: '', text: '— キャラから えらぶ —' }));
    TM.list('character').forEach((c) => preset.appendChild(h('option', { value: c.id, text: c.name })));
    right.appendChild(h('div', { class: 'row' }, [preset, btn('ランダム', () => (D.partner = { name: TM.util.makeName(), gender: p.gender === 'm' ? 'f' : 'm', genes: GN.random() }))]));
    pair.appendChild(h('div', {}, [h('b', { text: 'じぶん (ちち/はは A)' }), left]));
    pair.appendChild(h('div', {}, [h('b', { text: 'あいて: ' + D.partner.name + ' (B)' }), right]));
    panel.appendChild(pair);

    // ---- breeding ----
    panel.appendChild(h('h3', { text: 'こうはい テスト' }));
    const kids = h('div', { class: 'kids' });
    const simulate = () => {
      kids.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const r = GN.breed(p.genes, D.partner.genes);
        const k = h('div', { class: 'kid' });
        k.appendChild(preview(r.genes, 'adult', 2));
        k.appendChild(h('div', {}, KEYS().map((g) => h('span', { class: 'src-' + r.src[g], text: { a: 'A', b: 'B', m: '変' }[r.src[g]] }))));
        k.title = GN.describe(r.genes);
        kids.appendChild(k);
      }
    };
    panel.appendChild(h('div', { class: 'row' }, [
      h('button', { on: { click: simulate } }, ['こどもを 12かい シミュレート']),
      btn('この あいてと けっこん！', () => TM.sc.go('wedding', { npc: Object.assign({ stage: 'adult' }, JSON.parse(JSON.stringify(D.partner))) })),
      btn('おでかけで であう', () => { TM.sc.go('place', { place: TM.util.pick(TM.ids('place')) }); }),
    ]));
    const love = h('input', { type: 'checkbox' });
    love.checked = !!s.alwaysLove;
    love.addEventListener('change', () => (s.alwaysLove = love.checked));
    panel.appendChild(h('div', { class: 'row' }, [h('label', {}, [love, 'おみあい かならず せいこう']), h('span', { class: 'log', text: 'A=じぶん B=あいて 変=とつぜんへんい (' + Math.round(GN.MUTATION * 100) + '%)' })]));
    panel.appendChild(kids);

    // ---- history ----
    if (s.family.length) {
      panel.appendChild(h('h3', { text: 'せだいの きろく' }));
      s.family.slice().reverse().forEach((f) => {
        const r = h('div', { class: 'row' });
        r.appendChild(h('span', { text: 'Gen' + f.gen + ' ' + f.name + ' ♥ ' + f.partner.name + ' → ' }));
        r.appendChild(preview(f.child, 'adult', 1));
        if (f.src) r.appendChild(h('span', {}, KEYS().map((g) => h('span', { class: 'src-' + f.src[g], text: { a: 'A', b: 'B', m: '変' }[f.src[g]] }))));
        panel.appendChild(r);
      });
    }

    panel.appendChild(h('h3', { text: 'セーブ' }));
    panel.appendChild(h('div', { class: 'row' }, [
      btn('セーブ', () => GM.save()),
      btn('ぜんぶ けす（さいしょから）', () => { if (confirm('セーブデータを けしますか？')) { GM.reset(); TM.sc.go('home'); } }),
    ]));
  };

  // keep the "now" line fresh when scenes change the pet
  let last = '';
  TM.onFrame = function () {
    const p = GM.s.pet;
    const key = p.id + p.stage + JSON.stringify(p.genes) + GM.s.family.length;
    if (key !== last) { last = key; D.refresh(); }
  };
})();
