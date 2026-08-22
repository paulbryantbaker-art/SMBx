#!/usr/bin/env python3
"""
figure-prep.py — condition a cutout so it can carry a card.

  python3 scripts/studio/figure-prep.py <cutout.png> [--out <dir>]
         [--sheet]            contact sheet of the variants on the field
         [--variant b|c|d|e]  write one corrected PNG (default e)
         [--wb 0..1] [--sat f] [--clarity f]

Paul, 2026-08-22: *"these are the best images, so we'll have to experiment
until i can get better shots."* So this is a measuring tool, not a filter —
every move below is derived from the file's own numbers and printed, and the
variants are rendered ON THE OXBLOOD FIELD, because a cutout only has to look
right where it actually ships.

WHAT THE MEASUREMENTS SAID ABOUT `Image.png` (1226×1626), and why the steps
are these steps:

  MATTE IS FINE — 64% opaque, 2% edge, 335 strongly-coloured halo pixels out
  of 21k edge pixels. Nothing here needs eroding or decontaminating, which is
  worth stating because that is where retouching usually starts and it would
  have cost the hair edge for nothing.

  THE SKIN IS COOL. The face patch measures R:G:B = 106:91:96 — normalised
  1.00 : 0.86 : 0.91. Daylight skin runs about 1.00 : 0.80 : 0.68, so BLUE is
  far too high and green slightly high: a blue-magenta cast from open shade.
  This is the defect that reads as "washed out" — not exposure.

  CONTRAST IS LOW, NOT VEILED. The black point is already at 14/255, so there
  is no additive haze to subtract; what is missing is the TOP — p98 sits at
  ~190 where a lit subject should reach into the 230s. Pulling the white point
  is the move; lifting the black point would only crush the suit.

  SATURATION IS LOW (mean 0.155). Some of that is the cast; the rest is the
  camera. Restore after white balance, never before — correcting a cast on a
  saturated image bends the hues that were right.

ROUND 2 (same session) — THREE DEFECTS THE FIRST SHEET MADE VISIBLE, each
measured rather than eyeballed:

  A WHITE FRINGE, and it is background, not light. Edge pixels (alpha 10-250)
  average RGB 159/161/165 — near-neutral bright, the colour of sky, and
  nothing like the skin or the suit they border. Straight alpha, so the fix is
  the unmix: C_fg = (C_obs − (1−α)·C_bg) / α. `--decon 0..1`.

  A GLOWING RIM, and this half IS real light. Walking inward from the
  boundary, mean luminance runs 158 · 154 · 151 · 148 · 144 · 142 against a
  core of 107 — a genuine backlit rim, not an artifact. It is only a problem
  because a cut-out edge turns rim light into a halo against the field, so
  `--rim` TAPERS it toward the interior rather than removing it. Default 0.55;
  at 1.0 he looks pasted on.

  THE EAR IS LIT THROUGH. Sun behind, so the ear is genuinely translucent red
  — real, and it reads as an error on a business document, and saturation
  makes it worse. `--ear` desaturates only pixels where R exceeds both other
  channels by a wide margin, inside the head band.

ORDER MATTERS AND IT IS: decontaminate → white balance → white point →
saturation → clarity, with the rim taper and the ear applied on the mask.
Every step is measured against the alpha mask only, so the transparent field
never drags an average around.

`--wb` is a STRENGTH, 0 to 1, because a full correction to a textbook skin
ratio also neutralises the genuinely blue light in the shade side of the face,
which is real and should not be erased. 0.65 is the default for that reason.
"""
import sys, pathlib
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

args = sys.argv[1:]
def flag(n, d=None):
    return args[args.index(n) + 1] if n in args else d
SRC = pathlib.Path(next(a for a in args if not a.startswith('--'))).resolve()
OUT = pathlib.Path(flag('--out', '.')).resolve()
WB = float(flag('--wb', 0.65)); SAT = float(flag('--sat', 1.22))
CLARITY = float(flag('--clarity', 0.35))
DECON = float(flag('--decon', 1.0)); RIM = float(flag('--rim', 0.55))
EAR = float(flag('--ear', 0.85))
FIELD = (138, 43, 50)          # OXBLOOD #8A2B32 — where these actually ship
SKIN = (1.00, 0.80, 0.68)      # daylight skin, normalised on R

im = Image.open(SRC).convert('RGBA')
a = np.array(im).astype(float)
al = a[..., 3]; m = al > 250

