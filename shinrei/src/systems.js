/* =========================================================
   systems: camera, menu, hints, puzzles, title, novel, save
   ========================================================= */

/* ---------- camera ---------- */
const PHOTO_QUIPS=[
  'ハッ、しょっぱ。これじゃいいね３つが限界だな。','……何も写ってねえ。いや、写ってねえのが一番怖いって言うけど、普通につまんねえ。',
  '構図はいい。構図だけはな。','フラッシュで目がチカチカする。……アタシの目がな。','ボツ。心霊どころか生活感しかねえ。',
  '「#廃校　#エモい」……いや、エモくはねえな。','ノイズが人の顔に見え……ないな。見えねえわ。',
];
const PHOTO_CAPS=['なんでもない一枚','ボツ写真','ピンぼけ','記録用','いいね 0','バズらない'];
async function takePhoto(){
  const[fx,fy]=facing();const isCat=G.cat.on&&G.cat.x===fx&&G.cat.y===fy;
  const e=isCat?null:targetAt(fx,fy,'photo');
  SE.shutter();flash(1.3);G.photos++;
  const info=isCat?{cat:true}:e?(e.photo()||{}):{};
  const pc=makePhoto(fx,fy,info);await sleep(260);
  const s=pxScale();const w=document.createElement('div');w.className='polaroid';pc.className='pixcv';pc.style.width=Math.min(128*s*1.5,innerWidth*.7)+'px';w.appendChild(pc);
  const cap=document.createElement('div');cap.className='cap';cap.textContent=info.cap||pick(PHOTO_CAPS);w.appendChild(cap);
  const d=openOv(w,'');d.style.cssText='background:none;border:0';d.addEventListener('pointerdown',ev=>{ev.stopPropagation();press('ok')});
  if(info.scare){await sleep(500);SE.scare();glitch(.5)}
  await waitKey();closeOv();
  if(isCat)await catPhotoTalk();else if(info.after)await info.after();else await M(pick(PHOTO_QUIPS));
  end()}
function makePhoto(fx,fy,info){
  const W=128,H=96,tmp=mk(VW,VH);drawScene(tmp.getContext('2d'),{noCat:true});
  const pc=mk(W,H),c=pc.getContext('2d');
  const sx=clamp(fx*16+8-G.camX-W/2,0,VW-W),sy=clamp(fy*16+8-G.camY-H/2,0,VH-H);
  c.drawImage(tmp,sx,sy,W,H,0,0,W,H);
  const gx=fx*16-G.camX-sx,gy=fy*16-G.camY-sy;
  if(info.ghost==='yuki'){c.globalAlpha=.55;c.drawImage(SPR.yuki,gx+(info.gdx||0),gy-8+(info.gdy||0));c.globalAlpha=1}
  if(info.ghost==='face'){c.globalAlpha=.5;c.drawImage(SPR.yukiFace,gx-8+(info.gdx||0),gy-10+(info.gdy||0),32,32);c.globalAlpha=1}
  if(info.ghost==='hand'){c.globalAlpha=.7;c.drawImage(SPR.hand,gx+2,gy-9);c.globalAlpha=1}
  if(info.ghost==='hands'){c.globalAlpha=.6;for(let i=0;i<14;i++){c.save();c.translate(8+((i*37)%112),8+((i*53)%80));c.rotate((i%4)*.6-.9);c.drawImage(SPR.hand,-8,-8);c.restore()}c.globalAlpha=1}
  if(info.write){c.font='12px DotGothic16, monospace';c.fillStyle='rgba(225,236,250,.85)';c.textBaseline='top';c.fillText(info.write,gx-18,gy+2)}
  const id=c.getImageData(0,0,W,H),d=id.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const o=(y*W+x)*4,dx=(x-W/2)/(W/2),dy=(y-H/2)/(H/2),dist=Math.sqrt(dx*dx+dy*dy);
    const gain=clamp(2.3-dist*1.5,.35,2.3),g=(d[o]*.3+d[o+1]*.59+d[o+2]*.11),n=(Math.random()*2-1)*14;
    let r=(d[o]*.6+g*.4)*gain*1.06+n,gg=(d[o+1]*.6+g*.4)*gain+n,b=(d[o+2]*.6+g*.4)*gain*.9+n;
    if(info.red){r=r*1.2+20;gg*=.55;b*=.55}
    d[o]=clamp(r,0,255);d[o+1]=clamp(gg,0,255);d[o+2]=clamp(b,0,255)}
  c.putImageData(id,0,0);
  if(info.cat){c.globalAlpha=.25;c.fillStyle='#000';c.fillRect(0,0,W,H);c.globalAlpha=1}
  const now=new Date();stamp(c,info.date||`'${String(now.getFullYear()).slice(2)} ${now.getMonth()+1} ${now.getDate()}`,W-44,H-9,'#ff9a30');
  return pc}
