/**
 * art-prompt.mts — THE ART BRIEF, PRINTED FROM THE TOKENS. And the measurement
 * that says whether the library obeyed it.
 *
 *   npx tsx $REPO/scripts/studio/art-prompt.mts "<subject sentence>"
 *   npx tsx $REPO/scripts/studio/art-prompt.mts "<subject>" --slot carousel-trade
 *   npx tsx $REPO/scripts/studio/art-prompt.mts "<subject>" --size 1700x520
 *   npx tsx $REPO/scripts/studio/art-prompt.mts --slots
 *   npx tsx $REPO/scripts/studio/art-prompt.mts --check assets/trades
 *
 * WHY THIS EXISTS. DESIGN.md §8: *"The prompt is part of the palette."* A model
 * told "on-brand" invents a brand, and a prompt with a hex typed into it is a
 * palette written down in two places — which is a palette that will disagree
 * with itself. It already did: the library was generated from a block naming a
 * retired bone and asking for a "warm off-white", and `trades/homes.png`
 * measures nine, eleven and seventeen points short of the page it sits on.
 *
 * So every colour below is READ FROM `house/tokens.ts` at run time. There is
 * not one hex literal in this file, and there must never be. A retired hex
 * quoted in a live file is a retired hex a session can copy — DESIGN.md §2 is
 * the one graveyard, and this script's whole job is to make copying from
 * anywhere else unnecessary.
 *
 * TWO MODES.
 *
 *   PRINT — the paste-ready block goes to STDOUT and nothing else does, so
 *   `art-prompt.mts "..." | pbcopy` puts exactly the model's input on the
 *   clipboard. Notes, slot facts and the filing reminder go to STDERR.
 *
 *   --check — the acceptance test, because generated art is accepted BY
 *   MEASUREMENT, NOT BY EYE. The brief demands a uniform flat background to all
 *   four edges, so the four corners are where a drift shows: a warm ground, a
 *   dark ground, or corners that disagree with each other, which means the
 *   model put a gradient behind the drawing and no brightness bandage can ever
 *   match it to a flat page.
 *
 * THE PIXEL WORK IS carta-guard.mts's, DELIBERATELY. Same python3 + PIL +
 * numpy pass, same 360px thumbnail, same colour-count photograph exemption at
 * 22,000 uniques — `assets/mep/` is photography, photography carries no palette
 * obligation, and posterising a real asset into the accent is how files had to
 * be restored from an archive once already. One notion of "is this a drawing"
 * in the codebase, not two that will disagree in a year.
 *
 * WHAT IT DOES NOT DO. It does not scan the whole image for amber masses or
 * retired hexes — that is carta-guard, run it too. This measures the ground.
 *
 * Exit 0 clean · 1 drift found (--check only) · 2 could not run.
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const tokens: any = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const { CARTA } = tokens;

/* `ARTWORK_LIFT` is the brightness bandage on the old library. DESIGN.md §8
   names it; this tree does not export it. Read it if it is there, say nothing
   if it is not — a script that hard-requires a constant it only wants to
   comment on is a script that stops working for no reason. */
const ARTWORK_LIFT: number | undefined =
  typeof tokens.ARTWORK_LIFT === 'number' ? tokens.ARTWORK_LIFT : undefined;

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16),
];
const trip = (hex: string) => rgb(hex).join(', ');

/* ── the argument surface ─────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const has = (n: string) => argv.includes(n);

/**
 * THE SLOTS, from FORMATS.md §4. Every one of these is a real box in a real
 * builder, and `object-fit: cover` crops the overflow FROM THE CENTRE — which
 * is why a square image in a tall slot loses over half its width, and why the
 * composition line has to name which side carries the empty background.
 *
 * `gen` is stated only where a rule file states it: 2048 square for library
 * art, 2752 × 1536 for a report cover. The rest ask for a RATIO, because
 * Gemini emits standard ratios and inventing a pixel size here would be
 * inventing a prompt requirement.
 */
