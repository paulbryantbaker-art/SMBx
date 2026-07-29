/**
 * Build-time markdown → report module (2026-07-29).
 *
 * Why this exists: a research report has ONE source of truth — the markdown in
 * `scripts/studio/reports/`. `scripts/studio/build-report.mts` renders it to the
 * portable PDF; this plugin renders the SAME file to the web page at
 * `/reports/<slug>`. Edit the markdown once, both outputs follow.
 *
 * It runs at BUILD time, so no markdown library ships to the browser and no
 * model or API is involved (the studio doctrine: collateral stays cheap).
 *
 * Two imports, so a listing page never pays for a body it won't show:
 *   `?report`       → everything, including the rendered HTML (the read itself)
 *   `?report-meta`  → title, stats, read time, cover — no HTML, no TOC
 *
 * The report page imports the meta statically (the masthead paints at once) and
 * the body dynamically, so each report's 50-odd kB is its own lazy chunk.
 *
 * The cover-config convention is build-report.mts's, verbatim — everything
 * before the first `---` is the cover (an optional `<!--cover …-->` comment
 * plus a `# Title` / `## Subtitle`); everything after flows as the body.
 * `stat:` lines become the key-findings band, `accent:` lines drop a photo
 * after the matching `##` header, exactly as they do in the PDF.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const SUFFIX = '?report';
const SUFFIX_META = '?report-meta';
const WORDS_PER_MINUTE = 220;

/** Longest suffix first — '?report' is a prefix of '?report-meta'. */
const suffixOf = (s: string): string | null =>
  s.endsWith(SUFFIX_META) ? SUFFIX_META : s.endsWith(SUFFIX) ? SUFFIX : null;

interface Heading { id: string; text: string; level: number }

/** GitHub-style slug, de-duplicated so repeated headers keep stable anchors. */
function slugger() {
  const seen = new Map<string, number>();
  return (raw: string) => {
    const base = raw
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'section';
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '').trim();

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

/** Rough word count off the markdown — good enough for a read-time estimate. */
function countWords(md: string): number {
  const plain = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ');
  return (plain.match(/\S+/g) || []).length;
}

/** Resolve a cover-config asset the way build-report.mts does. */
function resolveAsset(name: string, mdDir: string, repoRoot: string): string | null {
  if (!name) return null;
  const tries = [
    path.isAbsolute(name) ? name : '',
    path.join(mdDir, name),
    path.join(mdDir, 'media', name),
    path.join(repoRoot, 'client/public', name),
  ].filter(Boolean);
  return tries.find(p => existsSync(p)) || null;
}

interface CoverCfg {
  byline: string; role: string; headshot: string; image: string; imagePos: string;
  footer: string; eyebrow: string;
  stats: { n: string; l: string }[];
  accents: { match: string; img: string; pos: string }[];
}

function parseCover(coverRaw: string): { cfg: CoverCfg; md: string } {
  const cfg: CoverCfg = {
    byline: 'Paul Baker',
    role: 'smbX.ai · Buy-side corporate development',
    headshot: '', image: '', imagePos: '50% 50%', footer: '', eyebrow: '',
    stats: [], accents: [],
  };
  const m = coverRaw.match(/<!--\s*cover([\s\S]*?)-->/i);
  const md = (m ? coverRaw.replace(m[0], '') : coverRaw).trim();
  if (!m) return { cfg, md };

  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!v) continue;
    if (k === 'stat') {
      const bar = v.indexOf('|');
      cfg.stats.push(bar >= 0 ? { n: v.slice(0, bar).trim(), l: v.slice(bar + 1).trim() } : { n: v, l: '' });
    } else if (k === 'accent') {
      const p = v.split('|').map(s => s.trim());
      cfg.accents.push({ match: p[0] || '', img: p[1] || '', pos: p[2] || '50% 50%' });
    } else if (k in cfg) {
      (cfg as any)[k] = v;
    }
  }
  return { cfg, md };
}

