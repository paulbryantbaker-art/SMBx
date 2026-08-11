/**
 * voice-check.mts — THE COPY CHECK. Step 5b, between verify-spec and the build.
 *
 *   npx tsx $REPO/scripts/studio/voice-check.mts <spec.deck.mts|spec.post.mts|doc.md> [--strict]
 *   npx tsx $REPO/scripts/studio/voice-check.mts markets/<m>/specs          # whole folder
 *
 * WHY THIS EXISTS (Paul, 2026-08-03): *"I'm just confused on what the actual
 * message is… we're asking firms to trust us to go against banks and auctions.
 * Just use plain language throughout and be thorough and explanatory. Too much
 * jargon."* A deck passed `audit.mts` and `verify-spec.mts` and still failed,
 * because both of those check whether a figure is TRUE. Neither reads the
 * sentence the figure is sitting in.
 *
 * THE SPECIFICATION IS `DESIGN.md` §9, and it is canonical — where this file
 * and that one disagree, that one wins. `FORMATS.md` §7 carries the interface
 * and the four checks:
 *
 *   NO MESSAGE   the spec header does not say, in one sentence, what the piece
 *                is for. §9: *"Write the one-sentence message before the pages,
 *                put it in the spec header, and make every page a worked
 *                example of it. If you cannot write that sentence, the piece is
 *                not ready."*  This is the one that matters.
 *   JARGON       practice shorthand a principal would have to translate. §9:
 *                not "EV/EBITDA is 16.34x" but "compare the whole business,
 *                debt included, to its operating earnings, and the same company
 *                is 16.34x."
 *   FILLER       consultant vocabulary.
 *   STIFF / LONG constructions that only work on the page, semicolons in
 *                display copy, sentences over 32 words.
 *
 * MESSAGE and JARGON are findings. FILLER and STIFF are warnings, and `--strict`
 * promotes them. The split is deliberate: a checker that fires on every
 * occurrence of a finance word in a finance document trains the reader to skim,
 * and then the one finding that mattered scrolls past with the rest.
 *
 * TWO THINGS IT WILL NOT DO.
 *
 *   1 · It never rewrites your copy. It reports the phrase, where it is, and
 *       the SHAPE of a fix. The sentence is yours.
 *   2 · **It cannot tell you whether the writing sounds like a person.** It
 *       finds shorthand, filler and long sentences. It cannot find a sentence
 *       that is short, plain, jargon-free and still lifeless. FORMATS.md step 8
 *       — read it aloud — is the actual test. This only clears the floor
 *       beneath it, and it says so on every run.
 *
 * A TERM THAT IS EXPLAINED IS NOT FLAGGED. That is the whole precision story:
 * §9 does not ban the shorthand, it bans the shorthand ARRIVING ALONE. So each
 * term carries the plain words that would count as having explained it, and a
 * gloss in the same page object — or within a sentence or two in a document —
 * clears it. `EBITDA`, `revenue` and `multiple` are deliberately never flagged
 * (FORMATS.md §7): the reader knows them, and a checker that cries wolf gets
 * switched off.
 *
 * EXIT 0 clean · 1 findings · 2 could not check.
 *   FORMATS.md §7 says NO MESSAGE is "exit 2". That collides with `audit.mts`,
 *   where 2 has always meant "the check did not run" — and a missing message is
 *   emphatically a result, not a failure to look. So a missing message exits 1
 *   with every other finding, and 2 is reserved for a spec that would not load.
 *   Flagged here rather than silently chosen; FORMATS.md §7's table is the line
 *   to correct if Paul wants it the other way.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/* ── the term list ────────────────────────────────────────────────────────
 *
 * SOURCED, not invented. The named terms come from DESIGN.md §9 (EV/EBITDA,
 * comp set, in-band, tuck-in, platform parent, recurring mix) and FORMATS.md §7
 * (P/E, RPOs, add-back, dry powder, re-rate, LOI, QoE, NAICS, and the "…" that
 * sanctions extending it). The extensions are the same family: finance
 * shorthand that has a plain-English equivalent a principal reads without
 * stopping.
 *
 * `plain` is the shape of a fix, never a rewrite. `explained` is what counts as
 * having explained it nearby — deliberately generous, because a false positive
 * here is more expensive than a miss.
 */
