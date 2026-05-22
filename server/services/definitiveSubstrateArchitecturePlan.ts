export const DEFINITIVE_SUBSTRATE_ARCHITECTURE_VERSION = 'DEFINITIVE.substrate-architecture.v1';
export const DEFINITIVE_SUBSTRATE_ARCHITECTURE_URI = 'definitive://v1.1/substrate-architecture';

export interface DefinitiveSubstrateWorkstream {
  id: string;
  name: string;
  purpose: string;
  primitives: string[];
  mcpTools: string[];
  objectTypes: string[];
  buildPhase: string;
  doneCondition: string;
}

export interface DefinitiveSubstratePhase {
  id: string;
  window: string;
  name: string;
  focus: string;
  outputs: string[];
}

export interface DefinitiveDealOsLifecycleStage {
  id: string;
  label: string;
  methodStep: string;
  agentBehavior: string;
  nextStepTrigger: string;
}

export interface DefinitiveDealOsWorkSurface {
  id: string;
  label: string;
  humanRole: string;
  agentRole: string;
  portableOutputs: string[];
}

export interface DefinitiveAgentDiscoverabilityLayer {
  id: string;
  label: string;
  purpose: string;
  requiredSurface: string[];
  status: string;
}

export interface DefinitiveAgentDesirabilitySignal {
  id: string;
  label: string;
  implementationRule: string;
  lineReason: string;
}

const routingAxes = [
  'journey',
  'sub_journey',
  'league',
  'jurisdiction',
  'distress_posture',
  'asset_class',
  'industry',
  'tax_classification',
] as const;

const universalResponseFields = [
  'next_suggested_calls',
  'completeness_contribution_delta',
  'state_hash_after',
  'methodology_version',
  'the_line_invariant',
] as const;

const dealOsLifecycleStages: DefinitiveDealOsLifecycleStage[] = [
  {
    id: 'intake',
    label: 'Information intake',
    methodStep: 'Get enough facts to classify the deal, not enough facts to finish it.',
    agentBehavior: 'Accept partial payloads, preserve provenance, classify what is knowable, and return missing-input requests instead of rejecting the agent.',
    nextStepTrigger: 'ClassificationKey exists and the MissingInputContract names the next facts needed for IOI or deeper diligence.',
  },
  {
    id: 'ioi',
    label: 'IOI / indication',
    methodStep: 'Turn early facts into a sourced, caveated indication of interest or response package.',
    agentBehavior: 'Compose the early model stack, list assumptions, cite sources, and ask for the smallest missing facts needed to move toward LOI.',
    nextStepTrigger: 'IOI package, assumption log, and source gaps are represented in DealState.',
  },
  {
    id: 'deeper_diligence',
    label: 'Deeper diligence',
    methodStep: 'Recursively add files, models, market facts, tax/legal mechanics, and pass-through inputs.',
    agentBehavior: 'Use update_deal_payload, execute_model, check_completeness, and next_suggested_calls until the next gate is sufficiently supported.',
    nextStepTrigger: 'CompletenessReport shows the next gate can proceed or names the blocking inputs, handoffs, or tollgates.',
  },
  {
    id: 'loi',
    label: 'LOI / term architecture',
    methodStep: 'Translate diligence into structure, economic terms, conditions, and THE LINE-safe drafting scaffolds.',
    agentBehavior: 'Run structure and agreement-economics models, preserve counsel boundaries, and package term architecture for the principal or agent.',
    nextStepTrigger: 'LOI/term architecture package exists with model outputs, source refs, assumptions, and professional-handoff flags.',
  },
  {
    id: 'confirmatory_diligence',
    label: 'Confirmatory diligence',
    methodStep: 'Validate the LOI path against source documents, model refreshes, risk findings, and specialist inputs.',
    agentBehavior: 'Refresh DealState as new materials arrive, invalidate stale outputs, rerun affected models, and move blockers into Files/Pipeline/Today.',
    nextStepTrigger: 'Updated CompletenessReport identifies negotiation, close, or no-go blockers without making the decision for the user.',
  },
  {
    id: 'model_negotiation',
    label: 'Modeling and negotiation prep',
    methodStep: 'Compute scenarios, sensitivities, economics, and negotiation briefs without negotiating or recommending the transaction.',
    agentBehavior: 'Generate permutations, score stated preferences, produce negotiation-economics packets, and preserve THE LINE invariant.',
    nextStepTrigger: 'Principal receives computed options, not advice; unresolved professional issues are routed to counsel/FA/specialist review.',
  },
  {
    id: 'close_pmi',
    label: 'Close / PMI',
    methodStep: 'Finalize replayable packages, funds-flow scaffolds, audit packets, and post-close operating plans.',
    agentBehavior: 'Finalize DealPackage, expose verification/subset disclosure, and hand the surviving DealState into PMI.',
    nextStepTrigger: 'A signed package can be verified by downstream parties and the post-close state remains usable by humans and agents.',
  },
];

