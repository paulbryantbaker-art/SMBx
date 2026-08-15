/**
 * THE house report grammar — the cover, the CSS and the document skeleton for a
 * long-form Letter-format PDF report.
 *
 * Sibling to `house/deck.ts` (carousels) and built for the same reason. Paul,
 * 2026-08-15: *"i want all decks, docs and collateral for a client to have the
 * same look and feel as the branded smbx collateral — it will just have whose
 * it's for on the cover too… i just want to have consistency in design
 * languages."*
 *
 * Before this file there were two report renderers in two different languages:
 * `scripts/studio/build-report.mts` in CARTA (flat #131512 cover, Source Serif
 * 4, one green accent, radius 0, palette-guarded, renderer-proof asserted) and
 * `server/services/researchComposer.researchReportHtml` in LEDGER (Fraunces,
 * brass, a bone card at radius 14 with a box-shadow, no cover page, no guard).
 * The second would fail `assertCarta` outright — it names a retired typeface
 * and retired hexes. Same practice, same artifact, two houses.
 *
 * THE CSS BELOW IS LIFTED VERBATIM from build-report.mts, deliberately. This is
 * an extraction, not a redesign: every report Paul has already built must
 * render byte-identically after it, or the change cannot be reviewed by looking
 * at one. The app is what moves — onto this.
 *
 * Pure by construction, exactly like `house/deck.ts`: no fs, no db, no env, no
 * clock, no marked. Callers parse their own markdown and resolve their own
 * images — disk for the local CLI, `studio_assets` for the app — and pass data
 * URIs in through `ReportAssets`. Same spec + same assets → same bytes,
 * wherever it runs. `house/__tests__/engine-parity.test.mts` is what keeps that
 * true.
 */
import {
  CARTA, REPORT, CARTA_TYPE, CARTA_DISPLAY_WEIGHT, CARTA_HANDLE,
  HANDLE_HTML, handleCss, flatten, cartaBand,
} from './tokens.js';
import { esc } from './assets.js';

/* Local aliases so the lifted CSS reads unchanged against build-report.mts.
   REPORT.body #3F464C is the one Ledger-era value the Carta pass keeps on
   purpose: long-form reading wants more contrast than a slide glanced at for
   two seconds, and the site's own report pages use that exact ink. */
const INK = CARTA.ink, BODY = REPORT.body, TERT = CARTA.muted, GREEN = CARTA.green;
const CV_TEXT = CARTA.darkInk;
const CV_SUB = CARTA.darkSub;
const CV_FAINT = CARTA.darkMuted;
const CV_LINE = CARTA.darkSeam;
const CV_PLATE = CARTA.darkPlate;
const HAIR = CARTA.hair, MINT = CARTA.mint;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;
const DW = CARTA_DISPLAY_WEIGHT;

/** The report body sets no background, so the page ground is the print white.
 *  Every flatten() call blends over THIS — change one, change both. */
export const REPORT_PAGE = '#FFFFFF';

/** Letter 8.5in less the two 0.75in print margins. The cover rasterizes at this
 *  width; exported because the renderer needs it and it must not drift. */
export const REPORT_COVER_W_IN = 7.0;

/** The Chromium print margins every house report uses. */
export const REPORT_MARGIN = {
  top: '0.55in', bottom: '0.7in', left: '0.75in', right: '0.75in',
} as const;

export interface ReportAssets {
  /** white wordmark for the dark cover */
  logoWhite: string;
  /** Paul's real headshot, already a data URI — never a stock face (house law) */
  headshot: string;
  /** the cover hero, already resolved; null renders the cover without one */
  hero: string | null;
}

export interface ReportStat { n: string; l: string }

