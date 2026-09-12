#!/usr/bin/env python3
"""
Elemental Swap V9.1 animation / bestiary / boss asset repair.

This script regenerates:
- 7 humanoid class sprite sheets (48x52, 8 frames, 16 rows)
- 4 beast-form sheets (64x64, 8 frames, 7 rows)
- 17 normal enemy sheets + 1 final boss sheet (48x48, 8 frames, 6 rows)
- Updated 18-entry monster atlas

Every drawing is clipped inside its frame.  This prevents the V9 bug where a
character's legs spilled into the next sprite row and appeared separated from
the torso while running/jumping.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
import random

ROOT = Path(__file__).resolve().parents[1]
SPR = ROOT / "assets" / "sprites"
CODEX = ROOT / "assets" / "codex"
SPR.mkdir(parents=True, exist_ok=True)
CODEX.mkdir(parents=True, exist_ok=True)

FONT_PATHS = [
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

def font(size: int):
    for p in FONT_PATHS:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def px(d: ImageDraw.ImageDraw, x, y, w, h, c):
    # Clamp to the current frame dimensions through PIL's normal clipping.
    d.rectangle((round(x), round(y), round(x + w - 1), round(y + h - 1)), fill=c)


def ln(d: ImageDraw.ImageDraw, pts, c, w=1):
    d.line([(round(x), round(y)) for x, y in pts], fill=c, width=w)


def circ(d: ImageDraw.ImageDraw, x, y, r, c, outline=None, width=1):
    d.ellipse((round(x-r), round(y-r), round(x+r), round(y+r)), fill=c, outline=outline, width=width)

# -----------------------------------------------------------------------------
# Humanoid classes
# -----------------------------------------------------------------------------
FW, FH, FRAMES, ROWS = 48, 52, 8, 16
ROW_NAMES = [
    "idle", "run", "jump", "fall", "z1", "z2", "x", "launch",
    "air", "dash", "hurt", "down", "cast", "skill1", "skill2", "victory",
]

PALETTES = {
    "rift":      dict(body="#dff9f7", coat="#65d8d7", dark="#183641", accent="#74ffff", skin="#e4b08d", hair="#152a39", weapon="#eaffff"),
    "summoner":  dict(body="#eadcf4", coat="#9d6fba", dark="#332444", accent="#e4a3ff", skin="#dba78d", hair="#382044", weapon="#f6d67b"),
    "artificer": dict(body="#e4e8df", coat="#bd7f49", dark="#3b3832", accent="#73dfe2", skin="#d7a37e", hair="#3c2f25", weapon="#f3bc72"),
    "gunner":    dict(body="#d8eee8", coat="#3d9d92", dark="#193c3b", accent="#8ff5de", skin="#deb08d", hair="#1f3435", weapon="#d5fff3"),
    "warden":    dict(body="#efe4bb", coat="#a8883e", dark="#40351e", accent="#ffe37b", skin="#dbad87", hair="#352d23", weapon="#fff3b7"),
    "chrono":    dict(body="#dfe2f5", coat="#777fc4", dark="#252947", accent="#b4baff", skin="#dbab8a", hair="#272642", weapon="#e4e7ff"),
    "harrier":   dict(body="#f0ddd5", coat="#c2604f", dark="#4a2723", accent="#ff927c", skin="#e0aa88", hair="#3b211f", weapon="#ffe1d7"),
}

# Major pose parameters are intentionally conservative so the entire body stays
# between y=3 and y=50 in every row.
def humanoid_frame(cls: str, row: int, f: int) -> Image.Image:
    p = PALETTES[cls]
    im = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    name = ROW_NAMES[row]
    phase = f / 7
    center = 23
    base = 49
    bob = 0
    lean = 0
    head_y = 7
    torso_y = 17
    torso_h = 17
    leg_l = (19, 34, 4, 14)
    leg_r = (25, 34, 4, 14)
    arm_l = [(19, 21), (14, 30)]
    arm_r = [(29, 21), (35, 29)]
    weapon_angle = -0.35
    weapon_len = 18
    crouch = 0

    if name == "idle":
        bob = 1 if f in (2, 3, 6) else 0
    elif name == "run":
        stride = [0, 3, 5, 3, 0, -3, -5, -3][f]
        bob = abs(stride) // 3
        leg_l = (18 - stride*.35, 33+bob, 4, 15-bob)
        leg_r = (25 + stride*.35, 33+bob, 4, 15-bob)
        arm_l = [(19, 21+bob), (14+stride*.35, 29+bob)]
        arm_r = [(29, 21+bob), (35-stride*.35, 28+bob)]
        weapon_angle = -0.25 + stride*.035
    elif name == "jump":
        bob = -2
        leg_l = (18, 34, 5, 10)
        leg_r = (26, 32, 5, 11)
        arm_l = [(19, 20), (13, 26)]
        arm_r = [(29, 20), (36, 23)]
        weapon_angle = -0.85
    elif name == "fall":
        bob = 1
        leg_l = (18, 34, 4, 15)
        leg_r = (27, 34, 4, 15)
        arm_l = [(19, 20), (12, 23)]
        arm_r = [(29, 20), (37, 24)]
        weapon_angle = 0.35
    elif name in ("z1", "z2", "x", "launch", "air", "dash", "skill1", "skill2"):
        t = phase
        if name == "z1":
            lean = 1
            weapon_angle = -1.35 + t*2.1
            arm_r = [(29, 21), (36, 22+4*t)]
        elif name == "z2":
            lean = 2
            weapon_angle = 1.0 - t*2.3
            arm_r = [(29, 21), (36, 28-7*t)]
        elif name == "x":
            lean = 2
            crouch = 2 if f < 3 else 0
            weapon_angle = -1.1 + t*2.8
            weapon_len = 21
            arm_r = [(29, 22), (37, 24)]
        elif name == "launch":
            bob = -round(t*2)
            weapon_angle = 0.9 - t*2.35
            weapon_len = 21
            arm_r = [(29, 21), (36, 25-8*t)]
        elif name == "air":
            bob = -2
            leg_l = (18, 34, 5, 10)
            leg_r = (27, 32, 5, 11)
            weapon_angle = -1.45 + t*2.8
            arm_r = [(29, 20), (37, 23)]
        elif name == "dash":
            lean = 4
            crouch = 3
            leg_l = (16, 35, 6, 11)
            leg_r = (26, 36, 8, 9)
            weapon_angle = -0.05
            weapon_len = 21
        elif name == "skill1":
            weapon_angle = -1.0 + math.sin(t*math.pi)*1.4
            arm_l = [(19, 20), (12, 19)]
            arm_r = [(29, 20), (37, 20)]
        else:
            weapon_angle = -0.55
            arm_l = [(19, 20), (11, 17)]
            arm_r = [(29, 20), (37, 17)]
    elif name == "hurt":
        lean = -2 if f % 2 == 0 else 1
        crouch = 2
        arm_l = [(19, 22), (13, 30)]
        arm_r = [(29, 22), (34, 31)]
        weapon_angle = 1.1
    elif name == "down":
        # A fully horizontal silhouette, still entirely inside one 48x52 frame.
        t = min(1, phase*1.4)
        d.ellipse((8, 47, 39, 50), fill=(0,0,0,65))
        px(d, 12, 37+round(t*4), 23, 8, "#101b21")
        px(d, 14, 38+round(t*4), 19, 6, p["coat"])
        circ(d, 36, 37+round(t*5), 5, p["hair"])
        px(d, 35, 38+round(t*5), 5, 5, p["skin"])
        ln(d, [(11,42),(5,47)], p["dark"], 4)
        ln(d, [(22,44),(31,49)], p["dark"], 4)
        return im
    elif name == "cast":
        bob = -1
        arm_l = [(19, 20), (12, 18)]
        arm_r = [(29, 20), (36, 18)]
        weapon_angle = -0.9
        for k in range(4):
            a = f*.6 + k*math.pi/2
            circ(d, 24+math.cos(a)*15, 23+math.sin(a)*10, 2, p["accent"])
    elif name == "victory":
        bob = -1
        arm_l = [(19, 20), (15, 12)]
        arm_r = [(29, 20), (34, 11)]
        weapon_angle = -1.45

    head_y += bob + crouch
    torso_y += bob + crouch
    # Shadow
    d.ellipse((12, 48, 36, 51), fill=(0,0,0,70))

    # Back cape/scarf and class silhouette details.
    if cls in ("rift", "summoner", "chrono"):
        ln(d, [(18+lean,20+bob+crouch),(10,27+bob+crouch),(7+f%2,32+bob+crouch)], p["coat"], 3)
    if cls == "warden":
        # Shield behind body, kept within x=5..18.
        d.polygon([(7,20+bob+crouch),(16,17+bob+crouch),(18,34+bob+crouch),(11,40+bob+crouch),(6,33+bob+crouch)], fill=p["dark"], outline=p["accent"])
    if cls == "artificer":
        px(d, 13, 20+bob+crouch, 5, 14, p["dark"])
        circ(d, 15, 22+bob+crouch, 2, p["accent"])

    # Legs and boots.
    for x, y, w, h in (leg_l, leg_r):
        px(d, x+lean, y+bob+crouch, w, h, "#101b22")
        px(d, x+lean+1, y+bob+crouch, max(2,w-2), max(3,h-4), p["dark"])
        px(d, x+lean-1, min(48,y+bob+crouch+h-3), w+3, 3, "#0a1117")

    # Torso outline and coat.
    px(d, center-7+lean, torso_y-1, 15, torso_h+2, "#0d171e")
    px(d, center-6+lean, torso_y, 13, torso_h, p["body"])
    px(d, center-6+lean, torso_y+8, 13, 6, p["coat"])
    px(d, center-2+lean, torso_y+6, 5, 5, p["accent"])

    # Head and hair.
    px(d, center-6+lean, head_y, 13, 11, "#101921")
    px(d, center-5+lean, head_y+1, 11, 9, p["skin"])
    px(d, center-6+lean, head_y, 13, 4, p["hair"])
    px(d, center+4+lean, head_y+5, 2, 2, p["accent"])

    # Arms.
    l_sh=(arm_l[0][0]+lean, arm_l[0][1]+bob+crouch); l_hand=(arm_l[1][0]+lean, arm_l[1][1]+bob+crouch)
    r_sh=(arm_r[0][0]+lean, arm_r[0][1]+bob+crouch); r_hand=(arm_r[1][0]+lean, arm_r[1][1]+bob+crouch)
    ln(d, [(center-5+lean, torso_y+4),l_sh,l_hand], "#0d171e", 4)
    ln(d, [(center-5+lean, torso_y+4),l_sh,l_hand], p["body"], 2)
    ln(d, [(center+6+lean, torso_y+4),r_sh,r_hand], "#0d171e", 4)
    ln(d, [(center+5+lean, torso_y+4),r_sh,r_hand], p["body"], 2)

    hx, hy = r_hand
    # Weapons are class-specific and clipped inside frame.
    if cls == "rift":
        ex = clamp(hx+math.cos(weapon_angle)*weapon_len, 2, 46)
        ey = clamp(hy+math.sin(weapon_angle)*weapon_len, 2, 49)
        ln(d, [(hx,hy),(ex,ey)], "#0c141b", 5); ln(d, [(hx,hy),(ex,ey)], p["weapon"], 2)
        circ(d, ex, ey, 1, p["accent"])
    elif cls == "summoner":
        ex = clamp(hx+math.cos(weapon_angle)*17, 3, 45); ey=clamp(hy+math.sin(weapon_angle)*17,3,48)
        ln(d,[(hx,hy),(ex,ey)],p["dark"],3);ln(d,[(hx,hy),(ex,ey)],p["weapon"],1);circ(d,ex,ey,4,p["accent"],"#fff",1)
    elif cls == "artificer":
        px(d, clamp(hx,2,36), clamp(hy-4,2,45), 11, 8, p["dark"]);px(d,clamp(hx+2,2,39),clamp(hy-2,2,46),8,4,p["accent"])
    elif cls == "gunner":
        ex=clamp(hx+18,4,46);ln(d,[(hx,hy),(ex,hy-1)],"#0b161b",6);ln(d,[(hx,hy-1),(ex,hy-2)],p["weapon"],2);px(d,ex-3,hy-4,4,5,p["accent"])
    elif cls == "warden":
        ex=clamp(hx+math.cos(weapon_angle)*21,3,46);ey=clamp(hy+math.sin(weapon_angle)*21,3,49);ln(d,[(hx,hy),(ex,ey)],p["weapon"],2);d.polygon([(ex,ey),(ex-4,ey-2),(ex-3,ey+3)],fill=p["accent"])
    elif cls == "chrono":
        circ(d,clamp(hx+9,5,43),clamp(hy-4,5,45),5,p["accent"],"#eef",1);ln(d,[(hx,hy),(hx+7,hy-3)],p["weapon"],2)
    else:  # harrier chain
        pts=[(hx,hy)]
        for k in range(1,5):pts.append((clamp(hx+k*4,2,46),clamp(hy+math.sin(k+f)*3,2,49)))
        ln(d,pts,p["weapon"],2);circ(d,*pts[-1],3,p["accent"])

    # Cast / skill accents.
    if name in ("cast","skill1","skill2"):
        for k in range(3):
            a=f*.8+k*2.1
            x=clamp(24+math.cos(a)*18,2,45);y=clamp(25+math.sin(a)*15,2,49)
            px(d,x,y,2,2,p["accent"])
    return im

# local clamp for drawing coordinates
def clamp(v,a,b): return max(a,min(b,v))

for cls in PALETTES:
    sheet = Image.new("RGBA", (FW*FRAMES, FH*ROWS), (0,0,0,0))
    for r in range(ROWS):
        for f in range(FRAMES):
            sheet.alpha_composite(humanoid_frame(cls,r,f),(f*FW,r*FH))
    sheet.save(SPR/f"player_{cls}.png")

# -----------------------------------------------------------------------------
# Beast forms (64x64, 7 rows) — clearly different silhouettes.
# -----------------------------------------------------------------------------
BF=64; BROWS=7

def beast_frame(form,row,f):
    im=Image.new("RGBA",(BF,BF),(0,0,0,0));d=ImageDraw.Draw(im)
    phase=f/7; bob=round(math.sin(phase*math.tau)*2) if row in (0,1) else 0
    if form=="wolf":
        body="#6fba82"; dark="#1f4636"; glow="#9effaa"
        x=12+(f%2 if row==1 else 0);y=28+bob
        d.ellipse((x,y,x+35,y+18),fill=dark);d.ellipse((x+3,y+2,x+32,y+15),fill=body)
        d.polygon([(42,y+3),(54,y+7),(45,y+15)],fill=dark);d.polygon([(43,y+5),(52,y+8),(45,y+13)],fill=body)
        d.polygon([(47,y+4),(49,y-3),(52,y+5)],fill=dark);d.polygon([(16,y+3),(12,y-5),(21,y+2)],fill=dark)
        stride=[0,4,7,4,0,-4,-7,-4][f] if row==1 else 0
        ln(d,[(19,y+14),(16-stride*.35,57)],dark,5);ln(d,[(35,y+14),(39+stride*.35,57)],dark,5)
        if row==2: ln(d,[(44,y+8),(60,22+f*2)],glow,4)
        circ(d,48,y+8,2,glow)
    elif form=="eagle":
        body="#8fcac4";dark="#234d52";glow="#c7ffff";cy=31+bob
        circ(d,32,cy,8,dark);circ(d,32,cy,6,body)
        flap=[-16,-10,-3,8,15,8,-3,-10][f]
        d.polygon([(28,cy),(7,cy+flap),(19,cy+12)],fill=dark);d.polygon([(36,cy),(57,cy+flap),(45,cy+12)],fill=dark)
        d.polygon([(38,cy-3),(49,cy),(39,cy+3)],fill="#f2d980");circ(d,35,cy-3,1,glow)
        if row==2:
            for k in range(3):
                ln(d,[(18+k*12,cy+8),(12+k*18,55)],glow,2)
    elif form=="bear":
        body="#a3815b";dark="#4a3425";glow="#ffd07b";x=12;y=17+bob
        circ(d,23,y,7,dark);circ(d,41,y,7,dark);d.rounded_rectangle((13,y+4,51,y+38),8,fill=dark);d.rounded_rectangle((16,y+7,48,y+35),7,fill=body)
        circ(d,32,y+16,8,"#c9a67b");px(d,29,y+14,6,4,dark)
        ln(d,[(20,y+34),(18,59)],dark,7);ln(d,[(44,y+34),(46,59)],dark,7)
        if row==2:ln(d,[(47,y+19),(61,42)],glow,7)
    else:  # king = antlered composite
        body="#6fbf8d";dark="#173d32";glow="#d9ff9d";y=18+bob
        d.rounded_rectangle((15,y+7,49,y+36),8,fill=dark);d.rounded_rectangle((18,y+9,46,y+33),7,fill=body)
        circ(d,32,y+7,10,dark);circ(d,32,y+8,7,body)
        ln(d,[(26,y+1),(20,y-10),(15,y-14)],glow,3);ln(d,[(38,y+1),(44,y-10),(49,y-14)],glow,3)
        ln(d,[(20,y-9),(14,y-6)],glow,2);ln(d,[(44,y-9),(50,y-6)],glow,2)
        ln(d,[(21,y+33),(18,59)],dark,7);ln(d,[(43,y+33),(46,59)],dark,7)
        circ(d,32,y+14,3,glow)
    return im

for form in ["wolf","eagle","bear","king"]:
    sheet=Image.new("RGBA",(BF*8,BF*BROWS),(0,0,0,0))
    for r in range(BROWS):
        for f in range(8):sheet.alpha_composite(beast_frame(form,r,f),(f*BF,r*BF))
    sheet.save(SPR/f"player_beast_{form}.png")

# -----------------------------------------------------------------------------
# Enemy sheets.  Rows: idle/move/attack/special/hurt/down.
# -----------------------------------------------------------------------------
EW=EH=48; EROWS=6
ENEMY_INFO = {
    "slime":      ("暴怒裂膠", "#6ebf70", "受傷加速；冰／藤控場。"),
    "charger":    ("棘角衝獸", "#b87452", "紅線蓄力直衝；跳過或繞背。"),
    "archer":     ("廢城弓手", "#c59454", "慢箭可反衝。"),
    "scatterer":  ("環彈咒匠", "#ad72ce", "扇形與環形彈幕。"),
    "bombardier": ("屋頂投擲兵", "#c8664c", "地面預警後轟炸。"),
    "spitter":    ("腐植噴吐者", "#7f9f54", "毒池封路；火可清除。"),
    "ambusher":   ("影縫獵手", "#66577f", "隱形背刺；光可顯形。"),
    "spider":     ("纜網蛛", "#7d6555", "蛛網定身；Dash 掙脫。"),
    "reflector":  ("折光甲殼", "#58949a", "正面反射；換位繞背。"),
    "healer":     ("再生培養體", "#6ebf96", "治療同伴；優先擊殺。"),
    "sniper":     ("高塔狙擊者", "#d2c06a", "長瞄準線；離開射線。"),
    "burrower":   ("地脈潛獸", "#8e6f58", "潛地追蹤；看裂紋起跳。"),
    "shocker":    ("脈衝電螫", "#e3d35e", "近距蓄電環；拉開距離。"),
    "parasite":   ("能量寄生體", "#d96a91", "附著吸血；連續 Dash 擺脫。"),
    "mimic":      ("指令擬態箱", "#c4915b", "依提示 Command 才能破防。"),
    "breeder":    ("菌傀育生者", "#91aa66", "召喚裂膠；打斷施法。"),
    "artillery":  ("屋頂迫擊砲", "#758790", "跨房間轟炸；找掩體。"),
    "sentinel":   ("十相哨兵・赫利俄斯", "#d45174", "最終 Boss；削 BREAK。"),
}


def enemy_frame(kind,row,f):
    im=Image.new("RGBA",(EW,EH),(0,0,0,0));d=ImageDraw.Draw(im)
    name,col,_=ENEMY_INFO[kind]; dark="#172128"; light="#f2eee1"; bob=round(math.sin(f/8*math.tau)*1.5) if row in (0,1) else 0
    if kind=="slime":
        y=27+bob;w=30+(f%3-1)*2 if row==1 else 30
        d.ellipse((9,y,9+w,y+17),fill=dark);d.ellipse((11,y+2,7+w,y+16),fill=col);circ(d,19,y+8,2,light);circ(d,30,y+8,2,light)
        if row==2:d.polygon([(31,y+5),(46,y+10),(31,y+15)],fill="#a9eb88")
    elif kind=="charger":
        y=20+bob;d.rounded_rectangle((8,y,39,y+21),7,fill=dark);d.rounded_rectangle((11,y+2,37,y+18),6,fill=col)
        d.polygon([(35,y+3),(47,y-2),(39,y+9)],fill="#eee0b0");circ(d,32,y+7,2,"#fff")
        stride=[0,3,5,3,0,-3,-5,-3][f] if row==1 else 0;ln(d,[(16,y+17),(14-stride*.3,45)],dark,5);ln(d,[(32,y+17),(35+stride*.3,45)],dark,5)
    elif kind in ("archer","sniper"):
        hood="#31302a" if kind=="archer" else "#2b3036";y=7+bob
        circ(d,22,y+7,7,hood);px(d,16,y+14,13,23,dark);px(d,18,y+15,9,20,col);ln(d,[(19,y+35),(17,46)],dark,4);ln(d,[(26,y+35),(29,46)],dark,4)
        if kind=="archer":d.arc((27,y+10,45,y+34),-75,75,fill="#ecd096",width=2);ln(d,[(36,y+12),(36,y+33)],light,1)
        else:ln(d,[(25,y+22),(47,y+19)],"#151a1e",6);ln(d,[(26,y+20),(47,y+18)],col,2);circ(d,39,y+17,3,"#ff6b6b")
    elif kind in ("scatterer","healer","shocker"):
        y=19+bob;circ(d,24,y,13,dark);circ(d,24,y,10,col);circ(d,24,y,4,light)
        for k in range(6):
            a=k*math.tau/6+f*.12;ln(d,[(24+math.cos(a)*11,y+math.sin(a)*11),(24+math.cos(a)*20,y+math.sin(a)*20)],col,3)
        if kind=="healer":d.arc((8,y-16,40,y+16),10+f*10,180+f*10,fill="#9effc0",width=2)
        if kind=="shocker":
            for k in range(4):
                a=k*math.pi/2+f*.25;ln(d,[(24+math.cos(a)*13,y+math.sin(a)*13),(24+math.cos(a)*22,y+math.sin(a)*22)],"#fff38a",2)
    elif kind in ("bombardier","artillery"):
        y=19+bob;px(d,8,y+8,32,20,dark);px(d,11,y+10,26,16,col);px(d,14,y+25,5,12,dark);px(d,31,y+25,5,12,dark)
        if kind=="bombardier":circ(d,24,y+6,8,col);circ(d,24,y+6,4,"#24252a")
        else:ln(d,[(23,y+10),(36,y-6)],dark,8);ln(d,[(24,y+8),(38,y-6)],col,4);circ(d,12,y+27,5,"#20282c");circ(d,38,y+27,5,"#20282c")
    elif kind in ("spitter","breeder"):
        y=17+bob;d.ellipse((8,y,40,y+27),fill=dark);d.ellipse((11,y+3,37,y+24),fill=col)
        if kind=="spitter":d.polygon([(34,y+9),(47,y+13),(34,y+17)],fill="#c7db78")
        else:
            for x,y2 in [(16,y+7),(24,y+4),(32,y+9)]:circ(d,x,y2,5,"#d8e5a0",dark,1)
            if row==3:
                for k in range(3):
                    circ(d,12+k*12,42-f%3,3,"#91c96e")
        ln(d,[(16,y+22),(13,46)],dark,4);ln(d,[(33,y+22),(36,46)],dark,4)
    elif kind=="ambusher":
        y=8+bob;d.polygon([(24,y),(39,y+35),(24,y+28),(9,y+35)],fill=dark);d.polygon([(24,y+4),(34,y+31),(24,y+25),(14,y+31)],fill=col);circ(d,24,y+12,3,"#e8d6ff")
        if row in (2,3):ln(d,[(31,y+22),(46,y+10)],"#c7a4ff",3)
    elif kind=="spider":
        y=24+bob;circ(d,24,y,10,dark);circ(d,24,y,7,col);circ(d,21,y-2,1,light);circ(d,27,y-2,1,light)
        for k in range(4):
            off=(k-1.5)*5;ln(d,[(18,y+off*.15),(5,y-8+off*2)],dark,3);ln(d,[(30,y+off*.15),(43,y-8+off*2)],dark,3)
    elif kind=="reflector":
        y=16+bob;d.polygon([(24,y),(42,y+12),(38,y+34),(24,y+42),(10,y+34),(6,y+12)],fill=dark);d.polygon([(24,y+4),(37,y+14),(34,y+31),(24,y+37),(14,y+31),(11,y+14)],fill=col);d.polygon([(24,y+7),(31,y+17),(24,y+30),(17,y+17)],fill="#a7eff2")
    elif kind=="burrower":
        y=28+bob;d.ellipse((7,y,41,y+15),fill=dark);d.ellipse((11,y+2,37,y+13),fill=col);d.polygon([(15,y+3),(20,y-10),(24,y+4)],fill="#dfbf91");d.polygon([(25,y+3),(31,y-12),(35,y+4)],fill="#dfbf91");circ(d,31,y+7,2,light)
        if row==3:
            for x in range(6,45,7):
                px(d,x,43+(x+f)%3,4,2,"#8c715a")
    elif kind=="parasite":
        y=20+bob;circ(d,24,y,9,dark);circ(d,24,y,6,col);circ(d,26,y-2,2,light)
        for k in range(7):
            a=k*math.tau/7+f*.15;ln(d,[(24+math.cos(a)*6,y+math.sin(a)*6),(24+math.cos(a)*18,y+math.sin(a)*18)],col,2)
    elif kind=="mimic":
        y=19+bob;px(d,7,y+8,34,22,dark);px(d,10,y+10,28,17,col);px(d,7,y+4,34,8,"#6b4a2f");px(d,11,y+6,26,3,"#d7ae69")
        if row in (2,3):
            d.polygon([(11,y+12),(37,y+12),(33,y+24),(15,y+24)],fill="#261515")
            for x in range(14,36,5):d.polygon([(x,y+13),(x+2,y+18),(x+4,y+13)],fill="#fff3d0")
        px(d,22,y+5,5,6,"#ffe16c")
    elif kind=="sentinel":
        # Final boss fills almost the entire frame; much more readable at 3.6x.
        y=4+bob
        d.polygon([(24,y),(41,y+12),(43,y+35),(34,y+45),(24,y+39),(14,y+45),(5,y+35),(7,y+12)],fill="#171927")
        d.polygon([(24,y+4),(37,y+14),(38,y+32),(31,y+39),(24,y+34),(17,y+39),(10,y+32),(11,y+14)],fill=col)
        circ(d,24,y+22,8,"#261a29");circ(d,24,y+22,5,"#ff7898");circ(d,24,y+21,2,"#fff0b0")
        d.polygon([(11,y+13),(1,y+5),(8,y+24)],fill="#79e5e0");d.polygon([(37,y+13),(47,y+5),(40,y+24)],fill="#ff7195")
        if row in (2,3):
            ln(d,[(10,y+26),(1,y+9+f*2)],"#92f5ef",4);ln(d,[(38,y+26),(47,y+9+f*2)],"#ff8baa",4)
    # Hurt and down overlays/silhouettes.
    if row==4:
        for k in range(7):
            a=k*math.tau/7;px(d,24+math.cos(a)*21,24+math.sin(a)*18,2,2,"#ffffff")
    if row==5 and kind!="sentinel":
        d.rectangle((7,38,41,45),fill=(12,17,20,180));d.line((10,42,38,42),fill=col,width=5)
    return im

for kind in ENEMY_INFO:
    sheet=Image.new("RGBA",(EW*8,EH*EROWS),(0,0,0,0))
    for r in range(EROWS):
        for f in range(8):sheet.alpha_composite(enemy_frame(kind,r,f),(f*EW,r*EH))
    sheet.save(SPR/f"enemy_{kind}.png")

# -----------------------------------------------------------------------------
# Updated monster atlas: 17 normal monsters + the boss.
# -----------------------------------------------------------------------------
entries=list(ENEMY_INFO.items())
cols,rows=6,3;card_w,card_h=310,245
atlas=Image.new("RGB",(cols*card_w,rows*card_h),(8,18,23));d=ImageDraw.Draw(atlas)
title_f=font(25);name_f=font(20);tip_f=font(15);small_f=font(13)
for idx,(kind,(name,col,tip)) in enumerate(entries):
    c=idx%cols;r=idx//cols;x=c*card_w;y=r*card_h
    d.rounded_rectangle((x+8,y+8,x+card_w-8,y+card_h-8),14,fill=(18,37,42),outline=col,width=3)
    sheet=Image.open(SPR/f"enemy_{kind}.png").convert("RGBA")
    frame=sheet.crop((0,0,48,48)).resize((120,120),Image.Resampling.NEAREST)
    atlas.paste(frame,(x+18,y+30),frame)
    d.text((x+148,y+26),name,font=name_f,fill=(238,248,244))
    d.text((x+148,y+55),"BOSS" if kind=="sentinel" else f"#{idx+1:02d}",font=small_f,fill=col)
    # Wrapped Chinese text by character count.
    lines=[tip[i:i+13] for i in range(0,len(tip),13)]
    for j,line in enumerate(lines[:4]):d.text((x+148,y+83+j*25),line,font=tip_f,fill=(178,206,198))
    d.text((x+18,y+169),f"AI：{kind}",font=small_f,fill=(108,180,176))
    d.text((x+18,y+195),"辨識：獨立剪影／攻擊預警",font=small_f,fill=(158,180,176))

atlas.save(CODEX/"MONSTER_ATLAS_V9_1.png")
# Also replace the filename used by the current index so deployment works without code changes.
atlas.save(CODEX/"MONSTER_ATLAS_V9.png")
print(f"Generated {len(PALETTES)} humanoid sheets, 4 beast sheets, {len(ENEMY_INFO)} enemy sheets and atlas.")