const dealOsWorkSurfaces: DefinitiveDealOsWorkSurface[] = [
  {
    id: 'today',
    label: 'Today',
    humanRole: 'Daily operating surface for priorities, blockers, and what needs action.',
    agentRole: 'Read current next actions, decide which missing input or model update to advance, and return progress to the principal system.',
    portableOutputs: ['next_suggested_calls', 'CompletenessReport', 'DealStateDiff'],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    humanRole: 'Methodology Kanban for opportunities, gates, stages, and deal movement.',
    agentRole: 'Move or explain stage progress by gate, source, handoff, and model readiness without inventing status.',
    portableOutputs: ['GateState', 'DealPlan', 'PipelineStageDelta'],
  },
  {
    id: 'files',
    label: 'Files',
    humanRole: 'Proof/source routing surface for uploaded documents, pass-through inputs, and source blockers.',
    agentRole: 'Attach, request, classify, and cite source material that unlocks the next model, document, or diligence step.',
    portableOutputs: ['SourceIndex', 'MissingInputContract', 'CitationRefs'],
  },
  {
    id: 'data_room',
    label: 'Data Room',
    humanRole: 'Organized source-of-truth room for diligence materials, requests, versions, and handoffs.',
    agentRole: 'Maintain a data-room index, identify gaps, package source subsets, and synchronize updates back to the external agent system.',
    portableOutputs: ['DataRoomIndex', 'DisclosureSubset', 'SourceGapList'],
  },
  {
    id: 'studio',
    label: 'Studio',
    humanRole: 'Document creation surface for books, memos, briefs, diligence packets, and exportable work product.',
    agentRole: 'Create or update sourced deliverables from DealState while carrying provenance, citations, and audit appendices.',
    portableOutputs: ['DocumentDraft', 'StudioBook', 'ExportManifest'],
  },
  {
    id: 'models',
    label: 'Models',
    humanRole: 'Interactive and server-canonical financial, tax, legal/economic, and deal-mechanics modeling.',
    agentRole: 'Execute deterministic models, update assumptions, invalidate stale outputs, and return model outputs with hashes.',
    portableOutputs: ['ModelOutput', 'AssumptionLog', 'OutputHash'],
  },
  {
    id: 'audit_package',
    label: 'Audit Package',
    humanRole: 'Verification surface for methodology pins, source hashes, model outputs, citations, and final package evidence.',
    agentRole: 'Take a replayable package or subset back to its own environment with verification instructions.',
    portableOutputs: ['AuditPacket', 'DealPackage', 'MerkleInclusionProof'],
  },
];

const agentTakeBackArtifacts = [
  'DealStateDiff',
  'CompletenessReport',
  'MissingInputContract',
  'MCPCallHint[]',
  'ModelOutput',
  'AssumptionLog',
  'SourceIndex',
  'DataRoomIndex',
  'DocumentDraft',
  'StudioBook',
  'AuditPacket',
  'DealPackage',
  'SelectiveDisclosureProof',
] as const;

