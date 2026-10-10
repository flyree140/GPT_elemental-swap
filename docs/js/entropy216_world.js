/* One world graph; playable chapter, authored law structures, real anomaly AI. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,D=ES216,C=ES9;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
const build=P.buildWorld;P.buildWorld=function(){build.call(this);const s=this.uState216(),n=this.nInit();s.nodes=[];
 for(let i=0;i<D.chapters.length;i++){const c=D.chapters[i],r=this.roomById.get(c[0]);if(!r)continue;r.name=c[1];r.note=c[2];r.chapter216=true;r.chapterIndex216=i;
  const x=r.x+Math.min(r.w-140,r.w*.63),floor=r.floorY;
  s.nodes.push({id:c[0],x,y:floor-42,w:22,h:42,index:i,chapter:c});
  // Distinct collision-bearing routes in the same room, not a tinted screenshot.
  if(i>0){const base={room:r.id,oneWay:true,chapter216:true};n.structures.push(
   {id:'u216_past_'+r.id,x:r.x+r.w*.30,y:floor-220,w:265,h:20,kind:'bridge',modes:['past'],label:'過去・失落的橋',...base},
   {id:'u216_future_'+r.id,x:r.x+r.w*.63,y:floor-115,baseY:floor-115,w:180,h:18,kind:'lift',modes:['future'],label:'未來・潮汐升台',...base},
   {id:'u216_inner_'+r.id,x:r.x+r.w*.44,y:floor-335,w:220,h:18,kind:'bridge',modes:['inner'],label:'裏層・折影棧道',...base},
   {id:'u216_decay_'+r.id,x:r.x+r.w*.71,y:floor-255,w:160,h:18,kind:'ruin',modes:['now','heavy','invert','elastic','fungal','decay'],decayAfter:4.2,label:'消逝・可解離遺構',...base});
  }
 }
 // A reachable training target uses the normal enemy hit/damage pipeline.
 const r=this.roomById.get('r00');if(r){const target=this.spawnEnemy('dummy',r.x+r.w-120,r.floorY,{room:r.id,hp:1200});if(target){target.uTraining216=true;target.name='連段練習晶核';target.practiceM=true;target.speed=0;target.damage=0;target.v16Layer='ALL';s.training=target.id;}}
 this.r214?.tiles.clear();
};
P.chapterReady216=function(c){const s=this.uState216();if(c[3]==='arrival')return true;if(c[3]==='ending')return D.chapters.slice(0,11).every(c=>s.memory.includes(c[0]))&&s.defeated.time>0&&s.defeated.space>0;return (s.metrics[c[3]]||0)>0;};
P.claimMemory216=function(id){const s=this.uState216(),c=D.chapters.find(c=>c[0]===id);if(!c)return false;if(s.memory.includes(id)){this.storyDialog216?.(c,false);return true;}if(!this.chapterReady216(c)){this.say(c[2],3,'#e8cc9d');this.storyDialog216?.(c,false);return false;}
 s.memory.push(id);this.mark216('memory');this.fx216('nova',cx(this.player),cy(this.player),165,'#ecd4a3',{duration:.8});s.time=Math.max(0,s.time-7);s.space=Math.max(0,s.space-7);
 const rank=s.memory.length>=6?3:s.memory.length>=3?2:1;for(const el of C.ELEMENTS){const q=this.xState().elements[el.id];q.rank=Math.max(q.rank||0,rank);q.tiers??=['A','A','A','A'];}if(id==='r11'){s.ended=true;s.time=0;s.space=0;s.endingAt=this.time;}
 this.saveProgress();this.storyDialog216?.(c,true);this.say('記憶收束 '+s.memory.length+'/12｜'+(rank>1?'換位容量提升至 '+rank:'一切開始擁有終點'),3,'#e8d5ab');return true;
};
const interact=P.interact;P.interact=function(){const s=this.uState216(),p=this.player,node=s.nodes?.find(n=>Math.hypot(n.x-cx(p),n.y+15-cy(p))<108);if(node){this.claimMemory216(node.id);return;}return interact.call(this);};
P.ritual216=function(){const s=this.uState216();if(this.currentRoomId!=='r11'||this.roomById.get(this.currentRoomId)?.shelter)return false;s.ritual=true;if(s.defeated.time===0)s.time=100;if(s.defeated.space===0)s.space=100;this.close216?.();this.say('觀測台開啟：失控會先預警四秒，再凝成魔物。',3,'#f0c790');return true;};
P.spawnAnomaly216=function(kind){const s=this.uState216(),p=this.player,r=this.roomById.get(this.currentRoomId);if(s.active||!r||r.shelter)return null;const x=cl(cx(p)+p.dir*320,r.x+100,r.x+r.w-100),floor=this.nGround(x,p.y+p.h);
 const e=this.spawnEnemy(kind==='time'?'charger':'ambusher',x,floor,{room:r.id,hp:kind==='time'?480:540});if(!e)return null;
 Object.assign(e,{name:kind==='time'?'時間魔物・漏刻獸':'空間魔物・折界織蛾',anomaly216:kind,w:kind==='time'?106:90,h:kind==='time'?96:84,y:floor-(kind==='time'?96:84),xBoss:true,frontier19:false,species17:null,v16Layer:this.vLayer(),hidden:false,aggro:true,speed:125,damage:16,stun:0,freeze:0,root:0,breakMax:180,break:180,breakStun:0,uPhase:'watch',uNext:this.time+1.05,uBorn:this.time});s.active=e.id;s.warning=null;this.fx216('nova',cx(e),cy(e),205,kind==='time'?'#ebc88c':'#c3a1ff',{duration:.8});this.say(e.name+'｜看清鎖定軌跡，再換位反擊。',3);return e;
};
P.tickAnomaly216=function(e,dt){if(e.dead)return;const s=this.uState216(),p=this.player,now=this.time,kind=e.anomaly216;if(e.room!==this.currentRoomId&&Math.hypot(cx(e)-cx(p),cy(e)-cy(p))>1350){e.dead=true;s.active=null;s[kind]=Math.max(0,s[kind]-35);s.coolUntil=now+60;this.say('魔物失去座標，殘響退去。',2);return;}
 e.dir=cx(p)>cx(e)?1:-1;e.hitFlash=Math.max(0,e.hitFlash-dt);e.freeze=Math.max(0,e.freeze-dt);e.root=Math.max(0,e.root-dt);e.stun=Math.max(0,e.stun-dt);e.armorBreak=Math.max(0,e.armorBreak-dt);e.curse=Math.max(0,e.curse-dt);e.wet=Math.max(0,e.wet-dt);e.markT=Math.max(0,e.markT-dt);e.breakStun=Math.max(0,e.breakStun-dt);
 if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.5;this.nHit(e,4,{element:'fire',echo:true,skill:'burn216'});}}
 if(e.breakStun>0){e.uNext=Math.max(e.uNext,now+.45);e.uPhase='recover';e.plan216=null;}
 if(now>=e.uNext){if(e.uPhase==='watch'||e.uPhase==='recover'){
   const old=s.history.filter(q=>q.at<now-.45).at(-1)||p;const aim=kind==='time'?{x:old.x+p.w/2,y:old.y+p.h/2}:{x:cx(p),y:cy(p)};
   const lead=(this.vInit().mode==='future'?1.15:.82)+(s.time>=50&&kind==='time'?.12:0);e.uPhase='windup';e.uNext=now+lead;e.plan216={start:now,until:now+lead,a:{x:cx(e),y:cy(e)},b:aim,other:{x:aim.x+(e.dir*190),y:aim.y-90},hit:false};e.vx=0;
  }else if(e.uPhase==='windup'){
   e.uPhase='strike';e.uNext=now+.32;const q=e.plan216;
   if(kind==='space'){const safe=this.swapLanding215(q.b.x-e.dir*85-e.w/2,q.b.y-e.h/2,e.w,e.h);if(safe){e.x=safe.x;e.y=safe.y;this.fx216('gate',cx(e),cy(e),90,'#c6a5ff');}}
   e.vx=cl((q.b.x-cx(e))*4.5,-660,660);e.vy=kind==='space'?0:Math.min(e.vy,0);this.fx216(kind==='time'?'slashline':'cross',cx(e),cy(e),105,kind==='time'?'#eac58c':'#c4a0ff',{x2:q.b.x,y2:q.b.y,duration:.35});
  }else {e.uPhase='recover';e.uNext=now+1.05;e.vx=0;e.plan216=null;e.expose216=now+.85;}
 }
 if(e.uPhase==='watch'){e.vx=Math.sign(cx(p)-cx(e))*Math.min(55,Math.abs(cx(p)-cx(e))*.13);}
 if(e.uPhase==='windup'||e.uPhase==='recover')e.vx*=Math.max(0,1-dt*12);
 if(kind==='space'){e.vy+=Math.sin(now*2+e.id)*8*dt;}else e.vy=Math.min(700,e.vy+C.PHYSICS.gravity*dt);
 if(this.vInit().mode==='past')e.vx*=.82;if(e.freeze<=0)this.moveBody(e,dt);
 if(e.uPhase==='strike'&&!e.plan216?.hit&&Math.abs(cx(e)-cx(p))<e.w*.7+p.w*.5+20&&Math.abs(cy(e)-cy(p))<e.h*.65+p.h*.5){e.plan216.hit=true;this.hurtPlayer(16,Math.sign(cx(p)-cx(e))*240,-180,e.name);}
};
const enemyTick=P.updateEnemies;P.updateEnemies=function(dt){const all=this.enemies,custom=all.filter(e=>e.anomaly216&&!e.dead);this.enemies=all.filter(e=>!e.anomaly216);try{enemyTick.call(this,dt);}finally{this.enemies=all;}if(dt>0)for(const e of custom)this.tickAnomaly216(e,dt);
 if(this.vInit().mode==='past')for(const e of this.enemies)if(!e.dead&&!e.anomaly216&&Math.hypot(cx(e)-cx(this.player),cy(e)-cy(this.player))<700){e.slow17=this.time+.25;}
};
P.tickWorld216=function(dt){const s=this.uState216(),r=this.roomById.get(this.currentRoomId);if(!r)return;if(!s.visits.includes(r.id)){s.visits.push(r.id);this.mark216('visit');if(r.chapter216){s.roomFlash={name:r.name,at:this.time};this.fx216('sigil',cx(this.player),this.player.y-40,60,'#e8d5aa');}}
 if(s.active&&!this.enemies.some(e=>e.id===s.active&&!e.dead)){s.active=null;s.coolUntil=this.time+60;}
 if(r.shelter){s.warning=null;return;}
 if(s.active)return;
 let kind=s.time>=100?'time':s.space>=100?'space':null;if(!kind){s.warning=null;return;}
 if(this.time<s.coolUntil&&!(s.ritual&&!s.defeated[kind]))return;
 if(!s.warning||s.warning.kind!==kind||s.warning.room!==r.id){s.warning={kind,at:this.time,until:this.time+4,room:r.id};this.say((kind==='time'?'時間':'空間')+'失控 100｜四秒後魔物凝聚；現在仍可離開。',4,kind==='time'?'#efcf94':'#c5a5ff');}
 if(s.warning&&this.time>=s.warning.until)this.spawnAnomaly216(kind);
};
const family=P.lMonsterFamily;P.lMonsterFamily=function(e){if(e.anomaly216)return e.anomaly216==='time'?'boss':'bird';return family.call(this,e);};
// Future perception is a real locked-attack forecast, not just a scene tint.
const effects=P.drawEffects;P.drawEffects=function(c){effects.call(this,c);const s=this.uState216(),p=this.player;
 for(const n of s.nodes||[]){if(n.x<this.camera.x-100||n.x>this.camera.x+this.viewW+100||n.y<this.camera.y-150||n.y>this.camera.y+this.viewH+100)continue;const claimed=s.memory.includes(n.id),col=claimed?'#78a9b6':'#ead4a1',y=n.y+5+Math.sin(this.time*2+n.index)*3;c.save();c.strokeStyle=col;c.lineWidth=1.6;c.fillStyle=claimed?'#12333c':'#1e2c39';c.beginPath();c.moveTo(n.x,y-20);c.lineTo(n.x+14,y);c.lineTo(n.x,y+22);c.lineTo(n.x-14,y);c.closePath();c.fill();c.stroke();c.globalAlpha=.32;c.beginPath();c.ellipse(n.x,n.y+39,29,5,0,0,Math.PI*2);c.stroke();c.restore();this.vText(c,claimed?'已收束':String(n.index+1).padStart(2,'0')+'・記憶',n.x,n.y-38,col,11);if(Math.hypot(n.x-cx(p),n.y+15-cy(p))<108)this.vText(c,'E '+(claimed?'重讀':'收束'),n.x,n.y-58,'#fff0ca',14);}
 for(const e of this.enemies){if(e.dead)continue;const q=e.plan216;if(e.anomaly216){const col=e.anomaly216==='time'?'#efc891':'#c6a5ff';c.save();c.globalAlpha=.65;c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.arc(cx(e),cy(e),e.w*.7,this.time*.6,this.time*.6+Math.PI*1.55);c.stroke();if(e.expose216>this.time){c.fillStyle='#fceac9';c.beginPath();c.arc(cx(e),cy(e)-18,5,0,Math.PI*2);c.fill();}c.restore();}
  if(q&&e.uPhase==='windup'){const f=cl((this.time-q.start)/(q.until-q.start),0,1);c.save();c.strokeStyle=e.anomaly216==='time'?'#f1c995':'#c2a2ff';c.globalAlpha=.4+f*.5;c.lineWidth=2+f*2;c.setLineDash([8,9]);c.beginPath();c.moveTo(q.a.x,q.a.y);c.lineTo(q.b.x,q.b.y);c.stroke();c.setLineDash([]);c.strokeRect(q.b.x-32,q.b.y-37,64,74);if(e.anomaly216==='space'){c.globalAlpha=.23;c.strokeRect(q.other.x-32,q.other.y-37,64,74);this.vText(c,'虛像',q.other.x,q.other.y-49,'#bea9eb',11);}c.restore();this.vText(c,'鎖定 '+Math.max(0,q.until-this.time).toFixed(1)+'s',q.b.x,q.b.y-53,'#ffe4b2',12);}
  else if(this.vInit().mode==='future'&&(e.fLocked||e.telegraph)&&Math.hypot(cx(e)-cx(p),cy(e)-cy(p))<900){c.save();c.strokeStyle='#94dfd2';c.globalAlpha=.5;c.setLineDash([5,8]);c.beginPath();c.moveTo(cx(e),cy(e));c.lineTo(cx(p),cy(p));c.stroke();c.restore();}
 }
};
})();
