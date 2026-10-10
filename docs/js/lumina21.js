/*
 * V21 / LUMINA — reference-derived painted art + continuous articulated animation.
 * This module owns presentation only. Existing V19/V20 collision, AI, damage,
 * five-slot loadouts, all 15 professions, world laws and save schema are retained.
 * Animation is continuous joint/cloth interpolation, NOT a claim of hand-drawn 60fps.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,A=ES21_ART,TAU=Math.PI*2;
const $=q=>document.querySelector(q),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,uri=p=>window.ES9_ASSET_URIS?.[p]||p;
const visible=(g,o,m=140)=>o.x+(o.w||0)>g.camera.x-m&&o.x<g.camera.x+g.viewW+m&&o.y+(o.h||0)>g.camera.y-m&&o.y<g.camera.y+g.viewH+m;
const rgb=(hex,alpha)=>{const n=parseInt((hex||'#b79cff').slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${alpha})`;};
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function glow(ctx,x,y,r,col,alpha=.25){if(window.ES214_GLOW){window.ES214_GLOW(ctx,x,y,r,col,alpha);return;}ctx.save();const gr=ctx.createRadialGradient(x,y,0,x,y,Math.max(1,r));gr.addColorStop(0,rgb(col,alpha));gr.addColorStop(.32,rgb(col,alpha*.48));gr.addColorStop(1,rgb(col,0));ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
function star(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x+r*.14,y-r*.1,x+r,y);ctx.quadraticCurveTo(x+r*.15,y+r*.1,x,y+r);ctx.quadraticCurveTo(x-r*.1,y+r*.12,x-r,y);ctx.quadraticCurveTo(x-r*.1,y-r*.1,x,y-r);ctx.fill();}
P.lInit=function(){return this.l21||(this.l21={version:21,animations:new Map(),patterns:new Map(),events:[],impacts:[],deaths:[],hudAt:0,theme:'coast',lastTheme:'coast',themeAt:0,gallery:'jobs',selected:'dreamweaver',time:0,drawn:0,frameSamples:[],frameAt:performance.now()});};
const load=P.loadAssets;P.loadAssets=function(){const result=load.call(this);const files=[];
 for(const th of Object.keys(A.scenes)){files.push(['scene_'+th,'webp'],['thumb_'+th,'webp'],['stone_'+th,'png'],['edge_'+th,'png'],['flora_'+th,'png']);}
 for(const id of Object.keys(A.jobs))for(const type of ['rig','stand','portrait','weapon'])files.push([type+'_'+id,'png']);
 for(const id of ['crab','jelly','golem','bird','boss'])files.push(['monster_'+id,'png'],['attack_'+id,'png']);
 for(let i=0;i<5;i++)files.push(['skill_'+i,'png']);
 for(const id of ['arrow','bloom','crescent','impact','mist','ice','water','bolt','star'])files.push(['fx_'+id,'png']);
 for(const [key,ext] of files){const im=new Image();im.decoding='async';im.src=uri('assets/art21/'+key+'.'+ext);result['l21_'+key]=im;}
 return result;
};
const defaults=P.defaultProgress;P.defaultProgress=function(){const p=defaults.call(this);p.classId='dreamweaver';return p;};
// The upper scenic plane and lower character plane are independently lit.
P.aPanorama=function(ctx,w,h,key,opacity=1){const im=this.assets['l21_scene_'+key]||this.assets.l21_scene_coast;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha=opacity;
 ctx.fillStyle='#173d58';ctx.fillRect(0,0,w,h);
 if(im?.naturalWidth){const scale=Math.max(w/im.width,h/im.height)*1.12,iw=im.width*scale,ih=im.height*scale;
  const xx=(w-iw)*.5-Math.sin(this.camera.x*.00020)*(iw-w)*.4,yy=(h-ih)*.34-Math.sin(this.camera.y*.00011)*14;ctx.drawImage(im,xx,yy,iw,ih);
  if(['coast','sky','ocean','forest'].includes(key)&&!this.aInit().low){
   ctx.globalCompositeOperation='screen';const flow=this.time;
   const locations=key==='coast'?[[.20,.28,.44],[.273,.44,.41],[.85,.54,.43]]:[[.29,.16,.55],[.66,.43,.38]];
   for(const [u,v,hh]of locations){const x=xx+iw*u,y=yy+ih*v,dh=ih*hh;const g=ctx.createLinearGradient(0,y,0,y+dh);g.addColorStop(0,'#adf1ff00');g.addColorStop(.22,'#a9eeff16');g.addColorStop(.85,'#d5fcff0b');g.addColorStop(1,'#9bdbff00');ctx.fillStyle=g;ctx.fillRect(x-5,y,10,dh);
    for(let j=0;j<10;j++){const yy2=y+((j*63+flow*95)%Math.max(1,dh));ctx.fillStyle=`rgba(206,247,255,${.04+(j%3)*.018})`;ctx.fillRect(x+Math.sin(j*6)*3,yy2,1,24+j%4*9);}
   }ctx.globalCompositeOperation='source-over';
  }
 }
 const fog=ctx.createLinearGradient(0,h*.5,0,h);fog.addColorStop(0,'#0a234600');fog.addColorStop(1,'#071a385e');ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);ctx.restore();
};
P.drawBackground=function(ctx,w,h){const l=this.lInit(),th=this.aTheme();if(th!==l.theme){l.lastTheme=l.theme;l.theme=th;l.themeAt=this.time;}
 const trans=clamp((this.time-l.themeAt)/1.2,0,1);this.aPanorama(ctx,w,h,trans<1?l.lastTheme:th,1);if(trans<1)this.aPanorama(ctx,w,h,th,ease(trans));
 if(!this.aInit().low){ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<3;i++){const x=w*(.47+i*.18)+Math.sin(this.time*.08+i)*35;const g=ctx.createLinearGradient(x,0,x-w*.15,h);g.addColorStop(0,'#b5e9ff10');g.addColorStop(1,'#a6cfff00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-24,0);ctx.lineTo(x+24,0);ctx.lineTo(x-w*.27+95,h);ctx.lineTo(x-w*.27-95,h);ctx.fill();}ctx.restore();}
 const mode=this.vInit().mode;if(mode!=='now'){ctx.save();ctx.fillStyle=({past:'#f4bd7130',future:'#2bd9ed1a',inner:'#5f179838',decay:'#bbbb8817',heavy:'#270e421c',elastic:'#23ada80d',cold:'#65cded15'})[mode]||'#08072416';ctx.fillRect(0,0,w,h);ctx.restore();}
};
P.aPattern=function(ctx,theme){
 const l=this.lInit(),im=this.assets['l21_stone_'+theme],fallback='#173041';
 if(!im||!im.complete||!im.naturalWidth||!im.naturalHeight)return fallback;
 if(!l.patternContexts)l.patternContexts=new WeakMap();
 let cache=l.patternContexts.get(ctx);if(!cache){cache=new Map();l.patternContexts.set(ctx,cache);}
 let pat=cache.get(theme);
 if(!pat){pat=ctx.createPattern(im,'repeat');if(!pat)return fallback;
  if(typeof pat.setTransform==='function'&&typeof DOMMatrix!=='undefined')pat.setTransform(new DOMMatrix().scale(.72));cache.set(theme,pat);}
 return pat;
};
P.aEdge=function(ctx,x,y,w,theme,decor=true){const im=this.assets['l21_edge_'+theme];ctx.save();ctx.imageSmoothingEnabled=true;ctx.beginPath();ctx.rect(x,y-(decor?42:2),w,124);ctx.clip();ctx.fillStyle='#8aada1';ctx.fillRect(x,y,w,2);if(im?.naturalWidth){const tw=384,sc=tw/im.width,off=Math.floor(x/tw)*tw;for(let xx=off;xx<x+w;xx+=tw)ctx.drawImage(im,xx,y-76*sc,tw,im.height*sc);}ctx.restore();};
P.drawRooms=function(ctx){ctx.save();ctx.imageSmoothingEnabled=true;
 // Recessed arches belong behind players; no opaque columns across the action.
 for(const r of this.rooms){if(!r.shelter||!visible(this,r,70))continue;const top=r.floorY-350;ctx.save();ctx.globalAlpha=.38;ctx.strokeStyle='#89b9bd';ctx.lineWidth=4;
  for(let x=r.x+80;x<r.x+r.w-100;x+=250){ctx.beginPath();ctx.moveTo(x,top+346);ctx.lineTo(x,top+92);ctx.bezierCurveTo(x,top+15,x+218,top+15,x+218,top+92);ctx.lineTo(x+218,top+346);ctx.stroke();}
  ctx.restore();
  for(let x=r.x+180;x<r.x+r.w-80;x+=310){ctx.strokeStyle='#738b99';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,top+64);ctx.lineTo(x,top+130);ctx.stroke();glow(ctx,x,top+134,90,'#f8dbad',.15);ctx.fillStyle='#ffe2aa';ctx.fillRect(x-3,top+127,6,12);}
 }
 ctx.restore();
};
const platforms=P.drawPlatforms;P.drawPlatforms=function(ctx){ctx.imageSmoothingEnabled=true;platforms.call(this,ctx);};
// Suppress heavy ladder decoration without removing any climbable object.
const sourcePlatform=P.drawPlatforms;
P.drawPlatforms=function(ctx){const ladders=this.ladders;this.ladders=[];try{sourcePlatform.call(this,ctx);}finally{this.ladders=ladders;}
 ctx.save();for(const l of ladders){if(!visible(this,l,20))continue;const mid=cx(l),y0=Math.max(l.y,this.camera.y-30),y1=Math.min(l.y+l.h,this.camera.y+this.viewH+30);ctx.strokeStyle='#67a9bc85';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(mid-10,y0);ctx.lineTo(mid-10,y1);ctx.moveTo(mid+10,y0);ctx.lineTo(mid+10,y1);ctx.stroke();ctx.strokeStyle='#8ad8df8a';ctx.lineWidth=2;ctx.beginPath();for(let y=l.y+Math.max(0,Math.floor((y0-l.y)/22))*22;y<y1;y+=22){ctx.moveTo(mid-10,y);ctx.lineTo(mid+10,y);}ctx.stroke();}ctx.restore();
};
const camera=P.updateCamera;P.updateCamera=function(dt){camera.call(this,dt);if(this.xState().uiMode!=='mobile'){const target=clamp(cy(this.player)-this.viewH*.61+clamp(this.player.vy*.055,-35,55),0,Math.max(0,C.WORLD_H-this.viewH));this.camera.y=lerp(this.camera.y,target,1-Math.exp(-12*dt));}};

/* Continuous cutout animation: each limb is transformed around actual joints.
 * Inverse kinematics prevents skating feet and exposed gaps at knees/elbows.
 */
