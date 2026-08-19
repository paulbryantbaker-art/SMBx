#!/usr/bin/env python3
"""
offer-docs.py — the two smbX offer documents, transcribed from Claude Design.

  python3 scripts/studio/offer-docs.py [--out <dir>] [--doc nopricing|pricing|both]

SOURCE OF TRUTH: `design_handoff_smbx_offer_docs/` (repo root — RULE ZERO:
the HTML wins over any comment here). 12 reference pages, two documents in
the figure-card LIGHT family (portal cover · gradient body pages with ghost
numerals · Frame C two-column closer):

  no-pricing (5pp)  cover · problem · smbX Core · smbX Premium · closer
                    — the POSTABLE offer document.
  pricing   (7pp)   … + the schedule table + the terms page — the EMAIL-GATED
                    offering PDF. Going live means replacing
                    `content/collateral/smbx-corpdev-pricing.pdf` (the file
                    `POST /api/practice/pricing` mails to leads) — that swap
                    is a deliberate deploy step, never a side effect of
                    running this script.

FIVE COPY CORRECTIONS vs the handoff, every one a canon violation CD inherited
from the outdated published brochure it transcribed. Design is 1:1; copy
follows the practice's own record. Do not "restore" the handoff wording:

  1. THE RETAINER IS QUARTERLY. The handoff wrote "$15,000 to start — your
     first 90 days. Then $5,000 a month, stop any time." Root CLAUDE.md,
     THE SCHEDULE: $15,000 PER QUARTER, up front; renewals are further $15K
     quarters; step away at a QUARTER'S END — and the monthly cadence was
     shipped and REVERSED THE SAME DAY on 2026-08-17 with an explicit
     "DO NOT REDO IT". The most expensive line in the bundle.
  2. "Close the deal and the retainer was free" overstates: credit CAPS at
     the success fee (a floor deal with a long mandate does not zero out).
     Canon phrasing used instead: credited against the success fee at close.
  3. VALUATION, not "Evaluation" (Paul, 2026-08-13: "as in how much a
     business is worth. My ICP will catch this").
  4. smbX Core / smbX Premium (Paul, 2026-08-19) — the handoff still says
     smbXCorpDev / smbXCorpDev Premium.
  5. "$5B+ ENTERPRISE VALUE ADDED", not "REVENUE ADDED" — the sanctioned
     stat set (root CLAUDE.md, Track Record doctrine). Revenue is a
     different, unsanctioned claim.

Everything else is the handoff verbatim: geometry, tokens (audited — all 12
files resolve to the CARTA block), the mobile floor (reading 40px, mono ≥20),
portal cover with the ruled stat rows, ghost page numerals, the dash and
numbered rows, the schedule table, the Frame C closer with the plate pair.

PIL raster, same standing as figure-deck.py: subordinate to a future
build-deck.mts page-kind extension (FIGURE_COVER_WORK_ORDER.md).
"""
import sys, os, json, subprocess, pathlib, math, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent if False else pathlib.Path(__file__).resolve().parent.parent.parent
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
args = sys.argv[1:]
def flag(n, d=None):
    return args[args.index(n) + 1] if n in args else d
OUT = pathlib.Path(flag('--out', 'collateral')).resolve()
DOC = flag('--doc', 'both')

from fontTools.ttLib import TTFont  # noqa — ensures cache deps present
CACHE = HERE / '.fonts-cache'
from PIL import Image, ImageDraw, ImageFont

def F(n, s, ax=None):
    f = ImageFont.truetype(str(CACHE / n), s)
    if ax:
        try: f.set_variation_by_axes(ax)
        except Exception: pass
    return f

S = 2; W, H = 1080 * S, 1350 * S
T = dict(white=(255,255,255), boneAlt=(249,247,241), panel=(243,240,233),
         ink=(22,24,26), body=(74,79,84), muted=(124,129,135),
         hair=(228,223,211), chipB=(216,211,198), green=(10,122,88),
         greenHover=(8,99,72), greenBright=(15,169,124), tint=(223,245,236),
         mint=(168,240,206))

