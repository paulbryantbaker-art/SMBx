/**
 * SBA Financing Model — Interactive SBA 7(a) loan analysis.
 * Purchase price, down payment, rate, term, seller note.
 * DSCR gauge, monthly payment, amortization schedule, go/no-go.
 */
import { useState } from 'react';
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelSlider, ModelInput, DSCRGauge } from './Charts';
import { centsToDisplay, pctDisplay } from '../../lib/calculations/core';

interface Props {
  tabId: string;
}

export default function SBAModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);
  const [showAmortization, setShowAmortization] = useState(false);

  if (!tab) return null;

  const a = tab.assumptions;
  const sba = tab.outputs.sba;
  if (!sba) return <div className="p-5 text-sm text-[#6E6A63]">Set purchase price and earnings to begin.</div>;

  const GREEN = '#34A853';
  const YELLOW = '#FBBC04';
  const RED = '#EA4335';
  const goColor = sba.eligible ? GREEN : sba.dscr >= 1.0 ? YELLOW : RED;
  const goLabel = sba.eligible ? 'GO' : sba.dscr >= 1.0 ? 'MARGINAL' : 'NO-GO';

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      {/* Go/No-Go Traffic Light */}
      <div className="rounded-xl p-5 text-center" style={{ background: `${goColor}10`, border: `2px solid ${goColor}` }}>
        <p className="text-3xl font-bold m-0" style={{ color: goColor, fontFamily: 'Sora, sans-serif' }}>{goLabel}</p>
        <p className="text-sm m-0 mt-1" style={{ color: '#6E6A63' }}>
          {sba.eligible
            ? `DSCR ${sba.dscr.toFixed(2)}x passes SBA 1.25x threshold`
            : sba.dscr >= 1.0
              ? `DSCR ${sba.dscr.toFixed(2)}x is below SBA 1.25x — tight`
              : `DSCR ${sba.dscr.toFixed(2)}x — insufficient cash flow for SBA financing`
          }
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Loan Amount" value={centsToDisplay(sba.loanAmount)} />
        <KPICard label="Monthly Payment" value={centsToDisplay(sba.monthlyPayment)} />
        <KPICard label="Down Payment" value={centsToDisplay(sba.downPayment)} sublabel={pctDisplay(a.downPaymentPct ?? 0.10)} />
        <KPICard label="LTV" value={pctDisplay(sba.ltv)} color={sba.ltv <= 0.80 ? GREEN : sba.ltv <= 0.90 ? YELLOW : RED} />
      </div>

      {/* DSCR Gauge + Controls side by side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: DSCR + Details */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Debt Service Coverage</h3>
          <DSCRGauge dscr={sba.dscr} />

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs" style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: 4 }}>
              <span style={{ color: '#6E6A63' }}>Total Project Cost</span>
              <span className="font-medium tabular-nums">{centsToDisplay(sba.totalProjectCost)}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: 4 }}>
              <span style={{ color: '#6E6A63' }}>SBA Loan</span>
              <span className="font-medium tabular-nums">{centsToDisplay(sba.loanAmount)}</span>
            </div>
            {sba.sellerNote > 0 && (
              <div className="flex justify-between text-xs" style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: 4 }}>
                <span style={{ color: '#6E6A63' }}>Seller Note</span>
                <span className="font-medium tabular-nums">{centsToDisplay(sba.sellerNote)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs" style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: 4 }}>
              <span style={{ color: '#6E6A63' }}>Cash Equity Required</span>
              <span className="font-bold tabular-nums">{centsToDisplay(sba.equityRequired)}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: 4 }}>
              <span style={{ color: '#6E6A63' }}>Annual Debt Service</span>
              <span className="font-medium tabular-nums">{centsToDisplay(sba.annualDebtService)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6E6A63' }}>Max SBA Loan Capacity</span>
              <span className="font-medium tabular-nums">{centsToDisplay(sba.maxLoanCapacity)}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Financing Terms</h3>

          <ModelInput
            label="Purchase Price"
            value={a.purchasePrice || 0}
            onChange={v => update(tabId, 'purchasePrice', v)}
            prefix="$"
          />
          <ModelInput
            label="SDE / EBITDA (Annual)"
            value={a.earnings || 0}
            onChange={v => update(tabId, 'earnings', v)}
            prefix="$"
          />

          <ModelSlider
            label="Down Payment"
            value={a.downPaymentPct ?? 0.10}
            onChange={v => update(tabId, 'downPaymentPct', v)}
            min={0.05} max={0.30} step={0.01}
            format="percent"
          />

          <ModelSlider
            label="Interest Rate (Prime + spread)"
            value={a.interestRate ?? 0.0825}
            onChange={v => update(tabId, 'interestRate', v)}
            min={0.05} max={0.15} step={0.0025}
            format="percent"
          />

          <div className="mb-3">
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#6E6A63' }}>Loan Term</label>
            <select
              value={a.termMonths ?? 120}
              onChange={e => update(tabId, 'termMonths', Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ borderColor: '#DDD9D1', color: '#1A1A18' }}
            >
              <option value={120}>10 years (equipment/working capital)</option>
              <option value={300}>25 years (real estate included)</option>
            </select>
          </div>

          <ModelSlider
            label="Seller Note"
            value={a.sellerNotePct ?? 0}
            onChange={v => update(tabId, 'sellerNotePct', v)}
            min={0} max={0.20} step={0.01}
            format="percent"
          />

          <ModelInput
            label="Working Capital Injection"
            value={a.workingCapital ?? 0}
            onChange={v => update(tabId, 'workingCapital', v)}
            prefix="$"
          />
        </div>
      </div>

      {/* Amortization Schedule (collapsible) */}
      {sba.amortization && sba.amortization.length > 0 && (
        <div>
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer bg-transparent border-0 p-0"
            style={{ color: '#6E6A63' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showAmortization ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
            Amortization Schedule ({sba.amortization.length} months)
          </button>

          {showAmortization && (
            <div className="mt-2 overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
                <thead className="sticky top-0 bg-white">
                  <tr style={{ borderBottom: '2px solid #BA3C60' }}>
                    {['Month', 'Payment', 'Principal', 'Interest', 'Balance'].map(h => (
                      <th key={h} style={{ padding: '4px 8px', textAlign: 'right', fontSize: 10, color: '#6E6A63', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sba.amortization.filter((_: any, i: number) => i % 12 === 0 || i === sba.amortization.length - 1).map((row: any) => (
                    <tr key={row.month} style={{ borderBottom: '1px solid #EBEBEB' }}>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{row.month}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(row.payment)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(row.principal)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#EA4335' }}>{centsToDisplay(row.interest)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{centsToDisplay(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
