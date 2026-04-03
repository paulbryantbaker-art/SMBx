/**
 * Model State Store — Zustand store for interactive canvas model tabs.
 *
 * Each model tab has: assumptions (inputs) → calculation engine → outputs.
 * Both UI controls and Yulia's tools modify the same state.
 * Analytics tracked via trackEvent.
 * Cross-tab linking: comparison/sensitivity tabs subscribe to source tabs.
 */
import { create } from 'zustand';
import { trackEvent } from './analytics';
import {
  calculateValuation, calculateLBO, calculateSBAFinancing,
  calculateDSCRFull, calculateFCF, calculateBlendedValuation,
  calculateSDE, calculateEBITDA, calculateDilution, calculateExitWaterfall,
  calculateEarnout, calculateCovenantCompliance, calculateAssetSaleTax,
  calculateStockSaleTax, calculateWorkingCapitalPeg, buildSensitivityMatrix,
  calculateDCF, calculateInstallmentSale,
  type LBOAssumptions, type ValuationResult, type LBOResult,
  type SBAResult, type DSCRResult, type AddBack,
  type CapTableRound, type EarnoutMilestone, type TaxAssetClass,
} from './calculations/core';

// ─── Types ──────────────────────────────────────────────────────────

export type ModelType =
  | 'valuation' | 'lbo' | 'sba_financing' | 'dcf'
  | 'sensitivity' | 'comparison' | 'cap_table' | 'earnout'
  | 'tax_impact' | 'working_capital' | 'covenant' | 'sde_analysis';

export interface ModelTab {
  id: string;
  type: ModelType;
  title: string;
  dealId?: number;
  assumptions: Record<string, any>;
  outputs: Record<string, any>;
  linkedTabs: string[];
  createdAt: number;
}

interface ModelStore {
  tabs: Record<string, ModelTab>;
  activeTabId: string | null;

  // Actions
  createTab: (type: ModelType, title: string, initialAssumptions?: Record<string, any>, dealId?: number) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateAssumption: (tabId: string, key: string, value: any) => void;
  updateAssumptions: (tabId: string, updates: Record<string, any>) => void;
  linkTabs: (sourceTabId: string, targetTabId: string) => void;
  getTabSummaries: () => { tabId: string; title: string; type: ModelType; keyOutputs: Record<string, any> }[];
}

// ─── Recalculation Engine ───────────────────────────────────────────

