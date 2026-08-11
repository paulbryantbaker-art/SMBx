/**
 * Studio Performance — LinkedIn analytics import + Yulia's read (2026-07-19).
 *
 * Paul exports his LinkedIn aggregate analytics workbook (the standard
 * member export: DISCOVERY · ENGAGEMENT · TOP POSTS · FOLLOWERS ·
 * DEMOGRAPHICS sheets) and drops it into Studio. Two strictly separated
 * layers:
 *
 *   1. MECHANICAL EXTRACTION (this file, no AI): a dependency-free XLSX
 *      reader (zip central directory + worksheet XML + sharedStrings) turns
 *      the workbook into rows exactly as exported — zero hallucination; every
 *      number in the app IS the number LinkedIn wrote.
 *   2. ANALYSIS (Claude, no web tools): Yulia reads the extracted tables plus
 *      the Studio context (recent runs' formats, active campaigns) and writes
 *      the performance read + next-week improvement plan in the posting
 *      plan's own vocabulary. The prompt forbids numbers not present in the
 *      data and stays inside THE LINE (no fees, no invented benchmarks).
 *
 * The parser intentionally supports just the XLSX subset LinkedIn (and an
 * Excel re-save) produces: stored/deflated zip entries, shared strings,
 * inline strings, and plain numeric cells. Anything else fails loudly with
 * a "re-export from LinkedIn" message rather than guessing.
 */
import { inflateRawSync } from 'zlib';
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';
import { assertSpendAllowed } from './apiSpend.js';

const MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // ONLY Yulia's READ of the import is gated. The XLSX parser below calls no
  // model at all — it is the one Studio capability with no local equivalent
  // (WHERE_THE_WORK_HAPPENS.md §"The one real gap"), so importing a LinkedIn
  // export and reading the verbatim stat grid keeps working with the lane off.
  assertSpendAllowed('studio', "Yulia's read of a LinkedIn import");
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000, maxRetries: 2 });
  }
  return client;
}

/* ─── Minimal zip reader (enough for XLSX) ────────────────────────────── */

function readZipEntries(buf: Buffer): Map<string, Buffer> {
  // End-of-central-directory: scan back from the end (comment ≤ 64KB).
  let eocd = -1;
  const floor = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= floor; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a valid .xlsx file (no zip directory found)');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const entries = new Map<string, Buffer>();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Corrupt .xlsx (bad central directory)');
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf8');
    // The local header carries its own (possibly different) name/extra sizes.
    if (buf.readUInt32LE(localOff) !== 0x04034b50) throw new Error('Corrupt .xlsx (bad local header)');
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.slice(dataStart, dataStart + compSize);
    if (method === 0) entries.set(name, raw);
    else if (method === 8) entries.set(name, inflateRawSync(raw));
    else throw new Error(`Unsupported compression in .xlsx (method ${method})`);
    off += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/* ─── XLSX → named sheets of string rows ──────────────────────────────── */

const unescapeXml = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

function colToIdx(ref: string): number {
  let n = 0;
  for (const ch of ref) {
    if (ch >= 'A' && ch <= 'Z') n = n * 26 + (ch.charCodeAt(0) - 64);
    else break;
  }
  return n - 1;
}

