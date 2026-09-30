/* =========================================================
   maps & story
   ========================================================= */
async function transfer(to,x,y,dir){hideMsg();SE.door();await fade(1,220);loadMap(to);placePlayer(x,y,dir);updateCam();await sleep(80);await fade(0,240);where(G.m.name);
  if(G.m.enter)await G.m.enter()}
function door(x,y,to,tx,ty,dir,o={}){return{x,y,solid:()=>!!(o.locked&&o.locked()),bump:async()=>{await o.onLocked()},touch:async()=>{await transfer(to,tx,ty,dir)},act:o.act}}
function exitAt(x,y,to,tx,ty,dir){return{x,y,touch:async()=>{await transfer(to,tx,ty,dir)}}}
const once=k=>{if(G.flags[k])return false;G.flags[k]=1;return true};
const cnt=k=>(G.flags[k]=(G.flags[k]||0)+1);
async function lines(arr){for(const l of arr){if(typeof l==='function')await l();else if(typeof l==='string')await N(l);else await say(l[0],l[1],l[2])}}

/* ---------------- tile flavor ---------------- */
const FLAVOR={
  W:['ひび割れた壁。','壁のシミが、人の顔に見える。……見えるだけだ。',['misaka','壁ドンしたら校舎ごと崩れそうだな。']],
  V:['腰板に彫刻刀の落書き。『写真部＝幽霊部』。','腰板の隙間から、すうすうと風が……いや、息づかいみたいな音がする。'],
  w:['窓の外は真っ暗な山。ガラスに、自分の顔が薄く映っている。','窓ガラスの内側に、小さな手形がついている。','窓は開かない。鍵は開いているのに。',['misaka','月、でっか。……撮っとくか。いや月はバズらねえな。']],
  I:['入ってきた窓。内側から板が打ち付けられている。釘は赤く錆びている。',['misaka','誰だよ打ったの。出てこい。弁償させてやる。']],
  S:['下駄箱。名札のほとんどが剥がされている。','片方だけの上履き。もう片方はどこへ行ったんだろう。',['misaka','カビたパン出てきた。……青春の味がすんな。']],
  D:['落書きだらけの机。','机の天板に、コンパスで彫った相合傘。片方の名前だけ削られている。'],
  d:['机が積み上げられている。バリケードみたいだ。','積まれた机の脚の隙間から、向こう側が見える。……向こう側からも、見えている気がする。',['misaka','学級崩壊どころじゃねえな。物理的に崩壊してる。']],
  T:['教卓。チョークの粉で白くなっている。'],
  K:['職員の机。採点途中の答案が散らばっている。……点数は全部、0点。','職員の机。湯呑みの底に、茶渋が二十年分こびりついている。','引き出しに「指導記録」のファイル。中身は全部抜かれている。'],
  b:['本棚。背表紙が褪せて、題名が読めない。','『はじめての暗室作業』という本が、逆さまに差してある。'],
  '#':['ファイルキャビネット。『進路』『保健』『事故報告』……一番下の段だけ、鍵が壊されている。'],
  L:['ロッカー。開けると、錆びた匂いがした。空っぽだ。'],
  k:['洗面台。蛇口をひねっても、ゴボゴボと喉を鳴らす音がするだけだ。'],
  t:['個室のドア。'],
  G:['正面玄関のガラス戸。鎖でぐるぐる巻きにされている。'],
  Z:['防火シャッター。'],
  p:['枯れた観葉植物。鉢に「卒業記念」のプレート。何年卒かは削られている。'],
  H:['ベッド。シーツがきれいに整えられている。……誰が整えたんだろう。'],h:['ベッド。マットレスが、人の形にへこんでいる。'],
  C:['薬品棚。ラベルは全部、読めないくらい色褪せている。'],
  E:['引き伸ばし機。写真を大きく焼くための機械。レンズに、指紋がひとつ。'],
  R:['現像トレイ。'],
  Y:['ピアノ。'],y:['ピアノ。'],
  c:['椅子。座面に、画鋲が上向きに一つ。……古典的だな。',['misaka','座らねえよ。']],
  '=':['階段。手すりが、手の脂でてらてら光っている。二十年前の脂だ。'],
  n:['掲示板。'],P:['肖像画。'],e:['視力検査表。'],M:['鏡。'],j:['キーボックス。'],l:['赤い安全光の電球。暗室のしるしだ。'],
  B:['黒板。'],Q:['ドア。'],O:['ドア。'],F:['献花台。'],x:['割れたガラスと、紙くず。'],q:['床に、黒ずんだ大きなシミ。……ワックスのシミだ。そういうことにしておく。'],
  u:['傘立て。'],f:['冷蔵庫。'],
};

/* ---------------- items: default use ---------------- */
const ITEM_USE={
  tuna:async()=>{if(G.cat.on)await giveTuna();else await N('アキが近くにいない。')},
  coins:async()=>{await N('小銭を数えた。832円。……十円玉の一枚に、小さな歯形がついていた。');await M('……ジュース一本分の罪悪感だな。')},
  water:async()=>{await M('……飲む？');await M('いや、飲まねえよ。さっきまで赤かったんだぞこれ。')},
  bucket:async()=>{await M('かぶったら兜になるかな。');await A('ならない。')},
  eraser:async()=>{await N('黒板消しをパンパンと叩いた。粉が舞った。ミサカの鼻に入った。');await M('へっくし！！　へっくし！！');if(once('eraserSneeze'))await hurt()},
  doll:async()=>{await N('ぬいぐるみを抱きしめてみた。……ほこりっぽい。それから、ほんのり石鹸の匂いがした。')},
  key_staff:async()=>{await N('鍵は、ドアの前で使おう。（鍵のかかったドアに向かって歩けば使う）')},
  key_nurse:async()=>{await N('鍵は、ドアの前で使おう。（鍵のかかったドアに向かって歩けば使う）')},
  key_dark:async()=>{await N('鍵は、ドアの前で使おう。（鍵のかかったドアに向かって歩けば使う）')},
};
async function giveTuna(){await M('……ほら。ツナ。');await N('ミサカはツナ缶を開けて、アキの前に置いた。');await A('……賞味期限、二十年切れてるぞ。');await M('猫だろ。いけるいける。');await A('猫をなんだと思ってる。');
  SE.meow();await N('アキは文句を言いながら、ひと口だけ食べた。');await A('……懐かしい味がする。');await M('二十年前の味だからな。');await A('そういう意味じゃない。');take('tuna');G.flags.tunaGiven=1;karma('g')}

/* ---------------- talking to Aki ---------------- */
const AKI_TALK={
  entrance:['あんた、いつもそんなに声がでかいのか。','玄関は開かない。何度蹴っても。……蹴るなよ？'],
  corridor1:['この廊下、昔はワックスの匂いがした。……らしいよ。','献花台の花、誰も替えなかったんだ。……いや、途中までは誰かが替えてた。'],
  class2a:['机を押すときは腰を入れろ。あと、頭も使え。','窓際の席は、午後になると日が当たって暖かいんだ。'],
  staff:['職員室ってのは、秘密をしまっておく場所だ。','大人は都合の悪いことを、引き出しに入れて鍵をかける。'],
  nurse:['保健室は、教室に居場所がない子の避難所だった。','あの人体模型、昔から笑ってたよ。……いや、笑ってなかったか。'],
  toilet:['……三番目、ノックしたか？','女子トイレに猫がいるのは、セーフなのか？'],
  corridor2:['この先の暗室が、あんたのゴールだ。','足音？　私じゃない。'],
  music:['ピアノは嫌いじゃない。昔、誰かが弾いてた。下手くそだったけど。'],
};
const AKI_ANY=['何だよ。撫でるな。……撫でるなって。','私に話しかけても、ヒントは出ないぞ。欲しけりゃ素直に「ヒント」って言え。','あんた、その格好で寒くないのか。','ツナ缶の一つでも持ってれば、話は別なんだがな。','……じろじろ見るな。猫を見るのは、猫が許したときだけだ。'];
async function talkAki(){const p=G.p;SE.meow();
  if(has('tuna')){await giveTuna();return}
  const n=cnt('akiTalk');
  if(n===1){await M('なあ猫。お前、なんでここにいんの？');await A('あんたこそ。');await M('アタシは仕事。');await A('じゃあ私も仕事だ。');await M('猫の仕事って何だよ。');await A('見届けることだよ。');return}
  await A(pick((AKI_TALK[G.mapId]||[]).concat(AKI_ANY)))}

/* ---------------- hints ---------------- */
const HINTS=[
  {id:'soko',when:()=>!has('key_staff')&&!G.flags.staffOpen,
    a:[['aki','廊下のいちばん手前の教室。黒板に書いてあることくらい、読めるだろ？'],['aki','……読めるよな？']],
    b:[['aki','机を三つ、床のチョークの丸に押し込め。押すことはできても、引くことはできない。壁際に押し付けたら終わりだ。'],['aki','詰んだら一回教室を出ろ。やり直しは恥じゃない。あんたの人生と違って、何度でもできる。'],['misaka','一言多いんだよ！','shake']]},
  {id:'staffdoor',when:()=>!G.flags.staffOpen,a:[['aki','鍵を持ってるのに使わないのは、趣味か？　職員室だよ。廊下の二つ目のドア。']]},
  {id:'keybox',when:()=>!has('key_nurse')&&!G.flags.nurseOpen,a:[['aki','職員室は、鍵を管理する場所だ。壁を見ろ。']],b:[['aki','職員室の壁のキーボックス。保健室の鍵があんたを待ってる。……文字通りな。']]},
  {id:'nursedoor',when:()=>!G.flags.nurseOpen,a:[['aki','保健室の鍵、持ってるだろ。廊下の三つ目のドアだ。']]},
  {id:'shutter',when:()=>!G.flags.shutterOpen,a:[['aki','シャッターの錠の横に書いてあったろ。保健室で目を検査しろ、って。'],['aki','検査表の注意書きまで、ちゃんと読めよ。']],
    b:[['aki','検査表は、鏡越しに見るんだ。保健室の姿見を調べてみろ。'],['aki','鏡の中じゃ左と右が入れ替わる。赤い丸の四つを、上から順に。'],['misaka','……最初からそう言えよ。'],['aki','最初から言ったら、あんたの脳が育たない。']]},
  {id:'lockers',when:()=>!G.flags.lockersDone,a:[['aki','倒れたロッカーは、押せば動く。押し方を考えろ。……脳みそも押せば動くといいんだがな。']],
    b:[['aki','階段から見て、手前の列の真ん中あたり。上下に逃がしながら、道を一本通すんだ。'],['aki','詰まったらロッカーを調べろ。元に戻せる。……この学校、そういうとこだけ親切なんだ。']]},
  {id:'music',when:()=>!has('key_dark')&&!G.flags.darkOpen,a:[['aki','職員室の連絡板、見たか？　暗室の鍵は音楽室だ。譜面台の楽譜を読んで、ピアノで弾け。']],
    b:[['aki','五線のいちばん下の線が「ミ」。そこから線と間を一つずつ上がって、ファ、ソ、ラ。線の下にはみ出してるのが「ド」だ。'],['aki','……答え？　ミ・ソ・ラ・ソ・ミ・ド。'],['aki','情けない。']]},
  {id:'darkdoor',when:()=>!G.flags.darkOpen,a:[['aki','鍵はあるだろ。二階のいちばん奥、赤い光が漏れてるドアだ。']]},
  {id:'yuki',when:()=>!G.flags.yukiMet,a:[['aki','暗室に入れ。……覚悟して、な。']]},
  {id:'final',when:()=>true,a:[['aki','どう終わらせるかは、あんたが今夜してきたこと次第だ。'],['aki','暗室にいる私に話しかけろ。何ができて、何ができないか、教えてやる。']]},
];

