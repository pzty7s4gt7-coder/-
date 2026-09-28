'use strict';
// ------------------------------------------------------------
//  Carrots: a plant that grows in stages, and the pulled carrot
// ------------------------------------------------------------
(function (U) {
  const W = () => U.world;

  // ---------- growing plant ----------
  function CarrotPlant(x, y, opts) {
    opts = opts || {};
    this.type = 'carrotPlant';
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.stage = opts.stage || 0;
    this.t = 0;
    this.growT = this.nextGrowT();
    this.reservedBy = null;
    this.pop = 0; // little squash when a stage advances
  }
  CarrotPlant.prototype.nextGrowT = function () {
    return U.rnd.range(9, 16);
  };
  CarrotPlant.prototype.ready = function () {
    return this.stage >= 3;
  };
  CarrotPlant.prototype.update = function (dt) {
    this.t += dt;
    this.pop = Math.max(0, this.pop - dt * 4);
    if (this.stage < 3 && this.t > this.growT) {
      this.stage++;
      this.t = 0;
      this.growT = this.nextGrowT();
      this.pop = 1;
      W().burst([U.S.fx.leaf[0], U.S.fx.leaf[1]], this.x, this.y - 2, 2, 3, 12, 40, 0.5);
      if (this.stage === 3) {
        W().fx({ spr: U.S.fx.spark, x: this.x, y: this.y, z: 10, vz: 10, g: 0, life: 0.8 });
        U.ui && U.ui.toast('ニンジン ガ デキタ!', U.S.ui.carrot);
      }
    }
  };
  CarrotPlant.prototype.draw = function (ctx) {
    const c = U.S.carrot;
    let s = c.grow[this.stage];
    if (this.stage === 3) {
      const w = Math.sin(W().t * 1.6 - this.x * 0.07 - this.y * 0.03);
      if (w > 0.82 - W().gust * 0.9) s = c.ready2;
    }
    const dy = this.pop > 0.5 ? 1 : 0;
    U.draw(ctx, s, this.x, this.y + dy);
  };
  // rabbit pulls it out -> becomes food; returns the food entity
  CarrotPlant.prototype.pull = function (towardX) {
    this.dead = true;
    const wd = W();
    wd.marks.push({ x: this.x, y: this.y, age: 0, life: 40 });
    wd.burst(U.S.fx.dirt, this.x, this.y, 1, 6, 30, 70, 0.6);
    const food = new CarrotFood(this.x, this.y + 1, towardX < this.x);
    food.body.vz = 70;
    food.body.vx = (towardX - this.x) * 0.9;
    return wd.add(food);
  };
  U.CarrotPlant = CarrotPlant;

  // ---------- pulled carrot lying on the grass ----------
  // tipLeft: the thin end points left (toward a rabbit on the left eats from the tip)
  function CarrotFood(x, y, tipLeft) {
    this.type = 'carrot';
    this.tipLeft = !!tipLeft;
    this.bites = 0;
    this.maxBites = U.S.carrot.lying.length; // after the last bite only leaves remain
    this.reservedBy = null;
    this.body = U.physics.makeBody({ x, y, z: 0, r: 3, h: 4, mass: 0.6, bounce: 0.3, friction: 5 });
    this.body.onBounce = (s) => {
      if (s > 40) W().burst(U.S.fx.dust, this.body.x, this.body.y, 0, 2, 10, 20, 0.4);
    };
  }
  Object.defineProperty(CarrotFood.prototype, 'x', { get() { return this.body.x; } });
  Object.defineProperty(CarrotFood.prototype, 'y', { get() { return this.body.y; } });
  CarrotFood.prototype.update = function () {};
  CarrotFood.prototype.bite = function () {
    this.bites++;
    const tipX = this.body.x + (this.tipLeft ? -4 : 4);
    W().burst(U.S.fx.crumb, tipX, this.body.y, 2, 3, 18, 40, 0.5);
    if (this.bites >= this.maxBites) {
      this.dead = true;
      W().burst(U.S.fx.leaf, this.body.x, this.body.y, 1, 4, 16, 40, 0.8);
      return true;
    }
    return false;
  };
  CarrotFood.prototype.drawShadow = function (ctx) {
    if (this.body.z > 1) U.draw(ctx, U.S.shadow.tiny, this.body.x, this.body.y);
  };
  CarrotFood.prototype.draw = function (ctx) {
    const s = U.S.carrot.lying[Math.min(this.bites, U.S.carrot.lying.length - 1)];
    // sprite has the tip on the left; mirror when the tip should point right
    U.draw(ctx, s, this.body.x, this.body.y - this.body.z, !this.tipLeft);
  };
  U.CarrotFood = CarrotFood;
})(window.U);
