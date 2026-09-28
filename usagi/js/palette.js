'use strict';
// ------------------------------------------------------------
//  Master palette. One character -> one colour.
//  Sprites may override any char locally via opts.pal.
// ------------------------------------------------------------
(function (U) {
  U.COL = {
    // outline / ink
    ink: '#3b2d3a',
    ink2: '#5a4453',
    // rabbit coat (cream white)
    fur0: '#ffffff',
    fur1: '#f4ece2',
    fur2: '#dccfc6',
    fur3: '#b9a7a4',
    pink: '#f5a9b8',
    pink2: '#e07d98',
    eye: '#2a1d2b',
    blush: '#f7c1cb',
    // grass
    g0: '#2d6b3c',
    g1: '#3c8544',
    g2: '#4f9d4b',
    g3: '#6db556',
    g4: '#94cc62',
    g5: '#bfe07a',
    // soil
    s0: '#5b3b2c',
    s1: '#7b5236',
    s2: '#9c6e46',
    s3: '#bf9160',
    // carrot
    c0: '#b8501c',
    c1: '#ec7d27',
    c2: '#ffa94a',
    c3: '#ffd08a',
    // leaf
    l0: '#23693a',
    l1: '#3a9a45',
    l2: '#6cc452',
    // flowers & misc
    white: '#ffffff',
    yellow: '#ffd84a',
    yellow2: '#e6a92e',
    rose: '#ff8fb3',
    rose2: '#d9608a',
    sky: '#8cc4ff',
    sky2: '#5a8fe0',
    lilac: '#c7a2ff',
    red: '#e8474f',
    red2: '#a92f3e',
    stone0: '#6f6a70',
    stone1: '#9b959a',
    stone2: '#c9c3c4',
    // ui
    ui0: '#2a1f2d',
    ui1: '#46344a',
    ui2: '#6c5570',
    cream: '#fff4df',
    cream2: '#e8d6b8',
    heart: '#ff6f91',
    heart2: '#c9416a',
    glow: '#fff6a0',
  };

  const C = U.COL;
  // single-char palette used by sprite strings
  Object.assign(U.PAL, {
    o: C.ink,
    O: C.ink2,
    W: C.fur0,
    w: C.fur1,
    s: C.fur2,
    S: C.fur3,
    p: C.pink,
    P: C.pink2,
    e: C.eye,
    k: C.blush,
    // grass
    0: C.g0,
    1: C.g1,
    2: C.g2,
    3: C.g3,
    4: C.g4,
    5: C.g5,
    // soil
    a: C.s0,
    b: C.s1,
    d: C.s2,
    f: C.s3,
    // carrot
    q: C.c0,
    r: C.c1,
    t: C.c2,
    u: C.c3,
    // leaf
    L: C.l0,
    l: C.l1,
    i: C.l2,
    // misc
    Y: C.yellow,
    y: C.yellow2,
    R: C.rose,
    Q: C.rose2,
    B: C.sky,
    V: C.lilac,
    X: C.red,
    x: C.red2,
    g: C.stone0,
    h: C.stone1,
    j: C.stone2,
    // ui
    U: C.ui0,
    v: C.ui1,
    m: C.ui2,
    c: C.cream,
    C: C.cream2,
    H: C.heart,
    J: C.heart2,
    G: C.glow,
    // shadow (drawn with alpha)
    z: '#1a3a2266',
    Z: '#1a3a2240',
  });
})(window.U);
