/*
 * Game state, simulation, saving and shared actions.
 *
 * All times are in "game seconds". Real seconds are multiplied by
 * TM.game.s.timeScale (1 normally, bigger in debug mode).
 */
(function () {
  'use strict';
  const U = TM.util;
  const GM = (TM.game = {});
  const KEY = 'tm-meets-save-v1';

  // ---- balance (game seconds) ----
  GM.CFG = {
    stageTime: { egg: 40, baby: 30 * 60, child: 12 * 3600 }, // how long each stage lasts
    hungerEvery: { baby: 6 * 60, child: 15 * 60, adult: 22 * 60 },
    happyEvery: { baby: 8 * 60, child: 18 * 60, adult: 26 * 60 },
    poopEvery: [25 * 60, 50 * 60],
    sickAfterPoop: 20 * 60, // poop left this long -> may get sick
    sleepFrom: 21, sleepTo: 7, // real clock hours
    marryAge: 0, // adults can marry right away (debug-friendly)
  };

  GM.newPet = function (genes, o) {
    o = o || {};
    return {
      id: U.uid(),
      name: o.name || U.makeName(),
      gender: o.gender || U.pick(['m', 'f']),
      genes: genes || TM.genetics.random(),
      stage: o.stage || 'egg',
      stageT: 0, // seconds spent in current stage
      ageT: 0,
      hunger: 3, happy: 3,
      weight: 5,
      poops: [],
      sick: false,
      sleeping: false,
      hT: 0, jT: 0, pT: 20 * 60, // timers
      gen: o.gen || 1,
      parents: o.parents || null,
      discipline: 0,
      careMiss: 0,
      friends: [],
    };
  };

  GM.fresh = function () {
    const pet = GM.newPet(null, { gen: 1 });
    return {
      v: 1,
      pet,
      family: [],     // past generations
      seen: {},       // seen parts per gene: { head: { maru: 1 } }
      met: [],        // characters met (names)
      points: 100,
      room: 'yumekawa',
      lightsOff: false,
      timeScale: 1,
      debug: false,
      last: Date.now(),
      clockOffset: 0, // debug: shift clock hours
    };
  };

  GM.load = function () {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    GM.s = s && s.v === 1 ? s : GM.fresh();
    GM.markSeen(GM.s.pet.genes);
    // offline catch-up (capped at 8 hours of game time)
    const dt = Math.min(8 * 3600, Math.max(0, (Date.now() - (GM.s.last || Date.now())) / 1000));
    if (dt > 5) GM.simulate(dt, true);
  };
  GM.save = function () {
    GM.s.last = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(GM.s)); } catch (e) { /* private mode */ }
  };
  GM.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    GM.s = GM.fresh();
    GM.markSeen(GM.s.pet.genes);
  };

  GM.markSeen = function (genes) {
    const seen = GM.s.seen;
    TM.genetics.KEYS.forEach((k) => {
      seen[k] = seen[k] || {};
      seen[k][genes[k]] = (seen[k][genes[k]] || 0) + 1;
    });
  };

  // ---- clock ----
  GM.now = () => new Date(Date.now() + (GM.s ? GM.s.clockOffset : 0) * 3600000);
  GM.hour = () => GM.now().getHours() + GM.now().getMinutes() / 60;
  GM.isNight = function () {
    const h = GM.hour();
    return h >= GM.CFG.sleepFrom || h < GM.CFG.sleepTo;
  };
  GM.skyKey = function () {
    const h = GM.hour();
    if (h >= 5 && h < 9) return 'morning';
    if (h >= 9 && h < 16.5) return 'day';
    if (h >= 16.5 && h < 19) return 'evening';
    return 'night';
  };

  // ---- simulation ----
  GM.simulate = function (dt, offline) {
    const p = GM.s.pet;
    const C = GM.CFG;
    p.ageT += dt;
    // stage progress
    if (C.stageTime[p.stage] != null) {
      p.stageT += dt;
      if (p.stage !== 'egg' && p.stageT >= C.stageTime[p.stage]) GM.grow(offline);
      else if (p.stage === 'egg' && p.stageT >= C.stageTime.egg && offline) GM.grow(true);
    } else p.stageT += dt;
    if (p.stage === 'egg') return;

    // sleep follows the real clock (children & adults), babies nap never
    const night = GM.isNight() && p.stage !== 'baby';
    if (night && !p.sleeping) { p.sleeping = true; GM.emit('sleep'); }
    if (!night && p.sleeping) { p.sleeping = false; GM.s.lightsOff = false; GM.emit('wake'); }
    if (p.sleeping) return;

    const st = p.stage === 'baby' ? 'baby' : p.stage === 'child' ? 'child' : 'adult';
    const mul = p.sick ? 1.5 : 1;
    p.hT += dt * mul;
    p.jT += dt * mul;
    while (p.hT >= C.hungerEvery[st]) { p.hT -= C.hungerEvery[st]; p.hunger = Math.max(0, p.hunger - 1); }
    while (p.jT >= C.happyEvery[st]) { p.jT -= C.happyEvery[st]; p.happy = Math.max(0, p.happy - 1); }
    p.pT -= dt;
    if (p.pT <= 0) {
      p.pT = C.poopEvery[0] + Math.random() * (C.poopEvery[1] - C.poopEvery[0]);
      if (p.poops.length < 4) {
        p.poops.push({ x: 10 + U.rand(100), t: 0 });
        GM.emit('poop');
      }
    }
    for (const pp of p.poops) {
      pp.t += dt;
      if (!p.sick && pp.t > C.sickAfterPoop && U.chance(dt / 600)) { p.sick = true; GM.emit('sick'); }
    }
    if (!p.sick && p.hunger === 0 && U.chance(dt / 3600)) { p.sick = true; GM.emit('sick'); }
  };

  GM.nextStage = { egg: 'baby', baby: 'child', child: 'adult' };
  GM.grow = function (silent) {
    const p = GM.s.pet;
    const n = GM.nextStage[p.stage];
    if (!n) return false;
    p.stage = n;
    p.stageT = 0;
    if (n === 'baby') { p.hunger = 2; p.happy = 2; p.weight = 5; }
    if (n === 'adult') GM.markSeen(p.genes);
    if (!silent) GM.emit('grow', n);
    return true;
  };

  // ---- events (scenes listen) ----
  const listeners = [];
  GM.on = (fn) => listeners.push(fn);
  GM.emit = (ev, arg) => listeners.forEach((fn) => fn(ev, arg));

  // ---- actions ----
  GM.feed = function (food) {
    const p = GM.s.pet;
    p.hunger = Math.min(4, p.hunger + food.hunger);
    p.happy = Math.min(4, p.happy + food.happy);
    p.weight = Math.min(99, p.weight + food.weight);
    if (food.kind === 'meal') p.pT = Math.min(p.pT, 8 * 60 + Math.random() * 600);
  };
  GM.clean = function () { GM.s.pet.poops = []; };
  GM.bath = function () {
    const p = GM.s.pet;
    p.happy = Math.min(4, p.happy + 1);
  };
  GM.cure = function () { GM.s.pet.sick = false; };
  GM.play = function (win) {
    const p = GM.s.pet;
    p.happy = Math.min(4, p.happy + (win ? 1 : 0));
    p.weight = Math.max(1, p.weight - 1);
    if (win) GM.s.points += 20;
  };
  GM.pat = function () {
    const p = GM.s.pet;
    p.jT = Math.max(0, p.jT - 120);
    if (U.chance(0.25)) p.happy = Math.min(4, p.happy + 1);
  };

  // Marriage: returns the new generation's pet and pushes the family record.
  GM.marry = function (partner, breed) {
    const s = GM.s, p = s.pet;
    const res = breed || TM.genetics.breed(p.genes, partner.genes);
    s.family.push({
      gen: p.gen, name: p.name, gender: p.gender, genes: p.genes,
      partner: { name: partner.name, gender: partner.gender, genes: partner.genes },
      child: res.genes, src: res.src,
    });
    const child = GM.newPet(res.genes, { gen: p.gen + 1, parents: [p.name, partner.name] });
    child.inherit = res.src;
    s.pet = child;
    GM.markSeen(res.genes);
    GM.save();
    return child;
  };
})();
