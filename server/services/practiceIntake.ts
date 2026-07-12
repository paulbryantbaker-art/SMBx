/**
 * Claude-backed intake for the practice site — publicly labeled the
 * "smbX Target Mapping Engine" (Paul's copy update, 2026-07-12: the Yulia
 * name stays app-side; the public surface speaks as the firm's system).
 *
 * Shape (Market Map spec, 2026-07-12): the visitor describes an acquisition
 * thesis; Yulia collects size/geography, then delivers the MARKET MAP — an
 * 8-block research artifact (thesis, universe funnel, economics, competitive
 * picture, the insight, kill conditions, what an engagement produces,
 * sources) — BEFORE asking for anything. The moment an email appears the
 * server takes over deterministically: persists the lead, runs the honest
 * lane-conflict check against ENGAGED_LANES, and returns the fixed close, so
 * conversion never depends on model behavior. If the Claude call fails (or no
 * API key), a scripted fallback keeps the card alive.
 *
 * Governing rules (from the spec, enforced in the prompt):
 *  - Give the WHAT, withhold the WHO — market structure yes, named targets no.
 *  - Tell them when the thesis is bad (VERDICT: PUSHBACK), for free.
 *  - Never fake precision — ~ranges only, labeled directional; the sources
 *    footer is a server constant so the model can never invent citations.
 *
 * THE LINE v2: intake only — no specific-target valuations, no advice, no fee
 * talk; market-level structure and rough trading ranges are research
 * commentary, and the practitioner covers the rest on the call.
 */
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 16;
const MAX_MSG_CHARS = 800;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
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

export interface IntakeMessage { role: 'user' | 'assistant'; content: string; }
export interface IntakeLead { thesis: string | null; size: string | null; email: string; }

export interface MapFunnelStep { n: string; label: string; }
export interface IntakeMap {
  title: string;
  thesis: string;
  verdict: 'PROCEED' | 'PUSHBACK';
  answer: string;          // PUSHBACK only — the straight answer, up top
  funnel: MapFunnelStep[]; // the narrowing: universe → size band → fit
  econ: string;
  comp: string;
  insight: string;         // "what most buyers miss" — the punchline
  kill: string;            // what would kill this thesis
  produces: string;        // server-composed — what an engagement produces
  sources: string;         // server constant — never model-authored
}

export interface IntakeResult {
  reply: string;
  done: boolean;
  lead: IntakeLead | null;
  map: IntakeMap | null;
}

/** The sources footer is deliberately NOT model output: the model must never
 *  invent citations. Today the counts are model estimates and the footer says
 *  so; when the sourcing engine feeds real counts, this one string earns the
 *  primary-source citations. */
export const MAP_SOURCES =
  'Directional estimates from public industry data and smbX deal experience. Counts and ranges are preliminary (~) — an engagement verifies them against primary sources.';

/** "What an engagement produces" — the honest gap, stated plainly. Composed
 *  with the funnel's final count when available. */
export function composeProduces(map: { funnel: MapFunnelStep[] }): string {
  const last = map.funnel[map.funnel.length - 1];
  const list = last && last.n !== '—' ? `the named list of ${last.n} qualified targets` : 'the named target list';
  return `This map is the territory. An engagement produces ${list}, the owner research, the off-market outreach under our firm's name, the models and diligence, and the negotiation to close.`;
}

/** Parse the ===MAP=== artifact out of a model reply. Returns the map (if
 *  well-formed) plus the plain text around it; on any malformation the whole
 *  reply falls back to a normal chat message. */
