/**
 * Seed 500 synthetic closed deals calibrated to real market benchmarks.
 *
 * Run: node scripts/seed-closed-deals.js
 * Requires: DATABASE_URL environment variable
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

// ─── Industry benchmarks (calibrated to naics_benchmarks data) ─────────
const INDUSTRIES = [
  { naics: '238220', label: 'HVAC', sdeMargin: [0.15, 0.25], sdeMult: [2.5, 4.5], ebitdaMult: [4.0, 7.0], weight: 12, drivers: ['Recurring maintenance contracts', 'Licensed workforce retention', 'Fleet condition', 'Commercial mix'], risks: ['Owner as lead tech', 'No maintenance contracts', 'Aging fleet', 'Single-vendor HVAC brand'] },
  { naics: '561210', label: 'Pest Control', sdeMargin: [0.18, 0.30], sdeMult: [3.0, 5.0], ebitdaMult: [5.0, 8.0], weight: 8, drivers: ['Route density', 'Recurring revenue 70%+', 'Low churn', 'Diversified services'], risks: ['High churn rate', 'Owner on routes', 'Chemical compliance', 'Thin route density'] },
  { naics: '561730', label: 'Landscaping', sdeMargin: [0.12, 0.22], sdeMult: [2.0, 3.5], ebitdaMult: [3.5, 5.5], weight: 6, drivers: ['Commercial contracts', 'Year-round revenue', 'Crew retention', 'Equipment condition'], risks: ['H-2B visa dependency', 'Seasonal concentration', 'Owner as crew leader', 'Equipment age'] },
  { naics: '238110', label: 'Plumbing', sdeMargin: [0.15, 0.25], sdeMult: [2.5, 4.0], ebitdaMult: [4.0, 6.5], weight: 8, drivers: ['Service/repair focus', 'Multiple license holders', 'Online reputation', 'Service agreements'], risks: ['License concentration', 'New construction dependency', 'Warranty callbacks', 'Owner as sole master plumber'] },
  { naics: '238210', label: 'Electrical', sdeMargin: [0.12, 0.22], sdeMult: [2.5, 4.0], ebitdaMult: [4.0, 6.0], weight: 5, drivers: ['EV/solar capability', 'Government contracts', 'Safety record', 'Commercial focus'], risks: ['License concentration', 'Project concentration', 'Safety violations', 'Material cost volatility'] },
  { naics: '561720', label: 'Commercial Cleaning', sdeMargin: [0.10, 0.18], sdeMult: [2.0, 3.5], ebitdaMult: [3.0, 5.5], weight: 5, drivers: ['Long-term contracts', 'Medical/cleanroom specialty', 'Low concentration', 'Documented SOPs'], risks: ['I-9 compliance', 'Customer concentration', 'No written contracts', 'Minimum wage pressure'] },
  { naics: '811111', label: 'Auto Repair', sdeMargin: [0.15, 0.25], sdeMult: [2.0, 3.5], ebitdaMult: [3.0, 5.0], weight: 5, drivers: ['Fleet contracts', 'DRP relationships', 'Modern diagnostics', 'EV capability'], risks: ['Environmental contamination', 'Owner as sole mechanic', 'EV transition', 'Lease expiration'] },
  { naics: '811192', label: 'Car Wash', sdeMargin: [0.25, 0.40], sdeMult: [3.0, 5.0], ebitdaMult: [5.0, 8.0], weight: 4, drivers: ['Membership base 3000+', 'Express tunnel format', 'Strong location', 'Water reclamation'], risks: ['Membership churn', 'Equipment EOL', 'Water restrictions', 'Market saturation'] },
  { naics: '531130', label: 'Self-Storage', sdeMargin: [0.35, 0.55], sdeMult: [4.0, 7.0], ebitdaMult: [8.0, 14.0], weight: 3, drivers: ['90%+ occupancy', 'Climate-controlled', 'Urban location', 'Revenue management'], risks: ['New supply', 'Below 80% occupancy', 'Environmental', 'Ground lease'] },
  { naics: '621210', label: 'Dental Practice', sdeMargin: [0.25, 0.40], sdeMult: [1.5, 4.0], ebitdaMult: [5.0, 9.0], weight: 8, drivers: ['Multi-provider', 'Hygiene production', 'Modern equipment', 'Strong insurance panel'], risks: ['Solo practitioner', 'Declining patients', 'Medicaid-heavy', 'Equipment age'] },
  { naics: '541940', label: 'Veterinary Practice', sdeMargin: [0.18, 0.30], sdeMult: [3.0, 5.0], ebitdaMult: [6.0, 12.0], weight: 5, drivers: ['Multi-DVM', 'Specialty services', 'Modern facility', 'Low owner dependency'], risks: ['Solo DVM', 'Associate departure', 'DEA compliance', 'Facility renovation needed'] },
  { naics: '541211', label: 'CPA / Accounting', sdeMargin: [0.30, 0.45], sdeMult: [1.5, 4.0], ebitdaMult: [4.0, 7.0], weight: 5, drivers: ['Diversified services', 'Strong retention', 'Cloud-first', 'Business clients'], risks: ['Owner does all work', 'Individual returns only', 'Aging client base', 'Technology gap'] },
  { naics: '541512', label: 'IT Services / MSP', sdeMargin: [0.15, 0.28], sdeMult: [3.0, 5.0], ebitdaMult: [5.0, 8.0], weight: 5, drivers: ['MRR 75%+', 'Cybersecurity stack', 'Documented processes', 'Strong team'], risks: ['Break-fix model', 'Owner as lead engineer', 'Client concentration', 'Key employee risk'] },
  { naics: '524210', label: 'Insurance Agency', sdeMargin: [0.25, 0.40], sdeMult: [2.5, 4.0], ebitdaMult: [6.0, 12.0], weight: 6, drivers: ['Commercial P&C focus', 'Diversified carriers', 'Low concentration', 'Growing revenue'], risks: ['Personal lines only', 'Captive agency', 'Declining book', 'Producer portability'] },
  { naics: '332710', label: 'Contract Manufacturing', sdeMargin: [0.12, 0.22], sdeMult: [2.5, 4.0], ebitdaMult: [4.0, 6.5], weight: 3, drivers: ['AS9100 certification', 'Diversified customers', 'Modern CNC', 'Reshoring demand'], risks: ['Customer concentration', 'Equipment obsolescence', 'Key machinist dependency', 'Environmental'] },
  { naics: '484110', label: 'Trucking', sdeMargin: [0.08, 0.18], sdeMult: [2.0, 3.5], ebitdaMult: [3.5, 6.0], weight: 3, drivers: ['Specialized freight', 'Dedicated contracts', 'Modern fleet', 'Safety record'], risks: ['Poor CSA scores', 'Fleet age', 'Driver shortage', 'Spot market dependency'] },
  { naics: '812210', label: 'Funeral Home', sdeMargin: [0.20, 0.35], sdeMult: [3.0, 5.0], ebitdaMult: [5.0, 9.0], weight: 3, drivers: ['High call volume', 'Pre-need book', 'Community reputation', 'On-site crematory'], risks: ['Declining calls', 'Cremation shift', 'Pre-need underfunding', 'Facility issues'] },
  { naics: '624410', label: 'Childcare', sdeMargin: [0.12, 0.22], sdeMult: [2.0, 3.5], ebitdaMult: [3.5, 6.0], weight: 3, drivers: ['Full enrollment', 'NAEYC accreditation', 'Owned facility', 'Teacher retention'], risks: ['Under-enrolled', 'Compliance deficiencies', 'Teacher turnover', 'Short lease'] },
  { naics: '511210', label: 'SaaS / Software', sdeMargin: [0.15, 0.35], sdeMult: [4.0, 8.0], ebitdaMult: [8.0, 20.0], weight: 3, drivers: ['ARR growth 30%+', 'NRR >110%', 'Low churn', 'Vertical dominance'], risks: ['High churn', 'Customer concentration', 'Technical debt', 'Founder dependency'] },
  { naics: '454110', label: 'eCommerce', sdeMargin: [0.12, 0.25], sdeMult: [2.5, 4.0], ebitdaMult: [3.5, 6.0], weight: 2, drivers: ['Branded DTC', 'Diversified channels', 'Proprietary products', 'Repeat purchases'], risks: ['Amazon dependency', 'Single product', 'Declining ROAS', 'Supply chain risk'] },
];

// ─── Distribution configs ──────────────────────────────────────────────
const LEAGUES = [
  { league: 'L1', weight: 40, revMin: 30000000, revMax: 75000000 },
  { league: 'L2', weight: 35, revMin: 75000000, revMax: 200000000 },
  { league: 'L3', weight: 15, revMin: 200000000, revMax: 500000000 },
  { league: 'L4', weight: 7, revMin: 500000000, revMax: 1000000000 },
  { league: 'L5', weight: 2, revMin: 1000000000, revMax: 5000000000 },
  { league: 'L6', weight: 1, revMin: 5000000000, revMax: 15000000000 },
];

const EXIT_TYPES = [
  { type: 'full_exit', weight: 70 },
  { type: 'majority_sale', weight: 10 },
  { type: 'capital_raise', weight: 8 },
  { type: 'partner_buyout', weight: 7 },
  { type: 'esop', weight: 3 },
  { type: 'structured', weight: 2 },
];

const BUYER_TYPES = [
  'individual_operator', 'search_fund', 'pe_add_on', 'strategic',
  'family_office', 'management_buyout', 'esop_trust',
];

const YEARS = [
  { year: 2021, weight: 15 },
  { year: 2022, weight: 20 },
  { year: 2023, weight: 25 },
  { year: 2024, weight: 30 },
  { year: 2025, weight: 10 },
];

const STATES = [
  'TX', 'CA', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'CO',
];

const DD_OUTCOMES = ['clean', 'minor_findings', 'price_adjustment', 'significant_findings'];

// ─── Helpers ───────────────────────────────────────────────────────────
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(randBetween(min, max + 1));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDeal() {
  const industry = weightedRandom(INDUSTRIES);
  const league = weightedRandom(LEAGUES);
  const exitType = weightedRandom(EXIT_TYPES);
  const year = weightedRandom(YEARS);

  // Revenue calibrated to league
  const revenueCents = Math.round(randBetween(league.revMin, league.revMax));

  // SDE from industry margin benchmark +/- 15% noise
  const sdeMargin = randBetween(industry.sdeMargin[0], industry.sdeMargin[1]) * (0.85 + Math.random() * 0.30);
  const sdeCents = Math.round(revenueCents * sdeMargin);

  // EBITDA slightly lower than SDE (SDE includes owner comp)
  const ebitdaCents = Math.round(sdeCents * randBetween(0.55, 0.85));

  // Multiple from industry benchmark +/- variance
  const useSde = ['L1', 'L2'].includes(league.league);
  const mult = useSde
    ? randBetween(industry.sdeMult[0], industry.sdeMult[1])
    : randBetween(industry.ebitdaMult[0], industry.ebitdaMult[1]);
  const earningsBase = useSde ? sdeCents : ebitdaCents;

  // Asking price based on multiple
  const askingPriceCents = Math.round(earningsBase * mult * randBetween(1.02, 1.15));

  // Final price: at ask (55%), slight below (30%), significant below (15%)
  let priceVsAskPct;
  const priceRand = Math.random();
  if (priceRand < 0.55) priceVsAskPct = 100;
  else if (priceRand < 0.85) priceVsAskPct = randInt(92, 99);
  else priceVsAskPct = randInt(80, 91);

  const finalPriceCents = Math.round(askingPriceCents * priceVsAskPct / 100);

  // Actual multiples achieved
  const sdeMultiple = sdeCents > 0 ? +(finalPriceCents / sdeCents).toFixed(2) : null;
  const ebitdaMultiple = ebitdaCents > 0 ? +(finalPriceCents / ebitdaCents).toFixed(2) : null;

  // Deal structure
  const sbaFinanced = ['L1', 'L2', 'L3'].includes(league.league) && Math.random() < 0.65;
  let cashPct, sellerNotePct, earnoutPct;

  if (sbaFinanced) {
    cashPct = randInt(75, 90);
    sellerNotePct = randInt(10, 20);
    earnoutPct = Math.random() < 0.15 ? randInt(5, 10) : 0;
  } else if (exitType.type === 'majority_sale') {
    cashPct = randInt(55, 75);
    sellerNotePct = 0;
    earnoutPct = randInt(10, 25);
  } else {
    cashPct = randInt(65, 85);
    sellerNotePct = randInt(10, 25);
    earnoutPct = Math.random() < 0.25 ? randInt(5, 15) : 0;
  }

  // Normalize to ~100%
  const total = cashPct + sellerNotePct + earnoutPct;
  if (total > 100) {
    const scale = 100 / total;
    cashPct = Math.round(cashPct * scale);
    sellerNotePct = Math.round(sellerNotePct * scale);
    earnoutPct = 100 - cashPct - sellerNotePct;
  }

  // Process data
  const timeOnMarket = randInt(45, 365);
  const totalBuyers = randInt(5, 50);
  const ioiCount = randInt(1, Math.min(6, totalBuyers));
  const loiCount = randInt(1, Math.min(3, ioiCount));
  const competitive = ioiCount >= 2;
  const transitionDays = randInt(60, 365);
  const noncompeteYears = randInt(2, 5);

  // Buyer type
  let buyerType;
  if (exitType.type === 'esop') buyerType = 'esop_trust';
  else if (exitType.type === 'partner_buyout') buyerType = 'management_buyout';
  else if (['L4', 'L5', 'L6'].includes(league.league)) buyerType = pick(['pe_add_on', 'strategic', 'family_office']);
  else buyerType = pick(BUYER_TYPES.filter(b => b !== 'esop_trust'));

  // Value driver and risk from industry data
  const driver = pick(industry.drivers);
  const risk = pick(industry.risks);

  // DD outcome
  const ddOutcome = pick(DD_OUTCOMES);
  const keyFindings = {
    clean: 'No material findings during due diligence',
    minor_findings: pick(['Minor working capital discrepancy', 'Employee handbook out of date', 'One equipment item needs repair', 'Insurance policy lapse noted']),
    price_adjustment: pick(['Customer concentration higher than represented', 'Equipment condition below expectations', 'Working capital below target', 'Undisclosed vendor contract']),
    significant_findings: pick(['Material revenue adjustment needed', 'Environmental concern identified', 'Key employee departure risk', 'Regulatory compliance gap']),
  };

  return {
    is_synthetic: true,
    naics_code: industry.naics,
    naics_label: industry.label,
    state: pick(STATES),
    deal_size_league: league.league,
    exit_type: exitType.type,
    buyer_type: buyerType,
    annual_revenue_cents: revenueCents,
    sde_cents: sdeCents,
    ebitda_cents: ebitdaCents,
    asking_price_cents: askingPriceCents,
    final_price_cents: finalPriceCents,
    sde_multiple: sdeMultiple,
    ebitda_multiple: ebitdaMultiple,
    cash_at_close_pct: cashPct,
    seller_note_pct: sellerNotePct,
    earnout_pct: earnoutPct,
    sba_financed: sbaFinanced,
    earnout_present: earnoutPct > 0,
    transition_period_days: transitionDays,
    noncompete_years: noncompeteYears,
    time_on_market_days: timeOnMarket,
    total_buyers_contacted: totalBuyers,
    ioi_count: ioiCount,
    loi_count: loiCount,
    competitive_process: competitive,
    closed_year: year.year,
    closed_quarter: randInt(1, 4),
    price_vs_ask_pct: priceVsAskPct,
    primary_value_driver: driver,
    primary_deal_risk: risk,
    dd_outcome: ddOutcome,
    key_finding: keyFindings[ddOutcome],
    deal_notes: null,
  };
}

async function main() {
  console.log('Generating 500 synthetic closed deals...');

  // Check if table exists, create if needed
  await sql`
    CREATE TABLE IF NOT EXISTS closed_deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      is_synthetic BOOLEAN DEFAULT true,
      naics_code TEXT, naics_label TEXT, state TEXT,
      deal_size_league TEXT, exit_type TEXT, buyer_type TEXT,
      annual_revenue_cents BIGINT, sde_cents BIGINT, ebitda_cents BIGINT,
      asking_price_cents BIGINT, final_price_cents BIGINT,
      sde_multiple NUMERIC(4,2), ebitda_multiple NUMERIC(4,2),
      cash_at_close_pct INTEGER, seller_note_pct INTEGER, earnout_pct INTEGER,
      sba_financed BOOLEAN, earnout_present BOOLEAN,
      transition_period_days INTEGER, noncompete_years INTEGER,
      time_on_market_days INTEGER, total_buyers_contacted INTEGER,
      ioi_count INTEGER, loi_count INTEGER, competitive_process BOOLEAN,
      closed_year INTEGER, closed_quarter INTEGER,
      price_vs_ask_pct INTEGER,
      primary_value_driver TEXT, primary_deal_risk TEXT,
      dd_outcome TEXT, key_finding TEXT, deal_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Clear existing synthetic deals
  const deleted = await sql`DELETE FROM closed_deals WHERE is_synthetic = true`;
  console.log(`Cleared ${deleted.count} existing synthetic deals.`);

  // Generate 500 deals
  const deals = [];
  for (let i = 0; i < 500; i++) {
    deals.push(generateDeal());
  }

  // Insert in batches of 50
  for (let i = 0; i < deals.length; i += 50) {
    const batch = deals.slice(i, i + 50);
    for (const deal of batch) {
      await sql`
        INSERT INTO closed_deals (
          is_synthetic, naics_code, naics_label, state,
          deal_size_league, exit_type, buyer_type,
          annual_revenue_cents, sde_cents, ebitda_cents,
          asking_price_cents, final_price_cents,
          sde_multiple, ebitda_multiple,
          cash_at_close_pct, seller_note_pct, earnout_pct,
          sba_financed, earnout_present,
          transition_period_days, noncompete_years,
          time_on_market_days, total_buyers_contacted,
          ioi_count, loi_count, competitive_process,
          closed_year, closed_quarter,
          price_vs_ask_pct,
          primary_value_driver, primary_deal_risk,
          dd_outcome, key_finding, deal_notes
        ) VALUES (
          ${deal.is_synthetic}, ${deal.naics_code}, ${deal.naics_label}, ${deal.state},
          ${deal.deal_size_league}, ${deal.exit_type}, ${deal.buyer_type},
          ${deal.annual_revenue_cents}, ${deal.sde_cents}, ${deal.ebitda_cents},
          ${deal.asking_price_cents}, ${deal.final_price_cents},
          ${deal.sde_multiple}, ${deal.ebitda_multiple},
          ${deal.cash_at_close_pct}, ${deal.seller_note_pct}, ${deal.earnout_pct},
          ${deal.sba_financed}, ${deal.earnout_present},
          ${deal.transition_period_days}, ${deal.noncompete_years},
          ${deal.time_on_market_days}, ${deal.total_buyers_contacted},
          ${deal.ioi_count}, ${deal.loi_count}, ${deal.competitive_process},
          ${deal.closed_year}, ${deal.closed_quarter},
          ${deal.price_vs_ask_pct},
          ${deal.primary_value_driver}, ${deal.primary_deal_risk},
          ${deal.dd_outcome}, ${deal.key_finding}, ${deal.deal_notes}
        )
      `;
    }
    console.log(`  Inserted ${Math.min(i + 50, deals.length)} / 500 deals`);
  }

  // Verify
  const [leagueCounts] = await sql`
    SELECT json_agg(json_build_object('league', deal_size_league, 'count', cnt))
    FROM (SELECT deal_size_league, COUNT(*)::int as cnt FROM closed_deals GROUP BY deal_size_league ORDER BY deal_size_league) sub
  `;
  console.log('\nLeague distribution:', JSON.stringify(leagueCounts.json_agg, null, 2));

  const [exitCounts] = await sql`
    SELECT json_agg(json_build_object('type', exit_type, 'count', cnt))
    FROM (SELECT exit_type, COUNT(*)::int as cnt FROM closed_deals GROUP BY exit_type ORDER BY cnt DESC) sub
  `;
  console.log('Exit type distribution:', JSON.stringify(exitCounts.json_agg, null, 2));

  const [total] = await sql`SELECT COUNT(*)::int as count FROM closed_deals`;
  console.log(`\nTotal deals: ${total.count}`);

  await sql.end();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
