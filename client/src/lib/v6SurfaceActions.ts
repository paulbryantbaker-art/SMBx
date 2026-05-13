export type SurfaceActionKind =
  | "navigate"
  | "analysis"
  | "document"
  | "data_room"
  | "share"
  | "review"
  | "search"
  | "model"
  | "chat";

export type SurfaceResult =
  | "mode"
  | "deal"
  | "files"
  | "document"
  | "analysis_canvas"
  | "model_canvas"
  | "review_queue"
  | "staged_confirmation"
  | "chat";

export interface SurfaceActionContract {
  id: string;
  label: string;
  kind: SurfaceActionKind;
  result: SurfaceResult;
  backendTool?: string;
  analysisType?: string;
  requiresDeal?: boolean;
  requiresConfirmation?: boolean;
  description: string;
}

export const SURFACE_ACTIONS = {
  open_today: {
    id: "open_today",
    label: "Open Today",
    kind: "navigate",
    result: "mode",
    description: "Navigate to the Today desk.",
  },
  open_pipeline: {
    id: "open_pipeline",
    label: "Open Pipeline",
    kind: "navigate",
    result: "mode",
    description: "Navigate to the pipeline.",
  },
  open_search: {
    id: "open_search",
    label: "Open Search",
    kind: "navigate",
    result: "mode",
    description: "Navigate to market search and sourcing.",
  },
  open_files: {
    id: "open_files",
    label: "Open Files",
    kind: "navigate",
    result: "mode",
    description: "Navigate to the global files workspace.",
  },
  open_deal: {
    id: "open_deal",
    label: "Open Deal",
    kind: "navigate",
    result: "deal",
    requiresDeal: true,
    description: "Open a deal detail surface.",
  },
  open_files_all: {
    id: "open_files_all",
    label: "Open All Files",
    kind: "navigate",
    result: "files",
    requiresDeal: true,
    description: "Open the full deal file library.",
  },
  open_files_data_room: {
    id: "open_files_data_room",
    label: "Open Data Room",
    kind: "data_room",
    result: "files",
    requiresDeal: true,
    description: "Open the shared diligence data room for a deal.",
  },
  open_files_shared: {
    id: "open_files_shared",
    label: "Open Shared Files",
    kind: "data_room",
    result: "files",
    requiresDeal: true,
    description: "Open sent, received, deferred, in-review, and executed shared items.",
  },
  open_files_needing_action: {
    id: "open_files_needing_action",
    label: "Open Files Needing Action",
    kind: "data_room",
    result: "files",
    requiresDeal: true,
    description: "Open the shared/action queue for a deal.",
  },
  open_document: {
    id: "open_document",
    label: "Open Document",
    kind: "document",
    result: "document",
    description: "Open a document or deliverable.",
  },
  run_market_intelligence: {
    id: "run_market_intelligence",
    label: "Run Market Intelligence",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "market_intelligence",
    requiresDeal: true,
    description: "Create or open a structured market intelligence analysis canvas.",
  },
  run_tax_legal_structure: {
    id: "run_tax_legal_structure",
    label: "Map Tax and Legal Implications",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "tax_legal_structure",
    requiresDeal: true,
    description: "Create or open tax/legal issue-spotting and structure analysis.",
  },
  run_working_capital_analysis: {
    id: "run_working_capital_analysis",
    label: "Run Working Capital Analysis",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "working_capital",
    requiresDeal: true,
    description: "Create or open a working-capital analysis canvas.",
  },
  run_buyer_fit_analysis: {
    id: "run_buyer_fit_analysis",
    label: "Run Buyer Fit Analysis",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "buyer_fit",
    requiresDeal: true,
    description: "Create or open a buyer-fit analysis canvas.",
  },
  run_valuation_analysis: {
    id: "run_valuation_analysis",
    label: "Run Valuation Analysis",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "valuation",
    requiresDeal: true,
    description: "Create or open a valuation analysis canvas.",
  },
  run_comps_analysis: {
    id: "run_comps_analysis",
    label: "Run Comps Analysis",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "comps",
    requiresDeal: true,
    description: "Create or open a comparable transaction analysis canvas.",
  },
  run_capital_structure_model: {
    id: "run_capital_structure_model",
    label: "Run Capital Structure Model",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "capital_structure",
    requiresDeal: true,
    description: "Create or open a capital-structure model canvas.",
  },
  run_red_flags_analysis: {
    id: "run_red_flags_analysis",
    label: "Run Red Flag Analysis",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "run_analysis",
    analysisType: "red_flags",
    requiresDeal: true,
    description: "Create or open a red-flag and diligence-gap analysis canvas.",
  },
  compare_deals: {
    id: "compare_deals",
    label: "Compare Deals",
    kind: "analysis",
    result: "analysis_canvas",
    backendTool: "compare_deals",
    analysisType: "deal_comparison",
    description: "Open a side-by-side deal comparison canvas.",
  },
  generate_primary_deliverable: {
    id: "generate_primary_deliverable",
    label: "Generate Primary Deliverable",
    kind: "document",
    result: "document",
    backendTool: "generate_deal_deliverable",
    requiresDeal: true,
    description: "Generate the next primary deal document for the current journey.",
  },
  generate_loi: {
    id: "generate_loi",
    label: "Generate LOI",
    kind: "document",
    result: "document",
    backendTool: "generate_deal_deliverable",
    requiresDeal: true,
    description: "Generate an LOI draft from current deal context.",
  },
  file_to_data_room: {
    id: "file_to_data_room",
    label: "File to Data Room",
    kind: "data_room",
    result: "staged_confirmation",
    backendTool: "file_deliverable_to_data_room",
    requiresDeal: true,
    requiresConfirmation: true,
    description: "Move a private deliverable into the shared data room after confirmation.",
  },
  request_review: {
    id: "request_review",
    label: "Request Review",
    kind: "review",
    result: "staged_confirmation",
    backendTool: "request_review",
    requiresDeal: true,
    requiresConfirmation: true,
    description: "Stage a document review request for the right professional or participant.",
  },
  share_document: {
    id: "share_document",
    label: "Share Document",
    kind: "share",
    result: "staged_confirmation",
    backendTool: "share_document",
    requiresDeal: true,
    requiresConfirmation: true,
    description: "Stage external or cross-fence sharing for confirmation.",
  },
  start_sourcing_run: {
    id: "start_sourcing_run",
    label: "Start Sourcing Run",
    kind: "search",
    result: "analysis_canvas",
    backendTool: "start_sourcing_run",
    description: "Run sourcing against a thesis and open the live sourcing surface.",
  },
  search_buyers: {
    id: "search_buyers",
    label: "Search Buyers",
    kind: "search",
    result: "chat",
    backendTool: "scan_market",
    description: "Use Yulia to find buyers, buyer pools, lenders, and deal professionals from context.",
  },
  update_model_assumption: {
    id: "update_model_assumption",
    label: "Update Model Assumption",
    kind: "model",
    result: "model_canvas",
    backendTool: "update_model",
    description: "Update a live model or analysis assumption and recalculate.",
  },
  ask_yulia: {
    id: "ask_yulia",
    label: "Ask Yulia",
    kind: "chat",
    result: "chat",
    description: "Send natural-language intent to Yulia.",
  },
} as const satisfies Record<string, SurfaceActionContract>;

export type SurfaceActionId = keyof typeof SURFACE_ACTIONS;

export function getSurfaceActionContract(actionId: SurfaceActionId): SurfaceActionContract {
  return SURFACE_ACTIONS[actionId];
}

export function isSurfaceActionId(value: unknown): value is SurfaceActionId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SURFACE_ACTIONS, value);
}

export const DEAL_NEXT_ACTION_IDS = [
  "run_market_intelligence",
  "run_tax_legal_structure",
  "run_working_capital_analysis",
  "run_buyer_fit_analysis",
  "run_valuation_analysis",
  "run_comps_analysis",
  "run_capital_structure_model",
  "run_red_flags_analysis",
  "generate_primary_deliverable",
  "generate_loi",
  "open_files_all",
  "open_files_data_room",
  "open_files_shared",
  "open_files_needing_action",
] as const satisfies readonly SurfaceActionId[];