/* =========================================================
   1F 昇降口
   ========================================================= */
MAPS.entrance={name:'1F　昇降口',floor:',',amb:.8,
  rows:[
  "XXXXXXXXXXXXXXXXXXXX",
  "XWWIWWWnWWWWwWWQWWWX",
  "XVVVVVVVVVVVVVVOVVVX",
  "X,,,,,,,,,,,,,,,,,,X",
  "X,SS,SS,SS,,,,,,,u,X",
  "X,,,,,,,,,,,,,,,,,,X",
  "X,SS,SS,SS,,,,,,,,,X",
  "X,,,,,,,,,,,,,,,,,,X",
  "X,SS,SS,SS,,,p,,,,,X",
  "X,,,,,,,,,,,,,,,,,,X",
  "X,,x,,,,,,,,,,,,q,,X",
  "XXXXXXXGGGGXXXXXXXXX"],
  events:()=>[
    {id:'akiNPC',x:5,y:5,draw:(c,x,y)=>c.drawImage(SPR.aki[1][0],x,y+1),cond:()=>G.flags.akiShown&&!G.flags.metAki},
    {x:13,y:5,art:'box',solid:true,act:donationBox,photo:()=>({cap:'募金箱',after:async()=>{await M('「#廃校　#募金箱　#誰の金」……弱えな。')}})},
    ...[7,8,9,10].map(x=>({x,y:11,act:frontDoor})),
    {x:7,y:1,act:async()=>{await N('『避難経路図』。二階の奥の一部屋だけ、赤いマジックで塗り潰されている。');await N('塗り潰された部屋の名前は、かろうじて読めた。『写真部　暗室』。');await M('避難経路を塗り潰すなよ。消防法違反だろ。');if(G.cat.on)await A('不法侵入者が法を語るな。')}},
    {x:2,y:4,act:async()=>{if(once('shiratoriShoe')){await N('「白鳥」の名札が残った靴箱。上履きが一足、きちんと揃えて置いてある。');await N('かかとに、赤いペンで小さく『{r}ごめんね{/}』。');await M('……謝るくらいなら、最初からやんなきゃいいんだよ。誰だか知らねえけど。');if(G.cat.on)await A('……そうだな。')}else await N('「白鳥」の靴箱。上履きの『ごめんね』の字は、書いた人の手が震えていたみたいに歪んでいる。')}},
    {x:17,y:4,act:async()=>{if(once('umbrella')){await N('傘立て。ビニール傘の中に一本だけ、真っ赤な傘。');await M('お、いい傘じゃん。パクってこ。');SE.sting();await N('開いた。内側に、びっしりと小さな字で――');await N('{r}『かえして　かえして　かえして　かえして　かえして』{/}');await M('……返すわ。','pale')}else await N('真っ赤な傘は、きっちり畳まれて傘立てに戻っている。……戻したのはアタシだ。たぶん。')}},
    door(15,2,'corridor1',2,5,3,{locked:()=>!G.flags.metAki,onLocked:async()=>{await N('……背中に、視線を感じる。')}}),
  ],
  enter:async()=>{if(G.flags.entranceBack)return;G.flags.entranceBack=1}};

async function introScene(){
  await sleep(500);SE.crack();shake(.4,3);await sleep(300);
  await N('――ガシャン。');await N('背後で、乾いた音がした。');
  G.p.dir=3;await sleep(300);
  await M('……あ？');
  await N('振り返ると、いま入ってきた窓に、内側から板が打ち付けられていた。');
  await N('釘の頭は、赤く錆びていた。二十年分くらい。');
  await M('……ハハ。いや。え？','shake');
  await M('今の一瞬で？　大工さん？　ずいぶん仕事が早いね？');
  await M('……ま、いっか。出口なんていくらでもあんだろ。玄関とか。');
  await sleep(300);SE.meow();G.flags.akiShown=1;await sleep(400);G.p.dir=2;
  await N('「にゃあ」とも「なあ」ともつかない声がした。');
  await N('下駄箱の陰に、黒い猫がいた。緑の目が、懐中電灯の光を二枚のコインみたいに跳ね返している。');
  await M('うおっ。……なんだ猫か。ビビらせんなよ。ほら、チッチッチッ。');
  await A('舌を鳴らすな。品がない。');
  await M('……。');await M('…………。');
  await M('猫が喋ったな？','hop');
  await A('喋ったな。');
  await M('撮っていい？');
  await A('第一声がそれか。');
  SE.shutter();flash(1.3);await sleep(500);
  await M('……写ってねえ。');
  await A('だろうね。');
  await M('お前、何？　化け猫？　UMA？　編集長の仕込んだドッキリ？　だとしたらあのハゲ、予算の使い方おかしいぞ。');
  await A('アキ。そう呼べばいい。それ以上は、今のあんたに言っても無駄だ。');
  await M('偉っそうな猫だな。アタシは縦内ミサカ。泣く子も黙る敏腕記者様だ。');
  await A('契約の、だろ。');
  await M('なんで知ってんだよ！！','shake');
  await A('顔に書いてある。「非正規」って。');
  await M('書いてねえよ！');
  await A('……いいか。この学校は、一度入った人間を簡単には帰さない。窓はさっき見たろ。');
  await A('出たければ、奥へ行け。二階の、写真部の暗室だ。');
  await M('なんで暗室。');
  await A('あそこで、まだ現像が終わってない。');
  await M('意味わかんねえ。');
  await A('わかる頃には手遅れかもな。……ついてってやるよ。あんた、放っておくと三歩で死にそうだから。');
  await M('ついてくんな。');
  await M('……いや、ついてきてもいい。いや別に怖いとかじゃなくて。取材対象として。喋る猫はバズる。');
  await A('写らないけどな。');
  await M('チッ。');
  G.flags.metAki=1;G.cat.on=true;Object.assign(G.cat,{x:5,y:5,ox:5,oy:5,px:80,py:80,dir:1});
  await N('{g}アキ{/}が（勝手に）ついてくることになった。');
  await N(document.documentElement.classList.contains('touch')
    ?'【操作】十字ボタン／タップで移動　Ａ：調べる　◉：撮る　Ｂ：メニュー　猫：アキにヒントを聞く'
    :'【操作】矢印キー：移動　Z：調べる　C：撮る　X：メニュー　H：アキにヒントを聞く　（画面クリックでも移動）');
}
async function donationBox(){const n=G.flags.boxBroken?9:cnt('box');
  if(n===1){await N('『卒業記念植樹　ご協力ください』。木製の募金箱。振ると、ジャラジャラ鳴る。');await M('二十年もののお賽銭か。');}
  else if(n===2){await N('……箱の底板が、腐ってグラグラしている。');await M('いや、別に？　見てただけだし？');if(G.cat.on)await A('見てただけの手つきじゃないな。')}
  else if(n===3){await M('えいっ。');SE.crack();shake(.2,2);G.flags.boxBroken=1;await N('バキッ。');SE.coins();
    await N('底板が抜けて、小銭が床に散らばった。十円玉、百円玉、それから――');await N('{r}――小さな乳歯。{/}');await M('……っ、なんで歯。','pale');
    SE.item();give('coins');await N('{y}小銭（832円）{/}を手に入れた。');
    if(G.cat.on){await A('………。');await M('な、何だよ。どうせ誰も使わねえだろ。経費だ経費。');await A('あんたみたいなのが一番、ここに好かれるよ。')}
    karma('e')}
  else await N('空っぽの募金箱。底の穴から、湿った風が吹いてくる。')}
async function frontDoor(){
  if(once('frontDoor')){await N('正面玄関のガラス戸。太い鎖がドアノブを三重に縛り、でかい南京錠がぶら下がっている。');await N('鎖の隙間に、黄ばんだ貼り紙。');
    await N('『{r}下校時刻を過ぎています。写真部は　暗室を片付けてから　帰りなさい。{/}』');await M('写真部じゃねえっつの。');
    await M('……ま、ガラスなんて割りゃいいんだよ。オラァッ！');await hurt();await N('ミサカの蹴りは、ガラス戸に完璧に跳ね返された。');
    await M('いっっってぇ……！　なんだこれ、防弾？　廃校のくせに防弾？','shake');if(G.cat.on){await A('学校が、あんたを出したくないんだよ。');await M('学校に意思があってたまるか。')}}
  else await N(pick(['鎖はびくともしない。','貼り紙の「写真部は」の部分だけ、新しいインクで書き直されている気がする。','ガラスの向こうは真っ暗だ。……ガラスに映った自分の後ろに、誰か――いない。いない。']))}

/* =========================================================
   1F 廊下
   ========================================================= */
