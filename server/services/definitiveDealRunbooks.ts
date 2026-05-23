import {
  buildDefinitiveDealRouteMap,
  type DefinitiveJourney,
} from './definitiveDealRouteMap.js';
import { getDefinitiveSubstrateArchitecturePlan } from './definitiveSubstrateArchitecturePlan.js';

export const DEFINITIVE_DEAL_RUNBOOK_VERSION = 'DEFINITIVE.deal-runbooks.v0.1';

type StageId =
  | 'intake'
  | 'ioi'
  | 'deeper_diligence'
  | 'loi'
  | 'confirmatory_diligence'
  | 'model_negotiation'
  | 'close_pmi';

interface RunbookStageDefinition {
  stageId: StageId;
  purpose: string;
  minimumInputs: string[];
  primaryTools: string[];
  workSurfaces: string[];
  takeBackArtifacts: string[];
  doneWhen: string;
}

interface RunbookDefinition {
  journey: DefinitiveJourney;
  title: string;
  operatingPrinciple: string;
  entryModes: string[];
  stages: RunbookStageDefinition[];
}

const sharedStages: RunbookStageDefinition[] = [
  {
    stageId: 'intake',
    purpose: 'Classify the opportunity from partial information and create a DealState without blocking on missing facts.',
    minimumInputs: ['journey or intent', 'counterparty or target if known', 'industry if known', 'deal size or range if known'],
    primaryTools: ['ingest_deal_payload', 'check_completeness', 'introspect_capabilities'],
    workSurfaces: ['today', 'pipeline', 'files'],
    takeBackArtifacts: ['DealState', 'MissingInputContract', 'CapabilityCatalog'],
    doneWhen: 'The DealState has a classification key, current stage, source gaps, and next_suggested_calls.',
  },
  {
    stageId: 'ioi',
    purpose: 'Build or evaluate the early indication package with assumptions, source gaps, and the first model stack.',
    minimumInputs: ['high-level financial facts', 'deal thesis', 'valuation or financing constraints', 'known source files'],
    primaryTools: ['compose_model_stack', 'prepare_ioi_packet', 'compose_deal_plan'],
    workSurfaces: ['today', 'studio', 'models', 'files'],
    takeBackArtifacts: ['IOIPacket', 'DealPlan', 'ModelOutput', 'AssumptionLog'],
    doneWhen: 'The IOI packet is source-aware, caveated, and clear about what must be learned before LOI.',
  },
  {
    stageId: 'deeper_diligence',
    purpose: 'Iteratively add files, market facts, model outputs, pass-through inputs, and professional handoff status.',
    minimumInputs: ['uploaded source files', 'open diligence asks', 'current gate or blocker', 'updated economics or risk facts'],
    primaryTools: ['update_deal_payload', 'compose_data_room_index', 'prepare_diligence_request', 'execute_model'],
    workSurfaces: ['files', 'data_room', 'models', 'pipeline'],
    takeBackArtifacts: ['DataRoomIndex', 'DiligenceRequest', 'SourceIndex', 'DealStateDiff'],
    doneWhen: 'CompletenessReport can either advance the next gate or name the specific source/handoff/tollgate blockers.',
  },
  {
    stageId: 'loi',
    purpose: 'Translate diligence into LOI economics, structure, conditions, and counsel-ready term architecture.',
    minimumInputs: ['price or range', 'structure', 'consideration mix', 'key conditions', 'known exclusions and handoffs'],
    primaryTools: ['prepare_loi_packet', 'compose_document_draft', 'compose_model_stack'],
    workSurfaces: ['studio', 'models', 'files'],
    takeBackArtifacts: ['LOIPacket', 'DocumentDraft', 'NegotiationBrief'],
    doneWhen: 'The LOI packet separates deterministic economics from counsel-owned clause language and enforceability.',
  },
  {
    stageId: 'confirmatory_diligence',
    purpose: 'Refresh the DealState as new source materials arrive and invalidate stale assumptions before negotiation or close.',
    minimumInputs: ['new files or source refs', 'changed assumptions', 'specialist inputs', 'open issues list'],
    primaryTools: ['update_deal_payload', 'diff_deal_state', 'check_completeness', 'disclose_subset'],
    workSurfaces: ['files', 'data_room', 'today', 'pipeline'],
    takeBackArtifacts: ['DealStateDiff', 'DisclosureSubset', 'CompletenessReport'],
    doneWhen: 'Changed facts have been traced to affected models, documents, issues, and next_suggested_calls.',
  },
  {
    stageId: 'model_negotiation',
    purpose: 'Compute scenarios and negotiation economics without negotiating, recommending, or crossing THE LINE.',
    minimumInputs: ['negotiation issue', 'user preference or mandate', 'scenario assumptions', 'professional handoff status'],
    primaryTools: ['execute_model', 'prepare_negotiation_brief', 'compose_deal_package'],
    workSurfaces: ['models', 'studio', 'today'],
    takeBackArtifacts: ['NegotiationBrief', 'ModelOutput', 'DealPackage'],
    doneWhen: 'The principal or external agent has computed options, assumptions, citations, and unresolved handoff flags.',
  },
  {
    stageId: 'close_pmi',
    purpose: 'Package the close path, funds-flow scaffold, audit evidence, and surviving post-close work plan.',
    minimumInputs: ['closing checklist', 'funds flow facts', 'approval status', 'post-close value levers'],
    primaryTools: ['compose_close_readiness', 'generate_funds_flow', 'finalize_deal_package', 'compose_pmi_plan'],
    workSurfaces: ['today', 'studio', 'audit_package', 'pipeline'],
    takeBackArtifacts: ['CloseReadiness', 'FundsFlow', 'AuditPacket', 'PMIPlan'],
    doneWhen: 'The close/PMI package is replayable, source-aware, and explicit that humans authorize close and money movement.',
  },
];

