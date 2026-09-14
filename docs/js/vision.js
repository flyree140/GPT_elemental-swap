/*
 * V16 — 因果工房 / 四組「真的改規則」的視界
 * ============================================================================
 * 相容層：保留 game.js、mastery.js、sanctuary.js 的原始檔案。
 * 閱讀順序：狀態 → 房間 → 切換安全 → 錄影/回放 → 預知/凝結 → 材料/切片
 * → 命中交會 → 教學 → HUD/繪圖。所有計時用 game.time，開選單/暫停就不前進。
 * 重要：相位不是無敵；只有不同 layer 的命中被隔離。DOT 仍留在玩家身上。
 */
(()=>{'use strict';
const C=window.ES9,D=window.ES16,W=window.ES9_WORLD,P=window.ES9_ENGINE.Game.prototype;
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2,sg=v=>v<0?-1:1;
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const dist=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b));
const near=(g,x,y,m=220)=>x>g.camera.x-m&&x<g.camera.x+g.viewW+m&&y>g.camera.y-m&&y<g.camera.y+g.viewH+m;
const layer=m=>m==='sliceA'?'A':m==='sliceC'?'C':'B';
const safeCopy=v=>JSON.parse(JSON.stringify(v));
const hue={A:'#7cdbe5',B:'#ffd17e',C:'#d1a1ff',ALL:'#ff6d82'};
function normal(v){const n={slots:['echo','forecast'],branches:{causal:'A',thermal:'A',scale:'A',slice:'A'},completed:{},discover:{},lowFlash:true};if(v&&typeof v==='object'){
 if(Array.isArray(v.slots)&&v.slots.length===2&&v.slots.every(k=>D.modes[k]&&k!=='now')&&v.slots[0]!==v.slots[1])n.slots=[...v.slots];
 for(const k of Object.keys(n.branches))if(v.branches?.[k]==='B')n.branches[k]='B';
 for(const k of ['completed','discover'])if(v[k]&&typeof v[k]==='object'&&!Array.isArray(v[k]))n[k]={...v[k]};
 n.lowFlash=v.lowFlash!==false;
}return n;}
P.vStore=function(){return this.progress.vision16||(this.progress.vision16=normal());};
P.vInit=function(){if(this.vision16)return this.vision16;this.progress.vision16=normal(this.progress.vision16);return this.vision16={mode:'now',cd:{},path:[],actions:[],sampleAt:0,echo:null,rails:[],echoShots:[],materials:[],plans:[],traces:[],metrics:{},log:[],fx:[],lesson:null,returnTo:null,returnSlots:null,lastPos:null,discontinuity:true,zoom:1,baseSize:null,planAt:0,convergenceUntil:0,convergenceGate:0,damageSerial:0,choice:0};};
P.vLayer=function(){return layer(this._vCheckingMode||this.vision16?.mode||'now');};
P.vEmit=function(type,data={}){const v=this.vInit();v.metrics[type]=(v.metrics[type]||0)+1;v.log.push({type,time:this.time,...data});if(v.log.length>200)v.log.shift();};
P.vBurst=function(x,y,color,r=90){this.vInit().fx.push({x,y,color,r,t:.42,max:.42});};
P.vCanHit=function(e,source=this._vAttackLayer||this.vLayer(),element=null){return e.v16Layer==='ALL'||(e.v16Layer||'B')===source||e.v16LinkUntil>this.time||element==='light';};
P.vTargetScope=function(fn,source=this._vAttackLayer||this.vLayer(),element=null){const all=this.enemies;this.enemies=all.filter(e=>this.vCanHit(e,source,element));try{return fn();}finally{const extra=this.enemies.filter(e=>!all.includes(e));this.enemies=all.concat(extra);}};

// ── 房間：只新增 V16 區。原 78 房、舊 Boss 與 120 技能資料不動。 ───────────
const geometry=P.buildRoomGeometry;
P.buildRoomGeometry=function(r){if(!r.v16)return geometry.call(this,r);const floor=r.y+r.h-42;r.floorY=floor;
 this.addPlatform(r.x+30,floor,r.w-60,30,'roomFloor',{oneWay:true,room:r.id});
 for(let n=1;n<=Math.floor((r.h-130)/230);n++){
  const y=floor-n*230,w=n%2?325:430,x=r.x+(n%2?95:r.w-520);
  this.addPlatform(x,y,w,20,'catwalk',{room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.5+(n%2?90:-70),y:y-80,r:20,room:r.id});
 }
 this.ladders.push({id:this.id(),x:r.x+70,y:r.y+90,w:30,h:r.h-130,room:r.id});
};
const build=P.buildWorld;
P.buildWorld=function(){this.vInit();build.call(this);const v=this.vision16;v.materials=[];
 // 用既有敵人造型建立行為不同的觀測守衛；原敵人不刪除。
 this.enemies=this.enemies.filter(e=>!String(e.room).startsWith('v16_'));
 const add=(room,kind,x,y,w,h,extra={})=>{const r=this.roomById.get('v16_'+room);v.materials.push({id:'mat16_'+this.id(),room:r.id,kind,x:r.x+x,y:r.floorY+y,w,h,...extra});};
 add('echo','console',1680,-62,50,62,{label:'回聲課程端點'});
 add('forecast','console',1810,-62,50,62,{label:'預測課程端點'});
 add('thermal','steel',1040,-360,74,360,{label:'蜂巢軟化門'});
 add('thermal','elastic',1870,-270,56,270,{label:'熱化回彈樑'});
 add('thermal','lava',480,-17,340,36,{label:'可冷凝熔岩'});
 add('thermal','waterfall',1460,-445,85,365,{label:'冷凝水柱'});
 add('thermal','crusher',840,-330,96,95,{baseOff:-330,phase:0,label:'可冷停閘門'});
 add('thermal','console',2080,-62,50,62,{label:'熱力課程端點'});
 add('scale','heavy',510,-92,112,92,{vx:0,startX:this.roomById.get('v16_scale').x+510,label:'宏觀重型配重'});
 add('scale','socket',760,-12,170,12,{label:'配重插槽'});
 add('scale','lattice',1190,-340,78,340,{label:'底部晶格縫'});
 add('scale','poison',1470,-14,610,30,{label:'分子池'});
 for(let n=0;n<5;n++)add('scale','molecule',1480+n*120,-85-(n%3)*55,85,14,{label:'分子踏點'});
 add('scale','console',2200,-62,50,62,{label:'晶格課程端點'});
 add('slice','wall',980,-440,90,440,{v16Layer:'B',label:'B 層實牆'});
 add('slice','slicePlatform',1040,-245,260,18,{v16Layer:'A',label:'A 內構踏台'});
 add('slice','slicePlatform',1320,-420,250,18,{v16Layer:'A',label:'A 管線空腔'});
 add('slice','slicePlatform',1660,-570,320,18,{v16Layer:'C',label:'C 殘響踏台'});
 add('slice','console',2400,-62,50,62,{label:'三層課程端點'});
 add('hub','console',550,-64,58,64,{label:'J 開啟視界工坊'});
 const home=this.roomById.get('r00');this.furniture.push({id:this.id(),kind:'visionBench',room:'r00',x:home.x+330,y:home.floorY-65,w:58,h:65});
 C.FURNITURE.visionBench={name:'因果預言鏡台',effect:'J 視界配裝、五間規則教學與帕拉克斯 Boss。'};
 this.vBuildEnemies();if(this.vStore().discover.scaleBridge)this.vScaleBridge();
};
P.vBuildEnemies=function(){
 for(const l of D.lessons){const r=this.roomById.get(l.room);if(l.id==='boss'){
  const e=this.spawnEnemy('sentinel',r.x+r.w*.70,r.floorY,{room:r.id,hp:1850});Object.assign(e,{v16Boss:true,v16Guard:true,v16Layer:'B',name:'因果織機・帕拉克斯',break:360,breakMax:360,phase:1,v16Next:this.time+2,bossAwake:true});continue;
 }
 const e=this.spawnEnemy(l.id==='echo'?'dummy':l.id==='scale'?'reflector':'archer',r.x+(l.id==='echo'?760:l.id==='thermal'?760:l.id==='slice'?1680:1040),r.floorY,{room:r.id,hp:900});
 Object.assign(e,{v16Guard:true,v16Lesson:l.id,v16Layer:'B',v16Next:1.2,practiceM:true,hidden:false,name:l.id==='echo'?'回放受測傀儡':l.id==='slice'?'B 層接點守衛':'因果觀測守衛'});
 }
};

