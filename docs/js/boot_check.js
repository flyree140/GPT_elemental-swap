/* Diagnostics never hide a startup or game-loop failure. No analytics. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);let fatal=null;
 function report(){const b=window.ES21_BOOT||{},g=window.ElementalSwap?.game;return {build:'21.6.0',protocol:location.protocol,userAgent:navigator.userAgent,boot:b,error:fatal?{message:fatal.message,stack:fatal.stack}:null,game:g?{room:g.currentRoomId,job:g.player.classId,time:g.time,view:[g.viewW,g.viewH]}:null};}
 function fail(error){fatal=error instanceof Error?error:new Error(String(error));const box=$('bootNotice'),text=$('bootText');if(!box)return;
 box.hidden=false;box.classList.add('boot-failed21');box.querySelector('strong').textContent='V21.6.0 啟動／執行檢查未通過';text.textContent=fatal.message;
 if(!$('bootTools21')){const div=document.createElement('div');div.id='bootTools21';const reload=document.createElement('button');reload.textContent='重新載入';reload.onclick=()=>location.reload();
 const exportBtn=document.createElement('button');exportBtn.textContent='匯出錯誤報告';exportBtn.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}));a.download='V21_diagnostic.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);};div.append(reload,exportBtn);box.append(div);}
 }
 window.ES21_DIAGNOSTICS={fail,report};
 addEventListener('error',e=>{if(e.error)fail(e.error);});addEventListener('unhandledrejection',e=>fail(e.reason));
 addEventListener('DOMContentLoaded',()=>{const box=$('bootNotice'),text=$('bootText');if(!box)return;
 const progress=document.createElement('progress');progress.id='bootProgress21';progress.max=1;box.append(progress);const started=performance.now();
 const timer=setInterval(()=>{const state=window.ES21_BOOT;
  if(fatal){clearInterval(timer);progress.hidden=true;return;}
  if(state){progress.value=state.ready/Math.max(1,state.total);text.textContent=`核心美術 ${state.ready} / ${state.total} 已載入並解碼。${state.status==='decoded'?'正在繪製第一個遊戲畫面…':'請保留完整資料夾。'}`;if(state.status==='ready'){box.hidden=true;clearInterval(timer);}}
  if(performance.now()-started>65000){clearInterval(timer);fail(new Error('啟動未完成。請確認 js/、assets/ 與全部樣式檔存在，或使用另附的 ESV21_6_0_PLAY_OFFLINE.html。'));}
 },120);
 });
})();
