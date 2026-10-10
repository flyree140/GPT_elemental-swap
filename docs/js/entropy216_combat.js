/* Runtime systems: six genuinely different move sets, bounded effects, same-layer
   hit receipts, free-air anchors, one-shot echo, and local time/space pressure. */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,D=ES216,C=ES9,TAU=Math.PI*2;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const center=o=>({x:cx(o),y:cy(o)}),dist=(a,b)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b));
const segment=(x,y,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,k=cl(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a.x-k*dx,y-a.y-k*dy);};
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
P.uState216=function(){if(this.u216)return this.u216;const q=this.progress.entropy216||{};return this.u216={style:D.styles.some(s=>s.id===q.style)?q.style:'blade',time:cl(Number(q.time)||0,0,100),space:cl(Number(q.space)||0,0,100),memory:Array.isArray(q.memory)?q.memory.filter(x=>D.chapters.some(c=>c[0]===x)):[],visits:Array.isArray(q.visits)?q.visits:[],defeated:{time:Number(q.defeated?.time)||0,space:Number(q.defeated?.space)||0},ended:!!q.ended,cd:{},queue:[],fields:[],fx:[],receipts:new Map(),metrics:{},history:[],coolUntil:0,warning:null,active:null,reverse:false,recipe:0,arc:0,lastSkill:-20,lastSwap:-20,trace:null,epoch:0,checks:[],saveAt:0,phase:'arrival'};};
P.style216=function(){const s=this.uState216();return D.styles.find(q=>q.id===s.style)||D.styles[0];};
P.mark216=function(key,n=1){const s=this.uState216();s.metrics[key]=(s.metrics[key]||0)+n;};
P.save216=function(){const s=this.uState216();this.progress.entropy216={version:D.version,style:s.style,time:s.time,space:s.space,memory:[...s.memory],visits:[...s.visits],defeated:{...s.defeated},ended:s.ended};};
const save=P.saveProgress;P.saveProgress=function(...args){if(this.u216)this.save216();return save.apply(this,args);};
P.setStyle216=function(id,initial=false){const job=D.styles.find(s=>s.id===id);if(!job)return false;const s=this.uState216(),p=this.player,ratio=p.hp/(p.maxHp||180);s.style=id;s.fields=s.fields.filter(f=>!f.job);s.queue=[];s.pet=null;s.pin=null;s.trace=null;this.nCancelHolds?.();this.pendingM=this.linkM=null;p.attack=null;p.castT=0;p.history='';p.buffer=null;p.classId=job.legacy;p.maxHp=C.CLASSES[p.classId].hp;p.hp=cl(Math.round(p.maxHp*ratio),0,p.maxHp);p.anim216=null;p.form='wolf';this.nInit().job=null;const sel=document.getElementById('classSelect');if(sel)sel.value=p.classId;this.save216();if(!initial){this.saveProgress();this.say(job.name+'｜'+job.tag,2,job.color);this.mark216('styleChange');}this.refresh216?.();return true;};
P.fx216=function(kind,x,y,r=100,color=this.style216().color,extra={}){const s=this.uState216(),f={kind,x,y,r,color,at:this.time,duration:.42,dir:this.player.dir,...extra};s.fx.push(f);if(s.fx.length>70)s.fx.shift();return f;};
P.schedule216=function(delay,fn,tag){const s=this.uState216();s.queue.push({at:this.time+delay,fn,epoch:s.epoch,layer:this.vLayer(),tag});if(s.queue.length>40)s.queue.shift();};
P.field216=function(kind,x,y,r,duration,extra={}){const s=this.uState216();const same=s.fields.filter(f=>f.kind===kind&&f.job===extra.job);if(same.length>=2)same[0].until=0;const f={id:'u216_'+this.id(),kind,x,y,r,at:this.time,until:this.time+duration,tick:this.time,layer:this.vLayer(),room:this.currentRoomId,...extra};s.fields.push(f);if(s.fields.length>28)s.fields.shift();return f;};
P.ray216=function(a,b,damage,element,opts={}){let end={...b};const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/16));const box={x:Math.min(a.x,b.x)-6,y:Math.min(a.y,b.y)-6,w:Math.abs(b.x-a.x)+12,h:Math.abs(b.y-a.y)+12};const solids=this.activePlatforms(box).filter(s=>!s.oneWay);
 for(let i=1;i<=steps;i++){const t=i/steps,q={x:a.x+(b.x-a.x)*t-2,y:a.y+(b.y-a.y)*t-2,w:4,h:4};if(solids.some(s=>overlap(q,s))){end={x:q.x,y:q.y};break;}}
 const list=this.enemies.filter(e=>!e.dead&&this.vCanHit(e,opts.layer||this.vLayer(),element)&&segment(cx(e),cy(e),a,end)<(opts.width||19)+Math.min(e.w,e.h)*.42).sort((e,f)=>Math.hypot(cx(e)-a.x,cy(e)-a.y)-Math.hypot(cx(f)-a.x,cy(f)-a.y)).slice(0,opts.pierce||8);
 for(const e of list)this.nHit(e,damage,{element,skill:'u216',br:opts.br||24,...opts});this.fx216(opts.visual||'ray',a.x,a.y,1,opts.color||this.style216().color,{x2:end.x,y2:end.y,width:opts.width||19,duration:opts.duration||.32});if(damage&&!this._vReplay)this.vRecord({kind:'line18',a:{...a},b:{...end},damage,element,width:opts.width||19,layer:opts.layer||this.vLayer(),pierce:opts.pierce||8,kx:opts.kx||0,ky:opts.ky||0,br:opts.br||24,visual:opts.visual||'ray',status218:{slow:opts.slow,root:opts.root,armor:opts.armor},origin218:{...a}});return list;};
