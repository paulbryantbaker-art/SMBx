/**
 * Mobile screen data — fetches the authed user's deals once and shapes them
 * into the three slices the V6 mobile screens consume:
 *   - today    → Today screen "5 deals Yulia is working" pipeline rows
 *   - watching → Pipeline screen "Yulia is watching" list rows
 *   - picks    → Brief screen "Today's three picks" rows
 *   - featured → Pipeline screen "NEW TODAY" hero
 *
 * Anonymous callers get loading=false / loaded=true with empty arrays — the
 * consuming screens fall back to their hardcoded sample arrays in that case.
 *
 * Endpoint: GET /api/deals (server/routes/pipeline.ts) — returns deals with
 * revenue/sde/ebitda in cents, financials JSON, seven_factor_composite.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "./useAuth";
import type { Verdict, YIconKind } from "../components/v6/mobile/types";

export interface RawDeal {
  id: number;
  business_name: string | null;
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
}

export interface MobileWatchRow {
  id: string;
  rawId: number;
  icon: YIconKind;
  name: string;
  sub: string;
  pill: string;
}

export interface MobilePick {
  rank: number;
  id: string;
  rawId: number;
  name: string;
  sub: string;
  fit: number;
  kind: Verdict;
}

export interface MobileFeatured {
  id: string;
  rawId: number;
  name: string;
  sub: string;
  revLabel: string;  // "$5.4M REV"
  fit: number;
}

export interface UseMobileDealsResult {
  loading: boolean;
  loaded: boolean;
  isAuthed: boolean;
  hasData: boolean;
  today: MobilePipelineRow[];
  watching: MobileWatchRow[];
  picks: MobilePick[];
  featured: MobileFeatured | null;
}

const EMPTY: Omit<UseMobileDealsResult, "loading" | "loaded" | "isAuthed" | "hasData"> = {
  today: [],
  watching: [],
  picks: [],
  featured: null,
};

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
  return d.business_name?.trim() || `Deal #SMBX-${String(d.id).padStart(4, "0")}`;
}

function iconFor(verdict: Verdict): YIconKind {
  return verdict === "pursue" ? "cool" : "default";
}

function priceWord(verdict: Verdict): string {
  return verdict === "pursue" ? "Pursue" : verdict === "pass" ? "Pass" : "Watch";
}

/* ─── shape per-screen ────────────────────────────────────── */

function shape(deals: RawDeal[]): Omit<UseMobileDealsResult, "loading" | "loaded" | "isAuthed" | "hasData"> {
  const active = deals.filter(d => d.status === "active");
  if (active.length === 0) return EMPTY;

  // Sort by recency for the Today list (what Yulia is "currently working").
  const recent = [...active].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  // Today: top 5 most-recently-updated active deals.
  const today: MobilePipelineRow[] = recent.slice(0, 5).map(d => {
    const v = dealVerdict(d);
    const isOpen = v === "pursue";
    return {
      id: `deal-${d.id}`,
      rawId: d.id,
      icon: iconFor(v),
      name: nameOf(d),
      sub: buildSub(d),
      action: isOpen ? "open" : "get",
      ...(isOpen ? { verdict: v } : { price: priceWord(v) }),
    };
  });

  // Watching: 4 deals being tracked (mix of verdicts), skip the Today's hero
  // dupe by offsetting one. Falls back to recency when offset goes empty.
  const watchPool = recent.slice(1).length >= 4 ? recent.slice(1) : recent;
  const watching: MobileWatchRow[] = watchPool.slice(0, 4).map(d => {
    const v = dealVerdict(d);
    const sde = fmtMoney(d.sde, "SDE");
    return {
      id: `deal-${d.id}`,
      rawId: d.id,
      icon: iconFor(v),
      name: nameOf(d),
      sub: buildSub(d),
      pill: v === "pursue" && sde ? sde : priceWord(v),
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
    kind: dealVerdict(d),
  }));

  // Featured: highest-fit active deal for Pipeline's "NEW TODAY" hero.
  const top = ranked[0]?.d ?? recent[0];
  const featured: MobileFeatured | null = top
    ? {
        id: `deal-${top.id}`,
        rawId: top.id,
        name: nameOf(top),
        sub: buildSub(top),
        revLabel: fmtMoney(top.revenue, "REV") ?? fmtMoney(top.sde, "SDE") ?? "ACTIVE",
        fit: ranked[0]?.fit ?? fitScore(top),
      }
    : null;

  return { today, watching, picks, featured };
}

/* ─── hook ────────────────────────────────────────────────── */

export function useMobileDeals(user: User | null): UseMobileDealsResult {
  const [shaped, setShaped] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user) {
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
        setShaped(shape(rows));
        setHasData(rows.length > 0);
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
