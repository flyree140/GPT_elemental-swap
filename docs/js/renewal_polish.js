/* Integration invariants: input ownership, local environments, safe state changes. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES18,cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
// The original loop lost pointer releases occurring during hit-stop. Capture a
// skill on press, keep ownership until release, and never convert it to follow-up.
P.loop=function(ts){const dt=Math.min(.034,Math.max(0,(ts-this.last)/1000||0));this.last=ts;
 if(this.input.tap(this.keys.pause)&&!this.modalM()){this.paused=!this.paused;this.input.pressed.delete(this.keys.pause);if(this.paused)this.nCancelHolds();this.say(this.paused?'暫停｜P 繼續':'繼續',1);}
 const stopped=this.paused||this.modalM();if(!stopped){if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-dt);if(this.key('zAttack',true))this.pendingM={kind:'command',token:'Z',until:this.time+.26};if(this.key('xAttack',true)||this.key('xAttackAlt',true))this.pendingM={kind:'command',token:'X',until:this.time+.26};for(let i=0;i<5;i++)if(this.key('skill'+(i+1),true))this.useSkill(i);if(this.key('jump',true)||this.key('dash',true)){this.nCancelHolds();if(this.key('jump',true))this.player.jumpBuffer=.16;}this.nUpdateHUD();}else this.update(dt,ts);}else if(Object.keys(this.nInit().holds).length)this.nCancelHolds();
 this.render();this.input.end();requestAnimationFrame(t=>this.loop(t));};
const touch=P.xBindTouch;P.xBindTouch=function(root){touch.call(this,root);for(const b of root?.querySelectorAll('[data-touch]')||[]){if(b._cancel18)continue;b._cancel18=true;b.addEventListener('pointercancel',()=>this.nCancelHolds(),true);b.addEventListener('lostpointercapture',e=>{if(this.xInit().touches?.has(e.pointerId))this.nCancelHolds();},true);}};
const env=P.xEnvironment;P.xEnvironment=function(){const out=env.call(this),p=this.player,r=this.roomById.get(this.currentRoomId);if(r&&['reef','abyss'].includes(r.biome)&&(p.x+p.w<r.x-30||p.x>r.x+r.w+30||p.y+p.h<r.y-45||p.y>r.floorY+90)){out.water=out.pressure=false;out.speed=out.gravity=1;}if(this.nInit().thermalShelter>this.time)out.hot=false;return out;};
// Every permanent upper walkway can decay; the bedrock and structural floors do
// not. Restoration uses predicates, never deletion/recreation of actors or loot.
const build=P.buildWorld;P.buildWorld=function(){build.call(this);for(const p of this.platforms)if(p.oneWay&&!p.bed18&&!['roomFloor','shelterFloor'].includes(p.type)&&!this.roomById.get(p.room)?.shelter)p.decayAfter18=4+(Math.abs(Number(p.id)||p.x)%70)/10;
 // Historic / future structures in the original areas too, not just the annex.
 for(const r of this.rooms.filter(r=>!r.x17&&!r.shelter&&!r.id.startsWith('t_'))){this.n18.structures.push({id:'past18_'+r.id,x:r.x+r.w*.35,y:r.floorY-170,w:Math.min(370,r.w*.42),h:22,kind:'bridge',modes:['past'],oneWay:true,label:'過去・未斷的棧道',room:r.id},{id:'future18_'+r.id,x:r.x+r.w*.62,y:r.floorY-75,baseY:r.floorY-75,w:160,h:20,kind:'lift',modes:['future'],oneWay:true,label:'未來・運轉機台',room:r.id});}
 for(const npc of this.npcs)if(npc.role==='masterMentor')npc.text='T 開啟六階段實作研習：短按、長按、職業核心、Q 與世界組合。';};
const active=P.activePlatforms;P.activePlatforms=function(b){const mode=this._nMode||this.vInit().mode,age=this.time-this.nInit().ruleAt;return active.call(this,b).filter(s=>!(mode==='decay'&&s.decayAfter18&&age>=s.decayAfter18));};
const rooms=P.drawRooms;P.drawRooms=function(ctx){ctx.save();if(this.vInit().mode==='decay')ctx.globalAlpha=Math.max(.12,1-(this.time-this.nInit().ruleAt)/15);rooms.call(this,ctx);ctx.restore();};
// Instantly restore all render/collision predicates on returning from decay.
const backgrounds=P.drawForeground;P.drawForeground=function(ctx,w,h){backgrounds.call(this,ctx,w,h);const mode=this.vInit().mode;if(mode==='decay'){ctx.save();ctx.globalAlpha=.4;ctx.fillStyle='#e8ddbc';for(let i=0;i<55;i++){const x=(i*131+this.time*17)%w,y=(i*89-this.time*21)%h;ctx.fillRect(x,(y+h)%h,2+i%3,2);}ctx.restore();}};
const resp=P.respawn;P.respawn=function(...args){this.nDiscontinuity();this.nInit().objects=[];this.n18.shots=[];this.xInit().fields=[];return resp.call(this,...args);};
const d=P.nDiscontinuity;P.nDiscontinuity=function(...a){d.call(this,...a);this.nInit().elementBuilds=[];this.n18.job=null;this.n18.fx=[];this.n18.structures=this.n18.structures.filter(s=>!s.ability18&&!s.fungus18);};
const classAttack=P.classAttack;P.classAttack=function(...args){const def=classAttack.call(this,...args);if(this.nJob().id==='rift'&&this.nJob().noPush>this.time){def.kx=0;this.nJob().noPush=0;}return def;};
// A single source of truth for the more literal wording used in the cards.
C.CLASSES.alchemist.name='化學調律師';D.jobs.gunner.desc='四枚重彈；短按裝普通彈、長按裝破甲彈。射擊短按貫穿、長按散射。Z/X 是槍托，不發射。';D.jobs.sharpshooter.q='穩息：立即消除水平慣性，3 秒內加快站定專注';D.jobs.monk.q='0.6 秒反掌窗口，成功格擋回復一層氣息';D.jobs.rift.q='封刃：下一次普攻的水平推力歸零';
const q=P.useClassSkill;P.useClassSkill=function(){const ok=q.call(this);if(ok&&this.nJob().id==='sharpshooter')this.player.vx=0;return ok;};
const tick=P.nTickCombat;P.nTickCombat=function(dt){tick.call(this,dt);const j=this.nJob(),p=this.player;if(j.id==='sharpshooter'&&j.steady>this.time&&p.onGround&&Math.abs(p.vx)<10)j.meter=Math.min(3,j.meter+dt*.8);};
const desc=(cls,op,tap,hold)=>{const s=D.skills[cls].find(s=>s.op18===op);if(tap)s.desc=s.tap18=tap;if(hold)s.hold18=hold;};
desc('rift','rise','挑起前方敵人，角色留在原地。裂痕保留，之後可再收束。');desc('dreamweaver','seed',null,'長按：在準星方向 340px 內放置夢種；頭目只眠 0.6 秒。');desc('dreamweaver','garden',null,'長按：不加困意，改固定睡眠敵人的位置。受傷仍會醒來。');desc('dreamweaver','harvest','收割 340px 內帶困意或睡眠的敵人，消耗困意。');desc('alchemist','catalyst','使前方已沾試劑的敵人與當前試劑反應；先投瓶或元素命中。');desc('chef','chill','短暫定身身邊的濕敵，保存 3 層火候。');
const update=P.update;P.update=function(dt,ts){update.call(this,dt,ts);const t=this.n18?.tutorial;if(t&&!this.paused&&!this.modalM()){this.player.qCD=Math.min(this.player.qCD,2);}}
const bind=P.bindUI;P.bindUI=function(){bind.call(this);document.querySelector('#expeditionPanel .expedition-heading small').textContent='CLEARWORLD / FIELD JOURNAL 018';document.querySelector('#visionLive>small').textContent='V18 / NINE WORLDS · ONE TERRAIN';this.updateClassUI?.();this.renderSkillBar();document.querySelector('#visionNow')?.replaceChildren(document.createTextNode('返回當下／表世界'));};
P.updateTutorial=function(){};P.showComboLesson=function(){this.openSchools();};
P.vOpen=function(){this.closeModalsM();const panel=document.getElementById('visionPanel');panel.hidden=false;this.vRenderMenu();const inner=panel.querySelector('.panel');inner.scrollTop=0;panel.querySelector('.close')?.focus({preventScroll:true});this.nCancelHolds();};
P.vEnter=function(id){const aliases={forecast:'past',thermal:'heavy',scale:'elastic',slice:'inner'};if(id==='boss')return this.xTravel('v16_boss',true);return this.nStartTutorial('rule',aliases[id]||id||'echo');};
P.vLeave=function(){return this.nEndTutorial();};P.vLessonTick=function(){};
})();
