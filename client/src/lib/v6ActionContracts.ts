import { generateDealDeliverable } from "../hooks/useV6WorkspaceData";
import type { ModelPreference } from "./modelPreference";
import type { OpenTab } from "../components/v6/types";

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

export function yuliaComparePrompt(deals: ActionDeal[]): string {
  const names = deals.slice(0, 3).map(actionDealTitle).join(", ");
  return names
    ? `Compare these deals side-by-side and tell me what deserves next action: ${names}. Use the comparison tool if available, include financials, current stage, fit, risks, and the next move.`
    : "Compare my top deals side-by-side and tell me what deserves next action. Use the comparison tool if available.";
}
