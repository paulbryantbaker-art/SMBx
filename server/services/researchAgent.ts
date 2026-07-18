/**
 * Internal Research Agent — deep, cited web research for the practice's own
 * marketing and deal prep (Paul's INTERNAL RESEARCH AGENT spec, 2026-07-15).
 * Internal-only: the routes sit behind the blanket /api requireAuth and the
 * practice-mode perimeter. Paul controls topic, type, depth, cadence, and
 * output format (letter PDF report / 1080×1350 LinkedIn card / both) from the
 * Studio screen — Studio doubles as his LinkedIn campaign manager.
 *
 * Architecture (lean — the spec assumed LangGraph, which this repo doesn't
 * carry): ONE agentic Claude call armed with the server-side web_search +
 * web_fetch tools (the API executes searches/fetches on its side, pausing
 * long turns with stop_reason='pause_turn'; we resume until end_turn), then
 * ONE finalize call that titles the report and extracts the structured
 * STUDIO FEED. No client-side search loop to babysit.
 *
 * Cost discipline: per-run search/fetch caps come from the depth tier via
 * max_uses; every run's spend is computed in CENTS (rule 10) and summed
 * against RESEARCH_MONTHLY_CAP_CENTS (default $150/mo). At the cap, new runs
 * refuse to start. Scheduled runs email on completion (Resend, console
 * fallback) with an 80%-of-cap warning when crossed.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import { sql } from '../db.js';
import { sendEmail, brandedEmail } from './emailService.js';

const MODEL = 'claude-sonnet-4-6';
// Sonnet pricing in cents per 1M tokens + $10/1k searches (fetches bill as tokens).
const INPUT_CENTS_PER_MTOK = 300;
const OUTPUT_CENTS_PER_MTOK = 1500;
const CENTS_PER_SEARCH = 1;

const MONTHLY_CAP_CENTS = (() => {
  const v = Number(process.env.RESEARCH_MONTHLY_CAP_CENTS);
  return Number.isFinite(v) && v > 0 ? Math.round(v) : 15000;
})();

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    // Research turns run long (server-side search rounds) — generous timeout.
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000, maxRetries: 2 });
  }
  return client;
}

/* ─── Catalog: the six research types + three depth tiers ─────────────── */

export interface ResearchTypeDef {
  key: string;
  label: string;
  blurb: string; // one line for the Studio picker
  /** Type-specific report skeleton injected into the analyst brief. */
  template: string;
  killConditions: boolean;
}

export const RESEARCH_TYPES: ResearchTypeDef[] = [
  {
    key: 'vertical_scan',
    label: 'Vertical Scan',
    blurb: 'Is this industry worth hunting in? Structure, fragmentation, buyer activity.',
    template: `## Market structure & size — how the vertical is organized, credible size/growth figures
## Fragmentation & ownership — operator count, size bands, consolidation state, who owns what
## Buyer & deal activity — who is acquiring, recent transactions, multiples signals if published
## Target archetypes — what a good acquisition target looks like in this vertical
## Risks & headwinds — regulatory, labor, technology, demand`,
    killConditions: true,
  },
  {
    key: 'participant_map',
    label: 'Participant Map',
    blurb: 'Who actually operates in this space, layer by layer.',
    template: `## Ecosystem layers — the value chain from upstream to end customer
## Named participants by tier — larger platforms, mid-size independents, notable specialists (names + one-line descriptors)
## Ownership status — PE-backed vs founder-owned vs public, where known
## Recent movement — acquisitions, entries, exits in the last 24 months`,
    killConditions: false,
  },
  {
    key: 'buyer_roster',
    label: 'Buyer Roster',
    blurb: 'Named likely acquirers for a segment, with rationale.',
    template: `## Active acquirers — named buyers with recent acquisition evidence, most active first
## Rationale per buyer — why each would want targets in this segment
## Acquisition patterns — size ranges, geographies, integration style where visible
## Watch list — plausible but unproven buyers worth monitoring`,
    killConditions: true,
  },
  {
    key: 'deal_monitor',
    label: 'Deal Monitor',
    blurb: 'What happened in this lane recently — transactions and signals.',
    template: `## Transactions in the window — announced deals with buyer, seller, date, and terms where published
## Signals — leadership changes, expansions, distress markers, fundraises that precede deals
## Pattern read — what the activity says about where the lane is heading
## Implications for a buyer — how this should shape thesis or timing`,
    killConditions: false,
  },
  {
    key: 'thesis_validation',
    label: 'Thesis Validation',
    blurb: 'Pressure-test an acquisition thesis against the evidence.',
    template: `## The thesis, restated — the claim being tested, in one tight paragraph
## Supporting evidence — findings that confirm, each cited
## Contradicting evidence — findings that cut against it, each cited (do not soften these)
## Verdict — supported / partially supported / not supported, with the reasoning`,
    killConditions: true,
  },
  {
    key: 'topic_brief',
    label: 'Topic Brief',
    blurb: 'A grounded brief on any M&A-adjacent topic.',
    template: `## Findings — the substance, organized into 3–5 themed sections you choose
## Implications for buy-side work — what a lower-middle-market acquirer should do with this`,
    killConditions: false,
  },
];

