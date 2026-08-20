#!/usr/bin/env python3
"""
templates-card.py — TEMPLATES.md as a visual reference card deck.

  python3 scripts/studio/templates-card.py [--out <dir>]

Paul, 2026-08-19: a multi-card PDF he can look at instead of reading the
register. Six Letter-portrait pages of cards; every card carries a REAL
THUMBNAIL cropped from filed collateral, so the reference cannot describe
something the builders do not actually produce.

THUMBNAILS ARE REAL OR THE PLATE IS EMPTY AND SAYS SO. Where no render
survives on disk the card says NO RENDER ON DISK in mono — it never draws a
mock-up, because a drawing on a page of real renders reads as a real render.
`trade` is the case: the teardown collateral folders kept only their
captions, and figure-deck.py has no trade layout (numeral, diagram, and
everything else falls through to statement), so that page comes back only
from build-deck.mts on the Mac.

Sources it reads, all filed collateral:
  dead-deal-economics/2026-08-20  figure carousel, monolith bookends
  hvac-2026-read/2026-08-27       build-deck.mts carousel, page kinds
  corp-dev-cost-sheet/2026-09-10  build-deck.mts carousel
  day-four-questions/2026-08-18   one-pager figure card, C treatment
  day-four-questions/2026-08-19   the two grounds
  smbx-corpdev-offering/2026-08-19 offer docs + the landscape Featured doc
  client/public/reports/*.jpg     OG cards

Not part of rebuild-all — a reference sheet, regenerated when the register
changes.
"""
import sys, pathlib, math

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
args = sys.argv[1:]
OUT = pathlib.Path(args[args.index('--out')+1]).resolve() if '--out' in args \
    else ROOT/'studio/collateral/_reference'

CACHE = HERE/'.fonts-cache'
from PIL import Image, ImageDraw, ImageFont

def F(n,s,ax=None):
    f=ImageFont.truetype(str(CACHE/n),s)
    if ax:
        try: f.set_variation_by_axes(ax)
        except Exception: pass
    return f

S=2; W,H=1275*S,1650*S
M=78*S                      # page margin
T=dict(white=(255,255,255),boneAlt=(249,247,241),panel=(243,240,233),
       ink=(22,24,26),body=(74,79,84),muted=(124,129,135),hair=(228,223,211),
       chipB=(216,211,198),green=(10,122,88),greenHover=(8,99,72),
       greenBright=(15,169,124),tint=(223,245,236),mint=(168,240,206),
       dark=(24,24,24))

serif64=F('serif-var.ttf',64*S,[550]); serif34=F('serif-var.ttf',34*S,[550])
serif26=F('serif-var.ttf',26*S,[550])
sans20b=F('sans-600.ttf',20*S); sans15=F('sans-400.ttf',15*S)
sans14=F('sans-400.ttf',14*S);  sans22=F('sans-400.ttf',22*S)
sans13=F('sans-400.ttf',13*S)
mono13b=F('mono-600.ttf',13*S); mono12=F('mono-400.ttf',12*S)
mono11=F('mono-400.ttf',11*S);  mono15b=F('mono-600.ttf',15*S)
mono11b=F('mono-600.ttf',11*S)

LOGO=Image.open(ROOT/'client/public/logo-green-x.png').convert('RGBA')
C=ROOT/'studio/markets/home-services/collateral'
O=ROOT/'studio/collateral/smbx-corpdev-offering/2026-08-19'

def img(p):
    return Image.open(p).convert('RGB')

def tracked(d,pos,txt,font,fill,ls):
    x,y=pos
    for ch in txt:
        d.text((x,y),ch,font=font,fill=fill); x+=d.textlength(ch,font=font)+ls
    return x

def wrap(d,x,y,width,txt,font,lh,col):
    lines=[[]]; cw=0
    for w0 in str(txt).split(' '):
        wl=d.textlength(w0+' ',font=font)
        if cw+wl>width and lines[-1]: lines.append([]); cw=0
        lines[-1].append(w0); cw+=wl
    for ln in lines:
        d.text((x,y),' '.join(ln),font=font,fill=col); y+=lh
    return y

def page():
    im=Image.new('RGB',(W,H),T['boneAlt']); return im,ImageDraw.Draw(im)

