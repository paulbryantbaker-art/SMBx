import { createHash } from 'crypto';
import { sql } from '../db.js';
import type { League } from '../constants/v19Leagues.js';

export type V19ModelPhase = 'tier0' | 'phase2' | 'phase3';

export interface RegisteredModel {
  modelId: string;
  version: string;
  name: string;
  phase: V19ModelPhase;
  description: string;
  requiredInputs: string[];
  citationTags: string[];
  leagueFloor?: League;
  leagueCeiling?: League;
}

export interface RegisteredModelRecord extends RegisteredModel {
  hash: string;
}

const V19_MODEL_CATALOG: RegisteredModel[] = [
  {
    modelId: 'v19.sde.recast',
    version: '1.0.0',
    name: 'SDE Recast',
    phase: 'tier0',
    description: 'Normalizes owner-operated earnings using documented add-backs and compensation adjustments.',
    requiredInputs: ['revenue_cents', 'net_income_cents', 'owner_comp_cents', 'add_backs_cents'],
    citationTags: ['[Pepperdine PCAP 2025]'],
    leagueFloor: 'L1',
    leagueCeiling: 'L3',
  },
  {
    modelId: 'v19.ebitda.adjusted',
    version: '1.0.0',
    name: 'Adjusted EBITDA',
    phase: 'tier0',
    description: 'Normalizes EBITDA for lower-middle-market and larger deals with evidence-tagged adjustments.',
    requiredInputs: ['ebitda_cents', 'adjustments_cents', 'revenue_cents'],
    citationTags: ['[Damodaran 2026]', '[Kroll 2024]'],
    leagueFloor: 'L3',
    leagueCeiling: 'L10',
  },
  {
    modelId: 'v19.valuation.multiple',
    version: '1.0.0',
    name: 'Multiple Valuation',
    phase: 'tier0',
    description: 'Applies league-aware SDE or EBITDA multiple ranges and risk adjustments to normalized earnings.',
    requiredInputs: ['normalized_earnings_cents', 'base_multiple', 'league', 'risk_adjustments'],
    citationTags: ['[Damodaran 2026]', '[Pepperdine PCAP 2025]'],
    leagueFloor: 'L1',
    leagueCeiling: 'L10',
  },
  {
    modelId: 'v19.sba.bankability',
    version: '1.0.0',
    name: 'SBA Bankability',
    phase: 'tier0',
    description: 'Checks SBA acquisition debt capacity, equity injection, citizenship, seller-note standby, and DSCR.',
    requiredInputs: ['purchase_price_cents', 'cash_flow_cents', 'buyer_equity_cents', 'seller_note_cents'],
    citationTags: ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'],
    leagueFloor: 'L1',
    leagueCeiling: 'L3',
  },
  {
    modelId: 'v19.dscr',
    version: '1.0.0',
    name: 'Debt Service Coverage',
    phase: 'tier0',
    description: 'Computes DSCR under SBA and conventional debt assumptions with lender-threshold checks.',
    requiredInputs: ['cash_flow_cents', 'annual_debt_service_cents', 'loan_type'],
    citationTags: ['[SBA SOP 50 10 8]'],
  },
  {
    modelId: 'v19.qoe.lite',
    version: '1.0.0',
    name: 'QoE Lite',
    phase: 'tier0',
    description: 'Scores earnings quality, add-back defensibility, working-capital proof, and data-room gaps.',
    requiredInputs: ['financial_facts', 'adjustments', 'data_room_files'],
    citationTags: ['[ABA 2025]', '[SRS 2025]'],
  },
  {
    modelId: 'v19.working_capital.peg',
    version: '1.0.0',
    name: 'Working Capital Peg',
    phase: 'tier0',
    description: 'Builds a trailing-period NWC peg and flags deal-structure language for counsel review.',
    requiredInputs: ['monthly_nwc_cents', 'seasonality_notes', 'closing_balance_cents'],
    citationTags: ['[ABA 2025]', '[SRS 2025]'],
  },
  {
    modelId: 'v19.tax.structure',
    version: '1.0.0',
    name: 'Tax Structure Lens',
    phase: 'tier0',
    description: 'Issue-spots asset sale, stock sale, QSBS, rollover, bonus depreciation, SALT, and interest limitation paths.',
    requiredInputs: ['deal_type', 'entity_type', 'purchase_price_cents', 'rollover_pct', 'tax_facts'],
    citationTags: ['[OBBBA Sec. 70301]', '[OBBBA Sec. 70302]', '[OBBBA Sec. 70425]', '[OBBBA Sec. 70505]'],
  },
  {
    modelId: 'v19.legal.haltscan',
    version: '1.0.0',
    name: 'Legal Halt Scan',
    phase: 'tier0',
    description: 'Routes regulated, consent-heavy, antitrust, CFIUS, transfer, and professional-signoff issues to human counsel.',
    requiredInputs: ['deal_type', 'industry', 'jurisdiction', 'enterprise_value_cents', 'legal_facts'],
    citationTags: ['[FTC 2026 HSR - Size of Transaction]', '[FTC 2026 HSR - Auto-Reportable]'],
  },
  {
    modelId: 'v19.buyer.fit',
    version: '1.0.0',
    name: 'Buyer Fit',
    phase: 'tier0',
    description: 'Scores buyer universe fit, financing practicality, strategic rationale, and execution risk.',
    requiredInputs: ['industry', 'location', 'deal_size_cents', 'buyer_thesis', 'operating_needs'],
    citationTags: ['[Pepperdine PCAP 2025]'],
  },
  {
    modelId: 'v19.deal.score',
    version: '1.0.0',
    name: 'Deal Score',
    phase: 'tier0',
    description: 'Combines fit, earnings quality, evidence burden, market demand, and execution risk into a board-ready score.',
    requiredInputs: ['fit_score', 'earnings_quality_score', 'evidence_score', 'risk_score'],
    citationTags: ['[Pepperdine PCAP 2025]', '[ABA 2025]'],
  },
  {
    modelId: 'v19.market.context',
    version: '1.0.0',
    name: 'Market Context',
    phase: 'tier0',
    description: 'Attaches live macro and spread data snapshots to valuation, financing, and market-read outputs.',
    requiredInputs: ['series_ids', 'as_of_date'],
    citationTags: ['[FRED:SOFR]', '[FRED:DGS10]', '[FRED:BAMLH0A0HYM2]', '[FRED:BAMLC0A0CM]', '[FRED:VIXCLS]'],
  },
  {
    modelId: 'v19.sensitivity.matrix',
    version: '1.0.0',
    name: 'Sensitivity Matrix',
    phase: 'tier0',
    description: 'Builds two-variable matrices for valuation, returns, debt capacity, and downside cases.',
    requiredInputs: ['base_case', 'x_axis', 'y_axis', 'output_metric'],
    citationTags: [],
  },
  {
    modelId: 'v19.deal.comparison',
    version: '1.0.0',
    name: 'Deal Comparison',
    phase: 'tier0',
    description: 'Normalizes multiple deals onto a common board with current, optimized, and risk-adjusted views.',
    requiredInputs: ['deal_ids', 'comparison_lens', 'assumption_scope'],
    citationTags: [],
  },
  {
    modelId: 'v19.lbo.lite',
    version: '1.0.0',
    name: 'LBO Lite',
    phase: 'phase2',
    description: 'Projects sources/uses, leverage, cash sweep, exit value, MOIC, and IRR for sponsor-style deals.',
    requiredInputs: ['purchase_price_cents', 'debt_cents', 'sponsor_equity_cents', 'entry_ebitda_cents', 'exit_multiple'],
    citationTags: ['[FRED:SOFR]', '[FRED:BAMLH0A0HYM2]'],
    leagueFloor: 'L3',
    leagueCeiling: 'L10',
  },
  {
    modelId: 'v19.cap_table.dilution',
    version: '1.0.0',
    name: 'Cap Table Dilution',
    phase: 'phase2',
    description: 'Models dilution, option pool, convertible securities, and exit waterfall economics.',
    requiredInputs: ['pre_money_cents', 'round_size_cents', 'option_pool_pct', 'security_terms'],
    citationTags: [],
  },
  {
    modelId: 'v19.earnout.ev',
    version: '1.0.0',
    name: 'Earnout Expected Value',
    phase: 'phase2',
    description: 'Calculates probability-weighted earnout value and negotiation sensitivity.',
    requiredInputs: ['earnout_targets', 'probabilities', 'discount_rate'],
    citationTags: ['[ABA 2025]', '[SRS 2025]'],
  },
  {
    modelId: 'v19.covenant.compliance',
    version: '1.0.0',
    name: 'Covenant Compliance',
    phase: 'phase2',
    description: 'Tracks leverage, FCCR, liquidity, and EBITDA definition compliance over the forecast.',
    requiredInputs: ['forecast_periods', 'covenant_terms', 'debt_schedule'],
    citationTags: ['[FRED:SOFR]', '[FRED:BAMLC0A0CM]'],
  },
  {
    modelId: 'v19.dcf.simple',
    version: '1.0.0',
    name: 'DCF Simple',
    phase: 'phase2',
    description: 'Builds a compact discounted cash-flow valuation with terminal value and discount-rate sensitivity.',
    requiredInputs: ['free_cash_flows_cents', 'discount_rate', 'terminal_growth_rate'],
    citationTags: ['[Damodaran 2026]', '[Kroll 2024]'],
  },
  {
    modelId: 'v19.pmi.value_creation',
    version: '1.0.0',
    name: 'PMI Value Creation',
    phase: 'phase3',
    description: 'Turns diligence findings into post-close milestones, value levers, ownership, and day-0 controls.',
    requiredInputs: ['deal_findings', 'integration_risks', 'value_levers'],
    citationTags: [],
  },
];