export interface DepthDef {
  key: string;
  label: string;
  blurb: string;
  searches: number;
  fetches: number;
  maxTokens: number;
  words: string; // target report length guidance
}

export const DEPTHS: DepthDef[] = [
  { key: 'quick', label: 'Quick', blurb: '~2 min · 8 searches', searches: 8, fetches: 3, maxTokens: 6000, words: '800–1,200' },
  { key: 'standard', label: 'Standard', blurb: '~5 min · 20 searches', searches: 20, fetches: 12, maxTokens: 10000, words: '1,500–2,500' },
  { key: 'deep', label: 'Deep', blurb: '~10 min · 40 searches', searches: 40, fetches: 25, maxTokens: 16000, words: '2,500–4,000' },
];

// 'report' = internal letter report · 'post_pdf' = LinkedIn document-post PDF
// (swipeable pages + ready-to-paste post text) · 'post_image' = LinkedIn
// 1-pager (branded image + post text). 'card'/'both' are the legacy values —
// still valid on old rows; every artifact renders on demand from any
// completed run, so the format mostly records intent.
export const OUTPUT_FORMATS = ['report', 'post_pdf', 'post_image', 'card', 'both'] as const;
export const CADENCES = ['weekly', 'biweekly', 'monthly'] as const;

function typeDef(key: string): ResearchTypeDef {
  return RESEARCH_TYPES.find(t => t.key === key) ?? RESEARCH_TYPES[5];
}
function depthDef(key: string): DepthDef {
  return DEPTHS.find(d => d.key === key) ?? DEPTHS[1];
}

/* ─── Usage accounting ────────────────────────────────────────────────── */

export interface RunUsage {
  searches: number;
  fetches: number;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
}

function computeCostCents(u: Omit<RunUsage, 'costCents'>): number {
  const tokens = (u.inputTokens * INPUT_CENTS_PER_MTOK + u.outputTokens * OUTPUT_CENTS_PER_MTOK) / 1_000_000;
  return Math.ceil(tokens + u.searches * CENTS_PER_SEARCH);
}

export async function getMonthSpendCents(): Promise<number> {
  const [row] = await sql`
    SELECT COALESCE(SUM((usage->>'costCents')::numeric), 0) AS c
    FROM research_runs
    WHERE created_at >= date_trunc('month', NOW())
  `;
  return Math.round(Number(row?.c ?? 0));
}

export function getMonthlyCapCents(): number {
  return MONTHLY_CAP_CENTS;
}

/* ─── The analyst brief ───────────────────────────────────────────────── */