const sourceJoints={armBack:[[57,72],[48,95]],foreBack:[[48,95],[36,118]],armFront:[[86,74],[96,96]],foreFront:[[96,96],[107,109]],thighBack:[[60,129],[52,157]],shinBack:[[52,157],[37,190]],footBack:[[37,190],[35,206]],thighFront:[[82,129],[81,157]],shinFront:[[81,157],[81,192]],footFront:[[81,192],[85,206]]};
function ik(a,b,L1,L2,bend){let dx=b[0]-a[0],dy=b[1]-a[1],dist=Math.hypot(dx,dy);dist=clamp(dist,Math.abs(L1-L2)+.01,L1+L2-.01);const ang=Math.atan2(dy,dx),off=Math.acos(clamp((L1*L1+dist*dist-L2*L2)/(2*L1*dist),-1,1))*bend;return [a[0]+Math.cos(ang+off)*L1,a[1]+Math.sin(ang+off)*L1];}
function rigPiece(ctx,im,name,from,to,alpha=1){const idx=A.parts.indexOf(name);if(idx<0)return;ctx.save();ctx.globalAlpha*=alpha;
 if(from&&to){const [a,b]=from,[u,v]=to,ori=Math.atan2(b[1]-a[1],b[0]-a[0]),angle=Math.atan2(v[1]-u[1],v[0]-u[0]),len=Math.hypot(v[0]-u[0],v[1]-u[1])/Math.hypot(b[0]-a[0],b[1]-a[1]);ctx.translate(u[0],u[1]);ctx.rotate(angle-ori);ctx.scale(len,len);ctx.translate(-a[0],-a[1]);}
 ctx.drawImage(im,(idx%4)*149,Math.floor(idx/4)*215,149,215,0,0,149,215);ctx.restore();}