export function listRegisteredModels(): RegisteredModelRecord[] {
  return V19_MODEL_CATALOG.map(withHash);
}

export function getRegisteredModel(modelId: string, version?: string): RegisteredModelRecord | null {
  const model = V19_MODEL_CATALOG.find(candidate =>
    candidate.modelId === modelId && (!version || candidate.version === version)
  );
  return model ? withHash(model) : null;
}

export async function ensureModelRegistrySeeded(): Promise<{ insertedOrUpdated: number }> {
  const models = listRegisteredModels();
  for (const model of models) {
    await sql`
      INSERT INTO model_registry (
        model_id, version, hash, change_log, test_status, hallucination_test_status
      )
      VALUES (
        ${model.modelId},
        ${model.version},
        ${model.hash},
        ${JSON.stringify({
          name: model.name,
          phase: model.phase,
          description: model.description,
          requiredInputs: model.requiredInputs,
          citationTags: model.citationTags,
          leagueFloor: model.leagueFloor ?? null,
          leagueCeiling: model.leagueCeiling ?? null,
        })},
        'cataloged',
        'citation-bound'
      )
      ON CONFLICT (model_id, version) DO UPDATE SET
        hash = EXCLUDED.hash,
        change_log = EXCLUDED.change_log,
        test_status = EXCLUDED.test_status,
        hallucination_test_status = EXCLUDED.hallucination_test_status,
        deprecated_at = NULL
    `;
  }
  return { insertedOrUpdated: models.length };
}

function withHash(model: RegisteredModel): RegisteredModelRecord {
  const hash = createHash('sha256')
    .update(JSON.stringify({
      modelId: model.modelId,
      version: model.version,
      name: model.name,
      phase: model.phase,
      description: model.description,
      requiredInputs: model.requiredInputs,
      citationTags: model.citationTags,
      leagueFloor: model.leagueFloor ?? null,
      leagueCeiling: model.leagueCeiling ?? null,
    }))
    .digest('hex');
  return { ...model, hash };
}
