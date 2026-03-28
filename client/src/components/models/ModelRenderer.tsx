/**
 * ModelRenderer — Dispatches to the correct interactive model component by type.
 */
import { useModelStore } from '../../lib/modelStore';
import ValuationExplorer from './ValuationExplorer';
import LBOModel from './LBOModel';
import SBAModel from './SBAModel';
import TaxImpactModel from './TaxImpactModel';
import CapTableModel from './CapTableModel';
import SensitivityModel from './SensitivityModel';
import ComparisonModel from './ComparisonModel';
import EarnoutModel from './EarnoutModel';
import WorkingCapitalModel from './WorkingCapitalModel';
import CovenantModel from './CovenantModel';

interface Props {
  tabId: string;
}

export default function ModelRenderer({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);

  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[#6E6A63]">Model not found.</p>
      </div>
    );
  }

  switch (tab.type) {
    case 'valuation':
    case 'sde_analysis':
      return <ValuationExplorer tabId={tabId} />;
    case 'lbo':
      return <LBOModel tabId={tabId} />;
    case 'sba_financing':
      return <SBAModel tabId={tabId} />;
    case 'tax_impact':
      return <TaxImpactModel tabId={tabId} />;
    case 'cap_table':
      return <CapTableModel tabId={tabId} />;
    case 'sensitivity':
      return <SensitivityModel tabId={tabId} />;
    case 'comparison':
      return <ComparisonModel tabId={tabId} />;
    case 'earnout':
      return <EarnoutModel tabId={tabId} />;
    case 'working_capital':
      return <WorkingCapitalModel tabId={tabId} />;
    case 'covenant':
      return <CovenantModel tabId={tabId} />;
    default:
      return (
        <div className="p-5">
          <div className="rounded-xl p-6 text-center" style={{ background: '#FAF8F4', border: '1px solid #DDD9D1' }}>
            <p className="text-sm font-medium m-0 mb-1" style={{ color: '#1A1A18' }}>{tab.title}</p>
            <p className="text-xs m-0" style={{ color: '#6E6A63' }}>Model type "{tab.type}" — coming soon.</p>
          </div>
        </div>
      );
  }
}
