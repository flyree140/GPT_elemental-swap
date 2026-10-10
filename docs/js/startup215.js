/* 21.5 render/startup diagnostics. */
(()=>{'use strict';const P=ES9_ENGINE.Game.prototype;
const render=P.render;P.render=function(...args){
 // Reset common mutable drawing state. Viewport is computed from the actual canvas.
 const c=this.ctx,d=this.canvas.width/Math.max(1,this.viewW);c.setTransform(d,0,0,d,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';c.shadowBlur=0;c.setLineDash([]);
 render.apply(this,args);
 const b=window.ES21_BOOT;if(b&&this.bootReady){b.frames++;if(b.frames>=2){b.status='ready';const box=document.getElementById('bootNotice');if(box)box.hidden=true;}}
};
const bind=P.bindUI;P.bindUI=function(){bind.call(this);ES9.VERSION='21.6.0';
 const tag=document.querySelector('#brand21 small');if(tag)tag.innerHTML='V21.6.0<br>整體姿態・空中換位';
 document.title='澄界 V21.6.0｜光織紀・整體姿態・空中換位';
 document.getElementById('helpPanel')?.querySelector('h2')?.replaceChildren(document.createTextNode('V21.6.0 操作說明'));
 const note=document.createElement('p');note.className='build21-note';note.textContent='BUILD 21.6.0 · 2026-09-23 · 整體姿態、六流派、時空失控 · 不清除舊存檔';document.querySelector('#helpPanel .panel')?.append(note);
};
})();
