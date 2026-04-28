/**
 * Yulia walkthrough scripts — per-page narration tied to scroll position.
 *
 * The chat panel becomes a 5-minute editor walking the reader through the
 * page in view. Each script defines a sequence of {sectionKey, lines}
 * entries. The orchestrator (YuliaWalkthrough) watches IntersectionObserver
 * on `[data-walkthrough-section="<key>"]` markers in the canvas and
 * dispatches the matching segment when a section enters view.
 *
 * Lines play sequentially within a segment. User scrolling backward to a
 * previous segment does NOT replay (once-per-segment). User scrolling
 * forward past a segment that hasn't fully played truncates and moves on.
 *
 * If the user types into the composer, the walkthrough pauses
 * indefinitely and real chat takes over.
 *
 * Tone:
 *   - Yulia speaks in short editorial-italic-ish sentences, not bullet
 *     points. Conversational, not slide-deck.
 *   - First line of each segment ties to what the reader is looking at
 *     so it feels live ("you're looking at the recast — let me defend it").
 *   - 8–14 second total reading time per segment so a slow reader catches
 *     up to the next section.
 */

export type WalkthroughLine = {
  /** Yulia's message body. Rendered in editorial italic in the chat. */
  text: string;
  /** Optional pause after this line before the next, in ms. Default 1500. */
  pauseAfter?: number;
};

export type WalkthroughSegment = {
  /** Matches the `data-walkthrough-section="<key>"` attribute in the canvas. */
  key: string;
  /** Lines spoken when the user enters this section. */
  lines: WalkthroughLine[];
};

export type WalkthroughScript = {
  /** Identifier for the page + persona context. */
  id: string;
  /** Optional opener that plays once on page load before scroll triggers any segment. */
  opener?: WalkthroughLine[];
  /** Section-keyed segments. */
  segments: WalkthroughSegment[];
};

/* ─────────────────────────── HOME ─────────────────────────── */

export const HOME_SCRIPT: WalkthroughScript = {
  id: 'home',
  opener: [
    { text: "Hi — I'm Yulia. I'll walk you through the cover story." },
    { text: 'Scroll down when you’re ready. I’ll narrate as you go.', pauseAfter: 800 },
  ],
  segments: [
    {
      key: 'hero',
      lines: [
        { text: "The headline says it: close deals faster." },
        { text: "What that means in practice — the recast you’d send to a junior to spend a week on, I draft in twelve minutes." },
        { text: "Keep scrolling. I’ll show you a real one." },
      ],
    },
    {
      key: 'recast',
      lines: [
        { text: "Here’s the recast. Real numbers, real seller, real defenses." },
        { text: "Reported earnings sit at $612K. After normalizing owner comp and three add-backs — vehicle, family payroll, the one-time legal — defensible SDE lands at $1.0M." },
        { text: "Indicative range $3.2M to $3.8M against the IBBA Texas industrial-services band. Each line cites its source." },
      ],
    },
    {
      key: 'capabilities',
      lines: [
        { text: "Three things I do well." },
        { text: "The book — a hundred-page CIM, first complete draft before lunch. The buyer list — strategics, financials, search funds, scored to your seller. The structure — SBA-compliant, lender-approved." },
        { text: "Plus the smaller jobs. Teaser screens, IC memos, diligence Q&A. Ninety seconds to fourteen minutes each." },
      ],
    },
    {
      key: 'personas',
      lines: [
        { text: "I work with four kinds of dealmakers." },
        { text: "Brokers and advisors. Independent sponsors. Searchers. Owner-operators thinking about selling." },
        { text: "Each one gets a tailored workflow. Click “For brokers” or any of the others to see how the engagement runs." },
      ],
    },
    {
      key: 'testimonial',
      lines: [
        { text: "Renée’s line is the one I hear most." },
        { text: "Weekends used to disappear to every new opportunity. Now the read happens in ninety seconds. The Tuesday-or-not call happens before lunch on Monday." },
      ],
    },
    {
      key: 'closer',
      lines: [
        { text: "That’s the cover. There’s more underneath — the structure modeling, the buyer tree, the diligence runbook." },
        { text: "The fastest way to see what I’d do for you is to paste a teaser. The chat is right here. Try me." },
      ],
    },
  ],
};