// ── 碰撞/落點：先預檢兩端，再一次提交；合法空中位置不吸回樓板。 ────────
const platforms=P.activePlatforms;
P.vMaterialSolids=function(b=this.player,mode=this._vCheckingMode||b?.v16Mode||this.vision16?.mode||'now'){
 const v=this.vision16;if(!v)return[];const lay=b?.v16Layer||layer(mode),res=[];
 for(const m of v.materials){
  const base={...m,type:'visionMaterial',oneWay:false,active:true};
  if(m.kind==='steel'&&mode!=='heat')res.push(base);
  if(m.kind==='elastic')res.push(base);
  if(m.kind==='heavy')res.push(base);
  if(m.kind==='lattice')res.push(mode==='micro'?{...base,h:m.h-46}:base);
  if(m.kind==='wall'&&m.v16Layer===lay)res.push(base);
  if(m.kind==='slicePlatform'&&m.v16Layer===lay)res.push({...base,oneWay:true});
  if(m.kind==='molecule'&&mode==='micro')res.push({...base,type:'visionMolecule',oneWay:true});
  if(['waterfall','lava'].includes(m.kind)&&(m.frozenUntil>this.time||this._vPreviewCold&&dist(m,this.player)<750))res.push({...base,type:'visionFrozen',h:m.kind==='lava'?13:m.h,oneWay:m.kind==='lava'});
  if(m.kind==='crusher')res.push(base);
 }
 for(const r of v.rails)if(r.until>this.time&&r.layer===lay)res.push({...r,type:'visionRail',oneWay:true});
 for(const s of this.enemyShots)if((s.v16FrozenUntil>this.time||this._vPreviewCold&&!s.friendly&&dist(s,this.player)<660)&&(s.v16Layer||'B')===lay&&s.t>0&&s.type!=='bombMarker')res.push({id:'frozen_'+s.id,x:cx(s)-35,y:s.y+s.h,w:70,h:12,type:'visionFrozen',oneWay:true,active:true,shot:s});
 return res;
};
P.activePlatforms=function(b=this.player){const lay=b?.v16Layer||this.vLayer();return platforms.call(this,b).filter(s=>!s.v16Layer||s.v16Layer==='ALL'||s.v16Layer===lay).concat(this.vMaterialSolids(b));};
P.vLanding=function(x,y,w,h,mode,search=true){if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return null;const old=this._vCheckingMode;this._vCheckingMode=mode;let solids;try{solids=this.activePlatforms({x,y,w,h,v16Mode:mode,v16Layer:layer(mode)});}finally{this._vCheckingMode=old;}
 const candidates=[[0,0]];if(search)for(const dy of [-12,-34,-68,-108,-140,18])for(const dx of [0,-26,26,-62,62,-104,104])candidates.push([dx,dy]);
 for(const [dx,dy]of candidates){const q={x:clamp(x+dx,4,C.WORLD_W-w-4),y:clamp(y+dy,0,C.WORLD_H-h-4),w,h};if(!solids.some(s=>hit(q,s)))return{x:q.x,y:q.y};}return null;
};
P.vDims=function(mode){const p=this.player,d=p.classId==='beast'?({wolf:[48,45],eagle:[46,40],bear:[58,62],king:[60,64]}[p.form]||[48,45]):[40,60];return mode==='micro'?d.map(v=>Math.round(v*.48)):d;};
P.vSwitch=function(mode){if(!D.modes[mode])return false;const v=this.vInit(),p=this.player;if(mode===v.mode)mode='now';
 if(mode!=='now'&&(v.cd[mode]||0)>this.time){this.say(`${D.modes[mode].name} 冷卻 ${((v.cd[mode]-this.time)).toFixed(1)}s`,.8);return false;}
 const [w,h]=this.vDims(mode);this._vPreviewCold=mode==='cold';let dest;try{dest=this.vLanding(cx(p)-w/2,p.y+p.h-h,w,h,mode);}finally{this._vPreviewCold=false;}
 if(!dest){this.say('切換取消｜目的切片／恢復體型沒有安全空間。先走出狹縫。',2,'#ffc389');this.vEmit('unsafeSwitch');return false;}
 const before=v.mode;v.mode=mode;v.pressureAt=this.time+3.2;Object.assign(p,dest,{w,h});v.cd[mode]=this.time+(D.modes[mode].cd||0);v.transition=.2;v.discontinuity=layer(before)!==layer(mode)||before==='micro'||mode==='micro';
 if(mode==='echo')this.vMakeEcho();
 if(mode==='cold')this.vFreeze();
 if(mode==='heat'){this.vReleaseCold(true);for(const f of this.fields)if(f.type==='icePlatform'&&Math.hypot(cx(f)-cx(p),cy(f)-cy(p))<650){f.t=Math.min(f.t,1);f.v16Melt=true;}for(const m of v.materials)if(m.frozenUntil>this.time)m.frozenUntil=Math.min(m.frozenUntil,this.time+1);}
 this.vEmit('switch',{from:before,mode});if(mode==='forecast')this.vEmit('forecastSeen');
 this.vBurst(cx(p),cy(p),D.modes[mode].color,75);this.say(`${D.modes[mode].name}｜${D.modes[mode].rule}`,2.3,D.modes[mode].color);return true;
};
const baseSwap=P.swapElement;
P.swapElement=function(target,el,index){const v=this.vInit(),p=this.player,source={x:p.x,y:p.y};
 if(target.kind==='enemy'&&target.ref.type==='sentinel'&&target.ref.breakStun<=0){this.say('大型核心尚未失衡｜先削 BREAK，才能真正交換位置。',1.7,'#ffc789');return false;}
 const q=target.ref;if(!q)return false;
 const destination=target.kind==='frozen'?{x:cx(q)-p.w/2,y:q.y-p.h-5}:{x:cx(q)-p.w/2,y:target.kind==='enemy'?q.y+q.h-p.h:cy(q)-p.h/2};
 const safe=this.vLanding(destination.x,destination.y,p.w,p.h,v.mode),back=this.vLanding(cx(p)-q.w/2,cy(p)-q.h/2,q.w,q.h,v.mode);
 if(!safe||!back){this.say('換位取消｜兩端沒有足夠安全空間。',1.5,'#ffad8f');return false;}
 if(target.kind==='frozen'){
  const old={x:p.x,y:p.y,cx:cx(p),cy:cy(p)};Object.assign(p,safe,{vx:0,vy:-40,inv:.38});q.x=back.x;q.y=back.y;q.v16Mark=null;p.airDashes=Math.max(p.airDashes,1);this.elementSwapEffect(el,old,{x:cx(p),y:cy(p)});this.lastSwap=el.id;this.resonanceM={element:el.id,until:this.time+2.4};this.mEmit('swap',{element:el.id,kind:'frozen'});this.checkElementCombo(el.id);this.vEmit('frozenSwap');this.vBurst(cx(p),cy(p),el.color,120);
 }else{
  // Base handles element fields/combo/skill resonance; only override the two landing calls transactionally.
  const fn=this.findSafePosition;let call=0;this.findSafePosition=()=>target.kind==='enemy'?(call++===0?back:safe):safe;
  try{baseSwap.call(this,target,el,index);}finally{this.findSafePosition=fn;}
 }
 v.discontinuity=true;v.lastSwapAt=this.time;this.vEmit('swap',{distance:Math.hypot(p.x-source.x,p.y-source.y)});return true;
};
const targetBase=P.findElementTarget;
P.findElementTarget=function(id){const v=this.vInit(),p=this.player;const e=this.enemies.filter(e=>!e.dead&&e.mark===id&&e.markT>0&&dist(e,p)<1450&&this.vCanHit(e)).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(e)return{kind:'enemy',ref:e};
 const f=this.enemyShots.filter(s=>s.t>0&&s.v16FrozenUntil>this.time&&s.v16Mark===id&&this.vCanHit(s)&&dist(s,p)<1250).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(f)return{kind:'frozen',ref:f};
 const s=this.elementShots.filter(s=>s.t>0&&s.anchor&&s.element===id&&dist(s,p)<1600&&((s.v16Layer||'B')===this.vLayer()||id==='shadow')).sort((a,b)=>dist(a,p)-dist(b,p))[0];return s?{kind:'shot',ref:s}:null;
};

// ── 既視感：錄的是攻擊幾何，不是「上次扣到多少血」。空揮照樣會回放。 ──
P.vRecord=function(a){const v=this.vInit();if(this._vReplay)return;v.actions.push({at:this.time,layer:this._vAttackLayer||this.vLayer(),...a});while(v.actions.length>220)v.actions.shift();};
P.vSample=function(){const v=this.vision16,p=this.player;if(this.time<v.sampleAt)return;v.sampleAt=this.time+.045;
 const anim=this.playerAnim(p),s={at:this.time,x:p.x,y:p.y,w:p.w,h:p.h,dir:p.dir,classId:p.classId,form:p.form,onGround:p.onGround,vx:p.vx,vy:p.vy,layer:this.vLayer(),frame:{...anim},cut:v.discontinuity};
 if(v.lastPos&&(Math.hypot(p.x-v.lastPos.x,p.y-v.lastPos.y)>170||s.layer!==v.lastPos.layer))s.cut=true;
 v.path.push(s);v.lastPos=s;v.discontinuity=false;v.path=v.path.filter(s=>s.at>=this.time-3.05);v.actions=v.actions.filter(a=>a.at>=this.time-3.05);
};
P.vMakeEcho=function(){const v=this.vision16,arr=v.path.filter(s=>s.layer===this.vLayer());if(arr.length<3){this.say('記錄尚短｜先移動與出招約一秒，再切既視感。',2);return;}
 const start=arr[0].at,actions=v.actions.filter(a=>a.at>=start&&a.layer===this.vLayer());
 v.echo={start:this.time,origin:start,duration:Math.min(3,this.time-start),path:arr.map(a=>({...a})),actions:actions.map(a=>({...a})),index:0,pose:arr[0]};v.echoShots=[];v.rails=[];
 const life=this.vStore().branches.causal==='A'?6:4.5;
 let prev=null;for(const s of arr){if(prev&&!s.cut&&Math.hypot(s.x-prev.x,s.y-prev.y)<115&&Math.hypot(s.x-prev.x,s.y-prev.y)>8){
  const q={id:'rail_'+this.id(),x:cx(s)-30,y:s.y+s.h+4,w:60,h:9,until:this.time+life,layer:s.layer};
  const solid=platforms.call(this,q).concat(this.vMaterialSolids(q)).some(t=>!String(t.id).startsWith('rail_')&&hit(q,t));
  if(!solid&&!v.rails.some(t=>Math.abs(t.x-q.x)<32&&Math.abs(t.y-q.y)<18))v.rails.push(q);
 }prev=s;}
 if(actions.length)this.vEmit('echoMade',{actions:actions.length,rails:v.rails.length});
};
P.vReplayHit=function(a){const v=this.vision16,ratio=this.vStore().branches.causal==='B'?.50:.42;
 if(a.kind==='projectile'){v.echoShots.push({...a,id:this.id(),left:3,hit:new Set()});return;}
 this._vReplay=true;const prior=this._vAttackLayer;this._vAttackLayer=a.layer;
 try{for(const e of this.enemies){if(e.dead||!this.vCanHit(e,a.layer,a.element))continue;
  if(a.kind==='box'?!hit(a,e):Math.hypot(cx(e)-a.x,cy(e)-a.y)>a.r)continue;
  this.damageEnemy(e,Math.max(1,a.damage*ratio),a.dir*(a.kx||60)*.5,(a.ky||0)*.55,{v16Source:'echo',v16Layer:a.layer,isEcho:true,kd:3,br:12,master:{power:1,element:a.element||null,rank:0},big:false});
 }}finally{this._vAttackLayer=prior;this._vReplay=false;}
 this.vBurst(a.kind==='box'?cx(a):a.x,a.kind==='box'?cy(a):a.y,'#ffd17e',a.kind==='box'?Math.min(100,a.w):Math.min(140,a.r));
};
const attacks=P.updateAttacks;
P.updateAttacks=function(dt){const a=this.player.attack,before=a?.hit,box=a?this.attackBox(this.player,a.def):null;const n=this.skillShots.length;
 this.vTargetScope(()=>attacks.call(this,dt));
 if(a&&!before&&a.hit){if(a.def.gunShot||a.def.mechanicalShot){for(const b of this.skillShots.slice(n))this.vRecord({kind:'projectile',x:b.x,y:b.y,w:b.w,h:b.h,vx:b.vx,vy:b.vy,gravity:0,damage:b.damage,dir:this.player.dir,element:b.mElement});}
 else this.vRecord({kind:'box',...box,damage:a.def.dmg,dir:this.player.dir,kx:a.def.kx,ky:a.def.ky,element:this.mState().command[this.player.classId]});}
};
const area=P.mArea;
P.mArea=function(x,y,r,dmg,ctx,opts={}){const lay=ctx.v16Layer||this._vAttackLayer||this.vLayer(),prior=this._vAttackLayer;this._vAttackLayer=lay;this._vRecordingScope=(this._vRecordingScope||0)+1;
 try{this.vRecord({kind:'circle',x,y,r:r*(ctx.reach||1),damage:dmg*(ctx.power||1),dir:this.player.dir,ky:opts.ky,element:ctx.resonance||ctx.element});return this.vTargetScope(()=>area.call(this,x,y,r,dmg,ctx,opts),lay,ctx.resonance||ctx.element);}finally{this._vAttackLayer=prior;this._vRecordingScope--;}
};
const slash=P.mSlash;
P.mSlash=function(s,ctx,offset=0){const p=this.player,r=(s.range||140)*(ctx.reach||1),box={x:p.dir>0?p.x+p.w-10:p.x-r+10,y:p.y-20,w:r,h:120};
 this.vRecord({kind:'box',...box,damage:s.damage*(ctx.power||1),dir:p.dir,ky:s.launch||-70,element:ctx.resonance||ctx.element});this._vRecordingScope=(this._vRecordingScope||0)+1;
 try{return this.vTargetScope(()=>slash.call(this,s,ctx,offset),ctx.v16Layer||this.vLayer(),ctx.resonance||ctx.element);}finally{this._vRecordingScope--;}
};
const context=P.mSkillContext;
P.mSkillContext=function(s){return {...context.call(this,s),v16Layer:this.vLayer()};};
const mshot=P.mShot;
P.mShot=function(...args){const len=this.masterMissiles.length,out=mshot.apply(this,args);for(const b of this.masterMissiles.slice(len)){b.v16Layer=b.ctx?.v16Layer||this.vLayer();this.vRecord({kind:'projectile',x:b.x,y:b.y,w:b.w||20,h:b.h||20,vx:b.vx,vy:b.vy,gravity:b.mode==='grenade'?690:0,damage:b.damage,dir:this.player.dir,element:b.ctx?.resonance||b.ctx?.element});}return out;};
const fire=P.fireElement;
P.fireElement=function(el,i){fire.call(this,el,i);const s=this.elementShots.at(-1);if(!s)return;s.v16Layer=this.vLayer();s.v16Mode=this.vision16.mode;
 this.vRecord({kind:'projectile',x:s.x,y:s.y,w:s.w,h:s.h,vx:s.vx,vy:s.vy,gravity:el.gravity,damage:el.damage,dir:this.player.dir,element:el.id});};

