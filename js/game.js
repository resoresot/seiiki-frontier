(() => {
  'use strict';

  const SAVE_KEY = 'seiiki-frontier-save-v5-mobile';
  const AS = 'assets/img/';
  const PLANET_TYPES = {
    terran:{name:'豊穣星', img:'terran', yields:{materials:8,research:4,influence:5,energy:3,food:8,crystal:1,credits:4}},
    desert:{name:'砂漠星', img:'desert', yields:{materials:9,research:3,influence:3,energy:5,food:1,crystal:2,credits:3}},
    ocean:{name:'海洋星', img:'ocean', yields:{materials:4,research:5,influence:4,energy:3,food:10,crystal:1,credits:4}},
    volcanic:{name:'火山星', img:'volcanic', yields:{materials:12,research:3,influence:2,energy:9,food:0,crystal:4,credits:2}},
    ice:{name:'氷結星', img:'ice', yields:{materials:5,research:8,influence:3,energy:4,food:2,crystal:3,credits:3}},
    industrial:{name:'工業星', img:'industrial', yields:{materials:13,research:4,influence:2,energy:6,food:1,crystal:2,credits:6}},
    gas_giant:{name:'ガス巨星', img:'gas_giant', yields:{materials:3,research:4,influence:2,energy:13,food:0,crystal:2,credits:4}},
    moon:{name:'衛星', img:'moon', yields:{materials:6,research:3,influence:2,energy:3,food:0,crystal:1,credits:2}},
    crystal:{name:'結晶星', img:'crystal', yields:{materials:5,research:6,influence:2,energy:4,food:0,crystal:10,credits:4}},
    relic:{name:'遺跡星', img:'relic', yields:{materials:4,research:12,influence:6,energy:3,food:2,crystal:5,credits:5}},
    anomaly:{name:'異常宙域', img:'anomaly', yields:{materials:3,research:10,influence:4,energy:8,food:0,crystal:7,credits:3}},
    asteroid:{name:'小惑星帯', img:'asteroid', yields:{materials:14,research:2,influence:1,energy:2,food:0,crystal:5,credits:2}}
  };
  const PLANET_KEYS = Object.keys(PLANET_TYPES);
  const RESOURCES = {
    materials:{label:'資材', icon:'materials', use:'植民、惑星開発、艦船建造、艦隊強化に使います。', gain:'支配している星系から毎ターン入ります。工業星、火山星、小惑星帯は多めです。', advice:'序盤は植民と開発で一番使います。足りない時は資材が多い星を取りましょう。'},
    research:{label:'研究', icon:'research', use:'技術ツリーを解放します。長期の勝ち筋を作る資源です。', gain:'支配星系から毎ターン入ります。遺跡星、異常宙域、氷結星は多めです。', advice:'貯めるだけでは弱いので、技術タブでこまめに使いましょう。'},
    influence:{label:'影響', icon:'influence', use:'探索、植民、星域拡大に使います。', gain:'母星、人口の多い星、遺跡星などから毎ターン入ります。', advice:'探索と植民の入口です。影響が切れると拡張が止まります。'},
    energy:{label:'電力', icon:'energy', use:'高位技術、艦隊強化、後半施設の基盤になります。', gain:'ガス巨星、火山星、異常宙域などから入りやすいです。', advice:'序盤は余りやすいですが、艦隊を強くし始めると重要になります。'},
    food:{label:'食料', icon:'food', use:'植民と人口成長に関わります。', gain:'豊穣星、海洋星から多く入ります。', advice:'人口が増えると星系の産出も伸びます。'},
    crystal:{label:'結晶', icon:'crystal', use:'特殊技術、上位艦、後半の差別化に使います。', gain:'結晶星、異常宙域、小惑星帯から入ります。', advice:'すぐ使わなくても、後半の強い選択肢になります。'},
    credits:{label:'信用', icon:'credits', use:'建造や不足資源の補助、交易系の成長に使います。', gain:'支配星系、商業技術、交易により増えます。', advice:'万能寄りですが、直接勝つ資源ではありません。足りない資源の穴埋め役です。'}
  };
  const RESOURCE_ORDER = ['materials','research','influence','energy','food','crystal','credits'];
  const DOCTRINES = {
    tech:{name:'技術国家', short:'研究', image:'tech', color:'#6ee7ff', desc:'研究が伸びやすく、後半の技術勝利を狙いやすい。'},
    war:{name:'軍事国家', short:'艦隊', image:'war', color:'#ff6b6b', desc:'艦隊を作りやすく、隣接勢力への圧力が強い。'},
    trade:{name:'商業国家', short:'信用', image:'trade', color:'#ffd37a', desc:'信用と交易で、足りない資源を補いながら広がる。'},
    eco:{name:'生態国家', short:'人口', image:'eco', color:'#69f0a4', desc:'食料と人口が伸び、長期的な産出が強い。'},
    mystic:{name:'秘教国家', short:'遺物', image:'mystic', color:'#c589ff', desc:'遺跡や異常宙域を活かし、特殊な伸び方をする。'}
  };
  const CPU_DOCTRINES = ['machine','eco','war','trade'];
  const CPU_IMAGES = {machine:'machine',eco:'eco',war:'war',trade:'trade'};
  const CPU_NAMES = ['黒曜連合','緑星協約','赤環帝国','黄昏商圏'];
  const SHIPS = {
    scout:{name:'偵察艇', icon:'scout', power:6, attack:4, shield:2, cost:{materials:10,energy:2,credits:2}, text:'安い小型艦。探索護衛と数合わせに向く。'},
    frigate:{name:'フリゲート', icon:'fleet', power:14, attack:9, shield:6, cost:{materials:22,energy:5,credits:4}, text:'序盤の主力艦。攻防のバランスが良い。'},
    destroyer:{name:'駆逐艦', icon:'attack', power:30, attack:23, shield:10, cost:{materials:46,energy:12,crystal:2,credits:8}, text:'攻撃力が高い中型艦。侵攻の成功率を上げる。'},
    carrier:{name:'空母', icon:'command', power:58, attack:38, shield:26, cost:{materials:86,energy:24,crystal:7,credits:16}, text:'高価な大型艦。戦線全体の決定力になる。'}
  };
  const UPGRADES = {
    weapons:{name:'武器', icon:'attack', cost:{materials:36,research:18,energy:8}, text:'攻撃力を上げ、侵攻で勝ちやすくします。'},
    shields:{name:'シールド', icon:'defense', cost:{materials:30,research:16,energy:10}, text:'防御力を上げ、戦闘時の損耗を減らします。'},
    engines:{name:'推進', icon:'technology', cost:{materials:26,research:16,crystal:2}, text:'艦隊戦力と機動力を底上げします。'}
  };
  const TECHS = [
    {id:'route', name:'星図航路', icon:'scout', cost:28, text:'探索コスト-1。隣接星の発見が楽になる。', doctrine:null},
    {id:'factory', name:'軌道工廠', icon:'industry', cost:42, text:'開発コスト-20%。資源基盤を作りやすくする。', req:['route']},
    {id:'command', name:'星域司令部', icon:'command', cost:66, text:'毎ターンAP+1。1ターンに取れる選択肢が増える。', req:['factory']},
    {id:'laser', name:'光子演算炉', icon:'technology', cost:34, text:'研究産出+25%。技術勝利へ進みやすい。', doctrine:'tech'},
    {id:'gate', name:'恒星門', icon:'scout', cost:88, text:'植民コスト-25%。遠方進出の準備が整う。', doctrine:'tech', req:['laser']},
    {id:'core', name:'銀河中枢', icon:'victory', cost:138, text:'技術勝利を達成する最終技術。', doctrine:'tech', req:['gate'], final:true},
    {id:'dock', name:'軍港網', icon:'fleet', cost:32, text:'艦船建造コスト-10%。', doctrine:'war'},
    {id:'marines', name:'降下軍団', icon:'attack', cost:58, text:'侵攻時の攻撃力+25%。', doctrine:'war', req:['dock']},
    {id:'conquest', name:'制圧艦隊', icon:'victory', cost:128, text:'母星攻略に強い最終軍事技術。', doctrine:'war', req:['marines'], final:true},
    {id:'bank', name:'星間銀行', icon:'credits', cost:30, text:'信用産出+35%。', doctrine:'trade'},
    {id:'charter', name:'開拓勅許', icon:'colony', cost:74, text:'植民時に信用で資材不足を補える。', doctrine:'trade', req:['bank']},
    {id:'market', name:'銀河市場', icon:'victory', cost:120, text:'経済圏で銀河を包む最終交易技術。', doctrine:'trade', req:['charter'], final:true},
    {id:'bio', name:'生体ドーム', icon:'food', cost:28, text:'食料産出+40%。人口成長が早くなる。', doctrine:'eco'},
    {id:'terraform', name:'大気改造', icon:'colony', cost:78, text:'植民コスト-25%。低環境星を活かす。', doctrine:'eco', req:['bio']},
    {id:'lifeweb', name:'生命圏ネットワーク', icon:'victory', cost:122, text:'巨大生態圏を完成させる最終技術。', doctrine:'eco', req:['terraform'], final:true},
    {id:'relic', name:'遺物解読', icon:'crystal', cost:30, text:'遺跡・異常宙域の研究/結晶+50%。', doctrine:'mystic'},
    {id:'void', name:'虚空航法', icon:'espionage', cost:82, text:'一部の遠隔星系へ進出しやすくなる。', doctrine:'mystic', req:['relic']},
    {id:'singularity', name:'特異点の王冠', icon:'victory', cost:128, text:'常識外の勝ち筋を開く最終技術。', doctrine:'mystic', req:['void'], final:true}
  ];
  const NAMES = ['アステル','ノヴァリス','カリナ','エオス','ミラージュ','ヴェガ門','オルフェ','リュミエール','ネビュラ','アークトゥルス','イオ','カロン','ラグランジュ','ヘリオス','セレネ','アルタイル','リゲル','ゼファー','オベロン','ペルセウス','アンドロメダ','クロノス','アトラス','カシオペア','ミネルヴァ','プロキオン','オーロラ','ノクス','エクリプス','ゼニス','オリオン','シリウス外縁'];

  let state = null;
  let selectedDoctrine = 'tech';
  let activeTab = 'system';
  let images = {};
  let rng = null;
  let canvas, ctx;
  let camera = {x:.5,y:.5,zoom:2.05};
  let drag = {active:false,moved:false,startX:0,startY:0,lastX:0,lastY:0};
  let replayIndex = 0;

  const $ = (id) => document.getElementById(id);
  const clamp = (n,min,max) => Math.max(min, Math.min(max, n));
  const fmt = (n) => Math.floor(n || 0).toLocaleString('ja-JP');
  const imgPath = (dir, name) => `${AS}${dir}/${name}.png`;

  class RNG {
    constructor(seed){ this.seed = RNG.hash(seed || String(Date.now())); }
    static hash(str){ let h=2166136261>>>0; for(const ch of String(str)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
    next(){ this.seed = (Math.imul(1664525,this.seed)+1013904223)>>>0; return this.seed/4294967296; }
    int(min,max){ return Math.floor(this.next()*(max-min+1))+min; }
    pick(arr){ return arr[Math.floor(this.next()*arr.length)]; }
    chance(p){ return this.next()<p; }
  }

  function player(){ return state?.factions.find(f => f.id === 'P'); }
  function faction(id){ return state?.factions.find(f => f.id === id); }
  function selectedSystem(){ return state?.systems.find(s => s.id === state.selectedId); }
  function system(id){ return state?.systems.find(s => s.id === id); }
  function owned(fid){ return state.systems.filter(s => s.owner === fid); }
  function doctrineImage(id){ return DOCTRINES[id]?.image || CPU_IMAGES[id] || 'tech'; }
  function hasTech(id, fid='P'){ return faction(fid)?.techs.includes(id); }
  function availableTechs(fid='P'){
    const d = faction(fid)?.doctrine || 'tech';
    return TECHS.filter(t => !t.doctrine || t.doctrine === d);
  }
  function isAdjacent(a,b){ return system(a)?.links.includes(b) || false; }
  function adjacentToOwned(sid, fid='P'){ return owned(fid).some(s => isAdjacent(s.id, sid)); }
  function canPay(cost, fid='P'){
    const r = faction(fid).resources;
    return Object.entries(cost).every(([k,v]) => (r[k]||0) >= v);
  }
  function pay(cost, fid='P'){
    const r = faction(fid).resources;
    Object.entries(cost).forEach(([k,v]) => r[k] = Math.max(0, (r[k]||0) - v));
  }
  function addRes(gain, fid='P'){
    const r = faction(fid).resources;
    Object.entries(gain).forEach(([k,v]) => r[k] = (r[k]||0) + v);
  }
  function costText(cost){ return Object.entries(cost).map(([k,v]) => `${RESOURCES[k]?.label || k}${v}`).join(' / '); }
  function icon(name){ return `${AS}icons/${name}.png`; }
  function planetImage(s){ return `${AS}planets/${PLANET_TYPES[s.type]?.img || 'terran'}.png`; }
  function factionImage(f){ return `${AS}factions/${doctrineImage(f.doctrine)}.png`; }

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
    return {
      power: Math.round(base * doctrineFleet * (1 + up.weapons*.07 + up.shields*.05 + up.engines*.04)),
      attack: Math.round(atk * doctrineFleet * (1 + up.weapons*.12 + up.engines*.04)),
      shield: Math.round(shield * (1 + up.shields*.14 + up.engines*.03))
    };
  }
  function fleetText(f){ return Object.entries(SHIPS).map(([k,s]) => `${s.name}${f.ships?.[k] || 0}`).join(' / '); }

  function preload(){
    const entries = [
      ['bg', `${AS}galaxy-bg.png`],
      ...Object.values(PLANET_TYPES).map(p => [`planet_${p.img}`, imgPath('planets', p.img)]),
      ...Object.values(RESOURCES).map(r => [`icon_${r.icon}`, icon(r.icon)]),
      ...Object.values(SHIPS).map(s => [`icon_${s.icon}`, icon(s.icon)]),
      ...Object.values(UPGRADES).map(u => [`icon_${u.icon}`, icon(u.icon)]),
      ...TECHS.map(t => [`icon_${t.icon}`, icon(t.icon)]),
      ...['tech','war','trade','eco','mystic','machine','federation','raider','hive','precursor'].map(n => [`faction_${n}`, imgPath('factions', n)])
    ];
    return Promise.all(entries.map(([k,src]) => new Promise(resolve => {
      const im = new Image(); im.onload = () => { images[k] = im; resolve(); }; im.onerror = resolve; im.src = src;
    })));
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
    $('continueBtn').disabled = !localStorage.getItem(SAVE_KEY);
  }

  function showScreen(which){
    $('titleScreen').classList.toggle('is-active', which === 'title');
    $('gameScreen').classList.toggle('is-active', which === 'game');
    document.body.style.overflow = which === 'title' ? 'auto' : 'hidden';
    if(which === 'game') setTimeout(() => { resizeCanvas(); draw(); }, 40);
  }
  function randomSeedText(){ return ['Orion','Nova','Vega','Eos','Zenith','Luna','Aster','Nox','Iris','Kronos'][Math.floor(Math.random()*10)] + '-' + Math.floor(1000+Math.random()*9000); }

  function createGame(seed, doctrine){
    rng = new RNG(seed);
    const factions = [
      {id:'P', name:'あなたの帝国', doctrine, color:DOCTRINES[doctrine].color, home:0, resources:{materials:96,research:36,influence:38,energy:42,food:42,crystal:10,credits:40}, ships:{scout:2,frigate:1,destroyer:0,carrier:0}, upgrades:{weapons:0,shields:0,engines:0}, techs:[], eliminated:false, ai:'player'},
      ...CPU_NAMES.map((name,i) => ({id:`C${i+1}`, name, doctrine:CPU_DOCTRINES[i], color:['#9fb0ff','#70f2a7','#ff7272','#ffd37a'][i], home:0, resources:{materials:70,research:26,influence:26,energy:30,food:28,crystal:8,credits:32}, ships:{scout:1,frigate:1,destroyer:0,carrier:0}, upgrades:{weapons:0,shields:0,engines:0}, techs:[], eliminated:false, ai:['research','expand','war','trade'][i] }))
    ];
    const systems = [];
    systems.push({id:0,name:'母星アステル',type:'terran',x:.5,y:.5,links:[],owner:'P',explored:true,level:2,pop:5,defense:18,homeOf:'P'});
    // Tutorial-friendly adjacent targets.
    systems.push({id:1,name:'エオス前哨',type:'desert',x:.62,y:.49,links:[],owner:null,explored:false,level:0,pop:0,defense:8,homeOf:null,tutorial:true});
    systems.push({id:2,name:'ミラージュ小惑星帯',type:'asteroid',x:.43,y:.39,links:[],owner:null,explored:false,level:0,pop:0,defense:10,homeOf:null});
    const anchors = [
      {x:.18,y:.22,type:'industrial'}, {x:.83,y:.22,type:'ocean'}, {x:.19,y:.79,type:'volcanic'}, {x:.82,y:.79,type:'relic'}
    ];
    anchors.forEach((a,i) => {
      const id = systems.length;
      const fid = `C${i+1}`;
      factions[i+1].home = id;
      systems.push({id,name:`${CPU_NAMES[i]}母星`,type:a.type,x:a.x,y:a.y,links:[],owner:fid,explored:true,level:1,pop:4,defense:16,homeOf:fid});
    });
    while(systems.length < 32){
      const id = systems.length;
      let x=.08+rng.next()*.84, y=.12+rng.next()*.78;
      if(Math.hypot(x-.5,y-.5) < .12) continue;
      systems.push({id,name:NAMES[id % NAMES.length],type:rng.pick(PLANET_KEYS),x,y,links:[],owner:null,explored:false,level:0,pop:0,defense:rng.int(5,16),homeOf:null});
    }
    // Connect by nearest neighbors, then guarantee tutorial path.
    systems.forEach(s => {
      const nearest = systems.filter(o => o.id !== s.id).sort((a,b) => dist(s,a)-dist(s,b)).slice(0,3);
      nearest.forEach(n => connect(systems, s.id, n.id));
    });
    connect(systems, 0, 1); connect(systems, 0, 2);
    // Ensure CPU homes are connected to local clusters and not isolated.
    factions.slice(1).forEach(f => {
      const h = systems[f.home];
      systems.filter(s => s.id !== h.id).sort((a,b)=>dist(h,a)-dist(h,b)).slice(0,4).forEach(n => connect(systems,h.id,n.id));
    });
    return {version:5, seed, turn:1, ap:3, maxAp:3, selectedId:0, systems, factions, logs:[], tutorial:{active:true,step:0}, replay:[], victory:null, sheetCollapsed:false};
  }
  function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
  function connect(systems,a,b){ if(!systems[a].links.includes(b)) systems[a].links.push(b); if(!systems[b].links.includes(a)) systems[b].links.push(a); }

  function startNew(){
    const seed = $('seedInput').value.trim() || randomSeedText();
    state = createGame(seed, selectedDoctrine);
    activeTab = 'system';
    camera = {x:.5,y:.5,zoom:2.15};
    addLog(`銀河シード「${seed}」で${DOCTRINES[selectedDoctrine].name}が始動。`, 'good');
    showScreen('game');
    save();
    render();
  }
  function continueGame(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return;
      state = JSON.parse(raw);
      normalizeState();
      activeTab = 'system';
      camera = state.camera || {x: system(player().home).x, y: system(player().home).y, zoom:2.1};
      showScreen('game');
      render();
    }catch(e){ alert('セーブデータを読み込めませんでした。'); }
  }
  function normalizeState(){
    if(!state.version) state.version = 5;
    state.factions.forEach(f => { f.ships ||= {scout:1,frigate:0,destroyer:0,carrier:0}; f.upgrades ||= {weapons:0,shields:0,engines:0}; f.techs ||= []; f.eliminated ||= false; });
    state.logs ||= [];
    state.replay ||= [];
    state.tutorial ||= {active:false,step:99};
    state.maxAp ||= 3;
    state.ap ??= state.maxAp;
    state.selectedId ??= player().home;
  }
  function save(){
    if(!state) return;
    state.camera = camera;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    initTitle();
  }
  function addLog(text, tone=''){
    state.logs.unshift({turn:state.turn,text,tone});
    state.logs = state.logs.slice(0,80);
  }

  function resizeCanvas(){
    canvas = $('starCanvas'); ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(innerWidth * dpr); canvas.height = Math.floor(innerHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw();
  }
  function worldToScreen(s){
    const w = innerWidth, h = innerHeight;
    const scale = Math.min(w,h) * camera.zoom;
    return {x: w/2 + (s.x-camera.x)*scale, y: h/2 + (s.y-camera.y)*scale};
  }
  function screenToWorld(x,y){
    const scale = Math.min(innerWidth,innerHeight) * camera.zoom;
    return {x: camera.x + (x-innerWidth/2)/scale, y: camera.y + (y-innerHeight/2)/scale};
  }
  function centerOn(s, zoom){
    if(!s) return;
    camera.x = clamp(s.x, .04, .96); camera.y = clamp(s.y, .04, .96);
    if(zoom) camera.zoom = zoom;
    draw();
  }
  function draw(){
    if(!ctx || !state) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    const bg = images.bg;
    if(bg) ctx.drawImage(bg,0,0,innerWidth,innerHeight); else { ctx.fillStyle = '#020711'; ctx.fillRect(0,0,innerWidth,innerHeight); }
    ctx.save();
    ctx.globalAlpha=.42;
    ctx.fillStyle='rgba(2,7,17,.48)'; ctx.fillRect(0,0,innerWidth,innerHeight);
    ctx.restore();

    // Links.
    state.systems.forEach(s => {
      const a = worldToScreen(s);
      s.links.forEach(id => {
        if(id < s.id) return;
        const o = system(id), b = worldToScreen(o);
        const known = s.explored || o.explored || s.owner || o.owner;
        ctx.strokeStyle = known ? 'rgba(133,201,255,.22)' : 'rgba(133,201,255,.07)';
        ctx.lineWidth = known ? 1.2 : .8;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      });
    });

    // Tutorial target ring.
    const tutTarget = tutorialTargetSystem();

    state.systems.forEach(s => {
      const p = worldToScreen(s);
      if(p.x < -60 || p.x > innerWidth+60 || p.y < -60 || p.y > innerHeight+60) return;
      const isSel = s.id === state.selectedId;
      const r = s.homeOf ? 21 : s.owner ? 17 : s.explored ? 15 : 11;
      const own = s.owner ? faction(s.owner) : null;
      if(s.owner){
        ctx.beginPath(); ctx.arc(p.x,p.y,r+11,0,Math.PI*2); ctx.fillStyle = own.color + '24'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = own.color + 'bb'; ctx.stroke();
      }
      if(tutTarget && tutTarget.id === s.id){
        const pulse = 4 + Math.sin(Date.now()/220)*3;
        ctx.beginPath(); ctx.arc(p.x,p.y,r+17+pulse,0,Math.PI*2); ctx.strokeStyle='rgba(110,231,255,.9)'; ctx.lineWidth=3; ctx.stroke();
      }
      if(isSel){ ctx.beginPath(); ctx.arc(p.x,p.y,r+15,0,Math.PI*2); ctx.strokeStyle='rgba(255,211,122,.96)'; ctx.lineWidth=3; ctx.stroke(); }
      if(s.explored || s.owner){
        const im = images[`planet_${PLANET_TYPES[s.type]?.img}`];
        if(im) ctx.drawImage(im,p.x-r,p.y-r,r*2,r*2); else { ctx.fillStyle='#aac'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill(); }
      }else{
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle='rgba(70,115,170,.5)'; ctx.fill(); ctx.strokeStyle='rgba(180,220,255,.35)'; ctx.stroke();
        ctx.fillStyle='#dff4ff'; ctx.font='bold 14px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',p.x,p.y+1);
      }
      if(s.homeOf){
        ctx.fillStyle='#fff'; ctx.font='bold 10px system-ui'; ctx.textAlign='center';
        ctx.fillText(s.homeOf === 'P' ? 'YOU' : s.homeOf, p.x, p.y+r+16);
      }
      if(s.owner){
        ctx.fillStyle = own.color; ctx.beginPath(); ctx.arc(p.x+r*.75,p.y-r*.75,5,0,Math.PI*2); ctx.fill();
      }
    });

    requestAnimationFrame(() => { if(state?.tutorial?.active) draw(); });
  }

  function nearestSystemAt(clientX, clientY){
    let best=null, bestD=999;
    state.systems.forEach(s => {
      const p=worldToScreen(s); const d=Math.hypot(clientX-p.x, clientY-p.y);
      const hit = s.homeOf ? 34 : 28;
      if(d < hit && d < bestD){ best=s; bestD=d; }
    });
    return best;
  }

  function canvasPointerDown(e){
    drag.active=true; drag.moved=false; drag.startX=e.clientX; drag.startY=e.clientY; drag.lastX=e.clientX; drag.lastY=e.clientY; canvas.setPointerCapture?.(e.pointerId);
  }
  function canvasPointerMove(e){
    if(!drag.active) return;
    const dx=e.clientX-drag.lastX, dy=e.clientY-drag.lastY;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6) drag.moved=true;
    const scale = Math.min(innerWidth,innerHeight) * camera.zoom;
    camera.x = clamp(camera.x - dx/scale, 0, 1);
    camera.y = clamp(camera.y - dy/scale, 0, 1);
    drag.lastX=e.clientX; drag.lastY=e.clientY; draw();
  }
  function canvasPointerUp(e){
    if(!drag.active) return; drag.active=false;
    if(!drag.moved){
      const s = nearestSystemAt(e.clientX,e.clientY);
      if(s){ state.selectedId=s.id; activeTab='system'; advanceTutorialOnSelect(s); save(); render(); }
    }
  }

  function tutorialTargetSystem(){
    if(!state?.tutorial?.active) return null;
    const step = state.tutorial.step;
    if(step <= 1) return system(1);
    if(step === 3) return system(1);
    if(step === 4) return selectedSystem()?.owner === 'P' ? selectedSystem() : system(1);
    return null;
  }
  function advanceTutorialOnSelect(s){
    if(!state.tutorial.active) return;
    if(state.tutorial.step === 0 && s.id === 1) state.tutorial.step = 1;
    if(state.tutorial.step === 3 && s.id === 1) state.tutorial.step = 3;
  }
  function tutorialAllows(action){
    if(!state.tutorial.active) return true;
    const step = state.tutorial.step;
    if(action === 'skip' || action === 'help') return true;
    if(step === 0) return false;
    if(step === 1) return action === 'explore';
    if(step === 2) return action === 'endTurn';
    if(step === 3) return action === 'colonize';
    if(step === 4) return action === 'develop';
    if(step === 5) return action === 'endTurn';
    return true;
  }
  function tutorialText(){
    if(!state?.tutorial?.active) return null;
    const step = state.tutorial.step;
    const data = {
      0:['チュートリアル 1/5','母星の隣を選ぶ','母星の右にある「？」の星をタップしてください。ドラッグすればマップも動かせます。'],
      1:['チュートリアル 2/5','探索してみましょう','下の「探索」ボタンを押すと、影響とAPを使って星の正体がわかります。'],
      2:['チュートリアル 3/5','ターンを終える','APを使ったので、ターン終了を押します。CPUの行動も表示されます。'],
      3:['チュートリアル 4/5','星を植民する','探索したエオス前哨を選び、「植民」を押します。資材・影響・食料を使って自領にします。'],
      4:['チュートリアル 5/5','開発して産出を増やす','植民した星を「開発」して、次ターン以降の資源収入を増やしましょう。'],
      5:['チュートリアル完了前','2ターン目を終える','ターン終了でチュートリアルは完了です。以降は自由に研究・艦隊・侵攻を選べます。']
    }[step] || ['チュートリアル','自由行動','好きな戦略で進めてください。'];
    return data;
  }

  function render(){
    if(!state) return;
    renderTop(); renderCoach(); renderPanel(); renderReplay(); draw(); checkVictory(); save();
  }
  function renderTop(){
    $('turnValue').textContent = state.turn;
    $('apValue').textContent = `AP ${state.ap}/${state.maxAp}`;
    const bar = $('resourceBar'); bar.innerHTML = '';
    const p = player();
    RESOURCE_ORDER.forEach(k => {
      const r = RESOURCES[k];
      const btn = document.createElement('button'); btn.type='button'; btn.className='resource-chip'; btn.setAttribute('aria-label',`${r.label}の説明`);
      btn.innerHTML = `<img src="${icon(r.icon)}" alt=""><small>${r.label}</small><b>${fmt(p.resources[k])}</b>`;
      btn.onclick = () => showResourceHelp(k);
      bar.appendChild(btn);
    });
  }
  function renderCoach(){
    const coach = $('coach');
    const data = tutorialText();
    if(!data){ coach.classList.add('is-hidden'); return; }
    coach.classList.remove('is-hidden');
    $('coachKicker').textContent = data[0]; $('coachTitle').textContent = data[1]; $('coachText').textContent = data[2];
  }
  function renderPanel(){
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === activeTab));
    $('bottomSheet').classList.toggle('is-collapsed', !!state.sheetCollapsed);
    $('endTurnBtn').disabled = !tutorialAllows('endTurn');
    if(activeTab === 'system') renderSystemPanel();
    else if(activeTab === 'empire') renderEmpirePanel();
    else if(activeTab === 'tech') renderTechPanel();
    else if(activeTab === 'factions') renderFactionsPanel();
    else renderLogPanel();
  }

  function renderSystemPanel(){
    const body = $('panelBody'); const s = selectedSystem();
    if(!s){ body.innerHTML = `<div class="panel-section"><p class="empty">星をタップしてください。</p></div>`; return; }
    const type = PLANET_TYPES[s.type];
    const owner = s.owner ? faction(s.owner) : null;
    const visibility = s.explored || s.owner;
    let html = `<section class="panel-section"><h2>${visibility ? s.name : '未探索星系'}</h2>`;
    html += `<div class="mini-grid"><div class="stat-card"><small>種類</small><b>${visibility ? type.name : '不明'}</b></div><div class="stat-card"><small>支配</small><b>${owner ? owner.name.replace('あなたの','あなたの<br>') : '中立'}</b></div><div class="stat-card"><small>開発Lv</small><b>${s.level}</b></div><div class="stat-card"><small>防衛</small><b>${s.defense}</b></div></div>`;
    if(visibility) html += `<p style="margin-top:10px">毎ターン産出：${yieldText(s)}</p>`;
    html += `</section>`;
    html += `<section class="panel-section"><h3>できること</h3><div class="action-list">${actionButtonsHtml(s)}</div></section>`;
    html += `<section class="panel-section"><h3>考え方</h3><p>${systemAdvice(s)}</p></section>`;
    body.innerHTML = html;
    body.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.arg)));
  }
  function yieldText(s){
    const y = systemYield(s);
    return Object.entries(y).filter(([,v])=>v>0).map(([k,v])=>`${RESOURCES[k].label}+${v}`).join(' / ') || 'なし';
  }
  function systemYield(s){
    const base = {...PLANET_TYPES[s.type].yields};
    const mult = 1 + s.level * .34 + Math.max(0, s.pop-1)*.06;
    if(hasTech('laser') && (s.type==='relic' || s.type==='anomaly' || s.type==='ice')) base.research *= 1.25;
    if(hasTech('bio') && (s.type==='terran' || s.type==='ocean')) base.food *= 1.4;
    if(hasTech('relic') && (s.type==='relic' || s.type==='anomaly')) { base.research *= 1.5; base.crystal *= 1.5; }
    if(hasTech('bank')) base.credits *= 1.35;
    const out = {}; Object.entries(base).forEach(([k,v]) => out[k] = Math.floor(v * mult)); return out;
  }
  function actionButtonsHtml(s){
    const actions = getActionsFor(s);
    if(actions.length === 0) return `<div class="hint-box">この星で今できる操作はありません。自領の隣の「？」なら探索、探索済みの中立星なら植民、自領星なら開発できます。</div>`;
    return actions.map(a => `<button class="action-btn ${a.warn?'warn':''}" data-action="${a.id}" data-arg="${a.arg||''}" type="button"><b>${a.label}</b><span>${a.desc}</span></button>`).join('');
  }
  function getActionsFor(s){
    const actions=[];
    if(!s.owner && !s.explored && adjacentToOwned(s.id)){
      const cost={influence: hasTech('route') ? 3 : 4};
      if(tutorialAllows('explore')) actions.push({id:'explore',label:'探索',desc:`AP1 / ${costText(cost)}。星の種類と産出がわかります。`});
    }
    if(!s.owner && s.explored && adjacentToOwned(s.id)){
      const cost = colonizeCost();
      if(tutorialAllows('colonize')) actions.push({id:'colonize',label:'植民',desc:`AP1 / ${costText(cost)}。この星を自領にします。`});
    }
    if(s.owner === 'P'){
      const cost = developCost(s);
      if(tutorialAllows('develop')) actions.push({id:'develop',label:'開発',desc:`AP1 / ${costText(cost)}。この星の毎ターン産出を増やします。`});
    }
    if(s.owner && s.owner !== 'P' && adjacentToOwned(s.id)){
      if(tutorialAllows('invade')) actions.push({id:'invade',label:'侵攻',warn:true,desc:`AP1。艦隊戦力でこの星を攻めます。防衛${s.defense} / 敵${faction(s.owner).name}`});
    }
    return actions;
  }
  function systemAdvice(s){
    if(!s.owner && !s.explored && adjacentToOwned(s.id)) return '探索は、自分の星に隣接している未探索星だけでできます。まず正体を調べないと植民できません。';
    if(!s.owner && s.explored && adjacentToOwned(s.id)) return '植民すると領土が広がり、この星の資源が毎ターン入ります。資材と影響を使うので、次の開発や研究とのバランスが大事です。';
    if(s.owner === 'P') return '自領星では開発できます。開発はすぐ勝利にはなりませんが、毎ターンの資源収入が増え、研究・艦隊・植民が楽になります。';
    if(s.owner && s.owner !== 'P') return 'CPU領です。隣接していれば侵攻できますが、艦船数・武器・シールド・推進の強化で結果が大きく変わります。';
    return 'まだ自領とつながっていません。隣接する星を先に探索・植民して、ここまで航路を伸ばしましょう。';
  }

  function renderEmpirePanel(){
    const p=player(), fs=fleetStats(p), body=$('panelBody');
    const prod = totalIncome('P');
    let html = `<section class="panel-section"><h2>あなたの帝国</h2><div class="mini-grid"><div class="stat-card"><small>星系</small><b>${owned('P').length}</b></div><div class="stat-card"><small>総合戦力</small><b>${fs.power}</b></div><div class="stat-card"><small>攻撃</small><b>${fs.attack}</b></div><div class="stat-card"><small>シールド</small><b>${fs.shield}</b></div></div><p style="margin-top:10px">毎ターン収入：${Object.entries(prod).filter(([,v])=>v>0).map(([k,v])=>`${RESOURCES[k].label}+${v}`).join(' / ')}</p></section>`;
    html += `<section class="panel-section"><h3>艦船を建造</h3>`;
    Object.entries(SHIPS).forEach(([id,s]) => {
      html += `<div class="ship-row"><img src="${icon(s.icon)}" alt=""><div><b>${s.name} × ${p.ships[id]||0}</b><span>${s.text}<br>戦力${s.power} / ${costText(s.cost)}</span></div><button class="pill ${canPay(s.cost)&&state.ap>0?'good':''}" data-action="buildShip" data-arg="${id}" type="button">建造</button></div>`;
    });
    html += `</section><section class="panel-section"><h3>艦隊強化</h3>`;
    Object.entries(UPGRADES).forEach(([id,u]) => {
      html += `<div class="ship-row"><img src="${icon(u.icon)}" alt=""><div><b>${u.name} Lv.${p.upgrades[id]}</b><span>${u.text}<br>${costText(upgradeCost(id))}</span></div><button class="pill ${canPay(upgradeCost(id))&&state.ap>0?'good':''}" data-action="upgrade" data-arg="${id}" type="button">強化</button></div>`;
    });
    html += `</section>`;
    body.innerHTML = html;
    body.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.arg)));
  }
  function renderTechPanel(){
    const p=player(), body=$('panelBody');
    let html = `<section class="panel-section"><h2>技術ツリー</h2><p>研究を消費して、以後の探索・開発・植民・勝利条件を強化します。</p></section>`;
    availableTechs('P').forEach(t => {
      const bought = p.techs.includes(t.id);
      const locked = (t.req||[]).some(req => !p.techs.includes(req));
      const can = !bought && !locked && p.resources.research >= t.cost && state.ap > 0 && tutorialAllows('research');
      html += `<div class="tech-card"><img src="${icon(t.icon)}" alt=""><div><b>${t.name}</b><span>${t.text}<br>研究${t.cost}${t.req?` / 前提: ${t.req.map(id=>TECHS.find(x=>x.id===id)?.name).join('・')}`:''}</span></div><button class="pill ${bought?'you':can?'good':locked?'bad':''}" data-action="research" data-arg="${t.id}" type="button" ${bought||locked?'disabled':''}>${bought?'取得済':locked?'未解放':'研究'}</button></div>`;
    });
    body.innerHTML = html;
    body.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.arg)));
  }
  function renderFactionsPanel(){
    const body=$('panelBody');
    let html = `<section class="panel-section"><h2>勢力</h2><p>勢力カードを押すと、母星・保有星・艦隊・技術の状況が見られます。</p></section>`;
    state.factions.forEach(f => {
      const fs=fleetStats(f), home=system(f.home);
      html += `<button class="faction-card" data-faction="${f.id}" type="button"><img src="${factionImage(f)}" alt=""><div><b>${f.name}${f.id==='P'?'（あなた）':''}</b><span>${home?.name || '母星なし'} / 星系${owned(f.id).length} / 戦力${fs.power}<br>${fleetText(f)}</span></div><span class="pill ${f.id==='P'?'you':''}">${f.eliminated?'滅亡':'詳細'}</span></button>`;
    });
    body.innerHTML = html;
    body.querySelectorAll('[data-faction]').forEach(btn => btn.addEventListener('click', () => showFactionDetail(btn.dataset.faction)));
  }
  function renderLogPanel(){
    $('panelBody').innerHTML = `<section class="panel-section"><h2>銀河ログ</h2>${state.logs.map(l => `<div class="log-line ${l.tone}">T${l.turn}: ${l.text}</div>`).join('') || '<p class="empty">まだログはありません。</p>'}</section>`;
  }

  function handleAction(action,arg){
    if(!tutorialAllows(action)){ toast('チュートリアル中は、表示された手順だけ実行できます。'); return; }
    if(action === 'explore') explore();
    if(action === 'colonize') colonize();
    if(action === 'develop') develop();
    if(action === 'invade') invade();
    if(action === 'buildShip') buildShip(arg);
    if(action === 'upgrade') upgrade(arg);
    if(action === 'research') research(arg);
    render();
  }
  function consumeAp(){ if(state.ap <= 0){ toast('APが足りません。ターン終了で回復します。'); return false; } state.ap--; return true; }
  function explore(){
    const s=selectedSystem(), cost={influence:hasTech('route')?3:4};
    if(!s || s.explored || s.owner || !adjacentToOwned(s.id)) return toast('探索できるのは、自領に隣接する未探索星だけです。');
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return;
    pay(cost); s.explored=true;
    addLog(`${s.name}を探索。${PLANET_TYPES[s.type].name}を発見した。`, 'good');
    if(state.tutorial.active && state.tutorial.step === 1) state.tutorial.step = 2;
  }
  function colonizeCost(){
    const discount = (hasTech('gate') || hasTech('terraform')) ? .75 : 1;
    return {materials:Math.round(22*discount), influence:Math.round(11*discount), food:5};
  }
  function colonize(){
    const s=selectedSystem(), cost=colonizeCost();
    if(!s || !s.explored || s.owner || !adjacentToOwned(s.id)) return toast('植民できるのは、探索済みで自領に隣接する中立星だけです。');
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return;
    pay(cost); s.owner='P'; s.level=Math.max(1,s.level); s.pop=Math.max(2,s.pop); s.defense += 5;
    addLog(`${s.name}を植民。新しい資源収入が加わった。`, 'good');
    if(state.tutorial.active && state.tutorial.step === 3) state.tutorial.step = 4;
  }
  function developCost(s){
    const base = {materials:18 + s.level*9, energy:4 + s.level*2};
    if(hasTech('factory')) base.materials = Math.round(base.materials*.8);
    return base;
  }
  function develop(){
    const s=selectedSystem();
    if(!s || s.owner !== 'P') return toast('開発できるのは自分の星だけです。');
    const cost=developCost(s);
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return;
    pay(cost); s.level++; s.pop += hasTech('bio') ? 2 : 1; s.defense += 3;
    addLog(`${s.name}を開発。産出と防衛が上がった。`, 'good');
    if(state.tutorial.active && state.tutorial.step === 4) state.tutorial.step = 5;
  }
  function buildShip(id){
    const ship=SHIPS[id]; if(!ship) return;
    if(state.tutorial.active) return toast('艦船建造はチュートリアル後に使えます。');
    const cost={...ship.cost}; if(hasTech('dock')) cost.materials = Math.round(cost.materials*.9);
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return;
    pay(cost); player().ships[id] = (player().ships[id]||0)+1;
    addLog(`${ship.name}を建造。艦隊戦力が上がった。`, 'good');
  }
  function upgradeCost(id){
    const u = UPGRADES[id], lv = player().upgrades[id] || 0;
    const out={}; Object.entries(u.cost).forEach(([k,v]) => out[k] = Math.round(v * (1 + lv*.55))); return out;
  }
  function upgrade(id){
    if(state.tutorial.active) return toast('艦隊強化はチュートリアル後に使えます。');
    const cost=upgradeCost(id);
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return;
    pay(cost); player().upgrades[id]++;
    addLog(`艦隊の${UPGRADES[id].name}をLv.${player().upgrades[id]}へ強化。`, 'good');
  }
  function research(id){
    if(state.tutorial.active) return toast('研究はチュートリアル後に自由に使えます。');
    const t=TECHS.find(x=>x.id===id); if(!t) return;
    if(player().techs.includes(id)) return;
    if((t.req||[]).some(r => !player().techs.includes(r))) return toast('前提技術が未取得です。');
    if(player().resources.research < t.cost) return toast('研究が足りません。');
    if(!consumeAp()) return;
    player().resources.research -= t.cost; player().techs.push(id);
    if(id === 'command') state.maxAp = 4;
    addLog(`技術「${t.name}」を取得。`, t.final ? 'good' : '');
  }
  function invade(){
    const s=selectedSystem();
    if(!s || !s.owner || s.owner === 'P' || !adjacentToOwned(s.id)) return toast('侵攻できるのは、自領に隣接するCPU領です。');
    if(state.tutorial.active) return toast('侵攻はチュートリアル後に使えます。');
    if(!consumeAp()) return;
    const p=player(), enemy=faction(s.owner), ps=fleetStats(p), es=fleetStats(enemy);
    let attack = ps.attack + ps.power*.35;
    if(hasTech('marines')) attack *= 1.25;
    const defense = s.defense + es.shield*.6 + es.power*.25;
    const roll = 0.85 + Math.random()*.35;
    if(attack*roll > defense){
      const old=enemy.name; s.owner='P'; s.level=Math.max(1,s.level); s.defense=Math.max(8,Math.round(s.defense*.55));
      p.ships.scout=Math.max(0,p.ships.scout-1); if(enemy.ships.frigate>0) enemy.ships.frigate--;
      if(s.homeOf && s.homeOf !== 'P'){ enemy.eliminated = owned(enemy.id).length === 0; }
      addLog(`${old}領${s.name}を制圧。艦隊に軽微な損耗。`, 'good');
    }else{
      p.ships.scout=Math.max(0,p.ships.scout-1); p.ships.frigate=Math.max(0,p.ships.frigate-1);
      addLog(`${s.name}への侵攻は失敗。艦隊が損耗した。`, 'bad');
    }
  }

  function endTurn(){
    if(!tutorialAllows('endTurn')) return toast('今はガイドされた操作を先に行ってください。');
    const income = totalIncome('P'); addRes(income,'P');
    growOwned('P');
    const events = cpuTurn();
    state.turn++; state.ap = state.maxAp;
    if(state.tutorial.active && state.tutorial.step === 2){ state.tutorial.step = 3; state.selectedId=1; centerOn(system(1), 2.15); // guarantee turn-2 colonization resources
      addRes({materials:28,influence:16,food:8}, 'P');
    }else if(state.tutorial.active && state.tutorial.step === 5){ state.tutorial.active=false; state.tutorial.step=99; addLog('チュートリアル完了。ここからは自由に戦略を選べます。', 'good'); }
    state.replay = events;
    replayIndex = 0;
    addLog(`ターン${state.turn}開始。資源収入を獲得。`, '');
    render();
  }
  function totalIncome(fid){
    const out={materials:0,research:0,influence:0,energy:0,food:0,crystal:0,credits:0};
    owned(fid).forEach(s => { const y=systemYield(s); Object.entries(y).forEach(([k,v]) => out[k]+=v); });
    return out;
  }
  function growOwned(fid){ owned(fid).forEach(s => { if((faction(fid).resources.food||0) > 20 && s.pop < 12) s.pop += .2; }); }
  function cpuTurn(){
    const events=[];
    state.factions.filter(f => f.id !== 'P' && !f.eliminated).forEach(f => {
      addRes(totalIncome(f.id), f.id); growOwned(f.id);
      const action = chooseCpuAction(f);
      if(action) events.push(action);
    });
    return events;
  }
  function chooseCpuAction(f){
    const my=owned(f.id);
    if(my.length === 0){ f.eliminated=true; return null; }
    const frontier = [...new Set(my.flatMap(s => s.links))].map(system).filter(Boolean);
    const neutral = frontier.find(s => !s.owner && s.explored);
    const unknown = frontier.find(s => !s.owner && !s.explored);
    const playerBorder = frontier.find(s => s.owner === 'P');
    // War CPU may attack.
    if((f.ai==='war' || f.resources.materials>120) && playerBorder && fleetStats(f).power > fleetStats(player()).power*.55){
      playerBorder.defense = Math.max(4, playerBorder.defense - 6);
      f.resources.materials = Math.max(0, f.resources.materials-18);
      return {fid:f.id, sid:playerBorder.id, text:`${f.name}が${playerBorder.name}へ威圧行動。防衛が少し低下。`, type:'attack'};
    }
    if(neutral && f.resources.materials>=18 && f.resources.influence>=9){
      f.resources.materials-=18; f.resources.influence-=9; neutral.owner=f.id; neutral.level=Math.max(1,neutral.level); neutral.pop=2; neutral.defense+=4;
      return {fid:f.id, sid:neutral.id, text:`${f.name}が${neutral.name}を植民。`, type:'colonize'};
    }
    if(unknown && f.resources.influence>=4){
      f.resources.influence-=4; unknown.explored=true;
      return {fid:f.id, sid:unknown.id, text:`${f.name}が${unknown.name}を探索。`, type:'explore'};
    }
    if(f.resources.materials>=22){
      const h = system(f.home); f.resources.materials-=22; h.level++; h.defense+=3;
      return {fid:f.id, sid:h.id, text:`${f.name}が母星を開発。`, type:'develop'};
    }
    if(f.resources.materials>=10){
      f.resources.materials-=10; f.ships.scout=(f.ships.scout||0)+1;
      return {fid:f.id, sid:f.home, text:`${f.name}が偵察艇を建造。`, type:'fleet'};
    }
    return {fid:f.id, sid:f.home, text:`${f.name}は資源を蓄積。`, type:'wait'};
  }

  function renderReplay(){
    const box=$('cpuReplay');
    if(!state.replay || state.replay.length===0){ box.hidden=true; return; }
    box.hidden=false;
    const ev=state.replay[replayIndex] || state.replay[0];
    centerOn(system(ev.sid), camera.zoom);
    box.innerHTML = `<h3>CPUターン ${replayIndex+1}/${state.replay.length}</h3><p>${ev.text}</p><div class="replay-actions"><button id="replayNext" type="button">${replayIndex < state.replay.length-1 ? '次の行動を見る' : '閉じる'}</button><button id="replayClose" type="button">まとめて閉じる</button></div>`;
    $('replayNext').onclick = () => { if(replayIndex < state.replay.length-1){ replayIndex++; renderReplay(); draw(); } else { state.replay=[]; render(); } };
    $('replayClose').onclick = () => { state.replay=[]; render(); };
  }

  function checkVictory(){
    if(!state || state.victory) return;
    const p=player();
    if(owned('P').length >= Math.ceil(state.systems.length*.6)) return setVictory('支配勝利', '全星系の60%以上を支配しました。');
    if(p.techs.some(id => TECHS.find(t => t.id===id)?.final)) return setVictory('技術勝利', '最終技術を完成しました。');
    if(state.factions.filter(f=>f.id!=='P').every(f => owned(f.id).length===0 || f.eliminated)) return setVictory('覇権勝利', 'CPU勢力の母星をすべて制圧しました。');
  }
  function setVictory(title,text){ state.victory={title,text}; showModal(`<h2>${title}</h2><p>${text}</p><p>新しい銀河シードで、別の文明方針も試してみてください。</p>`); }

  function showResourceHelp(k){
    const r=RESOURCES[k], income=totalIncome('P')[k]||0;
    showModal(`<h2>${r.label}</h2><div class="help-grid"><div><h3>何に使う？</h3><p>${r.use}</p></div><div><h3>どう増える？</h3><p>${r.gain}</p></div><div><h3>現在の収入</h3><p>毎ターン +${fmt(income)}。支配している星の種類と開発Lvで増えます。</p></div><div><h3>戦略メモ</h3><p>${r.advice}</p></div></div>`);
  }
  function showApHelp(){
    showModal(`<h2>APとは？</h2><p>APは「このターンにできる大きな行動回数」です。探索、植民、開発、研究、艦船建造、艦隊強化、侵攻で1ずつ使います。</p><ul><li>ターン終了で全回復します。</li><li>序盤は毎ターン3APです。</li><li>技術「星域司令部」を取るとAPが増えます。</li></ul><p>APをどこに使うかが、このゲームの一番大事な判断です。</p>`);
  }
  function showHelp(){
    showModal(`<h2>遊び方</h2><h3>基本</h3><p>星をタップして、状況に合う行動を選びます。自領に隣接する未探索星は探索、探索済みの中立星は植民、自領星は開発できます。</p><h3>スマホ操作</h3><ul><li>マップをドラッグ：上下左右に移動</li><li>＋／−：ズーム</li><li>資源チップ：使い道と増やし方</li><li>勢力タブ：CPUや自分の詳細</li></ul><h3>戦略</h3><p>資源を領土拡大に使うか、研究に使うか、艦隊に使うかを毎ターン選びます。CPUもターン終了後に成長します。</p>`);
  }
  function showFactionDetail(fid){
    const f=faction(fid), fs=fleetStats(f), home=system(f.home);
    const prod=totalIncome(fid);
    showModal(`<h2>${f.name}${fid==='P'?'（あなた）':''}</h2><div class="help-grid"><div><h3>母星</h3><p>${home?.name || 'なし'}</p></div><div><h3>勢力タイプ</h3><p>${DOCTRINES[f.doctrine]?.name || f.doctrine}</p></div><div><h3>保有星系</h3><p>${owned(fid).length}星系</p></div><div><h3>艦隊</h3><p>${fleetText(f)}<br>総合${fs.power} / 攻撃${fs.attack} / シールド${fs.shield}</p></div><div><h3>強化</h3><p>武器Lv.${f.upgrades.weapons} / シールドLv.${f.upgrades.shields} / 推進Lv.${f.upgrades.engines}</p></div><div><h3>毎ターン収入</h3><p>${Object.entries(prod).filter(([,v])=>v>0).map(([k,v])=>`${RESOURCES[k].label}+${v}`).join(' / ') || 'なし'}</p></div></div>`);
  }
  function showModal(html){ $('modalBody').innerHTML = html; $('infoModal').showModal(); }
  function toast(text){ showModal(`<h2>操作できません</h2><p>${text}</p>`); }

  function bind(){
    $('startBtn').onclick=startNew; $('continueBtn').onclick=continueGame;
    $('randomSeedBtn').onclick=()=>{$('seedInput').value=randomSeedText();};
    $('homeBtn').onclick=()=>centerOn(system(player().home),2.15);
    $('zoomInBtn').onclick=()=>{ camera.zoom=clamp(camera.zoom*1.18,1.2,4.4); draw(); };
    $('zoomOutBtn').onclick=()=>{ camera.zoom=clamp(camera.zoom/1.18,1.2,4.4); draw(); };
    $('helpBtn').onclick=showHelp; $('turnChip').onclick=showApHelp; $('saveBtn').onclick=()=>{save(); toast('保存しました。次回は「続きから」で再開できます。');};
    $('endTurnBtn').onclick=endTurn; $('modalClose').onclick=()=>$('infoModal').close();
    $('coachSkipBtn').onclick=()=>{ state.tutorial.active=false; state.tutorial.step=99; render(); };
    $('sheetToggle').onclick=()=>{ state.sheetCollapsed=!state.sheetCollapsed; renderPanel(); save(); };
    document.querySelectorAll('.tab').forEach(b => b.onclick=()=>{ activeTab=b.dataset.tab; state.sheetCollapsed=false; renderPanel(); });
    canvas=$('starCanvas');
    canvas.addEventListener('pointerdown', canvasPointerDown);
    canvas.addEventListener('pointermove', canvasPointerMove);
    canvas.addEventListener('pointerup', canvasPointerUp);
    canvas.addEventListener('pointercancel', () => drag.active=false);
    addEventListener('resize', resizeCanvas);
  }

  preload().then(() => { canvas=$('starCanvas'); ctx=canvas.getContext('2d'); initTitle(); bind(); resizeCanvas(); });

  window.SFDebug = {
    getState: () => state,
    start: () => { startNew(); return state; },
    select: (id) => { if(state){ state.selectedId=id; const s=system(id); if(s) advanceTutorialOnSelect(s); render(); } },
    action: handleAction,
    endTurn,
    center: (id) => centerOn(system(id), 2.15)
  };
})();
