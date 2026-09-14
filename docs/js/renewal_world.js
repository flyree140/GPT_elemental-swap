/* V18 terrain, world-coordinate transitions and nine physical world rules.
 * Chambers and corridors are AIR carved into a single bedrock field (32px cells).
 * Walking never calls travel/teleport. Rendering and collision use the same mesh.
 */
(()=>{'use strict';
const C=ES9,W=ES9_WORLD,D=ES18,P=ES9_ENGINE.Game.prototype;
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b,r)=>Math.hypot(cx(a)-cx(b),cy(a)-cy(b))<r;
P.nInit=function(){return this.n18||(this.n18={epoch:1,ruleAt:0,structures:[],corridors:[],terrain:[],solidBins:new Map(),tick:0,events:[],fx:[],objects:[],shots:[],holds:{},lastSafe:null,rule:'now',moved:0,hitSerial:0,tutorial:null,bg:null,migrated:false});};
const load=P.loadProgress;
P.loadProgress=function(){let raw;try{raw=JSON.parse(localStorage.getItem('es18_progress')||'null');}catch{}
 let p;if(raw?.schema18===18){p={...this.defaultProgress(),...raw};p.mastery=ES10_MASTER.normalMaster(raw.mastery);p.expedition17=ES17_NORMALIZE(raw.expedition17);for(const e of C.ELEMENTS){const old=raw.expedition17?.elements?.[e.id];if(old)p.expedition17.elements[e.id]={rank:clamp(Math.floor(+old.rank||0),0,4),branch:old.branch==='B'?'B':'A',tiers:[0,1,2,3].map(i=>old.tiers?.[i]==='B'?'B':'A')};}}
 else{p=load.call(this);try{const old=localStorage.getItem('es10_progress');if(old&&!localStorage.getItem('es17_backup_before_v18'))localStorage.setItem('es17_backup_before_v18',old);}catch{}
 let refund=0;const valid=new Set(Object.values(D.skills).flat().map(s=>s.id));for(const [id,rank]of Object.entries(p.mastery.ranks||{}))if(!valid.has(id))refund+=rank>=2?3:rank>=1?1:0;p.mastery.points+=refund;p.refund18=refund;
 p.mastery.loadouts=ES10_MASTER.normalMaster(p.mastery).loadouts;
 }
 if(!C.CLASSES[p.classId])p.classId='rift';p.schema18=18;p.tutorial18=p.tutorial18||{};p.vision16={...(p.vision16||{}),slots:(p.vision16?.slots||['echo','past']).map((id,i)=>D.order.includes(id)?id:i?'past':'echo'),branches:{causal:'A',thermal:'A',scale:'A',slice:'A',...(p.vision16?.branches||{})}};
 for(const e of Object.values(p.expedition17.elements)){e.tiers=Array.from({length:4},(_,i)=>e.tiers?.[i]|| (i===0?e.branch:'A'));e.rank=clamp(e.rank,0,4);}
 return p;
};
P.saveProgress=function(){try{this.progress.schema18=18;localStorage.setItem('es18_progress',JSON.stringify(this.progress));this.saveBlocked=false;}catch{this.saveBlocked=true;}};
const geo=P.buildRoomGeometry;
P.buildRoomGeometry=function(r){if(r.id==='n18_lab'){r.floorY=r.y+r.h-44;this.addPlatform(r.x-24,r.floorY,r.w+48,44,'roomFloor',{room:r.id,oneWay:false,bed18:true});this.addPlatform(r.x+65,r.floorY-400,290,22,'catwalk',{room:r.id});this.ladders.push({id:this.id(),x:r.x+1060,y:r.floorY-440,w:42,h:440,room:r.id},{id:this.id(),x:r.x+220,y:r.floorY-400,w:42,h:400,room:r.id});return;}if(r.rescue17){r.floorY=r.y+r.h-44;return;}if(!r.x17)return geo.call(this,r);
 r.floorY=r.y+r.h-44;
 this.addPlatform(r.x-24,r.floorY,r.w+48,44,'roomFloor',{room:r.id,oneWay:false,bed18:true});
 // Non-repeating terrain ledges. No full-height side walls and no teleport doors.
 const j=ES17.biomes[r.biome].index,levels=r.shelter?2:3+(r.stage%2);
 for(let i=0;i<levels;i++){const xx=r.x+200+((i*491+j*133+r.stage*87)%(r.w-630)),yy=r.floorY-150-i*(130+(j%3)*24),ww=210+((i*79+j*47)%180);this.addPlatform(xx,yy,ww,22,i%2?'rockLedge':'catwalk',{room:r.id});this.rings.push({id:this.id(),x:xx+ww*.5,y:yy-78,r:18,room:r.id});}
 this.ladders.push({id:this.id(),x:r.x+110,y:r.floorY-r.h+165,w:40,h:r.h-165,room:r.id});
 if(r.shelter)this.addPlatform(r.x+700,r.floorY-278,670,22,'shelterFloor',{room:r.id});
};
P.connectionPoints=function(a,b){const right=b.x+b.w/2>=a.x+a.w/2;return{s:{x:right?a.x+a.w-8:a.x+8,y:a.floorY-4},t:{x:right?b.x+8:b.x+b.w-8,y:b.floorY-4}};};
P.buildConnection=function(e,i){const a=this.roomById.get(e.a),b=this.roomById.get(e.b);if(!a||!b||a.rescue17||b.rescue17)return;const {s,t}=this.connectionPoints(a,b),dx=t.x-s.x,dy=t.y-s.y;
 const bend=Math.min(230,Math.abs(dx)*.11)*(i%2?1:-1);const points=[];const steps=Math.max(2,Math.ceil(Math.hypot(dx,dy)/100));
 for(let j=0;j<=steps;j++){const u=j/steps;points.push({x:s.x+dx*u,y:s.y+dy*u+Math.sin(u*Math.PI)*bend});}
 this.nInit().corridors.push({a:e.a,b:e.b,points,edge:e,label:e.label||'連續步道'});
 if(Math.abs(dy)>Math.abs(dx)*.75){const mx=(s.x+t.x)/2;this.ladders.push({id:this.id(),x:mx-20,y:Math.min(s.y,t.y)-80,w:40,h:Math.abs(dy)+130,n18Corridor:true});}
 if(e.gate){const p=points[Math.floor(points.length*.52)];this.gates.push({id:this.id(),edge:i,a:e.a,b:e.b,gate:e.gate,label:e.label,x:p.x-22,y:p.y-260,w:44,h:330,horizontal:true,flash:0});}
};
P.nCarveWorld=function(){const n=this.nInit(),cell=32,cols=Math.ceil(C.WORLD_W/cell),rows=Math.ceil(C.WORLD_H/cell),air=new Uint8Array(cols*rows);
 const rect=(x,y,w,h)=>{const x0=clamp(Math.floor(x/cell),1,cols-2),x1=clamp(Math.ceil((x+w)/cell),1,cols-2),y0=clamp(Math.floor(y/cell),1,rows-2),y1=clamp(Math.ceil((y+h)/cell),1,rows-2);for(let yy=y0;yy<=y1;yy++)air.fill(1,yy*cols+x0,yy*cols+x1+1);};
 for(const r of this.rooms){rect(r.x-40,r.y-32,r.w+80,r.floorY-r.y+84);if(!r.shelter){for(let k=0;k<5;k++){const x=r.x+70+k*(r.w-200)/5;rect(x,r.y-50-(k*43+r.art*11)%150,180,250);}}}
 for(const c of n.corridors){for(let j=0;j<c.points.length-1;j++){const a=c.points[j],b=c.points[j+1],ct=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/22));for(let k=0;k<=ct;k++){const u=k/ct;rect(a.x+(b.x-a.x)*u-155,a.y+(b.y-a.y)*u-335,310,414);}}
  // Continuous safe stairs along sloping tunnels; shafts also have frequent ladders.
  for(let j=0;j<c.points.length-1;j++){const a=c.points[j],b=c.points[j+1];if(Math.abs(b.y-a.y)>40){this.ladders.push({id:this.id(),x:(a.x+b.x)/2-23,y:Math.min(a.y,b.y)-180,w:46,h:Math.abs(b.y-a.y)+275,n18Corridor:true});}}
 }
 // Merge solid runs vertically. The mesh is used for both collision and rendering.
 const mesh=[],open=new Map();
 for(let y=0;y<rows;y++){const next=new Map();let x=0;while(x<cols){if(air[y*cols+x]){x++;continue;}const from=x;while(x<cols&&!air[y*cols+x])x++;const key=from+':'+x,prev=open.get(key);if(prev){prev.h+=cell;next.set(key,prev);}else{const o={id:'bed18_'+mesh.length,x:from*cell,y:y*cell,w:(x-from)*cell,h:cell,type:'bedrock18',oneWay:false,active:true,bed18:true};mesh.push(o);next.set(key,o);}}open.clear();for(const [k,v]of next)open.set(k,v);}
 n.terrain=mesh;n.mask=air;n.cols=cols;n.rows=rows;n.cell=cell;n.solidBins=new Map();const bin=512;
 for(const s of mesh)for(let y=Math.floor(s.y/bin);y<=Math.floor((s.y+s.h-.01)/bin);y++)for(let x=Math.floor(s.x/bin);x<=Math.floor((s.x+s.w-.01)/bin);x++){const key=x+','+y;if(!n.solidBins.has(key))n.solidBins.set(key,[]);n.solidBins.get(key).push(s);}
};
P.nTerrainAt=function(b,margin=96){const n=this.nInit(),res=new Set();for(let y=Math.floor((b.y-margin)/512);y<=Math.floor((b.y+b.h+margin)/512);y++)for(let x=Math.floor((b.x-margin)/512);x<=Math.floor((b.x+b.w+margin)/512);x++)for(const s of n.solidBins.get(x+','+y)||[])if(s.x<b.x+b.w+margin&&s.x+s.w>b.x-margin&&s.y<b.y+b.h+margin&&s.y+s.h>b.y-margin)res.add(s);return [...res];};
const build=P.buildWorld;
P.buildWorld=function(){this.nInit();build.call(this);const n=this.n18;
 // Remove V17's world-wide rescue sea and portal-only room exits completely.
 this.rooms=this.rooms.filter(r=>!r.rescue17);this.roomById=new Map(this.rooms.map(r=>[r.id,r]));W.rooms=W.rooms.filter(r=>!r.rescue17);W.edges=W.edges.filter(e=>e.a!=='x17_rescue'&&e.b!=='x17_rescue');W.shelters=W.shelters.filter(id=>this.roomById.has(id));
 this.platforms=this.platforms.filter(s=>s.room!=='x17_rescue');this.enemies=this.enemies.filter(e=>e.room!=='x17_rescue');this.x17.doors=[];this.x17.respawns=[];
 // Add stable shore benches and room-specific silhouettes, not a universal water level.
 for(const r of this.rooms){if(!r.shelter&&r.continuous18){for(let i=0;i<3;i++){const xx=r.x+150+i*530,hh=18+(i*19+r.stage*23)%65;this.addPlatform(xx,r.floorY-hh,270,hh,'rockLedge',{room:r.id,oneWay:false,bed18:true});}}
  if(r.x17&&!r.shelter){const floor=r.floorY;const water=['reef','abyss'].includes(r.biome);n.structures.push({id:'past18_'+r.id,x:r.x+r.w*.32,y:floor-235,w:440,h:24,kind:'bridge',modes:['past'],oneWay:true,label:'過去・完整舊橋',room:r.id});n.structures.push({id:'future18_'+r.id,x:r.x+r.w*.60,y:floor-130,baseY:floor-130,w:230,h:20,kind:'lift',modes:['future'],oneWay:true,label:'未來・緩升機台',room:r.id});n.structures.push({id:'inner18_'+r.id,x:r.x+450,y:floor-410,w:390,h:22,kind:'bridge',modes:['inner'],oneWay:true,label:'裏層・靈紋棧道',room:r.id});n.structures.push({id:'decay18_'+r.id,x:r.x+r.w*.55,y:floor-420,w:300,h:25,kind:'ruin',modes:['now','echo','heavy','invert','elastic','fungal','decay'],oneWay:true,label:'可崩壞遺構',room:r.id,decayAfter:3+(r.stage%4)*1.5});
   if(water){n.structures.push({id:'air18_'+r.id,x:r.x+160,y:floor-350,w:155,h:110,kind:'air',modes:['all'],label:'上升氣泡・可補氧',room:r.id});}
  }
 }
 // A reusable, honest test arena containing examples of all topological rules.
 const lab=this.roomById.get('n18_lab');
 n.structures.push({id:'labPast',x:lab.x+1100,y:lab.floorY-220,w:380,h:24,kind:'bridge',modes:['past'],oneWay:true,label:'過去・修復的斷橋',room:lab.id},{id:'labFuture',x:lab.x+1650,y:lab.floorY-110,baseY:lab.floorY-110,w:190,h:20,kind:'lift',modes:['future'],oneWay:true,label:'未來・運轉的升降台',room:lab.id},{id:'labInner',x:lab.x+1120,y:lab.floorY-410,w:360,h:22,kind:'bridge',modes:['inner'],oneWay:true,label:'裏層・旁路',room:lab.id},{id:'labWall',x:lab.x+1400,y:lab.floorY-170,w:36,h:170,kind:'wall',modes:['now','echo','past','heavy','invert','elastic','fungal','decay'],oneWay:false,label:'表層牆・裏／未來通行',room:lab.id},{id:'labDecay',x:lab.x+630,y:lab.floorY-180,w:280,h:22,kind:'ruin',modes:['now','echo','heavy','invert','elastic','fungal','decay'],oneWay:true,label:'崩壞測試高台',room:lab.id,decayAfter:4});
 this.nCarveWorld();
 for(const e of this.enemies){if(e.x17&&!e.xBoss&&String(e.species17).endsWith('_v'))e.v16Layer='C';else if(!e.v16Guard)e.v16Layer='B';}
 n.lastSafe={x:this.player.x,y:this.player.y,room:this.currentRoomId};this.sceneMode11=false;
 this.camera.x=clamp(cx(this.player)-this.viewW*.43,0,C.WORLD_W-this.viewW);this.camera.y=clamp(cy(this.player)-this.viewH*.55,0,C.WORLD_H-this.viewH);
};
P.nStructureActive=function(s,mode=this._nMode||this.vision16?.mode||'now'){if(s.kind==='air')return false;if(s.until&&s.until<=this.time)return false;if(s.modes&&!s.modes.includes(mode)&&!s.modes.includes('all'))return false;if(s.kind==='ruin'&&mode==='decay'&&this.time-this.nInit().ruleAt>=(s.decayAfter||6))return false;return true;};
const platforms=P.activePlatforms;
P.activePlatforms=function(b=this.player){const n=this.nInit();return platforms.call(this,b).filter(s=>s.room!=='x17_rescue').concat(this.nTerrainAt(b,260),n.structures.filter(s=>this.nStructureActive(s)&&Math.abs(s.x-b.x)<s.w+900&&Math.abs(s.y-b.y)<s.h+900));};
P.vLayer=function(){return (this._nMode||this._vCheckingMode||this.vision16?.mode)==='inner'?'C':'B';};
P.vDims=function(){const p=this.player;return p.classId==='beast'?({wolf:[48,45],eagle:[46,40],bear:[58,62],king:[60,64]}[p.form]||[48,45]):[40,60];};
P.vLanding=function(x,y,w,h,mode=this.vision16?.mode||'now',search=true){if(![x,y,w,h].every(Number.isFinite))return null;const prev=this._nMode;this._nMode=mode;let solids;try{solids=this.activePlatforms({x,y,w,h});}finally{this._nMode=prev;}
 const candidates=[[0,0]];if(search)for(const rad of [8,16,32,48,72,104,136])for(const [dx,dy]of [[0,-rad],[-rad,0],[rad,0],[-rad*.5,-rad],[rad*.5,-rad]])candidates.push([dx,dy]);
 for(const [dx,dy]of candidates){const q={x:x+dx,y:y+dy,w,h};if(q.x<4||q.y<4||q.x+w>C.WORLD_W-4||q.y+h>C.WORLD_H-4)continue;if(!solids.some(s=>hit(q,s)))return {x:q.x,y:q.y};}return null;
};
// Preserve a precise clear airborne location. Do not snap to a room's nearest floor.
const safe=P.findSafePosition;
P.findSafePosition=function(x,y,w,h){if(!this.n18?.terrain.length)return safe.call(this,x,y,w,h);return this.vLanding(x,y,w,h)||{x:this.player.checkpoint.x,y:this.player.checkpoint.y};};
P.nGatePath=function(a,b,w=40,h=60){const gates=[...this.xInit().gateSolids.filter(g=>!this.xState().gates[g.biome]),...this.gates.filter(g=>!this.gateOpen(g)),...(this.masterGates||[]).filter(g=>!this.progress.solved[g.relay])];const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/24));for(let i=0;i<=steps;i++){const t=i/steps,q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,w,h};if(gates.some(g=>hit(q,g)))return true;}return false;};
P.xBlockedGate=function(from,to){return this.nGatePath({x:from,y:this.player.y},{x:to,y:this.player.y},this.player.w,this.player.h);};
P.nDiscontinuity=function(){const n=this.nInit();n.epoch++;n.holds={};this.elementShots=[];this.enemyShots=[];this.skillShots=[];this.masterMissiles=[];this.pendingM=this.linkM=null;this.tasksM=[];this.epochM++;for(const e of this.enemies){e.mark=null;e.markT=0;}this.player.history='';this.player.attack=null;this.vInit().discontinuity=true;this.vInit().path=[];this.vInit().actions=[];};
P.xTravel=function(id,force=false){const r=this.roomById.get(id);if(!r)return false;if(!force&&!r.shelter&&!this.progress.discovered[id]){this.xNotice('尚未探索。請走連續步道，或先抵達當地營地。');return false;}
 if(!force&&r.stage>=3&&!this.xState().gates[r.biome]){this.xNotice('當地環境聯鎖尚未解除。');return false;}
 if(this.n18.tutorial&&!this._nTrainingTravel)this.nEndTutorial?.();this.nDiscontinuity();this.vResetTransient();this.n18.objects=[];this.n18.shots=[];this.x17.fields=[];this.x17.links=[];this.x17.portals=[];
 const p=this.player;Object.assign(p,{x:r.x+270,y:r.floorY-p.h-4,vx:0,vy:0,downT:0,castT:0,inv:1,onGround:false});const pos=this.vLanding(p.x,p.y,p.w,p.h);if(pos)Object.assign(p,pos);
 this.currentRoomId=id;this.currentRegion=r.region;this.progress.discovered[id]=true;if(r.shelter){p.checkpoint={x:p.x,y:p.y,room:id};this.progress.shelters[id]=true;this.xState().lastCamp=id;}
 this.camera.x=clamp(cx(p)-this.viewW*.4,0,C.WORLD_W-this.viewW);this.camera.y=clamp(cy(p)-this.viewH*.53,0,C.WORLD_H-this.viewH);this.x17.oxygen=16;this.n18.lastSafe={x:p.x,y:p.y,room:id};this.closeModalsM();this.saveProgress();this.nEvent?.('travel',id);return true;
};
P.travelHome11=function(id){return this.xTravel(id);};
P.findElementTarget=function(id){const p=this.player,epoch=this.nInit().epoch,es=this.enemies.filter(e=>!e.dead&&e.mark===id&&e.markT>0&&near(e,p,1450)&&this.vCanHit(e)).sort((a,b)=>Math.hypot(cx(a)-cx(p),cy(a)-cy(p))-Math.hypot(cx(b)-cx(p),cy(b)-cy(p)));if(es.length)return{kind:'enemy',ref:es[0]};const ss=this.elementShots.filter(s=>s.t>0&&s.anchor&&s.element===id&&(s.epoch18===undefined||s.epoch18===epoch)&&near(s,p,1600)&&((s.v16Layer||'B')===this.vLayer()||id==='shadow'));ss.sort((a,b)=>b.id-a.id);return ss[0]?{kind:'shot',ref:ss[0]}:null;};
const fire=P.fireElement;P.fireElement=function(el,i){fire.call(this,el,i);const s=this.elementShots.at(-1);if(s)s.epoch18=this.nInit().epoch;this.nEvent?.('fire',el.id);};
// Swaps allow only a small, visible clearance correction, never the general room recovery search.
P.nSwapLanding=function(x,y,w,h){for(const [dx,dy]of [[0,0],[0,-8],[0,-16],[0,-32],[0,-48],[0,-64],[-16,0],[16,0],[-32,0],[32,0]]){const q=this.vLanding(x+dx,y+dy,w,h,this.vInit().mode,false);if(q)return q;}return null;};
P.nRejectSwap=function(q,msg){if(q){q.mark=null;q.markT=0;if(q.anchor){q.anchor=false;q.t=Math.min(q.t,.25);}}this.say(msg+' 無效標記已解除，抬高瞄準後可重射。',2.2);return false;};
P.swapElement=function(target,el,index){const p=this.player,q=target?.ref;if(!q||q.dead||q.t<=0||!near(q,p,1650)||(q.epoch18!==undefined&&q.epoch18!==this.nInit().epoch))return false;
 if(target.kind==='enemy'&&q.type==='sentinel'&&q.breakStun<=0){this.say('先打出 BREAK，才能搬動頭目。',1.5);return false;}
 const old={x:p.x,y:p.y,cx:cx(p),cy:cy(p)},want={x:cx(q)-p.w/2,y:target.kind==='enemy'?q.y+q.h-p.h:cy(q)-p.h/2};
 if(this.nGatePath(old,want,p.w,p.h)){return this.nRejectSwap(q,'換位已取消：路徑穿過尚未解除的機關。');}
 const dest=this.nSwapLanding(want.x,want.y,p.w,p.h),back=this.nSwapLanding(old.cx-q.w/2,target.kind==='enemy'?old.y+p.h-q.h:old.cy-q.h/2,q.w,q.h);
 if(!dest||!back){return this.nRejectSwap(q,'換位已取消：端點空間不足，不會改送到遠處。');}
 Object.assign(q,back,{vx:0,vy:0});if(target.kind==='shot'){q.stuck=true;q.t=Math.max(q.t,6);}else{q.mark=null;q.markT=0;q.stun=Math.max(q.stun,.35);}
 Object.assign(p,dest,{vx:0,vy:0,inv:.4,onGround:false});p.airDashes=Math.max(p.airDashes,1);p.attack=null;p.buffer=null;p.history='';this.pendingM=this.linkM=null;this.lastSwap=el.id;this.vInit().discontinuity=true;
 this.elementSwapEffect(el,old,{x:cx(p),y:cy(p)});this.resonanceM={element:el.id,until:this.time+3};this.mEmit('swap',{element:el.id,kind:target.kind});this.sfx.swap(index);this.vBurst(old.cx,old.cy,el.color,85);this.vBurst(cx(p),cy(p),el.color,85);this.nEvent?.('swap',el.id);this.say(el.name+'換位完成｜保留世界座標',1);return true;
};
// B-I do not call V17's old skill-like filters. Echo's sampler/replay remains untouched.
P.vSwitch=function(mode){if(mode!=='now'&&!D.order.includes(mode))return false;const v=this.vInit(),p=this.player,n=this.nInit();if(mode===v.mode)mode='now';if(mode!=='now'&&(v.cd[mode]||0)>this.time)return false;
 const dest=this.vLanding(p.x,p.y,p.w,p.h,mode);if(!dest){this.say('此處恢復後會被牆包住，請先離開 1 格再切換。',1.7);return false;}
 const from=v.mode;if((from==='invert')!==(mode==='invert')){for(const b of [p,...this.enemies.filter(e=>!e.dead),...this.enemyShots,...this.elementShots,...this.skillShots,...(this.masterMissiles||[]),...this.n18.shots,...this.crates]){if(Number.isFinite(b.vx))b.vx=-b.vx;if(Number.isFinite(b.vy))b.vy=-b.vy;}this.n18.invertedAt=this.time;this.n18.invertMoving18=Math.abs(p.vx)+Math.abs(p.vy)>30;}
 v.mode=mode;n.ruleAt=this.time;n.rule=mode;Object.assign(p,dest);v.zoom=1;v.transition=.25;v.cd[mode]=this.time+(mode==='echo'?3.5:.4);if(from==='inner'||mode==='inner')v.discontinuity=true;
 if(mode==='echo')this.vMakeEcho();this.nEvent?.('rule',mode);this.vEmit('switch',{from,mode});this.vBurst(cx(p),cy(p),(D.modes[mode]||ES16.modes.now).color,60);this.say((D.modes[mode]||ES16.modes.now).name,1);return true;
};
P.vLayerPressure=function(){};P.vTickMaterials=function(){}; // Retired laboratory gimmicks do not leak into the new rules.
P.vMaterialSolids=function(){const v=this.vInit();return v.rails.filter(s=>s.until>this.time&&s.layer===this.vLayer()).map(s=>({...s,oneWay:true,type:'visionRail'}));};
const env=P.xEnvironment;P.xEnvironment=function(){const out=env.call(this),p=this.player,r=this.roomById.get(this.currentRoomId);if(r?.biome==='umbra'&&this.vision16?.mode==='inner')out.speed=1;for(const s of this.nInit().structures)if(s.kind==='air'&&s.room===r?.id&&hit(p,s)){out.water=false;out.pressure=false;out.airPocket18=true;}
 if(this.vision16?.mode==='future'&&r?.biome==='reef'&&!r.shelter)out.water=cy(p)>r.floorY-170;if(this.vision16?.mode==='past'&&r?.biome==='dune')out.speed=1;return out;};