function researchSystemPrompt(type: ResearchTypeDef, depth: DepthDef): string {
  return `You are the research analyst inside smbX, a buy-side corporate development practice serving acquirers in the lower middle market (targets under $250M revenue). You produce INTERNAL research documents the practice uses to pick lanes, prep engagements, and feed its own marketing. The reader is a senior dealmaker.

DISCIPLINE — non-negotiable:
- Zero hallucination. Every quantitative claim, named transaction, and named participant must come from a source you actually found. Cite inline immediately after the claim as: [source: URL · date if known]. If you could not verify something important, say so plainly instead of guessing.
- Mark shaky numbers: append (directional) to estimates and low-confidence figures.
- Prefer primary and recent sources (trade press, filings, company sites, industry associations) over aggregator listicles. Use web_fetch on the few most load-bearing pages when the search snippet is not enough.
- Conflicting sources: report BOTH numbers with their sources in the "Conflicts & gaps" section — never silently average or pick one.
- Buy-side framing throughout. Never disparage a named firm; describe facts, not judgments about competitors. No legal, tax, or securities advice; no fee discussion; no valuation opinion on a specific private company.

METHOD:
1. Open with a 2–4 line SEARCH PLAN (angles you will run) — keep it terse.
2. Execute the plan with web_search (you have up to ${depth.searches} searches and ${depth.fetches} page fetches — spend them where they buy the most certainty).
3. Then write the report in clean markdown, ${depth.words} words.

REPORT FORMAT (markdown, in this order):
# <A specific, factual title>
## TL;DR — 3–5 bullets a partner can read in 20 seconds
${type.template}
## Conflicts & gaps — where sources disagree and what could not be verified
${type.killConditions ? '## Kill conditions — specific observable facts that would kill interest in this lane\n' : ''}
Use markdown tables where rows of comparable facts exist (participants, transactions, data points). Do not fabricate table rows to look complete — a short honest table beats a padded one.`;
}

export const POST_ANGLES = [
  { key: 'auto', label: 'Auto', blurb: 'Let the writer pick the strongest frame from the material.' },
  { key: 'teardown', label: 'Teardown', blurb: 'Buyer\u2019s-eye breakdown of a sector or deal \u2014 structure, economics, diligence traps.' },
  { key: 'contrarian', label: 'Contrarian take', blurb: 'Challenge a consensus view with evidence. Never a strawman of any firm.' },
  { key: 'how_buyers_think', label: 'How buyers think', blurb: 'Process education \u2014 what disciplined acquirers actually do and why.' },
  { key: 'practitioner_note', label: 'Practitioner note', blurb: 'First-person lived-experience frame, anonymized employers, career total 150.' },
] as const;
export type PostAngleKey = typeof POST_ANGLES[number]['key'];

const ANGLE_GUIDANCE: Record<string, string> = {
  teardown: `POST ANGLE — TEARDOWN: frame hooks, angles, the post, and docPages as a buyer's-eye teardown. Lead with what makes the lane acquisition-attractive or not (fragmentation, revenue quality, succession, regulation), name the diligence traps, and close on what a disciplined buyer does with this. Curiosity-gap hooks work: "X looks boring. The buyer math is anything but."`,
  contrarian: `POST ANGLE — CONTRARIAN TAKE: pick the consensus view the report actually undermines and lead with the challenge ("The 'Silver Tsunami' is the laziest thesis in lower-middle-market M&A" is the register). Every contrarian claim must be carried by a cited fact from the report. Challenge IDEAS and narratives, never a named firm or profession — advisors and brokers are allies.`,
  how_buyers_think: `POST ANGLE — HOW BUYERS THINK: frame the material as process education for acquirers — what a disciplined buyer checks, in what order, and why, using the report's facts as the evidence. Teach one repeatable judgment, not a listicle. Insider-POV hooks work: "Here's what a corp-dev team sees in this market."`,
  practitioner_note: `POST ANGLE — PRACTITIONER NOTE: first-person senior-operator voice — the report's facts framed through lived deal experience. HARD LAW: former employers are NEVER named — say "a global investment bank" and "a world-class PE-backed aggregator"; the career total is "150 acquisitions"; experience claims are "led or co-led", never unqualified "closed". These were employment transactions, never smbX engagements.`,
};

