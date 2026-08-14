/**
 * "Ask about this report" — grounded question answering over a published
 * assessment (2026-07-29).
 *
 * Paul: "to the right in the right FAB let's add a Ask Agent about the report
 * or help answer any questions. Meaning, Yulia (aka Agent) will need to
 * understand the researches as they are posted."
 *
 * THE WHOLE REPORT IS THE CONTEXT. No retrieval layer, no chunking, no
 * embeddings: the document is sent whole and the model answers out of it. That
 * is a deliberate trade. Retrieval is what you build when the corpus does not
 * fit, and this one does — the longest assessment is ~26k tokens. Chunking it
 * would introduce the one failure this practice cannot afford: a figure
 * answered from the wrong section, or a retrieved passage that drops the
 * caveat attached to it three paragraphs later. The reports are ALSO full of
 * self-corrections ("this figure was retired on 2026-07-27"), and a retriever
 * that surfaces the retired figure without its correction would actively
 * mislead. Whole-document context cannot do that.
 *
 * The document block is marked for prompt caching, so a second question about
 * the same report re-reads it at cache rates rather than full price.
 *
 * GROUNDING IS THE PRODUCT. The system prompt allows exactly one source — the
 * document below it — and requires the answer to say so when the report does
 * not cover something. That is not politeness; the reports are published on
 * the strength of every figure being attributed, and an agent that fills gaps
 * from its own memory would quietly undo that.
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findReport, type ReportMeta } from '../../shared/reports.js';
import { spendAllowed, recordSpend } from './apiSpend.js';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_Q_CHARS = 600;
const MAX_TURNS = 12;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  // ON by default (see practiceIntake). Soft: the route answers 503 and the
  // panel says so, rather than the report appearing to have no answer.
  if (!spendAllowed('marketing')) return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 45_000,
      maxRetries: 1,
    });
  }
  return client;
}

/* ── the source text ─────────────────────────────────────────────────────── */

/** Resolve `scripts/studio/reports/` from both `npx tsx server/index.ts` (repo
 *  root) and the container (WORKDIR /app, bundle at /app/dist/server).
 *
 *  A candidate list rather than one computed path, matching reportPdfPath in
 *  reportAccess.ts. Deriving it from `import.meta.url` alone happens to work
 *  today only because the server bundles to a SINGLE dist/server/index.js — if
 *  that ever splits into dist/server/services/, the same expression silently
 *  resolves to /app/dist/scripts and every answer becomes a 503 with nothing
 *  in the logs to say why. Probing is cheap and cannot rot that way. */
function reportsDirs(): string[] {
  const fromModule = path.resolve(new URL('.', import.meta.url).pathname, '../..', 'scripts/studio/reports');
  return [
    path.join(process.cwd(), 'scripts/studio/reports'),
    fromModule,
    path.resolve(process.cwd(), '../scripts/studio/reports'),
  ];
}

const CACHE = new Map<string, string>();

async function loadSource(report: ReportMeta): Promise<string | null> {
  const hit = CACHE.get(report.slug);
  if (hit) return hit;
  // `md` comes from our own register, never from a request — but a filename is
  // still a filename, so refuse anything with a path in it rather than trust
  // that a later edit keeps the field internal.
  if (!/^[a-z0-9][a-z0-9._-]*\.md$/i.test(report.md)) {
    console.error(`[report-qa] refusing odd source name for ${report.slug}: ${report.md}`);
    return null;
  }
  for (const dir of reportsDirs()) {
    try {
      const text = await readFile(path.join(dir, report.md), 'utf8');
      CACHE.set(report.slug, text);
      return text;
    } catch { /* try the next candidate */ }
  }
  console.error(`[report-qa] source not found for ${report.slug} (${report.md})`);
  return null;
}

/* ── the prompt ──────────────────────────────────────────────────────────── */

function systemPrompt(report: ReportMeta): string {
  return `You answer questions about ONE published research report for smbX.ai, a buy-side corporate development practice. You are the practice's research agent. The reader is on the report's page and asking about what it says.

THE REPORT IS YOUR ONLY SOURCE.
- Answer strictly from the document supplied in this conversation. Never add a figure, company, date or claim that is not in it, even if you believe it.
- If the report does not cover something, say so plainly and stop: "The report doesn't cover that." Then, only if it is genuinely close, point to the nearest section that does. Never pad a non-answer with general knowledge.
- Quote figures EXACTLY as the report states them, including the units, the year and the qualifier. A rounded figure is a different figure.
- Where the report carries two conflicting values, give BOTH and say the report carries both. Never split the difference.
- The report contains correction notices retiring earlier figures. If a question touches a retired figure, lead with the correction. Never quote a retired figure as current.
- Name the section you are drawing from, in the form the report uses ("§2.2", "PART III", "the executive summary"). One or two, not a list.

HOW YOU WRITE.
- Direct and plain. Two to five sentences for most questions. No preamble, no "great question", no summary of what you are about to say.
- Never say "as an AI" or refer to yourself as a model.
- No markdown headers or bullet lists unless the answer is genuinely a list of three or more parallel items. Prose by default.

THE LINE — the practice's operating perimeter, which binds you.
- This is buy-side corporate development. Never offer sell-side help.
- Never value a specific named company, and never suggest what someone should pay for one. The report's market-level multiples are reportable; applying them to a reader's target is not.
- No investment, legal, tax or accounting advice. If a question needs one of those, say it needs the relevant specialist.
- Never discuss the practice's fees or terms. If asked, say those are set in an engagement letter and point to booking a call.
- Do not speculate about companies' intentions or unannounced deals beyond what the report states.

If a reader asks something the report cannot answer but a conversation could — their own market, their own target, whether the practice would take a mandate — say the report doesn't cover it and suggest booking a call. Do not pitch otherwise.

REPORT: "${report.shortTitle}" (${report.kicker}, published ${report.publishedLabel}).`;
}

export interface QATurn { role: 'user' | 'assistant'; content: string }

export interface QAResult {
  ok: boolean;
  answer?: string;
  reason?: 'unknown_report' | 'no_source' | 'empty' | 'unavailable';
}

export async function askReport(input: {
  slug: string;
  question: string;
  history?: QATurn[];
}): Promise<QAResult> {
  const report = findReport(String(input.slug || ''));
  if (!report) return { ok: false, reason: 'unknown_report' };

  const question = String(input.question || '').trim().slice(0, MAX_Q_CHARS);
  if (!question) return { ok: false, reason: 'empty' };

  const source = await loadSource(report);
  if (!source) return { ok: false, reason: 'no_source' };

  const anthropic = getClient();
  if (!anthropic) return { ok: false, reason: 'unavailable' };

  // Trim to the last few exchanges — a reader's follow-ups, not a transcript.
  const history = (input.history || [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_Q_CHARS) }));

  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: [
        { type: 'text' as const, text: systemPrompt(report) },
        {
          // The document, cached: a reader asks three or four questions in a
          // sitting and each one would otherwise re-bill the whole report.
          type: 'text' as const,
          text: `Here is the complete report.\n\n<report>\n${source}\n</report>`,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: [...history, { role: 'user' as const, content: question }],
    });

    recordSpend({
      lane: 'marketing', source: 'report.qa', model: MODEL,
      inputTokens: res.usage?.input_tokens, outputTokens: res.usage?.output_tokens,
    });

    const answer = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    if (!answer) return { ok: false, reason: 'unavailable' };
    return { ok: true, answer };
  } catch (err: any) {
    console.error('[report-qa] ask failed:', err?.message || err);
    return { ok: false, reason: 'unavailable' };
  }
}
