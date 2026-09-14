/* V18 authored combat. Five stable keys, six skills/job, no implicit follow-up.
 * Short press is released before the threshold; long press adds a named modifier
 * to that SAME skill. Cooldown starts only on successful release.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES18,SK=ES10_MASTER.skills;
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const dist=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b));
const seg=(x,y,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a.x-k*dx,y-a.y-k*dy);};
const emit=P.mEmit;P.mEmit=function(type,data){if(type==='hit'&&data?.damage>0){this._nReceipts??=new Map();this._nReceiptSeq=(this._nReceiptSeq||0)+1;this._nReceipts.set(data.enemy,{seq:this._nReceiptSeq,damage:data.damage});}return emit.call(this,type,data);};
P.nEvent=function(type,value){const n=this.nInit();n.events.push({type,value,at:this.time});if(n.events.length>320)n.events.shift();};
P.nJob=function(){const n=this.nInit(),id=this.player.classId;if(n.job?.id!==id)n.job={id,meter:0,ammo:4,reagent:0,round:'normal',lastCommand:null};return n.job;};
P.nAim=function(){const raw=a=>this.input.down(this.keys[a]);let x=(raw('right')?1:0)-(raw('left')?1:0),y=(raw('down')?1:0)-(raw('up')?1:0);if(!x&&!y)x=this.player.dir;const l=Math.hypot(x,y)||1;return{x:x/l,y:y/l};};
P.nTarget=function(range=650,aim=this.nAim(),origin={x:cx(this.player),y:cy(this.player)}){return this.enemies.filter(e=>!e.dead&&this.vCanHit(e)&&Math.hypot(cx(e)-origin.x,cy(e)-origin.y)<range&&((cx(e)-origin.x)*aim.x+(cy(e)-origin.y)*aim.y)>-15).sort((a,b)=>(seg(cx(a),cy(a),origin,{x:origin.x+aim.x*range,y:origin.y+aim.y*range})*.8+Math.hypot(cx(a)-origin.x,cy(a)-origin.y)*.15)-(seg(cx(b),cy(b),origin,{x:origin.x+aim.x*range,y:origin.y+aim.y*range})*.8+Math.hypot(cx(b)-origin.x,cy(b)-origin.y)*.15))[0]||null;};
P.nFX=function(kind,x,y,r,color='#9de0d0',extra={}){const f={kind,x,y,r,color,t:.5,max:.5,...extra};this.nInit().fx.push(f);return f;};
P.nDrowse=function(e,n=1){if(e.dead)return;e.drowse18=clamp((e.drowse18||0)+n,0,3);e.drowseUntil18=this.time+9;this.nEvent('drowse',e.id);};
P.nSleep=function(e,duration=3){e.sleep17=this.time+(e.type==='sentinel'?Math.min(.6,duration):duration);e.freeze=0;e.stun=Math.min(e.stun||0,.1);this.nFX('sleep',cx(e),e.y-20,30,'#c8b0ed');this.nEvent('sleep',e.id);};
P.nHit=function(e,damage,opts={}){if(e.dead||!this.vCanHit(e,opts.layer||this.vLayer(),opts.element))return false;const hp=e.practiceM?e.maxHp:e.hp,stamp=this._nReceiptSeq||0;
 if(damage>0)this.damageEnemy(e,damage,opts.kx||0,opts.ky||0,{master:{skill:opts.skill||this._nCasting?.id||'rule18',element:opts.element||'raw',power:1},br:opts.br||22,isEcho:opts.echo||false,explicitKnockback:!!opts.kx,launch:!!opts.ky,v16Layer:opts.layer||this.vLayer()});
 if(opts.root)e.root=Math.max(e.root||0,e.type==='sentinel'?Math.min(.35,opts.root):opts.root);
 if(opts.slow)e.slow17=this.time+opts.slow;if(opts.armor)e.armorBreak=Math.max(e.armorBreak||0,opts.armor);if(opts.mark)e.marked17=this.time+opts.mark;if(opts.drowse)this.nDrowse(e,opts.drowse);if(opts.sleep)this.nSleep(e,opts.sleep);
 if(e.hp<hp||(this._nReceipts?.get(e.id)?.seq||0)>stamp){this.nEvent('hit',opts.skill||this._nCasting?.id||'rule18');this.nInit().hitSerial++;}return true;
};
P.nArea=function(x,y,r,damage,opts={}){const list=this.enemies.filter(e=>!e.dead&&Math.hypot(cx(e)-x,cy(e)-y)<r&&this.vCanHit(e,opts.layer||this.vLayer(),opts.element));for(const e of list)this.nHit(e,damage,opts);
 this.nFX(opts.visual||'ring',x,y,r,C.ELEMENTS.find(e=>e.id===opts.element)?.color||C.CLASSES[this.player.classId].accent,{label:opts.name||this._nCasting?.name});
 if(damage&&!opts.echo)this.vRecord({kind:'circle',x,y,r,damage,dir:this.player.dir,element:opts.element,layer:this.vLayer()});return list;
};
P.nRay=function(a,b,damage,opts={}){let end={...b};if(!opts.ignoreWalls){const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/18));const box={x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x)+1,h:Math.abs(a.y-b.y)+1};const solids=this.activePlatforms(box).filter(s=>!s.oneWay);for(let i=1;i<=steps;i++){const t=i/steps,q={x:a.x+(b.x-a.x)*t-2,y:a.y+(b.y-a.y)*t-2,w:4,h:4};if(solids.some(s=>hit(q,s))){end={x:q.x,y:q.y};break;}}}
 const all=this.enemies.filter(e=>!e.dead&&this.vCanHit(e,opts.layer||this.vLayer(),opts.element)&&seg(cx(e),cy(e),a,end)<(opts.width||20)+Math.min(e.w,e.h)*.45).sort((x,y)=>Math.hypot(cx(x)-a.x,cy(x)-a.y)-Math.hypot(cx(y)-a.x,cy(y)-a.y)).slice(0,opts.pierce||99);
 for(const e of all)this.nHit(e,damage,opts);this.nFX('beam',a.x,a.y,1,opts.color||C.ELEMENTS.find(e=>e.id===opts.element)?.color||'#ddd4ff',{x2:end.x,y2:end.y,label:opts.name||this._nCasting?.name,width:opts.width||14});
 if(damage&&!opts.echo)this.vRecord({kind:'line18',a:{...a},b:{...end},damage,width:opts.width||20,element:opts.element,layer:this.vLayer(),pierce:opts.pierce});return all;
};
const replay=P.vReplayHit;P.vReplayHit=function(a){if(a.kind!=='line18')return replay.call(this,a);this._vReplay=true;try{return this.nRay(a.a,a.b,a.damage*(this.vStore().branches.causal==='B'?.5:.42),{element:a.element,layer:a.layer,width:a.width,pierce:a.pierce,echo:true,color:'#ffd17e',name:'既視感・原位重播'});}finally{this._vReplay=false;}};
P.nObject=function(type,x,y,opts={}){const n=this.nInit();const o={id:this.id(),type,x,y,w:0,h:0,until:this.time+(opts.duration||8),tick:this.time,layer:this.vLayer(),classId:this.player.classId,label:opts.label||this._nCasting?.name||'',element:opts.element||this._nCasting?.element||'light',...opts};n.objects.push(o);if(n.objects.length>72)n.objects.shift();return o;};
P.nGround=function(x,y){const box={x:x-30,y:y-60,w:60,h:100},ss=this.activePlatforms(box).filter(s=>s.y>=y-100&&s.y<y+650&&s.x<x+15&&s.x+s.w>x-15).sort((a,b)=>a.y-b.y);return ss[0]?ss[0].y:y+50;};
P.nPlace=function(charged,range=340,aim=this.nAim()){const p=this.player,x=cx(p)+aim.x*(charged?range:90),y=cy(p)+aim.y*(charged?range:90);return{x,y:this.nGround(x,y)-25};};
P.nMoveTo=function(x,y,label){const p=this.player,safe=this.vLanding(x,y,p.w,p.h);if(!safe||this.nGatePath(p,safe,p.w,p.h)){this.say('位移取消：落點或路徑被實體機關阻擋。',1.6);return false;}this.nFX('beam',cx(p),cy(p),1,'#c8a9ed',{x2:safe.x+p.w/2,y2:safe.y+p.h/2,label});Object.assign(p,safe,{vx:0,vy:0,onGround:false});this.vInit().discontinuity=true;this.nEvent('abilityMove',label);return true;};
P.nSwapObject=function(o,charged=false){if(!o){this.say('先部署替身，再使用這個技能。',1.7);return false;}const p=this.player;if(charged){o.x=cx(p)+p.dir*75;o.y=cy(p);return true;}const old={x:cx(p),y:cy(p)};if(!this.nMoveTo(o.x-p.w/2,o.y-p.h/2,o.label))return false;o.x=old.x;o.y=old.y;return true;};
P.nShot=function(x,y,aim,damage,opts={}){const b={id:this.id(),x,y,w:12,h:12,vx:aim.x*(opts.speed||460),vy:aim.y*(opts.speed||460),gravity:opts.gravity||0,damage,element:opts.element||'light',until:this.time+(opts.duration||4),layer:this.vLayer(),hits:new Set(),...opts};this.nInit().shots.push(b);if(this.n18.shots.length>96)this.n18.shots.shift();this.vRecord({kind:'projectile',x,y,w:12,h:12,vx:b.vx,vy:b.vy,gravity:b.gravity,damage,dir:this.player.dir,element:b.element});return b;};
P.nCancelHolds=function(){this.nInit().holds={};};
const key=P.key;P.key=function(a,tap=false){if(this._nAimLock&&['left','right','up','down'].includes(a))return false;return key.call(this,a,tap);};
P.useSkill=function(slot){if(slot<0||slot>4||this.player.downT>0)return false;const id=this.mLoadout()[slot],code=this.keys['skill'+(slot+1)],n=this.nInit();this.linkM=null;this.pendingM=null;
 if((this.cooldownsM[id]||0)>this.time){this.say(SK[id].name+' 冷卻 '+(this.cooldownsM[id]-this.time).toFixed(1)+'s',.7);return false;}
 if(this.input.down(code)){if(n.holds[code])return true;if(Object.keys(n.holds).length)this.nCancelHolds();n.holds[code]={id,slot,start:this.time,aim:this.nAim(),classId:this.player.classId};this.player.attack=null;this.player.buffer=null;return true;}
 return this.castMasterSkill(id,{slot,charged:false});
};
const player=P.updatePlayer;
P.updatePlayer=function(dt){const n=this.nInit();if(this.key('dash',true)||this.key('jump',true)||this.player.downT>0)this.nCancelHolds();const holding=Object.values(n.holds).length>0;if(holding){for(const q of Object.values(n.holds))q.aim=this.nAim();this.player.vx=0;this._nAimLock=true;}
 try{player.call(this,dt);}finally{this._nAimLock=false;}
 for(const [code,q]of Object.entries(n.holds)){if(q.classId!==this.player.classId){delete n.holds[code];continue;}if(!this.input.down(code)){delete n.holds[code];this.castMasterSkill(q.id,{slot:q.slot,charged:this.time-q.start>=SK[q.id].holdTime18,aim:q.aim,heldFor:this.time-q.start});}}
};
P.cycleFollowM=function(){this.say('同鍵追擊已移除。五個鍵永遠施放槽位上顯示的技能。',2);};
const change=P.changeClass;P.changeClass=function(id){this.nCancelHolds();change.call(this,id);const n=this.nInit();n.job=null;n.objects=[];n.shots=[];n.structures=n.structures.filter(s=>!s.ability18);this.xInit().links=[];this.x17.portals=[];this.x17.fields=[];this.elementShots=[];this.summons=[];this.turrets=[];this.sceneMode11=false;C.CLASSES[id].desc=D.jobs[id].desc;};
// Basic attacks never inject movement, projectiles, echoes, or hidden follow-up skills.
const attack=P.classAttack;P.classAttack=function(def,key){const d=attack.call(this,def,key),cl=this.player.classId;Object.assign(d,{lunge:0,retreat:0,recoil:0,pass:false,slam:false,mechanicalShot:false,gunShot:false,featherM:false,summonCommand:false,echo:false,shock:false,chain:false,pull:false});
 const styles={rift:['刻痕斬','留步重斬'],summoner:['短杖敲','契印擊'],beast:['前爪','獸掌'],artificer:['扳手敲','扳手重敲'],gunner:['槍托擊','槍托重擊'],warden:['盾緣擊','定步盾敲'],chrono:['刻針刺','時針重擊'],harrier:['短鏈甩','鏈鎚擊'],alchemist:['攪拌杖','短杖重敲'],monk:['寸拳','迴旋踢'],sharpshooter:['短刃','槍托擊'],puppeteer:['線刃','提線重擊'],cartographer:['量尺擊','圖尺重敲'],chef:['鍋鏟','平底鍋'],dreamweaver:['夢針','安眠掌']};
 d.name=key+'・'+styles[cl][key.endsWith('X')?1:0];d.kx=Math.min(Math.abs(d.kx||0),65)*Math.sign(d.kx||1);if(!d.launch)d.ky=0;d.w=cl==='monk'?95:cl==='harrier'?155:cl==='beast'&&this.player.form==='bear'?210:130;return d;};
const start=P.startAttack;P.startAttack=function(key){const p=this.player;start.call(this,key);if(p.attack){p.attack.lockMove=false;p.attack.def.lockMove=false;}if(p.onGround&&!this.key('left')&&!this.key('right')&&p.dashT<=0)p.vx=0;this.nEvent('command',key);};
const damage=P.damageEnemy;P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){const hp=e.practiceM?e.maxHp:e.hp,asleep=e.sleep17>this.time,stamp=this._nReceiptSeq||0;damage.call(this,e,dmg,kx,ky,def);const receipt=this._nReceipts?.get(e.id),dealt=e.practiceM&&receipt?.seq>stamp?receipt.damage:Math.max(0,hp-e.hp);if(!dealt)return;const j=this.nJob(),cmd=def.mCommand;
 if(!def.isEcho&&!def.shared17){e.debt18=e.debt18||[];e.debt18.push({at:this.time,n:dealt});e.debt18=e.debt18.filter(q=>q.at>this.time-4);}
 if(cmd){this.nEvent('commandHit',def.key);j.meter=clamp(j.meter+1,0,3);
  if(j.id==='rift')e.rift18=clamp((e.rift18||0)+1,0,3);
  if(j.id==='beast')e.prey18=clamp((e.prey18||0)+1,0,3);
  if(j.id==='dreamweaver'){if(String(def.key).endsWith('X')&&(e.drowse18||0)>=3){this.nSleep(e,3);e.drowse18=0;}else if(String(def.key).endsWith('Z'))this.nDrowse(e,1);}
  if(j.id==='monk'){const last=String(def.key).slice(-1);if(j.lastCommand===last)j.meter=Math.max(0,j.meter-1);j.lastCommand=last;if(last==='X'&&e.point18>this.time){e.root=1.5;e.point18=0;}}
  if(j.id==='rift')for(const o of this.n18.objects.filter(o=>o.type==='seal'&&o.until>this.time)){if(this.time>o.tick){o.tick=this.time+.9;this.nArea(o.x,o.y,100,12,{element:'shadow',echo:true,name:'刀印・補斬'});}}
 }
 if(asleep)this.nEvent('wake',e.id);
};
P.castMasterSkill=function(id,opts={}){const s=SK[id],p=this.player;if(!s||s.class18!==p.classId||p.downT>0)return false;if((this.cooldownsM[id]||0)>this.time)return false;
 const charged=!!opts.charged,ctx=this.mSkillContext(s);this.linkM=this.pendingM=null;const n=this.nInit();this._nCasting=s;let ok;
 try{ok=this.nRunSkill(s,{...ctx,charged,aim:opts.aim||this.nAim(),reach:this.mRank(id)>0&&this.mBranch(id)==='B'?1.2:1,control:this.mRank(id)>0&&this.mBranch(id)==='A'?.4:0});}finally{this._nCasting=null;}
 if(ok===false)return false;this.cooldownsM[id]=this.time+Math.max(1.1,this.cooldown(s.cd));p.castT=.12;p.castM={row:12,until:this.time+.32};p.attack=null;p.buffer=null;p.history='';this.sfx.skill();
 this.commandLabel=s.name+(charged?'｜長按':'｜短按');this.commandT=1.8;n.lastAction={name:s.name,desc:charged?s.hold18:s.tap18,until:this.time+4,charged};this.mEmit('skill',{id,mode:'renewal18',linked:false,branch:this.mBranch(id)});this.xSignal('skill',id);this.nEvent(charged?'chargedSkill':'skill',id);return true;
};
P.runMasterSkill=function(s,ctx,opts={}){return this.nRunSkill(s,{...ctx,charged:!!opts.charged,aim:opts.aim||this.nAim(),reach:ctx.reach||1,control:0});};
P.nRunSkill=function(s,c){const p=this.player,n=this.nInit(),j=this.nJob(),ch=c.charged,op=s.op18,a=c.aim,origin={x:cx(p),y:cy(p)},at=this.nPlace(ch,340*c.reach,a),target=this.nTarget((ch?940:650)*c.reach,a),pool=this.enemies.filter(e=>!e.dead&&dist(e,p)<800&&this.vCanHit(e)),objects=type=>n.objects.filter(o=>o.type===type&&o.until>this.time),power=1+this.mRank(s.id)*.12,damage=v=>v*power;
 const area=(x,y,r,d,opts={})=>this.nArea(x,y,r*c.reach,damage(d),{element:s.element,skill:s.id,...opts});
 const ray=(len,d,opts={})=>this.nRay(origin,{x:origin.x+a.x*len*c.reach,y:origin.y+a.y*len*c.reach},damage(d),{element:s.element,skill:s.id,...opts});
 const obj=(type,x=at.x,y=at.y,opts={})=>this.nObject(type,x,y,{element:s.element,label:s.name,control:c.control,skill:s.id,...opts});
 const need=(ok,text)=>{if(!ok)this.say(text,1.8);return !!ok;};
 const platform=(x,y,w=250,duration=8,lift=false)=>{const f={id:'ability18_'+this.id(),x:x-w/2,y,w,h:18,kind:lift?'abilityLift':'abilityBridge',baseY:y,until:this.time+duration,oneWay:true,modes:['all'],label:s.name,ability18:true};n.structures.push(f);return f;};
 const move=(x,y)=>this.nMoveTo(x,y,s.name);
 const pull=(e,x,y,max=240)=>{if(e.type==='sentinel'){e.slow17=this.time+.7;return;}const dx=x-cx(e),dy=y-cy(e),d=Math.hypot(dx,dy)||1;e.vx=dx/d*Math.min(max,d*2);e.vy=dy/d*Math.min(max,d*2);e.root=0;};
 const shot=(dm,opts={})=>this.nShot(origin.x,origin.y,a,damage(dm),{element:s.element,skill:s.id,...opts});
 switch(s.class18){
 case 'rift':
  if(op==='cut'){for(const e of ray(ch?310:150,ch?30:22,{width:28}))e.rift18=clamp((e.rift18||0)+1,0,3);}
  if(op==='rise')area(origin.x+p.dir*100,origin.y-30,ch?180:135,25,{ky:-480,root:ch?1+c.control:0});
  if(op==='step')return move(p.x+a.x*(ch?340:180),p.y+a.y*(ch?340:180));
  if(op==='finish'){const marked=pool.filter(e=>(e.rift18||0)>0);if(!need(marked.length,'先用 Z 或裂痕刻刃命中，才有裂痕可收束。'))return false;for(const e of marked){if(ch)pull(e,origin.x+p.dir*110,origin.y);else{area(cx(e),cy(e),75,15+e.rift18*13,{armor:3});e.rift18=0;}}}
  if(op==='seal')obj('seal',at.x,at.y,{duration:8});
  if(op==='ward')obj('shield',origin.x+p.dir*75,origin.y,{duration:3,r:ch?140:85,charges:1,reward:ch?0:1});
  break;
 case 'summoner':
  if(op==='pet'){const old=objects('pet');if(old.length>=2)old[0].until=0;obj('pet',at.x,at.y,{duration:20,variant:ch?'owl':'fox',element:ch?'wind':'fire',attackAt:this.time+.4});}
  if(op==='command'){if(!need(objects('pet').length,'先用「喚出契靈」召出狐或梟。'))return false;if(!ch&&!need(target,'準星前方沒有可集火的敵人。'))return false;for(const o of objects('pet')){o.target=ch?null:target.id;o.guard=ch;o.attackAt=this.time;}}
  if(op==='exchange'){const os=objects('pet').sort((a,b)=>dist(a,p)-dist(b,p));return this.nSwapObject(ch?os.at(-1):os[0]);}
  if(op==='nest')obj('nest',at.x,at.y,{duration:9,boost:ch,r:180});
  if(op==='imbue'){if(!need(objects('pet').length,'場上沒有契靈。'))return false;for(const o of objects('pet')){o.element=this.currentElement;o.charged=ch;o.until=Math.max(o.until,this.time+10);this.nFX('ring',o.x,o.y,60,C.ELEMENTS.find(e=>e.id===o.element).color);}}
  if(op==='recall'){const os=objects('pet');if(!need(os.length,'沒有可召回的契靈。'))return false;for(const o of os){if(ch){o.x=origin.x+p.dir*90;o.y=origin.y;}else{o.until=0;p.shield=Math.min(60,p.shield+18);}}}
  break;
 case 'beast':
  if(['wolf','eagle','bear'].includes(op)){this.setFormM(op);this.nEvent('form',op);if(op==='wolf'){if(ch&&!move(p.x+a.x*220,p.y+a.y*220))return false;for(const e of area(cx(p)+p.dir*65,cy(p),125,24))e.prey18=clamp((e.prey18||0)+1,0,3);}if(op==='eagle'){if(!ch){p.vy=-640;p.onGround=false;}else for(const dy of [-.3,0,.3])this.nShot(cx(p),cy(p),{x:p.dir,y:dy},14,{element:'wind',speed:330});}if(op==='bear')area(cx(p)+p.dir*65,cy(p),ch?230:150,ch?36:27,{armor:4,root:ch?.6:0});}
  if(op==='instinct'){if(ch){p.shield=Math.max(p.shield,28);}else if(p.form==='eagle')p.airDashes=2;else if(p.form==='bear')p.armor=4;else for(const e of pool.filter(e=>e.prey18))e.marked17=this.time+7;}
  if(op==='rest'){if(ch)p.shield=Math.max(p.shield,30);else{p.hp=Math.min(p.maxHp,p.hp+24);this.mSchedule(3,()=>{p.hp=Math.min(p.maxHp,p.hp+12);});}}
  if(op==='roar'){if(ch)obj('decoy',origin.x,origin.y,{r:650,duration:5});else for(const e of area(origin.x,origin.y,220,20,{root:.5}))e.prey18=3;}
  break;
 case 'artificer':
  if(op==='turret'){const os=objects('turret');if(os.length>=2)os[0].until=0;obj('turret',at.x,at.y,{duration:18,attackAt:this.time+.3,variant:j.defense?'shield':'gun'});}
  if(op==='wire'){const ts=objects('turret');if(!need(ts.length>=(ch?1:2),ch?'至少需要一座炮台。':'先部署兩座炮台，再接通纜線。'))return false;obj('wire',0,0,{a:ch?'player':ts[0].id,b:ts.at(-1).id,duration:8});}
  if(op==='lift')platform(at.x,p.y+p.h+2,ch?230:290,8,ch);
  if(op==='magnet'){for(const e of pool.filter(e=>dist(e,p)<350))pull(e,ch?cx(e)+Math.sign(cx(e)-origin.x)*300:origin.x+p.dir*60,origin.y,ch?440:250);for(const q of this.x17.loot)if(dist(q,p)<650){q.x=p.x;q.y=p.y;}if(ch)for(const b of this.enemyShots)if(dist(b,p)<300){b.vx*=-1;b.vy*=-1;}area(origin.x,origin.y,350,0);}
  if(op==='drone'){const t=objects('turret')[0];if(ch&&!need(t,'先部署炮台才能安排維修。'))return false;if(ch)t.until+=8;obj('drone',origin.x,origin.y,{duration:9,target:ch?t.id:null,r:140,charges:4});}
  if(op==='scrap'){const ts=objects('turret');if(!need(ts.length,'目前沒有可拆解的炮台。'))return false;for(const o of ts){o.until=0;if(!ch)area(o.x,o.y,200,42,{element:'fire',armor:3});}if(ch)this.cooldownsM[D.skills.artificer[0].id]=this.time;}
  break;
 case 'gunner':
  if(op==='round'){if(!need(j.ammo>0,'彈匣空了：V 戰術裝填，或 Q 快速補兩枚。'))return false;j.ammo--;if(ch)for(const dy of [-.28,0,.28])this.nShot(origin.x,origin.y,{x:a.x,y:a.y+dy},damage(18),{element:'lightning',pierce:1,armor:j.round==='armor'?3:0});else shot(36,{speed:330,pierce:3,armor:j.round==='armor'?4:0});}
  if(op==='reload'){j.ammo=4;j.round=ch?'armor':'normal';this.nEvent('reload',j.round);}
  if(op==='mine')obj('mine',at.x,at.y,{duration:12,r:110,damage:42});
  if(op==='brace'){if(!ch&&!move(p.x-p.dir*150,p.y))return false;platform(cx(p)+p.dir*90,p.y+p.h-110,170);if(ch)platform(cx(p)+p.dir*170,p.y+p.h-225,160);}
  if(op==='barrage'){if(!need(j.ammo>0,'先裝填，才能射出彈幕。'))return false;const count=j.ammo;j.ammo=0;for(let k=0;k<count;k++){if(ch)obj('mine',origin.x+p.dir*(100+k*130),this.nGround(origin.x+p.dir*(100+k*130),origin.y)-20,{duration:10,r:95,damage:28});else this.mSchedule(k*.16,()=>this.nShot(origin.x,origin.y,a,24,{element:'lightning',pierce:1}));}}
  if(op==='intercept')shot(14,{intercept:true,return18:ch,pierce:4,speed:370});
  break;
 case 'warden':
  if(op==='shield')obj('shield',origin.x+p.dir*75,origin.y,{duration:ch?5:3,r:ch?150:90,charges:6,reward:1});
  if(op==='spear')ray(ch?160:280,28,{width:ch?60:23,armor:3,ky:ch?-400:0});
  if(op==='release'){const v=j.meter;j.meter=0;if(ch)p.shield=Math.min(65,p.shield+15+v*12);else area(origin.x,origin.y,220,22+v*16,{root:1.3+c.control,br:65});}
  if(op==='banner')obj('banner',at.x,at.y,{duration:8,r:210,heal:ch});
  if(op==='hook'){if(ch){for(const b of this.enemyShots)if(dist(b,p)<340){b.t=0;j.meter=clamp(j.meter+1,0,3);}}else if(need(target,'盾鉤前方沒有可拉的敵人。'))pull(target,origin.x+p.dir*65,origin.y);else return false;}
  if(op==='peace')obj('peace',at.x,at.y,{duration:7,r:ch?260:175,slow:ch,hit:new Set()});
  break;
 case 'chrono':
  if(op==='record'){j.anchor={x:p.x,y:p.y,hp:ch?null:p.hp,until:this.time+(ch?14:8)};obj('timeAnchor',origin.x,origin.y,{duration:ch?14:8});}
  if(op==='slow')obj('slow',at.x,at.y,{duration:6,r:ch?150:220,factor:ch?.15:.35});
  if(op==='delay'){const x=origin.x+p.dir*170,y=origin.y;obj('delay',x,y,{duration:(ch?2.4:1.2)+.1,r:110,fireAt:this.time+(ch?2.4:1.2),damage:ch?40:32});if(ch)obj('delay',x+p.dir*190,y-50,{duration:2.6,r:100,fireAt:this.time+2.5,damage:32});}
  if(op==='rewind'){if(!need(j.anchor&&j.anchor.until>this.time,'先用 C 留下時錨，且需在錨點有效時間內返回。'))return false;const q=j.anchor;if(!ch&&!move(q.x,q.y))return false;p.hp=Math.min(p.maxHp,p.hp+Math.min(ch?12:25,Math.max(0,(q.hp||p.hp)-p.hp)));j.anchor=null;for(const o of objects('timeAnchor'))o.until=0;}
  if(op==='debt'){const es=pool.filter(e=>e.debt18?.some(x=>x.at>this.time-4));if(!need(es.length,'先造成傷害，敵人才有可結算的時債。'))return false;for(const e of es){if(ch)e.root=1.5+c.control;else{const d=e.debt18.filter(q=>q.at>this.time-4).reduce((v,q)=>v+q.n,0);e.debt18=[];this.nHit(e,d*.3,{element:'gravity',echo:true});this.nFX('clock',cx(e),cy(e),90,'#b4cdf0');}}}
  if(op==='haste'){if(ch)for(const f of this.x17.fields)if(Math.hypot(f.x-origin.x,f.y-origin.y)<350)f.t+=3;else{}else obj('haste',origin.x,origin.y,{r:210,duration:6});}
  break;
 case 'harrier':
  if(op==='pull'){if(!need(target,'瞄準可見敵人；沒有目標時不會亂衝。'))return false;pull(target,origin.x+p.dir*90,origin.y,350);j.hooked=target.id;this.nRay(origin,{x:cx(target),y:cy(target)},12,{element:'earth',width:10});}
  if(op==='grapple'){if(ch)return move(p.x+a.x*350,p.y+a.y*350);const hook=this.enemies.find(e=>e.id===j.hooked&&!e.dead&&this.vCanHit(e)&&dist(e,p)<900);if(!need(hook,'先用 C 鉤住敵人，或長按改用地形落點。'))return false;return move(hook.x-p.dir*90,hook.y+hook.h-p.h);}
  if(op==='rope'){if(ch){const b={x:origin.x+a.x*330,y:origin.y+a.y*230};for(let k=0;k<5;k++)platform(origin.x+(b.x-origin.x)*k/4,p.y+p.h+(b.y-origin.y)*k/4,100,8);}else{if(!need(target,'需要一個敵人當繩索另一端。'))return false;obj('rope',origin.x,p.y+p.h-5,{target:target.id,duration:8});}}
  if(op==='reel'){const es=pool.slice().sort((a,b)=>dist(a,p)-dist(b,p)).slice(0,2);if(!need(es.length===2,'絞盤需要附近兩名敵人。'))return false;const x=(cx(es[0])+cx(es[1]))/2,y=(cy(es[0])+cy(es[1]))/2;for(const e of es){if(ch)e.root=2+c.control;else pull(e,x,y,300);}obj('tether',0,0,{ids:es.map(e=>e.id),duration:5});}
  if(op==='swing'){const e=this.enemies.find(e=>e.id===j.hooked&&!e.dead);if(ch){if(!need(e,'先鉤住獵物，才能讓目標擺盪。'))return false;e.vx=p.dir*350;e.vy=-380;}else{if(!move(p.x+p.dir*180,p.y-70))return false;area(cx(p)+p.dir*60,cy(p),130,35,{ky:-260});}}
  if(op==='sever'){const rs=objects('rope');if(!need(rs.length,'目前沒有可斷開的釘地繩索。'))return false;for(const o of rs){const e=this.enemies.find(e=>e.id===o.target);if(e&&!ch)this.nRay({x:o.x,y:o.y},{x:cx(e),y:cy(e)},36,{element:'earth',width:45,armor:4});o.until=0;}if(ch)p.shield=Math.max(p.shield,32);}
  break;
 case 'alchemist':
  if(op==='flask'){const el=['water','fire','lightning'][j.reagent];shot(14,{element:el,gravity:600,speed:ch?420:280,flask:true,r:ch?220:140,vy:a.y*(ch?420:280)-(ch?330:200)});}
  if(op==='catalyst'){const es=pool.filter(e=>dist(e,{x:at.x,y:at.y,w:0,h:0})<230||e===target);let count=0;for(const e of es)if(e.element17||e.wet>0||e.burn>0||e.freeze>0){count++;if(ch){e.wet+=(e.wet>0?3:0);e.burn+=(e.burn>0?3:0);e.freeze+=(e.freeze>0?1:0);}else{this.xReact(e.element17?.id||(e.wet>0?'water':'fire'),['water','fire','lightning'][j.reagent],cx(e),cy(e));this.nHit(e,24,{element:['water','fire','lightning'][j.reagent]});}}if(!need(count,'先投試劑或用元素彈命中，觸媒才有東西可反應。'))return false;}
  if(op==='gel')obj('gel',at.x,at.y,{duration:10,r:ch?90:140});
  if(op==='distill'){if(ch){let count=0;for(const f of this.x17.fields)if(Math.hypot(f.x-origin.x,f.y-origin.y)<400){f.t=0;count++;}if(!need(count,'附近沒有可蒸餾的元素場。'))return false;this.cooldownsM[D.skills.alchemist[0].id]=this.time;}else for(const e of pool.filter(e=>dist(e,p)<370))pull(e,at.x,at.y,260);}
  if(op==='cleanse'){p.burn=p.poison=0;if(ch)obj('healing',at.x,at.y,{r:160,duration:7});else p.hp=Math.min(p.maxHp,p.hp+20);}
  if(op==='spread'){const e=pool.find(e=>e.element17?.until>this.time);if(!need(e,'先用任意元素命中敵人，才有狀態可傳播。'))return false;const others=pool.filter(q=>q!==e&&dist(q,e)<(ch?650:300)).slice(0,ch?1:2);for(const q of others){this.mStatus(q,e.element17.id);this.nFX('beam',cx(e),cy(e),1,'#e4c584',{x2:cx(q),y2:cy(q),label:'試劑傳導'});}}
  break;
 case 'monk':
  if(op==='jab'){ray(ch?150:105,ch?35:24,{width:40,armor:j.meter>0?3:0,root:ch?.7+c.control:0});j.meter=Math.max(0,j.meter-1);}
  if(op==='upper'){if(!ch){p.vy=-400;p.onGround=false;}area(origin.x+p.dir*55,origin.y-40,ch?195:120,30,{ky:ch?0:-500});}
  if(op==='point'){const es=ray(155,16,{width:34,slow:ch?4:0});for(const e of es)if(!ch)e.point18=this.time+6;}
  if(op==='guard'){p.armor=ch?4:2;p.parry=.5;j.meter=clamp(j.meter+1,0,3);j.guardUntil=this.time+(ch?4:2);}
  if(op==='wave'){const meter=j.meter;j.meter=0;if(ch)area(origin.x,origin.y,180+meter*25,18+meter*11,{root:.6});else shot(20+meter*12,{speed:380,pierce:4});}
  if(op==='kick'){if(!move(p.x+(ch?0:p.dir*220),p.y-(ch?200:0)))return false;area(cx(p)+p.dir*50,cy(p),130,34,{ky:-260});}
  break;
 case 'sharpshooter':
  if(op==='snipe'){const tripod=objects('scope').some(o=>Math.hypot(o.x-origin.x,o.y-origin.y)<155),len=(tripod?1150:850)*(ch?1.25:1);const hits=ray(len,(ch?62:38)+j.meter*6,{width:ch?10:7,pierce:ch?3:1,armor:ch?2:0,name:ch?'狙擊・貫穿':'狙擊・單發'});for(const e of hits)if(e.marked17>this.time)this.nHit(e,18,{element:'light',echo:true});j.meter=0;}
  if(op==='mark'){const es=ch?pool.slice(0,3):target?[target]:[];if(!need(es.length,'準星前方沒有可以測距的目標。'))return false;for(const e of es)e.marked17=this.time+(ch?4:7);}
  if(op==='scope'){obj('scope',at.x,at.y,{duration:14});if(ch)platform(at.x,at.y-115,180,14);}
  if(op==='trap')obj('trap',at.x,at.y,{duration:10,r:130});
  if(op==='constellation'){const es=pool.filter(e=>e.marked17>this.time);if(!need(es.length,'先使用弱點測距；星點連射只處理標記目標。'))return false;for(const e of es){if(ch){e.root=2+c.control;e.marked17=0;}else this.nRay(origin,{x:cx(e),y:cy(e)},36,{element:'lightning',width:8,pierce:1,name:'星點連射'});}}
  if(op==='beacon')obj(ch?'shield':'decoy',at.x,at.y,{duration:7,r:ch?110:470,charges:1});
  break;
 case 'puppeteer':
  if(op==='puppet'){for(const o of objects('puppet'))o.until=0;obj('puppet',at.x,at.y-8,{duration:20});}
  if(op==='tether'){let es;if(ch)es=pool.slice(0,2);else{if(!need(objects('puppet').length&&target,'先放傀儡，再瞄準需要連結的敵人。'))return false;const puppet=objects('puppet')[0];puppet.target=target.id;es=[target,...pool.filter(e=>e!==target)].slice(0,2);}if(!need(es.length>=2,'縫魂傳導需要兩個敵人作為端點。'))return false;this.x17.links.push({ids:es.map(e=>e.id),t:6});obj('tether',0,0,{ids:es.map(e=>e.id),duration:6});}
  if(op==='slash'){const o=objects('puppet')[0];if(!need(o,'先部署傀儡。提線斬從傀儡位置出手。'))return false;area(o.x,o.y-(ch?50:0),ch?190:145,ch?34:27,{ky:ch?-460:0});}
  if(op==='swap')return this.nSwapObject(objects('puppet')[0],ch);
  if(op==='ward'){const o=objects('puppet')[0];if(!need(o,'先部署傀儡，才能縫製護偶。'))return false;o.defend=!ch;o.lure=ch;o.charges=3;o.until=Math.max(o.until,this.time+8);}
  if(op==='cut'){const ls=objects('tether');if(!need(ls.length,'先使用縫魂線連結目標。'))return false;for(const o of ls){const es=o.ids.map(id=>this.enemies.find(e=>e.id===id&&!e.dead)).filter(Boolean);if(ch&&es.length===2){for(let k=0;k<5;k++)platform(cx(es[0])+(cx(es[1])-cx(es[0]))*k/4,cy(es[0])+(cy(es[1])-cy(es[0]))*k/4+65,110,6);}else for(const e of es)this.nHit(e,30,{element:'shadow',root:1.8+c.control});o.until=0;}this.x17.links=[];}
  break;
 case 'cartographer':
  if(op==='pinA'||op==='pinB'){const pt=op==='pinA'&&!ch?{x:origin.x,y:p.y+p.h-25}:this.nPlace(true,op==='pinA'?320:ch?420:220,a);const key=op==='pinA'?'a':'b';j[key]=pt;for(const o of objects('pin').filter(o=>o.pin===key))o.until=0;obj('pin',pt.x,pt.y,{pin:key,duration:40,label:key==='a'?'原點 A':'終點 B'});this.nEvent('pin',key);}
  if(['portal','bridge','erase'].includes(op)){if(!need(j.a&&j.b,'先設原點 C 與終點 V；兩枚圖釘都需要。'))return false;const a=j.a,b=j.b;if(op==='portal'){if(this.nGatePath({x:a.x-p.w/2,y:a.y-p.h/2},{x:b.x-p.w/2,y:b.y-p.h/2},p.w,p.h)){this.say('圖釘連線被未解鎖機關切斷。',2);return false;}this.x17.portals.push({x:a.x,y:a.y,to:{x:b.x-p.w/2,y:b.y-p.h/2},t:ch?16:10,room:this.currentRoomId,kind:'fold18'});if(!ch)this.x17.portals.push({x:b.x,y:b.y,to:{x:a.x-p.w/2,y:a.y-p.h/2},t:10,room:this.currentRoomId,kind:'fold18'});this.nEvent('portal','made');}
   if(op==='bridge'){const steps=clamp(Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/80),1,20);for(let k=0;k<=steps;k++){const u=k/steps;platform(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u+32,92,8);if(ch&&k%2===0)platform(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u-95,90,8);}this.nEvent('bridge','made');}
   if(op==='erase'){if(ch){const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};obj('slow',mid.x,mid.y,{r:Math.min(420,dist({...a,w:0,h:0},{...b,w:0,h:0})/2+80),factor:.4,duration:5});}else for(const s of this.enemyShots)if(seg(cx(s),cy(s),a,b)<200)s.t=0;this.nFX('beam',a.x,a.y,1,'#a3e7e4',{x2:b.x,y2:b.y,label:'局部擦除'});}}
  if(op==='survey'){if(!need(j.a,'先設下原點，測繪儀才知道掃描位置。'))return false;if(ch){for(const o of objects('pin'))o.until+=4;for(const f of n.structures.filter(s=>s.ability18))f.until+=4;}else for(const e of pool)if(Math.hypot(cx(e)-j.a.x,cy(e)-j.a.y)<550){e.hidden=false;e.marked17=this.time+6;}}
  break;
 case 'chef':
  if(op==='pan'){const es=area(origin.x+p.dir*70,origin.y,140,23,{ky:ch?0:-360,kx:ch?p.dir*260:0});if(es.length)j.meter=clamp(j.meter+1,0,3);}
  if(op==='pot'){const el=ch?'water':j.simmer?'water':'fire';obj('pot',at.x,at.y,{duration:10,r:170,element:el});this.xField(el,at.x,at.y,170,10,{damage:3,source18:s.id});}
  if(op==='dish'){const v=j.meter;j.meter=0;if(ch)p.shield=Math.min(70,p.shield+12+v*10);else p.hp=Math.min(p.maxHp,p.hp+10+v*10);}
  if(op==='finish'){const os=objects('pot');if(!need(os.length,'先放野炊爐，才能在爐具位置收鍋。'))return false;for(const o of os){o.until=0;if(!ch)area(o.x,o.y,210,38+j.meter*8,{element:'fire'});}for(const f of this.x17.fields)if(f.source18===D.skills.chef[1].id)f.t=0;if(ch)this.cooldownsM[D.skills.chef[1].id]=this.time;}
  if(op==='aroma')obj(ch?'healing':'decoy',at.x,at.y,{duration:7,r:ch?190:500});
  if(op==='chill'){if(ch)platform(at.x,at.y-30,270,8);else{for(const e of pool.filter(e=>e.wet>0&&dist(e,p)<400))this.nHit(e,10,{element:'ice',root:2});j.meter=3;}}
  break;
 case 'dreamweaver':
  if(op==='seed')obj('dreamSeed',at.x,at.y,{duration:12,r:115,sleep:3+c.control});
  if(op==='decoy'){for(const o of objects('dreamDecoy'))o.until=0;obj('dreamDecoy',at.x,at.y-6,{duration:8,r:560});}
  if(op==='exchange')return this.nSwapObject(objects('dreamDecoy')[0],ch);
  if(op==='harvest'){const es=pool.filter(e=>dist(e,p)<(ch?480:340)&&((e.drowse18||0)>0||e.sleep17>this.time));if(!need(es.length,'敵人尚無困意：先 Z 命中、放夢種，或建夢庭。'))return false;for(const e of es){const stacks=e.drowse18||0,sl=e.sleep17>this.time;if(ch&&sl){const other=pool.find(q=>q!==e&&dist(e,q)<260);if(other){this.nDrowse(other,3);this.nSleep(other,2);}}area(cx(e),cy(e),55,25+stacks*12+(sl?20:0),{element:'shadow'});e.drowse18=0;e.sleep17=0;}}
  if(op==='garden')obj('dreamGarden',at.x,at.y,{duration:7,r:230,stabilize:ch});
  if(op==='transfer'){const e=pool.slice().sort((a,b)=>(b.drowse18||0)-(a.drowse18||0))[0];if(!need(e&&e.drowse18>0,'先讓至少一名敵人累積困意。'))return false;if(ch){p.shield=Math.max(p.shield,24);e.drowse18=0;}else{for(const other of pool.filter(q=>q!==e&&dist(q,e)<360).slice(0,2))this.nDrowse(other,e.drowse18);e.drowse18=0;}}
  break;
 default:return false;
 }
 this.nFX('cast',origin.x,origin.y,50,C.CLASSES[p.classId].accent,{label:s.name});return true;
};
P.useClassSkill=function(){const p=this.player,n=this.nInit(),j=this.nJob();if(p.qCD>0)return false;p.qCD=2;this.nCancelHolds();
 if(j.id==='beast'){this.setFormM(['wolf','eagle','bear'][(['wolf','eagle','bear'].indexOf(p.form)+1)%3]);}
 else if(j.id==='summoner'){const e=this.nTarget();for(const o of n.objects.filter(o=>o.type==='pet')){o.target=e?.id;o.attackAt=this.time;}}
 else if(j.id==='artificer'){j.defense=!j.defense;for(const o of n.objects.filter(o=>o.type==='turret'))o.variant=j.defense?'shield':'gun';}
 else if(j.id==='gunner')j.ammo=Math.min(4,j.ammo+2);
 else if(['warden','monk'].includes(j.id))p.parry=.6;
 else if(j.id==='chrono')this.nObject('slow',cx(p),cy(p),{duration:1,r:200,factor:.05,label:'Q・暫緩敵彈',shotsOnly:true});
 else if(j.id==='harrier'){for(const o of n.objects.filter(o=>o.type==='rope'))o.until=0;j.hooked=null;}
 else if(j.id==='alchemist')j.reagent=(j.reagent+1)%3;
 else if(j.id==='sharpshooter')j.steady=this.time+3;
 else if(j.id==='puppeteer'){for(const o of n.objects.filter(o=>o.type==='puppet')){o.x=cx(p)+p.dir*80;o.y=cy(p);}}
 else if(j.id==='cartographer'){j.a=j.b=null;for(const o of n.objects.filter(o=>o.type==='pin'))o.until=0;}
 else if(j.id==='chef')j.simmer=!j.simmer;
 else if(j.id==='dreamweaver'){for(const e of this.enemies)if(e.drowse18>0)e.drowseUntil18=Math.max(e.drowseUntil18,this.time+3);j.dreamSight=this.time+4;}
 else if(j.id==='rift')j.noPush=this.time+5;
 this.nEvent('q',j.id);n.lastAction={name:'Q・'+D.jobs[j.id].meter,desc:D.jobs[j.id].q,until:this.time+3};this.nFX('cast',cx(p),cy(p),60,C.CLASSES[p.classId].accent);return true;
};
const hurt=P.hurtPlayer;P.hurtPlayer=function(d,kx=0,ky=0,source='',dot=false){const j=this.nJob(),p=this.player;if(this.n18?.tutorial)return;const parry=!dot&&p.parry>0&&p.inv<=0;
 for(const o of this.nInit().objects)if(o.type==='banner'&&!o.heal&&o.until>this.time&&Math.hypot(cx(p)-o.x,cy(p)-o.y)<o.r){d*=.65;kx*=.5;ky*=.5;}
 hurt.call(this,d,kx,ky,source,dot);if(parry){j.meter=clamp(j.meter+1,0,3);this.nEvent('parry',j.id);}
};
const brain=P.enemyBrain;P.enemyBrain=function(e,dt,...args){if(e.drowseUntil18<this.time)e.drowse18=0;let f=1;for(const o of this.nInit().objects)if(o.type==='slow'&&!o.shotsOnly&&o.until>this.time&&Math.hypot(cx(e)-o.x,cy(e)-o.y)<o.r)f=Math.min(f,o.factor);const speed=e.speed;e.speed*=f;try{return brain.call(this,e,dt*f,...args);}finally{e.speed=speed;}};
P.nTickCombat=function(dt){const n=this.nInit(),p=this.player,j=this.nJob(),mode=this.vInit().mode;n.fx=n.fx.filter(f=>(f.t-=dt)>0);
 if(j.id==='sharpshooter'&&Math.abs(p.vx)<10&&p.onGround)j.meter=clamp(j.meter+dt*.7,0,3);
 if(j.guardUntil>this.time&&(this.key('left')||this.key('right')||this.key('zAttack')||this.key('xAttack'))){j.guardUntil=0;p.armor=0;}
 for(const f of n.structures)if(f.kind==='abilityLift'&&f.until>this.time){const dy=-25*dt;if(p.onGround&&Math.abs(p.y+p.h-f.y)<5&&p.x+p.w>f.x&&p.x<f.x+f.w)p.y+=dy;f.y=Math.max(f.baseY-220,f.y+dy);}
 // Enemy lure is a real AI target, not merely an ellipse graphic.
 for(const e of this.enemies)if(e.decoy18){e.decoy=null;e.decoy18=false;}
 for(const o of n.objects){if(o.until<=this.time)continue;const osame=o.layer===this.vLayer();if(!osame)continue;const nearEnemy=r=>this.enemies.filter(e=>!e.dead&&this.vCanHit(e,o.layer,o.element)&&Math.hypot(cx(e)-o.x,cy(e)-o.y)<r);
  if(['decoy','dreamDecoy'].includes(o.type)||(o.type==='puppet'&&o.lure)){for(const e of nearEnemy(o.r||500)){e.decoy={x:o.x,y:o.y};e.decoy18=true;}}
  if(o.type==='pet'){const target=this.enemies.find(e=>e.id===o.target&&!e.dead&&this.vCanHit(e))||this.nTarget(650,{x:p.dir,y:0},{x:o.x,y:o.y});const tx=target&&!o.guard?cx(target)+(o.variant==='owl'?-p.dir*230:-p.dir*65):cx(p)-p.dir*100,ty=target&&!o.guard?cy(target)-(o.variant==='owl'?100:0):cy(p)-(o.variant==='owl'?110:0);o.x+=(tx-o.x)*Math.min(1,dt*3);o.y+=(ty-o.y)*Math.min(1,dt*3);if(target&&this.time>=o.attackAt&&Math.hypot(o.x-cx(target),o.y-cy(target))<(o.variant==='owl'?600:125)){o.attackAt=this.time+(o.boost?.7:1.2);if(o.variant==='owl'){const dx=cx(target)-o.x,dy=cy(target)-o.y,d=Math.hypot(dx,dy);this.nShot(o.x,o.y,{x:dx/d,y:dy/d},15,{element:o.element});}else this.nArea(o.x,o.y,110,o.charged?27:17,{element:o.element,name:'狐靈・撲咬'});if(o.charged){this.xField(o.element,cx(target),cy(target),130,3);o.charged=false;}this.nEvent('petHit',o.variant);}}
  if(o.type==='turret'&&this.time>=o.attackAt){o.attackAt=this.time+1.3;const target=nearEnemy(680)[0];if(o.variant==='gun'&&target){const dx=cx(target)-o.x,dy=cy(target)-o.y,d=Math.hypot(dx,dy)||1;this.nShot(o.x,o.y,{x:dx/d,y:dy/d},17,{element:'lightning',speed:390});}}
  if(o.type==='drone'){const host=n.objects.find(q=>q.id===o.target)||{x:cx(p),y:cy(p)};o.x=host.x+Math.cos(this.time*2)*70;o.y=host.y-55+Math.sin(this.time*2)*40;}
  if(['shield','drone'].includes(o.type)||(o.type==='turret'&&o.variant==='shield')||(o.type==='puppet'&&o.defend)){for(const b of this.enemyShots)if(!b.friendly&&b.t>0&&(o.charges===undefined||o.charges>0)&&Math.hypot(cx(b)-o.x,cy(b)-o.y)<(o.r||115)){b.t=0;if(o.charges!==undefined)o.charges--;p.shield=Math.min(70,p.shield+4);j.meter=clamp(j.meter+(o.reward||0),0,3);this.nFX('block',cx(b),cy(b),25,'#e5ce9b');this.nEvent('block',o.type);}}
  if(o.type==='slow'){for(const b of this.enemyShots)if(b.t>0&&!b.friendly&&Math.hypot(cx(b)-o.x,cy(b)-o.y)<o.r){b.x-=b.vx*dt*(1-o.factor);b.y-=b.vy*dt*(1-o.factor);}}
  if(o.type==='haste'&&Math.hypot(cx(p)-o.x,cy(p)-o.y)<o.r)for(const id in this.cooldownsM)if(this.cooldownsM[id]>this.time)this.cooldownsM[id]-=dt*.25;
  if(o.type==='delay'&&this.time>=o.fireAt){o.until=0;this.nArea(o.x,o.y,o.r,o.damage,{element:'shadow',name:'延期斬擊・落下'});this.nEvent('delayedHit',o.skill);}
  if(o.type==='wire'){const a=o.a==='player'?{x:cx(p),y:cy(p)}:n.objects.find(q=>q.id===o.a&&q.until>this.time),b=n.objects.find(q=>q.id===o.b&&q.until>this.time);if(!a||!b)o.until=0;else{o.start={x:a.x,y:a.y};o.end={x:b.x,y:b.y};if(this.time>=o.tick){o.tick=this.time+.65;for(const e of this.enemies)if(!e.dead&&seg(cx(e),cy(e),o.start,o.end)<45)this.nHit(e,8,{element:'lightning'});}}}
  if(o.type==='rope'){const e=this.enemies.find(e=>e.id===o.target&&!e.dead);if(!e)o.until=0;else{o.start={x:o.x,y:o.y};o.end={x:cx(e),y:cy(e)};for(const q of this.enemies)if(!q.dead&&seg(cx(q),cy(q),o.start,o.end)<65)q.slow17=this.time+.2;}}
  if(this.time<o.tick)continue;o.tick=this.time+1;
  if(['healing','nest','banner'].includes(o.type)&&Math.hypot(cx(p)-o.x,cy(p)-o.y)<(o.r||180)){if(o.type==='healing'||o.type==='nest'&&!o.boost||o.type==='banner'&&o.heal)p.hp=Math.min(p.maxHp,p.hp+2);}
  if(o.type==='nest'&&o.boost)for(const pet of n.objects.filter(x=>x.type==='pet'))pet.boost=Math.hypot(pet.x-o.x,pet.y-o.y)<200;
  if(['dreamSeed','gel','mine','trap','peace'].includes(o.type)){const es=nearEnemy(o.r||140);if(es.length){if(o.type==='dreamSeed'){for(const e of es){this.nDrowse(e,3);this.nSleep(e,o.sleep||3);}o.until=0;this.nEvent('trapSleep','seed');}if(o.type==='gel'){for(const e of es)e.root=e.type==='sentinel'?.3:2+(o.control||0);o.until=0;}if(o.type==='mine'){this.nArea(o.x,o.y,o.r,o.damage,{element:'fire',name:'地雷・引爆'});o.until=0;}if(o.type==='trap')for(const e of es)e.slow17=this.time+2;if(o.type==='peace')for(const e of es)if(!o.hit.has(e.id)){o.hit.add(e.id);if(o.slow)e.slow17=this.time+4;else e.root=e.type==='sentinel'?.3:1.4+(o.control||0);}}}
  if(o.type==='dreamGarden'){for(const e of nearEnemy(o.r)){if(o.stabilize){if(e.sleep17>this.time){e.root=Math.max(e.root,.5);e.vx=e.vy=0;}}else this.nDrowse(e,1);}}
 }
 n.objects=n.objects.filter(o=>o.until>this.time);
 // Swept projectile collisions use world-space segments, independent of room transitions.
 for(const b of n.shots){if(b.until<=this.time)continue;const from={x:b.x,y:b.y};b.vy+=b.gravity*dt*(mode==='heavy'?2.15:1);b.x+=b.vx*dt;b.y+=b.vy*dt;let impact=false;
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-from.x,b.y-from.y)/12));const solids=this.activePlatforms({x:Math.min(b.x,from.x)-8,y:Math.min(b.y,from.y)-8,w:Math.abs(b.x-from.x)+16,h:Math.abs(b.y-from.y)+16});for(let k=1;k<=steps;k++){const t=k/steps,q={x:from.x+(b.x-from.x)*t-6,y:from.y+(b.y-from.y)*t-6,w:12,h:12};if(solids.some(s=>hit(q,s))){b.x=q.x;b.y=q.y;impact=true;break;}}
  if(b.intercept)for(const s of this.enemyShots)if(s.t>0&&seg(cx(s),cy(s),from,b)<55){s.t=0;this.nEvent('intercept','projectile');}
  for(const e of this.enemies){if(e.dead||b.hits.has(e.id)||!this.vCanHit(e,b.layer,b.element)||seg(cx(e),cy(e),from,b)>Math.max(e.w,e.h)*.48+9)continue;b.hits.add(e.id);this.nHit(e,b.damage,{element:b.element,armor:b.armor,skill:b.skill,layer:b.layer});if(!b.pierce||b.hits.size>b.pierce)impact=true;}
  if(impact){if(b.flask){this.xField(b.element,b.x,b.y,b.r,6,{damage:3,source18:b.skill});this.nEvent('flask',b.element);}if(mode==='elastic'&&(b.bounces||0)<3&&!b.flask){b.bounces=(b.bounces||0)+1;b.vx*=-.85;b.vy=-Math.abs(b.vy)*.8-100;b.y-=18;}else b.until=0;}
  if(b.return18&&!b.returned&&this.time>b.until-2){b.vx*=-1;b.vy*=-1;b.returned=true;b.hits.clear();}
 }
 n.shots=n.shots.filter(b=>b.until>this.time);
};
// Four tiers: exactly one A/B choice per unlocked tier; lower tiers stay active.
P.xElementUpgrade=function(id){const s=this.xState(),q=s.elements[id];if(!q||q.rank>=4||s.elementPoints<q.rank+1){this.xNotice('需要 '+((q?.rank||0)+1)+' 點；元素最多 Lv.4。');return false;}s.elementPoints-=q.rank+1;q.rank++;q.tiers=q.tiers||[q.branch||'A','A','A','A'];this.saveProgress();this.nEvent('elementLevel',id+':'+q.rank);return true;};
P.xElementBranch=function(id,b,tier=1){const q=this.xState().elements[id];tier=+tier;if(!q||!['A','B'].includes(b)||tier<1||tier>4||tier>q.rank)return false;q.tiers=q.tiers||[q.branch||'A','A','A','A'];q.tiers[tier-1]=b;if(tier===1)q.branch=b;this.saveProgress();return true;};
// Deliberately do not call V17 elementSwapEffect: its old wind/water forced motion
// was another hidden displacement. All tier effects are local, visible fields.
window.ES18_COMBAT={segmentDistance:seg};
})();
