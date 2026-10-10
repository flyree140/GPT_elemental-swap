/* 21.8.0 · 既視連舞
 * Single replay owner. The three-second journal records geometry, not damage receipts.
 * Replays never call live cast/swap methods and never enter the journal recursively.
 * Command routes are data-driven in data/atlas217_config.js; no external dependency.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,ATT=ES9_ENGINE.ATT;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const copy=o=>JSON.parse(JSON.stringify(o));
const boxHit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const center=o=>({x:cx(o),y:cy(o)});
const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=cl(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
const boss=e=>!!(e.xBoss||e.anomaly216||e.type==='sentinel');
const hitKinds=new Set(['box','circle','line18','target','projectile']);
window.ES218={version:'21.8.0',window:3,damageScale:.4,source:'Elsword command-branch inspiration; original authored routes, existing supplied artwork.'};
P.rState218=function(){return this.r218||(this.r218={seq:0,epoch:0,queue:[],chain:null,taps:{},dashUntil:-1,cancel:null,fx:[],lastRun:null,stats:{recorded:0,replayed:0,swaps:0,casts:0},began:this.time});};
P.pose218=function(cut=false){const p=this.player;return {at:this.time,x:p.x,y:p.y,w:p.w,h:p.h,dir:p.dir,classId:p.classId,form:p.form,onGround:p.onGround,vx:p.vx,vy:p.vy,layer:this.vLayer(),frame216:copy(this.frame216(p)),cut};};
P.pruneJournal218=function(){const v=this.vInit(),cut=this.time-3.05;v.actions=v.actions.filter(a=>a.at>=cut);let n=0;while(n+1<v.path.length&&v.path[n+1].at<cut)n++;if(n)v.path.splice(0,n);};
P.vRecord=function(a){if(this._vReplay||!a||a.kind==='projectile'&&this._suppressProjectile218)return;
 const s=this.rState218(),p=this.player,ctx=this.castContext217||this.fieldContext217;
 const event=copy({at:this.time,seq:++s.seq,epoch:s.epoch,layer:this._vAttackLayer||this.vLayer(),room:this.currentRoomId,dir:p.dir,style:ctx?.style||this.style216().id,slot:ctx?.slot??null,cause218:ctx?.cause218||this.causeContext218||null,origin218:center(p),...a});
 if(!Number.isFinite(event.at)||event.at>this.time+.001)return;this.vInit().actions.push(event);s.stats.recorded++;this.pruneJournal218();
 // A cast already in the snapshot may still be winding up when F is pressed.
 // Follow only its owned delayed hits, never later unrelated live inputs or field ticks.
 const echo=this.vInit().echo;if(echo&&event.at>echo.snapshotAt+1e-8&&event.cause218&&echo.followCauses.has(event.cause218.id)&&!event.fieldTick218&&!['skill','command','swap','field'].includes(event.kind)){echo.actions.push(copy(event));echo.actions.sort((a,b)=>a.at-b.at||a.seq-b.seq);echo.duration=Math.max(echo.duration,event.at-echo.origin+.02);if(hitKinds.has(event.kind))echo.counts.attacks++;}
 return event;
};
P.vSample=function(force=false,cut=false){const v=this.vInit();if(!force&&this.time<(v.sampleAt||0))return;v.sampleAt=this.time+1/60;const s=this.pose218(cut||v.discontinuity);
 if(v.lastPos&&(Math.hypot(s.x-v.lastPos.x,s.y-v.lastPos.y)>170||v.lastPos.layer!==s.layer))s.cut=true;
 // A swap can legitimately have two distinct samples at the same timestamp.
 s.seq=++this.rState218().seq;v.path.push(s);v.lastPos=s;v.discontinuity=false;this.pruneJournal218();return s;
};
P.echo216=function(){const u=this.uState216(),v=this.vInit(),s=this.rState218();if(this.paused||this.modalM()||this.player.downT>0||v.echo||(u.cd.echo||0)>this.time)return false;
 this.vSample(true);const from=this.time-3,actions=v.actions.filter(a=>a.epoch===s.epoch&&a.at>=from-1e-8&&a.at<=this.time+1e-8).sort((a,b)=>a.at-b.at||a.seq-b.seq);
 let path=v.path.filter(a=>a.at>=from);const seed=v.path.filter(a=>a.at<from).at(-1);if(seed)path=[{...seed,at:from},...path];
 const moving=path.length>1&&path.some(a=>Math.hypot(a.x-path[0].x,a.y-path[0].y)>3);
 if(!actions.length&&!moving){this.say('先攻擊、施放技能或換位，再按 F 重演最近 3 秒。',1.6);return false;}
 if(!path.length)path=[this.pose218()];if(path[0].at>from)path.unshift({...path[0],at:from});
 const counts={attacks:actions.filter(a=>hitKinds.has(a.kind)).length,skills:actions.filter(a=>a.kind==='skill').length,swaps:actions.filter(a=>a.kind==='swap').length};
 v.echo={start:this.time,origin:from,duration:3,snapshotAt:this.time,followCauses:new Set(actions.filter(a=>['skill','command'].includes(a.kind)&&a.cause218).map(a=>a.cause218.id)),path:copy(path),actions:copy(actions),index:0,pathIndex:0,pose:copy(path[0]),epoch:s.epoch,counts,played:[],law:v.mode};v.rails=[];
 u.cd.echo=this.time+3.4;u.echoLaw=v.mode;this.mark216('echo');this.pressure216('time',7);this.vEmit('echoMade',{actions:counts.attacks,rails:0});
 this.say(`既視感｜${counts.attacks} 次攻擊判定・${counts.skills} 次技能・${counts.swaps} 次換位`,1.7,'#eed09d');return true;
};
P.vMakeEcho=function(){return this.echo216();};
P.echoFX218=function(kind,data){const s=this.rState218();s.fx.push({kind,at:this.time,until:this.time+.32,...data});if(s.fx.length>96)s.fx.splice(0,s.fx.length-96);};
P.replayDamage218=function(e,a){if(e.dead||!this.vCanHit(e,a.layer,a.element))return false;const origin=a.origin218||(a.kind==='line18'?a.a:{x:a.x,y:a.y});if(origin&&!this.lineClear217(origin,center(e)))return false;
 const amount=Math.max(0,a.damage||0)*ES218.damageScale;if(amount<=0)return false;
 this.nHit(e,amount,{...(a.status218||{}),a217Scaled:true,a217Unscaled:true,element:a.element||'raw',echo:true,layer:a.layer,skill:'echo218',kx:boss(e)?0:(a.kx||0)*(a.dir||1),ky:boss(e)?0:a.ky||0,br:a.br||8});
 if(a.ky&&!boss(e)){e.vy=a.ky;e.onGround=false;e.stun=Math.max(e.stun||0,.16);}this.vEmit('echoHit',{enemy:e.id});return true;
};
P.vReplayHit=function(a){const v=this.vInit(),s=this.rState218(),echo=v.echo;if(a.epoch!==undefined&&a.epoch!==s.epoch)return;
 const prior=this._vReplay,layer=this._vAttackLayer;this._vReplay=true;this._vAttackLayer=a.layer;
 try {
  if(echo){echo.played.push(a.seq);echo.lastAction=a;}s.stats.replayed++;
  if(a.kind==='swap'){s.stats.swaps++;if(echo)echo.pose={...echo.pose,...copy(a.to),at:a.at,cut:true};this.echoFX218('swap',{from:a.from,to:a.to,element:a.element,layer:a.layer});return;}
  if(a.kind==='skill'||a.kind==='command'){if(a.kind==='skill')s.stats.casts++;this.echoFX218('label',{x:a.x,y:a.y-35,label:a.name||a.key,layer:a.layer,until:this.time+.42});return;}
  if(a.kind==='field'){this.echoFX218('field',{x:a.x,y:a.y,r:a.r,field:a.field,layer:a.layer,until:this.time+Math.min(a.duration||.4,Math.max(0,3-(this.time-(echo?.start||this.time))))});return;}
  if(a.kind==='projectile'){v.echoShots.push({...copy(a),id:this.id(),hit:new Set(),left:cl(a.life||3,.01,8),spawnAt:this.time});return;}
  if(a.kind==='target'){const e=this.enemies.find(e=>e.id===a.targetId&&!e.dead);if(e&&boxHit(a,e))this.replayDamage218(e,a);}
  else if(a.kind==='line18'){
   const candidates=this.enemies.filter(e=>!e.dead&&this.vCanHit(e,a.layer,a.element)&&distance(center(e),a.a,a.b)<(a.width||19)+Math.min(e.w,e.h)*.42).sort((e,f)=>Math.hypot(cx(e)-a.a.x,cy(e)-a.a.y)-Math.hypot(cx(f)-a.a.x,cy(f)-a.a.y));let count=0;
   for(const e of candidates)if(count<(a.pierce||8)&&this.replayDamage218(e,a))count++;
  } else if(a.kind==='box'||a.kind==='circle')for(const e of this.enemies){if(e.dead)continue;const contact=a.kind==='box'?boxHit(a,e):Math.hypot(cx(e)-a.x,cy(e)-a.y)<a.r+Math.min(e.w,e.h)*.2;if(contact)this.replayDamage218(e,a);}
  this.echoFX218('hit',{action:copy(a),layer:a.layer});
 } finally {this._vReplay=prior;this._vAttackLayer=layer;}
};
P.tickEchoShots218=function(dt){const v=this.vInit();
 for(const shot of v.echoShots){const stepTime=Math.max(0,Math.min(dt,this.time-shot.spawnAt,shot.left));if(!stepTime)continue;shot.left-=stepTime;shot.vy+=(shot.gravity||0)*stepTime;
  const moveX=shot.vx*stepTime,moveY=shot.vy*stepTime,n=Math.max(1,Math.ceil(Math.hypot(moveX,moveY)/8));
  for(let i=0;i<n&&shot.left>0;i++){shot.x+=moveX/n;shot.y+=moveY/n;const origin=center(shot);const solids=this.activePlatforms(shot).filter(t=>!t.oneWay);if(solids.some(t=>boxHit(t,shot))){shot.left=0;break;}
   for(const target of this.enemies){if(target.dead||shot.hit.has(target.id)||!boxHit(target,shot)||!this.vCanHit(target,shot.layer,shot.element))continue;
    const old=this._vReplay;this._vReplay=true;try{this.replayDamage218(target,{...shot,origin218:origin});}finally{this._vReplay=old;}
    shot.hit.add(target.id);if(shot.hit.size>=(shot.pierce||1)){shot.left=0;break;}
   }
  }
 }
 v.echoShots=v.echoShots.filter(b=>b.left>0);
};
P.tickEcho218=function(dt){const v=this.vInit(),s=this.rState218(),e=v.echo;if(!(dt>0)||this.paused||this.modalM())return;s.fx=s.fx.filter(f=>f.until>this.time);
 if(!e){this.tickEchoShots218(dt);return;}if(e.epoch!==s.epoch){v.echo=null;v.echoShots=[];return;}
 const elapsed=Math.max(0,this.time-e.start),at=e.origin+elapsed;
 while(e.pathIndex+1<e.path.length&&e.path[e.pathIndex+1].at<=at+1e-8)e.pathIndex++;
 const a=e.path[e.pathIndex],b=e.path[e.pathIndex+1];e.pose=copy(a);
 if(b&&!b.cut&&a.layer===b.layer&&b.at>a.at){const t=cl((at-a.at)/(b.at-a.at),0,1);e.pose.x=a.x+(b.x-a.x)*t;e.pose.y=a.y+(b.y-a.y)*t;}
 while(e.index<e.actions.length&&e.actions[e.index].at<=at+1e-8)this.vReplayHit(e.actions[e.index++]);
 this.tickEchoShots218(dt);
 if(this.time-e.start>=e.duration-1e-8){s.lastRun={counts:copy(e.counts),total:e.actions.length,played:[...e.played],expected:e.actions.map(a=>a.seq),complete:e.index===e.actions.length,started:e.start,finished:this.time,duration:e.duration};v.echo=null;s.fx=s.fx.filter(f=>f.kind!=='field');}
};
// A replay owns only recorded damage/control, not a fresh burn/reaction chain.
// Original DOT ticks and reaction rays already have their own journal entries.
const elementalStatus=P.mStatus;P.mStatus=function(...args){if(this._vReplay)return;return elementalStatus.apply(this,args);};
// Primitive geometry owns its complete event, even on a miss. Direct-target damage
// is captured only when no enclosing box/circle/ray/projectile already owns it.
for(const name of ['ray216','pulse216','nArea','nRay','mArea','mSlash','applyElementHit']){
 const original=P[name];if(!original)continue;P[name]=function(...args){this._geometry218=(this._geometry218||0)+1;try{return original.apply(this,args);}finally{this._geometry218--;}};
}
const nHit=P.nHit;P.nHit=function(e,damage,opts={}){
 const direct=!this._vReplay&&!this._geometry218&&!opts.projectile218&&!opts.geometry218&&damage>0&&!e.dead;
 if(direct)this.vRecord({kind:'target',targetId:e.id,x:e.x-16,y:e.y-16,w:e.w+32,h:e.h+32,damage:damage*(opts.a217Scaled?1:this.tuning217(opts).damageScale),element:opts.element||'raw',layer:opts.layer||this.vLayer(),kx:opts.kx||0,ky:opts.ky||0,br:opts.br||22,status218:{slow:opts.slow,root:opts.root,armor:opts.armor}});
 this._geometry218=(this._geometry218||0)+1;try{return nHit.call(this,e,damage,opts);}finally{this._geometry218--;}
};
const rawDamage=P.damageEnemy;P.damageEnemy=function(e,damage,kx=0,ky=0,def={}){
 if(!this._vReplay&&!this._geometry218&&!def.mCommand&&damage>0&&!e.dead&&!def.projectile218)this.vRecord({kind:'target',targetId:e.id,x:e.x-12,y:e.y-12,w:e.w+24,h:e.h+24,damage,element:def.master?.element||'raw',layer:def.v16Layer||this.vLayer(),kx:kx/(this.player.dir||1),ky,br:def.br||8});
 return rawDamage.call(this,e,damage,kx,ky,def);
};
const field=P.field216;P.field216=function(...args){const f=field.apply(this,args);if(f&&!this._vReplay)this.vRecord({kind:'field',field:f.kind,x:f.x,y:f.y,r:f.r,duration:f.until-this.time,element:f.element,layer:f.layer});return f;};
const shot=P.nShot;P.nShot=function(...args){const prior=this._suppressProjectile218;this._suppressProjectile218=true;let b;try{b=shot.apply(this,args);}finally{this._suppressProjectile218=prior;}if(b)this.vRecord({kind:'projectile',x:b.x,y:b.y,w:b.w,h:b.h,vx:b.vx,vy:b.vy,gravity:b.gravity||0,damage:b.damage,element:b.element,layer:b.layer,pierce:b.pierce?b.pierce+1:1,life:b.until-this.time});return b;};
const fire=P.fireElement;P.fireElement=function(...args){const prior=this._suppressProjectile218;this._suppressProjectile218=true;let ok;try{ok=fire.apply(this,args);}finally{this._suppressProjectile218=prior;}
 if(ok){const b=this.elementShots.at(-1),el=args[0];this.vRecord({kind:'projectile',x:b.x,y:b.y,w:b.w,h:b.h,vx:b.vx,vy:b.vy,gravity:b.anchor?0:el.gravity||0,damage:el.damage,element:el.id,layer:b.v16Layer||this.vLayer(),life:b.t,pierce:1});this.vSample(true);}return ok;
};
P.clearChain218=function(){const s=this.rState218();s.queue=[];s.chain=null;s.cancel=null;this.player.buffer=null;this.player.bufferUntil217=0;this.player.history='';this.player.historyT=0;};
P.recordSwap218=function(from,to,extra={}){this.vRecord({kind:'swap',from:copy(from),to:copy(to),element:this.currentElement,...extra});this.vInit().discontinuity=true;this.vSample(true,true);};
const swap=P.swapElement;P.swapElement=function(...args){const from=this.pose218(),target=args[0]?.ref,targetBefore=target?{id:target.id,x:target.x,y:target.y,w:target.w,h:target.h}:null;this.vSample(true);const ok=swap.apply(this,args);if(ok){this.recordSwap218(from,this.pose218(true),{target:targetBefore,element:args[1]?.id,subtype:'element'});this.clearChain218();this.rState218().dashUntil=-1;}return ok;};
const cast=P.cast216;P.cast216=function(slot){const p=this.player,s=this.rState218(),attack=p.attack;
 // Never cut away an unplayed multihit pulse. A successful hit confirms a skill cancel.
 if(attack&&(attack.elapsed<attack.def.pulses19.at(-1)||(!attack.connected217||attack.action218?.finisher)&&attack.elapsed<attack.def.cancel)){const u=this.uState216();u.buffer={slot,style:this.style216().id,until:this.time+.28};return false;}
 const from=this.pose218(),style=this.style216(),beforePos={x:p.x,y:p.y},cause={id:'skill:'+s.epoch+':'+(++s.seq),at:this.time},prior=this.causeContext218;let ok;this.causeContext218=cause;try{ok=cast.call(this,slot);}finally{this.causeContext218=prior;}if(ok){
  this.clearChain218();s.dashUntil=-1;this.vRecord({kind:'skill',cause218:cause,style:style.id,slot,name:style.skills[slot].name,x:cx(p),y:cy(p),frame216:this.frame216(p)});
  if(Math.hypot(p.x-beforePos.x,p.y-beforePos.y)>35)this.recordSwap218(from,this.pose218(true),{subtype:'skill',name:style.skills[slot].name});else this.vSample(true);
 }return ok;
};
const moveAbility=P.nMoveTo;P.nMoveTo=function(...args){const from=this.pose218(),ok=moveAbility.apply(this,args);if(ok&&!this.castContext217)this.recordSwap218(from,this.pose218(true),{subtype:'ability',name:args[2]});return ok;};
// ---- Deliberate command grammar, queued button presses, cancel windows. ----
P.inputSnapshot218=function(token){return{token,up:this.key('up'),down:this.key('down'),dir:(this.key('right')?1:0)-(this.key('left')?1:0)||this.player.dir,at:this.time,until:this.time+ES217_CONFIG.combat.bufferSeconds};};
P.commandInput=function(token){if(!['Z','X'].includes(token))return false;const p=this.player,s=this.rState218();if(this.paused||this.modalM()||p.downT>0||p.recoverT>0)return false;
 const input=this._queuedCommand218||this.inputSnapshot218(token);if(p.attack&&p.attack.elapsed<p.attack.def.cancel||p.castT>.035){if(s.queue.length<3){input.until+=s.queue.length*.1;s.queue.push(input);}p.buffer=s.queue[0]?.token||null;p.bufferUntil217=s.queue[0]?.until||0;return false;}
 return this.executeCommand218(input);
};
P.executeCommand218=function(input){const p=this.player,s=this.rState218(),air=!p.onGround;let chain=s.chain;if(chain&&(chain.until<this.time||chain.air!==air||chain.finished))chain=null;
 const dash=this.time<=s.dashUntil||p.dashT>0;let context=air?(dash?'DASHAIR':'AIR'):(dash?'DASH':'');let key;
 if(input.up||input.down){key=(air?'AIR':'')+(input.up?'U':'D')+input.token;chain=null;}
 else {if(chain)context=chain.context;const prefix=(chain?.prefix||'')+input.token;key=context+prefix;if(!ES217_CONFIG.combat.commands[key]){key=(air?'AIR':'')+input.token;context=air?'AIR':'';chain=null;}}
 if(!ATT[key])return false;p.dir=input.dir||p.dir;const prefix=key.replace(/^(DASHAIR|DASH|AIR)/,'');s.chain={context:key.slice(0,key.length-prefix.length),prefix,air,until:this.time+ES217_CONFIG.combat.comboGapSeconds,finished:!!ATT[key].action218?.finisher};
 p.history=prefix;p.historyT=ES217_CONFIG.combat.comboGapSeconds;this.fInit().comboUntil=this.time+p.historyT;this.startAttack(key);return !!p.attack;
};
const start=P.startAttack;P.startAttack=function(key){const s=this.rState218(),p=this.player,out=start.call(this,key),a=p.attack;if(!a)return out;
 a.dir218=p.dir;a.action218=copy(a.def.action218||{});a.source218=this.pose218();a.connected217=false;
 if(a.action218.rise){p.vy=a.action218.rise;p.onGround=false;p.coyote=0;p.jumps=Math.max(1,p.jumps);p.dashT=0;s.dashUntil=-1;}
 if(a.action218.dive&&!p.onGround){p.vy=Math.max(p.vy,a.action218.dive);p.dashT=0;}
 if(a.action218.travel)p.dashT=0;
 const record=this.vRecord({kind:'command',key,name:a.def.name,x:cx(p),y:cy(p),frame216:this.frame216(p)});if(record){a.cause218={id:'command:'+record.seq,at:this.time};record.cause218=a.cause218;}this.vSample(true);return out;
};
P.updateAttacks=function(dt){const p=this.player,s=this.rState218(),a=p.attack;if(!(dt>0))return;
 s.queue=s.queue.filter(b=>b.until>=this.time);p.buffer=s.queue[0]?.token||null;
 if(!a){if(s.queue.length&&p.castT<=.035&&p.downT<=0&&p.recoverT<=0)this.executeCommand218(s.queue.shift());return;}
 const d=a.def;a.elapsed+=dt;const pulses=d.pulses19||[d.hit];
 while(a.pulse19<pulses.length&&a.elapsed+1e-8>=pulses[a.pulse19]){const pulse=a.pulse19++,pose={...p,dir:a.dir218},box=this.attackBox(pose,d);a.hit=true;let contacts=0;this._geometry218=(this._geometry218||0)+1;
  try{for(const e of this.enemies){if(e.dead||!boxHit(box,e)||!this.vCanHit(e)||!this.lineClear217(center(p),center(e)))continue;const stamp=this._nReceiptSeq||0,hp=e.hp;
    this.damageEnemy(e,d.dmg,a.dir218*d.kx,boss(e)?0:d.ky,{...d,kd:a.action218.finisher?18:2});
    if(e.hp<hp||(this._nReceiptSeq||0)>stamp){contacts++;this.fCommandEffect(e,d,pulse);this.commandReaction218(e,a);}
  }} finally {this._geometry218--;}
  this.vRecord({kind:'box',cause218:a.cause218,...box,damage:d.dmg,dir:a.dir218,kx:d.kx,ky:d.ky,br:d.br,key:d.key,shape:d.shape19,heavy:d.big,element:this.mState().command[p.classId],origin218:center(p)});
  this.swing217={...box,shape:d.shape19,heavy:d.big,at:this.time,until:this.time+(d.big?.29:.19),dir:a.dir218,key:d.key,hit:contacts>0,pulse};
  if(d.shape19==='parry')this.fInit().parryUntil=this.time+.5;
  if(contacts){a.connected217=true;this.sfx.hit(d.big);this.shake=Math.max(this.shake,d.big?2.2:1);this.poseHold217={until:this.time+(d.big?.045:.022),elapsed:a.elapsed,key:d.key};const m=this.aState217().metrics;m[d.big?'heavyHits':'lightHits']+=contacts;if(d.ky<-200)m.launchHits+=contacts;this.nEvent('comboMechanic19',d.shape19);}
 }
 if(s.queue.length&&a.elapsed>=d.cancel){p.attack=null;const next=s.queue.shift();p.buffer=s.queue[0]?.token||null;this.executeCommand218(next);return;}
 if(a.elapsed>=d.dur)p.attack=null;
};
P.commandReaction218=function(e,a){const d=a.def;if(boss(e)){e.vy=0;e.stun=Math.max(e.stun||0,Math.min(.2,d.big?.18:.1));return;}
 e.stun=Math.max(e.stun||0,d.big?.32:.24);
 if(d.ky<-200){if(e.onGround||!(e.juggleUntil218>this.time))e.juggle218=0;e.juggle218=(e.juggle218||0)+1;e.juggleUntil218=this.time+1.4;e.vy=d.ky*Math.max(.43,1-(e.juggle218-1)*.12);e.onGround=false;e.root=0;e.freeze=0;}
 else if(!e.onGround&&d.ky<=0){e.vy=Math.min(e.vy,-115);e.juggleUntil218=this.time+1.1;}
 if(a.action218.bounce&&!e.bounceUsed218){e.bouncePending218=true;e.bounceUsed218=true;e.bounceUntil218=this.time+1.3;e.onGround=false;e.vy=Math.max(430,e.vy);}
};
const key=P.key;P.key=function(action,tap=false){if(tap&&['jump','dash'].includes(action)){if(this._denyCancel218?.has(action))return false;if(this._synthetic218?.has(action))return true;}return key.call(this,action,tap);};
P.canCancel218=function(a){return a&&a.connected217&&!a.action218?.finisher&&a.elapsed>=a.def.pulses19.at(-1);};
const playerUpdate=P.updatePlayer;P.updatePlayer=function(dt){const p=this.player,s=this.rState218();if(!(dt>0))return playerUpdate.call(this,dt);
 this._denyCancel218=new Set();this._synthetic218=new Set();let wantDash=this.input.pressed.has(this.keys.dash),wantJump=this.input.pressed.has(this.keys.jump);
 for(const side of ['left','right'])if(this.input.pressed.has(this.keys[side])){const last=s.taps[side];if(last!==undefined&&this.time-last<=.23){wantDash=true;s.taps[side]=-999;}else s.taps[side]=this.time;}
 if(wantDash&&!this.input.pressed.has(this.keys.dash))this._synthetic218.add('dash');
 const act=p.attack;if(act){for(const action of ['jump','dash'])if(action==='jump'?wantJump:wantDash){if(this.canCancel218(act)){p.attack=null;this.clearChain218();s.lastCancel=action;}else if(act.elapsed<act.def.cancel){this._denyCancel218.add(action);s.cancel={action,until:this.time+.18};}else{p.attack=null;this.clearChain218();}}}
 if(s.cancel){if(s.cancel.until<this.time)s.cancel=null;else if(!p.attack||this.canCancel218(p.attack)){const action=s.cancel.action;p.attack=null;this.clearChain218();this._synthetic218.add(action);this._denyCancel218.delete(action);s.lastCancel=action;}}
 const grounded=p.onGround,priorDash=p.dashT;const out=playerUpdate.call(this,dt);if(p.dashT>0||priorDash>0)s.dashUntil=this.time+.21;
 if(!grounded&&p.onGround){if(s.chain?.air)s.chain=null;if(p.attack?.action218.dive){const a=p.attack;a.action218.dive=0;a.landed218=true;
 // Landing converts an unfinished dive into its real impact instead of deleting it.
 if(a.pulse19<a.def.pulses19.length)a.elapsed=Math.max(a.elapsed,a.def.pulses19[a.pulse19]-dt);s.chain=null;s.queue=[];p.buffer=null;}s.dashUntil=-1;}
 this._synthetic218=null;this._denyCancel218=null;return out;
};
// Motion travels through normal collision substeps; no teleport or wall bypass.
const move=P.moveBody;P.moveBody=function(body,dt,options){if(body===this.player&&body.attack){const a=body.attack,m=a.action218||{},t=a.elapsed;if(m.travel&&t>=m.moveFrom&&t<m.moveTo)body.vx=a.dir218*m.travel/(m.moveTo-m.moveFrom);
 if(m.hover&&!body.onGround&&t<m.hover&&body.vy>-220)body.vy=Math.min(body.vy,0);}
 const was=body.onGround,out=move.call(this,body,dt,options);
 // Horizontal dash has zero vertical displacement: base strict AABB drops
 // onGround at a perfectly touching floor. Preserve contact, never bridge a gap.
 if(body===this.player&&was&&!body.onGround&&body.vy>=0&&body.vy<1){const foot=body.y+body.h,ground=this.activePlatforms(body).find(t=>body.x+body.w>t.x+1&&body.x<t.x+t.w-1&&Math.abs(foot-t.y)<1.5);if(ground){body.y=ground.y-body.h;body.onGround=true;body.vy=0;}}
 if(body!==this.player&&body.bouncePending218){if(this.time>body.bounceUntil218)body.bouncePending218=false;else if(!was&&body.onGround){body.bouncePending218=false;body.onGround=false;body.vy=-235;body.stun=Math.max(body.stun||0,.28);}}
 if(body!==this.player&&body.onGround&&!body.bouncePending218&&this.time>(body.juggleUntil218||0)){body.juggle218=0;body.bounceUsed218=false;}return out;
};
// ---- Full-body echo poses and shape-specific sword feedback. ----
const frame=P.frame216;P.frame216=function(p){if(p.frame216)return p.frame216;const f=frame.call(this,p),a=p.attack;if(!a)return f;const d=a.def,list=ES217_HERO.clips[d.clip217]||ES217_HERO.clips.light;
 if(['spin','finish','dash','cut'].includes(d.clip217)){const t=cl(a.elapsed/d.dur,0,.999),index=Math.min(list.length-1,Math.floor(t*list.length));return{...f,index,rect:list[index]};}return f;
};
const drawEcho=P.vDrawEcho;P.vDrawEcho=function(c){const v=this.vInit(),e=v.echo;if(!e&&!v.echoShots.length)return;const p=e?.pose;if(p&&p.layer===this.vLayer()){c.save();c.globalAlpha=.52;c.filter='sepia(.55) saturate(1.35)';this.drawPlayer(c,{...p,attack:null,inv:0,shield:0,kingT:0,downT:0,hurtT:0,castT:0,dashT:0,frame216:p.frame216},true);c.restore();this.vText(c,'既視感 '+Math.max(0,e.duration-(this.time-e.start)).toFixed(1)+'s',cx(p),p.y-64,'#ffe2a2',12);}
 for(const b of v.echoShots)if(b.layer===this.vLayer()){c.save();c.fillStyle='#ffe0a5';c.shadowBlur=9;c.shadowColor='#eaca80';c.fillRect(b.x,b.y,b.w,b.h);c.restore();}
};
P.drawTrail218=function(c,a,alpha=1,echo=false){const kind=a.shape||a.visual||'slash',x=a.kind==='line18'?a.a.x:a.kind==='circle'?a.x:a.dir>0?a.x:a.x+a.w,y=a.kind==='line18'?a.a.y:a.kind==='circle'?a.y:a.y+a.h/2,w=a.w||a.r*1.4||150,h=a.h||a.r||90;
 c.save();c.globalAlpha*=alpha;c.strokeStyle=echo?'#f6d69a':a.heavy?'#d4a0ff':'#b2f3ff';c.lineWidth=a.heavy?4:2.5;c.lineCap='round';c.shadowBlur=echo?4:9;c.shadowColor=c.strokeStyle;
 if(a.kind==='line18'){c.beginPath();c.moveTo(a.a.x,a.a.y);c.lineTo(a.b.x,a.b.y);c.stroke();}
 else {c.translate(x,y);c.scale(a.dir||1,1);c.beginPath();if(['thrust','ray'].includes(kind)){c.moveTo(0,0);c.lineTo(w,0);c.moveTo(w-24,-9);c.lineTo(w,0);c.lineTo(w-24,9);}
 else if(kind==='lift'||kind==='rise'){c.moveTo(w*.14,h*.43);c.bezierCurveTo(w*1.03,h*.36,w*.88,-h*.25,w*.47,-h*.48);}
 else if(['down','quake'].includes(kind)){c.moveTo(w*.1,-h*.45);c.lineTo(w*.78,h*.4);c.moveTo(w*.4,h*.4);c.quadraticCurveTo(w*.8,h*.2,w,h*.4);}
 else if(kind==='circle'||a.kind==='circle'){c.ellipse(a.kind==='circle'?0:w*.5,0,a.r||w*.48,Math.max(20,h*.40),0,-.3,Math.PI*1.85);}
 else{c.moveTo(3,h*.2);c.bezierCurveTo(w*.6,-h*.65,w*1.12,-h*.1,w*.84,h*.34);}
 c.stroke();if(a.hit){c.strokeStyle='#fff8e4';for(let i=0;i<4;i++){const angle=i*Math.PI/2+.35;c.beginPath();c.moveTo(w*.6+Math.cos(angle)*4,Math.sin(angle)*4);c.lineTo(w*.6+Math.cos(angle)*18,Math.sin(angle)*18);c.stroke();}}}
 c.restore();
};
const drawEffects=P.drawEffects;P.drawEffects=function(c){const swing=this.swing217;this.swing217=null;try{drawEffects.call(this,c);}finally{this.swing217=swing;}
 if(swing&&swing.until>this.time)this.drawTrail218(c,swing,cl((swing.until-this.time)/(swing.until-swing.at),0,1));
 for(const f of this.rState218().fx){if(f.until<=this.time||f.layer&&f.layer!==this.vLayer())continue;const alpha=cl((f.until-this.time)/(f.until-f.at),0,1)*.7;
  if(f.kind==='hit')this.drawTrail218(c,f.action,alpha,true);
  if(f.kind==='swap'){c.save();c.globalAlpha=alpha;c.strokeStyle='#f5d795';c.lineWidth=2;for(const p of [f.from,f.to]){c.beginPath();c.ellipse(cx(p),cy(p),20,49,0,0,Math.PI*2);c.stroke();}c.setLineDash([5,12]);c.lineWidth=1;c.beginPath();c.moveTo(cx(f.from),cy(f.from));c.lineTo(cx(f.to),cy(f.to));c.stroke();c.restore();}
  if(f.kind==='label')this.vText(c,f.label,f.x,f.y,'#efd49e',11);
  if(f.kind==='field'){c.save();c.globalAlpha=alpha*.5;c.strokeStyle='#efd49e';c.setLineDash([4,7]);c.beginPath();c.ellipse(f.x,f.y,f.r,f.r*.45,0,0,Math.PI*2);c.stroke();c.restore();}
 }
};
// ---- Fixed-layout command helper and explicitly updated player-facing rules. ----
const routes=[['Z → Z → X → Space → Z → Z → X','挑空・跳取消・空中雙斬・墜擊彈地'],['Z → X → Z → X','滑步切入・雙環聚敵・終斬'],['X → Z → Z ／ X → X → Z → Z','倒鉤連刺 ／ 破甲轉挑空'],['→→Z → X ／ Shift＋Z → X','突刺升月，接空中追打；←← 也可'],['空中 Shift＋Z → Z → X','空中掠影・返刃・墜月'],['命中後 C/V/B/N/Q ／ D → F','接技能或換位，再由既視感重演']];
const help=P.helpPanel216;P.helpPanel216=function(root){help.call(this,root);const section=document.createElement('section');section.className='r-help218';section.innerHTML='<h3>21.8 既視感與指令連舞</h3><p>F 會重演按下前 3 秒的普攻、已發生的技能攻擊判定、投射物、持續傷害與換位。包含空揮，不再截成最多 48 筆。殘影沿原座標與原節奏行動，本體可繼續操作。</p><p>傷害保留 40%。不額外消耗換位或技能冷卻、不回血、不回充、不重複記錄殘影；不同世界切片不互相命中。持續場只重演該 3 秒內實際發生的攻擊，不再生一個新的完整持續場。已起手但尚未命中的招式會補完原本的後續段數；已重演發射的投射物會飛完，不在第 3 秒直接刪除。F 不重演自己。</p><div class="r-route-table218">'+routes.map(([keys,text])=>'<div><kbd>'+keys+'</kbd><span>'+text+'</span></div>').join('')+'</div><p>每次按鍵只推進一段。接招最多保留 3 次輸入，不會用最後一個鍵蓋掉前面。命中後可跳／衝刺取消；多段招要完成最後一段判定。終結技保留收招。↑＋X 主動升空，↓＋X 空中下劈；普通 Z 不強制位移。普通敵人有浮空衰減，頭目改吃破勢。</p>';root.prepend(section);};
const refresh=P.refresh216;P.refresh216=function(){refresh.call(this);const s=this.rState218(),v=this.vInit(),p=this.player,guide=document.getElementById('comboGuide216');if(guide){const a=p.attack,c=s.chain,next=c&&!c.finished?['Z','X'].filter(t=>ES217_CONFIG.combat.commands[c.context+c.prefix+t]).join(' / '):'Z / X';guide.textContent=a?`${a.def.name}　｜　${this.canCancel218(a)?'命中可取消：Space / Shift / 技能':'接段：'+next}　｜　H 完整連段表`:'ZZX → Space → 空中 ZZX　｜　→→Z / Shift＋Z 突進　｜　F 重演 3 秒';}
 const echo=document.querySelector('[data-skill="echo"]');if(echo){echo.title='重演前 3 秒所有攻擊、技能判定與換位；40% 傷害，不扣第二次資源。';echo.setAttribute('aria-label','既視感 F：重演前三秒攻擊、技能與換位');}
 let line=document.getElementById('echoJournal218');if(!line&&guide){line=document.createElement('div');line.id='echoJournal218';line.setAttribute('aria-live','off');guide.after(line);}if(line){const actions=v.actions.filter(a=>a.at>=this.time-3),count=actions.filter(a=>hitKinds.has(a.kind)).length,swaps=actions.filter(a=>a.kind==='swap').length,skills=actions.filter(a=>a.kind==='skill').length;line.textContent=v.echo?`↺ 重演中　${Math.max(0,v.echo.duration-(this.time-v.echo.start)).toFixed(1)}s　｜　${v.echo.index}/${v.echo.actions.length} 事件`:`F 記錄窗　3.0s　｜　攻擊 ${count}　技能 ${skills}　換位 ${swaps}`;}
 const hint=document.getElementById('hint216');if(hint)hint.textContent='21.8.0 · H 連段表 · F8 判定 · F9 開發';
};
const show=P.show216;P.show216=function(...args){const out=show.apply(this,args);document.title='澄界 · 既視連舞 | 21.8.0';return out;};
const intro=P.introPanel216;P.introPanel216=function(root){intro.call(this,root);const title=root.querySelector('.u-serif span'),info=root.querySelector('.u-build');if(title)title.textContent='既視連舞';if(info)info.innerHTML='F 重演前三秒所有攻擊・技能・換位<br/>ZX 指令分支・突進挑空・空中追打・命中取消<br/>H 連段表 · F8 判定 · 保留原世界與存檔';};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);ES9.VERSION=ES216.version=ES217.version='21.8.0';const logo=document.querySelector('.u-logo small');if(logo)logo.textContent='既視連舞 / 21.8.0';this.rState218();};
for(const name of ['respawn','vResetTransient','applyConfig217']){const original=P[name];P[name]=function(...args){if(name==='applyConfig217'&&ES217.validate(args[0]).length)return original.apply(this,args);const out=original.apply(this,args),s=this.rState218(),v=this.vInit();s.epoch++;s.queue=[];s.chain=null;s.cancel=null;s.dashUntil=-1;s.fx=[];v.actions=[];v.path=[];v.echo=null;v.echoShots=[];v.sampleAt=0;v.lastPos=null;return out;};}
const style=P.setStyle216;P.setStyle216=function(...args){const out=style.apply(this,args);if(this.r218)this.clearChain218();return out;};
})();
