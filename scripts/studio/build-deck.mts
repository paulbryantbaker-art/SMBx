/**
 * Studio deck builder — a house-style LinkedIn carousel from a plain spec,
 * rendered on YOUR computer via Cowork. No SMBX app, no app API key.
 *
 * Why this exists (Paul, 2026-07-22): the app's research pipeline bills the
 * app's ANTHROPIC_API_KEY. This builder runs the SAME house design system
 * (Ledger palette, Newsreader/Inter/Plex, the ink ground, the framed-cover
 * grammar, the rasterized-PDF renderer-proof pass) as pure local compute —
 * a Cowork session composes the spec on your Claude subscription, this script
 * renders it for free. Style lives in the repo; media comes from a folder or
 * a Google-Drive download; the plan is a file. The app is fully bypassed.
 *
 * Usage:
 *   npx tsx scripts/studio/build-deck.mts <spec.deck.mts> [--media <dir>] [--out <dir>]
 *
 * The spec is a small .mts file that `export const deck = {...}` (see
 * scripts/studio/decks/elevator-teardown-1.deck.mts for a worked example and
 * the full field reference). Image paths in the spec resolve against --media,
 * then the spec's own folder, then CWD; absolute paths pass through.
 *
 * Outputs (into --out, default ./out next to CWD): <slug>.pdf (the swipeable
 * carousel), <slug>-pNN.jpg (each page), <slug>-caption.txt (the post copy).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { cartaFontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);
const { assertCarta } = await import(pathToFileURL(path.join(ROOT, 'house/palette-guard.ts')).href);

/* ── house palette (mirrors server/services/researchComposer.ts) ──────── */
/* THE shared definition — see house/tokens.ts. Never hardcode a hex here. */
const { CARTA, CARTA_TYPE, rgba } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = CARTA.ink, BODY = CARTA.body, TERT = CARTA.muted, GREEN = CARTA.green;
const WARM = CARTA.bone, DARK = CARTA.dark, IVORY = CARTA.darkInk, IVORY_SUB = CARTA.darkSub;
const HAIR = CARTA.hair, MINT = CARTA.mint;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;

/* ── CLI args ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) { console.error('Usage: build-deck.mts <spec.deck.mts> [--media <dir>] [--out <dir>]'); process.exit(1); }
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const specPath = path.resolve(specArg);
// LOCAL-FIRST (Paul, 2026-07-22: "move from App to my computer… folders for
// media, assets and collateral"): with no flags, read images from ./media and
// ./assets in the CWD and write outputs to ./collateral — so from a studio
// workspace folder you just run the builder with a spec and it Just Works.
const mediaDir = flag('--media') ? path.resolve(flag('--media')!) : null;
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.resolve('collateral');
mkdirSync(outDir, { recursive: true });

const { deck } = await import(pathToFileURL(specPath).href) as { deck: Deck };

/* ── types (documented in the example spec) ───────────────────────────── */
interface Bar { label: string; sub: string; style: 'ink' | 'green'; h: number }
type Page =
  | { kind: 'numeral'; numeral: string; unit?: string; head: string; body?: string; source?: string }
  | { kind: 'statement'; tag: string; tagColor?: 'green' | 'brass'; head: string; body?: string; source?: string }
  | { kind: 'diagram'; tag: string; head: string; body?: string; source?: string; bars: Bar[]; connector?: string }
  | { kind: 'trade'; name: string; image?: string; imagePos?: string; numeral?: string; unit?: string; head: string; body?: string; source?: string };
interface Deck {
  slug: string;
  kicker: string;                                   // mono header label, e.g. 'MARKET MAP'
  cover: { hook: string; sub?: string; image?: string; imagePos?: string };
  pages: Page[];
  closer: { tag?: string; head: string; body?: string };
  headshot?: string;                                // byline photo; defaults to repo founder-portrait
  caption?: string;                                 // the LinkedIn post text
}

