/*
 * Look composer: genes + stage + expression  ->  a 40x40 canvas.
 *
 * genes = { color, eyes, head, body, back }   (ids of registered parts)
 * expr  = { eyes: 'open'|'closed'|'happy'|'sick'|'cry', mouth: 'smile'|'open'|'chew'|'frown'|'o'|'big'|'line' }
 * frame = 0 | 1   (1 = squash: head sinks 1px, used for the idle bounce)
 *
 * Draw order: back → body → head → eyes → cheeks → mouth
 */
(function () {
  'use strict';
  const L = (TM.look = { W: 40, H: 40 });
  const CX = 20;
  const cache = new Map();

  L.GENE_KEYS = ['color', 'eyes', 'head', 'body', 'back'];
  L.GENE_NAMES = { color: 'いろ', eyes: 'め', head: 'あたま', body: 'からだ', back: 'せなか' };

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  L.hash = hash;

  function eyeVariant(def, mode) {
    const o = def.open;
    const w = TM.util.clamp(o.w, 2, 6);
    switch (mode) {
      case 'closed': return def.closed || TM.EYE_CLOSED[w];
      case 'happy': return def.happy || TM.EYE_HAPPY[w];
      case 'sick': return TM.EYE_SICK;
      case 'cry': return TM.EYE_CRY;
      default: return o;
    }
  }

  function drawFace(ctx, gp, eyesDef, fx, top, eyeY, mouthY, gap, mouthMode, eyeMode, beak) {
    const open = eyesDef.open;
    const ew = open.w, eh = open.h;
    const lx = CX - gap / 2 - ew;
    const rx = CX + gap / 2;
    const ey = top + eyeY;
    const v = eyeVariant(eyesDef, eyeMode);
    let dx = Math.floor((ew - v.w) / 2), dy = 0;
    if (v !== open) dy = eyeMode === 'closed' ? eh - v.h - 1 : Math.floor((eh - v.h) / 2);
    if (eyeMode === 'cry' || eyeMode === 'sick') dy = Math.max(0, eh - v.h);
    ctx.drawImage(TM.sprCanvas(v, gp, false), lx + dx, ey + dy);
    ctx.drawImage(TM.sprCanvas(v, gp, true), rx + (ew - v.w - dx), ey + dy);
    // cheeks
    const cy = Math.min(ey + eh, top + mouthY);
    const ch = TM.sprCanvas(TM.CHEEK, gp);
    ctx.drawImage(ch, lx - 1, cy);
    ctx.drawImage(ch, rx + ew - 2, cy);
    // mouth / beak
    let m;
    if (beak) m = TM.BEAK[mouthMode] || TM.BEAK.smile;
    else m = TM.MOUTH[mouthMode] || TM.MOUTH.smile;
    ctx.drawImage(TM.sprCanvas(m, gp), CX - Math.floor(m.w / 2), top + mouthY);
  }

  L.canvas = function (genes, stage, expr, frame) {
    expr = expr || {};
    const eyeMode = expr.eyes || 'open';
    const mouthMode = expr.mouth || 'smile';
    frame = frame || 0;
    const key = [genes.color, genes.eyes, genes.head, genes.body, genes.back, stage, eyeMode, mouthMode, frame].join('|');
    let c = cache.get(key);
    if (c) return c;

    c = document.createElement('canvas');
    c.width = L.W;
    c.height = L.H;
    const ctx = c.getContext('2d');
    const gp = TM.get('color', genes.color) || TM.list('color')[0];
    const eyes = TM.get('eyes', genes.eyes) || TM.list('eyes')[0];
    const head = TM.get('head', genes.head) || TM.list('head')[0];
    const body = TM.get('body', genes.body) || TM.list('body')[0];
    const back = TM.get('back', genes.back) || TM.get('back', 'none');

    if (stage === 'egg') {
      const e = TM.STAGE.egg;
      ctx.drawImage(TM.sprCanvas(e, gp), CX - e.w / 2, L.H - e.h);
    } else if (stage === 'baby') {
      const b = TM.STAGE.baby[hash(genes.color + genes.head) % TM.STAGE.baby.length];
      const top = L.H - b.spr.h;
      ctx.drawImage(TM.sprCanvas(b.spr, gp), CX - b.spr.w / 2, top);
      drawFace(ctx, gp, TM.get('eyes', 'tsubura'), CX, top, b.eyeY, b.mouthY, b.gap, mouthMode, eyeMode, false);
    } else if (stage === 'child') {
      const s = TM.STAGE.child;
      const top = L.H - s.spr.h;
      const deco = TM.CHILD_DECO[head.childDeco || head.id];
      if (deco) ctx.drawImage(TM.sprCanvas(deco.spr, gp), CX - deco.spr.w / 2, top + deco.dy);
      ctx.drawImage(TM.sprCanvas(s.spr, gp), CX - s.spr.w / 2, top);
      const gap = Math.max(2, s.gap + Math.max(0, eyes.gapAdd));
      drawFace(ctx, gp, eyes, CX, top, s.eyeY, s.mouthY, gap, mouthMode, eyeMode, false);
    } else {
      // adult: composed from the 4 shape parts
      const bs = body.spr, hs = head.spr;
      const bx = CX - bs.w / 2, by = L.H - bs.h;
      if (back && back.spr) {
        const k = back.spr;
        ctx.drawImage(TM.sprCanvas(k, gp), Math.round(CX - k.w / 2 + back.ox), by + back.oy);
      }
      ctx.drawImage(TM.sprCanvas(bs, gp), bx, by);
      const hy = by + 2 - hs.h + (frame ? 1 : 0);
      ctx.drawImage(TM.sprCanvas(hs, gp), CX - hs.w / 2, hy);
      const gap = Math.max(2, head.gap + eyes.gapAdd);
      drawFace(ctx, gp, eyes, CX, hy, head.eyeY, head.mouthY, gap, mouthMode, eyeMode, head.beak);
    }
    cache.set(key, c);
    return c;
  };

  // draw a character (bottom-centre at cx, groundY) with optional flip
  L.draw = function (genes, stage, cx, groundY, o) {
    o = o || {};
    const c = L.canvas(genes, stage, o.expr, o.frame);
    TM.gfx.img(c, Math.round(cx - L.W / 2), Math.round(groundY - L.H), o.flip, o.alpha);
  };

  // tight bounding box (for tap hit tests / shadows) — measured once per canvas
  L.bounds = function (genes, stage) {
    const c = L.canvas(genes, stage, {}, 0);
    if (c._b) return c._b;
    const d = c.getContext('2d').getImageData(0, 0, L.W, L.H).data;
    let x0 = L.W, y0 = L.H, x1 = 0, y1 = 0;
    for (let y = 0; y < L.H; y++)
      for (let x = 0; x < L.W; x++)
        if (d[(y * L.W + x) * 4 + 3]) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    c._b = { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    return c._b;
  };
})();
