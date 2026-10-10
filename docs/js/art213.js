/* Living Atlas 21.3: rendered traversal props/traps and reference-derived
   elemental residues. Timings, radii and platforms use real gameplay objects. */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const colors={fire:'#ff9c87',ice:'#8de5ff',lightning:'#c9a2ff',wind:'#a2f0e4',earth:'#e6c38e',water:'#77d8fa',light:'#ffe1a0',shadow:'#c598ff',nature:'#a5e4bc',gravity:'#e2adff'};
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2;
const view=(g,o,m=100)=>o.x+(o.w||0)>g.camera.x-m&&o.x<g.camera.x+g.viewW+m&&o.y+(o.h||0)>g.camera.y-m&&o.y<g.camera.y+g.viewH+m;
const rgb=(col,a)=>{const n=parseInt(col.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
function glow(c,x,y,r,col,a=.25){if(window.ES214_GLOW){window.ES214_GLOW(c,x,y,r,col,a);return;}if(r<=0)return;c.save();const q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,rgb(col,a));q.addColorStop(.28,rgb(col,a*.43));q.addColorStop(1,rgb(col,0));c.fillStyle=q;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function spark(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x+1,y-1,x+r,y);c.quadraticCurveTo(x+1,y+1,x,y+r);c.quadraticCurveTo(x-1,y+1,x-r,y);c.quadraticCurveTo(x-1,y-1,x,y-r);c.fill();}
const load=P.loadAssets;P.loadAssets=function(){const a=load.call(this);for(const name of ['hanging_platform','moss_ledge','banner','crystal_spikes','relic_stone','residue_lightning','residue_ice','residue_light','residue_shadow','residue_water','residue_swap','coast_sky','world_concept']){const im=new Image();im.decoding='async';const path='assets/art213/'+name+(['coast_sky','world_concept'].includes(name)?'.webp':'.png');im.src=window.ES9_ASSET_URIS?.[path]||path;a['t213_'+name]=im;}return a;};
// Physical platforms now have an uneven, painted rock lip, not a repeated fern fence.
P.tRockLip=function(c,x,y,w,kind='rock',theme=this.aTheme()){
 const hanging=kind==='bridge',im=this.assets[hanging?'t213_hanging_platform':'t213_moss_ledge'];
 if(!im?.naturalWidth)return;c.save();c.imageSmoothingEnabled=true;
 const filters={snow:'saturate(.35) brightness(1.35)',volcano:'sepia(.35) hue-rotate(320deg)',desert:'sepia(.48) saturate(.8)',ocean:'hue-rotate(15deg)',void:'hue-rotate(12deg) saturate(.8)'};if(filters[theme])c.filter=filters[theme];
 if(!hanging&&w>350){
  const bottom=64+Math.sin(x*.007)*16;c.save();c.beginPath();c.moveTo(x,y+1);c.lineTo(x+w,y+1);c.lineTo(x+w,y+bottom*.7);for(let k=Math.ceil(w/65);k>=0;k--)c.lineTo(x+Math.min(w,k*65),y+bottom+Math.sin(k*8+x)*13);c.closePath();c.clip();c.fillStyle=this.aPattern(c,theme);c.fillRect(x,y,w,bottom+25);const g=c.createLinearGradient(0,y,0,y+bottom+25);g.addColorStop(0,'#152e4320');g.addColorStop(1,'#02162fbb');c.fillStyle=g;c.fillRect(x,y,w,bottom+25);c.restore();
  const n=Math.ceil(w/185),sw=w/n;for(let k=0;k<n;k++){c.save();c.translate(x+k*sw,y);if(k%2){c.translate(sw,0);c.scale(-1,1);}c.drawImage(im,0,im.height*.09,im.width,im.height*.48,-1,-13,sw+2,43);c.restore();}c.restore();return;
 }
 const max=hanging?210:245,n=Math.max(1,Math.ceil(w/max)),ww=w/n;
 for(let k=0;k<n;k++){const xx=x+k*ww,hh=hanging?72:Math.min(85,ww*.39);c.drawImage(im,xx-1,y-(hanging?29:hh*.27),ww+2,hh);}
 c.filter='none';c.fillStyle=hanging?'#b6bbc0':'#acbda0';c.globalAlpha=.68;c.fillRect(x+2,y,w-4,1);c.restore();
};
P.drawPlatforms=function(c){const n=this.nInit(),th=this.aTheme(),cam={...this.camera,w:this.viewW,h:this.viewH};c.save();c.imageSmoothingEnabled=true;
 // Less contrast on solid subterranean rock; the ledges, actors and hazards stay dominant.
 c.fillStyle=this.aPattern(c,th);for(const s of this.nTerrainAt(cam,50)){const x=Math.max(s.x,cam.x-35),y=Math.max(s.y,cam.y-35),w=Math.min(s.x+s.w,cam.x+cam.w+35)-x,h=Math.min(s.y+s.h,cam.y+cam.h+35)-y;if(w<=0||h<=0)continue;c.fillRect(x,y,w,h);c.fillStyle='#0419269b';c.fillRect(x,y,w,h);c.fillStyle=this.aPattern(c,th);}
 const cell=n.cell,x0=Math.max(1,Math.floor(cam.x/cell)-1),x1=Math.min(n.cols-2,Math.ceil((cam.x+cam.w)/cell)+1),y0=Math.max(1,Math.floor(cam.y/cell)-1),y1=Math.min(n.rows-2,Math.ceil((cam.y+cam.h)/cell)+1);
 for(let y=y0;y<=y1;y++){let begin=null;for(let x=x0;x<=x1+1;x++){const idx=y*n.cols+x,top=x<=x1&&!n.mask[idx]&&n.mask[idx-n.cols];if(top&&begin===null)begin=x;if(!top&&begin!==null){this.tRockLip(c,begin*cell,y*cell,(x-begin)*cell,'rock',th);begin=null;}}}
 for(const s of this.activePlatforms(cam)){if(s.active===false||!view(this,s,65)||String(s.id).startsWith('bed18_')||n.structures.includes(s))continue;
  const elem={icePlatform:'ice',earthPillar:'earth',vinePillar:'nature',skillPlatform:'light'}[s.type];
  if(elem){this.tElementPlatform(c,s,elem);continue;}
  const theme=s.room?this.aTheme(this.roomById.get(s.room)):th,kind=s.motion213||s.material213==='bridge'?'bridge':'rock';
  if(s.h>36){c.fillStyle=this.aPattern(c,theme);c.fillRect(s.x,s.y,s.w,s.h);c.fillStyle='#051c326e';c.fillRect(s.x,s.y,s.w,s.h);}
  this.tRockLip(c,s.x,s.y,s.w,kind,theme);
  if(s.motion213){c.strokeStyle='#7ca1b4a0';c.lineWidth=2;for(const x of [s.x+22,s.x+s.w-22]){c.beginPath();c.moveTo(x,s.y-15);c.lineTo(x,s.motion213.y-146);c.stroke();}glow(c,cx(s),s.y+20,42,'#83e5fa',.10);}
 }
 for(const l of this.ladders){if(!view(this,l,25))continue;c.strokeStyle='#425763';c.lineWidth=6;c.beginPath();c.moveTo(l.x+4,l.y);c.lineTo(l.x+4,l.y+l.h);c.moveTo(l.x+l.w-4,l.y);c.lineTo(l.x+l.w-4,l.y+l.h);c.stroke();c.strokeStyle='#adbbbe';c.lineWidth=2;for(let y=l.y+12;y<l.y+l.h;y+=23){c.beginPath();c.moveTo(l.x+4,y);c.lineTo(l.x+l.w-4,y);c.stroke();}}
 for(const r of this.rings){if(!view(this,{x:r.x-20,y:r.y-20,w:40,h:40},20))continue;c.save();c.strokeStyle='#a3e8e8';c.lineWidth=1.4;c.beginPath();c.arc(r.x,r.y,r.r||13,0,TAU);c.stroke();spark(c,r.x,r.y,5,'#d8ffff');c.restore();}
 c.restore();this.nDrawStructures(c);this.tDrawTraversal(c);
};
P.tDrawTraversal=function(c){const t=this.tInit();c.save();c.imageSmoothingEnabled=true;
 for(const q of t.props){if(!view(this,{x:q.x-40,y:q.y-140,w:80,h:140},80))continue;
  if(q.kind==='banner'){const im=this.assets.t213_banner;if(im?.naturalWidth){c.save();c.translate(q.x,q.y-15);c.rotate(Math.sin(this.time*1.4+q.seed)*.025);c.drawImage(im,-24,0,48,92);c.restore();}}
  else{c.strokeStyle='#6b858d';c.lineWidth=3;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x,q.y-94);c.quadraticCurveTo(q.x,q.y-110,q.x+20,q.y-108);c.stroke();c.lineWidth=1;c.beginPath();c.moveTo(q.x+20,q.y-108);c.lineTo(q.x+20,q.y-87);c.stroke();glow(c,q.x+20,q.y-76,72,'#ffe0ab',.23);c.fillStyle='#283c48';c.fillRect(q.x+13,q.y-88,14,25);const gr=c.createLinearGradient(q.x+15,0,q.x+25,0);gr.addColorStop(0,'#b9986e');gr.addColorStop(.5,'#fff0bc');gr.addColorStop(1,'#cfaa79');c.fillStyle=gr;c.fillRect(q.x+16,q.y-86,8,20);c.strokeStyle='#f3d6a1';c.lineWidth=.8;c.strokeRect(q.x+13,q.y-88,14,25);}
 }
 for(const w of t.winds){if(!view(this,w,40))continue;c.save();c.globalCompositeOperation='screen';const center=w.x+w.w/2;glow(c,center,w.y+w.h*.55,Math.min(w.h*.6,180),'#95deff',.05);
  for(let j=0;j<6;j++){c.strokeStyle=j%2?'#a6f0ff52':'#d7eaff2b';c.lineWidth=j%2?1.4:3;c.beginPath();for(let k=0;k<=32;k++){const u=k/32,y=w.y+u*w.h,x=center+Math.sin(u*TAU*1.7+this.time*2.5+j*1.1)*(18+24*Math.sin(u*Math.PI));k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
  for(let j=0;j<8;j++){const yy=w.y+((j*57-this.time*83)%w.h+w.h)%w.h; spark(c,center+Math.sin(j*4+this.time)*32,yy,2,'#cffff5');}c.restore();
  if(this.key('up')&&Math.abs(cx(this.player)-center)<90&&cy(this.player)>w.y&&cy(this.player)<w.y+w.h)this.vText(c,'↑ 氣流上升 · 放開後跳離',center,w.y+28,'#c9edfa',11);
 }
 for(const h of t.hazards){if(!view(this,{x:h.x-160,y:h.y-260,w:h.w+320,h:320},40))continue;const st=this.tHazardState(h);c.save();
  if(h.type==='pendulum'){const a=Math.sin(this.time*1.75+h.phase)*.78,px=h.x,py=h.y-235,bx=px+Math.sin(a)*150,by=py+Math.cos(a)*180;c.strokeStyle='#657f8d';c.lineWidth=4;c.beginPath();c.moveTo(px,py);c.lineTo(bx,by);c.stroke();c.strokeStyle='#b5c7cc';c.lineWidth=1;c.stroke();const g=c.createRadialGradient(bx-8,by-9,2,bx,by,26);g.addColorStop(0,'#8da5b2');g.addColorStop(.35,'#43516c');g.addColorStop(1,'#101e34');c.fillStyle=g;c.beginPath();c.arc(bx,by,23,0,TAU);c.fill();c.strokeStyle='#d2a9e4';c.lineWidth=1.2;c.beginPath();c.ellipse(bx,by,23,10,a,0,TAU);c.stroke();spark(c,bx,by,8,'#ddadf7');glow(c,bx,by,42,'#b896fb',.15);
  }else{c.fillStyle='#142d40';c.fillRect(h.x-8,h.y-3,h.w+16,7);c.strokeStyle=st.warning?'#ffdca9':st.active?'#dfa2ff':'#6e929e';c.lineWidth=1.5;c.beginPath();c.moveTo(h.x,h.y-2);c.lineTo(h.x+h.w,h.y-2);c.stroke();
   if(st.warning){glow(c,h.x+h.w/2,h.y,65,'#ffb79e',.19);this.vText(c,'◇ 即將噴發',h.x+h.w/2,h.y-42,'#ffe2a4',11);}
   if(st.active&&h.type==='thorns'){const im=this.assets.t213_crystal_spikes;c.save();c.beginPath();c.rect(h.x-3,h.y-42*st.amount,h.w+6,44*st.amount+8);c.clip();if(im?.naturalWidth)c.drawImage(im,h.x,h.y-38*st.amount,h.w,48);c.restore();}
   if(st.active&&h.type==='vent'){c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,h.y-140,0,h.y);g.addColorStop(0,'#b5edff00');g.addColorStop(.7,'#a6ddfa88');g.addColorStop(1,'#f0fbffcc');c.fillStyle=g;c.beginPath();c.moveTo(h.x,h.y);c.quadraticCurveTo(h.x+h.w*.4,h.y-160,h.x+h.w*.6,h.y-132);c.quadraticCurveTo(h.x+h.w*.7,h.y-95,h.x+h.w,h.y);c.closePath();c.fill();for(let j=0;j<7;j++)spark(c,h.x+12+j*12,h.y-((this.time*170+j*23)%127),2,'#d6edff');}
  }c.restore();
 }c.restore();};
P.tElementPlatform=function(c,s,el){const color=colors[el]||colors.light,life=s.t===undefined?1:clamp(s.t/.6,0,1);c.save();c.globalAlpha*=life;c.imageSmoothingEnabled=true;
 if(el==='earth'||el==='nature'){this.tRockLip(c,s.x,s.y,s.w,'rock',el==='earth'?'desert':'forest');if(el==='nature'){c.strokeStyle='#93cba4';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();for(let i=0;i<=24;i++){const x=s.x+i*s.w/24,y=s.y+8+Math.sin(i*.7+k+this.time)*6;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}}
 else{c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,s.y-2,0,s.y+38);g.addColorStop(0,'#edfbffd0');g.addColorStop(.2,rgb(color,.65));g.addColorStop(1,rgb(color,0));c.fillStyle=g;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x+s.w,s.y);for(let k=9;k>=0;k--)c.lineTo(s.x+k*s.w/9,s.y+12+Math.sin(k*4.4)*8+(k%2)*13);c.closePath();c.fill();c.strokeStyle='#e3f6ff';c.lineWidth=1.2;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x+s.w,s.y);c.stroke();for(let k=0;k<7;k++){const x=s.x+8+(k+.5)*(s.w-16)/7;spark(c,x,s.y-4-Math.sin(this.time*1.7+k)*3,2.5,color);}}
 glow(c,cx(s),s.y+6,Math.min(100,s.w*.55),color,.10);c.restore();};
