/*
 * V10「共鳴研習」：建立在 V9.1 上，不替換原畫風、52 房原圖或 17 種怪物。
 * ─────────────────────────────────────────────────────────────────────────
 * skills.js       = 120 個技能資料，包含互斥 A/B 分支。
 * mastery.js      = 技能執行、取消、教學判定、存檔、工坊 UI。
 * game.js         = 原版物理／AI／Sprite／元素，仍是主要底層。
 *
 * 執行時機：此檔在 DOMContentLoaded 前安裝 Game.prototype 擴充。
 * 沒有 setTimeout 輪詢，也不會再產生第二個 Game 或 RAF。
 * 所有延遲命中用遊戲時間 scheduler；暫停、離開課程時不會偷打。
 */
(function(){
'use strict';
const C=window.ES9,W=window.ES9_WORLD,DATA=window.ES10_SKILLS;
const {Game,ATT}=window.ES9_ENGINE, P=Game.prototype;
const $=s=>document.querySelector(s), cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), sign=n=>n<0?-1:1;
const distance=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const approach=(n,to,by)=>n<to?Math.min(to,n+by):Math.max(to,n-by);
const friendly=c=>({Space:'SPACE',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',ShiftLeft:'SHIFT'}[c]||String(c).replace('Key','').replace('Digit',''));
const SKILLS=Object.fromEntries(Object.values(DATA).flat().map(s=>[s.id,s]));
const colors=Object.fromEntries(C.ELEMENTS.map(e=>[e.id,e.color]));
const SCHOOLS={
 rift:['裂隙劍士','裂刃回廊','瞬步換側／多段斬／挑空取消','rift_step','rift_rise'],
 summoner:['靈契召喚師','契靈庭院','唯一召喚／契靈集火／主僕換位','summoner_fox','summoner_owl'],
 beast:['森靈德魯伊','三形試煉林','狼追獵／鷹自由飛行／熊地震','beast_flight','beast_palm'],
 artificer:['符機工匠','工匠機動庫','砲台陣地／鉤索／磁浮平台','artificer_turret','artificer_hook'],
 gunner:['磁軌槍手','反衝靶場','慢速重彈／後座起跳／空中射擊','gunner_shot','gunner_rocket'],
 warden:['界壁守衛','界壁守備庭','精準格擋／長槍控制／破勢','warden_guard','warden_spear'],
 chrono:['時序術士','碎秒觀測室','延遲回響／時間錨／回溯','chrono_echo','chrono_rewind'],
 harrier:['鎖鏈游擊者','懸索練武場','拉怪與拉自己／空中追擊','harrier_hook','harrier_swing'],
 alchemist:['鍊金調律師','濕火實驗室','濕潤導電／消耗異常爆發','alchemist_mist','alchemist_spark'],
 monk:['雷影武僧','雷影道場','寸勁反制／多段拳／飛踢','monk_jab','monk_rise']
};
C.CLASSES.alchemist={name:'鍊金調律師',icon:'鍊',accent:'#edb96b',hp:160,speed:.99,desc:'拋瓶建立濕霧、燃燒、破甲；催化狀態後再換位收尾。',skills:[],q:['調律震盪',.65]};
C.CLASSES.monk={name:'雷影武僧',icon:'拳',accent:'#73cddd',hp:180,speed:1.08,desc:'短拳連打、上勾拳與迴旋踢；精準反制後獲得追擊空間。',skills:[],q:['寸勁反掌',.6]};
for(const [id,list] of Object.entries(DATA)){ C.CLASSES[id].skills=list.slice(0,3).map(s=>[s.name,s.cd]); }
// 新 Command 是原指令樹的延伸，而非刪掉 Z/X 原有分支。
Object.assign(ATT,{
 ZZXX:{...ATT.ZXX,name:'ZZXX・逆界追落',dmg:23,ky:430,kd:32,slam:true},
 ZZXZ:{...ATT.AIRZ,name:'ZZXZ・追空返刃',dmg:17,ky:-310,launch:true,airRefresh:true},
 ZXZZ:{...ATT.XZZ,name:'ZXZZ・背鋒回拉',dmg:20,kx:-270,pull:true},
 XZZX:{...ATT.XZX,name:'XZZX・旋升破',dmg:27,ky:-680,launch:true},
 XZXX:{...ATT.XXX,name:'XZXX・穿身落擊',dmg:30,ky:370,slam:true},
 XXZX:{...ATT.XXZ,name:'XXZX・破勢雙擊',dmg:30,br:60,shock:true},
 AIRZX:{...ATT.AIRX,name:'Air ZX・踏空墜擊',dmg:23,ky:390},
 AIRXZ:{...ATT.AIRUZ,name:'Air XZ・返燕升空',dmg:16,ky:-410,launch:true}
});
// ── 安全存檔：保留 es9_progress，另存 es10_progress；成長不是施法資源。 ──
function normalMaster(v){
 const out={schema:1,points:12,xp:0,level:1,loadouts:{},ranks:{},branches:{},follows:{},command:{},lessons:{},claims:{},skillPage:0};
 if(v&&typeof v==='object')for(const k of ['loadouts','ranks','branches','follows','command','lessons','claims'])if(v[k]&&typeof v[k]==='object'&&!Array.isArray(v[k]))out[k]=v[k];
 if(v){for(const k of ['points','xp','level'])if(Number.isFinite(v[k]))out[k]=clamp(Math.floor(v[k]),0,100000);out.skillPage=v.skillPage===1?1:0;}
 for(const [cls,list]of Object.entries(DATA)){
  const valid=new Set(list.map(s=>s.id));let a=out.loadouts[cls];
  if(!Array.isArray(a)||a.length!==6||a.some(id=>!valid.has(id))||new Set(a).size!==6)a=list.slice(0,6).map(s=>s.id);
  out.loadouts[cls]=a;
  for(const s of list){out.ranks[s.id]=clamp(Number(out.ranks[s.id])||0,0,2);out.branches[s.id]=out.branches[s.id]==='B'?'B':'A';if(!valid.has(out.follows[s.id])||out.follows[s.id]===s.id)out.follows[s.id]=s.recommendedFollow;}
  if(!['raw','fire','lightning','ice'].includes(out.command[cls]))out.command[cls]='raw';
 }
 return out;
}
const oldLoad=P.loadProgress;
P.loadProgress=function(){
 let p=null;try{p=JSON.parse(localStorage.getItem('es10_progress')||'null');}catch{}
 if(!p||typeof p!=='object')p=oldLoad.call(this);
 p=Object.assign(this.defaultProgress(),p);if(!C.CLASSES[p.classId])p.classId='rift';p.mastery=normalMaster(p.mastery);
 for(const k of ['opened','solved','shelters','discovered'])if(!p[k]||typeof p[k]!=='object')p[k]={};
 return p;
};
P.saveProgress=function(){try{localStorage.setItem('es10_progress',JSON.stringify(this.progress));}catch{this.saveBlocked=true;}};
P.mState=function(){return this.progress.mastery||(this.progress.mastery=normalMaster());};
P.mLoadout=function(){return this.trainingM?this.trainingM.loadout:this.mState().loadouts[this.player.classId];};
P.mBranch=function(id){return this.trainingM?this.trainingM.branches[id]||'A':this.mState().branches[id];};
P.mRank=function(id){return this.trainingM?Math.max(1,this.mState().ranks[id]||0):this.mState().ranks[id]||0;};
P.mSchedule=function(delay,fn){this.tasksM.push({at:this.time+Math.max(0,delay),epoch:this.epochM,fn});};
P.mEmit=function(type,data={}){
 this.eventsM.push({type,time:this.time,...data});if(this.eventsM.length>200)this.eventsM.splice(0,60);
 if(this.trainingM)this.checkLessonM(type,data);
};
P.mAward=function(key,points=2,xp=0){const m=this.mState();if(key&&m.claims[key])return false;if(key)m.claims[key]=true;m.points+=points;m.xp+=xp;this.saveProgress();return true;};
P.mXP=function(amount){if(this.trainingM)return;const m=this.mState();m.xp+=amount;let up=false;while(m.xp>=80+m.level*25){m.xp-=80+m.level*25;m.level++;m.points+=3;up=true;}if(up)this.say(`專精 Lv.${m.level}｜取得 3 點，可在 L 強化技能`,2.8,'#f3d483');this.saveProgress();};
// ── 初始化：原有地圖完全保留，補教官、實體實驗門及新區守衛。 ──
const baseBuild=P.buildWorld;
P.buildWorld=function(){
 this.tasksM=[];this.eventsM=[];this.masterFields=[];this.masterMissiles=[];this.cooldownsM={};this.trainingM=null;this.epochM=1;this.nextSaveM=0;this.pendingM=null;this.linkM=null;this.resonanceM=null;
 baseBuild.call(this);
 for(const r of this.rooms.filter(r=>r.training)){
  // 中央開放練習場不是樓層貼圖：多高度靶台、自由飛行垂直窗。
  const floor=r.floorY;this.platforms=this.platforms.filter(p=>p.room!==r.id||p.type==='roomFloor');
  this.addPlatform(r.x+100,floor-210,250,20,'hubLedge',{room:r.id});
  this.addPlatform(r.x+r.w-400,floor-340,300,20,'hubLedge',{room:r.id});
  this.addPlatform(r.x+r.w*.48,floor-560,260,18,'hubLedge',{room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.5,y:floor-330,r:20,room:r.id});
  this.rings.push({id:this.id(),x:r.x+r.w*.66,y:floor-690,r:20,room:r.id});
 }
 const home=this.roomById.get('r00');this.npcs.push({id:this.id(),role:'masterMentor',name:'共鳴教官・葵',text:'T 可選十職研習；L 編輯技能、追擊和分支。',x:home.x+160,y:home.floorY-62,w:40,h:62,room:home.id});
 for(const rid of ['e00','e05','e09','e14']){const r=this.roomById.get(rid);this.npcs.push({id:this.id(),role:'masterMentor',name:'東境研究員',text:'首解共鳴爐、收集遺物、擊殺敵人可得專精點。',x:r.x+r.w*.40,y:r.floorY-62,w:40,h:62,room:rid});}
 this.newRelays=this.puzzles.filter(p=>p.id.startsWith('m10_'));
 const r=this.roomById.get('e15');this.eastBoss=this.spawnEnemy('sentinel',r.x+r.w*.65,r.floorY,{room:r.id,hp:1550});this.eastBoss.name='熔鑄監察者・雙相';this.eastBoss.isEast=true;
 // 兩扇位於地圖上的研究門：只能由鄰近的指定共鳴爐解除。
 this.masterGates=[{x:18110,y:11910,w:44,h:310,relay:'m10_relay_0',name:'導電封門'}, {x:17660,y:6930,w:44,h:320,relay:'m10_relay_3',name:'光影封門'}];
 this.masterCaches=['e03','e06','e07','e10','e11','e13'].map((id,i)=>{const r=this.roomById.get(id);return{id:'cache'+i,room:id,x:r.x+80,y:r.floorY-48,w:46,h:48};});
};
const basePlatforms=P.activePlatforms;
P.activePlatforms=function(b=this.player){return basePlatforms.call(this,b).concat((this.masterGates||[]).filter(g=>!this.progress.solved[g.relay]));};
const basePuzzleSolve=P.solvePuzzleById;
P.solvePuzzleById=function(id){const was=this.progress.solved[id];const r=basePuzzleSolve.call(this,id);if(!was&&this.progress.solved[id])this.mAward('puzzle:'+id,id.startsWith('m10')?3:1,12);return r;};
// ── 取消與 hit-stop：攻擊輸入保留；技能不可透過換頁洗掉冷卻。 ──
P.loop=function(ts){
 const real=Math.min(.034,Math.max(0,(ts-this.last)/1000||0));this.last=ts;
 if(this.input.tap(this.keys.pause)&&!this.modalM()) {this.paused=!this.paused;this.input.pressed.delete(this.keys.pause);this.say(this.paused?'暫停｜P 繼續':'繼續',1);}
 const stopped=this.paused||this.modalM();
 if(!stopped){
  if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-real);
   if(this.key('zAttack',true))this.pendingM={kind:'command',token:'Z',until:this.time+.26};
   if(this.key('xAttack',true)||this.key('xAttackAlt',true))this.pendingM={kind:'command',token:'X',until:this.time+.26};
   for(let i=0;i<3;i++)if(this.key('skill'+(i+1),true))this.pendingM={kind:'skill',slot:i,until:this.time+.26};
   if(this.key('jump',true))this.player.jumpBuffer=.16;
  }else this.update(real,ts);
 }
 this.render();this.input.end();requestAnimationFrame(t=>this.loop(t));
};
P.modalM=function(){return Array.from(document.querySelectorAll('.modal')).some(el=>!el.hidden);};
const baseGlobal=P.updateGlobalInput;
P.updateGlobalInput=function(){
 if(this.key('skillbook',true))this.openMastery();
 if(this.key('school',true))this.openSchools();
 if(this.key('deck',true)){this.mState().skillPage=1-this.mState().skillPage;this.renderSkillBar();this.saveProgress();}
 if(this.key('exitSchool',true)&&this.trainingM)this.endTraining();
 baseGlobal.call(this);
};
const baseCommand=P.commandInput;
P.commandInput=function(token){
 const p=this.player;
 if(p.downT>0||p.recoverT>0)return;
 if(p.castT>0){this.pendingM={kind:'command',token,until:this.time+.25};return;}
 // 支援空中 Z→X / X→Z；仍保留 V9.1 方向、Dash、中立全分支。
 if(!p.onGround&&!this.key('up')&&!this.key('down')&&!p.attack){
  if(p.history==='Z'&&token==='X'){p.history='ZX';p.historyT=.7;return this.startAttack('AIRZX');}
  if(p.history==='X'&&token==='Z'){p.history='XZ';p.historyT=.7;return this.startAttack('AIRXZ');}
 }
 baseCommand.call(this,token);
};
const baseStart=P.startAttack;
P.startAttack=function(key){
 baseStart.call(this,key);const a=this.player.attack;if(a){a.def.mCommand=true;a.def.mClass=this.player.classId;this.player.castM=null;this.mEmit('command',{key});}
};
const baseClassAttack=P.classAttack;
P.classAttack=function(def,key){
 const d=baseClassAttack.call(this,def,key),p=this.player;
 d.hit=Math.min(d.hit,d.dur*.58);d.cancel=Math.max(d.hit+.035,Math.min(d.cancel,d.dur*.66));
 d.lunge=Math.min(d.lunge||0,125);d.mCommand=true;
 if(this.hasteM>0){d.cancel=Math.max(d.hit+.02,d.cancel*.80);}
 if(p.classId==='beast'){
  if(p.form==='wolf'){d.name=d.name.replace(/・.*/, '・狼爪追咬');d.anim=key.includes('X')?'x':'z1';d.w*=1.1;d.lunge=Math.min(42,Math.max(20,d.lunge||20));}
  if(p.form==='eagle'){d.name=d.name.replace(/・.*/, '・鷹翼風羽');d.featherM=true;d.mechanicalShot=true;d.gunShot=false;d.recoil=0;d.w=140;d.ky=-150;}
  if(p.form==='bear'||p.form==='king'){d.name=d.name.replace(/・.*/, '・熊掌震地');d.bearM=true;d.w=235;d.h=155;d.oy=-25;d.lunge=0;d.big=true;d.br*=1.3;}
 }
 if(p.classId==='alchemist'){d.name=d.name.replace(/・.*/,key.includes('X')?'・藥瓶投擲':'・鍊金短杖');if(key.includes('X'))d.mechanicalShot=true;d.mElement='water';}
 if(p.classId==='monk'){d.name=d.name.replace(/・.*/,key.includes('X')?'・迴旋踢':'・寸勁連拳');d.w*=.88;d.dur*=.92;d.cancel=Math.max(d.hit+.03,d.cancel*.87);d.br*=1.1;}
 return d;
};
const baseBox=P.attackBox;
P.attackBox=function(p,d){return d.bearM?{x:cx(p)-d.w/2,y:p.y-30,w:d.w,h:d.h}:baseBox.call(this,p,d);};
const baseAttacks=P.updateAttacks;
P.updateAttacks=function(dt){const a=this.player.attack,nh=this.skillShots.length;const before=a?.hit,echo=a?.def.echo;if(a&&echo)a.def.echo=false;
 baseAttacks.call(this,dt);if(a&&echo)a.def.echo=echo;
 if(a&&!before&&a.hit){
  const baseElem=this.mState().command[this.player.classId];
  for(const s of this.skillShots.slice(nh)){s.mCommand=true;s.commandDef={...a.def};s.mElement=a.def.featherM?'wind':baseElem!=='raw'?baseElem:a.def.mElement;s.hitM=new Set();if(a.def.featherM){s.color=colors.wind;s.type='feather';s.vx=this.player.dir*210;}}
  if(echo){const box=this.attackBox(this.player,a.def);this.mSchedule(.36,()=>this.mArea(cx(box),cy(box),box.w*.6,a.def.dmg*.48,{element:'shadow',power:1,skill:'chrono_echo',br:15},{isEcho:true}));}
  if(a.def.bearM)this.mVisual('quake',cx(this.player),this.player.y+this.player.h,235,colors.earth,.42);
 }
};
// ── 精通分支：同一技能只啟用 A 或 B，可免費切换。 ──
P.upgradeMasterSkill=function(id){if(!SKILLS[id])return false;const m=this.mState(),r=m.ranks[id]||0,cost=r+1;if(r>=2||m.points<cost){this.say(r>=2?'已達技能等級 2':'專精點不足；課程、首解、遺物與升級可獲得',2);return false;}m.points-=cost;m.ranks[id]=r+1;this.saveProgress();this.mEmit('upgrade',{id,rank:r+1});return true;};
P.chooseMasterBranch=function(id,b){if(!SKILLS[id]||!['A','B'].includes(b))return;if(this.trainingM){this.trainingM.branches[id]=b;this.trainingM.branchChosen=true;}else this.mState().branches[id]=b;this.saveProgress();};
P.equipMasterSkill=function(id,slot){const list=this.mLoadout();if(SKILLS[id]&&!Number.isNaN(slot)&&slot>=0&&slot<6&&DATA[this.player.classId].some(s=>s.id===id)){const old=list.indexOf(id),prev=list[slot];list[slot]=id;if(old>=0&&old!==slot)list[old]=prev;this.renderSkillBar();this.saveProgress();return true;}return false;};
P.setCommandBranch=function(b){if(!['raw','fire','lightning','ice'].includes(b))return false;const m=this.mState();if(b!=='raw'&&!m.claims['command:'+b]){if(m.points<2)return false;m.points-=2;m.claims['command:'+b]=true;}m.command[this.player.classId]=b;this.saveProgress();return true;};
P.mSkillContext=function(s){
 const rank=this.mRank(s.id),branch=this.mBranch(s.id),mod=rank>0?s.branches.find(b=>b.id===branch)?.effect:null;
 const res=this.resonanceM&&this.resonanceM.until>=this.time?this.resonanceM:null;
 return {skill:s.id,classId:this.player.classId,rank,mod,element:s.element,resonance:res?.element||null,power:1+rank*.12,reach:mod==='reach'?1.25:1,br:22+rank*6};
};
P.useSkill=function(slot){
 const p=this.player;if(p.downT>0||p.recoverT>0)return false;
 if(p.attack&&p.attack.elapsed<p.attack.def.cancel){this.pendingM={kind:'skill',slot,until:this.time+.25};return false;}
 if(p.castT>0){this.pendingM={kind:'skill',slot,until:this.time+.24};return false;}
 const page=this.mState().skillPage,idx=page*3+slot,id=this.mLoadout()[idx];
 const link=this.linkM&&this.linkM.slot===slot&&this.linkM.page===page&&this.linkM.until>=this.time&&this.linkM.ready<=this.time?this.linkM:null;
 return this.castMasterSkill(link?link.next:id,{slot,linked:!!link,parent:link?.source});
};
P.castMasterSkill=function(id,opts={}){
 const s=SKILLS[id],p=this.player;if(!s||!DATA[p.classId].includes(s)||p.downT>0)return false;
 if((this.cooldownsM[id]||0)>this.time){this.say(`${s.name} 冷卻 ${((this.cooldownsM[id]-this.time)).toFixed(1)} 秒`,.6);return false;}
 const ctx=this.mSkillContext(s);ctx.linked=!!opts.linked;ctx.airborneCast=!p.onGround;const cd=this.cooldown(s.cd);this.cooldownsM[id]=this.time+cd;
 p.attack=null;p.buffer=null;p.castT=.10;p.castM={row:['launch','fly'].includes(s.mode)?7:['quake','dive','spin'].includes(s.mode)?6:12,until:this.time+.32};
 if(s.form)this.setFormM(s.form);
 this.commandLabel=`${opts.linked?'接續 → ':''}${s.name}${ctx.rank?' · '+this.mBranch(s.id):''}${ctx.resonance?' / 共鳴':''}`;this.commandT=1.1;
 this.sfx.skill();
 if(!opts.linked){const next=this.trainingM?.follows[id]||this.mState().follows[id];this.linkM={source:id,next,slot:opts.slot??0,page:this.mState().skillPage,ready:this.time+.14,until:this.time+1.0};}else this.linkM=null;
 this.mEmit('skill',{id,mode:s.mode,linked:!!opts.linked,resonance:ctx.resonance,branch:this.mBranch(id)});
 if(ctx.mod==='shield')p.shield=Math.max(p.shield,12+ctx.rank*4);
 if(ctx.mod==='heal')p.hp=Math.min(p.maxHp,p.hp+3+ctx.rank);
 if(ctx.mod==='air')p.airDashes=Math.max(p.airDashes,1);
 if(ctx.mod==='element'&&s.element==='light')p.shield=Math.max(p.shield,8);
 this.runMasterSkill(s,ctx,opts);
 if(ctx.resonance)this.resonanceM=null; // 共鳴是獎勵不是施放資格；不消耗 MP。
 return true;
};
// ── 狀態只在真正命中後處理；不把「按了鍵」當作打中。 ──
P.mStatus=function(e,element,strength=1){
 if(!element||element==='raw'||e.dead)return;
 const boss=e.type==='sentinel';
 if(element==='fire'){e.burn=Math.max(e.burn,2.8+strength);e.burnTick=Math.min(e.burnTick||.55,.55);}
 if(element==='ice'){e.freeze=Math.max(e.freeze,boss?.20:(e.wet>0?1.5:.65)+strength*.2);}
 if(element==='lightning'){e.stun=Math.max(e.stun,boss?.20:(e.wet>0?.95:.38)+strength*.1);}
 if(element==='wind'){e.vx+=sign(cx(e)-cx(this.player))*110*strength;e.vy-=55;}
 if(element==='earth')e.armorBreak=Math.max(e.armorBreak,2+strength);
 if(element==='water'){e.wet=Math.max(e.wet,4+strength);e.burn=0;}
 if(element==='shadow')e.curse=Math.max(e.curse,3+strength);
 if(element==='nature')e.root=Math.max(e.root,boss?.18:1+strength*.25);
 if(element==='gravity'){e.vx+=sign(cx(this.player)-cx(e))*140;e.vy-=70;}
 if(element==='light')e.hidden=false;
};
const baseDamage=P.damageEnemy;
P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){
 if(e.dead)return;const hp=e.hp,wasDead=e.dead,prevBoss=this.bossDefeated;
 // 教學傀儡受打但不死亡、不掉戰利品。
 if(e.practiceM)e.hp=e.maxHp;
 const ctx=def.master||this.activeContextM||(def.mCommand?{command:true,element:this.mState().command[this.player.classId],power:1,rank:0}:null);
 const scale=ctx?.power||1;
 // 防止多段攻擊把敵人每幀越疊越快，改為有限制的衝擊速度。
 if(Math.abs(e.vy)>680)e.vy=clamp(e.vy,-680,680);if(Math.abs(e.vx)>520)e.vx=clamp(e.vx,-520,520);
 baseDamage.call(this,e,dmg*scale,kx,ky,def);
 if(e.isEast)this.bossDefeated=prevBoss;
 const actual=Math.max(0,(e.practiceM?e.maxHp:hp)-e.hp);
 if(actual<=0)return;
 e.vy=clamp(e.vy,-870,920);e.vx=clamp(e.vx,-780,780);
 if(ctx){
  this.mStatus(e,ctx.element,ctx.mod==='element'?2:1);
  if(ctx.resonance)this.mStatus(e,ctx.resonance,1.5);
  if(ctx.mod==='pull')e.vx+=sign(cx(this.player)-cx(e))*180;
  if(ctx.mod==='air')this.player.airDashes=Math.max(this.player.airDashes,1);
  if(ctx.mod==='echo'&&!def.isEcho){const x=cx(e),y=cy(e);this.mSchedule(.22,()=>this.mArea(x,y,95,dmg*.3,{...ctx,mod:null},{isEcho:true,ky:-30}));}
 }
 if(def.mCommand&&this.player.classId==='rift')this.player.airDashes=Math.max(1,this.player.airDashes);
 const event={enemy:e.id,key:def.key,skill:ctx?.skill,element:ctx?.element,resonance:ctx?.resonance,damage:actual,airborne:e.airborne,group:ctx?.group||null,command:!!def.mCommand,linked:!!ctx?.linked,airborneCast:!!ctx?.airborneCast};
 this.mEmit('hit',event);
 if(def.mCommand||ctx?.skill){this.hitStop=Math.min(.065,Math.max(this.hitStop,def.big?.05:.025));this.shake=Math.min(10,Math.max(this.shake,def.big?7:3));}
 if(e.practiceM){e.dead=false;e.hp=e.maxHp;this.progress.scrap=Math.max(0,this.progress.scrap);}
 if(!wasDead&&e.dead){if(e.isEast){this.mAward('eastBoss',8,100);this.say('熔鑄監察者擊破｜東境共鳴完成 +8 專精點',4,'#f2d48b');}this.mXP(e.type==='sentinel'?80:16);this.mEmit('kill',{enemy:e.id,type:e.type});}
};
P.mArea=function(x,y,r,dmg,ctx,opts={}){
 const radius=r*(ctx.reach||1);this.mVisual(opts.visual||'ring',x,y,radius,colors[ctx.resonance||ctx.element]||'#ceeeee',.35);
 let n=0;for(const e of this.enemies){if(e.dead||Math.hypot(cx(e)-x,cy(e)-y)>radius)continue;
  this.damageEnemy(e,dmg,opts.pull?sign(x-cx(e))*190:sign(cx(e)-x)*(opts.kx??120),opts.ky??-75,{master:ctx,kd:opts.kd??7,br:opts.br??ctx.br??22,big:!!opts.big,launch:(opts.ky||0)<-200,isEcho:!!opts.isEcho});n++;
 }return n;
};
P.mSlash=function(s,ctx,offset=0){const p=this.player,r=(s.range||140)*(ctx.reach||1);const box={x:p.dir>0?p.x+p.w-10:p.x-r+10,y:p.y-20,w:r,h:120};this.mVisual('slash',cx(p)+p.dir*r*.55,cy(p)+offset,r,colors[ctx.resonance||ctx.element],.26,p.dir);
 for(const e of this.enemies)if(!e.dead&&hit(box,e))this.damageEnemy(e,s.damage,p.dir*100,s.launch??-70,{master:ctx,kd:6,br:ctx.br,big:s.damage>=25,launch:!!s.launch});
};
P.mAnchor=function(){const t=this.findElementTarget(this.currentElement);return t?{x:cx(t.ref),y:cy(t.ref),target:t}:{x:cx(this.player)+this.player.dir*130,y:cy(this.player),target:null};};
P.mVisual=function(kind,x,y,r,color,t=.4,dir=1){this.effects.push({id:this.id(),type:'masterVFX',kind,x,y,r,color:color||'#eaffff',t,max:t,dir});};
P.mField=function(s,ctx,type,at=null){const a=at||this.mAnchor(),f={id:this.id(),type,x:a.x,y:a.y,r:(s.range||180)*(ctx.reach||1),t:s.duration||3,tick:0,damage:s.damage,ctx,follow:!!s.follow,hit:new Set()};this.masterFields.push(f);return f;};
P.mShot=function(s,ctx,angle=0,override={}){const p=this.player,dir=p.dir,speed=s.speed||220;angle+=(this.key('up')?-.52:0)+(this.key('down')?.52:0);
 const b={id:this.id(),x:cx(p)+dir*28,y:cy(p),w:22,h:22,vx:Math.cos(angle)*dir*speed,vy:Math.sin(angle)*speed,age:0,t:4.8,damage:s.damage,color:colors[ctx.resonance||ctx.element],ctx,mode:s.mode,source:s.id,origin:{x:cx(p),y:cy(p)},hit:new Set(),pierce:(s.pierce||0)+(ctx.mod==='pierce'?2:0),homing:!!s.homing,r:s.range||165,...override};this.masterMissiles.push(b);return b;};
