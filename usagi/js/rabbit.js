'use strict';
// ------------------------------------------------------------
//  Rabbit: needs + behaviours written as coroutines.
// ------------------------------------------------------------
// Each behaviour is a generator. `yield n` waits n seconds,
// `yield` (or yield 0) waits one frame. Tapping, new food etc.
// can interrupt the current behaviour at any time.
//
// Adding a behaviour: write `*myThing() { ... }`, then add it to
// the weighted list in decide().
// ------------------------------------------------------------
(function (U) {
  const W = () => U.world;
  const FX = () => U.S.fx;

  // Side-only poses are drawn from the R_* frame and mirrored for left.
  function Rabbit(x, y) {
    this.type = 'rabbit';
    this.x = x;
    this.y = y;
    this.z = 0;
    this.ox = 0; // visual x offset (tugging)
    this.dir = 'D'; // D U R L
    this.side = 1; // last horizontal facing (1 right, -1 left)
    this.pose = 'sit'; // 'sit' | 'crouch' | 'air' | sprite key (e.g. 'R_eat1')
    this.anim = null; // { keys: [...], fps }
    this.animT = 0;
    this.status = 'ノンビリ';
    // needs 0..1
    this.hunger = 0.35;
    this.energy = 0.9;
    this.joy = 0.6;
    this.asleep = false;
    // micro animation timers while sitting
    this.blinkT = 2;
    this.blinking = 0;
    this.noseT = 1;
    this.nosing = 0;
    this.earT = 4;
    this.earing = 0;
    this.co = null;
    this.wait = 0;
    this.dt = 0;
    this.petting = false;
    this.body = U.physics.makeBody({ x, y, r: 5, h: 10, kinematic: true, bounce: 0.6 });
    this.body.owner = this;
  }
  const R = Rabbit.prototype;

  // ================= needs & loop =================
  R.update = function (dt) {
    this.dt = dt;
    const wd = W();
    const night = wd.isNight();
    // needs drift
    this.hunger = U.clamp(this.hunger + dt / 260, 0, 1);
    if (this.asleep) this.energy = U.clamp(this.energy + dt / 55, 0, 1);
    else this.energy = U.clamp(this.energy - dt / (night ? 160 : 420), 0, 1);
    this.joy = U.lerp(this.joy, 0.55 - this.hunger * 0.3, dt * 0.004);

    // run coroutine
    if (!this.co) this.co = this.decide();
    this.wait -= dt;
    let guard = 0;
    while (this.wait <= 0 && this.co && guard++ < 20) {
      const r = this.co.next();
      if (r.done) {
        this.co = this.decide();
        continue;
      }
      if (typeof r.value === 'number' && r.value > 0) {
        this.wait += r.value;
      } else {
        this.wait = 0;
        break; // next frame
      }
    }

    // settle back to the ground if a hop got interrupted
    if (!this.hopping && this.z > 0) this.z = Math.max(0, this.z - dt * 60);

    // micro animations
    this.animT += dt;
    this.blinking = Math.max(0, this.blinking - dt);
    this.nosing = Math.max(0, this.nosing - dt);
    this.earing = Math.max(0, this.earing - dt);
    if ((this.blinkT -= dt) < 0) {
      this.blinking = 0.14;
      this.blinkT = U.rnd.range(1.5, 5);
      if (U.rnd() < 0.15) this.blinkT = 0.3; // double blink
    }
    if ((this.noseT -= dt) < 0) {
      this.nosing = U.rnd.range(0.4, 1.2);
      this.noseT = U.rnd.range(1.5, 4);
    }
    if ((this.earT -= dt) < 0) {
      this.earing = 0.25;
      this.earT = U.rnd.range(3, 9);
    }

    // keep inside the meadow
    const B = wd.bounds;
    this.x = U.clamp(this.x, B.x0, B.x1);
    this.y = U.clamp(this.y, B.y0, B.y1);
    // kinematic body for pushing toys
    const b = this.body;
    b.vx = dt > 0 ? (this.x - b.x) / dt : 0;
    b.vy = dt > 0 ? (this.y - b.y) / dt : 0;
    b.x = this.x;
    b.y = this.y;
    b.z = this.z;
  };

  // replace the current behaviour
  R.interrupt = function (gen) {
    this.co = gen;
    this.wait = 0;
    this.anim = null;
    this.hopping = false;
    this.ox = 0;
    if (this.asleep && gen) this.asleep = false;
    for (const e of W().entities) if (e.reservedBy === this) e.reservedBy = null;
  };

  // ================= helpers =================
  R.face = function (dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy) * 0.9 && dx !== 0) {
      this.side = dx > 0 ? 1 : -1;
      this.dir = dx > 0 ? 'R' : 'L';
    } else if (dy !== 0) {
      this.dir = dy > 0 ? 'D' : 'U';
    }
  };
  R.faceSide = function (s) {
    this.side = s;
    this.dir = s > 0 ? 'R' : 'L';
  };
  R.play = function (keys, fps) {
    this.anim = { keys, fps: fps || 6 };
    this.animT = 0;
  };
  R.still = function (key) {
    this.anim = null;
    this.pose = key;
  };
  R.say = function (spr) {
    W().fx({ spr, x: this.x + 4 * this.side, y: this.y, z: 20, vz: 14, g: 0, life: 0.9, ground: false });
  };
  R.hearts = function (n) {
    for (let i = 0; i < n; i++) {
      W().fx({ spr: i % 2 ? FX().heartS : FX().heart, x: this.x + U.rnd.range(-6, 6), y: this.y, z: 14 + U.rnd.range(0, 4), vz: 12 + U.rnd() * 6, vx: U.rnd.range(-4, 4), g: 0, life: 1.1 + i * 0.15, drift: 1.5, ground: false });
    }
  };
  R.hitTest = function (x, y) {
    return x >= this.x - 8 && x <= this.x + 8 && y >= this.y - this.z - 15 && y <= this.y + 2;
  };

  // hop toward a point. opts: { fast, maxHops }
  R.hopTo = function* (tx, ty, opts) {
    opts = opts || {};
    const B = W().bounds;
    tx = U.clamp(tx, B.x0, B.x1);
    ty = U.clamp(ty, B.y0, B.y1);
    let hops = 0;
    while (true) {
      const dx = tx - this.x;
      const dy = ty - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 1.2 || hops >= (opts.maxHops || 60)) break;
      hops++;
      this.face(dx, dy);
      const len = Math.min(d, opts.fast ? 11 : U.rnd.range(6, 8));
      const sx = this.x;
      const sy = this.y;
      const ex = sx + (dx / d) * len;
      const ey = sy + (dy / d) * len;
      this.anim = null;
      this.pose = 'crouch';
      yield opts.fast ? 0.05 : 0.09;
      this.pose = 'air';
      this.hopping = true;
      const dur = opts.fast ? 0.2 : 0.26;
      const hgt = opts.fast ? 4 : 3;
      let t = 0;
      while (t < dur) {
        yield;
        t += this.dt;
        const p = Math.min(1, t / dur);
        this.x = U.lerp(sx, ex, p);
        this.y = U.lerp(sy, ey, p);
        this.z = Math.sin(Math.PI * p) * hgt;
      }
      this.hopping = false;
      this.z = 0;
      this.pose = 'crouch';
      yield 0.06;
      this.pose = 'sit';
      if (!opts.fast) {
        yield U.rnd.range(0.05, 0.35);
        if (U.rnd() < 0.08) yield U.rnd.range(0.4, 1.2); // pause and sniff the air
      }
    }
    this.pose = 'sit';
  };

  // ================= decision =================
  R.decide = function () {
    const wd = W();
    this.anim = null;
    this.pose = 'sit';
    const night = wd.isNight();

    if (this.energy < 0.12 || (night && this.energy < 0.8 && U.rnd() < 0.6)) return this.sleep();

    const food = wd.all('carrot').find((c) => !c.reservedBy);
    if (food && this.hunger > 0.1) return this.eat(food);
    const plants = wd.all('carrotPlant').filter((p) => p.ready() && !p.reservedBy);
    if (plants.length && this.hunger > 0.22) {
      plants.sort((a, b) => U.dist(this.x, this.y, a.x, a.y) - U.dist(this.x, this.y, b.x, b.y));
      return this.harvest(plants[0]);
    }
    const ball = wd.first('ball');
    const bfly = wd.all('butterfly').find((b) => U.dist(b.x, b.y, this.x, this.y) < 40 && !b.leaving);
    const j = this.joy;
    const pick = U.weighted([
      ['idle', 3],
      ['wander', 3.2],
      ['groom', 1.1],
      ['look', 0.9],
      ['sniff', 1.1],
      ['dig', 0.35],
      ['flop', night ? 0.1 : j > 0.6 ? 0.8 : 0.25],
      ['stretch', 0.5],
      ['binky', j > 0.55 ? 0.7 : 0.1],
      ['zoomies', j > 0.7 ? 0.35 : 0.02],
      ['ball', ball ? 1.1 : 0],
      ['watch', bfly ? 1.2 : 0],
      ['loaf', night ? 1.2 : 0.3],
    ]);
    switch (pick) {
      case 'wander': return this.wander();
      case 'groom': return this.groom();
      case 'look': return this.look();
      case 'sniff': return this.sniff();
      case 'dig': return this.dig();
      case 'flop': return this.flop();
      case 'stretch': return this.stretch();
      case 'binky': return this.binky();
      case 'zoomies': return this.zoomies();
      case 'ball': return this.playBall(ball);
      case 'watch': return this.watch(bfly);
      case 'loaf': return this.loaf();
      default: return this.idle();
    }
  };

  // ================= behaviours =================
  R.idle = function* () {
    this.status = 'ノンビリ';
    if (U.rnd() < 0.5) this.dir = U.weighted([['D', 3], ['R', 1], ['L', 1], ['U', 0.5]]);
    if (this.dir === 'R') this.side = 1;
    if (this.dir === 'L') this.side = -1;
    this.pose = 'sit';
    yield U.rnd.range(2, 6);
  };

  R.wander = function* () {
    this.status = 'ピョンピョン';
    const a = U.rnd() * Math.PI * 2;
    const r = U.rnd.range(14, 55);
    yield* this.hopTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r * 0.8);
    this.status = 'ノンビリ';
    yield U.rnd.range(0.5, 2);
  };

  R.groom = function* () {
    this.status = 'ケヅクロイ';
    this.dir = 'D';
    this.pose = 'sit';
    yield 0.3;
    this.play(['D_groom1', 'D_groom2'], 4);
    yield U.rnd.range(2, 3.5);
    this.anim = null;
    this.still('D_happy');
    yield 0.6;
    this.pose = 'sit';
    yield 0.4;
  };

  R.look = function* () {
    this.status = 'キョロキョロ';
    this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.pose = 'crouch';
    yield 0.08;
    this.still('R_stand');
    yield U.rnd.range(0.8, 1.4);
    this.faceSide(-this.side);
    yield U.rnd.range(0.6, 1.2);
    if (U.rnd() < 0.5) {
      this.faceSide(-this.side);
      yield 0.8;
    }
    if (U.rnd() < 0.25) this.say(FX().what);
    this.pose = 'crouch';
    yield 0.08;
    this.pose = 'sit';
    yield 0.5;
  };

  R.sniff = function* () {
    this.status = 'クンクン';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.still('R_eat1');
    const n = U.rnd.int(2, 4);
    for (let i = 0; i < n; i++) {
      this.play(['R_eat1', 'R_eat2'], 10);
      yield U.rnd.range(0.4, 0.8);
      this.still('R_eat1');
      yield U.rnd.range(0.3, 0.9);
      if (U.rnd() < 0.4) {
        // shuffle forward a pixel or two
        this.x += this.side * 2;
      }
    }
    this.pose = 'sit';
    yield 0.4;
  };

  R.dig = function* () {
    this.status = 'ホリホリ';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.play(['R_dig1', 'R_dig2'], 9);
    const end = U.rnd.range(1.8, 3);
    let t = 0;
    while (t < end) {
      yield 0.12;
      t += 0.12;
      W().fx({ spr: U.rnd.pick(FX().dirt), x: this.x - this.side * 5, y: this.y, z: 2, vx: -this.side * U.rnd.range(20, 45), vy: U.rnd.range(-8, 8), vz: U.rnd.range(30, 60), life: 0.6 });
    }
    W().marks.push({ x: Math.round(this.x + this.side * 7), y: Math.round(this.y), age: 0, life: 25 });
    this.anim = null;
    this.pose = 'sit';
    yield 0.2;
    this.still('R_eat1');
    yield 0.6;
    this.pose = 'sit';
    yield 0.5;
  };

  R.flop = function* () {
    this.status = 'ゴローン';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.pose = 'crouch';
    yield 0.3;
    this.still('R_flop');
    W().fx({ spr: FX().dust[0], x: this.x - 4, y: this.y, z: 0, vz: 20, vx: -10, life: 0.4 });
    const dur = U.rnd.range(5, 11);
    let t = 0;
    while (t < dur) {
      yield 1.5;
      t += 1.5;
      if (U.rnd() < 0.3) this.hearts(1);
    }
    this.joy = U.clamp(this.joy + 0.05, 0, 1);
    this.pose = 'crouch';
    yield 0.2;
    this.pose = 'sit';
    yield 0.6;
  };

  R.stretch = function* () {
    this.status = 'ノビー';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.pose = 'crouch';
    yield 0.15;
    this.still('R_stretch');
    yield U.rnd.range(1.1, 1.8);
    this.pose = 'crouch';
    yield 0.12;
    this.pose = 'sit';
    this.blinking = 0.3;
    yield 0.6;
  };

  R.binky = function* () {
    this.status = 'ルンルン';
    const n = U.rnd.int(1, 3);
    for (let i = 0; i < n; i++) {
      if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
      this.pose = 'crouch';
      yield 0.12;
      this.pose = 'air';
      this.hopping = true;
      let t = 0;
      const dur = 0.5;
      let flipped = false;
      const sx = this.x;
      while (t < dur) {
        yield;
        t += this.dt;
        const p = Math.min(1, t / dur);
        this.z = Math.sin(Math.PI * p) * 11;
        this.x = sx + this.side * p * 4;
        if (!flipped && p > 0.45) {
          flipped = true;
          this.side = -this.side; // mid-air twist
          this.dir = this.side > 0 ? 'R' : 'L';
          W().fx({ spr: FX().spark, x: this.x, y: this.y, z: this.z + 8, vz: 0, g: 0, life: 0.4, ground: false });
        }
      }
      this.hopping = false;
      this.z = 0;
      this.pose = 'crouch';
      W().burst(FX().dust, this.x, this.y, 0, 2, 14, 16, 0.35);
      yield 0.12;
      this.pose = 'sit';
      yield U.rnd.range(0.2, 0.5);
    }
    this.joy = U.clamp(this.joy + 0.05, 0, 1);
    if (U.rnd() < 0.5) yield* this.zoomies();
  };

  R.zoomies = function* () {
    this.status = 'ダッシュ!';
    const n = U.rnd.int(2, 4);
    for (let i = 0; i < n; i++) {
      const p = W().freeSpot(0, []);
      yield* this.hopTo(p.x, p.y, { fast: true, maxHops: 8 });
    }
    this.pose = 'sit';
    this.status = 'ハァハァ';
    yield 1.2;
  };

  R.loaf = function* () {
    // resting like a bread loaf, drowsy slow blinks
    this.status = 'マッタリ';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.pose = 'crouch';
    yield 0.3;
    const dur = U.rnd.range(4, 9);
    let t = 0;
    while (t < dur) {
      this.still('R_loaf');
      const open = U.rnd.range(1, 2.5);
      yield open;
      this.still('R_sleep1');
      yield 0.5;
      t += open + 0.5;
    }
    this.still('R_loaf');
    yield 0.4;
    this.pose = 'crouch';
    yield 0.15;
    this.pose = 'sit';
    yield 0.4;
  };

  R.watch = function* (b) {
    this.status = 'ジー';
    let t = 0;
    const dur = U.rnd.range(2.5, 5);
    this.pose = 'sit';
    while (t < dur && b && !b.dead) {
      this.face(b.x - this.x, b.y - this.y);
      if (t > 1 && t < 1.1 && this.dir !== 'U' && this.dir !== 'D') this.still('R_stand');
      yield 0.1;
      t += 0.1;
    }
    this.pose = 'sit';
    if (U.rnd() < 0.3 && b && !b.dead) {
      this.status = 'マテー';
      yield* this.hopTo(b.x, b.y, { fast: true, maxHops: 4 });
    }
    yield 0.4;
  };

  R.sleep = function* () {
    this.status = 'ウトウト';
    if (this.dir === 'D' || this.dir === 'U') this.faceSide(U.rnd() < 0.5 ? 1 : -1);
    this.pose = 'sit';
    for (let i = 0; i < 3; i++) {
      this.still('R_blink');
      yield 0.4 + i * 0.2;
      this.pose = 'sit';
      yield 0.5;
    }
    this.pose = 'crouch';
    yield 0.4;
    this.asleep = true;
    this.status = 'スヤスヤ';
    this.play(['R_sleep1', 'R_sleep1', 'R_sleep2', 'R_sleep2'], 1.6);
    let zt = 0;
    while (true) {
      yield 0.25;
      zt += 0.25;
      if (zt > 2.2) {
        zt = 0;
        W().fx({ spr: U.rnd() < 0.5 ? FX().z : FX().zBig, x: this.x + this.side * 5, y: this.y, z: 10, vz: 7, vx: this.side * 3, g: 0, life: 2, drift: 2, ground: false });
      }
      const night = W().isNight();
      if (this.energy >= 1 && (!night || U.rnd() < 0.004)) break;
    }
    yield* this.wake();
  };

  R.wake = function* () {
    this.asleep = false;
    this.anim = null;
    this.status = 'ムニャ';
    this.still('R_blink');
    yield 0.6;
    this.pose = 'sit';
    yield 0.4;
    this.still('R_blink');
    yield 0.2;
    this.pose = 'sit';
    yield 0.3;
    yield* this.stretch();
  };

  R.harvest = function* (plant) {
    plant.reservedBy = this;
    this.status = 'ワクワク';
    this.say(FX().bang);
    this.face(plant.x - this.x, plant.y - this.y);
    yield 0.35;
    const s = this.x < plant.x ? -1 : 1;
    yield* this.hopTo(plant.x + s * 9, plant.y + 1, { fast: true });
    if (plant.dead) return;
    this.faceSide(-s);
    this.status = 'ウーン!';
    this.still('R_eat1');
    yield 0.3;
    for (let i = 0; i < 4; i++) {
      this.still('R_eat2');
      this.ox = s;
      yield 0.14;
      this.still('R_eat1');
      this.ox = 0;
      yield 0.14;
    }
    this.ox = s * 2;
    const food = plant.pull(this.x);
    food.reservedBy = this;
    this.pose = 'crouch';
    yield 0.15;
    this.ox = 0;
    this.pose = 'sit';
    this.status = 'ヤッタ!';
    W().fx({ spr: FX().spark, x: this.x, y: this.y, z: 18, vz: 8, g: 0, life: 0.6, ground: false });
    yield 0.6;
    yield* this.eat(food);
  };

  R.eat = function* (food) {
    food.reservedBy = this;
    this.status = 'ワクワク';
    // wait for it to land
    let t = 0;
    while ((food.body.z > 0 || Math.abs(food.body.vx) + Math.abs(food.body.vy) > 2) && t < 1.5) {
      yield;
      t += this.dt;
    }
    if (food.dead) return;
    const s = this.x < food.x ? 1 : -1; // side we eat from, facing the food
    food.tipLeft = s > 0; // thin end toward the mouth
    yield* this.hopTo(food.x - s * 13, food.y, { fast: U.dist(this.x, this.y, food.x, food.y) > 30 });
    if (food.dead) return;
    // nudge into place exactly
    this.x = food.x - s * 13;
    this.y = food.y;
    this.faceSide(s);
    this.status = 'モグモグ';
    this.play(['R_eat1', 'R_eat2'], 5);
    while (!food.dead) {
      yield 1.2;
      this.hunger = U.clamp(this.hunger - 0.13, 0, 1);
      // keep the carrot tip at the mouth as it gets shorter
      const done = food.bite();
      if (!done) {
        food.body.x -= s * 2;
      }
      if (U.rnd() < 0.3) this.hearts(1);
    }
    this.anim = null;
    this.pose = 'sit';
    this.joy = U.clamp(this.joy + 0.15, 0, 1);
    this.status = 'ゴチソウサマ';
    this.hearts(3);
    yield 1.2;
    if (U.rnd() < 0.6) yield* this.groom();
    else if (U.rnd() < 0.5) yield* this.binky();
  };

  R.playBall = function* (ball) {
    this.status = 'コロコロ';
    const n = U.rnd.int(1, 3);
    for (let i = 0; i < n && !ball.dead; i++) {
      // push toward the middle-ish of the meadow
      const B = W().bounds;
      const cx = U.rnd.range(B.x0 + 20, B.x1 - 20);
      const cy = U.rnd.range(B.y0 + 20, B.y1 - 20);
      let px = cx - ball.x;
      let py = cy - ball.y;
      const pl = Math.hypot(px, py) || 1;
      px /= pl;
      py /= pl;
      // approach from behind the ball
      yield* this.hopTo(ball.x - px * 10, ball.y - py * 8, { fast: U.dist(this.x, this.y, ball.x, ball.y) > 40, maxHops: 12 });
      if (ball.dead) return;
      this.face(ball.x - this.x, ball.y - this.y);
      if (this.dir === 'R' || this.dir === 'L') this.still('R_eat1');
      yield 0.2;
      if (U.dist(this.x, this.y, ball.x, ball.y) < 16) {
        const f = U.rnd.range(50, 95);
        U.physics.impulse(ball.body, px * f, py * f, U.rnd.range(10, 40));
      }
      this.pose = 'sit';
      yield U.rnd.range(0.4, 0.9);
    }
    if (U.rnd() < 0.4) yield* this.binky();
  };

  // ---------- reactions (called from input) ----------
  R.onPet = function () {
    if (this.asleep) {
      // stirs, but keeps sleeping unless poked again soon
      this.earing = 0.3;
      if (this.pokedAt && W().t - this.pokedAt < 3) {
        this.interrupt(this.wakeAndGreet());
      } else {
        W().fx({ spr: FX().z, x: this.x + this.side * 5, y: this.y, z: 10, vz: 8, g: 0, life: 1.2, ground: false });
      }
      this.pokedAt = W().t;
      return;
    }
    this.interrupt(this.petted());
  };
  R.wakeAndGreet = function* () {
    yield* this.wake();
    yield* this.petted();
  };
  R.petted = function* () {
    this.status = 'ウレシイ';
    this.dir = 'D';
    this.still('D_happy');
    this.hearts(2);
    this.joy = U.clamp(this.joy + 0.12, 0, 1);
    yield 0.9;
    while (this.petting) {
      yield 0.6;
      this.hearts(1);
      this.joy = U.clamp(this.joy + 0.03, 0, 1);
    }
    yield 0.4;
    this.pose = 'sit';
    if (this.joy > 0.7 && U.rnd() < 0.4) yield* this.binky();
    else yield 0.8;
  };
  R.onTapNear = function (x, y) {
    if (this.asleep || this.busy()) return;
    this.interrupt(this.curious(x, y));
  };
  R.curious = function* (x, y) {
    this.status = 'ン?';
    this.face(x - this.x, y - this.y);
    this.pose = 'sit';
    this.earing = 0.3;
    yield 0.3;
    if (this.dir === 'R' || this.dir === 'L') {
      this.still('R_stand');
      yield 0.7;
    }
    this.pose = 'sit';
    if (U.rnd() < 0.6) {
      this.status = 'ピョンピョン';
      const d = U.dist(this.x, this.y, x, y);
      const k = Math.max(0, (d - 10) / (d || 1));
      yield* this.hopTo(this.x + (x - this.x) * k, this.y + (y - this.y) * k);
      this.still('R_eat1');
      if (this.dir === 'D' || this.dir === 'U') this.pose = 'sit';
      this.status = 'クンクン';
      yield 1;
      this.pose = 'sit';
    }
    yield 0.5;
  };
  // busy = doing something it shouldn't be distracted from
  R.busy = function () {
    return this.status === 'モグモグ' || this.status === 'ウーン!' || this.status === 'ワクワク';
  };
  R.onBumped = function () {};
  // new food appeared: hungry rabbits drop what they're doing
  R.notifyFood = function () {
    if (this.asleep || this.busy()) return;
    if (this.hunger > 0.22) this.co = null;
  };

  // ================= drawing =================
  R.spriteKey = function () {
    const S = U.S.rabbit;
    let key;
    if (this.anim) {
      const k = this.anim.keys;
      key = k[Math.floor(this.animT * this.anim.fps) % k.length];
    } else if (this.pose === 'sit' || this.pose === 'crouch' || this.pose === 'air') {
      const d = this.dir === 'L' ? 'R' : this.dir;
      if (this.pose === 'sit') {
        if (this.blinking > 0 && S[d + '_blink']) key = d + '_blink';
        else if (this.earing > 0 && S[d + '_ear']) key = d + '_ear';
        else if (this.nosing > 0 && S[d + '_nose'] && Math.floor(this.animT * 12) % 2) key = d + '_nose';
        else key = d + '_sit';
      } else key = d + '_' + this.pose;
    } else key = this.pose;
    return key;
  };

  R.drawShadow = function (ctx) {
    const sh = U.S.shadow;
    const s = this.z > 7 ? sh.small : this.z > 3 ? sh.mid : sh.big;
    U.draw(ctx, s, this.x + this.ox, this.y);
  };
  R.draw = function (ctx) {
    const key = this.spriteKey();
    const spr = U.S.rabbit[key] || U.S.rabbit.D_sit;
    const flip = key.charAt(0) === 'R' && this.side < 0;
    U.draw(ctx, spr, this.x + this.ox, this.y - this.z, flip);
  };

  // persistence
  R.save = function () {
    return { x: Math.round(this.x), y: Math.round(this.y), hunger: this.hunger, energy: this.energy, joy: this.joy };
  };
  R.load = function (o) {
    if (!o) return;
    for (const k of ['hunger', 'energy', 'joy']) if (typeof o[k] === 'number') this[k] = U.clamp(o[k], 0, 1);
  };

  U.Rabbit = Rabbit;
})(window.U);
