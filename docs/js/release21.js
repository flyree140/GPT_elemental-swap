/* V21 release: local fixtures, all skill objects, rendering safety and usability.
 * Combat state remains authoritative. Visual assets never stand in for collisions.
 */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,C=ES9,A=ES21_ART,$=s=>document.querySelector(s),TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,uri=p=>window.ES9_ASSET_URIS?.[p]||p;
const inview=(g,o,m=140)=>o.x+(o.w||0)>g.camera.x-m&&o.x<g.camera.x+g.viewW+m&&o.y+(o.h||0)>g.camera.y-m&&o.y<g.camera.y+g.viewH+m;
const fixtures=['bed','workbench','radio','terminal','fridge','locker','map','stove','purifier','shelf','sofa','lamp'];
const load=P.loadAssets;P.loadAssets=function(){const a=load.call(this);for(const k of fixtures){const im=new Image();im.decoding='async';im.src=uri('assets/art21/fixture_'+k+'.png');a['l21_fixture_'+k]=im;}return a;};
P.drawFurniture=function(ctx){for(const f of this.furniture){if(!inview(this,f,110))continue;const im=this.assets['l21_fixture_'+f.kind];if(!im?.naturalWidth)continue;ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(im,f.x-20,f.y+f.h-112,96,112);if(this.nearInteract?.ref===f){ctx.strokeStyle='#b2eff299';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(f.x-14,f.y+f.h+4);ctx.lineTo(f.x+f.w+15,f.y+f.h+4);ctx.stroke();this.vText(ctx,'E · '+(C.FURNITURE[f.kind]?.name||f.kind),cx(f),f.y-23,'#e8efcc',12);}ctx.restore();}};
// Use the new reference sprites for mirages / summoned allies, not old 8-bit boxes.
P.nDrawObject=function(ctx,o){if(!Number.isFinite(o.x)||!Number.isFinite(o.y))return;const col=C.ELEMENTS.find(e=>e.id===o.element)?.color||A.jobs[this.player.classId]?.color||'#bd9aff',t=this.time,left=o.until-t;
ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalAlpha=clamp(left,.12,1)*(o.layer===undefined||o.layer===this.vLayer()?1:.3);const age=Math.max(0,t-(o.startTime||o.at||t-1));
 if(o.start&&o.end){ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash(o.type==='wire'?[9,5]:[]);ctx.beginPath();ctx.moveTo(o.start.x,o.start.y);ctx.lineTo(o.end.x,o.end.y);ctx.stroke();ctx.setLineDash([]);this.lRune(ctx,o.start.x,o.start.y,13,col,t,.6);this.lRune(ctx,o.end.x,o.end.y,13,col,t,.6);}
 if(['dreamDecoy','decoy','puppet','timeAnchor'].includes(o.type)){
  ctx.save();ctx.globalAlpha*=o.type==='puppet'?.8:.58;ctx.filter='brightness(1.28)';this.aActor(ctx,{id:'object'+o.id,classId:o.classId||this.player.classId,x:o.x-20,y:o.y-54,w:40,h:60,dir:o.dir||this.player.dir,vx:0,vy:0,onGround:true,castT:o.type==='puppet'?1:0},1,true);ctx.restore();this.lRune(ctx,o.x,o.y+10,30,col,t,.6);
 }else if(o.type==='pet'){
  const fam=o.variant==='owl'?'bird':'golem';this.lDrawMonster(ctx,{id:o.id||180,species17:fam==='bird'?'bird':'beast',dir:this.player.dir,vx:40},fam,o.x,o.y+25,75,.9);
 }else if(['turret','drone'].includes(o.type)){
  const im=this.assets.l21_fixture_terminal;ctx.save();ctx.translate(o.x,o.y+(o.type==='drone'?Math.sin(t*3)*6:0));if(im?.naturalWidth)ctx.drawImage(im,-42,-77,84,98);
  const wep=this.assets.l21_weapon_gunner;if(wep?.naturalWidth){ctx.save();ctx.scale(o.dir||this.player.dir,1);ctx.drawImage(wep,-54,-137,200,167);ctx.restore();}this.lRune(ctx,0,22,30,col,t,.7);ctx.restore();
 }else if(['dreamSeed','mine','trap','gel'].includes(o.type)){
  const r=o.r||65;ctx.save();ctx.translate(o.x,o.y+10);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha*=.55;ctx.beginPath();ctx.ellipse(0,0,r,Math.min(26,r*.2),0,0,TAU);ctx.stroke();const im=this.assets['l21_fx_'+(o.type==='dreamSeed'?'bloom':'star')];ctx.globalAlpha=1;if(im?.naturalWidth){const s=39+Math.sin(t*2)*3;ctx.drawImage(im,-s*.5,-s,s,s);}ctx.restore();
 }else if(['pin','banner'].includes(o.type)){
  ctx.strokeStyle='#a2dce4';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(o.x,o.y+33);ctx.lineTo(o.x,o.y-40);ctx.stroke();this.lRune(ctx,o.x,o.y-37,17,col,t,.9);if(o.type==='pin')this.vText(ctx,(o.pin||'A').toUpperCase(),o.x,o.y-32,'#edf8ff',12);
 }else{
  const r=clamp(o.r||72,18,550);ctx.save();ctx.translate(o.x,o.y);ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,col+'25');g.addColorStop(.74,col+'18');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);
  ctx.strokeStyle=col;ctx.lineWidth=1.25;ctx.globalAlpha*=.72;ctx.beginPath();ctx.ellipse(0,r*.09,r,r*.28,0,0,TAU);ctx.stroke();
  if(['dreamGarden','slow','peace','ward','ritual','barrier'].includes(o.type)){ctx.beginPath();ctx.ellipse(0,r*.1,r,r*.7,0,Math.PI,TAU);ctx.stroke();for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,r*.1,r*(.28+j*.28),r*.7,0,Math.PI,TAU);ctx.stroke();}}
  for(let j=0;j<8;j++){const a=j*TAU/8+t*.1,x=Math.cos(a)*r*.84,y=Math.sin(a)*r*.24;ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+2,y);ctx.lineTo(x,y+5);ctx.lineTo(x-2,y);ctx.closePath();ctx.fillStyle=col;ctx.fill();}ctx.restore();
 }
 if(o.label&&inview(this,{x:o.x,y:o.y,w:1,h:1},0))this.vText(ctx,o.label,o.x,o.y-(o.r>180?65:54),col,11);ctx.restore();
};
// The V18 skill engine's projectiles are independent of elementShots. Cover both.
const fx=P.drawEffects;P.drawEffects=function(ctx){const n=this.nInit(),shots=n.shots;n.shots=[];try{fx.call(this,ctx);}finally{n.shots=shots;}
 for(const s of shots){if(!inview(this,s,120))continue;const col=C.ELEMENTS.find(e=>e.id===s.element)?.color||A.jobs[this.player.classId]?.color||'#cba1ff';if(s.flask){const im=this.assets.l21_weapon_alchemist;if(im?.naturalWidth){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx)+this.time*3);ctx.drawImage(im,50,190,90,120,-12,-18,24,32);ctx.restore();}this.lRune(ctx,s.x,s.y,12,col,this.time,.45);}else this.lMissile(ctx,{...s,x:s.x-7,y:s.y-7,w:14,h:14},col,false);}
};
// Paint temporary ice / gravity / past-world bridges with the same material scale.
const structures=P.nDrawStructures;P.nDrawStructures=function(ctx){const n=this.nInit(),all=n.structures;
 const solid=all.filter(s=>s.kind!=='air'&&this.nStructureActive(s)&&!(s.until&&s.until<=this.time));
 n.structures=all.filter(s=>!solid.includes(s));try{structures.call(this,ctx);}finally{n.structures=all;}
 for(const s of solid){if(!inview(this,s,70))continue;ctx.save();const th=s.kind==='mushroom'?'fungi':this.aTheme(this.roomById.get(s.room));ctx.fillStyle=this.aPattern(ctx,th);ctx.fillRect(s.x,s.y,s.w,s.h);this.aEdge(ctx,s.x,s.y,s.w,th,s.kind==='mushroom');ctx.strokeStyle=s.modes?.includes('past')?'#f0d5a799':s.modes?.includes('inner')?'#d3acf199':'#a7e9e999';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+s.w,s.y);ctx.stroke();if(s.label&&!s.fungus18&&Math.abs(cx(s)-cx(this.player))<420)this.vText(ctx,s.label,cx(s),s.y-20,'#cbeced',11);ctx.restore();}
};
// Detailed map images stay fixed to the geometry; labels and pins are live.
const bind=P.bindUI;P.bindUI=function(){bind.call(this);C.VERSION='21.0.0';$('.brand span').textContent='V21 · LUMINA';$('.brand b').textContent='澄界 · 光織紀';
 $('#atelierButton21').setAttribute('type','button');$('#atelierButton21').textContent='造型圖鑑';$('#masteryButton').textContent='L 技能';$('#expeditionButton').textContent='O 背包';
 $('#visionLive>small').textContent='WORLD LAW / 九種世界';$('#visionLive').title='[ / ] 切換已配裝視界；\\ 返回當下；J 因果工坊';
 const quality=$('#artQuality20');quality.onclick=()=>{const a=this.aInit();a.low=!a.low;document.body.classList.toggle('low-art20',a.low);try{localStorage.setItem('es20_art_quality',a.low?'low':'high');}catch{}quality.textContent=a.low?'畫質：省電':'畫質：光織';};
 $('#exportM').onclick=()=>{const data=JSON.parse(JSON.stringify(this.fSaveSnapshot()));data.appVersion21='21.4.1';const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='LivingAtlas_V21_4_save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
 // A direct route to a readable controls sheet; all hints use actual input bindings.
 const controls=$('#controls21');controls.innerHTML='<kbd>← →</kbd> 移動　<kbd>↑ ↓</kbd> 爬梯　<kbd>Space</kbd> 跳躍　<kbd>Shift</kbd> 衝刺　<kbd>Z / X</kbd> 連段';
 document.querySelectorAll('.panel').forEach(el=>el.setAttribute('tabindex','-1'));
 const style=$('#atelierTabs21');style.querySelector('[data-tab="monsters"]').textContent='生物與頭目';
 // Hide unrelated NPC labels unless in interaction range; the terrain remains unobstructed.
 $('#helpPanel .help-grid').insertAdjacentHTML('afterbegin','<article><h3>V21 完整版</h3><p>十五職業、五個技能槽、十元素與九種世界規則沿用原有戰鬥數據。美術已接入實際場景、角色、怪物、召喚物、子彈與介面。技能 C／V／B／N／F；1–0 發射元素，再按同鍵換位。E 互動，P 暫停；右上造型圖鑑可即時檢查各職業的動作。</p></article>');
};
const hud=P.nUpdateHUD;P.nUpdateHUD=function(){hud.call(this);const slots=$('#touchSkills');slots?.querySelectorAll('button').forEach((b,i)=>{if(!b.dataset.art21){b.style.setProperty('--touch-art21',`url("${uri('assets/art21/skill_'+(i%5)+'.png')}")`);b.dataset.art21='1';}});const q=$('#artQuality20');if(q)q.textContent=this.aInit().low?'畫質：省電':'畫質：光織';};
// Remove stale animation records during very long sessions (e.g. hundreds of summons).
const update=P.update;P.update=function(dt,ts){update.call(this,dt,ts);const l=this.lInit();if(l.animations.size>450)for(const[k,a]of l.animations)if(k!=='player'&&this.time-a.last>15)l.animations.delete(k);};
})();
