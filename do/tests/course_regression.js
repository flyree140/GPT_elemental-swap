()=>{
const g=ElementalSwap.game,OUT=[];g.paused=false;
const tick=n=>{for(let i=0;i<n;i++){g.update(1/60,g.time*1000);g.input.end();}};
const target=()=>g.enemies.find(e=>e.practiceM);
function near(){const e=target(),p=g.player;p.x=e.x-45;p.y=e.y+e.h-p.h;p.vx=p.vy=0;p.dir=1;p.onGround=true;p.attack=null;p.buffer=null;p.history='';p.castT=0;return e;}
function aim(){for(const e of g.enemies.filter(e=>e.practiceM)){e.y=g.player.y+g.player.h-e.h;e.vx=e.vy=0;e.onGround=true;}g.player.dir=1;}
function selectStage(cls,n){g.startTraining(cls);for(let k=0;k<n;k++)g.nextLessonM();g.eventsM=[];near();}
function passed(n){return g.trainingM.step>n||!!g.trainingM.doneTimer;}
for(const cls of Object.keys(ES10_SKILLS)){
 for(let step=0;step<6;step++){
  try{selectStage(cls,step);const p=g.player;
   if(step===0){g.commandInput('Z');tick(10);g.commandInput('Z');tick(13);g.commandInput('X');tick(50);}
   if(step===1){
    if(cls==='rift'){g.castMasterSkill('rift_step');tick(55);}
    if(cls==='summoner'){g.castMasterSkill('summoner_fox');g.castMasterSkill('summoner_owl');tick(140);}
    if(cls==='beast'){g.castMasterSkill('beast_flight');g.input.held.add(g.keys.jump);g.input.held.add(g.keys.up);tick(80);g.input.held.clear();near();g.castMasterSkill('beast_palm');tick(25);}
    if(cls==='artificer'){g.castMasterSkill('artificer_turret');g.castMasterSkill('artificer_step');tick(35);}
    if(cls==='gunner'){for(let k=0;k<4&&!passed(step);k++){near();g.cooldownsM={};g.castMasterSkill('gunner_rocket');tick(15);g.input.held.add(g.keys.down);g.castMasterSkill('gunner_shot');tick(9);g.input.held.clear();tick(55);}}
    if(cls==='warden'){p.inv=0;g.castMasterSkill('warden_guard');g.hurtPlayer(5,-50,0,'training projectile');tick(8);}
    if(cls==='chrono'){g.castMasterSkill('chrono_anchor');p.x-=140;tick(65);g.castMasterSkill('chrono_anchor');near();g.castMasterSkill('chrono_echo');tick(75);}
    if(cls==='harrier'){g.castMasterSkill('harrier_hook');tick(10);g.castMasterSkill('harrier_swing');tick(45);}
    if(cls==='alchemist'){g.castMasterSkill('alchemist_mist');tick(70);near();g.castMasterSkill('alchemist_spark');tick(65);}
    if(cls==='monk'){g.castMasterSkill('monk_spin');tick(60);}
   }
   if(step===2){g.elementPress(0);tick(1);g.elementPress(0);near();g.useSkill(0);tick(80);}
   if(step===3){g.chooseMasterBranch(g.mLoadout()[0],'B');g.useSkill(0);tick(70);}
   if(step===4){g.useSkill(0);tick(11);g.useSkill(0);tick(80);}
   if(step===5){g.commandInput('Z');tick(10);g.elementPress(0);tick(1);g.elementPress(0);near();g.useSkill(0);tick(11);g.useSkill(0);tick(75);}
   OUT.push({cls,step,pass:passed(step),actual:g.trainingM.step,flags:g.trainingM.flags,events:g.eventsM.slice(-16).map(e=>({t:e.type,key:e.key,id:e.id,skill:e.skill,linked:e.linked,el:e.element,res:e.resonance}))});
  }catch(e){OUT.push({cls,step,pass:false,error:String(e.stack)});}
 }
}
g.endTraining();g.paused=true;return OUT;
}
