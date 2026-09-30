/* =========================================================
   runtime: state, maps, rendering, lighting, input, UI
   ========================================================= */
const DIRS=[[0,1],[-1,0],[1,0],[0,-1]]; // down,left,right,up
const G={mode:'boot',mapId:null,m:null,
  p:{x:0,y:0,ox:0,oy:0,px:0,py:0,dir:0,moving:false,t:0,walk:0,visible:true},
  cat:{x:0,y:0,ox:0,oy:0,px:0,py:0,dir:0,moving:false,t:0,on:false,walk:0},
  items:[],flags:{},k:{g:0,e:0,t:0},dmg:0,photos:0,hints:0,busy:false,queue:[],path:null,pathAct:null,
  fx:{shake:0,mag:2,flash:0,glitch:0,flick:0,dark:0},anim:0,camX:0,camY:0,held:[],dash:false,phoneRing:false,pushSaved:{}};
const MAPS={};
const ITEMS={
  key_staff:{n:'職員室の鍵',d:'タグに「職員室」。持ち手が妙にあったかい。'},
  key_nurse:{n:'保健室の鍵',d:'「保健室」の札。風もないのに揺れていた。'},
  key_dark:{n:'暗室の鍵',d:'「写真部　暗室」。鍵盤蓋の裏にテープで留めてあった。'},
  tuna:{n:'ツナ缶',d:'賞味期限 2004.10。猫缶の山の中に一つだけ混じっていた。'},
  doll:{n:'うさぎのぬいぐるみ',d:'手縫い。首のタグに丸っこい字で「ユキ」。'},
  bucket:{n:'バケツ（空）',d:'トイレの掃除用具入れにあった。底に「清掃当番 二年A組」。'},
  water:{n:'水入りバケツ',d:'さっきまで赤かった水。今は透明……のはず。'},
  eraser:{n:'黒板消し',d:'チョークの粉がまだ白い。二十年ぶんの誰かの字が染みている。'},
  coins:{n:'小銭（832円）',d:'募金箱から抜いた。十円玉が妙に冷たい。'},
};
const has=id=>G.items.includes(id);
function give(id){if(!has(id))G.items.push(id)}
function take(id){G.items=G.items.filter(i=>i!==id)}

/* ---------- map loading ---------- */
function loadMap(id){
  const def=MAPS[id];const m={id,...def,t:def.rows.map(r=>r.split(''))};m.h=m.t.length;m.w=m.t[0].length;
  m.t.forEach((r,i)=>{if(r.length!==m.w)console.warn('row width',id,i,r.length)});
  m.events=def.events().filter(Boolean).map(e=>({dir:0,...e,ox:e.x,oy:e.y,t:1}));
  if(def.mutate)def.mutate(m);
  // restore saved pushables
  const ps=G.pushSaved[id];if(ps)for(const e of m.events)if(e.push&&ps[e.id]){e.x=e.ox=ps[e.id][0];e.y=e.oy=ps[e.id][1]}
  G.m=m;G.mapId=id;buildLayer();
}
function buildLayer(){const m=G.m;m.layer=mk(m.w*16,m.h*16);const c=m.layer.getContext('2d');for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)drawTile(c,m,x,y)}
function setTile(x,y,ch){G.m.t[y][x]=ch;const c=G.m.layer.getContext('2d');for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const tx=x+dx,ty=y+dy;if(tx>=0&&ty>=0&&tx<G.m.w&&ty<G.m.h)drawTile(c,G.m,tx,ty)}}
const live=e=>!e.cond||e.cond();
const solidE=e=>typeof e.solid==='function'?e.solid():!!e.solid;
function evAt(x,y,pred){return G.m.events.find(e=>e.x===x&&e.y===y&&live(e)&&(!pred||pred(e)))}
function passable(x,y){return PASS.has(tileOf(G.m,x,y))}
function blocked(x,y){return !passable(x,y)||!!evAt(x,y,solidE)}

