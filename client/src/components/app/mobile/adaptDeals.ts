/**
 * adaptDeals — map real AppDeal records to the display shape the
 * Apple-App-Store-style mobile surfaces expect.
 *
 * Real data (AppDeal) comes from authChat.grouped.deals. The v4 mobile UI
 * was designed against a richer mock shape (score, fit, tone, revenue,
 * dims). For v1, fields we don't have are null / fallback — consumers
 * must null-check and gracefully degrade.
 */

import type { AppDeal, AppConversation, StatusKind } from '../types';

/** Human-readable label for a gate code. Copied from the legacy DealTab. */
export const GATE_LABEL: Record<string, string> = {
  S0: 'Getting started', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Getting started', R1: 'Package', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

/** A short uppercase stage code for list/tile corners (S2, B3, etc.). */
export function stageCode(gate: string | null): string {
  return (gate || 'S0').toUpperCase();
}

/** Map gate + status to an urgency-dot kind. Early/no-gate or closed → draft
 *  (grey); middle gates → progress (amber); closing-adjacent → ready (green). */
export function urgencyFromGate(gate: string | null, status?: string | null): StatusKind {
  const s = (status || '').toLowerCase();
  if (s === 'closed' || s === 'archived' || s === 'dropped') return 'draft';
  if (!gate) return 'draft';
  if (/^(S4|S5|B4|B5|R4|R5|PMI3)$/.test(gate)) return 'ready';
  if (/^(S2|S3|B2|B3|R2|R3|PMI1|PMI2)$/.test(gate)) return 'progress';
  return 'draft';
}

/** Tone (ok / warn / flag / neutral) for list icon backgrounds.
 *  Mirrors urgency but with a 'flag' option for deals the user has
 *  explicitly flagged. Without a dedicated risk score in v1 we map:
 *     - closed/archived      → neutral (grey)
 *     - late gates (S4/S5+)  → ok (green)
 *     - mid gates            → warn (amber)
 *     - early/unknown        → neutral */
export function toneFromDeal(d: AppDeal): 'ok' | 'warn' | 'flag' | 'neutral' {
  const s = (d.status || '').toLowerCase();
  if (s === 'flagged' || s === 'flag') return 'flag';
  if (s === 'closed' || s === 'archived' || s === 'dropped') return 'neutral';
  const u = urgencyFromGate(d.current_gate, d.status);
  if (u === 'ready') return 'ok';
  if (u === 'progress') return 'warn';
  return 'neutral';
}

/** Two-letter initials from a business name (safe against nulls). */
export function initials(name: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return (parts[0].slice(0, 2) || '—').toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** The display shape mobile tabs consume. Purely derived from AppDeal —
 *  no synthetic numbers. Fields that can't be derived for a given deal
 *  are null and the UI gracefully omits the corresponding section. */
export interface MobileDeal {
  id: number;
  name: string;
  /** Short gate code — 'S2', 'B3', 'PMI1', etc. */
  stage: string;
  /** Long human label — 'Due diligence', 'Matching'. */
  stageLabel: string;
  industry: string;
  initials: string;
  /** Drives the list-icon background + the inbox dot. */
  tone: 'ok' | 'warn' | 'flag' | 'neutral';
  /** One-line kicker under the name in lists. */
  kicker: string;
  /** Drives status-dot color in deal switchers. */
  urgency: StatusKind;
  journeyType: string | null;
  conversations: AppConversation[];
  latestConversationId: number | null;
  updatedAt: string | null;
  // ── Financials ─────────────────────────────────────────────
  /** Pre-formatted dollar strings ("$4.1M") — null when source is null. */
  revenueLabel: string | null;
  sdeLabel: string | null;
  ebitdaLabel: string | null;
  askingPriceLabel: string | null;
  // ── Scoring ────────────────────────────────────────────────
  /** Composite 0-100. Null when not yet computed (fresh S0/S1 deals). */
  score: number | null;
  /** Per-factor scores from seven_factor_scores JSONB. */
  scoreFactors: Record<string, number> | null;
  // ── Operating ──────────────────────────────────────────────
  employeeCount: number | null;
}

/** Format BIGINT cents to a compact dollar string. Returns null for null/0/NaN.
 *  Examples: 410000000 → "$4.1M", 695000 → "$6.9K", 1200000000000 → "$1.2T". */
function formatMoney(cents: number | null | undefined): string | null {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return null;
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

export function adaptDeal(d: AppDeal): MobileDeal {
  const stage = stageCode(d.current_gate);
  const stageLabel = GATE_LABEL[stage] || 'Getting started';
  const latestConv = d.conversations?.[0] ?? null;
  const revenueLabel = formatMoney(d.revenue);
  // Kicker prefers industry · revenue · stage when revenue exists,
  // else falls back to industry · stage. Matches the App-Store list
  // density (one short subtitle line per row).
  const kickerParts = [d.industry, revenueLabel, stageLabel].filter(Boolean);
  const kicker = kickerParts.length > 0 ? kickerParts.join(' · ') : stageLabel;
  return {
    id: d.id,
    name: d.business_name || 'Untitled deal',
    stage,
    stageLabel,
    industry: d.industry || '',
    initials: initials(d.business_name),
    tone: toneFromDeal(d),
    kicker,
    urgency: urgencyFromGate(d.current_gate, d.status),
    journeyType: d.journey_type,
    conversations: d.conversations || [],
    latestConversationId: latestConv?.id ?? null,
    updatedAt: d.updated_at,
    revenueLabel,
    sdeLabel: formatMoney(d.sde),
    ebitdaLabel: formatMoney(d.ebitda),
    askingPriceLabel: formatMoney(d.asking_price),
    score: typeof d.seven_factor_composite === 'number' ? d.seven_factor_composite : null,
    scoreFactors: d.seven_factor_scores ?? null,
    employeeCount: typeof d.employee_count === 'number' ? d.employee_count : null,
  };
}

export function adaptDeals(deals: AppDeal[]): MobileDeal[] {
  return deals.map(adaptDeal);
}

/** Format a relative-ish timestamp — '2H', '3D', 'Apr 18'. Ultra-compact
 *  for inbox item right-rail text. Returns '' if no timestamp. */
export function formatAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const ms = Date.now() - then;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${Math.max(1, mins)}M`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}D`;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
