import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Thesis {
  id: number;
  name: string;
  industry: string | null;
  naics_code: string | null;
  geography: string | null;
  min_revenue: number | null;
  max_revenue: number | null;
  min_price: number | null;
  max_price: number | null;
  status: string;
  match_count: number;
  created_at: string;
}

interface Match {
  id: number;
  thesis_id: number;
  business_name: string | null;
  industry: string | null;
  revenue: number | null;
  asking_price: number | null;
  location: string | null;
  score: number;
  score_breakdown: any;
  status: string;
  source_url: string | null;
  created_at: string;
}

function formatCurrency(val: number | null): string {
  if (!val) return '—';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

interface SourcingPanelProps {
  isFullscreen?: boolean;
}

export default function SourcingPanel({ isFullscreen }: SourcingPanelProps) {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showNewThesis, setShowNewThesis] = useState(false);
  const [newThesis, setNewThesis] = useState({
    name: '', industry: '', naicsCode: '', geography: '',
    minRevenue: '', maxRevenue: '', minPrice: '', maxPrice: '',
  });
  const [saving, setSaving] = useState(false);

  const loadTheses = useCallback(async () => {
    try {
      const res = await fetch('/api/sourcing/theses', { headers: authHeaders() });
      if (res.ok) setTheses(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTheses(); }, [loadTheses]);

  useEffect(() => {
    if (!selectedThesis) { setMatches([]); return; }
    (async () => {
      setMatchesLoading(true);
      try {
        const res = await fetch(`/api/sourcing/theses/${selectedThesis}/matches`, { headers: authHeaders() });
        if (res.ok) setMatches(await res.json());
      } catch { /* ignore */ }
      finally { setMatchesLoading(false); }
    })();
  }, [selectedThesis]);

  const createThesis = async () => {
    if (!newThesis.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sourcing/theses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: newThesis.name,
          industry: newThesis.industry || null,
          naicsCode: newThesis.naicsCode || null,
          geography: newThesis.geography || null,
          minRevenue: newThesis.minRevenue ? parseFloat(newThesis.minRevenue) : null,
          maxRevenue: newThesis.maxRevenue ? parseFloat(newThesis.maxRevenue) : null,
          minPrice: newThesis.minPrice ? parseFloat(newThesis.minPrice) : null,
          maxPrice: newThesis.maxPrice ? parseFloat(newThesis.maxPrice) : null,
        }),
      });
      if (res.ok) {
        setShowNewThesis(false);
        setNewThesis({ name: '', industry: '', naicsCode: '', geography: '', minRevenue: '', maxRevenue: '', minPrice: '', maxPrice: '' });
        loadTheses();
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const updateMatchStatus = async (matchId: number, status: string) => {
    try {
      await fetch(`/api/sourcing/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
    } catch { /* ignore */ }
  };

  return (
    <div style={{ padding: isFullscreen ? '24px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 900 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#6E6A63] m-0">
          {theses.length} {theses.length === 1 ? 'thesis' : 'theses'}
        </p>
        <button
          onClick={() => setShowNewThesis(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
        >
          + New Thesis
        </button>
      </div>

      {/* New Thesis Form */}
      {showNewThesis && (
        <div className="bg-[#FAF8F4] rounded-2xl border border-[#D4714E] p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1A1A18] m-0">Create Buy Thesis</h3>
            <button onClick={() => setShowNewThesis(false)} className="w-6 h-6 rounded-full hover:bg-[#F3F0EA] flex items-center justify-center cursor-pointer border-0 bg-transparent">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-2.5 mb-3">
            <div>
              <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Name *</label>
              <input
                type="text"
                value={newThesis.name}
                onChange={e => setNewThesis(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. DFW HVAC Roll-up"
                className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Industry</label>
                <input
                  type="text"
                  value={newThesis.industry}
                  onChange={e => setNewThesis(p => ({ ...p, industry: e.target.value }))}
                  placeholder="HVAC"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Geography</label>
                <input
                  type="text"
                  value={newThesis.geography}
                  onChange={e => setNewThesis(p => ({ ...p, geography: e.target.value }))}
                  placeholder="DFW"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Min Rev ($)</label>
                <input
                  type="number"
                  value={newThesis.minRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, minRevenue: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Max Rev ($)</label>
                <input
                  type="number"
                  value={newThesis.maxRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, maxRevenue: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewThesis(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-transparent text-[#6E6A63] border border-[#DDD9D1] cursor-pointer hover:bg-[#F3F0EA] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createThesis}
              disabled={saving || !newThesis.name.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-[#FAF8F4] rounded-2xl p-4">
              <div className="h-4 bg-[#EBE7DF] rounded w-1/3 mb-2" />
              <div className="flex gap-3">
                <div className="h-3 bg-[#F3F0EA] rounded w-1/4" />
                <div className="h-3 bg-[#F3F0EA] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && theses.length === 0 && !showNewThesis && (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F3F0EA] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">No buy theses yet</p>
          <p className="text-xs text-[#6E6A63] m-0 mb-3">Define what you're looking for and we'll find matches.</p>
          <button
            onClick={() => setShowNewThesis(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
          >
            Create your first thesis
          </button>
        </div>
      )}

      {/* Theses and matches */}
      {!loading && theses.length > 0 && (
        <div>
          {/* Thesis list */}
          <div className="space-y-2 mb-5">
            {theses.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedThesis(selectedThesis === t.id ? null : t.id)}
                className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer ${
                  selectedThesis === t.id
                    ? 'bg-[#FAF8F4] border-[#D4714E]'
                    : 'bg-[#FAF8F4] border-transparent hover:border-[#D4714E]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[#F3F0EA] text-[#A9A49C]'
                  }`}>
                    {t.status}
                  </span>
                  {t.match_count > 0 && (
                    <span className="text-[9px] font-bold text-[#D4714E] bg-[#D4714E]/10 px-1.5 py-0.5 rounded-full">
                      {t.match_count} match{t.match_count !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A18] m-0 truncate">{t.name}</h3>
                <div className="text-[10px] text-[#6E6A63] mt-0.5">
                  {[t.industry, t.geography, (t.min_revenue || t.max_revenue) ? `${formatCurrency(t.min_revenue)}–${formatCurrency(t.max_revenue)}` : null]
                    .filter(Boolean).join(' · ')}
                </div>
              </button>
            ))}
          </div>

          {/* Matches */}
          {selectedThesis && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Matches</h3>

              {matchesLoading && (
                <div className="space-y-2">
                  {[1,2].map(i => (
                    <div key={i} className="animate-pulse bg-[#FAF8F4] rounded-xl p-3">
                      <div className="flex gap-2 mb-1.5">
                        <div className="w-10 h-10 bg-[#EBE7DF] rounded-lg" />
                        <div className="flex-1">
                          <div className="h-3 bg-[#EBE7DF] rounded w-1/2 mb-1.5" />
                          <div className="h-2.5 bg-[#F3F0EA] rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!matchesLoading && matches.length === 0 && (
                <div className="text-center py-6 bg-[#FAF8F4] rounded-xl">
                  <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-0.5">No matches yet</p>
                  <p className="text-xs text-[#6E6A63] m-0">Matches appear as opportunities are scored.</p>
                </div>
              )}

              {!matchesLoading && matches.length > 0 && (
                <div className="space-y-2">
                  {matches.map(m => (
                    <div key={m.id} className="bg-[#FAF8F4] rounded-xl p-3">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${scoreColor(m.score)}`}>
                          {m.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="text-sm font-semibold text-[#1A1A18] m-0 truncate">
                              {m.business_name || 'Unnamed'}
                            </h4>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                              m.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              m.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                              m.status === 'pursuing' ? 'bg-green-100 text-green-700' :
                              'bg-[#F3F0EA] text-[#A9A49C]'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#6E6A63] mb-1.5 flex-wrap">
                            {m.industry && <span>{m.industry}</span>}
                            {m.revenue && <span>Rev: {formatCurrency(m.revenue)}</span>}
                            {m.asking_price && <span>Price: {formatCurrency(m.asking_price)}</span>}
                            {m.location && <span>{m.location}</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {m.status !== 'pursuing' && (
                              <button
                                onClick={() => updateMatchStatus(m.id, 'pursuing')}
                                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border-0 cursor-pointer hover:bg-green-100 transition-colors"
                              >
                                Pursue
                              </button>
                            )}
                            {m.status !== 'passed' && (
                              <button
                                onClick={() => updateMatchStatus(m.id, 'passed')}
                                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#F3F0EA] text-[#6E6A63] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors"
                              >
                                Pass
                              </button>
                            )}
                            {m.source_url && (
                              <a
                                href={m.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-medium text-[#D4714E] hover:underline ml-auto"
                              >
                                View listing
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
