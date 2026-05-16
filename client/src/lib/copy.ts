/* Audience-keyed copy resolver.
   Single source of truth for every section title, eyebrow, hero subtitle,
   and CTA that varies by audience. The shipped app today is buyer-shaped —
   this resolver lets each surface read its strings through `copyFor(audience)`
   and the right variant lands.

   Voice rules (from SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md §Yulia voice):
     - Direct, not deferential
     - Specific, not vague (real numbers / nouns where possible)
     - Proactive, not reactive
     - Human-warm, not corporate

   Adding a new copy slot:
     1. Add the key to the `Copy` type below.
     2. Provide a value for every audience in `COPY` (4 entries).
     3. (Optional) Pull a default from the `buy` row at first and refine
        the others once you've talked to the people doing those journeys.
*/

import { type Audience } from "./audience";

/** Single tip chip shown to replace the marketing learn chips. Each
    chip opens chat with its prompt. */
export interface TipChip {
  label: string;
  prompt: string;
}

export interface Copy {
  /** Today screen — logged-out subtitle under the welcome hero. */
  todayHeroTag: string;

  /** Today screen — eyebrow over the daily intel section. */
  todayIntelEyebrow: string;
  /** Today screen — title of the daily intel section. */
  todayIntelTitle: string;
  /** Today screen — sub under the intel title. */
  todayIntelSub: string;

  /** Today screen — eyebrow over the brief teaser. */
  todayBriefEyebrow: string;
  /** Today screen — title of the brief teaser. */
  todayBriefTitle: string;
  /** Today screen — sub under the brief title. */
  todayBriefSub: string;

  /** Replaces the buyer-flavored marketing chips (How it works · Pricing ·
      Compare plans) with three persona-tip chips that open chat with a
      specific prompt. */
  todayTips: TipChip[];
}

export const LOGGED_OUT_HERO_COPY = {
  headline: "Connect sourcing, diligence, execution, and value creation in one workflow.",
  tagline:
    "smbX.ai connects institutional deal intelligence, workflow execution, and continuous transaction context across the deal lifecycle — from sourcing and diligence through post-close value realization.",
};

/* ─── COPY TABLE ────────────────────────────────────────────
   Four journeys, each with hero tag, intel section, brief teaser, and
   three tip chips. Designed to be uniform shape — buy/sell/raise/pmi all
   read the same fields, so screens render symmetrically without
   per-journey conditionals. */
const COPY: Record<Audience, Copy> = {
  /* ─── Buying a business ─── */
  buy: {
    todayHeroTag: LOGGED_OUT_HERO_COPY.tagline,
    todayIntelEyebrow: "VIEW SAMPLE · IN PIPELINE",
    todayIntelTitle: "5 deals Yulia is working",
    todayIntelSub: "Tap any to see what Yulia delivered — verdict, recast, drafts.",
    todayBriefEyebrow: "VIEW SAMPLE · YULIA'S BRIEF",
    todayBriefTitle: "Review 3 picks in 5 minutes",
    todayBriefSub: "See how Yulia screens 142 sources down to what matters — every morning.",
    todayTips: [
      { label: "How Yulia scores a deal", prompt: "How does Yulia score a deal? Walk me through what goes into the Fit Score." },
      { label: "Capital stack 101",       prompt: "I'm looking at an acquisition — how should I think about the capital stack and SBA financing?" },
      { label: "Your first LOI",          prompt: "Help me understand what an LOI is and what should be in mine." },
    ],
  },

  /* ─── Selling a business ─── */
  sell: {
    todayHeroTag: LOGGED_OUT_HERO_COPY.tagline,
    todayIntelEyebrow: "VIEW SAMPLE · BUYER INTEREST",
    todayIntelTitle: "Where your sale stands",
    todayIntelSub: "Buyer activity, signals from Yulia, and what to push on this week.",
    todayBriefEyebrow: "VIEW SAMPLE · TODAY",
    todayBriefTitle: "3 things to push your sale forward",
    todayBriefSub: "Concrete actions — not generic checklists.",
    todayTips: [
      { label: "What's my business worth?", prompt: "Give me a real range for what my business is worth. I'll share the numbers." },
      { label: "Get deal-ready",            prompt: "What do I need to fix before I'm ready to talk to a buyer or list with a broker?" },
      { label: "Negotiating the first IOI", prompt: "I just got an IOI. Walk me through what's standard, what's aggressive, and what to push back on." },
    ],
  },

  /* ─── Raising capital (minority stake / growth equity) ─── */
  raise: {
    todayHeroTag: LOGGED_OUT_HERO_COPY.tagline,
    todayIntelEyebrow: "VIEW SAMPLE · INVESTOR INTEREST",
    todayIntelTitle: "Where your round stands",
    todayIntelSub: "Soft-circled commitments, term sheet variance, and what to push on this week.",
    todayBriefEyebrow: "VIEW SAMPLE · TODAY",
    todayBriefTitle: "3 investors worth a follow-up",
    todayBriefSub: "Engaged but not yet committed — Yulia drafts the next message.",
    todayTips: [
      { label: "Build the pitch deck",       prompt: "Help me build the pitch deck Yulia thinks growth equity will actually read." },
      { label: "What investors look for",    prompt: "What do growth equity investors look for in a business at my stage?" },
      { label: "Term sheet pitfalls",        prompt: "Walk me through the term sheet terms I should push back on and the ones I shouldn't." },
    ],
  },

  /* ─── PMI — post-close integration ─── */
  pmi: {
    todayHeroTag: LOGGED_OUT_HERO_COPY.tagline,
    todayIntelEyebrow: "VIEW SAMPLE · INTEGRATION",
    todayIntelTitle: "Day N — integration health",
    todayIntelSub: "What's stabilized, what's at risk, and what's worth your attention today.",
    todayBriefEyebrow: "VIEW SAMPLE · TODAY",
    todayBriefTitle: "3 risks to address today",
    todayBriefSub: "From your 100-day plan, sorted by urgency.",
    todayTips: [
      { label: "Day 1 communication",        prompt: "Help me draft a Day 1 employee communication for the business I just acquired." },
      { label: "Stabilization checklist",    prompt: "What should I be doing in the first two weeks post-close to stabilize the business?" },
      { label: "When to make org changes",   prompt: "How long should I wait before making any organizational changes?" },
    ],
  },
};

/** Resolve copy for a given audience. */
export function copyFor(a: Audience): Copy {
  return COPY[a];
}
