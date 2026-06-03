(() => {
  'use strict';

  const SAVE_KEY = 'seiiki-frontier-save-v9';
  const AS = 'assets/img/';
  const VERSION = 8;

  const RESOURCES = {
    materials:{label:'資材', icon:'materials', use:'開発、植民、艦船建造、防衛施設に使う基礎資源。', gain:'鉱物系の惑星・衛星・小惑星帯を開発すると増えます。', advice:'序盤は足りなくなりやすいです。植民直後は維持費で赤字になりやすいので、開発を重ねて黒字化しましょう。'},
    research:{label:'研究', icon:'research', use:'探索範囲、恒星開発、ワープ、艦隊、防衛などの技術を解放します。', gain:'母星、遺跡、氷結星、研究施設で増えます。', advice:'このゲームの戦略の軸です。研究を後回しにすると、外惑星や敵星系へ進めません。'},
    influence:{label:'影響', icon:'influence', use:'探索、植民、星系内の支配拡大に使います。', gain:'人口の多い惑星、首都、行政技術で増えます。', advice:'探索と植民の入口です。資材があっても影響が切れると星域は広がりません。'},
    energy:{label:'電力', icon:'energy', use:'恒星チャージ、艦隊強化、ワープ航法、高位施設に使います。', gain:'恒星、火山星、ガス巨星、恒星開発で増えます。', advice:'敵星系へ出るには恒星エネルギーの運用が必要です。内政だけでなく侵攻準備にも関わります。'},
    food:{label:'食料', icon:'food', use:'人口維持と植民地の成長に必要です。', gain:'豊穣星、海洋星、農業ドームで増えます。', advice:'植民直後は人口を支えるために食料を消費します。黒字化するまでは広げすぎに注意。'},
    crystal:{label:'結晶', icon:'crystal', use:'上位艦、シールド、特殊研究、ワープ安定化に使います。', gain:'結晶星、遺跡、小惑星帯から入手できます。', advice:'数は少ないですが、後半の艦隊・防衛・特殊技術の差になります。'},
    credits:{label:'信用', icon:'credits', use:'不足資源の補助、商業技術、艦隊運用の柔軟性に使います。', gain:'人口、商業系技術、交易施設で増えます。', advice:'直接勝つ資源ではありませんが、足りない資源を補う余力になります。'}
  };
  const RESOURCE_ORDER = ['materials','research','influence','energy','food','crystal','credits'];

  const BODY_TYPES = {
    star:{name:'恒星', img:'anomaly', yields:{energy:16,research:2}, note:'恒星は通常の植民地ではなく、星系間移動のためのエネルギーを充填する特別拠点です。'},
    home:{name:'母星', img:'terran', yields:{materials:10,research:8,influence:9,energy:5,food:9,credits:6}, note:'帝国の中核です。母星を失うとその帝国は敗退します。'},
    moon:{name:'衛星', img:'moon', yields:{materials:6,research:3,influence:2,energy:2,food:0,crystal:1,credits:1}, note:'最初から探索できる近場の拡張先です。産出は小さめですが、序盤の練習に向きます。'},
    terran:{name:'豊穣惑星', img:'terran', yields:{materials:7,research:4,influence:5,energy:3,food:11,credits:4}, note:'食料と人口の伸びに優れた惑星です。'},
    desert:{name:'砂漠惑星', img:'desert', yields:{materials:10,research:3,influence:3,energy:6,food:1,crystal:2,credits:3}, note:'資材と電力が強い一方、食料維持に注意が必要です。'},
    ocean:{name:'海洋惑星', img:'ocean', yields:{materials:4,research:5,influence:4,energy:3,food:12,credits:4}, note:'食料と人口成長に向く安定型の惑星です。'},
    volcanic:{name:'火山惑星', img:'volcanic', yields:{materials:13,research:3,influence:2,energy:10,food:0,crystal:4,credits:2}, note:'資材・電力・結晶が強いが、維持に食料を持ち出しやすい惑星です。'},
    ice:{name:'氷結惑星', img:'ice', yields:{materials:5,research:9,influence:3,energy:4,food:2,crystal:3,credits:3}, note:'研究向きの惑星です。'},
    gas:{name:'ガス巨星', img:'gas_giant', yields:{materials:3,research:4,influence:2,energy:15,food:0,crystal:2,credits:4}, note:'電力源として強い惑星です。'},
    crystal:{name:'結晶惑星', img:'crystal', yields:{materials:5,research:7,influence:2,energy:4,food:0,crystal:11,credits:4}, note:'希少資源を得るための重要惑星です。'},
    relic:{name:'遺跡惑星', img:'relic', yields:{materials:4,research:13,influence:6,energy:3,food:2,crystal:5,credits:5}, note:'研究と結晶が高く、技術勝利に近づきやすい惑星です。'},
    belt:{name:'小惑星帯', img:'asteroid', yields:{materials:15,research:2,influence:1,energy:2,food:0,crystal:5,credits:2}, note:'資材獲得に優れた開発対象です。'}
  };

  const DOCTRINES = {
    tech:{name:'技術国家', short:'研究', image:'tech', color:'#6ee7ff', desc:'研究速度と高位技術に優れる。少ない領土でも技術で伸びる文明。'},
    war:{name:'軍事国家', short:'艦隊', image:'war', color:'#ff6b6b', desc:'艦隊建造と侵攻に優れる。早めに戦力化して圧力をかける文明。'},
    trade:{name:'商業国家', short:'信用', image:'trade', color:'#ffd37a', desc:'信用・交易・不足補填に優れる。資源の偏りを吸収して伸びる文明。'},
    eco:{name:'生態国家', short:'人口', image:'eco', color:'#69f0a4', desc:'人口と食料に優れる。植民地を育てて長期的な産出で勝つ文明。'},
    mystic:{name:'秘教国家', short:'遺物', image:'mystic', color:'#c589ff', desc:'遺跡・結晶・特殊研究に優れる。標準ルートと違う伸び方をする文明。'}
  };
  const CPU_DOCTRINES = ['machine','eco','war','trade'];
  const CPU_IMAGES = {machine:'machine',eco:'eco',war:'war',trade:'trade'};
  const CPU_NAMES = ['黒曜機構','緑星協約','赤環艦隊','黄昏商圏'];

  const SHIPS = {
    scout:{name:'偵察艇', icon:'scout', power:6, attack:4, shield:2, cost:{materials:10,energy:2,credits:2}, text:'安価な小型艦。衛星・前哨地への圧力に向く。', role:'screen'},
    frigate:{name:'フリゲート', icon:'fleet', power:15, attack:9, shield:7, cost:{materials:24,energy:5,credits:4}, text:'序盤の主力。攻防のバランスが良い。', role:'line'},
    destroyer:{name:'駆逐艦', icon:'attack', power:34, attack:26, shield:10, cost:{materials:52,energy:13,crystal:2,credits:8}, text:'砲台・装甲防衛に強い攻撃艦。', role:'siege'},
    carrier:{name:'空母', icon:'command', power:62, attack:38, shield:30, cost:{materials:94,energy:25,crystal:7,credits:16}, text:'迎撃網や広域防衛を崩す大型艦。', role:'carrier'}
  };
  const UPGRADES = {
    weapons:{name:'武器', icon:'attack', cost:{materials:34,research:14,energy:7}, text:'攻撃力を上げます。装甲施設や母星攻略で重要。'},
    shields:{name:'シールド', icon:'defense', cost:{materials:30,research:14,energy:9}, text:'被害を抑えます。長期戦や防衛施設突破で重要。'},
    engines:{name:'推進', icon:'technology', cost:{materials:28,research:15,crystal:2}, text:'機動力とワープ効率を上げます。遠征時の戦力低下を抑えます。'}
  };
  const DEFENSES = {
    militia:{name:'民兵防衛', weak:'frigate', text:'標準的な地上防衛。'},
    armor:{name:'装甲要塞', weak:'destroyer', text:'硬い要塞。駆逐艦の火力が有効。'},
    shield:{name:'惑星シールド', weak:'weapons', text:'シールド網。武器強化の差が効きます。'},
    flak:{name:'迎撃網', weak:'carrier', text:'小型艦に強い迎撃網。空母の統制力が有効。'}
  };

  const TECHS = [
    {id:'survey', name:'星系測量', icon:'scout', cost:18, tier:1, text:'母星の衛星だけでなく、同じ恒星系内の別惑星を探索できるようになります。'},
    {id:'colonyAdmin', name:'入植行政', icon:'colony', cost:26, tier:1, text:'植民地の維持負担を軽くし、レベル1植民地の赤字を減らします。'},
    {id:'orbitalIndustry', name:'軌道工業', icon:'industry', cost:34, tier:1, req:['survey'], text:'開発コスト-15%。惑星開発の立ち上がりが早くなります。'},
    {id:'defenseGrid', name:'防衛格子', icon:'defense', cost:38, tier:1, req:['colonyAdmin'], text:'開発時の防衛上昇+2。母星防衛にも効きます。'},
    {id:'stellarHarness', name:'恒星ハーネス', icon:'energy', cost:48, tier:2, req:['survey'], text:'自星系の恒星をチャージ拠点として開発し、ワープ準備ができます。'},
    {id:'logistics', name:'星域兵站', icon:'command', cost:52, tier:2, req:['orbitalIndustry'], text:'毎ターン最大AP+1。できる行動が増えます。'},
    {id:'warpDrive', name:'ワープ航法', icon:'technology', cost:72, tier:2, req:['stellarHarness'], text:'恒星チャージを消費して他帝国の恒星系へ侵攻できるようになります。'},
    {id:'planetaryGuns', name:'惑星砲台', icon:'attack', cost:64, tier:2, req:['defenseGrid'], text:'自領の防衛施設が強化されます。敵に落とされにくくなります。'},
    {id:'capitalProtocol', name:'首都継承令', icon:'victory', cost:90, tier:3, req:['warpDrive','planetaryGuns'], text:'敵母星を落とした時、保有星・恒星設備を効率よく接収できます。'},
    {id:'galacticMandate', name:'銀河統治網', icon:'victory', cost:150, tier:4, req:['capitalProtocol'], final:true, text:'技術勝利。星域全体を統治する最終技術です。'},

    {id:'laser', name:'光子演算炉', icon:'technology', cost:32, tier:1, doctrine:'tech', text:'研究産出+25%。技術国家の基盤です。'},
    {id:'quantumLabs', name:'量子研究区', icon:'research', cost:60, tier:2, doctrine:'tech', req:['laser'], text:'研究施設を持つ星の研究+35%。'},
    {id:'aiCommand', name:'AI司令中枢', icon:'command', cost:92, tier:3, doctrine:'tech', req:['quantumLabs','warpDrive'], text:'艦隊戦力と研究効率を同時に底上げします。'},
    {id:'singularityCore', name:'特異点中枢', icon:'victory', cost:160, tier:4, doctrine:'tech', req:['aiCommand'], final:true, text:'技術勝利。圧倒的な演算力で銀河を制御します。'},

    {id:'dock', name:'軍港網', icon:'fleet', cost:30, tier:1, doctrine:'war', text:'艦船建造コスト-10%。'},
    {id:'marines', name:'降下軍団', icon:'attack', cost:56, tier:2, doctrine:'war', req:['dock'], text:'侵攻時の攻撃力+25%。'},
    {id:'siegeDoctrine', name:'要塞攻略教範', icon:'attack', cost:86, tier:3, doctrine:'war', req:['marines','warpDrive'], text:'防衛施設の相性不利を一部無視します。'},
    {id:'conquestFleet', name:'制圧艦隊', icon:'victory', cost:142, tier:4, doctrine:'war', req:['siegeDoctrine'], final:true, text:'軍事勝利寄りの最終艦隊技術です。'},

    {id:'bank', name:'星間銀行', icon:'credits', cost:30, tier:1, doctrine:'trade', text:'信用産出+35%。商業国家専用の基盤技術です。'},
    {id:'charter', name:'開拓勅許', icon:'colony', cost:58, tier:2, doctrine:'trade', req:['bank'], text:'植民時、信用で資材不足を一部補えるようになります。'},
    {id:'energyMarket', name:'恒星市場', icon:'energy', cost:86, tier:3, doctrine:'trade', req:['charter','stellarHarness'], text:'恒星チャージのコストを信用で補えるようになります。'},
    {id:'galacticMarket', name:'銀河市場', icon:'victory', cost:142, tier:4, doctrine:'trade', req:['energyMarket'], final:true, text:'経済圏で銀河を包む最終交易技術です。'},

    {id:'bio', name:'生体ドーム', icon:'food', cost:28, tier:1, doctrine:'eco', text:'食料産出+40%。人口成長も安定します。'},
    {id:'terraform', name:'大気改造', icon:'colony', cost:58, tier:2, doctrine:'eco', req:['bio'], text:'植民直後の維持赤字を大幅に軽減します。'},
    {id:'livingShield', name:'生体防壁', icon:'defense', cost:86, tier:3, doctrine:'eco', req:['terraform','defenseGrid'], text:'人口の多い惑星ほど防衛力が上がります。'},
    {id:'lifeweb', name:'生命圏ネットワーク', icon:'victory', cost:140, tier:4, doctrine:'eco', req:['livingShield'], final:true, text:'巨大生態圏を完成させる最終技術です。'},

    {id:'relic', name:'遺物解読', icon:'crystal', cost:30, tier:1, doctrine:'mystic', text:'遺跡・結晶系の研究/結晶+50%。'},
    {id:'void', name:'虚空航法', icon:'espionage', cost:60, tier:2, doctrine:'mystic', req:['relic'], text:'ワープ研究の前提を一部短縮し、異常宙域を扱えます。'},
    {id:'phaseShield', name:'位相シールド', icon:'defense', cost:92, tier:3, doctrine:'mystic', req:['void','warpDrive'], text:'シールド強化の効果が高まります。'},
    {id:'voidCrown', name:'虚空の王冠', icon:'victory', cost:145, tier:4, doctrine:'mystic', req:['phaseShield'], final:true, text:'常識外の星域支配を可能にする最終技術です。'}
  ];

  const RESOURCE_BASE = {materials:0,research:0,influence:0,energy:0,food:0,crystal:0,credits:0};
  const CLUSTERS = [
    {id:0, name:'アステル星系', x:.50, y:.52, owner:'P', color:'#6ee7ff'},
    {id:1, name:'ノクス星系', x:.14, y:.16, owner:'C1', color:'#9fb0ff'},
    {id:2, name:'エコー星系', x:.86, y:.16, owner:'C2', color:'#70f2a7'},
    {id:3, name:'ルベル星系', x:.16, y:.84, owner:'C3', color:'#ff7272'},
    {id:4, name:'アウルム星系', x:.84, y:.84, owner:'C4', color:'#ffd37a'}
  ];

  let state = null;
  let selectedDoctrine = 'tech';
  let modalPage = null;
  let images = {};
  let rng = null;
  let canvas, ctx;
  let camera = {x:.5,y:.52,zoom:1.55};
  let drag = {active:false,moved:false,startX:0,startY:0,lastX:0,lastY:0};
  let pointers = new Map();
  let pinch = null;
  let replayIndex = 0;

  const $ = (id) => document.getElementById(id);
  const clamp = (n,min,max) => Math.max(min, Math.min(max, n));
  const fmt = (n) => Math.floor(n || 0).toLocaleString('ja-JP');
  const signFmt = (n) => `${n>=0?'+':''}${fmt(n)}`;
  const imgPath = (dir, name) => `${AS}${dir}/${name}.png`;
  const icon = (name) => `${AS}icons/${name}.png`;
  const storageGet = (k) => { try { return window.localStorage?.getItem(k); } catch { return null; } };
  const storageSet = (k,v) => { try { window.localStorage?.setItem(k,v); } catch { /* preview contexts may block storage */ } };

  class RNG {
    constructor(seed){ this.seed = RNG.hash(seed || String(Date.now())); }
    static hash(str){ let h=2166136261>>>0; for(const ch of String(str)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
    next(){ this.seed = (Math.imul(1664525,this.seed)+1013904223)>>>0; return this.seed/4294967296; }
    int(min,max){ return Math.floor(this.next()*(max-min+1))+min; }
    pick(arr){ return arr[Math.floor(this.next()*arr.length)]; }
    chance(p){ return this.next()<p; }
  }

  const player = () => state?.factions.find(f => f.id === 'P');
  const faction = (id) => state?.factions.find(f => f.id === id);
  const system = (id) => state?.systems.find(s => s.id === id);
  const selectedSystem = () => system(state?.selectedId);
  const owned = (fid) => state.systems.filter(s => s.owner === fid);
  const clusterOf = (cid) => CLUSTERS.find(c => c.id === cid);
  const hasTech = (id, fid='P') => faction(fid)?.techs.includes(id);
  const availableTechs = (fid='P') => TECHS.filter(t => !t.doctrine || t.doctrine === faction(fid)?.doctrine);
  const doctrineImage = (id) => DOCTRINES[id]?.image || CPU_IMAGES[id] || 'tech';
  const factionImage = (f) => `${AS}factions/${doctrineImage(f.doctrine)}.png`;
  const canPay = (cost, fid='P') => Object.entries(cost).every(([k,v]) => (faction(fid).resources[k]||0) >= v);
  const costText = (cost) => Object.entries(cost).filter(([,v])=>v).map(([k,v]) => `${RESOURCES[k]?.label || k}${v}`).join(' / ');
  const addRes = (gain, fid='P') => { const r=faction(fid).resources; Object.entries(gain).forEach(([k,v]) => r[k] = Math.max(0, (r[k]||0) + v)); };
  const pay = (cost, fid='P') => { const r=faction(fid).resources; Object.entries(cost).forEach(([k,v]) => r[k] = Math.max(0, (r[k]||0) - v)); };
  const sameCluster = (s, fid='P') => owned(fid).some(o => o.cluster === s.cluster);
  const isAdjacent = (a,b) => linkIds(system(a) || {}).includes(b);
  const adjacentToOwned = (sid, fid='P') => owned(fid).some(s => isAdjacent(s.id, sid));

  function fleetStats(f){
    const ships = f.ships || {scout:0,frigate:0,destroyer:0,carrier:0};
    const up = f.upgrades || {weapons:0,shields:0,engines:0};
    let base=0, atk=0, shield=0;
    for(const [k,n] of Object.entries(ships)){
      base += (SHIPS[k]?.power || 0) * n;
      atk += (SHIPS[k]?.attack || 0) * n;
      shield += (SHIPS[k]?.shield || 0) * n;
    }
    const doctrineFleet = f.doctrine === 'war' ? 1.12 : 1;
    const techFleet = f.techs?.includes('aiCommand') ? 1.12 : 1;
    return {
      power: Math.round(base * doctrineFleet * techFleet * (1 + up.weapons*.07 + up.shields*.05 + up.engines*.04)),
      attack: Math.round(atk * doctrineFleet * techFleet * (1 + up.weapons*.12 + up.engines*.04)),
      shield: Math.round(shield * (1 + up.shields*.14 + up.engines*.03))
    };
  }
  const fleetText = (f) => Object.entries(SHIPS).map(([k,s]) => `${s.name}${f.ships?.[k] || 0}`).join(' / ');

  function preload(){
    const entries = [
      ['bg', `${AS}galaxy-bg.png`],
      ...new Set(Object.values(BODY_TYPES).map(p => p.img)).values()
    ];
    const list = [ ['bg', `${AS}galaxy-bg.png`] ];
    [...new Set(Object.values(BODY_TYPES).map(p => p.img))].forEach(img => list.push([`planet_${img}`, imgPath('planets', img)]));
    Object.values(RESOURCES).forEach(r => list.push([`icon_${r.icon}`, icon(r.icon)]));
    Object.values(SHIPS).forEach(s => list.push([`icon_${s.icon}`, icon(s.icon)]));
    Object.values(UPGRADES).forEach(u => list.push([`icon_${u.icon}`, icon(u.icon)]));
    TECHS.forEach(t => list.push([`icon_${t.icon}`, icon(t.icon)]));
    ['tech','war','trade','eco','mystic','machine','federation','raider','hive','precursor'].forEach(n => list.push([`faction_${n}`, imgPath('factions', n)]));
    return Promise.all(list.map(([k,src]) => new Promise(resolve => { const im = new Image(); im.onload=()=>{images[k]=im; resolve();}; im.onerror=resolve; im.src=src; })));
  }

  function initTitle(){
    const wrap = $('doctrineCards');
    wrap.innerHTML = '';
    Object.entries(DOCTRINES).forEach(([id,d]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `doctrine-card ${id === selectedDoctrine ? 'is-selected' : ''}`;
      btn.innerHTML = `<img src="${imgPath('factions', d.image)}" alt=""><div><b>${d.name}</b><span>${d.desc}</span><small>${d.short}</small></div>`;
      btn.onclick = () => { selectedDoctrine = id; initTitle(); };
      wrap.appendChild(btn);
    });
    $('continueBtn').disabled = !storageGet(SAVE_KEY);
  }

  function randomSeedText(){ return ['Orion','Nova','Vega','Eos','Zenith','Luna','Aster','Nox','Iris','Kronos'][Math.floor(Math.random()*10)] + '-' + Math.floor(1000+Math.random()*9000); }
  function showScreen(which){
    const isTitle = which === 'title';
    const isGame = which === 'game';
    $('titleScreen').classList.toggle('is-active', isTitle);
    $('gameScreen').classList.toggle('is-active', isGame);
    document.body.classList.toggle('is-title', isTitle);
    document.body.classList.toggle('is-game', isGame);
    document.body.style.overflow = isTitle ? 'auto' : 'hidden';
    document.documentElement.style.overflow = isTitle ? 'auto' : 'hidden';
    resetPointerState();
    if(isTitle) setTimeout(() => window.scrollTo({top:0,left:0,behavior:'instant'}), 0);
    if(isGame) setTimeout(() => { resizeCanvas(); draw(); }, 40);
  }

  function createGame(seed, doctrine){
    rng = new RNG(seed);
    const factions = [
      {id:'P', name:'あなたの帝国', doctrine, color:DOCTRINES[doctrine].color, cluster:0, home:null, star:null, resources:{materials:112,research:48,influence:52,energy:58,food:58,crystal:14,credits:48}, charge:0, maxCharge:1, ships:{scout:2,frigate:1,destroyer:0,carrier:0}, upgrades:{weapons:0,shields:0,engines:0}, techs:[], eliminated:false, ai:'player'},
      ...CPU_NAMES.map((name,i) => ({id:`C${i+1}`, name, doctrine:CPU_DOCTRINES[i], color:['#9fb0ff','#70f2a7','#ff7272','#ffd37a'][i], cluster:i+1, home:null, star:null, resources:{materials:92,research:32,influence:36,energy:48,food:42,crystal:12,credits:38}, charge:0, maxCharge:1, ships:{scout:2,frigate:1,destroyer:0,carrier:0}, upgrades:{weapons:0,shields:0,engines:0}, techs:['survey'], eliminated:false, ai:['research','expand','war','trade'][i] }))
    ];
    const systems = [];
    CLUSTERS.forEach(c => buildCluster(systems, factions, c));
    // Faint interstellar route between stars; usable after warp.
    const stars = systems.filter(s => s.kind === 'star');
    stars.forEach((s,i)=>{ stars.slice(i+1).forEach(o => { if(Math.hypot(s.x-o.x,s.y-o.y) < .78) connect(systems,s.id,o.id,'warp'); }); });
    return {version:VERSION, seed, turn:1, ap:3, maxAp:3, selectedId:2, systems, factions, logs:[], tutorial:{active:true,step:0}, replay:[], victory:null, sheetCollapsed:false};
  }

  function buildCluster(systems, factions, c){
    const fid = c.owner;
    const f = factions.find(x => x.id === fid);
    const id0 = systems.length;
    const spread = c.id === 0 ? .064 : .072;
    const types = c.id === 0 ? ['star','home','moon','desert','ice','belt'] : ['star','home','moon', rng.pick(['volcanic','ice','gas','crystal']), rng.pick(['desert','ocean','relic','belt']), rng.pick(['belt','moon','gas'])];
    const pos = [
      [0,0], [.050,-.016], [.078,.018], [-.055,.040], [-.030,-.070], [.070,-.066]
    ];
    const names = c.id === 0 ? ['アステル恒星','母星アステル','アステル衛星','砂礫のエオス','氷のミラージュ','内縁小惑星帯'] : [`${c.name}恒星`,`${c.name}母星`,`${c.name}衛星`,`${c.name}第一惑星`,`${c.name}外惑星`,`${c.name}資源帯`];
    for(let i=0;i<6;i++){
      const id = systems.length;
      const kind = i===0 ? 'star' : i===1 ? 'planet' : i===2 ? 'moon' : i===5 ? 'belt' : 'planet';
      const owner = i <= 1 ? fid : (fid !== 'P' && i===2 ? fid : null);
      const explored = owner || fid !== 'P' && i <= 2 ? true : (fid === 'P' && i <= 1);
      systems.push({
        id, cluster:c.id, name:names[i], body:types[i], kind, x:clamp(c.x+pos[i][0],.035,.965), y:clamp(c.y+pos[i][1],.065,.935), links:[], owner, explored,
        level:i===1 ? 2 : i===0 ? 1 : owner ? 1 : 0,
        pop:i===1 ? 5 : owner ? 2 : 0,
        defense:i===1 ? 24 : i===0 ? 18 : rng ? rng.int(7,16) : 10,
        defenseType:i===1 ? 'shield' : ['militia','armor','shield','flak'][(id+i)%4],
        homeOf:i===1 ? fid : null,
        starOf:i===0 ? fid : null,
        locked: fid === 'P' && i >= 3
      });
    }
    connect(systems,id0,id0+1,'orbit'); connect(systems,id0+1,id0+2,'orbit'); connect(systems,id0,id0+3,'orbit'); connect(systems,id0,id0+4,'orbit'); connect(systems,id0,id0+5,'orbit'); connect(systems,id0+3,id0+5,'orbit');
    f.star = id0; f.home = id0+1;
  }
  function connect(systems,a,b,type='normal'){
    if(!systems[a].links.some(l => (typeof l === 'object' ? l.id : l) === b)) systems[a].links.push({id:b,type});
    if(!systems[b].links.some(l => (typeof l === 'object' ? l.id : l) === a)) systems[b].links.push({id:a,type});
  }
  function linkIds(s){ return (s.links||[]).map(l => typeof l === 'object' ? l.id : l); }
  function linkType(a,b){ return (system(a)?.links||[]).find(l => (typeof l === 'object'?l.id:l)===b)?.type || 'normal'; }
  function componentFrom(startId, seen=new Set()){
    const stack=[startId];
    while(stack.length){ const id=stack.pop(); if(seen.has(id)) continue; seen.add(id); linkIds(system(id)).forEach(n=>{ if(!seen.has(n)) stack.push(n); }); }
    return seen;
  }
  function galaxyIsConnected(){ return state ? componentFrom(0).size === state.systems.length : false; }

  function startNew(){
    const seed = $('seedInput').value.trim() || randomSeedText();
    state = createGame(seed, selectedDoctrine);
    camera = {x:.5,y:.52,zoom:1.8};
    addLog(`銀河シード「${seed}」で${DOCTRINES[selectedDoctrine].name}が始動。`, 'good');
    showScreen('game'); save(); render();
  }
  function continueGame(){
    try{ const raw=storageGet(SAVE_KEY); if(!raw) return; state=JSON.parse(raw); normalizeState(); camera=state.camera || {x:.5,y:.52,zoom:1.5}; showScreen('game'); render(); }
    catch(e){ alert('セーブデータを読み込めませんでした。'); }
  }
  function normalizeState(){
    state.version = VERSION; state.logs ||= []; state.replay ||= []; state.tutorial ||= {active:false,step:99}; state.maxAp ||= 3; state.ap ??= state.maxAp; state.factions.forEach(f=>{ f.charge ||= 0; f.maxCharge ||= 1; f.ships ||= {scout:1,frigate:0,destroyer:0,carrier:0}; f.upgrades ||= {weapons:0,shields:0,engines:0}; f.techs ||= []; });
  }
  function save(){ if(!state) return; state.camera=camera; storageSet(SAVE_KEY, JSON.stringify(state)); initTitle(); }
  function addLog(text,tone=''){ state.logs.unshift({turn:state.turn,text,tone}); state.logs=state.logs.slice(0,100); }

  function mapFrame(){
    const bottomEl = $('bottomSheet');
    const bottomH = bottomEl ? (state?.sheetCollapsed ? 86 : bottomEl.getBoundingClientRect().height || 250) : 250;
    return {left:8, right:98, top: state?.tutorial?.active ? 210 : 104, bottom: Math.max(98, bottomH + 10)};
  }
  function resizeCanvas(){ canvas=$('starCanvas'); ctx=canvas.getContext('2d'); const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)); canvas.width=Math.floor(innerWidth*dpr); canvas.height=Math.floor(innerHeight*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function worldToScreen(s){
    const f=mapFrame(); const usableW=innerWidth-f.left-f.right; const usableH=innerHeight-f.top-f.bottom; const scale=Math.max(120, Math.min(usableW,usableH)*camera.zoom);
    return {x:f.left+usableW/2+(s.x-camera.x)*scale, y:f.top+usableH/2+(s.y-camera.y)*scale};
  }
  function screenToWorld(x,y){
    const f=mapFrame(); const usableW=innerWidth-f.left-f.right; const usableH=innerHeight-f.top-f.bottom; const scale=Math.max(120, Math.min(usableW,usableH)*camera.zoom);
    return {x:camera.x+(x-(f.left+usableW/2))/scale, y:camera.y+(y-(f.top+usableH/2))/scale};
  }
  function centerOn(s, zoom){ if(!s) return; camera.x=clamp(s.x,.02,.98); camera.y=clamp(s.y,.04,.96); if(zoom) camera.zoom=zoom; draw(); }
  function fullMap(){ camera={x:.5,y:.52,zoom:.9}; draw(); }

  function draw(){
    if(!ctx || !state) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(images.bg) ctx.drawImage(images.bg,0,0,innerWidth,innerHeight); else { ctx.fillStyle='#020711'; ctx.fillRect(0,0,innerWidth,innerHeight); }
    ctx.fillStyle='rgba(2,7,17,.48)'; ctx.fillRect(0,0,innerWidth,innerHeight);

    // Cluster territories.
    CLUSTERS.forEach(c => {
      const center = worldToScreen({x:c.x,y:c.y});
      ctx.beginPath(); ctx.arc(center.x,center.y,72*camera.zoom/1.2,0,Math.PI*2); ctx.strokeStyle=(faction(c.owner)?.color || c.color)+'44'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle=(faction(c.owner)?.color || c.color)+'10'; ctx.fill();
    });

    // Links.
    state.systems.forEach(s => {
      const a=worldToScreen(s);
      linkIds(s).forEach(id => { if(id < s.id) return; const o=system(id), b=worldToScreen(o); const type=linkType(s.id,id); const warp = type==='warp'; const visible = !warp || hasTech('warpDrive') || s.kind==='star'; ctx.strokeStyle = warp ? (hasTech('warpDrive') ? 'rgba(255,211,122,.20)' : 'rgba(255,211,122,.07)') : 'rgba(133,201,255,.18)'; ctx.lineWidth = warp ? 1 : 1.2; if(warp && !hasTech('warpDrive')) ctx.setLineDash([4,7]); else ctx.setLineDash([]); if(visible){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } ctx.setLineDash([]); });
    });

    const target = tutorialTargetSystem();
    state.systems.forEach(s => {
      const p=worldToScreen(s); if(p.x<-80||p.x>innerWidth+80||p.y<-80||p.y>innerHeight+80) return;
      const visible = isVisible(s);
      const own = s.owner ? faction(s.owner) : null;
      const selected = s.id === state.selectedId;
      const radius = s.kind==='star' ? 18 : s.homeOf ? 21 : s.kind==='moon' ? 12 : 15;
      if(s.kind==='star'){
        ctx.beginPath(); ctx.arc(p.x,p.y,radius+12,0,Math.PI*2); ctx.fillStyle=(own?.color||'#ffd37a')+'18'; ctx.fill(); ctx.strokeStyle=(own?.color||'#ffd37a')+'66'; ctx.lineWidth=2; ctx.stroke();
      }
      if(own){ ctx.beginPath(); ctx.arc(p.x,p.y,radius+11,0,Math.PI*2); ctx.fillStyle=own.color+'22'; ctx.fill(); ctx.strokeStyle=own.color+'aa'; ctx.lineWidth=2; ctx.stroke(); }
      if(target && target.id===s.id){ const pulse=4+Math.sin(Date.now()/220)*3; ctx.beginPath(); ctx.arc(p.x,p.y,radius+17+pulse,0,Math.PI*2); ctx.strokeStyle='rgba(110,231,255,.92)'; ctx.lineWidth=3; ctx.stroke(); }
      if(selected){ ctx.beginPath(); ctx.arc(p.x,p.y,radius+16,0,Math.PI*2); ctx.strokeStyle='rgba(255,211,122,.98)'; ctx.lineWidth=4; ctx.stroke(); }
      if(visible){ const im = images[`planet_${BODY_TYPES[s.body]?.img}`]; if(im) ctx.drawImage(im,p.x-radius,p.y-radius,radius*2,radius*2); else { ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fillStyle='#aac'; ctx.fill(); } }
      else { ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fillStyle='rgba(70,115,170,.55)'; ctx.fill(); ctx.strokeStyle='rgba(180,220,255,.35)'; ctx.stroke(); ctx.fillStyle='#dff4ff'; ctx.font='bold 14px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',p.x,p.y+1); }
      if(s.homeOf){ ctx.fillStyle='#fff'; ctx.font='bold 10px system-ui'; ctx.textAlign='center'; ctx.fillText(s.homeOf==='P'?'YOU':s.homeOf,p.x,p.y+radius+16); }
      if(s.kind==='star' && own){ ctx.fillStyle=own.color; ctx.font='bold 9px system-ui'; ctx.textAlign='center'; ctx.fillText(`充填${own.charge||0}/${own.maxCharge||1}`,p.x,p.y+radius+18); }
    });
    requestAnimationFrame(() => { if(state?.tutorial?.active) draw(); });
  }

  function isVisible(s){ return !!(s.explored || s.owner || s.kind==='star' || (s.cluster!==0 && s.homeOf)); }
  function nearestSystemAt(clientX, clientY){ let best=null,bestD=999; state.systems.forEach(s=>{ const p=worldToScreen(s); const d=Math.hypot(clientX-p.x,clientY-p.y); const hit=s.kind==='star'?34:s.homeOf?36:28; if(d<hit && d<bestD){best=s;bestD=d;} }); return best; }
  function distance(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
  function midpoint(a,b){ return {x:(a.x+b.x)/2, y:(a.y+b.y)/2}; }
  function resetPointerState(){ drag.active=false; drag.moved=false; pointers.clear(); pinch=null; }
  function touchPoint(t){ return {x:t.clientX,y:t.clientY}; }
  function touchDistance(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
  function touchMid(a,b){ return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}; }
  function canvasTouchStart(e){
    if(!$('gameScreen').classList.contains('is-active')) return;
    e.preventDefault();
    if(e.touches.length===1){
      const p=touchPoint(e.touches[0]);
      drag.active=true; drag.moved=false; drag.startX=p.x; drag.startY=p.y; drag.lastX=p.x; drag.lastY=p.y; pinch=null;
    }else if(e.touches.length>=2){
      const a=touchPoint(e.touches[0]), b=touchPoint(e.touches[1]);
      pinch={dist:Math.max(12,touchDistance(a,b)), zoom:camera.zoom, mid:touchMid(a,b)};
      drag.active=false; drag.moved=true;
    }
  }
  function canvasTouchMove(e){
    if(!$('gameScreen').classList.contains('is-active')) return;
    e.preventDefault();
    if(e.touches.length>=2){
      const a=touchPoint(e.touches[0]), b=touchPoint(e.touches[1]);
      const mid=touchMid(a,b);
      if(!pinch) pinch={dist:Math.max(12,touchDistance(a,b)), zoom:camera.zoom, mid};
      const before=screenToWorld(mid.x,mid.y);
      const dist=Math.max(12,touchDistance(a,b));
      camera.zoom=clamp(pinch.zoom*(dist/pinch.dist),.55,4.2);
      const after=screenToWorld(mid.x,mid.y);
      camera.x=clamp(camera.x+(before.x-after.x),0,1);
      camera.y=clamp(camera.y+(before.y-after.y),0,1);
      draw();
      return;
    }
    if(e.touches.length===1){
      const p=touchPoint(e.touches[0]);
      if(!drag.active){ drag.active=true; drag.moved=true; drag.startX=p.x; drag.startY=p.y; drag.lastX=p.x; drag.lastY=p.y; pinch=null; return; }
      const dx=p.x-drag.lastX, dy=p.y-drag.lastY;
      if(Math.hypot(p.x-drag.startX,p.y-drag.startY)>6) drag.moved=true;
      const a=screenToWorld(0,0), b=screenToWorld(dx,dy);
      camera.x=clamp(camera.x-(b.x-a.x),0,1); camera.y=clamp(camera.y-(b.y-a.y),0,1);
      drag.lastX=p.x; drag.lastY=p.y; draw();
    }
  }
  function canvasTouchEnd(e){
    if(!$('gameScreen').classList.contains('is-active')) return;
    e.preventDefault();
    if(e.touches.length===1){
      const p=touchPoint(e.touches[0]);
      drag.active=true; drag.moved=true; drag.startX=p.x; drag.startY=p.y; drag.lastX=p.x; drag.lastY=p.y; pinch=null;
      return;
    }
    if(e.touches.length===0){
      if(drag.active && !drag.moved && e.changedTouches && e.changedTouches[0]){
        const t=e.changedTouches[0]; const s=nearestSystemAt(t.clientX,t.clientY);
        if(s){ state.selectedId=s.id; advanceTutorialOnSelect(s); save(); render(); }
      }
      drag.active=false; pinch=null;
    }
  }
  function canvasPointerDown(e){
    if(e.pointerType === 'touch') return;
    e.preventDefault?.();
    canvas.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===1){
      drag.active=true; drag.moved=false; drag.startX=e.clientX; drag.startY=e.clientY; drag.lastX=e.clientX; drag.lastY=e.clientY; pinch=null;
      return;
    }
    if(pointers.size===2){
      const pts=[...pointers.values()];
      pinch={dist:Math.max(12,distance(pts[0],pts[1])), zoom:camera.zoom, mid:midpoint(pts[0],pts[1])};
      drag.active=false; drag.moved=true;
    }
  }
  function canvasPointerMove(e){
    if(e.pointerType === 'touch') return;
    if(!pointers.has(e.pointerId)) return;
    e.preventDefault?.();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>=2 && pinch){
      const pts=[...pointers.values()].slice(0,2);
      const mid=midpoint(pts[0],pts[1]);
      const before=screenToWorld(mid.x,mid.y);
      const dist=Math.max(12,distance(pts[0],pts[1]));
      camera.zoom=clamp(pinch.zoom*(dist/pinch.dist),.55,4.2);
      const after=screenToWorld(mid.x,mid.y);
      camera.x=clamp(camera.x+(before.x-after.x),0,1);
      camera.y=clamp(camera.y+(before.y-after.y),0,1);
      draw();
      return;
    }
    if(!drag.active) return;
    const dx=e.clientX-drag.lastX, dy=e.clientY-drag.lastY;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6) drag.moved=true;
    const a=screenToWorld(0,0), b=screenToWorld(dx,dy);
    camera.x=clamp(camera.x-(b.x-a.x),0,1); camera.y=clamp(camera.y-(b.y-a.y),0,1);
    drag.lastX=e.clientX; drag.lastY=e.clientY; draw();
  }
  function canvasPointerUp(e){
    if(e.pointerType === 'touch') return;
    const tap = drag.active && !drag.moved && pointers.size===1 && pointers.has(e.pointerId);
    const x=e.clientX, y=e.clientY;
    pointers.delete(e.pointerId);
    canvas.releasePointerCapture?.(e.pointerId);
    if(tap){ const s=nearestSystemAt(x,y); if(s){ state.selectedId=s.id; advanceTutorialOnSelect(s); save(); render(); } }
    if(pointers.size===1){ const p=[...pointers.values()][0]; drag.active=true; drag.moved=true; drag.startX=p.x; drag.startY=p.y; drag.lastX=p.x; drag.lastY=p.y; pinch=null; }
    else if(pointers.size===0){ drag.active=false; pinch=null; }
  }
  function canvasPointerCancel(e){ if(e.pointerType === 'touch') return; pointers.delete(e.pointerId); if(!pointers.size){ drag.active=false; pinch=null; } }

  const TUTORIAL = {
    0:['チュートリアル 1/9','まず衛星を選ぶ','母星の近くにある未探索の衛星をタップしてください。最初は母星の衛星までが行動範囲です。'],
    1:['チュートリアル 1/9','衛星を探索','「探索」を押してAPを1使います。星の種類と使える資源がわかります。'],
    2:['チュートリアル 2/9','衛星へ植民','「植民」を押してAPを1使います。植民直後は維持費で赤字になりやすいです。'],
    3:['チュートリアル 3/9','植民地を開発','「開発」を押してAPを1使います。これで1ターン目の3APを使い切ります。'],
    4:['ターン1完了','ターン終了','APを使い切りました。「ターン終了」で資源収入とCPU行動を見ましょう。'],
    5:['チュートリアル 4/9','研究を使う','右の「技術」から「星系測量」を研究してください。別惑星の探索が解放されます。'],
    6:['チュートリアル 5/9','艦船を建造','右の「帝国」からフリゲートを建造してください。戦力は艦船の数と種類で決まります。'],
    7:['チュートリアル 6/9','艦隊を強化','同じ帝国画面で「武器」を強化してください。攻める艦隊の相性にも関わります。'],
    8:['ターン2完了','ターン終了','2ターン目の3APも使い切りました。ターン終了で次へ進みます。'],
    9:['チュートリアル 7/9','別惑星を選ぶ','星系測量で、同じ恒星系内の惑星を探索できるようになりました。近くの別惑星を選んでください。'],
    10:['チュートリアル 7/9','惑星を探索','「探索」を押します。惑星は衛星より育てる価値がありますが、維持費も重くなります。'],
    11:['チュートリアル 8/9','惑星へ植民','「植民」を押します。植民直後は人口維持で資源が減ることがあります。'],
    12:['チュートリアル 9/9','黒字化のため開発','「開発」を押します。植民地は育てて初めて本格的な資源源になります。'],
    13:['チュートリアル完了','最後のターン終了','3ターン・9行動を終えました。ターン終了で、未体験機能と勝利条件を確認します。']
  };
  function tutorialText(){ if(!state?.tutorial?.active) return null; return TUTORIAL[state.tutorial.step] || null; }
  function tutorialTargetSystem(){
    if(!state?.tutorial?.active) return null; const step=state.tutorial.step;
    if(step<=3) return system(2); if(step>=9 && step<=12) return system(3); return null;
  }
  function advanceTutorialOnSelect(s){ if(!state?.tutorial?.active) return; if(state.tutorial.step===0 && s.id===2) state.tutorial.step=1; if(state.tutorial.step===9 && s.id===3) state.tutorial.step=10; }
  function tutorialAllows(action,arg){
    if(!state?.tutorial?.active) return true;
    const st=state.tutorial.step;
    if(action==='skip' || action==='help' || action==='openPage') return true;
    if(st===1) return action==='explore' && selectedSystem()?.id===2;
    if(st===2) return action==='colonize' && selectedSystem()?.id===2;
    if(st===3) return action==='develop' && selectedSystem()?.id===2;
    if(st===4) return action==='endTurn';
    if(st===5) return action==='research' && arg==='survey';
    if(st===6) return action==='buildShip' && arg==='frigate';
    if(st===7) return action==='upgrade' && arg==='weapons';
    if(st===8) return action==='endTurn';
    if(st===10) return action==='explore' && selectedSystem()?.id===3;
    if(st===11) return action==='colonize' && selectedSystem()?.id===3;
    if(st===12) return action==='develop' && selectedSystem()?.id===3;
    if(st===13) return action==='endTurn';
    return false;
  }
  function afterTutorialAction(action,arg){
    if(!state.tutorial.active) return;
    const st=state.tutorial.step;
    if(st===1&&action==='explore') state.tutorial.step=2;
    else if(st===2&&action==='colonize') state.tutorial.step=3;
    else if(st===3&&action==='develop') state.tutorial.step=4;
    else if(st===5&&action==='research') state.tutorial.step=6;
    else if(st===6&&action==='buildShip') state.tutorial.step=7;
    else if(st===7&&action==='upgrade') state.tutorial.step=8;
    else if(st===10&&action==='explore') state.tutorial.step=11;
    else if(st===11&&action==='colonize') state.tutorial.step=12;
    else if(st===12&&action==='develop') state.tutorial.step=13;
  }
  function completeTutorial(){
    state.tutorial.active=false; state.tutorial.step=99;
    showModal(`<h2>チュートリアル完了</h2><p>ここからは自由に戦略を選べます。</p><ul><li><b>恒星ハーネス</b>を研究すると、恒星をチャージ拠点として使えます。</li><li><b>ワープ航法</b>を研究し、恒星チャージを貯めると、別帝国の星系へ侵攻できます。</li><li>侵攻では、保有艦船・武器/シールド/推進・相手の防衛施設タイプが結果を左右します。</li><li>敵母星を落とすと、その帝国は敗退し、残った保有星も接収できます。</li><li>勝利条件は、支配60%、最終技術、CPU母星制圧です。不明点は右の「説明」を見てください。</li></ul><p>では、銀河の主導権を取りにいきましょう。</p>`, true);
  }

  function render(){ if(!state) return; renderTop(); renderCoach(); renderPanel(); renderReplay(); draw(); checkVictory(); save(); }
  function renderTop(){
    $('turnValue').textContent=state.turn; $('apValue').textContent=`AP ${state.ap}/${state.maxAp}`;
    const bar=$('resourceBar'); bar.innerHTML=''; const p=player(); const income=totalIncome('P');
    RESOURCE_ORDER.forEach(k=>{ const r=RESOURCES[k]; const btn=document.createElement('button'); btn.type='button'; btn.className='resource-chip'; btn.innerHTML=`<img src="${icon(r.icon)}" alt=""><small>${r.label}</small><b>${fmt(p.resources[k])}</b><em>${signFmt(income[k]||0)}/T</em>`; btn.onclick=()=>showResourceHelp(k); bar.appendChild(btn); });
  }
  function renderCoach(){ const coach=$('coach'), data=tutorialText(); if(!data){coach.classList.add('is-hidden'); return;} coach.classList.remove('is-hidden'); $('coachKicker').textContent=data[0]; $('coachTitle').textContent=data[1]; $('coachText').textContent=data[2]; }
  function renderPanel(){ $('bottomSheet').classList.toggle('is-collapsed', !!state.sheetCollapsed); $('endTurnBtn').disabled=!tutorialAllows('endTurn'); renderSystemPanel(); }
  function bindActionButtons(root){ root.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => { handleAction(btn.dataset.action, btn.dataset.arg); if(modalPage && $('infoModal').open) setTimeout(()=>openMobilePage(modalPage,true),0); })); }

  function renderSystemPanel(){
    const body=$('panelBody'), s=selectedSystem(); if(!s){ body.innerHTML=`<div class="panel-section compact"><p class="empty">星をタップしてください。</p></div>`; return; }
    const visible=isVisible(s), type=BODY_TYPES[s.body], owner=s.owner?faction(s.owner):null, actions=actionButtonsHtml(s);
    body.innerHTML = `<section class="panel-section compact system-card"><div class="action-strip">${actions}</div><div class="system-head"><div><h2>${visible?s.name:'未探索天体'}</h2><p>${clusterOf(s.cluster).name} / ${visible?type.name:'正体不明'}</p></div><span class="pill ${s.owner==='P'?'you':s.owner?'bad':''}">${owner?owner.name.replace('あなたの帝国','あなた'):'中立'}</span></div><div class="sys-stats"><span>Lv <b>${s.level}</b></span><span>人口 <b>${s.pop.toFixed ? s.pop.toFixed(1) : s.pop}</b></span><span>防衛 <b>${s.defense}</b></span><span>${DEFENSES[s.defenseType]?.name || '防衛なし'}</span></div>${visible?`<p class="yield-line">収支：${yieldText(s)}</p><p class="system-note">${systemAdvice(s)}</p>`:`<p class="system-note">未探索です。探索すると種類・収支・植民可否がわかります。</p>`}</section>`;
    bindActionButtons(body);
  }
  function actionButtonsHtml(s){ const actions=getActionsFor(s); if(actions.length===0) return `<span class="no-action">今は実行可能な操作なし</span>`; return actions.map(a=>`<button class="quick-action ${a.warn?'warn':''}" data-action="${a.id}" data-arg="${a.arg||''}" type="button">${a.label}<small>${a.short}</small></button>`).join(''); }
  function getActionsFor(s){
    const a=[];
    if(canExplore(s)){ const cost=exploreCost(s); if(tutorialAllows('explore')) a.push({id:'explore',label:'探索',short:`AP1 ${costText(cost)}`}); }
    if(canColonize(s)){ const cost=colonizeCost(s); if(tutorialAllows('colonize')) a.push({id:'colonize',label:'植民',short:`AP1 ${costText(cost)}`}); }
    if(s.owner==='P' && s.kind!=='star'){ const cost=developCost(s); if(tutorialAllows('develop')) a.push({id:'develop',label:'開発',short:`AP1 ${costText(cost)}`}); }
    if(s.owner==='P' && s.kind==='star' && hasTech('stellarHarness')){ const cost=starChargeCost(s); if(tutorialAllows('charge')) a.push({id:'chargeStar',label:'恒星チャージ',short:`AP1 ${costText(cost)}`}); }
    if(canInvade(s)){ a.push({id:'invade',label:'侵攻',warn:true,short:`AP1 充填1`}); }
    return a;
  }
  function canExplore(s){ if(!s || s.explored || s.owner) return false; if(s.cluster!==0) return hasTech('warpDrive') && adjacentToOwned(s.id); if(s.kind==='moon') return adjacentToOwned(s.id); return hasTech('survey') && sameCluster(s) && (s.kind==='planet' || s.kind==='belt'); }
  function canColonize(s){ if(!s || !s.explored || s.owner) return false; if(s.cluster!==0) return hasTech('warpDrive') && adjacentToOwned(s.id); return adjacentToOwned(s.id) || sameCluster(s); }
  function canInvade(s){ return !!(s && s.owner && s.owner!=='P' && !faction(s.owner).eliminated && hasTech('warpDrive') && player().charge>0); }
  function yieldText(s){ const y=systemYield(s); return RESOURCE_ORDER.filter(k=>y[k]).map(k=>`${RESOURCES[k].label}${signFmt(y[k])}`).join(' / ') || 'なし'; }
  function systemYield(s){
    const out={...RESOURCE_BASE}; if(!s.owner) return out; const base={...(BODY_TYPES[s.body]?.yields||{})}; const owner=faction(s.owner);
    let mult = s.kind==='star' ? (1+s.level*.30) : (s.level===0 ? .18 : .45 + s.level*.28 + Math.max(0,s.pop-1)*.045);
    if(s.body==='home') mult = 1 + s.level*.25 + Math.max(0,s.pop-1)*.055;
    Object.entries(base).forEach(([k,v]) => out[k] += Math.floor(v*mult));
    if(s.kind!=='star' && s.body!=='home'){
      const admin = owner.techs.includes('colonyAdmin') ? .65 : 1;
      const terra = owner.techs.includes('terraform') ? .55 : 1;
      const burden = Math.max(0, 4 - s.level) * admin * terra;
      out.food -= Math.ceil(burden + s.pop*.55);
      out.energy -= Math.max(0, Math.ceil((2 - s.level) * admin));
      if(s.level===0) out.materials -= 2;
    }
    if(owner.techs.includes('laser')) out.research = Math.floor(out.research*1.25);
    if(owner.techs.includes('quantumLabs') && ['ice','relic'].includes(s.body)) out.research = Math.floor(out.research*1.35);
    if(owner.techs.includes('bio') && ['terran','ocean','home'].includes(s.body)) out.food = Math.floor(out.food*1.4);
    if(owner.techs.includes('relic') && ['relic','crystal'].includes(s.body)){ out.research=Math.floor(out.research*1.5); out.crystal=Math.floor(out.crystal*1.5); }
    if(owner.techs.includes('bank')) out.credits=Math.floor(out.credits*1.35);
    return out;
  }
  function totalIncome(fid){ const out={...RESOURCE_BASE}; owned(fid).forEach(s=>{ const y=systemYield(s); Object.entries(y).forEach(([k,v])=>out[k]+=v); }); return out; }
  function systemAdvice(s){
    if(s.kind==='star') return hasTech('stellarHarness') ? '恒星は星系間移動の充填拠点です。チャージを貯めるとワープ侵攻に使えます。' : '恒星は後で開発対象になります。恒星ハーネスを研究するとエネルギーチャージが可能になります。';
    if(!s.explored && s.kind==='moon') return '最初に探索できる範囲です。衛星で操作を覚え、資源基盤を作ります。';
    if(!s.explored) return hasTech('survey') ? '星系測量により、この惑星を探索できます。' : '星系測量を研究するまで、この惑星は本格探索できません。';
    if(s.owner==='P' && s.level<2 && s.body!=='home') return '植民地はまだ立ち上げ段階です。人口維持で赤字が出やすいため、開発して黒字化しましょう。';
    if(s.owner==='P') return '自領です。開発を進めるほど収支と防衛が強くなります。';
    if(s.owner && s.owner!=='P') return `敵領です。防衛は${DEFENSES[s.defenseType]?.name}。侵攻にはワープ航法と恒星チャージが必要です。`;
    return '探索済みの中立天体です。植民すると領土になりますが、最初は維持費が重くなります。';
  }

  function exploreCost(){ return {influence: hasTech('survey') ? 3 : 4}; }
  function colonizeCost(){ const discount=(hasTech('terraform')||hasTech('charter'))?.82:1; return {materials:Math.round(22*discount), influence:Math.round(10*discount), food:5}; }
  function developCost(s){ const base={materials:18+s.level*9, energy:4+s.level*2}; if(hasTech('orbitalIndustry')) base.materials=Math.round(base.materials*.85); return base; }
  function starChargeCost(s){ return {energy:18+s.level*5, crystal:s.level>1?1:0}; }
  function upgradeCost(id){ const u=UPGRADES[id]; const lv=player().upgrades[id]||0; const out={}; Object.entries(u.cost).forEach(([k,v])=>out[k]=Math.round(v*(1+lv*.55))); return out; }

  function handleAction(action,arg){ if(!tutorialAllows(action,arg)){ toast('チュートリアル中は、表示された手順だけ実行できます。'); return; } const before=state.tutorial.step; const ok = ({explore,colonize,develop,chargeStar,invade,buildShip,upgrade,research}[action] || (()=>false))(arg); if(ok) afterTutorialAction(action,arg); render(); }
  function consumeAp(){ if(state.ap<=0){ toast('APが足りません。ターン終了で回復します。'); return false; } state.ap--; return true; }
  function explore(){ const s=selectedSystem(); if(!canExplore(s)) return toast('この天体はまだ探索できません。衛星は最初から、別惑星は星系測量後に探索できます。'); const cost=exploreCost(s); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); s.explored=true; s.locked=false; addLog(`${s.name}を探索。${BODY_TYPES[s.body].name}を発見。`, 'good'); return true; }
  function colonize(){ const s=selectedSystem(), cost=colonizeCost(); if(!canColonize(s)) return toast('植民できるのは探索済みの中立天体です。'); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); s.owner='P'; s.level=0; s.pop=1.0; s.defense=Math.max(s.defense,8); s.explored=true; addLog(`${s.name}へ植民。立ち上げ期のため維持費に注意。`, 'good'); return true; }
  function develop(){ const s=selectedSystem(); if(!s || s.owner!=='P' || s.kind==='star') return toast('通常開発できるのは自領の惑星・衛星・小惑星です。'); const cost=developCost(s); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); s.level++; s.pop += hasTech('bio') ? .9 : .55; s.defense += hasTech('defenseGrid') ? 5 : 3; addLog(`${s.name}を開発。収支と防衛が改善。`, 'good'); return true; }
  function chargeStar(){ const s=selectedSystem(); if(!s || s.kind!=='star' || s.owner!=='P') return toast('恒星チャージは自領恒星で実行します。'); const cost=starChargeCost(s); if(!hasTech('stellarHarness')) return toast('恒星ハーネスが必要です。'); if(player().charge >= player().maxCharge + s.level) return toast('チャージ上限です。'); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); player().charge++; s.level++; addLog(`${s.name}でワープ用エネルギーを充填。充填${player().charge}/${player().maxCharge+s.level}`, 'good'); return true; }
  function buildShip(id){ if(state.tutorial.active && state.tutorial.step<6) return toast('艦船建造はチュートリアル2ターン目で扱います。'); const ship=SHIPS[id]; if(!ship) return false; let cost={...ship.cost}; if(hasTech('dock')) Object.keys(cost).forEach(k=>cost[k]=Math.round(cost[k]*.9)); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); player().ships[id]=(player().ships[id]||0)+1; addLog(`${ship.name}を建造。`, 'good'); return true; }
  function upgrade(id){ const u=UPGRADES[id]; if(!u) return false; const cost=upgradeCost(id); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); player().upgrades[id]=(player().upgrades[id]||0)+1; addLog(`艦隊${u.name}をLv.${player().upgrades[id]}へ強化。`, 'good'); return true; }
  function research(id){ const t=TECHS.find(x=>x.id===id); if(!t) return false; const p=player(); if(p.techs.includes(id)) return false; if((t.req||[]).some(r=>!p.techs.includes(r))) return toast('前提技術が未取得です。'); if(p.resources.research<t.cost) return toast('研究が足りません。'); if(!consumeAp()) return false; p.resources.research-=t.cost; p.techs.push(id); if(id==='logistics') state.maxAp=4; if(id==='stellarHarness') p.maxCharge=2; if(id==='warpDrive') p.maxCharge=Math.max(p.maxCharge,3); addLog(`技術「${t.name}」を取得。`, t.final?'good':''); return true; }
  function invade(){ const s=selectedSystem(); if(!canInvade(s)) return toast('侵攻にはワープ航法と恒星チャージが必要です。'); if(!consumeAp()) return false; player().charge--; const enemy=faction(s.owner); const ps=fleetStats(player()), es=fleetStats(enemy); const defense=defenseScore(s, enemy); let attack=ps.attack+ps.power*.38; if(hasTech('marines')) attack*=1.25; if(hasTech('siegeDoctrine')) attack*=1.12; const matchup=matchupBonus(s); attack*=matchup.mult; const roll=.88+Math.random()*.28; if(attack*roll>defense){ const oldOwner=s.owner, oldName=enemy.name; s.owner='P'; s.explored=true; s.defense=Math.max(7,Math.round(s.defense*.55)); loseShips(player(), .18); if(s.homeOf && s.homeOf!=='P'){ eliminateEmpire(enemy); addLog(`${oldName}の母星を制圧。帝国は敗退し、残存拠点を接収した。`, 'good'); } else { addLog(`${oldName}領${s.name}を制圧。${matchup.text}`, 'good'); } } else { loseShips(player(), .36); addLog(`${s.name}への侵攻は失敗。${DEFENSES[s.defenseType].name}を突破できず艦隊が損耗。`, 'bad'); } return true; }
  function defenseScore(s, enemy){ const es=fleetStats(enemy); let def=s.defense*2.4 + es.shield*.55 + es.power*.20; if(enemy.techs.includes('planetaryGuns')) def*=1.18; if(enemy.techs.includes('livingShield')) def*=1 + Math.min(.35,s.pop*.02); return Math.round(def); }
  function matchupBonus(s){ const p=player(); const type=s.defenseType; if(type==='armor' && (p.ships.destroyer||0)>0) return {mult:1.18,text:'駆逐艦が装甲要塞に有効だった。'}; if(type==='flak' && (p.ships.carrier||0)>0) return {mult:1.18,text:'空母が迎撃網を制圧した。'}; if(type==='shield' && (p.upgrades.weapons||0)>0) return {mult:1.10+.04*p.upgrades.weapons,text:'武器強化が惑星シールドを削った。'}; return {mult:1,text:'標準戦闘で押し切った。'}; }
  function loseShips(f, ratio){ ['scout','frigate','destroyer','carrier'].forEach(k=>{ const n=f.ships[k]||0; if(n>0 && Math.random()<ratio) f.ships[k]=Math.max(0,n-1); }); }
  function eliminateEmpire(enemy){ enemy.eliminated=true; state.systems.forEach(s=>{ if(s.owner===enemy.id){ s.owner='P'; s.explored=true; } }); }

  function endTurn(){ if(!tutorialAllows('endTurn')) return toast('今はガイドされた操作を先に行ってください。'); addRes(totalIncome('P'),'P'); growOwned('P'); const events=cpuTurn(); state.turn++; state.ap=state.maxAp; if(state.tutorial.active){ if(state.tutorial.step===4){ state.tutorial.step=5; addRes({research:18,materials:30,energy:16,credits:12},'P'); } else if(state.tutorial.step===8){ state.tutorial.step=9; state.selectedId=3; centerOn(system(3),1.95); addRes({materials:35,influence:20,food:12},'P'); } else if(state.tutorial.step===13){ completeTutorial(); } } state.replay=events; replayIndex=0; addLog(`ターン${state.turn}開始。資源収入を獲得。`, ''); render(); }
  function growOwned(fid){ owned(fid).forEach(s=>{ if(s.kind!=='star' && (faction(fid).resources.food||0)>10 && s.pop<14) s.pop += faction(fid).techs.includes('bio') ? .32 : .18; }); }
  function cpuTurn(){ const events=[]; state.factions.filter(f=>f.id!=='P'&&!f.eliminated).forEach(f=>{ addRes(totalIncome(f.id),f.id); growOwned(f.id); const action=chooseCpuAction(f); if(action) events.push(action); }); return events; }
  function chooseCpuAction(f){ const my=owned(f.id); if(my.length===0){ f.eliminated=true; return null; } const candidates=state.systems.filter(s=>s.cluster===f.cluster && !s.owner); const unknown=candidates.find(s=>!s.explored); const neutral=candidates.find(s=>s.explored); if(unknown && f.resources.influence>=4){ f.resources.influence-=4; unknown.explored=true; return {fid:f.id,sid:unknown.id,text:`${f.name}が${unknown.name}を探索。`,type:'explore'}; } if(neutral && f.resources.materials>=20 && f.resources.influence>=8){ f.resources.materials-=20; f.resources.influence-=8; neutral.owner=f.id; neutral.level=0; neutral.pop=1; neutral.explored=true; return {fid:f.id,sid:neutral.id,text:`${f.name}が${neutral.name}へ植民。`,type:'colonize'}; } if(f.resources.research>=34 && !f.techs.includes('stellarHarness')){ f.resources.research-=34; f.techs.push('stellarHarness'); return {fid:f.id,sid:f.star,text:`${f.name}が恒星ハーネスを研究。`,type:'research'}; } if(f.resources.materials>=24){ const h=system(f.home); f.resources.materials-=24; h.level++; h.defense+=4; return {fid:f.id,sid:h.id,text:`${f.name}が母星防衛を強化。`,type:'develop'}; } return {fid:f.id,sid:f.home,text:`${f.name}は資源を蓄積。`,type:'wait'}; }
  function renderReplay(){ const box=$('cpuReplay'); if(!state.replay||state.replay.length===0){ box.hidden=true; return; } box.hidden=false; const ev=state.replay[replayIndex]||state.replay[0]; centerOn(system(ev.sid), camera.zoom); box.innerHTML=`<h3>CPUターン ${replayIndex+1}/${state.replay.length}</h3><p>${ev.text}</p><div class="replay-actions"><button id="replayNext" type="button">${replayIndex<state.replay.length-1?'次の行動を見る':'閉じる'}</button><button id="replayClose" type="button">まとめて閉じる</button></div>`; $('replayNext').onclick=()=>{ if(replayIndex<state.replay.length-1){ replayIndex++; renderReplay(); draw(); } else { state.replay=[]; render(); } }; $('replayClose').onclick=()=>{ state.replay=[]; render(); }; }

  function empireHtml(){ const p=player(), fs=fleetStats(p), prod=totalIncome('P'); let html=`<section class="panel-section"><h2>あなたの帝国</h2><div class="mini-grid"><div class="stat-card"><small>保有天体</small><b>${owned('P').length}</b></div><div class="stat-card"><small>恒星充填</small><b>${p.charge}/${p.maxCharge}</b></div><div class="stat-card"><small>総合戦力</small><b>${fs.power}</b></div><div class="stat-card"><small>攻撃/防御</small><b>${fs.attack}/${fs.shield}</b></div></div><p class="yield-line">収入：${RESOURCE_ORDER.filter(k=>prod[k]).map(k=>`${RESOURCES[k].label}${signFmt(prod[k])}`).join(' / ')}</p></section><section class="panel-section"><h3>艦船を建造</h3>`; Object.entries(SHIPS).forEach(([id,s])=>{ html+=`<div class="ship-row"><img src="${icon(s.icon)}" alt=""><div><b>${s.name} × ${p.ships[id]||0}</b><span>${s.text}<br>戦力${s.power} / ${costText(s.cost)}</span></div><button class="pill ${canPay(s.cost)&&state.ap>0&&tutorialAllows('buildShip',id)?'good':''}" data-action="buildShip" data-arg="${id}" type="button">建造</button></div>`; }); html+=`</section><section class="panel-section"><h3>艦隊強化</h3>`; Object.entries(UPGRADES).forEach(([id,u])=>{ const c=upgradeCost(id); html+=`<div class="ship-row"><img src="${icon(u.icon)}" alt=""><div><b>${u.name} Lv.${p.upgrades[id]}</b><span>${u.text}<br>${costText(c)}</span></div><button class="pill ${canPay(c)&&state.ap>0&&tutorialAllows('upgrade',id)?'good':''}" data-action="upgrade" data-arg="${id}" type="button">強化</button></div>`; }); return html+`</section>`; }
  function techHtml(){ const p=player(); let html=`<section class="panel-section"><h2>技術ツリー</h2><p>研究で探索範囲、恒星チャージ、ワープ侵攻、防衛、艦隊、最終勝利を解放します。銀行などの専用技術は選んだ文明方針で変わります。</p></section>`; availableTechs('P').sort((a,b)=>a.tier-b.tier).forEach(t=>{ const bought=p.techs.includes(t.id), locked=(t.req||[]).some(r=>!p.techs.includes(r)), can=!bought&&!locked&&p.resources.research>=t.cost&&state.ap>0&&tutorialAllows('research',t.id); html+=`<div class="tech-card"><img src="${icon(t.icon)}" alt=""><div><b>T${t.tier} ${t.name}</b><span>${t.text}<br>研究${t.cost}${t.req?` / 前提: ${t.req.map(id=>TECHS.find(x=>x.id===id)?.name).join('・')}`:''}</span></div><button class="pill ${bought?'you':can?'good':locked?'bad':''}" data-action="research" data-arg="${t.id}" type="button" ${bought||locked?'disabled':''}>${bought?'取得済':locked?'未解放':'研究'}</button></div>`; }); return html; }
  function factionsHtml(){ let html=`<section class="panel-section"><h2>勢力</h2><p>母星を落とされた帝国は敗退し、残存拠点も接収されます。</p></section>`; state.factions.forEach(f=>{ const fs=fleetStats(f), home=system(f.home); html+=`<button class="faction-card" data-faction="${f.id}" type="button"><img src="${factionImage(f)}" alt=""><div><b>${f.name}${f.id==='P'?'（あなた）':''}</b><span>${home?.name||'母星なし'} / 保有${owned(f.id).length} / 戦力${fs.power}<br>${f.eliminated?'敗退済み':fleetText(f)}</span></div><span class="pill ${f.id==='P'?'you':f.eliminated?'bad':''}">${f.eliminated?'敗退':'詳細'}</span></button>`; }); return html; }
  function logHtml(){ return `<section class="panel-section"><h2>銀河ログ</h2>${state.logs.map(l=>`<div class="log-line ${l.tone}">T${l.turn}: ${l.text}</div>`).join('')||'<p class="empty">まだログはありません。</p>'}</section>`; }
  function codexHtml(){ const planetRows=Object.entries(BODY_TYPES).map(([id,p])=>`<div class="planet-line"><img src="${imgPath('planets',p.img)}" alt=""><p><b>${p.name}</b><br>${p.note}<br>${Object.entries(p.yields).map(([k,v])=>`${RESOURCES[k].label}+${v}`).join(' / ')}</p></div>`).join(''); const techRows=TECHS.map(t=>`<li><b>${t.name}</b>：${t.text}${t.doctrine?`（${DOCTRINES[t.doctrine]?.name}専用）`:''}</li>`).join(''); return `<section class="panel-section"><h2>説明書</h2><p>5つの恒星系があり、各勢力の母星は惑星です。最初は母星の衛星まで、研究後に同じ恒星系の別惑星、さらに恒星チャージとワープで敵星系へ進みます。</p></section><div class="codex-list"><details open><summary>勝利条件</summary><ul><li>支配勝利：全天体の60%以上を保有。</li><li>技術勝利：方針別または共通の最終技術を取得。</li><li>覇権勝利：CPU勢力の母星をすべて制圧。</li></ul></details><details open><summary>植民地と維持費</summary><p>植民直後の惑星は人口維持で食料・電力・資材が赤字になりがちです。開発Lvを上げて黒字化してから拡張すると安定します。</p></details><details><summary>恒星とワープ侵攻</summary><p>恒星ハーネスで恒星チャージ、ワープ航法で敵星系へ侵攻できます。侵攻では艦船構成、武器/シールド/推進、相手の防衛施設タイプが効きます。</p></details><details><summary>星の種類</summary>${planetRows}</details><details><summary>研究ツリー</summary><ul>${techRows}</ul></details></div>`; }
  function bindFactionButtons(root){ root.querySelectorAll('[data-faction]').forEach(btn=>btn.addEventListener('click',()=>showFactionDetail(btn.dataset.faction))); }
  function openMobilePage(page){ modalPage=page; const title={empire:'帝国',tech:'技術',factions:'勢力',codex:'説明書',log:'ログ'}[page]||'情報'; const html=page==='empire'?empireHtml():page==='tech'?techHtml():page==='factions'?factionsHtml():page==='codex'?codexHtml():logHtml(); showModal(`<h2>${title}</h2>${html}`,true); bindActionButtons($('modalBody')); bindFactionButtons($('modalBody')); }

  function showResourceHelp(k){ const r=RESOURCES[k], inc=totalIncome('P')[k]||0; showModal(`<h2>${r.label}</h2><div class="help-grid"><div><h3>何に使う？</h3><p>${r.use}</p></div><div><h3>どう増える？</h3><p>${r.gain}</p></div><div><h3>現在の収入</h3><p>毎ターン ${signFmt(inc)}。植民地の維持費でマイナスになることもあります。</p></div><div><h3>戦略メモ</h3><p>${r.advice}</p></div></div>`); }
  function showApHelp(){ showModal(`<h2>APとは？</h2><p>APは1ターンにできる主要行動数です。探索・植民・開発・研究・艦船建造・艦隊強化・恒星チャージ・侵攻で1ずつ使います。</p><p>序盤は3AP。技術「星域兵站」で4APになります。</p>`); }
  function showHelp(){ openMobilePage('codex'); }
  function showFactionDetail(fid){ const f=faction(fid), fs=fleetStats(f), prod=totalIncome(fid), home=system(f.home), star=system(f.star); showModal(`<h2>${f.name}${fid==='P'?'（あなた）':''}</h2><div class="help-grid"><div><h3>状態</h3><p>${f.eliminated?'敗退済み':'活動中'}</p></div><div><h3>母星</h3><p>${home?.name||'なし'}</p></div><div><h3>恒星</h3><p>${star?.name||'なし'} / 充填${f.charge}/${f.maxCharge}</p></div><div><h3>保有</h3><p>${owned(fid).length}天体</p></div><div><h3>艦隊</h3><p>${fleetText(f)}<br>総合${fs.power} / 攻撃${fs.attack} / シールド${fs.shield}</p></div><div><h3>収入</h3><p>${RESOURCE_ORDER.filter(k=>prod[k]).map(k=>`${RESOURCES[k].label}${signFmt(prod[k])}`).join(' / ')||'なし'}</p></div></div>`,true); }
  function showModal(html,page=false){ const dialog=$('infoModal'); $('infoModal').querySelector('.modal-card').classList.toggle('page',!!page); $('modalBody').innerHTML=html; if(!dialog.open) dialog.showModal(); }
  function toast(text){ modalPage=null; showModal(`<h2>操作できません</h2><p>${text}</p>`); }

  function checkVictory(){ if(!state||state.victory) return; const p=player(); if(owned('P').length>=Math.ceil(state.systems.length*.6)) return setVictory('支配勝利','全天体の60%以上を支配しました。'); if(p.techs.some(id=>TECHS.find(t=>t.id===id)?.final)) return setVictory('技術勝利','最終技術を完成しました。'); if(state.factions.filter(f=>f.id!=='P').every(f=>f.eliminated||owned(f.id).length===0)) return setVictory('覇権勝利','CPU勢力の母星をすべて制圧しました。'); }
  function setVictory(title,text){ state.victory={title,text}; showModal(`<h2>${title}</h2><p>${text}</p><p>別の文明方針や銀河シードでも試してみてください。</p>`); }

  function bind(){
    $('startBtn').onclick=startNew; $('continueBtn').onclick=continueGame; $('randomSeedBtn').onclick=()=>{$('seedInput').value=randomSeedText();};
    $('homeBtn').onclick=()=>centerOn(system(player().home),1.8); $('allMapBtn').onclick=fullMap; $('zoomInBtn').onclick=()=>{camera.zoom=clamp(camera.zoom*1.18,.65,5); draw();}; $('zoomOutBtn').onclick=()=>{camera.zoom=clamp(camera.zoom/1.18,.65,5); draw();};
    $('helpBtn').onclick=showHelp; $('turnChip').onclick=showApHelp; $('saveBtn').onclick=()=>{save(); toast('保存しました。次回は「続きから」で再開できます。');}; $('endTurnBtn').onclick=endTurn; $('modalClose').onclick=()=>{modalPage=null; $('infoModal').close();}; $('sheetToggle').onclick=()=>{state.sheetCollapsed=!state.sheetCollapsed; renderPanel(); save();};
    document.querySelectorAll('#sideMenu [data-page]').forEach(b=>b.onclick=()=>openMobilePage(b.dataset.page));
    canvas=$('starCanvas');
    canvas.addEventListener('pointerdown',canvasPointerDown,{passive:false}); canvas.addEventListener('pointermove',canvasPointerMove,{passive:false}); canvas.addEventListener('pointerup',canvasPointerUp); canvas.addEventListener('pointercancel',canvasPointerCancel); canvas.addEventListener('lostpointercapture',canvasPointerCancel);
    canvas.addEventListener('touchstart',canvasTouchStart,{passive:false}); canvas.addEventListener('touchmove',canvasTouchMove,{passive:false}); canvas.addEventListener('touchend',canvasTouchEnd,{passive:false}); canvas.addEventListener('touchcancel',canvasTouchEnd,{passive:false});
    const stopGesture=e=>{ if($('gameScreen').classList.contains('is-active')) e.preventDefault(); };
    document.addEventListener('gesturestart',stopGesture,{passive:false}); document.addEventListener('gesturechange',stopGesture,{passive:false}); document.addEventListener('gestureend',stopGesture,{passive:false});
    document.addEventListener('visibilitychange',resetPointerState); addEventListener('blur',resetPointerState); addEventListener('resize',()=>{ resetPointerState(); resizeCanvas(); });
  }

  canvas=$('starCanvas');
  ctx=canvas.getContext('2d');
  initTitle();
  bind();
  showScreen('title');
  resizeCanvas();
  preload().then(()=>{ draw(); render(); });

  window.SFDebug = { getState:()=>state, start:()=>{startNew(); return state;}, select:(id)=>{state.selectedId=id; advanceTutorialOnSelect(system(id)); render();}, action:handleAction, endTurn, connected:()=>galaxyIsConnected(), totalSystems:()=>state?.systems.length||0, income:()=>totalIncome('P') };
})();
