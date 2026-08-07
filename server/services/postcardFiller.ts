/**
 * Post-card smart fill — turns a pasted campaign brief into a filled
 * PostCardSpec via Haiku. The brand-law guardrails live in the prompt:
 * zero-hallucination (only facts present in the brief), buy-side voice,
 * employer anonymization, no fees, no grievance copy.
 *
 * ANONYMIZATION IS DELIBERATE HERE (Paul, 2026-08-07: "Let's anonymize" —
 * closing the last audit flag). The public SITE names the employers
 * (Wrench Group · JPMorgan Chase · Deloitte, the 2026-08-07 reversal);
 * this LinkedIn-card surface anonymizes them BY HIS CALL, a per-surface
 * exception, not a stale leftover. A named-employers pass must NOT
 * "correct" rule 3 below — the two surfaces carry different law on
 * purpose.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { PostCardSpec, PostCardTemplate } from './researchComposer.js';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM = `You write LinkedIn card copy for smbX.ai, a buy-side corporate development practice (lower middle market, buyers only). You fill ONE card template from the user's brief and return STRICT JSON only — no prose, no markdown fences.

Templates and their fields:
- "stat": { "kicker", "value", "claim", "source" } — value is ONE number/figure lifted verbatim from the brief (e.g. "20%", "$2.9B", "36"); claim is one sentence (max 140 chars) the number proves; source is the attribution AS GIVEN in the brief (omit if none).
- "quote": { "kicker", "quote", "name", "role" } — quote is a first-person conviction line (max 260 chars) drawn from the brief's voice; default name "Paul Baker", role "Founder · smbX.ai" unless the brief names someone else.
- "thesis": { "kicker", "title", "rows": [{"k","v"}] (2-4), "insight" } — a sector/market teardown; k is a short mono label (e.g. "FRAGMENTATION"), v one sentence; insight is the one-line conclusion (max 160 chars).
- "playbook": { "kicker", "title", "steps": [string] (3-5) } — a numbered process; each step one sentence (max 130 chars).

Also always include: "template" (the chosen one) and "footerTag" (default "smbx.ai · Book a call").

HARD RULES:
1. Use ONLY facts, numbers, names, and claims present in the brief. NEVER invent a statistic, source, or figure. If the brief has no number, do not choose "stat".
2. Buy-side voice: we represent acquirers only. Never sell-side language, never fees or pricing, never investment/legal/tax advice, never a valuation of a named company.
3. Employers are anonymized: if the founder's history comes up, say "a global investment bank" or "a world-class PE-backed aggregator" — never the firm names. Career total is "150+ acquisitions".
4. Describe our work, never criticize competitors by name or category.
5. Display-grade brevity: every field must fit its length cap; tighten, don't truncate mid-thought.

Choosing (when template is "auto"): a strong number in the brief → stat; personal conviction/opinion → quote; a sector/market breakdown → thesis; a how-to/process → playbook.`;

export async function fillPostCard(
  brief: string,
  opts: { template?: PostCardTemplate | 'auto'; variant?: 'light' | 'dark' } = {},
): Promise<PostCardSpec> {
  const want = opts.template && opts.template !== 'auto' ? `\n\nUse template "${opts.template}".` : '\n\nChoose the best template for this brief.';
  const msg = await getClient().messages.create({
    model: HAIKU_MODEL,
    max_tokens: 900,
    system: SYSTEM,
    messages: [{ role: 'user', content: `BRIEF:\n${brief.slice(0, 6000)}${want}` }],
  });
  const text = msg.content.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Fill produced no JSON');
  const raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;

  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max).trim();
  const template = (['stat', 'quote', 'thesis', 'playbook'] as const).includes(raw.template as PostCardTemplate)
    ? (raw.template as PostCardTemplate)
    : 'quote';
  const spec: PostCardSpec = {
    template,
    variant: opts.variant === 'dark' ? 'dark' : 'light',
    kicker: str(raw.kicker, 40) || undefined,
    value: str(raw.value, 16) || undefined,
    claim: str(raw.claim, 180) || undefined,
    source: str(raw.source, 110) || undefined,
    quote: str(raw.quote, 300) || undefined,
    name: str(raw.name, 60) || undefined,
    role: str(raw.role, 80) || undefined,
    title: str(raw.title, 120) || undefined,
    rows: Array.isArray(raw.rows)
      ? (raw.rows as Array<{ k?: unknown; v?: unknown }>).slice(0, 4)
          .map(r => ({ k: str(r?.k, 40), v: str(r?.v, 170) }))
          .filter(r => r.k && r.v)
      : undefined,
    insight: str(raw.insight, 190) || undefined,
    steps: Array.isArray(raw.steps)
      ? (raw.steps as unknown[]).map(x => str(x, 150)).filter(Boolean).slice(0, 5)
      : undefined,
    footerTag: str(raw.footerTag, 90) || 'smbx.ai · Book a call',
    photo: null,
  };
  return spec;
}