async function catPhotoTalk(){
  if(!G.flags.catPhoto2){G.flags.catPhoto2=1;await M('……やっぱ写らねえ。お前、本当に何なの？');await A('被写体に許可を取れ。常識だろ。');await M('廃校に不法侵入してる女に常識を説くな。')}
  else await A(pick(['撮るな。','写らないって言ってるだろ。フィルムの無駄だ。','……デジタルだからタダ、とか言うなよ。','しつこい。','私を撮っても、あんたしか写らないよ。背景としてな。']))}

/* ---------- generic menu panel ---------- */
function menuPanel(title,opts,{sub='',sel=0,cancel=true}={}){return new Promise(res=>{
  const box=document.createElement('div');box.className='menu';if(title){const h=document.createElement('h3');h.textContent=title;box.appendChild(h)}
  let i=sel;const bs=opts.map((o,k)=>{const b=document.createElement('button');b.textContent=o;b.onclick=e=>{e.stopPropagation();i=k;done(k)};box.appendChild(b);return b});
  if(sub){const s=document.createElement('div');s.className='sub';s.innerHTML=sub;box.appendChild(s)}
  const d=openOv(box);d.addEventListener('pointerdown',e=>e.stopPropagation());
  const upd=()=>bs.forEach((b,k)=>b.classList.toggle('sel',k===i));upd();
  const h=k=>{if(k==='up'){i=(i+opts.length-1)%opts.length;SE.cursor();upd()}else if(k==='down'){i=(i+1)%opts.length;SE.cursor();upd()}else if(k==='ok')done(i);else if(k==='cancel'&&cancel){SE.cancel();done(-1)}};
  function done(k){UI.splice(UI.indexOf(h),1);if(k>=0)SE.ok();closeOv();res(k)}
  UI.push(h)})}
async function openMenu(){SE.ok();let sel=0;
  for(;;){const k=await menuPanel('メニュー',['アイテム','アキに聞く（ヒント）','セーブ','音：'+(muted?'OFF':'ON'),'タイトルにもどる','とじる'],{sel,sub:`撮った写真 ${G.photos}枚<br>ミサカの被害 ${G.dmg}回`});
    if(k<0||k===5)return;sel=k;
    if(k===0){const r=await itemMenu();if(r==='used')return}
    else if(k===1){await askHint();return}
    else if(k===2){const ok=saveGame();SE[ok?'item':'locked']();await N(ok?'記録した。……この夜のことを。':'セーブできなかった。（この環境では保存が使えないようだ）');end()}
    else if(k===3){muted=!muted;if(!muted)SE.ok()}
    else if(k===4){const c=await menuPanel('タイトルにもどる？',['もどる（セーブしていない進行は消える）','やめる'],{sel:1});if(c===0){await fade(1,400);toTitle();return}}}}
async function itemMenu(){if(!G.items.length){await N('何も持っていない。スマホとカメラと、根拠のない自信だけだ。');end();return}
  const k=await menuPanel('アイテム',G.items.map(i=>ITEMS[i].n));if(k<0)return;const id=G.items[k];
  const c=await menuPanel(ITEMS[id].n,['使う','やめる'],{sub:ITEMS[id].d});if(c!==0)return;await useItem(id);end();return 'used'}
async function useItem(id){const[fx,fy]=facing();const e=targetAt(fx,fy,'use');
  if(e&&e.use[id]){await e.use[id]();return}
  const f=ITEM_USE[id];if(f){await f();return}
  await N('ここで使っても、何も起きない。');}

