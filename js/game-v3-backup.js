(() => {
  'use strict';

  const SAVE_KEY = 'seiiki-frontier-save-v1';
  const AS = 'assets/img/';
  const PLANET_IMAGES = ['terran','desert','ocean','volcanic','ice','industrial','gas_giant','moon','crystal','relic','anomaly','asteroid'];
  const ICONS = {
    materials:'materials', research:'research', influence:'influence', energy:'energy', food:'food', crystal:'crystal', credits:'credits',
    fleet:'fleet', attack:'attack', defense:'defense', scout:'scout', colony:'colony', diplomacy:'diplomacy', espionage:'espionage', technology:'technology', industry:'industry', population:'population', command:'command', victory:'victory'
  };

  const DOCTRINES = {
    tech: {name:'光子評議会', short:'技術', image:'tech', color:'#58c7ff', desc:'研究速度と防衛に優れる。少ない領土でも技術で伸びる文明。', bonus:{research:1.24, defense:1.15, materials:1, influence:1, credits:1, fleet:1}, counters:'軍事に強い'},
    war: {name:'赤翼艦隊', short:'軍事', image:'war', color:'#ff5c6b', desc:'艦隊建造と侵攻に優れる。早めに戦力化して圧力をかける文明。', bonus:{research:0.95, defense:1.05, materials:1.12, influence:1, credits:1, fleet:1.28}, counters:'商業に強い'},
    trade: {name:'金環商会', short:'商業', image:'trade', color:'#ffd36b', desc:'信用・交易・資源効率に優れる。柔軟に内政と拡張を切り替える文明。', bonus:{research:1, defense:0.95, materials:1.05, influence:1.18, credits:1.32, fleet:1}, counters:'生態に強い'},
    eco: {name:'翠環同盟', short:'生態', image:'eco', color:'#72f59b', desc:'人口成長と惑星開発に優れる。星を育てて後半に大きく伸びる文明。', bonus:{research:1.02, defense:1.05, materials:1.08, influence:1.05, credits:1, fleet:0.96, food:1.35}, counters:'技術に強い'},
    mystic: {name:'紫紋教団', short:'秘教', image:'mystic', color:'#b987ff', desc:'遺跡と異常宙域から力を得る。予測不能なイベントで伸びる文明。', bonus:{research:1.1, defense:1, materials:1, influence:1.12, credits:1, fleet:1.06, crystal:1.35}, counters:'特殊イベント'}
  };

  const TYPE_DEF = {
    terran:{label:'豊穣星', img:'terran', yields:{materials:6,research:3,influence:2,energy:2,food:6,crystal:0,credits:3}, defense:12},
    desert:{label:'砂漠星', img:'desert', yields:{materials:7,research:2,influence:1,energy:4,food:1,crystal:1,credits:2}, defense:9},
    ocean:{label:'海洋星', img:'ocean', yields:{materials:3,research:4,influence:2,energy:2,food:7,crystal:0,credits:3}, defense:10},
    volcanic:{label:'火山星', img:'volcanic', yields:{materials:9,research:2,influence:1,energy:5,food:0,crystal:2,credits:1}, defense:14},
    ice:{label:'氷結星', img:'ice', yields:{materials:4,research:5,influence:1,energy:3,food:1,crystal:1,credits:1}, defense:11},
    industrial:{label:'工業星', img:'industrial', yields:{materials:9,research:3,influence:1,energy:2,food:0,crystal:0,credits:5}, defense:16},
    gas_giant:{label:'巨大ガス星', img:'gas_giant', yields:{materials:3,research:4,influence:1,energy:8,food:0,crystal:1,credits:2}, defense:13},
    moon:{label:'月面基地', img:'moon', yields:{materials:5,research:2,influence:1,energy:2,food:0,crystal:2,credits:1}, defense:8},
    crystal:{label:'結晶星', img:'crystal', yields:{materials:3,research:5,influence:2,energy:2,food:0,crystal:5,credits:2}, defense:12},
    relic:{label:'古代遺跡星', img:'relic', yields:{materials:2,research:8,influence:4,energy:1,food:2,crystal:2,credits:2}, defense:15},
    anomaly:{label:'暗黒異常宙域', img:'anomaly', yields:{materials:1,research:7,influence:5,energy:6,food:0,crystal:4,credits:0}, defense:18},
    asteroid:{label:'資源小惑星', img:'asteroid', yields:{materials:10,research:1,influence:0,energy:1,food:0,crystal:3,credits:1}, defense:7}
  };

  const TECHS = {
    universal:[
      {id:'u_route', name:'安定航路', cost:35, icon:'scout', text:'探索距離+1。探索時に追加で影響力+2。', effect:{exploreBonus:2}},
      {id:'u_factory', name:'軌道工廠', cost:48, icon:'industry', text:'開発コスト-15%、艦隊建造+4。', req:['u_route'], effect:{developDiscount:.15, buildFleet:4}},
      {id:'u_command', name:'星域司令部', cost:70, icon:'command', text:'毎ターンAP+1、支配星系の防衛+2。', req:['u_factory'], effect:{ap:1, defenseFlat:2}}
    ],
    tech:[
      {id:'t_laser', name:'光子演算炉', cost:32, icon:'technology', text:'研究産出+25%。'},
      {id:'t_shield', name:'量子シールド', cost:52, icon:'defense', text:'防衛+30%、侵攻損耗を軽減。', req:['t_laser']},
      {id:'t_gate', name:'恒星門', cost:78, icon:'scout', text:'遠隔植民が可能になり、植民コスト-20%。', req:['t_shield']},
      {id:'t_core', name:'銀河中枢', cost:130, icon:'victory', text:'技術勝利を達成する最終技術。', req:['t_gate'], final:true}
    ],
    war:[
      {id:'w_dock', name:'軍港網', cost:30, icon:'fleet', text:'艦隊建造+10、建造コスト-10%。'},
      {id:'w_marine', name:'降下軍団', cost:50, icon:'attack', text:'侵攻力+30%、勝利時に防衛を吸収。', req:['w_dock']},
      {id:'w_doctrine', name:'覇権ドクトリン', cost:76, icon:'command', text:'敵母星への侵攻時、戦力+25%。', req:['w_marine']},
      {id:'w_core', name:'制圧艦隊', cost:124, icon:'victory', text:'艦隊上限を突破し、CPU母星攻略を容易にする。', req:['w_doctrine'], final:true}
    ],
    trade:[
      {id:'m_bank', name:'星間銀行', cost:30, icon:'credits', text:'信用産出+35%、資材購入効率上昇。'},
      {id:'m_route', name:'交易航路', cost:48, icon:'diplomacy', text:'隣接自領星系ごとに信用+2、影響力+1。', req:['m_bank']},
      {id:'m_charter', name:'開拓勅許', cost:72, icon:'colony', text:'植民時に信用を消費して影響力を補える。', req:['m_route']},
      {id:'m_core', name:'銀河市場', cost:120, icon:'victory', text:'経済支配による勝利に近づく最終交易基盤。', req:['m_charter'], final:true}
    ],
    eco:[
      {id:'e_bio', name:'生体ドーム', cost:28, icon:'food', text:'食料産出+40%、人口成長+1。'},
      {id:'e_garden', name:'惑星庭園', cost:48, icon:'population', text:'開発ごとに追加人口、防衛+10%。', req:['e_bio']},
      {id:'e_terraform', name:'大気改造', cost:76, icon:'colony', text:'植民コスト-25%、低環境星の産出改善。', req:['e_garden']},
      {id:'e_core', name:'生命圏ネットワーク', cost:122, icon:'victory', text:'全星域を結ぶ巨大生態圏。最終技術。', req:['e_terraform'], final:true}
    ],
    mystic:[
      {id:'x_relic', name:'遺物解読', cost:30, icon:'crystal', text:'遺跡・異常宙域の研究/結晶産出+50%。'},
      {id:'x_oracle', name:'星詠み', cost:50, icon:'espionage', text:'ターン開始時に小さな幸運イベントが発生しやすい。', req:['x_relic']},
      {id:'x_void', name:'虚空航法', cost:78, icon:'scout', text:'通常接続を無視した奇襲・遠隔植民が低確率で可能。', req:['x_oracle']},
      {id:'x_core', name:'特異点の王冠', cost:128, icon:'victory', text:'相性を超越する最終技術。', req:['x_void'], final:true}
    ]
  };

  const RESOURCE_LABELS = {materials:'資材',research:'研究',influence:'影響',energy:'電力',food:'食料',crystal:'結晶',credits:'信用'};
  const RESOURCE_ORDER = ['materials','research','influence','energy','food','crystal','credits'];
  const SYSTEM_NAMES = ['アステル','ノヴァリス','カリナ','エオス','ミラージュ','シリウス外縁','ヴェガ門','オルフェ','リュミエール','ネビュラ','アークトゥルス','イオ','カロン','ラグランジュ','ヘリオス','セレネ','アルタイル','リゲル','ゼファー','オベロン','ペルセウス','アンドロメダ','クロノス','アトラス','カシオペア','ミネルヴァ','プロキオン','オーロラ','ノクス','エクリプス','ゼニス','オリオン'];
  const CPU_NAMES = ['黒曜連合','緑星協約','赤環帝国','黄昏商圏'];
  const CPU_DOCTRINES = ['machine','eco','war','trade'];
  const FACTION_IMAGE_MAP = {tech:'tech', war:'war', trade:'trade', eco:'eco', mystic:'mystic', machine:'machine', federation:'federation', raider:'raider', hive:'hive', precursor:'precursor'};

  let state = null;
  let selectedDoctrine = 'tech';
  let selectedSystemId = null;
  let images = {};
  let rng = null;
  let camera = {x:.19, y:.54, zoom:1.95};

  const $ = (id) => document.getElementById(id);

  class RNG {
    constructor(seed){ this.seed = RNG.hash(seed || String(Date.now())); }
    static hash(str){ let h=2166136261>>>0; for(const ch of String(str)){h^=ch.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0; }
    next(){ this.seed = (Math.imul(1664525,this.seed)+1013904223)>>>0; return this.seed/4294967296; }
    int(min,max){ return Math.floor(this.next()*(max-min+1))+min; }
    pick(arr){ return arr[Math.floor(this.next()*arr.length)]; }
    chance(p){ return this.next()<p; }
  }

  function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
  function fmt(n){ return Math.floor(n).toLocaleString('ja-JP'); }
  function imgPath(kind, name){ return `${AS}${kind}/${name}.png`; }
  function doctrineOf(f){ return DOCTRINES[f.doctrine] || DOCTRINES.tech; }
  function player(){ return state.factions.find(f=>f.id==='P'); }
  function faction(id){ return state.factions.find(f=>f.id===id); }
  function ownedSystems(fid){ return state.systems.filter(s=>s.owner===fid); }
  function hasTech(fid, id){ return faction(fid)?.techs.includes(id); }
  function getAllTechs(fid='P'){ const d=faction(fid)?.doctrine || player()?.doctrine || 'tech'; return [...TECHS.universal, ...(TECHS[d] || TECHS.tech)]; }
  function techById(fid, id){ return getAllTechs(fid).find(t=>t.id===id); }

  function preload(){
    const list = [
      ['bg', `${AS}galaxy-bg.png`],
      ...PLANET_IMAGES.map(n => [`planet_${n}`, imgPath('planets',n)]),
      ...Object.values(ICONS).map(n => [`icon_${n}`, imgPath('icons',n)]),
      ...Object.values(FACTION_IMAGE_MAP).map(n => [`faction_${n}`, imgPath('factions',n)])
    ];
    return Promise.all(list.map(([k,src]) => new Promise(resolve => { const im = new Image(); im.onload=()=>{images[k]=im; resolve();}; im.onerror=resolve; im.src=src; })));
  }

  function initTitle(){
    const wrap = $('doctrineCards');
    wrap.innerHTML = '';
    Object.entries(DOCTRINES).forEach(([id,d])=>{
      const btn = document.createElement('button');
      btn.className = `doctrine-card ${id===selectedDoctrine?'is-selected':''}`;
      btn.type = 'button';
      btn.innerHTML = `<small>${d.short}</small><img src="${imgPath('factions',d.image)}" alt=""><b>${d.name}</b><span>${d.desc}</span>`;
      btn.onclick = () => { selectedDoctrine = id; initTitle(); };
      wrap.appendChild(btn);
    });
    $('continueBtn').disabled = !localStorage.getItem(SAVE_KEY);
  }

  function showScreen(which){
    $('titleScreen').classList.toggle('is-active', which==='title');
    $('gameScreen').classList.toggle('is-active', which==='game');
    if(which==='game') setTimeout(()=>{resizeCanvas(); draw();}, 30);
  }

  function startNew(){
    const seedText = $('seedInput').value.trim() || randomSeedText();
    state = createGame(seedText, selectedDoctrine);
    selectedSystemId = player().home;
    state.tutorial = {active:true, started:true};
    centerCameraOn(state.systems[selectedSystemId], 2.05);
    addLog(`銀河シード「${seedText}」で${doctrineOf(player()).name}が勃興した。`, 'good');
    showScreen('game');
    save();
    render();
    
  }

  function randomSeedText(){
    const a=['Orion','Nova','Vega','Eos','Zenith','Luna','Aster','Nox','Iris','Kronos'];
    return `${a[Math.floor(Math.random()*a.length)]}-${Math.floor(1000+Math.random()*9000)}`;
  }

  function createGame(seed, doctrine){
    rng = new RNG(seed);
    const factions = [
      {id:'P', name:'あなたの帝国', doctrine, color:DOCTRINES[doctrine].color, home:null, resources:{materials:72,research:28,influence:26,energy:30,food:34,crystal:8,credits:28}, fleet:34, techs:[], eliminated:false, ai:'player'}
    ];
    const cpuBase = [
      {id:'A', name:CPU_NAMES[0], doctrine:'tech', color:'#58c7ff', ai:'research'},
      {id:'B', name:CPU_NAMES[1], doctrine:'eco', color:'#73f199', ai:'expand'},
      {id:'C', name:CPU_NAMES[2], doctrine:'war', color:'#ff5c6b', ai:'aggressive'},
      {id:'D', name:CPU_NAMES[3], doctrine:'trade', color:'#ffd36b', ai:'merchant'}
    ];
    for(const c of cpuBase){
      factions.push({...c, home:null, resources:{materials:62+rng.int(0,18),research:24+rng.int(0,14),influence:20+rng.int(0,12),energy:25,food:26,crystal:6,credits:24+rng.int(0,16)}, fleet:26+rng.int(0,15), techs:[], eliminated:false});
    }
    const systems = generateSystems(rng, factions);
    return {version:1, seed, turn:1, ap:3, maxAp:3, phase:'player', selectedDoctrine:doctrine, factions, systems, log:[], victory:null, settings:{sound:false}};
  }

  function generateSystems(r, factions){
    const systems=[];
    const anchors = [{x:.19,y:.54},{x:.82,y:.18},{x:.18,y:.18},{x:.82,y:.78},{x:.50,y:.82}];
    const count=30;
    for(let i=0;i<count;i++){
      let x,y,tries=0;
      if(i<anchors.length){ x=anchors[i].x + (r.next()-.5)*.05; y=anchors[i].y + (r.next()-.5)*.05; }
      else{
        do{ x=.08+r.next()*.84; y=.10+r.next()*.78; tries++; } while(tries<200 && systems.some(s => Math.hypot(s.x-x,s.y-y)<.105));
      }
      const types = Object.keys(TYPE_DEF);
      const type = i<5 ? ['terran','industrial','ocean','volcanic','relic'][i] : r.pick(types);
      const rich = r.int(80,130)/100;
      systems.push({
        id:i, name:SYSTEM_NAMES[i%SYSTEM_NAMES.length] + (i>=SYSTEM_NAMES.length ? `-${i}`:''), x,y,type, richness:rich,
        owner:null, development:i<5?1:0, population:i<5?2:0, defense:Math.round(TYPE_DEF[type].defense*rich), explored:false, visible:false, homeOf:null, connections:[]
      });
    }
    // Connect nearest nodes with at least 2 links, then some extras.
    for(const s of systems){
      const nearest = systems.filter(o=>o!==s).map(o=>({id:o.id,d:Math.hypot(o.x-s.x,o.y-s.y)})).sort((a,b)=>a.d-b.d).slice(0,3);
      nearest.slice(0,2).forEach(n => connect(systems, s.id, n.id));
      if(r.chance(.45)) connect(systems, s.id, nearest[2].id);
    }
    // Assign homes
    factions.forEach((f,idx)=>{
      const s=systems[idx]; s.owner=f.id; s.explored=true; s.visible=true; s.homeOf=f.id; s.development=2; s.population=3; s.defense += 12; f.home=s.id;
    });
    revealAround(systems, 0, true);
    systems[0].explored = true; systems[0].visible = true;
    return systems;
  }

  function connect(systems,a,b){
    if(!systems[a].connections.includes(b)) systems[a].connections.push(b);
    if(!systems[b].connections.includes(a)) systems[b].connections.push(a);
  }

  function revealAround(systems, id, full=false){
    const s=systems[id]; if(!s) return;
    s.visible=true; if(full) s.explored=true;
    s.connections.forEach(n=>{ systems[n].visible=true; });
  }

  function selected(){ return state?.systems.find(s=>s.id===selectedSystemId); }

  function render(){
    if(!state) return;
    $('turnValue').textContent = state.turn;
    $('subtitleLine').textContent = `${doctrineOf(player()).name} / ${state.seed}`;
    $('apBadge').textContent = `AP ${state.ap}/${state.maxAp}`;
    renderResources(); renderEmpire(); renderTechs(); renderSystem(); renderFactions(); renderLog(); renderAdvisor(); draw();
    $('endTurnBtn').disabled = !!state.victory;
  }

  function renderResources(){
    const p=player();
    $('resourceBar').innerHTML = RESOURCE_ORDER.map(k=>`<div class="res-pill"><img src="${imgPath('icons',ICONS[k])}" alt=""><div><b>${fmt(p.resources[k]||0)}</b><span>${RESOURCE_LABELS[k]}</span></div></div>`).join('');
  }

  function renderEmpire(){
    const p=player(), d=doctrineOf(p); const owned=ownedSystems('P');
    const traits = getTraits(p);
    $('empireSummary').innerHTML = `
      <div class="summary-card"><img src="${imgPath('factions',d.image)}" alt=""><div><b>${d.name}</b><span>${d.desc}</span></div></div>
      <div class="summary-card"><img src="${imgPath('icons','fleet')}" alt=""><div><b>艦隊戦力 ${fmt(p.fleet)}</b><span>保有星系 ${owned.length}/${state.systems.length} / 技術 ${p.techs.length}</span></div></div>
      <div class="summary-card"><img src="${imgPath('icons','command')}" alt=""><div><b>ランダム特性</b><span>${traits.join(' / ')}</span></div></div>
    `;
  }

  function getTraits(f){
    // deterministic traits from seed + faction id, stored implicitly for compact save
    const rr = new RNG(`${state.seed}:${f.id}:traits`);
    const pool = ['鉱物+','研究+','影響+','艦隊+','防衛+','交易+','遺跡感応','低重力適応','開拓民精神','精密工学'];
    return [rr.pick(pool), rr.pick(pool.filter(x=>x!==pool[0]))].slice(0,2);
  }

  function renderTechs(){
    const p=player(); const list=getAllTechs('P');
    $('techList').innerHTML = list.map(t=>{
      const done=p.techs.includes(t.id); const locked=(t.req||[]).some(id=>!p.techs.includes(id)); const enough=p.resources.research>=t.cost;
      return `<div class="tech-card ${done?'is-done':''} ${locked?'is-locked':''}">
        <b><img src="${imgPath('icons',ICONS[t.icon]||t.icon)}" alt="" style="width:22px;height:22px;vertical-align:middle;margin-right:6px">${t.name}</b>
        <p>${t.text}</p>
        <div class="tech-meta"><span>研究 ${t.cost}</span>${t.req?`<span>前提 ${t.req.map(id=>techById('P',id)?.name || id).join('・')}</span>`:''}${t.final?'<span>最終技術</span>':''}</div>
        <button data-tech="${t.id}" ${done||locked||!enough||state.ap<1?'disabled':''}>研究する</button>
      </div>`;
    }).join('');
    document.querySelectorAll('[data-tech]').forEach(btn=>btn.onclick=()=>researchTech(btn.dataset.tech));
  }

  function renderSystem(){
    const s=selected(); const box=$('systemDetails'), actions=$('actionButtons');
    if(!s){ box.className='system-details empty'; box.textContent='星をクリックして詳細を表示'; actions.innerHTML=''; $('selectedBadge').textContent='未選択'; return; }
    const def=TYPE_DEF[s.type], owner=s.owner?faction(s.owner):null;
    $('selectedBadge').textContent = s.visible ? (owner?owner.name:'中立/未領有') : '未発見';
    if(!s.visible){ box.className='system-details empty'; box.textContent='未知の宙域。隣接星系から探索してください。'; actions.innerHTML=''; return; }
    box.className='system-details';
    box.innerHTML = `<div class="sys-head"><img src="${imgPath('planets',def.img)}" alt=""><div><b>${s.name}</b><span>${def.label} / ${owner?owner.name:'未領有'} ${s.homeOf?' / 母星':''}</span></div></div>
      <div class="stat-grid">
        <div class="stat"><span>開発</span><b>Lv ${s.development}</b></div><div class="stat"><span>人口</span><b>${s.population}</b></div>
        <div class="stat"><span>防衛</span><b>${Math.round(systemDefense(s))}</b></div><div class="stat"><span>豊度</span><b>${Math.round(s.richness*100)}%</b></div>
        <div class="stat"><span>産出</span><b>${yieldText(s)}</b></div><div class="stat"><span>接続</span><b>${s.connections.length}星系</b></div>
      </div>${systemNote(s)}`;
    renderActions(s);
  }

  function yieldText(s){
    const y=systemYield(s, s.owner||'P');
    return `資${Math.floor(y.materials)} 研${Math.floor(y.research)} 影${Math.floor(y.influence)}`;
  }

  function systemNote(s){
    if(!s || !s.visible) return '';
    if(s.id===player().home && s.owner==='P') return '<div class="sys-note">ここがあなたの母星です。まずはこの星から隣の星を探索し、発見した中立星を植民して資源の入口を増やしましょう。</div>';
    if(s.owner==='P') return '<div class="sys-note">あなたの領土です。開発すると毎ターンの資源産出が増えます。</div>';
    if(!s.owner && s.explored) return '<div class="sys-note">未領有の星系です。資材と影響力があれば植民できます。</div>';
    if(s.owner && s.owner!=='P') return '<div class="sys-note">CPU勢力の星系です。艦隊を整え、隣接自領から侵攻できます。</div>';
    return '';
  }

  function renderActions(s){
    const actions=[];
    if(!s){ $('actionButtons').innerHTML=''; return; }
    const add=(label, icon, cost, enabled, desc)=>actions.push(actionBtn(label, icon, cost, enabled, desc));
    if(s.visible && !s.explored && isAdjacentToOwn(s)){
      add('探索', 'scout', canPay('P',{influence:2})?'AP1 / 影響2':'影響力が足りません', canExplore(s), '未知の星系を調査し、種類・資源・植民可否を明らかにします。');
    }
    if(s.visible && s.owner==='P' && exploreTargetFor(s)){
      add('探索', 'scout', canPay('P',{influence:2})?'AP1 / 影響2':'影響力が足りません', canExplore(s), 'この星の隣にある未探索星系へ偵察艦を送ります。');
    }
    if(s.visible && !s.owner && s.explored && isAdjacentToOwn(s)){
      add('植民', 'colony', canPay('P',{materials:16,influence:8})?'AP1 / 資材16 影響8':'資材または影響力不足', canColonize(s), '自領に隣接する未領有星を支配下に置き、毎ターンの資源収入を増やします。');
    }
    if(s.visible && s.owner==='P'){
      add('開発', 'industry', canPay('P',{materials:developCost(s)})?`AP1 / 資材${developCost(s)}`:`資材${developCost(s)}が必要`, canDevelop(s), '選択した自領星の開発Lvを上げ、資源産出・人口・防衛を伸ばします。');
      add('艦隊建造', 'fleet', canPay('P',{materials:buildCost()})?`AP1 / 資材${buildCost()}`:`資材${buildCost()}が必要`, canBuildFleetAt(s), '資材を使って艦隊戦力を増やします。侵攻・防衛の準備です。');
      add('研究', 'technology', player().resources.research>=firstResearchCost()?'AP1 / 研究ポイント':'研究ポイント不足', canOpenResearchAt(s), '研究ポイントを使い、技術ツリーから新しい能力を解放します。');
    }
    if(s.visible && s.owner && s.owner!=='P' && s.explored && isAdjacentToOwn(s)){
      add('侵攻', 'attack', player().fleet>10?'AP1 / 艦隊消耗':'艦隊戦力不足', canInvade(s), '隣接するCPU領へ艦隊を送り、勝てば星系を奪取します。');
    }
    if(!actions.length){
      $('actionButtons').innerHTML = '<div class="no-actions">この星系で実行できる行動はまだありません。自領または自領に隣接する星を選ぶと、状況に合った操作だけ表示されます。</div>';
      return;
    }
    $('actionButtons').innerHTML = actions.join('');
    document.querySelectorAll('[data-act]').forEach(btn=>{
      const act=btn.dataset.act;
      btn.onclick = ({explore:()=>explore(s),colonize:()=>colonize(s),develop:()=>develop(s),build:()=>buildFleet('P'),tech:openTechModal,invade:()=>invade(s)}[act]);
    });
  }

  function actionBtn(label, icon, cost, enabled, desc){
    const key = {探索:'explore',植民:'colonize',開発:'develop',艦隊建造:'build',研究:'tech',侵攻:'invade'}[label];
    return `<button data-act="${key}" ${enabled?'':'disabled'}><img src="${imgPath('icons',icon)}" alt="" style="width:22px;height:22px;vertical-align:middle;margin-right:6px">${label}<small>${cost}</small><em>${desc}</em></button>`;
  }

  function isAdjacentToOwn(s){ return !!s && s.connections.some(id=>state.systems[id].owner==='P'); }
  function exploreTargetFor(s){
    if(!s || !s.visible) return null;
    if(!s.explored && isAdjacentToOwn(s)) return s;
    if(s.owner==='P') return s.connections.map(id=>state.systems[id]).find(n=>n.visible && !n.explored) || null;
    return null;
  }
  function firstResearchCost(){ const t=getAllTechs('P').find(t=>!player().techs.includes(t.id) && !(t.req||[]).some(id=>!player().techs.includes(id))); return t?.cost || 999; }
  function canExplore(s){ return state.ap>0 && canPay('P',{influence:2}) && !!exploreTargetFor(s) && tutorialAllows('explore', s); }
  function canColonize(s){ return state.ap>0 && s.visible && !s.owner && s.explored && isAdjacentToOwn(s) && canPay('P',{materials:16,influence:8}) && tutorialAllows('colonize', s); }
  function canDevelop(s){ return state.ap>0 && s.owner==='P' && s.development<6 && canPay('P',{materials:developCost(s)}) && tutorialAllows('develop', s); }
  function canBuildFleet(){ return state.ap>0 && canPay('P',{materials:buildCost()}) && tutorialAllows('build', state.systems[player().home]); }
  function canBuildFleetAt(s){ return s?.owner==='P' && canBuildFleet(); }
  function canOpenResearchAt(s){ return s?.owner==='P' && state.ap>0 && getAffordableTech() && tutorialAllows('tech', s); }
  function canInvade(s){ return state.ap>0 && s.visible && s.owner && s.owner!=='P' && s.explored && isAdjacentToOwn(s) && player().fleet>10 && tutorialAllows('invade', s); }
  function developCost(s){ let cost=20+s.development*8; if(hasTech('P','u_factory')) cost*=.85; return Math.ceil(cost); }
  function buildCost(){ return hasTech('P','w_dock') ? 14 : 16; }

  function canPay(fid, cost){ const r=faction(fid).resources; return Object.entries(cost).every(([k,v])=>(r[k]||0)>=v); }
  function pay(fid, cost){ const r=faction(fid).resources; for(const [k,v] of Object.entries(cost)) r[k]=(r[k]||0)-v; }
  function consumeAp(n=1){ state.ap = Math.max(0,state.ap-n); }

  function explore(s){
    const target = exploreTargetFor(s);
    if(!target || !canExplore(s)) return;
    pay('P',{influence:2}); consumeAp();
    target.explored=true; target.visible=true; revealAround(state.systems,target.id,false);
    if(state.tutorial?.active && !state.tutorial.firstExploredId) state.tutorial.firstExploredId = target.id;
    addLog(`${nearestOwnedName(target)}から${target.name}を探索。${TYPE_DEF[target.type].label}を発見した。`, 'good');
    if(hasTech('P','u_route')) player().resources.influence += 2;
    selectedSystemId = target.id;
    centerCameraOn(target, 2.05);
    postAction();
  }
  function nearestOwnedName(s){ const o=s.connections.map(id=>state.systems[id]).find(n=>n.owner==='P'); return o?.name || '自領星系'; }
  function colonize(s){
    if(!canColonize(s)) return;
    const cost={materials:16,influence:8}; if(hasTech('P','t_gate')||hasTech('P','e_terraform')){ cost.influence=Math.ceil(cost.influence*.8); }
    pay('P',cost); consumeAp(); s.owner='P'; s.development=1; s.population=1; s.defense += 5; revealAround(state.systems,s.id,true);
    if(state.tutorial?.active && !state.tutorial.firstColonyId) state.tutorial.firstColonyId = s.id;
    centerCameraOn(s, 2.05);
    addLog(`${s.name}に植民船団が到着。新たな領土となった。`, 'good'); postAction();
  }
  function develop(s){
    if(!canDevelop(s)) return;
    pay('P',{materials:developCost(s)}); consumeAp(); s.development++; s.population += hasTech('P','e_garden')?2:1; s.defense += hasTech('P','u_command')?4:2;
    addLog(`${s.name}を開発。開発Lv ${s.development}になった。`, 'good'); postAction();
  }
  function buildFleet(fid){
    if(fid==='P' && !canBuildFleet()) return;
    const f=faction(fid); const cost={materials: fid==='P'?buildCost():14}; if(!canPay(fid,cost)) return;
    pay(fid,cost); if(fid==='P') consumeAp();
    let gain = 12 + (hasTech(fid,'u_factory')?4:0) + (hasTech(fid,'w_dock')?10:0);
    gain *= doctrineOf(f).bonus.fleet || 1;
    f.fleet += Math.round(gain);
    if(fid==='P') { addLog(`造船所が稼働。艦隊戦力 +${Math.round(gain)}。`, 'good'); postAction(); }
  }
  function researchTech(id){
    const t=techById('P',id), p=player(); if(!t || p.techs.includes(id)) return;
    if((t.req||[]).some(req=>!p.techs.includes(req)) || p.resources.research<t.cost || state.ap<1 || !tutorialAllowsTech(id)) return;
    p.resources.research -= t.cost; p.techs.push(id); consumeAp(); applyTech('P', t);
    if(state.tutorial?.active) state.tutorial.researched = true;
    addLog(`研究完了：${t.name}。${t.text}`, t.final?'warn':'good');
    postAction();
  }
  function applyTech(fid,t){
    if(t.id==='u_command'){ const f=faction(fid); state.maxAp = fid==='P' ? 4 : state.maxAp; ownedSystems(fid).forEach(s=>s.defense+=2); }
  }

  function invade(s){
    if(!canInvade(s)) return;
    consumeAp();
    const p=player(), defender=faction(s.owner);
    let attack = p.fleet * (.52 + Math.random()*.16);
    if(p.doctrine==='war') attack *= 1.16;
    if(hasTech('P','w_marine')) attack *= 1.28;
    if(s.homeOf && hasTech('P','w_doctrine')) attack *= 1.25;
    if(defender && counterBonus(p.doctrine, defender.doctrine)) attack *= 1.16;
    const defense = systemDefense(s) + (defender?.fleet||0)*.18;
    const loss = Math.ceil(Math.min(p.fleet*.28, Math.max(8, defense*.18)));
    p.fleet = Math.max(0, p.fleet-loss);
    if(attack>defense){
      const old=s.owner; s.owner='P'; s.defense=Math.max(8, Math.round(s.defense*.55)); s.population=Math.max(1, Math.floor(s.population*.85));
      if(defender){ defender.fleet=Math.max(0,defender.fleet-Math.ceil(attack*.18)); }
      addLog(`${s.name}を制圧。艦隊損耗 ${loss}。`, 'good');
      checkElimination(old);
    } else {
      s.defense=Math.max(4,Math.round(s.defense*.82));
      addLog(`${s.name}への侵攻は失敗。艦隊損耗 ${loss}。`, 'danger');
    }
    postAction();
  }

  function counterBonus(att, def){
    return (att==='tech'&&def==='war') || (att==='war'&&def==='trade') || (att==='trade'&&def==='eco') || (att==='eco'&&def==='tech') || att==='mystic';
  }

  function systemDefense(s){
    const f=s.owner?faction(s.owner):null; let val=s.defense + s.development*3 + s.population*2;
    if(f){ val *= doctrineOf(f).bonus.defense || 1; if(hasTech(f.id,'t_shield')) val*=1.3; if(hasTech(f.id,'e_garden')) val*=1.1; if(hasTech(f.id,'u_command')) val+=2; }
    return val;
  }

  function systemYield(s, fid){
    const base=TYPE_DEF[s.type].yields, f=faction(fid) || player(); const bonus=doctrineOf(f).bonus; const mult=s.richness*(1+s.development*.28+s.population*.08);
    const out={};
    for(const k of RESOURCE_ORDER){ out[k]=(base[k]||0)*mult; }
    if(hasTech(fid,'t_laser')) out.research*=1.25;
    if(hasTech(fid,'m_bank')) out.credits*=1.35;
    if(hasTech(fid,'e_bio')) out.food*=1.4;
    if(hasTech(fid,'x_relic') && (s.type==='relic'||s.type==='anomaly')){ out.research*=1.5; out.crystal*=1.5; }
    out.materials*=bonus.materials||1; out.research*=bonus.research||1; out.influence*=bonus.influence||1; out.credits*=bonus.credits||1; out.food*=bonus.food||1; out.crystal*=bonus.crystal||1;
    if(hasTech(fid,'m_route')){
      const ownedNeighbor=s.connections.filter(id=>state.systems[id].owner===fid).length; out.credits+=ownedNeighbor*2; out.influence+=ownedNeighbor;
    }
    return out;
  }

  function postAction(){
    updateTutorialProgress();
    checkVictory(); save(); render();
  }

  function nextTurn(){
    if(state.victory) return;
    if(!tutorialAllows('endturn', selected())) return;
    state.turn++;
    state.lastCpuEvents=[];
    state.replayFocusId=null;
    collectResources();
    mysticEvent();
    cpuTurn();
    state.maxAp = hasTech('P','u_command')?4:3;
    state.ap = state.maxAp;
    updateTutorialProgress();
    checkVictory();
    save(); render();
    playCpuReplay(state.lastCpuEvents || []);
  }

  function collectResources(){
    for(const f of state.factions.filter(f=>!f.eliminated)){
      const total={materials:0,research:0,influence:0,energy:0,food:0,crystal:0,credits:0};
      for(const s of ownedSystems(f.id)){
        const y=systemYield(s, f.id); for(const k of RESOURCE_ORDER) total[k]+=y[k]||0;
        if(f.doctrine==='eco' && (f.resources.food||0)>20 && state.turn%2===0) s.population=Math.min(10,s.population+1);
      }
      for(const k of RESOURCE_ORDER){ f.resources[k]=(f.resources[k]||0)+Math.round(total[k]); }
    }
    addLog(`ターン${state.turn}開始。各星系から資源を回収。`, '');
  }

  function mysticEvent(){
    const p=player(); if(p.doctrine!=='mystic' && !hasTech('P','x_oracle')) return;
    if(Math.random()< (hasTech('P','x_oracle')?.35:.18)){
      const k=['research','crystal','influence'][Math.floor(Math.random()*3)]; const gain=8+Math.floor(Math.random()*12); p.resources[k]+=gain; addLog(`星詠みの予兆：${RESOURCE_LABELS[k]} +${gain}。`, 'warn');
    }
  }

  function cpuTurn(){
    const events=[];
    state.lastCpuEvents = events;
    for(const f of state.factions.filter(f=>f.id!=='P'&&!f.eliminated)){
      const researched = cpuResearch(f);
      if(researched) events.push(cpuEvent('research', f, state.systems[f.home], `${f.name}が「${researched.name}」を研究。`));
      const owned=ownedSystems(f.id); if(!owned.length){ f.eliminated=true; continue; }
      const frontier=[]; for(const s of owned){ for(const id of s.connections){ const n=state.systems[id]; if(!n.owner) frontier.push(n); } }
      if(frontier.length && f.resources.materials>12 && f.resources.influence>6 && Math.random()< (f.ai==='expand'?.8:.55)){
        const target=frontier.sort((a,b)=>scoreSystem(b,f.id)-scoreSystem(a,f.id))[0];
        f.resources.materials-=12; f.resources.influence-=6; target.owner=f.id; target.explored=true; target.visible=true; target.development=Math.max(1,target.development); target.population=Math.max(1,target.population); target.defense+=4;
        const ev=cpuEvent('expand', f, target, `${f.name}が${target.name}へ進出。`); events.push(ev); addLog(ev.text, 'warn');
      }
      const enemies=[]; for(const s of owned){ for(const id of s.connections){ const n=state.systems[id]; if(n.owner && n.owner!==f.id) enemies.push(n); } }
      if(enemies.length && f.fleet>36 && Math.random()< (f.ai==='aggressive'?.72:.32)){
        const target=enemies.sort((a,b)=>systemDefense(a)-systemDefense(b))[0]; const ev=cpuInvade(f,target); if(ev) events.push(ev);
      }
      if(f.resources.materials>35 && Math.random()<.55){
        const before=f.fleet; buildFleet(f.id); if(f.fleet>before) events.push(cpuEvent('fleet', f, state.systems[f.home], `${f.name}が艦隊を増強。戦力 +${f.fleet-before}。`));
      }
      const devTarget=owned.sort((a,b)=>scoreSystem(b,f.id)-scoreSystem(a,f.id))[0];
      const dc=18+devTarget.development*7;
      if(devTarget && devTarget.development<6 && f.resources.materials>dc && Math.random()<.5){
        f.resources.materials-=dc; devTarget.development++; devTarget.population++; devTarget.defense+=2;
        events.push(cpuEvent('develop', f, devTarget, `${f.name}が${devTarget.name}を開発。`));
      }
    }
    if(!events.length) events.push({type:'quiet', factionId:null, systemId:player().home, text:'CPU勢力は大きな行動を見せなかった。', color:'#9eb9d4'});
  }

  function cpuEvent(type, f, system, text){
    if(system) system.visible = true;
    return {type, factionId:f.id, systemId:system?.id ?? f.home, text, color:f.color, name:f.name};
  }

  function cpuResearch(f){
    const options=getAllTechs(f.id).filter(t=>!f.techs.includes(t.id) && !(t.req||[]).some(id=>!f.techs.includes(id)) && f.resources.research>=t.cost);
    if(options.length){ const t=options[0]; f.resources.research-=t.cost; f.techs.push(t.id); if(t.id==='u_command') ownedSystems(f.id).forEach(s=>s.defense+=2); if(t.final && f.id!=='P') addLog(`${f.name}が最終技術 ${t.name} に到達。急がなければ銀河の主導権を失う。`, 'danger'); return t; }
    return null;
  }

  function cpuInvade(f,s){
    const def=faction(s.owner); let attack=f.fleet*(.42+Math.random()*.18); if(f.doctrine==='war') attack*=1.15; if(counterBonus(f.doctrine, def?.doctrine)) attack*=1.12;
    const defense=systemDefense(s)+(def?.fleet||0)*.14; const loss=Math.ceil(Math.min(f.fleet*.25,Math.max(6,defense*.15))); f.fleet=Math.max(0,f.fleet-loss);
    if(attack>defense){ const old=s.owner; s.owner=f.id; s.visible=true; s.defense=Math.max(6,Math.round(s.defense*.55)); const text = old==='P' ? `${f.name}があなたの${s.name}を奪取。` : `${f.name}が${s.name}を制圧。`; addLog(text, old==='P'?'danger':'warn'); checkElimination(old); return cpuEvent('invade', f, s, text); }
    const text = `${f.name}が${s.name}を攻撃したが失敗。`;
    if(s.visible) addLog(text, 'warn');
    return cpuEvent('invade_fail', f, s, text);
  }

  function playCpuReplay(events){
    const box=$('cpuReplay');
    if(!box || !events.length || !state) return;
    let i=0;
    const show=()=>{
      if(!state || i>=events.length){ state.replayFocusId=null; box.classList.remove('is-active'); draw(); return; }
      const ev=events[i++]; const sys=state.systems[ev.systemId] || state.systems[player().home];
      state.replayFocusId=sys.id; selectedSystemId=sys.id; centerCameraOn(sys, 1.9); draw(); renderSystem(); renderFactions();
      const f=ev.factionId ? faction(ev.factionId) : null;
      const img=f ? (FACTION_IMAGE_MAP[f.doctrine] || DOCTRINES[f.doctrine]?.image || 'federation') : 'command';
      box.innerHTML = `<div class="cpu-replay-head"><span>CPUターン ${i}/${events.length}</span><button type="button" id="skipReplayBtn">閉じる</button></div><div class="cpu-replay-body">${f?`<img src="${imgPath('factions',img)}" alt="">`:''}<div><b>${sys.name}</b><p>${ev.text}</p></div></div>`;
      box.classList.add('is-active');
      const skip=$('skipReplayBtn'); if(skip) skip.onclick=()=>{ i=events.length; box.classList.remove('is-active'); state.replayFocusId=null; draw(); };
      setTimeout(show, 1100);
    };
    show();
  }

  function scoreSystem(s,fid){ const y=systemYield(s,fid); return y.materials*1.2+y.research*1.4+y.influence*1.1+y.crystal*1.8+y.credits*.7+systemDefense(s)*.15; }

  function checkElimination(fid){
    if(!fid) return; const f=faction(fid); if(!f) return;
    if(!ownedSystems(fid).length || state.systems[f.home]?.owner!==fid){ f.eliminated=true; if(fid==='P'){ state.victory={type:'defeat', text:'母星を失い、帝国は崩壊した。'}; } else addLog(`${f.name}の母星が陥落し、勢力は崩壊した。`, 'danger'); }
  }

  function checkVictory(){
    if(state.victory) return;
    const p=player(); const owned=ownedSystems('P').length;
    if(owned >= Math.ceil(state.systems.length*.60)) state.victory={type:'domination', text:'支配勝利：銀河の60%以上を掌握した。'};
    const finalTech=p.techs.some(id=>techById('P',id)?.final);
    if(finalTech) state.victory={type:'technology', text:'技術勝利：最終技術に到達し、星域の未来を掌握した。'};
    const cpuAlive=state.factions.filter(f=>f.id!=='P'&&!f.eliminated&&ownedSystems(f.id).length>0).length;
    if(cpuAlive===0) state.victory={type:'hegemony', text:'覇権勝利：すべてのCPU勢力を制圧した。'};
    if(state.turn>100 && !state.victory) state.victory={type:'timeout', text:'100ターンが経過。銀河は分裂状態のまま歴史を終えた。'};
    if(state.victory){ addLog(state.victory.text, state.victory.type==='defeat'?'danger':'good'); openResultModal(); }
  }

  function renderFactions(){
    $('factionList').innerHTML = state.factions.map(f=>{
      const img=FACTION_IMAGE_MAP[f.doctrine] || DOCTRINES[f.doctrine]?.image || 'federation'; const owned=ownedSystems(f.id).length;
      return `<div class="faction-row ${f.id==='P'?'is-player':''}" style="border-color:${f.color}55"><img src="${imgPath('factions',img)}" alt=""><div><b>${f.name}${f.id==='P'?'<span class="you-chip">あなた</span>':''}</b><span>${(DOCTRINES[f.doctrine]?.short)||f.doctrine} / 星系 ${owned} / 艦隊 ${fmt(f.fleet)}${f.eliminated?' / 壊滅':''}</span></div><strong>${Math.round(owned/state.systems.length*100)}%</strong></div>`;
    }).join('');
  }

  function addLog(text, type=''){
    if(!state) return; state.log.unshift({turn:state.turn, text, type, time:Date.now()}); state.log=state.log.slice(0,80);
  }
  function renderLog(){ $('eventLog').innerHTML = (state.log||[]).slice(0,18).map(e=>`<p class="event ${e.type||''}"><b>T${e.turn}</b> ${e.text}</p>`).join(''); }

  function save(){ if(state) localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  function load(){ const raw=localStorage.getItem(SAVE_KEY); if(!raw) return false; try{ state=JSON.parse(raw); selectedSystemId=state.systems.find(s=>s.owner==='P')?.id ?? 0; centerCameraOn(state.systems[selectedSystemId] || state.systems[player()?.home] || state.systems[0], 2.05); showScreen('game'); render(); return true; }catch(e){ console.warn(e); return false; } }

  function resizeCanvas(){ const c=$('starCanvas'); const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)); c.width=Math.floor(innerWidth*dpr); c.height=Math.floor(innerHeight*dpr); c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; const ctx=c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }

  function draw(){
    const c=$('starCanvas'); if(!c || !state) return; const ctx=c.getContext('2d'); const w=innerWidth,h=innerHeight;
    ctx.clearRect(0,0,w,h);
    if(images.bg) ctx.drawImage(images.bg,0,0,w,h); else { ctx.fillStyle='#030711'; ctx.fillRect(0,0,w,h); }
    ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(0,0,w,h);
    const mapRect = getMapRect(w,h);
    // connections
    ctx.save(); ctx.lineWidth=1.4;
    for(const s of state.systems){
      for(const id of s.connections){ if(id<s.id) continue; const n=state.systems[id]; if(!s.visible && !n.visible) continue;
        const a=toScreen(s,mapRect), b=toScreen(n,mapRect); const visible=s.visible&&n.visible;
        ctx.strokeStyle = visible ? 'rgba(143,210,255,.28)' : 'rgba(143,210,255,.08)';
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
    ctx.restore();
    // territory halos
    for(const f of state.factions){ const owned=ownedSystems(f.id).filter(s=>s.visible); if(!owned.length) continue; ctx.save(); ctx.fillStyle=f.color+'13'; ctx.strokeStyle=f.color+'55'; ctx.lineWidth=1.5; owned.forEach(s=>{ const p=toScreen(s,mapRect); ctx.beginPath(); ctx.arc(p.x,p.y,42+s.development*3,0,Math.PI*2); ctx.fill(); ctx.stroke(); }); ctx.restore(); }
    // systems
    for(const s of state.systems){
      if(!s.visible) continue; const p=toScreen(s,mapRect); if(!isNearMap(p,mapRect)) continue; const def=TYPE_DEF[s.type]; const owned=s.owner?faction(s.owner):null; const selected=s.id===selectedSystemId;
      ctx.save();
      ctx.shadowBlur=selected?26:16; ctx.shadowColor=owned?.color || '#8fd2ff';
      ctx.strokeStyle=selected?'#ffffff':(owned?.color || 'rgba(200,220,255,.55)'); ctx.lineWidth=selected?3:2;
      ctx.beginPath(); ctx.arc(p.x,p.y, selected?28:22,0,Math.PI*2); ctx.stroke();
      const im=images['planet_'+def.img];
      if(im && s.explored) ctx.drawImage(im,p.x-22,p.y-22,44,44); else { ctx.fillStyle='rgba(120,150,180,.72)'; ctx.beginPath(); ctx.arc(p.x,p.y,16,0,Math.PI*2); ctx.fill(); }
      if(s.homeOf){ ctx.fillStyle=owned?.color||'#fff'; ctx.beginPath(); ctx.arc(p.x+19,p.y-18,5,0,Math.PI*2); ctx.fill(); }
      if(tutorialStep()?.systemId===s.id){ ctx.strokeStyle='#ffd37a'; ctx.lineWidth=4; ctx.setLineDash([10,6]); ctx.beginPath(); ctx.arc(p.x,p.y,46,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); }
      if(state.replayFocusId===s.id){ ctx.strokeStyle='#ff9f43'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(p.x,p.y,50,0,Math.PI*2); ctx.stroke(); }
      if(s.id===player().home){ ctx.strokeStyle='#ffffff'; ctx.lineWidth=3; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.arc(p.x,p.y,38,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle='#ffffff'; ctx.font='bold 11px system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText('あなたの母星',p.x,p.y-52); }
      if(!s.explored){ ctx.fillStyle='rgba(3,8,20,.72)'; ctx.beginPath(); ctx.arc(p.x,p.y,24,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#d7e9ff'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',p.x,p.y+1); }
      ctx.shadowBlur=0; ctx.fillStyle='#eaf4ff'; ctx.font='600 11px system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(s.explored?s.name:'未探索', p.x, p.y+30);
      ctx.restore();
    }
  }
  function getMapRect(w,h){ return {x: w>1100?360:40, y:w>1100?110:230, w: Math.max(320, w-(w>1100?720:80)), h: Math.max(420, h-(w>1100?260:280))}; }
  function centerCameraOn(s, zoom){ if(!s) return; camera.x=s.x; camera.y=s.y; if(zoom) camera.zoom=zoom; }
  function showOverview(){ camera.x=.5; camera.y=.5; camera.zoom=1.0; draw(); }
  function toScreen(s,r){ const z=camera.zoom||1; return {x:r.x+r.w/2+(s.x-camera.x)*r.w*z, y:r.y+r.h/2+(s.y-camera.y)*r.h*z}; }
  function isNearMap(p,r,pad=70){ return p.x>r.x-pad && p.x<r.x+r.w+pad && p.y>r.y-pad && p.y<r.y+r.h+pad; }
  function pickSystemByPoint(x,y){ const rect=getMapRect(innerWidth,innerHeight); let best=null,bd=999; for(const s of state.systems){ if(!s.visible) continue; const p=toScreen(s,rect); const d=Math.hypot(p.x-x,p.y-y); if(d<34 && d<bd){best=s; bd=d;} } return best; }



  function getAffordableTech(){ return getAllTechs('P').find(t=>!player().techs.includes(t.id) && !(t.req||[]).some(id=>!player().techs.includes(id)) && player().resources.research>=t.cost); }
  function tutorialActive(){ return !!state?.tutorial?.active && state.turn<=2 && !state.victory; }
  function firstVisibleUnexploredAdjacent(){
    for(const own of ownedSystems('P')){
      const t=own.connections.map(id=>state.systems[id]).find(n=>n.visible && !n.explored);
      if(t) return t;
    }
    return null;
  }
  function firstColonizable(){ return state.systems.find(s=>!s.owner && s.explored && s.visible && isAdjacentToOwn(s)); }
  function tutorialStep(){
    if(!tutorialActive()) return null;
    const home=state.systems[player().home];
    if(state.turn===1){
      const remembered = state.tutorial?.firstExploredId ? state.systems[state.tutorial.firstExploredId] : null;
      if(!remembered){
        const exploreT=firstVisibleUnexploredAdjacent();
        if(exploreT) return {action:'explore', systemId:exploreT.id, title:'1手目：未知の星を探索', text:'母星の隣にある「？」の星を選び、探索で資源タイプを確認しましょう。探索できる場所だけが黄色く光ります。', button:`${exploreT.name}を選ぶ`};
      }
      if(remembered && !remembered.owner) return {action:'colonize', systemId:remembered.id, title:'2手目：発見した星を植民', text:'探索で分かった星を自分の領土にします。星が増えると毎ターンの資源収入が増えます。', button:`${remembered.name}を植民`};
      const dev=(state.tutorial?.firstColonyId ? state.systems[state.tutorial.firstColonyId] : null) || ownedSystems('P').find(s=>s.id!==home.id) || home;
      if(state.ap>0) return {action:'develop', systemId:dev.id, title:'3手目：星を開発して収入を増やす', text:'開発は内政の基本です。資材を使って、次ターン以降の資源収入を増やします。', button:`${dev.name}を開発`};
      return {action:'endturn', systemId:home.id, title:'ターン終了：CPUの動きを見る', text:'APを使い切りました。ターン終了を押すと資源回収後、CPU勢力の行動が順番に表示されます。', button:'ターン終了'};
    }
    if(state.turn===2){
      const tech=getAffordableTech();
      if(tech && !state.tutorial?.researched) return {action:'tech', techId:tech.id, systemId:home.id, title:'4手目：研究で方針を決める', text:`研究ポイントが貯まりました。「${tech.name}」を研究し、文明の得意分野を伸ばしましょう。`, button:`${tech.name}を研究`};
      if(canPay('P',{materials:buildCost()}) && !state.tutorial?.builtFleet) return {action:'build', systemId:home.id, title:'5手目：艦隊を作って選択肢を増やす', text:'艦隊は攻めるためだけでなく、近くのCPU勢力への抑止力にもなります。', button:'艦隊を建造'};
      if(state.ap>0){ const dev=ownedSystems('P').sort((a,b)=>scoreSystem(b,'P')-scoreSystem(a,'P'))[0] || home; return {action:'develop', systemId:dev.id, title:'自由練習：もう一度開発', text:'残ったAPで収入源を伸ばします。このあとターン終了するとチュートリアルは完了です。', button:`${dev.name}を開発`}; }
      return {action:'endturn', systemId:home.id, title:'2ターン目終了：ここから自由行動', text:'ターン終了後は、探索・植民・研究・艦隊・侵攻を自由に組み合わせて進めます。', button:'ターン終了'};
    }
    return null;
  }
  function tutorialAllows(action, s){
    const step=tutorialStep();
    if(!step) return true;
    if(action==='endturn') return step.action==='endturn';
    if(action==='tech') return step.action==='tech';
    if(action==='build') return step.action==='build' && s?.owner==='P';
    if(action==='explore') return step.action==='explore' && (s?.id===step.systemId || exploreTargetFor(s)?.id===step.systemId);
    return step.action===action && (!step.systemId || s?.id===step.systemId);
  }
  function tutorialAllowsTech(id){ const step=tutorialStep(); return !step || (step.action==='tech' && step.techId===id); }
  function updateTutorialProgress(){
    if(!state?.tutorial) return;
    if(state.turn>2 && state.tutorial.active){ state.tutorial.active=false; addLog('チュートリアル完了。ここから自由に星域を拡大できます。','good'); }
    const step=tutorialStep();
    if(step?.action==='tech') state.tutorial.researched = player().techs.includes(step.techId) || state.tutorial.researched;
    if(player().fleet>34) state.tutorial.builtFleet = true;
  }
  function runTutorialStep(step){
    if(!step) return;
    const sys=state.systems[step.systemId] || state.systems[player().home];
    if(step.action==='endturn') return nextTurn();
    if(step.action==='tech') return researchTech(step.techId);
    selectAndFocus(sys.id);
    setTimeout(()=>{
      if(step.action==='explore') explore(sys);
      if(step.action==='colonize') colonize(sys);
      if(step.action==='develop') develop(sys);
      if(step.action==='build') buildFleet('P');
    }, 0);
  }

  function renderAdvisor(){
    const panel=$('guidePanel'); if(!panel || !state) return;
    const rec=buildRecommendation();
    $('guideTitle').textContent = rec.title;
    $('guideText').textContent = rec.text;
    $('guideActions').innerHTML = rec.buttons.map((b,i)=>`<button type="button" data-guide="${i}" class="${b.kind||''}">${b.label}</button>`).join('');
    $('guideActions').querySelectorAll('[data-guide]').forEach(btn=>{
      const b=rec.buttons[Number(btn.dataset.guide)];
      btn.onclick=()=>{ b.run && b.run(); };
    });
    document.querySelectorAll('.action-buttons button,.tech-card').forEach(el=>el.classList.remove('is-suggested'));
    if(rec.suggestAct){ const el=document.querySelector(`[data-act="${rec.suggestAct}"]`); if(el && !el.disabled) el.classList.add('is-suggested'); }
    if(rec.suggestTech){ const el=document.querySelector(`[data-tech="${rec.suggestTech}"]`)?.closest('.tech-card'); if(el) el.classList.add('is-suggested'); }
  }

  function buildRecommendation(){
    const p=player();
    const selectedSys=selected();
    const home=state.systems[p.home];
    const tut=tutorialStep();
    if(tut) return {title:tut.title, text:tut.text, suggestAct:tut.action==='tech'?null:tut.action, suggestTech:tut.techId, buttons:[{label:tut.button, kind:'primary-hint', run:()=>runTutorialStep(tut)},{label:'母星へ', run:()=>selectAndFocus(home.id)}]};
    if(state.victory) return {title:'ゲーム終了', text:state.victory.text, buttons:[{label:'結果を見る', kind:'primary-hint', run:openResultModal}]};
    if(state.ap<=0) return {title:'APを使い切りました', text:'このターンの行動は終了です。ターン終了で資源が入り、CPU勢力も同じように成長します。', suggestAct:null, buttons:[{label:'ターン終了', kind:'primary-hint', run:nextTurn},{label:'母星を見る', run:()=>selectAndFocus(home.id)}]};
    const exploredNeutral = state.systems.find(s=>!s.owner && s.explored && s.visible && s.connections.some(id=>state.systems[id].owner==='P'));
    if(exploredNeutral && canPay('P',{materials:16,influence:8})){
      return {title:'発見した星を植民できます', text:`${exploredNeutral.name}は未領有です。植民すると毎ターンの資源収入が増え、次の探索拠点になります。`, suggestAct:selectedSys?.id===exploredNeutral.id?'colonize':null, buttons:[{label:`${exploredNeutral.name}を選ぶ`, kind:'primary-hint', run:()=>selectAndFocus(exploredNeutral.id)},{label:'植民を実行', kind:'primary-hint', run:()=>{selectAndFocus(exploredNeutral.id); setTimeout(()=>colonize(exploredNeutral), 0);}},{label:'母星へ戻る', run:()=>selectAndFocus(home.id)}]};
    }
    const exploreBase = ownedSystems('P').find(s=>canExplore(s));
    if(exploreBase){
      return {title:'まず周辺を探索しましょう', text:`${exploreBase.name}から未探索星系を調査できます。探索で植民候補が増え、どの資源を伸ばすか選べるようになります。`, suggestAct:selectedSys?.id===exploreBase.id?'explore':null, buttons:[{label:`${exploreBase.name}を選ぶ`, kind:'primary-hint', run:()=>selectAndFocus(exploreBase.id)},{label:'探索を実行', kind:'primary-hint', run:()=>{selectAndFocus(exploreBase.id); setTimeout(()=>explore(exploreBase), 0);}},{label:'遊び方を見る', run:()=>openTutorial(false)}]};
    }
    const tech = getAllTechs('P').find(t=>!p.techs.includes(t.id) && !(t.req||[]).some(id=>!p.techs.includes(id)) && p.resources.research>=t.cost);
    if(tech){
      return {title:'研究で勝ち筋を作れます', text:`研究ポイントが貯まっています。「${tech.name}」を取ると内政・探索・戦争のどれかが一段強くなります。`, suggestTech:tech.id, buttons:[{label:`${tech.name}を研究`, kind:'primary-hint', run:()=>researchTech(tech.id)},{label:'技術ツリーを見る', run:openTechModal},{label:'母星を見る', run:()=>selectAndFocus(home.id)}]};
    }
    const devTarget = ownedSystems('P').filter(s=>s.development<6).sort((a,b)=>scoreSystem(b,'P')-scoreSystem(a,'P'))[0];
    if(devTarget && canPay('P',{materials:developCost(devTarget)})){
      return {title:'開発で毎ターンの収入を増やす', text:`${devTarget.name}を開発すると、資材・研究・影響力などの産出が底上げされます。内政を伸ばす基本行動です。`, suggestAct:selectedSys?.id===devTarget.id?'develop':null, buttons:[{label:`${devTarget.name}を選ぶ`, kind:'primary-hint', run:()=>selectAndFocus(devTarget.id)},{label:'開発する', kind:'primary-hint', run:()=>{selectAndFocus(devTarget.id); setTimeout(()=>develop(devTarget),0)}}]};
    }
    if(canBuildFleet()){
      return {title:'艦隊を整えて圧力をかける', text:'資材に余裕があります。艦隊を作るとCPU領への侵攻や防衛がしやすくなります。', suggestAct:'build', buttons:[{label:'艦隊を建造', kind:'primary-hint', run:()=>buildFleet('P')},{label:'周辺の敵を見る', run:()=>focusNearestEnemy()}]};
    }
    return {title:'資源を待つターンです', text:'今は大きな行動に必要な資源が足りません。ターン終了で支配星系から資源が入ります。', buttons:[{label:'ターン終了', kind:'warn-hint', run:nextTurn},{label:'母星へ戻る', run:()=>selectAndFocus(home.id)}]};
  }

  function selectAndFocus(id){ const s=state.systems[id]; if(!s) return; selectedSystemId=id; centerCameraOn(s, 2.05); render(); }
  function focusNearestEnemy(){ const pOwned=ownedSystems('P'); const enemies=state.systems.filter(s=>s.owner && s.owner!=='P' && s.visible); const t=enemies.sort((a,b)=>Math.min(...pOwned.map(o=>Math.hypot(o.x-a.x,o.y-a.y)))-Math.min(...pOwned.map(o=>Math.hypot(o.x-b.x,o.y-b.y))))[0]; if(t) selectAndFocus(t.id); }

  function openTutorial(first=false){
    if(!state) return;
    if(first && state.tutorialSeen) return;
    state.tutorialSeen = true; save();
    const d=doctrineOf(player());
    $('modalBody').innerHTML = `<h2>操作チュートリアルの考え方</h2>
      <p style="color:var(--muted);line-height:1.7">あなたは <b style="color:${d.color}">${d.name}</b> です。相性はまだ気にしなくてOK。まずは「資源の入口」を増やし、伸ばした資源で研究・艦隊・拡張のどれを優先するか選びます。</p>
      <div class="tutorial-steps">
        <div class="tutorial-step"><img src="${imgPath('icons','scout')}" alt=""><div><b>1. 母星から探索</b><p>画面中央の「あなたの母星」を選び、探索します。未知の星が植民候補になります。</p></div></div>
        <div class="tutorial-step"><img src="${imgPath('icons','colony')}" alt=""><div><b>2. 良さそうな星を植民</b><p>資材と影響力を使って星を増やします。星が増えるほど毎ターンの資源収入が増えます。</p></div></div>
        <div class="tutorial-step"><img src="${imgPath('icons','technology')}" alt=""><div><b>3. 研究か艦隊かを選ぶ</b><p>研究を進めると長期的に強くなり、艦隊を作るとCPU領に圧力をかけられます。</p></div></div>
        <div class="tutorial-step"><img src="${imgPath('icons','command')}" alt=""><div><b>4. 毎ターン3APを使い切る</b><p>探索・植民・開発・研究・艦隊・侵攻の中から3回行動。迷ったら上の「現在の目的」を見てください。</p></div></div>
      </div>
      <div class="tutorial-callout">勝利条件は、60%支配・最終技術・CPU母星制圧。最初は「探索→植民→開発/研究」の流れだけ覚えれば遊べます。</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button id="tutorialStartBtn" class="primary-btn" type="button">母星から始める</button><button id="tutorialHelpBtn" class="ghost-btn" type="button">詳しい遊び方</button></div>`;
    $('modal').showModal();
    $('tutorialStartBtn').onclick=()=>{ $('modal').close(); selectAndFocus(player().home); };
    $('tutorialHelpBtn').onclick=()=>{ $('modal').close(); openHelp(); };
  }

  function openTechModal(){
    const body=$('modalBody'); body.innerHTML = `<h2>技術ツリー</h2><p style="color:var(--muted);line-height:1.7">左パネルの技術カードから研究できます。方針ごとの最終技術を完成すると技術勝利です。</p><div class="tech-list">${$('techList').innerHTML}</div>`; $('modal').showModal();
    body.querySelectorAll('[data-tech]').forEach(btn=>btn.onclick=()=>{ $('modal').close(); researchTech(btn.dataset.tech); });
  }
  function openResultModal(){
    setTimeout(()=>{ if(!$('modal').open){ $('modalBody').innerHTML=`<h2>${state.victory.type==='defeat'?'敗北':'勝利'}</h2><p style="font-size:18px;line-height:1.8">${state.victory.text}</p><p style="color:var(--muted)">ターン ${state.turn} / 支配星系 ${ownedSystems('P').length}/${state.systems.length} / 技術 ${player().techs.length}</p><button class="primary-btn" onclick="location.reload()">タイトルへ戻る</button>`; $('modal').showModal(); } },200);
  }
  function openHelp(){
    $('modalBody').innerHTML = `<h2>遊び方</h2><div class="help-grid">
      <div class="help-card"><h3>基本目的</h3><p>星を増やして資源収入を増やし、研究・艦隊・拡張のどれを優先するか選びます。60%支配、最終技術、CPU母星制圧のいずれかで勝利です。</p></div>
      <div class="help-card"><h3>操作の流れ</h3><p>星をクリック → 右パネルで詳細確認 → 行動ボタンを押す。毎ターン3APあり、APが0になったらターン終了します。</p></div>
      <div class="help-card"><h3>資源の意味</h3><ul><li>資材：開発・艦隊・植民</li><li>研究：技術ツリー</li><li>影響：探索・植民</li><li>信用/結晶など：方針別の伸びしろ</li></ul></div>
      <div class="help-card"><h3>視点移動</h3><p>最初は母星が中心です。星を選ぶとそこへ視点が寄ります。「母星へ」で現在地に戻り、「全域」で銀河全体を確認できます。</p></div>
      <div class="help-card"><h3>CPU勢力</h3><p>CPUも毎ターン、資源獲得・植民・研究・艦隊・侵攻を行います。近くの勢力が伸びすぎる前に防衛か侵攻を考えましょう。</p></div>
      <div class="help-card"><h3>迷ったら</h3><p>画面上部中央の「現在の目的」を見てください。次に押すべき操作や見るべき星を案内します。</p></div>
    </div>`; $('modal').showModal();
  }

  function bind(){
    $('startBtn').onclick=startNew; $('continueBtn').onclick=()=>load(); $('randomSeedBtn').onclick=()=>{$('seedInput').value=randomSeedText();};
    $('endTurnBtn').onclick=nextTurn; $('saveBtn').onclick=()=>{save(); addLog('手動保存しました。','good'); render();};
    $('helpBtn').onclick=openHelp; $('tutorialBtn').onclick=()=>openTutorial(false); $('homeBtn').onclick=()=>selectAndFocus(player().home); $('overviewBtn').onclick=showOverview; $('modalClose').onclick=()=>$('modal').close();
    $('newGameBtn').onclick=()=>{ if(confirm('現在のセーブを残したままタイトルへ戻ります。新規開始すると上書きされます。')) showScreen('title'); };
    $('starCanvas').addEventListener('click', ev=>{ if(!state) return; const s=pickSystemByPoint(ev.clientX,ev.clientY); if(s){ selectedSystemId=s.id; centerCameraOn(s, 2.05); render(); } });
    addEventListener('resize', resizeCanvas);
  }

  preload().then(()=>{ initTitle(); bind(); resizeCanvas(); });
})();
