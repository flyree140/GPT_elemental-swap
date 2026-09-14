/* Four independent A/B tiers. A build snapshots every choice when created.
 * Tier modules never overwrite the previous tier's shape, behavior or geometry.
 */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES18,cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),seg=ES18_COMBAT.segmentDistance;
P.nInElement=function(build,e){return build.fields.some(f=>f.t>0&&(f.line?seg(cx(e),cy(e),...f.line)<65:Math.hypot(cx(e)-f.x,cy(e)-f.y)<f.r));};
P.elementSwapEffect=function(el,old,now){const state=this.xState(),q=state.elements[el.id],n=this.nInit(),a={x:old.cx,y:old.cy},b={x:now.x,y:now.y},rank=q.rank,tiers=(q.tiers||[q.branch||'A','A','A','A']).slice(0,rank),br=tiers[0]||'A',dur=rank?5+rank*.4:2.5;
 const build={id:this.id(),element:el.id,rank,tiers:[...tiers],a:{...a},b:{...b},fields:[],platforms:[],start:this.time,until:this.time+dur,pulse:this.time,charges:el.id==='ice'?1:3,shadeAt:0,after:false,layer:this.vLayer(),epoch:n.epoch};n.elementBuilds??=[];n.elementBuilds.push(build);if(n.elementBuilds.length>45)n.elementBuilds.shift();
 const field=(pt,extra={})=>{const f=this.xField(el.id,pt.x,pt.y,165,dur,{damage:['shadow','nature','water','earth','light'].includes(el.id)?0:4,source18:'element',build18:build.id,...extra});build.fields.push(f);return f;};
 const platform=(pt,w=220,t=dur,type=el.id==='ice'?'icePlatform':'skillPlatform')=>{const f=this.xPlatform(pt.x,pt.y,w,t,type);f.build18=build.id;build.platforms.push(f);return f;};
 if(el.id==='lightning')field(br==='A'?{x:(a.x+b.x)/2,y:(a.y+b.y)/2}:b,br==='A'?{line:[{...a},{...b}],behavior:'wire'}:{r:190,behavior:'conductive'});
 else if(el.id==='gravity')field(br==='A'?{x:(a.x+b.x)/2,y:(a.y+b.y)/2}:b,br==='A'?{line:[{...a},{...b}],behavior:'pullwire'}:{r:190,behavior:'float'});
 else if(el.id==='fire'){field(b,{behavior:br==='B'?'firestorm':null});if(br==='A')field(a);}
 else if(el.id==='ice'){field(b,{behavior:br==='B'?'shatter':null});if(br==='A'){platform({x:b.x,y:b.y+35},230);platform({x:a.x,y:a.y+35},230);}}
 else if(el.id==='earth'){field(b,{behavior:br==='B'?'mud':null});if(br==='A'){platform({x:b.x,y:b.y+35},240,dur,'earthPillar');platform({x:b.x+100,y:b.y-80},150,dur,'earthPillar');}}
 else if(el.id==='water'){field(b,{follow:br==='B'});if(br==='A')field(a);}
 else if(el.id==='wind'){field(b,br==='A'?{behavior:'steam'}:{line:[{...a},{...b}],behavior:'windlane'});if(br==='A')field(a,{behavior:'steam'});}
 else if(el.id==='light')field(b,{behavior:br==='A'?'prismfield':'reflect'});
 else if(el.id==='shadow')field(br==='A'?a:b,{behavior:br==='A'?'decoy':'shadowbind18',r:br==='A'?350:170});
 else if(el.id==='nature'){field(b,{behavior:br==='A'?null:'sporebed18'});if(br==='A')platform({x:b.x,y:b.y+35},230,dur,'vinePillar');}
 build.primary=build.fields[0];
 // Tier two adds a separate module. It never changes a Tier-one field.
 if(rank>=2){const side=tiers[1];if(side==='A'){
  if(el.id==='lightning'){field(a,{r:95,damage:0,tier2Root18:true});field(b,{r:95,damage:0,tier2Root18:true});}
  if(el.id==='water')field(a,{r:105,damage:0,t:dur+1});
  if(el.id==='gravity'){field(a,{r:100,behavior:'singularity',damage:0});field(b,{r:100,behavior:'singularity',damage:0});}
  if(el.id==='shadow'){field(a,{r:340,behavior:'decoy',damage:0});field(b,{r:340,behavior:'decoy',damage:0});}
  if(el.id==='fire')for(const at of [a,b])this.nObject('mine',at.x,at.y,{duration:dur+2,r:100,damage:15,label:'LV2 火種・近敵觸發',element:'fire',build18:build.id});
  if(['ice','wind','earth','nature'].includes(el.id))platform({x:b.x+100,y:b.y-90},170,dur+1,el.id==='ice'?'icePlatform':el.id==='nature'?'vinePillar':'skillPlatform');
  if(el.id==='light'){platform({x:a.x,y:a.y+35},170);platform({x:b.x,y:b.y+35},170);}
 }else{if(el.id==='fire')field(b,{r:160,behavior:'steam',damage:0,reaction:'LV2・熱流上升'});if(['ice','earth','nature'].includes(el.id))field(b,{r:165,damage:0,tier2Root18:true,reaction:'LV2・束縛'});}}
 for(const f of this.x17.fields.slice())if(f.build18!==build.id&&f.element!==el.id&&Math.hypot(f.x-b.x,f.y-b.y)<f.r+65)this.xReact(f.element,el.id,b.x,b.y);if(this.xEnvironment().water)this.xReact('water',el.id,b.x,b.y);
 if(state.race==='storm'&&el.id==='lightning')this.player.airDashes=Math.max(1,this.player.airDashes);if(state.race==='astral'&&el.id==='gravity')platform({x:b.x,y:b.y+75},230,6);
 state.stats.swaps++;this.nEvent('evolution',el.id+':'+tiers.join(''));this.xSignal('swap',el.id);return build;
};
P.nTickElementTiers=function(dt){const n=this.nInit(),p=this.player,now=this.time,mode=this.vInit().mode,sign=mode==='invert'?-1:1;const builds=n.elementBuilds||[];
 for(const b of builds){if(b.epoch!==n.epoch)continue;const id=b.element,q=b.tiers,inside=e=>this.nInElement(b,e),living=b.fields.filter(f=>f.t>0),at=living[0]||b.primary,active=living.length>0,ps=active&&inside(p),enemies=this.enemies.filter(e=>!e.dead&&this.vCanHit(e,b.layer,id)&&inside(e));
  if(!active){if(b.rank>=4&&q[3]==='A'&&!b.after&&now>=b.until+2){b.after=true;const loc={x:b.primary.x,y:b.primary.y};const times={ice:6,earth:7,light:6,shadow:5,wind:5};if(times[id])this.xPlatform(loc.x,loc.y+35,250,times[id],id==='ice'?'icePlatform':'skillPlatform');else this.xField(id,loc.x,loc.y,150,3,{damage:['water','nature'].includes(id)?0:3,line:b.primary.line?.map(p=>({...p})),behavior:id==='gravity'?'singularity':id==='nature'?'garden':null,reaction:'LV4・'+(id==='lightning'?'餘電':id==='water'?'雨痕':id==='fire'?'復燃':'再生')});this.nEvent('tierAfter',id);}continue;}
  if(id==='shadow'&&q[0]==='B')for(const e of enemies)e.root=Math.max(e.root||0,.18);
  if(id==='nature'&&q[0]==='B')for(const e of enemies)if(e.wet>0)e.root=Math.max(e.root||0,.3);
  if(id==='lightning'&&q[0]==='B'&&enemies.some(e=>e.wet>0))b.primary.r=Math.max(b.primary.r,235);
  if(b.rank>=2&&q[1]==='B'){
   if(id==='water'&&ps){this.x17.oxygen=Math.min(16,this.x17.oxygen+dt*7);p.vy=Math.min(p.vy,-75);}
   if(['shadow','wind','gravity'].includes(id))for(const e of enemies){const tx=id==='wind'?b.a.x:id==='gravity'?b.b.x:at.x,ty=id==='gravity'?b.b.y:cy(e);e.vx+=Math.sign(tx-cx(e))*145*dt*sign;if(id==='gravity')e.vy+=Math.sign(ty-cy(e))*90*dt*sign;}
  }
  if(b.rank>=3){const block=q[2]===(['lightning','nature','shadow','gravity'].includes(id)?'B':'A')&&['lightning','ice','wind','earth','light','nature','shadow','gravity'].includes(id);
   if(block&&b.charges>0){if(id==='light')for(const f of b.fields)if(f.behavior==='reflect')f.used=true;for(const s of this.enemyShots)if(!s.friendly&&s.t>0&&inside(s)&&b.charges>0){b.charges--;if(['light','ice','wind'].includes(id)){s.friendly=true;s.vx*=-1;s.vy*=-1;}else s.t=0;if(id==='gravity')p.shield=Math.min(60,p.shield+8);this.nFX('block',cx(s),cy(s),25,C.ELEMENTS.find(e=>e.id===id).color);this.nEvent('tierBlock',id);}}
   if(id==='wind'&&q[2]==='B'&&ps&&(this.key('left')||this.key('right')))p.vx*=1+dt*.6;
   if(id==='light'&&q[2]==='B')for(const e of this.enemies)if(!e.dead&&inside(e))e.v16LinkUntil=now+.35;
  }
  if(b.rank>=4&&q[3]==='B'&&ps){if(id==='fire'){n.thermalShelter=now+.2;p.burn=0;}if(['wind','gravity'].includes(id)){p.vy=Math.min(p.vy,150);if(id==='wind')for(const e of enemies)e.vy=Math.min(e.vy,150);}if(id==='water')p.burn=0;if(id==='nature')this.x17.oxygen=Math.min(16,this.x17.oxygen+dt*3);if(id==='earth'&&b.rank>=3&&q[2]==='B')n.stableEarth=now+.25;}
  if(now<b.pulse)continue;b.pulse=now+1;
  if(b.rank>=2){for(const f of b.fields.filter(f=>f.t>0&&f.tier2Root18))for(const e of enemies)if(Math.hypot(cx(e)-f.x,cy(e)-f.y)<f.r)e.root=Math.max(e.root||0,e.type==='sentinel'?.2:.7);
   if(q[1]==='B'&&id==='lightning'){const hit=new Set();for(const e of enemies){for(const other of this.enemies){if(other===e||other.dead||other.wet<=0||hit.has(other.id)||hit.size>=2||Math.hypot(cx(other)-cx(e),cy(other)-cy(e))>250)continue;hit.add(other.id);this.nRay({x:cx(e),y:cy(e)},{x:cx(other),y:cy(other)},7,{element:'lightning',echo:true,width:8,name:'LV2・導電跳鏈'});this.nEvent('tierChain',other.id);}}}
   if(q[1]==='B'&&id==='light')for(const e of enemies)e.marked17=now+3;
  }
  if(b.rank>=3){const t=q[2];if((id==='lightning'||id==='gravity')&&t==='A')for(const e of enemies)e.root=Math.max(e.root||0,e.type==='sentinel'?.2:.6);
   if((id==='fire'||id==='earth')&&t==='B')for(const e of enemies)e.armorBreak=Math.max(e.armorBreak||0,1.2);
   if(['fire','water','nature'].includes(id)&&t==='A'){let count=0;for(const e of enemies){if(id==='fire'&&e.burn<=0||id==='water'&&e.wet<=0||id==='nature'&&e.wet<=0)continue;for(const other of this.enemies){if(other!==e&&!other.dead&&count<2&&Math.hypot(cx(other)-cx(e),cy(other)-cy(e))<200){count++;this.mStatus(other,id);}}}}
   if(id==='shadow'&&t==='A')for(const e of enemies){this.nDrowse(e,1);if(e.drowse18>=3)this.nSleep(e,1.1);}
   if(id==='ice'&&t==='B')for(const e of enemies)if(e.element17?.id==='lightning'){this.xField('lightning',cx(e),cy(e),90,1.1,{damage:3,reaction:'LV3・碎冰導電'});}
   if(id==='water'&&t==='B')for(const e of enemies)e.vx+=Math.sign(at.x-cx(e))*80*sign;
   if(id==='earth'&&t==='B'&&ps)n.stableEarth=now+1.1;
  }
  if(b.rank>=4&&q[3]==='B'&&ps){if(id==='earth'&&Math.abs(p.vx)<15||id==='nature')p.hp=Math.min(p.maxHp,p.hp+2);else if(id==='shadow'){if(now>=b.shadeAt){p.inv=Math.max(p.inv,.25);b.shadeAt=now+3;}}else if(!['wind','gravity'].includes(id))p.shield=Math.min(45,p.shield+3);if(['lightning','gravity'].includes(id))p.airDashes=Math.max(1,p.airDashes);}
 }
 n.elementBuilds=builds.filter(b=>b.epoch===n.epoch&&(b.fields.some(f=>f.t>0)||this.time<b.until+10));
};
// Independent defenses affect received forces, not the player's chosen movement.
const hurt=P.hurtPlayer;P.hurtPlayer=function(d,kx,ky,source,dot){const n=this.nInit();if(n.stableEarth>this.time){kx=(kx||0)*.28;ky=(ky||0)*.6;}if(n.thermalShelter>this.time&&dot&&String(source).includes('熱'))return;return hurt.call(this,d,kx,ky,source,dot);};
// Keep progression text literal and consistent with the implementations above.
D.tierExtras.fire[1][1]='燃燒敵人把火種傳给 200px 內最多兩名敵人。';D.tierExtras.lightning[2][1]='雷線／雷池結束 2 秒後，原處再留一次 3 秒餘電。';D.tierExtras.earth[2][1]='場域結束 2 秒後留下 7 秒臨時岩台。';D.tierExtras.ice[2][1]='結束 2 秒後，原處留下 6 秒無傷冰床。';D.tierExtras.wind[2][1]='風場結束 2 秒後留下 5 秒氣流台。';D.tierExtras.light[2][1]='場域結束 2 秒後留下 6 秒光橋。';D.tierExtras.shadow[2][1]='場域消失 2 秒後留下 5 秒影踏台。';D.tierExtras.nature[2][1]='結束 2 秒後原地再生一次 3 秒治療菌床。';D.tierExtras.gravity[2][1]='場消失 2 秒後，原處重新出現一次 3 秒奇點。';D.tierExtras.gravity[0][3]='保留原主場，再疊加沿兩端連線指向終點的牽引。';
})();
