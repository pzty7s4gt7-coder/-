/*
 * Boot, main loop and input.
 */
(function () {
  'use strict';
  const GM = TM.game;
  const G = TM.gfx;
  const PREV = { baby: 'egg', child: 'baby', adult: 'child' };
  TM.pendingGrow = null;

  let last = 0, acc = 0, saveT = 0;
  function frame(ts) {
    const dt = Math.min(0.1, (ts - (last || ts)) / 1000);
    last = ts;
    // simulation in game seconds
    acc += dt * (GM.s.timeScale || 1);
    let guard = 0;
    while (acc >= 1 && guard++ < 400) {
      const step = Math.min(acc, 30);
      GM.simulate(step);
      acc -= step;
    }
    const sc = TM.sc.cur;
    TM.sc.t += dt * 1000;
    // growth happens between scenes: show it when we are home
    if (TM.pendingGrow && TM.sc.name === 'home') {
      const from = TM.pendingGrow;
      TM.pendingGrow = null;
      TM.sc.go('grow', { from });
    }
    if (sc.update) sc.update(dt);
    TM.fx.update(dt);
    G.begin();
    TM.sc.cur.draw(G, ts);
    saveT += dt;
    if (saveT > 5) { saveT = 0; GM.save(); }
    if (TM.onFrame) TM.onFrame(dt);
    requestAnimationFrame(frame);
  }

  function press(b) {
    const sc = TM.sc.cur;
    if (sc && sc.btn) sc.btn(b);
  }
  TM.press = press;

  function fitScreen() {
    const cv = document.getElementById('screen');
    const box = cv.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const dpr = window.devicePixelRatio || 1;
    // integer number of device pixels per world pixel => perfectly even dots
    const s = Math.max(1, Math.floor((avail * dpr) / TM.W));
    let css = (s * TM.W) / dpr;
    if (css < avail * 0.86) css = avail; // too much shrink: fill (still nearest-neighbour)
    cv.style.width = css + 'px';
    cv.style.height = css + 'px';
  }

  TM.boot = function () {
    const cv = document.getElementById('screen');
    G.init(cv);
    GM.load();
    GM.on((ev, arg) => {
      if (ev === 'grow' && arg !== 'baby') TM.pendingGrow = PREV[arg];
      if (ev === 'poop') TM.sfx('beep');
      if (ev === 'sick') TM.sfx('sad');
    });
    TM.sc.go('home');

    // --- input: device buttons ---
    document.querySelectorAll('[data-btn]').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.classList.add('down');
        press(el.dataset.btn);
      });
      const up = () => el.classList.remove('down');
      el.addEventListener('pointerup', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    // --- input: touch the screen ---
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * TM.W);
      const y = Math.floor(((e.clientY - r.top) / r.height) * TM.H);
      const sc = TM.sc.cur;
      if (sc && sc.tap) sc.tap(x, y);
    });
    // --- input: keyboard ---
    window.addEventListener('keydown', (e) => {
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      const k = e.key;
      let b = null;
      if (k === 'ArrowLeft' || k === 'a' || k === 'z' || k === 'ArrowRight') b = 'A';
      if (k === 'Enter' || k === ' ' || k === 'x' || k === 's') b = 'B';
      if (k === 'Escape' || k === 'Backspace' || k === 'c' || k === 'd') b = 'C';
      if (b) { e.preventDefault(); press(b); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) GM.save(); });
    window.addEventListener('pagehide', () => GM.save());
    window.addEventListener('resize', fitScreen);
    fitScreen();
    setTimeout(fitScreen, 50);

    // redraw text once the pixel font is ready
    if (document.fonts && document.fonts.load) {
      document.fonts.load('16px "DotGothic16"').then(() => G.calibrateFont()).catch(() => {});
      document.fonts.ready.then(() => G.calibrateFont());
    }
    if (TM.debug) TM.debug.init();
    requestAnimationFrame(frame);
  };
})();
