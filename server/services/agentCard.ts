import { listRegisteredModels } from './modelRegistry.js';
import { listV19ResourceContract } from './v19ResourceContract.js';

export function buildAgentCard() {
  const models = listRegisteredModels();
  const resourceContract = listV19ResourceContract();
  return {
    name: 'smbx.ai Yulia Deal Desk',
    version: 'v19-foundation',
    description: 'Agent-ready M&A deal intelligence substrate for model-backed analysis, citation validation, and governed Yulia canvas actions.',
    pricing: {
      free: '$0',
      solo: '$79/mo',
      pro: '$199/mo',
      team: '$499/mo',
      enterprise: '$2,500+/mo',
    },
    boundaries: [
      'Yulia provides deal intelligence, modeling, drafting, and orchestration.',
      'Licensed legal, tax, accounting, investment, and brokerage decisions remain with qualified professionals and the user.',
      'Financial values must be sourced from user documents, data-room facts, or registered market citations.',
    ],
    capabilities: [
      {
        id: 'model_registry',
        label: 'Registered V19 model catalog',
        status: 'available',
        count: models.length,
      },
      {
        id: 'citation_validation',
        label: 'Citation registry validation',
        status: 'available',
        requiredFor: ['regulatory thresholds', 'market data', 'tax/legal constants', 'model outputs using external facts'],
      },
      {
        id: 'model_stack_composition',
        label: 'Journey/league-aware model stack composer',
        status: 'available',
        journeys: ['sell', 'buy', 'raise', 'pmi'],
        leagues: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'],
      },
      {
        id: 'canvas_awareness',
        label: 'Yulia canvas awareness',
        status: 'available',
        note: 'Chat and canvas are two control surfaces over the same deal state.',
      },
      {
        id: 'v19_resource_contract',
        label: 'V19 artifact/resource contract',
        status: 'internal',
        resources: resourceContract.resourceTemplates.map(resource => resource.uriTemplate),
        tools: resourceContract.toolContracts,
      },
    ],
    resourceContract,
    models: models.map(model => ({
      modelId: model.modelId,
      version: model.version,
      name: model.name,
      phase: model.phase,
      hash: model.hash,
      requiredInputs: model.requiredInputs,
      citationTags: model.citationTags,
      leagueFloor: model.leagueFloor ?? null,
      leagueCeiling: model.leagueCeiling ?? null,
    })),
    publicEndpoints: [
      '/.well-known/agent-card.json',
      '/api/agent-card',
    ],
    generatedAt: new Date().toISOString(),
  };
}