serif168=F('serif-var.ttf',168*S,[550]); serif64=F('serif-var.ttf',64*S,[550])
serif42=F('serif-var.ttf',42*S,[550]);  serif300=F('serif-var.ttf',300*S,[550])
sans40=F('sans-400.ttf',40*S); sans40b=F('sans-600.ttf',40*S)
sans32b=F('sans-600.ttf',32*S); sans24=F('sans-400.ttf',24*S)
sans26b=F('sans-600.ttf',26*S); sans24b=F('sans-600.ttf',24*S)
sans20=F('sans-400.ttf',20*S); sans22=F('sans-400.ttf',22*S)
mono26=F('mono-600.ttf',26*S); mono22=F('mono-400.ttf',22*S)
mono22b=F('mono-600.ttf',22*S); mono20b=F('mono-600.ttf',20*S)
mono26b=F('mono-600.ttf',26*S)

FIG=Image.open(ROOT/'studio/assets/brand/founder-standing.png').convert('RGBA')
HEAD=Image.open(ROOT/'client/public/founder-portrait.jpg').convert('RGB')
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

GRAD=[(0,T['white']),(0.46,T['boneAlt']),(1,T['panel'])]

def tracked(d,pos,txt,font,fill,ls):
    x,y=pos
    for ch in txt:
        d.text((x,y),ch,font=font,fill=fill); x+=d.textlength(ch,font=font)+ls
    return x

def wrap(d,x,y,width,txt,font,lh,col,ls=0,bold=None):
    """bold: font for **spans**"""
    segs=str(txt).split('**'); lines=[[]]; curw=0
    for j,seg in enumerate(segs):
        f=(bold or font) if j%2 else font
        c='B' if j%2 else 'N'
        for w0 in seg.split(' '):
            if not w0: continue
            wl=d.textlength(w0+' ',font=f)+ls*len(w0)
            if curw+wl>width and lines[-1]: lines.append([]); curw=0
            lines[-1].append((w0,f,c)); curw+=wl
    for ln in lines:
        cx=x
        for w0,f,c in ln:
            d.text((cx,y),w0,font=f,fill=(T['ink'] if c=='B' else col))
            cx+=d.textlength(w0+' ',font=f)+ls*len(w0)
        y+=lh
    return y

def em_head(d,x,y,width,txt,em,font,lh):
    runs=[(txt.replace(em,''),T['ink']),(em,T['green'])] if em and em in txt else [(txt,T['ink'])]
    if em and em in txt:
        i=txt.index(em)
        runs=[(txt[:i],T['ink']),(em,T['green']),(txt[i+len(em):],T['ink'])]
    words=[]
    for seg,col in runs:
        words+= [(w0,col) for w0 in seg.split(' ') if w0]
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

def brand(d,x,y,name,font,base=None,xcol=None):
    """smbX Core — the X in green (the handoff's headline treatment)."""
    base=base or T['ink']; xcol=xcol or T['green']
    for ch,c in [('smb',base),('X',xcol),(name,base)]:
        d.text((x,y),ch,font=font,fill=c); x+=d.textlength(ch,font=font)
    return x

