/*
 * Genetics. 5 genes: color, eyes, head, body, back.
 * Each gene of the child is taken from father OR mother (50/50),
 * with a small chance of a mutation (random registered part).
 */
(function () {
  'use strict';
  const U = TM.util;
  const GN = (TM.genetics = {});
  GN.KEYS = TM.look.GENE_KEYS;
  GN.MUTATION = 0.04;

  GN.random = function () {
    const g = {};
    GN.KEYS.forEach((k) => (g[k] = U.pick(TM.ids(k))));
    return g;
  };

  // returns { genes, src: { key: 'a' | 'b' | 'm' } }
  GN.breed = function (a, b, mutation) {
    const m = mutation == null ? GN.MUTATION : mutation;
    const genes = {}, src = {};
    GN.KEYS.forEach((k) => {
      if (U.chance(m)) {
        genes[k] = U.pick(TM.ids(k));
        src[k] = 'm';
      } else if (U.chance(0.5)) {
        genes[k] = a[k]; src[k] = 'a';
      } else {
        genes[k] = b[k]; src[k] = 'b';
      }
    });
    return { genes, src };
  };

  GN.partName = (k, id) => {
    const d = TM.get(k, id);
    return d ? d.name : id;
  };
  GN.describe = (g) => GN.KEYS.map((k) => TM.look.GENE_NAMES[k] + ':' + GN.partName(k, g[k])).join(' ');

  // a random stranger to meet on an outing: sometimes a named character
  GN.stranger = function (gender) {
    if (U.chance(0.55)) {
      const pool = TM.list('character').filter((c) => !gender || c.gender === gender);
      if (pool.length) {
        const c = U.pick(pool);
        return { name: c.name, gender: c.gender, genes: Object.assign({}, c.genes), line: c.line, preset: c.id };
      }
    }
    return { name: U.makeName(), gender: gender || U.pick(['m', 'f']), genes: GN.random(), line: U.pick(['はじめまして！', 'いいてんきだね', 'なかよくしてね♪', 'あそぼー！', 'こんにちは〜']) };
  };
})();
