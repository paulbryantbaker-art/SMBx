/**
 * Thesis Document Generator — B0 Completion Deliverable
 *
 * Generates a buyer's acquisition thesis document with criteria table,
 * SBA financing snapshot, and platform match intelligence.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

export interface ThesisInput {
  buyer_type?: string;
  target_industry?: string;
  target_geography?: string;
  revenue_min?: number;       // cents
  revenue_max?: number;       // cents
  capital_available?: number; // cents
  financing_approach?: string;
  target_size_range?: string;
  league: string;
  prefers_sba?: boolean;
  session_id: string;
}

function centsToDisplay(cents: number | undefined | null): string {
  if (!cents) return 'Not specified';
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

function centsToNumber(cents: number | undefined | null): number {
  return cents ? cents / 100 : 0;
}

function formatBuyerType(bt?: string): string {
  const labels: Record<string, string> = {
    individual_operator: 'Individual Operator',
    search_fund: 'Search Fund',
    pe_firm: 'Private Equity Firm',
    strategic: 'Strategic Acquirer',
    family_office: 'Family Office',
    individual: 'Individual Buyer',
    searcher: 'Search Fund / ETA',
  };
  return labels[bt || ''] || bt || 'Individual Buyer';
}

/**
 * Generate the Thesis Document.
 * Returns markdown content suitable for saving as an assistant message.
 */
