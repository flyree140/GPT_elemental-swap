()=>{
 // V16: test that all 78 ORIGINAL rooms remain, not that the expanded total is still 78.
 const g=ElementalSwap.game,C=ES9,res=[];g.paused=true;g.closeModalsM();
 const check=(name,yes,data=null)=>res.push({name,pass:!!yes,data});
 const f=(k,room)=>g.furniture.find(f=>f.refined11&&f.kind===k&&(!room||f.room===room));
 const place=o=>{Object.assign(g.player,{x:o.x+o.w/2-g.player.w/2,y:o.y+o.h-g.player.h,vx:0,vy:0,onGround:true});g.currentRoomId=o.room;g.currentRegion=g.roomById.get(o.room).region;g.nearInteract={kind:'furniture',ref:o,label:ES9.FURNITURE[o.kind].name};};
 const use=(o,action)=>{place(o);return g.homeAction11(o,action);};
 check('18 unique shelters / 18 functional fixture types',Object.keys(ES11_ART).length===18&&new Set(g.furniture.filter(f=>f.refined11).map(f=>f.kind)).size===18);
 check('V10 preserved: 78 rooms / 120 skills / 10 classes / 10 elements',g.rooms.filter(r=>!r.v16).length===78&&Object.values(ES10_SKILLS).flat().length===120&&Object.keys(C.CLASSES).length===10&&C.ELEMENTS.length===10);
 check('no MP in player','mp' in g.player===false);
 const fridge=f('fridge','r00');g.player.hp=50;use(fridge,'ration');check('refrigerator heals and grants initial supplies',g.player.hp===95&&g.home11().herbs===2);
 use(fridge,'ration');check('ration cooldown blocks immediate duplicate',g.player.hp===95&&g.home11().herbs===2);
 const locker=f('locker','r00');const scrap=g.progress.scrap;use(locker,'openLocker');use(locker,'openLocker');check('locker claimed only once',g.progress.scrap===scrap+8);
 const bed=f('bed','r00');g.player.hp=1;g.player.burn=4;use(bed,'rest');check('bed heals / clears DOT / stores respawn',g.player.hp===g.player.maxHp&&g.player.burn===0&&g.home11().checkpoint.room==='r00');
 const bench=f('workbench','r00');g.cooldownsM.rift_step=g.time+20;use(bench,'tune');check('workbench clears mastery cooldown map',Object.keys(g.cooldownsM).length===0&&g.player.workT===90);
 const stove=f('stove','r00');const herb=g.home11().herbs;use(stove,'cook');check('stove consumes one herb and gives existing food buff',g.home11().herbs===herb-1&&g.player.foodT===180);
 const purifier=f('purifier','r00');g.player.web=g.player.poison=g.player.burn=3;g.player.shield=0;use(purifier,'purify');check('purifier clears all status / grants shield',g.player.web===0&&g.player.poison===0&&g.player.burn===0&&g.player.shield===25);
 const shelf=f('shelf');const pts=g.mState().points;use(shelf,'read');use(shelf,'read');check('resident journal grants points once',g.mState().points===pts+2);
 const garden=f('greenhouse','r00');place(garden);g.homeElement11(garden,'fire');check('wrong element cannot grow herbs',!g.home11().grown[garden.uid]);
 // Actual element projectile updates hit the generator / plants, not direct repair calls.
 function shootAt(o,id){g.elementShots=[];g.input.held.clear();place(o);g.player.x=o.x-100;g.player.y=o.y+o.h/2-g.player.h/2;g.player.dir=1;const i=C.ELEMENTS.findIndex(e=>e.id===id);g.fireElement(C.ELEMENTS[i],i);for(let n=0;n<130;n++)g.updateElements(1/120);}
 shootAt(garden,'nature');check('nature projectile really grows planter',g.home11().grown[garden.uid]);
 const hs=g.home11().herbs;use(garden,'harvest');use(garden,'harvest');check('harvest grants 2 herbs once per cooldown',g.home11().herbs===hs+2);
 const gen=f('generator','r00');shootAt(gen,'lightning');check('generator rejects wrong first element',!g.home11().power.r00&&(g.home11().steps.r00||0)===0);
 shootAt(gen,'water');check('water projectile advances repair to 1',g.home11().steps.r00===1);
 const pointsBefore=g.mState().points;shootAt(gen,'lightning');check('lightning projectile completes repair',g.home11().power.r00===true&&g.mState().points===pointsBefore+3);
 g.homeElement11(gen,'lightning');check('generator reward cannot be duplicated',g.mState().points===pointsBefore+3);
 const term=f('terminal');const h=g.home11();use(term,'bridge');check('unpowered terminal does not create bridge',!g.platforms.some(p=>p.bridge11===term.room));h.power[term.room]=true;use(term,'bridge');check('powered terminal creates solid platform',g.platforms.some(p=>p.bridge11===term.room&&p.oneWay));
 const rf=f('recycler');g.progress.scrap=42;const rp=g.mState().points;for(let n=0;n<6;n++)use(rf,'recycle');check('recycler conversion cap: five',g.progress.scrap===12&&g.mState().points===rp+5&&h.recycled[rf.uid]===5);
 const cab=f('cabinet');h.tokens[cab.room]=true;const cp=g.mState().points;use(cab,'display');use(cab,'display');check('collection cabinet claims once',g.mState().points===cp+2&&h.claims[cab.uid+':display']);
 const lamp=f('lamp');use(lamp,'lights');check('light switch off persists in progress',h.lights[lamp.room]===false);use(lamp,'lights');check('light switch on',h.lights[lamp.room]===true);
 const scope=f('telescope');const sp=g.mState().points;use(scope,'observe');use(scope,'observe');check('observatory first discovery points only once',g.mState().points===sp+2);
 const med=f('medbay');g.player.hp=10;g.player.poison=3;use(med,'heal');check('medical bed functional',g.player.hp===g.player.maxHp&&g.player.poison===0);
 const radio=f('radio','r00');use(radio,'scan');check('radio reveals connected rooms',Object.keys(g.progress.discovered).length>1&&h.rooms.r00.scanned);
 const sofa=f('sofa');g.cooldownsM.test=g.time+10;use(sofa,'sit');check('sofa clears six-slot cooldowns',Object.keys(g.cooldownsM).length===0);
 const unopened=Object.keys(ES11_ART).find(id=>!g.progress.shelters[id]);check('undiscovered fast travel blocked',unopened&&!g.havenTravel11(unopened));
 place(fridge);g.player.x+=1000;check('remote use rejected',g.homeAction11(fridge,'ration')===false);
 // Serialise exactly the JSON exported by the game, re-assign and re-claim the locker.
 const exported=JSON.parse(JSON.stringify(g.progress));g.progress=exported;place(locker);const s=g.progress.scrap;g.homeAction11(locker,'openLocker');check('JSON save round trip retains one-time claims',g.progress.scrap===s&&g.home11().power.r00);
 const shelters=Object.keys(ES11_ART);const support=g.furniture.filter(f=>f.refined11).every(f=>g.platforms.some(p=>p.active!==false&&Math.abs(p.y-(f.y+f.h))<=.5&&f.x+f.w/2>=p.x&&f.x+f.w/2<=p.x+p.w));check('every furnishing stands on a real floor/roof',support);
 check('all interactive art images loaded',Object.entries(g.assets).filter(([k])=>k.includes('11_')).every(([,im])=>im.complete&&im.naturalWidth>0));
 g.paused=false;return{tests:res,passed:res.filter(r=>r.pass).length,failed:res.filter(r=>!r.pass)};
}