// ── 實際命中事件：交會、預知破綻、光跨層。只改狀態，不偷刷新全部技能。 ─
const emit=P.mEmit;
P.mEmit=function(type,data={}){if(type==='hit'&&this.vision16)this.vision16.damageSerial++;return emit.call(this,type,data);};
const damage=P.damageEnemy;
P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){const v=this.vInit(),ctx=def.master||this.activeContextM,el=ctx?.resonance||ctx?.element||this._vElement,
 lay=def.v16Layer||ctx?.v16Layer||this._vAttackLayer||this.vLayer(),source=def.v16Source||this._vAttackSource||(this._vReplay?'echo':'player');
 if(e.dead||!this.vCanHit(e,lay,el))return;
 const cross=(e.v16Layer||'B')!==lay&&e.v16Layer!=='ALL';
 if(el==='light'&&(cross||e.v16Boss&&e.phase===2))e.v16LinkUntil=this.time+(this.vStore().branches.slice==='A'?5:3);
 // 跨層以光打開接點；BOSS Phase 2 的冷凝外殼也必須先顯形或破勢。
 if(e.v16Boss&&e.phase===2&&e.breakStun<=0&&!(e.v16LinkUntil>this.time)&&el!=='light')dmg*=.32;
 const cold=e.v16FrozenUntil>this.time;
 if(cold){e.v16DebtX=clamp((e.v16DebtX||0)+kx,-620,620);e.v16DebtY=clamp((e.v16DebtY||0)+ky,-620,400);kx=ky=0;}
 if(e.v16Boss&&cross&&this.vStore().branches.slice==='B')def={...def,br:(def.br||20)*1.45};
 const serial=v.damageSerial,prevBoss=this.bossDefeated;
 const previousLayer=this._vAttackLayer;this._vAttackLayer=lay;try{damage.call(this,e,dmg,kx,ky,def);}finally{this._vAttackLayer=previousLayer;}
 if(e.v16Boss)this.bossDefeated=prevBoss;
 if(cold)e.vx=e.vy=0;
 if(v.damageSerial===serial)return;
 if(source==='echo')this.vEmit('echoHit',{enemy:e.id});
 if(cross){this.vEmit('crossHit',{enemy:e.id});this.vBurst(cx(e),cy(e),'#d1a1ff',105);}
 if(e.v16ExposedUntil>this.time&&source!=='echo')this.vEmit('exposedHit');
 const last=e.v16LastHit;if(last&&last.source!==source&&this.time-last.t<.55&&this.time>v.convergenceGate){
  v.convergenceGate=this.time+.8;v.convergenceUntil=this.time+1.2;this.player.airDashes=Math.max(this.player.airDashes,1);e.stun=Math.max(e.stun,.3);this.vEmit('converge');this.say('交會 CONVERGENCE｜不同來源命中，空中 Dash +1',1.4,'#ffe3a0');
 }
 e.v16LastHit={source,t:this.time};
 if(e.v16Boss&&e.dead){this.vEmit('parallaxDown');this.progress.vision16.completed.boss=true;this.mAward('vision16:boss',6,90);this.say('因果織機停止｜帕拉克斯擊破，視界支環恢復。',5,'#ffd17e');}
};
const elementHit=P.applyElementHit;
P.applyElementHit=function(e,el,s){if(!this.vCanHit(e,s.v16Layer||this.vLayer(),el.id))return false;const old=this._vAttackLayer,elem=this._vElement;this._vAttackLayer=s.v16Layer||this.vLayer();this._vElement=el.id;
 try{return elementHit.call(this,e,el,s);}finally{this._vAttackLayer=old;this._vElement=elem;}
};
const status=P.mStatus;
P.mStatus=function(e,id,strength=1){if(!this.vCanHit(e,this._vAttackLayer||this.vLayer(),id))return;return status.call(this,e,id,strength);};

// ── 低熵的時間域：不改全域 dt。玩家輸入、新彈、技能 CD 照常更新。 ──────
P.vFreeze=function(){const v=this.vision16,p=this.player,dur=this.vStore().branches.thermal==='A'?3.6:3;v.coldUntil=this.time+dur;v.coldCenter={x:cx(p),y:cy(p)};this.vCatchFrozen();
 for(const m of v.materials)if(Math.hypot(cx(m)-cx(p),cy(m)-cy(p))<750&&['lava','waterfall','crusher'].includes(m.kind))m.frozenUntil=this.time+dur;
 for(const e of this.enemies)if(!e.dead&&!e.v16Boss&&this.vCanHit(e)&&dist(e,p)<460){e.v16FrozenUntil=this.time+1.5;e.v16Velocity={x:e.vx,y:e.vy};e.vx=e.vy=0;}
};
P.vCatchFrozen=function(){const v=this.vision16;if(!v.coldCenter||v.coldUntil<=this.time)return;
 for(const s of this.enemyShots)if(s.t>0&&!s.friendly&&s.type!=='bombMarker'&&(s.v16Layer||'B')===this.vLayer()&&Math.hypot(cx(s)-v.coldCenter.x,cy(s)-v.coldCenter.y)<660&&!(s.v16FrozenUntil>this.time)){
  s.v16FrozenUntil=v.coldUntil;s.v16Velocity={x:s.vx,y:s.vy};s.v16WasFrozen=true;this.vEmit('freezeShot',{shot:s.id});
 }
};
P.vReleaseCold=function(force=false){const v=this.vision16;for(const s of this.enemyShots)if(s.v16WasFrozen&&(force||s.v16FrozenUntil<=this.time)){s.v16WasFrozen=false;s.v16FrozenUntil=0;/* velocity never overwritten while frozen */s.warmup=Math.max(s.warmup||0,.16);s.v16Mark=null;this.vBurst(cx(s),cy(s),'#9eeaff',55);}
 for(const e of this.enemies)if(e.v16Velocity&&(force||e.v16FrozenUntil<=this.time)){
  const k=this.vStore().branches.thermal==='B'?1.3:1;e.vx=clamp(e.v16Velocity.x+(e.v16DebtX||0)*k,-780,780);e.vy=clamp(e.v16Velocity.y+(e.v16DebtY||0)*k,-800,680);e.v16Velocity=null;e.v16FrozenUntil=0;e.v16DebtX=e.v16DebtY=0;
  if(force){e.armorBreak=Math.max(e.armorBreak,3);this.vBurst(cx(e),cy(e),'#ffc18b',85);this.vEmit('thermalRelease');}
 }if(force)v.coldUntil=0;
};

// ── 先知：已承諾攻擊有精確 plan ID，敵人還沒決定的行為只畫虛線。 ─────
P.vPlan=function(spec){const p={id:'plan_'+this.id(),born:this.time,at:this.time+2,life:5,layer:'B',type:'bolt',damage:8,color:'#ff829b',vx:-180,vy:0,gravity:0,...spec};this.vInit().plans.push(p);return p;};
P.vNodes=function(){if(this.vision16.mode!=='forecast')return[];const out=[];
 for(const p of this.vision16.plans)if(!p.done&&!p.cancelled&&p.type==='bolt'&&p.at-this.time<=2&&p.at>this.time){out.push({id:p.id,x:p.x+p.vx*.46,y:p.y+p.vy*.46+(.5*(p.gravity||0)*.46*.46),ref:p,kind:'plan',eta:p.at-this.time});}
 for(const s of this.enemyShots)if(s.t>0&&!s.friendly&&!s.v16Intercepted&&s.type!=='bombMarker'&&!(s.v16FrozenUntil>this.time)){out.push({id:'shot_'+s.id,x:cx(s)+s.vx*.38,y:cy(s)+s.vy*.38+.5*(s.gravity||0)*.38*.38,ref:s,kind:'shot',eta:(s.warmup||0)+.38});}
 return out.filter(n=>near(this,n.x,n.y,180)).slice(0,30);
};
P.vIntercept=function(n){if(n.kind==='plan'){if(n.ref.done||n.ref.cancelled)return;n.ref.cancelled=true;}else{if(n.ref.t<=0)return;n.ref.t=0;n.ref.v16Intercepted=true;}
 this.vEmit('intercept',{id:n.id});this.vBurst(n.x,n.y,'#ffccd4',125);this.shake=Math.max(this.shake,4);this.say('因果拆除｜這一枚未來攻擊不會抵達。守衛破綻 3 秒。',1.6,'#ffd3da');
 for(const e of this.enemies)if(!e.dead&&Math.hypot(cx(e)-n.x,cy(e)-n.y)<900){e.v16ExposedUntil=this.time+3;e.armorBreak=Math.max(e.armorBreak,3);}
};
P.vTickPlans=function(dt){const v=this.vision16,p=this.player;
 for(const a of v.plans){if(a.cancelled||a.done)continue;if(this.time<a.at)continue;a.done=true;
  if(a.type==='bolt'){this.enemyShots.push({id:this.id(),type:'visionBolt',x:a.x-10,y:a.y-10,w:20,h:20,vx:a.vx,vy:a.vy,gravity:a.gravity||0,warmup:0,t:a.life||5,damage:a.damage,owner:a.owner||'因果觀測守衛',color:a.color,v16Layer:a.layer});}
  else {v.traces.push({...a,t:.30});const box={x:a.x,y:a.y,w:a.w,h:a.h};if(hit(p,box)){
   if(a.layer==='ALL'||a.layer===this.vLayer()){this._vIncoming=a.layer;this.hurtPlayer(a.damage,sg(cx(p)-cx(box))*180,-160,a.owner||'切片射線');this._vIncoming=null;}
   else {this.vEmit('sliceEvade');this.say('跨層避擊｜原射線仍在 B 層發生，C 層未受傷。',1.2,'#d2adff');}
  }}
 }
 v.plans=v.plans.filter(a=>this.time-a.at<1.5);for(const t of v.traces)t.t-=dt;v.traces=v.traces.filter(t=>t.t>0);
};

