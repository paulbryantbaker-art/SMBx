import type { StructuredAnalysisData } from "./analysisCanvasModel";

export interface InvestmentBoardComparisonCandidate {
  id: string;
  label: string;
  subtitle: string;
  data: StructuredAnalysisData;
}

export function shouldOpenSampleInvestmentBoard(prompt: string): boolean {
  const text = prompt.toLowerCase();
  if (
    /optimize_scenario|scenario sliders?|scenario "|changed assumptions|selected highlighted deal card|multi-deal comparison|selected deal scope|selected canvas scope/.test(text)
  ) {
    return false;
  }
  const asksForAnalysis = /run|open|build|show|create/.test(text)
    && /analysis|board|canvas|market|tax|legal|buyer|risk|valuation/.test(text);
  const asksForPriorityDeal = /highest-priority|highest priority|top priority|most useful|pipeline|big fake|smbx-0119/.test(text);
  return asksForAnalysis && asksForPriorityDeal;
}

export function buildInvestmentBoardComparisonCandidates(): InvestmentBoardComparisonCandidate[] {
  return [
    {
      id: "compare-pest-control-fl",
      label: "Pest Control FL",
      subtitle: "Cheaper entry, weaker data room",
      data: buildPestControlFlInvestmentBoardData(),
    },
    {
      id: "compare-hvac-platform",
      label: "HVAC Platform",
      subtitle: "Cleaner ops, richer price",
      data: buildHvacPlatformInvestmentBoardData(),
    },
  ];
}

export function buildBigFakeInvestmentBoardTab(id = `analysis-bigfake-board-${Date.now()}`) {
  return {
    id,
    kind: "analysis" as const,
    title: "Big Fake Deal · Investment board",
    tool: "investment_board",
    markdown: BIG_FAKE_BOARD_READ,
    analysisData: buildBigFakeInvestmentBoardData(),
    status: "dev board",
    sourceMode: "pipeline" as const,
  };
}

