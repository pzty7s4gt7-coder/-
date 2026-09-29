/*
 * Life-stage sprites: egg → baby → child → (adult is built from parts).
 * All are recoloured by the colour gene. Child sprites show a small hint of
 * the inherited head ("childDeco") so you can guess what the adult will be.
 */
(function () {
  TM.STAGE = {};

  TM.STAGE.egg = TM.spr([
    '......oo',
    '....ooaa',
    '...oaaaa',
    '..oaacaa',
    '..oacaaa',
    '.oaaaaaa',
    '.oaaaaaa',
    'odaadaad',
    'oddddddd',
    'oaddaadd',
    'oaaaaaaa',
    'oaaaaaaa',
    'obaaaaaa',
    '.obaaaaa',
    '.obbaaaa',
    '..obbbbb',
    '...ooooo',
  ], { mirror: true, name: 'egg' });

  // hatching cracks drawn over the egg (frame 1, 2)
  TM.STAGE.crack = [
    TM.spr([
      '................',
      '................',
      '................',
      '................',
      '.......k........',
      '......k.k.......',
      '.....k...k......',
    ]),
    TM.spr([
      '................',
      '................',
      '.......k........',
      '......k.k.......',
      '..k..k...k..k...',
      '...kk.....kk.k..',
      '.............k..',
    ]),
  ];
  // egg shell halves after hatching
  TM.STAGE.shell = TM.spr([
    'o.o..o.o',
    'oaoaaoao',
    'oaaaaaaa',
    'obaaaaaa',
    '.obaaaaa',
    '.obbaaaa',
    '..obbbbb',
    '...ooooo',
  ], { mirror: true });

  TM.STAGE.baby = [
    {
      spr: TM.spr([
        '...oooo',
        '.ooaaaa',
        '.occaaa',
        'ocaaaaa',
        'oaaaaaa',
        'oaaaaaa',
        'oaaaaaa',
        'oaaaaaa',
        'obaaaaa',
        '.obbaaa',
        '..oobbb',
        '....ooo',
      ], { mirror: true, name: 'baby1' }),
      eyeY: 4, mouthY: 8, gap: 4,
    },
    {
      spr: TM.spr([
        '.....o.',
        '......o',
        '...oooo',
        '.ooaaaa',
        '.occaaa',
        'ocaaaaa',
        'oaaaaaa',
        'oaaaaaa',
        'oaaaaaa',
        'obaaaaa',
        'obaaaaa',
        '.obbaaa',
        '..oobbb',
        '....ooo',
      ], { mirror: true, name: 'baby2' }),
      eyeY: 6, mouthY: 10, gap: 4,
    },
  ];

  TM.STAGE.child = {
    spr: TM.spr([
      '.....oooo',
      '...ooccaa',
      '..occaaaa',
      '.ocaaaaaa',
      '.oaaaaaaa',
      'oaaaaaaaa',
      'oaaaaaaaa',
      'oaaaaaaaa',
      'oaaaaaaaa',
      'oaaaaaaaa',
      'obaaaaaaa',
      '.obaaaaaa',
      '..oobbbbb',
      '...oooaaa',
      '..oaoaaaa',
      '..oaoaaaa',
      '...oobbbb',
      '....oaao.',
      '....oooo.',
    ], { mirror: true, name: 'child' }),
    eyeY: 4, mouthY: 10, gap: 2,
  };

  // small decorations that hint the adult head (keyed by head id)
  const D = (rows, dy) => ({ spr: TM.spr(rows, { mirror: true }), dy });
  TM.CHILD_DECO = {
    neko: D(['..o......', '..oo.....', '..opo....', '..oppo...'], -3),
    usagi: D(['...oo....', '..oapo...', '..oapo...', '..oapo...', '..oapo...'], -4),
    kuma: D(['.ooo.....', 'oaaao....', 'oapo.....'], -2),
    happa: D(['......GG.', '.......GG', '........G'], -3),
    tsuno: D(['...o.....', '...oo....', '...odo...'], -2),
    ribbon: D(['..oo.....', '.odeo..oo', '.oddeooed', '..ooo..oo'], -3),
    tenshi: D(['.....yyyy', '....Y....', '.....YYYY'], -5),
    hiyoko: D(['.......oo', '.......or'], -2),
    kurukuru: D(['...oo.oo.', '..oddoddo', '..odddddd'], -2),
    odango: D(['..ooo....', '.oddeo...', '.odddo...', '..ooo....'], -2),
    boushi: D(['.......ww', '.......wu', '........k', '.....oodd'], -3),
    sushi: D(['.....oooo', '....owwwg', '....okkkk'], -2),
  };
})();