// 非基準層不是舊關卡的永久無敵開關。在普通戰鬥房停留，該切片會
// 產生有 1.25 秒明確預警的掃描；避難所與規則教學不額外加入壓力。
P.vLayerPressure=function(){const v=this.vision16,r=this.roomById.get(this.currentRoomId),lay=this.vLayer();
 if(lay==='B'||!r||r.shelter||r.v16||this.trainingM||!this.enemies.some(e=>!e.dead&&e.type!=='dummy'&&dist(e,this.player)<700))return;
 if((v.pressureAt||0)>this.time)return;v.pressureAt=this.time+3.8;
 this.vPlan({type:'beam',layer:lay,x:this.player.x-90,y:this.player.y-15,w:220,h:this.player.h+30,at:this.time+1.25,damage:9,owner:lay+' 層觀測掃描',color:hue[lay]});
 this.say(lay+' 層掃描已鎖定｜移動或换回 B，切片並非永久無敵。',1.5,hue[lay]);
};
// ── 所有投射物實際穿過結點才干預，不用「按技能」假裝命中。 ─────────
P.vProjectileSpecial=function(s,dt){if(!s||s.t<=0||s.stuck)return;const p={x:s.x+(s.vx||0)*dt,y:s.y+(s.vy||0)*dt,w:s.w||18,h:s.h||18};
 for(const n of this.vNodes())if(Math.hypot(cx(p)-n.x,cy(p)-n.y)<31+(p.w/2)){this.vIntercept(n);s.t=0;return;}
 const id=s.element||s.ctx?.resonance||s.ctx?.element||s.mElement;
 for(const f of this.enemyShots)if(f.t>0&&f.v16FrozenUntil>this.time&&f.type!=='bombMarker'&&this.vCanHit(f,s.v16Layer||this.vLayer())&&hit(p,{x:cx(f)-35,y:f.y-12,w:70,h:f.h+30})){
  if(!id)return;f.v16Mark=id;s.t=0;this.vBurst(cx(f),cy(f),C.ELEMENTS.find(e=>e.id===id)?.color||'#fff',55);this.say('凝結彈已標記｜再按同元素鍵换位',1.8);return;
 }
 for(const m of this.vision16.materials)if(hit(p,m)){
  if(m.kind==='heavy'&&['wind','earth','gravity'].includes(id)){const macro=this.vision16.mode==='macro';m.vx+=sg(s.vx||this.player.dir)*(macro?(id==='earth'&&this.vStore().branches.scale==='B'?620:420):35);s.t=0;this.vBurst(cx(m),cy(m),macro?'#e4d599':'#789e9e',85);return;}
 }
};
// 投射物保留出生切片：玩家換層不會帶著所有舊子彈一起換層。
// 分組呼叫舊物理迴圈，避免異層敵人吃掉一顆其實打不到自己的子彈。
const elements=P.updateElements;
P.updateElements=function(dt){for(const s of this.elementShots)this.vProjectileSpecial(s,dt);const all=this.enemies,shots=this.elementShots.filter(s=>s.t>0),result=[],prior=this._vAttackLayer;
 try{for(const lay of new Set(shots.map(s=>s.v16Layer||'B'))){this._vAttackLayer=lay;this.elementShots=shots.filter(s=>(s.v16Layer||'B')===lay);
  this.enemies=all.filter(e=>this.vCanHit(e,lay)||this.elementShots.some(s=>s.element==='light'&&hit({x:s.x+s.vx*dt-20,y:s.y+s.vy*dt-20,w:s.w+40,h:s.h+40},e)));
  elements.call(this,dt);result.push(...this.elementShots);
 }}finally{this.enemies=all;this.elementShots=result;this._vAttackLayer=prior;}
};
const skillShots=P.updateSkillShots;
P.updateSkillShots=function(dt){for(const s of this.skillShots)this.vProjectileSpecial(s,dt);const all=this.enemies,shots=this.skillShots.filter(s=>s.t>0),out=[],turrets=this.turrets,summons=this.summons,prior=this._vAttackLayer,current=this.vLayer();
 for(const s of shots)s.v16Layer=s.v16Layer||current;
 for(const t of turrets)t.v16Layer=t.v16Layer||current;for(const s of summons)if(s.masterCtx)s.masterCtx.v16Layer=current;let keepTurrets=[],keepSummons=summons;
 try{for(const lay of new Set([current,...shots.map(s=>s.v16Layer),...turrets.map(t=>t.v16Layer)])){
  this._vAttackLayer=lay;this.skillShots=shots.filter(s=>s.v16Layer===lay);this.turrets=turrets.filter(t=>t.v16Layer===lay);this.summons=lay===current?summons:[];
  this.enemies=all.filter(e=>this.vCanHit(e,lay));skillShots.call(this,dt);
  for(const s of this.skillShots)s.v16Layer=s.v16Layer||lay;out.push(...this.skillShots);
  keepTurrets.push(...this.turrets);if(lay===current)keepSummons=this.summons;
 }}finally{this.enemies=all;this.skillShots=out;this.turrets=keepTurrets;this.summons=keepSummons;this._vAttackLayer=prior;}
};
const mTick=P.tickMasterCombat;
P.tickMasterCombat=function(dt){for(const s of this.masterMissiles)this.vProjectileSpecial(s,dt);const missiles=this.masterMissiles.filter(s=>s.t>0),fields=this.masterFields,all=this.enemies,enemyShots=this.enemyShots,prior=this._vAttackLayer,out=[],left=[];
 const layOf=b=>b.v16Layer||b.ctx?.v16Layer||'B';
 try{for(const lay of new Set([...missiles.map(layOf),...fields.map(layOf)])){
  this._vAttackLayer=lay;this.masterMissiles=missiles.filter(b=>layOf(b)===lay);this.masterFields=fields.filter(b=>layOf(b)===lay);
  const light=this.masterMissiles.some(b=>b.ctx?.element==='light'||b.ctx?.resonance==='light')||this.masterFields.some(b=>b.ctx?.element==='light'||b.ctx?.resonance==='light');
  this.enemies=all.filter(e=>this.vCanHit(e,lay,light?'light':null));this.enemyShots=enemyShots.filter(s=>(s.v16Layer||'B')===lay||s.v16Layer==='ALL');
  mTick.call(this,dt);out.push(...this.masterMissiles);left.push(...this.masterFields);
 }}finally{this.enemies=all;this.enemyShots=enemyShots;this.masterMissiles=out;this.masterFields=left;this._vAttackLayer=prior;}
};
// 契靈是獨立攻擊來源；支援命中與本體命中才能觸發交會，不靠多按模式刷分。
const summonHit=P.summonStrike;
P.summonStrike=function(...args){const prev=this._vAttackSource;this._vAttackSource='summon';try{return summonHit.apply(this,args);}finally{this._vAttackSource=prev;}};
// 場域／临時平台同樣保留出生切片。切 C 不會把留在 B 的火海帶走。
const swapEffects=P.elementSwapEffect;
P.elementSwapEffect=function(...args){const old=new Set(this.fields),prior=this._vAttackLayer;this._vAttackLayer=this.vLayer();try{return this.vTargetScope(()=>swapEffects.apply(this,args));}finally{for(const f of this.fields)if(!old.has(f))f.v16Layer=this._vAttackLayer;this._vAttackLayer=prior;}};
const pull=P.gravityPull;
P.gravityPull=function(x,y,r,power){this.vTargetScope(()=>pull.call(this,x,y,r,power));for(const m of this.vision16?.materials||[])if(m.kind==='heavy'&&Math.hypot(cx(m)-x,cy(m)-y)<r)m.vx+=sg(x-cx(m))*power*(this.vision16.mode==='macro'?1.8:.09);};

