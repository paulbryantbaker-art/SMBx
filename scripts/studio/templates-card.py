#!/usr/bin/env python3
"""
templates-card.py — TEMPLATES.md as a visual reference card deck.

  python3 scripts/studio/templates-card.py [--out <dir>]

Paul, 2026-08-20: five templates he picks from, and for each one the parts
that go with it — *"as long as you understand what content pages go with each
and which CTA pages goes with each, CC just needs to know which I will pick
from."* So every family page is laid out COVER · CONTENT · CTA, in that
order, because that is the question being answered.

Six Letter-portrait pages: a cover with the five at a glance, then one page
per family. Supersedes the 2026-08-19 cut, which sorted by BUILDER and
carried a one-offs section — Paul removed the one-offs and folded the offer
document into Portal ("offer doc is the same as portal, content may vary
slightly based on need").

THUMBNAILS ARE REAL OR THE PLATE IS EMPTY AND SAYS SO. It never draws a
mock-up: on a page of real renders a drawing reads as a render. Two plates
are empty on purpose — `trade` (the teardown folders kept only their
captions, and figure-deck.py has no trade layout) and the report body (no
report render survives on disk; the OG card shown is real but is the
link-preview, not a page).

Not part of rebuild-all — regenerate when the register changes.
"""
import sys, pathlib
from datetime import date

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
M=78*S
T=dict(white=(255,255,255),boneAlt=(249,247,241),panel=(243,240,233),
       ink=(22,24,26),body=(74,79,84),muted=(124,129,135),hair=(228,223,211),
       chipB=(216,211,198),green=(10,122,88),greenHover=(8,99,72),
       greenBright=(15,169,124),tint=(223,245,236),mint=(168,240,206))

serif64=F('serif-var.ttf',64*S,[550]); serif34=F('serif-var.ttf',34*S,[550])
sans20b=F('sans-600.ttf',20*S); sans16b=F('sans-600.ttf',16*S)
sans15=F('sans-400.ttf',15*S);  sans14=F('sans-400.ttf',14*S)
sans22=F('sans-400.ttf',22*S)
mono13b=F('mono-600.ttf',13*S); mono11=F('mono-400.ttf',11*S)
mono15b=F('mono-600.ttf',15*S); mono11b=F('mono-600.ttf',11*S)
mono12b=F('mono-600.ttf',12*S)

LOGO=Image.open(ROOT/'client/public/logo-green-x.png').convert('RGBA')
C=ROOT/'studio/markets/home-services/collateral'
O=ROOT/'studio/collateral/smbx-corpdev-offering/2026-08-19'
HV=C/'hvac-2026-read/2026-08-27'; DD=C/'dead-deal-economics/2026-08-20'
D4=C/'day-four-questions'

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

def header(d,kick,head,sub=None):
    t='TEMPLATES — THE VISUAL REGISTER'
    tw=sum(d.textlength(c,font=mono11b)+0.18*11*S for c in t)
    tracked(d,(W-M-tw,M-14*S),t,mono11b,T['muted'],0.18*11*S)
    d.line([M,M+18*S,W-M,M+18*S],fill=T['hair'],width=S)
    y=M+44*S
    d.rectangle([M,y+4*S,M+9*S,y+13*S],fill=T['green'])
    tracked(d,(M+20*S,y),kick,mono15b,T['green'],0.14*15*S)
    y+=32*S
    d.text((M,y),head,font=serif34,fill=T['ink']); y+=int(34*1.15*S)
    d.rectangle([M,y+8*S,M+64*S,y+8*S+5*S],fill=T['green']); y+=34*S
    if sub: y=wrap(d,M,y+8*S,W-2*M,sub,sans15,int(15*1.5*S),T['body'])+8*S
    return y+18*S

