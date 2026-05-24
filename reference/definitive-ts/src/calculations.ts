import type {
  FirptaWithholdingInput,
  FirptaWithholdingOutput,
  IndemnificationLadderInput,
  IndemnificationLadderOutput,
  Section1060AllocationInput,
  Section1060AllocationOutput,
  Section1060Class,
  WorkingCapitalPegInput,
  WorkingCapitalPegOutput,
} from './types.js';

function money(value: number | undefined): number {
  return Number.isFinite(value) ? Math.round(value ?? 0) : 0;
}

function bpsAmount(baseCents: number, bps: number): number {
  return Math.round((baseCents * bps) / 10000);
}

export function computeWorkingCapitalPeg(input: WorkingCapitalPegInput): WorkingCapitalPegOutput {
  if (!input.months.length) {
    throw new Error('WorkingCapitalPegInput.months must include at least one month');
  }

  const monthlyNormalizedNwc = input.months.map((month) => {
    const currentAssetsCents =
      money(month.accountsReceivableCents) + money(month.inventoryCents) + money(month.prepaidExpensesCents);
    const currentLiabilitiesCents =
      money(month.accountsPayableCents) + money(month.accruedExpensesCents) + money(month.deferredRevenueCents);
    return {
      month: month.month,
      currentAssetsCents,
      currentLiabilitiesCents,
      normalizedNwcCents: currentAssetsCents - currentLiabilitiesCents,
    };
  });

  const total = monthlyNormalizedNwc.reduce((sum, month) => sum + month.normalizedNwcCents, 0);
  return {
    monthlyNormalizedNwc,
    trailingMonthCount: monthlyNormalizedNwc.length,
    pegCents: Math.round(total / monthlyNormalizedNwc.length),
  };
}

export function computeSection1060Allocation(input: Section1060AllocationInput): Section1060AllocationOutput {
  const totalConsiderationCents = money(input.purchasePriceCents) + money(input.assumedLiabilitiesCents);
  const allocation: Record<Section1060Class, number> = {
    classI: 0,
    classII: 0,
    classIII: 0,
    classIV: 0,
    classV: 0,
    classVI: 0,
    classVII: 0,
  };
  let remaining = totalConsiderationCents;
  const orderedClasses: Array<Exclude<Section1060Class, 'classVII'>> = [
    'classI',
    'classII',
    'classIII',
    'classIV',
    'classV',
    'classVI',
  ];

  for (const classId of orderedClasses) {
    const fairMarketValue = Math.max(0, money(input.fairMarketValuesCents[classId]));
    const allocated = Math.min(fairMarketValue, remaining);
    allocation[classId] = allocated;
    remaining -= allocated;
  }

  allocation.classVII = Math.max(0, remaining);
  return {
    totalConsiderationCents,
    allocation,
    residualClassVIICents: allocation.classVII,
  };
}

export function computeFirptaWithholding(input: FirptaWithholdingInput): FirptaWithholdingOutput {
  if (!input.sellerIsForeignPerson) {
    return {
      withholdingRateBps: 0,
      withholdingCents: 0,
      exemptionReason: 'seller_not_foreign_person',
      buyerFilingDueDaysAfterTransfer: null,
      forms: [],
    };
  }

  const amountRealizedCents = money(input.amountRealizedCents);
  const residence = input.buyerWillUseAsResidence === true;
  let withholdingRateBps = 1500;
  let exemptionReason: string | null = null;

  if (residence && amountRealizedCents <= 30000000) {
    withholdingRateBps = 0;
    exemptionReason = 'personal_residence_300k_or_less';
  } else if (residence && amountRealizedCents <= 100000000) {
    withholdingRateBps = 1000;
  }

  return {
    withholdingRateBps,
    withholdingCents: bpsAmount(amountRealizedCents, withholdingRateBps),
    exemptionReason,
    buyerFilingDueDaysAfterTransfer: 20,
    forms: ['8288', '8288-A'],
  };
}

export function computeIndemnificationLadder(input: IndemnificationLadderInput): IndemnificationLadderOutput {
  const capCents = bpsAmount(money(input.transactionValueCents), input.capBps);
  const basketCents = bpsAmount(money(input.transactionValueCents), input.basketBps);
  const lossesCents = Math.max(0, money(input.lossesCents));
  const recoverableBeforeCapCents =
    input.basketStyle === 'tipping'
      ? lossesCents > basketCents
        ? lossesCents
        : 0
      : Math.max(0, lossesCents - basketCents);
  const recoverableAfterCapCents = Math.min(recoverableBeforeCapCents, capCents);

  return {
    capCents,
    basketCents,
    lossesCents,
    recoverableBeforeCapCents,
    recoverableAfterCapCents,
    buyerRetainedLossCents: lossesCents - recoverableAfterCapCents,
  };
}
