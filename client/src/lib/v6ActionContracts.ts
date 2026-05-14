import { compareDealsAnalysis, generateDealDeliverable, runDealAnalysis } from "../hooks/useV6WorkspaceData";
import type { ModelPreference } from "./modelPreference";
import type { OpenTab } from "../components/v6/types";
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
  title?: string;
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
      return { analysisType: "working_capital", menuItemSlug: journey === "sell" ? "sell-working-capital-analysis" : "buy-working-capital-model", label: "QoE / working-capital analysis" };
    case "tool-buyer":
      return { analysisType: "buyer_fit", menuItemSlug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard", label: "buyer fit analysis" };
    case "tool-sba":
      return { analysisType: "sba", menuItemSlug: "universal-sba-analysis", label: "SBA structure analysis" };
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
  title,
  modelPreference,
  requestedFrom = "surface_action",
  onNote,
  onTalkToYulia,
}: SurfaceActionExecutionInput) {
  const contract = getSurfaceActionContract(actionId);

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

  throw new Error(`${contract.label} is not wired through the dispatcher yet.`);
}

export function yuliaComparePrompt(deals: ActionDeal[]): string {
  const scoped = deals.slice(0, 3);
  const names = scoped.map(deal => `${actionDealTitle(deal)} (dealId ${deal.id})`).join(", ");
  const ids = scoped.map(deal => Number(deal.id)).filter(Number.isFinite);
  return names
    ? `Compare these deals side-by-side in the canvas: ${names}. Use compare_deals with dealIds [${ids.join(", ")}], include financials, current stage, fit, risks, and the next move.`
    : "Compare my top deals side-by-side in the canvas and tell me what deserves next action. Use compare_deals if deal IDs are available.";
}
