'use strict';
// ------------------------------------------------------------
//  core: namespace, math helpers, seeded rng, sprite compiler
// ------------------------------------------------------------
// Every sprite in the game is typed as text in js/art/*.js.
// One character = one pixel. The character is looked up in a
// palette (U.PAL, optionally overridden per sprite) to get a colour.
// '.' and ' ' are always transparent.
// ------------------------------------------------------------
window.U = window.U || {};

(function (U) {
  // ---------- math ----------
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  U.sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ---------- rng ----------
  // mulberry32: deterministic, used for field generation
  U.makeRng = function (seed) {
    let s = seed >>> 0;
    const r = function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (a, b) => a + r() * (b - a);
    r.int = (a, b) => Math.floor(a + r() * (b - a + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    return r;
  };
  U.rnd = U.makeRng((Date.now() ^ 0x5eed) >>> 0);

  // weighted pick: [[item, weight], ...]
  U.weighted = function (list, rng) {
    rng = rng || U.rnd;
    let total = 0;
    for (const [, w] of list) total += Math.max(0, w);
    let r = rng() * total;
    for (const [v, w] of list) {
      r -= Math.max(0, w);
      if (r <= 0) return v;
    }
    return list[list.length - 1][0];
  };

  // ---------- canvas ----------
  U.makeCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  };

  // ---------- sprites ----------
  U.PAL = {}; // filled by palette.js
  U.S = {}; // sprite registry: name -> Sprite | Sprite[]

  function hexToRgba(hex) {
    if (!hex) return null;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a];
  }
  U.hexToRgba = hexToRgba;

  // Sprite: { w, h, c: canvas, f: horizontally flipped canvas, ax, ay }
  // ax/ay = anchor (the pixel that sits on the entity position, usually the feet)
  function Sprite(rows, pal, ax, ay) {
    const h = rows.length;
    let w = 0;
    for (const r of rows) w = Math.max(w, r.length);
    this.w = w;
    this.h = h;
    this.ax = ax == null ? w >> 1 : ax;
    this.ay = ay == null ? h - 1 : ay;
    this.rows = rows;
    const c = U.makeCanvas(w, h);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const col = pal[ch] !== undefined ? pal[ch] : U.PAL[ch];
        if (col === undefined) throw new Error('unknown palette char "' + ch + '" in sprite row: ' + row);
        const rgba = hexToRgba(col);
        if (!rgba) continue;
        const i = (y * w + x) * 4;
        img.data[i] = rgba[0];
        img.data[i + 1] = rgba[1];
        img.data[i + 2] = rgba[2];
        img.data[i + 3] = rgba[3];
      }
    }
    ctx.putImageData(img, 0, 0);
    this.c = c;
    const f = U.makeCanvas(w, h);
    const fx = f.getContext('2d');
    fx.translate(w, 0);
    fx.scale(-1, 1);
    fx.drawImage(c, 0, 0);
    this.f = f;
  }

  // U.spr(rows, opts) -> Sprite
  // opts: { pal: {char: '#hex'}, ax, ay }
  U.spr = function (rows, opts) {
    opts = opts || {};
    if (typeof rows === 'string') rows = U.rows(rows);
    return new Sprite(rows, opts.pal || {}, opts.ax, opts.ay);
  };

  // Multi-line template string -> array of rows (leading/trailing blank lines & common indent removed)
  U.rows = function (str) {
    const lines = str.replace(/\r/g, '').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    let indent = Infinity;
    for (const l of lines) {
      if (!l.trim()) continue;
      indent = Math.min(indent, l.match(/^ */)[0].length);
    }
    return lines.map((l) => l.slice(indent).replace(/ +$/, ''));
  };

  // Apply a pixel patch to rows. patch: [[x, y, ch], ...]
  U.patch = function (rows, patch) {
    const out = rows.slice();
    for (const [x, y, ch] of patch) {
      let r = out[y];
      while (r.length <= x) r += '.';
      out[y] = r.slice(0, x) + ch + r.slice(x + 1);
    }
    return out;
  };

  // Replace characters in rows. map: {from: to}
  U.swap = function (rows, map) {
    return rows.map((r) => r.replace(/./g, (c) => (map[c] !== undefined ? map[c] : c)));
  };

  // Shift rows vertically (positive = down), keeping height.
  U.shiftY = function (rows, dy) {
    const w = Math.max.apply(null, rows.map((r) => r.length));
    const blank = '.'.repeat(w);
    const out = [];
    for (let y = 0; y < rows.length; y++) {
      const src = y - dy;
      out.push(src >= 0 && src < rows.length ? rows[src] : blank);
    }
    return out;
  };

  // Draw sprite so that its anchor lands on (x, y). Always integer pixels.
  U.draw = function (ctx, s, x, y, flip) {
    if (!s) return;
    const dx = Math.round(x) - (flip ? s.w - 1 - s.ax : s.ax);
    const dy = Math.round(y) - s.ay;
    ctx.drawImage(flip ? s.f : s.c, dx, dy);
  };
  // Draw sprite at top-left (no anchor)
  U.drawTL = function (ctx, s, x, y, flip) {
    if (!s) return;
    ctx.drawImage(flip ? s.f : s.c, Math.round(x), Math.round(y));
  };

  // Tinted copy of a sprite (every opaque pixel -> colour). Cached.
  const tintCache = new Map();
  U.tinted = function (s, hex) {
    const key = s;
    let m = tintCache.get(key);
    if (!m) tintCache.set(key, (m = {}));
    if (m[hex]) return m[hex];
    const rgba = hexToRgba(hex);
    const rows = s.rows.map((r) => r.replace(/[^. ]/g, 'X'));
    const t = new Sprite(rows, { X: hex }, s.ax, s.ay);
    void rgba;
    m[hex] = t;
    return t;
  };

  // integer-pixel filled rect
  U.rect = function (ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
})(window.U);
