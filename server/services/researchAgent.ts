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
    // Research rounds run long (server-side search rounds + long writes).
    // Rounds STREAM (see streamRound) so there is no single-response wall;
    // this timeout only bounds connect/first-byte and the SDK's retries.
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 600_000, maxRetries: 2 });
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
    label: 'Sector scan',
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
    label: 'Market map',
    blurb: 'Who actually operates in this space, layer by layer.',
    template: `## Ecosystem layers — the value chain from upstream to end customer
## Named participants by tier — larger platforms, mid-size independents, notable specialists (names + one-line descriptors)
## Ownership status — PE-backed vs founder-owned vs public, where known
## Recent movement — acquisitions, entries, exits in the last 24 months`,
    killConditions: false,
  },
  {
    key: 'buyer_roster',
    label: 'Who’s buying',
    blurb: 'Named likely acquirers for a segment, with rationale.',
    template: `## Active acquirers — named buyers with recent acquisition evidence, most active first
## Rationale per buyer — why each would want targets in this segment
## Acquisition patterns — size ranges, geographies, integration style where visible
## Watch list — plausible but unproven buyers worth monitoring`,
    killConditions: true,
  },
  {
    key: 'deal_monitor',
    label: 'Recent deals',
    blurb: 'What happened in this lane recently — transactions and signals.',
    template: `## Transactions in the window — announced deals with buyer, seller, date, and terms where published
## Signals — leadership changes, expansions, distress markers, fundraises that precede deals
## Pattern read — what the activity says about where the lane is heading
## Implications for a buyer — how this should shape thesis or timing`,
    killConditions: false,
  },
  {
    key: 'thesis_validation',
    label: 'Pressure-test a claim',
    blurb: 'Test a thesis or a common belief against the evidence, both ways.',
    template: `## The thesis, restated — the claim being tested, in one tight paragraph
## Supporting evidence — findings that confirm, each cited
## Contradicting evidence — findings that cut against it, each cited (do not soften these)
## Verdict — supported / partially supported / not supported, with the reasoning`,
    killConditions: true,
  },
  {
    key: 'topic_brief',
    label: 'Any topic — full research',
    blurb: 'A grounded, fully cited brief on whatever you type.',
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

/** The post formats \u2014 named EXACTLY from Paul's weekly LinkedIn posting plan
 *  (2026-07-18). These are the primary picker in Studio: he thinks "I need
 *  Tuesday's Teardown", not in research-type taxonomy. Keys are stable;
 *  labels are his words. */
export const POST_ANGLES = [
  { key: 'auto', label: 'Auto', blurb: 'Not a scheduled post \u2014 let the writer pick the strongest frame from the material.' },
  { key: 'teardown', label: 'Teardown', blurb: 'Tuesday \u2014 buyer\u2019s-eye teardown of a sector or deal: structure, economics, diligence traps.' },
  { key: 'contrarian', label: 'Contrarian Take', blurb: 'Wednesday \u2014 challenge a common belief with evidence. Ideas, never firms.' },
  { key: 'how_buyers_think', label: 'How Buyers Think', blurb: 'Wednesday alt \u2014 process education: what disciplined acquirers actually do and why.' },
  { key: 'practitioner_note', label: 'Practitioner Note', blurb: 'Thursday \u2014 first-person lived-experience note. Employers anonymized, career total 150.' },
  { key: 'human_thread', label: 'Human Thread', blurb: 'Friday \u2014 a human story or lesson, no pitch. Personal specifics stay yours to fill in.' },
  { key: 'hand_raiser', label: 'Hand-Raiser', blurb: 'Saturday \u2014 the direct offer: who we serve, what we do, one ask.' },
] as const;
export type PostAngleKey = typeof POST_ANGLES[number]['key'];

const ANGLE_GUIDANCE: Record<string, string> = {
  teardown: `POST ANGLE — TEARDOWN: frame hooks, angles, the post, and docPages as a buyer's-eye teardown. Lead with what makes the lane acquisition-attractive or not (fragmentation, revenue quality, succession, regulation), name the diligence traps, and close on what a disciplined buyer does with this. Curiosity-gap hooks work: "X looks boring. The buyer math is anything but."`,
  contrarian: `POST ANGLE — CONTRARIAN TAKE: pick the consensus view the report actually undermines and lead with the challenge ("The 'Silver Tsunami' is the laziest thesis in lower-middle-market M&A" is the register). Every contrarian claim must be carried by a cited fact from the report. Challenge IDEAS and narratives, never a named firm or profession — advisors and brokers are allies.`,
  how_buyers_think: `POST ANGLE — HOW BUYERS THINK: frame the material as process education for acquirers — what a disciplined buyer checks, in what order, and why, using the report's facts as the evidence. Teach one repeatable judgment, not a listicle. Insider-POV hooks work: "Here's what a corp-dev team sees in this market."`,
  practitioner_note: `POST ANGLE — PRACTITIONER NOTE: first-person senior-operator voice — the report's facts framed through lived deal experience. HARD LAW: former employers are NEVER named — say "a global investment bank" and "a world-class PE-backed aggregator"; the career total is "150 acquisitions"; experience claims are "led or co-led", never unqualified "closed". These were employment transactions, never smbX engagements.`,
  human_thread: `POST ANGLE — HUMAN THREAD: a human story or lesson, warm and plain — NO pitch, NO call-to-action, no "book a call". Build the post on a real pattern from the report (an owner's situation, a market moment) framed as observation from practice. ZERO FABRICATED AUTOBIOGRAPHY: never invent a personal anecdote, a named person, or a conversation that is not in the report. Where a lived specific belongs, write a bracketed placeholder for the author to fill — e.g. "[YOURS: the owner conversation this brings back]" — one or two at most, never more. First person is fine; the employer-anonymization law still applies ("a global investment bank" / "a world-class PE-backed aggregator", "150 acquisitions", "led or co-led"). Keep it short: 90–160 words, 0–2 hashtags.`,
  hand_raiser: `POST ANGLE — HAND-RAISER: the direct offer, stated plainly. Structure: one concrete cited market fact from the report (why now) → who we work for (acquirers in the lower middle market, buy-side only) → what an engagement produces (a mapped market, qualified owner conversations, a process run through close) → ONE ask: book a call at smbx.ai. HARD LAW: never name, quote, or hint at fees; no "raise capital" or securities language; no invented scarcity or urgency ("two spots left" is banned); no competitor mention. 80–140 words, direct senior voice, 1–3 hashtags.`,
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
  "visual": "one sentence describing the strongest single-image EDITORIAL visual for this material — an abstract/illustrative scene or metaphor tied to the sector and thesis, suitable for a flat editorial illustration (no text in the image, no real people, no logos, no charts). If the mandate contains a 'Visual direction:' sentence, honor it here.",
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

/** One line of the live activity trail shown in the Studio library. */
export interface ActivityEntry {
  t: string;
  kind: 'phase' | 'search' | 'read' | 'done' | 'error';
  text: string;
}

/** Pull the round's tool calls out of the response content so the trail can
 *  say what was actually searched and read, Claude-style. */
function harvestToolCalls(content: any[]): { kind: 'search' | 'read'; text: string }[] {
  const out: { kind: 'search' | 'read'; text: string }[] = [];
  for (const block of content ?? []) {
    if (block?.type !== 'server_tool_use') continue;
    if (block.name === 'web_search' && typeof block.input?.query === 'string') {
      out.push({ kind: 'search', text: block.input.query.slice(0, 180) });
    } else if (block.name === 'web_fetch' && typeof block.input?.url === 'string') {
      try {
        const u = new URL(block.input.url);
        out.push({ kind: 'read', text: `${u.hostname}${u.pathname.length > 1 ? u.pathname : ''}`.slice(0, 180) });
      } catch {
        out.push({ kind: 'read', text: String(block.input.url).slice(0, 180) });
      }
    }
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

  // The live trail. Pushed locally, flushed to the row so the Studio library
  // can show what the researcher is doing while it works — and keep the
  // record afterward. The cap is a runaway backstop, far above a deep run.
  const activity: ActivityEntry[] = [];
  const pushAct = (kind: ActivityEntry['kind'], text: string) => {
    activity.push({ t: new Date().toISOString(), kind, text: text.slice(0, 200) });
    if (activity.length > 160) activity.splice(0, activity.length - 160);
  };
  const flushAct = async () => {
    await sql`UPDATE research_runs SET activity = ${sql.json(activity as any)}::jsonb WHERE id = ${runId}`.catch(() => {});
  };

  const fail = async (message: string) => {
    console.error(`[research] Run ${runId} failed: ${message}`);
    usage.costCents = computeCostCents(usage);
    pushAct('error', message.slice(0, 200));
    await sql`
      UPDATE research_runs
      SET status = 'failed', error = ${message.slice(0, 800)}, usage = ${sql.json(usage as any)}::jsonb,
          activity = ${sql.json(activity as any)}::jsonb, completed_at = NOW()
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
    pushAct('phase', `Planning the research — ${type.label.toLowerCase()}, ${depth.label.toLowerCase()} depth`);
    await flushAct();
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
    // The 20260209 web tools execute in a server-side code-execution
    // container. When a turn pauses with pending tool work, the resume MUST
    // carry the container id back or the API 400s ("container_id is
    // required when there are pending tool uses generated by code
    // execution with tools" — Paul's Sunday-recap run, 2026-07-19).
    let containerId: string | null = null;

    // STREAMING (2026-07-18): a research round (server-side searches + a
    // long write) can outlive any single-response window — Paul's runs died
    // with "Request timed out." at the old 5-minute non-streaming ceiling.
    // A stream keeps the connection moving for the whole round, and each
    // completed tool-use block lands in the activity trail AS IT HAPPENS,
    // so the library feed narrates mid-round instead of between rounds.
    const streamRound = async (msgs: MessageParam[]): Promise<any> => {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: depth.maxTokens,
        system: researchSystemPrompt(type, depth),
        messages: msgs,
        tools: toolset,
        ...(containerId ? { container: containerId } : {}),
      });
      // SDK 0.78's finalMessage() DROPS the container id on the streamed
      // path (its accumulator copies only stop_reason/stop_sequence/usage
      // out of message_delta, and delta.container is where the API delivers
      // it) — so resp.container?.id below is never populated and the next
      // resume 400s. Harvest it from the raw events, wherever it appears.
      stream.on('streamEvent', (ev: any) => {
        const cid = ev?.message?.container?.id ?? ev?.delta?.container?.id;
        if (cid) containerId = cid;
      });
      stream.on('contentBlock', (block: any) => {
        const calls = harvestToolCalls([block]);
        if (calls.length) {
          for (const c of calls) pushAct(c.kind, c.text);
          void flushAct();
        }
      });
      return await stream.finalMessage();
    };

    // One manual mid-stream retry per round — the SDK's own retries only
    // cover the window before streaming begins. 400s won't heal; rethrow.
    const runRound = async (msgs: MessageParam[]): Promise<any> => {
      try {
        return await streamRound(msgs);
      } catch (err: any) {
        if (err?.status === 400) throw err;
        console.warn(`[research] Run ${runId} round dropped mid-stream — retrying once:`, err?.message);
        pushAct('phase', 'Connection dropped mid-round — retrying');
        await flushAct();
        return await streamRound(msgs);
      }
    };

    let resp: any = null;
    for (let attempt = 0; attempt < 2 && !resp; attempt++) {
      try {
        resp = await runRound(messages);
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
      containerId = resp.container?.id ?? containerId;
      harvestSources(resp.content ?? [], sources);
      reportMd += harvestText(resp.content ?? []);
      // Tool calls hit the trail live via the contentBlock handler — no
      // post-round harvest here (it would double-log).

      if (resp.stop_reason !== 'pause_turn' || rounds >= 12) break;
      rounds++;
      await setProgress(runId, `researching — ${usage.searches} searches so far`);
      await flushAct();
      messages = [...messages, { role: 'assistant', content: resp.content }];
      resp = await runRound(messages);
    }

    reportMd = reportMd.trim();
    if (reportMd.length < 200) {
      await fail('The research turn returned no usable report text.');
      return;
    }
    pushAct('phase', `Report drafted — ~${reportMd.split(/\s+/).length.toLocaleString('en-US')} words from ${sources.size} sources`);

    // Finalize: title + STUDIO FEED. A feed failure must not sink the report.
    await setProgress(runId, 'composing studio feed');
    const angleDef = POST_ANGLES.find(a => a.key === (run as any).post_angle);
    pushAct('phase', angleDef && angleDef.key !== 'auto'
      ? `Writing the LinkedIn collateral — ${angleDef.label}`
      : 'Writing the LinkedIn collateral');
    await flushAct();
    let title: string = run.topic.slice(0, 80);
    let feed: any = null;
    try {
      // Streamed for the same reason as the rounds — no single-response wall.
      const feedResp = await anthropic.messages
        .stream({
          model: MODEL,
          max_tokens: 6000,
          system: feedSystemPrompt((run as any).post_angle),
          messages: [{ role: 'user', content: `The report:\n\n${reportMd.slice(0, 60000)}` }],
        })
        .finalMessage();
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

    // Story artwork (2026-07-20): render the feed's visual brief into an
    // editorial illustration for the carousel cover + media library. Strictly
    // fail-soft — the run completes either way, and the trail says what
    // happened. Only for runs that produce LinkedIn collateral.
    if (feed?.visual && run.output_format !== 'report' && process.env.GOOGLE_AI_API_KEY) {
      pushAct('phase', 'Illustrating the story — rendering the visual brief');
      await flushAct();
      const { generateRunArtwork } = await import('./artworkService.js');
      const art = await generateRunArtwork({ runId, scheduleId: run.schedule_id ?? null, title, visualBrief: String(feed.visual) });
      if (art.assetId != null) pushAct('phase', 'Story artwork ready — it’s in Media and on the carousel cover');
      else pushAct('phase', `Artwork skipped — ${(art as any).reason}`);
    }

    usage.costCents = computeCostCents(usage);
    pushAct('done', `Done — ${usage.searches} searches · ${usage.fetches} pages read · ~$${(usage.costCents / 100).toFixed(2)}`);
    await sql`
      UPDATE research_runs
      SET status = 'complete', progress = 'complete', report_title = ${title}, report_md = ${reportMd},
          studio_feed = ${feed ? sql.json(feed) : null}::jsonb,
          sources = ${sql.json([...sources.values()].slice(0, 60) as any)}::jsonb,
          usage = ${sql.json(usage as any)}::jsonb, activity = ${sql.json(activity as any)}::jsonb,
          completed_at = NOW(), error = NULL
      WHERE id = ${runId}
    `;
    console.log(`[research] Run ${runId} complete — "${title}" (${usage.searches} searches, ${usage.fetches} fetches, ~$${(usage.costCents / 100).toFixed(2)})`);

    if (run.schedule_id) await sendCompletionEmail(run, title, usage).catch(() => {});
  } catch (err: any) {
    // Prefer the API's own message over the SDK's "400 {raw json}" wrapper.
    const apiMsg = err?.error?.error?.message;
    await fail(apiMsg ? String(apiMsg) : (err?.message || 'Research run failed'));
  }
}

/* ─── Campaign-plan import (2026-07-19) ───────────────────────────────────
 * Paul plans campaigns in Claude (strategy PDFs, pasted docs). The app
 * ingests the plan — the PDF goes to the API as a native document block, so
 * Claude reads exactly what the other Claude wrote — and proposes
 * ready-to-create campaigns in the app's own vocabulary. Parse-only:
 * creating them stays a human click in the review sheet. */

export interface ImportedCampaign {
  name: string;
  postAngle: string;
  researchType: string;
  topic: string;
  cadence: string;
  depth: string;
  outputFormat: string;
  note?: string;
}

function importSystemPrompt(): string {
  const angles = POST_ANGLES.map(a => `- ${a.key}: ${a.label} — ${a.blurb}`).join('\n');
  const types = RESEARCH_TYPES.map(t => `- ${t.key}: ${t.label} — ${t.blurb}`).join('\n');
  return `You convert a marketing/posting plan document into CAMPAIGNS for smbX Studio — a buy-side corp-dev practice's research-to-LinkedIn pipeline. Each campaign runs cited web research on a cadence and drafts collateral in one of the plan's post formats.

POST FORMATS (postAngle keys):
${angles}

RESEARCH LENSES (researchType keys):
${types}

CADENCES: weekly | biweekly | monthly. DEPTHS: quick | standard | deep. OUTPUT FORMATS: post_image (LinkedIn 1-pager) | post_pdf (carousel PDF) | report (internal letter PDF) | both.

RULES:
- Extract every RECURRING posting slot / campaign the document actually defines — one campaign per slot. Ignore one-off tasks, profile checklists, DM scripts, engagement tactics, and metrics advice.
- topic is the run's standing research mandate: write it FROM THE DOCUMENT's own description of that slot — what to research each time, the angle to take, and any tie-back the document asks for (e.g. relating findings to buy-side corporate development for lower-middle-market companies). Self-contained, 1–4 sentences. Never invent subject matter the document does not contain. If the document specifies an accompanying visual or image idea for the slot, append it to the topic as one final sentence beginning "Visual direction:" (verbatim from the document's intent) so the researcher carries it into the artwork.
- name: short, in the document's own slot naming (e.g. "Tuesday Teardown").
- Choose the closest postAngle; when none fits use "auto". Choose the lens that best feeds the slot (sector teardowns → vertical_scan; claim-testing → thesis_validation; news/recap slots → deal_monitor or topic_brief; offer posts → deal_monitor). depth: standard unless the document implies a deep flagship piece. outputFormat: post_image unless the document asks for carousels/documents (post_pdf) or both.
- note: ≤90 chars — where in the plan this came from (day/section).
Return ONLY JSON, no prose, no code fence: {"summary":"one line describing the plan","campaigns":[{"name":"…","postAngle":"…","researchType":"…","topic":"…","cadence":"…","depth":"…","outputFormat":"…","note":"…"}]} with at most 12 campaigns.`;
}

export async function parseCampaignPlan(input: { pdf?: Buffer; text?: string }): Promise<{ summary: string; campaigns: ImportedCampaign[] }> {
  if (!input.pdf && !input.text?.trim()) throw new Error('Nothing to import — attach a PDF or paste the plan text');
  const anthropic = getClient();

  const content: any[] = [];
  if (input.pdf) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.pdf.toString('base64') } });
  }
  content.push({
    type: 'text',
    text: input.text?.trim()
      ? `The plan:\n\n${input.text.trim().slice(0, 60000)}\n\nExtract the campaigns now.`
      : 'Extract the campaigns from the attached plan document now.',
  });

  const resp = await anthropic.messages
    .stream({ model: MODEL, max_tokens: 4000, system: importSystemPrompt(), messages: [{ role: 'user', content }] })
    .finalMessage();

  const parsed = extractJson(harvestText(resp.content as any[]));
  if (!parsed || !Array.isArray(parsed.campaigns)) throw new Error('Could not read a campaign plan out of that document');

  const clampKey = (v: unknown, ok: string[], fb: string) => (typeof v === 'string' && ok.includes(v) ? v : fb);
  const campaigns: ImportedCampaign[] = parsed.campaigns
    .slice(0, 12)
    .map((c: any): ImportedCampaign => ({
      name: String(c?.name ?? '').trim().slice(0, 120) || 'Imported campaign',
      postAngle: clampKey(c?.postAngle, POST_ANGLES.map(a => a.key), 'auto'),
      researchType: clampKey(c?.researchType, RESEARCH_TYPES.map(t => t.key), 'topic_brief'),
      topic: String(c?.topic ?? '').trim().slice(0, 2000),
      cadence: clampKey(c?.cadence, [...CADENCES], 'weekly'),
      depth: clampKey(c?.depth, DEPTHS.map(d => d.key), 'standard'),
      outputFormat: clampKey(c?.outputFormat, [...OUTPUT_FORMATS], 'post_image'),
      note: typeof c?.note === 'string' && c.note.trim() ? c.note.trim().slice(0, 120) : undefined,
    }))
    .filter((c: ImportedCampaign) => c.topic.length >= 10);
  if (!campaigns.length) throw new Error('The document did not yield any recurring campaigns');

  return { summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 200) : 'Imported plan', campaigns };
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
 * Runs execute IN THIS PROCESS (fire-and-forget, no worker) — so any row
 * still marked in-flight when the process boots is dead: a deploy or crash
 * killed it mid-run. Fail it immediately with a plain message instead of
 * letting it spin as "Running" forever (the old sweep only caught orphans
 * older than 30 minutes, which left fresh deploy-killed runs stuck). If a
 * blue-green overlap means the OLD container is in fact still finishing the
 * run, its final UPDATE lands afterward and the row heals to complete on
 * its own — the work is never lost by this sweep.
 */
async function failOrphanedRuns(): Promise<void> {
  const rows = await sql`
    UPDATE research_runs
    SET status = 'failed', error = 'The server restarted (a deploy) while this was in flight — press Run again.',
        completed_at = NOW()
    WHERE status IN ('queued', 'running')
    RETURNING id
  `.catch(() => [] as any[]);
  if (rows.length) console.log(`[research] Boot sweep: marked ${rows.length} deploy-orphaned run(s) failed`);
}

/** Belt + braces for orphans that appear WITHOUT a restart (should not
 *  happen — every failure path writes status='failed' — but a stuck row
 *  also blocks the two-in-flight gate, so sweep on every tick). A deep run
 *  finishes in ~10–15 minutes; 45 is generous. */
async function failStaleRuns(): Promise<void> {
  await sql`
    UPDATE research_runs
    SET status = 'failed', error = 'The run stalled and was cleaned up — press Run again.', completed_at = NOW()
    WHERE status IN ('queued', 'running') AND COALESCE(started_at, created_at) < NOW() - INTERVAL '45 minutes'
  `.catch(() => {});
}

/**
 * In-process campaign scheduler — no separate worker deployment to trust.
 * Boot: sweep deploy-orphaned runs (always, even when schedules are
 * disabled). Then every 10 minutes, fire due schedules (advancing
 * next_run_at BEFORE executing so a crash can't double-fire).
 */
export function startResearchScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  failOrphanedRuns().catch(() => {});

  if (process.env.RESEARCH_SCHEDULES_DISABLED === 'true') {
    console.log('[research] Campaign scheduler disabled (RESEARCH_SCHEDULES_DISABLED) — boot sweep still ran');
    return;
  }

  const tick = async () => {
    try {
      await failStaleRuns();
      const due = await sql`
        SELECT * FROM research_schedules
        WHERE active = TRUE AND COALESCE(archived, FALSE) = FALSE
          AND next_run_at IS NOT NULL AND next_run_at <= NOW()
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

  setTimeout(tick, 60_000); // first check a minute after boot
  setInterval(tick, 10 * 60_000);
  console.log('[research] Campaign scheduler started (10-minute tick)');
}