function cloth(ctx,im,name,t,amp,lean){const idx=A.parts.indexOf(name),sx=idx%4*149,sy=Math.floor(idx/4)*215;ctx.save();for(let y=32;y<215;y+=7){const k=clamp((y-50)/150,0,1),off=Math.sin(t*3.7-y*.023)*amp*k*k+lean*k;const hh=Math.min(8,215-y);ctx.drawImage(im,sx,sy+y,149,hh,off,y,149,hh+.35);}ctx.restore();}
P.aActor=function(ctx,p,opacity=1,remote=false){const id=A.jobs[p.classId]?p.classId:'dreamweaver',im=this.assets['l21_rig_'+id];if(!im?.naturalWidth)return;
 const l=this.lInit(),key=p===this.player?'player':p.id?'npc'+p.id:null,t=this.time,job=A.jobs[id];let st=key?l.animations.get(key):null;
 if(!st){st={run:0,air:0,dash:0,attack:0,cast:0,last:t,phase:0};if(key)l.animations.set(key,st);}
 const dt=clamp(t-st.last,0,.05),blend=1-Math.exp(-20*dt);st.last=t;st.run=lerp(st.run,clamp(Math.abs(p.vx||0)/290,0,1),blend);st.air=lerp(st.air,p.onGround?0:1,blend);st.dash=lerp(st.dash,p.dashT>0?1:0,blend);
 const attack=p.attack?.def,at=attack?clamp((p.attack.elapsed||0)/Math.max(.01,attack.dur),0,1):0;
 st.attack=lerp(st.attack,attack?1:0,blend);st.cast=lerp(st.cast,p.castT>0||p===this.player&&Object.keys(this.nInit().holds).length?1:0,blend);
 st.phase+=dt*(.65+Math.abs(p.vx||0)*.0058);const ph=st.phase*TAU,breathe=Math.sin(t*2.6)*1.0,bob=st.run*Math.abs(Math.sin(ph))*2.4+breathe;
 const action=attack?Math.sin(ease(clamp((at-.06)/.68,0,1))*Math.PI):st.attack*.13;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha*=opacity;
 ctx.translate(cx(p),p.y+p.h+2);ctx.scale((p.dir||1)*.68,.68);ctx.translate(-74,-207);
 const lean=st.run*.10+st.dash*.23+(p.hurtT>0?-.18:0)+action*.08;ctx.translate(74,132);ctx.rotate(lean);ctx.translate(-74,-132);
 cloth(ctx,im,'capeBack',t,3+st.run*8,-st.run*8-st.dash*18);cloth(ctx,im,'capeFront',t+.9,3+st.run*8,-st.run*10-st.dash*12);
 const feet=[];
 for(let side=0;side<2;side++){const q=ph+side*Math.PI,baseX=side?83:38;const foot=[lerp(baseX,70+Math.sin(q)*29,st.run),205-Math.max(0,Math.cos(q))*22*st.run];foot[0]+=st.air*(side?12:-12)+st.dash*(side?-4:-21);foot[1]-=st.air*(side?18:29)+st.dash*12;feet.push(foot);}
 for(let side=0;side<2;side++){const suf=side?'Front':'Back',hip=[side?82:60,129-bob],foot=feet[side],ankle=[foot[0]-2,foot[1]-14],knee=ik(hip,ankle,32,37,side?-.7:1);
  rigPiece(ctx,im,'thigh'+suf,sourceJoints['thigh'+suf],[hip,knee]);rigPiece(ctx,im,'shin'+suf,sourceJoints['shin'+suf],[knee,ankle]);rigPiece(ctx,im,'foot'+suf,sourceJoints['foot'+suf],[ankle,foot]);}
 const shoulderBack=[57,72-bob],shoulderFront=[86,74-bob];
 const swing=Math.sin(ph)*18*st.run,handBack=[36-swing*.4,118+swing*.22],handFront=[107+swing*.5,109-swing*.2];
 handFront[0]=lerp(handFront[0],attack?.shape19==='lift'?102:130,Math.max(action,st.cast));handFront[1]=lerp(handFront[1],attack?.shape19==='lift'?37:79,Math.max(action,st.cast));handBack[0]-=action*12;
 const elbowBack=ik(shoulderBack,handBack,25,28,1),elbowFront=ik(shoulderFront,handFront,25,27,-1);
 rigPiece(ctx,im,'armBack',sourceJoints.armBack,[shoulderBack,elbowBack]);rigPiece(ctx,im,'foreBack',sourceJoints.foreBack,[elbowBack,handBack]);
 ctx.save();ctx.translate(0,-bob);rigPiece(ctx,im,'torso');cloth(ctx,im,'hair',t,1.5+st.run*3,-st.run*3);ctx.translate(74,55);ctx.rotate(-lean*.45+Math.sin(t*2.1)*.009);ctx.translate(-74,-55);rigPiece(ctx,im,'head');ctx.restore();
 rigPiece(ctx,im,'armFront',sourceJoints.armFront,[shoulderFront,elbowFront]);rigPiece(ctx,im,'foreFront',sourceJoints.foreFront,[elbowFront,handFront]);
 const weapon=this.assets['l21_weapon_'+id];if(weapon?.naturalWidth){ctx.save();ctx.translate(handFront[0],handFront[1]);const ranged=['rifle','gun','wrench','flask','puppet','fist','pan'].includes(job.gear);ctx.rotate((ranged?-.05:.35)-st.run*.18+(ranged?-.09:1.2)*action-st.cast*.20);ctx.scale(.29,.29);ctx.drawImage(weapon,-96,-240);ctx.restore();}
 if(st.cast>.08){ctx.save();ctx.globalAlpha*=st.cast;glow(ctx,handFront[0]+5,handFront[1]-3,42,job.color,.3);star(ctx,handFront[0]+8,handFront[1]-3,5+Math.sin(t*6), '#e8ddff');ctx.restore();}
 ctx.restore();
};
P.drawPlayer=function(ctx,p,remote=false){const col=A.jobs[p.classId]?.color||'#be9afa';ctx.save();ctx.fillStyle='#06132375';ctx.beginPath();ctx.ellipse(cx(p),p.y+p.h+4,p.onGround?25:15,p.onGround?5:3,0,0,TAU);ctx.fill();
 if(!remote)for(const a of this.afterimages.slice(-6)){if(a.t>0&&a.classId===p.classId){ctx.save();ctx.filter='hue-rotate(35deg) brightness(1.7)';this.aActor(ctx,{...p,...a,attack:null,castT:0,hurtT:0},clamp(a.t/a.max,0,1)*.18,true);ctx.restore();}}
 if(p.classId==='beast'&&p===this.player){const form=p.kingT>0?'boss':p.form==='eagle'?'bird':p.form==='wolf'?'golem':'crab';this.lDrawMonster(ctx,{...p,species17:'shape_'+form,dir:p.dir},form,cx(p),p.y+p.h,p.kingT>0?152:108,.95);}
 else this.aActor(ctx,p,p.inv>0?.83:1,remote);
 if(p.shield>0){ctx.save();ctx.strokeStyle=rgb(col,.65);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx(p),cy(p)-22,42,67,0,-1.4,4.5);ctx.stroke();ctx.restore();}
 if(p.grapple){ctx.strokeStyle='#b1f2f0';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(cx(p),cy(p));ctx.quadraticCurveTo(cx(p)+40,cy(p)-20,p.grapple.x,p.grapple.y);ctx.stroke();}
 if(p===this.player&&!remote){this.vText(ctx,C.CLASSES[p.classId]?.name||'',cx(p),p.y-89,col,12);}
 ctx.restore();};
P.drawNPCs=function(ctx){const ids=['cartographer','alchemist','artificer','chrono','chef','warden'];let i=0;for(const n of this.npcs){const cls=ids[i++%ids.length];if(!visible(this,n,90))continue;this.aActor(ctx,{...n,classId:cls,dir:n.x<this.player.x?1:-1,vx:0,vy:0,onGround:true},.96,true);if(Math.abs(cx(n)-cx(this.player))<220)this.vText(ctx,n.name,cx(n),n.y-86,'#d3e6eb',11);}};

