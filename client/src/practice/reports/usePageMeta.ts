/**
 * Per-report document title + description (2026-07-29).
 *
 * Google renders JS and will read what this sets. Social crawlers (LinkedIn,
 * Slack, X) generally do NOT run JS — their preview cards come from the tags
 * the SERVER stamps into index.html for `/reports/*` (see the SPA catch-all in
 * server/index.ts). Both paths read the same `shared/reports.ts` entries, so
 * they say the same thing.
 */
import { useEffect } from 'react';
import type { ReportMeta } from '@shared/reports';

const SITE_TITLE = 'smbX.ai — Buy-side corporate development';

function setMeta(selector: string, attr: string, name: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const made = !el;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute('content');
  el.setAttribute('content', content);
  return () => {
    if (made) el!.remove();
    else if (prev !== null) el!.setAttribute('content', prev);
  };
}

export function usePageMeta(report?: ReportMeta) {
  useEffect(() => {
    if (!report) return;
    const title = `${report.shortTitle} — ${report.kicker} | smbX.ai`;
    const prevTitle = document.title;
    document.title = title;

    const undo = [
      setMeta('meta[name="description"]', 'name', 'description', report.abstract),
      setMeta('meta[property="og:title"]', 'property', 'og:title', title),
      setMeta('meta[property="og:description"]', 'property', 'og:description', report.abstract),
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'article'),
    ];

    // Canonical: the report lives at exactly one URL.
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = `${window.location.origin}/research/${report.slug}`;
    document.head.appendChild(link);

    return () => {
      document.title = prevTitle;
      undo.forEach(fn => fn());
      link.remove();
    };
  }, [report]);
}
