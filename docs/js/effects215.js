/* V21.5.0: continuous pose composition, painted attack sweeps and short-lived
   spell/impact accents. This file never changes hitboxes or deletes game fields. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype,A=ES21_ART,TAU=Math.PI*2;
const cl=(x,a,b)=>Math.max(a,Math.min(b,x)),cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const brushes=new Map();function brush(color,kind='arc'){const key=color+kind;if(brushes.has(key))return brushes.get(key);const b=cv(300,300),c=b.getContext('2d');c.translate(150,150);
 const glow=c.createRadialGradient(0,0,1,0,0,128);glow.addColorStop(0,color+'32');glow.addColorStop(.55,color+'14');glow.addColorStop(1,color+'00');c.fillStyle=glow;c.fillRect(-145,-145,290,290);
 if(kind==='arc'){for(let pass=0;pass<3;pass++){const r=98-pass*3,w=pass===0?13:pass===1?6:1.5;c.fillStyle=pass===0?color+'80':pass===1?color:'#f4f0ff';c.beginPath();for(let j=0;j<=48;j++){const u=j/48,a=-1.80+u*3.45,rr=r+Math.pow(Math.sin(u*Math.PI),.8)*w;j?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}for(let j=48;j>=0;j--){const u=j/48,a=-1.80+u*3.45,rr=r-Math.sin(u*Math.PI)*w*.24;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();}c.strokeStyle=color+'85';c.lineWidth=.9;for(let j=0;j<3;j++){c.beginPath();c.arc(0,0,86-j*7,-1.8+j*.14,1.4-j*.3);c.stroke();}}
 else if(kind==='pierce'){const g=c.createLinearGradient(-100,0,115,0);g.addColorStop(0,color+'00');g.addColorStop(.6,color+'75');g.addColorStop(.96,'#fff2ff');g.addColorStop(1,color+'00');c.fillStyle=g;c.beginPath();c.moveTo(-125,-2);c.bezierCurveTo(-10,-4,43,-15,123,0);c.bezierCurveTo(43,15,-10,4,-125,2);c.fill();c.strokeStyle='#f8ecff';c.lineWidth=1.5;c.beginPath();c.moveTo(-30,0);c.lineTo(123,0);c.stroke();}
 else{for(let j=0;j<8;j++){const a=j*TAU/8,r=j%2?50:103;c.save();c.rotate(a);const g=c.createLinearGradient(0,0,r,0);g.addColorStop(0,'#fff8ff');g.addColorStop(.18,color+'f0');g.addColorStop(1,color+'00');c.fillStyle=g;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(r*.32,-3,r,0);c.quadraticCurveTo(r*.32,3,0,4);c.fill();c.restore();}}
 brushes.set(key,b);return b;}

// Dash ghosts are snapshots of actual earlier poses, painted behind the body.
const drawPlayer=P.drawPlayer;
P.drawPlayer=function(c,p,remote=false){const all=this.afterimages;this.afterimages=[];if(!remote&&p===this.player){if(this.ghostJob215!==p.classId){this.ghosts215=[];this.ghostJob215=p.classId;}if(p.classId==='beast'){this.motionPose215=null;this.actorFrame215=null;}}
 if(!remote&&p===this.player){const h=this.ghosts215||(this.ghosts215=[]);for(const s of h)if(this.time-s.at<.16){c.save();c.globalAlpha=.16*(1-(this.time-s.at)/.16);c.drawImage(s.b,s.x,s.y);c.restore();}}
 try{drawPlayer.call(this,c,p,remote);}finally{this.afterimages=all;}
 if(!remote&&p===this.player&&p.dashT>0&&this.actorFrame215&&this.time>(this.ghostAt215||0)){const pool=this.ghosts215||(this.ghosts215=[]);let s;if(pool.length<3){s={b:cv(240,210)};pool.push(s);}else{s=pool.shift();pool.push(s);}const q=s.b.getContext('2d');q.clearRect(0,0,240,210);q.drawImage(this.actorFrame215,0,0);s.x=p.x+p.w/2-120;s.y=p.y+p.h-198;s.at=this.time;this.ghostAt215=this.time+.045;}
};
const effects=P.drawEffects;P.drawEffects=function(c){const f=this.fInit(),l=this.lInit(),sw=f.swing,events=l.events,impacts=l.impacts;f.swing=null;l.events=[];l.impacts=[];
 try{effects.call(this,c);}finally{f.swing=sw;l.events=events;l.impacts=impacts;}
 const p=this.player,pose=this.motionPose215,col=A.jobs[p.classId]?.color||'#c1a0fb',t=this.time,trail=this.bladeTrail215||(this.bladeTrail215=[]);
 const active=pose&&p.attack&&pose.phase>.18&&pose.phase<.80&&!['cast','shoot','guard'].includes(pose.clip);
 if(active&&this.bladeAt215!==t){this.bladeAt215=t;const hand=pose.arms[1].end,dir=p.dir||1,origin={x:p.x+p.w/2,y:p.y+p.h},world=(x,y)=>({x:origin.x+(x-72)*.64*dir,y:origin.y+(y-208)*.64});const h=world(...hand),tip=world(hand[0]+Math.sin(pose.blade)*(ES215_WEAPONS[pose.id]?.length||54),hand[1]-Math.cos(pose.blade)*(ES215_WEAPONS[pose.id]?.length||54));trail.push({h,tip,at:t,id:p.attack});}
 while(trail.length&&(t-trail[0].at>.085||trail[0].id!==p.attack))trail.shift();while(trail.length>6)trail.shift();
 if(trail.length>1){c.save();c.globalCompositeOperation='screen';for(let j=1;j<trail.length;j++){const a=trail[j-1],b=trail[j];c.globalAlpha=.38*j/trail.length;c.fillStyle=col;c.beginPath();c.moveTo(a.h.x,a.h.y);c.lineTo(a.tip.x,a.tip.y);c.lineTo(b.tip.x,b.tip.y);c.lineTo(b.h.x,b.h.y);c.fill();c.globalAlpha=.8*j/trail.length;c.strokeStyle='#f4efff';c.lineWidth=1.2;c.beginPath();c.moveTo(a.tip.x,a.tip.y);c.lineTo(b.tip.x,b.tip.y);c.stroke();}c.restore();}
 l.events=events.filter(e=>t-e.start<.65);for(const e of l.events){const age=t-e.start,u=age/.65,fade=Math.min(1,age*28)*Math.pow(1-u,1.7),x=e.x+e.dir*37,y=e.y;const beam=['rifle','snipe','beam','needle','barrage','gun'].some(s=>(e.op||'').toLowerCase().includes(s));c.save();c.globalAlpha=fade*.75;c.translate(x,y);c.scale(e.dir||1,1);
 // The cast ring grows into release and collapses into sparks instead of popping off.
 c.strokeStyle=e.color;c.lineWidth=1.1;c.beginPath();c.ellipse(0,0,9+u*8,21+Math.sin(u*Math.PI)*9,0,0,TAU);c.stroke();c.drawImage(brush(e.color,beam?'pierce':'burst'),-51-u*15,-56-u*12,112+u*30,112+u*25);c.restore();}
 l.impacts=impacts.filter(e=>t-e.start<.34);for(const e of l.impacts){if(e.x<this.camera.x-150||e.x>this.camera.x+this.viewW+150||e.y<this.camera.y-150||e.y>this.camera.y+this.viewH+150)continue;const u=(t-e.start)/.34,r=48+(e.big?78:42)*u;c.save();c.globalAlpha=Math.pow(1-u,1.8)*.85;c.translate(e.x,e.y);c.rotate(e.seed||0);c.drawImage(brush(e.color,'burst'),-r/2,-r/2,r,r);c.restore();}
};
window.ES215_EFFECTS={brushCount:()=>brushes.size,types:['arc','pierce','burst']};
})();
