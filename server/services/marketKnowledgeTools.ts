/**
 * Yulia reads the markets (Paul, 2026-07-26).
 *
 * He clocked what the market workspace actually is: "so this effectively is
 * like notebook LM by Google but designed for me to run corp dev with?" — and
 * the one thing it lacked against that comparison was the ability to
 * INTERROGATE the knowledge base. You could read the master or generate one of
 * six fixed documents; you could not ask it a question.
 *
 * Yulia is already the chat surface and already has 35 tools. She just could
 * not see the research. These tools close that: list the markets, read a
 * section of a master, search across one. Grounded in Paul's own research,
 * carrying its citations, with no web access in the loop.
 *
 * WHY SECTIONS AND SEARCH RATHER THAN "HERE IS THE WHOLE DOCUMENT": a master
 * runs to tens of thousands of words and is refreshed quarterly. Pushing all of
 * it into every turn would be slow and expensive for a question that usually
 * needs one section. So the tools let her navigate — headings first, then the
 * part that answers the question — the way a person uses a long document.
 */
import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { sql } from '../db.js';

export const MARKET_KNOWLEDGE_TOOLS: Tool[] = [
  {
    name: 'list_markets',
    description:
      'List the research markets (lanes) the user keeps master documents for, with each master\'s version and how fresh it is. Call this FIRST whenever the user asks about a market, an industry, a trade, or "what do we know about X" — the answer should come from their own research, not from your general knowledge. Also call it when the user asks what markets they cover.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'read_market',
    description:
      'Read a market\'s master research document. Without `section`, returns the title plus the list of section headings and an excerpt — use that to see what the document covers, then call again with the heading you need. With `section`, returns that section in full. The master is the synthesis of every research document the user uploaded, and its figures carry their sources: quote them WITH the attribution the document gives. Never state a number from this document without its source.',
    input_schema: {
      type: 'object' as const,
      properties: {
        marketId: { type: 'number', description: 'The market (lane) id from list_markets' },
        section: { type: 'string', description: 'Optional: a section heading, or part of one. Case-insensitive.' },
      },
      required: ['marketId'],
    },
  },
  {
    name: 'search_market',
    description:
      'Search a market\'s master document for a term — a company name, a figure, a regulation, a geography — and get back the passages that mention it with their surrounding context. Use this when the user asks about something specific rather than about a whole section. Returns nothing if the master does not mention it, which is itself the answer: say the research does not cover it rather than filling the gap from your own knowledge.',
    input_schema: {
      type: 'object' as const,
      properties: {
        marketId: { type: 'number', description: 'The market (lane) id from list_markets' },
        query: { type: 'string', description: 'What to look for' },
      },
      required: ['marketId', 'query'],
    },
  },
];

/** Section headings and their bodies, in document order. */
function sections(md: string): { heading: string; body: string }[] {
  const lines = md.split('\n');
  const out: { heading: string; body: string }[] = [];
  let cur: { heading: string; body: string[] } | null = null;
  for (const line of lines) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line);
    if (m) {
      if (cur) out.push({ heading: cur.heading, body: cur.body.join('\n').trim() });
      cur = { heading: m[2].trim(), body: [] };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) out.push({ heading: cur.heading, body: cur.body.join('\n').trim() });
  return out;
}

async function loadMaster(userId: number, marketId: number) {
  const [lane] = await sql<{ id: number; label: string; master_md: string | null; master_title: string | null; master_version: number; synthesized_at: string | null; synthesis_status: string }[]>`
    SELECT id, label, master_md, master_title, master_version, synthesized_at, synthesis_status
    FROM research_lanes WHERE id = ${marketId} AND user_id = ${userId}`;
  return lane || null;
}

/** How old the research is — a stale master is a different claim than a fresh
 *  one, and Yulia should say so rather than quoting it flat. */
