/**
 * Per-page <title> / description / canonical for the public practice site
 * (2026-08-01).
 *
 * WHY THIS EXISTS. Every public page was serving the SAME title and the same
 * meta description — the landing, /about, /industries, /track-record,
 * /research and all five /buyers/* pages, ten URLs answering to one string.
 * `usePageMeta` already existed but only ReportPage called it, so the reports
 * were the only pages that ever described themselves. In search results every
 * page looked identical, and there was no `rel=canonical` anywhere on the
 * site.
 *
 * The shape follows `shared/reports.ts`, which solved the same problem for
 * reports: ONE register that the SERVER stamps into index.html (LinkedIn,
 * Slack and X do not run JS, so a posted link previews from the served HTML)
 * and the CLIENT re-applies on SPA navigation (so the tab and history are
 * right when you move between pages without a reload). Both read this file, so
 * the two cannot disagree.
 *
 * COPY LAW. Descriptions are drawn from each page's OWN copy — the same
 * zero-hallucination rule the report abstracts follow. Nothing here may claim
 * something the page does not say. Two consequences worth naming:
 *   - /track-record's description carries the attribution shield, because the
 *     search snippet is a place those figures appear without the page around
 *     them, and the doctrine is that the shield goes WHEREVER they appear.
 *   - /industries states no directional market numbers, per that page's own
 *     copy law.
 *
 * Segment entries are DERIVED from `shared/segments.ts` rather than retyped,
 * so a copy change on a segment page updates its search result too.
 */
import { SEGMENTS } from './segments.js';

export interface PageMeta {
  /** Path this describes, without a trailing slash ('/' for the landing). */
  path: string;
  /** Full <title>. Includes the brand suffix — this is the literal string. */
  title: string;
  /** Meta description AND og:description. Drawn from the page's own copy. */
  description: string;
}

/**
 * What a search result actually shows before it truncates. These are not
 * style preferences — past them the tail is replaced with an ellipsis, and a
 * sentence that ends mid-clause reads worse than a shorter one that doesn't.
 * `scripts/build-sitemap.mts` warns on any entry that exceeds them.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** The brand suffix, applied once so it cannot drift between entries. */
const SITE = 'smbX.ai';

const STATIC_PAGES: PageMeta[] = [
  {
    path: '/',
    title: `${SITE} — Buy-side corporate development for humans.`,
    description:
      'An on-demand corporate development team that guides your acquisition from thesis to close. We build value by applying operator instincts to the buy-side.',
  },
  {
    path: '/about',
    title: `About — a new firm, decades of execution | ${SITE}`,
    description:
      'A dedicated corporate development function for buyers in the lower middle market — on demand, exclusively on their side of the table. Founded by Paul Baker.',
  },
  {
    path: '/industries',
    title: `Industries — buy-side M&A by vertical | ${SITE}`,
    description:
      'Buy-side M&A for acquirers of private companies under $250M in revenue. The sector theses behind the verticals we hunt, and the rules that shape each.',
  },
  {
    // The shield, compressed but not weakened. It has to survive truncation,
    // so the three load-bearing facts come first: led OR CO-LED, during
    // EMPLOYMENT, and NOT smbX engagements. A shield cut off mid-clause by a
    // search result would be worse than a shorter one that lands intact.
    // EMPLOYERS NAMED (2026-08-07, anonymization REVERSED — the retired
    // "aggregator / global investment bank" euphemisms must not be
    // reinstated; the fidelity audit caught this snippet still carrying them).
    path: '/track-record',
    title: `Track record — one side of the table | ${SITE}`,
    description:
      'Selected transactions led or co-led by Paul Baker while employed at Wrench Group and JPMorgan Chase — completed by those firms, not smbX engagements.',
  },
  {
    path: '/legal/terms',
    title: `Terms of use | ${SITE}`,
    description:
      "The terms for this site's tools — the market-map engine and the owner valuation: what you share with them, and what their outputs are and are not.",
  },
  {
    path: '/legal/privacy',
    title: `Privacy policy | ${SITE}`,
    description:
      'What smbx.ai collects, how it is used, and your rights — including removal at any time.',
  },
  {
    path: '/research',
    title: `Research — published market assessments | ${SITE}`,
    description:
      'Full buy-side market assessments from the practice, every number cited to its source. Read the whole report on the page, or have the PDF delivered.',
  },
];

/**
 * Segment pages, derived from the segment copy itself.
 *
 * `cardBody` is the one-line summary each segment already carries for the
 * landing's who-index — which is precisely what a meta description is, so it
 * is used rather than a second summary written to sit beside it.
 */
const SEGMENT_PAGES: PageMeta[] = SEGMENTS.map(s => ({
  path: `/buyers/${s.slug}`,
  // The page's own h1 was tried here first and it is too long — every segment
  // landed at 67–87 characters, so the distinguishing half was the half that
  // got truncated away. The h1's argument belongs in the description, which
  // has 160 characters to spend; the title only has to say WHO the page is
  // for and WHAT the site is.
  title: `${s.cardTitle} — buy-side M&A | ${SITE}`,
  description: s.cardBody,
}));

export const PAGE_META: PageMeta[] = [...STATIC_PAGES, ...SEGMENT_PAGES];

/**
 * Look up a path. Tolerates a trailing slash and a query string, because this
 * runs against real request URLs on the server as well as `location.pathname`
 * on the client.
 */
export function findPageMeta(rawPath: string): PageMeta | undefined {
  const p = String(rawPath || '/').split('?')[0].split('#')[0];
  const norm = p.length > 1 ? p.replace(/\/+$/, '') : '/';
  return PAGE_META.find(m => m.path === norm);
}