// ── 技能執行器。共用的是碰撞與粒子，不是把所有職業都做成同一招。 ──
P.runMasterSkill=function(s,ctx,opts={}){
 const p=this.player,dir=p.dir,origin={x:cx(p),y:cy(p)},target=this.nearestEnemy(820),at=target?{x:cx(target),y:cy(target)}:this.mAnchor();
 const color=colors[ctx.resonance||ctx.element],n=s.hits||1,mode=s.mode;
 if(['dash','pounce'].includes(mode)){
  p.vx=dir*(s.move||430);p.dashT=.12;p.inv=Math.max(p.inv,.10);
  for(let i=0;i<n;i++)this.mSchedule(.08+i*.10,()=>{if(s.shot)this.mShot({...s,mode:'rail',speed:235},ctx);else this.mSlash(s,ctx,i%2?12:0);});
 }else if(mode==='launch'){
  p.vy=p.classId==='gunner'?-690:-540;p.airDashes=Math.max(p.airDashes,1);p.onGround=false;
  this.mSchedule(.08,()=>this.mArea(cx(p)+dir*60,cy(p),s.range||170,s.damage,ctx,{ky:s.launch||-590,visual:'updraft'}));
 }else if(mode==='spin'){
  for(let i=0;i<n;i++)this.mSchedule(.08+i*.12,()=>this.mArea(cx(p),cy(p),s.range||190,s.damage,ctx,{ky:i===n-1?-180:-45,kx:i===n-1?230:40,big:i===n-1,visual:'slash'}));
 }else if(['volley','rail','targetShot','hoverVolley'].includes(mode)){
  if(mode==='hoverVolley'){this.hoverM=1.0;p.vy=-30;}
  for(let i=0;i<n;i++)this.mSchedule(.06+i*(mode==='hoverVolley'?.13:.055),()=>this.mShot(s,ctx,(i-(n-1)/2)*.115));
  if(s.recoil)p.vx-=dir*s.recoil;
 }else if(mode==='wave'){
  this.mShot(s,ctx,0,{y:p.y+p.h-25,w:42,h:30,mode:'wave'});
 }else if(mode==='boomerang'){
  for(let i=0;i<(s.hits||1);i++)this.mShot(s,ctx,i*.22,{mode:'boomerang',t:2.5,pierce:8,w:30,h:30});
 }else if(mode==='grenade'){
  this.mShot(s,ctx,-.65,{vy:-260,mode:'grenade',t:1.5,w:27,h:27});
 }else if(mode==='blink'){
  const a=target?{x:target.x+dir*(target.w+25),y:target.y}: {x:p.x+dir*190,y:p.y};
  const safe=this.findSafePosition(a.x,a.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.inv=.22;p.airDashes=Math.max(1,p.airDashes);
  this.mSchedule(.07,()=>this.mArea(cx(p),cy(p),s.range||170,s.damage,ctx,{visual:'slash'}));
  if(s.echo)this.mSchedule(.4,()=>this.mArea(origin.x,origin.y,140,s.damage*.6,ctx,{isEcho:true}));
 }else if(mode==='anchorDetonate'){
  const a=this.mAnchor();this.mSchedule(s.delay||.1,()=>{this.mArea(origin.x,origin.y,s.range||185,s.damage,ctx);this.mArea(a.x,a.y,s.range||185,s.damage,ctx);});
 }else if(mode==='anchorRecall'){
  const a=this.mAnchor();if(a.target){const el=C.ELEMENTS.find(e=>e.id===this.currentElement);this.swapElement(a.target,el,C.ELEMENTS.indexOf(el));}
  this.mSchedule(.09,()=>this.mArea(cx(p),cy(p),s.range||200,s.damage,ctx,{pull:s.element==='gravity',visual:'ring'}));
 }else if(mode==='orbit'){
  this.mField(s,ctx,'orbit',origin).follow=true;
 }else if(mode==='meteor'){
  for(let i=0;i<n;i++){const tx=at.x+(i-(n-1)/2)*58,ty=at.y;this.mSchedule(.16+i*.14,()=>{this.mVisual('drop',tx,ty-80,160,color,.3);this.mArea(tx,ty,s.range||150,s.damage,ctx,{ky:-150});});}
 }else if(mode==='summon'){
  // 唯一契靈註冊；全部從同一個池查 id，切技能頁不會多一隻。
  let pet=this.summons.find(q=>q.type===s.summon);
  if(pet){pet.rank=Math.min(3,pet.rank+1);pet.t=22;pet.cool=0;pet.masterCtx=ctx;}
  else {pet={id:this.id(),type:s.summon,name:s.name,mode:s.role,t:22,rank:1,cool:.15,x:origin.x-50,y:origin.y-40,color,masterCtx:ctx};this.summons.push(pet);}
  this.mVisual('summon',pet.x,pet.y,105,color,.6);this.mEmit('summon',{type:pet.type,rank:pet.rank,unique:this.summons.filter(q=>q.type===pet.type).length});
 }else if(mode==='commandSummons'){
  if(target&&this.summons.length){this.summons.forEach((q,i)=>{q.target=target.id;this.mSchedule(.06+i*.09,()=>this.mArea(cx(target),cy(target),95,s.damage,ctx,{ky:q.type==='owl'?-430:-70}));});}
  else this.mShot({...s,mode:'volley',speed:220},ctx);
 }else if(mode==='summonSwap'){
  const pet=this.summons.slice().sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y))[0];
  if(pet){const safe=this.findSafePosition(pet.x-p.w/2,pet.y-p.h/2,p.w,p.h);pet.x=origin.x;pet.y=origin.y;p.x=safe.x;p.y=safe.y;p.inv=.26;}
  this.mArea(cx(p),cy(p),145,s.damage,ctx);this.mEmit('petSwap',{success:!!pet});
 }else if(mode==='rally'){
  const a=this.mAnchor();this.summons.forEach((q,i)=>{q.x=a.x+(i-1)*35;q.y=a.y-40;q.rallyUntil=this.time+2;q.rally={...a};q.cool=0;});this.mArea(a.x,a.y,s.range||170,s.damage,ctx,{pull:true});
 }else if(mode==='barrier'){
  p.shield=Math.max(p.shield,20);this.mField(s,ctx,'barrier',origin);this.mVisual('ring',origin.x,origin.y,s.range||155,color,.4);
 }else if(mode==='heal'){
  p.hp=Math.min(p.maxHp,p.hp+(s.heal||12)+(p.classId==='summoner'?this.summons.length*2:0));p.burn=0;p.poison=0;p.web=0;
  this.turrets.forEach(t=>t.t=Math.max(t.t,12));this.mVisual('heal',origin.x,origin.y,130,color,.7);
 }else if(mode==='fly'){
  this.flightM=(s.duration||4.5)*(ctx.reach||1);p.onGround=false;p.vy=-290;p.airDashes=Math.max(1,p.airDashes);this.mVisual('updraft',origin.x,origin.y,170,color,.55);
 }else if(mode==='dive'){
  if(p.onGround)this.mArea(origin.x,p.y+p.h,s.range||220,s.damage,ctx,{big:true,ky:-310});
  else{this.diveM={ctx,s,until:this.time+2.5};p.vy=640;}
 }else if(['quake','roar','howl'].includes(mode)){
  p.armor=Math.max(p.armor,.3);this.mSchedule(.12,()=>this.mArea(cx(p),p.y+p.h-35,s.range||230,s.damage,ctx,{big:mode!=='howl',br:mode==='roar'?70:40,ky:mode==='quake'?-240:-85,visual:'quake'}));
 }else if(mode==='armor'){
  p.armor=Math.max(p.armor,1.4);p.shield=Math.max(p.shield,35);p.web=0;this.mArea(origin.x,origin.y,s.range||155,s.damage,ctx,{kx:220});
 }else if(mode==='roots'||mode==='platform'){
  const a=mode==='roots'?this.mAnchor():{x:origin.x,y:p.y+p.h};
  this.fields.push({id:this.id(),type:mode==='roots'?'vinePillar':'skillPlatform',x:a.x-65,y:a.y+10,w:130,h:19,t:8,oneWay:true,color});
  if(mode==='platform'){p.vy=-790;p.onGround=false;p.airDashes=Math.max(p.airDashes,1);}else this.mArea(a.x,a.y,s.range||195,s.damage,ctx,{ky:-95});
  this.mVisual('grow',a.x,a.y,145,color,.7);
 }else if(mode==='formStrike'){
  const sub=p.form==='eagle'?{...s,mode:'launch',range:160,launch:-490}:p.form==='bear'||p.form==='king'?{...s,mode:'quake',range:240}:{...s,mode:'pounce',hits:2,move:500,range:140};
  this.runMasterSkill(sub,ctx,opts);
 }else if(mode==='king'){
  p.prevForm=p.form;this.setFormM('king');p.kingT=s.duration||9;p.armor=2;this.flightM=8;this.mArea(origin.x,origin.y,s.range||210,s.damage,ctx,{big:true,ky:-240});
 }else if(mode==='turret'){
  let t=this.turrets[0];if(t){t.rank=Math.min(3,(t.rank||1)+1);t.t=18;t.cool=0;}else this.turrets.push({id:this.id(),x:p.x-dir*60,y:p.y+p.h-42,w:40,h:42,t:18,rank:1,cool:0,color});
  this.mVisual('summon',p.x-dir*60,p.y+p.h-25,95,color,.55);
 }else if(mode==='mine'){
  this.mField(s,ctx,'mine',this.mAnchor());
 }else if(['vortex','stasis','field'].includes(mode)){
  this.mField(s,ctx,mode,mode==='stasis'?origin:null);
 }else if(mode==='overload'){
  this.overloadM=s.duration||5;this.turrets.forEach(t=>t.cool=0);const a=this.mAnchor();this.mArea(a.x,a.y,180,s.damage,ctx);this.mVisual('ring',origin.x,origin.y,200,color,.55);
 }else if(mode==='grapple'){
  const t=this.findGrappleTarget()||(target?{x:cx(target),y:cy(target)}:null);
  if(t){const dx=t.x-origin.x,dy=t.y-origin.y,m=Math.hypot(dx,dy)||1;p.vx=dx/m*600;p.vy=dy/m*550-100;p.dashT=.12;p.airDashes=Math.max(p.airDashes,1);p.inv=.12;this.effects.push({id:this.id(),type:'line',x:origin.x,y:origin.y,x2:t.x,y2:t.y,t:.35,max:.35,color});}
  if(target)this.mSchedule(.1,()=>this.mArea(cx(target),cy(target),110,s.damage,ctx));
 }else if(mode==='pull'){
  if(target){this.chainPull(target);this.damageEnemy(target,s.damage,-dir*260,-180,{master:ctx,kd:7,br:ctx.br});this.effects.push({id:this.id(),type:'line',x:origin.x,y:origin.y,x2:cx(target),y2:cy(target),t:.35,max:.35,color});this.mEmit('pull',{enemy:target.id});}
 }else if(mode==='parry'){
  p.parry=.38;this.parryCtxM=ctx;this.parryDamageM=s.damage;this.mVisual('guard',origin.x,origin.y,115,color,.42);
 }else if(mode==='rewind'){
  const old=p.rewind.find(q=>this.time-q.t>=2.8)||p.rewind[0];
  if(old){const safe=this.findSafePosition(old.x,old.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.hp=Math.max(p.hp,Math.min(p.maxHp,old.hp));p.inv=.3;this.mEmit('rewind',{distance:Math.hypot(origin.x-cx(p),origin.y-cy(p))});}
  this.mVisual('ring',origin.x,origin.y,200,color,.6);
 }else if(mode==='timeAnchor'){
  if(p.anchor){const safe=this.findSafePosition(p.anchor.x,p.anchor.y,p.w,p.h);p.x=safe.x;p.y=safe.y;p.anchor=null;p.inv=.25;this.mEmit('rewind',{distance:Math.hypot(origin.x-cx(p),origin.y-cy(p))});}
  else p.anchor={x:p.x,y:p.y,hp:p.hp};this.mVisual('ring',origin.x,origin.y,135,color,.6);
 }else if(mode==='delayed'){
  this.mVisual('seal',at.x,at.y,s.range||185,color,s.delay||.7);this.mSchedule(s.delay||.7,()=>this.mArea(at.x,at.y,s.range||185,s.damage,ctx,{big:true}));
 }else if(mode==='haste'){
  this.hasteM=s.duration||4;p.airDashes=Math.max(p.airDashes,1);this.mVisual('updraft',origin.x,origin.y,150,color,.6);
 }else if(mode==='consume'){
  this.mVisual('ring',at.x,at.y,s.range||220,color,.4);
  for(const e of this.enemies){if(e.dead||Math.hypot(cx(e)-at.x,cy(e)-at.y)>(s.range||220))continue;const stacks=(e.wet>0?1:0)+(e.burn>0?1:0)+(e.curse>0?1:0);e.wet=0;e.burn=0;e.curse=0;this.damageEnemy(e,s.damage+stacks*12,dir*210,-160,{master:ctx,big:true,kd:18,br:40});}
 }else throw new Error('Unimplemented V10 skill mode: '+mode);
};
// ── 投射物有命中集合；穿透／回旋不會每一幀重複打同一隻。 ──
P.tickMasterCombat=function(dt){
 for(const b of this.masterMissiles){
  b.t-=dt;b.age+=dt;if(b.t<=0&&b.mode!=='grenade')continue;
  if(b.mode==='grenade')b.vy+=690*dt;
  if(b.mode==='boomerang'&&b.age>.75){if(!b.returned){b.returned=true;b.hit.clear();}const dx=cx(this.player)-b.x,dy=cy(this.player)-b.y,m=Math.hypot(dx,dy)||1;b.vx=dx/m*240;b.vy=dy/m*240;if(m<25)b.t=0;}
  if(b.homing){const target=this.enemies.filter(e=>!e.dead&&distance(e,b)<650).sort((a,c)=>(a.mark?-100:0)+distance(a,b)-(c.mark?-100:0)-distance(c,b))[0];if(target){const dx=cx(target)-b.x,dy=cy(target)-b.y,m=Math.hypot(dx,dy)||1,speed=Math.hypot(b.vx,b.vy)||200;b.vx=approach(b.vx,dx/m*speed,650*dt);b.vy=approach(b.vy,dy/m*speed,650*dt);}}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  const solid=this.platforms.find(s=>s.active!==false&&!s.oneWay&&hit(b,s));
  let explode=b.mode==='grenade'&&(b.t<=0||!!solid);
  for(const e of this.enemies){if(e.dead||b.hit.has(e.id)||!hit(b,e))continue;
   if(b.mode==='grenade'){explode=true;break;}
   b.hit.add(e.id);this.damageEnemy(e,b.damage,sign(b.vx)*110,-90,{master:b.ctx,kd:8,br:b.ctx.br,big:b.mode==='rail'});
   if(b.pierce>0)b.pierce--;else b.t=0;break;
  }
  if(explode){this.mArea(b.x,b.y,b.r,b.damage,b.ctx,{big:true,ky:-160});b.t=0;b.mode='spent';}
  if(solid&&b.mode!=='boomerang')b.t=0;
 }
 this.masterMissiles=this.masterMissiles.filter(b=>b.t>0&&Number.isFinite(b.x)&&Number.isFinite(b.y));
 for(const f of this.masterFields){
  f.t-=dt;f.tick-=dt;if(f.follow){f.x=cx(this.player);f.y=cy(this.player);}
  if(f.type==='vortex')this.gravityPull(f.x,f.y,f.r,700*dt);
  if(f.type==='stasis'){for(const e of this.enemies)if(!e.dead&&Math.hypot(cx(e)-f.x,cy(e)-f.y)<f.r){e.stun=Math.max(e.stun,.05);e.vx*=.94;}for(const s of this.enemyShots)if(Math.hypot(cx(s)-f.x,cy(s)-f.y)<f.r){s.vx*=Math.pow(.20,dt);s.vy*=Math.pow(.2,dt);}}
  if(f.type==='barrier'){for(const s of this.enemyShots)if(!s.friendly&&Math.hypot(cx(s)-f.x,cy(s)-f.y)<f.r)s.t=0;}
  if(f.type==='mine'){if(this.enemies.some(e=>!e.dead&&Math.hypot(cx(e)-f.x,cy(e)-f.y)<85)){this.mArea(f.x,f.y,f.r,f.damage,f.ctx,{big:true,ky:-230});f.t=0;}}
  else if(f.tick<=0&&f.damage>0){this.mArea(f.x,f.y,f.r,f.damage,f.ctx,{ky:f.type==='orbit'?-70:-35,pull:f.type==='vortex'});f.tick=.55;}
 }
 this.masterFields=this.masterFields.filter(f=>f.t>0);
};
// 原版召喚邏輯保留唯一規則，新增星獸並讓集結位置不是立刻被 follow 蓋掉。
const baseShots=P.updateSkillShots;
P.updateSkillShots=function(dt){
 const owned=this.skillShots.filter(s=>s.mCommand);for(const s of owned){s.hitM=s.hitM||new Set();}
 // 把帶強化的 Command 子彈取出，由新命中集合處理。
 this.skillShots=this.skillShots.filter(s=>!s.mCommand);
 baseShots.call(this,dt);
 for(const s of owned){s.t-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;for(const e of this.enemies){if(e.dead||s.hitM.has(e.id)||!hit(s,e))continue;s.hitM.add(e.id);this.damageEnemy(e,s.damage,sign(s.vx)*120,s.commandDef?.ky||-90,{...s.commandDef,mCommand:true,master:{command:true,element:s.mElement,power:1,rank:0},br:18,kd:8});if(s.pierce>0)s.pierce--;else s.t=0;break;}if(s.t>0)this.skillShots.push(s);}
 for(const s of this.summons){if(s.rallyUntil>this.time&&s.rally){s.x=s.rally.x;s.y=s.rally.y-35;}if(s.type==='star'){this.gravityPull(s.x,s.y,200,330*dt);}}
 if(this.overloadM>0)for(const t of this.turrets)t.cool-=dt*.5;
};
const baseSummonHit=P.summonStrike;
P.summonStrike=function(s,e,dmg){if(!e||e.dead)return;const ctx=s.masterCtx||{element:s.type==='owl'?'wind':'light',power:1,skill:'summoner_'+(s.type==='fox'?'fox':'owl'),br:12};this.damageEnemy(e,dmg,sign(cx(e)-s.x)*80,s.type==='owl'?-380:-65,{master:ctx,kd:4,br:12});this.mVisual('summon',cx(e),cy(e),75,s.color,.23);this.mEmit('summonHit',{type:s.type,enemy:e.id});};
// ── 換位共鳴：先換位再接技能的 2.4 秒窗口，不限制無共鳴的正常施放。 ──
const baseSwap=P.swapElement;
P.swapElement=function(target,el,i){const x=this.player.x,y=this.player.y;baseSwap.call(this,target,el,i);this.player.attack=null;this.player.buffer=null;this.player.castT=Math.min(this.player.castT,.055);this.resonanceM={element:el.id,until:this.time+2.4};this.mEmit('swap',{element:el.id,kind:target.kind,dx:this.player.x-x,dy:this.player.y-y});};
// 安全落點先驗證所有碰撞，避免站到窄平台邊緣時仍嵌入旁牆。
const baseSafe=P.findSafePosition;
P.findSafePosition=function(x,y,w,h){const q=baseSafe.call(this,x,y,w,h);const solids=this.activePlatforms({x:q.x,y:q.y,w,h});if(!solids.some(s=>hit({...q,w,h},s)))return q;
 for(const dy of [-12,-36,-72,-120,-180])for(const dx of [0,-55,55,-110,110]){const t={x:clamp(q.x+dx,5,C.WORLD_W-w-5),y:Math.max(0,q.y+dy),w,h};if(!solids.some(s=>hit(t,s)))return {x:t.x,y:t.y};}
 return {x:this.player?.checkpoint?.x||C.START_X,y:this.player?.checkpoint?.y||C.START_Y};};
