/*
 * HEAD parts (inherited). Hand-typed, left half only (mirror:true).
 * Fields:
 *   rows    left half of the sprite
 *   eyeY    row where the eyes' top row goes
 *   mouthY  row of the mouth
 *   gap     pixels between the two eyes (even number)
 *   noMirror: set true and type full width rows for asymmetric heads
 * Slots: o outline, a main, b shade, c light, d/e accent (hair, ribbons …)
 */
(function () {
  const H = (id, name, rows, o) =>
    TM.register('head', Object.assign({ id, name, spr: TM.spr(rows, { mirror: !o.noMirror, name: 'head:' + id }), gap: 6 }, o));

  // bottom half shared by the round faces (12 rows)
  const FACE_BOTTOM = [
    'oaaaaaaaaaa',
    'oaaaaaaaaaa',
    'oaaaaaaaaaa',
    'oaaaaaaaaaa',
    'oaaaaaaaaaa',
    'oaaaaaaaaaa',
    'obaaaaaaaaa',
    'obaaaaaaaaa',
    '.obaaaaaaaa',
    '.obbaaaaaaa',
    '..oobbaaaaa',
    '....ooooooo',
  ];

  H('maru', 'まる', [
    '......ooooo',
    '....ooccaaa',
    '...occaaaaa',
    '..ocaaaaaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 7, mouthY: 13 });

  H('neko', 'ねこみみ', [
    '..o........',
    '..oo.......',
    '..opo......',
    '..oppo.oooo',
    '..opppoccaa',
    '..oppaaaaaa',
    '.oaaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 9, mouthY: 15 });

  H('usagi', 'うさみみ', [
    '...oo......',
    '..oaao.....',
    '..oapo.....',
    '..oapo.....',
    '..oapo.....',
    '..oapo.....',
    '..oapoooooo',
    '..oapaccaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 11, mouthY: 17 });

  H('kuma', 'くまみみ', [
    '.ooo.......',
    'oaaao.ooooo',
    'oappoocaaaa',
    'oappaacaaaa',
    '.oaaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 7, mouthY: 13 });

  H('tsuno', 'つの', [
    '...o.......',
    '...oo......',
    '...odo.....',
    '...oddooooo',
    '..ooddccaaa',
    '..ocaaaaaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 9, mouthY: 15 });

  H('kurukuru', 'くるくるヘア', [
    '..oo..oo..oo',
    '.oddooddoodd',
    '.odddddddddd',
    'oddcdddddcdd',
    'odddeddddedd',
    'oddedddedddd',
    'odddaaaaaaaa',
    'oddaaaaaaaaa',
    'oddaaaaaaaaa',
    'odaaaaaaaaaa',
    'odaaaaaaaaaa',
    'odaaaaaaaaaa',
    'oddaaaaaaaaa',
    'oddaaaaaaaaa',
    '.odbaaaaaaaa',
    '.oddbbaaaaaa',
    '..ooobbbaaaa',
    '....oooooooo',
  ], { eyeY: 7, mouthY: 13, gap: 6 });

  H('odango', 'おだんご', [
    '.ooo.......',
    'oddeo......',
    'odddo.ooooo',
    'oedoooddcdd',
    '.oooddddddd',
    '..ooddddddd',
    '.oddddddddd',
    '.oddaddddda',
    'odaaaaaaaaa',
    'odaaaaaaaaa',
  ].concat(FACE_BOTTOM.slice(2)), { eyeY: 9, mouthY: 15 });

  H('happa', 'はっぱ', [
    '....GGG....',
    '...Ggggg...',
    '....GGgggG.',
    '.......GGGG',
    '.........GG',
    '......ooooG',
    '....ooccaaa',
    '...occaaaaa',
    '..ocaaaaaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 12, mouthY: 18 });

  H('boushi', 'はたぼうし', [
    '.........ww',
    '.........wu',
    '.........ww',
    '..........k',
    '......ooook',
    '....oodddcd',
    '...oddddddd',
    '..odddddddd',
    '.oddddddddd',
    'oeddeddedde',
    'oeaeeaeeaee',
    'oaaaaaaaaaa',
  ].concat(FACE_BOTTOM.slice(1)), { eyeY: 12, mouthY: 18 });

  H('ribbon', 'リボン', [
    '..oo.......',
    '.odeo......',
    '.oddeo..ooo',
    '.odddeooedd',
    '.oddddeoddd',
    '.oddeeooooo',
    '..oooocaaaa',
    '...ocaaaaaa',
    '..ocaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM.slice(1)), { eyeY: 10, mouthY: 16 });

  H('sushi', 'おすし', [
    '....ooooooo',
    '..oowwwwwww',
    '.owwwwwwwgg',
    '.owwwwwwggg',
    '.owwwwwwwgg',
    '.okwwwwwwww',
    '.okkkwwwwww',
    '.okkkkkkkkk',
    '.okkkkkkkkk',
    'ooooooooooo',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM.slice(1)), { eyeY: 11, mouthY: 17 });

  H('hiyoko', 'とさか', [
    '.........oo',
    '........oro',
    '.......oroo',
    '........orr',
    '......oooor',
    '....ooccaaa',
    '...occaaaaa',
    '..ocaaaaaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 11, mouthY: 17, beak: true });

  H('tenshi', 'てんしのわ', [
    '.....yyyyyy',
    '...yyY....Y',
    '....YYyyyyy',
    '...........',
    '......ooooo',
    '....ooccaaa',
    '...occaaaaa',
    '..ocaaaaaaa',
    '.ocaaaaaaaa',
    '.oaaaaaaaaa',
  ].concat(FACE_BOTTOM), { eyeY: 11, mouthY: 17 });
})();
