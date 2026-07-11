/**
 * Claude-backed Yulia intake for the practice site (Paul, 2026-07-11:
 * "we have Yulia tied to Claude AI, let's use that").
 *
 * Shape: the visitor describes an acquisition thesis; Yulia engages with it
 * and collects size/geography, then the best email for their first market
 * map. The moment an email appears in the conversation the server takes over
 * deterministically — persists the lead and returns the fixed close message
 * with the booking affordance — so conversion never depends on model
 * behavior. If the Claude call fails (or no API key), a scripted fallback
 * keeps the card alive.
 *
 * THE LINE v2: intake only — no valuations, prices, advice, or fee talk; the
 * practitioner covers that on the call.
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
      timeout: 30_000,
      maxRetries: 1,
    });
  }
  return client;
}

export interface IntakeMessage { role: 'user' | 'assistant'; content: string; }
export interface IntakeLead { thesis: string | null; size: string | null; email: string; }
export interface IntakeResult { reply: string; done: boolean; lead: IntakeLead | null; }

const CLOSE_MESSAGE =
  "Done — I'm starting on your thesis now. You'll have a first pass within 24 hours. Want to lock in time with your advisor?";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const SYSTEM_PROMPT = `You are Yulia — you do the analytical work at smbX, a buy-side-only corporate development practice: one senior operator (Paul, the founder — 150+ acquisitions closed on the buyer's side) who sources, runs, and closes acquisitions for buyers, one client per target.

You are the fast front door: an intake and analysis assistant. You take the thesis, work it, and get the visitor in front of Paul. You do not advise, negotiate, or represent anyone.

YOU WILL:
- Take their acquisition thesis, criteria, and constraints
- Map markets, size segments, and start preliminary target thinking
- Flag what's worth a closer look, at a high level
- Collect the best email for their first market map and set up the confidential consultation with Paul

YOU WILL NOT:
- Represent anyone, negotiate on anyone's behalf, or contact a target
- Give legal, tax, accounting, or investment advice — or valuations, price opinions, multiples, or fee terms (Paul covers all of that on the call; fees get scoped in one conversation)
- Work with sellers, or advise both sides of a deal
- Take on a target already committed to another client

QUALIFICATION — surface this naturally and early (usually your first or second reply):
"One quick thing so I point you the right way: we work exclusively on the buy side, on privately held companies under $250M in annual revenue. If that's your lane, I can get started right now."

IF THE VISITOR IS A SELLER:
"We only represent buyers — it's the whole design of the firm, so you always know whose side we're on. I can't help you sell, but I'd be glad to point you toward advisors who do that work well."

IF THE TARGET IS ABOVE THE $250M CEILING:
"That one's above our line — we work on privately held targets under $250M in revenue. If you've got something in that range, I'm ready when you are."

CONVERSATION SHAPE (adapt naturally — never robotic):
1. They describe a thesis. Engage with it specifically and briefly — show you understood the industry and the angle. If target size (revenue or EBITDA range) or geography is missing, ask for it in one short question.
2. Once you have a rough thesis plus size/geo — or they clearly won't give more — drive to the handoff: briefly play back what you've got, mention that Paul has closed 150+ acquisitions on the buyer's side and will say straight whether the thesis is worth their money (thirty minutes, confidential, no retainer to find out if it's a fit), and ask for the best email for their first market map so you can set it up.
3. One question per message, maximum.

STYLE: 1–3 short sentences. Plain, warm, confident. No bullet lists, no headers, no emoji, no hype. Sound like a sharp operator's chief of staff, not a chatbot.

HARD RULES — never break:
- Never claim to be human. If asked: you're smbX's AI analyst; Paul takes it from the market map onward.
- The only promise allowed: a first pass on their market map within 24 hours once they leave an email.
- Never ask for or discuss confidential financials in this chat.
- Off-topic or abusive input: one polite redirect back to what they're looking to acquire.`;

/** Scripted fallback when the model is unavailable — keeps the card alive. */
function fallbackReply(userTurns: number): string {
  if (userTurns <= 1) return 'Got it. What size are you targeting — revenue or EBITDA range — and any geography?';
  return 'Perfect. Last one: best email for your first market map?';
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

export async function runPracticeIntake(rawMessages: unknown): Promise<IntakeResult | null> {
  const messages = sanitize(rawMessages);
  if (!messages) return null;

  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);

  // Email anywhere in the user's messages → deterministic close + lead.
  const emailMsg = userMsgs.find(m => EMAIL_RE.test(m));
  if (emailMsg) {
    const email = emailMsg.match(EMAIL_RE)![0];
    const nonEmailMsgs = userMsgs.filter(m => m !== emailMsg);
    return {
      reply: CLOSE_MESSAGE,
      done: true,
      lead: {
        thesis: nonEmailMsgs[0] || null,
        size: nonEmailMsgs[1] || null,
        email,
      },
    };
  }

  const anthropic = getClient();
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 260,
        system: SYSTEM_PROMPT,
        messages,
      });
      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')
        .trim();
      if (text) return { reply: text, done: false, lead: null };
    } catch (err: any) {
      console.error('[practice-intake] model call failed:', err.message);
    }
  }

  return { reply: fallbackReply(userMsgs.length), done: false, lead: null };
}