const SLOTS: Record<string, {
  label: string; box: string; ratio: string; ask: string;
  gen?: string; margin: string; extra?: string; note?: string;
}> = {
  library: {
    label: 'house library — assets/trades, assets/concept',
    box: 'square, used at every size',
    ratio: '1:1',
    ask: 'square',
    gen: '2048 × 2048',
    margin: 'on all four sides',
  },
  'carousel-cover': {
    label: 'carousel cover panel · build-deck.mts',
    box: '476 × 1102 px',
    ratio: '0.43 (≈3:7)',
    ask: '9:16 portrait',
    margin: 'to the LEFT and RIGHT',
  },
  'carousel-trade': {
    label: 'carousel `trade` page · build-deck.mts',
    box: '404 × 604 px',
    ratio: '0.67 (2:3)',
    ask: '3:4 portrait',
    margin: 'to the LEFT and RIGHT',
  },
  'onepager-photo': {
    label: 'one-pager photo column · build-onepager.mts',
    box: '470 × 1350 px',
    ratio: '0.35 (≈1:2.9)',
    ask: '9:16 portrait',
    margin: 'to the LEFT and RIGHT',
  },
  'report-cover': {
    label: 'report cover hero · build-report.mts',
    box: '5.84 × 2.05 in',
    ratio: '2.85:1',
    ask: '16:9 landscape',
    gen: '2752 × 1536',
    margin: 'at the TOP and BOTTOM',
    extra: 'Weight the subject to the lower two thirds and leave the upper third clear for a title overlay.',
  },
  'report-band': {
    label: 'report `accent:` band · build-report.mts',
    box: '1700 × 520 px (3.27:1) into a 7.0 × 2.2 in box (3.18:1)',
    ratio: '3.27:1',
    ask: '16:9 landscape',
    margin: 'at the TOP and BOTTOM',
    note:
      'A band is COMPOSED, not pointed at a raw square: bone canvas, the illustration at\n' +
      `  full band height sitting right of centre, a short Deal Green ${CARTA.green} rule anchoring\n` +
      '  the left third. Export 1700 × 520 JPEG at q88 — about 45KB, against 4–5MB for a raw PNG.',
  },
};
const ALIAS: Record<string, string> = {
  square: 'library', asset: 'library', trades: 'library', concept: 'library',
  cover: 'carousel-cover', carousel: 'carousel-cover', 'carousel cover': 'carousel-cover',
  trade: 'carousel-trade', 'carousel trade': 'carousel-trade',
  onepager: 'onepager-photo', 'one-pager': 'onepager-photo', post: 'onepager-photo',
  hero: 'report-cover', 'report cover': 'report-cover',
  band: 'report-band', accent: 'report-band', 'report band': 'report-band',
};

function usage(): never {
  console.error(`art-prompt.mts — the house art brief, printed from house/tokens.ts

  npx tsx art-prompt.mts "<subject sentence>" [--slot <kind>] [--size WxH]
  npx tsx art-prompt.mts --slots
  npx tsx art-prompt.mts --check <dir>

The subject sentence is one concrete sentence and goes first:
  "A <subject>, <arrangement>, <one or two identifying details>."`);
  process.exit(2);
}

/* ── --slots ──────────────────────────────────────────────────────────── */
if (has('--slots') || has('--list')) {
  console.log('slot kinds — FORMATS.md §4\n');
  for (const [k, s] of Object.entries(SLOTS)) {
    console.log(`  ${k.padEnd(16)} ${s.box.padEnd(34)} ask ${s.ask}`);
    console.log(`  ${''.padEnd(16)} ${s.label}\n`);
  }
  process.exit(0);
}

/* ─────────────────────────────────────────────────────────────────────────
   PRINT MODE
   ───────────────────────────────────────────────────────────────────────── */
