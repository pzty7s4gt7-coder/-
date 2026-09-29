/*
 * Scene manager, particles, pet actor, sound, input.
 *
 * A scene is   TM.scenes.name = { enter(args), update(dt), draw(G, t), btn(b), tap(x, y) }
 *   b is 'A' (next / left), 'B' (decide), 'C' (back)
 */
(function () {
  'use strict';
  const U = TM.util;

  // ---------------- scenes ----------------
  const SC = (TM.sc = { cur: null, name: '', t: 0 });
  SC.go = function (name, args) {
    const s = TM.scenes[name];
    if (!s) { console.warn('no scene', name); return; }
    SC.cur = s;
    SC.name = name;
    SC.t = 0;
    if (s.enter) s.enter(args || {});
  };

  // ---------------- particles ----------------
  const FX = (TM.fx = { list: [] });
  FX.add = function (o) {
    FX.list.push(Object.assign({ x: 64, y: 64, vx: 0, vy: 0, g: 0, life: 1, t: 0 }, o));
  };
  FX.hearts = function (x, y, n) {
    for (let i = 0; i < (n || 3); i++)
      FX.add({ spr: i % 2 ? TM.ITEM.heartS : TM.ITEM.heart, x: x - 6 + U.rand(12), y: y - U.rand(6), vx: (Math.random() - 0.5) * 12, vy: -18 - U.rand(10), life: 1.2 + Math.random() * 0.5 });
  };
  FX.sparkle = function (x, y, n) {
    for (let i = 0; i < (n || 5); i++)
      FX.add({ anim: TM.ITEM.sparkle, x: x - 14 + U.rand(28), y: y - U.rand(28), life: 0.6 + Math.random() * 0.6, blink: true });
  };
  FX.update = function (dt) {
    for (const f of FX.list) {
      f.t += dt;
      f.vy += f.g * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
    }
    FX.list = FX.list.filter((f) => f.t < f.life);
  };
  FX.draw = function (G) {
    for (const f of FX.list) {
      let s = f.spr;
      if (f.anim) s = f.anim[Math.floor((f.t / f.life) * f.anim.length) % f.anim.length];
      if (f.blink && Math.floor(f.t * 10) % 3 === 0) continue;
      G.spr(s, Math.round(f.x - s.w / 2), Math.round(f.y - s.h / 2), { gp: f.gp });
    }
  };
  FX.clear = () => (FX.list = []);

  // ---------------- pet actor ----------------
  // Handles blinking, bounce frames and wandering; scenes may override expr.
  const A = (TM.actor = {
    x: 64, dir: 1, target: 64, mode: 'idle', modeT: 0, blinkT: 2, blink: 0, frameT: 0, frame: 0, hop: 0,
    expr: null, exprT: 0,
  });
  A.reset = function (x) {
    A.x = x != null ? x : 64; A.target = A.x; A.mode = 'idle'; A.modeT = 1; A.expr = null; A.exprT = 0;
  };
  A.say = function (expr, secs) { A.expr = expr; A.exprT = secs || 1.5; };
  A.update = function (dt, wander, minX, maxX) {
    A.frameT += dt;
    if (A.frameT > 0.5) { A.frameT = 0; A.frame ^= 1; }
    A.blinkT -= dt;
    if (A.blinkT <= 0) { A.blink = 0.15; A.blinkT = 2 + Math.random() * 3; }
    if (A.blink > 0) A.blink -= dt;
    if (A.exprT > 0) { A.exprT -= dt; if (A.exprT <= 0) A.expr = null; }
    if (!wander) return;
    A.modeT -= dt;
    if (A.modeT <= 0) {
      const r = Math.random();
      if (r < 0.5) { A.mode = 'walk'; A.target = U.clamp(A.x + (Math.random() - 0.5) * 70, minX || 20, maxX || 108); A.modeT = 4; }
      else if (r < 0.7) { A.mode = 'hop'; A.modeT = 1.2; }
      else if (r < 0.8) { A.mode = 'look'; A.modeT = 1.5; }
      else { A.mode = 'idle'; A.modeT = 1.5 + Math.random() * 2; }
    }
    if (A.mode === 'walk') {
      const d = A.target - A.x;
      if (Math.abs(d) < 1) { A.mode = 'idle'; A.modeT = 1 + Math.random() * 2; }
      else { A.dir = d > 0 ? 1 : -1; A.x += A.dir * Math.min(Math.abs(d), 12 * dt); }
    }
    if (A.mode === 'look' && A.frameT === 0) A.dir = -A.dir;
  };
  A.hopY = function () {
    if (A.mode === 'hop') return -Math.abs(Math.round(Math.sin(A.modeT * 10) * 4));
    if (A.mode === 'walk') return A.frame ? -1 : 0;
    return 0;
  };
  // expression taking blinking into account
  A.face = function (base) {
    const e = Object.assign({ eyes: 'open', mouth: 'smile' }, base || {}, A.expr || {});
    if (A.blink > 0 && e.eyes === 'open') e.eyes = 'closed';
    return e;
  };
  // draw the current pet (or any {genes,stage}) at x / ground
  TM.drawPet = function (pet, x, ground, o) {
    o = o || {};
    const stage = pet.stage;
    let y = ground;
    let frame = 0;
    if (stage === 'adult') frame = o.frame != null ? o.frame : 0;
    else if (o.frame) y -= 1; // small hop for non-adults
    TM.look.draw(pet.genes, stage, x, y + (o.dy || 0), { expr: o.expr, frame, flip: o.flip, alpha: o.alpha });
  };
  TM.drawShadow = function (x, ground, w) {
    w = w || 16;
    TM.gfx.alpha(0.18);
    TM.gfx.rect(Math.round(x - w / 2 + 1), ground - 1, w - 2, 2, '#2b1d3a');
    TM.gfx.rect(Math.round(x - w / 2), ground, w, 1, '#2b1d3a');
    TM.gfx.alpha(1);
  };

  // ---------------- sound (tiny beeps) ----------------
  let ac = null;
  TM.muted = false;
  const tones = {
    beep: [[1760, 0.05]],
    ok: [[1320, 0.05], [1760, 0.07]],
    cancel: [[880, 0.06], [660, 0.08]],
    eat: [[520, 0.04], [0, 0.03], [620, 0.04]],
    happy: [[1047, 0.08], [1319, 0.08], [1568, 0.12]],
    sad: [[660, 0.15], [523, 0.25]],
    call: [[1760, 0.08], [0, 0.05], [1760, 0.08], [0, 0.05], [1760, 0.08]],
    fanfare: [[784, 0.1], [988, 0.1], [1175, 0.1], [1568, 0.3]],
    flush: [[300, 0.05], [260, 0.05], [220, 0.05], [200, 0.05], [180, 0.1]],
    hatch: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.2]],
    wed: [[784, 0.2], [784, 0.1], [1047, 0.3], [988, 0.15], [880, 0.15], [1047, 0.4]],
  };
  TM.sfx = function (name) {
    if (TM.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      let t = ac.currentTime;
      for (const [f, d] of tones[name] || tones.beep) {
        if (f) {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.05, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + d);
          o.connect(g).connect(ac.destination);
          o.start(t);
          o.stop(t + d);
        }
        t += d;
      }
    } catch (e) { /* no audio */ }
  };

  // ---------------- list menu helper ----------------
  // A reusable vertical list (used by food / toy / room / outing selection)
  TM.ListMenu = function (items, o) {
    o = o || {};
    return {
      items, i: 0, top: 0, rows: o.rows || 4,
      get cur() { return this.items[this.i]; },
      next() { this.i = (this.i + 1) % this.items.length; this.fix(); TM.sfx('beep'); },
      prev() { this.i = (this.i - 1 + this.items.length) % this.items.length; this.fix(); TM.sfx('beep'); },
      fix() { if (this.i < this.top) this.top = this.i; if (this.i >= this.top + this.rows) this.top = this.i - this.rows + 1; },
      draw(G, x, y, w, rowH, label) {
        for (let r = 0; r < this.rows; r++) {
          const idx = this.top + r;
          if (idx >= this.items.length) break;
          const it = this.items[idx];
          const sel = idx === this.i;
          if (sel) G.box(x, y + r * rowH, w, rowH - 1, { bg: '#ffe3ef', border: '#ff6fa3', shadow: '#ffc4d8' });
          label(it, x, y + r * rowH, sel);
        }
        if (this.top > 0) G.spr(TM.ARROW_UP, x + w - 8, y - 5);
        if (this.top + this.rows < this.items.length) G.spr(TM.ARROW_DN, x + w - 8, y + this.rows * rowH);
      },
      // returns index hit by a tap, or -1
      hit(x, y, bx, by, w, rowH) {
        if (x < bx || x > bx + w) return -1;
        const r = Math.floor((y - by) / rowH);
        if (r < 0 || r >= this.rows) return -1;
        const idx = this.top + r;
        return idx < this.items.length ? idx : -1;
      },
    };
  };
  TM.ARROW_UP = TM.spr(['..k..', '.kkk.', 'kkkkk']);
  TM.ARROW_DN = TM.spr(['kkkkk', '.kkk.', '..k..']);
  TM.ARROW_L = TM.spr(['..k', '.kk', 'kkk', '.kk', '..k']);
  TM.ARROW_R = TM.spr(['k..', 'kk.', 'kkk', 'kk.', 'k..']);
})();
