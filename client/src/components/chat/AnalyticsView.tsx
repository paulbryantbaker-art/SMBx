/**
 * AnalyticsView — Unified analytics dashboard.
 * Shows deal pipeline overview, with drill-down into journey-specific dashboards.
 */
import { useState, useEffect, useCallback } from 'react';
import PipelinePanel from './PipelinePanel';
import SellerDashboard from './SellerDashboard';
import BuyerPipeline from './BuyerPipeline';

interface Deal {
  id: number;
  business_name: string;
  journey_type: string;
  current_gate: string;
  league: string;
  industry: string;
  status: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('smbx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#BA3C60',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

const JOURNEY_LABELS: Record<string, string> = {
  sell: 'Sell',
  buy: 'Buy',
  raise: 'Raise',
  pmi: 'PMI',
};

export default function AnalyticsView({
  onOpenConversation,
  onNewDeal,
}: {
  onOpenConversation?: (convId: number) => void;
  onNewDeal?: () => void;
}) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals', { headers: authHeaders() });
      if (res.ok) setDeals(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  // If a deal is selected, show journey-specific dashboard
  if (selectedDeal) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back button + deal info */}
        <button
          onClick={() => setSelectedDeal(null)}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-4"
          style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: 'rgba(0,0,0,0.45)' }}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Analytics
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: JOURNEY_COLORS[selectedDeal.journey_type] || '#999' }}
          />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.02em' }}>
            {selectedDeal.business_name || `${JOURNEY_LABELS[selectedDeal.journey_type] || ''} Deal #${selectedDeal.id}`}
          </h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.5)' }}
          >
            {selectedDeal.current_gate}
          </span>
        </div>

        {/* Journey-specific dashboard */}
        {selectedDeal.journey_type === 'sell' && <SellerDashboard />}
        {selectedDeal.journey_type === 'buy' && <BuyerPipeline />}
        {(selectedDeal.journey_type === 'raise' || selectedDeal.journey_type === 'pmi') && (
          <GateProgressView deal={selectedDeal} />
        )}
      </div>
    );
  }

  // Default view: Pipeline overview
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.02em' }}>Analytics</h1>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0' }}>
          Deal pipeline and progress overview
        </p>
      </div>

      {/* Quick stats */}
      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Active Deals" value={String(deals.filter(d => d.status === 'active').length)} />
          <StatCard label="Sell" value={String(deals.filter(d => d.journey_type === 'sell').length)} color="#BA3C60" />
          <StatCard label="Buy" value={String(deals.filter(d => d.journey_type === 'buy').length)} color="#4E8FD4" />
          <StatCard label="Raise / PMI" value={String(deals.filter(d => d.journey_type === 'raise' || d.journey_type === 'pmi').length)} color="#6B8F4E" />
        </div>
      )}

      {/* Deal cards — click to drill down */}
      {!loading && deals.length > 0 && (
        <div className="mb-8">
          <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,0,0,0.3)', margin: '0 0 12px' }}>Your Deals</h3>
          <div className="grid gap-3">
            {deals.map(deal => (
              <button
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl bg-white border cursor-pointer hover:shadow-sm transition-all"
                style={{ borderColor: 'rgba(0,0,0,0.08)', fontFamily: 'inherit' }}
                type="button"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: JOURNEY_COLORS[deal.journey_type] || '#999' }}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D', margin: 0 }} className="truncate">
                    {deal.business_name || `Deal #${deal.id}`}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', margin: '2px 0 0' }}>
                    {JOURNEY_LABELS[deal.journey_type] || deal.journey_type} · {deal.current_gate} · {deal.league || 'TBD'}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline panel */}
      <PipelinePanel
        onOpenConversation={onOpenConversation}
        onNewDeal={onNewDeal}
        isFullscreen={true}
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.35)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: color || '#0D0D0D', margin: '4px 0 0', letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  );
}

function GateProgressView({ deal }: { deal: Deal }) {
  const GATE_SEQUENCE: Record<string, string[]> = {
    raise: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'],
    pmi: ['PMI0', 'PMI1', 'PMI2', 'PMI3'],
  };
  const GATE_LABELS: Record<string, string> = {
    R0: 'Intake', R1: 'Financials', R2: 'Investor Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
    PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
  };

  const gates = GATE_SEQUENCE[deal.journey_type] || [];
  const currentIdx = gates.indexOf(deal.current_gate);

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D', margin: '0 0 16px' }}>Gate Progress</h3>
      <div className="flex flex-col gap-2">
        {gates.map((gate, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={gate}
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{
                background: isCurrent ? 'rgba(186,60,96,0.06)' : isDone ? 'rgba(0,0,0,0.02)' : 'transparent',
                border: isCurrent ? '1px solid rgba(186,60,96,0.2)' : '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: isDone ? '#BA3C60' : isCurrent ? 'rgba(186,60,96,0.15)' : 'rgba(0,0,0,0.06)',
                  color: isDone ? '#fff' : isCurrent ? '#BA3C60' : 'rgba(0,0,0,0.3)',
                }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: isCurrent ? 600 : 500, color: isDone || isCurrent ? '#0D0D0D' : 'rgba(0,0,0,0.35)', margin: 0 }}>
                  {gate} — {GATE_LABELS[gate] || gate}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
