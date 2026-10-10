/* 21.5.0 performance rework. Spatial collision query, static chunk cache,
 * cached painted NPCs, throttled DOM, exact viewport sizing, bounded fixed-step.
 * Gameplay fields/projectiles are NEVER deleted as a graphics optimisation.
 */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,cl=(x,a,b)=>Math.max(a,Math.min(b,x));
const seen=(o,b,m=160)=>o.x+(o.w||0)>b.x-m&&o.x<b.x+b.w+m&&o.y+(o.h||0)>b.y-m&&o.y<b.y+b.h+m;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const glows=new Map();window.ES214_GLOW=function(c,x,y,r,color,alpha=.25){if(r<=0||alpha<=0)return;let b=glows.get(color);if(!b){b=cv(96,96);const q=b.getContext('2d'),g=q.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,color);g.addColorStop(.3,color+'70');g.addColorStop(1,color+'00');q.fillStyle=g;q.fillRect(0,0,96,96);glows.set(color,b);}c.save();c.globalAlpha*=alpha;c.drawImage(b,x-r,y-r,r*2,r*2);c.restore();};
P.rInit214=function(){if(this.r214)return this.r214;let quality='balanced';try{quality=localStorage.getItem('es214_quality')||quality;}catch{}if(!['clear','balanced','save'].includes(quality))quality='balanced';this.perf214={quality,pixelRatioCap:1,slowFrames:0};return this.r214={quality,scale:1,acc:0,frame:0,simFrame:0,uiAt:-100,tiles:new Map(),tileVersion:null,structureBins:null,structureCount:0,solidsCache:new Map(),npcs:new Map(),background:new Map(),stats:[],autoAt:0,resizeAt:0,metrics:{simSteps:0,collisionQueries:0,collisionCandidates:0,tileBuilds:0}};};
P.resize=function(){const r=this.canvas.getBoundingClientRect(),perf=this.rInit214(),w=Math.max(1,r.width),h=Math.max(1,r.height),budget=perf.quality==='clear'?1900000:perf.quality==='save'?380000:820000;const d=Math.min(1,Math.sqrt(budget/(w*h)))*perf.scale;
 this.canvas.width=Math.max(1,Math.round(w*d));this.canvas.height=Math.max(1,Math.round(h*d));this.viewW=w;this.viewH=h;this.pixelRatio214=this.canvas.width/w;this.ctx.setTransform(this.pixelRatio214,0,0,this.canvas.height/h,0,0);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='low';perf.background.clear();};