// Collision substeps prevent high-velocity swaps/dashes tunnelling through narrow walls.
const move=P.moveBody;P.moveBody=function(b,dt,opts){const n=this.nInit(),mode=this.vision16?.mode,prev={x:b.x,y:b.y},vx=b.vx,vy=b.vy,ground=b.onGround;
 const steps=clamp(Math.ceil(Math.max(Math.abs(vx*dt),Math.abs(vy*dt))/16),1,12);let result;
 for(let i=0;i<steps;i++){const before={x:b.x,y:b.y};result=move.call(this,b,dt/steps,opts);
  if(b===this.player&&ground&&(b.wallLeft||b.wallRight)&&Math.abs(vx)>10&&mode!=='elastic'){
   const step={x:before.x+vx*dt/steps,y:before.y-33,w:b.w,h:b.h};if(!this.activePlatforms(step).some(s=>!s.oneWay&&hit(step,s))){Object.assign(b,{x:step.x,y:step.y,vx});}
  }
 }
 if(mode==='elastic'&&!(b===this.player&&this.key('down'))){if(b.onGround&&vy>220){b.vy=-clamp(Math.abs(vy)*.91+85,310,960);b.onGround=false;this.nEvent?.('bounce','floor');}if((b.wallLeft||b.wallRight)&&Math.abs(vx)>110){b.vx=-vx*.88;b.vy=Math.min(b.vy,-150);this.nEvent?.('bounce','wall');}}
 if(mode==='heavy'&&b===this.player&&!ground&&b.onGround&&vy>540&&this.time>(n.landPulse||0)){n.landPulse=this.time+.7;this.nArea?.(cx(b),b.y+b.h,170,16,{name:'重力落震',element:'earth',root:.55});this.nEvent?.('heavyLand',vy);}
 return {prevX:prev.x,prevY:prev.y};
};
P.updateCamera=function(dt){const p=this.player,n=this.nInit(),mobile=this.xState().uiMode==='mobile';this.vInit().zoom=1;
 const look=clamp(p.vx*.13,-65,65),tx=clamp(cx(p)-this.viewW*.45+look,0,Math.max(0,C.WORLD_W-this.viewW)),ty=clamp(cy(p)-this.viewH*(mobile?.44:.53)+clamp(p.vy*.07,-36,70),0,Math.max(0,C.WORLD_H-this.viewH));const alpha=1-Math.exp(-9*dt);
 this.camera.x+=(tx-this.camera.x)*alpha;this.camera.y+=(ty-this.camera.y)*alpha;
 // Camera is bounded by the WORLD, never by a room or biome rectangle.
 this.camera.x=clamp(this.camera.x,p.x-this.viewW+115,p.x-85);this.camera.y=clamp(this.camera.y,p.y-this.viewH+180,p.y-70);
};
const grav=P.gravityPull;P.gravityPull=function(x,y,r,power){return grav.call(this,x,y,r,this.vision16?.mode==='invert'?-power:power);};
const update=P.update;
P.update=function(dt,ts){const n=this.nInit();if(this.modalM()||this.paused){update.call(this,dt,ts);return;}const old={gravity:C.PHYSICS.gravity},mode=this.vInit().mode,before={x:this.player.x,y:this.player.y};if(mode==='heavy')C.PHYSICS.gravity*=2.15;
 try{update.call(this,dt,ts);}finally{C.PHYSICS.gravity=old.gravity;}if(this.modalM()||this.paused)return;
 const p=this.player;n.moved+=Math.min(50,Math.hypot(p.x-before.x,p.y-before.y));if(p.onGround&&Number.isFinite(p.x)&&!this.activePlatforms(p).some(s=>!s.oneWay&&hit(p,s)))n.lastSafe={x:p.x,y:p.y,room:this.currentRoomId};
 // Last-resort corrupted-save recovery, not a designed fall-to-respawn mechanic.
 if(![p.x,p.y].every(Number.isFinite)||p.y>C.WORLD_H-80){const q=n.lastSafe||p.checkpoint;Object.assign(p,{x:q.x,y:q.y,vx:0,vy:0});this.say('座標已修復：返回最近實體落點。',2);}
 for(const s of n.structures){if(s.kind==='lift'){const y=s.baseY-(mode==='future'?(1-Math.cos((this.time-n.ruleAt)*.7))*120:0);const dy=y-s.y;if(p.onGround&&p.x+p.w>s.x&&p.x<s.x+s.w&&Math.abs(p.y+p.h-s.y)<4&&mode==='future')p.y+=dy;s.y=y;s.vy=dy/dt;}}
 if(mode==='fungal'&&p.onGround&&this.time>(n.fungalAt||0)&&!n.structures.some(s=>s.fungus18&&Math.hypot(cx(s)-cx(p),s.y-p.y)<125)){n.fungalAt=this.time+1.1;const xx=cx(p)+p.dir*110,yy=p.y+p.h-55;const q={id:'fungus'+this.id(),x:xx-48,y:yy,w:96,h:16,oneWay:true,kind:'mushroom',modes:['fungal'],until:this.time+9,fungus18:true,label:'腳步菌・水催生／火枯萎'};n.structures.push(q);this.nEvent?.('fungus','grown');}
 for(const s of n.structures.filter(s=>s.fungus18&&s.until>this.time)){if(mode!=='fungal')continue;for(const f of this.x17.fields){if(Math.hypot(f.x-cx(s),f.y-s.y)<f.r){if(f.element==='fire')s.until=this.time;if(f.element==='water'){s.w=140;s.until=Math.max(s.until,this.time+3);}}}for(const e of this.enemies)if(!e.dead&&Math.hypot(cx(e)-cx(s),cy(e)-s.y)<155){e.slow17=this.time+.3;if(this.nDrowse&&this.time>(s.pulse||0))this.nDrowse(e,1);}if(this.time>(s.pulse||0))s.pulse=this.time+1.5;}
 n.structures=n.structures.filter(s=>!s.until||s.until>this.time);
 if(mode==='inner'&&!this.roomById.get(this.currentRoomId)?.shelter){const phase=(this.time-n.ruleAt)%7;if(phase>6.35&&phase<6.85&&p.onGround&&Math.floor(p.x/180)%3===1)this.hurtPlayer(4*dt,0,0,'裏層脈衝',true);}
 if(this.time>n.tick){n.tick=this.time+.4;if(this.currentRoomId!==n.room){n.room=this.currentRoomId;this.nEvent?.('room',n.room);}this.nTutorialTick?.();}
 this.nTickCombat?.(dt);this.nTickElementTiers?.(dt);this.nUpdateHUD?.();
};
// Projectile elastic collisions / heavier arcs, world coordinates remain stable across roomAt changes.
const elements=P.updateElements;P.updateElements=function(dt){const mode=this.vInit().mode,olds=this.elementShots.map(s=>({s,vx:s.vx,vy:s.vy,stuck:s.stuck})),g=C.ELEMENTS.map(e=>e.gravity);if(mode==='heavy')C.ELEMENTS.forEach(e=>e.gravity*=2.15);
 try{elements.call(this,dt);}finally{C.ELEMENTS.forEach((e,i)=>e.gravity=g[i]);}
 if(mode==='elastic')for(const {s,vx,vy,stuck}of olds)if(s.t>0&&s.stuck&&!stuck&&(s.bounces18||0)<4){s.stuck=false;s.bounces18=(s.bounces18||0)+1;s.vx=-vx*.88;s.vy=-Math.max(120,Math.abs(vy)*.85);s.y-=18;}
};
})();
