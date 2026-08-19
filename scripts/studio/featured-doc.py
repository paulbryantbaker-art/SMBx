#!/usr/bin/env python3
"""
featured-doc.py — ONE-OFF: the offer document in LANDSCAPE for LinkedIn
Featured.

  python3 scripts/studio/featured-doc.py [--out <dir>]

WHY (Paul, 2026-08-19): the Featured card thumbnails a document from its
FIRST PAGE, cropped to ~1.91:1 — a 4:5 cover gets beheaded. The 4:5
documents stay exactly as designed ("the other docs are great and how they
should be"); THIS is the same no-pricing offer re-laid at 1200×630 so the
page LinkedIn thumbnails is already the right shape. Page 1 IS the approved
Featured composition (rendered by featured-thumb.py, loaded as-is, so the
thumbnail and the doc cover cannot drift).

Copy comes from offer-docs.py's own dicts via importlib (P2/P3/P4 — the
canon-corrected text, one source). Landscape re-lay, same grammar: gradient
ground, top strip, kicker/headline/rule/lede in a LEFT column, the dash and
numbered rows in a RIGHT column, ghost numeral, 64px foot. Closer = Frame C
sideways: left column with the plate pair + action bar, φ-rect portrait
right. The closer strings are restated here (the 4:5 closer draws them
inline) — if they change there, change them here.

One-off standing: NOT part of rebuild-all; the 4:5 documents remain the
documents of record.
"""
import sys, pathlib, subprocess, tempfile, importlib.util

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
args = sys.argv[1:]
OUT = pathlib.Path(args[args.index('--out')+1]).resolve() if '--out' in args \
    else ROOT/'studio/collateral/smbx-corpdev-offering/2026-08-19'

spec = importlib.util.spec_from_file_location('offerdocs', HERE/'offer-docs.py')
od = importlib.util.module_from_spec(spec); spec.loader.exec_module(od)
from PIL import Image, ImageDraw

S=2; W,H=1200*S,630*S
T=od.T; F=od.F
FOOT=566  # foot strip top (1x)

serif44=F('serif-var.ttf',44*S,[550]); serif42=F('serif-var.ttf',42*S,[550])
serif200=F('serif-var.ttf',200*S,[550])
sans25=F('sans-400.ttf',25*S);  sans25b=F('sans-600.ttf',25*S)
sans24=F('sans-400.ttf',24*S);  sans26b=F('sans-600.ttf',26*S)
sans22=F('sans-400.ttf',22*S);  sans22b=F('sans-600.ttf',22*S)
sans19=F('sans-400.ttf',19*S);  sans17=F('sans-400.ttf',17*S)
mono20b=F('mono-600.ttf',20*S); mono18b=F('mono-600.ttf',18*S)
mono16b=F('mono-600.ttf',16*S); mono16=F('mono-400.ttf',16*S)
mono15=F('mono-400.ttf',15*S);  mono14b=F('mono-600.ttf',14*S)

def ground():
    img=od.lingrad(W,H,od.GRAD,170); return img,ImageDraw.Draw(img)

