import { sampleAuthorities } from './authorities.js';
import type { ReferenceModelDescriptor } from './types.js';

export const referenceModelDescriptors: Record<string, ReferenceModelDescriptor> = {
  M109: {
    modelId: 'M109',
    name: 'Working capital peg',
    version: 'M109.reference.v0.1',
    gates: ['G7', 'G14', 'G15'],
    lineBoundary: 'deterministic_compute_only',
    authorityRefs: [sampleAuthorities.workingCapital],
    inputSchemaName: 'WorkingCapitalPegInput',
    outputSchemaName: 'WorkingCapitalPegOutput',
  },
  M139: {
    modelId: 'M139',
    name: 'Section 1060 residual-method allocation',
    version: 'M139.reference.v0.1',
    gates: ['G15'],
    lineBoundary: 'computed_for_professional_review',
    authorityRefs: [sampleAuthorities.section1060],
    inputSchemaName: 'Section1060AllocationInput',
    outputSchemaName: 'Section1060AllocationOutput',
  },
  M199: {
    modelId: 'M199',
    name: 'FIRPTA withholding v1.1',
    version: 'M199.reference.v0.1',
    gates: ['G15', 'G30'],
    lineBoundary: 'deterministic_compute_only',
    authorityRefs: [sampleAuthorities.firpta],
    inputSchemaName: 'FirptaWithholdingInput',
    outputSchemaName: 'FirptaWithholdingOutput',
  },
  M206: {
    modelId: 'M206',
    name: 'Indemnification ladder',
    version: 'M206.reference.v0.1',
    gates: ['G1', 'G8'],
    lineBoundary: 'computed_for_professional_review',
    authorityRefs: [sampleAuthorities.indemnity],
    inputSchemaName: 'IndemnificationLadderInput',
    outputSchemaName: 'IndemnificationLadderOutput',
  },
};

export function listReferenceModels(): ReferenceModelDescriptor[] {
  return Object.values(referenceModelDescriptors);
}