interface Term {
  re: RegExp;                 // the shorthand itself
  plain: string;              // the shape of a fix — never a replacement sentence
  explained?: RegExp;         // plain words that mean it has already been explained
  ci?: boolean;               // case-insensitive (phrases yes, acronyms no)
}

const TERMS: Term[] = [
  { re: /EV\s*\/\s*EBITDA|enterprise value\s*\/\s*EBITDA/, ci: true,
    plain: 'say what is being compared to what — the whole business, debt included, against its operating earnings',
    explained: /whole business|debt included|including (its |the )?debt|business plus (its )?debt|equity and debt together/i },
  { re: /EV\s*\/\s*(revenue|sales)/, ci: true,
    plain: 'say it in words — the whole business, debt included, against a year of sales',
    explained: /whole business|debt included|including (its |the )?debt/i },
  { re: /\bP\s*\/\s*E\b/,
    plain: 'say share price against earnings per share, or drop it',
    explained: /price .{0,24}earnings|earnings per share/i },
  { re: /\bSDE\b/,
    plain: "spell out what the owner actually takes out of the business before you abbreviate it",
    explained: /(seller|owner)'?s?\s+discretionary|what the owner (actually )?(takes|earns|pays themselves)/i },
  { re: /\b(LTM|TTM|NTM)\b/,
    plain: 'say "the last twelve months" (or "the next twelve") in words',
    explained: /last twelve months|trailing twelve|next twelve months|last 12 months|past (twelve months|year)/i },
  { re: /\bCAGR\b/,
    plain: 'say "growth of x% a year, compounded" — the reader should not have to expand an acronym to read a growth rate',
    explained: /compound|% a year|per year|annual(ised|ized)? growth/i },
  { re: /\bbps\b/,
    plain: 'use percentage points — "0.4 points", not "40bps"',
    explained: /basis points?|percentage points?/i },
  { re: /\badd[- ]?backs?\b/, ci: true,
    plain: 'name what is being added back — the owner\'s own costs a buyer would not carry',
    explained: /add(ed|ing)? back|owner'?s (own |personal )?(costs|expenses|salary)|(costs|expenses) (a |the )?(new )?(buyer|owner) would not/i },
  { re: /\bdry powder\b/, ci: true,
    plain: 'say money already raised and not yet spent',
    explained: /raised .{0,40}(not|yet to be) .{0,12}(spent|deployed|invested)|uncommitted|committed but unspent|waiting to be (spent|deployed)/i },
  { re: /\bre-?rat(e|ed|ing)\b/, ci: true,
    plain: 'say buyers are paying more (or less) for the same earnings than they were',
    explained: /paying (more|less) for|price .{0,30}(rose|fell|moved)|(higher|lower) (price|multiple) for the same/i },
  { re: /\bmultiple arbitrage\b/, ci: true,
    plain: 'say it plainly — small companies bought cheaply are worth more once they are part of a big one',
    explained: /bought .{0,40}(cheap|less)|worth more (once|when|as part)|price difference between/i },
  { re: /\broll[- ]?ups?\b/, ci: true,
    plain: 'say buying several small companies and running them as one',
    explained: /buying (several|many|multiple|dozens)|combin(e|ing) .{0,40}(small|independent)|running them as one|under one owner/i },
  { re: /\btuck[- ]?ins?\b|\bbolt[- ]?ons?\b/, ci: true,
    plain: 'say a small company folded into one the buyer already owns',
    explained: /fold(ed|s|ing)? into|added to (a|an|the) .{0,24}(business|company|platform) (they|it) already|small(er)? (company|business) .{0,40}alongside/i },
  { re: /\bplatform parent\b/, ci: true,
    plain: 'say the first company a fund bought in the market, the one everything else gets added to',
    explained: /first (company|business|acquisition)|built around|everything else (is )?added/i },
  { re: /\bcomp set\b|\bcomps\b/, ci: true,
    plain: 'say what it is — the companies or deals you are comparing it against',
    explained: /comparable (companies|transactions|businesses|deals)|similar (companies|deals|businesses)/i },
  { re: /\bin-?band\b/, ci: true,
    plain: 'say it fits the buy-box, and name the part of it that matters',
    explained: /inside the (buy-?box|range|criteria)|fits the (buy-?box|criteria)|within the range/i },
  { re: /\brecurring mix\b/, ci: true,
    plain: 'say the share of revenue that comes back every year without being re-sold',
    explained: /share of revenue|revenue that (repeats|comes back|recurs)|repeat(ing)? revenue/i },
  { re: /\bLOIs?\b/,
    plain: 'say letter of intent, once, and then use it',
    explained: /letters? of intent|non-?binding offer/i },
  { re: /\bQ\s*of\s*E\b|\bQoE\b/, ci: true,
    plain: 'say an accountant checking the earnings are real',
    explained: /quality of earnings|accountant .{0,40}earnings|verif(y|ies|ied|ying) .{0,30}earnings/i },
  { re: /\bNAICS\b|\bSIC codes?\b/,
    plain: 'say the government industry code, and name the industry',
    explained: /(industry|government) classification|classification (code|system)|the government'?s? .{0,20}codes?/i },
  { re: /\bRPOs?\b/,
    plain: 'say work already under contract that has not been billed yet',
    explained: /remaining performance obligation|under contract .{0,40}not .{0,16}(billed|invoiced|recognis|recogniz)|contracted backlog/i },
  { re: /\brecaps?\b/, ci: true,
    plain: 'say what the owner is actually doing — selling part and keeping part, usually with new debt',
    explained: /recapitali[sz]|sell(ing)? part .{0,30}keep|keeps? a (stake|share|slice)|refinanc/i },
  { re: /\bdiligence\s+(the|a|an|every|each|your)\b/, ci: true,
    plain: '"diligence" is not a verb outside this trade — check, read, or go through',
    explained: /$^/ },  // no gloss makes a verbed noun read as plain English
  { re: /\baccretive\b|\bdilutive\b/, ci: true,
    plain: 'say whether it makes the buyer\'s earnings per share go up or down',
    explained: /earnings per share|makes .{0,30}(more|less) money per share/i },
  { re: /\bTAM\b|\bSAM\b|\bSOM\b/,
    plain: 'say how big the market is and which part of it you mean',
    explained: /total addressable|the whole market|the part of the market/i },
];

/* EBITDA, revenue and multiple are NEVER flagged — FORMATS.md §7. The reader
 * knows them. Listed here so the next session does not "helpfully" add them. */
const NEVER = ['EBITDA', 'revenue', 'multiple', 'margin', 'cash flow'];

/* FILLER — FORMATS.md §7's six, plus four of the same species. `leverage` is
 * flagged only as a VERB: leverage as a noun is debt, which is a real word in
 * this practice and appears in every mandate. */
const FILLER: { re: RegExp; plain: string }[] = [
  { re: /\bleverag(e|es|ed|ing)\s+(the|our|their|its|a|an|this)\b/i, plain: 'use, or say what you actually did with it' },
  { re: /\butili[sz](e|es|ed|ing)\b/i, plain: 'use' },
  { re: /\brobust\b/i, plain: 'say what is strong about it' },
  { re: /\bseamless(ly)?\b/i, plain: 'say what does not break' },
  { re: /\bsynerg(y|ies|istic)\b/i, plain: 'name the saving or the sale it produces' },
  { re: /\bin order to\b/i, plain: 'to' },
  { re: /\bsolutions?\b/i, plain: 'name the thing — the service, the product, the work' },
  { re: /\bbest[- ]in[- ]class\b/i, plain: 'say what it is better at, against whom' },
  { re: /\bvalue[- ]add(ed)?\b/i, plain: 'say what it adds' },
  { re: /\bgoing forward\b/i, plain: 'cut it, or give a date' },
  { re: /\bturnkey\b/i, plain: 'say what the buyer does not have to do' },
];
/* "world-class" is NOT filler here — the attribution law requires "a world-class
 * PE-backed aggregator" verbatim. Flagging it would fight a law with a taste. */

/* Acronyms a principal reads without stopping. Everything else all-caps gets a
 * warning if its expansion is nowhere near it — IUEC on a card is the case. */
const KNOWN_ACRONYMS = new Set([
  'US', 'USA', 'UK', 'EU', 'CEO', 'CFO', 'COO', 'CTO', 'PE', 'VC', 'M&A', 'IT', 'HR', 'PDF',
  'LLC', 'LLP', 'INC', 'CO', 'NYC', 'DFW', 'AI', 'HVAC', 'EBITDA', 'ROI', 'IRR', 'GDP', 'CPI',
  'IPO', 'SEC', 'IRS', 'FAQ', 'CRM', 'API', 'URL', 'OK', 'TV', 'DIY', 'B2B', 'B2C', 'SMB', 'LMM',
  'NDA', 'LOI', 'EPS', 'P&L', 'OEM', 'ASME', 'NFPA', 'OSHA', 'EPA', 'BLS', 'A17', 'CMS', 'EV',
]);
/* "Level III inspector" is a roman numeral, not an abbreviation. */
const ROMAN = /^[IVXLCDM]+$/;

/* ── args, in the shape audit.mts and carta-guard.mts use ──────────────── */
const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const targetArg = argv.find(a => !a.startsWith('--'));
if (!targetArg) {
  console.error('Usage: voice-check.mts <spec.deck.mts | spec.post.mts | doc.md | specs-dir> [--strict]');
  process.exit(2);
}
const target = path.resolve(targetArg);
if (!existsSync(target)) { console.error(`No such file: ${target}`); process.exit(2); }

const SPEC = /\.(deck|post)\.mts$/i;
const DOC = /\.(md|markdown)$/i;
let targets: string[];
if (statSync(target).isDirectory()) {
  targets = readdirSync(target).map(f => path.join(target, f)).filter(f => SPEC.test(f) || DOC.test(f)).sort();
  if (!targets.length) { console.error(`Nothing to check in ${targetArg} — no .deck.mts, .post.mts or .md`); process.exit(2); }
} else targets = [target];

/* ── findings ─────────────────────────────────────────────────────────── */
type Level = 'finding' | 'warning';
interface Hit { check: string; level: Level; where: string; phrase: string; fix: string }
let findings = 0, warnings = 0, cleared = 0, couldNotCheck = 0;

const rel = (p: string) => path.relative(process.cwd(), p) || p;
/* A doc unit is already labelled "line 812"; a spec field is "pages[3].body"
 * and needs the file:line pinned to it. */
const at = (u: Scan, file: string) => (/^line \d+$/.test(u.label) ? `${rel(file)}:${u.line}` : `${u.label}  ${rel(file)}:${u.line}`);
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const clip = (s: string, n = 88) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/* Where a string lives in the source file, so the report can name a line as
 * well as a field. A spec is a module by the time we read its copy, and a field
 * path alone means hunting for it. */
function lineOf(raw: string, needle: string): number | null {
  const probe = squash(needle).slice(0, 40);
  if (probe.length < 8) return null;
  const i = raw.indexOf(probe.slice(0, 24));
  if (i < 0) return null;
  return raw.slice(0, i).split('\n').length;
}

/* ── check 1 · THE MESSAGE ─────────────────────────────────────────────── */

/* Sentences that describe the FILE rather than the piece. The elevator
 * teardown's header is the canonical failure: a complete, useful field
 * reference that never says what the deck is for. */
const MACHINERY = /\b(worked example|field reference|the shape (every|of)|copy this file|to make a new|usage:|npx |tsx |page kinds?|export const|renders? standalone|fields \(|slot table|object-fit|image slot|see [\w./-]+\.md|resolves? against|output basename)\b/i;
const LABEL = /^(?:the\s+)?(message|purpose|what (?:this|it) (?:is for|says|argues))\b|^in one line\b|^the one[- ]sentence\b/i;

function headerBlock(raw: string): string | null {
  const block = raw.match(/^\s*\/\*\*?([\s\S]*?)\*\//);
  if (block) return block[1].split('\n').map(l => l.replace(/^\s*\*ns?\s?/, '').replace(/^\s*\*\s?/, '')).join('\n');
  const slashes = raw.match(/^(?:\s*\/\/[^\n]*\n)+/);
  if (slashes) return slashes[0].replace(/^\s*\/\/\s?/gm, '');
  return null;
}

function firstSentence(p: string): string {
  const m = p.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return squash(m ? m[0] : p);
}

function checkMessage(raw: string, file: string, hits: Hit[]) {
  const head = headerBlock(raw);
  if (!head) {
    hits.push({ check: 'NO MESSAGE', level: 'finding', where: `${rel(file)}:1`,
      phrase: '(no header comment at all)',
      fix: 'open the spec with a /** */ block whose first line is the one sentence this piece exists to say' });
    return;
  }
  const paras = head.split(/\n\s*\n/).map(squash).filter(p => p.length > 2 && !/^[─═-]{4,}$/.test(p));

  for (const p of paras) {
    const lab = p.match(LABEL);
    if (!lab) continue;
    const after = squash(p.slice(lab[0].length)
      .replace(/^[\s,:—–-]+/, '')
      .replace(/^in (one|a) (line|sentence)\b[\s,:—–-]*/i, ''));   // "THE MESSAGE, in one line: …"
    const sentence = firstSentence(after);
    if (sentence.split(/\s+/).length >= 6) {
      cleared++;
      console.log(`  message   ${clip(sentence, 110)}`);
      return;                                    // labelled and said. Done.
    }
    hits.push({ check: 'NO MESSAGE', level: 'finding', where: `${rel(file)}:${lineOf(raw, p) ?? 1}`,
      phrase: clip(squash(p), 70),
      fix: 'the label is there but the sentence is not — say in one sentence what a reader should do or believe after this' });
    return;
  }

  /* No label. A header can still open by saying what the piece is for, and
   * refusing that would fail good specs on formatting. So: the first sentence,
   * if it is about the market rather than about the file. */
  const opening = paras.length ? firstSentence(paras[0]) : '';
  const machinery = MACHINERY.test(paras.slice(0, 2).join(' '));
  if (opening && !machinery && !MACHINERY.test(opening) && opening.split(/\s+/).length >= 8) {
    warnings++;
    console.log(`  message   ${clip(opening, 100)}`);
    console.log(`            ↑ read as the message, but it carries no label. Mark it "THE MESSAGE:" so the`);
    console.log(`              next session cannot mistake the opening paragraph for one.`);
    return;
  }
  hits.push({ check: 'NO MESSAGE', level: 'finding', where: `${rel(file)}:${lineOf(raw, paras[0] ?? '') ?? 1}`,
    phrase: opening ? clip(opening, 70) : '(header says nothing about the piece)',
    fix: machinery
      ? 'this header documents the FILE, not the piece — add one sentence saying what the deck is for before the field notes'
      : 'add one sentence saying what this piece is for. DESIGN.md §9: if you cannot write it, the piece is not ready to build' });
}

/* ── check 2 · JARGON, with the explained-nearby allowance ─────────────── */
interface Scan { label: string; text: string; context: string; line: number | null }

function scanTerms(units: Scan[], hits: Hit[], file: string) {
  /* Grouped by term, not by occurrence. A term used eight times in a report is
   * one decision, not eight findings, and printing it eight times is how a
   * reader learns to skim past the one that mattered. */
  for (const t of TERMS) {
    const re = new RegExp(t.re.source, t.ci ? 'gi' : 'g');
    const bare: Scan[] = [], phrases: string[] = [];
    let seen = 0, glossed = 0;
    for (const u of units) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(u.text))) {
        seen++;
        const after = u.context.slice(u.context.indexOf(m[0]) + m[0].length, u.context.indexOf(m[0]) + m[0].length + 140);
        const inPlace = /^\s*[—–(-]\s*[^)]{12,}|^\s*[:,]\s*(which|that is|meaning|i\.e\.)|^\s*\((?=[^)]{12,})/i.test(after)
          || /\b(which means|in plain terms|put plainly|that is to say|in other words)\b/i.test(u.context);
        if ((t.explained && t.explained.test(u.context)) || inPlace) { glossed++; continue; }
        bare.push(u); phrases.push(m[0]);
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    }
    if (glossed) cleared += glossed;
    if (!bare.length) continue;
    const places = [...new Set(bare.map(u => at(u, file)))];
    const where = places.slice(0, 3).join(' · ');
    hits.push({
      check: 'JARGON', level: 'finding',
      where: where + (places.length > 3 ? ` +${places.length - 3} more` : '') + (glossed ? ` — explained ${glossed}× elsewhere` : ''),
      phrase: phrases[0],
      fix: t.plain,
    });
  }
}

/* Unexpanded acronyms — display copy only. On a card there is no page 2 to
 * define it on. Warning, never a finding: this one is a judgement call and the
 * whitelist can only ever be approximately right. */
function scanAcronyms(units: Scan[], hits: Hit[], file: string) {
  const seen = new Map<string, Scan>();
  /* CAPS FOR EMPHASIS IS NOT AN ACRONYM. "It's an EARLY lane" is a house
   * device, and the tell is that the same word appears in lower case somewhere
   * else in the piece — an abbreviation never does. */
  const lower = new Set<string>();
  for (const u of units) for (const w of u.text.matchAll(/\b[a-z][a-z']{1,7}\b/g)) lower.add(w[0]);
  for (const u of units) {
    /* A mono kicker and a page tag are UPPERCASE BY DESIGN — 'THE REVENUE
     * ENGINE' is not four undefined acronyms. So this only reads mixed-case
     * prose, where an all-caps token is genuinely an abbreviation, and it skips
     * any run of caps that is really a headline in caps. */
    if (u.text === u.text.toUpperCase()) continue;
    for (const m of u.text.matchAll(/\b([A-Z][A-Z&]{1,5})\b/g)) {
      const a = m[1];
      const around = u.text.slice(Math.max(0, m.index! - 24), m.index! + a.length + 24);
      if ((around.match(/\b[A-Z][A-Z&]{1,5}\b/g) ?? []).length > 2) continue;   // a capitalised phrase
      if (KNOWN_ACRONYMS.has(a) || NEVER.includes(a) || lower.has(a.toLowerCase()) || ROMAN.test(a)) continue;
      if (TERMS.some(t => new RegExp(t.re.source, 'i').test(a))) continue;   // already a JARGON hit
      if (seen.has(a)) continue;
      /* Expanded nearby? "International Union of Elevator Constructors (IUEC)"
       * — initials of nearby capitalised words matching the acronym. */
      const words = u.context.match(/\b[A-Z][a-z]+\b/g) ?? [];
      const initials = words.map(w => w[0]).join('');
      if (initials.includes(a)) continue;
      seen.set(a, u);
    }
  }
  for (const [a, u] of seen) {
    hits.push({ check: 'SHORTHAND', level: 'warning', where: at(u, file), phrase: a,
      fix: 'say what it stands for the first time — a reader on a card cannot look it up. Ignore this if it is a company name; that is the one case the check cannot tell apart' });
  }
}

/* ── checks 3 and 4 · FILLER, STIFF / LONG ─────────────────────────────── */
function scanFiller(units: Scan[], hits: Hit[], file: string) {
  for (const f of FILLER) {
    const first = units.find(u => f.re.test(u.text));
    if (!first) continue;
    const n = units.filter(u => f.re.test(u.text)).length;
    hits.push({ check: 'FILLER', level: 'warning',
      where: at(first, file) + (n > 1 ? ` +${n - 1} more` : ''),
      phrase: squash(first.text.match(f.re)![0]), fix: f.plain });
  }
}

const sentences = (s: string) => s.split(/(?<=[.!?])["')\]]?\s+/).map(squash).filter(Boolean);

/* THE LONG-SENTENCE BAR IS NOT THE SAME ON BOTH SURFACES. FORMATS.md §7's 32
 * words is written for copy that lands on a card, where the reader is scrolling
 * and the sentence has one shot. A report is read sitting down, and a 36-word
 * sentence with a subordinate clause is normal, correct prose there — running
 * the card bar over a market master produced fifty warnings on a document whose
 * writing is fine, which is precisely the "cries wolf" failure the check is
 * supposed to avoid. 45 words in a document still catches the ones that have
 * genuinely got away. */
function scanStiff(units: Scan[], hits: Hit[], file: string, display: Set<string>, longBar: number) {
  for (const u of units) {
    for (const s of sentences(u.text)) {
      const words = (s.match(/[A-Za-z0-9][\w'’%$.,/-]*/g) ?? []).length;   // bullets and rules are not words
      if (words > longBar) {
        hits.push({ check: 'LONG', level: 'warning',
          where: at(u, file), phrase: `${words} words — ${clip(s, 60)}`,
          fix: `split it. Over ${longBar} words and the reader is holding the front of the sentence while you finish it` });
      }
      /* The construction that only works on the page. DESIGN.md §9's own
       * example: "Quoting either one without naming which it is, is." The tell
       * is a bare auxiliary verb left stranded after a comma at the very end —
       * matching any short word there fired on ordinary clauses instead. */
      if (/,\s+(is|are|was|were|does|do|did|has|have|had|can|could|will|would|should|isn't|aren't|wasn't|don't|didn't)\.$/i.test(s) && words > 6) {
        hits.push({ check: 'STIFF', level: 'warning',
          where: at(u, file), phrase: clip(s, 70),
          fix: 'that trailing clause is a trick, not a sentence — say it the way you would say it out loud' });
      }
    }
    if (display.has(u.label) && u.text.includes(';')) {
      hits.push({ check: 'STIFF', level: 'warning',
        where: at(u, file), phrase: clip(u.text, 70),
        fix: 'a semicolon in display copy is a full stop wearing a costume — use two sentences' });
    }
  }
}

/* ── gathering copy ───────────────────────────────────────────────────── */
const SKIP_KEYS = new Set(['slug', 'image', 'imagePos', 'headshot', 'variants', 'tagColor', 'style', 'kind', 'h', 'byline', 'source', 'name']);

function gatherSpec(obj: any, raw: string): { units: Scan[]; display: Set<string> } {
  const units: Scan[] = [], display = new Set<string>();
  const DISPLAY_KEYS = new Set(['hook', 'head', 'sub', 'tag', 'kicker', 'numeral', 'unit', 'invite', 'cta', 'numeralLabel', 'label']);
  /* "Nearby" for a spec is the PAGE. A card is read alone, so a term explained
   * three pages later was not explained. */
  const walk = (node: any, label: string, context: string) => {
    if (typeof node === 'string') {
      const key = label.split('.').pop()!.replace(/\[\d+\]$/, '');
      if (SKIP_KEYS.has(key) || !node.trim()) return;
      if (/^[\w./-]+\.(png|jpe?g|webp|svg)$/i.test(node)) return;
      units.push({ label, text: node, context: context || node, line: lineOf(raw, node) });
      if (DISPLAY_KEYS.has(key)) display.add(label);
      return;
    }
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${label}[${i}]`, context)); return; }
    if (node && typeof node === 'object') {
      const own = Object.entries(node).filter(([k]) => !SKIP_KEYS.has(k)).map(([, v]) => (typeof v === 'string' ? v : '')).join(' ');
      for (const [k, v] of Object.entries(node)) walk(v, label ? `${label}.${k}` : k, own || context);
    }
  };
  walk(obj, '', '');
  return { units, display };
}

function gatherDoc(raw: string): Scan[] {
  const units: Scan[] = [];
  const lines = raw.split('\n');
  let fence = false;
  /* Paragraph-level units: "within a sentence or two" is the rule, and a
   * paragraph is the closest honest approximation of it. Fenced code, tables
   * and link targets are not prose and are not checked. */
  let buf: string[] = [], start = 1;
  const flush = () => {
    if (!buf.length) return;
    const text = buf.join(' ');
    if (squash(text)) units.push({ label: `line ${start}`, text, context: text, line: start });
    buf = [];
  };
  lines.forEach((l, i) => {
    if (/^\s*```/.test(l)) { fence = !fence; flush(); return; }
    if (fence) return;
    if (!l.trim()) { flush(); return; }
    if (/^\s*\|/.test(l) || /^\s*<!--/.test(l)) { flush(); return; }
    if (!buf.length) start = i + 1;
    /* Emphasis markers off: `**word.** Next` otherwise reads as one sentence
     * and every bold lead-in silently doubles a sentence's length. */
    const clean = l.replace(/https?:\/\/\S+/g, ' ').replace(/^#+\s*/, '').replace(/^\s*>\s?/, '').replace(/\*\*|__|(?<!\w)[*_`](?!\w)/g, '');
    /* A `## Sources` register is a list of bare URLs. Stripped, each line is a
     * lone bullet, and forty of them glued together read as one 56-word
     * sentence. Nothing with fewer than two words on it is prose. */
    if ((clean.match(/[A-Za-z]{2,}/g) ?? []).length < 2) { flush(); return; }
    if (!buf.length) start = i + 1;
    buf.push(clean);
    return;
  });
  flush();
  return units;
}

/* ── run ──────────────────────────────────────────────────────────────── */
console.log(`\nvoice-check${STRICT ? '  (--strict: warnings count as findings)' : ''}`);

/* Printing is its own function because the copy checks can be cut short — a
 * spec that will not import still had its header read, and a missing MESSAGE
 * found on the way past is a result. Dropping it because a later check failed
 * is how a file comes back "could not check" while carrying a known finding. */
function emit(hits: Hit[], read: number) {
  const eff = (h: Hit): Level => (STRICT ? 'finding' : h.level);
  const F = hits.filter(h => eff(h) === 'finding'), W = hits.filter(h => eff(h) === 'warning');
  findings += F.length; warnings += W.length;
  const print = (list: Hit[], mark: string) => {
    const CAP = 8;
    for (const h of list.slice(0, CAP)) {
      console.log(`  ${mark} ${h.check.padEnd(10)} ${h.where}`);
      console.log(`      “${clip(h.phrase)}”`);
      console.log(`      → ${h.fix}`);
    }
    if (list.length > CAP) console.log(`  ${mark} … and ${list.length - CAP} more of the same kind.`);
  };
  if (F.length) { console.log(''); print(F, '✗'); }
  if (W.length) { console.log(''); print(W, '·'); }
  console.log(`\n  ${read} passage(s) read · ${F.length} finding(s) · ${W.length} warning(s)`);
}

for (const file of targets) {
  const hits: Hit[] = [];
  console.log(`\n── ${rel(file)} ${'─'.repeat(Math.max(0, 58 - rel(file).length))}`);
  let units: Scan[] = [], display = new Set<string>(), longBar = 32;

  if (SPEC.test(file)) {
    const raw = readFileSync(file, 'utf8');
    checkMessage(raw, file, hits);
    let mod: any;
    try {
      mod = await import(pathToFileURL(file).href);
    } catch (e: any) {
      console.log(`  COULD NOT CHECK the copy — the spec did not load: ${e?.message ?? e}`);
      couldNotCheck++; emit(hits, 0);
      continue;
    }
    const spec = mod.deck ?? mod.post ?? mod.default ?? Object.values(mod).find(v => v && typeof v === 'object');
    if (!spec) {
      console.log('  COULD NOT CHECK the copy — no `deck` or `post` export found.');
      couldNotCheck++; emit(hits, 0);
      continue;
    }
    ({ units, display } = gatherSpec(spec, raw));
    scanAcronyms(units, hits, file);
  } else if (DOC.test(file)) {
    console.log('  message   n/a — a document has no spec header. The MESSAGE check is for specs;');
    console.log('            for a report, the message is the executive summary and only you can read it.');
    units = gatherDoc(readFileSync(file, 'utf8'));
    longBar = 45;
  } else {
    console.log('  COULD NOT CHECK — not a .deck.mts, .post.mts or .md');
    couldNotCheck++;
    continue;
  }

  if (!units.length) { console.log('  COULD NOT CHECK — no copy found in this file.'); couldNotCheck++; emit(hits, 0); continue; }

  scanTerms(units, hits, file);
  scanFiller(units, hits, file);
  scanStiff(units, hits, file, display, longBar);
  emit(hits, units.length);
}

/* ── the closing, and the part that matters ───────────────────────────── */
console.log('\n──────────────────────────────────────────────────────────────');
console.log(`${findings} finding(s) · ${warnings} warning(s)${cleared ? ` · ${cleared} term(s) cleared as already explained` : ''}`);
if (!STRICT && warnings) console.log('Warnings do not fail the run. --strict promotes them.');
console.log('\nWhat this cannot do: it cannot tell you whether a sentence sounds like a');
console.log('person. It finds shorthand, filler and long sentences. A sentence that is');
console.log('short, plain, jargon-free and completely lifeless passes here clean.');
console.log('READ THE COPY ALOUD before it renders — that is still the only test for it,');
console.log('and it is step 8 of the order of operations for exactly this reason.\n');

if (couldNotCheck && !findings) process.exit(2);
process.exit(findings ? 1 : 0);
