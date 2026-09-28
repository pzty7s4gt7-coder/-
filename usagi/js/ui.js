'use strict';
// ------------------------------------------------------------
//  UI — pixel panels, dot-font labels, buttons, toasts.
//  Everything is drawn into the same logical pixel buffer.
// ------------------------------------------------------------
(function (U) {
  const C = U.COL;
  const font = () => U.font;

  const UI = (U.ui = {
    hidden: false,
    plantMode: false,
    buttons: [],
    toasts: [],
    pressed: null,
    hintT: 0,
  });

  // ---------- drawing primitives ----------
  // solid panel with cut corners and a 1px lighter rim
  UI.panel = function (ctx, x, y, w, h, opts) {
    opts = opts || {};
    x = Math.round(x);
    y = Math.round(y);
    const fill = opts.fill || C.ui0;
    const rim = opts.rim || C.ui2;
    // drop shadow
    ctx.fillStyle = 'rgba(20,30,20,0.35)';
    ctx.fillRect(x + 1, y + h, w - 2, 1);
    // body
    ctx.fillStyle = rim;
    ctx.fillRect(x + 1, y, w - 2, h);
    ctx.fillRect(x, y + 1, w, h - 2);
    ctx.fillStyle = fill;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    // inner top highlight
    if (opts.hi) {
      ctx.fillStyle = opts.hi;
      ctx.fillRect(x + 2, y + 1, w - 4, 1);
    }
  };

  UI.meter = function (ctx, x, y, w, v, col) {
    ctx.fillStyle = C.ui1;
    ctx.fillRect(x, y, w, 3);
    const f = Math.round(U.clamp(v, 0, 1) * (w - 2));
    if (f > 0) {
      ctx.fillStyle = col;
      ctx.fillRect(x + 1, y + 1, f, 1);
    }
  };

  UI.text = function (ctx, s, x, y, col) {
    font().draw(ctx, s, x, y, col || C.cream);
  };

  // ---------- toasts ----------
  UI.toast = function (text, icon, dur) {
    // replace a toast with the same text instead of stacking
    UI.toasts = UI.toasts.filter((t) => t.text !== text);
    UI.toasts.push({ text, icon: icon || null, t: 0, dur: dur || 2.6 });
    if (UI.toasts.length > 2) UI.toasts.shift();
  };

  // ---------- layout ----------
  UI.layout = function (W, H) {
    const s = U.engine.safe;
    const bw = 26;
    const bh = 22;
    const gap = 3;
    const defs = [
      { id: 'plant', icon: 'carrot', label: 'ウエル' },
      { id: 'ball', icon: 'ball', label: 'ボール' },
      { id: 'time', icon: 'clock', label: 'ハヤイ' },
      { id: 'hide', icon: 'eyeOff', label: 'カクス' },
    ];
    const total = defs.length * bw + (defs.length - 1) * gap;
    const x0 = Math.floor((W - total) / 2);
    const y0 = H - s.bottom - bh - 3;
    UI.buttons = defs.map((d, i) => Object.assign(d, { x: x0 + i * (bw + gap), y: y0, w: bw, h: bh }));
  };

  // ---------- input ----------
  UI.buttonAt = function (x, y) {
    if (UI.hidden) return null;
    return UI.buttons.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) || null;
  };
  // true when the point is over any UI element (so the world ignores it)
  UI.blocks = function (x, y) {
    if (UI.hidden) return false;
    if (UI.buttonAt(x, y)) return true;
    const s = U.engine.safe;
    if (y < s.top + 22 && (x < s.left + 70 || x > U.engine.W - s.right - 60)) return true;
    return false;
  };
  UI.down = function (p) {
    const b = UI.buttonAt(p.x, p.y);
    UI.pressed = b;
    return !!b;
  };
  UI.up = function (p) {
    const b = UI.pressed;
    UI.pressed = null;
    if (b && UI.buttonAt(p.x, p.y) === b) {
      UI.onButton && UI.onButton(b.id);
      return true;
    }
    return !!b;
  };

  // ---------- draw ----------
  function clockText(m) {
    const h = Math.floor(m / 60) % 24;
    const mm = Math.floor(m % 60);
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }

  UI.update = function (dt) {
    for (let i = UI.toasts.length - 1; i >= 0; i--) {
      const t = UI.toasts[i];
      t.t += dt;
      if (t.t > t.dur) UI.toasts.splice(i, 1);
    }
  };

  UI.draw = function (ctx, W, H, st) {
    const s = U.engine.safe;
    const I = U.S.ui;
    if (!UI.hidden) {
      // --- clock & needs (top-left) ---
      const px = s.left + 3;
      const py = s.top + 3;
      UI.panel(ctx, px, py, 58, 21, { hi: C.ui1 });
      const night = U.world.isNight();
      U.drawTL(ctx, night ? I.moon : I.sun, px + 2, py + 1);
      UI.text(ctx, clockText(U.world.clock), px + 13, py + 2, C.cream);
      if (U.world.timeMode === 'fast') U.drawTL(ctx, I.fast, px + 46, py + 1);
      const r = st.rabbit;
      const my = py + 13;
      U.drawTL(ctx, I.mCarrot, px + 2, my - 1);
      UI.meter(ctx, px + 8, my + 1, 10, 1 - r.hunger, C.c1);
      U.drawTL(ctx, I.mZ, px + 20, my - 1);
      UI.meter(ctx, px + 26, my + 1, 10, r.energy, C.sky);
      U.drawTL(ctx, I.mHeart, px + 38, my - 1);
      UI.meter(ctx, px + 44, my + 1, 11, r.joy, C.heart);

      // --- rabbit status (top-right) ---
      const label = r.status;
      const tw = font().measure(label);
      const bw = Math.max(tw + 8, 30);
      const bx = W - s.right - 3 - bw;
      UI.panel(ctx, bx, py, bw, 13, { fill: C.cream, rim: C.ui0 });
      // little tail pointing down-left toward the meadow
      ctx.fillStyle = C.ui0;
      ctx.fillRect(bx + 4, py + 13, 3, 1);
      ctx.fillRect(bx + 4, py + 14, 1, 1);
      ctx.fillStyle = C.cream;
      ctx.fillRect(bx + 5, py + 12, 2, 1);
      UI.text(ctx, label, bx + Math.floor((bw - tw) / 2), py + 3, C.ui0);

      // --- buttons ---
      for (const b of UI.buttons) {
        const down = UI.pressed === b;
        const active = (b.id === 'plant' && UI.plantMode) || (b.id === 'ball' && st.hasBall);
        const y = b.y + (down ? 1 : 0);
        UI.panel(ctx, b.x, y, b.w, b.h, { fill: active ? C.ui2 : C.ui0, rim: active ? C.cream2 : C.ui2, hi: active ? C.cream2 : C.ui1 });
        let icon = I[b.icon];
        if (b.id === 'time') icon = U.world.timeMode === 'fast' ? I.fast : I.clock;
        U.drawTL(ctx, icon, b.x + Math.floor((b.w - 9) / 2), y + 2);
        let label = b.label;
        if (b.id === 'time') label = U.world.timeMode === 'fast' ? 'ハヤイ' : 'リアル';
        if (b.id === 'ball' && st.hasBall) label = 'シマウ';
        if (b.id === 'plant' && UI.plantMode) label = 'ヤメル';
        const lw = font().measure(label);
        UI.text(ctx, label, b.x + Math.floor((b.w - lw) / 2), y + 12, active ? C.cream : C.cream2);
      }
    }

    // --- toasts (shown even when UI hidden, e.g. the "double tap" hint) ---
    let ty = s.top + (UI.hidden ? 6 : 28);
    for (const t of UI.toasts) {
      // slide in from above by whole pixels
      const inP = Math.min(1, t.t / 0.18);
      const outP = Math.max(0, (t.t - (t.dur - 0.18)) / 0.18);
      if (outP > 0 && Math.floor(t.t * 20) % 2) continue; // blink out
      const tw = font().measure(t.text);
      const w = tw + 10 + (t.icon ? 11 : 0);
      const x = Math.floor((W - w) / 2);
      const y = ty - Math.round((1 - inP) * 6);
      UI.panel(ctx, x, y, w, 13, { fill: C.ui0, rim: C.cream2, hi: C.ui1 });
      let tx = x + 5;
      if (t.icon) {
        U.drawTL(ctx, t.icon, x + 3, y + 2);
        tx += 11;
      }
      UI.text(ctx, t.text, tx, y + 3, C.cream);
      ty += 16;
    }

    // plant mode hint under the pointer area
    if (!UI.hidden && UI.plantMode) {
      const msg = 'タップ デ ニンジン ヲ ウエル';
      const tw = font().measure(msg);
      const y = UI.buttons.length ? UI.buttons[0].y - 13 : H - 30;
      if (Math.floor(U.world.t * 2) % 2 === 0) {
        font().draw(ctx, msg, Math.floor((W - tw) / 2), y, C.cream, { outline: C.ui0 });
      }
    }
  };
})(window.U);