/* ---------- movement ---------- */
function placePlayer(x,y,dir){const p=G.p;Object.assign(p,{x,y,ox:x,oy:y,px:x*16,py:y*16,dir,moving:false,t:0});
  const c=G.cat;const[bx,by]=DIRS[dir];let cx=x-bx,cy=y-by;if(blocked(cx,cy)){cx=x;cy=y}Object.assign(c,{x:cx,y:cy,ox:cx,oy:cy,px:cx*16,py:cy*16,dir,moving:false,t:0})}
function startMove(nx,ny){const p=G.p;p.ox=p.x;p.oy=p.y;p.x=nx;p.y=ny;p.moving=true;p.t=0;
  const c=G.cat;if(c.on){const d=Math.abs(c.x-p.ox)+Math.abs(c.y-p.oy);if(d>2){c.x=c.ox=p.ox;c.y=c.oy=p.oy}else if(d>0){c.ox=c.x;c.oy=c.y;c.x=p.ox;c.y=p.oy;c.moving=true;c.t=0;
    c.dir=c.x>c.ox?2:c.x<c.ox?1:c.y>c.oy?0:3}}}
function tryMove(dir){const p=G.p;p.dir=dir;const[dx,dy]=DIRS[dir],nx=p.x+dx,ny=p.y+dy;
  const e=evAt(nx,ny,solidE);
  if(e){if(e.push&&!e.fixed&&(!e.canPush||e.canPush())){const bx=nx+dx,by=ny+dy;
      if(!blocked(bx,by)){e.ox=e.x;e.oy=e.y;e.x=bx;e.y=by;e.t=0;SE.push();startMove(nx,ny);if(e.onPush)run(()=>e.onPush(e));return true}}
    if(e.bump){run(e.bump);G.path=null;return false}SE.bump();G.path=null;return false}
  if(!passable(nx,ny)){G.path=null;return false}
  startMove(nx,ny);return true}
function arrive(){const p=G.p;SE.step();
  const e=G.m.events.find(e=>e.x===p.x&&e.y===p.y&&live(e)&&e.touch);if(e){G.path=null;run(e.touch);return}
  for(const z of (G.m.zones||[])){if(z.once&&G.flags[z.once])continue;if(!z.cond||z.cond()){if(p.x>=z.x&&p.x<z.x+(z.w||1)&&p.y>=z.y&&p.y<z.y+(z.h||1)){if(z.once)G.flags[z.once]=1;G.path=null;run(z.run);return}}}
  if(G.path&&!G.path.length){G.path=null;if(G.pathAct){const a=G.pathAct;G.pathAct=null;p.dir=a.dir;act()}}}

/* ---------- running scripts ---------- */
async function run(fn){if(G.busy)return;G.busy=true;G.path=null;try{await fn()}catch(err){console.error(err)}G.busy=false;G.queue.length=0;if(!UI.length)hideMsg()}

/* ---------- facing & actions ---------- */
function facing(){const p=G.p,[dx,dy]=DIRS[p.dir];return[p.x+dx,p.y+dy]}
function targetAt(fx,fy,key){let e=evAt(fx,fy,e=>e[key]);if(!e&&G.p.dir===3){const t=tileOf(G.m,fx,fy);if(t==='V'||t==='t'||t==='O')e=evAt(fx,fy-1,e=>e[key])}return e}
function act(){const[fx,fy]=facing();
  if(G.cat.on&&G.cat.x===fx&&G.cat.y===fy&&!G.cat.moving){run(talkAki);return}
  const e=targetAt(fx,fy,'act');if(e){run(e.act);return}
  let ch=tileOf(G.m,fx,fy);if(G.p.dir===3&&(ch==='V'))ch=tileOf(G.m,fx,fy-1);
  const f=FLAVOR[ch];if(f)run(async()=>{const l=pick(f);if(typeof l==='string')await N(l);else await say(l[0],l[1],l[2])})}