// ── 德魯伊真正方向飛行 + 同形態不同打擊幾何。 ──
P.setFormM=function(form){if(!['wolf','eagle','bear','king'].includes(form))return;this.player.form=form;this.applyBeastForm();this.mEmit('form',{form});};
P.applyBeastForm=function(){const p=this.player,foot=p.y+p.h,middle=cx(p),dims={wolf:[48,45],eagle:[46,40],bear:[58,62],king:[60,64]};[p.w,p.h]=dims[p.form]||dims.wolf;p.x=middle-p.w/2;p.y=foot-p.h;
 // 不把鷹切形時強行吸回附近樓面，只處理實際重疊。
 const probe={x:p.x,y:p.y,w:p.w,h:p.h};if(this.activePlatforms(p).some(s=>!s.oneWay&&hit(probe,s))){const q=this.findSafePosition(p.x,p.y,p.w,p.h);p.x=q.x;p.y=q.y;}
};
const baseMove=P.moveBody;
P.moveBody=function(b,dt,opts={}){
 if(b===this.player){const p=b,fly=p.classId==='beast'&&['eagle','king'].includes(p.form)&&p.downT<=0&&!this.diveM;
  if(fly&&this.key('jump')&&!this.nearLadder(p)){
   const xx=(this.key('right')?1:0)-(this.key('left')?1:0),yy=(this.key('down')?1:0)-(this.key('up')?1:0),speed=this.flightM>0?285:225;
   p.vx=approach(p.vx,xx*speed,1800*dt);p.vy=approach(p.vy,yy*speed,2200*dt);p.onGround=false;p.airDashes=Math.max(1,p.airDashes);
   if(xx)p.dir=xx;this.mEmit('flight',{dy:p.vy*dt,vy:p.vy});
  }else if(fly&&!p.onGround&&p.vy>0)p.vy=Math.min(p.vy,135);
  if(this.hoverM>0&&p.downT<=0&&!this.diveM)p.vy=clamp(p.vy,-110,45);
 }
 return baseMove.call(this,b,dt,opts);
};
const basePlayer=P.updatePlayer;
P.updatePlayer=function(dt){
 const p=this.player;const beforeY=p.y;
 basePlayer.call(this,dt);
 if(this.diveM&&(p.onGround||this.diveM.until<this.time)){
  const a=this.diveM;this.diveM=null;this.mArea(cx(p),p.y+p.h,a.s.range||220,a.s.damage,a.ctx,{big:true,ky:-320,visual:'quake'});
  if(p.classId==='beast'){p.vy=-370;p.onGround=false;}this.mEmit('landSlam',{y:p.y});
 }
 if(p.form==='eagle'&&p.y<beforeY)this.flightHeightM=(this.flightHeightM||0)+(beforeY-p.y);
 if(this.pendingM&&p.downT<=0&&p.castT<=0&&(!p.attack||p.attack.elapsed>=p.attack.def.cancel)){
  const q=this.pendingM;this.pendingM=null;if(q.until>=this.time){if(q.kind==='command')this.commandInput(q.token);else this.useSkill(q.slot);}
 }
 if(this.pendingM&&this.pendingM.until<this.time)this.pendingM=null;
};
const baseQ=P.useClassSkill;
P.useClassSkill=function(){const p=this.player;if(p.downT>0||p.qCD>0)return;
 if(p.classId==='alchemist'){p.qCD=.65;this.mArea(cx(p),cy(p),180,18,{element:this.currentElement,power:1,rank:0,skill:'alchemist_q',br:20});this.commandLabel='Q・元素調律震盪';this.commandT=1;}
 else if(p.classId==='monk'){p.qCD=.6;p.parry=.38;this.parryCtxM={element:'lightning',power:1,skill:'monk_counter',br:45};this.parryDamageM=32;this.mVisual('guard',cx(p),cy(p),115,colors.lightning,.4);}
 else {const beforeForm=p.form;baseQ.call(this);if(p.classId==='beast'&&p.form!==beforeForm)this.mEmit('form',{form:p.form});}
};
const baseHurt=P.hurtPlayer;
P.hurtPlayer=function(dmg,kx,ky,source,dot=false){
 const p=this.player,parry=p.parry>0&&!dot;const hp=p.hp;
 baseHurt.call(this,dmg,kx,ky,source,dot);
 if(parry&&p.parry===0){const ctx=this.parryCtxM||{element:'lightning',power:1,skill:'warden_guard',br:50};this.mArea(cx(p),cy(p),210,this.parryDamageM||20,ctx,{big:true,ky:-220});p.airDashes=Math.max(p.airDashes,1);this.mEmit('parry',{});}
 if(this.trainingM&&p.hp<hp){p.hp=p.maxHp;p.downT=0;this.say('練習模式不會死亡｜觀察預警，對準時機重試',1.3);}
};
const baseRespawn=P.respawn;
P.respawn=function(reason){this.tasksM=[];this.masterFields=[];this.masterMissiles=[];this.pendingM=null;this.linkM=null;this.diveM=null;this.epochM++;baseRespawn.call(this,reason);};
// ── 十職課程：不是純文字列表。命中／共鳴／飛行／格擋事件驅動進度。 ──
const PRACTICE={
 rift:{slots:['rift_step','rift_rise','rift_cross','rift_anchor','rift_behind','rift_finish'],hint:'C 裂步三連：貼近傀儡後三段命中。→ 移動靠近；C 起手後可接 V 挑空。'},
 summoner:{slots:['summoner_fox','summoner_owl','summoner_lance','summoner_order','summoner_exchange','summoner_guard'],hint:'C 狐／V 鴞各召一隻，等待合計 3 次契靈命中；重複召喚同類仍只一隻。'},
 beast:{slots:['beast_flight','beast_palm','beast_claw','beast_feather','beast_dive','beast_roar'],hint:'C 切鷹 → 按住 SPACE＋↑ 上升至少 200px；再 V 切熊，同一次震地打到兩個傀儡。'},
 artificer:{slots:['artificer_turret','artificer_step','artificer_gear','artificer_rail','artificer_coil','artificer_hook'],hint:'C 放砲台 → V 磁浮踏台；讓自己升到 140px 高處，砲台留在地面。'},
 gunner:{slots:['gunner_shot','gunner_rocket','gunner_slug','gunner_fan','gunner_barrage','gunner_grenade'],hint:'V 火箭上升後 C 空中反衝射擊，至少兩枚彈命中傀儡。'},
 warden:{slots:['warden_guard','warden_spear','warden_rush','warden_fort','warden_quake','warden_anchor'],hint:'看教練紅彈接近身體時按 C；0.38 秒內被打才算精準格擋，不是空放 C。'},
 chrono:{slots:['chrono_anchor','chrono_echo','chrono_lift','chrono_seal','chrono_stop','chrono_shard'],hint:'C 記時間錨 → 左右走 100px → 再 C 返回；再用 V 讓延遲回響命中。'},
 harrier:{slots:['harrier_hook','harrier_swing','harrier_spiral','harrier_rising','harrier_scythe','harrier_anchor'],hint:'C 拉近傀儡後 V 擺盪踢實際命中；不要只對空施放。'},
 alchemist:{slots:['alchemist_mist','alchemist_spark','alchemist_burn','alchemist_gravity','alchemist_seed','alchemist_ice'],hint:'C 水瓶命中同一傀儡 → V 電解彈再命中，觸發濕潤導電。'},
 monk:{slots:['monk_jab','monk_spin','monk_rise','monk_counter','monk_step','monk_drop'],hint:'貼近後 V 旋風連踢，1 秒內讓四段都命中；接 C 穿入敵人身側。'}
};
const DAMAGE_SKILL={rift:'rift_step',summoner:'summoner_lance',beast:'beast_palm',artificer:'artificer_gear',gunner:'gunner_shot',warden:'warden_rush',chrono:'chrono_shard',harrier:'harrier_scythe',alchemist:'alchemist_spark',monk:'monk_spin'};
P.startTraining=function(cls){
 if(!C.CLASSES[cls])return;
 if(this.trainingM)this.endTraining();
 const p=this.player,returnState={x:p.x,y:p.y,classId:p.classId,checkpoint:{...p.checkpoint},hp:p.hp,page:this.mState().skillPage};
 this.changeClass(cls);this.progress.classId=returnState.classId;const r=this.roomById.get('t_'+cls);
 this.clearMasterScene();
 this.trainingM={classId:cls,room:r.id,step:0,started:this.time,returnState,loadout:PRACTICE[cls].slots.slice(),branches:{},follows:{},flags:{},inputStart:0,flightGain:0,branchChosen:false,shotsAt:0,stageAt:this.time};
 for(const s of DATA[cls]){this.trainingM.branches[s.id]='A';this.trainingM.follows[s.id]=s.recommendedFollow;}
 this.mState().skillPage=0;this.currentRoomId=r.id;this.currentRegion=r.region;
 this.resetPracticeActors();
 this.renderSkillBar();this.closeModalsM();this.say(`研習開始｜${SCHOOLS[cls][1]}。按 Backspace 可隨時返回。`,3);
};
P.clearMasterScene=function(){this.tasksM=[];this.masterFields=[];this.masterMissiles=[];this.epochM++;this.elementShots=[];this.skillShots=[];this.enemyShots=[];this.fields=[];this.summons=[];this.turrets=[];this.pendingM=null;this.linkM=null;this.resonanceM=null;this.diveM=null;this.cooldownsM={};};
P.resetPracticeActors=function(){
 const t=this.trainingM;if(!t)return;const r=this.roomById.get(t.room),p=this.player;
 this.enemies=this.enemies.filter(e=>!e.practiceM);
 // 靶子集中但不重疊，熊一次震地可同時覆蓋；可見浮空與推移。
 for(let i=0;i<3;i++){const e=this.spawnEnemy('dummy',r.x+760+i*95,r.floorY,{room:r.id,hp:10000});e.practiceM=true;e.homePractice={x:e.x,y:e.y};}
 const pos=this.findSafePosition(r.x+660,r.floorY-80,p.w,p.h);p.x=pos.x;p.y=pos.y;p.vx=p.vy=0;p.hp=p.maxHp;p.inv=1;p.downT=0;p.onGround=true;p.recoverT=0;p.parry=0;p.hurtT=0;p.attack=null;p.buffer=null;p.castT=0;p.history='';p.historyT=0;p.skillCD=[0,0,0];
 p.checkpoint={...pos,room:r.id};this.camera.x=clamp(p.x-this.viewW*.4,0,C.WORLD_W-this.viewW);this.camera.y=clamp(p.y-this.viewH*.60,0,C.WORLD_H-this.viewH);
 t.baseY=p.y;t.baseX=p.x;t.flightGain=0;t.flags={};t.stageAt=this.time;t.branchChosen=false;t.doneTimer=null;this.combo.hits=0;this.combo.t=0;
};
P.trainingTask=function(){const t=this.trainingM;if(!t)return null;const phase=t.step;
 const task=[
  ['01｜Z → Z → X 挑空','靠近藍色傀儡後：Z、Z、X。判定必須是 ZZX 命中並向上擊飛。'],
  ['02｜'+SCHOOLS[t.classId][2],PRACTICE[t.classId].hint],
  ['03｜換位 → 技能共鳴','按 1 發射 → 再按 1 換位；2.4 秒內 C 命中。不是只按鍵，要打到傀儡。'],
  ['04｜切換強化分支','L 開工坊，選第一個 C 技能按 K 切 B 分支；關閉後 C 命中。教場暫借等級 1，不扣點。'],
  ['05｜主技能 → 追擊技能','C 施放後 0.14–1 秒內再按 C，觸發目前設定的追擊；追擊必須命中。'],
  ['06｜完整一套接招','6 秒內：Z 命中 → 1→1 換位 → C 主技能 → 再 C 追擊命中；可移動和跳躍調整位置。'],
  ['研習完成','第一次完成此職業課程獎勵 4 專精點。Backspace 回到原探索位置；T 可挑其他職業。']
 ];return task[Math.min(phase,6)];};
