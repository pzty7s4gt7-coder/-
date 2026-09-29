/*
 * CARE scenes: status, food → eat, toilet, bath, medicine, toy, game.
 */
(function () {
  'use strict';
  const U = TM.util;
  const GM = TM.game;
  const A = TM.actor;
  const GROUND = 108;
  const back = (msg) => TM.sc.go('home', { msg, keepActor: true });

  const HEART_F = TM.spr(['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
  const HEART_E = TM.spr(['.kk.kk.', 'k..k..k', 'k.....k', '.k...k.', '..k.k..', '...k...']);
  const GENDER = {
    m: TM.spr(['..kkk', '...kk', '.kk.k', 'k..k.', 'k..k.', '.kk..'], { pal: { k: '#2f6fc0' } }),
    f: TM.spr(['.kk.', 'k..k', 'k..k', '.kk.', '.k..', 'kkk.', '.k..'], { pal: { k: '#ff4d8a' } }),
  };
  TM.GENDER_SPR = GENDER;

  function title(G, str, color) {
    const w = G.textW(str) + 12;
    G.box(64 - w / 2, 3, w, 14, { bg: color || '#ffe3ef', border: '#ff6fa3' });
    G.text(str, 64, 6, { color: '#8e2f5c', align: 'center' });
  }
  TM.drawTitle = title;
  function hearts(G, x, y, n) {
    for (let i = 0; i < 4; i++) G.spr(i < n ? HEART_F : HEART_E, x + i * 9, y);
  }

  // =============== STATUS ===============
  TM.scenes.status = {
    enter() { this.page = 0; },
    pages: 4,
    draw(G, t) {
      const p = GM.s.pet;
      G.clear('#fff6fb');
      for (let y = 0; y < TM.H; y += 8) G.rect(0, y, TM.W, 1, '#ffeaf4');
      const pageDots = () => { for (let i = 0; i < this.pages; i++) G.rect(52 + i * 7, 122, 4, 3, i === this.page ? '#ff6fa3' : '#ffd0e0'); };
      if (this.page === 0) {
        title(G, 'プロフィール');
        TM.drawPet(p, 30, 76, { expr: A.face({ eyes: 'open', mouth: 'smile' }), frame: Math.floor(t / 500) % 2 });
        G.text(p.name, 54, 28, { color: '#4a2f60' });
        if (p.stage !== 'egg') G.spr(GENDER[p.gender], 54 + G.textW(p.name) + 3, 29);
        G.text(TM.STAGE_NAME[p.stage], 54, 42, { color: '#6b4a8a' });
        G.text('だい' + p.gen + 'せだい', 54, 54, { color: '#6b4a8a' });
        G.text('ねんれい', 8, 86, { color: '#6b4a8a' });
        G.num(Math.floor(p.ageT / 86400) + '', 60, 88, '#4a2f60');
        G.text('さい', 72, 86, { color: '#6b4a8a' });
        G.text('たいじゅう', 8, 100, { color: '#6b4a8a' });
        G.num(p.weight + 'g', 60, 102, '#4a2f60');
      } else if (this.page === 1) {
        title(G, 'きもち');
        G.text('おなか', 12, 30, { color: '#6b4a8a' });
        hearts(G, 60, 31, p.hunger);
        G.text('ごきげん', 12, 50, { color: '#6b4a8a' });
        hearts(G, 60, 51, p.happy);
        G.text('からだ', 12, 70, { color: '#6b4a8a' });
        G.text(p.sick ? 'びょうき…' : 'げんき！', 60, 70, { color: p.sick ? '#b8283a' : '#3f9a4a' });
        G.text('うんち', 12, 90, { color: '#6b4a8a' });
        G.num(p.poops.length + '', 62, 92, '#4a2f60');
      } else if (this.page === 2) {
        title(G, 'いでんし');
        const src = p.inherit || {};
        const mark = { a: 'ちち', b: 'はは', m: 'へんい' };
        TM.genetics.KEYS.forEach((k, i) => {
          const y = 24 + i * 18;
          G.box(4, y - 2, 120, 16, { bg: '#ffffff', border: '#ffc4d8' });
          G.text(TM.look.GENE_NAMES[k], 8, y + 2, { color: '#ff6fa3' });
          G.text(TM.genetics.partName(k, p.genes[k]), 40, y + 2, { color: '#4a2f60' });
          if (src[k]) G.text(mark[src[k]], 122, y + 2, { color: src[k] === 'm' ? '#6c48b0' : '#8a8aa2', align: 'right' });
        });
      } else {
        title(G, 'かぞく');
        G.text(p.parents ? 'パパとママ' : 'はじめての たまごっち', 64, 26, { color: '#6b4a8a', align: 'center' });
        const last = GM.s.family[GM.s.family.length - 1];
        if (last && p.parents) {
          TM.drawPet({ genes: last.genes, stage: 'adult' }, 36, 84);
          TM.drawPet({ genes: last.partner.genes, stage: 'adult' }, 92, 84, { flip: true });
          G.spr(HEART_F, 61, 60);
          G.text(last.name, 36, 88, { color: '#4a2f60', align: 'center' });
          G.text(last.partner.name, 92, 88, { color: '#4a2f60', align: 'center' });
        } else {
          TM.drawPet(p, 64, 90);
        }
        G.text('せだい: ' + p.gen, 64, 104, { color: '#6b4a8a', align: 'center' });
      }
      pageDots();
    },
    btn(b) {
      if (b === 'C') { TM.sfx('cancel'); return back(); }
      TM.sfx('beep');
      this.page = (this.page + (b === 'A' || b === 'B' ? 1 : 0)) % this.pages;
    },
    tap(x) { TM.sfx('beep'); this.page = (this.page + (x < 40 ? this.pages - 1 : 1)) % this.pages; },
  };

  // =============== FOOD SELECT ===============
  TM.scenes.food = {
    enter() { this.tab = null; this.i = 0; },
    items() { return TM.list('food').filter((f) => f.kind === this.tab); },
    draw(G, t) {
      TM.drawHomeBG(G);
      G.alpha(0.85); G.rect(0, 0, TM.W, TM.H, '#fff6fb'); G.alpha(1);
      if (!this.tab) {
        title(G, 'なにを たべる？');
        ['meal', 'snack'].forEach((k, i) => {
          const x = 10 + i * 58;
          const sel = this.sel === i;
          G.box(x, 34, 50, 60, sel ? { bg: '#ffe38a', border: '#ff9a3c' } : { bg: '#ffffff', border: '#ffc4d8' });
          const f = TM.get('food', k === 'meal' ? 'omurice' : 'cake');
          G.sprS(f.spr, x + 9, 44 + (sel && Math.floor(t / 300) % 2 ? -1 : 0), 2);
          G.text(k === 'meal' ? 'ごはん' : 'おやつ', x + 25, 80, { color: '#4a2f60', align: 'center' });
        });
        G.msg('A:えらぶ B:けってい C:もどる', { y: 106 });
        return;
      }
      const list = this.items();
      const f = list[this.i];
      title(G, this.tab === 'meal' ? 'ごはん' : 'おやつ');
      G.box(32, 26, 64, 58, { bg: '#ffffff', border: '#ffc4d8' });
      G.sprS(f.spr, 64 - f.spr.w, 55 - f.spr.h + (Math.floor(t / 400) % 2), 2);
      G.spr(TM.ARROW_L, 20, 52);
      G.spr(TM.ARROW_R, 105, 52);
      G.text(f.name, 64, 90, { color: '#4a2f60', align: 'center' });
      G.num((this.i + 1) + '/' + list.length, 64 - G.numW((this.i + 1) + '/' + list.length) / 2, 104, '#8a8aa2');
      const tag = (f.hunger ? 'おなか+' + f.hunger + ' ' : '') + (f.happy ? 'ごきげん+' + f.happy : '');
      G.text(tag, 64, 112, { color: '#ff6fa3', align: 'center' });
    },
    sel: 0,
    choose() {
      TM.sfx('ok');
      TM.sc.go('eat', { food: this.items()[this.i] });
    },
    btn(b) {
      if (!this.tab) {
        if (b === 'A') { this.sel ^= 1; TM.sfx('beep'); }
        if (b === 'B') { this.tab = this.sel ? 'snack' : 'meal'; this.i = 0; TM.sfx('ok'); }
        if (b === 'C') { TM.sfx('cancel'); back(); }
        return;
      }
      const n = this.items().length;
      if (b === 'A') { this.i = (this.i + 1) % n; TM.sfx('beep'); }
      if (b === 'B') this.choose();
      if (b === 'C') { this.tab = null; TM.sfx('cancel'); }
    },
    tap(x, y) {
      if (!this.tab) {
        if (y > 30 && y < 96) {
          const i = x < 64 ? 0 : 1;
          if (this.sel === i) this.btn('B'); else { this.sel = i; TM.sfx('beep'); }
        } else if (y > 104) this.btn('C');
        return;
      }
      const n = this.items().length;
      if (x < 32) { this.i = (this.i - 1 + n) % n; TM.sfx('beep'); }
      else if (x > 96) { this.i = (this.i + 1) % n; TM.sfx('beep'); }
      else if (y > 24 && y < 86) this.choose();
      else if (y < 20) this.btn('C');
    },
  };

  // =============== EAT ===============
  TM.scenes.eat = {
    enter(a) {
      this.food = a.food; this.t = 0; this.bites = 0; this.done = false;
      const p = GM.s.pet;
      this.refuse = this.food.kind === 'meal' && p.hunger >= 4;
    },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      const t = this.t;
      if (this.refuse) {
        if (t > 2.4) back('おなか いっぱい！');
        return;
      }
      // bites at 0.9, 2.0, 3.1 s
      const next = 0.9 + this.bites * 1.1;
      if (this.bites < 3 && t >= next) {
        this.bites++;
        TM.sfx('eat');
      }
      if (this.bites >= 3 && !this.done && t > 4.0) {
        this.done = true;
        GM.feed(this.food);
        TM.sfx('happy');
        TM.fx.hearts(50, 70, 3);
      }
      if (t > 5.6) back(this.food.kind === 'meal' ? 'おいしかった！' : 'しあわせ〜♪');
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      const px = 46;
      const table = TM.ITEM.table;
      // pet
      let expr = { eyes: 'open', mouth: 'smile' };
      let flip = false;
      if (this.refuse) {
        flip = Math.floor(this.t * 4) % 2 === 1;
        expr = { eyes: 'closed', mouth: 'frown' };
      } else if (this.done) expr = { eyes: 'happy', mouth: 'open' };
      else if (this.bites > 0 || this.t > 0.6) {
        const since = this.t - (0.9 + (this.bites - 1) * 1.1);
        if (this.t > 0.6 && this.t < 0.9) expr = { eyes: 'open', mouth: 'open' };
        else if (since < 0.8) expr = { eyes: 'closed', mouth: Math.floor(since * 8) % 2 ? 'chew' : 'smile' };
        else expr = { eyes: 'open', mouth: this.bites < 3 ? 'open' : 'smile' };
      }
      TM.drawShadow(px, GROUND, 18);
      TM.drawPet(p, px, GROUND, { expr: A.face(expr), frame: A.frame, flip });
      // table + plate + food in front
      G.spr(table, 64 - table.w / 2 + 16, GROUND - table.h + 4);
      const ty = GROUND - table.h + 4;
      const food = this.food;
      if (!food.drink) G.spr(TM.ITEM.plate, 70, ty - 4);
      let spr = food.spr;
      if (this.bites === 1) spr = food._b1 || (food._b1 = TM.sprMask(food.spr, TM.BITE[0], true));
      if (this.bites === 2) spr = food._b2 || (food._b2 = TM.sprMask(food.spr, TM.BITE[1], true));
      if (this.bites < 3) {
        const fx = 80 - Math.floor(food.spr.w / 2);
        G.spr(spr, fx, ty - 2 - food.spr.h);
        if (food.steam) G.spr(TM.ITEM.steam[Math.floor(t / 300) % 2], fx + 6, ty - food.spr.h - 9);
      } else if (!food.drink) G.spr(TM.CRUMBS, 76, ty - 5);
      TM.fx.draw(G);
    },
    btn() {}, tap() {},
  };

  // =============== TOILET ===============
  TM.scenes.toilet = {
    enter() {
      this.t = 0;
      this.mode = GM.s.pet.poops.length ? 'clean' : 'potty';
      this.poops = GM.s.pet.poops.map((p) => Object.assign({}, p));
      this.flushed = false;
    },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.mode === 'clean') {
        const waveX = 140 - this.t * 90;
        this.poops = this.poops.filter((pp) => pp.x < waveX);
        if (this.t > 0.05 && !this.snd) { this.snd = 1; TM.sfx('flush'); }
        if (this.t > 1.9 && !this.flushed) { this.flushed = true; GM.clean(); TM.fx.sparkle(64, 100, 6); TM.sfx('happy'); }
        if (this.t > 3.0) back('ぴかぴか！');
      } else {
        if (this.t > 2.2 && !this.flushed) {
          this.flushed = true;
          TM.sfx('flush');
          GM.s.pet.pT = GM.CFG.poopEvery[1];
          GM.s.pet.happy = Math.min(4, GM.s.pet.happy + 1);
        }
        if (this.t > 3.6) back('トイレ できたね！');
      }
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      if (this.mode === 'clean') {
        for (const pp of this.poops) G.spr(TM.ITEM.poop[0], pp.x, GROUND - 4);
        TM.drawPet(p, 30, GROUND, { expr: A.face(this.flushed ? { eyes: 'happy', mouth: 'open' } : { eyes: 'open', mouth: 'o' }), frame: A.frame });
        const wx = Math.round(140 - this.t * 90);
        for (let y = 60; y < TM.H; y += 8) G.spr(TM.ITEM.wave, wx, y);
        G.rect(wx + 8, 60, 200, 68, '#5ab4ff');
        G.alpha(0.5); G.rect(wx + 8, 60, 200, 68, '#ffffff'); G.alpha(1);
        TM.fx.draw(G);
        return;
      }
      const toi = TM.ITEM.toilet;
      const tx = 64 - toi.w / 2;
      G.spr(toi, tx, GROUND - toi.h);
      const sitting = this.t > 0.6;
      const strain = this.t > 0.8 && this.t < 2.2;
      const expr = this.flushed ? { eyes: 'happy', mouth: 'open' } : strain ? { eyes: 'closed', mouth: 'line' } : { eyes: 'open', mouth: 'smile' };
      const px = sitting ? 68 : 68 + (0.6 - this.t) * 60;
      TM.drawPet(p, sitting ? 64 : px, sitting ? GROUND - 5 : GROUND, { expr: A.face(expr), frame: strain ? Math.floor(t / 120) % 2 : 0 });
      if (sitting) G.spr(TM.ITEM.toiletFront, tx, GROUND - TM.ITEM.toiletFront.h);
      if (strain) G.spr(TM.ITEM.sweat, 76, GROUND - 34);
      if (this.flushed) {
        for (let i = 0; i < 3; i++) G.spr(TM.ITEM.bubble[i % 3], tx + 4 + i * 4, GROUND - 12 - ((t / 40 + i * 5) % 16));
      }
      TM.fx.draw(G);
    },
    btn() {}, tap() {},
  };

  // =============== BATH ===============
  TM.scenes.bath = {
    enter() { this.t = 0; this.bub = []; TM.sfx('ok'); },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (Math.random() < dt * 6) this.bub.push({ x: 40 + U.rand(48), y: GROUND - 8, k: U.rand(3), s: 6 + U.rand(10) });
      this.bub.forEach((b) => { b.y -= b.s * dt; b.x += Math.sin(b.y / 4) * 0.2; });
      this.bub = this.bub.filter((b) => b.y > 40);
      if (this.t > 3.6 && !this.done) { this.done = true; GM.bath(); TM.fx.sparkle(64, 80, 8); TM.sfx('happy'); }
      if (this.t > 5) back('さっぱり！');
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      const tub = TM.ITEM.tub;
      const tx = 64 - tub.w / 2, ty = GROUND - tub.h + 2;
      // pet sits inside the tub: draw pet, then the tub front over it
      const bob = Math.floor(t / 400) % 2;
      const expr = this.done ? { eyes: 'happy', mouth: 'open' } : { eyes: 'closed', mouth: bob ? 'o' : 'smile' };
      TM.drawPet(p, 64, ty + 10 + bob, { expr: A.face(expr), frame: bob });
      G.spr(TM.ITEM.foam, tx, ty - 1);
      G.spr(tub, tx, ty);
      G.spr(TM.ITEM.duck, tx + 20 + Math.round(Math.sin(t / 300) * 2), ty - 5 + bob);
      // shower + drops
      G.spr(TM.ITEM.shower, 84, 30);
      if (!this.done) for (let i = 0; i < 6; i++) G.spr(TM.ITEM.drop, 86 + (i % 3) * 3 - i, 38 + ((t / 8 + i * 13) % 34));
      for (const b of this.bub) G.spr(TM.ITEM.bubble[b.k], b.x, b.y);
      TM.fx.draw(G);
    },
    btn() {}, tap() {},
  };

  // =============== MEDICINE ===============
  TM.scenes.medicine = {
    enter() { this.t = 0; this.sick = GM.s.pet.sick; },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.sick && this.t > 1.6 && !this.done) { this.done = true; GM.cure(); TM.sfx('happy'); TM.fx.sparkle(64, 86, 8); }
      if (this.t > (this.sick ? 3.4 : 2)) back(this.sick ? 'げんきに なった！' : 'げんきだよ！');
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      let expr = this.sick ? { eyes: 'sick', mouth: 'line' } : { eyes: 'closed', mouth: 'frown' };
      if (this.sick && this.t > 1.0) expr = { eyes: 'cry', mouth: 'o' };
      if (this.done) expr = { eyes: 'happy', mouth: 'open' };
      const flip = !this.sick && Math.floor(this.t * 4) % 2;
      TM.drawPet(p, 56, GROUND, { expr: A.face(expr), frame: A.frame, flip });
      if (this.sick && this.t < 1.8) {
        const sx = Math.max(70, 128 - this.t * 60);
        G.sprS(TM.ITEM.syringe, sx, 82, 2, { flip: true });
      }
      TM.fx.draw(G);
    },
    btn() {}, tap() {},
  };

  // =============== TOY ===============
  TM.scenes.toy = {
    enter() { this.list = TM.ListMenu(TM.list('toy'), { rows: 4 }); this.playing = null; },
    update(dt) {
      A.update(dt, false);
      if (!this.playing) return;
      this.t += dt;
      if (this.t > 4.5 && !this.done) {
        this.done = true;
        const p = GM.s.pet;
        p.happy = Math.min(4, p.happy + (this.playing.happy || 1));
        TM.sfx('happy');
        TM.fx.hearts(64, 70, 3);
      }
      if (this.t > 5.6) back('たのしかった！');
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      if (!this.playing) {
        G.alpha(0.85); G.rect(0, 0, TM.W, TM.H, '#fff6fb'); G.alpha(1);
        title(G, 'おもちゃ');
        this.list.draw(G, 8, 24, 112, 22, (it, x, y, sel) => {
          G.spr(it.spr, x + 14 - Math.floor(it.spr.w / 2), y + 11 - Math.floor(it.spr.h / 2));
          G.text(it.name, x + 28, y + 6, { color: sel ? '#b8283a' : '#4a2f60' });
        });
        return;
      }
      const p = GM.s.pet, toy = this.playing, s = this.t;
      const base = this.done ? { eyes: 'happy', mouth: 'open' } : { eyes: 'open', mouth: 'open' };
      let px = 56, dy = 0;
      if (toy.play === 'bounce') {
        const ph = (s * 1.2) % 1;
        const bx = 56 + Math.round(Math.sin(s * 2.4) * 24), by = GROUND - 44 - Math.round(Math.sin(ph * Math.PI) * 30);
        px = bx;
        if (ph < 0.12) dy = -3;
        TM.drawPet(p, px, GROUND, { expr: A.face(base), frame: A.frame, dy });
        G.spr(toy.spr, bx - 4, by);
      } else if (toy.play === 'hug') {
        TM.drawPet(p, 58, GROUND, { expr: A.face({ eyes: 'happy', mouth: 'smile' }), frame: A.frame });
        G.spr(toy.spr, 66, GROUND - toy.spr.h - 2 + (A.frame ? 1 : 0));
        if (Math.floor(s * 2) % 2 && !this.h1) { this.h1 = 1; TM.fx.hearts(64, 70, 1); }
        if (Math.floor(s * 2) % 2 === 0) this.h1 = 0;
      } else if (toy.play === 'float') {
        dy = -Math.abs(Math.round(Math.sin(s * 5) * 4));
        TM.drawPet(p, 56, GROUND, { expr: A.face(base), frame: A.frame, dy });
        G.spr(toy.spr, 66 + Math.round(Math.sin(s * 2) * 3), 46 + Math.round(Math.cos(s * 3) * 2) + dy);
      } else if (toy.play === 'spin') {
        TM.drawPet(p, 50, GROUND, { expr: A.face(base), frame: A.frame });
        const yy = 60 + Math.round(Math.abs(Math.sin(s * 4)) * 30);
        G.rect(68, 58, 1, yy - 58, '#2b1d3a');
        G.spr(toy.spr, 65, yy - 3);
      } else if (toy.play === 'stack') {
        TM.drawPet(p, 40, GROUND, { expr: A.face(base), frame: A.frame });
        const n = Math.min(3, Math.floor(s / 1.2) + 1);
        const bl = [['kkkkkk', 'kggggk', 'kggggk', 'kkkkkk'], ['kkkkkk', 'kuuuuk', 'kuuuuk', 'kkkkkk'], ['kkkkkk', 'kyyyyk', 'kyyyyk', 'kkkkkk']];
        this._bl = this._bl || bl.map((r) => TM.spr(r));
        for (let i = 0; i < n; i++) G.spr(this._bl[i], 76, GROUND - 4 - i * 4);
      } else if (toy.play === 'sing') {
        TM.drawPet(p, 56, GROUND, { expr: A.face({ eyes: 'closed', mouth: Math.floor(s * 4) % 2 ? 'open' : 'o' }), frame: A.frame });
        G.spr(toy.spr, 64, GROUND - 22);
        for (let i = 0; i < 3; i++) G.spr(TM.ITEM.note, 76 + i * 10, 50 - ((s * 20 + i * 12) % 30));
      }
      TM.fx.draw(G);
    },
    btn(b) {
      if (this.playing) return;
      if (b === 'A') this.list.next();
      if (b === 'B') { this.playing = this.list.cur; this.t = 0; this.done = false; TM.sfx('ok'); }
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) {
      if (this.playing) return;
      const i = this.list.hit(x, y, 8, 24, 112, 22);
      if (i >= 0) { if (i === this.list.i) this.btn('B'); else { this.list.i = i; TM.sfx('beep'); } }
      else if (y < 20) this.btn('C');
      else this.list.next();
    },
  };

  // =============== GAME: どっちむくかな？ ===============
  TM.scenes.game = {
    enter() { this.round = 0; this.win = 0; this.phase = 'ask'; this.t = 0; this.guess = 0; this.face = 0; this.hist = []; },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.phase === 'turn' && this.t > 0.5) {
        this.phase = 'result';
        this.t = 0;
        this.ok = this.guess === this.face;
        if (this.ok) { this.win++; TM.sfx('happy'); TM.fx.hearts(64, 64, 2); } else TM.sfx('sad');
      } else if (this.phase === 'result' && this.t > 1.2) {
        this.round++;
        this.t = 0;
        if (this.round >= 5) {
          this.phase = 'end';
          GM.play(this.win >= 3);
          if (this.win >= 3) TM.sfx('fanfare');
        } else this.phase = 'ask';
      } else if (this.phase === 'end' && this.t > 2.4) back(this.win >= 3 ? 'かった！ +20P' : 'ざんねん…');
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      title(G, 'どっちむくかな？');
      let expr = { eyes: 'open', mouth: 'smile' }, flip = false;
      if (this.phase === 'ask') flip = Math.floor(t / 300) % 2 === 0;
      if (this.phase === 'turn' || this.phase === 'result') flip = this.face < 0;
      if (this.phase === 'result') expr = this.ok ? { eyes: 'happy', mouth: 'open' } : { eyes: 'closed', mouth: 'frown' };
      if (this.phase === 'end') expr = this.win >= 3 ? { eyes: 'happy', mouth: 'big' } : { eyes: 'cry', mouth: 'frown' };
      TM.drawPet(p, 64, GROUND - 6, { expr: A.face(expr), frame: A.frame, flip });
      // score dots
      for (let i = 0; i < 5; i++) G.rect(40 + i * 10, 22, 6, 6, i < this.round ? (this.hist && this.hist[i] ? '#ff6fa3' : '#b4b4c8') : '#ffffff');
      if (this.phase === 'ask') {
        G.spr(TM.ARROW_L, 10, 96); G.spr(TM.ARROW_R, 114, 96);
        G.msg('A:ひだり  B:みぎ', { y: 108 });
      }
      if (this.phase === 'end') G.msg(this.win + ' / 5  ' + (this.win >= 3 ? 'かち！' : 'まけ…'), { y: 108 });
      TM.fx.draw(G);
    },
    pick(dir) {
      if (this.phase !== 'ask') return;
      this.guess = dir;
      this.face = U.chance(0.5) ? -1 : 1;
      this.phase = 'turn';
      this.t = 0;
      this.hist = this.hist || [];
      this.hist[this.round] = this.guess === this.face;
      TM.sfx('beep');
    },
    btn(b) {
      if (b === 'A') this.pick(-1);
      if (b === 'B') this.pick(1);
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) { if (y < 20) return this.btn('C'); this.pick(x < 64 ? -1 : 1); },
  };
})();