/* ---------- camera ---------- */
function updateCam(){const m=G.m,p=G.p,W=m.w*16,H=m.h*16;
  G.camX=W<=VW?Math.round((W-VW)/2):clamp(Math.round(p.px+8-VW/2),0,W-VW);
  G.camY=H<=VH?Math.round((H-VH)/2):clamp(Math.round(p.py+8-VH/2+14),0,H-VH)}

/* ---------- render ---------- */
function drawScene(c,opt={}){const m=G.m;c.fillStyle='#000';c.fillRect(0,0,VW,VH);if(!m)return;
  const cx=G.camX,cy=G.camY;c.drawImage(m.layer,-cx,-cy);
  const list=[];
  for(const e of m.events){if(!live(e)||(!e.art&&!e.draw)||e.hidden)continue;const t=e.t??1;const px=(e.ox+(e.x-e.ox)*t)*16,py=(e.oy+(e.y-e.oy)*t)*16;list.push({z:py+(e.z||0),d:()=>{const f=e.draw||ART[e.art];f(c,Math.round(px-cx+(e.dx||0)),Math.round(py-cy+(e.dy||0)),e)}})}
  const p=G.p;if(p.visible)list.push({z:p.py+1,d:()=>{const f=p.moving?[0,1,2,1][(p.walk>>3)%4]:1;c.drawImage(SPR.misaka[p.dir][f],Math.round(p.px-cx),Math.round(p.py-cy-8))}});
  const k=G.cat;if(k.on&&!opt.noCat)list.push({z:k.py+.5,d:()=>{const f=k.moving?((k.walk>>3)%2):0;c.drawImage(SPR.aki[k.dir][f],Math.round(k.px-cx),Math.round(k.py-cy+1))}});
  list.sort((a,b)=>a.z-b.z).forEach(o=>o.d());
  if(m.over)m.over(c,cx,cy);
}
/* lighting: half-res dithered darkness */
const LW=128,LH=96,lc=mk(LW,LH),lx=lc.getContext('2d'),lid=lx.createImageData(LW,LH);
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
function drawLight(){const m=G.m;if(!m)return;const amb=clamp((m.amb??.8)+G.fx.dark,0,1);if(amb<=0)return;
  const L=[];const p=G.p,[dx,dy]=DIRS[p.dir];
  let r=m.lamp??58;if(G.fx.flick>0&&Math.random()<.5)r*=.25;else r+=Math.sin(G.anim*.13)*1.2;
  L.push([(p.px+8-G.camX+dx*10)/2,(p.py+4-G.camY+dy*10)/2,r/2,1]);
  L.push([(p.px+8-G.camX)/2,(p.py+2-G.camY)/2,11,.9]);
  const x0=Math.max(0,G.camX>>4),x1=Math.min(m.w-1,(G.camX+VW)>>4),y0=Math.max(0,G.camY>>4),y1=Math.min(m.h-1,(G.camY+VH)>>4);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const ch=m.t[ty][tx];if(ch==='w')L.push([(tx*16+8-G.camX)/2,(ty*16+22-G.camY)/2,15,.55]);else if(ch==='l')L.push([(tx*16+8-G.camX)/2,(ty*16+10-G.camY)/2,30,.8])}
  if(m.lights)for(const q of m.lights())L.push([(q[0]-G.camX)/2,(q[1]-G.camY)/2,q[2]/2,q[3]]);
  const d=lid.data,[cr,cg,cb]=m.dark||[5,4,10];
  for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){let l=0;for(let i=0;i<L.length;i++){const q=L[i],ddx=x-q[0],ddy=y-q[1],d2=ddx*ddx+ddy*ddy,rr=q[2]*q[2];if(d2<rr){const v=(1-Math.sqrt(d2)/q[2])*q[3]*1.6;if(v>l)l=v}}
    const dk=clamp(1-l,0,1)*4,fl=Math.floor(dk),lev=fl+((dk-fl)>BAY[(y&3)*4+(x&3)]?1:0),o=(y*LW+x)*4;
    d[o]=cr;d[o+1]=cg;d[o+2]=cb;d[o+3]=(lev/4)*amb*255}
  lx.putImageData(lid,0,0);ctx.drawImage(lc,0,0,VW,VH)}
