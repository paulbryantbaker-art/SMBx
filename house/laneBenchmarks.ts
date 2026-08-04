/**
 * house/laneBenchmarks.ts — the lane multiple bands behind the free owner
 * evaluation (SELLER_EVALUATION_PLAN.md §4, 2026-08-04).
 *
 * THE LAW OF THIS FILE: every band carries its published source and vintage,
 * verbatim from the practice's own audited assessments — the same figures the
 * public research pages state. No band may be invented, averaged, or
 * extrapolated here; a lane without a published band is `null` and the funnel
 * says so ("your lane's read is being built") instead of guessing. This is
 * the zero-hallucination rule wearing its pricing hat.
 *
 * Pure module: no db, no API, no env — the house/ doctrine, so the app and
 * any future local CLI compute identical answers.
 */

export interface LaneBand {
  /** Stable key used by the funnel and the registry. */
  key: string;
  /** How the lane reads to an owner. */
  label: string;
  /** Multiple band endpoints (on the basis below): low · market · high. */
  low: number;
  marketLow: number;
  marketHigh: number;
  high: number;
  /** What the multiple applies to at owner-operator scale. */
  basisNote: string;
  /** Named publisher + vintage — appears wherever the band appears. */
  source: string;
  /** The population the source measured. */
  scopeNote: string;
}

/** Bands published in the practice's assessments. Values are carried
 *  exactly as the reports state them; see each report's own source register
 *  for the underlying citation trail. */
export const LANE_BANDS: Record<string, LaneBand | null> = {
  hvac: {
    key: 'hvac',
    label: 'HVAC',
    low: 3.0, marketLow: 5.5, marketHigh: 7.0, high: 10.0,
    basisNote: 'adjusted EBITDA / SDE at owner-operator scale',
    source: 'CT Acquisitions, 2026 Home Services M&A Multiples Report (April 2026), as carried in smbX, "Home Services: State of the Market" (Aug 2026)',
    scopeNote: 'broker-published aggregate, $1M–$25M revenue',
  },
  plumbing: {
    key: 'plumbing',
    label: 'Plumbing',
    low: 2.4, marketLow: 4.0, marketHigh: 5.0, high: 6.5,
    basisNote: 'adjusted EBITDA / SDE at owner-operator scale',
    source: 'CT Acquisitions, 2026 Home Services M&A Multiples Report (April 2026), as carried in smbX, "Home Services: State of the Market" (Aug 2026)',
    scopeNote: 'broker-published aggregate, $1M–$25M revenue',
  },
  electrical: {
    key: 'electrical',
    label: 'Electrical',
    low: 3.2, marketLow: 5.0, marketHigh: 6.5, high: 8.0,
    basisNote: 'adjusted EBITDA / SDE at owner-operator scale',
    source: 'CT Acquisitions, 2026 Home Services M&A Multiples Report (April 2026), as carried in smbX, "Home Services: State of the Market" (Aug 2026)',
    scopeNote: 'broker-published aggregate, $1M–$25M revenue',
  },
  roofing: {
    key: 'roofing',
    label: 'Roofing',
    low: 2.5, marketLow: 4.0, marketHigh: 5.5, high: 7.0,
    basisNote: 'adjusted EBITDA / SDE at owner-operator scale',
    source: 'CT Acquisitions, 2026 Home Services M&A Multiples Report (April 2026), as carried in smbX, "Home Services: State of the Market" (Aug 2026)',
    scopeNote: 'broker-published aggregate, $1M–$25M revenue',
  },
  'pest-control': {
    key: 'pest-control',
    label: 'Pest control',
    low: 3.3, marketLow: 5.0, marketHigh: 6.0, high: 8.0,
    basisNote: 'adjusted EBITDA / SDE at owner-operator scale',
    source: 'CT Acquisitions, 2026 Home Services M&A Multiples Report (April 2026), as carried in smbX, "Home Services: State of the Market" (Aug 2026)',
    scopeNote: 'broker-published aggregate, $1M–$25M revenue (high end published as 8.0x+)',
  },
  'commercial-mechanical': {
    key: 'commercial-mechanical',
    label: 'Commercial mechanical / HVAC / plumbing',
    low: 6.0, marketLow: 8.0, marketHigh: 11.0, high: 11.0,
    basisNote: 'adjusted EBITDA; the spread is the service-mix arbitrage',
    source: 'smbX, "The U.S. Commercial Mechanical, HVAC & Plumbing Services Market" (July 2026)',
    scopeNote: 'project-led lower-middle-market contractor ≈6x; 8–11x with a real service book',
  },
  /* No published owner-operator band — the funnel captures the lead and says
   * the lane's read is being built. NEVER substitute a platform multiple
   * (Guild's 16x is trophy-recap pricing, not a shop's). */
  'garage-doors': null,
};

/** Size-tier context series (smbX, "Home Services: State of the Market",
 *  §1.3 cross-reference) — shown beside the lane band so a very small or
 *  very large business reads its own end of the market honestly. */
export const SIZE_TIERS = [
  { max: 500_000, label: 'Under $500K SDE', low: 2, high: 4, basis: 'SDE' },
  { max: 1_000_000, label: 'Under $1M EBITDA', low: 3, high: 5, basis: 'EBITDA' },
  { max: 2_000_000, label: 'Under $2M EBITDA', low: 4, high: 8, basis: 'EBITDA' },
  { max: Infinity, label: '$2M+ EBITDA with recurring revenue', low: 6, high: 11, basis: 'EBITDA' },
] as const;

export const SIZE_TIER_SOURCE =
  'smbX, "Home Services: State of the Market" (Aug 2026), §1.3 EBITDA-band cross-reference';

export function laneBand(key: string): LaneBand | null {
  return LANE_BANDS[key] ?? null;
}

export function supportedLanes(): LaneBand[] {
  return Object.values(LANE_BANDS).filter((b): b is LaneBand => b !== null);
}
