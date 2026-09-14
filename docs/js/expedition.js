/* V17 gameplay extension. Plain scripts, no build server or CDN required.
 * Simulation, cooldowns, respawns and crops use game time; menus pause them.
 * All effects are bounded and use the original collision / damage pipeline. */
(()=>{'use strict';
const D=window.ES17,C=window.ES9,W=window.ES9_WORLD,P=ES9_ENGINE.Game.prototype,ATT=ES9_ENGINE.ATT;
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dist=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),copy=o=>JSON.parse(JSON.stringify(o)),num=(v,d=0)=>Number.isFinite(Number(v))?clamp(Number(v),0,1e7):d;
function normalize(v){
 const n={schema:17,race:'human',elementPoints:10,elementXP:0,elements:{},inventory:{fiber:12,metal:10,crystal:4,herb:4},owned:{},equipped:{weapon:null,armor:null,tools:[]},facilities:{},codex:{},reactions:{},gates:{},bosses:{},claims:{},harvest:{},quests:{},stats:{kills:0,swaps:0,reactions:0,harvests:0},rank:0,uiMode:'desktop',lastCamp:'r00',gardenAt:0};
 if(v&&typeof v==='object'&&!Array.isArray(v)){
  if(own(D.races,v.race))n.race=v.race;for(const k of ['elementPoints','elementXP','rank','gardenAt'])n[k]=num(v[k],n[k]);n.rank=clamp(Math.floor(n.rank),0,20);
  for(const k of ['owned','facilities','reactions','gates','bosses','claims','harvest','quests'])if(v[k]&&typeof v[k]==='object'&&!Array.isArray(v[k]))n[k]=Object.fromEntries(Object.entries(v[k]).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).slice(0,5000).map(([k,x])=>[k,num(x)]));
  if(v.inventory){n.inventory={};for(const k of [...Object.keys(D.materials),...Object.keys(D.recipes)])if(v.inventory[k])n.inventory[k]=Math.floor(num(v.inventory[k]));}
  if(v.stats)for(const k in n.stats)n.stats[k]=num(v.stats[k]);
  if(v.codex)for(const [k,q]of Object.entries(v.codex).slice(0,200))if(C.ENEMIES[k]&&q&&typeof q==='object')n.codex[k]={seen:true,kills:num(q.kills),first:num(q.first)};
  if(v.equipped){const eq=v.equipped;for(const k of ['weapon','armor'])if(D.recipes[eq[k]]?.kind===k&&n.owned[eq[k]])n.equipped[k]=eq[k];n.equipped.tools=[...new Set((Array.isArray(eq.tools)?eq.tools:[]).filter(id=>D.recipes[id]?.kind==='tool'&&n.owned[id]))].slice(0,3);}
  if(v.uiMode==='mobile')n.uiMode='mobile';if(typeof v.lastCamp==='string'&&W.rooms.some(r=>r.id===v.lastCamp&&r.shelter))n.lastCamp=v.lastCamp;
 }
 for(const e of C.ELEMENTS){const old=v?.elements?.[e.id];n.elements[e.id]={rank:clamp(Math.floor(num(old?.rank)),0,3),branch:old?.branch==='B'?'B':'A'};}
 return n;
}
window.ES17_NORMALIZE=normalize;
const load=P.loadProgress;P.loadProgress=function(){const p=load.call(this);p.expedition17=normalize(p.expedition17);return p;};
P.xState=function(){return this.progress.expedition17||(this.progress.expedition17=normalize());};
P.xInit=function(){if(this.x17)return this.x17;return this.x17={fields:[],links:[],portals:[],deposits:[],doors:[],gateSolids:[],respawns:[],loot:[],oxygen:16,pulse:0,saveAt:0,lastGround:null,returnAnchor:null,tab:'journey',notice:'',reactionGate:{},lastHit:0,attackLog:[],lesson:null,signals:[],environment:null,skillUses:{},raceAt:0,harvestTick:0,heat:0,lastSkillAt:0};};
P.xRace=function(){return D.races[this.xState().race]||D.races.human;};
P.xHas=function(id){const s=this.xState();return s.equipped.armor===id||s.equipped.weapon===id||s.equipped.tools.includes(id);};
P.xShelter=function(){return !!this.roomById?.get(this.currentRoomId)?.shelter&&!this.trainingM&&!this.vision16?.returnTo;};
P.xNotice=function(text){this.xInit().notice=text;this.say(text,3);const el=document.getElementById('expeditionNotice');if(el)el.textContent=text;};
P.xStats=function(){const r=this.xRace(),s=this.xState();return {attack:r.atk,speed:r.speed,kb:r.kb,hp:Math.round(180*r.hp+this.progress.hpBonus+({pressure:30,thermal:20,heatSuit:25,mossArmor:35,circuitArmor:20}[s.equipped.armor]||0))};};
P.xApplyStats=function(){const p=this.player;if(!p)return;const ratio=clamp(p.hp/p.maxHp,0,1),stats=this.xStats();p.maxHp=stats.hp;p.hp=Math.max(1,stats.hp*ratio);};
const make=P.makePlayer;P.makePlayer=function(){const p=make.call(this),st=this.xStats();p.maxHp=p.hp=st.hp;return p;};
const change=P.changeClass;P.changeClass=function(id){const ratio=this.player.hp/this.player.maxHp;change.call(this,id);this.player.maxHp=this.xStats().hp;this.player.hp=Math.max(1,this.player.maxHp*ratio);this.xInit().returnAnchor=null;};
P.xSetRace=function(id){if(!own(D.races,id))return false;if(!this.xShelter()){this.xNotice('請回避難所調整種族，避免戰鬥中換族洗掉弱點。');return false;}this.xState().race=id;this.xApplyStats();this.saveProgress();this.xNotice('種族已切換：'+D.races[id].name+'；職業與技能配裝保持不變。');return true;};
// ── World geometry: 8 distinct environments, real sealed passages and airlocks.
const geometry=P.buildRoomGeometry;P.buildRoomGeometry=function(r){if(!r.x17)return geometry.call(this,r);r.floorY=r.y+r.h-44;
 this.addPlatform(r.x+18,r.floorY,r.w-36,44,'roomFloor',{room:r.id});
 if(r.rescue17){for(let x=200;x<r.w;x+=1000){this.addPlatform(x,r.floorY-240,170,24,'rockLedge',{room:r.id});this.rings.push({id:this.id(),x:x+120,y:r.floorY-550,r:22,room:r.id});}return;}
 this.addPlatform(r.x,r.y,24,r.h,'rockLedge',{room:r.id,oneWay:false});this.addPlatform(r.x+r.w-24,r.y,24,r.h,'rockLedge',{room:r.id,oneWay:false});
 const patterns={glacier:[-220,-460,-680],dune:[-160,-320,-510],reef:[-180,-430,-690],abyss:[-200,-500,-800],sky:[-260,-490,-740],umbra:[-180,-420,-670],inferno:[-250,-490,-690],metro:[-180,-360,-540]};
 for(const [j,y]of patterns[r.biome].entries()){this.addPlatform(r.x+200+j*390,r.floorY+y,330+j*25,24,j%2?'catwalk':'rockLedge',{room:r.id});this.rings.push({id:this.id(),x:r.x+300+j*390,y:r.floorY+y-110,r:19,room:r.id});}
 this.ladders.push({id:this.id(),x:r.x+140,y:r.floorY-870,w:34,h:870,room:r.id});
 if(r.shelter){this.addPlatform(r.x+740,r.floorY-350,620,25,'shelterFloor',{room:r.id});this.ladders.push({id:this.id(),x:r.x+1120,y:r.floorY-350,w:32,h:350,room:r.id});}
};
const connect=P.buildConnection;P.buildConnection=function(edge,i){if(edge.x17)return;return connect.call(this,edge,i);};
const spawn=P.spawnEnemy;P.spawnEnemy=function(type,x,y,opts={}){const spec=D.species[type];const e=spawn.call(this,type,x,y,opts);if(!e)return e;
 const t=C.ENEMIES[type];e.species17=type;e.sprite17=spec?type:null;e.home17={type,x,y,opts:copy(opts)};
 if(type!=='dummy'&&!e.practiceM){const factor=spec?1:type==='sentinel'?1.6:3.1;e.hp=e.maxHp=Math.round(e.maxHp*factor);e.speed*=.83;}
 if(spec){e.x17=true;if(spec.boss){e.type='sentinel';e.isEast=true;e.xBoss=true;e.w=132;e.h=142;e.y=y-e.h;e.breakMax=e.break=430;e.bossAwake=false;}e.drop17=spec.drops;}
 return e;};