/* ── asset resolution ─────────────────────────────────────────────────── */
const { b64, esc, faceDisc, logoImg } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
// Resolve an image path against, in order: absolute → --media dir → the CWD's
// local media/ and assets/ folders → the spec's own folder → CWD. So a spec
// can just name "tree.png" and drop it in ./media or ./assets.
/* Art that a spec ASKS FOR and the resolver cannot find is a BUILD FAILURE,
   not a warning (2026-08-03, Paul: "let's make sure that is not an issue going
   forward"). It used to warn and carry on, printing a ✓ underneath — so a
   teardown shipped with three trade pages missing their illustrations and the
   build looked clean. A page with no `image` key at all is untouched by this:
   the pest-control page is deliberately text-only and always has been.
   `--allow-missing-art` is the escape hatch for a deliberate dry run. */
const MISSING_ART: string[] = [];
const resolveImg = (p?: string): string | null => {
  if (!p) return null;
  const tries = [
    path.isAbsolute(p) ? p : null,
    mediaDir ? path.join(mediaDir, p) : null,
    path.resolve('media', p),
    path.resolve('assets', p),
    path.join(path.dirname(specPath), p),
    path.resolve(p),
  ].filter(Boolean) as string[];
  const hit = tries.find(t => existsSync(t));
  if (!hit) { MISSING_ART.push(p); console.warn(`[deck] image not found: ${p} (looked in ${tries.join(', ')})`); return null; }
  return b64(hit);
};

const LOGO = b64(path.join(ROOT, 'client/public/logo-green-x.png'));
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'));
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'));
/* Optional: the plaster is OFF by default (see PAPER_VEIL_ALPHA), so a missing
   file must degrade to the site wash rather than kill the render. */
const paperPath = path.join(ROOT, 'client/public/textures/bonebleed.webp');
const PAPER = existsSync(paperPath) ? b64(paperPath) : undefined;
const HEAD = resolveImg(deck.headshot) || b64(path.join(ROOT, 'client/public/founder-portrait.jpg'));
const COVER_IMG = resolveImg(deck.cover.image);

/* NEUTRAL ring, not MINT_RING. A green ring around Paul's face fights the skin
   tones in it — the same reason the emerald ground was retired. Bone-at-alpha
   reads on ink; house/deck.ts overrides it to the warm rule colour on bone. */
/* NO inline ring. Two reasons, both learned the hard way:
   · an inline style beats any stylesheet, so the ring could not be themed;
   · rgba(bone, 0.45) is TRANSLUCENT, so the jade bloom behind the byline strip
     showed straight through and the ring read green anyway — the exact thing
     retiring the emerald ground was meant to stop.
   house/deck.ts sets it, opaque, in CSS. */
const face = (s: number) => faceDisc(HEAD, s, { objectPosition: '50% 22%' });
const total = deck.pages.length + 2; // cover + middles + closer
const kicker = `<div class="kick">${logoImg(LOGO, 30)}<span class="kt">${esc(deck.kicker)}</span></div>`;
const pfoot = (n: number) => `<div class="pfoot">${logoImg(LOGO_W, 34)}<span class="pn">${n} / ${total}</span></div>`;
const ghost = (n: number) => `<div class="ghost">${String(n).padStart(2, '0')}</div>`;

/* ── the document — house grammar, shared with the app (house/deck.ts) ──
   Paul, 2026-07-24: collateral must render the same whether it is built
   here in a Cowork session or by the app. Both call deckDocument(). */
const { deckPages, deckCss } = await import(pathToFileURL(path.join(ROOT, 'house/deck.ts')).href);
const assets = {
  logo: LOGO, logoWhite: LOGO_W, texture: TEXTURE, paperTexture: PAPER,
  headshot: HEAD, coverImage: COVER_IMG, image: resolveImg,
};

/* ── bookend variants (2026-08-01, Paul: "we can have light and dark versions
   of the cover pages") ────────────────────────────────────────────────────
   Both are house, the way the one-pager's dark and light cards are both house.
   The BODY pages are byte-identical between the two — only the first and last
   page change surface — so this is a choice of opening, not a second deck.
   `--bookend dark|light|both` (default both). */
