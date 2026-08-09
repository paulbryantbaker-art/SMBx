/**
 * Corp-dev documents derived from a market's master (Paul, 2026-07-26).
 *
 * "4 - do other work — market maps, who's who, thesis building or other corp
 * dev beginning work."
 *
 * This is the reframe that matters: a research lane is not a marketing-content
 * pipeline, it is the knowledge base for a MARKET. LinkedIn collateral is one
 * thing you draw off it; these are the others — and these are the actual
 * practice work, the thing an acquirer client is paying for.
 *
 * A derived document is an ARTIFACT, not a new entity. Read the master, write
 * the document, save it as markdown in the artifacts repository. That means it
 * is editable by hand (Paul will tune a thesis — he should), it renders through
 * the existing report builder, and it can seed collateral like any other
 * artifact. One chain, one renderer, no parallel machinery.
 *
 * THE LINE applies harder here than anywhere else in Studio, because these
 * documents go to acquirer clients rather than to LinkedIn. The prompts carry
 * the perimeter and the audit carries the numbers: every figure in a derived
 * document must appear in the master, or the document says where it came from.
 */
import { sql } from '../db.js';
import Anthropic from '@anthropic-ai/sdk';
import { figuresNotIn } from './researchLanes.js';
import { createArtifact } from './studioRepos.js';
import { assertSpendAllowed } from './apiSpend.js';

const MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // Corp-dev documents are derived in a Cowork session against the workspace
  // now — PLAYBOOK.md is the canonical spec and this file is the stale
  // duplicate of it (it lacks the target map entirely).
  assertSpendAllowed('studio', 'Corp-dev document generation');
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 600_000, maxRetries: 2 });
  }
  return client;
}

export type CorpDevDocType = 'market_map' | 'who_who' | 'thesis';

export const CORP_DEV_DOCS: { key: CorpDevDocType; label: string; blurb: string; artifactKind: string }[] = [
  {
    key: 'market_map',
    label: 'Market map',
    blurb: 'How the market is structured, who operates in it, and where the openings are.',
    artifactKind: 'market_map',
  },
  {
    key: 'who_who',
    label: "Who's who",
    blurb: 'The acquirers, sponsors, and operators active in the lane — and what each one is doing.',
    artifactKind: 'who_who',
  },
  {
    key: 'thesis',
    label: 'Investment thesis',
    blurb: 'The buy-side case: why this lane, what a platform looks like, what would kill it.',
    artifactKind: 'thesis',
  },
];

/**
 * THE LINE, in the voice these documents are written in.
 *
 * Every clause here is a real boundary from THE_LINE_POLICY.md, not decoration.
 * A derived document is client-facing work product, so an unlicensed opinion or
 * a specific-target valuation in one of these is the failure mode that actually
 * costs something.
 */
const PERIMETER = `PERIMETER — these are absolute, and a document that breaks one is unusable:
- BUY-SIDE ONLY. You write for an acquirer. Never advise a seller, never write from a neutral or two-sided position, never describe the practice as representing both sides.
- NO SPECIFIC-TARGET VALUATIONS. You may state market-level multiples and ranges the master reports, with their sources. You may NOT put a value, a price, or a "worth roughly X" on a named company.
- NO UNLICENSED OPINIONS. Nothing that reads as securities advice, tax advice, legal advice, or a formal appraisal. Where one is needed, say which specialist the client should engage and what to ask them — that is the correct move, not a hedge.
- NO FEE TALK. Never mention retainers, success fees, commissions, or any compensation.
- NO INVENTED FACTS. Every company, person, transaction, and number must come from the master document. If the master does not say it, you do not say it.
- Lower-middle-market framing: targets under $250M revenue.
- Never criticize a named competitor, bank, or advisor. Describe the work, not other people's work.`;

const CITATION_LAW = `CITATION LAW — mechanically checked after you write:
- Every figure you state must appear in the master document. Do not round, restate in different units, or "approximately" a number into a new one — a rounded figure reads as a different figure and will be flagged.
- Carry the master's attribution with the figure: the source name in parentheses, as the master gives it.
- If two sources in the master disagree, report BOTH values and cite both. Never split the difference into a number no source stated.
- If you must reason to a figure the master does not state, label it DERIVED and show the working — inputs, arithmetic, and the assumption — in a "## Derivations" section at the end. An inferred value is fine when it is explainable; an unexplained one is not.
- Where the master is thin on something the document needs, say so plainly under "## What we don't know yet". A named gap is useful; a confident guess is a liability.`;

