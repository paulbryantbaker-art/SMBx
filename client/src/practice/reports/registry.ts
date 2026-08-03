/**
 * The client-side report registry — shared metadata joined to the rendered
 * markdown (2026-07-29).
 *
 * The `?report-meta` / `?report` imports are handled at BUILD time by
 * `vite-plugins/report-markdown.ts`, so the browser receives finished HTML: no
 * markdown parser in the bundle, no model, no API call. The very same markdown
 * file is what `scripts/studio/build-report.mts` renders to the downloadable
 * PDF, which is the point — the page and the PDF cannot drift.
 *
 * Meta is imported statically (small — it draws the cards and the masthead);
 * the body is imported DYNAMICALLY so each report's ~50 kB of HTML is its own
 * chunk, fetched only when someone opens that report.
 */
import { REPORTS, type ReportMeta } from '@shared/reports';

import commercialMepMeta from '../../../../scripts/studio/reports/commercial-mep-buy-side-assessment.md?report-meta';
import homeServicesMeta from '../../../../scripts/studio/reports/home-services-state-of-market.md?report-meta';
import dfwHomeServicesMeta from '../../../../scripts/studio/reports/dfw-home-services.md?report-meta';

/** Cover data + read time — everything except the body. */
export type ReportSummary = typeof commercialMepMeta;

/** The full rendered report, including HTML and the contents tree. */
export type ReportBody = Awaited<
  ReturnType<(typeof BODY_LOADERS)[keyof typeof BODY_LOADERS]>
>['default'];

const SUMMARIES: Record<string, ReportSummary> = {
  'commercial-mep': commercialMepMeta,
  'home-services': homeServicesMeta,
  'dfw-home-services': dfwHomeServicesMeta,
};

const BODY_LOADERS = {
  'commercial-mep': () => import('../../../../scripts/studio/reports/commercial-mep-buy-side-assessment.md?report'),
  'home-services': () => import('../../../../scripts/studio/reports/home-services-state-of-market.md?report'),
  'dfw-home-services': () => import('../../../../scripts/studio/reports/dfw-home-services.md?report'),
};

export interface Report extends ReportMeta {
  summary: ReportSummary;
}

/** Published reports, newest first. */
export const REPORT_LIST: Report[] = REPORTS
  .filter(m => SUMMARIES[m.slug])
  .map(m => ({ ...m, summary: SUMMARIES[m.slug] }))
  .sort((a, b) => b.published.localeCompare(a.published));

export function getReport(slug: string): Report | undefined {
  return REPORT_LIST.find(r => r.slug === slug);
}

/** Fetch a report's body chunk. Resolves undefined for an unknown slug. */
export async function loadReportBody(slug: string): Promise<ReportBody | undefined> {
  const load = BODY_LOADERS[slug as keyof typeof BODY_LOADERS];
  if (!load) return undefined;
  return (await load()).default;
}
