/*
 * OUTING: choose place → travel → meet someone → (おみあい → wedding → egg)
 * Also: hatch and grow (evolution) scenes.
 */
(function () {
  'use strict';
  const U = TM.util;
  const GM = TM.game;
  const A = TM.actor;
  const back = (msg) => TM.sc.go('home', { msg, keepActor: true });

  // =============== choose place ===============
  TM.scenes.outing = {
    enter() { this.list = TM.ListMenu(TM.list('place'), { rows: 4 }); },
    update(dt) { A.update(dt, false); },
    draw(G, t) {
      const pl = this.list.cur;
      pl.draw(G, t);
      G.alpha(0.88); G.box(8, 30, 112, 94, { bg: '#fff6fb', border: '#ff6fa3' }); G.alpha(1);
      TM.drawTitle(G, 'どこへ いく？');
      this.list.draw(G, 12, 36, 104, 20, (it, x, y, sel) => {
        G.text(it.name, x + 8, y + 5, { color: sel ? '#b8283a' : '#4a2f60' });
      });
    },
    btn(b) {
      if (b === 'A') this.list.next();
      if (b === 'B') { TM.sfx('ok'); TM.sc.go('travel', { to: this.list.cur.id }); }
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) {
      const i = this.list.hit(x, y, 12, 36, 104, 20);
      if (i >= 0) { if (i === this.list.i) this.btn('B'); else { this.list.i = i; TM.sfx('beep'); } }
      else if (y < 28) this.btn('C');
    },
  };

  // =============== travel (walking on the road) ===============
  TM.scenes.travel = {
    enter(a) { this.to = a.to; this.t = 0; this.msg = a.msg; },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.t > 2.6) {
        if (this.to === 'home') back(this.msg || 'ただいま！');
        else TM.sc.go('place', { place: this.to });
      }
    },
    draw(G, t) {
      const dir = this.to === 'home' ? -1 : 1;
      TM.drawRoad(G, t, dir);
      const p = GM.s.pet;
      TM.drawShadow(64, 112, 18);
      TM.drawPet(p, 64, 112, { expr: A.face({ eyes: 'open', mouth: 'smile' }), frame: A.frame, flip: dir < 0, dy: Math.floor(t / 150) % 2 ? -1 : 0 });
      const name = this.to === 'home' ? 'おうち' : TM.get('place', this.to).name;
      G.msg(name + 'へ おでかけ♪', { y: 4 });
    },
    btn() {}, tap() {},
  };

  // =============== at the place ===============
  const OPTS = [
    { id: 'hello', name: 'あいさつ' },
    { id: 'gift', name: 'プレゼント' },
    { id: 'omiai', name: 'おみあい' },
    { id: 'next', name: 'ほかのこ' },
    { id: 'home', name: 'かえる' },
  ];
  TM.scenes.place = {
    enter(a) {
      if (a.place) this.place = TM.get('place', a.place);
      this.t = 0;
      this.sx = 150;
      this.anim = null;
      this.menu = false;
      this.sel = 0;
      if (a.keep && this.npc) { this.sx = 92; this.menu = true; return; }
      const p = GM.s.pet;
      this.npc = TM.genetics.stranger(p.gender === 'm' ? 'f' : 'm');
      this.npc.stage = 'adult';
      if (p.stage !== 'adult' && U.chance(0.5)) this.npc.stage = p.stage === 'baby' ? 'baby' : 'child';
    },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.sx > 92) {
        this.sx = Math.max(92, this.sx - dt * 30);
        if (this.sx === 92) { TM.sfx('call'); this.menu = true; }
      }
      if (this.anim) {
        this.anim.t += dt;
        if (this.anim.t > this.anim.len) {
          const done = this.anim.done;
          this.anim = null;
          if (done) done();
        }
      }
    },
    draw(G, t) {
      const pl = this.place;
      pl.draw(G, t);
      const g = pl.ground;
      const p = GM.s.pet;
      const an = this.anim;
      let pe = { eyes: 'open', mouth: 'smile' }, ne = { eyes: 'open', mouth: 'smile' };
      let pdy = 0, ndy = 0;
      if (an && (an.id === 'hello' || an.id === 'gift')) {
        pe = ne = { eyes: 'happy', mouth: 'open' };
        pdy = -Math.abs(Math.round(Math.sin(an.t * 10) * 3));
        ndy = -Math.abs(Math.round(Math.cos(an.t * 10) * 3));
      }
      if (an && an.id === 'nope') { ne = { eyes: 'closed', mouth: 'frown' }; pe = { eyes: 'cry', mouth: 'frown' }; }
      TM.drawShadow(36, g, 18);
      TM.drawPet(p, 36, g, { expr: A.face(pe), frame: A.frame, dy: pdy });
      TM.drawShadow(this.sx, g, 18);
      const walking = this.sx > 92;
      TM.drawPet(this.npc, this.sx, g, { expr: ne, frame: Math.floor(t / 500) % 2, flip: true, dy: walking && Math.floor(t / 150) % 2 ? -1 : ndy });
      if (!walking && this.t < 99 && !this.menu && !an) G.spr(TM.ITEM.exclaim, this.sx - 1, g - 44);
      if (an && an.id === 'gift') {
        const k = Math.min(1, an.t / 1);
        G.spr(TM.ITEM.present, Math.round(U.lerp(44, 84, k)), g - 18 - Math.round(Math.sin(k * Math.PI) * 14));
      }
      TM.fx.draw(G);
      // name tag
      G.msg([this.npc.name + '「' + (an && an.line ? an.line : this.npc.line) + '」'], { y: 4 });
      if (this.menu && !an) this.drawMenu(G);
    },
    drawMenu(G) {
      G.alpha(0.94); G.box(64, 26, 62, 62, { bg: '#fff6fb', border: '#ff6fa3' }); G.alpha(1);
      OPTS.forEach((o, i) => {
        const y = 29 + i * 11.5;
        const dis = o.id === 'omiai' && !this.canOmiai();
        if (i === this.sel) G.spr(TM.ARROW_R, 68, Math.round(y) + 3);
        G.text(o.name, 74, Math.round(y), { color: dis ? '#b4b4c8' : i === this.sel ? '#b8283a' : '#4a2f60' });
      });
    },
    canOmiai() {
      const p = GM.s.pet;
      return GM.s.debug || (p.stage === 'adult' && this.npc.stage === 'adult');
    },
    act(id) {
      const p = GM.s.pet;
      const g = this.place.ground;
      if (id === 'hello') {
        TM.sfx('happy');
        this.anim = { id, t: 0, len: 1.8, line: U.pick(['よろしくね！', 'また あそぼうね', 'なかよし〜♪', 'えへへ']) };
        TM.fx.hearts(64, g - 30, 2);
        p.happy = Math.min(4, p.happy + 1);
        GM.s.points += 5;
        if (!GM.s.met.includes(this.npc.name)) GM.s.met.push(this.npc.name);
      } else if (id === 'gift') {
        if (GM.s.points < 10) { TM.sfx('cancel'); this.anim = { id: 'nope', t: 0, len: 1.2, line: 'ポイントが たりないよ' }; return; }
        GM.s.points -= 10;
        TM.sfx('ok');
        this.anim = { id, t: 0, len: 1.8, line: 'わあ、ありがとう！', done: () => TM.fx.hearts(92, g - 30, 3) };
        p.happy = Math.min(4, p.happy + 2);
      } else if (id === 'omiai') {
        if (!this.canOmiai()) { TM.sfx('cancel'); this.anim = { id: 'nope', t: 0, len: 1.4, line: 'おとなに なってからね' }; return; }
        TM.sfx('ok');
        TM.sc.go('omiai', { npc: this.npc, place: this.place.id });
      } else if (id === 'next') {
        TM.sfx('beep');
        this.enter({});
      } else if (id === 'home') {
        TM.sfx('cancel');
        TM.sc.go('travel', { to: 'home' });
      }
    },
    btn(b) {
      if (!this.menu || this.anim) return;
      if (b === 'A') { this.sel = (this.sel + 1) % OPTS.length; TM.sfx('beep'); }
      if (b === 'B') this.act(OPTS[this.sel].id);
      if (b === 'C') this.act('home');
    },
    tap(x, y) {
      if (!this.menu || this.anim) return;
      if (x >= 64 && y >= 27 && y < 88) {
        const i = Math.floor((y - 28) / 11.5);
        if (i >= 0 && i < OPTS.length) { if (i === this.sel) this.act(OPTS[i].id); else { this.sel = i; TM.sfx('beep'); } }
      }
    },
  };

  // =============== おみあい (love meter timing game) ===============
  TM.scenes.omiai = {
    enter(a) {
      this.npc = a.npc; this.placeId = a.place;
      this.t = 0; this.phase = 'meter'; this.v = 0; this.dir = 1;
      this.zone = [0.62 + Math.random() * 0.12, 0];
      this.zone[1] = this.zone[0] + 0.18;
      this.speed = 1.1 + Math.random() * 0.5;
    },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.phase === 'meter') {
        this.v += this.dir * dt * this.speed;
        if (this.v >= 1) { this.v = 1; this.dir = -1; }
        if (this.v <= 0) { this.v = 0; this.dir = 1; }
      } else if (this.phase === 'result' && this.t > 2.2) {
        if (this.ok) TM.sc.go('wedding', { npc: this.npc });
        else TM.sc.go('place', { keep: true });
      }
    },
    draw(G, t) {
      G.clear('#fff0f8');
      for (let i = 0; i < 12; i++) G.spr(TM.ITEM.heartS, (i * 29 + t / 30) % 132 - 4, (i * 47) % 120 + 4);
      TM.drawTitle(G, 'おみあい');
      const p = GM.s.pet;
      let pe = { eyes: 'open', mouth: 'smile' }, ne = pe;
      if (this.phase === 'result') pe = ne = this.ok ? { eyes: 'happy', mouth: 'open' } : { eyes: 'closed', mouth: 'frown' };
      TM.drawPet(p, 32, 84, { expr: A.face(pe), frame: A.frame });
      TM.drawPet(this.npc, 96, 84, { expr: ne, frame: A.frame, flip: true });
      // meter
      const mx = 14, my = 94, mw = 100;
      G.rect(mx - 1, my - 1, mw + 2, 10, '#8e2f5c');
      G.rect(mx, my, mw, 8, '#ffffff');
      G.rect(mx + Math.round(this.zone[0] * mw), my, Math.round((this.zone[1] - this.zone[0]) * mw), 8, '#ff9ec2');
      G.rect(mx, my, Math.round(this.v * mw), 3, '#ff6fa3');
      G.spr(TM.ITEM.heart, mx + Math.round(this.v * mw) - 3, my - 7);
      if (this.phase === 'meter') G.text('Bで ハートを とめよう！', 64, 110, { color: '#8e2f5c', align: 'center' });
      else G.text(this.ok ? 'だいせいこう！' : 'ごめんなさい…', 64, 110, { color: this.ok ? '#ff4d5e' : '#6e6e88', align: 'center' });
      TM.fx.draw(G);
      if (this.phase === 'result' && this.ok) {
        G.spr(TM.ITEM.heart, 60, 50 - Math.round(Math.abs(Math.sin(t / 150)) * 3));
      }
    },
    stop() {
      if (this.phase !== 'meter') return;
      this.phase = 'result';
      this.t = 0;
      this.ok = (this.v >= this.zone[0] && this.v <= this.zone[1]) || (GM.s.debug && GM.s.alwaysLove);
      if (this.ok) { TM.sfx('fanfare'); TM.fx.hearts(64, 60, 6); } else TM.sfx('sad');
    },
    btn(b) { if (b === 'C' && this.phase === 'meter') { TM.sfx('cancel'); TM.sc.go('place', { keep: true }); } else this.stop(); },
    tap() { this.stop(); },
  };

  // =============== wedding ===============
  TM.scenes.wedding = {
    enter(a) { this.npc = a.npc; this.partner = a.npc; this.t = 0; this.stage = 0; this.breed = a.breed || TM.genetics.breed(GM.s.pet.genes, a.npc.genes); TM.sfx('wed'); },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.t > 1.5 && this.stage === 0) { this.stage = 1; TM.fx.hearts(64, 60, 6); }
      if (this.t > 3.5 && this.stage === 1) { this.stage = 2; TM.sfx('hatch'); TM.fx.sparkle(64, 100, 8); }
      if (this.t > 6 && this.stage === 2) {
        this.stage = 3;
        const old = GM.s.pet;
        this.oldName = old.name;
        GM.marry(this.partner, this.breed);
        TM.sc.go('farewell', { a: old, b: this.partner });
      }
    },
    draw(G, t) {
      TM.drawChapel(G, t);
      const p = GM.s.pet;
      const e = this.stage >= 1 ? { eyes: 'happy', mouth: 'open' } : { eyes: 'open', mouth: 'smile' };
      TM.drawPet(p, 44, 110, { expr: A.face(e), frame: A.frame });
      TM.drawPet(this.partner, 84, 110, { expr: e, frame: A.frame, flip: true });
      G.spr(TM.ITEM.bell, 61, 44 + (Math.floor(t / 200) % 2));
      if (this.stage >= 2) {
        const eg = TM.STAGE.egg;
        const gp = TM.get('color', this.breed.genes.color);
        G.spr(eg, 64 - eg.w / 2, 112 - eg.h - Math.round(Math.abs(Math.sin(t / 200)) * 2), { gp });
      }
      TM.fx.draw(G);
      G.msg(this.stage >= 2 ? 'たまごを さずかった！' : 'けっこん おめでとう！', { y: 4 });
    },
    btn() {}, tap() {},
  };

  // =============== farewell: parents leave, egg stays ===============
  TM.scenes.farewell = {
    enter(a) { this.a = a.a; this.b = a.b; this.t = 0; },
    update(dt) {
      this.t += dt;
      if (this.t > 4.2) TM.sc.go('home', { msg: 'あたらしい たまご！' });
    },
    draw(G, t) {
      TM.drawRoad(G, t, 1);
      const k = Math.max(0, this.t - 1) * 26;
      TM.drawPet(this.a, 50 + k, 112, { expr: { eyes: 'happy', mouth: 'smile' }, frame: Math.floor(t / 300) % 2, dy: Math.floor(t / 150) % 2 ? -1 : 0 });
      TM.drawPet(this.b, 76 + k, 112, { expr: { eyes: 'happy', mouth: 'smile' }, frame: Math.floor(t / 300) % 2, dy: Math.floor(t / 150) % 2 ? 0 : -1 });
      G.msg([this.a.name + 'と ' + this.b.name + 'は', 'ふたりで たびに でたよ'], { y: 4 });
    },
    btn(b) { if (b === 'B' || b === 'C') this.t = 99; }, tap() { this.t = 99; },
  };

  // =============== hatch ===============
  TM.scenes.hatch = {
    enter() { this.t = 0; this.hatched = false; },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (this.t > 3 && !this.hatched) {
        this.hatched = true;
        GM.grow(true);
        TM.sfx('hatch');
        TM.fx.sparkle(64, 96, 10);
      }
      if (this.t > 6) TM.sc.go('home', { msg: GM.s.pet.name + 'が うまれたよ！' });
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      const p = GM.s.pet;
      const gp = TM.get('color', p.genes.color);
      const eg = TM.STAGE.egg;
      const ex = 64 - eg.w / 2, ey = 108 - eg.h;
      if (!this.hatched) {
        const shake = this.t > 1 ? (Math.floor(t / 80) % 2 ? 1 : -1) : Math.floor(t / 300) % 2;
        G.spr(eg, ex + shake, ey, { gp });
        const c = this.t > 2.2 ? 1 : this.t > 1.2 ? 0 : -1;
        if (c >= 0) G.spr(TM.STAGE.crack[c], ex + shake, ey);
      } else {
        TM.drawPet(p, 64, 108, { expr: A.face({ eyes: this.t > 4 ? 'open' : 'closed', mouth: 'open' }), frame: A.frame });
        const s = TM.STAGE.shell;
        G.spr(s, 64 - s.w / 2, 108 - s.h + 1, { gp });
      }
      TM.fx.draw(G);
      if (this.t > 4) G.msg(p.name + 'が うまれた！', { y: 4 });
    },
    btn() {}, tap() {},
  };

  // =============== grow (evolution) ===============
  TM.scenes.grow = {
    enter(a) { this.from = a.from; this.t = 0; TM.sfx('fanfare'); },
    update(dt) {
      A.update(dt, false);
      this.t += dt;
      if (Math.random() < dt * 8) TM.fx.sparkle(64, 90, 1);
      if (this.t > 4.5) TM.sc.go('home', { msg: TM.STAGE_NAME[GM.s.pet.stage] + 'に なった！' });
    },
    draw(G, t) {
      TM.drawHomeBG(G);
      G.alpha(0.5); G.rect(0, 0, TM.W, TM.H, '#ffffff'); G.alpha(1);
      const p = GM.s.pet;
      // alternate old / new form, faster and faster
      const speed = Math.max(60, 400 - this.t * 120);
      const showNew = this.t > 3 || Math.floor((this.t * 1000) / speed) % 2 === 1;
      const who = showNew ? p : { genes: p.genes, stage: this.from };
      TM.drawPet(who, 64, 104, { expr: A.face(this.t > 3 ? { eyes: 'happy', mouth: 'open' } : { eyes: 'closed', mouth: 'smile' }) });
      TM.fx.draw(G);
      if (this.t > 3) G.msg(TM.STAGE_NAME[p.stage] + 'に なった！', { y: 4 });
    },
    btn() {}, tap() {},
  };
})();
