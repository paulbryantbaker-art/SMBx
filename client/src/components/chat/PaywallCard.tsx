import { useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface PaywallData {
  gate: string;
  currentGate: string;
  requiredPlan?: string;
  priceDisplay?: string;
  valueProps: string[];
  callToAction: string;
  whatYouGet?: string[];
  dealId: number;
  // Legacy fields kept for backwards compat
  priceCents?: number;
}

interface PaywallCardProps {
  paywall: PaywallData;
  dealId: number;
  onUnlocked: (toGate: string, deliverableId?: number) => void;
}

const PLAN_DISPLAY: Record<string, { name: string; price: string; note: string }> = {
  starter: { name: 'Starter', price: '$49/month', note: 'Unlimited analysis and document exports' },
  professional: { name: 'Professional', price: '$149/month', note: 'CIM, deal room, matching, and more' },
  enterprise: { name: 'Enterprise', price: '$999/month', note: 'Teams, API, white-label, portfolio' },
};

export default function PaywallCard({ paywall, dealId, onUnlocked }: PaywallCardProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const plan = PLAN_DISPLAY[paywall.requiredPlan || 'starter'] || PLAN_DISPLAY.starter;

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);

    try {
      const res = await fetch(`/api/chat/deals/${dealId}/unlock-gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ gate: paywall.gate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // If Stripe checkout URL returned, redirect
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // TEST_MODE: instant success
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onUnlocked(data.toGate, data.deliverableId || undefined), 1500);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (success) {
    return (
      <div className="self-start max-w-[90%] min-w-0">
        <div className="bg-white rounded-[20px] px-6 py-5 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(186,60,96,.12)', border: '1px solid rgba(186,60,96,.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <p className="text-base font-semibold text-[#0D0D0D] m-0">{plan.name} Activated</p>
              <p className="text-sm text-[#6E6A63] m-0">All {plan.name} features are now unlocked.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="self-start max-w-[90%] min-w-0">
      <div className="bg-white rounded-[20px] px-6 py-5 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(186,60,96,.12)', border: '1px solid rgba(186,60,96,.2)' }}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#C4687A] text-white flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 6px rgba(186,60,96,.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-[#0D0D0D] m-0">Upgrade to {plan.name}</p>
            <p className="text-sm text-[#6E6A63] m-0 mt-1">{plan.note}</p>
          </div>
        </div>

        {/* Value props */}
        <div className="space-y-2 mb-4">
          {paywall.valueProps.map((prop, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#C4687A] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-[14px] text-[#3D3B37] leading-[1.4]">{prop}</span>
            </div>
          ))}
        </div>

        {/* What's included toggle */}
        {paywall.whatYouGet && paywall.whatYouGet.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[13px] text-[#C4687A] font-semibold bg-transparent border-0 cursor-pointer p-0 hover:opacity-80"
            >
              {showDetails ? 'Hide' : 'See'} everything included →
            </button>
            {showDetails && (
              <div className="mt-2 pl-1 space-y-1.5">
                {paywall.whatYouGet.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#C4687A] text-xs mt-1 shrink-0">●</span>
                    <span className="text-[13px] text-[#6E6A63] leading-[1.4]">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price + action */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #EBE7DF' }}>
          <div>
            <p className="text-2xl font-extrabold text-[#C4687A] m-0">{plan.price}</p>
            <p className="text-xs text-[#A9A49C] m-0 mt-0.5">Cancel anytime · No commitments</p>
          </div>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#C4687A] text-white border-0 cursor-pointer hover:bg-[#A85568] transition-colors disabled:opacity-60"
          >
            {purchasing ? 'Processing...' : paywall.callToAction || `Start ${plan.name}`}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
