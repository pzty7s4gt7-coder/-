/*
 * TM — global namespace & registries.
 *
 * Every piece of content (parts, foods, furniture, rooms, places, characters …)
 * is registered through TM.register(kind, def). To add new content, create a
 * new file in js/data/, call TM.register(...) and add a <script> tag to
 * index.html (after js/core/*). Nothing else needs to change.
 */
(function () {
  'use strict';

  const TM = (window.TM = {
    W: 128,          // logical screen width  (world pixels)
    H: 128,          // logical screen height
    DEV: !!window.TM_DEV,
    SCALE: 2,        // canvas pixels per world pixel (text is drawn at this res)
    reg: {},         // kind -> { id -> def }
    order: {},       // kind -> [id, ...] in registration order
    scenes: {},
    util: {},
  });

  TM.register = function (kind, def) {
    if (!def || !def.id) throw new Error('TM.register: def.id required (' + kind + ')');
    if (!TM.reg[kind]) { TM.reg[kind] = {}; TM.order[kind] = []; }
    if (!TM.reg[kind][def.id]) TM.order[kind].push(def.id);
    TM.reg[kind][def.id] = def;
    return def;
  };
  TM.get = (kind, id) => (TM.reg[kind] || {})[id];
  TM.list = (kind) => (TM.order[kind] || []).map((id) => TM.reg[kind][id]);
  TM.ids = (kind) => (TM.order[kind] || []).slice();

  // ---------- small utils ----------
  const U = TM.util;
  U.rand = (n) => Math.floor(Math.random() * n);
  U.pick = (arr) => arr[U.rand(arr.length)];
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.chance = (p) => Math.random() < p;
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.uid = () => Math.random().toString(36).slice(2, 10);

  // Japanese-ish pet names: <syllables>っち
  const SYL = ['ま', 'み', 'め', 'く', 'ぴ', 'ぽ', 'る', 'ら', 'ゆ', 'ね', 'に', 'ぷ', 'ち', 'も', 'さ', 'り', 'こ', 'の', 'ふ', 'わ', 'きら', 'ぱ', 'ぺ', 'しゅ', 'みゅ', 'にゃ', 'ぴよ'];
  U.makeName = function () {
    let s = U.pick(SYL);
    if (U.chance(0.7)) s += U.pick(SYL);
    return s + (U.chance(0.85) ? 'っち' : 'りん');
  };
})();
