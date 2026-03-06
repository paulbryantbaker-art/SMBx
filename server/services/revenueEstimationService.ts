/**
 * Revenue Estimation Service
 * Session 15: Estimates revenue from NAICS benchmarks + employee/review signals
 *
 * Methods:
 * 1. Employee count × Revenue Per Employee (from pre-cached QCEW + Damodaran data)
 * 2. Review count percentile within industry+geography (proxy for relative size)
 * Applies 0.7x private company discount to Damodaran public company benchmarks.
 */
import { sql } from '../db.js';

interface RevenueEstimate {
  estimatedLow: number;   // cents
  estimatedHigh: number;  // cents
  method: string;
  confidence: number;     // 0-1
}

/**
 * Estimate revenue for a business using NAICS benchmarks + available signals.
 */
export async function estimateRevenue(
  naicsCode: string,
  state: string | null,
  employeeCount: number | null,
  reviewCount: number | null,
): Promise<RevenueEstimate | null> {
  const prefix = naicsCode.substring(0, 4);

  // Look up NAICS benchmarks — try state-specific first, fall back to national
  let benchmark: any = null;
  if (state) {
    const [stateRow] = await sql`
      SELECT * FROM naics_benchmarks
      WHERE naics_code = ${prefix} AND state = ${state}
      LIMIT 1
    `;
    benchmark = stateRow;
  }
  if (!benchmark) {
    const [nationalRow] = await sql`
      SELECT * FROM naics_benchmarks
      WHERE naics_code = ${prefix} AND state IS NULL
      LIMIT 1
    `;
    benchmark = nationalRow;
  }

  if (!benchmark) return null;

  const PRIVATE_DISCOUNT = 0.7; // Damodaran RPE is from public companies
  const rpe = Number(benchmark.revenue_per_employee_cents) * PRIVATE_DISCOUNT;
  const medianRevenue = Number(benchmark.median_firm_revenue_cents);

  // Method 1: Employee-based estimation
  if (employeeCount && employeeCount > 0) {
    const midEstimate = employeeCount * rpe;
    const low = Math.round(midEstimate * 0.7);
    const high = Math.round(midEstimate * 1.3);

    return {
      estimatedLow: low,
      estimatedHigh: high,
      method: 'employee_rpe',
      confidence: employeeCount >= 5 ? 0.6 : 0.4,
    };
  }

  // Method 2: Review-count proxy (rough relative sizing against median)
  if (reviewCount && reviewCount > 0) {
    // Heuristic: median firm has ~30-50 reviews. Scale linearly with cap.
    const medianReviews = 40;
    const ratio = Math.min(reviewCount / medianReviews, 5.0);
    const midEstimate = Math.round(medianRevenue * ratio * PRIVATE_DISCOUNT);
    const low = Math.round(midEstimate * 0.5);
    const high = Math.round(midEstimate * 1.5);

    return {
      estimatedLow: low,
      estimatedHigh: high,
      method: 'review_proxy',
      confidence: 0.25,
    };
  }

  // Fallback: use median firm revenue with wide range
  return {
    estimatedLow: Math.round(medianRevenue * 0.3),
    estimatedHigh: Math.round(medianRevenue * 1.5),
    method: 'industry_median',
    confidence: 0.15,
  };
}

/**
 * Estimate and persist revenue for a company profile.
 */
export async function estimateAndSaveRevenue(companyProfileId: number): Promise<RevenueEstimate | null> {
  const [profile] = await sql`
    SELECT naics_code, location_state, employee_count, enrichment_data
    FROM company_profiles WHERE id = ${companyProfileId}
  `;
  if (!profile || !profile.naics_code) return null;

  // Don't overwrite reported revenue
  const [existing] = await sql`
    SELECT revenue_reported FROM company_profiles WHERE id = ${companyProfileId}
  `;
  if (existing?.revenue_reported) return null;

  const enrichment = profile.enrichment_data || {};
  const estimate = await estimateRevenue(
    profile.naics_code,
    profile.location_state,
    profile.employee_count,
    enrichment.reviewCount || null,
  );

  if (estimate) {
    await sql`
      UPDATE company_profiles
      SET revenue_estimated_low = ${estimate.estimatedLow},
          revenue_estimated_high = ${estimate.estimatedHigh},
          updated_at = NOW()
      WHERE id = ${companyProfileId}
    `;
  }

  return estimate;
}