/* ─────────────────────────── JOURNEY ─────────────────────────── */
/* One script per persona. Orchestrator picks the right one based on the
   active persona id. Each segment maps to a section in JourneyCanvas. */

export const JOURNEY_SCRIPTS: Record<string, WalkthroughScript> = {
  searcher: {
    id: 'journey-searcher',
    opener: [
      { text: "Searcher mode. I’ll walk you through how I change a self-funded search." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "From a hundred teasers to three real deals — that’s the unlock." },
        { text: "Median search runs nineteen months. Most of that is reading documents. I read teasers in ninety seconds." },
      ]},
      { key: 'upagainst', lines: [
        { text: "The numbers above are what you’re actually fighting." },
        { text: "Twelve hundred and fifty hours a year on top-of-funnel. Thirty-seven percent of searches end without a close. Twenty-one point three percent of 2025 LOIs broken on QoE — double the 2023 rate." },
      ]},
      { key: 'changes', lines: [
        { text: "Four moves change the math." },
        { text: "Sourcing engine, ninety-second teaser screen, QoE Lite before LOI, and SOP 50 10 8 structures that actually clear the June 2025 rule changes." },
      ]},
      { key: 'demo', lines: [
        { text: "Here’s a teaser screen as it runs." },
        { text: "Watch the scoring — SDE normalized, concentration flagged, red flag surfaced. Pursue or pass with reasoning attached, every time." },
      ]},
      { key: 'arc', lines: [
        { text: "And the whole engagement, start to finish." },
        { text: "Raise. Search. Screen. Buy. Operate. Same workspace, every gate." },
      ]},
      { key: 'pricing', lines: [
        { text: "Starter at forty-nine. Pro at one-forty-nine for parallel deals." },
        { text: "First deliverable’s free. Try me on a teaser you’re sitting on right now." },
      ]},
    ],
  },

  advisor: {
    id: 'journey-advisor',
    opener: [
      { text: "Advisor mode. The CIM, the buyer tree, the bake-off pitch — that’s the territory." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "Your client’s CIM, drafted by Friday. Closed by Tuesday. That’s the headline." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Four to six hundred hours a year on CIM drafting at principal rates. Thirty to forty percent mandate failure." },
        { text: "And a tool stack that runs eighty to two-fifty thousand a year for a five-person shop and gives you raw material — not finished work." },
      ]},
      { key: 'changes', lines: [
        { text: "I do the finished work. CIM in under an hour, branded to your firm. Buyer tree scored against the seller." },
        { text: "Twenty-two-gate scoring kills dying mandates at gate eight, not gate eighteen." },
      ]},
      { key: 'demo', lines: [
        { text: "A CIM section drafted live. Eight hundred forty-seven words, redline-ready, in under thirteen minutes." },
      ]},
      { key: 'arc', lines: [
        { text: "Pitch through close. Same workspace, every party." },
      ]},
      { key: 'pricing', lines: [
        { text: "Pro one-forty-nine for the solo MD. Team nine ninety-nine for a banker bench." },
        { text: "Try me on a mandate you’re pitching this week." },
      ]},
    ],
  },

  broker: {
    id: 'journey-broker',
    opener: [
      { text: "Broker mode. The recast, the valuation, the marketing package — by lunch." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "Three point six closes per broker per year is the IBBA average. The prep work is what swallows your week." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Seventy-five to ninety percent of Main Street listings never sell. CIM prep on the engagements that do move forward runs forty to eighty hours." },
        { text: "Twenty-three to twenty-nine percent of failures trace to unrealistic seller pricing. I arm you for that conversation before the listing’s signed." },
      ]},
      { key: 'changes', lines: [
        { text: "The Baseline gives you a defensible number. The marketing package — CIM, teaser, NDA, buyer list, offer matrix — comes in hours, not weeks." },
        { text: "SBA pre-qualification modeling pushes lender-kill rate back toward fifteen to twenty percent." },
      ]},
      { key: 'demo', lines: [
        { text: "A live recast worksheet. Three hundred eighty-eight thousand defended in add-backs. Indicative range to the IBBA Texas band." },
      ]},
      { key: 'arc', lines: [
        { text: "Pitch the listing, recast and value, marketing package, buyer qualification." },
      ]},
      { key: 'pricing', lines: [
        { text: "Starter forty-nine, personal credit card, cancel anytime." },
        { text: "Try me on a listing you’re prepping right now." },
      ]},
    ],
  },

  owner: {
    id: 'journey-owner',
    opener: [
      { text: "Owner-operator mode. Different audience — but the math is honest in both directions." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "What you built is worth more than they’ll quote you. The recast will show you the spread." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Eighty percent of owner net worth sits in the business. Seventy-six percent regret the sale within twelve months." },
        { text: "Most of that regret is preventable. The owners who score eighty or higher on readiness get offers seventy-one percent above average." },
      ]},
      { key: 'changes', lines: [
        { text: "Defensible number, not a guess. Readiness scorecard. Buyer-side QoE preview before the LOI." },
        { text: "Plus specialist coordination — CPA, attorney, IB, estate planner, lender — inside one workspace." },
      ]},
      { key: 'demo', lines: [
        { text: "A readiness conversation. SDE recast, range to band, twelve-month plan with milestones." },
      ]},
      { key: 'arc', lines: [
        { text: "Diagnose, plan, prepare, list, close. Often eighteen to twenty-four months end-to-end." },
      ]},
      { key: 'pricing', lines: [
        { text: "Free for your first recast and scorecard." },
        { text: "Pro one-forty-nine if you want me with you through the prep and sale window." },
      ]},
    ],
  },

  sponsor: {
    id: 'journey-sponsor',
    opener: [
      { text: "Sponsor mode. The IC memo, the structure, the LP audience-specific variant." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "One deal, fifteen LPs, fifteen memos. One afternoon." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Twenty-five to thirty-three percent of exclusive LOIs fail to close — absorbing a hundred-fifty to three hundred thousand each in diligence and legal." },
      ]},
      { key: 'changes', lines: [
        { text: "Audience-specific IC memos generated from one deal file. Family-office variant, mezz-fund variant, institutional-LP variant." },
        { text: "Forty-to-eighty hour memo work becomes a four-hour review cycle." },
      ]},
      { key: 'demo', lines: [
        { text: "A family-office variant drafted live. Fourteen pages, sized for the check, the leverage, the hold." },
      ]},
      { key: 'arc', lines: [
        { text: "Source, raise, structure, close, operate. Post-close PMI included." },
      ]},
      { key: 'pricing', lines: [
        { text: "Starter forty-nine during the hunt. Pro one-forty-nine for parallel." },
      ]},
    ],
  },

  banker: {
    id: 'journey-banker',
    opener: [
      { text: "Banker mode. The two-hundred-hour CIM, done in forty. By the analyst. On Tuesday." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "McKinsey 2024: one bank cut investment-brief production from nine hours to thirty minutes with generative AI. That compression is real." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Eighty-five percent analyst churn in two years. Five hundred million-plus on retention at one of the majors. Tool stack runs fifty to eighty thousand per banker." },
      ]},
      { key: 'changes', lines: [
        { text: "Twenty-eight document generators plus the Rundown. Buyer-list engine against comp transactions. Diligence Q&A inside an RBAC deal room." },
      ]},
      { key: 'demo', lines: [
        { text: "Tuesday’s pitch for a healthcare-services bake-off. Thirty-two slides, comp set pulled, indicative range." },
      ]},
      { key: 'arc', lines: [
        { text: "Pitch through close. The MD pitch cycle that eats four hundred hours a year — recovered." },
      ]},
      { key: 'pricing', lines: [
        { text: "Pro one-forty-nine for individual bankers. Team nine ninety-nine. Enterprise — contact sales for firm-wide deployment." },
      ]},
    ],
  },

  planner: {
    id: 'journey-planner',
    opener: [
      { text: "Exit planner mode. CEPA work, wealth-advisor handoffs, pre-sale value creation." },
    ],
    segments: [
      { key: 'hero', lines: [
        { text: "Owner readiness diagnosed in one conversation. The number, the gap, the eighteen-month plan." },
      ]},
      { key: 'upagainst', lines: [
        { text: "Eighty percent of owner net worth illiquid. Seventy-six percent regret. Only thirty-two percent have a documented exit plan — sixty-eight percent of your natural market is invisible to conventional prospecting." },
      ]},
      { key: 'changes', lines: [
        { text: "Prospect identification by trigger event. Readiness and value-gap assessment as the first retainer artifact." },
        { text: "Twenty-eight document generators including the hundred-day PMI plan. Specialist handoffs through one deal room." },
      ]},
      { key: 'demo', lines: [
        { text: "A readiness scorecard live. Personal, financial, business — three dimensions, one number, one plan." },
      ]},
      { key: 'arc', lines: [
        { text: "Identify, diagnose, plan, execute, post-liquidity advisory." },
      ]},
      { key: 'pricing', lines: [
        { text: "Pro one-forty-nine for individual CEPAs. Team nine ninety-nine for a three-to-five advisor practice." },
      ]},
    ],
  },
};

