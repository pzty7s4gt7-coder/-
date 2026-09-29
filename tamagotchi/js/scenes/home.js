/*
 * HOME — the living room with the pet wandering, poops, status marks and
 * the icon menu (A: next, B: open, C: close / tap icons directly).
 */
(function () {
  'use strict';
  const U = TM.util;
  const GM = TM.game;
  const A = TM.actor;
  const GROUND = 108;

  TM.STAGE_NAME = { egg: 'たまご', baby: 'ベビー', child: 'こども', adult: 'おとな' };

  // background shared by many scenes
  TM.drawHomeBG = function (G) {
    const room = TM.get('room', GM.s.room) || TM.list('room')[0];
    TM.drawRoom(room, TM.SKY[GM.skyKey()]);
  };
  TM.drawDark = function (G, a) {
    G.alpha(a == null ? 0.72 : a);
    G.rect(0, 0, TM.W, TM.H, '#10152e');
    G.alpha(1);
  };
  // top chips: clock + gotchi points
  TM.drawTopBar = function (G) {
    const d = GM.now();
    const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
    const str = hh + ':' + mm;
    G.rect(1, 1, G.numW(str) + 4, 9, '#ffffff');
    G.rect(1, 1, G.numW(str) + 4, 1, '#ffb0cf');
    G.num(str, 3, 3, '#6b4a8a');
    const pts = GM.s.points + 'P';
    const pw = G.numW(pts) + 4;
    G.rect(TM.W - pw - 1, 1, pw, 9, '#ffffff');
    G.rect(TM.W - pw - 1, 1, pw, 1, '#ffd84a');
    G.num(pts, TM.W - pw + 1, 3, '#c8641e');
  };

  const icons = () => TM.list('icon');
  const COLS = 6, CW = 20, PY = 88;

  const H = (TM.scenes.home = {
    menu: false, sel: 0, msgT: 0, msg: '', callT: 0,
    enter(a) {
      this.menu = !!a.menu;
      if (a.sel != null) this.sel = a.sel;
      if (a.msg) { this.msg = a.msg; this.msgT = 2.5; }
      if (!a.keepActor) A.reset(A.x || 64);
    },
    update(dt) {
      const p = GM.s.pet;
      if (p.stage === 'egg') {
        if (p.stageT >= GM.CFG.stageTime.egg) return TM.sc.go('hatch');
      }
      const wander = p.stage !== 'egg' && !p.sleeping && !this.menu;
      A.update(dt, wander, 18, 110);
      if (this.msgT > 0) this.msgT -= dt;
      // call sound when something is needed
      this.callT -= dt;
      if (this.callT <= 0) {
        this.callT = 30;
        if (!p.sleeping && p.stage !== 'egg' && (p.hunger === 0 || p.happy === 0 || p.sick)) TM.sfx('call');
      }
    },
    draw(G, t) {
      const p = GM.s.pet;
      TM.drawHomeBG(G);
      // poops
      for (const pp of p.poops) {
        const ps = TM.ITEM.poop[0];
        G.spr(ps, pp.x, GROUND - ps.h + 4);
        G.spr(TM.ITEM.stink[Math.floor(t / 400) % 2], pp.x + 2, GROUND - ps.h - 2);
      }
      if (p.stage === 'egg') {
        const wob = Math.floor(t / 250) % 4;
        const dx = wob === 1 ? -1 : wob === 3 ? 1 : 0;
        TM.drawShadow(64, GROUND, 18);
        TM.drawPet(p, 64 + dx, GROUND);
      } else if (p.sleeping) {
        // headboard → pillow → pet → quilt (covers the body)
        const I = TM.ITEM;
        const qy = GROUND - I.quilt.h + 2;
        G.spr(I.headboard, 64 - I.headboard.w / 2, qy + 3 - I.headboard.h);
        G.spr(I.pillow, 64 - I.pillow.w / 2, qy - 2);
        const ph = TM.look.bounds(p.genes, p.stage).h;
        TM.look.draw(p.genes, p.stage, 64, qy + Math.min(9, Math.round(ph * 0.3)), { expr: { eyes: 'closed', mouth: 'line' } });
        G.spr(I.quilt, 64 - I.quilt.w / 2, qy);
        const zf = Math.floor(t / 700) % 2;
        G.spr(I.zzz[zf], 78 + zf * 3, qy - ph + 4 - (Math.floor(t / 350) % 2));
      } else {
        let expr = { eyes: 'open', mouth: 'smile' };
        if (p.sick) expr = { eyes: 'sick', mouth: 'line' };
        else if (p.hunger === 0 || p.happy === 0) expr = { eyes: 'open', mouth: 'frown' };
        else if (p.happy >= 4) expr = { eyes: 'open', mouth: A.frame ? 'open' : 'smile' };
        const face = A.face(expr);
        TM.drawShadow(A.x, GROUND, 18);
        TM.drawPet(p, A.x, GROUND, { expr: face, frame: A.frame, flip: A.dir < 0, dy: A.hopY() });
        const top = GROUND - TM.look.bounds(p.genes, p.stage).h;
        if (p.sick) {
          G.spr(TM.ITEM.skull, A.x + 10, top - 4 + (A.frame ? 1 : 0));
          G.spr(TM.ITEM.sweat, A.x - 12, top + 4);
        } else if (p.hunger === 0 && Math.floor(t / 2500) % 2 === 0) {
          G.spr(TM.ITEM.thought, A.x + 6, top - 14);
          G.spr(TM.get('food', 'onigiri').spr, A.x + 4, top - 14, {});
        } else if (p.happy === 0 && Math.floor(t / 2500) % 2 === 1) {
          G.spr(TM.ITEM.anger, A.x + 10, top);
        }
      }
      TM.fx.draw(G);
      if (GM.s.lightsOff) TM.drawDark(G, p.sleeping ? 0.7 : 0.55);
      TM.drawTopBar(G);
      // attention mark
      if (p.stage !== 'egg' && !p.sleeping && (p.hunger === 0 || p.happy === 0 || p.sick || p.poops.length >= 2) && Math.floor(t / 500) % 2)
        G.spr(TM.ITEM.exclaim, 62, 2);
      if (this.msgT > 0) G.msg(this.msg);
      if (this.menu) this.drawMenu(G, t);
    },
    drawMenu(G, t) {
      const list = icons();
      G.alpha(0.92);
      G.box(0, PY - 2, TM.W, TM.H - PY + 2, { bg: '#fff6fb', border: '#ff6fa3', shadow: '#ffd0e0' });
      G.alpha(1);
      list.forEach((ic, i) => {
        const cx = 4 + (i % COLS) * CW, cy = PY + 3 + Math.floor(i / COLS) * 19;
        if (i === this.sel) {
          G.box(cx - 1, cy - 2, 18, 16, { bg: '#ffe38a', border: '#ff9a3c', shadow: '#ffd84a' });
        }
        G.spr(ic.spr, cx + 2, cy + (i === this.sel && Math.floor(t / 300) % 2 ? -1 : 0));
      });
      const name = list[this.sel].name;
      const w = G.textW(name) + 10;
      G.box(64 - w / 2, PY - 15, w, 13, { bg: '#ffffff', border: '#ff6fa3' });
      G.text(name, 64, PY - 12, { color: '#b8283a', align: 'center' });
    },
    open(i) {
      const ic = icons()[i];
      const p = GM.s.pet;
      this.menu = false;
      if (p.stage === 'egg' && !['status', 'room', 'family', 'zukan'].includes(ic.scene)) {
        TM.sfx('cancel');
        this.msg = 'まだ たまごだよ'; this.msgT = 2;
        return;
      }
      if (p.sleeping && ['food', 'bath', 'game', 'toy', 'outing', 'toilet'].includes(ic.scene)) {
        TM.sfx('cancel');
        this.msg = 'すやすや ねてるよ…'; this.msgT = 2;
        return;
      }
      TM.sfx('ok');
      if (ic.scene === 'light') {
        GM.s.lightsOff = !GM.s.lightsOff;
        this.msg = GM.s.lightsOff ? 'でんきを けしたよ' : 'でんきを つけたよ';
        this.msgT = 1.5;
        return;
      }
      TM.sc.go(ic.scene, { from: 'home' });
    },
    btn(b) {
      const n = icons().length;
      if (!this.menu) {
        if (b === 'C') { TM.sfx('beep'); this.msg = TM.game.s.pet.name + ' / ' + TM.STAGE_NAME[TM.game.s.pet.stage]; this.msgT = 1.5; return; }
        this.menu = true; TM.sfx('beep'); return;
      }
      if (b === 'A') { this.sel = (this.sel + 1) % n; TM.sfx('beep'); }
      else if (b === 'B') this.open(this.sel);
      else if (b === 'C') { this.menu = false; TM.sfx('cancel'); }
    },
    tap(x, y) {
      const p = GM.s.pet;
      if (this.menu) {
        if (y >= PY) {
          const col = Math.floor((x - 3) / CW), row = Math.floor((y - PY - 1) / 19);
          const i = row * COLS + col;
          if (col >= 0 && col < COLS && i >= 0 && i < icons().length) {
            if (i === this.sel) this.open(i);
            else { this.sel = i; TM.sfx('beep'); }
          }
        } else { this.menu = false; TM.sfx('cancel'); }
        return;
      }
      // pat the pet
      if (p.stage !== 'egg' && !p.sleeping) {
        const b = TM.look.bounds(p.genes, p.stage);
        if (Math.abs(x - A.x) <= b.w / 2 + 3 && y >= GROUND - b.h - 3 && y <= GROUND + 2) {
          GM.pat();
          A.say({ eyes: 'happy', mouth: 'open' }, 1.2);
          A.mode = 'hop'; A.modeT = 0.6;
          TM.fx.hearts(A.x, GROUND - b.h, 2);
          TM.sfx('happy');
          return;
        }
      }
      this.menu = true;
      TM.sfx('beep');
    },
  });
})();
