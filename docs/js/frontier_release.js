/* Release integration: small UI fixes, save ownership and entry point. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,$=s=>document.querySelector(s);
const open=P.fOpenAtlas;P.fOpenAtlas=function(...args){open.apply(this,args);this.fMapDetail();};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);
 $('.brand span').textContent='V19 · LIVING ATLAS';document.title='Elemental Swap V19｜生境圖譜';
 $('#comboPanel>div>p').textContent='Z／X 在原地形成不同範圍、段數與控制效果；實際命中幫助五格技能回復。方向鍵仍由你控制。';
 $('#helpPanel h2').textContent='V19 操作與世界設計';
 const oldHelp=$('#helpPanel .help-grid');if(oldHelp)oldHelp.insertAdjacentHTML('afterbegin','<article><h3>V19 生境圖譜</h3><p>M：300 地點大地圖，金色定位針是自己的實際座標。拖曳、滾輪縮放；「定位我」回到目前位置。左上小地圖可點開。地圖搜尋可看機關條件與步行路線，未抵達的前哨不能快旅。</p></article><article><h3>連段與命中節奏</h3><p>Z 快刺；X 重擊。XZ 回拉、ZZX 上挑、XXZ 破甲、ZXX 釘地、XZX 反彈。打中後再按下一鍵，可在末段提前輸入。技能短按／長按仍是同一槽；G 使用已指定的補給。</p></article>');
 $('#schoolPanel>div>p').textContent='實作研習：短按、長按、職業核心與世界規則。教場暫借技能，離開後還原原配置。普攻不強迫位移；無同鍵追擊换招。';
 $('#codexButton').title='遇見後解鎖；原生種、對應領域王、掉落與配方用途';
 this.fDrawMinimap();
};
})();
/* Place every collectible/console on the actual surface, not inside relief. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES19,$=s=>document.querySelector(s),cx=o=>o.x+o.w/2;
P.fGroundY=function(r,x,w=40){let y=r.floorY;for(const s of this.platforms)if(s.room===r.id&&!s.oneWay&&s.x<x+w&&s.x+s.w>x&&s.y<y)y=s.y;return y;};
const build=P.buildWorld;P.buildWorld=function(){build.call(this);const f=this.fInit();
 for(const n of [...f.nodes,...this.x17.deposits]){const r=this.roomById.get(n.room);if(!r?.frontier19)continue;if(n.kind==='console'&&r.task19==='climb'){
  const y=r.floorY-555;n.y=y-n.h;this.addPlatform(n.x-45,y,170,20,'catwalk',{room:r.id,oneWay:true,f19:true});this.ladders.push({id:this.id(),x:n.x+85,y:y-10,w:42,h:565,room:r.id});
 }else n.y=this.fGroundY(r,n.x,n.w)-n.h;}
 // Permanent air bells are reachable without owning the regional armor.
 for(const r of this.rooms.filter(r=>r.frontier19&&!r.shelter&&D.biomes[r.biome19].env==='pressure'))this.n18.structures.push({id:r.id+'_airbell19',kind:'air',x:r.x+145,y:r.floorY-350,w:170,h:185,modes:['all'],room:r.id,label:'補氧潛鐘'});
};
// Preserve V18's exact world-coordinate behavior while finding an above-relief camp arrival.
const travel=P.xTravel;P.xTravel=function(id,force=false){const ok=travel.call(this,id,force);const r=this.roomById.get(id);if(ok&&r?.frontier19){const p=this.player,y=this.fGroundY(r,p.x,p.w);const q=this.vLanding(p.x,y-p.h-4,p.w,p.h);if(q){p.x=q.x;p.y=q.y;this.n18.lastSafe={x:p.x,y:p.y,room:r.id};}}return ok;};
P.fValidateImport=function(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.mastery||!Object.hasOwn(C.CLASSES,raw.classId))throw Error('不是有效的 V17–V19 遊戲存檔');const text=JSON.stringify(raw);if(text.length>2e6)throw Error('存檔過大');return JSON.parse(text,(k,v)=>['__proto__','constructor','prototype'].includes(k)?undefined:v);};
P.fImportToStorage=function(raw){const s=this.fValidateImport(raw);const old=localStorage.getItem('es19_progress');if(old)localStorage.setItem('es19_backup_before_import',old);if(s.schema19===19){localStorage.setItem('es19_progress',JSON.stringify(s));}else{localStorage.removeItem('es19_progress');if(s.schema18===18)localStorage.setItem('es18_progress',JSON.stringify(s));else{localStorage.setItem('es10_progress',JSON.stringify(s));localStorage.removeItem('es18_progress');}}return true;};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);
 $('#exportM').onclick=()=>{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(this.fSaveSnapshot(),null,2)],{type:'application/json'}));a.href=u;a.download='elemental-swap-v19-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 $('#importM').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('存檔過大');this.fImportToStorage(JSON.parse(await file.text()));location.reload();}catch(err){this.say('匯入失敗：'+err.message,4);}finally{e.target.value='';}};
};
// Resource directions are a real equipment effect, not decorative map text.
const mini=P.fDrawMinimap;P.fDrawMinimap=function(){mini.call(this);const cv=$('#minimapCanvas19');if(!cv)return;const r=this.roomById.get(this.currentRoomId),ink=D.biomes[r?.biome19]?.env==='ink',hasInk=this.xHas('inkCompass');const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
 if(ink&&!hasInk){const g=ctx.createRadialGradient(w/2,h/2,34,w/2,h/2,w*.55);g.addColorStop(0,'#10192500');g.addColorStop(.6,'#111729a8');g.addColorStop(1,'#101324fa');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);$('#miniFooter19').textContent='墨霧限制視距 · 墨境羅盤可解霧';}
 if(this.xHas('shadeLens')||hasInk){const p=this.player,cache=this.f19.nodes.filter(n=>n.kind==='cache'&&n.room===r?.id&&!this.fState().solved[n.id]).sort((a,b)=>Math.abs(cx(a)-cx(p))-Math.abs(cx(b)-cx(p)))[0];if(cache){const a=Math.atan2(cache.y-p.y,cache.x-p.x),x=w/2+Math.cos(a)*45,y=h/2+Math.sin(a)*45;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#f5dba2';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,-5);ctx.lineTo(-5,5);ctx.fill();ctx.restore();$('#miniFooter19').textContent='◆ 研究匣方向 · '+(hasInk?'墨境羅盤':'遮光鏡');}}
};
})();
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype;const render=P.xRender;P.xRender=function(){render.call(this);document.querySelector('#expeditionTitle').textContent='生境圖譜 · 遠征工坊';};})();