def foot(im,d,n,total):
    y0=H-M+6*S
    d.line([M,y0,W-M,y0],fill=T['hair'],width=S)
    lh_=18*S; lw=int(LOGO.size[0]*lh_/LOGO.size[1])
    lg=LOGO.resize((lw,lh_),Image.LANCZOS); im.paste(lg,(M,y0+20*S),lg)
    t=f'{n} / {total}'
    tw=sum(d.textlength(c,font=mono11b)+0.08*11*S for c in t)
    tracked(d,(W-M-tw,y0+22*S),t,mono11b,T['green'],0.08*11*S)

def thumb(im,d,box,src,crop=None,label=None):
    """CONTAINED — the whole page visible, centred on a panel letterbox,
    hairline around the IMAGE not the box. Cover-fit was the first cut and it
    beheaded every 4:5 thumbnail: a reference that crops the thing it is
    identifying is not a reference."""
    x,y,w,h=box
    d.rectangle([x,y,x+w,y+h],fill=T['panel'])
    if src is None:
        d.rectangle([x,y,x+w,y+h],outline=T['chipB'],width=S)
        if label:
            for i,ln in enumerate(label.split('|')):
                tw=sum(d.textlength(c,font=mono11b)+0.12*11*S for c in ln)
                tracked(d,(x+(w-tw)//2,y+h//2-14*S+i*22*S),ln,mono11b,T['muted'],0.12*11*S)
        return
    p=Image.open(src).convert('RGB')
    if crop: p=p.crop(crop)
    sc=min(w/p.size[0],h/p.size[1])
    nw,nh=max(1,int(p.size[0]*sc)),max(1,int(p.size[1]*sc))
    p=p.resize((nw,nh),Image.LANCZOS)
    px,py=x+(w-nw)//2,y+(h-nh)//2
    im.paste(p,(px,py))
    d.rectangle([px,py,px+nw,py+nh],outline=T['chipB'],width=S)

def slot(im,d,box,role,title,line,src,label=None):
    """One COVER / CONTENT / CTA slot: role chip, thumbnail, name, one line."""
    x,y,w,h=box
    d.rectangle([x,y,x+w,y+h],fill=T['white'],outline=T['hair'],width=S)
    pad=16*S
    rw=sum(d.textlength(c,font=mono12b)+0.1*12*S for c in role)
    d.rectangle([x+pad,y+pad,x+pad+rw+16*S,y+pad+23*S],fill=T['tint'])
    tracked(d,(x+pad+8*S,y+pad+3*S),role,mono12b,T['green'],0.1*12*S)
    ty=y+pad+23*S+12*S
    th=int(h*0.63)
    thumb(im,d,(x+pad,ty,w-2*pad,th),src,None,label)
    ty+=th+16*S
    d.text((x+pad,ty),title,font=sans16b,fill=T['ink']); ty+=24*S
    wrap(d,x+pad,ty,w-2*pad,line,sans14,int(14*1.42*S),T['body'])

def row(im,d,y0,items,h,gap=22*S):
    cw=(W-2*M-(len(items)-1)*gap)//len(items)
    for i,it in enumerate(items):
        slot(im,d,(M+i*(cw+gap),y0,cw,h),**it)
    return y0+h+gap

def note(d,y,kick,txt):
    tracked(d,(M,y),kick,mono13b,T['green'],0.14*13*S)
    return wrap(d,M,y+26*S,W-2*M,txt,sans15,int(15*1.5*S),T['body'])

def build(d,y,cmd):
    tracked(d,(M,y),'BUILD',mono13b,T['muted'],0.14*13*S)
    tracked(d,(M+90*S,y),cmd,mono11,T['body'],0.06*11*S)

pages=[]
TOTAL=6

# ── 1 · COVER ──────────────────────────────────────────────────────────
im,d=page()
im.paste(Image.new('RGB',(W,320*S),T['panel']),(0,0)); d=ImageDraw.Draw(im)
d.rectangle([M,M,M+9*S,M+9*S],fill=T['green'])
tracked(d,(M+22*S,M-4*S),'HOUSE COLLATERAL',mono15b,T['green'],0.14*15*S)
d.text((M,M+52*S),'Five templates.',font=serif64,fill=T['ink'])
d.text((M,M+52*S+int(64*1.06*S)),'Pick one.',font=serif64,fill=T['green'])
d.rectangle([M,320*S-56*S,M+84*S,320*S-50*S],fill=T['green'])
y=372*S
y=wrap(d,M,y,760*S,'Carousel · One page · Monolith · Portal · Report. Monolith and Portal are LOOKS, not lengths — each arrives as a carousel or as a single image, so say which. The offer document is Portal.',sans22,int(22*1.45*S),T['body'])
y=wrap(d,M,y+18*S,760*S,'Every thumbnail here is a real render cropped from filed collateral. FORMATS.md owns the slot tables, DESIGN.md owns the look; if either disagrees with a card, it wins.',sans15,int(15*1.5*S),T['muted'])
sy=y+56*S
strip=[(HV/'hvac-2026-read-p01.jpg','CAROUSEL','2'),
       (D4/'2026-08-18/day-four-questions-dark-C.png','ONE PAGE','3'),
       (D4/'2026-08-19/day-four-questions-monolith-dark.png','MONOLITH','4'),
       (D4/'2026-08-19/day-four-questions-portal-light.png','PORTAL','5'),
       (ROOT/'client/public/reports/home-services-cover.jpg','REPORT','6')]
gapx=20*S; tw_=(W-2*M-(len(strip)-1)*gapx)//len(strip); th_=int(tw_*1.25)
for i,(src,lab,pg) in enumerate(strip):
    x=M+i*(tw_+gapx)
    thumb(im,d,(x,sy,tw_,th_),src)
    tracked(d,(x,sy+th_+14*S),lab,mono12b,T['ink'],0.1*12*S)
    tracked(d,(x,sy+th_+38*S),'PAGE '+pg,mono11,T['muted'],0.08*11*S)
cy=sy+th_+92*S
tracked(d,(M,cy),'WHAT EACH ONE CARRIES',mono13b,T['muted'],0.14*13*S); cy+=32*S
for a,b in [('Carousel','cover · four page kinds · CTA closer'),
            ('One page','one surface; the foot bar is the CTA'),
            ('Monolith','dark cover · light content pages · Frame C CTA'),
            ('Portal','light cover · light content pages · Frame C CTA'),
            ('Report','cover · markdown sections · no CTA page')]:
    d.line([M,cy-6*S,W-M,cy-6*S],fill=T['hair'],width=S)
    d.text((M,cy),a,font=sans16b,fill=T['ink'])
    d.text((M+200*S,cy+2*S),b,font=sans14,fill=T['body']); cy+=36*S
d.line([M,cy-6*S,W-M,cy-6*S],fill=T['hair'],width=S)
lw=180*S; lg=LOGO.resize((lw,int(LOGO.size[1]*lw/LOGO.size[0])),Image.LANCZOS)
im.paste(lg,(M,H-M-lg.size[1]),lg); d=ImageDraw.Draw(im)
tt=date.today().strftime('%d %B %Y').lstrip('0').upper()
tw=sum(d.textlength(c,font=mono11b)+0.08*11*S for c in tt)
tracked(d,(W-M-tw,H-M-14*S),tt,mono11b,T['muted'],0.08*11*S)
pages.append(im)

# ── 2 · CAROUSEL ───────────────────────────────────────────────────────
im,d=page()
y=header(d,'TEMPLATE 01','Carousel','The house multi-page LinkedIn post. Cover and CTA are auto-added bookends — never author either, and never author a dark body page.')
y=row(im,d,y,[
 dict(role='COVER',title='Auto-added',src=HV/'hvac-2026-read-p01.jpg',
      line='Hook and sub, with an optional numeral or a three-card proof strip. Dark or light — --bookend picks.'),
 dict(role='CONTENT',title="kind:'numeral'",src=HV/'hvac-2026-read-p03.jpg',
      line='Giant figure, green bar, serif sub-head. One number that carries a whole idea.'),
 dict(role='CTA',title='The closer',src=HV/'hvac-2026-read-p10.jpg',
      line='tag · head · body, byline foot with FOLLOW. Wears the cover’s surface — exactly two bookends and they match.'),
],h=520*S)
y=row(im,d,y,[
 dict(role='CONTENT',title="kind:'statement'",src=HV/'hvac-2026-read-p04.jpg',
      line='Mono eyebrow, serif headline, green rule. A claim with no figure attached.'),
 dict(role='CONTENT',title="kind:'diagram'",src=DD/'dead-deal-economics-p05.jpg',
      line='Two bars and a connector. Bar heights hold the ratio of the numbers; a label over six glyphs clips silently.'),
 dict(role='CONTENT',title="kind:'trade'",src=None,label='NO RENDER ON DISK|REBUILD ON THE MAC',
      line='Copy left, framed image panel right. THE ONLY body page with an image slot — image: on the other three is dropped.'),
],h=520*S)
note(d,y+6*S,'THE RULE THAT BREAKS DECKS','Any page carrying a figure and no source: line is a defect. One idea per page — if a page needs two source lines it is two pages.')
build(d,H-M-32*S,'npx tsx scripts/studio/build-deck.mts <spec.deck.mts>')
foot(im,d,2,TOTAL); pages.append(im)

# ── 3 · ONE PAGE ───────────────────────────────────────────────────────
im,d=page()
y=header(d,'TEMPLATE 02','One page (image)','A single image post. No content pages and no CTA page — everything is on the one surface, and the foot bar carrying the byline and smbx.ai is the CTA.')
y=row(im,d,y,[
 dict(role='LAYOUT · DEFAULT',title='figure',src=D4/'2026-08-18/day-four-questions-dark-C.png',
      line='The standing cutout at 834px, floating in flow so the copy wraps the silhouette. Kicker, hook, lede, numbered points, source note, foot.'),
 dict(role='LAYOUT',title='split',src=None,label='NO CURRENT RENDER',
      line='Copy column plus a full-bleed photo. Still live — set layout: \'split\' explicitly in new specs.'),
 dict(role='LAYOUT',title='text card',src=None,label='NO CURRENT RENDER',
      line='A split spec with no image: full-width copy, no photograph.'),
],h=790*S)
y=note(d,y+6*S,'BOTH SURFACES, ALWAYS','Dark and light render by default — the same card, two grounds, not two artifacts. The dark one is the default post.')
y=note(d,y+30*S,'THE BACK CATALOGUE STAYS PUT','A spec naming image with no layout is a pre-2026-08-18 split spec and keeps rendering split, so a rebuild cannot silently restyle something already published.')
build(d,H-M-32*S,'npx tsx scripts/studio/build-onepager.mts <spec.post.mts>')
foot(im,d,3,TOTAL); pages.append(im)

# ── 4 · MONOLITH ───────────────────────────────────────────────────────
im,d=page()
y=header(d,'TEMPLATE 03','Monolith — the dark look','Deal Green monolith on the dark band, greenBright offset rim plate, aimed bloom, gradient copy panel. Arrives as a carousel or as a single image — say which.')
y=row(im,d,y,[
 dict(role='COVER',title='The monolith',src=DD/'dead-deal-economics-p01.jpg',
      line='The figure on the plate, numeral and hook in the copy panel. The C treatment is default: bloom aimed at the torso, 1.16/1.05 lift in the renderer.'),
 dict(role='CONTENT',title='House light grammar',src=DD/'dead-deal-economics-p05.jpg',
      line='Bone ground, mono kicker over a hairline rule, serif head, green rule, prose or a list, ghost numeral behind, dark strip foot.'),
 dict(role='CTA',title='Frame C',src=DD/'dead-deal-economics-p10.jpg',
      line='The portrait in a golden rectangle with corner handles and a 14px green offset plate, payoff line, green action bar, logo lower-left.'),
],h=790*S)
y=note(d,y+6*S,'THE BOOKEND LAW','The ground is worn by the COVER and the CTA page only; every page between is light. A first cut wore the monolith on all ten pages and it was wrong — the monolith is a cover treatment, not a page style. Never a third bookend, never two in a row.')
y=note(d,y+30*S,'AS A ONE PAGE','The dark figure card is this same look on one surface — the day-four card on the cover strip, page 1. pop:false returns the ambient bloom with no lift.')
build(d,H-M-32*S,'python3 scripts/studio/figure-deck.py <spec> --ground monolith-dark')
foot(im,d,4,TOTAL); pages.append(im)

# ── 5 · PORTAL ─────────────────────────────────────────────────────────
im,d=page()
y=header(d,'TEMPLATE 04','Portal — the light look','Four receding green portal steps on paper, gradient copy panel, dot field. A different mechanic from the monolith, not a recolour. THE OFFER DOCUMENT IS THIS TEMPLATE — the content varies with the need, the template does not.')
y=row(im,d,y,[
 dict(role='COVER',title='The portal steps',src=O/'smbx-corpdev-offering-p01.jpg',
      line='The figure on the steps, with an optional numeral, plate label and ruled stat rows in the copy column.'),
 dict(role='CONTENT',title='House light grammar',src=O/'smbx-corpdev-offering-p03.jpg',
      line='Top strip, kicker, serif headline, green rule, lede, then a dash list or a numbered list, note at the foot, ghost numeral behind.'),
 dict(role='CTA',title='Frame C, light',src=O/'smbx-corpdev-offering-p05.jpg',
      line='Payoff, the plate pair when the content calls for it, the action bar, the proof line, the portrait framed right with its byline.'),
],h=790*S)
y=note(d,y+6*S,'AS A ONE PAGE','The light figure card is the same look on one surface, 1.08/1.02 lift. Same bookend law as Monolith: ground on the cover and the CTA page only.')
y=note(d,y+30*S,'THE OFFER, TWO CUTS','No-pricing 5pp is postable; pricing 7pp adds the schedule table and the terms page and is the email-gated brochure. Same template, different content.')
build(d,H-M-32*S,'python3 scripts/studio/offer-docs.py --doc nopricing|pricing|both')
foot(im,d,5,TOTAL); pages.append(im)

# ── 6 · REPORT ─────────────────────────────────────────────────────────
im,d=page()
y=header(d,'TEMPLATE 05','Report','The long-form assessment as a PDF, rendered from plain markdown — the same file the site publishes, so page and PDF cannot drift. Reports keep the BANNER grammar; a report is not a figure card.')
y=row(im,d,y,[
 dict(role='COVER',title='Dark band',src=ROOT/'client/public/reports/home-services-cover.jpg',
      line='Kicker, serif title, byline with the headshot, the stat band, an optional hero image. Shown here as the link-preview card, which is built from the same cover config.'),
 dict(role='CONTENT',title='Markdown sections',src=None,label='NO RENDER ON DISK|REBUILD ON THE MAC',
      line='# parts break the page (or ## sections if the report has no parts). accent: drops a framed photo band under a named heading. Tables are hairline with mono headers.'),
 dict(role='CLOSE',title='No CTA page',src=None,label='SOURCES · DERIVATIONS|WHAT WE DON’T KNOW YET',
      line='The required skeleton closes it. Every client-facing document ends on What we don’t know yet.'),
],h=790*S)
y=note(d,y+6*S,'THE COVER BUDGET','The cover carries the argument, not just the title — but every figure on it survives the same audit as a body figure. Never a total unless the total is itself cited.')
y=note(d,y+30*S,'THE SIBLING','build-og-card.mts renders the 1200×630 link preview a shared report URL shows, from that same cover config.')
build(d,H-M-32*S,'npx tsx scripts/studio/build-report.mts <report.md>')
foot(im,d,6,TOTAL); pages.append(im)

OUT.mkdir(parents=True,exist_ok=True)
for i,p in enumerate(pages):
    p.save(OUT/f'smbx-templates-reference-p{i+1:02d}.jpg',quality=92,optimize=True)
pages[0].save(OUT/'smbx-templates-reference.pdf',save_all=True,
              append_images=pages[1:],resolution=150)
print(f'  {len(pages)} pages -> {OUT}/smbx-templates-reference.pdf')