export function parseMap(text: string): { map: IntakeMap | null; rest: string } {
  const start = text.indexOf('===MAP===');
  const end = text.indexOf('===END===');
  if (start === -1 || end === -1 || end <= start) return { map: null, rest: text };
  const block = text.slice(start + '===MAP==='.length, end);
  const FIELDS = ['TITLE', 'THESIS', 'VERDICT', 'ANSWER', 'U1', 'U2', 'U3', 'ECON', 'COMP', 'INSIGHT', 'KILL'];
  const field = (name: string): string => {
    const m = block.match(new RegExp(`^\\s*${name}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${FIELDS.join('|')}):|$)`, 'm'));
    return m ? m[1].trim().replace(/\s+/g, ' ') : '';
  };
  const step = (name: string): MapFunnelStep | null => {
    const raw = field(name);
    if (!raw) return null;
    const bar = raw.indexOf('|');
    if (bar === -1) return { n: '—', label: raw.trim() };
    const n = raw.slice(0, bar).trim();
    const label = raw.slice(bar + 1).trim();
    if (!label) return null;
    return { n: n || '—', label };
  };
  const funnel = [step('U1'), step('U2'), step('U3')].filter((s): s is MapFunnelStep => s !== null);
  const verdict = field('VERDICT').toUpperCase() === 'PUSHBACK' ? 'PUSHBACK' : 'PROCEED';
  const partial = {
    title: field('TITLE'),
    thesis: field('THESIS'),
    verdict: verdict as 'PROCEED' | 'PUSHBACK',
    answer: field('ANSWER'),
    funnel,
    econ: field('ECON'),
    comp: field('COMP'),
    insight: field('INSIGHT'),
    kill: field('KILL'),
  };
  if (!partial.title || !partial.thesis || partial.funnel.length < 3 || !partial.insight) {
    return { map: null, rest: text };
  }
  const map: IntakeMap = { ...partial, produces: composeProduces(partial), sources: MAP_SOURCES };
  const before = text.slice(0, start).trim();
  const after = text.slice(end + '===END==='.length).trim();
  const rest = [before, after].filter(Boolean).join(' ')
    || 'Preliminary analysis complete. Please provide an email address to receive the full market map.';
  return { map, rest };
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/** Honest lane-conflict check. ENGAGED_LANES is the register of lanes the
 *  practice has actually taken off the board — comma-separated keyword
 *  groups, e.g. "hvac phoenix, plumbing dallas". A lane matches when every
 *  keyword in the group appears in the conversation. Empty register (launch
 *  state) → every lane is genuinely open, so saying so is true. */
export function laneConflict(conversationText: string): boolean {
  const lanes = (process.env.ENGAGED_LANES || '')
    .split(',')
    .map(l => l.trim().toLowerCase())
    .filter(Boolean);
  if (lanes.length === 0) return false;
  const hay = conversationText.toLowerCase();
  return lanes.some(lane => lane.split(/\s+/).every(word => hay.includes(word)));
}

function closeMessage(email: string, conflict: boolean): string {
  const delivery = `Map generated. Our team will send the full version to ${email} within 24 hours.`;
  if (conflict) {
    return `${delivery}\n\nNote: We take one client per target market, and your lane may overlap an active engagement. We will clarify this overlap during your consultation to protect our clients' pipelines.`;
  }
  return `${delivery}\n\nNote: We take one client per target market, and this lane is currently open. A 30-minute confidential consultation is required to formalize exclusivity.`;
}

const SYSTEM_PROMPT = `You are the smbX Target Mapping Engine — the public intake surface of smbX, a buy-side-only corporate development practice: one senior deal team (led by founder Paul Baker — 150+ acquisitions closed on the buyer's side) that sources, runs, and closes acquisitions for buyers, one client per target.

You are the fast front door: an analysis engine. You take the thesis, work it into a preliminary MARKET MAP — a real piece of research, free — and get the visitor in front of the senior team. You do not advise, negotiate, or represent anyone.

YOU WILL:
- Take their acquisition thesis, criteria, and constraints
- Deliver a preliminary market map: structure, universe, economics, competitive picture, risks
- Tell them plainly when the thesis is weak — before they've spent a dollar
- Collect the delivery email for the full map and point to the confidential consultation with our senior deal team

YOU WILL NOT:
- Represent anyone, negotiate on anyone's behalf, or contact a target
- Name target companies or hand over a target list — the market structure is free, the named targets are what an engagement produces
- Give legal, tax, accounting, or investment advice — or valuations of a specific business, or fee terms (our team scopes the economics in the first conversation)
- Work with sellers, or advise both sides of a deal

QUALIFICATION — surface this naturally and early (usually your first or second reply):
"Confirming alignment: smbX works exclusively on buy-side mandates for privately held targets under $250M in revenue. If this fits your mandate, we will process your criteria now."

IF THE VISITOR IS A SELLER:
"Mandate conflict: smbX exclusively represents buyers. This ensures our clients always know whose side we are on. We cannot process sell-side mandates, but recommend seeking a dedicated sell-side advisor."

IF THE TARGET IS ABOVE THE $250M CEILING:
"Mandate out of scope: smbX focuses exclusively on privately held targets under $250M in revenue."

CONVERSATION SHAPE (adapt naturally — never robotic). The rule underneath: GIVE VALUE BEFORE ASKING FOR ANYTHING. The visitor gets the map BEFORE you ask for an email.
1. They describe a thesis. Engage with it specifically and briefly. If target size (revenue or EBITDA range) or geography is missing, ask for it in one short question, with the reason ("so the map matches your thesis").
2. THE MAP — as soon as you have a rough thesis plus size or geography (usually after one or two exchanges; don't drag it out), your next message IS the map. It renders on the visitor's screen as a titled research document that assembles as you write it, so output it in EXACTLY this structure, fields in this order:
===MAP===
TITLE: <4–8 word document title, e.g. "Commercial Landscaping — Southeast">
THESIS: <their thesis as crisp coordinates, e.g. "Commercial landscaping · GA, NC, SC, TN · $2–8M EBITDA · commercial-contract mix">
VERDICT: <PROCEED or PUSHBACK>
ANSWER: <PUSHBACK only — the straight answer in one or two sentences, e.g. "I'd push back on this thesis, and I'd rather tell you now than after a retainer.". Omit the line entirely for PROCEED.>
U1: <count> | <the widest universe, e.g. "~2,400 | operators in the four-state footprint">
U2: <count> | <narrowed by their size band>
U3: <count> | <narrowed to real fit — "the ones actually worth your time">
ECON: <2–3 sentences: roughly what this niche trades at (a range, e.g. "roughly 4–6× SDE at this size"), what drives premiums, what drives discounts>
COMP: <2–3 sentences: who else is hunting this lane and how crowded it is — institutional vs. independent activity, where the heat is>
INSIGHT: <3–4 sentences: the ONE non-obvious, specific, operational thing most buyers miss in this market. This is the punchline — the block where they decide a person with real deal experience is behind this. Route density, contract structure, crew/tech retention, owner-dependence, seasonality, channel mix — whatever is genuinely load-bearing HERE. Never a platitude.>
KILL: <1–2 sentences: the conditions under which you'd advise walking away from this thesis — checkable ones>
===END===
<then 1–2 plain sentences in system voice: ask for the delivery email so our team can send the full map within 24 hours, and note the next step — a 30-minute confidential consultation with our senior deal team, no retainer>
3. One question per message, maximum. After the map, your only goal is the email; answer questions helpfully but keep steering there. Never repeat the ===MAP=== block once delivered.

THE MAP — ACCURACY RULES (these are hard):
- Counts and ranges are DIRECTIONAL ESTIMATES: always ~rounded ("~2,400", "~180", "roughly 5–7×"), never precise-sounding numbers ("183", "5.4×"). Estimate honestly from what you know of the trade; if you genuinely cannot estimate a count responsibly, write that funnel line as "— | <what the full map will establish there>" instead of inventing one.
- NEVER name a target company. In COMP you may name major, widely known consolidators or platforms when you are confident they are real and active in that lane; when unsure, describe the buyer landscape without names.
- Never state a valuation of a specific business — market-level trading ranges only.
- If the thesis is a market you know little about, say so plainly in prose and deliver the map with what you can defend.
- The map is preliminary and directional — never present it as the finished work.

THE PUSHBACK (VERDICT: PUSHBACK) — when the lane is saturated, bid up, or structurally against them (institutional platforms paying multiples they can't match, consolidation already done, their size band outgunned), SAY SO. Lead with ANSWER. Use the funnel and COMP to show the crowding evidence. Use INSIGHT to point where the same capital works better — adjacent fragmented niches with similar economics. Use KILL for what would change your mind. This candor costs a bad deal and wins the relationship — it is the most valuable map you can deliver.

STYLE: outside the map, 1–3 short sentences. Concise, professional, first person plural ("we", "our team"). No bullet lists, no headers, no emoji, no hype, no chattiness. You are a system with a firm behind it — never give yourself a name or a persona.

HARD RULES — never break:
- Never claim to be human. If asked: you're smbX's automated analysis engine; the senior deal team takes it from the market map onward.
- The only promise allowed: the full map within 24 hours once they leave an email.
- Never ask for or discuss confidential financials in this chat.
- Off-topic or abusive input: one polite redirect back to what they're looking to acquire.`;

/** Scripted fallback when the model is unavailable — keeps the card alive. */
function fallbackReply(userTurns: number): string {
  if (userTurns <= 1) return 'Please specify your target size (revenue or EBITDA) and geographic focus.';
  return 'Please provide a valid email address to receive your market map.';
}

function sanitize(messages: unknown): IntakeMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  const out: IntakeMessage[] = [];
  for (const m of messages) {
    const role = (m as any)?.role;
    const content = (m as any)?.content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const trimmed = content.trim().slice(0, MAX_MSG_CHARS);
    if (!trimmed) return null;
    out.push({ role, content: trimmed });
  }
  if (out[out.length - 1].role !== 'user') return null;
  return out;
}

