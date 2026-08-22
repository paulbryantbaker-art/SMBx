#!/usr/bin/env python3
"""
figure-fallback.py — the figure one-pager WITHOUT Chromium.

  python3 scripts/studio/figure-fallback.py <spec.post.mts> [--out <dir>] [--variant dark|light|both]

WHY THIS EXISTS (2026-08-18). Paul asked for the day-four-questions PNG from a
Cowork sandbox that has no browser — not root, CDNs blocked, arm64 while the
one npm-shippable Chromium is x86-64. The card shipped anyway, hand-rasterised
in PIL from the approved v6 geometry, and he posted it. This file is that
render made repeatable, so the next no-browser session runs a script instead of
re-deriving 200 lines in chat.

ITS PLACE IN THE ORDER — subordinate, and explicitly so:

  1. `build-onepager.mts` is the CANONICAL renderer. On any machine with
     Chromium (Paul's Mac), use it and never this.
  2. This is the EMERGENCY fallback: same spec file, same tokens, same fonts,
     same measured geometry — but a different text engine, so line breaks can
     sit a few px off a Chromium build. Output is postable; it is not the
     archival build. Write BUILD.txt saying which renderer ran (this script
     does it), and let the next Mac build replace the file.
  3. Copy and palette are NEVER duplicated here: the spec is imported live via
     tsx, and the CARTA hexes are read from house/tokens.ts the same way. If
     tokens move, this follows; if this file disagrees with tokens.ts, this
     file is the bug (COLLATERAL_STATE.md §6 law).

GEOMETRY (the sanctioned figure layout — FORMATS.md §2.0, DESIGN.md §6.2):
figure height = card × φ⁻¹ (834/1350) · float top 100px (the APPROVED v6
value — feet land just above the foot hairline; do not "fix" to touching) ·
wrap follows the cutout's alpha at threshold .45 with 30px shape-margin ·
spacing steps 21/34/55 · dark ground carries the sanctioned radial Deal Green
bloom (spec `bloom:false` disables) · CTA bright white on the band, green on
paper · the arrow is DRAWN (line + head), because the mono subset has no →
glyph and the first render shipped a tofu box.

DEPS: pillow, numpy, fonttools, brotli (pip), plus node_modules with tsx and
the @fontsource packages (already repo deps). Fonts are converted woff2→ttf
into .fonts-cache/ beside this script on first run.
"""
import sys, os, json, subprocess, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# ── args ────────────────────────────────────────────────────────────────────
args = sys.argv[1:]
spec_arg = next((a for a in args if not a.startswith('--')), None)
if not spec_arg:
    print(__doc__.split('\n')[2]); sys.exit(64)
spec_path = pathlib.Path(spec_arg).resolve()
def flag(name, default=None):
    return args[args.index(name) + 1] if name in args else default
out_dir = pathlib.Path(flag('--out', 'collateral')).resolve()
variant = flag('--variant', 'both')

# ── the spec and the live tokens, via tsx — never duplicated here ──────────
# (a temp .mts file, not --eval: tsx compiles eval strings as CJS, where
#  top-level await is illegal — found the hard way on first run)
emit = f"""
import {{ pathToFileURL }} from 'node:url';
const s = await import(pathToFileURL({json.dumps(str(spec_path))}).href);
const t = await import(pathToFileURL({json.dumps(str(ROOT / 'house/tokens.ts'))}).href);
console.log(JSON.stringify({{ post: s.post, CARTA: t.CARTA }}));
"""
import tempfile
tsx = ROOT / 'node_modules/tsx/dist/cli.mjs'
if not tsx.exists():
    # tsx is installed --no-save on sandboxes and evaporates on restart —
    # it has now vanished mid-session twice. Self-heal rather than error.
    print('tsx missing — installing (--no-save)…')
    subprocess.run(['npm', 'install', 'tsx', '--no-save', '--prefer-offline'],
                   cwd=str(ROOT), capture_output=True)
    if not tsx.exists():
        print('could not install tsx; run: npm install tsx --no-save'); sys.exit(69)
with tempfile.NamedTemporaryFile('w', suffix='.mts', delete=False) as tf:
    tf.write(emit); emit_path = tf.name
r = subprocess.run(['node', str(tsx), emit_path], capture_output=True, text=True, cwd=str(ROOT))
os.unlink(emit_path)
if r.returncode != 0:
    print('spec/tokens import failed:\n', r.stderr[-800:]); sys.exit(65)
data = json.loads(r.stdout.strip().split('\n')[-1])
post, CARTA = data['post'], data['CARTA']

