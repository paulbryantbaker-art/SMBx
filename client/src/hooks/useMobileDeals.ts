/**
 * Cross-platform deal data — fetches the authed user's deals once and shapes
 * them into the slices BOTH the V6 mobile screens AND the desktop Today/
 * Pipeline roots consume:
 *   - today    → "Deals in motion" rows (mobile Today + desktop TodayRoot)
 *   - picks    → "Yulia's ranked read" rows
 *   - featured → highest-fit hero (mobile Today/Pipeline + desktop KPI)
 *   - all      → every deal tagged with pipeline stage (mobile Pipeline)
 *
 * ── ORDERING / SLICE RULE (one rule, both platforms) ─────────────────────
 * "Deals in motion" = ACTIVE deals ordered by updated_at DESC.
 * The `today` slice is the first TODAY_DEAL_CAP (10) rows of that ordering
 * and is THE single source for mobile Today and desktop TodayRoot — both
 * render these exact rows in this exact order, so the platforms can never
 * disagree. House list law: short-list surfaces cap at 10 rows with the
 * section header (and/or a tail row) opening the full deals list, and full
 * deals lists paginate client-side at 100 rows per "Show next 100" page.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Anonymous callers get loading=false / loaded=true with empty arrays — the
 * consuming screens fall back to their hardcoded sample arrays in that case.
 *
 * Endpoint: GET /api/deals (server/routes/pipeline.ts) — returns deals with
 * revenue/sde/ebitda in cents, financials JSON, seven_factor_composite.
 */