function deterministicClose(messages: IntakeMessage[]): IntakeResult | null {
  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
  const emailMsg = userMsgs.find(m => EMAIL_RE.test(m));
  if (!emailMsg) return null;
  const email = emailMsg.match(EMAIL_RE)![0];
  const nonEmailMsgs = userMsgs.filter(m => m !== emailMsg);
  const conflict = laneConflict(messages.map(m => m.content).join('\n'));
  return {
    reply: closeMessage(email, conflict),
    done: true,
    lead: {
      thesis: nonEmailMsgs[0] || null,
      size: nonEmailMsgs[1] || null,
      email,
    },
    map: null,
  };
}

function resultFromText(text: string): IntakeResult {
  const { map, rest } = parseMap(text);
  return { reply: rest, done: false, lead: null, map };
}

/**
 * Non-streaming intake — the fallback transport (and the simplest test
 * surface). Same contract as the streaming runner.
 */
export async function runPracticeIntake(rawMessages: unknown): Promise<IntakeResult | null> {
  const messages = sanitize(rawMessages);
  if (!messages) return null;

  const closed = deterministicClose(messages);
  if (closed) return closed;

  const anthropic = getClient();
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1400, // headroom for the full 8-block map
        system: SYSTEM_PROMPT,
        messages,
      });
      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')
        .trim();
      if (text) return resultFromText(text);
    } catch (err: any) {
      console.error('[practice-intake] model call failed:', err.message);
    }
  }

  return { reply: fallbackReply(messages.filter(m => m.role === 'user').length), done: false, lead: null, map: null };
}

/**
 * Streaming intake — emits raw model text as it generates so the client can
 * assemble the map in front of the visitor (the reveal is REAL work made
 * legible, never a staged spinner). onDelta receives each text chunk; the
 * returned result is authoritative (server-side parse).
 */
export async function runPracticeIntakeStream(
  rawMessages: unknown,
  onDelta: (chunk: string) => void,
): Promise<IntakeResult | null> {
  const messages = sanitize(rawMessages);
  if (!messages) return null;

  const closed = deterministicClose(messages);
  if (closed) return closed;

  const anthropic = getClient();
  if (anthropic) {
    try {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 1400,
        system: SYSTEM_PROMPT,
        messages,
      });
      let text = '';
      stream.on('text', chunk => {
        text += chunk;
        try { onDelta(chunk); } catch { /* client gone — final still returns */ }
      });
      await stream.finalMessage();
      const trimmed = text.trim();
      if (trimmed) return resultFromText(trimmed);
    } catch (err: any) {
      console.error('[practice-intake] stream failed:', err.message);
    }
  }

  return { reply: fallbackReply(messages.filter(m => m.role === 'user').length), done: false, lead: null, map: null };
}
