'use strict';
// ------------------------------------------------------------
//  Ball: a physics toy. Flick it, the rabbit nudges it around.
//  Template for future items: give it a body, draw it at y - z.
// ------------------------------------------------------------
(function (U) {
  function Ball(x, y) {
    this.type = 'ball';
    this.roll = 0;
    this.body = U.physics.makeBody({ x, y, z: 0, r: 3, h: 7, mass: 1, bounce: 0.72, friction: 1.1 });
    this.body.onBounce = (s) => {
      if (s > 50) U.world.burst(U.S.fx.dust, this.body.x, this.body.y, 0, 2, 12, 20, 0.4);
    };
    this.body.onHit = (other, j) => {
      if (j > 30 && other.owner && other.owner.onBumped) other.owner.onBumped(this, j);
    };
    this.body.owner = this;
  }
  Object.defineProperty(Ball.prototype, 'x', { get() { return this.body.x; } });
  Object.defineProperty(Ball.prototype, 'y', { get() { return this.body.y; } });
  Ball.prototype.speed = function () {
    return Math.hypot(this.body.vx, this.body.vy);
  };
  Ball.prototype.update = function (dt) {
    // rolling stripe follows travelled distance
    this.roll += this.speed() * dt;
  };
  Ball.prototype.hit = function (x, y, r) {
    return Math.abs(x - this.body.x) <= (r || 5) && Math.abs(y - (this.body.y - this.body.z - 3)) <= (r || 5);
  };
  Ball.prototype.drawShadow = function (ctx) {
    const z = this.body.z;
    U.draw(ctx, z > 12 ? U.S.shadow.dot : U.S.shadow.tiny, this.body.x, this.body.y);
  };
  Ball.prototype.draw = function (ctx) {
    const fr = U.S.ball;
    // direction of roll decides which way the stripe cycles
    const dir = this.body.vy < 0 || (this.body.vy === 0 && this.body.vx < 0) ? -1 : 1;
    let i = Math.floor(this.roll / 3) % fr.length;
    if (dir < 0) i = (fr.length - 1 - i + fr.length) % fr.length;
    U.draw(ctx, fr[i], this.body.x, this.body.y - this.body.z);
  };
  U.Ball = Ball;
})(window.U);
