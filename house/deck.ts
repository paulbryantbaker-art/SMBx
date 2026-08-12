/**
 * THE house deck grammar — the page templates and CSS for a 1080×1350
 * LinkedIn carousel.
 *
 * Canonical by Paul's call (2026-07-24): "I want collateral to be produced the
 * same as being done in Claude Code now." So the builders you drive from a
 * Cowork session are the reference implementation, and the app conforms to
 * them — not the other way round.
 *
 * Pure by construction: this module does no I/O and knows nothing about where
 * images live. Callers resolve assets (disk for the local CLI, studio_assets
 * for the app) and pass data URIs in. Same spec + same assets → same bytes,
 * wherever it runs.
 */
import { CARTA, CARTA_TYPE, CARTA_DISPLAY_WEIGHT, CARTA_KICKER, CARTA_CONTROL_RADIUS, CARTA_HANDLE, ARTWORK_LIFT, cartaBand, cartaPage, HANDLE_HTML, handleCss, handleColorCss, rgba, major, minor, SPACE } from './tokens.js';
import { esc, rich, faceDisc, logoImg } from './assets.js';
import { inflateSync as zlibInflate } from 'node:zlib';

export interface DeckAssets {
  /** ink wordmark, for light pages */
  logo: string;
  /** white wordmark, for dark pages and footer bands */
  logoWhite: string;
  /** the block texture (blackbleed) */
  texture: string;
  /** light-page paper texture (bonebleed); omit for flat bone */
  paperTexture?: string;
  /** Paul's real headshot — never a stock face (house law) */
  headshot: string;
  /** the cover image, already resolved; null renders the text-only cover */
  coverImage: string | null;
  /** per-page image resolver — returns a data URI or null */
  image: (ref?: string) => string | null;
}

/* Local aliases so the moved template bodies below read unchanged.
   CARTA, 2026-08-08. Two aliases are deliberately GONE rather than repointed:
   BRASS and HONEY. Carta has no warm, so every rule that used one had to be
   re-decided rather than translated — a brass bar becomes a green bar, a honey
   numeral becomes an ink numeral with a green bar under it, and a brass table
   underline becomes an ink one. Leaving the names bound to a near-enough hex is
   how a retired colour survives a palette change. */
const INK = CARTA.ink, BODY = CARTA.body, TERT = CARTA.muted, GREEN = CARTA.green;
const WARM = CARTA.bone, DARK = CARTA.dark, IVORY = CARTA.darkInk, IVORY_SUB = CARTA.darkSub;
const DARK_MUTED = CARTA.darkMuted, SEAM = CARTA.darkSeam, WHITE = CARTA.white;
const HAIR = CARTA.hair, MINT = CARTA.mint;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;
const DW = CARTA_DISPLAY_WEIGHT;

/**
 * A two-beat hook: split at the first sentence break, the turn changes colour.
 * Poster lesson, 2026-07-20. Single-beat hooks pass through unchanged, so a
 * spec written before this existed renders exactly as it did.
 */
function twoToneHook(hook: string): string {
  const m = /^(.*?[.!?…])\s+(.+)$/.exec(String(hook).trim());
  return m ? `${esc(m[1])} <span class="turn">${esc(m[2])}</span>` : esc(hook);
}

