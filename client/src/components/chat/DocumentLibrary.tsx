/**
 * DocumentLibrary — Unified view of all deliverables across all deals.
 * Shows a filterable list with deal context, status, and type.
 */
import { useState, useEffect, useCallback } from 'react';

interface Deliverable {
  id: number;
  deal_id: number;
  deal_name: string;
  journey_type: string;
  league: string;
  slug: string;
  name: string;
  description: string;
  tier: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('smbx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  queued: { bg: 'rgba(0,0,0,0.05)', text: 'rgba(0,0,0,0.4)' },
  generating: { bg: '#FEF3C7', text: '#92400E' },
  completed: { bg: '#ECFDF5', text: '#065F46' },
  failed: { bg: '#FEF2F2', text: '#991B1B' },
  draft: { bg: '#EFF6FF', text: '#1E40AF' },
  review: { bg: '#FEF3C7', text: '#92400E' },
  approved: { bg: '#ECFDF5', text: '#065F46' },
  locked: { bg: '#F3F4F6', text: '#374151' },
};

const JOURNEY_LABELS: Record<string, string> = {
  sell: 'Sell',
  buy: 'Buy',
  raise: 'Raise',
  pmi: 'PMI',
};

export default function DocumentLibrary({ onViewDeliverable }: { onViewDeliverable?: (id: number) => void }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDeal, setFilterDeal] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/deliverables/all', { headers: authHeaders() });
      if (res.ok) {
        setDeliverables(await res.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derive unique deals for filter
  const dealOptions = Array.from(new Map(deliverables.map(d => [d.deal_id, { id: d.deal_id, name: d.deal_name || `Deal #${d.deal_id}` }])).values());

  // Filter
  const filtered = deliverables.filter(d => {
    if (filterDeal !== 'all' && String(d.deal_id) !== filterDeal) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.slug.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-[#C96B4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.02em' }}>Documents</h1>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0' }}>
          All deliverables across your deals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
          />
        </div>
        {/* Deal filter */}
        <select
          value={filterDeal}
          onChange={e => setFilterDeal(e.target.value)}
          className="text-sm py-2 px-3 border rounded-lg bg-white outline-none cursor-pointer"
          style={{ borderColor: 'rgba(0,0,0,0.1)', fontFamily: 'inherit', color: '#0D0D0D' }}
        >
          <option value="all">All Deals</option>
          {dealOptions.map(d => (
            <option key={d.id} value={String(d.id)}>{d.name}</option>
          ))}
        </select>
        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm py-2 px-3 border rounded-lg bg-white outline-none cursor-pointer"
          style={{ borderColor: 'rgba(0,0,0,0.1)', fontFamily: 'inherit', color: '#0D0D0D' }}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="generating">Generating</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
            {deliverables.length === 0 ? 'No documents yet. Chat with Yulia to generate deliverables.' : 'No documents match your filters.'}
          </p>
        </div>
      )}

      {/* Document list */}
      {filtered.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_150px_100px_100px_120px] gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)' }}>Name</span>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)' }}>Deal</span>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)' }}>Type</span>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)' }}>Status</span>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)' }}>Date</span>
          </div>
          {/* Rows */}
          {filtered.map(d => {
            const statusStyle = STATUS_COLORS[d.status] || STATUS_COLORS.queued;
            return (
              <button
                key={d.id}
                onClick={() => onViewDeliverable?.(d.id)}
                className="w-full text-left px-4 py-3 flex md:grid md:grid-cols-[1fr_150px_100px_100px_120px] gap-2 items-center bg-transparent border-0 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', fontFamily: 'inherit' }}
                type="button"
              >
                <div className="min-w-0">
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#0D0D0D', margin: 0 }} className="truncate">{d.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', margin: '2px 0 0' }} className="truncate md:hidden">
                    {d.deal_name || `Deal #${d.deal_id}`}
                  </p>
                </div>
                <span className="hidden md:block text-sm truncate" style={{ color: 'rgba(0,0,0,0.5)' }}>
                  {d.deal_name || `Deal #${d.deal_id}`}
                </span>
                <span className="hidden md:block text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  {JOURNEY_LABELS[d.journey_type] || d.journey_type}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap w-fit"
                  style={{ background: statusStyle.bg, color: statusStyle.text }}
                >
                  {d.status}
                </span>
                <span className="hidden md:block text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
                  {new Date(d.completed_at || d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
