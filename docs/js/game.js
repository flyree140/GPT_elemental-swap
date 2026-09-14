/*
 * Elemental Swap V9 — Organic World / Command Lab
 * ============================================================================
 * A dependency-light Canvas game prototype designed for GitHub Pages.
 *
 * File responsibilities:
 *   world.js   : the authored room graph (52 rooms / 71 connections)
 *   config.js  : values, classes, elements and enemy archetypes
 *   game.js    : physics, combat, rendering, puzzles and interaction
 *
 * V9 intentionally keeps the original mechanic:
 *   press an element key once  -> fire a slow elemental anchor
 *   press the same key again   -> swap with that anchor / marked enemy
 * ============================================================================
 */
(function(){
'use strict';
const C=window.ES9, W=window.ES9_WORLD;
if(!C||!W)throw new Error('V9 requires js/world.js before js/config.js and js/game.js');

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const sign=v=>v<0?-1:1;
const cx=o=>o.x+o.w/2, cy=o=>o.y+o.h/2;
const distXY=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const distance=(a,b)=>distXY(cx(a),cy(a),cx(b),cy(b));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const inView=(o,cam,w,h,m=180)=>o.x+o.w>cam.x-m&&o.x<cam.x+w+m&&o.y+o.h>cam.y-m&&o.y<cam.y+h+m;
const friendly=code=>({Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Tab:'TAB'}[code]||code.replace('Key','').replace('Digit',''));
const rgba=(hex,a)=>{if(!hex||hex[0]!=='#')return hex;let h=hex.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};

class Input{
 constructor(){this.held=new Set();this.pressed=new Set();this.released=new Set();this.capture=null;
  addEventListener('keydown',e=>{if(this.capture){e.preventDefault();const fn=this.capture;this.capture=null;fn(e.code);return;}if(!this.held.has(e.code))this.pressed.add(e.code);this.held.add(e.code);if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab'].includes(e.code))e.preventDefault();},{passive:false});
  addEventListener('keyup',e=>{this.held.delete(e.code);this.released.add(e.code);});addEventListener('blur',()=>this.held.clear());
 }
 down(c){return this.held.has(c)} tap(c){return this.pressed.has(c)} up(c){return this.released.has(c)} end(){this.pressed.clear();this.released.clear();}
}

class Synth{
 constructor(){this.ctx=null;this.master=null;}
 ensure(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.13;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return this.ctx;}
 tone(f=220,d=.07,type='square',g=.1,end=f*.7){const c=this.ensure();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.type=type;o.frequency.setValueAtTime(f,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,end),c.currentTime+d);v.gain.setValueAtTime(g,c.currentTime);v.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(v).connect(this.master);o.start();o.stop(c.currentTime+d+.02);}
 slash(big=false){this.tone(big?115:235,big?.09:.055,'sawtooth',big?.15:.09,big?55:480)}
 hit(big=false){this.tone(big?68:105,big?.08:.045,'square',big?.16:.1,42)}
 jump(){this.tone(330,.075,'square',.07,560)} dash(){this.tone(145,.075,'sawtooth',.08,430)}
 swap(i=0){this.tone(280+i*25,.14,'sine',.09,760+i*25)} collect(){this.tone(520,.17,'triangle',.1,1050);setTimeout(()=>this.tone(790,.11,'sine',.06,1320),65)}
 skill(){this.tone(130,.16,'sawtooth',.09,430)} error(){this.tone(80,.09,'square',.08,50)}
}

const PLAYER_ROWS={idle:0,run:1,jump:2,fall:3,z1:4,z2:5,x:6,launch:7,air:8,dash:9,hurt:10,down:11,cast:12};
const ENEMY_ROWS={idle:0,move:1,attack:2,special:3,hurt:4,down:5};
const GATE_TO_PUZZLE={fire:'p_fire',ice:'p_ice',circuit:'p_circuit',nature:'p_nature',gravity:'p_gravity',thermal:'p_thermal',shadow:'p_shadow',light:'p_light',wind:'p_wind',elements:'p_elements'};
const FURNITURE_KINDS=['fridge','bed','workbench','radio','locker','map','terminal','stove','purifier','shelf','sofa','lamp'];
const NPC_ROLES=[
 ['醫護員・澄','medic','完全治療、解除異常並把此處設為重生點。'],
 ['戰技教官・環','trainer','依職業輪播 Z/X 分支與技能接招教學。'],
 ['機巧師・鉚釘','mechanic','重置技能冷卻並啟動避難所設備。'],
 ['地圖師・苔','cartographer','揭露相鄰房間、支線與能力門。'],
 ['軍需官・梁','quartermaster','用零件換取護盾與暫時 BREAK 強化。'],
 ['檔案員・M3','archivist','解鎖怪物對策、記憶與隱藏房提示。'],
 ['園丁・芽','gardener','強化自然、噴泉與避難所作物。'],
 ['巡索員・雁','ranger','標出最近的未收集功能神殿與安全路線。']
];

class Game{
 constructor(){
  this.canvas=$('#game');this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.input=new Input();this.sfx=new Synth();this.keys=this.loadKeys();
  this.time=0;this.last=performance.now();this.paused=false;this.viewW=C.VIEW_W;this.viewH=C.VIEW_H;this.camera={x:clamp(C.START_X-C.VIEW_W*.42,0,C.WORLD_W-C.VIEW_W),y:clamp(C.START_Y-C.VIEW_H*.68,0,C.WORLD_H-C.VIEW_H)};
  this.shake=0;this.hitStop=0;this.flash=0;this.damageFlash=0;this.nextId=1;this.message={text:'',t:0,color:'#70ded9'};this.combo={hits:0,damage:0,t:0,best:0};this.commandLabel='';this.commandT=0;
  this.rooms=[];this.roomById=new Map();this.platforms=[];this.ladders=[];this.rings=[];this.gates=[];this.puzzles=[];this.furniture=[];this.npcs=[];this.collectibles=[];this.crates=[];
  this.enemies=[];this.enemyShots=[];this.elementShots=[];this.skillShots=[];this.fields=[];this.effects=[];this.summons=[];this.turrets=[];this.afterimages=[];
  this.currentElement='fire';this.lastElementUse=null;this.lastSwap=null;this.currentRoomId='r00';this.currentRegion='tide';this.nearInteract=null;this.objectiveStep=0;this.remote=null;this.bossIntroPlayed=false;this.bossDefeated=false;
  this.progress=this.loadProgress();this.assets=this.loadAssets();this.player=this.makePlayer();this.network=new ES9Network();
  this.buildWorld();this.bindUI();this.bindNetwork();this.resize();addEventListener('resize',()=>this.resize());addEventListener('keydown',()=>this.sfx.ensure(),{once:true});
  this.say('避難所安全區｜先用方向鍵移動，再練 Z、X 與 1→1 換位。',5);
  requestAnimationFrame(t=>this.loop(t));
 }
 id(){return this.nextId++}
 loadKeys(){try{return Object.assign({},C.DEFAULT_KEYS,JSON.parse(localStorage.getItem('es9_keys')||'{}'));}catch{return{...C.DEFAULT_KEYS}}}
 saveKeys(){try{localStorage.setItem('es9_keys',JSON.stringify(this.keys));}catch{}}
 defaultProgress(){return{classId:'rift',hpBonus:0,mobility:0,element:0,crest:0,memory:0,shelter:0,scrap:0,opened:{},solved:{},shelters:{r00:true},discovered:{r00:true},lore:[],comboLesson:0,playSeconds:0};}
 loadProgress(){try{return Object.assign(this.defaultProgress(),JSON.parse(localStorage.getItem('es9_progress')||'{}'));}catch{return this.defaultProgress()}}
 saveProgress(){try{localStorage.setItem('es9_progress',JSON.stringify(this.progress));}catch{}}
 key(a,tap=false){const c=this.keys[a];return tap?this.input.tap(c):this.input.down(c)}
 released(a){return this.input.up(this.keys[a])}
 say(text,t=2.4,color='#70ded9'){this.message={text,t,color}}
 resize(){const r=this.canvas.getBoundingClientRect();const d=Math.min(2,devicePixelRatio||1);this.canvas.width=Math.max(960,Math.floor(r.width*d));this.canvas.height=Math.max(540,Math.floor(r.height*d));this.ctx.setTransform(d,0,0,d,0,0);this.viewW=r.width;this.viewH=r.height;this.ctx.imageSmoothingEnabled=false;}
 loadAssets(){const m={},paths={};
  for(const reg of W.regions)for(const l of ['far','mid','near'])paths[`bg_${reg.palette}_${l}`]=`assets/backgrounds/v9/${reg.palette}_${l}.png`;
  paths.shelterAtlas='assets/rooms/shelter_atlas.png';paths.caveAtlas='assets/rooms/cave_atlas.png';paths.facilityAtlas='assets/rooms/facility_atlas.png';paths.furniture='assets/sprites/furniture_atlas.png';paths.worldMap='assets/ui/WORLD_MAP_V9.png';
  for(const c of Object.keys(C.CLASSES).filter(k=>k!=='beast'))paths[`player_${c}`]=`assets/sprites/player_${c}.png`;
  for(const f of ['wolf','eagle','bear','king'])paths[`player_beast_${f}`]=`assets/sprites/player_beast_${f}.png`;
  for(const e of Object.keys(C.ENEMIES))if(e!=='dummy')paths[`enemy_${e}`]=`assets/sprites/enemy_${e}.png`;
  for(const e of C.ELEMENTS)paths[`element_${e.id}`]=`assets/vfx/element_${e.id}.png`;
  for(const k of ['slash','hit','ring'])paths[k]=`assets/vfx/${k}.png`;
  for(const k of Object.keys(C.COLLECTIBLES))paths[`collect_${k}`]=`assets/ui/collect_${k}.png`;
  for(const[k,src]of Object.entries(paths)){const im=new Image();im.src=(window.ES9_ASSET_URIS&&window.ES9_ASSET_URIS[src])||src;im.decoding='async';m[k]=im;}return m;
 }
 makePlayer(){const cl=C.CLASSES[this.progress.classId]||C.CLASSES.rift;return{x:C.START_X,y:C.START_Y,w:40,h:60,vx:0,vy:0,dir:1,onGround:false,wallLeft:false,wallRight:false,coyote:0,jumpBuffer:0,jumps:0,airDashes:1,dashT:0,dashCD:0,grapple:null,classId:this.progress.classId,hp:cl.hp+this.progress.hpBonus,maxHp:cl.hp+this.progress.hpBonus,shield:0,inv:0,phase:0,armor:0,web:0,burn:0,poison:0,skillCD:[0,0,0,0,0],qCD:0,attack:null,buffer:null,history:'',historyT:0,hurtT:0,downT:0,recoverT:0,castT:0,form:'wolf',kingT:0,parry:0,anchor:null,rewind:[],checkpoint:{x:C.START_X,y:C.START_Y,room:'r00'},foodT:0,workT:0,classGauge:0,parasiteId:null,parasiteDashes:0};}
 roomAt(x,y){let best=null;for(const r of this.rooms)if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return r;if(!best){let d=Infinity;for(const r of this.rooms){const q=distXY(x,y,r.x+r.w/2,r.y+r.h/2);if(q<d){d=q;best=r}}}return best;}
 regionData(id){return W.regions.find(r=>r.id===id)||W.regions[0]}
 addPlatform(x,y,w,h=20,type='platform',opts={}){const s={id:this.id(),x,y,w,h,type,oneWay:opts.oneWay??true,active:opts.active??true,...opts};this.platforms.push(s);return s;}
 addFx(type,x,y,t=.3,scale=1,color='#fff',dir=1,extra={}){this.effects.push({id:this.id(),type,x,y,t,max:t,scale,color,dir,...extra})}
}

/* --------------------------------------------------------------------------
 * WORLD BUILDING
 * -------------------------------------------------------------------------- */
Game.prototype.buildWorld=function(){
 this.rooms=W.rooms.map(r=>({...r}));this.roomById=new Map(this.rooms.map(r=>[r.id,r]));
 this.platforms=[];this.ladders=[];this.rings=[];this.gates=[];this.puzzles=[];this.furniture=[];this.npcs=[];this.collectibles=[];this.crates=[];this.enemies=[];
 // Room interiors. These are intentionally different by room type rather than
 // generated as a repeated tower grid.
 for(const r of this.rooms)this.buildRoomGeometry(r);
 W.edges.forEach((e,i)=>this.buildConnection(e,i));
 this.buildPuzzleObjects();this.buildShelters();this.buildCollectibles();this.buildEnemies();
 // Training dummy in the starting shelter.
 this.spawnEnemy('dummy',1580,14185,{room:'r00'});
 const safe=this.findSafePosition(C.START_X,C.START_Y,this.player.w,this.player.h);this.player.x=safe.x;this.player.y=safe.y;this.player.checkpoint={...safe,room:'r00'};
};

Game.prototype.buildRoomGeometry=function(r){
 const floorY=r.y+r.h-28, innerX=r.x+34, innerW=r.w-68;
 r.floorY=floorY;
 // Every room has a readable safety floor, but large gaps remain at room exits.
 this.addPlatform(innerX,floorY,innerW,28,'roomFloor',{oneWay:true,room:r.id});
 if(r.kind==='shelter'){
  // Cutaway shelter: two or three domestic storeys with intentionally offset openings.
  const levels=r.h>700?3:2;
  for(let i=1;i<levels;i++){
   const y=floorY-i*Math.min(220,(r.h-90)/levels);const left=i%2===0;
   this.addPlatform(left?r.x+55:r.x+r.w*.38,y,r.w*.57,20,'shelterFloor',{oneWay:true,room:r.id});
  }
  this.ladders.push({id:this.id(),x:r.x+r.w*.22,y:r.y+75,w:34,h:r.h-110,room:r.id});
 }else if(r.kind==='shaft'){
  // Alternating ledges + a central ladder make the room truly vertical while
  // rings provide the faster Ori-like movement route.
  const step=118;let n=0;
  for(let y=floorY-105;y>r.y+85;y-=step,n++){
   const side=n%2===0;const w=clamp(r.w*.32,130,245);const x=side?r.x+55:r.x+r.w-w-55;
   this.addPlatform(x,y,w,17,'shaftLedge',{oneWay:true,room:r.id});
   if(n%2===0)this.rings.push({id:this.id(),x:r.x+r.w/2+(side?75:-75),y:y-60,r:18,room:r.id});
  }
  this.ladders.push({id:this.id(),x:r.x+r.w/2-17,y:r.y+60,w:34,h:r.h-100,room:r.id});
 }else if(r.kind==='hub'){
  this.addPlatform(r.x+75,r.y+r.h*.63,r.w*.36,20,'hubLedge',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w*.54,r.y+r.h*.48,r.w*.36,20,'hubLedge',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w*.26,r.y+r.h*.30,r.w*.48,18,'hubLedge',{oneWay:true,room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.50,y:r.y+r.h*.52,r:19,room:r.id});
 }else if(r.kind==='facility'){
  const y1=floorY-165,y2=floorY-335;
  this.addPlatform(r.x+55,y1,r.w*.42,20,'catwalk',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w*.51,y1-55,r.w*.41,20,'catwalk',{oneWay:true,room:r.id});
  if(y2>r.y+65)this.addPlatform(r.x+r.w*.20,y2,r.w*.58,18,'catwalk',{oneWay:true,room:r.id});
  this.ladders.push({id:this.id(),x:r.x+r.w*.48,y:r.y+90,w:30,h:r.h-130,room:r.id});
 }else if(r.kind==='cave'){
  const ledges=4;
  for(let i=0;i<ledges;i++){
   const w=150+(i%2)*70,x=r.x+70+((i*211+r.art*97)%Math.max(180,r.w-w-130)),y=floorY-105-i*85;
   if(y>r.y+50)this.addPlatform(x,y,w,18,'rockLedge',{oneWay:true,room:r.id});
  }
 }else if(r.kind==='outdoor'){
  this.addPlatform(r.x+70,floorY-135,r.w*.28,18,'ruinLedge',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w*.52,floorY-235,r.w*.33,18,'ruinLedge',{oneWay:true,room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.49,y:floorY-185,r:19,room:r.id});
 }else if(r.kind==='secret'){
  this.addPlatform(r.x+r.w*.12,floorY-150,r.w*.34,17,'secretLedge',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w*.55,floorY-280,r.w*.31,17,'secretLedge',{oneWay:true,room:r.id});
 }else if(r.kind==='boss'){
  this.addPlatform(r.x+120,floorY-170,260,20,'bossLedge',{oneWay:true,room:r.id});
  this.addPlatform(r.x+r.w-380,floorY-170,260,20,'bossLedge',{oneWay:true,room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.33,y:floorY-265,r:20,room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.67,y:floorY-265,r:20,room:r.id});
 }
};

Game.prototype.connectionPoints=function(a,b){
 const ac={x:a.x+a.w/2,y:a.y+a.h/2},bc={x:b.x+b.w/2,y:b.y+b.h/2};const dx=bc.x-ac.x,dy=bc.y-ac.y;
 if(Math.abs(dx)>Math.abs(dy)){
  return dx>0?{s:{x:a.x+a.w-30,y:a.floorY-22},t:{x:b.x+30,y:b.floorY-22}}:{s:{x:a.x+30,y:a.floorY-22},t:{x:b.x+b.w-30,y:b.floorY-22}};
 }
 return dy>0?{s:{x:ac.x,y:a.floorY-25},t:{x:bc.x,y:b.y+55}}:{s:{x:ac.x,y:a.y+55},t:{x:bc.x,y:b.floorY-25}};
};

Game.prototype.buildConnection=function(edge,index){
 const a=this.roomById.get(edge.a),b=this.roomById.get(edge.b);if(!a||!b)return;const {s,t}=this.connectionPoints(a,b);const dx=t.x-s.x,dy=t.y-s.y;
 if(edge.kind==='corridor'||edge.kind==='tunnel'){
  const steps=Math.max(1,Math.ceil(Math.abs(dx)/150));
  for(let i=0;i<=steps;i++){
   const u=i/steps;const x=lerp(s.x,t.x,u)-72;const curve=Math.sin(u*Math.PI)*(index%2?42:-42);const y=lerp(s.y,t.y,u)+curve;
   this.addPlatform(x,y,150,18,edge.kind==='tunnel'?'tunnel':'bridge',{oneWay:true,edge:index});
  }
 }else if(edge.kind==='climb'){
  const top=dy<0?t:s,bottom=dy<0?s:t;const shaftX=lerp(top.x,bottom.x,.5)+(index%3-1)*55;
  const height=Math.abs(bottom.y-top.y);const count=Math.max(3,Math.ceil(height/125));
  for(let i=0;i<=count;i++){
   const u=i/count,y=lerp(bottom.y,top.y,u);const x=shaftX+(i%2?150:-150)-65;
   this.addPlatform(x,y,135,17,'climbLedge',{oneWay:true,edge:index});
   if(i%2===1)this.rings.push({id:this.id(),x:shaftX,y:y-55,r:18,edge:index});
  }
  this.ladders.push({id:this.id(),x:shaftX-15,y:top.y-10,w:30,h:height+45,edge:index});
 }else if(edge.kind==='drop'){
  const high=dy>0?s:t,low=dy>0?t:s;const count=Math.max(2,Math.ceil(Math.abs(low.y-high.y)/170));
  for(let i=1;i<count;i++){
   const u=i/count,x=lerp(high.x,low.x,u)+(i%2?95:-95)-60,y=lerp(high.y,low.y,u);
   this.addPlatform(x,y,120,16,'dropLedge',{oneWay:true,edge:index});
  }
 }else if(edge.kind==='grapple'){
  const count=Math.max(3,Math.ceil(Math.hypot(dx,dy)/220));
  for(let i=1;i<count;i++){const u=i/count;this.rings.push({id:this.id(),x:lerp(s.x,t.x,u),y:lerp(s.y,t.y,u)+Math.sin(u*Math.PI)*-90,r:20,edge:index});}
  this.addPlatform(t.x-70,t.y,140,18,'grappleLanding',{oneWay:true,edge:index});
 }
 if(edge.gate){
  const horizontal=Math.abs(dx)>Math.abs(dy);const gx=lerp(s.x,t.x,.52),gy=lerp(s.y,t.y,.52);
  this.gates.push({id:this.id(),edge:index,a:edge.a,b:edge.b,gate:edge.gate,label:edge.label,x:horizontal?gx-22:gx-95,y:horizontal?gy-160:gy-18,w:horizontal?44:190,h:horizontal?178:36,horizontal,flash:0});
 }
};

Game.prototype.buildPuzzleObjects=function(){
 this.puzzles=W.puzzles.map(p=>({...p,w:72,h:92,step:0,solved:!!this.progress.solved[p.id],flash:0,lastElement:null}));
 // Some object puzzles need physical props.
 for(const p of this.puzzles){
  if(p.id==='p_gravity')this.crates.push({id:this.id(),kind:'core',x:p.x-190,y:p.y+10,w:46,h:46,vx:0,vy:0,onGround:false,targetX:p.x+75,targetY:p.y-130});
  if(p.id==='p_wind')this.crates.push({id:this.id(),kind:'cargo',x:p.x-210,y:p.y+35,w:60,h:55,vx:0,vy:0,onGround:false,targetX:p.x+115,targetY:p.y+35});
 }
};

Game.prototype.buildShelters=function(){
 let npcIndex=0;
 for(const rid of W.shelters){const r=this.roomById.get(rid);if(!r)continue;const floors=this.platforms.filter(s=>s.room===rid&&['roomFloor','shelterFloor'].includes(s.type)).sort((a,b)=>b.y-a.y);
  const kinds=[0,1,2,3,4,5].map(i=>FURNITURE_KINDS[(r.art+i*2)%FURNITURE_KINDS.length]);
  kinds.forEach((kind,i)=>{const f=floors[i%floors.length]||{x:r.x+50,y:r.floorY,w:r.w-100};const x=clamp(f.x+55+(i*117)%Math.max(90,f.w-120),r.x+55,r.x+r.w-90);this.furniture.push({id:this.id(),kind,x,y:f.y-55,w:50,h:55,room:rid,used:false});});
  const role=NPC_ROLES[npcIndex++%NPC_ROLES.length],floor=floors[0]||{y:r.floorY};this.npcs.push({id:this.id(),name:role[0],role:role[1],text:role[2],x:r.x+r.w*.72,y:floor.y-62,w:40,h:62,room:rid,lesson:0});
 }
};

Game.prototype.buildCollectibles=function(){this.collectibles=W.collectibles.map(c=>({...c,w:64,h:78,taken:!!this.progress.opened[`collect_${c.id}`],pulse:Math.random()*TAU}));};

Game.prototype.buildEnemies=function(){
 // 17 normal/mechanic archetypes are distributed by biome.  The final
 // sentinel is an additional boss, not counted as one of the 17 normal types.
 const regionTypes={
  tide:['slime','archer','charger','burrower'],
  roots:['slime','spider','spitter','healer','breeder','burrower'],
  market:['archer','bombardier','ambusher','sniper','parasite','mimic'],
  reactor:['charger','scatterer','bombardier','reflector','shocker','artillery'],
  archive:['ambusher','reflector','healer','spider','mimic','parasite'],
  canopy:['charger','spitter','scatterer','ambusher','breeder','shocker'],
  lighthouse:['reflector','scatterer','bombardier','charger','sniper','artillery'],
  secret:['ambusher','spider','healer','reflector','burrower','mimic']
 };
 for(const r of this.rooms){if(r.training||r.shelter||r.id==='r00'||r.id==='r48')continue;const types=regionTypes[r.region]||regionTypes.tide;const count=r.kind==='hub'?3:r.kind==='boss'?0:r.kind==='shaft'?2:1+((r.art+r.id.charCodeAt(1))%2);
  for(let i=0;i<count;i++){const type=types[(r.art+i*2)%types.length];const x=r.x+120+(i+1)*(r.w-240)/(count+1);this.spawnEnemy(type,x,r.floorY,{room:r.id});}
 }
 // Curated encounters guarantee that every mechanic appears in an actual room.
 const guaranteed=[
  // Keep at least one real encounter for every one of the 17 non-boss archetypes.
  // This list is deliberately independent from the procedural region selection,
  // so a future room-art/index change cannot accidentally remove a species.
  ['slime','r01',.35],['charger','r02',.64],['archer','r03',.48],
  ['scatterer','r05',.72],['bombardier','r06',.48],['spitter','r07',.62],
  ['ambusher','r09',.68],['spider','r10',.55],['reflector','r12',.58],
  ['healer','r13',.64],['sniper','r19',.72],['burrower','r17',.56],
  ['shocker','r30',.52],['parasite','r23',.62],['mimic','r24',.55],
  ['breeder','r08',.65],['artillery','r31',.76]
 ];
 for(const[type,rid,u]of guaranteed){if(this.enemies.some(e=>e.type===type))continue;const r=this.roomById.get(rid);if(r)this.spawnEnemy(type,r.x+r.w*u,r.floorY,{room:rid});}
 this.ensureBoss();
};

Game.prototype.ensureBoss=function(){
 let boss=this.enemies.find(e=>e.type==='sentinel');if(boss)return boss;if(this.bossDefeated)return null;
 const r=this.roomById.get('r48');if(!r)return null;
 boss=this.spawnEnemy('sentinel',r.x+r.w*.53,r.floorY,{room:'r48',hp:C.ENEMIES.sentinel.hp});
 if(boss){boss.dir=-1;boss.aiT=1.1;boss.state='dormant';boss.aggro=false;boss.phase=1;}
 return boss;
};

Game.prototype.spawnEnemy=function(type,x,floorY,opts={}){
 const t=C.ENEMIES[type];if(!t)return null;
 const dims={sentinel:[132,142],artillery:[76,66],breeder:[68,70],mimic:[64,58],charger:[66,62],reflector:[66,64],burrower:[64,54],parasite:[42,42],sniper:[54,62],shocker:[56,54],dummy:[54,58]};
 const [w,h]=dims[type]||[50,52];
 const commands=['ZZX','XZX','UX','DASHX','XXZ'];
 const e={id:this.id(),type,ai:t.ai,name:t.name,x:x-w/2,y:floorY-h,w,h,vx:0,vy:0,dir:-1,hp:opts.hp||t.hp,maxHp:opts.hp||t.hp,damage:t.damage,speed:t.speed,color:t.color,room:opts.room||this.roomAt(x,floorY)?.id,onGround:false,aggro:false,state:'idle',stateT:0,aiT:rand(.3,1.3),telegraph:null,stun:0,freeze:0,root:0,wet:0,burn:0,burnTick:.35,curse:0,armorBreak:0,anger:0,mark:null,markT:0,airborne:false,downT:0,kd:0,breakMax:type==='sentinel'?460:0,break:type==='sentinel'?460:0,breakStun:0,dead:false,hidden:type==='ambusher'||type==='burrower',homeX:x,range:opts.range||900,hitFlash:0,mimicOpen:0,requiredCommand:type==='mimic'?commands[(this.nextId+Math.floor(x))%commands.length]:null,attached:false,drainT:.7,parasiteDashes:0,spawnedChildren:[],bossAwake:false};
 this.enemies.push(e);return e;
};

/* --------------------------------------------------------------------------
 * LOOP / PHYSICS / MOVEMENT
 * -------------------------------------------------------------------------- */
Game.prototype.loop=function(ts){let dt=Math.min(.033,(ts-this.last)/1000||0);this.last=ts;if(this.hitStop>0){this.hitStop-=dt;dt*=.08;}if(!this.paused)this.update(dt,ts);this.render();this.input.end();requestAnimationFrame(t=>this.loop(t));};

Game.prototype.update=function(dt,ts){
 this.time+=dt;this.progress.playSeconds+=dt;this.message.t=Math.max(0,this.message.t-dt);this.commandT=Math.max(0,this.commandT-dt);this.combo.t-=dt;if(this.combo.t<=0)this.combo={hits:0,damage:0,t:0,best:this.combo.best};this.shake=Math.max(0,this.shake-dt*35);this.flash=Math.max(0,this.flash-dt*2.8);this.damageFlash=Math.max(0,this.damageFlash-dt*3.5);
 this.updateGlobalInput();if(this.paused)return;
 this.updateMovingObjects(dt);this.updatePlayer(dt);this.updateAttacks(dt);this.updateElements(dt);this.updateSkillShots(dt);this.updateFields(dt);this.updateEnemies(dt);this.updateEnemyShots(dt);this.updatePuzzles(dt);this.updateInteractions();this.updateEffects(dt);this.updateCamera(dt);this.updateNetwork(ts);this.updateUI();
};

Game.prototype.updateGlobalInput=function(){
 if(this.key('pause',true)){this.paused=!this.paused;this.say(this.paused?'PAUSED':'繼續',1);}
 if(this.key('help',true))$('#helpPanel').hidden=false;
 if(this.key('map',true)){this.renderMap();$('#mapPanel').hidden=false;}
 if(this.key('keyConfig',true)){this.renderKeyConfig();$('#keyPanel').hidden=false;}
 if(this.key('hud',true))document.body.classList.toggle('hud-focus');
 if(this.key('reset',true))this.respawn('手動重置');
};

Game.prototype.activePlatforms=function(body=this.player){
 const arr=this.platforms.filter(s=>s.active!==false);
 for(const f of this.fields){if(f.type==='icePlatform'||f.type==='earthPillar'||f.type==='vinePillar'||f.type==='skillPlatform')arr.push(f);}
 for(const g of this.gates)if(!this.gateOpen(g)){if(body===this.player&&body.phase>0&&g.gate==='shadow')continue;arr.push(g);}
 return arr;
};

Game.prototype.moveBody=function(b,dt,{enemy=false,ignoreOneWay=false}={}){
 const prevX=b.x,prevY=b.y; b.wallLeft=b.wallRight=false;
 b.x+=b.vx*dt;
 for(const s of this.activePlatforms(b)){if(s.oneWay&&!ignoreOneWay)continue;if(!overlap(b,s))continue;if(b.vx>0){b.x=s.x-b.w;b.wallRight=true;}else if(b.vx<0){b.x=s.x+s.w;b.wallLeft=true;}b.vx=0;}
 b.onGround=false;b.y+=b.vy*dt;
 for(const s of this.activePlatforms(b)){if(!overlap(b,s))continue;const prevBottom=prevY+b.h,prevTop=prevY;
  if(b.vy>=0){if(s.oneWay&&!ignoreOneWay&&prevBottom>s.y+12)continue;b.y=s.y-b.h;b.vy=0;b.onGround=true;if(s.vx)b.x+=s.vx*dt;if(s.vy)b.y+=s.vy*dt;}
  else if((!s.oneWay||ignoreOneWay)&&prevTop>=s.y+s.h-10){b.y=s.y+s.h;b.vy=0;}
 }
 b.x=clamp(b.x,0,C.WORLD_W-b.w);b.y=clamp(b.y,-250,C.WORLD_H+400);
 if(b.y>C.WORLD_H-100){b.y=C.WORLD_H-100-b.h;b.vy=0;b.onGround=true;}
 return{prevX,prevY};
};

Game.prototype.findSafePosition=function(x,y,w,h){
 x=clamp(x,4,C.WORLD_W-w-4);y=clamp(y,-80,C.WORLD_H-h-4);
 const probe={x,y,w,h};const solids=this.activePlatforms(probe);
 // 1) Prefer a platform top close below the desired anchor position.
 const candidates=solids.filter(s=>s.active!==false&&x+w>s.x+4&&x<s.x+s.w-4&&s.y>=y+h-115&&s.y<=y+h+230).sort((a,b)=>Math.abs(a.y-(y+h))-Math.abs(b.y-(y+h)));
 if(candidates.length){const s=candidates[0];const sx=clamp(x,s.x+3,s.x+s.w-w-3);return{x:sx,y:s.y-h-2};}
 // 2) Push out of any solid. This fixes the old first-swap-under-platform bug.
 for(let n=0;n<30;n++){
  probe.x=x;probe.y=y;const hit=solids.find(s=>overlap(probe,s));if(!hit)return{x,y};
  const options=[{v:Math.abs((hit.x-w-2)-x),x:hit.x-w-2,y},{v:Math.abs((hit.x+hit.w+2)-x),x:hit.x+hit.w+2,y},{v:Math.abs((hit.y-h-2)-y),x,y:hit.y-h-2},{v:Math.abs((hit.y+hit.h+2)-y),x,y:hit.y+hit.h+2}].sort((a,b)=>a.v-b.v)[0];x=clamp(options.x,4,C.WORLD_W-w-4);y=clamp(options.y,-80,C.WORLD_H-h-4);
 }
 // 3) Last-resort checkpoint rather than allowing a lethal embedded position.
 return{x:this.player?.checkpoint?.x??C.START_X,y:this.player?.checkpoint?.y??C.START_Y};
};

Game.prototype.nearLadder=function(p){return this.ladders.find(l=>overlap(p,l));};
Game.prototype.findGrappleTarget=function(){const p=this.player,range=330+this.progress.mobility*35;let best=null,d=range;
 for(const r of this.rings){const q=distXY(cx(p),cy(p),r.x,r.y);if(q<d){d=q;best={kind:'ring',ref:r,x:r.x,y:r.y}}}
 for(const s of this.enemyShots){if(s.friendly)continue;const q=distXY(cx(p),cy(p),cx(s),cy(s));if(q<d){d=q;best={kind:'shot',ref:s,x:cx(s),y:cy(s)}}}
 for(const s of this.elementShots){const q=distXY(cx(p),cy(p),cx(s),cy(s));if(q<d){d=q;best={kind:'element',ref:s,x:cx(s),y:cy(s)}}}
 return best;
};

Game.prototype.updatePlayer=function(dt){const p=this.player,cl=C.CLASSES[p.classId],P=C.PHYSICS;
 p.inv=Math.max(0,p.inv-dt);p.phase=Math.max(0,p.phase-dt);p.armor=Math.max(0,p.armor-dt);p.web=Math.max(0,p.web-dt);p.dashCD=Math.max(0,p.dashCD-dt);p.hurtT=Math.max(0,p.hurtT-dt);p.recoverT=Math.max(0,p.recoverT-dt);p.castT=Math.max(0,p.castT-dt);const wasKing=p.kingT>0;p.kingT=Math.max(0,p.kingT-dt);if(wasKing&&p.kingT<=0&&p.classId==='beast'&&p.form==='king'){p.form=p.prevForm||'wolf';this.applyBeastForm();}p.parry=Math.max(0,p.parry-dt);p.foodT=Math.max(0,p.foodT-dt);p.workT=Math.max(0,p.workT-dt);p.skillCD=p.skillCD.map(x=>Math.max(0,x-dt));p.qCD=Math.max(0,p.qCD-dt);p.historyT=Math.max(0,p.historyT-dt);if(p.historyT<=0)p.history='';
 p.rewind.push({x:p.x,y:p.y,hp:p.hp,t:this.time});while(p.rewind.length&&this.time-p.rewind[0].t>4.2)p.rewind.shift();
 if(p.downT>0){p.downT-=dt;p.vx*=Math.pow(.025,dt);p.vy=Math.min(P.maxFall,p.vy+P.gravity*dt);this.moveBody(p,dt);const elapsed=1.2-p.downT;if(elapsed>.28&&elapsed<.84&&this.key('jump',true)){p.downT=0;p.recoverT=.28;p.inv=.46;p.vy=-190;this.say('TECH｜受身成功',.8,'#f5e687');this.addFx('ring',cx(p),cy(p),.32,1.2,'#f5e687');}return;}
 const ladder=this.nearLadder(p),up=this.key('up'),down=this.key('down');
 if(ladder&&(up||down)){p.vy=(down?1:-1)*245;p.vx=lerp(p.vx,0,Math.min(1,dt*12));p.jumps=0;p.airDashes=1+(this.progress.mobility>=2?1:0);p.onGround=false;}
 else{
  let axis=(this.key('right')?1:0)-(this.key('left')?1:0);if(axis)p.dir=axis;
  let speed=P.moveSpeed*cl.speed;if(p.web>0)speed*=.35;if(p.classId==='beast'&&p.form==='wolf')speed*=1.2;if(p.classId==='beast'&&p.form==='bear')speed*=.83;if(p.foodT>0)speed*=1.07;
  const accel=p.onGround?P.groundAccel:P.airAccel,decel=p.onGround?P.groundDecel:P.airDecel;
  if(axis&&p.dashT<=0&&!p.attack?.lockMove)p.vx=approach(p.vx,axis*speed,accel*dt);else if(p.dashT<=0&&!p.attack?.lockMove)p.vx=approach(p.vx,0,decel*dt);
  if(p.onGround){p.coyote=P.coyote;p.jumps=0;p.airDashes=1+(this.progress.mobility>=2?1:0);}else p.coyote=Math.max(0,p.coyote-dt);
  if(this.key('jump',true))p.jumpBuffer=P.jumpBuffer;else p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
  if(p.jumpBuffer>0&&(p.onGround||p.coyote>0||p.jumps<2+(p.classId==='beast'&&p.form==='eagle'?1:0))){
   if(!p.onGround&&p.coyote<=0)p.jumps++;else p.jumps=1;p.vy=-P.jumpSpeed*(p.classId==='beast'&&p.form==='eagle'?1.06:1);p.onGround=false;p.coyote=0;p.jumpBuffer=0;this.sfx.jump();this.addFx('ring',cx(p),p.y+p.h,.22,.65,'#a9f0e9');
  }
  if((p.wallLeft||p.wallRight)&&!p.onGround&&p.vy>0){p.vy=Math.min(p.vy,P.wallSlide);if(this.key('jump',true)){p.vx=(p.wallLeft?1:-1)*P.wallJumpX;p.vy=-P.wallJumpY;p.dir=p.wallLeft?1:-1;p.airDashes=Math.max(p.airDashes,1);this.sfx.jump();}}
  if(this.released('jump')&&p.vy<0)p.vy*=P.jumpCut;
  if(this.key('dash',true)&&p.dashCD<=0&&(p.onGround||p.airDashes>0)){let dx=axis||p.dir,dy=(down?1:0)-(up?1:0);if(!dx&&!dy)dx=p.dir;const m=Math.hypot(dx,dy)||1;p.vx=dx/m*P.dashSpeed;p.vy=dy/m*P.dashSpeed;p.dashT=P.dashTime;p.dashCD=P.dashCooldown;p.inv=.12;if(!p.onGround)p.airDashes--;this.sfx.dash();this.addAfterimage();if(p.parasiteId){p.parasiteDashes=(p.parasiteDashes||0)+1;if(p.parasiteDashes>=3)this.detachParasite('連續 Dash 甩脫寄生體');}}
  if(p.dashT>0){p.dashT-=dt;p.vy*=.94;}else p.vy=Math.min(P.maxFall,p.vy+P.gravity*(p.classId==='beast'&&p.form==='eagle'&&p.vy>0?.72:1)*dt);
 }
 // Grapple / projectile bash.
 if(this.key('grapple',true)){const t=this.findGrappleTarget();if(t){let dx=t.x-cx(p),dy=t.y-cy(p),m=Math.hypot(dx,dy)||1;if(t.kind==='shot'){const ix=(this.key('right')?1:0)-(this.key('left')?1:0)||p.dir,iy=(this.key('down')?1:0)-(this.key('up')?1:0);const mm=Math.hypot(ix,iy)||1;p.vx=ix/mm*P.grappleSpeed;p.vy=iy/mm*P.grappleSpeed;t.ref.vx=-ix/mm*320;t.ref.vy=-iy/mm*320;t.ref.friendly=true;t.ref.damage*=1.7;}else{p.vx=dx/m*P.grappleSpeed;p.vy=dy/m*P.grappleSpeed;}p.grapple={x:t.x,y:t.y,t:.22};p.airDashes=Math.max(p.airDashes,1);p.inv=.16;this.sfx.swap(3);this.addFx('ring',t.x,t.y,.28,1.1,'#8cf0e8');}else this.sfx.error();}
 if(this.key('zAttack',true))this.commandInput('Z');
 if(this.key('xAttack',true)||this.key('xAttackAlt',true))this.commandInput('X');
 if(this.key('skill1',true))this.useSkill(0);if(this.key('skill2',true))this.useSkill(1);if(this.key('skill3',true))this.useSkill(2);if(this.key('skill4',true))this.useSkill(3);if(this.key('skill5',true))this.useSkill(4);if(this.key('classSkill',true))this.useClassSkill();
 for(let i=0;i<10;i++)if(this.key(`element${i+1}`,true))this.elementPress(i);
 if(this.key('interact',true))this.interact();
 this.moveBody(p,dt);
 // Fields that move the player.
 for(const f of this.fields){if(f.t<=0)continue;if(f.type==='geyser'&&overlap(p,f))p.vy-=1850*dt;if(f.type==='wind'&&overlap(p,f)){p.vy-=1250*dt;p.vx+=f.dir*480*dt;}if(f.type==='gravity'&&distXY(cx(p),cy(p),f.x,f.y)<f.r&&p.phase<=0){const dx=f.x-cx(p),dy=f.y-cy(p),m=Math.hypot(dx,dy)||1;p.vx+=dx/m*260*dt;p.vy+=dy/m*170*dt;}}
 if(p.grapple){p.grapple.t-=dt;if(p.grapple.t<=0)p.grapple=null;}
 const room=this.roomAt(cx(p),cy(p));if(room){this.currentRoomId=room.id;this.currentRegion=room.region;this.progress.discovered[room.id]=true;if(room.shelter){this.progress.shelters[room.id]=true;if(p.onGround)p.checkpoint={x:p.x,y:p.y,room:room.id};}if(room.id==='r48'){const boss=this.ensureBoss();if(boss&&!this.bossIntroPlayed){this.bossIntroPlayed=true;boss.bossAwake=true;boss.state='phase';boss.stateT=1.25;boss.aiT=1.4;this.say('BOSS｜十相哨兵・赫利俄斯甦醒',3.2,'#ff9ab4');this.addFx('ring',cx(boss),cy(boss),1.1,3.2,'#ff7195');this.shake=22;this.flash=.35;}}}
 if(p.burn>0){p.burn-=dt;this.hurtPlayer(2*dt,0,0,'燃燒',true);}if(p.poison>0){p.poison-=dt;this.hurtPlayer(1.3*dt,0,0,'毒',true);}
};

function approach(v,target,amount){return v<target?Math.min(target,v+amount):Math.max(target,v-amount)}
Game.prototype.addAfterimage=function(){const p=this.player,a=this.playerAnim(p);this.afterimages.push({x:p.x,y:p.y,w:p.w,h:p.h,dir:p.dir,classId:p.classId,form:p.form,row:a.row,frame:a.frame,t:.18,max:.18});};
Game.prototype.detachParasite=function(reason='寄生解除'){const p=this.player,e=this.enemies.find(q=>q.id===p.parasiteId);if(e){e.attached=false;e.state='stun';e.stun=1.0;e.vx=-p.dir*340;e.vy=-220;}p.parasiteId=null;p.parasiteDashes=0;this.say(reason,1.4,'#f39ab7');};

/* --------------------------------------------------------------------------
 * Z / X COMMAND COMBAT
 * -------------------------------------------------------------------------- */
const ATT={
 Z:{name:'Z・迅斬',anim:'z1',dur:.22,hit:.075,cancel:.12,dmg:8,w:82,h:64,oy:5,kx:75,ky:-20,kd:6,br:6,lunge:35},
 ZZ:{name:'ZZ・返刃',anim:'z2',dur:.23,hit:.08,cancel:.13,dmg:9,w:90,h:68,oy:3,kx:95,ky:-35,kd:7,br:7,lunge:40},
 ZZZ:{name:'ZZZ・裂步',anim:'z1',dur:.26,hit:.10,cancel:.15,dmg:11,w:104,h:72,oy:0,kx:120,ky:-60,kd:9,br:9,lunge:58},
 ZZZZ:{name:'ZZZZ・終斷',anim:'z2',dur:.36,hit:.145,cancel:.24,dmg:18,w:132,h:82,oy:-2,kx:410,ky:-130,kd:32,br:26,lunge:80,big:true},
 ZX:{name:'ZX・換側斬',anim:'z2',dur:.30,hit:.11,cancel:.18,dmg:13,w:110,h:76,oy:-4,kx:-80,ky:-80,kd:12,br:13,lunge:95,pass:true},
 ZZX:{name:'ZZX・逆界挑空',anim:'launch',dur:.39,hit:.155,cancel:.24,dmg:17,w:112,h:122,oy:-38,kx:65,ky:-680,kd:5,br:18,launch:true,lunge:45},
 ZZZX:{name:'ZZZX・月輪升斬',anim:'launch',dur:.45,hit:.18,cancel:.29,dmg:24,w:132,h:146,oy:-58,kx:45,ky:-820,kd:7,br:29,launch:true,big:true,lunge:35},
 ZXX:{name:'ZXX・交錯破',anim:'x',dur:.41,hit:.17,cancel:.28,dmg:22,w:124,h:88,oy:-8,kx:320,ky:-150,kd:26,br:31,big:true,lunge:30},
 ZXZ:{name:'ZXZ・回身收割',anim:'z1',dur:.32,hit:.12,cancel:.20,dmg:16,w:145,h:72,oy:2,kx:260,ky:-90,kd:18,br:19,pass:true},
 X:{name:'X・重斷',anim:'x',dur:.36,hit:.16,cancel:.25,dmg:19,w:105,h:82,oy:-5,kx:245,ky:-80,kd:22,br:25,big:true},
 XX:{name:'XX・震地',anim:'x',dur:.47,hit:.215,cancel:.34,dmg:28,w:138,h:96,oy:-2,kx:470,ky:-190,kd:48,br:42,big:true},
 XXX:{name:'XXX・崩界終結',anim:'x',dur:.58,hit:.27,cancel:.43,dmg:38,w:165,h:118,oy:-18,kx:620,ky:-260,kd:75,br:60,big:true},
 XZ:{name:'XZ・鉤回',anim:'z2',dur:.30,hit:.12,cancel:.19,dmg:14,w:132,h:76,oy:0,kx:-180,ky:-40,kd:11,br:14,pull:true},
 XZZ:{name:'XZZ・回拉連斬',anim:'z1',dur:.34,hit:.13,cancel:.21,dmg:17,w:148,h:80,oy:-2,kx:-240,ky:-90,kd:15,br:18,pull:true},
 XZX:{name:'XZX・破陣穿身',anim:'z2',dur:.42,hit:.18,cancel:.29,dmg:26,w:158,h:92,oy:-10,kx:350,ky:-170,kd:34,br:40,pass:true,big:true,lunge:110},
 XXZ:{name:'XXZ・震波追擊',anim:'z1',dur:.38,hit:.16,cancel:.25,dmg:22,w:175,h:78,oy:10,kx:230,ky:-230,kd:21,br:30,shock:true},
 UZ:{name:'↑Z・昇身斬',anim:'launch',dur:.31,hit:.12,cancel:.20,dmg:13,w:94,h:132,oy:-65,kx:35,ky:-540,kd:4,br:14,launch:true},
 UX:{name:'↑X・天穹破',anim:'launch',dur:.44,hit:.19,cancel:.31,dmg:27,w:122,h:170,oy:-92,kx:25,ky:-780,kd:6,br:38,launch:true,big:true},
 DZ:{name:'↓Z・低身滑斬',anim:'dash',dur:.26,hit:.09,cancel:.16,dmg:12,w:130,h:42,oy:30,kx:210,ky:10,kd:10,br:12,lunge:135},
 DX:{name:'↓X・裂地踏',anim:'x',dur:.43,hit:.19,cancel:.31,dmg:25,w:150,h:68,oy:32,kx:180,ky:180,kd:55,br:38,slam:true,big:true},
 LZ:{name:'←Z・後撤刃',anim:'z1',dur:.27,hit:.105,cancel:.17,dmg:11,w:95,h:68,oy:3,kx:160,ky:-55,kd:8,br:11,retreat:150},
 LX:{name:'←X・逆勢反擊',anim:'x',dur:.39,hit:.19,cancel:.28,dmg:23,w:120,h:88,oy:-7,kx:360,ky:-120,kd:28,br:34,retreat:95,big:true},
 RZ:{name:'→Z・逐影刺',anim:'dash',dur:.25,hit:.09,cancel:.15,dmg:13,w:145,h:66,oy:5,kx:250,ky:-55,kd:11,br:14,lunge:175},
 RX:{name:'→X・破陣衝鋒',anim:'x',dur:.40,hit:.17,cancel:.28,dmg:25,w:160,h:90,oy:-8,kx:470,ky:-140,kd:36,br:40,lunge:190,big:true},
 DASHZ:{name:'Dash Z・瞬步穿斬',anim:'dash',dur:.27,hit:.095,cancel:.17,dmg:15,w:155,h:72,oy:1,kx:330,ky:-90,kd:16,br:18,lunge:210,pass:true},
 DASHX:{name:'Dash X・破城撞',anim:'x',dur:.39,hit:.17,cancel:.28,dmg:28,w:170,h:92,oy:-8,kx:560,ky:-180,kd:48,br:50,lunge:220,big:true},
 AIRZ:{name:'Air Z・空中追斬',anim:'air',dur:.24,hit:.085,cancel:.145,dmg:10,w:94,h:80,oy:0,kx:80,ky:-120,kd:5,br:10,airRefresh:true},
 AIRZZ:{name:'Air ZZ・月弧連斬',anim:'air',dur:.27,hit:.10,cancel:.17,dmg:12,w:112,h:88,oy:-5,kx:95,ky:-165,kd:6,br:12,airRefresh:true},
 AIRX:{name:'Air X・隕落斬',anim:'launch',dur:.43,hit:.19,cancel:.34,dmg:25,w:96,h:126,oy:15,kx:80,ky:480,kd:45,br:37,slam:true,big:true},
 AIRUZ:{name:'Air ↑Z・旋羽上升',anim:'air',dur:.29,hit:.11,cancel:.18,dmg:13,w:105,h:118,oy:-62,kx:50,ky:-420,kd:4,br:14,launch:true,airRefresh:true},
 AIRDX:{name:'Air ↓X・星落震波',anim:'launch',dur:.49,hit:.23,cancel:.39,dmg:31,w:132,h:150,oy:15,kx:130,ky:640,kd:68,br:52,slam:true,big:true,shock:true}
};

Game.prototype.commandInput=function(token){const p=this.player;if(p.downT>0||p.recoverT>0||p.castT>0)return;
 if(p.attack&&p.attack.elapsed<p.attack.def.cancel){p.buffer=token;return;}
 let key=token;
 if(!p.onGround){if(this.key('up'))key='AIRU'+token;else if(this.key('down'))key='AIRD'+token;else if(token==='Z'&&p.history.endsWith('Z'))key='AIRZZ';else key='AIR'+token;p.history=token;p.historyT=.55;}
 else if(p.dashT>0){key='DASH'+token;p.history='';}
 else if(this.key('up')){key='U'+token;p.history='';}
 else if(this.key('down')){key='D'+token;p.history='';}
 else if(this.key('left')){key='L'+token;p.history='';}
 else if(this.key('right')){key='R'+token;p.history='';}
 else{const seq=(p.history+token).slice(-4);key=ATT[seq]?seq:token;p.history=seq;p.historyT=.62;}
 if(!ATT[key])key=token;this.startAttack(key);
};

Game.prototype.classAttack=function(def,key){const p=this.player,d={...def,key};
 if(p.classId==='rift'){d.dmg*=1.06;d.dur*=.9;d.cancel*=.88;d.lunge=(d.lunge||0)+28;if(['ZX','XZX','DASHZ'].includes(key))d.pass=true;}
 if(p.classId==='summoner'){d.dmg*=.82;if(key.includes('X'))d.summonCommand=true;}
 if(p.classId==='beast'){
  if(p.form==='wolf'){d.dur*=.78;d.cancel*=.76;d.dmg*=1.06;d.lunge=(d.lunge||0)+65;}
  if(p.form==='eagle'){if(key.startsWith('AIR')||d.launch)d.dmg*=1.24;d.ky-=80;d.airRefresh=true;}
  if(p.form==='bear'){d.dur*=1.18;d.dmg*=1.36;d.kx*=1.25;d.kd*=1.35;d.br*=1.45;d.big=true;p.armor=.35;}
 }
 if(p.classId==='artificer'&&key.includes('X'))d.mechanicalShot=true;
 if(p.classId==='gunner'&&key.includes('X')){d.gunShot=true;d.recoil=key.startsWith('AIR')?160:95;}
 if(p.classId==='warden'&&key.includes('X')){d.guard=true;d.br*=1.35;d.kd*=1.2;}
 if(p.classId==='chrono')d.echo=true;
 if(p.classId==='harrier'&&key.includes('X'))d.chain=true;
 return d;
};

Game.prototype.startAttack=function(key){const p=this.player;if(!ATT[key])return;const d=this.classAttack(ATT[key],key);p.attack={def:d,elapsed:0,hit:false,lockMove:!!d.lunge||!!d.big};p.buffer=null;this.commandLabel=d.name;this.commandT=.9;this.sfx.slash(!!d.big);
 if(d.lunge)p.vx=p.dir*d.lunge/Math.max(.12,d.dur);if(d.retreat)p.vx=-p.dir*d.retreat/Math.max(.12,d.dur);if(d.slam&&!p.onGround)p.vy=Math.max(p.vy,520);this.addFx('slash',cx(p)+p.dir*55,cy(p),.28,d.big?1.55:1.05,C.CLASSES[p.classId].accent,p.dir);
};

Game.prototype.attackBox=function(p,d){return{x:p.dir>0?p.x+p.w-4:p.x-d.w+4,y:p.y+d.oy,w:d.w,h:d.h};};

Game.prototype.updateAttacks=function(dt){const p=this.player;if(!p.attack)return;const a=p.attack,d=a.def;a.elapsed+=dt;
 if(!a.hit&&a.elapsed>=d.hit){a.hit=true;
  if(d.mechanicalShot||d.gunShot){const speed=d.gunShot?260:185;this.skillShots.push({id:this.id(),type:d.gunShot?'railRound':'gear',x:cx(p)-12+p.dir*30,y:cy(p)-10,w:24,h:20,vx:p.dir*speed,vy:0,t:4,damage:d.dmg*1.05,color:C.CLASSES[p.classId].accent,pierce:d.big?2:0,owner:'player'});if(d.recoil)p.vx-=p.dir*d.recoil;}
  else{const box=this.attackBox(p,d);const hits=[];for(const e of this.enemies){if(e.dead||!overlap(box,e))continue;hits.push(e);this.damageEnemy(e,d.dmg,p.dir*d.kx,d.ky,d);}
   if(hits.length){this.hitStop=Math.max(this.hitStop,d.big?.075:.04);this.shake=Math.max(this.shake,d.big?10:5);this.sfx.hit(!!d.big);if(d.airRefresh)p.airDashes=Math.max(p.airDashes,1);if(d.pass){const target=hits[0];const safe=this.findSafePosition(target.x+p.dir*(target.w+12),target.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.dir*=-1;}if(d.pull)for(const e of hits)e.vx=-p.dir*260;if(d.chain)this.chainPull(hits[0]);if(d.summonCommand)this.commandSummons(hits[0]);}
   if(d.shock)this.fields.push({id:this.id(),type:'shockwave',x:cx(p)+p.dir*45,y:p.y+p.h-25,w:220,h:55,t:.45,damage:d.dmg*.55,color:C.CLASSES[p.classId].accent,dir:p.dir});
   if(d.echo)setTimeout(()=>{if(!this.player)return;this.fields.push({id:this.id(),type:'echoHit',x:box.x,y:box.y,w:box.w,h:box.h,t:.16,damage:d.dmg*.48,color:C.CLASSES.chrono.accent,dir:p.dir,hit:new Set()});this.addFx('ring',cx(box),cy(box),.35,1.15,C.CLASSES.chrono.accent);},360);
  }
 }
 if(p.buffer&&a.elapsed>=d.cancel){const b=p.buffer;p.buffer=null;p.attack=null;this.commandInput(b);return;}
 if(a.elapsed>=d.dur){p.attack=null;if(p.buffer){const b=p.buffer;p.buffer=null;this.commandInput(b);}}
};

Game.prototype.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){if(e.dead)return;let amount=dmg;if(e.type==='mimic'&&e.mimicOpen<=0){const used=def.key||'';if(used!==e.requiredCommand){e.hitFlash=.12;this.say(`擬態箱護甲｜請輸入 ${e.requiredCommand}`,1.1,'#f0c47a');this.addFx('ring',cx(e),cy(e),.25,.8,e.color);return;}e.mimicOpen=2.4;e.stun=.35;this.say(`COMMAND MATCH｜${e.requiredCommand} 破防`,1.2,'#9cf0c5');}if(e.type==='mimic'&&e.mimicOpen>0)amount*=1.35;
 if(e.type==='reflector'&&e.armorBreak<=0&&e.dir===-sign(cx(this.player)-cx(e))&&!def.chain){amount*=.28;this.say('折光甲殼正面減傷｜換位到背後或用岩破甲',1,'#f1d88d');}
 if(e.armorBreak>0)amount*=1.28;if(e.curse>0)amount*=1.18;if(e.breakStun>0)amount*=1.5;e.hp-=amount;e.hitFlash=.14;e.stun=Math.max(e.stun,def.big?.26:.12);e.vx+=kx;e.vy+=ky;e.kd+=(def.kd||6);if(ky<-100)e.airborne=true;
 if(e.type==='slime')e.anger=clamp(e.anger+.18,0,1.2);
 if(e.type==='sentinel'){e.break-=def.br||amount*.6;if(e.break<=0&&e.breakStun<=0){e.break=e.breakMax;e.breakStun=2.6;e.stun=2.6;this.say('BREAK｜十相哨兵失衡，傷害 ×1.5',2.4,'#9ff3ed');this.addFx('ring',cx(e),cy(e),.7,2.6,'#9ff3ed');this.shake=18;}}
 if(e.type!=='sentinel'&&e.kd>=100&&!e.airborne){e.kd=0;e.downT=.65;e.stun=.65;e.vy=-160;}
 this.combo.hits++;this.combo.damage+=amount;this.combo.t=1.75;this.combo.best=Math.max(this.combo.best,this.combo.hits);this.addFx('hit',cx(e),cy(e),.22,def.big?1.4:1,C.CLASSES[this.player.classId].accent,1,{text:Math.round(amount)});
 if(e.hp<=0){e.dead=true;this.progress.scrap+=e.type==='sentinel'?40:2;this.addFx('ring',cx(e),cy(e),.55,e.type==='sentinel'?2.5:1.25,e.color);if(e.type==='sentinel'){this.bossDefeated=true;this.say('十相哨兵・赫利俄斯擊破｜燈塔冠頂已恢復連線',5,'#f3d483');}if(e.type==='parasite'&&this.player.parasiteId===e.id)this.detachParasite('寄生體已擊破');}
};

Game.prototype.hurtPlayer=function(dmg,kx,ky,source,dot=false){const p=this.player;if((p.inv>0||p.phase>0)&&!dot)return;if(p.parry>0&&!dot){p.parry=0;p.inv=.45;this.say('PARRY｜精準格擋反擊',1,'#f5dc75');const e=this.enemies.filter(e=>!e.dead).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(e)this.damageEnemy(e,30,p.dir*420,-180,{big:true,kd:35,br:55});return;}
 if(p.shield>0){const a=Math.min(p.shield,dmg);p.shield-=a;dmg-=a;}if(dmg<=0)return;const amount=p.armor>0?dmg*.62:dmg;p.hp-=amount;p.inv=dot?0:.65;p.hurtT=.25;this.damageFlash=.3;this.shake=Math.max(this.shake,9);if(!dot){p.vx=kx;p.vy=ky;this.sfx.hit(amount>16);}this.say(`受擊｜${source} ${Math.ceil(amount)}`,1.1,'#ff8796');if(amount>=18&&!dot){p.downT=1.2;p.attack=null;p.history='';}if(p.hp<=0)this.respawn(`被 ${source} 擊倒`);
};

Game.prototype.chainPull=function(target){if(!target)return;const p=this.player;if(target.type==='sentinel'||target.type==='reflector'){const dx=cx(target)-cx(p),dy=cy(target)-cy(p),m=Math.hypot(dx,dy)||1;p.vx=dx/m*580;p.vy=dy/m*430;}else{target.vx=-p.dir*520;target.vy=-120;}this.addFx('ring',cx(target),cy(target),.3,1.1,C.CLASSES.harrier.accent);};

/* --------------------------------------------------------------------------
 * CLASS SKILLS — cooldown only, no MP or resource gate
 * -------------------------------------------------------------------------- */
Game.prototype.cooldown=function(base){return Math.max(.22,base*(1-Math.min(.36,this.progress.crest*.03)));};
Game.prototype.useSkill=function(slot){const p=this.player,cl=C.CLASSES[p.classId];if(p.downT>0||p.skillCD[slot]>0)return;p.skillCD[slot]=this.cooldown(cl.skills[slot][1]);p.castT=slot===2?.32:.16;this.sfx.skill();this.commandLabel=`${['C','V','B'][slot]}・${cl.skills[slot][0]}`;this.commandT=1;const color=cl.accent;
 if(p.classId==='rift')this.riftSkill(slot,color);
 else if(p.classId==='summoner')this.summonerSkill(slot,color);
 else if(p.classId==='beast')this.beastSkill(slot,color);
 else if(p.classId==='artificer')this.artificerSkill(slot,color);
 else if(p.classId==='gunner')this.gunnerSkill(slot,color);
 else if(p.classId==='warden')this.wardenSkill(slot,color);
 else if(p.classId==='chrono')this.chronoSkill(slot,color);
 else this.harrierSkill(slot,color);
};

Game.prototype.riftSkill=function(i,c){const p=this.player;
 if(i===0){const target=this.nearestEnemy(480);if(target){const old={x:p.x,y:p.y};const safe=this.findSafePosition(target.x-p.dir*65,target.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.dir=sign(cx(target)-cx(p));this.damageEnemy(target,20,p.dir*320,-110,{big:false,kd:15,br:24});this.addFx('slash',cx(target),cy(target),.34,1.65,c,p.dir);this.addFx('ring',old.x,old.y,.28,1.1,c);}else{p.vx=p.dir*700;p.inv=.2;}}
 if(i===1){p.vy=-650;p.airDashes=Math.max(p.airDashes,1);const box={x:p.x-65,y:p.y-90,w:170,h:165};for(const e of this.enemies)if(!e.dead&&overlap(box,e))this.damageEnemy(e,24,p.dir*80,-720,{big:true,kd:5,br:35,launch:true});this.addFx('ring',cx(p),cy(p)-55,.45,1.8,c);}
 if(i===2){const targets=this.enemies.filter(e=>!e.dead&&distance(p,e)<780).sort((a,b)=>distance(p,a)-distance(p,b)).slice(0,6);let delay=0;for(const e of targets){setTimeout(()=>{if(e.dead)return;const safe=this.findSafePosition(e.x-p.dir*55,e.y,p.w,p.h);p.x=safe.x;p.y=safe.y;this.damageEnemy(e,26,p.dir*390,-160,{big:true,kd:24,br:38});this.addFx('slash',cx(e),cy(e),.38,1.9,c,p.dir);this.shake=10;},delay);delay+=90;}if(!targets.length){p.vx=p.dir*920;p.inv=.4;}}
};

Game.prototype.uniqueSummon=function(type,opts={}){let s=this.summons.find(q=>q.type===type);if(s){s.t=Math.max(s.t,opts.t||20);s.rank=Math.min(3,(s.rank||1)+1);s.cool=0;this.say(`${s.name} 維持 1 隻｜Rank ${s.rank}`,1.2,C.CLASSES.summoner.accent);return s;}s={id:this.id(),type,name:opts.name||type,x:this.player.x-55,y:this.player.y-30,w:34,h:34,t:opts.t||25,rank:1,cool:0,color:opts.color||C.CLASSES.summoner.accent,mode:opts.mode||'attack'};this.summons.push(s);this.say(`召喚 ${s.name}｜同種最多 1 隻`,1.4,s.color);return s;};
Game.prototype.summonerSkill=function(i,c){const p=this.player;
 if(i===0){const s=this.uniqueSummon('fox',{name:'浮光狐',color:'#ffd777',mode:'melee'});s.x=p.x-p.dir*60;s.y=p.y;const e=this.nearestEnemy(620);if(e)this.summonStrike(s,e,16);}
 if(i===1){const s=this.uniqueSummon('owl',{name:'觀測鴞',color:'#bda1ff',mode:'launcher'});s.x=p.x;s.y=p.y-90;const e=this.nearestEnemy(700);if(e){this.damageEnemy(e,18,p.dir*80,-650,{big:false,kd:4,br:20,launch:true});this.addFx('ring',cx(e),cy(e),.4,1.5,s.color);}}
 if(i===2){this.uniqueSummon('guardian',{name:'守護靈',color:'#8eeada',mode:'guard',t:18});p.shield=Math.max(p.shield,45);this.fields.push({id:this.id(),type:'guardianAura',x:cx(p),y:cy(p),r:175,t:8,color:c});this.addFx('ring',cx(p),cy(p),.65,2.4,c);}
};
Game.prototype.commandSummons=function(target){if(!target)return;for(const s of this.summons){s.target=target.id;s.cool=0;this.summonStrike(s,target,7+4*(s.rank||1));}};
Game.prototype.summonStrike=function(s,e,dmg){if(!e||e.dead)return;this.damageEnemy(e,dmg,sign(cx(e)-s.x)*120,s.mode==='launcher'?-420:-60,{kd:s.mode==='launcher'?4:7,br:10});this.addFx('ring',cx(e),cy(e),.26,1,s.color);};

Game.prototype.applyBeastForm=function(){const p=this.player;if(p.form==='wolf'){p.w=48;p.h=45;}else if(p.form==='eagle'){p.w=46;p.h=40;}else if(p.form==='bear'){p.w=58;p.h=62;}else{p.w=60;p.h=64;}const safe=this.findSafePosition(p.x,p.y,p.w,p.h);p.x=safe.x;p.y=safe.y;};
Game.prototype.beastSkill=function(i,c){const p=this.player;
 if(i===0){if(p.form==='wolf'){p.vx=p.dir*880;const box={x:p.dir>0?p.x:p.x-180,y:p.y-5,w:230,h:70};for(const e of this.enemies)if(!e.dead&&overlap(box,e))this.damageEnemy(e,24,p.dir*460,-100,{big:false,kd:18,br:22});this.addFx('slash',cx(p)+p.dir*90,cy(p),.34,1.8,'#a1f38d',p.dir);}else if(p.form==='eagle'){p.vy=-620;p.airDashes=Math.max(p.airDashes,2);const box={x:p.x-70,y:p.y-100,w:185,h:165};for(const e of this.enemies)if(!e.dead&&overlap(box,e))this.damageEnemy(e,22,p.dir*90,-650,{launch:true,kd:4,br:22});this.addFx('ring',cx(p),cy(p)-60,.45,1.7,'#b5efff');}else{this.fields.push({id:this.id(),type:'shockwave',x:cx(p)-145,y:p.y+p.h-55,w:290,h:70,t:.48,damage:33,color:'#d4a66d',dir:p.dir});p.armor=.7;this.shake=14;}}
 if(i===1){if(p.form==='wolf'){p.vx=p.dir*1050;p.inv=.25;}else if(p.form==='eagle'){p.vy=-820;p.vx=p.dir*280;p.airDashes=2;}else{p.vx=p.dir*650;p.armor=1.2;this.fields.push({id:this.id(),type:'wind',x:p.x-40,y:p.y-20,w:150,h:110,t:.65,dir:p.dir,color:c});}this.addAfterimage();}
 if(i===2){p.prevForm=p.form;p.form='king';p.kingT=9;this.applyBeastForm();p.armor=9;p.airDashes=2;this.fields.push({id:this.id(),type:'beastAura',x:cx(p),y:cy(p),r:210,t:9,color:'#8ff0a1'});this.addFx('ring',cx(p),cy(p),.8,2.6,'#8ff0a1');}
};

Game.prototype.artificerSkill=function(i,c){const p=this.player;
 if(i===0){const t=this.findGrappleTarget()||(()=>{const e=this.nearestEnemy(650);return e?{x:cx(e),y:cy(e),ref:e,kind:'enemy'}:null})();if(t){const dx=t.x-cx(p),dy=t.y-cy(p),m=Math.hypot(dx,dy)||1;p.vx=dx/m*780;p.vy=dy/m*650;p.airDashes=Math.max(p.airDashes,1);this.effects.push({id:this.id(),type:'line',x:cx(p),y:cy(p),x2:t.x,y2:t.y,t:.28,max:.28,color:c});}}
 if(i===1){this.fields.push({id:this.id(),type:'skillPlatform',x:p.x-45,y:p.y+p.h+12,w:130,h:18,t:7,color:c,oneWay:true});p.vy=-690;p.airDashes=Math.max(p.airDashes,1);this.addFx('ring',cx(p),p.y+p.h,.4,1.4,c);}
 if(i===2){this.skillShots.push({id:this.id(),type:'rail',x:cx(p)-22+p.dir*38,y:cy(p)-14,w:44,h:28,vx:p.dir*250,vy:0,t:5,damage:38,color:c,pierce:5,owner:'player',ride:true});p.vx=p.dir*600;p.inv=.3;this.effects.push({id:this.id(),type:'beam',x:cx(p),y:cy(p),x2:cx(p)+p.dir*560,y2:cy(p),t:.42,max:.42,color:c});}
};

Game.prototype.gunnerSkill=function(i,c){const p=this.player;
 if(i===0){for(let n=-1;n<=1;n++)this.skillShots.push({id:this.id(),type:'bullet',x:cx(p)+p.dir*30,y:cy(p)+n*10,w:18,h:10,vx:p.dir*(245+n*12),vy:n*45,t:3.5,damage:11,color:c,pierce:0,owner:'player'});p.vx-=p.dir*240;p.airDashes=Math.max(p.airDashes,1);}
 if(i===1){p.vy=-800;p.vx-=p.dir*130;this.fields.push({id:this.id(),type:'flameJet',x:p.x-20,y:p.y+p.h,w:80,h:130,t:.55,damage:18,color:'#ff9a62'});this.addAfterimage();}
 if(i===2){this.skillShots.push({id:this.id(),type:'heavyRail',x:cx(p)-27+p.dir*35,y:cy(p)-27,w:54,h:54,vx:p.dir*145,vy:0,t:7,damage:52,color:c,pierce:8,owner:'player',gravityPull:true});p.vx-=p.dir*360;this.addFx('ring',cx(p),cy(p),.48,1.7,c);}
};

Game.prototype.wardenSkill=function(i,c){const p=this.player;
 if(i===0){p.vx=p.dir*720;p.armor=.65;p.shield=Math.max(p.shield,20);const box={x:p.dir>0?p.x:p.x-160,y:p.y-5,w:205,h:85};for(const e of this.enemies)if(!e.dead&&overlap(box,e))this.damageEnemy(e,28,p.dir*560,-130,{big:true,kd:42,br:54});}
 if(i===1){const e=this.nearestEnemy(620);if(e){const dx=cx(e)-cx(p),dy=cy(e)-cy(p),m=Math.hypot(dx,dy)||1;p.vx=dx/m*590;p.vy=dy/m*430;e.vx=-dx/m*280;e.vy=-140;this.effects.push({id:this.id(),type:'line',x:cx(p),y:cy(p),x2:cx(e),y2:cy(e),t:.35,max:.35,color:c});}}
 if(i===2){this.fields.push({id:this.id(),type:'fortress',x:cx(p),y:cy(p),r:190,t:7,color:c});p.shield=Math.max(p.shield,55);p.armor=2;this.addFx('ring',cx(p),cy(p),.7,2.2,c);}
};

Game.prototype.chronoSkill=function(i,c){const p=this.player;
 if(i===0){const old={x:p.x,y:p.y};p.x=clamp(p.x+p.dir*230,0,C.WORLD_W-p.w);const safe=this.findSafePosition(p.x,p.y,p.w,p.h);p.x=safe.x;p.y=safe.y;this.fields.push({id:this.id(),type:'echoHit',x:old.x-30,y:old.y-20,w:135,h:105,t:.65,delay:.32,damage:22,color:c,dir:p.dir,hit:new Set()});this.addFx('ring',old.x,old.y,.5,1.6,c);}
 if(i===1){this.fields.push({id:this.id(),type:'stasis',x:cx(p),y:cy(p),r:240,t:6,color:c});this.addFx('ring',cx(p),cy(p),.7,2.3,c);}
 if(i===2){const a=[...p.rewind].reverse().find(q=>this.time-q.t>=2.8)||p.rewind[0];if(a){const safe=this.findSafePosition(a.x,a.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.hp=Math.max(p.hp,a.hp);p.inv=.6;this.addFx('ring',cx(p),cy(p),.7,2.4,c);}}
};

Game.prototype.harrierSkill=function(i,c){const p=this.player;
 if(i===0){const e=this.nearestEnemy(700);if(e){this.chainPull(e);this.effects.push({id:this.id(),type:'line',x:cx(p),y:cy(p),x2:cx(e),y2:cy(e),t:.38,max:.38,color:c});}}
 if(i===1){const e=this.nearestEnemy(600);if(e){const dx=cx(e)-cx(p),dy=cy(e)-cy(p),m=Math.hypot(dx,dy)||1;p.vx=dx/m*720;p.vy=dy/m*520-160;p.airDashes=Math.max(p.airDashes,1);this.damageEnemy(e,20,p.dir*230,-320,{kd:8,br:25,launch:true});this.addAfterimage();}}
 if(i===2){this.fields.push({id:this.id(),type:'chainVortex',x:cx(p)+p.dir*80,y:cy(p),r:260,t:5.5,damage:5,color:c,hitTick:0});this.addFx('ring',cx(p)+p.dir*80,cy(p),.8,2.5,c);}
};

Game.prototype.useClassSkill=function(){const p=this.player,cl=C.CLASSES[p.classId];if(p.qCD>0||p.downT>0)return;p.qCD=this.cooldown(cl.q[1]);this.commandLabel=`Q・${cl.q[0]}`;this.commandT=1;this.sfx.swap(4);const c=cl.accent;
 if(p.classId==='rift'){const e=this.nearestEnemy(500);if(e){const side=cx(p)<cx(e)?1:-1;const safe=this.findSafePosition(e.x+side*(e.w+45),e.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.dir=-side;p.inv=.25;this.damageEnemy(e,13,p.dir*180,-80,{kd:8,br:16});}else p.vx=p.dir*620;}
 else if(p.classId==='summoner'){const e=this.nearestEnemy(900);if(e)for(const s of this.summons){s.target=e.id;s.cool=0;this.summonStrike(s,e,9+5*s.rank);}this.addFx('ring',cx(p),cy(p),.42,1.5,c);}
 else if(p.classId==='beast'){const forms=['wolf','eagle','bear'];p.form=forms[(forms.indexOf(p.form)+1)%forms.length];this.applyBeastForm();this.say(`德魯伊變身｜${{wolf:'狼形：高速黏著',eagle:'鷹形：空戰與多段 Dash',bear:'熊形：霸體與高 BREAK'}[p.form]}`,2,c);this.addFx('ring',cx(p),cy(p),.52,1.8,c);}
 else if(p.classId==='artificer'){let t=this.turrets[0];if(t){t.t=16;t.rank=Math.min(3,(t.rank||1)+1);}else{t={id:this.id(),x:p.x-p.dir*45,y:p.y+p.h-42,w:40,h:42,t:16,rank:1,cool:0,color:c};this.turrets=[t];}this.say(`部署炮台｜Rank ${t.rank}`,1,c);}
 else if(p.classId==='gunner'){p.vx=-p.dir*760;p.vy=-180;p.airDashes=Math.max(p.airDashes,1);this.skillShots.push({id:this.id(),type:'bullet',x:cx(p)+p.dir*30,y:cy(p),w:20,h:12,vx:p.dir*280,vy:0,t:3,damage:18,color:c,pierce:1,owner:'player'});}
 else if(p.classId==='warden'){p.parry=.52;p.armor=.52;this.say('精準格擋窗口 0.52 秒',.8,c);}
 else if(p.classId==='chrono'){if(p.anchor){const safe=this.findSafePosition(p.anchor.x,p.anchor.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.hp=Math.max(p.hp,p.anchor.hp);p.anchor=null;this.say('返回時間錨',1,c);}else{p.anchor={x:p.x,y:p.y,hp:p.hp};this.say('時間錨已設置｜再次 Q 返回',1.4,c);}this.addFx('ring',cx(p),cy(p),.5,1.7,c);}
 else{const e=this.nearestEnemy(650);if(e){const old={x:p.x,y:p.y};const safe=this.findSafePosition(e.x+p.dir*(e.w+30),e.y,p.w,p.h);p.x=safe.x;p.y=safe.y;e.x=old.x;e.y=old.y;this.damageEnemy(e,15,p.dir*250,-90,{kd:15,br:20});this.addFx('ring',cx(e),cy(e),.4,1.5,c);}}
};

/* --------------------------------------------------------------------------
 * ELEMENTS / SWAP / FIELDS
 * -------------------------------------------------------------------------- */
Game.prototype.findElementTarget=function(id){const p=this.player;const marked=this.enemies.filter(e=>!e.dead&&e.mark===id&&e.markT>0).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(marked)return{kind:'enemy',ref:marked};const shot=this.elementShots.filter(s=>s.element===id&&s.anchor&&s.t>0).sort((a,b)=>distance(p,a)-distance(p,b))[0];return shot?{kind:'shot',ref:shot}:null;};

Game.prototype.elementPress=function(i){const el=C.ELEMENTS[i];if(!el)return;this.currentElement=el.id;const target=this.findElementTarget(el.id);if(target)this.swapElement(target,el,i);else this.fireElement(el,i);};
Game.prototype.fireElement=function(el,index){const p=this.player,up=this.key('up'),down=this.key('down');let dx=p.dir,dy=up&&!down?-.65:down&&!up?.65:0;const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;const size=el.id==='gravity'?42:el.id==='earth'?34:28;
 const s={id:this.id(),element:el.id,x:cx(p)-size/2+p.dir*28,y:cy(p)-size/2,w:size,h:size,vx:dx*el.speed,vy:dy*el.speed,t:7,anchor:true,stuck:false,pierce:el.id==='light'?1:0,bounce:el.id==='water'?1:0,trail:[],color:el.color};this.elementShots.push(s);this.lastElementUse=el.id;this.sfx.swap(index);this.addFx('ring',cx(s),cy(s),.24,.8,el.color);this.say(`${el.glyph} ${el.name}發射｜再按 ${index===9?0:index+1} 換位`,1.25,el.color);
};

Game.prototype.swapElement=function(target,el,index){const p=this.player,old={x:p.x,y:p.y,cx:cx(p),cy:cy(p)};let desired={x:p.x,y:p.y};
 if(target.kind==='enemy'){const e=target.ref;desired={x:e.x+e.w/2-p.w/2,y:e.y+e.h-p.h};const enemySafe=this.findSafePosition(old.cx-e.w/2,old.y+p.h-e.h,e.w,e.h);e.x=enemySafe.x;e.y=enemySafe.y;e.vx=-p.vx*.25;e.vy=-100;e.stun=Math.max(e.stun,.35);}
 else{const s=target.ref;desired={x:cx(s)-p.w/2,y:cy(s)-p.h/2};s.x=old.cx-s.w/2;s.y=old.cy-s.h/2;s.vx=0;s.vy=0;s.stuck=true;s.anchor=true;s.t=Math.max(s.t,6);}
 const safe=this.findSafePosition(desired.x,desired.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.vx*=.25;p.vy=Math.min(p.vy,80);p.inv=.4;p.airDashes=Math.max(p.airDashes,1);this.lastSwap=el.id;
 this.elementSwapEffect(el,old,{x:cx(p),y:cy(p)});this.sfx.swap(index);this.shake=Math.max(this.shake,8);this.flash=.12;this.addFx('ring',old.cx,old.cy,.36,1.3,el.color);this.addFx('ring',cx(p),cy(p),.36,1.4,el.color);this.say(`${el.name}換位｜${el.desc}`,1.5,el.color);
 this.checkElementCombo(el.id);
};

Game.prototype.elementSwapEffect=function(el,old,now){const p=this.player,scale=1+this.progress.element*.08;
 if(el.id==='fire'){this.fields.push({id:this.id(),type:'flame',x:old.cx-70,y:old.cy-40,w:140,h:90,t:4.5*scale,damage:5,color:el.color,hitTick:0});this.fields.push({id:this.id(),type:'flame',x:now.x-70,y:now.y-40,w:140,h:90,t:4.5*scale,damage:5,color:el.color,hitTick:0});}
 if(el.id==='ice'){this.fields.push({id:this.id(),type:'icePlatform',x:old.cx-75,y:old.cy+18,w:150,h:19,t:10*scale,color:el.color,oneWay:true});for(const e of this.enemies)if(!e.dead&&distXY(now.x,now.y,cx(e),cy(e))<170)e.freeze=Math.max(e.freeze,2.2);}
 if(el.id==='lightning'){this.chainLightning(old.cx,old.cy,3,14);this.chainLightning(now.x,now.y,4,15);}
 if(el.id==='wind'){this.fields.push({id:this.id(),type:'wind',x:old.cx-100,y:old.cy-95,w:200,h:190,t:3.5*scale,dir:p.dir,color:el.color});p.vx=p.dir*820;p.vy=Math.min(p.vy,-220);for(const e of this.enemies)if(!e.dead&&distXY(old.cx,old.cy,cx(e),cy(e))<230){e.vx+=p.dir*620;e.vy-=180;}}
 if(el.id==='earth'){this.fields.push({id:this.id(),type:'earthPillar',x:old.cx-42,y:old.cy-115,w:84,h:145,t:12*scale,color:el.color,oneWay:false});p.armor=2.5;this.radialDamage(now.x,now.y,145,22,el.color,{br:42,kd:35});}
 if(el.id==='water'){this.fields.push({id:this.id(),type:'geyser',x:old.cx-45,y:old.cy-210,w:90,h:250,t:7*scale,color:el.color});p.hp=Math.min(p.maxHp,p.hp+18);p.vy=-560;}
 if(el.id==='light'){p.hp=Math.min(p.maxHp,p.hp+14);p.shield=Math.max(p.shield,32);this.fields.push({id:this.id(),type:'lightAura',x:now.x,y:now.y,r:230,t:7*scale,color:el.color});for(const q of this.puzzles)if(q.id==='p_light')q.revealed=true;}
 if(el.id==='shadow'){p.phase=2.2;this.fields.push({id:this.id(),type:'decoy',x:old.cx,y:old.cy,r:210,t:5*scale,color:el.color});}
 if(el.id==='nature'){this.fields.push({id:this.id(),type:'vinePillar',x:old.cx-32,y:old.cy-250,w:64,h:290,t:13*scale,color:el.color,oneWay:false});for(const e of this.enemies)if(!e.dead&&distXY(now.x,now.y,cx(e),cy(e))<170)e.root=Math.max(e.root,2.8);}
 if(el.id==='gravity'){this.fields.push({id:this.id(),type:'gravity',x:old.cx,y:old.cy,r:280,t:7*scale,color:el.color});p.vy*=.4;}
};

Game.prototype.checkElementCombo=function(current){const prev=this.elementComboPrev,dt=this.time-(this.elementComboTime||0);if(prev&&prev!==current&&dt<4){
 if(prev==='ice'&&current==='fire'){this.say('熱震｜冰→火：破壞脆弱結構',2,'#ffbd87');this.radialDamage(cx(this.player),cy(this.player),330,38,'#ff9e72',{br:55,kd:45});this.solvePuzzleById('p_thermal');}
 if(prev==='water'&&current==='lightning'){this.say('導電暴潮｜水→雷',2,'#fff087');for(const e of this.enemies)if(!e.dead&&e.wet>0){e.stun=Math.max(e.stun,1.8);this.damageEnemy(e,25,80*sign(cx(e)-cx(this.player)),-80,{br:28,kd:15});}}
 if(prev==='fire'&&current==='wind'){this.say('烈風火環｜火→風',2,'#ffb16f');this.radialDamage(cx(this.player),cy(this.player),390,31,'#ffae69',{br:30,kd:25});}
 if(prev==='earth'&&current==='nature'){this.say('岩根隆起｜岩→藤',2,'#aee193');this.fields.push({id:this.id(),type:'vinePillar',x:this.player.x-80,y:this.player.y-260,w:160,h:310,t:16,color:'#8cbd76',oneWay:false});}
 if((prev==='light'&&current==='shadow')||(prev==='shadow'&&current==='light')){this.say('明暗蝕相｜光↔影',2,'#e0c6f0');this.player.phase=4;this.player.shield=Math.max(this.player.shield,45);}
 if(prev==='gravity'&&current==='wind'){this.say('引力彈弓｜引→風',2,'#c6c9ef');this.player.vx=this.player.dir*1050;this.player.vy=-500;this.player.airDashes=2;}
 }
 this.elementComboPrev=current;this.elementComboTime=this.time;
};

Game.prototype.applyElementHit=function(e,el,shot){let dmg=el.damage;
 if(e.type==='reflector'&&e.armorBreak<=0&&e.dir===-sign(cx(this.player)-cx(e))&&!['earth','shadow'].includes(el.id)){shot.vx*=-.75;shot.vy*=-.6;shot.friendly=false;shot.anchor=false;this.say('元素被折光甲殼反射｜繞背或用岩／影',1.4,'#f5d686');return false;}
 e.mark=el.id;e.markT=el.mark+this.progress.element*.6;
 if(el.id==='fire'){if(e.freeze>0){dmg*=2;e.freeze=0;}e.burn=Math.max(e.burn,5);}
 if(el.id==='ice'){e.freeze=Math.max(e.freeze,e.wet>0?3.4:1.8);if(e.wet>0)dmg*=1.35;}
 if(el.id==='lightning'){e.stun=Math.max(e.stun,e.wet>0?1.7:.7);if(e.wet>0){dmg*=2;this.chainLightning(cx(e),cy(e),2,10,e.id);}}
 if(el.id==='wind'){e.vx+=this.player.dir*620;e.vy-=150;}
 if(el.id==='earth'){e.armorBreak=Math.max(e.armorBreak,6);}
 if(el.id==='water'){e.wet=Math.max(e.wet,8);e.burn=0;}
 if(el.id==='light'){if(e.type==='ambusher')e.hidden=false;e.curse=0;}
 if(el.id==='shadow')e.curse=Math.max(e.curse,8);
 if(el.id==='nature')e.root=Math.max(e.root,2.8);
 if(el.id==='gravity'){e.vx+=(cx(shot)-cx(e))*.8;e.vy-=120;}
 this.damageEnemy(e,dmg,shot.vx*.18,shot.vy*.08,{kd:7,br:el.id==='earth'?34:12});this.addFx('ring',cx(e),cy(e),.3,1,el.color);return true;
};

Game.prototype.updateElements=function(dt){for(const s of this.elementShots){if(s.t<=0)continue;s.t-=dt;const el=C.ELEMENTS.find(e=>e.id===s.element);s.trail.unshift({x:cx(s),y:cy(s)});if(s.trail.length>12)s.trail.pop();
 if(!s.stuck){s.vy+=el.gravity*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}
 if(s.element==='gravity')this.gravityPull(cx(s),cy(s),230,520*dt);
 let removed=false;for(const e of this.enemies){if(e.dead||!overlap(s,e))continue;if(this.applyElementHit(e,el,s)){if(s.pierce>0){s.pierce--;s.x+=sign(s.vx)*25;}else{s.t=0;removed=true;}}break;}if(removed)continue;
 for(const p of this.puzzles){if(p.solved||distXY(cx(s),cy(s),p.x,p.y)>80)continue;this.puzzleElement(p,el.id);s.t=0;break;}
 if(s.t<=0)continue;
 for(const solid of this.activePlatforms(s)){if(!overlap(s,solid))continue;if(s.element==='water'&&s.bounce>0){s.vy=-Math.abs(s.vy)*.65;s.vx*=.78;s.bounce--;}else{s.stuck=true;s.vx=s.vy=0;s.t=Math.max(s.t,5.5);}break;}
 if(s.x<-100||s.x>C.WORLD_W+100||s.y<-200||s.y>C.WORLD_H+300)s.t=0;
 }
 this.elementShots=this.elementShots.filter(s=>s.t>0);
};

Game.prototype.chainLightning=function(x,y,count,dmg,skipId=null){const list=this.enemies.filter(e=>!e.dead&&e.id!==skipId&&distXY(x,y,cx(e),cy(e))<380).sort((a,b)=>distXY(x,y,cx(a),cy(a))-distXY(x,y,cx(b),cy(b))).slice(0,count);let from={x,y};for(const e of list){this.damageEnemy(e,dmg,80*sign(cx(e)-from.x),-70,{kd:7,br:14});e.stun=Math.max(e.stun,.65);this.effects.push({id:this.id(),type:'line',x:from.x,y:from.y,x2:cx(e),y2:cy(e),t:.18,max:.18,color:'#fff083'});from={x:cx(e),y:cy(e)};}};
Game.prototype.gravityPull=function(x,y,r,power){for(const e of this.enemies){if(e.dead)continue;const dx=x-cx(e),dy=y-cy(e),m=Math.hypot(dx,dy)||1;if(m<r){e.vx+=dx/m*power;e.vy+=dy/m*power*.65;}}for(const c of this.crates){const dx=x-cx(c),dy=y-cy(c),m=Math.hypot(dx,dy)||1;if(m<r){c.vx+=dx/m*power;c.vy+=dy/m*power*.5;}}};
Game.prototype.radialDamage=function(x,y,r,dmg,color,def={}){for(const e of this.enemies){if(e.dead)continue;const d=distXY(x,y,cx(e),cy(e));if(d<r)this.damageEnemy(e,dmg*(1-d/r*.35),sign(cx(e)-x)*320,-150,{big:true,kd:def.kd||25,br:def.br||28});}this.addFx('ring',x,y,.5,r/90,color);};

Game.prototype.updateSkillShots=function(dt){for(const s of this.skillShots){s.t-=dt;if(s.gravityPull)this.gravityPull(cx(s),cy(s),260,600*dt);s.x+=s.vx*dt;s.y+=s.vy*dt;
 for(const e of this.enemies){if(e.dead||!overlap(s,e))continue;this.damageEnemy(e,s.damage,sign(s.vx)*260,-90,{big:s.type==='heavyRail'||s.type==='rail',kd:s.type==='heavyRail'?38:12,br:s.type==='heavyRail'?52:18});if(s.pierce>0){s.pierce--;s.x+=sign(s.vx)*35;}else s.t=0;break;}
 for(const q of this.platforms)if(s.t>0&&!q.oneWay&&overlap(s,q)){s.t=0;break;}
 }this.skillShots=this.skillShots.filter(s=>s.t>0);
 // Turrets are slow, readable support rather than machine-gun noise.
 for(const t of this.turrets){t.t-=dt;t.cool-=dt;const e=this.enemies.filter(e=>!e.dead&&distXY(t.x,t.y,cx(e),cy(e))<600).sort((a,b)=>distXY(t.x,t.y,cx(a),cy(a))-distXY(t.x,t.y,cx(b),cy(b)))[0];if(e&&t.cool<=0){t.cool=.72/(t.rank||1);const dx=cx(e)-t.x,dy=cy(e)-t.y,m=Math.hypot(dx,dy)||1;this.skillShots.push({id:this.id(),type:'turret',x:t.x,y:t.y,w:16,h:12,vx:dx/m*220,vy:dy/m*220,t:4,damage:7+3*t.rank,color:t.color,pierce:0,owner:'player'});}}
 this.turrets=this.turrets.filter(t=>t.t>0);
 // Unique summons follow the player and attack by role.
 for(const s of this.summons){s.t-=dt;s.cool-=dt;const p=this.player;const slot={fox:{x:p.x-p.dir*75,y:p.y+5},owl:{x:p.x+p.dir*25,y:p.y-85},guardian:{x:p.x-p.dir*25,y:p.y-35}}[s.type]||{x:p.x,y:p.y};s.x=lerp(s.x,slot.x,Math.min(1,dt*5));s.y=lerp(s.y,slot.y,Math.min(1,dt*5));const target=this.enemies.find(e=>e.id===s.target&&!e.dead)||this.nearestEnemy(580);if(target&&s.cool<=0){s.cool=s.type==='fox'?.68:s.type==='owl'?1.05:1.35;if(s.type==='guardian'){this.player.shield=Math.max(this.player.shield,4+s.rank*3);this.radialDamage(s.x,s.y,115,4+s.rank*2,s.color,{br:8,kd:5});}else this.summonStrike(s,target,6+s.rank*4);}}
 this.summons=this.summons.filter(s=>s.t>0);
};

Game.prototype.updateFields=function(dt){for(const f of this.fields){f.t-=dt;f.hitTick=(f.hitTick||0)-dt;if(f.type==='stasis'){for(const e of this.enemies)if(!e.dead&&distXY(cx(e),cy(e),f.x,f.y)<f.r){e.vx*=Math.pow(.08,dt);e.vy*=Math.pow(.25,dt);e.stun=Math.max(e.stun,.04);}for(const s of this.enemyShots)if(distXY(cx(s),cy(s),f.x,f.y)<f.r){s.vx*=Math.pow(.12,dt);s.vy*=Math.pow(.12,dt);}}
 if(f.type==='gravity')this.gravityPull(f.x,f.y,f.r,760*dt);
 if(f.type==='decoy'){for(const e of this.enemies)if(!e.dead&&distXY(cx(e),cy(e),f.x,f.y)<f.r)e.decoy={x:f.x,y:f.y};}
 if(f.type==='chainVortex'){for(const e of this.enemies){if(e.dead)continue;const dx=f.x-cx(e),dy=f.y-cy(e),m=Math.hypot(dx,dy)||1;if(m<f.r){e.vx+=dx/m*620*dt;e.vy+=dy/m*340*dt;if(f.hitTick<=0)this.damageEnemy(e,f.damage,dx/m*80,dy/m*50,{kd:3,br:7});}}if(f.hitTick<=0)f.hitTick=.35;}
 if(f.type==='guardianAura'){f.x=cx(this.player);f.y=cy(this.player);for(const s of this.enemyShots)if(distXY(cx(s),cy(s),f.x,f.y)<f.r)s.t=0;}
 if(f.type==='fortress'){f.x=cx(this.player);f.y=cy(this.player);for(const s of this.enemyShots)if(distXY(cx(s),cy(s),f.x,f.y)<f.r)s.t=0;}
 if(['flame','shockwave','flameJet'].includes(f.type)&&f.hitTick<=0){for(const e of this.enemies){if(e.dead||!overlap(f,e))continue;this.damageEnemy(e,f.damage||5,(f.dir||sign(cx(e)-cx(f)))*120,-40,{kd:4,br:8});if(f.type==='flame')e.burn=Math.max(e.burn,2.2);}f.hitTick=.38;}
 if(f.type==='echoHit'){if((f.delay||0)>0){f.delay-=dt;}else for(const e of this.enemies){if(e.dead||f.hit.has(e.id)||!overlap(f,e))continue;f.hit.add(e.id);this.damageEnemy(e,f.damage,f.dir*180,-100,{kd:10,br:16});}}
 if(f.type==='beastAura'){f.x=cx(this.player);f.y=cy(this.player);if(f.hitTick<=0){this.radialDamage(f.x,f.y,f.r,7,f.color,{br:12,kd:8});f.hitTick=.7;}}
 if(f.type==='poisonPool'&&overlap(this.player,f)&&f.hitTick<=0){this.player.poison=Math.max(this.player.poison,3.5);this.hurtPlayer(f.damage||3,0,-40,'腐植毒池');f.hitTick=.65;}
 }
 this.fields=this.fields.filter(f=>f.t>0);
};

Game.prototype.updateMovingObjects=function(dt){for(const c of this.crates){c.vy+=C.PHYSICS.gravity*.72*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=Math.pow(.12,dt);const probe={...c};for(const s of this.activePlatforms(probe)){if(!overlap(c,s))continue;if(c.vy>=0&&c.y+c.h-c.vy*dt<=s.y+12){c.y=s.y-c.h;c.vy=0;}else if(!s.oneWay){if(c.vx>0)c.x=s.x-c.w;else if(c.vx<0)c.x=s.x+s.w;c.vx=0;}}
  if(c.kind==='core'&&distXY(cx(c),cy(c),c.targetX,c.targetY)<75)this.solvePuzzleById('p_gravity');if(c.kind==='cargo'&&distXY(cx(c),cy(c),c.targetX,c.targetY)<85)this.solvePuzzleById('p_wind');
 }
};

/* --------------------------------------------------------------------------
 * ENEMY AI / TELEGRAPHS
 * -------------------------------------------------------------------------- */
Game.prototype.nearestEnemy=function(range=Infinity){const p=this.player;return this.enemies.filter(e=>!e.dead&&distance(p,e)<range).sort((a,b)=>distance(p,a)-distance(p,b))[0]||null;};
Game.prototype.sameEncounter=function(e){const pRoom=this.roomById.get(this.currentRoomId);if(!pRoom||pRoom.shelter)return false;if(e.room===this.currentRoomId)return true;const linked=W.edges.some(q=>(q.a===this.currentRoomId&&q.b===e.room)||(q.b===this.currentRoomId&&q.a===e.room));return linked&&distance(this.player,e)<650;};

Game.prototype.updateEnemies=function(dt){const p=this.player;
 for(const e of this.enemies){if(e.dead)continue;e.hitFlash=Math.max(0,e.hitFlash-dt);e.stun=Math.max(0,e.stun-dt);e.freeze=Math.max(0,e.freeze-dt);e.root=Math.max(0,e.root-dt);e.wet=Math.max(0,e.wet-dt);e.curse=Math.max(0,e.curse-dt);e.armorBreak=Math.max(0,e.armorBreak-dt);e.markT=Math.max(0,e.markT-dt);e.breakStun=Math.max(0,e.breakStun-dt);e.mimicOpen=Math.max(0,(e.mimicOpen||0)-dt);e.aiT-=dt;if(e.markT<=0)e.mark=null;
  if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.55;this.damageEnemy(e,3,0,0,{kd:0,br:2,key:'DOT'});}}
  if(e.downT>0){e.downT-=dt;e.stun=Math.max(e.stun,e.downT);e.vx*=Math.pow(.03,dt);}
  if(e.dead)continue;
  // Attached parasites become a readable status, not an invisible contact hit.
  if(e.ai==='parasite'&&e.attached){if(p.parasiteId!==e.id){e.attached=false;}else{e.hidden=false;e.x=p.x+(p.dir>0?-e.w-7:p.w+7);e.y=p.y+10;e.vx=e.vy=0;e.drainT-=dt;if(e.drainT<=0){e.drainT=.72;this.hurtPlayer(3,0,0,'能量寄生',true);e.hp=Math.min(e.maxHp,e.hp+3);}continue;}}
  e.aggro=e.ai!=='dummy'&&this.sameEncounter(e);const target=e.decoy&&distXY(e.decoy.x,e.decoy.y,cx(e),cy(e))<520?e.decoy:{x:cx(p),y:cy(p)};e.decoy=null;const dx=target.x-cx(e),dy=target.y-cy(e),ad=Math.abs(dx),dir=sign(dx);e.dir=dir;
  if(e.breakStun>0){e.vx*=.8;e.state='break';}
  else if(e.aggro&&e.stun<=0&&e.freeze<=0&&e.root<=0)this.enemyBrain(e,dt,dx,dy,ad,dir);
  else if(e.ai!=='dummy'){e.vx=approach(e.vx,0,500*dt);if(!['hidden','buried','dormant'].includes(e.state))e.state='idle';}
  const intangible=(e.ai==='ambusher'&&e.hidden)||(e.ai==='burrower'&&e.hidden);
  if(!intangible){e.vy=Math.min(C.PHYSICS.maxFall,e.vy+C.PHYSICS.gravity*dt);this.moveBody(e,dt,{enemy:true});}
  if(e.airborne&&e.onGround){e.airborne=false;e.downT=.5;e.stun=.5;e.vx*=.35;}
  if(e.aggro&&e.ai!=='dummy'&&!e.attached&&overlap(p,e)&&!['hidden','buried','dormant'].includes(e.state)){
   if(e.ai==='parasite'&&!p.parasiteId){e.attached=true;e.state='attached';p.parasiteId=e.id;p.parasiteDashes=0;this.say('寄生！連續 Dash 三次可甩脫',2,'#f39ab7');}
   else this.hurtPlayer(e.damage,dir*300,-180,e.name);
  }
 }
};

Game.prototype.enemyBrain=function(e,dt,dx,dy,ad,dir){const slow=e.freeze>0?.3:1,spd=e.speed*slow*(1+e.anger);
 if(e.ai==='slime'){
  e.state='move';e.vx=approach(e.vx,dir*spd,420*dt);if(e.onGround&&e.aiT<=0&&ad<210){e.vy=-420;e.vx=dir*(220+e.anger*120);e.aiT=1.0;}
 }
 else if(e.ai==='charger'){
  if(e.state==='charge'){e.vx=e.dir*620;if(e.stateT<=0){e.state='idle';e.aiT=1.3;}}
  else if(e.state==='windup'){e.vx=0;if(e.stateT<=0){e.state='charge';e.stateT=.42;this.sfx.slash(true);}}
  else if(ad<640&&e.aiT<=0){e.state='windup';e.stateT=.72;e.vx=0;e.telegraph={type:'line',x:e.dir>0?e.x:e.x-600,y:e.y+e.h-45,w:650,h:45,t:.72};}
  else{e.state='move';e.vx=approach(e.vx,dir*spd,350*dt);}
 }
 else if(e.ai==='archer'){
  e.vx=(ad<260?-dir:ad>510?dir:0)*spd;e.state='move';if(ad<720&&e.aiT<=0){e.aiT=1.45;e.state='attack';this.fireEnemyShot(e,'arrow',210,0,1,.42);}
 }
 else if(e.ai==='scatterer'){
  e.vx=(ad<310?-dir:0)*spd*.7;if(e.aiT<=0){e.aiT=2.15;e.state='special';for(let n=-3;n<=3;n++){const a=n*.22;this.fireEnemyShot(e,'orb',185*Math.cos(a)*dir,185*Math.sin(a),1,.55);}}
 }
 else if(e.ai==='bombardier'){
  e.vx=(ad<320?-dir:ad>640?dir:0)*spd*.6;if(e.aiT<=0){e.aiT=2.4;e.state='special';const tx=this.player.x+this.player.vx*.5,ty=this.player.y+this.player.h-35;this.enemyShots.push({id:this.id(),type:'bombMarker',x:tx-55,y:ty-10,w:110,h:20,t:1.0,warmup:1.0,damage:e.damage,owner:e.name,color:e.color,targetX:tx,targetY:ty});}
 }
 else if(e.ai==='spitter'){
  e.vx=(ad<250?-dir:0)*spd*.55;if(e.aiT<=0){e.aiT=2.2;e.state='attack';this.enemyShots.push({id:this.id(),type:'poisonGlob',x:cx(e),y:e.y+10,w:24,h:24,vx:dir*150,vy:-350,t:4,warmup:.45,damage:e.damage,owner:e.name,color:'#91b95d',gravity:720});}
 }
 else if(e.ai==='ambusher'){
  if(e.state==='hidden'){e.hidden=true;e.vx=0;if(e.stateT<=0){e.hidden=false;e.state='strike';const safe=this.findSafePosition(this.player.x-this.player.dir*95,this.player.y,e.w,e.h);e.x=safe.x;e.y=safe.y;e.dir=this.player.dir;e.stateT=.42;this.addFx('ring',cx(e),cy(e),.32,1.2,e.color);}}
  else if(e.state==='strike'){e.vx=e.dir*420;if(e.stateT<=0){e.state='idle';e.aiT=1.8;}}
  else if(e.aiT<=0){e.state='hidden';e.stateT=.7;e.telegraph={type:'circle',x:this.player.x-this.player.dir*90,y:this.player.y,r:55,t:.7};}
  else{e.state='move';e.vx=dir*spd*.7;}
 }
 else if(e.ai==='spider'){
  e.vx=ad>260?dir*spd:0;if(e.aiT<=0&&ad<560){e.aiT=2.0;e.state='attack';this.fireEnemyShot(e,'web',165,dy/ad*.2,1,.5);}
 }
 else if(e.ai==='reflector'){
  e.state='move';e.vx=ad>95?dir*spd:0;if(e.aiT<=0&&ad<170){e.aiT=1.35;e.state='attack';e.vx=dir*300;}
 }
 else if(e.ai==='healer'){
  e.vx=(ad<260?-dir:0)*spd*.6;if(e.aiT<=0){e.aiT=2.0;e.state='special';for(const ally of this.enemies)if(!ally.dead&&ally!==e&&distXY(cx(e),cy(e),cx(ally),cy(ally))<330)ally.hp=Math.min(ally.maxHp,ally.hp+(e.curse>0?4:12));this.addFx('ring',cx(e),cy(e),.5,1.8,e.color);}
 }
 else if(e.ai==='sniper'){
  if(e.state==='aim'){e.vx=0;if(e.stateT<=0){const tx=cx(this.player),ty=cy(this.player),sx=cx(e),sy=e.y+18,m=Math.hypot(tx-sx,ty-sy)||1;this.enemyShots.push({id:this.id(),type:'sniperRound',x:sx-8,y:sy-8,w:16,h:16,vx:(tx-sx)/m*520,vy:(ty-sy)/m*520,t:4,warmup:0,damage:e.damage,owner:e.name,color:'#fff09a',gravity:0,friendly:false});e.state='idle';e.aiT=2.0;this.sfx.slash(true);}}
  else if(e.aiT<=0&&ad<1100){e.state='aim';e.stateT=.9;const x=Math.min(cx(e),cx(this.player)),w=Math.abs(cx(e)-cx(this.player));e.telegraph={type:'line',x,y:cy(this.player)-7,w:Math.max(40,w),h:14,t:.9};}
  else{e.vx=(ad<440?-dir:ad>800?dir:0)*spd*.55;e.state='move';}
 }
 else if(e.ai==='burrower'){
  if(e.state==='buried'){e.hidden=true;e.vx=0;if(e.stateT<=0){const safe=this.findSafePosition(this.player.x+rand(-55,55),this.player.y+5,e.w,e.h);e.x=safe.x;e.y=safe.y;e.hidden=false;e.state='erupt';e.stateT=.38;e.vy=-360;this.addFx('ring',cx(e),e.y+e.h,.35,1.35,e.color);}}
  else if(e.state==='erupt'){e.vx=dir*250;if(e.stateT<=0){e.state='idle';e.aiT=1.45;}}
  else if(e.aiT<=0&&ad<650){e.state='buried';e.stateT=.78;e.telegraph={type:'circle',x:cx(this.player),y:this.player.y+this.player.h,r:64,t:.78};}
  else{e.hidden=false;e.state='move';e.vx=approach(e.vx,dir*spd,340*dt);}
 }
 else if(e.ai==='shocker'){
  if(e.state==='pulse'){e.vx=0;if(e.stateT<=0){if(distance(this.player,e)<185){this.player.web=Math.max(this.player.web,.72);this.hurtPlayer(e.damage,dir*180,-90,e.name+'・脈衝');}this.addFx('ring',cx(e),cy(e),.45,2.15,'#fff176');e.state='idle';e.aiT=1.6;}}
  else if(e.aiT<=0&&ad<230){e.state='pulse';e.stateT=.72;e.telegraph={type:'circle',x:cx(e),y:cy(e),r:180,t:.72};}
  else{e.state='move';e.vx=approach(e.vx,dir*spd,300*dt);}
 }
 else if(e.ai==='parasite'){
  e.state='move';e.vx=approach(e.vx,dir*spd,620*dt);if(Math.abs(dy)>45)e.vy+=sign(dy)*230*dt;
 }
 else if(e.ai==='mimic'){
  if(e.mimicOpen>0){e.state='special';e.vx=approach(e.vx,dir*spd*1.8,300*dt);if(e.aiT<=0&&ad<160){e.aiT=1.0;e.vx=dir*330;e.vy=-210;}}
  else{e.state='idle';e.vx=0;if(ad<230&&e.aiT<=0){e.aiT=1.2;e.vy=-260;e.vx=dir*180;}}
 }
 else if(e.ai==='breeder'){
  if(e.state==='breed'){e.vx=0;if(e.stateT<=0){const alive=this.enemies.filter(q=>!q.dead&&q.parentId===e.id).length;for(let n=alive;n<2;n++){const child=this.spawnEnemy('slime',cx(e)+(n?65:-65),e.y+e.h,{room:e.room,hp:28});if(child){child.parentId=e.id;child.anger=.25;}}e.state='idle';e.aiT=2.6;this.addFx('ring',cx(e),cy(e),.45,1.8,e.color);}}
  else if(e.aiT<=0){e.state='breed';e.stateT=.85;e.telegraph={type:'circle',x:cx(e),y:cy(e),r:95,t:.85};}
  else{e.state='move';e.vx=(ad<280?-dir:0)*spd*.55;}
 }
 else if(e.ai==='artillery'){
  e.vx=0;e.state='idle';if(e.aiT<=0){e.aiT=3.0;e.state='special';const lead=this.player.vx*.45;for(const ox of [-150,0,150]){const tx=this.player.x+lead+ox,ty=this.player.y+this.player.h-18;this.enemyShots.push({id:this.id(),type:'bombMarker',x:tx-62,y:ty-10,w:124,h:20,t:1.15,warmup:1.15,damage:e.damage,owner:e.name,color:e.color,targetX:tx,targetY:ty});}} 
 }
 else if(e.ai==='sentinel')this.sentinelBrain(e,dt,dx,dy,ad,dir);
 if(e.stateT>0)e.stateT-=dt;if(e.telegraph){e.telegraph.t-=dt;if(e.telegraph.t<=0)e.telegraph=null;}
};

Game.prototype.sentinelBrain=function(e,dt,dx,dy,ad,dir){
 e.phase=e.hp/e.maxHp<.34?3:e.hp/e.maxHp<.67?2:1;
 if(!e.bossAwake){e.state='dormant';e.vx=0;if(this.currentRoomId==='r48'){e.bossAwake=true;e.state='phase';e.stateT=1.15;this.say('十相哨兵・赫利俄斯｜PHASE 1',2.5,'#ff9ab4');}return;}
 if(e.state==='phase'){e.vx=0;if(e.stateT<=0){e.state='idle';e.aiT=.65;}}
 else if(e.state==='bossDash'){e.vx=e.dir*(660+e.phase*90);if(overlap(e,this.player))this.hurtPlayer(e.damage+e.phase*2,e.dir*440,-260,e.name+'・裂界突進');if(e.stateT<=0){e.state='idle';e.aiT=.85;}}
 else if(e.state==='bossWind'){e.vx=0;if(e.stateT<=0){e.state='bossDash';e.stateT=.52;this.sfx.slash(true);}}
 else if(e.state==='bossCollapse'){e.vx=0;if(e.stateT<=0){e.state='idle';e.aiT=1.0;}}
 else if(e.aiT<=0){const roll=Math.random();
  if(roll<.34){e.state='bossWind';e.stateT=.8;e.telegraph={type:'line',x:dir>0?e.x:e.x-820,y:e.y+35,w:900,h:86,t:.8};}
  else if(roll<.68){e.state='special';e.aiT=1.65;for(let n=-e.phase-1;n<=e.phase+1;n++){const a=n*.18;this.fireEnemyShot(e,'bossOrb',175*Math.cos(a)*dir,175*Math.sin(a),1,.55);}}
  else{e.state='bossCollapse';e.stateT=1.15;for(const ox of [-300,-100,100,300])this.enemyShots.push({id:this.id(),type:'bombMarker',x:this.player.x+ox-72,y:this.player.y+this.player.h-12,w:144,h:22,t:1.05,warmup:1.05,damage:18+e.phase*3,owner:e.name,color:'#ff5979',targetX:this.player.x+ox,targetY:this.player.y+this.player.h});}
 }else{e.state='move';e.vx=ad>175?dir*e.speed*(1+e.phase*.13):0;}
 if(e.stateT>0)e.stateT-=dt;if(e.telegraph){e.telegraph.t-=dt;if(e.telegraph.t<=0)e.telegraph=null;}
};

Game.prototype.fireEnemyShot=function(e,type,speedX,speedY,damageScale=1,warmup=.42){let vx=speedX,vy=speedY;if(Math.abs(speedX)<400&&speedX>=0)vx=e.dir*speedX;this.enemyShots.push({id:this.id(),type,x:cx(e)-10,y:cy(e)-10,w:20,h:20,vx,vy,t:5,warmup,damage:e.damage*damageScale,owner:e.name,color:e.color,gravity:0,friendly:false});};

Game.prototype.updateEnemyShots=function(dt){for(const s of this.enemyShots){s.t-=dt;if(s.type==='bombMarker'){s.warmup-=dt;if(s.warmup<=0&&!s.exploded){s.exploded=true;s.t=.22;this.fields.push({id:this.id(),type:'enemyBlast',x:s.targetX-70,y:s.targetY-120,w:140,h:140,t:.32,damage:s.damage,color:s.color,hit:false,owner:s.owner});this.shake=8;}continue;}
 if(s.warmup>0){s.warmup-=dt;continue;}const prevY=s.y;s.vy+=(s.gravity||0)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.type==='poisonGlob'&&s.vy>=0){const floor=this.activePlatforms(s).find(q=>overlap(s,q)&&prevY+s.h<=q.y+10);if(floor){this.fields.push({id:this.id(),type:'poisonPool',x:s.x-45,y:floor.y-22,w:110,h:28,t:6,damage:4,color:'#91b95d',hitTick:0});s.t=0;continue;}}
 if(s.friendly){for(const e of this.enemies){if(e.dead||!overlap(s,e))continue;this.damageEnemy(e,s.damage*1.6,sign(s.vx)*250,-100,{kd:18,br:25});s.t=0;break;}}
 else if(overlap(s,this.player)){if(s.type==='web')this.player.web=2.2;if(s.type==='poisonGlob')this.player.poison=4;this.hurtPlayer(s.damage,sign(s.vx)*180,-120,s.owner);s.t=0;}
 if(s.type==='poisonGlob'&&s.y>C.WORLD_H-50){this.fields.push({id:this.id(),type:'poisonPool',x:s.x-45,y:s.y-20,w:110,h:38,t:6,damage:4,color:'#91b95d',hitTick:0});s.t=0;}
 }
 for(const f of this.fields)if(f.type==='enemyBlast'&&!f.hit&&overlap(this.player,f)){f.hit=true;this.hurtPlayer(f.damage,sign(cx(this.player)-cx(f))*260,-220,f.owner);}
 this.enemyShots=this.enemyShots.filter(s=>s.t>0);
};

/* --------------------------------------------------------------------------
 * PUZZLES / COLLECTIBLES / NPC / FURNITURE
 * -------------------------------------------------------------------------- */
Game.prototype.gateOpen=function(g){if(!g.gate)return true;if(GATE_TO_PUZZLE[g.gate])return!!this.progress.solved[GATE_TO_PUZZLE[g.gate]];if(g.gate==='memory')return this.progress.memory>=1;if(g.gate==='allCollect')return this.collectibles.filter(c=>!c.taken).length===0;if(g.gate==='grapple')return this.progress.mobility>=1;return false;};
Game.prototype.puzzleElement=function(p,id){if(p.solved)return;const expected=p.elements[p.step];if(id===expected){p.step++;p.lastElement=id;p.flash=.5;this.say(`${p.hint}｜${p.step}/${p.elements.length}`,1.6,C.ELEMENTS.find(e=>e.id===id)?.color||'#70ded9');if(p.step>=p.elements.length)this.solvePuzzleById(p.id);}else{p.step=0;p.lastElement=id;this.say(`元素順序不符｜提示：${p.hint}`,1.8,'#f3c77e');}};
Game.prototype.solvePuzzleById=function(id){const p=this.puzzles.find(q=>q.id===id);if(!p||p.solved)return;p.solved=true;p.step=p.elements.length;this.progress.solved[id]=true;this.progress.scrap+=5;this.saveProgress();this.say(`解謎完成｜${p.hint}`,3,'#88e5ae');this.addFx('ring',p.x,p.y,.8,2.3,'#88e5ae');for(const g of this.gates)if(GATE_TO_PUZZLE[g.gate]===id)g.flash=.8;};
Game.prototype.updatePuzzles=function(dt){for(const p of this.puzzles){p.flash=Math.max(0,p.flash-dt);if(!p.solved&&p.id==='p_shadow'&&this.player.phase>0&&distXY(cx(this.player),cy(this.player),p.x,p.y)<130)this.solvePuzzleById(p.id);if(!p.solved&&p.id==='p_light'&&this.fields.some(f=>f.type==='lightAura'&&distXY(f.x,f.y,p.x,p.y)<260))this.solvePuzzleById(p.id);}
 for(const g of this.gates)g.flash=Math.max(0,g.flash-dt);
 // Fire can remove poison zones; ice freezes water-like poison hazards into stepping stones.
 for(const f of this.fields){if(f.type==='poisonPool'){for(const flame of this.fields)if(flame.type==='flame'&&overlap(f,flame))f.t=0;}}
};

Game.prototype.requirementMet=function(req){if(!req)return true;if(GATE_TO_PUZZLE[req])return!!this.progress.solved[GATE_TO_PUZZLE[req]];if(req==='memory')return this.progress.memory>0;if(req==='allCollect')return this.collectibles.filter(c=>!c.taken&&c.requires!=='allCollect').length===0;if(req==='grapple')return this.progress.mobility>0;return!!this.progress.solved[`p_${req}`];};
Game.prototype.collect=function(c){if(c.taken)return;if(!this.requirementMet(c.requires)){this.say(`神殿尚未開啟｜需要 ${c.requires}`,1.5,'#e7bd75');return;}c.taken=true;this.progress.opened[`collect_${c.id}`]=true;const cfg=C.COLLECTIBLES[c.type];
 if(c.type==='life'){this.progress.hpBonus+=12;this.player.maxHp+=12;this.player.hp=this.player.maxHp;}
 if(c.type==='mobility'){this.progress.mobility++;this.player.airDashes=2;}
 if(c.type==='element')this.progress.element++;
 if(c.type==='crest')this.progress.crest++;
 if(c.type==='memory'){this.progress.memory++;const room=this.roomById.get(c.room);for(const e of W.edges)if(e.a===room.id)this.progress.discovered[e.b]=true;else if(e.b===room.id)this.progress.discovered[e.a]=true;}
 if(c.type==='shelter'){this.progress.shelter++;this.progress.shelters[c.room]=true;}
 this.progress.scrap+=8;this.sfx.collect();this.addFx('ring',cx(c),cy(c),.8,2.2,cfg.color);this.say(`${cfg.name}｜${cfg.effect}`,3,cfg.color);this.saveProgress();
};

Game.prototype.updateInteractions=function(){const p=this.player;this.nearInteract=null;let best=88;
 const candidates=[...this.furniture.map(x=>({kind:'furniture',ref:x,x:cx(x),y:cy(x),label:C.FURNITURE[x.kind]?.name})),...this.npcs.map(x=>({kind:'npc',ref:x,x:cx(x),y:cy(x),label:x.name})),...this.collectibles.filter(c=>!c.taken).map(x=>({kind:'collectible',ref:x,x:cx(x),y:cy(x),label:C.COLLECTIBLES[x.type].name}))];
 for(const c of candidates){const d=distXY(cx(p),cy(p),c.x,c.y);if(d<best){best=d;this.nearInteract=c;}}
};
Game.prototype.interact=function(){const n=this.nearInteract;if(!n)return;if(n.kind==='collectible'){this.collect(n.ref);return;}if(n.kind==='furniture'){this.useFurniture(n.ref);return;}if(n.kind==='npc')this.useNPC(n.ref);};

Game.prototype.useFurniture=function(f){const p=this.player,cfg=C.FURNITURE[f.kind];
 if(f.kind==='fridge'){p.hp=Math.min(p.maxHp,p.hp+40);p.foodT=90;if(!f.used){this.progress.scrap+=4;f.used=true;}}
 if(f.kind==='bed'){p.hp=p.maxHp;p.checkpoint={x:p.x,y:p.y,room:f.room};this.progress.shelters[f.room]=true;}
 if(f.kind==='workbench'){p.skillCD=[0,0,0,0,0];p.qCD=0;p.workT=75;}
 if(f.kind==='radio'){this.revealNearby(f.room,2);}
 if(f.kind==='locker'){if(!f.used){this.progress.scrap+=7;f.used=true;}else p.shield=Math.max(p.shield,10);}
 if(f.kind==='map'){this.progress.shelters[f.room]=true;this.renderMap();$('#mapPanel').hidden=false;}
 if(f.kind==='terminal'){this.revealNearby(f.room,1);for(const g of this.gates)if(g.a===f.room||g.b===f.room)g.flash=.8;}
 if(f.kind==='stove'){p.foodT=120;}
 if(f.kind==='purifier'){p.burn=p.poison=p.web=0;p.shield=Math.max(p.shield,25);}
 if(f.kind==='shelf'){this.progress.comboLesson=(this.progress.comboLesson+1)%4;this.showComboLesson();}
 if(f.kind==='sofa'){p.skillCD=[0,0,0,0,0];p.qCD=0;p.hp=Math.min(p.maxHp,p.hp+20);}
 if(f.kind==='lamp'){this.progress.opened[`lamp_${f.room}`]=true;}
 this.say(`${cfg.name}｜${cfg.effect}`,2,'#ead187');this.saveProgress();
};
Game.prototype.revealNearby=function(roomId,depth=1){let seen=new Set([roomId]),front=[roomId];for(let d=0;d<depth;d++){const next=[];for(const id of front)for(const e of W.edges){const other=e.a===id?e.b:e.b===id?e.a:null;if(other&&!seen.has(other)){seen.add(other);next.push(other);}}front=next;}for(const id of seen)this.progress.discovered[id]=true;this.saveProgress();};

Game.prototype.useNPC=function(n){const p=this.player;
 if(n.role==='medic'){p.hp=p.maxHp;p.burn=p.poison=p.web=0;p.checkpoint={x:p.x,y:p.y,room:n.room};}
 if(n.role==='trainer'){this.showComboLesson();n.lesson++;}
 if(n.role==='mechanic'){p.skillCD=[0,0,0,0,0];p.qCD=0;}
 if(n.role==='cartographer'){this.revealNearby(n.room,2);this.renderMap();$('#mapPanel').hidden=false;}
 if(n.role==='quartermaster'){if(this.progress.scrap>=5){this.progress.scrap-=5;p.shield=Math.max(p.shield,50);p.workT=90;}else this.say('需要 5 個零件',1,'#edb77c');}
 if(n.role==='archivist'){this.progress.memory=Math.max(1,this.progress.memory);this.revealNearby(n.room,3);}
 if(n.role==='gardener'){this.progress.element=Math.max(this.progress.element,1);this.fields.push({id:this.id(),type:'vinePillar',x:p.x+60,y:p.y-220,w:55,h:260,t:18,color:'#75cc7e',oneWay:false});}
 if(n.role==='ranger'){const c=this.collectibles.filter(c=>!c.taken).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(c)this.say(`最近神殿：${C.COLLECTIBLES[c.type].name}｜${Math.round(distance(p,c))}px`,4,'#94e0ad');}
 if(n.role!=='trainer'&&n.role!=='ranger')this.say(`${n.name}｜${n.text}`,3,C.CLASSES[p.classId].accent);this.saveProgress();
};

Game.prototype.showComboLesson=function(){const lessons=[
 '接招 1｜ZZX 挑空 → 跳躍 → Air Z → Air X 地面彈起',
 '接招 2｜ZX 換側斬 → C 技能取消 → RZ 逐影刺',
 '接招 3｜XX 重擊 → V 位移挑空 → 空中 Dash → Air ZZ',
 '接招 4｜元素標記 → 同鍵換位 → XZX 破陣穿身 → B 終結技'
 ];this.say(lessons[this.progress.comboLesson%lessons.length],5,'#f3dc87');this.progress.comboLesson=(this.progress.comboLesson+1)%lessons.length;};

/* --------------------------------------------------------------------------
 * CAMERA / EFFECTS / RESPAWN / NETWORK
 * -------------------------------------------------------------------------- */
Game.prototype.updateEffects=function(dt){for(const e of this.effects)e.t-=dt;this.effects=this.effects.filter(e=>e.t>0);for(const a of this.afterimages)a.t-=dt;this.afterimages=this.afterimages.filter(a=>a.t>0);};
Game.prototype.updateCamera=function(dt){const p=this.player;const lookX=p.dir*85,lookY=p.vy<0?-85:p.vy>450?45:0;const tx=clamp(cx(p)-this.viewW*.43+lookX,0,C.WORLD_W-this.viewW),ty=clamp(cy(p)-this.viewH*.62+lookY,0,C.WORLD_H-this.viewH);this.camera.x=lerp(this.camera.x,tx,1-Math.pow(.0008,dt));this.camera.y=lerp(this.camera.y,ty,1-Math.pow(.0008,dt));};
Game.prototype.respawn=function(reason='重生'){const p=this.player,safe=this.findSafePosition(p.checkpoint.x,p.checkpoint.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.vx=p.vy=0;p.hp=p.maxHp;p.shield=0;p.inv=1.2;p.downT=0;p.attack=null;p.buffer=null;p.history='';this.say(`${reason}｜返回 ${this.roomById.get(p.checkpoint.room)?.name||'避難所'}`,2,'#f19a9f');};

Game.prototype.bindNetwork=function(){this.network.on('room',id=>{$('#roomCode').value=id;});this.network.on('status',s=>{$('#networkStatus').textContent=s;});this.network.on('error',s=>{this.say(`連線錯誤：${s}`,2,'#ff8796');});this.network.on('player',s=>{this.remote=s;});};
Game.prototype.updateNetwork=function(ts){const p=this.player;this.network.sendState({x:p.x,y:p.y,dir:p.dir,classId:p.classId,form:p.form,hp:p.hp,maxHp:p.maxHp,room:this.currentRoomId},ts);};

/* --------------------------------------------------------------------------
 * UI / OBJECTIVE / TUTORIAL
 * -------------------------------------------------------------------------- */
Game.prototype.currentObjective=function(){const room=this.roomById.get(this.currentRoomId);if(!room)return['探索','尋找下一條路。'];if(room.id==='r48'){const boss=this.ensureBoss();return boss&&!boss.dead?['BOSS館｜十相哨兵・赫利俄斯','讀紅色預警、削減 BREAK；失衡後用終結技與元素換位輸出。']:['冠頂恢復','Boss 已擊破；探索全收集隱藏結局房。'];}const local=this.puzzles.filter(p=>!p.solved&&p.room===room.id)[0];if(local)return['房間解謎',local.hint];const gates=this.gates.filter(g=>!this.gateOpen(g)&&(g.a===room.id||g.b===room.id));if(gates[0])return['能力門',`${gates[0].label}｜需要 ${gates[0].gate}`];const c=this.collectibles.filter(q=>!q.taken&&q.room===room.id)[0];if(c)return['功能神殿',`${C.COLLECTIBLES[c.type].name}｜${C.COLLECTIBLES[c.type].effect}`];if(room.shelter)return['避難所',`與家具、NPC 互動；從 ${room.name} 尋找下一條支線。`];return['探索與戰鬥',room.note];};
Game.prototype.updateTutorial=function(){const p=this.player;if(this.objectiveStep===0&&Math.abs(p.x-C.START_X)>60){this.objectiveStep=1;this.say('STEP 2｜Z、ZZ、ZZX；X、XX、XZX 都是不同 Command。',4);}if(this.objectiveStep===1&&this.commandT>0){this.objectiveStep=2;this.say('STEP 3｜按 1 發射慢速火元素，再按 1 完成換位。',4);}if(this.objectiveStep===2&&this.elementShots.length){this.objectiveStep=3;}if(this.objectiveStep===3&&this.lastSwap){this.objectiveStep=4;this.showComboLesson();}if(this.objectiveStep===4&&this.currentRoomId!=='r00'){this.objectiveStep=5;this.say('M 開有機世界圖｜白框避難所、紫線能力門、支線藏功能神殿。',5);}};
Game.prototype.classStateText=function(){const p=this.player;if(p.classId==='rift')return`RIFT ${Math.round(p.classGauge)}`;if(p.classId==='summoner')return`契靈 ${this.summons.length}/3`;if(p.classId==='beast')return`${{wolf:'狼形',eagle:'鷹形',bear:'熊形',king:'森王'}[p.form]}`;if(p.classId==='artificer')return`炮台 ${this.turrets.length}/1`;if(p.classId==='gunner')return'RECOIL';if(p.classId==='warden')return p.parry>0?'PARRY':'GUARD';if(p.classId==='chrono')return p.anchor?'ANCHOR SET':'ECHO';return'CHAIN';};
Game.prototype.updateUI=function(){this.updateTutorial();const p=this.player,cl=C.CLASSES[p.classId],room=this.roomById.get(this.currentRoomId),reg=this.regionData(this.currentRegion);$('#classIcon').textContent=cl.icon;$('#className').textContent=cl.name;$('#classState').textContent=this.classStateText();$('#classDesc').textContent=cl.desc;$('#hpFill').style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;$('#hpText').textContent=`HP ${Math.ceil(p.hp)} / ${p.maxHp}`;
 $('#regionName').textContent=reg.name;$('#roomName').textContent=room?.name||'未知區域';$('#roomNote').textContent=room?.note||'';const[objTitle,objText]=this.currentObjective();$('#objectiveTitle').textContent=objTitle;$('#objectiveText').textContent=objText;
 const threat=this.enemies.filter(e=>!e.dead&&e.aggro).sort((a,b)=>distance(p,a)-distance(p,b))[0];const th=$('#threatText');if(room?.shelter){th.textContent='SAFE｜避難所';th.className='threat safe';}else if(threat){th.textContent=`⚠ ${threat.name} · ${Math.round(distance(p,threat))}px`;th.className='threat danger';}else{th.textContent='CLEAR｜附近無主動威脅';th.className='threat safe';}
 $('#comboText').textContent=this.combo.hits>1?`${this.combo.hits} HIT · ${Math.round(this.combo.damage)} DMG`:'';$('#commandText').textContent=this.commandT>0?this.commandLabel:'';$('#message').textContent=this.message.t>0?this.message.text:'';$('#message').style.borderColor=this.message.color;$('#interactionPrompt').textContent=this.nearInteract?`E｜${this.nearInteract.label}`:'';$('#damageFlash').classList.toggle('on',this.damageFlash>0);
 const el=C.ELEMENTS.find(e=>e.id===this.currentElement),i=C.ELEMENTS.indexOf(el),target=this.findElementTarget(el.id);$('#elementName').textContent=`${el.glyph} ${el.name}`;$('#elementName').style.color=el.color;$('#elementDesc').textContent=target?`已有換位目標｜再按 ${i===9?0:i+1} 交換位置`:`${el.desc}`;
 $$('#elementBar .element').forEach(n=>{const id=n.dataset.id;n.classList.toggle('active',id===this.currentElement);n.classList.toggle('anchor',!!this.findElementTarget(id));n.classList.toggle('marked',this.enemies.some(e=>!e.dead&&e.mark===id&&e.markT>0));});
 $$('#skillBar .skill').forEach((n,i)=>{const cd=i<3?p.skillCD[i]:p.qCD;n.classList.toggle('cooling',cd>0);n.querySelector('small').textContent=cd>0?`${cd.toFixed(1)}s`:'READY';});
 const boss=this.enemies.find(e=>e.type==='sentinel'&&!e.dead);const bh=$('#bossHUD');const active=boss&&(this.currentRoomId==='r48'||boss.aggro||boss.hp<boss.maxHp);bh.classList.toggle('show',!!active);if(active){$('#bossPhase').textContent=`PHASE ${boss.phase||1}`;$('#bossHpFill').style.width=`${boss.hp/boss.maxHp*100}%`;$('#bossBreakFill').style.width=`${boss.break/boss.breakMax*100}%`;}
};

/* --------------------------------------------------------------------------
 * RENDERING — readable gameplay layer over detailed cutaway shelters
 * -------------------------------------------------------------------------- */
Game.prototype.render=function(){const ctx=this.ctx,Wv=this.viewW,Hv=this.viewH;ctx.save();ctx.clearRect(0,0,Wv,Hv);ctx.imageSmoothingEnabled=false;this.drawBackground(ctx,Wv,Hv);const sx=this.shake?rand(-this.shake,this.shake):0,sy=this.shake?rand(-this.shake*.45,this.shake*.45):0;ctx.save();ctx.translate(-this.camera.x+sx,-this.camera.y+sy);this.drawRooms(ctx);this.drawPlatforms(ctx);this.drawGatesAndPuzzles(ctx);this.drawFields(ctx);this.drawFurniture(ctx);this.drawCollectibles(ctx);this.drawNPCs(ctx);this.drawEnemies(ctx);this.drawProjectiles(ctx);this.drawSummons(ctx);this.drawPlayer(ctx,this.player,false);if(this.remote)this.drawRemote(ctx);this.drawEffects(ctx);ctx.restore();this.drawForeground(ctx,Wv,Hv);this.drawIndicators(ctx,Wv,Hv);if(this.flash>0){ctx.fillStyle=`rgba(255,255,255,${this.flash*.35})`;ctx.fillRect(0,0,Wv,Hv);}ctx.restore();};

Game.prototype.drawBackground=function(ctx,w,h){const reg=this.regionData(this.currentRegion),p=reg.palette;ctx.fillStyle='#10242a';ctx.fillRect(0,0,w,h);
 for(const[layer,factor,alpha]of[['far',.035,1],['mid',.085,.72]]){const im=this.assets[`bg_${p}_${layer}`];if(!im?.complete)continue;const tw=w,th=h,ox=-((this.camera.x*factor)%tw),oy=-((this.camera.y*factor*.16)%th);ctx.globalAlpha=alpha;ctx.drawImage(im,ox,oy,tw,th);ctx.drawImage(im,ox+tw,oy,tw,th);ctx.drawImage(im,ox,oy+th,tw,th);ctx.globalAlpha=1;}
 // Light atmospheric mist keeps the post-apocalyptic scene detailed but not dark.
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(211,239,229,.12)');g.addColorStop(.55,'rgba(100,155,153,.03)');g.addColorStop(1,'rgba(4,15,19,.20)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
};

Game.prototype.drawRooms=function(ctx){for(const r of this.rooms){if(!inView(r,this.camera,this.viewW,this.viewH,260))continue;const active=r.id===this.currentRoomId,reg=this.regionData(r.region);ctx.save();ctx.globalAlpha=active?.78:.48;ctx.fillStyle=rgba(reg.color,.15);ctx.strokeStyle=rgba(reg.color,active?.65:.30);ctx.lineWidth=active?3:2;ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,r.kind==='cave'?55:14);ctx.fill();ctx.stroke();ctx.clip();
  let atlas=this.assets.facilityAtlas,frames=12;if(r.kind==='shelter'){atlas=this.assets.shelterAtlas;frames=12;}else if(r.kind==='cave'||r.kind==='outdoor'||r.kind==='secret'){atlas=this.assets.caveAtlas;frames=8;}
  if(atlas?.complete){const sw=384,sh=240,frame=r.art%frames;
   if(r.kind==='shaft'){
    const dw=Math.min(r.w-30,650),dh=dw/1.6;for(let y=r.y+15;y<r.y+r.h;y+=dh-15)ctx.drawImage(atlas,frame*sw,0,sw,sh,r.x+(r.w-dw)/2,y,dw,dh);
   }else{
    const dh=Math.min(r.h-30,Math.max(270,r.h*.86)),dw=Math.min(r.w-30,dh*1.6);ctx.drawImage(atlas,frame*sw,0,sw,sh,r.x+(r.w-dw)/2,r.y+r.h-dh-14,dw,dh);
    if(r.w>1250)ctx.drawImage(atlas,((frame+3)%frames)*sw,0,sw,sh,r.x+20,r.y+r.h-dh*.7,Math.min(600,r.w*.42),dh*.68);
   }
  }
  // Soft dark veil lowers background contrast behind actors without erasing detail.
  ctx.fillStyle=active?'rgba(4,13,16,.11)':'rgba(4,13,16,.25)';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.restore();
  ctx.fillStyle=active?'#dff8ef':'#9bbab4';ctx.font=active?'900 13px sans-serif':'800 10px sans-serif';ctx.fillText(r.name,r.x+14,r.y+22);
 }
};

Game.prototype.platformColor=function(type){return{roomFloor:'#1c3337',shelterFloor:'#234347',shaftLedge:'#19363b',hubLedge:'#1d3c40',catwalk:'#304c50',rockLedge:'#314441',ruinLedge:'#304943',secretLedge:'#2e3a49',bossLedge:'#463741',bridge:'#29494c',tunnel:'#273d3b',climbLedge:'#244348',dropLedge:'#2b4548',grappleLanding:'#285056',icePlatform:'#76ddeb',earthPillar:'#a07855',vinePillar:'#579a68',skillPlatform:'#70c8c4'}[type]||'#254147';};
Game.prototype.drawPlatforms=function(ctx){for(const s of this.activePlatforms()){if(!inView(s,this.camera,this.viewW,this.viewH,100))continue;ctx.fillStyle=this.platformColor(s.type);ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle=s.type==='icePlatform'?'#e2fbff':s.type==='vinePillar'?'#a5e1a9':'#7dc5bb';ctx.fillRect(s.x,s.y,s.w,Math.min(5,s.h));ctx.fillStyle='rgba(4,12,14,.28)';for(let x=s.x+8;x<s.x+s.w;x+=28)ctx.fillRect(x,s.y+8,14,3);}
 for(const l of this.ladders){if(!inView(l,this.camera,this.viewW,this.viewH,80))continue;ctx.strokeStyle='#8fa69a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(l.x+5,l.y);ctx.lineTo(l.x+5,l.y+l.h);ctx.moveTo(l.x+l.w-5,l.y);ctx.lineTo(l.x+l.w-5,l.y+l.h);ctx.stroke();for(let y=l.y+8;y<l.y+l.h;y+=24){ctx.beginPath();ctx.moveTo(l.x+5,y);ctx.lineTo(l.x+l.w-5,y);ctx.stroke();}}
 for(const r of this.rings){const o={x:r.x-r.r,y:r.y-r.r,w:r.r*2,h:r.r*2};if(!inView(o,this.camera,this.viewW,this.viewH,60))continue;ctx.save();ctx.strokeStyle='#95f0e6';ctx.shadowColor='#6ae5dd';ctx.shadowBlur=10;ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,r.r+Math.sin(this.time*4+r.id)*2,0,TAU);ctx.stroke();ctx.shadowBlur=0;ctx.restore();}
};

Game.prototype.drawGatesAndPuzzles=function(ctx){for(const g of this.gates){if(this.gateOpen(g)||!inView(g,this.camera,this.viewW,this.viewH,100))continue;const col=g.gate==='fire'?'#ff7a50':g.gate==='ice'?'#78e2ef':g.gate==='light'?'#fff0a6':g.gate==='shadow'?'#aa80df':g.gate==='nature'?'#78cc80':g.gate==='gravity'?'#db7bd8':'#c685d0';ctx.save();ctx.fillStyle=rgba(col,.35);ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=g.flash>0?22:8;ctx.lineWidth=4;ctx.fillRect(g.x,g.y,g.w,g.h);ctx.strokeRect(g.x,g.y,g.w,g.h);ctx.shadowBlur=0;ctx.fillStyle='#f2fbf7';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText(`${g.label}｜${g.gate}`,cx(g),g.y-8);ctx.restore();}
 for(const p of this.puzzles){const o={x:p.x-45,y:p.y-65,w:90,h:110};if(!inView(o,this.camera,this.viewW,this.viewH,100))continue;const expected=p.elements[Math.min(p.step,p.elements.length-1)],el=C.ELEMENTS.find(e=>e.id===expected),col=p.solved?'#77e2a1':el?.color||'#d68bd6';ctx.save();ctx.strokeStyle=col;ctx.fillStyle=rgba(col,p.solved?.32:.15);ctx.shadowColor=col;ctx.shadowBlur=p.flash>0?22:8;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,30+Math.sin(this.time*3+p.x)*3,0,TAU);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#eefbf7';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText(p.solved?'SOLVED':`${p.step}/${p.elements.length} ${el?.glyph||''}`,p.x,p.y+4);ctx.fillText(p.hint.slice(0,14),p.x,p.y+49);ctx.restore();}
 for(const c of this.crates){if(!inView(c,this.camera,this.viewW,this.viewH,80))continue;ctx.fillStyle=c.kind==='core'?'#b575c8':'#957450';ctx.strokeStyle=c.kind==='core'?'#f0b2ef':'#d5b47e';ctx.lineWidth=3;ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeRect(c.x,c.y,c.w,c.h);if(c.kind==='core'){ctx.beginPath();ctx.arc(cx(c),cy(c),10,0,TAU);ctx.stroke();}}
};

Game.prototype.drawFields=function(ctx){for(const f of this.fields){if(f.t<=0)continue;ctx.save();const alpha=clamp(f.t/Math.min(f.max||f.t,1.2),.18,.8);ctx.globalAlpha=alpha;
 if(f.type==='flame'){ctx.fillStyle=rgba(f.color,.38);for(let x=f.x;x<f.x+f.w;x+=20){ctx.beginPath();ctx.moveTo(x,f.y+f.h);ctx.lineTo(x+10,f.y+10+Math.sin(this.time*8+x)*10);ctx.lineTo(x+20,f.y+f.h);ctx.fill();}}
 else if(f.type==='geyser'){ctx.fillStyle=rgba(f.color,.30);ctx.fillRect(f.x,f.y,f.w,f.h);ctx.strokeStyle='#d9f4ff';ctx.lineWidth=3;for(let y=f.y;y<f.y+f.h;y+=35){ctx.beginPath();ctx.moveTo(f.x+15,y);ctx.quadraticCurveTo(cx(f),y-18,f.x+f.w-15,y);ctx.stroke();}}
 else if(['gravity','stasis','chainVortex','guardianAura','fortress','beastAura','lightAura','decoy'].includes(f.type)){ctx.strokeStyle=f.color;ctx.lineWidth=4;for(let i=1;i<=3;i++){ctx.beginPath();ctx.arc(f.x,f.y,(f.r||150)*i/3+Math.sin(this.time*4+i)*5,0,TAU);ctx.stroke();}}
 else if(['shockwave','flameJet','echoHit','enemyBlast','poisonPool'].includes(f.type)){ctx.fillStyle=rgba(f.color||'#ff6680',.33);ctx.fillRect(f.x,f.y,f.w,f.h);ctx.strokeStyle=f.color||'#ff6680';ctx.strokeRect(f.x,f.y,f.w,f.h);}
 ctx.restore();}
};

Game.prototype.drawFurniture=function(ctx){const atlas=this.assets.furniture;for(const f of this.furniture){if(!inView(f,this.camera,this.viewW,this.viewH,50))continue;const idx=FURNITURE_KINDS.indexOf(f.kind);if(atlas?.complete&&idx>=0)ctx.drawImage(atlas,idx*64,0,64,64,f.x-7,f.y-8,64,64);else{ctx.fillStyle='#8aa397';ctx.fillRect(f.x,f.y,f.w,f.h);}if(this.nearInteract?.ref===f){ctx.fillStyle='#fff2a8';ctx.font='900 9px sans-serif';ctx.fillText(C.FURNITURE[f.kind].name,f.x-5,f.y-12);}}
};

Game.prototype.drawCollectibles=function(ctx){for(const c of this.collectibles){if(c.taken||!inView(c,this.camera,this.viewW,this.viewH,100))continue;const cfg=C.COLLECTIBLES[c.type],im=this.assets[`collect_${c.type}`],fr=Math.floor(this.time*8+c.pulse)%8;ctx.save();ctx.globalAlpha=this.requirementMet(c.requires)?1:.42;ctx.fillStyle='rgba(12,29,31,.85)';ctx.beginPath();ctx.ellipse(cx(c),c.y+c.h-5,48,12,0,0,TAU);ctx.fill();ctx.strokeStyle=cfg.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx(c),cy(c),34+Math.sin(this.time*3+c.pulse)*4,0,TAU);ctx.stroke();if(im?.complete)ctx.drawImage(im,fr*72,0,72,72,c.x-4,c.y-3,72,72);ctx.fillStyle='#f3fbf8';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText(cfg.name,cx(c),c.y-12);ctx.restore();}
};

Game.prototype.drawNPCs=function(ctx){const im=this.assets.player_summoner;for(const n of this.npcs){if(!inView(n,this.camera,this.viewW,this.viewH,70))continue;if(im?.complete){const fr=Math.floor(this.time*6)%8;ctx.drawImage(im,fr*48,0,48,52,n.x-19,n.y-35,78,100);}else{ctx.fillStyle='#d4c4e9';ctx.fillRect(n.x,n.y,n.w,n.h);}ctx.fillStyle='rgba(4,13,16,.85)';ctx.fillRect(n.x-45,n.y-54,130,18);ctx.fillStyle='#eaf8f4';ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(n.name,n.x+20,n.y-41);ctx.textAlign='left';}
};

Game.prototype.playerAnim=function(p){let name='idle';if(p.downT>0)name='down';else if(p.hurtT>0)name='hurt';else if(p.castT>0)name='cast';else if(p.attack)name=p.attack.def.anim;else if(p.dashT>0)name='dash';else if(!p.onGround)name=p.vy<0?'jump':'fall';else if(Math.abs(p.vx)>55)name='run';const row=PLAYER_ROWS[name]??0;let frame=Math.floor(this.time*(name==='run'?12:name==='idle'?6:10))%8;if(p.attack)frame=Math.min(7,Math.floor(p.attack.elapsed/p.attack.def.dur*8));return{name,row,frame};};
Game.prototype.drawPlayer=function(ctx,p,remote=false){
 const cl=C.CLASSES[p.classId]||C.CLASSES.rift;let anim=this.playerAnim(p);let im,sw=64,sh=80,dw=82,dh=104;
 if(p.classId==='beast'){const form=p.kingT>0?'king':p.form;im=this.assets[`player_beast_${form}`];sw=64;sh=64;dw=form==='bear'||form==='king'?108:form==='eagle'?98:102;dh=form==='bear'||form==='king'?108:94;const br={idle:0,run:1,jump:3,fall:3,z1:2,z2:2,x:2,launch:2,air:2,dash:1,hurt:4,down:5,cast:6};anim={...anim,row:br[anim.name]??0};}else im=this.assets[`player_${p.classId}`];
 // Afterimages use the animation row/frame captured when the afterimage was made.
 for(const a of !remote?this.afterimages:[]){if(a.classId!==p.classId)continue;const beast=a.classId==='beast',ai=beast?this.assets[`player_beast_${a.form}`]:this.assets[`player_${a.classId}`];if(!ai?.complete)continue;const asw=64,ash=beast?64:80,adw=beast?dw:82,adh=beast?dh:104;ctx.save();ctx.globalAlpha=a.t/a.max*.20;ctx.translate(a.x+a.w/2,a.y+a.h+6);ctx.scale(a.dir,1);ctx.drawImage(ai,(a.frame??0)*asw,(a.row??0)*ash,asw,ash,-adw/2,-adh,adw,adh);ctx.restore();}
 ctx.save();ctx.globalAlpha=.32;ctx.fillStyle=cl.accent;ctx.shadowColor=cl.accent;ctx.shadowBlur=16;ctx.beginPath();ctx.ellipse(cx(p),p.y+p.h+4,34,8,0,0,TAU);ctx.fill();ctx.restore();
 ctx.save();if(p.inv>0&&Math.floor(this.time*22)%2===0)ctx.globalAlpha=.48;ctx.translate(cx(p),p.y+p.h+6);ctx.scale(p.dir||1,1);ctx.shadowColor=cl.accent;ctx.shadowBlur=remote?5:12;if(im?.complete){const sx=clamp(anim.frame,0,7)*sw,sy=clamp(anim.row,0,Math.floor(im.naturalHeight/sh)-1)*sh;ctx.drawImage(im,sx,sy,sw,sh,-dw/2,-dh,dw,dh);}else{ctx.fillStyle=cl.accent;ctx.fillRect(-p.w/2,-p.h,p.w,p.h);}ctx.restore();
 if(p.shield>0){ctx.strokeStyle=rgba(cl.accent,.75);ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx(p),cy(p),48+Math.sin(this.time*7)*3,0,TAU);ctx.stroke();}
 if(p.grapple){ctx.strokeStyle='#9bf2e9';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx(p),cy(p));ctx.lineTo(p.grapple.x,p.grapple.y);ctx.stroke();}
};
Game.prototype.drawRemote=function(ctx){if(!this.remote)return;const r={...this.remote,w:40,h:60,onGround:true,vx:0,vy:0,dashT:0,attack:null,downT:0,hurtT:0,castT:0,inv:0,shield:0,kingT:0};this.drawPlayer(ctx,r,true);ctx.fillStyle='#84d6ff';ctx.font='900 10px sans-serif';ctx.fillText('P2',r.x,r.y-12);};

Game.prototype.drawEnemies=function(ctx){for(const e of this.enemies){if(e.dead||e.hidden&&!e.hitFlash)continue;if(!inView(e,this.camera,this.viewW,this.viewH,120))continue;const im=this.assets[`enemy_${e.sprite17||e.type}`];let row=ENEMY_ROWS.idle;if(e.downT>0)row=ENEMY_ROWS.down;else if(e.hitFlash>0)row=ENEMY_ROWS.hurt;else if(e.state==='attack'||e.state==='strike'||e.state==='charge'||e.state==='bossDash')row=ENEMY_ROWS.attack;else if(e.state==='special'||e.state==='bossCollapse')row=ENEMY_ROWS.special;else if(Math.abs(e.vx)>8)row=ENEMY_ROWS.move;const fr=Math.floor(this.time*(row===1?10:7))%8;const scale=e.type==='sentinel'?3.65:['charger','reflector','burrower','artillery','breeder'].includes(e.type)?1.78:e.type==='parasite'?1.22:1.48,dw=48*scale,dh=48*scale;
  ctx.save();ctx.translate(cx(e),e.y+e.h+5);ctx.scale(e.dir||-1,1);if(e.hitFlash>0){ctx.shadowColor='#fff';ctx.shadowBlur=22;}else if(e.aggro){ctx.shadowColor='#ff6478';ctx.shadowBlur=10;}if(e.type==='dummy'){ctx.fillStyle='#83e1df';ctx.fillRect(-24,-58,48,58);ctx.strokeStyle='#e9ffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-42,12,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-18,-18);ctx.lineTo(18,-18);ctx.moveTo(0,-36);ctx.lineTo(0,0);ctx.stroke();}else if(im?.complete)ctx.drawImage(im,fr*48,row*48,48,48,-dw/2,-dh,dw,dh);else{ctx.fillStyle=e.color;ctx.fillRect(-e.w/2,-e.h,e.w,e.h);}ctx.restore();
  const near=distance(this.player,e)<850||e.aggro||e.type==='dummy';if(near){ctx.fillStyle='rgba(3,10,13,.86)';ctx.fillRect(e.x-6,e.y-29,e.w+12,17);ctx.fillStyle=e.type==='dummy'?'#9ef3ef':'#effaf7';ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(e.type==='dummy'?'訓練傀儡｜不反擊':e.name,cx(e),e.y-17);ctx.fillStyle='#271219';ctx.fillRect(e.x,e.y-8,e.w,5);ctx.fillStyle=e.type==='dummy'?'#70ded9':'#ff6077';ctx.fillRect(e.x,e.y-8,e.w*clamp(e.hp/e.maxHp,0,1),5);}
  if(e.type==='sentinel'){ctx.fillStyle='#4c2330';ctx.fillRect(e.x,e.y-14,e.w,5);ctx.fillStyle='#74e4df';ctx.fillRect(e.x,e.y-14,e.w*clamp(e.break/e.breakMax,0,1),5);ctx.fillStyle='#ffb3c3';ctx.font='1000 11px sans-serif';ctx.textAlign='center';ctx.fillText('FINAL BOSS',cx(e),e.y-69);}if(e.type==='mimic'&&!e.dead){ctx.fillStyle=e.mimicOpen>0?'#9ff1bd':'#ffd27d';ctx.font='1000 10px sans-serif';ctx.textAlign='center';ctx.fillText(e.mimicOpen>0?'BREAK!':`COMMAND ${e.requiredCommand}`,cx(e),e.y-66);}if(e.type==='parasite'&&e.attached){ctx.fillStyle='#ff9db7';ctx.font='1000 9px sans-serif';ctx.textAlign='center';ctx.fillText(`寄生｜Dash ${this.player.parasiteDashes||0}/3`,cx(e),e.y-44);}
  if(e.aggro){ctx.fillStyle='#ff6177';ctx.font='1000 18px sans-serif';ctx.textAlign='center';ctx.fillText('!',cx(e),e.y-40);}
  if(e.mark&&e.markT>0){const el=C.ELEMENTS.find(q=>q.id===e.mark);ctx.strokeStyle=el.color;ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.strokeRect(e.x-6,e.y-6,e.w+12,e.h+12);ctx.setLineDash([]);ctx.fillStyle=el.color;ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(`${el.glyph}｜再按 ${C.ELEMENTS.indexOf(el)===9?0:C.ELEMENTS.indexOf(el)+1} 換位`,cx(e),e.y-52);}
  if(e.airborne){ctx.fillStyle='#ffeaa0';ctx.font='900 8px sans-serif';ctx.fillText('AIRBORNE',cx(e)-24,e.y-62);}
  if(e.telegraph){ctx.save();ctx.globalAlpha=.25+.2*Math.sin(this.time*22);ctx.fillStyle='#ff5d74';if(e.telegraph.type==='line')ctx.fillRect(e.telegraph.x,e.telegraph.y,e.telegraph.w,e.telegraph.h);else{ctx.beginPath();ctx.arc(e.telegraph.x,e.telegraph.y,e.telegraph.r,0,TAU);ctx.fill();}ctx.restore();}
 }
 ctx.textAlign='left';
};

Game.prototype.drawProjectiles=function(ctx){for(const s of this.elementShots){if(!inView(s,this.camera,this.viewW,this.viewH,80))continue;const el=C.ELEMENTS.find(e=>e.id===s.element),im=this.assets[`element_${el.id}`],fr=Math.floor(this.time*9)%8;ctx.save();for(let i=0;i<s.trail.length;i++){const q=s.trail[i],a=(s.trail.length-i)/s.trail.length*.25,sz=2+(s.trail.length-i)*.28;ctx.fillStyle=rgba(el.color,a);ctx.fillRect(q.x-sz/2,q.y-sz/2,sz,sz);}ctx.shadowColor=el.color;ctx.shadowBlur=18;if(im?.complete){const size=Math.max(52,s.w*1.8);ctx.drawImage(im,fr*72,0,72,72,cx(s)-size/2,cy(s)-size/2,size,size);}else{ctx.fillStyle=el.color;ctx.beginPath();ctx.arc(cx(s),cy(s),s.w/2,0,TAU);ctx.fill();}ctx.shadowBlur=0;if(s.anchor){const key=C.ELEMENTS.indexOf(el)===9?0:C.ELEMENTS.indexOf(el)+1;ctx.strokeStyle=el.color;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(cx(s),cy(s),s.w*.85+8+Math.sin(this.time*6)*2,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(3,10,13,.88)';ctx.fillRect(cx(s)-31,s.y-25,62,16);ctx.fillStyle=el.color;ctx.font='900 8px sans-serif';ctx.textAlign='center';ctx.fillText(`${key} 再按 ↔`,cx(s),s.y-14);}ctx.restore();}
 for(const s of this.skillShots){if(!inView(s,this.camera,this.viewW,this.viewH,80))continue;ctx.save();ctx.strokeStyle=rgba(s.color,.5);ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx(s)-s.vx*.08,cy(s)-s.vy*.08);ctx.lineTo(cx(s),cy(s));ctx.stroke();ctx.fillStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(cx(s),cy(s),Math.max(7,s.w*.38),0,TAU);ctx.fill();ctx.restore();}
 for(const s of this.enemyShots){if(!inView(s,this.camera,this.viewW,this.viewH,80))continue;ctx.save();if(s.type==='bombMarker'){ctx.globalAlpha=.30+.18*Math.sin(this.time*20);ctx.fillStyle=s.color;ctx.beginPath();ctx.ellipse(cx(s),cy(s),s.w/2,12,0,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();}else if(s.warmup>0){ctx.strokeStyle=s.color||'#ff6077';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx(s),cy(s),10+(1-s.warmup/.55)*20,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText('!',cx(s),cy(s)+3);}else{ctx.strokeStyle=rgba(s.color||'#ff6077',.55);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx(s)-s.vx*.09,cy(s)-s.vy*.09);ctx.lineTo(cx(s),cy(s));ctx.stroke();ctx.fillStyle=s.friendly?'#9ff5df':'#fff';ctx.shadowColor=s.color||'#ff6077';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(cx(s),cy(s),6,0,TAU);ctx.fill();}ctx.restore();}
};

Game.prototype.drawSummons=function(ctx){for(const s of this.summons){ctx.save();ctx.fillStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=13;if(s.type==='fox'){ctx.beginPath();ctx.moveTo(s.x-18,s.y+12);ctx.lineTo(s.x,s.y-14);ctx.lineTo(s.x+18,s.y+12);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(s.x,s.y+8,15,0,TAU);ctx.fill();}else if(s.type==='owl'){ctx.beginPath();ctx.arc(s.x,s.y,17,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(s.x-16,s.y);ctx.lineTo(s.x-32,s.y-10);ctx.lineTo(s.x-20,s.y+12);ctx.fill();ctx.beginPath();ctx.moveTo(s.x+16,s.y);ctx.lineTo(s.x+32,s.y-10);ctx.lineTo(s.x+20,s.y+12);ctx.fill();}else{ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(s.x,s.y,22+Math.sin(this.time*5)*3,0,TAU);ctx.stroke();}ctx.shadowBlur=0;ctx.fillStyle='#071216';ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(`${s.rank}`,s.x,s.y+4);ctx.restore();}
 for(const t of this.turrets){ctx.fillStyle='#1a3437';ctx.fillRect(t.x-20,t.y-30,40,35);ctx.fillStyle=t.color;ctx.fillRect(t.x-12,t.y-25,24,9);ctx.fillRect(t.x,t.y-22,30,5);ctx.fillStyle='#eefaf7';ctx.font='900 8px sans-serif';ctx.fillText(`R${t.rank}`,t.x-8,t.y-7);}
};

Game.prototype.drawEffects=function(ctx){for(const e of this.effects){const progress=1-e.t/e.max,a=clamp(e.t/e.max,0,1);ctx.save();ctx.globalAlpha=a;if(e.type==='line'||e.type==='beam'){ctx.strokeStyle=e.color;ctx.lineWidth=e.type==='beam'?18:4;ctx.shadowColor=e.color;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke();if(e.type==='beam'){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke();}}
 else{const im=this.assets[e.type],frame=Math.min(7,Math.floor(progress*8)),sw=e.type==='slash'?112:e.type==='hit'?96:128,size=sw*e.scale;if(im?.complete){ctx.globalCompositeOperation='lighter';ctx.translate(e.x,e.y);ctx.scale(e.dir||1,1);ctx.drawImage(im,frame*sw,0,sw,sw,-size/2,-size/2,size,size);}else{ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,20+progress*45,0,TAU);ctx.stroke();}if(e.text){ctx.fillStyle='#fff';ctx.font='900 15px sans-serif';ctx.textAlign='center';ctx.fillText(e.text,e.x,e.y-25);}}
 ctx.restore();}
};

Game.prototype.drawForeground=function(ctx,w,h){const reg=this.regionData(this.currentRegion),im=this.assets[`bg_${reg.palette}_near`];if(im?.complete){const ox=-((this.camera.x*.20)%w),oy=-((this.camera.y*.08)%h);ctx.globalAlpha=.18;ctx.drawImage(im,ox,oy,w,h);ctx.drawImage(im,ox+w,oy,w,h);ctx.globalAlpha=1;}
 // Clear center gameplay corridor; only subtle top/bottom vignette remains.
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(2,9,12,.22)');g.addColorStop(.18,'rgba(2,9,12,0)');g.addColorStop(.80,'rgba(2,9,12,0)');g.addColorStop(1,'rgba(2,9,12,.30)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
};

Game.prototype.drawIndicators=function(ctx,w,h){const p=this.player;if(this.time<15||this.objectiveStep<2){const x=clamp(cx(p)-this.camera.x,70,w-70),y=clamp(p.y-this.camera.y-22,85,h-160);ctx.fillStyle='#eafff9';ctx.font='900 11px sans-serif';ctx.textAlign='center';ctx.shadowColor='#70e5df';ctx.shadowBlur=9;ctx.fillText('▼ YOU',x,y);ctx.shadowBlur=0;}
 const threats=this.enemies.filter(e=>!e.dead&&e.aggro).sort((a,b)=>distance(p,a)-distance(p,b)).slice(0,3);let n=0;for(const e of threats){const sx=cx(e)-this.camera.x,sy=cy(e)-this.camera.y;if(sx>40&&sx<w-40&&sy>90&&sy<h-140)continue;const x=clamp(sx,30,w-30),y=clamp(sy,135,h-160);ctx.fillStyle='#ff6177';ctx.beginPath();ctx.arc(x,y,11,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText(sy<90?'↑':sy>h-140?'↓':sx<40?'←':'→',x,y+3);ctx.fillStyle='rgba(5,14,17,.9)';ctx.fillRect(x-70,y+15,140,18);ctx.fillStyle='#ffb0ba';ctx.font='800 8px sans-serif';ctx.fillText(`${e.name} ${Math.round(distance(p,e))}px`,x,y+27);if(++n>=3)break;}
 // Organic-world height indicator.
 const top=125,bottom=h-150,mx=w-13;ctx.fillStyle='rgba(10,32,35,.42)';ctx.fillRect(mx,top,5,bottom-top);ctx.fillStyle='#7ce0d9';const my=top+cy(p)/C.WORLD_H*(bottom-top);ctx.fillRect(mx-3,my-4,11,8);ctx.textAlign='left';
};

/* --------------------------------------------------------------------------
 * MENUS / MAP / CLASS CHANGE
 * -------------------------------------------------------------------------- */
Game.prototype.renderElementBar=function(){$('#elementBar').innerHTML=C.ELEMENTS.map((e,i)=>`<div class="element" data-id="${e.id}" style="--c:${e.color}" title="${e.desc}"><kbd>${i===9?0:i+1}</kbd><b>${e.glyph}</b><span>${e.name}</span></div>`).join('');};
Game.prototype.renderSkillBar=function(){const cl=C.CLASSES[this.player.classId];$('#skillBar').innerHTML=[['C',cl.skills[0][0]],['V',cl.skills[1][0]],['B',cl.skills[2][0]],['Q',cl.q[0]]].map(([k,n])=>`<div class="skill"><kbd>${k}</kbd><b>${n}</b><small>READY</small></div>`).join('');};
Game.prototype.renderComboGrid=function(){const groups=[
 ['Z','迅斬起手'],['ZZ','返刃'],['ZZZ','裂步斬'],['ZZZZ','終結斬'],['ZX','換側斬'],['ZZX','挑空'],['ZZZX','高挑空'],['ZXX','交錯破'],['ZXZ','回身收割'],
 ['X','重斷'],['XX','震地'],['XXX','崩界終結'],['XZ','鉤回'],['XZZ','回拉連斬'],['XZX','破陣穿身'],['XXZ','震波追擊'],
 ['↑Z / ↑X','上段與天穹破'],['↓Z / ↓X','低身滑斬與裂地踏'],['←Z / ←X','後撤與反擊'],['→Z / →X','逐影刺與衝鋒'],
 ['Dash Z / X','穿斬／破城撞'],['Air Z / ZZ','空中追斬'],['Air X','隕落斬'],['Air ↑Z','旋羽上升'],['Air ↓X','星落震波']
 ];$('#comboGrid').innerHTML=groups.map(([cmd,name])=>`<article class="combo-card"><b>${cmd}</b><span>${name}</span><small>${this.comboClassHint(cmd)}</small></article>`).join('');};
Game.prototype.comboClassHint=function(cmd){const id=this.player.classId;if(id==='rift')return'裂隙劍士：增加貼身位移與取消速度。';if(id==='summoner')return cmd.includes('X')?'召喚師：X 會命令現有契靈追加攻擊。':'召喚師：短杖維持安全距離。';if(id==='beast')return`德魯伊 ${this.player.form}：形態會改變速度、空戰或 BREAK。`;if(id==='artificer')return cmd.includes('X')?'機巧師：X 變成慢速齒輪彈。':'機巧師：Z 為扳手近戰。';if(id==='gunner')return cmd.includes('X')?'槍手：X 射擊並產生後座位移。':'槍手：Z 為近身槍托。';if(id==='warden')return cmd.includes('X')?'守衛：X 提高 BREAK 並帶格擋。':'守衛：Z 為長槍連刺。';if(id==='chrono')return'時序術士：命中位置稍後產生回響。';return cmd.includes('X')?'游擊者：X 鎖鏈拉怪／拉自己。':'游擊者：Z 高速踢擊。';};

Game.prototype.changeClass=function(id){const p=this.player,cl=C.CLASSES[id];if(!cl)return;const pct=p.hp/p.maxHp;p.classId=id;this.progress.classId=id;p.maxHp=cl.hp+this.progress.hpBonus;p.hp=Math.max(1,p.maxHp*pct);p.skillCD=[0,0,0,0,0];p.qCD=0;p.w=40;p.h=60;p.form='wolf';if(id==='beast')this.applyBeastForm();this.summons=[];this.turrets=[];this.renderSkillBar();this.renderComboGrid();this.saveProgress();this.say(`切換職業｜${cl.name}：${cl.desc}`,2.5,cl.accent);};

Game.prototype.bindUI=function(){const select=$('#classSelect');select.innerHTML=Object.entries(C.CLASSES).map(([id,c])=>`<option value="${id}">${c.icon} ${c.name}</option>`).join('');select.value=this.player.classId;select.onchange=e=>this.changeClass(e.target.value);this.renderElementBar();this.renderSkillBar();this.renderComboGrid();this.renderCodex();
 $('#helpButton').onclick=()=>$('#helpPanel').hidden=false;$('#comboButton').onclick=()=>{this.renderComboGrid();$('#comboPanel').hidden=false;};$('#mapButton').onclick=()=>{this.renderMap();$('#mapPanel').hidden=false;};$('#codexButton').onclick=()=>$('#codexPanel').hidden=false;$('#keyButton').onclick=()=>{this.renderKeyConfig();$('#keyPanel').hidden=false;};
 $$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).hidden=true);$('#resetKeys').onclick=()=>{this.keys={...C.DEFAULT_KEYS};this.saveKeys();this.renderKeyConfig();};
 $('#createRoom').onclick=()=>{try{this.network.host();}catch(e){this.say(e.message,2,'#ff8796');}};$('#joinRoom').onclick=()=>{try{this.network.join($('#roomCode').value.trim());}catch(e){this.say(e.message,2,'#ff8796');}};$('#disconnectRoom').onclick=()=>this.network.close();
};
Game.prototype.renderKeyConfig=function(){const box=$('#keyList');box.innerHTML='';for(const[action,label]of Object.entries(C.ACTION_LABELS)){const b=document.createElement('button');b.className='key-row';b.innerHTML=`<span>${label}</span><kbd>${friendly(this.keys[action])}</kbd>`;b.onclick=()=>{b.querySelector('kbd').textContent='按新鍵…';this.input.capture=code=>{const other=Object.keys(this.keys).find(k=>k!==action&&this.keys[k]===code),old=this.keys[action];this.keys[action]=code;if(other)this.keys[other]=old;this.saveKeys();this.renderKeyConfig();};};box.appendChild(b);}};

Game.prototype.renderMap=function(){const c=$('#worldMapCanvas'),ctx=c.getContext('2d'),pad=34,sx=(c.width-pad*2)/C.WORLD_W,sy=(c.height-pad*2)/C.WORLD_H,pt=(x,y)=>({x:pad+x*sx,y:pad+y*sy});ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#061217';ctx.fillRect(0,0,c.width,c.height);const roomMap=this.roomById;
 for(const e of W.edges){const a=roomMap.get(e.a),b=roomMap.get(e.b),seen=this.progress.discovered[a.id]||this.progress.discovered[b.id],pa=pt(cx(a),cy(a)),pb=pt(cx(b),cy(b));ctx.strokeStyle=seen?(e.gate&&!this.gateOpen(this.gates.find(g=>g.a===e.a&&g.b===e.b||g.a===e.b&&g.b===e.a))?'#c47ac9':'#4f7c82'):'#15292e';ctx.lineWidth=e.kind==='corridor'?4:2;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();}
 for(const r of this.rooms){const seen=!!this.progress.discovered[r.id],p=pt(r.x,r.y),w=Math.max(6,r.w*sx),h=Math.max(5,r.h*sy),reg=this.regionData(r.region);ctx.fillStyle=seen?reg.color:'#12262b';ctx.strokeStyle=r.id===this.currentRoomId?'#fff2a5':r.shelter&&seen?'#f1dc91':'#29434a';ctx.lineWidth=r.id===this.currentRoomId?3:1;ctx.beginPath();ctx.roundRect(p.x,p.y,w,h,3);ctx.fill();ctx.stroke();if(r.shelter&&seen){ctx.fillStyle='#f4d77d';ctx.fillRect(p.x+2,p.y+2,5,5);}}
 const pp=pt(cx(this.player),cy(this.player));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(pp.x,pp.y,5,0,TAU);ctx.fill();ctx.strokeStyle='#6ee5df';ctx.lineWidth=2;ctx.stroke();$('#mapStats').textContent=`探索 ${Object.keys(this.progress.discovered).filter(k=>this.progress.discovered[k]).length}/${this.rooms.length} 房 · 神殿 ${this.collectibles.filter(q=>q.taken).length}/${this.collectibles.length}`;
 const list=$('#shelterList');list.innerHTML=W.shelters.map(id=>{const r=roomMap.get(id),open=!!this.progress.shelters[id];return`<button data-room="${id}" ${open?'':'disabled'}><b>${r.name}</b><small>${open?'快速移動可用':'尚未啟用'}</small></button>`;}).join('');for(const b of $$('#shelterList button[data-room]'))b.onclick=()=>{const r=roomMap.get(b.dataset.room),safe=this.findSafePosition(r.x+120,r.floorY-80,this.player.w,this.player.h);this.player.x=safe.x;this.player.y=safe.y;this.player.checkpoint={...safe,room:r.id};this.camera.x=clamp(safe.x-this.viewW*.43,0,C.WORLD_W-this.viewW);this.camera.y=clamp(safe.y-this.viewH*.62,0,C.WORLD_H-this.viewH);$('#mapPanel').hidden=true;};
};

Game.prototype.renderCodex=function(){const box=$('#codexGrid');box.innerHTML=Object.entries(C.ENEMIES).filter(([id])=>id!=='dummy').map(([id,e])=>{const src=this.assets[`enemy_${id}`]?.src||`assets/sprites/enemy_${id}.png`;return`<article><img src="${src}" alt="${e.name}" onerror="this.style.visibility='hidden'"><div><h3>${e.name}</h3><p>${e.tip}</p></div></article>`;}).join('');};

/* --------------------------------------------------------------------------
 * BOOT / DEBUG
 * -------------------------------------------------------------------------- */
window.ES9_ENGINE={Game,ATT,PLAYER_ROWS,ENEMY_ROWS};
addEventListener('DOMContentLoaded',()=>{const game=new Game();window.ElementalSwap={game,debug:{
 teleport:(x,y)=>{const safe=game.findSafePosition(Number(x)||C.START_X,Number(y)||C.START_Y,game.player.w,game.player.h);game.player.x=safe.x;game.player.y=safe.y;game.camera.x=clamp(safe.x-game.viewW*.43,0,C.WORLD_W-game.viewW);game.camera.y=clamp(safe.y-game.viewH*.62,0,C.WORLD_H-game.viewH);},
 room:id=>{const r=game.roomById.get(id);if(r){const safe=game.findSafePosition(r.x+100,r.floorY-80,game.player.w,game.player.h);game.player.x=safe.x;game.player.y=safe.y;}},
 boss:()=>{const r=game.roomById.get('r48'),boss=game.ensureBoss();const safe=game.findSafePosition(r.x+220,r.floorY-90,game.player.w,game.player.h);game.player.x=safe.x;game.player.y=safe.y;game.currentRoomId='r48';game.currentRegion='lighthouse';if(boss){boss.bossAwake=true;boss.state='phase';boss.stateT=.7;boss.aiT=.9;}},
 heal:()=>{game.player.hp=game.player.maxHp;game.player.shield=35;},class:id=>game.changeClass(id),element:id=>{const i=C.ELEMENTS.findIndex(e=>e.id===id);if(i>=0)game.elementPress(i);},solve:id=>game.solvePuzzleById(id),state:()=>game
 }};});
})();
