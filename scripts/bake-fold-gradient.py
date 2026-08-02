#!/usr/bin/env python3
"""Bake the phone fold's gradient into pixels (2026-08-02).

Why an image and not CSS: the fold's gradient was implemented three ways in
CSS (two-stop, multi-stop sRGB, multi-stop oklab) with an SVG-turbulence
dither layer, and every version measured smooth in headless Chromium while
Paul's iPhone showed bands. The variable is the renderer — iOS WebKit's
handling of gradient quantisation and of SVG filters in background images
differs from Chromium's, and no CSS we write controls that. Baking puts the
dither INTO the pixels: float-precision oklab interpolation + triangular-PDF
noise before quantisation. Pixels render identically everywhere.

Output: client/public/textures/fold-gradient.png (also .webp if cwebp exists).
Rerun after changing THE STOPS below; they must stay paired with the plate
colour in practice.css (#2B5F49 — the identity seam).
"""
from PIL import Image
import random
random.seed(7)

W, H = 720, 2400
STOPS = [  # (fraction of height, hex) — mirrors the retired CSS gradient
    (0.00, 'FCFAF6'), (0.13, 'FCFAF6'), (0.34, 'EDF5F0'), (0.56, 'D3E8DC'),
    (0.74, 'A8D2BF'), (0.88, '7FB59E'), (0.96, '4C8168'), (1.00, '2B5F49'),
]

def s2l(c):
    c /= 255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def l2s(c):
    c = max(0.0, min(1.0, c))
    v = 12.92*c if c <= 0.0031308 else 1.055*(c**(1/2.4))-0.055
    return v*255
def rgb2oklab(r, g, b):
    r, g, b = s2l(r), s2l(g), s2l(b)
    l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    l, m, s = l**(1/3), m**(1/3), s**(1/3)
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s,
            1.9779984951*l-2.4285922050*m+0.4505937099*s,
            0.0259040371*l+0.7827717662*m-0.8086757660*s)
def oklab2rgb(L, a, b):
    l = (L+0.3963377774*a+0.2158037573*b)**3
    m = (L-0.1055613458*a-0.0638541728*b)**3
    s = (L-0.0894841775*a-1.2914855480*b)**3
    return (l2s( 4.0767416621*l-3.3077115913*m+0.2309699292*s),
            l2s(-1.2684380046*l+2.6097574011*m-0.3413193965*s),
            l2s(-0.0041960863*l-0.7034186147*m+1.7076147010*s))

labs = [(f, rgb2oklab(*(int(h[i:i+2], 16) for i in (0, 2, 4)))) for f, h in STOPS]
im = Image.new('RGB', (W, H))
px = im.load()
for y in range(H):
    t = y/(H-1)
    for i in range(len(labs)-1):
        f0, c0 = labs[i]; f1, c1 = labs[i+1]
        if f0 <= t <= f1:
            u = 0 if f1 == f0 else (t-f0)/(f1-f0)
            lab = tuple(c0[k]+(c1[k]-c0[k])*u for k in range(3))
            break
    r, g, b = oklab2rgb(*lab)
    for x in range(W):
        # triangular-PDF dither, CORRELATED across channels: luminance-only
        # noise breaks banding just as well and costs half the file size of
        # independent per-channel noise under lossy encoding.
        n = (random.random()+random.random()-1.0)*0.9
        px[x, y] = tuple(int(round(max(0, min(255, v+n)))) for v in (r, g, b))
# LOSSLESS is load-bearing: q90 lossy smoothed the dither back into
# bands (mean run 1px → 14px) and shifted the identity end colour by
# two units. The dither IS the payload; it must survive bit-exact.
im.save('client/public/textures/fold-gradient.webp', lossless=True, quality=100, method=6)
print('baked', im.size)