// ── 敵方碰撞與切片 ───────────────────────────────────────────────
const enemyFire=P.fireEnemyShot;
P.fireEnemyShot=function(e,...args){const n=this.enemyShots.length;enemyFire.call(this,e,...args);for(const s of this.enemyShots.slice(n)){s.v16Layer=e.v16Layer||'B';s.v16OwnerId=e.id;}};
const enemiesUpdate=P.updateEnemies;
P.updateEnemies=function(dt){const all=this.enemies,v=this.vInit();
 this.enemies=all.filter(e=>!e.v16Guard&&!(e.v16FrozenUntil>this.time)&&(e.v16Layer==='ALL'||(e.v16Layer||'B')===this.vLayer()));
 try{enemiesUpdate.call(this,dt*(v.mode==='micro'?.35:1));}finally{const extras=this.enemies.filter(e=>!all.includes(e));this.enemies=all.concat(extras);}
 for(const e of all.filter(e=>e.v16Guard))this.vGuardTick(e,dt);
};
P.vGuardTick=function(e,dt){if(e.dead)return;const v=this.vision16,p=this.player;e.hitFlash=Math.max(0,e.hitFlash-dt);e.stun=Math.max(0,e.stun-dt);e.freeze=Math.max(0,e.freeze-dt);e.root=Math.max(0,e.root-dt);e.wet=Math.max(0,e.wet-dt);e.curse=Math.max(0,e.curse-dt);e.armorBreak=Math.max(0,e.armorBreak-dt);e.markT=Math.max(0,e.markT-dt);e.breakStun=Math.max(0,e.breakStun-dt);e.downT=Math.max(0,e.downT-dt);if(!e.markT)e.mark=null;
 if(e.v16FrozenUntil>this.time)return;
 if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.55;this.damageEnemy(e,3,0,0,{v16Layer:e.v16Layer||'B',kd:1,br:2,key:'DOT'});}}
 e.vy=Math.min(980,e.vy+C.PHYSICS.gravity*dt);this.moveBody(e,dt,{enemy:true});e.vx*=Math.exp(-4*dt);
 if(e.y>this.roomById.get(e.room).floorY+100){e.x=e.homeX-e.w/2;e.y=this.roomById.get(e.room).floorY-e.h;e.vx=e.vy=0;}
 const active=this.currentRoomId===e.room; e.aggro=active&&e.v16Lesson!=='echo';if(!active)return;e.dir=cx(p)<cx(e)?-1:1;
 if(e.v16Boss){this.vBossTick(e,dt);return;}
 if(e.v16Lesson==='echo'||e.v16Lesson==='scale'||e.v16Next>this.time||e.stun>0)return;e.v16Next=this.time+3.3;
 const base={x:cx(e),y:cy(e),owner:e.name,ownerId:e.id,layer:'B',damage:6};
 if(e.v16Lesson==='slice'){
  const lay=(e.v16Round=(e.v16Round||0)+1)%3===0?'C':'B';this.vPlan({...base,layer:lay,type:'beam',x:p.x-130,y:cy(p)-24,w:300,h:48,at:this.time+1.5,damage:8,color:hue[lay]});
 }else{
  const heights=e.v16Lesson==='thermal'?[-150,-95,-40,0]:[0];
  for(const d of heights)this.vPlan({...base,y:cy(p)+d,vx:e.dir*175,vy:0,at:this.time+1.75});
 }
};
P.vBossTick=function(e,dt){const p=this.player,v=this.vision16;const phase=e.hp/e.maxHp<.34?3:e.hp/e.maxHp<.67?2:1;
 if(phase!==e.phase){e.phase=phase;this.vBurst(cx(e),cy(e),hue[phase===2?'C':'ALL'],240);this.say(`帕拉克斯 PHASE ${phase}｜${phase===2?'冷凝外殼：光元素連結弱點':'三層攻擊：疊層红框必須位移閃避'}`,3,'#ffb1c6');}
 if(e.breakStun>0){e.state='break';return;}e.state='special';if(e.v16Next>this.time)return;e.v16Next=this.time+(phase===3?2.6:3.4);e.v16Round=(e.v16Round||0)+1;
 const base={x:cx(e),y:cy(e),owner:e.name,ownerId:e.id,damage:16+phase*2,layer:'B',at:this.time+1.65};
 if(e.v16Round%3===0){const lay=phase===3?'ALL':phase===2?'C':'B';this.vPlan({...base,type:'beam',x:p.x-160,y:cy(p)-40,w:350,h:80,layer:lay,color:hue[lay]});}
 else if(e.v16Round%3===1){for(let n=-2;n<=2;n++)this.vPlan({...base,type:'bolt',vx:e.dir*(170+phase*8),vy:n*85,color:n%2?'#ff87a4':'#93e8ff'});}
 else {const lay=phase===3?'ALL':'B';this.vPlan({...base,type:'blast',x:p.x-140,y:p.y-15,w:320,h:115,layer:lay,color:hue[lay]});}
};
P.updateEnemyShots=function(dt){const v=this.vInit();for(const s of this.enemyShots){if(s.t<=0)continue;if(s.v16FrozenUntil>this.time)continue;
 const step=dt*(v.mode==='micro'&&!s.friendly?.35:1);s.t-=step;const lay=s.v16Layer||'B';
 if(s.type==='bombMarker'){s.warmup-=step;if(s.warmup<=0&&!s.exploded){s.exploded=true;s.t=.22;this.fields.push({id:this.id(),type:'enemyBlast',x:s.targetX-70,y:s.targetY-120,w:140,h:140,t:.32,damage:s.damage,color:s.color,hit:false,owner:s.owner,v16Layer:lay});}continue;}
 if(s.warmup>0){s.warmup-=step;continue;}const prevY=s.y;s.vy+=(s.gravity||0)*step;s.x+=s.vx*step;s.y+=s.vy*step;
 if(s.type==='poisonGlob'&&s.vy>=0){const solid=this.activePlatforms({...s,v16Layer:lay}).find(q=>hit(s,q)&&prevY+s.h<=q.y+10);if(solid){this.fields.push({id:this.id(),type:'poisonPool',x:s.x-45,y:solid.y-22,w:110,h:28,t:6,damage:4,color:'#91b95d',hitTick:0,v16Layer:lay});s.t=0;continue;}}
 if(s.friendly){for(const e of this.enemies)if(!e.dead&&this.vCanHit(e,lay)&&hit(s,e)){this.damageEnemy(e,s.damage*1.6,sg(s.vx)*250,-100,{kd:18,br:25,v16Layer:lay,v16Source:'reflection'});s.t=0;break;}}
 else if((lay===this.vLayer()||lay==='ALL')&&hit(s,this.player)){if(s.type==='web')this.player.web=2.2;if(s.type==='poisonGlob')this.player.poison=4;this._vIncoming=lay;this.hurtPlayer(s.damage,sg(s.vx)*180,-120,s.owner);this._vIncoming=null;s.t=0;}
 if(s.y>C.WORLD_H+150||s.x<0||s.x>C.WORLD_W)s.t=0;
 }
 for(const f of this.fields)if(f.type==='enemyBlast'&&!f.hit&&(f.v16Layer==='ALL'||(f.v16Layer||'B')===this.vLayer())&&hit(this.player,f)){f.hit=true;this._vIncoming=f.v16Layer||'B';this.hurtPlayer(f.damage,sg(cx(this.player)-cx(f))*260,-220,f.owner);this._vIncoming=null;}
 this.enemyShots=this.enemyShots.filter(s=>s.t>0);
};
// 玩家風場、噴泉只在所屬切片作用；施放時標記新場域／炮台的出生層。
const playerStep=P.updatePlayer;
P.updatePlayer=function(dt){const all=this.fields,oldFields=new Set(all),oldTurrets=new Set(this.turrets),lay=this.vLayer();
 const off=all.filter(f=>f.v16Layer&&f.v16Layer!==lay&&f.v16Layer!=='ALL');this.fields=all.filter(f=>!off.includes(f));
 try{return playerStep.call(this,dt);}finally{
  for(const f of this.fields)if(!oldFields.has(f))f.v16Layer=f.v16Layer||lay;
  this.fields.push(...off);for(const t of this.turrets)if(!oldTurrets.has(t))t.v16Layer=lay;
 }
};
const fields=P.updateFields;
P.updateFields=function(dt){const source=this.fields,enemies=this.enemies,shots=this.enemyShots,prior=this._vAttackLayer,out=[];const current=this.vLayer();
 for(const f of source)f.v16Layer=f.v16Layer||current;
 try{for(const lay of new Set(source.map(f=>f.v16Layer))){
  const group=source.filter(f=>f.v16Layer===lay),enemyFields=group.filter(f=>['poisonPool','enemyBlast'].includes(f.type));
  this.fields=group.filter(f=>lay===current||lay==='ALL'||!enemyFields.includes(f));
  for(const f of enemyFields)if(!this.fields.includes(f)){f.t-=dt;if(f.t>0)out.push(f);}
  this.enemies=enemies.filter(e=>this.vCanHit(e,lay));this.enemyShots=shots.filter(s=>(s.v16Layer||'B')===lay||s.v16Layer==='ALL');this._vAttackLayer=lay;
  fields.call(this,dt);out.push(...this.fields);
 }}finally{this.fields=out;this.enemies=enemies;this.enemyShots=shots;this._vAttackLayer=prior;}
};
const hurt=P.hurtPlayer;
P.hurtPlayer=function(dmg,kx,ky,source,dot=false){if(this._vIncoming&&this._vIncoming!=='ALL'&&this._vIncoming!==this.vLayer()&&!dot)return;const before=this.player.hp;hurt.call(this,dmg,kx,ky,source,dot);const v=this.vInit();
 if(v.lesson&&v.lesson.id!=='boss'&&this.player.hp<before){this.player.hp=this.player.maxHp;this.player.downT=0;this.say('試煉護持｜看清預警再試；教學不會扣生命。',1.2);} };

// ── 材料物理：有限規則、有限衝量，不允許任意刪地形。 ────────────────
const move=P.moveBody;
P.moveBody=function(b,dt,opts={}){const v=this.vInit(),vx=b.vx;const r=move.call(this,b,dt,opts);
 if(b===this.player){for(const s of this.vMaterialSolids(b))if(b.onGround&&Math.abs(b.y+b.h-s.y)<3&&b.x+b.w>s.x&&b.x<s.x+s.w){if(s.type==='visionRail')this.vEmit('railStand');if(s.type==='visionMolecule')this.vEmit('moleculeStand');}}
 if(v.mode==='heat'&&(b.v16BounceUntil||0)<this.time&&Math.abs(vx)>140){const wall=v.materials.find(m=>m.kind==='elastic'&&b.y+b.h>m.y&&b.y<m.y+m.h&&(Math.abs(b.x+b.w-m.x)<4||Math.abs(b.x-m.x-m.w)<4));if(wall){b.vx=-sg(vx)*clamp(Math.abs(vx)*1.25,400,850);b.vy=-320;b.v16BounceUntil=this.time+.3;if(b===this.player){b.dashT=.1;b.airDashes=Math.max(1,b.airDashes);}this.vBurst(cx(b),cy(b),'#ffb780',110);this.vEmit('rebound');}}
 return r;
};
P.vTickMaterials=function(dt){const v=this.vision16,p=this.player,mode=v.mode;
 for(const m of v.materials){const room=this.roomById.get(m.room);
  if(m.kind==='heavy'){const old=m.x;m.x=clamp(m.x+(m.vx||0)*dt,room.x+130,room.x+1000);m.vx=(m.vx||0)*Math.exp(-1.8*dt);if(m.x===old&&Math.abs(m.vx)>1)m.vx*=.5;if(m.x-m.startX>=90&&!m.reported){m.reported=true;this.vEmit('heavyMoved');}}
  if(m.kind==='crusher'&&!(m.frozenUntil>this.time)){m.clock=(m.clock||0)+dt;m.y=room.floorY+m.baseOff+Math.sin(m.clock*1.2)*115;}
  if(m.kind==='socket'){
   const mass=v.materials.find(q=>q.kind==='heavy'&&q.room===m.room);m.active=!!mass&&hit(m,mass);
   if(m.active&&!this.vStore().discover.scaleBridge){this.vStore().discover.scaleBridge=true;this.vScaleBridge();this.vEmit('weightSocket');this.say('配重插槽接通｜新增高處回程踏台；已永久記錄。',3,'#e7dcab');this.saveProgress();}
  }
  if(m.room!==this.currentRoomId)continue;
  if(['steel','lattice','wall'].includes(m.kind)){
   if(p.x+p.w<m.x)m.seenLeft=true;
   if(m.seenLeft&&p.x>m.x+m.w&&!m.passed){const valid=(m.kind==='steel'&&mode==='heat')||(m.kind==='lattice'&&mode==='micro')||(m.kind==='wall'&&mode==='sliceA');
    if(valid){m.passed=true;this.vEmit(m.kind==='steel'?'heatPass':m.kind==='lattice'?'microPass':'slicePass');this.vBurst(cx(p),cy(p),D.modes[mode].color,100);}
   }
  }
  if((m.kind==='poison'||m.kind==='lava'&&!(m.frozenUntil>this.time))&&hit(p,m)){this._vIncoming='ALL';this.hurtPlayer(4,0,-90,m.kind==='poison'?'分子池腐蝕':'未凝結熔岩');this._vIncoming=null;}
 }
};