def stats(arr, label):
    v = [arr[..., i][m] for i in range(3)]
    print(f'  {label:<12} p2 {[int(np.percentile(c,2)) for c in v]}  '
          f'p50 {[int(np.percentile(c,50)) for c in v]}  '
          f'p98 {[int(np.percentile(c,98)) for c in v]}')

def face_patch(arr):
    """The head sits in the upper third; sample its middle. Measured against
    a patch rather than the whole subject because a grey-world balance over a
    grey suit says the image is already neutral — it is the SKIN that carries
    the cast."""
    h, w = arr.shape[:2]
    ys, xs = np.where(m)
    y0, y1 = ys.min(), ys.max(); x0, x1 = xs.min(), xs.max()
    ph = y0 + int((y1 - y0) * 0.09), y0 + int((y1 - y0) * 0.26)
    pw = x0 + int((x1 - x0) * 0.22), x0 + int((x1 - x0) * 0.55)
    p = arr[ph[0]:ph[1], pw[0]:pw[1], :3].reshape(-1, 3)
    return p.mean(0)

def erode(mask, k):
    cur = mask.copy()
    for _ in range(k):
        e = cur.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            e &= np.roll(cur, (dy,dx), axis=(0,1))
        cur = e
    return cur

print(f'{SRC.name}  {im.size}  opaque {100*m.mean():.0f}%')
stats(a, 'source')

# ── 0a · DECONTAMINATE THE ALPHA EDGE ──────────────────────────────────────
if DECON:
    e = (al > 10) & (al < 250)
    bg = np.percentile(a[..., :3][al < 60], 75, axis=0) if (al < 60).sum() > 100 else None
    bg = np.array([235., 236., 240.])   # measured: edge mean 159/161/165 at a=146
    A = (al[e] / 255.0)[:, None]
    obs = a[..., :3][e]
    fg = np.clip((obs - (1 - A) * bg) / np.maximum(A, 0.15), 0, 255)
    out = a[..., :3].copy(); out[e] = obs + (fg - obs) * DECON
    a[..., :3] = out
    print(f'  decontaminated {e.sum()} edge px against bg {bg.astype(int)} (strength {DECON})')

# ── 0c · THE EAR — real translucency, wrong for a document ─────────────────
if EAR:
    ys, xs = np.where(m); y0, y1 = ys.min(), ys.max()
    band = np.zeros_like(m); band[y0:y0 + int((y1-y0)*0.30), :] = True
    r, g, b_ = a[...,0], a[...,1], a[...,2]
    hot = band & m & (r - np.maximum(g, b_) > 42)
    if hot.sum():
        grey = 0.5*g[hot] + 0.5*b_[hot]
        a[...,0][hot] = r[hot] + (grey*1.18 - r[hot]) * EAR
        print(f'  ear: {hot.sum()} lit-through px pulled toward skin (strength {EAR})')
    else:
        print('  ear: nothing above threshold')
fp = face_patch(a)
norm = fp / fp[0]
print(f'  face R:G:B  {fp.round(0)}  normalised {norm.round(3)}  (daylight skin {SKIN})')

# ── 1 · WHITE BALANCE, at strength WB ──────────────────────────────────────
gain = np.array([1.0, SKIN[1]/norm[1], SKIN[2]/norm[2]])
gain = 1.0 + (gain - 1.0) * WB
print(f'  wb gain (strength {WB})  {gain.round(3)}')
b = a.copy(); b[..., :3] = np.clip(a[..., :3] * gain, 0, 255)

# ── 2 · WHITE POINT — pull the top, leave the black point alone ────────────
hi = np.percentile(b[..., :3][m], 98)
scale = 235.0 / hi
print(f'  white point p98 {hi:.0f} -> 235 (gain {scale:.3f}); black point left alone')
c = b.copy(); c[..., :3] = np.clip(b[..., :3] * scale, 0, 255)

def to_img(arr):
    return Image.fromarray(arr.astype('uint8'), 'RGBA')

