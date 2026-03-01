import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Deal {
  id: number;
  journey_type: string;
  current_gate: string;
  status: string;
  league: string | null;
  business_name: string | null;
  industry: string | null;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  deliverable_count: number;
  document_count: number;
  conversation_id: number | null;
}

interface PipelinePanelProps {
  onOpenConversation?: (conversationId: number) => void;
  onNewDeal?: () => void;
  isFullscreen?: boolean;
}

const JOURNEY_LABELS: Record<string, { label: string; color: string }> = {
  sell: { label: 'Sell', color: 'bg-[#D4714E] text-white' },
  buy: { label: 'Buy', color: 'bg-blue-600 text-white' },
  raise: { label: 'Raise', color: 'bg-green-600 text-white' },
  pmi: { label: 'PMI', color: 'bg-purple-600 text-white' },
};

const GATE_LABELS: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due Diligence', B4: 'Structure', B5: 'Closing',
  R0: 'Intake', R1: 'Financials', R2: 'Investor Pkg', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

const JOURNEY_GATES: Record<string, string[]> = {
  sell: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'],
  buy: ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'],
  raise: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'],
  pmi: ['PMI0', 'PMI1', 'PMI2', 'PMI3'],
};

function formatRevenue(val: number | null): string {
  if (!val) return '—';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PipelinePanel({ onOpenConversation, onNewDeal, isFullscreen }: PipelinePanelProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals', { headers: authHeaders() });
      if (res.ok) setDeals(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const getGateIndex = (deal: Deal): number => {
    const gates = JOURNEY_GATES[deal.journey_type] || [];
    return gates.indexOf(deal.current_gate);
  };

  const getGateProgress = (deal: Deal): number => {
    const gates = JOURNEY_GATES[deal.journey_type] || [];
    const idx = gates.indexOf(deal.current_gate);
    if (gates.length === 0) return 0;
    return Math.round((idx / (gates.length - 1)) * 100);
  };

  return (
    <div style={{ padding: isFullscreen ? '24px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 900 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#6E6A63] m-0">
          {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
        </p>
        {onNewDeal && (
          <button
            onClick={onNewDeal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
          >
            + New Deal
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-[#FAF9F7] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-4 bg-[#EBE7DF] rounded-full" />
                <div className="h-4 bg-[#EBE7DF] rounded" style={{ width: '40%' }} />
              </div>
              <div className="h-1.5 bg-[#F3F0EA] rounded-full mb-2" />
              <div className="flex gap-3">
                <div className="h-3 bg-[#F3F0EA] rounded" style={{ width: '25%' }} />
                <div className="h-3 bg-[#F3F0EA] rounded" style={{ width: '20%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F3F0EA] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">No deals yet</p>
          <p className="text-sm text-[#6E6A63] m-0 mb-3">Start a conversation with Yulia to begin your first deal.</p>
          {onNewDeal && (
            <button
              onClick={onNewDeal}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
            >
              Start a deal
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {deals.map(deal => {
          const journey = JOURNEY_LABELS[deal.journey_type] || JOURNEY_LABELS.sell;
          const gates = JOURNEY_GATES[deal.journey_type] || [];
          const currentIdx = getGateIndex(deal);
          const progress = getGateProgress(deal);

          return (
            <button
              key={deal.id}
              onClick={() => deal.conversation_id && onOpenConversation?.(deal.conversation_id)}
              className="w-full text-left bg-[#FAF9F7] rounded-2xl p-4 border border-transparent hover:border-[#D4714E] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${journey.color}`}>
                  {journey.label}
                </span>
                <span className="text-sm font-semibold text-[#1A1A18] truncate">
                  {deal.business_name || `${journey.label} Deal`}
                </span>
                {deal.league && (
                  <span className="text-[10px] font-semibold text-[#A9A49C] bg-[#F3F0EA] px-1.5 py-0.5 rounded-full ml-auto shrink-0">
                    {deal.league}
                  </span>
                )}
              </div>

              <div className="mb-2.5">
                <div className="flex items-center gap-1 mb-1">
                  {gates.map((gate, i) => (
                    <div key={gate} className="flex-1">
                      <div
                        className={`h-1.5 w-full rounded-full ${
                          i < currentIdx ? 'bg-[#D4714E]'
                          : i === currentIdx ? 'bg-[#D4714E] opacity-60'
                          : 'bg-[#EBE7DF]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#D4714E]">
                    {deal.current_gate}: {GATE_LABELS[deal.current_gate] || deal.current_gate}
                  </span>
                  <span className="text-[11px] text-[#A9A49C]">{progress}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#6E6A63] flex-wrap">
                {deal.industry && <span>{deal.industry}</span>}
                {deal.revenue && <span>Rev: {formatRevenue(deal.revenue)}</span>}
                {(deal.sde || deal.ebitda) && (
                  <span>{deal.sde ? `SDE: ${formatRevenue(deal.sde)}` : `EBITDA: ${formatRevenue(deal.ebitda)}`}</span>
                )}
                {deal.location && <span>{deal.location}</span>}
                <span className="ml-auto text-[#A9A49C]">{timeAgo(deal.updated_at)}</span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 pt-1.5 text-[10px] text-[#A9A49C]" style={{ borderTop: '1px solid #F3F0EA' }}>
                <span>{deal.deliverable_count} deliverable{Number(deal.deliverable_count) !== 1 ? 's' : ''}</span>
                <span>{deal.document_count} document{Number(deal.document_count) !== 1 ? 's' : ''}</span>
              </div>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
