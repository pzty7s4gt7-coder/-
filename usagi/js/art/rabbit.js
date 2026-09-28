'use strict';
// ------------------------------------------------------------
//  Rabbit sprites — every pixel typed by hand.
//  o outline  W highlight  w fur  s shade  S deep shade
//  p ear pink  P nose pink  e eye  k blush
//  Frames are 16px tall, anchor = bottom centre (feet), x=7.
//  Side frames face RIGHT; left is drawn mirrored.
// ------------------------------------------------------------
(function (U) {
  const R = {};

  // ================= FRONT (facing down) =================
  R.D_sit = `
................
...oo......oo...
..owwo....owwo..
..owpo....opwo..
..owpo....opwo..
..owpo....opso..
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwewwwwwwesso.
.owwewwwwwwesso.
.okkwwwPPwwwkko.
.osswwwwwwwwsso.
.osswwwwwwwwsso.
..osWWsssWWsso..
...oooooooooo...
`;
  // one ear flicked outward
  R.D_ear = `
................
...oo...........
..owwo.....ooo..
..owpo....owwwo.
..owpo....oppwo.
..owpo....opsoo.
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwewwwwwwesso.
.owwewwwwwwesso.
.okkwwwPPwwwkko.
.osswwwwwwwwsso.
.osswwwwwwwwsso.
..osWWsssWWsso..
...oooooooooo...
`;
  // happy ^ ^ eyes (petting)
  R.D_happy = `
................
...oo......oo...
..owwo....owwo..
..owpo....opwo..
..owpo....opwo..
..owpo....opso..
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwowwwwwwosso.
.owowowwwwowoso.
.okkwwwPPwwwkko.
.osswwwwwwwwsso.
.osswwwwwwwwsso.
..osWWsssWWsso..
...oooooooooo...
`;
  // grooming: paws up to the face
  R.D_groom1 = `
................
...oo......oo...
..owwo....owwo..
..owpo....opwo..
..owpo....opwo..
..owpo....opso..
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwowwwwwwosso.
.owowowwwwowoso.
.okkwsSSsSSskko.
.osswSWWSWWSsso.
.osswSWWSWWSsso.
..osWWsssWWsso..
...oooooooooo...
`;
  R.D_groom2 = `
................
...oo......oo...
..owwo....owwo..
..owpo....opwo..
..owpo....opwo..
..owpo....opso..
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwowwwwwwosso.
.owowowwwwowoso.
.okkwwwPPwwwkko.
.osswsSSsSSssso.
.osswSWWSWWSsso.
..osSWWSWWSsso..
...oooooooooo...
`;

  // ================= BACK (facing up) =================
  R.U_sit = `
................
...oo......oo...
..owwo....owwo..
..owso....oswo..
..owso....oswo..
..owso....osso..
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwwwwwwwwwsso.
.owwwwwwwwwwsso.
.oswwwwwwwwssso.
.osswwwwwwwssso.
.osswwwwwwwsSso.
..osssoWWoSSso..
...oooooooooo...
`;
  R.U_ear = `
................
...oo...........
..owwo.....ooo..
..owso....owwwo.
..owso....osswo.
..owso....ossoo.
...owoooooowo...
..owwwwwwwwwso..
.owWwwwwwwwwsso.
.owwwwwwwwwwsso.
.owwwwwwwwwwsso.
.oswwwwwwwwssso.
.osswwwwwwwssso.
.osswwwwwwwsSso.
..osssoWWoSSso..
...oooooooooo...
`;

  // ================= SIDE (facing right) =================
  R.R_sit = `
................
........oo......
.......owwo.....
.......owpo.....
......oowpo.....
.....owowpo.....
.....oswowoooo..
.....oswwwwwwWo.
..ooooswwwwewwwo
.owwwwwwwwwwwwPo
oWwwwwwwwwwwkso.
owWwwwwwwwwwsso.
osswwwwssswsso..
.osswwssooswso..
..ossssoosWWWo..
...oooo..oooo...
`;
  R.R_ear = `
................
................
.....ooo........
....owwwoo......
.....oppwo......
.....oowpo......
.....oswowoooo..
.....oswwwwwwWo.
..ooooswwwwewwwo
.owwwwwwwwwwwwPo
oWwwwwwwwwwwkso.
owWwwwwwwwwwsso.
osswwwwssswsso..
.osswwssooswso..
..ossssoosWWWo..
...oooo..oooo...
`;
  // hop: take-off crouch
  R.R_crouch = `
................
................
................
.........ooo....
........owwpo...
.......owwpo....
.....oowwpooooo.
....oswwwwwwwWo.
..ooswwwwwewwwo.
.owwwwwwwwwwwwPo
oWwwwwwwwwwwkso.
owWwwwwwwwwwsso.
osswwwwssswsso..
.osswwssooswso..
..ossssoosWWWo..
...oooo..oooo...
`;
  // hop: in the air, body stretched
  R.R_air = `
................
................
................
.......ooo......
......owwpoo....
.......owwppo...
......ooowwoooo.
....ooswwwwwwWo.
..oowwwwwwwewwwo
.owwwwwwwwwwwwPo
oWwwwwwwwwwwwkso
owWwwwwwwwwwwso.
.osswwwwwswwsoo.
..osssssooowWWo.
..oooooo...ooo..
................
`;
  // eating / sniffing: head down to the ground
  R.R_eat1 = `
................
................
................
.......oo.......
......owwo......
......owpo......
.....oowpo......
....owowpo......
..oooswowoooo...
.owwwwswwwwwwo..
oWwwwwwwwwwwwwo.
owWwwwwwwwwwewwo
osswwwwwwwwwwkPo
.osswwwsswwwsso.
..ossssoosWWWo..
...oooo..oooo...
`;
  R.R_eat2 = `
................
................
................
.......oo.......
......owwo......
......owpo......
.....oowpo......
....owowpo......
..oooswowoooo...
.owwwwswwwwwwo..
oWwwwwwwwwwwwwo.
owWwwwwwwwwwowwo
osswwwwwwwwwwkoo
.osswwwsswwwsPo.
..ossssoosWWoo..
...oooo..oooo...
`;
  // sleeping loaf, ears laid back, eyes shut
  R.R_sleep1 = `
................
................
................
................
................
................
.......oooo.....
.....oowpppoo...
....owoooooowoo.
...owwwwwwwwwwwo
..oWwwwwwwwwwwwo
.oWwwwwwwwwoowPo
.owwwwwwwwwwwkso
.osswwwwwwwwwsso
..ossssssssssso.
...oooooooooooo.
`;
  R.R_sleep2 = `
................
................
................
................
................
................
................
.......oooo.....
.....oowpppoo...
...oowoooooowoo.
..oWwwwwwwwwwwwo
.oWwwwwwwwwwoowo
.owwwwwwwwwwwkPo
.osswwwwwwwwwsso
..ossssssssssso.
...oooooooooooo.
`;
  // standing on hind legs, looking around
  R.R_stand = `
.........oo.....
........owpo....
........owpo....
.......oowpo....
......owowpo....
......owoowoo...
......oswwwwWo..
......oswwwewwo.
.......owwwwwPo.
......oswwwwkso.
.....oswwwwsoo..
.....owwwwwsWo..
....oWwwwwwso...
....owWwwwwso...
...oosswwwsso...
...oooooooooo...
`;
  // flop: lying on its side, blissed out
  R.R_flop = `
................
................
................
................
................
................
................
.........ooooo..
....ooooowppppo.
...owwwwwoooooo.
..oWwwwwwwwwwwo.
.oWwwwwwwwwoowo.
.owwwwwwwwwwwkPo
.osswwwwwwwwwsso
..ossWsssssWsso.
...oo.oo..oo.oo.
`;
  // long stretch (20 wide)
  R.R_stretch = `
....................
....................
....................
....................
....................
....................
....................
.......oo...........
......owwo..........
......owppoo........
..ooooowwwppoooo....
.oWwwwwwwwwwwwwwWo..
oWwwwwwwwwwwwwwwewo.
owwwwwwwwwwwwwwwwwPo
oosssssssssssswwwkso
.oooooo.....oosWWWo.
`;
  // digging: front paws scratching
  R.R_dig1 = `
................
................
................
.......oo.......
......owwo......
......owpo......
.....oowpo......
....owowpo......
..oooswowoooo...
.owwwwswwwwwwo..
oWwwwwwwwwwwwwo.
owWwwwwwwwwwewwo
osswwwwwwwwwwkPo
.osswwwsswwwsso.
..ossssoosoWWWo.
...oooo..o.ooo..
`;
  R.R_dig2 = `
................
................
................
.......oo.......
......owwo......
......owpo......
.....oowpo......
....owowpo......
..oooswowoooo...
.owwwwswwwwwwo..
oWwwwwwwwwwwwwo.
owWwwwwwwwwwewwo
osswwwwwwwwwwkPo
.osswwwsswwsoo..
..ossssooWWWo...
...oooo.ooooo...
`;

  // ---------- derived frames (pixel ops on hand-typed frames) ----------
  const B = {};
  for (const k in R) B[k] = U.rows(R[k]);

  // blink: eyes become a 1px lid line
  B.D_blink = U.patch(B.D_sit, [[4, 9, 'w'], [4, 10, 'o'], [11, 9, 'w'], [11, 10, 'o']]);
  B.R_blink = U.patch(B.R_sit, [[11, 8, 'o']]);
  // nose wiggle: nose shifts up a pixel
  B.R_nose = U.patch(B.R_sit, [[14, 9, 'o'], [14, 8, 'P'], [15, 8, 'o'], [15, 9, '.']]);
  B.D_nose = U.patch(B.D_sit, [[7, 11, 'w'], [8, 11, 'w'], [7, 10, 'P'], [8, 10, 'P']]);

  // squash & stretch for front/back hops: drop or double a body row
  function squash(rows, rowToDrop) {
    const out = rows.slice();
    out.splice(rowToDrop, 1);
    out.unshift('.'.repeat(rows[0].length));
    return out;
  }
  function stretch(rows, rowToDouble) {
    const out = rows.slice();
    out.splice(rowToDouble, 0, rows[rowToDouble]);
    out.shift();
    return out;
  }
  B.D_crouch = squash(squash(B.D_sit, 8), 12);
  B.D_air = stretch(B.D_sit, 12);
  // resting loaf with eyes open
  B.R_loaf = U.patch(B.R_sleep1, [[10, 11, 'w'], [11, 11, 'e']]);
  B.U_crouch = squash(squash(B.U_sit, 8), 12);
  B.U_air = stretch(B.U_sit, 12);
  B.U_blink = B.U_sit;

  U.RABBIT_ROWS = B;

  // compile
  const S = {};
  for (const k in B) {
    const w = B[k][0].length;
    S[k] = U.spr(B[k], { ax: w === 20 ? 9 : 7, ay: B[k].length - 1 });
  }
  U.S.rabbit = S;

  // shadow under the rabbit (drawn with alpha)
  U.S.shadow = {
    big: U.spr(
      `
..zzzzzzzz..
.zzzzzzzzzz.
zzzzzzzzzzzz
.zzzzzzzzzz.
`,
      { ax: 6, ay: 2 }
    ),
    mid: U.spr(
      `
.zzzzzzzz.
zzzzzzzzzz
.zzzzzzzz.
`,
      { ax: 5, ay: 1 }
    ),
    small: U.spr(
      `
.zzzzzz.
zzzzzzzz
.zzzzzz.
`,
      { ax: 4, ay: 1 }
    ),
    tiny: U.spr(
      `
.zzz.
zzzzz
.zzz.
`,
      { ax: 2, ay: 1 }
    ),
    dot: U.spr(
      `
zzz
`,
      { ax: 1, ay: 0 }
    ),
  };
})(window.U);
