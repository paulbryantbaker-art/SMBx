/**
 * Sale-Readiness Scoring Service
 * Session 14: Scores company profiles on likelihood of being ready to sell
 *
 * Based on the Silver Tsunami thesis: 41-51% of small businesses are
 * owned by Baby Boomers. 56% cite retirement as primary exit motivation.
 */
import { sql } from '../db.js';

interface SaleSignal {
  signal: string;
  points: number;
  description: string;
}

interface SaleReadinessResult {
  score: number;
  signals: SaleSignal[];
  tier: 'hot' | 'warm' | 'cold' | 'unknown';
}

// Industries with known active consolidation
const CONSOLIDATION_INDUSTRIES = new Set([
  'hvac', 'dental', 'veterinary', 'pest control', 'plumbing',
  'landscaping', 'home services', 'auto repair', 'insurance agency',
  'accounting', 'it services', 'managed services', 'msp',
]);

/**
 * Score a company profile's sale readiness (0-100).
 */
export async function scoreSaleReadiness(companyProfileId: number): Promise<SaleReadinessResult> {
  const [profile] = await sql`SELECT * FROM company_profiles WHERE id = ${companyProfileId}`;
  if (!profile) return { score: 0, signals: [], tier: 'unknown' };

  const signals: SaleSignal[] = [];
  let score = 0;

  // ─── TIER 1: HIGH WEIGHT (60 pts max) ───

  // Business age (15 pts)
  const yearsInOp = profile.years_in_operation || (profile.founding_year ? new Date().getFullYear() - profile.founding_year : null);
  if (yearsInOp && yearsInOp >= 15) {
    const pts = Math.min(15, Math.round(yearsInOp * 0.75));
    score += pts;
    signals.push({ signal: 'business_age', points: pts, description: `Founded ${yearsInOp} years ago — owner likely approaching retirement` });
  }

  // Domain age (15 pts)
  if (profile.domain_registered_date) {
    const domainAge = (Date.now() - new Date(profile.domain_registered_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (domainAge >= 10) {
      score += 15;
      signals.push({ signal: 'domain_age', points: 15, description: `Domain registered ${Math.round(domainAge)} years ago` });
    } else if (domainAge >= 5) {
      score += 8;
      signals.push({ signal: 'domain_age', points: 8, description: `Domain registered ${Math.round(domainAge)} years ago` });
    }
  }

  // Deal status (20 pts)
  const dealStatus = profile.deal_status_v2 || profile.deal_status;
  if (dealStatus === 'listed') {
    score += 20;
    signals.push({ signal: 'deal_status', points: 20, description: 'Business is actively listed for sale' });
  } else if (dealStatus === 'exploring') {
    score += 15;
    signals.push({ signal: 'deal_status', points: 15, description: 'Owner is exploring sale options' });
  }

  // Consolidation industry (10 pts)
  const industry = (profile.industry || '').toLowerCase();
  const industryLabel = (profile.industry_label || '').toLowerCase();
  const isConsolidation = [...CONSOLIDATION_INDUSTRIES].some(ci =>
    industry.includes(ci) || industryLabel.includes(ci)
  );
  if (isConsolidation) {
    score += 10;
    signals.push({ signal: 'consolidation_industry', points: 10, description: 'Industry experiencing active consolidation' });
  }

  // ─── TIER 2: MEDIUM WEIGHT (30 pts max) ───

  // Low review velocity (10 pts)
  const enrichment = profile.enrichment_data || {};
  if (enrichment.reviewCount && enrichment.previousReviewCount) {
    const velocity = enrichment.reviewCount / Math.max(enrichment.previousReviewCount, 1);
    if (velocity < 0.5) {
      score += 10;
      signals.push({ signal: 'review_decline', points: 10, description: 'Google review volume declining — potential disengagement' });
    }
  }

  // Low review count for old business (5 pts)
  if (yearsInOp && yearsInOp > 15 && enrichment.reviewCount && enrichment.reviewCount < 20) {
    score += 5;
    signals.push({ signal: 'low_reviews_old_business', points: 5, description: 'Few reviews for a long-established business' });
  }

  // Website appears outdated (5 pts)
  if (enrichment.copyrightYear && enrichment.copyrightYear < new Date().getFullYear() - 2) {
    score += 5;
    signals.push({ signal: 'outdated_website', points: 5, description: `Website copyright is ${enrichment.copyrightYear} — may indicate reduced investment` });
  }

  // Single owner operation (10 pts) — from enrichment data
  if (profile.employee_count && profile.employee_count <= 5) {
    score += 5;
    signals.push({ signal: 'small_team', points: 5, description: 'Small team — likely owner-dependent operation' });
  }

  // ─── TIER 3: SUPPORTING (10 pts max) ───

  // Industry consolidation tailwinds (5 pts) — already counted above if in consolidation list
  // Revenue size sweet spot for acquisition (5 pts)
  const revenue = profile.revenue_reported || profile.revenue_estimated_low || 0;
  if (revenue > 50000000 && revenue < 500000000) { // $500K - $5M
    score += 5;
    signals.push({ signal: 'acquisition_sweet_spot', points: 5, description: 'Revenue in prime acquisition range' });
  }

  // Cap at 100
  score = Math.min(100, score);

  // Determine tier
  let tier: 'hot' | 'warm' | 'cold' | 'unknown';
  if (score >= 70) tier = 'hot';
  else if (score >= 50) tier = 'warm';
  else if (score >= 25) tier = 'cold';
  else tier = 'unknown';

  // Save to profile
  await sql`
    UPDATE company_profiles
    SET sale_readiness_score = ${score},
        sale_readiness_signals = ${JSON.stringify(signals)}::jsonb,
        updated_at = NOW()
    WHERE id = ${companyProfileId}
  `;

  return { score, signals, tier };
}

/**
 * Batch re-score all discovery targets for active buyer pipelines.
 * Called by weekly pg-boss job.
 */
export async function rescoreAllTargets(): Promise<{ scored: number }> {
  const targets = await sql`
    SELECT DISTINCT company_profile_id
    FROM discovery_targets
    WHERE buyer_status != 'passed'
  `;

  let scored = 0;
  for (const target of targets as any[]) {
    try {
      await scoreSaleReadiness(target.company_profile_id);
      scored++;
    } catch { /* continue */ }
  }

  console.log(`[saleReadiness] Re-scored ${scored} profiles`);
  return { scored };
}