function recalculate(tab: ModelTab): Record<string, any> {
  const a = tab.assumptions;

  switch (tab.type) {
    case 'sde_analysis': {
      const addBacks: AddBack[] = a.addBacks || [];
      const result = calculateSDE(a.netIncome || 0, a.ownerSalary || 0, addBacks);
      const valuation = calculateValuation(result.sde, a.league || 'L1', a.multipleOverride);
      return { ...result, valuation };
    }

    case 'valuation': {
      const earnings = a.sde || a.ebitda || 0;
      const valuation = calculateValuation(earnings, a.league || 'L1', a.multipleOverride);

      // Blended valuation if multiple methods
      const methods = [];
      if (valuation.mid > 0) methods.push({ label: 'Multiple', value: valuation.mid, weight: a.multipleWeight ?? 60 });
      if (a.dcfValue) methods.push({ label: 'DCF', value: a.dcfValue, weight: a.dcfWeight ?? 20 });
      if (a.assetValue) methods.push({ label: 'Asset', value: a.assetValue, weight: a.assetWeight ?? 20 });

      const blended = methods.length > 1 ? calculateBlendedValuation(methods) : null;

      return { valuation, blended };
    }

    case 'lbo': {
      const lboAssumptions: LBOAssumptions = {
        purchasePrice: a.purchasePrice || 0,
        ebitda: a.ebitda || 0,
        revenueGrowthRate: a.revenueGrowthRate ?? 0.05,
        ebitdaMargin: a.ebitdaMargin ?? 0.20,
        exitMultiple: a.exitMultiple ?? 5.0,
        holdPeriod: a.holdPeriod ?? 5,
        seniorDebtPct: a.seniorDebtPct ?? 0.60,
        seniorRate: a.seniorRate ?? 0.08,
        seniorTerm: a.seniorTerm ?? 120,
        mezDebtPct: a.mezDebtPct ?? 0,
        mezRate: a.mezRate ?? 0.12,
        mezTerm: a.mezTerm ?? 60,
        revenue: a.revenue,
      };
      return { lbo: calculateLBO(lboAssumptions), lboAssumptions };
    }

    case 'sba_financing': {
      const sba = calculateSBAFinancing(
        a.purchasePrice || 0,
        a.earnings || 0,
        a.downPaymentPct ?? 0.10,
        a.interestRate ?? 0.0825,
        a.termMonths ?? 120,
        a.sellerNotePct ?? 0,
        a.workingCapital ?? 0,
      );
      return { sba };
    }

    case 'dcf': {
      const projections: number[] = [];
      const baseFcf = a.baseFCF || 0;
      for (let y = 1; y <= (a.projectionYears || 5); y++) {
        projections.push(Math.round(baseFcf * Math.pow(1 + (a.growthRate || 0.05), y)));
      }
      const dcf = calculateDCF(projections, a.terminalGrowthRate ?? 0.02, a.discountRate ?? 0.10);
      return { dcf, projections };
    }

    case 'sensitivity': {
      if (!a.sourceTabAssumptions) return {};
      return {
        matrix: buildSensitivityMatrix(
          a.sourceTabAssumptions,
          a.var1Key || 'ebitda',
          a.var1Values || [],
          a.var2Key || 'exitMultiple',
          a.var2Values || [],
          a.outputMetric || 'irr',
        ),
      };
    }

    case 'cap_table': {
      const rounds: CapTableRound[] = a.rounds || [];
      const dilution = calculateDilution(a.foundersShares || 10000000, rounds);
      const exitValues = (a.exitValues || [5000000000, 10000000000, 25000000000, 50000000000]) as number[];
      const waterfalls = exitValues.map(ev => ({
        exitValue: ev,
        ...calculateExitWaterfall(dilution.rows, rounds, ev),
      }));
      return { dilution, waterfalls };
    }

    case 'earnout': {
      const milestones: EarnoutMilestone[] = a.milestones || [];
      return { earnout: calculateEarnout(milestones, a.discountRate ?? 0.10) };
    }

    case 'tax_impact': {
      const assetAllocations: TaxAssetClass[] = a.assetAllocations || [];
      const assetSale = assetAllocations.length > 0
        ? calculateAssetSaleTax(assetAllocations, a.stateTaxRate ?? 0)
        : null;
      const stockSale = calculateStockSaleTax(
        a.salePrice || 0, a.sellerBasis || 0, a.stateTaxRate ?? 0,
      );
      const installment = a.installmentYears
        ? calculateInstallmentSale(a.salePrice || 0, a.sellerBasis || 0, a.downPayment || 0, a.annualPayments || 0, a.installmentYears)
        : null;
      return { assetSale, stockSale, installment };
    }

    case 'working_capital': {
      const monthlyData = a.monthlyData || [];
      return { wc: calculateWorkingCapitalPeg(monthlyData) };
    }

    case 'covenant': {
      return {
        covenant: calculateCovenantCompliance(
          a.ebitda || 0,
          a.annualDebtService || 0,
          a.totalDebt || 0,
          a.assetValue || 0,
          { minDscr: a.minDscr ?? 1.25, maxDebtToEbitda: a.maxDebtToEbitda ?? 3.5, maxLtv: a.maxLtv ?? 0.80 },
        ),
      };
    }

    case 'comparison': {
      // Comparison reads from linked tabs — outputs are derived
      return { comparisonData: a.comparisonData || [] };
    }

    default:
      return {};
  }
}

// ─── Store ──────────────────────────────────────────────────────────

let tabCounter = 0;

