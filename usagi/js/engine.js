'use strict';
// ------------------------------------------------------------
//  engine: pixel-perfect screen, main loop, pointer input
// ------------------------------------------------------------
// The game draws into a small logical buffer (W x H). The buffer is
// copied to the full-screen canvas with an INTEGER scale factor and
// smoothing disabled, so every logical pixel is an exact square of
// device pixels — no blur, no uneven pixels.
// ------------------------------------------------------------
(function (U) {
  const SHORT_SIDE = 128; // target logical pixels on the short screen side

  const E = (U.engine = {
    W: 0,
    H: 0,
    scale: 1,
    safe: { top: 0, right: 0, bottom: 0, left: 0 },
    time: 0,
  });

  let screen, sctx, buf, bctx, probe;
  let lastT = 0;
  let onUpdate = null;
  let onDraw = null;

  E.init = function (canvas, update, draw) {
    screen = canvas;
    sctx = screen.getContext('2d', { alpha: false });
    onUpdate = update;
    onDraw = draw;
    // safe-area probe
    probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
    E.resize();
    window.addEventListener('resize', E.resize);
    window.addEventListener('orientationchange', () => setTimeout(E.resize, 200));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', E.resize);
    initInput();
    requestAnimationFrame(frame);
  };

  E.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const devW = Math.round(cw * dpr);
    const devH = Math.round(ch * dpr);
    const scale = Math.max(1, Math.floor(Math.min(devW, devH) / SHORT_SIDE));
    const W = Math.ceil(devW / scale);
    const H = Math.ceil(devH / scale);
    screen.width = devW;
    screen.height = devH;
    screen.style.width = cw + 'px';
    screen.style.height = ch + 'px';
    sctx.imageSmoothingEnabled = false;
    const changed = W !== E.W || H !== E.H;
    E.W = W;
    E.H = H;
    E.scale = scale;
    E.dpr = dpr;
    if (!buf || changed) {
      buf = U.makeCanvas(W, H);
      bctx = buf.getContext('2d');
      bctx.imageSmoothingEnabled = false;
    }
    const cs = getComputedStyle(probe);
    const toLogical = (v) => Math.ceil((parseFloat(v) || 0) * dpr / scale);
    E.safe = {
      top: toLogical(cs.paddingTop),
      right: toLogical(cs.paddingRight),
      bottom: toLogical(cs.paddingBottom),
      left: toLogical(cs.paddingLeft),
    };
    if (changed && E.onResize) E.onResize(W, H);
  };

  function frame(t) {
    requestAnimationFrame(frame);
    let dt = lastT ? (t - lastT) / 1000 : 1 / 60;
    lastT = t;
    if (dt > 0.1) dt = 0.1; // tab was hidden etc.
    E.time += dt;
    onUpdate(dt);
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.globalCompositeOperation = 'source-over';
    bctx.globalAlpha = 1;
    onDraw(bctx, E.W, E.H);
    // integer blit
    sctx.drawImage(buf, 0, 0, E.W * E.scale, E.H * E.scale);
  }

  // ---------- input ----------
  // Handlers: E.input = { down(p), move(p), up(p), tap(p), doubleTap(p), longPress(p) }
  // p = { x, y } logical pixels, plus id / startX / startY / moved / t0
  E.input = {};
  const pointers = new Map();
  let lastTap = { t: 0, x: -99, y: -99 };

  function toLogical(ev) {
    const r = screen.getBoundingClientRect();
    const x = Math.floor(((ev.clientX - r.left) * E.dpr) / E.scale);
    const y = Math.floor(((ev.clientY - r.top) * E.dpr) / E.scale);
    return { x, y };
  }

  function initInput() {
    screen.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      screen.setPointerCapture && screen.setPointerCapture(ev.pointerId);
      const l = toLogical(ev);
      const p = { id: ev.pointerId, x: l.x, y: l.y, startX: l.x, startY: l.y, moved: false, t0: performance.now(), lp: false, hist: [] };
      p.hist.push({ x: l.x, y: l.y, t: p.t0 });
      pointers.set(ev.pointerId, p);
      p.timer = setTimeout(() => {
        if (!p.moved && pointers.has(p.id)) {
          p.lp = true;
          E.input.longPress && E.input.longPress(p);
        }
      }, 550);
      E.input.down && E.input.down(p);
    });
    screen.addEventListener('pointermove', (ev) => {
      const p = pointers.get(ev.pointerId);
      if (!p) return;
      const l = toLogical(ev);
      p.x = l.x;
      p.y = l.y;
      const now = performance.now();
      p.hist.push({ x: l.x, y: l.y, t: now });
      while (p.hist.length > 2 && now - p.hist[0].t > 120) p.hist.shift();
      if (Math.abs(p.x - p.startX) + Math.abs(p.y - p.startY) > 3) p.moved = true;
      E.input.move && E.input.move(p);
    });
    const end = (ev) => {
      const p = pointers.get(ev.pointerId);
      if (!p) return;
      clearTimeout(p.timer);
      pointers.delete(ev.pointerId);
      const now = performance.now();
      // flick velocity (logical px / s) from the last ~120ms
      const h0 = p.hist[0];
      const dtv = Math.max(16, now - h0.t) / 1000;
      p.vx = (p.x - h0.x) / dtv;
      p.vy = (p.y - h0.y) / dtv;
      E.input.up && E.input.up(p);
      if (ev.type === 'pointercancel') return;
      if (!p.moved && !p.lp && now - p.t0 < 500) {
        if (now - lastTap.t < 320 && Math.abs(p.x - lastTap.x) + Math.abs(p.y - lastTap.y) < 12) {
          lastTap.t = 0;
          E.input.doubleTap && E.input.doubleTap(p);
        } else {
          lastTap = { t: now, x: p.x, y: p.y };
          E.input.tap && E.input.tap(p);
        }
      }
    };
    screen.addEventListener('pointerup', end);
    screen.addEventListener('pointercancel', end);
    screen.addEventListener('contextmenu', (e) => e.preventDefault());
    // keyboard helpers on desktop
    window.addEventListener('keydown', (e) => E.input.key && E.input.key(e));
  }
})(window.U);
