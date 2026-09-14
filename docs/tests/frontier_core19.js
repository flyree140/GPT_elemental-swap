()=>{const g=ElementalSwap.game,C=ES9,D=ES19,W=ES9_WORLD,p=g.player,out=[];
const rec=(test,pass,detail)=>out.push({test,pass:!!pass,...(detail===undefined?{}:{detail})});
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const state=()=>g.xState(),cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;
const clear=()=>{g.closeModalsM();g.input.held.clear();g.input.pressed.clear();g.input.released.clear();g.nCancelHolds();p.attack=null;p.buffer=null;p.history='';p.castT=0;p.downT=0;p.inv=0;g.hitStop=0;g.cooldownsM={};g.pendingM=null;g.fInit().lastCommand=null;};
const advance=(t=.2)=>{g.paused=false;for(let i=0;i<Math.ceil(t*60);i++){g.update(1/60,0);g.input.end();}g.paused=true;};
rec('300 個地點 ID／名稱唯一',g.rooms.length===300&&new Set(g.rooms.map(r=>r.id)).size===300&&new Set(g.rooms.map(r=>r.name)).size===300);
rec('175 新地點均在世界邊界內',D.rooms.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=C.WORLD_W&&r.y+r.h<=C.WORLD_H));
rec('25 生境皆具 7 個地點、兩原生種與地方配方',Object.values(D.biomes).every(b=>b.sites.length===7&&b.fauna.length===2&&b.sites.every(id=>g.roomById.has(id))&&D.recipes[b.item]));
const adj=new Map(g.rooms.map(r=>[r.id,[]]));for(const e of W.edges){adj.get(e.a)?.push(e.b);adj.get(e.b)?.push(e.a);}const seen=new Set(['r00']),queue=['r00'];while(queue.length)for(const v of adj.get(queue.shift())||[])if(!seen.has(v)){seen.add(v);queue.push(v);}
rec('398 實體連線的圖結構可連至全部 300 地點',W.edges.length===398&&seen.size===300,{reachable:seen.size});
rec('地圖沒有孤立端點或重複邊',W.edges.every(e=>adj.has(e.a)&&adj.has(e.b))&&new Set(W.edges.map(e=>[e.a,e.b].sort().join('|'))).size===W.edges.length);
const clipped=[...g.f19.nodes,...g.x17.deposits].filter(n=>g.roomById.get(n.room)?.frontier19&&g.platforms.some(s=>s.room===n.room&&!s.oneWay&&hit(n,s)));
rec('所有新增機關／採集點不埋在實心地形中',clipped.length===0,clipped.map(n=>n.id));
rec('新地點都有結構底床與返回梯道',D.rooms.every(r=>g.platforms.some(s=>s.room===r.id&&!s.oneWay&&s.bed18)&&g.ladders.some(l=>l.room===r.id)));
rec('新內容不是以救援水帶或出口傳送接合',!g.rooms.some(r=>r.rescue17)&&g.x17.doors.length===0);
const missingSpecies=Object.values(D.species).filter(s=>!s.boss&&!D.species[s.bossId]);rec('50 原生種各有對應領域王',Object.values(D.species).filter(s=>!s.boss).length===50&&missingSpecies.length===0);
const altars=new Set(g.f19.nodes.filter(n=>n.kind==='legacyBoss').flatMap(n=>n.species));rec('49 舊種王種都有實際召王碑',Object.keys(D.legacyBoss).length===49&&Object.keys(D.legacyBoss).every(id=>altars.has(id)));
rec('50 新王庭連結真實可召喚頭目',D.rooms.filter(r=>r.boss19).length===50&&D.rooms.filter(r=>r.boss19).every(r=>D.species[r.boss19]?.boss&&g.f19.nodes.some(n=>n.room===r.id&&n.kind==='console')));
rec('所有新素材可由採集或掉落取得',Object.keys(D.materials).every(id=>g.x17.deposits.some(n=>n.material===id)||Object.values(D.species).some(s=>s.drops[id])));
rec('33 新配方只引用有效材料',Object.keys(D.recipes).length===33&&Object.values(D.recipes).every(r=>Object.keys(r.cost).every(id=>ES17.materials[id]||ES17.recipes[id])));
// Biome mechanics and equipment applied through the live movement pipeline.
const visit=(bio,stage=1)=>{clear();g.xTravel(D.biomes[bio].sites[stage],true);const r=g.roomById.get(g.currentRoomId);Object.assign(p,{x:r.x+480,y:r.floorY-p.h-4,vx:0,vy:0,hp:p.maxHp,onGround:false});state().equipped={weapon:null,armor:null,tools:[]};state().race='human';g.f19.buffs={};return r;};
let r=visit('naos');g.x17.oxygen=10;advance(.5);const water=g.xEnvironment();rec('水下神殿有阻力且氧氣真實消耗',water.water&&water.speed<1&&g.x17.oxygen<9.8,{oxygen:g.x17.oxygen,speed:water.speed});
state().equipped.armor='bellLung';g.x17.oxygen=0;p.hp=p.maxHp;advance(.25);rec('潛鐘肺衣阻止耗氧且不觸發零氧傷害',g.x17.oxygen>=16&&p.hp===p.maxHp);
state().equipped={armor:null,weapon:null,tools:[]};state().race='merfolk';rec('魚人仍不受水中移動阻力',g.xEnvironment().speed===1);state().race='human';
p.y=r.y-100;rec('離開當地水域不保留水中狀態',!g.xEnvironment().water);
r=visit('sirocco');rec('沙漠未裝備有阻力',g.xEnvironment().speed<1);state().equipped.tools=['sandSkates'];rec('沙行裝備移除阻力',g.xEnvironment().speed===1);
r=visit('rime');rec('雪原未裝備有寒冷／滑移',g.xEnvironment().cold&&g.xEnvironment().slip);state().equipped.armor='snowWeave';rec('雪織裝備解除寒冷與冰滑',!g.xEnvironment().cold&&!g.xEnvironment().slip);
const pressure=Object.values(D.biomes).find(b=>b.env==='pressure');r=visit(pressure.id);rec('深水有壓力限制',g.xEnvironment().water&&g.xEnvironment().pressure);state().equipped.armor='abyssHarness';rec('壓差背架免壓力但仍保留水',g.xEnvironment().water&&!g.xEnvironment().pressure);
// Research completion executes every actual condition implementation, not reward flags.
const req={wind:'wind',light:'light',current:'water',cold:'fire',fire:'fire',cleanse:'light',water:'water',earth:'earth',vent:'water',nature:'nature',lightning:'lightning',magnet:'lightning',reflect:'light',storm:'lightning',root:'nature',laser:'lightning',resin:'fire',gravity:'gravity',quake:'earth',dream:'light',sleep:'shadow'};
const fail=[];let done=0;
for(const room of g.rooms.filter(r=>r.frontier19&&!r.shelter&&!r.boss19)){
 const n=g.f19.nodes.find(n=>n.room===room.id&&n.kind==='console');g.currentRoomId=room.id;p.x=n.x;p.y=n.y;g.fState().solved={};g.x17.fields=[];g.vInit().mode='now';const task=room.task19;
 if(['past','inner','echo','heavy','invert','future','elastic','fungal','decay'].includes(task)){g.vInit().mode=task;g.n18.ruleAt=g.time-4;}
 if(task==='clock')g.vInit().mode='future';
 if(task==='fungal')g.n18.structures.push({x:n.x,y:n.y,w:80,h:18,fungus18:true,kind:'bridge',modes:['fungal']});
 if(['sequence','gears'].includes(task)){const first=g.f19.nodes.find(q=>q.room===room.id&&q.kind==='first');g.fOperate(first);}
 if(req[task])g.xField(req[task],cx(n),cy(n),155,4);
 try{if(g.fOperate(n)&&g.fState().solved[room.id])done++;else fail.push(room.id+':'+task);}catch(e){fail.push(room.id+':'+e.message);}
}
rec('100 新區域研究條件皆可操作完成',done===100,{completed:done,failed:fail});g.vInit().mode='now';g.n18.structures=g.n18.structures.filter(s=>!s.fungus18);
// Blueprint, exact-cost, inventory, consumable, and tool-slot ownership.
g.xTravel('r00',true);clear();let crafted=0,costErrors=[];const inventory=state().inventory;
for(const item of Object.values(D.recipes)){state().owned={};state().facilities={};state().equipped={weapon:null,armor:null,tools:[]};state().inventory={...item.cost};g.fState().blueprints[item.id]=1;const ok=g.xCraft(item.id);if(ok&&Object.keys(item.cost).every(id=>state().inventory[id]===0))crafted++;else costErrors.push(item.id);}
rec('33 新配方在工作台扣正確材料並產出',crafted===33,{crafted,failed:costErrors});
const gear=D.recipes.sandSkates;state().owned={};state().inventory={...gear.cost};delete g.fState().blueprints[gear.id];rec('未得藍圖不能製作地方裝備',g.xCraft(gear.id)===false&&state().inventory[Object.keys(gear.cost)[0]]>0);
g.fState().blueprints[gear.id]=1;g.currentRoomId=D.biomes.sirocco.sites[1];rec('野外不能遠端製作',g.xCraft(gear.id)===false);g.xTravel('r00',true);
state().owned={sandSkates:1,rootSpool:1,sailFrame:1,inkCompass:1};state().equipped={weapon:null,armor:null,tools:[]};g.xEquip('sandSkates');g.xEquip('rootSpool');g.xEquip('sailFrame');rec('工具三槽滿時第四件不會偷替換',!g.xEquip('inkCompass')&&state().equipped.tools.join(',')==='sandSkates,rootSpool,sailFrame');
state().inventory={};for(const item of Object.values(D.recipes).filter(r=>r.kind==='consumable'))state().inventory[item.id]=1;
let used=0;for(const item of Object.values(D.recipes).filter(r=>r.kind==='consumable'))if(g.xUseItem(item.id)&&state().inventory[item.id]===0&&!g.xUseItem(item.id))used++;
rec('8 補給各扣一份，零庫存不可重用',used===8);
rec('補給建造實體短時踏板與不攻擊誘餌',g.n18.structures.some(s=>String(s.id).startsWith('mesh19_')&&s.until>g.time)&&g.n18.objects.some(o=>o.kind==='decoy'||o.type==='decoy'));
// All 19 patterns produce telegraph + execution without non-finite coordinates.
const arena=g.roomById.get(D.biomes.sirocco.sites[1]);g.currentRoomId=arena.id;p.x=arena.x+300;p.y=arena.floorY-p.h;g.enemyShots=[];g.f19.hazards=[];let patterns=0;const e=g.spawnEnemy(D.biomes.sirocco.fauna[0],p.x+300,arena.floorY,{room:arena.id});
for(const pattern of Object.keys(D.behaviors)){g.fWarn(e,pattern);const locked={x:e.fLocked.x,y:e.fLocked.y};p.x+=20;if(locked.x!==e.fLocked.x||locked.y!==e.fLocked.y)continue;g.fExecute(e,e.fLocked);if(g.enemyShots.every(s=>[s.x,s.y,s.vx,s.vy].every(Number.isFinite))&&g.f19.hazards.every(s=>[s.x,s.y,s.w,s.h].every(Number.isFinite)))patterns++;}
rec('19 種生態攻擊鎖定預告後出招、座標有效',patterns===19,{patterns});e.dead=true;
let bossOK=0;for(const s of Object.values(D.species).filter(s=>s.boss)){const e=g.spawnEnemy(s.id,arena.x+850,arena.floorY,{room:arena.id});e.hp=e.maxHp*.49;g.enemyBrain(e,.016,100,0,100,1);if(e.fPhase===2&&e.xBoss&&Number.isFinite(e.hp))bossOK++;e.dead=true;}
rec('99 個新增頭目皆可生成且半血切第二招式階段',bossOK===99,{bossOK});
// A real death queues a renewable spawn and grants loot only once.
g.enemies=g.enemies.filter(e=>!e.dead);const foe=g.spawnEnemy(D.biomes.sirocco.fauna[0],arena.x+900,arena.floorY,{room:arena.id});const kills=state().stats.kills;g.damageEnemy(foe,1e6,0,0,{br:999});const loot=g.x17.loot.length;g.xKilled(foe);rec('死亡只發一次掉落並排入75秒重生',state().stats.kills===kills+1&&g.x17.loot.length===loot&&g.x17.respawns.some(q=>q.home.type===foe.species17&&q.at>=g.time+74));
const bossId=D.biomes.sirocco.fauna[0]+'_boss';const bossType=D.species[bossId]?bossId:D.species[D.biomes.sirocco.fauna[0]].bossId;g.f19.timers['boss:'+bossType]=0;
rec('召王成功、在場不可重複召喚',g.fSummonBoss(bossType,arena)&&!g.fSummonBoss(bossType,arena));const king=g.enemies.find(e=>e.species17===bossType&&!e.dead);if(king)g.damageEnemy(king,1e7,0,0,{br:999});rec('領域王擊倒後120秒內不允許洗刷',g.f19.timers['boss:'+bossType]>=g.time+119&&!g.fSummonBoss(bossType,arena));
// Command shapes use separate pulse timings and status effects, no forced motion.
g.nStartTutorial('job','rift');g.n18.tutorial.done=true;clear();g.nResetTutorialActors();const target=g.enemies.find(e=>e.training18);Object.assign(p,{x:target.x-100,y:target.y,vx:0,vy:0,onGround:true,dir:1});
const put=()=>{target.dead=false;target.hp=target.maxHp=1e6;target.x=p.x+p.w+24;target.y=p.y;target.vx=target.vy=target.root=target.stun=target.armorBreak=target.downT=target.freeze=0;target.v16Layer='B';g.vInit().mode='now';g.hitStop=0;g.cooldownsM={};p.attack=null;p.buffer=null;};
for(const key of ['Z','X','XZ','ZZX','XXZ','ZXX','XZX','ZZZ']){put();const before=[p.x,p.y];g.startAttack(key);g.updateAttacks(.6);rec(key+' 不強制移動角色',p.x===before[0]&&p.y===before[1]);if(key==='XZ')rec('XZ 實際回拉敵人',target.vx<0);if(key==='ZZX')rec('ZZX 實際上挑',target.vy<-400);if(key==='XXZ')rec('XXZ 施加4秒破甲',target.armorBreak>=4);if(key==='ZXX')rec('ZXX 施加1.8秒束縛',target.root>=1.8);if(key==='XZX')rec('XZX 開啟反彈窗口',g.f19.parryUntil>g.time);if(key==='ZZZ')rec('ZZZ 三次命中而非單一貼圖',g.player.attack===null&&g.f19.swing.pulse===2);}
rec('技能90招基礎冷卻均落在1.15至4.8秒',Object.values(ES18.skills).flat().length===90&&Object.values(ES18.skills).flat().every(s=>s.cd>=1.15&&s.cd<=4.8&&s.cd===ES10_MASTER.skills[s.id].cd));
put();let deck=g.mLoadout();g.cooldownsM={[deck[0]]:g.time+8,[deck[1]]:g.time+5};g.f19.refundAt=0;g.f19.cooldownRefund=0;const d=D.commands.XXZ;g.fCommandEffect(target,d,0);rec('命中只回復目前最長冷卻0.42秒',Math.abs(g.cooldownsM[deck[0]]-(g.time+7.58))<1e-6&&g.cooldownsM[deck[1]]===g.time+5);g.fCommandEffect(target,d,1);rec('多段同幀不重複觸發冷卻回復',Math.abs(g.f19.cooldownRefund-.42)<1e-6);
put();target.x=p.x+3000;g.cooldownsM={[deck[0]]:g.time+5};g.startAttack('Z');g.updateAttacks(.5);rec('揮空不回復冷卻',g.cooldownsM[deck[0]]===g.time+5);
g.nEndTutorial();clear();g.xTravel('r00',true);g.fOpenAtlas();g.fCenterMap(6);let pin=g.f19.mapPin;rec('定位我投影在地圖正中央',Math.abs(pin.actual.x-650)<.1&&Math.abs(pin.actual.y-370)<.1&&pin.world.x===cx(p));
g.f19.map.x=C.WORLD_W;g.f19.map.zoom=15;g.renderMap();rec('角色離開目前地圖視窗時保留邊緣定位提示',g.f19.mapPin.off&&g.f19.mapPin.pin.x>=22);g.fMapHome();g.fDrawMinimap();rec('小地圖針始終對應玩家世界座標',g.f19.miniPin.worldX===cx(p)&&g.f19.miniPin.worldY===cy(p));
g.fState().target=D.biomes.naos.sites[1];rec('導航以實際圖連線計算且不傳送',g.fRoute(g.fState().target).at(-1)===g.fState().target&&g.currentRoomId==='r00');
rec('尚未親訪的新前哨拒絕地圖快旅',(()=>{const id=D.biomes.dream?.sites[0]||D.biomes.protospores.sites[0];delete g.progress.discovered[id];return !g.xTravel(id);})());
g.closeModalsM();g.paused=true;return out;}
