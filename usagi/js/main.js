'use strict';
// ------------------------------------------------------------
//  main: wiring, spawners, input routing, save/load
// ------------------------------------------------------------
(function (U) {
  const SAVE_KEY = 'usagi-niwa.v1';
  const wd = U.world;
  const ui = U.ui;
  let rabbit = null;
  let grabbed = null; // ball being dragged { ball, p }
  let carrotTimer = 20;
  let butterflyTimer = 5;
  let saveTimer = 5;

  // ---------- save / load ----------
  function load() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function save() {
    try {
      const data = {
        seed: wd.seed,
        timeMode: wd.timeMode,
        clock: wd.clock,
        uiHidden: ui.hidden,
        rabbit: rabbit.save(),
        plants: wd.all('carrotPlant').map((p) => ({ x: p.x / wd.W, y: p.y / wd.H, stage: p.stage })),
        ball: wd.first('ball') ? 1 : 0,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable: play without saving */
    }
  }

  // ---------- spawning ----------
  function plantCarrot(x, y, stage) {
    const p = wd.add(new U.CarrotPlant(x, y, { stage: stage || 0 }));
    wd.burst(U.S.fx.dirt, p.x, p.y, 1, 4, 16, 40, 0.5);
    return p;
  }
  function spawnRandomCarrot(stage) {
    const avoid = wd.all('carrotPlant').concat([rabbit]);
    const s = wd.freeSpot(18, avoid);
    return plantCarrot(s.x, s.y, stage);
  }
  function dropBall(x, y) {
    const b = new U.Ball(x, y);
    b.body.z = 50;
    b.body.vz = 0;
    return wd.add(b);
  }

  function spawners(dt) {
    // carrots grow on their own every so often
    const plants = wd.all('carrotPlant');
    carrotTimer -= dt * (rabbit.hunger > 0.6 ? 2 : 1);
    if (carrotTimer <= 0) {
      carrotTimer = U.rnd.range(45, 90);
      if (plants.length < 3) spawnRandomCarrot(0);
    }
    // butterflies by day
    butterflyTimer -= dt;
    if (butterflyTimer <= 0) {
      butterflyTimer = U.rnd.range(12, 35);
      if (wd.darkness() < 0.3 && wd.all('butterfly').length < 2) wd.add(new U.Butterfly());
    }
    // fireflies by night
    if (wd.darkness() > 0.7 && wd.all('firefly').length < 7 && U.rnd() < dt * 0.5) wd.add(new U.Firefly());
  }

  // ---------- input ----------
  function worldTap(p) {
    if (ui.plantMode) {
      const B = wd.bounds;
      const x = U.clamp(p.x, B.x0 + 3, B.x1 - 3);
      const y = U.clamp(p.y, B.y0 + 4, B.y1);
      if (wd.all('carrotPlant').length >= 8) {
        ui.toast('ハタケ ガ イッパイ!');
      } else {
        plantCarrot(x, y, 0);
      }
      return;
    }
    if (rabbit.hitTest(p.x, p.y)) return; // handled on pointer down (petting)
    const ball = wd.first('ball');
    if (ball && ball.hit(p.x, p.y, 6)) return;
    const plant = wd.all('carrotPlant').find((c) => Math.abs(c.x - p.x) < 5 && p.y <= c.y + 3 && p.y >= c.y - 9);
    if (plant) {
      plant.pop = 1;
      wd.burst(U.S.fx.leaf, plant.x, plant.y - 3, 3, 2, 10, 30, 0.4);
      if (plant.ready()) rabbit.notifyFood();
      return;
    }
    // a tiny sparkle where you tapped; the rabbit gets curious
    wd.fx({ spr: U.S.fx.spark, x: p.x, y: p.y + 1, z: 1, vz: 0, g: 0, life: 0.35, ground: false });
    rabbit.onTapNear(p.x, p.y);
  }

  const input = {
    down(p) {
      if (ui.down(p)) {
        p.ui = true;
        return;
      }
      if (ui.blocks(p.x, p.y) || ui.plantMode) return;
      const ball = wd.first('ball');
      if (ball && ball.hit(p.x, p.y, 7)) {
        grabbed = { ball, p };
        ball.body.vx = ball.body.vy = ball.body.vz = 0;
        return;
      }
      if (rabbit.hitTest(p.x, p.y)) {
        rabbit.petting = true;
        rabbit.onPet();
        p.pet = true;
      }
    },
    move(p) {
      if (grabbed && grabbed.p.id === p.id) {
        const b = grabbed.ball.body;
        const B = U.physics.bounds;
        b.x = U.clamp(p.x, B.x0 + b.r, B.x1 - b.r);
        b.y = U.clamp(p.y + 6, B.y0 + b.r, B.y1);
        b.z = 6;
        b.vx = b.vy = b.vz = 0;
      }
    },
    up(p) {
      if (p.ui) {
        ui.up(p);
        return;
      }
      if (p.pet) rabbit.petting = false;
      if (grabbed && grabbed.p.id === p.id) {
        const b = grabbed.ball.body;
        // throw with the flick velocity (clamped)
        const sp = Math.hypot(p.vx, p.vy);
        const k = sp > 260 ? 260 / sp : 1;
        b.vx = p.vx * k;
        b.vy = p.vy * k;
        b.vz = 25 + Math.min(80, sp * 0.25);
        if (!p.moved) {
          // simple tap on the ball: kick it away from the finger
          const a = U.rnd() * Math.PI * 2;
          b.vx = Math.cos(a) * 90;
          b.vy = Math.sin(a) * 60;
          b.vz = 60;
        }
        grabbed = null;
      }
    },
    tap(p) {
      if (p.ui || ui.blocks(p.x, p.y)) return;
      worldTap(p);
    },
    doubleTap(p) {
      if (ui.hidden) {
        ui.hidden = false;
        save();
      }
    },
    key(e) {
      const k = e.key.toLowerCase();
      if (k === 'h') ui.onButton('hide');
      if (k === 'c') spawnRandomCarrot(3);
      if (k === 'b') ui.onButton('ball');
      if (k === 't') ui.onButton('time');
      if (k === 'n') wd.clock = (wd.clock + 60) % 1440;
      if (k === 'f') {
        rabbit.hunger = 1;
        rabbit.notifyFood();
      }
    },
  };

  ui.onButton = function (id) {
    if (id === 'plant') {
      ui.plantMode = !ui.plantMode;
    } else if (id === 'ball') {
      const b = wd.first('ball');
      if (b) {
        wd.burst(U.S.fx.dust, b.x, b.y, 0, 4, 14, 20, 0.4);
        wd.remove(b);
      } else {
        const s = wd.freeSpot(16, [rabbit]);
        dropBall(s.x, s.y);
      }
    } else if (id === 'time') {
      wd.timeMode = wd.timeMode === 'fast' ? 'real' : 'fast';
      ui.toast(wd.timeMode === 'fast' ? 'ジカン: ハヤイ' : 'ジカン: リアル', U.S.ui.clock, 1.6);
    } else if (id === 'hide') {
      ui.hidden = true;
      ui.plantMode = false;
      ui.toast('ダブルタップ デ モドル', null, 2.4);
    }
    save();
  };

  // ---------- loop ----------
  function update(dt) {
    wd.update(dt);
    spawners(dt);
    ui.update(dt);
    saveTimer -= dt;
    if (saveTimer <= 0) {
      saveTimer = 5;
      save();
    }
  }
  function draw(ctx, W, H) {
    wd.draw(ctx);
    wd.drawLight(ctx, W, H);
    ui.draw(ctx, W, H, { rabbit, hasBall: !!wd.first('ball') });
  }

  function boot() {
    const saved = load();
    const canvas = document.getElementById('game');
    U.engine.onResize = function (W, H) {
      if (!rabbit) return;
      const oldW = wd.W;
      const oldH = wd.H;
      wd.init(W, H);
      ui.layout(W, H);
      // keep things in proportionally the same place
      for (const e of wd.entities) {
        const t = e.body || e;
        if (e.body || e.type === 'carrotPlant' || e.type === 'rabbit') {
          t.x = Math.round((t.x / oldW) * W);
          t.y = Math.round((t.y / oldH) * H);
        }
      }
      for (const m of wd.marks) {
        m.x = Math.round((m.x / oldW) * W);
        m.y = Math.round((m.y / oldH) * H);
      }
    };
    U.engine.init(canvas, update, draw);
    U.engine.input = input;
    const W = U.engine.W;
    const H = U.engine.H;
    wd.seed = saved.seed || (U.rnd() * 1e9) >>> 0;
    wd.timeMode = saved.timeMode || 'fast';
    if (typeof saved.clock === 'number') wd.clock = saved.clock;
    ui.hidden = !!saved.uiHidden;
    wd.init(W, H);
    ui.layout(W, H);

    rabbit = wd.add(new U.Rabbit(Math.round(W / 2), Math.round(H / 2)));
    rabbit.load(saved.rabbit);
    U.rabbit = rabbit;
    if (saved.plants && saved.plants.length) {
      for (const p of saved.plants) plantCarrot(p.x * W, p.y * H, p.stage);
    } else {
      // first visit: one carrot almost ready so something happens soon
      spawnRandomCarrot(2);
    }
    if (saved.ball) dropBall(Math.round(W * 0.7), Math.round(H * 0.6));
    if (ui.hidden) ui.toast('ダブルタップ デ モドル', null, 2.4);
    document.addEventListener('visibilitychange', () => document.hidden && save());
    window.addEventListener('pagehide', save);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.U);