MAPS.corridor1={name:'1F　廊下',floor:',',amb:.82,
  rows:[
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XWWwQWwWWWwQWwWWWwQWwWWwQWwWWXWWWX",
  "XVVVOVVVVVVOVVVVVVOVVVVVOVVVVXVVVX",
  "X,,,,,,F,,,,,,,,,,,,,,,,,,,,,Z===X",
  "X,,,,,,,,,,,,,,,,,,,,,,,,,,x,Z===X",
  "X,,,,,,,,x,,,,,,,,,,,q,,,,,,,Z===X",
  "XXooXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
  mutate:m=>{if(G.flags.shutterOpen)for(let y=3;y<=5;y++)m.t[y][29]=','},
  events:()=>[
    exitAt(2,6,'entrance',15,3,0),exitAt(3,6,'entrance',15,3,0),
    door(4,2,'class2a',11,9,3),
    door(11,2,'staff',10,9,3,{locked:()=>!G.flags.staffOpen,onLocked:async()=>{
      if(has('key_staff')){SE.unlock();await N('{y}職員室の鍵{/}で開けた。');take('key_staff');G.flags.staffOpen=1}
      else{SE.locked();await N('『職員室』。鍵がかかっている。ドアの小窓には、内側から新聞紙が貼られている。')}}}),
    door(18,2,'nurse',5,9,3,{locked:()=>!G.flags.nurseOpen,onLocked:async()=>{
      if(has('key_nurse')){SE.unlock();await N('{y}保健室の鍵{/}で開けた。');take('key_nurse');G.flags.nurseOpen=1}
      else{SE.locked();await N('『保健室』。鍵がかかっている。……中から、消毒液の匂いがする。')}}}),
    door(24,2,'toilet',8,7,3),
    ...[3,4,5].map(y=>({x:32,y,touch:async()=>{await transfer('corridor2',4,4,2)}})),
    ...[3,4,5].map(y=>({x:29,y,act:shutter,cond:()=>!G.flags.shutterOpen})),
    {x:7,y:3,art:'vase',dy:-4,z:2,act:altar,use:{water:waterAltar},photo:()=>G.flags.altarPhoto?{cap:'献花台'}:{ghost:'hand',cap:'#献花台　#閲覧注意',after:altarPhoto}},
    {id:'face',x:13,y:1,art:'faceWin',cond:()=>G.flags.faceOn},
    ...[[3,4],[5,5],[6,4],[8,5]].map(([x,y])=>({x,y,art:'handprint',cond:()=>G.flags.sokoDone})),
  ],
  zones:[{x:13,y:3,w:1,h:3,once:'faceScare',run:faceScare}],
  enter:async()=>{if(!once('c1'))return;
    await N('一階の廊下。月明かりが窓から斜めに差し込み、床に白い格子を落としている。');
    await M('うっわ、エモ。これは撮るわ。');
    await A('撮ってもいいけど、突き当たりのシャッターは開かないぞ。');await M('シャッター？');
    await A('二階への階段は、防火シャッターで閉じられてる。……開ける「答え」は、この階のどこかにある。');await M('答えって何だよ、なぞなぞかよ。')}};
async function faceScare(){G.flags.faceOn=1;SE.scare();glitch(.5);shake(.3,2);await sleep(700);G.flags.faceOn=0;
  await N('{s}――窓に、顔が。{/}');
  await M('……今、窓に。','pale');await A('見なかったことにしろ。');await M('見たことにしたらどうなる。');await A('夜が長くなる。');
  await M('……見てない。アタシは何も見てない。記者は見たものしか書かない。つまり書かない。')}
async function altar(){
  if(G.flags.flowerWater){await N('花瓶の花が、ほんの少しだけ、上を向いている。');return}
  if(has('water')){await waterAltar();return}
  if(once('altar1')){await N('廊下の隅に置かれた、小さな机。白い布。花瓶。花はとっくに枯れて、茶色い針金みたいになっている。');
    await N('花瓶に貼られた紙：『{y}白鳥ユキさん{/}　安らかに』。');await M('……献花台か。二十年、誰も替えてねえんだな。');await A('……。')}
  else await N('枯れた花が、首を垂れている。……水でもあれば、と思った。いや、思っただけだ。')}
async function waterAltar(){await N('ミサカはバケツを傾け、花瓶に水を注いだ。');SE.water();await sleep(500);
  await N('もちろん、枯れた花が水を吸うはずがない。');await N('……はずがないのに、茎が、ほんの少しだけまっすぐになった気がした。');
  G.flags.flowerWater=1;take('water');give('bucket');
  await M('べ、別に。水が余ってたから。捨てる場所探してただけだし。');await A('……ふうん。');await A('誰も替えなかった花を、よりによってあんたが替えるとはな。');karma('g')}
async function altarPhoto(){G.flags.altarPhoto=1;
  await M('『#心霊スポット　#献花台　#閲覧注意』……へへ、これは伸びるぞ。');await N('写真の中――花瓶の縁に、白い指が掛かっていた。');
  await M('しかもおまけ付きじゃん。');await A('死者の花を、映えに使うか。');await M('死者だって、見てもらえた方が嬉しいだろ。');await A('……それは、本人に聞け。');karma('e')}
async function shutter(){
  if(once('shutterSeen')){await N('防火シャッターが下りている。錆びた鉄の板が、階段への道を塞いでいる。');
    await N('真ん中に南京錠がひとつ。数字じゃなく、{y}↑↓←→{/}のボタンが付いた、方向式のやつだ。');
    await N('錠の横に、マジックの走り書き：『{r}保健室で目を検査してもらうこと{/}』');await M('健康診断のお誘いかよ。')}
  hideMsg();const r=await dirLock();if(!r)return;
  const code=r.join(','),ans='right,down,left,up',decoy='left,down,right,up';
  if(code===ans){SE.unlock();await sleep(400);SE.shutterUp();shake(.9,1);for(let y=3;y<=5;y++)setTile(29,y,',');G.flags.shutterOpen=1;
    await N('カチン、と軽い音。シャッターが、ガラガラと巻き上がっていく。');await M('ハッ、ちょろい。');
    if(G.flags.hint_shutter>=2)await A('鏡の話をしてやったのは、誰だっけな。');else{await A('……へえ。やるじゃないか。');await M('だろ？　もっと褒めろ。');await A('調子に乗るな。')}}
  else{SE.locked();shake(.15,2);const n=cnt('shutterFail');await N('ガチッ。……開かない。');
    if(code===decoy)await A('検査表の注意書き、ちゃんと読んだか？');
    else if(n===2){await M('開けっつってんだろ！');await hurt();await N('シャッターを蹴った。シャッターは、ミサカの脛を蹴り返した（ように感じた）。')}
    else if(n>=3)await A(pick(['当てずっぽうで開く錠なら、錠の意味がない。','保健室。検査表。……聞こえてるか？']))}}

/* =========================================================
   1F 二年A組（倉庫番）
   ========================================================= */
const DESK0=[[3,5],[8,5],[5,7]],TARGETS=[[3,7],[9,7],[4,9]];
MAPS.class2a={name:'1F　二年A組',floor:'.',amb:.72,lamp:64,
  rows:[
  "XXXXXXXXXXXXXX",
  "XWBBBBWWwWWwWX",
  "XVVVVVVVVVVVVX",
  "X.TT.......D.X",
  "Xddd....dddddX",
  "X.....d.....dX",
  "X.dd..d...d..X",
  "X..*.....*.d.X",
  "X.d..d.dd....X",
  "X...*..d.....X",
  "XXXXXXXXXXXoXX"],
  events:()=>[
    exitAt(11,10,'corridor1',4,3,0),
    ...DESK0.map(([x,y],i)=>({id:'desk'+i,x,y,art:'desk',solid:true,push:true,canPush:()=>!G.flags.sokoDone,onPush:checkSoko,
      act:async()=>{if(G.flags.sokoDone){await N('丸の上にきっちり収まった机。……もう、びくともしない。');return}
        await N('机だ。押せば動きそうだ。');if(once('deskToe')){await N('試しに肩で押してみた。ギギギ……と床を削る音。');await hurt();await N('机の脚が、ミサカの足の小指を正確に轢いた。');await M('っ゛…………！！！','shake');await A('腰を入れろって言ったろ。')}}})),
    {x:2,y:3,act:teacherDesk},{x:3,y:3,act:teacherDesk},
    {x:11,y:3,act:yukiDesk,use:{doll:placeDoll},photo:()=>G.flags.deskPhoto?{cap:'窓際の席'}:{ghost:'yuki',gdy:-6,cap:'窓際の席',scare:true,after:deskPhoto}},
    {x:11,y:3,art:'doll',dy:-7,z:3,cond:()=>G.flags.dollPlaced},
    ...[2,3,4,5].map(x=>({x,y:1,act:blackboard})),
  ],
  over:(c,cx,cy)=>{if(!G.flags.sokoDone)return;c.fillStyle='#c01828';const x0=36-cx,y0=22-cy;
    [[0,0,1,6],[0,2,4,1],[6,0,1,6],[6,0,3,1],[12,1,4,1],[14,0,1,6],[19,0,1,6],[19,3,3,1],[25,0,4,1],[27,0,1,6],[25,5,5,1],[33,1,1,1],[36,1,1,1],[39,1,1,1],[43,0,1,5],[43,5,1,1]].forEach(([a,b,w,h])=>c.fillRect(x0+a,y0+b,w,h))},
  enter:async()=>{
    if(!G.flags.sokoDone){for(const e of G.m.events)if(e.push){const i=+e.id.slice(4);e.x=e.ox=DESK0[i][0];e.y=e.oy=DESK0[i][1]}}
    if(!once('cA'))return;
    await N('『二年A組』。');await N('机という机が積み上げられ、教室の真ん中に迷路ができていた。');
    await N('床には、チョークで描かれた丸が三つ。黒板には、白い文字がびっしりと。');await M('学級崩壊どころじゃねえな。物理的に崩壊してる。')}};
async function checkSoko(){const ds=G.m.events.filter(e=>e.push);
  if(!TARGETS.every(([x,y])=>ds.some(e=>e.x===x&&e.y===y)))return;
  G.flags.sokoDone=1;G.pushSaved.class2a=Object.fromEntries(ds.map(e=>[e.id,[e.x,e.y]]));
  await sleep(300);SE.solve();await sleep(700);SE.crack();shake(.3,2);
  await N('ガタン。');await N('教卓の引き出しが、ひとりでに開いた。');
  glitch(.6);await sleep(300);
  await N('黒板の文字が、いつの間にか、全部消えていた。');await N('代わりに、赤いチョークで一行だけ――『{r}よくできました{/}』。');
  await N('気づくと、積み上げられた机の隙間という隙間から、視線を感じた。');
  await M('……先生、アタシ今日、日直じゃないんで。','pale');await A('誰に言ってる。');await M('知らねえよ！！')}
async function teacherDesk(){
  if(!G.flags.sokoDone){await N('教卓。引き出しがある。');await N('鍵穴はないのに、開かない。引っかかっているというより――内側から、誰かが押さえているみたいだ。');
    if(once('tdesk1')){await M('……おい。中の人。開けろ。');await N('返事はない。当たり前だ。当たり前であってくれ。');await A('床の丸と、動かせる机の数。数えてみろ。')}return}
  if(!G.flags.gotStaffKey){G.flags.gotStaffKey=1;await N('引き出しの中に、鍵が一本。タグに『職員室』。');await gotItem('key_staff');await M('よっしゃ、次。');return}
  if(!G.flags.tAttend){G.flags.tAttend=1;await N('鍵の下に、もう一冊。『出席簿』。');
    await showDoc('二年Ａ組　出席簿　平成十六年十月',`<table style="border-collapse:collapse;font-variant-numeric:tabular-nums">
<tr><td>出席番号</td><td>　氏名　　</td><td>　10/11 12 13 14 15</td></tr>
<tr><td>11</td><td>　佐藤　　</td><td>　 ○　○　○　○　○</td></tr>
<tr><td>12</td><td>　清水　　</td><td>　 ○　○　／　○　○</td></tr>
<tr><td>13</td><td>　<span class="ink">白鳥 ユキ</span></td><td>　 ○　○　　　　　　</td></tr>
<tr><td>14</td><td>　鈴木　　</td><td>　 ○　○　○　○　○</td></tr>
</table>
<span class="ink">白鳥ユキの欄だけ、十月十三日から先が、ずっと空白だ。
欠席の「／」すら、ついていない。</span>`);
    await M('……欠席ですらねえ、ってことか。');await A('誰も、あの子の「その後」を書けなかったんだよ。');karma('t');return}
  await N('空っぽの引き出し。底に、爪で引っかいたような傷がある。')}
async function yukiDesk(){
  if(G.flags.dollPlaced){await N('うさぎのぬいぐるみが、窓の方を向いて座っている。');return}
  await N('窓際、いちばん端の机。天板に、彫刻刀で彫られた文字。');
  await N('『{r}ゆうれい{/}』『{r}写るな{/}』『{r}しね{/}』');await M('……ガキの悪口ってのは、二十年経っても腐らねえな。');
  if(has('doll'))await placeDoll()}
async function placeDoll(){await N('ミサカは、うさぎのぬいぐるみを机の上に座らせた。');take('doll');G.flags.dollPlaced=1;await sleep(500);
  await N('ぬいぐるみの首が、かくん、と窓の方へ傾いた。月を見ているみたいに。');
  await A('……あの子、窓の外ばかり見てたよ。');await M('知り合いか？');await A('……猫は、窓際が好きなんだ。');await M('答えになってねえ。');karma('g')}
async function deskPhoto(){G.flags.deskPhoto=1;await M('……いた。','pale');await M('席に、誰か、座って……。');
  await M('……っしゃあ！！　撮れた！！　本物だ！！','hop');await A('……喜ぶのか。そこで。');await M('喜ぶだろ！　これ一枚で家賃三ヶ月分だぞ！');
  await N('写真の中の少女は、うつむいたまま、机の文字を指でなぞっていた。');karma('e')}
async function blackboard(){
  if(G.flags.sokoDone){await N('黒板に、赤いチョークで『{r}よくできました{/}』。花丸まで付いている。');if(!has('eraser')&&!G.flags.gotEraser)await takeEraser();return}
  const n=cnt('board');
  if(n===1){await N('『つくえを　まるに　もどしましょう』');await N('『つくえを　まるに　もどしましょう』『つくえを　まるに　もどしましょう』『つくえを　まるに　もど――』');
    await N('同じ文が、黒板の端から端まで、何十行も。下へ行くほど、字が崩れていく。');await M('小学生の反省文かよ。ここ高校だろ。')}
  else if(!G.flags.gotEraser)await takeEraser();
  else await N('『つくえを　まるに　もどしましょう』……よく見ると、いちばん最後の行だけ、字がきれいだ。')}
async function takeEraser(){G.flags.gotEraser=1;await N('黒板の溝に、黒板消しがひとつ残っている。');await gotItem('eraser');await M('……持ってくか。何かに使えるかもしんねえし。記者の勘。');await A('ただの貧乏性だろ。')}

/* =========================================================
   1F 職員室
   ========================================================= */
MAPS.staff={name:'1F　職員室',floor:',',amb:.8,
  rows:[
  "XXXXXXXXXXXXXXXX",
  "XWjWWwWWWwWWWnWX",
  "XVVVVVVVVVVVVVVX",
  "X#,#,,,,,,,,,,,X",
  "X,,,KK,,KK,,KK,X",
  "X,,,KK,,KK,,KK,X",
  "X,,,,,,,,,,,,,,X",
  "Xf,,KK,,KK,,c,,X",
  "X,,,KK,,KK,,,,,X",
  "X,,,,,,,,,,,,,,X",
  "XXXXXXXXXXoXXXXX"],
  events:()=>[
    exitAt(10,10,'corridor1',11,3,0),
    {x:1,y:3,act:meetingDoc},
    {x:3,y:3,act:async()=>{await N('『進路希望調査　二年A組』のファイル。');await N('白鳥ユキ　第一志望：{y}写真の専門学校{/}。');await N('担任の所見欄：「本人の希望は尊重したいが、最近は写真を撮られることを極端に嫌がる。要観察」。');await M('……撮るのは好きで、撮られるのは嫌い、か。')}},
    {x:2,y:1,act:keyBox},
    {x:1,y:7,act:fridge},
    {x:8,y:4,art:'phone',dy:-2,z:2,act:phone},
    {x:13,y:5,act:magazine},
    {x:12,y:7,act:chair},
    {x:13,y:1,act:async()=>{await N('職員の連絡黒板。');await N('『写真部暗室の鍵　→　{y}音楽室{/}で管理（顧問：音楽科）』');await M('なんで写真部の顧問が音楽の先生なんだよ。');await A('小さい学校なんて、そんなもんだ。')}},
  ],
  zones:[{x:1,y:3,w:14,h:4,once:'phoneRang',run:async()=>{G.phoneRing=true;SE.phone();await sleep(900);SE.phone();await M('……電話、鳴ってる。');await A('電話線、たぶん切れてるけどな。');await M('じゃあなんで鳴ってんだよ。');ringPhone()}}],
  enter:async()=>{if(G.phoneRing)ringPhone();if(!once('cS'))return;
    await N('職員室。机の上に、採点途中の答案、飲みかけの湯呑み、吸い殻の溜まった灰皿。');
    await N('まるで、ある日突然、全員が席を立ったみたいだ。');await M('二十年前の飲みかけ……。');await A('飲むなよ。');await M('飲まねえよ！')}};
function ringPhone(){clearInterval(ringPhone.t);ringPhone.t=setInterval(()=>{if(!G.phoneRing||G.mapId!=='staff'){clearInterval(ringPhone.t);return}SE.phone()},2600)}
async function phone(){
  if(G.phoneRing){G.phoneRing=false;await N('ミサカは受話器を取った。');SE.static();await N('『……ザ……ザザ……』');await Y('{s}……とらないで{/}');SE.static();glitch(.3);await N('『――プツッ』');
    await M('……「撮らないで」？　「取らないで」？　どっちだよ。');await A('両方だろ。');G.flags.phoneDone=1;return}
  await N(G.flags.phoneDone?'受話器からは、もう何も聞こえない。……いや、耳を澄ますと、かすかにシャッター音。':'黒電話。ダイヤルの「0」だけ、すり減っている。')}
async function meetingDoc(){
  if(G.flags.tMeeting){await N('臨時職員会議録。塗り潰された部分は、何度見ても読めない。');return}
  await N('ファイルキャビネット。いちばん下の段だけ、鍵が壊されている。');await N('中に、ホチキスで留められた書類が一束。');
  await showDoc('平成十六年十月十五日　臨時職員会議録（抜粋）',`一、二年Ａ組　白鳥ユキの所在について。
　　本日時点で不明。警察には「家出の可能性」として届出済み。

一、本件と、写真部が文化祭で展示した写真
　　（いわゆる「心霊写真」）、並びにそれを掲載した
　　雑誌記事との関連について、
　　<span class="ink">生徒・保護者・外部への発言を一切控えること。</span>

一、写真部部長　<span class="ink">秋月ハルカ</span>の処分について
　　<span class="smear">■■■■■■■■■■■■■■■■■■■■</span>
　　<span class="smear">■■■■■■■■■■■■</span>`);
  G.flags.tMeeting=1;await M('……秋月、ハルカ。');await N('ミサカは、足元の黒猫をちらりと見た。');await A('何だよ。');
  await M('いや。秋月の「アキ」。猫にしちゃ、偶然だなと思って。');await A('猫の名前なんて、だいたい偶然だよ。');karma('t')}
async function keyBox(){
  if(G.flags.gotNurseKey){await N('空っぽのフックが並んでいる。「写真部暗室」の札だけ、フックごと引きちぎられている。');return}
  await N('キーボックス。フックの大半は空っぽだ。');await N('『保健室』の札の鍵が一本だけ、{s}ゆらゆら{/}と揺れている。風なんて、どこにもないのに。');
  await M('……親切だな。この学校、ツンデレか？');G.flags.gotNurseKey=1;await gotItem('key_nurse')}
async function fridge(){
  if(G.flags.fridge){await N('猫缶の山。……一缶だけフタが開いて、空になっている。さっきまで、全部閉まっていたのに。');return}
  G.flags.fridge=1;await N('職員室の冷蔵庫。電気は来ていないはずなのに、ドアの隙間から冷気が漏れている。');await M('……開けるぞ。');SE.door();await sleep(300);SE.sting();
  await N('{s}中に、びっしりと、猫缶。{/}');await N('上から下まで、隙間なく。賞味期限は、全部2004年。');
  await M('なんで職員室に猫缶が百個もあんだよ。');await A('……餌をやってたやつがいたんだよ。校舎に住み着いた、黒い子猫に。');await M('ふーん。お前の親戚か？');await A('さあな。');
  await N('猫缶の山の中に、ひとつだけ、ツナ缶が混じっていた。');await gotItem('tuna');
  await A('{d}……それ、私にくれてもいいんだぞ。{/}')}
async function magazine(){
  if(once('mag')){await N('机の上に、雑誌が一冊。『{r}月刊ヨルマガ{/}　2004年11月号』。');await M('うっわ、うちの雑誌じゃん。二十年前の。');
    await N('表紙の見出し：『戦慄！　現役女子高生が撮った“本物”の心霊写真』');await M('……「現役女子高生が撮った」。ここの生徒か。');
    await N('ページをめくる。問題の写真は、誰かに切り取られていた。記事の署名欄は、コーヒーの染みで読めない。');await M('肝心なとこ全部ねえじゃん。')}
  else await N('『月刊ヨルマガ』2004年11月号。切り取られた写真の跡を指でなぞると、紙がほんのり湿っている。')}
async function chair(){
  if(G.flags.chairBroken){await N('教頭の椅子だった物。');return}
  await N('背もたれに「教頭」と書かれた椅子。やたら座り心地がよさそうだ。');await M('疲れた。ちょっと座るわ。');SE.crack();G.flags.chairBroken=1;
  await N('バキッ。');await hurt();await N('椅子の脚が、四本同時に折れた。');await M('……なんで四本同時なんだよ……物理的におかしいだろ……','shake');
  await A('座る前に、座っていいか聞くべきだったな。');await M('椅子に!?')}

/* =========================================================
   1F 保健室
   ========================================================= */
MAPS.nurse={name:'1F　保健室',floor:'_',amb:.78,
  rows:[
  "XXXXXXXXXXXXXX",
  "XWWeWWWwWWWwWX",
  "XVVVVVVVVVVVVX",
  "XCC_____K__HHX",
  "X__________hhX",
  "X____________X",
  "X____________X",
  "X__________HHX",
  "X__________hhX",
  "X____________X",
  "XXXXXoXXXXXXXX"],
  events:()=>[
    exitAt(5,10,'corridor1',18,3,0),
    {x:3,y:1,act:async()=>{hideMsg();await showCanvas(eyeChart(false),Math.max(2,Math.floor(pxScale()*1.3)),'ランドルト環の視力検査表。いくつかの環が、赤ペンで丸く囲まれている。<br>下の余白に、赤い走り書き。');
      if(once('chart1')){await M('丸がついてるのが四つ。……上から順に、切れ目の向き、か。');await M('楽勝じゃん。');await A('……注意書きまで、ちゃんと読んだか？')}}},
    {x:3,y:6,art:'mirror',solid:true,act:mirrorStand,photo:()=>G.flags.tMirror?{cap:'姿見'}:{write:'アキハ　ワルクナイ',cap:'曇った鏡',after:mirrorPhoto}},
    {x:7,y:5,art:'model',solid:true,act:model,photo:()=>({cap:'人体模型',after:async()=>{await M(G.flags.modelBroken?'首なし人体模型。……これはさすがに載せられねえな。':'人体模型のドアップ。……子供が泣くやつだ。')}})},
    {x:8,y:6,art:'head',cond:()=>G.flags.modelBroken,act:async()=>{await N('人体模型の首。……まだ、笑っている。')}},
    {x:8,y:3,act:carte},
    {x:1,y:3,act:cabinet},{x:2,y:3,act:cabinet},
    ...[[11,7],[12,7],[11,8],[12,8]].map(([x,y])=>({x,y,act:curtainBed})),
  ],
  over:(c,cx,cy)=>{const x=11*16-cx,y=7*16-cy-10;if(!G.flags.curtainOpen){R(c,x-2,y,36,34,'rgba(200,205,210,.82)');for(let i=0;i<36;i+=4)R(c,x-2+i,y,1,34,'rgba(150,155,165,.9)');R(c,x-2,y,36,2,'#8a8f96')}},
  enter:async()=>{if(!once('cN'))return;await N('保健室。消毒液の匂いが、まだ、している。');await M('二十年経っても、匂いって残るもんか？');await A('残らないよ。普通はな。')}};
async function mirrorStand(){hideMsg();await showCanvas(eyeChart(true),Math.max(2,Math.floor(pxScale()*1.3)),'姿見に、壁の視力検査表が映っている。');
  if(once('mirror1')){await N('……鏡の中の自分が、ほんの少しだけ遅れて、瞬きをした。');await M('……寝不足だな。うん。','pale')}}
async function mirrorPhoto(){G.flags.tMirror=1;await M('……なんだこれ。鏡に、字。');await N('写真の中でだけ、鏡が湯気で曇っていて、指でなぞった字が浮かんでいる。');
  await N('『{g}アキハ　ワルクナイ{/}』');await M('……アキ。お前のことか？');await A('……。');await A('猫にしちゃ、よくある名前だろ。');await M('さっきも聞いたな、それ。');karma('t')}
async function model(){
  if(G.flags.modelBroken){await N('首のない人体模型。足元の首が、まだ笑っている。');return}
  const n=cnt('model');
  if(n===1){await N('人体模型。半分が皮膚、半分が筋肉と内臓。……内臓のパーツが一つ足りない。心臓だ。');await M('誰だよ持ってったの。')}
  else if(n===2){await N('人体模型の、皮膚の側の目が、こっちを見ている。');await M('……こっち見んな。');await A('触らぬ神に祟りなし、って知ってるか？')}
  else{await M('見んなっつってんだろ！','shake');SE.punch();shake(.3,4);await N('ミサカの右ストレートが、人体模型の顔面を捉えた。');SE.crack();G.flags.modelBroken=1;
    await N('首がもげた。転がった。ミサカの足元で止まって、こちらを見上げた。');SE.sting();await N('{r}……笑っている。{/}さっきまで、笑っていなかったのに。');
    await M('……。');await M('元に、戻しとこ。');await N('首は、はまらなかった。');await hurt();await M('しかも拳いてえ……。');await A('あーあ。');karma('e')}}
async function carte(){
  if(G.flags.tCarte){await N('保健室の机。来室記録の最後のページは、空白のままだ。');return}
  await N('保健室の机。引き出しに、来室記録のファイル。付箋のついたページがある。');
  await showDoc('保健室来室記録　２年Ａ組　白鳥ユキ',`９／２　　頭痛。教室に居づらいとのこと。
９／２０　「写真に写りたくない」と繰り返す。
　　　　　文化祭の展示の件か。担任に報告。
１０／１　写真部の秋月さんが迎えに来る。
　　　　　二人でしばらく話していた。
　　　　　ユキさんが、少し笑った。
１０／１２　「明日、暗室で最後の一枚を撮るんです」
　　　　　何の写真か聞いたが、教えてくれなかった。
　　　　　<span class="ink">うれしそうだった。</span>
１０／１３　`);
  G.flags.tCarte=1;await M('……「明日、暗室で最後の一枚を撮る」。');
  if(G.flags.tAttend)await M('十月十三日。出席簿の空白と、同じ日だ。');else await M('十月十三日、か。');
  await A('……。');karma('t')}
async function cabinet(){
  if(G.flags.gotDoll){await N('薬品棚。ラベルは全部、読めないくらい色褪せている。');return}
  await N('薬品棚。ガラス戸の奥、薬瓶の後ろに、手縫いのうさぎのぬいぐるみが隠すように置かれている。');
  await N('片耳がとれかけている。首のタグに、丸っこい字で『ユキ』。');G.flags.gotDoll=1;await gotItem('doll');
  await M('……保健室に、私物を隠してたのか。');await A('教室に置いとくと、捨てられるからな。')}
async function curtainBed(){
  if(!G.flags.curtainOpen){await N('仕切りのカーテンが閉まっている。向こうに、人の形の膨らみ。');await M('おーい、サボり？　……開けるぞ。');SE.curtain();G.flags.curtainOpen=1;await sleep(400);
    await N('誰もいない。');await N('シーツに手を当てる。{r}まだ、あたたかかった。{/}');await M('……アタシ、帰ったら絶対お祓い行くわ。経費で。');await A('落ちないだろ、それ。');return}
  await N('誰もいないベッド。枕に、長い黒髪が一本。')}

/* =========================================================
   1F 女子トイレ
   ========================================================= */
MAPS.toilet={name:'1F　女子トイレ',floor:'_',amb:.86,flicker:true,
  rows:[
  "XXXXXXXXXXXX",
  "XWMWMWWWWWWX",
  "XVVVVVtVtVtX",
  "X_k_k______X",
  "X__________X",
  "XL_________X",
  "X__________X",
  "X__________X",
  "XXXXXXXXoXXX"],
  events:()=>[
    exitAt(8,8,'corridor1',24,3,0),
    {x:1,y:5,act:async()=>{if(G.flags.gotBucket){await N('掃除用具入れ。モップが一本、なぜか濡れている。');return}
      await N('掃除用具入れ。モップ、ほうき、そして――バケツ。');G.flags.gotBucket=1;await gotItem('bucket');await M('バケツ……頭にかぶったら兜になるな。');await A('ならない。')}},
    {x:2,y:3,act:sink},
    {x:4,y:3,act:async()=>{await N('洗面台に、髪の毛が絡まっている。白い。……白い？');await M('アタシのじゃねえからな。');await A('あんたのだよ。今抜けた。');await M('ストレスだよ！！')}},
    ...[2,4].map(x=>({x,y:1,act:async()=>{await N('鏡に、指で書いたような跡がある。『{r}ミ　サ　カ{/}』。');await N('……鏡の、内側から。');await M('なんでアタシの名前知ってんだよ。……いや怖くねえ。気持ち悪いだけ。気持ち悪いだけだから。')},
      photo:()=>({ghost:'face',gdy:6,cap:'鏡',scare:true,after:async()=>{await M('……ッ！','shake');await M('い、今の、アタシの顔だよな？　アタシの顔ってことにしとくからな。')}})})),
    {x:6,y:2,act:async()=>{await N('一番目の個室。空っぽ。便器の中は……見ないほうがいい。')}},
    {x:8,y:2,act:async()=>{await N('二番目の個室。壁に落書き：『写真部の白鳥は　写真に写ると　死ぬ』');await M('……しょうもな。')}},
    {x:10,y:2,act:stall3},
  ],
  enter:async()=>{if(!once('cT'))return;G.fx.flick=.6;await N('女子トイレ。蛍光灯が、息をするみたいに明滅している。');await M('トイレの花子さんって、廃校にもいんのかね。');await A('三番目の個室をノックしてみれば？');await M('煽ってる？');await A('煽ってる。')}};
async function sink(){
  if(has('bucket')){await N('蛇口をひねると――');SE.splash();shake(.3,3);await N('{r}赤い水{/}が、勢いよく噴き出した。');await N('――ミサカの顔面に。');await hurt();
    await M('ぶっ……！　ぺっ、ぺっ！　鉄の味する！　鉄の味するって！','shake');await N('しばらくすると、水は透明になった。……錆だ。たぶん。錆だと思う。錆であれ。');
    take('bucket');SE.water();await M('……バケツに汲んどくか。何に使うか知らねえけど。');SE.item();give('water');await N('{y}水入りバケツ{/}を手に入れた。');return}
  if(has('water')||G.flags.flowerWater){await N('蛇口から、ぽたり、ぽたりと水が落ちている。');return}
  await N('蛇口をひねると、ゴボゴボと喉を鳴らすような音がした。……何か入れ物があれば、水が汲めそうだ。')}
async function stall3(){const n=cnt('stall3');
  if(n===1){SE.knock();await sleep(260);SE.knock();await N('コン、コン。');await sleep(900);SE.knock();await sleep(260);SE.knock();await N('{s}コン、コン。{/}');
    await N('……中から、返事が来た。');await M('花子さん？　インタビューいい？　顔出しNGでいいから。');await sleep(700);SE.knock();await N('コン。');await A('一回は「いいえ」だろうな。');await M('ノリ悪ぃな。')}
  else if(n===2){await M('開けるぞ。');SE.door();await sleep(300);await N('誰もいない。');await N('便座の上に、写真が一枚、伏せて置いてある。');
    await N('裏返す。――文化祭の人混みの写真。隅っこに、黒髪の女の子が写っている。');SE.sting();await N('{r}顔の部分だけ、爪で削り取られていた。{/}');await M('……。')}
  else await N('空っぽの個室。')}

/* =========================================================
   2F 廊下（ロッカー押し）
   ========================================================= */
const LOCK0=[[17,3],[18,3],[12,4],[14,4],[17,4],[12,5],[13,5],[15,5],[16,5],[14,6]];
MAPS.corridor2={name:'2F　廊下',floor:',',amb:.86,
  rows:[
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XWWWWnWgWwWQWwWWWwWWWwWQWwWQWWX",
  "XVVVVVVVVVVOVVVVVVVVVVVOVVVOVVX",
  "X===,,,,,,,,d,d,d,,,,,,,,,,,,,X",
  "X===,,,,,,,,,,,,,,d,,,,,,,,,,,X",
  "X===,,,,,,,,,,,,,,,,,,,,,,,,,,X",
  "X===,,,,,,,,,d,,d,,,,,,,,,,,,,X",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
  mutate:m=>{if(G.flags.graffitiErased)m.t[1][7]='W'},
  events:()=>[
    ...[3,4,5,6].map(y=>({x:1,y,touch:async()=>{await transfer('corridor1',30,4,1)}})),
    ...LOCK0.map(([x,y],i)=>({id:'lk'+i,x,y,art:'locker',solid:true,push:true,act:lockerAct})),
    {x:5,y:1,act:newspaper},
    {x:7,y:1,act:graffiti,use:{eraser:eraseGraffiti}},
    door(11,2,'corridor2',0,0,0,{locked:()=>true,onLocked:room2a}),
    door(23,2,'music',10,8,3),
    door(27,2,'darkroom',5,7,3,{locked:()=>!G.flags.darkOpen,onLocked:async()=>{
      if(has('key_dark')){SE.unlock();await N('{y}暗室の鍵{/}を差し込んだ。……回すと、鍵のほうが勝手に回った気がした。');take('key_dark');G.flags.darkOpen=1}
      else{SE.locked();await N('『写真部　暗室』。ドアの隙間から、赤い光が漏れている。鍵がかかっている。');if(once('darkLock')){await M('二十年前の廃校で、なんで電気が点いてんだよ。');await A('待ってるんだよ。')}}}}),
  ],
  zones:[{x:9,y:3,w:1,h:4,once:'footsteps',run:footsteps},{x:20,y:3,w:10,h:4,cond:()=>!G.flags.lockersDone,run:async()=>{G.flags.lockersDone=1;
    G.pushSaved.corridor2=Object.fromEntries(G.m.events.filter(e=>e.push).map(e=>[e.id,[e.x,e.y]]));SE.solve();await A('……抜けたな。押しの強さだけは一人前だ。');await M('褒めてんのか？');await A('半分な。')}}],
  enter:async()=>{
    if(!G.flags.lockersDone)for(const e of G.m.events)if(e.push){const i=+e.id.slice(2);e.x=e.ox=LOCK0[i][0];e.y=e.oy=LOCK0[i][1]}
    if(!once('c2'))return;
    await N('二階。空気が、一階より少しだけ冷たい。');
    const k=G.k;
    if(k.e>=2){await A('……ミサカ。あんた、この学校に好かれてきてるぞ。');await M('人気者はつらいね。');await A('褒めてない。')}
    else if(k.g>=2){await A('……あんた、案外、悪いやつじゃないのかもな。');await M('急に何。キモ。');await A('撤回する。')}
    else if(k.t>=2){await A('……嗅ぎ回るのが好きだな。記者らしい。');await M('記者だからな。');await A('契約のな。');await M('しつけえ！')}
    else{await A('……あんた、何しにここへ来たんだっけ。');await M('バズりにだよ。');await A('……そうだったな。')}
    await N('廊下の途中に、ロッカーが何本も倒れて、道を塞いでいる。');await M('バリケード第二弾かよ。この学校、家具で遊ぶの好きすぎだろ。')}};
async function lockerAct(){if(G.flags.lockersDone){await N('倒れたロッカー。扉の内側に、びっしりと落書き。『{r}写真部　出てけ{/}』。');return}
  await N('倒れたロッカー。押せば動きそうだ。');const c=await choose(['このまま','ロッカーを全部元に戻す'],{cancel:0});
  if(c===1){SE.push();for(const e of G.m.events)if(e.push){const i=+e.id.slice(2);e.x=e.ox=LOCK0[i][0];e.y=e.oy=LOCK0[i][1];e.t=1}
    const p=G.p;if(G.m.events.some(e=>e.push&&e.x===p.x&&e.y===p.y)||p.x>=12&&p.x<20){placePlayer(5,4,2)}
    await N('ガシャン、ガシャン……ロッカーが、ひとりでに元の位置へ戻っていった。');await M('……便利だけど、怖えよ。')}}
async function footsteps(){for(let i=0;i<4;i++){SE.foot();await sleep(420)}
  await N('……ぺた、ぺた。');await N('足音。後ろから。');await N('ミサカが止まると、足音も止まった。');
  await M('……おい猫。足音。');await A('猫は足音を立てない。');await M('じゃあ誰だよ。');await A('さあ。振り向いてみれば？');await M('……振り向いたら、負けな気がする。');await A('賢明だ。')}
async function newspaper(){
  if(G.flags.tNews){await N('『常夜高校新聞　第112号』。「縦内ミチル」の文字だけ、何度見ても変わらない。');return}
  await N('掲示板に、黄ばんだ学校新聞が一枚だけ残っている。');
  await showDoc('常夜高校新聞　第112号（平成16年10月1日）',`<b>写真部、快挙！</b>
部長・秋月ハルカさん（２年）の作品が
「月刊ヨルマガ」11月号に掲載決定！

文化祭で展示され、話題となった一枚。
取材に訪れた同誌記者の <span class="ink">縦内ミチル</span> さんは
「本物の迫力がある。ぜひ全国の読者に」と絶賛。

秋月部長のコメント
「部員の協力のおかげです。
　……ユキ、ありがとう」`);
  G.flags.tNews=1;
  await M('…………は？','pale');await M('縦内、ミチル。');await A('……知り合いか。');await M('……母ちゃんだよ。');
  await N('懐中電灯の光が、少しだけ揺れた。');
  await M('二十年前、ヨルマガで記者やってた。アタシが中二の時に辞めて……それからずっと、カメラ見るのも嫌がってた。');
  await M('アタシがヨルマガで働くって言った時も、三ヶ月、口きいてくれなかった。');await A('……そうか。');
  await M('……偶然だろ。縦内なんて苗字、そこらに――');await M('……いねえな。いねえわ。珍しい苗字だわ。');karma('t')}
async function graffiti(){
  if(G.flags.graffitiErased){await N('こすった跡が、白く残っている。');return}
  await N('壁一面の、赤いスプレーの落書き。');await N('『{r}ユキ　写るな{/}』『{r}幽霊部員{/}』『{r}のろわれろ{/}』');await M('……センスねえ落書き。字も汚ねえ。');
  if(has('eraser'))await eraseGraffiti()}
async function eraseGraffiti(){await M('……チッ。');await N('ミサカは黒板消しで、壁をこすり始めた。');for(let i=0;i<3;i++){noise(.25,{vol:.12,freq:2000,type:'bandpass',q:1});await sleep(320)}
  await N('スプレーは、チョークみたいには消えない。それでも、こすった。');await N('腕が痛くなるまで、こすった。');
  setTile(7,1,'W');G.flags.graffitiErased=1;await N('「写るな」の文字が、かすれて、読めなくなった。');
  await M('……目障りだっただけだ。深い意味はねえ。');await A('深い意味がないやつは、そんなに腕を真っ赤にしない。');karma('g')}
async function room2a(){
  if(once('r2a')){await N('『二年A組』……一階にも同じ名前の教室があった。こっちは鍵がかかっている。');SE.knock();await sleep(250);SE.knock();
    await N('コン、コン。');await N('{s}内側から、ノックされた。{/}');await Y('{s}あけて{/}');await M('……開けねえよ。鍵持ってねえし。持ってても開けねえし。','pale')}
  else{SE.locked();await N('鍵がかかっている。中は、しんとしている。')}}

/* =========================================================
   2F 音楽室
   ========================================================= */
MAPS.music={name:'2F　音楽室',floor:'.',amb:.82,
  rows:[
  "XXXXXXXXXXXXXX",
  "XWPWPWwWPWPWWX",
  "XVVVVVVVVVVVVX",
  "XYy..........X",
  "X............X",
  "X..c.c.c.c...X",
  "X............X",
  "X..c.c.c.c...X",
  "X............X",
  "XXXXXXXXXXoXXX"],
  events:()=>[
    exitAt(10,9,'corridor2',23,3,0),
    {x:1,y:3,act:pianoAct},{x:2,y:3,act:pianoAct},
    {x:4,y:3,art:'stand',solid:true,dy:-8,act:async()=>{hideMsg();await showCanvas(sheetArt(),Math.max(2,Math.floor(pxScale()*1.2)),'手書きの楽譜。題は『最後の授業のために』。<br>隅に小さく、「ユキへ　ハルカより」。');if(once('sheet1'))await M('……ドレミくらいは読める。たぶん。')}},
    ...[[2,0],[4,1],[8,2],[10,3]].map(([x,i])=>({x,y:1,act:async()=>{
      const t=['バッハ。……目が合った。','ベートーヴェン。眉間のしわが、さっきより深い。','モーツァルト。口元が、にやにやしている。','……誰だこれ。音楽の教科書で見たことがない。黒髪の、女の子の肖像画。'][i];
      if(i===3&&G.flags.pianoDone){glitch(.4);SE.sting();await N('四枚目の肖像画に描かれていたのは――セーラー服を着た、白い髪の女だった。');await M('肖像権！！','shake');return}
      await N(t)}})),
  ],
  over:(c,cx,cy)=>{if(G.flags.pianoDone){const x=10*16-cx,y=16-cy;R(c,x+6,y+4,4,2,'#e8e5dc');R(c,x+6,y+6,4,4,'#f2d7c9');P(c,x+7,y+7,'#e3203b');P(c,x+9,y+7,'#e3203b');R(c,x+5,y+10,6,4,'#3c3f4b');P(c,x+7,y+10,'#e2304b')}},
  enter:async()=>{if(!once('cM'))return;await sleep(300);SE.piano(233);await N('――ポーン。');await N('誰も触れていないピアノが、一音だけ鳴った。');await M('……自動演奏機能付き？　二十年前のピアノに？');await A('ついてないよ。')}};
async function pianoAct(){
  if(G.flags.pianoDone){await N('鍵盤蓋は閉じたままだ。……もう、開けたくない。');return}
  await N('アップライトピアノ。蓋は開いている。鍵盤が、黄ばんだ歯みたいに並んでいる。');
  const c=await choose(['弾いてみる','やめておく'],{cancel:1});if(c!==0)return;hideMsg();
  const r=await piano();if(r===null)return;
  if(!r){SE.wrongPiano();glitch(.4);await N('不協和音が、教室中に響いた。');await N('壁の肖像画の目が、一斉にこちらを向いた――気がした。');await M(pick(['うるせえ、音楽の成績は２だったんだよ！','……今のはピアノの調律が悪い。','楽譜が悪い。アタシは悪くない。']));return}
  G.flags.pianoDone=1;await sleep(400);SE.solve();await sleep(900);
  await N('最後の一音が、消えた瞬間――');SE.thud();shake(.4,4);await N('鍵盤蓋が、{s}バタンッ{/}と落ちてきた。');await N('ミサカの指の上に。');await hurt();
  await M('ぎゃあああああああ！！！','shake');await A('……今のは、ちょっと笑った。');await M('笑うな！！');
  await N('鍵盤蓋の裏に、鍵がテープで留めてある。『写真部　暗室』。');await gotItem('key_dark')}

/* =========================================================
   2F 写真部暗室（最終）
   ========================================================= */
MAPS.darkroom={name:'2F　写真部暗室',floor:':',amb:.62,dark:[24,0,6],tint:'rgb(255,120,120)',lamp:44,
  rows:[
  "XXXXXXXXXXXX",
  "XWWlWWWWlWWX",
  "XVVVVVVVVVVX",
  "XRRR::::::EX",
  "X::::::::::X",
  "X::::::::::X",
  "X::::::::::X",
  "X::::::::::X",
  "XXXXXoXXXXXX"],
  lights:()=>[[5*16,4*16,120,.5]],
  events:()=>[
    exitAt(5,8,'corridor2',27,3,0),
    ...[1,2,3].map(x=>({x,y:3,act:trayAct})),
    {x:4,y:4,art:'photos',solid:true,z:-20,dy:-6,act:lineAct},...[5,6,7,8].map(x=>({x,y:4,solid:true,act:lineAct})),
    {x:9,y:6,art:'tripod',solid:true,dy:-8,act:async()=>{await N('三脚に据えられた古いフィルムカメラ。フィルムカウンターは「36」。最後の一枚まで、撮り切られている。');await N('……巻き戻されないまま、二十年。');if(G.k.g>=2)await M('現像されてないフィルム、か。……トレイ、使えんのかな。')}},
    {x:10,y:3,act:async()=>{await N('引き伸ばし機。レンズの下に、焼きかけの印画紙が一枚。……真っ白だ。')}},
    {id:'yuki',x:8,y:6,art:'yuki',solid:true,cond:()=>G.flags.yukiMet&&!G.flags.ending,act:yukiTalk,photo:()=>({ghost:'yuki',cap:'……',after:evilChoice})},
    {id:'akiNPC',x:4,y:7,draw:(c,x,y)=>c.drawImage(SPR.aki[2][0],x,y+1),cond:()=>G.flags.yukiMet&&!G.flags.akiFree,act:akiFinal},
  ],
  enter:async()=>{
    if(G.flags.yukiMet){G.cat.on=false;return}
    await sleep(300);
    await N('赤い。');await N('写真部の暗室は、安全光の赤い電球に照らされていた。二十年ぶりのはずなのに、電球は点いていた。');
    await N('現像液の、酸っぱい匂い。ロープに吊るされた、何十枚もの印画紙。三脚の上の、古いフィルムカメラ。');
    await N('そして、部屋の隅に――');
    G.flags.yukiMet=1;const y=G.m.events.find(e=>e.id==='yuki');for(let a=0;a<=10;a++){y.alpha=a/10*.8;await sleep(60)}delete y.alpha;SE.scare();shake(.4,2);
    await Y('……だれ？');await M('……っ。','pale');await M('……ど、どうも。月刊ヨルマガの――');
    glitch(1);SE.glitch();G.fx.dark=.25;await Y('{r}{s}ヨルマガ{/}');shake(.6,3);await Y('{r}{s}ヨルマガ　ヨルマガ　ヨルマガ　ヨルマガ　ヨルマガ　ヨルマガ{/}');
    await M('あ、ヤベ。地雷踏んだ。','shake');
    await A('――ユキ。');G.fx.dark=0;await sleep(500);G.flags.yukiNamed=1;
    await Y('……ハルカ、ちゃん？');
    await A('……ここから先は、あんたの仕事だ、ミサカ。');await A('私には、あの子に触る資格がない。');
    await M('資格とか知らねえよ。……で、アタシは何すりゃいいんだ。');
    await A('知らない。あんたが今夜、何を拾って、何を壊して、何を見てきたか。それ次第だ。');
    await A('{d}（やり残したことがあるなら、戻ってもいい。あの子はもう二十年待ってる。あと少し待つくらい、なんでもない）{/}');
    G.cat.on=false;const ok=saveGame();if(ok)toast('オートセーブしました','#a6f23c')}};
async function yukiTalk(){const n=cnt('yukiTalk');
  const t=[['……写真、撮りにきたの？','ghost'],['みんな、わたしを撮りにくる。幽霊を、撮りにくる。'],['……ハルカちゃんは、わるくないよ。'],['窓の外、見てただけなのにね。'],['……あなたも、写真、すき？']];
  await Y(t[(n-1)%t.length][0]);if(n===3)await M('……。')}
async function akiFinal(){SE.meow();await A('選ぶのはあんただ。');
  const k=G.k,good=k.g>=2,truth=k.t>=3&&G.flags.tNews;
  if(good)await A('あんたは今夜、あの子のために、いくつか「余計なこと」をした。……現像トレイを見てみろ。');
  if(truth)await A('あんたは嗅ぎ回った。全部じゃないが、十分だ。……吊るされた写真を見てみろ。');
  if(!good&&!truth)await A('今のあんたにできるのは、たぶん、撮ることだけだ。それが嫌なら、戻って、やり残したことを探せ。');
  else if(!good)await A('{d}（あの子に何かしてやれることがあれば……トレイの方も、変わるかもな）{/}');
  else if(!truth)await A('{d}（この学校の記録を、もう少し拾えば……写真の方も、見えるかもな）{/}');
  await A('撮りたいなら、撮ればいい。あんたは、そのために来たんだろ。');await A('{r}……ただし、戻れないぞ。{/}')}
async function trayAct(){
  if(G.k.g<2){await N('現像トレイ。中の液体は、どろりと濁っている。');await N('……何かが足りない気がする。この液体に浸すべきもの――じゃなくて、浸す「資格」みたいな何かが。');return}
  await N('現像トレイ。液体が、澄んでいる。さっきまで濁っていたはずなのに。');
  const c=await choose(['三脚のカメラのフィルムを現像する','やめておく'],{cancel:1});if(c===0)await endGood()}
async function lineAct(){
  if(!(G.k.t>=3&&G.flags.tNews)){await N('吊るされた印画紙は、どれも真っ黒で、何も写っていない。');await N('……何も知らない人間には、何も見えない。そう言われている気がした。');return}
  await N('吊るされた印画紙。……真っ黒だったはずの紙に、うっすらと像が浮かんでいる。');
  const c=await choose(['一枚ずつ、めくっていく','やめておく'],{cancel:1});if(c===0)await endTruth()}
async function evilChoice(){await M('……撮れた。');await N('写真の中のユキは、こちらを見ていた。');await M('……もっと。もっと、はっきり撮れば。');
  const c=await choose(['フラッシュを焚いて、正面から撮る','……やめとく'],{cancel:1});if(c===0)await endEvil();else await A('……それでいい。今は、な。')}

/* =========================================================
   endings
   ========================================================= */
function clubPhoto(){const W=128,H=96,c2=mk(W,H),c=c2.getContext('2d');
  R(c,0,0,W,H,'#c8b08a');R(c,0,64,W,32,'#8a6a48');for(let i=0;i<W;i+=8)R(c,i,64,1,32,'#7a5a3a');
  R(c,78,8,40,40,'#f8eccc');R(c,97,8,2,40,'#b8a078');R(c,78,27,40,2,'#b8a078');c.fillStyle='rgba(255,240,200,.35)';c.beginPath();c.moveTo(78,48);c.lineTo(118,48);c.lineTo(90,92);c.lineTo(40,92);c.fill();
  // short-haired girl (Haruka)
  R(c,30,28,14,12,'#2a2024');R(c,32,32,10,10,'#f0d0b8');P(c,34,36,'#2a2024');P(c,39,36,'#2a2024');R(c,35,39,3,1,'#a05050');R(c,28,42,18,24,'#303a50');R(c,33,42,8,4,'#e8e8e8');R(c,35,44,4,6,'#b02030');R(c,46,34,2,9,'#f0d0b8');R(c,45,31,1,4,'#f0d0b8');R(c,47,31,1,4,'#f0d0b8');R(c,30,66,5,12,'#303a50');R(c,39,66,5,12,'#303a50');
  // long-haired girl (Yuki), smiling
  R(c,54,24,16,34,'#141018');R(c,57,29,10,11,'#f4dcc8');P(c,59,33,'#2a2024');P(c,64,33,'#2a2024');R(c,60,36,4,1,'#c06060');P(c,59,37,'#e0a0a0');P(c,65,37,'#e0a0a0');R(c,55,42,14,24,'#e8e8ec');R(c,59,42,6,3,'#b02030');R(c,55,58,14,10,'#283044');R(c,57,68,4,10,'#f0d8c8');R(c,63,68,4,10,'#f0d8c8');
  // kitten
  R(c,46,82,10,7,'#1a161c');R(c,53,78,6,6,'#1a161c');P(c,53,77,'#1a161c');P(c,58,77,'#1a161c');P(c,55,80,'#a6f23c');P(c,57,80,'#a6f23c');R(c,43,80,3,2,'#1a161c');
  const id=c.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const g=d[i]*.3+d[i+1]*.59+d[i+2]*.11,n=(Math.random()*2-1)*10;d[i]=clamp(g*1.08+18+n,0,255);d[i+1]=clamp(g*.98+8+n,0,255);d[i+2]=clamp(g*.8+n,0,255)}c.putImageData(id,0,0);
  stamp(c,"'04 10 13",W-40,H-9,'#ff9a30');return c2}
function evilPhoto(){const W=128,H=96,c2=mk(W,H),c=c2.getContext('2d');R(c,0,0,W,H,'#f4eeee');
  c.globalAlpha=.9;for(let i=0;i<26;i++){c.save();c.translate(6+((i*37)%118),6+((i*53)%86));c.rotate((i%5)*.5-1);c.drawImage(SPR.hand,-8,-8);c.restore()}c.globalAlpha=1;
  c.drawImage(SPR.misaka[0][1],48,24,32,48);c.globalAlpha=.35;c.drawImage(SPR.yuki,84,30,24,36);c.globalAlpha=1;
  const id=c.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const g=d[i]*.3+d[i+1]*.59+d[i+2]*.11,n=(Math.random()*2-1)*16;d[i]=clamp(g+n+6,0,255);d[i+1]=clamp(g+n,0,255);d[i+2]=clamp(g+n,0,255)}c.putImageData(id,0,0);
  stamp(c,"'04 10 13",W-40,H-9,'#ff9a30');return c2}