export interface ReportSpec {
  /** the mono kicker above the title, e.g. MARKET ASSESSMENT */
  eyebrow: string;
  /** rendered title markup — an <h1>, optionally an <h2>, then the mint rule */
  titleHtml: string;
  /**
   * WHOSE IT IS FOR (Paul, 2026-08-15) — the single thing that distinguishes a
   * client document from published collateral, and the reason a client deck can
   * wear the same house language without ever being mistaken for a public one.
   *
   * It renders on the DARK cover as a plated line under the byline rule, not as
   * a watermark and not in the running footer: a reader who opens the PDF to
   * page 4 and forwards it should still be able to see, from the cover, who
   * commissioned it. Empty string → the line does not render at all, which is
   * the published-collateral case.
   *
   * THE LINE applies to what goes in it: a client's name is fine, a client's
   * mandate is not. Hold period, check size and leverage tolerance never reach
   * a page — see workspace-CLAUDE.md's engagement-confidentiality rule.
   */
  preparedFor?: string;
  /** "by the numbers" plates under the title */
  stats?: ReportStat[];
  /** framed cards — the cover's numbered list, or the app's key findings */
  cards?: Array<{ tag: string; body: string }>;
  /** whatever cover prose survives after the title and the list are pulled out */
  introHtml?: string;
  byline: { name: string; role: string };
  /** the rendered body, already accented and section-numbered by the caller */
  bodyHtml: string;
  /** false → the body leads with `##` and those become the page-breaking parts */
  bodyHasH1: boolean;
  /** the running-footer label, already escaped */
  footerLabel: string;
  /** an appendix that starts on its own page — sources, method notes */
  appendixHtml?: string;
  /** the closing legal line; omitted rather than defaulted, so it is a choice */
  disclaimer?: string;
}

/* ── cover configuration, parsed from the `<!--cover …-->` comment ─────── */

export interface ReportCoverConfig {
  byline: string;
  role: string;
  headshot: string;
  image: string;
  imagePos: string;
  footer: string;
  eyebrow: string;
  preparedFor: string;
  stats: ReportStat[];
  accents: Array<{ match: string; img: string; pos: string }>;
}

/**
 * Split a report markdown file into its cover, its body and its config.
 *
 * Convention: everything before the FIRST `---` is the cover; everything after
 * flows as the body.
 *
 * The initializer below carries EVERY key the parser can assign, including the
 * optional ones. That is not tidiness — the parser assigns with `k in cfg`, so
 * a key declared only in the type is silently dropped, which is exactly how
 * `eyebrow:` in a cover block did nothing for a while.
 */
