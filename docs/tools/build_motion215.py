"""Bake dense, continuous limb textures from the supplied painted character art.
Two source cutouts become ONE closed skin mesh; no independently pasted knees.
Source assets belong to the user-provided 21.4.1 package. No external art needed.
Run before compacting the release textures; Pillow/numpy/scipy required.
"""
from pathlib import Path
import json,math,argparse
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import distance_transform_edt
R=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--source',required=True,help='Original 21.4 assets/art21 folder with rig_*.png');parser.add_argument('--output',default=str(R/'AUTHORING_215'),help='Scratch output; does not overwrite packed runtime assets');args=parser.parse_args();S=Path(args.source);O=Path(args.output);O.mkdir(parents=True,exist_ok=True)
if not list(S.glob('rig_*.png')):raise SystemExit('No rig_*.png in --source. Supply original uploaded 21.4 artwork.')
meta={};parts=['capeBack','capeFront','hair','head','torso','armBack','foreBack','armFront','foreFront','thighBack','shinBack','footBack','thighFront','shinFront','footFront']
def source(im,name):
 i=parts.index(name);return im.crop((i%4*149,i//4*215,i%4*149+149,i//4*215+215))
def warped(part,a,b,width,height,top,bottom):
 # Inverse affine: a/b on the artwork map to a vertical texture centreline.
 dx,dy=b[0]-a[0],b[1]-a[1];L=math.hypot(dx,dy);nx,ny=dy/L,-dx/L
 k=L/(bottom-top);xc=width/2
 vals=(nx,dx/(bottom-top),a[0]-nx*xc-dx*top/(bottom-top),ny,dy/(bottom-top),a[1]-ny*xc-dy*top/(bottom-top))
 return part.transform((width,height),Image.Transform.AFFINE,vals,resample=Image.Resampling.BICUBIC)
def ribbon(im,kind,side):
 leg=kind=='leg';w,h=(26,86) if leg else (22,65)
 if leg:
  joints=([(60,124),(53,155),(37,190)] if side=='Back' else [(81,124),(81,155),(81,190)])
  names=['thigh'+side,'shin'+side];top,knee,bottom=4,39,79
  radii=[(0,7.0),(12,7.1),(30,5.1),(41,5.0),(57,4.8),(79,3.4),(85,3.3)]
 else:
  joints=([(57,69),(48,94),(36,118)] if side=='Back' else [(86,72),(98,94),(108,109)])
  names=['arm'+side,'fore'+side];top,knee,bottom=4,31,60
  radii=[(0,5.2),(10,5.6),(23,4.2),(33,4.0),(45,4.1),(60,3.1),(64,3.1)]
 a=warped(source(im,names[0]),joints[0],joints[1],w,h,top,knee)
 b=warped(source(im,names[1]),joints[1],joints[2],w,h,knee,bottom)
 aa=np.array(a);bb=np.array(b);yy=np.arange(h)[:,None,None];mix=np.clip((yy-(knee-4))/8,0,1)
 # Use colour nearest to actual painted pixels in each source, blend around joint.
 def fill(x):
  valid=x[:,:,3]>100
  if not valid.any():return x[:,:,:3]
  inds=distance_transform_edt(~valid,return_distances=False,return_indices=True)
  return x[inds[0],inds[1],:3]
 rgb=(fill(aa)*(1-mix)+fill(bb)*mix).astype('uint8')
 radius=np.interp(np.arange(h),*[np.array(radii)[:,i] for i in (0,1)])
 xx=np.abs(np.arange(w)+.5-w/2)[None,:];alpha=np.clip(radius[:,None]+.6-xx,0,1)*255
 # Slight common material shading makes the seam one painted surface.
 shade=(.84+.16*np.cos(np.minimum(1,xx/np.maximum(1,radius[:,None]))*math.pi*.5))[:,:,None]
 rgb=np.clip(rgb*shade,0,255).astype('uint8')
 out=np.dstack([rgb,alpha.astype('uint8')]);return Image.fromarray(out),[w/2,top,knee,bottom]
for f in sorted(S.glob('rig_*.png')):
 id=f.stem[4:];im=Image.open(f).convert('RGBA');sheet=Image.new('RGBA',(256,256));d={};x=y=pad=2;rh=0
 entries=[]
 for name in ['head','torso','footFront']:
  p=source(im,name);bb=p.getbbox();entries.append((name,p.crop(bb),{'origin':list(bb[:2])}))
 for kind in ['leg','arm']:
  for side in ['Back','Front']:
   p,j=ribbon(im,kind,side);entries.append((kind+side,p,{'joint':j}))
 for name,p,extra in entries:
  if x+p.width+2>256:x=2;y+=rh+2;rh=0
  if y+p.height+2>256:raise ValueError('Atlas overflow '+id)
  sheet.alpha_composite(p,(x,y));d[name]={'rect':[x,y,p.width,p.height],**extra};x+=p.width+2;rh=max(rh,p.height)
 used=y+rh+2;sheet=sheet.crop((0,0,256,used));sheet.save(O/(id+'.webp'),lossless=True,method=5)
 d['size']=[256,used];meta[id]=d
(O/'rig215_manifest.js').write_text('window.ES215_RIGS='+json.dumps(meta,separators=(',',':'))+';\n')
print('Dense rigs:',len(meta),'bytes:',sum(p.stat().st_size for p in O.glob('*.webp')))