const HOUSE_VOICE = `VOICE: senior corp-dev operator writing for an acquirer's principal. Factual, specific, unhurried. No hype, no consultant filler, no AI self-reference of any kind. Short paragraphs. Lead with what is true and what follows from it. Markdown: a single "# " title, then "## " sections. Prose over bullet soup — use tables where the content is genuinely tabular.`;

function promptFor(type: CorpDevDocType, laneLabel: string): string {
  const base = `You write buy-side corporate-development work product for smbX, a practice that runs acquisitions for acquirer clients. Your only source is the MASTER RESEARCH DOCUMENT the user provides, covering: ${laneLabel}.

${HOUSE_VOICE}

${PERIMETER}

${CITATION_LAW}`;

  if (type === 'market_map') {
    return `${base}

Write a MARKET MAP: how this market is actually structured and where an acquirer can enter it.

Sections, in this order:
# <the market>, mapped
## How the market is structured — the real segments, how work is won, what drives margin. Not a textbook description of the industry; the operating shape a buyer has to underwrite.
## Scale and fragmentation — the size and concentration figures the master reports, each with its source. State plainly what is known versus estimated.
## Who is consolidating — the platforms, strategics, and sponsor-backed roll-ups the master names, and what each is buying. Named entities only; no valuations of any of them.
## What a platform looks like here — the profile of a business worth building around: revenue quality, contract structure, customer concentration, licensure, workforce. Be specific to this trade.
## Where the openings are — the parts of the market the consolidators are not covering, and why. This is the section the client is paying for; make it a judgment, not a list.
## What would make us walk — the conditions that disqualify the lane or a target in it.
## What we don't know yet — the gaps in the current research, and what would close them.
## Derivations — only if you inferred any figure. Otherwise omit.`;
  }

  if (type === 'who_who') {
    return `${base}

Write a WHO'S WHO: the participants in this market and what each is actually doing.

Only include entities the master names. If the master names few, write a short honest document rather than padding it with invented participants.

Sections, in this order:
# Who's who in <the market>
## Strategic acquirers — the operating companies buying in this lane. For each: what they own, what they have been acquiring, and what that implies about how they compete for deals.
## Sponsor-backed platforms — private-equity-backed consolidators the master names, with their backer where stated, and the pattern of what they buy.
## Notable independents — significant operators not yet consolidated. These are the market, and often the targets.
## Who else is at the table — advisors, lenders, insurers, associations, and regulators that show up in a deal in this trade, and what each one gates.
## What this tells a buyer — how the participant set shapes competition for assets and where a disciplined acquirer has an advantage.
## What we don't know yet
## Derivations — only if you inferred any figure. Otherwise omit.

Formatting: use a markdown table for each participant group where the master gives you enough per entity (name, what they own/back, recent activity). Prose where it does not.`;
  }

  return `${base}

Write an INVESTMENT THESIS: the buy-side case for this market, stated so a principal can act on it or reject it.

A thesis that cannot be falsified is worthless. Make yours specific enough to be wrong.

Sections, in this order:
# <the market>: investment thesis
## The thesis in one paragraph — the claim, stated plainly. What we believe and what follows.
## Why this market, now — the structural conditions that make the timing real, with figures and sources. Distinguish durable structure from cyclical noise.
## What we would buy — the acquisition profile: size, revenue mix, contract structure, geography, owner situation. Concrete enough to screen against.
## How value is created after close — the specific operating moves that justify the price, in this trade. Not generic "professionalize the back office" — what actually moves margin here.
## What has to be true — the load-bearing assumptions, each stated so it can be tested. If one of these is false, the thesis fails.
## What would kill it — the real risks: regulatory, labour, customer concentration, technology, cycle. Name the ones specific to this trade, not a generic risk register.
## How we would test it — the diligence that would confirm or break the thesis, and the order to do it in.
## What we don't know yet
## Derivations — only if you inferred any figure. Otherwise omit.`;
}

function harvest(content: any[]): string {
  let out = '';
  for (const b of content ?? []) if (b?.type === 'text' && typeof b.text === 'string') out += b.text;
  return out.trim();
}

