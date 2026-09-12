/*
 * V11「歸燈聚落」— V10 的相容擴充，不替換戰鬥引擎、78 房或 120 技能。
 * art:     tools/draw_sanctuaries.py → assets/sanctuary/*.png
 * state:   progress.haven11（仍用 es10_progress，舊存檔原欄位保留）
 * physics: 家具全為非碰撞互動；僅新增屋頂步道／梯子接口。
 * safety:  一次性獎勵用 room:kind key 去重；所有計時使用 playSeconds，暫停不產出。
 */
(()=>{
'use strict';
const C=window.ES9,W=window.ES9_WORLD,ART=window.ES11_ART,P=window.ES9_ENGINE.Game.prototype;
const $=s=>document.querySelector(s),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;
const inView=(o,g,m=150)=>o.x+o.w>g.camera.x-m&&o.x<g.camera.x+g.viewW+m&&o.y+o.h>g.camera.y-m&&o.y<g.camera.y+g.viewH+m;
const N={
 fridge:['冷藏補給櫃','冷藏食物、玻璃瓶和家常備料。回復生命，每 20 遊戲秒可補給一次。'],
 bed:['鋪被寢床','在此休息，恢復生命、清除異常，保存再次啟動遊戲時的避難所座標。'],
 workbench:['共鳴工作台','工具、零件和圖紙。整備所有六槽技能的冷卻，或直接進入原本的技能工坊。'],
 radio:['短波收音機','掃描相鄰房間與隱藏支線。只顯示情報，不會假裝把能力門解鎖。'],
 locker:['舊式儲物櫃','每個儲物櫃都有獨立編號；零件只能取一次，重新整理也不能重領。'],
 map:['地圖桌','展開原本的有機世界圖；只能快速移動到已經抵達的避難所。'],
 terminal:['維修終端','修好屋頂發電機後，可啟用一段真實可站立的捷徑平台。'],
 stove:['小灶料理台','消耗採集香草製作餐點。料理是探索加成，不是施法資源。'],
 purifier:['雨水淨化器','清除燃燒、毒與蛛網，補少量生命並提供護盾。'],
 shelf:['居民手記書架','第一次翻閱取得地方手記與專精點；之後可隨時進入十職教場。'],
 sofa:['客廳長沙發','休息、回復少量生命、整備冷卻；只在避難所提供，不能戰鬥中遠端使用。'],
 lamp:['暖光落地燈','切換這間避難所的室內燈光。環境亮度不會限制技能。'],
 greenhouse:['屋頂香草苗圃','對苗圃發射自然元素使其生長，再互動採收。每 60 遊戲秒可再收一次。'],
 medbay:['醫護診療床','免費包紮並清除異常；補充防護包可帶著短暫護盾離開。'],
 recycler:['零件回收機','6 零件換 1 專精點。每個回收機限五次，不能無限制洗點。'],
 cabinet:['舊世收藏櫃','取回藏在房間書架、儲物櫃的生活物件後，將它們放上陳列架。'],
 generator:['雙相屋頂機組','先以水元素清洗，再以雷元素通電。真正接收元素彈，不是按鈕直接宣告修好了。'],
 telescope:['崖邊望遠鏡','第一次觀測記錄一段星圖並取得專精點；之後仍可標記周邊路線。']
};
const K=Object.keys(N);
for(const [k,[name,effect]]of Object.entries(N))C.FURNITURE[k]={name,effect};
C.DEFAULT_KEYS.sanctuary='KeyU';C.ACTION_LABELS.sanctuary='避難所日誌';
C.DEFAULT_KEYS.scenic='KeyI';C.ACTION_LABELS.scenic='觀景／介面切換';
const LAYOUTS=[
 [['fridge','stove','locker','sofa','radio'],['bed','workbench','purifier'],['generator','greenhouse']],
 [['fridge','stove','locker','shelf','sofa'],['bed','purifier','cabinet'],['generator','telescope']],
 [['recycler','workbench','locker','radio','map'],['bed','terminal','cabinet'],['generator','telescope']],
 [['fridge','sofa','locker','shelf','radio'],['bed','medbay','cabinet'],['generator','greenhouse']],
 [['medbay','purifier','fridge','locker','radio'],['bed','shelf','cabinet'],['generator','greenhouse']],
 [['workbench','terminal','locker','shelf','sofa'],['bed','recycler','cabinet'],['generator','telescope']]
];
function cleanHome(v){
 const h=v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 for(const k of ['claims','timers','power','lights','steps','grown','bridges','recycled','tokens','rooms'])if(!h[k]||typeof h[k]!=='object'||Array.isArray(h[k]))h[k]={};
 h.herbs=clamp(Math.floor(Number(h.herbs)||0),0,999);h.schema=1;return h;
}
P.home11=function(){return this.progress.haven11=cleanHome(this.progress.haven11);};
const oldLoad=P.loadProgress;
P.loadProgress=function(){const p=oldLoad.call(this);p.haven11=cleanHome(p.haven11);return p;};
const oldAssets=P.loadAssets;
P.loadAssets=function(){const assets=oldAssets.call(this);const paths={};
 for(const[id,a]of Object.entries(ART))paths['house11_'+id]=a.src;
 for(const k of K)paths['fixture11_'+k]='assets/sanctuary/fixture_'+k+'.png';
 for(const k of ['coast','forest','night'])paths['biome11_'+k]='assets/sanctuary/biome_'+k+'.png';
 for(const[k,path]of Object.entries(paths)){const im=new Image();im.src=window.ES9_ASSET_URIS?.[path]||path;im.decoding='async';assets[k]=im;}
 return assets;
};
const oldBuild=P.buildWorld;
P.buildWorld=function(){oldBuild.call(this);this.sceneMode11=false;this.service11=null;this.journalSelect11=0;const home=this.home11();
 // Replace only old furniture scatter; preserve the connected world and all enemies.
 this.furniture=this.furniture.filter(f=>!ART[f.room]);
 Object.entries(ART).forEach(([id,art],index)=>{
  const r=this.roomById.get(id);if(!r)return;const layout=LAYOUTS[index%LAYOUTS.length];
  const floors=this.platforms.filter(s=>s.room===id&&['roomFloor','shelterFloor'].includes(s.type)).sort((a,b)=>b.y-a.y);
  const roof={x:r.x+(floors.length===2?r.w*.38:55),y:r.y+art.roof,w:r.w*.57};
  this.addPlatform(roof.x,roof.y,roof.w,13,'shelterRoof',{oneWay:true,room:id,added11:true});
  // Ladders meet floors/roof through narrow access decks. Avoid unreachable upper stations.
  for(const s of [...floors.slice(1),roof]){const ladderX=r.x+r.w*.22;
   if(s.x>ladderX)this.addPlatform(ladderX-12,s.y,s.x-ladderX+15,13,'accessDeck',{oneWay:true,room:id,added11:true});
  }
  const ladder=this.ladders.find(l=>l.room===id);if(ladder){ladder.y=r.y+art.roof-40;ladder.h=r.floorY-ladder.y-5;}
  function put(game,k,floor,frac,order){
   const footX=floor.x+floor.w*frac,w=88,h=88;
   game.furniture.push({id:game.id(),uid:`${id}:${k}:${order}`,room:id,kind:k,x:footX-w/2,y:floor.y-h,w,h,used:false,refined11:true});
  }
  layout[0].forEach((k,i)=>put(this,k,floors[0],.12+i*.19,i));
  layout[1].forEach((k,i)=>put(this,k,floors[1]||floors[0],.16+i*.33,5+i));
  if(floors[2])['medbay','lamp','terminal'].forEach((k,i)=>put(this,k,floors[2],.16+i*.33,10+i));
  layout[2].forEach((k,i)=>put(this,k,roof,.17+i*.64,15+i));
  // Old relic shrines keep their requirements, but no longer overlap the new living furniture.
  for(const c of this.collectibles.filter(c=>c.room===id)){c.x=roof.x+roof.w*.50-c.w/2;c.y=roof.y-c.h-4;}

  this.npcs.filter(n=>n.room===id).forEach((n,i)=>{n.x=r.x+(i?.60:.06)*r.w;n.y=r.floorY-n.h;});
  if(home.bridges[id])this.installHomeBridge11(id);
 });
 const cp=home.checkpoint;
 if(cp&&this.roomById.get(cp.room)?.shelter&&[cp.x,cp.y].every(Number.isFinite)){
  const safe=this.findSafePosition(cp.x,cp.y,this.player.w,this.player.h);Object.assign(this.player,safe,{vx:0,vy:0,checkpoint:{...safe,room:cp.room}});this.currentRoomId=cp.room;this.currentRegion=this.roomById.get(cp.room).region;
  this.camera.x=clamp(safe.x-this.viewW*.43,0,C.WORLD_W-this.viewW);this.camera.y=clamp(safe.y-this.viewH*.62,0,C.WORLD_H-this.viewH);
 }
};
P.installHomeBridge11=function(id){if(this.platforms.some(s=>s.bridge11===id))return;const r=this.roomById.get(id),art=ART[id];if(!r||!art)return;
 this.addPlatform(r.x+r.w*.45,r.y+art.roof-88,140,14,'poweredDeck',{oneWay:true,room:id,added11:true,bridge11:id});
 this.rings.push({id:this.id(),x:r.x+r.w*.53,y:r.y+art.roof-155,r:18,room:id,added11:true});
};
// ── Economy and idempotence: never grant supplies repeatedly on reload. ────────
P.havenClock11=function(){return Math.max(0,Number(this.progress.playSeconds)||0);};
P.claimHome11=function(key){const h=this.home11();if(h.claims[key])return false;h.claims[key]=true;return true;};
P.havenReady11=function(key){return this.havenClock11()>=Number(this.home11().timers[key]||0);};
P.homeAction11=function(f,action){
 if(!f?.refined11)return false;
 // A service can only be used at the actual physical furnishing.
 if(Math.hypot(cx(this.player)-cx(f),cy(this.player)-cy(f))>130){this.say('請先靠近家具，不能遠端領取補給。',2);return false;}
 const p=this.player,h=this.home11(),id=f.room,key=f.uid,clock=this.havenClock11();let msg='',changed=true;
 const ready=(tag,seconds)=>{const k=key+':'+tag;if(!this.havenReady11(k)){msg=`正在整理；${Math.ceil(h.timers[k]-clock)} 遊戲秒後可再用。`;return false;}h.timers[k]=clock+seconds;return true;};
 const reset=()=>{this.cooldownsM={};p.skillCD=[0,0,0];p.qCD=0;this.linkM=null;};
 if(action==='rest'){
  p.hp=p.maxHp;p.burn=p.poison=p.web=0;reset();p.checkpoint={x:p.x,y:p.y,room:id};h.checkpoint={...p.checkpoint};h.rooms[id]=h.rooms[id]||{};h.rooms[id].rested=true;this.progress.shelters[id]=true;msg='已休息並存檔。重新開啟遊戲會返回這間避難所。';
 }else if(action==='ration'){
  if(ready('ration',20)){p.hp=Math.min(p.maxHp,p.hp+45);if(this.claimHome11(key+':ration')){h.herbs+=2;h.tokens[id]=true;}msg='補充冷藏食物：生命 +45；首次另得 2 份香草與一件生活收藏。';}
 }else if(action==='openLocker'){
  if(this.claimHome11(key+':loot')){this.progress.scrap+=8;h.tokens[id]=true;msg='找到 8 零件和一件生活收藏。此櫃已記錄，不會重領。';}else msg='此櫃已搜尋。零件與收藏已在你的背包。';
 }else if(action==='tune'){reset();p.workT=90;msg='所有技能冷卻已整備。接下來 90 秒 BREAK 傷害 +25%。';
 }else if(action==='mastery'){this.closeModalsM();this.openMastery();return true;
 }else if(action==='school'){this.closeModalsM();this.openSchools();return true;
 }else if(action==='scan'){this.revealNearby(id,2);h.rooms[id]=h.rooms[id]||{};h.rooms[id].scanned=true;msg='短波訊號已標記兩跳以內的房間；能力門仍需自行解開。';
 }else if(action==='map'){this.closeModalsM();this.renderMap();$('#mapPanel').hidden=false;return true;
 }else if(action==='bridge'){
  if(!h.power[id])msg='屋頂雙相機組尚未修好。依序對它發射水 → 雷。';
  else{h.bridges[id]=true;this.installHomeBridge11(id);msg='維修升降支路上線：屋頂多了一段真實可站步道與牽引環。';}
 }else if(action==='cook'){
  if(h.herbs<1)msg='需要 1 份香草；可在冰箱首次領取，或用自然元素催生苗圃。';
  else{h.herbs--;p.hp=Math.min(p.maxHp,p.hp+30);p.foodT=180;msg='野炊完成：生命 +30，180 秒移速 +7%。不影響施法條件。';}
 }else if(action==='purify'){
  if(ready('water',15)){p.burn=p.poison=p.web=0;p.hp=Math.min(p.maxHp,p.hp+18);p.shield=Math.max(p.shield,25);msg='已解除異常、生命 +18，並取得 25 護盾。';}
 }else if(action==='read'){
  if(this.claimHome11(key+':read')){this.progress.lore.push(`V11｜${this.roomById.get(id).name}：停電以後，仍有人替下一個旅人留了一盞燈。`);h.tokens[id]=true;this.mAward('home11:book:'+key,2,0);msg='讀到居民手記：新增生活收藏與 2 專精點。';}else msg='「別把這裡當成終點。等雨停了，帶上地圖去更高的地方。」';
 }else if(action==='sit'){reset();p.hp=Math.min(p.maxHp,p.hp+20);msg='短暫休息：生命 +20、全部技能冷卻歸零。';
 }else if(action==='lights'){h.lights[id]=h.lights[id]===false;msg=h.lights[id]?'室內暖燈已亮起。':'關閉局部暖燈；平台與角色仍保持可讀。';
 }else if(action==='growInfo'){msg='離開面板，對苗圃按 9 發射自然元素。葉片會長高，再按 E 採收。';
 }else if(action==='harvest'){
  if(!h.grown[key])msg='尚未催生。先對苗圃發射自然元素。';
  else if(ready('harvest',60)){h.herbs+=2;msg='採得 2 份香草，可拿到爐灶料理。60 遊戲秒後可再收。';}
 }else if(action==='heal'){p.hp=p.maxHp;p.burn=p.poison=p.web=0;msg='包紮完成：完全治療、解除異常。';
 }else if(action==='recycle'){
  const n=h.recycled[key]||0;
  if(n>=5)msg='這部機器的五份研究模組已換完。';else if(this.progress.scrap<6)msg='需要 6 零件；戰鬥、解謎和搜索櫃子可取得。';else{this.progress.scrap-=6;h.recycled[key]=n+1;this.mAward(`home11:recycle:${key}:${n}`,1,0);msg=`換得 1 專精點（本機 ${n+1}/5）。`;}
 }else if(action==='display'){
  if(!h.tokens[id])msg='還沒有這間避難所的生活收藏，先翻閱書架、冰箱或儲物櫃。';
  else if(this.claimHome11(key+':display')){this.mAward('home11:display:'+key,2,0);msg='收藏入櫃：取得 2 專精點，展示品會永久留下。';}else msg='生活收藏已陳列。它記錄著此地曾有人生活。';
 }else if(action==='powerInfo'){msg=h.power[id]?'屋頂機組已修復；去維修終端開啟捷徑。':`修復步驟 ${(h.steps[id]||0)===0?'1：水（6）清洗':'2：雷（3）通電'}。請關閉面板後射擊機組。`;
 }else if(action==='observe'){
  this.revealNearby(id,3);if(this.claimHome11(key+':star')){this.mAward('home11:star:'+key,2,0);this.progress.lore.push('V11｜星圖：最亮的一點並非出口，而是下一位旅人的燈。');msg='星圖記錄完成：2 專精點、標記三跳內房間。';}else msg='觀測已完成，附近的未知地帶已標記在地圖上。';
 }else{changed=false;msg='未知操作，未更動存檔。';}
 if(changed)this.saveProgress();this.serviceMessage11=msg;this.say(msg,3,'#edd1a0');if(!$('#servicePanel').hidden)this.renderService11();return changed;
};
P.homeElement11=function(f,element){
 const h=this.home11();if(f.kind==='generator'){
  if(h.power[f.room])return false;const expected=(h.steps[f.room]||0)===0?'water':'lightning';
  if(element===expected){h.steps[f.room]=(h.steps[f.room]||0)+1;
   if(h.steps[f.room]>=2){h.power[f.room]=true;this.mAward('home11:power:'+f.room,3,0);this.say('雙相機組恢復！取得 3 專精點，終端可啟用屋頂捷徑。',3,'#afd4aa');}
   else this.say('水路已清洗。接著發射雷元素（3）通電。',2.5,'#b0d4da');
  }else{h.steps[f.room]=0;this.say('機組順序：水（6）→ 雷（3），請重新清洗。',2.2,'#e1ba85');}
  this.addFx('ring',cx(f),cy(f),.45,.9,'#e0c589');this.saveProgress();return true;
 }
 if(f.kind==='greenhouse'&&element==='nature'){h.grown[f.uid]=true;this.saveProgress();this.addFx('ring',cx(f),cy(f),.4,.8,'#a5c789');this.say('苗圃已長葉；靠近按 E 採收香草。',2.4);return true;}
 return false;
};
const oldElements=P.updateElements;
P.updateElements=function(dt){
 // Swept bounds cover slow shots across a frame; one hit consumes that projectile.
 for(const s of this.elementShots){if(s.t<=0||s.stuck)continue;
  for(const f of this.furniture){if(!f.refined11||!['generator','greenhouse'].includes(f.kind))continue;
   const nx=s.x+(s.vx||0)*dt,ny=s.y+(s.vy||0)*dt;
   if(Math.min(s.x,nx)<f.x+f.w&&Math.max(s.x,nx)+s.w>f.x&&Math.min(s.y,ny)<f.y+f.h&&Math.max(s.y,ny)+s.h>f.y){if(this.homeElement11(f,s.element)){s.t=0;break;}}
  }
 }
 return oldElements.call(this,dt);
};
const oldDamage=P.damageEnemy;
P.damageEnemy=function(e,dmg,kx=0,ky=0,def={}){if(this.player.workT>0)def={...def,br:(def.br||0)*1.25};return oldDamage.call(this,e,dmg,kx,ky,def);};
// ── Functional service UI. No action occurs merely from opening the panel. ─────
const ACT={
 fridge:[['ration','補充食物','生命 +45 · 首次 2 香草／收藏']],bed:[['rest','休息與存檔','完全治療 · 保存重生點']],
 workbench:[['mastery','進入技能工坊','原本 120 技能與 A/B 分支'],['tune','整備裝備','清冷卻 · 90 秒 BREAK +25%']],
 radio:[['scan','搜尋短波訊號','標記相鄰兩跳房間']],locker:[['openLocker','搜索儲物櫃','一次性：8 零件／收藏']],
 map:[['map','展開世界地圖','已發現避難所快速移動']],terminal:[['bridge','啟動屋頂步道','前提：修復雙相機組']],
 stove:[['cook','烹煮香草暖湯','消耗 1 香草 · 生命 +30／移速 +7%']],purifier:[['purify','飲用淨水','解除異常 · 生命 +18／25 護盾']],
 shelf:[['read','翻閱居民手記','首次：2 專精點／收藏'],['school','前往職業研習','十職六階段實作教學']],
 sofa:[['sit','坐下歇息','生命 +20／清冷卻']],lamp:[['lights','切換室內燈','生活氛圍，不改角色視野']],
 greenhouse:[['harvest','採收香草','自然催生後：2 香草／60 遊戲秒'],['growInfo','怎麼催生？','用自然元素（9）擊中苗圃']],
 medbay:[['heal','接受包紮','完全治療／解除異常']],recycler:[['recycle','重組研究模組','6 零件 → 1 專精點 · 限五次']],
 cabinet:[['display','陳列生活收藏','取得本地收藏後：首次 2 專精點']],generator:[['powerInfo','查看機組線路','水（6）清洗 → 雷（3）通電']],
 telescope:[['observe','記錄星圖','標記三跳房間 · 首次 2 專精點']]
};
P.openService11=function(f){this.closeModalsM();this.service11=f;this.serviceChoice11=0;this.serviceMessage11='';$('#servicePanel').hidden=false;this.renderService11();};
// Compose the catalogue thumbnail from the same building + placed furniture as the game.
P.posterHome11=function(id){
 const r=this.roomById.get(id),base=this.assets['house11_'+id];if(!base?.naturalWidth)return base?.src||'';
 this.posters11=this.posters11||{};if(this.posters11[id])return this.posters11[id];
 const c=document.createElement('canvas');c.width=r.w;c.height=r.h;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(base,0,0,r.w,r.h);
 for(const f of this.furniture.filter(f=>f.room===id&&f.refined11)){const im=this.assets['fixture11_'+f.kind];if(im?.naturalWidth)ctx.drawImage(im,cx(f)-48-r.x,f.y+f.h-95-r.y,96,96);}
 try{return this.posters11[id]=c.toDataURL('image/png');}catch{return base.src;}
};
P.renderService11=function(){const f=this.service11;if(!f)return;const h=this.home11(),r=this.roomById.get(f.room),[name,desc]=N[f.kind];
 $('#serviceRoom').textContent=r.name+' / '+(ART[f.room]?.theme||'haven');$('#serviceTitle').textContent=name;$('#serviceDesc').textContent=desc;
 $('#serviceImage').src=this.assets['fixture11_'+f.kind].src;$('#serviceScene').src=this.posterHome11(f.room);
 $('#serviceInventory').textContent=`零件 ${this.progress.scrap}　香草 ${h.herbs}　專精點 ${this.mState().points}`;
 $('#serviceNotice').textContent=this.serviceMessage11||'操作會存入原 V10 進度。Esc 返回遊戲。';
 const statuses=[];if(f.kind==='generator')statuses.push(h.power[f.room]?'機組已修復':`步驟 ${Math.min(1,h.steps[f.room]||0)+1}/2：${h.steps[f.room]?'雷元素':'水元素'}`);
 if(f.kind==='greenhouse')statuses.push(h.grown[f.uid]?'已催生':'尚未催生');
 if(f.kind==='locker')statuses.push(h.claims[f.uid+':loot']?'已領取（永久記錄）':'尚未搜尋');
 if(f.kind==='recycler')statuses.push(`已兌換 ${h.recycled[f.uid]||0}/5 次`);
 if(f.kind==='cabinet')statuses.push(h.claims[f.uid+':display']?'已陳列':h.tokens[f.room]?'可陳列':'未取得本地收藏');
 if(f.kind==='lamp')statuses.push(h.lights[f.room]!==false?'燈亮':'熄燈');
 $('#serviceStatus').textContent=statuses.join(' · ')||'可用設施';
 const box=$('#serviceActions');box.replaceChildren();(ACT[f.kind]||[]).forEach(([id,label,detail],i)=>{const b=document.createElement('button');b.className='service-action'+(i===this.serviceChoice11?' chosen':'');
 b.innerHTML=`<span class="service-number">${String(i+1).padStart(2,'0')}</span><span><strong>${label}</strong><small>${detail}</small></span><span>↵</span>`;
 b.onclick=()=>{this.serviceChoice11=i;this.homeAction11(f,id);};box.appendChild(b);});
};
const oldFurniture=P.useFurniture;
P.useFurniture=function(f){if(f.refined11){this.openService11(f);return;}return oldFurniture.call(this,f);};
const oldNPC=P.useNPC;
P.useNPC=function(n){if(!ART[n.room]||n.role==='masterMentor'||n.role==='trainer')return oldNPC.call(this,n);
 const byRole={medic:'medbay',mechanic:'workbench',cartographer:'map',quartermaster:'recycler',archivist:'shelf',gardener:'greenhouse',ranger:'telescope'};
 const station=this.furniture.find(f=>f.room===n.room&&f.kind===byRole[n.role]);
 if(station){this.say(`${n.name}｜${N[station.kind][0]}在${cx(station)<cx(n)?'左':'右'}${Math.abs(cy(station)-cy(n))>100?'側上層':'側'}，靠近按 E 使用。`,4,'#e2cca6');return;}
 return oldNPC.call(this,n);
};
P.openJournal11=function(){this.closeModalsM();$('#sanctuaryPanel').hidden=false;this.renderJournal11();};
P.renderJournal11=function(){const h=this.home11(),ids=Object.keys(ART);$('#havenSummary').textContent=`18 處既有避難所 · 已抵達 ${ids.filter(id=>this.progress.shelters[id]).length} · 已修復機組 ${ids.filter(id=>h.power[id]).length} · 只改避難所，不取代既有世界。`;
 const box=$('#havenDirectory');box.replaceChildren();ids.forEach((id,i)=>{const r=this.roomById.get(id),seen=!!this.progress.shelters[id];const b=document.createElement('button');b.className='haven-card'+(i===this.journalSelect11?' chosen':'')+(seen?'':' locked');b.innerHTML=`<img src="${this.posterHome11(id)}" alt="${r.name}剖面"><span><small>${String(i+1).padStart(2,'0')} / ${seen?'已抵達':'尚未抵達'}</small><strong>${r.name}</strong><em>${h.power[id]?'● 機組運作中':'○ 水 → 雷修復'} · ${this.furniture.filter(f=>f.room===id).length} 件可互動設施</em></span>`;
 b.onclick=()=>{this.journalSelect11=i;this.havenTravel11(id);};box.appendChild(b);});};
P.havenTravel11=function(id){if(!this.progress.shelters[id]){this.say('尚未抵達：請沿原世界路線探索，不能跳過能力門。',3);$('#havenSummary').textContent='此避難所尚未抵達，暫時不能快速移動。';return false;}
 if(this.trainingM){$('#havenSummary').textContent='請先用 Backspace 離開教場，再使用快速移動。';return false;}
 const r=this.roomById.get(id);if(!r)return false;const p=this.player,safe=this.findSafePosition(r.x+90,r.floorY-p.h-3,p.w,p.h);Object.assign(p,safe,{vx:0,vy:0,inv:1});this.currentRoomId=id;this.currentRegion=r.region;this.closeModalsM();this.camera.x=clamp(r.x+r.w/2-this.viewW/2,0,C.WORLD_W-this.viewW);this.camera.y=clamp(safe.y-this.viewH*.67,0,C.WORLD_H-this.viewH);return true;
};
// ── Draw hooks. All combat/actor sprite pixels remain the V10 originals. ───────
const oldBg=P.drawBackground;
P.drawBackground=function(ctx,w,h){const art=ART[this.currentRoomId];if(!art)return oldBg.call(this,ctx,w,h);const im=this.assets['biome11_'+art.theme];if(!im?.naturalWidth)return oldBg.call(this,ctx,w,h);
 ctx.save();const tw=w*1.08,th=Math.max(h,tw*.625),ox=-((this.camera.x*.018)%Math.max(1,tw-w));ctx.imageSmoothingEnabled=false;ctx.drawImage(im,ox,(h-th)*.25,tw,th);ctx.restore();};
const oldRooms=P.drawRooms;
P.drawRooms=function(ctx){const all=this.rooms;try{this.rooms=all.filter(r=>!ART[r.id]);oldRooms.call(this,ctx);}finally{this.rooms=all;}
 const home=this.home11();for(const r of all){if(!ART[r.id]||!inView(r,this,60))continue;const im=this.assets['house11_'+r.id];if(!im?.naturalWidth)continue;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,r.x,r.y,r.w,r.h);
  // Light stays behind actors: each floor gets a narrow lamp bloom, not a full-screen fog.
  if(home.lights[r.id]!==false){for(const [i,off]of ART[r.id].floors.entries()){
   const x=r.x+(i>0?(i%2?.66:.37):.5)*r.w,y=r.y+off-178;
   const g=ctx.createRadialGradient(x,y,2,x,y,128);g.addColorStop(0,'rgba(255,210,120,0.24)');g.addColorStop(1,'rgba(255,210,120,0)');ctx.fillStyle=g;ctx.fillRect(x-128,y-100,256,230);
   ctx.fillStyle='#ffebb0';ctx.fillRect(x-5,y+6,10,3);
  }}
  ctx.restore();}
};
const oldCamera=P.updateCamera;
P.updateCamera=function(dt){if(!this.sceneMode11||!ART[this.currentRoomId])return oldCamera.call(this,dt);
 const r=this.roomById.get(this.currentRoomId),t=1-Math.exp(-dt*10);
 const x=clamp(r.x+r.w/2-this.viewW/2,0,C.WORLD_W-this.viewW),y=clamp(r.y+r.h/2-this.viewH/2-8,0,C.WORLD_H-this.viewH);
 this.camera.x+=(x-this.camera.x)*t;this.camera.y+=(y-this.camera.y)*t;
};
const oldIndicators=P.drawIndicators;
P.drawIndicators=function(ctx,w,h){if(!this.sceneMode11)oldIndicators.call(this,ctx,w,h);};
const oldFG=P.drawForeground;
P.drawForeground=function(ctx,w,h){if(!ART[this.currentRoomId])return oldFG.call(this,ctx,w,h);
 // No foreground pillars across the player's path. Sparse fireflies / rain only at edges.
 ctx.save();ctx.fillStyle='rgba(228,237,194,.34)';for(let i=0;i<10;i++){const x=(i*173+this.time*7)%w,y=75+(i*71%Math.max(100,h-160))+Math.sin(this.time+i)*7;ctx.fillRect(x,y,2,2);}ctx.restore();};
const oldFurnDraw=P.drawFurniture;
P.drawFurniture=function(ctx){const all=this.furniture;try{this.furniture=all.filter(f=>!f.refined11);oldFurnDraw.call(this,ctx);}finally{this.furniture=all;}
 const h=this.home11();for(const f of all){if(!f.refined11||!inView(f,this,45))continue;const im=this.assets['fixture11_'+f.kind];if(!im?.naturalWidth)continue;
  const dw=96,dh=96,x=cx(f)-dw/2,y=f.y+f.h-dh+1;ctx.save();ctx.imageSmoothingEnabled=false;
  if(this.nearInteract?.ref===f){ctx.shadowColor='#f4d797';ctx.shadowBlur=10;ctx.strokeStyle='#e6cd8f';ctx.lineWidth=1.5;ctx.strokeRect(x-3,y-3,dw+6,dh+6);}
  ctx.drawImage(im,x,y,dw,dh);ctx.shadowBlur=0;
  if(f.kind==='generator'){const color=h.power[f.room]?'#9edaac':'#e9b772';ctx.fillStyle=color;ctx.fillRect(x+15,y+72,5,4);if(!h.power[f.room]){ctx.fillStyle='#f4e2b8';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(h.steps[f.room]?'3 雷通電':'6 水清洗',cx(f),y-10);}}
  if(f.kind==='greenhouse'&&h.grown[f.uid]){ctx.fillStyle='#bddb86';for(let n=0;n<4;n++){ctx.fillRect(x+21+n*12,y+15-Math.sin(this.time*2+n)*3,4,5);}ctx.fillStyle='#d4e8ac';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('可採收',cx(f),y-7);}
  if(f.kind==='cabinet'&&h.claims[f.uid+':display']){ctx.fillStyle='#f8dc91';ctx.fillRect(x+43,y+25,9,12);}
  if(f.kind==='stove'){ctx.fillStyle='rgba(230,230,197,.32)';for(let j=0;j<3;j++){const rise=(this.time*13+j*8)%24;ctx.fillRect(x+40+Math.sin(this.time+j)*3,y+25-rise,2,4);}}
  if(f.kind==='radio'&&(h.rooms[f.room]||{}).scanned){ctx.strokeStyle='#afcfc4';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+71,y+15,7+(this.time%1)*8,-.8,.8);ctx.stroke();}
  if(this.nearInteract?.ref===f){ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f3ddb3';ctx.strokeStyle='#183437';ctx.lineWidth=4;ctx.strokeText(N[f.kind][0],cx(f),y-12);ctx.fillText(N[f.kind][0],cx(f),y-12);}
  ctx.restore();}
};
const oldUI=P.updateUI;
P.updateUI=function(){oldUI.call(this);const r=this.roomById.get(this.currentRoomId);document.body.classList.toggle('inside-haven',!!ART[r?.id]);
 const h=this.home11();if(ART[r?.id]&&!this.trainingM){const task=!h.rooms[r.id]?.rested?['讓旅人有一盞歸燈','先靠近床鋪按 E 休息並保存重生點。']:!h.power[r.id]?['修好這裡的生活機組','沿梯子上屋頂：水（6）清洗 → 雷（3）通電。']:!h.rooms[r.id]?.scanned?['聽見下一個避難所','使用短波收音機標記周邊房間與支線。']:['暖燈已備妥','U 查看避難所日誌；沿原世界繼續探索與戰鬥。'];
  $('#objectiveTitle').textContent=task[0];$('#objectiveText').textContent=task[1];
 }
 $('#havenBadge').hidden=!ART[r?.id];$('#havenBadge').textContent=`E 家具互動　U 避難所日誌　I 觀景　│　香草 ${h.herbs} · 零件 ${this.progress.scrap}`;
 document.body.classList.toggle('scenic11',!!this.sceneMode11);
};
const oldGlobal=P.updateGlobalInput;
P.updateGlobalInput=function(){if(this.key('sanctuary',true)){this.openJournal11();return;}if(this.key('scenic',true))this.sceneMode11=!this.sceneMode11;oldGlobal.call(this);};
const oldBind=P.bindUI;
P.bindUI=function(){oldBind.call(this);$('#havenButton').onclick=()=>this.openJournal11();$('#scenicButton').onclick=()=>{this.sceneMode11=!this.sceneMode11;this.updateUI();};$('#serviceClose').onclick=()=>this.closeModalsM();$('#sanctuaryClose').onclick=()=>this.closeModalsM();
 // Capture prevents Enter from also activating a previously focused browser button.
 addEventListener('keydown',e=>{
  const service=!$('#servicePanel').hidden,journal=!$('#sanctuaryPanel').hidden;if(!service&&!journal)return;
  if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape','KeyE','KeyU'].includes(e.code))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'||e.code==='KeyE'||e.code==='KeyU'){this.closeModalsM();return;}
  if(service){const arr=ACT[this.service11.kind]||[];if(e.code==='Enter'){this.homeAction11(this.service11,arr[this.serviceChoice11][0]);return;}this.serviceChoice11=(this.serviceChoice11+(['ArrowUp','ArrowLeft'].includes(e.code)?-1:1)+arr.length)%arr.length;this.renderService11();}
  else{const ids=Object.keys(ART);if(e.code==='Enter'){this.havenTravel11(ids[this.journalSelect11]);return;}this.journalSelect11=(this.journalSelect11+(['ArrowUp','ArrowLeft'].includes(e.code)?-1:1)+ids.length)%ids.length;this.renderJournal11();$('#havenDirectory').children[this.journalSelect11]?.scrollIntoView({block:'nearest'});}
 },{capture:true});
};
window.ES11_HAVEN={fixtures:N,actions:ACT,art:ART};
})();