/** The page set. Returns one <section class="pg"> string per page. */
export function deckPages(deck: any, a: DeckAssets, bookend: 'dark' | 'light' | 'ink' | 'block' = 'dark'): string[] {
  /* The bookends flip together — a deck with a light cover and a dark closer
     is two decks. bk is applied to both or to neither. */
  /* GROUND NAMES (2026-08-06). Paul: "let's get rid of the dark green emerald
     dark mode… the new dark is much better." So dark now MEANS ink. The jade
     block is still reachable as block for anything that wants it, and it is
     still the body-page foot band and the report cover — this retires it as a
     deck BOOKEND, nothing wider. */
  const BK = bookend === 'light' ? 'light bk-lt' : bookend === 'block' ? 'dark' : 'ink';
  const bkLogo = bookend === 'light' ? 'logo' : 'logoWhite';  // ink takes the white mark too
  const LOGO = a.logo, HEAD = a.headshot, COVER_IMG = a.coverImage;
  /* the block takes the white wordmark; paper takes the ink one */
  const LOGO_W = (a as any)[bkLogo] ?? a.logoWhite;
  const LOGO_FOOT = a.logoWhite; // the light BODY pages keep the dark base band
  const resolveImg = a.image;
  /* NO inline ring — this was the real source of the green circle around Paul's
     face: Deal Green at 0.55 on the light bookend, mint on the dark one, both
     set inline where no stylesheet could reach them, and both TRANSLUCENT so
     the jade bloom behind the byline strip showed through as well. The ring is
     now one opaque neutral in CSS (.facedisc), the same on every ground. */
  const face = (s: number) => faceDisc(HEAD, s, { objectPosition: '50% 22%' });
  const total = deck.pages.length + 2; // cover + middles + closer
  const kicker = `<div class="kick">${logoImg(LOGO, 30)}<span class="kt">${esc(deck.kicker)}</span></div>`;
  const pfoot = (n: number) => `<div class="pfoot">${logoImg(LOGO_FOOT, 34)}<span class="pn">${n} / ${total}</span></div>`;
  const ghost = (n: number) => `<div class="ghost">${String(n).padStart(2, '0')}</div>`;

  /* Bullets — added 2026-08-05. A statement page could previously carry only
     a paragraph, and a paragraph is what made the services deck unreadable
     (Paul: "too verbose… no one is going to read this"). bullets renders the
     same argument as a scannable list. bulletsFrom continues a numbered
     sequence across two pages, which is the visual argument the offering sheet
     makes: Premium is steps 6 and 7 of the same process, not a separate one. */
  const bulletList = (p: any): string => {
    if (!Array.isArray(p.bullets) || !p.bullets.length) return '';
    const numbered = p.bulletsFrom !== undefined;
    const start = numbered ? `style="counter-reset:b ${Number(p.bulletsFrom) - 1}"` : '';
    return `<ul class="blist${numbered ? ' num' : ''}" ${start}>` +
      p.bullets.map((b: string) => `<li>${rich(b)}</li>`).join('') + '</ul>';
  };

  /* A hairline table on a statement page — added 2026-08-05 for the fee
     schedule. DESIGN.md gives amber "report part-rules and TABLE UNDERLINES",
     so the header rule is brass and the row rules are hairline. When a page
     carries both bullets and a table they sit side by side; with a table
     alone it runs full width. */
  const hairTable = (t: any): string => {
    if (!t || !Array.isArray(t.rows) || !t.rows.length) return '';
    const head = Array.isArray(t.head)
      ? `<tr>${t.head.map((h: string) => `<th>${rich(h)}</th>`).join('')}</tr>` : '';
    const rows = t.rows.map((r: string[], i: number) =>
      `<tr${i === t.rows.length - 1 && t.emphasiseLast ? ' class="last"' : ''}>` +
      r.map(c => `<td>${rich(c)}</td>`).join('') + '</tr>').join('');
    return `<table class="htable">${head}${rows}</table>`;
  };

  const html: string[] = [];

  /* ── COVER — rebuilt 2026-08-06 for LinkedIn engagement ────────────────
   * Paul: "make the cover a little more catchy so members will read it."
   * From the 6 Aug design pass (COVER-CTA-SPEC.md), options 1a and 1b.
   *
   * The diagnosis in that spec is the useful part: slide 1 was doing SEVEN
   * jobs — eyebrow, hero figure, headline, tag, three stat cards, footer
   * byline bar, portrait — and LinkedIn renders it about 400px wide in feed,
   * where only the biggest element survives. The rule is now FOUR elements
   * above the fold: one number, one claim, one promise, one identity mark.
   *
   * Dropped from the cover, per that spec §6: the three stat cards (the
   * closer's proof line carries that job now), the full byline bar (a small
   * bottom strip replaces it), and the ghost X (it collides with the aurora
   * and reads as noise at feed size). The spark stays — it is atmosphere, not
   * an element competing for the eye.
   *
   * TWO MODES.
   *   1a — hero figure + struck-through baseline. Needs hero AND heroWas;
   *        a number with no comparison is decoration, which is the spec's own
   *        rule and the reason the mode is gated on both fields.
   *   1b — editorial. Title carries the weight, an optional three-figure row
   *        sits on a ruled line. The documented fallback when there is no
   *        baseline to show. Chosen automatically.
   *
   * GROUND: bone on the light bookend, THE JADE BLOCK on the dark one. The
   * design pass drew its dark options on ink #16181A. DESIGN.md §4 forbids
   * that outright — the retired palette's dark meant the rhythm break and
   * nothing else, "nothing in this system is near-black" — and near-black is the exact
   * complaint that started the Aurora pass. So the ARCHITECTURE is adopted on
   * both surfaces and the ink ground is not. Nothing else about the spec
   * depends on the ground being near-black.
   *
   * Old specs keep working: hook→claim, sub→promise, numeral→hero,
   * numeralLabel→heroWas, stats→figures.
   */
  const cv = deck.cover;
  /* unit IS PART OF THE NUMBER. The old cover format split a hero figure
     across two fields — numeral: '89', unit: '%' — and when the named styles
     landed on 2026-08-06 the compat map picked up numeral and quietly dropped
     unit. The home-services teardown cover published a bare "89" against a
     master that says 89%, and nothing caught it: a figure that loses its unit
     also stops matching FIG_RE, so the audit could not see it either. Dropping
     a unit is the third way a claim gets past the guard — after "no digit" and
     "percentages never matched". Paul, 2026-08-06: "this is supposed to be 89%
     … lets correct the method behind that forgot it." */
  /* THE SAME HOLE, ONE FIELD OVER (found 2026-08-08, rendering the `figure`
     style for the first time since the Carta pass). The fix above attached
     `unit` to `numeral`, and `hero` was left taking `cv.hero` alone — so a spec
     written the natural way, `hero: '89', unit: '%'`, publishes a bare 89
     against a master that says 89%. `unit` is in COVER_KEYS, so the stray-key
     guard passes it; the renderer simply never reads it on this path. Exactly
     the 2026-08-06 failure, in the field that replaced the one it happened in.

     `unit` now applies to whichever figure field is present. Specifying it
     twice — `hero: '89%'` with `unit: '%'` — is an authoring mistake rather
     than a rendering one, so it throws by name instead of printing 89%%. */
  const heroBase = cv.hero ?? cv.numeral;
  if (cv.hero != null && cv.unit && String(cv.hero).endsWith(String(cv.unit))) {
    throw new Error(
      `cover: hero '${cv.hero}' already ends with unit '${cv.unit}'. ` +
      `Give the unit once — either inside hero, or as unit, not both.`);
  }
  const hero      = heroBase != null ? `${heroBase}${cv.unit ?? ''}` : undefined;
  const heroWas   = cv.heroWas   ?? cv.numeralLabel;
  const claim     = cv.claim     ?? cv.hook;
  const promise   = cv.promise   ?? cv.sub;
  const figures   = cv.figures   ?? cv.stats;

  /* THE REAL FIX: a field this renderer does not consume is a HARD ERROR, not
     a silent no-op. That is what turned one dropped unit into published copy.
     Any key added to a spec — or left behind by a rename — now fails the build
     with its own name in the message, instead of rendering something subtly
     wrong that looks deliberate. */
  const COVER_KEYS = new Set([
    'style', 'hero', 'heroNow', 'heroWas', 'claim', 'promise', 'figures',
    'image', 'imagePos', 'imageFit', 'bandImage', 'cta', 'spark',
    'numeral', 'unit', 'numeralLabel', 'hook', 'sub', 'stats',   // legacy aliases
  ]);
  const strays = Object.keys(cv).filter(k => !COVER_KEYS.has(k));
  if (strays.length) {
    throw new Error(
      `cover: ${strays.length} key(s) this renderer does not read: ${strays.join(', ')}.\n` +
      `  Nothing would have rendered them and the build would have looked clean.\n` +
      `  Known keys: ${[...COVER_KEYS].join(', ')}`);
  }
  /* ── COVER STYLES, NAMED (2026-08-06) ──────────────────────────────────
     The design pass shipped them as 1a/1b/1c. Codes do not survive a
     conversation, so they have house names now and the codes stay as aliases:

       figure     (1a) — one hero number with its baseline, one claim. The
                         scroll-stopper. Needs hero AND heroWas; a number
                         without its comparison is decoration.
       masthead   (1b) — editorial. The title carries it, a three-figure row
                         sits on a rule. Optional bandImage runs full-bleed
                         along the foot — PHOTOGRAPH OR ILLUSTRATION, whichever
                         fits the content; it only has to be LANDSCAPE.
       inversion  (1c) — art in a full-height right column behind a green rule,
                         copy left. The one that wants a picture.

     Chosen automatically when style is omitted: art → inversion, hero with a
     baseline → figure, otherwise masthead. */
  const ALIAS: Record<string, string> = { '1a': 'figure', '1b': 'masthead', '1c': 'inversion' };
  const rawStyle  = cv.style ? (ALIAS[cv.style] ?? cv.style) : null;
  const COL_IMG   = cv.image ? resolveImg(cv.image) : null;
  /* IS THE ART A CUT-OUT OR A PHOTOGRAPH? The two cannot share a layout and the
     failure is severe rather than subtle: the cut-out placement lets the drawing
     sit in the type's whitespace, which is invisible when the surround is
     transparent and OBLITERATES THE HEADLINE when it is an opaque rectangle.
     A portrait dropped into the cut-out slot covered half the hook.
     DETECTED, NOT DECLARED. A spec key would be one more thing to remember and
     therefore one more thing to get wrong. PNG stores its colour type in the
     IHDR at byte 25: 4 is grey+alpha, 6 is RGBA. JPEG has no alpha at all. */
  /* MEASURED, NOT DECLARED — and as of 2026-08-08, measured PROPERLY.

     The first version read the PNG colour type out of the IHDR at byte 25 and
     called 4 (grey+alpha) or 6 (RGBA) a cut-out. That is a test for "has an
     alpha CHANNEL", not for "has any transparent PIXELS", and every one of the
     ten illustrations in the studio library is RGBA with an alpha channel that
     is 255 everywhere. So the whole library was being routed into the cut-out
     layout, which seats the drawing in the type's own whitespace — and an
     opaque rectangle there does not read as depth, it prints across the
     headline. Verified by rendering `trades/elevator.png`: the promise line was
     cut off mid-sentence by the picture's baked bone background.

     So: inflate the IDAT, un-filter the scanlines, and count the pixels that
     are actually transparent. `node:zlib` is a built-in, so the module's
     zero-DEPENDENCY promise holds; this is CPU, not I/O.

     Anything the reader cannot handle — interlaced, 16-bit, palette+tRNS —
     falls back to the old colour-type answer rather than guessing, and a spec
     can always override with `cover.imageFit`. */
  const CUTOUT_MIN_TRANSPARENT = 0.02;   // 2% of pixels, i.e. a real silhouette

  const transparentShare = (png: Buffer): number | null => {
    if (png.length < 33 || png.readUInt32BE(12) !== 0x49484452) return null;  // 'IHDR'
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    const depth = png[24], colour = png[25], interlace = png[28];
    if (depth !== 8 || interlace !== 0) return null;
    if (colour !== 6 && colour !== 4) return 0;          // no alpha channel at all
    const bpp = colour === 6 ? 4 : 2;

    const idat: Buffer[] = [];
    for (let p = 8; p + 8 <= png.length; ) {
      const len = png.readUInt32BE(p);
      const type = png.toString('latin1', p + 4, p + 8);
      if (type === 'IDAT') idat.push(png.subarray(p + 8, p + 8 + len));
      else if (type === 'IEND') break;
      p += len + 12;
    }
    if (!idat.length) return null;

    let raw: Buffer;
    try { raw = zlibInflate(Buffer.concat(idat)); } catch { return null; }

    const stride = width * bpp;
    if (raw.length < (stride + 1) * height) return null;

    /* Un-filter in place. Each scanline is prefixed with its filter type and
       is decoded against the ALREADY-DECODED line above it, which is why this
       cannot be sampled — line n is meaningless without lines 0..n-1. */
    const line = Buffer.alloc(stride), prev = Buffer.alloc(stride);
    let clear = 0, at = 0;
    for (let y = 0; y < height; y++) {
      const filter = raw[at++];
      raw.copy(line, 0, at, at + stride); at += stride;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let add = 0;
        if (filter === 1) add = a;
        else if (filter === 2) add = b;
        else if (filter === 3) add = (a + b) >> 1;
        else if (filter === 4) {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          add = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        }
        line[i] = (line[i] + add) & 0xff;
      }
      for (let x = bpp - 1; x < stride; x += bpp) if (line[x] < 8) clear++;
      line.copy(prev);
    }
    return clear / (width * height);
  };

  const hasAlpha = (uri: string): boolean => {
    if (!uri.startsWith('data:image/png')) return false;   // jpeg/webp -> photograph
    const i = uri.indexOf(',');
    if (i < 0) return false;
    let png: Buffer;
    try { png = Buffer.from(uri.slice(i + 1), 'base64'); } catch { return false; }
    const share = transparentShare(png);
    if (share !== null) return share >= CUTOUT_MIN_TRANSPARENT;
    /* Undecodable: fall back to "does it have an alpha channel", the old
       answer, so nothing that worked before starts failing. */
    const colourType = png[25];
    return colourType === 4 || colourType === 6;
  };

  /* `cover.imageFit` is the manual override, and until 2026-08-08 it was a
     KEY THE RENDERER NEVER READ — listed in COVER_KEYS, named in the CSS
     comment below as the thing to set "on a spec that really does carry a
     full-bleed photograph", and wired to nothing. The stray-key guard could not
     catch it: that guard fires on keys it does not KNOW, and this one was
     known and simply unused. It now does what its own documentation says.
       'cover'   -> force the photograph layout (full-height column)
       'contain' -> force the cut-out layout (seated lower-right) */
  const FIT = cv.imageFit;
  if (FIT != null && FIT !== 'cover' && FIT !== 'contain') {
    throw new Error(`cover.imageFit: '${FIT}' is not a value this renderer reads. Use 'cover' (photograph) or 'contain' (cut-out).`);
  }
  const ART_CUTOUT = FIT ? FIT === 'contain' : (COL_IMG ? hasAlpha(COL_IMG) : false);
  const mode      = rawStyle ?? (COL_IMG ? 'inversion' : (hero && heroWas ? 'figure' : 'masthead'));
  /* The bottom portrait band is OPT-IN, via bandImage, and it needs a
     LANDSCAPE photograph. Both founder shots are portrait orientation
     (0.61); cropped to the band's 3.4:1 they show a strip of forehead and
     eyes. Rather than ship a bad crop the cover falls back to spec option
     1a, where the identity mark is the 92px disc in the bottom strip and the
     claim owns the page. Give it a landscape frame and the band returns. */
  const BAND_IMG  = cv.bandImage ? resolveImg(cv.bandImage) : null;

  const heroBlock = (mode !== 'masthead' && hero)
    ? `<div class="cv-hero">
         <div class="cv-figure">${rich(hero)}</div>
         <div class="cv-base">
           <div class="cv-now">${esc(cv.heroNow || 'TODAY')}</div>
           ${heroWas ? `<div class="cv-was">${esc(heroWas).replace(/\n/g, ' ')}</div>` : ''}
         </div>
       </div>
       <div class="cv-bar"></div>`
    : '';

  const figRow = (mode === 'masthead' && Array.isArray(figures) && figures.length)
    ? `<div class="cv-figrow">${figures.slice(0, 3).map((t: any) =>
        `<div class="cv-fig"><div class="cv-fv">${rich(t.value)}</div>` +
        `<div class="cv-fl">${esc(t.label)}</div></div>`).join('')}</div>`
    : '';

  html.push(`<section class="pg ${BK} cover ${mode}${mode === 'inversion' && COL_IMG ? (ART_CUTOUT ? ' artcut' : ' artphoto') : ''}${BAND_IMG && mode === 'masthead' ? ' hasband' : ''}">
    <div class="glaze"></div>
    <div class="pgframe">${HANDLE_HTML}</div>
    ${cv.spark === false ? '' : '<div class="cv-spark"></div>'}
    <div class="cv-left">
      <div class="kick2"><img src="${LOGO_W}" style="height:34px;width:auto;display:block"><span class="kt brass">${esc(deck.kicker)}</span></div>
      <div class="cv-body">
        ${mode === 'inversion' && COL_IMG ? `<img class="cv-wrap" src="${COL_IMG}"${ART_CUTOUT ? '' : ` style="object-position:${cv.imagePos || '50% 30%'}"`}>` : ''}
        ${heroBlock}
        <div class="cv-hook">${twoToneHook(claim)}</div>
        ${heroBlock ? '' : '<div class="cv-rule"></div>'}
        ${promise ? `<div class="cv-sub">${rich(promise)}</div>` : ''}
        ${figRow}
        ${cv.cta ? `<div class="cv-cta">${esc(cv.cta).replace(/\n/g, '<br>')}</div>` : ''}
      </div>
    </div>

    ${mode === 'masthead' && BAND_IMG ? `<div class="cv-band"><img src="${BAND_IMG}" style="width:100%;height:100%;object-fit:cover;object-position:${cv.imagePos || '50% 30%'};display:block"></div>` : ''}
    <div class="cv-strip">
      ${face(92)}
      <div><div class="wn">Paul Baker</div><div class="wt">Buy-side corporate development</div></div>
      <span class="swipe">SWIPE&nbsp;&nbsp;→</span>
    </div>
  </section>`);

  // middles (light, pages 2..total-1)
  deck.pages.forEach((p: any, i: number) => {
    const n = i + 2;
    if (p.kind === 'numeral') {
      html.push(`<section class="pg light">${kicker}${ghost(n)}
        <div class="statwrap">
          <div class="numeral">${esc(p.numeral)}${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}</div>
          <div class="brassbar"></div>
          <div class="stat-h">${esc(p.head)}</div>
          ${p.body ? `<div class="stat-b">${esc(p.body)}</div>` : ''}
        </div>
        ${p.source ? `<div class="baserail"><div class="bl-rule"></div><span class="src">${esc(p.source)}</span></div>` : ''}
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'statement') {
      html.push(`<section class="pg light">${kicker}${ghost(n)}
        <div class="stmtwrap">
          <div class="tag ${p.tagColor === 'brass' ? 'brasstag' : 'green'}">${rich(p.tag)}</div>
          <div class="stmt-h">${rich(p.head)}</div>
          <div class="greenrule"></div>
          ${p.body ? `<div class="stmt-b">${rich(p.body)}</div>` : ''}
          ${p.table
            ? `<div class="splitrow"><div>${bulletList(p)}</div><div>${hairTable(p.table)}</div></div>`
            : bulletList(p)}
          ${p.source ? `<div class="stmt-src">${rich(p.source)}</div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'diagram') {
      const cols = p.bars.map((b: any) => `<div class="col"><div class="bars"><div class="bar ${b.style}" style="height:${b.h}px"><span class="barnum">${esc(b.label)}</span></div></div><div class="collab ${b.style === 'green' ? 'strong' : ''}">${b.sub}</div></div>`);
      const joined = cols.join(`<div class="vs">${esc(p.connector || '→')}</div>`);
      html.push(`<section class="pg light">${kicker}
        <div class="diagwrap">
          <div class="tag green">${esc(p.tag)}</div>
          <div class="stmt-h" style="max-width:840px;margin-top:22px">${esc(p.head)}</div>
          <div class="diag">${joined}</div>
          ${p.body ? `<div class="stmt-b" style="margin-top:48px">${esc(p.body)}</div>` : ''}
          ${p.source ? `<div class="stmt-src">${esc(p.source)}</div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'trade') {
      const img = resolveImg(p.image);
      html.push(`<section class="pg light">${kicker}
        <div class="tradewrap${img ? '' : ' noimg'}">
          <div class="trade-txt">
            <div class="tag green">${esc(p.name)}</div>
            ${p.numeral ? `<div class="trade-num">${esc(p.numeral)}${p.unit ? `<span class="tunit">${esc(p.unit)}</span>` : ''}</div>` : ''}
            <div class="brassbar tbar"></div>
            <div class="trade-h">${esc(p.head)}</div>
            ${p.body ? `<div class="trade-b">${esc(p.body)}</div>` : ''}
            ${p.source ? `<div class="stmt-src">${esc(p.source)}</div>` : ''}
          </div>
          ${img ? `<div class="trade-img"><div class="trade-clip"><img src="${img}" style="object-position:${p.imagePos || '50% 50%'}"></div>${HANDLE_HTML}</div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    }
  });

  /* ── CLOSER — option 2a, the offer ladder (COVER-CTA-SPEC.md, 6 Aug) ────
   * The diagnosis: the close was centred, the offer was a four-line
   * paragraph, and "Book a call at smbx.ai" was the last clause of the last
   * sentence — so the one action on the page was the least visible thing on
   * it. Now: the two engagements are a ruled CHOICE, and the action is a
   * filled bar with a named destination.
   *
   * FLUSH LEFT, and that overrides DESIGN.md §6.1, which specifies a centred
   * closer. The design pass calls centring "the single biggest deviation in
   * the current build" — on a page whose job is to be acted on, centred type
   * gives the eye no consistent left edge to return to, and the action bar
   * has no margin to align with. Recorded in DESIGN.md rather than left as a
   * silent difference between the file and the renderer.
   *
   * body still renders when no rows are given, so older specs are safe.
   */
  const cl = deck.closer;
  const ladder = Array.isArray(cl.rows) && cl.rows.length
    ? `<div class="ct-rows">${cl.rows.map((r: any) =>
        `<div class="ct-row"><div class="ct-rn">${rich(r.name)}</div>` +
        `<div class="ct-rd">${rich(r.note)}</div></div>`).join('')}</div>`
    : '';

  html.push(`<section class="pg ${BK} closepg">
    <div class="glaze"></div>
    <div class="pgframe">${HANDLE_HTML}</div>
    <div class="closer">
      ${cl.tag ? `<div class="tag brasstag">${esc(cl.tag)}</div>` : ''}
      <div class="ct-head">${rich(cl.head)}</div>
      <div class="ct-rule"></div>
      ${ladder}
      ${cl.line ? `<div class="ct-line">${rich(cl.line)}</div>` : ''}
      ${!ladder && cl.body ? `<div class="ct-body">${rich(cl.body)}</div>` : ''}
      ${cl.action ? `<div class="ct-action"><span class="ct-al">${rich(cl.action)}</span><span class="ct-ar">→</span></div>` : ''}
      <div class="ct-foot">
        <div class="ct-sign">${face(92)}<div class="ct-who"><div class="ct-name">Paul Baker</div><div class="ct-tag2">${esc(cl.proof || 'Buy-side corporate development')}</div></div></div>
        <span class="follow">FOLLOW</span>
      </div>
    </div>
  </section>`);
  return html;
}

/**
 * The house CSS for a deck document.
 *
 * The two texture parameters are RETAINED AND UNUSED as of the Carta pass
 * (2026-08-08). Carta's band is a flat colour and its page is plain bone, so
 * there is no plaster to pass in — but deckDocument() and the app's caller both
 * pass them positionally, and a signature change is a silent breakage in a call
 * site nobody re-reads. Typed optional, ignored; drop them once every caller
 * has been swept.
 */
export function deckCss(_texture?: string, _paper?: string): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; } img { vertical-align: middle; }
  html, body { width: 1080px; }
  .pg { width: 1080px; height: 1350px; position: relative; overflow: hidden; page-break-after: always; font-family: ${SANS}; font-variant-numeric: tabular-nums; }
  .pg:last-child { page-break-after: auto; }
  .pg.light { background: ${cartaPage()}; color: ${INK}; }
  /* NO BLOOM (2026-08-08). The Ledger cover lifted its ground with two or three
     large soft radial gradients, tuned per surface, each carrying a brass stop.
     Carta's band is FLAT — no texture, no glaze, no halo, no gradient — and its
     page is plain bone. Depth is structural now: hairline frames, corner
     handles, plates and rules. Do not reintroduce a wash "for depth"; that is
     the Ledger reflex, and it is what leaves a converted page still reading as
     the old system. */

  /* ── INK BOOKEND (2026-08-06, Paul: "I don't like the huge dark green…
     maybe this will be a little different") ──────────────────────────────
     COVER-CTA-SPEC.md options 1c / 2b. A third bookend ground, NOT a
     replacement — the --bookend flag picks one: dark, light, ink, or all.

     THIS DEVIATES FROM DESIGN.md §4, which says the retired palette's dark was
     the only dark surface and "nothing in this system is near-black". That rule was written
     when the jade block was the answer to Paul's 2026-07-31 complaint about
     the old green-black being too dark. He is now saying the block itself is
     too heavy, so the rule is being tested rather than broken by accident. If
     ink is adopted, DESIGN.md §4 and the Aurora note both need amending —
     until then this is an option you have to ask for by name.

     Neutrals on ink are bone at reduced alpha, never a new grey (spec §3).
     Green on ink is JADE — the "jade is never text" rule is scoped to bone
     grounds, where jade fails contrast; on ink it clears. */
  .pg.ink { background: ${cartaBand()}; color: ${IVORY}; }
  /* THE BYLINE RING — opaque, neutral, the same on every ground.
     Never green next to a face (Paul, 2026-08-06), and never translucent: a
     see-through ring picks up whatever bloom sits behind the byline strip, which
     on the bottom-left jade is green again by another route.

     CARTA NOTE (2026-08-08). CARTA_COLLATERAL_CONVERSION §3 says to keep "the
     mint-ringed headshot disc". That instruction is stale: the mint ring was
     removed on 2026-08-06 on Paul's call — never green next to a face — and the
     ring has been an opaque neutral ever since. The conversion doc's own rule is
     that the code wins, so the neutral stays and only its token moves, from the
     retired palette's heavy-divider role to the nearest Carta one.

     THE RETIRED PALETTE IS NOT NAMED HERE, and that is deliberate — the same
     discipline this file already applies to hexes. carta-guard's builders check
     reads the IDENTIFIER, because that is what a session copies; a render module
     naming it in prose is indistinguishable from one importing it. Name the
     system, not the symbol. DESIGN.md §2 holds both. */
  .facedisc { border: 3px solid ${CARTA.chipBorder}; }
  .pg.ink .kt { color: ${DARK_MUTED}; }
  .pg.ink .kt.brass { color: ${MINT}; }
  .pg.ink .cv-hook, .pg.ink .ct-head, .pg.ink .ct-line, .pg.ink .ct-rn { color: ${IVORY}; }
  .pg.ink .cv-hook .turn { color: ${MINT}; }
  .pg.ink .cv-rule, .pg.ink .ct-rule { background: ${MINT}; }
  .pg.ink .cv-figure, .pg.ink .cv-fv { color: ${IVORY}; }
  .pg.ink .cv-bar, .pg.ink .cv-numbar, .pg.ink .brassbar { background: ${MINT}; }
  .pg.ink .cv-now { color: ${MINT}; }
  .pg.ink .cv-sub, .pg.ink .ct-rd, .pg.ink .ct-body { color: ${IVORY_SUB}; }
  .pg.ink .cv-fl, .pg.ink .cv-was, .pg.ink .wt, .pg.ink .ct-tag2 { color: ${DARK_MUTED}; }
  .pg.ink .wn, .pg.ink .ct-name { color: ${IVORY}; }
  .pg.ink .cv-strip, .pg.ink .cv-figrow, .pg.ink .ct-rows, .pg.ink .ct-row, .pg.ink .ct-foot,
  .pg.ink .cv-band { border-color: ${SEAM}; }
  .pg.ink .swipe, .pg.ink .follow { color: ${MINT}; }
  /* CARTA HAS ONE DARK, so both dark bookends paint the same ground. The class
     names both survive because live specs pass --bookend ink and --bookend
     dark, and neither should start failing over a palette change; the jade
     block that used to distinguish them no longer exists. */
  .pg.dark { background: ${cartaBand()}; color: ${IVORY}; }
  /* the glaze painted the Ledger block's jade wash. Carta's band is a colour,
     so it paints nothing; the element stays because the markup is shared. */
  .glaze { display: none; }

  /* ── THE COVER PANEL ───────────────────────────────────────────────────
     An inset hairline bracket wearing the four corner handles, on the cover
     and the closer.

     WHY IT EXISTS (Paul, 2026-08-08, on the first full re-render): the pages
     "still seem Aurora with just a plain dark background". He was right, and
     the diagnosis is exact — the palette had moved and the GRAMMAR had not.
     Ledger held a page together with atmosphere: a plaster texture, a jade
     glaze, a bloom rising out of a corner. Carta deletes all of that and puts
     STRUCTURE in its place — the frame, the handles, the plates, the seams.
     Delete the first without adding the second and you get the old layout with
     the lights off, which is exactly what shipped.

     The handles sit at -4px, outside the border, so the frame must not clip.
     The page may: .pg keeps overflow:hidden and the frame is inset well
     inside it. */
  /* z-index 0 — BEHIND the art, above the ground. A cover that carries a
     full-height photograph or a bottom band would otherwise have the bracket
     drawn straight across the picture, which reads as a stray box (the same
     mistake the one-pager made when its frame spanned the whole card). Ducking
     it behind the art makes the bracket stop at the art's edge on its own, with
     no per-layout arithmetic to keep in sync with the layouts. */
  .pgframe { position: absolute; inset: 40px; border: 1px solid ${SEAM}; z-index: 0; pointer-events: none; }
  .bk-lt .pgframe { border-color: ${CARTA.chipBorder}; }
  ${handleCss(CARTA.darkInk)}
  ${handleColorCss('.bk-lt', CARTA.ink)}
  ${handleColorCss('.pg.light', CARTA.ink)}
  .kick { position: absolute; left: 66px; right: 66px; top: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${HAIR}; padding-bottom: 22px; z-index: 3; }
  .kt { font-family: ${MONO}; font-size: 18px; letter-spacing: ${CARTA_KICKER.tracking}; color: ${TERT}; text-transform: uppercase; font-weight: 500; }
  /* THE KICKER MARK: an 8px green square, then the label. The square is the
     accent; the words are not. Same construction on both grounds. */
  .kt.brass { color: ${GREEN}; }
  .kt.brass::before { content: ''; display: inline-block; width: ${CARTA_KICKER.square}px; height: ${CARTA_KICKER.square}px; background: ${GREEN}; margin-right: 10px; vertical-align: 1px; }
  .pfoot { position: absolute; left: 0; right: 0; bottom: 0; height: 84px; background: ${DARK}; display: flex; align-items: center; justify-content: space-between; padding: 0 66px; z-index: 3; }
  .pn { font-family: ${MONO}; font-size: 16px; letter-spacing: 0.1em; color: ${IVORY_SUB}; }
  .ghost { position: absolute; right: 60px; bottom: 150px; z-index: 0; font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 360px; line-height: 0.8; color: ${rgba(CARTA.ink, 0.05)}; letter-spacing: -0.04em; }
  .cv-left { position: absolute; left: 0; top: 0; bottom: 128px; width: 544px; padding: 66px 50px 40px 66px; display: flex; flex-direction: column; z-index: 2; }
  .kick2 { display: flex; align-items: center; justify-content: space-between; }
  .cv-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .cv-hook { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 52px; line-height: 1.08; letter-spacing: -0.014em; color: ${IVORY}; text-wrap: balance; }
  /* SQUARE. Radius 0 everywhere except buttons and inputs at 10px. */
  .cv-rule { width: 70px; height: 4px; background: ${MINT}; margin: 30px 0 26px; }
  .cv-sub { font-size: 22px; line-height: 1.5; color: ${IVORY_SUB}; font-weight: 500; }
  /* Cover CTA (2026-08-03, Paul: "tell them to go to the website to get the
     full report"). Mono in mint, the same treatment the one-pager gives its
     CTA and the closer gives FOLLOW FOR THE NEXT READ — so nothing new is
     introduced to the surface. It sits last in the copy column, under the
     proof strip, because a reader who has taken in the figures is the one
     worth sending anywhere. SWIPE stays where it is: that is the affordance
     for the deck, this is the exit to the report. */
  .cv-cta { margin-top: 26px; font-family: ${MONO}; font-size: 20px; line-height: 1.55;
            letter-spacing: 0.05em; color: ${MINT}; font-weight: 500; }
  .bk-lt .cv-cta { color: ${GREEN}; }

  /* ══ COVER, 2026-08-06 — the LinkedIn engagement pass ══════════════════
     Minimum type at 1080 wide, from COVER-CTA-SPEC.md §2: body ≥30px, mono
     labels ≥19px, hero ≥190px. Anything under that does not survive the feed,
     which is why the old 17–22px cover copy was invisible in-feed even though
     it read perfectly at full size. */
  /* 1b geometry: the copy column runs FULL WIDTH and the portrait becomes a
     bottom band. The right-hand portrait column was squeezing the claim into
     428px, which forced it to 66px over four lines — the opposite of what the
     feed needs. Full width gives it 948px and two lines at 80px. */
  .pg.cover .cv-left { width: 100%; bottom: 150px; padding: 76px 76px 24px; }
  .pg.cover.hasband .cv-left { bottom: 470px; }
  /* inversion — art in a full-height right column behind a Deal Green rule */
  /* INVERSION IS ONE PAGE, NOT TWO COLUMNS (Paul, 2026-08-06: "the text needs to
     morph and wrap around the image so it looks like it all on the same one
     page... and not still in columns where the content divider is just hidden").
     Deleting the divider hid the split; it did not remove it, because the art
     was still an absolutely-positioned column the text simply avoided.
     So the art is no longer a column. It is a FLOAT inside the text block, and
     shape-outside runs the wrap along the drawing's own alpha silhouette rather
     than its bounding box -- which is only possible because the library moved to
     cut-outs. The type follows the shape of the van; there is no seam to hide.
     .cv-body must stop being a flex column for this: floats do not affect flex
     items, and the wrap would silently do nothing. */
  /* THE GOLDEN SPLIT. The art's left edge sits on major(1080) = 667.5px and it
     bleeds to the right page edge, so it occupies minor(1080) = 412.5 — the page
     divided once, at the only place a division does not look arbitrary. The type
     gets the major and, below the float, the full measure. Nothing here is a
     round number on purpose; rounding 412.5 to 400 makes it a number again. */
  .pg.cover.inversion .cv-left { width: auto; right: 0; padding-right: ${SPACE.md}px; }
  /* Block with explicit top padding. flow-root was tried, to keep .cv-body a
     flex item so margin-block:auto would still centre it -- it did not work: the
     element already carries flex:1, so it filled the column and the content
     top-aligned inside it anyway, putting the hero back over the wordmark.
     Explicit padding is the honest fix. The empty lower third is not a defect:
     COVER-CTA-SPEC §2 requires the hook inside the top 62% because LinkedIn
     crops the bottom of a feed card on mobile, so that space is never seen in
     the place this page is designed for. */
  .pg.cover.inversion .cv-body { display: block; padding-top: ${SPACE.md}px; }
  /* Sized so the drawing reads as an illustration ON the page, not as the page.
     At 620px it out-shouted the headline and rose into the wordmark. */
  /* TWO KINDS OF ART, TWO LAYOUTS. Chosen by the builder from the file itself,
     not from a spec key -- see hasAlpha() above.

     .artcut -- A CUT-OUT. Lower-right quadrant, seated on the footer, held
     inside the right margin (Paul, 2026-08-06, choosing D2 over the bled D:
     the motion a bleed buys is not worth clipping the nose off the subject).
     The type owns both upper quadrants at full measure; the drawing owns the
     lower right. Nothing to wrap around, so shape-outside is gone rather than
     kept as decoration -- it returns when a page carries copy long enough to
     run down beside the art.

     .artphoto -- A PHOTOGRAPH, and it CANNOT use the placement above. An opaque
     rectangle sitting in the type's whitespace does not read as depth, it reads
     as a headline with a photo on top of it. So a photograph gets its own
     column, full-bleed to the right edge and to the footer, and the type keeps
     the major. That is COVER-CTA-SPEC option 1c as originally drawn, and it is
     the right answer for a portrait -- which is what this slot is for when the
     piece is promotional rather than analytical. */
  /* THE HEIGHT IS CAPPED, and that is the fix for a collision Paul caught on
     the 2026-08-08 style renders: the promise line ran underneath the drawing.

     height:auto resolves from the source's aspect ratio, so a PORTRAIT
     cut-out at this width came out 817px tall on a 1350px page — 60% of the
     surface. That is not a lower-right quadrant, it is the whole right half,
     and its top edge landed at y=383, straight through the copy. The rule
     above says the type owns both upper quadrants; nothing was enforcing it,
     and it only shows on tall art.

     Capping to minor(1350) puts the top edge at y=684 whatever the source's
     shape. contain keeps the drawing undistorted inside the box and
     bottom-right seats it on the footer; the letterboxing is invisible
     because a cut-out's surround is transparent — which is now guaranteed,
     since the detector measures real transparency rather than trusting the
     colour type. */
  .pg.cover.inversion.artcut .cv-wrap {
    position: absolute; right: ${SPACE.md}px; bottom: 0;
    width: ${(minor(1080) + SPACE.lg).toFixed(1)}px; height: ${minor(1350).toFixed(1)}px;
    object-fit: contain; object-position: bottom right; }
  /* ...and the copy stops clear of the tallest case the box allows. A portrait
     cut-out fills the box's height, so its left edge sits at x=698; this ends
     the measure at x=673. Landscape art is shorter and never reaches the copy
     at all, so one cap covers both. */
  .pg.cover.inversion.artcut .cv-sub,
  .pg.cover.inversion.artcut .cv-cta { max-width: ${(major(1080) - SPACE.md).toFixed(1)}px; }

  /* height is CALCULATED, not auto. On a replaced element (an img) auto height
     resolves from the intrinsic aspect ratio and quietly beats top/bottom, so
     the column rendered half-height and stopped mid-page. */
  .pg.cover.inversion.artphoto .cv-wrap {
    position: absolute; right: 0; top: 0; height: calc(100% - 150px);
    width: ${minor(1080).toFixed(1)}px; object-fit: cover; }
  /* EVERY copy element on an inversion cover has to stop at the art, not just
     the hook and the sub. Paul, 2026-08-08, on the figure cover: "the text at
     the top is overlapping the image" — the hero row runs
     figure + TODAY + baseline as a flex line, and only the two elements listed
     here were capped, so the baseline label ran on under the picture and was
     clipped mid-word.

     The measure is the page less the art column less both margins. It is
     written once, here, and every copy element on the cover claims it — which
     is the only way a new element added later inherits the constraint instead
     of rediscovering the bug. */
  .pg.cover.inversion.artphoto .cv-hook,
  .pg.cover.inversion.artphoto .cv-sub,
  .pg.cover.inversion.artphoto .cv-hero,
  .pg.cover.inversion.artphoto .cv-figrow,
  .pg.cover.inversion.artphoto .cv-cta,
  .pg.cover.inversion.artphoto .kick2 { max-width: ${(major(1080) - SPACE.md * 2).toFixed(1)}px; }
  /* the cut-out sits lower and narrower, so its measure is its own */
  .pg.cover.inversion.artcut .cv-hero,
  .pg.cover.inversion.artcut .kick2 { max-width: ${(major(1080) - SPACE.md).toFixed(1)}px; }
  .pg.cover.inversion.artphoto .cv-body { padding-top: ${SPACE.xl}px; }
  /* NO DIVIDER (Paul, 2026-08-06: "the big green bar that separates the page
     halfs can go"). COVER-CTA-SPEC §5 called for a 4px Deal Green rule between
     the text column and the art, which made sense when the art was a
     full-bleed PHOTOGRAPH that needed a hard boundary against the page. With a
     cut-out there is no boundary to draw: the drawing and the type share one
     continuous bloomed ground, and a bar through the middle just cuts it in two. */
  /* CONTAIN, NOT COVER, and wider. cover crops to fill — correct for a
     full-bleed photograph, wrong for a cut-out, which is a whole object: it
     sliced the nose off the van. A cut-out has its own margin and needs the
     frame to fit around it, not the other way round. Width 416 -> 560 because
     contain inside a narrow column shrinks the drawing to fit the WIDTH and
     leaves the height empty. Set cover.imageFit: 'cover' on a spec that
     really does carry a full-bleed photograph. */
  .cv-col { position: absolute; right: 0; top: 0; bottom: 150px; width: 560px; overflow: hidden;
            z-index: 1; }
  /* Full measure -- both upper quadrants. .artphoto narrows it again below. */
  .pg.cover.inversion .cv-hook { font-size: 68px; max-width: ${1080 - SPACE.md * 2}px; text-wrap: pretty; }
  .pg.cover.inversion .cv-sub { max-width: ${major(1080)}px; }
  .pg.cover.inversion .cv-figure { font-size: 176px; }
  .cv-band { position: absolute; left: 0; right: 0; bottom: 150px; height: 320px; overflow: hidden;
             border-top: 2px solid ${SEAM}; z-index: 1; }
  .bk-lt .cv-band { border-top-color: ${INK}; }
  .pg.cover.hasband .cv-band { border-top-width: 1px; }
  /* flex-wrap, not nowrap. With a capped measure a long baseline label has to
     have somewhere to go; without this it overflows the cap silently — a cap
     that cannot be obeyed is not a cap. */
  .cv-hero { display: flex; align-items: flex-end; gap: 26px; flex-wrap: wrap; }
  .cv-base { min-width: 0; }
  .cv-figure { font-family: ${DISPLAY};
               font-weight: 600; font-size: 208px; line-height: 0.82; letter-spacing: -0.035em;
               color: ${IVORY}; }
  .bk-lt .cv-figure { color: ${INK}; }
  .cv-base { padding-bottom: 22px; }
  .cv-now { font-family: ${MONO}; font-size: 19px; font-weight: 600; letter-spacing: 0.16em;
            text-transform: uppercase; color: ${MINT}; }
  .bk-lt .cv-now { color: ${GREEN}; }
  /* NO STRIKETHROUGH (Paul, 2026-08-06: "i dont like the strike through on the
     text tho.. it is confusing"). COVER-CTA-SPEC put line-through on the PRIOR
     FIGURE, which works for "13.3x" and fails completely for the way specs
     actually use this slot — "of shops have fewer than twenty employees" is a
     label, not a superseded number, and striking it reads as a retraction. The
     field does double duty in practice, so the style has to survive both:
     muted, smaller, no decoration. Rank does the work the rule was doing. */
  .cv-was { margin-top: 6px; font-family: ${MONO}; font-size: 19px; letter-spacing: 0.13em;
            text-transform: uppercase; color: ${IVORY_SUB}; }
  .bk-lt .cv-was { color: ${TERT}; }
  /* THE STAT BAR under a signature figure. Ledger gave this job to amber. In
     Carta the figure is the reading ink and this bar is the page's only accent
     — green on paper, mint on the band. Proportioned to the 208px hero rather
     than lifted at the site's literal 52px, which is drawn under a 56px
     numeral; the ratio is what transfers, not the measurement. */
  .cv-bar { width: 152px; height: 4px; background: ${MINT}; margin: 30px 0 28px; }
  .bk-lt .cv-bar { background: ${GREEN}; }
  /* The cover hook FILLS its measure — pretty, not balance.
     DESIGN.md §4 puts text-wrap: balance on hooks, and at the old 52px that
     was right: balance stops a short word orphaning onto its own line. At 94px
     across a full-width column it does the opposite — it equalises the lines,
     so "A register is not a market." breaks after "is" with 300px of empty
     measure to its right (Paul, 2026-08-06: "the h1 is too truncated and
     carriage returns before it should"). pretty keeps the orphan protection
     and lets line one run. Balance still governs the smaller hooks. */
  .pg.cover .cv-hook { font-size: 94px; line-height: 1.03; max-width: 980px; text-wrap: pretty; }
  .pg.cover.hasband .cv-hook { font-size: 82px; }
  .pg.cover .cv-sub { margin-top: 26px; font-size: 31px; line-height: 1.42; font-weight: 400; max-width: 860px; }

  .cv-figrow { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 38px;
               padding-top: 26px; border-top: 1px solid ${SEAM}; }
  .bk-lt .cv-figrow { border-top-color: ${HAIR}; }
  .cv-fv { font-family: ${DISPLAY}; font-weight: 600;
           font-size: 56px; line-height: 1; color: ${IVORY}; }
  .bk-lt .cv-fv { color: ${INK}; }
  .cv-fl { margin-top: 10px; font-family: ${MONO}; font-size: 19px; line-height: 1.4; letter-spacing: 0.1em;
           text-transform: uppercase; color: ${IVORY_SUB}; }
  .bk-lt .cv-fl { color: ${TERT}; }

  /* byline off the hero — a strip, not a bar. Spec §6.2. */
  .cv-strip { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; display: flex;
              align-items: center; gap: 22px; padding: 0 66px; z-index: 3;
              border-top: 1px solid ${SEAM}; }
  .bk-lt .cv-strip { border-top-color: ${HAIR}; }

  /* ══ CLOSER — option 2a, the offer ladder ═════════════════════════════ */
  .pg.closepg .closer { align-items: flex-start; text-align: left; }
  /* THE CLOSER ON THE SAME SCALE AS THE COVER. Every gap below is a step on
     the phi ladder and every measure is derived from the page — the closer had
     been left on hand-set values (880 / 40 / 32 / 44 / 30) while the cover moved
     to the golden scale, so the two pages of one deck were spaced by different
     systems. Nobody would name it looking at either page alone; side by side it
     reads as two designers. */
  .ct-rows { width: 100%; max-width: ${(1080 - SPACE.md * 2).toFixed(1)}px; margin-top: ${SPACE.md}px; border-top: 1px solid ${SEAM}; }
  .bk-lt .ct-rows { border-top-color: ${HAIR}; }
  .ct-row { display: grid; grid-template-columns: ${minor(1080).toFixed(1)}px 1fr; gap: ${SPACE.sm}px; padding: ${SPACE.sm}px 0;
            border-bottom: 1px solid ${SEAM}; }
  .bk-lt .ct-row { border-bottom-color: ${HAIR}; }
  .ct-rn { font-size: 30px; font-weight: 700; color: ${IVORY}; line-height: 1.25; }
  .bk-lt .ct-rn { color: ${INK}; }
  .ct-rd { font-size: 29px; line-height: 1.35; color: ${IVORY_SUB}; }
  .bk-lt .ct-rd { color: ${BODY}; }
  .ct-line { margin-top: ${SPACE.md}px; font-size: 29px; line-height: 1.45; color: ${IVORY}; max-width: ${(1080 - SPACE.md * 2).toFixed(1)}px; }
  .bk-lt .ct-line { color: ${INK}; }
  /* ONE filled action bar, label flush left. The whole point of the page.

     THE BUTTON LAW: green is NEVER a resting fill. Ledger filled this bar with
     mint on the block and Deal Green on paper. Carta fills it with bone on the
     band and ink on the page, and green appears only on the arrow. A green
     button is the fastest way to look off-brand while every individual hex
     still checks out.

     Buttons and inputs are the ONLY things in Carta carrying a radius, at
     10px. Everything else is square. */
  .ct-action { margin-top: ${SPACE.lg}px; width: 100%; max-width: ${(1080 - SPACE.md * 2).toFixed(1)}px; background: ${IVORY};
               border-radius: ${CARTA_CONTROL_RADIUS}px; padding: 32px 40px; display: flex; align-items: center;
               justify-content: space-between; }
  .bk-lt .ct-action { background: ${INK}; }
  .ct-al { font-size: 31px; font-weight: 700; color: ${INK}; }
  .bk-lt .ct-al { color: ${WARM}; }
  .ct-ar { font-size: 31px; font-weight: 700; color: ${GREEN}; }
  .bk-lt .ct-ar { color: ${MINT}; }
  .ct-foot { margin-top: auto; padding-top: ${SPACE.md}px; width: 100%; display: flex; align-items: center;
             justify-content: space-between; }
  /* ── cover atmosphere ──────────────────────────────────────────────────
     Ported from the site: .pd-spark (a five-point corner constellation, a
     whisper not a starfield) and the block's own ghost mark. The light body
     pages have carried a ghost numeral since the first build; the cover had
     nothing behind its copy at all, which is what made it read as an empty
     green field. */
  .cv-spark { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.6;
    -webkit-mask-image: radial-gradient(58% 58% at 22% 8%, #000, transparent 70%);
    mask-image: radial-gradient(58% 58% at 22% 8%, #000, transparent 70%);
    background-repeat: no-repeat;
    background-image:
      radial-gradient(3px 3px at 14% 12%, ${rgba(CARTA.darkInk, 0.60)}, transparent 60%),
      radial-gradient(3px 3px at 30% 24%, ${rgba(CARTA.mint, 0.50)}, transparent 60%),
      radial-gradient(2px 2px at 8% 20%, ${rgba(CARTA.darkInk, 0.42)}, transparent 60%),
      radial-gradient(2px 2px at 36% 9%, ${rgba(CARTA.darkInk, 0.40)}, transparent 60%),
      radial-gradient(3px 3px at 24% 33%, ${rgba(CARTA.mint, 0.30)}, transparent 60%); }
  .cv-ghost { position: absolute; left: -30px; bottom: 96px; z-index: 0; font-family: ${DISPLAY};
    font-weight: ${DW}; font-size: 400px; line-height: 0.78; letter-spacing: -0.05em;
    color: ${rgba(CARTA.darkInk, 0.055)}; pointer-events: none; white-space: nowrap; }
  /* the two-beat hook — the turn changes colour (poster lesson, 2026-07-20) */
  .cv-hook .turn { color: ${MINT}; }
  /* the signature numeral, on the cover: the number IS the graphic (§8) */
  /* The figure is the reading ink on its ground; the bar under it is the accent. */
  .cv-num { font-weight: 800; font-size: 122px; line-height: 0.88; letter-spacing: -0.035em; color: ${IVORY}; }
  .cv-num .u { font-size: 66px; }
  .cv-numbar { height: 4px; width: 104px; background: ${MINT}; margin: 20px 0 26px; }
  .cv-numlab { font-family: ${MONO}; font-size: 15px; letter-spacing: 0.13em; text-transform: uppercase;
    color: ${MINT}; margin-top: 14px; line-height: 1.5; }
  /* the proof strip — the report cover's stat band, brought to the carousel */
  .cv-proof { display: flex; gap: 12px; margin-top: 34px; }
  .cv-pcard { position: relative; flex: 1; border: 1px solid ${SEAM};
    padding: 14px 14px 15px; background: ${rgba(CARTA.darkInk, 0.045)}; }
  .cv-pv { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 34px; line-height: 1; color: ${IVORY}; letter-spacing: -0.02em; }
  .cv-pcard .hdl { width: ${CARTA_HANDLE.sizeSmall}px; height: ${CARTA_HANDLE.sizeSmall}px; }
  .cv-pl { font-family: ${MONO}; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;
    color: ${IVORY_SUB}; margin-top: 8px; line-height: 1.4; }
  /* ── the LIGHT bookend (2026-08-01, Paul: "we can have light and dark
     versions of the cover pages") ────────────────────────────────────────
     Same geometry, same slots, paper instead of block. Every colour swap
     below is the light-surface value the palette already assigns to that
     job: honey→amber, mint→Deal Green, ivory→ink, block hairlines→hair.
     Nothing new is introduced, which is why the two read as one deck. */
  .pg.bk-lt { background: ${cartaPage()}; color: ${INK}; }
  .bk-lt .kt.brass { color: ${GREEN}; }
  .bk-lt .cv-hook { color: ${INK}; }
  .bk-lt .cv-hook .turn { color: ${GREEN}; }
  .bk-lt .cv-sub { color: ${BODY}; }
  .bk-lt .cv-rule, .bk-lt .ct-rule { background: ${GREEN}; }
  .bk-lt .cv-num { color: ${INK}; }
  .bk-lt .cv-numbar { background: ${GREEN}; }
  .bk-lt .cv-numlab { color: ${GREEN}; }
  /* The CTA takes the SAME colour as the numeral label on each surface:
     mint on the block, Deal Green on paper. Added 2026-08-03 after shipping
     without it. The cv-cta rule was hard-coded to MINT with no light override,
     so the light cover rendered mint mono on bone. Section 4 predicts exactly
     that failure: jade-family on bone is 2.85:1, under the 4.5:1 floor, and it
     fails invisibly. It did. Every other cover element swaps. This one did not,
     because only the dark render was checked. */
  .bk-lt .cv-cta { color: ${GREEN}; }
  .bk-lt .cv-pcard { border-color: ${INK}; background: ${WHITE}; }
  .bk-lt .cv-pv { color: ${INK}; }
  .bk-lt .cv-pl { color: ${TERT}; }
  /* removed 2026-08-06: the light bookend no longer paints a panel behind the
     art — a cut-out sits directly on the bloomed page. */
  .bk-lt .cv-foot { border-top-color: ${HAIR}; }
  .bk-lt .wn, .bk-lt .ct-name { color: ${INK}; }
  .bk-lt .wt, .bk-lt .ct-tag2, .bk-lt .ct-body { color: ${BODY}; }
  .bk-lt .swipe, .bk-lt .follow { color: ${GREEN}; }
  .bk-lt .ct-head { color: ${INK}; }
  .bk-lt .cv-ghost { color: ${rgba(CARTA.ink, 0.05)}; }
  /* the constellation inverts: on paper the points are the accent, not the light */
  .bk-lt .cv-spark { opacity: 0.5; background-image:
      radial-gradient(3px 3px at 14% 12%, ${rgba(CARTA.green, 0.55)}, transparent 60%),
      radial-gradient(3px 3px at 30% 24%, ${rgba(CARTA.greenBright, 0.45)}, transparent 60%),
      radial-gradient(2px 2px at 8% 20%, ${rgba(CARTA.green, 0.40)}, transparent 60%),
      radial-gradient(2px 2px at 36% 9%, ${rgba(CARTA.ink, 0.22)}, transparent 60%),
      radial-gradient(3px 3px at 24% 33%, ${rgba(CARTA.ink, 0.16)}, transparent 60%); }
  /* The illustrations carry a baked bone from the retired palette, darker and
     warmer than Aurora's. Lift it so a framed panel matches the paper it sits
     on instead of reading as a dingy rectangle. See ARTWORK_LIFT in tokens.ts —
     this is a bridge until the library is regenerated. */
  .cv-right img, .trade-img img { filter: brightness(${ARTWORK_LIFT}); }
  /* THE ART PANEL SAT OUTSIDE THE AURORA, and that is why the illustrations
     never matched the page (Paul, 2026-08-06: "the bone doesn't match the Aurora
     effect and or the ink effect").
       · Its ground was PURE WHITE while the page is bone — a 6-point step at the
         panel edge before a single pixel of artwork was considered.
       · The page bloom is ::before at z-index 0; the panel is z-index 1. The
         bloom therefore STOPPED at the panel edge: bloomed page, unbloomed art,
         a visible rectangle no amount of re-prompting could fix.
     Bone ground, and an ::after carrying the same bloom OVER the art, so the
     panel lives inside the Aurora instead of punching a hole in it. */
  /* THE ART PANEL IS NO LONGER A PANEL (Paul, 2026-08-06: "now it does not have
     to be in a frame, the gradient can fill the pages on light").
     The library is moving to CUT-OUTS with a real alpha channel, and a cut-out
     changes the problem completely: with no baked background there is nothing to
     mismatch, so the page bloom simply runs behind the drawing. Every fix that
     came before this — ARTWORK_LIFT, matching the bone exactly, blooming the
     panel — was work to make a rectangle disappear. Removing the rectangle
     retires all of it.
     REQUIRES transparent PNGs. Art with a baked background will now show as a
     hard rectangle on ink, which is the correct failure: it is visible, and
     art-normalize.mts reports the alpha share so it can be caught first. */
  .cv-right { position: absolute; left: 544px; top: 60px; right: 60px; bottom: 188px; z-index: 1; }
  .cv-right img, .trade-img img { filter: brightness(${ARTWORK_LIFT}); }
  /* NO GLOW behind the art. A blurred halo was tried on ink and read as fuzz —
     it fights a FLAT illustration, which has no lighting anywhere else in it, so
     a soft light source appears from nowhere and looks like a mistake (Paul,
     2026-08-06: "not a wonky fuzzy slight glow"). The drawing carries itself on
     both grounds; if a future subject genuinely disappears into ink, the answer
     is a lighter subject, not a light behind it. */

  .cv-foot { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; border-top: 1px solid ${SEAM}; display: flex; align-items: center; gap: 26px; padding: 0 60px; z-index: 3; }
  .who { display: flex; align-items: center; gap: 18px; }
  .wn { color: ${IVORY}; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }
  .wt { margin-top: 3px; color: ${IVORY_SUB}; font-size: 16.5px; font-weight: 500; }
  .swipe { margin-left: auto; font-family: ${MONO}; font-size: 21px; letter-spacing: 0.14em; color: ${MINT}; font-weight: 600; }
  .statwrap { position: absolute; left: 88px; right: 88px; top: 300px; z-index: 1; }
  .numeral { font-weight: 800; font-size: 290px; line-height: 0.9; letter-spacing: -0.03em; color: ${INK}; }
  .numeral .unit { font-size: 150px; }
  /* Was the brass bar. Same job, one accent. */
  .brassbar { height: 4px; width: 132px; background: ${GREEN}; margin: 44px 0 40px; }
  .stat-h { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 44px; line-height: 1.16; letter-spacing: -0.01em; color: ${INK}; max-width: 830px; }
  .stat-b { margin-top: 26px; font-size: 25px; line-height: 1.55; color: ${BODY}; max-width: 800px; }
  .baserail { position: absolute; left: 88px; right: 88px; bottom: 128px; display: flex; flex-direction: column; gap: 16px; z-index: 1; }
  .bl-rule { height: 1px; width: 100%; background: ${HAIR}; }
  .src { font-family: ${MONO}; font-size: 17px; letter-spacing: 0.05em; color: ${TERT}; }
  /* top: 0 CENTRED OVER THE HEADER, not under it. With justify-content:center on
     a box spanning the whole page, a tall page grows in BOTH directions and its
     first line climbs into the .kick lockup -- which is how "THE SCHEDULE" ended
     up printed across the wordmark on the pricing page. The overflow guard never
     fired because nothing overflowed: the block fits, it just sits in the wrong
     place. .tradewrap already started at 150px and never had the fault, which is
     the tell that this was an oversight rather than a decision. */
  .stmtwrap { position: absolute; left: 88px; right: 88px; top: ${SPACE.xl}px; bottom: 84px; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
  .tag { font-family: ${MONO}; font-size: 18px; letter-spacing: 0.12em; font-weight: 600; }
  .tag.green { color: ${GREEN}; }
  /* the amber tag has no Carta equivalent; there is one accent. */
  .tag.brasstag { color: ${GREEN}; }
  /* ON THE BAND THE ACCENT IS MINT. Deal Green on #131512 is about 2.2:1 —
     visible enough to pass a glance and well under the 4.5:1 floor for a 18px
     mono label. The closer is the one page where a .tag lands on dark, and it
     is the page carrying the call to action, so it is the worst place to lose
     a label. Caught by eye on the first Carta closer render, not by a checker:
     design-check.mts polices block-only tokens that lack a light override, and
     this is the mirror case — a LIGHT token with no dark override. */
  .pg.ink .tag.brasstag, .pg.dark .tag.brasstag,
  .pg.ink .tag.green, .pg.dark .tag.green { color: ${MINT}; }
  .pg.ink .stmt-h b, .pg.dark .stmt-h b { color: ${MINT}; }
  .pg.ink .blist li::before, .pg.dark .blist li::before { background: ${MINT}; }
  .stmt-h { margin-top: 26px; font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 58px; line-height: 1.1; letter-spacing: -0.012em; color: ${INK}; max-width: 880px; }
  .greenrule { width: 96px; height: 4px; background: ${GREEN}; margin: 36px 0; }
  .stmt-b { font-size: 27px; line-height: 1.55; color: ${BODY}; max-width: 820px; }
  .stmt-src { margin-top: 34px; font-family: ${MONO}; font-size: 17px; letter-spacing: 0.05em; color: ${TERT}; }

  /* ── the brand X ──────────────────────────────────────────────────────
     DESIGN.md §4: the logo's X is the only coloured glyph in the mark. A
     product name set in type matches it — Deal Green on paper, mint on the
     block, exactly as the two logo files do. Never jade: DESIGN.md is explicit
     that jade "cannot carry text". */
  .bx { color: ${GREEN}; }
  .pg.dark .bx { color: ${MINT}; }

  /* ── bullet list ──────────────────────────────────────────────────────
     DESIGN.md §4 gives list markers to Deal Green. Numbered discs use green
     with white type, which the palette table certifies at 5.3:1 — the reason
     the marker is Deal Green and never jade. */
  .blist { list-style: none; margin-top: 34px; max-width: 900px; }
  .blist li { position: relative; padding-left: 46px; font-size: 29px; line-height: 1.42;
              color: ${BODY}; margin-bottom: 26px; }
  .blist li:last-child { margin-bottom: 0; }
  .blist li b { color: ${INK}; font-weight: 700; }
  .blist li::before { content: ''; position: absolute; left: 0; top: 17px;
                      width: 22px; height: 4px; background: ${GREEN}; }
  .blist.num { counter-reset: b; }
  .blist.num li { padding-left: 74px; min-height: 46px; }
  /* A bold run inside a display head is the TURN — colour, not weight, the
     same device the cover hook uses. Bullets style their own <b> separately. */
  .stmt-h b { color: ${GREEN}; font-weight: ${DW}; }

  .splitrow { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px;
              align-items: start; margin-top: 34px; }
  .splitrow .blist { margin-top: 0; }
  .htable { width: 100%; border-collapse: collapse; }
  .htable th { font-family: ${MONO}; font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase;
               color: ${TERT}; font-weight: 500; text-align: left; padding-bottom: 14px;
               border-bottom: 2px solid ${INK}; }
  .htable th:last-child { text-align: right; }
  .htable td { font-size: 25px; line-height: 1.3; color: ${BODY}; padding: 17px 0;
               border-bottom: 1px solid ${HAIR}; }
  .htable td:last-child { text-align: right; color: ${INK}; font-weight: 700;
                          font-variant-numeric: tabular-nums; white-space: nowrap; }
  .htable tr.last td { color: ${INK}; font-weight: 700; border-bottom: none; }

  .blist.num li::before { counter-increment: b; content: counter(b); top: 0;
                          width: 46px; height: 46px; background: ${GREEN};
                          color: #fff; font-family: ${SANS}; font-weight: 700; font-size: 23px;
                          display: flex; align-items: center; justify-content: center; }
  .diagwrap { position: absolute; left: 88px; right: 88px; top: ${SPACE.xl}px; bottom: 84px; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
  .diag { display: flex; align-items: flex-end; gap: 72px; margin-top: 60px; }
  .col { display: flex; flex-direction: column; gap: 22px; }
  .bars { display: flex; align-items: flex-end; }
  .bar { width: 168px; position: relative; display: flex; align-items: flex-start; justify-content: center; }
  .bar.ink { background: transparent; border: 2px solid ${INK}; }
  .bar.green { background: ${GREEN}; }
  .barnum { margin-top: 20px; font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 46px; }
  .bar.ink .barnum { color: ${INK}; }
  .bar.green .barnum { color: ${WHITE}; }
  .collab { font-family: ${MONO}; font-size: 17px; letter-spacing: 0.04em; color: ${TERT}; line-height: 1.5; }
  .collab.strong { color: ${GREEN}; font-weight: 600; }
  .vs { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 52px; color: ${TERT}; padding-bottom: 130px; }
  .closer { position: absolute; inset: 0; padding: 96px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; z-index: 1; }
  .ct-head { margin-top: ${SPACE.xs}px; font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 48px; line-height: 1.16; letter-spacing: -0.012em; color: ${IVORY}; max-width: ${(1080 - SPACE.md * 2).toFixed(1)}px; }
  .ct-rule { margin: ${SPACE.sm}px 0; height: 4px; width: 96px; background: ${MINT}; }
  .ct-body { font-size: 29px; line-height: 1.5; color: ${IVORY_SUB}; max-width: 800px; }
  .ct-sign { margin-top: 56px; display: flex; align-items: center; gap: 22px; }
  .ct-who { text-align: left; }
  .ct-name { font-size: 26px; font-weight: 700; color: ${IVORY}; letter-spacing: -0.01em; }
  .ct-tag2 { margin-top: 3px; font-size: 19px; color: ${IVORY_SUB}; }
  .ct-brand { margin-top: 44px; display: flex; flex-direction: column; align-items: center; gap: 22px; }
  .follow { font-family: ${MONO}; font-size: 18px; letter-spacing: 0.14em; color: ${MINT}; font-weight: 600; }
  .tradewrap { position: absolute; left: 88px; right: 88px; top: 150px; bottom: 116px; display: flex; align-items: center; gap: 54px; z-index: 1; }
  .trade-txt { flex: 1; min-width: 0; }
  .trade-num { font-weight: 800; font-size: 100px; line-height: 0.92; letter-spacing: -0.03em; color: ${INK}; }
  .trade-num .tunit { font-size: 58px; }
  .tradewrap.noimg .trade-num { font-size: 224px; }
  .brassbar.tbar { margin: 22px 0 22px; }
  .trade-h { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 40px; line-height: 1.15; letter-spacing: -0.01em; color: ${INK}; }
  .tradewrap.noimg .trade-h { font-size: 50px; max-width: 900px; }
  .trade-b { margin-top: 20px; font-size: 23px; line-height: 1.5; color: ${BODY}; }
  .tradewrap.noimg .trade-b { font-size: 26px; max-width: 860px; }
  /* AN IMAGE FRAME — square, 1px ink, wearing the four corner handles. The
     handles sit at -4px, OUTSIDE the border, so the frame itself must not clip:
     the overflow moved to an inner .trade-clip. Clip the picture, never the
     frame. */
  .trade-img { width: 404px; height: 604px; flex: none; background: ${WHITE}; border: 1px solid ${INK}; position: relative; }
  .trade-clip { position: absolute; inset: 0; overflow: hidden; }
  .trade-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  ${handleCss()}
  ${handleColorCss('.pg.ink', CARTA.darkInk)}
  ${handleColorCss('.pg.dark', CARTA.darkInk)}`;
}

/** A complete deck document, ready to hand to Chromium. */
export function deckDocument(deck: any, a: DeckAssets, fontCss: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontCss}</style>
<style>${deckCss()}</style></head><body>${deckPages(deck, a).join('')}</body></html>`;
}
