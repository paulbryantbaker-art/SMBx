#!/usr/bin/env node
/**
 * campaign-export — lift the POST COPY out of a campaign's content-of-record
 * markdown into its JSON, so the app can put it in front of Paul to paste.
 *
 *   node content/studio/campaign-export.mjs 2026-08-18            # rewrite campaign-2026-08-18.json in place
 *   node content/studio/campaign-export.mjs 2026-08-18 --check    # exit 1 if a post has no copy; write nothing
 *
 * WHY THIS EXISTS (2026-08-18, Paul: "instead of giving me terminal commands,
 * just read the clone and the files and build the UI to manage the campaign
 * and you have the data"). The Posting tab already tracked STATE — dates,
 * drafted/posted, the retired-check verdict — but the rows carried no COPY:
 * the post text lived only in CAMPAIGN_<date>.md, so managing the campaign
 * still meant opening the markdown beside the app. This script carries the
 * copy across, VERBATIM and PARSED rather than retyped, because a retyped
 * caption is where a figure drifts.
 *
 * WHO OWNS WHAT — unchanged: the MARKDOWN owns CONTENT (now including `body`,
 * `pages`, `law_check`, `document`), the TABLE owns STATE. These fields ride
 * the same import and are overwritten by it; nothing here can un-post a row.
 *
 * WHAT IT PARSES. The plan's own structure — one `### P-N · <date> · TEXT|DOCUMENT
 * — <title>` section per post; text posts run from the italic pattern line to
 * `**Law check:**`; document posts carry `**Pg N …**` lines then a `**Caption**`
 * block; P-8 is receipt-gated (`**The frame…**` + `**The understudy…**`).
 * A section it cannot read is REPORTED and left without copy — the row still
 * imports, the UI says "copy not carried", and `--check` fails — never
 * silently emptied, never guessed at. Mandate editions (M-n) are built by the
 * Sunday run and carry no copy here by design.
 *
 * DOCUMENTS. A document slot's `document` block records the deck spec, where
 * the plan files the render, and — ONLY IF THE FILE EXISTS under
 * client/public/collateral/<slug>/<date>/ — the URL the app serves it at, so
 * the tab can hand over the PDF. Absent → `pdf: null` and the UI says so;
 * an asserted-but-missing download is the failure this check exists for.
 *
 * Zero dependencies. Plain node.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const CHECK = process.argv.includes('--check');
const name = process.argv.slice(2).find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
if (!name) {
  console.error('usage: node content/studio/campaign-export.mjs <YYYY-MM-DD> [--check]');
  process.exit(2);
}

const MD = join(HERE, `CAMPAIGN_${name}.md`);
const JSON_FILE = join(HERE, `campaign-${name}.json`);
const md = readFileSync(MD, 'utf8');
const campaign = JSON.parse(readFileSync(JSON_FILE, 'utf8'));
const problems = [];

/* ── markdown → plain text, for a LinkedIn box that has no markdown ─────── */

/** Strip paired emphasis + the Drive exporter's `\<` escapes; keep everything else byte-for-byte. */
function plain(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[\s(])\*(\S(?:.*?\S)?)\*(?=[\s.,;:!?)]|$)/g, '$1$2')
    .replace(/\\([<>*_])/g, '$1')
    .trim();
}

