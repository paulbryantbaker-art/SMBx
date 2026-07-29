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
    kicker: 'Master assessment',
    shortTitle: 'Home Services M&A',
    abstract:
      'Six trades, more than $600B in combined U.S. revenue, and roughly 250,000 businesses — with no single entity commanding 20% share of any major vertical. This master assessment consolidates three research workstreams into one register: the capital environment, market sizing, the platform map, and what the 2024–2026 wave of recaps repriced.',
    published: '2026-07-23',
    publishedLabel: 'July 2026',
    ogImage: '/reports/home-services-cover.jpg',
  },
];

export function findReport(slug: string): ReportMeta | undefined {
  return REPORTS.find(r => r.slug === slug);
}