async function showPrint(canvas,cap){const s=pxScale();const w=document.createElement('div');w.className='polaroid';canvas.className='pixcv';canvas.style.width=Math.min(128*s*1.5,innerWidth*.72)+'px';w.appendChild(canvas);
  const cc=document.createElement('div');cc.className='cap';cc.textContent=cap;w.appendChild(cc);const d=openOv(w,'');d.style.cssText='background:none;border:0';d.addEventListener('pointerdown',e=>{e.stopPropagation();press('ok')});await waitKey();closeOv()}
async function endCard(no,title){addEnding(no);G.flags.ending=1;
  await novel(['---',`#END ${no}`,`^「${title}」`,'',`~撮った写真　${G.photos}枚　／　ミサカの被害　${G.dmg}回`,`~善 ${G.k.g}　悪 ${G.k.e}　謎 ${G.k.t}　／　アキに聞いた回数　${G.hints}`,`~回収したエンド ${readEndings().length} / 3`,'~――タップでタイトルへ']);
  await fade(1,900);toTitle()}
async function endGood(){G.p.dir=3;
  await N('ミサカは、三脚のカメラからフィルムを抜き取った。');await N('現像のやり方なんて知らない。……知らないはずなのに、手が勝手に動いた。');
  await N('いや。誰かが、ミサカの手に手を重ねて、動かしている。');await N('冷たい手だった。でも、震えてはいなかった。');SE.water();await sleep(600);
  await N('現像液に浸した印画紙に、ゆっくりと、像が浮かび上がる。');hideMsg();await showPrint(clubPhoto(),'写真部');
  await N('写真部の部室。午後の光。');await N('無愛想な顔でピースをしている、ショートカットの女の子。');await N('その隣で、困ったように、でも確かに笑っている、長い黒髪の女の子。');await N('二人の足元に、黒い子猫。');
  await Y('……これ。');await Y('撮れてたんだ。');
  await M('……心霊写真じゃ、ねえな。');await M('どこにも幽霊なんか写ってねえ。ただの女子高生二人と、猫一匹だ。');await M('……バズらねえよ、こんなの。');
  await Y('……うん。');await Y('それが、よかったの。');
  await Y('わたし、ずっと「幽霊」って呼ばれてた。文化祭の写真で、窓に顔が浮かんでたから。');
  await Y('ほんとはね、窓の外を見てただけなの。……それを「もっと怖くしよう」って言ったのは、大人の人。');
  await Y('だから最後に、ハルカちゃんにお願いしたの。普通の写真、撮りなおしてって。');await Y('幽霊じゃない、わたしを。');await Y('……現像する前に、わたし、ここで。');
  const ak=G.m.events.find(e=>e.id==='akiNPC');if(ak){ak.ox=ak.x;ak.oy=ak.y;ak.x=7;ak.y=6;ak.t=0}await sleep(500);
  await A('……ユキ。');await A('ごめん。私、あの日――');await Y('知ってる。');await Y('ハルカちゃん、二十年も猫やってたの？');
  await A('……他に、ここにいていい形が、思いつかなかった。');await Y('ばかだなあ。');
  await Y('……ありがとう、ミサカさん。');await Y('写真、すきになってね。');
  hideMsg();SE.bell();G.fx.flash=0;await fade(1,1800);
  await novel(['赤い電球が、ふっと消えた。','代わりに、窓の目張りの隙間から、白い光が差し込んでいた。','朝だった。','---',
    '正面玄関の鎖は、錆びて、床に落ちていた。','ガラス戸を押す。あっけなく開いた。','山の向こうが、薄く明るい。','足元で、黒猫が「にゃあ」と鳴いた。',
    'm:……おい、アキ？','猫はもう、喋らなかった。','ただ、当たり前みたいな顔をして、ミサカの後ろをついてきた。','m:……チッ。餌代、経費で落ちっかな。','---',
    `カメラのメモリーカードには、真っ黒な画像が${G.photos}枚。`,'一枚も、バズりそうになかった。','ポケットの中に、印画紙が一枚だけ入っていた。','二人の女の子と、一匹の猫。','m:……まあ、いいか。']);
  await endCard(1,'ネガフィルムの向こう側')}