function feedSystemPrompt(postAngle?: string | null): string {
  const angle = postAngle && ANGLE_GUIDANCE[postAngle] ? `\n\n${ANGLE_GUIDANCE[postAngle]}` : '';
  return `You turn an internal research report into a STUDIO FEED — raw material for the practice's LinkedIn presence. The practice is smbX: buy-side corporate development for lower-middle-market acquirers. Voice: senior operator, factual, confident, zero hype.

Guardrails (marketing law — absolute):
- Never criticize or even describe a named competitor firm. Every point is a fact about the market or about buy-side work.
- No AI self-reference of any kind in hooks or angles ("our AI", "I analyzed", "powered by" are all banned). The work speaks as the firm.
- Only use numbers that appear in the report WITH their citation. Never invent or round beyond what the source supports.
- Buy-side framing; no fee talk; no securities/tax/legal advice language.

Return ONLY a JSON object, no prose, no code fence, exactly this shape:
{
  "title": "short factual report title (≤80 chars)",
  "hooks": ["5–8 one-line LinkedIn hooks drawn from the report's most surprising facts"],
  "dataPoints": [{ "stat": "the number + what it is", "source": "domain or publication", "freshness": "date or period", "confidence": "high|medium|low" }],
  "angles": [{ "title": "post angle name", "body": "2–3 sentence sketch of the post" }],
  "visual": "one sentence describing the strongest single-image visual for this material",
  "accounts": ["3–6 named companies/publications worth following on this lane"],
  "post": {
    "text": "the READY-TO-PASTE LinkedIn post. First line = the strongest hook (stands alone before 'see more'). Then 2–4 short paragraphs separated by blank lines — factual, senior-operator voice, each number carrying its source name inline in parentheses. 120–220 words. End with 3–5 relevant hashtags on the last line. No emojis, no 'excited to share', no rhetorical-question spam.",
    "altText": "one plain sentence describing the post image for accessibility"
  },
  "docPages": [
    { "kind": "cover", "heading": "the hook, ≤90 chars", "body": "one-line setup, ≤120 chars" },
    { "kind": "stat|story|takeaway", "heading": "≤70 chars", "body": "1–3 sentences", "stat": "stat pages only: the number EXACTLY as cited, short form (e.g. '$4.2B', '38%', '1,900')", "source": "stat pages only: domain or publication" }
  ],
  "chart": { "title": "≤60 chars", "unit": "what the values measure", "labels": ["3–8 category/period labels"], "values": [numbers matching labels], "source": "domain or publication" }
}
docPages: 6–9 pages telling ONE story arc for a swipeable LinkedIn document post — a cover, then alternating stat and story pages (lead with the strongest stat), one takeaway page near the end stating what this means for an acquirer. Do NOT include a closing/brand page (the renderer adds it). Every stat page's number must appear in the report with a citation.
chart: ONLY when the report contains a genuine comparable numeric series (3–8 values of the same measure with a citation) — otherwise null. Never fabricate, interpolate, or mix units to force a chart.
Include 4–8 dataPoints and exactly 3 angles.${angle}`;
}

/* ─── Content-block harvesting ────────────────────────────────────────── */

interface SourceRef { url: string; title: string }

function harvestText(content: any[]): string {
  let out = '';
  for (const block of content) {
    if (block?.type === 'text' && typeof block.text === 'string') out += block.text;
  }
  return out;
}

function harvestSources(content: any[], into: Map<string, SourceRef>) {
  for (const block of content) {
    // Search results: content is a list of web_search_result; on tool errors
    // it is an error OBJECT — branch before indexing (API contract).
    if (block?.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r?.type === 'web_search_result' && typeof r.url === 'string' && !into.has(r.url)) {
          into.set(r.url, { url: r.url, title: typeof r.title === 'string' ? r.title : r.url });
        }
      }
    }
    if (block?.type === 'web_fetch_tool_result' && block.content && !Array.isArray(block.content)) {
      const u = (block.content as any).url;
      if (typeof u === 'string' && !into.has(u)) into.set(u, { url: u, title: u });
    }
  }
}

/** Tolerant JSON extraction — the model is told "JSON only" but belts + braces. */
function extractJson(text: string): any | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ─── Run lifecycle ───────────────────────────────────────────────────── */

export interface CreateRunInput {
  userId: number;
  scheduleId?: number | null;
  researchType: string;
  topic: string;
  depth: string;
  outputFormat: string;
  postAngle?: string;
}

