/*
 * Pixel art core.
 *
 * Sprites are hand-typed string grids. One character = one pixel.
 *   '.' or ' '  transparent
 *   o a b c d e  -> "gene colour" slots (recoloured per character colour gene)
 *                    o outline, a main, b shade, c light, d accent, e accent shade
 *   anything else -> fixed colours (TM.FIXED) or a sprite-local palette.
 *
 * TM.spr(rows, {mirror, pal}) :
 *   mirror: true   -> rows are the LEFT half; the right half is the mirror image
 *   mirror: 'odd'  -> like true but the last column is the centre (not doubled)
 *   pal: { key: '#rrggbb' }  local colours for this sprite only
 */
(function () {
  'use strict';

  // Fixed palette shared by all art.
  TM.FIXED = {
    k: '#2b1d3a', // ink (eyes, lines)
    K: '#000000',
    w: '#ffffff',
    l: '#e6e6f2', // light gray
    m: '#b4b4c8', // gray
    M: '#6e6e88', // dark gray
    p: '#ff9ec2', // cheek pink
    P: '#ff6fa3', // hot pink
    r: '#ff4d5e', // red
    R: '#b8283a', // dark red
    t: '#ff9a3c', // orange
    T: '#c8641e', // dark orange
    y: '#ffd84a', // yellow
    Y: '#d9a41e', // dark yellow
    q: '#fff3b0', // cream
    g: '#7ed56f', // green
    G: '#3f9a4a', // dark green
    h: '#c9f29b', // light green
    u: '#5ab4ff', // blue
    U: '#2f6fc0', // dark blue
    j: '#bfe6ff', // light blue
    v: '#b48cf0', // purple
    V: '#6c48b0', // dark purple
    n: '#c88a52', // brown
    N: '#7a4a28', // dark brown
    s: '#ffe0c4', // skin / beige
    S: '#f2b890', // skin shade
    x: '#ffd0e0', // pale pink
    z: '#1c2448', // night navy
    Z: '#10152e', // deep night
    '1': '#8fd3ff', // sky
    '2': '#c7ecff', // sky light
    '3': '#ffe38a', // sun
    '4': '#9ce7c0', // mint
    '5': '#f6c6ff', // lilac
    '6': '#ffb3b3', // salmon
    '7': '#dcb482', // wood light
    '8': '#b07a4a', // wood
    '9': '#8a5a32', // wood dark
    '0': '#fdf6e8', // off white
  };

  let SPR_UID = 0;
  TM.spr = function (rows, opts) {
    opts = opts || {};
    let r = rows.slice();
    if (opts.mirror) {
      r = r.map((row) => {
        const rev = row.split('').reverse();
        if (opts.mirror === 'odd') rev.shift();
        return row + rev.join('');
      });
    }
    const w = Math.max(...r.map((s) => s.length));
    const h = r.length;
    // pad rows (and warn: hand-typed art sometimes has a missing pixel)
    r = r.map((s, i) => {
      if (s.length !== w && TM.DEV) console.warn('sprite row length mismatch', opts.name || '', i, s);
      return s.padEnd(w, '.');
    });
    return { uid: ++SPR_UID, w, h, rows: r, pal: opts.pal || null, name: opts.name || '' };
  };

  // Resolve colour of key given a gene palette.
  function col(key, spr, gp) {
    if (spr.pal && spr.pal[key]) return spr.pal[key];
    if (gp && gp[key]) return gp[key];
    return TM.FIXED[key] || null;
  }

  // ---- sprite -> canvas cache ----
  const cache = new Map();
  TM.sprCanvas = function (spr, gp, flip) {
    const key = spr.uid + '|' + (gp ? gp.id : '-') + '|' + (flip ? 1 : 0);
    let c = cache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = spr.w;
    c.height = spr.h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(spr.w, spr.h);
    for (let y = 0; y < spr.h; y++) {
      const row = spr.rows[y];
      for (let x = 0; x < spr.w; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const hex = col(ch, spr, gp);
        if (!hex) continue;
        const dx = flip ? spr.w - 1 - x : x;
        const i = (y * spr.w + dx) * 4;
        img.data[i] = parseInt(hex.substr(1, 2), 16);
        img.data[i + 1] = parseInt(hex.substr(3, 2), 16);
        img.data[i + 2] = parseInt(hex.substr(5, 2), 16);
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    cache.set(key, c);
    return c;
  };
  TM.clearSprCache = () => cache.clear();

  // Masked copy: returns a new sprite with pixels removed where mask has '#'.
  // Used for bite marks on food (masks are hand-typed too).
  TM.sprMask = function (spr, mask, fromRight) {
    const rows = spr.rows.map((row, y) => {
      let out = '';
      for (let x = 0; x < spr.w; x++) {
        const mx = fromRight ? mask.w - (spr.w - x) : x;
        const my = y;
        const m = mx >= 0 && mx < mask.w && my < mask.h ? mask.rows[my][mx] : '.';
        out += m === '#' ? '.' : row[x];
      }
      return out;
    });
    const s = TM.spr(rows, { pal: spr.pal });
    return s;
  };

  // Offscreen composition helper: draw several layers into one canvas.
  TM.compose = function (w, h, layers) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    for (const L of layers) {
      if (!L || !L.spr) continue;
      ctx.drawImage(TM.sprCanvas(L.spr, L.gp, L.flip), L.x | 0, L.y | 0);
    }
    return c;
  };
})();
