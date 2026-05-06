/**
 * Recommended Next — chat-first secondary surface (B2.0).
 *
 * Maps a deal's gate + journey to 2-4 contextual shortcuts. Tapping a
 * shortcut hands the prompt to Yulia, who executes and surfaces the
 * result in the canvas. See `feedback_recommended_next_pattern.md` in
 * memory for the full architectural reasoning.
 *
 * Contextual scarcity is what separates this from a button-pile:
 *   - 2-4 items per gate, never more.
 *   - Items only appear when they're plausibly the next action right now.
 *   - The same action ("Lock this valuation") would be a button-pile if
 *     it lived on every model tab; as a Recommended Next item that
 *     appears only when the model is committable AT B2, it's an
 *     acceleration layer.
 */

export interface RecommendedItem {
  /** Unique within the list — used as React key. */
  id: string;
  /** Short verb-phrase eyebrow ("RUN", "DRAFT", "RECORD"). */
  eyebrow: string;
  /** Headline — what the user would say to Yulia, in their own words. */
  title: string;
  /** Optional supporting line. */
  sub?: string;
  /** Pre-filled prompt sent to Yulia on tap. */
  prompt: string;
}

export interface RecommendedDealLike {
  business_name?: string | null;
  journey_type?: string | null;
  current_gate?: string | null;
}

export function getRecommendations(deal: RecommendedDealLike): RecommendedItem[] {
  const name = deal.business_name || "this deal";
  const journey = (deal.journey_type ?? "").toLowerCase();
  const gate = (deal.current_gate ?? "").toUpperCase();

  // Per-journey, per-gate registry. Each entry returns 2-4 items max.
  const items = registryFor(journey, gate, name);
  return items.slice(0, 4);
}