export const useModelStore = create<ModelStore>((set, get) => ({
  tabs: {},
  activeTabId: null,

  createTab: (type, title, initialAssumptions = {}, dealId) => {
    const id = `model-${++tabCounter}-${Date.now()}`;
    const tab: ModelTab = {
      id, type, title, dealId,
      assumptions: initialAssumptions,
      outputs: {},
      linkedTabs: [],
      createdAt: Date.now(),
    };
    tab.outputs = recalculate(tab);

    set(state => ({
      tabs: { ...state.tabs, [id]: tab },
      activeTabId: id,
    }));
    trackEvent('model_created', { model: type, title });
    return id;
  },

  closeTab: (tabId) => {
    set(state => {
      const { [tabId]: _, ...rest } = state.tabs;
      const tabIds = Object.keys(rest);
      return {
        tabs: rest,
        activeTabId: state.activeTabId === tabId
          ? (tabIds.length > 0 ? tabIds[tabIds.length - 1] : null)
          : state.activeTabId,
      };
    });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateAssumption: (tabId, key, value) => {
    set(state => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      const updated = {
        ...tab,
        assumptions: { ...tab.assumptions, [key]: value },
      };
      updated.outputs = recalculate(updated);

      // Propagate to linked tabs
      const newTabs = { ...state.tabs, [tabId]: updated };
      for (const linkedId of updated.linkedTabs) {
        const linked = newTabs[linkedId];
        if (linked && linked.type === 'sensitivity') {
          const linkedUpdated = { ...linked, assumptions: { ...linked.assumptions, sourceTabAssumptions: updated.assumptions } };
          linkedUpdated.outputs = recalculate(linkedUpdated);
          newTabs[linkedId] = linkedUpdated;
        }
      }

      return { tabs: newTabs };
    });
  },

  updateAssumptions: (tabId, updates) => {
    set(state => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      const updated = {
        ...tab,
        assumptions: { ...tab.assumptions, ...updates },
      };
      updated.outputs = recalculate(updated);

      const newTabs = { ...state.tabs, [tabId]: updated };
      for (const linkedId of updated.linkedTabs) {
        const linked = newTabs[linkedId];
        if (linked) {
          const linkedUpdated = { ...linked, assumptions: { ...linked.assumptions, sourceTabAssumptions: updated.assumptions } };
          linkedUpdated.outputs = recalculate(linkedUpdated);
          newTabs[linkedId] = linkedUpdated;
        }
      }

      return { tabs: newTabs };
    });
  },

  linkTabs: (sourceTabId, targetTabId) => {
    set(state => {
      const source = state.tabs[sourceTabId];
      if (!source) return state;
      const linked = new Set(source.linkedTabs);
      linked.add(targetTabId);
      return {
        tabs: {
          ...state.tabs,
          [sourceTabId]: { ...source, linkedTabs: [...linked] },
        },
      };
    });
  },

  getTabSummaries: () => {
    const { tabs } = get();
    return Object.values(tabs).map(tab => ({
      tabId: tab.id,
      title: tab.title,
      type: tab.type,
      keyOutputs: extractKeyOutputs(tab),
    }));
  },
}));

function extractKeyOutputs(tab: ModelTab): Record<string, any> {
  const o = tab.outputs;
  switch (tab.type) {
    case 'valuation':
      return { valuationMid: o.valuation?.mid, metric: o.valuation?.metric, league: o.valuation?.league };
    case 'lbo':
      return { irr: o.lbo?.irr, moic: o.lbo?.moic, dscr: o.lbo?.dscrByYear?.[0] };
    case 'sba_financing':
      return { dscr: o.sba?.dscr, eligible: o.sba?.eligible, monthlyPayment: o.sba?.monthlyPayment };
    case 'dcf':
      return { enterpriseValue: o.dcf?.enterpriseValue };
    case 'cap_table':
      return { founderOwnership: o.dilution?.rows?.[0]?.ownership };
    case 'earnout':
      return { expectedValue: o.earnout?.expectedValue };
    default:
      return {};
  }
}
