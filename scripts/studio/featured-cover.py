#!/usr/bin/env python3
"""
featured-cover.py — the landscape LinkedIn Featured cover, on OXBLOOD.

  python3 scripts/studio/featured-cover.py [--out <dir>] [--handoff <dir>]

Transcribed from `design_handoff_smbx_offer_docs/featured/cover-2a-portal.html`
(2a on Paul's reference sheet: PLANE SHOT — FULL-WIDTH BAND, HORIZONTAL SPLIT).
1200×630, which is the Featured card's own ratio, so LinkedIn has nothing to
crop. Rasterised at 2×.

THE SPLIT IS HORIZONTAL, AND THE SOURCE FORCES IT. `founder-plane.jpg` is
3168×1344 — 2.36:1. A 742×630 side panel is 1.18:1, so filling one would throw
away half the image's width, which was the only reason to use the wide shot at
all. There is no side panel and no phi seam on this surface.

REVISION, Paul 2026-08-22 — four asks, and one of them moved the geometry:

  · NEW HOOK. "We\u2019ll build and run your business acquisition engine for
    you." with "Build. Run. Go." on the line under it, in the on-field accent.
  · THE 150 IS OUT. The four sanctioned stats replace it as a 2×2 SQUARE on
    the right — the full set from root CLAUDE.md: 150+ acquisitions &
    integrations · $5B+ enterprise value added · ~$21B transactions touched ·
    $2B synergies captured.
  · CENTRED. The hook is centred in its own column and the square is centred
    in its own, both on the band\u2019s vertical midline.
  · LOGO 240 → 280.

  THE BAND HAD TO GROW, 200 → 300, and the photograph shrink 430 → 330.
  A 2×2 square of legible cards needs ~236px; a 200px band leaves 160 after
  margins, which forced either a 26px numeral or a 9px label. The handoff
  already sanctions trading band height against photograph height ("to restore
  the lede, band → 240 and photograph → 390"), and the plane shot is 2.36:1 so
  it loses only vertical crop it can spare.

  THE CARDS ARE WELLS, NOT PLATES. §3.4.2: dense content belongs in the
  recessed well, which carries all four text tiers where a raised plate
  carries two — and the accent is legal there (5.55:1) where it is barred on a
  plate (2.67:1). The reference strip Paul sent shows plate-coloured cards
  with an accent bar, which is the one combination the depth law forbids; wells
  give the same look and keep the rule.

  logo        w280 at (48,44), ON the photograph — the cabin wall behind it is
              light enough to carry an ink mark. The mark is the only type
              allowed over a photograph.

The filename keeps `cover-2a-portal` upstream for continuity; the portal it was
named for is retired.
"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
args = sys.argv[1:]
def flag(n, d=None):
    return args[args.index(n) + 1] if n in args else d
OUT = pathlib.Path(flag('--out', 'collateral')).resolve()
HANDOFF = pathlib.Path(flag('--handoff',
    str(pathlib.Path.home()/'Downloads/design_handoff_smbx_offer_docs')))
CACHE = HERE / '.fonts-cache'

S = 2; W, H = 1200*S, 630*S
T = dict(ground=(252,250,246), field=(138,43,50), well=(80,25,29),
         fInk=(255,243,240), fSub=(240,216,212), fMut=(220,184,180),
         onField=(255,125,85))

def F(n, s): return ImageFont.truetype(str(CACHE/n), s)
serif46 = F('ox-serif-400.ttf', 46*S)
serif40 = F('ox-serif-400.ttf', 40*S); serif40i = F('ox-serif-400i.ttf', 40*S)
mono15  = F('mono-500.ttf', 15*S)

PLANE = Image.open(HANDOFF/'assets/founder-plane.jpg').convert('RGB')
LOGO  = Image.open(HANDOFF/'assets/logo-accent-x.png').convert('RGBA')

def tracked(d, pos, txt, font, fill, ls):
    x, y = pos
    for ch in txt:
        d.text((x, y), ch, font=font, fill=fill); x += d.textlength(ch, font=font) + ls
    return x

def tw(d, txt, font, ls=0):
    return sum(d.textlength(c, font=font) + ls for c in txt)

PHOTO_H, BAND_H = 330, 300
STATS = (('150+', 'ACQUISITIONS &|INTEGRATIONS'),
         ('$5B+', 'ENTERPRISE|VALUE ADDED'),
         ('~$21B', 'TRANSACTIONS|TOUCHED'),
         ('$2B', 'SYNERGIES|CAPTURED'))

img = Image.new('RGB', (W, H), T['ground']); d = ImageDraw.Draw(img)
pw = 1200*S; ph = int(PLANE.size[1] * pw / PLANE.size[0])
img.paste(PLANE.resize((pw, ph), Image.LANCZOS).crop((0, 0, pw, PHOTO_H*S)), (0, 0))
d = ImageDraw.Draw(img)
d.rectangle([0, PHOTO_H*S, W, H], fill=T['field'])
lw = 280*S; lg = LOGO.resize((lw, int(LOGO.size[1]*lw/LOGO.size[0])), Image.LANCZOS)
img.paste(lg, (48*S, 44*S), lg); d = ImageDraw.Draw(img)

mid = (PHOTO_H + BAND_H/2) * S          # the band's vertical midline

# ── the stat square, right column ─────────────────────────────────────────
CW, CH, G = 182*S, 122*S, 14*S
sq_w, sq_h = 2*CW + G, 2*CH + G
sq_x = W - 48*S - sq_w
sq_y = int(mid - sq_h/2)
for i, (val, lab) in enumerate(STATS):
    cx = sq_x + (i % 2) * (CW + G); cy = sq_y + (i // 2) * (CH + G)
    d.rectangle([cx, cy, cx + CW, cy + CH], fill=T['well'])
    vw = d.textlength(val, font=serif46)
    d.text((cx + (CW - vw)/2, cy + 16*S), val, font=serif46, fill=T['fInk'])
    ly = cy + 16*S + int(46*0.96*S) + 10*S
    for ln in lab.split('|'):
        lwid = tw(d, ln, mono15, .09*15*S) - .09*13*S
        tracked(d, (cx + (CW - lwid)/2, ly), ln, mono15, T["fMut"], .09*15*S)
        ly += int(15*1.45*S)

# ── the hook, left column, centred on the same midline ────────────────────
hook_x, hook_w = 64*S, sq_x - 64*S - 56*S
lines = []
for txt, f, col in (("We\u2019ll build and run your business acquisition engine for you.",
                     serif40, T['fInk']),
                    ('Build. Run. Go.', serif40i, T['onField'])):
    cur = []
    for w0 in txt.split(' '):
        cur.append((w0, f, col))
        if sum(d.textlength(w + ' ', font=ff) for w, ff, _ in cur) > hook_w:
            cur.pop(); lines.append(cur); cur = [(w0, f, col)]
    if cur: lines.append(cur)
lh = int(40*1.18*S)
y = int(mid - len(lines)*lh/2) - int(0.12*40*S)
for ln in lines:
    cx = hook_x
    for w0, f, col in ln:
        d.text((cx, y), w0, font=f, fill=col); cx += d.textlength(w0 + ' ', font=f)
    y += lh

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT/'smbx-featured-cover.png', optimize=True)
print(f'  {W}x{H} -> {OUT}/smbx-featured-cover.png')
