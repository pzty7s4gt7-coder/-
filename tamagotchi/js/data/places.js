/*
 * OUTING PLACES (おでかけ先) and named CHARACTERS you can meet there.
 *
 * TM.register('place', { id, name, ground, draw(G, t) })
 * TM.register('character', { id, name, gender, genes:{color,eyes,head,body,back}, line })
 */
(function () {
  const S = (rows, o) => TM.spr(rows, o || {});
  const P = (TM.PLACE_SPR = {});

  P.cloud = S([
    '....wwww.......',
    '..wwwwwwww.ww..',
    '.wwwwwwwwwwwwww',
    'wwwwwwwwwwwwwww',
    '.2222222222222.',
  ]);
  P.tree = S([
    '.....GGGGGG.....',
    '...GGggggggGG...',
    '..GggghgggggGG..',
    '.GgghhgggggrgG..',
    '.GgggggggggggGG.',
    'GggggggggghggggG',
    'GgrggggggggggggG',
    'GggggggggggrgggG',
    '.GgggghggggggGG.',
    '..GGgggggggGGG..',
    '....GGGnnGGG....',
    '.......nn.......',
    '.......nN.......',
    '.......nN.......',
    '......nnNN......',
  ]);
  P.bench = S([
    'kkkkkkkkkkkkkkkkkkkk',
    'k888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkk',
    'k888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkk',
    '.kMk............kMk.',
    '.kMk............kMk.',
  ]);
  P.flower = [
    S(['.P.', 'PyP', '.P.', '.g.', 'gg.']),
    S(['.w.', 'wyw', '.w.', '.g.', '.gg']),
    S(['.u.', 'uyu', '.u.', '.g.', 'gg.']),
    S(['.y.', 'yty', '.y.', '.g.', '.gg']),
  ];
  P.fountain = S([
    '.......jj.......',
    '......j..j......',
    '.....j.jj.j.....',
    '....j..kk..j....',
    '.......kk.......',
    '....kkkkkkkk....',
    '...kjjjjjjjjk...',
    '....kkkkkkkk....',
    '.......kk.......',
    '.kkkkkkkkkkkkkk.',
    'kjjjjjjjjjjjjjjk',
    'kjjwjjjjjjjjwjjk',
    'kmmmmmmmmmmmmmmk',
    'kllllllllllllllk',
    'kkkkkkkkkkkkkkkk',
  ]);
  P.parasol = S([
    '.......kk.......',
    '....kkkrrkkk....',
    '..kkrrwwrrwwkk..',
    '.krrwwrrwwrrwwk.',
    'kkkkkkkkkkkkkkkk',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
    '.......kk.......',
  ]);
  P.shell = S(['..x..', '.xPx.', 'xPxPx', 'xxxxx']);
  P.counter = S([
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'k77777777777777777777777777777777777777k',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'k88888888888888888888888888888888888888k',
    'k88kkkkkkkk88kkkkkkkk88kkkkkkkk88kkkk88k',
    'k88k999999k88k999999k88k999999k88k99k88k',
    'k88k999999k88k999999k88k999999k88k99k88k',
    'k88kkkkkkkk88kkkkkkkk88kkkkkkkk88kkkk88k',
    'k88888888888888888888888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ]);
  P.cafeWin = S([
    'kkkkkkkkkkkkkkkkkkkk',
    'k888888888888888888k',
    'k8AAAAAAAAAAAAAAAA8k',
    'k8AACCAAAAAAAAAAAA8k',
    'k8ACCCCAAAAAAACCAA8k',
    'k8AAAAAAAAAAAAAAAA8k',
    'k8AAAAAAAAAAAAAAAA8k',
    'k888888888888888888k',
    'kkkkkkkkkkkkkkkkkkkk',
  ]);
  P.awning = S([
    'rrrrwwwwrrrrwwwwrrrr',
    'rrrrwwwwrrrrwwwwrrrr',
    '.rr..ww..rr..ww..rr.',
  ]);
  P.cupcake = S(['..rr..', '.xxxx.', 'xxwxxx', 'kkkkkk', 'k7k7k7', '.k7k7.']);
  P.chapel = S([
    '..........y...........',
    '.........yyy..........',
    '..........y...........',
    '.........kkk..........',
    '........kwwwk.........',
    '.......kwwwwwk........',
    '......kwwwwwwwk.......',
    '.....kwwwwwwwwwk......',
    '....kkkkkkkkkkkkk.....',
    '....kwwwwwwwwwwwk.....',
    '....kwwwkkkkkwwwk.....',
    '....kwwkxxxxxkwwk.....',
    '....kwwkxxPxxkwwk.....',
    '....kwwkxxxxxkwwk.....',
    '....kwwkxxxxxkwwk.....',
    '....kkkkkkkkkkkkk.....',
  ]);

  const G_ = () => TM.gfx;
  const sky = (G, top, bottom) => {
    G.rect(0, 0, TM.W, 30, top);
    G.rect(0, 30, TM.W, 30, bottom);
  };

  TM.register('place', {
    id: 'park', name: 'こうえん', ground: 110,
    draw(G, t) {
      sky(G, '#8fd3ff', '#bfe6ff');
      G.spr(P.cloud, 8 + ((t / 400) % 150) - 20, 10);
      G.spr(P.cloud, 80 - ((t / 600) % 150) + 40, 22);
      G.rect(0, 60, TM.W, 68, '#9ce7a0');
      G.rect(0, 60, TM.W, 2, '#7ed56f');
      G.spr(P.tree, 2, 46);
      G.spr(P.tree, 104, 44);
      G.spr(P.fountain, 56, 50);
      for (let i = 0; i < 10; i++) G.spr(P.flower[i % 4], 4 + i * 13, 118 + (i % 2) * 3);
      G.spr(P.bench, 20, 92);
    },
  });

  TM.register('place', {
    id: 'cafe', name: 'カフェ', ground: 112,
    draw(G, t) {
      G.rect(0, 0, TM.W, 80, '#ffe8d0');
      for (let x = 0; x < TM.W; x += 8) G.rect(x, 0, 4, 80, '#fff3e6');
      G.spr(P.cafeWin, 54, 16, { gp: TM.SKY.day });
      G.spr(P.awning, 54, 12);
      G.rect(0, 80, TM.W, 48, '#b07a4a');
      for (let y = 80; y < 128; y += 6) G.rect(0, y, TM.W, 1, '#8a5a32');
      G.spr(P.counter, 4, 62);
      G.spr(P.cupcake, 8, 56);
      G.spr(P.cupcake, 22, 56);
      G.spr(P.cupcake, 36, 56);
    },
  });

  TM.register('place', {
    id: 'beach', name: 'うみ', ground: 112,
    draw(G, t) {
      sky(G, '#6cc6ff', '#a8e0ff');
      G.spr(P.cloud, 20, 8);
      G.rect(0, 44, TM.W, 30, '#3a9ce8');
      const w = Math.floor(t / 300) % 2;
      for (let x = 0; x < TM.W; x += 12) G.rect(x + w * 6, 52 + ((x / 12) % 2) * 8, 5, 1, '#bfe6ff');
      G.rect(0, 74, TM.W, 54, '#ffe8a8');
      G.rect(0, 74, TM.W, 2, '#ffffff');
      G.spr(P.parasol, 96, 72);
      G.spr(P.shell, 20, 118);
      G.spr(P.shell, 70, 122);
    },
  });

  TM.register('place', {
    id: 'garden', name: 'おはなばたけ', ground: 110,
    draw(G, t) {
      sky(G, '#ffd6ec', '#fff0f8');
      G.spr(P.cloud, 60, 12);
      G.rect(0, 56, TM.W, 72, '#b6e67a');
      for (let y = 0; y < 5; y++)
        for (let x = 0; x < 11; x++) G.spr(P.flower[(x + y) % 4], x * 12 + (y % 2) * 6, 58 + y * 14);
    },
  });

  // backgrounds for special scenes
  TM.drawChapel = function (G, t) {
    G.rect(0, 0, TM.W, TM.H, '#fff0f8');
    for (let x = 0; x < TM.W; x += 16) G.rect(x, 0, 8, 70, '#ffe3ef');
    G.sprS(P.chapel, 42, 38, 2);
    G.rect(0, 70, TM.W, 58, '#ffffff');
    G.rect(52, 70, 24, 58, '#ff9ec2');
    for (let i = 0; i < 8; i++) {
      const px = (i * 37 + t / 20) % 128, py = (i * 23 + t / 15) % 128;
      G.spr(TM.ITEM.heartS, px, py);
    }
  };
  TM.drawRoad = function (G, t, dir) {
    G.rect(0, 0, TM.W, 70, '#8fd3ff');
    const o = Math.floor(t / 40) * (dir || 1);
    G.spr(P.cloud, ((20 - o / 4) % 160 + 160) % 160 - 20, 10);
    G.rect(0, 70, TM.W, 58, '#9ce7a0');
    G.rect(0, 96, TM.W, 20, '#e8d0a8');
    for (let i = 0; i < 4; i++) G.spr(P.tree, (((i * 44 - o) % 176) + 176) % 176 - 24, 57);
    for (let i = 0; i < 8; i++) G.spr(P.flower[i % 4], (((i * 20 - o * 1.5) % 160) + 160) % 160 - 10, 120);
  };

  // ================= CHARACTERS =================
  const CH = (id, name, gender, genes, line) => TM.register('character', { id, name, gender, genes, line });
  CH('kururin', 'くるりんっち', 'f', { color: 'cream', eyes: 'kirakira', head: 'kurukuru', body: 'dress', back: 'none' }, 'ふわふわ〜♪');
  CH('hatappi', 'はたっぴ', 'm', { color: 'orange', eyes: 'pacchiri', head: 'boushi', body: 'futsuu', back: 'buta' }, 'きょうもげんき！');
  CH('usamimi', 'うさみみっち', 'f', { color: 'pink', eyes: 'tare', head: 'usagi', body: 'ribbon', back: 'usagi' }, 'ぴょんぴょん！');
  CH('nekomaru', 'ねこまるっち', 'm', { color: 'gray', eyes: 'tsuri', head: 'neko', body: 'necktie', back: 'neko' }, 'にゃーん');
  CH('tenshi', 'てんしっち', 'f', { color: 'snow', eyes: 'kirakira', head: 'tenshi', body: 'dress', back: 'tenshi' }, 'しあわせをどうぞ');
  CH('akumacchi', 'あくまっち', 'm', { color: 'grape', eyes: 'tsuri', head: 'tsuno', body: 'futsuu', back: 'akuma' }, 'いたずらしちゃうぞ');
  CH('sushicchi', 'すしっち', 'm', { color: 'leaf', eyes: 'tsubura', head: 'sushi', body: 'kimono', back: 'none' }, 'へいらっしゃい！');
  CH('happacchi', 'はっぱっち', 'f', { color: 'mint', eyes: 'nikoniko', head: 'happa', body: 'overall', back: 'chou' }, 'おひさまだいすき');
  CH('kumakko', 'くまっこ', 'm', { color: 'choco', eyes: 'manmaru', head: 'kuma', body: 'pocchari', back: 'none' }, 'はちみつたべたい');
  CH('hakase', 'はかせっち', 'm', { color: 'sky', eyes: 'glasses', head: 'maru', body: 'robo', back: 'none' }, 'けんきゅうちゅう…');
  CH('piyoko', 'ぴよこっち', 'f', { color: 'lemon', eyes: 'tsubura', head: 'hiyoko', body: 'muffler', back: 'tenshi' }, 'ぴよぴよ');
  CH('dango', 'おだんごっち', 'f', { color: 'berry', eyes: 'heart', head: 'odango', body: 'kimono', back: 'mant' }, 'だんごがすき！');
  CH('ryuu', 'りゅうっち', 'm', { color: 'navy', eyes: 'hoshi', head: 'tsuno', body: 'muffler', back: 'ryu' }, 'ガオー！');
  CH('ribbon', 'りぼんっち', 'f', { color: 'lavender', eyes: 'pacchiri', head: 'ribbon', body: 'dress', back: 'kitsune' }, 'かわいいでしょ？');
})();
