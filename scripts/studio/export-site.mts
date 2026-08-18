/**
 * export-site.mts — a spec becomes a page on the site, without becoming a
 * second copy of itself.
 *
 *   npx tsx $REPO/scripts/studio/export-site.mts <spec.deck.mts|spec.post.mts>
 *   npx tsx $REPO/scripts/studio/export-site.mts <spec> --out <dir>
 *   npx tsx $REPO/scripts/studio/export-site.mts <spec> --wiring   # print the
 *                                                    registry entries and stop
 *
 * WHY THIS EXISTS. Paul, 2026-08-18: *"any collateral we make needs to be able
 * to be used in 2 places: 1, as a post on linkedin (PDF or single image), 2 or
 * usable by CC to build into the website like the current research docs."*
 *
 * One of the three formats already did that and two did not. A REPORT is a
 * markdown file, and `vite-plugins/report-markdown.ts` renders the same file
 * the PDF builder renders — edit once, both follow, and they cannot drift. A
 * CAROUSEL and a ONE-PAGER are TypeScript specs, the site plugin only reads
 * `scripts/studio/reports/*.md`, and so they dead-ended at LinkedIn.
 *
 * THE SPEC STAYS THE SOURCE. The other direction was considered and rejected:
 * authoring in markdown and deriving the deck from it. Markdown has no way to
 * say "this page is a diagram with two bars whose heights are 243 and 340",
 * and FORMATS.md law 1 is that copy is written INTO slots and never written
 * and hoped into a layout afterwards. Deriving slots from prose means guessing
 * the layout, which is the precise drift the slot tables exist to prevent. So
 * the spec is canonical and BOTH outputs are derived from it — the same
 * arrangement reports already have, pointed the other way.
 *
 * IT READS THE SPEC AS A MODULE, NOT AS TEXT, exactly as `verify-spec.mts`
 * does and for the same reason: these files carry long header comments arguing
 * about what was deliberately left OFF the pages, and a text scan would haul
 * all of that onto the website.
 *
 * ── THE FOUR THINGS THIS GETS RIGHT THAT A NAIVE DUMP WOULD NOT ───────────
 *
 * 1. A NUMERAL PAGE'S `head` IS A SENTENCE FRAGMENT. On the page the numeral
 *    is a separate slot, so the head reads "of broken post-LOI deals died on
 *    diligence findings." — starting mid-sentence, because the giant "47%"
 *    sits above it. Dropped into a `## ` heading unjoined, every numeral page
 *    on the site would open with a lowercase "of". They are rejoined here.
 *
 * 2. `source:` LINES MUST SURVIVE. A page carrying a figure without its
 *    publisher is a defect in the deck, and it is a worse one on a web page
 *    that outlives the post. Each becomes a visible attribution line under its
 *    section, in italics, rather than being quietly dropped as "chrome".
 *
 * 3. A DIAGRAM IS TWO NUMBERS AND A RELATION, and on the site there are no
 *    bars to carry them. Both labels, both sub-captions and the connector are
 *    written into prose, so the comparison survives the format change. Losing
 *    them would leave a section arguing about a movement it never states.
 *
 * 4. THE CAPTION DOES NOT GO ON THE PAGE. It is the LinkedIn post text — a
 *    third artifact with its own voice, its own hashtags and its own call to
 *    action. On a web page it reads as a stray social post, and it duplicates
 *    the body it was written to trail.
 *
 * NOTHING IS INVENTED. Every string written out comes from the spec. There is
 * no summariser here and no model call: if a spec has no `sub`, the page has
 * no subtitle. The zero-hallucination law does not get an exemption because
 * the destination is a website, and an abstract in particular is drawn from
 * the spec's own cover copy rather than composed — the same rule
 * `shared/reports.ts` already states for reports.
 *
 * WHAT IT DOES NOT DO. It does not edit `shared/reports.ts` or
 * `client/src/practice/reports/registry.ts`. Those are Claude Code's files in
 * the app half of the clone, and a studio script reaching into them is exactly
 * the boundary ONE CLONE draws. It PRINTS both entries ready to paste, and
 * `--wiring` prints them without writing anything.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);

/* ── args ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const specArg = argv.find(a => !a.startsWith('--'));
const flag = (n: string) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
const wiringOnly = argv.includes('--wiring');

if (!specArg) {
  console.error('usage: export-site.mts <spec.deck.mts|spec.post.mts> [--out <dir>] [--wiring]');
  process.exit(64);
}
const specPath = path.resolve(process.cwd(), specArg);
if (!fs.existsSync(specPath)) { console.error(`no such spec: ${specPath}`); process.exit(66); }

const OUT_DIR = path.resolve(process.cwd(), flag('out') ?? path.join(ROOT, 'scripts/studio/reports'));

/* ── read the spec as a module ───────────────────────────────────────────── */
const mod: any = await import(pathToFileURL(specPath).href);
const spec = mod.deck ?? mod.post;
const kind: 'deck' | 'post' = mod.deck ? 'deck' : 'post';
if (!spec) { console.error('spec exports neither `deck` nor `post`'); process.exit(65); }