export function parseWorkbookSheets(buf: Buffer): Record<string, string[][]> {
  const files = readZipEntries(buf);
  const wbXml = files.get('xl/workbook.xml')?.toString('utf8');
  if (!wbXml) throw new Error('Not an Excel workbook (missing xl/workbook.xml)');

  // Shared strings (LinkedIn stores every cell as one).
  const shared: string[] = [];
  const ssXml = files.get('xl/sharedStrings.xml')?.toString('utf8') ?? '';
  for (const m of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const ts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => unescapeXml(t[1]));
    shared.push(ts.join(''));
  }

  // Sheet name → worksheet path via the workbook rels.
  const relsXml = files.get('xl/_rels/workbook.xml.rels')?.toString('utf8') ?? '';
  const relTarget = new Map<string, string>();
  for (const m of relsXml.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g)) {
    relTarget.set(m[1], m[2].replace(/^\//, '').replace(/^(?!xl\/)/, 'xl/'));
  }

  const out: Record<string, string[][]> = {};
  for (const m of wbXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/>/g)) {
    const name = unescapeXml(m[1]);
    const target = relTarget.get(m[2]);
    const xml = target ? files.get(target)?.toString('utf8') : undefined;
    if (!xml) continue;
    const rows: string[][] = [];
    for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells: string[] = [];
      for (const cm of rm[1].matchAll(/<c\s+([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = cm[1];
        const inner = cm[2] ?? '';
        const ref = /r="([A-Z]+)\d+"/.exec(attrs)?.[1];
        if (!ref) continue;
        const t = /t="([^"]+)"/.exec(attrs)?.[1];
        let val = '';
        if (t === 'inlineStr') {
          val = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => unescapeXml(x[1])).join('');
        } else {
          const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
          if (v != null) val = t === 's' ? shared[Number(v)] ?? '' : unescapeXml(v);
        }
        const idx = colToIdx(ref);
        while (cells.length < idx) cells.push('');
        cells[idx] = val;
      }
      rows.push(cells);
    }
    out[name] = rows;
  }
  if (!Object.keys(out).length) throw new Error('The workbook has no readable sheets');
  return out;
}

/* ─── LinkedIn aggregate export → normalized summary ──────────────────── */

export interface LinkedInSummary {
  periodStart: string | null; // ISO date
  periodEnd: string | null;
  impressions: number | null;
  membersReached: number | null;
  totalEngagements: number | null;
  daily: { date: string; impressions: number; engagements: number }[];
  newFollowers: number | null;
  totalFollowers: number | null;
  followersDaily: { date: string; newFollowers: number }[];
  topByEngagements: { url: string; publishedAt: string; engagements: number }[];
  topByImpressions: { url: string; publishedAt: string; impressions: number }[];
  demographics: { category: string; value: string; percentage: string }[];
}

