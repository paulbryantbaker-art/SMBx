/// <reference types="vite/client" />

/**
 * Research reports imported straight from their markdown source
 * (`vite-plugins/report-markdown.ts` renders them at build time, so no
 * markdown library ships to the browser). One `.md` feeds both the portable
 * PDF and the web page.
 */
declare module '*.md?report-meta' {
  export interface ReportStat { n: string; l: string }

  /** Everything a listing card needs — no body HTML, so it stays small. */
  const meta: {
    /** `# Title` from the cover block. */
    title: string;
    /** `## Subtitle` from the cover block. */
    subtitle: string;
    byline: string;
    role: string;
    eyebrow: string;
    footer: string;
    /** `stat:` lines — the key-findings band. */
    stats: ReportStat[];
    words: number;
    minutes: number;
    coverImage: string | null;
    coverPos: string;
    headshot: string | null;
  };
  export default meta;
}

declare module '*.md?report' {
  import type { ReportStat } from '*.md?report-meta';
  export interface ReportHeading { id: string; text: string; level: number }
  export interface ReportAccent { img: string; pos: string }

  const report: {
    title: string;
    subtitle: string;
    /** Remaining cover prose (preparer line, scope note) as HTML. */
    intro: string;
    byline: string;
    role: string;
    eyebrow: string;
    footer: string;
    stats: ReportStat[];
    /** `##`/`###` headings, in document order, with stable anchor ids. */
    toc: ReportHeading[];
    /** Body HTML. `@@ACCENT<n>@@` markers stand where accent photos go. */
    html: string;
    words: number;
    minutes: number;
    coverImage: string | null;
    coverPos: string;
    headshot: string | null;
    accents: ReportAccent[];
  };
  export default report;
}
