/* V21.7 content/runtime bridge. Loaded LAST, before DOMContentLoaded starts the game.
 * No external services. Pure content is in data/atlas217_config.js.
 * Never grants swap charges, loot or life from a training target / echo recursion.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,ATT=ES9_ENGINE.ATT;
const cfg=()=>window.ES217_CONFIG,cl=(n,a,b)=>Math.max(a,Math.min(b,n)),cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const copy=o=>JSON.parse(JSON.stringify(o));
window.ES217={version:'21.7.0',images:new Map(),config:cfg,copy,cl,cx,cy};
ES217.image=function(path){const url=window.ES215_EMBEDDED?.[path]||window.ES9_ASSET_URIS?.[path]||path;if(this.images.has(url))return this.images.get(url);const im=new Image();im.decoding='async';im.src=url;this.images.set(url,im);return im;};
ES217.src=path=>window.ES215_EMBEDDED?.[path]||path;
ES217.validate=function(q){const errors=[];const num=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
 if(!q||q.schema!==1)return ['schema 必須為 1'];
 for(const k of ['hero','combat','swap','skills','branches','gear','world','enemies'])if(!q[k])errors.push('缺少 '+k);
 if(errors.length)return errors;
 if(!num(q.hero.scale,.35,2.5))errors.push('hero.scale 必須在 0.35–2.5');
 if(typeof q.hero.atlas!=='string'||!/^assets\/[a-zA-Z0-9_./-]+\.(webp|png)$/.test(q.hero.atlas)||q.hero.atlas.includes('..'))errors.push('角色圖集必須是 assets/ 內的 PNG/WebP 相對路徑');
 for(const key of ['anchor','cell'])if(!Array.isArray(q.hero[key])||q.hero[key].length!==2||q.hero[key].some(v=>!num(v,1,4096)))errors.push('hero.'+key+' 必須是兩個正數');
 if(!q.combat.commands?.Z||!q.combat.commands?.X)errors.push('不得移除 Z 或 X');
 if(!num(q.combat.comboGapSeconds,.2,2))errors.push('連段間隔需 0.2–2 秒');
 if(!num(q.combat.bufferSeconds,.05,.5))errors.push('輸入緩衝必須 0.05–0.5 秒');
 for(const [key,d] of Object.entries(q.combat.commands||{})){
  if(!/^(?:(?:DASH)?AIR|DASH)?[UZDX]+$/.test(key))errors.push('指令代碼不合法：'+key);
  if(!num(d.width,24,900)||!num(d.height,24,600)||!num(d.offsetY,-500,300))errors.push(key+' 判定尺寸或 offsetY 越界');
  if(!num(d.damage,1,500)||!num(d.duration,.12,2)||!num(d.cancel,.03,d.duration))errors.push(key+' 傷害或時序越界');
  if(!Array.isArray(d.pulses)||d.pulses.length<1||d.pulses.length>6||d.pulses.some((v,i)=>!num(v,.015,d.duration-.02)||(i>0&&v<=d.pulses[i-1]))||d.cancel<d.pulses.at(-1))errors.push(key+' 命中時刻需遞增且早於取消/結束');
  if(d.action218){const m=d.action218;
   if(m.travel!==undefined&&(!num(m.travel,-360,360)||!num(m.moveFrom,0,d.duration)||!num(m.moveTo,.01,d.duration)||m.moveTo<=m.moveFrom))errors.push(key+' 位移距離或時序無效');
   if(m.rise!==undefined&&!num(m.rise,-850,-50))errors.push(key+' 升空速度越界');
   if(m.dive!==undefined&&!num(m.dive,100,1000))errors.push(key+' 墜擊速度越界');
   if(m.hover!==undefined&&!num(m.hover,0,d.duration))errors.push(key+' 滯空時序越界');
   for(const k of ['launcher','finisher','bounce'])if(m[k]!==undefined&&typeof m[k]!=='boolean')errors.push(key+' '+k+' 必須為布林值');
  }
  if(!ES217_HERO.clips[d.clip])errors.push(key+' 動作 clip 不存在：'+d.clip);
  if(!num(d.knockX,-700,700)||!num(d.knockY,-1000,1000)||!num(d.break,0,300))errors.push(key+' 擊退或破勢越界');
 }
 if(!num(q.swap.rechargeSeconds,.5,8)||!num(q.swap.groundedDelay,0,2)||q.swap.maximumCapacity!==3||q.swap.airRecharge!==false)errors.push('本版固定容量上限 3、禁止空中回充；回充秒數需 0.5–8');
 for(const j of ES216.styles){const a=q.skills[j.id];if(!Array.isArray(a)||a.length!==5){errors.push('流派 '+j.id+' 必須有五招設定');continue;}a.forEach((v,i)=>{if(!num(v.damageScale,.2,3)||!num(v.rangeScale,.5,2)||!num(v.cooldownScale,.25,3))errors.push(j.id+' 技能 '+i+' 倍率越界');});}
 if(!Array.isArray(q.gear)||q.gear.length>100)errors.push('gear 必須為最多 100 件的陣列');
 for(const g of q.gear||[]){if(!['lightReach','heavyBreak','orbitHit','delayedHeavy','swapShield','lifesteal','satellite','groundRefill','heal','stability'].includes(g.effect)||!num(g.value,.01,500))errors.push('未知效果或數值無效：'+g.id);if(!/^[A-Za-z0-9_]+$/.test(g.id)||!['weapon','relic','consumable'].includes(g.slot)||!g.cost||Object.values(g.cost).some(v=>!Number.isInteger(v)||v<0||v>999))errors.push('裝備配方無效：'+g.id);}
 if(new Set((q.gear||[]).map(g=>g.id)).size!==(q.gear||[]).length)errors.push('裝備 id 不得重複');
 if(!Array.isArray(q.world.biomes)||q.world.biomes.length!==8)errors.push('本版美術總覽需保留八個區域');
 for(const patch of q.world.roomPatches||[]){if(!ES9_WORLD.rooms.some(r=>r.id===patch.id))errors.push('未知房間 '+patch.id);for(const p of patch.platforms||[]){if(!num(p.x,-500,10000)||!num(p.floorOffset,-3000,300)||!num(p.w,30,2000)||!num(p.h,8,120)||!Array.isArray(p.modes)||p.modes.some(v=>!ES216.laws.some(l=>l[0]===v)))errors.push(patch.id+' 平台設定無效');}for(const s of patch.spawns||[])if(!C.ENEMIES[s.type]||!num(s.x,0,10000))errors.push(patch.id+' 未知怪物或座標：'+s.type);}
 for(const [id,e] of Object.entries(q.enemies||{}))if(!C.ENEMIES[id]||['hpScale','damageScale','speedScale'].some(k=>!num(e[k],.1,5)))errors.push('怪物倍率/種類無效：'+id);
 return errors;
};
const alias={LZ:'Z',RZ:'Z',LX:'X',RX:'X',DASHZ:'ZX',DASHX:'X',AIRZZ:'AIRZ',AIRUZ:'UZ',AIRUX:'UX',AIRDZ:'DZ',AIRDX:'AIRX',ZZZX:'ZZX',ZZXZ:'XXZZ',ZXZZ:'XZZ',XZZX:'XXZZ',XZXX:'ZZXX',XXZX:'XXZ'};
ES217.installCommands=function(){for(const [key,d] of Object.entries(cfg().combat.commands)){ATT[key]={name:key+'・'+d.name,key,shape19:d.shape,w:d.width,h:d.height,oy:d.offsetY,dmg:d.damage,dur:d.duration,hit:d.pulses[0],cancel:d.cancel,pulses19:[...d.pulses],kx:d.knockX,ky:d.knockY,br:d.break,kd:4,anim:d.weight==='heavy'?'x':'z1',big:d.weight==='heavy',launch:d.knockY<-200,explicitKnockback:!!d.knockX||!!d.knockY,lunge:0,mCommand:true,clip217:d.clip,weight217:d.weight,desc19:d.hint,source217:true,action218:d.action218||{}};ES19.commands[key]=ATT[key];}for(const [k,v]of Object.entries(alias))if(ATT[v]&&!cfg().combat.commands[k])ATT[k]={...ATT[v],key:k,name:k+'・'+ATT[v].name.split('・')[1]};};
ES217.installCommands();
Object.assign(ES215_SWAP,{airRefill:false,groundRequired:true});
P.aState217=function(){if(this.a217)return this.a217;const q=this.progress.atlas217||{},ids=new Set(cfg().gear.map(g=>g.id));const owned={moonEdge:1,riftBreaker:1,wardSpindle:1,tonic:2,grounding:1};if(q.owned)for(const [k,v]of Object.entries(q.owned))if(ids.has(k)&&Number.isFinite(v))owned[k]=cl(Math.floor(v),0,999);
 const branches={};for(const j of ES216.styles){const id=q.branches?.[j.id];if(cfg().branches[j.id]?.some(b=>b.id===id))branches[j.id]=id;}
 const weapon=cfg().gear.find(g=>g.id===q.weapon&&g.slot==='weapon'&&owned[g.id])?.id||'moonEdge';
 return this.a217={schema:1,xp:cl(Number(q.xp)||0,0,1e7),kills:cl(Number(q.kills)||0,0,1e7),materials:{echo:cl(Number(q.materials?.echo??8),0,99999),glass:cl(Number(q.materials?.glass??2),0,99999),dust:cl(Number(q.materials?.dust)||0,0,99999)},owned,weapon,relics:Array.isArray(q.relics)?[...new Set(q.relics)].filter(id=>owned[id]&&cfg().gear.some(g=>g.id===id&&g.slot==='relic')).slice(0,2):['wardSpindle'],branches,waypoint:typeof q.waypoint==='string'?q.waypoint:null,cd:{},hitCount:0,metrics:{lightHits:0,heavyHits:0,launchHits:0,swaps:0,skills:0},training:{},debug:false,at:0};};
P.save217=function(){const s=this.aState217();this.progress.atlas217=copy({schema:1,xp:s.xp,kills:s.kills,materials:s.materials,owned:s.owned,weapon:s.weapon,relics:s.relics,branches:s.branches,waypoint:s.waypoint});};
const save=P.saveProgress;P.saveProgress=function(...args){if(this.a217)this.save217();return save.apply(this,args);};
P.level217=function(){return Math.min(30,1+Math.floor(this.aState217().xp/80)+Math.floor(this.uState216().memory.length/3));};
P.gear217=function(effect){const s=this.aState217();return cfg().gear.find(g=>g.effect===effect&&(s.weapon===g.id||s.relics.includes(g.id)))||null;};
P.branch217=function(style=this.style216().id){return this.aState217().branches[style]||null;};
P.selectBranch217=function(style,id){if(!this.roomById.get(this.currentRoomId)?.shelter){this.say('請在避難所選擇或重配分支。',2);return false;}if(!cfg().branches[style]?.some(b=>b.id===id))return false;this.aState217().branches[style]=id;this.saveProgress();this.say('分支已裝備；不會回復既有冷卻或換位次數。',2);return true;};
P.classAttack=function(def,key){const d={...def,key,pulses19:[...(def.pulses19||[def.hit])],mCommand:true,mClass:this.player.classId,lockMove:false};const s=this.aState217(),heavy=d.weight217==='heavy';
 if(this.gear217('lightReach')&&!heavy)d.w*=this.gear217('lightReach').value;
 if(this.gear217('heavyBreak')&&heavy){d.br*=this.gear217('heavyBreak').value;d.dmg*=1.12;d.dur+=.06;d.cancel+=.045;}
 if(this.style216().id==='blade'&&this.branch217()==='moon')d.w*=1.2;
 // Keep directional pulls signed. Previous .abs() erased hook semantics.
 d.kx=def.kx||0;d.ky=def.ky||0;return d;};
const command=P.commandInput;P.commandInput=function(token){const p=this.player;if(p.attack&&p.attack.elapsed<p.attack.def.cancel)p.bufferUntil217=this.time+cfg().combat.bufferSeconds;const result=command.call(this,token);if(p.attack){p.historyT=cfg().combat.comboGapSeconds;this.fInit().comboUntil=this.time+cfg().combat.comboGapSeconds;}return result;};
P.lineClear217=function(a,b){const dx=b.x-a.x,dy=b.y-a.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/22));const box={x:Math.min(a.x,b.x)-2,y:Math.min(a.y,b.y)-2,w:Math.abs(dx)+4,h:Math.abs(dy)+4},solids=this.activePlatforms(box).filter(s=>!s.oneWay);for(let i=1;i<steps;i++){const q={x:a.x+dx*i/steps-1,y:a.y+dy*i/steps-1,w:2,h:2};if(solids.some(s=>overlap(s,q)))return false;}return true;};
P.updateAttacks=function(dt){const p=this.player,a=p.attack;if(!a||dt<=0)return;const d=a.def;a.elapsed+=dt;const pulses=d.pulses19||[d.hit];
 while(a.pulse19<pulses.length&&a.elapsed>=pulses[a.pulse19]){const pulse=a.pulse19++;a.hit=true;const box=this.attackBox(p,d);let contacts=0;
  for(const e of this.enemies){if(e.dead||!overlap(box,e)||!this.vCanHit(e)||!this.lineClear217({x:cx(p),y:cy(p)},{x:cx(e),y:cy(e)}))continue;const hp=e.hp,seq=this._nReceiptSeq||0;this.damageEnemy(e,d.dmg,p.dir*d.kx,(e.xBoss||e.anomaly216)?0:d.ky,{...d,kd:4});if(e.hp<hp||(this._nReceiptSeq||0)>seq){contacts++;this.fCommandEffect(e,d,pulse);}}
  this.vRecord({kind:'box',...box,damage:d.dmg,dir:p.dir,kx:d.kx,ky:d.ky,element:this.mState().command[p.classId]});
  this.swing217={...box,shape:d.shape19,heavy:d.weight217==='heavy',at:this.time,until:this.time+(d.big?.34:.22),dir:p.dir,key:d.key,hit:contacts>0,pulse};
  if(d.shape19==='parry')this.fInit().parryUntil=this.time+.5;
  if(contacts){a.connected217=true;this.sfx.hit(d.big);this.shake=Math.max(this.shake,Math.min(3,d.big?2.7:1.1));const s=this.aState217();s.metrics[d.big?'heavyHits':'lightHits']+=contacts;if(d.ky<-200)s.metrics.launchHits+=contacts;this.nEvent('comboMechanic19',d.shape19);this.poseHold217={until:this.time+(d.big?.052:.024),elapsed:a.elapsed,key:d.key};}
 }
 if(p.buffer){if((p.bufferUntil217||Infinity)<this.time){p.buffer=null;p.bufferUntil217=0;}else if(a.elapsed>=d.cancel){const t=p.buffer;p.buffer=null;p.attack=null;p.bufferUntil217=0;this.commandInput(t);return;}}
 if(a.elapsed>=d.dur)p.attack=null;
};
const effects=P.fCommandEffect;P.fCommandEffect=function(e,d,pulse){effects.call(this,e,d,pulse);const s=this.aState217();s.hitCount++;
 if(this.gear217('orbitHit')&&s.hitCount%3===0&&(s.cd.needle||0)<=this.time){s.cd.needle=this.time+.7;const a={x:cx(this.player),y:cy(this.player)-75};this.ray216(a,{x:cx(e),y:cy(e)},this.gear217('orbitHit').value,'light',{a217Unscaled:true,echo:true,visual:'ray',color:'#91e8ff'});}
 if(this.gear217('delayedHeavy')&&d.big&&(s.cd.delayed||0)<=this.time){s.cd.delayed=this.time+1;const at={x:cx(e),y:cy(e)};this.schedule216(.28,()=>this.pulse216(at.x,at.y,90,this.gear217('delayedHeavy')?.value||14,'shadow',{a217Unscaled:true,echo:true,visual:'clock'}),'gear217');}
};
const damage=P.damageEnemy;P.damageEnemy=function(e,amount,kx=0,ky=0,def={}){const before=e.hp;const real=!e.practiceM&&!e.uTraining216&&e.type!=='dummy';if(real&&e.level217>this.level217())amount*=Math.max(.55,1-.06*(e.level217-this.level217()));const result=damage.call(this,e,amount,kx,ky,def);const dealt=Math.max(0,before-e.hp),s=this.aState217();
 if(real&&dealt>0&&!def.isEcho&&!this._vReplay&&this.gear217('lifesteal')&&(s.cd.life||0)<=this.time){s.cd.life=this.time+.7;this.player.hp=Math.min(this.player.maxHp,this.player.hp+Math.min(3,dealt*this.gear217('lifesteal').value));this.fx216('sigil',cx(this.player),cy(this.player),32,'#9df5bd',{duration:.3});}
 return result;};
const kill=P.xKilled;P.xKilled=function(e){const already=e.reward217,real=!e.practiceM&&!e.uTraining216&&e.type!=='dummy';const r=kill.call(this,e);if(!already&&real){e.reward217=true;const s=this.aState217();s.kills++;s.xp+=e.xBoss||e.anomaly216?32:8;s.materials.echo+=e.xBoss?4:1;if(s.kills%2===0)s.materials.glass++;if(s.kills%5===0||e.xBoss||e.anomaly216)s.materials.dust++;this.saveProgress();}return r;};
const spawn=P.spawnEnemy;P.spawnEnemy=function(type,x,y,opts={}){const e=spawn.call(this,type,x,y,opts);if(!e)return e;const q=cfg().enemies[type],r=this.roomById?.get(opts.room);e.level217=Number(opts.level)||Math.max(1,1+Math.floor((r?.chapterIndex216||0)/2));if(q){e.hp=e.maxHp=Math.round(e.maxHp*q.hpScale);e.damage*=q.damageScale;e.speed*=q.speedScale;}return e;};
// Context travels with scheduled work, so per-skill editing changes REAL damage, not only labels.
const schedule=P.schedule216;P.schedule216=function(delay,fn,tag){const context=(this.castContext217||this.fieldContext217)?{...(this.castContext217||this.fieldContext217)}:null;return schedule.call(this,delay,()=>{const old=this.castContext217;this.castContext217=context;try{return fn();}finally{this.castContext217=old;}},tag);};
P.tuning217=function(opts={}){if(opts.a217Unscaled||!(this.castContext217||this.fieldContext217))return{damageScale:1,rangeScale:1,cooldownScale:1};const q=this.castContext217||this.fieldContext217;return cfg().skills[q.style]?.[q.slot]||{damageScale:1,rangeScale:1,cooldownScale:1};};
const pulse=P.pulse216;P.pulse216=function(x,y,r,damage,element,opts={}){const t=this.tuning217(opts),ctx=this.castContext217,moon=!opts.a217Unscaled&&ctx?.style==='blade'&&ctx.branch==='moon'?1.2:1;return pulse.call(this,x,y,r*t.rangeScale*moon,damage*t.damageScale,element,{...opts,a217Scaled:true});};
const ray=P.ray216;P.ray216=function(a,b,damage,element,opts={}){const t=this.tuning217(opts),ctx=this.castContext217,end={x:a.x+(b.x-a.x)*t.rangeScale,y:a.y+(b.y-a.y)*t.rangeScale};if(!opts.a217Unscaled&&ctx?.style==='rail'&&ctx.branch==='focus')opts={...opts,width:(opts.width||19)*1.35,pierce:Math.max(6,opts.pierce||0)};return ray.call(this,a,end,damage*t.damageScale,element,{...opts,a217Scaled:true});};
const field=P.field216;P.field216=function(kind,x,y,r,duration,extra={}){const ctx=this.castContext217;if(ctx?.style==='gravity'&&ctx.branch==='well'&&['gravity','pull','tether','lift'].includes(kind)){r*=1.2;duration+=.5;}if(ctx?.style==='bloom'&&ctx.branch==='growth'&&kind==='garden')duration+=1.5;const t=this.tuning217();const f=field.call(this,kind,x,y,r*t.rangeScale,duration,extra);if(ctx)f.context217={...ctx};return f;};
P.shield217=function(amount,key,cd=0){const s=this.aState217();if((s.cd[key]||0)>this.time)return false;s.cd[key]=this.time+cd;this.player.shield=Math.min(45,(this.player.shield||0)+amount);this.fx216('sigil',cx(this.player),cy(this.player),61,'#80e6f4',{duration:.45});return true;};
const cast=P.cast216;P.cast216=function(slot){const style=this.style216().id,branch=this.branch217(style),p=this.player,origin={x:cx(p),y:cy(p)},before=this.castContext217,gardens=this.uState216().fields.filter(f=>f.kind==='garden'&&f.until>this.time&&Math.hypot(f.x-origin.x,f.y-origin.y)<500).map(f=>({x:f.x,y:f.y}));this.castContext217={style,slot,branch,cause218:this.causeContext218||null};let ok;
 try{ok=cast.call(this,slot);if(!ok)return ok;const q=cfg().skills[style][slot],u=this.uState216(),key=style+':'+slot;u.cd[key]=this.time+(u.cd[key]-this.time)*q.cooldownScale*(style==='chrono'&&branch==='tempo'?.85:1);this.aState217().metrics.skills++;
 if(style==='rail'&&branch==='scatter'&&slot===0){const a=this.nAim();for(const rot of [-.18,.18])this.schedule216(.13,()=>{const d={x:a.x*Math.cos(rot)-a.y*Math.sin(rot),y:a.x*Math.sin(rot)+a.y*Math.cos(rot)};this.ray216(origin,{x:origin.x+d.x*530,y:origin.y+d.y*530},10,this.currentElement,{width:10,pierce:3});});}
 if(style==='chrono'&&branch==='echo'&&slot===0)this.schedule216(.48,()=>this.pulse216(origin.x+p.dir*60,origin.y,140,16,'shadow',{visual:'clock'}));
 if(style==='gravity'&&branch==='orbit'&&slot===1)this.shield217(14,'orbit',3);
 if(style==='spirit'&&branch==='guardian'&&slot===2)this.shield217(22,'guardian',0);
 if(style==='spirit'&&branch==='hunter'&&slot===0){const e=this.nTarget(480,this.nAim());if(e)this.schedule216(.3,()=>{if(!e.dead)this.pulse216(cx(e),cy(e),80,14,this.currentElement,{visual:'spirit'});});}
 if(style==='bloom'&&branch==='growth'&&slot===2)this.grow216(origin.x+p.dir*125,p.y+p.h+5);
 if(style==='bloom'&&branch==='rupture'&&slot===3&&gardens.length)this.schedule216(.12,()=>this.pulse216(gardens[0].x,gardens[0].y,170,18,'fire',{visual:'bloom',color:'#ffb090'}));
 const s=this.aState217();if(slot<4&&this.gear217('satellite')&&(s.cd.satellite||0)<=this.time){const e=this.enemies.filter(e=>!e.dead&&this.vCanHit(e)&&Math.hypot(cx(e)-cx(p),cy(e)-cy(p))<320).sort((a,b)=>Math.hypot(cx(a)-cx(p),cy(a)-cy(p))-Math.hypot(cx(b)-cx(p),cy(b)-cy(p)))[0];if(e){s.cd.satellite=this.time+1;this.ray216({x:cx(p),y:cy(p)-65},{x:cx(e),y:cy(e)},this.gear217('satellite').value,'light',{echo:true,a217Unscaled:true,width:8,color:'#8fe4ff'});}}
 return ok;}finally{this.castContext217=before;}
};
// Shared 1/2/3 capacity. Being airborne never recharges; gear cannot bypass this invariant.
P.tickSwap215=function(dt){if(!(dt>0)||this.paused||this.modalM())return;const s=this.swapState214(),p=this.player;if(!p.onGround){s.grounded217=0;return;}s.grounded217=(s.grounded217||0)+dt;if(s.grounded217<cfg().swap.groundedDelay)return;const seconds=cfg().swap.rechargeSeconds*(this.gear217('groundRefill')?.value||1);if(s.used>0){s.recharge+=dt;while(s.recharge+1e-9>=seconds&&s.used>0){s.recharge-=seconds;s.used--;s.chain++;s.lastResult='ground-refill';}if(!s.used)s.recharge=0;}};
const swap=P.swapElement;P.swapElement=function(target,el,index){if(el&&target?.ref&&this.swapRemaining214(el.id)<=0){this.swapState214().lastResult='recharging';this.say('換位次數已用盡｜落地站穩後回充，空中不會回復',1.2,el.color);return false;}const a={x:cx(this.player),y:cy(this.player)},ok=swap.call(this,target,el,index);if(!ok)return false;const s=this.aState217();s.metrics.swaps++;if(this.gear217('swapShield'))this.shield217(this.gear217('swapShield').value,'swapWard',4);if(this.style216().id==='gravity'&&this.branch217()==='orbit')this.shield217(14,'orbit',3);if(this.style216().id==='blade'&&this.branch217()==='cross'&&(s.cd.cross||0)<=this.time){s.cd.cross=this.time+1;this.ray216(a,{x:cx(this.player),y:cy(this.player)},16,el.id,{a217Unscaled:true,echo:true,width:26,visual:'slashline'});}this.say('換位成功｜剩 '+this.swapRemaining214()+'/'+this.swapCap214()+' · 落地才會回充',1,el.color);return true;};
P.canCraft217=function(item){const g=cfg().gear.find(g=>g.id===item),s=this.aState217();return !!g&&Object.entries(g.cost).every(([k,n])=>(s.materials[k]||0)>=n)&&this.roomById.get(this.currentRoomId)?.shelter&&!(g.slot!=='consumable'&&s.owned[g.id]);};
P.craft217=function(id){if(!this.canCraft217(id)){this.say('需在避難所製作，且材料足夠；永久裝備不重複製作。',2);return false;}const g=cfg().gear.find(g=>g.id===id),s=this.aState217();for(const [k,n]of Object.entries(g.cost))s.materials[k]-=n;s.owned[id]=(s.owned[id]||0)+1;this.saveProgress();return true;};
P.equip217=function(id){const g=cfg().gear.find(g=>g.id===id),s=this.aState217();if(!g||!s.owned[id]||g.slot==='consumable')return false;if(!this.roomById.get(this.currentRoomId)?.shelter){this.say('裝備請在避難所更換。',2);return false;}if(g.slot==='weapon')s.weapon=id;else if(s.relics.includes(id))s.relics=s.relics.filter(x=>x!==id);else if(s.relics.length<2)s.relics.push(id);else{this.say('最多兩件功能裝備；先卸下一件。',2);return false;}this.saveProgress();return true;};
P.consume217=function(id){const g=cfg().gear.find(g=>g.id===id),s=this.aState217();if(!g||g.slot!=='consumable'||!s.owned[id]||(s.cd.consumable||0)>this.time)return false;if(g.effect==='heal'&&this.player.hp>=this.player.maxHp)return false;s.owned[id]--;s.cd.consumable=this.time+8;if(g.effect==='heal')this.player.hp=Math.min(this.player.maxHp,this.player.hp+g.value);else if(g.effect==='stability'){this.uState216().time=Math.max(0,this.uState216().time-g.value);this.uState216().space=Math.max(0,this.uState216().space-g.value);}this.saveProgress();return true;};
P.biome217=function(r){return cfg().world.biomes.find(b=>b.regions.includes(r?.region))||cfg().world.biomes[5];};
P.applyWorld217=function(){const n=this.nInit();n.structures=n.structures.filter(s=>!s.author217);for(const patch of cfg().world.roomPatches){const r=this.roomById.get(patch.id);if(!r)continue;if(patch.name)r.name=patch.name;if(patch.note)r.note=patch.note;for(const q of patch.platforms||[])n.structures.push({id:'a217_'+patch.id+'_'+q.id,room:r.id,x:r.x+q.x,y:r.floorY+q.floorOffset,w:q.w,h:q.h,kind:'bridge',modes:[...q.modes],oneWay:true,author217:true,label:q.label||'潮聲踏台'});for(const [i,q]of (patch.spawns||[]).entries()){const tag=patch.id+':'+i;if(this.enemies.some(e=>e.author217===tag&&!e.dead))continue;const e=this.spawnEnemy(q.type,r.x+q.x,r.floorY,{room:r.id,level:q.level||1});if(e)e.author217=tag;}}this.r214?.solidsCache.clear();this.r214?.tiles.clear();if(this.r214){this.r214.structureCount=-1;this.r214.structureBins=null;}this.mask217=null;};
const directHit=P.nHit;P.nHit=function(e,damage,opts={}){return directHit.call(this,e,damage*(opts.a217Scaled?1:this.tuning217(opts).damageScale),opts);};
P.range217=function(radius){return radius*this.tuning217().rangeScale;};const lift=P.lift216;P.lift216=function(radius,strength){return lift.call(this,this.range217(radius),strength);};
const build=P.buildWorld;P.buildWorld=function(){build.call(this);this.applyWorld217();};
P.applyConfig217=function(q){const errors=ES217.validate(q);if(errors.length)return{ok:false,errors};window.ES217_CONFIG=copy(q);ES217.installCommands();this.applyWorld217();for(const j of ES216.styles)cfg().skills[j.id].forEach((s,i)=>{if(s.name)j.skills[i].name=String(s.name).slice(0,40);});this.player.attack=null;this.player.buffer=null;this.refresh216();return{ok:true,errors:[]};};
P.route217=function(start,goal){if(!this.roomById.has(start)||!this.roomById.has(goal))return{rooms:[],edges:[],gates:[]};const dist=new Map([[start,0]]),prev=new Map(),done=new Set();const adj=new Map();for(const e of ES9_WORLD.edges){if(!adj.has(e.a))adj.set(e.a,[]);if(!adj.has(e.b))adj.set(e.b,[]);adj.get(e.a).push({to:e.b,e});adj.get(e.b).push({to:e.a,e});}
 for(let i=0;i<this.rooms.length;i++){let u=null,best=Infinity;for(const [k,v]of dist)if(!done.has(k)&&v<best){best=v;u=k;}if(u===null||u===goal)break;done.add(u);for(const {to,e}of adj.get(u)||[]){const a=this.roomById.get(u),b=this.roomById.get(to);if(!a||!b)continue;const cost=Math.hypot(cx(a)-cx(b),cy(a)-cy(b))+(e.gate?700:0),nd=best+cost;if(nd<(dist.get(to)??Infinity)){dist.set(to,nd);prev.set(to,{u,e});}}}
 if(start!==goal&&!prev.has(goal))return{rooms:[],edges:[],gates:[]};const rooms=[goal],edges=[];let k=goal;for(let i=0;k!==start&&i<this.rooms.length;i++){const v=prev.get(k);if(!v)break;edges.unshift(v.e);rooms.unshift(v.u);k=v.u;}return{rooms,edges,gates:edges.filter(e=>e.gate),distance:dist.get(goal)||0};};
P.track217=function(id){if(!this.roomById.has(id))return false;this.aState217().waypoint=id;this.uState216().waypoint=id;this.routeCache217=this.route217(this.currentRoomId,id);this.saveProgress();return true;};
const update217=P.update;P.update=function(dt,ts){const r=update217.call(this,dt,ts);this.player.shield=cl(this.player.shield||0,0,45);return r;};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);ES9.VERSION=ES216.version='21.7.0';document.title='澄界｜織夢與殘響 21.7.0';this.aState217();if(this.a217.waypoint)this.uState216().waypoint=this.a217.waypoint;const errors=ES217.validate(cfg());if(errors.length)throw Error('21.7 設定驗證失敗：'+errors.join('；'));};
})();
