/* Audience-keyed copy resolver.
   Single source of truth for every section title, eyebrow, hero subtitle,
   and CTA that varies by audience. The shipped app today is buyer-shaped —
   this resolver lets each surface read its strings through `copy(audience)`
   and the right variant lands.

   Voice rules (from SMBX_PLATFORM_IDENTITY_AND_POSITIONING.md §Yulia voice):
     - Direct, not deferential
     - Specific, not vague (real numbers / nouns where possible)
     - Proactive, not reactive
     - Human-warm, not corporate

   Adding a new copy slot:
     1. Add the key to the `Copy` type below.
     2. Provide a value for every audience in `COPY`.
     3. (Optional) Pull a default from the `principal_buyer` row at first
        and refine other audiences once you've talked to them.
*/

import { type Audience } from "./audience";

/** Single tip chip shown post-login to replace the marketing Explore SMBX
    chips. Each chip opens chat with its prompt. */
export interface TipChip {
  label: string;
  prompt: string;
}

export interface Copy {
  /** Today screen — subtitle under the welcome hero, both anon and authed. */
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

/* ─── COPY TABLE ────────────────────────────────────────────
   Order matters for cognitive load — buyer-shape audiences first since
   they share the most copy with the existing app. Sell-side and PMI have
   the most rewriting. */
const COPY: Record<Audience, Copy> = {
  /* ─── First-time buyers — closest match to the existing app ─── */
  principal_buyer: {
    todayHeroTag:
      "Yulia scores every deal you look at, models the financing, and tells you which ones are worth your weekend.",
    todayIntelEyebrow: "VIEW SAMPLE · IN PIPELINE",
    todayIntelTitle: "5 deals Yulia is working",
    todayIntelSub: "Tap any to see what Yulia delivered — verdict, recast, drafts.",
    todayBriefEyebrow: "VIEW SAMPLE · YULIA'S BRIEF",
    todayBriefTitle: "Review 3 picks in 5 minutes",
    todayBriefSub: "See how Yulia screens 142 sources down to what matters — every morning.",
    todayTips: [
      { label: "How Yulia scores a deal",         prompt: "How does Yulia score a deal? Walk me through what goes into the Fit Score." },
      { label: "Capital stack 101",               prompt: "I'm looking at my first acquisition — how should I think about the capital stack?" },
      { label: "Your first LOI",                  prompt: "Help me understand what an LOI is and what should be in mine." },
    ],
  },

  /* ─── Search funders — also buy-side, but more sophisticated ─── */
  search_funder: {
    todayHeroTag:
      "40 hours of analyst work in 40 minutes. Yulia builds the model, scores the deal flow, and drafts the IC memo before your next meeting.",
    todayIntelEyebrow: "VIEW SAMPLE · YOUR THESIS",
    todayIntelTitle: "5 deals against your thesis",
    todayIntelSub: "Yulia screens incoming deals against your criteria automatically.",
    todayBriefEyebrow: "VIEW SAMPLE · WEEK IN REVIEW",
    todayBriefTitle: "3 worth your IC's 10 minutes",
    todayBriefSub: "Top of funnel, ranked. The other 142 are in your pipeline if you want to dig.",
    todayTips: [
      { label: "Sharpen my thesis",               prompt: "Help me sharpen my acquisition thesis — what criteria should I be screening against?" },
      { label: "Build the IC memo",               prompt: "Walk me through how to structure an investment committee memo for the deal I'm working." },
      { label: "Quarterly LP update",             prompt: "Draft a quarterly update for my LPs based on my current pipeline." },
    ],
  },

  /* ─── Independent sponsors — portfolio scale ─── */
  independent_sponsor: {
    todayHeroTag:
      "Yulia is the second associate you can't quite afford. Add-back analysis, IC memos, and capital partner pitches — at $149, not $25K per deal.",
    todayIntelEyebrow: "VIEW SAMPLE · PORTFOLIO",
    todayIntelTitle: "5 deals worth a closer look this week",
    todayIntelSub: "Pulled from your inbox + pipeline + Yulia's outreach.",
    todayBriefEyebrow: "VIEW SAMPLE · CAPITAL PARTNERS",
    todayBriefTitle: "3 capital partners to update",
    todayBriefSub: "Last touched 30+ days ago. Yulia drafts the update.",
    todayTips: [
      { label: "Pre-LOI add-back analysis",       prompt: "Show me what a pre-LOI add-back analysis looks like — I have a P&L I want to walk through." },
      { label: "Capital partner pitch",           prompt: "Help me draft a capital partner pitch for the deal I'm working." },
      { label: "Modeling the rollover",           prompt: "How do I structure rollover equity under SOP 50 10 8? I have a buyer who wants to keep 20%." },
    ],
  },

  /* ─── Corp dev — pipeline volume ─── */
  corp_dev: {
    todayIntelEyebrow: "VIEW SAMPLE · INBOUND THIS WEEK",
    todayHeroTag:
      "Yulia is your screen-faster, model-faster, decide-faster layer. She remembers every deal you've evaluated. She drafts the memo your CEO asked for last Friday.",
    todayIntelTitle: "14 inbound deals to triage",
    todayIntelSub: "Sorted by fit against your acquisition criteria.",
    todayBriefEyebrow: "VIEW SAMPLE · IN REVIEW",
    todayBriefTitle: "3 board memos to ship today",
    todayBriefSub: "Yulia has draft v1 ready — review and send.",
    todayTips: [
      { label: "Screen 10 deals fast",            prompt: "I have 10 teasers I need to triage. Walk me through the fastest way to do this with you." },
      { label: "Board memo template",             prompt: "Help me draft a board memo for our latest acquisition target." },
      { label: "Pipeline reporting",              prompt: "What should my monthly pipeline report to leadership look like?" },
    ],
  },

  /* ─── Family offices — selective, sophisticated ─── */
  family_office: {
    todayHeroTag:
      "Analyst capacity on demand. Screen faster, model instantly, and never lose institutional knowledge when an associate leaves.",
    todayIntelEyebrow: "VIEW SAMPLE · DESK",
    todayIntelTitle: "5 opportunities for the desk",
    todayIntelSub: "Pre-screened against the family's mandate.",
    todayBriefEyebrow: "VIEW SAMPLE · DECISIONS DUE",
    todayBriefTitle: "3 decisions for this week's IC",
    todayBriefSub: "Yulia has the analysis. You have the call.",
    todayTips: [
      { label: "Mandate-fit screening",           prompt: "Walk me through how Yulia screens deals against a family office mandate." },
      { label: "IC pre-read template",            prompt: "Show me what a strong IC pre-read looks like for a buyout opportunity." },
      { label: "Cross-portfolio scenarios",       prompt: "Help me model a scenario across two of our existing portfolio companies." },
    ],
  },

  /* ─── LMM advisors — sell-side, client deals ─── */
  lmm_advisor: {
    todayHeroTag:
      "Handle twice the deal flow without hiring another analyst. Yulia drafts CIMs in hours, models valuations instantly, and runs the diligence chase so you can run the room.",
    todayIntelEyebrow: "VIEW SAMPLE · CLIENT DEALS",
    todayIntelTitle: "5 client deals needing attention",
    todayIntelSub: "Stuck IOIs, slow buyers, deals where Yulia thinks it's time to push.",
    todayBriefEyebrow: "VIEW SAMPLE · WEEKLY UPDATES",
    todayBriefTitle: "3 status updates due to clients",
    todayBriefSub: "Yulia drafts the update. You review and send.",
    todayTips: [
      { label: "First-draft CIM in hours",        prompt: "Help me draft a CIM. I'll share the financials." },
      { label: "Reading buyer behavior",          prompt: "How does Yulia read engagement signals across my buyer list?" },
      { label: "Closing faster",                  prompt: "What patterns does Yulia see in deals that close vs deals that stall?" },
    ],
  },

  /* ─── Principal sellers — owner-operators selling ─── */
  principal_seller: {
    todayHeroTag:
      "Yulia is the smart friend who's done this before. She'll tell you what your business is worth, what to fix before listing, and how to read a buyer's first IOI without paying $25K to find out.",
    todayIntelEyebrow: "VIEW SAMPLE · BUYER INTEREST",
    todayIntelTitle: "Where your sale stands",
    todayIntelSub: "Buyer activity, signals from Yulia, and what to push on this week.",
    todayBriefEyebrow: "VIEW SAMPLE · TODAY",
    todayBriefTitle: "3 things to push your sale forward",
    todayBriefSub: "Concrete actions — not generic checklists.",
    todayTips: [
      { label: "What's my business worth?",       prompt: "Give me a real range for what my business is worth. I'll share the numbers." },
      { label: "Get deal-ready",                  prompt: "What do I need to fix before I'm ready to talk to a buyer or list with a broker?" },
      { label: "Negotiating the first IOI",       prompt: "I just got an IOI. Walk me through what's standard, what's aggressive, and what to push back on." },
    ],
  },
};

/** Resolve copy for a given audience. */
export function copyFor(a: Audience): Copy {
  return COPY[a];
}