async function endEvil(){
  await M('……悪ぃな。');await N('ミサカは、カメラを構えた。');await A('ミサカ、やめ――','shake');hideMsg();
  SE.shutter();G.fx.flash=3;await sleep(150);SE.scare();glitch(1.6);shake(1,5);await sleep(1400);await fade(1,200);
  await novel(['フラッシュが、赤い部屋を真っ白に焼いた。','一瞬だけ、見えた。','ユキの顔。泣いているのか笑っているのか、わからない顔。','それから――無数の手。',
    '暗室の壁という壁から生えた、白い手、手、手。','全部、ミサカに向かって、ピースサインをしていた。','---',
    '気がつくと、朝の県道に立っていた。','どうやって出たのか、覚えていない。','カメラだけが、手の中で、生き物みたいに温かかった。']);
  novelEl.innerHTML='';await snsPost();
  await novel(['m:……ハハ。やった。やったぞ。','m:百万いいね。正社員だ。ざまあみろ、ハゲ。','m:……「後ろの人、だれ？」','ミサカは写真を拡大した。',
    '真っ白な暗室。ピースをする、無数の白い手。','その真ん中に写っているのは――','セーラー服を着た、白い髪の女。','縦内ミサカ、本人だった。',
    'm:……じゃあ。','m:今これを見てるアタシは、どこにいんの？','---','赤い部屋の隅で、黒い猫が、あくびをした。',
    'a:言ったろ。あんたみたいなのが一番、ここに好かれるって。','a:……ようこそ、写真部へ。新入部員。']);
  await endCard(2,'100万いいねの幽霊')}
