/* Optional PeerJS two-player layer. Single-player works when PeerJS is unavailable. */
(function(){
  class ES9Network{
    constructor(){this.peer=null;this.conn=null;this.connected=false;this.isHost=false;this.id='';this.handlers=new Map();this.lastSend=0;}
    on(type,fn){if(!this.handlers.has(type))this.handlers.set(type,[]);this.handlers.get(type).push(fn);}
    emit(type,data){for(const fn of this.handlers.get(type)||[])fn(data);}
    attach(conn){this.conn=conn;conn.on('open',()=>{this.connected=true;this.emit('status','2P 已連線');this.emit('connected',conn.peer);});conn.on('data',d=>{if(d?.type)this.emit(d.type,d.payload);});conn.on('close',()=>{this.connected=false;this.emit('status','連線中斷');});conn.on('error',e=>this.emit('error',e?.message||String(e)));}
    host(){if(!window.Peer)throw new Error('PeerJS 尚未載入；單人模式仍可遊玩。');this.close();this.isHost=true;this.peer=new Peer();this.peer.on('open',id=>{this.id=id;this.emit('room',id);this.emit('status','房間等待加入');});this.peer.on('connection',c=>this.attach(c));this.peer.on('error',e=>this.emit('error',e?.message||String(e)));}
    join(id){if(!window.Peer)throw new Error('PeerJS 尚未載入；單人模式仍可遊玩。');if(!id)throw new Error('請輸入房間代碼。');this.close();this.isHost=false;this.peer=new Peer();this.peer.on('open',()=>this.attach(this.peer.connect(id,{reliable:true,serialization:'json'})));this.peer.on('error',e=>this.emit('error',e?.message||String(e)));}
    send(type,payload){if(this.conn?.open){this.conn.send({type,payload});return true;}return false;}
    sendState(state,ms){if(!this.connected||ms-this.lastSend<50)return;this.lastSend=ms;this.send('player',state);}
    close(){try{this.conn?.close();}catch{}try{this.peer?.destroy();}catch{}this.conn=null;this.peer=null;this.connected=false;this.id='';}
  }
  window.ES9Network=ES9Network;
})();
/* V10: do not contact a CDN during offline single-player startup.
 * PeerJS is loaded only after an explicit Create/Join click. */
(function(){
 let pending=null;
 function ready(){if(window.Peer)return Promise.resolve();if(pending)return pending;
  pending=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js';s.async=true;
   const timer=setTimeout(()=>{s.remove();pending=null;reject(new Error('連線元件載入逾時；單人遊玩不受影響。'));},12000);
   s.onload=()=>{clearTimeout(timer);window.Peer?resolve():reject(new Error('PeerJS 載入失敗。'));};s.onerror=()=>{clearTimeout(timer);pending=null;reject(new Error('目前無法載入連線元件；單人遊玩不受影響。'));};document.head.append(s);});return pending;}
 const P=window.ES9Network.prototype,host=P.host,join=P.join;
 P.host=function(){this.emit('status','準備連線元件…');ready().then(()=>host.call(this)).catch(e=>this.emit('error',e.message));};
 P.join=function(id){if(!id){this.emit('error','請輸入房間代碼。');return;}this.emit('status','準備連線元件…');ready().then(()=>join.call(this,id)).catch(e=>this.emit('error',e.message));};
})();
