'use strict';
/* =========================================================
   心霊写真は盛れない — engine / pixel art / audio
   ========================================================= */
const VW=256,VH=192,TS=16;
const $=s=>document.querySelector(s);
const screenEl=$('#screen'),cv=$('#cv'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return c}
const sceneC=mk(VW,VH),scx=sceneC.getContext('2d');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function hs(x,y,s=0){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function P(c,x,y,col){c.fillStyle=col;c.fillRect(x,y,1,1)}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const pick=a=>a[(Math.random()*a.length)|0];

/* ---------------- audio: every sound is synthesized ---------------- */
let AC=null,MG=null,NB=null,muted=false;
function audioInit(){try{
  if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.55;MG.connect(AC.destination);
    const len=AC.sampleRate;NB=AC.createBuffer(1,len,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1}
  if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,dur,o={}){if(!AC||muted)return;const{type='square',vol=.15,slide=0,at=0,attack=.005,filter=0}=o;
  const t=AC.currentTime+at,os=AC.createOscillator(),g=AC.createGain();os.type=type;os.frequency.setValueAtTime(f,t);
  if(slide)os.frequency.linearRampToValueAtTime(Math.max(20,f+slide),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let n=os;if(filter){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=filter;os.connect(fl);n=fl}
  n.connect(g);g.connect(MG);os.start(t);os.stop(t+dur+.03)}
function noise(dur,o={}){if(!AC||muted)return;const{vol=.2,freq=1000,type='lowpass',q=1,at=0,sweep=0}=o;
  const t=AC.currentTime+at,s=AC.createBufferSource();s.buffer=NB;s.loop=true;const f=AC.createBiquadFilter();f.type=type;
  f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.linearRampToValueAtTime(Math.max(30,freq+sweep),t+dur);f.Q.value=q;
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(MG);s.start(t,Math.random()*.5);s.stop(t+dur+.03)}
const SE={
  cursor(){tone(1200,.035,{vol:.05})},
  ok(){tone(880,.05,{vol:.07});tone(1320,.07,{vol:.06,at:.045})},
  cancel(){tone(520,.08,{vol:.06,slide:-220})},
  blip(){tone(760+Math.random()*60,.022,{vol:.022})},
  blipA(){tone(430+Math.random()*30,.03,{vol:.03,type:'triangle'})},
  blipY(){tone(210+Math.random()*25,.06,{vol:.035,type:'sawtooth',filter:800})},
  blipN(){tone(330,.012,{vol:.012,type:'triangle'})},
  step(){noise(.035,{vol:.03,freq:500})},
  door(){noise(.4,{vol:.12,freq:500,sweep:-300});tone(150,.38,{type:'sawtooth',vol:.03,slide:90,filter:700})},
  locked(){noise(.07,{vol:.25,freq:350});tone(80,.12,{vol:.12})},
  bump(){tone(90,.05,{vol:.05,type:'triangle'})},
  push(){noise(.3,{vol:.16,freq:320,type:'bandpass',q:2,sweep:160})},
  item(){[523,659,784,1046].forEach((f,i)=>tone(f,.16,{vol:.07,at:i*.07,type:'triangle'}))},
  shutter(){noise(.025,{vol:.4,freq:3500,type:'highpass'});noise(.05,{vol:.28,freq:2500,type:'highpass',at:.08});tone(2600,.03,{vol:.04})},
  scare(){[0,1,6,11].forEach(k=>tone(110*Math.pow(2,k/12),1.3,{type:'sawtooth',vol:.05,filter:1500,slide:-9}));noise(.7,{vol:.32,freq:1800,type:'bandpass',q:.6})},
  sting(){tone(1800,.7,{type:'sine',vol:.06,slide:-900});tone(1862,.7,{type:'sine',vol:.05,slide:-960})},
  knock(){tone(150,.08,{type:'sine',vol:.4,slide:-70});noise(.05,{vol:.18,freq:500})},
  glitch(){for(let i=0;i<7;i++)tone(100+Math.random()*2200,.04,{vol:.04,at:i*.03})},
  solve(){[659,784,988,1318].forEach((f,i)=>tone(f,.32,{vol:.06,at:i*.1,type:'triangle'}))},
  meow(){tone(620,.3,{type:'triangle',vol:.07,slide:380});tone(1000,.26,{type:'triangle',vol:.05,slide:-460,at:.17})},
  thud(){tone(70,.25,{type:'sine',vol:.45,slide:-35});noise(.12,{vol:.25,freq:420})},
  punch(){noise(.08,{vol:.35,freq:900});tone(90,.18,{type:'sine',vol:.4,slide:-50})},
  water(){for(let i=0;i<6;i++)noise(.13,{vol:.08,freq:1200+Math.random()*1600,type:'bandpass',q:3,at:i*.06})},
  heart(){tone(55,.14,{type:'sine',vol:.5});tone(50,.16,{type:'sine',vol:.4,at:.2})},
  unlock(){noise(.03,{vol:.3,freq:3000,type:'highpass'});noise(.03,{vol:.3,freq:2200,type:'highpass',at:.12});tone(1400,.05,{vol:.04,at:.12})},
  phone(){for(let i=0;i<10;i++)tone(i%2?1280:1600,.05,{vol:.05,at:i*.05})},
  whisper(){noise(1,{vol:.13,freq:2600,type:'bandpass',q:4,sweep:-1300})},
  bell(){[392,494,587,784].forEach((f,i)=>tone(f,2.4,{type:'sine',vol:.07,at:i*.03}))},
  good(){tone(1046,.45,{type:'sine',vol:.05});tone(1568,.55,{type:'sine',vol:.04,at:.08})},
  evil(){tone(98,.55,{type:'sawtooth',vol:.06,filter:500});tone(104,.55,{type:'sawtooth',vol:.05,filter:500})},
  truth(){tone(880,.05,{vol:.05});tone(660,.05,{vol:.05,at:.08});tone(990,.14,{vol:.05,at:.16})},
  shutterUp(){for(let i=0;i<14;i++)noise(.07,{vol:.12,freq:600+i*40,type:'bandpass',q:2,at:i*.06})},
  fall(){tone(420,.5,{type:'triangle',vol:.06,slide:-340})},
  foot(){noise(.06,{vol:.09,freq:260})},
  piano(f){tone(f,1.7,{type:'triangle',vol:.11,attack:.003});tone(f*2,1,{type:'sine',vol:.035,attack:.003});tone(f*1.004,1.9,{type:'sine',vol:.05})},
  wrongPiano(){[0,1,6].forEach(k=>SE.piano(130.8*Math.pow(2,k/12)))},
  splash(){noise(.5,{vol:.25,freq:1800,type:'bandpass',q:.8,sweep:-1200})},
  static(){noise(.5,{vol:.12,freq:4000,type:'highpass'})},
  curtain(){noise(.4,{vol:.1,freq:2500,type:'bandpass',q:1.5,sweep:1500})},
  crack(){noise(.06,{vol:.35,freq:1500});noise(.08,{vol:.2,freq:700,at:.05})},
  coins(){for(let i=0;i<8;i++)tone(2400+Math.random()*1800,.06,{type:'sine',vol:.04,at:i*.045+Math.random()*.03})},
};

/* ---------------- sprite strings ---------------- */
function spr(rows,pal,w=16){const h=rows.length,c=mk(w,h),x=c.getContext('2d');
  rows.forEach((r,y)=>{for(let i=0;i<w;i++){const ch=r[i]||'.';if(ch!=='.'&&pal[ch])P(x,i,y,pal[ch])}});return c}
function flipH(src){const c=mk(src.width,src.height),x=c.getContext('2d');x.translate(src.width,0);x.scale(-1,1);x.drawImage(src,0,0);return c}

const MPAL={k:'#16111b',h:'#e8e5dc',H:'#aba79f',s:'#f2d7c9',S:'#cfa696',e:'#e3203b',u:'#3c3f4b',U:'#272934',r:'#e2304b',R:'#9a1830',l:'#131318'};
const M_DOWN=[
"....kkkkkkkk....",
"...khhhhhhhhk...",
"..khhhhhhhhhhk..",
"..khhhhhhhhhhk..",
".khhhhhhhhhhhhk.",
".khhHHHHHHHHhhk.",
".khhsssssssshhk.",
".khhsesssseshhk.",
".khhsssskssshhk.",
".khhhHssssHhhhk.",
".khhuurrrruuhhk.",
".khuuuurruuuuhk.",
".khuuuRrrRuuuhk.",
".khsuuurruuushk.",
".khhuuuRRuuuhhk.",
"..khUUUUUUUUhk..",
"..khuUuUuUuUhk..",
"..khuUuUuUuUhk..",
"..kkuUuUuUuUkk..",
"...kUUUUUUUUk..."];
const M_UP=[
"....kkkkkkkk....",
"...khhhhhhhhk...",
"..khhhhhhhhhhk..",
"..khhhhhhhhhhk..",
".khhhhhhhhhhhhk.",
".khhhhhhhhhhhhk.",
".khhhhhhhhhhhhk.",
".khhhhHhhHhhhhk.",
".khhhhHhhHhhhhk.",
".khhhhhhhhhhhhk.",
".khurrhhhhrruhk.",
".khuuhhhhhhuuhk.",
".khuuHhhhhHuuhk.",
".khsuhhhhhhushk.",
".khhuuHhhHuuhhk.",
"..khUUhhhhUUhk..",
"..khuUHhhHuUhk..",
"..khuUuHHuuUhk..",
"..kkuUuUuUuUkk..",
"...kUUUUUUUUk..."];
const M_LEFT=[
".....kkkkkk.....",
"....khhhhhhk....",
"...khhhhhhhhk...",
"..khhhhhhhhhhk..",
"..khhhhhhhhhhhk.",
".khHHHhhhhhhhhk.",
".kssshhhhhhhhhk.",
".kesshhhhhhhhhk.",
".ksssshhhhhhhhk.",
"..kkssHhhhhhhhk.",
"...kurrhhhhhhhk.",
"...kuuurhhhhhhk.",
"...kuuRuhhhhhhk.",
"...kuusuhhhhhhk.",
"...kuuuuHhhhhhk.",
"...kUUUUUHhhhk..",
"...kuUuUuHhhk...",
"...kuUuUuUHk....",
"...kuUuUuUk.....",
"....kUUUUUk....."];
const LEG_F={stand:["....ksskssk.....","....kllkllk.....","....kllkllk.....","....kkk.kkk....."],
  a:["....ksskssk.....","....kllkllk.....","....kkkkllk.....","........kkk....."],
  b:["....ksskssk.....","....kllkllk.....","....kllkkkk.....","....kkk........."]};
const LEG_S={stand:[".....ksskk......",".....kllk.......",".....kllk.......",".....kkkk......."],
  a:[".....ksskk......","....kllkllk.....","...kll..kllk....","...kk....kkk...."],
  b:[".....ksskk......",".....kllk.......","....kllk........","....kkkk........"]};
function walkSet(body,legs,pal){const bob=b=>b.slice(1,20).concat([b[19]]);
  return [spr(bob(body).concat(legs.a),pal),spr(body.concat(legs.stand),pal),spr(bob(body).concat(legs.b),pal)]}
const SPR={};
function buildCharSprites(){
  const d=walkSet(M_DOWN,LEG_F,MPAL),u=walkSet(M_UP,LEG_F,MPAL),l=walkSet(M_LEFT,LEG_S,MPAL);
  SPR.misaka=[d,l,l.map(flipH),u]; // dir: 0 down,1 left,2 right,3 up
  const CP={k:'#0b090f',c:'#2e2b35',C:'#4a4653',g:'#a6f23c',p:'#e89aa8',r:'#c0304a'};
  const cd=["................","..kk........kk..","..krk......krk..","..krckkkkkkcrk..","..kcccccccccck..",".kcccccccccccck.",".kcgkcccccckgck.",".kcggccccccggck.","..kccccppcccck..","..kcccckkcccck..","...kcccccccck...","..kccCcccccCck..","..kcccccccccck.k","..kcccccccccckck","..kckcccccckcck.","..kkkkkkkkkkkk.."];
  const cu=["................","..kk........kk..","..kck......kck..","..kcckkkkkkcck..","..kcccccccccck..",".kcccccccccccck.",".kcccccccccccck.",".kccCcccccccCck.","..kcccccccccck..","...kcccccccck...","..kcccccccccck..","..kcccCkkCcccck.","..kccccCCccccck.","..kcccccccccck..","..kckcccccckck..","..kkkkkkkkkkkk.."];
  const cl=["................","................","..k.k...........",".krkrk.......kk.",".kcccck.....kcck","kcgkccck.....kck","kcccccck.....kck",".kpcccckkkkkkkck","..kkcccccccccck.","...kcccccccccck.","...kccccccccccck","...kcCcccccccCck","...kccccccccccck","...kckckkkkckck.","...kk.kk..kk.kk.","................"];
  const clb=cl.slice(0,13).concat(["...kkckk..kkck..","....kk.....kk...","................"]);
  const cdb=cd.slice(0,14).concat(["..kkckcccckckk..","..kk.kkkkkk.kk.."]);
  const L=[spr(cl,CP),spr(clb,CP)];
  SPR.aki=[[spr(cd,CP),spr(cdb,CP)],L,L.map(flipH),[spr(cu,CP),spr(cu,CP)]];
  const YP={k:'#07070b',h:'#15131b',H:'#2a2733',s:'#d9dee1',S:'#a8b1b8',w:'#d0d5d9',W:'#9aa2a8',n:'#283044',N:'#1c2232',r:'#a01828',e:'#ff2a3a'};
  SPR.yuki=spr([".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..khhhhHhhhhhk..","..khhhhHhhhhhk..","..khhhhhhhhhhk..","..khhhhhhhhshk..","..khhhhhhhhehk..","..khhhhhhhhshk..","..khhhhhhhhhhk..","..khhwwrrwwhhk..","..khhwwwrwwhhk..","..khswwwwwwshk..","..khhwwwwwwhhk..","..khhWwwwwWhhk..","...khnnnnnnhk...","...khnNnNnnhk...","...kknNnNnNkk...","....knNnNnNk....","....knnnnnnk....","....kSSkSSk.....","....kSSkSSk.....",".....kk.kk......","................"],YP);
  SPR.yukiFace=spr(["....kkkkkkkk....","...khhhhhhhhk...","..khhhhhhhhhhk..",".khhhhhhhhhhhhk.",".khhhhhhhhhhhhk.",".khhsshhhhsshhk.",".khsesshhsseshk.",".khsSsshhssSshk.",".khhsssssssshhk.",".khhssskkssshhk.",".khhhsrrrrshhhk.",".khhhhsssshhhhk.",".khhhhhhhhhhhhk.","..khhhhhhhhhhk..","...khhhhhhhhk...","....kkkkkkkk...."],YP);
  SPR.hand=spr(["....k.k.k.......","...kskskskk.....","...kskskskSk....","...kskskskSk....","...ksssssssk.k..","...ksssssssksk..","...kSssssssssk..","...kSsssssssk...","....kSssssssk...","....kSsssssk....",".....kSsssk.....",".....kSsssk.....",".....kSsssk.....",".....kSsssk.....",".....kSsssk.....","................"],{k:'#101015',s:'#dfe4e6',S:'#aab4ba'});
}

/* ---------------- tiles ---------------- */
const PASS=new Set(['.',',','_',':','*','x','q','o','O','=','%']);
function tileOf(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return 'X';return m.t[y][x]}
function woodF(c,x,y,tx,ty){R(c,x,y,16,16,'#5b4130');for(let r=0;r<4;r++){const yy=y+r*4;R(c,x,yy+3,16,1,'#47321f');
  const off=(hs(tx,ty*4+r,1)*16)|0;R(c,x+off,yy,1,3,'#47321f');if(hs(tx,ty,r+5)<.5)R(c,x+((off+6)%14),yy+1,3,1,'#6b4d38');if(hs(tx,ty,r+9)<.15)P(c,x+((off+11)%16),yy+2,'#3a2818')}}
function linF(c,x,y,tx,ty){for(let i=0;i<2;i++)for(let j=0;j<2;j++)R(c,x+i*8,y+j*8,8,8,(i+j+tx+ty)%2?'#454b55':'#4c535d');
  if(hs(tx,ty,2)<.35)R(c,x+((hs(tx,ty,3)*12)|0),y+((hs(tx,ty,4)*12)|0),3,1,'#5a616b');if(hs(tx,ty,6)<.2)P(c,x+((hs(tx,ty,7)*15)|0),y+((hs(tx,ty,8)*15)|0),'#30343b')}
function tileF(c,x,y,tx,ty){R(c,x,y,16,16,'#7c8386');R(c,x,y,16,1,'#62686b');R(c,x,y+8,16,1,'#62686b');R(c,x,y,1,16,'#62686b');R(c,x+8,y,1,16,'#62686b');
  P(c,x+2,y+2,'#949b9e');P(c,x+10,y+10,'#949b9e');if(hs(tx,ty,1)<.3)R(c,x+((hs(tx,ty,2)*10)|0)+1,y+((hs(tx,ty,3)*10)|0)+1,4,3,'rgba(90,60,40,.35)')}
function darkF(c,x,y,tx,ty){R(c,x,y,16,16,'#231a1d');R(c,x,y+15,16,1,'#1a1315');R(c,x+15,y,1,16,'#1a1315');if(hs(tx,ty,1)<.4)P(c,x+((hs(tx,ty,2)*14)|0),y+((hs(tx,ty,3)*14)|0),'#34272b')}
function floorT(c,ch,x,y,tx,ty){if(ch==='.')woodF(c,x,y,tx,ty);else if(ch===',')linF(c,x,y,tx,ty);else if(ch==='_')tileF(c,x,y,tx,ty);else darkF(c,x,y,tx,ty)}
function plaster(c,x,y,tx,ty){R(c,x,y,16,16,'#4c4f5c');R(c,x,y,16,2,'#33353f');R(c,x,y+2,16,1,'#42454f');
  for(let i=0;i<5;i++){const h=hs(tx,ty,i);if(h<.5)P(c,x+((h*97)|0)%16,y+3+((h*53)|0)%13,'#444754')}
  if(hs(tx,ty,9)<.22){let cx=x+4+((hs(tx,ty,10)*8)|0),cy=y+3;for(let i=0;i<8;i++){P(c,cx,cy,'#30323b');cx+=hs(tx,ty,20+i)<.5?1:-1;cy++}}
  if(hs(tx,ty,11)<.18)R(c,x+((hs(tx,ty,12)*12)|0),y+5,3,9,'rgba(70,45,30,.3)')}
function drawTile(c,m,tx,ty){
  const ch=m.t[ty][tx],x=tx*16,y=ty*16,n=(dx,dy)=>tileOf(m,tx+dx,ty+dy),base=()=>floorT(c,m.floor,x,y,tx,ty);
  switch(ch){
  case '.':case ',':case '_':case ':':floorT(c,ch,x,y,tx,ty);break;
  case '*':woodF(c,x,y,tx,ty);{const pts=[[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[4,3],[11,3],[3,4],[12,4],[3,5],[12,5],[2,6],[13,6],[2,7],[13,7],[2,8],[13,8],[2,9],[13,9],[3,10],[12,10],[3,11],[12,11],[4,12],[11,12],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13]];
    pts.forEach(([a,b],i)=>P(c,x+a,y+b,i%5===3?'#8d8a80':'#cfcbbd'))}break;
  case '%':base();R(c,x+2,y+3,12,10,'rgba(160,20,30,.0)');break;
  case 'x':base();for(let i=0;i<4;i++){const h=hs(tx,ty,i+40),px=x+((h*13)|0),py=y+((hs(tx,ty,i+50)*13)|0);
      if(i<2){R(c,px,py,3,2,'#b9b3a3');P(c,px,py+2,'#6d685d')}else{P(c,px,py,'#8fa3b8');P(c,px+1,py+1,'#5e7085')}}break;
  case 'q':base();R(c,x+3,y+5,9,6,'#5c0f18');R(c,x+5,y+4,5,8,'#5c0f18');R(c,x+4,y+6,5,3,'#761522');P(c,x+12,y+3,'#5c0f18');P(c,x+2,y+12,'#5c0f18');P(c,x+13,y+11,'#5c0f18');break;
  case 'o':base();for(let i=0;i<10;i++){c.fillStyle=`rgba(4,3,8,${Math.min(1,(i+1)/9)})`;c.fillRect(x,y+6+i,16,1)}break;
  case 'X':R(c,x,y,16,16,'#0b0a11');{const e='#221f2c';if(n(0,1)!=='X')R(c,x,y+14,16,2,e);if(n(0,-1)!=='X'&&ty>0)R(c,x,y,16,2,e);if(n(1,0)!=='X'&&tx<m.w-1)R(c,x+14,y,2,16,e);if(n(-1,0)!=='X'&&tx>0)R(c,x,y,2,16,e)}break;
  case 'W':plaster(c,x,y,tx,ty);break;
  case 'V':R(c,x,y,16,16,'#4a3327');R(c,x,y,16,2,'#6b4b37');R(c,x,y+2,16,1,'#2c1f18');for(let i=0;i<16;i+=4)R(c,x+i,y+3,1,11,'#3b281e');R(c,x,y+14,16,2,'#231812');if(hs(tx,ty,3)<.3)R(c,x+((hs(tx,ty,4)*12)|0),y+6,3,1,'#5b4030');break;
  case 'w':case 'I':plaster(c,x,y,tx,ty);R(c,x+1,y+3,14,13,'#6c6f7a');R(c,x+2,y+4,12,12,'#1a2545');R(c,x+2,y+4,12,4,'#223058');R(c,x+2,y+12,12,4,'#131b34');
    for(let i=0;i<12;i+=2){P(c,x+2+i,y+8,'#223058');P(c,x+3+i,y+11,'#1a2545')}R(c,x+7,y+4,2,12,'#6c6f7a');R(c,x+2,y+9,12,1,'#6c6f7a');
    if(hs(tx,ty,1)<.5)P(c,x+4,y+5,'#c8d4f0');if(hs(tx,ty,2)<.4)P(c,x+11,y+6,'#8090c0');
    if(hs(tx,ty,3)<.35){let cx=x+10,cy=y+14;for(let i=0;i<5;i++){P(c,cx,cy,'#9fb0d0');cx+=i%2;cy--}}
    if(ch==='I'){R(c,x,y+4,16,3,'#7a5a3c');R(c,x,y+4,16,1,'#95714c');R(c,x,y+11,16,3,'#6d4f33');R(c,x,y+11,16,1,'#8a6844');[[2,5],[13,5],[3,12],[12,12]].forEach(([a,b])=>P(c,x+a,y+b,'#1a1410'))}break;
  case 'B':{plaster(c,x,y,tx,ty);const L=n(-1,0)!=='B',Rr=n(1,0)!=='B';R(c,x,y+3,16,12,'#5a4030');R(c,x+(L?1:0),y+4,16-(L?1:0)-(Rr?1:0),10,'#23392d');R(c,x,y+14,16,2,'#3a2a20');
    for(let i=0;i<5;i++){const h=hs(tx,ty,30+i);if(h<.7)R(c,x+1+((h*113)|0)%12,y+5+((h*71)|0)%7,2+((h*7)|0)%4,1,'#7d9687')}if(hs(tx,ty,40)<.5)R(c,x+3,y+14,4,1,'#d0d0c8')}break;
  case 'M':plaster(c,x,y,tx,ty);R(c,x+3,y+3,10,12,'#8a8f96');R(c,x+4,y+4,8,10,'#62798a');R(c,x+4,y+4,8,3,'#7690a2');P(c,x+5,y+5,'#c6d6e2');P(c,x+6,y+6,'#a8bccb');P(c,x+9,y+11,'#4b5f6e');R(c,x+3,y+15,10,1,'#3a3d44');break;
  case 'e':plaster(c,x,y,tx,ty);R(c,x+3,y+2,10,14,'#d6d2c4');R(c,x+3,y+15,10,1,'#9b978a');
    for(let r=0;r<5;r++){const cnt=r<1?1:r<2?2:3,sz=r<1?3:r<2?2:1;for(let k=0;k<cnt;k++){const cx=x+8-((cnt*(sz+2))>>1)+k*(sz+2),cy=y+4+r*2+(r>1?r-1:0);R(c,cx,cy,sz,sz,'#1e1b1a')}}
    P(c,x+10,y+11,'#c01828');P(c,x+5,y+13,'#c01828');break;
  case 'n':plaster(c,x,y,tx,ty);R(c,x,y+3,16,11,'#4a3326');R(c,x+1,y+4,14,9,'#7a5b3b');R(c,x+2,y+5,5,6,'#cfc9b8');R(c,x+8,y+4,6,5,'#bdb6a2');R(c,x+9,y+10,4,3,'#d9d3c4');P(c,x+4,y+5,'#c02030');P(c,x+10,y+4,'#2050c0');R(c,x+3,y+7,3,1,'#6a6458');R(c,x+3,y+9,2,1,'#6a6458');break;
  case 'g':plaster(c,x,y,tx,ty);[[2,4,1,6],[1,6,4,1],[6,4,1,7],[5,6,3,1],[9,5,1,6],[9,5,4,1],[12,5,1,3],[10,8,3,1],[3,12,10,1],[4,13,1,2],[8,13,1,2]].forEach(([a,b,w,h])=>R(c,x+a,y+b,w,h,'#8e1a24'));P(c,x+7,y+11,'#8e1a24');P(c,x+13,y+14,'#6e121b');break;
  case 'P':plaster(c,x,y,tx,ty);R(c,x+3,y+2,10,13,'#8c6d2e');R(c,x+4,y+3,8,11,'#241d29');R(c,x+6,y+5,4,5,'#b8a898');R(c,x+5,y+10,6,4,'#3a2f3f');P(c,x+7,y+7,'#101010');P(c,x+8,y+7,'#101010');R(c,x+5,y+4,6,2,'#d8d4c8');P(c,x+3,y+2,'#b89a4a');break;
  case 'j':plaster(c,x,y,tx,ty);R(c,x+3,y+3,10,11,'#6a6f78');R(c,x+4,y+4,8,9,'#3c4048');for(let i=0;i<3;i++)for(let k=0;k<2;k++){P(c,x+5+i*3,y+5+k*4,'#b0a060');R(c,x+5+i*3,y+6+k*4,1,2,(i+k)%3?'#3c4048':'#c9b36a')}break;
  case 'l':plaster(c,x,y,tx,ty);R(c,x+6,y+3,4,2,'#2a2a2a');R(c,x+5,y+5,6,5,'#ff3848');R(c,x+6,y+6,2,2,'#ffb0b8');R(c,x+5,y+10,6,1,'#7a1020');break;
  case 'Q':R(c,x,y,16,16,'#2e211a');R(c,x+1,y+1,14,15,'#4d3627');R(c,x+3,y+4,10,10,'#10151f');R(c,x+3,y+4,10,1,'#1d2533');R(c,x+7,y+4,1,10,'#4d3627');R(c,x+4,y+1,8,2,'#cfc9b8');R(c,x+5,y+2,6,1,'#6a6458');break;
  case 'O':R(c,x,y,16,16,'#2e211a');R(c,x+1,y,14,15,'#4d3627');R(c,x+2,y+1,12,11,'#573d2c');R(c,x+11,y+5,2,3,'#a89868');R(c,x,y+15,16,1,'#1a120d');break;
  case 'G':R(c,x,y,16,16,'#0c0b12');R(c,x,y,16,8,'#5a606b');R(c,x+1,y+1,14,6,'#121a2e');R(c,x+1,y+1,14,1,'#2a3450');
    for(let i=0;i<16;i++)P(c,x+i,y+3+(i%3===0?0:1),'#9a9aa2');P(c,x+(tx%2?1:14),y+4,'#c0c0c8');if(tx%2===0){R(c,x+12,y+4,4,4,'#a08a3a');P(c,x+13,y+6,'#3a3010')}break;
  case 'S':base();R(c,x+1,y,14,16,'#6d695e');R(c,x+1,y,14,2,'#8a8577');for(let r=0;r<3;r++)for(let k=0;k<2;k++){R(c,x+2+k*7,y+3+r*4,6,3,'#27251f');R(c,x+2+k*7,y+3+r*4,6,1,'#3a372f');if(hs(tx,ty,r*2+k)<.3)R(c,x+3+k*7,y+4+r*4,3,2,'#c8c2b0')}R(c,x+1,y+15,14,1,'#3a372f');break;
  case 'L':base();R(c,x+2,y,12,16,'#4e5a68');R(c,x+2,y,12,2,'#65717f');R(c,x+7,y+2,1,14,'#39434e');for(let i=0;i<3;i++){R(c,x+3,y+4+i*2,3,1,'#39434e');R(c,x+9,y+4+i*2,3,1,'#39434e')}P(c,x+6,y+10,'#a0a8b0');P(c,x+9,y+10,'#a0a8b0');R(c,x+2,y+15,12,1,'#2b323b');break;
  case 'D':base();deskArt(c,x,y);break;
  case 'd':base();R(c,x+1,y+8,14,6,'#7a5c40');R(c,x+1,y+8,14,1,'#8f6c4b');R(c,x+1,y+13,14,2,'#4d3827');R(c,x+2,y+3,12,5,'#6b4f37');R(c,x+2,y+7,12,1,'#3b2a1e');
    R(c,x+2,y,1,4,'#5a5e66');R(c,x+13,y,1,4,'#5a5e66');R(c,x+6,y+1,1,3,'#5a5e66');R(c,x+14,y+14,1,2,'#3c3f46');R(c,x+1,y+14,1,2,'#3c3f46');break;
  case 'T':{base();const L=n(-1,0)!=='T',Rr=n(1,0)!=='T',a=L?1:0,b=Rr?1:0;R(c,x+a,y+2,16-a-b,12,'#6b4a2f');R(c,x+a,y+2,16-a-b,2,'#86603f');R(c,x+a,y+12,16-a-b,2,'#3e2a1b');if(L)R(c,x+3,y+7,6,3,'#4e3522');if(Rr)R(c,x+9,y+6,2,1,'#c0b8a0')}break;
  case 'K':base();R(c,x,y+2,16,12,'#727880');R(c,x,y+2,16,1,'#8c929a');R(c,x,y+12,16,2,'#4c5157');if(hs(tx,ty,1)<.7){R(c,x+2+((hs(tx,ty,2)*5)|0),y+4,6,5,'#d2ccbb');R(c,x+3+((hs(tx,ty,2)*5)|0),y+5,3,1,'#9a1a22')}if(hs(tx,ty,3)<.4)R(c,x+11,y+5,3,3,'#3a3030');break;
  case 'b':base();R(c,x+1,y,14,16,'#4b3121');R(c,x+1,y+7,14,1,'#2b1b12');R(c,x+1,y+15,14,1,'#2b1b12');{const cols=['#7a2a2a','#2a4a6a','#6a6a2a','#3a5a3a','#5a3a5a','#8a7a5a'];for(let s=0;s<2;s++)for(let i=0;i<6;i++){if(hs(tx,ty,s*9+i)<.15)continue;R(c,x+2+i*2,y+1+s*8+((hs(tx,ty,i+s)*2)|0),2,6-((hs(tx,ty,i+s)*2)|0),cols[(hs(tx,ty,i*3+s)*6)|0])}}break;
  case '#':base();R(c,x+2,y,12,16,'#6b7078');R(c,x+2,y,12,1,'#868b93');for(let i=0;i<3;i++){R(c,x+3,y+2+i*5,10,4,'#5a5f67');R(c,x+6,y+3+i*5,4,1,'#b8bcc0')}R(c,x+2,y+15,12,1,'#3a3e44');break;
  case 'f':base();R(c,x+2,y,12,16,'#a3a7a2');R(c,x+2,y,12,1,'#c2c6c1');R(c,x+2,y+6,12,1,'#6c706b');R(c,x+11,y+2,1,3,'#50544f');R(c,x+11,y+8,1,5,'#50544f');R(c,x+3,y+9,4,3,'#b8a868');R(c,x+2,y+15,12,1,'#5c605b');break;
  case 'H':base();R(c,x,y+1,16,15,'#8e949a');R(c,x+1,y+2,14,14,'#c8ccd0');R(c,x+3,y+3,10,5,'#e2e4e6');R(c,x+3,y+7,10,1,'#aeb2b6');break;
  case 'h':base();R(c,x,y,16,14,'#8e949a');R(c,x+1,y,14,12,'#b9bec3');R(c,x+1,y+3,14,1,'#9fa4a9');R(c,x+1,y+8,14,1,'#9fa4a9');R(c,x+1,y+14,1,2,'#4a4e54');R(c,x+14,y+14,1,2,'#4a4e54');break;
  case 'k':base();R(c,x,y+2,16,11,'#9aa2a6');R(c,x,y+2,16,1,'#b8c0c4');R(c,x+3,y+5,10,6,'#4a5258');R(c,x+4,y+6,8,4,'#39414a');R(c,x+7,y+2,2,4,'#c0c8cc');R(c,x,y+13,16,2,'#5a6266');P(c,x+6,y+8,'#7a3020');break;
  case 't':R(c,x,y,16,16,'#5c4b52');R(c,x+1,y,14,15,'#7c6b72');R(c,x+1,y,14,1,'#958389');R(c,x+11,y+7,2,2,'#c0b090');R(c,x+2,y+13,12,1,'#5c4b52');R(c,x,y+15,16,1,'#2a2024');R(c,x+7,y+2,2,1,(tx%3)?'#40a040':'#c03030');break;
  case 'F':base();R(c,x+2,y+7,12,7,'#5a4030');R(c,x+2,y+7,12,1,'#7a5840');R(c,x+3,y+14,1,2,'#3a2a20');R(c,x+12,y+14,1,2,'#3a2a20');R(c,x+3,y+9,10,1,'#e8e4da');break;
  case 'p':base();R(c,x+4,y+9,8,6,'#7a4a30');R(c,x+4,y+9,8,1,'#9a6040');R(c,x+5,y+15,6,1,'#4a2a1a');[[7,2,1,7],[9,4,1,5],[5,5,1,4],[6,3,1,1],[10,3,1,1],[4,4,1,1]].forEach(([a,b,w,h])=>R(c,x+a,y+b,w,h,'#4a3a22'));break;
  case 'u':base();R(c,x+4,y+6,8,9,'#5a5e66');R(c,x+4,y+6,8,1,'#7a7e86');R(c,x+5,y+2,1,5,'#2a2a30');R(c,x+9,y+1,1,6,'#b01828');R(c,x+8,y+1,2,1,'#b01828');R(c,x+7,y+3,1,4,'#303a50');break;
  case 'C':base();R(c,x+1,y,14,16,'#b8bcb4');R(c,x+2,y+1,12,13,'#7f9aa0');R(c,x+2,y+7,12,1,'#b8bcb4');for(let i=0;i<4;i++){R(c,x+3+i*3,y+3+(i%2),2,4-(i%2),['#c0a060','#8a3030','#e0e0d0','#305080'][i]);R(c,x+3+i*3,y+9,2,4,['#e0e0d0','#6a8a50','#c0a060','#a0a0a0'][i])}R(c,x+1,y+15,14,1,'#6a6e68');break;
  case 'c':base();R(c,x+4,y+2,8,5,'#7a5a40');R(c,x+4,y+2,8,1,'#8f6c4b');R(c,x+4,y+8,8,4,'#8b6b4b');R(c,x+4,y+12,1,3,'#3c3f46');R(c,x+11,y+12,1,3,'#3c3f46');R(c,x+5,y+7,1,1,'#3c3f46');R(c,x+10,y+7,1,1,'#3c3f46');break;
  case '=':R(c,x,y,16,16,'#3e4248');for(let i=0;i<4;i++){R(c,x,y+i*4,16,3,'#62666e');R(c,x,y+i*4,16,1,'#767a82');R(c,x,y+i*4+3,16,1,'#2a2d32')}R(c,x+14,y,2,16,'#8a7050');break;
  case 'Z':R(c,x,y,16,16,'#474c53');for(let i=0;i<8;i++){R(c,x,y+i*2,16,1,'#5f656d')}if(hs(tx,ty,1)<.6)R(c,x+((hs(tx,ty,2)*12)|0),y+((hs(tx,ty,3)*12)|0),3,2,'#6a4a3a');if(ty%3===1){R(c,x+6,y+6,4,5,'#a08a3a');R(c,x+7,y+4,2,2,'#8a8a90');P(c,x+7,y+8,'#302810')}break;
  case 'R':base();R(c,x,y+2,16,12,'#3a3034');R(c,x,y+2,16,1,'#4a4044');R(c,x+2,y+4,12,7,'#b8b0a0');R(c,x+3,y+5,10,5,'#4a3018');R(c,x+4,y+6,3,1,'#6a5030');R(c,x,y+13,16,2,'#1e1719');break;
  case 'E':base();R(c,x+6,y,3,14,'#1a1a1e');R(c,x+3,y+1,9,6,'#26262c');R(c,x+4,y+2,7,1,'#3a3a44');R(c,x+2,y+12,12,3,'#2e2e34');R(c,x+5,y+7,5,2,'#101014');break;
  case 'Y':case 'y':{base();const L=ch==='Y';R(c,x,y+1,16,11,'#141217');R(c,x,y+1,16,1,'#2c2a33');if(L){R(c,x,y+1,1,11,'#050407');R(c,x+3,y+3,8,1,'#3a3844')}else{R(c,x+15,y+1,1,11,'#050407')}
    R(c,x,y+11,16,4,'#d8d4cc');for(let i=0;i<16;i+=2)P(c,x+i,y+14,'#8a8680');for(let i=1;i<16;i+=4)R(c,x+i,y+11,1,2,'#141217');R(c,x,y+15,16,1,'#050407')}break;
  default:base();
  }
}
function deskArt(c,x,y){R(c,x+1,y+11,1,4,'#3c3f46');R(c,x+14,y+11,1,4,'#3c3f46');R(c,x+1,y+3,14,8,'#8b6b4b');R(c,x+1,y+3,14,1,'#a07e5a');R(c,x+1,y+10,14,2,'#5c4431');R(c,x+3,y+13,10,1,'#2e3036');R(c,x+4,y+5,4,1,'#6e5238')}

/* ---------------- event sprites (drawn procedurally) ---------------- */
const ART={
  box(c,x,y,e){R(c,x+3,y+6,10,9,'#7a5634');R(c,x+3,y+6,10,2,'#94704a');R(c,x+6,y+7,4,1,'#1a120c');R(c,x+4,y+10,8,3,'#d8d0b8');R(c,x+5,y+11,6,1,'#9a1a22');R(c,x+3,y+15,10,1,'#3a2618');
    if(G.flags.boxBroken){R(c,x+3,y+13,10,3,'#24170f');P(c,x+2,y+15,'#c8b060');P(c,x+13,y+14,'#c8b060');P(c,x+14,y+15,'#a0a0a0')}},
  desk(c,x,y){R(c,x+2,y+14,13,2,'rgba(0,0,0,.35)');deskArt(c,x,y)},
  locker(c,x,y){R(c,x+1,y+13,15,3,'rgba(0,0,0,.35)');R(c,x,y+3,16,11,'#4e5a68');R(c,x,y+3,16,2,'#65717f');R(c,x,y+13,16,1,'#2b323b');for(let i=0;i<3;i++)R(c,x+3+i*2,y+6,1,5,'#39434e');R(c,x+11,y+7,2,3,'#a0a8b0');R(c,x+8,y+5,1,8,'#39434e')},
  mirror(c,x,y){R(c,x+3,y+22,10,2,'rgba(0,0,0,.35)');R(c,x+7,y+14,2,9,'#5a5e66');R(c,x+4,y+21,8,2,'#5a5e66');R(c,x+3,y+1,10,14,'#8a8f96');R(c,x+4,y+2,8,12,'#62798a');R(c,x+4,y+2,8,4,'#7690a2');P(c,x+5,y+3,'#d0e0ea');P(c,x+6,y+4,'#a8bccb');R(c,x+4,y+10,8,1,'#566b7a')},
  model(c,x,y,e){R(c,x+3,y+22,10,2,'rgba(0,0,0,.35)');R(c,x+6,y+20,4,3,'#5a5e66');R(c,x+4,y+22,8,1,'#5a5e66');
    if(!G.flags.modelBroken){R(c,x+5,y,6,6,'#e0c0a8');R(c,x+8,y,3,6,'#b04040');P(c,x+6,y+2,'#101010');P(c,x+9,y+2,'#fff');R(c,x+6,y+4,2,1,'#6a3030')}
    R(c,x+4,y+6,8,10,'#e0c0a8');R(c,x+8,y+6,4,10,'#b04040');R(c,x+9,y+8,2,2,'#e07070');R(c,x+8,y+11,3,3,'#7a5030');R(c,x+5,y+8,2,1,'#c0a090');R(c,x+3,y+7,1,6,'#e0c0a8');R(c,x+12,y+7,1,6,'#a03838');R(c,x+5,y+16,6,4,'#d0b098');R(c,x+8,y+16,3,4,'#a03838')},
  head(c,x,y){R(c,x+5,y+9,6,6,'#e0c0a8');R(c,x+8,y+9,3,6,'#b04040');P(c,x+6,y+11,'#101010');P(c,x+9,y+11,'#fff');R(c,x+6,y+13,3,1,'#6a3030');P(c,x+8,y+14,'#6a3030')},
  vase(c,x,y){R(c,x+6,y+3,4,6,'#8aa0a8');R(c,x+6,y+3,4,1,'#b0c4cc');R(c,x+7,y+8,2,1,'#5a6a70');
    if(G.flags.flowerWater){[[5,0,'#e8e4ee'],[9,-1,'#e8e4ee'],[7,-2,'#f0d0da'],[11,1,'#e8e4ee']].forEach(([a,b,col])=>{R(c,x+a,y+b,2,2,col)});R(c,x+7,y,1,3,'#4a7a3a');R(c,x+9,y+1,1,2,'#4a7a3a')}
    else{[[5,0],[9,-1],[7,-2],[11,1]].forEach(([a,b])=>{P(c,x+a,y+b,'#5a4a2a');P(c,x+a+1,y+b+1,'#4a3a22')});R(c,x+7,y,1,3,'#4a3a22');R(c,x+9,y+1,1,2,'#4a3a22')}},
  doll(c,x,y){R(c,x+6,y+4,5,5,'#e8e2d6');R(c,x+6,y,1,5,'#e8e2d6');R(c,x+9,y+1,1,4,'#e8e2d6');P(c,x+10,y+1,'#e8e2d6');P(c,x+7,y+6,'#c01828');P(c,x+9,y+6,'#c01828');R(c,x+6,y+9,5,1,'#b8b0a0')},
  stand(c,x,y){R(c,x+4,y+22,8,2,'rgba(0,0,0,.35)');R(c,x+7,y+10,2,13,'#2a2a30');R(c,x+4,y+22,8,1,'#2a2a30');R(c,x+2,y+3,12,8,'#2a2a30');R(c,x+3,y+4,10,6,'#dcd6c6');for(let i=0;i<3;i++)R(c,x+3,y+5+i*2,10,1,'#8a8478');P(c,x+5,y+6,'#101010');P(c,x+8,y+5,'#101010');P(c,x+11,y+7,'#101010')},
  tripod(c,x,y){R(c,x+3,y+22,10,2,'rgba(0,0,0,.35)');R(c,x+7,y+8,2,8,'#1a1a1e');for(let i=0;i<8;i++){P(c,x+7-i*.5|0,y+15+i,'#1a1a1e');P(c,x+8+i*.5|0,y+15+i,'#1a1a1e');P(c,x+8,y+15+i,'#1a1a1e')}R(c,x+3,y+2,10,6,'#101014');R(c,x+4,y+3,8,1,'#3a3a44');R(c,x+6,y+4,4,4,'#2a2a30');R(c,x+7,y+5,2,2,'#6080a0');R(c,x+10,y+1,2,1,'#101014')},
  phone(c,x,y){R(c,x+5,y+3,7,5,'#101014');R(c,x+4,y+2,9,2,'#1a1a20');R(c,x+7,y+5,3,2,'#3a3a44');if(G.phoneRing&&((G.anim/3|0)%2))R(c,x+3,y+1,11,1,'#ffe080')},
  photos(c,x,y){R(c,x,y+2,80,1,'#8a8478');for(let i=0;i<7;i++){const px=x+3+i*11,py=y+3+(i%2);R(c,px,py,8,10,G.flags.lineBright?'#d8d0c0':'#15100f');R(c,px+3,py-1,2,2,'#b0a890');if(G.flags.lineBright){R(c,px+1,py+1,6,6,['#5a4a50','#3a4a5a','#6a5a4a'][i%3]);P(c,px+3,py+3,'#e8d8c8')}}},
  yuki(c,x,y,e){const a=e.alpha??(.55+.25*Math.sin(G.anim*.07));c.globalAlpha=a;c.drawImage(SPR.yuki,x,y-8);c.globalAlpha=1},
  faceWin(c,x,y){c.globalAlpha=.9;c.drawImage(SPR.yukiFace,x,y+2);c.globalAlpha=1},
  handprint(c,x,y){c.globalAlpha=.8;[[3,6,5,6],[3,2,1,4],[5,1,1,5],[7,2,1,4],[8,4,1,3],[2,8,1,2]].forEach(([a,b,w,h])=>R(c,x+a,y+b,w,h,'#7a1020'));[[10,8,4,5],[10,4,1,4],[12,3,1,5],[14,5,1,3]].forEach(([a,b,w,h])=>R(c,x+a,y+b,w,h,'#7a1020'));c.globalAlpha=1},
  bucket(c,x,y){R(c,x+4,y+7,8,8,'#4a6aa0');R(c,x+4,y+7,8,1,'#7a9ad0');R(c,x+5,y+8,6,2,'#2a3a60');R(c,x+3,y+5,10,1,'#9aa0a8')},
  aki(c,x,y,e){const f=SPR.aki[e.dir||0][0];c.drawImage(f,x,y)},
  none(){}
};

/* ---------------- tiny pixel digits for photo date stamps ---------------- */
const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001010010','8':'111101111101111','9':'111101111001111',"'":'010010000000000',':':'000010000010000',' ':'000000000000000','.':'000000000000010'};
function stamp(c,str,x,y,col){for(const ch of str){const g=DIG[ch]||DIG[' '];for(let i=0;i<15;i++)if(g[i]==='1')P(c,x+(i%3),y+((i/3)|0),col);x+=4}}