P.rStructureBins214=function(){const s=this.nInit().structures,r=this.rInit214();if(r.structureCount===s.length&&r.structureBins)return r.structureBins;r.structureCount=s.length;const bins=r.structureBins=new Map();for(const o of s){for(let y=Math.floor((o.y-150)/512);y<=Math.floor((o.y+o.h+150)/512);y++)for(let x=Math.floor((o.x-80)/512);x<=Math.floor((o.x+o.w+80)/512);x++){const k=x+','+y;if(!bins.has(k))bins.set(k,[]);bins.get(k).push(o);}}return bins;};
// Consolidation of the old nine chained platform filters. Same layer/gate rules.
P.activePlatforms=function(body=this.player){const b={x:body.x,y:body.y,w:body.w||40,h:body.h||60},r=this.rInit214(),n=this.nInit(),t=this.tInit(),lay=body.v16Layer||this.vLayer(),margin=260,out=[],unique=new Set();
 if(!t.bins||t.count!==this.platforms.length)this.tReindex();const add=(s,layered=true)=>{if(((this._nMode||this.vInit().mode)==='decay'&&s.decayAfter18&&this.time-n.ruleAt>=s.decayAfter18)||s.active===false||s.room==='x17_rescue'||!seen(s,b,margin)||unique.has(s))return;if(layered&&s.v16Layer&&s.v16Layer!=='ALL'&&s.v16Layer!==lay)return;unique.add(s);out.push(s);};
 // Stable terrain candidates are cached only inside one simulation step.
 const x0=Math.floor((b.x-margin)/512),x1=Math.floor((b.x+b.w+margin)/512),y0=Math.floor((b.y-margin)/512),y1=Math.floor((b.y+b.h+margin)/512),key=[x0,x1,y0,y1].join(':');let base=r.solidsCache.get(key);
 if(!base){const set=new Set();for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){for(const o of t.bins.get(xx+','+yy)||[])set.add(o);}base=[...set];r.solidsCache.set(key,base);}
 for(const s of base)add(s);for(const s of t.dynamics||[])add(s);
 for(const f of this.fields||[])if(f.t>0&&['icePlatform','earthPillar','vinePillar','skillPlatform'].includes(f.type))add(f);
 for(const g of this.gates||[])if(!this.gateOpen(g)&&!(body===this.player&&body.phase>0&&g.gate==='shadow'))add(g);
 for(const g of this.masterGates||[])if(!this.progress.solved[g.relay])add(g);
 for(const m of this.vMaterialSolids(body))add(m,false);
 for(const g of this.xInit().gateSolids||[])if(!this.xState().gates[g.biome])add(g,false);
 for(const s of this.nTerrainAt(b,margin))add(s,false);
 const bins=this.rStructureBins214(),done=new Set();for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)for(const s of bins.get(xx+','+yy)||[]){if(done.has(s))continue;done.add(s);if(this.nStructureActive(s))add(s,false);}
 r.metrics.collisionQueries++;r.metrics.collisionCandidates+=out.length;return out;
};
P.rStatic214=function(tx,ty){const r=this.rInit214(),n=this.nInit(),th=this.aTheme(),mode=this.vLayer(),version=[this.platforms.length,n.cols,n.rows].join(':');if(r.tileVersion!==version||r.mask!==n.mask){r.tiles.clear();r.tileVersion=version;r.mask=n.mask;}
 const key=[tx,ty,th,mode,this.vInit().mode==='decay'?'decay':'solid'].join(':'),cache=r.tiles;if(cache.has(key)){const old=cache.get(key);cache.delete(key);cache.set(key,old);return old;}
 const size=512,pad=40,b=cv(size+pad*2,size+pad*2),c=b.getContext('2d'),x=tx*size,y=ty*size,box={x:x-pad,y:y-pad,w:size+pad*2,h:size+pad*2};c.translate(-box.x,-box.y);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='low';
 for(const s of this.nTerrainAt(box,0)){const xx=Math.max(s.x,box.x),yy=Math.max(s.y,box.y),w=Math.min(s.x+s.w,box.x+box.w)-xx,h=Math.min(s.y+s.h,box.y+box.h)-yy;if(w<=0||h<=0)continue;c.fillStyle=this.aPattern(c,th);c.fillRect(xx,yy,w,h);c.fillStyle='#0419269b';c.fillRect(xx,yy,w,h);}
 const cell=n.cell,x0=Math.max(1,Math.floor(box.x/cell)-1),x1=Math.min(n.cols-2,Math.ceil((box.x+box.w)/cell)+1),y0=Math.max(1,Math.floor(box.y/cell)-1),y1=Math.min(n.rows-2,Math.ceil((box.y+box.h)/cell)+1);
 for(let yy=y0;yy<=y1;yy++){let begin=null;for(let xx=x0;xx<=x1+1;xx++){const idx=yy*n.cols+xx,top=xx<=x1&&!n.mask[idx]&&n.mask[idx-n.cols];if(top&&begin===null)begin=xx;if(!top&&begin!==null){this.tRockLip(c,begin*cell,yy*cell,(xx-begin)*cell,'rock',th);begin=null;}}}
 for(const s of this.tCandidates(box,80)){if((this.vInit().mode==='decay'&&s.decayAfter18)||s.active===false||s.motion213||!seen(s,box,45)||s.v16Layer&&s.v16Layer!=='ALL'&&s.v16Layer!==mode)continue;const theme=s.room?this.aTheme(this.roomById.get(s.room)):th;if(s.h>36){c.fillStyle=this.aPattern(c,theme);c.fillRect(s.x,s.y,s.w,s.h);c.fillStyle='#051c326e';c.fillRect(s.x,s.y,s.w,s.h);}this.tRockLip(c,s.x,s.y,s.w,s.material213==='bridge'?'bridge':'rock',theme);}
 cache.set(key,b);r.metrics.tileBuilds++;while(cache.size>24)cache.delete(cache.keys().next().value);return b;};