function buildPestControlFlInvestmentBoardData(): StructuredAnalysisData {
  return {
    ...buildBigFakeInvestmentBoardData(),
    title: "Pest Control FL · Investment board",
    summary: "Pest Control FL is a lower-price services target with real route density upside, but the evidence package is thinner: 78 FIT, watch verdict, $1.25M normalized SDE, $1.38M adjusted EBITDA, and a $7.8-8.4M valuation range. It belongs in comparison because the entry multiple is attractive, not because it is cleaner.",
    verdict: {
      label: "WATCH",
      tone: "watch",
      score: 78,
      rationale: "Attractive price and recurring route economics, offset by weaker source data and customer concentration that needs diligence before a pursue call.",
    },
    metrics: [
      { key: "fit", label: "FIT score", value: 78, displayValue: "78", sub: "Good target, not cleared", tone: "watch" },
      { key: "sde", label: "Normalized SDE", value: 1.25, displayValue: "$1.25M", sub: "$410K add-back package", tone: "watch" },
      { key: "ebitda", label: "Adjusted EBITDA", value: 1.38, displayValue: "$1.38M", sub: "Route-density adjusted", tone: "watch" },
      { key: "valuation", label: "Valuation range", displayValue: "$7.8M-$8.4M", sub: "6.0x adjusted EBITDA", tone: "pursue" },
      { key: "ask", label: "Seller ask", displayValue: "$8.5M", sub: "Negotiable with proof gaps", tone: "watch" },
    ],
    charts: [
      {
        type: "bar",
        title: "Recast bridge",
        data: [
          { label: "Reported SDE", value: 0.84, displayValue: "$840K", tone: "neutral" },
          { label: "Owner comp", value: 0.18, displayValue: "+$180K", tone: "watch" },
          { label: "Vehicle add-back", value: 0.11, displayValue: "+$110K", tone: "watch" },
          { label: "One-time cleanup", value: 0.04, displayValue: "+$40K", tone: "neutral" },
          { label: "Route overlap", value: 0.12, displayValue: "+$120K", tone: "pursue" },
          { label: "Normalized SDE", value: 1.25, displayValue: "$1.25M", tone: "watch" },
          { label: "Adjusted EBITDA", value: 1.38, displayValue: "$1.38M", tone: "watch" },
        ],
      },
      {
        type: "bar",
        title: "Board scorecard",
        data: [
          { label: "Strategic fit", value: 82, displayValue: "82", tone: "pursue" },
          { label: "Buyer demand", value: 79, displayValue: "79", tone: "watch" },
          { label: "Financing clarity", value: 69, displayValue: "69", tone: "watch" },
          { label: "Tax/legal clarity", value: 62, displayValue: "62", tone: "watch" },
          { label: "Data confidence", value: 47, displayValue: "47", tone: "pass" },
        ],
      },
      {
        type: "matrix",
        title: "Risk heatmap",
        data: [
          { row: "Customer mix", column: "Impact", value: 80, displayValue: "High" },
          { row: "Customer mix", column: "Control", value: 54, displayValue: "Medium" },
          { row: "Route density", column: "Impact", value: 74, displayValue: "High" },
          { row: "Route density", column: "Control", value: 66, displayValue: "Medium" },
          { row: "Data room", column: "Impact", value: 70, displayValue: "High" },
          { row: "Data room", column: "Control", value: 44, displayValue: "Low" },
        ],
      },
    ],
    tables: [
      {
        title: "Valuation & recast",
        columns: ["Line item", "Amount", "Board read"],
        rows: [
          ["Reported SDE", "$840K", "Starting earnings base"],
          ["Owner comp add-back", "+$180K", "Needs payroll proof"],
          ["Vehicle add-back", "+$110K", "Needs fleet policy support"],
          ["One-time cleanup", "+$40K", "Small but document"],
          ["Route overlap", "+$120K", "Synergy, not seller earnings"],
          ["Normalized SDE", "$1.25M", "Decision earnings"],
          ["Adjusted EBITDA", "$1.38M", "Valuation basis"],
          ["Valuation range", "$7.8M-$8.4M", "6.0x EBITDA"],
        ],
      },
      {
        title: "Board risk register",
        columns: ["Risk", "Why it matters", "Next action"],
        rows: [
          ["Customer concentration", "Top commercial accounts may drive too much revenue", "Request customer cohort and churn"],
          ["Data-room quality", "Monthly route economics are incomplete", "Ask for route-level P&L"],
          ["Synergy treatment", "Route overlap should not inflate seller value", "Separate base case from buyer synergy"],
        ],
      },
    ],
    risks: [
      { label: "Customer concentration", detail: "Top accounts need retention proof before treating cash flow as durable.", severity: "high", trigger: "Customer diligence" },
      { label: "Route-level data gaps", detail: "Route profitability is not yet supported by clean monthly detail.", severity: "high", trigger: "QoE / ops" },
      { label: "Synergy leakage", detail: "Seller may try to price buyer route overlap into the ask.", severity: "medium", trigger: "Valuation" },
    ],
    missingData: [
      { label: "Route-level P&L", why: "Needed to prove density economics and service profitability.", priority: "high" },
      { label: "Customer cohort file", why: "Needed to test churn and concentration.", priority: "high" },
      { label: "Fleet add-back support", why: "Vehicle normalization should be separated from owner preference.", priority: "medium" },
    ],
    professionalTriggers: [
      { role: "QoE provider", trigger: "Thin route-level support", why: "Validate normalized earnings before valuation pressure." },
      { role: "M&A counsel", trigger: "Customer assignment language", why: "Key accounts may need consent or transition language." },
      { role: "Tax advisor", trigger: "Fleet and asset allocation", why: "Asset mix changes tax treatment and depreciation planning." },
    ],
    nextActions: [
      {
        label: "Request route P&L",
        actionType: "request_evidence",
        prompt: "Draft a tight request for Pest Control FL route-level P&L, customer cohort, churn, and fleet add-back support.",
        targetDealTitle: "Pest Control FL",
      },
      {
        label: "Separate synergy value",
        actionType: "run_analysis",
        prompt: "Open a buyer-synergy bridge for Pest Control FL that separates seller earnings from buyer route-density upside.",
        analysisType: "synergy_bridge",
        targetDealTitle: "Pest Control FL",
      },
    ],
    evidenceRefs: [
      { label: "Pipeline card", type: "deal_fact", source: "V6 sample pipeline", value: "FIT 78 · WATCH" },
      { label: "Normalized SDE", type: "financial_fact", source: "Yulia sample recast", value: "$1.25M" },
      { label: "Adjusted EBITDA", type: "financial_fact", source: "Yulia sample recast", value: "$1.38M" },
      { label: "Valuation range", type: "methodology", source: "6.0x EBITDA", value: "$7.8M-$8.4M" },
    ],
    assumptions: [
      { key: "normalized_sde_cents", label: "Normalized SDE", value: 125000000, displayValue: "$1.25M" },
      { key: "adjusted_ebitda_cents", label: "Adjusted EBITDA", value: 138000000, displayValue: "$1.38M" },
      { key: "base_multiple", label: "Base multiple", value: 6, displayValue: "6.0x" },
      { key: "add_backs_cents", label: "Add-back package", value: 41000000, displayValue: "$410K" },
    ],
    yuliaRead: "Pest Control FL is attractive because the price is lower and route density could be real, but it should stay in watch until route-level profitability and customer retention are proven.",
    calculations: {
      dealId: "deal-pest-control-fl",
      dealName: "Pest Control FL",
      fitScore: 78,
      normalizedSdeCents: 125000000,
      adjustedEbitdaCents: 138000000,
      valuationLowCents: 780000000,
      valuationHighCents: 840000000,
    },
  };
}

