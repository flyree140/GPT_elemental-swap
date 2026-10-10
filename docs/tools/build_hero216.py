"""Extract complete-body frames from the user's approved A07 sheet, not limb pieces.
Usage: python tools/build_hero216.py /path/to/A07.png
The source poster is deliberately not shipped inside the runtime package.
"""
from pathlib import Path
import sys, json, hashlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
source=Path(sys.argv[1]);root=Path(__file__).resolve().parents[1];out=root/'assets/entropy216';out.mkdir(exist_ok=True)
im=Image.open(source).convert('RGB').resize((1408,1056),Image.Resampling.LANCZOS)
# x boundaries, y top/bottom, scale. Frame groups deliberately exclude captions.
clips={
'idle':([16,68,120,171,222,273,324,372,419],377,442,1.55),
'walk':([552,600,647,696,744,792,838,885,935],382,444,1.62),
'run':([957,1011,1066,1120,1176,1231,1286,1338,1391],386,444,1.66),
'jump':([16,63,113,165,211,258,313],499,567,1.55),
'dash':([334,397,458,516,578,639,698],506,566,1.6),
'hurt':([730,795,861,928,998],506,568,1.55),
'recover':([1023,1083,1141,1199,1258,1316,1386],503,567,1.55),
'cut':([18,65,112,164],668,707,2.0),
'cross':([181,232,285,337,394],669,707,2.0),
'spin':([419,464,510,556,602,651],664,707,2.05),
'cast':([667,706,744,781,817],674,707,2.1),
'finish':([843,884,924,965,1004,1045,1085],669,707,2.0)
}
CW,CH=160,144;atlas=Image.new('RGBA',(CW*8,CH*len(clips)));meta={'version':'21.6.0','source':'user-approved A07 concept sheet','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'width':atlas.width,'height':atlas.height,'cell':[CW,CH],'anchor':[80,130],'clips':{}}
for row,(name,(xs,y0,y1,scale)) in enumerate(clips.items()):
    rects=[]
    for col,(x0,x1) in enumerate(zip(xs,xs[1:])):
        crop=im.crop((x0,y0,x1,y1));rgb=np.asarray(crop).astype(float)
        # The dark-teal board background is distinct from the purple whole-body art.
        # Preserve the dark interior of the silhouette; only outside matte is removed.
        bg=np.median(np.concatenate([rgb[:2].reshape(-1,3),rgb[:,:2].reshape(-1,3)]),axis=0)
        diff=np.linalg.norm(rgb-bg,axis=2)
        mask=((rgb[:,:,0]>20)&((rgb[:,:,2]-rgb[:,:,1])>7))|(rgb[:,:,0]>58)
        mask[:1]=False;mask[-1:]=False
        labels,n=ndimage.label(mask)
        if n:
            counts=np.bincount(labels.ravel());counts[0]=0
            keep=np.flatnonzero(counts>max(6,counts.max()*.075))
            mask=np.isin(labels,keep)
        mask=ndimage.binary_fill_holes(mask)
        alpha=np.where(mask,np.clip((diff-10)/22,0,1),0)
        # Heal dark holes enclosed by opaque outlines without amputating limbs.
        alpha=np.maximum(alpha,ndimage.binary_erosion(mask).astype(float))
        rgba=np.dstack([rgb,np.uint8(alpha*255)]).astype('uint8')
        spr=Image.fromarray(rgba).resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
        px=col*CW+(CW-spr.width)//2;py=row*CH+130-spr.height
        atlas.alpha_composite(spr,(px,py));rects.append([col*CW,row*CH,CW,CH])
    selected={'dash':[0,1,4,5],'cut':[0,1],'cross':[0,1,2,3],'spin':[0,1,2,4],'cast':[0,1],'finish':[0,3,4]}.get(name,list(range(len(rects))))
    meta['clips'][name]=[rects[i] for i in selected]
atlas.save(out/'hero.webp',lossless=True,method=6)
(root/'js/hero216_manifest.js').write_text('window.ES216_HERO='+json.dumps(meta,separators=(',',':'))+';\n')
meta['frame_count']=sum(map(len,meta['clips'].values()));(out/'provenance.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
# Inspect on an opaque but unobtrusive dark background.
preview=Image.new('RGB',atlas.size,(21,28,42));preview.paste(atlas,mask=atlas.getchannel('A'));(root/'reports').mkdir(exist_ok=True)
preview.resize((1024,round(preview.height*1024/preview.width))).save(root/'reports/hero_atlas_preview.jpg',quality=93)
print('Atlas:',meta['frame_count'],'whole-body frames;', (out/'hero.webp').stat().st_size,'bytes')
