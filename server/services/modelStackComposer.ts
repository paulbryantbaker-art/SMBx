import { sql } from '../db.js';
import { LEAGUES, type League } from '../constants/v19Leagues.js';

export type V19Journey = 'sell' | 'buy' | 'raise' | 'pmi';

export interface ComposeModelStackInput {
  dealId?: number;
  journey: V19Journey;
  league: League;
  dealType?: string | null;
  industry?: string | null;
  jurisdiction?: string | null;
}

export interface V19ModelStack {
  journey: V19Journey;
  league: League;
  dealType: string;
  complexity: string;
  primaryModels: string[];
  supporting: string[];
  taxLegal: string[];
  sensitivity: string[];
  context: {
    industry?: string;
    jurisdiction?: string;
    primaryMetric: 'SDE' | 'EBITDA';
  };
}

export async function composeModelStack(input: ComposeModelStackInput): Promise<V19ModelStack> {
  const spec = LEAGUES[input.league];
  const primaryModels = new Set<string>();
  const supporting = new Set<string>();
  const taxLegal = new Set<string>(['v19.tax.structure', 'v19.legal.haltscan']);
  const sensitivity = new Set<string>(['v19.sensitivity.matrix', 'v19.market.context']);

  if (spec.primaryMetric === 'SDE') {
    primaryModels.add('v19.sde.recast');
    supporting.add('v19.sba.bankability');
    supporting.add('v19.dscr');
  } else {
    primaryModels.add('v19.ebitda.adjusted');
    supporting.add('v19.working_capital.peg');
    supporting.add('v19.qoe.lite');
  }

  primaryModels.add('v19.valuation.multiple');
  primaryModels.add('v19.deal.score');

  if (input.journey === 'buy') {
    primaryModels.add('v19.buyer.fit');
    supporting.add('v19.deal.comparison');
    if (leagueAtLeast(input.league, 'L3')) supporting.add('v19.lbo.lite');
  }

  if (input.journey === 'sell') {
    supporting.add('v19.buyer.fit');
    supporting.add('v19.qoe.lite');
    supporting.add('v19.working_capital.peg');
  }

  if (input.journey === 'raise') {
    primaryModels.add('v19.cap_table.dilution');
    supporting.add('v19.dcf.simple');
  }

  if (input.journey === 'pmi') {
    primaryModels.add('v19.pmi.value_creation');
    supporting.add('v19.covenant.compliance');
  }

  if (leagueAtLeast(input.league, 'L4')) {
    supporting.add('v19.covenant.compliance');
    sensitivity.add('v19.earnout.ev');
  }

  const stack: V19ModelStack = {
    journey: input.journey,
    league: input.league,
    dealType: input.dealType || 'unknown',
    complexity: spec.modelStackComplexity,
    primaryModels: [...primaryModels],
    supporting: [...supporting],
    taxLegal: [...taxLegal],
    sensitivity: [...sensitivity],
    context: {
      industry: input.industry || undefined,
      jurisdiction: input.jurisdiction || undefined,
      primaryMetric: spec.primaryMetric,
    },
  };

  if (input.dealId) {
    await persistModelStack(input.dealId, stack);
  }

  return stack;
}

async function persistModelStack(dealId: number, stack: V19ModelStack): Promise<void> {
  const [row] = await sql<{ version: number }[]>`
    SELECT (COALESCE(MAX(version), 0) + 1)::int as version
    FROM deal_model_stack
    WHERE deal_id = ${dealId}
  `;
  const version = Number(row?.version || 1);

  await sql`
    INSERT INTO deal_model_stack (
      deal_id, journey, league, deal_type, primary_models, supporting, tax_legal, sensitivity, version
    )
    VALUES (
      ${dealId},
      ${stack.journey},
      ${stack.league},
      ${stack.dealType},
      ${sql.json(stack.primaryModels)}::jsonb,
      ${sql.json(stack.supporting)}::jsonb,
      ${sql.json(stack.taxLegal)}::jsonb,
      ${sql.json(stack.sensitivity)}::jsonb,
      ${version}
    )
  `;
}

function leagueAtLeast(actual: League, threshold: League): boolean {
  return leagueNumber(actual) >= leagueNumber(threshold);
}

function leagueNumber(league: League): number {
  return Number(league.slice(1));
}