const build=P.buildWorld;P.buildWorld=function(){this.xInit();build.call(this);const x=this.x17;
 this.enemies=this.enemies.filter(e=>!this.roomById.get(e.room)?.x17);
 this.addPlatform(0,16880,C.WORLD_W,120,'roomFloor',{room:'x17_rescue',oneWay:false});
 for(const r of this.rooms.filter(r=>r.x17&&!r.rescue17)){
  const b=D.biomes[r.biome];
  if(!r.shelter){let ids=[b.id+'_0',b.id+'_1'];if(r.stage===4)ids=[b.id+'_0_v',b.id+'_1_v'];if(r.stage===5)ids=[b.id+'_2'];
   ids.forEach((id,j)=>this.spawnEnemy(id,r.x+920+j*360,r.floorY,{room:r.id}));
  }
  // Material deposits in the safe camp make first equipment attainable without passing its own gate.
  for(let j=0;j<3;j++)x.deposits.push({id:r.id+'_node'+j,room:r.id,x:r.x+460+j*220,y:r.floorY-40,w:34,h:40,material:j===2?'herb':b.material,amount:r.shelter?2:3});
  if(r.shelter){this.furniture.push({id:this.id(),kind:'expeditionBench',room:r.id,x:r.x+870,y:r.floorY-65,w:72,h:65});this.npcs.push({id:this.id(),role:'expedition17',name:['北境測候員','沙海領航員','潮息研究員','深海打撈者','帆翼郵差','織影居民','灰燼鍛工','終夜站務員'][b.index],x:r.x+1030,y:r.floorY-62,w:40,h:62,room:r.id});}
  if(r.stage>0)x.doors.push({id:r.id+'_back',room:r.id,x:r.x+65,y:r.floorY-94,w:55,h:94,to:'x17_'+r.biome+'_'+(r.stage-1),back:true});
  if(r.stage<5)x.doors.push({id:r.id+'_next',room:r.id,x:r.x+r.w-140,y:r.floorY-94,w:55,h:94,to:'x17_'+r.biome+'_'+(r.stage+1),needs:r.stage===2?r.biome:null,key17:r.stage===4&&['abyss','umbra','inferno','metro'].includes(r.biome)});
  if(r.stage===2){const gate={id:'xgate_'+r.biome,room:r.id,biome:r.biome,x:r.x+1050,y:r.y,w:54,h:r.h,oneWay:false,type:'gate17'};x.gateSolids.push(gate);x.deposits.push({id:r.id+'_switch',room:r.id,x:r.x+940,y:r.floorY-70,w:50,h:70,gate:r.biome});}
 }
 const bed=this.roomById.get('x17_rescue');for(const xx of [900,2100,8300])this.spawnEnemy('reef_0',xx,bed.floorY,{room:bed.id});
 const h=this.roomById.get('r00');this.furniture.push({id:this.id(),kind:'expeditionBench',room:'r00',x:h.x+570,y:h.floorY-65,w:72,h:65});
 x.deposits.push({id:'home_herb17',room:'r00',x:h.x+700,y:h.floorY-38,w:34,h:38,material:'herb',amount:3});
 this.xApplyStats();
};
C.FURNITURE.expeditionBench={name:'遠征製作台',effect:'種族／元素分支／製作／遠征；O 隨時查閱。'};
const platforms=P.activePlatforms;P.activePlatforms=function(b=this.player){return platforms.call(this,b).concat((this.x17?.gateSolids||[]).filter(g=>!this.xState().gates[g.biome]));};
P.xOpenGate=function(id){const b=D.biomes[id],s=this.xState();if(!b)return false;if(s.gates[id])return true;
 if(!s.owned[b.item]&&s.race!==b.race){this.xNotice('關隘需要 '+D.recipes[b.item].name+'（先在前哨採集製作），或 '+D.races[b.race].name+' 天賦。');return false;}
 s.gates[id]=1;s.elementPoints+=2;this.mAward('gate17:'+id,2,0);this.xSignal('gate',id);this.saveProgress();this.xNotice('機關解除：'+b.name+'，新路線永久開啟。');return true;};