function composition(): { line: string; note?: string; head: string } {
  const size = flag('--size');
  if (size) {
    const m = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(size.trim());
    if (!m) { console.error(`  --size wants WxH, e.g. 1700x520 — got "${size}"`); process.exit(2); }
    const w = +m[1], h = +m[2];
    const r = w / h;
    const margin = r > 1.05 ? 'at the TOP and BOTTOM' : r < 0.95 ? 'to the LEFT and RIGHT' : 'on all four sides';
    const shape = r > 1.05 ? 'landscape' : r < 0.95 ? 'portrait' : 'square';
    return {
      head: `custom · ${w} × ${h} px · ${r.toFixed(2)}:1`,
      line: `${shape.charAt(0).toUpperCase() + shape.slice(1)}, ${w} × ${h}. The image is cropped from the centre to fill its slot, so keep the ` +
            `subject centred with generous empty background ${margin}; nothing important within 8% of any edge.`,
    };
  }
  const raw = (flag('--slot') ?? 'library').toLowerCase();
  const key = SLOTS[raw] ? raw : ALIAS[raw];
  if (!key) {
    console.error(`  unknown slot "${raw}". Known: ${Object.keys(SLOTS).join(', ')} (and the FORMATS.md names).`);
    process.exit(2);
  }
  const s = SLOTS[key];
  const gen = s.gen ? `, ${s.gen}` : '';
  const crop = key === 'library'
    ? `Centred with generous negative space ${s.margin}; nothing important within 8% of any edge.`
    : `The art is cropped FROM THE CENTRE into a ${s.box} slot (${s.ratio}), so keep the subject ` +
      `centred with generous empty background ${s.margin}; nothing important within 8% of any edge.`;
  return {
    head: `${key} · ${s.label} · ${s.box} · ask ${s.ask}`,
    line: `${s.ask.charAt(0).toUpperCase() + s.ask.slice(1)}${gen}. ${crop}${s.extra ? ' ' + s.extra : ''}`,
    note: s.note,
  };
}

function printBrief(subject: string) {
  const c = composition();

  /* THE BLOCK. Every requirement below is in a rule file, and nothing that is
     not in one is here:
       · palette + "no amber, no gold, no brass"  FORMATS.md §4.1, DESIGN.md §8
       · flat editorial illustration, not photoreal / 3D / stock   FORMATS §4.1
       · ban text, lettering, numbers, people, faces, logos, charts, graphs  §4.1
       · ban vignette, edge fade, gradient bg, drop shadow, border, frame   §4.1
       · uniform flat background to all four edges                          §4.1
       · state the aspect ratio, name the composition margin                §4.1
       · white for highlight surfaces only              assets/GEMINI_PALETTE.md
     The colours are token reads, so a palette move moves the prompt. */
  const block = [
    subject.trim().replace(/\s+/g, ' '),
    '',
    `PALETTE, STRICT. Flat solid background exactly ${CARTA.bone} (${trip(CARTA.bone)}) with no gradient,`,
    `vignette, texture, border or drop shadow. Bright green ${CARTA.greenBright} for the main masses. Deep`,
    `green ${CARTA.green} for shading. Near-black ${CARTA.ink} for linework. Pure white ${CARTA.white} only for`,
    'highlight surfaces — window glass, a van panel. NO amber, no gold, no brass, no warm',
    'accent of any kind. Use no other colours: no additional greens, no greys, no',
    'off-whites, no blues, no skin tones.',
    '',
    'STYLE. Flat editorial vector illustration, isometric 3/4 view, clean geometric',
    'shapes, even weight linework, matte. Not photorealistic, not 3D, not stock-photo.',
    'No lighting, no gradients, no shading within shapes, no ambient occlusion, no cast',
    'shadows, no gloss.',
    '',
    'NOTHING IN THE FRAME. No text, no lettering, no numbers, no people, no faces, no',
    'logos, no charts, no graphs.',
    '',
    `BACKGROUND. A single uniform fill to all four edges, exactly ${CARTA.bone}. The drawing may`,
    'touch the frame; the background behind it must never vary — no vignette, no edge',
    'fade, no gradient background, no drop shadow, no border, no frame, no darkening at',
    'the corners.',
    '',
    'COMPOSITION. ' + c.line,
  ].join('\n');

  /* stdout is the model's input and nothing else. */
  console.log(block);

  /* stderr is for the human. */
  const err = console.error;
  err('');
  err('── art-prompt ────────────────────────────────────────────────────');
  err(`  palette   house/tokens.ts CARTA — bone ${CARTA.bone} · green ${CARTA.green} · bright ${CARTA.greenBright} · ink ${CARTA.ink}`);
  err(`  slot      ${c.head}`);
  if (c.note) err(`  note      ${c.note.replace(/\n\s*/g, '\n            ')}`);
  if (subject.trim().split(/\s+/).length < 6) {
    err('  subject   thin. One sentence, concrete nouns: "A <subject>, <arrangement>,');
    err('            <one or two identifying details>." Concrete beats evocative every time —');
    err('            "the feeling of home comfort" gets you a mood board.');
  }
  err('');
  err('  Photography is real or absent. This block is for ILLUSTRATION — assets/trades and');
  err('  assets/concept. Never generate a photograph, and never a photo of Paul.');
  err('');
  err('  When it comes back:');
  err('    1 · accept it by MEASUREMENT, not by eye —');
  err('        npx tsx $REPO/scripts/studio/art-prompt.mts --check <dir>');
  err('    2 · file the prompt in assets/PROMPTS.md and a row in assets/INDEX.md. An image');
  err('        does not land in assets/ without its prompt landing there.');
  err('    3 · name the file for what it SHOWS, in the right subfolder.');
  err('');
}

