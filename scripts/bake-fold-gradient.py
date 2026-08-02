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
colour in practice.css (#4C8168 — the identity seam).

THE END COLOUR IS #4C8168, NOT THE BAND'S DARK (2026-08-02, Paul's third
screenshot of the same defect). The fold used to end on #2B5F49 — the band's
own surface — which forced the last 12% of the fold to fall ~86 luminance
levels (4x the slope above it) and then STOP DEAD on the band's flat plate.
A steep zone between a gentle ramp and a plateau reads as exactly what Paul
kept drawing: a dark band across the middle. No colour error, no stop corner
— a slope structure. So the fold now ends on the MID green and the band's
plate carries the remaining #4C8168 → dark descent inside itself over
~260px (see #proof.pd-dark::after in practice.css). The darkening never
stops at the seam; there is no plateau for the eye to edge against.
"""
from PIL import Image
import random
random.seed(7)

W, H = 720, 2400
STOPS = [  # (fraction of height, hex) — the 88% stop is the TEXT FLOOR
    (0.00, 'FCFAF6'), (0.13, 'FCFAF6'), (0.34, 'EDF5F0'), (0.56, 'D3E8DC'),
    (0.74, 'A8D2BF'), (0.88, '7FB59E'), (1.00, '4C8168'),
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

# MONOTONE CUBIC (Fritsch–Carlson) through the anchors, per oklab channel.
# Piecewise-LINEAR interpolation between stops leaves a slope corner at every
# anchor, and the eye Mach-bands each corner into a visible boundary — Paul:
# "smooth above the line, smooth below the line, but a dark band in the
# middle", pointing exactly at the 88%→96% corner where the slope trebled.
# Dither fixes quantisation; only curvature continuity fixes corners. The
# monotone constraint matters as much as the smoothness: an unconstrained
# spline overshoots, and an overshoot below the end colour would reopen the
# seam inversion this fold already died of once.
def monotone_tangents(xs, ys):
    n=len(xs); d=[(ys[i+1]-ys[i])/(xs[i+1]-xs[i]) for i in range(n-1)]
    m=[d[0]]+[0.0]*(n-2)+[d[-1]]
    for i in range(1,n-1):
        m[i]=0.0 if d[i-1]*d[i]<=0 else (d[i-1]+d[i])/2
    for i in range(n-1):
        if d[i]==0: m[i]=m[i+1]=0.0
        else:
            a,b=m[i]/d[i],m[i+1]/d[i]
            h=(a*a+b*b)**0.5
            if h>3: m[i],m[i+1]=3*a/h*d[i],3*b/h*d[i]
    return m
xs=[f for f,_ in labs]
chans=[]
for k in range(3):
    ys=[c[k] for _,c in labs]
    chans.append((ys, monotone_tangents(xs, ys)))
def spline(t):
    i=max(0,min(len(xs)-2, next(j for j in range(len(xs)-1) if t<=xs[j+1] or j==len(xs)-2)))
    h=xs[i+1]-xs[i]; u=(t-xs[i])/h
    h00=2*u**3-3*u**2+1; h10=u**3-2*u**2+u; h01=-2*u**3+3*u**2; h11=u**3-u**2
    out=[]
    for ys,m in chans:
        out.append(h00*ys[i]+h10*h*m[i]+h01*ys[i+1]+h11*h*m[i+1])
    return out
im = Image.new('RGB', (W, H))
px = im.load()
for y in range(H):
    t = y/(H-1)
    lab = spline(t)
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
