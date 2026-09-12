()=>{
const g=ElementalSwap.game,p=g.player,R={tests:[],fail:[]};g.paused=false;
const check=(name,ok,data)=>{R.tests.push({name,pass:!!ok,data});if(!ok)R.fail.push(name)};
const tick=n=>{for(let i=0;i<n;i++){g.update(1/60,g.time*1000);g.input.end();}};
const near=()=>{const e=g.enemies.find(e=>e.practiceM);p.x=e.x-45;p.y=e.y+e.h-p.h;p.onGround=true;p.dir=1;p.vx=p.vy=0;return e};
function fresh(cls,step=99){g.startTraining(cls);g.trainingM.step=step;g.resetPracticeActors();near();g.eventsM=[];}
// Real commands invoke the game's input parser and hitboxes.
fresh('rift',0);
g.commandInput('Z');tick(10);g.commandInput('Z');tick(12);g.commandInput('X');tick(18);
check('ZZX active frame advances lesson 1',g.trainingM.step===1||!!g.trainingM.doneTimer,{step:g.trainingM.step,events:g.eventsM.filter(e=>e.type==='hit').map(e=>({key:e.key,air:e.airborne}))});
// Once-per-type summons and actual unique actors.
fresh('summoner');g.castMasterSkill('summoner_fox');tick(50);g.castMasterSkill('summoner_fox');tick(5);check('fox unique with rank refresh',g.summons.filter(s=>s.type==='fox').length===1&&g.summons.find(s=>s.type==='fox').rank===2,g.summons.map(s=>({type:s.type,rank:s.rank})));
// Eagle real movement through physics, not a sprite change.
fresh('beast');g.castMasterSkill('beast_flight');const y=p.y;g.input.held.add(g.keys.jump);g.input.held.add(g.keys.up);tick(80);g.input.held.clear();check('eagle controlled flight rises >200px',p.form==='eagle'&&y-p.y>200,{rise:y-p.y,vx:p.vx,vy:p.vy,form:p.form});
g.setFormM('bear');p.x=g.trainingM.baseX+70;p.y=g.trainingM.baseY;p.onGround=true;p.vx=p.vy=0;g.cooldownsM={};g.eventsM=[];g.castMasterSkill('beast_palm');tick(16);check('bear AoE hits multiple enemies',new Set(g.eventsM.filter(e=>e.type==='hit').map(e=>e.enemy)).size>=2,{targets:[...new Set(g.eventsM.filter(e=>e.type==='hit').map(e=>e.enemy))]});
// Precise parry is a real incoming damage collision, not opening the skill.
fresh('warden');p.inv=0;g.castMasterSkill('warden_guard');g.hurtPlayer(8,-80,0,'practice');check('warden successful parry event',g.eventsM.some(e=>e.type==='parry')&&p.hp===p.maxHp);
// Branching uses permanent points only during purchases.
g.endTraining();const m=g.mState();const startPoints=m.points;g.upgradeMasterSkill('rift_step');const afterPoints=m.points;g.chooseMasterBranch('rift_step','B');g.chooseMasterBranch('rift_step','A');check('upgrade cost / switching branches free',afterPoints===startPoints-1&&m.points===afterPoints,{startPoints,afterPoints,rank:m.ranks.rift_step});
g.setCommandBranch('fire');check('Command flame branch unlocked',m.command[p.classId]==='fire');
// B echo actually produces a delayed damaging hit.
fresh('rift');g.chooseMasterBranch('rift_step','B');g.castMasterSkill('rift_step');tick(35);check('B echo produces additional hits',g.eventsM.filter(e=>e.type==='hit'&&e.skill==='rift_step').length>3,{hits:g.eventsM.filter(e=>e.type==='hit'&&e.skill==='rift_step').length});
// Same key follow: works after .14s; respects target's cooldown.
fresh('rift');g.useSkill(0);tick(11);g.useSkill(0);tick(20);check('same-key linked follow cast + hit',g.eventsM.some(e=>e.type==='skill'&&e.linked)&&g.eventsM.some(e=>e.type==='hit'&&e.linked),g.eventsM.filter(e=>['cast','hit'].includes(e.type)).map(e=>({type:e.type,skill:e.skill,linked:e.linked})));
const currentCD={...g.cooldownsM};g.mState().skillPage=1;g.renderSkillBar();g.mState().skillPage=0;g.renderSkillBar();check('page swap does not reset cooldowns',JSON.stringify(currentCD)===JSON.stringify(g.cooldownsM));
// Atomic safe swap: no platform overlap.
fresh('rift');g.elementPress(0);tick(4);g.elementPress(0);const overlap=g.activePlatforms().some(s=>!s.oneWay&&p.x<s.x+s.w&&p.x+p.w>s.x&&p.y<s.y+s.h&&p.y+p.h>s.y);check('fire swap safe and flame fields exist',!overlap&&g.fields.filter(f=>f.type==='flame').length===2);
// four relays in the new map grant once-only rewards, preserve original puzzles.
g.endTraining();const before=g.mState().points;const q=g.puzzles.find(p=>p.id==='m10_relay_0');for(const el of q.elements)g.puzzleElement(q,el);const got=g.mState().points;g.solvePuzzleById(q.id);check('new relay solves and rewards once',q.solved&&got===before+3&&g.mState().points===got);
// Branch B and linked hit data is tied to actual hit, so fake cast-only cannot pass.
fresh('rift',3);g.nextLessonM(); // stage 4 is follow task
near();g.useSkill(0);tick(11);g.useSkill(0);tick(16);check('follow tutorial records real follow hit',g.trainingM.step>4||!!g.trainingM.doneTimer);
g.endTraining();g.paused=true;return R;
}