P.checkLessonM=function(type,d){const t=this.trainingM;if(!t||t.step>=6||t.doneTimer)return;const p=this.player,f=t.flags;
 if(type==='hit'&&d.enemy){const e=this.enemies.find(q=>q.id===d.enemy);if(!e?.practiceM)return;}
 let done=false;
 if(t.step===0&&type==='hit'&&d.key==='ZZX'&&d.airborne)done=true;
 if(t.step===1){
  const cls=t.classId;
  if(cls==='rift'&&type==='hit'&&d.skill==='rift_step')done=(f.hits=(f.hits||0)+1)>=3;
  if(cls==='summoner'&&type==='summonHit'){f.hits=(f.hits||0)+1;done=this.summons.length>=2&&f.hits>=3;}
  if(cls==='beast'){
   if(type==='flight'&&d.dy<0){t.flightGain-=d.dy;if(t.flightGain>=200)f.flew=true;}
   if(type==='hit'&&p.form==='bear'){if(!f.bearTime||this.time-f.bearTime>.2){f.bearHits=[];f.bearTime=this.time;}f.bearHits=[...new Set([...(f.bearHits||[]),d.enemy])];if(f.bearHits.length>=2)f.bear=true;}
   done=!!(f.flew&&f.bear);
  }
  if(cls==='artificer'&&type==='tick')done=this.turrets.length>0&&t.baseY-p.y>140;
  if(cls==='gunner'&&type==='hit'&&d.skill==='gunner_shot'&&d.airborneCast)done=(f.shots=(f.shots||0)+1)>=2;
  if(cls==='warden'&&type==='parry')done=true;
  if(cls==='chrono'){if(type==='rewind'&&d.distance>=80)f.returned=true;if(type==='hit'&&d.skill==='chrono_echo')f.echo=true;done=!!(f.returned&&f.echo);}
  if(cls==='harrier'){if(type==='pull')f.pulled=true;if(type==='hit'&&d.skill==='harrier_swing'&&f.pulled)done=true;}
  if(cls==='alchemist'&&type==='hit'){if(d.element==='water')f.wetEnemies=[...new Set([...(f.wetEnemies||[]),d.enemy])];if(d.element==='lightning'&&(f.wetEnemies||[]).includes(d.enemy))done=true;}
  if(cls==='monk'&&type==='hit'&&d.skill==='monk_spin'){if(!f.hitAt||this.time-f.hitAt>1){f.count=0;f.hitAt=this.time;}done=(f.count=(f.count||0)+1)>=4;}
 }
 if(t.step===2&&type==='hit'&&d.resonance)done=true;
 if(t.step===3&&t.branchChosen&&type==='hit'&&d.skill===t.loadout[0]&&this.mBranch(d.skill)==='B')done=true;
 if(t.step===4&&type==='hit'&&d.linked)done=true;
 if(t.step===5){
  if(type==='hit'&&d.command){f.started=this.time;f.command=true;f.swapped=false;}
  if(f.command&&this.time-f.started<=6){if(type==='swap')f.swapped=true;if(type==='hit'&&d.linked&&f.swapped)done=true;}
 }
 if(done){t.doneTimer=this.time+.72;this.say('✓ 判定成功｜'+this.trainingTask()[0],1.5,'#a6f0b8');this.sfx.collect();}
};
P.nextLessonM=function(){
 const t=this.trainingM;if(!t)return;t.step++;this.clearMasterScene();this.resetPracticeActors();
 if(t.step>=2){const dmg=DAMAGE_SKILL[t.classId],next=DATA[t.classId].find(s=>s.mode==='launch')?.id||DATA[t.classId].find(s=>s.mode==='volley')?.id;
  const idx=t.loadout.indexOf(dmg);if(idx>=0)[t.loadout[0],t.loadout[idx]]=[t.loadout[idx],t.loadout[0]];else t.loadout[0]=dmg;
  t.follows[dmg]=next&&next!==dmg?next:(DATA[t.classId].find(s=>s.id!==dmg&&['spin','volley','wave','rail','boomerang'].includes(s.mode))||DATA[t.classId].find(s=>s.id!==dmg)).id;
 }
 if(t.step===6){this.mState().lessons[t.classId]=true;if(this.mAward('lesson:'+t.classId,4,60))this.say('研習初次完成｜+4 專精點，原探索進度保留',4,'#e8d480');}
 this.renderSkillBar();
};
P.endTraining=function(){const t=this.trainingM;if(!t)return;const ret=t.returnState;this.trainingM=null;this.clearMasterScene();this.enemies=this.enemies.filter(e=>!e.practiceM);this.changeClass(ret.classId);this.mState().skillPage=ret.page;
 const p=this.player;p.x=ret.x;p.y=ret.y;p.vx=p.vy=0;p.hp=Math.min(p.maxHp,ret.hp);p.checkpoint=ret.checkpoint;p.inv=1;this.updateCamera(1);this.renderSkillBar();this.closeModalsM();this.saveProgress();};