// Morphologically distinct families, all skinned with the same painted atlas.
P.lMonsterFamily=function(e){const sh=this.aShape(e.species17||e.type||'golem');if(e.xBoss||e.type==='sentinel')return'boss';if(['bird','owl','insect','moth'].includes(sh))return'bird';if(['jelly','mushroom','fungus','ghost','wisp','shade'].includes(sh))return'jelly';if(['golem','robot','knight','beast'].includes(sh))return'golem';if(['snake','eel','worm','fish','ray'].includes(sh))return'jelly';return'crab';};
P.lDrawMonster=function(ctx,e,family,x,y,h,opacity=1){const im=this.assets['l21_monster_'+family];if(!im?.naturalWidth)return;const t=this.time+(Number(e.id)||0)*.71,shape=this.aShape(e.species17||e.type),moving=clamp(Math.abs(e.vx||0)/100,0,1),dw=h*im.width/im.height;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalAlpha*=opacity;ctx.translate(x,y);ctx.scale(e.dir||1,1);
 const hit=clamp(e.hitFlash||0,0,1),wind=e.fWindup>0||e.telegraph?1:0;ctx.rotate(hit?Math.sin(t*31)*.025:0);ctx.translate(-wind*2*Math.sin(t*18),0);
 if(['fish','ray','snake','eel','worm'].includes(shape)&&!e.xBoss){
  // Segmented ribbon bodies follow phase-shifted joints instead of hopping frames.
  const n=['snake','eel','worm'].includes(shape)?7:3;for(let k=n-1;k>=0;k--){ctx.save();ctx.translate((k-(n-1)*.5)*h*.22,Math.sin(t*3-k*.75)*h*.09-h*.36);ctx.rotate(Math.sin(t*3-k*.6)*.08);const ww=h*(k===0?.66:.46),hh=h*(k===0?.65:.46);ctx.drawImage(im,im.width*.18,im.height*.02,im.width*.66,im.height*.46,-ww/2,-hh/2,ww,hh);ctx.restore();}
  glow(ctx,h*.32,-h*.4,9,'#addfff',.8);
 }else{
  const bounce=family==='bird'||family==='jelly'?Math.sin(t*2.5)*4:Math.abs(Math.sin(t*7))*moving*2;
  const strips=family==='bird'?28:family==='jelly'?32:24;
  for(let k=0;k<strips;k++){const sy=k*im.height/strips,sh=im.height/strips,weight=k/(strips-1);let ox=0,oy=0,sx=1;
   if(family==='jelly'){ox=Math.sin(t*3-weight*4)*weight*6; sx=1+Math.sin(t*2.4)*.025*(1-weight);}
   else if(family==='bird'){ox=Math.sin(t*5.5-weight*3)*4*(1-weight);oy=Math.sin(t*5.5)*6*(1-weight);sx=1+Math.sin(t*5.5)*.1*(1-weight);}
   else{ox=Math.sin(t*(3+moving*5)+k*1.5)*moving*1.5*weight;oy=Math.sin(t*2.6)*.7*(1-weight);}
   ctx.drawImage(im,0,sy,im.width,Math.min(sh+1,im.height-sy),-dw*sx/2+ox,-h+weight*h*(strips-1)/strips-bounce+oy,dw*sx,h/strips+1.1);
  }
 }
 const ec=family==='golem'?'#74dfff':'#ed8cfa';if(!this.aInit().low)glow(ctx,dw*.07,-h*.41,25,ec,.16+Math.sin(t*3)*.04);
 if(hit>.01){ctx.globalCompositeOperation='screen';ctx.globalAlpha*=Math.min(.5,hit*2);ctx.drawImage(im,-dw/2,-h,dw,h);}
 ctx.restore();};
P.fDrawCreature=function(ctx,s,e,x,y,w,h){this.lDrawMonster(ctx,e,this.lMonsterFamily(e),x+w/2,y+h,Math.max(66,h*1.3));};
P.drawEnemies=function(ctx){for(const e of this.enemies){if(e.dead||e.hidden&&!e.hitFlash||!visible(this,e,160))continue;ctx.save();ctx.globalAlpha=this.vCanHit(e)?1:.3;const fam=this.lMonsterFamily(e),h=Math.max(69,e.h*(e.xBoss?1.33:1.4));ctx.fillStyle='#05142877';ctx.beginPath();ctx.ellipse(cx(e),e.y+e.h+3,e.w*.58,5,0,0,TAU);ctx.fill();this.lDrawMonster(ctx,e,fam,cx(e),e.y+e.h+2,h);
  const bw=e.xBoss?155:Math.max(49,e.w*.85),by=e.y+e.h-h-18;ctx.fillStyle='#071526e8';ctx.fillRect(cx(e)-bw/2-2,by-2,bw+4,8);ctx.fillStyle='#723548';ctx.fillRect(cx(e)-bw/2,by,bw,4);ctx.fillStyle=e.xBoss?'#e983c4':'#f06483';ctx.fillRect(cx(e)-bw/2,by,bw*clamp(e.hp/e.maxHp,0,1),4);
  if(e.xBoss){this.vText(ctx,e.name||ES19.species[e.species17]?.name||'遺跡領域王',cx(e),by-12,'#f2d2ae',12);ctx.fillStyle='#8edbff';ctx.fillRect(cx(e)-bw/2,by+8,bw*clamp((e.break||0)/(e.breakMax||200),0,1),2);}
  if(e.fWindup>0||e.telegraph){const tr=e.fWindup||e.telegraph?.t||0;this.vText(ctx,'◇ 蓄勢 '+(tr>0?tr.toFixed(1)+'s':''),cx(e),by-17,'#ffdca2',11);}
  if(e.sleep17>this.time)this.vText(ctx,'z Z',cx(e),by-13,'#e8c0ff',16);
  ctx.restore();}
};
P.fCreaturePortrait=function(canvas,id){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const g=c.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#1b2d48');g.addColorStop(1,'#061926');c.fillStyle=g;c.fillRect(0,0,canvas.width,canvas.height);const sp=ES19.species[id]||ES17.species[id]||{};this.lDrawMonster(c,{id:0,species17:id,xBoss:sp.boss,dir:1},sp.boss?'boss':this.lMonsterFamily({species17:id}),canvas.width/2,canvas.height-7,canvas.height*.75);};

// Parametric magic geometry: a luminous core, secondary orbit, debris and dissipation.
P.lRune=function(ctx,x,y,r,color,phase=0,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=1.2;
 for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,0,r*(.27+j*.16),r,phase*.17+j*Math.PI/3,0,TAU);ctx.stroke();}
 ctx.beginPath();ctx.arc(0,0,r*.72,-phase*.3,-phase*.3+TAU*.85);ctx.stroke();for(let i=0;i<8;i++){const a=i*TAU/8+phase*.25;star(ctx,Math.cos(a)*r*.84,Math.sin(a)*r*.84,3.4,color);}ctx.restore();};
P.lMissile=function(ctx,s,color,hostile=false){if(!visible(this,s,160))return;const x=cx(s),y=cy(s),angle=Math.atan2(s.vy||0,s.vx||1),speed=Math.hypot(s.vx||0,s.vy||0),t=this.time;ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(x,y);ctx.rotate(angle);ctx.globalCompositeOperation='screen';
 const size=hostile?28:clamp((s.w||18)*2.5,46,94),tail=Math.min(170,speed*.2+size);const g=ctx.createLinearGradient(-tail,0,16,0);g.addColorStop(0,rgb(color,0));g.addColorStop(.8,rgb(color,.42));g.addColorStop(1,'#e9eaff');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-tail,-2);ctx.quadraticCurveTo(-size*.4,-8,16,0);ctx.quadraticCurveTo(-size*.4,8,-tail,2);ctx.fill();
 ctx.strokeStyle=color;ctx.lineWidth=hostile?1.2:1.7;for(let j=0;j<2;j++){ctx.beginPath();for(let i=0;i<=12;i++){const xx=-tail+i*tail/12,yy=Math.sin(i*.8-t*7+j*Math.PI)*(hostile?3:7)*(i/12);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}
 const im=this.assets['l21_fx_'+(s.element==='ice'?'ice':s.element==='water'?'water':s.element==='lightning'?'bolt':'arrow')];if(im?.naturalWidth){ctx.globalAlpha=hostile?.7:.95;ctx.drawImage(im,-size*.6,-size*.26,size,size*.52);}star(ctx,4,0,hostile?5:8,'#f4e9ff');
 for(let i=0;i<4;i++){const xx=-12-i*21-(t*55)%21;star(ctx,xx,Math.sin(i*2.4+t*4)*9,1.5,color);}ctx.restore();};