export function validateRunInput(input: Partial<CreateRunInput>): string | null {
  if (!input.topic || !input.topic.trim()) return 'Topic is required';
  if (input.topic.trim().length > 2000) return 'Topic is too long (2,000 chars max)';
  if (!RESEARCH_TYPES.some(t => t.key === input.researchType)) return 'Unknown research type';
  if (!DEPTHS.some(d => d.key === input.depth)) return 'Unknown depth';
  if (!OUTPUT_FORMATS.includes(input.outputFormat as any)) return 'Unknown output format';
  if (input.postAngle && !POST_ANGLES.some(a => a.key === input.postAngle)) return 'Unknown post angle';
  return null;
}

export async function createResearchRun(input: CreateRunInput): Promise<number> {
  const [row] = await sql`
    INSERT INTO research_runs (user_id, schedule_id, research_type, topic, depth, output_format, post_angle, status, progress)
    VALUES (${input.userId}, ${input.scheduleId ?? null}, ${input.researchType}, ${input.topic.trim()},
            ${input.depth}, ${input.outputFormat}, ${input.postAngle ?? 'auto'}, 'queued', 'queued')
    RETURNING id
  `;
  return row.id as number;
}

async function setProgress(runId: number, progress: string) {
  await sql`UPDATE research_runs SET progress = ${progress} WHERE id = ${runId}`.catch(() => {});
}

/**
 * Execute a run end to end. Fire-and-forget safe: every failure path lands in
 * status='failed' with an error message; nothing throws to the caller.
 */
