'use strict';
// ------------------------------------------------------------
//  world: the meadow, entities, particles, time of day
// ------------------------------------------------------------
(function (U) {
  const F = () => U.S.field;

  const Wd = (U.world = {
    W: 0,
    H: 0,
    seed: 1,
    bg: null, // pre-rendered static ground
    props: [], // swaying tufts & flowers
    marks: [], // holes / dug spots that heal over time
    entities: [],
    particles: [],
    bounds: { x0: 0, y0: 0, x1: 0, y1: 0 },
    t: 0,
    // clock in minutes since midnight
    clock: 8 * 60,
    timeMode: 'fast', // 'fast' (1 day = 16 min) | 'real'
    FAST_MIN_PER_SEC: 1.5,
    wind: 0,
    gust: 0,
  });

  // ================= generation =================
  // 4x4 Bayer matrix for ordered dithering
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

  function valueNoise(rng, cell, W, H) {
    const gw = Math.ceil(W / cell) + 2;
    const gh = Math.ceil(H / cell) + 2;
    const g = [];
    for (let i = 0; i < gw * gh; i++) g.push(rng());
    const sm = (t) => t * t * (3 - 2 * t);
    return function (x, y) {
      const gx = x / cell;
      const gy = y / cell;
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const fx = sm(gx - ix);
      const fy = sm(gy - iy);
      const a = g[iy * gw + ix];
      const b = g[iy * gw + ix + 1];
      const c = g[(iy + 1) * gw + ix];
      const d = g[(iy + 1) * gw + ix + 1];
      return U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fy);
    };
  }

  Wd.init = function (W, H, seed) {
    Wd.W = W;
    Wd.H = H;
    if (seed != null) Wd.seed = seed;
    Wd.updateBounds();
    Wd.generate();
  };

  Wd.updateBounds = function () {
    const s = U.engine.safe;
    Wd.bounds = {
      x0: s.left + 6,
      x1: Wd.W - s.right - 6,
      y0: s.top + 22,
      y1: Wd.H - s.bottom - 20,
    };
    U.physics.bounds = { x0: s.left + 1, x1: Wd.W - s.right - 1, y0: s.top + 4, y1: Wd.H - s.bottom - 3 };
  };

  Wd.generate = function () {
    const W = Wd.W;
    const H = Wd.H;
    const rng = U.makeRng(Wd.seed);
    const C = U.COL;
    const bg = U.makeCanvas(W, H);
    const x = bg.getContext('2d');
    const img = x.createImageData(W, H);
    const cols = [C.g0, C.g1, C.g2, C.g3, C.g4].map(U.hexToRgba);
    const n1 = valueNoise(rng, 36, W, H);
    const n2 = valueNoise(rng, 14, W, H);
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const n = n1(px, py) * 0.75 + n2(px, py) * 0.25;
        const d = BAYER[(py & 3) * 4 + (px & 3)] * 0.12;
        // a calm meadow: mostly one green, soft lighter & darker patches
        let ci = 2;
        if (n + d > 0.7) ci = 3;
        if (n + d < 0.28) ci = 1;
        const c = cols[ci];
        const i = (py * W + px) * 4;
        img.data[i] = c[0];
        img.data[i + 1] = c[1];
        img.data[i + 2] = c[2];
        img.data[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);

    const f = F();
    const area = W * H;
    // grass blades
    for (let i = 0; i < area / 110; i++) {
      const px = rng.int(0, W - 1);
      const py = rng.int(0, H - 1);
      const n = n1(px, py);
      const s = n < 0.42 ? rng.pick(f.darkBlades) : rng.pick(f.blades);
      U.draw(x, s, px, py);
    }
    // clovers & pebbles
    for (let i = 0; i < area / 1400; i++) U.draw(x, rng.pick([f.clover, f.clover2]), rng.int(4, W - 4), rng.int(4, H - 4));
    for (let i = 0; i < area / 5000; i++) U.draw(x, rng.pick([f.pebble, f.pebble2]), rng.int(4, W - 4), rng.int(4, H - 4));
    Wd.bg = bg;

    // swaying props
    Wd.props = [];
    const tufts = [f.tuftA, f.tuftB, f.tuftC];
    for (let i = 0; i < area / 700; i++) {
      Wd.props.push({ spr: rng.pick(tufts), x: rng.int(2, W - 3), y: rng.int(4, H - 2), ph: rng() * 0.6 });
    }
    // flower patches
    const flowers = [f.flowerW, f.flowerY, f.flowerP, f.flowerB, f.daisy, f.bud];
    const patches = Math.max(3, Math.round(area / 9000));
    for (let p = 0; p < patches; p++) {
      const cx = rng.int(10, W - 10);
      const cy = rng.int(10, H - 10);
      const kind = rng.pick(flowers);
      const n = rng.int(3, 7);
      for (let i = 0; i < n; i++) {
        const a = rng() * Math.PI * 2;
        const r = rng() * 12;
        const spr = rng.chance(0.75) ? kind : rng.pick(flowers);
        Wd.props.push({ spr: [spr], x: Math.round(cx + Math.cos(a) * r), y: Math.round(cy + Math.sin(a) * r * 0.7), ph: rng() * 0.6, flower: true });
      }
    }
    Wd.props.sort((a, b) => a.y - b.y);
  };

  // ================= entities =================
  Wd.add = function (e) {
    Wd.entities.push(e);
    if (e.body) U.physics.add(e.body);
    return e;
  };
  Wd.remove = function (e) {
    e.dead = true;
  };
  Wd.all = function (type) {
    return Wd.entities.filter((e) => !e.dead && e.type === type);
  };
  Wd.first = function (type) {
    return Wd.entities.find((e) => !e.dead && e.type === type) || null;
  };

  // random walkable point, away from given points
  Wd.freeSpot = function (minDist, avoid) {
    const B = Wd.bounds;
    for (let tries = 0; tries < 40; tries++) {
      const x = U.rnd.int(B.x0 + 4, B.x1 - 4);
      const y = U.rnd.int(B.y0 + 6, B.y1 - 2);
      let ok = true;
      for (const e of avoid || []) {
        if (U.dist(x, y, e.x, e.y) < minDist) {
          ok = false;
          break;
        }
      }
      if (ok) return { x, y };
    }
    return { x: U.rnd.int(B.x0, B.x1), y: U.rnd.int(B.y0, B.y1) };
  };

  // ================= particles =================
  // opts: spr, x, y, z, vx, vy, vz, g (gravity), life, drift (sin sway), float
  Wd.fx = function (opts) {
    const p = Object.assign({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, g: 200, life: 1, age: 0, drift: 0, ground: true }, opts);
    Wd.particles.push(p);
    return p;
  };
  Wd.burst = function (sprs, x, y, z, n, speed, up, life) {
    for (let i = 0; i < n; i++) {
      const a = U.rnd() * Math.PI * 2;
      const s = speed * (0.4 + U.rnd() * 0.6);
      Wd.fx({ spr: U.rnd.pick(sprs), x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, vz: up * (0.6 + U.rnd() * 0.6), life: life * (0.7 + U.rnd() * 0.6) });
    }
  };

  function updateParticles(dt) {
    const L = Wd.particles;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.age += dt;
      if (p.age >= p.life) {
        L.splice(i, 1);
        continue;
      }
      p.vz -= p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      if (p.ground && p.z < 0) {
        p.z = 0;
        p.vz = -p.vz * 0.3;
        p.vx *= 0.5;
        p.vy *= 0.5;
      }
    }
  }

  function drawParticles(ctx) {
    for (const p of Wd.particles) {
      // pixel-art fade: blink during the last 25% of life
      const left = p.life - p.age;
      if (left < p.life * 0.25 && Math.floor(p.age * 16) % 2) continue;
      const sx = p.x + (p.drift ? Math.sin(p.age * 5 + p.x) * p.drift : 0);
      U.draw(ctx, p.spr, sx, p.y - p.z);
    }
  }

  // ================= time of day =================
  // [minute, tint colour] — multiplied over the scene
  const LIGHT = [
    [0, '#9ca4d8'],
    [270, '#a2a8d4'],
    [330, '#c09cb8'],
    [390, '#ffdcc4'],
    [450, '#ffffff'],
    [990, '#ffffff'],
    [1050, '#ffd6a8'],
    [1110, '#f0a896'],
    [1170, '#b0a6d6'],
    [1230, '#9ca4d8'],
    [1440, '#9ca4d8'],
  ];
  function mixHex(a, b, t) {
    const A = U.hexToRgba(a);
    const B = U.hexToRgba(b);
    const c = [0, 1, 2].map((i) => Math.round(U.lerp(A[i], B[i], t)));
    return 'rgb(' + c.join(',') + ')';
  }
  Wd.tint = function () {
    const m = Wd.clock;
    for (let i = 0; i < LIGHT.length - 1; i++) {
      const [m0, c0] = LIGHT[i];
      const [m1, c1] = LIGHT[i + 1];
      if (m >= m0 && m <= m1) return mixHex(c0, c1, (m - m0) / (m1 - m0));
    }
    return '#ffffff';
  };
  Wd.isNight = () => Wd.clock >= 1190 || Wd.clock < 330;
  Wd.darkness = function () {
    // 0 (day) .. 1 (deep night)
    const m = Wd.clock;
    if (m >= 450 && m <= 990) return 0;
    if (m >= 1230 || m <= 270) return 1;
    if (m > 990) return U.clamp((m - 990) / 240, 0, 1);
    return U.clamp(1 - (m - 270) / 180, 0, 1);
  };

  Wd.updateClock = function (dt) {
    if (Wd.timeMode === 'real') {
      const d = new Date();
      Wd.clock = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    } else {
      Wd.clock = (Wd.clock + dt * Wd.FAST_MIN_PER_SEC) % 1440;
    }
  };

  // ================= update / draw =================
  Wd.update = function (dt) {
    Wd.t += dt;
    Wd.updateClock(dt);
    // wind: slow base wave + occasional gusts
    if (U.rnd() < dt * 0.05) Wd.gust = 1;
    Wd.gust = Math.max(0, Wd.gust - dt * 0.35);
    Wd.wind = Wd.t;
    U.physics.step(dt);
    for (const e of Wd.entities) if (!e.dead && e.update) e.update(dt, Wd);
    for (let i = Wd.entities.length - 1; i >= 0; i--) {
      const e = Wd.entities[i];
      if (e.dead) {
        if (e.body) U.physics.remove(e.body);
        Wd.entities.splice(i, 1);
      }
    }
    for (let i = Wd.marks.length - 1; i >= 0; i--) {
      const m = Wd.marks[i];
      m.age += dt;
      if (m.age > m.life) Wd.marks.splice(i, 1);
    }
    updateParticles(dt);
  };

  function propFrame(p) {
    if (p.spr.length < 2) return p.spr[0];
    // a wave rolling across the meadow, stronger during gusts
    const w = Math.sin(Wd.t * 1.6 - p.x * 0.07 - p.y * 0.03 + p.ph);
    const thr = 0.82 - Wd.gust * 0.9;
    return w > thr ? p.spr[1] : p.spr[0];
  }

  Wd.draw = function (ctx) {
    ctx.drawImage(Wd.bg, 0, 0);
    // ground marks
    const hole = F().hole;
    for (const m of Wd.marks) {
      const stage = Math.min(hole.length - 1, Math.floor((m.age / m.life) * hole.length));
      U.draw(ctx, hole[stage], m.x, m.y);
    }
    for (const p of Wd.props) U.draw(ctx, propFrame(p), p.x, p.y);

    // shadows first, then sprites sorted by ground y
    const ents = Wd.entities.filter((e) => !e.dead);
    for (const e of ents) e.drawShadow && e.drawShadow(ctx);
    ents.sort((a, b) => (a.sortY != null ? a.sortY : a.y) - (b.sortY != null ? b.sortY : b.y));
    for (const e of ents) e.draw && e.draw(ctx);
    drawParticles(ctx);
  };

  // lighting: multiply tint, then glowing things on top
  Wd.drawLight = function (ctx, W, H) {
    const tint = Wd.tint();
    if (tint !== '#ffffff') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    for (const e of Wd.entities) if (!e.dead && e.drawGlow) e.drawGlow(ctx);
  };
})(window.U);