async function snsPost(){G.mode='sns';
  const wrap=document.createElement('div');wrap.style.cssText='background:#f3f1ec;color:#1c1a20;max-width:92%;width:22em;box-sizing:border-box;padding:.8em;font-size:max(12px,calc(var(--s)*6.6));line-height:1.5;box-shadow:0 0 0 var(--s) #000';
  wrap.innerHTML=`<div style="display:flex;gap:.5em;align-items:center"><div style="width:2.2em;height:2.2em;border-radius:50%;background:#1c1a20;color:#f3f1ec;display:flex;align-items:center;justify-content:center">M</div><div><b>縦内ミサカ＠ヨルマガ</b><div style="color:#7a7580">@misaka_yorumaga ・ 3時間前</div></div></div>
  <div style="margin:.5em 0">【ガチ】廃校の暗室で撮れた。加工なし。<br><span style="color:#b01828">#心霊写真 #廃墟 #閲覧注意</span></div><div id="snsimg"></div>
  <div style="display:flex;gap:1.5em;margin:.4em 0;font-variant-numeric:tabular-nums"><span>♡ <b id="likes">0</b></span><span>⟲ <b id="rts">0</b></span></div><div id="cmts" style="border-top:1px solid #d8d4cc;padding-top:.3em;min-height:6em"></div>`;
  const d=openOv(wrap,'');d.style.cssText='background:none;border:0;max-width:100%';d.addEventListener('pointerdown',e=>{e.stopPropagation();press('ok')});
  const im=evilPhoto();im.className='pixcv';im.style.width='100%';wrap.querySelector('#snsimg').appendChild(im);
  const L=wrap.querySelector('#likes'),RT=wrap.querySelector('#rts'),C=wrap.querySelector('#cmts');
  for(let i=0;i<=40;i++){const k=i/40,e=k*k;L.textContent=Math.floor(1024881*e).toLocaleString();RT.textContent=Math.floor(88410*e).toLocaleString();if(i%4===0)SE.blipN();await sleep(45)}
  const cs=['本物じゃん','鳥肌やばい','これ加工？　加工だよね？','後ろの人だれ？','後ろの人だれ？','後ろの人だれ','うしろのひと　だれ','<span style="color:#b01828">うしろの　ひと　あなた</span>'];
  for(const t of cs){const p=document.createElement('div');p.innerHTML='・'+t;C.appendChild(p);while(C.children.length>5)C.firstChild.remove();SE.blip();await sleep(t.includes('span')?900:520)}
  SE.sting();await waitKey();closeOv();G.mode='play'}