P.pulse216=function(x,y,r,damage,element,opts={}){const list=this.enemies.filter(e=>!e.dead&&this.vCanHit(e,opts.layer||this.vLayer(),element)&&Math.hypot(cx(e)-x,cy(e)-y)<r+Math.min(e.w,e.h)*.2);for(const e of list)this.nHit(e,damage,{element,skill:'u216',br:opts.br||23,...opts});this.fx216(opts.visual||'cut',x,y,r,opts.color||this.style216().color,{duration:opts.duration||.42,dir:opts.dir||this.player.dir});if(damage&&!this._vReplay)this.vRecord({kind:'circle',x,y,r,damage,element,layer:opts.layer||this.vLayer(),dir:opts.dir||this.player.dir,kx:opts.kx||0,ky:opts.ky||0,br:opts.br||23,visual:opts.visual||'cut',status218:{slow:opts.slow,root:opts.root,armor:opts.armor},origin218:{x,y}});return list;};
P.lift216=function(radius=150,strength=510){const p=this.player;p.onGround=false;p.vy=-strength;p.airDashes=Math.max(1,p.airDashes);for(const e of this.enemies)if(!e.dead&&dist(e,p)<radius&&this.vCanHit(e)){if(e.xBoss||e.anomaly216||e.type==='sentinel'){e.slow17=this.time+.45;continue;}e.root=0;e.freeze=0;e.vy=-strength;e.airborne=true;e.stun=.34;e.onGround=false;}this.mark216('lift');};
P.pressure216=function(kind,value){const s=this.uState216();if(this.roomById.get(this.currentRoomId)?.shelter)return;const key=kind==='time'?'time':'space';s[key]=cl(s[key]+value,0,100);};
P.cast216=function(slot){const s=this.uState216(),job=this.style216(),p=this.player,skill=job.skills[slot];if(!skill||p.downT>0||p.recoverT>.15||this.paused||this.modalM())return false;const id=job.id+':'+slot;
 if((s.cd[id]||0)>this.time+.00001){this.say(skill.name+' · '+(s.cd[id]-this.time).toFixed(1)+'s',.4,job.color);return false;}
 if(p.attack&&p.attack.elapsed<p.attack.def.hit){s.buffer={slot,style:job.id,until:this.time+.18};return false;}
 if(this.time-s.lastSkill<.06)return false;s.lastSkill=this.time;s.cd[id]=this.time+skill.cd;s.arc++;this.mark216('skill');this.nCancelHolds?.();this.pendingM=this.linkM=null;p.attack=null;p.buffer=null;p.history='';p.castT=slot===4?.04:.095;p.anim216={clip:slot===1?'jump':slot===3?'spin':job.id==='rail'||job.id==='bloom'?'cast':'cross',start:this.time,duration:slot===3?.40:.29,dir:p.dir};
 const a=this.nAim(),origin=center(p),target=this.nTarget(640,a),selected=this.currentElement||'shadow',follow=this.time-s.lastSwap<1.8;
 const ray=(len,dm,el=selected,opts={})=>this.ray216(center(p),{x:cx(p)+a.x*len,y:cy(p)+a.y*len},dm,el,opts);
 const area=(r,dm,el=selected,opts={})=>this.pulse216(cx(p)+p.dir*58,cy(p)-10,r,dm,el,opts);
 const later=(delay,fn,tag)=>this.schedule216(delay,fn,tag);const field=(type,pt,r,duration,extra={})=>this.field216(type,pt.x,pt.y,r,duration,{job:job.id,element:selected,...extra});
 this.commandLabel=skill.name;this.commandT=.9;this.sfx.skill();this.say(skill.name+' · '+skill.role,1,job.color);this.mEmit('skill',{id:'216_'+id,mode:'entropy216'});this.nEvent('skill','216_'+id);
 switch(job.id){
 case 'blade':
  if(slot===0)later(.07,()=>{area(115,29);if(follow)later(.13,()=>this.pulse216(cx(p)-p.dir*65,cy(p)-10,108,18,selected,{visual:'cross'}));});
  if(slot===1){this.lift216(160,525);later(.07,()=>area(135,26,selected,{ky:-380,visual:'rise'}));}
  if(slot===2){field('blade',origin,130,5);this.fx216('sigil',origin.x,origin.y,72,job.color);}
  if(slot===3)later(.09,()=>{if(s.trace&&this.time-s.trace.at<4)this.ray216(s.trace.a,s.trace.b,42,selected,{width:34,visual:'slashline'});area(155,35,selected,{visual:'cross',br:42});});
  if(slot===4){s.noPush=this.time+2;this.fx216('sigil',cx(p),cy(p),42,job.color);}
  break;
 case 'rail':
  if(slot===0)later(.065,()=>{ray(610,30,selected,{width:12,pierce:3});if(follow)later(.12,()=>ray(580,15,selected,{width:8,pierce:3}));});
  if(slot===1){this.lift216(100,515);later(.06,()=>this.ray216(origin,{x:origin.x,y:origin.y+230},24,selected,{width:30}));}
  if(slot===2){field('turret',origin,70,5,{aim:{...a}});later(.48,()=>{const f=s.fields.find(f=>f.kind==='turret'&&f.until>this.time);if(f&&!f.fired){f.fired=true;this.ray216(f,{x:f.x+f.aim.x*600,y:f.y+f.aim.y*600},32,selected,{width:16});}});}
  if(slot===3)later(.085,()=>{const t=this.findElementTarget(selected);if(t&&Math.hypot(cx(t.ref)-cx(p),cy(t.ref)-cy(p))<650){const mid=center(t.ref);this.ray216(center(p),mid,42,selected,{width:24});this.ray216(mid,{x:mid.x+a.x*390,y:mid.y+a.y*390},30,selected,{width:20});}else ray(780,62,selected,{width:24});});
  if(slot===4){p.dir*=-1;p.vx=-p.dir*150;p.vy=Math.min(p.vy,100);}
  break;
 case 'chrono':
  if(slot===0){later(.06,()=>area(112,23));later(.32,()=>area(126,25,selected,{visual:'cross'}));}
  if(slot===1){this.lift216(195,450);this.pulse216(origin.x,origin.y,195,12,'ice',{slow:1.15,visual:'clock'});for(const e of this.enemies)if(!e.dead&&dist(e,p)<195&&this.vCanHit(e))e.stun=Math.max(e.stun||0,e.xBoss?.18:.35);p.vy=Math.min(p.vy,-150);}
  if(slot===2){if(s.pin)s.pin.until=0;s.pin=field('pin',{x:origin.x+a.x*145,y:origin.y+a.y*145},138,.86,{detonate:true});this.pressure216('time',3);}
  if(slot===3)later(.08,()=>{for(const e of this.enemies){if(e.dead||dist(e,p)>(this.range217?this.range217(350):350)||!this.vCanHit(e))continue;const debt=s.receipts.get(e.id)||[],sum=debt.filter(q=>q.at>this.time-4).reduce((n,q)=>n+q.damage,0);s.receipts.delete(e.id);this.nHit(e,26+Math.min(90,sum*.34),{element:'shadow',skill:'u216-settle',br:35});s.receipts.delete(e.id);this.fx216('clock',cx(e),cy(e),100,job.color);}this.pressure216('time',5);});
  if(slot===4){if(s.pin&&s.pin.until>this.time){s.pin.x=cx(p)+p.dir*60;s.pin.y=cy(p);}else this.pulse216(cx(p),cy(p),140,0,'ice',{slow:.45,visual:'clock'});}
  break;
 case 'gravity':
  if(slot===0){ray(500,22,'gravity',{width:24});if(target){if(target.xBoss||target.type==='sentinel'||target.anomaly216){const side=cx(p)<cx(target)?-1:1;this.nMoveTo(cx(target)+side*(target.w/2+p.w+18)-p.w/2,target.y+target.h-p.h,'牽星');}else{field('pull',{x:cx(p)+p.dir*(s.reverse?-220:65),y:cy(p)-35},350,.58);}}}
  if(slot===1){this.lift216(230,510);field('lift',{x:cx(p)+p.dir*50,y:cy(p)-100},200,.8);area(175,18,'gravity',{visual:'rise'});}
  if(slot===2){const t=this.findElementTarget(selected),b=t?center(t.ref):{x:origin.x+a.x*280,y:origin.y+a.y*280};field('tether',{x:(origin.x+b.x)/2,y:(origin.y+b.y)/2},240,3.4,{a:origin,b});}
  if(slot===3){field('pull',{x:cx(p)+p.dir*100,y:cy(p)+30},300,.4);later(.31,()=>area(215,59,'gravity',{br:44,visual:'nova',ky:110}));}
  if(slot===4){s.reverse=!s.reverse;this.say(s.reverse?'反向牽引 · 推離':'正向牽引 · 聚攏',1.2,job.color);}
  break;
 case 'spirit':
  if(!s.pet||s.pet.until<this.time)s.pet={x:origin.x+p.dir*95,y:origin.y-35,until:this.time+22,layer:this.vLayer()};else s.pet.until=this.time+22;
  if(slot===0){later(.06,()=>area(118,22));later(.20,()=>{const t=target&&!target.dead?center(target):{x:cx(p)+p.dir*115,y:cy(p)};this.pulse216(t.x,t.y,98,18,selected,{visual:'spirit'});s.pet.x=t.x;s.pet.y=t.y-45;});}
  if(slot===1){this.lift216(165,520);later(.07,()=>area(142,23,'wind',{ky:-330,visual:'rise'}));}
  if(slot===2){const old=center(p),dest=this.swapLanding215(s.pet.x-p.w/2,s.pet.y-p.h/2,p.w,p.h);if(dest&&!this.nGatePath(p,dest,p.w,p.h)){Object.assign(p,dest,{onGround:false,inv:Math.max(.25,p.inv)});s.pet.x=old.x;s.pet.y=old.y;this.vInit().discontinuity=true;s.trace={a:old,b:center(p),at:this.time};s.lastSwap=this.time;this.pressure216('space',3);this.pulse216(old.x,old.y,112,20,selected,{visual:'spirit'});area(110,22,selected,{visual:'spirit'});}else{this.say('契靈落點受阻；改為身旁協擊，沒有穿牆。',1.5);area(118,30,selected,{visual:'spirit'});}}
  if(slot===3){const marked=this.enemies.find(e=>e.id===s.pet.target&&!e.dead)||target;for(let k=0;k<3;k++)later(.08+k*.17,()=>{const at=marked&&!marked.dead?center(marked):{x:cx(p)+p.dir*120,y:cy(p)};if(Math.hypot(at.x-cx(p),at.y-cy(p))<700)this.pulse216(at.x,at.y,135,24,selected,{visual:'spirit'});});}
  if(slot===4){s.pet.target=target?.id;if(!target){s.pet.x=cx(p)+p.dir*90;s.pet.y=cy(p)-35;}else{target.marked17=this.time+4;this.fx216('sigil',cx(target),cy(target),42,job.color);}}
  break;
 case 'bloom':
  if(slot===0)later(.065,()=>{const el=['water','fire','lightning'][s.recipe];for(const e of ray(490,24,el,{width:18,br:36})){e.armorBreak=3;this.status216(e,el,{x:cx(e),y:cy(e)});}});
  if(slot===1){this.lift216(160,520);later(.06,()=>area(142,24,'nature',{ky:-350,visual:'bloom'}));}
  if(slot===2)field('garden',{x:origin.x+a.x*125,y:origin.y+a.y*125},155,4.8,{element:'nature'});
  if(slot===3)later(.08,()=>{for(const e of this.enemies){if(e.dead||dist(e,p)>(this.range217?this.range217(300):300)||!this.vCanHit(e))continue;const count=['wet','burn','freeze','root','armorBreak'].filter(k=>e[k]>0).length;this.nHit(e,30+count*16,{element:'nature',skill:'u216',br:38});for(const k of ['wet','burn','freeze','root','armorBreak'])e[k]=0;this.fx216('bloom',cx(e),cy(e),120+count*7,job.color);}for(const f of s.fields)if(f.kind==='garden'&&Math.hypot(f.x-cx(p),f.y-cy(p))<500){f.until=0;this.pulse216(f.x,f.y,160,22,'nature',{visual:'bloom'});}});
  if(slot===4){s.recipe=(s.recipe+1)%3;this.say('腐蝕針配方：'+['水 · 導電準備','火 · 引燃爆裂','雷 · 濕潤連鎖'][s.recipe],1.3,job.color);}
  break;
 }
 return true;
};
P.useSkill=function(slot){return slot===4?this.echo216():this.cast216(slot);};P.useClassSkill=function(){return this.cast216(4);};
// Preserve command grammar but make every style's melee an actual combo bridge.
const attack=P.classAttack;P.classAttack=function(def,key){const d=attack.call(this,def,key),heavy=key.endsWith('X'),scale=(heavy?.37:.30)/d.dur;d.dur*=scale;d.pulses19=(d.pulses19||[d.hit]).map(x=>x*scale);d.hit=d.pulses19[0];d.cancel=Math.max(d.pulses19.at(-1)+.025,d.dur*.63);d.kx=Math.min(60,Math.abs(d.kx||0));d.lunge=0;d.lockMove=false;d.dmg=Math.max(heavy?22:16,d.dmg);return d;};
const attacks=P.updateAttacks;P.updateAttacks=function(dt){const result=attacks.call(this,dt);if(this.hitStop>0){this.player.poseStop216=Math.max(this.player.poseStop216||0,Math.min(.04,this.hitStop));this.hitStop=0;}return result;};
const startAttack=P.startAttack;P.startAttack=function(key){const result=startAttack.call(this,key);if(this.player.attack&&!this.player.onGround&&this.uState216().metrics.lift)this.mark216('airCombo');return result;};
const damage=P.damageEnemy;P.damageEnemy=function(e,amount,kx=0,ky=0,def={}){const s=this.uState216(),hp=e.hp,stamp=this._nReceiptSeq||0;if(s.noPush>this.time&&def.mCommand){kx=0;s.noPush=0;}if(e.expose216>this.time)amount*=1.18;damage.call(this,e,amount,kx,ky,def);const receipt=this._nReceipts?.get(e.id),dealt=e.practiceM&&receipt?.seq>stamp?receipt.damage:Math.max(0,hp-e.hp);if(dealt>0){if(!def.isEcho&&!this._vReplay){const arr=(s.receipts.get(e.id)||[]).filter(q=>q.at>this.time-4);arr.push({at:this.time,damage:dealt});s.receipts.set(e.id,arr.slice(-40));if(s.receipts.size>100)s.receipts.delete(s.receipts.keys().next().value);}if(String(def.master?.skill).startsWith('u216')||String(def.master?.skill).startsWith('216'))this.mark216('skillHit');if(def.isEcho)this.mark216('echoHit');s.lastDamage=this.time;}
 if(hp>0&&e.hp<=0){this.mark216('kill');if(e.anomaly216&&!e.reward216){e.reward216=true;s.defeated[e.anomaly216]++;s[e.anomaly216]=Math.max(0,s[e.anomaly216]-45);s.coolUntil=this.time+60;s.active=null;s.warning=null;this.mark216('anomaly');this.fx216('nova',cx(e),cy(e),210,e.anomaly216==='time'?'#f1c995':'#ba98ff',{duration:.85});this.say((e.anomaly216==='time'?'時間':'空間')+'魔物消解｜失控 −45 · 記憶被保存',3);this.saveProgress();}}
};
// Reactions are local, consume existing states, and cannot recursively multiply.
P.status216=function(e,id,at={x:cx(e),y:cy(e)}){if(e.dead)return;const boss=e.xBoss||e.anomaly216||e.type==='sentinel';
 if(id==='fire'){const thermal=e.freeze>0,roots=e.root>0;if(thermal||roots){e.freeze=0;e.root=0;this.pulse216(cx(e),cy(e),120,thermal?24:20,'fire',{echo:true,visual:'bloom',color:'#ffc58d'});this.mark216('reaction');}e.burn=Math.max(e.burn||0,3.2);}
 if(id==='ice'){e.freeze=Math.max(e.freeze||0,boss?.22:e.wet>0?1.65:.72);if(e.wet>0){this.mark216('reaction');e.vy=Math.min(e.vy,0);}}
 if(id==='lightning'){e.stun=Math.max(e.stun||0,boss?.17:.35);if(e.wet>0){const near=this.enemies.filter(f=>f!==e&&!f.dead&&this.vCanHit(f)&&Math.hypot(cx(f)-cx(e),cy(f)-cy(e))<250).slice(0,3);for(const f of near)this.ray216(center(e),center(f),13,'lightning',{echo:true,width:9,color:'#ffe8a0'});this.mark216('reaction');}}
 if(id==='wind'){if(!boss){e.vy=Math.min(e.vy,-310);e.vx=this.player.dir*290;e.onGround=false;}else e.slow17=this.time+.35;}
 if(id==='earth')e.armorBreak=Math.max(e.armorBreak||0,4);
 if(id==='water'){e.wet=6;e.burn=0;if(e.root>0)this.grow216(cx(e),cy(e)+65);}
 if(id==='light'){e.hidden=false;e.expose216=this.time+4;e.v16LinkUntil=this.time+4;this.mark216('expose');}
 if(id==='shadow'){e.curse=4;e.dir=-this.player.dir;}
 if(id==='nature'){e.root=boss?.3:1.15;if(e.wet>0)this.grow216(cx(e),cy(e)+65);}
 if(id==='gravity'&&!boss){e.stun=Math.max(e.stun||0,.15);e.vy=Math.min(e.vy,0);}
};
P.grow216=function(x,y){const s=this.uState216();if(this.time<(s.growthAt||0))return;s.growthAt=this.time+.8;this.platform216('vinePillar',x,y,175,5.5);this.mark216('growth');this.fx216('bloom',x,y-40,90,'#baddaa');};
P.platform216=function(type,x,y,w=165,t=4){const existing=this.fields.filter(f=>f.u216&&f.type===type&&f.t>0);if(existing.length>=3)existing[0].t=0;const f={id:this.id(),u216:true,type,x:x-w/2,y,w,h:17,t,color:C.ELEMENTS.find(e=>e.id===({icePlatform:'ice',earthPillar:'earth',vinePillar:'nature'}[type]||'light')).color,oneWay:true};this.fields.push(f);return f;};
// Keep hit marks/guard interaction from the base game, but cap hard crowd control.
const elemHit=P.applyElementHit;P.applyElementHit=function(e,el,shot){const before={freeze:e.freeze,root:e.root};const result=elemHit.call(this,e,el,shot);if(result){if(el.id==='fire'){e.freeze=Math.max(e.freeze,before.freeze||0);e.root=Math.max(e.root,before.root||0);}this.status216(e,el.id,center(shot));if(e.xBoss||e.anomaly216||e.type==='sentinel'){e.freeze=Math.min(.25,e.freeze);e.root=Math.min(.35,e.root);e.stun=Math.min(.35,e.stun);}}return result;};
P.elementSwapEffect=function(el,old,now){const s=this.uState216(),p=this.player,rank=Number(this.xState().elements[el.id]?.rank)||0,a={x:old.cx,y:old.cy},b={x:now.x,y:now.y};
 const radius=165+Math.min(2,rank)*12,life=2.6+Math.min(3,rank)*.35;this.fx216('gate',a.x,a.y,58,el.color);this.fx216('gate',b.x,b.y,58,el.color);
 if(el.id==='fire'){this.field216('fire',a.x,a.y,125,life,{element:el.id});this.pulse216(b.x,b.y,130,17,'fire',{visual:'bloom',color:el.color});}
 if(el.id==='ice'){this.platform216('icePlatform',b.x,p.y+p.h+5,170,5);this.pulse216(b.x,b.y,150,11,'ice',{visual:'ice',color:el.color});}
 if(el.id==='lightning'){this.ray216(a,b,24,'lightning',{width:23,color:el.color});this.field216('lightning',b.x,b.y,radius,life,{element:el.id});}
 if(el.id==='wind'){this.field216('wind',b.x,b.y,155,2.6,{element:el.id});p.vy=Math.min(p.vy,-250);}
 if(el.id==='earth'){this.platform216('earthPillar',b.x,p.y+p.h+7,155,5.5);p.armor=Math.max(p.armor||0,1.2);this.pulse216(b.x,b.y,145,21,'earth',{br:58,visual:'ice',color:el.color});}
 if(el.id==='water'){this.field216('water',b.x,b.y,155,life,{element:el.id});p.burn=0;}
 if(el.id==='light')this.field216('light',b.x,b.y,radius,life,{element:el.id});
 if(el.id==='shadow'){this.field216('decoy',a.x,a.y,285,3,{element:el.id});p.inv=Math.max(p.inv,.32);}
 if(el.id==='nature'){this.field216('nature',b.x,b.y,radius,life,{element:el.id});this.platform216('vinePillar',b.x,p.y+p.h+5,150,4.5);}
 if(el.id==='gravity')this.field216('gravity',b.x,b.y,240,1.5,{element:el.id});
 for(const e of this.enemies)if(!e.dead&&this.vCanHit(e)&&Math.hypot(cx(e)-b.x,cy(e)-b.y)<radius)this.status216(e,el.id,b);
 // Field-to-field recipes are localized; no global every-wet-enemy damage.
 for(const f of s.fields)if(f.until>this.time&&f.element!==el.id&&Math.hypot(f.x-b.x,f.y-b.y)<f.r+50){if((f.element==='water'&&el.id==='nature')||(f.element==='nature'&&el.id==='water'))this.grow216(b.x,p.y+p.h+5);if(f.kind==='garden'&&el.id==='fire'){f.until=0;this.pulse216(f.x,f.y,170,36,'fire',{visual:'bloom',color:'#ffd0a1'});}if(f.kind==='garden'&&el.id==='water')f.until=Math.min(this.time+7,f.until+1.5);}
 this.xState().stats.swaps++;this.nEvent('evolution',el.id+':216');this.xSignal('swap',el.id);return{element:el.id,a,b,rank};
};
P.checkElementCombo=function(current){this.elementComboPrev=current;this.elementComboTime=this.time;};
const fire=P.fireElement;P.fireElement=function(el,i){const ok=fire.call(this,el,i);if(ok){this.player.anim216={clip:'cast',start:this.time,duration:.24,dir:this.player.dir};this.mark216('fire');}return ok;};
const swap=P.swapElement;P.swapElement=function(target,el,i){const p=this.player,s=this.uState216(),before=center(p),air=!p.onGround;const ok=swap.call(this,target,el,i);if(!ok)return false;const after=center(p);s.lastSwap=this.time;s.trace={a:before,b:after,at:this.time};this.mark216('swap');if(air)this.mark216('airSwap');this.pressure216('space',2);p.anim216={clip:'dash',start:this.time,duration:.16,dir:p.dir};
 for(const f of s.fields){if(f.until<=this.time||f.layer!==this.vLayer())continue;if(f.kind==='blade'){f.until=0;this.ray216(f,after,36,el.id,{width:29,visual:'slashline'});}if(f.kind==='turret'){f.fired=true;f.until=0;this.ray216(f,after,42,el.id,{width:21});}}
 // Cancels recovery, never refunds charges or skill cooldowns.
 s.buffer=null;return true;};
