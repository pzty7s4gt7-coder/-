'use strict';
/* =========================================================
 *  白室十日 — タイトル画面と起動
 * ========================================================= */

const CHAPTERS = [
  { script:'day1', label:'DAY 1', title:'観察' },
  { script:'day2', label:'DAY 2', title:'数' },
  { script:'day3', label:'DAY 3', title:'言葉' },
  { script:'day4', label:'DAY 4', title:'順序' },
  { script:'day5', label:'DAY 5', title:'嘘' },
  { script:'day6', label:'DAY 6', title:'記憶' },
  { script:'day7', label:'DAY 7', title:'鏡' },
  { script:'day8', label:'DAY 8', title:'時間' },
  { script:'day9', label:'DAY 9', title:'空白' },
  { script:'day10', label:'DAY 10', title:'ふたり' },
  { script:'end_true', label:'END', title:'TRUE' },
  { script:'end_normal', label:'END', title:'NORMAL' },
  { script:'end_bad', label:'END', title:'BAD' },
];

/* 途中の日から始めるときは、それまでの部屋を解いた扱いにする */
function chapterPreset(script){
  const m = script.match(/^day(\d+)$/);
  const days = m ? +m[1] - 1 : 10;
  const p = { answers:{}, letters:{}, history:[], aff: days * 7, totalMiss: days, totalHint: Math.floor(days / 2) };
  for(let i = 1; i <= days; i++){
    p.answers[i] = ROOMS[i].answerText; p.letters[i] = ROOMS[i].letter;
    p.history.push({ day:i, gain:7, cap:8, miss:1, hint:0 });
  }
  if(script === 'end_true') p.aff = 85;
  if(script === 'end_normal') p.aff = 55;
  if(script === 'end_bad'){ p.aff = 20; p.totalMiss = 17; p.totalHint = 11; p.flags = { doubted:true, leftalone:true }; }
  return p;
}

$('#title').addEventListener('click', e => {
  const k = e.target.dataset && e.target.dataset.title; if(!k) return;
  Snd.init(); Snd.play('click');
  switch(k){
    case 'new': newGame('day1'); break;
    case 'continue': { const key = latestSave(); if(key) loadFrom(key); break; }
    case 'load': openLoad(); break;
    case 'config': openConfig(); break;
    case 'chapter': {
      const b = openModal(`<h2>チャプター選択<small>途中の日から読む（好感度は仮の値になります）</small></h2>
        <div class="chap">${CHAPTERS.map((c, i) => `<button data-i="${i}"><b>${c.label}</b><span>${esc(c.title)}</span></button>`).join('')}</div>`);
      b.querySelectorAll('[data-i]').forEach(x => x.onclick = () => {
        const c = CHAPTERS[+x.dataset.i];
        closeModal(); newGame(c.script, chapterPreset(c.script));
      });
      break;
    }
    case 'endings': {
      const seen = store.get('hk_endings') || {};
      openModal(`<h2>エンディング記録</h2><ul class="endlist">${['true', 'normal', 'bad'].map(k => {
        const e = END_INFO[k];
        return `<li class="${seen[k] ? '' : 'locked'}"><b>${e.kind}</b>${seen[k] ? esc(e.title) : '？？？？？'}</li>`;
      }).join('')}</ul><p class="muted" style="margin-top:14px">一日ごとに「広との距離」の上限があります。扉の前で間違えたり、ヒントに頼るほど、その日の上限は下がります。</p>`);
      break;
    }
  }
});

toTitle();