export async function executeResearchRun(runId: number): Promise<void> {
  const [run] = await sql`SELECT * FROM research_runs WHERE id = ${runId}`;
  if (!run || run.status === 'running' || run.status === 'complete') return;

  const type = typeDef(run.research_type);
  const depth = depthDef(run.depth);
  const usage: RunUsage = { searches: 0, fetches: 0, inputTokens: 0, outputTokens: 0, costCents: 0 };

  const fail = async (message: string) => {
    console.error(`[research] Run ${runId} failed: ${message}`);
    usage.costCents = computeCostCents(usage);
    await sql`
      UPDATE research_runs
      SET status = 'failed', error = ${message.slice(0, 800)}, usage = ${sql.json(usage as any)}::jsonb,
          completed_at = NOW()
      WHERE id = ${runId}
    `.catch(() => {});
  };

  try {
    // Monthly budget gate — refuse to start past the cap.
    const spent = await getMonthSpendCents();
    if (spent >= MONTHLY_CAP_CENTS) {
      await fail(`Monthly research budget reached ($${(spent / 100).toFixed(0)} of $${(MONTHLY_CAP_CENTS / 100).toFixed(0)}). Raise RESEARCH_MONTHLY_CAP_CENTS or wait for the new month.`);
      return;
    }

    await sql`UPDATE research_runs SET status = 'running', progress = 'planning searches', started_at = NOW() WHERE id = ${runId}`;
    const anthropic = getClient();

    const tools: any[] = [
      { type: 'web_search_20260209', name: 'web_search', max_uses: depth.searches },
      { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: depth.fetches, max_content_tokens: 20000 },
    ];

    const userPrompt = `Research type: ${type.label}\nTopic / mandate:\n${run.topic}\n\nRun the research and produce the report now.`;
    let messages: MessageParam[] = [{ role: 'user', content: userPrompt }];
    const sources = new Map<string, SourceRef>();
    let reportMd = '';

    // One agentic turn, resumed across pause_turn boundaries. If the fetch
    // tool is rejected in this environment, degrade to search-only once.
    let toolset = tools;
    let resp: any = null;
    for (let attempt = 0; attempt < 2 && !resp; attempt++) {
      try {
        resp = await anthropic.messages.create({
          model: MODEL,
          max_tokens: depth.maxTokens,
          system: researchSystemPrompt(type, depth),
          messages,
          tools: toolset,
        });
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (attempt === 0 && err?.status === 400 && /web_fetch/i.test(msg)) {
          console.warn('[research] web_fetch tool rejected — degrading to search-only:', msg);
          toolset = [tools[0]];
          continue;
        }
        throw err;
      }
    }

    let rounds = 0;
    for (;;) {
      usage.inputTokens += resp.usage?.input_tokens ?? 0;
      usage.outputTokens += resp.usage?.output_tokens ?? 0;
      usage.searches += resp.usage?.server_tool_use?.web_search_requests ?? 0;
      usage.fetches += resp.usage?.server_tool_use?.web_fetch_requests ?? 0;
      harvestSources(resp.content ?? [], sources);
      reportMd += harvestText(resp.content ?? []);

      if (resp.stop_reason !== 'pause_turn' || rounds >= 12) break;
      rounds++;
      await setProgress(runId, `researching — ${usage.searches} searches so far`);
      messages = [...messages, { role: 'assistant', content: resp.content }];
      resp = await anthropic.messages.create({
        model: MODEL,
        max_tokens: depth.maxTokens,
        system: researchSystemPrompt(type, depth),
        messages,
        tools: toolset,
      });
    }

    reportMd = reportMd.trim();
    if (reportMd.length < 200) {
      await fail('The research turn returned no usable report text.');
      return;
    }

    // Finalize: title + STUDIO FEED. A feed failure must not sink the report.
    await setProgress(runId, 'composing studio feed');
    let title: string = run.topic.slice(0, 80);
    let feed: any = null;
    try {
      const feedResp = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 6000,
        system: feedSystemPrompt((run as any).post_angle),
        messages: [{ role: 'user', content: `The report:\n\n${reportMd.slice(0, 60000)}` }],
      });
      usage.inputTokens += feedResp.usage?.input_tokens ?? 0;
      usage.outputTokens += feedResp.usage?.output_tokens ?? 0;
      const parsed = extractJson(harvestText(feedResp.content as any[]));
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.title === 'string' && parsed.title.trim()) title = parsed.title.trim().slice(0, 120);
        feed = parsed;
      }
    } catch (err: any) {
      console.warn(`[research] Studio feed generation failed for run ${runId}:`, err.message);
    }
    // Fall back to the report's own H1 when the feed call didn't title it.
    if (title === run.topic.slice(0, 80)) {
      const h1 = reportMd.match(/^#\s+(.+)$/m);
      if (h1) title = h1[1].trim().slice(0, 120);
    }

    usage.costCents = computeCostCents(usage);
    await sql`
      UPDATE research_runs
      SET status = 'complete', progress = 'complete', report_title = ${title}, report_md = ${reportMd},
          studio_feed = ${feed ? sql.json(feed) : null}::jsonb,
          sources = ${sql.json([...sources.values()].slice(0, 60) as any)}::jsonb,
          usage = ${sql.json(usage as any)}::jsonb, completed_at = NOW(), error = NULL
      WHERE id = ${runId}
    `;
    console.log(`[research] Run ${runId} complete — "${title}" (${usage.searches} searches, ${usage.fetches} fetches, ~$${(usage.costCents / 100).toFixed(2)})`);

    if (run.schedule_id) await sendCompletionEmail(run, title, usage).catch(() => {});
  } catch (err: any) {
    await fail(err?.message || 'Research run failed');
  }
}

/* ─── Scheduled campaigns ─────────────────────────────────────────────── */

/**
 * First fire: next Sunday 22:00 UTC (monthly: 1st of next month 13:00 UTC) —
 * Sunday night material is ready for the Monday LinkedIn window. Subsequent
 * fires step from the SCHEDULED time (not "now") so cadence never drifts.
 */
export function nextRunAt(cadence: string, after: Date = new Date(), first = false): Date {
  const d = new Date(after.getTime());
  if (cadence === 'monthly') {
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 13, 0, 0));
    return next;
  }
  if (first) {
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 22, 0, 0));
    const daysToSunday = (7 - next.getUTCDay()) % 7;
    next.setUTCDate(next.getUTCDate() + daysToSunday);
    if (next.getTime() <= after.getTime()) next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }
  d.setUTCDate(d.getUTCDate() + (cadence === 'biweekly' ? 14 : 7));
  return d;
}

