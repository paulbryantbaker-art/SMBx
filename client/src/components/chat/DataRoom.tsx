import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Deliverable {
  id: number;
  deal_id: number;
  slug: string;
  name: string;
  description: string;
  tier: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  created_at: string;
  completed_at: string | null;
  generation_time_ms: number | null;
}

interface DataRoomProps {
  dealId: number | null;
  onViewDeliverable: (id: number) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  queued: { label: 'Queued', color: 'text-yellow-600 bg-yellow-50' },
  generating: { label: 'Generating...', color: 'text-blue-600 bg-blue-50' },
  complete: { label: 'Ready', color: 'text-green-700 bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-50' },
};

const TIER_ICONS: Record<string, string> = {
  analyst: '📊',
  associate: '📋',
  vp: '📑',
};

export default function DataRoom({ dealId, onViewDeliverable }: DataRoomProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeliverables = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/deliverables`, { headers: authHeaders() });
      if (res.ok) setDeliverables(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [dealId]);

  useEffect(() => { fetchDeliverables(); }, [fetchDeliverables]);

  // Poll for in-progress deliverables
  useEffect(() => {
    const hasInProgress = deliverables.some(d => d.status === 'queued' || d.status === 'generating');
    if (!hasInProgress) return;
    const interval = setInterval(fetchDeliverables, 5000);
    return () => clearInterval(interval);
  }, [deliverables, fetchDeliverables]);

  if (!dealId) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary m-0">Start a conversation to see your deliverables here.</p>
      </div>
    );
  }

  if (loading && deliverables.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary m-0">Loading deliverables...</p>
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A766E" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-primary m-0 mb-1">No deliverables yet</p>
        <p className="text-xs text-text-secondary m-0">Deliverables will appear here as you progress through your journey with Yulia.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {deliverables.map(d => {
        const status = STATUS_LABELS[d.status] || STATUS_LABELS.queued;
        return (
          <button
            key={d.id}
            onClick={() => d.status === 'complete' && onViewDeliverable(d.id)}
            disabled={d.status !== 'complete'}
            className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer bg-white ${
              d.status === 'complete'
                ? 'border-border hover:border-terra hover:shadow-sm'
                : 'border-border opacity-75 cursor-default'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{TIER_ICONS[d.tier] || '📄'}</span>
                  <p className="text-sm font-medium text-text-primary m-0 truncate">{d.name}</p>
                </div>
                <p className="text-xs text-text-secondary m-0 line-clamp-2">{d.description}</p>
              </div>
              <span className={`text-[0.625rem] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${status.color}`}>
                {status.label}
              </span>
            </div>
            {d.status === 'generating' && (
              <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
