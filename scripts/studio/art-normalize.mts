/**
 * Snap generated artwork ONTO the house palette.
 *
 * WHY THIS HAS TO EXIST. `art-prompt.mts --check` demands an exact background
 * of bone — and a diffusion model cannot deliver an exact flat fill. Measured on
 * a fresh Gemini image built from the corrected prompt: the background improved
 * from rgb(243,239,229) to a mean of rgb(250,248,241), but it still carried 443
 * distinct values across 67% of the frame, and the whole image used 30,846
 * distinct colours. There is no prompt wording that fixes that; approximation is
 * what the model does.
 *
 * So the prompt gets the model CLOSE and this makes it EXACT. Deterministic, in
 * our control, and it removes the last reason for a bandage like ARTWORK_LIFT.
 *
 *   npx tsx scripts/studio/art-normalize.mts in.png [out.png]
 *   npx tsx scripts/studio/art-normalize.mts assets/trades          # whole dir, in place
 *
 * HOW IT SNAPS, and why not harder. Every pixel within TOL of a palette colour
 * becomes that colour exactly. Pixels further away are ANTI-ALIASED EDGES —
 * genuine blends between two shapes — and are left alone, because hard-snapping
 * them would put jaggies on every outline. The background is a palette colour
 * like any other, so it flattens for free; it is simply the case that matters
 * most, being the edge that meets the page.
 *
 * It cannot rescue a wrong hue. If the model painted the van jade where the
 * brief said Deal Green, this makes it *exactly* jade — snapping is a
 * quantiser, not an art director. Read the report it prints.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { LEDGER } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: art-normalize.mts <file.png|dir> [out.png]');
  process.exit(1);
}
const target = path.resolve(args[0]);
if (!existsSync(target)) { console.error(`not found: ${target}`); process.exit(1); }

const files = statSync(target).isDirectory()
  ? readdirSync(target).filter(f => /\.png$/i.test(f)).sort().map(f => path.join(target, f))
  : [target];
const outArg = args[1] ? path.resolve(args[1]) : null;

/* The allowed set. White earns its place: the prompt permits it for highlight
   surfaces (glass, van panels) and without it every highlight snaps to bone. */
const PALETTE: Record<string, string> = {
  bone: LEDGER.bone, green: LEDGER.green, jade: LEDGER.jade,
  brass: LEDGER.brass, ink: LEDGER.ink, white: '#FFFFFF',
};

const py = `
import sys, json, os
from PIL import Image

palette = json.loads(sys.argv[1])
out_override = sys.argv[2] or None
files = sys.argv[3:]
TOL = 46          # RGB euclidean. Below this = a fill; above = an anti-aliased edge.

names = list(palette.keys())
cols  = [tuple(int(palette[n][i:i+2], 16) for i in (1, 3, 5)) for n in names]

for f in files:
    src = Image.open(f)
    # ALPHA IS PRESERVED. A cut-out PNG is the better asset: with no baked
    # background there is nothing to mismatch, and the page bloom simply runs
    # behind the drawing. Snapping must therefore touch RGB only, and must skip
    # transparent pixels entirely -- their RGB is arbitrary garbage that would
    # otherwise be 'corrected' into visible fringing at the edges.
    has_alpha = src.mode in ('RGBA', 'LA') or 'transparency' in src.info
    im = src.convert('RGBA') if has_alpha else src.convert('RGB')
    w, h = im.size
    px = im.load()
    before = im.getpixel((4, 4))
    hits = [0] * len(cols)
    edges = 0
    transparent = 0
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if has_alpha:
                a = p[3]
                if a < 8:
                    transparent += 1
                    continue
                if a < 248:
                    edges += 1      # a soft edge -- leave the blend alone
                    continue
            best, bd = -1, 1e9
            for i, c in enumerate(cols):
                d = (p[0]-c[0])**2 + (p[1]-c[1])**2 + (p[2]-c[2])**2
                if d < bd: bd, best = d, i
            if bd <= TOL * TOL:
                px[x, y] = cols[best] + ((p[3],) if has_alpha else ()); hits[best] += 1
            else:
                edges += 1
    # TRIM THE TRANSPARENT MARGIN. A cut-out arrives with the generous negative
    # space the prompt asked for, and the LAYOUT already provides margin -- so
    # object-fit: contain counts it twice and the drawing renders small and lost.
    # Trim to the alpha bounding box and let the page decide the breathing room.
    trimmed = ''
    if has_alpha:
        bbox = im.getchannel('A').getbbox()
        if bbox and bbox != (0, 0, w, h):
            im = im.crop(bbox)
            trimmed = f'   trim   {w}x{h} -> {im.size[0]}x{im.size[1]}'
    dest = out_override or f
    im.save(dest)
    total = w * h
    fb, db = os.path.basename(f), os.path.basename(dest)
    print(f'{fb}  ->  {db}')
    print(f'   corner {before} -> {im.getpixel((4,4))}')
    for n, c, k in zip(names, cols, hits):
        if k: print(f'   {n:6} {palette[n]}  {k*100/total:5.1f}%')
    print(f'   edges  left blended  {edges*100/total:5.1f}%')
    if transparent: print(f'   alpha  transparent    {transparent*100/total:5.1f}%  (cut-out -- no background to match)')
    if trimmed: print(trimmed)
    print()
`;

const r = spawnSync('python3', ['-c', py, JSON.stringify(PALETTE), outArg || '', ...files],
  { stdio: 'inherit' });
process.exit(r.status ?? 1);