export function parseReportMarkdown(raw: string): {
  cfg: ReportCoverConfig;
  coverMd: string;
  bodyMd: string;
  bodyHasH1: boolean;
} {
  const rawMd = raw.replace(/\r\n/g, '\n');
  const splitIdx = rawMd.indexOf('\n---\n');
  const coverMdRaw = splitIdx >= 0 ? rawMd.slice(0, splitIdx).trim() : '';
  const bodyMd = splitIdx >= 0 ? rawMd.slice(splitIdx + 5).trim() : rawMd;

  const cfg: ReportCoverConfig = {
    byline: 'Paul Baker',
    role: 'smbX.ai · Buy-side corporate development',
    headshot: '', image: '', imagePos: '50% 50%', footer: '', eyebrow: '',
    preparedFor: '', stats: [], accents: [],
  };
  const cfgMatch = coverMdRaw.match(/<!--\s*cover([\s\S]*?)-->/i);
  const coverMd = (cfgMatch ? coverMdRaw.replace(cfgMatch[0], '') : coverMdRaw).trim();
  if (cfgMatch) {
    for (const line of cfgMatch[1].split('\n')) {
      const m = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
      if (!m) continue;
      const [, k, v] = m;
      if (k === 'stat') {
        const bar = v.indexOf('|');
        cfg.stats.push(bar >= 0
          ? { n: v.slice(0, bar).trim(), l: v.slice(bar + 1).trim() }
          : { n: v.trim(), l: '' });
      } else if (k === 'accent') {
        const p = v.split('|').map(s => s.trim());
        cfg.accents.push({ match: p[0] || '', img: p[1] || '', pos: p[2] || '50% 50%' });
      } else if (k === 'for' || k === 'preparedFor') {
        cfg.preparedFor = v;
      } else if (k in cfg) {
        (cfg as any)[k] = v;
      }
    }
  }
  return { cfg, coverMd, bodyMd, bodyHasH1: /^# /m.test(bodyMd) };
}

/**
 * Pull the title (and optional subtitle) out of rendered cover HTML, append the
 * mint rule, and hand back what remains.
 *
 * The ampersand fix travels with it: Fraunces shipped a swash ampersand that
 * made "M&A" unrecognisable at title size, and while Source Serif 4 is better
 * behaved, a title is the wrong place to discover that a face has opinions.
 * The ampersand is set in the sans; it is the only character that needs it.
 */
export function splitTitle(coverHtml: string): { titleHtml: string; restHtml: string; plainTitle: string } {
  let titleHtml = '', rest = coverHtml, plainTitle = '';
  const h1m = rest.match(/<h1[\s\S]*?<\/h1>/i);
  if (h1m) {
    titleHtml += h1m[0];
    plainTitle = h1m[0].replace(/<[^>]+>/g, '').trim();
    rest = rest.replace(h1m[0], '');
  }
  const h2m = rest.match(/<h2[\s\S]*?<\/h2>/i);
  if (h2m) { titleHtml += h2m[0]; rest = rest.replace(h2m[0], ''); }
  titleHtml += '<div class="rule"></div>';
  titleHtml = titleHtml.replace(/&amp;/g, '<span class="amp">&amp;</span>');
  return { titleHtml, restHtml: rest, plainTitle };
}

/** The cover's numbered list becomes framed cards. Pure string work. */
export function listToCards(html: string): string {
  return html.replace(/<ol>([\s\S]*?)<\/ol>/i, (_m, inner: string) => {
    let i = 0;
    const cards = inner.replace(/<li>([\s\S]*?)<\/li>/gi, (_x: string, li: string) =>
      `<div class="cv-card"><span class="cv-cardno">${String(++i).padStart(2, '0')}</span><div class="cv-cardbody">${li.trim()}</div></div>`);
    return `<div class="cv-cards">${cards}</div>`;
  });
}

/** Tag every `<h2>` with its ordinal so accents and thumbnails can anchor. */
export function numberSections(bodyHtml: string): string {
  let n = 0;
  return bodyHtml.replace(/<h2(\s[^>]*)?>/gi, (_m, attrs) => `<h2 id="sec-${n++}"${attrs ?? ''}>`);
}

/* ── the stylesheet ───────────────────────────────────────────────────── */

/** The whole report stylesheet. Verbatim from build-report.mts plus `.cv-for`. */
export function reportCss(): string {
  return `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: ${SANS}; color: ${BODY}; font-size: 10.5pt; line-height: 1.5; font-variant-numeric: tabular-nums; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* cover (dark boardroom title card, fills page 1 within the print margins) */
  /* THE COVER IS FLAT AND SQUARE. Ledger built this ground as a composite —
     blackbleed plaster, an ink veil at 0.34, and three radial blooms placed to
     keep the byline corner clear. Carta deletes the whole stack: the band is a
     colour. The 12px radius goes with it; radius is 0 everywhere except
     buttons and inputs. */
  .cover { position: relative; min-height: 9.35in; padding: 0.44in 0.58in 0.4in; background: ${cartaBand()}; color: ${CV_TEXT}; page-break-after: always; display: flex; flex-direction: column; }
  .cover > * { position: relative; z-index: 1; }
  /* THE COVER PANEL. An inset hairline bracket with the four handles at its
     corners — the house gesture, and the thing that was missing when this cover
     read as "the old layout with the texture turned off". */
  .cv-frame { position: absolute; inset: 0.22in; border: 1px solid ${CV_LINE}; pointer-events: none; z-index: 0; }
  ${handleCss(CARTA.darkInk)}
  /* the small cut on a stat plate — 7px at -4px */
  .cv-stat .hdl { width: ${CARTA_HANDLE.sizeSmall}px; height: ${CARTA_HANDLE.sizeSmall}px; }
  /* logo is 4:1 — align-self stops the column flexbox from stretching it wide */
  .cv-logo { height: 25px; width: auto; align-self: flex-start; display: block; }
  /* THE KICKER: an 8px green square, then the label in darkMuted. Same
     construction as the deck and the one-pager; only the label colour moves
     between grounds. */
  .cv-eyebrow { font-family: ${MONO}; font-size: 9.5pt; letter-spacing: 0.16em; color: ${CV_FAINT}; margin-top: 0.22in; }
  .cv-eyebrow::before { content: ''; display: inline-block; width: 8px; height: 8px; background: ${GREEN}; margin-right: 9px; vertical-align: 0.5px; }
  /* Discretionary ligatures OFF. Fraunces shipped a swash ampersand that read
     as a glyph nobody recognises in a title like "Home Services M&A"; Source
     Serif 4 is better behaved, but a title is the wrong place to find out that
     a face has opinions, so the switch stays. */
  .cover h1 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 26pt; line-height: 1.04; letter-spacing: -0.012em; color: ${CV_TEXT}; margin: 0.1in 0 0.1in; max-width: 6.1in; text-wrap: balance;
    font-variant-ligatures: none; }
  .cover h1 .amp { font-family: ${SANS}; font-weight: 500; font-size: 0.86em; }
  .cover h2 { font-family: ${SANS}; font-weight: 500; font-size: 12.5pt; line-height: 1.4; color: ${CV_SUB}; margin: 0 0 0.03in; max-width: 5.9in; }
  .cover .rule { width: 84px; height: 4px; background: ${MINT}; margin: 0.06in 0 0.2in; }
  /* optional framed hero image on the cover (like the carousel cover) */
  /* AN IMAGE FRAME — square, hairline, no shadow. The drop shadow went with
     the radius: a translucent shadow is a PDF transparency group, which is the
     renderer-proof law's whole subject, and Carta has no soft edges to justify
     carrying one. */
  .cv-heroframe { position: relative; border: 1px solid ${CV_LINE}; margin: 0 0 0.16in; }
  .cv-heroclip { overflow: hidden; display: block; }
  .cv-hero { width: 100%; height: 2.05in; object-fit: cover; display: block; }
  .cover p, .cover li { color: ${CV_SUB}; font-size: 10pt; line-height: 1.5; margin: 0 0 0.07in; }
  .cover strong { color: ${CV_TEXT}; font-weight: 600; }
  .cover em { color: ${MINT}; font-style: italic; }
  .cover ol { padding-left: 1.1em; margin: 0.06in 0; }

  /* "by the numbers" stat band — square label plates, reading-ink numerals.
     Ledger set the figure itself in brass; Carta sets it in darkInk and lets
     the green kicker square above be the page's accent. */
  .cv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 0.02in 0 0.16in; }
  .cv-stat { position: relative; border: 1px solid ${CV_LINE}; padding: 11px 13px 12px; background: ${CV_PLATE}; }
  .cv-stat .n { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 19pt; line-height: 1; color: ${CV_TEXT}; letter-spacing: -0.01em; }
  .cv-stat .l { font-family: ${MONO}; font-size: 6.6pt; letter-spacing: 0.05em; text-transform: uppercase; color: ${CV_FAINT}; margin-top: 6px; line-height: 1.4; }

  /* framed workstream cards (the cover's numbered list) */
  .cv-cards { display: flex; flex-direction: column; gap: 7px; margin: 0.05in 0 0.1in; }
  .cv-card { display: flex; gap: 11px; align-items: baseline; border: 1px solid ${CV_LINE}; border-left: 2.5px solid ${MINT}; padding: 9px 13px; background: ${CV_PLATE}; }
  .cv-cardno { font-family: ${MONO}; font-size: 8pt; color: ${MINT}; letter-spacing: 0.06em; flex: none; }
  .cv-cardbody { color: ${CV_SUB}; font-size: 9.5pt; line-height: 1.48; }
  .cv-cardbody em { color: ${CV_TEXT}; font-style: italic; font-weight: 500; }

  /* owner byline — headshot disc pinned to the bottom of the cover */
  /* The byline pins to the foot, so everything above it needs somewhere to
     go. WITH a hero the block sits top-aligned and the image carries the
     middle; WITHOUT one there is nothing to fill that space, and the cover
     reads as a hole — so the block centres instead. */
  .cv-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .cover.nohero .cv-body { justify-content: center; padding-bottom: 0.3in; }
  .cv-byline { margin-top: auto; display: flex; align-items: center; gap: 13px; padding-top: 0.16in; border-top: 1px solid ${CV_LINE}; }
  .cv-face { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; object-position: 50% 20%; border: 2px solid ${CARTA.chipBorder}; flex: none; }
  .cv-by-name { font-family: ${SANS}; font-weight: 600; font-size: 11pt; color: ${CV_TEXT}; }
  .cv-by-role { font-family: ${MONO}; font-size: 7.6pt; letter-spacing: 0.05em; color: ${CV_FAINT}; margin-top: 3px; text-transform: uppercase; }

  /* WHOSE IT IS FOR — the client line. A plate on the same rule as the byline,
     pushed to the opposite end, so the cover reads "by … / for …" across one
     line rather than stacking a second block under the headshot. Mono and
     small: this is a register entry, not a headline, and a client's name set at
     display size starts to look like a co-brand. */
  .cv-for { margin-left: auto; text-align: right; flex: none; max-width: 3.1in; }
  .cv-for .fl { font-family: ${MONO}; font-size: 6.6pt; letter-spacing: 0.14em; text-transform: uppercase; color: ${CV_FAINT}; }
  .cv-for .fn { font-family: ${SANS}; font-weight: 600; font-size: 10.5pt; color: ${CV_TEXT}; margin-top: 4px; line-height: 1.25; }

  /* body */
  .rbody h1 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 21pt; line-height: 1.08; letter-spacing: -0.01em; color: ${INK}; page-break-before: always; margin: 0 0 0.12in; padding-top: 0.16in; border-top: 2.5px solid ${INK}; }
  .rbody h2 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 14.5pt; line-height: 1.15; color: ${INK}; margin: 0.26in 0 0.07in; page-break-after: avoid; }
  .rbody h3 { font-family: ${SANS}; font-weight: 700; font-size: 11.5pt; color: ${INK}; margin: 0.17in 0 0.04in; page-break-after: avoid; }
  /* reports that lead with ## (no # parts): promote ## to the page-breaking part header */
  .rbody.noh1 h2 { page-break-before: always; font-size: 17pt; margin: 0 0 0.11in; padding-top: 0.16in; border-top: 2.5px solid ${INK}; }
  .rbody.noh1 h2:first-child { page-break-before: avoid; border-top: none; padding-top: 0; }
  /* inline section accent — framed photo band on the bone page (renderer-safe) */
  /* No box-shadow: a translucent drop shadow is a PDF transparency group, and
     the hairline border does the same job on paper. Renderer-proof law. */
  .rb-accent { display: block; width: 100%; height: 2.2in; object-fit: cover; border: 1px solid ${INK}; margin: 0.05in 0 0.22in; page-break-inside: avoid; }
  /* A blockquote in a report is a NOTICE — a correction, a caveat, something
     the reader must not skim past. Ledger gave it a brass rail; Carta has one
     accent, so it takes a green rail over the green tint. Square, and the fill
     is flattened rather than translucent — see the renderer-proof law below. */
  blockquote { margin: 0.18in 0; padding: 0.14in 0.2in; border-left: 3px solid ${GREEN};
    background: ${flatten(CARTA.green, 0.05, REPORT_PAGE)}; page-break-inside: avoid; }
  blockquote p { margin: 0 0 0.08in; font-size: 9.5pt; line-height: 1.55; }
  blockquote p:last-child, blockquote ol:last-child, blockquote ul:last-child { margin-bottom: 0; }
  blockquote ol, blockquote li { font-size: 9.5pt; line-height: 1.55; }
  .rbody p { margin: 0 0 0.11in; }
  .rbody strong { color: ${INK}; font-weight: 600; }
  .rbody em { font-style: italic; }
  .rbody ul, .rbody ol { margin: 0 0 0.12in; padding-left: 1.25em; }
  .rbody li { margin: 0 0 0.045in; }
  .rbody li::marker { color: ${GREEN}; }
  .rbody ul ul, .rbody ol ol, .rbody ul ol, .rbody ol ul { margin: 0.04in 0 0.04in; }
  .rbody hr { display: none; }
  a { color: ${GREEN}; text-decoration: none; }

  /* tables — hairline, bone header, tabular figures */
  .rbody table { width: 100%; border-collapse: collapse; margin: 0.12in 0 0.2in; font-size: 8.4pt; line-height: 1.34; }
  /* The GFM table head plate. REPORT.tableHead is a Ledger-era warm bone;
     Carta's neutral panel is the same job without the warmth. */
  .rbody thead { background: ${CARTA.panel}; }
  .rbody th { font-family: ${MONO}; font-size: 7.4pt; letter-spacing: 0.03em; text-transform: uppercase; color: ${INK}; text-align: left; padding: 6px 8px; border-bottom: 1.5px solid ${INK}; vertical-align: bottom; }
  .rbody td { padding: 5px 8px; border-bottom: 1px solid ${HAIR}; color: ${BODY}; vertical-align: top; }
  .rbody tr { page-break-inside: avoid; }
  .rbody td strong { color: ${INK}; }
  .rbody em { color: ${TERT}; }

  /* appendix — sources, method notes. Starts its own page. */
  .appendix { page-break-before: always; }
  .appendix h2 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 17pt; color: ${INK}; margin: 0 0 0.11in; padding-top: 0.16in; border-top: 2.5px solid ${INK}; }
  .srcs { margin: 0; padding-left: 1.2em; font-size: 8.5pt; color: ${BODY}; }
  .srcs li { margin-bottom: 7px; }
  .srcs .st { font-weight: 600; color: ${INK}; }
  .srcs a { color: ${GREEN}; text-decoration: none; word-break: break-all; }

  .disc { margin-top: 0.26in; padding-top: 0.12in; border-top: 1px solid ${HAIR}; font-size: 7.5pt; color: ${TERT}; line-height: 1.5; }
`;
}

/* ── the pieces ───────────────────────────────────────────────────────── */

export function statBandHtml(stats: ReportStat[] | undefined): string {
  if (!stats || !stats.length) return '';
  return `<div class="cv-stats">${stats.map(s =>
    `<div class="cv-stat"><div class="n">${s.n}</div>${s.l ? `<div class="l">${s.l}</div>` : ''}${HANDLE_HTML}</div>`,
  ).join('')}</div>`;
}

/** Framed cards from explicit content — the app's key findings take this path. */
export function cardsHtml(cards: ReportSpec['cards']): string {
  if (!cards || !cards.length) return '';
  return `<div class="cv-cards">${cards.map(c =>
    `<div class="cv-card"><span class="cv-cardno">${esc(c.tag)}</span><div class="cv-cardbody">${c.body}</div></div>`,
  ).join('')}</div>`;
}

export function heroHtml(hero: string | null, pos = '50% 50%'): string {
  if (!hero) return '';
  return `<div class="cv-heroframe"><div class="cv-heroclip"><img class="cv-hero" style="object-position:${esc(pos)}" src="${hero}"></div>${HANDLE_HTML}</div>`;
}

export function bylineHtml(byline: { name: string; role: string }, headshot: string, preparedFor?: string): string {
  const face = headshot ? `<img class="cv-face" src="${headshot}">` : '';
  const forBlock = preparedFor
    ? `<div class="cv-for"><div class="fl">Prepared for</div><div class="fn">${esc(preparedFor)}</div></div>`
    : '';
  return `<div class="cv-byline">${face}<div><div class="cv-by-name">${esc(byline.name)}</div><div class="cv-by-role">${esc(byline.role)}</div></div>${forBlock}</div>`;
}

export function coverHtml(spec: ReportSpec, assets: ReportAssets, heroMarkup: string): string {
  return `<section class="cover${heroMarkup ? '' : ' nohero'}">
    <div class="cv-frame">${HANDLE_HTML}</div>
    ${assets.logoWhite ? `<img class="cv-logo" src="${assets.logoWhite}">` : ''}
    <div class="cv-body">
      <div class="cv-eyebrow">${esc(spec.eyebrow)}</div>
      ${spec.titleHtml}
      ${heroMarkup}
      ${statBandHtml(spec.stats)}
      ${cardsHtml(spec.cards)}
      ${spec.introHtml ?? ''}
    </div>
    ${bylineHtml(spec.byline, assets.headshot, spec.preparedFor)}
  </section>`;
}

/**
 * The whole document.
 *
 * `fontCss` is injected rather than imported because embedding the woff2s reads
 * files, and this module does no I/O. Callers pass `cartaFontFaceCss()` — and
 * it must be the CARTA set, not the Ledger one: the CSS above names Source
 * Serif 4 and Schibsted Grotesk, and a missing @font-face is a silent
 * substitution rather than an error. That exact mismatch shipped on the
 * carousel from both sides for a week (see engine-parity.test.mts).
 */
export function reportDocument(spec: ReportSpec, assets: ReportAssets, fontCss: string, heroPos = '50% 50%'): string {
  const hero = heroHtml(assets.hero, heroPos);
  const appendix = spec.appendixHtml
    ? `<section class="appendix">${spec.appendixHtml}</section>`
    : '';
  const disc = spec.disclaimer ? `<div class="disc">${esc(spec.disclaimer)}</div>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontCss}</style>
<style>${reportCss()}</style></head>
<body>
  ${coverHtml(spec, assets, hero)}
  <main class="rbody${spec.bodyHasH1 ? '' : ' noh1'}">${spec.bodyHtml}</main>
  ${appendix}
  ${disc}
</body></html>`;
}

/** The mono running footer. Shared so page numbering cannot drift either. */
export function reportFooterTemplate(footerLabel: string): string {
  return `<div style="width:100%;font-family:'IBM Plex Mono',monospace;font-size:7pt;color:${TERT};padding:0 0.75in;display:flex;justify-content:space-between;"><span>smbX.ai&nbsp;&nbsp;·&nbsp;&nbsp;${footerLabel}</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
}

/**
 * Strip the body and pin the page width, for the cover raster.
 *
 * THE RENDERER-PROOF LAW, applied to a report. A carousel rasterizes every page
 * because it is images anyway; a fifty-page report cannot, or it loses
 * selectable, searchable text. So the split is: the cover — one page, dark,
 * the only thing on it that produces /Shading — becomes a flat JPEG, and the
 * body stays real vector text with its few translucent fills flattened.
 */
export function coverOnlyDocument(doc: string): string {
  return doc
    .replace(/<main[\s\S]*?<\/main>/, '')
    .replace(/<section class="appendix"[\s\S]*?<\/section>/, '')
    .replace(/<div class="disc">[\s\S]*?<\/div>/, '')
    .replace('</head>', `<style>html,body{width:${REPORT_COVER_W_IN}in;background:${REPORT_PAGE};}</style></head>`);
}

/** Swap the live cover for its raster. */
export function withFlatCover(doc: string, coverDataUri: string): string {
  return doc
    .replace(/<section class="cover[\s\S]*?<\/section>\s*<main/, `<section class="cover-flat"><img src="${coverDataUri}"></section>\n  <main`)
    /* No border-radius on the flat cover: rounding it would clip, and a clip is
       another transparency group. A full-bleed rectangle measures 0. */
    .replace('</head>', '<style>.cover-flat{page-break-after:always;}.cover-flat img{display:block;width:100%;height:auto;}</style></head>');
}
