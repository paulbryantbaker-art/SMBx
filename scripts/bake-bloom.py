#!/usr/bin/env python3
"""Bake the desktop hero bloom into pixels (2026-08-03).

Same lesson as the retired fold-gradient bake, same physics: browsers do
not dither CSS gradients, and a shallow jade-on-bone alpha ramp quantizes
into visible contour rings on a large bright monitor (Paul: "you can see
where the band lines are in the bloom instead of a clean fade"). Baking
puts triangular-PDF dither INTO the alpha channel; pixels render
identically everywhere.

Two analytic quartic bumps replace the two CSS radials — (1 - t²)² falls
off with ZERO slope at its edge, so there is no stop corner for the eye to
Mach-band against (the fold saga's other lesson).

Output: client/public/textures/bloom-jade.webp — RGBA, LOSSLESS (the fold
taught us lossy smooths the dither back into bands; the dither IS the
payload). The CSS stretches it 100%/100% over the glow box, so the ellipse
geometry here is normalized to the box, not to pixels.
"""
from PIL import Image
import random
random.seed(11)

W, H = 1280, 860
JADE = (15, 169, 124)  # LEDGER.jade — the highlight token, ambient-only

# (cx, cy, rx, ry, peak alpha) in box-normalized coordinates, mirroring the
# CSS radials this replaces: core at the bar, wide field beneath.
BUMPS = [
    (0.50, 0.27, 0.52, 0.34, 0.16),
    (0.50, 0.32, 0.80, 0.60, 0.085),
]

def smoothstep(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def edge(u: float, w: float = 0.12) -> float:
    """Fade to zero inside the outer `w` of the unit interval — the wide
    ellipse overruns the image bounds, and a clipped nonzero alpha at the
    border rendered as a faint straight line across the page (seen in the
    first bake's render). The window kills the edge without touching the
    interior."""
    return smoothstep(u / w) * smoothstep((1 - u) / w)

im = Image.new('RGBA', (W, H))
px = im.load()
for y in range(H):
    ny = y / (H - 1)
    for x in range(W):
        nx = x / (W - 1)
        a = 0.0
        for cx, cy, rx, ry, peak in BUMPS:
            t2 = ((nx - cx) / rx) ** 2 + ((ny - cy) / ry) ** 2
            if t2 < 1.0:
                b = peak * (1.0 - t2) ** 2
                a = a + b - a * b  # over-composite of same-color layers
        a *= edge(nx) * edge(ny)
        # Triangular-PDF dither on the ALPHA ramp — ±~1 quantization level,
        # which is exactly the amplitude of the rings it erases.
        n = (random.random() + random.random() - 1.0) * 1.0
        av = max(0, min(255, round(a * 255 + n)))
        px[x, y] = (*JADE, av)

im.save('client/public/textures/bloom-jade.webp', lossless=True, quality=100, method=6)
print('baked', im.size)