P.vScaleBridge=function(){const r=this.roomById.get('v16_scale');if(!r||this.platforms.some(p=>p.v16ScaleBridge))return;
 this.addPlatform(r.x+1540,r.floorY-290,220,18,'catwalk',{oneWay:true,room:r.id,v16ScaleBridge:true});
 this.addPlatform(r.x+1930,r.floorY-220,210,18,'catwalk',{oneWay:true,room:r.id,v16ScaleBridge:true});
};
// ── 教學：行為事件推進，不以點開說明假裝完成。報酬持久去重。 ────────
P.vEnter=function(id){const v=this.vInit(),l=D.lessons.find(l=>l.id===id),r=this.roomById.get(l?.room||'v16_hub');if(!r)return false;
 if(this.trainingM)this.endTraining();
 if(!v.returnTo)v.returnTo={x:this.player.x,y:this.player.y,room:this.currentRoomId,region:this.currentRegion,checkpoint:{...this.player.checkpoint}};
 if(!v.returnSlots)v.returnSlots=[...this.vStore().slots];
 this.vResetTransient();v.lesson=l?{id:l.id,stage:0,completed:false}:null;v.metrics={};if(l)this.vStore().slots=[...l.modes];
 this.sceneMode11=false;document.body.classList.remove('scenic11');this.player.x=r.x+(l?.id==='boss'?900:220);this.player.y=r.floorY-this.player.h-3;this.player.vx=this.player.vy=0;this.player.inv=.9;this.player.hp=this.player.maxHp;this.player.checkpoint={x:this.player.x,y:this.player.y,room:r.id};this.currentRoomId=r.id;this.currentRegion=r.region;this.camera.x=r.x;this.camera.y=r.floorY-this.viewH*.68;
 for(const m of v.materials.filter(m=>m.room===r.id)){m.passed=false;m.seenLeft=false;m.reported=false;m.frozenUntil=0;if(m.kind==='heavy'){m.x=m.startX;m.vx=0;}}
 for(const e of this.enemies.filter(e=>e.room===r.id&&e.v16Guard)){e.dead=false;e.hp=e.maxHp;e.break=e.breakMax;e.breakStun=0;e.vx=e.vy=0;e.x=e.homeX-e.w/2;e.y=r.floorY-e.h;e.v16Next=this.time+1;e.phase=1;e.v16Round=0;e.burn=e.stun=e.freeze=e.root=e.wet=0;}
 this.closeModalsM();this.progress.discovered[r.id]=true;this.say(l?l.desc:'歡迎來到鏡片工房。J 選擇規則試煉；Backspace 返回。',4,'#e8d69e');return true;
};
P.vResetTransient=function(){const v=this.vInit();this.vReleaseCold(true);v.mode='now';const [w,h]=this.vDims('now');this.player.y+=this.player.h-h;this.player.w=w;this.player.h=h;v.path=[];v.actions=[];v.rails=[];v.echo=null;v.echoShots=[];v.plans=[];v.traces=[];v.fx=[];v.cd={};v.coldUntil=0;v.lastPos=null;v.discontinuity=true;
 this.tasksM=[];this.epochM=(this.epochM||0)+1;this.masterMissiles=[];this.masterFields=[];this.enemyShots=[];this.elementShots=[];this.skillShots=[];this.fields=[];this.player.attack=null;this.player.grapple=null;this.player.castT=0;this.player.downT=0;this.player.buffer=null;this.pendingM=null;this.linkM=null;this.diveM=null;
};
P.vLeave=function(){const v=this.vInit(),ret=v.returnTo;if(!ret)return false;this.vResetTransient();Object.assign(this.player,{x:ret.x,y:ret.y,vx:0,vy:0,inv:.8,checkpoint:ret.checkpoint});this.currentRoomId=ret.room;this.currentRegion=ret.region;if(v.returnSlots)this.vStore().slots=[...v.returnSlots];v.lesson=null;v.returnTo=v.returnSlots=null;this.closeModalsM();this.say('已返回原世界｜原職業、技能配裝與避難所進度保留。',2);return true;};
P.vLessonTick=function(){const v=this.vision16,l=D.lessons.find(q=>q.id===v.lesson?.id);if(!l||v.lesson.completed)return;
 while(v.lesson.stage<l.steps.length&&(v.metrics[l.steps[v.lesson.stage][0]]||0)>0)v.lesson.stage++;
 if(v.lesson.stage===l.steps.length){v.lesson.completed=true;this.vStore().completed[l.id]=true;this.mAward('vision16:trial:'+l.id,l.id==='boss'?0:3,15);this.saveProgress();this.say(`${l.title} 完成｜${l.id==='boss'?'首次 Boss +6 專精點':'首次 +3 專精點'}，J 下一間或 Backspace 返回`,4,'#b4edc3');}
};
const respawn=P.respawn;
P.respawn=function(reason){if(this.vision16){const v=this.vision16;this.vResetTransient();}return respawn.call(this,reason);};
const update=P.update;
P.update=function(dt,ts){const v=this.vInit();this.vReleaseCold();this.vCatchFrozen();
 const [w,h]=this.vDims(v.mode);if(this.player.w!==w||this.player.h!==h){this.player.x=cx(this.player)-w/2;this.player.y+=this.player.h-h;this.player.w=w;this.player.h=h;}
 update.call(this,dt,ts);if(this.modalM()||this.paused)return;
 this.vLayerPressure();this.vTickPlans(dt);this.vTickMaterials(dt);this.vSample();
 if(v.echo){const e=v.echo,t=this.time-e.start,at=e.origin+t;const candidates=e.path.filter(s=>s.at<=at);e.pose=candidates.at(-1)||e.path[0];while(e.index<e.actions.length&&e.actions[e.index].at<=at)this.vReplayHit(e.actions[e.index++]);if(t>e.duration+.15)v.echo=null;}
 const ratio=this.vStore().branches.causal==='B'?.50:.42;
 for(const s of v.echoShots){s.left-=dt;s.vy+=(s.gravity||0)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;for(const e of this.enemies)if(!e.dead&&!s.hit.has(e.id)&&this.vCanHit(e,s.layer,s.element)&&hit(s,e)){s.hit.add(e.id);this._vReplay=true;try{this.damageEnemy(e,s.damage*ratio,sg(s.vx)*70,-65,{v16Source:'echo',v16Layer:s.layer,isEcho:true,master:{power:1,element:s.element||null},kd:3,br:8});}finally{this._vReplay=false;}s.left=0;break;}}
 v.echoShots=v.echoShots.filter(s=>s.left>0);v.rails=v.rails.filter(s=>s.until>this.time);for(const f of v.fx)f.t-=dt;v.fx=v.fx.filter(f=>f.t>0);v.transition=Math.max(0,(v.transition||0)-dt);this.vLessonTick();this.vHUD();
};

// ── 新鍵不覆蓋方向鍵、Z/X、C/V/B、Q、數字元素。hit-stop 內也保留切換。 ──
const globalInput=P.updateGlobalInput;
P.updateGlobalInput=function(){if(this.key('visionBook',true)){this.vOpen();return;}if(this.key('visionLeft',true))this.vSwitch(this.vStore().slots[0]);if(this.key('visionRight',true))this.vSwitch(this.vStore().slots[1]);if(this.key('visionNow',true)&&this.vision16.mode!=='now')this.vSwitch('now');if(this.key('exitSchool',true)&&this.vision16.returnTo){this.vLeave();return;}return globalInput.call(this);};
const loop=P.loop;
P.loop=function(ts){if(this.hitStop>0&&!this.paused&&!this.modalM()){
 for(const [action,mode]of [['visionLeft',this.vStore().slots[0]],['visionRight',this.vStore().slots[1]],['visionNow','now']])if(this.key(action,true)){if(mode!=='now'||this.vision16.mode!=='now')this.vSwitch(mode);this.input.pressed.delete(this.keys[action]);}
 if(this.key('visionBook',true)){this.vOpen();this.input.pressed.delete(this.keys.visionBook);}
 }return loop.call(this,ts);};
const interacting=P.interact;
P.interact=function(){if(this.nearInteract?.kind==='vision16'){if(this.nearInteract.ref?.kind==='console'&&this.vision16.lesson){this.vOpen();}else this.vOpen();return;}return interacting.call(this);};
const nearInteraction=P.updateInteractions;
P.updateInteractions=function(){nearInteraction.call(this);const p=this.player,o=this.vision16?.materials.find(m=>m.kind==='console'&&dist(p,m)<110)||this.furniture.find(f=>f.kind==='visionBench'&&dist(p,f)<110);if(o)this.nearInteract={kind:'vision16',ref:o,label:'因果工房｜E / J 配裝與試煉'};};
const useFurn=P.useFurniture;
P.useFurniture=function(f){if(f.kind==='visionBench')return this.vOpen();return useFurn.call(this,f);};