P.drawPlatforms=function(c){const box={...this.camera,w:this.viewW,h:this.viewH},n=this.nInit();c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='low';const x0=Math.floor(box.x/512),x1=Math.floor((box.x+box.w)/512),y0=Math.floor(box.y/512),y1=Math.floor((box.y+box.h)/512);
 for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){const b=this.rStatic214(xx,yy);c.drawImage(b,40,40,512,512,xx*512,yy*512,512,512);}
 if(this.vInit().mode==='decay')for(const s of this.tCandidates(box,80)){if(!s.decayAfter18||s.active===false||this.time-n.ruleAt>=s.decayAfter18||!seen(s,box,45))continue;c.save();c.globalAlpha=Math.min(1,(s.decayAfter18-(this.time-n.ruleAt))/.4);this.tRockLip(c,s.x,s.y,s.w,'rock',this.aTheme());c.restore();}
 for(const s of this.tInit().dynamics){if(!seen(s,box,80)||s.active===false)continue;this.tRockLip(c,s.x,s.y,s.w,'bridge',this.aTheme());c.strokeStyle='#738f9e';c.lineWidth=1.5;for(const x of [s.x+22,s.x+s.w-22]){c.beginPath();c.moveTo(x,s.y-15);c.lineTo(x,s.motion213.y-146);c.stroke();}}
 for(const s of this.fields){const el={icePlatform:'ice',earthPillar:'earth',vinePillar:'nature',skillPlatform:'light'}[s.type];if(el&&s.t>0&&seen(s,box,80))this.tElementPlatform(c,s,el);}
 for(const l of this.ladders){if(!seen(l,box,20))continue;c.strokeStyle='#91a8b3';c.lineWidth=2;c.beginPath();c.moveTo(l.x,l.y);c.lineTo(l.x,l.y+l.h);c.moveTo(l.x+l.w,l.y);c.lineTo(l.x+l.w,l.y+l.h);for(let y=l.y+12;y<l.y+l.h;y+=23){c.moveTo(l.x,y);c.lineTo(l.x+l.w,y);}c.stroke();}
 for(const o of this.rings){if(!seen({x:o.x-14,y:o.y-14,w:28,h:28},box,20))continue;c.strokeStyle='#a3e8e8';c.lineWidth=1.3;c.beginPath();c.arc(o.x,o.y,o.r||13,0,Math.PI*2);c.stroke();c.fillStyle='#ddfffa';c.fillRect(o.x-2,o.y-2,4,4);}
 c.restore();this.nDrawStructures(c);this.tDrawTraversal(c);};