const agentDiscoverabilityLayers: DefinitiveAgentDiscoverabilityLayer[] = [
  {
    id: 'canonical_registry',
    label: 'Canonical MCP registry',
    purpose: 'Make smbX discoverable as the authoritative diligence substrate namespace rather than an ad hoc local tool.',
    requiredSurface: ['registry.modelcontextprotocol.io entry', 'canonical smbx-ai/diligence namespace', 'server metadata package'],
    status: 'planned',
  },
  {
    id: 'directory_layer',
    label: 'Third-party MCP directories',
    purpose: 'Ensure agents and developers find DEFINITIVE in the directories that aggregate and rank MCP servers.',
    requiredSurface: ['PulseMCP', 'Glama', 'mcp.so', 'Smithery', 'Docker MCP Catalog', 'awesome-mcp-servers'],
    status: 'planned',
  },
  {
    id: 'well_known_discovery',
    label: 'Well-known server-card discovery',
    purpose: 'Let Claude, ChatGPT, VS Code, and other MCP clients inspect identity, transport, capabilities, tools, and security posture before connection.',
    requiredSurface: ['/.well-known/mcp/server-card.json', '/.well-known/mcp', 'protocolVersion', 'serverInfo', 'transport', 'capabilities', 'tools[]'],
    status: 'next_after_schema_spine',
  },
  {
    id: 'client_app_stores',
    label: 'Client-curated app stores',
    purpose: 'Package DEFINITIVE for the agent ecosystems where enterprise users browse and approve tools.',
    requiredSurface: ['Claude Connector Directory', 'ChatGPT Apps Directory', 'Microsoft Agent Store', 'Salesforce AgentExchange', 'Google Agent Gallery'],
    status: 'planned_after_internal_contract_stabilizes',
  },
  {
    id: 'enterprise_allow_lists',
    label: 'Enterprise allow-list registries',
    purpose: 'Help PE firms, portfolio companies, banks, and advisors add smbX to governed agent registries without bespoke security work.',
    requiredSurface: ['GitHub Copilot registry JSON', 'AWS Q / Kiro registry JSON', 'Azure API Center blueprint', 'Bedrock AgentCore Cedar policy template'],
    status: 'planned_with_enterprise_trust_path',
  },
];

const agentDesirabilitySignals: DefinitiveAgentDesirabilitySignal[] = [
  {
    id: 'deterministic_outputs',
    label: 'Deterministic outputs',
    implementationRule: 'Every serious number comes from a model, source file, or timestamped market datum and returns idempotent output for the same pinned inputs.',
    lineReason: 'Deterministic computation keeps Yulia from pretending judgment or negotiation is software output.',
  },
  {
    id: 'structured_outputs',
    label: 'Structured typed outputs',
    implementationRule: 'Every tool must declare outputSchema and structuredContent-compatible payloads before marketplace submission.',
    lineReason: 'Typed outputs make the substrate orchestrable by agents without relying on prose interpretation.',
  },
  {
    id: 'citation_provenance',
    label: 'Citation and provenance',
    implementationRule: 'Every artifact carries methodology pin, authority/source refs, source hashes where available, and audit payload pointers.',
    lineReason: 'Citation validation separates supported computation from unsupported claims.',
  },
  {
    id: 'version_pinned_standard',
    label: 'Version-pinned standard',
    implementationRule: 'Publish The Diligence Standard / DEFINITIVE as a citable, semver-pinned spec with model IDs, gate IDs, authority register, and conformance cases.',
    lineReason: 'A named standard makes smbX a reference substrate rather than a replaceable prompt bundle.',
  },
  {
    id: 'semantic_tool_metadata',
    label: 'Semantic tool metadata',
    implementationRule: 'Tool names and descriptions must use the exact deal-language agents search for: working capital peg, Section 1060 allocation, FIRPTA withholding, indemnification cap and basket, QoE adjustments, earnout construction, LBO model.',
    lineReason: 'Precise metadata improves discoverability without overstating what the tool does.',
  },
  {
    id: 'regulatory_neutrality',
    label: 'Regulatory neutrality / THE LINE',
    implementationRule: 'Discovery descriptions must state that smbX is software, not a broker/advisor, and never charges success fees, deal-value fees, or referral compensation.',
    lineReason: 'THE LINE is a procurement and compliance signal for enterprise agent allow-lists.',
  },
];

const toolMetadataDoctrine = {
  namingConvention: 'diligence_<phase>_<artifact>',
  examples: [
    'diligence_workingcapital_peg',
    'diligence_section1060_allocation',
    'diligence_firpta_withholding',
    'diligence_indemnification_ladder',
    'diligence_qoe_adjustments',
    'diligence_earnout_construction',
  ],
  descriptionTemplate: 'Start with the user-query phrasing, name The Diligence Standard / DEFINITIVE methodology version and model ID, state the deterministic output, name the controlling authority/source category, declare outputSchema, and state THE LINE neutrality.',
  outputSchemaRule: 'No marketplace-facing tool is complete until outputSchema, structuredContent shape, idempotency key behavior, read-only/destructive/open-world annotations, and result-size limits are defined.',
  semanticKeywords: ['working capital peg', 'Section 1060 allocation', 'FIRPTA withholding', 'indemnification cap and basket', 'QoE adjustments', 'earnout construction', 'LBO model', 'data room', 'audit packet'],
};