def taper_rim(img, strength=RIM):
    """TAPER THE RIM — and this runs LAST, which is the whole lesson.

    The first cut tapered before the white point, and the 1.335x exposure gain
    simply undid it: measured after, the opaque rings read 139 · 160 · 177 ·
    185 INWARD against a core of 136 — brighter than the source's 158 · 154 ·
    151 · 148. A correction applied before a global gain is not a correction.

    The rim itself is REAL light (sun behind him), so this pulls it toward the
    interior rather than deleting it; at strength 1.0 he reads pasted on."""
    if not strength: return img
    q = np.array(img).astype(float); alq = q[..., 3]; mq = alq > 250
    lum = 0.2126*q[...,0] + 0.7152*q[...,1] + 0.0722*q[...,2]
    core = erode(mq, 7)
    target = np.percentile(lum[core], 60) if core.sum() > 100 else lum[mq].mean()
    cur = mq.copy(); rings = []
    for _ in range(4):
        nxt = erode(cur, 1); rings.append(cur & ~nxt); cur = nxt
    for k, ring in enumerate(rings):
        w = strength * (1 - k / len(rings))
        f = np.where(lum[ring] > target,
                     1 - w * np.clip((lum[ring] - target) / 90.0, 0, 1), 1.0)
        for i in range(3):
            ch = q[..., i]; ch[ring] = np.clip(ch[ring] * f, 0, 255)
    # THE ALPHA EDGE ITSELF, which the ring taper cannot reach. Rings are
    # opaque pixels; the outline that survived two rounds lives in the
    # SEMI-TRANSPARENT band, and the exposure gain had lifted it further than
    # the source. A cut edge may not be brighter than the body it belongs to,
    # so it is clamped to the interior rather than scaled — a scale leaves the
    # brightest pixels brightest, which is exactly what reads as an outline.
    eq = (alq > 10) & (alq <= 250)
    if eq.any():
        cap = target * 1.10
        over = lum[eq] > cap
        if over.any():
            fac = np.ones(eq.sum()); fac[over] = cap / lum[eq][over]
            for i in range(3):
                ch = q[..., i]; v = ch[eq]; v *= fac; ch[eq] = np.clip(v, 0, 255)
    return Image.fromarray(q.astype('uint8'), 'RGBA')

def sat_and_clarity(arr, sat, clarity):
    img = to_img(arr)
    rgb = Image.merge('RGB', img.split()[:3])
    if sat != 1.0:
        rgb = ImageEnhance.Color(rgb).enhance(sat)
    if clarity:
        # large-radius unsharp = local contrast, not edge sharpening. A small
        # radius on a face finds beard and pores and looks digital.
        blur = rgb.filter(ImageFilter.GaussianBlur(radius=max(2, min(img.size)//60)))
        rgb = Image.blend(blur, rgb, 1 + clarity)
    return Image.merge('RGBA', (*rgb.split(), img.split()[3]))

V = {
 'a': ('source', im),
 'b': ('white balance', taper_rim(to_img(b))),
 'c': ('+ white point', taper_rim(to_img(c))),
 'd': ('+ saturation', taper_rim(sat_and_clarity(c, SAT, 0))),
 'e': ('+ clarity', taper_rim(sat_and_clarity(c, SAT, CLARITY))),
}
print(f'  rim tapered AFTER the gain (strength {RIM})')
stats(np.array(V['e'][1]).astype(float), 'variant e')
fp2 = face_patch(np.array(V['e'][1]).astype(float))
print(f'  face after  {fp2.round(0)}  normalised {(fp2/fp2[0]).round(3)}')

OUT.mkdir(parents=True, exist_ok=True)
if '--sheet' in args:
    th = 620; pad = 18
    tiles = []
    for k in 'abcde':
        lab, img = V[k]
        g = Image.new('RGB', img.size, FIELD); g.paste(img, (0, 0), img)
        g.thumbnail((10000, th)); tiles.append((k.upper() + ' · ' + lab, g))
    Wd = sum(t.width for _, t in tiles) + pad * (len(tiles) + 1)
    sheet = Image.new('RGB', (Wd, th + 56), (252, 250, 246))
    from PIL import ImageDraw, ImageFont
    f = ImageFont.truetype(str(pathlib.Path(__file__).parent/'.fonts-cache/mono-500.ttf'), 20)
    d = ImageDraw.Draw(sheet); x = pad
    for lab, t in tiles:
        sheet.paste(t, (x, pad)); d.text((x, th + 26), lab, font=f, fill=(26, 26, 26))
        x += t.width + pad
    sheet.save(OUT / 'figure-variants.png')
    print(f'  sheet -> {OUT}/figure-variants.png')
else:
    k = flag('--variant', 'e')
    V[k][1].save(OUT / f'{SRC.stem}-prepped.png')
    print(f'  variant {k} -> {OUT}/{SRC.stem}-prepped.png')
