/* V19 living frontier: local geometry, ecology, research and useful equipment.
   World coordinates remain authoritative. No room-boundary teleports. */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES19,W=ES9_WORLD;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
P.fState=function(){const s=this.progress;return s.frontier19||(s.frontier19={version:19,solved:{},blueprints:{},surveyed:{},visits:{},target:null,quickItem:'oxygenBloom',minimap:true,atlasFog:false});};
P.fInit=function(){return this.f19||(this.f19={nodes:[],hazards:[],bossAltars:[],elements:[],buffs:{},timers:{},discoveryAt:0,uiAt:0,comboTrace:[],map:{zoom:1,x:C.WORLD_W/2,y:C.WORLD_H/2},cooldownRefund:0});};
const load=P.loadProgress;P.loadProgress=function(){let raw;try{raw=JSON.parse(localStorage.getItem('es19_progress')||'null');}catch{}let p;if(raw?.schema19===19){let backup;try{backup=localStorage.getItem('es18_progress');localStorage.setItem('es18_progress',JSON.stringify(raw));p=load.call(this);}finally{try{if(backup)localStorage.setItem('es18_progress',backup);else localStorage.removeItem('es18_progress');}catch{}}p.frontier19=raw.frontier19||{};}else p=load.call(this);p.schema19=19;
 const f=p.frontier19||{};p.frontier19={version:19,solved:f.solved||{},blueprints:f.blueprints||{},surveyed:f.surveyed||{},visits:f.visits||{},target:W.rooms.some(r=>r.id===f.target)?f.target:null,quickItem:D.recipes[f.quickItem]?.kind==='consumable'?f.quickItem:'oxygenBloom',minimap:f.minimap!==false,atlasFog:!!f.atlasFog};return p;};
