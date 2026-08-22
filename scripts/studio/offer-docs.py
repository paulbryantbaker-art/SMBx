#!/usr/bin/env python3
"""
offer-docs.py — the two smbx Dev offer documents, on OXBLOOD.

  python3 scripts/studio/offer-docs.py [--out <dir>] [--doc nopricing|pricing|both]

SOURCE OF TRUTH: `design_handoff_smbx_offer_docs/` (RULE ZERO — the HTML wins
over any comment here; when they disagree this file is the bug). 12 reference
pages, rebuilt 2026-08-22 on the OXBLOOD system (`DESIGN_LANGUAGE.md`), which
supersedes the CARTA / Deal Green build of 2026-08-19:

  nopricing (5pp)  cover · problem · smbx Dev · smbx Dev Pro · closer
                   — the POSTABLE document.
  pricing   (7pp)  … + the schedule table + the terms page — the EMAIL-GATED
                   offering PDF. Going live means replacing
                   `content/collateral/smbx-corpdev-pricing.pdf` (the file
                   `POST /api/practice/pricing` mails to leads) — a deliberate
                   deploy step, never a side effect of running this script.
                   OFFER_REFERENCE.md §5: the spec slug and the served
                   filename DIFFER, so a naive rebuild lands beside the live
                   file and every lead keeps receiving the old brochure.

WHAT OXBLOOD CHANGED, structurally — none of this is decoration:
  · TWO FIELD SURFACES PER DOCUMENT AND NO MORE — the cover's right panel and
    the closer page. Everything between is flat bone. There is no black band.
  · THE DEPTH RAMP DOES THE WORK, not a second colour. well #50191D recessed ·
    field #8A2B32 · plate #964046 raised by an #AF6F74 rim. Dense content and
    the accent go in the WELL (5.55:1 there against 3.36:1 on the field); a
    raised plate carries content and never the accent (#FF7D55 on #964046 is
    2.67:1 — which is why the Dev Pro plate's `x` is #FFF3F0 and the Core
    plate's is #FF7D55. The two plates carry differently-coloured marks ON
    PURPOSE).
  · THE BUTTON LAW — the accent never fills a resting button. The action bar
    is bone on the field with an ink label.
  · No gradients, no ghost numerals, no dot field, no decorative eyebrows.
    Radius 0 except the action bar's 6px. Headshots are square.
  · Corner handles: TWO opposite corners, 16px at −8px (the handoff's one
    deliberate deviation from §5's interface-scale 8px/−4px; the ratio holds).

TYPE: Instrument Serif 400 + italic · Plus Jakarta Sans 400/500/600/700 · IBM
Plex Mono 400/500, cached as ttf in `.fonts-cache/ox-*`. The root CLAUDE.md
says "type did NOT change" — that is the SITE's law and this family is a
document; both new faces were installed rather than substituted, because a
missing face does not error, it ships as Noto.

THREE CANON CORRECTIONS vs the handoff. Design is 1:1; copy follows the
practice's own record (`OFFER_REFERENCE.md`). Do not "restore" the handoff
wording — and note that the handoff's own TOKENS-USED believes two of these
were already fixed:

  1. "REVENUE ADDED" → "ENTERPRISE VALUE ADDED" on the cover stat rows. The
     sanctioned stat set (root CLAUDE.md, Track Record doctrine) is enterprise
     value; revenue is a different and unsanctioned claim. THE DOCUMENT
     CONTRADICTED ITSELF — its own closer proof line already reads "$5B+
     enterprise value added".
  2. "Evaluation" → "VALUATION" in the smbx Dev list (Paul, 2026-08-13: "as in
     how much a business is worth. My ICP will catch this").
  3. "Close the deal and the retainer was free." — CUT from the terms page.
     TOKENS-USED §Copy-departures 8 says the credit line was corrected, and
     the first half was; this second sentence survived and it overstates.
     OFFER_REFERENCE.md §2: the credit CAPS at the fee — a long mandate on a
     floor deal owes $0 at close and the excess is NOT refunded — and there is
     no credit at all without a close. "Free" is true only when the fee
     exceeds the retainers paid.

The schedule itself is VERIFIED against OFFER_REFERENCE.md §2 and needs no
correction: 5% / 4% / 3% / 2%, $100,000 minimum, $15,000 a quarter paid up
front, $5M → $210,000 = 4.2%.

NO FIGURE EXISTS FOR smbx Coach OR smbx Crew (OFFER_REFERENCE.md §3) and
neither line appears in this family. Never invent one, and never attach a
success fee to either.

PIL raster, same standing as figure-deck.py: subordinate to a future
build-deck.mts page-kind extension.
"""
import sys, os, re, math, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
args = sys.argv[1:]
def flag(n, d=None):
    return args[args.index(n) + 1] if n in args else d
