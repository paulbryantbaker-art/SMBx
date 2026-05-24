import {
  computeFirptaWithholding,
  computeIndemnificationLadder,
  computeSection1060Allocation,
  computeWorkingCapitalPeg,
} from './calculations.js';
import { sha256Hex } from './hash.js';
import { referenceModelDescriptors } from './models.js';
import {
  DEFINITIVE_REFERENCE_METHODOLOGY_URI,
  DEFINITIVE_REFERENCE_METHODOLOGY_VERSION,
  DEFINITIVE_REFERENCE_PACKAGE_VERSION,
  DEFINITIVE_REFERENCE_SPEC_VERSION,
  type ReferenceEnvelope,
  type ReferenceModelInput,
} from './types.js';

function envelope<TOutput>(
  run: ReferenceModelInput,
  outputs: TOutput,
  warnings: string[] = [],
): ReferenceEnvelope<TOutput> {
  const descriptor = referenceModelDescriptors[run.modelId];
  if (!descriptor) {
    throw new Error(`Unsupported reference model: ${run.modelId}`);
  }

  return {
    specVersion: DEFINITIVE_REFERENCE_SPEC_VERSION,
    methodologyUri: DEFINITIVE_REFERENCE_METHODOLOGY_URI,
    methodologyVersion: DEFINITIVE_REFERENCE_METHODOLOGY_VERSION,
    referencePackageVersion: DEFINITIVE_REFERENCE_PACKAGE_VERSION,
    modelId: descriptor.modelId,
    modelVersion: descriptor.version,
    lineBoundary: descriptor.lineBoundary,
    deterministic: true,
    currencyUnit: 'cents',
    inputHash: sha256Hex(run.input),
    outputHash: sha256Hex(outputs),
    authorityRefs: descriptor.authorityRefs,
    outputs,
    warnings,
  };
}

export function executeReferenceModel(run: ReferenceModelInput): ReferenceEnvelope<unknown> {
  switch (run.modelId) {
    case 'M109':
      return envelope(run, computeWorkingCapitalPeg(run.input));
    case 'M139':
      return envelope(run, computeSection1060Allocation(run.input), [
        'Section 1060 allocation is computed from user-supplied values; tax counsel or tax preparer owns return position.',
      ]);
    case 'M199':
      return envelope(run, computeFirptaWithholding(run.input));
    case 'M206':
      return envelope(run, computeIndemnificationLadder(run.input), [
        'Economic indemnity math only; counsel owns clause language and enforceability analysis.',
      ]);
    default: {
      const neverRun: never = run;
      throw new Error(`Unsupported reference model: ${JSON.stringify(neverRun)}`);
    }
  }
}