if post.get('layout') == 'split' or (post.get('image') and not post.get('layout')):
    print('this spec is a SPLIT layout — the fallback renders only the figure layout.')
    print('Use build-onepager.mts on a machine with Chromium.'); sys.exit(66)

# ── fonts: woff2 → ttf cache ────────────────────────────────────────────────
CACHE = HERE / '.fonts-cache'; CACHE.mkdir(exist_ok=True)
FONT_SRC = {
    'serif-var.ttf': 'node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2',
    'sans-400.ttf': 'node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-400-normal.woff2',
    'sans-600.ttf': 'node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-600-normal.woff2',
    'sans-700.ttf': 'node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-700-normal.woff2',
    'mono-400.ttf': 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
    'mono-600.ttf': 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2',
}
from fontTools.ttLib import TTFont
for dst, src in FONT_SRC.items():
    if not (CACHE / dst).exists():
        f = TTFont(str(ROOT / src)); f.flavor = None; f.save(str(CACHE / dst))

from PIL import Image, ImageDraw, ImageFont
import numpy as np

def hx(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

# ── asset resolution (the builder's order, studio-root-first) ──────────────
def resolve(p, *extra):
    if not p: return None
    for base in [pathlib.Path(p) if os.path.isabs(p) else None,
                 pathlib.Path('media') / p, pathlib.Path('assets') / p,
                 spec_path.parent / p, ROOT / 'client/public' / p, pathlib.Path(p), *[
                 pathlib.Path(e) / p for e in extra]]:
        if base and base.exists(): return base
    return None

fig_path = resolve(post.get('figure') or 'brand/founder-standing.png')
if not fig_path:
    print(f"figure cutout missing: {post.get('figure') or 'brand/founder-standing.png'}")
    print('run from the STUDIO ROOT so ./assets resolves.'); sys.exit(1)
head_path = resolve(post.get('headshot')) or ROOT / 'client/public/founder-headshot.jpg'

S = 2; W, H = 1080 * S, 1350 * S
FIG = Image.open(fig_path).convert('RGBA')
fh = 834 * S; fw = int(FIG.size[0] * fh / FIG.size[1])
FIG = FIG.resize((fw, fh), Image.LANCZOS)
ALPHA = np.array(FIG)[:, :, 3]

def F(name, size, axes=None):
    f = ImageFont.truetype(str(CACHE / name), size)
    if axes:
        try: f.set_variation_by_axes(axes)
        except Exception: pass
    return f

def render(dark: bool) -> Image.Image:
    if dark:
        BG, SEAM, PLATE = hx(CARTA['dark']), hx(CARTA['darkSeam']), hx(CARTA['darkPlate'])
        INK, SUB, MUT = hx(CARTA['darkInk']), hx(CARTA['darkSub']), hx(CARTA['darkMuted'])
        ACC, CTA = hx(CARTA['mint']), hx(CARTA['white'])
    else:
        BG, SEAM, PLATE = hx(CARTA['bone']), hx(CARTA['hair']), hx(CARTA['panel'])
        INK, SUB, MUT = hx(CARTA['ink']), hx(CARTA['body']), hx(CARTA['muted'])
        ACC = CTA = hx(CARTA['green'])
    GREEN = hx(CARTA['green'])

    img = Image.new('RGB', (W, H), BG)
    # THE C TREATMENT (Paul, 2026-08-18, picked from a four-step board:
    # as-posted / aimed bloom / +exposure lift / +rim). The first posted card
    # read too dark — a figure in black trousers on the band, lit by an
    # ambient bloom centred somewhere south-west of him. C aims the bloom AT
    # the figure's torso and lifts the figure's own exposure 16%; the rim
    # light (D) was considered and not chosen. `pop: false` in a spec returns
    # the original ambient numbers with no lift.
    pop = dark and post.get('pop') is not False
    flow_y_c = (46 + 52) * S + max(30 * S, int(17 * S * 1.4)) + 55 * S
    figy_c = flow_y_c + 100 * S
    figx_c = (46 + 56) * S + (W - 2 * 46 * S - 56 * S * 2) - fw
    if dark and post.get('bloom') is not False:
        if pop:
            bcx, bcy = figx_c + fw * 0.5, figy_c + fh * 0.45
            rx, ry, A = 600 * S, 860 * S, 0.52
        else:
            bcx, bcy, rx, ry, A = 0.76 * W, 0.58 * H, 760 * S, 980 * S, 0.34
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.sqrt(((xx - bcx) / rx) ** 2 + ((yy - bcy) / ry) ** 2)
        a = np.where(d < 0.42, A - (d / 0.42) * (A * 0.59),
                     np.where(d < 0.85, A * 0.41 * (1 - (d - 0.42) / 0.43), 0))
        img = Image.fromarray((np.array(img, float) * (1 - a[..., None]) + np.array(GREEN, float) * a[..., None]).astype('uint8'))
    d0 = ImageDraw.Draw(img)

    serif = F('serif-var.ttf', 80 * S, [545])
    sans4b, sans4s = F('sans-400.ttf', 25 * S), F('sans-400.ttf', 22 * S)
    sans6, sans7, sans4t = F('sans-600.ttf', 22 * S), F('sans-700.ttf', 22 * S), F('sans-400.ttf', 16 * S)
    mono4, mono6k = F('mono-400.ttf', 14 * S), F('mono-600.ttf', 17 * S)
    mono6n, mono6c = F('mono-600.ttf', 15 * S), F('mono-600.ttf', 20 * S)

    def tracked(pos, text, font, fill, ls):
        x, y = pos
        for ch in text:
            d0.text((x, y), ch, font=font, fill=fill); x += d0.textlength(ch, font=font) + ls
        return x

    inset = 46 * S; padl, padt, padb = 56 * S, 52 * S, 44 * S
    cx0, cy0 = inset + padl, inset + padt
    cw = W - 2 * inset - padl - 56 * S
    sq = 8 * S
    d0.rectangle([cx0, cy0 + 10 * S, cx0 + sq, cy0 + 10 * S + sq], fill=ACC)
    tracked((cx0 + sq + 13 * S, cy0 + 4 * S), (post.get('kicker') or '').upper(), mono6k, ACC, 0.16 * 17 * S)
    logo = Image.open(ROOT / ('client/public/logo-green-x-dark.png' if dark else 'client/public/logo-green-x.png')).convert('RGBA')
    lh_ = 30 * S; lw = int(logo.size[0] * lh_ / logo.size[1])
    img.paste(logo.resize((lw, lh_), Image.LANCZOS), (cx0 + cw - lw, cy0), logo.resize((lw, lh_), Image.LANCZOS))
    flow_y = cy0 + max(30 * S, int(17 * S * 1.4)) + 55 * S
    foot_top = H - inset - padb - 92 * S
    figx, figy = cx0 + cw - fw, flow_y + 100 * S
    fig_v = FIG
    if pop:
        # The lift lives in the RENDERER, never in the asset: founder-standing.png
        # stays untouched so light grounds don't inherit an exposure they don't
        # need. 1.16 brightness / 1.05 contrast — the C numbers.
        from PIL import ImageEnhance
        r_, g_, b_, al_ = FIG.split()
        rgb_ = ImageEnhance.Contrast(ImageEnhance.Brightness(Image.merge('RGB', (r_, g_, b_))).enhance(1.16)).enhance(1.05)
        r2_, g2_, b2_ = rgb_.split()
        fig_v = Image.merge('RGBA', (r2_, g2_, b2_, al_))
    img.paste(fig_v, (figx, figy), fig_v)
    d0 = ImageDraw.Draw(img)

    margin = 30 * S
    def rlimit(y0, y1):
        ys0, ys1 = max(0, y0 - figy), min(fh, y1 - figy)
        if ys1 <= ys0: return cx0 + cw
        cols = np.where((ALPHA[ys0:ys1] > 115).any(axis=0))[0]
        return cx0 + cw if len(cols) == 0 else figx + int(cols.min()) - margin

    def flow(text, font, y, size, lhm, fill, x0=None, bold='', boldf=None, boldfill=None):
        x0 = x0 or cx0
        words = (bold + ' ' + text).split() if bold else text.split()
        bn = len(bold.split()) if bold else 0
        lp = int(size * lhm); lines = []; cur = []; curw = 0; i = 0
        while i < len(words):
            f = boldf if i < bn else font
            wl = d0.textlength(words[i] + ' ', font=f)
            lim = rlimit(int(y + len(lines) * lp), int(y + (len(lines) + 1) * lp)) - x0
            if curw + wl > lim and cur: lines.append(cur); cur = []; curw = 0
            else: cur.append((words[i], f, (boldfill or INK) if i < bn else fill)); curw += wl; i += 1
        if cur: lines.append(cur)
        for ln in lines:
            x = x0
            for w, f, c in ln:
                d0.text((x, y), w, font=f, fill=c); x += d0.textlength(w + ' ', font=f)
            y += lp
        return y

    y = flow(post['hook'], serif, flow_y, 80 * S, 1.05, INK)
    y += 55 * S - int(80 * S * 0.05)
    if post.get('body'):
        y = flow(post['body'], sans4b, y, 25 * S, 1.55, SUB); y += 34 * S
    d0.rectangle([cx0, y, cx0 + 72 * S, y + 5 * S], fill=ACC); y += 5 * S + 34 * S
    for i, pt in enumerate(post.get('points') or []):
        ch = 34 * S
        d0.rectangle([cx0, y + 4 * S, cx0 + ch, y + 4 * S + ch], fill=PLATE, outline=SEAM, width=S)
        nw = d0.textlength(str(i + 1), font=mono6n)
        d0.text((cx0 + (ch - nw) / 2, y + 4 * S + (ch - 15 * S * 1.2) / 2), str(i + 1), font=mono6n, fill=ACC)
        y2 = flow(pt['v'], sans4s, y, 22 * S, 1.55, SUB, x0=cx0 + ch + 18 * S, bold=pt['k'], boldf=sans6)
        y = max(y2, y + 4 * S + ch) + 34 * S - int(22 * S * 0.55)
    if post.get('note'):
        y = flow(post['note'], mono4, y, 14 * S, 1.6, MUT)

    d0.line([cx0, foot_top, cx0 + cw, foot_top], fill=SEAM, width=S)
    fy = foot_top + 21 * S
    face = Image.open(head_path).convert('RGB'); fs = 56 * S
    face = face.resize((fs, int(face.size[1] * fs / face.size[0])), Image.LANCZOS).crop((0, int(fs * 0.283), fs, int(fs * 0.283) + fs))
    mask = Image.new('L', (fs, fs), 0); ImageDraw.Draw(mask).ellipse([0, 0, fs, fs], fill=255)
    ring = Image.new('RGB', (fs + 6 * S, fs + 6 * S), PLATE)
    rmask = Image.new('L', (fs + 6 * S, fs + 6 * S), 0); ImageDraw.Draw(rmask).ellipse([0, 0, fs + 6 * S, fs + 6 * S], fill=255)
    img.paste(ring, (cx0, fy), rmask); img.paste(face, (cx0 + 3 * S, fy + 3 * S), mask)
    d0 = ImageDraw.Draw(img)
    byl = post.get('byline') or {}
    d0.text((cx0 + fs + 22 * S, fy + 2 * S), byl.get('name', 'Paul Baker'), font=sans7, fill=INK)
    d0.text((cx0 + fs + 22 * S, fy + 2 * S + 28 * S), byl.get('title', 'Buy-side corporate development'), font=sans4t, fill=MUT)
    cta_text = (post.get('cta') or 'smbx.ai').replace('→', '').strip()
    ls = 0.05 * 20 * S
    tw = sum(d0.textlength(c, font=mono6c) + ls for c in cta_text)
    aw, gap = 26 * S, 12 * S
    x = tracked((cx0 + cw - (tw + gap + aw), fy + 14 * S), cta_text, mono6c, CTA, ls)
    ay = fy + 14 * S + int(20 * S * 0.55); x0a = x + gap
    d0.line([x0a, ay, x0a + aw - 7 * S, ay], fill=CTA, width=2 * S)
    d0.polygon([(x0a + aw, ay), (x0a + aw - 8 * S, ay - 5 * S), (x0a + aw - 8 * S, ay + 5 * S)], fill=CTA)

    d0.rectangle([inset, inset, W - inset, H - inset], outline=SEAM, width=S)
    hs = 8 * S
    for hxp in (inset - hs // 2, W - inset - hs // 2):
        for hyp in (inset - hs // 2, H - inset - hs // 2):
            d0.rectangle([hxp, hyp, hxp + hs, hyp + hs], fill=INK)
    return img

out_dir.mkdir(parents=True, exist_ok=True)
wanted = ['dark', 'light'] if variant == 'both' else [variant]
for v in wanted:
    p = out_dir / f"{post['slug']}-{v}.png"
    render(v == 'dark').save(p, optimize=True)
    print(f"  ✓ {p}")
if post.get('caption'):
    (out_dir / f"{post['slug']}-caption.txt").write_text(post['caption'].strip() + '\n')
    print(f"  ✓ {out_dir / (post['slug'] + '-caption.txt')}")
(out_dir / 'BUILD.txt').write_text(
    f"built      FALLBACK PIL RASTER (no Chromium) — figure-fallback.py\n"
    f"spec       {spec_path}\n"
    f"note       Postable; NOT the canonical build. Re-render with\n"
    f"           build-onepager.mts on a machine with Chromium to replace.\n")
print("  · BUILD.txt marks this a fallback render — the Mac build replaces it.")
