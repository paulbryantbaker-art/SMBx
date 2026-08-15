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
import { assertSpendAllowed } from './apiSpend.js';

const MODEL = process.env.RESEARCH_SYNTHESIS_MODEL || 'claude-sonnet-4-6';
const MAX_OUTPUT = 32000;

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  // Master synthesis sends every source's FULL TEXT, plus a retry on audit
  // failure — one of the two paths CLAUDE.md names as able to spend real money
  // per press. It runs in a Cowork session now; the guard is here rather than
  // only at synthesizeLane so no later call site can slip past it.
  assertSpendAllowed('research', 'Master synthesis');
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
/* The citation audit is PURE and lives in house/audit.ts, so a local Claude
   Code session runs the identical check without a database. Re-exported here
   because callers (and the test suite) have always imported it from this
   module. */
export { auditCitations, figuresNotIn } from '../../house/audit.js';
export type { CitationAudit } from '../../house/audit.js';
import { auditCitations, figuresNotIn } from '../../house/audit.js';
import type { CitationAudit } from '../../house/audit.js';

/** Turn audit violations into a specific correction instruction for the retry. */
function auditCorrections(a: CitationAudit): string {
  const lines = ['Your draft failed the mechanical audit that runs on every master. Fix ONLY the issues listed, change nothing else, and return the COMPLETE corrected document.', ''];
  if (a.unexplained.length) {
    lines.push(`These figures appear in NO source and have no Derivations entry: ${a.unexplained.join(', ')}.`);
    lines.push('For each one: cite the source it came from if it exists, OR add a Derivations line starting with the figure exactly as written in the body and showing inputs, arithmetic and the assumption, OR remove the claim. Do not simply delete the Derivations requirement.');
    lines.push('');
  }
  if (!a.hasDerivationRegister) {
    lines.push('The document has no "## Derivations" section. Add one, listing every figure you inferred rather than took from a source.');
    lines.push('');
  }
  if (a.sourcesMissing.length) {
    lines.push(`These uploaded documents are never named in your "## Sources" register: ${a.sourcesMissing.join('; ')}. Add each one, with the underlying sources it contributed. If a document contributed little, say so rather than omitting it.`);
    lines.push('');
  }
  if (!a.hasSourceRegister) {
    lines.push('The document has no "## Sources" section. Add one naming every uploaded document.');
    lines.push('');
  }
  if (a.urlsDropped.length) {
    lines.push(`These URLs appear in the research but not in your document: ${a.urlsDropped.slice(0, 12).join(', ')}. Carry them through verbatim on the claims they support, or in the Sources register.`);
    lines.push('');
  }
  lines.push('Reminder: reported values are never altered, averaged, or rounded toward each other. A range is fine when both endpoints are reported values and both sources are cited.');
  return lines.join('\n');
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
/** How long a 'running' lane can sit before we treat the lock as abandoned. */
const STALE_RUN_MINUTES = 30;

/**
 * Say what actually went wrong, in a sentence.
 *
 * The raw SDK error is a JSON blob with a request_id in it — accurate and
 * useless on screen. The failure that matters most is the org's API spend
 * ceiling, because the fix is a Console setting rather than anything in the
 * app, and because the work can be done in Cowork and imported meanwhile.
 */
function explainFailure(err: any): string {
  const raw = String(err?.message || err || '');
  const until = /regain access on ([0-9-]+)/i.exec(raw)?.[1];
  if (/usage limits?|credit balance|quota/i.test(raw)) {
    return `The app's Anthropic API key has hit its usage limit${until ? `, resetting ${until}` : ''}. Raise the limit in the Anthropic Console (Settings → Limits), or synthesize this market in Cowork on your subscription and use “Import a master” here.`;
  }
  if (/rate.?limit|429/i.test(raw)) {
    return 'The API rate-limited this request. Wait a minute and synthesize again — nothing was lost.';
  }
  if (/timed out|ETIMEDOUT|ECONNRESET|socket hang up/i.test(raw)) {
    return 'The connection dropped mid-synthesis. Try again — sources already uploaded are still here.';
  }
  return raw.slice(0, 500);
}

export async function synthesizeLane(userId: number, laneId: number, opts: { full?: boolean } = {}): Promise<{ version: number; usage: any; audit: CitationAudit }> {
  // BEFORE the lock. anthropic() below would refuse anyway, but only after
  // this function has already stamped synthesis_status='running' — wedging
  // the lane for the full 30-minute stale-lock window over work that never
  // started. Refusing at the door leaves the lane exactly as it was.
  assertSpendAllowed('research', 'Master synthesis');
  const lane = await getLane(userId, laneId);
  if (!lane) throw new Error('Lane not found');

  // Synthesis is a long in-process pass, so a deploy or an OOM mid-run leaves
  // the row stuck at 'running' with nothing left to finish it — and no way for
  // Paul to start another. Refuse while a run is plausibly alive; take the lock
  // over once it clearly isn't.
  if (lane.synthesis_status === 'running') {
    const [{ stale }] = await sql<{ stale: boolean }[]>`
      SELECT (updated_at < NOW() - ${`${STALE_RUN_MINUTES} minutes`}::interval) AS stale
      FROM research_lanes WHERE id = ${laneId}`;
    if (!stale) throw new Error('A synthesis is already running on this lane — give it a few minutes.');
    console.warn(`[lanes] lane ${laneId} had a stale 'running' lock; taking it over.`);
  }

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

    const sourceTexts = pending.map((p: any) => p.text_content || '').filter(Boolean) as string[];
    if (useMaster && lane.master_md) sourceTexts.push(lane.master_md);
    const labels = pending.map((p: any) => p.label);

    const call = async (msgs: any[]) => {
      const res = await anthropic().messages.create({
        model: MODEL, max_tokens: MAX_OUTPUT, system: systemPrompt(), messages: msgs,
      });
      return {
        md: res.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim(),
        inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens,
      };
    };

    // Pass 1.
    let out = await call([{ role: 'user', content }]);
    if (!out.md) throw new Error('The synthesis returned nothing.');
    let audit = auditCitations(out.md, sourceTexts, labels);
    let inTok = out.inputTokens, outTok = out.outputTokens, attempts = 1;

    // Pass 2 — ONE retry, with the specific violations fed back. Paul,
    // 2026-07-24: a master that loses a citation or states an unexplained
    // inference should not be accepted quietly. In practice the model fixes
    // its own gaps readily once told exactly which figures lack working.
    if (!audit.ok) {
      console.warn(`[lanes] lane ${laneId}: draft failed the audit — retrying. ${audit.note}`);
      const fix = auditCorrections(audit);
      const retry = await call([
        { role: 'user', content },
        { role: 'assistant', content: out.md },
        { role: 'user', content: fix },
      ]);
      attempts = 2;
      inTok += retry.inputTokens; outTok += retry.outputTokens;
      if (retry.md) {
        const audit2 = auditCitations(retry.md, sourceTexts, labels);
        // Keep the retry when it is genuinely better, not merely different.
        if (audit2.ok || audit2.unexplainedCount + audit2.sourcesMissing.length + audit2.urlsDropped.length
                       < audit.unexplainedCount + audit.sourcesMissing.length + audit.urlsDropped.length) {
          out = retry; audit = audit2;
        }
      }
    }

    const md = out.md;
    const title = (md.match(/^#\s+(.+)$/m)?.[1] || lane.label).trim();
    const version = lane.master_version + 1;
    const usage = {
      inputTokens: inTok, outputTokens: outTok, attempts,
      costCents: Math.ceil((inTok * 300 + outTok * 1500) / 1_000_000),
    };

    const changeNote = md.match(/##\s*What changed[^\n]*\n+([\s\S]{0,600}?)(?=\n##|\n#|$)/i)?.[1]?.trim() || null;
    // A master that still fails after the retry is SAVED (never lose the work)
    // but the lane is parked in needs_review so nothing bad becomes canonical
    // silently. The audit rides on the version row either way.
    const status = audit.ok ? 'idle' : 'needs_review';

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO research_master_versions (lane_id, version, title, master_md, source_ids, change_note, usage, audit)
        VALUES (${laneId}, ${version}, ${title}, ${md},
                ${pending.map((p: any) => p.id)}, ${changeNote}, ${JSON.stringify(usage)}::jsonb, ${JSON.stringify(audit)}::jsonb)`;
      await tx`
        UPDATE research_lanes
        SET master_md = ${md}, master_title = ${title}, master_version = ${version},
            synthesized_at = NOW(), synthesis_status = ${status},
            synthesis_error = ${audit.ok ? null : audit.note.slice(0, 500)}, updated_at = NOW()
        WHERE id = ${laneId}`;
      await tx`
        UPDATE research_sources SET incorporated_version = ${version}
        WHERE lane_id = ${laneId} AND id = ANY(${pending.map((p: any) => p.id)})`;
    });

    if (!audit.ok) console.warn(`[lanes] lane ${laneId} v${version} saved as needs_review: ${audit.note}`);
    return { version, usage, audit };
  } catch (err: any) {
    await sql`UPDATE research_lanes SET synthesis_status = 'failed', synthesis_error = ${explainFailure(err)}, updated_at = NOW() WHERE id = ${laneId}`;
    throw err;
  }
}

/**
 * Import a master synthesized OUTSIDE the app (Paul, 2026-07-26, blocked by
 * the org's API spend ceiling mid-synthesis).
 *
 * The operating model already says the expensive model work can run in Cowork
 * on his subscription while the app stores and renders. Until this, the app
 * could only accept a master it had produced itself — so an API ceiling made
 * the whole market workspace unusable, even though he can do the synthesis in
 * a Cowork session for free.
 *
 * The citation guarantee is NOT relaxed for imports. The audit runs here
 * exactly as it does after synthesis, against the sources already uploaded to
 * the lane, and a failing import is saved but parked `needs_review`. Costs
 * nothing — the audit is mechanical, not a model call — and keeps "every
 * figure in this master is traceable" true regardless of where it was written.
 */
export async function importMaster(userId: number, laneId: number, md: string, note?: string): Promise<{ version: number; audit: CitationAudit }> {
  const lane = await getLane(userId, laneId);
  if (!lane) throw new Error('Lane not found');
  if (!md || md.trim().length < 400) throw new Error('That does not look like a master document — paste the full synthesized text.');

  const rows = await sql<any[]>`
    SELECT id, label, tool, mime, text_content FROM research_sources
    WHERE lane_id = ${laneId} ORDER BY created_at ASC`;
  // PDFs have no extractable text on this side (the model reads them as
  // document blocks during synthesis), so they can only be audited on the
  // labels we hold. Say so rather than implying a clean bill.
  //
  // And drop any source that IS this master. Paul's first import was a master
  // he had already uploaded to the lane as a source — auditing a document
  // against itself matches every figure and returns a clean bill that means
  // nothing. Identity only: a near-match is a judgement call this shouldn't make.
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  const self = norm(md);
  const textSources = rows.filter((r: any) => r.text_content && norm(String(r.text_content)) !== self);
  const pdfOnly = rows.filter((r: any) => !r.text_content).length;

  // NOT AUDITED is a third state, and collapsing it into "failed" would be a
  // lie in the more dangerous direction: running auditCitations with no source
  // text flags EVERY figure as unexplained, which reads as "this master is
  // full of invented numbers" when the truth is that nothing was checked.
  const notAudited = textSources.length === 0;
  const audit: CitationAudit = notAudited
    ? {
        ok: false,
        hasSourceRegister: false, sourcesMissing: [],
        sourceUrls: 0, masterUrls: 0, urlsDropped: [],
        masterFigures: 0, citedCount: 0,
        hasDerivationRegister: false, derivedRegistered: [],
        unexplained: [], unexplainedCount: 0,
        note: `NOT AUDITED — this market holds no machine-readable source text to check the figures against${pdfOnly ? ` (${pdfOnly} PDF source(s) are readable only by the synthesis model, not by this check)` : ''}. The document is saved and usable; its figures simply carry no mechanical verification. Paste the underlying research as text sources to have them checked.`,
      }
    : auditCitations(
        md,
        textSources.map((r: any) => String(r.text_content)),
        textSources.map((r: any) => String(r.label)),
      );

  const title = (md.match(/^#\s+(.+)$/m)?.[1] || lane.label).trim().slice(0, 160);
  const version = lane.master_version + 1;
  const status = audit.ok ? 'idle' : 'needs_review';
  const caveat = !notAudited && pdfOnly > 0
    ? ` ${pdfOnly} PDF source(s) could not be text-audited here — their figures were not checked.`
    : '';

  await sql.begin(async (tx: any) => {
    await tx`
      INSERT INTO research_master_versions (lane_id, version, title, master_md, source_ids, change_note, usage, audit)
      VALUES (${laneId}, ${version}, ${title}, ${md}, ${rows.map((r: any) => r.id)},
              ${note || 'Imported — synthesized outside the app'},
              ${JSON.stringify({ imported: true })}::jsonb, ${JSON.stringify(audit)}::jsonb)`;
    await tx`
      UPDATE research_lanes
      SET master_md = ${md}, master_title = ${title}, master_version = ${version},
          synthesized_at = NOW(), synthesis_status = ${status},
          synthesis_error = ${audit.ok ? (caveat.trim() || null) : (audit.note + caveat).slice(0, 500)}, updated_at = NOW()
      WHERE id = ${laneId}`;
    await tx`
      UPDATE research_sources SET incorporated_version = ${version}
      WHERE lane_id = ${laneId} AND incorporated_version IS NULL`;
  });
  return { version, audit };
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
