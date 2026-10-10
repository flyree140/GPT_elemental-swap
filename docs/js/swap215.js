/* 21.5: air/ground share the SAME rules. Charges recover in gameplay time,
   not by camping on a special platform. Failed swaps are atomic: no charge,
   no target destruction, no partial relocation. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,C=ES9,REFILL=1.25;
const cx=o=>o.x+(o.w||0)/2,cy=o=>o.y+(o.h||0)/2,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
Object.assign(C.DEFAULT_KEYS,{swapNow:'KeyD',recastAnchor:'KeyS'});Object.assign(C.ACTION_LABELS,{swapNow:'立即換位（目前元素）',recastAnchor:'重新瞄準發射（不補充換位）'});
const keys=P.loadKeys;P.loadKeys=function(){const k=keys.call(this);k.swapNow??='KeyD';k.recastAnchor??='KeyS';return k;};
P.swapState214=function(){return this.swapEconomy214||(this.swapEconomy214={used:0,recharge:0,lastSuccess:-100,lastFire:-100,successes:0,rejections:0,lastResult:'ready',chain:1});};
P.swapCap214=function(id=this.currentElement){const r=Number(this.xState().elements[id]?.rank)||0;return r>=3?3:r>=2?2:1;};
P.swapRemaining214=function(id=this.currentElement){return Math.max(0,this.swapCap214(id)-this.swapState214().used);};
P.findElementTarget=function(id){const p=this.player,epoch=this.nInit().epoch,layer=this.vLayer();let best=null;
 // Prefer the anchor the user actually fired, not an unrelated marked monster.
 for(const s of this.elementShots)if(s.t>0&&s.anchor&&s.element===id&&(s.epoch18===undefined||s.epoch18===epoch)&&Math.hypot(cx(p)-cx(s),cy(p)-cy(s))<2000&&((s.v16Layer||'B')===layer||id==='shadow')&&(!best||s.id>best.id))best=s;
 if(best)return{kind:'shot',ref:best};let d=Infinity;
 for(const e of this.enemies){if(e.dead||e.mark!==id||e.markT<=0||!this.vCanHit(e))continue;const dd=Math.hypot(cx(p)-cx(e),cy(p)-cy(e));if(dd<1800&&dd<d){d=dd;best=e;}}
 if(best)return{kind:'enemy',ref:best};
 for(const s of this.enemyShots)if(s.t>0&&s.v16FrozenUntil>this.time&&s.v16Mark===id&&this.vCanHit(s)&&Math.hypot(cx(p)-cx(s),cy(p)-cy(s))<1500)return{kind:'frozen',ref:s};
 return null;};
const fire=P.fireElement;P.fireElement=function(el,index){const st=this.swapState214();if(this.time-st.lastFire<.13)return false;const before=this.elementShots.length;fire.call(this,el,index);if(this.elementShots.length<=before)return false;const s=this.elementShots.at(-1),p=this.player;
 // One intentional anchor per element. Re-aim replaces it without restoring charge.
 for(const q of this.elementShots)if(q!==s&&q.element===el.id&&q.anchor)q.t=0;
 let dx=(this.key('right')?1:0)-(this.key('left')?1:0),dy=(this.key('down')?1:0)-(this.key('up')?1:0);
 if(this._firePointer215&&this.pointer215){dx=this.pointer215.x-cx(p);dy=this.pointer215.y-cy(p);}else if(!dx&&!dy)dx=p.dir||1;
 const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;Object.assign(s,{x:cx(p)+dx*30-s.w/2,y:cy(p)+dy*30-s.h/2,vx:dx*430,vy:dy*430,t:9,expires215:this.time+9,freeAnchor215:true,stuck:false,anchor:true,epoch18:this.nInit().epoch,v16Layer:this.vLayer()});st.lastFire=this.time;st.lastResult='fired';
 this.say(`${el.name}已發射｜再按 ${index===9?0:index+1} 或 D 換位 · S 重新瞄準`,1.4,el.color);return true;};
const elements=P.updateElements;P.updateElements=function(dt){for(const s of this.elementShots)if(s.freeAnchor215&&!s.stuck){const e=C.ELEMENTS.find(e=>e.id===s.element);s.vy-=(e?.gravity||0)*dt;}const result=elements.call(this,dt);for(const s of this.elementShots)if(s.freeAnchor215&&s.expires215!==undefined)s.t=Math.min(s.t,Math.max(0,s.expires215-this.time));return result;};
P.swapLanding215=function(x,y,w,h){if(![x,y,w,h].every(Number.isFinite))return null;const solids=this.activePlatforms({x:x-90,y:y-90,w:w+180,h:h+180}),cand=[[0,0]];
 for(const r of [6,12,20,32,48,64,80])for(const [dx,dy]of [[0,-r],[-r,0],[r,0],[-r*.7,-r*.7],[r*.7,-r*.7],[0,r]])cand.push([dx,dy]);
 for(const [dx,dy]of cand){const q={x:x+dx,y:y+dy,w,h};if(q.x<3||q.y<3||q.x+w>C.WORLD_W-3||q.y+h>C.WORLD_H-3)continue;if(!solids.some(s=>s.active!==false&&hit(q,s)))return{x:q.x,y:q.y};}return null;};
P.swapPlan215=function(target){const p=this.player,q=target?.ref;if(!q||q.dead||q.t<=0||(q.epoch18!==undefined&&q.epoch18!==this.nInit().epoch))return{ok:false,reason:'expired'};
 if(Math.hypot(cx(q)-cx(p),cy(q)-cy(p))>2050)return{ok:false,reason:'range'};
 // Fixed bosses are a blink destination. Moving their huge collision box is NOT
 // a prerequisite for player mobility; BREAK still permits a full exchange.
 const fixed=target.kind==='enemy'&&(q.xBoss||q.type==='sentinel')&&!(q.breakStun>0),old={x:p.x,y:p.y,cx:cx(p),cy:cy(p)};
 const want={x:fixed?(cx(p)<cx(q)?q.x-p.w-10:q.x+q.w+10):cx(q)-p.w/2,y:target.kind==='enemy'?q.y+q.h-p.h:cy(q)-p.h/2};
 const dest=this.swapLanding215(want.x,want.y,p.w,p.h);if(!dest)return{ok:false,reason:'solid'};
 if(this.nGatePath(old,dest,p.w,p.h))return{ok:false,reason:'gate'};
 const back=fixed?null:target.kind==='enemy'?this.swapLanding215(old.cx-q.w/2,old.y+p.h-q.h,q.w,q.h):{x:old.cx-q.w/2,y:old.cy-q.h/2};
 if(!fixed&&!back)return{ok:false,reason:'return-solid'};return{ok:true,dest,back,fixed,old};};
P.swapElement=function(target,el,index){const st=this.swapState214(),p=this.player;if(!el||!target?.ref)return false;
 if(this.swapRemaining214(el.id)<=0){st.lastResult='recharging';this.say(`換位回充中 ${(REFILL-st.recharge).toFixed(1)} 秒｜空中也會恢復，不必落地`,.8,el.color);return false;}
 if(this.time-st.lastSuccess<.075){st.lastResult='debounce';return false;}
 const plan=this.swapPlan215(target);if(!plan.ok){st.rejections++;st.lastResult=plan.reason;const msg={expired:'錨點已消失，請重新發射',range:'錨點太遠，請重新發射',solid:'落點在實心牆內，按 S 重新瞄準',gate:'尚未開啟的實體門擋住兩端', 'return-solid':'原位置容不下目標，請稍微移開'};this.say((msg[plan.reason]||'目前無法換位')+'｜未扣次數',1.2,el.color);return false;}
 const q=target.ref,vx=p.vx,vy=p.vy;if(!plan.fixed){Object.assign(q,plan.back,{vx:0,vy:0});if(target.kind==='shot'){q.stuck=true;q.anchor=true;q.t=Math.max(q.t,9);q.expires215=this.time+9;q.trail=[];}else{q.stun=Math.max(q.stun||0,.25);q.mark=el.id;q.markT=Math.max(q.markT||0,3);}}
 Object.assign(p,plan.dest,{vx:cl(vx,-520,520),vy:cl(vy,-600,180),onGround:false,coyote:0,inv:Math.max(p.inv||0,.30),dashT:0,grapple:null});p.airDashes=Math.max(p.airDashes,1);p.attack=null;p.buffer=null;p.history='';p.castT=0;this.nCancelHolds?.();this.pendingM=this.linkM=null;
 if(st.used===0)st.recharge=0;st.used=Math.min(3,st.used+1);st.lastSuccess=this.time;st.successes++;st.lastResult=plan.fixed?'boss-blink':'success';
 this.lastSwap=el.id;this.vInit().discontinuity=true;this.vInit().lastSwapAt=this.time;this.elementSwapEffect(el,plan.old,{x:cx(p),y:cy(p)});this.resonanceM={element:el.id,until:this.time+3};this.mEmit('swap',{element:el.id,kind:target.kind});this.vEmit?.('swap',{distance:Math.hypot(p.x-plan.old.x,p.y-plan.old.y)});this.checkElementCombo(el.id);this.sfx.swap(index);this.vBurst(plan.old.cx,plan.old.cy,el.color,70);this.vBurst(cx(p),cy(p),el.color,70);this.nEvent?.('swap',el.id);
 this.swapFlash215={old:plan.old,now:{x:cx(p),y:cy(p)},at:this.time,color:el.color};this.say(`${plan.fixed?'頭目側身換位':el.name+'換位'}｜剩 ${this.swapRemaining214(el.id)}/${this.swapCap214(el.id)} · 每 ${REFILL} 秒回復 1 次`,.85,el.color);return true;};
P.elementPress=function(i){const el=C.ELEMENTS[i];if(!el)return false;this.currentElement=el.id;const t=this.findElementTarget(el.id);return t?this.swapElement(t,el,i):this.fireElement(el,i);};
P.tickSwap215=function(dt){if(!(dt>0)||this.paused||this.modalM())return;const st=this.swapState214();if(st.used>0){st.recharge+=dt;while(st.recharge+1e-9>=REFILL&&st.used>0){st.recharge=Math.max(0,st.recharge-REFILL);st.used--;st.chain++;st.lastResult='refill';}if(st.used===0)st.recharge=0;}};
const update=P.update;P.update=function(dt,ts){if(dt>0&&!this.paused&&!this.modalM()){this.tickSwap215(dt);const el=C.ELEMENTS.find(e=>e.id===this.currentElement)||C.ELEMENTS[0],i=C.ELEMENTS.indexOf(el);
 if(this.key('recastAnchor',true))this.fireElement(el,i);
 if(this.key('swapNow',true)){const target=this.findElementTarget(el.id);if(target)this.swapElement(target,el,i);else this.fireElement(el,i);}}
 return update.call(this,dt,ts);};
const draw=P.drawProjectiles;P.drawProjectiles=function(c){draw.call(this,c);const target=this.findElementTarget(this.currentElement),st=this.swapState214();if(target&&(target.ref.id!==this.swapPreviewId215||performance.now()>(this.swapPreviewAt215||0))){this.swapPreviewAt215=performance.now()+90;this.swapPreviewId215=target.ref.id;this.swapPreview215=this.swapPlan215(target);}const plan=this.swapPreview215;if(target&&plan?.dest){const d=plan.dest,col=this.swapRemaining214()>0?'#abefe6':'#f0bca1';c.save();c.strokeStyle=col;c.globalAlpha=.7;c.lineWidth=1.5;c.setLineDash([4,5]);c.strokeRect(d.x-2,d.y-2,this.player.w+4,this.player.h+4);c.setLineDash([]);c.fillStyle=col;c.beginPath();c.moveTo(d.x+this.player.w/2-4,d.y-9);c.lineTo(d.x+this.player.w/2+4,d.y-9);c.lineTo(d.x+this.player.w/2,d.y-4);c.fill();c.restore();}
 const f=this.swapFlash215;if(f&&this.time-f.at<.18){c.save();c.strokeStyle=f.color;c.globalAlpha=(1-(this.time-f.at)/.18)*.6;c.lineWidth=2;c.beginPath();c.moveTo(f.old.cx,f.old.cy);c.lineTo(f.now.x,f.now.y);c.stroke();c.restore();}};
const ui=P.updateUI;P.updateUI=function(){ui.call(this);const st=this.swapState214(),cap=this.swapCap214(),left=this.swapRemaining214(),b=document.getElementById('swapBudget214'),progress=st.used?cl(st.recharge/REFILL,0,1):1;
 if(b){const text=`換位 ${'◆'.repeat(left)}${'◇'.repeat(cap-left)}　${left}/${cap}`;b.querySelector('b').textContent=text;b.classList.toggle('exhausted',left===0);b.querySelector('small').textContent=st.used?`${(REFILL-st.recharge).toFixed(1)} 秒回復 1 次 · 空中照常回充`:'空中可用 · 同數字／D 換位 · S 重射';b.style.setProperty('--charge',progress);}
 const d=document.getElementById('elementDesc');if(d)d.textContent='方向鍵八向瞄準 · 同數字／D 換位 · S 重射 · 空中回充';};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);const b=document.createElement('div');b.id='swapBudget214';b.innerHTML='<b></b><small></small><i></i>';b.setAttribute('aria-label','空中換位剩餘次數與回充');document.querySelector('.game-frame')?.append(b);
 document.querySelector('#helpPanel .help-grid')?.insertAdjacentHTML('afterbegin',`<article><h3>空中自由換位</h3><p>1–0 發射目前方向的錨點，再按同數字或 D 立即換位。S 重新瞄準發射，不補充次數。方向鍵支援正上、正下與八向；滑鼠右鍵可往游標發射／換位。</p><p>Lv.0／1 最多 1 次、Lv.2 最多 2 次、Lv.3／4 最多 3 次。消耗在十元素間共用，每 ${REFILL} 秒回復 1 次，跑步、跳躍與下落都能回充。只有實心牆、封閉門及容量不足會阻擋；失敗不扣次數、不刪錨點。未 BREAK 的大型頭目改為移到其側邊，不再拒絕玩家移動。</p></article>`);
 const parent=document.getElementById('touchControls'),tools=parent?document.createElement('div'):null;if(tools){tools.className='touch-swap215';parent.append(tools);for(const [action,label]of [['swapNow','換位 D'],['recastAnchor','重射 S']]){const bt=document.createElement('button');bt.textContent=label;bt.dataset.touch=action;tools.append(bt);}this.xBindTouch?.(tools);}
 const canvas=this.canvas;canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();this.pointer215={x:(e.clientX-r.left)*this.viewW/r.width+this.camera.x,y:(e.clientY-r.top)*this.viewH/r.height+this.camera.y};});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(e.button!==2||this.paused||this.modalM())return;e.preventDefault();const el=C.ELEMENTS.find(q=>q.id===this.currentElement)||C.ELEMENTS[0];this._firePointer215=true;try{this.elementPress(C.ELEMENTS.indexOf(el));}finally{this._firePointer215=false;}});
};
window.ES215_SWAP={rechargeSeconds:REFILL,airRefill:true,groundRequired:false};
})();