def foot(img,d,pg,total):
    y0=FOOT*S
    d.rectangle([0,y0,W,H],fill=T['white']); d.line([0,y0,W,y0],fill=T['hair'],width=S)
    lh_=22*S; lw=int(od.LOGO.size[0]*lh_/od.LOGO.size[1])
    lg=od.LOGO.resize((lw,lh_),Image.LANCZOS); img.paste(lg,(64*S,y0+(64*S-lh_)//2),lg)
    t=f'{pg} / {total}'
    tw=sum(d.textlength(c,font=mono18b)+0.08*18*S for c in t)
    od.tracked(d,(W-64*S-tw,y0+(64*S-18*S)//2),t,mono18b,T['green'],0.08*18*S)

def kicker(d,x,y,txt):
    d.rectangle([x,y+6*S,x+9*S,y+15*S],fill=T['green'])
    od.tracked(d,(x+22*S,y),txt,mono20b,T['green'],0.14*20*S)

def body_land(pg,total,kick,hl,em,lede,rows,row_kind,note,start=1):
    img,d=ground()
    g=f'{pg:02d}'
    d.text((W-56*S-int(d.textlength(g,font=serif200)),FOOT*S-200*S),g,font=serif200,fill=T['hair'])
    t='CORPORATE DEVELOPMENT'
    tw=sum(d.textlength(c,font=mono16b)+0.18*16*S for c in t)
    od.tracked(d,(W-64*S-tw,34*S),t,mono16b,T['muted'],0.18*16*S)
    d.line([64*S,72*S,W-64*S,72*S],fill=T['hair'],width=S)
    # LEFT column — kicker · headline · rule · lede · note
    kicker(d,64*S,104*S,kick)
    y=104*S+20*S+22*S
    if hl.startswith('smbX '):
        od.brand(d,64*S,y,hl[4:],serif44); y+=int(44*1.08*S)
    else:
        y=od.em_head(d,64*S,y,400*S,hl,em,serif44,int(44*1.08*S))
    d.rectangle([64*S,y+22*S,64*S+84*S,y+22*S+5*S],fill=T['green']); y+=22*S+5*S
    if lede: y=od.wrap(d,64*S,y+24*S,400*S,lede,sans24,int(24*1.35*S),T['body'])
    if note:
        # measure the wrapped height on a scratch draw, then anchor to the
        # foot — a char-count guess clipped the 3rd line under the strip
        sd=ImageDraw.Draw(Image.new('RGB',(8,8)))
        nh=od.wrap(sd,0,0,400*S,note,mono16,int(16*1.5*S),T['muted'])
        od.wrap(d,64*S,max(y+22*S,FOOT*S-14*S-nh),400*S,note,mono16,int(16*1.5*S),T['muted'])
    # RIGHT column — the rows
    rx,rw=530*S,606*S
    y=108*S
    for i,row in enumerate(rows):
        if row_kind=='num':
            n=start+i; ch=36*S
            d.rectangle([rx,y+2*S,rx+ch,y+2*S+ch],fill=T['tint'])
            nw=d.textlength(str(n),font=mono20b)
            d.text((rx+(ch-nw)/2,y+2*S+(ch-20*S)/2),str(n),font=mono20b,fill=T['green'])
            y2=od.wrap(d,rx+ch+20*S,y,rw-ch-20*S,row,sans25,int(25*1.35*S),T['body'],bold=sans25b)
            y=max(y2,y+2*S+ch)+16*S
        else:
            d.rectangle([rx,y+13*S,rx+24*S,y+13*S+5*S],fill=T['green'])
            y=od.wrap(d,rx+24*S+20*S,y,rw-44*S,row,sans25,int(25*1.35*S),T['body'],bold=sans25b)
            y+=18*S
    foot(img,d,pg,total)
    return img

def closer_land(total):
    img,d=ground()
    Lx=64*S
    kicker(d,Lx,40*S,'FOR THE ACQUIRER')
    y=od.wrap(d,Lx,84*S,640*S,'Pick the engagement. We’ll bring the function.',serif42,int(42*1.1*S),T['ink'])
    y+=18*S
    # Core plate
    d.rectangle([Lx,y,Lx+640*S,y+82*S],fill=T['white'],outline=T['green'],width=int(1.5*S))
    od.brand(d,Lx+22*S,y+13*S,' Core',sans26b)
    d.text((Lx+22*S,y+13*S+34*S),'Takes you thesis to close.',font=sans19,fill=T['body'])
    y+=82*S+12*S
    # Premium plate
    ph=112*S
    d.rectangle([Lx,y,Lx+640*S,y+ph],fill=T['green'])
    od.tracked(d,(Lx+22*S,y+13*S),'THE PART MOST ADVISORS SKIP',mono14b,T['mint'],0.12*14*S)
    od.brand(d,Lx+22*S,y+13*S+24*S,' Premium',sans26b,base=T['white'],xcol=T['mint'])
    d.text((Lx+22*S,y+13*S+24*S+34*S),'Stays through the first hundred days and beyond.',font=sans19,fill=T['tint'])
    y+=ph+18*S
    y=od.wrap(d,Lx,y,640*S,'One senior operator, on your side of the table.',sans22,int(22*1.3*S),T['body'])
    y+=14*S
    d.rectangle([Lx,y,Lx+640*S,y+58*S],fill=T['green'])
    od.tracked(d,(Lx+24*S,y+(58*S-20*S)//2),'BOOK A CALL — SMBX.AI',mono20b,T['white'],0.1*20*S)
    ay=y+58*S//2; axr=Lx+640*S-24*S
    d.line([axr-22*S,ay,axr-7*S,ay],fill=T['white'],width=2*S)
    d.polygon([(axr,ay),(axr-8*S,ay-5*S),(axr-8*S,ay+5*S)],fill=T['white'])
    y+=58*S+14*S
    # 740 measure: one line (at 640 it wrapped and 'Ever.' vanished under
    # the foot); the text runs ~670px so it still clears the portrait
    od.wrap(d,Lx,y,740*S,'150 acquisitions. $5B+ enterprise value added. Zero sell-side deals. Ever.',mono15,int(15*1.45*S),T['muted'])
    # Frame C portrait, φ-rect 280×453
    pw,phh=280*S,453*S
    fx,fy=W-64*S-pw,44*S
    d.rectangle([fx+12*S,fy+12*S,fx+12*S+pw,fy+12*S+phh],fill=T['green'])
    port=od.HEAD.resize((pw,int(od.HEAD.size[1]*pw/od.HEAD.size[0])),Image.LANCZOS).crop((0,0,pw,phh))
    img.paste(port,(fx,fy)); d=ImageDraw.Draw(img)
    d.rectangle([fx,fy,fx+pw,fy+phh],outline=T['ink'],width=S)
    hs=10*S
    for hx in (fx-5*S,fx+pw-5*S):
        for hy in (fy-5*S,fy+phh-5*S):
            d.rectangle([hx,hy,hx+hs,hy+hs],fill=T['ink'])
    d.text((fx,fy+phh+18*S),'Paul Baker',font=sans22b,fill=T['ink'])
    d.text((fx,fy+phh+18*S+30*S),'Buy-side corporate development',font=sans17,fill=T['muted'])
    foot(img,d,total,total)
    return img

# page 1 = the approved Featured composition, rendered by featured-thumb.py
with tempfile.TemporaryDirectory() as td:
    subprocess.run([sys.executable,str(HERE/'featured-thumb.py'),'--out',td],check=True)
    p1=Image.open(pathlib.Path(td)/'smbx-featured-thumbnail.png').convert('RGB')
assert p1.size==(W,H), f'thumb {p1.size} != {(W,H)}'

n=5
pages=[p1,
    body_land(2,n,**od.P2),
    body_land(3,n,**od.P3),
    body_land(4,n,od.P4['kick'],od.P4['hl'],od.P4['em'],od.P4['lede'],
              od.P4['rows'],od.P4['row_kind'],od.P4['note'],start=6),
    closer_land(n)]

OUT.mkdir(parents=True,exist_ok=True)
for i,p in enumerate(pages):
    p.save(OUT/f'smbx-corpdev-offering-featured-p{i+1:02d}.jpg',quality=92,optimize=True)
pages[0].save(OUT/'smbx-corpdev-offering-featured.pdf',save_all=True,
              append_images=[p.convert('RGB') for p in pages[1:]],resolution=144)
print(f'  landscape doc: {n} pages -> {OUT}/smbx-corpdev-offering-featured.pdf')
