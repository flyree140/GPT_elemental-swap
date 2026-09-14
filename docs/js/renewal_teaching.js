/* Authored, action-verified onboarding. Sandbox loadouts never overwrite the save. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,C=ES9,D=ES18,SK=ES10_MASTER.skills,$=s=>document.querySelector(s),cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;
const event=P.nEvent;P.nEvent=function(type,value){event.call(this,type,value);this.n18.events.at(-1).seq=++this.n18.eventSeq|| (this.n18.eventSeq=1);};
const eHas=(g,t,type,value)=>g.n18.events.some(e=>(e.seq||0)>t.since&&e.type===type&&(value===undefined||e.value===value)),byId=(g,id)=>g.enemies.find(e=>e.id===id);
const skill=(id,i)=>D.skills[id][i],buttonKey=(g,i)=>String(g.keys['skill'+(i+1)]).replace('Key','');
const combos={
 rift:{title:'刻痕不是裝飾',text:'先用 Z 或 C 刻出裂痕，再短按 N「合縫收割」。沒有裂痕時只提示，不扣冷卻。',goal:'成功消耗裂痕施放合縫收割',index:3,type:'skill'},
 summoner:{title:'主人指定，契靈出手',text:'先短按 C 召狐，再長按 C 召梟（冷卻後）。按方向瞄準靶子，短按 V「契約集火」。確認契靈從自身所在位置攻擊。',goal:'契靈實際命中練習靶',test:(g,t)=>eHas(g,t,'petHit')},
 beast:{title:'三形改變身體',text:'短按 V 展翼，觀察自己主動升空；落地後短按 B 變成熊並震掌。Q 輪換形態本身不攻擊。',goal:'切換到鷹形與熊形',test:(g,t)=>eHas(g,t,'form','eagle')&&eHas(g,t,'form','bear')},
 artificer:{title:'先有雙端，再有纜線',text:'短按 C 放第一炮台，走開約 150px，等冷卻後再短按 C 放第二炮台。短按 V 通電。長按 V 則只要一座炮台，另一端連向自己。',goal:'成功建立炮台纜線',index:1,type:'skill'},
 gunner:{title:'彈種和射法分開',text:'長按 V「戰術裝填」放開，裝滿四枚破甲重彈。接著短按 C 是貫穿；長按 C 是散射。Z／X 永遠只是槍托。',goal:'完成一次破甲裝填',test:(g,t)=>eHas(g,t,'reload','armor')},
 warden:{title:'防守不是自動突進',text:'短按 C 架設固定盾面；等練習彈撞盾。攔彈會積累守勢；短按 B 才主動把守勢變成衝擊。',goal:'盾面實際攔住一枚練習彈',projectiles:true,test:(g,t)=>eHas(g,t,'block','shield')},
 chrono:{title:'明確的記錄與返回',text:'短按 C 留時錨，走離 120px 以上，再短按 N「返回時錨」。它是回到記錄座標，不重置怪物、場景或掉落。',goal:'從另一處成功返回時錨',index:3,type:'skill'},
 harrier:{title:'拉怪，和拉自己，是兩個鍵',text:'先用 C 鉤住前方練習靶（自己不位移）。再按 V 沿索突進，這次才是角色主動移動。沒有鉤住敵人時 V 只提示。',goal:'先鉤住敵人，再成功沿索突進',index:1,type:'skill'},
 alchemist:{title:'試劑不是單色傷害',text:'Q 選水試劑，向右上長按 C 投瓶。落地產生水場後，Q 輪換到火，短按 V「觸媒攪拌」；近處異元素場會產生蒸汽。',goal:'成功觸媒攪拌',index:1,type:'skill'},
 monk:{title:'氣穴需要後續命中',text:'走近靶子短按 B「點穴指」，再用 X 命中。同一技能不會偷換成下一招，X 是你明確發出的命令。',goal:'點穴之後，X 命中練習靶',test:(g,t)=>eHas(g,t,'skill',skill('monk',2).id)&&g.n18.events.some(e=>e.seq>t.since&&e.type==='commandHit'&&String(e.value).endsWith('X'))},
 sharpshooter:{title:'真正的狙擊在技能槽',text:'短按 V 為前方靶子留下弱點，站定積累專注。按住 C 看長距離射線，蓄滿放開可貫穿多個目標。距離和擋路的實體地形都會影響射線。',goal:'弱點測距後，成功施放長按狙擊',test:(g,t)=>eHas(g,t,'skill',skill('sharpshooter',1).id)&&eHas(g,t,'chargedSkill',skill('sharpshooter',0).id)},
 puppeteer:{title:'斬擊從傀儡出發',text:'長按 C 將傀儡放在靶子附近，自己可以站得較遠。短按 B「提線斬」，觀察攻擊從傀儡所在位置發出，不是玩家周圍再畫一個圈。',goal:'有傀儡時成功使用提線斬',index:2,type:'skill'},
 cartographer:{title:'兩個世界座標是一座橋',text:'短按 C 設原點；往右走至少 180px，短按 V 設終點，再短按 N「繪製棧橋」。橋依照兩圖釘的真實座標生成；開門則要 B 後在門邊 E。',goal:'成功建立雙圖釘棧橋',index:3,type:'skill'},
 chef:{title:'爐具要放對地方',text:'短按 V 放火爐，長按 V 則放水鍋。短按 N 引爆已有爐具；長按 N 是收回，不會爆炸。Q 另切換下一鍋燉煮／煎烤。',goal:'成功對現有爐具施放收鍋爆香',index:3,type:'skill'},
 dreamweaver:{title:'安眠 → 收割，不要先把夢打醒',text:'靠近靶子，短按 C 在腳前埋夢種，靶子進圈後會安眠。趁睡眠存在短按 N「夢魘收割」。火／雷持續傷害會提早喚醒，先別疊傷害場。',goal:'實際觸發夢種睡眠，再成功夢魘收割',test:(g,t)=>eHas(g,t,'trapSleep')&&eHas(g,t,'skill',skill('dreamweaver',3).id)}
};
D.lessons=combos;
P.nTutorialSteps=function(kind,id){const act=(title,text,goal,test,extra={})=>({title,text,goal,test,...extra});
 if(kind==='job'){const list=D.skills[id],s=list[0],c=combos[id];return[
 act('先摸清原地 Z／X',`${C.CLASSES[id].name}的核心是「${D.roles[id]}」。${D.jobs[id].desc} 先靠近靶子，用 Z 或 X 實際命中一次。`,'普攻命中，不要求快速連段',(g,t)=>eHas(g,t,'commandHit')),
 act('同一個 C：短按',`按下 ${buttonKey(this,0)} 後立刻放開：${s.tap18} 這次只有 ${s.name}，不會暗中接別招。`,'放開施放 '+s.name+'・短按',(g,t)=>eHas(g,t,'skill',s.id)),
 act('同一個 C：長按',`按住 ${buttonKey(this,0)} 約 ${s.holdTime18} 秒，畫面變成金色後放開。${s.hold18} 可按住方向調整準星，跳躍／衝刺取消。`,'蓄滿放開施放 '+s.name,(g,t)=>eHas(g,t,'chargedSkill',s.id)),
 act(c.title,c.text,c.goal,c.test||((g,t)=>eHas(g,t,c.type,skill(id,c.index).id)),{projectiles:!!c.projectiles}),
 act('Q 是獨立的職業機構',D.jobs[id].q+'。Q 不占五技能槽；和同鍵追擊無關。','實際操作一次 Q',(g,t)=>eHas(g,t,'q',id)),
 act('把換位和規則加入手上的職業','先按 3 射出雷錨，等它離開身體至少一格後再按 3 換位。接著按 [ 使用既視感；看看剛才自己的路徑與攻擊在哪裡重播。它不追蹤怪物。','一次元素換位 ＋ 一次既視感切換',(g,t)=>eHas(g,t,'swap')&&eHas(g,t,'rule','echo'))
 ];}
 if(kind==='basics')return[
 act('01 腳下有地層','使用 ← → 走 150px。鏡頭連續跟隨，不需要按 E 切小房間。低處有真實地形，爬梯可 ↑ ↓。','步行移動 150px',(g,t)=>Math.abs(g.player.x-t.startX)>150),
 act('02 主動跳躍','按 Space 跳起；空中再按一次是第二段跳。這是你決定的移動，與 Z／X 無關。','離地至少 65px',(g,t)=>g.player.y<t.startY-65),
 act('03 靠近再出刀','走向右方練習靶，短按 Z。攻擊範圍有顯示，不用靠猜。受擊停頓不是斷線。','Z 實際命中',(g,t)=>g.n18.events.some(e=>e.seq>t.since&&e.type==='commandHit'&&String(e.value).endsWith('Z'))),
 act('04 原地重擊','放開方向再按 X。X 是另一種近戰，不會自動後退或發射職業子彈。','X 實際命中',(g,t)=>g.n18.events.some(e=>e.seq>t.since&&e.type==='commandHit'&&String(e.value).endsWith('X'))),
 act('05 放開才施放','短按 C 放開，再等它的冷卻歸零，長按 C 直到金色後放開。兩次都是同一格同一招，不是追擊替換。','一次短按 C 與一次長按 C',(g,t)=>eHas(g,t,'skill',g.mLoadout()[0])&&eHas(g,t,'chargedSkill',g.mLoadout()[0])),
 act('06 世界座標交換','按 3 發射雷錨，等它飛離自己，按 3 交換位置。上方方向可改瞄準。非法落點會取消，不會傳送到附近另一房。','一次成功元素換位',(g,t)=>eHas(g,t,'swap')),
 act('07 先記錄，再重播','先走動、跳躍並在空中揮 Z 約三秒，再按 [ 切既視感。地上會留下路徑踏點；一個殘影按原座標重播。反斜線返回當下。','既視感中成功建立殘影',(g,t)=>g.vInit().mode==='echo'&&!!g.vInit().echo),
 act('08 把工具放進組合','O → 元素分支可逐級選 A/B；L 攜帶五技能；J 配兩個世界槽。現在短按 Q 操作當前職業的獨立機構，完成入門。','一次 Q 操作',(g,t)=>eHas(g,t,'q'))
 ];
 if(kind==='rule'){const m=D.modes[id],switchStep=act('切換：'+m.name,`先讀這個世界：${m.rule} 按下面「切換練習規則」或 [，切換不會重置位置。`,'目前世界是 '+m.name,(g,t)=>g.vInit().mode===id);
 const special={
 echo:act('讓過去的自己重播','先返回當下，走動、跳躍與空中揮刀約三秒，再切既視感。踏點只生成於未被地面占用的空中路徑，有時間限制；殘影攻擊在原處，怪離開就可能打空。','建立至少一個路徑踏點與殘影',(g,t)=>!!g.vInit().echo&&g.vInit().rails.length>0),
 past:act('站上被修復的舊橋','金色舊橋只在過去完整。走到右側約 1100px 處，利用二段跳或梯子上橋。不是貼色：橋能承重。','角色實際站在過去舊橋上',(g,t)=>g.nOnStructure('labPast')),
 heavy:act('重落不是只調顏色','按 Space 跳起，再落在實體地面。下落加速，強落地產生短距離震波；跳躍變矮是代價。','重力世界觸發一次重落震波',(g,t)=>eHas(g,t,'heavyLand')),
 invert:act('看到速度真的反過來','場內每兩秒有安全練習彈。先返回當下，等子彈接近再切反轉，觀察它沿原路反飛。移動按鍵不倒置。','切換時至少一顆飛行練習彈反向',(g,t)=>eHas(g,t,'vectorObserved'),{projectiles:true}),
 elastic:act('踩地反彈，按下止彈','跳起後落地會彈回；碰牆也會反射部分速度。按住 ↓ 可以止彈，避免失去落腳點。','實際觸發一次反彈',(g,t)=>eHas(g,t,'bounce')),
 fungal:act('腳步催生可站立菌台','在地面前進，腳前逐步長出菇台。走過去跳上菌帽；水場延長它，火場使它枯萎。','腳步生成至少一個真菌踏台',(g,t)=>g.vInit().mode==='fungal'&&(eHas(g,t,'fungus','grown')||g.n18.structures.some(s=>s.fungus18&&s.until>g.time))),
 inner:act('同一座標，不同的牆','往右到試驗牆。裏世界中牆失去碰撞，可穿過；較高處出現靈紋旁路。回表世界前先離牆一格，避免被包住。','從裏世界穿過試驗牆到另一邊',(g,t)=>g.vInit().mode==='inner'&&g.player.x>g.n18.structures.find(s=>s.id==='labWall').x+45),
 future:act('不是傳送，是升降台','右方青綠機台在未來運轉。站上它會被帶高；返回當下就停機。過去橋梁與未來升降不是同一效果。','未來升降台相對初始位置移動超過 90px',(g,t)=>{const s=g.n18.structures.find(s=>s.id==='labFuture');return s&&s.baseY-s.y>90;}),
 decay:act('等它消失，再返回復原','高台逐步裂解，四秒後不再承重。即使下落，下面還是實體地層。等高台消失後按「返回當下」，它會原位完整恢復。','高台消失後，返回當下且高台復原',(g,t)=>{const s=g.n18.structures.find(s=>s.id==='labDecay');if(g.vInit().mode==='decay'&&!g.nStructureActive(s))t.decayed=true;return t.decayed&&g.vInit().mode==='now'&&g.nStructureActive(s);})
 };
 return [switchStep,special[id],act('回到當下，保留自己的座標','點返回當下（或反斜線）。敵人的生命、背包與掉落不會因此重置；本練習借出的配置會在結束後還原。','返回當下／表世界',(g,t)=>g.vInit().mode==='now')];}
 return [];
};
P.nOnStructure=function(id){const s=this.n18.structures.find(s=>s.id===id),p=this.player;return s&&this.nStructureActive(s)&&p.onGround&&p.x+p.w>s.x&&p.x<s.x+s.w&&Math.abs(p.y+p.h-s.y)<8;};
P.nStartTutorial=function(kind='basics',id){if(kind==='job'&&!D.jobs[id]||kind==='rule'&&!D.modes[id])return false;if(this.nInit().tutorial)this.nEndTutorial();if(this.trainingM)this.endTraining();
 const p=this.player,ret={progress:JSON.parse(JSON.stringify(this.progress)),x:p.x,y:p.y,hp:p.hp,checkpoint:{...p.checkpoint},classId:p.classId,form:p.form,room:this.currentRoomId,mode:this.vInit().mode};
 this.closeModalsM();this._nTrainingTravel=true;this.progress.discovered.n18_lab=true;this.xTravel('n18_lab');this._nTrainingTravel=false;this.changeClass(kind==='job'?id:kind==='basics'?'rift':p.classId);
 const t={kind,id:id||'basics',returnState:ret,room:'n18_lab',step:0,steps:[],since:this.n18.eventSeq||0,at:this.time,startX:p.x,startY:p.y,done:false,projectileAt:this.time+2};this.n18.tutorial=t;this.trainingM=null;this.clearMasterScene();this.nDiscontinuity('tutorial');
 this.mState().loadouts[p.classId]=D.skills[p.classId].slice(0,5).map(s=>s.id);for(const s of D.skills[p.classId]){this.mState().ranks[s.id]=1;this.mState().branches[s.id]='A';}
 this.xState().elements.lightning={rank:1,branch:'A',tiers:['A','A','A','A']};this.vStore().slots=[kind==='rule'?id:'echo',kind==='rule'&&id==='past'?'heavy':'past'];this.vInit().mode='now';this.vInit().cd={};
 this.nResetTutorialActors();t.steps=this.nTutorialSteps(kind,id);this.nEnterTutorialStep();this.renderSkillBar();this.nRenderLessonHUD();this.say('安全實作開始｜借用配置，不覆蓋探索存檔。',2);return true;
};
P.nResetTutorialActors=function(){const t=this.n18.tutorial;if(!t)return;const r=this.roomById.get(t.room),p=this.player;this.enemies=this.enemies.filter(e=>!e.training18);for(let i=0;i<3;i++){const e=this.spawnEnemy('dummy',r.x+480+i*110,r.floorY,{room:r.id,hp:50000});Object.assign(e,{practiceM:true,training18:true,v16Layer:'B',homePractice:{x:e.x,y:e.y},name:i===0?'練習靶・可睡眠':'練習靶・'+(i+1)});}
 this.nCancelHolds();Object.assign(p,{x:r.x+335,y:r.floorY-p.h,vx:0,vy:0,onGround:true,downT:0,dashT:0,attack:null,buffer:null,history:'',hp:p.maxHp,inv:1});this.n18.objects=[];this.n18.shots=[];this.cooldownsM={};this.camera.x=p.x-this.viewW*.38;this.camera.y=p.y-this.viewH*.49;};
P.nEnterTutorialStep=function(){const t=this.n18.tutorial;if(!t)return;t.since=this.n18.eventSeq||0;t.at=this.time;t.startX=this.player.x;t.startY=this.player.y;t.projectileAt=this.time+1.3;t.readyAt=0;this.cooldownsM={};this.player.qCD=0;this.pendingM=this.linkM=null;this.nRenderLessonHUD(true);};
P.nTutorialTick=function(){const t=this.n18?.tutorial;if(!t||t.done)return;const step=t.steps[t.step];if(!step)return;try{if(step.test(this,t)){t.step++;if(t.step>=t.steps.length){t.done=true;this.progress.tutorial18[t.kind+':'+t.id]=true;this.say('研習完成！配置將在離開時還原。',3);this.nRenderLessonHUD(true);}else{this.say('✓ '+step.goal,1.6);this.nEnterTutorialStep();}}}catch(e){console.error('Tutorial assertion',t.id,t.step,e);}
};
P.nEndTutorial=function(){const n=this.nInit(),t=n.tutorial;if(!t)return false;const done={...this.progress.tutorial18},ret=t.returnState;n.tutorial=null;this.nDiscontinuity('tutorialEnd');this.enemies=this.enemies.filter(e=>!e.training18);this.progress=ret.progress;this.progress.tutorial18={...this.progress.tutorial18,...done};this.changeClass(ret.classId);if(ret.classId==='beast')this.setFormM(ret.form||'wolf');this.vInit().mode='now';const p=this.player;Object.assign(p,{x:ret.x,y:ret.y,hp:Math.min(p.maxHp,ret.hp),checkpoint:ret.checkpoint,vx:0,vy:0,inv:1,downT:0});this.currentRoomId=ret.room;this.currentRegion=this.roomById.get(ret.room)?.region;this.camera.x=p.x-this.viewW*.45;this.camera.y=p.y-this.viewH*.5;this.closeModalsM();this.renderSkillBar();$('#lesson18').hidden=true;this.saveProgress();this.say('回到探索｜原職業、種族、技能與背包已還原。',2);return true;};
const save=P.saveProgress;P.saveProgress=function(){const t=this.n18?.tutorial;if(!t)return save.call(this);const borrowed=this.progress;try{this.progress={...t.returnState.progress,tutorial18:{...t.returnState.progress.tutorial18,...borrowed.tutorial18}};save.call(this);}finally{this.progress=borrowed;}};
P.nRenderLessonHUD=function(force=false){const box=$('#lesson18'),t=this.n18?.tutorial;if(!box)return;box.hidden=!t;if(!t)return;const stamp=t.kind+t.id+t.step+t.done;if(!force&&box.dataset.stamp===stamp)return;box.dataset.stamp=stamp;box.classList.toggle('done18',t.done);const s=t.steps[t.step],title=t.kind==='job'?C.CLASSES[t.id].name:t.kind==='rule'?D.modes[t.id].name:'基礎操作';box.innerHTML=`<small>FIELD SCHOOL / ${title} · ${t.done?'完成':(t.step+1)+' / '+t.steps.length}</small><div class="lesson-progress18">${t.steps.map((_,i)=>`<i class="${i<t.step?'done':''}"></i>`).join('')}</div><h3>${t.done?'理解機制，再去探索。':s.title}</h3><p>${t.done?'所有步驟已通過實際操作判定。現在離開實作庭，恢復你的探索位置與配置。':s.text}</p>${t.done?'':`<div class="lesson-goal18">驗證：${s.goal}</div><div class="lesson-status18">不計傷害、不扣素材。沒有按鍵跳過假通關。</div>`}<footer>${t.kind==='rule'&&!t.done?'<button id="lessonRule18">切換練習規則</button><button id="lessonNow18">返回當下</button>':''}${t.done?'':'<button id="lessonReset18">重置練習靶</button>'}<button id="lessonExit18">${t.done?'完成並返回':'離開研習'}</button></footer>`;
 $('#lessonRule18')?.addEventListener('click',()=>{this.vInit().cd[t.id]=0;const shots=this.enemyShots.filter(s=>s.training18&&s.t>0),old=shots.map(s=>s.vx);this.vSwitch(t.id);if(t.id==='invert'&&shots.some((s,i)=>s.vx*old[i]<0))this.nEvent('vectorObserved');});$('#lessonNow18')?.addEventListener('click',()=>{if(this.vInit().mode!=='now')this.vSwitch('now');});$('#lessonReset18')?.addEventListener('click',()=>{this.nResetTutorialActors();this.nEnterTutorialStep();});$('#lessonExit18').onclick=()=>this.nEndTutorial();};
const update=P.update;P.update=function(dt,ts){update.call(this,dt,ts);const t=this.n18?.tutorial;if(!t||this.paused||this.modalM())return;const r=this.roomById.get(t.room),p=this.player;for(const e of this.enemies.filter(e=>e.training18)){if(Math.abs(e.x-r.x)>r.w+500||e.y>r.floorY+300){e.x=e.homePractice.x;e.y=e.homePractice.y;e.vx=e.vy=0;}}
 if(t.steps[t.step]?.projectiles&&this.time>t.projectileAt){t.projectileAt=this.time+2;this.enemyShots.push({id:this.id(),x:p.x+360,y:p.y+20,w:14,h:14,vx:-140,vy:0,t:6,max:6,damage:0,warmup:0,color:'#e6bb87',friendly:false,training18:true,v16Layer:this.vLayer()});}
 if(p.x<r.x-500||p.x>r.x+r.w+500||p.y>r.floorY+500){this.nResetTutorialActors();this.say('這裡是安全研習範圍；離开課程即可自由探索。',2);}
};
const vs=P.vSwitch;P.vSwitch=function(mode){const ss=this.enemyShots.filter(s=>s.training18&&s.t>0),old=ss.map(s=>s.vx);const ok=vs.call(this,mode);if(ok&&ss.some((s,i)=>s.vx*old[i]<0))this.nEvent('vectorObserved');return ok;};
P.openSchools=function(){this.closeModalsM();$('#schoolPanel').hidden=false;this.schoolSelection=Object.keys(D.jobs).indexOf(this.player.classId);this.renderSchools();};
P.renderSchools=function(){$('#schoolPanel h2').textContent='澄界實作庭｜十五職研習';$('#schoolPanel p').textContent='每職六個實作步驟：原地普攻、短按、長按、職業核心流程、Q 機構、元素與世界規則。操作達標才進到下一步。借用配置離場還原；Backspace 隨時返回。';$('#schoolGrid').innerHTML=Object.keys(D.jobs).map((id,i)=>`<article class="school18 ${this.progress.tutorial18?.['job:'+id]?'done18':''}"><small>CLASS ${String(i+1).padStart(2,'0')} · ${D.roles[id]}</small><h3>${C.CLASSES[id].name}</h3><p>${combos[id].text}</p><span>${this.progress.tutorial18?.['job:'+id]?'✓ 已完成實作':'6 階段 · 安全練習靶'}</span><button class="primary18" data-lesson-job18="${id}">開始研習 →</button></article>`).join('');$('#schoolGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>this.nStartTutorial('job',b.dataset.lessonJob18));$('#schoolReturn').hidden=!this.n18?.tutorial;$('#schoolReturn').onclick=()=>this.nEndTutorial();};
P.startTraining=function(cls){return this.nStartTutorial('job',cls);};P.endTraining=function(){return this.nEndTutorial();};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);$('#schoolButton').onclick=()=>this.openSchools();$('#schoolPanel p').textContent='十五職各六階段實作。所有短按、長按與機制都會檢查實際操作，不只是閱讀文字。';};
})();
