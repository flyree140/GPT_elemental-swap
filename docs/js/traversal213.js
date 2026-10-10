/* Living Atlas 21.3 — compact continuous traversal, authored traversal grammar.
 * Gameplay geometry, not a map illustration. Rooms/quests/save IDs are retained.
 * No teleport-on-room-entry. All platforms below are real collision surfaces.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,W=ES9_WORLD,L=ES213_LAYOUT;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const hash=s=>Array.from(String(s)).reduce((v,c)=>(v*31+c.charCodeAt(0))>>>0,7);
// Coordinates repacked offline. Room sizes, puzzle names and connection gates unchanged.
for(const r of W.rooms){const q=L.rooms[r.id];if(q){r.original213={x:r.x,y:r.y};r.x=q[0];r.y=q[1];}}
[C.WORLD_W,C.WORLD_H]=L.world;
const start=W.rooms.find(r=>r.id==='r00');C.START_X=start.x+350;C.START_Y=start.y+start.h-88;
for(const reg of W.regions){const rs=W.rooms.filter(r=>r.region===reg.id&&!r.rescue17);if(!rs.length)continue;reg.x=Math.min(...rs.map(r=>r.x));reg.y=Math.min(...rs.map(r=>r.y));reg.w=Math.max(...rs.map(r=>r.x+r.w))-reg.x;reg.h=Math.max(...rs.map(r=>r.y+r.h))-reg.y;}
P.tInit=function(){return this.t213||(this.t213={version:'21.3.0',routes:[],docks:[],props:[],hazards:[],lifts:[],winds:[],checkpoints:[],safe:null,airtime:0,footsteps:[],rescues:0,stats:{},bins:null,dynamics:[],animation:new Map(),swapFX:[]});};
// Use a usable side exit for sideways travel; a broad shaft mouth for vertical routes.
P.connectionPoints=function(a,b){const dx=cx(b)-cx(a),dy=(b.floorY||b.y+b.h-44)-(a.floorY||a.y+a.h-44);
 const side=Math.abs(dx)>Math.abs(dy)*.62;
 if(side)return{s:{x:dx>0?a.x+a.w-16:a.x+16,y:a.floorY},t:{x:dx>0?b.x+16:b.x+b.w-16,y:b.floorY},vertical:false};
 const ax=clamp(cx(b),a.x+150,a.x+a.w-150),bx=clamp(cx(a),b.x+150,b.x+b.w-150);
 return{s:{x:ax,y:a.floorY},t:{x:bx,y:b.floorY},vertical:true};
};
P.buildConnection=function(e,i){const a=this.roomById.get(e.a),b=this.roomById.get(e.b);if(!a||!b||a.rescue17||b.rescue17)return;
 const {s,t,vertical}=this.connectionPoints(a,b),dx=t.x-s.x,dy=t.y-s.y;
 const count=Math.max(2,Math.ceil(Math.abs(dx)/158),Math.ceil((Math.abs(dy)+(vertical?0:88))/88));
 const points=[];const state=this.tInit(),seq=[];
 for(let j=0;j<=count;j++){const u=j/count;
  const x=s.x+dx*u+(vertical?Math.sin(u*Math.PI)*Math.sin(j*Math.PI/2)*52:0);
  const y=s.y+dy*u+(vertical?0:Math.sin(u*Math.PI)*(i%2?28:-28));points.push({x,y});
  // 24–70px open seams, no 700px blind drops. Wider resting ledge every fifth step.
  const width=j===0||j===count?260:j%5===0?250:vertical?194:136;
  const pl=this.addPlatform(x-width/2,y,width,24,'trail213',{oneWay:true,edge:i,trail213:true,room:null,material213:i%4===0?'bridge':'rock',active:true});
  const actual=pl||this.platforms.at(-1);actual.route213=i;actual.node213=j;seq.push(actual);
  if(j>0&&j<count&&j%5===0)state.props.push({x,y,kind:j%10===0?'banner':'lantern',route:i,seed:i*19+j});
  if(j>1&&j<count-1&&j%4===0&&vertical)this.rings.push({id:this.id(),x:x+(i%2?38:-38),y:y-96,r:15,trail213:true});
 }
 const route={a:e.a,b:e.b,edge:e,points,platforms:seq,vertical,index:i,label:e.label||'遺跡棧道'};
 this.nInit().corridors.push(route);state.routes.push(route);
 if(vertical){for(const [r,pt]of [[a,s],[b,t]])state.docks.push({room:r.id,x:pt.x,y:pt.y,width:204});
  // Visible updraft column: press UP to ride, release to jump off; ledges remain usable.
  for(let j=0;j<count;j+=5){const lo=points[j],hi=points[Math.min(j+5,count)];state.winds.push({x:(lo.x+hi.x)/2-82,y:Math.min(lo.y,hi.y)-80,w:164,h:Math.abs(lo.y-hi.y)+130,route:i,color:'#a9eafa'});}
 }
 if(e.gate){const pt=points[Math.floor(points.length*.52)];this.gates.push({id:this.id(),edge:i,a:e.a,b:e.b,gate:e.gate,label:e.label,x:pt.x-22,y:pt.y-270,w:44,h:370,horizontal:true,flash:0});}
};
// Same mask drives collision and the navigable atlas. No ladder generation here.
P.nCarveWorld=function(){const n=this.nInit(),cell=32,cols=Math.ceil(C.WORLD_W/cell),rows=Math.ceil(C.WORLD_H/cell),air=new Uint8Array(cols*rows);
 const rect=(x,y,w,h)=>{const x0=clamp(Math.floor(x/cell),1,cols-2),x1=clamp(Math.ceil((x+w)/cell),1,cols-2),y0=clamp(Math.floor(y/cell),1,rows-2),y1=clamp(Math.ceil((y+h)/cell),1,rows-2);for(let yy=y0;yy<=y1;yy++)air.fill(1,yy*cols+x0,yy*cols+x1+1);};
 for(const r of this.rooms){rect(r.x-42,r.y-34,r.w+84,r.floorY-r.y+100);if(!r.shelter)for(let k=0;k<4;k++)rect(r.x+50+k*(r.w-150)/4,r.y-72-(hash(r.id+k)%90),170,240);}
 for(const c of n.corridors)for(let j=0;j<c.points.length-1;j++){const a=c.points[j],b=c.points[j+1],ct=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/24));for(let k=0;k<=ct;k++){const u=k/ct;rect(a.x+(b.x-a.x)*u-205,a.y+(b.y-a.y)*u-356,410,466);}}
 const mesh=[],open=new Map();for(let y=0;y<rows;y++){const next=new Map();let x=0;while(x<cols){if(air[y*cols+x]){x++;continue;}const from=x;while(x<cols&&!air[y*cols+x])x++;const key=from+':'+x,prev=open.get(key);if(prev){prev.h+=cell;next.set(key,prev);}else{const o={id:'bed18_'+mesh.length,x:from*cell,y:y*cell,w:(x-from)*cell,h:cell,type:'bedrock18',oneWay:false,active:true,bed18:true};mesh.push(o);next.set(key,o);}}open.clear();for(const[k,v]of next)open.set(k,v);}
 Object.assign(n,{terrain:mesh,mask:air,cols,rows,cell,solidBins:new Map()});
 for(const s of mesh)for(let y=Math.floor(s.y/512);y<=Math.floor((s.y+s.h-.01)/512);y++)for(let x=Math.floor(s.x/512);x<=Math.floor((s.x+s.w-.01)/512);x++){const key=x+','+y;if(!n.solidBins.has(key))n.solidBins.set(key,[]);n.solidBins.get(key).push(s);}
};
const build=P.buildWorld;
P.buildWorld=function(){const z=this.tInit();Object.assign(z,{routes:[],docks:[],props:[],hazards:[],lifts:[],winds:[],bins:null,dynamics:[]});build.call(this);
 const oldLadders=this.ladders.length;
 // Only short, physically placed maintenance ladders remain, not full-height grid overlays.
 this.ladders=[];
 const basePlats=this.platforms.slice();
 for(const r of this.rooms){const seed=hash(r.id), floor=r.floorY, excluded=r.id==='n18_lab'||r.v16||r.id.startsWith('v16_');
  const industrial=['facility','shaft'].includes(r.kind)||['city','volcano'].includes(this.aTheme(r));
  if(industrial&&seed%5===0&&r.w>680){this.ladders.push({id:this.id(),x:r.x+r.w-144,y:floor-184,w:34,h:184,room:r.id,crafted213:true});this.addPlatform(r.x+r.w-245,floor-184,205,22,'balcony213',{room:r.id,oneWay:true});}
  if(excluded)continue;
  // Bridge the often-unreachable upper layers with a winding 100px-riser route.
  const high=basePlats.filter(s=>s.room===r.id&&s.oneWay&&s.y<floor-195&&s.y>r.y+40);
  const target=high.length?Math.max(r.y+110,Math.min(...high.map(s=>s.y))):floor-Math.min(330,r.h-150);
  if(!r.shelter){let index=0;for(let y=floor-100;y>=target-10;y-=104){const columns=Math.max(2,Math.floor((r.w-240)/190));const k=index%(columns*2-2),n=k<columns?k:columns*2-2-k;const x=r.x+90+n*170;this.addPlatform(x,y,178+(index%3===0?36:0),22,'shelf213',{room:r.id,oneWay:true,trail213:true,material213:seed%4?'rock':'bridge'});index++;}
   // An optional high route is a challenge, the lower route remains readable.
   const x=r.x+r.w*.57,y=floor-148;
   this.addPlatform(x-110,y,230,26,'relic213',{room:r.id,oneWay:true,trail213:true});
   if(seed%3===0){const p=this.addPlatform(r.x+r.w*.65,floor-258,185,24,'lift213',{room:r.id,oneWay:true,trail213:true})||this.platforms.at(-1);p.motion213={x:p.x,y:p.y,amp:74,axis:seed%2?'x':'y',period:5.4,phase:(seed%30)/10};z.lifts.push(p);}
   // Traps have a safe platform before and after. Never put one under the spawn.
   const hazardX=r.x+Math.min(r.w-145,Math.max(420,r.w*.73));
   if(r.w>750&&!r.boss19&&seed%4!==0)z.hazards.push({id:'hazard_'+r.id,room:r.id,type:['thorns','pendulum','vent'][seed%3],x:hazardX,y:this.fGroundY(r,hazardX,94),w:94,h:30,phase:(seed%37)*.13,cool:0});
  }
  for(const [x,kind]of [[r.x+66,'lantern'],[r.x+r.w-90,r.shelter?'lantern':'banner']])z.props.push({x,y:floor,kind,seed});
 }
 // Carve real shaft mouths through old solid floors, with one-way landing covers.
 for(const d of z.docks){const next=[];for(const s of this.platforms){if(s.room!==d.room||s.oneWay||Math.abs(s.y-d.y)>65||s.x>=d.x+d.width/2||s.x+s.w<=d.x-d.width/2){next.push(s);continue;}
  const left=d.x-d.width/2,right=d.x+d.width/2;if(s.x<left)next.push({...s,w:left-s.x,id:this.id()});if(s.x+s.w>right)next.push({...s,x:right,w:s.x+s.w-right,id:this.id()});}
  this.platforms=next;this.addPlatform(d.x-d.width/2,d.y,d.width,24,'shaftMouth213',{room:d.room,oneWay:true,trail213:true});}
 // Repair the one anomalous balcony/reward placement without erasing requirements.
 for(const n of this.fInit().nodes){const r=this.roomById.get(n.room);if(!r)continue;if(n.kind==='console'&&r.task19==='climb'){
  const y=n.y+n.h;this.addPlatform(n.x-60,y,190,22,'console213',{room:r.id,oneWay:true,trail213:true});
  const turns=Math.ceil((r.floorY-y)/95);for(let j=1;j<turns;j++)this.addPlatform(n.x-130+(j%2)*120,r.floorY-j*95,180,22,'shelf213',{room:r.id,oneWay:true,trail213:true});}}
 // Places between rooms have life and supplies; no instant room transitions.
 for(const route of z.routes){if(route.platforms.length<7)continue;const idx=Math.floor(route.platforms.length/2),p=route.platforms[idx],r=this.roomById.get(route.a);if(r?.shelter)continue;
  if(route.index%3===0&&!route.edge.gate){const e=this.spawnEnemy('charger',p.x+p.w*.5,p.y,{room:route.a,hp:160});if(e){e.trail213=route.index;e.range=320;e.homeX=cx(e);e.speed=Math.min(92,e.speed);}}
  if(route.index%4===1)this.x17.deposits.push({id:'trail_supply_'+route.index,room:route.a,x:p.x+p.w*.5-14,y:p.y-28,w:28,h:28,material:route.index%2?'fiber':'crystal',amount:2,trail213:true});
 }
 this.tReindex();z.stats={rooms:this.rooms.length,connections:z.routes.length,legacyGeneratedLadders:oldLadders,ladders:this.ladders.length,platforms:this.platforms.length,lifts:z.lifts.length,hazards:z.hazards.length,windColumns:z.winds.length,world:[C.WORLD_W,C.WORLD_H]};
 const p=this.player,r=this.roomById.get(this.currentRoomId)||this.roomById.get('r00');p.x=clamp(p.x,r.x+55,r.x+r.w-p.w-55);p.y=this.fGroundY(r,p.x,p.w)-p.h-2;p.vx=p.vy=0;z.safe={x:p.x,y:p.y,room:r.id};this.n18.lastSafe={...z.safe};p.checkpoint={...z.safe};this.updateCamera(1);
};
// Static spatial broadphase. Dynamic fields, gates and world-law bridges keep
// their existing collision filtering; every query still returns real objects.
P.tReindex=function(){const t=this.tInit();t.bins=new Map();t.dynamics=[];t.count=this.platforms.length;
 for(const s of this.platforms){if(s.motion213){t.dynamics.push(s);continue;}for(let y=Math.floor(s.y/512);y<=Math.floor((s.y+s.h)/512);y++)for(let x=Math.floor(s.x/512);x<=Math.floor((s.x+s.w)/512);x++){const k=x+','+y;if(!t.bins.has(k))t.bins.set(k,[]);t.bins.get(k).push(s);}}
};
P.tCandidates=function(b,margin=120){const t=this.tInit(),out=new Set(t.dynamics||[]);if(!t.bins)return this.platforms;for(let y=Math.floor((b.y-margin)/512);y<=Math.floor((b.y+b.h+margin)/512);y++)for(let x=Math.floor((b.x-margin)/512);x<=Math.floor((b.x+b.w+margin)/512);x++)for(const s of t.bins.get(x+','+y)||[])out.add(s);return [...out];};
const active=P.activePlatforms;P.activePlatforms=function(b=this.player){const t=this.tInit();if(!t.bins||this._tQuery)return active.call(this,b);if(t.count!==this.platforms.length)this.tReindex();const all=this.platforms;this._tQuery=true;this.platforms=this.tCandidates(b,300);let result;try{result=active.call(this,b);}finally{this.platforms=all;this._tQuery=false;}return result;};
const moving=P.updateMovingObjects;P.updateMovingObjects=function(dt){const p=this.player;for(const s of this.tInit().lifts){const m=s.motion213,x=s.x,y=s.y;const off=Math.sin(this.time*Math.PI*2/m.period+m.phase)*m.amp;s.x=m.x+(m.axis==='x'?off:0);s.y=m.y+(m.axis==='y'?off:0);
 if(p.onGround&&p.x+p.w>x+2&&p.x<x+s.w-2&&Math.abs(p.y+p.h-y)<7){p.x+=s.x-x;p.y+=s.y-y;}s.vx=s.vy=0;}moving.call(this,dt);};
const playerUpdate=P.updatePlayer;P.updatePlayer=function(dt){const p=this.player,t=this.tInit(),before={x:p.x,y:p.y,onGround:p.onGround,vy:p.vy};
 const wind=this.key('up')&&!p.attack?t.winds.find(w=>hit(p,w)):null;
 if(wind){p.vy=-355;p.airDashes=Math.max(1,p.airDashes);p.jumps=Math.min(p.jumps,1);p.wind213=true;}else p.wind213=false;
 playerUpdate.call(this,dt);if(wind&&p.vy> -310)p.vy=-355;
 if(p.onGround){if(!before.onGround&&before.vy>170)p.land213=this.time;const safe=!t.hazards.some(h=>Math.abs(cx(p)-(h.x+h.w/2))<h.w+45&&Math.abs(p.y+p.h-h.y)<90);
  if(safe&&!this.activePlatforms(p).some(s=>!s.oneWay&&hit(p,s))){t.safe={x:p.x,y:p.y,room:this.currentRoomId};}t.airtime=0;
 }else t.airtime+=dt;
 // Rescue is a disclosed safety net, not the normal navigation mechanic.
 if(t.safe&&!p.grapple&&!wind&&p.vy>0&&t.airtime>2.2&&p.y-t.safe.y>680){const near=this.activePlatforms({x:p.x-55,y:p.y,w:p.w+110,h:560}).some(s=>s.active!==false&&s.y>p.y+p.h&&s.y<p.y+560&&s.x<p.x+p.w+30&&s.x+s.w>p.x-30);
  if(!near)this.tRecover('落下保護：回到最近的安全落腳點');}
};
P.tRecover=function(message){const t=this.tInit(),p=this.player,q=t.safe||p.checkpoint;this.nDiscontinuity();Object.assign(p,{x:q.x,y:q.y,vx:0,vy:0,inv:1.3,onGround:false});p.hp=Math.max(1,p.hp-Math.ceil(p.maxHp*.04));t.airtime=0;t.rescues++;this.camera.x=clamp(cx(p)-this.viewW*.45,0,C.WORLD_W-this.viewW);this.camera.y=clamp(cy(p)-this.viewH*.56,0,C.WORLD_H-this.viewH);this.say(message+' · HP −4%',2.2);};
P.tHazardState=function(h){const phase=(this.time+h.phase)%4.6;return{phase,warning:phase>2.45&&phase<3.2,active:phase>=3.2&&phase<4.05,amount:phase>=3.2&&phase<4.05?Math.min(1,(phase-3.2)*10,(4.05-phase)*9):0};};
const update=P.update;P.update=function(dt,ts){update.call(this,dt,ts);if(this.modalM()||this.paused||!this.bootReady)return;const p=this.player;
 for(const h of this.tInit().hazards){if(Math.abs(h.x-p.x)>700||Math.abs(h.y-p.y)>550)continue;const state=this.tHazardState(h);let box;
  if(h.type==='pendulum'){const a=Math.sin(this.time*1.75+h.phase)*.78;box={x:h.x+Math.sin(a)*150-22,y:h.y-235+Math.cos(a)*180-22,w:44,h:44};}
  else if(state.active)box={x:h.x,y:h.y-(h.type==='vent'?130:38),w:h.w,h:h.type==='vent'?130:38};
  if(box&&hit(p,box)&&this.time>h.cool&&p.inv<=0){h.cool=this.time+.9;this.hurtPlayer(h.type==='pendulum'?14:10,cx(p)<h.x+h.w/2?-170:170,-200,h.type==='pendulum'?'遺跡擺錘':h.type==='vent'?'潮汐噴口':'晶簇地刺');}}
};
const travel=P.xTravel;P.xTravel=function(...args){const result=travel.apply(this,args);if(result){const t=this.tInit();t.safe={x:this.player.x,y:this.player.y,room:this.currentRoomId};t.airtime=0;t.animation.clear();}return result;};
})();
