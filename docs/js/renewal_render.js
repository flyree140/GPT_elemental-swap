/* V18 draws exactly the same ground mesh that collision uses. No image service. */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES18,TAU=Math.PI*2,cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const palettes={glacier:['#34535c','#81afb7','#c2e9e7'],dune:['#5d4c3c','#b29362','#e0c58d'],reef:['#214957','#599991','#a4d8b8'],abyss:['#192c4c','#47648a','#81acbe'],sky:['#354b5c','#9bb2b5','#d9d6b7'],umbra:['#3f3654','#9a81b1','#d4b9d7'],inferno:['#443e43','#966b5c','#d79773'],metro:['#364a54','#798b8e','#c7b890'],base:['#2e444a','#668479','#abbba2']};
const visible=(g,o,m=100)=>o.x+(o.w||0)>g.camera.x-m&&o.x<g.camera.x+g.viewW+m&&o.y+(o.h||0)>g.camera.y-m&&o.y<g.camera.y+g.viewH+m;
const circle=(ctx,x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);};
P.nPalette=function(x,y){const r=this.roomAt(x,y);return palettes[r?.biome]||palettes.base;};
const bg=P.drawBackground;P.drawBackground=function(ctx,w,h){const n=this.nInit(),id=this.currentRoomId,key=this.roomById.get(id)?.biome||this.currentRegion;
 if(!n.background18){n.background18={key,room:id,at:this.time,prior:null};}const b=n.background18;
 if(key!==b.key){b.prior=b.room;b.at=this.time;b.key=key;}b.room=id;
 if(b.prior&&this.time-b.at<.8){const old=this.currentRoomId,region=this.currentRegion;this.currentRoomId=b.prior;this.currentRegion=this.roomById.get(b.prior)?.region||region;bg.call(this,ctx,w,h);this.currentRoomId=old;this.currentRegion=region;ctx.save();ctx.globalAlpha=clamp((this.time-b.at)/.8,0,1);bg.call(this,ctx,w,h);ctx.restore();}else bg.call(this,ctx,w,h);
 const mode=this.vInit().mode;if(mode==='past'||mode==='future'||mode==='inner'||mode==='decay'){ctx.save();ctx.fillStyle={past:'#e5c88617',future:'#65d9ce12',inner:'#7a459b27',decay:'#a1a09516'}[mode];ctx.fillRect(0,0,w,h);ctx.restore();}
};
const rooms=P.drawRooms;P.drawRooms=function(ctx){const all=this.rooms;this.rooms=all.filter(r=>!r.x17);try{rooms.call(this,ctx);}finally{this.rooms=all;}
 for(const r of all.filter(r=>r.x17&&visible(this,r,200))){const b=ES17.biomes[r.biome];if(r.shelter){const x=r.x+690,y=r.floorY-278;ctx.fillStyle='#18393df0';ctx.fillRect(x,y,680,278);ctx.fillStyle='#557370';ctx.fillRect(x-14,y-16,708,22);ctx.fillStyle='#d5bd8d';ctx.fillRect(x+7,y+12,8,255);ctx.fillRect(x+665,y+12,8,255);for(let j=0;j<4;j++){ctx.fillStyle='#90bdb3';ctx.fillRect(x+55+j*139,y+48,92,85);ctx.fillStyle='#264849';ctx.fillRect(x+60+j*139,y+55,82,72);ctx.fillStyle='#e6d69c';ctx.fillRect(x+60+j*139,y+55,82,9);}this.vText(ctx,'歸燈前哨 · 工具 / 製作 / 整備',x+340,y+174,'#e7d4a0',17);}
 else for(let j=0;j<7;j++){const x=r.x+87+(j*311+r.stage*119)%(r.w-150),y=r.floorY,h=25+(j*29)%85;ctx.save();ctx.globalAlpha=.78;ctx.fillStyle=b.color;
  if(['reef','abyss','umbra','inferno','glacier'].includes(r.biome)){ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x-12,y-h*.7);ctx.lineTo(x+2,y-h);ctx.lineTo(x+15,y-h*.72);ctx.lineTo(x+24,y);ctx.fill();ctx.fillStyle='#dae5ce55';ctx.fillRect(x,y-h+12,5,h-18);}
  else if(r.biome==='dune'){ctx.fillRect(x,y-h,11,h);ctx.fillRect(x-17,y-h*.7,17,8);ctx.fillRect(x-20,y-h*.85,8,h*.2);ctx.fillRect(x+7,y-h*.45,21,8);ctx.fillRect(x+20,y-h*.6,8,h*.2);}
  else if(r.biome==='metro'){ctx.fillStyle='#334e59';ctx.fillRect(x-12,y-h,30,h);ctx.fillStyle='#b0d6c9';ctx.fillRect(x-5,y-h+9,12,5);ctx.fillRect(x-5,y-h+21,12,5);}
  else{ctx.fillRect(x,y-h*.4,5,h*.4);ctx.beginPath();ctx.ellipse(x,y-h*.45,25,7,-.4,0,TAU);ctx.fill();}ctx.restore();}
 }
};
const plats=P.drawPlatforms;P.drawPlatforms=function(ctx){const n=this.nInit(),camera={x:this.camera.x,y:this.camera.y,w:this.viewW,h:this.viewH},col=this.nPalette(cx(camera),cy(camera));ctx.save();
 for(const t of this.nTerrainAt(camera,32)){ctx.fillStyle=col[0];ctx.fillRect(t.x,t.y,t.w,t.h);}
 // Only AIR / ROCK boundaries get a top edge. Merged mesh seams stay invisible.
 const c=n.cell,x0=Math.max(0,Math.floor(camera.x/c)),x1=Math.min(n.cols-1,Math.ceil((camera.x+camera.w)/c)),y0=Math.max(1,Math.floor(camera.y/c)),y1=Math.min(n.rows-1,Math.ceil((camera.y+camera.h)/c));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(n.mask[y*n.cols+x])continue;const xx=x*c,yy=y*c,hash=(x*17+y*71)%31;
  if(n.mask[(y-1)*n.cols+x]){ctx.fillStyle=col[1];ctx.fillRect(xx,yy,c,9+(hash%8));ctx.fillStyle=col[2];ctx.fillRect(xx,yy,c,4);ctx.fillStyle=col[1];ctx.fillRect(xx+hash,yy-3,4,4);}
  else if(n.mask[y*n.cols+x-1]){ctx.fillStyle=col[1];ctx.fillRect(xx,yy,4,c);}else if(n.mask[y*n.cols+x+1]){ctx.fillStyle=col[1];ctx.fillRect(xx+c-4,yy,4,c);}
  else if(n.mask[(y+1)*n.cols+x]){ctx.fillStyle='#10292c';ctx.fillRect(xx,yy+c-5,c,5);}
  else if(hash<4){ctx.fillStyle=hash%2?'#57716f55':'#18323788';ctx.fillRect(xx+8,yy+12,12,5);ctx.fillRect(xx+13,yy+17,8,3);}
 }
 // Solid biome benches and room floors share the local terrain palette.
 for(const s of this.platforms.filter(s=>s.bed18&&visible(this,s))){const k=this.nPalette(s.x,s.y);ctx.fillStyle=k[0];ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle=k[1];ctx.fillRect(s.x,s.y,s.w,Math.min(11,s.h));ctx.fillStyle=k[2];ctx.fillRect(s.x,s.y,s.w,4);}
 ctx.restore();const active=this.activePlatforms;this.activePlatforms=(body)=>active.call(this,body).filter(s=>!s.bed18&&!n.structures.includes(s)&&!String(s.id).startsWith('lab')&&!String(s.id).includes('18_'));
 try{plats.call(this,ctx);}finally{this.activePlatforms=active;}
 this.nDrawStructures(ctx);
};
P.nDrawStructures=function(ctx){const n=this.nInit(),mode=this.vInit().mode;for(const s of n.structures){if(!visible(this,s)||s.until&&s.until<=this.time)continue;const active=this.nStructureActive(s),color=s.kind==='ruin'?'#d3bba1':s.kind==='lift'?'#8cdfcb':s.kind==='mushroom'?'#d0b3d4':s.kind==='air'?'#b8e9e0':s.modes.includes('past')?'#e3c48e':s.modes.includes('inner')?'#b9a3de':'#a9d7c2';ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;
 if(s.kind==='air'){ctx.globalAlpha=.13;ctx.beginPath();ctx.ellipse(cx(s),cy(s),s.w/2,s.h/2,0,0,TAU);ctx.fill();ctx.globalAlpha=.7;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);this.vText(ctx,'↑ 氣泡補氧',cx(s),s.y-8,color,11);ctx.restore();continue;}
 if(!active){if(s.kind==='ruin'&&mode==='decay'){ctx.globalAlpha=.22;for(let i=0;i<7;i++)ctx.fillRect(s.x+i*s.w/7,s.y+Math.sin(this.time+i)*28,3,3);}
 else{ctx.globalAlpha=.25;ctx.setLineDash([6,8]);ctx.strokeRect(s.x,s.y,s.w,s.h);ctx.setLineDash([]);}ctx.restore();continue;}
 let fade=1;if(s.kind==='ruin'&&mode==='decay')fade=clamp(1-(this.time-n.ruleAt)/(s.decayAfter||4),.1,1);ctx.globalAlpha=fade;
 if(s.kind==='mushroom'){ctx.fillStyle='#9a859e';ctx.fillRect(s.x+s.w*.45,s.y+8,s.w*.1,50);ctx.fillStyle=color;ctx.fillRect(s.x,s.y,s.w,12);ctx.fillRect(s.x+14,s.y-9,s.w-28,11);ctx.fillRect(s.x+29,s.y-15,s.w-58,8);ctx.fillStyle='#ecdfc9';for(let k=0;k<4;k++)ctx.fillRect(s.x+18+k*18,s.y-2,6,4);}
 else{ctx.fillStyle='#28464e';ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle=color;ctx.fillRect(s.x,s.y,s.w,5);for(let x=s.x+7;x<s.x+s.w-10;x+=23){ctx.globalAlpha=fade*.6;ctx.fillRect(x,s.y+9,13,Math.min(5,s.h-10));}ctx.globalAlpha=fade;if(s.kind==='lift'){ctx.setLineDash([2,7]);ctx.beginPath();ctx.moveTo(s.x+10,s.baseY-245);ctx.lineTo(s.x+10,s.baseY+22);ctx.moveTo(s.x+s.w-10,s.baseY-245);ctx.lineTo(s.x+s.w-10,s.baseY+22);ctx.stroke();ctx.setLineDash([]);}if(s.kind==='ruin'&&mode==='decay'){ctx.strokeStyle='#132d33';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(s.x+s.w*(i+.4)/3,s.y);ctx.lineTo(s.x+s.w*(i+.6)/3,s.y+11);ctx.lineTo(s.x+s.w*(i+.5)/3,s.y+s.h);ctx.stroke();}}}
 ctx.globalAlpha=Math.max(.45,fade);if(s.label&&!s.fungus18)this.vText(ctx,s.label,s.x+s.w/2,s.y-16,color,11);ctx.restore();}
};
P.vDrawMaterials=function(){};
const fields=P.drawFields;P.drawFields=function(ctx){fields.call(this,ctx);for(const r of this.rooms){if(!r.x17||r.shelter||!['reef','abyss'].includes(r.biome)||!visible(this,r))continue;const surface=r.biome==='abyss'?r.y-45:r.floorY-(this.vInit().mode==='future'?170:310),bottom=r.floorY+75;ctx.save();const g=ctx.createLinearGradient(0,surface,0,bottom);g.addColorStop(0,'#70d6d412');g.addColorStop(1,'#2068865c');ctx.fillStyle=g;ctx.fillRect(r.x-30,surface,r.w+60,bottom-surface);ctx.strokeStyle='#b9ece282';ctx.lineWidth=2;ctx.beginPath();for(let x=r.x-30;x<=r.x+r.w+30;x+=18)ctx.lineTo(x,surface+Math.sin(x*.03+this.time*1.4)*4);ctx.stroke();ctx.fillStyle='#b4e9dd77';for(let j=0;j<35;j++){const x=r.x+(j*173)%(r.w+10),y=bottom-((j*37+this.time*19)%(bottom-surface));ctx.fillRect(x,y,3,3);}ctx.restore();}
};
P.nDrawObject=function(ctx,o){const col=C.ELEMENTS.find(e=>e.id===o.element)?.color||'#d5c299',left=o.until-this.time;ctx.save();ctx.globalAlpha=clamp(left,.15,1)*(o.layer===this.vLayer()?1:.28);ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2;
 if(o.start&&o.end){ctx.setLineDash(o.type==='wire'?[10,4]:[4,5]);ctx.beginPath();ctx.moveTo(o.start.x,o.start.y);ctx.lineTo(o.end.x,o.end.y);ctx.stroke();ctx.setLineDash([]);}
 if(['dreamDecoy','decoy','puppet','timeAnchor'].includes(o.type)){const im=this.assets['player_'+(o.type==='puppet'?'puppeteer':o.classId)];ctx.globalAlpha*=o.type==='puppet'?.8:.48;if(im?.naturalWidth)ctx.drawImage(im,0,0,64,80,o.x-32,o.y-43,64,80);ctx.globalAlpha=1;circle(ctx,o.x,o.y+31,26);ctx.stroke();}
 else if(o.type==='pet'){ctx.save();ctx.translate(o.x,o.y);const owl=o.variant==='owl';ctx.fillStyle=owl?'#b4d5d8':'#d7aa76';ctx.fillRect(-21,-9,42,21);ctx.fillRect(owl?-17:12,-24,owl?34:20,23);ctx.fillRect(12,-30,7,9);ctx.fillRect(26,-29,6,9);ctx.fillStyle='#f2e3b3';ctx.fillRect(owl?-8:20,-17,7,7);if(owl){ctx.fillStyle='#87bdbd';const w=Math.sin(this.time*9)*12;ctx.fillRect(-40,-5+w,23,8);ctx.fillRect(17,-5-w,23,8);}else{ctx.fillStyle='#9f7855';ctx.fillRect(-34,-1,18,10);ctx.fillRect(-17,11,8,10);ctx.fillRect(13,11,8,10);}ctx.restore();}
 else if(o.type==='turret'||o.type==='drone'){ctx.fillStyle='#667f80';ctx.fillRect(o.x-20,o.y-15,40,28);ctx.fillStyle=col;ctx.fillRect(o.x-15,o.y-10,30,5);ctx.fillStyle='#d7d4b1';ctx.fillRect(o.x+8,o.y-8,28,8);ctx.fillStyle='#3b5258';ctx.fillRect(o.x-24,o.y+14,48,6);ctx.fillRect(o.x-15,o.y+20,7,10);ctx.fillRect(o.x+8,o.y+20,7,10);}
 else if(['dreamSeed','mine','trap','gel'].includes(o.type)){ctx.globalAlpha*=.2;ctx.beginPath();ctx.ellipse(o.x,o.y+17,o.r||90,22,0,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillRect(o.x-16,o.y+4,32,9);ctx.fillRect(o.x-8,o.y-9,16,15);circle(ctx,o.x,o.y-3,6);ctx.stroke();if(o.type==='dreamSeed'){ctx.fillStyle='#e4cff2';ctx.fillRect(o.x-2,o.y-26,4,9);ctx.fillRect(o.x-15,o.y-20,5,5);ctx.fillRect(o.x+12,o.y-20,5,5);}}
 else if(o.type==='pin'||o.type==='banner'){ctx.fillStyle='#c5bb91';ctx.fillRect(o.x-2,o.y-44,4,84);ctx.fillStyle=col;ctx.fillRect(o.x+2,o.y-43,32,23);this.vText(ctx,o.type==='pin'?o.pin.toUpperCase():'◇',o.x+18,o.y-26,'#17383f',17);}
 else{ctx.globalAlpha*=.12;circle(ctx,o.x,o.y,o.r||70);ctx.fill();ctx.globalAlpha=clamp(left,.2,.7);ctx.setLineDash(['slow','dreamGarden','peace'].includes(o.type)?[5,8]:[]);circle(ctx,o.x,o.y,o.r||70);ctx.stroke();ctx.setLineDash([]);ctx.fillRect(o.x-9,o.y-9,18,18);ctx.fillStyle='#e8dfba';ctx.fillRect(o.x-3,o.y-3,6,6);}
 if(o.label&&visible(this,{x:o.x,y:o.y},0))this.vText(ctx,o.label,o.x,o.y-(o.r>180?65:49),col,11);ctx.restore();
};
const effects=P.drawEffects;P.drawEffects=function(ctx){effects.call(this,ctx);const n=this.nInit();for(const o of n.objects)if(o.until>this.time&&(visible(this,{x:o.x-(o.r||50),y:o.y-(o.r||50),w:(o.r||50)*2,h:(o.r||50)*2})||o.start&&visible(this,{x:o.start.x,y:o.start.y,w:1,h:1})))this.nDrawObject(ctx,o);
 for(const s of n.shots){if(!visible(this,s))continue;const col=C.ELEMENTS.find(e=>e.id===s.element)?.color||'#e9d194';ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=s.flask?3:4;ctx.beginPath();ctx.moveTo(s.x-s.vx*.035,s.y-s.vy*.035);ctx.lineTo(s.x,s.y);ctx.stroke();if(s.flask){ctx.fillRect(s.x-6,s.y-6,12,14);ctx.fillStyle='#e7dbc0';ctx.fillRect(s.x-3,s.y-11,6,5);}else ctx.fillRect(s.x-4,s.y-4,8,8);ctx.restore();}
 for(const f of n.fx){if(f.kind!=='beam'&&!visible(this,{x:f.x-f.r,y:f.y-f.r,w:f.r*2,h:f.r*2}))continue;const alpha=clamp(f.t/(f.max||.5),0,1);ctx.save();ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.globalAlpha=alpha*.85;ctx.lineWidth=2;
 if(f.kind==='beam'){ctx.lineWidth=Math.max(2,(f.width||9)*alpha*.35);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#fff3ce';ctx.stroke();}
 else{circle(ctx,f.x,f.y,Math.max(4,f.r*(1.05-alpha*.25)));ctx.stroke();for(let i=0;i<8;i++){const a=i*TAU/8+this.time*.8;ctx.fillRect(f.x+Math.cos(a)*f.r*(1-alpha*.3),f.y+Math.sin(a)*f.r*(1-alpha*.3),3,3);}}
 ctx.restore();}
 for(const e of this.enemies){if(e.dead||!visible(this,e)||!this.vCanHit(e))continue;const labels=[];if(e.rift18)labels.push('刻痕 '+e.rift18);if(e.drowse18&&e.sleep17<=this.time)labels.push('困意 '+ '●'.repeat(e.drowse18)+'○'.repeat(3-e.drowse18));if(e.point18>this.time)labels.push('氣穴');if(e.prey18)labels.push('獵痕 '+e.prey18);if(e.sleep17>this.time)labels.push('睡眠 '+(e.sleep17-this.time).toFixed(1)+'s・受傷會醒');if(labels.length)this.vText(ctx,labels.join(' · '),cx(e),e.y-33,'#e3cbe7',11);}
 this.nDrawAim(ctx);
};
P.nDrawAim=function(ctx){const n=this.nInit(),p=this.player,h=Object.values(n.holds)[0];if(!h)return;const s=ES10_MASTER.skills[h.id],a=h.aim||this.nAim(),ch=this.time-h.start>=s.holdTime18,col=ch?'#f3d192':'#a9ddc5',at=this.nPlace(ch,340,a),line=['cut','snipe','round','flask','shot','spear','jab','wave','slash','intercept','kick','lance'].includes(s.op18),origin={x:cx(p),y:cy(p)};ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([7,7]);if(line){const range=s.class18==='sharpshooter'?(ch?1050:730):ch?430:190;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(origin.x+a.x*range,origin.y+a.y*range);ctx.stroke();for(let i=1;i<=3;i++){const x=origin.x+a.x*range*i/3,y=origin.y+a.y*range*i/3;ctx.fillRect(x-2,y-6,4,12);}}
 else{circle(ctx,at.x,at.y,32);ctx.stroke();ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(at.x,at.y);ctx.stroke();ctx.fillRect(at.x-10,at.y-1,20,2);ctx.fillRect(at.x-1,at.y-10,2,20);}
 ctx.setLineDash([]);this.vText(ctx,(ch?'長按就緒':'短按準備')+' · '+s.name,origin.x,origin.y-80,col,12);ctx.restore();};
})();
