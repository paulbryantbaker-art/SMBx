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

/* ── synthesis ────────────────────────────────────────────────────────── */

function systemPrompt(): string {
  return [
    'You are the research editor for smbX.ai, a buy-side corporate development practice run by Paul Baker.',
    '',
    'Paul runs deep research OUTSIDE this app — across Claude, Gemini and other engines deliberately, so he gets a variety of reads rather than one model\'s view. Your job is to fold those reads into ONE master document he can build client-facing work from.',
    '',
    'THREE RULES, in order of importance:',
    '1. ZERO FABRICATION. Every figure, claim, company name and date must appear in a supplied source. If something is not in the sources, it does not go in the document. Never fill a gap from your own knowledge — say the gap exists.',
    '2. ATTRIBUTION SURVIVES. Each material figure keeps its origin: the underlying source (a 10-K, a Census series, a named analyst) and, where it matters, which engine surfaced it. Never blend numbers into an anonymous consensus.',
    '3. DISAGREEMENT IS A FINDING. When two sources give different numbers for the same thing, present BOTH with attribution and say plainly that they disagree. Never average them, never silently pick one. Note which is better-sourced and why.',
    '',
    'LABELLING: mark every material figure PRIMARY (government data or SEC filings), INSTITUTIONAL (a named forecaster or transaction database with published methodology), or DERIVED (calculated here — show the arithmetic). A figure that fits none of those is not strong enough to state as fact.',
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
export async function synthesizeLane(userId: number, laneId: number, opts: { full?: boolean } = {}): Promise<{ version: number; usage: any }> {
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

    const changeNote = md.match(/##\s*What changed[^\n]*\n+([\s\S]{0,600}?)(?=\n##|\n#|$)/i)?.[1]?.trim() || null;

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO research_master_versions (lane_id, version, title, master_md, source_ids, change_note, usage)
        VALUES (${laneId}, ${version}, ${title}, ${md},
                ${pending.map((p: any) => p.id)}, ${changeNote}, ${JSON.stringify(usage)}::jsonb)`;
      await tx`
        UPDATE research_lanes
        SET master_md = ${md}, master_title = ${title}, master_version = ${version},
            synthesized_at = NOW(), synthesis_status = 'idle', updated_at = NOW()
        WHERE id = ${laneId}`;
      await tx`
        UPDATE research_sources SET incorporated_version = ${version}
        WHERE lane_id = ${laneId} AND id = ANY(${pending.map((p: any) => p.id)})`;
    });

    return { version, usage };
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
