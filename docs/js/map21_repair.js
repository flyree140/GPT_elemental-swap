/* V21.2 atlas: retain the original coordinate renderer. Reference art has its own
   explicitly named overview; reference-map roads are not gameplay hitboxes. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,$=s=>document.querySelector(s),uri=p=>window.ES9_ASSET_URIS?.[p]||p;
const load=P.loadAssets;P.loadAssets=function(){const a=load.call(this);const im=new Image();im.decoding='async';im.src=uri('assets/art21/world_overview.webp');a.l21_worldOverview=im;return a;};
const currentRender=P.renderMap;
P.renderMap=function(){(window.ES21_TERRAIN_MAP||currentRender).call(this);const el=$('#overviewProgress21');if(el){const n=this.rooms.filter(r=>this.progress.discovered[r.id]).length;el.textContent=`已抵達 ${n} / ${this.rooms.length} 房 · ${this.roomById.get(this.currentRoomId)?.name||''}`;}};
P.mapMode21=function(mode){this.atlasMode21=mode;const cv=$('#worldMapCanvas'),art=$('#worldArt21');if(!cv||!art)return;cv.hidden=mode==='art';art.hidden=mode!=='art';document.querySelectorAll('[data-mapmode21]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapmode21===mode)));$('#mapPanel').classList.toggle('art-map21',mode==='art');this.renderMap();};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);
 const cv=$('#worldMapCanvas');if(!cv)return;
 $('.map-head h2').textContent='澄界 · 世界圖譜';$('.map-head p').textContent='實景地形保留真實座標、門檻與導航。美術總覽使用你提供的世界參考圖。';
 $('.atlas-toolbar19').insertAdjacentHTML('beforebegin','<nav class="map-tabs21" aria-label="地圖顯示方式"><button type="button" data-mapmode21="terrain" aria-pressed="true">實景地形 · 可導航</button><button type="button" data-mapmode21="art" aria-pressed="false">世界美術總覽</button><span id="overviewProgress21"></span></nav>');
 const wrap=document.createElement('section');wrap.id='worldArt21';wrap.hidden=true;wrap.innerHTML=`<img src="${uri('assets/art21/world_overview.webp')}" alt="使用者提供的世界美術參考總覽"><span>美術概念地理 · 遊戲位置／通道請切換「實景地形」</span>`;cv.after(wrap);
 document.querySelectorAll('[data-mapmode21]').forEach(b=>b.onclick=()=>this.mapMode21(b.dataset.mapmode21));
 for(const id of ['atlasCenter19','atlasAll19','atlasPlus19','atlasMinus19']){const el=$('#'+id),fn=el.onclick;el.onclick=e=>{this.mapMode21('terrain');fn?.call(el,e);};}
 const input=$('#atlasSearch19'),fn=input.oninput;input.oninput=e=>{this.mapMode21('terrain');fn?.call(input,e);};
 this.mapMode21('terrain');
};
const select=P.fSelectSite;P.fSelectSite=function(...args){if($('#worldArt21'))this.mapMode21('terrain');return select.apply(this,args);};
})();
