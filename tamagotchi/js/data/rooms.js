/*
 * FURNITURE and ROOMS (living room themes).
 *
 * Furniture sprites may use the sky slots  A (sky) / C (cloud or star)
 * which change with the real time of day (see TM.SKY).
 *
 * TM.register('furniture', { id, name, spr })
 * TM.register('room', { id, name, wall, floor, board, items:[{id, x, y}] })
 *   x = left, y = bottom (world px). Floor starts at y = TM.FLOOR_Y.
 */
(function () {
  const S = (rows, o) => TM.spr(rows, o || {});
  TM.FLOOR_Y = 74;

  // sky palettes for windows
  TM.SKY = {
    morning: { id: 'sky-m', A: '#ffd6b0', C: '#ffffff' },
    day: { id: 'sky-d', A: '#8fd3ff', C: '#ffffff' },
    evening: { id: 'sky-e', A: '#ff9e7a', C: '#ffd84a' },
    night: { id: 'sky-n', A: '#1c2448', C: '#ffe38a' },
  };

  const FU = (id, name, rows, o) => TM.register('furniture', Object.assign({ id, name, spr: S(rows, { mirror: o && o.mirror, pal: o && o.pal, name: 'fu:' + id }) }, o || {}));

  FU('window', 'まど', [
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    'k0000000000kk0000000000k',
    'k0AAAAAAAAAkk0AAAAAAAA0k',
    'k0AACCAAAAAkk0AAAAAAAA0k',
    'k0ACCCCAAAAkk0AAAAACCA0k',
    'k0AAAAAAAAAkk0AAAACCCC0k',
    'k0AAAAAAAAAkk0AAAAAAAA0k',
    'k0AAAAAAAAAkk0AAAAAAAA0k',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    'k0AAAAAAAAAkk0AAAAAAAA0k',
    'k0AAAAAAAAAkk0ACCAAAAA0k',
    'k0AAAACAAAAkk0AAAAAAAA0k',
    'k0AAAAAAAAAkk0AAAAAAAA0k',
    'k0000000000kk0000000000k',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    '.k8888888888888888888k..',
    '..kkkkkkkkkkkkkkkkkkk...',
  ]);

  FU('heartwin', 'ハートのまど', [
    '...kkkk....kkkk...',
    '..kPPPPk..kPPPPk..',
    '.kPAAAAPkkPAAAAPk.',
    'kPAACCAAPPAAAAAAPk',
    'kPACCCCAAAAAACAAPk',
    'kPAAAAAAAAAACCCAPk',
    'kPAAAAAAAAAAAAAAPk',
    '.kPAAAAAAAAAAAAPk.',
    '..kPAAAAAAAAAAPk..',
    '...kPAAAAAAAAPk...',
    '....kPAAAAAAPk....',
    '.....kPAAAAPk.....',
    '......kPAAPk......',
    '.......kPPk.......',
    '........kk........',
  ]);

  FU('porthole', 'まるまど', [
    '....kkkkkkkk....',
    '..kkllllllllkk..',
    '.kllmmmmmmmmllk.',
    '.klmAAAAAACAmlk.',
    'klmAAAAAAAAAAmlk',
    'klmACAAAAAAAAmlk',
    'klmAAAAAAAACAmlk',
    'klmAAAAAAAAAAmlk',
    'klmAAAAAAAAAAmlk',
    'klmAAACAAAAAAmlk',
    '.klmAAAAAAAAmlk.',
    '.kllmmmmmmmmllk.',
    '..kkllllllllkk..',
    '....kkkkkkkk....',
  ]);

  FU('shoji', 'しょうじ', [
    'kkkkkkkkkkkkkkkkkkkkkk',
    'k88888888888888888888k',
    'k8q8q8q8q88q8q8q8q8q8k',
    'k88888888888888888888k',
    'k8q8q8q8q88q8q8q8q8q8k',
    'k88888888888888888888k',
    'k8q8q8q8q88q8q8q8q8q8k',
    'k88888888888888888888k',
    'k8q8q8q8q88q8q8q8q8q8k',
    'k88888888888888888888k',
    'k8q8q8q8q88q8q8q8q8q8k',
    'k88888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkkkk',
  ]);

  FU('sofa', 'ソファ', [
    '..kkkkkkkkkkkkkkkkkkkk..',
    '.kxxxxxxxxxxxxxxxxxxxxk.',
    '.kxPxxxxPxxxxPxxxxPxxxk.',
    '.kxxxxxxxxxxxxxxxxxxxxk.',
    'kkkxxxxxxxxxxxxxxxxxxkkk',
    'kxxkkkkkkkkkkkkkkkkkkxxk',
    'kxxkxxxxxxxxxxxxxxxxkxxk',
    'kxxkPPPPPPPPPPPPPPPPkxxk',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    'kPPPPPPPPPPPPPPPPPPPPPPk',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    '.k9k................k9k.',
    '.kkk................kkk.',
  ]);

  FU('starlamp', 'ほしのランプ', [
    '...y...',
    '...y...',
    '..yyy..',
    'yyywyyy',
    '.yyyyy.',
    '.yy.yy.',
    'y.....y',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '..kPk..',
    '.kPPPk.',
    'kkkkkkk',
  ]);

  FU('plant', 'かんようしょくぶつ', [
    '....G..G....',
    '...GgG.GgG..',
    '..GgggGgggG.',
    '.GgghgggghgG',
    '.GggGggggGgG',
    'GgghGgGgGgG.',
    'GgGgggGggggG',
    '.GGgGgGgGGG.',
    '...GG.GGG...',
    '..kkkkkkkk..',
    '..knnnnnnk..',
    '...kn88nk...',
    '...knnnnk...',
    '...kkkkkk...',
  ]);

  FU('shelf', 'たな', [
    'kkkkkkkkkkkkkkkk',
    'k88888888888888k',
    'k8kkk8kk88kkkk8k',
    'k8krk8kuk8kyyk8k',
    'k8krk8kuk8kyyk8k',
    'k8kkk8kkk8kkkk8k',
    'kkkkkkkkkkkkkkkk',
    'k88888888888888k',
    'k88kkk888kPPk88k',
    'k88kgk88kPwwPk8k',
    'k88kkk888kPPk88k',
    'kkkkkkkkkkkkkkkk',
    'k9k..........k9k',
    'kkk..........kkk',
  ]);

  FU('clock', 'とけい', [
    '..kkkkkk..',
    '.kwwwkwwk.',
    'kwwwwkwwwk',
    'kwwwwkwwwk',
    'kkwwwkkkkk',
    'kwwwwwwwwk',
    'kwwwwwwwwk',
    '.kwwwwwwk.',
    '..kkkkkk..',
  ]);

  FU('frame', 'がくぶち', [
    'kkkkkkkkkkkkkk',
    'kyyyyyyyyyyyyk',
    'ky2222222222yk',
    'ky2222y22222yk',
    'ky2222222222yk',
    'ky22g222222gyk',
    'ky2ggg2222ggyk',
    'kyggggggggggyk',
    'kyyyyyyyyyyyyk',
    'kkkkkkkkkkkkkk',
  ]);

  FU('rug', 'ラグ', [
    '......kkkkkkkkkkkkkkkkkkkkkkkkkkkk......',
    '...kkk5555555555555555555555555555kkk...',
    '.kk55555x55555x55555x55555x55555x5555kk.',
    'k555x55555x55555x55555x55555x55555x5555k',
    '.kk55555x55555x55555x55555x55555x5555kk.',
    '...kkk5555555555555555555555555555kkk...',
    '......kkkkkkkkkkkkkkkkkkkkkkkkkkkk......',
  ]);

  FU('dresser', 'たんす', [
    'kkkkkkkkkkkkkkkkkk',
    'k7777777777777777k',
    'kkkkkkkkkkkkkkkkkk',
    'k777777kyk7777777k',
    'k777777kkk7777777k',
    'kkkkkkkkkkkkkkkkkk',
    'k777777kyk7777777k',
    'k777777kkk7777777k',
    'kkkkkkkkkkkkkkkkkk',
    'k777777kyk7777777k',
    'k777777kkk7777777k',
    'kkkkkkkkkkkkkkkkkk',
    'k8k............k8k',
    'kkk............kkk',
  ]);

  FU('caketable', 'ケーキテーブル', [
    '........rr........',
    '.......rrrr.......',
    '......kkkkkk......',
    '....kkwwwwwwkk....',
    '...kwwwxwwxwwwk...',
    '...kxxxxxxxxxxk...',
    '...kqqqqqqqqqqk...',
    'kkkkkkkkkkkkkkkkkk',
    'kxPxPxPxPxPxPxPxPk',
    'kkkkkkkkkkkkkkkkkk',
    '.......kxxk.......',
    '.......kxxk.......',
    '.......kxxk.......',
    '.....kkkkkkkk.....',
  ]);

  FU('lollipop', 'キャンディランプ', [
    '...kkkkk...',
    '..kPPwPPk..',
    '.kPwwPPwPk.',
    'kPwPPwwPPwk',
    'kPPwwPPwwPk',
    'kwPPwPPwPPk',
    '.kPwwPPwPk.',
    '..kPPPPPk..',
    '...kkkkk...',
    '.....k.....',
    '.....k.....',
    '.....k.....',
    '.....k.....',
    '.....k.....',
    '.....k.....',
    '...kkkkk...',
  ]);

  FU('planet', 'わくせいランプ', [
    '......kkkk......',
    '....kkvvvvkk....',
    '...kvvwvvvvvk...',
    'kkkkkkkkkkkkkkkk',
    'kyyyyyyyyyyyyyyk',
    'kkkkkkkkkkkkkkkk',
    '...kvvvvvvVVk...',
    '....kkVVVVkk....',
    '......kkkk......',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
    '.....kkkkkk.....',
  ]);

  FU('rocket', 'ロケット', [
    '.....kk.....',
    '....kwwk....',
    '...kwwwwk...',
    '...kwuuwk...',
    '...kwuuwk...',
    '...kwwwwk...',
    '..kkwwwwkk..',
    '.krkwwwwkrk.',
    'krrkwwwwkrrk',
    'kkkkkkkkkkkk',
    '...kyttyk...',
    '....kyyk....',
  ]);

  FU('chochin', 'ちょうちん', [
    '....kkkk....',
    '..kkkkkkkk..',
    '.krrrrrrrrk.',
    'krrrrrrrrrrk',
    'kRRRRRRRRRRk',
    'krrrwwwwrrrk',
    'krrrrrrrrrrk',
    'kRRRRRRRRRRk',
    '.krrrrrrrrk.',
    '..kkkkkkkk..',
    '....kkkk....',
  ]);

  FU('kotatsu', 'こたつ', [
    '..kkkkkkkkkkkkkkkkkkkkkk..',
    '..k88888888888888888888k..',
    'kkkkkkkkkkkkkkkkkkkkkkkkkk',
    'krrrrrrrrrrrrrrrrrrrrrrrrk',
    'krrwrrrrrrwrrrrrrwrrrrrwrk',
    'krrrrrrrrrrrrrrrrrrrrrrrrk',
    'kRRRRRRRRRRRRRRRRRRRRRRRRk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkk',
  ]);

  FU('mikan', 'みかん', [
    '...G..',
    '.kkGk.',
    'kttttk',
    'ktyttk',
    'kttttk',
    '.kkkk.',
  ]);

  // ================= wall / floor tiles =================
  const T = TM.TILE = {};
  T.yume_wall = S([
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxPxPxx',
    'xxxxxxx55xxPPPxx',
    'xxxxxxx55xxxPxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
    'xxxxxxx55xxxxxxx',
  ]);
  T.yume_floor = S([
    '55555555xxxxxxxx',
    '5555555wxxxxxxxx',
    '55555555xxxxxxxx',
    '55555555xxxxxxxx',
    'xxxxxxxx55555555',
    'xxxxxxxx5555555w',
    'xxxxxxxx55555555',
    'xxxxxxxx55555555',
  ]);
  T.nat_wall = S([
    '0000000000000000',
    '0000000000000000',
    '00h0000000000000',
    '0hhg000000000000',
    '00g0000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000h00000',
    '000000000hhg0000',
    '0000000000g00000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
  ]);
  T.nat_floor = S([
    '7777777777777778',
    '7777777777777778',
    '8888888888888888',
    '7777778777777777',
    '7777778777777777',
    '8888888888888888',
    '7777777777877777',
    '8888888888888888',
  ]);
  T.sweet_wall = S([
    '4444444444444444',
    '44ww444444444444',
    '4wwww44444444444',
    '44ww444444444444',
    '4444444444444444',
    '4444444444444444',
    '4444444444xx4444',
    '444444444xxxx444',
    '4444444444xx4444',
    '4444444444444444',
    '4444444444444444',
    '4444444444444444',
    '4444444444444444',
    '44yy444444444444',
    '4yyyy44444444444',
    '44yy444444444444',
  ]);
  T.sweet_floor = S([
    'nnnnnnnNnnnnnnnN',
    'nsnnnnnNnsnnnnnN',
    'nnnnnnnNnnnnnnnN',
    'NNNNNNNNNNNNNNNN',
    'nnnNnnnnnnnNnnnn',
    'nnnNnsnnnnnNnsnn',
    'nnnNnnnnnnnNnnnn',
    'NNNNNNNNNNNNNNNN',
  ]);
  T.space_wall = S([
    'zzzzzzzzzzzzzzzz',
    'zzzzzzzzzzzzwzzz',
    'zzyzzzzzzzzzzzzz',
    'zyyyzzzzzzzzzzzz',
    'zzyzzzzzzzzzzzzz',
    'zzzzzzzzzvzzzzzz',
    'zzzzzzzzzzzzzzzz',
    'zzzzzwzzzzzzzzzz',
    'zzzzzzzzzzzzzzzz',
    'zzzzzzzzzzzzyzzz',
    'zzzzzzzzzzzyyyzz',
    'zzwzzzzzzzzzyzzz',
    'zzzzzzzzzzzzzzzz',
    'zzzzzzzzzzzzzzzz',
    'zzzzzzzuzzzzzzzz',
    'zzzzzzzzzzzzzzzz',
  ], { pal: { z: '#2e2a66' } });
  T.space_floor = S([
    'ZZZZZZZUZZZZZZZU',
    'ZZZZZZZUZZZZZZZU',
    'ZZZZZZZUZZZZZZZU',
    'UUUUUUUUUUUUUUUU',
    'ZZZUZZZZZZZUZZZZ',
    'ZZZUZZZZZZZUZZZZ',
    'ZZZUZZZZZZZUZZZZ',
    'UUUUUUUUUUUUUUUU',
  ]);
  T.wa_wall = S([
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
    'qqqqqqqqqqqqqqq8',
  ]);
  T.wa_floor = S([
    'hhhhhhhhhhhhhhhG',
    'hghhhhhhhhhhhhhG',
    'hhhhhhhhhhhhghhG',
    'hhhhhhhhhhhhhhhG',
    'hhhhhhhghhhhhhhG',
    'hhhhhhhhhhhhhhhG',
    'hhhhhghhhhhhhhhG',
    'GGGGGGGGGGGGGGGG',
  ]);

  // ================= ROOMS =================
  const R = (id, name, o) => TM.register('room', Object.assign({ id, name }, o));
  R('yumekawa', 'ゆめかわルーム', {
    wall: T.yume_wall, floor: T.yume_floor, board: ['#ffffff', '#f6c6ff', '#b48cf0'],
    items: [
      { id: 'heartwin', x: 55, y: 44 },
      { id: 'starlamp', x: 8, y: 80 },
      { id: 'frame', x: 20, y: 30 },
      { id: 'sofa', x: 98, y: 82 },
      { id: 'rug', x: 44, y: 116, floor: true },
    ],
  });
  R('natural', 'ナチュラルルーム', {
    wall: T.nat_wall, floor: T.nat_floor, board: ['#b07a4a', '#8a5a32', '#6a4020'],
    items: [
      { id: 'window', x: 52, y: 44 },
      { id: 'clock', x: 16, y: 26 },
      { id: 'shelf', x: 4, y: 82 },
      { id: 'plant', x: 108, y: 82 },
      { id: 'rug', x: 44, y: 116, floor: true },
    ],
  });
  R('sweets', 'スイーツルーム', {
    wall: T.sweet_wall, floor: T.sweet_floor, board: ['#ffd0e0', '#ff9ec2', '#ff6fa3'],
    items: [
      { id: 'window', x: 52, y: 44 },
      { id: 'lollipop', x: 6, y: 82 },
      { id: 'lollipop', x: 112, y: 82 },
      { id: 'caketable', x: 96, y: 84 },
    ],
  });
  R('space', 'うちゅうルーム', {
    wall: T.space_wall, floor: T.space_floor, board: ['#6c48b0', '#b48cf0', '#10152e'],
    items: [
      { id: 'porthole', x: 56, y: 42 },
      { id: 'planet', x: 6, y: 82 },
      { id: 'rocket', x: 108, y: 82 },
    ],
  });
  R('wafuu', 'わふうルーム', {
    wall: T.wa_wall, floor: T.wa_floor, board: ['#8a5a32', '#6a4020', '#4a2a10'],
    items: [
      { id: 'shoji', x: 53, y: 44 },
      { id: 'chochin', x: 12, y: 30 },
      { id: 'chochin', x: 104, y: 30 },
      { id: 'kotatsu', x: 98, y: 86 },
      { id: 'mikan', x: 106, y: 76 },
    ],
  });

  // Draw a room background (furniture that is "floor:true" is drawn first).
  TM.drawRoom = function (room, sky) {
    const G = TM.gfx;
    const fy = TM.FLOOR_Y;
    G.tile(room.wall, 0, 0, TM.W, fy - 3);
    G.rect(0, fy - 3, TM.W, 1, room.board[0]);
    G.rect(0, fy - 2, TM.W, 1, room.board[1]);
    G.rect(0, fy - 1, TM.W, 1, room.board[2]);
    G.tile(room.floor, 0, fy, TM.W, TM.H - fy);
    const items = room.items.slice().sort((a, b) => (b.floor ? 1 : 0) - (a.floor ? 1 : 0));
    for (const it of items) {
      const f = TM.get('furniture', it.id);
      if (f) G.spr(f.spr, it.x, it.y - f.spr.h, { gp: sky });
    }
  };
})();
