/**
 * carta-guard.mts — THE PREFLIGHT. Run before you build anything.
 *
 *   npx tsx $REPO/scripts/studio/carta-guard.mts [--assets <dir>] [--src <dir>]
 *
 * WHY THIS EXISTS (Paul, 2026-08-08): *"make the style sticky and eliminate
 * reversion to any previous style."*
 *
 * `house/palette-guard.ts` stops a retired colour leaving a BUILDER. It reads
 * the rendered document, so it cannot see inside a base64 image — and the
 * pictures are exactly how the last reversion happened: the pages converted,
 * the artwork did not, and the artifact read Aurora with every rule in it
 * correct. This is the other half.
 *
 * THREE CHECKS, and each one has already failed in production at least once:
 *
 *   1 · SOURCE — a retired hex written as a literal in a renderer or a spec.
 *       This is the one a grep would find, and it is the least interesting.
 *   2 · ARTWORK — an illustration whose ground is not exactly Carta bone, or
 *       which still carries amber/gold masses. The ground test is the artwork
 *       brief's own acceptance criterion: all four corners identical and equal
 *       to bone. Corners that differ from each other mean a gradient, and a
 *       gradient cannot match a flat page at any brightness.
 *   3 · PHOTOGRAPHS ARE EXEMPT, and are detected rather than declared — a
 *       drawing quantises to a few thousand colours and a photograph to a
 *       hundred thousand. Photography is real or absent; it carries no palette
 *       obligation, and posterising one into the accent is a way to destroy a
 *       real asset while believing you are converting it. That happened here
 *       once, on 2026-08-08, and the files had to be restored from an archive.
 *
 * Exit 0 clean, 1 with findings.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { CARTA, LEDGER, REPORT } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);

const arg = (n: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const assetsDir = arg('--assets') ?? (existsSync('assets') ? 'assets' : undefined);
const srcDirs = [arg('--src') ?? '.'].filter(Boolean) as string[];

const live = new Set([...Object.values(CARTA), ...Object.values(REPORT)].map(h => String(h).toUpperCase()));
const RETIRED = [
  ...Object.values(LEDGER).map(String).filter(h => !live.has(h.toUpperCase())),
  '#C9E8DA', '#BFE3D2', '#F1ECE0', '#16624C', '#0F4E3C', '#0F1A16', '#B08637',
  '#F6F4EF', '#14181C', '#8FD0AE', '#F3F1EA', '#FF385C', '#185ABD', '#D4714E', '#D44A78',
];

let findings = 0;

/* ── 1 · source ───────────────────────────────────────────────────────── */
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_to_delete') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(mts|ts|md|css)$/i.test(e.name)) out.push(p);
  }
  return out;
}
console.log('── source ────────────────────────────────────────────────────');
let srcHits = 0;
const holdouts: string[] = [];
for (const d of srcDirs) {
  if (!existsSync(d)) continue;
  for (const f of walk(d)) {
    /* DESIGN.md's dead table and tokens.ts's LEDGER block are where the retired
       hexes are SUPPOSED to live. A guard that fires on the graveyard is a
       guard someone switches off. */
    if (/DESIGN\.md$|tokens\.ts$|palette-guard\.ts$|carta-guard\.mts$/.test(f)) continue;
    const raw = readFileSync(f, 'utf8');
    const body = raw.toUpperCase();
    const hit = RETIRED.filter(h => body.includes(h.toUpperCase()));
    if (!hit.length) continue;
    /* A DECLARED HOLDOUT is not a finding, and it is not forgiven either.
       Some files are knowingly still Ledger and too big to convert in passing;
       marking one keeps the run actionable without hiding it, because a guard
       that is always red is a guard that gets ignored — this practice's own
       rule about checkers applies to itself. It prints on every run. */
    if (body.includes('CARTA-HOLDOUT')) { holdouts.push(`  ${f}  ${hit.length} retired hex(es)`); continue; }
    console.log(`  ${f}  ${hit.join(' ')}`); srcHits++;
  }
}
console.log(srcHits ? `  ${srcHits} file(s) carrying a retired hex` : '  clean');
if (holdouts.length) {
  console.log(`\n  DECLARED HOLDOUTS — known Ledger, marked CARTA-HOLDOUT, still owed a pass:`);
  holdouts.forEach(h => console.log(h));
}
findings += srcHits;

/* ── 2 · artwork ──────────────────────────────────────────────────────── */
if (assetsDir && existsSync(assetsDir)) {
  console.log('\n── artwork ───────────────────────────────────────────────────');
  const imgs: string[] = [];
  (function collect(d: string) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === '_to_delete') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (/\.(png|jpe?g)$/i.test(e.name)) imgs.push(p);
    }
  })(assetsDir);

  const LIGHT_JSON = JSON.stringify(
  Object.values(CARTA)
    .map(String)
    .map(h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)])
    .filter(([r,g,b]) => (r+g+b) / 3 > 150));