const publishedStandardDoctrine = {
  name: 'The Diligence Standard',
  methodology: 'DEFINITIVE',
  purpose: 'Make smbX the canonical, deterministic, citation-validated specialist substrate that generalist lab/PE/JV agents call instead of re-implementing.',
  requiredPublicArtifacts: ['canonical spec URL', 'stable model and gate URLs', 'Authority Register references', 'open conformance suite', 'server-card metadata', 'THE LINE declaration'],
  conformanceBadge: 'DEFINITIVE-conformant',
};

const workstreams: DefinitiveSubstrateWorkstream[] = [
  {
    id: 'WS1',
    name: 'Deal payload schema and classifier',
    purpose: 'Accept arbitrary and incomplete deal input through one entrypoint, classify it into the deterministic eight-axis routing key, and return a missing-input contract.',
    primitives: ['DealPayload', 'ClassificationKey', 'MissingInputContract', 'payload_classifier'],
    mcpTools: ['ingest_deal_payload', 'update_deal_payload'],
    objectTypes: ['DealPayload', 'ClassificationKey', 'MissingInputContract'],
    buildPhase: 'Phase 0',
    doneCondition: 'An agent can submit a partial raw payload and receive classification, activated gates/models, present inputs, missing inputs, and contradictions without choosing a menu mode or being rejected for incompleteness.',
  },
  {
    id: 'WS2',
    name: 'Persistent deal state and dependency graph',
    purpose: 'Turn model calls into a content-addressable DealState with action-key caching, cascade invalidation, and durable execution journaling.',
    primitives: ['DealState', 'DealPlan', 'model_dependency_graph', 'durable_execution_journal'],
    mcpTools: ['compose_deal_plan', 'get_deal_state', 'diff_deal_state', 'resume_deal', 'clone_deal_state', 'link_related_deal'],
    objectTypes: ['DealState', 'DealPlan', 'ModelOutput', 'AuditEvent'],
    buildPhase: 'Phase 1',
    doneCondition: 'An agent can reattach to a deal by CID/session, execute a plan, reuse cache hits, and prove stale outputs are invalidated when inputs change.',
  },
  {
    id: 'WS3',
    name: 'Completeness contract and DRL engine',
    purpose: 'Define deterministic per-classification definitions of done and compute Deal Readiness Levels without implying deal quality.',
    primitives: ['CompletenessSpec', 'CompletenessReport', 'DealReadinessLevel', 'completeness_auditor'],
    mcpTools: ['check_completeness', 'get_definition_of_done'],
    objectTypes: ['CompletenessSpec', 'CompletenessReport', 'DealReadinessLevel'],
    buildPhase: 'Phase 1 / Phase 4',
    doneCondition: 'A package can report complete/incomplete status, readiness score, satisfied/unmet requirements, warnings, and next recommended calls.',
  },
  {
    id: 'WS4',
    name: 'Portable signed deal package',
    purpose: 'Produce a single replayable package with JSON, PDF/A-3 human render, archival bundle, signed manifest, timestamps, and selective disclosure proofs.',
    primitives: ['DealPackage', 'SignedManifest', 'Attestation', 'MerkleInclusionProof', 'signed_manifest_issuer'],
    mcpTools: ['compose_deal_package', 'finalize_deal_package', 'verify_package', 'reopen_deal_package', 'disclose_subset'],
    objectTypes: ['DealPackage', 'SignedManifest', 'Attestation', 'MerkleInclusionProof'],
    buildPhase: 'Phase 3',
    doneCondition: 'An agent can compose a portable take-back DealPackage now, then finalize signed manifests, verify integrity, and disclose subsets without trusting chat output.',
  },
  {
    id: 'WS5',
    name: 'Permutation and computed-best vehicle engine',
    purpose: 'Enumerate deal structure permutations, prune to the Pareto frontier, and compute preference-vector outcomes without recommending a transaction structure.',
    primitives: ['StructurePermutation', 'ParetoFrontier', 'BestVehicleBlock', 'permutation_generator', 'dominance_pruner', 'frontier_scorer'],
    mcpTools: ['generate_permutations', 'score_permutation', 'set_objective_preference', 'compute_best_vehicle', 'expand_permutations'],
    objectTypes: ['StructurePermutation', 'ParetoFrontier', 'BestVehicleBlock'],
    buildPhase: 'Phase 2',
    doneCondition: 'An agent can receive the non-dominated structure frontier and, only when preferences are supplied, a computed-best point with THE LINE invariant attached.',
  },
  {
    id: 'WS6',
    name: 'First-class service deliverables',
    purpose: 'Wrap document creation, data-room indexes, RWI submissions, negotiation economics, funds flow, regulatory filing scaffolds, and PMI plans as manifest-backed deliverables.',
    primitives: ['Deliverable', 'DocumentDraft', 'DataRoomIndex'],
    mcpTools: ['prepare_rwi_submission', 'prepare_negotiation_brief', 'generate_funds_flow', 'prepare_regulatory_filings', 'compose_pmi_plan'],
    objectTypes: ['Deliverable', 'DocumentDraft', 'DataRoomIndex'],
    buildPhase: 'Phase 4',
    doneCondition: 'Each service deliverable, document, or data-room index contributes to completeness, carries structured payload and human render, and preserves the compute-not-advise boundary.',
  },
  {
    id: 'WS7',
    name: 'Capability discovery and next-call hints',
    purpose: 'Let thin agents discover only relevant tools/models and progress to completion by following server-provided next suggested calls.',
    primitives: ['CapabilityCatalog', 'MCPCallHint'],
    mcpTools: ['introspect_capabilities', 'describe_methodology', 'estimate_deal_cost'],
    objectTypes: ['CapabilityCatalog', 'MCPCallHint'],
    buildPhase: 'Phase 4',
    doneCondition: 'Every substrate response can guide the agent to the next useful call, while contextual introspection avoids dumping the full corpus into context.',
  },
  {
    id: 'WS8',
    name: 'Terminal substrate moat',
    purpose: 'Bind the model corpus, state spine, completeness engine, package manifest, and capability hints into the Deal OS: hand an incomplete or complete deal in, recursively work it by methodology stage, and get package/state outputs back.',
    primitives: ['idempotency_key_contract', 'resource_link_returns', 'per_version_replay', 'quality_evidence'],
    mcpTools: [],
    objectTypes: ['MCPCallHint', 'DealPackage', 'CompletenessReport'],
    buildPhase: 'Phase 5',
    doneCondition: 'External agents can enter at any deal stage, continue the methodology recursively without a bespoke menu, and every output is replayable, version-pinned, citation-validatable, and packaged.',
  },
];

