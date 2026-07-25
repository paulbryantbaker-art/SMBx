/**
 * Research lanes — the living master document (Paul, 2026-07-24).
 *
 * "I'm gonna run the research in Claude Web app, I will run a research and
 * Gemini probably or other tool just so we have a variety of research… then I
 * will upload all of the research for it to pass through and calculate all the
 * information into one final document… I want to do this part in the app too
 * so that I can keep all the research in the database and keep it updated."
 *
 * So the expensive half — actually running deep research — stays OUTSIDE the
 * app, on his own subscriptions, across several engines deliberately. The app
 * does the cheap half: hold every source, synthesize one master, and refresh
 * that master quarterly as new reads arrive.
 *
 * Three rules the synthesis must never break, all inherited from the reports
 * this feeds (see THE_LINE_POLICY.md and the PRIMARY/INSTITUTIONAL/DERIVED
 * discipline in the Quiet Repricing):
 *   1. Zero fabrication. A figure that appears in no source does not appear.
 *   2. Attribution survives. A number keeps the engine and the source that
 *      produced it — never blended into an anonymous consensus.
 *   3. Disagreement is reported, not averaged. Two engines with different
 *      numbers is a finding, not a defect to smooth over.
 */
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';

const MODEL = process.env.RESEARCH_SYNTHESIS_MODEL || 'claude-sonnet-4-6';
const MAX_OUTPUT = 32000;

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 900_000, maxRetries: 2 });
  return client;
}

export interface LaneRow {
  id: number; user_id: number; slug: string; label: string; notes: string | null;
  master_md: string | null; master_title: string | null; master_version: number;
  synthesized_at: string | null; synthesis_status: string; synthesis_error: string | null;
  archived: boolean; created_at: string;
}
export interface SourceRow {
  id: number; lane_id: number; label: string; tool: string | null; mime: string;
  bytes: number | null; gathered_on: string | null; incorporated_version: number | null;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'lane';

/* ── lanes ────────────────────────────────────────────────────────────── */

export async function createLane(userId: number, label: string, notes?: string): Promise<LaneRow> {
  const slug = slugify(label);
  const [row] = await sql<LaneRow[]>`
    INSERT INTO research_lanes (user_id, slug, label, notes)
    VALUES (${userId}, ${slug}, ${label}, ${notes || null})
    ON CONFLICT (user_id, slug) DO UPDATE SET label = EXCLUDED.label, updated_at = NOW()
    RETURNING *`;
  return row;
}

export async function listLanes(userId: number, includeArchived = false): Promise<LaneRow[]> {
  return sql<LaneRow[]>`
    SELECT id, user_id, slug, label, notes, master_title, master_version,
           synthesized_at, synthesis_status, synthesis_error, archived, created_at,
           (master_md IS NOT NULL) AS has_master
    FROM research_lanes
    WHERE user_id = ${userId} ${includeArchived ? sql`` : sql`AND archived = FALSE`}
    ORDER BY updated_at DESC`;
}

export async function getLane(userId: number, id: number): Promise<LaneRow | null> {
  const [row] = await sql<LaneRow[]>`
    SELECT * FROM research_lanes WHERE id = ${id} AND user_id = ${userId}`;
  return row || null;
}

/* ── sources ──────────────────────────────────────────────────────────── */

export async function addSource(input: {
  laneId: number; label: string; tool?: string; mime: string;
  data?: Buffer; text?: string; gatheredOn?: string;
}): Promise<number> {
  const bytes = input.data ? input.data.length : Buffer.byteLength(input.text || '', 'utf8');
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO research_sources (lane_id, label, tool, mime, data, text_content, bytes, gathered_on)
    VALUES (${input.laneId}, ${input.label}, ${input.tool || null}, ${input.mime},
            ${input.data ?? null}, ${input.text ?? null}, ${bytes}, ${input.gatheredOn || null})
    RETURNING id`;
  return row.id;
}

export async function listSources(laneId: number): Promise<SourceRow[]> {
  return sql<SourceRow[]>`
    SELECT id, lane_id, label, tool, mime, bytes, gathered_on, incorporated_version, created_at
    FROM research_sources WHERE lane_id = ${laneId} ORDER BY created_at DESC`;
}

export async function deleteSource(laneId: number, id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM research_sources WHERE id = ${id} AND lane_id = ${laneId} RETURNING id`;
  return rows.length > 0;
}

/* ── citation & derivation audit ─────────────────────────────────────────
 * Paul, 2026-07-24: "It needs to work correctly in all cases — we cannot lose
 * citation, and if we infer a value, we need to be able to explain our
 * inferred value."
 *
 * An earlier version matched derivation language by PROXIMITY (was the word
 * "assumes" near the number?). That is a guess, not a check: it legitimised a
 * figure merely for sitting next to unrelated prose. Replaced with an exact
 * contract the synthesis must satisfy and this code can verify:
 *
 *   ## Sources      — every uploaded document acknowledged by name
 *   ## Derivations  — every inferred figure listed with its working
 *
 * Then the checks are exact set membership, not regex vibes:
 *   sourcesMissing — an uploaded document the master never acknowledges
 *   urlsDropped    — a link in the research that vanished
 *   unexplained    — a figure in NO source and NOT in the derivation register.
 *                    That is the violation: an inferred value we cannot explain.
 */
export interface CitationAudit {
  ok: boolean;
  /* citations */
  hasSourceRegister: boolean;
  sourcesMissing: string[];
  sourceUrls: number; masterUrls: number; urlsDropped: string[];
  /* figures */
  masterFigures: number;
  citedCount: number;
  hasDerivationRegister: boolean;
  derivedRegistered: string[];
  unexplained: string[];
  unexplainedCount: number;
  note: string;
}

const URL_RE = /https?:\/\/[^\s)<>\]"']+/gi;
/** Money, percentages, multiples and magnitudes — the figures that carry a claim. */
const FIG_RE = /\$?\d[\d,]*\.?\d*\s?(?:billion|million|trillion|bn|mm?|k|%|x)\b|\$\d[\d,]*\.?\d*/gi;