const bookendArg = (flag('--bookend') ?? 'both').toLowerCase();
/* `ink` added 2026-08-06 — a third ground, opt-in by name. It is NOT in
   `both`, because it deviates from DESIGN.md §4 and should never arrive in a
   render nobody asked for. See the note beside `.pg.ink` in house/deck.ts. */
const variants: Array<'dark' | 'light' | 'ink'> =
  bookendArg === 'dark' ? ['dark']
  : bookendArg === 'light' ? ['light']
  : bookendArg === 'ink' ? ['ink']
  : bookendArg === 'all' ? ['dark', 'light', 'ink']
  : ['dark', 'light'];

const page = await newRenderPage();
const made: string[] = [];
try {
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  for (const bookend of variants) {
    /* the dark bookend keeps the bare slug — it is the default post, and
       renaming it would orphan every link already pointing at it */
    const name = bookend === 'dark' ? deck.slug : `${deck.slug}-${bookend}`;
    const html: string[] = deckPages(deck, assets, bookend);
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style>
<style>${deckCss()}</style></head><body>${html.join('')}</body></html>`;
    /* THE PALETTE GUARD. Nothing renders in a retired palette — see
       house/palette-guard.ts. This runs on the document, not the source,
       because that is the only place the question has one answer. */
    assertCarta(doc, `${deck.slug} (${bookend} bookend)`);
    await page.setContent(doc, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    await new Promise(r => setTimeout(r, 150));
    const shots: string[] = [];
    /* OVERFLOW GUARD (2026-08-05). Every content wrap is absolutely positioned
       with a fixed height and centres its children, so copy that is too tall
       does not grow the page — it spills out of BOTH ends, and the first thing
       it hits is the kicker rail. The fee-schedule page shipped its tag
       overlapping the logo and nothing errored. Fixed height means scrollHeight
       tells the truth, so ask it. */
    const spill = await page.evaluate(() => Array.from(
      document.querySelectorAll('.stmtwrap, .statwrap, .diagwrap, .tradewrap, .cv-body, .closewrap'))
      .map((el: any, i) => ({ i, cls: el.className, over: el.scrollHeight - el.clientHeight }))
      .filter(x => x.over > 2));
    if (spill.length) {
      console.error(`\n✗ ${spill.length} page region(s) overflow their box — copy will collide with the page furniture:`);
      for (const x of spill) console.error(`    .${String(x.cls).split(' ')[0]}  +${x.over}px`);
      console.error('  Shorten the copy. The layout is fixed-height by design.\n');
      process.exitCode = 5;
    }

    /* COLLISION GUARD (2026-08-06). The overflow guard above measures whether a
       block fits its box; it cannot see a block that fits perfectly and sits in
       the WRONG PLACE. `.stmtwrap` and `.diagwrap` spanned the full page height
       and centred their children, so a tall page grew in both directions and
       printed its tag straight across the wordmark — exactly the defect the
       overflow guard was written for, arriving by a route it could not detect.
       So measure the geometry that actually matters: does any content region
       overlap the header rail? */
    const collide = await page.evaluate(() => {
      const out: { cls: string; by: number }[] = [];
      document.querySelectorAll('.pg').forEach((pg: any) => {
        const head = pg.querySelector('.kick, .kick2');
        if (!head) return;
        const h = head.getBoundingClientRect();
        pg.querySelectorAll('.stmtwrap, .statwrap, .diagwrap, .tradewrap, .closewrap').forEach((el: any) => {
          const kids = Array.from(el.children) as any[];
          for (const k of kids) {
            const r = k.getBoundingClientRect();
            if (r.height && r.top < h.bottom && r.bottom > h.top) {
              out.push({ cls: el.className.split(' ')[0], by: Math.round(h.bottom - r.top) });
              return;
            }
          }
        });
      });
      return out;
    });
    if (collide.length) {
      console.error(`\n✗ ${collide.length} content region(s) overlap the header lockup:`);
      for (const c of collide) console.error(`    .${c.cls}  intrudes ${c.by}px into the kicker rail`);
      console.error('  The wrap is centred over the whole page. Give it a top offset that clears the header.\n');
      process.exitCode = 8;
    }

    /* FEED ACCEPTANCE CHECKS (COVER-CTA-SPEC.md §8, added 2026-08-06).
       LinkedIn renders a carousel about 400px wide in-feed. Type that reads
       perfectly at 1080 disappears at 400, and the failure is invisible in
       every local preview — you only find it in the feed, after posting. So
       the floors are measured: body ≥30px, mono labels ≥19px, and the hook
       inside the top 62% of the page before the mobile preview crops it. */
    const feed = await page.evaluate(() => {
      const out: string[] = [];
      const cover = document.querySelector('.pg.cover');
      if (cover) {
        const hook = cover.querySelector('.cv-hook') as HTMLElement | null;
        if (hook) {
          const bottom = hook.offsetTop + hook.offsetHeight;
          if (bottom > 1350 * 0.62) out.push(`cover hook ends at ${Math.round(bottom)}px — past the 62% fold (837px)`);
        }
        for (const sel of ['.cv-sub', '.cv-fl', '.cv-now', '.cv-was']) {
          const el = cover.querySelector(sel) as HTMLElement | null;
          if (!el) continue;
          const px = parseFloat(getComputedStyle(el).fontSize);
          const floor = sel === '.cv-sub' ? 30 : 19;
          if (px < floor) out.push(`${sel} is ${px}px — under the ${floor}px feed floor`);
        }
      }
      const close = document.querySelector('.pg.closepg');
      if (close) {
        const bars = close.querySelectorAll('.ct-action').length;
        if (bars > 1) out.push(`${bars} action bars on the closer — the spec allows exactly one`);
      }
      return out;
    });
    if (feed.length) {
      console.error(`\n✗ ${feed.length} feed-legibility failure(s):`);
      for (const f of feed) console.error('    ' + f);
      process.exitCode = 6;
    }

    for (let i = 0; i < html.length; i++) {
      const shot = await page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: i * 1350, width: 1080, height: 1350 } });
      writeFileSync(path.join(outDir, `${name}-p${String(i + 1).padStart(2, '0')}.jpg`), Buffer.from(shot));
      shots.push(`data:image/jpeg;base64,${Buffer.from(shot).toString('base64')}`);
    }
    /* the renderer-proof law: ship a rasterized PDF, not vector — Preview and
       LinkedIn's rasterizer seam the vector gradients */
    const flat = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>* { margin: 0; padding: 0; } html, body { width: 1080px; } img { display: block; width: 1080px; height: 1350px; page-break-after: always; } img:last-child { page-break-after: auto; }</style></head><body>${shots.map(s => `<img src="${s}">`).join('')}</body></html>`;
    await page.setContent(flat, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    writeFileSync(path.join(outDir, `${name}.pdf`), Buffer.from(pdf));
    made.push(`${name}.pdf`);
  }
} finally { await page.close().catch(() => {}); }

if (deck.caption) writeFileSync(path.join(outDir, `${deck.slug}-caption.txt`), deck.caption.trim() + '\n');
console.log(`✓ ${deck.slug}: ${deck.pages.length + 2} pages × ${variants.length} bookend(s) → ${outDir}/${made.join(', ')}${deck.caption ? ' (+ caption)' : ''}`);
console.log(`  media: ${mediaDir || './media, ./assets (local folders)'}  ·  collateral: ${outDir}`);

/* ── the art guard ─────────────────────────────────────────────────────────
   Requested art that did not resolve fails the build. This prints AFTER the
   success line so it is the last thing on screen, and exits 3 so a script
   cannot mistake it for a clean run. */
if (MISSING_ART.length && !args.includes('--allow-missing-art')) {
  const missing = [...new Set(MISSING_ART)];   // both bookends resolve the same file
  console.error(`\n✗ ${missing.length} image(s) the spec asked for could not be found:`);
  missing.forEach(p => console.error(`    ${p}`));
  console.error(`\nThe pages that wanted them rendered WITHOUT art. Nothing above is postable.`);
  console.error(`Put the files where the resolver looks, or remove the image key from the spec.`);
  console.error(`--allow-missing-art overrides this for a deliberate dry run.\n`);
  process.exit(3);
}

process.exit(0);