import { useEffect, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";
import type { Verdict, YIconKind } from "../components/v6/mobile/types";
import { stageForGate, type PipelineStageId } from "../lib/pipelineStages";

export interface RawDeal {
  id: number;
  business_name: string | null;
  name: string | null;
  is_favorite: boolean | null;
  disposition: string | null;
  industry: string | null;
  location: string | null;
  league: string | null;
  journey_type: string | null;
  current_gate: string;
  status: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  seven_factor_composite: number | null;
  financials: {
    multiple?: number;
    status_label?: string;
    sample_id?: string;
    notes?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface MobilePipelineRow {
  id: string;        // route key — "deal-<id>"
  rawId: number;
  icon: YIconKind;
  name: string;
  sub: string;
  action: "open" | "get";
  verdict?: Verdict;
  price?: string;
  /** Fit score (composite/multiple-derived) — lets Today derive its hero
   *  from real rows instead of hardcoded sample copy. */
  fit?: number;
  /** True when `fit` is backed by a real seven_factor_composite or a real
   *  financials.multiple — display the numeral ONLY when true. Synthetic
   *  (id-hash) fits may still ORDER deals but must never render. */
  fitIsReal?: boolean;
  /** Headline money figure for hero surfaces, value-only (e.g. "$5.4M"). */
  metricValue?: string;
  /** Label for metricValue (e.g. "Revenue", "SDE"). */
  metricLabel?: string;
}

export interface MobilePick {
  rank: number;
  id: string;
  rawId: number;
  name: string;
  sub: string;
  fit: number;
  /** True when `fit` is composite- or multiple-backed. Synthetic fits keep
   *  ordering the picks but the numeral renders ONLY when this is true. */
  fitIsReal: boolean;
  kind: Verdict;
}

export interface MobileFeatured {
  id: string;
  rawId: number;
  name: string;
  sub: string;
  revLabel: string;  // "$5.4M revenue"
  fit: number;
  /** True when `fit` is composite- or multiple-backed — the hero fit numeral
   *  renders ONLY when true (synthetic fits never display). */
  fitIsReal: boolean;
  verdict: Verdict;
  /** Headline money figure for hero surfaces, value-only (e.g. "$5.4M"). */
  metricValue?: string;
  /** Label for metricValue (e.g. "Revenue", "SDE"). */
  metricLabel?: string;
}

/** Every deal the user owns, tagged with its pipeline stage — for the full
 *  stage-grouped mobile Pipeline. */
export interface MobileStageRow {
  id: string;
  rawId: number;
  name: string;
  sub: string;
  verdict: Verdict;
  gate: string;
  stageId: PipelineStageId;
  /** Raw financials in CENTS (passthrough from RawDeal) — for Pipeline
   *  financial columns. Null when the deal record has no value. */
  sde: number | null;
  askingPrice: number | null;
  ebitda: number | null;
  /** seven_factor_composite clamped to 0–99, or null when the deal has no
   *  real composite — do NOT substitute a fabricated score here. */
  fit: number | null;
  /** User-starred (sorts first on the board) + workflow disposition. */
  isFavorite: boolean;
  disposition: string;
}

export interface UseMobileDealsResult {
  loading: boolean;
  loaded: boolean;
  isAuthed: boolean;
  hasData: boolean;
  today: MobilePipelineRow[];
  picks: MobilePick[];
  featured: MobileFeatured | null;
  all: MobileStageRow[];
}

const EMPTY: Omit<UseMobileDealsResult, "loading" | "loaded" | "isAuthed" | "hasData"> = {
  today: [],
  picks: [],
  featured: null,
  all: [],
};

/** Short-list cap for "Deals in motion" — see the ordering/slice rule above. */
const TODAY_DEAL_CAP = 10;

/* ─── derivation helpers ──────────────────────────────────── */

function dealVerdict(d: RawDeal): Verdict {
  const label = (d.financials?.status_label ?? "").toLowerCase();
  if (/loi|closing|negotiat|pursu|signed/.test(label)) return "pursue";
  if (/pass|cold|drop|reject/.test(label)) return "pass";
  // gate-based fallback when status_label is missing
  const gate = d.current_gate ?? "";
  if (/[BSR]4|[BSR]5/.test(gate)) return "pursue";
  return "watch";
}

function fitScore(d: RawDeal): number {
  if (typeof d.seven_factor_composite === "number") {
    return Math.max(0, Math.min(99, d.seven_factor_composite));
  }
  const m = d.financials?.multiple;
  if (typeof m === "number") {
    // 3.0× → 60, 5.0× → 80, 7.0× → 96
    return Math.max(40, Math.min(99, Math.round(50 + (m - 3) * 12)));
  }
  // Stable hash from id, range 65-95
  return 65 + (d.id * 31) % 31;
}

function fmtMoney(cents: number | null, suffix: string): string | null {
  if (typeof cents !== "number" || cents <= 0) return null;
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M ${suffix}`;
  if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K ${suffix}`;
  return `$${Math.round(dollars)} ${suffix}`;
}

/** Value-only money format ("$5.4M") — for hero numerals where the label
 *  renders separately. */
function fmtMoneyValue(cents: number | null): string | null {
  if (typeof cents !== "number" || cents <= 0) return null;
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars)}`;
}

/** Honest fit: the real seven_factor_composite (clamped 0–99) or null.
 *  Unlike fitScore() below, this never invents a number. */
function compositeFit(d: RawDeal): number | null {
  if (typeof d.seven_factor_composite === "number") {
    return Math.max(0, Math.min(99, d.seven_factor_composite));
  }
  return null;
}

/** Whether fitScore(d) is backed by real data (composite or multiple) rather
 *  than the synthetic id-hash fallback. Display chains must only render the
 *  fit numeral when this is true — synthetic fits may still order lists. */
function fitIsRealFor(d: RawDeal): boolean {
  return (
    typeof d.seven_factor_composite === "number" ||
    typeof d.financials?.multiple === "number"
  );
}

function buildSub(d: RawDeal): string {
  const sde   = fmtMoney(d.sde, "SDE");
  const rev   = fmtMoney(d.revenue, "rev");
  const where = d.location ?? d.industry;
  if (sde && where) return `${sde} · ${where}`;
  if (rev && where) return `${rev} · ${where}`;
  if (sde) return sde;
  if (d.industry && d.location) return `${d.industry} · ${d.location}`;
  return d.industry ?? d.location ?? d.financials?.status_label ?? "Active deal";
}

function nameOf(d: RawDeal): string {
  // A user rename (deals.name) wins over the imported business_name.
  return d.name?.trim() || d.business_name?.trim() || `Deal #SMBX-${String(d.id).padStart(4, "0")}`;
}

function iconFor(verdict: Verdict): YIconKind {
  return verdict === "pursue" ? "cool" : "default";
}

function priceWord(verdict: Verdict): string {
  return verdict === "pursue" ? "Pursue" : verdict === "pass" ? "Pass" : "Watch";
}

/* ─── normalization ───────────────────────────────────────── */

/** postgres-js returns numeric/bigint columns as STRINGS. RawDeal declares them
 *  `number`, so the money formatters (which guard `typeof === "number"`) reject
 *  the string and fall through to "Active"/null. Coerce once at the fetch
 *  boundary — same fix as useV6WorkspaceData — so the hero metric, mobile money
 *  columns, and fit all read real values. */
function toNum(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function normalizeRawDeal(raw: any): RawDeal {
  return {
    ...raw,
    revenue: toNum(raw?.revenue),
    sde: toNum(raw?.sde),
    ebitda: toNum(raw?.ebitda),
    asking_price: toNum(raw?.asking_price),
    seven_factor_composite: toNum(raw?.seven_factor_composite),
  };
}

/* ─── shape per-screen ────────────────────────────────────── */

function shape(deals: RawDeal[]): Omit<UseMobileDealsResult, "loading" | "loaded" | "isAuthed" | "hasData"> {
  // Full pipeline: every deal the user owns (all statuses), tagged with its
  // gate-derived stage so the mobile Pipeline can group them like desktop.
  const all: MobileStageRow[] = deals.map(d => {
    const v = dealVerdict(d);
    // Stage rows carry their financials in the right-aligned money stack, so
    // the sub prefers industry/location meta over the SDE-led buildSub line
    // (avoids printing SDE twice on one row).
    const meta = [d.industry, d.location].filter(Boolean).join(" · ");
    return {
      id: `deal-${d.id}`,
      rawId: d.id,
      name: nameOf(d),
      sub: meta || buildSub(d),
      verdict: v,
      gate: d.current_gate || "B2",
      stageId: stageForGate(d.current_gate || "B2"),
      sde: d.sde ?? null,
      askingPrice: d.asking_price ?? null,
      ebitda: d.ebitda ?? null,
      fit: compositeFit(d),
      isFavorite: d.is_favorite === true,
      disposition: d.disposition || "active",
    };
  });

  const active = deals.filter(d => d.status === "active");
  if (active.length === 0) return { ...EMPTY, all };

  // THE ordering rule: active deals by updated_at DESC ("deals in motion").
  const recent = [...active].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  // Today: top TODAY_DEAL_CAP (10) most-recently-updated active deals —
  // the same rows on mobile Today and desktop TodayRoot.
  const today: MobilePipelineRow[] = recent.slice(0, TODAY_DEAL_CAP).map(d => {
    const v = dealVerdict(d);
    const isOpen = v === "pursue";
    const revValue = fmtMoneyValue(d.revenue);
    const sdeValue = fmtMoneyValue(d.sde);
    return {
      id: `deal-${d.id}`,
      rawId: d.id,
      icon: iconFor(v),
      name: nameOf(d),
      sub: buildSub(d),
      action: isOpen ? "open" : "get",
      verdict: v,
      ...(isOpen ? {} : { price: priceWord(v) }),
      fit: fitScore(d),
      fitIsReal: fitIsRealFor(d),
      ...(revValue
        ? { metricValue: revValue, metricLabel: "Revenue" }
        : sdeValue
          ? { metricValue: sdeValue, metricLabel: "SDE" }
          : {}),
    };
  });

  // Picks: top 3 active deals by fit score.
  const ranked = [...active]
    .map(d => ({ d, fit: fitScore(d) }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 3);
  const picks: MobilePick[] = ranked.map(({ d, fit }, i) => ({
    rank: i + 1,
    id: `deal-${d.id}`,
    rawId: d.id,
    name: nameOf(d),
    sub: buildSub(d),
    fit,
    fitIsReal: fitIsRealFor(d),
    kind: dealVerdict(d),
  }));

  // Featured: highest-fit active deal for Pipeline's "NEW TODAY" hero and
  // Today's daily hero (the two surfaces share this exact object).
  const top = ranked[0]?.d ?? recent[0];
  const topRev = top ? fmtMoneyValue(top.revenue) : null;
  const topSde = top ? fmtMoneyValue(top.sde) : null;
  const featured: MobileFeatured | null = top
    ? {
        id: `deal-${top.id}`,
        rawId: top.id,
        name: nameOf(top),
        sub: buildSub(top),
        revLabel: fmtMoney(top.revenue, "revenue") ?? fmtMoney(top.sde, "SDE") ?? "Active",
        fit: ranked[0]?.fit ?? fitScore(top),
        fitIsReal: fitIsRealFor(top),
        verdict: dealVerdict(top),
        ...(topRev
          ? { metricValue: topRev, metricLabel: "Revenue" }
          : topSde
            ? { metricValue: topSde, metricLabel: "SDE" }
            : {}),
      }
    : null;

  return { today, picks, featured, all };
}

/* ─── hook ────────────────────────────────────────────────── */

export function useMobileDeals(user: User | null): UseMobileDealsResult {
  const [shaped, setShaped] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) {
      setShaped(EMPTY);
      setLoaded(true);
      setHasData(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    fetch("/api/deals", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((rows: RawDeal[]) => {
        if (cancelled) return;
        const normalized = Array.isArray(rows) ? rows.map(normalizeRawDeal) : [];
        setShaped(shape(normalized));
        setHasData(normalized.length > 0);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        console.error("[useMobileDeals] fetch failed:", e.message);
        setShaped(EMPTY);
        setHasData(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { ...shaped, loading, loaded, isAuthed: !!user, hasData };
}