def foot90(img,d,pg,total):
    y0=H-90*S
    d.rectangle([0,y0,W,H],fill=T['white'])
    d.line([0,y0,W,y0],fill=T['hair'],width=S)
    lh_=24*S; lw=int(LOGO.size[0]*lh_/LOGO.size[1])
    lg=LOGO.resize((lw,lh_),Image.LANCZOS); img.paste(lg,(72*S,y0+(90*S-lh_)//2),lg)
    t=f'{pg} / {total}'
    tw=sum(d.textlength(c,font=mono22b)+0.08*22*S for c in t)
    tracked(d,(W-72*S-tw,y0+(90*S-22*S)//2),t,mono22b,T['green'],0.08*22*S)

def body_page(pg,total,kick,hl,em,lede,rows,row_kind,note,start=1):
    img=lingrad(W,H,GRAD,170); d=ImageDraw.Draw(img)
    d.text((W-56*S-int(d.textlength(f'{pg:02d}',font=serif300)),H-118*S-300*S),
           f'{pg:02d}',font=serif300,fill=T['hair'])
    t='CORPORATE DEVELOPMENT'
    tw=sum(d.textlength(c,font=mono20b)+0.18*20*S for c in t)
    tracked(d,(W-72*S-tw,56*S),t,mono20b,T['muted'],0.18*20*S)
    d.line([72*S,56*S+20*S+22*S,W-72*S,56*S+20*S+22*S],fill=T['hair'],width=S)
    ky=56*S+20*S+22*S+56*S
    d.rectangle([72*S,ky+8*S,72*S+10*S,ky+18*S],fill=T['green'])
    tracked(d,(72*S+24*S,ky),kick,mono26,T['green'],0.14*26*S)
    y=ky+26*S+26*S
    if hl.startswith('smbX '):
        brand(d,72*S,y,hl[4:],serif64); y+=int(64*1.06*S)
    else:
        y=em_head(d,72*S,y,920*S,hl,em,serif64,int(64*1.06*S))
    d.rectangle([72*S,y+34*S,72*S+84*S,y+34*S+6*S],fill=T['green']); y+=34*S+6*S
    if lede: y=wrap(d,72*S,y+40*S,900*S,lede,sans40,int(40*1.3*S),T['body'])
    y+=44*S
    for i,row in enumerate(rows):
        if row_kind=='num':
            n=start+i; ch=44*S
            d.rectangle([72*S,y+4*S,72*S+ch,y+4*S+ch],fill=T['tint'])
            nw=d.textlength(str(n),font=mono26)
            d.text((72*S+(ch-nw)/2,y+4*S+(ch-26*S)/2),str(n),font=mono26,fill=T['green'])
            y2=wrap(d,72*S+ch+24*S,y,(920-44-24)*S,row,sans40,int(40*1.3*S),T['body'],bold=sans40b)
            y=max(y2,y+4*S+ch)+(21 if total==7 else 24)*S
        else:
            d.rectangle([72*S,y+19*S,72*S+26*S,y+19*S+6*S],fill=T['green'])
            y=wrap(d,72*S+26*S+24*S,y,(900-50)*S,row,sans40,int(40*1.3*S),T['body'],bold=sans40b)
            y+=26*S
    if note:
        ny=H-118*S-90*S-int(22*1.55*S)*2-28*S
        wrap(d,72*S,max(y+28*S,ny),860*S,note,mono22,int(22*1.55*S),T['muted'])
    foot90(img,d,pg,total)
    return img

def table_page(pg,total):
    img=lingrad(W,H,GRAD,170); d=ImageDraw.Draw(img)
    d.text((W-56*S-int(d.textlength(f'{pg:02d}',font=serif300)),H-118*S-300*S),
           f'{pg:02d}',font=serif300,fill=T['hair'])
    t='CORPORATE DEVELOPMENT'
    tw=sum(d.textlength(c,font=mono20b)+0.18*20*S for c in t)
    tracked(d,(W-72*S-tw,56*S),t,mono20b,T['muted'],0.18*20*S)
    d.line([72*S,98*S,W-72*S,98*S],fill=T['hair'],width=S)
    ky=154*S
    d.rectangle([72*S,ky+8*S,72*S+10*S,ky+18*S],fill=T['green'])
    tracked(d,(72*S+24*S,ky),'THE SCHEDULE',mono26,T['green'],0.14*26*S)
    y=em_head(d,72*S,ky+52*S,920*S,'Simple, up-front pricing — the same for everyone.','the same for everyone.',serif64,int(64*1.06*S))
    d.rectangle([72*S,y+34*S,72*S+84*S,y+40*S],fill=T['green'])
    y=wrap(d,72*S,y+80*S,900*S,'Published, so you can decide without another call.',sans40,int(40*1.3*S),T['body'])
    y+=44*S
    tracked(d,(72*S,y),'TRANSACTION VALUE',mono20b,T['muted'],0.14*20*S)
    rt='RATE'; rw=sum(d.textlength(c,font=mono20b)+0.14*20*S for c in rt)
    tracked(d,(72*S+936*S-rw,y),rt,mono20b,T['muted'],0.14*20*S)
    y+=20*S+16*S
    d.rectangle([72*S,y,72*S+936*S,y+3*S],fill=T['green']); y+=3*S
    rows=[('First $1M','5%',0),('$1M – $5M','4%',0),('$5M – $10M','3%',0),
          ('Above $10M','2%',0),('Minimum fee','$100,000',1)]
    for name,rate,strong in rows:
        y+=20*S
        d.text((72*S,y),name,font=sans40b if strong else sans40,fill=T['ink'])
        rw2=d.textlength(rate,font=sans40b)
        d.text((72*S+936*S-rw2,y),rate,font=sans40b,fill=T['ink'])
        y+=int(40*1.1*S)+20*S
        d.line([72*S,y,72*S+936*S,y],fill=T['hair'],width=S)
    wrap(d,72*S,H-118*S-90*S-int(22*1.55*S)*2-28*S,860*S,
         'Every term spelled out plainly in the engagement letter. Same schedule for every client.',
         mono22,int(22*1.55*S),T['muted'])
    foot90(img,d,pg,total)
    return img

def twrap(d,x,y,width,txt,font,lh,col,ls):
    """tracked word-wrap (the nlab needs letter-spacing AND a measure)."""
    lines=[[]]; curw=0
    for w0 in str(txt).split(' '):
        wl=sum(d.textlength(c,font=font)+ls for c in w0)
        sp=d.textlength(' ',font=font)+ls
        # fit test EXCLUDES the trailing space — counting it wrapped
        # 'SELL-SIDE DEALS. EVER.' that the reference keeps on one line
        if curw+wl>width and lines[-1]: lines.append([]); curw=0
        lines[-1].append(w0); curw+=wl+sp
    for ln in lines:
        tracked(d,(x,y),' '.join(ln),font,col,ls); y+=lh
    return y

def cover(total):
    """THE HANDOFF COVER (offer-*-p01.html), transcribed 1:1 — RESTORED.
    A thumbnail-style cover (no numeral, no stat rows) shipped for a few
    hours on 2026-08-19 and was REVERSED the same day (Paul: "i didn't want
    to change the actual docs, change them back to how they were"). Do not
    redo it: that composition lives ONLY in the LinkedIn Featured one-off,
    scripts/studio/featured-thumb.py — it exists because LinkedIn crops a
    4:5 cover to ~1.91:1 in the Featured card and beheads the figure.
    Two copy corrections ride the stat rows (see module docstring):
    ENTERPRISE VALUE ADDED, not REVENUE ADDED; ~$21B, not ≈$21B."""
    img=Image.new('RGB',(W,H),T['white'])
    img.paste(lingrad(520*S,1232*S,GRAD,170),(0,0))
    d=ImageDraw.Draw(img)
    d.line([520*S,0,520*S,1232*S],fill=T['hair'],width=S)
    for r in range(12):
        for c in range(5):
            d.rectangle([(430+c*34)*S,(120+r*34)*S,(430+c*34)*S+3*S,(120+r*34)*S+3*S],fill=T['chipB'])
    d.rectangle([520*S,0,1016*S,1232*S],fill=T['tint'])
    d.rectangle([558*S,0,1016*S,1194*S],fill=T['greenBright'])
    d.rectangle([596*S,0,1016*S,1156*S],fill=T['green'])
    d.rectangle([634*S,0,1016*S,1118*S],fill=T['greenHover'])
    tracked(d,(682*S,70*S),'150',serif168,T['white'],-0.03*168*S)
    d.rectangle([688*S,252*S,688*S+52*S,252*S+4*S],fill=T['mint'])
    twrap(d,688*S,278*S,250*S,'ACQUISITIONS — TWO DECADES, ONE SIDE OF THE TABLE',
          mono22b,int(22*1.55*S),T['tint'],0.1*22*S)
    d.rectangle([64*S,58*S+8*S,64*S+10*S,58*S+18*S],fill=T['green'])
    tracked(d,(64*S+24*S,58*S),'CORPORATE DEVELOPMENT',mono26,T['green'],0.14*26*S)
    em_head(d,64*S,130*S,470*S,'Buying a business is hard work. We make it easier.','We make it easier.',serif64,int(64*1.06*S))
    wrap(d,64*S,492*S,452*S,'Whether it’s your 1st or your 100th acquisition, we run the process for you, freeing up your time and resources.',sans40,int(40*1.32*S),T['body'])
    asc42=serif42.getmetrics()[0]; asc20=mono20b.getmetrics()[0]
    y=846*S
    stats=[('$5B+','ENTERPRISE VALUE ADDED'),('~$21B','TRANSACTION VALUE TOUCHED'),('0','SELL-SIDE DEALS. EVER.')]
    for i,(v,l) in enumerate(stats):
        d.line([64*S,y,64*S+452*S,y],fill=T['hair'],width=S)
        ry=y+16*S
        tracked(d,(64*S,ry),v,serif42,T['green'],-0.01*42*S)
        ly=twrap(d,(64+128+16)*S,ry+asc42-asc20,(452-128-16)*S,l,
                 mono20b,int(20*1.25*S),T['muted'],0.08*20*S)
        y=max(ry+42*S,ly-(int(20*1.25*S)-20*S))+14*S
    d.line([64*S,y,64*S+452*S,y],fill=T['hair'],width=S)
    lw=199*S; lg=LOGO.resize((lw,int(LOGO.size[1]*lw/LOGO.size[0])),Image.LANCZOS)
    img.paste(lg,(64*S,1128*S),lg)
    fh=930*S; fw=int(FIG.size[0]*fh/FIG.size[1])
    from PIL import ImageEnhance
    r_,g_,b_,a_=FIG.resize((fw,fh),Image.LANCZOS).split()
    rgb=ImageEnhance.Contrast(ImageEnhance.Brightness(Image.merge('RGB',(r_,g_,b_))).enhance(1.08)).enhance(1.02)
    figL=Image.merge('RGBA',(*rgb.split(),a_))
    img.paste(figL,(500*S,302*S),figL); d=ImageDraw.Draw(img)
    y0=1232*S
    d.rectangle([0,y0,W,H],fill=T['white']); d.line([0,y0,W,y0],fill=T['hair'],width=S)
    fs=56*S
    d.ellipse([64*S-1,y0+(118*S-fs)//2-1,64*S+fs+7*S,y0+(118*S-fs)//2+fs+7*S],fill=T['chipB'])
    d.ellipse([64*S,y0+(118*S-fs)//2,64*S+fs+6*S,y0+(118*S-fs)//2+fs+6*S],fill=T['white'])
    face=HEAD.resize((fs,int(HEAD.size[1]*fs/HEAD.size[0])),Image.LANCZOS).crop((0,int(fs*0.283),fs,int(fs*0.283)+fs))
    mask=Image.new('L',(fs,fs),0); ImageDraw.Draw(mask).ellipse([0,0,fs,fs],fill=255)
    img.paste(face,(64*S+3*S,y0+(118*S-fs)//2+3*S),mask); d=ImageDraw.Draw(img)
    d.text((64*S+fs+22*S,y0+24*S),'Paul Baker',font=sans24b,fill=T['ink'])
    d.text((64*S+fs+22*S,y0+24*S+30*S),'Buy-side corporate development',font=sans20,fill=T['muted'])
    tw=sum(d.textlength(c,font=mono22b)+0.08*22*S for c in 'SWIPE')+30*S
    x=tracked(d,(W-64*S-tw,y0+(118*S-22*S)//2),'SWIPE',mono22b,T['green'],0.08*22*S)
    ay=y0+118*S//2
    d.line([x+10*S,ay,x+26*S,ay],fill=T['green'],width=2*S)
    d.polygon([(x+32*S,ay),(x+24*S,ay-5*S),(x+24*S,ay+5*S)],fill=T['green'])
    return img

def closer(total,pricing):
    img=lingrad(W,H,GRAD,170); d=ImageDraw.Draw(img)
    Lx=64*S
    ky=64*S+12*S
    d.rectangle([Lx,ky+8*S,Lx+10*S,ky+18*S],fill=T['green'])
    tracked(d,(Lx+24*S,ky),'FOR THE ACQUIRER',mono26,T['green'],0.14*26*S)
    y=wrap(d,Lx,ky+26*S+30*S,540*S,'Pick the engagement. We’ll bring the function.',serif64,int(64*1.06*S),T['ink'])
    y+=40*S
    d.rectangle([Lx,y,Lx+540*S,y+150*S],fill=T['white'],outline=T['green'],width=int(1.5*S))
    brand(d,Lx+26*S,y+24*S,' Core',sans32b)
    d.text((Lx+26*S,y+24*S+40*S),'Takes you thesis to close.',font=sans24,fill=T['body'])
    y+=150*S+18*S
    ph=214*S
    d.rectangle([Lx,y,Lx+540*S,y+ph],fill=T['green'])
    tracked(d,(Lx+26*S,y+24*S),'THE PART MOST ADVISORS SKIP',mono20b,T['mint'],0.12*20*S)
    brand(d,Lx+26*S,y+24*S+36*S,' Premium',sans32b,base=T['white'],xcol=T['mint'])
    wrap(d,Lx+26*S,y+24*S+36*S+44*S,488*S,'Stays through the first hundred days and beyond.',sans24,int(24*1.35*S),T['tint'])
    y+=ph+36*S
    para='One senior operator, on your side of the table' + (', at a price you already know.' if pricing else '.')
    y=wrap(d,Lx,y,540*S,para,sans40,int(40*1.32*S),T['body'])
    y+=36*S
    d.rectangle([Lx,y,Lx+540*S,y+84*S],fill=T['green'])
    tracked(d,(Lx+30*S,y+(84*S-26*S)//2),'BOOK A CALL — SMBX.AI',mono26b,T['white'],0.1*26*S)
    aw=d.textlength('→',font=mono26b)
    d.text((Lx+540*S-30*S-aw,y+(84*S-26*S)//2),'→',font=sans26b,fill=T['white'])
    y+=84*S+26*S
    y=wrap(d,Lx,y,540*S,'150 acquisitions. $5B+ enterprise value added. Zero sell-side deals. Ever.',mono22,int(22*1.5*S),T['muted'])
    lw=199*S; lg=LOGO.resize((lw,int(LOGO.size[1]*lw/LOGO.size[0])),Image.LANCZOS)
    img.paste(lg,(Lx,H-56*S-lg.size[1]),lg); d=ImageDraw.Draw(img)
    fx,fy=W-64*S-16*S-380*S,64*S+216*S
    d.rectangle([fx+14*S,fy+14*S,fx+14*S+380*S,fy+14*S+616*S],fill=T['green'])
    port=HEAD.resize((380*S,int(HEAD.size[1]*380*S/HEAD.size[0])),Image.LANCZOS)
    port=port.crop((0,0,380*S,616*S))
    img.paste(port,(fx,fy)); d=ImageDraw.Draw(img)
    d.rectangle([fx,fy,fx+380*S,fy+616*S],outline=T['ink'],width=S)
    hs=12*S
    for hx in (fx-6*S,fx+380*S-6*S):
        for hy in (fy-6*S,fy+616*S-6*S):
            d.rectangle([hx,hy,hx+hs,hy+hs],fill=T['ink'])
    d.text((fx,fy+616*S+34*S),'Paul Baker',font=sans26b,fill=T['ink'])
    d.text((fx,fy+616*S+34*S+34*S),'Buy-side corporate development',font=sans22,fill=T['muted'])
    t=f'{total} / {total}'
    tw=sum(d.textlength(c,font=mono22b)+0.08*22*S for c in t)
    tracked(d,(W-64*S-tw,H-56*S-22*S),t,mono22b,T['muted'],0.08*22*S)
    return img

# ── the copy, canon-corrected ────────────────────────────────────────────
P2=dict(kick='THE PROBLEM',
  hl='Most buyers don’t have a corp dev function.', em='corp dev function.',
  lede='Standing one up runs $500,000 to $1,500,000 a year — the expensive way to find that out.',
  rows=['**All-in, not just salary** — a fixed cost attached to an activity that only happens occasionally.',
        '**It does not scale down between deals.** The function is idle and the cost is not.',
        '**Most banks are built for the sell side.** A buy-side search is a different job.'],
  row_kind='dash',
  note='Targets under $250M revenue. Buy-side only — THE LINE, smbX practice perimeter.')
P3=dict(kick='THE ENGAGEMENT', hl='smbX Core', em=None,
  lede='Thesis to close. The whole buy-side function, run for you.',
  rows=['**Thesis** — what to buy, and whether it is buyable today.',
        '**Sourcing** — the owners who are not looking to sell, reached under your name.',
        '**Valuation** — financials rebuilt, every adjustment tested, surprises found early.',
        '**Structure & offer** — terms a lender will back. We write it and we negotiate it.',
        '**Diligence & close** — where deals come apart. Every thread held to signing.'],
  row_kind='num',
  note='One buyer per target. Never the sell side — it is in the engagement letter.')
P4=dict(kick='THE UPGRADE', hl='smbX Premium', em=None,
  lede='Everything above. Then the part most advisors skip.',
  rows=['**Integration** — the first hundred days, planned before close. You keep the people and the customers you just paid for.',
        '**Value creation** — we stay past day 100: the thesis tracked, the levers pulled, the add-ons sourced.'],
  row_kind='num',
  note='Premium is the same team staying in the deal after the wire clears.')
TERMS=dict(kick='THE SCHEDULE',
  hl='Nothing to haggle over, no surprises at close.', em='no surprises at close.',
  lede=None,
  rows=['**$15,000 a quarter, up front** — the first quarter is the engagement. Step away at any quarter’s end.',
        '**Every dollar credited** against the success fee at close.',
        '**No cliffs** — each dollar priced in its own band. A $5M deal: $210,000, or 4.2%.',
        '**Premium adds no second formula** — the retainer simply continues past close.'],
  row_kind='dash', note=None)

def build(name,total,pages):
    OUT.mkdir(parents=True,exist_ok=True)
    for i,img in enumerate(pages):
        img.save(OUT/f'{name}-p{i+1:02d}.jpg',quality=92,optimize=True)
    pages[0].save(OUT/f'{name}.pdf',save_all=True,
                  append_images=[p.convert('RGB') for p in pages[1:]],resolution=144)
    print(f'  {name}: {total} pages -> {OUT}/{name}.pdf')

# Guarded so featured-doc.py (the landscape one-off) can import the copy
# dicts and helpers via importlib WITHOUT triggering a 4:5 build.
if __name__=='__main__':
    if DOC in ('nopricing','both'):
        n=5
        build('smbx-offer',n,[cover(n),
            body_page(2,n,**P2), body_page(3,n,**P3),
            body_page(4,n,P4['kick'],P4['hl'],P4['em'],P4['lede'],P4['rows'],P4['row_kind'],P4['note'],start=6),
            closer(n,False)])
    if DOC in ('pricing','both'):
        n=7
        build('smbx-offer-pricing',n,[cover(n),
            body_page(2,n,P2['kick'],P2['hl'],P2['em'],P2['lede'],P2['rows'],P2['row_kind'],P2['note']),
            body_page(3,n,P3['kick'],P3['hl'],P3['em'],P3['lede'],P3['rows'],P3['row_kind'],P3['note']),
            body_page(4,n,P4['kick'],P4['hl'],P4['em'],P4['lede'],P4['rows'],P4['row_kind'],P4['note'],start=6),
            table_page(5,n),
            body_page(6,n,TERMS['kick'],TERMS['hl'],TERMS['em'],TERMS['lede'],TERMS['rows'],TERMS['row_kind'],TERMS['note']),
            closer(n,True)])