export default function reportMarkdown(): Plugin {
  let repoRoot = process.cwd();

  return {
    name: 'smbx-report-markdown',
    enforce: 'pre',

    configResolved(cfg) {
      // vite `root` is client/; reports live beside it in the repo.
      repoRoot = path.resolve(cfg.root, '..');
    },

    // Resolve to the real file path (query preserved) so the emitted module's
    // relative asset imports resolve against the markdown file's own folder.
    async resolveId(source, importer) {
      const suffix = suffixOf(source);
      if (!suffix) return null;
      const bare = source.slice(0, -suffix.length);
      const abs = path.isAbsolute(bare)
        ? bare
        : path.resolve(path.dirname(importer || repoRoot), bare);
      return existsSync(abs) ? abs + suffix : null;
    },

    async load(id) {
      const suffix = suffixOf(id);
      if (!suffix) return null;
      const metaOnly = suffix === SUFFIX_META;
      const file = id.slice(0, -suffix.length);
      if (!existsSync(file)) return null;

      const { marked } = await import('marked');
      const raw = readFileSync(file, 'utf8');
      const mdDir = path.dirname(file);

      // ── split cover (before the first `---`) from body ──────────────────
      const cut = raw.indexOf('\n---\n');
      const coverRaw = cut >= 0 ? raw.slice(0, cut).trim() : '';
      const bodyMd = cut >= 0 ? raw.slice(cut + 5).trim() : raw;
      const { cfg, md: coverMd } = parseCover(coverRaw);

      // ── cover prose → title / subtitle / intro ──────────────────────────
      const coverHtml = coverMd ? String(await marked.parse(coverMd)) : '';
      let title = '', subtitle = '';
      let intro = coverHtml
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/i, (_m, t) => { title = decode(stripTags(t)); return ''; })
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/i, (_m, t) => { subtitle = decode(stripTags(t)); return ''; })
        .trim();

      // ── body → HTML, with anchored headings and a TOC ───────────────────
      let html = String(await marked.parse(bodyMd));
      const slug = slugger();
      const toc: Heading[] = [];
      html = html.replace(/<h([123])([^>]*)>([\s\S]*?)<\/h\1>/g, (_m, lvl, attrs, inner) => {
        const level = Number(lvl);
        const text = decode(stripTags(inner));
        const id = slug(text);
        if (level <= 3) toc.push({ id, text, level });
        return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
      });

      // Tables must be able to scroll on their own — the page body never
      // scrolls sideways (responsive law).
      html = html.replace(/<table>/g, '<div class="rp-tablewrap"><table>')
        .replace(/<\/table>/g, '</table></div>');

      // ── assets: emit real imports so Vite hashes and serves them ────────
      const imports: string[] = [];
      const assetRef = (name: string): string => {
        const abs = resolveAsset(name, mdDir, repoRoot);
        if (!abs) return 'null';
        const rel = path.relative(mdDir, abs).split(path.sep).join('/');
        const spec = rel.startsWith('.') ? rel : './' + rel;
        const v = `__asset${imports.length}`;
        imports.push(`import ${v} from ${JSON.stringify(spec)};`);
        return v;
      };

      const coverImage = assetRef(cfg.image);
      const headshot = assetRef(cfg.headshot || 'founder-portrait.jpg');

      // `accent:` photos drop in after their matching `##` header, as in the
      // PDF. Skipped for meta-only so a listing page never imports them.
      const accentTokens: string[] = [];
      if (!metaOnly) for (const a of cfg.accents) {
        const v = assetRef(a.img);
        if (v === 'null' || !a.match) continue;
        const target = toc.find(h => h.text.toUpperCase().includes(a.match.toUpperCase()));
        if (!target) continue;
        const marker = `@@ACCENT${accentTokens.length}@@`;
        accentTokens.push(`{ img: ${v}, pos: ${JSON.stringify(a.pos)} }`);
        // Insert right after that heading's closing tag.
        const re = new RegExp(`(<h[123][^>]*id="${target.id}"[^>]*>[\\s\\S]*?</h[123]>)`);
        html = html.replace(re, `$1${marker}`);
      }

      const words = countWords(bodyMd);
      const shared = {
        title, subtitle,
        byline: cfg.byline, role: cfg.role,
        coverPos: cfg.imagePos,
        footer: cfg.footer,
        eyebrow: cfg.eyebrow,
        stats: cfg.stats,
        words,
        minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      };

      // `?report-meta` carries no HTML, so a listing page stays small; the
      // report page pairs it with a dynamically-imported `?report` body.
      const data = metaOnly ? shared : { ...shared, intro, toc, html };

      const lines = [
        ...imports,
        `const report = ${JSON.stringify(data)};`,
        `report.coverImage = ${coverImage};`,
        `report.headshot = ${headshot};`,
      ];
      if (!metaOnly) lines.push(`report.accents = [${accentTokens.join(', ')}];`);
      lines.push('export default report;');
      return lines.join('\n');
    },
  };
}
