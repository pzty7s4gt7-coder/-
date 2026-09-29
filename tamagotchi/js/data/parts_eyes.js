/*
 * EYES parts (inherited). Type the LEFT eye; the right eye is its mirror.
 *   open    : normal eye (required)
 *   closed  : blink / sleep  (optional, a default by width is used)
 *   happy   : ^ ^ smile eyes (optional)
 *   pal     : local colours (i = iris colour etc.)
 *   gapAdd  : extra spacing between the eyes for this eye type
 */
(function () {
  const E = (id, name, open, o) => {
    o = o || {};
    const pal = o.pal || null;
    const d = { id, name, open: TM.spr(open, { pal, name: 'eye:' + id }) };
    if (o.closed) d.closed = TM.spr(o.closed, { pal });
    if (o.happy) d.happy = TM.spr(o.happy, { pal });
    d.gapAdd = o.gapAdd || 0;
    return TM.register('eyes', d);
  };

  E('tsubura', 'つぶら', [
    'kk',
    'kk',
    'kk',
  ], { gapAdd: 2 });

  E('pacchiri', 'ぱっちり', [
    '.kkk.',
    'kwwkk',
    'kwkkk',
    'kkkik',
    'kkiik',
    '.kkk.',
  ], { pal: { i: '#6a5ad8' } });

  E('kirakira', 'キラキラ', [
    'k.....',
    '.kkkk.',
    'kwwkkk',
    'kwkkkk',
    'kkkiik',
    'kkiiik',
    '.kkkk.',
  ], { pal: { i: '#ff6fa3' }, gapAdd: -2 });

  E('tare', 'たれめ', [
    '...kk',
    '.kkwk',
    'kkwkk',
    'kkkik',
    '.kkk.',
  ], { pal: { i: '#4aa0e0' }, happy: ['.kkk.', 'k...k'] });

  E('tsuri', 'つりめ', [
    'kk...',
    '.kkk.',
    '.kwkk',
    '.kkkk',
    '..kk.',
  ], { happy: ['.kkk.', 'k...k'] });

  E('hoshi', 'ほしのめ', [
    '.kkk.',
    'kkykk',
    'kyyyk',
    'kkykk',
    '.kkk.',
  ]);

  E('nikoniko', 'にこにこ', [
    '.kk.',
    'k..k',
  ], { closed: ['.kk.', 'k..k'], happy: ['.kk.', 'k..k'] });

  E('manmaru', 'まんまる', [
    '.kkk.',
    'kwwwk',
    'kwwkk',
    'kwwkk',
    '.kkk.',
  ]);

  E('nemu', 'ねむいめ', [
    'kkkk',
    'kwkk',
    '.kk.',
  ]);

  E('heart', 'ハートのめ', [
    '.r.r.',
    'rrrrr',
    'rwrrr',
    '.rrr.',
    '..r..',
  ]);

  E('glasses', 'めがね', [
    '.MMMM.',
    'M....M',
    'M.kk.M',
    'M.kk.M',
    'M....M',
    '.MMMMM',
  ], { closed: ['.MMMM.', 'M....M', 'M....M', 'MkkkkM', 'M....M', '.MMMMM'], happy: ['.MMMM.', 'M....M', 'M.kk.M', 'Mk..kM', 'M....M', '.MMMMM'], gapAdd: -2 });

  E('guruguru', 'ぐるぐる', [
    'kkkkk',
    'k...k',
    'k.k.k',
    'k.kkk',
    'k....',
    'kkkkk',
  ]);

  // ---------- defaults for expressions (by eye width) ----------
  TM.EYE_CLOSED = {
    2: TM.spr(['kk']),
    3: TM.spr(['k.k', '.k.']),
    4: TM.spr(['k..k', '.kk.']),
    5: TM.spr(['k...k', '.kkk.']),
    6: TM.spr(['k....k', '.kkkk.']),
  };
  TM.EYE_HAPPY = {
    2: TM.spr(['kk', 'k.']),
    3: TM.spr(['.k.', 'k.k']),
    4: TM.spr(['.kk.', 'k..k']),
    5: TM.spr(['.kkk.', 'k...k']),
    6: TM.spr(['.kkkk.', 'k....k']),
  };
  // swirly "sick" eyes and angry eyes (shared)
  TM.EYE_SICK = TM.spr(['.kkk.', 'k...k', 'k.k.k', 'k..kk', '.kk..']);
  TM.EYE_CRY = TM.spr(['.....', 'kkkkk', '.....', '.u...', '.u...', 'uu...']);

  // ---------- mouths (centred on the head) ----------
  TM.MOUTH = {
    smile: TM.spr(['k..k', '.kk.']),
    open: TM.spr(['.kk.', 'krrk', '.kk.']),
    big: TM.spr(['kkkkkk', 'krrrrk', '.krrk.']),
    chew: TM.spr(['kkkk']),
    line: TM.spr(['kkkk']),
    frown: TM.spr(['.kk.', 'k..k']),
    o: TM.spr(['.kk.', 'k..k', '.kk.']),
    cat: TM.spr(['k.kk.k', '.k..k.']),
  };
  // beak variants (for heads with beak:true)
  const bp = { B: '#ffae3a', D: '#c8641e' };
  TM.BEAK = {
    smile: TM.spr(['.DD.', 'DBBD', '.DD.'], { pal: bp }),
    open: TM.spr(['DDDD', 'DkkD', 'DBBD', '.DD.'], { pal: bp }),
    chew: TM.spr(['.DD.', 'DBBD', '.DD.'], { pal: bp }),
  };
  TM.CHEEK = TM.spr(['ppp']);
})();
