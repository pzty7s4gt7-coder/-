/*
 * INFO scenes: room (もようがえ), family tree (かけいず), part dex (ずかん).
 */
(function () {
  'use strict';
  const GM = TM.game;
  const A = TM.actor;
  const back = (msg) => TM.sc.go('home', { msg, keepActor: true });

  // =============== ROOM ===============
  TM.scenes.room = {
    enter() {
      this.ids = TM.ids('room');
      this.i = Math.max(0, this.ids.indexOf(GM.s.room));
    },
    update(dt) { A.update(dt, true, 20, 108); },
    draw(G, t) {
      const room = TM.get('room', this.ids[this.i]);
      TM.drawRoom(room, TM.SKY[GM.skyKey()]);
      const p = GM.s.pet;
      if (p.stage !== 'egg') {
        TM.drawShadow(A.x, 108, 18);
        TM.drawPet(p, A.x, 108, { expr: A.face(), frame: A.frame, flip: A.dir < 0, dy: A.hopY() });
      } else TM.drawPet(p, 64, 108);
      G.spr(TM.ARROW_L, 3, 58);
      G.spr(TM.ARROW_R, 122, 58);
      G.msg([room.name, 'A:つぎ B:きめる C:もどる'], { y: 100 });
    },
    btn(b) {
      if (b === 'A') { this.i = (this.i + 1) % this.ids.length; TM.sfx('beep'); }
      if (b === 'B') { GM.s.room = this.ids[this.i]; GM.save(); TM.sfx('ok'); back('もようがえ したよ！'); }
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) {
      if (y > 98) return this.btn('B');
      const n = this.ids.length;
      this.i = (this.i + (x < 64 ? n - 1 : 1)) % n;
      TM.sfx('beep');
    },
  };

  // =============== FAMILY TREE ===============
  // Shows every generation: Gen N | you | ♥ | partner  (newest on top)
  const HEART = TM.spr(['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
  TM.scenes.family = {
    enter() { this.top = 0; },
    rows() {
      const s = GM.s;
      const rows = s.family.map((f) => ({ gen: f.gen, me: { genes: f.genes, stage: 'adult', name: f.name, gender: f.gender }, partner: f.partner }));
      rows.push({ gen: s.pet.gen, me: s.pet, partner: null, cur: true });
      return rows.reverse();
    },
    draw(G, t) {
      G.clear('#f8f6ff');
      const rows = this.rows();
      const RH = 42;
      for (let r = 0; r < 3; r++) {
        const row = rows[this.top + r];
        if (!row) break;
        const y = 18 + r * RH;
        G.rect(0, y, TM.W, RH, r % 2 ? '#fffbd8' : '#f8f6ff');
        G.text('Gen', 4, y + 10, { color: '#4a2f60' });
        G.num(String(row.gen), 6, y + 22, '#4a2f60');
        TM.drawPet(row.me, 48, y + RH - 1, { expr: { eyes: 'open', mouth: 'smile' }, frame: row.cur ? A.frame : 0 });
        if (row.me.stage !== 'egg') G.spr(TM.GENDER_SPR[row.me.gender], 62, y + 2);
        if (row.partner) {
          G.spr(HEART, 72, y + 24);
          TM.drawPet({ genes: row.partner.genes, stage: 'adult' }, 104, y + RH - 1, { expr: { eyes: 'open', mouth: 'smile' }, flip: true });
        } else if (row.cur) G.text('いま', 104, y + 18, { color: '#ff6fa3', align: 'center' });
      }
      TM.drawTitle(G, 'かけいず');
      if (this.top > 0) G.spr(TM.ARROW_UP, 118, 20);
      if (this.top + 3 < rows.length) G.spr(TM.ARROW_DN, 118, 122);
    },
    btn(b) {
      const n = this.rows().length;
      if (b === 'A' || b === 'B') { this.top = this.top + 1 >= n ? 0 : this.top + 1; TM.sfx('beep'); }
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) {
      if (y < 16) return this.btn('C');
      const n = this.rows().length;
      if (y < 64) this.top = Math.max(0, this.top - 1);
      else this.top = Math.min(Math.max(0, n - 1), this.top + 1);
      TM.sfx('beep');
    },
  };

  // =============== ZUKAN (discovered parts) ===============
  const sil = new Map();
  function silhouette(c) {
    let s = sil.get(c);
    if (s) return s;
    s = document.createElement('canvas');
    s.width = c.width; s.height = c.height;
    const x = s.getContext('2d');
    x.drawImage(c, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#c8c0dc';
    x.fillRect(0, 0, s.width, s.height);
    sil.set(c, s);
    return s;
  }
  TM.scenes.zukan = {
    enter() { this.cat = 0; this.page = 0; },
    draw(G, t) {
      G.clear('#f4fff8');
      const k = TM.genetics.KEYS[this.cat];
      const ids = TM.ids(k);
      const seen = GM.s.seen[k] || {};
      const cnt = ids.filter((id) => seen[id]).length;
      TM.drawTitle(G, 'ずかん: ' + TM.look.GENE_NAMES[k]);
      G.num(cnt + '/' + ids.length, 128 - G.numW(cnt + '/' + ids.length) - 4, 22, '#3f9a4a');
      const per = 6;
      const pages = Math.ceil(ids.length / per);
      if (this.page >= pages) this.page = 0;
      const base = Object.assign({}, GM.s.pet.genes);
      for (let i = 0; i < per; i++) {
        const id = ids[this.page * per + i];
        if (!id) break;
        const cx = 22 + (i % 3) * 42, cy = 30 + Math.floor(i / 3) * 48;
        G.box(cx - 20, cy, 40, 46, { bg: '#ffffff', border: seen[id] ? '#7ed56f' : '#d4ddf0' });
        const g = Object.assign({}, base, { [k]: id });
        const c = TM.look.canvas(g, 'adult', { eyes: 'open', mouth: 'smile' }, 0);
        G.img(seen[id] ? c : silhouette(c), cx - 20, cy - 2);
        if (seen[id]) G.text(TM.get(k, id).name.slice(0, 5), cx, cy + 36, { color: '#3e6a1e', align: 'center' });
        else G.text('？？？', cx, cy + 36, { color: '#8a8aa2', align: 'center' });
      }
      G.num((this.page + 1) + '/' + pages, 4, 22, '#8a8aa2');
    },
    btn(b) {
      const k = TM.genetics.KEYS[this.cat];
      const pages = Math.ceil(TM.ids(k).length / 6);
      if (b === 'A') {
        this.page++;
        if (this.page >= pages) { this.page = 0; this.cat = (this.cat + 1) % TM.genetics.KEYS.length; }
        TM.sfx('beep');
      }
      if (b === 'B') { this.cat = (this.cat + 1) % TM.genetics.KEYS.length; this.page = 0; TM.sfx('beep'); }
      if (b === 'C') { TM.sfx('cancel'); back(); }
    },
    tap(x, y) { if (y < 18) return this.btn('C'); this.btn(x < 64 ? 'B' : 'A'); },
  };
})();
