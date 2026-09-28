'use strict';
// ------------------------------------------------------------
//  Items, food, critters and particles — hand-typed.
// ------------------------------------------------------------
(function (U) {
  // ---------- carrot growing in the ground (anchor: centre of soil) ----------
  const carrot = {};
  carrot.grow = [
    // 0: freshly planted mound
    U.spr(`
..ddd..
.dfffd.
adddddb
.abbba.
`, { ax: 3, ay: 2 }),
    // 1: sprout
    U.spr(`
..i.i..
...l...
..ddd..
.dfffd.
adddddb
.abbba.
`, { ax: 3, ay: 4 }),
    // 2: leafy
    U.spr(`
.i...i.
.li.il.
..lil..
...l...
..dfd..
.adddb.
..aba..
`, { ax: 3, ay: 5 }),
    // 3: ready — orange crown peeks out
    U.spr(`
.i.i.i.
iliilii
.lLlLl.
..lLl..
..trt..
.qrrrq.
.aqqqb.
..aba..
`, { ax: 3, ay: 6 }),
  ];
  // ready carrot sways a little (alt frame)
  carrot.ready2 = U.spr(`
i.i.i..
liilii.
.lLlLl.
..lLl..
..trt..
.qrrrq.
.aqqqb.
..aba..
`, { ax: 3, ay: 6 });

  // pulled carrot lying on the ground, tip pointing left. 5 bites.
  const whole = U.rows(`
.........i.i
.....ttt.lil
..ttrrrrrlL.
qrrrrrqrrrl.
..qqqrrrqq..
`);
  carrot.lying = [];
  // bites remove columns from the tip (left) side
  const bites = [0, 2, 4, 6, 8];
  for (const b of bites) {
    carrot.lying.push(U.spr(whole.map((r) => '.'.repeat(b) + r.slice(b)), { ax: 6, ay: 4 }));
  }
  // just the leaves left
  carrot.leaves = U.spr(`
.i.i.
.lli.
..lLi
...l.
`, { ax: 2, ay: 3 });
  // held in the air (pulled out, vertical)
  carrot.pulled = U.spr(`
i.i.i
.lil.
..l..
.trt.
.rrr.
.qrq.
..r..
..q..
`, { ax: 2, ay: 7 });
  // seed packet icon-ish seed
  carrot.seed = U.spr(`
fd
db
`, { ax: 1, ay: 1 });

  U.S.carrot = carrot;

  // ---------- ball (4 roll frames) ----------
  const ball = [];
  // stripe moves down the ball as it rolls
  const stripes = [
    [
      '..ooo..',
      '.oXXXo.',
      'oWWWWWo',
      'oXXXXxo',
      'oXXXxxo',
      '.oxxxo.',
      '..ooo..',
    ],
    [
      '..ooo..',
      '.oXXXo.',
      'oXXXXXo',
      'oWWWWjo',
      'oXXXxxo',
      '.oxxxo.',
      '..ooo..',
    ],
    [
      '..ooo..',
      '.oXXXo.',
      'oXXXXXo',
      'oXXXXxo',
      'oWWWjjo',
      '.oxxxo.',
      '..ooo..',
    ],
    [
      '..ooo..',
      '.oWWWo.',
      'oXXXXXo',
      'oXXXXxo',
      'oXXXxxo',
      '.oxxxo.',
      '..ooo..',
    ],
  ];
  for (const rows of stripes) {
    ball.push(U.spr(rows, { ax: 3, ay: 6 }));
  }
  U.S.ball = ball;

  // ---------- particles ----------
  U.S.fx = {
    heart: U.spr(`
.H.H.
HGHHH
.HHH.
..H..
`, { ax: 2, ay: 3 }),
    heartS: U.spr(`
H.H
HHH
.H.
`, { ax: 1, ay: 2 }),
    note: U.spr(`
..cc
..c.
cc..
cc..
`, { ax: 1, ay: 3 }),
    z: U.spr(`
ccc
.c.
ccc
`, { ax: 1, ay: 2 }),
    zBig: U.spr(`
cccc
..c.
.c..
cccc
`, { ax: 1, ay: 3 }),
    spark: U.spr(`
.G.
GcG
.G.
`, { ax: 1, ay: 1 }),
    sweat: U.spr(`
.B
BB
`, { ax: 1, ay: 1 }),
    bang: U.spr(`
c
c
c
.
c
`, { ax: 0, ay: 4 }),
    what: U.spr(`
cc.
..c
.c.
...
.c.
`, { ax: 1, ay: 4 }),
    dust: [U.spr('ff\nfd', { ax: 1, ay: 1 }), U.spr('f', { ax: 0, ay: 0 })],
    dirt: [U.spr('db\nba', { ax: 1, ay: 1 }), U.spr('d', { ax: 0, ay: 0 }), U.spr('b', { ax: 0, ay: 0 })],
    crumb: [U.spr('rt', { ax: 0, ay: 0 }), U.spr('r', { ax: 0, ay: 0 }), U.spr('t', { ax: 0, ay: 0 })],
    leaf: [U.spr('il', { ax: 0, ay: 0 }), U.spr('i', { ax: 0, ay: 0 })],
    petal: [U.spr('R', { ax: 0, ay: 0 }), U.spr('W', { ax: 0, ay: 0 })],
  };

  // ---------- critters ----------
  U.S.butterfly = {
    white: [
      U.spr(`
cc.cc
cCoCc
.c.c.
`, { ax: 2, ay: 1 }),
      U.spr(`
.coc.
.CoC.
`, { ax: 2, ay: 1 }),
    ],
    yellow: [
      U.spr(`
YY.YY
YyoyY
.Y.Y.
`, { ax: 2, ay: 1 }),
      U.spr(`
.YoY.
.yoy.
`, { ax: 2, ay: 1 }),
    ],
    pink: [
      U.spr(`
RR.RR
RQoQR
.R.R.
`, { ax: 2, ay: 1 }),
      U.spr(`
.RoR.
.QoQ.
`, { ax: 2, ay: 1 }),
    ],
  };
})(window.U);