P.fSaveSnapshot=function(){const t=this.n18?.tutorial;return t?{...t.returnState.progress,tutorial18:{...t.returnState.progress.tutorial18,...this.progress.tutorial18}}:this.progress;};
P.saveProgress=function(){try{const p=this.fSaveSnapshot();p.schema18=18;p.schema19=19;localStorage.setItem('es19_progress',JSON.stringify(p));this.saveBlocked=false;}catch{this.saveBlocked=true;}};
// No fictitious sprite asset URLs. New actors are rendered by the native pixel renderer.
const assets=P.loadAssets;P.loadAssets=function(){const hidden={};for(const id of Object.keys(D.species)){hidden[id]=C.ENEMIES[id];delete C.ENEMIES[id];}let a;try{a=assets.call(this);}finally{Object.assign(C.ENEMIES,hidden);}return a;};
const geometry=P.buildRoomGeometry;P.buildRoomGeometry=function(r){if(!r.frontier19)return geometry.call(this,r);r.floorY=r.y+r.h-44;const floor=r.floorY;
 const plat=(x,y,w,h=20,solid=false)=>this.addPlatform(r.x+x,floor-y,w,h,'rockLedge',{room:r.id,oneWay:!solid,bed18:solid,f19:true});
 // One continuous structural floor. Local relief is constructed ABOVE it.
 plat(-28,0,r.w+56,44,true);
 if(r.shelter){plat(130,160,310);plat(r.w-470,290,340);this.ladders.push({id:this.id(),x:r.x+r.w-300,y:floor-300,w:42,h:305,room:r.id});return;}
 const z=r.stage19+ D.biomes[r.biome19].index,spread=r.w-310;
 switch(r.layout19){
 case 'terraces':for(let i=0;i<8;i++)plat(230+i*105,24*(i<4?i+1:8-i),108,24*(i<4?i+1:8-i),true);plat(300,270,360);break;
 case 'arch':plat(270,160,180,160,true);plat(r.w-500,160,190,160,true);plat(420,350,r.w-850);plat(85,80,150);break;
 case 'switchback':for(let i=0;i<5;i++)plat(i%2?160:r.w-600,130+i*115,430);break;
 case 'shaft':for(let i=0;i<5;i++)plat(i%2?110:r.w-420,140+i*115,290);break;
 case 'grotto':plat(230,120,240,120,true);plat(r.w-560,85,300,85,true);plat(320,360,290);plat(r.w-740,490,290);break;
 case 'basin':for(let i=0;i<4;i++){plat(130+i*85,96-i*24,90,96-i*24,true);plat(r.w-430+i*85,24+i*24,90,24+i*24,true);}plat(r.w*.35,350,410);break;
 case 'rib':for(let i=0;i<5;i++)plat(190+i*215,70+(i%3)*48,92,70+(i%3)*48,true);plat(270,380,340);break;
 case 'steps':for(let i=0;i<10;i++)plat(200+i*85,Math.min(i,9-i)*24,90,Math.max(24,Math.min(i,9-i)*24),true);plat(260,400,260);plat(r.w-600,500,340);break;
 case 'islands':for(let i=0;i<4;i++)plat(130+i*310,160+(i%2)*125,230);plat(r.w*.35,480,330);break;
 case 'gallery':plat(140,185,r.w*.38);plat(r.w*.52,335,r.w*.36);plat(220,525,330);break;
 case 'stagger':for(let i=0;i<5;i++)plat(125+i*240,120+(i%3)*125,180);break;
 case 'crater':plat(180,120,210,120,true);plat(r.w-400,120,220,120,true);plat(490,300,340);plat(220,510,280);break;
 }
 // All upper layers have a non-skill fallback ladder; mechanisms guard rewards,
 // not the only return path. No forced fall into a void.
 this.ladders.push({id:this.id(),x:r.x+180,y:floor-570,w:44,h:575,room:r.id},{id:this.id(),x:r.x+r.w-270,y:floor-560,w:44,h:565,room:r.id});
 for(let k=0;k<3;k++)this.rings.push({id:this.id(),x:r.x+330+k*(r.w-610)/3,y:floor-340-(k%2)*120,r:19,room:r.id});
};
const oldBuildEnemies=P.buildEnemies;P.buildEnemies=function(){const all=this.rooms;this.rooms=all.filter(r=>!r.frontier19);try{return oldBuildEnemies.call(this);}finally{this.rooms=all;}};
const spawn=P.spawnEnemy;P.spawnEnemy=function(type,x,y,opts={}){const e=spawn.call(this,type,x,y,opts),s=D.species[type];if(!e||!s)return e;Object.assign(e,{frontier19:true,ai:'frontier19',species17:type,sprite17:null,hidden:false,x17:true,fPrimary:s.primary,fSecondary:s.secondary,fStep:0,fPhase:1,fAttackAt:this.time+1.1,fWindup:0,fRecovery:0,fAnchorX:x,homeY:y,range:880,drop17:{...s.drops},fElement:s.element,aggro:false});e.w=s.boss?110:['ray','fish','beast','golem'].includes(s.shape)?68:54;e.h=s.boss?112:['insect','ray'].includes(s.shape)?44:56;e.x=x-e.w/2;e.y=y-e.h;e.hp=e.maxHp=opts.hp||s.hp;e.speed=s.speed;e.damage=s.damage;e.xBoss=s.boss;if(s.boss){e.breakMax=e.break=200;e.type='sentinel';e.bossAwake=true;}return e;};
const build=P.buildWorld;P.buildWorld=function(){this.fInit();build.call(this);const f=this.f19;this.fState();
 for(const r of this.rooms.filter(r=>r.frontier19)){
  const b=D.biomes[r.biome19],y=r.floorY;const base={room:r.id,w:42,h:58};
  // Two renewable regional deposits and a universal supply keep recipe loops solvable.
  for(let k=0;k<3;k++)this.x17.deposits.push({id:r.id+'_gather'+k,room:r.id,x:r.x+90+k*140,y:y-38,w:34,h:38,material:k===2?'fiber':b.material,amount:k===2?3:2});
  if(r.shelter){this.furniture.push({id:this.id(),kind:'expeditionBench',room:r.id,x:r.x+700,y:y-65,w:72,h:65});this.npcs.push({id:this.id(),name:b.name+'研究員',role:'frontier19',x:r.x+820,y:y-62,w:40,h:62,room:r.id});f.nodes.push({...base,id:r.id+'_camp',x:r.x+545,y:y-58,kind:'camp',label:'啟用前哨／補給'});}
  else{
   const primaryY=r.task19==='climb'?y-560:y;const atX=r.x+r.w*.62;
   f.nodes.push({...base,id:r.id+'_console',x:atX,y:primaryY-58,kind:'console',label:r.taskTitle19});
   if(['sequence','gears'].includes(r.task19))f.nodes.push({...base,id:r.id+'_first',x:r.x+80,y:y-58,kind:'first',label:'先啟動左輪'});
   f.nodes.push({...base,id:r.id+'_cache',x:r.x+r.w-120,y:y-44,h:44,kind:'cache',label:'研究匣・'+b.material});
   if(!r.boss19){for(let k=0;k<2+(r.stage19%2);k++){const xx=r.x+590+k*235;let ground=y;for(const p of this.platforms)if(p.room===r.id&&!p.oneWay&&p.x<xx&&p.x+p.w>xx)ground=Math.min(ground,p.y);this.spawnEnemy(b.fauna[(k+r.stage19)%2],xx,ground,{room:r.id});}}
   else f.bossAltars.push({room:r.id,boss:r.boss19});
   // Rule structure meaningfully changes the routes to the high area.
   this.n18.structures.push({id:r.id+'_past',x:r.x+390,y:y-240,w:440,h:22,kind:'bridge',modes:['past'],oneWay:true,label:'過去・舊步道',room:r.id},{id:r.id+'_future',x:r.x+r.w*.72,y:y-90,baseY:y-90,w:195,h:20,kind:'lift',modes:['future'],oneWay:true,label:'未來・升降台',room:r.id},{id:r.id+'_inner',x:r.x+r.w*.33,y:y-440,w:370,h:20,kind:'bridge',modes:['inner'],oneWay:true,label:'裏層・支路',room:r.id});
  }
 }
 // Every old ordinary species has a counterpart, challenged at its real habitat.
 const group=new Map();for(const e of this.enemies.filter(e=>!e.frontier19&&!e.dead)){const id=e.species17||e.type,bid=D.legacyBoss[id];if(!bid)continue;let list=group.get(e.room)||[];if(!list.includes(id))list.push(id);group.set(e.room,list);}
 for(const [rid,ids]of group){const r=this.roomById.get(rid);if(!r||r.shelter)continue;f.nodes.push({id:rid+'_kings',room:rid,x:r.x+Math.min(r.w-120,420),y:r.floorY-62,w:48,h:62,kind:'legacyBoss',label:'原種召王碑',species:ids,index:0});}
 // Some rare original species only appear later. Codex can list their nearest
 // known habitat, and the regional research table can challenge discovered ones.
 this.f19.originalKingHabitats=group;
};
// Accurate water bounds: lower basins only; air bells always remain accessible.
const env=P.xEnvironment;P.xEnvironment=function(){const e=env.call(this),r=this.roomById.get(this.currentRoomId),b=D.biomes[r?.biome19],p=this.player,f=this.fInit();if(!b||r.shelter)return e;const inside=p.x+p.w>r.x&&p.x<r.x+r.w&&p.y+p.h>r.y&&p.y<r.floorY+70;if(!inside)return e;
 const k=b.env,t=this.time;Object.assign(e,{biome:'f19_'+b.id,frontier19:k});
 if(['water','tide','current','pressure','mercury'].includes(k)){const depth=k==='pressure'?r.h-110:k==='water'?420:k==='mercury'?190:290;const lowered=this.fState().solved[r.id+'_pump'];let surface=r.floorY-depth+(lowered?210:0)+(k==='tide'?Math.sin(t*.22)*55:0);e.surface19=surface;e.water=cy(p)>surface;e.pressure=e.water&&k==='pressure'&&!this.xHas('abyssHarness');if(e.water){e.gravity=.24;e.speed=this.xState().race==='merfolk'?1:this.xHas('rootSpool')||this.xHas('abyssHarness')?.86:.62;if(k==='mercury'&&!this.xHas('mercuryValve'))e.speed=.48;}}
 if(k==='cold'||k==='aurora'||k==='dream'){e.cold=this.xState().race!=='frost'&&!this.xHas('thermal')&&!this.xHas('snowWeave')&&!(f.buffs.warm>t);e.slip=e.cold&&!this.xHas('iceGrip');}
 if(k==='sand'&&!this.xHas('sandSkates')&&!this.xHas('sandBoots')&&this.xState().race!=='sand')e.speed=.75;
 if(['salt','resin','root'].includes(k)&&!this.xHas('resinPads')&&!this.xHas('brineFilter'))e.speed=p.onGround?.8:1;
 if(k==='wind')e.gravity=.62;if(k==='moon'&&!this.xHas('moonGyro'))e.gravity=Math.sin(t*.6)>0?.55:1.35;
 if(k==='dream'&&!this.xHas('wakeChime')&&Math.sin(t*.45)>0)e.speed=.73;
 e.hot=k==='heat'&&!this.xHas('cinderBoot')&&!this.xHas('heatSuit');e.magnetic=k==='magnetic'&&!this.xHas('magnetPouch')&&!this.xHas('insulator');
 for(const s of this.nInit().structures)if(s.kind==='air'&&s.room===r.id&&hit(p,s)){e.water=e.pressure=false;}
 if(f.buffs.bubble>t&&Math.hypot(cx(p)-f.buffs.bubbleX,cy(p)-f.buffs.bubbleY)<140)e.water=e.pressure=false;
 return e;
};
const oldHas=P.xHas;P.xHas=function(id){if(oldHas.call(this,id))return true;const eq=this.xState().equipped;const has=v=>eq.weapon===v||eq.armor===v||eq.tools.includes(v);return id==='pressure'?has('abyssHarness')&&has('bellLung'):id==='thermal'?has('snowWeave'):id==='iceGrip'?has('snowWeave'):id==='heatSuit'?has('cinderBoot'):id==='filter'?has('brineFilter'):id==='sandBoots'?has('sandSkates'):id==='insulator'?has('groundRod')||has('magnetPouch'):id==='glider'?has('sailFrame'):false;};
const updatePlayer=P.updatePlayer;P.updatePlayer=function(dt){const f=this.fInit(),p=this.player,oxy=this.xInit().oxygen;if(this.xHas('bellLung'))this.x17.oxygen=Math.max(16,oxy);updatePlayer.call(this,dt);const r=this.roomById.get(this.currentRoomId),b=D.biomes[r?.biome19],e=this.xEnvironment(),t=this.time;
 if(this.xHas('bellLung')&&e.water)this.x17.oxygen=Math.max(oxy,16);if(this.xHas('resinPads'))p.web=0;
 if(!b||r.shelter||!e.frontier19)return;
 const k=b.env,protect=f.buffs.clean>t;let ax=0;
 if(k==='wind')ax=Math.sin(t*.55)*110;if(k==='sand')ax=Math.sin(t*.8+r.art)*65;
 if(['current','tide'].includes(k)&&e.water)ax=(this.fState().solved[r.id+'_pump']?-1:1)*70;
 if(k==='vector')ax=Math.sin(t*.7)*120;if(k==='magnetic')ax=Math.sin(t)*55;
 if(!this.xHas('vectorGyro')&&!this.xHas('moonGyro'))p.vx+=ax*dt;
 if(k==='wind'&&this.xHas('sailFrame')&&this.key('jump'))p.vy-=210*dt;
 if(this.xHas('rootSpool')&&p.climbing)p.y-=this.key('up')?90*dt:0;
 if(['spore','root'].includes(k)&&!protect&&!this.xHas('filter')&&!(f.buffs.warm>t)&&t%8>5&&Math.abs(cx(p)-(r.x+r.w*.48))<210)this.hurtPlayer(1.2*dt,0,0,'孢霧侵蝕',true);
 if(k==='salt'&&e.water&&!protect&&!this.xHas('brineFilter'))this.hurtPlayer(dt,0,0,'鹵液腐蝕',true);
 if(k==='storm'&&t%6>5.25&&Math.abs(cx(p)-(r.x+r.w*.52))<85){if(this.xHas('groundRod')||f.buffs.ground>t){if((f.timers.rod||0)<t){p.shield=Math.min(45,p.shield+6);f.timers.rod=t+2;}}else this.hurtPlayer(12*dt,0,0,'環境雷擊',true);}
 if(['laser','glass'].includes(k)&&!this.fState().solved[r.id]&&t%7>5.5&&Math.abs(cx(p)-(r.x+r.w*.45))<27&&!this.xHas(k==='laser'?'laserCloak':'shadeLens'))this.hurtPlayer(8*dt,0,0,'掃描環境光束',true);
 if(k==='fossil'&&t%6>5.4&&p.onGround&&Math.abs(cx(p)-(r.x+r.w*.5))<170)this.hurtPlayer(4*dt,0,0,'落石震波',true);
};
const hurt=P.hurtPlayer;P.hurtPlayer=function(dmg,kx,ky,source,dot){const f=this.fInit();if(dot&&f.buffs.clean>this.time&&/孢|鹵|寒冷|磁|環境/.test(source))return;if(dot&&f.buffs.ground>this.time&&/環境雷|磁/.test(source))return;const old=this.player.hp;hurt.call(this,dmg,this.xHas('vectorGyro')?kx*.3:kx,ky,source,dot);if(old>this.player.hp&&!dot&&this.xHas('snowWeave')&&(['cold','aurora','dream'].includes(D.biomes[this.roomById.get(this.currentRoomId)?.biome19]?.env)||this.roomById.get(this.currentRoomId)?.biome==='glacier'))this.player.shield=Math.max(this.player.shield,8);};
// Trace element contact for local devices. Shooting near a device does not warp
// or grant completion; the player still reaches and operates it with E.
const fire=P.fireElement;P.fireElement=function(el,i){fire.call(this,el,i);};
P.fElementNear=function(node,allowed){const f=this.fInit();return f.elements.some(q=>q.until>this.time&&allowed.includes(q.element)&&Math.hypot(q.x-cx(node),q.y-cy(node))<190)||this.xInit().fields.some(q=>allowed.includes(q.element)&&q.t>0&&Math.hypot(q.x-cx(node),q.y-cy(node))<q.r+50);};
P.fSolve=function(r){const st=this.fState();if(st.solved[r.id])return true;st.solved[r.id]=1;const b=D.biomes[r.biome19];st.blueprints[b.item]=1;this.xState().elementPoints++;this.nEvent('research19',r.id);this.saveProgress();this.say(r.name+' 已解析｜研究匣解鎖・元素點 +1',3,b.color);return true;};
P.fOperate=function(node){const r=this.roomById.get(node.room),f=this.fInit(),s=this.fState(),b=D.biomes[r?.biome19],t=this.time;if(node.kind==='legacyBoss'){const ids=node.species.filter(id=>this.xState().codex[id]);if(!ids.length){this.say('先遭遇附近的原生種，才能向召王碑挑戰。',2.5);return false;}const id=ids[node.index++%ids.length];return this.fSummonBoss(D.legacyBoss[id],r);}
 if(node.kind==='camp'){this.progress.shelters[r.id]=true;this.progress.discovered[r.id]=true;this.xState().lastCamp=r.id;this.player.checkpoint={x:r.x+480,y:r.floorY-this.player.h,room:r.id};s.blueprints[b.item]=1;this.saveProgress();this.xOpen('craft');return true;}
 if(node.kind==='first'){f.timers[r.id]=t+12;this.say('左輪已啟動｜12 秒內到右輪按 E。',2);return true;}
 if(node.kind==='cache'){if(!s.solved[r.id]){this.say('研究匣尚未開啟：'+r.note,3);return false;}if(s.solved[node.id]){this.say('此研究匣已領取。素材礦點與怪物仍會再生。',2);return false;}s.solved[node.id]=1;const inv=this.xState().inventory;inv[b.material]=(inv[b.material]||0)+4;inv.crystal=(inv.crystal||0)+2;this.mAward('frontier19:'+r.id,2,0);this.saveProgress();this.say('研究匣｜'+ES17.materials[b.material]+' ×4・晶體 ×2・職業點 +2',3);return true;}
 if(r.boss19)return this.fSummonBoss(r.boss19,r);
 const mode=this.vInit().mode,task=r.task19;let ok=false;
 if(['pump','tide','air'].includes(task)){s.solved[r.id+'_pump']=s.solved[r.id+'_pump']?0:1;ok=true;if(task==='air')this.n18.structures.push({id:'f19_air_'+this.id(),x:node.x-70,y:node.y-140,w:190,h:210,kind:'air',modes:['all'],room:r.id,until:t+60,label:'60 秒補氧潛鐘'});}
 else if(['sequence','gears'].includes(task))ok=(f.timers[r.id]||0)>t;
 else if(['past','inner','echo','heavy','invert','future','elastic'].includes(task))ok=mode===task;
 else if(task==='decay')ok=mode==='decay'&&t-this.n18.ruleAt>=3;
 else if(task==='fungal')ok=mode==='fungal'&&this.n18.structures.some(q=>q.fungus18&&Math.hypot(cx(q)-cx(node),q.y-node.y)<700);
 else if(task==='clock')ok=['future','invert'].includes(mode);
 else if(task==='climb')ok=true;
 else if(task==='sleep')ok=this.enemies.some(e=>!e.dead&&e.sleep17>t&&dist(e,node)<700)||this.fElementNear(node,['shadow']);
 else{const req={wind:['wind'],light:['light'],current:['water','wind'],cold:['fire'],fire:['fire'],cleanse:['fire','light'],water:['water'],earth:['earth','gravity'],vent:['water','ice'],nature:['nature','water'],lightning:['lightning'],magnet:['lightning','gravity'],reflect:['light','ice'],storm:['lightning'],root:['nature','fire'],laser:['lightning'],resin:['fire','ice'],gravity:['gravity'],quake:['earth'],dream:['light','shadow']}[task]||[];ok=this.fElementNear(node,req);
  if(task==='cold'&&this.xHas('thermal')||task==='cleanse'&&this.xHas('filter')||task==='storm'&&this.xHas('groundRod')||task==='laser'&&mode==='future'||['gravity','quake'].includes(task)&&mode==='heavy'||task==='dream'&&this.xHas('wakeChime'))ok=true;
 }
 if(ok){if(task==='nature')this.n18.structures.push({id:'f19_grown_'+r.id,x:node.x-220,y:node.y-150,w:300,h:20,kind:'bridge',modes:['all'],oneWay:true,label:'育成根橋',room:r.id});return this.fSolve(r);}this.say('尚未符合條件｜'+r.note,4);return false;
};
P.fSummonBoss=function(id,r){const s=D.species[id];if(!s||!r||r.shelter)return false;if(this.enemies.some(e=>e.species17===id&&!e.dead)){this.say('該頭目已在場上；不會重複召喚或刷新生命。',2);return false;}const f=this.fInit(),ready=f.timers['boss:'+id]||0;if(ready>this.time){this.say('王種恢復中｜'+Math.ceil(ready-this.time)+' 秒後可再次挑戰。',2);return false;}let x=r.x+r.w*.70,y=r.floorY;for(const p of this.platforms)if(p.room===r.id&&!p.oneWay&&p.x<x&&p.x+p.w>x)y=Math.min(y,p.y);const e=this.spawnEnemy(id,x,y,{room:r.id});e.fAttackAt=this.time+1.8;e.home17=null;this.xState().codex[id]||={seen:true,kills:0,first:this.progress.playSeconds};this.nEvent('bossSummon19',id);this.say(s.name+'｜红框預告→出手→後搖；半血換招。',3);return true;};
const killed=P.xKilled;P.xKilled=function(e){killed.call(this,e);if(e.frontier19&&e.xBoss){this.fInit().timers['boss:'+e.species17]=this.time+120;const r=this.roomById.get(e.room);if(r?.boss19===e.species17)this.fSolve(r);this.x17.respawns=this.x17.respawns.filter(p=>p.home.type!==e.species17);}};
const interactions=P.updateInteractions;P.updateInteractions=function(){interactions.call(this);const p=this.player;let best=this.nearInteract?.ref?dist(p,this.nearInteract.ref):110;for(const n of this.fInit().nodes){if(n.room!==this.currentRoomId&&dist(n,p)>130)continue;const d=dist(n,p);if(d<Math.min(110,best)){best=d;this.nearInteract={kind:'frontier19',ref:n,label:n.label};}}};
const interact=P.interact;P.interact=function(){if(this.nearInteract?.kind==='frontier19')return this.fOperate(this.nearInteract.ref);return interact.call(this);};
const npc=P.useNPC;P.useNPC=function(n){if(n.role==='frontier19'){const r=this.roomById.get(n.room),b=D.biomes[r.biome19];this.say(b.name+'：'+b.fauna.map(id=>D.species[id].name).join('、')+'；地圖點選地點可看機關與回報。',5);return;}return npc.call(this,n);};
const craft=P.xCraft;P.xCraft=function(id){const r=D.recipes[id];if(r?.biome19&&!this.fState().blueprints[id]){this.xNotice('尚未取得藍圖：徒步抵達 '+D.biomes[r.biome19].name+' 前哨或完成當地研究。');return false;}return craft.call(this,id);};
const item=P.xUseItem;P.xUseItem=function(id){const r=D.recipes[id];if(!r||r.kind!=='consumable')return item.call(this,id);const inv=this.xState().inventory;if((inv[id]||0)<1){this.say('背包沒有 '+r.name+'，請回工作台製作。',2);return false;}const p=this.player,f=this.fInit(),t=this.time;
 switch(r.effect){case 'bubble19':Object.assign(f.buffs,{bubble:t+20,bubbleX:cx(p),bubbleY:cy(p)});break;
 case 'survey19':{const rid=this.currentRoomId;this.fState().surveyed[rid]=true;for(const e of W.edges)if(e.a===rid||e.b===rid)this.fState().surveyed[e.a===rid?e.b:e.a]=true;break;}
 case 'clean19':p.burn=p.poison=p.web=0;f.buffs.clean=t+15;break;
 case 'lure19':this.nObject('decoy',cx(p)+p.dir*100,cy(p),{duration:8,r:600,label:r.name});break;
 case 'ground19':f.buffs.ground=t+20;break;case 'tempoBuff19':f.buffs.tempo=t+15;break;
 case 'bridge19':this.n18.structures.push({id:'mesh19_'+this.id(),x:cx(p)+p.dir*120-110,y:p.y+p.h-85,w:240,h:18,kind:'bridge',oneWay:true,modes:['all'],until:t+15,label:r.name,ability18:true});break;
 case 'warm19':f.buffs.warm=t+30;break;default:return item.call(this,id);}
 inv[id]--;this.nEvent('item19',id);this.saveProgress();this.say(r.name+' 已使用｜'+r.desc,3);return true;};
