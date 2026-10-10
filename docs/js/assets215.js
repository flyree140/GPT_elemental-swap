/* Lazy image catalog: old loaders describe paths without creating network or
   decoding work. Retired hero sheets never become browser Image objects. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,previous=P.loadAssets,NativeImage=window.Image;
P.loadAssets=function(){const mapping=window.ES9_ASSET_URIS,game=this;let described;
 class Descriptor{constructor(){this.src='';this.decoding='async';}}
 try{window.Image=Descriptor;window.ES9_ASSET_URIS={};described=previous.call(this);}finally{window.Image=NativeImage;window.ES9_ASSET_URIS=mapping;}
 const paths={};for(const [key,value]of Object.entries(described)){if(/^(a20_(hero|actor)_|l21_rig_)/.test(key))continue;paths[key]=value.src;}
 for(const id of Object.keys(ES215_RIGS))paths['m215_'+id]='assets/motion215/'+id+'.webp';
 const cache=new Map(),assets={};this.assetCache215=cache;this.assetPaths215=paths;this.assetFailures215=[];
 for(const [key,path]of Object.entries(paths))Object.defineProperty(assets,key,{enumerable:true,get(){const url=window.ES9_ASSET_URIS?.[path]||path;let im=cache.get(url);if(im)return im;im=new NativeImage();im.decoding='async';cache.set(url,im);
 im.addEventListener('load',()=>{const r=game.r214;if(r){if(/^l21_scene_|^t213_coast_sky/.test(key)){r.background.clear();r.bgAt=-1;}if(/^l21_(stone|edge|flora)_|^t213_(hanging|moss|banner|crystal|relic)/.test(key))r.tiles.clear();}if(/^l21_stone_/.test(key)&&game.l21)game.l21.patternContexts=new WeakMap();});
 im.addEventListener('error',()=>game.assetFailures215.push({key,path}));im.src=url;return im;}});
 return assets;};
P.assetReport215=function(){let bytes=0,loaded=0,pending=0;for(const im of this.assetCache215.values()){if(im.naturalWidth){loaded++;bytes+=im.naturalWidth*im.naturalHeight*4;}else pending++;}return{catalogKeys:Object.keys(this.assetPaths215).length,requested:this.assetCache215.size,loaded,pending,decodedRGBABytes:bytes,failures:this.assetFailures215.slice()};};
P.prepareAssets21=async function(){const state=window.ES21_BOOT={version:'21.6.0',status:'loading',ready:0,total:0,failed:[],started:performance.now(),frames:0};
 // Core character sets and low-size terrain are warmed once. Distant panorama,
 // codex, legacy sprites and facility screens are loaded only when used.
 const needed=Object.keys(this.assetPaths215).filter(k=>/^m215_(cartographer|alchemist|artificer|chrono|chef|warden)$|^l21_(weapon_|stone_|edge_|flora_|monster_|attack_|fx_|fixture_)|^t213_/.test(k)&&k!=='t213_world_concept');needed.push('l21_scene_coast','l21_scene_'+this.aTheme());
 const unique=[...new Set(needed)].filter(k=>k in this.assets);state.total=unique.length;let next=0;
 async function load(key,im){let timer;try{await Promise.race([(async()=>{if(!im.complete)await new Promise((ok,no)=>{im.addEventListener('load',ok,{once:true});im.addEventListener('error',no,{once:true});});if(!im.naturalWidth)throw Error(key);await im.decode?.();})(),new Promise((_,no)=>timer=setTimeout(()=>no(Error('逾時')),30000))]);state.ready++;}catch(e){state.failed.push({key,message:String(e)});}finally{clearTimeout(timer);}}
 await Promise.all(Array.from({length:6},async()=>{while(next<unique.length){const k=unique[next++];await load(k,this.assets[k]);}}));
 if(state.failed.length){state.status='failed';throw Error('核心美術載入失敗：'+state.failed.map(x=>x.key).join('、'));}
 this.lInit().patternContexts=new WeakMap();state.status='decoded';state.loadedMs=Math.round(performance.now()-state.started);state.assets=this.assetReport215();
};
})();