/* ─────────────────────────── PRICING ─────────────────────────── */

export const PRICING_SCRIPT: WalkthroughScript = {
  id: 'pricing',
  opener: [
    { text: "Pricing — straightforward. Free, Starter, Pro, Team, Enterprise." },
  ],
  segments: [
    {
      key: 'hero',
      lines: [
        { text: "Every paid tier delivers every capability. You pay for volume, seats, infrastructure — never for the work itself." },
        { text: "No success fees. Ever." },
      ],
    },
    {
      key: 'table',
      lines: [
        { text: "Free is meet-Yulia. Unlimited chat plus one deliverable, total." },
        { text: "Starter at forty-nine for solo operators with one active deal. Pro at one-forty-nine for parallel deals — that’s the tier most practitioners pick." },
        { text: "Team at nine ninety-nine for two-to-five seats. Enterprise quoted custom." },
      ],
    },
    {
      key: 'rules',
      lines: [
        { text: "Six rules that don’t change. No core capability is ever gated. Subscription only. Post-close PMI included. Cancel anytime." },
      ],
    },
    {
      key: 'faq',
      lines: [
        { text: "Eight questions worth asking. The most common one: why no annual discount? Not at launch — introduced later at sixteen percent off once retention data supports it." },
      ],
    },
    {
      key: 'closer',
      lines: [
        { text: "Start free, no card. The chat is right here." },
      ],
    },
  ],
};

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */

export const HOW_SCRIPT: WalkthroughScript = {
  id: 'how',
  opener: [
    { text: "How it works — in plain English. The whole product is four lines." },
  ],
  segments: [
    {
      key: 'hero',
      lines: [
        { text: "You paste a teaser. I read it. I do the work. You close the deal." },
        { text: "Underneath: the recast, the QoE Lite, the SOP 50 10 8 structure modeling, the buyer tree against a comp-transactions database." },
        { text: "But the way it feels is four lines." },
      ],
    },
    {
      key: 'restraint',
      lines: [
        { text: "What I won’t do is just as important." },
        { text: "I won’t sign documents. I won’t hold money. I won’t replace your judgment. And I won’t pretend to know what I can’t." },
        { text: "Software that knows when to decline is rare. I decline." },
      ],
    },
    {
      key: 'act1',
      lines: [
        { text: "Act one: a teaser lands at 9:14 a.m. Tuesday." },
        { text: "By 9:38 — defensible SDE, indicative range, red flag surfaced, financing modeled. Pursue, with reasoning." },
      ],
    },
    {
      key: 'act2',
      lines: [
        { text: "Act two: the CIM section drafted by Wednesday morning." },
        { text: "Recast and operations narrative. First draft. Redline-ready." },
        { text: "Eight hundred forty-seven words. Twelve minutes of generation. Versus the fourteen-day analyst draft." },
      ],
    },
    {
      key: 'act3',
      lines: [
        { text: "Act three: LOI on the seller’s desk by Tuesday afternoon." },
        { text: "Structure that actually finances. June 2025 SOP 50 10 8 baked in. No phased buyout. Full standby seller note." },
        { text: "Eight days from teaser to signed LOI." },
      ],
    },
    {
      key: 'pricing',
      lines: [
        { text: "Pricing is simple. Free for the first deliverable. Starter at forty-nine. Pro at one-forty-nine. Team at nine ninety-nine. Contact sales for Enterprise." },
        { text: "No success fees. Cancel anytime. Annual billing saves twenty percent." },
      ],
    },
    {
      key: 'closer',
      lines: [
        { text: "Back to the four lines. You paste a teaser. I read it. I do the work. You close the deal." },
        { text: "When you’re ready, the chat is right here." },
      ],
    },
  ],
};
