#!/usr/bin/env python3
"""
figure-deck.py — a LinkedIn carousel in the FIGURE-CARD family.

  python3 scripts/studio/figure-deck.py <spec.deck.mts> --out <dir> [--ground monolith-dark|portal-light|both]

WHAT THIS RENDERS (Paul, 2026-08-19, from the Claude Design handoff at
`design_handoff_smbx_figure_card/`, then eight rounds of his corrections):

  COVER + CLOSER are the figure-card bookends —
     'monolith-dark'  Deal Green monolith on the band, greenBright offset rim
                      plate, aimed bloom, gradient copy panel.
     'portal-light'   four receding green portal steps on paper, gradient copy
                      panel, dot field.
  BODY PAGES are the HOUSE LIGHT GRAMMAR in both cases — bone ground, ghost
     numeral at 5%, mono kicker over a hairline rule, green rule under the
     head, flat dark band strip at the foot.

THE BOOKEND LAW IS WHY. Exactly two dark/plated pages, front and back, light
pages between. A first cut wore the monolith on all ten pages and Paul caught
it: the monolith is a COVER treatment, not a page style.

EIGHT CORRECTIONS ARE BAKED IN HERE, each one a thing that looked fine in the
abstract and wrong on the page. Do not "simplify" any of them away:

  1. LOGO LOWER-LEFT, ON PHI. On a bookend the logo sits at width
     panel/phi-squared = 228px on the 64px rail, bottom edge on a matching
     64px margin — not in the corner, where at 26px it vanished against the
     green plate ("the logo gets kind of lost in the corner").
  2. COVER HOOK MEASURE 420px at 56px. At 480/64 the hook ran into the
     figure's shoulder.
  3. THE NUMERAL BELONGS WITH ITS SENTENCE. A numeral page's head is a
     fragment ("of broken post-LOI deals died on..."), so the figure is set
     at the top of the COPY column and the plate takes the page number. Put
     the numeral on the plate and the reader gets a stranded fragment.
  4. BODY MEASURE ~24em (head 760px, body 720px). Full-width lines are the
     most common carousel legibility failure.
  5. THE CLOSER IS THE CTA PAGE, NOT A SECOND COVER. Portrait, payoff line,
     the follow-up question, ONE filled action bar (the only filled control
     in the system), signature logo. Rendering it as a mirror of the cover
     gives a swiper nothing at the end — Paul: "that is not the content
     pages... the CTA page is supposed to be my headshot."
  6. FRAME C — the portrait is a RECTANGLE, phi by construction. The rule was
     measured against founder-portrait.jpg at 1200x1944 = 1:1.620, where a phi
     frame showed the WHOLE photograph. THE ASSET CHANGED 2026-08-22:
     founder-headshot.jpg is 1536x2732 = 1:1.779, so a phi frame now CROPS
     about 9% of the height. That is fine and deliberate — the new shot is
     already chest-up, so the crop takes headroom rather than his neck — but
     do not re-derive "shows the whole photograph" from the new file. A square frame has
     to discard 38% of the image and it discards him from the chin down
     ("it looks like i have no neck"). Radius 0 + four corner handles is the
     house grammar; the round disc was the one sanctioned exception and this
     replaces it on the closer. The 14px green offset plate is the monolith's
     rim-light move, tying the closer to the cover.
  7. SMALL FOOT DISC CROPS AT 0.283. Measured landmarks: crown y=273,
     eyes 664, chin 1257. At the old 0.06 the chin sat at 99% of the circle.
  8. FIGURE EXPOSURE LIFT IS RENDERER-SIDE (1.16/1.05 dark, 1.08/1.02 light).
     The asset is never altered, so light grounds inherit no lift.

ORDER OF PRECEDENCE. `build-deck.mts` is the canonical carousel renderer and
does not yet know this family — see FIGURE_COVER_WORK_ORDER.md for the engine
change. Until that lands this script is how a figure-card carousel gets made,
and like figure-fallback.py it is a PIL raster: faithful tokens, fonts and
geometry, line breaks a few px off a Chromium build.

Copy and palette are never duplicated here — the spec is imported through tsx
and CARTA comes from house/tokens.ts.
"""
import sys, os, json, subprocess, pathlib, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
args = sys.argv[1:]
spec_arg = next((a for a in args if not a.startswith('--')), None)
if not spec_arg:
    print(__doc__.split(chr(10))[2]); sys.exit(64)
