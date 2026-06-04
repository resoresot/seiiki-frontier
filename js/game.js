(() => {
  'use strict';

  const SAVE_KEY = 'seiiki-frontier-save-v20';
  const LEGACY_SAVE_KEYS = ['seiiki-frontier-save-v17'];
  const AS = 'assets/img/';
  const VERSION = 20;
  // How fast a sprawling empire loses per-colony efficiency. Higher = harder to snowball.
  const ADMIN_DRAG = 0.12;
  const VICTORY_TURN = 50;
  const DOMINATION_THRESHOLD = 0.60;
  const SIEGE_STEP_BASE = 18;
  const HOME_INVASION_CHARGE = 2;
  const MAX_DEVELOPMENT = 6;

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
  const CPU_PERSONAS = {
    machine:{title:'冷徹な演算機械', style:'知的・研究先行', bias:'研究と恒星技術を優先し、準備が整うと精密に侵攻する。', quote:'「最適解は既に算出済みだ。遅れた文明から順に整理する。」'},
    eco:{title:'絡みつく生態同盟', style:'いやらしい持久型', bias:'人口・防衛・食料で粘り、落としにくい植民地を増やす。', quote:'「急がなくていい。根は静かに、だが確実に星を覆う。」'},
    war:{title:'赤い脳筋艦隊', style:'脳筋・艦隊圧力', bias:'艦船建造と武器強化を優先し、隙を見つけると母星を狙う。', quote:'「研究？防衛？まず殴れば星は黙る。」'},
    trade:{title:'ずる賢い商圏', style:'信用・横取り型', bias:'信用で不足資源を補い、他勢力の消耗後に一気に伸びる。', quote:'「勝者を決めるのは艦隊ではない。補給線の所有者だ。」'}
  };

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
    {id:'voidCrown', name:'虚空の王冠', icon:'victory', cost:145, tier:4, doctrine:'mystic', req:['phaseShield'], final:true, text:'常識外の星域支配を可能にする最終技術です。'},
    // v10 expanded strategic branches: more multi-requirement research choices.
    {id:'lunarSurvey', name:'衛星地質学', icon:'scout', cost:24, tier:1, req:['survey'], text:'衛星・小惑星帯の資材+15%。序盤資材の底上げ。'},
    {id:'hydroponics', name:'水耕ドーム', icon:'food', cost:28, tier:1, req:['colonyAdmin'], text:'植民地維持の食料負担を少し軽減します。'},
    {id:'miningGuild', name:'採掘ギルド', icon:'materials', cost:36, tier:2, req:['lunarSurvey','orbitalIndustry'], text:'砂漠・火山・小惑星帯の資材+25%。'},
    {id:'fusionGrid', name:'核融合送電網', icon:'energy', cost:42, tier:2, req:['stellarHarness','orbitalIndustry'], text:'恒星・火山・ガス巨星の電力+25%。'},
    {id:'civilRegistry', name:'市民登録網', icon:'population', cost:40, tier:2, req:['colonyAdmin','survey'], text:'影響産出+15%。植民地管理が安定。'},
    {id:'tradePort', name:'軌道交易港', icon:'credits', cost:46, tier:2, req:['colonyAdmin'], text:'信用産出+20%。不足資源の補助がしやすくなる。'},
    {id:'shipFoundry', name:'艦船鋳造所', icon:'fleet', cost:58, tier:2, req:['orbitalIndustry','fusionGrid'], text:'艦船建造の資材コストをさらに下げます。'},
    {id:'shieldTheory', name:'偏向シールド理論', icon:'defense', cost:62, tier:2, req:['defenseGrid','fusionGrid'], text:'艦隊シールドと惑星防衛の基礎を強化します。'},
    {id:'warpBeacons', name:'ワープ標識網', icon:'scout', cost:82, tier:3, req:['warpDrive','logistics'], text:'他星系侵攻時の充填消費を抑えます。'},
    {id:'battleAI', name:'戦術AI', icon:'command', cost:84, tier:3, req:['logistics','shipFoundry'], text:'艦隊の総合戦力+10%。'},
    {id:'fortressWorlds', name:'要塞惑星計画', icon:'defense', cost:88, tier:3, req:['planetaryGuns','shieldTheory'], text:'開発済み惑星の防衛値をさらに伸ばします。'},
    {id:'deepCoreExtraction', name:'深層核採掘', icon:'materials', cost:96, tier:3, req:['miningGuild','stellarHarness'], text:'資材星の産出をさらに強化します。'},
    {id:'planetaryAcademies', name:'惑星大学群', icon:'research', cost:104, tier:3, doctrine:'tech', req:['quantumLabs','civilRegistry'], text:'人口の多い惑星の研究を強化します。'},
    {id:'grandLogistics', name:'大兵站網', icon:'command', cost:118, tier:4, req:['warpBeacons','battleAI','tradePort'], text:'長距離戦と内政を両立する高位兵站。最大AP+1。'},
    {id:'sectorCapital', name:'星区首府', icon:'victory', cost:132, tier:4, req:['capitalProtocol','civilRegistry','fortressWorlds'], text:'接収拠点の反乱リスクを下げ、支配勝利を狙いやすくします。'},
    {id:'stellarCatapult', name:'恒星カタパルト', icon:'energy', cost:148, tier:4, req:['warpBeacons','fusionGrid','deepCoreExtraction'], text:'恒星チャージを軍事的に利用し、敵母星への遠征を容易にします。'},
    {id:'defenseSingularity', name:'防衛特異点', icon:'defense', cost:152, tier:4, req:['fortressWorlds','shieldTheory','planetaryGuns'], text:'防衛施設と艦隊シールドを同時に高める高位防衛技術。'},
    {id:'nanoforge', name:'ナノ工廠', icon:'industry', cost:72, tier:2, doctrine:'tech', req:['laser','orbitalIndustry'], text:'開発・建造コストを研究力で圧縮します。'},
    {id:'predictionGrid', name:'予測統治網', icon:'command', cost:112, tier:3, doctrine:'tech', req:['aiCommand','civilRegistry'], text:'研究・防衛・艦隊判断を統合します。'},
    {id:'omegaArchive', name:'オメガ記録庫', icon:'research', cost:146, tier:4, doctrine:'tech', req:['predictionGrid','planetaryAcademies'], text:'最終技術への前提となる巨大研究基盤。'},
    {id:'assaultCarriers', name:'強襲空母群', icon:'command', cost:82, tier:2, doctrine:'war', req:['dock','shipFoundry'], text:'空母と駆逐艦の運用効率を高めます。'},
    {id:'orbitalDrop', name:'軌道降下作戦', icon:'attack', cost:110, tier:3, doctrine:'war', req:['marines','warpDrive'], text:'母星・要塞惑星への侵攻力を高めます。'},
    {id:'warEconomy', name:'総力戦経済', icon:'materials', cost:128, tier:4, doctrine:'war', req:['siegeDoctrine','deepCoreExtraction'], text:'資材・艦隊建造・侵攻を一体運用する軍事経済。'},
    {id:'creditClearing', name:'信用決済網', icon:'credits', cost:70, tier:2, doctrine:'trade', req:['bank','tradePort'], text:'信用収入をさらに伸ばし、植民と建造の不足を補います。'},
    {id:'privateFleets', name:'民間護衛艦隊', icon:'fleet', cost:102, tier:3, doctrine:'trade', req:['creditClearing','shipFoundry'], text:'信用を背景に艦隊戦力を補強します。'},
    {id:'monopolyCharter', name:'独占開拓権', icon:'colony', cost:132, tier:4, doctrine:'trade', req:['energyMarket','privateFleets'], text:'外星系進出と交易支配を両立します。'},
    {id:'geneClinics', name:'遺伝子診療所', icon:'population', cost:66, tier:2, doctrine:'eco', req:['bio','hydroponics'], text:'人口増加と維持効率を高めます。'},
    {id:'livingCities', name:'生体都市', icon:'food', cost:106, tier:3, doctrine:'eco', req:['geneClinics','terraform'], text:'人口の多い惑星ほど産出と防衛が伸びます。'},
    {id:'gaiaEngines', name:'ガイア機関', icon:'energy', cost:134, tier:4, doctrine:'eco', req:['livingCities','fusionGrid'], text:'食料と電力を両立し、長期戦に強くなります。'},
    {id:'crystalCodex', name:'結晶写本', icon:'crystal', cost:68, tier:2, doctrine:'mystic', req:['relic','lunarSurvey'], text:'結晶収入を安定化し、特殊研究の前提になります。'},
    {id:'phaseLances', name:'位相槍艦', icon:'attack', cost:108, tier:3, doctrine:'mystic', req:['phaseShield','crystalCodex'], text:'防衛シールドを貫く特殊艦隊運用。'},
    {id:'voidPilgrimage', name:'虚空巡礼路', icon:'espionage', cost:134, tier:4, doctrine:'mystic', req:['phaseLances','warpBeacons'], text:'ワープ経路と結晶技術を融合します。'}
  ];


  // v11 expanded research map: dense branch network with visual paths.
  TECHS.push(
    {id:'scoutNetworks', name:'偵察網標準化', icon:'scout', cost:22, tier:1, branch:'explore', req:['survey'], text:'探索任務を標準化し、序盤の未探索星を見つけやすくします。'},
    {id:'stellarCartography', name:'恒星系地図学', icon:'scout', cost:30, tier:1, branch:'explore', req:['survey'], text:'同一恒星系の航路把握を進め、外惑星探索の前提になります。'},
    {id:'outpostProtocols', name:'前哨地規約', icon:'colony', cost:34, tier:1, branch:'explore', req:['colonyAdmin'], text:'植民地の初期混乱を減らし、拡張の失速を防ぎます。'},
    {id:'defenseDrills', name:'防衛演習', icon:'defense', cost:34, tier:1, branch:'defense', req:['defenseGrid'], text:'民兵防衛と砲台運用の基礎を固めます。'},
    {id:'surveyDrones', name:'測量ドローン', icon:'technology', cost:36, tier:1, branch:'science', req:['survey'], text:'未探索星の測量精度を高め、研究の基礎収入を伸ばします。'},
    {id:'habitatCodes', name:'居住規格', icon:'population', cost:38, tier:1, branch:'bio', req:['colonyAdmin'], text:'新植民地の人口維持を標準化します。'},
    {id:'oreSorting', name:'鉱石選別', icon:'materials', cost:38, tier:1, branch:'industry', req:['lunarSurvey'], text:'採掘星から得られる資材のムダを減らします。'},
    {id:'creditNotaries', name:'信用公証', icon:'credits', cost:34, tier:1, branch:'economy', req:['tradePort'], text:'信用取引の安全性を高め、商業系ルートの前提になります。'},

    {id:'deepSpaceScanners', name:'深宇宙スキャナ', icon:'scout', cost:58, tier:2, branch:'explore', req:['stellarCartography','scoutNetworks'], text:'星系外縁の観測を強化し、ワープ前の候補選定を助けます。'},
    {id:'migrationShips', name:'移民船団', icon:'colony', cost:62, tier:2, branch:'explore', req:['outpostProtocols','hydroponics'], text:'植民コストを軽くし、人口移送を安定させます。'},
    {id:'modularFoundries', name:'モジュール工廠', icon:'industry', cost:66, tier:2, branch:'industry', req:['orbitalIndustry','oreSorting'], text:'惑星開発の資材コストを下げます。'},
    {id:'orbitalElevators', name:'軌道エレベータ', icon:'industry', cost:78, tier:2, branch:'industry', req:['modularFoundries','civilRegistry'], text:'人口の多い惑星ほど開発効率が上がります。'},
    {id:'solarCollectors', name:'恒星集光膜', icon:'energy', cost:68, tier:2, branch:'warp', req:['stellarHarness','fusionGrid'], text:'恒星チャージの電力負担を軽くします。'},
    {id:'fuelDepots', name:'燃料集積港', icon:'energy', cost:82, tier:2, branch:'warp', req:['logistics','fusionGrid'], text:'恒星チャージ上限を増やし、遠征準備を安定させます。'},
    {id:'escortDoctrine', name:'護衛艦隊教範', icon:'fleet', cost:74, tier:2, branch:'military', req:['shipFoundry','defenseDrills'], text:'小型艦とフリゲートの連携を強化します。'},
    {id:'shieldHarmonics', name:'シールド調律', icon:'defense', cost:76, tier:2, branch:'defense', req:['shieldTheory','defenseDrills'], text:'艦隊シールドと惑星シールドを安定化します。'},
    {id:'academicSatellites', name:'学術衛星群', icon:'research', cost:70, tier:2, branch:'science', req:['surveyDrones','orbitalIndustry'], text:'衛星・氷結星の研究産出を伸ばします。'},
    {id:'resourceFutures', name:'資源先物市場', icon:'credits', cost:78, tier:2, branch:'economy', req:['creditNotaries','tradePort'], text:'資源収入の偏りを信用で吸収します。'},
    {id:'populationLogistics', name:'人口物流', icon:'population', cost:72, tier:2, branch:'bio', req:['habitatCodes','hydroponics'], text:'人口の伸びと維持費のバランスを改善します。'},

    {id:'planetaryLogistics', name:'惑星物流網', icon:'command', cost:100, tier:3, branch:'explore', req:['migrationShips','orbitalElevators'], text:'複数惑星の開発順を最適化します。'},
    {id:'cruiserDoctrine', name:'巡洋艦構想', icon:'fleet', cost:104, tier:3, branch:'military', req:['escortDoctrine','battleAI'], text:'中型艦の火力と護衛効率を高めます。'},
    {id:'jointCommand', name:'統合作戦司令', icon:'command', cost:112, tier:3, branch:'military', req:['battleAI','civilRegistry'], text:'艦隊と内政の判断を統合し、最大APを伸ばします。'},
    {id:'starFortresses', name:'恒星要塞', icon:'defense', cost:116, tier:3, branch:'defense', req:['fortressWorlds','solarCollectors'], text:'恒星周辺の防衛・充填拠点を強化します。'},
    {id:'wormholeMath', name:'ワームホール数学', icon:'technology', cost:118, tier:3, branch:'warp', req:['warpDrive','academicSatellites'], text:'ワープ経路の安定性を高めます。'},
    {id:'nebulaHarvesting', name:'星雲採取', icon:'crystal', cost:108, tier:3, branch:'industry', req:['fusionGrid','deepCoreExtraction'], text:'電力と結晶を同時に得る高位採取技術。'},
    {id:'interstellarLaw', name:'星間法', icon:'diplomacy', cost:106, tier:3, branch:'economy', req:['capitalProtocol','resourceFutures'], text:'接収・交易・影響力の制度化を進めます。'},
    {id:'terraStandard', name:'標準テラフォーム', icon:'colony', cost:110, tier:3, branch:'bio', req:['populationLogistics','terraform'], text:'植民地の赤字期間をさらに短縮します。'},
    {id:'sensorLattice', name:'センサー格子', icon:'technology', cost:100, tier:3, doctrine:'tech', branch:'science', req:['quantumLabs','deepSpaceScanners'], text:'研究済み経路の情報量を増やし、技術ルートを読みやすくします。'},
    {id:'orbitalShipyards', name:'軌道造船所', icon:'fleet', cost:102, tier:3, doctrine:'war', branch:'military', req:['assaultCarriers','modularFoundries'], text:'大型艦建造の前提になる軍事生産技術。'},
    {id:'clearingHouse', name:'星間清算所', icon:'credits', cost:98, tier:3, doctrine:'trade', branch:'economy', req:['creditClearing','resourceFutures'], text:'信用収入と不足補填を強化します。'},
    {id:'seedVaults', name:'種子保管庫', icon:'food', cost:96, tier:3, doctrine:'eco', branch:'bio', req:['geneClinics','populationLogistics'], text:'食料危機に強い植民地基盤を作ります。'},
    {id:'voidShrines', name:'虚空神殿', icon:'espionage', cost:98, tier:3, doctrine:'mystic', branch:'void', req:['void','crystalCodex'], text:'虚空航法と結晶研究を結びます。'},

    {id:'megaFoundries', name:'メガ工廠群', icon:'industry', cost:150, tier:4, branch:'industry', req:['orbitalElevators','nebulaHarvesting','deepCoreExtraction'], text:'資材・艦隊・恒星開発をまとめて支える巨大工業基盤。'},
    {id:'dysonFrames', name:'ダイソン骨格', icon:'energy', cost:162, tier:4, branch:'warp', req:['stellarCatapult','starFortresses','wormholeMath'], text:'恒星チャージとワープ遠征を根本的に強化します。'},
    {id:'fleetAcademies', name:'艦隊士官学校', icon:'command', cost:148, tier:4, branch:'military', req:['cruiserDoctrine','jointCommand'], text:'艦隊戦力と損耗回避を高めます。'},
    {id:'planetaryAegis', name:'惑星アイギス', icon:'defense', cost:158, tier:4, branch:'defense', req:['defenseSingularity','starFortresses','shieldHarmonics'], text:'落とされたくない惑星の最終防衛線。'},
    {id:'autonomousColonies', name:'自律植民圏', icon:'colony', cost:154, tier:4, branch:'explore', req:['planetaryLogistics','sectorCapital','terraStandard'], text:'広い星域の植民地運営を半自律化します。'},
    {id:'hyperspaceCouriers', name:'超空間急使', icon:'scout', cost:146, tier:4, branch:'economy', req:['warpBeacons','interstellarLaw','clearingHouse'], text:'交易・命令・補給の速度を高めます。'},
    {id:'syntheticAdvisors', name:'合成参謀', icon:'command', cost:154, tier:4, doctrine:'tech', branch:'science', req:['predictionGrid','sensorLattice'], text:'AIとセンサー格子で戦略判断を自動化します。'},
    {id:'dreadnoughtFrames', name:'弩級艦骨格', icon:'fleet', cost:156, tier:4, doctrine:'war', branch:'military', req:['orbitalShipyards','cruiserDoctrine'], text:'大型艦隊運用の中核技術。'},
    {id:'tariffUnion', name:'関税同盟', icon:'credits', cost:148, tier:4, doctrine:'trade', branch:'economy', req:['clearingHouse','interstellarLaw'], text:'保有圏全体の信用収入を底上げします。'},
    {id:'symbioticHabitats', name:'共生居住区', icon:'population', cost:150, tier:4, doctrine:'eco', branch:'bio', req:['seedVaults','livingCities'], text:'人口と産出を両立する生態都市の発展形。'},
    {id:'ghostFleets', name:'幽影艦隊', icon:'fleet', cost:150, tier:4, doctrine:'mystic', branch:'void', req:['phaseLances','voidShrines'], text:'防衛網をすり抜ける秘教艦隊運用。'},

    {id:'galaxyLogistics', name:'銀河大物流', icon:'command', cost:210, tier:5, branch:'explore', req:['autonomousColonies','hyperspaceCouriers','grandLogistics'], text:'星系間の植民・補給・行政を統合する超広域物流。'},
    {id:'stellarDominion', name:'恒星支配理論', icon:'energy', cost:225, tier:5, branch:'warp', req:['dysonFrames','stellarCatapult'], text:'恒星を移動・防衛・侵攻の中心資源として完全運用します。'},
    {id:'imperialNavy', name:'帝国艦隊省', icon:'fleet', cost:220, tier:5, branch:'military', req:['fleetAcademies','dreadnoughtFrames'], text:'全艦種を統合し、遠征艦隊の決定力を上げます。'},
    {id:'unbreakableWorlds', name:'不落惑星網', icon:'defense', cost:218, tier:5, branch:'defense', req:['planetaryAegis','defenseSingularity'], text:'母星と重要惑星を落とされにくくします。'},
    {id:'postScarcity', name:'希少性後経済', icon:'credits', cost:230, tier:5, branch:'economy', req:['megaFoundries','tariffUnion','galacticMarket'], final:true, text:'経済勝利。資源制約を超える銀河経済圏を完成します。'},
    {id:'livingGalaxy', name:'生きた銀河', icon:'food', cost:228, tier:5, doctrine:'eco', branch:'bio', req:['symbioticHabitats','gaiaEngines','lifeweb'], final:true, text:'生態勝利。植民地すべてを巨大生命圏として接続します。'},
    {id:'starMind', name:'恒星知性', icon:'technology', cost:232, tier:5, doctrine:'tech', branch:'science', req:['syntheticAdvisors','omegaArchive','singularityCore'], final:true, text:'技術勝利。恒星規模の演算知性を完成します。'},
    {id:'totalConquest', name:'総征服令', icon:'victory', cost:226, tier:5, doctrine:'war', branch:'military', req:['imperialNavy','warEconomy','conquestFleet'], final:true, text:'軍事勝利。全星系を制圧するための最終軍事体制。'},
    {id:'tradeHegemony', name:'交易覇権', icon:'victory', cost:224, tier:5, doctrine:'trade', branch:'economy', req:['tariffUnion','monopolyCharter','galacticMarket'], final:true, text:'交易勝利。全勢力の補給線を自国経済圏に組み込みます。'},
    {id:'oracleNexus', name:'神託接続体', icon:'victory', cost:226, tier:5, doctrine:'mystic', branch:'void', req:['ghostFleets','voidPilgrimage','voidCrown'], final:true, text:'秘教勝利。虚空経路から銀河秩序を上書きします。'}
  );

  const RESOURCE_BASE = {materials:0,research:0,influence:0,energy:0,food:0,crystal:0,credits:0};
  const CLUSTERS = [
    {id:0, name:'アステル星系', x:.50, y:.50, owner:'P', color:'#6ee7ff'},
    {id:1, name:'ノクス星系', x:.12, y:.12, owner:'C1', color:'#9fb0ff'},
    {id:2, name:'エコー星系', x:.88, y:.13, owner:'C2', color:'#70f2a7'},
    {id:3, name:'ルベル星系', x:.13, y:.88, owner:'C3', color:'#ff7272'},
    {id:4, name:'アウルム星系', x:.87, y:.87, owner:'C4', color:'#ffd37a'}
  ];

  let state = null;
  let selectedDoctrine = 'tech';
  let modalPage = null;
  let modalDetail = null;
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
  const savedGameRaw = () => storageGet(SAVE_KEY) || LEGACY_SAVE_KEYS.map(storageGet).find(Boolean) || null;

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
  function canPayFlexible(cost, fid='P', mode='normal'){
    if(canPay(cost,fid)) return true;
    const f=faction(fid), r=f?.resources || {};
    const normalized={...cost}; let creditNeed=0;
    if(mode==='colonize' && f?.techs?.includes('charter') && normalized.materials){
      const miss=Math.max(0, normalized.materials-(r.materials||0));
      normalized.materials-=miss; creditNeed+=miss*2;
    }
    if(mode==='starCharge' && f?.techs?.includes('energyMarket') && normalized.energy){
      const miss=Math.max(0, normalized.energy-(r.energy||0));
      normalized.energy-=miss; creditNeed+=Math.ceil(miss*1.5);
    }
    return Object.entries(normalized).every(([k,v])=>(r[k]||0)>=v) && (r.credits||0) >= (normalized.credits||0)+creditNeed;
  }
  function payFlexible(cost, fid='P', mode='normal'){
    const f=faction(fid), r=f.resources;
    const charge=(k,v)=>{ r[k]=Math.max(0,(r[k]||0)-v); };
    Object.entries(cost).forEach(([k,v])=>{
      if(mode==='colonize' && k==='materials' && f.techs.includes('charter')){
        const direct=Math.min(r.materials||0, v); charge('materials', direct); const miss=v-direct; if(miss>0) charge('credits', miss*2); return;
      }
      if(mode==='starCharge' && k==='energy' && f.techs.includes('energyMarket')){
        const direct=Math.min(r.energy||0, v); charge('energy', direct); const miss=v-direct; if(miss>0) charge('credits', Math.ceil(miss*1.5)); return;
      }
      charge(k,v);
    });
  }
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
    let techFleet = f.techs?.includes('aiCommand') ? 1.12 : 1; ['battleAI','assaultCarriers','privateFleets','phaseLances','escortDoctrine','cruiserDoctrine','fleetAcademies','imperialNavy','ghostFleets'].forEach(id=>{ if(f.techs?.includes(id)) techFleet *= 1.06; }); if(f.techs?.includes('dreadnoughtFrames')) techFleet *= 1.08;
    return {
      power: Math.round(base * doctrineFleet * techFleet * (1 + up.weapons*.07 + up.shields*.05 + up.engines*.04)),
      attack: Math.round(atk * doctrineFleet * techFleet * (1 + up.weapons*.12 + up.engines*.04)),
      shield: Math.round(shield * (1 + up.shields*.14 + up.engines*.03))
    };
  }
  const fleetText = (f) => Object.entries(SHIPS).map(([k,s]) => `${s.name}${f.ships?.[k] || 0}`).join(' / ');
  function factionScore(fid){ const f=faction(fid); if(!f) return 0; const prod=totalIncome(fid), fs=fleetStats(f); const resourceScore=RESOURCE_ORDER.reduce((a,k)=>a+(f.resources[k]||0)*0.08+(prod[k]||0)*1.8,0); return Math.round(resourceScore + owned(fid).length*22 + f.techs.length*18 + fs.power*0.75 + (f.charge||0)*18); }
  function focusNextActionTarget(){ if(!state) return; const target=tutorialTargetSystem() || selectedSystem() || system(player().home); if(target){ state.selectedId=target.id; centerOn(target, Math.max(camera.zoom, 1.05)); } }
  function finishReplay(){ state.replay=[]; replayIndex=0; if(checkDefeat()) return; focusNextActionTarget(); render(); }

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
    $('continueBtn').disabled = !savedGameRaw();
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
      {id:'P', name:'あなたの帝国', doctrine, color:DOCTRINES[doctrine].color, cluster:0, home:null, star:null, resources:{materials:118,research:52,influence:56,energy:62,food:64,crystal:16,credits:54}, charge:0, maxCharge:1, ships:{scout:2,frigate:1,destroyer:0,carrier:0}, upgrades:{weapons:0,shields:0,engines:0}, techs:[], eliminated:false, ai:'player', persona:'プレイヤー'},
      ...CPU_NAMES.map((name,i) => {
        const doctrine=CPU_DOCTRINES[i];
        const persona=CPU_PERSONAS[doctrine];
        return {id:`C${i+1}`, name, doctrine, color:['#9fb0ff','#70f2a7','#ff7272','#ffd37a'][i], cluster:i+1, home:null, star:null, resources:{materials:160,research:82,influence:78,energy:110,food:88,crystal:30,credits:92}, charge:1, maxCharge:2, ships:{scout:3,frigate:2,destroyer:i===2?1:0,carrier:0}, upgrades:{weapons:i===2?1:0,shields:i===1?1:0,engines:0}, techs:['survey','colonyAdmin', i===2?'dock':'orbitalIndustry'].filter(Boolean), eliminated:false, ai:['research','expand','war','trade'][i], persona:persona?.title || ''};
      })
    ];
    const systems = [];
    CLUSTERS.forEach(c => buildCluster(systems, factions, c));
    // Interstellar routes connect stars only. They become operational after warp research.
    const stars = systems.filter(s => s.kind === 'star');
    stars.forEach((s,i)=>{ stars.slice(i+1).forEach(o => connect(systems,s.id,o.id,'warp')); });
    return {version:VERSION, seed, turn:1, ap:3, maxAp:3, selectedId:2, systems, factions, logs:[], tutorial:{active:true,step:0}, replay:[], victory:null, defeat:null, sieges:{}, sheetCollapsed:false, milestones:{}};
  }

  function buildCluster(systems, factions, c){
    const fid = c.owner;
    const f = factions.find(x => x.id === fid);
    const starId = systems.length;
    const isPlayer = fid === 'P';
    const prefix = c.name.replace('星系','');
    const planetCount = rng.int(5,10);
    const occupied = [];
    const addBody = (body, kind, name, dx, dy, opts={}) => {
      const id = systems.length;
      const x = clamp(c.x+dx,.025,.975), y = clamp(c.y+dy,.055,.945);
      systems.push({
        id, cluster:c.id, name, body, kind, x, y, links:[],
        owner:opts.owner||null, explored:!!opts.explored,
        level:opts.level||0, pop:opts.pop||0,
        defense:opts.defense ?? rng.int(7,18),
        defenseType:opts.defenseType || ['militia','armor','shield','flak'][rng.int(0,3)],
        homeOf:opts.homeOf||null, starOf:opts.starOf||null, parent:opts.parent??null, locked:!!opts.locked
      });
      occupied.push({x:dx,y:dy,r:opts.r||.038,id});
      return id;
    };
    const star = addBody('star','star',`${prefix}主恒星`,0,0,{owner:fid,explored:true,level:1,defense:22,starOf:fid,r:.050});
    const home = addBody('home','planet', isPlayer?'母星アステル':`${prefix}母星`, .060, -.012, {owner:fid,explored:true,level:2,pop:5.5,defense:30,defenseType:'shield',homeOf:fid,parent:star,r:.052});
    connect(systems, star, home, 'orbit');
    // Tutorial moon and first planet: fixed ids after star/home for player cluster.
    const tutMoon = addBody('moon','moon', isPlayer?'アステル衛星':`${prefix}衛星`, .090, .030, {owner:(!isPlayer?fid:null), explored:!isPlayer, level:!isPlayer?1:0, pop:!isPlayer?1.2:0, parent:home, r:.030});
    connect(systems, home, tutMoon, 'orbit');
    const tutPlanet = addBody(isPlayer?'desert':rng.pick(['desert','ice','ocean','volcanic']),'planet', isPlayer?'砂礫のエオス':`${prefix}第一惑星`, -.085, .060, {owner:null, explored:false, parent:star, locked:isPlayer, r:.046});
    connect(systems, star, tutPlanet, 'orbit');
    // Random additional planets, spaced around a large local orbital area.
    const planetIds=[home,tutPlanet];
    const planetTypes=['terran','desert','ocean','volcanic','ice','gas','crystal','relic','belt'];
    for(let i=0;i<planetCount-2;i++){
      let dx=0,dy=0, ok=false;
      for(let tries=0; tries<80 && !ok; tries++){
        const angle = rng.next()*Math.PI*2;
        const rad = .095 + rng.next()*.135;
        dx = Math.cos(angle)*rad;
        dy = Math.sin(angle)*rad;
        ok = occupied.every(o => Math.hypot(dx-o.x,dy-o.y) > (o.r+.048));
      }
      const body = rng.pick(planetTypes);
      const id = addBody(body, body==='belt'?'belt':'planet', `${prefix}${['外縁','第二','第三','辺境','深層','黎明','黄昏','極光'][i%8]}${body==='belt'?'帯':'惑星'}`, dx, dy, {owner:(!isPlayer && i<2 ? fid : null), explored:(!isPlayer && i<3), level:(!isPlayer && i<2 ? 1 : 0), pop:(!isPlayer && i<2 ? 1.6 : 0), parent:star, locked:isPlayer, r:body==='belt'?.038:.046});
      planetIds.push(id);
      connect(systems, star, id, 'orbit');
    }
    // Random moons. Moons only connect to their planet; they require parent planet development for later development.
    planetIds.slice().forEach((pid,idx)=>{
      const parent=systems[pid];
      const maxMoons = parent.body==='home' ? 2 : rng.int(0,3);
      for(let m=0;m<maxMoons;m++){
        if(isPlayer && parent.id!==home && idx>3 && rng.chance(.35)) continue;
        const angle = (Math.PI*2)*(m/maxMoons) + rng.next()*.55;
        const rad = .032 + m*.020 + rng.next()*.012;
        const mid = addBody(rng.pick(['moon','ice','belt']), 'moon', `${parent.name}衛星${m+1}`, parent.x-c.x+Math.cos(angle)*rad, parent.y-c.y+Math.sin(angle)*rad, {owner:(!isPlayer && parent.owner===fid && m===0 ? fid : null), explored:(!isPlayer && parent.owner===fid), level:(!isPlayer && parent.owner===fid ? 1 : 0), pop:(!isPlayer && parent.owner===fid ? 1 : 0), parent:pid, r:.024});
        connect(systems, pid, mid, 'orbit');
      }
    });
    f.star = star; f.home = home;
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
    camera = {x:.5,y:.50,zoom:1.22};
    addLog(`銀河シード「${seed}」で${DOCTRINES[selectedDoctrine].name}が始動。`, 'good');
    showScreen('game'); save(); render();
  }
  function continueGame(){
    try{ const raw=savedGameRaw(); if(!raw) return; state=JSON.parse(raw); normalizeState(); camera=state.camera || {x:.5,y:.52,zoom:1.5}; showScreen('game'); render(); }
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
  function fullMap(){ camera={x:.5,y:.50,zoom:.58}; draw(); }

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
    5:['チュートリアル 4/9','研究を使う','右の「研究」から「星系測量」を研究してください。別惑星の探索が解放されます。'],
    6:['チュートリアル 5/9','艦船を建造','右の「艦隊」からフリゲートを建造してください。戦力は艦船の数と種類で決まります。'],
    7:['チュートリアル 6/9','艦隊を強化','同じ艦隊画面で「武器」を強化してください。攻める艦隊の相性にも関わります。'],
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

  function render(){ if(!state) return; renderTop(); renderCoach(); renderPanel(); renderReplay(); draw(); if(!checkDefeat()) checkVictory(); save(); }
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
    const income = systemYield(s);
    const compactIncome = RESOURCE_ORDER.map(k=>`<span><i>${RESOURCES[k].label}</i><b>${signFmt(income[k]||0)}</b></span>`).join('');
    body.innerHTML = `<section class="panel-section compact system-card"><div class="system-action-row"><div class="action-strip">${actions}</div><div class="selected-mini"><b>${visible?s.name:'未探索天体'}</b><span>Lv${s.level} / ${visible?type.name:'不明'}</span></div></div><div class="system-head"><div><h2>${visible?s.name:'未探索天体'}</h2><p>${clusterOf(s.cluster).name} / ${visible?type.name:'正体不明'}</p></div><span class="pill ${s.owner==='P'?'you':s.owner?'bad':''}">${owner?owner.name.replace('あなたの帝国','あなた'):'中立'}</span></div><div class="sys-stats compact-stats"><span>Lv <b>${s.level}</b></span><span>人口 <b>${s.pop.toFixed ? s.pop.toFixed(1) : s.pop}</b></span><span>防衛 <b>${s.defense}</b></span><span>${DEFENSES[s.defenseType]?.name || '防衛なし'}</span></div>${visible?`<div class="income-grid">${compactIncome}</div><p class="system-note">${systemAdvice(s)}</p>`:`<p class="system-note">未探索です。探索すると種類・収支・植民可否がわかります。</p>`}</section>`;
    bindActionButtons(body);
  }
  function actionButtonsHtml(s){ const actions=getActionsFor(s); if(actions.length===0) return `<span class="no-action">今は実行可能な操作なし</span>`; return actions.map(a=>`<button class="quick-action ${a.warn?'warn':''}" data-action="${a.id}" data-arg="${a.arg||''}" type="button">${a.label}<small>${a.short}</small></button>`).join(''); }
  function getActionsFor(s){
    const a=[];
    if(canExplore(s)){ const cost=exploreCost(s); if(tutorialAllows('explore')) a.push({id:'explore',label:'探索',short:`AP1 ${costText(cost)}`}); }
    if(canColonize(s)){ const cost=colonizeCost(s); if(tutorialAllows('colonize')) a.push({id:'colonize',label:'植民',short:`AP1 ${costText(cost)}`}); }
    if(s.owner==='P' && s.kind!=='star' && s.level<MAX_DEVELOPMENT){ const cost=developCost(s); if(tutorialAllows('develop')) a.push({id:'develop',label:'開発',short:`AP1 ${costText(cost)}`}); }
    if(canFortify(s)){ const cost=fortifyCost(s); if(tutorialAllows('fortify')) a.push({id:'fortify',label:'防衛強化',short:`AP1 ${costText(cost)}`}); }
    if(s.owner==='P' && s.kind==='star' && hasTech('stellarHarness')){ const cost=starChargeCost(s); if(tutorialAllows('charge')) a.push({id:'chargeStar',label:'恒星チャージ',short:`AP1 ${costText(cost)}`}); }
    if(canBesiege(s)){ const cost=siegeCost(s); a.push({id:'besiege',label:'包囲',warn:true,short:`AP1 充填1 ${costText(cost)}`}); }
    if(canInvade(s)){ const pv=battlePreview(player(), faction(s.owner), s); a.push({id:'invade',label:'侵攻',warn:true,short:`勝率${pv.winChance}% AP1 充填${s.homeOf?HOME_INVASION_CHARGE:1}`}); }
    return a;
  }
  function canExplore(s){
    if(!s || s.explored || s.owner) return false;
    if(s.cluster!==0) return hasTech('warpDrive') && adjacentToOwned(s.id);
    if(s.kind==='moon'){
      const parent=system(s.parent);
      if(parent?.body==='home') return adjacentToOwned(s.id);
      return !!(parent && parent.owner==='P' && parent.level>=1 && adjacentToOwned(s.id));
    }
    return hasTech('survey') && sameCluster(s) && (s.kind==='planet' || s.kind==='belt');
  }
  function canColonize(s){
    if(!s || !s.explored || s.owner) return false;
    if(s.kind==='moon'){
      const parent=system(s.parent);
      if(parent && parent.body!=='home' && !(parent.owner==='P' && parent.level>=1)) return false;
    }
    if(s.cluster!==0) return hasTech('warpDrive') && adjacentToOwned(s.id);
    return adjacentToOwned(s.id) || sameCluster(s);
  }
  function canInvade(s){
    if(!s || !s.owner || s.owner==='P' || faction(s.owner).eliminated || !hasTech('warpDrive')) return false;
    const p=player();
    if(s.homeOf && s.homeOf!== 'P') return homeInvasionReasons(s,'P').length===0;
    if(p.charge<1) return false;
    // Enemy systems must be approached through non-home targets first. Without a bridgehead, only outer non-home bodies may be attacked.
    if(s.cluster!==0){
      const bridge=ownedInCluster('P',s.cluster).filter(x=>!x.homeOf).length;
      if(bridge===0 && (s.homeOf || s.kind==='star')) return false;
    }
    return true;
  }
  function yieldText(s){ const y=systemYield(s); return RESOURCE_ORDER.filter(k=>y[k]).map(k=>`${RESOURCES[k].label}${signFmt(y[k])}`).join(' / ') || 'なし'; }
  function systemYield(s){
    const out={...RESOURCE_BASE}; if(!s.owner) return out; const base={...(BODY_TYPES[s.body]?.yields||{})}; const owner=faction(s.owner);
    let mult = s.kind==='star' ? (1+s.level*.30) : (s.level===0 ? .18 : .45 + s.level*.28 + Math.max(0,s.pop-1)*.045);
    if(s.body==='home') mult = 1 + s.level*.25 + Math.max(0,s.pop-1)*.055;
    Object.entries(base).forEach(([k,v]) => out[k] += Math.floor(v*mult));
    if(s.kind!=='star' && s.body!=='home'){
      let admin = owner.techs.includes('colonyAdmin') ? .65 : 1;
      if(owner.techs.includes('hydroponics')) admin *= .88;
      if(owner.techs.includes('geneClinics')) admin *= .84;
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
    if(owner.techs.includes('tradePort')) out.credits=Math.floor(out.credits*1.20);
    if(owner.techs.includes('creditClearing')) out.credits=Math.floor(out.credits*1.18);
    if(owner.techs.includes('civilRegistry')) out.influence=Math.floor(out.influence*1.15);
    if(owner.techs.includes('lunarSurvey') && ['moon','belt'].includes(s.body)) out.materials=Math.floor(out.materials*1.15);
    if(owner.techs.includes('miningGuild') && ['desert','volcanic','belt'].includes(s.body)) out.materials=Math.floor(out.materials*1.25);
    if(owner.techs.includes('deepCoreExtraction') && ['desert','volcanic','belt'].includes(s.body)) out.materials=Math.floor(out.materials*1.20);
    if(owner.techs.includes('fusionGrid') && ['star','volcanic','gas'].includes(s.body)) out.energy=Math.floor(out.energy*1.25);
    if(owner.techs.includes('planetaryAcademies') && s.pop>=4) out.research=Math.floor(out.research*1.18);
    if(owner.techs.includes('livingCities') && s.pop>=4){ out.food=Math.floor(out.food*1.14); out.influence=Math.floor(out.influence*1.10); }
    if(owner.techs.includes('academicSatellites') && ['moon','ice'].includes(s.body)) out.research=Math.floor(out.research*1.18);
    if(owner.techs.includes('oreSorting') && ['moon','belt','desert'].includes(s.body)) out.materials=Math.floor(out.materials*1.12);
    if(owner.techs.includes('solarCollectors') && s.kind==='star') out.energy=Math.floor(out.energy*1.18);
    if(owner.techs.includes('resourceFutures')) out.credits=Math.floor(out.credits*1.08);
    if(owner.techs.includes('populationLogistics') && s.pop>=2){ out.food=Math.floor(out.food*1.08); out.influence=Math.floor(out.influence*1.06); }
    if(owner.techs.includes('nebulaHarvesting') && ['crystal','gas','star'].includes(s.body)){ out.energy=Math.floor(out.energy*1.12); out.crystal=Math.floor(out.crystal*1.12); }
    if(owner.techs.includes('megaFoundries')) out.materials=Math.floor(out.materials*1.10);
    if(owner.techs.includes('tariffUnion')) out.credits=Math.floor(out.credits*1.12);
    if(owner.techs.includes('stellarDominion') && s.kind==='star') out.energy=Math.floor(out.energy*1.20);
    // Generic branch effects ensure expanded research nodes continue to affect core variables.
    const sci=techCount(s.owner,'science'), ind=techCount(s.owner,'industry'), eco=techCount(s.owner,'economy'), bioT=techCount(s.owner,'bio'), voidT=techCount(s.owner,'void'), exp=techCount(s.owner,'explore'), warp=techCount(s.owner,'warp');
    if(out.research>0) out.research=Math.floor(out.research*(1+sci*.018));
    if(out.materials>0) out.materials=Math.floor(out.materials*(1+ind*.016));
    if(out.credits>0) out.credits=Math.floor(out.credits*(1+eco*.018));
    if(out.food>0) out.food=Math.floor(out.food*(1+bioT*.016));
    if(out.crystal>0) out.crystal=Math.floor(out.crystal*(1+voidT*.018));
    if(out.influence>0) out.influence=Math.floor(out.influence*(1+exp*.012+eco*.006));
    if(out.energy>0) out.energy=Math.floor(out.energy*(1+warp*.014));
    return out;
  }
  function totalIncome(fid){ const out={...RESOURCE_BASE}; owned(fid).forEach(s=>{ const y=systemYield(s); Object.entries(y).forEach(([k,v])=>out[k]+=v); }); return out; }
  function ownedInCluster(fid, clusterId){ return owned(fid).filter(s=>s.cluster===clusterId); }
  function averageDevelopment(fid){ const o=owned(fid).filter(s=>s.kind!=='star'); return o.length ? o.reduce((a,s)=>a+s.level,0)/o.length : 0; }
  function adminTechCount(fid){ const f=faction(fid); return ['colonyAdmin','logistics','civilRegistry','sectorCapital','autonomousColonies','grandLogistics','galaxyLogistics'].filter(id=>f.techs.includes(id)).length; }
  function t4TechCount(fid){ const f=faction(fid); return TECHS.filter(t=>(t.tier||1)>=4 && f.techs.includes(t.id)).length; }
  function researchBaseCount(fid){ return owned(fid).filter(s=>s.level>=2 && ['home','ice','relic','crystal'].includes(s.body)).length; }
  function effectiveControl(fid){
    const all=state.systems.filter(s=>s.owner || s.explored || s.kind==='star' || s.kind==='planet' || s.kind==='moon' || s.kind==='belt');
    const scoreOf=(s)=>{
      if(s.body==='home') return 1.5;
      if(s.kind==='star') return 1.2;
      if(s.level<=0) return 0.4;
      if(s.level===1) return 0.7;
      if(s.level===2) return 1.0;
      return 1.2;
    };
    const total=all.reduce((a,s)=>a+scoreOf(s),0)||1;
    let mine=all.filter(s=>s.owner===fid).reduce((a,s)=>a+scoreOf(s),0);
    const inc=totalIncome(fid);
    const red = ['food','energy','influence'].some(k=>(inc[k]||0)<=-10);
    if(red) mine*=0.88;
    const drag=Math.max(.72, 1-(Math.max(0,owned(fid).length-18)*.008));
    return {score:mine*drag,total,rate:(mine*drag)/total,red};
  }
  function dominationReasons(fid){
    const f=faction(fid), eff=effectiveControl(fid), inc=totalIncome(fid), avg=averageDevelopment(fid), reasons=[];
    if(state.turn<VICTORY_TURN) reasons.push(`Turn${VICTORY_TURN}以降に判定`);
    if(eff.rate<DOMINATION_THRESHOLD) reasons.push(`有効支配率 ${Math.round(eff.rate*100)}% / 60%`);
    if(avg<1.8) reasons.push(`平均開発Lv ${avg.toFixed(1)} / 1.8`);
    if(adminTechCount(fid)<4) reasons.push(`行政系技術 ${adminTechCount(fid)} / 4`);
    ['food','energy','influence'].forEach(k=>{ if((inc[k]||0)<=-8) reasons.push(`${RESOURCES[k].label}赤字 ${signFmt(inc[k])}/T`); });
    return reasons;
  }
  function techVictoryReasons(fid){
    const f=faction(fid), inc=totalIncome(fid), reasons=[];
    const hasFinal=f.techs.some(id=>TECHS.find(t=>t.id===id)?.final);
    if(state.turn<VICTORY_TURN) reasons.push(`Turn${VICTORY_TURN}以降に判定`);
    if(!hasFinal) reasons.push('最終技術が未完成');
    if(researchBaseCount(fid)<3) reasons.push(`研究拠点 ${researchBaseCount(fid)} / 3`);
    if((inc.energy||0)<24) reasons.push(`電力収入 ${signFmt(inc.energy||0)}/T / +24/T`);
    if((inc.crystal||0)<8) reasons.push(`結晶収入 ${signFmt(inc.crystal||0)}/T / +8/T`);
    if(t4TechCount(fid)<3) reasons.push(`T4以上研究 ${t4TechCount(fid)} / 3`);
    return reasons;
  }
  function finalResearchReasons(t, fid='P'){
    if(!t?.final) return [];
    const f=faction(fid), inc=totalIncome(fid), reasons=[];
    if(state.turn<VICTORY_TURN) reasons.push(`最終技術はTurn${VICTORY_TURN}以降`);
    if(researchBaseCount(fid)<3) reasons.push(`研究拠点が不足 ${researchBaseCount(fid)}/3`);
    if((inc.energy||0)<24) reasons.push(`電力収入が不足 ${signFmt(inc.energy||0)}/T`);
    if((inc.crystal||0)<8) reasons.push(`結晶収入が不足 ${signFmt(inc.crystal||0)}/T`);
    if(t4TechCount(fid)<3) reasons.push(`T4以上研究が不足 ${t4TechCount(fid)}/3`);
    return reasons;
  }
  function siegeKeyFor(s){ return s?.homeOf || s?.owner || ''; }
  function siegeProgress(s){ return Math.min(100, Math.floor((state.sieges||{})[siegeKeyFor(s)]||0)); }
  function siegeCost(s){ const progress=siegeProgress(s); return {materials:34+Math.floor(progress*.18), energy:14+Math.floor(progress*.10), credits:18+Math.floor(progress*.12), influence:8}; }
  function canBesiege(s, attackerId='P'){
    if(!s || !s.homeOf || s.homeOf===attackerId || !s.owner || s.owner===attackerId) return false;
    const f=faction(attackerId); if(!f || f.eliminated) return false;
    if(!f.techs.includes('warpDrive') || (f.charge||0)<1) return false;
    const bridge=ownedInCluster(attackerId,s.cluster).filter(x=>!x.homeOf).length;
    return state.turn>=35 && bridge>=1 && siegeProgress(s)<100;
  }
  function homeInvasionReasons(s, attackerId='P'){
    const f=faction(attackerId), reasons=[];
    if(!s || !s.homeOf || s.homeOf===attackerId) return ['母星対象ではありません'];
    if(state.turn<VICTORY_TURN) reasons.push(`母星攻略はTurn${VICTORY_TURN}以降`);
    if(!f.techs.includes('warpDrive')) reasons.push('ワープ航法が必要');
    if(!f.techs.includes('capitalProtocol')) reasons.push('首都継承令が必要');
    if(!(f.techs.includes('marines') || f.techs.includes('siegeDoctrine'))) reasons.push('降下軍団または要塞攻略教範が必要');
    const bridge=ownedInCluster(attackerId,s.cluster).filter(x=>!x.homeOf).length;
    if(bridge<3) reasons.push(`対象星系の橋頭堡 ${bridge}/3`);
    const starHeld=system(faction(s.homeOf)?.star)?.owner===attackerId;
    if(!starHeld && bridge<1) reasons.push('恒星または外縁拠点の制圧が必要');
    if(siegeProgress(s)<100) reasons.push(`包囲進捗 ${siegeProgress(s)}/100`);
    if((f.charge||0)<HOME_INVASION_CHARGE) reasons.push(`恒星チャージ ${f.charge||0}/${HOME_INVASION_CHARGE}`);
    const pv=battlePreview(f,faction(s.owner),s);
    if(pv.attack < pv.defense*.82) reasons.push(`戦力不足 攻${pv.attack}/防${pv.defense}`);
    return reasons;
  }
  function systemAdvice(s){
    if(s.kind==='star') return hasTech('stellarHarness') ? '恒星は星系間移動の充填拠点です。チャージを貯めるとワープ侵攻に使えます。' : '恒星は後で開発対象になります。恒星ハーネスを研究するとエネルギーチャージが可能になります。';
    if(!s.explored && s.kind==='moon') return '最初に探索できる範囲です。衛星で操作を覚え、資源基盤を作ります。';
    if(!s.explored) return hasTech('survey') ? '星系測量により、この惑星を探索できます。' : '星系測量を研究するまで、この惑星は本格探索できません。';
    if(s.owner==='P' && s.level<2 && s.body!=='home') return '植民地はまだ立ち上げ段階です。人口維持で赤字が出やすいため、開発して黒字化しましょう。';
    if(s.owner==='P') return '自領です。開発を進めるほど収支と防衛が強くなります。';
    if(s.owner && s.owner!=='P' && s.homeOf){ const rs=homeInvasionReasons(s,'P'); return rs.length?`敵母星です。攻略条件：${rs.slice(0,4).join(' / ')}${rs.length>4?' ほか':''}`:`敵母星攻略条件を満たしています。戦闘プレビューを確認して侵攻できます。`; }
    if(s.owner && s.owner!=='P') return `敵領です。防衛は${DEFENSES[s.defenseType]?.name}。非母星の外縁拠点を奪って橋頭堡を作り、母星包囲へ進みます。`;
    return '探索済みの中立天体です。植民すると領土になりますが、最初は維持費が重くなります。';
  }

  function exploreCost(){ return {influence: hasTech('survey') ? 3 : 4}; }
  function colonizeCost(){ let discount=(hasTech('terraform')||hasTech('charter'))?.82:1; ['outpostProtocols','migrationShips','autonomousColonies','symbioticHabitats'].forEach(id=>{ if(hasTech(id)) discount*=.92; }); discount*=Math.pow(.985, techCount('P','explore')+techCount('P','bio')); return {materials:Math.round(22*discount), influence:Math.round(10*discount), food:Math.max(2,Math.round(5*discount))}; }
  function developCost(s){
    const level=Math.max(0, s?.level || 0);
    let materials = 24 + level * 10;
    let energy = level >= 2 ? 4 + level : 0;
    let research = level >= 3 ? 4 + level * 2 : 0;
    if(s?.kind === 'planet') materials += 6;
    if(s?.kind === 'belt') materials += 4;
    if(s?.body === 'home') materials += 10 + level * 4;
    if(['gas','crystal','relic'].includes(s?.body)) energy += 2 + level;
    let discount = 1;
    ['orbitalIndustry','nanoforge','modularFoundries','planetaryLogistics'].forEach(id => { if(hasTech(id)) discount *= .90; });
    if(hasTech('orbitalElevators') && (s?.pop || 0) >= 3) discount *= .92;
    discount *= Math.pow(.992, techCount('P','industry'));
    const cost = {materials:Math.max(8, Math.round(materials * discount))};
    if(energy > 0) cost.energy = Math.max(1, Math.round(energy * discount));
    if(research > 0) cost.research = Math.max(1, Math.round(research * discount));
    return cost;
  }
  function starChargeCost(s){ let energy=18+s.level*5, crystal=s.level>1?1:0; ['solarCollectors','fuelDepots','dysonFrames','stellarDominion'].forEach(id=>{ if(hasTech(id)) energy=Math.max(5,Math.round(energy*.88)); }); if(hasTech('wormholeMath')) crystal=Math.max(0, crystal-1); return {energy, crystal}; }
  function upgradeCost(id){ const u=UPGRADES[id]; const lv=player().upgrades[id]||0; const out={}; Object.entries(u.cost).forEach(([k,v])=>out[k]=Math.round(v*(1+lv*.55))); return out; }

  
  function milestone(kind, obj){
    if(!state.milestones) state.milestones={};
    const key=`${kind}:${obj?.id||obj?.name||''}:${state.turn}`;
    if(state.milestones[key]) return;
    state.milestones[key]=true;
    const rivals=state.factions.filter(f=>f.id!=='P'&&!f.eliminated);
    if(!rivals.length) return;
    const f=rivals[(state.turn + (obj?.id||0)) % rivals.length];
    const persona=CPU_PERSONAS[f.doctrine] || {};
    if(kind==='research') addLog(`${f.name}通信：${persona.quote||'その技術、こちらも観測している。'}`, 'warn');
    if(kind==='build') addLog(`${f.name}通信：艦隊を増やしたな。補給線を守れるか見ものだ。`, 'warn');
    if(kind==='develop' && obj?.level>=3) addLog(`${f.name}通信：${obj.name}の開発が進んだ。次は防衛まで見せてもらおう。`, 'warn');
  }
function handleAction(action,arg){ if(!tutorialAllows(action,arg)){ toast('チュートリアル中は、表示された手順だけ実行できます。'); return; } const before=state.tutorial.step; const ok = ({explore,colonize,develop,fortify,chargeStar,besiege,invade,buildShip,upgrade,research}[action] || (()=>false))(arg); if(ok) afterTutorialAction(action,arg); render(); }
  function consumeAp(){ if(state.ap<=0){ toast('APが足りません。ターン終了で回復します。'); return false; } state.ap--; return true; }
  function explore(){ const s=selectedSystem(); if(!canExplore(s)) return toast('この天体はまだ探索できません。衛星は最初から、別惑星は星系測量後に探索できます。'); const cost=exploreCost(s); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); s.explored=true; s.locked=false; addLog(`${s.name}を探索。${BODY_TYPES[s.body].name}を発見。`, 'good'); return true; }
  function colonize(){ const s=selectedSystem(), cost=colonizeCost(); if(!canColonize(s)) return toast('植民できるのは探索済みの中立天体です。'); if(!canPayFlexible(cost,'P','colonize')) return toast(`資源不足：${costText(cost)}${hasTech('charter')?'（開拓勅許により不足資材は信用で補えます）':''}`); if(!consumeAp()) return false; payFlexible(cost,'P','colonize'); s.owner='P'; s.level=0; s.pop=1.0; s.defense=Math.max(s.defense,8); s.explored=true; addLog(`${s.name}へ植民。立ち上げ期のため維持費に注意。`, 'good'); return true; }
  function develop(){
    const s=selectedSystem();
    if(!s || s.owner!=='P' || s.kind==='star') return toast('通常開発できるのは自領の惑星・衛星・小惑星です。');
    if(s.kind==='moon'){
      const parent=system(s.parent);
      if(parent && parent.body!=='home' && !(parent.owner==='P' && parent.level>=1)) return toast('衛星開発には、親惑星の保有と開発Lv1以上が必要です。');
    }
    if(s.level>=MAX_DEVELOPMENT) return toast(`開発Lvは最大${MAX_DEVELOPMENT}です。防衛強化や別天体の開発にAPを使ってください。`);
    const cost=developCost(s); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); s.level++; s.pop += hasTech('bio') ? .9 : .55; s.defense += hasTech('defenseGrid') ? 5 : 3; milestone('develop', s); addLog(`${s.name}を開発。収支と防衛が改善。`, 'good'); return true;
  }
  function canFortify(s){ return !!(s && s.owner==='P' && s.kind!=='star' && s.explored); }
  function fortifyCost(s){ const lv=Math.max(0, Math.floor((s?.defense||0)/10)); let mult=1+lv*.22; if(hasTech('defenseDrills')) mult*=.90; if(hasTech('fortressWorlds')) mult*=.85; return {materials:Math.round(18*mult), energy:Math.round(5*mult), research:Math.round(4*mult)}; }
  function fortify(){ const s=selectedSystem(); if(!canFortify(s)) return toast('防衛強化できるのは自領の惑星・衛星・小惑星です。'); const cost=fortifyCost(s); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); const bonus=6 + (hasTech('planetaryGuns')?3:0) + (hasTech('shieldTheory')?2:0) + (hasTech('livingShield')?Math.floor(s.pop):0); s.defense += bonus; addLog(`${s.name}の防衛を強化。防衛+${bonus}。`, 'good'); return true; }
  function chargeStar(){ const s=selectedSystem(); if(!s || s.kind!=='star' || s.owner!=='P') return toast('恒星チャージは自領恒星で実行します。'); const cost=starChargeCost(s); if(!hasTech('stellarHarness')) return toast('恒星ハーネスが必要です。'); if(player().charge >= player().maxCharge + s.level) return toast('チャージ上限です。'); if(!canPayFlexible(cost,'P','starCharge')) return toast(`資源不足：${costText(cost)}${hasTech('energyMarket')?'（恒星市場により不足電力は信用で補えます）':''}`); if(!consumeAp()) return false; payFlexible(cost,'P','starCharge'); player().charge++; s.level++; addLog(`${s.name}でワープ用エネルギーを充填。充填${player().charge}/${player().maxCharge+s.level}`, 'good'); return true; }
  function besiege(){
    const s=selectedSystem();
    if(!canBesiege(s,'P')) return toast('包囲には敵星系内の橋頭堡、ワープ航法、恒星チャージが必要です。');
    const cost=siegeCost(s);
    if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`);
    if(!consumeAp()) return false;
    pay(cost); player().charge=Math.max(0,player().charge-1);
    const bonus=SIEGE_STEP_BASE + (hasTech('siegeDoctrine')?8:0) + (hasTech('marines')?5:0) + Math.min(10,ownedInCluster('P',s.cluster).length*2);
    const key=siegeKeyFor(s); state.sieges[key]=Math.min(100,(state.sieges[key]||0)+bonus);
    addLog(`${s.name}への包囲を進行。包囲${state.sieges[key]}/100。`, 'warn');
    return true;
  }
  function buildShip(id){ if(state.tutorial.active && state.tutorial.step<6) return toast('艦船建造はチュートリアル2ターン目で扱います。'); const ship=SHIPS[id]; if(!ship) return false; let cost={...ship.cost}; if(hasTech('dock')) Object.keys(cost).forEach(k=>cost[k]=Math.round(cost[k]*.9)); if(hasTech('shipFoundry')) Object.keys(cost).forEach(k=>cost[k]=Math.round(cost[k]*.9)); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); player().ships[id]=(player().ships[id]||0)+1; milestone('build', ship); addLog(`${ship.name}を建造。`, 'good'); return true; }
  function upgrade(id){ const u=UPGRADES[id]; if(!u) return false; const cost=upgradeCost(id); if(!canPay(cost)) return toast(`資源不足：${costText(cost)}`); if(!consumeAp()) return false; pay(cost); player().upgrades[id]=(player().upgrades[id]||0)+1; addLog(`艦隊${u.name}をLv.${player().upgrades[id]}へ強化。`, 'good'); return true; }
  function research(id){ const t=TECHS.find(x=>x.id===id); if(!t) return false; const p=player(); if(p.techs.includes(id)) return false; if((t.req||[]).some(r=>!p.techs.includes(r))) return toast('前提技術が未取得です。'); const finalReasons=finalResearchReasons(t,'P'); if(finalReasons.length) return toast(`最終技術の条件未達：${finalReasons.join(' / ')}`); if(p.resources.research<t.cost) return toast('研究が足りません。'); if(!consumeAp()) return false; p.resources.research-=t.cost; p.techs.push(id); milestone('research', t); if(id==='logistics') state.maxAp=Math.max(state.maxAp,4); if(id==='grandLogistics') state.maxAp=Math.max(state.maxAp,5); if(id==='jointCommand') state.maxAp=Math.max(state.maxAp,5); if(id==='galaxyLogistics') state.maxAp=Math.max(state.maxAp,6); if(id==='stellarHarness') p.maxCharge=2; if(id==='warpDrive') p.maxCharge=Math.max(p.maxCharge,3); if(id==='fuelDepots') p.maxCharge=Math.max(p.maxCharge,4); if(id==='dysonFrames') p.maxCharge=Math.max(p.maxCharge,5); if(id==='stellarDominion') p.maxCharge=Math.max(p.maxCharge,6); addLog(`技術「${t.name}」を取得。`, t.final?'good':''); return true; }
  function battlePreview(attacker, defender, target){
    const atkStats=fleetStats(attacker), defStats=fleetStats(defender);
    const defense=defenseScore(target, defender);
    let attack=atkStats.attack+atkStats.power*.38;
    if(attacker.techs?.includes('marines')) attack*=1.25;
    if(attacker.techs?.includes('siegeDoctrine')) attack*=1.12;
    const matchup=matchupBonus(target, attacker);
    attack*=matchup.mult;
    const min=attack*.80, max=attack*1.25;
    const winChance = max<=defense ? 8 : min>=defense ? 92 : Math.round(((max-defense)/(max-min))*84+8);
    return {attack:Math.round(attack), defense, winChance:clamp(winChance,5,95), matchup, atkStats, defStats};
  }
  function showInvasionPreview(s){
    const enemy=faction(s.owner), pv=battlePreview(player(), enemy, s);
    const danger = pv.winChance<45 ? 'bad' : pv.winChance<70 ? 'warn' : 'good';
    showModal(`<h2>侵攻確認：${s.name}</h2><section class="panel-section battle-preview ${danger}"><h3>推定勝率 ${pv.winChance}%</h3><div class="mini-grid"><div class="stat-card"><small>自軍攻撃</small><b>${pv.attack}</b></div><div class="stat-card"><small>敵防衛</small><b>${pv.defense}</b></div><div class="stat-card"><small>敵施設</small><b>${DEFENSES[s.defenseType]?.name||'不明'}</b></div><div class="stat-card"><small>相性</small><b>${pv.matchup.text}</b></div></div><p>失敗すると艦隊が大きく損耗します。母星はTurn50以降・橋頭堡・包囲・首都技術を満たした場合のみ攻略できます。母星攻略に成功すると、その帝国は敗退し残存拠点を接収します。</p></section><div class="confirm-actions"><button class="primary-btn" data-action="invade" data-arg="confirm" type="button">侵攻を実行</button><button class="ghost-btn" id="cancelInvasion" type="button">やめる</button></div>`, true);
    bindActionButtons($('modalBody'));
    const cancel=$('cancelInvasion'); if(cancel) cancel.onclick=()=>$('infoModal').close();
    return true;
  }
  function invade(arg){
    const s=selectedSystem();
    if(!canInvade(s)) return toast('侵攻にはワープ航法と恒星チャージが必要です。');
    if(arg!=='confirm') return showInvasionPreview(s);
    if(!consumeAp()) return false;
    player().charge=Math.max(0, player().charge-(s.homeOf?HOME_INVASION_CHARGE:1));
    $('infoModal').close();
    return executeInvasion('P', s.id, {playerAttack:true});
  }
  function executeInvasion(attackerId, targetId, opts={}){
    const attacker=faction(attackerId), s=system(targetId), defender=faction(s.owner);
    if(!attacker || !s || !defender || attacker.id===defender.id) return false;
    const pv=battlePreview(attacker, defender, s);
    const roll=.80+Math.random()*.45;
    const success=pv.attack*roll>pv.defense;
    if(success){
      const oldOwner=s.owner, oldName=defender.name;
      s.owner=attacker.id; s.explored = attacker.id==='P' ? true : s.explored; s.defense=Math.max(7,Math.round(s.defense*.58));
      loseShips(attacker, opts.cpu ? .14 : .18);
      if(s.homeOf && s.homeOf!==attacker.id){
        if(s.homeOf==='P'){
          eliminateEmpire(player(), attacker.id);
          setDefeat('母星陥落', `${attacker.name}が${s.name}を制圧しました。母星を失ったため敗北です。`);
          return {success:true, text:`${attacker.name}があなたの母星を制圧。帝国は崩壊した。`, home:true};
        }
        eliminateEmpire(defender, attacker.id);
        if(attacker.id==='P') addLog(`${oldName}の母星を制圧。帝国は敗退し、残存拠点を接収した。`, 'good');
        return {success:true, text:`${attacker.name}が${oldName}の母星を制圧し、残存拠点を接収。`, home:true};
      }
      const line=`${attacker.name}が${oldName}領${s.name}を制圧。${pv.matchup.text}`;
      if(attacker.id==='P') addLog(line, 'good');
      return {success:true, text:line};
    }
    loseShips(attacker, opts.cpu ? .28 : .36);
    const line=`${attacker.name}の${s.name}侵攻は失敗。${DEFENSES[s.defenseType]?.name||'防衛'}を突破できず艦隊が損耗。`;
    if(attacker.id==='P') addLog(line, 'bad');
    return {success:false, text:line};
  }
  function defenseScore(s, enemy){ const es=fleetStats(enemy); let def=s.defense*2.4 + es.shield*.55 + es.power*.20; if(s.homeOf) def+=90; if(s.kind==='star') def+=38; if(enemy.techs.includes('planetaryGuns')) def*=1.18; if(enemy.techs.includes('livingShield')) def*=1 + Math.min(.35,s.pop*.02); if(enemy.techs.includes('fortressWorlds')) def*=1.12; if(enemy.techs.includes('defenseSingularity')) def*=1.12; return Math.round(def); }
  function matchupBonus(s, attacker=player()){
    const type=s.defenseType, ships=attacker?.ships||{}, upgrades=attacker?.upgrades||{};
    if(type==='armor' && (ships.destroyer||0)>0) return {mult:1.18,text:'駆逐艦が装甲要塞に有効'};
    if(type==='flak' && (ships.carrier||0)>0) return {mult:1.18,text:'空母が迎撃網に有効'};
    if(type==='shield' && (upgrades.weapons||0)>0) return {mult:1.10+.04*upgrades.weapons,text:'武器強化が惑星シールドに有効'};
    return {mult:1,text:'標準相性'};
  }
  function loseShips(f, ratio){ ['scout','frigate','destroyer','carrier'].forEach(k=>{ const n=f.ships[k]||0; if(n>0 && Math.random()<ratio) f.ships[k]=Math.max(0,n-1); }); }
  function eliminateEmpire(enemy, newOwner='P'){
    if(!enemy) return;
    enemy.eliminated=true;
    state.systems.forEach(s=>{ if(s.owner===enemy.id){ s.owner=newOwner; if(newOwner==='P') s.explored=true; } });
  }
  function checkDefeat(){
    if(!state || state.defeat?.shown) return !!state?.defeat;
    const home=system(player()?.home);
    if(state.defeat || !home || home.owner!=='P' || owned('P').length===0){
      const d=state.defeat || {title:'敗北', text:'あなたの母星を失いました。'};
      setDefeat(d.title, d.text);
      return true;
    }
    return false;
  }
  function setDefeat(title,text){
    state.defeat={title,text,shown:true};
    showModal(`<h2>敗北：${title}</h2><p>${text}</p><p>敵CPUは実際に領土を奪います。次は序盤から防衛強化、艦隊建造、恒星チャージを意識して再挑戦しましょう。</p><div class="victory-actions"><button id="defeatNew" class="primary-btn" type="button">タイトルへ戻る</button><button id="defeatInspect" class="ghost-btn" type="button">銀河を見る</button></div>`, true);
    setTimeout(()=>{ const n=$('defeatNew'), i=$('defeatInspect'); if(n) n.onclick=()=>{ state=null; $('infoModal').close(); showScreen('title'); }; if(i) i.onclick=()=>{$('infoModal').close();}; },0);
  }


  function endTurn(arg){
    if(!tutorialAllows('endTurn')) return toast('今はガイドされた操作を先に行ってください。');
    if(arg!=='confirm' && !state.tutorial.active && state.ap>0){
      showModal(`<h2>ターン終了確認</h2><p>APが${state.ap}残っています。このままターンを終了しますか？</p><div class="confirm-actions"><button id="confirmEndTurn" class="primary-btn" type="button">終了する</button><button id="cancelEndTurn" class="ghost-btn" type="button">戻る</button></div>`);
      $('confirmEndTurn').onclick=()=>{ $('infoModal').close(); endTurn('confirm'); };
      $('cancelEndTurn').onclick=()=>$('infoModal').close();
      return;
    }
    addRes(totalIncome('P'),'P'); growOwned('P'); const events=cpuTurn(); state.turn++; state.ap=state.maxAp;
    if(state.tutorial.active){ if(state.tutorial.step===4){ state.tutorial.step=5; addRes({research:18,materials:30,energy:16,credits:12},'P'); } else if(state.tutorial.step===8){ state.tutorial.step=9; state.selectedId=3; centerOn(system(3),1.95); addRes({materials:35,influence:20,food:12},'P'); } else if(state.tutorial.step===13){ completeTutorial(); } }
    state.replay=events; replayIndex=0; addLog(`ターン${state.turn}開始。資源収入を獲得。`, ''); if(!events.length) focusNextActionTarget(); render();
  }
  function growOwned(fid){ owned(fid).forEach(s=>{ if(s.kind!=='star' && (faction(fid).resources.food||0)>10 && s.pop<14) s.pop += faction(fid).techs.includes('bio') ? .32 : .18; }); }
  function cpuTurn(){
    const events=[];
    state.factions.filter(f=>f.id!=='P'&&!f.eliminated).forEach(f=>{
      const inc=totalIncome(f.id); Object.keys(inc).forEach(k=>inc[k]=Math.ceil(inc[k]*1.65 + (k==='research'?10:k==='materials'?12:k==='energy'?9:4)));
      addRes(inc,f.id); growOwned(f.id);
      const turns = state.turn>10 ? 4 : state.turn>5 ? 3 : 2;
      for(let i=0;i<turns;i++){ const action=chooseCpuAction(f); if(action) events.push(action); }
    });
    return events;
  }
  function chooseCpuAction(f){
    const my=owned(f.id); if(my.length===0){ f.eliminated=true; return null; }
    const persona=CPU_PERSONAS[f.doctrine] || {};
    const candidates=state.systems.filter(s=>s.cluster===f.cluster && !s.owner);
    const unknown=candidates.find(s=>!s.explored && (s.kind!=='moon' || !s.parent || system(s.parent)?.owner===f.id || system(s.parent)?.homeOf===f.id));
    const neutral=candidates.find(s=>s.explored);
    const pTargets=state.systems.filter(s=>s.owner==='P');
    if(state.turn>8 && f.techs.includes('warpDrive') && (f.charge||0)>0 && pTargets.length && fleetStats(f).power>Math.max(28, fleetStats(player()).power*.40)){
      const playerHome=system(player().home);
      const nonHome=pTargets.filter(s=>!s.homeOf).sort((a,b)=> (a.defense-b.defense) || (a.level-b.level));
      let target=null;
      // Before Turn50 CPUs harass outer colonies only. After Turn50 they may besiege and attack the home if they satisfy the same strategic gates.
      if(state.turn>=VICTORY_TURN && playerHome && homeInvasionReasons(playerHome,f.id).length===0){ target=playerHome; }
      else if(state.turn>=35 && playerHome && canBesiege(playerHome,f.id)){
        const key=siegeKeyFor(playerHome); state.sieges[key]=Math.min(100,(state.sieges[key]||0)+SIEGE_STEP_BASE+6);
        f.charge=Math.max(0,(f.charge||0)-1);
        return {fid:f.id,sid:playerHome.id,text:`${f.name}があなたの母星包囲を進行。包囲${state.sieges[key]}/100。${persona.quote||''}`,type:'siege'};
      }
      else target=nonHome[0];
      if(target){
        f.charge=Math.max(0,(f.charge||0)-(target.homeOf?HOME_INVASION_CHARGE:1));
        const result=executeInvasion(f.id, target.id, {cpu:true});
        return {fid:f.id,sid:target.id,text:`${result.text} ${persona.quote||''}`,type:result.success?'invasion':'raid'};
      }
    }
    const techs=availableTechs(f.id).filter(t=>!f.techs.includes(t.id) && (t.req||[]).every(r=>f.techs.includes(r)) && finalResearchReasons(t,f.id).length===0).sort((a,b)=>a.cost-b.cost);
    const preferred = f.ai==='war' ? ['dock','marines','battleAI','warpDrive','siegeDoctrine'] : f.ai==='research' ? ['laser','quantumLabs','stellarHarness','warpDrive','sensorLattice'] : f.ai==='trade' ? ['bank','tradePort','charter','resourceFutures'] : ['bio','hydroponics','colonyAdmin','terraform','defenseGrid'];
    const choice = techs.find(t=>preferred.includes(t.id) && f.resources.research>=t.cost) || techs.find(t=>f.resources.research>=t.cost);
    if(choice){ f.resources.research-=choice.cost; f.techs.push(choice.id); if(choice.id==='stellarHarness') f.maxCharge=Math.max(f.maxCharge,2); if(choice.id==='warpDrive') f.maxCharge=Math.max(f.maxCharge,3); return {fid:f.id,sid:f.star,text:`${f.name}が「${choice.name}」を研究。${persona.quote||''}`,type:'research'}; }
    if(unknown && f.resources.influence>=4){ f.resources.influence-=4; unknown.explored=true; return {fid:f.id,sid:unknown.id,text:`${f.name}が${unknown.name}を探索。`,type:'explore'}; }
    if(neutral && f.resources.materials>=22 && f.resources.influence>=10){ f.resources.materials-=22; f.resources.influence-=10; neutral.owner=f.id; neutral.level=0; neutral.pop=1; neutral.explored=true; return {fid:f.id,sid:neutral.id,text:`${f.name}が${neutral.name}へ植民。`,type:'colonize'}; }
    if(f.techs.includes('stellarHarness') && (f.charge||0)<(f.maxCharge||2) && f.resources.energy>=18){ f.resources.energy-=18; f.charge=(f.charge||0)+1; return {fid:f.id,sid:f.star,text:`${f.name}が恒星チャージを蓄積。`,type:'charge'}; }
    if(f.resources.materials>=52 && f.resources.energy>=13 && state.turn>5){ f.resources.materials-=52; f.resources.energy-=13; f.ships.destroyer=(f.ships.destroyer||0)+1; return {fid:f.id,sid:f.home,text:`${f.name}が駆逐艦を建造。`,type:'fleet'}; }
    if(f.resources.materials>=24){ const h=system(f.home); f.resources.materials-=24; if(h.level<MAX_DEVELOPMENT) h.level++; h.defense+=6; return {fid:f.id,sid:h.id,text:`${f.name}が母星防衛を強化。`,type:'develop'}; }
    return {fid:f.id,sid:f.home,text:`${f.name}は資源を蓄積。`,type:'wait'};
  }
  function renderReplay(){ const box=$('cpuReplay'); if(!state.replay||state.replay.length===0){ box.hidden=true; return; } box.hidden=false; const ev=state.replay[replayIndex]||state.replay[0]; centerOn(system(ev.sid), camera.zoom); box.innerHTML=`<h3>CPUターン ${replayIndex+1}/${state.replay.length}</h3><p>${ev.text}</p><div class="replay-actions"><button id="replayNext" type="button">${replayIndex<state.replay.length-1?'次の行動を見る':'次ターンへ'}</button><button id="replayClose" type="button">まとめて閉じる</button></div>`; $('replayNext').onclick=()=>{ if(replayIndex<state.replay.length-1){ replayIndex++; renderReplay(); draw(); } else { finishReplay(); } }; $('replayClose').onclick=finishReplay; }

  function empireHtml(){ const p=player(), fs=fleetStats(p), prod=totalIncome('P'); let html=`<section class="panel-section"><h2>あなたの帝国</h2><div class="mini-grid"><div class="stat-card"><small>保有天体</small><b>${owned('P').length}</b></div><div class="stat-card"><small>恒星充填</small><b>${p.charge}/${p.maxCharge}</b></div><div class="stat-card"><small>総合戦力</small><b>${fs.power}</b></div><div class="stat-card"><small>攻撃/防御</small><b>${fs.attack}/${fs.shield}</b></div></div><p class="yield-line">収入：${RESOURCE_ORDER.filter(k=>prod[k]).map(k=>`${RESOURCES[k].label}${signFmt(prod[k])}`).join(' / ')}</p></section><section class="panel-section"><h3>艦船を建造</h3>`; Object.entries(SHIPS).forEach(([id,s])=>{ html+=`<div class="ship-row"><img src="${icon(s.icon)}" alt=""><div><b>${s.name} × ${p.ships[id]||0}</b><span>${s.text}<br>戦力${s.power} / ${costText(s.cost)}</span></div><button class="pill ${canPay(s.cost)&&state.ap>0&&tutorialAllows('buildShip',id)?'good':''}" data-action="buildShip" data-arg="${id}" type="button">建造</button></div>`; }); html+=`</section><section class="panel-section"><h3>艦隊強化</h3>`; Object.entries(UPGRADES).forEach(([id,u])=>{ const c=upgradeCost(id); html+=`<div class="ship-row"><img src="${icon(u.icon)}" alt=""><div><b>${u.name} Lv.${p.upgrades[id]}</b><span>${u.text}<br>${costText(c)}</span></div><button class="pill ${canPay(c)&&state.ap>0&&tutorialAllows('upgrade',id)?'good':''}" data-action="upgrade" data-arg="${id}" type="button">強化</button></div>`; }); return html+`</section>`; }
  function techBranch(t){
    if(t.branch) return t.branch;
    if(t.final) return 'final';
    if(['survey','lunarSurvey','scoutNetworks','stellarCartography','outpostProtocols','deepSpaceScanners','migrationShips','autonomousColonies'].includes(t.id) || ['scout','colony'].includes(t.icon)) return 'explore';
    if(['orbitalIndustry','miningGuild','deepCoreExtraction','nanoforge','modularFoundries','orbitalElevators','megaFoundries'].includes(t.id) || t.icon==='industry' || t.icon==='materials') return 'industry';
    if(['stellarHarness','warpDrive','fusionGrid','warpBeacons','stellarCatapult','solarCollectors','fuelDepots','dysonFrames','stellarDominion'].includes(t.id) || t.icon==='energy') return 'warp';
    if(['dock','marines','battleAI','assaultCarriers','orbitalDrop','siegeDoctrine','conquestFleet','warEconomy'].includes(t.id) || ['fleet','attack'].includes(t.icon) || t.doctrine==='war') return 'military';
    if(['defenseGrid','planetaryGuns','shieldTheory','fortressWorlds','defenseSingularity','livingShield','phaseShield'].includes(t.id) || t.icon==='defense') return 'defense';
    if(['bank','tradePort','creditClearing','privateFleets','energyMarket','monopolyCharter','galacticMarket'].includes(t.id) || t.icon==='credits' || t.doctrine==='trade') return 'economy';
    if(['bio','hydroponics','geneClinics','livingCities','terraform','gaiaEngines'].includes(t.id) || ['food','population'].includes(t.icon) || t.doctrine==='eco') return 'bio';
    if(['relic','void','crystalCodex','phaseLances','voidPilgrimage','voidCrown'].includes(t.id) || ['crystal','espionage'].includes(t.icon) || t.doctrine==='mystic') return 'void';
    return 'science';
  }

  function techCount(fid, branch){ return availableTechs(fid).filter(t=>faction(fid)?.techs.includes(t.id) && (!branch || techBranch(t)===branch)).length; }
  function techTierSum(fid, branch){ return availableTechs(fid).filter(t=>faction(fid)?.techs.includes(t.id) && (!branch || techBranch(t)===branch)).reduce((a,t)=>a+(t.tier||1),0); }
  function researched(id){ const t=TECHS.find(x=>x.id===id); return t ? player().techs.includes(id) : false; }
  function techDependents(id){ return availableTechs('P').filter(t=>(t.req||[]).includes(id)); }
  function techEffectSummary(t){
    const b=techBranch(t);
    const map={
      explore:'探索範囲・植民コスト・星系運営に影響します。', industry:'開発コスト、資材産出、造船基盤に影響します。', science:'研究産出と上位技術の前提に影響します。', warp:'恒星チャージ、星系間移動、侵攻解放に影響します。', military:'艦隊戦力、建造効率、侵攻成功率に影響します。', defense:'惑星防衛、防衛施設、艦隊損耗に影響します。', economy:'信用収入と不足資源の補助に影響します。', bio:'食料・人口・植民地維持費に影響します。', void:'結晶・特殊航法・シールド系に影響します。', final:'勝利条件または最終級の統合効果に関係します。'
    };
    return map[b] || '研究・内政の基礎に影響します。';
  }
  function resourceRibbon(fid='P'){
    const f=faction(fid); const inc=totalIncome(fid);
    return `<div class="modal-resource-ribbon">${RESOURCE_ORDER.map(k=>`<span><img src="${icon(RESOURCES[k].icon)}" alt=""><b>${fmt(f.resources[k]||0)}</b><em>${signFmt(inc[k]||0)}/T</em></span>`).join('')}</div>`;
  }

  function techBranchMeta(b){
    return ({
      explore:{label:'探索', icon:'scout', tone:'cyan'},
      industry:{label:'工業', icon:'materials', tone:'steel'},
      science:{label:'研究', icon:'research', tone:'blue'},
      warp:{label:'恒星', icon:'energy', tone:'gold'},
      military:{label:'艦隊', icon:'fleet', tone:'red'},
      defense:{label:'防衛', icon:'defense', tone:'aqua'},
      economy:{label:'交易', icon:'credits', tone:'amber'},
      bio:{label:'生態', icon:'food', tone:'green'},
      void:{label:'虚空', icon:'crystal', tone:'purple'},
      final:{label:'最終', icon:'victory', tone:'white'}
    })[b] || {label:b, icon:'technology', tone:'blue'};
  }

  function researchOnlyRibbon(fid='P'){
    const f=faction(fid); const inc=totalIncome(fid); const k='research';
    return `<div class="research-ribbon"><span><img src="${icon(RESOURCES[k].icon)}" alt=""><b>${fmt(f.resources[k]||0)}</b><em>${signFmt(inc[k]||0)}/T</em></span></div>`;
  }

  function techHtml(){
    const p=player();
    const all=availableTechs('P').slice().sort((a,b)=>(techBranch(a).localeCompare(techBranch(b)))||((a.tier||1)-(b.tier||1))||(a.cost-b.cost)||a.name.localeCompare(b.name,'ja'));
    const branchIds=['explore','industry','science','warp','military','defense','economy','bio','void','final'];
    const tiers=[1,2,3,4,5];
    const done=all.filter(t=>p.techs.includes(t.id)).length;
    const canCount=all.filter(t=>!p.techs.includes(t.id) && (t.req||[]).every(r=>p.techs.includes(r)) && p.resources.research>=t.cost && state.ap>0).length;
    const nodeHtml=(t)=>{
      const b=techBranch(t), meta=techBranchMeta(b);
      const bought=p.techs.includes(t.id), locked=(t.req||[]).some(r=>!p.techs.includes(r));
      const can=!bought&&!locked&&p.resources.research>=t.cost&&state.ap>0&&tutorialAllows('research',t.id);
      const short=(techEffectSummary(t)||t.text||'').replace(/<[^>]+>/g,'').split('。')[0].slice(0,10);
      return `<button class="tech-mini-node ${meta.tone} ${bought?'done':locked?'locked':can?'can':'open'}" data-tech="${t.id}" type="button"><img src="${icon(t.icon||meta.icon)}" alt=""><b>${t.name}</b><span>${short}</span><em>研${t.cost}</em></button>`;
    };
    let html=`<section class="panel-section tech-intro compact v15"><h2>研究ツリー</h2><div class="tech-summary-row">${researchOnlyRibbon('P')}<b>${done}/${all.length}</b><span>研究済み</span><b>${canCount}</b><span>可</span></div><p>横に進むほど高位研究。項目をタップすると詳細・前提・解放先・実行ボタンを開きます。</p></section>`;
    html+=`<div class="tech-map-v15-wrap"><div class="tech-map-v15">`;
    html+=`<div class="tech-corner">分野</div>${tiers.map(t=>`<div class="tech-tier-head">T${t}</div>`).join('')}`;
    branchIds.forEach(b=>{
      const meta=techBranchMeta(b);
      html+=`<div class="tech-branch-head ${meta.tone}"><img src="${icon(meta.icon)}" alt=""><b>${meta.label}</b></div>`;
      tiers.forEach(tier=>{
        const list=all.filter(t=>techBranch(t)===b && (t.tier||1)===tier);
        html+=`<div class="tech-cell ${meta.tone}">${list.length?list.map(nodeHtml).join(''):'<span class="tech-empty">—</span>'}</div>`;
      });
    });
    return html+`</div></div>`;
  }
  function factionsHtml(){ const rows=[['総合',f=>factionScore(f.id)],['保有',f=>owned(f.id).length],['技術',f=>f.techs.length],['艦隊',f=>fleetStats(f).power],['攻撃',f=>fleetStats(f).attack],['防御',f=>fleetStats(f).shield],['収入',f=>RESOURCE_ORDER.reduce((a,k)=>a+(totalIncome(f.id)[k]||0),0)],['恒星',f=>`${f.charge||0}/${f.maxCharge||1}`],['状態',f=>f.eliminated?'敗退':f.id==='P'?'あなた':'活動']]; let html=`<section class="panel-section"><h2>勢力比較</h2><p>横にスワイプして各帝国を比較できます。総合は保有・収入・研究・艦隊を合算した目安です。</p></section><div class="faction-matrix"><table><thead><tr><th>項目</th>${state.factions.map(f=>`<th><button data-faction="${f.id}" type="button"><img src="${factionImage(f)}" alt=""><b>${f.id==='P'?'あなた':f.name}</b></button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><td>${label}</td>${state.factions.map(f=>`<td class="${f.eliminated?'bad':f.id==='P'?'you':''}">${fn(f)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; return html; }
  function logHtml(){ return `<section class="panel-section"><h2>銀河ログ</h2>${state.logs.map(l=>`<div class="log-line ${l.tone}">T${l.turn}: ${l.text}</div>`).join('')||'<p class="empty">まだログはありません。</p>'}</section>`; }
  function victoryProgressHtml(fid='P'){
    const eff=effectiveControl(fid), avg=averageDevelopment(fid), inc=totalIncome(fid), admin=adminTechCount(fid), bases=researchBaseCount(fid), t4=t4TechCount(fid);
    const dom=dominationReasons(fid), tech=techVictoryReasons(fid);
    const enemies=state.factions.filter(f=>f.id!=='P');
    const milRows=enemies.map(e=>{
      const home=system(e.home); const bridge=ownedInCluster(fid,e.cluster).filter(x=>!x.homeOf).length; const reasons=home?homeInvasionReasons(home,fid):['母星なし'];
      return `<tr><td>${e.name}</td><td>${e.eliminated?'撃破':'活動'}</td><td>${bridge}/3</td><td>${home?siegeProgress(home):0}/100</td><td>${reasons.length?reasons.slice(0,2).join(' / '):'攻略可'}</td></tr>`;
    }).join('');
    return `<section class="panel-section victory-panel"><h2>勝利ルート進捗</h2><p>全ルートはTurn${VICTORY_TURN}以降に決着します。Turn50までは準備・橋頭堡・統治・研究基盤を作る時間です。</p>
      <div class="route-grid"><div><b>内政</b><span>${Math.round(eff.rate*100)}%</span><small>平均Lv${avg.toFixed(1)} / 行政${admin}/4 / ${dom.length?dom[0]:'達成可'}</small></div><div><b>技術</b><span>${bases}/3拠点</span><small>T4 ${t4}/3 / 電力${signFmt(inc.energy||0)} / 結晶${signFmt(inc.crystal||0)} / ${tech.length?tech[0]:'達成可'}</small></div><div><b>軍事</b><span>${enemies.filter(e=>e.eliminated).length}/4母星</span><small>母星攻略は技術・橋頭堡・包囲・チャージが必要</small></div></div>
      <div class="codex-table"><table><thead><tr><th>対象</th><th>状態</th><th>橋頭堡</th><th>包囲</th><th>不足条件</th></tr></thead><tbody>${milRows}</tbody></table></div>
    </section>`;
  }
  function codexHtml(){
    const planetRows=Object.entries(BODY_TYPES).map(([id,p])=>`<div class="planet-line"><img src="${imgPath('planets',p.img)}" alt=""><p><b>${p.name}</b><br>${p.note}<br><small>${Object.entries(p.yields).map(([k,v])=>`${RESOURCES[k].label}${signFmt(v)}`).join(' / ')}</small></p></div>`).join('');
    const resourceRows=RESOURCE_ORDER.map(k=>`<tr><td>${RESOURCES[k].label}</td><td>${RESOURCES[k].use}</td><td>${RESOURCES[k].gain}</td></tr>`).join('');
    const branches=[['探索・植民','衛星→同一恒星系の別惑星→敵星系へ、という行動範囲を広げる枝。'],['工業・資材','開発費を下げ、植民地を黒字化しやすくする枝。'],['研究・演算','研究産出と高位研究の前提を作る枝。'],['恒星・ワープ','恒星チャージと星系間侵攻を解放する枝。'],['艦隊・侵攻','艦船建造、攻撃力、母星攻略力を伸ばす枝。'],['防衛','惑星ごとの防衛施設やシールドを伸ばす枝。'],['交易・信用','信用収入と不足資源の補助を強める枝。'],['人口・生態','食料・人口・維持費改善で長期成長する枝。'],['遺物・虚空','結晶、遺跡、特殊ワープを伸ばす枝。']].map(([a,b])=>`<li><b>${a}</b>：${b}</li>`).join('');
    const finalTechs=TECHS.filter(t=>t.final).map(t=>`<li><b>${t.name}</b>：${t.text}</li>`).join('');
    return `<section class="panel-section"><h2>説明</h2><p>この画面は、ゲーム全体の説明書です。迷ったら右側の「説明」を開いてください。下の操作パネルには説明ボタンを置かず、星の操作・保存・ターン終了だけにしています。</p></section><div class="codex-list">
      <details open><summary>まず何をするゲーム？</summary><p>小さな母星から始め、APを使って探索・植民・開発・研究・艦隊建造を選びます。序盤は母星周辺の衛星を取り、中盤は研究で同一恒星系の別惑星へ広げ、終盤は恒星チャージとワープ航法で敵帝国の恒星系へ進みます。</p></details>
      ${victoryProgressHtml('P')}
      <details open><summary>勝利条件</summary><ul><li><b>覇権勝利</b>：Turn50以降、各CPU星系に橋頭堡3拠点・包囲100・首都継承令・降下軍団/要塞攻略教範・恒星チャージ2を満たして母星を攻略します。</li><li><b>支配勝利</b>：有効支配率60%以上、平均開発Lv、行政技術、食料/電力/影響の赤字なしを満たします。Lv0植民地は満額カウントされません。</li><li><b>技術勝利</b>：最終技術、研究拠点3、電力・結晶収入、複数T4技術を満たします。</li></ul></details>
      <details open><summary>ターンとAP</summary><p>APは1ターンに実行できる主要行動数です。探索、植民、開発、研究、艦船建造、艦隊強化、恒星チャージ、侵攻で1AP使います。ターン終了で資源収入が入り、CPU勢力も成長・研究・拡張します。</p></details>
      <details><summary>資源の使い道</summary><div class="codex-table"><table><thead><tr><th>資源</th><th>使い道</th><th>増やし方</th></tr></thead><tbody>${resourceRows}</tbody></table></div></details>
      <details><summary>星系・天体・開発</summary><p>各勢力は1つの恒星系を持ち、その中に恒星、母星、衛星、惑星、小惑星帯などがあります。母星は帝国の中核、恒星は星系間移動用のエネルギー充填拠点です。植民直後の天体は人口維持で赤字になりやすく、開発Lvを上げて初めて安定収入になります。</p>${planetRows}</details>
      <details><summary>研究ツリーの読み方</summary><p>右側の「研究」を開くとツリーマップが出ます。横方向がT1からT5への段階、縦方向が研究分野です。緑の線は取得済みルート、青の線は次に進めるルート、灰色は前提不足です。複数前提が必要な研究もあるので、一本だけでなく複数の枝を組み合わせるのが重要です。</p><ul>${branches}</ul></details>
      <details><summary>艦隊と戦闘</summary><p>艦隊は偵察艇、フリゲート、駆逐艦、空母で構成されます。総合戦力だけでなく、攻撃力、シールド、武器Lv、シールドLv、推進Lv、相手惑星の防衛施設タイプが戦闘結果に影響します。母星攻略には艦隊だけでなく、ワープ航法と恒星チャージも必要です。</p></details>
      <details><summary>研究分野と最終技術</summary><p>研究は内政・探索・防衛・艦隊・ワープ・経済などに分かれます。方針別の最終技術や共通最終技術に到達すると技術勝利です。</p><ul>${finalTechs}</ul></details>
      <details><summary>よくある詰まり</summary><ul><li>探索できない：母星の衛星以外は「星系測量」などの研究が必要な場合があります。</li><li>資源が増えない：植民直後は維持費で赤字になることがあります。開発で黒字化してください。</li><li>敵に攻め込めない：「恒星ハーネス」「ワープ航法」と恒星チャージが必要です。</li><li>研究できない：研究資源、AP、前提技術を確認してください。</li></ul></details>
    </div>`;
  }
  function bindFactionButtons(root){ root.querySelectorAll('[data-faction]').forEach(btn=>btn.addEventListener('click',()=>showFactionDetail(btn.dataset.faction))); }
  
  function showTechDetail(id){
    const t=TECHS.find(x=>x.id===id); if(!t) return;
    modalDetail='techDetail';
    const p=player();
    const bought=p.techs.includes(id);
    const reqs=(t.req||[]).map(r=>TECHS.find(x=>x.id===r)).filter(Boolean);
    const missing=reqs.filter(r=>!p.techs.includes(r.id));
    const deps=techDependents(id);
    const finalBlock=finalResearchReasons(t,'P');
    const can=!bought && missing.length===0 && finalBlock.length===0 && p.resources.research>=t.cost && state.ap>0 && tutorialAllows('research',id);
    const btnLabel=bought?'取得済み':missing.length?'前提不足':finalBlock.length?'最終条件未達':p.resources.research<t.cost?'研究不足':state.ap<=0?'AP不足':'この研究を実行';
    const reqHtml=reqs.length?reqs.map(r=>`<li class="${p.techs.includes(r.id)?'ok':'miss'}">${r.name}${p.techs.includes(r.id)?'（取得済）':'（未取得）'}</li>`).join(''):'<li>前提なし</li>';
    const depHtml=deps.length?deps.slice(0,16).map(d=>`<li>${d.name} <small>T${d.tier||1} / ${techBranchLabel(techBranch(d))}</small></li>`).join(''):'<li>直接の解放先なし。最終ルートや複合前提の一部になります。</li>';
    const meta=techBranchMeta(techBranch(t));
    const action=`<button class="primary-btn" data-action="research" data-arg="${id}" type="button" ${can?'':'disabled'}>${btnLabel}</button>`;
    showModal(`<h2>${t.name}</h2>${researchOnlyRibbon('P')}<section class="panel-section tech-detail-head ${meta.tone}"><h3><img src="${icon(t.icon||meta.icon)}" alt="">${meta.label} / T${t.tier||1}</h3><p>${t.text}</p><p><b>効果：</b>${techEffectSummary(t)}</p><p><b>必要研究量：</b>${t.cost} / 現在 ${fmt(p.resources.research)} / AP ${state.ap}/${state.maxAp}</p>${finalBlock.length?`<p class="missing-note"><b>最終条件：</b>${finalBlock.join(' / ')}</p>`:''}<div class="tech-detail-actions top-actions">${action}</div></section><section class="panel-section"><h3>この研究に必要な前提</h3><ul class="req-list">${reqHtml}</ul></section><section class="panel-section"><h3>この研究で開く次の候補</h3><ul class="req-list">${depHtml}</ul></section><div class="tech-detail-actions sticky-actions">${action}<button class="ghost-btn" id="backToTree" type="button">ツリーへ戻る</button></div>`,true);
    bindActionButtons($('modalBody'));
    const back=$('backToTree'); if(back) back.onclick=()=>{ modalDetail=null; openMobilePage('tech'); };
  }
  function techBranchLabel(b){ return ({explore:'探索',industry:'工業',science:'研究',warp:'恒星',military:'艦隊',defense:'防衛',economy:'交易',bio:'生態',void:'虚空',final:'最終'})[b]||b; }
  function bindTechButtons(root){ root.querySelectorAll('[data-tech]').forEach(btn=>btn.addEventListener('click',()=>showTechDetail(btn.dataset.tech))); }
function openMobilePage(page){ modalDetail=null; modalPage=page; const title={empire:'艦隊',tech:'研究',factions:'勢力比較',codex:'説明',log:'ログ'}[page]||'情報'; const html=page==='empire'?empireHtml():page==='tech'?techHtml():page==='factions'?factionsHtml():page==='codex'?codexHtml():logHtml(); showModal(`<h2>${title}</h2>${html}`,true); bindActionButtons($('modalBody')); bindTechButtons($('modalBody')); bindFactionButtons($('modalBody')); }

  function showResourceHelp(k){ const r=RESOURCES[k], inc=totalIncome('P')[k]||0; showModal(`<h2>${r.label}</h2><div class="help-grid"><div><h3>何に使う？</h3><p>${r.use}</p></div><div><h3>どう増える？</h3><p>${r.gain}</p></div><div><h3>現在の収入</h3><p>毎ターン ${signFmt(inc)}。植民地の維持費でマイナスになることもあります。</p></div><div><h3>戦略メモ</h3><p>${r.advice}</p></div></div>`); }
  function showApHelp(){ showModal(`<h2>APとは？</h2><p>APは1ターンにできる主要行動数です。探索・植民・開発・研究・艦船建造・艦隊強化・恒星チャージ・侵攻で1ずつ使います。</p><p>序盤は3AP。技術「星域兵站」で4APになります。</p>`); }
  function showHelp(){ openMobilePage('codex'); }
  function showFactionDetail(fid){ const f=faction(fid), fs=fleetStats(f), prod=totalIncome(fid), home=system(f.home), star=system(f.star); showModal(`<h2>${f.name}${fid==='P'?'（あなた）':''}</h2><div class="help-grid"><div><h3>状態</h3><p>${f.eliminated?'敗退済み':'活動中'}</p></div><div><h3>母星</h3><p>${home?.name||'なし'}</p></div><div><h3>恒星</h3><p>${star?.name||'なし'} / 充填${f.charge}/${f.maxCharge}</p></div><div><h3>保有</h3><p>${owned(fid).length}天体</p></div><div><h3>艦隊</h3><p>${fleetText(f)}<br>総合${fs.power} / 攻撃${fs.attack} / シールド${fs.shield}</p></div><div><h3>収入</h3><p>${RESOURCE_ORDER.filter(k=>prod[k]).map(k=>`${RESOURCES[k].label}${signFmt(prod[k])}`).join(' / ')||'なし'}</p></div></div>`,true); }
  function showModal(html,page=false){ const dialog=$('infoModal'); const card=$('infoModal').querySelector('.modal-card'); card.classList.toggle('page',!!page); card.classList.toggle('research-page', modalPage==='tech'); card.classList.toggle('tech-detail-page', modalDetail==='techDetail'); $('modalBody').innerHTML=html; if(!dialog.open) dialog.showModal(); }
  function toast(text){ modalDetail=null; modalPage=null; showModal(`<h2>操作できません</h2><p>${text}</p>`); }

  function checkVictory(){
    if(!state||state.victory||state.defeat) return;
    if(dominationReasons('P').length===0) return setVictory('支配勝利','有効支配率・行政技術・平均開発Lv・赤字条件を満たし、星域を安定統治しました。');
    if(techVictoryReasons('P').length===0) return setVictory('技術勝利','最終技術と研究基盤・電力・結晶条件を満たしました。');
    if(state.turn>=VICTORY_TURN && state.factions.filter(f=>f.id!=='P').every(f=>f.eliminated||owned(f.id).length===0)) return setVictory('覇権勝利','CPU勢力の母星をすべて制圧しました。');
    checkCpuVictory();
  }
  function checkCpuVictory(){
    const winner=state.factions.find(f=>f.id!=='P'&&!f.eliminated && (dominationReasons(f.id).length===0 || techVictoryReasons(f.id).length===0));
    if(!winner) return false;
    const route=dominationReasons(winner.id).length===0 ? '支配勝利' : '技術勝利';
    setDefeat(`${winner.name}の${route}`, `${winner.name}が${route}条件を満たしました。CPUも軍事・内政・技術の勝利を狙います。`);
    return true;
  }
  function setVictory(title,text){ state.victory={title,text}; showModal(`<h2>クリア達成：${title}</h2><p>${text}</p><p>このまま銀河を続けますか？それとも新しい銀河で再挑戦しますか？</p><div class="victory-actions"><button id="victoryContinue" class="primary-btn" type="button">続ける</button><button id="victoryNew" class="ghost-btn" type="button">タイトルへ戻る</button></div>`); setTimeout(()=>{ const c=$('victoryContinue'), n=$('victoryNew'); if(c) c.onclick=()=>{$('infoModal').close();}; if(n) n.onclick=()=>{ state=null; $('infoModal').close(); showScreen('title'); }; },0); }

  function bind(){
    $('startBtn').onclick=startNew; $('continueBtn').onclick=continueGame; $('randomSeedBtn').onclick=()=>{$('seedInput').value=randomSeedText();};
    $('homeBtn').onclick=()=>centerOn(system(player().home),1.8); $('allMapBtn').onclick=fullMap; $('zoomInBtn').onclick=()=>{camera.zoom=clamp(camera.zoom*1.18,.65,5); draw();}; $('zoomOutBtn').onclick=()=>{camera.zoom=clamp(camera.zoom/1.18,.65,5); draw();};
    const hb=$('helpBtn'); if(hb) hb.onclick=showHelp; $('turnChip').onclick=showApHelp; $('saveBtn').onclick=()=>{save(); toast('保存しました。次回は「続きから」で再開できます。');}; $('endTurnBtn').onclick=endTurn; $('modalClose').onclick=()=>{ if(modalDetail==='techDetail' && modalPage==='tech'){ modalDetail=null; openMobilePage('tech'); return; } modalDetail=null; modalPage=null; $('infoModal').close();}; $('sheetToggle').onclick=()=>{state.sheetCollapsed=!state.sheetCollapsed; renderPanel(); save();};
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
