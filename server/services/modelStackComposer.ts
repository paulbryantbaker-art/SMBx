import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { LEAGUES, type League } from '../constants/v19Leagues.js';
import {
  buildDefinitiveStackOverlayMetadata,
  evaluateDefinitiveStackOverlays,
  normalizeDefinitiveStackSignals,
  type DefinitiveStackOverlay,
  type DefinitiveStackSignals,
} from './definitiveStackOverlays.js';
import {
  buildDefinitiveYuliaMechanicsBrief,
  composeDefinitiveApplicableMechanics,
  getDefinitiveDealRouteMapSummary,
  summarizeDefinitiveApplicableMechanics,
  type DefinitiveApplicableMechanic,
  type DefinitiveApplicableMechanicsSummary,
} from './definitiveDealRouteMap.js';

export {
  evaluateDefinitiveStackOverlays,
  normalizeDefinitiveStackSignals,
  type DefinitiveStackOverlay,
  type DefinitiveStackSignals,
} from './definitiveStackOverlays.js';

export type V19Journey = 'sell' | 'buy' | 'raise' | 'pmi';

export interface ComposeModelStackInput {
  dealId?: number;
  journey: V19Journey;
  league: League;
  dealType?: string | null;
  industry?: string | null;
  jurisdiction?: string | null;
  signals?: DefinitiveStackSignals | null;
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
  definitive?: {
    dealMechanicsVersion: string;
    dealMechanicsUri: string;
    routeMapStatus: string;
    triggeredOverlayGates: Array<'G28' | 'G29' | 'G30'>;
    overlays: DefinitiveStackOverlay[];
    applicableMechanics: DefinitiveApplicableMechanic[];
    applicableMechanicsSummary: DefinitiveApplicableMechanicsSummary;
    yuliaMechanicsBrief: string[];
    lineDoctrine: string;
  };
}

export async function composeModelStack(input: ComposeModelStackInput): Promise<V19ModelStack> {
  const spec = LEAGUES[input.league];
  const primaryModels = new Set<string>();
  const supporting = new Set<string>();
  const taxLegal = new Set<string>(['MODEL.TAX.STRUCTURE.v1', 'MODEL.LEGAL.HALTSCAN.v1']);
  const sensitivity = new Set<string>(['MODEL.SENSITIVITY.MATRIX.v1', 'MODEL.MARKET.CONTEXT.v1']);
  const overlays = evaluateDefinitiveStackOverlays(input);
  const definitive = buildDefinitiveStackOverlayMetadata(overlays);
  const triggeredOverlayGates = definitive.triggeredOverlayGates;
  const applicableMechanics = composeDefinitiveApplicableMechanics({
    journey: input.journey,
    league: input.league,
    dealType: input.dealType,
    industry: input.industry,
    jurisdiction: input.jurisdiction,
    triggeredGates: triggeredOverlayGates,
    limit: 72,
  });
  const applicableMechanicsSummary = summarizeDefinitiveApplicableMechanics(applicableMechanics);
  const yuliaMechanicsBrief = buildDefinitiveYuliaMechanicsBrief(applicableMechanics, applicableMechanicsSummary);
  const routeMapSummary = getDefinitiveDealRouteMapSummary();

  if (spec.primaryMetric === 'SDE') {
    primaryModels.add('MODEL.VAL.SDE.v1');
    supporting.add('MODEL.LBO.SBA.v1');
    supporting.add('MODEL.DSCR.STRESS.v1');
  } else {
    primaryModels.add('MODEL.VAL.EBITDA.v1');
    supporting.add('MODEL.STRUCT.NWC.PEG.v1');
    supporting.add('MODEL.QOE.LITE.v1');
  }

  primaryModels.add('MODEL.VAL.TRIANGULATION.v1');
  primaryModels.add('MODEL.DEAL.SCORE.v1');

  if (input.journey === 'buy') {
    primaryModels.add('MODEL.BUYER.FIT.v1');
    supporting.add('MODEL.DEAL.COMPARISON.v1');
    if (leagueAtLeast(input.league, 'L3')) supporting.add('MODEL.LBO.LMM.v1');
  }

  if (input.journey === 'sell') {
    supporting.add('MODEL.BUYER.FIT.v1');
    supporting.add('MODEL.QOE.LITE.v1');
    supporting.add('MODEL.STRUCT.NWC.PEG.v1');
  }

  if (input.journey === 'raise') {
    primaryModels.add('MODEL.CAPTABLE.DILUTION.v1');
    supporting.add('MODEL.VAL.DCF.TWOSTAGE.v1');
  }

  if (input.journey === 'pmi') {
    primaryModels.add('MODEL.PMI.VALUE.CREATION.v1');
    supporting.add('MODEL.COVENANT.COMPLIANCE.v1');
  }

  if (leagueAtLeast(input.league, 'L4')) {
    supporting.add('MODEL.COVENANT.COMPLIANCE.v1');
    sensitivity.add('MODEL.STRUCT.EARNOUT.MC.v1');
  }

  if (triggeredOverlayGates.length > 0) {
    taxLegal.add('MODEL.LEGAL.HALTSCAN.v1');
    sensitivity.add('MODEL.MARKET.CONTEXT.v1');
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
    definitive: {
      ...definitive,
      routeMapStatus: routeMapSummary.status,
      applicableMechanics,
      applicableMechanicsSummary,
      yuliaMechanicsBrief,
    },
  };

  if (input.dealId) {
    await persistModelStack(input.dealId, stack);
  }

  return stack;
}

async function persistModelStack(dealId: number, stack: V19ModelStack): Promise<void> {
  const { sql } = await import('../db.js');
  const [row] = await sql<{ version: number }[]>`
    SELECT (COALESCE(MAX(version), 0) + 1)::int as version
    FROM deal_model_stack
    WHERE deal_id = ${dealId}
  `;
  const version = Number(row?.version || 1);

  await sql`
    INSERT INTO deal_model_stack (
      deal_id, journey, league, deal_type, primary_models, supporting, tax_legal, sensitivity,
      version, spec_version, spec_uri, methodology_version, methodology_uri
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
      ${version},
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI}
    )
  `;
}

function leagueAtLeast(actual: League, threshold: League): boolean {
  return leagueNumber(actual) >= leagueNumber(threshold);
}

function leagueNumber(league: League): number {
  return Number(league.slice(1));
}
