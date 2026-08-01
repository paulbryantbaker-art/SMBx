/**
 * Regenerate client/public/sitemap.xml from the registers (2026-08-01).
 *
 * The hand-maintained sitemap went stale the day the product pivot retired the
 * old marketing pages: it kept advertising /sell, /buy, /raise, /integrate,
 * /pricing, /how-it-works, /advise, /standard and /connectors long after every
 * one of them became a redirect to `/`, and it never learned about the five
 * buyer-segment pages. Handing crawlers a list of redirects is worse than
 * handing them nothing.
 *
 * The fix is not a more careful hand edit — it is to stop hand-editing. This
 * derives the URL list from `shared/pageMeta.ts` (the public pages) and
 * `shared/reports.ts` (the published research), so a page added to either
 * register is in the sitemap, and a page removed from one is out of it.
 *
 * Run after adding a page or a report:
 *   npx tsx scripts/build-sitemap.mts
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const { PAGE_META, TITLE_MAX, DESCRIPTION_MAX } = await import(
  pathToFileURL(path.join(ROOT, 'shared/pageMeta.ts')).href
);
const { REPORTS } = await import(pathToFileURL(path.join(ROOT, 'shared/reports.ts')).href);

/* Adding a page means running this script, which makes it the one checkpoint
   every new entry passes through — so the length check lives here rather than
   in a test nobody runs. It warns rather than fails: an over-long title is a
   worse search result, not a broken build. */
const over = PAGE_META.flatMap((m: { path: string; title: string; description: string }) => [
  ...(m.title.length > TITLE_MAX ? [`  ${m.path} title ${m.title.length}/${TITLE_MAX}`] : []),
  ...(m.description.length > DESCRIPTION_MAX
    ? [`  ${m.path} description ${m.description.length}/${DESCRIPTION_MAX}`]
    : []),
]);
if (over.length) console.warn(`! truncated in search results:\n${over.join('\n')}`);

const ORIGIN = 'https://smbx.ai';

/** `lastmod` has to be a real date, so it is passed in rather than invented. */
const TODAY = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);

interface Entry { loc: string; changefreq: string; priority: string; lastmod: string; }

const rank = (p: string): { changefreq: string; priority: string } => {
  if (p === '/') return { changefreq: 'weekly', priority: '1.0' };
  if (p === '/research') return { changefreq: 'weekly', priority: '0.9' };
  if (p.startsWith('/buyers/')) return { changefreq: 'monthly', priority: '0.8' };
  if (p === '/industries') return { changefreq: 'monthly', priority: '0.8' };
  return { changefreq: 'monthly', priority: '0.7' };
};

const entries: Entry[] = [
  ...PAGE_META.map((m: { path: string }) => ({
    loc: ORIGIN + (m.path === '/' ? '/' : m.path),
    lastmod: TODAY,
    ...rank(m.path),
  })),
  ...REPORTS.map((r: { slug: string; published: string }) => ({
    loc: `${ORIGIN}/research/${r.slug}`,
    // A report's own publication date is a truer lastmod than today's date.
    lastmod: /^\d{4}-\d{2}-\d{2}$/.test(r.published) ? r.published : TODAY,
    changefreq: 'yearly',
    priority: '0.9',
  })),
  // The legal pages are real, indexable, and belong to no register.
  { loc: `${ORIGIN}/legal/terms`, lastmod: TODAY, changefreq: 'yearly', priority: '0.2' },
  { loc: `${ORIGIN}/legal/privacy`, lastmod: TODAY, changefreq: 'yearly', priority: '0.2' },
];

// Deliberately ABSENT: /login and /signup. Practice mode gates both to the
// team allowlist, so there is nothing there for a visitor from a search
// result — the old sitemap listed them from the product era.

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(
    e =>
      `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod>` +
      `<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  ),
  '</urlset>',
  '',
].join('\n');

const out = path.join(ROOT, 'client/public/sitemap.xml');
writeFileSync(out, xml);
console.log(`sitemap: ${entries.length} urls -> ${path.relative(ROOT, out)}`);