const baseEnemyUpdate=P.updateEnemies;
P.updateEnemies=function(dt){
 if(this.trainingM){
  for(const e of this.enemies.filter(e=>e.practiceM)){
   for(const k of ['stun','freeze','root','burn','curse','wet','armorBreak','markT','downT','hitFlash'])e[k]=Math.max(0,(e[k]||0)-dt);
   if(e.markT<=0)e.mark=null;e.vy+=C.PHYSICS.gravity*dt;this.moveBody(e,dt,{enemy:true});e.vx*=Math.pow(.04,dt);
   if(Math.hypot(e.x-e.homePractice.x,e.y-e.homePractice.y)>540||e.y>this.roomById.get(this.trainingM.room).floorY){e.x=e.homePractice.x;e.y=e.homePractice.y;e.vx=e.vy=0;}
   if(e.onGround)e.airborne=false;e.hp=e.maxHp;
  }
  return;
 }
 if(this.eastBoss&&!this.eastBoss.dead&&this.currentRoomId==='e15')this.eastBoss.bossAwake=true;
 baseEnemyUpdate.call(this,dt);
};
// ── 世界首解與有用途的收藏；不改舊收藏品形狀與分佈。 ──
const baseCollect=P.collect;
P.collect=function(c){const was=c.taken;baseCollect.call(this,c);if(!was&&c.taken)this.mAward('collect:'+c.id,3,20);};
const baseUseNPC=P.useNPC;
P.useNPC=function(n){if(n.role==='masterMentor'){this.openSchools();return;}baseUseNPC.call(this,n);};
const baseInteract=P.interact;
P.interact=function(){const cache=this.masterCaches?.find(c=>!this.mState().claims[c.id]&&distance(this.player,c)<100);if(cache){this.mAward(cache.id,4,25);this.say('共鳴研究匣｜+4 專精點；L 自由選擇強化分支',2.5,'#f5d893');return;}baseInteract.call(this);};
// ── 更新掛點：只在同一遊戲迴圈中工作。 ──
const baseUpdate=P.update;
P.update=function(dt,ts){
 for(const k of ['flightM','hoverM','hasteM','overloadM'])this[k]=Math.max(0,(this[k]||0)-dt);
 const page=this.mState().skillPage,load=this.mLoadout();this.player.skillCD=[0,1,2].map(i=>Math.max(0,(this.cooldownsM[load[i+page*3]]||0)-this.time));
 baseUpdate.call(this,dt,ts);
 const pending=this.tasksM;this.tasksM=[];for(const task of pending){if(task.epoch!==this.epochM)continue;if(task.at<=this.time)task.fn();else this.tasksM.push(task);}
 this.tickMasterCombat(dt);
 const t=this.trainingM;
 if(t){
  this.checkLessonM('tick',{});
  if(t.doneTimer&&this.time>=t.doneTimer)this.nextLessonM();
  if(t.step===1&&t.classId==='warden'&&this.time-t.shotsAt>2.8){const p=this.player;t.shotsAt=this.time;this.enemyShots.push({id:this.id(),type:'arrow',x:p.x+235,y:cy(p)-10,w:20,h:20,vx:-175,vy:0,t:4,warmup:.55,damage:5,owner:'教練練習彈',color:'#e49e6f',gravity:0,friendly:false});}
  const r=this.roomById.get(t.room);if(this.player.x<r.x||this.player.x>r.x+r.w||this.player.y>r.floorY+100){this.player.x=r.x+660;this.player.y=r.floorY-this.player.h-4;this.player.vx=this.player.vy=0;}
 }
 if(this.time>this.nextSaveM){this.nextSaveM=this.time+5;this.saveProgress();}
 this.updateMasterHUD();
};

