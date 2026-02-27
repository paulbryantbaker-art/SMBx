import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { authHeaders, type User } from '../hooks/useAuth';

interface SourcingProps {
  user: User;
  onLogout: () => void;
}

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

export default function Sourcing({ user, onLogout }: SourcingProps) {
  const [, navigate] = useLocation();
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

  // Load theses
  const loadTheses = useCallback(async () => {
    try {
      const res = await fetch('/api/sourcing/theses', { headers: authHeaders() });
      if (res.ok) setTheses(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTheses(); }, [loadTheses]);

  // Load matches for selected thesis
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

  // Create thesis
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

  // Update match status
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
    <div className="min-h-dvh bg-[#FAF8F4]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F4]" style={{ borderBottom: '1px solid #DDD9D1' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 text-sm text-[#6E6A63] bg-transparent border-0 cursor-pointer hover:text-[#D4714E] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Chat
          </button>
          <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            smb<span className="text-[#D4714E]">x</span>.ai
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6E6A63]">{user.display_name || user.email}</span>
          <button onClick={onLogout} className="text-sm text-[#A9A49C] bg-transparent border-0 cursor-pointer hover:text-[#D4714E] transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A18] m-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
              Deal Sourcing
            </h1>
            <p className="text-sm text-[#6E6A63] m-0 mt-1">
              {theses.length} {theses.length === 1 ? 'thesis' : 'theses'}
            </p>
          </div>
          <button
            onClick={() => setShowNewThesis(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
          >
            + New Thesis
          </button>
        </div>

        {/* New Thesis Form */}
        {showNewThesis && (
          <div className="bg-white rounded-2xl border border-[#D4714E] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1A1A18] m-0">Create Buy Thesis</h3>
              <button onClick={() => setShowNewThesis(false)} className="w-7 h-7 rounded-full hover:bg-[#F3F0EA] flex items-center justify-center cursor-pointer border-0 bg-transparent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Thesis Name *</label>
                <input
                  type="text"
                  value={newThesis.name}
                  onChange={e => setNewThesis(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. DFW HVAC Roll-up"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Industry</label>
                <input
                  type="text"
                  value={newThesis.industry}
                  onChange={e => setNewThesis(p => ({ ...p, industry: e.target.value }))}
                  placeholder="e.g. HVAC, Pest Control"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Geography</label>
                <input
                  type="text"
                  value={newThesis.geography}
                  onChange={e => setNewThesis(p => ({ ...p, geography: e.target.value }))}
                  placeholder="e.g. Dallas-Fort Worth"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Min Revenue ($)</label>
                <input
                  type="number"
                  value={newThesis.minRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, minRevenue: e.target.value }))}
                  placeholder="500000"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Max Revenue ($)</label>
                <input
                  type="number"
                  value={newThesis.maxRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, maxRevenue: e.target.value }))}
                  placeholder="2000000"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Min Price ($)</label>
                <input
                  type="number"
                  value={newThesis.minPrice}
                  onChange={e => setNewThesis(p => ({ ...p, minPrice: e.target.value }))}
                  placeholder="300000"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6A63] mb-1">Max Price ($)</label>
                <input
                  type="number"
                  value={newThesis.maxPrice}
                  onChange={e => setNewThesis(p => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="1500000"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewThesis(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-[#6E6A63] border border-border cursor-pointer hover:bg-[#F3F0EA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createThesis}
                disabled={saving || !newThesis.name.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating...' : 'Create Thesis'}
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-border">
                <div className="h-5 bg-[#EBE7DF] rounded w-1/3 mb-3" />
                <div className="flex gap-4">
                  <div className="h-4 bg-[#F3F0EA] rounded w-1/4" />
                  <div className="h-4 bg-[#F3F0EA] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && theses.length === 0 && !showNewThesis && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F0EA] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#1A1A18] m-0 mb-1">No buy theses yet</p>
            <p className="text-sm text-[#6E6A63] m-0 mb-4">Define what you're looking for and we'll find matches.</p>
            <button
              onClick={() => setShowNewThesis(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors"
            >
              Create your first thesis
            </button>
          </div>
        )}

        {/* Thesis list */}
        {!loading && theses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Thesis list */}
            <div className="space-y-3">
              {theses.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThesis(t.id)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                    selectedThesis === t.id
                      ? 'bg-white border-[#D4714E] shadow-sm'
                      : 'bg-white border-border hover:border-[#D4714E]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[#F3F0EA] text-[#A9A49C]'
                    }`}>
                      {t.status}
                    </span>
                    {t.match_count > 0 && (
                      <span className="text-[10px] font-bold text-[#D4714E] bg-[#D4714E]/10 px-2 py-0.5 rounded-full">
                        {t.match_count} match{t.match_count !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-1 truncate">{t.name}</h3>
                  <div className="text-[11px] text-[#6E6A63] space-y-0.5">
                    {t.industry && <p className="m-0">{t.industry}</p>}
                    {t.geography && <p className="m-0">{t.geography}</p>}
                    {(t.min_revenue || t.max_revenue) && (
                      <p className="m-0">Rev: {formatCurrency(t.min_revenue)} — {formatCurrency(t.max_revenue)}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Matches */}
            <div className="md:col-span-2">
              {!selectedThesis && (
                <div className="text-center py-12">
                  <p className="text-sm text-[#6E6A63] m-0">Select a thesis to view matches</p>
                </div>
              )}

              {selectedThesis && matchesLoading && (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-border">
                      <div className="flex gap-3 mb-2">
                        <div className="w-12 h-12 bg-[#EBE7DF] rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-[#EBE7DF] rounded w-1/2 mb-2" />
                          <div className="h-3 bg-[#F3F0EA] rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedThesis && !matchesLoading && matches.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-border">
                  <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">No matches yet</p>
                  <p className="text-sm text-[#6E6A63] m-0">Matches will appear here as opportunities are scored against this thesis.</p>
                </div>
              )}

              {selectedThesis && !matchesLoading && matches.length > 0 && (
                <div className="space-y-3">
                  {matches.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        {/* Score badge */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${scoreColor(m.score)}`}>
                          {m.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-semibold text-[#1A1A18] m-0 truncate">
                              {m.business_name || 'Unnamed Opportunity'}
                            </h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              m.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              m.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                              m.status === 'pursuing' ? 'bg-green-100 text-green-700' :
                              'bg-[#F3F0EA] text-[#A9A49C]'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[12px] text-[#6E6A63] mb-2">
                            {m.industry && <span>{m.industry}</span>}
                            {m.revenue && <span>Rev: {formatCurrency(m.revenue)}</span>}
                            {m.asking_price && <span>Price: {formatCurrency(m.asking_price)}</span>}
                            {m.location && <span>{m.location}</span>}
                          </div>
                          {/* Score breakdown */}
                          {m.score_breakdown && (
                            <div className="flex gap-2 mb-2">
                              {Object.entries(m.score_breakdown).map(([key, val]) => (
                                <span key={key} className="text-[10px] text-[#A9A49C] bg-[#F3F0EA] px-2 py-0.5 rounded-full">
                                  {key}: {String(val)}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {m.status !== 'pursuing' && (
                              <button
                                onClick={() => updateMatchStatus(m.id, 'pursuing')}
                                className="text-[11px] font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border-0 cursor-pointer hover:bg-green-100 transition-colors"
                              >
                                Pursue
                              </button>
                            )}
                            {m.status !== 'passed' && (
                              <button
                                onClick={() => updateMatchStatus(m.id, 'passed')}
                                className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#F3F0EA] text-[#6E6A63] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors"
                              >
                                Pass
                              </button>
                            )}
                            {m.source_url && (
                              <a
                                href={m.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-medium text-[#D4714E] hover:underline ml-auto"
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
          </div>
        )}
      </div>
    </div>
  );
}
