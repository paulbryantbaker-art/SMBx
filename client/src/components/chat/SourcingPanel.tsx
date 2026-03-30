import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import PortfolioCanvas from './PortfolioCanvas';

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
  new_matches: number;
  pursuing_count: number;
  total_matches: number;
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

interface Portfolio {
  id: number;
  thesis_id: number;
  name: string;
  pipeline_status: string;
  stage_progress: { stage?: number; pct?: number; message?: string };
  total_candidates: number;
  a_tier_count: number;
  b_tier_count: number;
  c_tier_count: number;
  d_tier_count: number;
  brief_status: string | null;
  // Brief sections (joined from sourcing_briefs)
  market_density: any;
  deal_economics: any;
  acquisition_signals: any;
  competitive_landscape: any;
  key_risks: any;
  recommended_params: any;
  narrative_markdown: string | null;
  brief_generation_time_ms: number | null;
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

  // Pipeline state
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [briefExpanded, setBriefExpanded] = useState<Record<string, boolean>>({});
  const sseRef = useRef<EventSource | null>(null);

  const loadTheses = useCallback(async () => {
    try {
      const res = await fetch('/api/sourcing/theses', { headers: authHeaders() });
      if (res.ok) setTheses(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTheses(); }, [loadTheses]);

  // Load portfolio when thesis is selected
  useEffect(() => {
    if (!selectedThesis) { setPortfolio(null); return; }
    (async () => {
      try {
        const res = await fetch(`/api/sourcing/portfolios?thesisId=${selectedThesis}`, { headers: authHeaders() });
        if (res.ok) {
          const portfolios = await res.json();
          if (portfolios.length > 0) {
            // Load full portfolio with brief data
            const pRes = await fetch(`/api/sourcing/portfolios/${portfolios[0].id}`, { headers: authHeaders() });
            if (pRes.ok) setPortfolio(await pRes.json());
          } else {
            setPortfolio(null);
          }
        }
      } catch { /* ignore */ }
    })();
  }, [selectedThesis]);

  // Load matches when thesis selected and no portfolio
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

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => { sseRef.current?.close(); };
  }, []);