const slug: string = spec.slug ?? path.basename(specPath).replace(/\.(deck|post)\.mts$/, '');

/* Sentence-case a fragment that follows a numeral, and join the two. A head
   beginning with a capital is already a sentence and is left alone. */
function joinNumeral(numeral?: string, unit?: string, head?: string): string {
  const fig = [numeral, unit].filter(Boolean).join('');
  if (!head) return fig;
  if (!fig) return head;
  return /^[a-z]/.test(head) ? `${fig} ${head}` : `${fig} — ${head}`;
}

const esc = (s: string) => String(s).replace(/\r/g, '').trim();

/* ── body sections ───────────────────────────────────────────────────────── */
type Section = { heading: string; prose: string[]; source?: string };
const sections: Section[] = [];

if (kind === 'deck') {
  for (const p of spec.pages ?? []) {
    const prose: string[] = [];
    let heading = '';

    switch (p.kind) {
      case 'numeral':
        heading = joinNumeral(p.numeral, p.unit, p.head);
        break;

      case 'statement':
        heading = esc(p.head ?? '');
        break;

      case 'trade':
        heading = p.numeral ? joinNumeral(p.numeral, p.unit, p.head) : esc(p.head ?? '');
        if (p.name) prose.push(`**${esc(p.name)}**`);
        break;

      case 'diagram': {
        heading = esc(p.head ?? '');
        /* The bars carry the comparison. With no bars on the page, the numbers
           have to be stated or the section argues about a movement it never
           gives. */
        const bars = (p.bars ?? []) as { label: string; sub: string }[];
        if (bars.length) {
          const rel = p.connector ? ` ${esc(p.connector)} ` : ' → ';
          prose.push(
            `**${bars.map(b => esc(b.label)).join(rel)}** — ` +
            bars.map(b => `${esc(b.label)}: ${esc(b.sub)}`).join('; ') + '.',
          );
        }
        break;
      }

      default:
        heading = esc(p.head ?? p.tag ?? '');
    }

    if (p.body) prose.push(esc(p.body));
    sections.push({ heading, prose, source: p.source ? esc(p.source) : undefined });
  }

  if (spec.closer?.head) {
    const c = spec.closer;
    sections.push({ heading: esc(c.head), prose: c.body ? [esc(c.body)] : [] });
  }
} else {
  /* A one-pager is a single argument: the figure, the body, and the invite. */
  const heading = joinNumeral(spec.numeral, undefined, spec.hook) || esc(spec.hook ?? slug);
  const prose: string[] = [];
  if (spec.numeralLabel) prose.push(`**${esc(String(spec.numeralLabel).replace(/\n/g, ' '))}**`);
  if (spec.body) prose.push(esc(spec.body));
  if (spec.invite) prose.push(esc(spec.invite));
  sections.push({ heading, prose });
}

/* ── cover block ─────────────────────────────────────────────────────────── */
const title = esc(spec.cover?.hook ?? spec.hook ?? slug);
const subtitle = esc(spec.cover?.sub ?? '');
const kicker = esc(spec.kicker ?? '');
const byline = spec.byline?.name ?? 'Paul Baker';
const role = spec.byline?.title
  ? `smbX.ai · ${spec.byline.title}`
  : 'smbX.ai · Buy-side corporate development';

