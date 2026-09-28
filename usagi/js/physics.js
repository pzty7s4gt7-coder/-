'use strict';
// ------------------------------------------------------------
//  physics: tiny 2.5D rigid-circle physics for items & toys
// ------------------------------------------------------------
// Ground plane = x/y (screen space, y down). z = height above ground.
// A body is drawn at (x, y - z); its shadow stays at (x, y).
//
// body fields:
//   x y z vx vy vz   position / velocity (px, px/s)
//   r                radius on the ground plane (px)
//   mass             0 or Infinity = kinematic (pushes, never pushed)
//   bounce           restitution for ground & walls & other bodies (0..1)
//   friction         ground rolling friction (px/s^2 of decel per px/s → ratio/s)
//   solid            participates in body-body collisions
//   onBounce(speed)  optional callback when hitting the ground
// ------------------------------------------------------------
(function (U) {
  const P = (U.physics = {
    GRAVITY: 260, // px/s^2
    bodies: [],
    bounds: { x0: 0, y0: 0, x1: 100, y1: 100 },
  });

  P.makeBody = function (o) {
    return Object.assign(
      { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 3, mass: 1, bounce: 0.5, friction: 2.2, solid: true, grounded: true, spin: 0 },
      o || {}
    );
  };

  P.add = function (b) {
    if (P.bodies.indexOf(b) < 0) P.bodies.push(b);
    return b;
  };
  P.remove = function (b) {
    const i = P.bodies.indexOf(b);
    if (i >= 0) P.bodies.splice(i, 1);
  };

  P.impulse = function (b, vx, vy, vz) {
    b.vx += vx;
    b.vy += vy;
    b.vz += vz || 0;
  };

  function integrate(b, dt) {
    if (b.kinematic) return;
    // vertical
    if (b.z > 0 || b.vz > 0) {
      b.vz -= P.GRAVITY * dt;
      b.z += b.vz * dt;
      b.grounded = false;
      if (b.z <= 0) {
        b.z = 0;
        const impact = -b.vz;
        if (impact > 25) {
          b.vz = impact * b.bounce;
          b.onBounce && b.onBounce(impact);
        } else {
          b.vz = 0;
          b.grounded = true;
        }
      }
    } else {
      b.grounded = true;
    }
    // horizontal
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.grounded) {
      const k = Math.exp(-b.friction * dt);
      b.vx *= k;
      b.vy *= k;
      if (Math.abs(b.vx) < 0.5) b.vx = 0;
      if (Math.abs(b.vy) < 0.5) b.vy = 0;
    }
    // walls
    const B = P.bounds;
    if (b.x - b.r < B.x0) {
      b.x = B.x0 + b.r;
      b.vx = Math.abs(b.vx) * b.bounce;
    } else if (b.x + b.r > B.x1) {
      b.x = B.x1 - b.r;
      b.vx = -Math.abs(b.vx) * b.bounce;
    }
    if (b.y - b.r < B.y0) {
      b.y = B.y0 + b.r;
      b.vy = Math.abs(b.vy) * b.bounce;
    } else if (b.y > B.y1) {
      b.y = B.y1;
      b.vy = -Math.abs(b.vy) * b.bounce;
    }
  }

  function collide(a, b) {
    if (!a.solid || !b.solid) return;
    // bodies high in the air pass over low ones
    if (Math.abs(a.z - b.z) > Math.max(a.h || 6, b.h || 6)) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const rr = a.r + b.r;
    const d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr || d2 === 0) return;
    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;
    const overlap = rr - d;
    const ia = a.kinematic || !a.mass ? 0 : 1 / a.mass;
    const ib = b.kinematic || !b.mass ? 0 : 1 / b.mass;
    const isum = ia + ib;
    if (isum === 0) return;
    a.x -= nx * overlap * (ia / isum);
    a.y -= ny * overlap * (ia / isum);
    b.x += nx * overlap * (ib / isum);
    b.y += ny * overlap * (ib / isum);
    // relative velocity along normal
    const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (rv > 0) return;
    const e = Math.min(a.bounce, b.bounce);
    const j = (-(1 + e) * rv) / isum;
    a.vx -= j * nx * ia;
    a.vy -= j * ny * ia;
    b.vx += j * nx * ib;
    b.vy += j * ny * ib;
    a.onHit && a.onHit(b, j);
    b.onHit && b.onHit(a, j);
  }

  P.step = function (dt) {
    // substeps keep fast balls from tunnelling
    const n = 3;
    const h = dt / n;
    const L = P.bodies;
    for (let s = 0; s < n; s++) {
      for (let i = 0; i < L.length; i++) integrate(L[i], h);
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) collide(L[i], L[j]);
    }
  };
})(window.U);
