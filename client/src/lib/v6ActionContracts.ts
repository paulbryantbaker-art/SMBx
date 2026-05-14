import { compareDealsAnalysis, generateDealDeliverable, runDealAnalysis } from "../hooks/useV6WorkspaceData";
import type { ModelPreference } from "./modelPreference";
import type { FileScope, ModeId, OpenTab } from "../components/v6/types";
import { getSurfaceActionContract, type SurfaceActionId } from "./v6SurfaceActions";

export interface ActionDeal {
  id: number | string;
  business_name?: string | null;
  name?: string | null;
  industry?: string | null;
  location?: string | null;
  journey_type?: string | null;
  current_gate?: string | null;
}

export interface GenerateActionInput {
  deal: ActionDeal;
  slug: string;
  label: string;
  openTab: OpenTab;
  modelPreference?: ModelPreference;
  onNote?: (message: string | null) => void;
}

export interface AnalysisActionInput {
  deal: ActionDeal;
  analysisType: string;
  label: string;
  openTab: OpenTab;
  menuItemSlug?: string;
  modelPreference?: ModelPreference;
  requestedFrom?: string;
  onNote?: (message: string | null) => void;
}

export interface SurfaceActionExecutionInput {
  actionId: SurfaceActionId;
  openTab: OpenTab;
  deal?: ActionDeal | null;
  deals?: ActionDeal[];
  document?: { id?: number | string | null; title?: string | null };
  fileScope?: FileScope;
  title?: string;
  prompt?: string;
  modelPreference?: ModelPreference;
  requestedFrom?: string;
  onNote?: (message: string | null) => void;
  onTalkToYulia?: (prompt: string) => void;
}

export function pickActionDeal<T extends ActionDeal>(deals: T[]): T | null {
  return deals.find(d => String(d.id).trim().length > 0) ?? null;
}

export function actionDealTitle(deal: ActionDeal): string {
  return deal.business_name || deal.name || deal.industry || `Deal #${deal.id}`;
}

export function primaryDocForJourney(journey?: string | null): { slug: string; label: string } {
  switch (journey) {
    case "sell":
      return { slug: "sell-cim", label: "CIM" };
    case "raise":
      return { slug: "raise-pitch-deck", label: "Pitch deck" };
    case "pmi":
      return { slug: "pmi-100-day-plan", label: "100-day plan" };
    case "buy":
    default:
      return { slug: "buy-loi-draft", label: "LOI draft" };
  }
}

export function primaryAnalysisForJourney(journey?: string | null): { slug: string; label: string } {
  switch (journey) {
    case "sell":
      return { slug: "sell-seven-factor-analysis", label: "seven-factor analysis" };
    case "raise":
      return { slug: "raise-term-sheet-analysis", label: "term sheet analysis" };
    case "pmi":
      return { slug: "pmi-swot", label: "PMI SWOT analysis" };
    case "buy":
    default:
      return { slug: "buy-deal-scorecard", label: "deal scorecard" };
  }
}

export function primaryAnalysisActionForJourney(journey?: string | null): { analysisType: string; menuItemSlug?: string; label: string } {
  switch (journey) {
    case "sell":
      return { analysisType: "deal_scorecard", menuItemSlug: "sell-seven-factor-analysis", label: "seven-factor analysis" };
    case "raise":
      return { analysisType: "term_sheet", menuItemSlug: "raise-term-sheet-analysis", label: "term sheet analysis" };
    case "pmi":
      return { analysisType: "pmi_value_creation", menuItemSlug: "pmi-value-creation", label: "PMI value creation analysis" };
    case "buy":
    default:
      return { analysisType: "deal_scorecard", menuItemSlug: "buy-deal-scorecard", label: "deal scorecard" };
  }
}

export function docSlugForTemplate(templateId: string, journey?: string | null): { slug: string; label: string } | null {
  const lower = templateId.toLowerCase();
  if (lower.includes("loi") || lower.includes("ioi")) return { slug: "buy-loi-draft", label: "LOI draft" };
  if (lower.includes("memo")) return { slug: journey === "sell" ? "sell-executive-summary" : "buy-investment-thesis", label: "investment memo" };
  if (lower.includes("qoe")) return { slug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "QoE analysis" };
  if (lower.includes("apa")) return { slug: "buy-loi-draft", label: "transaction draft" };
  if (lower.includes("nda")) return null;
  return primaryDocForJourney(journey);
}