function buildHvacPlatformInvestmentBoardData(): StructuredAnalysisData {
  return {
    ...buildBigFakeInvestmentBoardData(),
    title: "HVAC Platform · Investment board",
    summary: "HVAC Platform is cleaner operationally and more lender-friendly than the other targets: 86 FIT, pursue/watch line, $2.45M normalized SDE, $2.95M adjusted EBITDA, and a $20.7-22.1M valuation range. It is the quality option, but the price and integration burden need pressure testing.",
    verdict: {
      label: "PURSUE",
      tone: "pursue",
      score: 86,
      rationale: "Better recurring service mix and cleaner controls than the cheaper options, with valuation sensitivity and integration complexity as the main decision risks.",
    },
    metrics: [
      { key: "fit", label: "FIT score", value: 86, displayValue: "86", sub: "Quality option", tone: "pursue" },
      { key: "sde", label: "Normalized SDE", value: 2.45, displayValue: "$2.45M", sub: "$520K add-back package", tone: "pursue" },
      { key: "ebitda", label: "Adjusted EBITDA", value: 2.95, displayValue: "$2.95M", sub: "Service-contract adjusted", tone: "pursue" },
      { key: "valuation", label: "Valuation range", displayValue: "$20.7M-$22.1M", sub: "7.25x adjusted EBITDA", tone: "watch" },
      { key: "ask", label: "Seller ask", displayValue: "$22.5M", sub: "Full price", tone: "watch" },
    ],
    charts: [
      {
        type: "bar",
        title: "Recast bridge",
        data: [
          { label: "Reported SDE", value: 1.93, displayValue: "$1.93M", tone: "neutral" },
          { label: "Owner comp", value: 0.24, displayValue: "+$240K", tone: "watch" },
          { label: "One-time integration", value: 0.11, displayValue: "+$110K", tone: "neutral" },
          { label: "Service contract uplift", value: 0.17, displayValue: "+$170K", tone: "pursue" },
          { label: "Normalized SDE", value: 2.45, displayValue: "$2.45M", tone: "pursue" },
          { label: "Adjusted EBITDA", value: 2.95, displayValue: "$2.95M", tone: "pursue" },
        ],
      },
      {
        type: "bar",
        title: "Board scorecard",
        data: [
          { label: "Strategic fit", value: 88, displayValue: "88", tone: "pursue" },
          { label: "Buyer demand", value: 90, displayValue: "90", tone: "pursue" },
          { label: "Financing clarity", value: 82, displayValue: "82", tone: "pursue" },
          { label: "Tax/legal clarity", value: 72, displayValue: "72", tone: "watch" },
          { label: "Data confidence", value: 76, displayValue: "76", tone: "watch" },
        ],
      },
      {
        type: "matrix",
        title: "Risk heatmap",
        data: [
          { row: "Valuation", column: "Impact", value: 86, displayValue: "High" },
          { row: "Valuation", column: "Control", value: 58, displayValue: "Medium" },
          { row: "Integration", column: "Impact", value: 77, displayValue: "High" },
          { row: "Integration", column: "Control", value: 62, displayValue: "Medium" },
          { row: "Service mix", column: "Impact", value: 70, displayValue: "High" },
          { row: "Service mix", column: "Control", value: 80, displayValue: "High" },
        ],
      },
    ],
    tables: [
      {
        title: "Valuation & recast",
        columns: ["Line item", "Amount", "Board read"],
        rows: [
          ["Reported SDE", "$1.93M", "Stronger starting base"],
          ["Owner comp add-back", "+$240K", "Normal diligence"],
          ["One-time integration", "+$110K", "Needs source proof"],
          ["Service contract uplift", "+$170K", "Quality signal"],
          ["Normalized SDE", "$2.45M", "Decision earnings"],
          ["Adjusted EBITDA", "$2.95M", "Valuation basis"],
          ["Valuation range", "$20.7M-$22.1M", "7.25x EBITDA"],
        ],
      },
      {
        title: "Board risk register",
        columns: ["Risk", "Why it matters", "Next action"],
        rows: [
          ["Full valuation", "The quality premium reduces margin for error", "Run downside DSCR"],
          ["Integration complexity", "Multi-branch integration can eat year-1 cash", "Build integration budget"],
          ["Key tech retention", "Service revenue depends on technician continuity", "Request retention plan"],
        ],
      },
    ],
    risks: [
      { label: "Full-price ask", detail: "The business may be worth the premium, but the downside case has less room.", severity: "medium", trigger: "Valuation" },
      { label: "Integration drag", detail: "Branch systems and dispatcher workflow could absorb year-1 cash.", severity: "medium", trigger: "Operations" },
      { label: "Technician retention", detail: "Service quality depends on keeping key technicians through close.", severity: "medium", trigger: "Human capital" },
    ],
    missingData: [
      { label: "Integration budget", why: "Needed to understand year-1 cash drag.", priority: "medium" },
      { label: "Technician retention file", why: "Needed to test continuity of service revenue.", priority: "medium" },
      { label: "Contract renewal cohort", why: "Needed to prove recurring service value.", priority: "low" },
    ],
    professionalTriggers: [
      { role: "QoE provider", trigger: "Service-contract normalization", why: "Confirm recurring revenue and add-back quality." },
      { role: "M&A counsel", trigger: "Employment and non-solicit package", why: "Technician retention has direct revenue impact." },
      { role: "Tax advisor", trigger: "Asset allocation on larger purchase price", why: "Allocation materially affects after-tax return." },
    ],
    nextActions: [
      {
        label: "Run downside DSCR",
        actionType: "run_analysis",
        prompt: "Open a downside DSCR and integration-drag model for HVAC Platform at the current asking price.",
        analysisType: "dscr_downside",
        targetDealTitle: "HVAC Platform",
      },
      {
        label: "Build retention ask",
        actionType: "draft",
        prompt: "Draft technician retention and seller-transition asks for HVAC Platform.",
        targetDealTitle: "HVAC Platform",
      },
    ],
    evidenceRefs: [
      { label: "Pipeline card", type: "deal_fact", source: "V6 sample pipeline", value: "FIT 86 · PURSUE" },
      { label: "Normalized SDE", type: "financial_fact", source: "Yulia sample recast", value: "$2.45M" },
      { label: "Adjusted EBITDA", type: "financial_fact", source: "Yulia sample recast", value: "$2.95M" },
      { label: "Valuation range", type: "methodology", source: "7.25x EBITDA", value: "$20.7M-$22.1M" },
    ],
    assumptions: [
      { key: "normalized_sde_cents", label: "Normalized SDE", value: 245000000, displayValue: "$2.45M" },
      { key: "adjusted_ebitda_cents", label: "Adjusted EBITDA", value: 295000000, displayValue: "$2.95M" },
      { key: "base_multiple", label: "Base multiple", value: 7.25, displayValue: "7.25x" },
      { key: "add_backs_cents", label: "Add-back package", value: 52000000, displayValue: "$520K" },
    ],
    yuliaRead: "HVAC Platform is the quality option: cleaner revenue, stronger financing story, and better buyer demand, but the price and integration burden need to be modeled before calling it the winner.",
    calculations: {
      dealId: "deal-hvac-platform",
      dealName: "HVAC Platform",
      fitScore: 86,
      normalizedSdeCents: 245000000,
      adjustedEbitdaCents: 295000000,
      valuationLowCents: 2070000000,
      valuationHighCents: 2210000000,
    },
  };
}

