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
  /* CARTA / DEAL GREEN — retired 2026-08-22 when OXBLOOD took the CARTA keys.
     These do not fall out of the LEDGER spread above: they were the LIVE
     values until that day, so the guard would have passed them forever. Any
     draft that comes back green reconstructed THIS system. */
  '#0A7A58', '#086348', '#0FA97C', '#A8F0CE', '#DFF5EC', '#0A6A4C',
  '#181818', '#2A2E29', '#22261F', '#4A4F44', '#F4F5F1', '#D7DBD2', '#ABB2AB', '#8A9088',
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
        rgba = im.convert('RGBA')
        im = im.convert('RGB')
    except Exception: continue
    w, h = im.size
    corners = [im.getpixel(p) for p in ((3,3),(w-4,3),(3,h-4),(w-4,h-4))]
    im.thumbnail((360, 360))                        # the analysis does not need full res
    a = np.array(im)
    # A CUTOUT IS JUDGED ON ITS INK, NOT ITS ABSENCE (2026-08-18). Converting
    # RGBA->RGB collapses transparency to literal black, which did two wrong
    # things at once to founder-standing.png: the transparent field's single
    # colour dragged the unique-colour count under the photograph threshold,
    # and the border test then read (0,0,0) as a missing bone ground. A
    # transparent border is not a ground at all - the asset composites onto
    # whatever surface the builder gives it - so for a mostly-transparent
    # image, classify on the OPAQUE pixels only and skip the ground test.
    rgba.thumbnail((360, 360))
    ar = np.array(rgba)
    alpha = ar[..., 3]
    is_cutout = (alpha < 8).mean() > 0.05
    if is_cutout:
        opaque = ar[alpha > 200][:, :3]
        # The absolute 22000 threshold assumes a ~360x360 sample. A tall cutout
        # thumbnails to a sliver (founder-standing: 116x360, ~25k opaque px),
        # so the photograph test must be PROPORTIONAL: resampled photo pixels
        # are nearly all distinct, an illustration's flat fills are not.
        if len(opaque) > 500 and len(np.unique(opaque, axis=0)) / len(opaque) > 0.35:
            skipped += 1; continue                  # a photographic cutout: exempt
        a = None                                    # illustration cutout: warm test only, below
        ai = opaque.astype(int); r,g,b = ai[:,0], ai[:,1], ai[:,2]
        mx = ai.max(axis=1); mn = ai.min(axis=1)
        sat = np.where(mx > 0, (mx-mn)/np.maximum(mx,1), 0)
        # HUE-GATED, NOT MERELY WARM (OXBLOOD, 2026-08-22).
        # The old mask was channel-ORDER only (r>g>b) and so matched the live brand
        # accent #B8431E exactly: it would have PASSED every stale green illustration
        # and REJECTED every correctly converted one. The retired amber/gold this
        # test exists to catch clusters at hue 39-42 (amber #E8A62B 39.0, honey
        # #F5C452 42.0, brass #B08637 39.2); the new accents sit at 14 (#B8431E 14.4,
        # #FF7D55 14.1, #FFAA90 14.1). Inside this mask r is the max and b the min,
        # so hue reduces to 60*(g-b)/(r-b).
        # ACCEPTED COST: terra cotta #D4714E sits at 15.7 and is no longer caught
        # HERE. It stays caught by house/palette-guard.ts, which reads the document
        # rather than the pixels. No hue test separates a retired terracotta from a
        # live burnt orange 1.3 degrees away.
        _hue = 60.0*(g-b)/np.maximum(r-b, 1)
        warm = ((r > g+18) & (g > b+18) & (sat > 0.30) & (mx > 90) & (_hue >= 28) & (_hue <= 62)).mean()*100
        if warm > 0.5:
            print('  FAIL  %-52s warm %.1f%% - amber/gold masses (cutout, ground exempt)' % (f, warm)); bad += 1
        continue
    uniq = len(np.unique(a.reshape(-1,3), axis=0))
    if uniq > 22000:
        skipped += 1; continue                      # a photograph: exempt
    ai = a.astype(int); r,g,b = ai[...,0], ai[...,1], ai[...,2]
    mx = ai.max(axis=2); mn = ai.min(axis=2)
    sat = np.where(mx > 0, (mx-mn)/np.maximum(mx,1), 0)
    # see the hue-gate note above
    _hue = 60.0*(g-b)/np.maximum(r-b, 1)
    warm = ((r > g+18) & (g > b+18) & (sat > 0.30) & (mx > 90) & (_hue >= 28) & (_hue <= 62)).mean()*100
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


/* ── 3 · the builders ─────────────────────────────────────────────────────
 *
 * Added 2026-08-12, after a carousel was rebuilt in the retired design language
 * and this guard reported clean.
 *
 * Checks 1 and 2 read SPEC FILES and IMAGE CORNERS. Neither can see the
 * renderer. So `house/deck.ts` could import LEDGER — as it has in every commit
 * of this repo, `deck.ts` having never once imported CARTA — and a carousel
 * renders entirely in the retired palette while this guard prints "source and
 * artwork are both Carta". It did exactly that.
 *
 * The retired palette is still a live export sitting beside CARTA in tokens.ts.
 * Until it is deleted, the only thing between a build and a reversion is which
 * identifier a builder happens to import. DESIGN.md §2 says a retired hex in a
 * live file is a retired hex a session can copy; a retired PALETTE is worse,
 * because one import line reverts a whole surface.
 */
console.log('\n── builders ──────────────────────────────────────────────────');

const RENDER_PATH = /^(house\/(deck|report|onepager)\.ts|scripts\/studio\/build-[a-z-]+\.mts)$/;
// Match the IDENTIFIER, not an import form. The builders reach for the retired
// palette through `const { LEDGER } = await import(...)`, which a static-import
// pattern cannot see — and a guard that misses two of three builders is worse
// than none, because it prints clean. A render module has no legitimate reason
// to name LEDGER at all; tokens.ts and palette-guard.ts are excluded by path.
const IMPORTS_LEDGER = /\bLEDGER\b/;

const renderFiles = walk(ROOT)
  .map((f: string) => path.relative(ROOT, f).split(path.sep).join('/'))
  .filter((f: string) => RENDER_PATH.test(f))
  .sort();

const reverted = renderFiles.filter((rel: string) =>
  IMPORTS_LEDGER.test(readFileSync(path.join(ROOT, rel), 'utf8')));

if (reverted.length) {
  console.log(`\n  ${reverted.length} of ${renderFiles.length} render module(s) import the RETIRED palette.`);
  console.log('  Anything they build comes out in the old design language:\n');
  for (const r of reverted) console.log(`    ✗ ${r}`);
  console.log('\n  This is not a hex that slipped into copy — it is the renderer itself.');
  console.log('  A spec can pass every check and the artwork can be on-palette, and the');
  console.log('  output is still Ledger. Convert the builder, or delete LEDGER from');
  console.log('  house/tokens.ts so the import cannot resolve.');
  findings++;
} else {
  console.log(`\n  clean - ${renderFiles.length} render module(s), none importing the retired palette`);
}

console.log('\n' + (findings
  ? `✗ carta-guard: ${findings} area(s) with findings. Carta is canon — fix before you build.`
  : '✓ carta-guard: clean. Source, artwork and builders are all Carta.'));
process.exit(findings ? 1 : 0);