const runbookDefinitions: RunbookDefinition[] = [
  {
    journey: 'buy',
    title: 'Buy-side Deal OS runbook',
    operatingPrinciple: 'Start with thesis and partial target facts, then iterate through IOI, LOI, diligence, model refreshes, negotiation prep, close, and PMI.',
    entryModes: ['target known', 'thesis only', 'brokered teaser', 'agent returning with new files', 'post-LOI diligence refresh'],
    stages: sharedStages,
  },
  {
    journey: 'sell',
    title: 'Sell-side Deal OS runbook',
    operatingPrinciple: 'Start with owner intent and company facts, then package the story, model value, manage diligence, negotiate economics, and preserve the audit trail.',
    entryModes: ['owner exploring exit', 'advisor preparing materials', 'buyer already engaged', 'new diligence request', 'post-IOI process management'],
    stages: sharedStages.map(stage => stage.stageId === 'ioi'
      ? {
        ...stage,
        purpose: 'Prepare the seller-side response or buyer-screening package before LOI pressure.',
        primaryTools: ['compose_model_stack', 'prepare_ioi_packet', 'compose_document_draft'],
        takeBackArtifacts: ['IOIPacket', 'DocumentDraft', 'AssumptionLog'],
      }
      : stage),
  },
  {
    journey: 'raise',
    title: 'Capital-raise Deal OS runbook',
    operatingPrinciple: 'Start with capital need and mandate, then build investor materials, model structure, manage outreach facts, and route terms through THE LINE-safe mechanics.',
    entryModes: ['growth capital need', 'debt refinance', 'recap exploration', 'investor follow-up', 'term-sheet comparison'],
    stages: sharedStages.map(stage => stage.stageId === 'loi'
      ? {
        ...stage,
        purpose: 'Translate investor interest into term architecture, structure economics, and conditions without negotiating for the user.',
        primaryTools: ['compose_model_stack', 'compose_document_draft', 'prepare_negotiation_brief'],
        takeBackArtifacts: ['DocumentDraft', 'NegotiationBrief', 'ModelOutput'],
      }
      : stage),
  },
  {
    journey: 'pmi',
    title: 'PMI Deal OS runbook',
    operatingPrinciple: 'Carry the surviving DealState into post-close value creation, integration blockers, covenant tracking, and longitudinal auditability.',
    entryModes: ['newly closed acquisition', 'integration plan refresh', 'value-creation initiative', 'covenant or KPI update', 'post-close dispute support'],
    stages: sharedStages.filter(stage => ['intake', 'deeper_diligence', 'model_negotiation', 'close_pmi'].includes(stage.stageId)).map(stage => stage.stageId === 'close_pmi'
      ? {
        ...stage,
        purpose: 'Turn the closing package into a PMI plan with value-creation, risk, covenant, and first-100-day workstreams.',
        primaryTools: ['compose_pmi_plan', 'execute_model', 'compose_lifecycle_trace'],
        takeBackArtifacts: ['PMIPlan', 'LifecycleTrace', 'ModelOutput'],
      }
      : stage),
  },
];

