/**
 * Re-bone a report illustration onto the CURRENT page canvas (2026-08-01).
 *
 * The `hs-accent-*` illustrations were drawn on the pre-Aurora bone (#F5F4EF).
 * The site's canvas is now #FCFAF6 — seven points lighter. Inside a FRAMED
 * panel that difference is invisible, and the two accent bands already on the
 * landing are framed, so nobody saw it. Place one unframed, which is what a
 * hero image wants, and the mismatch draws a rectangle on the page.
 *
 * Repainting the field is the honest fix: the artwork is unchanged, it is the
 * paper under it that moved. Anything within `TOL` of the old bone is mapped
 * to the new one, and near-misses are blended by distance so an anti-aliased
 * edge does not leave a halo of the old value.
 *
 *   npx tsx scripts/studio/rebone.mts <in.jpg> <out.jpg>
 */
import { execFileSync } from 'node:child_process';
const [, , src, out] = process.argv;
if (!src || !out) { console.error('usage: rebone.mts <in> <out>'); process.exit(1); }
const py = `
from PIL import Image
import sys
OLD=(245,244,239); NEW=(252,250,246); TOL=14.0
im=Image.open(sys.argv[1]).convert('RGB'); px=im.load()
w,h=im.size; n=0
for y in range(h):
    for x in range(w):
        r,g,b=px[x,y]
        d=((r-OLD[0])**2+(g-OLD[1])**2+(b-OLD[2])**2)**0.5
        if d<TOL:
            t=1.0-(d/TOL)               # full swap at the exact value, tapering out
            px[x,y]=(round(r+(NEW[0]-OLD[0])*t), round(g+(NEW[1]-OLD[1])*t), round(b+(NEW[2]-OLD[2])*t))
            n+=1
im.save(sys.argv[2], quality=92)
print(f'  repainted {n} px -> {sys.argv[2].split("/")[-1]}')
`;
execFileSync('python3', ['-c', py, src, out], { stdio: 'inherit' });
