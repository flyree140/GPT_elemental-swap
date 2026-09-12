()=>{
const g=ElementalSwap.game,D=ES10_SKILLS;g.paused=false;g.closeModalsM();
const out={skills:[],errors:[],classes:{},branchTests:{}};
const tick=(n=60)=>{for(let i=0;i<n;i++){g.update(1/60,g.time*1000);g.input.end();}};
for(const [cls,list]of Object.entries(D)){
 g.startTraining(cls);g.trainingM.step=99; // isolation fixture, not a claim that the lesson was completed
 out.classes[cls]={count:list.length};
 for(const s of list){try{
  g.clearMasterScene();g.resetPracticeActors();g.trainingM.step=99;g.player.onGround=true;g.player.dir=1;g.player.inv=100;
  g.eventsM=[];const before=g.player.hp;g.player.hp=g.player.maxHp-45;
  const cast=g.castMasterSkill(s.id);tick(65);g.render();
  const hits=g.eventsM.filter(e=>e.type==='hit'&&e.skill===s.id).length;
  out.skills.push({classId:cls,id:s.id,mode:s.mode,cast,hits,missiles:g.masterMissiles.length,fields:g.masterFields.length,summons:g.summons.length,hpDelta:g.player.hp-(g.player.maxHp-45),finite:Number.isFinite(g.player.x)&&Number.isFinite(g.player.y)});
  if(!cast||!Number.isFinite(g.player.x)||!Number.isFinite(g.player.y))throw Error('casting/finiteness');
 }catch(e){out.errors.push(s.id+': '+e.stack);}}
 g.endTraining();
}
g.startTraining('rift');g.trainingM.step=99;g.resetPracticeActors();const p=g.player,e=g.enemies.find(e=>e.practiceM);
// Native fire/water/lightning effect uses real enemy status, not UI text.
e.x=p.x+85;e.y=p.y;g.player.onGround=true;
g.castMasterSkill('rift_anchor');tick(12);out.branchTests.fire=e.burn>0;
g.clearMasterScene();g.resetPracticeActors();g.trainingM.step=99;
const e2=g.enemies.find(e=>e.practiceM);e2.x=g.player.x+65;e2.y=g.player.y;
g.resonanceM={element:'lightning',until:g.time+2.4};g.castMasterSkill('rift_step');tick(12);out.branchTests.resonance=g.eventsM.some(x=>x.type==='hit'&&x.resonance==='lightning');
g.endTraining();g.paused=true;
return out;
}