async function sendCompletionEmail(run: any, title: string, usage: RunUsage) {
  const [schedule] = await sql`SELECT * FROM research_schedules WHERE id = ${run.schedule_id}`;
  let to: string | null = schedule?.email_to ?? null;
  if (!to) {
    const [user] = await sql`SELECT email FROM users WHERE id = ${run.user_id}`;
    to = user?.email ?? null;
  }
  if (!to) return;

  const spent = await getMonthSpendCents();
  const nearCap = spent >= MONTHLY_CAP_CENTS * 0.8;
  const base = process.env.APP_URL || 'https://smbx.ai';
  const type = typeDef(run.research_type);

  await sendEmail({
    to,
    subject: `Research ready: ${title}`,
    html: brandedEmail({
      headline: 'Your research run is done.',
      body: `
        <p style="margin:0 0 14px;"><strong style="color:#1A1C1E;">${title}</strong> — a ${type.label} on your campaign${schedule?.name ? ` <strong style="color:#1A1C1E;">${schedule.name}</strong>` : ''} just finished (${usage.searches} searches, fully cited).</p>
        <p style="margin:0;">Open Studio to read the report, grab the LinkedIn material, and download the PDF or card.</p>
        ${nearCap ? `<p style="margin:14px 0 0;padding:12px 16px;background:rgba(0,0,0,0.04);border-radius:10px;font-size:13px;color:#1A1C1E;">Heads up: research spend is at $${(spent / 100).toFixed(0)} of the $${(MONTHLY_CAP_CENTS / 100).toFixed(0)} monthly budget.</p>` : ''}
      `,
      ctaLabel: 'Open Studio',
      ctaUrl: base,
      footnote: 'Scheduled by your smbX research campaign. Manage cadence in Studio.',
    }),
  });
}

let schedulerStarted = false;

/**
 * In-process campaign scheduler — no separate worker deployment to trust.
 * Boot: mark runs orphaned by a restart as failed. Then every 10 minutes,
 * fire due schedules (advancing next_run_at BEFORE executing so a crash
 * can't double-fire).
 */
export function startResearchScheduler() {
  if (schedulerStarted || process.env.RESEARCH_SCHEDULES_DISABLED === 'true') return;
  schedulerStarted = true;

  const cleanup = async () => {
    await sql`
      UPDATE research_runs SET status = 'failed', error = 'Interrupted by a server restart', completed_at = NOW()
      WHERE status IN ('queued', 'running') AND created_at < NOW() - INTERVAL '30 minutes'
    `.catch(() => {});
  };

  const tick = async () => {
    try {
      const due = await sql`
        SELECT * FROM research_schedules
        WHERE active = TRUE AND next_run_at IS NOT NULL AND next_run_at <= NOW()
        ORDER BY next_run_at ASC
        LIMIT 3
      `;
      for (const s of due as any[]) {
        // Step from the scheduled slot; catch up past downtime without burst-firing.
        let next = nextRunAt(s.cadence, new Date(s.next_run_at));
        while (next.getTime() <= Date.now()) next = nextRunAt(s.cadence, next);
        await sql`UPDATE research_schedules SET last_run_at = NOW(), next_run_at = ${next} WHERE id = ${s.id}`;
        const runId = await createResearchRun({
          userId: s.user_id,
          scheduleId: s.id,
          researchType: s.research_type,
          topic: s.topic,
          depth: s.depth,
          outputFormat: s.output_format,
          postAngle: (s as any).post_angle ?? 'auto',
        });
        console.log(`[research] Campaign "${s.name}" fired → run ${runId} (next: ${next.toISOString()})`);
        executeResearchRun(runId).catch(err => console.error(`[research] Scheduled run ${runId} crashed:`, err?.message));
      }
    } catch (err: any) {
      console.error('[research] Schedule tick failed:', err.message);
    }
  };

  cleanup().catch(() => {});
  setTimeout(tick, 60_000); // first check a minute after boot
  setInterval(tick, 10 * 60_000);
  console.log('[research] Campaign scheduler started (10-minute tick)');
}