  const startPipeline = async (thesisId: number) => {
    setPipelineRunning(true);
    setPipelineError(null);
    try {
      const res = await fetch(`/api/sourcing/theses/${thesisId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Pipeline failed' }));
        setPipelineError(err.error || 'Pipeline failed');
        setPipelineRunning(false);
        return;
      }
      const result = await res.json();
      if (result.status === 'failed') {
        setPipelineError(result.error || 'Pipeline failed');
        setPipelineRunning(false);
        return;
      }

      // Load full portfolio
      const pRes = await fetch(`/api/sourcing/portfolios/${result.portfolioId}`, { headers: authHeaders() });
      if (pRes.ok) {
        setPortfolio(await pRes.json());
      }

      // Start SSE for background stages
      connectSSE(result.portfolioId);
      setPipelineRunning(false);
    } catch (err: any) {
      setPipelineError(err.message || 'Pipeline failed');
      setPipelineRunning(false);
    }
  };

  const connectSSE = (portfolioId: number) => {
    sseRef.current?.close();
    const token = localStorage.getItem('smbx_token');
    const es = new EventSource(`/api/sourcing/portfolios/${portfolioId}/progress?token=${token}`);
    sseRef.current = es;

    es.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        setPortfolio(prev => prev ? {
          ...prev,
          pipeline_status: data.pipelineStatus,
          stage_progress: data.stageProgress || {},
          total_candidates: data.totalCandidates,
          a_tier_count: data.aTier,
          b_tier_count: data.bTier,
        } : prev);
      } catch { /* ignore */ }
    });

    es.addEventListener('pipeline-complete', () => {
      es.close();
      sseRef.current = null;
    });

    es.onerror = () => {
      es.close();
      sseRef.current = null;
    };
  };

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

  const toggleBriefSection = (key: string) => {
    setBriefExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── Selected thesis view (portfolio or matches) ──────────────────

  const selectedThesisData = theses.find(t => t.id === selectedThesis);

  return (
    <div style={{ padding: isFullscreen ? '24px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 900 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#6E6A63] m-0">
          {theses.length} {theses.length === 1 ? 'thesis' : 'theses'}
        </p>
        <button
          onClick={() => setShowNewThesis(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#A03050] text-white border-0 cursor-pointer hover:bg-[#802040] transition-colors"
        >
          + New Thesis
        </button>
      </div>

      {/* New Thesis Form */}
      {showNewThesis && (
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#A03050] p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0D0D0D] m-0">Create Buy Thesis</h3>
            <button onClick={() => setShowNewThesis(false)} className="w-6 h-6 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center cursor-pointer border-0 bg-transparent">
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
                className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Geography</label>
                <input
                  type="text"
                  value={newThesis.geography}
                  onChange={e => setNewThesis(p => ({ ...p, geography: e.target.value }))}
                  placeholder="Southeast US"
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">NAICS Code</label>
                <input
                  type="text"
                  value={newThesis.naicsCode}
                  onChange={e => setNewThesis(p => ({ ...p, naicsCode: e.target.value }))}
                  placeholder="238220"
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Min Rev ($)</label>
                <input
                  type="number"
                  value={newThesis.minRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, minRevenue: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Max Rev ($)</label>
                <input
                  type="number"
                  value={newThesis.maxRevenue}
                  onChange={e => setNewThesis(p => ({ ...p, maxRevenue: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Min Price ($)</label>
                <input
                  type="number"
                  value={newThesis.minPrice}
                  onChange={e => setNewThesis(p => ({ ...p, minPrice: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Max Price ($)</label>
                <input
                  type="number"
                  value={newThesis.maxPrice}
                  onChange={e => setNewThesis(p => ({ ...p, maxPrice: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm bg-white text-[#0D0D0D] outline-none focus:border-[#A03050]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewThesis(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-transparent text-[#6E6A63] border border-[rgba(0,0,0,0.08)] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createThesis}
              disabled={saving || !newThesis.name.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#A03050] text-white border-0 cursor-pointer hover:bg-[#802040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-[#FAFAFA] rounded-2xl p-4">
              <div className="h-4 bg-[#EBE7DF] rounded w-1/3 mb-2" />
              <div className="flex gap-3">
                <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
                <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && theses.length === 0 && !showNewThesis && (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-base font-semibold text-[#0D0D0D] m-0 mb-1">No buy theses yet</p>
          <p className="text-xs text-[#6E6A63] m-0 mb-3">Define what you're looking for and we'll find matches.</p>
          <button
            onClick={() => setShowNewThesis(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#A03050] text-white border-0 cursor-pointer hover:bg-[#802040] transition-colors"
          >
            Create your first thesis
          </button>
        </div>
      )}

      {/* Theses list + detail */}
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
                    ? 'bg-[#FAFAFA] border-[#A03050]'
                    : 'bg-[#FAFAFA] border-transparent hover:border-[#A03050]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[#F5F5F5] text-[#A9A49C]'
                  }`}>
                    {t.status}
                  </span>
                  {(t.total_matches || 0) > 0 && (
                    <span className="text-[9px] font-bold text-[#A03050] bg-[#A03050]/10 px-1.5 py-0.5 rounded-full">
                      {t.total_matches} match{t.total_matches !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#0D0D0D] m-0 truncate">{t.name}</h3>
                <div className="text-[10px] text-[#6E6A63] mt-0.5">
                  {[t.industry, t.geography, (t.min_revenue || t.max_revenue) ? `${formatCurrency(t.min_revenue)}–${formatCurrency(t.max_revenue)}` : null]
                    .filter(Boolean).join(' · ')}
                </div>
              </button>
            ))}
          </div>

          {/* Selected thesis detail */}
          {selectedThesis && selectedThesisData && (
            <div>
              {/* Pipeline button + intelligence brief */}
              <div className="mb-4">
                {!portfolio && !pipelineRunning && (
                  <button
                    onClick={() => startPipeline(selectedThesis)}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-[#A03050] text-white border-0 cursor-pointer hover:bg-[#802040] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Generate Intelligence Brief
                  </button>
                )}

                {pipelineRunning && (
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-[#A03050]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-[#A03050] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium text-[#0D0D0D]">Analyzing market data...</span>
                    </div>
                    <p className="text-xs text-[#6E6A63] m-0">
                      Fetching Census, SBA, and economic data. This takes 30-60 seconds.
                    </p>
                  </div>
                )}

                {pipelineError && (
                  <div className="bg-red-50 rounded-xl p-3 mb-3 border border-red-200">
                    <p className="text-xs text-red-700 m-0 font-medium">{pipelineError}</p>
                    <button
                      onClick={() => { setPipelineError(null); startPipeline(selectedThesis); }}
                      className="text-xs text-red-600 underline mt-1 cursor-pointer bg-transparent border-0 p-0"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {/* Intelligence Brief */}
              {portfolio && portfolio.brief_status === 'complete' && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0">
                      Acquisition Intelligence Brief
                    </h3>
                    {portfolio.brief_generation_time_ms && (
                      <span className="text-[9px] text-[#A9A49C]">
                        Generated in {(portfolio.brief_generation_time_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  {/* Narrative summary */}
                  {portfolio.narrative_markdown && (
                    <div className="bg-[#FAFAFA] rounded-xl p-3 mb-2 text-xs text-[#0D0D0D] leading-relaxed whitespace-pre-line">
                      {portfolio.narrative_markdown}
                    </div>
                  )}

                  {/* Collapsible sections */}
                  <div className="space-y-1.5">
                    <BriefSection
                      title="Market Density"
                      data={portfolio.market_density}
                      expanded={briefExpanded.market_density}
                      onToggle={() => toggleBriefSection('market_density')}
                    />
                    <BriefSection
                      title="Deal Economics"
                      data={portfolio.deal_economics}
                      expanded={briefExpanded.deal_economics}
                      onToggle={() => toggleBriefSection('deal_economics')}
                    />
                    <BriefSection
                      title="Acquisition Signals"
                      data={portfolio.acquisition_signals}
                      expanded={briefExpanded.acquisition_signals}
                      onToggle={() => toggleBriefSection('acquisition_signals')}
                    />
                    <BriefSection
                      title="Competitive Landscape"
                      data={portfolio.competitive_landscape}
                      expanded={briefExpanded.competitive_landscape}
                      onToggle={() => toggleBriefSection('competitive_landscape')}
                    />
                    <BriefSection
                      title="Key Risks"
                      data={portfolio.key_risks}
                      expanded={briefExpanded.key_risks}
                      onToggle={() => toggleBriefSection('key_risks')}
                      isArray
                    />
                    <BriefSection
                      title="Recommended Search Parameters"
                      data={portfolio.recommended_params}
                      expanded={briefExpanded.recommended_params}
                      onToggle={() => toggleBriefSection('recommended_params')}
                    />
                  </div>

                  {/* Pipeline progress for Stages 2-4 */}
                  {portfolio.pipeline_status !== 'ready' && portfolio.pipeline_status !== 'failed' && portfolio.pipeline_status !== 'initializing' && (
                    <div className="mt-3 bg-[#FAFAFA] rounded-xl p-3 border border-[#A03050]/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-3 h-3 border-2 border-[#A03050] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium text-[#0D0D0D]">
                          {portfolio.stage_progress?.message || 'Processing...'}
                        </span>
                      </div>
                      {portfolio.stage_progress?.pct != null && (
                        <div className="w-full h-1.5 bg-[#EBE7DF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A03050] rounded-full transition-all duration-500"
                            style={{ width: `${portfolio.stage_progress.pct}%` }}
                          />
                        </div>
                      )}
                      {portfolio.total_candidates > 0 && (
                        <p className="text-[10px] text-[#6E6A63] m-0 mt-1">
                          {portfolio.total_candidates} candidates found
                          {portfolio.a_tier_count > 0 && ` · ${portfolio.a_tier_count} A-tier`}
                          {portfolio.b_tier_count > 0 && ` · ${portfolio.b_tier_count} B-tier`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ready state */}
                  {/* Portfolio Canvas — renders when portfolio has candidates */}
                  {portfolio.pipeline_status === 'ready' && portfolio.total_candidates > 0 && (
                    <div className="mt-4 -mx-5 border-t border-[rgba(0,0,0,0.06)]">
                      <PortfolioCanvas
                        portfolioId={portfolio.id}
                        isFullscreen={isFullscreen}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Existing matches section */}
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Matches</h3>

              {matchesLoading && (
                <div className="space-y-2">
                  {[1,2].map(i => (
                    <div key={i} className="animate-pulse bg-[#FAFAFA] rounded-xl p-3">
                      <div className="flex gap-2 mb-1.5">
                        <div className="w-10 h-10 bg-[#EBE7DF] rounded-lg" />
                        <div className="flex-1">
                          <div className="h-3 bg-[#EBE7DF] rounded w-1/2 mb-1.5" />
                          <div className="h-2.5 bg-[#F5F5F5] rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!matchesLoading && matches.length === 0 && (
                <div className="text-center py-6 bg-[#FAFAFA] rounded-xl">
                  <p className="text-sm font-semibold text-[#0D0D0D] m-0 mb-0.5">No matches yet</p>
                  <p className="text-xs text-[#6E6A63] m-0">Matches appear as opportunities are scored.</p>
                </div>
              )}

              {!matchesLoading && matches.length > 0 && (
                <div className="space-y-2">
                  {matches.map(m => (
                    <div key={m.id} className="bg-[#FAFAFA] rounded-xl p-3">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${scoreColor(m.score)}`}>
                          {m.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="text-sm font-semibold text-[#0D0D0D] m-0 truncate">
                              {m.business_name || 'Unnamed'}
                            </h4>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                              m.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              m.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                              m.status === 'pursuing' ? 'bg-green-100 text-green-700' :
                              'bg-[#F5F5F5] text-[#A9A49C]'
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
                                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#6E6A63] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors"
                              >
                                Pass
                              </button>
                            )}
                            {m.source_url && (
                              <a
                                href={m.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-medium text-[#A03050] hover:underline ml-auto"
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

// ─── Brief Section Component ────────────────────────────────────────

function BriefSection({ title, data, expanded, onToggle, isArray }: {
  title: string;
  data: any;
  expanded?: boolean;
  onToggle: () => void;
  isArray?: boolean;
}) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-[rgba(0,0,0,0.06)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFA] hover:bg-[#F5F5F5] cursor-pointer border-0 transition-colors"
      >
        <span className="text-xs font-semibold text-[#0D0D0D]">{title}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A63" strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {expanded && (
        <div className="px-3 py-2.5 bg-white">
          {isArray && Array.isArray(data) ? (
            <div className="space-y-2">
              {data.map((item: any, i: number) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      item.severity === 'high' ? 'bg-red-100 text-red-700' :
                      item.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{item.severity}</span>
                    <span className="font-semibold text-[#0D0D0D]">{item.risk}</span>
                  </div>
                  <p className="text-[#6E6A63] m-0 mb-0.5">{item.description}</p>
                  {item.mitigation && (
                    <p className="text-[#6E6A63] m-0 italic">Mitigation: {item.mitigation}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {renderBriefData(data)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderBriefData(data: any, depth = 0): React.ReactNode[] {
  if (!data || typeof data !== 'object') return [];

  return Object.entries(data).map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      // Array of strings
      if (typeof value[0] === 'string') {
        return (
          <div key={key} className="text-xs mb-1.5">
            <span className="font-medium text-[#0D0D0D]">{label}:</span>
            <ul className="m-0 mt-0.5 pl-4 text-[#6E6A63]">
              {value.map((v: string, i: number) => <li key={i} className="mb-0.5">{v}</li>)}
            </ul>
          </div>
        );
      }
      // Array of objects
      return (
        <div key={key} className="text-xs mb-1.5">
          <span className="font-medium text-[#0D0D0D]">{label}:</span>
          <div className="mt-0.5 pl-2 border-l-2 border-[#EBE7DF]">
            {value.map((item: any, i: number) => (
              <div key={i} className="text-[#6E6A63] mb-1">
                {typeof item === 'object'
                  ? Object.entries(item).map(([k, v]) => (
                      <span key={k} className="mr-2">
                        <span className="font-medium text-[#0D0D0D]">{k.replace(/_/g, ' ')}:</span> {String(v)}
                      </span>
                    ))
                  : String(item)
                }
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="text-xs mb-1.5">
          <span className="font-medium text-[#0D0D0D]">{label}:</span>
          <div className="mt-0.5 pl-2 border-l-2 border-[#EBE7DF]">
            {renderBriefData(value, depth + 1)}
          </div>
        </div>
      );
    }

    if (value === null || value === undefined) return null;

    return (
      <div key={key} className="text-xs flex gap-1">
        <span className="font-medium text-[#0D0D0D] shrink-0">{label}:</span>
        <span className="text-[#6E6A63]">{String(value)}</span>
      </div>
    );
  }).filter(Boolean) as React.ReactNode[];
}