def header(im,d,n,total,kick,head):
    t='TEMPLATES — THE VISUAL REGISTER'
    tw=sum(d.textlength(c,font=mono11b)+0.18*11*S for c in t)
    tracked(d,(W-M-tw,M-14*S),t,mono11b,T['muted'],0.18*11*S)
    d.line([M,M+18*S,W-M,M+18*S],fill=T['hair'],width=S)
    y=M+44*S
    d.rectangle([M,y+4*S,M+9*S,y+13*S],fill=T['green'])
    tracked(d,(M+20*S,y),kick,mono15b,T['green'],0.14*15*S)
    y+=32*S
    d.text((M,y),head,font=serif34,fill=T['ink'])
    y+=int(34*1.15*S)
    d.rectangle([M,y+8*S,M+64*S,y+8*S+5*S],fill=T['green'])
    return y+40*S

def foot(im,d,n,total):
    y0=H-M+6*S
    d.line([M,y0,W-M,y0],fill=T['hair'],width=S)
    lh_=18*S; lw=int(LOGO.size[0]*lh_/LOGO.size[1])
    lg=LOGO.resize((lw,lh_),Image.LANCZOS); im.paste(lg,(M,y0+20*S),lg)
    t=f'{n} / {total}'
    tw=sum(d.textlength(c,font=mono11b)+0.08*11*S for c in t)
    tracked(d,(W-M-tw,y0+22*S),t,mono11b,T['green'],0.08*11*S)