export async function generateThesisDocument(input: ThesisInput): Promise<string> {
  const {
    buyer_type, target_industry, target_geography, capital_available,
    financing_approach, target_size_range, league, prefers_sba, session_id,
  } = input;

  const equityDollars = centsToNumber(capital_available);

  // Parse revenue range from target_size_range or estimate from equity
  let revMinDollars = 0;
  let revMaxDollars = 0;
  if (target_size_range) {
    // Parse "$1M-$3M" or "$500K-$2M" etc.
    const matches = target_size_range.match(/\$?([\d.]+)\s*([MmKk])?/g);
    if (matches && matches.length >= 2) {
      revMinDollars = parseAmount(matches[0]);
      revMaxDollars = parseAmount(matches[1]);
    } else if (matches && matches.length === 1) {
      revMaxDollars = parseAmount(matches[0]);
      revMinDollars = revMaxDollars * 0.5;
    }
  }
  if (!revMaxDollars && equityDollars) {
    // Estimate deal size from equity (assume 10-20% equity injection)
    revMaxDollars = equityDollars * 5; // rough 5x equity = deal size ≈ revenue
    revMinDollars = equityDollars * 2;
  }

  // Deal value estimates (roughly 2-4x revenue for SMB)
  const dealValueMin = revMinDollars > 0 ? revMinDollars * 2 : equityDollars * 3;
  const dealValueMax = revMaxDollars > 0 ? revMaxDollars * 4 : equityDollars * 8;

  // SBA financing snapshot
  const sbaEligible = !prefers_sba ? 'Open to it' : 'Yes';
  const loanAmount = equityDollars > 0 ? equityDollars * 9 : dealValueMax * 0.9; // 90% LTV
  const sbaRate = 11.5; // approximate current SBA rate
  const monthlyPayment = loanAmount > 0
    ? (loanAmount * (sbaRate / 100 / 12)) / (1 - Math.pow(1 + sbaRate / 100 / 12, -120))
    : 0;
  const sdeRequired = monthlyPayment > 0 ? monthlyPayment * 12 / 0.8 : 0; // DSCR 1.25 = SDE must be 1.25x debt service

  // Query internal matches
  let internalMatches = 0;
  let broaderMatches = 0;
  try {
    if (target_industry) {
      const industryLower = target_industry.toLowerCase();
      // Exact matches: industry + geography
      if (target_geography) {
        const [row] = await sql`
          SELECT COUNT(*)::int as count FROM company_profiles
          WHERE LOWER(industry) LIKE ${'%' + industryLower + '%'}
            AND (LOWER(location_state) = ${target_geography.toLowerCase()}
              OR LOWER(city) LIKE ${'%' + target_geography.toLowerCase() + '%'})
        `;
        internalMatches = row?.count || 0;
      }
      // Broader matches: just industry
      const [broaderRow] = await sql`
        SELECT COUNT(*)::int as count FROM company_profiles
        WHERE LOWER(industry) LIKE ${'%' + industryLower + '%'}
      `;
      broaderMatches = (broaderRow?.count || 0) - internalMatches;
      if (broaderMatches < 0) broaderMatches = 0;
    }
  } catch (_e) { /* non-critical */ }

  // Build the document
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const report = `## Acquisition Thesis
### Your Thesis | Generated ${today}

**Summary:** You are a **${formatBuyerType(buyer_type)}** seeking to acquire a **${target_industry || 'business services'}** business in **${target_geography || 'flexible geography'}**, with ${revMinDollars > 0 ? `${formatDollars(revMinDollars)}–${formatDollars(revMaxDollars)}` : target_size_range || 'target size TBD'} in revenue, using approximately **${centsToDisplay(capital_available)}** in equity.

---

### Acquisition Criteria

| Criterion | Your Target |
|-----------|-------------|
| Buyer Type | ${formatBuyerType(buyer_type)} |
| Target Industries | ${target_industry || 'Not yet specified'} |
| Geography | ${target_geography || 'Flexible'} |
| Revenue Range | ${revMinDollars > 0 ? `${formatDollars(revMinDollars)} – ${formatDollars(revMaxDollars)}` : target_size_range || 'Not yet specified'} |
| Deal Value Range | ${dealValueMin > 0 ? `${formatDollars(dealValueMin)} – ${formatDollars(dealValueMax)}` : 'Not yet estimated'} |
| Equity Available | ${centsToDisplay(capital_available)} |
| SBA Financing | ${financing_approach || sbaEligible} |

---

### Financing Snapshot

At your target deal size and equity investment:
- **SBA 7(a) loan amount:** ${loanAmount > 0 ? formatDollars(loanAmount) : 'Depends on deal size'} (at 90% LTV)
- **Estimated monthly payment:** ${monthlyPayment > 0 ? formatDollars(monthlyPayment) : 'TBD'} (at ~${sbaRate}% SBA rate, 10-year term)
- **DSCR required:** 1.25x minimum
- **SDE needed to qualify:** ${sdeRequired > 0 ? formatDollars(sdeRequired) : 'TBD'} minimum

${equityDollars > 0 ? `With **${formatDollars(equityDollars)}** in equity, your maximum SBA-backed acquisition is approximately **${formatDollars(equityDollars * 10)}** (at 10% equity injection). If you can combine equity sources (cash + ROBS + HELOC), your buying power increases proportionally.` : ''}

---

### Platform Match Intelligence

Right now on the smbX.ai platform:
- **${internalMatches} business${internalMatches !== 1 ? 'es' : ''}** match your core criteria (industry${target_geography ? ' + geography' : ''})
- **${broaderMatches} additional business${broaderMatches !== 1 ? 'es' : ''}** are in adjacent industries or geographies

---

### What Happens Next

1. **Yulia will show you matching opportunities** — both listed deals and off-market intelligence
2. **You'll evaluate and score each target** — Yulia scores thesis fit, SBA eligibility, and risk
3. **For strong matches:** Yulia generates a Deal Screening Memo for any target you want to pursue
4. **When you're ready to make an offer:** Yulia drafts the IOI and LOI

*This Thesis Document is saved to your profile. Share it with your lender or SBA advisor to demonstrate deal readiness.*`;

  // Save to theses table
  try {
    await sql`
      UPDATE theses
      SET thesis_document = ${report},
          thesis_document_generated_at = NOW(),
          internal_match_count = ${internalMatches + broaderMatches},
          last_match_scan_at = NOW(),
          updated_at = NOW()
      WHERE session_id = ${session_id} AND is_active = true
    `;
  } catch (_e) { /* non-critical */ }

  return report;
}

// ─── Helpers ─────────────────────────────────────────────────

function parseAmount(s: string): number {
  const cleaned = s.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  const upper = s.toUpperCase();
  if (upper.includes('M')) return num * 1_000_000;
  if (upper.includes('K')) return num * 1_000;
  if (num < 100) return num * 1_000_000; // assume millions if bare number < 100
  return num;
}

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount).toLocaleString()}`;
}