const phases: DefinitiveSubstratePhase[] = [
  {
    id: 'Phase 0',
    window: 'Weeks 1-4',
    name: 'Substrate skeleton',
    focus: 'Versioned schemas and rules-first ingest/classification.',
    outputs: ['DealPayload schema', 'DealState schema', 'ClassificationKey schema', 'CompletenessSpec schema', 'DealPackage schema', 'ingest_deal_payload', 'idempotency key contract'],
  },
  {
    id: 'Phase 1',
    window: 'Weeks 5-10',
    name: 'State spine',
    focus: 'Content-addressable state, dependency graph, action-key cache, shallow completeness.',
    outputs: ['DealState CID revisions', 'model dependency graph', 'action-key cache', 'compose_deal_plan for Sell and Buy', 'compose_deal_package take-back packet', 'shallow check_completeness'],
  },
  {
    id: 'Phase 2',
    window: 'Weeks 11-18',
    name: 'Permutations and best vehicle',
    focus: 'Structure generation, Pareto pruning, and computed-best block with THE LINE invariant.',
    outputs: ['permutation generator', 'dominance pruner', 'frontier scorer', 'BestVehicleBlock', 'preference vector contract'],
  },
  {
    id: 'Phase 3',
    window: 'Weeks 19-26',
    name: 'Packaging and signing',
    focus: 'Portable verifiable package with offline verification.',
    outputs: ['finalize_deal_package', 'PDF/A-3 dual render', 'in-toto/DSSE manifest', 'timestamp hooks', 'Merkle subset proofs', 'reopen_deal_package'],
  },
  {
    id: 'Phase 4',
    window: 'Weeks 27-34',
    name: 'Completeness depth and service fill-ins',
    focus: 'Full CompletenessSpec coverage, service deliverables, capability introspection, and next-call hints.',
    outputs: ['definition of done by classification', 'RWI submission deliverable', 'negotiation brief deliverable', 'funds flow deliverable', 'PMI plan deliverable', 'introspect_capabilities', 'next_suggested_calls envelope'],
  },
  {
    id: 'Phase 5',
    window: 'Weeks 35+',
    name: 'Coverage and ecosystem',
    focus: 'Close scoped gaps and publish replayable external agent surface.',
    outputs: ['cyber/ESG gap closure where needed', 'cross-border scope expansion', 'per-version replay endpoint', 'developer/agent docs'],
  },
];

const newMcpTools = workstreams.flatMap(workstream => workstream.mcpTools);

