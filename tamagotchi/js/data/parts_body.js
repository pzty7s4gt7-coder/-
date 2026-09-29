/*
 * BODY parts (inherited). Left half, mirrored. The top 2 rows are hidden
 * behind the head (neck). Feet are on the last row.
 *
 * BACK parts (inherited): wings, tails … drawn BEHIND the body/head.
 *   ox / oy : offset from (body centre x - w/2 , body top y)
 */
(function () {
  const B = (id, name, rows, o) =>
    TM.register('body', Object.assign({ id, name, spr: TM.spr(rows, { mirror: true, name: 'body:' + id }) }, o || {}));

  B('futsuu', 'ふつう', [
    '...oooo',
    '..oaaaa',
    '.oaoaaa',
    'oaaoaaa',
    'oaaoaaa',
    '.oooaaa',
    '...obaa',
    '...obbb',
    '...oaao',
    '...oooo',
  ]);

  B('dress', 'ドレス', [
    '...oooo',
    '...oaaa',
    '.oaoddd',
    'oaaoddd',
    '.oooddd',
    '...oddd',
    '..odddd',
    '.oddddd',
    '.oeeeee',
    '.oooooo',
    '...oao.',
    '...ooo.',
  ]);

  B('necktie', 'ネクタイ', [
    '...oooo',
    '..oaawd',
    '.oaoawd',
    'oaaoaad',
    'oaaoaae',
    '.oooaad',
    '...obbe',
    '...obbb',
    '...oaao',
    '...oooo',
  ]);

  B('pocchari', 'ぽっちゃり', [
    '....oooo',
    '...oaaaa',
    '..oaaacc',
    '.ooaaccc',
    'oaoaaccc',
    'oaoaaccc',
    '.ooaaacc',
    '..obaaaa',
    '...obbbb',
    '....oaao',
    '....oooo',
  ]);

  B('muffler', 'マフラー', [
    '...oooo',
    '...oaaa',
    '.oddddd',
    '.oeeeee',
    'oaoaaaa',
    'oaoaaaa',
    '.ooaaaa',
    '..obbbb',
    '...oaao',
    '...oooo',
  ]);

  B('ribbon', 'むねリボン', [
    '...oooo',
    '..oaaaa',
    '.oaodaa',
    'oaaodde',
    'oaaodaa',
    '.oooaaa',
    '...obaa',
    '...obbb',
    '...oaao',
    '...oooo',
  ]);

  B('robo', 'ロボ', [
    '..ooooo',
    '..oaaaa',
    'MMoaaaa',
    'mMoalll',
    'mMoalry',
    'MMoalll',
    '..obbbb',
    '..oMMoo',
    '..oMMo.',
    '..oooo.',
  ]);

  B('overall', 'オーバーオール', [
    '...oooo',
    '..oaaaa',
    '.oaoaaa',
    'oaaodaa',
    'oaaodaa',
    '.oooddd',
    '...oddd',
    '...oeee',
    '...onno',
    '...oooo',
  ]);

  B('kimono', 'きもの', [
    '...oooo',
    '...owaa',
    '.odowdd',
    'oddodwd',
    'oddoddw',
    '.oooyyy',
    '...oYYY',
    '...oddd',
    '...oeee',
    '...owwo',
    '...oooo',
  ]);

  // ================= BACK =================
  const K = (id, name, rows, o) => {
    o = o || {};
    return TM.register('back', Object.assign({ id, name, spr: rows ? TM.spr(rows, { mirror: !o.noMirror, name: 'back:' + id }) : null, ox: 0, oy: 0 }, o));
  };

  K('none', 'なし', null);

  K('tenshi', 'てんしのはね', [
    '..mmm...........',
    '.mwwwmm.........',
    'mwwwwwwm........',
    'mwlwwwwwm.......',
    'mwwlwwwwwmm.....',
    '.mwwlwwwwwwm....',
    '..mwwllwwwwm....',
    '...mmwwlwwm.....',
    '.....mmmmm......',
  ], { oy: -7 });

  K('akuma', 'こうもりのはね', [
    'V...............',
    'VV..............',
    'VvV.............',
    'VvvVV...........',
    'VvvvvVV.........',
    'VvVvvvvVV.......',
    'V.VvVvvvvV......',
    '...V.VVVVV......',
  ], { oy: -6 });

  K('chou', 'ちょうのはね', [
    '.oo.............',
    'oddoo...........',
    'odcddoo.........',
    'oddddddo........',
    '.oddddddo.......',
    '..oooooo........',
    '..oeeeo.........',
    '...ooo..........',
  ], { oy: -7 });

  K('mant', 'マント', [
    '...ooooooo',
    '..oddddddd',
    '..oddddddd',
    '..oddddddd',
    '.odddddddd',
    '.odddddddd',
    '.odddddddd',
    'oddddddddd',
    'oeeeeeeeee',
    'oooooooooo',
  ], { oy: 0 });

  K('buta', 'くるりんしっぽ', [
    '.ooo.',
    'oaaao',
    'oaoao',
    'ooaao',
    '.ooo.',
  ], { noMirror: true, ox: 8, oy: 4 });

  K('neko', 'ねこのしっぽ', [
    '......oo',
    '.....oao',
    '.....oao',
    '....oao.',
    '...oao..',
    '..oao...',
    '.oao....',
    'oao.....',
    'oo......',
  ], { noMirror: true, ox: 9, oy: -1 });

  K('kitsune', 'ふさふさしっぽ', [
    '.....oo.',
    '....occo',
    '...oaaco',
    '..oaaaao',
    '.oaaaaao',
    '.oaaaao.',
    'oaaaao..',
    'oaaoo...',
    'ooo.....',
  ], { noMirror: true, ox: 9, oy: -2 });

  K('usagi', 'まんまるしっぽ', [
    '.ll.',
    'lwwl',
    'lwwl',
    '.ll.',
  ], { noMirror: true, ox: 8, oy: 5 });

  K('ryu', 'ドラゴンのはね', [
    '......G.........',
    '.....GgG........',
    '....GgggG.......',
    '...GgGgggG......',
    '..GgGgGgggG.....',
    '.GgG.GgGgggG....',
    'GG...G.GgggG....',
    '.......GGGG.....',
  ], { oy: -7 });
})();
