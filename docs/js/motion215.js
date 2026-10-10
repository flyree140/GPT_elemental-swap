/* 21.5: continuous SKIN, not disjoint rotating cutouts.
   Dense painted atlases + shared-vertex two-bone ribbons. Fixed lengths, distance
   based gait, hit-pulse-aligned actions, short pose transitions. All surfaces are
   reused. Rendering twice at the same simulation time never advances a pose. */
(()=>{'use strict';
const P=ES9_ENGINE.Game.prototype,A=ES21_ART,TAU=Math.PI*2;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,sm=t=>(t=cl(t,0,1),t*t*(3-2*t)),pt=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
const L={thigh:35,shin:38,upperArm:27,forearm:27};
function solve(a,b,l1,l2,side){let dx=b[0]-a[0],dy=b[1]-a[1],d0=Math.hypot(dx,dy)||1,d=cl(d0,Math.abs(l1-l2)+.2,l1+l2-.3),ang=Math.atan2(dy,dx),bend=Math.acos(cl((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return{mid:[a[0]+l1*Math.cos(ang+side*bend),a[1]+l1*Math.sin(ang+side*bend)],end:[a[0]+dx/d0*d,a[1]+dy/d0*d]};}
function curve(keys,t){for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i],u=sm((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>mix(v,b[j+1],u));}return keys.at(-1).slice(1);}
// lean, hand x/y, blade angle (blade points upward at 0), crouch.
// The middle key is contact; time remapping aligns it to the actual damage pulse.
const clips={
 slash:[[0,-.08,95,100,.7,0],[.25,-.16,68,52,-1.4,1],[.46,.22,117,94,1.40,4],[.70,.25,106,123,2.60,4],[1,0,101,108,.55,0]],
 backslash:[[0,.05,104,118,2.4,1],[.25,.13,106,124,2.85,3],[.46,-.08,118,78,.40,2],[.70,-.13,85,52,-.90,0],[1,0,101,108,.55,0]],
 thrust:[[0,0,100,103,1.50,0],[.25,-.10,77,99,1.53,2],[.46,.20,132,88,1.57,3],[.64,.18,132,88,1.57,3],[1,0,101,108,.65,0]],
 heavy:[[0,-.03,97,100,.7,0],[.25,-.19,72,39,-.75,-1],[.46,.29,121,111,2.3,9],[.70,.26,106,134,2.9,9],[1,0,101,108,.65,0]],
 lift:[[0,.05,98,115,2.1,1],[.25,.14,91,135,2.9,8],[.46,-.10,120,67,.45,2],[.70,-.14,89,31,-.65,-2],[1,0,101,108,.65,0]],
 low:[[0,.03,95,109,.8,1],[.25,-.04,66,119,-.2,9],[.46,.20,122,132,1.8,16],[.70,.17,115,136,2.3,14],[1,0,101,108,.65,0]],
 plunge:[[0,0,98,88,.5,0],[.25,-.15,75,37,-.55,1],[.46,.22,118,130,2.92,10],[.70,.26,106,140,3.12,12],[1,0,101,108,.65,0]],
 punch:[[0,0,97,94,.6,0],[.25,-.12,84,91,.8,2],[.46,.17,132,81,1.6,3],[.70,.09,118,87,1.2,2],[1,0,97,94,.6,0]],
 cast:[[0,0,98,111,.5,0],[.25,-.10,79,78,-.3,1],[.46,.10,120,75,.4,1],[.70,.04,117,78,.5,0],[1,0,98,111,.5,0]],
 shoot:[[0,0,106,95,1.57,0],[.25,.03,118,84,1.57,1],[.46,-.05,107,82,1.62,1],[.70,.02,116,85,1.57,0],[1,0,106,95,1.5,0]],
 guard:[[0,0,100,101,.6,0],[.25,-.07,107,75,.1,4],[.46,-.12,102,75,-.1,5],[.7,-.03,109,78,.15,4],[1,0,100,101,.6,0]]
};
function action(d,gear){if(['gun','rifle'].includes(gear))return'shoot';if(gear==='fist')return'punch';const s=d.shape19||'';if(['down','quake','root'].includes(s))return'plunge';if(s==='lift'||d.launch)return'lift';if(['thrust','flurry'].includes(s))return'thrust';if(s==='low')return'low';if(['heavy','break','double'].includes(s))return'heavy';if(s==='parry')return'guard';if(s==='hook'||d.key==='ZZ')return'backslash';return'slash';}
function gait(u,run){u=(u%1+1)%1;const span=mix(30,46,run),stance=mix(.62,.43,run);if(u<stance)return{x:mix(span,-span,u/stance),y:0,roll:u>stance-.13?mix(0,.30,(u-stance+.13)/.13):-.08*(1-u/stance),stance:true};const t=(u-stance)/(1-stance);return{x:mix(-span,span,sm(t)),y:-Math.pow(Math.sin(t*Math.PI),.8)*mix(15,39,run),roll:-.24*Math.sin(t*Math.PI),stance:false};}
P.aPose215=function(p){const now=p.animClock214??this.time,id=A.jobs[p.classId]?p.classId:'dreamweaver',gear=A.jobs[id].gear;let s=p._motion215;
 if(!s||s.id!==id){s={id,last:now,x:p.motionX214??p.x,phase:0,move:0,run:0,air:p.onGround===false?1:0,ground:p.onGround!==false,land:-9,attack:null,clip:'idle',changed:now,from:null,lastPose:null,cast:-9,casting:false};Object.defineProperty(p,'_motion215',{value:s,writable:true,configurable:true});}
 const dt=cl(now-s.last,0,.07),vx=Math.abs(p.vx||0),ground=p.onGround!==false,x=p.motionX214??p.x;
 if(dt>0){const k=1-Math.exp(-18*dt);s.move=mix(s.move,cl(vx/100,0,1),k);s.run=mix(s.run,cl((vx-130)/170,0,1),k);s.air=mix(s.air,ground?0:1,1-Math.exp(-27*dt));const dx=Math.abs(x-s.x);if(ground&&vx>4){const stride=2*mix(30,46,s.run)*.64/mix(.62,.43,s.run);s.phase=(s.phase+(dx<85?dx:vx*dt)/stride)%1;}if(!s.ground&&ground)s.land=now;if(p.castT>0&&!s.casting)s.cast=now;s.casting=p.castT>0;s.ground=ground;s.x=x;s.last=now;}
 const moving=s.move*(1-s.air),a=gait(s.phase,s.run),b=gait(s.phase+.5,s.run),land=cl(1-(now-s.land)/.16,0,1),dash=p.dashT>0;
 let hipY=mix(125,133+s.run*Math.sin(s.phase*TAU*2)*2,moving)+Math.sin(land*Math.PI)*5;
 let lean=moving*mix(.04,.22,s.run),front=[95-Math.sin(s.phase*TAU)*moving*19,109-Math.abs(Math.sin(s.phase*TAU))*moving*12],back=[63+Math.sin(s.phase*TAU)*moving*21,109-Math.abs(Math.sin(s.phase*TAU))*moving*8];
 let feet=[pt([65,195],[72+b.x,195+b.y],moving),pt([86,195],[76+a.x,195+a.y],moving)],rolls=[b.roll*moving,a.roll*moving],blade=.65;
 const fall=cl((p.vy||0)/620,-1,1);
 if(s.air>0){feet[0]=pt(feet[0],[48+fall*8,164+Math.max(0,fall)*26],s.air);feet[1]=pt(feet[1],[102,184+fall*9],s.air);front=pt(front,[108,83+fall*13],s.air);back=pt(back,[52,101-fall*5],s.air);lean=mix(lean,.10-fall*.04,s.air);hipY=mix(hipY,125,s.air);}
 if(dash){lean=.54;hipY=135;feet=[[29,174],[95,187]];back=[35,90];front=[71,108];blade=-.75;rolls=[.4,.2];}
 let clip=null,u=0,phase=0;
 if(p.attack){const d=p.attack.def||{};clip=action(d,gear);const elapsed=p.attack.elapsed||0,dur=Math.max(.08,d.dur||.35),pulses=d.pulses19||[d.hit??dur*.4];let j=0;while(j<pulses.length-1&&elapsed>mix(pulses[j],pulses[j+1],.5))j++;const start=j?mix(pulses[j-1],pulses[j],.5):0,end=j<pulses.length-1?mix(pulses[j],pulses[j+1],.5):dur,contact=cl(pulses[j],start+.005,end-.005);u=cl(elapsed/dur,0,1);phase=elapsed<=contact?cl((elapsed-start)/(contact-start),0,1)*.46:.46+cl((elapsed-contact)/(end-contact),0,1)*.54;if(clip==='slash'&&j%2)clip='backslash';}
 else if(p.castT>0){clip=['gun','rifle'].includes(gear)?'shoot':'cast';phase=p.id===90001?(now%1.1)/1.1:cl((now-s.cast)/.5,0,.8);u=phase;}
 if(clip){const q=curve(clips[clip],phase);lean+=q[0];front=[q[1],q[2]];blade=q[3];if(ground){hipY+=q[4];const st=Math.sin(phase*Math.PI);feet[0][0]-=st*8;feet[1][0]+=st*7;}back=gear==='rifle'?[112,95]:clip==='heavy'||clip==='plunge'?[front[0]-8,front[1]+7]:[57,105];}
 if(!clip&&['gun','rifle'].includes(gear)){front=[110,97];blade=1.50;back=gear==='rifle'?[113,104]:back;}
 let state=p.downT>0?'down':p.hurtT>0?'hurt':p.recoverT>0?'recover':dash?'dash':clip||(!ground?(p.vy<0?'jump':'fall'):land>0?'land':vx>180?'run':vx>7?'walk':'idle');
 if(state==='hurt'){lean=-.19;front=[94,91];back=[60,102];hipY+=3;}
 if(state==='down'){lean=-.94;hipY+=25;feet=[[33,186],[82,187]];front=[99,109];back=[64,108];}
 if(state==='recover'){lean=-.26;hipY+=12;feet=[[51,192],[93,194]];}
 if(state==='idle'){hipY+=Math.sin(now*2.6)*.6;front[1]+=Math.sin(now*2.6)*.5;}
 const key=state+':'+(p.attack?.def?.key||'');if(s.clip!==key){s.from=s.lastPose;s.changed=now;s.clip=key;}
 const blend=sm((now-s.changed)/((clip&&s.from?.clip)?.045:.09));
 if(s.from&&blend<1){lean=mix(s.from.lean,lean,blend);hipY=mix(s.from.hipY,hipY,blend);front=pt(s.from.front,front,blend);back=pt(s.from.back,back,blend);feet=feet.map((f,i)=>pt(s.from.feet[i],f,blend));blade=mix(s.from.blade,blade,blend);}
 const upper=v=>{const xx=v[0]-72,yy=v[1]-124;return[72+xx*Math.cos(lean)-yy*Math.sin(lean),hipY+xx*Math.sin(lean)+yy*Math.cos(lean)];};
 const hips=[[65,hipY-1],[79,hipY-1]],sb=upper([60,69]),sf=upper([82,71]),legs=feet.map((f,i)=>solve(hips[i],f,L.thigh,L.shin,-1));
 // Elbows bend below/back toward the body, opposite to the forward knee pole.
 const arms=[solve(sb,upper(back),L.upperArm,L.forearm,1),solve(sf,upper(front),L.upperArm,L.forearm,1)];
 const pose={id,gear,state,clip,u,phase,hips,legs,arms,sb,sf,lean,hipY,front,back,feet,rolls,blade,weapon:blade,upper,moving,run:s.run,ground,s};s.lastPose=pose;return pose;
};
function patch(c,im,m,name){const q=m[name];if(!q)return;const r=q.rect;c.drawImage(im,...r,...q.origin,r[2],r[3]);}
function triangle(c,im,rect,src,dst){const [a,b,d]=src,[u,v,w]=dst,den=(b[0]-a[0])*(d[1]-a[1])-(d[0]-a[0])*(b[1]-a[1]);if(Math.abs(den)<.00001)return;
 const ax=((v[0]-u[0])*(d[1]-a[1])-(w[0]-u[0])*(b[1]-a[1]))/den,bx=((v[1]-u[1])*(d[1]-a[1])-(w[1]-u[1])*(b[1]-a[1]))/den;
 const ay=((w[0]-u[0])*(b[0]-a[0])-(v[0]-u[0])*(d[0]-a[0]))/den,by=((w[1]-u[1])*(b[0]-a[0])-(v[1]-u[1])*(d[0]-a[0]))/den;
 c.save();c.beginPath();const mx=(u[0]+v[0]+w[0])/3,my=(u[1]+v[1]+w[1])/3;for(let j=0;j<3;j++){const z=dst[j],dx=z[0]-mx,dy=z[1]-my,dd=Math.hypot(dx,dy)||1,xx=z[0]+dx/dd*.22,yy=z[1]+dy/dd*.22;j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.clip();c.transform(ax,bx,ay,by,u[0]-ax*a[0]-ay*a[1],u[1]-bx*a[0]-by*a[1]);c.drawImage(im,...rect,0,0,rect[2],rect[3]);c.restore();}
function mesh(c,im,q,a,j,b){const [xc,top,knee,end]=q.joint,r=q.rect,w=r[2],h=r[3],len1=Math.hypot(j[0]-a[0],j[1]-a[1]),len2=Math.hypot(b[0]-j[0],b[1]-j[1]),u1=[(j[0]-a[0])/len1,(j[1]-a[1])/len1],u2=[(b[0]-j[0])/len2,(b[1]-j[1])/len2];
 const rows=[0,top,knee-5,knee,knee+5,end,h];const nodes=rows.map(y=>{const before=y<=knee,base=before?a:j,dir=before?u1:u2,k=before?(y-top)/(knee-top)*len1:(y-knee)/(end-knee)*len2,center=[base[0]+dir[0]*k,base[1]+dir[1]*k],t=cl((y-knee+5)/10,0,1),tx=mix(u1[0],u2[0],t),ty=mix(u1[1],u2[1],t),ln=Math.hypot(tx,ty)||1,nx=ty/ln,ny=-tx/ln;return[[center[0]-nx*xc,center[1]-ny*xc],[center[0]+nx*(w-xc),center[1]+ny*(w-xc)]];});
 for(let i=0;i<rows.length-1;i++){const y=rows[i],z=rows[i+1],a=nodes[i],b=nodes[i+1];triangle(c,im,r,[[0,y],[w,y],[w,z]],[a[0],a[1],b[1]]);triangle(c,im,r,[[0,y],[w,z],[0,z]],[a[0],b[1],b[0]]);}}
function cape(c,p,t,color){const sh=p.upper([54,66]),speed=p.moving,wind=(p.state==='dash'?38:17*speed),wave=Math.sin(t*4-1)*5;c.save();const g=c.createLinearGradient(sh[0]-45,sh[1],sh[0]+10,sh[1]+120);g.addColorStop(0,'#182033');g.addColorStop(.48,A.jobs[p.id].coat);g.addColorStop(1,'#1b263c');c.fillStyle=g;c.beginPath();c.moveTo(sh[0]+8,sh[1]-1);c.bezierCurveTo(sh[0]-5,sh[1]+25,sh[0]-13-wind,sh[1]+66,sh[0]-22-wind+wave,sh[1]+119-speed*20);c.bezierCurveTo(sh[0]-8-wind,sh[1]+119-speed*22,sh[0]+4-wind,sh[1]+107-speed*20,sh[0]+10,sh[1]+85);c.bezierCurveTo(sh[0]+21,sh[1]+50,sh[0]+17,sh[1]+21,sh[0]+8,sh[1]-1);c.fill();c.strokeStyle=color+'85';c.lineWidth=1.1;c.beginPath();c.moveTo(sh[0]+4,sh[1]+5);c.bezierCurveTo(sh[0]-7,sh[1]+52,sh[0]-16-wind,sh[1]+80,sh[0]-22-wind+wave,sh[1]+119-speed*20);c.stroke();c.strokeStyle='#97a5c23b';c.beginPath();c.moveTo(sh[0]+11,sh[1]+12);c.quadraticCurveTo(sh[0]+3,sh[1]+58,sh[0]-8-wind,sh[1]+97-speed*10);c.stroke();c.restore();}
P.aPaint215=function(c,p,pose){const im=this.assets['m215_'+pose.id],m=ES215_RIGS[pose.id];if(!im?.naturalWidth)return;const col=A.jobs[pose.id].color;c.save();c.translate(p.x+(p.w||40)/2,p.y+(p.h||60));c.scale((p.dir||1)*.64,.64);c.translate(-72,-208);c.imageSmoothingEnabled=true;
 cape(c,pose,p.animClock214??this.time,col);
 const leg=i=>{const chain=pose.legs[i];c.save();if(!i)c.globalAlpha*=.88;mesh(c,im,m['leg'+(i?'Front':'Back')],pose.hips[i],chain.mid,chain.end);c.save();c.translate(...chain.end);c.rotate(pose.rolls[i]);c.translate(-81,-192);patch(c,im,m,'footFront');c.restore();c.restore();};
 leg(0);mesh(c,im,m.armBack,pose.sb,pose.arms[0].mid,pose.arms[0].end);leg(1);
 c.save();c.translate(72,pose.hipY);c.rotate(pose.lean);c.translate(-72,-124);patch(c,im,m,'torso');c.save();c.translate(68,60);c.rotate(-pose.lean*.72);c.translate(-68,-60);patch(c,im,m,'head');c.restore();c.restore();
 mesh(c,im,m.armFront,pose.sf,pose.arms[1].mid,pose.arms[1].end);
 const hand=pose.arms[1].end,wep=this.assets['l21_weapon_'+pose.id];if(wep?.naturalWidth){const w=ES215_WEAPONS[pose.id];c.save();c.translate(...hand);c.rotate(pose.gear==='fist'?0:pose.blade+w.rotation);c.scale(w.scale,w.scale);c.drawImage(wep,-w.grip[0],-w.grip[1]);c.restore();}
 // Unified glove and wrist: the handle goes UNDER the closed palm.
 c.fillStyle=A.jobs[pose.id].coat;c.strokeStyle=col+'99';c.lineWidth=.75;c.beginPath();c.ellipse(hand[0],hand[1],3.4,4.0,pose.blade,0,TAU);c.fill();c.stroke();
 c.restore();};
const actors=new WeakMap();P.aActor=function(c,p,opacity=1,remote=false){if(p.id===90001||remote){const key=remote?'remote:'+p.id:'preview';const pool=this.actorPool215||(this.actorPool215=new Map());let keep=pool.get(key);if(!keep){keep={};pool.set(key,keep);if(pool.size>8)pool.delete(pool.keys().next().value);}const prior=keep._motion215;Object.assign(keep,p);keep._motion215=prior;p=keep;}if(p.id===90001){p.animClock214=performance.now()/1000;p.motionX214=(p.vx||0)*p.animClock214;}const pose=this.aPose215(p);let slot=actors.get(p);if(!slot){const b=document.createElement('canvas');b.width=240;b.height=210;slot={b,q:b.getContext('2d'),time:-1,dir:0};actors.set(p,slot);}const t=p.animClock214??this.time;if(slot.time!==t||slot.dir!==p.dir||slot.cls!==p.classId){slot.q.clearRect(0,0,240,210);this.aPaint215(slot.q,{...p,x:100,y:138,w:40,h:60},pose);slot.time=t;slot.dir=p.dir;slot.cls=p.classId;}
 c.save();c.globalAlpha*=opacity;c.drawImage(slot.b,p.x+(p.w||40)/2-120,p.y+(p.h||60)-198);c.restore();if(p===this.player){this.motionPose215=pose;this.motionPose214=pose;this.actorFrame215=slot.b;this.tInit().pose={version:'21.5.0',state:pose.state,phase:pose.phase,joints:{hips:pose.hips,knees:pose.legs.map(x=>x.mid),ankles:pose.legs.map(x=>x.end),shoulders:[pose.sb,pose.sf],elbows:pose.arms.map(x=>x.mid),hands:pose.arms.map(x=>x.end)},boneLengths:L};}};
window.ES215_MOTION={lengths:L,clips:Object.keys(clips),solve,mesh,version:'21.5.0'};
})();