def flag(name, default=None):
    return args[args.index(name) + 1] if name in args else default
SPEC = pathlib.Path(spec_arg).resolve()
OUT = flag('--out', 'collateral')
GROUND = flag('--ground', 'monolith-dark')

# ── spec + live tokens through tsx (never duplicated here) ────────────────
tsx = ROOT / 'node_modules/tsx/dist/cli.mjs'
if not tsx.exists():
    print('tsx missing — installing (--no-save)...')
    subprocess.run(['npm','install','tsx','--no-save','--prefer-offline'], cwd=str(ROOT), capture_output=True)
    if not tsx.exists(): print('could not install tsx'); sys.exit(69)
emit = ("import { pathToFileURL } from 'node:url';\n"
        f"const m = await import(pathToFileURL({json.dumps(str(SPEC))}).href);\n"
        f"const t = await import(pathToFileURL({json.dumps(str(ROOT / 'house/tokens.ts'))}).href);\n"
        "console.log(JSON.stringify({deck: m.deck, CARTA: t.CARTA}));")
with tempfile.NamedTemporaryFile('w', suffix='.mts', delete=False) as tf:
    tf.write(emit); ep = tf.name
r = subprocess.run(['node', str(tsx), ep], capture_output=True, text=True, cwd=str(ROOT))
os.unlink(ep)
if r.returncode != 0: print('spec import failed:\n', r.stderr[-700:]); sys.exit(65)
_d = json.loads(r.stdout.strip().split(chr(10))[-1])
deck = _d['deck']; CARTA = _d['CARTA']
os.chdir(ROOT)

from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import numpy as np, math