OUT = pathlib.Path(flag('--out', 'collateral')).resolve()
DOC = flag('--doc', 'both')
HANDOFF = pathlib.Path(flag('--handoff',
    str(pathlib.Path.home()/'Downloads/design_handoff_smbx_offer_docs')))
# COVER VARIANTS (2026-08-22). `photo` is 3b, ADOPTED — the photograph filling
# the field panel with the well at its FOOT. `framed` is 3c, KEPT — the well as
# a SMALLER BLOCK at the TOP of the panel with the portrait framed beneath it,
# transcribed from candidates/cover-suit-b-framed.html.
# `--surface dark` puts the framed cover on a FULL FIELD PAGE. The two-field
# law still holds — a full-field cover plus the field closer is exactly two —
# and it gives the document a dark opening the way a carousel has a dark
# bookend.
COVER   = flag('--cover', 'photo')      # photo | framed
SURFACE = flag('--surface', 'light')    # light | dark

CACHE = HERE / '.fonts-cache'
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

def F(n, s):
    return ImageFont.truetype(str(CACHE / n), s)

S = 2; W, H = 1080 * S, 1350 * S

# ── OXBLOOD ────────────────────────────────────────────────────────────────
# THE FIELD SIDE MATCHES house/tokens.ts EXACTLY. THE LIGHT SIDE DOES NOT, and
# that is a real conflict rather than a transcription slip:
#
#   handoff   ground #FCFAF6 · rule #E3DDD4 · ink #1A1A1A · body #57534E · muted #76726B
#   repo law  ground #FFFFFF · hair #E4DFD3 · ink #16181A · body #4A4F54 · muted #7C8187
#
# DESIGN_LANGUAGE.md §3 puts the white ground ON THE RECORD — Paul, 2026-08-12,
# side by side against carta.com: our warm #FCFAF6 "read dingy" beside their
# pure white, and the note says the ground is white, NOT bone. The handoff
# reverts to the warm set for a printed document, where the argument that
# produced the white decision (a screen, beside a competitor's screen) does not
# apply. Neither is obviously wrong; the two must not silently disagree.
#
# `--neutrals handoff` (default, RULE ZERO) or `--neutrals repo`. Both render;
# the choice is Paul's, and it is one flag either way.
NEUTRALS = flag('--neutrals', 'handoff')
_LIGHT = dict(
    handoff=dict(ground=(252,250,246), rule=(227,221,212), ink=(26,26,26),
                 body=(87,83,78), muted=(118,114,107)),
    repo=dict(ground=(255,255,255), rule=(228,223,211), ink=(22,24,26),
              body=(74,79,84), muted=(124,129,135)),
)[NEUTRALS]
T = dict(
    **_LIGHT,
    accent=(184,67,30),     # #B8431E
    accentHov=(156,55,23),  # #9C3717
    tint=(251,231,223),     # #FBE7DF
    field=(138,43,50),      # #8A2B32
    well=(80,25,29),        # #50191D
    plate=(150,64,70),      # #964046
    rim=(175,111,116),      # #AF6F74
    border=(192,141,144),   # #C08D90
    fInk=(255,243,240),     # #FFF3F0
    fSub=(240,216,212),     # #F0D8D4
    fMut=(220,184,180),     # #DCB8B4
    onField=(255,125,85),   # #FF7D55
)

