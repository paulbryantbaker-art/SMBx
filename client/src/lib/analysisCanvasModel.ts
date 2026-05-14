export type AnalysisTone = "pursue" | "watch" | "pass" | "neutral";

export interface StructuredMetric {
  key: string;
  label: string;
  value?: number | string | null;
  displayValue: string;
  sub?: string;
  tone?: AnalysisTone;
}

export interface StructuredChart {
  type: "bar" | "range" | "matrix";
  title: string;
  data: Array<Record<string, unknown>>;
}

export interface StructuredTable {
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
}

export interface StructuredEvidenceRef {
  label: string;
  type: "deal_fact" | "financial_fact" | "market_signal" | "methodology" | "user_assumption";
  source: string;
  value?: string;
  detail?: string;
  confidence?: "high" | "medium" | "low";
}

export interface StructuredAnalysisData {
  schemaVersion: "analysis-runtime-v1";
  analysisType: string;
  title: string;
  summary: string;
  verdict?: { label: string; tone: AnalysisTone; score?: number; rationale: string };
  methodologyRefs?: string[];
  evidenceRefs?: StructuredEvidenceRef[];
  inputs?: Array<{ key: string; label: string; displayValue: string; source?: string }>;
  assumptions?: StructuredAssumption[];
  metrics?: StructuredMetric[];
  charts?: StructuredChart[];
  tables?: StructuredTable[];
  risks?: Array<{ label: string; detail: string; severity: "low" | "medium" | "high"; trigger?: string }>;
  missingData?: Array<{ label: string; why: string; priority: "low" | "medium" | "high" }>;
  professionalTriggers?: Array<{ role: string; trigger: string; why: string }>;
  nextActions?: Array<{
    label: string;
    actionType: string;
    prompt: string;
    surfaceActionId?: string;
    analysisType?: string;
    fileScope?: "all" | "data-room" | "shared";
    targetDealId?: number;
    targetDealTitle?: string;
  }>;
  yuliaRead?: string;
  calculations?: Record<string, unknown>;
}

export interface StructuredAssumption {
  key: string;
  label: string;
  value?: unknown;
  displayValue: string;
}

export interface ScenarioSliderConfig {
  min: number;
  max: number;
  step: number;
}

const MONEY_ASSUMPTION_KEYS = new Set([
  "working_capital_peg",
  "accounts_receivable",
  "inventory",
  "owner_salary",
  "non_recurring_expenses",
  "personal_expenses",
  "one_time_professional_fees",
  "family_payroll_adjustment",
  "pre_money_cents",
  "raise_amount_cents",
]);

const NUMBER_ASSUMPTION_KEYS = new Set([
  "hold_period_years",
  "earnout_period_months",
  "min_dscr",
  "max_debt_to_ebitda",
]);

export function isStructuredAnalysis(value: unknown): value is StructuredAnalysisData {
  return Boolean(value && typeof value === "object" && (value as Record<string, unknown>).schemaVersion === "analysis-runtime-v1");
}

export function patchStructuredDataAssumptions(data: StructuredAnalysisData, updates: Record<string, unknown>): StructuredAnalysisData {
  if (!Array.isArray(data.assumptions)) return data;
  return {
    ...data,
    assumptions: data.assumptions.map(assumption => {
      if (updates[assumption.key] === undefined) return assumption;
      const value = updates[assumption.key];
      return {
        ...assumption,
        value,
        displayValue: formatAssumptionDisplay(assumption.key, value),
      };
    }),
  };
}

export function isMoneyAssumptionKey(key: string): boolean {
  return key.endsWith("_cents") || MONEY_ASSUMPTION_KEYS.has(key);
}

export function isPctAssumptionKey(key: string): boolean {
  return key.endsWith("_pct") || key === "interest_rate";
}

export function isMultipleAssumptionKey(key: string): boolean {
  return key.endsWith("_multiple") || key === "low_multiple" || key === "high_multiple";
}

export function numericAssumptionValue(item: StructuredAssumption): number | null {
  if (typeof item.value === "number" && Number.isFinite(item.value)) return item.value;
  const raw = typeof item.value === "string" ? item.value : item.displayValue;
  const text = String(raw ?? "").trim().toLowerCase().replace(/,/g, "");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  if (!Number.isFinite(n)) return null;
  if (isMoneyAssumptionKey(item.key)) {
    if (text.includes("m")) return Math.round(n * 1_000_000 * 100);
    if (text.includes("k")) return Math.round(n * 1_000 * 100);
    if (text.includes("$")) return Math.round(n * 100);
  }
  if (isPctAssumptionKey(item.key)) return text.includes("%") || n > 1 ? n / 100 : n;
  return n;
}

export function sliderConfigForAssumption(item: StructuredAssumption): ScenarioSliderConfig | null {
  const base = numericAssumptionValue(item);
  if (base == null) return null;
  if (isMoneyAssumptionKey(item.key)) {
    const floor = Math.max(0, Math.round(base * 0.5));
    const ceiling = Math.max(floor + 100_000, Math.round(base * 1.5));
    return { min: floor, max: ceiling, step: niceMoneyStep(base) };
  }
  if (isMultipleAssumptionKey(item.key)) {
    return { min: Math.max(1, Number((base - 3).toFixed(1))), max: Math.min(20, Number((base + 3).toFixed(1))), step: 0.1 };
  }
    if (isPctAssumptionKey(item.key)) {
      if (item.key === "interest_rate") return { min: 0.02, max: 0.18, step: 0.0025 };
      if (item.key.includes("debt") || item.key.includes("seller_note")) return { min: 0, max: 1, step: 0.025 };
      if (item.key === "customer_concentration_pct") return { min: 0, max: 0.8, step: 0.01 };
      return { min: 0, max: 1, step: 0.01 };
    }
  if (NUMBER_ASSUMPTION_KEYS.has(item.key)) {
    if (item.key === "hold_period_years") return { min: 1, max: 10, step: 1 };
    if (item.key === "earnout_period_months") return { min: 6, max: 60, step: 6 };
    if (item.key === "min_dscr") return { min: 1, max: 2, step: 0.05 };
    if (item.key === "max_debt_to_ebitda") return { min: 1, max: 6, step: 0.1 };
  }
    return null;
  }

export function syncLinkedAssumptions(prev: Record<string, number>, key: string, value: number): Record<string, number> {
  const next = { ...prev, [key]: value };
  if (key === "low_multiple" && next.high_multiple != null && value > next.high_multiple) next.high_multiple = value;
  if (key === "high_multiple" && next.low_multiple != null && value < next.low_multiple) next.low_multiple = value;
  return next;
}

export function defaultScenarioName(title: string): string {
  return `${title.replace(/\s+/g, " ").trim() || "Analysis"} scenario`;
}

export function formatAssumptionDisplay(key: string, value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value ?? "—");
  if (isMoneyAssumptionKey(key)) return formatCents(n);
  if (isPctAssumptionKey(key)) return formatPct(n);
  if (isMultipleAssumptionKey(key)) return `${n.toFixed(1)}x`;
  return n.toLocaleString();
}

export function formatCents(cents: number): string {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1_000).toLocaleString()}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(value < 0.1 && value > -0.1 ? 1 : 0)}%`;
}

function niceMoneyStep(base: number): number {
  if (base >= 10_000_000_00) return 5_000_000;
  if (base >= 1_000_000_00) return 1_000_000;
  if (base >= 100_000_00) return 250_000;
  return 100_000;
}