export interface DeriveResult {
  artifactId: number;
  title: string;
  /** Figures in the document that appear in no source and carry no derivation. */
  uncited: string[];
  usage: { inputTokens: number; outputTokens: number; attempts: number };
}

/**
 * Derive a corp-dev document from a lane's master.
 *
 * Same discipline as lane synthesis: write, audit mechanically, retry ONCE with
 * the offenders named, keep the retry only if it improved, then save either way
 * with the survivors reported rather than swallowed. Losing the draft would be
 * worse than surfacing a flawed one — but it must never pass as clean.
 */
export async function deriveCorpDevDoc(opts: {
  userId: number;
  laneId: number;
  type: CorpDevDocType;
}): Promise<DeriveResult> {
  const [lane] = await sql<{ id: number; label: string; master_md: string | null; master_version: number }[]>`
    SELECT id, label, master_md, master_version FROM research_lanes
    WHERE id = ${opts.laneId} AND user_id = ${opts.userId}`;
  if (!lane) throw new Error('Market not found');
  if (!lane.master_md) throw new Error('This market has no master document yet — synthesize the research first.');

  const spec = CORP_DEV_DOCS.find(d => d.key === opts.type);
  if (!spec) throw new Error('Unknown document type');

  const master = lane.master_md;
  const system = promptFor(opts.type, lane.label);
  let inTok = 0, outTok = 0, attempts = 0;

  const write = async (correction?: string): Promise<string> => {
    attempts++;
    const resp = await getClient().messages
      .stream({
        model: MODEL,
        max_tokens: 16000,
        system,
        messages: [{
          role: 'user',
          content: correction
            ? `The master research document:\n\n${master.slice(0, 180000)}\n\nYour previous draft broke the citation law:\n${correction}\n\nRewrite it in full. Every figure must appear in the master exactly as the master states it, or be labelled DERIVED with its working in a Derivations section.`
            : `The master research document:\n\n${master.slice(0, 180000)}`,
        }],
      })
      .finalMessage();
    inTok += resp.usage?.input_tokens ?? 0;
    outTok += resp.usage?.output_tokens ?? 0;
    return harvest(resp.content as any[]);
  };

  let md = await write();
  if (!md || md.length < 400) throw new Error('The document came back empty — try again.');

  // The audit ignores anything registered in Derivations, exactly as the master
  // audit does: an inferred figure with stated working is legitimate work.
  const registered = (doc: string) => {
    const m = doc.match(/##\s*Derivations[\s\S]*$/i);
    return m ? m[0] : '';
  };
  const check = (doc: string) => figuresNotIn(doc.replace(registered(doc), ''), master + '\n' + registered(doc));

  let uncited = check(md);
  if (uncited.length) {
    const retry = await write(`These figures appear nowhere in the master and have no Derivations entry: ${uncited.join(', ')}.`);
    if (retry && retry.length >= 400) {
      const after = check(retry);
      if (after.length < uncited.length) { md = retry; uncited = after; }
    }
  }

  const title = (md.match(/^#\s+(.+)$/m)?.[1] || `${spec.label} — ${lane.label}`).trim().slice(0, 160);
  const artifactId = await createArtifact(opts.userId, {
    label: title,
    bodyMd: md,
    kind: spec.artifactKind,
    laneId: lane.id,
    laneVersion: lane.master_version,
  });
  if (uncited.length) {
    console.warn(`[corpdev] ${spec.key} for lane ${lane.id} saved with ${uncited.length} unexplained figure(s): ${uncited.slice(0, 6).join(', ')}`);
  }
  return { artifactId, title, uncited, usage: { inputTokens: inTok, outputTokens: outTok, attempts } };
}

/** Corp-dev documents already derived for a market, newest per type first. */
export async function listCorpDevDocs(userId: number, laneId: number) {
  const kinds = CORP_DEV_DOCS.map(d => d.artifactKind);
  return sql`
    SELECT id, kind, label, lane_version, updated_at,
           length(body_md) AS chars
    FROM studio_artifacts
    WHERE user_id = ${userId} AND lane_id = ${laneId}
      AND kind = ANY(${kinds}) AND archived = FALSE
    ORDER BY updated_at DESC`;
}