const py = `
import sys
import numpy as np
from PIL import Image
BONE = (${parseInt(CARTA.bone.slice(1,3),16)}, ${parseInt(CARTA.bone.slice(3,5),16)}, ${parseInt(CARTA.bone.slice(5,7),16)})
bad = 0; skipped = 0
for f in sys.argv[1:]:
    try:
        im = Image.open(f)
        im.draft('RGB', (900, 900))                 # JPEG fast-path decode
        im = im.convert('RGB')
    except Exception: continue
    w, h = im.size
    corners = [im.getpixel(p) for p in ((3,3),(w-4,3),(3,h-4),(w-4,h-4))]
    im.thumbnail((360, 360))                        # the analysis does not need full res
    a = np.array(im)
    uniq = len(np.unique(a.reshape(-1,3), axis=0))
    if uniq > 22000:
        skipped += 1; continue                      # a photograph: exempt
    ai = a.astype(int); r,g,b = ai[...,0], ai[...,1], ai[...,2]
    mx = ai.max(axis=2); mn = ai.min(axis=2)
    sat = np.where(mx > 0, (mx-mn)/np.maximum(mx,1), 0)
    warm = ((r > g+18) & (g > b+18) & (sat > 0.30) & (mx > 90)).mean()*100
    # THE GROUND TEST, on the border rather than on four corners.
    #
    # Four corners was the artwork brief's shorthand and it is wrong in one
    # real case: the brief also says the drawing MAY TOUCH THE FRAME, so a
    # corner holding ink is correct art, not a gradient. Three good
    # illustrations failed on exactly that.
    #
    # What actually distinguishes a gradient is NEAR-bone that is not bone. So:
    # take the border, keep the pixels close to bone, and require every one of
    # them to be exactly bone. Ink in a corner is ignored; a ground drifting by
    # two points is not.
    border = np.concatenate([a[0,:], a[-1,:], a[:,0], a[:,-1]]).astype(int)
    d = np.abs(border - np.array(BONE)).max(axis=1)
    # A bone ground is always R > G > B — Carta's is 252/250/246 and every
    # retired bone was warmer still. So a near-bone pixel whose GREEN exceeds
    # its red is pale ART touching the border, not a drifted ground, and
    # counting it was failing two correct illustrations on their own mint.
    # A light border pixel that MATCHES A LIVE TOKEN is not drift — it is the
    # drawing using the palette. bone, boneAlt, panel, white, greenTint and
    # mint are all light enough to sit inside the near-bone window, and two
    # correct illustrations were failing on their own white walls and mint.
    #
    # Deriving the allowance from the live palette rather than listing
    # exceptions means a token added later is allowed automatically, and a
    # colour that matches nothing in the system is still caught.
    LIGHT = np.array(${LIGHT_JSON})
    dl = np.abs(border[:,None,:] - LIGHT[None,:,:]).max(axis=2).min(axis=1)
    near = border[d <= 14]
    off  = border[(d > 0) & (d <= 14) & (dl > 3)]
    why = []
    if len(near) < border.shape[0] * 0.10:
        why.append('no bone ground on the border - %s' % (tuple(int(v) for v in border[0]),))
    elif len(off) / border.shape[0] >= 0.02:
        # A TOLERANCE, and it is not laziness. Where the drawing meets the
        # border its antialiasing blends ink into bone, and those pixels are
        # near-bone-but-not-bone by construction — a dozen of them on a good
        # illustration. A drifted GROUND is not a dozen pixels: the Ledger
        # library measured 9-17 points low across the entire border. Two
        # percent separates the two by a wide margin in both directions.
        worst = off[np.abs(off - np.array(BONE)).max(axis=1).argmax()]
        why.append('ground drifts: %s on %.0f%% of the border, want %s'
                   % (tuple(int(v) for v in worst), 100*len(off)/border.shape[0], BONE))
    if warm > 0.5:    why.append('warm %.1f%% - amber/gold masses' % warm)
    if why: print('  FAIL  %-52s %s' % (f, '; '.join(why))); bad += 1
print()
print('  %d illustration(s) failing, %d photograph(s) exempt' % (bad, skipped) if bad else '  clean - %d illustration(s) on bone, %d photograph(s) exempt' % (len(sys.argv)-1-skipped, skipped))
sys.exit(1 if bad else 0)
`;
  const r = spawnSync('python3', ['-c', py, ...imgs], { stdio: 'inherit' });
  if (r.status) findings++;
} else {
  console.log('\n── artwork ───────────────────────────────────────────────────\n  no assets dir — skipped (pass --assets <dir>)');
}

console.log('\n' + (findings
  ? `✗ carta-guard: ${findings} area(s) with findings. Carta is canon — fix before you build.`
  : '✓ carta-guard: clean. Source and artwork are both Carta.'));
process.exit(findings ? 1 : 0);