// ── 視界工坊：两槽、四系分支、五教場與 Boss。全程可用鍵盤。 ───────────
P.vOpen=function(){this.closeModalsM();$('#visionPanel').hidden=false;this.vRenderMenu();const first=$('#visionPanel button[data-mode]');first?.focus();};
P.vEquip=function(mode,slot){const s=this.vStore().slots;if(!D.modes[mode]||mode==='now')return;const other=s.indexOf(mode);if(other>=0&&other!==slot){s[other]=s[slot];}s[slot]=mode;this.saveProgress();this.vRenderMenu();};
P.vRenderMenu=function(){const v=this.vInit(),store=this.vStore();
 $('#visionLoadout').textContent=`[ 左槽：${D.modes[store.slots[0]].name}　　] 右槽：${D.modes[store.slots[1]].name}　　\\ 返回當下　｜　原有 L 技能／T 教場／E 家具不變`;
 $('#visionCards').innerHTML=Object.entries(D.modes).filter(([id])=>id!=='now').map(([id,m])=>`<article class="vision-card" style="--lens:${m.color}"><div><span class="lens-glyph">${m.glyph}</span><h3>${m.name}</h3></div><p>${m.rule}</p><small>${m.trade}</small><footer><button data-mode="${id}" data-slot="0" class="${store.slots[0]===id?'chosen':''}">裝左槽 [</button><button data-mode="${id}" data-slot="1" class="${store.slots[1]===id?'chosen':''}">裝右槽 ]</button></footer></article>`).join('');
 for(const b of $('#visionCards').querySelectorAll('button'))b.onclick=()=>{const id=b.dataset.mode,slot=Number(b.dataset.slot);this.vEquip(id,slot);$('#visionCards').querySelector(`[data-mode="${id}"][data-slot="${slot}"]`)?.focus();};
 $('#visionBranches').innerHTML=Object.entries(D.branches).map(([id,b])=>`<section><b>${({causal:'因果',thermal:'熱力',scale:'尺度',slice:'切片'})[id]}</b>${Object.entries(b).map(([branch,text])=>`<button data-family="${id}" data-branch="${branch}" class="${store.branches[id]===branch?'chosen':''}">${branch} · ${text}</button>`).join('')}</section>`).join('');
 for(const b of $('#visionBranches').querySelectorAll('button'))b.onclick=()=>{store.branches[b.dataset.family]=b.dataset.branch;this.saveProgress();this.vRenderMenu();};
 $('#visionTrials').innerHTML=D.lessons.map(l=>`<button class="vision-trial" data-lesson="${l.id}"><small>${store.completed[l.id]?'已通過 · 可重練':'首次完成取得專精點'}</small><strong>${l.title}</strong><span>${l.desc}</span><em>${l.steps.length} 個實際操作條件 · 原職業配裝保留</em></button>`).join('');
 for(const b of $('#visionTrials').querySelectorAll('button'))b.onclick=()=>this.vEnter(b.dataset.lesson);
 $('#visionReturn').disabled=!v.returnTo;
};
const bind=P.bindUI;
P.bindUI=function(){bind.call(this);$('#visionButton').onclick=()=>this.vOpen();$('#visionClose').onclick=()=>this.closeModalsM();$('#visionReturn').onclick=()=>this.vLeave();$('#visionBaseline').onclick=()=>{this.closeModalsM();if(this.vision16.mode!=='now')this.vSwitch('now');};
 addEventListener('keydown',e=>{if($('#visionPanel').hidden)return;if(e.code==='Tab')return;e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'||e.code===this.keys.visionBook){this.closeModalsM();return;}
  const buttons=Array.from($('#visionPanel').querySelectorAll('button:not(:disabled)'));let i=buttons.indexOf(document.activeElement);
  if(e.code==='Enter'){if(i<0)i=0;buttons[i]?.click();return;}
  if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.code)){i=(i+(['ArrowLeft','ArrowUp'].includes(e.code)?-1:1)+buttons.length)%buttons.length;buttons[i]?.focus();buttons[i]?.scrollIntoView({block:'nearest'});}
 },{capture:true});
};
P.vHUD=function(){const v=this.vInit(),m=D.modes[v.mode],s=this.vStore().slots;
 $('#visionLive').style.setProperty('--lens',m.color);$('#visionName').textContent=m.glyph+' '+m.name;$('#visionRule').textContent=m.rule;
 $('#visionSlots').textContent=s.map((id,i)=>`${i===0?'[':']'} ${D.modes[id].name}${(v.cd[id]||0)>this.time?' '+(v.cd[id]-this.time).toFixed(1)+'s':''}`).join('　');
 let info=v.mode==='echo'?`記錄 ${Math.min(3,(v.path.at(-1)?.at||this.time)-(v.path[0]?.at||this.time)).toFixed(1)} 秒 · ${v.actions.length} 攻擊事件 · ${v.rails.length} 踏點`:v.mode==='forecast'?`預測 2 秒 · ${this.vNodes().length} 個可干預結點 · 實線＝已鎖定 / 虛線＝可能`:v.mode==='cold'?`冷停剩餘 ${Math.max(0,(v.coldUntil||0)-this.time).toFixed(1)}s · ${this.enemyShots.filter(s=>s.v16FrozenUntil>this.time).length} 枚凝結敵彈`:v.mode==='micro'?'碰撞體 ×0.48 · 敵方運動 ×0.35 · 狹縫內不可強行長大':v.mode==='macro'?'鏡頭 ×0.74 · 重型配重可推移 · 玩家跳躍不變':`目前切片 ${this.vLayer()} · 只有帶標記材料會改變`;
 if(v.convergenceUntil>this.time)info='交會成立 · 空中 Dash 已刷新';$('#visionState').textContent=info;
 const trial=D.lessons.find(q=>q.id===v.lesson?.id);$('#visionLesson').hidden=!trial;
 if(trial){const done=v.lesson.completed;$('#visionLessonTitle').textContent=trial.title;$('#visionLessonSteps').innerHTML=trial.steps.map(([key,text],i)=>`<li class="${(v.metrics[key]||0)>0?'done':''}"><b>${(v.metrics[key]||0)>0?'✓':i+1}</b>${text}</li>`).join('');$('#visionLessonFoot').textContent=done?'完成！J 選下一關 / Backspace 返回；獎勵只領一次。':'此課程保護生命（Boss 除外）。J 可重試／選下一關。';}
 if(this.currentRoomId==='v16_boss'){const boss=this.enemies.find(e=>e.v16Boss);$('#bossHUD').classList.toggle('show',!!boss&&!boss.dead);$('#bossHUD b').textContent='因果織機・帕拉克斯';if(boss){$('#bossHpFill').style.width=clamp(boss.hp/boss.maxHp*100,0,100)+'%';$('#bossBreakFill').style.width=clamp(boss.break/boss.breakMax*100,0,100)+'%';$('#bossPhase').textContent='PHASE '+boss.phase;}}
 if(trial){$('#objectiveTitle').textContent=v.lesson.completed?'規則驗證完成':'視界試煉 '+Math.min(trial.steps.length,v.lesson.stage+1)+' / '+trial.steps.length;$('#objectiveText').textContent=trial.steps[Math.min(v.lesson.stage,trial.steps.length-1)][1];}
};