// ── 技能工坊：12 選 6，兩頁 C/V/B，共用同一個技能冷卻時間表。 ──
P.closeModalsM=function(){for(const e of document.querySelectorAll('.modal'))e.hidden=true;this.input.held.clear();this.input.pressed.clear();$('#game').focus();};
P.openMastery=function(){this.closeModalsM();this.masterSelection=this.trainingM?.step===3?Math.max(0,DATA[this.player.classId].findIndex(s=>s.id===this.mLoadout()[0])):this.masterSelection||0;$('#masteryPanel').hidden=false;this.renderMastery();};
P.openSchools=function(){this.closeModalsM();this.schoolSelection=Object.keys(DATA).indexOf(this.player.classId);$('#schoolPanel').hidden=false;this.renderSchools();};
P.renderSkillBar=function(){
 const load=this.mLoadout(),page=this.mState().skillPage,cl=C.CLASSES[this.player.classId];
 cl.skills=load.slice(page*3,page*3+3).map(id=>[SKILLS[id].name,SKILLS[id].cd]);
 $('#skillBar').innerHTML=[...load.slice(page*3,page*3+3).map((id,i)=>[friendly(this.keys['skill'+(i+1)]),SKILLS[id].name,id]),[friendly(this.keys.classSkill),'職業 Q','q']].map(([k,name,id])=>`<div class="skill" data-skillid="${id}"><kbd>${k}</kbd><b>${name}</b><small>就緒</small></div>`).join('');
};
P.renderMastery=function(){
 const cls=this.player.classId,list=DATA[cls],m=this.mState(),idx=clamp(this.masterSelection||0,0,list.length-1),s=list[idx];this.masterSelection=idx;
 $('#masterTitle').textContent=C.CLASSES[cls].name+' · 技能工坊';$('#masterPoints').textContent=`專精 Lv.${m.level}　可用點數 ${m.points}${this.trainingM?'　｜教場暫借 Lv.1，不扣點':''}`;
 const load=this.mLoadout();$('#loadoutM').innerHTML=load.map((id,i)=>`<button type="button" class="equip-slot ${m.skillPage===Math.floor(i/3)?'page-active':''}" data-equip="${i}"><small>${i<3?'Ⅰ':'Ⅱ'} / ${['C','V','B'][i%3]}</small><b>${SKILLS[id].name}</b><span>按 ${i+1} 裝備選中技能</span></button>`).join('');
 $('#skillLibrary').innerHTML=list.map((a,i)=>{const rank=this.mRank(a.id),equip=load.indexOf(a.id);return `<button type="button" class="library-card ${i===idx?'selected':''}" data-selectskill="${i}" style="--skill-color:${colors[a.element]}"><small>${String(i+1).padStart(2,'0')} / ${C.ELEMENTS.find(e=>e.id===a.element)?.glyph||'技'}</small><b>${a.name}</b><span>${a.desc}</span><em>${a.cd.toFixed(2)}s · 強化 ${rank}/2 ${equip>=0?'· 已裝備 '+(equip<3?'Ⅰ':'Ⅱ')+[' C',' V',' B'][equip%3]:''}</em></button>`;}).join('');
 const rank=this.mRank(s.id),branch=this.mBranch(s.id),following=this.trainingM?.follows[s.id]||m.follows[s.id];
 $('#masterDetail').innerHTML=`<div class="detail-title"><small>SELECTED SKILL</small><h3>${s.name}</h3><p>${s.desc}</p></div><p>基礎傷害 ${s.damage}　冷卻 ${s.cd.toFixed(2)}s<br>強化等級 ${rank}/2；每級基礎傷害 +12%。A／B 同時只能啟用一條。</p>
 <button id="upgradeM" type="button" ${this.trainingM||rank>=2?'disabled':''}>U · ${rank>=2?'已達上限':'強化至 '+(rank+1)+' 級（'+(rank+1)+' 點）'}</button>
 <div class="branch-choices">${s.branches.map((b,i)=>`<button type="button" data-branch="${b.id}" class="${branch===b.id?'chosen':''}"><b>${i?'K':'J'} · ${b.id} ${b.name}</b><span>${b.desc}</span><small>${rank===0?'先升到 1 級才啟用；可先選分支':branch===b.id?'已啟用':'免費切換'}</small></button>`).join('')}</div>
 <label class="follow-label">追擊設定（O 輪替；或直接選擇）<select id="followM">${list.filter(a=>a.id!==s.id).map(a=>`<option value="${a.id}" ${a.id===following?'selected':''}>${a.name}</option>`).join('')}</select></label><p class="hint-M">施放後 0.14–1 秒再次按同一技能鍵，可接上述追擊。追擊使用自己的冷卻，不會免費洗 CD。</p>`;
 $('#commandInfusions').innerHTML=['raw','fire','lightning','ice'].map(b=>`<button data-infusion="${b}" type="button" class="${m.command[cls]===b?'chosen':''}">${{raw:'原型打擊',fire:'燃燒普攻',lightning:'麻痺普攻',ice:'寒霜普攻'}[b]}<small>${b==='raw'||m.claims['command:'+b]?'已解鎖 · 切换免費':'永久解鎖 2 點'}</small></button>`).join('');
 $('#masterHelp').textContent='↑↓←→ 選技能 · 1–6 裝槽 · U 強化 · J/K 分支 · O 追擊 · Esc 返回　｜升級點只用於永久成長，施放不消耗任何 MP。';
 $('#loadoutM').querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{this.equipMasterSkill(s.id,Number(b.dataset.equip));this.renderMastery();});
 $('#skillLibrary').querySelectorAll('[data-selectskill]').forEach(b=>b.onclick=()=>{this.masterSelection=Number(b.dataset.selectskill);this.renderMastery();});
 $('#upgradeM').onclick=()=>{this.upgradeMasterSkill(s.id);this.renderMastery();};
 $('#masterDetail').querySelectorAll('[data-branch]').forEach(b=>b.onclick=()=>{this.chooseMasterBranch(s.id,b.dataset.branch);this.renderMastery();});
 $('#followM').onchange=e=>{if(this.trainingM)this.trainingM.follows[s.id]=e.target.value;else m.follows[s.id]=e.target.value;this.saveProgress();};
 $('#commandInfusions').querySelectorAll('[data-infusion]').forEach(b=>b.onclick=()=>{if(!this.setCommandBranch(b.dataset.infusion))this.say('專精點不足；先完成一門研習可得 4 點',2);this.renderMastery();});
};
P.renderSchools=function(){
 const ids=Object.keys(DATA);$('#schoolGrid').innerHTML=ids.map((cls,i)=>{const q=SCHOOLS[cls],clear=this.mState().lessons[cls];return `<button class="school-card ${i===this.schoolSelection?'selected':''}" data-school="${cls}"><small>${clear?'✓ 已結業':'六段實戰判定 · 首通 +4 點'}</small><b>${q[1]}</b><strong>${q[0]}</strong><span>${q[2]}</span><em>12 技能 / 個別教場 / 暫借強化裝備</em></button>`;}).join('');
 $('#schoolGrid').querySelectorAll('[data-school]').forEach(b=>b.onclick=()=>this.startTraining(b.dataset.school));
 $('#schoolReturn').hidden=!this.trainingM;
};
P.cycleFollowM=function(){const s=DATA[this.player.classId][this.masterSelection],choices=DATA[this.player.classId].filter(x=>x.id!==s.id),m=this.mState(),old=this.trainingM?.follows[s.id]||m.follows[s.id],id=choices[(choices.findIndex(x=>x.id===old)+1)%choices.length].id;if(this.trainingM)this.trainingM.follows[s.id]=id;else m.follows[s.id]=id;this.saveProgress();this.renderMastery();};
const baseBindUI=P.bindUI;
P.bindUI=function(){baseBindUI.call(this);$('#masteryButton').onclick=()=>this.openMastery();$('#schoolButton').onclick=()=>this.openSchools();
 $('#masterClose').onclick=()=>this.closeModalsM();$('#schoolClose').onclick=()=>this.closeModalsM();$('#schoolReturn').onclick=()=>this.endTraining();
 $('#lessonRepeat').onclick=()=>{if(this.trainingM){this.clearMasterScene();this.resetPracticeActors();this.renderSkillBar();}};
 $('#lessonReturn').onclick=()=>this.endTraining();
 $('#exportM').onclick=()=>{const p=JSON.stringify(this.progress,null,2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([p],{type:'application/json'}));a.download='elemental-swap-v10-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
 $('#importM').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>500000)throw Error('檔案太大');const val=JSON.parse(await file.text());if(!val||typeof val!=='object'||!val.mastery)throw Error('不是 V10 存檔');if(this.trainingM)this.endTraining();this.progress={...this.defaultProgress(),...val,mastery:normalMaster(val.mastery)};if(!C.CLASSES[this.progress.classId])this.progress.classId='rift';this.changeClass(this.progress.classId);this.saveProgress();this.renderMastery();this.say('存檔匯入成功；已保存，重新整理可套用全部世界狀態',3);}catch(err){this.say('匯入失敗：'+err.message,3);}finally{e.target.value='';}};
 // 在 capture 階段接走選單按鍵，避免改分支時順便向傀儡射彈。
 window.addEventListener('keydown',e=>{
  const master=!$('#masteryPanel').hidden,school=!$('#schoolPanel').hidden;if(!master&&!school)return;
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement){e.stopPropagation();if(e.code==='Escape'){e.preventDefault();this.closeModalsM();}return;}
  if(e.code==='Tab')return;e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'){this.closeModalsM();return;}
  if(school){const ids=Object.keys(DATA);if(e.code==='ArrowRight'||e.code==='ArrowDown')this.schoolSelection=(this.schoolSelection+1)%ids.length;else if(e.code==='ArrowLeft'||e.code==='ArrowUp')this.schoolSelection=(this.schoolSelection+ids.length-1)%ids.length;else if(e.code==='Enter')return this.startTraining(ids[this.schoolSelection]);this.renderSchools();return;}
  const list=DATA[this.player.classId],len=list.length;if(e.code==='ArrowRight')this.masterSelection=(this.masterSelection+1)%len;else if(e.code==='ArrowLeft')this.masterSelection=(this.masterSelection+len-1)%len;else if(e.code==='ArrowDown')this.masterSelection=(this.masterSelection+2)%len;else if(e.code==='ArrowUp')this.masterSelection=(this.masterSelection+len-2)%len;
  else {const s=list[this.masterSelection];if(/^Digit[1-6]$/.test(e.code))this.equipMasterSkill(s.id,Number(e.code.slice(-1))-1);if(e.code==='KeyU'&&!this.trainingM)this.upgradeMasterSkill(s.id);if(e.code==='KeyJ')this.chooseMasterBranch(s.id,'A');if(e.code==='KeyK')this.chooseMasterBranch(s.id,'B');if(e.code==='KeyO')return this.cycleFollowM();}this.renderMastery();
 },true);
};
// 新職業保留原 Sprite 切格。切職業只清除執行中的技能，不會清除技能 CD。
const baseClass=P.changeClass;
P.changeClass=function(id){if(!C.CLASSES[id])return;this.tasksM=[];this.masterFields=[];this.masterMissiles=[];this.pendingM=null;this.linkM=null;this.epochM=(this.epochM||0)+1;this.masterSelection=0;baseClass.call(this,id);this.progress.classId=this.trainingM?this.trainingM.returnState.classId:id;$('#classSelect').value=id;};
const baseState=P.classStateText;
P.classStateText=function(){const id=this.player.classId;if(id==='rift')return 'RESONANCE / 空中刷新';if(id==='summoner')return `契靈 ${this.summons.length}/4 唯一`;if(id==='alchemist')return 'CATALYST / 異常反應';if(id==='monk')return 'COMBO / 拳勢';return baseState.call(this);};
const baseObjective=P.currentObjective;
P.currentObjective=function(){if(this.trainingM)return this.trainingTask();if(this.currentRoomId==='e15')return ['東境 BOSS｜熔鑄監察者','保留迴避空間，冰／岩削 BREAK；換位共鳴後接續技能輸出。'];return baseObjective.call(this);};
const baseTutorial=P.updateTutorial;
P.updateTutorial=function(){if(!this.trainingM)baseTutorial.call(this);};
const baseUI=P.updateUI;
P.updateUI=function(){baseUI.call(this);this.updateMasterHUD();};
P.updateMasterHUD=function(){
 const m=this.mState(),p=this.player,load=this.mLoadout(),page=m.skillPage;
 $('#deckIndicator').textContent=`${page?'Ⅱ':'Ⅰ'} 技能頁 · F 切頁 · L 工坊 · T 研習　｜專精 ${m.points} 點${this.saveBlocked?' · 瀏覽器停用存檔，請 L 匯出備份':''}`;
 $('#lessonHUD').hidden=!this.trainingM;
 if(this.trainingM){const t=this.trainingM,task=this.trainingTask();$('#lessonTitle').textContent=SCHOOLS[t.classId][1]+' · '+task[0];$('#lessonHint').textContent=task[1];$('#lessonSteps').innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<t.step?'passed':i===t.step?'current':''}">${i+1}</i>`).join('');$('#threatText').textContent='TRAINING｜傀儡不死 · 無傷害 · Backspace 返回';$('#threatText').className='threat safe';}
 const link=this.linkM&&this.linkM.until>this.time?this.linkM:null;
 const res=this.resonanceM&&this.resonanceM.until>this.time?this.resonanceM:null;
 $('#resonanceHint').textContent=link?`接續窗口 ${Math.max(0,link.until-this.time).toFixed(1)}s｜再按 ${['C','V','B'][link.slot]} → ${SKILLS[link.next].name}`:res?`換位共鳴 ${Math.max(0,res.until-this.time).toFixed(1)}s｜下個技能追加 ${C.ELEMENTS.find(e=>e.id===res.element)?.name}`:'換位後 2.4 秒內接技能 → 帶入該元素異常；主技能後同鍵再按 → 追擊';
 $('#resonanceHint').classList.toggle('live',!!link||!!res);
 $('#skillBar').querySelectorAll('.skill').forEach((n,i)=>{if(i>=3)return;const id=load[page*3+i],cd=Math.max(0,(this.cooldownsM[id]||0)-this.time);n.classList.toggle('cooling',cd>0);n.classList.toggle('link-ready',!!link&&link.slot===i&&link.page===page);n.querySelector('small').textContent=link&&link.slot===i&&link.page===page?'再按接續':cd>0?cd.toFixed(1)+'s':'就緒 · '+this.mBranch(id);});
 if(this.currentRoomId==='e15'){const b=this.eastBoss;$('#bossHUD').classList.toggle('show',!!b&&!b.dead);$('#bossHUD b').textContent='熔鑄監察者・雙相';if(b){$('#bossHpFill').style.width=clamp(b.hp/b.maxHp*100,0,100)+'%';$('#bossBreakFill').style.width=clamp(b.break/b.breakMax*100,0,100)+'%';$('#bossPhase').textContent='PHASE '+b.phase;}}
 else $('#bossHUD b').textContent='十相哨兵・赫利俄斯';
};
const baseNear=P.updateInteractions;
P.updateInteractions=function(){baseNear.call(this);const c=this.masterCaches?.find(c=>!this.mState().claims[c.id]&&distance(this.player,c)<100);if(c)this.nearInteract={kind:'masterCache',ref:c,label:'共鳴研究匣｜4 專精點'};};
// ── 視覺保持既有背景／平台；只在命中點疊加短暫細線，不蓋滿畫面。 ──
const baseEffects=P.drawEffects;
P.drawEffects=function(ctx){
 const all=this.effects;this.effects=all.filter(e=>e.type!=='masterVFX');baseEffects.call(this,ctx);this.effects=all;
 for(const e of all.filter(e=>e.type==='masterVFX')){
  if(e.x<this.camera.x-450||e.x>this.camera.x+this.viewW+450||e.y<this.camera.y-450||e.y>this.camera.y+this.viewH+450)continue;
  const a=clamp(e.t/e.max,0,1),r=e.r*(.35+.65*(1-a));ctx.save();ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=2+4*a;ctx.globalAlpha=.2+.65*a;
  if(e.kind==='slash'){ctx.translate(e.x,e.y);ctx.scale(e.dir||1,1);ctx.beginPath();ctx.ellipse(0,0,r*.75,r*.38,-.3,-1.7,1.3);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r*.56,r*.25,-.3,-1.4,1.2);ctx.stroke();}
  else if(e.kind==='quake'){ctx.beginPath();ctx.ellipse(e.x,e.y,r,r*.18,0,0,Math.PI*2);ctx.stroke();for(let j=0;j<8;j++){const x=e.x+(j-3.5)*r*.24;ctx.fillRect(x,e.y-18*a*(j%3+1),5,12*a);}}
  else if(e.kind==='updraft'){for(let j=-1;j<=1;j++){ctx.beginPath();ctx.moveTo(e.x+j*30,e.y+60);ctx.quadraticCurveTo(e.x+j*100,e.y,e.x+j*18,e.y-r*.9);ctx.stroke();}}
  else if(e.kind==='summon'){ctx.beginPath();for(let j=0;j<5;j++){const t=j/5*Math.PI*2-this.time*.2;ctx.lineTo(e.x+Math.cos(t)*r*.6,e.y+Math.sin(t)*r*.6);}ctx.closePath();ctx.stroke();}
  else{ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.stroke();}ctx.restore();
 }
 for(const b of this.masterMissiles){ctx.save();ctx.strokeStyle=b.color||'#bcf5e7';ctx.lineWidth=b.mode==='rail'?8:3;ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(b.x-b.vx*.065,b.y-b.vy*.065);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=b.color||'#bbedec';ctx.fillRect(b.x-7,b.y-5,14,10);ctx.fillStyle='#f7ffff';ctx.fillRect(b.x-3,b.y-3,5,4);if(b.mode==='grenade'){ctx.strokeStyle=b.color;ctx.strokeRect(b.x-11,b.y-10,22,20);}ctx.restore();}
 for(const f of this.masterFields){ctx.save();ctx.strokeStyle=colors[f.ctx.element]||'#a8f7d6';ctx.lineWidth=2;ctx.globalAlpha=.26;ctx.setLineDash(f.type==='stasis'?[8,8]:[]);ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.type==='mine'?35:f.r*.7,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.7;for(let n=0;n<5;n++){const angle=this.time+n*Math.PI*.4;const x=f.x+Math.cos(angle)*f.r*.72,y=f.y+Math.sin(angle)*f.r*.48;ctx.fillRect(x,y,4,4);}ctx.restore();}
 for(const c of this.masterCaches||[]){if(this.mState().claims[c.id])continue;ctx.save();ctx.fillStyle='#253e46';ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeStyle='#e4c178';ctx.lineWidth=3;ctx.strokeRect(c.x+3,c.y+4,c.w-6,c.h-8);ctx.fillStyle='#fbe4ab';ctx.fillRect(c.x+19,c.y+17,8,12);ctx.font='900 11px sans-serif';ctx.textAlign='center';ctx.fillText('研究匣',cx(c),c.y-9);ctx.restore();}
 for(const g of this.masterGates||[]){if(this.progress.solved[g.relay])continue;ctx.save();ctx.fillStyle='#609da583';ctx.fillRect(g.x,g.y,g.w,g.h);ctx.strokeStyle='#beefe8';ctx.setLineDash([8,6]);ctx.strokeRect(g.x,g.y,g.w,g.h);ctx.restore();}
 if(this.trainingM){const r=this.roomById.get(this.trainingM.room);ctx.save();ctx.fillStyle='#d2eeea';ctx.font='900 24px sans-serif';ctx.fillText(SCHOOLS[this.trainingM.classId][1],r.x+72,r.y+105);ctx.font='14px sans-serif';ctx.fillText('傀儡：命中確認／可挑空　　上方：自由飛行窗　　Backspace：返回',r.x+72,r.y+134);ctx.restore();}
};
const baseAnim=P.playerAnim;
P.playerAnim=function(p){if(p.castM&&p.castM.until>this.time&&!p.attack)return{row:clamp(p.castM.row,0,15),frame:Math.min(7,Math.max(0,Math.floor((.32-(p.castM.until-this.time))/.32*8)))};return baseAnim.call(this,p);};
const baseBackground=P.drawBackground;
P.drawBackground=function(ctx,w,h){const r=this.roomById.get(this.currentRoomId),reg=this.regionData(this.currentRegion),old=reg.palette;if(r?.expansion&&r.palette)reg.palette=r.palette;try{baseBackground.call(this,ctx,w,h);}finally{reg.palette=old;}};
// 原版音效保留；技能長連擊時不疊加全螢幕閃白。
window.ES10_MASTER={skills:SKILLS,schools:SCHOOLS,practice:PRACTICE,normalMaster};
})();
