#!/usr/bin/env python3
"""Desktop keyboard and offline screenshot smoke test; Playwright is test-only."""
from pathlib import Path
import argparse, json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SETUP="""() => { const g=window.g218=ElementalSwap.game,p=g.player;cancelAnimationFrame(g.frameHandle);g.close216();g.closeModalsM();g.paused=false;const r=g.roomById.get('r01');g.currentRoomId=r.id;g.enemies=[];g.enemyShots=[];g.elementShots=[];g.fields=[];g.setStyle216('blade',true);g.vInit().mode='now';g.nInit().rule='now';
Object.assign(p,{x:r.x+300,y:r.floorY-p.h,vx:0,vy:0,dir:1,onGround:true,attack:null,castT:0,downT:0,recoverT:0,hurtT:0,hp:p.maxHp,inv:100,dashT:0,dashCD:0,jumps:0,coyote:0,jumpBuffer:0});
Object.assign(g.uState216(),{queue:[],cd:{},fields:[],buffer:null,lastSkill:-999,time:0,space:0,warning:null,active:null,trace:null,lastSwap:-999});Object.assign(g.aState217(),{weapon:'',relics:[],branches:{},cd:{}});g.r218=null;Object.assign(g.vInit(),{actions:[],path:[],sampleAt:0,lastPos:null,echo:null,echoShots:[]});g.input.held.clear();g.input.pressed.clear();g.input.released.clear();g.canvas.focus();
const e=g.spawnEnemy('dummy',p.x+90,r.floorY,{room:r.id,hp:10000});e.practiceM=true;e.training217=true;e.v16Layer='ALL';e.damage=0;window.target218=e;
for(let i=0;i<3;i++){g.update(1/60,performance.now());g.input.end();}g.updateCamera(1);g.render();return {ground:p.onGround,y:p.y,floor:r.floorY}; }"""
STEP="""n=>{const g=g218;for(let i=0;i<n;i++){g.update(1/60,performance.now());g.input.end();}g.refresh216();g.render();return {key:g.player.attack?.def.key,ground:g.player.onGround,vy:g.player.vy,hit:g.player.attack?.connected217};}"""
WAIT="""()=>{const g=g218,a=g.player.attack;let n=a?Math.max(1,Math.ceil((a.def.cancel-a.elapsed+.003)*60)):1;for(let i=0;i<n;i++){g.update(1/60,performance.now());g.input.end();}return g.player.attack?.def.key;}"""
def main():
    pa=argparse.ArgumentParser();pa.add_argument('--chromium',default='/usr/bin/chromium');args=pa.parse_args()
    out=ROOT/'reports/qa218';out.mkdir(exist_ok=True,parents=True);pre=ROOT/'previews/qa218';pre.mkdir(exist_ok=True,parents=True)
    results=[];errors=[];requests=[]
    def check(name,condition,detail=None):results.append({'name':name,'pass':bool(condition),'detail':detail})
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path=args.chromium,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        p=b.new_page(viewport={'width':1600,'height':900});p.on('pageerror',lambda e:errors.append(str(e)))
        p.on('request',lambda req:requests.append(req.url) if req.url.startswith(('http:','https:')) else None)
        p.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load',timeout=90000);p.wait_for_function("window.ES21_BOOT?.status==='ready'",timeout=30000)
        check('Standalone boots with all assets',p.evaluate("ES21_BOOT.status==='ready'&&ElementalSwap.game.assetReport215().failures.length===0"))
        p.screenshot(path=str(pre/'intro.png'))
        setup=p.evaluate(SETUP);check('Fixture stands on a real collidable floor',setup['ground'],setup)
        seq=[]
        def press(k):
            p.keyboard.down(k);state=p.evaluate(STEP,1);p.keyboard.up(k);p.evaluate("g218.input.released.clear()");return state
        for key in ['z','z','x']:
            if seq:p.evaluate(WAIT)
            seq.append(press(key).get('key'))
        check('Actual keyboard ZZX is parsed as a launcher',seq==['Z','ZZ','ZZX'],seq)
        # Use fixed remaining count (not a shrinking loop limit) for the hit frame.
        p.evaluate("()=>{const g=g218,a=g.player.attack;const n=Math.max(1,Math.ceil((a.def.pulses19.at(-1)-a.elapsed+.015)*60));for(let i=0;i<n;i++){g.update(1/60,performance.now());g.input.end();}}")
        jump=press('Space');check('Actual Space confirms a launcher jump cancel',not jump.get('key') and jump['vy']<0,jump)
        seq=[]
        for key in ['z','z','x']:
            if seq:p.evaluate(WAIT)
            seq.append(press(key).get('key'))
        check('Actual airborne ZZX reaches dive finisher',seq==['AIRZ','AIRZZ','AIRZZX'],seq)
        press('f');snap=p.evaluate("({active:!!g218.vInit().echo,counts:g218.vInit().echo?.counts})")
        check('F keyboard starts recorded attack replay',snap['active'] and snap['counts']['attacks']>0,snap)
        p.evaluate(STEP,135);p.screenshot(path=str(pre/'combat_echo.png'))
        p.evaluate(STEP,105);check('Keyboard echo completes all snapshotted events',p.evaluate("!!g218.rState218().lastRun?.complete"))
        p.evaluate(SETUP);p.keyboard.down('ArrowRight');p.evaluate(STEP,2);p.keyboard.up('ArrowRight');p.evaluate(STEP,3);p.keyboard.down('ArrowRight');p.evaluate(STEP,1);seq=press('z');p.keyboard.up('ArrowRight');
        check('Real double-tap plus Z starts DASHZ',seq.get('key')=='DASHZ',seq)
        p.evaluate(SETUP);p.keyboard.down('Shift');seq=press('z');p.keyboard.up('Shift');check('Real Shift plus Z starts DASHZ',seq.get('key')=='DASHZ',seq)
        p.evaluate(SETUP);press('c');press('f');p.evaluate(STEP,12);snap=p.evaluate("({active:!!g218.vInit().echo,duration:g218.vInit().echo?.duration,hits:g218.vInit().echo?.actions.filter(a=>['circle','line18','target','projectile'].includes(a.kind)).length})")
        check('Real C then F includes delayed skill damage',snap['active'] and snap['hits']>0,snap)
        p.evaluate("g218.show216('help')");p.screenshot(path=str(pre/'help.png'))
        check('Help panel shows updated controls',p.locator('.r-help218').count()==1)
        p.set_viewport_size({'width':1366,'height':768});p.evaluate("g218.close216();g218.resize();g218.refresh216();g218.render()");p.screenshot(path=str(pre/'desktop1366.png'))
        metrics=p.evaluate("['skills216','comboGuide216','echoJournal218'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}})")
        check('Desktop 1366x768 fixed HUD remains inside viewport',all(r['x']>=0 and r['right']<=1366 and r['bottom']<=768 for r in metrics),metrics)
        check('Standalone makes zero HTTP / HTTPS requests',not requests,requests)
        check('No uncaught JavaScript errors during keyboard play',not errors,errors)
        b.close()
    result={'version':'21.8.0','passed':sum(r['pass'] for r in results),'total':len(results),'results':results,'pageErrors':errors}
    (out/'keyboard218.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['passed']==result['total'] else 1
if __name__=='__main__':raise SystemExit(main())
