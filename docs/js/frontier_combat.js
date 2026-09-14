/* V19: visually and mechanically different commands; shorter, earned cooldowns.
   Enemy warnings lock their targets before firing. No hidden player movement. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,D=ES19,C=ES9,ATT=ES9_ENGINE.ATT;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const defs={
 Z:['試探直刺','thrust',90,52,5,9,.20,[.065],0,0,8,'靠近命中，確認距離；不位移'],
 ZZ:['反手橫斬','slash',125,73,-6,11,.24,[.075],0,0,10,'略寬返刃，接 Z 連斬或 X 挑空'],
 ZZZ:['三重定點連刺','flurry',168,62,-4,7,.40,[.065,.15,.24],0,0,9,'三次獨立近身命中，角色留在原地'],
 ZZZZ:['橫掃收勢','sweep',205,96,-8,22,.39,[.16],0,0,22,'較大範圍收尾；命中回復最久冷卻'],
 X:['重擊壓勢','heavy',120,92,-14,20,.35,[.16],0,0,32,'較慢、削 BREAK 較多，明顯重擊頓點'],
 XX:['雙拍震甲','double',140,115,-20,15,.46,[.13,.28],0,0,27,'兩次重敲，敵人不被打飛'],
 XXX:['震地終結','quake',240,78,20,39,.56,[.25],0,0,74,'低位大範圍破勢，跳躍敵人可避開'],
 ZX:['低掃截步','low',175,40,32,16,.28,[.11],0,0,15,'低位掃擊；命中腿部使其短暫停步'],
 XZ:['鉤回聚敵','hook',230,90,-5,16,.32,[.12],-145,0,16,'只把敵人拉近，不移動自己；適合拖進元素場'],
 ZZX:['定點上挑','lift',140,178,-108,23,.40,[.16],0,-600,22,'向上挑敵；頭目只削 BREAK，不被拋走'],
 XXZ:['楔甲破綻','break',155,112,-20,25,.39,[.17],0,0,90,'破甲 4 秒、削 BREAK；適合接狙擊／重技能'],
 ZXX:['釘地束縛','root',185,65,20,24,.43,[.18],0,0,30,'短暫束縛 1.8 秒，讓雷線、菌床容易命中'],
 ZXZ:['回身環斬','circle',156,118,-25,21,.36,[.15],0,0,20,'同時打到左右兩側，角色不穿身'],
 XZZ:['鉤後雙刺','flurry',205,80,-5,12,.38,[.09,.22],-75,0,16,'回拉後兩次命中，接固定技能槽'],
 XZX:['架刃反彈','parry',150,118,-26,22,.38,[.15],0,0,32,'出手後 0.5 秒反彈正前方一枚敵彈'],
 ZZXX:['落點下壓','down',170,230,-130,26,.43,[.19],0,460,28,'把已浮空的敵人壓向地面，不讓玩家下墜'],
 ZXZX:['聚點圓鉤','circle',205,115,-22,26,.42,[.16],-135,0,24,'周圍小幅回拉，適合睡眠／元素落點'],
 XXZZ:['破甲後挑升','lift',165,195,-115,28,.44,[.18],0,-510,38,'在破甲後挑空；頭目改短失衡'],
 ZXXZ:['根縛雙刺','flurry',210,85,-5,13,.40,[.10,.25],0,0,21,'束縛後雙刺，定身保留，不強制推走'],
 XZXZ:['護刃環掃','circle',190,130,-40,28,.40,[.17],0,0,32,'反彈之後處理包圍，接任一技能'],
 ZZXZX:['收束地裂','quake',260,225,-100,34,.48,[.20],0,300,64,'上挑轉定點下壓，回收浮空敵人'],
 AIRZ:['空中橫斬','slash',135,105,-20,13,.25,[.09],0,-95,13,'只攻擊，不改變角色空中軌跡'],
 AIRX:['空中壓落','down',128,156,5,24,.38,[.17],0,470,35,'敵人向下，自己仍可控制移動'],
 AIRZX:['空中落點回收','down',165,190,-30,26,.40,[.18],0,580,36,'把空中敵人送回地面元素場'],
 AIRXZ:['空中再挑','lift',160,195,-110,22,.37,[.14],0,-420,30,'延續敵人浮空，角色不自動跳高'],
 UZ:['向上截擊','lift',110,175,-115,15,.28,[.11],0,-430,18,'打頭上目標，玩家不自動上升'],
 UX:['向上重挑','lift',145,230,-165,27,.41,[.18],0,-570,40,'更高挑擊；靠近空中敵人再出手'],
 DZ:['貼地掃腳','low',170,38,34,14,.28,[.10],0,0,18,'低身目標與慢移動怪的剋星'],
 DX:['落地震掌','quake',235,70,20,29,.43,[.20],0,0,52,'地面破势，不射出震波子彈']
};
D.commands={};for(const [key,q]of Object.entries(defs)){const [name,shape,w,h,oy,dmg,dur,pulses,kx,ky,br,desc]=q;const d={name:key+'・'+name,key,shape19:shape,w,h,oy,dmg,dur,hit:pulses[0],cancel:Math.max(pulses.at(-1)+.03,dur*.66),pulses19:pulses,kx,ky,br,kd:4,anim:shape==='lift'?'launch':shape==='down'?'air':['heavy','quake','break','root','double'].includes(shape)?'x':shape==='thrust'?'z1':'z2',big:['heavy','quake','break','root','double'].includes(shape),launch:ky<-200,explicitKnockback:!!kx||!!ky,lunge:0,retreat:0,recoil:0,mCommand:true,desc19:desc};ATT[key]=d;D.commands[key]=d;}
const aliases={LZ:'Z',RZ:'Z',LX:'X',RX:'X',DASHZ:'ZX',DASHX:'X',AIRZZ:'AIRZ',AIRUZ:'UZ',AIRUX:'UX',AIRDZ:'DZ',AIRDX:'AIRX',ZZZX:'ZZX',ZZXZ:'XXZZ',ZXZZ:'XZZ',XZZX:'XXZZ',XZXX:'ZZXX',XXZX:'XXZ'};for(const [k,v]of Object.entries(aliases))ATT[k]={...ATT[v],key:k,name:k+'・'+ATT[v].name.split('・')[1]};
P.classAttack=function(def,key){const d={...def,key,pulses19:[...(def.pulses19||[def.hit])],mCommand:true,mClass:this.player.classId};const p=this.player;
 if(p.classId==='monk'){d.dur*=.93;d.cancel*=.93;d.w*=.9;}if(p.classId==='harrier')d.w*=1.15;if(p.classId==='warden')d.br*=1.15;
 if(p.classId==='beast'&&p.form==='bear'){d.w*=1.15;d.br*=1.2;}if(this.xHas('prismLance'))d.w*=1.18;
 if(this.nJob().noPush>this.time){d.kx=0;this.nJob().noPush=0;}return d;};
P.commandInput=function(token){const p=this.player;if(!['Z','X'].includes(token)||p.downT>0||p.recoverT>0)return;if(p.castT>.035){this.pendingM={kind:'command',token,until:this.time+.28};return;}if(p.attack&&p.attack.elapsed<p.attack.def.cancel){p.buffer=token;return;}
 let key=token;const f=this.fInit();if(this.time>(f.comboUntil||0))p.history='';
 if(this.key('up')){key='U'+token;p.history='';}else if(this.key('down')){key='D'+token;p.history='';}
 else{const seq=((p.history||'')+token).slice(-5);let candidate=seq;while(candidate.length>1&&!ATT[candidate])candidate=candidate.slice(1);key=ATT[candidate]?candidate:token;p.history=candidate;
 if(!p.onGround){key=ATT['AIR'+candidate]?'AIR'+candidate:'AIR'+token;}}
 p.historyT=1.05;f.comboUntil=this.time+1.05;this.startAttack(key);
};
P.startAttack=function(key){const base=ATT[key];if(!base)return;const p=this.player,d=this.classAttack(base,key);p.attack={def:d,elapsed:0,hit:false,pulse19:0,hits19:new Set(),lockMove:false};p.buffer=null;p.castM=null;
 if(p.onGround&&!this.key('left')&&!this.key('right')&&p.dashT<=0)p.vx=0;
 this.commandLabel=d.name;this.commandT=1.4;this.sfx.slash(d.big);this.nEvent('command',key);this.mEmit('command',{key});const f=this.fInit();f.lastCommand={key,name:d.name,desc:d.desc19,shape:d.shape19,at:this.time};f.comboTrace.push(key);if(f.comboTrace.length>24)f.comboTrace.shift();
};
P.attackBox=function(p,d){if(d.shape19==='circle')return{x:cx(p)-d.w,y:p.y+d.oy,w:d.w*2,h:d.h};return{x:p.dir>0?p.x+p.w-8:p.x-d.w+8,y:p.y+d.oy,w:d.w,h:d.h};};
P.updateAttacks=function(dt){const p=this.player,a=p.attack;if(!a)return;const d=a.def;a.elapsed+=dt;const pulses=d.pulses19||[d.hit];
 while(a.pulse19<pulses.length&&a.elapsed>=pulses[a.pulse19]){const pulse=a.pulse19++;a.hit=true;const box=this.attackBox(p,d),set=new Set();let contacts=0;
  for(const e of this.enemies){if(e.dead||!hit(box,e)||!this.vCanHit(e))continue;set.add(e.id);const hp=e.hp,stamp=this._nReceiptSeq||0;this.damageEnemy(e,d.dmg,p.dir*d.kx,e.xBoss?0:d.ky,{...d,kd:4,br:d.br});if(e.hp<hp||(this._nReceiptSeq||0)>stamp){contacts++;this.fCommandEffect(e,d,pulse);}}
  this.vRecord({kind:'box',...box,damage:d.dmg,dir:p.dir,kx:d.kx,ky:d.ky,element:this.mState().command[p.classId]});
  this.fInit().swing={...box,shape:d.shape19,at:this.time,until:this.time+.22,dir:p.dir,key:d.key,hit:contacts>0,pulse};
  if(d.shape19==='parry')this.fInit().parryUntil=this.time+.5;
  if(contacts){this.sfx.hit(d.big);this.hitStop=Math.max(this.hitStop,d.big?.052:.022);this.shake=Math.min(4,d.big?3:1.4);this.nEvent('comboMechanic19',d.shape19);}
 }
 if(p.buffer&&a.elapsed>=d.cancel){const token=p.buffer;p.buffer=null;p.attack=null;this.commandInput(token);return;}if(a.elapsed>=d.dur)p.attack=null;
};
P.fRefund=function(seconds){const t=this.time,candidates=this.mLoadout().filter(id=>(this.cooldownsM[id]||0)>t).sort((a,b)=>this.cooldownsM[b]-this.cooldownsM[a]);if(!candidates.length)return 0;const id=candidates[0],before=this.cooldownsM[id];this.cooldownsM[id]=Math.max(t,this.cooldownsM[id]-seconds);const amount=before-this.cooldownsM[id];this.fInit().cooldownRefund+=amount;return amount;};
P.fCommandEffect=function(e,d,pulse){const p=this.player,f=this.fInit(),boss=e.xBoss||e.type==='sentinel',shape=d.shape19;
 if(shape==='low')e.root=Math.max(e.root,boss?.18:.65);
 if(shape==='root')e.root=Math.max(e.root,boss?.32:1.8);
 if(shape==='break'){e.armorBreak=Math.max(e.armorBreak,4);e.stun=Math.max(e.stun,boss?.24:.55);}
 if(shape==='hook'||d.kx<0){e.vx=boss?0:Math.sign(cx(p)-cx(e))*Math.min(160,Math.abs(cx(p)-cx(e))*.9);}
 if(d.ky&& !boss)e.vy=d.ky; // explicit launch/downstroke; never moves the player.
 if(boss&&shape==='lift')e.stun=Math.max(e.stun,.18);
 if(this.time>=(f.refundAt||0)){f.refundAt=this.time+.24;this.fRefund(d.key.length>=3?.42:.16);}
 if(this.xHas('tempoCoil')&&f.lastHitToken!==d.key.at(-1)&&this.time>=(f.weaponAt||0)){f.weaponAt=this.time+.8;this.fRefund(.35);}f.lastHitToken=d.key.at(-1);
 if(this.xHas('faultHammer')&&shape==='break'){e.break=Math.max(0,e.break-40);if(e.break===0&&boss){e.break=e.breakMax;e.breakStun=e.stun=2;}}
 if(this.xHas('rootAxe')&&d.key==='ZXX')e.root=Math.max(e.root,boss?.45:3);
 if(this.xHas('mycelialNeedle')&&d.key==='ZXX')this.nDrowse(e,2);
 if(this.xHas('prismGuard')&&d.key==='XZ')f.parryUntil=this.time+.6;
 if(this.xHas('auroraLance')&&shape==='lift')e.v16ExposedUntil=this.time+4;
 if(this.xHas('tideFork')&&d.key==='XZ')e.wet=Math.max(e.wet,6);
 if(this.xHas('mercuryValve')&&e.wet>0&&this.time>=(f.mercuryAt||0)){f.mercuryAt=this.time+.6;this.fRefund(.2);}
 if(f.buffs.tempo>this.time&&this.time>=(f.tonicAt||0)){f.tonicAt=this.time+.5;this.fRefund(.15);}
};
// Short casts 1.1–3.2 s; summons/large lasting areas 3.2–4.8 s.
// Ranks/crest reduction are still applied. No per-frame cooldown bypass.
D.cooldowns={};for(const list of Object.values(ES18.skills))for(const s of list){D.cooldowns[s.id]=s.cd;const duration=['nest','garden','dome','slow','pot','shield','ward','banner','feast'].includes(s.op18);s.cd=duration?Math.min(4.8,Math.max(3.2,s.cd*.56)):Math.min(3.4,Math.max(1.15,s.cd*.46));s.cd=+s.cd.toFixed(2);}
const cast=P.castMasterSkill;P.castMasterSkill=function(id,opts={}){const ok=cast.call(this,id,opts);if(ok){this.player.castT=.065;const s=ES10_MASTER.skills[id];this.cooldownsM[id]=this.time+Math.max(.75,this.cooldown(s.cd));this.fInit().lastCastAt=this.time;}return ok;};
const q=P.useClassSkill;P.useClassSkill=function(){const ok=q.call(this);if(ok)this.player.qCD=Math.min(this.player.qCD,1.7);return ok;};
const shots=P.updateEnemyShots;P.updateEnemyShots=function(dt){const f=this.fInit(),p=this.player;if((f.parryUntil||0)>this.time){const s=this.enemyShots.find(q=>!q.friendly&&q.t>0&&q.warmup<=0&&Math.abs(cx(q)-cx(p))<170&&Math.abs(cy(q)-cy(p))<85&&(cx(q)-cx(p))*p.dir>-15);if(s){s.friendly=true;s.vx*=-1;s.vy*=-1;s.owner='架刃反彈';f.parryUntil=0;this.nEvent('parry19',s.id);this.nFX('ring',cx(p)+p.dir*75,cy(p),60,'#ffdf91');}}return shots.call(this,dt);};
// ----- telegraphed ecological enemy patterns -----
P.fWarn=function(e,pattern){const p=this.player,r=this.roomById.get(e.room),x=cx(p),y=cy(p),fx=cx(e),fy=cy(e),dir=Math.sign(x-fx)||1;
 const shape=['beam','charge','slide','wave'].includes(pattern)?'line':'circle';const warning=pattern==='beam'?{x:Math.min(fx,x)-100,y:y-23,w:Math.abs(x-fx)+400,h:46}:pattern==='charge'||pattern==='slide'?{x:dir>0?fx:fx-510,y:e.y+e.h-82,w:510,h:82}:{x,y:r?.floorY||y+30,r:pattern==='quake'?210:pattern==='ring'?170:pattern==='pull'?230:100};
 e.fLocked={pattern,x,y,fx,fy,dir,warning,windup:e.xBoss?.95:1.1};e.fWindup=e.fLocked.windup;e.fRecovery=0;e.telegraph={type:shape,...warning,t:e.fWindup};e.vx=0;e.state='warning';this.nEvent('enemyWarning19',pattern);
};
P.fEnemyShot=function(e,x,y,vx,vy,extra={}){const s={id:this.id(),type:'frontier',x:x-7,y:y-7,w:14,h:14,vx,vy,gravity:0,t:4,damage:e.damage*.85,color:e.color,owner:e.name,warmup:0,v16Layer:e.v16Layer||'B',...extra};this.enemyShots.push(s);return s;};
P.fExecute=function(e,q){const p=this.player,r=this.roomById.get(e.room),f=this.fInit(),origin={x:cx(e),y:cy(e)},delta={x:q.x-origin.x,y:q.y-origin.y},ang=Math.atan2(delta.y,delta.x),shot=(angle,speed=235,extra={})=>this.fEnemyShot(e,origin.x,origin.y,Math.cos(angle)*speed,Math.sin(angle)*speed,extra),hazard=(x,y,w,h,delay=.3,kind='blast')=>f.hazards.push({id:this.id(),room:e.room,x,y,w,h,at:this.time+delay,until:this.time+delay+.32,damage:e.damage,owner:e.name,color:e.color,kind,layer:e.v16Layer||'B',hit:false});
 switch(q.pattern){
 case 'charge':case 'slide':e.vx=q.dir*(q.pattern==='slide'?390:460);e.fDash=this.time+.55;e.state='charge';break;
 case 'burrow':hazard(q.x-75,(r?.floorY||q.y)-120,150,130,.45,'burrow');e.vx=q.dir*170;e.fDash=this.time+.3;break;
 case 'fan':for(let i=-2;i<=2;i++)shot(ang+i*.24);break;
 case 'beam':hazard(Math.min(origin.x,q.x)-70,q.y-20,Math.abs(q.x-origin.x)+400,40,.03,'beam');break;
 case 'ring':for(let i=0;i<10;i++)shot(i*Math.PI/5,180);break;
 case 'shield':e.fShieldUntil=this.time+2.2;for(let i=-1;i<=1;i++)shot(ang+i*.3,180);break;
 case 'mine':for(let i=-1;i<=1;i++)hazard(q.x+i*125-42,(r?.floorY||q.y)-65,84,70,.8+Math.abs(i)*.2,'mine');break;
 case 'wave':for(const dir of [-1,1])this.fEnemyShot(e,origin.x,e.y+e.h-22,dir*240,0,{w:28,h:24,damage:e.damage});break;
 case 'leap':e.vy=-500;e.vx=q.dir*260;e.fDash=this.time+.65;hazard(q.x-90,(r?.floorY||q.y)-55,180,65,.75,'quake');break;
 case 'pull':f.hazards.push({id:this.id(),room:e.room,x:origin.x-225,y:origin.y-160,w:450,h:320,at:this.time,until:this.time+1.3,damage:0,owner:e.name,color:e.color,kind:'pull',layer:e.v16Layer||'B'});break;
 case 'lure':for(let i=-1;i<=1;i++)this.fEnemyShot(e,q.x+170*q.dir,q.y+i*70,-q.dir*150,i*25,{color:'#dfb8ee'});break;
 case 'stalk':hazard(origin.x+q.dir*70-85,origin.y-70,170,140,.04,'claw');hazard(origin.x+q.dir*100-85,origin.y-70,170,140,.34,'claw');break;
 case 'drain':hazard(q.x-130,q.y-100,260,200,.4,'drain');if(Math.hypot(cx(p)-q.x,cy(p)-q.y)<130)e.hp=Math.min(e.maxHp,e.hp+10);break;
 case 'web':for(let i=-1;i<=1;i++)shot(ang+i*.28,175,{type:'web'});break;
 case 'mirror':e.fShieldUntil=this.time+1.4;for(let i=-1;i<=1;i++)shot(ang+i*.16,280);break;
 case 'mortar':for(let i=-1;i<=1;i++)hazard(q.x+i*130-52,(r?.floorY||q.y)-120,104,130,.7+Math.abs(i)*.15,'meteor');break;
 case 'root':for(let i=0;i<3;i++)hazard(q.x-135+i*110,(r?.floorY||q.y)-120,75,120,.25+i*.22,'root');break;
 case 'quake':for(const dir of [-1,1])this.fEnemyShot(e,origin.x,e.y+e.h-18,dir*310,0,{w:40,h:22,damage:e.damage});break;
 }
 e.fRecovery=e.xBoss?1.15:1.35;e.fAttackAt=this.time+e.fRecovery+.6;e.fStep++;e.state=e.fDash>this.time?'charge':'recover';e.telegraph=null;this.nEvent('enemyAttack19',q.pattern);
};
const brain=P.enemyBrain;P.enemyBrain=function(e,dt,dx,dy,ad,dir){if(!e.frontier19)return brain.call(this,e,dt,dx,dy,ad,dir);
 if(e.sleep17>this.time){e.vx=0;e.state='stun';e.stun=.12;return;}
 if(e.xBoss&&e.hp/e.maxHp<=.5&&e.fPhase===1){e.fPhase=2;e.fWindup=0;e.fLocked=null;e.telegraph=null;e.stun=.8;e.fAttackAt=this.time+1.25;this.say(e.name+'｜第二階段：'+D.behaviors[e.fSecondary],3);this.nEvent('bossPhase19',e.species17);}
 if(e.fWindup>0){e.vx=0;e.fWindup-=dt;if(e.telegraph)e.telegraph.t=e.fWindup;if(e.fWindup<=0){this.fExecute(e,e.fLocked);e.fLocked=null;}return;}
 if(e.fDash>this.time)return;
 if(e.fRecovery>0){e.fRecovery-=dt;e.vx*=Math.pow(.015,dt);e.state='recover';return;}
 const near=Math.abs(dx)<(e.fPrimary==='beam'?850:650)&&Math.abs(dy)<430;if(near&&this.time>=e.fAttackAt){const pattern=e.fPhase===2&&e.fStep%2?e.fSecondary:e.fPrimary;this.fWarn(e,pattern);return;}
 e.vx=ad>160?dir*e.speed*.7:0;e.state=e.vx?'move':'idle';if((e.wallLeft||e.wallRight)&&e.onGround)e.vy=-380;
 if(Math.abs(cx(e)-e.fAnchorX)>800)e.vx=Math.sign(e.fAnchorX-cx(e))*e.speed;
};
const damage=P.damageEnemy;P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){if(e.frontier19){const frontal=(cx(this.player)-cx(e))*(e.dir||-1)>0;const protectedShell=['shield','mirror'].includes(e.fPrimary)||(e.fShieldUntil||0)>this.time;if(protectedShell&&frontal&&e.armorBreak<=0&&!['break','quake'].includes(def.shape19))dmg*=.48;if(e.xBoss){kx*=.12;ky=0;}const before=e.hp;damage.call(this,e,dmg,kx,ky,def);if(e.hp<before&&e.breakStun>0){e.fWindup=0;e.fLocked=null;e.telegraph=null;e.fAttackAt=this.time+e.breakStun+.8;}}else damage.call(this,e,dmg,kx,ky,def);};
P.fTickHazards=function(dt){const f=this.fInit(),p=this.player;for(const h of f.hazards){if(h.until<this.time||h.at>this.time||h.layer!==this.vLayer())continue;if(h.kind==='pull'){if(hit(p,h)&&!this.xHas('vectorGyro'))p.vx+=Math.sign(cx(h)-cx(p))*210*dt;continue;}if(!h.hit&&hit(p,h)){this.hurtPlayer(h.damage,Math.sign(cx(p)-cx(h))*85,-80,h.owner);h.hit=true;}}f.hazards=f.hazards.filter(h=>h.until>this.time);};
})();