/** Consecutive non-blank lines are one paragraph; paragraphs join with a blank line. */
function paragraphs(lines) {
  const out = [];
  let cur = [];
  for (const l of lines) {
    if (l.trim() === '') { if (cur.length) { out.push(cur.join(' ')); cur = []; } }
    else cur.push(l.trim());
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}

/* ── the sections ──────────────────────────────────────────────────────── */

const lines = md.split('\n');
const HEAD = /^###\s+(P-\d+)\s+·\s+(.+?)\s+·\s+(TEXT|DOCUMENT)\s+—\s+(.+?)\s*$/;
const sections = [];
for (let i = 0; i < lines.length; i++) {
  const m = HEAD.exec(lines[i]);
  if (!m) continue;
  let j = i + 1;
  while (j < lines.length && !/^#{2,3}\s/.test(lines[j])) j++;
  sections.push({ id: m[1], when: m[2], kind: m[3], title: m[4], body: lines.slice(i + 1, j) });
}

const isLaw = l => /^\*\*Law check/.test(l.trim());
const isMeta = l => /^\*Pattern:/.test(l.trim());

function parseText(sec) {
  const b = sec.body;
  const meta = b.findIndex(isMeta);
  const law = b.findIndex(isLaw);
  if (meta < 0) problems.push(`${sec.id}: no *Pattern:* line`);
  if (law < 0) problems.push(`${sec.id}: no **Law check** line`);
  const lawText = law >= 0 ? plain(b[law].replace(/^\*\*Law check[^*]*\*\*:?\s*/, '')) : null;

  const frame = b.findIndex(l => /^\*\*The frame, complete except for the receipts/.test(l.trim()));
  if (frame >= 0) {
    // Receipt-gated: the frame ships only once the interview fills its brackets;
    // the understudy is fully written and needs none.
    const gateLine = b.slice(meta + 1, frame).find(l => /RECEIPT-GATED/.test(l));
    const extraction = b.findIndex(l => /^\*\*Extraction questions/.test(l.trim()));
    const understudy = b.findIndex(l => /^\*\*The understudy/.test(l.trim()));
    const note = b.findIndex((l, k) => k > understudy && /^\*Note:/.test(l.trim()));
    if (extraction < 0 || understudy < 0) problems.push(`${sec.id}: gated post missing the extraction or understudy marker`);
    const end = note >= 0 ? note : law;
    return {
      body: paragraphs(b.slice(frame + 1, extraction >= 0 ? extraction : end)).map(plain).join('\n\n'),
      body_alt: understudy >= 0 ? paragraphs(b.slice(understudy + 1, end)).map(plain).join('\n\n') : null,
      gate: gateLine ? plain(gateLine.replace(/^⛔\s*/, '')) : 'RECEIPT-GATED — does not ship with brackets in it.',
      law_check: lawText,
      pages: null,
      pattern: plain(b[meta] ?? ''),
    };
  }
  const paras = paragraphs(b.slice(meta + 1, law >= 0 ? law : b.length)).map(plain);
  return { body: paras.join('\n\n'), body_alt: null, gate: null, law_check: lawText, pages: null, pattern: plain(b[meta] ?? '') };
}

const PG = /^\*\*Pg\s+(\d+)(?:\s+—\s+([^*]+?))?\.\*\*\s*(.*)$/;
function parseDocument(sec) {
  const b = sec.body;
  const meta = b.findIndex(isMeta);
  const law = b.findIndex(isLaw);
  const cap = b.findIndex(l => /^\*\*Caption/.test(l.trim()));
  if (meta < 0) problems.push(`${sec.id}: no *Pattern:* line`);
  if (cap < 0) problems.push(`${sec.id}: no **Caption** block`);
  if (law < 0) problems.push(`${sec.id}: no **Law check** line`);
  const pages = [];
  for (const l of b.slice(meta + 1, cap >= 0 ? cap : b.length)) {
    const m = PG.exec(l.trim());
    if (!m) continue;
    const rest = m[3];
    // Trailing italic = the sourcing note for that page (footer material), kept apart from the page copy.
    const noteM = /\*([^*]+)\*\s*$/.exec(rest);
    const text = plain(noteM ? rest.slice(0, noteM.index) : rest);
    pages.push({ n: Number(m[1]), label: m[2] ? m[2].trim() : null, text, note: noteM ? plain(noteM[1]) : null });
  }
  if (!pages.length) problems.push(`${sec.id}: no **Pg n** lines`);
  const caption = cap >= 0 ? paragraphs(b.slice(cap + 1, law >= 0 ? law : b.length)).map(plain).join('\n\n') : '';
  return {
    body: caption,
    body_alt: null,
    gate: null,
    law_check: law >= 0 ? plain(b[law].replace(/^\*\*Law check[^*]*\*\*:?\s*/, '')) : null,
    pages,
    pattern: plain(b[meta] ?? ''),
  };
}

/* ── the shipped document, verified on disk ────────────────────────────── */

const FILE_TO = /file to\s+markets\/([\w-]+)\/collateral\/([\w-]+)\/(\d{4}-\d{2}-\d{2})/;
function documentFor(row, pattern) {
  const m = FILE_TO.exec(`${row.format ?? ''} ${pattern}`);
  if (!m) return null;
  const [, market, slug, date] = m;
  const filedAt = `studio/markets/${market}/collateral/${slug}/${date}/`;
  const served = join(REPO, 'client', 'public', 'collateral', slug, date);
  const pdfName = `${slug}.pdf`;
  const has = existsSync(join(served, pdfName));
  let thumbs = [], bytes = null;
  if (has) {
    const dir = join(served, 'pages');
    thumbs = existsSync(dir)
      ? readdirSync(dir).filter(f => /\.jpe?g$/i.test(f)).sort().map(f => `/collateral/${slug}/${date}/pages/${f}`)
      : [];
    bytes = statSync(join(served, pdfName)).size;
  }
  // The caption the DECK ships with — build-deck writes it beside the PDF.
  // It is the caption that agrees with the pages, which is why it wins below.
  const capFile = join(REPO, filedAt, `${slug}-caption.txt`);
  const deckCaption = existsSync(capFile) ? readFileSync(capFile, 'utf8').trim() : null;
  return {
    slug,
    spec: `studio/markets/${market}/specs/${slug}.deck.mts`,
    filed_at: filedAt,
    pdf: has ? `/collateral/${slug}/${date}/${pdfName}` : null,
    cover: thumbs[0] ?? null,
    thumbs,
    pages: thumbs.length || null,
    bytes,
    deckCaption,
  };
}

/** Same words? Whitespace and curly-vs-straight quotes are not a difference; a figure or a sentence is. */
const norm = s => (s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

const HASHTAG_LINE = /(^|\n)\s*(#[A-Za-z][\w]*\s*){2,}\s*$/;

/**
 * Say HOW the deck's caption differs from the plan's, mechanically, so the UI
 * can show the human a reason rather than a diff. Three findings it can make:
 * a trailing hashtag line (the plan's §5 says zero); wording that is close
 * (spelling, contractions, an added sentence — same argument); or wording that
 * is far (a different argument — P-5 on 2026-08-18). Distance is a token-set
 * overlap over the two texts with the hashtags removed.
 */
function describeDrift(plan, deck) {
  const parts = [];
  const deckHash = HASHTAG_LINE.test(deck);
  if (deckHash) parts.push("the deck's caption ends in a hashtag line (the plan's protocol says zero hashtags)");
  const words = s => new Set(norm(s.replace(HASHTAG_LINE, '')).toLowerCase().replace(/[^\w\s$%.'-]/g, ' ').split(/\s+/).filter(Boolean));
  const a = words(plan ?? ''), b = words(deck);
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  const overlap = a.size ? shared / Math.max(a.size, b.size) : 0;
  if (overlap >= 0.7) parts.push('the wording differs (an added sentence, spelling, or contractions — the same argument)');
  else parts.push(`the deck's caption argues differently from the plan's (${Math.round(overlap * 100)}% of the words in common) — the deck's pages say what the deck's caption says; read both before posting`);
  return parts.join('; ') + '.';
}

/* ── merge ─────────────────────────────────────────────────────────────── */

const byId = new Map(sections.map(s => [s.id, s]));
let carried = 0;
for (const row of campaign.rows) {
  const sec = byId.get(row.queue_id);
  if (!sec) {
    // M-n editions and the blackout carry no copy here by design; a P-row
    // without a section is a real gap.
    if (/^P-\d+$/.test(row.queue_id)) problems.push(`${row.queue_id}: no ### section in ${MD.split('/').pop()}`);
    continue;
  }
  const parsed = sec.kind === 'DOCUMENT' ? parseDocument(sec) : parseText(sec);
  if (!parsed.body) problems.push(`${row.queue_id}: empty copy`);
  delete row.body_plan; // a field an earlier cut wrote; the deck caption now rides as body_deck
  row.title = sec.title;
  row.kind = sec.kind === 'DOCUMENT' ? 'document' : 'text';
  row.body = parsed.body || null;
  row.body_alt = parsed.body_alt;
  row.body_deck = null;
  row.copy_note = null;
  row.gate = parsed.gate;
  row.pages = parsed.pages;
  row.law_check = parsed.law_check;
  const doc = sec.kind === 'DOCUMENT' ? documentFor(row, parsed.pattern) : null;
  if (sec.kind === 'DOCUMENT' && !doc) problems.push(`${row.queue_id}: document slot with no "file to markets/<m>/collateral/<slug>/<date>/" pointer`);
  if (doc) {
    // A DOCUMENT post ships a caption beside its pages, and TWO captions exist
    // for it: the plan's (§3, Paul's words, under the plan's own protocol) and
    // the deck's (`<slug>-caption.txt`, written into the spec at build). They
    // are supposed to agree and on 2026-08-18 they did not — the deck captions
    // carried hashtags the plan's §5 forbids, P-7's had drifted to British
    // spelling, and P-5's argued a different read because the spec had been
    // rewritten from the master (three of the plan's claims were retired). So:
    // THE PLAN'S CAPTION IS THE BODY — it is the content of record — and the
    // deck's is carried BESIDE it whenever it differs, with the difference
    // classified, so the human sees both and picks. Nothing here edits the
    // plan, and nothing is dropped.
    const { deckCaption, ...rest } = doc;
    if (deckCaption && norm(deckCaption) !== norm(parsed.body)) {
      row.body_deck = deckCaption;
      row.copy_note = describeDrift(parsed.body, deckCaption);
    }
    row.document = { ...rest, deck_caption_matches: !row.body_deck };
  } else {
    row.document = null;
  }
  carried++;
}
for (const s of sections) {
  if (!campaign.rows.some(r => r.queue_id === s.id)) problems.push(`${s.id}: section in the markdown has no row in the JSON`);
}

campaign.copy_source = `content/studio/CAMPAIGN_${name}.md`;

if (problems.length) {
  console.error(`campaign-export: ${problems.length} problem(s) —\n  ${problems.join('\n  ')}`);
}
if (CHECK) {
  console.error(`${carried} of ${campaign.rows.length} rows carry copy${problems.length ? '' : ' — clean'}.`);
  process.exit(problems.length ? 1 : 0);
}
writeFileSync(JSON_FILE, JSON.stringify(campaign, null, 2) + '\n');
console.error(`wrote ${JSON_FILE.replace(REPO + '/', '')} — ${carried} rows carry copy${problems.length ? ` (${problems.length} problem(s) above)` : ''}.`);
process.exit(problems.length ? 1 : 0);