// One press, same law before/during/after. No rails, no duplicate drops or healing.
P.echo216=function(){const s=this.uState216(),v=this.vInit();if(this.paused||this.modalM()||(s.cd.echo||0)>this.time||v.echo)return false;const layer=this.vLayer(),path=v.path.filter(q=>q.at>this.time-3&&q.layer===layer),actions=v.actions.filter(a=>a.at>this.time-3&&a.layer===layer);if(path.length<2){this.say('先移動或出手，既視感才有片段可重播。',1.2);return false;}const mode=v.mode;this.vMakeEcho();v.mode=mode;v.rails=[];if(!v.echo)return false;v.echo.actions=v.echo.actions.slice(0,48);s.cd.echo=this.time+3.4;s.echoLaw=mode;this.mark216('echo');this.pressure216('time',7);this.say('既視感｜重播最近三秒，結束自動消散，不切換世界',2,'#eed09d');return true;};
const switchLaw=P.vSwitch;P.vSwitch=function(mode){if(mode==='echo')return this.echo216();const old=this.vInit().mode,ok=switchLaw.call(this,mode);if(ok&&this.vInit().mode!==old){this.mark216(this.vInit().mode);this.pressure216(['past','future','decay'].includes(mode)?'time':'space',mode==='now'?0:4);}return ok;};
// Exactly .40 for melee and projectile echoes, regardless of old talent branches.
P.vReplayHit=function(a){if(a.layer!==this.vLayer())return;this._vReplay=true;try{if(a.kind==='line18')return this.ray216(a.a,a.b,a.damage*.4,a.element,{echo:true,layer:a.layer,width:a.width,color:'#efd49e'});if(a.kind==='projectile'){this.vInit().echoShots.push({...a,id:this.id(),left:2.5,hit:new Set()});return;}for(const e of this.enemies){if(e.dead||!this.vCanHit(e,a.layer,a.element))continue;const contact=a.kind==='box'?overlap(a,e):Math.hypot(cx(e)-a.x,cy(e)-a.y)<a.r;if(contact)this.nHit(e,Math.max(1,a.damage*.4),{element:a.element,echo:true,layer:a.layer,skill:'echo216',br:8});}this.fx216('clock',a.kind==='box'?cx(a):a.x,a.kind==='box'?cy(a):a.y,Math.min(135,a.r||a.w||95),'#efd49e',{duration:.25});}finally{this._vReplay=false;}};
// Old force calls are no longer allowed to accumulate an unbounded velocity.
P.gravityPull=function(x,y,r,power){for(const e of this.enemies){if(e.dead||!this.vCanHit(e))continue;const dx=x-cx(e),dy=y-cy(e),m=Math.hypot(dx,dy)||1;if(m<r){const mass=(e.xBoss||e.type==='sentinel'||e.anomaly216)?.12:1;e.vx=cl(e.vx+dx/m*power*mass,-620,620);e.vy=cl(e.vy+dy/m*power*mass,-600,550);}}};
P.tickFields216=function(dt){const s=this.uState216(),p=this.player,now=this.time,layer=this.vLayer(),gravity=[];for(const shot of this.elementShots)if(shot.t>0&&shot.anchor&&shot.element==='gravity'&&(shot.v16Layer||'B')===layer)gravity.push({x:cx(shot),y:cy(shot),r:240,kind:'gravity'});
 for(const f of s.fields){this.fieldContext217=f.context217||null;if(f.layer!==layer)continue;const life=f.until-now;if(life<=0){if(f.detonate&&!f.done){f.done=true;this.pulse216(f.x,f.y,f.r,42,'shadow',{visual:'clock',color:'#f1c995'});}continue;}
  if(f.kind==='garden')for(const shot of this.elementShots){if(shot.t<=0||!['fire','water'].includes(shot.element)||(shot.v16Layer||'B')!==layer||Math.hypot(cx(shot)-f.x,cy(shot)-f.y)>f.r)continue;f.infused216=f.infused216||[];if(f.infused216.includes(shot.id))continue;f.infused216.push(shot.id);if(f.infused216.length>16)f.infused216.shift();if(shot.element==='water')f.until=Math.min(now+7,f.until+1.5);else{f.until=now;this.pulse216(f.x,f.y,170,36,'fire',{visual:'bloom',color:'#ffd0a1'});this.mark216('reaction');break;}}
  if(['gravity','pull','tether','lift'].includes(f.kind))gravity.push(f);
  if(['water','wind'].includes(f.kind)&&Math.hypot(cx(p)-f.x,cy(p)-f.y)<f.r&&this.key('up')){p.vy=Math.min(p.vy,f.kind==='wind'?-360:-280);p.onGround=false;}
  if(f.kind==='wind')for(const q of this.enemyShots)if(!q.friendly&&q.t>0&&Math.hypot(cx(q)-f.x,cy(q)-f.y)<f.r&&!q.wind216){q.vx=p.dir*Math.max(220,Math.abs(q.vx));q.vy=-100;q.wind216=true;}
  if(['water','fire'].includes(f.kind)&&this.vInit().mode==='fungal')for(const q of this.nInit().structures){if(!q.fungus18||q.until<=now||Math.hypot(q.x+q.w/2-f.x,q.y-f.y)>f.r)continue;if(f.kind==='water'){q.w=140;q.until=Math.max(q.until,now+3);}else{q.until=now;this.pulse216(q.x+q.w/2,q.y,110,18,'fire',{echo:true,visual:'bloom'});}}
  if(f.kind==='decoy')for(const e of this.enemies)if(!e.dead&&!e.xBoss&&Math.hypot(cx(e)-f.x,cy(e)-f.y)<f.r){e.dir=Math.sign(f.x-cx(e))||1;e.vx=e.dir*70;}
  if(f.tick<=now){f.tick=now+.4;if(['fire','lightning','garden'].includes(f.kind))this.vRecord({kind:'circle',x:f.x,y:f.y,r:f.r,damage:5*(this.tuning217?this.tuning217().damageScale:1),element:f.kind==='garden'?'nature':f.element,layer:f.layer,visual:'field',fieldTick218:true,origin218:{x:f.x,y:f.y}});for(const e of this.enemies){if(e.dead||!this.vCanHit(e)||Math.hypot(cx(e)-f.x,cy(e)-f.y)>f.r)continue;const el=f.kind==='garden'?'nature':f.element;if(['fire','lightning','water','light','nature','garden'].includes(f.kind)){this.status216(e,el,f);if(['fire','lightning','garden'].includes(f.kind))this.nHit(e,5,{element:el,skill:'field216',echo:true,geometry218:true});}}
   if(f.kind==='garden'&&this.vInit().mode==='fungal'&&!f.platform){f.platform=true;this.grow216(f.x,f.y+60);}}
 }
 this.fieldContext217=null;
 // Apply one strongest attraction per enemy AFTER base AI; its desired movement
 // therefore cannot overwrite the suction. Collision substeps still apply.
 for(const e of this.enemies){if(e.dead||!this.vCanHit(e))continue;let best=null,bd=Infinity;for(const f of gravity){const d=Math.hypot(cx(e)-f.x,cy(e)-f.y);if(d<f.r&&d<bd&&(!f.a||segment(cx(e),cy(e),f.a,f.b)<115)){best=f;bd=d;}}if(!best)continue;
  const boss=e.xBoss||e.type==='sentinel'||e.anomaly216;if(boss){e.slow17=Math.max(e.slow17||0,now+.2);continue;}
  const dx=best.x-cx(e),dy=best.y-cy(e),m=Math.hypot(dx,dy)||1,reverse=this.vInit().mode==='invert'||best.kind==='tether'&&s.reverse?-1:1;
  e.freeze=0;e.root=0;e.stun=Math.max(e.stun||0,.08);e.vx=cl(dx*6.2,-520,520)*reverse;e.vy=cl(dy*6.2,-510,510)*reverse;if(best.kind==='lift')e.vy=-330;e.onGround=false;const before={x:e.x,y:e.y};this.moveBody(e,dt);if(Math.hypot(e.x-before.x,e.y-before.y)>.4)this.mark216('gravityPull');if(m<30){e.vx*=.25;e.vy*=.25;}}
 s.fields=s.fields.filter(f=>f.until>now||f.detonate&&!f.done);s.fx=s.fx.filter(f=>now-f.at<f.duration);if(s.pet){if(s.pet.until<now)s.pet=null;else if(Math.hypot(s.pet.x-cx(p),s.pet.y-cy(p))>760){s.pet.x=cx(p)+p.dir*95;s.pet.y=cy(p)-50;}}
};
const update=P.update;P.update=function(dt,ts){const s=this.uState216(),before=this.time,ground=this.player.onGround,vy=this.player.vy;if(this.hitStop>0)this.hitStop=0;update.call(this,dt,ts);if(!(dt>0)||this.paused||this.modalM())return;const elapsed=this.time-before;if(!(elapsed>0))return;
 if(s.buffer){const b=s.buffer;if(b.until<this.time||b.style!==s.style)s.buffer=null;else if(!this.player.attack||this.player.attack.elapsed>=this.player.attack.def.hit){s.buffer=null;this.cast216(b.slot);}}
 const due=s.queue.filter(q=>q.at<=this.time);s.queue=s.queue.filter(q=>q.at>this.time);for(const q of due)if(q.epoch===s.epoch&&q.layer===this.vLayer())q.fn();this.tickFields216(elapsed);
 if(!ground&&this.player.vy<0&&vy>180&&this.vInit().mode==='elastic')this.mark216('bounce');
 this.tickWorld216?.(elapsed);s.history.push({x:this.player.x,y:this.player.y,at:this.time});while(s.history.length>190)s.history.shift();if(this.nInit().fx.length>90)this.nInit().fx.splice(0,this.nInit().fx.length-90);if(this.effects?.length>160)this.effects.splice(0,this.effects.length-160);
 if(this.time>s.saveAt){s.saveAt=this.time+8;this.saveProgress();}this.hitStop=0;
};
const respawn=P.respawn;P.respawn=function(reason){const s=this.uState216();s.epoch++;s.queue=[];s.fields=[];s.fx=[];s.buffer=null;s.pet=null;s.pin=null;s.trace=null;s.history=[];s.receipts.clear();if(s.active){const e=this.enemies.find(e=>e.id===s.active);if(e)e.dead=true;s.time=Math.max(0,s.time-35);s.space=Math.max(0,s.space-35);s.active=null;s.coolUntil=this.time+60;}s.warning=null;const result=respawn.call(this,reason);this.player.anim216=null;this.save216();return result;};
})();
