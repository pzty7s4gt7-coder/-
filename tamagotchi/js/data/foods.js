/*
 * FOODS. kind: 'meal' (ごはん: おなか+) or 'snack' (おやつ: ごきげん+, たいじゅう+)
 * Add one:  TM.register('food', { id, name, kind, spr, hunger, happy, weight })
 * Sprites are 16 px wide (hand typed). Bites are cut with the masks below.
 */
(function () {
  const F = (id, name, kind, rows, o) => {
    o = o || {};
    return TM.register('food', {
      id, name, kind,
      spr: TM.spr(rows, { mirror: o.mirror, pal: o.pal, name: 'food:' + id }),
      hunger: o.hunger != null ? o.hunger : kind === 'meal' ? 1 : 0,
      happy: o.happy != null ? o.happy : kind === 'snack' ? 1 : 0,
      weight: o.weight != null ? o.weight : kind === 'snack' ? 2 : 1,
      steam: !!o.steam,
      drink: !!o.drink,
    });
  };

  // ======== ごはん ========
  F('onigiri', 'おにぎり', 'meal', [
    '.......k',
    '......kw',
    '.....kww',
    '....kwww',
    '...kwwww',
    '...kwlww',
    '..kwwwww',
    '..kwwwww',
    '.kwwwzzz',
    '.kwwwzzz',
    'kwwwwzzz',
    'klwwwzzz',
    '.klllzzz',
    '..kkkkkk',
  ], { mirror: true, pal: { z: '#2a3a34' } });

  F('omurice', 'オムライス', 'meal', [
    '....kkkk',
    '..kkyyyy',
    '.kyqyyyy',
    '.kyqyyry',
    'kyyyyyrr',
    'kyyyyyyr',
    'kyyyyyyy',
    'kYyyyyyy',
    '.kYYYYyy',
    '..kkkkkk',
  ], { mirror: true, steam: true, hunger: 2 });

  F('hamburg', 'ハンバーグ', 'meal', [
    '...kkkkk',
    '..kDDDDD',
    '.kDDDqDD',
    '.kDDDDDD',
    'knDDDDDD',
    'knnDDDDD',
    'knnnnnnn',
    'kNnnnnnn',
    '.kNNNNNN',
    '..kkkkkk',
  ], { mirror: true, steam: true, hunger: 2, pal: { D: '#8a3a1e' } });

  F('ramen', 'ラーメン', 'meal', [
    'kkkkkkkkkkkkkkkk',
    'kqqyyqqqqxxqqgqk',
    'kqyyyyqqxPxqgqgk',
    '.kqyyqqqqxxqqgk.',
    '.krrrrrrrrrrrrk.',
    '..krwrrwrrwrrk..',
    '..krrrrrrrrrrk..',
    '...krrrrrrrrk...',
    '....kkkkkkkk....',
    '....kRRRRRRk....',
    '.....kkkkkk.....',
  ], { steam: true, hunger: 2 });

  F('sandwich', 'サンドイッチ', 'meal', [
    '.......k',
    '......kq',
    '.....kqq',
    '....kqqq',
    '...kqqqq',
    '..kqqqqq',
    '.kqqqqqq',
    'kgGgGgGg',
    'kyyyyyyy',
    'krrrrrrr',
    'kqqqqqqq',
    '.kkkkkkk',
  ], { mirror: true });

  F('curry', 'カレー', 'meal', [
    '....kkkkkkkk....',
    '..kkllllllllkk..',
    '.klTTTTTwwwwwlk.',
    'kltTtTTtwwwwwwlk',
    'klTTtrTTTwwwwwlk',
    'kltTTqTtTTwwwwlk',
    '.klTTTTTTTTwwlk.',
    '..kkllllllllkk..',
    '....kkkkkkkk....',
  ], { steam: true, hunger: 2 });

  F('pan', 'メロンパン', 'meal', [
    '....kkkk',
    '..kkyyyy',
    '.kyyYyyY',
    '.kyYyyYy',
    'kyyyYyyY',
    'kyYyyYyy',
    'kYyyYyyY',
    'kYYyyYyy',
    '.kYYYYYY',
    '..kkkkkk',
  ], { mirror: true });

  F('sushi', 'おすし', 'meal', [
    '................',
    '..kkkkk..kkkkk..',
    '.k66666kk6r666k.',
    'k6w6666kkr66w66k',
    'kwwwwwwkkwwwwwwk',
    'kwwwwwlkkwwwwwlk',
    '.kkkkkk..kkkkkk.',
  ], { hunger: 1, happy: 1 });

  // ======== おやつ ========
  F('cake', 'ショートケーキ', 'snack', [
    '......GG',
    '.....rrr',
    '.....rRr',
    '......rr',
    '..kkkkkk',
    '.kwwxwww',
    'kwwwwwww',
    'kxxwxxwx',
    'kqqqqqqq',
    'kxxxxxxx',
    'kqqqqqqq',
    'kwwwwwww',
    '.kkkkkkk',
  ], { mirror: true, happy: 2 });

  F('donut', 'ドーナツ', 'snack', [
    '....kkkkkkkk....',
    '..kkXxxXXXXXkk..',
    '.kXXXXyXXuXXXXk.',
    'kXXuXXXXXXXXyXXk',
    'kXXXXXkkkkXXXXXk',
    'kXyXXk....kXXuXk',
    'kXXXXk....kXXXXk',
    'knXXXXkkkkXXXXnk',
    'knnXXXXXXXXXXnnk',
    '.knnnXXwXXXnnnk.',
    '..kknnnnnnnnkk..',
    '....kkkkkkkk....',
  ], { pal: { X: '#ff8fc0' } });

  F('ice', 'アイス', 'snack', [
    '.....kkk',
    '...kkxxx',
    '..kxxxxx',
    '.kxwxxxx',
    '.kxxxxxx',
    'kxxxxxxx',
    'kPxPxxPx',
    '.kknnnnn',
    '..knNnNn',
    '..knnNnn',
    '...knNnN',
    '...knnnn',
    '....knNn',
    '.....knn',
    '......kn',
    '.......k',
  ], { mirror: true });

  F('purin', 'プリン', 'snack', [
    '......rr',
    '......rw',
    '....kkkk',
    '...kCCCC',
    '..kCCCCC',
    '..kyCyyC',
    '.kyyyyyy',
    '.kyqyyyy',
    'kyyyyyyy',
    'kYyyyyyy',
    'kkkkkkkk',
    'kwwwwwww',
    '.kkkkkkk',
  ], { mirror: true, pal: { C: '#9a5a1e' } });

  F('macaron', 'マカロン', 'snack', [
    '...kkkkk',
    '.kkxxxxx',
    'kxxwwxxx',
    'kxxxxxxx',
    'kPxPxPxP',
    'kwwwwwww',
    'kPxPxPxP',
    'kxxxxxxx',
    '.kkxxxxx',
    '...kkkkk',
  ], { mirror: true });

  F('candy', 'キャンディ', 'snack', [
    'kk...kkkkkk...kk',
    'kxk.kyyyyyyk.kxk',
    'kxxkyyrryyyykxxk',
    'kxxkyrryyyrrkxxk',
    'kxxkyyyyrrrykxxk',
    'kxk.kyyyyyyk.kxk',
    'kk...kkkkkk...kk',
  ], { weight: 1 });

  F('cookie', 'クッキー', 'snack', [
    '....kkkkkkkk....',
    '..kkCCCCCCCCkk..',
    '.kCCNCCCCCCCCCk.',
    '.kCCCCCCCNNCCCk.',
    'kCCCCCCCCNCCCCDk',
    'kCNNCCCCCCCCCCDk',
    'kCCNCCCCNCCCCCDk',
    'kCCCCCCCNNCCCDDk',
    '.kDCCCCCCCCCDDk.',
    '.kDDDCCCCDDDDDk.',
    '..kkDDDDDDDDkk..',
    '....kkkkkkkk....',
  ], { pal: { C: '#eab878', D: '#c8884a' }, weight: 1 });

  F('parfait', 'パフェ', 'snack', [
    '.......G',
    '......rr',
    '....wwrr',
    '...wwwww',
    '..kwwwww',
    '.kNNNNNN',
    '.kyyyyyy',
    '..kxxxxx',
    '..kwwwww',
    '...kNNNN',
    '....kjjj',
    '.....kjj',
    '......kj',
    '......kj',
    '....kkjj',
    '...kkkkk',
  ], { mirror: true, happy: 2, weight: 3 });

  F('milk', 'いちごミルク', 'snack', [
    '..........kk....',
    '.........kPk....',
    '........kPk.....',
    '...kkkkkkPkkk...',
    '...kjjjjkjjjk...',
    '...kxxxxxxxxk...',
    '...kxwxxxxxxk...',
    '...kxwxxxxxxk...',
    '....kxxxxxxk....',
    '....kxxxxxxk....',
    '....kxxxxxxk....',
    '.....kkkkkk.....',
  ], { drink: true, weight: 1 });

  // ---- bite masks ('#' = eaten), aligned to the RIGHT edge of the food ----
  TM.BITE = [
    TM.spr([
      '...#####',
      '..######',
      '..######',
      '...#####',
      '....####',
      '...#####',
      '..######',
      '..######',
      '...#####',
      '....####',
      '...#####',
      '..######',
      '..######',
      '...#####',
      '....####',
      '...#####',
    ]),
    TM.spr([
      '........#####',
      '.......######',
      '......#######',
      '......#######',
      '.......######',
      '......#######',
      '.....########',
      '......#######',
      '.......######',
      '......#######',
      '.....########',
      '......#######',
      '.......######',
      '......#######',
      '.....########',
      '......#######',
    ].map((r) => '###' + r)),
  ];
  TM.CRUMBS = TM.spr([
    '..n.....',
    '.....n..',
    'n..n...n',
  ]);
})();