const projectiles=P.drawProjectiles;P.drawProjectiles=function(ctx){const e=this.elementShots,s=this.skillShots,b=this.enemyShots;
 // Retain special warning markers, replace only flying old square/circle sprites.
 this.elementShots=[];this.skillShots=[];this.enemyShots=b.filter(q=>q.type==='bombMarker'||q.warmup>0);try{projectiles.call(this,ctx);}finally{this.elementShots=e;this.skillShots=s;this.enemyShots=b;}
 for(const q of [...e,...s,...b.filter(q=>q.type!=='bombMarker'&&!(q.warmup>0))]){const col=C.ELEMENTS.find(el=>el.id===q.element)?.color||q.color||'#bf90fa';this.lMissile(ctx,q,col,b.includes(q));if(q.anchor){this.lRune(ctx,cx(q),cy(q),24,col,this.time,.65);this.vText(ctx,'↔ 換位',cx(q),q.y-27,col,10);}}
};
const damage=P.damageEnemy;P.damageEnemy=function(e,...args){const before=e.hp,dead=e.dead;const result=damage.call(this,e,...args);if(e.hp<before&&!dead){const l=this.lInit();l.impacts.push({x:cx(e),y:cy(e),start:this.time,color:args[3]?.element?C.ELEMENTS.find(el=>el.id===args[3].element)?.color||'#d6a5ff':'#d6a5ff',seed:(e.id||0)%31,big:!!args[3]?.big});if(e.dead)l.deaths.push({e:{...e},start:this.time});}return result;};
const runSkill=P.nRunSkill;P.nRunSkill=function(s,c){const result=runSkill.call(this,s,c);const l=this.lInit();l.events.push({x:cx(this.player),y:cy(this.player)-18,dir:this.player.dir,start:this.time,op:s.op18,color:A.jobs[this.player.classId]?.color||'#c9a2fa',charged:!!c.charged,aim:{...(c.aim||{x:this.player.dir,y:0})}});return result;};
const effects=P.drawEffects;P.drawEffects=function(ctx){effects.call(this,ctx);ctx.imageSmoothingEnabled=true;const l=this.lInit(),t=this.time,sw=this.fInit().swing;
 if(sw&&sw.until>t){const k=1-clamp((sw.until-t)/.22,0,1),p=this.player,col=A.jobs[p.classId]?.color||'#c2a3ff';ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.sin(k*Math.PI)*.84;ctx.translate(cx(p),cy(p)-10);ctx.scale(sw.dir||1,1);
  if(['thrust','flurry','double'].includes(sw.shape)){for(let j=0;j<(sw.shape==='flurry'?3:1);j++){const yy=(j-1)*11;const g=ctx.createLinearGradient(0,yy,sw.w,yy);g.addColorStop(0,rgb(col,0));g.addColorStop(.72,rgb(col,.45));g.addColorStop(1,'#ffe8ff');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,yy-5);ctx.lineTo(sw.w,yy);ctx.lineTo(0,yy+5);ctx.fill();}}
  else{const r=sw.w*.7;ctx.rotate(-.5+k*.5);ctx.strokeStyle=col;ctx.lineWidth=8*(1-k)+1;ctx.beginPath();ctx.ellipse(r*.2,0,r,sw.h*.6+20,0,-1.8,.95);ctx.stroke();ctx.strokeStyle='#f8eaff';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(r*.2+4,0,r-3,sw.h*.6+18,0,-1.75,.85);ctx.stroke();for(let i=0;i<10;i++){const a=-1.7+i*.26;star(ctx,Math.cos(a)*r+r*.2,Math.sin(a)*(sw.h*.6+24),2+i%3,col);}}
  ctx.restore();}
 l.events=l.events.filter(e=>t-e.start<.8);for(const e of l.events){const age=t-e.start,fade=Math.min(1,age*12)*clamp(1-age/.8,0,1),r=36+age*20;ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,e.x+e.dir*40,e.y,80,e.color,.16*fade);this.lRune(ctx,e.x+e.dir*42,e.y,r,e.color,t,fade*.7);ctx.restore();}
 l.impacts=l.impacts.filter(e=>t-e.start<.55);for(const e of l.impacts){if(!visible(this,{...e,w:0,h:0},200))continue;const age=t-e.start,progress=age/.55,fade=1-progress;ctx.save();ctx.globalAlpha=fade;ctx.globalCompositeOperation='screen';glow(ctx,e.x,e.y,55,e.color,.38*fade);star(ctx,e.x,e.y,20*fade+5,'#fff1ff');ctx.strokeStyle=e.color;ctx.lineWidth=1.3;for(let j=0;j<9;j++){const a=j*TAU/9+e.seed,r=12+Math.pow(progress,.65)*(e.big?78:48),xx=e.x+Math.cos(a)*r,yy=e.y+Math.sin(a)*r+progress*progress*28;ctx.beginPath();ctx.moveTo(xx-Math.cos(a)*8*fade,yy-Math.sin(a)*8*fade);ctx.lineTo(xx,yy);ctx.stroke();star(ctx,xx,yy,2*fade,'#e1bbff');}ctx.restore();}
 l.deaths=l.deaths.filter(e=>t-e.start<.95);for(const d of l.deaths){const age=t-d.start,fade=1-age/.95,e=d.e;ctx.save();ctx.globalAlpha=fade*.7;ctx.translate(cx(e),e.y+e.h);ctx.rotate((e.dir||1)*age*.3);this.lDrawMonster(ctx,e,this.lMonsterFamily(e),0,age*14,Math.max(69,e.h*1.4)*(.93-age*.14),1);ctx.restore();for(let i=0;i<8;i++){ctx.save();ctx.globalAlpha=fade;star(ctx,cx(e)+Math.sin(i*9)*age*70,e.y+e.h*.5-age*60-i*4,3,'#c79bff');ctx.restore();}}
};
P.drawForeground=function(ctx,w,h){const l=this.lInit(),low=this.aInit().low,t=this.time;ctx.save();ctx.imageSmoothingEnabled=true;
 if(!low){const vign=ctx.createRadialGradient(w*.5,h*.5,h*.32,w*.5,h*.5,w*.72);vign.addColorStop(0,'#030e1c00');vign.addColorStop(.65,'#02152304');vign.addColorStop(1,'#020b229c');ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='screen';const snow=['snow','sky'].includes(this.aTheme());for(let i=0;i<(snow?34:24);i++){const x=((i*197.47+t*(3+i%5)-this.camera.x*.045)%w+w)%w,y=((i*113.31+t*(snow?11:-3)-this.camera.y*.02)%h+h)%h;const alpha=.15+Math.sin(t*1.1+i)*.1;ctx.globalAlpha=alpha;star(ctx,x,y,i%4===0?3:1.5,snow?'#cdefff':'#d9afff');}
  for(const s of this.elementShots.slice(-5)){if(visible(this,s,10))glow(ctx,cx(s)-this.camera.x,cy(s)-this.camera.y,110,C.ELEMENTS.find(e=>e.id===s.element)?.color||'#9ccaff',.09);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 }
 // Small corner accents never cover actors or HUD text.
 ctx.strokeStyle='#76dbe578';ctx.lineWidth=1;for(const [x,y,dx,dy]of[[10,10,1,1],[w-10,10,-1,1],[10,h-10,1,-1],[w-10,h-10,-1,-1]]){ctx.beginPath();ctx.moveTo(x+30*dx,y);ctx.lineTo(x+9*dx,y);ctx.lineTo(x,y+9*dy);ctx.lineTo(x,y+30*dy);ctx.stroke();}ctx.restore();
};

// Map art is laid out from live room coordinates. No reference-map pin masquerades as a live location.
P.renderMap=function(){const cv=$('#worldMapCanvas');if(!cv||!this.assets)return;const c=cv.getContext('2d'),f=this.fInit(),state=this.fState(),tr=this.fMapTransform(cv),{w,h,s,ox,oy}=tr,pt=(x,y)=>({x:ox+x*s,y:oy+y*s});c.clearRect(0,0,w,h);c.fillStyle='#041a27';c.fillRect(0,0,w,h);c.imageSmoothingEnabled=true;
 c.save();c.beginPath();c.rect(4,4,w-8,h-8);c.clip();c.strokeStyle='#4c829316';c.lineWidth=1;c.beginPath();for(let x=0;x<w;x+=45){c.moveTo(x,0);c.lineTo(x,h);}for(let y=0;y<h;y+=45){c.moveTo(0,y);c.lineTo(w,y);}c.stroke();
 const groups=new Map();for(const r of this.rooms){const key=(r.biome19||r.biome||r.region)+'_'+Math.floor(r.x/11500)+'_'+Math.floor(r.y/11000);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 for(const rs of groups.values()){const has=rs.some(r=>this.progress.discovered[r.id]||state.surveyed[r.id]);if(state.atlasFog&&!has)continue;const x0=Math.min(...rs.map(r=>r.x))-250,y0=Math.min(...rs.map(r=>r.y))-700,x1=Math.max(...rs.map(r=>r.x+r.w))+250,y1=Math.max(...rs.map(r=>r.y+r.h))+500;const pp=pt(x0,y0),ww=(x1-x0)*s,hh=(y1-y0)*s;if(pp.x+ww<0||pp.y+hh<0||pp.x>w||pp.y>h)continue;const theme=this.aTheme(rs[0]),im=this.assets['l21_scene_'+theme];
  c.save();c.beginPath();c.moveTo(pp.x+ww*.1,pp.y+hh*.23);c.lineTo(pp.x+ww*.18,pp.y+hh*.05);c.lineTo(pp.x+ww*.31,pp.y+hh*.12);c.lineTo(pp.x+ww*.43,pp.y);c.lineTo(pp.x+ww*.56,pp.y+hh*.09);c.lineTo(pp.x+ww*.73,pp.y+hh*.03);c.lineTo(pp.x+ww*.91,pp.y+hh*.19);c.lineTo(pp.x+ww,pp.y+hh*.47);c.lineTo(pp.x+ww*.92,pp.y+hh*.7);c.lineTo(pp.x+ww*.82,pp.y+hh*.9);c.lineTo(pp.x+ww*.62,pp.y+hh*.85);c.lineTo(pp.x+ww*.54,pp.y+hh);c.lineTo(pp.x+ww*.42,pp.y+hh*.92);c.lineTo(pp.x+ww*.27,pp.y+hh*.96);c.lineTo(pp.x+ww*.19,pp.y+hh*.78);c.lineTo(pp.x,pp.y+hh*.67);c.closePath();c.clip();c.globalAlpha=has?.59:.30;if(im?.naturalWidth)c.drawImage(im,pp.x,pp.y,ww,hh);const gr=c.createLinearGradient(0,pp.y,0,pp.y+hh);gr.addColorStop(0,'#051b2a05');gr.addColorStop(.65,'#041b2a20');gr.addColorStop(1,'#031b2acb');c.fillStyle=gr;c.globalAlpha=1;c.fillRect(pp.x,pp.y,ww,hh);c.restore();
 }
 const route=state.target?this.fRoute(state.target):[],segments=new Set(route.slice(1).map((id,i)=>[id,route[i]].sort().join('|')));
 for(const co of this.nInit().corridors){const known=this.progress.discovered[co.a]||this.progress.discovered[co.b]||state.surveyed[co.a]||state.surveyed[co.b],onroute=segments.has([co.a,co.b].sort().join('|'));if(state.atlasFog&&!known&&!onroute)continue;c.beginPath();co.points.forEach((v,i)=>i?c.lineTo(ox+v.x*s,oy+v.y*s):c.moveTo(ox+v.x*s,oy+v.y*s));c.lineJoin='round';c.strokeStyle='#032432';c.lineWidth=onroute?6:3.8;c.stroke();c.strokeStyle=onroute?'#ffe1a0':co.edge.gate?'#d3a0f7':known?'#d2ffff':'#9cd4e2c9';c.lineWidth=onroute?3:known?2:1.4;c.stroke();}
 const labels=[];for(const r of this.rooms){const known=!!this.progress.discovered[r.id],intel=state.surveyed[r.id];if(state.atlasFog&&!known&&!intel)continue;const pp=pt(cx(r),cy(r)),rw=r.w*s,rh=r.h*s;if(pp.x<-80||pp.x>w+80||pp.y<-80||pp.y>h+80)continue;
  if(f.map.zoom>=4){c.strokeStyle=known?'#a5edf5':'#568b9a';c.lineWidth=1;c.fillStyle=known?'#4d9faf24':'#0b293142';c.fillRect(ox+r.x*s,oy+r.y*s,rw,rh);c.strokeRect(ox+r.x*s,oy+r.y*s,rw,rh);for(const pl of this.platforms){if(pl.room===r.id){c.fillStyle=known?'#a0d7cf':'#67888c';c.fillRect(ox+pl.x*s,oy+pl.y*s,Math.max(1,pl.w*s),Math.max(1,pl.h*s));}}}
  c.save();c.translate(pp.x,pp.y);if(r.shelter){c.strokeStyle=known?'#b5f8ff':'#8ec6cf';c.lineWidth=1.3;c.strokeRect(-3,-4,6,7);c.fillStyle=known?'#c5ffff':'#5e949f';c.fillRect(-5,5,10,2);}else if(r.boss19){c.fillStyle='#e9a0b8';c.beginPath();c.arc(0,0,3.5,0,TAU);c.fill();}else{c.fillStyle=known?'#b8f9ec':'#93bbce';c.fillRect(-1.5,-1.5,3,3);}if(r.id===f.map.selected){c.strokeStyle='#fce5aa';c.lineWidth=1.5;c.strokeRect(-8,-8,16,16);}c.restore();
  if(f.map.zoom>=5||r.shelter&&r.frontier19)labels.push({x:pp.x,y:pp.y-19,name:f.map.zoom>=5?r.name:ES19.biomes[r.biome19]?.name||r.name});}
 c.font='600 12px system-ui';c.textAlign='center';const used=[];for(const q of labels){const bw=c.measureText(q.name).width+10,b={x:q.x-bw/2,y:q.y-14,w:bw,h:19};if(q.x<30||q.x>w-30||q.y<35||q.y>h-35||used.some(a=>b.x<a.x+a.w&&b.x+b.w>a.x&&b.y<a.y+a.h&&b.y+b.h>a.y))continue;used.push(b);c.fillStyle='#062030dd';c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='#d5f0f4';c.fillText(q.name,q.x,q.y);}
 const actual=pt(cx(this.player),cy(this.player)),pin={x:clamp(actual.x,27,w-27),y:clamp(actual.y,55,h-35)},off=pin.x!==actual.x||pin.y!==actual.y;glow(c,pin.x,pin.y,34,'#ffdd95',.65);c.strokeStyle='#ffe4a5';c.lineWidth=2;c.beginPath();c.arc(pin.x,pin.y,17,0,TAU);c.stroke();star(c,pin.x,pin.y,11,'#fff7d0');c.font='bold 14px system-ui';c.textAlign='center';c.fillStyle='#ffe7a7';c.fillText(off?'位置在視窗外 · 定位我':'你在這裡',clamp(pin.x,70,w-70),pin.y-30);f.mapPin={world:{x:cx(this.player),y:cy(this.player)},actual,pin,off};c.restore();
 const count=this.rooms.filter(r=>this.progress.discovered[r.id]).length;$('#mapStats').textContent=`探索 ${(count/this.rooms.length*100).toFixed(1)}%  ·  ${count} / ${this.rooms.length}`;if($('#atlasZoom19'))$('#atlasZoom19').textContent=f.map.zoom.toFixed(1)+'×';if($('#atlasPosition19'))$('#atlasPosition19').textContent=`⌖ ${this.roomById.get(this.currentRoomId)?.name||''}　X ${Math.round(cx(this.player))} · Y ${Math.round(cy(this.player))}`;
 c.fillStyle='#94b8c8';c.font='11px system-ui';c.textAlign='left';c.fillText('真實座標路線 ／ 拖曳、滾輪縮放 ／ 青：步道　紫：能力門　金：導航目標',18,h-15);
};
const detail=P.fMapDetail;P.fMapDetail=function(){detail.call(this);const r=this.roomById.get(this.fInit().map.selected||this.currentRoomId),im=$('#atlasDetail19 .atlas-art20 img');if(im&&r)im.src=uri('assets/art21/thumb_'+this.aTheme(r)+'.webp');};

// High-contrast playable HUD: five real slots, actual health and no fabricated MP.
P.lDecorate=function(){const ids=this.mLoadout(),catalog=ES18.skills[this.player.classId]||[];
 $('#skillBar')?.querySelectorAll('[data-slot17]').forEach((b,i)=>{const sk=ES10_MASTER.skills[ids[i]];if(!sk)return;
 const found=catalog.findIndex(x=>x.id===sk.id),index=(found<0?i:found)%5;
 if(b.dataset.art21!==sk.id){b.style.setProperty('--icon21',`url("${uri('assets/art21/skill_'+index+'.png')}")`);b.dataset.art21=sk.id;}});
};
const bar=P.renderSkillBar;P.renderSkillBar=function(){bar.call(this);this.lDecorate();};
const mastery=P.renderMastery;P.renderMastery=function(){mastery.call(this);const iconIndices=[0,1,2,3,4];$('#skillLibrary')?.querySelectorAll('.ability-sigil18').forEach((el,i)=>{el.innerHTML=`<img src="${uri('assets/art21/skill_'+iconIndices[i%5]+'.png')}" alt="" class="skill-art21">`;});$('#loadoutM')?.querySelectorAll('.ability-sigil18').forEach((el,i)=>el.innerHTML=`<img src="${uri('assets/art21/skill_'+i%5+'.png')}" alt="" class="skill-art21">`);const d=$('#masterDetail .ability-sigil18');if(d)d.innerHTML=`<img src="${uri('assets/art21/skill_'+(Number(this.masterSelection)||0)%5+'.png')}" alt="" class="skill-art21">`;};
const hud=P.nUpdateHUD;P.nUpdateHUD=function(){hud.call(this);const l=this.lInit(),portrait=$('#portrait20');if(portrait){const src='assets/art21/portrait_'+this.player.classId+'.png';if(portrait.dataset.art21!==src){portrait.src=uri(src);portrait.dataset.art21=src;}}if(this.time<l.hudAt)return;l.hudAt=this.time+.12;
 const r=this.roomById.get(this.currentRoomId),count=this.rooms.filter(q=>this.progress.discovered[q.id]).length;$('#l21exploration')?.replaceChildren(document.createTextNode(`探索 ${(count/this.rooms.length*100).toFixed(1)}%`));$('#l21location')?.replaceChildren(document.createTextNode((r?.name||'旅途')+' · '+(r?.shelter?'歸燈前哨':'自由探索')));
 const enemy=this.enemies.filter(e=>!e.dead&&Math.hypot(cx(e)-cx(this.player),cy(e)-cy(this.player))<550).sort((a,b)=>Math.abs(cx(a)-cx(this.player))-Math.abs(cx(b)-cx(this.player)))[0];const panel=$('#enemyCard21');if(panel){panel.hidden=!enemy;if(enemy){$('#enemyName21').textContent=enemy.name||C.ENEMIES[enemy.type]?.name||'遺跡生物';$('#enemyHP21').textContent=`${Math.ceil(enemy.hp)} / ${enemy.maxHp}`;$('#enemyDesc21').textContent=(ES19.species[enemy.species17]?.counter||C.ENEMIES[enemy.type]?.tip||'觀察前搖，再尋找出手時機。').slice(0,58);const im=$('#enemyImage21'),src='assets/art21/monster_'+this.lMonsterFamily(enemy)+'.png';if(im.dataset.src!==src){im.src=uri(src);im.dataset.src=src;}}}
 $('#shield20')?.replaceChildren(document.createTextNode('護盾 '+Math.round(this.player.shield||0)+'  ·  技能僅使用冷卻'));
 this.lDecorate();};
// Live art inspection is separate from exploration and never unlocks map progress.
P.lOpenGallery=function(){this.closeModalsM();$('#atelier21').hidden=false;this.nCancelHolds();this.lRenderGallery();};
P.lRenderGallery=function(){const l=this.lInit(),body=$('#atelierBody21'),tab=l.gallery;$('#atelierTabs21').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const ids=tab==='jobs'?Object.keys(A.jobs):tab==='monsters'?['crab','jelly','golem','bird','boss']:Object.keys(A.scenes);
 if(!ids.includes(l.selected))l.selected=ids[0];const names={crab:'珊甲蟹卒',jelly:'浮菇靈巫',golem:'遺跡哨衛獸',bird:'暗影迅鴉',boss:'深淵珊瑚君主',coast:'潮聲斷崖',forest:'綠蔭山谷',fungi:'古代真菌紀',ocean:'海底遺都',desert:'金沙荒漠',snow:'極寒雪原',volcano:'紅燼火山',city:'中央城區',shadow:'崩壞邊界',sky:'天空回廊',cave:'幽谷遺跡',crystal:'琉晶洞窟'};
 body.innerHTML=`<div class="atelier-list21">${ids.map(id=>`<button data-item="${id}" class="${l.selected===id?'active':''}"><img src="${uri('assets/art21/'+(tab==='jobs'?'stand_':tab==='monsters'?'monster_':'thumb_')+id+(tab==='scenes'?'.webp':'.png'))}" alt=""><span>${tab==='jobs'?C.CLASSES[id].name:names[id]}</span></button>`).join('')}</div><section class="atelier-stage21"><canvas id="atelierCanvas21" width="850" height="500"></canvas><div class="atelier-caption21"><small>V21.5 · 連續骨架即時渲染</small><h3>${tab==='jobs'?C.CLASSES[l.selected].name:names[l.selected]}</h3><p>${tab==='jobs'?ES18.jobs[l.selected].desc:tab==='monsters'?'待機呼吸、移動重心與肢體擺動。戰鬥中另有蓄勢、受擊與消散。':'本地場景美術、緩動視差、霧氣與動態光效。此處只預覽，不改變探索進度。'}</p>${tab==='jobs'?'<div class="atelier-controls21"><button data-pose="idle">待機</button><button data-pose="walk">步行</button><button data-pose="run">跑步</button><button data-pose="dash">衝刺</button><button data-pose="fall">下落</button><button data-pose="jump">跳躍</button><button data-pose="attack">揮擊</button><button data-pose="cast">施法</button><button id="adoptJob21">採用此職業</button></div>':''}</div></section>`;
 body.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{l.selected=b.dataset.item;this.lRenderGallery();});body.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{l.pose=b.dataset.pose;});$('#adoptJob21')?.addEventListener('click',()=>{this.changeClass(l.selected);$('#atelier21').hidden=true;this.say('已切換：'+C.CLASSES[l.selected].name,2);});};