function freshness(synthesizedAt: string | null): string {
  if (!synthesizedAt) return 'never synthesized';
  const days = Math.floor((Date.now() - new Date(synthesizedAt).getTime()) / 86_400_000);
  if (days <= 1) return 'updated today';
  if (days < 45) return `updated ${days} days ago`;
  const months = Math.round(days / 30);
  return months >= 6
    ? `LAST UPDATED ${months} MONTHS AGO — treat as dated and say so`
    : `updated ~${months} months ago`;
}

export async function executeMarketKnowledgeTool(
  toolName: string,
  input: Record<string, any>,
  userId: number,
): Promise<string> {
  if (toolName === 'list_markets') {
    const lanes = await sql<any[]>`
      SELECT id, label, master_title, master_version, synthesized_at, synthesis_status,
             (master_md IS NOT NULL) AS has_master, length(master_md) AS chars
      FROM research_lanes WHERE user_id = ${userId} AND archived = FALSE
      ORDER BY updated_at DESC`;
    if (!lanes.length) {
      return 'No research markets yet. The user builds one in Studio: create a market, upload the research they ran elsewhere, then synthesize it into a master document.';
    }
    return JSON.stringify(lanes.map((l: any) => ({
      marketId: l.id,
      market: l.label,
      master: l.has_master ? (l.master_title || l.label) : null,
      version: l.master_version,
      words: l.chars ? Math.round(l.chars / 5) : 0,
      freshness: freshness(l.synthesized_at),
      // A parked master failed its citation audit — anything quoted from it
      // needs that caveat attached, not a confident restatement.
      caution: l.synthesis_status === 'needs_review'
        ? 'This master FAILED its citation audit and is parked for review — flag that before relying on its figures.'
        : undefined,
    })), null, 2);
  }

  const marketId = Number(input?.marketId);
  if (!Number.isInteger(marketId)) return 'Error: marketId is required. Call list_markets first.';
  const lane = await loadMaster(userId, marketId);
  if (!lane) return 'Error: no such market for this user.';
  if (!lane.master_md) return `The market "${lane.label}" has no master document yet — the user needs to upload research and synthesize it in Studio.`;

  const head = `Market: ${lane.label}\nMaster: ${lane.master_title || lane.label} (v${lane.master_version}, ${freshness(lane.synthesized_at)})`;
  const warn = lane.synthesis_status === 'needs_review'
    ? '\nCAUTION: this master failed its citation audit and is parked for review. Flag that before relying on its figures.'
    : '';

  if (toolName === 'read_market') {
    const secs = sections(lane.master_md);
    const want = String(input?.section || '').trim().toLowerCase();
    if (!want) {
      return `${head}${warn}\n\nSections:\n${secs.map((s, i) => `${i + 1}. ${s.heading}`).join('\n')}\n\nOpening:\n${lane.master_md.slice(0, 1800)}\n\n[Call read_market again with a section heading for the full text of one.]`;
    }
    const hit = secs.filter(s => s.heading.toLowerCase().includes(want));
    if (!hit.length) {
      return `${head}${warn}\n\nNo section matches "${input.section}". Sections are:\n${secs.map(s => `- ${s.heading}`).join('\n')}`;
    }
    return `${head}${warn}\n\n${hit.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n').slice(0, 24000)}`;
  }

  if (toolName === 'search_market') {
    const q = String(input?.query || '').trim();
    if (!q) return 'Error: query is required.';
    const needle = q.toLowerCase();
    const lines = lane.master_md.split('\n');
    const hits: string[] = [];
    for (let i = 0; i < lines.length && hits.length < 24; i++) {
      if (!lines[i].toLowerCase().includes(needle)) continue;
      // Context either side, so a figure keeps the sentence that sources it.
      hits.push(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n').trim());
    }
    if (!hits.length) {
      return `${head}${warn}\n\nThe master does not mention "${q}". Say the research does not cover it — do not answer from general knowledge.`;
    }
    return `${head}${warn}\n\n${hits.length} passage(s) mentioning "${q}":\n\n${hits.join('\n\n---\n\n').slice(0, 20000)}`;
  }

  return `Error: unknown market tool ${toolName}`;
}

export const MARKET_TOOL_NAMES = new Set(MARKET_KNOWLEDGE_TOOLS.map(t => t.name));
