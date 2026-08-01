/**
 * Per-page <title>/description/canonical on SPA navigation (2026-08-01).
 *
 * The SERVER already stamps these into index.html for the first load (see the
 * catch-all in server/index.ts) — that is the copy crawlers read, because
 * LinkedIn, Slack and X do not run JavaScript. This hook exists for the OTHER
 * half: once wouter takes over, moving from /about to /industries never
 * re-fetches the document, so without it the tab title, the history entry and
 * the canonical would all keep describing the page you arrived on.
 *
 * Both halves read `shared/pageMeta.ts`, so they cannot disagree.
 *
 * A path with no entry is left ALONE rather than reset to a site default —
 * `/research/:slug` is exactly that case: ReportPage sets its own richer meta
 * via `usePageMeta`, and a shell-level reset would race it and win.
 */
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { findPageMeta } from '@shared/pageMeta';

function upsertMeta(selector: string, attr: string, name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSiteMeta(): void {
  const [loc] = useLocation();
  useEffect(() => {
    const meta = findPageMeta(loc);
    if (!meta) return;

    document.title = meta.title;
    upsertMeta('meta[name="description"]', 'name', 'description', meta.description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);

    const href = window.location.origin + meta.path;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [loc]);
}
