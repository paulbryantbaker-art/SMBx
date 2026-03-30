/**
 * Tax Impact Model — Asset vs Stock sale comparison, PPA, installment.
 */
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelInput, ModelSlider } from './Charts';
import { centsToDisplay, pctDisplay, FEDERAL_RATES } from '../../lib/calculations/core';

interface Props { tabId: string; }

export default function TaxImpactModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const a = tab.assumptions;
  const { assetSale, stockSale, installment } = tab.outputs;

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>Tax Impact Analysis</h2>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ModelInput label="Sale Price" value={a.salePrice || 0} onChange={v => update(tabId, 'salePrice', v)} prefix="$" />
        <ModelInput label="Seller's Basis" value={a.sellerBasis || 0} onChange={v => update(tabId, 'sellerBasis', v)} prefix="$" />
        <ModelSlider label="State Tax Rate" value={a.stateTaxRate ?? 0} onChange={v => update(tabId, 'stateTaxRate', v)} min={0} max={0.15} step={0.005} format="percent" />
      </div>

      {/* Side-by-side comparison */}
      {stockSale && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Stock Sale */}
          <div className="rounded-xl p-4" style={{ border: '1px solid #DDD9D1' }}>
            <h3 className="text-sm font-bold m-0 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Stock Sale</h3>
            <div className="space-y-2 text-xs">
              <Row label="Capital Gain" value={centsToDisplay(stockSale.capitalGain)} />
              <Row label="Federal Tax (23.8%)" value={centsToDisplay(stockSale.federalTax)} color="#EA4335" />
              <Row label="State Tax" value={centsToDisplay(stockSale.stateTax)} color="#EA4335" />
              <div className="pt-2" style={{ borderTop: '2px solid #C25572' }}>
                <Row label="Net Proceeds" value={centsToDisplay(stockSale.netProceeds)} bold color="#34A853" />
              </div>
            </div>
          </div>

          {/* Asset Sale */}
          <div className="rounded-xl p-4" style={{ border: '1px solid #DDD9D1' }}>
            <h3 className="text-sm font-bold m-0 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Asset Sale</h3>
            {assetSale ? (
              <div className="space-y-2 text-xs">
                {assetSale.byClass.map((c: any) => (
                  <Row key={c.class} label={`${c.label} (${pctDisplay(c.sellerRate, 0)})`} value={centsToDisplay(c.tax)} color="#EA4335" />
                ))}
                <Row label="State Tax" value={centsToDisplay(assetSale.totalStateTax)} color="#EA4335" />
                <div className="pt-2" style={{ borderTop: '2px solid #C25572' }}>
                  <Row label="Net Proceeds" value={centsToDisplay(assetSale.netProceeds)} bold color="#34A853" />
                </div>
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#6E6A63' }}>Add asset allocations to compare.</p>
            )}
          </div>
        </div>
      )}

      {/* KPI comparison */}
      {stockSale && assetSale && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KPICard label="Stock Sale Net" value={centsToDisplay(stockSale.netProceeds)} color="#34A853" />
          <KPICard label="Asset Sale Net" value={centsToDisplay(assetSale.netProceeds)} color="#34A853" />
          <KPICard
            label="Difference"
            value={centsToDisplay(Math.abs(stockSale.netProceeds - assetSale.netProceeds))}
            sublabel={stockSale.netProceeds > assetSale.netProceeds ? 'Stock sale saves more' : 'Asset sale saves more'}
            color="#C25572"
          />
        </div>
      )}

      {/* Installment Sale */}
      {installment && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Installment Sale (§453)</h3>
          <p className="text-xs mb-2" style={{ color: '#6E6A63' }}>
            Gross Profit Ratio: {pctDisplay(installment.grossProfitRatio)}
          </p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #C25572' }}>
                  {['Year', 'Payment', 'Taxable Gain', 'Tax Due'].map(h => (
                    <th key={h} style={{ padding: '4px 8px', textAlign: 'right', fontSize: 10, color: '#6E6A63', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {installment.yearlyTax.map((y: any) => (
                  <tr key={y.year} style={{ borderBottom: '1px solid #EBEBEB' }}>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>Year {y.year}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(y.payment)}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(y.taxableGain)}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#EA4335' }}>{centsToDisplay(y.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Installment inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ModelInput label="Down Payment" value={a.downPayment || 0} onChange={v => update(tabId, 'downPayment', v)} prefix="$" />
        <ModelInput label="Annual Payments" value={a.annualPayments || 0} onChange={v => update(tabId, 'annualPayments', v)} prefix="$" />
        <ModelSlider label="Installment Years" value={a.installmentYears ?? 0} onChange={v => update(tabId, 'installmentYears', v)} min={0} max={10} step={1} suffix=" yrs" />
      </div>
    </div>
  );
}

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: '#6E6A63' }}>{label}</span>
      <span className="tabular-nums" style={{ fontWeight: bold ? 700 : 500, color: color || '#1A1A18' }}>{value}</span>
    </div>
  );
}