/* ─────────────────────────────────────────────────────────────────────────
   --check MODE
   ───────────────────────────────────────────────────────────────────────── */
function check(dirArg: string | undefined): never {
  const dir = dirArg ?? (existsSync('assets') ? 'assets' : undefined);
  if (!dir || !existsSync(dir)) {
    console.error('  --check wants a directory of images (default ./assets, which is not here).');
    process.exit(2);
  }
  const imgs: string[] = [];
  const st = statSync(dir);
  if (st.isFile()) imgs.push(dir);
  else (function collect(d: string) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === '_to_delete') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (/\.(png|jpe?g)$/i.test(e.name)) imgs.push(p);
    }
  })(dir);
  if (!imgs.length) { console.error(`  no png/jpg under ${dir} — nothing to measure.`); process.exit(2); }

  /* The live palette, handed to python as data. A corner that lands on a DARK
     live token is the drawing touching the frame — which the brief explicitly
     permits — not a drifted ground. carta-guard learned this the expensive
     way: three good illustrations failed a naive corner test on their own ink.
     Deriving the allowance from the tokens means a colour added later is
     allowed automatically, and a colour that matches nothing is still caught. */
  const DARK_TOKENS = JSON.stringify(
    Object.values(CARTA).map(String).map(rgb).filter(([r, g, b]) => (r + g + b) / 3 <= 150));

  const py = `
import sys, os
try:
    import numpy as np
    from PIL import Image
except Exception as e:
    sys.stderr.write('  need python3 with numpy + Pillow (same as carta-guard): %s\\n' % e)
    sys.exit(2)

BONE = (${rgb(CARTA.bone).join(', ')})
DARK = ${DARK_TOKENS}
NEAR = 24          # a light ground within 24 of bone is a DRIFTED ground, not art
TOKEN_TOL = 12     # within 12 of a dark live token: the drawing, touching the frame
SPREAD = 2         # corners disagreeing by more than this = a gradient

def classify(c):
    # A TRANSPARENT CORNER IS NOT A GROUND. Reading the RGB under a cut-out
    # would report whatever the editor left there and call it a pass or a
    # failure at random. A transparent PNG has nothing to mismatch — the page
    # runs behind the drawing on bone and on ink alike — so it is exempt, and
    # said out loud rather than silently counted as bone.
    if len(c) > 3 and c[3] < 250: return 'clear', 0
    d = max(abs(int(c[i]) - BONE[i]) for i in range(3))
    if d == 0: return 'bone', d
    if d <= NEAR: return 'drift', d
    for t in DARK:
        if max(abs(int(c[i]) - t[i]) for i in range(3)) <= TOKEN_TOL: return 'art', d
    return 'off', d

rows = []; photos = []; broken = []
for f in sys.argv[1:]:
    try:
        raw = Image.open(f)
        raw.draft('RGB', (900, 900))                    # JPEG fast-path decode
        alpha = raw.mode in ('RGBA', 'LA') or 'transparency' in raw.info
        px = raw.convert('RGBA') if alpha else raw.convert('RGB')
        im = raw.convert('RGB')
    except Exception:
        broken.append(f); continue
    w, h = im.size
    corners = [px.getpixel(p) for p in ((3,3),(w-4,3),(3,h-4),(w-4,h-4))]
    small = im.copy(); small.thumbnail((360, 360))
    uniq = len(np.unique(np.array(small).reshape(-1,3), axis=0))
    if uniq > 22000:
        photos.append(f); continue                      # a photograph: exempt

    kinds = [classify(c) for c in corners]
    ground = [c[:3] for c, k in zip(corners, kinds) if k[0] not in ('art', 'clear')]
    art_n  = sum(1 for k in kinds if k[0] == 'art')
    off_n  = sum(1 for k in kinds if k[0] == 'off')
    clear_n = sum(1 for k in kinds if k[0] == 'clear')

    if ground:
        gi = np.array(ground, dtype=int)
        spread = int(max(gi.max(axis=0) - gi.min(axis=0))) if len(ground) > 1 else 0
        mean = gi.mean(axis=0)
        dr, dg, db = (BONE[0]-mean[0], BONE[1]-mean[1], BONE[2]-mean[2])
        dmax = max(abs(int(c[i])-BONE[i]) for c in ground for i in range(3))
    else:
        spread = 0; dr = dg = db = 0.0; dmax = 0

    agree = spread <= SPREAD
    warmth = db - dr          # blue lost harder than red = a warm ground
    dark   = (dr + dg + db) / 3.0

    if clear_n == 4:
        verdict, why = 'on-palette', 'transparent corners - a cut-out has no ground to mismatch'
    elif all(k[0] == 'bone' for k in kinds):
        verdict, why = 'on-palette', 'all four corners exactly bone'
    elif not ground:
        # Every corner is the drawing, which the brief permits. There is no
        # ground to measure here, and saying otherwise would be inventing a
        # result — carta-guard's border test is the one that can still answer.
        verdict, why = 'on-palette', 'no ground at the corners - the drawing fills all four; run carta-guard for the border'
    elif all(k[0] in ('bone','art','clear') for k in kinds):
        bits = []
        if art_n: bits.append('drawing touches %d corner(s)' % art_n)
        if clear_n: bits.append('%d corner(s) transparent' % clear_n)
        verdict, why = 'on-palette', 'ground exactly bone; ' + ', '.join(bits)
    elif not agree or off_n:
        verdict = 'non-uniform'
        why = 'corners disagree by %d - a gradient behind the drawing' % spread
        if off_n: why = 'corner off-palette (%d) - %s' % (off_n, why)
    elif warmth >= 3:
        verdict, why = 'drifted warm', 'blue short by %.0f against red %.0f - a warm ground' % (db, dr)
    elif dark >= 3:
        verdict, why = 'drifted dark', 'ground sits %.0f points below bone' % dark
    else:
        verdict, why = 'drifted', 'ground is not bone (max %d off)' % dmax
    rows.append((verdict, f, corners, (dr, dg, db), dmax, spread, why))

order = {'on-palette':0, 'drifted warm':1, 'drifted dark':2, 'drifted':3, 'non-uniform':4}
rows.sort(key=lambda r: (order.get(r[0], 9), r[1]))

print('  target  bone %s (%d, %d, %d) - house/tokens.ts CARTA.bone' % ('${CARTA.bone}', BONE[0], BONE[1], BONE[2]))
print()
for verdict, f, corners, d, dmax, spread, why in rows:
    mark = 'ok  ' if verdict == 'on-palette' else 'FAIL'
    print('  %s %-13s %s' % (mark, verdict, f))
    print(('       corners  %s' % '  '.join(
        ('clear        ' if len(c) > 3 and c[3] < 250 else '(%3d,%3d,%3d)' % tuple(c[:3])) for c in corners)).rstrip())
    if dmax or spread or verdict != 'on-palette':
        print('       vs bone  R%+.0f G%+.0f B%+.0f   max %d   corner spread %d' % (-d[0], -d[1], -d[2], dmax, spread))
    print('       %s' % why)
    print()

bad = [r for r in rows if r[0] != 'on-palette']
clean = len(rows) - len(bad)
by = {}
for r in bad: by[r[0]] = by.get(r[0], 0) + 1
print('  ' + '-' * 66)
print('  %d illustration(s): %d on-palette, %d drifted%s' % (
    len(rows), clean, len(bad), (' (' + ', '.join('%d %s' % (v, k) for k, v in sorted(by.items())) + ')') if bad else ''))
print('  %d photograph(s) exempt by colour count - photography carries no palette obligation' % len(photos))
for f in photos: print('       exempt  %s' % f)
if broken: print('  %d file(s) unreadable' % len(broken))
if bad:
    gi = np.array([r[3] for r in bad])
    m = gi.mean(axis=0)
    print()
    print('  NEEDS REGENERATING - %d of %d illustration(s), mean ground short of bone by R%.0f G%.0f B%.0f:'
          % (len(bad), len(rows), m[0], m[1], m[2]))
    for r in bad: print('    %s' % r[1])
    print()
    print('  Re-prompt, do not post-process: a gradient cannot match a flat page at any')
    print('  brightness, and a brightness multiply lifts a yellow cast along with everything')
    print('  else. The current block:  npx tsx art-prompt.mts "<subject sentence>"')
sys.exit(1 if bad else 0)
`;
  console.log('── art-prompt --check ────────────────────────────────────────');
  console.log(`  ${imgs.length} image(s) under ${dir}\n`);
  const r = spawnSync('python3', ['-c', py, ...imgs], { stdio: 'inherit' });
  if (r.error || r.status === null) {
    console.error('  could not run python3 — --check needs it, exactly as carta-guard does.');
    process.exit(2);
  }
  if (r.status === 2) process.exit(2);
  if (r.status === 0) console.log('\n✓ art-prompt: no ground drift — every illustration sits on Carta bone.');
  else {
    console.log('\n✗ art-prompt: the ground drifted. Carta is canon — regenerate rather than patch.');
    if (ARTWORK_LIFT !== undefined && ARTWORK_LIFT !== 1) {
      console.log(`  ARTWORK_LIFT is ${ARTWORK_LIFT} — the bandage is on. When the set passes, set it to 1;`);
      console.log('  leaving it up pushes corrected art ABOVE bone and gives the same dingy edge back.');
    }
  }
  process.exit(r.status ? 1 : 0);
}

/* ── dispatch ─────────────────────────────────────────────────────────── */
if (has('--check')) check(flag('--check'));

let subject: string | undefined;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { if (a === '--slot' || a === '--size') i++; continue; }
  subject = a; break;
}
if (!subject) usage();
printBrief(subject);
process.exit(0);