const travel=P.xTravel;P.xTravel=function(id,force=false){const r=this.roomById.get(id);if(r?.frontier19&&!force&&!this.progress.discovered[id]){this.say('尚未親自抵達此處。先走連續步道，不能用地圖跳過探索。',2.5);return false;}const ok=travel.call(this,id,force);if(ok){this.fInit().elements=[];this.fInit().bossFocus=null;}return ok;};
const update=P.update;P.update=function(dt,ts){update.call(this,dt,ts);if(this.modalM()||this.paused)return;const f=this.fInit(),p=this.player,t=this.time,r=this.roomById.get(this.currentRoomId);const st=this.fState();
 f.elements=f.elements.filter(q=>q.until>t);if(t>(f.elementAt||0)){f.elementAt=t+.09;for(const q of this.elementShots)if(q.t>0&&!q.dead)f.elements.push({x:cx(q),y:cy(q),element:q.element,until:t+3.4});if(f.elements.length>220)f.elements.splice(0,f.elements.length-220);}
 // A small overlap at a corridor does not mark a distant room as visited.
 if(r&&hit(p,r)){st.visits[r.id]=true;if(r.shelter&&r.frontier19){const b=D.biomes[r.biome19];st.blueprints[b.item]=true;this.progress.shelters[r.id]=true;}}
 if(this.xHas('magnetPouch'))for(const q of this.x17.loot)if(dist(q,p)<420){q.x+=(cx(p)-cx(q))*Math.min(1,dt*6);q.y+=(cy(p)-cy(q))*Math.min(1,dt*6);}
 if(this.xHas('wakeChime'))for(const s of ES18.skills[p.classId])s.holdTime18=s.class18==='sharpshooter'?.72:.52;else for(const s of ES18.skills[p.classId])s.holdTime18=s.class18==='sharpshooter'?.9:.65;
 if(this.key('quickItem',true))this.xUseItem(st.quickItem);this.fTickHazards?.(dt);
};
C.DEFAULT_KEYS.quickItem='KeyG';const keys=P.loadKeys;P.loadKeys=function(){const k=keys.call(this);return{...k,quickItem:k.quickItem||'KeyG'};};
// Allow larger codex while keeping prototype-pollution protections of the existing normalizer.
const normalize=window.ES17_NORMALIZE;window.ES17_NORMALIZE=function(v){const n=normalize(v);for(const [id,q]of Object.entries(v?.codex||{}))if(C.ENEMIES[id]&&q&&typeof q==='object')n.codex[id]={seen:true,kills:clamp(+q.kills||0,0,1e7),first:clamp(+q.first||0,0,1e9)};return n;};
})();
