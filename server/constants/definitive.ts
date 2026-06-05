export const DEFINITIVE_SPEC_VERSION = 'DEFINITIVE.v1.0';
export const DEFINITIVE_SPEC_URI = 'definitive://v1';
export const DEFINITIVE_METHODOLOGY_VERSION = 'V19';
export const DEFINITIVE_METHODOLOGY_URI = 'methodology://v19';

/**
 * The two ways an agent gets value from the substrate — surfaced on the agent
 * card (pre-call, so an agent grasps the value fast) and on assess_deal_entry
 * (orientation). Both modes end in a portable, auditable take-back artifact, and
 * each spells out exactly what the agent carries back.
 */
export const DEFINITIVE_USAGE_MODES = {
  summary:
    'smbX is the M&A diligence substrate. Use it two ways — both return a portable, auditable artifact you keep and can resume later.',
  oneTimeAnalysis: {
    label: 'One-time analysis',
    whenToUse:
      'You need a single audited answer — a valuation, a working-capital/QoE model, a data-room index, or one document.',
    how: 'Call the one tool (see assess_deal_entry.taskLane, or pick by its card on tools/list), pass inputs, take back the result. No journey or DealState required.',
    carryBack:
      'ModelOutput / DataRoomIndex / DocumentDraft — value(s), assumptions, citations, and an output hash you can cite.',
    startWith: ['lookup_model_slot', 'execute_model', 'compose_data_room_index'],
  },
  extendedMethodology: {
    label: 'Extended methodology',
    whenToUse:
      'You are working a live deal across its lifecycle: intake → IOI → LOI → diligence → negotiation → close → PMI.',
    how: 'ingest_deal_payload, then follow next_suggested_calls — each names the gate it advances. Iterate until the definition of done is met.',
    carryBack:
      'DealState + DealPackage — classification, completeness, plan, sources, deferrals, and audit trail. Resume anytime with resume_deal.',
    startWith: ['ingest_deal_payload', 'compose_model_stack', 'compose_deal_package'],
  },
} as const;

export function definitiveVersionPayload() {
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
  };
}
