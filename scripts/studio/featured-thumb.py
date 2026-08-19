#!/usr/bin/env python3
"""
featured-thumb.py — ONE-OFF: the LinkedIn Featured thumbnail for the offer.

  python3 scripts/studio/featured-thumb.py [--out <dir>]

WHY THIS EXISTS (Paul, 2026-08-19): the LinkedIn Featured card crops any
media to roughly 1.91:1. The offer document's cover is 4:5, so LinkedIn
takes a middle band and beheads the figure. A restyled 4:5 cover was tried
the same day and REVERSED within hours ("i didn't want to change the actual
docs") — the documents keep the Claude Design cover (150 numeral, stat
rows), and THIS standalone image is what goes in the Featured slot.

Composition: the portal-light ground at 1200×630 (rendered 2×, 2400×1260 —
native 1.905:1, so LinkedIn has nothing to crop): gradient copy panel,
kicker · hook with the green turn · rule · lede · logo, figure standing on
the four portal steps with real headroom. CROP SAFETY: if a surface crops
to 2:1 instead, ~15px shave off top and bottom at 1x — everything critical
sits inside y 16..614 (head top 42, logo bottom ≤600). The lede drops the
handoff's trailing clause to keep that margin; the Featured card's own
title/description carry the rest.

No foot bar, no byline — the Featured card frames it with name + link text
already. Output files into the offer collateral folder next to the PDFs.
"""
import sys, math, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
args = sys.argv[1:]
OUT = pathlib.Path(args[args.index('--out')+1]).resolve() if '--out' in args \
    else ROOT/'studio/collateral/smbx-corpdev-offering/2026-08-19'

CACHE = HERE/'.fonts-cache'
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

def F(n,s,ax=None):
    f=ImageFont.truetype(str(CACHE/n),s)
    if ax:
        try: f.set_variation_by_axes(ax)
        except Exception: pass
    return f

S=2; W,H=1200*S,630*S
T=dict(white=(255,255,255),boneAlt=(249,247,241),panel=(243,240,233),
       ink=(22,24,26),body=(74,79,84),muted=(124,129,135),hair=(228,223,211),
       chipB=(216,211,198),green=(10,122,88),greenHover=(8,99,72),
       greenBright=(15,169,124),tint=(223,245,236),mint=(168,240,206))

serif58=F('serif-var.ttf',58*S,[550])
sans26=F('sans-400.ttf',26*S); mono24=F('mono-600.ttf',24*S)

FIG=Image.open(ROOT/'studio/assets/brand/founder-standing.png').convert('RGBA')
LOGO=Image.open(ROOT/'client/public/logo-green-x.png').convert('RGBA')

def lingrad(w,h,stops,ang):
    import numpy as np
    ar=math.radians(ang); dx,dy=math.sin(ar),-math.cos(ar)
    yy,xx=np.mgrid[0:h,0:w].astype(float)
    t=xx*dx+yy*dy; t=(t-t.min())/max(t.max()-t.min(),1e-6)
    img=np.zeros((h,w,3)); ps=[p for p,_ in stops]; cs=[np.array(c,float) for _,c in stops]
    for i in range(len(stops)-1):
        m=(t>=ps[i])&(t<=ps[i+1]); lt=(t[m]-ps[i])/max(ps[i+1]-ps[i],1e-6)
        img[m]=cs[i]*(1-lt[:,None])+cs[i+1]*lt[:,None]
    img[t>ps[-1]]=cs[-1]
    return Image.fromarray(img.astype('uint8'))

def tracked(d,pos,txt,font,fill,ls):
    x,y=pos
    for ch in txt:
        d.text((x,y),ch,font=font,fill=fill); x+=d.textlength(ch,font=font)+ls

def em_head(d,x,y,width,txt,em,font,lh):
    i=txt.index(em)
    runs=[(txt[:i],T['ink']),(em,T['green']),(txt[i+len(em):],T['ink'])]
    words=[]
    for seg,col in runs:
        words+=[(w0,col) for w0 in seg.split(' ') if w0]
    lines=[[]]; curw=0
    for w0,col in words:
        wl=d.textlength(w0+' ',font=font)
        if curw+wl>width and lines[-1]: lines.append([]); curw=0
        lines[-1].append((w0,col)); curw+=wl
    for ln in lines:
        cx=x
        for w0,col in ln:
            d.text((cx,y),w0,font=font,fill=col); cx+=d.textlength(w0+' ',font=font)
        y+=lh
    return y

def wrap(d,x,y,width,txt,font,lh,col):
    lines=[[]]; curw=0
    for w0 in txt.split(' '):
        wl=d.textlength(w0+' ',font=font)
        if curw+wl>width and lines[-1]: lines.append([]); curw=0
        lines[-1].append(w0); curw+=wl
    for ln in lines:
        d.text((x,y),' '.join(ln),font=font,fill=col); y+=lh
    return y

img=Image.new('RGB',(W,H),T['white'])
img.paste(lingrad(560*S,H,[(0,T['white']),(0.46,T['boneAlt']),(1,T['panel'])],170),(0,0))
d=ImageDraw.Draw(img)
d.line([560*S,0,560*S,H],fill=T['hair'],width=S)
for r in range(6):
    for c in range(4):
        d.rectangle([(464+c*30)*S,(76+r*30)*S,(464+c*30)*S+3*S,(76+r*30)*S+3*S],fill=T['chipB'])
# the four portal steps, staggered bottoms
d.rectangle([560*S,0,W,630*S],fill=T['tint'])
d.rectangle([598*S,0,W,606*S],fill=T['greenBright'])
d.rectangle([636*S,0,W,582*S],fill=T['green'])
d.rectangle([674*S,0,W,558*S],fill=T['greenHover'])
# copy
d.rectangle([64*S,36*S+7*S,64*S+10*S,36*S+17*S],fill=T['green'])
tracked(d,(64*S+24*S,36*S),'CORPORATE DEVELOPMENT',mono24,T['green'],0.14*24*S)
y=em_head(d,64*S,100*S,450*S,'Buying a business is hard work. We make it easier.','We make it easier.',serif58,int(58*1.08*S))
d.rectangle([64*S,y+26*S,64*S+84*S,y+32*S],fill=T['green'])
wrap(d,64*S,y+32*S+26*S,440*S,'Whether it’s your 1st or your 100th acquisition, we run the process for you.',sans26,int(26*1.38*S),T['body'])
lw=199*S; lg=LOGO.resize((lw,int(LOGO.size[1]*lw/LOGO.size[0])),Image.LANCZOS)
img.paste(lg,(64*S,552*S),lg)
# figure on the steps — head top y42, feet on the canvas floor
fh=588*S; fw=int(FIG.size[0]*fh/FIG.size[1])
r_,g_,b_,a_=FIG.resize((fw,fh),Image.LANCZOS).split()
rgb=ImageEnhance.Contrast(ImageEnhance.Brightness(Image.merge('RGB',(r_,g_,b_))).enhance(1.08)).enhance(1.02)
figL=Image.merge('RGBA',(*rgb.split(),a_))
img.paste(figL,(850*S,H-fh),figL)

OUT.mkdir(parents=True,exist_ok=True)
img.save(OUT/'smbx-featured-thumbnail.png',optimize=True)
print(f'  2400x1260 -> {OUT}/smbx-featured-thumbnail.png')