const fields=P.drawFields;P.drawFields=function(c){const all=this.fields;this.fields=all.filter(s=>!['icePlatform','earthPillar','vinePillar','skillPlatform'].includes(s.type));try{fields.call(this,c);}finally{this.fields=all;}const seen=new Set();for(const f of this.xInit().fields){if(f.t<=0)continue;const key=f.element+':'+Math.round(f.x/50)+':'+Math.round(f.y/50)+':'+!!f.line+':'+(f.behavior||'');if(seen.has(key))continue;seen.add(key);c.save();c.globalAlpha*=.72;this.tResidue(c,f);c.restore();}};
const swap=P.elementSwapEffect;P.elementSwapEffect=function(el,old,now){const result=swap.call(this,el,old,now);const t=this.tInit();t.swapFX.push({element:el.id,a:{x:old.cx??old.x,y:old.cy??old.y},b:{x:now.x,y:now.y},start:this.time});if(t.swapFX.length>18)t.swapFX.shift();return result;};
// Each element retains its own visual grammar as well as its original gameplay.
P.tResidue=function(c,f){const col=colors[f.element]||colors.shadow,age=(f.max||f.t)-f.t,alpha=clamp(age/.20,0,1)*clamp(f.t/.7,0,1),x=f.x,y=f.y+30,r=Math.max(25,f.r||100),t=this.time;
 if(!view(this,{x:x-r,y:y-r,w:r*2,h:r*2},70))return;c.save();c.globalAlpha*=alpha;c.globalCompositeOperation='screen';glow(c,x,y,r*.85,col,.15);
 if(f.line){const[a,b]=f.line;for(let k=0;k<3;k++){c.lineWidth=k===0?1.7:.65;c.strokeStyle=k===0?'#e2e9ff':col;c.beginPath();for(let j=0;j<=32;j++){const u=j/32,xx=a.x+(b.x-a.x)*u,yy=a.y+(b.y-a.y)*u+Math.sin(u*TAU*3+t*3+k*2)*Math.sin(u*Math.PI)*(k?13:3);j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}}
 // The boundary matches the field's real radius; transparent center leaves targets readable.
 c.strokeStyle=rgb(col,.6);c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,r,r*.24,0,0,TAU);c.stroke();c.strokeStyle=rgb(col,.25);c.lineWidth=1;c.beginPath();c.ellipse(x,y,r*.9,r*.21,0,t*.28,t*.28+Math.PI*1.65);c.stroke();
 for(let k=0;k<11;k++){const a=k*TAU/11+t*.15,xx=x+Math.cos(a)*r*.92,yy=y+Math.sin(a)*r*.22;spark(c,xx,yy,k%3?2:4,col);}
 const alias={fire:'light',wind:'water',earth:'light',nature:'water',gravity:'shadow'},im=this.assets['t213_residue_'+(alias[f.element]||f.element)];
 if(im?.naturalWidth){c.save();if(f.element==='fire')c.filter='hue-rotate(325deg)';if(f.element==='nature')c.filter='hue-rotate(310deg)';if(f.element==='earth')c.filter='saturate(.6)';const ww=Math.min(r*1.5,240),hh=ww*im.height/im.width;c.globalAlpha*=.82;c.drawImage(im,x-ww/2,y-hh*.78,ww,hh);c.restore();}
 if(['fire','wind','water','nature'].includes(f.element)){for(let j=0;j<12;j++){const u=((t*(f.element==='fire'?.48:.26)+j*.137)%1),xx=x+Math.sin(j*17+u*2)*r*.73,yy=y-u*(f.element==='wind'?140:90);c.globalAlpha=alpha*Math.sin(u*Math.PI)*.62;
  if(f.element==='nature'){c.save();c.translate(xx,yy);c.rotate(u*3+j);c.fillStyle=col;c.beginPath();c.ellipse(0,0,3,7,.8,0,TAU);c.fill();c.restore();}
  else if(f.element==='water'){c.strokeStyle=col;c.lineWidth=.9;c.beginPath();c.arc(xx,yy,2+u*4,0,TAU);c.stroke();}else spark(c,xx,yy,2+u*2,col);}}
 if(f.element==='lightning'){c.strokeStyle='#ddd1ff';c.lineWidth=1;for(let j=0;j<3;j++){const xx=x+Math.sin(t*.9+j*2.1)*r*.6;c.beginPath();c.moveTo(xx,y-52);for(let k=1;k<=5;k++)c.lineTo(xx+Math.sin(k*4+t*7+j)*10,y-52+k*10);c.stroke();}}
 if(f.element==='gravity'||f.element==='shadow'){c.strokeStyle=col;c.lineWidth=1.3;for(let j=0;j<3;j++){c.beginPath();c.ellipse(x,y-25,28+j*10,12+j*6,t*.7+j*.8,0,Math.PI*1.7);c.stroke();}}
 c.restore();if(f.behavior==='decoy'){c.save();c.globalAlpha=.29*alpha;c.filter='brightness(1.75) hue-rotate(15deg)';this.aActor(c,{x:x-20,y:y-62,w:40,h:60,classId:this.player.classId,onGround:true,dir:this.player.dir,vx:0,vy:0,id:'decoy_'+f.id},1,true);c.restore();}
 if(f.reaction)this.vText(c,f.reaction,x,y-r*.28-44,col,11);
};
const effects=P.drawEffects;P.drawEffects=function(c){const x=this.xInit(),keep=x.fields,deposits=x.deposits;x.fields=[];x.deposits=[];try{effects.call(this,c);}finally{x.fields=keep;x.deposits=deposits;}
 // Residue ground planes render below actors in drawFields, never whitening silhouettes.

 for(const q of deposits){if(q.room!==this.currentRoomId||(!q.gate&&this.progress.playSeconds<(this.xState().harvest[q.id]||0))||(q.gate&&this.xState().gates[q.gate])||!view(this,q,50))continue;c.save();const col=q.gate?'#f3d494':'#a5e5d4';
  for(let j=0;j<3;j++){const xx=q.x+8+j*7,yy=q.y+q.h,h=18+j%2*12;c.fillStyle=j%2?'#588ca5':'#899ad3';c.beginPath();c.moveTo(xx-5,yy-3);c.lineTo(xx-4,yy-h);c.lineTo(xx,yy-h-6);c.lineTo(xx+5,yy-h+2);c.lineTo(xx+4,yy);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=.8;c.stroke();}glow(c,cx(q),q.y+10,37,col,.11);if(Math.abs(cx(q)-cx(this.player))<170)this.vText(c,q.gate?'E · 環境機關':'E · 採集',cx(q),q.y-19,col,11);c.restore();}
 const state=this.tInit();state.swapFX=state.swapFX.filter(f=>this.time-f.start<1.10);
 for(const f of state.swapFX){const age=this.time-f.start,u=age/1.1,alpha=Math.sin(Math.PI*u),col=colors[f.element]||colors.shadow;c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;
  for(const pt of [f.a,f.b]){glow(c,pt.x,pt.y,98,col,.20);this.lRune(c,pt.x,pt.y,28+u*12,col,this.time,alpha*.7);for(let j=0;j<10;j++){const a=j*TAU/10+u*2;spark(c,pt.x+Math.cos(a)*(12+u*72),pt.y+Math.sin(a)*(20+u*62),3*(1-u)+1,col);}}
  c.strokeStyle=rgb(col,.65);c.lineWidth=1.3;for(let j=0;j<3;j++){c.beginPath();c.moveTo(f.a.x,f.a.y);c.bezierCurveTo(f.a.x+(f.b.x-f.a.x)*.3,f.a.y-70-j*22,f.b.x-(f.b.x-f.a.x)*.3,f.b.y+70+j*22,f.b.x,f.b.y);c.stroke();}
  const im=this.assets.t213_residue_swap;if(im?.naturalWidth){const ww=Math.min(215,Math.abs(f.b.x-f.a.x)*.6+70);c.drawImage(im,(f.a.x+f.b.x)/2-ww/2,(f.a.y+f.b.y)/2-ww*.31,ww,ww*.625);}c.restore();}
};
// A small diffusion layer keeps busy background masonry behind the action plane.
const bg=P.drawBackground;P.drawBackground=function(c,w,h){bg.call(this,c,w,h);c.save();c.fillStyle='#133c5424';c.fillRect(0,0,w,h);c.restore();};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);const art=document.querySelector('#worldArt21 img');if(art)art.src=window.ES9_ASSET_URIS?.['assets/art213/world_concept.webp']||'assets/art213/world_concept.webp';document.querySelector('#helpPanel .help-grid')?.insertAdjacentHTML('afterbegin','<article class="v213-help"><h3>V21.3 · 潮路重織</h3><p>橫向連接改為落腳棧道，垂直路段以平台與氣流串聯。氣流中按 ↑ 上升，放開後可以跳離；短梯僅留在維修區。地刺／噴口先亮起警示再啟動；升降台可以載人。連續墜落且前方沒有落腳點時，回到最近安全點並扣除 4% HP。</p><p>角色步態依實際移動距離推進，腳部落地與上身前傾分開。1–0 發射元素，再按同鍵換位：殘留領域會依原本元素與分支運作，發光邊界跟隨真實範圍。</p></article>');};
})();