function registryFor(journey: string, gate: string, name: string): RecommendedItem[] {
  // BUY journey
  if (journey === "buy") {
    if (gate === "B0") return [
      { id: "b0-thesis",  eyebrow: "REFINE",   title: "Tighten the thesis",                 sub: "Lock industry, geo, and size",        prompt: `On ${name}: walk me through tightening my acquisition thesis — industry, geography, target size, capital available, financing approach.` },
      { id: "b0-capital", eyebrow: "SET",      title: "Set capital available",              sub: "Equity check + financing plan",       prompt: `On ${name}: help me set my capital available and financing approach. SBA, conventional, or hybrid?` },
      { id: "b0-league",  eyebrow: "CLASSIFY", title: "Classify the deal league",            sub: "Picks the right buyer playbook",      prompt: `On ${name}: classify which league this deal sits in based on what we have so far.` },
    ];
    if (gate === "B1") return [
      { id: "b1-source",  eyebrow: "START",    title: "Start a sourcing run",               sub: "Yulia ranks targets against thesis",  prompt: `On ${name}: kick off a sourcing run. Find me 20 targets matching my thesis, ranked.` },
      { id: "b1-promote", eyebrow: "PROMOTE",  title: "Promote a target to a deal",         sub: "Convert a sourcing candidate",        prompt: `On ${name}: I want to promote one of the sourced targets to a real deal. Help me pick.` },
      { id: "b1-comp",    eyebrow: "BUILD",    title: "Build a comp sheet",                 sub: "Recent deals at this size",            prompt: `On ${name}: pull recent comparable transactions for this industry and size. Multiples, structure, terms.` },
    ];
    if (gate === "B2") return [
      { id: "b2-val",     eyebrow: "RUN",      title: "Run a valuation",                    sub: "DCF + multiple-based blended",        prompt: `On ${name}: run a valuation. Walk me through the assumptions and let me tweak.` },
      { id: "b2-sba",     eyebrow: "MODEL",    title: "Model SBA financing",                sub: "DSCR, amortization, equity needed",   prompt: `On ${name}: run an SBA financing scenario. Show me DSCR, amortization, and the equity check needed.` },
      { id: "b2-compare", eyebrow: "COMPARE",  title: "Compare to similar deals",           sub: "Side-by-side multiples + IRR",         prompt: `On ${name}: compare this deal to two or three similar deals on multiples, IRR, and structure.` },
      { id: "b2-lock",    eyebrow: "LOCK",     title: "Lock the valuation",                 sub: "Saves it for gate advance",            prompt: `On ${name}: lock in the valuation we've been working. Save it to the deal so we can move on.` },
    ];
    if (gate === "B3") return [
      { id: "b3-dd",      eyebrow: "GENERATE", title: "Generate the DD checklist",          sub: "Customized to this industry",          prompt: `On ${name}: generate a due-diligence checklist tailored to this deal and industry.` },
      { id: "b3-qoe",     eyebrow: "RUN",      title: "Run a QoE Lite sweep",               sub: "Quality of earnings highlights",       prompt: `On ${name}: run a QoE Lite sweep. Surface add-back legitimacy, revenue concentration, and working-capital flags.` },
      { id: "b3-record",  eyebrow: "RECORD",   title: "Mark DD complete",                   sub: "Triggers gate-readiness check",        prompt: `On ${name}: I've completed due diligence. Record it and check whether we're ready to advance.` },
    ];
    if (gate === "B4") return [
      { id: "b4-loi",     eyebrow: "DRAFT",    title: "Draft the LOI",                      sub: "Yulia uses your latest assumptions",   prompt: `On ${name}: draft the LOI based on our latest valuation and structure. League-appropriate template.` },
      { id: "b4-fin",     eyebrow: "RECORD",   title: "Record financing secured",           sub: "Lender + commitment letter date",      prompt: `On ${name}: financing is approved. Record the lender, amount, and commitment letter date.` },
      { id: "b4-exec",    eyebrow: "RECORD",   title: "Record LOI executed",                sub: "Both sides countersigned",              prompt: `On ${name}: the LOI is executed. Record the signers and date so we can advance.` },
    ];
    if (gate === "B5") return [
      { id: "b5-checklist", eyebrow: "GENERATE", title: "Generate closing checklist",        sub: "Documents, signatures, funding",       prompt: `On ${name}: generate the closing checklist — documents, signatures, funds-flow.` },
      { id: "b5-funds",     eyebrow: "GENERATE", title: "Funds-flow statement",              sub: "Sources and uses at close",            prompt: `On ${name}: generate the funds-flow statement showing sources and uses at close.` },
      { id: "b5-close",     eyebrow: "CLOSE",    title: "Mark deal closed",                  sub: "Final price + closing date",           prompt: `On ${name}: the deal is closed. Mark it final with the closing date and final price. PMI optional.` },
    ];
  }

  // SELL journey
  if (journey === "sell") {
    if (gate === "S0") return [
      { id: "s0-finish",   eyebrow: "FINISH",   title: "Finish setup",                      sub: "Industry, location, exit motivation",  prompt: `On ${name}: help me finish setting up — industry, location, exit motivation, and timeline.` },
      { id: "s0-vrr",      eyebrow: "REQUEST",  title: "Get the Value Readiness Report",    sub: "What needs work before we list",        prompt: `On ${name}: walk me through the Value Readiness Report once we have enough info.` },
    ];
    if (gate === "S1") return [
      { id: "s1-upload",   eyebrow: "UPLOAD",   title: "Upload financials",                  sub: "P&Ls, tax returns, customer list",      prompt: `On ${name}: I want to upload financials. What do you need from me first?` },
      { id: "s1-recast",   eyebrow: "RECAST",   title: "Recast SDE / EBITDA",               sub: "Add-backs, owner comp, one-times",      prompt: `On ${name}: walk me through the SDE / EBITDA recast — owner comp, add-backs, one-time items.` },
      { id: "s1-addback",  eyebrow: "CONFIRM",  title: "Confirm add-backs",                  sub: "Each one needs justification",          prompt: `On ${name}: review the add-backs you've identified. I want to confirm or push back on each.` },
    ];
    if (gate === "S2") return [
      { id: "s2-val",      eyebrow: "RUN",      title: "Run the valuation",                  sub: "Range based on recast + comps",         prompt: `On ${name}: run a valuation based on the recast SDE/EBITDA and comparable transactions.` },
      { id: "s2-lock",     eyebrow: "LOCK",     title: "Lock the asking range",              sub: "Sets the marketing anchor",             prompt: `On ${name}: lock in the asking range so we can build the marketing materials.` },
    ];
    if (gate === "S3") return [
      { id: "s3-cim",      eyebrow: "GENERATE", title: "Generate the CIM",                   sub: "Confidential information memorandum",   prompt: `On ${name}: generate the confidential information memorandum (CIM).` },
      { id: "s3-edit",     eyebrow: "EDIT",     title: "Edit the CIM in canvas",            sub: "Fine-tune voice and emphasis",          prompt: `On ${name}: open the CIM in the canvas so I can edit the voice and emphasize what matters.` },
      { id: "s3-approve",  eyebrow: "APPROVE",  title: "Approve marketing materials",         sub: "Locks them for outreach",               prompt: `On ${name}: I'm approving the marketing materials. Lock them and we can start outreach.` },
    ];
    if (gate === "S4") return [
      { id: "s4-buyers",   eyebrow: "BUILD",    title: "Build the buyer list",               sub: "Strategic + financial split",           prompt: `On ${name}: build the buyer list — strategic and financial buyers, ranked by fit.` },
      { id: "s4-outreach", eyebrow: "SEND",     title: "Send NDA-gated outreach",            sub: "Bulk send to the list",                 prompt: `On ${name}: send NDA-gated outreach with the CIM to the buyer list.` },
      { id: "s4-activity", eyebrow: "REVIEW",   title: "Review buyer activity",              sub: "Who's read, who's responded",           prompt: `On ${name}: walk me through buyer activity — views, NDA acceptances, replies, meetings requested.` },
    ];
    if (gate === "S5") return [
      { id: "s5-compare",  eyebrow: "COMPARE",  title: "Compare offers / LOIs",              sub: "Side-by-side terms",                    prompt: `On ${name}: compare the LOIs / offers we've received side-by-side — price, structure, earnout, contingencies.` },
      { id: "s5-close",    eyebrow: "CLOSE",    title: "Mark deal closed",                   sub: "Final price + date",                    prompt: `On ${name}: the sale is closed. Mark it final with the closing date and final price.` },
    ];
  }

  // RAISE journey
  if (journey === "raise") {
    if (gate === "R0") return [
      { id: "r0-amount",   eyebrow: "SET",      title: "Set raise amount + use",             sub: "Equity range and capital use",          prompt: `On ${name}: help me set the raise amount, equity range, and capital use.` },
      { id: "r0-investors", eyebrow: "DEFINE",  title: "Define investor types",               sub: "Family offices, pensions, FoFs",        prompt: `On ${name}: define which investor types I'm targeting — family offices, pensions, fund-of-funds, etc.` },
    ];
    if (gate === "R1") return [
      { id: "r1-cap",      eyebrow: "BUILD",    title: "Build the cap table",                sub: "Founders, SAFEs, options pool",         prompt: `On ${name}: build the cap table — founders, SAFEs, options pool, current investors.` },
      { id: "r1-financial", eyebrow: "PACKAGE", title: "Package financial materials",         sub: "Historical + projection model",         prompt: `On ${name}: package the financial materials — historicals plus 5-year projection model.` },
    ];
    if (gate === "R2") return [
      { id: "r2-deck",     eyebrow: "GENERATE", title: "Generate the pitch deck",            sub: "12 slides, investor-ready",             prompt: `On ${name}: generate the pitch deck — investor-ready, 12 slides, slot in our latest financials.` },
      { id: "r2-onepager", eyebrow: "GENERATE", title: "Generate the one-pager",             sub: "Teaser for outreach",                   prompt: `On ${name}: generate the one-pager teaser for outreach.` },
    ];
    if (gate === "R3") return [
      { id: "r3-list",     eyebrow: "BUILD",    title: "Build the investor list",            sub: "Match thesis + check size",             prompt: `On ${name}: build the investor list. Match my thesis, my check size, and prior portfolio overlap.` },
      { id: "r3-outreach", eyebrow: "START",    title: "Start outreach",                      sub: "Personalized intros, tracked",          prompt: `On ${name}: start outreach to the investor list. Personalized intros, track responses.` },
    ];
    if (gate === "R4") return [
      { id: "r4-compare",  eyebrow: "COMPARE",  title: "Compare term sheets",                sub: "Side-by-side terms",                    prompt: `On ${name}: compare the term sheets we've received side-by-side — valuation, liquidation pref, board seats, vesting.` },
      { id: "r4-counter",  eyebrow: "DRAFT",    title: "Draft a counter-proposal",           sub: "From a baseline term sheet",            prompt: `On ${name}: draft a counter-proposal off the strongest term sheet — and tell me what to push on.` },
    ];
    if (gate === "R5") return [
      { id: "r5-close",    eyebrow: "CLOSE",    title: "Close the round",                    sub: "Sign + wire + cap-table update",        prompt: `On ${name}: close the round — execute the SPA, wire-coordination checklist, update the cap table.` },
    ];
  }

  // PMI journey
  if (journey === "pmi") {
    if (gate === "PMI0") return [
      { id: "pmi0-day0",   eyebrow: "PLAN",     title: "Plan Day 0",                         sub: "Communications + key holds",            prompt: `On ${name}: walk me through Day 0 — employee comms, customer comms, supplier comms, key continuity.` },
    ];
    if (gate === "PMI1") return [
      { id: "pmi1-stab",   eyebrow: "STABILIZE", title: "Stabilize operations",              sub: "Identify top 3 fragility points",       prompt: `On ${name}: help me stabilize operations. What are the top three fragility points to lock down first?` },
    ];
    if (gate === "PMI2") return [
      { id: "pmi2-assess", eyebrow: "ASSESS",   title: "Assess the integration plan",        sub: "What's working, what's not",            prompt: `On ${name}: assess the integration plan so far. What's working, what's not, where do I focus next quarter?` },
    ];
    if (gate === "PMI3") return [
      { id: "pmi3-opt",    eyebrow: "OPTIMIZE", title: "Optimization milestones",            sub: "Margin, growth, talent",                prompt: `On ${name}: walk through the optimization milestones — margin, growth, talent — and what's next.` },
    ];
  }

  // Fallback when nothing's mapped — still give the user something to act on.
  return [
    { id: "fallback-context", eyebrow: "REVIEW", title: "Walk me through the deal",         sub: "Yulia summarizes status",              prompt: `On ${name}: walk me through where we are on this deal and what should be next.` },
  ];
}
