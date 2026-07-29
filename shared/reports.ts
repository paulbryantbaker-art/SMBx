/**
 * Published research reports — the metadata both surfaces need (2026-07-29).
 *
 * Kept deliberately free of markdown: the CLIENT merges these entries with the
 * rendered report body (`vite-plugins/report-markdown.ts`), and the SERVER
 * reads the same entries to stamp per-report <title>/OG tags into index.html
 * so a link posted to LinkedIn previews as the report rather than as the
 * generic site card.
 *
 * Adding a report is three steps:
 *   1. Drop the markdown in `scripts/studio/reports/`.
 *   2. Build the artifacts:
 *        npx tsx scripts/studio/build-report.mts  scripts/studio/reports/<file>.md \
 *          --out content/reports --slug <slug>          # the gated PDF
 *        npx tsx scripts/studio/build-og-card.mts scripts/studio/reports/<file>.md \
 *          --slug <slug>                                # the link-preview card
 *   3. Add an entry here + one line in `client/src/practice/reports/registry.ts`.
 *
 * Note there is no `pdf` path here on purpose: the PDFs live in
 * `content/reports/`, OUTSIDE `client/public`, and are released only through
 * `/api/practice/reports/:slug/file` after the reader's email is verified.
 * A static path would be a way around the gate.
 *
 * Abstracts are drawn from each report's own executive summary — no claim
 * appears here that the report does not make (zero-hallucination law).
 */

export interface ReportMeta {
  /** URL segment: /reports/<slug> */
  slug: string;
  /** Label above the title. */
  kicker: string;
  /** Short title for cards, nav, and the browser tab (the full display title
   *  comes from the markdown's own `# ` heading). */
  shortTitle: string;
  /** Two sentences, faithful to the report's executive summary. */
  abstract: string;
  /** ISO date the report was published. */
  published: string;
  /** Human label for the date line. */
  publishedLabel: string;
  /** Stable image URL for link previews (crawlers can't read hashed bundles). */
  ogImage?: string;
}

export const REPORTS: ReportMeta[] = [
  {
    slug: 'commercial-mep',
    kicker: 'Market assessment',
    shortTitle: 'Commercial Mechanical, HVAC & Plumbing Services',
    abstract:
      'Commercial mechanical, HVAC and plumbing services are institutionalizing — pulled by a data-center demand shock, an accelerating but still-early consolidation cycle, and a persistent valuation gap between project-led and service-led operators. This assessment sizes the market against its own sources, maps the consolidators, and sets out the commercial-specific diligence stack that makes these deals materially harder than residential.',
    published: '2026-07-23',
    publishedLabel: 'July 2026',
    ogImage: '/reports/commercial-mep-cover.jpg',
  },
  {
    slug: 'home-services',
    kicker: 'Market assessment',
    shortTitle: 'Home Services: State of the Market',
    // Drawn from this edition's own executive summary. It deliberately states
    // NO six-trade combined total: the 2026-07-27 verification pass retired
    // that figure ("$753–768B", and "$835.5B" before it) because summing
    // sources of differing definition, vintage and scope manufactures a number
    // no source reports. The superseded July 23 edition led on it.
    abstract:
      'Fragmentation is the thesis, not market size: about 89% of the 112,088 firms in the combined NAICS 238220 code employ fewer than 20 people, and no single company commands 20% of any major vertical. The top of the market has re-rated — HVAC services cleared 9.5x EV/EBITDA across 2024–YTD 2026 against 13.3x across 2021–23, roughly four turns cheaper, while trophy platforms still clear 16–20x.',
    published: '2026-07-29',
    publishedLabel: 'July 2026',
    ogImage: '/reports/home-services-cover.jpg',
  },
];

export function findReport(slug: string): ReportMeta | undefined {
  return REPORTS.find(r => r.slug === slug);
}