// ── 繪圖：保留原像素資產；濾鏡只降低背景飽和，不把角色/HUD 全部染黑。 ─
const playerAnim=P.playerAnim;
P.playerAnim=function(p){return p.v16Frame||playerAnim.call(this,p);};
const drawPlayer=P.drawPlayer;
P.drawPlayer=function(ctx,p,remote=false){const scale=((p===this.player&&this.vision16?.mode==='micro')||p.v16Small) ? .48 : 1;ctx.save();if(scale!==1){ctx.translate(cx(p),p.y+p.h);ctx.scale(scale,scale);ctx.translate(-cx(p),-p.y-p.h);}drawPlayer.call(this,ctx,p,remote);ctx.restore();};
const drawEnemy=P.drawEnemies;
P.drawEnemies=function(ctx){const all=this.enemies;this.enemies=all.filter(e=>e.v16Layer==='ALL'||(e.v16Layer||'B')===this.vLayer());try{drawEnemy.call(this,ctx);}finally{this.enemies=all;}
 for(const e of all){if(e.dead||!near(this,cx(e),cy(e),200))continue;const other=(e.v16Layer||'B')!==this.vLayer()&&e.v16Layer!=='ALL';ctx.save();
  if(other){const im=this.assets['enemy_'+(e.sprite17||e.type)];ctx.globalAlpha=.32;ctx.setLineDash([5,5]);ctx.strokeStyle=hue[e.v16Layer||'B'];ctx.lineWidth=2;ctx.strokeRect(e.x-3,e.y-3,e.w+6,e.h+6);if(im?.naturalWidth)ctx.drawImage(im,0,0,48,48,e.x-8,e.y-13,e.w+16,e.h+16);ctx.globalAlpha=1;this.vText(ctx,'異層 '+(e.v16Layer||'B')+' · 7 光建立接點',cx(e),e.y-35,hue[e.v16Layer||'B'],12);}
  if(e.v16FrozenUntil>this.time){ctx.fillStyle='#b6f2ff44';ctx.fillRect(e.x-4,e.y-4,e.w+8,e.h+8);ctx.strokeStyle='#b6efff';ctx.lineWidth=2;ctx.strokeRect(e.x-4,e.y-4,e.w+8,e.h+8);this.vText(ctx,'動能封存 '+(e.v16FrozenUntil-this.time).toFixed(1),cx(e),e.y-64,'#b6efff',12);}
  if(e.v16LinkUntil>this.time){ctx.strokeStyle='#fff3ac';ctx.lineWidth=3;ctx.setLineDash([]);ctx.beginPath();ctx.arc(cx(e),cy(e),e.w*.85,0,Math.PI*2);ctx.stroke();}
  if(e.v16Boss){ctx.strokeStyle=e.phase===2?'#d1a1ff':'#a2f0eb';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.ellipse(cx(e),cy(e)-30,e.w*.85,e.h*.80,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();}
};
P.vText=function(ctx,text,x,y,color='#e7faf7',size=13){ctx.save();ctx.font=`700 ${size}px system-ui`;ctx.textAlign='center';const w=ctx.measureText(text).width+16;ctx.fillStyle='#0b1d25e6';ctx.fillRect(x-w/2,y-size-3,w,size+10);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();};
P.vDrawMaterials=function(ctx){const v=this.vision16,mode=v.mode,lay=this.vLayer();
 for(const m of v.materials){if(!near(this,cx(m),cy(m),Math.max(m.w,m.h)+150))continue;ctx.save();const x=m.x,y=m.y,w=m.w,h=m.h;
 if(m.kind==='steel'){ctx.fillStyle=mode==='heat'?'#f69d6838':'#455b62';ctx.fillRect(x,y,w,h);ctx.strokeStyle=mode==='heat'?'#ffb485':'#aebfbd';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);for(let n=0;n<h;n+=30){ctx.beginPath();ctx.moveTo(x+8,y+n);ctx.lineTo(x+w-8,y+n+18);ctx.stroke();}this.vText(ctx,mode==='heat'?'軟化 · 可穿':'熱力材料 · 超熱可穿',cx(m),y-15,'#ffca9e');}
 else if(m.kind==='elastic'){ctx.fillStyle='#9e6e5d';ctx.fillRect(x,y,w,h);ctx.strokeStyle=mode==='heat'?'#ffd993':'#bac1b0';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<h;i+=15){const xx=x+w/2+(mode==='heat'?Math.sin(i*.1+this.time*3)*15:0);i?ctx.lineTo(xx,y+i):ctx.moveTo(xx,y+i);}ctx.stroke();this.vText(ctx,'回彈樑',cx(m),y-14,'#ffcd94');}
 else if(m.kind==='lattice'){ctx.fillStyle=mode==='micro'?'#41695422':'#314c4d';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#a9e79c';ctx.lineWidth=1;for(let iy=y+12;iy<y+h-46;iy+=26)for(let ix=x+12;ix<x+w;ix+=26){ctx.beginPath();ctx.arc(ix,iy,mode==='micro'?6:3,0,Math.PI*2);ctx.stroke();if(mode==='micro'){ctx.moveTo(ix,iy);ctx.lineTo(ix+26,iy+26);ctx.stroke();}}if(mode==='micro'){ctx.strokeStyle='#dbffb4';ctx.setLineDash([4,6]);ctx.strokeRect(x-5,y+h-44,w+10,42);}this.vText(ctx,'微觀晶格縫 →',cx(m),y-14,'#cdf5b2');}
 else if(m.kind==='heavy'){ctx.fillStyle='#636954';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#dcd599';ctx.lineWidth=4;ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.beginPath();ctx.moveTo(x+12,y+12);ctx.lineTo(x+w-12,y+h-12);ctx.moveTo(x+w-12,y+12);ctx.lineTo(x+12,y+h-12);ctx.stroke();this.vText(ctx,mode==='macro'?'負載已縮小 · 4/5/0 搬運':'重型配重',cx(m),y-15,'#ece3ac');}
 else if(m.kind==='socket'){ctx.fillStyle='#f0ce69';ctx.fillRect(x,y,w,h);}
 else if(m.kind==='waterfall'||m.kind==='lava'||m.kind==='poison'){
  const frozen=m.frozenUntil>this.time;ctx.fillStyle=frozen?'#86cfde':m.kind==='lava'?'#c86f47':m.kind==='poison'?'#456c56':'#549dab66';ctx.fillRect(x,y,w,h);ctx.strokeStyle=frozen?'#d5fcff':m.kind==='lava'?'#ffc770':m.kind==='poison'?'#b1de8b':'#a6e3f0';ctx.lineWidth=2;
  for(let i=0;i<w;i+=27){ctx.beginPath();ctx.moveTo(x+i,y+3);ctx.lineTo(x+i+12,y+(frozen?3:7+Math.sin(this.time*2+i)*4));ctx.stroke();}
  if(m.kind==='waterfall')this.vText(ctx,frozen?'水柱已固化':'可冷凝水柱',cx(m),y-13,'#d2f6ff');
 }
 else if(m.kind==='molecule'){ctx.globalAlpha=mode==='micro'?1:.14;ctx.strokeStyle='#b5eea4';ctx.fillStyle='#98d7bd55';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx(m),y+20,w/2,28,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#e0ffd2';ctx.fillRect(x,y,w,4);}
 else if(m.kind==='wall'||m.kind==='slicePlatform'){const active=m.v16Layer===lay;ctx.globalAlpha=active?.90:.18;ctx.fillStyle=hue[m.v16Layer];ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;ctx.strokeStyle=hue[m.v16Layer];ctx.lineWidth=2;ctx.setLineDash(active?[]:[7,8]);ctx.strokeRect(x,y,w,h);this.vText(ctx,m.v16Layer+' 層 · '+(active?'實體':'投影'),cx(m),y-15,hue[m.v16Layer]);}
 else if(m.kind==='crusher'){ctx.fillStyle='#658590';ctx.fillRect(x,y,w,h);ctx.fillStyle='#bdd9d9';ctx.fillRect(x,y+h-8,w,8);this.vText(ctx,m.frozenUntil>this.time?'已冷停':'凝結閘門',cx(m),y-12,'#c7eeed');}
 else if(m.kind==='console'){ctx.fillStyle='#28444a';ctx.fillRect(x,y,w,h);ctx.fillStyle='#d7e2c1';ctx.fillRect(x+7,y+7,w-14,24);ctx.fillStyle='#336361';ctx.fillRect(x+13,y+13,w-27,7);this.vText(ctx,'J / E 視界工坊',cx(m),y-19,'#ebdfb4');}
 ctx.restore();}
 for(const r of v.rails){if(!near(this,r.x,r.y,100))continue;const remaining=r.until-this.time;ctx.save();ctx.globalAlpha=remaining<1?.45+.45*Math.sin(this.time*15):.92;ctx.fillStyle='#a27943';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#ffe5a3';ctx.fillRect(r.x,r.y,r.w,3);ctx.restore();}
};
P.vDrawForecast=function(ctx){const v=this.vision16,on=v.mode==='forecast';
 const curve=(s,color,dashed=false)=>{const gravity=s.gravity||0;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.73;ctx.setLineDash(dashed?[5,6]:[]);ctx.beginPath();for(let t=0;t<=2;t+=.10){const x=s.x+(s.vx||0)*t,y=s.y+(s.vy||0)*t+.5*gravity*t*t;t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);for(const t of [.5,1,1.5,2]){const x=s.x+(s.vx||0)*t,y=s.y+(s.vy||0)*t+.5*gravity*t*t;ctx.fillRect(x-3,y-3,6,6);}ctx.restore();};
 for(const a of v.plans){if(a.done||a.cancelled)continue;const eta=Math.max(0,a.at-this.time),visible=a.layer==='ALL'||a.layer===this.vLayer();if(!near(this,a.x,a.y,Math.max(a.w||0,700)))continue;
  if(a.type==='bolt'){if(on&&eta<=2){curve(a,'#ff829b');ctx.save();ctx.fillStyle='#ff94aa55';ctx.fillRect(a.x-13,a.y-13,26,26);ctx.restore();this.vText(ctx,'◆ '+eta.toFixed(1)+'s · '+a.layer,a.x,a.y-27,'#ffabbc',12);}else{ctx.save();ctx.strokeStyle=hue[a.layer]||'#ff829b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,9+(1-Math.min(eta/2,1))*18,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  else {ctx.save();ctx.globalAlpha=visible?.20:.08;ctx.fillStyle=hue[a.layer];ctx.fillRect(a.x,a.y,a.w,a.h);ctx.globalAlpha=visible?.9:.42;ctx.strokeStyle=hue[a.layer];ctx.lineWidth=a.layer==='ALL'?4:2;ctx.setLineDash(visible?[]:[8,6]);ctx.strokeRect(a.x,a.y,a.w,a.h);ctx.restore();this.vText(ctx,`${a.layer==='ALL'?'▣ 三層同擊':a.layer+' 層'} · ${eta.toFixed(1)}s`,a.x+a.w/2,a.y-14,hue[a.layer],14);}
 }
 if(on){for(const s of this.enemyShots)if(s.t>0&&!s.friendly&&!(s.v16FrozenUntil>this.time)&&near(this,cx(s),cy(s),250)){if(s.type==='bombMarker'){this.vText(ctx,'落點 '+Math.max(0,s.warmup).toFixed(1)+'s',s.targetX,s.targetY-90,'#ffb0bf');continue;}curve({...s,x:cx(s),y:cy(s)},'#ff91a5');}
  for(const e of this.enemies.filter(e=>!e.dead&&e.aggro&&!e.v16Guard).slice(0,16)){if(!near(this,cx(e),cy(e)))continue;ctx.save();ctx.strokeStyle='#d5a3bd';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(cx(e),cy(e));ctx.lineTo(cx(e)+e.dir*110,cy(e));ctx.stroke();ctx.restore();this.vText(ctx,'可能方向',cx(e),e.y-75,'#d9b6c8',11);}
  for(const n of this.vNodes()){ctx.save();ctx.translate(n.x,n.y);ctx.rotate(Math.PI/4);ctx.fillStyle='#43182de0';ctx.fillRect(-15,-15,30,30);ctx.strokeStyle='#ffe1e7';ctx.lineWidth=3;ctx.strokeRect(-15,-15,30,30);ctx.restore();this.vText(ctx,'射擊結點',n.x,n.y-28,'#ffbed0',11);}
 }
 for(const s of this.enemyShots)if(s.v16FrozenUntil>this.time&&near(this,cx(s),cy(s),100)){const remain=s.v16FrozenUntil-this.time;ctx.save();ctx.strokeStyle=remain<.7?'#ffdb98':'#a5f1ff';ctx.lineWidth=3;ctx.globalAlpha=remain<.7?.5+.5*Math.sin(this.time*20):1;ctx.beginPath();ctx.arc(cx(s),cy(s),25,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d5fbff';ctx.fillRect(cx(s)-35,s.y+s.h,70,4);ctx.restore();const i=C.ELEMENTS.findIndex(e=>e.id===s.v16Mark);this.vText(ctx,i>=0?`${i===9?0:i+1} 再按換位`:`凝結 ${remain.toFixed(1)}s`,cx(s),s.y-20,'#d0f8ff',12);}
 for(const t of v.traces){ctx.save();ctx.fillStyle=hue[t.layer];ctx.globalAlpha=t.t/.3*.45;ctx.fillRect(t.x,t.y,t.w,t.h);ctx.fillStyle='#fff7ed';ctx.fillRect(t.x,t.y+t.h/2-2,t.w,4);ctx.restore();}
};
P.vDrawEcho=function(ctx){const v=this.vision16;for(const f of this.fields)if(f.v16Melt&&f.t>0&&near(this,cx(f),cy(f),40)){ctx.strokeStyle='#ffc18b';ctx.lineWidth=3;ctx.strokeRect(f.x,f.y,f.w,f.h);this.vText(ctx,'即將融解 '+f.t.toFixed(1)+'s',cx(f),f.y-12,'#ffe1a5',12);}if(v.echo?.pose){const s=v.echo.pose,p={...s,kingT:0,shield:0,inv:0,phase:0,attack:null,downT:0,hurtT:0,castT:0,dashT:0,grapple:null,v16Frame:s.frame,v16Small:s.w<28};ctx.save();ctx.globalAlpha=.60;ctx.filter='sepia(.8) saturate(1.4)';this.drawPlayer(ctx,p,true);ctx.restore();this.vText(ctx,'↺ 殘影 '+Math.max(0,v.echo.duration-(this.time-v.echo.start)).toFixed(1)+'s',cx(p),p.y-48,'#ffe2a2',14);}
 for(const s of v.echoShots){ctx.fillStyle='#ffe0a5';ctx.fillRect(s.x,s.y,s.w,s.h);}
 for(const f of v.fx){ctx.save();ctx.globalAlpha=f.t/f.max*.7;ctx.strokeStyle=f.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,8+f.r*(1-f.t/f.max),0,Math.PI*2);ctx.stroke();ctx.restore();}
};
const camera=P.updateCamera;
P.updateCamera=function(dt){const v=this.vInit(),target=v.mode==='macro'?.74:v.mode==='micro'?1.24:1;v.zoom+=(target-v.zoom)*(1-Math.exp(-8*dt));const w=this.viewW,h=this.viewH;this.viewW=w/v.zoom;this.viewH=h/v.zoom;try{camera.call(this,dt);}finally{this.viewW=w;this.viewH=h;}};
P.render=function(){const ctx=this.ctx,w=this.viewW,h=this.viewH,v=this.vInit(),z=v.zoom||1;ctx.save();ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=false;
 ctx.save();if(v.mode==='forecast')ctx.filter='grayscale(.94)';this.drawBackground(ctx,w,h);ctx.restore();
 ctx.save();ctx.scale(z,z);ctx.translate(-this.camera.x+(this.shake?Math.sin(this.time*97)*this.shake:0),-this.camera.y);this.viewW=w/z;this.viewH=h/z;
 try{
  ctx.save();if(v.mode==='forecast')ctx.filter='grayscale(.94)';this.drawRooms(ctx);ctx.restore();
  this.drawPlatforms(ctx);this.drawGatesAndPuzzles(ctx);this.drawFields(ctx);this.vDrawMaterials(ctx);this.drawFurniture(ctx);this.drawCollectibles(ctx);this.drawNPCs(ctx);this.drawEnemies(ctx);this.drawProjectiles(ctx);this.drawSummons(ctx);this.drawPlayer(ctx,this.player,false);if(this.remote)this.drawRemote(ctx);this.drawEffects(ctx);this.vDrawForecast(ctx);this.vDrawEcho(ctx);
 }finally{this.viewW=w;this.viewH=h;ctx.restore();}
 this.drawForeground(ctx,w,h);
 // 細邊框取代全螢幕強色偏；HUD 不經濾鏡、熱浪或色散。
 if(v.mode!=='now'){ctx.strokeStyle=D.modes[v.mode].color;ctx.globalAlpha=.7;ctx.lineWidth=3;ctx.strokeRect(3,3,w-6,h-6);ctx.globalAlpha=1;}
 if(v.mode==='cold'){ctx.fillStyle='#b9f2ff88';for(let i=0;i<24;i++){const x=(i*157+this.time*5)%w,y=(i*73+this.time*17)%h;ctx.fillRect(x,y,2,2);}}
 if(v.mode==='micro'){ctx.fillStyle='#b9eda630';for(let i=0;i<36;i++){const x=(i*131+Math.sin(this.time+i)*8)%w,y=(i*89)%h;ctx.fillRect(x,y,3,3);}}
 if(v.convergenceUntil>this.time){this.vText(ctx,'交會 CONVERGENCE',w/2,h*.28,'#ffe0a1',24);}
 if(this.flash>0&&!this.vStore().lowFlash){ctx.fillStyle=`rgba(255,255,255,${Math.min(.1,this.flash*.2)})`;ctx.fillRect(0,0,w,h);}ctx.restore();
};
window.ES16_RUNTIME={normal,layer};
})();