const panorama=P.aPanorama;
P.aPanorama=function(c,w,h,key,alpha=1){const r=this.rInit214(),k=[key,Math.round(w),Math.round(h)].join(':');let b=r.background.get(k);if(!b){b=cv(Math.ceil(w*.8),Math.ceil(h*.8));const q=b.getContext('2d');q.scale(.8,.8);panorama.call(this,q,w,h,key,1);r.background.set(k,b);while(r.background.size>3)r.background.delete(r.background.keys().next().value);}c.save();c.globalAlpha*=alpha;c.drawImage(b,0,0,w,h);c.restore();};
// NPCs keep painted animation, without rebuilding 3 cloth strip meshes per person per frame.
P.drawNPCs=function(c){const cls=['cartographer','alchemist','artificer','chrono','chef','warden'],box={...this.camera,w:this.viewW,h:this.viewH},r=this.rInit214();for(let i=0;i<this.npcs.length;i++){const n=this.npcs[i];if(!seen(n,box,100))continue;const id=cls[i%cls.length],phase=Math.floor((this.time%2)/2*8),key=id+':'+phase;let b=r.npcs.get(key);if(!b){b=cv(160,170);const q=b.getContext('2d'),p={x:60,y:85,w:40,h:60,classId:id,dir:1,vx:0,vy:0,onGround:true,id:'npc-cache-'+id};this.aActor(q,p);r.npcs.set(key,b);}c.save();c.translate(n.x+(n.w||40)/2,n.y+(n.h||60));c.scale(n.x<this.player.x?1:-1,1);c.globalAlpha*=.96;c.drawImage(b,-80,-146);c.restore();if(Math.abs(n.x-this.player.x)<190)this.vText(c,n.name,n.x+(n.w||40)/2,n.y-86,'#d3e6eb',11);}};
// nUpdateHUD is called from the combat tick independently of updateUI.
// Throttling only updateUI in 21.4 left this second full DOM pipeline at 60 Hz.
const hud=P.nUpdateHUD;P.nUpdateHUD=function(){const r=this.rInit214(),t=performance.now();if(t<(r.hudAt||0))return;r.hudAt=t+100;hud.call(this);};
const oldStructures=P.nDrawStructures;P.nDrawStructures=function(c){const n=this.nInit(),all=n.structures,box={...this.camera,w:this.viewW,h:this.viewH};n.structures=all.filter(o=>seen(o,box,210));try{return oldStructures.call(this,c);}finally{n.structures=all;}};
const masterHUD=P.updateMasterHUD;P.updateMasterHUD=function(){const now=performance.now();if(now<(this.masterHudAt215||0))return;this.masterHudAt215=now+100;return masterHUD.call(this);};
const updateUI=P.updateUI;P.updateUI=function(){const r=this.rInit214(),now=performance.now();if(now<r.uiAt)return;r.uiAt=now+100;updateUI.call(this);this.rUpdateIndicator214?.();};
const update=P.update;P.update=function(dt,ts){const r=this.rInit214();r.simFrame++;r.solidsCache.clear();r.metrics.simSteps++;return update.call(this,dt,ts);};
P.modalM=function(){const list=this.modalNodes215||(this.modalNodes215=[...document.querySelectorAll('.modal')]);return list.some(n=>!n.hidden);};
P.loop=function(ts){if(!this.bootReady||this.runtimeFault21)return;const r=this.rInit214();const wall=Math.max(0,(ts-this.last)/1000);let raw=Math.min(wall,.12);this.last=ts;const started=performance.now();let uMs=0,dMs=0;
 try{const u0=performance.now();if(this.paused||this.modalM()){r.acc=0;this.update(0,ts);this.input.end();}else{r.acc=Math.min(.10,r.acc+raw);let steps=0;while(r.acc>=1/60&&steps<3){let dt=1/60;if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-dt);dt*=.35;}this.update(dt,ts);this.input.end();r.acc-=1/60;steps++;if(this.paused||this.modalM()){r.acc=0;break;}}if(steps===3&&r.acc>1/30)r.acc=0;}
 uMs=performance.now()-u0;const d0=performance.now();this.render();dMs=performance.now()-d0;r.frame++;
 r.stats.push({frame:wall*1000,update:uMs,render:dMs,cpu:performance.now()-started});if(r.stats.length>360)r.stats.shift();
 if(!this.paused&&!this.modalM()&&ts-r.autoAt>2600&&r.stats.length>70&&r.quality==='balanced'){const arr=r.stats.slice(-90).map(v=>v.frame).sort((a,b)=>a-b),p75=arr[Math.floor(arr.length*.75)];if(p75>34&&r.scale>.68){r.scale=Math.max(.68,r.scale-.12);this.resize();r.autoAt=ts;}}
 this.frameHandle=requestAnimationFrame(t=>this.loop(t));}catch(error){this.runtimeFault21=error;this.input.end();window.ES21_DIAGNOSTICS?.fail(error);}};
