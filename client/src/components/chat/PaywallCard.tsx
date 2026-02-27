import { useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface PaywallData {
  gate: string;
  currentGate: string;
  priceCents: number;
  priceDisplay: string;
  valueProps: string[];
  comparisonText: string;
  callToAction: string;
  balanceCents: number;
  balanceDisplay: string;
  sufficient: boolean;
}

interface PaywallCardProps {
  paywall: PaywallData;
  dealId: number;
  onUnlocked: (toGate: string, deliverableId?: number) => void;
  onTopUp: () => void;
}

const GATE_NAMES: Record<string, string> = {
  S2: 'Valuation Report',
  B2: 'Buyer\'s Valuation Model',
  R2: 'Investor Materials Package',
};

export default function PaywallCard({ paywall, dealId, onUnlocked, onTopUp }: PaywallCardProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);

    try {
      const res = await fetch(`/api/chat/deals/${dealId}/unlock-gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ gate: paywall.gate }),
      });

      if (res.status === 402) {
        const data = await res.json();
        setError(`Insufficient balance (${data.balanceDisplay}). You need ${data.shortfallDisplay} more.`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Purchase failed' }));
        setError(data.error || 'Purchase failed');
        return;
      }

      const data = await res.json();
      setSuccess(true);
      setTimeout(() => onUnlocked(data.toGate, data.deliverableId || undefined), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (success) {
    return (
      <div className="self-start max-w-[90%] min-w-0">
        <div className="bg-white rounded-[20px] px-6 py-5 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(212,113,78,.12)', border: '1px solid rgba(212,113,78,.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <p className="text-base font-semibold text-[#1A1A18] m-0">Purchased</p>
              <p className="text-sm text-[#6E6A63] m-0">Advancing to {GATE_NAMES[paywall.gate] || paywall.gate}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="self-start max-w-[90%] min-w-0">
      <div className="bg-white rounded-[20px] px-6 py-5 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(212,113,78,.12)', border: '1px solid rgba(212,113,78,.2)' }}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#D4714E] text-white flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A1A18] m-0">{GATE_NAMES[paywall.gate] || paywall.gate}</p>
            <p className="text-sm text-[#6E6A63] m-0 mt-0.5">{paywall.comparisonText}</p>
          </div>
        </div>

        {/* Value props */}
        <div className="space-y-2 mb-4">
          {paywall.valueProps.map((prop, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#D4714E] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-[14px] text-[#3D3B37] leading-[1.4]">{prop}</span>
            </div>
          ))}
        </div>

        {/* Price + action */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #EBE7DF' }}>
          <div>
            <p className="text-2xl font-extrabold text-[#D4714E] m-0">{paywall.priceDisplay}</p>
            <p className="text-xs text-[#A9A49C] m-0 mt-0.5">Wallet: {paywall.balanceDisplay}</p>
          </div>
          <div className="flex gap-2">
            {!paywall.sufficient && (
              <button
                onClick={onTopUp}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F3F0EA] text-[#3D3B37] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors"
              >
                Add Funds
              </button>
            )}
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-60"
            >
              {purchasing ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
            {error.includes('Insufficient') && (
              <button
                onClick={onTopUp}
                className="ml-2 text-[#D4714E] font-semibold underline bg-transparent border-0 cursor-pointer p-0"
              >
                Top up wallet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
