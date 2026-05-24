export const DEFINITIVE_REFERENCE_SPEC_VERSION = 'DEFINITIVE.v1.0';
export const DEFINITIVE_REFERENCE_METHODOLOGY_URI = 'methodology://v19';
export const DEFINITIVE_REFERENCE_METHODOLOGY_VERSION = 'v19';
export const DEFINITIVE_REFERENCE_PACKAGE_VERSION = '0.1.0';

export type ReferenceModelId = 'M109' | 'M139' | 'M199' | 'M206';

export type LineBoundary =
  | 'deterministic_compute_only'
  | 'computed_for_professional_review'
  | 'research_only';

export interface SampleAuthorityRef {
  id: string;
  label: string;
  citation: string;
}

export interface ReferenceModelDescriptor {
  modelId: ReferenceModelId;
  name: string;
  version: string;
  gates: string[];
  lineBoundary: LineBoundary;
  authorityRefs: SampleAuthorityRef[];
  inputSchemaName: string;
  outputSchemaName: string;
}

export interface ReferenceEnvelope<TOutput> {
  specVersion: typeof DEFINITIVE_REFERENCE_SPEC_VERSION;
  methodologyUri: typeof DEFINITIVE_REFERENCE_METHODOLOGY_URI;
  methodologyVersion: typeof DEFINITIVE_REFERENCE_METHODOLOGY_VERSION;
  referencePackageVersion: typeof DEFINITIVE_REFERENCE_PACKAGE_VERSION;
  modelId: ReferenceModelId;
  modelVersion: string;
  lineBoundary: LineBoundary;
  deterministic: true;
  currencyUnit: 'cents';
  inputHash: string;
  outputHash: string;
  authorityRefs: SampleAuthorityRef[];
  outputs: TOutput;
  warnings: string[];
}

export interface WorkingCapitalMonthInput {
  month: string;
  accountsReceivableCents: number;
  inventoryCents?: number;
  prepaidExpensesCents?: number;
  accountsPayableCents: number;
  accruedExpensesCents?: number;
  deferredRevenueCents?: number;
}

export interface WorkingCapitalPegInput {
  months: WorkingCapitalMonthInput[];
}

export interface WorkingCapitalPegOutput {
  monthlyNormalizedNwc: Array<{
    month: string;
    currentAssetsCents: number;
    currentLiabilitiesCents: number;
    normalizedNwcCents: number;
  }>;
  trailingMonthCount: number;
  pegCents: number;
}

export type Section1060Class = 'classI' | 'classII' | 'classIII' | 'classIV' | 'classV' | 'classVI' | 'classVII';

export interface Section1060AllocationInput {
  purchasePriceCents: number;
  assumedLiabilitiesCents?: number;
  fairMarketValuesCents: Partial<Record<Exclude<Section1060Class, 'classVII'>, number>>;
}

export interface Section1060AllocationOutput {
  totalConsiderationCents: number;
  allocation: Record<Section1060Class, number>;
  residualClassVIICents: number;
}

export interface FirptaWithholdingInput {
  amountRealizedCents: number;
  sellerIsForeignPerson: boolean;
  buyerWillUseAsResidence?: boolean;
}

export interface FirptaWithholdingOutput {
  withholdingRateBps: number;
  withholdingCents: number;
  exemptionReason: string | null;
  buyerFilingDueDaysAfterTransfer: number | null;
  forms: string[];
}

export type BasketStyle = 'deductible' | 'tipping';

export interface IndemnificationLadderInput {
  transactionValueCents: number;
  capBps: number;
  basketBps: number;
  basketStyle: BasketStyle;
  lossesCents: number;
}

export interface IndemnificationLadderOutput {
  capCents: number;
  basketCents: number;
  lossesCents: number;
  recoverableBeforeCapCents: number;
  recoverableAfterCapCents: number;
  buyerRetainedLossCents: number;
}

export type ReferenceModelInput =
  | { modelId: 'M109'; input: WorkingCapitalPegInput }
  | { modelId: 'M139'; input: Section1060AllocationInput }
  | { modelId: 'M199'; input: FirptaWithholdingInput }
  | { modelId: 'M206'; input: IndemnificationLadderInput };