def thumb(im,d,box,src,crop=None,label=None):
    """Paste a render into box=(x,y,w,h) CONTAINED — the whole page visible,
    centred on a panel letterbox, hairline around the IMAGE not the box.
    Cover-fit was the first cut and it beheaded every 4:5 thumbnail: a
    reference that crops the thing it is identifying is not a reference."""
    x,y,w,h=box
    d.rectangle([x,y,x+w,y+h],fill=T['panel'])
    if src is None:
        d.rectangle([x,y,x+w,y+h],outline=T['chipB'],width=S)
        if label:
            tw=sum(d.textlength(c,font=mono11b)+0.12*11*S for c in label)
            tracked(d,(x+(w-tw)//2,y+h//2-6*S),label,mono11b,T['muted'],0.12*11*S)
        return
    p=img(src)
    if crop: p=p.crop(crop)
    sc=min(w/p.size[0],h/p.size[1])
    nw,nh=max(1,int(p.size[0]*sc)),max(1,int(p.size[1]*sc))
    p=p.resize((nw,nh),Image.LANCZOS)
    px,py=x+(w-nw)//2,y+(h-nh)//2
    im.paste(p,(px,py))
    d.rectangle([px,py,px+nw,py+nh],outline=T['chipB'],width=S)

def card(im,d,box,say,title,line,law,src,crop=None,tall=True,nolabel=None):
    """one reference card: white plate, thumbnail, the NAME, one line, law."""
    x,y,w,h=box
    d.rectangle([x,y,x+w,y+h],fill=T['white'],outline=T['hair'],width=S)
    pad=16*S
    th=int(h*0.60) if tall else int(h*0.44)
    thumb(im,d,(x+pad,y+pad,w-2*pad,th),src,crop,nolabel)
    ty=y+pad+th+16*S
    # the token you say
    tw=sum(d.textlength(c,font=mono13b)+0.1*13*S for c in say)
    d.rectangle([x+pad,ty-3*S,x+pad+tw+16*S,ty+20*S],fill=T['tint'])
    tracked(d,(x+pad+8*S,ty),say,mono13b,T['green'],0.1*13*S)
    ty+=30*S
    d.text((x+pad,ty),title,font=sans20b,fill=T['ink']); ty+=28*S
    wrap(d,x+pad,ty,w-2*pad,line,sans14,int(14*1.42*S),T['body'])
    lw_=sum(d.textlength(c,font=mono11)+0.06*11*S for c in law)
    tracked(d,(x+pad,y+h-pad-12*S),law,mono11,T['muted'],0.06*11*S)

def grid(im,d,y0,cols,rows,items,gap=22*S,ch=None):
    cw=(W-2*M-(cols-1)*gap)//cols
    ch=ch or (H-M-40*S-y0-(rows-1)*gap)//rows
    for i,it in enumerate(items):
        r,c=divmod(i,cols)
        card(im,d,(M+c*(cw+gap),y0+r*(ch+gap),cw,ch),**it)
    return y0+rows*(ch+gap)

pages=[]

# ── 1 · COVER ──────────────────────────────────────────────────────────
im,d=page()
im.paste(Image.new('RGB',(W,340*S),T['panel']),(0,0))
d=ImageDraw.Draw(im)
d.rectangle([0,0,W,340*S],outline=None)
d.rectangle([M,M,M+9*S,M+9*S],fill=T['green'])
tracked(d,(M+22*S,M-4*S),'HOUSE COLLATERAL',mono15b,T['green'],0.14*15*S)
d.text((M,M+56*S),'The templates,',font=serif64,fill=T['ink'])
d.text((M,M+56*S+int(64*1.06*S)),'named.',font=serif64,fill=T['green'])
d.rectangle([M,340*S-58*S,M+84*S,340*S-52*S],fill=T['green'])
y=400*S
y=wrap(d,M,y,700*S,'Four builders, two grounds, three layouts, four page kinds — plus the devices and the one-offs. Every thumbnail on the following pages is a real render, cropped from filed collateral.',sans22,int(22*1.45*S),T['body'])
y+=24*S
wrap(d,M,y,700*S,'This deck NAMES things. FORMATS.md owns the slot tables, DESIGN.md owns the look, TEMPLATES.md is the written index. If they disagree with a card here, they win.',sans15,int(15*1.5*S),T['muted'])
# contents
cy=y+120*S
tracked(d,(M,cy),'CONTENTS',mono13b,T['muted'],0.14*13*S); cy+=30*S
for n,t in [('2','The four builders'),('3','Grounds and layouts'),
            ('4','Page kinds — the carousel’s four'),('5','The named devices'),
            ('6','One-offs, named on purpose')]:
    d.line([M,cy-6*S,W-M,cy-6*S],fill=T['hair'],width=S)
    tracked(d,(M,cy+4*S),n,mono13b,T['green'],0.08*13*S)
    d.text((M+40*S,cy),t,font=sans20b,fill=T['ink']); cy+=44*S
d.line([M,cy-6*S,W-M,cy-6*S],fill=T['hair'],width=S)
# the contact strip — the whole house in one row, so the cover shows
# rather than only promises
sy=cy+70*S
tracked(d,(M,sy),'AT A GLANCE',mono13b,T['muted'],0.14*13*S)
sy+=30*S
strip=[(C/'hvac-2026-read/2026-08-27/hvac-2026-read-p01.jpg','CAROUSEL'),
       (C/'day-four-questions/2026-08-18/day-four-questions-dark-C.png','ONE-PAGER'),
       (C/'day-four-questions/2026-08-19/day-four-questions-monolith-dark.png','MONOLITH'),
       (C/'day-four-questions/2026-08-19/day-four-questions-portal-light.png','PORTAL'),
       (O/'smbx-corpdev-offering-p01.jpg','OFFER DOC'),
       (ROOT/'client/public/reports/home-services-cover.jpg','REPORT')]
gapx=14*S; tw_=(W-2*M-(len(strip)-1)*gapx)//len(strip); th_=int(tw_*1.25)
for i,(src,lab) in enumerate(strip):
    x=M+i*(tw_+gapx)
    thumb(im,d,(x,sy,tw_,th_),src)
    tracked(d,(x,sy+th_+12*S),lab,mono11b,T['muted'],0.1*11*S)
lw=180*S; lg=LOGO.resize((lw,int(LOGO.size[1]*lw/LOGO.size[0])),Image.LANCZOS)
im.paste(lg,(M,H-M-lg.size[1]),lg)
d=ImageDraw.Draw(im)
from datetime import date
tt=date.today().strftime('%-d %B %Y').upper()
tw=sum(d.textlength(c,font=mono11b)+0.08*11*S for c in tt)
tracked(d,(W-M-tw,H-M-14*S),tt,mono11b,T['muted'],0.08*11*S)
pages.append(im)

# ── 2 · THE BUILDERS ───────────────────────────────────────────────────
im,d=page()
y=header(im,d,2,6,'SECTION 01','The four builders')
grid(im,d,y,2,2,[
 dict(say='build-deck.mts', title='Carousel', src=C/'hvac-2026-read/2026-08-27/hvac-2026-read-p01.jpg',
      line='Multi-page LinkedIn PDF at 1080×1350, plus page JPGs and one caption. Cover and closer are auto-added bookends — never author either.',
      law='FORMATS.md §1'),
 dict(say='build-onepager.mts', title='One-pager', src=C/'day-four-questions/2026-08-18/day-four-questions-dark-C.png',
      line='Single-image post, same canvas. Renders dark and light variants by default. The figure layout is the default since 2026-08-18.',
      law='FORMATS.md §2'),
 dict(say='build-report.mts', title='Report', src=ROOT/'client/public/reports/home-services-cover.jpg',
      line='Long-form Letter PDF from plain markdown. Keeps the BANNER grammar — cover hero band and accent bands. A report is not a figure card.',
      law='FORMATS.md §3'),
 dict(say='build-og-card.mts', title='OG card', src=ROOT/'client/public/reports/fire-safety-cover.jpg',
      line='The 1200×630 link-preview a shared report URL renders as. Same cover config as the report it belongs to.',
      law='shared/reports.ts'),
])
foot(im,d,2,6); pages.append(im)

# ── 3 · GROUNDS AND LAYOUTS ────────────────────────────────────────────
im,d=page()
y=header(im,d,3,6,'SECTION 02','Grounds and layouts')
y=grid(im,d,y,2,1,[
 dict(say='monolith-dark', title='The green monolith', src=C/'day-four-questions/2026-08-19/day-four-questions-monolith-dark.png',
      line='Deal Green monolith on the dark band, greenBright offset rim plate, aimed bloom, gradient copy panel.',
      law='DESIGN.md §6.2'),
 dict(say='portal-light', title='The stepped portal', src=C/'day-four-questions/2026-08-19/day-four-questions-portal-light.png',
      line='Four receding green portal steps on paper, gradient copy panel, dot field. A different mechanic, not a recolour.',
      law='DESIGN.md §6.2'),
],ch=520*S)
d.rectangle([M,y-4*S,W-M,y-4*S+3*S],fill=T['hair'])
ny=y+22*S
tracked(d,(M,ny),'THE BOOKEND LAW',mono13b,T['green'],0.14*13*S)
ny=wrap(d,M,ny+26*S,W-2*M,'A ground is worn by the COVER and the CLOSER only. Every page between is the house light grammar. A first cut wore the monolith on all ten pages — the monolith is a cover treatment, not a page style.',sans15,int(15*1.5*S),T['body'])
grid(im,d,ny+26*S,3,1,[
 dict(say='figure', title='Figure — the default', src=C/'day-four-questions/2026-08-18/day-four-questions-dark-C.png',
      line='Standing cutout at 834px = 1350 / 1.618, floating in flow so copy wraps the silhouette.',
      law='FORMATS.md §2.0', tall=False),
 dict(say='split', title='Split — still live', src=None, nolabel='NO CURRENT RENDER',
      line='The older copy-column plus full-bleed photo card. Set layout: \'split\' explicitly in new specs.',
      law='FORMATS.md §2.0', tall=False),
 dict(say='text card', title='No photograph', src=None, nolabel='NO CURRENT RENDER',
      line='Omit image on a split spec: full-width copy, no picture.',
      law='FORMATS.md §2.0', tall=False),
])
foot(im,d,3,6); pages.append(im)

# ── 4 · PAGE KINDS ─────────────────────────────────────────────────────
im,d=page()
y=header(im,d,4,6,'SECTION 03','Page kinds — there are four')
grid(im,d,y,2,2,[
 dict(say="kind:'numeral'", title='One number, one idea', src=C/'hvac-2026-read/2026-08-27/hvac-2026-read-p03.jpg',
      line='Giant figure, green bar, serif sub-headline, body. Ceiling: $14.06B runs off the page at 290px — rounding is not the escape, a rounded figure is a different figure.',
      law='FORMATS.md §1'),
 dict(say="kind:'statement'", title='A claim, no figure', src=C/'hvac-2026-read/2026-08-27/hvac-2026-read-p04.jpg',
      line='Mono eyebrow with a green square, serif headline, green rule, body. tagColor: \'brass\' marks a trap — the word survives, the hue is green either way.',
      law='FORMATS.md §1'),
 dict(say="kind:'diagram'", title='A comparison', src=C/'dead-deal-economics/2026-08-20/dead-deal-economics-p05.jpg',
      line='Two bars and a connector. Bar heights must hold the ratio of the numbers, and a label over six glyphs clips silently.',
      law='FORMATS.md §1'),
 dict(say="kind:'trade'", title='A sub-vertical with art', src=None, nolabel='NO RENDER ON DISK — REBUILD ON THE MAC',
      line='Copy left, framed image panel right. THE ONLY body page with an image slot — an image: key on the other three is silently dropped.',
      law='FORMATS.md §1'),
])
foot(im,d,4,6); pages.append(im)

# ── 5 · THE NAMED DEVICES ──────────────────────────────────────────────
im,d=page()
y=header(im,d,5,6,'SECTION 04','The named devices')
dd=C/'dead-deal-economics/2026-08-20'
grid(im,d,y,3,2,[
 dict(say='Frame C', title='The golden rectangle', src=dd/'dead-deal-economics-p10.jpg', crop=(620,240,1580,1560),
      line='A GOLDEN RECTANGLE with corner handles and a 14px green offset plate. founder-portrait.jpg is 1:1.620 against phi at 1.618 — a square frame would discard 38%, all of it below the chin.',
      law='FORMATS.md §2.2'),
 dict(say='the bloom', title='Aimed, not ambient', src=C/'day-four-questions/2026-08-18/day-four-questions-dark-C.png', crop=(980,480,2160,2400),
      line='The dark ground’s green radial, centred on the torso, with a renderer-side 1.16/1.05 lift. Sanctioned and scoped; the boardroom texture stays retired.',
      law='DESIGN.md §6.2'),
 dict(say='corner handles', title='The house gesture', src=dd/'dead-deal-economics-p10.jpg', crop=(630,250,1120,600),
      line='8px ink squares at −4px. Replaced the curved band crests; radius stays 0 everywhere else.',
      law='DESIGN.md §2'),
 dict(say='the ghost numeral', title='Builder-drawn', src=dd/'dead-deal-economics-p05.jpg', crop=(1400,380,2160,1000),
      line='The oversized page number behind the copy, taken from page order. Never put a page number in copy.',
      law='FORMATS.md §1'),
 dict(say='the proof strip', title='Hairline stat rows', src=O/'smbx-corpdev-offering-p01.jpg', crop=(90,1640,1120,2300),
      line='Up to three hairline cards at the foot of a cover’s copy column — the report cover’s stat band, reused.',
      law='FORMATS.md §1'),
 dict(say='the foot disc', title='The byline mark', src=O/'smbx-corpdev-offering-p01.jpg', crop=(90,2440,1100,2680),
      line='The small round headshot, cropped at 0.283 — measured crown 273, eyes 664, chin 1257. At 0.06 the chin sat at 99% of the circle.',
      law='FORMATS.md §2.2'),
])
foot(im,d,5,6); pages.append(im)

# ── 6 · ONE-OFFS ───────────────────────────────────────────────────────
im,d=page()
y=header(im,d,6,6,'SECTION 05','One-offs, named on purpose')
y=wrap(d,M,y-14*S,W-2*M,'Built for a specific surface and deliberately outside the system — none of these is in rebuild-all.sh. The .py renderers read the same specs and the same live tokens; where a .mts builder covers the job, it is the builder of record.',sans15,int(15*1.5*S),T['muted'])
grid(im,d,y+26*S,3,2,[
 dict(say='offer-docs.py', title='The offer documents', src=O/'smbx-corpdev-offering-p01.jpg',
      line='Two 4:5 documents: no-pricing 5pp, postable; pricing 7pp, the email-gated brochure. Claude Design build.',
      law='design_handoff_smbx_offer_docs/'),
 dict(say='featured-doc.py', title='The Featured doc', src=O/'smbx-corpdev-offering-featured-p01.jpg',
      line='The same offer, 5pp landscape at 1200×630. LinkedIn thumbnails page one at ~1.91:1 and beheads a 4:5 cover.',
      law='studio/TEMPLATES.md §6'),
 dict(say='featured-thumb.py', title='The Featured thumbnail', src=O/'smbx-featured-thumbnail.png',
      line='That landscape page one as a standalone image, for anywhere a single image serves.',
      law='studio/TEMPLATES.md §6'),
 dict(say='figure-deck.py', title='The figure carousel', src=dd/'dead-deal-economics-p01.jpg',
      line='A carousel whose bookends wear a ground, until the deck-cover half lands in house/deck.ts.',
      law='FIGURE_COVER_WORK_ORDER.md'),
 dict(say='figure-fallback.py', title='The figure fallback', src=C/'day-four-questions/2026-08-18/day-four-questions-dark.png',
      line='The one-pager figure layout with no Chromium. A fallback — never a reason to skip the real builder on a machine that has one.',
      law='FORMATS.md §2.0'),
 dict(say='templates-card.py', title='This deck', src=None, nolabel='YOU ARE HERE',
      line='TEMPLATES.md rendered as cards. Regenerate it when the register changes.',
      law='studio/TEMPLATES.md'),
])
foot(im,d,6,6); pages.append(im)

OUT.mkdir(parents=True,exist_ok=True)
for i,p in enumerate(pages):
    p.save(OUT/f'smbx-templates-reference-p{i+1:02d}.jpg',quality=92,optimize=True)
pages[0].save(OUT/'smbx-templates-reference.pdf',save_all=True,
              append_images=pages[1:],resolution=150)
print(f'  {len(pages)} pages -> {OUT}/smbx-templates-reference.pdf')