/* ---------- hints (Aki) ---------- */
async function askHint(){G.hints++;
  const pre=G.hints===1?['……聞くのか。いいよ。']:G.hints>6?['またか。ヒント代はツナで払え。','ミサカ。プライドって言葉、知ってるか？','猫に頼る記者。いい見出しだな。']:['やれやれ。','はいはい。','自分の頭で考える、という選択肢は？','……ため息が出るな。猫なのに。'];
  await A(pick(pre));
  const h=HINTS.find(h=>h.when());const tier=(G.flags['hint_'+h.id]=(G.flags['hint_'+h.id]||0)+1);
  const lines=tier>=2&&h.b?h.b:h.a;for(const l of lines)await say(l[0],l[1],l[2]);
  if(tier===1&&h.b)await A('{d}（もう一回聞けば、もっとはっきり言ってやる。……屈辱と引き換えにな）{/}');
  end()}

/* ---------- direction lock ---------- */
function dirLock(){return new Promise(res=>{const seq=[];const ar={up:'↑',down:'↓',left:'←',right:'→'};
  const d=openOv(`<h3>方向式南京錠</h3><div class="slots"><span></span><span></span><span></span><span></span></div>
  <div class="row"><button class="ovbtn" data-d="up">↑</button><button class="ovbtn" data-d="left">←</button><button class="ovbtn" data-d="down">↓</button><button class="ovbtn" data-d="right">→</button></div>
  <div class="row"><button class="ovbtn" data-d="back">消す</button><button class="ovbtn" data-d="quit">やめる</button></div><div class="cap">十字キーで４回入力</div>`);
  d.addEventListener('pointerdown',e=>e.stopPropagation());
  const sl=[...d.querySelectorAll('.slots span')];const upd=()=>sl.forEach((s,i)=>s.textContent=seq[i]?ar[seq[i]]:'');
  const h=k=>{if(k in ar){if(seq.length<4){seq.push(k);SE.cursor();upd();if(seq.length===4){UI.splice(UI.indexOf(h),1);setTimeout(()=>{closeOv();res(seq)},350)}}}
    else if(k==='cancel'||k==='back'){if(seq.length&&k!=='quit'){seq.pop();SE.cancel();upd()}else{UI.splice(UI.indexOf(h),1);closeOv();res(null)}}
    else if(k==='quit'){UI.splice(UI.indexOf(h),1);closeOv();res(null)}};
  d.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),120);h(b.dataset.d)});
  UI.push(h)})}

/* ---------- eye chart & music sheet art ---------- */
function ring(c,cx,cy,r,t,gap,col){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.sqrt(x*x+y*y);if(d>r+.3||d<r-t+.3)continue;
  const g=Math.max(1,Math.round(t*.5));if(gap==='right'&&x>0&&Math.abs(y)<g)continue;if(gap==='left'&&x<0&&Math.abs(y)<g)continue;if(gap==='up'&&y<0&&Math.abs(x)<g)continue;if(gap==='down'&&y>0&&Math.abs(x)<g)continue;P(c,cx+x,cy+y,col)}}
const CHART_MARK=[['left',1],['down',3],['right',4],['up',6]]; // [direction seen directly, row]
function eyeChart(mirror){const W=104,H=150,cv2=mk(W,H),c=cv2.getContext('2d');
  if(mirror){c.translate(W,0);c.scale(-1,1)}
  R(c,0,0,W,H,mirror?'#4a5a66':'#1b1a20');R(c,6,4,W-12,H-8,'#e2ddcd');R(c,6,H-5,W-12,1,'#a09a8a');
  c.font='10px DotGothic16, monospace';c.fillStyle='#2a2320';c.textBaseline='top';c.fillText('視 力 検 査 表',22,7);
  const rows=[[6,2],[5,2],[5,3],[4,3],[3,4],[3,4],[2,5],[2,5]];const dirs=['up','right','down','left'];let y=24;
  rows.forEach(([r,cnt],ri)=>{const lab=['0.1','0.2','0.3','0.4','0.5','0.7','0.9','1.0'][ri];stamp(c,lab,9,y+r-2,'#6a6458');
    const span=(cnt-1)*(r*2+6);let x=58-span/2;
    for(let k=0;k<cnt;k++){const mk2=CHART_MARK.find(m=>m[1]===ri);const special=mk2&&k===((ri*7)%cnt);const dir=special?mk2[0]:dirs[(ri*3+k*5+1)%4];
      ring(c,Math.round(x),y+r,r,Math.max(1,Math.round(r/2.6)),dir,'#1e1b1a');
      if(special){for(let a=0;a<40;a++){const an=a/40*Math.PI*2;P(c,Math.round(x+Math.cos(an)*(r+3)),Math.round(y+r+Math.sin(an)*(r+3)),'#c01828')}}
      x+=r*2+6}
    y+=r*2+5});
  c.fillStyle='#b01828';c.font='9px DotGothic16, monospace';c.fillText('※検査は鏡越しに',24,H-19);
  if(mirror){c.setTransform(1,0,0,1,0,0);c.globalAlpha=.16;c.drawImage(SPR.yukiFace,W-38,H-50,32,32);c.globalAlpha=.12;R(c,0,0,W,H,'#8ab');c.globalAlpha=1}
  return cv2}