export function buildBigFakeInvestmentBoardData(): StructuredAnalysisData {
  return {
    schemaVersion: "analysis-runtime-v1",
    analysisType: "investment_board",
    title: "Big Fake Deal · Investment board",
    summary: "Big Fake Deal is the highest-priority pipeline item: 92 FIT, pursue verdict, $1.80M normalized SDE, $2.10M adjusted EBITDA, and a market-priced $13-14M ask. The board decision is pursue subject to QoE proof on add-backs, working-cap language, and customer/transition diligence.",
    verdict: {
      label: "PURSUE",
      tone: "pursue",
      score: 92,
      rationale: "Strong industrial-services fit and bankable earnings profile, with diligence concentrated around add-back proof and working-cap mechanics.",
    },
    methodologyRefs: ["V18 valuation/recast", "V18 legal/tax guardrails", "SMBx FIT score"],
    metrics: [
      { key: "fit", label: "FIT score", value: 92, displayValue: "92", sub: "Pursue threshold cleared", tone: "pursue" },
      { key: "sde", label: "Normalized SDE", value: 1.8, displayValue: "$1.80M", sub: "$760K add-back package", tone: "pursue" },
      { key: "ebitda", label: "Adjusted EBITDA", value: 2.1, displayValue: "$2.10M", sub: "After D&A estimate", tone: "pursue" },
      { key: "valuation", label: "Valuation range", displayValue: "$13.65M-$14.70M", sub: "7.0x adjusted EBITDA", tone: "watch" },
      { key: "ask", label: "Seller ask", displayValue: "$13-14M", sub: "Market, not discount", tone: "watch" },
    ],
    charts: [
      {
        type: "bar",
        title: "Recast bridge",
        data: [
          { label: "Reported SDE", value: 1.04, displayValue: "$1.04M", tone: "neutral" },
          { label: "Owner comp", value: 0.32, displayValue: "+$320K", tone: "watch" },
          { label: "Family payroll", value: 0.21, displayValue: "+$210K", tone: "watch" },
          { label: "One-time legal", value: 0.085, displayValue: "+$85K", tone: "neutral" },
          { label: "Personal M&E", value: 0.145, displayValue: "+$145K", tone: "watch" },
          { label: "Normalized SDE", value: 1.8, displayValue: "$1.80M", tone: "pursue" },
          { label: "Adjusted EBITDA", value: 2.1, displayValue: "$2.10M", tone: "pursue" },
        ],
      },
      {
        type: "bar",
        title: "Board scorecard",
        data: [
          { label: "Strategic fit", value: 92, displayValue: "92", tone: "pursue" },
          { label: "Buyer demand", value: 84, displayValue: "84", tone: "pursue" },
          { label: "Financing clarity", value: 76, displayValue: "76", tone: "watch" },
          { label: "Tax/legal clarity", value: 64, displayValue: "64", tone: "watch" },
          { label: "Data confidence", value: 58, displayValue: "58", tone: "watch" },
        ],
      },
      {
        type: "matrix",
        title: "Risk heatmap",
        data: [
          { row: "QoE", column: "Impact", value: 82, displayValue: "High" },
          { row: "QoE", column: "Control", value: 68, displayValue: "Medium" },
          { row: "Working cap", column: "Impact", value: 74, displayValue: "High" },
          { row: "Working cap", column: "Control", value: 72, displayValue: "Medium" },
          { row: "Transition", column: "Impact", value: 61, displayValue: "Medium" },
          { row: "Transition", column: "Control", value: 78, displayValue: "High" },
        ],
      },
    ],
    tables: [
      {
        title: "Valuation & recast",
        columns: ["Line item", "Amount", "Board read"],
        rows: [
          ["Reported SDE", "$1.04M", "Starting earnings base"],
          ["Owner comp add-back", "+$320K", "Needs payroll support"],
          ["Family payroll add-back", "+$210K", "QoE focus"],
          ["One-time legal", "+$85K", "Document invoices"],
          ["Personal M&E", "+$145K", "Separate true business expense"],
          ["Normalized SDE", "$1.80M", "Decision earnings"],
          ["Adjusted EBITDA", "$2.10M", "Valuation basis"],
          ["Valuation range", "$13.65M-$14.70M", "7.0x EBITDA"],
        ],
      },
      {
        title: "Board risk register",
        columns: ["Risk", "Why it matters", "Next action"],
        rows: [
          ["Add-back proof", "$760K is high relative to reported SDE", "Run QoE tie-out"],
          ["Working-cap language", "Can move economics post-LOI", "Draft peg and true-up language"],
          ["Customer transfer", "Revenue durability depends on relationship handoff", "Request churn and contract review"],
          ["Seller transition", "Operational know-how may sit with owner", "Lock transition plan and non-compete"],
        ],
      },
    ],
    risks: [
      { label: "QoE attack surface", detail: "$760K add-back package must be proven line by line.", severity: "high", trigger: "QoE / accounting" },
      { label: "Working-cap mechanics", detail: "Current language needs tighter peg and true-up definitions.", severity: "medium", trigger: "Legal / tax" },
      { label: "Transition dependency", detail: "Seller handoff and key employee retention need evidence.", severity: "medium", trigger: "Operations" },
    ],
    missingData: [
      { label: "Add-back support", why: "Owner comp, family payroll, personal M&E, and one-time legal need source proof.", priority: "high" },
      { label: "Customer retention", why: "Buyer demand depends on durable recurring revenue, not just historical revenue.", priority: "medium" },
      { label: "Working-cap peg", why: "The economics can change materially if the peg is not negotiated before LOI.", priority: "medium" },
    ],
    professionalTriggers: [
      { role: "QoE provider", trigger: "Add-backs exceed $500K", why: "Normalize earnings before valuation is treated as real." },
      { role: "M&A counsel", trigger: "Working-cap and seller-note structure", why: "Legal drafting changes economics and risk allocation." },
      { role: "Tax advisor", trigger: "Allocation and deal-structure planning", why: "Asset allocation and deductibility should be modeled before close." },
    ],
    nextActions: [
      {
        label: "Run QoE tie-out",
        actionType: "run_analysis",
        prompt: "Open a QoE tie-out for Big Fake Deal focused on the $760K add-back package, evidence needed, and what would break the pursue verdict.",
        analysisType: "quality_of_earnings",
        targetDealTitle: "Big Fake Deal",
      },
      {
        label: "Draft working-cap ask",
        actionType: "draft",
        prompt: "Draft the working-cap peg and true-up language we should ask counsel to review for Big Fake Deal.",
        targetDealTitle: "Big Fake Deal",
      },
      {
        label: "Find buyer demand",
        actionType: "run_analysis",
        prompt: "Open a buyer-demand board for Big Fake Deal with strategic buyer pools, independent sponsors, lenders, and outreach priority.",
        analysisType: "buyer_demand",
        targetDealTitle: "Big Fake Deal",
      },
    ],
    evidenceRefs: [
      { label: "Pipeline card", type: "deal_fact", source: "V6 sample pipeline", value: "FIT 92 · PURSUE" },
      { label: "Normalized SDE", type: "financial_fact", source: "Yulia sample recast", value: "$1.80M" },
      { label: "Adjusted EBITDA", type: "financial_fact", source: "Yulia sample recast", value: "$2.10M" },
      { label: "Valuation range", type: "methodology", source: "7.0x EBITDA", value: "$13.65M-$14.70M" },
    ],
    assumptions: [
      { key: "normalized_sde_cents", label: "Normalized SDE", value: 180000000, displayValue: "$1.80M" },
      { key: "adjusted_ebitda_cents", label: "Adjusted EBITDA", value: 210000000, displayValue: "$2.10M" },
      { key: "base_multiple", label: "Base multiple", value: 7, displayValue: "7.0x" },
      { key: "add_backs_cents", label: "Add-back package", value: 76000000, displayValue: "$760K" },
    ],
    yuliaRead: BIG_FAKE_BOARD_READ,
    calculations: {
      dealId: "deal-bigfake",
      dealName: "Big Fake Deal",
      fitScore: 92,
      normalizedSdeCents: 180000000,
      adjustedEbitdaCents: 210000000,
      valuationLowCents: 1365000000,
      valuationHighCents: 1470000000,
    },
  };
}

export const BIG_FAKE_BOARD_READ = "Big Fake Deal is a pursue-quality industrial-services opportunity, but the board should not treat it as decision-ready until QoE validates the add-back package and counsel tightens working-cap language. The useful move is to keep the deal moving while making the next diligence requests narrow and evidence-based.";