export function getDefinitiveSubstrateArchitecturePlan() {
  return {
    version: DEFINITIVE_SUBSTRATE_ARCHITECTURE_VERSION,
    uri: DEFINITIVE_SUBSTRATE_ARCHITECTURE_URI,
    status: 'ready_for_schema_build',
    source: {
      title: 'DEFINITIVE Substrate Architecture: From Model Corpus to Terminal M&A Deal Platform',
      date: '2026-05-21',
      pages: 22,
      localSource: '/Users/paul/Downloads/v19/DEFINITIVE Substrate Architecture_ From Model Corpus to Terminal M and A Deal Platform.pdf',
    },
    premise: 'The 123-model corpus is the library. The terminal M&A deal substrate requires orchestration, state, completeness, packaging, permutation, discovery, and next-action primitives around that corpus.',
    primitiveCount: 8,
    newMcpToolCount: newMcpTools.length,
    agentOperatingDoctrine: {
      productDoctrine: 'smbX is the Deal OS for humans and agents. The app and API are two control surfaces over the same methodology-pinned DealState.',
      homeContract: 'Agents can come to smbX as the home for iterative deal work, just like a person would: manage lifecycle, files, data rooms, documents, models, pipeline, audit packets, and next actions from the same DealState.',
      noRejectionContract: 'Agents are not rejected because they lack complete information. Incomplete payloads produce a ClassificationKey, MissingInputContract, current DealState, and next_suggested_calls.',
      recursiveWorkLoop: 'ingest payload -> classify -> compose plan -> execute deterministic work -> check completeness -> request/fetch missing inputs -> update DealState -> repeat through IOI, LOI, diligence, modeling, negotiation prep, close, and PMI.',
      bidirectionalHandoff: 'At each iteration the agent can take portable information back to its own system: state diff, completeness report, source index, data-room index, document draft, model output, audit packet, package, or next-call list.',
      valuePreservation: 'Every recursive step should add reusable DealState, citations, assumptions, model outputs, or package evidence so the full deal remains available to the user or any authorized agent.',
      agentEntryModes: ['start_new_deal', 'resume_existing_deal', 'augment_human_deal', 'package_completed_stage', 'verify_downstream_package'],
    },
    dealOsLifecycleStages,
    dealOsWorkSurfaces,
    agentTakeBackArtifacts,
    routingAxes,
    universalResponseFields,
    workstreams,
    phases,
    newMcpTools,
    immediateBuildOrder: [
      'Publish versioned JSON schemas for DealPayload, DealState, ClassificationKey, CompletenessSpec, and DealPackage.',
      'Add ingest_deal_payload with deterministic rules-first classification and MissingInputContract output.',
      'Wire idempotency keys across every MCP-shaped tool call.',
      'Build content-addressable DealState and action-key caching before adding more surface features.',
      'Add shallow check_completeness and next_suggested_calls so agents can progress without guessing.',
      'Encode the Deal OS lifecycle so agents can move from intake to IOI, LOI, diligence, modeling, negotiation prep, close, and PMI by recursive calls.',
      'Expose Deal OS work surfaces and portable take-back artifacts so agents can manage documents, data rooms, models, pipeline, and audit packets iteratively.',
      'Publish MCP server-card and well-known discovery metadata only after tool schemas, output schemas, idempotency, THE LINE annotations, and citation/provenance fields are stable.',
    ],
    agentDiscoverabilityLayers,
    agentDesirabilitySignals,
    toolMetadataDoctrine,
    publishedStandardDoctrine,
    marketplaceBuildOrder: [
      'Build /.well-known/mcp/server-card.json and /.well-known/mcp over the same DEFINITIVE manifest, not a parallel metadata file.',
      'Add query-aligned diligence tool metadata and outputSchema/structuredContent definitions for marketplace-facing tools.',
      'Prepare registry submissions for Linux Foundation MCP Registry and third-party MCP directories.',
      'Prepare Claude, ChatGPT, Microsoft, Salesforce, and Google app-store packages after the internal tool contract is stable.',
      'Publish enterprise allow-list JSON, Azure/API Center blueprint, and Bedrock AgentCore policy templates with THE LINE scopes.',
    ],
    lineDoctrine: 'DEFINITIVE computes, presents, packages, and certifies completeness. It does not advise, recommend, negotiate, represent, guarantee, execute payments, or take transaction-based compensation.',
    doNotBuild: [
      'negotiation execution',
      'transaction execution or payment movement',
      'recommendation engines on best_vehicle',
      'custom ingestion connectors before the DealPayload contract is stable',
    ],
  };
}