async function endTruth(){G.flags.lineBright=1;
  await N('真っ黒だったはずの印画紙に、はっきりと像が浮かんでいた。');
  await N('一枚目。文化祭の展示。『写真部　秋月ハルカ　作品「窓」』。窓辺の少女。……ガラスに、白い顔が浮かんでいる。');
  await N('二枚目。同じ写真の、ネガ。……ガラスに、顔はない。');await M('……二重露光。後から、顔を焼き込んだのか。');
  await N('三枚目。職員室で、若い女が手帳を広げている。首から下げた記者証。『月刊ヨルマガ　縦内ミチル』。');await M('……母ちゃん、若っ。');
  await N('四枚目。暗室のドア。外側から、南京錠。日付の焼き込み――{r}\'04 10 13{/}。');
  await A('……全部、話すよ。');
  await A('二十年前。私は写真部の部長で、ユキは、たった一人の部員だった。');
  await A('文化祭で、私はユキを撮った。窓の外を見てる、ただのポートレートだ。');
  await A('でも、取材に来た記者が言ったんだ。「これ、心霊写真ってことにしない？　その方が載るよ」って。');
  await A('私は断らなかった。多重露光で、窓にユキの顔を浮かべた。……褒められたかったんだ。雑誌に、載りたかった。');
  await M('…………。');
  await A('写真は載った。次の日から、ユキは「幽霊」になった。');
  await A('机に彫られた字、見たろ。靴箱の「ごめんね」は、私が書いた。本人の前では、言えなかった。');
  await A('十月十三日。ユキは、ここで最後の一枚を撮り直すって言った。「今度は、普通の写真を撮って」って。');
  await A('私は、来なかった。怖くて。……暗室の鍵を、持ったまま。');
  await A('ユキは、中で待ってた。誰かが、外から南京錠をかけた。ユキを「幽霊」って呼んでたやつらだ。……ふざけ半分で。');
  await A('私が、来ていれば。');
  await Y('ハルカちゃん。');await Y('わたし、待ってたんじゃないよ。');await Y('ずっと、撮り直してほしかっただけ。');
  await M('……おい。ユキ。それと、猫。');await M('アタシは記者だ。契約だけどな。');
  await M('盛った写真で人を殺したのが記者なら――それを書き直すのも、記者の仕事だろ。');
  await M('今夜撮ったもんは、全部消す。そんで、書く。二十年前、この学校で何があったか。誰が盛って、誰が黙って、誰が死んだか。');
  await M('母ちゃんの名前も、ちゃんと書く。……逃げさせねえ。アタシも逃げねえ。');
  await A('……ミチルさんは、逃げてないよ。');
  await A('あの人は、何度もここに来た。廃校になった後も。カメラを持たずに。献花台の花は、途中まで、あの人が替えてたんだ。');
  await M('……母ちゃん、たまに夜いなかった。男だと思ってた。');await A('最低だな、娘。');await M('うっせえ。');
  await M('……タイトルは、そうだな。');hideMsg();glitch(.8);SE.bell();await fade(1,900);
  await novel(['#心霊写真は盛れない','---','ユキが、笑った気がした。','赤い電球が消えて、白い朝が来た。','---',
    '三ヶ月後。','月刊ヨルマガの最終ページに、小さな記事が載った。','見出しは『心霊写真は盛れない――常夜高校、二十年目の訂正記事』。','写真は一枚もない、文字だけの記事だった。',
    'バズりは、しなかった。','いいねは、四十七。','そのうちの一つは、アカウント名「Haruka_A」。アイコンは、黒猫だった。','もう一つは――母からだった。',
    'm:……既読つけたなら、電話くらいしてこいよ。',()=>{SE.phone();return sleep(900)},'スマホが、鳴った。']);
  await endCard(3,'心霊写真は盛れない')}

