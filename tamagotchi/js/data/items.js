/*
 * Utility sprites (effects, bath, toilet …) in TM.ITEM
 * and TOYS (おもちゃ) registered with TM.register('toy', …).
 *   toy.play: 'bounce' | 'hug' | 'float' | 'spin' | 'stack' (animation style)
 */
(function () {
  const S = (rows, o) => TM.spr(rows, o || {});
  const I = (TM.ITEM = {});

  // ---------- effects ----------
  I.heart = S(['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
  I.heartS = S(['r.r', 'rrr', '.r.']);
  I.note = S(['...kk', '..kkk', '..k..', '..k..', 'kkk..', 'kkk..']);
  I.star = S(['...y...', '...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '.yy.yy.', 'y.....y']);
  I.sparkle = [S(['.y.', 'ywy', '.y.']), S(['..y..', '..y..', 'yywyy', '..y..', '..y..']), S(['y...y', '.y.y.', '..w..', '.y.y.', 'y...y'])];
  I.zzz = [S(['kkk', '.k.', 'kkk']), S(['kkkk', '..k.', '.k..', 'kkkk'])];
  I.sweat = S(['.j', 'ju', 'uu']);
  I.anger = S(['r.r', '.r.', 'r.r']);
  I.question = S(['.kkk.', 'k...k', '...k.', '..k..', '.....', '..k..']);
  I.exclaim = S(['kk', 'kk', 'kk', '..', 'kk']);
  I.bubble = [S(['.jj.', 'j.wj', 'j..j', '.jj.']), S(['.jjj.', 'j..wj', 'j...j', 'j...j', '.jjj.']), S(['jj', 'jj'])];
  I.steam = [S(['.l.', 'l..', '.l.', '..l', '.l.']), S(['l..', '.l.', '..l', '.l.', 'l..'])];
  I.dust = S(['.m.', 'mlm', '.m.']);
  I.skull = S(['.wwwww.', 'wwwwwww', 'wkwwwkw', 'wkwwwkw', 'wwwkwww', '.wwwww.', '.wkwkw.']);
  I.thought = S(['..kkkkkkkkk..', '.kwwwwwwwwwk.', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwwk', '.kwwwwwwwwwk.', '..kkkkwkkkk..', '.....kwk.....', '......k......']);
  I.poop = [
    S(['....N....', '...NnN...', '..NnnnN..', '..NwnnnN.', '.NnnnnnN.', '.NnwnnnnN', 'NnnnnnnnN', '.NNNNNNN.']),
  ];
  I.stink = [S(['.M..', 'M...', '.M..', '..M.']), S(['..M.', '.M..', 'M...', '.M..'])];

  // ---------- bath ----------
  I.tub = S([
    '..............................',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwwwwwwwwwwwwwwlk',
    '.kjjjjjjjjjjjjjjjjjjjjjjjjjjk.',
    '.kwwwwwwwwwwwwwwwwwwwwwwwwwlk.',
    '.kwwwwwwwwwwwwwwwwwwwwwwwwwlk.',
    '.kwwwwwwwwwwwwwwwwwwwwwwwwwlk.',
    '..kwwwwwwwwwwwwwwwwwwwwwwwlk..',
    '...kllllllllllllllllllllllk...',
    '....kkkkkkkkkkkkkkkkkkkkkk....',
    '....kyk..............kyk......',
    '....kkk..............kkk......',
  ]);
  I.foam = S([
    '..ww....www...ww......www.....',
    '.wwjw..wwwwwwwjww..wwwwwww....',
    'wwwwwwwwjwwwwwwwwwwwwjwwwwww..',
  ]);
  I.duck = S(['..yyy...', '.yyyky..', '.yyyyytt', '..yyy...', 'yyyyyyy.', 'yyyyyyy.', '.yyyyy..']);
  I.shower = S([
    '......kkkk',
    '.....kmmmk',
    '....kmmk..',
    '...kmmk...',
    'kkkkkkk...',
    'kmmmmmk...',
    '.kkkkk....',
  ]);
  I.drop = S(['.u', 'uu', 'uu']);
  I.towel = S(['kkkkkkkkkk', 'kxxxxxxxxk', 'kxPxxPxxPk', 'kxxxxxxxxk', 'kxxxxxxxxk', 'kkkkkkkkkk']);

  // ---------- toilet ----------
  I.toilet = S([
    '.kkkkkkkk.......',
    '.kwwwwwwk.......',
    '.kwwmwwwk.......',
    '.kwwwwwwk.......',
    '.kkkkkkkk.......',
    '..kwwwwk........',
    'kkkkkkkkkkkkkkk.',
    'klllllllllllllk.',
    'kwwwwwwwwwwwwwk.',
    '.kwwwwwwwwwwwk..',
    '..kwwwwwwwwwk...',
    '...kwwwwwwwk....',
    '....kwwwwwk.....',
    '....kwwwwwk.....',
    '...kkkkkkkkk....',
  ]);
  // front part of the bowl, drawn over a sitting pet
  I.toiletFront = S([
    'kkkkkkkkkkkkkkk.',
    'klllllllllllllk.',
    'kwwwwwwwwwwwwwk.',
    '.kwwwwwwwwwwwk..',
    '..kwwwwwwwwwk...',
    '...kwwwwwwwk....',
    '....kwwwwwk.....',
    '....kwwwwwk.....',
    '...kkkkkkkkk....',
  ]);
  I.wave = S([
    '....jj..',
    '..jjuujj',
    '.juuuuuu',
    'juuwuuuu',
    'juuuuuuu',
    'juuuuwuu',
    'juuuuuuu',
    'juuuuuuu',
  ]);

  // ---------- medicine ----------
  I.syringe = S([
    'k...........',
    '.k..........',
    '..kkkkkkkk.k',
    '..kjjjrrrkkk',
    '..kjjjrrrkkk',
    '..kkkkkkkk.k',
  ]);
  I.pill = S(['.kkkk.', 'krrwwk', 'krrwwk', '.kkkk.']);
  I.bandage = S(['.kkkkkkkk.', 'kssnsnsssk', 'kssnsnsssk', '.kkkkkkkk.']);

  // ---------- eating furniture ----------
  I.table = S([
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'k777777777777777777777777777777k',
    'k888888888888888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    '...k8k....................k8k...',
    '...k8k....................k8k...',
    '...k8k....................k8k...',
    '...k9k....................k9k...',
    '...kkk....................kkk...',
  ]);
  I.plate = S(['kkkkkkkkkkkkkkkkkkkk', 'kwwwwwwwwwwwwwwwwwwk', '.kllllllllllllllllk.', '..kkkkkkkkkkkkkkkk..']);
  I.cup = S(['kkkkkk.', 'kwwwwkk', 'kwwwwkk', '.kkkk..']);
  I.bed = S([
    'kkkk........................',
    'k88k........................',
    'k88kkkkkkkkkkkkkkkkkkkkkkkkk',
    'k88kwwwwwkxxxxxxxxxxxxxxxxxk',
    'k88kwwwwwkxPxxxPxxxPxxxPxxxk',
    'k88kkkkkkkxxxxxxxxxxxxxxxxxk',
    'k88kxxxxxxxxxxxxxxxxxxxxxxxk',
    'k88kkkkkkkkkkkkkkkkkkkkkkkkk',
    'k88k8888888888888888888888k.',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkk.',
    'k9k.....................k9k.',
    'kkk.....................kkk.',
  ]);
  // big bed for sleeping: headboard (behind) + pillow + quilt (in front)
  I.headboard = S([
    '....kkkkkkkkkkkkkkkkkk',
    '..kk888888888888888888',
    '.k88777777777777777777',
    '.k87777777777777777777',
    'k887777777777kkk777777',
    'k87777777777kPPPk77777',
    'k8777777777kPPPPPk7777',
    'k87777777777kPPPPk7777',
    'k877777777777kPPk77777',
    'k8777777777777kk777777',
    'k877777777777777777777',
    'k888888888888888888888',
  ], { mirror: true });
  I.pillow = S([
    '...kkkkkkkkk',
    '.kkwwwwwwwww',
    'kwwwwwwwwwww',
    'kllwwwwwwwww',
    '.kkkkkkkkkkk',
  ], { mirror: true });
  I.quilt = S([
    '...kkkkkkkkkkkkkkkkkkk',
    '.kkxxxxxxxxxxxxxxxxxxx',
    'kxxxxPxxxxxxPxxxxxxPxx',
    'kxxxPPPxxxxPPPxxxxPPPx',
    'kxxxxPxxxxxxPxxxxxxPxx',
    'kxxxxxxxxxxxxxxxxxxxxx',
    'kxPxxxxxxPxxxxxxPxxxxx',
    'kPPPxxxxPPPxxxxPPPxxxx',
    'kxPxxxxxxPxxxxxxPxxxxx',
    'kkkkkkkkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwwwwwwww',
    'klllllllllllllllllllll',
    'kkkkkkkkkkkkkkkkkkkkkk',
    'k9k...................',
    'kkk...................',
  ], { mirror: true });

  // ---------- outing ----------
  I.present = S(['..r.r..', '...r...', 'kkkkkkk', 'kxxrxxk', 'kkkkkkk', 'kxxrxxk', 'kxxrxxk', 'kkkkkkk']);
  I.ring = S(['.yyy.', 'y.u.y', 'y...y', 'y...y', '.yyy.']);
  I.bell = S(['...y...', '..yyy..', '.yyyyy.', '.yywyy.', '.yyyyy.', 'yyyyyyy', '...Y...']);

  // ================= TOYS (おもちゃ) =================
  const T = (id, name, play, rows, o) =>
    TM.register('toy', Object.assign({ id, name, play, spr: S(rows, { mirror: o && o.mirror, pal: o && o.pal }) }, o || {}));

  T('ball', 'ボール', 'bounce', [
    '..kkkk..',
    '.kwrrwk.',
    'kwwrrwwk',
    'kuwrrwyk',
    'kuuwwyyk',
    'kuuwwyyk',
    '.kuwwyk.',
    '..kkkk..',
  ], { happy: 1 });

  T('kuma', 'くまのぬいぐるみ', 'hug', [
    '.kk....',
    'k7kkkkk',
    'k7k7777',
    '.k77777',
    'k77k777',
    'k777777',
    '.k77nn7',
    '..k7777',
    '.kkk777',
    'k77k777',
    'k77k777',
    '.kk7777',
    '..k77kk',
    '..kkk..',
  ], { mirror: 'odd', happy: 1 });

  T('balloon', 'ふうせん', 'float', [
    '..kkk..',
    '.kxxxk.',
    'kxwxxxk',
    'kxwxxxk',
    'kxxxxxk',
    '.kxxxk.',
    '..kPk..',
    '...k...',
    '....k..',
    '...k...',
    '..k....',
    '...k...',
  ], { happy: 1 });

  T('yoyo', 'ヨーヨー', 'spin', [
    '...k...',
    '...k...',
    '...k...',
    '.kkkkk.',
    'kuuuuuk',
    'kuwuuuk',
    'kkkkkkk',
    'kuuuuuk',
    '.kkkkk.',
  ], { happy: 1 });

  T('tsumiki', 'つみき', 'stack', [
    '....kkkk....',
    '....kyyk....',
    '....kyyk....',
    '..kkkkkkkk..',
    '..kuukkrrk..',
    '..kuukkrrk..',
    'kkkkkkkkkkkk',
    'kggggggrrrrk',
    'kggggggrrrrk',
    'kkkkkkkkkkkk',
  ], { happy: 1 });

  T('mic', 'マイク', 'sing', [
    '.kkk.',
    'kmlmk',
    'kmmmk',
    '.kkk.',
    '..k..',
    '..P..',
    '..P..',
    '..P..',
    '..k..',
  ], { happy: 2 });
})();
