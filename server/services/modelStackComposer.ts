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
  // Race-safe insert. The previous implementation was a classic check-then-act:
  //
  //   SELECT MAX(version) + 1   -- two concurrent callers both see "5"
  //   INSERT version=6           -- both try to insert v6 → unique-constraint
  //                                 violation on (deal_id, version)
  //
  // Surfaced by the high-velocity-stress harness at ~8% failure rate when two
  // agents on the same customer compose the model stack for the same deal
  // concurrently. The fix collapses both operations into a single statement:
  // the version is computed inside the INSERT via a correlated subquery, and
  // ON CONFLICT DO NOTHING + RETURNING tells us whether we won the race. If
  // we lost (zero rows returned), brief jittered backoff and retry — the next
  // MAX(version) read will see the winning row. Bounded attempts prevent a
  // pathological loop.
  const MAX_RETRIES = 5;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const inserted = await sql<{ version: number }[]>`
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
        COALESCE((SELECT MAX(version) FROM deal_model_stack WHERE deal_id = ${dealId}), 0) + 1,
        ${DEFINITIVE_SPEC_VERSION},
        ${DEFINITIVE_SPEC_URI},
        ${DEFINITIVE_METHODOLOGY_VERSION},
        ${DEFINITIVE_METHODOLOGY_URI}
      )
      ON CONFLICT (deal_id, version) DO NOTHING
      RETURNING version
    `;
    if (inserted.length > 0) return;
    // Conflict — another transaction grabbed the version we wanted. Brief
    // jittered backoff so we don't collide again on the very next try.
    await new Promise(r => setTimeout(r, 5 + Math.random() * 15));
  }
  throw new Error(`compose_model_stack: failed to write deal_model_stack after ${MAX_RETRIES} attempts (dealId=${dealId}) — concurrency too high or unique constraint misconfigured`);
}

function leagueAtLeast(actual: League, threshold: League): boolean {
  return leagueNumber(actual) >= leagueNumber(threshold);
}

function leagueNumber(league: League): number {
  return Number(league.slice(1));
}