const toNum = (s: string | undefined): number | null => {
  if (s == null) return null;
  const n = Number(String(s).replace(/[,%\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

/** "7/13/2026" → "2026-07-13" (kept null when unparseable — never guessed). */
const usDateToIso = (s: string | undefined): string | null => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s ?? '').trim());
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
};

export function normalizeLinkedInExport(sheets: Record<string, string[][]>): LinkedInSummary {
  const byName = (want: string) => {
    const key = Object.keys(sheets).find((k) => k.trim().toUpperCase() === want);
    return key ? sheets[key] : undefined;
  };

  const s: LinkedInSummary = {
    periodStart: null, periodEnd: null,
    impressions: null, membersReached: null, totalEngagements: null,
    daily: [], newFollowers: null, totalFollowers: null, followersDaily: [],
    topByEngagements: [], topByImpressions: [], demographics: [],
  };

  const disc = byName('DISCOVERY');
  if (disc) {
    const range = /(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/.exec(disc[0]?.[1] ?? '');
    if (range) { s.periodStart = usDateToIso(range[1]); s.periodEnd = usDateToIso(range[2]); }
    for (const row of disc) {
      const k = (row[0] ?? '').trim().toLowerCase();
      if (k === 'impressions') s.impressions = toNum(row[1]);
      if (k === 'members reached') s.membersReached = toNum(row[1]);
    }
  }

  const eng = byName('ENGAGEMENT');
  if (eng) {
    for (const row of eng.slice(1)) {
      const date = usDateToIso(row[0]);
      if (!date) continue;
      s.daily.push({ date, impressions: toNum(row[1]) ?? 0, engagements: toNum(row[2]) ?? 0 });
    }
    if (s.daily.length) s.totalEngagements = s.daily.reduce((a, d) => a + d.engagements, 0);
  }

  const posts = byName('TOP POSTS');
  if (posts) {
    // Dual table: A-C = top by engagements, E-G = top by impressions;
    // row 1 is a note, the header row carries "Post URL".
    const headerIdx = posts.findIndex((r) => (r[0] ?? '').trim() === 'Post URL' || (r[4] ?? '').trim() === 'Post URL');
    for (const row of posts.slice(headerIdx + 1)) {
      if ((row[0] ?? '').startsWith('http')) {
        s.topByEngagements.push({ url: row[0], publishedAt: usDateToIso(row[1]) ?? (row[1] ?? ''), engagements: toNum(row[2]) ?? 0 });
      }
      if ((row[4] ?? '').startsWith('http')) {
        s.topByImpressions.push({ url: row[4], publishedAt: usDateToIso(row[5]) ?? (row[5] ?? ''), impressions: toNum(row[6]) ?? 0 });
      }
    }
  }

  const fol = byName('FOLLOWERS');
  if (fol) {
    for (const row of fol) {
      if (/^total followers on/i.test((row[0] ?? '').trim())) s.totalFollowers = toNum(row[1]);
      const date = usDateToIso(row[0]);
      if (date) s.followersDaily.push({ date, newFollowers: toNum(row[1]) ?? 0 });
    }
    if (s.followersDaily.length) s.newFollowers = s.followersDaily.reduce((a, d) => a + d.newFollowers, 0);
  }

  const demo = byName('DEMOGRAPHICS');
  if (demo) {
    for (const row of demo.slice(1)) {
      if ((row[0] ?? '').trim() && (row[1] ?? '').trim()) {
        s.demographics.push({ category: row[0].trim(), value: row[1].trim(), percentage: (row[2] ?? '').trim() });
      }
    }
  }

  if (s.impressions == null && !s.daily.length && !s.topByImpressions.length) {
    throw new Error('This workbook does not look like a LinkedIn analytics export (no DISCOVERY/ENGAGEMENT/TOP POSTS data found) — export it fresh from LinkedIn → Analytics → Post impressions.');
  }
  return s;
}

/* ─── Yulia's performance read ────────────────────────────────────────── */

const ANALYSIS_SYSTEM = `You are Yulia, the M&A deal-intelligence engine behind smbX — here acting as the practice's LinkedIn performance analyst. Paul Baker runs a buy-side corp-dev-as-a-service practice; LinkedIn is his channel for reaching acquirers (PE-backed platforms, family offices, corporates, independent sponsors, searchers). You are reading his REAL LinkedIn analytics export plus the practice's posting-plan context.

HARD RULES — these are law:
- ZERO FABRICATED NUMBERS. Every figure you cite must appear in (or be simple arithmetic on) the data provided. Never invent benchmarks, industry averages, "typical engagement rates", or follower comparisons. If the data can't answer something, say so plainly.
- The weekly posting plan's vocabulary is: Teardown, Contrarian Take, How Buyers Think, Practitioner Note, Human Thread, Hand-Raiser. Map every content suggestion to these formats so the plan is executable inside Studio.
- THE LINE: never suggest naming fees, pricing, or "DM me for rates" content; never suggest sell-side positioning. The practice is buy-side only. No invented client stories or testimonials — zero fabricated autobiography; where a personal anecdote would help, write "[YOURS: …]" placeholders.
- Employer anonymization: if past employers come up, say "a global investment bank" and "a world-class PE-backed aggregator" — never the names.
- Be honest about data caveats you can SEE (e.g., a negative daily engagement count is a LinkedIn correction; group-post URLs are distribution copies of the same content; a 7-day window is small — say "signal, not proof" where appropriate).
- No "As an AI". Write as the practice's analyst: direct, specific, warm-but-blunt.

Write GitHub-flavored markdown with EXACTLY these sections:
# Performance read — {period}
## What happened
(3-6 sentences; the week in numbers that matter, from the data only.)
## What worked, and why
(Tie specific posts/days to specific outcomes. Quote the real numbers.)
## What didn't
(Equally specific. If posting volume itself was the problem, say so.)
## Who's watching
(Read the demographics table like an operator: who the audience actually is, and what that means for content choices. This audience is the practice's buyer pool — connect it.)
## Next week's plan
(Per-slot, using the six format names. For each: the content angle, the hook style, and the VISUAL to pair — announcement card, 1-pager, carousel PDF, photo post — chosen from what Studio can produce. Be concrete enough to execute without another conversation.)
## Experiments to run
(2-4 falsifiable tests for the following week, each with the metric that decides it.)`;

function contextBlock(runs: any[], schedules: any[]): string {
  const runLines = runs.map((r) => `- [${r.status}] ${r.post_angle ?? 'auto'} · "${r.report_title || r.topic}" · created ${new Date(r.created_at).toISOString().slice(0, 10)}${r.review_status === 'approved' ? ' · approved' : ''}`);
  const schedLines = schedules.map((sc) => `- ${sc.active ? 'active' : 'paused'} · "${sc.name}" · ${sc.post_angle ?? 'auto'} · ${sc.cadence}`);
  return [
    'STUDIO CONTEXT (what the practice has been producing):',
    runLines.length ? `Recent research runs:\n${runLines.join('\n')}` : 'Recent research runs: none yet.',
    schedLines.length ? `Campaigns:\n${schedLines.join('\n')}` : 'Campaigns: none yet.',
  ].join('\n\n');
}

/** Run Yulia's read for one import. Fire-and-forget; status lives on the row. */
export async function analyzeLinkedInImport(analyticsId: number, userId: number): Promise<void> {
  // Before the row is stamped 'running' — otherwise a blocked press parks the
  // import at 'failed', which reads as "the analysis broke" rather than "this
  // lane is off". Importing and reading the verbatim stat grid is unaffected.
  assertSpendAllowed('studio', "Yulia's read of a LinkedIn import");
  const [row] = await sql`SELECT * FROM studio_analytics WHERE id = ${analyticsId} AND user_id = ${userId}`;
  if (!row) throw new Error('Import not found');
  await sql`UPDATE studio_analytics SET analysis_status = 'running', analysis_error = NULL WHERE id = ${analyticsId}`;
  try {
    const runs = await sql`
      SELECT status, post_angle, report_title, topic, review_status, created_at
      FROM research_runs WHERE user_id = ${userId} AND COALESCE(archived, FALSE) = FALSE
      ORDER BY created_at DESC LIMIT 12`;
    const schedules = await sql`
      SELECT name, post_angle, cadence, active FROM research_schedules
      WHERE user_id = ${userId} AND COALESCE(archived, FALSE) = FALSE
      ORDER BY created_at DESC LIMIT 12`;

    const summary = (row as any).data?.summary ?? {};
    const period = [summary.periodStart, summary.periodEnd].filter(Boolean).join(' → ') || 'recent period';
    const user = [
      `LINKEDIN ANALYTICS EXPORT — ${period} (personal profile: Paul Baker).`,
      'Every number below is verbatim from the export. Analyze ONLY this data.',
      '```json',
      JSON.stringify(summary, null, 1),
      '```',
      contextBlock(runs as any[], schedules as any[]),
      'Write the performance read now, following the required sections exactly.',
    ].join('\n\n');

    const resp = await getClient().messages
      .stream({ model: MODEL, max_tokens: 4000, system: ANALYSIS_SYSTEM, messages: [{ role: 'user', content: user }] })
      .finalMessage();
    const text = resp.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    if (!text) throw new Error('The model returned an empty analysis');
    await sql`UPDATE studio_analytics SET analysis = ${text}, analysis_status = 'complete' WHERE id = ${analyticsId}`;
  } catch (err: any) {
    const msg = err?.error?.error?.message || err?.message || 'Analysis failed';
    await sql`UPDATE studio_analytics SET analysis_status = 'failed', analysis_error = ${String(msg).slice(0, 500)} WHERE id = ${analyticsId}`;
    throw err;
  }
}

/** Parse an uploaded workbook and persist the import. Returns the new id. */
export async function importLinkedInWorkbook(userId: number, filename: string, buf: Buffer): Promise<number> {
  const sheets = parseWorkbookSheets(buf);
  const summary = normalizeLinkedInExport(sheets);
  const label = summary.periodStart && summary.periodEnd
    ? `LinkedIn · ${summary.periodStart} → ${summary.periodEnd}`
    : `LinkedIn · ${filename.replace(/\.xlsx?$/i, '').slice(0, 80)}`;
  const [row] = await sql`
    INSERT INTO studio_analytics (user_id, label, source, period_start, period_end, data)
    VALUES (${userId}, ${label}, 'linkedin', ${summary.periodStart}, ${summary.periodEnd},
            ${sql.json({ summary, sheets } as any)}::jsonb)
    RETURNING id`;
  return Number((row as any).id);
}