function render(){
  if(G.mode==='title'){drawTitle();return}
  drawScene(scx);
  const f=G.fx;let ox=0,oy=0;if(f.shake>0){ox=Math.round((Math.random()*2-1)*f.mag);oy=Math.round((Math.random()*2-1)*f.mag)}
  ctx.fillStyle='#000';ctx.fillRect(0,0,VW,VH);ctx.drawImage(sceneC,ox,oy);
  drawLight();
  if(G.m&&G.m.tint){ctx.globalCompositeOperation='multiply';ctx.fillStyle=G.m.tint;ctx.fillRect(0,0,VW,VH);ctx.globalCompositeOperation='source-over'}
  if(f.glitch>0){for(let i=0;i<5;i++){const y=(Math.random()*VH)|0,h=2+((Math.random()*10)|0),dx=((Math.random()*2-1)*10)|0;ctx.drawImage(cv,0,y,VW,h,dx,y,VW,h)}
    ctx.fillStyle='rgba(224,32,58,.18)';ctx.fillRect(0,(Math.random()*VH)|0,VW,2)}
  if(f.flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,f.flash)})`;ctx.fillRect(0,0,VW,VH)}
  if(f.red>0){ctx.fillStyle=`rgba(200,10,30,${f.red*.45})`;ctx.fillRect(0,0,VW,VH)}
}

/* ---------- main loop ---------- */
let lastT=0;
function frame(t){const dt=Math.min(.05,(t-lastT)/1000||0);lastT=t;G.anim++;update(dt);render();requestAnimationFrame(frame)}
function update(dt){const f=G.fx;f.shake=Math.max(0,f.shake-dt);f.flash=Math.max(0,f.flash-dt*2.2);f.glitch=Math.max(0,f.glitch-dt);f.flick=Math.max(0,f.flick-dt);f.red=Math.max(0,(f.red||0)-dt*1.5);
  if(G.mode!=='play'||!G.m)return;
  const p=G.p,spd=(G.dash?.11:.19);
  for(const e of G.m.events)if(e.t<1){e.t=Math.min(1,e.t+dt/.19)}
  const c=G.cat;if(c.moving){c.t=Math.min(1,c.t+dt/spd);c.walk++;c.px=(c.ox+(c.x-c.ox)*c.t)*16;c.py=(c.oy+(c.y-c.oy)*c.t)*16;if(c.t>=1)c.moving=false}
  if(p.moving){p.t=Math.min(1,p.t+dt/spd);p.walk++;p.px=(p.ox+(p.x-p.ox)*p.t)*16;p.py=(p.oy+(p.y-p.oy)*p.t)*16;if(p.t>=1){p.moving=false;arrive()}}
  if(!p.moving&&!G.busy&&!UI.length){
    if(G.queue.length){const k=G.queue.shift();if(k==='ok')act();else if(k==='cancel')run(openMenu);else if(k==='cam')run(takePhoto);else if(k==='hint')run(askHint)}
    else{const hd=G.held[G.held.length-1];
      if(hd!==undefined){G.path=null;G.pathAct=null;tryMove(hd)}
      else if(G.path&&G.path.length){const s=G.path.shift();const d=s[0]-p.x===1?2:s[0]-p.x===-1?1:s[1]-p.y===1?0:3;if(!tryMove(d)){G.path=null;G.pathAct=null}}}}
  updateCam()}

/* ---------- input ---------- */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',
  z:'ok',Z:'ok',Enter:'ok',' ':'ok',x:'cancel',X:'cancel',Escape:'cancel',Backspace:'cancel',c:'cam',C:'cam',h:'hint',H:'hint'};
const DIRKEY={down:0,left:1,right:2,up:3};
const UI=[];
function press(k){audioInit();if(UI.length){UI[UI.length-1](k);return}
  if(k in DIRKEY)return;if(G.mode==='play'&&!G.busy){if(G.queue.length<2)G.queue.push(k)}}
function hold(k,on){if(!(k in DIRKEY))return;const d=DIRKEY[k];G.held=G.held.filter(x=>x!==d);if(on)G.held.push(d)}
addEventListener('keydown',e=>{if(e.key==='Shift'){G.dash=true;return}const k=KEYMAP[e.key];if(!k)return;e.preventDefault();if(!e.repeat)press(k);hold(k,true)});
addEventListener('keyup',e=>{if(e.key==='Shift'){G.dash=false;return}const k=KEYMAP[e.key];if(k)hold(k,false)});
addEventListener('blur',()=>{G.held=[];G.dash=false});
document.querySelectorAll('#pad [data-k]').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}press(k);hold(k,true)};
  const off=()=>{b.classList.remove('on');hold(k,false)};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',e=>e.preventDefault())});
if(matchMedia('(pointer:coarse)').matches||('ontouchstart' in window))document.documentElement.classList.add('touch');
addEventListener('touchstart',()=>document.documentElement.classList.add('touch'),{once:true,passive:true});
screenEl.addEventListener('pointerdown',e=>{audioInit();
  if(e.target.closest('button,[data-self]'))return;
  if(UI.length){e.preventDefault();press('ok');return}
  if(G.mode!=='play'||G.busy)return;
  const r=cv.getBoundingClientRect(),gx=((e.clientX-r.left)/r.width*VW+G.camX)>>4,gy=((e.clientY-r.top)/r.height*VH+G.camY)>>4;
  tapMove(gx,gy)});
function tapMove(gx,gy){const p=G.p;if(gx===p.x&&gy===p.y){act();return}
  if(G.cat.on&&G.cat.x===gx&&G.cat.y===gy&&Math.abs(gx-p.x)+Math.abs(gy-p.y)===1){p.dir=gx>p.x?2:gx<p.x?1:gy>p.y?0:3;act();return}
  let goals=[],actDir=null;
  // tapped something solid (or the wall above a door/feature): walk next to it, then examine
  let tx=gx,ty=gy;
  if(blocked(tx,ty)||(G.cat.x===gx&&G.cat.y===gy&&G.cat.on)){
    const cand=[[0,1,3],[-1,0,2],[1,0,1],[0,-1,0]];
    for(const[a,b,d]of cand){const sx=tx+a,sy=ty+b;if(!blocked(sx,sy))goals.push([sx,sy,d])}
    if(!goals.length){const t2=tileOf(G.m,tx,ty+1);if(t2==='V'||t2==='t'){if(!blocked(tx,ty+2))goals.push([tx,ty+2,3])}}
    if(!goals.length)return}
  else goals=[[tx,ty,null]];
  const path=bfs(p.x,p.y,goals);if(!path)return;G.path=path.steps;G.pathAct=path.goal[2]!==null?{dir:path.goal[2]}:null;
  if(!G.path.length&&G.pathAct){p.dir=G.pathAct.dir;G.pathAct=null;act()}}
function bfs(sx,sy,goals){const m=G.m,W=m.w,prev=new Map(),k=(x,y)=>y*W+x;const q=[[sx,sy]];prev.set(k(sx,sy),null);
  while(q.length){const[x,y]=q.shift();const g=goals.find(g=>g[0]===x&&g[1]===y);if(g){const steps=[];let c=k(x,y);while(prev.get(c)!==null){steps.unshift([c%W,(c/W)|0]);c=prev.get(c)}return{steps,goal:g}}
    for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy,kk=k(nx,ny);if(prev.has(kk)||blocked(nx,ny))continue;const t=tileOf(m,nx,ny);const ev=evAt(nx,ny,e=>e.touch);if(ev&&!goals.some(g=>g[0]===nx&&g[1]===ny))continue;prev.set(kk,k(x,y));q.push([nx,ny])}}
  return null}

/* ---------- screen sizing: integer pixel scale ---------- */
function fit(){const dpr=window.devicePixelRatio||1,app=$('#app'),touch=document.documentElement.classList.contains('touch');
  const aw=app.clientWidth-32,ah=app.clientHeight-16-(touch?200:$('#keys').offsetHeight+12);
  let s=Math.floor(Math.min(aw*dpr/VW,ah*dpr/VH));if(s<1)s=1;let w=VW*s/dpr,h=VH*s/dpr;
  if(w>aw+1){w=aw;h=aw*VH/VW}
  screenEl.style.width=w+'px';screenEl.style.height=h+'px';document.documentElement.style.setProperty('--s',(w/VW)+'px')}
addEventListener('resize',fit);

/* =========================================================
   message window
   ========================================================= */
const msgEl=$('#msg'),mname=$('#mname'),mtext=$('#mtext'),mnext=$('#mnext'),mchoice=$('#mchoice'),pL=$('#pl'),pR=$('#pr');
const WHO={misaka:{n:'ミサカ',side:'L',b:'blip'},aki:{n:'アキ',side:'R',b:'blipA'},yuki:{n:()=>G.flags.yukiNamed?'ユキ':'？？？',b:'blipY'},sys:{n:null,b:'blipN'}};
function parse(t){const out=[];let cls='';let i=0;
  while(i<t.length){const c=t[i];
    if(c==='{'){const j=t.indexOf('}',i);const tag=t.slice(i+1,j);i=j+1;if(tag==='/')cls='';else if(tag==='p')out.push({pause:320});else if(tag==='pp')out.push({pause:800});else cls=tag.split('').join(' ');continue}
    out.push({ch:c,cls});i++}
  return out}
function waitKey(keys=['ok','cancel']){return new Promise(res=>{const h=k=>{if(keys.includes(k)){UI.splice(UI.indexOf(h),1);res(k)}};UI.push(h)})}
async function say(who,text,emo=''){
  const w=WHO[who]||WHO.sys;msgEl.hidden=false;mchoice.hidden=true;
  const nm=typeof w.n==='function'?w.n():w.n;mname.hidden=!nm;mname.textContent=nm||'';mname.className='name '+(who||'');
  pL.className='por L'+(w.side==='L'?' on '+emo:'');pR.className='por R'+(w.side==='R'?' on '+emo:'');
  const toks=parse(text);mtext.textContent='';const spans=[];
  for(const tk of toks){if(tk.pause){spans.push(tk);continue}const s=document.createElement('span');s.textContent=tk.ch;s.className=(tk.cls?tk.cls+' ':'')+'hid';mtext.appendChild(s);spans.push(s)}
  mnext.style.visibility='hidden';
  let skip=false;const hk=k=>{if(k==='ok'||k==='cancel')skip=true};UI.push(hk);
  const blip=SE[w.b];let n=0;
  for(const s of spans){if(skip)break;if(s.pause){await sleep(s.pause);continue}s.classList.remove('hid');if(s.textContent.trim()&&(n++%2===0))blip();await sleep(s.textContent==='…'||s.textContent==='、'?90:s.textContent==='。'?140:26)}
  spans.forEach(s=>s.classList&&s.classList.remove('hid'));
  UI.splice(UI.indexOf(hk),1);
  mnext.style.visibility='visible';await sleep(60);
  await waitKey();SE.cursor();
}
function hideMsg(){msgEl.hidden=true;pL.className='por L';pR.className='por R'}
const M=(t,e)=>say('misaka',t,e),A=(t,e)=>say('aki',t,e),Y=(t,e)=>say('yuki',t,e),N=t=>say('sys',t);
async function end(){hideMsg()}
function choose(opts,{cancel=-1}={}){return new Promise(res=>{
  msgEl.hidden=false;mchoice.hidden=false;mchoice.innerHTML='';let i=0;
  const bs=opts.map((o,k)=>{const b=document.createElement('button');b.textContent=o;b.onclick=e=>{e.stopPropagation();i=k;done()};b.addEventListener('pointerdown',e=>e.stopPropagation());mchoice.appendChild(b);return b});
  const upd=()=>bs.forEach((b,k)=>b.classList.toggle('sel',k===i));upd();mnext.style.visibility='hidden';
  const h=k=>{if(k==='up'){i=(i+opts.length-1)%opts.length;SE.cursor();upd()}else if(k==='down'){i=(i+1)%opts.length;SE.cursor();upd()}else if(k==='ok')done();else if(k==='cancel'&&cancel>=0){i=cancel;done()}};
  function done(){UI.splice(UI.indexOf(h),1);SE.ok();mchoice.hidden=true;res(i)}
  UI.push(h)})}

/* ---------- toasts / effects ---------- */
function toast(t,col){const d=document.createElement('div');d.className='toast';d.textContent=t;d.style.color=col;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),2500)}
function where(t){const w=$('#where');w.textContent=t;w.classList.add('on');clearTimeout(where.t);where.t=setTimeout(()=>w.classList.remove('on'),2200)}
function shake(t=.3,m=3){G.fx.shake=t;G.fx.mag=m}
function flash(v=1){G.fx.flash=v}
function glitch(t=.4){G.fx.glitch=t;SE.glitch()}
async function hurt(){G.dmg++;SE.thud();shake(.35,4);G.fx.red=1;toast('ミサカの被害 +1','#ff8a9a');await sleep(250)}
function karma(type){G.k[type]++;const m={g:['善','#f0e2b0','good'],e:['悪','#ff4a5e','evil'],t:['謎','#a6f23c','truth']}[type];SE[m[2]]();toast(m[0]+'　の記録が増えた',m[1])}
async function fade(to,ms=300){const f=$('#fade');f.style.transition=`opacity ${ms}ms linear`;f.style.opacity=to;await sleep(ms+20)}
async function gotItem(id){SE.item();give(id);await N(`{y}${ITEMS[id].n}{/}を手に入れた。`)}

/* ---------- overlay panels ---------- */
const ov=$('#ov');
function openOv(html,cls='panel'){ov.innerHTML='';const d=document.createElement('div');d.className=cls;d.setAttribute('data-self','');if(typeof html==='string')d.innerHTML=html;else d.appendChild(html);ov.appendChild(d);ov.hidden=false;return d}
function closeOv(){ov.hidden=true;ov.innerHTML=''}
ov.addEventListener('pointerdown',e=>{if(e.target===ov&&UI.length){e.stopPropagation();press('cancel')}});
async function showDoc(title,body,{paper=true}={}){const d=openOv(`<h3>${title}</h3><div style="white-space:pre-wrap">${body}</div><div class="cap">▼ タップ／決定で閉じる</div>`,'panel'+(paper?' paper':''));
  d.addEventListener('pointerdown',e=>{e.stopPropagation();press('ok')});SE.ok();await waitKey();closeOv();SE.cursor()}
async function showCanvas(canvas,scale,cap){const wrap=document.createElement('div');canvas.className='pixcv';{const h=Math.min(canvas.height*scale,screenEl.clientHeight*.64);canvas.style.height=h+'px';canvas.style.width=(h*canvas.width/canvas.height)+'px'}wrap.appendChild(canvas);if(cap){const c=document.createElement('div');c.className='cap';c.innerHTML=cap;wrap.appendChild(c)}
  const d=openOv(wrap);d.addEventListener('pointerdown',e=>{e.stopPropagation();press('ok')});SE.ok();await waitKey();closeOv()}
function pxScale(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s'))||2}