const coverLines = [
  '<!--cover',
  `byline: ${byline}`,
  `role: ${role}`,
  'headshot: founder-portrait.jpg',
  `footer: ${title}`,
];
for (const s of spec.cover?.stats ?? []) {
  coverLines.push(`stat: ${esc(s.value)} | ${esc(s.label)}`);
}
/* The cover image is deliberately NOT carried across. A deck cover panel is
   476×1102 and the report cover hero is 5.84×2.05in — a 9:16 illustration
   centre-cropped into a 16:9 band loses most of itself. FORMATS §4 rather than
   an oversight; brief a landscape image if the page wants one. */
coverLines.push('-->');

const md = [
  coverLines.join('\n'),
  `# ${title}`,
  subtitle ? `## ${subtitle}` : '',
  kicker ? `**${kicker} | smbX.ai**` : '',
  '',
  '---',
  '',
  ...sections.flatMap(s => [
    `## ${s.heading}`,
    '',
    ...s.prose.flatMap(p => [p, '']),
    ...(s.source ? [`*Source: ${s.source}*`, ''] : []),
  ]),
].filter(l => l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';

/* ── deck-isms: copy that is correct on a carousel and wrong on a page ───── */
/* A body that says "the multiples on page 4" or "the one number on this deck"
   is fine in the artifact it names and nonsense on a web page, which has no
   pages and is not a deck. FORMATS already forbids a page number in copy for
   its own reason — the ghost numeral is drawn from page order — so a hit here
   is usually a violation of that rule as well. Reported, never rewritten:
   silently editing an author's sentence on the way to publication is worse
   than printing a warning about it.

   The CAPTION is deliberately not scanned. It is LinkedIn post text sitting
   beside the attached carousel, where "in this deck" is the correct words, and
   it does not travel to the site anyway. */
const DECKISM = /\b(this deck|on the deck|page \d+|swipe)\b/i;
const deckisms: string[] = [];
for (const s of sections) {
  for (const p of s.prose) {
    const m = DECKISM.exec(p);
    if (m) deckisms.push(`  "${m[0]}" — under “${s.heading.slice(0, 56)}”`);
  }
}

/* ── the wiring Claude Code needs ────────────────────────────────────────── */
const words = md.split(/\s+/).length;
const wiring = `
── paste into shared/reports.ts ──────────────────────────────────────
  {
    slug: '${slug}',
    kicker: ${JSON.stringify(kicker || 'RESEARCH NOTE')},
    shortTitle: ${JSON.stringify(title.length > 48 ? title.slice(0, 45).trim() + '…' : title)},
    abstract: ${JSON.stringify(subtitle || title)},
    published: '${new Date().toISOString().slice(0, 10)}',
    // ogImage: run build-og-card.mts to produce it
  },

── paste into client/src/practice/reports/registry.ts ────────────────
  import ${slug.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Meta from '../../../../scripts/studio/reports/${slug}.md?report-meta';

── then build the artifacts ──────────────────────────────────────────
  npx tsx $REPO/scripts/studio/build-og-card.mts scripts/studio/reports/${slug}.md --slug ${slug}

  NOTE: no gated PDF is built for this one. The downloadable PDF for a
  carousel is the CAROUSEL, which build-deck.mts already produced — do not
  render a second, report-shaped PDF of the same words.
`;

if (wiringOnly) { console.log(wiring); process.exit(0); }

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `${slug}.md`);
fs.writeFileSync(outPath, md);

console.log(`
export-site — ${kind} → site markdown

  spec      ${path.relative(process.cwd(), specPath)}
  wrote     ${path.relative(process.cwd(), outPath)}
  sections  ${sections.length}${kind === 'deck' ? ` (${spec.pages?.length ?? 0} pages + closer)` : ''}
  sourced   ${sections.filter(s => s.source).length} of ${sections.length} carry a source line
  length    ~${words} words
${deckisms.length ? `
  ⚠ ${deckisms.length} DECK-ISM(S) — correct on a carousel, wrong on a web page:
${deckisms.join('\n')}
  Fix them in the SPEC and re-export. A page number in copy also breaks
  FORMATS' rule that the ghost numeral is drawn from page order.
` : '  deck-isms  none — no copy refers to pages or to "this deck"'}

  The spec stays the source. Re-run this after any spec edit; never edit the
  markdown, because the next export overwrites it.
${wiring}`);
