/*
 * Renderer. The world is 128x128 "pixels"; the canvas is 256x256 so that
 * Japanese text (DotGothic16, a pixel font) can be drawn crisply at 16px.
 * All sprite drawing uses integer world coordinates -> pixel perfect.
 */
(function () {
  'use strict';
  const G = (TM.gfx = {});
  let cv, ctx;
  const S = TM.SCALE;
  G.FONT = '"DotGothic16", "Hiragino Maru Gothic ProN", monospace';

  G.init = function (canvas) {
    cv = canvas;
    cv.width = TM.W * S;
    cv.height = TM.H * S;
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    G.ctx = ctx;
  };

  G.begin = function () {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
  };

  G.rect = function (x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  };
  G.px = (x, y, c) => G.rect(x, y, 1, 1, c);
  G.clear = (c) => G.rect(0, 0, TM.W, TM.H, c);
  G.alpha = (a) => (ctx.globalAlpha = a);

  G.spr = function (spr, x, y, o) {
    if (!spr) return;
    o = o || {};
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(TM.sprCanvas(spr, o.gp, o.flip), Math.round(x), Math.round(y));
    if (o.alpha != null) ctx.globalAlpha = 1;
  };
  // integer-scaled sprite (still pixel perfect: each pixel becomes s x s)
  G.sprS = function (spr, x, y, s, o) {
    if (!spr) return;
    o = o || {};
    const c = TM.sprCanvas(spr, o.gp, o.flip);
    ctx.drawImage(c, 0, 0, spr.w, spr.h, Math.round(x), Math.round(y), spr.w * s, spr.h * s);
  };
  // draw sprite anchored at bottom-centre
  G.sprBC = function (spr, cx, by, o) {
    if (!spr) return;
    G.spr(spr, Math.round(cx - spr.w / 2), Math.round(by - spr.h), o);
  };
  G.img = function (canvas, x, y, flip, alpha) {
    if (alpha != null) ctx.globalAlpha = alpha;
    x = Math.round(x); y = Math.round(y);
    if (flip) {
      ctx.save();
      ctx.translate(x + canvas.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    } else ctx.drawImage(canvas, x, y);
    if (alpha != null) ctx.globalAlpha = 1;
  };

  // tile a sprite over an area
  G.tile = function (spr, x, y, w, h, gp) {
    const c = TM.sprCanvas(spr, gp);
    for (let ty = y; ty < y + h; ty += spr.h)
      for (let tx = x; tx < x + w; tx += spr.w) {
        const cw = Math.min(spr.w, x + w - tx), ch = Math.min(spr.h, y + h - ty);
        ctx.drawImage(c, 0, 0, cw, ch, tx, ty, cw, ch);
      }
  };

  // ---------- Text (thresholded => no anti-alias) ----------
  const tcache = new Map();
  // The pixel font only thresholds cleanly when its dots sit exactly on the
  // pixel grid. Find the sub-pixel offset that gives the least grey pixels.
  let OFF = { x: 0, y: 0 };
  G.calibrateFont = function () {
    const t = document.createElement('canvas');
    t.width = 200; t.height = 24;
    const c = t.getContext('2d');
    let best = 1e18;
    for (let oy = 0; oy < 1; oy += 0.125)
      for (let ox = 0; ox < 1; ox += 0.25) {
        c.clearRect(0, 0, 200, 24);
        c.font = '16px ' + G.FONT;
        c.textBaseline = 'top';
        c.fillStyle = '#000';
        c.fillText('ドレスあたまごはんパ', 2 + ox, 2 + oy);
        const d = c.getImageData(0, 0, 200, 24).data;
        let grey = 0;
        for (let i = 3; i < d.length; i += 4) grey += d[i] * (255 - d[i]);
        if (grey < best) { best = grey; OFF = { x: ox, y: oy }; }
      }
    tcache.clear();
  };
  function textCanvas(str, color, outline) {
    const key = str + '|' + color + '|' + (outline || '');
    let c = tcache.get(key);
    if (c) return c;
    const t = document.createElement('canvas');
    const tctx = t.getContext('2d');
    tctx.font = '16px ' + G.FONT;
    const w = Math.ceil(tctx.measureText(str).width) + 4;
    t.width = w;
    t.height = 20;
    tctx.font = '16px ' + G.FONT;
    tctx.textBaseline = 'top';
    tctx.fillStyle = '#000';
    tctx.fillText(str, 2 + OFF.x, 2 + OFF.y);
    const src = tctx.getImageData(0, 0, w, 20);
    const on = new Uint8Array(w * 20);
    for (let i = 0; i < on.length; i++) on[i] = src.data[i * 4 + 3] > 120 ? 1 : 0;
    const out = tctx.createImageData(w, 20);
    const put = (i, hex) => {
      out.data[i * 4] = parseInt(hex.substr(1, 2), 16);
      out.data[i * 4 + 1] = parseInt(hex.substr(3, 2), 16);
      out.data[i * 4 + 2] = parseInt(hex.substr(5, 2), 16);
      out.data[i * 4 + 3] = 255;
    };
    if (outline) {
      for (let y = 0; y < 20; y++)
        for (let x = 0; x < w; x++) {
          if (on[y * w + x]) continue;
          let n = false;
          for (let dy = -1; dy <= 1 && !n; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx, yy = y + dy;
              if (xx >= 0 && yy >= 0 && xx < w && yy < 20 && on[yy * w + xx]) { n = true; break; }
            }
          if (n) put(y * w + x, outline);
        }
    }
    for (let i = 0; i < on.length; i++) if (on[i]) put(i, color);
    tctx.putImageData(out, 0, 0);
    c = t;
    c._w = w - 4;
    tcache.set(key, c);
    return c;
  }
  G.clearTextCache = () => tcache.clear();

  // width of text in WORLD pixels
  G.textW = function (str) {
    return Math.ceil(textCanvas(str, '#000')._w / S);
  };
  // x,y are world coords of the text's top-left (8px high line)
  G.text = function (str, x, y, o) {
    if (str == null || str === '') return;
    str = String(str);
    o = o || {};
    const c = textCanvas(str, o.color || TM.FIXED.k, o.outline);
    let px = x * S;
    if (o.align === 'center') px -= c._w / 2;
    else if (o.align === 'right') px -= c._w;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(c, Math.round(px) - 2, Math.round(y * S) - 2);
    ctx.restore();
  };

  // ---------- tiny 3x5 digit font (hand typed) ----------
  const DIG = {
    '0': ['###', '#.#', '#.#', '#.#', '###'],
    '1': ['.#.', '##.', '.#.', '.#.', '###'],
    '2': ['###', '..#', '###', '#..', '###'],
    '3': ['###', '..#', '.##', '..#', '###'],
    '4': ['#.#', '#.#', '###', '..#', '..#'],
    '5': ['###', '#..', '###', '..#', '###'],
    '6': ['###', '#..', '###', '#.#', '###'],
    '7': ['###', '..#', '.#.', '.#.', '.#.'],
    '8': ['###', '#.#', '###', '#.#', '###'],
    '9': ['###', '#.#', '###', '..#', '###'],
    ':': ['...', '.#.', '...', '.#.', '...'],
    '/': ['..#', '..#', '.#.', '#..', '#..'],
    '%': ['#.#', '..#', '.#.', '#..', '#.#'],
    '.': ['...', '...', '...', '...', '.#.'],
    '-': ['...', '...', '###', '...', '...'],
    '+': ['...', '.#.', '###', '.#.', '...'],
    'x': ['...', '#.#', '.#.', '#.#', '...'],
    'g': ['...', '###', '#.#', '###', '..#'],
    'P': ['##.', '#.#', '##.', '#..', '#..'],
    'L': ['#..', '#..', '#..', '#..', '###'],
    'v': ['...', '...', '#.#', '#.#', '.#.'],
    ' ': ['...', '...', '...', '...', '...'],
  };
  G.num = function (str, x, y, c) {
    str = String(str);
    ctx.fillStyle = c || TM.FIXED.k;
    for (let i = 0; i < str.length; i++) {
      const g = DIG[str[i]];
      if (g) for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) if (g[yy][xx] === '#') ctx.fillRect(x + i * 4 + xx, y + yy, 1, 1);
    }
  };
  G.numW = (str) => String(str).length * 4 - 1;

  // ---------- window / dialog box with pixel rounded corners ----------
  G.box = function (x, y, w, h, o) {
    o = o || {};
    const bd = o.border || '#6b4a8a', bg = o.bg || '#fffaf0', sh = o.shadow || '#e8d8f0';
    G.rect(x + 2, y, w - 4, 1, bd);
    G.rect(x + 2, y + h - 1, w - 4, 1, bd);
    G.rect(x, y + 2, 1, h - 4, bd);
    G.rect(x + w - 1, y + 2, 1, h - 4, bd);
    G.px(x + 1, y + 1, bd); G.px(x + w - 2, y + 1, bd);
    G.px(x + 1, y + h - 2, bd); G.px(x + w - 2, y + h - 2, bd);
    G.rect(x + 2, y + 1, w - 4, h - 2, bg);
    G.rect(x + 1, y + 2, w - 2, h - 4, bg);
    G.rect(x + 2, y + h - 2, w - 4, 1, sh);
  };

  // speech-bubble style message at bottom
  G.msg = function (lines, o) {
    o = o || {};
    if (!Array.isArray(lines)) lines = [lines];
    const h = 6 + lines.length * 10;
    const y = o.y != null ? o.y : TM.H - h - 2;
    G.box(2, y, TM.W - 4, h, o);
    lines.forEach((l, i) => G.text(l, 8, y + 4 + i * 10, { color: o.color || '#4a2f60' }));
  };
})();