const SHEET=[2,4,5,4,2,0]; // ミソラソミド (index into do-re-mi)
function sheetArt(){const W=124,H=56,c2=mk(W,H),c=c2.getContext('2d');R(c,0,0,W,H,'#e0d9c6');R(c,0,H-1,W,1,'#a09880');
  for(let i=0;i<5;i++)R(c,4,14+i*6,W-8,1,'#4a4038');
  // treble clef (pixel)
  [[10,10],[11,9],[12,10],[12,12],[11,14],[10,16],[9,18],[9,21],[10,23],[12,24],[14,23],[14,21],[12,20],[10,21],[11,26],[11,30],[11,34],[10,36],[9,35]].forEach(([a,b])=>{R(c,a,b,2,2,'#2a2320')});
  const staffY=idx=>38-idx*3;const idxOf=[-2,-1,0,1,2,3,4,5];
  SHEET.forEach((n,i)=>{const x=28+i*15,y=staffY(idxOf[n]);if(idxOf[n]<=-2)R(c,x-3,staffY(-2),10,1,'#4a4038');R(c,x,y-1,5,3,'#1e1916');R(c,x+1,y-2,3,5,'#1e1916');R(c,x+4,y-11,1,11,'#1e1916')});
  R(c,W-6,14,1,25,'#2a2320');R(c,W-4,14,2,25,'#2a2320');
  c.globalAlpha=.55;R(c,86,30,9,7,'#7a1020');R(c,90,36,3,9,'#7a1020');P(c,96,33,'#7a1020');c.globalAlpha=1;
  return c2}
function piano(){return new Promise(res=>{const names=['ド','レ','ミ','ファ','ソ','ラ','シ','ド'],fq=[261.6,293.7,329.6,349.2,392,440,493.9,523.3];let sel=0,seq=[];
  const wrap=document.createElement('div');const sh=sheetArt();sh.className='pixcv';sh.style.width=Math.min(124*pxScale()*1.1,innerWidth*.8)+'px';wrap.appendChild(sh);
  const played=document.createElement('div');played.className='cap';played.style.textAlign='center';played.textContent='　';wrap.appendChild(played);
  const keys=document.createElement('div');keys.className='keys';const bs=names.map((n,i)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{sel=i;upd();hit(i)};keys.appendChild(b);return b});wrap.appendChild(keys);
  const cap=document.createElement('div');cap.className='cap';cap.textContent='←→で選んで決定（タップでも弾ける）　B：やめる';wrap.appendChild(cap);
  const d=openOv(wrap);d.addEventListener('pointerdown',e=>e.stopPropagation());
  const upd=()=>bs.forEach((b,i)=>b.classList.toggle('sel',i===sel));upd();
  function hit(i){SE.piano(fq[i]);bs[i].classList.add('hit');setTimeout(()=>bs[i].classList.remove('hit'),150);seq.push(i);played.textContent=seq.map(k=>names[k]).join('・');
    if(seq.length===6){UI.splice(UI.indexOf(h),1);const ok=seq.every((v,k)=>v===SHEET[k]||(SHEET[k]===0&&v===7&&false));setTimeout(()=>{closeOv();res(ok)},900)}}
  const h=k=>{if(k==='left'){sel=(sel+7)%8;upd()}else if(k==='right'){sel=(sel+1)%8;upd()}else if(k==='ok')hit(sel);else if(k==='cancel'){UI.splice(UI.indexOf(h),1);closeOv();res(null)}};
  UI.push(h)})}