S=2; W,H=1080*S,1350*S
def _hx(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
T=dict(green=_hx(CARTA['green']),greenHover=_hx(CARTA['greenHover']),greenBright=_hx(CARTA['greenBright']),
tint=_hx(CARTA['greenTint']),mint=_hx(CARTA['mint']),dark=_hx(CARTA['dark']),dSeam=_hx(CARTA['darkSeam']),
dPlate=_hx(CARTA['darkPlate']),dInk=_hx(CARTA['darkInk']),dSub=_hx(CARTA['darkSub']),dMut=_hx(CARTA['darkMuted']),
dLegal=_hx(CARTA['darkLegal']),dBtn=_hx(CARTA['darkBtnBorder']),white=_hx(CARTA['white']),
bone=_hx(CARTA['bone']),boneAlt=_hx(CARTA['boneAlt']),panel=_hx(CARTA['panel']),ink=_hx(CARTA['ink']),
body=_hx(CARTA['body']),muted=_hx(CARTA['muted']),hair=_hx(CARTA['hair']),chipB=_hx(CARTA['chipBorder']))

# ── PORTAL-LIGHT: the light bookend ground (stepped portal). Same slots as
#    the monolith, four receding green steps instead of one plate, on paper.
def portal_base():
    img=Image.new('RGB',(W,H),T['bone'])
    img.paste(lingrad(520*S,1232*S,[(0,T['bone']),(0.46,T['boneAlt']),(1,T['panel'])],170),(0,0))
    d=ImageDraw.Draw(img)
    d.line([520*S,0,520*S,1232*S],fill=T['hair'],width=S)
    for r in range(12):
        for c in range(5):
            d.rectangle([(430+c*34)*S,(120+r*34)*S,(430+c*34)*S+3*S,(120+r*34)*S+3*S],fill=T['chipB'])
    return img,d

def portal_steps(img,d):
    d.rectangle([520*S,0,(520+496)*S,1232*S],fill=T['tint'])
    d.rectangle([558*S,0,(558+458)*S,1194*S],fill=T['greenBright'])
    d.rectangle([596*S,0,(596+420)*S,1156*S],fill=T['green'])
    d.rectangle([634*S,0,(634+382)*S,1118*S],fill=T['greenHover'])

def F(n,s,ax=None):
    f=ImageFont.truetype(str(ROOT/'scripts/studio/.fonts-cache'/n),s)
    if ax:
        try: f.set_variation_by_axes(ax)
        except: pass
    return f
serif168=F('serif-var.ttf',168*S,[550]); serif64=F('serif-var.ttf',64*S,[550])
serif46=F('serif-var.ttf',46*S,[550])
serif56=F('serif-var.ttf',56*S,[550]); serif120=F('serif-var.ttf',120*S,[550])
sans21=F('sans-400.ttf',21*S); sans19b=F('sans-600.ttf',19*S)
sans145=F('sans-400.ttf',int(14.5*S)); sans19n=F('sans-600.ttf',19*S)
mono135=F('mono-600.ttf',int(13.5*S)); mono13=F('mono-400.ttf',13*S); mono17=F('mono-600.ttf',17*S)
mono115=F('mono-600.ttf',int(11.5*S))
serif_ghost=F('serif-var.ttf',300*S,[550])

FIGSRC=Image.open('studio/assets/brand/founder-standing.png').convert('RGBA')
HEAD=Image.open('client/public/founder-headshot.jpg').convert('RGB')
LOGO_W=Image.open('client/public/logo-green-x-dark.png').convert('RGBA')
LOGO=Image.open('client/public/logo-green-x.png').convert('RGBA')

# ── THE BYLINE HEADSHOT (2026-08-22) ──────────────────────────────────────
# founder-headshot.jpg replaces founder-portrait.jpg on EVERY CTA and footer
# mark (Paul: "be sure to swap out my headshot for all CTA and footer
# images"). THE OLD CROP CONSTANTS DO NOT TRANSFER, which is the trap:
#   old founder-portrait  1200x2732 -> 1:1.620, skin rows 0.144..0.827
#   new founder-headshot  1536x2732 -> 1:1.779, skin rows 0.083..0.458
# The new frame is TALLER and the face sits in its TOP 46%, so the old 0.283
# fraction — measured against a shot whose face ran most of the frame — lands
# on his chest. HEAD_BOX is a square measured around the face instead:
# columns 139..1439, rows 88..1388, i.e. the head with a little air.
HEAD_BOX = (0.0905, 0.0322, 0.9368, 0.5081)

def head_square(src, px):
    """The byline mark: a measured square around the face, then resized."""
    w, h = src.size
    b = (int(HEAD_BOX[0]*w), int(HEAD_BOX[1]*h), int(HEAD_BOX[2]*w), int(HEAD_BOX[3]*h))
    return src.crop(b).resize((px, px), Image.LANCZOS)

def lingrad(w,h,stops,ang):
    ar=math.radians(ang); dx,dy=math.sin(ar),-math.cos(ar)
    yy,xx=np.mgrid[0:h,0:w].astype(float)
    t=xx*dx+yy*dy; t=(t-t.min())/max(t.max()-t.min(),1e-6)
    img=np.zeros((h,w,3)); ps=[p for p,_ in stops]; cs=[np.array(c,float) for _,c in stops]
    for i in range(len(stops)-1):
        m=(t>=ps[i])&(t<=ps[i+1]); lt=(t[m]-ps[i])/max(ps[i+1]-ps[i],1e-6)
        img[m]=cs[i]*(1-lt[:,None])+cs[i+1]*lt[:,None]
    img[t>ps[-1]]=cs[-1]
    return Image.fromarray(img.astype('uint8'))

def wrap(d,x,y,width,txt,font,lh,col,ls=0):
    words=txt.split(); lines=[];cur=[];curw=0
    for w in words:
        wl=d.textlength(w+' ',font=font)+ls*len(w)
        if curw+wl>width and cur: lines.append(cur);cur=[];curw=0
        cur.append(w);curw+=wl
    if cur: lines.append(cur)
    for ln in lines:
        cx=x
        for w in ln:
            if ls:
                for ch in w: d.text((cx,y),ch,font=font,fill=col); cx+=d.textlength(ch,font=font)+ls
                cx+=d.textlength(' ',font=font)
            else:
                d.text((cx,y),w,font=font,fill=col); cx+=d.textlength(w+' ',font=font)
        y+=lh
    return y

def base(bloom_at=None):
    """dark ground + gradient copy panel + optional bloom + orbit"""
    img=Image.new('RGB',(W,H),T['dark'])
    img.paste(lingrad(596*S,1232*S,[(0,T['dPlate']),(0.62,T['dark'])],170),(0,0))
    if bloom_at:
        yy,xx=np.mgrid[0:H,0:W].astype(float)
        dd=np.sqrt(((xx-bloom_at[0]*S)/(620*S))**2+((yy-bloom_at[1]*S)/(880*S))**2)
        a=np.where(dd<0.42,0.55-(dd/0.42)*0.33,np.where(dd<0.85,0.22*(1-(dd-0.42)/0.43),0))
        img=Image.fromarray((np.array(img,float)*(1-a[...,None])+np.array(T['green'],float)*a[...,None]).astype('uint8'))
    d=ImageDraw.Draw(img)
    d.line([596*S,0,596*S,1232*S],fill=T['dSeam'],width=S)
    d.ellipse([400*S,-180*S,1160*S,580*S],outline=T['dSeam'],width=S)
    for nx,ny in ((479,355),(1060,120)): d.rectangle([nx*S,ny*S,nx*S+7*S,ny*S+7*S],fill=T['mint'])
    return img,d

def plate(img,d,offset=True):
    if offset: d.rectangle([610*S,14*S,1030*S,1246*S],fill=T['greenBright'])
    d.rectangle([596*S,0,1016*S,1232*S],fill=T['green'])
    d.rectangle([612*S,16*S,1000*S,1216*S],outline=T['greenHover'],width=S)

def chrome(img,d,kicker,pnum=None,total=10,logo=True,light=False):
    sq=8*S; ky=58*S
    acc=T['green'] if light else T['mint']
    d.rectangle([64*S,ky+3*S,64*S+sq,ky+3*S+sq],fill=acc)
    cx=64*S+sq+12*S
    for ch in kicker.upper():
        d.text((cx,ky),ch,font=mono135,fill=acc); cx+=d.textlength(ch,font=mono135)+0.16*13.5*S
    if logo:
        lh_=26*S; lw=int(LOGO_W.size[0]*lh_/LOGO_W.size[1])
        lgx=LOGO_W.resize((lw,lh_),Image.LANCZOS); img.paste(lgx,(W-64*S-lw,52*S),lgx)
    if pnum:
        t=f'{pnum:02d} / {total}'
        tw=sum(d.textlength(c,font=mono115)+0.1*11.5*S for c in t)
        x=W-64*S-tw
        for ch in t: d.text((x,1160*S),ch,font=mono115,fill=T['dLegal']); x+=d.textlength(ch,font=mono115)+0.1*11.5*S

def foot(img,d,cta=True,light=False):
    y0=1232*S
    d.rectangle([0,y0,W,H],fill=T['bone'] if light else T['dark'])
    d.line([0,y0,W,y0],fill=T['hair'] if light else T['dSeam'],width=S)
    fs=54*S; cy=y0+(118*S-fs)//2; ring=fs+6*S
    d.ellipse([64*S-1,cy-3*S-1,64*S+ring+1,cy-3*S+ring+1],fill=T['dBtn'])
    d.ellipse([64*S,cy-3*S,64*S+ring,cy-3*S+ring],fill=T['white'])
    face=head_square(HEAD,fs)
    mask=Image.new('L',(fs,fs),0); ImageDraw.Draw(mask).ellipse([0,0,fs,fs],fill=255)
    img.paste(face,(64*S+3*S,cy),mask)
    tx=64*S+ring+16*S
    d.text((tx,cy+2*S),'Paul Baker',font=sans19n,fill=T['ink'] if light else T['dInk'])
    d.text((tx,cy+2*S+26*S),'Buy-side corporate development',font=sans145,fill=T['muted'] if light else T['dMut'])
    if cta:
        c=T['green'] if light else T['white']
        txt='smbx.ai'; tw=d.textlength(txt,font=mono17); aw,gap=24*S,10*S
        x=W-64*S-(tw+gap+aw)
        d.text((x,y0+(118*S-17*S)//2),txt,font=mono17,fill=c)
        ay=y0+118*S//2; x0=x+tw+gap
        d.line([x0,ay,x0+aw-6*S,ay],fill=c,width=2*S)
        d.polygon([(x0+aw,ay),(x0+aw-7*S,ay-4*S),(x0+aw-7*S,ay+4*S)],fill=c)

def figure(img,lift=1.16,h=930,x=515,y=302):
    fh=h*S; fw=int(FIGSRC.size[0]*fh/FIGSRC.size[1])
    f=FIGSRC.resize((fw,fh),Image.LANCZOS)
    r_,g_,b_,al_=f.split()
    rgb=ImageEnhance.Contrast(ImageEnhance.Brightness(Image.merge('RGB',(r_,g_,b_))).enhance(lift)).enhance(1.05)
    f=Image.merge('RGBA',(*rgb.split(),al_))
    img.paste(f,(x*S,y*S),f)


# THE LIGHT PAGES READ THE LIVE TOKENS TOO (2026-08-22). This dict was
# hard-coded Deal Green, so when house/tokens.ts was revalued to OXBLOOD the
# BOOKENDS moved and the BODY PAGES did not — a deck would have come out with
# an oxblood cover and green interiors, rendering fine and erroring nowhere.
# A palette lives in one place or it does not live anywhere.
L=dict(bone=T['bone'],ink=T['ink'],body=T['body'],muted=T['muted'],
hair=T['hair'],green=T['green'],tint=T['tint'],panel=T['panel'])

def light_page(p,n,total=10):
    img=Image.new('RGB',(W,H),L['bone']); d=ImageDraw.Draw(img)
    # ghost numeral at 5%
    gh=Image.new('RGB',(W,H),L['bone']); gd=ImageDraw.Draw(gh)
    gd.text((W-300*S,150*S),f'{n:02d}',font=serif_ghost,fill=L['ink'])
    img=Image.blend(img,gh,0.05); d=ImageDraw.Draw(img)
    # mono kicker + rule at the head
    tag=(p.get('tag') or deck['kicker']).upper()
    cx=88*S
    for ch in tag:
        d.text((cx,120*S),ch,font=mono135,fill=L['green']); cx+=d.textlength(ch,font=mono135)+0.12*13.5*S
    d.line([88*S,158*S,W-88*S,158*S],fill=L['hair'],width=S)
    y=200*S
    if p['kind']=='numeral':
        d.text((88*S,y),p['numeral'],font=serif120,fill=L['ink'])
        d.rectangle([88*S,y+150*S,160*S,y+155*S],fill=L['green'])
        y=y+200*S
    y=wrap(d,88*S,y,760*S,p['head'],serif46,int(46*1.14*S),L['ink'])
    if p['kind']!='numeral':
        d.rectangle([88*S,y+26*S,160*S,y+31*S],fill=L['green']); y=y+62*S
    else: y=y+34*S
    if p['kind']=='diagram':
        bars=p['bars']; mx=max(b['h'] for b in bars)
        bw=150*S; gapx=90*S; x0=88*S; base_y=y+430*S
        for j,b in enumerate(bars):
            bh=int(b['h']/mx*380*S); bx=x0+j*(bw+gapx)
            col=L['ink'] if b['style']=='ink' else L['green']
            d.rectangle([bx,base_y-bh,bx+bw,base_y],fill=col)
            lw_=d.textlength(b['label'],font=sans19b)
            d.text((bx+(bw-lw_)/2,base_y-bh-42*S),b['label'],font=sans19b,fill=L['ink'])
            wrap(d,bx-10*S,base_y+20*S,bw+20*S,b['sub'],mono115,int(11.5*1.5*S),L['muted'])
        if p.get('connector'):
            cwid=d.textlength(p['connector'],font=mono135)
            d.text((x0+bw+(gapx-cwid)/2,base_y-190*S),p['connector'],font=mono135,fill=L['green'])
        y=base_y+90*S
    y=wrap(d,88*S,y,720*S,p['body'],sans21,int(21*1.62*S),L['body'])
    if p.get('source'):
        wrap(d,88*S,1168*S,780*S,'Source: '+p['source'],mono13,int(13*1.55*S),L['muted'])
    # flat dark band strip at the foot
    d.rectangle([0,1266*S,W,H],fill=T['dark'])
    lh_=22*S; lw=int(LOGO_W.size[0]*lh_/LOGO_W.size[1])
    lg=LOGO_W.resize((lw,lh_),Image.LANCZOS); img.paste(lg,(88*S,1266*S+(84*S-lh_)//2),lg)
    t=f'{n:02d} / {total}'
    tw=sum(d.textlength(c,font=mono115)+0.1*11.5*S for c in t)
    x=W-88*S-tw
    for ch in t: d.text((x,1266*S+(84*S-11.5*S)//2),ch,font=mono115,fill=T['dMut']); x+=d.textlength(ch,font=mono115)+0.1*11.5*S
    return img

os.makedirs(OUT,exist_ok=True)

def centre(d,y,txt,font,col,width,lh,ls=0):
    words=txt.split(); lines=[];cur=[];curw=0
    for w in words:
        wl=d.textlength(w+' ',font=font)+ls*len(w)
        if curw+wl>width and cur: lines.append(cur);cur=[];curw=0
        cur.append(w);curw+=wl
    if cur: lines.append(cur)
    for ln in lines:
        tw_=sum(d.textlength(w+' ',font=font)+ls*len(w) for w in ln)-d.textlength(' ',font=font)
        cx=(W-tw_)/2
        for w in ln:
            if ls:
                for ch in w: d.text((cx,y),ch,font=font,fill=col); cx+=d.textlength(ch,font=font)+ls
                cx+=d.textlength(' ',font=font)
            else:
                d.text((cx,y),w,font=font,fill=col); cx+=d.textlength(w+' ',font=font)
        y+=lh
    return y


def build_cover(light):
    if light:
        img,d=portal_base(); portal_steps(img,d)
        NUM_X,LAB_X,LAB_W=682,688,240
        INKC,SUBC,ACC=T['ink'],T['body'],T['green']
        LIFT=1.08; FIGX=500
    else:
        img,d=base(bloom_at=(655,620)); plate(img,d)
        NUM_X,LAB_X,LAB_W=644,754,230
        INKC,SUBC,ACC=T['dInk'],T['dSub'],T['mint']
        LIFT=1.16; FIGX=515
    d.text((NUM_X*S,70*S),deck['cover'].get('numeral','')+deck['cover'].get('unit',''),font=serif168,fill=T['white'])
    d.rectangle([LAB_X*S,252*S,(LAB_X+52)*S,256*S],fill=T['mint'])
    wrap(d,LAB_X*S,278*S,LAB_W*S,str(deck['cover'].get('numeralLabel','')).replace(chr(10),' ').upper(),
         mono135,int(13.5*1.7*S),T['tint'],ls=0.12*13.5*S)
    chrome(img,d,deck['kicker'],logo=False,light=light)
    _LW=228; _lg=LOGO if light else LOGO_W
    _lg=_lg.resize((_LW*S,int(_lg.size[1]*_LW*S/_lg.size[0])),Image.LANCZOS)
    img.paste(_lg,(64*S,1232*S-64*S-_lg.size[1]),_lg); d=ImageDraw.Draw(img)
    hook=deck['cover']['hook']; parts=hook.split('. ')
    if len(parts)>1:
        y=wrap(d,64*S,132*S,420*S,parts[0]+'.',serif56,int(56*1.05*S),INKC)
        y=wrap(d,64*S,y+6*S,420*S,'. '.join(parts[1:]),serif56,int(56*1.05*S),ACC)
    else:
        y=wrap(d,64*S,132*S,420*S,hook,serif56,int(56*1.05*S),INKC)
    d.rectangle([64*S,y+34*S,136*S,y+39*S],fill=ACC)
    wrap(d,64*S,y+74*S,410*S,deck['cover'].get('sub',''),sans21,int(21*1.5*S),SUBC)
    figure(img,LIFT,x=FIGX); d=ImageDraw.Draw(img)
    foot(img,d,light=light)
    return img

def build_closer(light):
    c=deck['closer']
    if light:
        img,d=portal_base(); portal_steps(img,d)
        img=Image.new('RGB',(W,H),T['bone']); d=ImageDraw.Draw(img)
        img.paste(lingrad(W,H,[(0,T['bone']),(0.55,T['boneAlt']),(1,T['panel'])],170),(0,0))
        d=ImageDraw.Draw(img)
        INKC,SUBC,MUTC=T['ink'],T['body'],T['muted']
        BARBG,BARFG,SEAMC=T['ink'],T['bone'],T['hair']
    else:
        img,d=base(bloom_at=(540,880))
        INKC,SUBC,MUTC=T['dInk'],T['dSub'],T['dMut']
        BARBG,BARFG,SEAMC=T['white'],T['dark'],T['dSeam']
    chrome(img,d,c['tag'],logo=False,light=light)
    # FRAME C — phi portrait, whole photo, green offset plate + handles
    fw_=330*S; fh_=int(fw_*1.618)
    port=HEAD.resize((fw_,fh_),Image.LANCZOS)
    px_=(W-fw_)//2; py_=186*S; off=14*S
    d.rectangle([px_+off,py_+off,px_+fw_+off,py_+fh_+off],fill=T['green'])
    img.paste(port,(px_,py_)); d=ImageDraw.Draw(img)
    d.rectangle([px_,py_,px_+fw_,py_+fh_],outline=SEAMC,width=S)
    hsz=8*S
    for hxp in (px_-hsz//2,px_+fw_-hsz//2):
        for hyp in (py_-hsz//2,py_+fh_-hsz//2):
            d.rectangle([hxp,hyp,hxp+hsz,hyp+hsz],fill=INKC)
    y=py_+fh_+off+64*S
    y=centre(d,y,c['head'],serif46,INKC,820*S,int(46*1.14*S))
    d.rectangle([(W-72*S)//2,y+30*S,(W+72*S)//2,y+35*S],fill=T['green'] if light else T['mint'])
    q=c.get('question') or 'For those who have had a deal die in exclusivity: which finding killed it — and could you have seen it at day four?'
    y=centre(d,y+70*S,q,sans21,SUBC,700*S,int(21*1.62*S))
    bw_,bh_=430*S,74*S; bx_=(W-bw_)//2; by_=y+70*S
    d.rectangle([bx_,by_,bx_+bw_,by_+bh_],fill=BARBG)
    lab=c.get('cta') or 'READ THE FULL ASSESSMENT'
    lw_=sum(d.textlength(ch,font=mono17)+0.08*17*S for ch in lab)
    tx_=bx_+(bw_-lw_-34*S)/2; ty_=by_+(bh_-17*S)//2-2*S
    for ch in lab: d.text((tx_,ty_),ch,font=mono17,fill=BARFG); tx_+=d.textlength(ch,font=mono17)+0.08*17*S
    ay_=by_+bh_//2; ax_=tx_+14*S
    d.line([ax_,ay_,ax_+18*S,ay_],fill=T['green'],width=3*S)
    d.polygon([(ax_+24*S,ay_),(ax_+16*S,ay_-6*S),(ax_+16*S,ay_+6*S)],fill=T['green'])
    centre(d,by_+bh_+34*S,'smbx.ai',mono135,MUTC,600*S,int(13.5*1.6*S),ls=0.16*13.5*S)
    _LW=228; _lg=(LOGO if light else LOGO_W)
    _lg=_lg.resize((_LW*S,int(_lg.size[1]*_LW*S/_lg.size[0])),Image.LANCZOS)
    img.paste(_lg,(64*S,H-64*S-_lg.size[1]),_lg)
    return img

GROUNDS=['monolith-dark','portal-light'] if GROUND=='both' else [GROUND]
os.makedirs(OUT,exist_ok=True)
for g in GROUNDS:
    light = g=='portal-light'
    pages=[build_cover(light)]
    for i,p in enumerate(deck['pages']):
        pages.append(light_page(p,i+2,total=len(deck['pages'])+2))
    pages.append(build_closer(light))
    sfx = '' if len(GROUNDS)==1 and GROUND!='both' else '-'+g
    for i,im in enumerate(pages):
        im.save(f"{OUT}/{deck['slug']}{sfx}-p{i+1:02d}.jpg",quality=92,optimize=True)
    pages[0].save(f"{OUT}/{deck['slug']}{sfx}.pdf",save_all=True,
                  append_images=[q.convert('RGB') for q in pages[1:]],resolution=144)
    print(f"  {g}: {len(pages)} pages -> {OUT}/{deck['slug']}{sfx}.pdf")
if deck.get('caption'):
    open(f"{OUT}/{deck['slug']}-caption.txt",'w').write(deck['caption'].strip()+chr(10))