// Slow scenery has its own composited canvas instead of a full-screen repaint
// under every action frame. Physics, attacks and the player still render each frame.
const background=P.drawBackground;
P.drawBackground=function(c,w,h){const r=this.rInit214();if(!r.bgLayer){const b=r.bgLayer=cv(this.canvas.width,this.canvas.height);b.id='scenery214';b.setAttribute('aria-hidden','true');this.canvas.before(b);r.bgAt=-1;}
 const b=r.bgLayer,now=performance.now(),key=[this.aTheme(),this.vInit().mode,this.canvas.width,this.canvas.height].join(':');
 if(r.bgKey!==key){b.width=this.canvas.width;b.height=this.canvas.height;r.bgKey=key;r.bgAt=-1;}
 if(now>=r.bgAt){const q=b.getContext('2d');q.setTransform(b.width/w,0,0,b.height/h,0,0);q.clearRect(0,0,w,h);background.call(this,q,w,h);r.bgAt=now+(r.quality==='save'?80:r.quality==='clear'?16:33);}
};
const fg=P.drawForeground;
P.drawForeground=function(c,w,h){const a=this.aInit(),low=a.low;a.low=true;try{fg.call(this,c,w,h);}finally{a.low=low;}const r=this.rInit214();if(r.quality==='save')return;
 c.save();c.globalAlpha=.30;c.fillStyle='#dcc2fa';for(let i=0;i<12;i++){const x=((i*197.47+this.time*(3+i%5)-this.camera.x*.045)%w+w)%w,y=((i*113.31-this.time*3-this.camera.y*.02)%h+h)%h;c.fillRect(x,y,i%4===0?2:1,i%4===0?2:1);}c.restore();};
P.rReport214=function(){const r=this.rInit214(),pick=k=>{const a=r.stats.map(v=>v[k]).sort((a,b)=>a-b);return {mean:a.reduce((s,v)=>s+v,0)/Math.max(1,a.length),p50:a[Math.floor(a.length*.5)]||0,p95:a[Math.floor(a.length*.95)]||0,max:a.at(-1)||0};};return {samples:r.stats.length,quality:r.quality,scale:this.pixelRatio214,internal:[this.canvas.width,this.canvas.height],frame:pick('frame'),update:pick('update'),render:pick('render'),cpu:pick('cpu'),metrics:{...r.metrics},tileCache:r.tiles.size,npcCache:r.npcs.size};};
P.rUpdateIndicator214=function(){const b=document.getElementById('perf214Toggle');if(!b)return;const r=this.rInit214();b.textContent='畫質 '+({clear:'清晰',balanced:'平衡',save:'省電'}[r.quality]);const fps=r.stats.length?Math.round(1000/(r.stats.slice(-30).reduce((s,x)=>s+x.frame,0)/Math.min(30,r.stats.length))):0;const n=document.getElementById('perf214Note');if(n)n.textContent=`V21.5.0 · ${fps} FPS · ${this.canvas.width}×${this.canvas.height}`;};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);const r=this.rInit214();document.body.classList.add('stable214');const b=document.createElement('button');b.id='perf214Toggle';b.type='button';b.textContent='畫質 平衡';b.title='循環：平衡／省電／清晰；只改美術負載，不刪除技能效果或碰撞';b.onclick=()=>{const q=['balanced','save','clear'];r.quality=q[(q.indexOf(r.quality)+1)%3];this.perf214.quality=r.quality;this.aInit().low=r.quality==='save';r.scale=1;r.autoAt=performance.now();try{localStorage.setItem('es214_quality',r.quality);}catch{}this.resize();this.rUpdateIndicator214();};document.querySelector('#brand21')?.append(b);const n=document.createElement('div');n.id='perf214Note';document.querySelector('.game-frame')?.append(n);
 this.modalNodes215=null;const release=()=>{this.input.held.clear();this.input.pressed.clear();this.input.released.clear();r.acc=0;this.last=performance.now();};addEventListener('blur',release);document.addEventListener('visibilitychange',release);
 document.querySelector('#helpPanel .help-grid')?.insertAdjacentHTML('afterbegin','<article><h3>V21.5.0 · 動作與效能重製</h3><p>側視骨架固定大腿、小腿、上臂與前臂長度；手腳採用連續紋理變形，膝肘頂點相連；步幅隨位移，揮擊對齊傷害時刻。左上「畫質」可切換平衡／省電／清晰；省電不刪除傷害、平台或敵人。</p></article>');};
})();