/* ---------- novel view (prologue / endings) ---------- */
const novelEl=$('#novel');
async function novel(lines){novelEl.hidden=false;novelEl.innerHTML='';hideMsg();{const f=$('#fade');f.style.transition='none';f.style.opacity=0}
  const tap=document.createElement('div');tap.className='tap';tap.textContent='▼';
  const names={m:'ミサカ',a:'アキ',y:()=>G.flags.yukiNamed?'ユキ':'？？？'},cls={m:'misaka',a:'aki',y:'yuki'};
  for(let l of lines){
    if(l==='---'){novelEl.innerHTML='';continue}
    if(typeof l==='function'){await l();continue}
    const p=document.createElement('p');let t=l,b='blipN';
    const m=/^([may]):(.*)$/s.exec(l);
    if(m){const n=typeof names[m[1]]==='function'?names[m[1]]():names[m[1]];t=`${n}「${m[2]}」`;p.className='say '+cls[m[1]];b={m:'blip',a:'blipA',y:'blipY'}[m[1]]}
    else if(l[0]==='#'){t=l.slice(1);p.className='big'}else if(l[0]==='~'){t=l.slice(1);p.className='dim'}else if(l[0]==='^'){t=l.slice(1);p.className='c'}
    novelEl.appendChild(p);while(novelEl.querySelectorAll('p').length>9)novelEl.querySelector('p').remove();
    let skip=false;const hk=k=>{if(k==='ok'||k==='cancel')skip=true};UI.push(hk);let n=0;
    for(const ch of t){if(skip){p.textContent=t;break}p.textContent+=ch;if(ch.trim()&&n++%2===0)SE[b]();await sleep(ch==='。'||ch==='…'?110:30)}
    UI.splice(UI.indexOf(hk),1);novelEl.appendChild(tap);await sleep(80);await waitKey();tap.remove();SE.cursor()}
}
function closeNovel(){novelEl.hidden=true;novelEl.innerHTML=''}

/* ---------- save / load ---------- */
const SAVE_KEY='shinrei-moreru-save-v1',END_KEY='shinrei-moreru-endings-v1';
function snapshot(){return{map:G.mapId,x:G.p.x,y:G.p.y,dir:G.p.dir,items:G.items,flags:G.flags,k:G.k,dmg:G.dmg,photos:G.photos,hints:G.hints,cat:G.cat.on,pushSaved:G.pushSaved}}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));return true}catch(e){return false}}
function readSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null}catch(e){return null}}
function readEndings(){try{return JSON.parse(localStorage.getItem(END_KEY)||'[]')}catch(e){return[]}}
function addEnding(n){try{const a=readEndings();if(!a.includes(n))a.push(n);localStorage.setItem(END_KEY,JSON.stringify(a))}catch(e){}}
function resetState(){G.phoneRing=false;G.fx.dark=0;Object.assign(G,{items:[],flags:{},k:{g:0,e:0,t:0},dmg:0,photos:0,hints:0,pushSaved:{},busy:false,path:null,pathAct:null});G.queue.length=0;G.cat.on=false;G.p.visible=true}
async function resume(s){resetState();Object.assign(G,{items:s.items||[],flags:s.flags||{},k:s.k||{g:0,e:0,t:0},dmg:s.dmg||0,photos:s.photos||0,hints:s.hints||0,pushSaved:s.pushSaved||{}});
  G.cat.on=!!s.cat;loadMap(s.map);placePlayer(s.x,s.y,s.dir||0);G.mode='play';updateCam();$('#title').hidden=true;closeNovel();await fade(0,400);where(G.m.name)}

