/**
 * ModelRenderer — Dispatches to the correct interactive model component by type.
 * Used by the canvas tab system to render model tabs.
 */
import { useModelStore, type ModelType } from '../../lib/modelStore';
import ValuationExplorer from './ValuationExplorer';
import LBOModel from './LBOModel';
import SBAModel from './SBAModel';

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
    default:
      return (
        <div className="p-5">
          <div className="rounded-xl p-6 text-center" style={{ background: '#FAF8F4', border: '1px solid #DDD9D1' }}>
            <p className="text-sm font-medium m-0 mb-1" style={{ color: '#1A1A18' }}>
              {tab.title}
            </p>
            <p className="text-xs m-0" style={{ color: '#6E6A63' }}>
              Interactive {tab.type} model — coming soon.
            </p>
          </div>
        </div>
      );
  }
}