P.xTravel=function(id,force=false){const r=this.roomById.get(id);if(!r)return false;const s=this.xState();
 if(!force&&!r.shelter){const b=r.biome;if(r.stage>=3&&!s.gates[b]){this.xNotice('請先實際到「封鎖關隘」啟動機關，無法從地圖跳過。');return false;}if(!this.progress.discovered[id]){this.xNotice('未探索的非營地不能傳送，請走房間出口。');return false;}}
 if(this.trainingM)this.endTraining();if(this.vision16?.returnTo)this.vLeave();this.vResetTransient();
 // Return to normal collision dimensions without bypassing a gate at the destination.
 this.vision16.mode='now';const p=this.player,[w,h]=this.vDims('now');p.w=w;p.h=h;
 p.x=r.x+260;p.y=r.floorY-p.h-3;p.vx=p.vy=0;p.onGround=true;p.inv=1;p.downT=0;p.attack=null;p.history='';
 this.currentRoomId=r.id;this.currentRegion=r.region;this.progress.discovered[r.id]=true;if(r.shelter){s.lastCamp=id;this.progress.shelters[id]=true;p.checkpoint={x:p.x,y:p.y,room:id};}
 this.camera.x=clamp(p.x-this.viewW*.38,0,C.WORLD_W-this.viewW);this.camera.y=clamp(p.y-this.viewH*.55,0,C.WORLD_H-this.viewH);this.x17.oxygen=16;if(!r.rescue17)this.x17.lastGround={x:p.x,y:p.y,room:r.id};this.x17.fields=[];this.x17.links=[];this.x17.portals=[];
 this.closeModalsM();this.nearInteract=null;this.message.t=0;this.updateInteractions();this.saveProgress();this.xSignal('travel',id);return true;
};
// ── Independent racial body / environmental motion and breathable surfaces.
P.xEnvironment=function(){const p=this.player,r=this.roomById.get(this.currentRoomId),b=D.biomes[r?.biome],race=this.xState().race;
 const env={biome:b?.id||null,water:false,speed:1,gravity:1,cold:false,hot:false,slip:false,pressure:false,magnetic:false};if(!b)return env;
 if(b.id==='reef'||b.id==='abyss'){env.water=cy(p)>r.floorY-(b.id==='abyss'?r.h+50:310);if(env.water){env.speed=race==='merfolk'?1:this.xHas('gill')||this.xHas('pressure')?.82:.56;env.gravity=.24;env.pressure=b.id==='abyss';}}
 if(b.id==='glacier'){env.cold=race!=='frost'&&!this.xHas('thermal');env.slip=race!=='frost'&&!this.xHas('iceGrip');}
 if(b.id==='dune'&&race!=='sand'&&!this.xHas('sandBoots'))env.speed=.72;
 if(b.id==='sky')env.gravity=.62;
 if(b.id==='umbra'&&race!=='shade'&&!this.xHas('phaseBoots')&&this.vision16.mode!=='sliceC')env.speed=.74;
 if(b.id==='inferno')env.hot=race!=='ember'&&!this.xHas('heatSuit');
 env.magnetic=b.id==='metro'&&race!=='clock'&&!this.xHas('insulator');
 if(r.shelter){env.cold=env.hot=env.pressure=env.magnetic=false;env.water=false;env.speed=1;env.gravity=1;}
 return env;
};
const updatePlayer=P.updatePlayer;P.updatePlayer=function(dt){const x=this.xInit(),p=this.player,env=this.xEnvironment(),race=this.xRace(),ph=C.PHYSICS,cl=C.CLASSES[p.classId];x.environment=env;
 const base={gravity:ph.gravity,moveSpeed:ph.moveSpeed,groundDecel:ph.groundDecel,speed:cl.speed};
 ph.moveSpeed*=race.speed*env.speed;cl.speed=1;ph.gravity*=env.gravity;if(race.passive==='glide'&&p.vy>0)ph.gravity*=.58;if(env.slip)ph.groundDecel=650;
 if((this.xHas('glider')||race.passive==='glide')&&this.key('jump')&&p.vy>95)p.vy=95;
 if(env.water&&p.downT<=0){if(this.key('up')||this.key('jump'))p.vy=-205*(race.passive==='gills'?1.4:1);if(this.key('down'))p.vy=190;}
 try{updatePlayer.call(this,dt);}finally{Object.assign(ph,{gravity:base.gravity,moveSpeed:base.moveSpeed,groundDecel:base.groundDecel});cl.speed=base.speed;}
 const gills=race.passive==='gills'||race.passive==='machine'||this.xHas('pressure'),maxO=this.xHas('gill')?48:16;
 x.oxygen=env.water&&!gills?Math.max(0,x.oxygen-dt):Math.min(maxO,x.oxygen+dt*12);
 if(env.water&&x.oxygen<=0)this.hurtPlayer(3*dt,0,0,'缺氧',true);
 if(env.pressure&&!this.xHas('pressure'))this.hurtPlayer((race.passive==='float'?.9:1.8)*dt,0,0,'深海壓力',true);
 if(env.cold&&this.time%8>5)this.hurtPlayer(.8*dt,0,0,'寒冷',true);
 if(env.hot&&p.y+p.h>this.roomById.get(this.currentRoomId).floorY-15&&Math.floor(p.x/220)%4===2)this.hurtPlayer(4*dt,0,0,'熔岩',true);
 if(env.magnetic&&this.time%7>5.5&&p.onGround)this.hurtPlayer(2*dt,0,0,'磁軌脈衝',true);
 if(env.biome==='sky'&&!p.onGround)p.vx+=Math.sin(this.time*.7)*75*dt;
 if(p.onGround&&!this.roomById.get(this.currentRoomId)?.rescue17){x.lastGround={x:p.x,y:p.y,room:this.currentRoomId};if(this.xShelter())this.xState().lastCamp=this.currentRoomId;}
 if(this.xHas('filter'))p.poison=0;
 if(this.xHas('mossArmor')&&this.time-x.lastHit>5)p.hp=Math.min(p.maxHp,p.hp+dt*1.4);
};
const move=P.moveBody;P.moveBody=function(b,dt,opts){const env=this.x17?.environment;if(b===this.player&&env?.water){b.vy=clamp(b.vy,-260,230);}
 if(b!==this.player&&b.float17>this.time)b.vy-=C.PHYSICS.gravity*.55*dt;
 return move.call(this,b,dt,opts);
};
const hurt=P.hurtPlayer;P.hurtPlayer=function(dmg,kx=0,ky=0,source='',dot=false){const p=this.player,x=this.xInit(),r=this.xRace();
 if(dot&&((r.passive==='heat'||this.xHas('heatSuit'))&&/熔岩|燃燒|熱/.test(source)))return;
 if(!dot&&p.inv<=0&&p.phase<=0&&r.passive==='phase'&&this.time>= (x.phaseAt||0)){x.phaseAt=this.time+(this.vision16?.mode==='sliceC'?2:3);p.inv=.22;this.addAfterimage();this.xSignal('race','phase');this.say('虛空皮膜｜自動閃避',.8,r.color);return;}
 const hp=p.hp;hurt.call(this,dmg,kx*r.kb*.62,ky*r.kb*.65,source,dot);if(p.hp<hp){x.lastHit=this.time;if(!dot)p.downT=Math.min(p.downT,.55);}
};
// ── Combat weight: ordinary attacks stay close; deliberate launch / pull survives.
const damageEnemy=P.damageEnemy;P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){if(e.dead)return;const before=e.hp,wasDead=e.dead,x=this.xInit();
 const intentional=def.launch||def.pull||def.chain||def.slam||def.master?.skill||def.explicitKnockback;
 if(!intentional){kx*=.17;ky*=ky<-180?.72:.3;}
 if(def.mCommand&&this.xHas('anchorHammer')&&def.big){kx*=3.5;def={...def,explicitKnockback:true};}
 if(this.xHas('anchorHammer'))def={...def,br:(def.br||12)*1.3};
 if(e.sleep17>this.time){e.sleep17=0;e.freeze=0;e.armorBreak=Math.max(e.armorBreak,3);this.xSignal('wake',e.id);}
 if(e.future17>this.time&&!def.isEcho){e.future17=0;e.v16ExposedUntil=this.time+3;e.armorBreak=Math.max(e.armorBreak,3);e.state="idle";e.aiT=2.3;e.stateT=0;e.telegraph=null;e.stun=1.1;this.vision16.plans=this.vision16.plans.filter(q=>q.ownerId!==e.id);this.say('因果剪接｜攻擊撤回，3 秒反擊窗',1.1,'#ffc3bb');}
 damageEnemy.call(this,e,dmg*(def.noRace17?1:this.xRace().atk),kx,ky,def);
 if(e.hp<before){
  x.lastSkillAt=this.time;if(def.mCommand||def.master?.skill){this.hitStop=Math.max(this.hitStop,def.big?.082:.038);this.combo.t=3.1;}
  if(!intentional){e.vx=clamp(e.vx,-115,115);if(!def.launch)e.vy=clamp(e.vy,-310,390);}
  if(this.xHas('tetherBlade')&&!def.shared17)e.vx+=Math.sign(cx(this.player)-cx(e))*58;
  if(e.marked17>this.time){e.armorBreak=Math.max(e.armorBreak,1.4);}
  if(this.xHas('echoBow')&&def.mCommand&&!def.isEcho)this.mSchedule(.3,()=>{if(!e.dead)this.damageEnemy(e,dmg*.2,0,0,{isEcho:true,noRace17:true});});
  if(!def.shared17){const link=x.links.find(q=>q.t>0&&q.ids.includes(e.id));if(link)for(const id of link.ids)if(id!==e.id){const other=this.enemies.find(a=>a.id===id&&!a.dead);if(other)this.damageEnemy(other,(before-e.hp)*.35,0,0,{shared17:true,noRace17:true,isEcho:true});}}
  if(def.mCommand&&this.vision16.mode==='heat'&&x.heat>0&&def.big){const q=x.heat;x.heat=0;this.xField('fire',cx(e),cy(e),150,3,{reaction:'動能返還',damage:8+q*2});}
  this.xSignal('hit',def.master?.skill||def.key||'hit');
 }
 if(!wasDead&&e.dead&&!e.practiceM&&e.type!=='dummy')this.xKilled(e);
};
P.xKilled=function(e){if(e.lootClaim17)return;e.lootClaim17=true;const s=this.xState(),x=this.xInit(),id=e.species17||e.type;s.stats.kills++;
 if(!s.codex[id])s.codex[id]={seen:true,kills:0,first:this.progress.playSeconds};s.codex[id].kills++;
 const drops=e.drop17||{metal:2,fiber:1,herb:1};for(const [item,n]of Object.entries(drops))x.loot.push({id:this.id(),x:e.x+Math.random()*30,y:e.y+e.h-24,w:18,h:18,item,n,t:100});
 s.elementXP+=e.xBoss?40:8;while(s.elementXP>=40){s.elementXP-=40;s.elementPoints++;}
 if(e.xBoss){s.bosses[id]=(s.bosses[id]||0)+1;if(!s.claims['boss:'+id]){s.claims['boss:'+id]=1;s.elementPoints+=3;}this.say('王庭失衡核心回收｜'+e.name,3);}
 if(e.home17)x.respawns.push({at:this.time+(e.xBoss?240:75),home:copy(e.home17),boss:e.xBoss,room:e.room});
 this.xSignal('kill',id);this.saveProgress();
};
const enemyBrain=P.enemyBrain;P.enemyBrain=function(e,dt,...args){if(e.sleep17>this.time){e.vx=0;e.state='stun';e.stun=.2;return;}
 if(e.xBoss&&this.currentRoomId===e.room)e.bossAwake=true;
 const prev=e.state;enemyBrain.call(this,e,dt,...args);
 if(prev!==e.state&&e.telegraph&&e.stateT>0){e.stateT*=1.32;e.telegraph.t*=1.32;}
 if(e.x17&&!e.xBoss&&e.telegraph&&String(e.species17).endsWith('_v')&&!e.variantShot17){e.variantShot17=this.time+3;}
 if(e.variantShot17&&this.time>=e.variantShot17){e.variantShot17=0;this.fireEnemyShot(e,'variant',170,-.3,1,.9);}
};
const updateEnemies=P.updateEnemies;P.updateEnemies=function(dt){
 const p=this.player,r=this.xRace(),mode=this.vision16.mode,slowR=mode==='cold'?220:150;
 // Distant rooms sleep; their encounter state and respawn clock stay in the world.
 const worldEnemies=this.enemies;this.enemies=worldEnemies.filter(e=>!e.dead&&(e.practiceM||e.attached||e.room===this.currentRoomId||dist(e,p)<2100||e.burn>0));
 const speeds=[];for(const e of this.enemies){if(e.dead)continue;let factor=1;if(dist(e,p)<slowR&&r.passive==='slow')factor*=.68;if(mode==='macro'&&dist(e,p)<320){factor*=.5;e.float17=this.time+.2;}if(r.passive==='stone'&&dist(e,p)<110)factor*=.78;if(e.slow17>this.time)factor*=.55;
  if(factor!==1){speeds.push([e,e.speed,e.vx]);e.speed*=factor;e.vx*=factor;e.aiT+=(1-factor)*dt;if(e.stateT>0)e.stateT+=(1-factor)*dt;}}
 try{updateEnemies.call(this,dt);}finally{for(const [e,sp]of speeds)e.speed=sp;const extra=this.enemies.filter(e=>!worldEnemies.includes(e));this.enemies=worldEnemies.concat(extra);}
};
const enemyShots=P.updateEnemyShots;P.updateEnemyShots=function(dt){const p=this.player,r=this.xRace(),x=this.xInit(),arr=[];
 for(const s of this.enemyShots){if(s.friendly||s.t<=0)continue;const d=dist(s,p);if((r.passive==='slow'&&d<(this.vision16.mode==='cold'?220:150))||(r.passive==='sand'&&this.currentRegion==='x17_dune'&&d<130)){arr.push([s,s.vx,s.vy]);s.vx*=.68;s.vy*=.68;}
  if(d<130&&this.time>=x.raceAt&&s.warmup<=0&&s.type!=='bombMarker'){
   if(r.passive==='prism'){s.friendly=true;s.vx*=-1;s.vy*=-1;x.raceAt=this.time+5;this.xSignal('race','reflect');}
   if(r.passive==='machine'){s.t=0;p.shield=Math.min(30,p.shield+6);x.raceAt=this.time+4;}
  }
  if(this.vision16.mode==='heat'&&d<125&&x.heat<5&&s.warmup<=0){s.t=0;x.heat++;this.vBurst(cx(p),cy(p),'#ffc090',45);}
 }
 try{enemyShots.call(this,dt);}finally{for(const [s,vx,vy]of arr)if(!s.friendly){s.vx=vx;s.vy=vy;}}
};
// ── Elemental growth: mechanisms rather than flat damage. Local reactions only.
P.xElementUpgrade=function(id){const s=this.xState(),e=s.elements[id];if(!e)return false;const cost=e.rank+1;if(e.rank>=3||s.elementPoints<cost){this.xNotice('元素點不足，或已達三級；探索、反應首發現與戰鬥可獲得。');return false;}s.elementPoints-=cost;e.rank++;this.saveProgress();return true;};
P.xElementBranch=function(id,b){if(!this.xState().elements[id]||!['A','B'].includes(b))return;this.xState().elements[id].branch=b;this.saveProgress();};
P.xField=function(element,x,y,r=155,t=4,extra={}){const s=this.xState();if(this.xHas('resonator'))t*=1.4;const f={id:this.id(),element,x,y,w:0,h:0,r,t,max:t,tick:0,damage:4,layer:this.vLayer(),...extra};this.xInit().fields.push(f);if(this.x17.fields.length>40)this.x17.fields.shift();return f;};
P.xPlatform=function(x,y,w=220,t=6,type='skillPlatform'){const f={id:this.id(),x:x-w/2,y,w,h:17,type,t,max:t,oneWay:true,color:C.ELEMENTS.find(e=>e.id===(type==='icePlatform'?'ice':'light'))?.color};this.fields.push(f);return f;};
P.xReact=function(a,b,x,y){if(a===b)return false;const r=D.reactions.find(q=>(q.a===a&&q.b===b)||(q.a===b&&q.b===a));if(!r)return false;const runtime=this.xInit(),key=r.effect+':'+Math.floor(x/160)+':'+Math.floor(y/160);if((runtime.reactionGate[key]||0)>this.time)return false;runtime.reactionGate[key]=this.time+2;
 const s=this.xState();s.stats.reactions++;if(!s.reactions[r.effect]){s.reactions[r.effect]=1;s.elementPoints+=s.facilities.lab?3:2;this.saveProgress();}
 const f=this.xField(b,x,y,190,4.5,{reaction:r.name,behavior:r.effect,damage:6});
 if(r.effect==='conductive'){f.r=255;f.damage=5;}
 if(r.effect==='magma'){f.t=f.max=6;f.damage=7;f.r=225;}
 if(r.effect==='spore'){f.damage=4;f.spreadAt=this.time+1.6;}
 if(r.effect==='nova'){f.t=f.max=3;f.damage=2;}
 if(r.effect==='laser'){f.line=[{x:x-270,y},{x:x+270,y}];f.damage=9;}
 if(r.effect==='waterspout'){f.follow=true;f.damage=3;}
 if(r.effect==='frostgarden')f.damage=0;
 if(['icebridge','prism'].includes(r.effect)){this.xPlatform(x,y+55,r.effect==='prism'?340:300,7,r.effect==='icebridge'?'icePlatform':'skillPlatform');if(this.xRace().passive==='prism'&&r.effect==='prism')this.xPlatform(x+90,y-65,160,6);}
 this.vBurst(x,y,C.ELEMENTS.find(e=>e.id===b).color,150);this.say('元素反應｜'+r.name,1.4);this.xSignal('reaction',r.effect);return f;
};
const elementEffect=P.elementSwapEffect;P.elementSwapEffect=function(el,old,now){elementEffect.call(this,el,old,now);const s=this.xState(),q=s.elements[el.id],x=this.xInit(),p=this.player,a={x:old.cx??old.x,y:old.cy??old.y},b={x:now.x??cx(p),y:now.y??cy(p)};s.stats.swaps++;
 if(this.xHas('circuitArmor'))p.shield=Math.min(30,p.shield+4);
 if(q.rank>0){const dur=4+q.rank*.8,r=140+q.rank*18,branch=q.branch;
  if(el.id==='lightning'||el.id==='gravity'){if(branch==='A')this.xField(el.id,(a.x+b.x)/2,(a.y+b.y)/2,r,dur,{line:[a,b],behavior:el.id==='lightning'?'wire':'pullwire'});else this.xField(el.id,b.x,b.y,190,dur,{behavior:el.id==='lightning'?'conductive':'float'});}
  else if(el.id==='ice'||el.id==='earth'||el.id==='nature'){if(branch==='A'){this.xPlatform(b.x,b.y+60,200+q.rank*35,dur,el.id==='ice'?'icePlatform':el.id==='nature'?'vinePillar':'earthPillar');if(el.id==='ice')this.xPlatform(a.x,a.y+60,200+q.rank*35,dur,'icePlatform');if(el.id==='earth')this.xPlatform(b.x+100,b.y-55,145,dur,'earthPillar');}else this.xField(el.id,b.x,b.y,r,dur,{behavior:el.id==='earth'?'mud':el.id==='nature'?'garden':'shatter'});}
  else if(el.id==='water'){this.xField('water',b.x,b.y,r,dur,{follow:branch==='B'});if(branch==='A')this.xField('water',a.x,a.y,r*.8,dur);}
  else if(el.id==='shadow'){if(branch==='A')this.xField('shadow',a.x,a.y,220,dur,{behavior:'decoy'});else this.xField('shadow',b.x,b.y,r,dur,{behavior:'singularity'});}
  else if(el.id==='light'){this.xField('light',b.x,b.y,r,dur,{behavior:branch==='B'?'reflect':'prismfield'});}
  else{this.xField(el.id,b.x,b.y,r,dur,{behavior:el.id==='wind'?(branch==='A'?'steam':'windlane'):null,...(el.id==='wind'&&branch==='B'?{line:[a,b]}:{})});if(branch==='A')this.xField(el.id,a.x,a.y,r*.8,dur,{behavior:el.id==='wind'?'steam':null});}
 }
 for(const f of x.fields.slice())if(f.element!==el.id&&Math.hypot(f.x-b.x,f.y-b.y)<f.r+90)this.xReact(f.element,el.id,b.x,b.y);
 const env=this.xEnvironment();if(env.water)this.xReact('water',el.id,b.x,b.y);
 if(s.race==='storm'&&el.id==='lightning')p.airDashes=Math.max(1,p.airDashes);if(s.race==='astral'&&el.id==='gravity')this.xPlatform(b.x,b.y+80,230,6);
 this.xSignal('swap',el.id);
};
const elementHit=P.applyElementHit;P.applyElementHit=function(e,el,shot){const prev=e.element17;const result=elementHit.call(this,e,el,shot);if(prev&&prev.until>this.time&&prev.id!==el.id)this.xReact(prev.id,el.id,cx(e),cy(e));e.element17={id:el.id,until:this.time+5};this.xSignal('elementHit',el.id);return result;};
const status=P.mStatus;P.mStatus=function(e,id,strength=1){const prev=e.element17;status.call(this,e,id,strength);if(id&&id!=='raw'){if(prev&&prev.until>this.time&&prev.id!==id&&!this._xFieldTick)this.xReact(prev.id,id,cx(e),cy(e));e.element17={id,until:this.time+5};}};
P.xTickFields=function(dt){const x=this.xInit(),p=this.player;for(const f of x.fields){f.t-=dt;f.tick-=dt;if(f.follow){f.x=cx(p);f.y=cy(p);}if(f.layer!==this.vLayer()&&f.element!=='light')continue;
 const near=(e)=>f.line?pointSegment(cx(e),cy(e),...f.line)<52:Math.hypot(cx(e)-f.x,cy(e)-f.y)<f.r;
 if(f.behavior==='decoy')for(const e of this.enemies)if(!e.dead&&near(e))e.decoy={x:f.x,y:f.y};
 if(['steam','firestorm','waterspout'].includes(f.behavior)&&near(p)){p.vy=Math.min(p.vy,-220);p.airDashes=Math.max(1,p.airDashes);}
 if(f.behavior==='windlane')for(const s of [...this.elementShots,...this.masterMissiles])if(!s.accelerated17&&near(s)){s.vx*=1.25;s.vy*=1.25;s.accelerated17=true;}
 if((f.behavior==='reflect'||f.behavior==='laser')&&!f.used){const s=this.enemyShots.find(s=>!s.friendly&&s.warmup<=0&&near(s));if(s){s.friendly=true;s.vx*=-1;s.vy*=-1;f.used=true;}}
 if(f.behavior==='nova'&&f.t<.4&&!f.exploded){f.exploded=true;f.damage=42;f.r=245;f.tick=0;this.vBurst(f.x,f.y,'#f9c780',230);}
 if(f.behavior==='spore'&&!f.spread&&this.time>=f.spreadAt){f.spread=true;const targets=this.enemies.filter(e=>!e.dead&&near(e)).slice(0,3);for(const e of targets){e.burn=Math.max(e.burn,4);const second=this.enemies.find(q=>!q.dead&&q!==e&&dist(q,e)<220);if(second){second.burn=Math.max(second.burn,4);this.vBurst(cx(second),cy(second),'#f5b98a',65);}}}
 if(f.tick>0)continue;f.tick=.55;this._xFieldTick=true;
 try{for(const e of this.enemies){if(e.dead||!near(e)||!this.vCanHit(e,f.layer,f.element))continue;
  if(['singularity','pullwire','nova'].includes(f.behavior)){e.vx+=Math.sign(f.x-cx(e))*130*(this.vInit().mode==='invert'?-1:1);e.vy-=25;}
  if(f.behavior==='prismfield')e.hidden=false;if(f.element==='earth'&&f.behavior==='mud')e.armorBreak=Math.max(e.armorBreak,.8);if(f.behavior==='float')e.float17=this.time+.8;if(f.behavior==='magma'){e.slow17=this.time+.8;e.burn=Math.max(e.burn,2);}if(f.behavior==='firestorm')e.vy=Math.min(e.vy,-120);
  if(['mud','garden','frostgarden'].includes(f.behavior))e.root=Math.max(e.root,.7);
  if(['sleep','stasis'].includes(f.behavior)){e.slow17=this.time+.8;if(f.behavior==='sleep')e.sleep17=this.time+2.8;}
  if(f.behavior==='trap'&&!f.triggered){f.triggered=true;f.t=.6;f.damage=25;this.vBurst(f.x,f.y,C.ELEMENTS.find(q=>q.id===f.element)?.color,200);if(f.afterField)this.xField(f.element,f.x,f.y,170,3);}
  if(f.behavior!=='sleep'&&f.behavior!=='decoy'&&!(f.behavior==='trap'&&!f.triggered))this.damageEnemy(e,f.damage*(f.behavior==='conductive'&&e.wet>0?1.5:1),0,0,{noRace17:false,isEcho:true,v16Layer:f.layer,kd:0});
  if(f.behavior!=='frostgarden')this.mStatus(e,f.element,.35);if(f.behavior==='frostgarden')e.slow17=this.time+.8;if(f.behavior==='conductive')e.wet=Math.max(e.wet,1);if(f.behavior==='shatter')e.armorBreak=1;
 }
 if(['garden','frostgarden'].includes(f.behavior)&&near(p))p.hp=Math.min(p.maxHp,p.hp+1);
 }finally{this._xFieldTick=false;}
 }
 x.fields=x.fields.filter(f=>f.t>0);for(const l of x.links)l.t-=dt;x.links=x.links.filter(l=>l.t>0);for(const q of x.portals)q.t-=dt;x.portals=x.portals.filter(q=>q.t>0);
};
function pointSegment(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,m=dx*dx+dy*dy||1,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/m,0,1);return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);}
// ── The seven other lenses now produce direct battlefield opportunities.
Object.assign(ES16.modes.forecast,{name:'因果剪接',rule:'保留預測線；啟動時標記近敵。擊中標記可撤回它的出招，開 3 秒破綻窗。',trade:'剪接一次即消耗標記；無法預測尚未決定的隨機 AI。',cd:2.2});
Object.assign(ES16.modes.cold,{name:'凝結劇場',rule:'凝結敵彈成換位踏點；同時短凍近敵，留時間把元素場與職業機構排好。',trade:'近敵控制 1.8 秒；頭目只短緩。敵彈解凍前仍有預警。'});
Object.assign(ES16.modes.heat,{name:'動能鍛爐',rule:'吸收近身敵彈，最多蓄 5 份熱能；X 重終結把熱能返還成火場。仍可軟化指定門。',trade:'炸圈與接觸攻擊不會被吸收；普通 Z 不會釋放熱能。'});
Object.assign(ES16.modes.macro,{name:'巨構棋盤',rule:'近身敵人變重、慢行、受浮力牽制；切入時生成兩枚實體棋台，可狙擊、换位。',trade:'仍保留配重機關；棋台 6 秒消失，不會永久塞住原地圖。',cd:2.5});
Object.assign(ES16.modes.micro,{name:'微塵航道',rule:'縮小穿晶格；切入時沿前方造三段微粒路，附近敵人仍慢速。',trade:'微粒只維持 6 秒；回復體型仍會檢查牆壁與機關。',cd:2.2});
Object.assign(ES16.modes.sliceA,{name:'A・導管內構',rule:'沿 A 內構繞過指定 B 牆；啟動時在前方 310px 造一對 7 秒導管門，靠近按 E 雙向穿行。',trade:'不穿越遠征未解鎖門；導管門需靠近才能使用。',cd:1.5});
Object.assign(ES16.modes.sliceC,{name:'C・靈魂殘響',rule:'保留異層避招；切入時把 B 層留下的元素場複寫到 C，影誘餌引怪進伏擊區。',trade:'只複寫尚存在的局部場域；C 層有自己的危險，不是永久無敵。',cd:2.4});
const switchVision=P.vSwitch;P.vSwitch=function(mode){const before=this.vision16?.mode,p=this.player,origin={x:cx(p),y:cy(p)},ok=switchVision.call(this,mode);if(!ok)return ok;mode=this.vision16.mode;const x=this.xInit();
 if(mode==='forecast')for(const e of this.enemies.filter(e=>!e.dead&&dist(e,p)<540).slice(0,3))e.future17=this.time+6;
 if(mode==='cold')for(const e of this.enemies)if(!e.dead&&dist(e,p)<360)e.freeze=Math.max(e.freeze,e.type==='sentinel'?.35:1.8);
 if(mode==='macro'){this.xPlatform(cx(p)-135,p.y+p.h-145,170,6,'earthPillar');this.xPlatform(cx(p)+180,p.y+p.h-255,200,6,'earthPillar');}
 if(mode==='micro')for(let i=0;i<3;i++)this.xPlatform(cx(p)+p.dir*(90+i*110),p.y+p.h-50-i*40,100,6);
 if(mode==='sliceA'){
 const end=this.vLanding(p.x+p.dir*310,p.y,p.w,p.h,mode);
 if(end&&!this.xBlockedGate(p.x,end.x,this.currentRoomId)){
 x.portals.push({x:origin.x,y:origin.y,to:end,t:7,room:this.currentRoomId,kind:'pipe'});
 x.portals.push({x:end.x+p.w/2,y:end.y+p.h/2,to:{x:p.x,y:p.y},t:7,room:this.currentRoomId,kind:'pipe'});
 }}
 if(mode==='sliceC'){const fs=x.fields.filter(f=>f.layer==='B'&&Math.hypot(f.x-origin.x,f.y-origin.y)<650).slice(0,5);for(const f of fs)x.fields.push({...f,id:this.id(),layer:'C',t:Math.min(f.t,4)});this.xField('shadow',origin.x,origin.y,240,4,{behavior:'decoy'});}
 this.xSignal('vision',mode);return ok;
};
// ── Five new jobs: new mechanisms plus established attack executors.
const runSkill=P.runMasterSkill;P.runMasterSkill=function(s,ctx,opts){if(!s.mode.endsWith('17'))return runSkill.call(this,s,ctx,opts);const p=this.player,x=this.xInit(),origin={x:cx(p),y:cy(p)},target=this.nearestEnemy(820),at=this.mAnchor(),mod=ctx.mod==='mechanism17',size=ctx.mod==='reach'?1.25:1;
 const pool=this.enemies.filter(e=>!e.dead&&dist(p,e)<650&&this.vCanHit(e)).sort((a,b)=>dist(a,p)-dist(b,p));
 if(s.mode==='mark17'){for(const e of pool.slice(0,mod?3:1)){e.marked17=this.time+6*size;e.hidden=false;this.vRecord({kind:'circle',x:cx(e),y:cy(e),r:55,damage:s.damage*(ctx.power||1),dir:p.dir,element:ctx.resonance||ctx.element});this.damageEnemy(e,s.damage,0,0,{master:ctx});this.vBurst(cx(e),cy(e),C.CLASSES[p.classId].accent,65);}}
 if(s.mode==='rail17'){const end={x:origin.x+p.dir*880*size,y:origin.y};this.vRecord({kind:'box',x:Math.min(origin.x,end.x),y:origin.y-65,w:Math.abs(end.x-origin.x),h:130,damage:s.damage*(ctx.power||1),dir:p.dir,element:ctx.resonance||ctx.element});this.effects.push({id:this.id(),type:'line',x:origin.x,y:origin.y,x2:end.x,y2:end.y,t:.3,max:.3,color:C.CLASSES[p.classId].accent});for(const e of pool)if(pointSegment(cx(e),cy(e),origin,end)<65){this.damageEnemy(e,s.damage,30,0,{master:ctx,br:60});e.armorBreak=3;}if(mod)this.xField('lightning',end.x,end.y,150,4);}
 if(s.mode==='platform17'){this.xPlatform(origin.x,p.y+p.h-85,(mod?170:280)*size,6*size);if(mod)this.xPlatform(origin.x+p.dir*90,p.y-100,150,6);p.vy=-330;p.onGround=false;p.shield=Math.max(p.shield,12);}
 if(s.mode==='tether17'){const ids=pool.slice(0,mod?3:2).map(e=>e.id);x.links.push({ids,t:5*size});for(const e of pool.filter(e=>ids.includes(e.id))){e.root=.7;this.vRecord({kind:'circle',x:cx(e),y:cy(e),r:55,damage:s.damage*(ctx.power||1),dir:p.dir,element:ctx.resonance||ctx.element});this.damageEnemy(e,s.damage,0,0,{master:ctx});}}
 if(s.mode==='sleep17'){for(const e of pool.filter(e=>dist(e,p)<260*size)){e.sleep17=this.time+(e.type==='sentinel'?.6:2.8);e.freeze=Math.max(e.freeze,e.type==='sentinel'?.4:2.8);}if(mod)this.xField('ice',origin.x,origin.y,230,5,{behavior:'stasis',damage:0});}
 if(s.mode==='decoy17'){this.xField(s.element,origin.x+p.dir*140,origin.y,370,5*size,{behavior:'decoy'});this.mSchedule(5*size,()=>{this.mArea(origin.x+p.dir*140,origin.y,210,s.damage,ctx);if(mod)this.xField('water',origin.x+p.dir*140,origin.y,170,3);});}
 if(s.mode==='field17')this.xField(s.element,at.x,at.y,220*size,4*size,{follow:mod,behavior:s.element==='nature'?'garden':null,damage:s.damage});
 if(s.mode==='trap17')this.xField(s.element,at.x,at.y,180*size,7,{behavior:'trap',damage:0,afterField:mod});
 if(s.mode==='anchor17'){if(x.returnAnchor&&x.returnAnchor.room===this.currentRoomId){const dest=this.vLanding(x.returnAnchor.x,x.returnAnchor.y,p.w,p.h,this.vision16.mode);if(dest){Object.assign(p,dest,{vx:0,vy:0});if(mod)this.xField('shadow',origin.x,origin.y,230,4,{behavior:'decoy'});}x.returnAnchor=null;}else x.returnAnchor={x:p.x,y:p.y,room:this.currentRoomId};p.shield=Math.max(p.shield,10);}
 if(s.mode==='portal17'){const end=this.vLanding(p.x+p.dir*360,p.y,p.w,p.h,this.vision16.mode);if(end&&!this.x17.gateSolids.some(g=>!this.xState().gates[g.biome]&&g.room===this.currentRoomId&&g.x>Math.min(end.x,p.x)&&g.x<Math.max(end.x,p.x))){x.portals.push({x:origin.x,y:origin.y,to:end,t:12,room:this.currentRoomId,shield:mod});x.portals.push({x:end.x+p.w/2,y:end.y+p.h/2,to:{x:p.x,y:p.y},t:12,room:this.currentRoomId,shield:mod});}}
 this.xSignal('mechanism',s.mode);
};
const cast=P.castMasterSkill;P.castMasterSkill=function(id,opts){const ok=cast.call(this,id,opts);if(ok){this.xInit().skillUses[id]=(this.x17.skillUses[id]||0)+1;this.xSignal('skill',id);}return ok;};
const qskill=P.useClassSkill;P.useClassSkill=function(){const p=this.player,id=p.classId;if(!ES17_SCHOOLS[id])return qskill.call(this);if(p.qCD>0||p.downT>0)return;const s=ES10_SKILLS[id][id==='cartographer'?3:id==='dreamweaver'?2:0];p.qCD=2.5;this.runMasterSkill(s,this.mSkillContext(s),{});this.commandLabel='Q・'+C.CLASSES[id].q[0];this.commandT=1;};
const classAttack=P.classAttack;P.classAttack=function(def,key){const d=classAttack.call(this,def,key),id=this.player.classId;
 if(this.xHas('prismLance'))d.w*=1.18;
 if(id==='sharpshooter'){if(key.includes('X')){d.gunShot=true;d.recoil=45;d.mElement='light';}else{d.root17=true;d.w*=1.1;}d.name=key+'・定軌槍術';}
 if(id==='puppeteer'){d.w*=1.2;if(key.endsWith('X'))d.pull=true;d.name=key+'・線偶追段';}
 if(id==='cartographer'){d.mElement=key.includes('X')?'earth':'wind';d.name=key+'・等高線斬';}
 if(id==='chef'){d.mElement=key.includes('X')?'fire':'water';d.name=key+'・翻鍋連攜';}
 if(id==='dreamweaver'){d.mElement=key.includes('X')?'shadow':'light';d.name=key+'・夢蝶連擊';}
 return d;
};
Object.assign(ATT,{ZXZX:{...ATT.XZX,name:'ZXZX・交會牽引',pull:true,kx:-180,ky:-180,dmg:23},XXZZ:{...ATT.ZZX,name:'XXZZ・破殼上升',launch:true,ky:-480,dmg:24},ZZXZX:{...ATT.XXZX,name:'ZZXZX・落點回收',kx:65,ky:160,slam:true,dmg:29},XZXZ:{...ATT.ZZXZ,name:'XZXZ・換側返空',launch:true,ky:-440,dmg:22},ZXXZ:{...ATT.ZXZZ,name:'ZXXZ・回環束縛',pull:true,kx:-180,ky:-100,dmg:24}});
const command=P.commandInput;P.commandInput=function(token){const p=this.player;if(!p.attack&&p.onGround&&!this.key('up')&&!this.key('down')&&p.castT<=0){const seq=(p.history||'')+token;if(ATT[seq]&&seq.length>=4){p.history=seq;p.historyT=1.2;return this.startAttack(seq);}}command.call(this,token);p.historyT=Math.max(p.historyT,1.05);};
// ── Crafting and repeatable shelter loop.
P.xCraft=function(id){const r=D.recipes[id],s=this.xState();if(!r)return false;if(!this.xShelter()){this.xNotice('製作需要避難所工作台，遠征中可查配方但不能遠端製作。');return false;}
 if(r.kind!=='consumable'&&(s.owned[id]||s.facilities[id])){this.xNotice('這件物品已製作，不重複消耗素材。');return false;}
 if(Object.entries(r.cost).some(([k,v])=>(s.inventory[k]||0)<v)){this.xNotice('材料不足：'+Object.entries(r.cost).map(([k,v])=>D.materials[k]+' '+(s.inventory[k]||0)+'/'+v).join('、'));return false;}
 for(const [k,v]of Object.entries(r.cost))s.inventory[k]-=v;
 if(r.kind==='consumable')s.inventory[id]=(s.inventory[id]||0)+1;else if(r.kind==='facility')s.facilities[id]=1;else{s.owned[id]=1;if(r.kind==='weapon'||r.kind==='armor')s.equipped[r.kind]=id;else if(s.equipped.tools.length<3)s.equipped.tools.push(id);}
 if(s.facilities.forge&&r.kind==='weapon')s.inventory.metal=(s.inventory.metal||0)+2;
 this.xApplyStats();this.xSignal('craft',id);this.saveProgress();this.xNotice('完成製作：'+r.name+'。'+(r.kind==='tool'&&s.equipped.tools.length>=3&&!s.equipped.tools.includes(id)?'工具槽已滿，請手動替換。':''));return true;
};
P.xEquip=function(id){const r=D.recipes[id],s=this.xState();if(!r||!s.owned[id])return false;if(!this.xShelter()){this.xNotice('回到避難所才能調整裝備。');return false;}
 if(r.kind==='tool'){const a=s.equipped.tools;if(a.includes(id))a.splice(a.indexOf(id),1);else{if(a.length>=3){this.xNotice('工具最多三件，先卸下一件。');return false;}a.push(id);}}
 else if(r.kind==='weapon'||r.kind==='armor')s.equipped[r.kind]=s.equipped[r.kind]===id?null:id;this.xApplyStats();this.saveProgress();return true;
};
P.xUseItem=function(id){const s=this.xState();if((s.inventory[id]||0)<1)return false;if(id==='medkit'){this.player.hp=Math.min(this.player.maxHp,this.player.hp+55);}else if(id==='airBottle'){this.x17.oxygen=this.xHas('gill')?48:16;}else return false;s.inventory[id]--;this.saveProgress();this.xNotice('已使用 '+D.recipes[id].name);return true;};
P.xRest=function(){if(!this.xShelter())return false;this.player.hp=this.player.maxHp;this.player.burn=this.player.poison=this.player.web=0;this.x17.oxygen=16;this.cooldownsM={};if(this.xState().facilities.infirmary)this.player.shield=20;this.saveProgress();this.xNotice('整備完成。生物依遊戲時間重生，不因按休息立即刷新。');return true;};
P.xGarden=function(){const s=this.xState();if(!this.xShelter()||!s.facilities.garden||this.progress.playSeconds<s.gardenAt)return false;s.inventory.herb=(s.inventory.herb||0)+3;s.gardenAt=this.progress.playSeconds+90;this.saveProgress();return true;};
P.xQuest=function(id){const s=this.xState(),tier=s.quests[id]||0,b=D.biomes[id];if(!b||!this.xShelter())return false;const need=3+tier*2;if((s.inventory[b.material]||0)<need){this.xNotice('此委託需 '+need+' '+D.materials[b.material]+'，交付會消耗素材。');return false;}s.inventory[b.material]-=need;s.quests[id]=tier+1;s.elementPoints+=2;s.inventory.crystal=(s.inventory.crystal||0)+2;this.mAward(null,2,0);this.saveProgress();this.xNotice('委託完成：下一階會增加素材需求，首領與變種提供更高掉落。');return true;};
P.xAdvance=function(){const s=this.xState();if(!this.xShelter()||!s.facilities.reactor||Object.keys(s.bosses).length<8){this.xNotice('遠征階級需要双相爐與八區王庭初次擊破。');return false;}s.rank=Math.min(20,s.rank+1);s.elementPoints+=4;s.bosses={};this.saveProgress();return true;};
const furniture=P.useFurniture;P.useFurniture=function(f){if(f.kind==='expeditionBench')return this.xOpen('craft');return furniture.call(this,f);};
const useNPC=P.useNPC;P.useNPC=function(n){if(n.role==='expedition17')return this.xOpen('quests');return useNPC.call(this,n);};
const interactions=P.updateInteractions;P.updateInteractions=function(){interactions.call(this);const x=this.xInit(),p=this.player;let d=105;
 const list=[...x.deposits.filter(n=>n.room===this.currentRoomId&&(n.gate?!this.xState().gates[n.gate]:this.progress.playSeconds>=(this.xState().harvest[n.id]||0))).map(n=>({kind:'xnode',ref:n,label:n.gate?'啟動環境機關 E':'採集 '+D.materials[n.material]+' E'})),...x.doors.filter(n=>n.room===this.currentRoomId).map(n=>({kind:'xdoor',ref:n,label:(n.back?'返回':'前進')+'：'+this.roomById.get(n.to).name+' E'})),...x.portals.filter(n=>n.room===this.currentRoomId).map(n=>({kind:'xportal',ref:{...n,w:0,h:0},label:'使用導管／折疊門 E'}))];
 for(const n of list){const dd=dist(p,n.ref);if(dd<d){d=dd;this.nearInteract=n;}}
 if(this.roomById.get(this.currentRoomId)?.rescue17)this.nearInteract={kind:'xrescue',label:'上升潮流 E｜返回上一處安全落腳點'};
};
const interact=P.interact;P.interact=function(){const n=this.nearInteract,s=this.xState(),x=this.xInit();if(n?.kind==='xnode'){const q=n.ref;if(q.gate)return this.xOpenGate(q.gate);s.harvest[q.id]=this.progress.playSeconds+80;s.inventory[q.material]=(s.inventory[q.material]||0)+q.amount;s.stats.harvests++;if(s.race==='human')s.inventory.metal=(s.inventory.metal||0)+1;if(s.stats.harvests%4===0)s.elementPoints++;this.xSignal('harvest',q.material);this.saveProgress();this.xNotice('採集：'+D.materials[q.material]+' ×'+q.amount+'；80 遊戲秒後再生。');return;}
 if(n?.kind==='xdoor'){if(n.ref.key17&&!s.owned.riftKey)return this.xNotice('深層王庭聯鎖：需王庭通行器。先擊破冰原、沙海、淹沒花園或空島王種取得核心。');if(n.ref.needs&&!s.gates[n.ref.needs])return this.xNotice('先開啟本房的環境機關。');return this.xTravel(n.ref.to,true);}
 if(n?.kind==='xportal'){const q=n.ref,safe=this.vLanding(q.to.x,q.to.y,this.player.w,this.player.h,this.vision16.mode);if(safe){Object.assign(this.player,safe,{vx:0,vy:0});if(q.shield)this.player.shield=16;}return;}
 if(n?.kind==='xrescue'){const a=x.lastGround;if(a){this.xTravel(a.room,true);Object.assign(this.player,{x:a.x,y:a.y});}else this.xTravel('r00',true);return;}
 return interact.call(this);
};
// Signals drive cross-system tutorials; reading an instruction never grants a pass.
P.xSignal=function(type,value){const x=this.xInit();x.signals.push({type,value,time:this.time});if(x.signals.length>100)x.signals.shift();const l=x.lesson;if(!l||l.done)return;const seq=[['harvest'],['craft'],['elementHit'],['swap'],['vision'],['hit'],['reaction']];if(seq[l.step]?.includes(type)){l.step++;if(l.step===seq.length){l.done=true;if(!this.xState().claims.labLesson){this.xState().claims.labLesson=1;this.xState().elementPoints+=4;this.mAward('x17_lab',4,0);}this.say('交會研習完成｜素材 → 製作 → 元素 → 換位 → 視界 → 命中 → 反應',4);}}};
const global=P.updateGlobalInput;P.updateGlobalInput=function(){if(this.key('expedition',true)){this.xOpen('journey');return;}return global.call(this);};
const update=P.update;P.update=function(dt,ts){const entry={x:this.player.x,y:this.player.y,room:this.currentRoomId};update.call(this,dt,ts);if(this.modalM()||this.paused)return;const x=this.xInit(),s=this.xState(),p=this.player;this.xTickFields(dt);
 if(entry.room===this.currentRoomId&&this.xBlockedGate(entry.x,p.x,entry.room)){p.x=entry.x;p.y=entry.y;p.vx=p.vy=0;this.say('環境聯鎖｜先啟動機關，再進行跨門換位。',1.4);}
 if(this.roomById.get(this.currentRoomId)?.rescue17&&p.onGround&&this.xHas('lifeline')&&x.lastGround){const a={...x.lastGround};this.xTravel(a.room,true);Object.assign(p,{x:a.x,y:a.y,shield:Math.max(12,p.shield)});this.say('救援索自動牽回｜護盾 +12',2);}
 if(this.enemies.length>280)this.enemies=this.enemies.filter(e=>!e.dead||!e.lootClaim17);

 for(const drop of x.loot){drop.t-=dt;if(dist(drop,p)<125){s.inventory[drop.item]=(s.inventory[drop.item]||0)+drop.n;drop.t=0;this.say('回收 '+D.materials[drop.item]+' ×'+drop.n,1.2);}}x.loot=x.loot.filter(q=>q.t>0);
 if(this.time>=x.pulse){x.pulse=this.time+.4;for(const e of this.enemies){const id=e.species17||e.type;if(e.dead||e.type==='dummy'||e.practiceM||!C.ENEMIES[id])continue;if(e.room===this.currentRoomId&&dist(e,p)<(this.xHas('scanner')?1000:650)&&!s.codex[id]){s.codex[id]={seen:true,kills:0,first:this.progress.playSeconds};this.say('新生態記錄｜'+e.name,2);}
  const d=dist(e,p),r=this.xRace().passive;if(d<145){if(r==='glide'&&!p.onGround)e.float17=this.time+.7;if(r==='gills')e.wet=Math.max(e.wet,.8);if(r==='root'&&e.wet>0)e.root=Math.max(e.root,.6);if(r==='float')e.float17=this.time+.7;if(r==='heat'&&e.wet>0)this.xReact('fire','water',cx(e),cy(e));if(r==='storm'&&e.wet>0&&this.time>=(e.storm17||0)){e.storm17=this.time+2;this.damageEnemy(e,7,0,0,{isEcho:true});e.stun=.3;}}}
  const r=this.xRace().passive;if(Math.abs(p.vx)<10&&p.onGround){x.stillAt??=this.time;if(r==='root'&&this.time-x.stillAt>3)p.hp=Math.min(p.maxHp,p.hp+.7);if(r==='salvage'&&this.time-x.stillAt>4)p.shield=Math.min(15,p.shield+.4);if(r==='frost'&&this.time>=(x.frostAt||0)){x.frostAt=this.time+3;this.xPlatform(cx(p),p.y+p.h+3,140,3.5,'icePlatform');}}else x.stillAt=this.time;
  if(r==='shade'&&p.dashT>0)this.xField('shadow',cx(p)-p.dir*70,cy(p),150,1.2,{behavior:'decoy'});
 }
 for(const pending of x.respawns){if(this.time<pending.at)continue;if(pending.room===this.currentRoomId&&dist(p,{x:pending.home.x,y:pending.home.y,w:0,h:0})<700)continue;const h=pending.home,e=this.spawnEnemy(h.type,h.x,h.y,h.opts);if(e&&s.rank){e.hp=e.maxHp=Math.round(e.maxHp*(1+s.rank*.15));e.damage*=1+s.rank*.06;}pending.done=true;}
 x.respawns=x.respawns.filter(q=>!q.done);
 if(this.time>x.saveAt){x.saveAt=this.time+12;this.saveProgress();x.reactionGate=Object.fromEntries(Object.entries(x.reactionGate).filter(([,t])=>t>this.time));}
 if(p.hp>p.maxHp)p.hp=p.maxHp;
};
// Unopened environmental gates are validated along the path, not merely the landing tile.
P.xBlockedGate=function(from,to,room=this.currentRoomId){return this.x17.gateSolids.some(g=>g.room===room&&!this.xState().gates[g.biome]&&((from+this.player.w<=g.x&&to+this.player.w>g.x)||(from>=g.x+g.w&&to<g.x+g.w)));};
const guardedSwap=P.swapElement;P.swapElement=function(target,el,index){if(target?.ref&&this.xBlockedGate(this.player.x,cx(target.ref)-this.player.w/2)){this.xNotice('此門受環境聯鎖保護：先啟動機關，再交換兩端。');return false;}return guardedSwap.call(this,target,el,index);};
C.CLASSES.alchemist.name='化學調律師';
D.recipes.lifeline.desc='落入底層潮床並著地後，自動拉回上一落腳點並給 12 護盾；未裝備仍可按 E 自救。';
D.recipes.beacon.desc='裝備後可從遠征頁直接返回最近前哨，而不只是最初海崖。';
D.recipes.riftKey.desc='開啟深海、影界、魔界及都市王庭聯鎖；其餘四區王種可供首次核心。';
// Only nearby crates need collision simulation; this does not delete distant puzzle pieces.
const moving17=P.updateMovingObjects;P.updateMovingObjects=function(dt){const all=this.crates;this.crates=all.filter(c=>c.room===this.currentRoomId||dist(c,this.player)<2200);try{return moving17.call(this,dt);}finally{this.crates=all;}};
// A combat course starts in the ordinary collision layer, not a stale field/lens from exploration.
const training17=P.startTraining;P.startTraining=function(id){if(!C.CLASSES[id])return;this.vResetTransient();this.xInit().fields=[];this.x17.links=[];this.x17.portals=[];return training17.call(this,id);};
window.ES17_GAMEPLAY={pointSegment};
})();