serif144 = F('ox-serif-400.ttf',144*S); serif78 = F('ox-serif-400.ttf',78*S)
serif78i = F('ox-serif-400i.ttf',78*S); serif72 = F('ox-serif-400.ttf',72*S)
serif72i = F('ox-serif-400i.ttf',72*S); serif46 = F('ox-serif-400.ttf',46*S)
sans40  = F('ox-sans-400.ttf',40*S);  sans40b = F('ox-sans-600.ttf',40*S)
sans36  = F('ox-sans-400.ttf',36*S);  sans32b = F('ox-sans-600.ttf',32*S)
sans26b = F('ox-sans-600.ttf',26*S);  sans24  = F('ox-sans-400.ttf',24*S)
sans24b = F('ox-sans-600.ttf',24*S);  sans22  = F('ox-sans-400.ttf',22*S)
sans20  = F('ox-sans-400.ttf',20*S)
mono24b = F('mono-600.ttf',24*S); mono26 = F('mono-500.ttf',26*S)
mono22  = F('mono-500.ttf',22*S); mono22n = F('mono-400.ttf',22*S)
mono20  = F('mono-500.ttf',20*S)

def A(p):
    """Assets ship WITH the handoff; the repo's own copies are the green
    originals and would silently render the retired mark."""
    return HANDOFF / 'assets' / p
SUIT = Image.open(A('founder-suit.jpg')).convert('RGB')
HEAD = Image.open(A('founder-headshot.jpg')).convert('RGB')
PORT = Image.open(A('founder-headshot.jpg')).convert('RGB')
LOGO_A = Image.open(A('logo-accent-x.png')).convert('RGBA')   # ink + accent X
LOGO_B = Image.open(A('logo-bone-x.png')).convert('RGBA')     # bone + #FF7D55 X

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

def tracked(d, pos, txt, font, fill, ls):
    x, y = pos
    for ch in txt:
        d.text((x, y), ch, font=font, fill=fill); x += d.textlength(ch, font=font) + ls
    return x

def tw(d, txt, font, ls=0):
    return sum(d.textlength(c, font=font) + ls for c in txt)

def arrow(d, x, y, col, w=26*S):
    """→ is absent from every one of the three subsets, so it is drawn."""
    d.line([x, y, x + w - 8*S, y], fill=col, width=2*S)
    d.polygon([(x + w, y), (x + w - 9*S, y - 6*S), (x + w - 9*S, y + 6*S)], fill=col)

def _runs(txt, fn, fb, fi, cn, cb):
    """Markers → styled runs. `**bold**` · `~italic accent~` (the handoff's
    <em>) · `%accent%` (the lower-case x, which carries the retired capital-X
    mark now that the names are lower-case)."""
    out = []
    for j, a in enumerate(str(txt).split('**')):
        for k, b in enumerate(a.split('~')):
            for m, c in enumerate(re.split(r'[{}]', b)):
                if not c: continue
                f, col = fn, cn
                if j % 2: f, col = fb, cb
                if k % 2: f, col = fi, T['accent']
                if m % 2: col = T['accent']
                out.append((c, f, col))
    return out

def _flow(d, x, y, width, runs, lh, ls=0, draw=True):
    """Wrap STYLED RUNS, gluing fragments that are not separated by a space.

    THE GLUE IS THE WHOLE POINT. A run-per-word tokenizer renders `smb{x} Dev`
    as "smb x Dev" — three words, two spaces — because the accent x is its own
    run. A word here is a sequence of fragments with no whitespace between
    them, measured and drawn as one unit."""
    words = []; cur = []
    for text, f, col in runs:
        parts = text.split(' ')
        for i, p in enumerate(parts):
            if i:
                if cur: words.append(cur); cur = []
            if p: cur.append((p, f, col))
    if cur: words.append(cur)
    def wid(w):
        return sum(d.textlength(p, font=f) + ls*len(p) for p, f, _ in w)
    lines = [[]]; cw = 0
    space = d.textlength(' ', font=runs[0][1]) + ls if runs else 0
    for w in words:
        ww = wid(w)
        if cw + ww > width and lines[-1]: lines.append([]); cw = 0
        lines[-1].append(w); cw += ww + space
    if draw:
        for ln in lines:
            cx = x
            for w in ln:
                for p, f, col in w:
                    if ls:
                        cx = tracked(d, (cx, y), p, f, col, ls)
                    else:
                        d.text((cx, y), p, font=f, fill=col)
                        cx += d.textlength(p, font=f)
                cx += space
            y += lh
    else:
        y += lh * len(lines)
    return y

def wrap(d, x, y, width, txt, font, lh, col, bold=None, ls=0):
    return _flow(d, x, y, width, _runs(txt, font, bold or font, font, col, T['ink']),
                 lh, ls)