/* ---------- title ---------- */
function drawTitle(){const c=ctx,t=G.anim;
  for(let y=0;y<VH;y++){const k=y/VH;const a=[10+k*20,8+k*6,24+k*18];c.fillStyle=`rgb(${a[0]|0},${a[1]|0},${a[2]|0})`;c.fillRect(0,y,VW,1)}
  for(let i=0;i<40;i++){const x=(i*73)%VW,y=(i*41)%110;if((t+i*13)%90<80)P(c,x,y,i%7?'#6a6a90':'#d0d0f0')}
  c.fillStyle='#e8e4d0';for(let y=-16;y<=16;y++)for(let x=-16;x<=16;x++)if(x*x+y*y<=256)P(c,206+x,40+y,(x-5)*(x-5)+(y+4)*(y+4)<18||(x+6)*(x+6)+(y-6)*(y-6)<10?'#c8c4b0':'#e8e4d0');
  for(let i=0;i<3;i++){const cx=((t*.15+i*110)%(VW+80))-40,cy=30+i*18;c.fillStyle='rgba(30,26,50,.85)';c.fillRect(cx,cy,60,5);c.fillRect(cx+10,cy-3,34,3);c.fillRect(cx+6,cy+5,44,2)}
  R(c,0,150,VW,42,'#07060c');R(c,30,96,196,56,'#0d0c14');R(c,110,70,36,30,'#0d0c14');R(c,120,60,16,12,'#0d0c14');R(c,126,52,4,8,'#0d0c14');
  c.fillStyle='#c8c0a0';for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)if(x*x+y*y<=16)P(c,128+x,80+y,'#9a9480');P(c,128,78,'#1a1a1a');P(c,129,80,'#1a1a1a');
  for(let r=0;r<3;r++)for(let k=0;k<12;k++){const wx=38+k*15+(k>5?8:0),wy=102+r*15;const red=(r===1&&k===9);const on=red&&((t>>4)%9!==0);
    R(c,wx,wy,9,9,on?'#e02a3a':'#161826');if(on){c.fillStyle='rgba(224,42,58,.18)';c.fillRect(wx-6,wy-6,21,21)}R(c,wx+4,wy,1,9,'#0d0c14')}
  for(let x=0;x<VW;x+=6)R(c,x,160,2,14,'#15131c');R(c,0,162,VW,2,'#15131c');
  R(c,150,176,6,4,'#000');R(c,151,173,1,3,'#000');R(c,154,173,1,3,'#000');P(c,152,175,'#a6f23c');P(c,154,175,'#a6f23c');R(c,156,177,4,1,'#000');
}
async function toTitle(){G.mode='title';G.m=null;UI.length=0;G.busy=false;hideMsg();closeOv();closeNovel();
  $('#title').hidden=false;await fade(0,500);
  const ends=readEndings();$('#cleared').textContent=ends.length?`回収したエンド ${ends.length}/3　`+['善','悪','謎'].map((n,i)=>ends.includes(i+1)?n:'？').join(' '):'';
  const sv=readSave();const opts=['はじめから'].concat(sv?['つづきから']:[]).concat(['あそびかた']);
  const tm=$('#tmenu');let i=0;tm.innerHTML='';
  const bs=opts.map((o,k)=>{const b=document.createElement('button');b.textContent=o;b.onclick=e=>{e.stopPropagation();i=k;go()};tm.appendChild(b);return b});
  const upd=()=>bs.forEach((b,k)=>b.classList.toggle('sel',k===i));upd();
  const h=k=>{if(k==='up'){i=(i+opts.length-1)%opts.length;SE.cursor();upd()}else if(k==='down'){i=(i+1)%opts.length;SE.cursor();upd()}else if(k==='ok')go()};
  async function go(){const o=opts[i];if(o==='あそびかた'){SE.ok();UI.splice(UI.indexOf(h),1);await howTo();UI.push(h);return}
    UI.splice(UI.indexOf(h),1);SE.ok();await fade(1,600);$('#title').hidden=true;
    if(o==='つづきから')await resume(sv);else newGame()}
  UI.push(h)}
async function howTo(){await showDoc('あそびかた',`廃校に閉じ込められた記者・縦内ミサカを動かして、脱出を目指します。
追いかけてくる敵も、時間制限もありません。

<b>移動</b>　十字キー／WASD（Shiftでダッシュ）
　　　スマホは十字ボタン、または画面の行きたい場所をタップ
<b>調べる</b>　Z・Enter・Space／Aボタン（向いている物を調べる）
<b>撮る</b>　C／◉ボタン（向いている物を撮影。写るはずのないものが写ることも）
<b>メニュー</b>　X・Esc／Bボタン（アイテム・セーブ）
<b>ヒント</b>　H／猫ボタン（アキに聞く。煽られます）

何を「して」、何を「しなかった」か。
その積み重ねで、たどり着く夜明けが変わります。
（エンディングは３種類）`,{paper:false})}