P.lDrawGallery=function(){const cv=$('#atelierCanvas21'),l=this.lInit();if(!cv||$('#atelier21').hidden)return;const ctx=cv.getContext('2d'),w=cv.width,h=cv.height,t=performance.now()/1000,oldTime=this.time,cam=this.camera;this.time=t;this.camera={x:t*100,y:200};try{
 this.aPanorama(ctx,w,h,l.gallery==='scenes'?l.selected:'coast',1);const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#08152718');g.addColorStop(1,'#031222aa');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 if(l.gallery==='jobs'){ctx.save();ctx.translate(195,97);ctx.scale(2.3,2.3);const pose=l.pose||'idle',p={id:90001,classId:l.selected,x:80,y:95,w:40,h:60,dir:1,onGround:!['jump','fall'].includes(pose),vx:pose==='run'?320:pose==='walk'?110:0,vy:pose==='jump'?-240:pose==='fall'?420:0,dashT:pose==='dash'?.2:0,castT:pose==='cast'?1:0,attack:pose==='attack'?{elapsed:t%.7,def:{dur:.7,shape19:'slash'}}:null};this.aActor(ctx,p,1,true);ctx.restore();}
 else if(l.gallery==='monsters'){this.lDrawMonster(ctx,{id:90002,species17:l.selected,dir:1,vx:45},l.selected,w/2,h*.89,l.selected==='boss'?300:248);}
 ctx.strokeStyle='#82dcec77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(60,h-43);ctx.lineTo(w-60,h-43);ctx.stroke();
 }finally{this.time=oldTime;this.camera=cam;}};
