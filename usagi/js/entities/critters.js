'use strict';
// ------------------------------------------------------------
//  Ambient critters: butterflies by day, fireflies by night
// ------------------------------------------------------------
(function (U) {
  const W = () => U.world;

  // ---------- butterfly ----------
  function Butterfly() {
    const B = W().bounds;
    this.type = 'butterfly';
    this.kind = U.rnd.pick(['white', 'white', 'yellow', 'pink']);
    const fromLeft = U.rnd() < 0.5;
    this.x = fromLeft ? -4 : W().W + 4;
    this.y = U.rnd.range(B.y0, B.y1);
    this.z = U.rnd.range(10, 20);
    this.tx = U.rnd.range(B.x0, B.x1);
    this.ty = U.rnd.range(B.y0, B.y1);
    this.vx = 0;
    this.vy = 0;
    this.t = U.rnd() * 10;
    this.perch = 0; // seconds left sitting on a flower
    this.leaving = false;
    this.life = U.rnd.range(40, 90);
  }
  Butterfly.prototype.update = function (dt) {
    const wd = W();
    this.t += dt;
    this.life -= dt;
    if ((this.life < 0 || wd.darkness() > 0.5) && !this.leaving) {
      this.leaving = true;
      this.perch = 0;
      this.tx = this.x < wd.W / 2 ? -20 : wd.W + 20;
      this.ty = this.y + U.rnd.range(-30, 30);
    }
    if (this.perch > 0) {
      this.perch -= dt;
      this.z = Math.max(1, this.z - dt * 20);
      return;
    }
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) {
      if (this.leaving) {
        this.dead = true;
        return;
      }
      if (this.target && U.rnd() < 0.7) {
        this.perch = U.rnd.range(3, 7);
        this.target = null;
      }
      this.pickTarget();
    }
    const sp = 16;
    this.vx = U.lerp(this.vx, (dx / (d || 1)) * sp, dt * 1.5);
    this.vy = U.lerp(this.vy, (dy / (d || 1)) * sp, dt * 1.5);
    // fluttery wobble
    this.x += (this.vx + Math.sin(this.t * 7) * 10) * dt;
    this.y += (this.vy + Math.cos(this.t * 5.3) * 6) * dt;
    const wantZ = this.target && d < 20 ? 3 : 12 + Math.sin(this.t * 1.3) * 5;
    this.z = U.lerp(this.z, wantZ + Math.sin(this.t * 9) * 1.5, dt * 3);
  };
  Butterfly.prototype.pickTarget = function () {
    const wd = W();
    const flowers = wd.props.filter((p) => p.flower);
    if (flowers.length && U.rnd() < 0.5) {
      const f = U.rnd.pick(flowers);
      this.tx = f.x;
      this.ty = f.y - 2;
      this.target = f;
    } else {
      const B = wd.bounds;
      this.tx = U.rnd.range(B.x0, B.x1);
      this.ty = U.rnd.range(B.y0, B.y1);
      this.target = null;
    }
  };
  Butterfly.prototype.drawShadow = function (ctx) {
    if (this.x > -2 && this.x < W().W + 2) U.draw(ctx, U.S.shadow.dot, this.x, this.y);
  };
  Butterfly.prototype.draw = function (ctx) {
    const fr = U.S.butterfly[this.kind];
    const flap = this.perch > 0 ? Math.floor(this.t * 1.5) % 4 === 0 : Math.floor(this.t * 10) % 2 === 0;
    U.draw(ctx, flap ? fr[0] : fr[1], this.x, this.y - this.z);
  };
  U.Butterfly = Butterfly;

  // ---------- firefly ----------
  function Firefly() {
    const B = W().bounds;
    this.type = 'firefly';
    this.x = U.rnd.range(B.x0, B.x1);
    this.y = U.rnd.range(B.y0, B.y1);
    this.z = U.rnd.range(4, 16);
    this.t = U.rnd() * 20;
    this.ph = U.rnd() * 6;
    this.a = U.rnd() * Math.PI * 2;
    this.fade = 0;
  }
  Firefly.prototype.update = function (dt) {
    this.t += dt;
    this.a += U.rnd.range(-2, 2) * dt;
    this.x += Math.cos(this.a) * 5 * dt;
    this.y += Math.sin(this.a) * 3 * dt;
    this.z = 9 + Math.sin(this.t * 0.8 + this.ph) * 6;
    const B = W().bounds;
    if (this.x < B.x0 || this.x > B.x1 || this.y < B.y0 || this.y > B.y1) this.a += Math.PI * dt * 2;
    const dark = W().darkness();
    this.fade = U.clamp(this.fade + (dark > 0.6 ? dt : -dt) * 0.5, 0, 1);
    if (this.fade <= 0 && dark < 0.6) this.dead = true;
  };
  Firefly.prototype.drawGlow = function (ctx) {
    // pulse: long dark gaps, short bright blinks
    const p = (Math.sin(this.t * 1.7 + this.ph) + 1) / 2;
    const lvl = p * this.fade;
    if (lvl < 0.25) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y - this.z);
    ctx.fillStyle = U.COL.glow;
    ctx.fillRect(x, y, 1, 1);
    if (lvl > 0.7) {
      ctx.fillStyle = '#d8f07a';
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
    }
  };
  U.Firefly = Firefly;
})(window.U);
