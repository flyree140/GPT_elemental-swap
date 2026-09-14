()=>{const out=[],g=ElementalSwap.game,p=g.player;
const reset=(cls)=>{g.nStartTutorial('job',cls);g.closeModalsM();g.paused=false;g.hitStop=0;g.n18.tutorial.done=true;g.enemies=g.enemies.filter(e=>e.training18);const r=g.roomById.get('n18_lab');Object.assign(p,{x:r.x+365,y:r.floorY-p.h,dir:1,vx:0,vy:0,onGround:true,attack:null,buffer:null,history:'',downT:0,dashT:0});g.input.held.clear();g.input.pressed.clear();g.input.released.clear();};
const tick=(sec=.4)=>{for(let n=0;n<Math.ceil(sec*60);n++){g.update(1/60,0);g.input.end();}};
const shotCount=()=>g.elementShots.length+g.skillShots.length+(g.masterMissiles||[]).length+g.n18.shots.length;
for(const cls of Object.keys(ES18.jobs)){try{reset(cls);const x=p.x,s=shotCount();g.startAttack('Z');tick(.7);g.startAttack('X');tick(.8);out.push({test:'ZX '+cls,pass:Math.abs(p.x-x)<1&&shotCount()===s,dx:p.x-x,shots:shotCount()-s,hits:g.n18.events.filter(e=>e.type==='commandHit').slice(-2).map(e=>e.value)});}catch(e){out.push({test:'ZX '+cls,error:e.stack});}}
for(const cls of Object.keys(ES18.jobs))for(const s of ES18.skills[cls])for(const charged of [false,true]){try{reset(cls);const j=g.nJob(),n=g.nInit(),r=g.roomById.get('n18_lab');
 for(const e of g.enemies)Object.assign(e,{rift18:3,prey18:2,drowse18:3,drowseUntil18:g.time+20,sleep17:g.time+5,marked17:g.time+9,wet:10,element17:{id:'water',until:g.time+10},debt18:[{at:g.time,n:40}]});
 j.meter=3;j.ammo=4;j.anchor={x:p.x+50,y:p.y,hp:p.hp,until:g.time+20};j.hooked=g.enemies[0].id;j.a={x:p.x+20,y:p.y+p.h-25};j.b={x:p.x+280,y:p.y+p.h-25};
 const o=(type,dx,opts={})=>g.nObject(type,p.x+dx,p.y+20,{duration:20,...opts});
 if(cls==='summoner'){o('pet',130,{variant:'fox',attackAt:g.time+10});o('pet',230,{variant:'owl',attackAt:g.time+10});}
 if(cls==='artificer'){o('turret',100,{variant:'gun',attackAt:g.time+10});o('turret',280,{variant:'gun',attackAt:g.time+10});}
 if(cls==='harrier')o('rope',20,{target:g.enemies[0].id});
 if(cls==='puppeteer'){o('puppet',200);o('tether',0,{ids:g.enemies.slice(0,2).map(e=>e.id)});}
 if(cls==='chef')o('pot',130,{element:'water',r:170});
 if(cls==='dreamweaver')o('dreamDecoy',180,{r:500});
 g.xField('water',p.x+180,p.y+20,220,10,{damage:0});p.hp-=15;
 const ok=g.castMasterSkill(s.id,{charged,aim:{x:1,y:0}});tick(.25);
 const finite=[p.x,p.y,p.hp,p.vx,p.vy,...g.n18.objects.flatMap(o=>[o.x,o.y]),...g.n18.shots.flatMap(b=>[b.x,b.y,b.vx,b.vy])].every(Number.isFinite);
 out.push({test:s.id+(charged?' hold':' tap'),pass:ok&&finite,ok,finite});
}catch(e){out.push({test:s.id+(charged?' hold':' tap'),error:e.stack});}}
g.paused=true;return out;}