export function buildDefinitiveDealRunbooksSurface() {
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  return {
    schema: DEFINITIVE_DEAL_RUNBOOK_VERSION,
    doctrine:
      'DEFINITIVE is the Deal OS. Agents and humans can enter with incomplete information, work recursively through the M&A lifecycle, and take back portable artifacts after each stage.',
    summary: {
      journeyCount: runbookDefinitions.length,
      lifecycleStageCount: architecture.dealOsLifecycleStages.length,
      workSurfaceCount: architecture.dealOsWorkSurfaces.length,
      loopContract: 'ingest_or_resume -> classify -> ask_missing_inputs -> execute_or_route -> package_take_back -> repeat',
    },
    runbooks: runbookDefinitions.map(toRunbook),
    universalEntryTools: ['ingest_deal_payload', 'resume_deal', 'introspect_capabilities', 'describe_methodology'],
    universalTakeBackArtifacts: architecture.agentTakeBackArtifacts,
    lineInvariant:
      'Runbooks route and compute. They do not advise, negotiate, represent, guarantee, move money, or charge success/referral/deal-value fees.',
  };
}

export function getDefinitiveDealRunbook(journey: string) {
  const normalized = String(journey || '').trim().toLowerCase() as DefinitiveJourney;
  const definition = runbookDefinitions.find(runbook => runbook.journey === normalized);
  if (!definition) return null;
  return toRunbook(definition);
}

function toRunbook(definition: RunbookDefinition) {
  const routeMap = buildDefinitiveDealRouteMap();
  const mechanics = routeMap
    .filter(route => route.readiness !== 'reserved' && route.journeys.includes(definition.journey))
    .slice(0, 24)
    .map(route => ({
      slotId: route.slotId,
      name: route.name,
      gates: route.gates,
      readiness: route.readiness,
      toolSurfaces: route.toolSurfaces,
      implementedRuntimeModelId: route.implementedRuntimeModelId,
    }));

  return {
    schema: 'DEFINITIVE.deal-runbook.v0.1',
    journey: definition.journey,
    title: definition.title,
    operatingPrinciple: definition.operatingPrinciple,
    entryModes: definition.entryModes,
    stages: definition.stages.map(stage => ({
      ...stage,
      recursionRule: 'If an input is missing or stale, return a MissingInputContract and next_suggested_calls instead of ending the work.',
    })),
    representativeModelSlots: mechanics,
    representativeModelSlotCount: mechanics.length,
    next_suggested_calls: [
      {
        toolName: 'ingest_deal_payload',
        priority: 'P1',
        reason: 'Start or refresh the DealState from whatever facts the agent has now.',
        inputHint: { journey: definition.journey, sourceRefs: [], knownFacts: {} },
      },
      {
        toolName: 'resume_deal',
        priority: 'P1',
        reason: 'Use this when the agent already has a DealState, deal package, or prior audit packet.',
        inputHint: { dealStateCid: '<existing DealState CID or current DealPayload>' },
      },
      {
        toolName: 'compose_lifecycle_trace',
        priority: 'P2',
        reason: 'Use this to explain the current stage, prior events, blockers, and portable handoff state.',
        inputHint: { dealStateCid: '<existing DealState CID>' },
      },
    ],
    the_line_invariant:
      'This runbook gives workflow and deterministic tool routing only. Professional decisions remain with the user, counsel, advisors, specialists, or the court.',
  };
}