def em_head(d, x, y, width, txt, font, fital, lh, ls, ink=None, accent=None):
    r = _runs(txt, font, font, fital, ink or T['ink'], ink or T['ink'])
    if accent:
        r = [(t, f, accent if c == T['accent'] else c) for t, f, c in r]
    return _flow(d, x, y, width, r, lh, ls)

def foot90(img, d, pg, total):
    y0 = H - 90*S
    d.rectangle([0, y0, W, H], fill=T['ground'])
    d.line([0, y0, W, y0], fill=T['rule'], width=S)
    lh_ = 24*S; lw = int(LOGO_A.size[0] * lh_ / LOGO_A.size[1])
    lg = LOGO_A.resize((lw, lh_), Image.LANCZOS)
    img.paste(lg, (72*S, y0 + (90*S - lh_)//2), lg)
    t = f'{pg} / {total}'
    tracked(d, (W - 72*S - tw(d, t, mono22, .1*22*S), y0 + (90*S - 22*S)//2),
            t, mono22, T['muted'], .1*22*S)

def body_page(pg, total, top, hl, lede, rows, kind, note, start=1, gap=26,
              list_top=46, table=None):
    img = Image.new('RGB', (W, H), T['ground']); d = ImageDraw.Draw(img)
    # running header — section name flush LEFT, nothing else (§4: no eyebrows)
    tracked(d, (72*S, 52*S), top, mono22, T['ink'], .13*22*S)
    d.line([72*S, 52*S + 22*S + 22*S, W - 72*S, 52*S + 22*S + 22*S], fill=T['rule'], width=S)
    y = 52*S + 44*S + 62*S
    y = em_head(d, 72*S, y, 930*S, hl, serif78, serif78i, int(78*1.03*S), -0.004*78*S)
    d.rectangle([72*S, y + 34*S, 72*S + 84*S, y + 38*S], fill=T['accent'])
    y += 34*S + 4*S
    if lede:
        y = wrap(d, 72*S, y + 38*S, 900*S, lede, sans40, int(40*1.3*S), T['body'])
    if table:
        y += 46*S
        tracked(d, (72*S, y), 'TRANSACTION VALUE', mono22, T['muted'], .13*22*S)
        tracked(d, (72*S + 936*S - tw(d, 'RATE', mono22, .13*22*S), y),
                'RATE', mono22, T['muted'], .13*22*S)
        y += 22*S + 16*S
        d.rectangle([72*S, y, 72*S + 936*S, y + 2*S], fill=T['accent']); y += 2*S
        for name, rate, strong in table:
            y += 20*S
            d.text((72*S, y), name, font=sans40b if strong else sans40, fill=T['ink'])
            d.text((72*S + 936*S - d.textlength(rate, font=sans40b), y), rate,
                   font=sans40b, fill=T['ink'])
            y += int(40*1.1*S) + 20*S
            d.line([72*S, y, 72*S + 936*S, y], fill=T['rule'], width=S)
    else:
        y += list_top*S
        for i, row in enumerate(rows):
            if kind == 'num':
                n = start + i; ch = 44*S
                d.rectangle([72*S, y + 4*S, 72*S + ch, y + 4*S + ch], fill=T['tint'])
                nw = d.textlength(str(n), font=mono26)
                d.text((72*S + (ch - nw)/2, y + 4*S + (ch - 26*S)/2), str(n),
                       font=mono26, fill=T['accentHov'])
                y2 = wrap(d, 72*S + ch + 24*S, y, (920-44-24)*S, row, sans40,
                          int(40*1.3*S), T['body'], bold=sans40b)
                y = max(y2, y + 4*S + ch) + gap*S
            else:
                d.rectangle([72*S, y + 20*S, 72*S + 26*S, y + 24*S], fill=T['accent'])
                y = wrap(d, 72*S + 26*S + 24*S, y, (900-50)*S, row, sans40,
                         int(40*1.3*S), T['body'], bold=sans40b) + gap*S
    if note:
        sd = ImageDraw.Draw(Image.new('RGB', (8, 8)))
        nh = wrap(sd, 0, 0, 860*S, note, mono22n, int(22*1.55*S), T['muted'])
        ny = H - 130*S - nh
        if y + 28*S > ny:
            print(f'  ! page {pg}: copy overruns the note by {(y+28*S-ny)//S}px')
        wrap(d, 72*S, ny, 860*S, note, mono22n, int(22*1.55*S), T['muted'])
    foot90(img, d, pg, total)
    return img

def cover(total):
    """THE COVER — 3b, ADOPTED: PHOTOGRAPH FULL-BLEED, WELL AT THE FOOT.

    Grid: 1080 / phi = 667 is the panel seam. The photograph fills the panel
    edge to edge and the well sits at the panel's FOOT, because the photograph
    owns the top. NO FILTER — the 1.08/1.02 lift belonged to the cut-out
    against flat oxblood and washes out a photograph.

    `--cover framed` renders 3c instead (KEPT): the well as a smaller block at
    the TOP with the portrait framed beneath it."""
    if COVER == 'framed':
        return _cover_framed()
    img = Image.new('RGB', (W, H), T['ground']); d = ImageDraw.Draw(img)
    d.rectangle([667*S, 0, W, 1232*S], fill=T['field'])
    ph_w = int(1001*S); ph_h = int(SUIT.size[1] * ph_w / SUIT.size[0])
    ph = SUIT.resize((ph_w, ph_h), Image.LANCZOS).crop((179*S, 39*S, 179*S + 413*S, 39*S + 1232*S))
    img.paste(ph, (667*S, 0)); d = ImageDraw.Draw(img)
    lw = 199*S; lg = LOGO_A.resize((lw, int(LOGO_A.size[1]*lw/LOGO_A.size[0])), Image.LANCZOS)
    img.paste(lg, (64*S, 56*S), lg); d = ImageDraw.Draw(img)
    d.rectangle([699*S, 896*S, 699*S + 349*S, 896*S + 304*S], fill=T['well'])
    d.text((731*S, 928*S - int(0.07*144*S)), '150', font=serif144, fill=T['fInk'])
    d.rectangle([735*S, 1082*S, 735*S + 56*S, 1082*S + 4*S], fill=T['onField'])
    ly = 1108*S
    for ln in ('ACQUISITIONS', 'LED OR CO-LED'):
        tracked(d, (735*S, ly), ln, mono20, T['fMut'], .1*20*S); ly += int(20*1.5*S)
    _cover_copy(d, T['ink'], T['body'], T['muted'], T['rule'], T['accent'])
    return _cover_foot(img, d)

def _cover_copy(d, INK, BODY, MUTED, RULE, ACC):
    """The copy column — shared by both covers and re-scoped for the field."""
    em_head(d, 64*S, 168*S, 539*S,
            'Buying a business is hard work. ~We make it easier.~',
            serif72, serif72i, int(72*1.04*S), -0.004*72*S, ink=INK, accent=ACC)
    wrap(d, 64*S, 471*S, 539*S,
         'Whether it\u2019s your 1st or your 100th acquisition, we run the process for you, '
         'freeing up your time and resources.', sans36, int(36*1.34*S), BODY)
    y = 800*S
    for v, l in (('$5B+', 'ENTERPRISE VALUE ADDED'),
                 ('~$21B', 'TRANSACTION VALUE TOUCHED'),
                 ('0', 'SELL-SIDE DEALS. EVER.')):
        d.line([64*S, y, 667*S, y], fill=RULE, width=S)
        ry = y + 20*S
        d.text((64*S, ry - int(0.16*46*S)), v, font=serif46, fill=ACC)
        tracked(d, ((64+120+16)*S, ry + int(46*0.30*S)), l, mono20, MUTED, .08*20*S)
        y = ry + 46*S + 18*S
    d.line([64*S, y, 667*S, y], fill=RULE, width=S)

def _cover_framed():
    """3c — KEPT. The well is a SMALLER BLOCK at the TOP of the panel and the
    portrait is framed beneath it. Transcribed from
    candidates/cover-suit-b-framed.html.

    ON DARK the copy column re-scopes to the field's own text tiers, the
    hairlines become the rim, the stat values take the ON-FIELD accent
    #FF7D55 — never #B8431E, which measures 1.9:1 there — and the mark
    switches to logo-bone-x. The well still reads as a recess because it is
    darker than the field: that is what the ramp is for."""
    dark = SURFACE == 'dark'
    GROUND = T['field'] if dark else T['ground']
    INK   = T['fInk'] if dark else T['ink']
    BODY  = T['fSub'] if dark else T['body']
    MUTED = T['fMut'] if dark else T['muted']
    RULE  = T['rim']  if dark else T['rule']
    ACC   = T['onField'] if dark else T['accent']
    MARK  = LOGO_B if dark else LOGO_A
    img = Image.new('RGB', (W, H), GROUND); d = ImageDraw.Draw(img)
    if not dark:
        d.rectangle([667*S, 0, W, 1232*S], fill=T['field'])
    lw = 199*S; lg = MARK.resize((lw, int(MARK.size[1]*lw/MARK.size[0])), Image.LANCZOS)
    img.paste(lg, (64*S, 56*S), lg); d = ImageDraw.Draw(img)
    d.rectangle([699*S, 106*S, 699*S + 349*S, 106*S + 304*S], fill=T['well'])
    d.text((731*S, 138*S - int(0.07*144*S)), '150', font=serif144, fill=T['fInk'])
    d.rectangle([735*S, 292*S, 735*S + 56*S, 292*S + 4*S], fill=T['onField'])
    ly = 318*S
    for ln in ('ACQUISITIONS', 'LED OR CO-LED'):
        tracked(d, (735*S, ly), ln, mono20, T['fMut'], .1*20*S); ly += int(20*1.5*S)
    fx, fy, fw2, fh2 = 699*S, 442*S, 349*S, 750*S
    d.rectangle([fx + 18*S, fy + 18*S, fx + 18*S + fw2, fy + 18*S + fh2], fill=T['well'])
    sw = int(702*S); sh = int(SUIT.size[1] * sw / SUIT.size[0])
    shot = SUIT.resize((sw, sh), Image.LANCZOS).crop((95*S, 27*S, 95*S + fw2, 27*S + fh2))
    shot = ImageEnhance.Contrast(ImageEnhance.Brightness(shot).enhance(1.04)).enhance(1.02)
    img.paste(shot, (fx, fy)); d = ImageDraw.Draw(img)
    d.rectangle([fx, fy, fx + fw2, fy + fh2], outline=T['rim'], width=S)
    hs = 16*S
    for hx, hy in ((fx - 8*S, fy - 8*S), (fx + fw2 - 8*S, fy + fh2 - 8*S)):
        d.rectangle([hx, hy, hx + hs, hy + hs], fill=T['ink'])
    _cover_copy(d, INK, BODY, MUTED, RULE, ACC)
    return _cover_foot(img, d, dark=dark)

def _cover_foot(img, d, dark=False):
    """The byline strip — bone by default, field on a dark cover."""
    y0 = 1232*S
    G = T['field'] if dark else T['ground']; R = T['rim'] if dark else T['rule']
    I = T['fInk'] if dark else T['ink'];     M = T['fMut'] if dark else T['muted']
    A = T['onField'] if dark else T['accent']
    d.rectangle([0, y0, W, H], fill=G)
    d.line([0, y0, W, y0], fill=R, width=S)
    fs = 56*S; fy = y0 + (118*S - fs)//2
    img.paste(head_square(HEAD, fs), (64*S, fy)); d = ImageDraw.Draw(img)
    d.rectangle([64*S, fy, 64*S + fs, fy + fs], outline=R, width=S)
    d.text((64*S + fs + 16*S, fy + 2*S), 'Paul Baker', font=sans24b, fill=I)
    d.text((64*S + fs + 16*S, fy + 2*S + 30*S), 'Buy-side corporate development',
           font=sans20, fill=M)
    t = 'SWIPE'; x = W - 64*S - tw(d, t, mono22, .08*22*S) - 40*S
    x = tracked(d, (x, y0 + (118*S - 22*S)//2), t, mono22, A, .08*22*S)
    arrow(d, x + 14*S, y0 + 118*S//2, A)
    return img

def closer(total, pricing):
    """THE CLOSER — the second and last field surface. Both column tracks are
    FIXED: colR was flex:1 and could not shrink below its children, so it
    rendered 410 wide and pushed the portrait 50px past the margin onto a
    different right edge than the page number. 520 + 52 + 380 = 952 exactly."""
    img = Image.new('RGB', (W, H), T['field']); d = ImageDraw.Draw(img)
    Lx = 64*S
    y = wrap(d, Lx, 64*S + 8*S, 520*S, 'Pick the engagement. We’ll bring the function.',
             serif72, int(72*1.04*S), T['fInk'])
    y += 42*S
    # Core — field level, ghost outline, so its x MAY carry the accent
    ph = 118*S
    d.rectangle([Lx, y, Lx + 520*S, y + ph], outline=T['border'], width=S)
    bx = Lx + 26*S
    for ch, c in (('smb', T['fInk']), ('x', T['onField']), (' Dev', T['fInk'])):
        d.text((bx, y + 24*S), ch, font=sans32b, fill=c); bx += d.textlength(ch, font=sans32b)
    wrap(d, Lx + 26*S, y + 24*S + 42*S, 468*S, 'Takes you thesis to close.',
         sans24, int(24*1.35*S), T['fSub'])
    y += ph + 18*S
    # Dev Pro — RAISED (plate fill + rim), so the accent is barred: its x is
    # #FFF3F0 because #FF7D55 on #964046 is 2.67:1 (§3.4.3)
    ph2 = 190*S
    d.rectangle([Lx, y, Lx + 520*S, y + ph2], fill=T['plate'], outline=T['rim'], width=S)
    tracked(d, (Lx + 26*S, y + 24*S), 'THE PART MOST ADVISORS SKIP', mono20, T['fInk'], .12*20*S)
    bx = Lx + 26*S; by = y + 24*S + 30*S
    for ch in ('smb', 'x', ' Dev Pro'):
        d.text((bx, by), ch, font=sans32b, fill=T['fInk']); bx += d.textlength(ch, font=sans32b)
    wrap(d, Lx + 26*S, by + 42*S, 468*S, 'Stays through the first hundred days and beyond.',
         sans24, int(24*1.35*S), T['fSub'])
    y += ph2 + 36*S
    para = 'One senior operator, on your side of the table' + \
           (', at a price you already know.' if pricing else '.')
    y = wrap(d, Lx, y, 520*S, para, sans40, int(40*1.32*S), T['fSub']) + 36*S
    # THE BUTTON LAW — bone fill, ink label, the one sanctioned 6px radius
    d.rounded_rectangle([Lx, y, Lx + 520*S, y + 84*S], radius=6*S, fill=T['ground'])
    tracked(d, (Lx + 30*S, y + (84*S - 24*S)//2), 'BOOK A CALL — SMBX.AI',
            mono24b, T['ink'], .08*24*S)
    arrow(d, Lx + 520*S - 30*S - 26*S, y + 84*S//2, T['ink'])
    y += 84*S + 26*S
    wrap(d, Lx, y, 520*S,
         '150 acquisitions. $5B+ enterprise value added. Zero sell-side deals. Ever.',
         mono22n, int(22*1.5*S), T['fMut'])
    lw = 199*S; lg = LOGO_B.resize((lw, int(LOGO_B.size[1]*lw/LOGO_B.size[0])), Image.LANCZOS)
    img.paste(lg, (Lx, H - 56*S - lg.size[1]), lg); d = ImageDraw.Draw(img)
    # portrait — phi-rect 380x616 (1200x1944 = 1:1.620, the whole photograph).
    # The offset plate reaches x1034 and the bottom-right handle x1024, both
    # outside the 1016 margin: that is what an offset plate and a -8 handle
    # ARE. The PHOTO is the content and the photo aligns. Do not "fix" them.
    fx, fy = W - 64*S - 380*S, 64*S + 222*S
    d.rectangle([fx + 18*S, fy + 18*S, fx + 18*S + 380*S, fy + 18*S + 616*S], fill=T['well'])
    _p = PORT.resize((380*S, int(PORT.size[1]*380*S/PORT.size[0])), Image.LANCZOS)
    _off = int((_p.size[1] - 616*S) * 0.20)
    port = _p.crop((0, _off, 380*S, _off + 616*S))
    img.paste(port, (fx, fy)); d = ImageDraw.Draw(img)
    d.rectangle([fx, fy, fx + 380*S, fy + 616*S], outline=T['rim'], width=S)
    hs = 16*S
    for hx, hy in ((fx - 8*S, fy - 8*S), (fx + 380*S - 8*S, fy + 616*S - 8*S)):
        d.rectangle([hx, hy, hx + hs, hy + hs], fill=T['ink'])
    d.text((fx, fy + 616*S + 34*S), 'Paul Baker', font=sans26b, fill=T['fInk'])
    d.text((fx, fy + 616*S + 34*S + 36*S), 'Buy-side corporate development',
           font=sans22, fill=T['fMut'])
    t = f'{total} / {total}'
    tracked(d, (W - 64*S - tw(d, t, mono22, .1*22*S), H - 56*S - 22*S),
            t, mono22, T['fMut'], .1*22*S)
    return img

# ── the copy, canon-corrected (see the module docstring) ───────────────────
P2 = dict(top='THE PROBLEM',
    hl='Building corp dev in-house is a year and a million dollars.',
    lede='Most buyers do not have a corporate development function. Standing one up is '
         'the expensive way to find that out.',
    rows=['**A standing team is a fixed cost** attached to an occasional activity — and it '
          'sits idle between deals.',
          '**A year to hire and ramp** before the first deal gets worked.',
          '**Most banks are built for the sell side.** A buy-side search is a different job.'],
    kind='dash',
    note='Targets under $250M revenue. Buy-side only — THE LINE, smb{x} practice perimeter.')
P3 = dict(top='THE ENGAGEMENT', hl='smb{x} Dev',
    lede='Thesis to close. The whole buy-side function, run for you.',
    rows=['**Thesis** — what to buy, and whether it is buyable today.',
          '**Sourcing** — the owners who are not looking to sell, reached under your name.',
          '**Valuation** — financials rebuilt, every adjustment tested, surprises found early.',
          '**Structure & offer** — terms a lender will back. We write it and we negotiate it.',
          '**Diligence & close** — where deals come apart. Every thread held to signing.'],
    kind='num', gap=21,
    note='One buyer per target. Never the sell side — it is in the engagement letter.')
P4 = dict(top='THE UPGRADE', hl='smb{x} Dev Pro',
    lede='Everything above. Then the part most advisors skip.',
    rows=['**Integration** — the first hundred days, planned before close. You keep the '
          'people and the customers you just paid for.',
          '**Value creation** — we stay past day 100: the thesis tracked, the levers '
          'pulled, the add-ons sourced.'],
    kind='num', gap=24, start=6,
    note='smb{x} Dev Pro is the same team staying in the deal after the wire clears.')
SCHED = dict(top='THE SCHEDULE',
    hl='Simple, up-front pricing — ~the same for everyone.~',
    lede='Published, so you can decide without another call.',
    rows=[], kind='dash',
    table=[('First $1M', '5%', 0), ('$1M – $5M', '4%', 0), ('$5M – $10M', '3%', 0),
           ('Above $10M', '2%', 0), ('Minimum fee', '$100,000', 1)],
    note='Every term spelled out plainly in the engagement letter. Same schedule for every client.')
TERMS = dict(top='THE TERMS', hl='Nothing to haggle over, ~no surprises at close.~',
    lede=None, list_top=56,
    rows=['**$15,000 a quarter, paid up front** — the first quarter is the engagement. '
          'Step away at any quarter’s end.',
          '**Every retainer dollar is credited** against the success fee at close.',
          '**No cliffs** — each dollar priced in its own band. A $5M deal: $210,000, or 4.2%.',
          '**smb{x} Dev Pro adds no second formula** — the retainer simply continues past close.'],
    kind='dash', note=None)

def build(name, total, pages):
    OUT.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(pages):
        p.save(OUT / f'{name}-p{i+1:02d}.jpg', quality=92, optimize=True)
    pages[0].save(OUT / f'{name}.pdf', save_all=True,
                  append_images=[p.convert('RGB') for p in pages[1:]], resolution=144)
    print(f'  {name}: {total} pages -> {OUT}/{name}.pdf')

def page(spec, pg, total):
    s = dict(spec)
    return body_page(pg, total, s.pop('top'), s.pop('hl'), s.pop('lede'),
                     s.pop('rows'), s.pop('kind'), s.pop('note'), **s)

if __name__ == '__main__':
    if DOC in ('nopricing', 'both'):
        n = 5
        build('smbx-offer', n, [cover(n), page(P2, 2, n), page(P3, 3, n),
                                page(P4, 4, n), closer(n, False)])
    if DOC in ('pricing', 'both'):
        n = 7
        build('smbx-offer-pricing', n, [cover(n), page(P2, 2, n), page(P3, 3, n),
                                        page(P4, 4, n), page(SCHED, 5, n),
                                        page(TERMS, 6, n), closer(n, True)])