/**
 * Expand ranges so a shared unit attaches to BOTH endpoints.
 *
 * Paul, 2026-07-24, on conflicting sources: "one source says it's 700 million,
 * the other says 600 million… we could say between 600 and 700 million and
 * cite both." Written naturally that is "between $600 and $700 million", where
 * $600 carries no unit of its own — so a naive extractor reads "$600", fails to
 * match the source's "$600 million", and flags honest work as an unexplained
 * inference. Normalising first makes both endpoints checkable.
 */
const expandRanges = (t: string) => t.replace(
  /(\$?\d[\d,]*\.?\d*)\s*(?:–|—|-|\bto\b|\band\b)\s*(\$?\d[\d,]*\.?\d*)(\s?)(billion|million|trillion|bn|mm?|k)\b/gi,
  (_m, a, b, sp, unit) => `${a}${sp || ' '}${unit} to ${b}${sp || ' '}${unit}`);

const normUrl = (u: string) => u.replace(/[.,;]+$/, '').replace(/\/$/, '').toLowerCase();
const normFig = (f: string) => f.toLowerCase().replace(/,/g, '').replace(/\s+/g, '')
  .replace(/billion/, 'b').replace(/million/, 'm').replace(/trillion/, 't').replace(/bn/, 'b');

/** Pull a markdown section by heading pattern, up to the next heading. */
function section(md: string, pattern: RegExp): string | null {
  const lines = md.split('\n');
  let i = lines.findIndex(l => /^#{1,4}\s/.test(l) && pattern.test(l));
  if (i < 0) return null;
  const level = (lines[i].match(/^#+/) || ['#'])[0].length;
  const out: string[] = [];
  for (let j = i + 1; j < lines.length; j++) {
    const m = lines[j].match(/^#+/);
    if (m && m[0].length <= level) break;
    out.push(lines[j]);
  }
  return out.join('\n');
}

/** Distinctive words from a source label, for checking it is acknowledged. */
const labelTokens = (label: string) =>
  label.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3 &&
    !['research', 'report', 'final', 'draft', 'deep', 'analysis', 'market', 'from', 'with', 'this', 'that'].includes(w));

export function auditCitations(
  masterMdIn: string,
  sourceTexts: string[],
  sourceLabels: string[] = [],
): CitationAudit {
  let masterMd = masterMdIn;
  const haystack = expandRanges(sourceTexts.join('\n'));
  masterMd = expandRanges(masterMd);

  /* citations ------------------------------------------------------------ */
  const srcUrls = new Set([...haystack.matchAll(URL_RE)].map(m => normUrl(m[0])));
  const mstUrls = new Set([...masterMd.matchAll(URL_RE)].map(m => normUrl(m[0])));
  const urlsDropped = [...srcUrls].filter(u => !mstUrls.has(u));

  const sourcesSection = section(masterMd, /sources|references|method/i);
  const hasSourceRegister = sourcesSection !== null;

  // A source counts as acknowledged only if it is named IN THE SOURCES
  // REGISTER — not merely because its topic words show up in the body. An
  // earlier version searched the whole document, so a label like "…commercial
  // mechanical" matched the title and a genuinely dropped source passed.
  const registerText = (sourcesSection || '').toLowerCase();
  const sourcesMissing = sourceLabels.filter(label => {
    const toks = labelTokens(label);
    if (!toks.length) return false;              // nothing distinctive to match on
    if (!hasSourceRegister) return true;         // no register at all → all missing
    return !toks.some(t => registerText.includes(t));
  });

  /* figures -------------------------------------------------------------- */
  const srcFigs = new Set([...haystack.matchAll(FIG_RE)].map(m => normFig(m[0])));

  const derivSection = section(masterMd, /derivation|derived figure|assumption/i);
  const hasDerivationRegister = derivSection !== null;
  const registered = new Set(
    derivSection ? [...derivSection.matchAll(FIG_RE)].map(m => normFig(m[0])) : []);

  const bodyMd = derivSection ? masterMd.replace(derivSection, '') : masterMd;
  const seen = new Set<string>();
  const derivedRegistered: string[] = [];
  const unexplained: string[] = [];
  let cited = 0;

  for (const m of bodyMd.matchAll(FIG_RE)) {
    const key = normFig(m[0]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (srcFigs.has(key)) { cited++; continue; }      // stated in a source
    if (registered.has(key)) { derivedRegistered.push(key); continue; }  // explained
    unexplained.push(key);                            // inferred, unexplained
  }

  const ok = unexplained.length === 0 && sourcesMissing.length === 0 && urlsDropped.length === 0;
  const note = ok
    ? `Clean: ${cited} cited, ${derivedRegistered.length} derived with stated working, every source acknowledged.`
    : [
        unexplained.length ? `${unexplained.length} figure(s) appear in no source and are not explained in a Derivations section — an inferred value must state its working: ${unexplained.slice(0, 6).join(', ')}.` : '',
        !hasDerivationRegister && unexplained.length ? 'The master has NO Derivations section at all.' : '',
        sourcesMissing.length ? `${sourcesMissing.length} uploaded document(s) are never acknowledged: ${sourcesMissing.slice(0, 4).join('; ')}.` : '',
        urlsDropped.length ? `${urlsDropped.length} source URL(s) did not carry through.` : '',
        !hasSourceRegister ? 'No Sources section.' : '',
      ].filter(Boolean).join(' ');

  return {
    ok,
    hasSourceRegister, sourcesMissing,
    sourceUrls: srcUrls.size, masterUrls: mstUrls.size, urlsDropped: urlsDropped.slice(0, 40),
    masterFigures: seen.size, citedCount: cited,
    hasDerivationRegister,
    derivedRegistered: derivedRegistered.slice(0, 40),
    unexplained: unexplained.slice(0, 40),
    unexplainedCount: unexplained.length,
    note,
  };
}

/* ── synthesis ────────────────────────────────────────────────────────── */

function systemPrompt(): string {
  return [
    'You are the research editor for smbX.ai, a buy-side corporate development practice run by Paul Baker.',
    '',
    'Paul runs deep research OUTSIDE this app — across Claude, Gemini and other engines deliberately, so he gets a variety of reads rather than one model\'s view. Your job is to fold those reads into ONE master document he can build client-facing work from.',
    '',
    'THREE RULES, in order of importance:',
    '1. ZERO FABRICATION. Every figure, claim, company name and date must appear in a supplied source. If something is not in the sources, it does not go in the document. Never fill a gap from your own knowledge — say the gap exists.',
    '2. ATTRIBUTION SURVIVES — THIS IS THE POINT OF THE EXERCISE. Paul is combining reads from several engines precisely so nothing is taken on one model\'s word. Losing a citation destroys that.',
    '   • Every material figure carries its UNDERLYING source inline — the 10-K, the Census series, the named analyst, the dated filing — not merely which engine reported it. "Comfort Systems FY2025 10-K" is a citation; "per the research" is not.',
    '   • Carry URLs through verbatim when a source supplies one. Never invent, shorten, or reconstruct a URL.',
    '   • Where the engines differ in what they cite for the same fact, keep BOTH citations.',
    '   • Note which engine surfaced a figure only where it matters (e.g. only one engine found it). The underlying source always matters; the engine usually does not.',
    '   • A claim you cannot attribute to a specific source does not belong in the document. Drop it, or state plainly that it is unattributed and why it is still worth carrying.',
    '   • Close with a SOURCES register listing every document drawn on and, beneath each, the underlying sources it contributed. This is what makes the document defensible when a PE partner interrogates a number.',
    '3. DISAGREEMENT IS A FINDING — AND YOU MAY NOT CHANGE EITHER NUMBER. When two sources report different values for the same thing, both values stand exactly as reported. Say so plainly: "Source A reports $700 million; Source B reports $600 million; we cannot say which is right."',
    '   • NEVER average them into a single figure. NEVER quietly adopt one and drop the other. NEVER round them toward each other.',
    '   • You MAY state the spread as a range — "between $600 and $700 million" — provided BOTH endpoints are the reported values, unaltered, and BOTH sources are cited at that point.',
    '   • A range built this way is not a derivation and needs no Derivations entry: its endpoints are cited figures. But a MIDPOINT, a weighted blend, or any number between the endpoints IS a derivation — label it and show the working.',
    '   • Where one source is better-grounded (a filing beats an estimate), say which and why — but still report both numbers.',
    '',
    'LABELLING: mark every material figure PRIMARY (government data or SEC filings), INSTITUTIONAL (a named forecaster or transaction database with published methodology), or DERIVED. A figure that fits none of those is not strong enough to state as fact.',
    '',
    'DERIVED FIGURES — STATE THE ASSUMPTION, ALWAYS. Any number you arrive at by calculation, synthesis, triangulation or judgement — anything not stated outright in a source — must be labelled DERIVED inline AND listed in the Derivations section (below) with its working:',
    '   • the inputs it came from, with their own citations;',
    '   • the arithmetic or method, in the open ("$207.9B × 1.65 ≈ $343B");',
    '   • the assumption it rests on, named as an assumption ("assumes a 50% nonresidential share");',
    '   • a sensitivity or range where the assumption materially moves the answer.',
    '   A calculated figure presented as though it were sourced is the single worst failure this document can contain — it is indistinguishable from a fabrication to anyone checking your work, and it is exactly what a partner will test first. If you cannot show the working, do not state the number.',
    '',
    'TWO REGISTERS ARE MANDATORY, both as top-level sections at the end. They are checked mechanically after you finish, and a missing entry is reported as a defect:',
    '',
    '## Sources',
    '   Every uploaded document by its given name, and beneath each, the underlying sources it contributed (filings, government series, named analysts) with URLs where supplied. Every document handed to you must appear here, including any whose contribution you judged weak — say so rather than omitting it.',
    '',
    '## Derivations',
    '   One line per figure you inferred rather than took from a source. Begin each line with the figure exactly as it appears in the body, then the working. For example:',
    '   - **~$180B** — DERIVED. $355B total (Census NAICS 238220, grown to 2026) × 50% nonresidential share. The share is an assumption, not a measurement; at 45%/55% the answer moves to $160B/$195B.',
    '   EVERY figure in the body that is not stated in a source must have a line here. If a figure is in neither a source nor this register, it will be flagged as an inferred value you cannot explain — the exact failure this document exists to prevent.',
    '',
    'PRACTICE LINE: buy-side only. No fee, pricing, or compensation content. Never state a valuation of a specific named target. Present analysis, options and implications — never advice to a client.',
    '',
    'STRUCTURE: open with a short section stating what changed and what is uncertain, then the substantive body organised by theme, then a sources-and-method close listing every document you drew on and the labelling scheme. Write in Paul\'s register: plain, direct, numerate, no hedging filler. Markdown only — no preamble, no commentary about your own process.',
  ].join('\n');
}

function updateInstruction(currentVersion: number): string {
  return currentVersion === 0
    ? 'This is the FIRST master for this lane. Build it from the supplied sources.'
    : [
        `You are UPDATING an existing master (version ${currentVersion}), which appears first below.`,
        'Carry forward everything still true — do not rewrite for the sake of rewriting, and do not drop a well-sourced fact just because the new research does not repeat it.',
        'Where new research supersedes an old figure, replace it and note the change with both vintages.',
        'Where new research contradicts the master, surface the conflict rather than quietly overwriting.',
        'Where the master carries something the new research shows is now stale, mark it stale rather than deleting it silently.',
        'Open the document with a "What changed in this revision" section — specific, not a summary of the whole document.',
      ].join(' ');
}

/**
 * Fold every un-incorporated source into the lane's master.
 *
 * Sources are passed as native document blocks (PDFs) or text, so the model
 * reads them directly rather than through a lossy extraction step. Runs
 * in-process and updates `synthesis_status` so the UI can poll.
 */
export async function synthesizeLane(userId: number, laneId: number, opts: { full?: boolean } = {}): Promise<{ version: number; usage: any; audit: CitationAudit }> {
  const lane = await getLane(userId, laneId);
  if (!lane) throw new Error('Lane not found');

  const pending = await sql<any[]>`
    SELECT id, label, tool, mime, data, text_content, gathered_on
    FROM research_sources
    WHERE lane_id = ${laneId} ${opts.full ? sql`` : sql`AND incorporated_version IS NULL`}
    ORDER BY created_at ASC`;
  if (!pending.length) throw new Error(opts.full ? 'This lane has no sources yet.' : 'No new research to fold in — upload a document first.');

  await sql`UPDATE research_lanes SET synthesis_status = 'running', synthesis_error = NULL, updated_at = NOW() WHERE id = ${laneId}`;

  try {
    const content: any[] = [];
    const useMaster = !opts.full && lane.master_md && lane.master_version > 0;
    if (useMaster) {
      content.push({ type: 'text', text: `CURRENT MASTER (version ${lane.master_version}, synthesized ${lane.synthesized_at || 'unknown'}):\n\n${lane.master_md}` });
    }
    for (const s of pending) {
      const when = s.gathered_on ? ` · research run ${s.gathered_on}` : '';
      const head = `SOURCE: ${s.label}${s.tool ? ` · produced by ${s.tool}` : ''}${when}`;
      if (s.mime === 'application/pdf' && s.data) {
        content.push({ type: 'text', text: head });
        content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: Buffer.from(s.data).toString('base64') } });
      } else if (s.text_content) {
        content.push({ type: 'text', text: `${head}\n\n${s.text_content}` });
      }
    }
    content.push({ type: 'text', text: [
      updateInstruction(useMaster ? lane.master_version : 0),
      lane.notes ? `\n\nStanding guidance for this lane: ${lane.notes}` : '',
      `\n\nLane: ${lane.label}.`,
      '\n\nReturn the complete master document as markdown. Begin with a single `# ` title line.',
    ].join('') });

    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT,
      system: systemPrompt(),
      messages: [{ role: 'user', content }],
    });

    const md = res.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
    if (!md) throw new Error('The synthesis returned nothing.');
    const title = (md.match(/^#\s+(.+)$/m)?.[1] || lane.label).trim();
    const version = lane.master_version + 1;
    const usage = {
      inputTokens: res.usage.input_tokens,
      outputTokens: res.usage.output_tokens,
      costCents: Math.ceil((res.usage.input_tokens * 300 + res.usage.output_tokens * 1500) / 1_000_000),
    };

    // Mechanical citation audit — verify attribution survived rather than
    // trusting the prompt (Paul: "we don't want to lose attribution").
    const sourceTexts = pending.map((p: any) =>
      p.text_content || '').filter(Boolean) as string[];
    if (useMaster && lane.master_md) sourceTexts.push(lane.master_md);
    const audit = auditCitations(md, sourceTexts, pending.map((p: any) => p.label));
    if (audit.urlsDropped.length) {
      console.warn(`[lanes] lane ${laneId} v${version}: ${audit.urlsDropped.length} source URL(s) did not carry through`);
    }

    const changeNote = md.match(/##\s*What changed[^\n]*\n+([\s\S]{0,600}?)(?=\n##|\n#|$)/i)?.[1]?.trim() || null;

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO research_master_versions (lane_id, version, title, master_md, source_ids, change_note, usage, audit)
        VALUES (${laneId}, ${version}, ${title}, ${md},
                ${pending.map((p: any) => p.id)}, ${changeNote}, ${JSON.stringify(usage)}::jsonb, ${JSON.stringify(audit)}::jsonb)`;
      await tx`
        UPDATE research_lanes
        SET master_md = ${md}, master_title = ${title}, master_version = ${version},
            synthesized_at = NOW(), synthesis_status = 'idle', updated_at = NOW()
        WHERE id = ${laneId}`;
      await tx`
        UPDATE research_sources SET incorporated_version = ${version}
        WHERE lane_id = ${laneId} AND id = ANY(${pending.map((p: any) => p.id)})`;
    });

    return { version, usage, audit };
  } catch (err: any) {
    await sql`UPDATE research_lanes SET synthesis_status = 'failed', synthesis_error = ${String(err?.message || err).slice(0, 500)}, updated_at = NOW() WHERE id = ${laneId}`;
    throw err;
  }
}

export async function listVersions(laneId: number) {
  return sql`
    SELECT id, version, title, change_note, source_ids, usage, created_at
    FROM research_master_versions WHERE lane_id = ${laneId} ORDER BY version DESC`;
}

export async function getVersion(laneId: number, version: number) {
  const [row] = await sql`
    SELECT * FROM research_master_versions WHERE lane_id = ${laneId} AND version = ${version}`;
  return row || null;
}