/* =========================================================
   start
   ========================================================= */
const PROLOGUE=['~午前一時十三分。','県道から外れた山の中腹に、その学校はある。','私立常夜（とこよ）高等学校。二十年前に廃校。',
  '理由は「生徒数の減少」――ということになっている。','……「ということになっている」という言い回しが、ネットの連中は大好きだ。','---',
  'm:よっ……と。','割れた窓枠をまたいで、女がひとり、校舎に降り立った。','白い髪。赤い目。黒いセーラー服。首からぶら下げた一眼レフ。',
  'm:ハッ、ガバガバじゃん、セキュリティ。窓ガラス一枚割れてりゃ、そりゃ入るだろ。入るよな？　入った。',
  'm:縦内ミサカ、二十三歳。月刊ヨルマガ契約記者。本日の衣装、セーラー服。理由、廃校に映えるから。','m:……誰に言い訳してんだ、アタシは。','---',
  'm:いいか。今夜ここで一枚、バズる写真を撮る。','m:心霊でも廃墟でも何でもいい。いいねが万単位でつくやつだ。','m:そしたら編集長のハゲ頭に、正社員の辞令を書かせてやる。',
  'ミサカは懐中電灯を点けた。','光の輪の中で、二十年分の埃が、雪みたいに舞っていた。'];
async function newGame(){resetState();G.mode='play';loadMap('entrance');placePlayer(3,3,0);updateCam();
  await novel(PROLOGUE);{const f=$('#fade');f.style.transition='none';f.style.opacity=1}closeNovel();
  run(async()=>{await fade(0,900);where(G.m.name);await introScene()})}
function boot(data){buildCharSprites();fit();requestAnimationFrame(frame);setTimeout(fit,300);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  const s=data&&data.save;if(s){G.mode='title';resume(s)}else toTitle()}
try{window.claude?.hot?.snapshot?.(()=>({save:G.mode==='play'&&G.m?snapshot():null}))}catch(e){}
if(window.claude?.hot?.ready)window.claude.hot.ready(boot);else boot(window.claude?.hot?.data??{});