export function analysisSlugForTool(toolId: string, journey?: string | null): { slug: string; label: string } | null {
  switch (toolId) {
    case "tool-recast":
      return { slug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "recast analysis" };
    case "tool-comps":
      return { slug: "universal-comp-analysis", label: "comps analysis" };
    case "tool-val":
      return { slug: journey === "sell" ? "sell-valuation-report" : "buy-deal-scorecard", label: "valuation analysis" };
    case "tool-qoe":
      return { slug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "QoE analysis" };
    case "tool-buyer":
      return { slug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard", label: "buyer fit analysis" };
    case "tool-sba":
      return { slug: "universal-sba-analysis", label: "SBA structure analysis" };
    default:
      return null;
  }
}

export function analysisActionForTool(toolId: string, journey?: string | null): { analysisType: string; menuItemSlug?: string; label: string } | null {
  switch (toolId) {
    case "tool-recast":
      return { analysisType: "recast", menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "recast analysis" };
    case "tool-comps":
      return { analysisType: "comps", menuItemSlug: "universal-comp-analysis", label: "comps analysis" };
    case "tool-val":
      return { analysisType: "valuation", menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model", label: "valuation model" };
      case "tool-qoe":
        return { analysisType: "qoe", menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "QoE analysis" };
      case "tool-buyer":
        return { analysisType: "buyer_fit", menuItemSlug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard", label: "buyer fit analysis" };
      case "tool-sba":
        return { analysisType: "sba", menuItemSlug: "universal-sba-analysis", label: "SBA structure analysis" };
      case "tool-dcf":
        return { analysisType: "dcf", menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model", label: "DCF model" };
      case "tool-lbo":
        return { analysisType: "lbo", menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model", label: "LBO model" };
      case "tool-tax":
        return { analysisType: "tax_impact", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure", label: "tax impact model" };
      case "tool-earnout":
        return { analysisType: "earnout", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-earnout-analysis", label: "earnout model" };
      case "tool-sensitivity":
        return { analysisType: "sensitivity", menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model", label: "sensitivity model" };
      default:
        return null;
    }
}

export function analysisActionForSurfaceAction(actionId: SurfaceActionId, journey?: string | null): { analysisType: string; menuItemSlug?: string; label: string } | null {
  switch (actionId) {
    case "run_market_intelligence":
      return { analysisType: "market_intelligence", menuItemSlug: "universal-market-intelligence", label: "market intelligence read" };
    case "run_tax_legal_structure":
      return { analysisType: "tax_legal_structure", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure", label: "tax and legal implications model" };
    case "run_working_capital_analysis":
      return { analysisType: "working_capital", menuItemSlug: journey === "sell" ? "sell-working-capital-analysis" : "buy-working-capital-model", label: "working-capital analysis" };
    case "run_recast_analysis":
      return { analysisType: "recast", menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "recast analysis" };
    case "run_buyer_fit_analysis":
      return { analysisType: "buyer_fit", menuItemSlug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard", label: "buyer fit analysis" };
    case "run_valuation_analysis":
      return { analysisType: "valuation", menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model", label: "valuation model" };
    case "run_comps_analysis":
      return { analysisType: "comps", menuItemSlug: "universal-comp-analysis", label: "comps analysis" };
    case "run_capital_structure_model":
      return { analysisType: "capital_structure", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure", label: "capital structure model" };
    case "run_sba_analysis":
      return { analysisType: "sba", menuItemSlug: "universal-sba-analysis", label: "SBA structure analysis" };
      case "run_red_flags_analysis":
        return { analysisType: "red_flags", menuItemSlug: journey === "pmi" ? "pmi-ops-assessment" : journey === "sell" ? "sell-price-gap-analysis" : "buy-red-flag-report", label: "red-flag analysis" };
      case "run_qoe_analysis":
        return { analysisType: "qoe", menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard", label: "QoE analysis" };
      case "run_lbo_analysis":
        return { analysisType: "lbo", menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model", label: "LBO model" };
      case "run_dcf_analysis":
        return { analysisType: "dcf", menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model", label: "DCF model" };
      case "run_sensitivity_analysis":
        return { analysisType: "sensitivity", menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model", label: "sensitivity model" };
      case "run_earnout_analysis":
        return { analysisType: "earnout", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-earnout-analysis", label: "earnout model" };
      case "run_tax_impact_analysis":
        return { analysisType: "tax_impact", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure", label: "tax impact model" };
      case "run_purchase_price_allocation":
        return { analysisType: "purchase_price_allocation", menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure", label: "purchase-price allocation" };
      case "run_cap_table_analysis":
        return { analysisType: "cap_table", menuItemSlug: "raise-cap-table", label: "cap table model" };
      case "run_covenant_analysis":
        return { analysisType: "covenant", menuItemSlug: journey === "raise" ? "raise-use-of-funds" : "buy-capital-structure", label: "covenant model" };
      default:
        return null;
    }
}

export async function generateActionDeliverable({
  deal,
  slug,
  label,
  openTab,
  modelPreference,
  onNote,
}: GenerateActionInput) {
  const numericId = typeof deal.id === "number" ? deal.id : Number(deal.id);
  if (!Number.isFinite(numericId)) throw new Error("This action needs a real deal before it can generate a deliverable.");
  const result = await generateDealDeliverable({
    dealId: numericId,
    menuItemSlug: slug,
    modelPreference,
  });
  const dealName = actionDealTitle(deal);
  const deliverableTitle = result.title || label;
  onNote?.(`${deliverableTitle} is queued for ${dealName}. Opening the live deliverable tab.`);
  openTab({
    kind: "doc",
    title: `${dealName} · ${deliverableTitle}`,
    id: String(result.deliverableId),
  });
  return result;
}

export async function runActionAnalysis({
  deal,
  analysisType,
  label,
  openTab,
  menuItemSlug,
  modelPreference,
  requestedFrom,
  onNote,
}: AnalysisActionInput) {
  const numericId = typeof deal.id === "number" ? deal.id : Number(deal.id);
  if (!Number.isFinite(numericId)) throw new Error("This action needs a real deal before it can run an analysis.");
  const result = await runDealAnalysis({
    dealId: numericId,
    analysisType,
    menuItemSlug,
    modelPreference,
    requestedFrom,
  });
  const tab = result.tab;
  const dealName = actionDealTitle(deal);
  if (tab) {
    onNote?.(`${tab.title || label} is open as a live analysis canvas for ${dealName}.`);
    openTab({
      ...tab,
      kind: "analysis",
      title: tab.title || `${dealName} · ${label}`,
    });
  } else {
    onNote?.(`${label} is ready for ${dealName}. Opening the analysis canvas.`);
    openTab({
      kind: "analysis",
      title: `${dealName} · ${label}`,
      tool: analysisType,
      markdown: result.message,
      analysisData: result.analysisData,
      analysisRunId: result.analysisRunId ?? null,
      resolvedMenuItemSlug: result.resolvedMenuItemSlug,
    });
  }
  return result;
}

export async function runActionComparison({
  deals,
  openTab,
  title = "Deal comparison",
  modelPreference,
  requestedFrom,
  onNote,
}: {
  deals: ActionDeal[];
  openTab: OpenTab;
  title?: string;
  modelPreference?: ModelPreference;
  requestedFrom?: string;
  onNote?: (message: string | null) => void;
}) {
  const numericDealIds = deals
    .map(deal => typeof deal.id === "number" ? deal.id : Number(deal.id))
    .filter(Number.isFinite)
    .slice(0, 4);
  if (numericDealIds.length < 2) throw new Error("This comparison needs at least two real deals.");

  const result = await compareDealsAnalysis({
    dealIds: numericDealIds,
    title,
    modelPreference,
    requestedFrom,
  });
  const tab = result.tab;
  if (tab) {
    onNote?.(`${tab.title || title} is open as a live comparison canvas.`);
    openTab({
      ...tab,
      kind: "analysis",
      title: tab.title || title,
    });
  } else {
    onNote?.(`${title} is ready. Opening the comparison canvas.`);
    openTab({
      kind: "analysis",
      title,
      tool: "tool-compare",
      markdown: result.message,
      analysisData: result.analysisData,
      analysisRunId: result.analysisRunId ?? null,
    });
  }
  return result;
}

export async function executeSurfaceAction({
  actionId,
  openTab,
  deal,
  deals = [],
  document,
  fileScope,
  title,
  prompt,
  modelPreference,
  requestedFrom = "surface_action",
  onNote,
  onTalkToYulia,
}: SurfaceActionExecutionInput) {
  const contract = getSurfaceActionContract(actionId);
  const promptText = prompt || `${contract.label}. Use the active context and open the right surface if one is available.`;

  if (actionId === "ask_yulia") {
    onTalkToYulia?.(promptText);
    return { status: "sent_to_chat", actionId };
  }

  if (actionId === "optimize_scenario") {
    onTalkToYulia?.(`${promptText} Use optimize_scenario with tabId "active" first, then recommend the risk-adjusted path and execution steps from the saved model and evidence trail.`);
    return { status: "sent_to_chat", actionId };
  }

  if (actionId === "search_buyers" || actionId === "start_sourcing_run") {
    openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true });
    onTalkToYulia?.(promptText);
    return { status: "opened_search_and_sent_to_chat", actionId };
  }

  const modeId = modeForSurfaceAction(actionId);
  if (modeId) {
    openTab({ kind: "mode-root", modeId, id: `${modeId}-root`, title: contract.label.replace(/^Open /, ""), pinned: true });
    return { status: "opened_mode", actionId, modeId };
  }

  if (actionId === "open_deal") {
    if (!deal) {
      onTalkToYulia?.(promptText);
      throw new Error("Open Deal needs a real deal.");
    }
    openTab({ kind: "deal", id: String(deal.id), title: actionDealTitle(deal) });
    return { status: "opened_deal", actionId, dealId: deal.id };
  }

  if (isFileSurfaceAction(actionId)) {
    if (!deal) {
      onTalkToYulia?.(promptText);
      throw new Error(`${contract.label} needs a real deal.`);
    }
    const scope = fileScope || fileScopeForSurfaceAction(actionId);
    openTab({ kind: "deal", id: String(deal.id), title: actionDealTitle(deal), fileScope: scope });
    return { status: "opened_files", actionId, dealId: deal.id, fileScope: scope };
  }

  if (actionId === "open_document") {
    const docTitle = document?.title || title;
    if (!docTitle) {
      onTalkToYulia?.(promptText);
      throw new Error("Open Document needs a document title.");
    }
    openTab({
      kind: "doc",
      title: docTitle,
      id: document?.id != null ? String(document.id) : `doc-${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    });
    return { status: "opened_document", actionId, documentId: document?.id ?? null };
  }

  if (actionId === "compare_deals") {
    const scopedDeals = deals.length >= 2 ? deals : deal ? [deal] : [];
    return runActionComparison({
      deals: scopedDeals,
      openTab,
      title: title || contract.label,
      modelPreference,
      requestedFrom,
      onNote,
    });
  }

  if (actionId === "generate_primary_deliverable" || actionId === "generate_loi") {
    if (!deal) {
      onTalkToYulia?.(promptText);
      throw new Error(`${contract.label} needs a real deal.`);
    }
    const doc = actionId === "generate_loi"
      ? { slug: "buy-loi-draft", label: "LOI draft" }
      : primaryDocForJourney(deal.journey_type);
    return generateActionDeliverable({
      deal,
      slug: doc.slug,
      label: doc.label,
      openTab,
      modelPreference,
      onNote,
    });
  }

  if (contract.kind === "analysis") {
    const mapping = analysisActionForSurfaceAction(actionId, deal?.journey_type);
    if (!deal || !mapping) {
      onTalkToYulia?.(`${contract.label}. Use the active deal context and open the result as an interactive canvas.`);
      throw new Error(`${contract.label} needs an active real deal.`);
    }
    return runActionAnalysis({
      deal,
      analysisType: mapping.analysisType,
      menuItemSlug: mapping.menuItemSlug,
      label: mapping.label,
      openTab,
      modelPreference,
      requestedFrom,
      onNote,
    });
  }

  if (contract.requiresConfirmation || contract.result === "staged_confirmation") {
    onTalkToYulia?.(`${promptText} Stage the governed action for confirmation before anything is shared, filed, or sent.`);
    return { status: "sent_to_chat_for_confirmation", actionId };
  }

  if (contract.result === "chat") {
    onTalkToYulia?.(promptText);
    return { status: "sent_to_chat", actionId };
  }

  throw new Error(`${contract.label} is not wired through the dispatcher yet.`);
}

function modeForSurfaceAction(actionId: SurfaceActionId): ModeId | null {
  switch (actionId) {
    case "open_today":
      return "today";
    case "open_pipeline":
      return "pipeline";
    case "open_search":
    case "search_buyers":
    case "start_sourcing_run":
      return "search";
    case "open_files":
      return "files";
    default:
      return null;
  }
}

function isFileSurfaceAction(actionId: SurfaceActionId): boolean {
  return actionId === "open_files_all"
    || actionId === "open_files_data_room"
    || actionId === "open_files_shared"
    || actionId === "open_files_needing_action";
}

function fileScopeForSurfaceAction(actionId: SurfaceActionId): FileScope {
  switch (actionId) {
    case "open_files_data_room":
      return "data-room";
    case "open_files_shared":
    case "open_files_needing_action":
      return "shared";
    case "open_files_all":
    default:
      return "all";
  }
}

export function yuliaComparePrompt(deals: ActionDeal[]): string {
  const scoped = deals.slice(0, 3);
  const names = scoped.map(deal => `${actionDealTitle(deal)} (dealId ${deal.id})`).join(", ");
  const ids = scoped.map(deal => Number(deal.id)).filter(Number.isFinite);
  return names
    ? `Compare these deals side-by-side in the canvas: ${names}. Use compare_deals with dealIds [${ids.join(", ")}], include financials, current stage, fit, risks, and the next move.`
    : "Compare my top deals side-by-side in the canvas and tell me what deserves next action. Use compare_deals if deal IDs are available.";
}
