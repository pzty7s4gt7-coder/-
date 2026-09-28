'use strict';
// ------------------------------------------------------------
//  Meadow decorations — hand-typed.
//  Grass: 0 darkest .. 5 lightest.   Soil: a b d f.
// ------------------------------------------------------------
(function (U) {
  const F = {};

  // --- grass tufts (2 sway frames each), anchor at the root ---
  F.tuftA = [
    U.spr(`
.4...4.
.3.4.3.
..323..
.21312.
`, { ax: 3, ay: 3 }),
    U.spr(`
..4...4
..3.4.3
..323..
.21312.
`, { ax: 3, ay: 3 }),
  ];
  F.tuftB = [
    U.spr(`
..4..
4.3.4
.323.
`, { ax: 2, ay: 2 }),
    U.spr(`
...4.
.4.3.4
.323.
`, { ax: 2, ay: 2 }),
  ];
  F.tuftC = [
    U.spr(`
.5..4..
.4.43.5
.3.32.4
..2212.
`, { ax: 3, ay: 3 }),
    U.spr(`
..5..4.
..4.435
..3.324
..2212.
`, { ax: 3, ay: 3 }),
  ];

  // --- flowers (anchor: stem base) ---
  F.flowerW = U.spr(`
.W.
WYW
.W.
.l.
`, { ax: 1, ay: 3 });
  F.flowerY = U.spr(`
.Y.
YyY
.Y.
.l.
`, { ax: 1, ay: 3 });
  F.flowerP = U.spr(`
.R.
RYR
.R.
.l.
`, { ax: 1, ay: 3 });
  F.flowerB = U.spr(`
B.B
.W.
B.B
.l.
`, { ax: 1, ay: 3 });
  F.daisy = U.spr(`
.W.W.
WWYWW
.WYW.
W.W.W
..l..
`, { ax: 2, ay: 4 });
  F.bud = U.spr(`
.R
il
`, { ax: 1, ay: 1 });

  // --- flat ground details (drawn into the background) ---
  F.clover = U.spr(`
.44..
4334.
.3324
..33.
`);
  F.clover2 = U.spr(`
.4.4.
43434
.323.
`);
  F.pebble = U.spr(`
.hj.
ghhh
.gg.
`);
  F.pebble2 = U.spr(`
hj
gh
`);
  F.dirt = U.spr(`
.dd..
dbbd.
.ddbd
..dd.
`);
  F.blades = [
    U.spr(`
4
3
`),
    U.spr(`
.4
3.
`),
    U.spr(`
4.
.3
`),
    U.spr(`
5
4
`),
  ];
  F.darkBlades = [
    U.spr(`
1
0
`),
    U.spr(`
.1
0.
`),
    U.spr(`
1.1
010
`),
  ];

  // hole left after pulling a carrot (3 stages of healing)
  F.hole = [
    U.spr(`
.aaaa.
aabbba
abbbba
.dffd.
`, { ax: 3, ay: 2 }),
    U.spr(`
.2dd2.
.dbbd.
.2dd2.
`, { ax: 3, ay: 1 }),
    U.spr(`
.3..
.23.
`, { ax: 2, ay: 1 }),
  ];

  U.S.field = F;
})(window.U);