const render=P.render;P.render=function(...args){const l=this.lInit();render.apply(this,args);this.lDrawGallery();const now=performance.now();l.frameSamples.push(now-l.frameAt);if(l.frameSamples.length>120)l.frameSamples.shift();l.frameAt=now;l.drawn++;};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);this.lInit();document.body.classList.add('lumina21');C.VERSION='21.0.0-lumina';document.title='澄界 V21｜光織紀 · LIVING ATLAS';
 $('.game-frame').insertAdjacentHTML('beforeend',`<div id="brand21"><span class="brand-orbit21">◌</span><div><b>澄界</b><span>L I V I N G  A T L A S</span></div><small>V21<br>光織紀</small></div><div id="l21worldline">「不同的法則，同一個世界。」</div><div id="l21bottom"><span>探索 · 連結 · 生存 · 進化</span><span id="l21location"></span><b id="l21exploration"></b></div><aside id="enemyCard21" hidden><img id="enemyImage21" alt="附近生物"><div><small>生態觀測 / NEARBY</small><h3 id="enemyName21"></h3><span id="enemyHP21"></span><p id="enemyDesc21"></p></div></aside><div id="controls21"><kbd>← →</kbd> 移動　<kbd>Space</kbd> 跳躍　<kbd>Shift</kbd> 衝刺　<kbd>Z / X</kbd> 連段</div>`);
 $('.top-actions').insertAdjacentHTML('beforeend','<button id="atelierButton21">造型圖鑑</button>');$('#atelierButton21').onclick=()=>this.lOpenGallery();
 document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="atelier21" hidden><section class="panel atelier-panel21"><button class="close" id="atelierClose21" aria-label="關閉造型圖鑑">×</button><header><small>V21 · LUMINA / ART ATELIER</small><h2>光織圖鑑</h2><p>直接檢視遊戲正在使用的角色、動作、怪物與環境。</p></header><nav id="atelierTabs21"><button data-tab="jobs" class="active">十五職業</button><button data-tab="monsters">生物原型</button><button data-tab="scenes">十二生境</button></nav><div id="atelierBody21"></div></section></div>`);
 $('#atelierClose21').onclick=()=>{$('#atelier21').hidden=true;};$('#atelierTabs21').querySelectorAll('button').forEach(b=>b.onclick=()=>{this.l21.gallery=b.dataset.tab;this.lRenderGallery();});
 $('#mapButton').textContent='M 地圖';$('#expeditionButton').textContent='O 背包';$('#masteryButton').textContent='L 技能';$('#menu20').textContent='Esc 選單';$('#helpButton').textContent='H 操作';$('#artQuality20').textContent='畫質';
 $('.map-head h2').textContent='澄界 · 有機互聯世界圖';$('.map-head p').textContent='連續世界 · 實際步道 · 探索進度即時更新';$('.atlas-edition20').innerHTML='EXPLORATION INTERFACE<br>V21 / LUMINA ATLAS';
 $('#a20worldstamp').hidden=true;$('#helpPanel h2').textContent='V21 光織紀 · 操作說明';$('#helpPanel .help-grid').insertAdjacentHTML('afterbegin','<article><h3>V21 光織圖鑑</h3><p>右上「造型圖鑑」可檢視十五職業的連續骨架動作、生物和十二生境。角色採用分層美術、關節運動與衣料擺動；動作即時插值，隨速度與施法平順銜接。光影可由選單中的畫質按鈕切換。玩法、數字鍵元素、五格技能與舊存檔格式保持相容。</p></article>');
 document.addEventListener('keydown',e=>{if(e.code==='Escape'){if(!$('#atelier21').hidden){$('#atelier21').hidden=true;e.preventDefault();return;}if(!this.modalM()){document.body.classList.toggle('menu-open20');$('#menu20').setAttribute('aria-expanded',String(document.body.classList.contains('menu-open20')));}}});
 const m=this.modalM.bind(this);this.modalM=()=>!$('#atelier21').hidden||m();
 const close=this.closeModalsM.bind(this);this.closeModalsM=(...args)=>{$('#atelier21').hidden=true;return close(...args);};
 this.lDecorate();this.nUpdateHUD();this.renderMap();
};
})();
