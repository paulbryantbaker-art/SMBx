import React, { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import { usePipelineProgress } from '../../hooks/usePipelineProgress';

// ─── Types ──────────────────────────────────────────────────────────

interface Candidate {
  id: number;
  name: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website_url: string | null;
  rating: number | null;
  review_count: number | null;
  year_founded: number | null;
  team_size_estimate: string | null;
  services: string[] | null;
  succession_signals: string[] | null;
  recurring_revenue_signals: string[] | null;
  owner_dependency_signals: string[] | null;
  estimated_revenue_low_cents: number | null;
  estimated_revenue_high_cents: number | null;
  growth_indicators: string[] | null;
  risk_factors: string[] | null;
  ai_summary: string | null;
  ai_score_summary: string | null;
  enrichment_tier: number;
  total_score: number;
  tier: string | null;
  score_size: number;
  score_geography: number;
  score_industry: number;
  score_acquisition_signals: number;
  score_quality: number;
  score_risk: number;
  score_flags: string[] | null;
  pipeline_status: string;
  user_notes: string | null;
  sba_match: boolean;
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
  narrative_markdown: string | null;
  market_density: any;
  deal_economics: any;
  key_risks: any;
  recommended_params: any;
}

interface Props {
  portfolioId: number;
  isFullscreen?: boolean;
  onClose?: () => void;
}

// ─── Utilities ──────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  B: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  D: { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  reviewing: { label: 'Reviewing', color: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Contacted', color: 'bg-purple-100 text-purple-700' },
  responded: { label: 'Responded', color: 'bg-indigo-100 text-indigo-700' },
  meeting: { label: 'Meeting', color: 'bg-cyan-100 text-cyan-700' },
  pursuing: { label: 'Pursuing', color: 'bg-emerald-100 text-emerald-700' },
  passed: { label: 'Passed', color: 'bg-zinc-100 text-zinc-500' },
  archived: { label: 'Archived', color: 'bg-zinc-100 text-zinc-400' },
};

function formatRevenue(lowCents: number | null, highCents: number | null): string {
  if (!lowCents && !highCents) return '—';
  const fmt = (c: number) => {
    const d = c / 100;
    if (d >= 1000000) return `$${(d / 1000000).toFixed(1)}M`;
    if (d >= 1000) return `$${(d / 1000).toFixed(0)}K`;
    return `$${d.toLocaleString()}`;
  };
  if (lowCents && highCents) return `${fmt(lowCents)}–${fmt(highCents)}`;
  if (lowCents) return `${fmt(lowCents)}+`;
  return `up to ${fmt(highCents!)}`;
}

// ─── Component ──────────────────────────────────────────────────────

export default function PortfolioCanvas({ portfolioId, isFullscreen, onClose }: Props) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({ A: true, pursuing: true });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [enriching, setEnriching] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // SSE progress for active pipelines
  const isActive = portfolio && !['ready', 'failed'].includes(portfolio.pipeline_status);
  const { progress } = usePipelineProgress(isActive ? portfolioId : null);

  // Update portfolio from SSE progress
  useEffect(() => {
    if (progress && portfolio) {
      setPortfolio(prev => prev ? {
        ...prev,
        pipeline_status: progress.pipelineStatus,
        stage_progress: progress.stageProgress,
        total_candidates: progress.totalCandidates,
        a_tier_count: progress.aTier,
        b_tier_count: progress.bTier,
      } : prev);
    }
  }, [progress]);

  // Load portfolio data
  const loadPortfolio = useCallback(async () => {
    try {
      const res = await fetch(`/api/sourcing/portfolios/${portfolioId}`, { headers: authHeaders() });
      if (res.ok) setPortfolio(await res.json());
    } catch { /* ignore */ }
  }, [portfolioId]);

  const loadCandidates = useCallback(async () => {
    try {
      const url = statusFilter
        ? `/api/sourcing/portfolios/${portfolioId}/candidates?status=${statusFilter}&limit=100`
        : `/api/sourcing/portfolios/${portfolioId}/candidates?limit=100`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch { /* ignore */ }
  }, [portfolioId, statusFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPortfolio(), loadCandidates()]).finally(() => setLoading(false));
  }, [loadPortfolio, loadCandidates]);

  // Reload candidates when pipeline reaches ready
  useEffect(() => {
    if (progress?.pipelineStatus === 'ready') {
      loadPortfolio();
      loadCandidates();
    }
  }, [progress?.pipelineStatus]);

  const updateCandidateStatus = async (candidateId: number, status: string) => {
    try {
      const res = await fetch(`/api/sourcing/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, ...updated } : c));
        if (selectedCandidate?.id === candidateId) {
          setSelectedCandidate(prev => prev ? { ...prev, ...updated } : prev);
        }
      }
    } catch { /* ignore */ }
  };

  const saveNotes = async (candidateId: number) => {
    try {
      await fetch(`/api/sourcing/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ notes: noteDraft }),
      });
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, user_notes: noteDraft } : c));
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, user_notes: noteDraft } : prev);
      }
    } catch { /* ignore */ }
  };

  const enrichCandidate = async (candidateId: number) => {
    setEnriching(candidateId);
    try {
      const res = await fetch(`/api/sourcing/candidates/${candidateId}/enrich`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, ...updated } : c));
        if (selectedCandidate?.id === candidateId) {
          setSelectedCandidate(prev => prev ? { ...prev, ...updated } : prev);
        }
      }
    } catch { /* ignore */ }
    finally { setEnriching(null); }
  };

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  // Group candidates by tier
  const pursuingCandidates = candidates.filter(c => c.pipeline_status === 'pursuing');
  const tiers = ['A', 'B', 'C', 'D'] as const;
  const tierGroups = Object.fromEntries(
    tiers.map(t => [t, candidates.filter(c => c.tier === t && c.pipeline_status !== 'pursuing')])
  );

  const pad = isFullscreen ? 'px-10 py-6' : 'p-5';
  const maxW = isFullscreen ? 'max-w-[960px] mx-auto' : '';

  // ─── Loading State ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={pad}>
        <div className={maxW}>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-[#FAFAFA] rounded-xl p-4">
                <div className="h-4 bg-[#EBE7DF] rounded w-1/3 mb-2" />
                <div className="h-3 bg-[#F5F5F5] rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className={pad}>
        <div className={`${maxW} text-center py-12`}>
          <p className="text-sm text-[#6E6A63]">Portfolio not found.</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────

  return (
    <div className={pad}>
      <div className={maxW}>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-[#0D0D0D] m-0 tracking-tight" style={{ fontFamily: 'var(--headline, Sora, system-ui)' }}>
              {portfolio.name}
            </h2>
            <PipelineStatusBadge status={portfolio.pipeline_status} />
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 text-xs text-[#6E6A63] mt-2">
            <StatChip label="Total" value={portfolio.total_candidates} />
            <StatChip label="A-tier" value={portfolio.a_tier_count} color="emerald" />
            <StatChip label="B-tier" value={portfolio.b_tier_count} color="blue" />
            <StatChip label="Pursuing" value={pursuingCandidates.length} color="green" />
          </div>
        </div>

        {/* Pipeline progress (active only) */}
        {isActive && (
          <div className="mb-4 bg-[#FAFAFA] rounded-xl p-3 border border-[#D44A78]/10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-3 h-3 border-2 border-[#D44A78] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-[#0D0D0D]">
                {portfolio.stage_progress?.message || 'Processing...'}
              </span>
            </div>
            {portfolio.stage_progress?.pct != null && (
              <div className="w-full h-1.5 bg-[#EBE7DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D44A78] rounded-full transition-all duration-700"
                  style={{ width: `${portfolio.stage_progress.pct}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Status filter pills */}
        {portfolio.pipeline_status === 'ready' && candidates.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
            <FilterPill label="All" active={!statusFilter} onClick={() => setStatusFilter(null)} />
            <FilterPill label="New" active={statusFilter === 'new'} onClick={() => setStatusFilter('new')} />
            <FilterPill label="Reviewing" active={statusFilter === 'reviewing'} onClick={() => setStatusFilter('reviewing')} />
            <FilterPill label="Pursuing" active={statusFilter === 'pursuing'} onClick={() => setStatusFilter('pursuing')} />
            <FilterPill label="Passed" active={statusFilter === 'passed'} onClick={() => setStatusFilter('passed')} />
          </div>
        )}

        {/* Pursuing section (pinned to top) */}
        {!statusFilter && pursuingCandidates.length > 0 && (
          <TierSection
            tier="pursuing"
            label="Pursuing"
            count={pursuingCandidates.length}
            candidates={pursuingCandidates}
            expanded={expandedTiers.pursuing !== false}
            onToggle={() => toggleTier('pursuing')}
            onSelect={(c) => { setSelectedCandidate(c); setNoteDraft(c.user_notes || ''); }}
            onStatusChange={updateCandidateStatus}
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' }}
          />
        )}

        {/* Tier sections */}
        {!statusFilter && tiers.map(t => {
          const group = tierGroups[t];
          if (group.length === 0) return null;
          return (
            <TierSection
              key={t}
              tier={t}
              label={`${t}-Tier`}
              count={group.length}
              candidates={group}
              expanded={expandedTiers[t] || false}
              onToggle={() => toggleTier(t)}
              onSelect={(c) => { setSelectedCandidate(c); setNoteDraft(c.user_notes || ''); }}
              onStatusChange={updateCandidateStatus}
              color={TIER_COLORS[t]}
            />
          );
        })}

        {/* Filtered view (when status filter active) */}
        {statusFilter && (
          <div className="space-y-2">
            {candidates.map(c => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onSelect={() => { setSelectedCandidate(c); setNoteDraft(c.user_notes || ''); }}
                onStatusChange={updateCandidateStatus}
              />
            ))}
            {candidates.length === 0 && (
              <div className="text-center py-8 bg-[#FAFAFA] rounded-xl">
                <p className="text-sm text-[#6E6A63] m-0">No candidates with status "{statusFilter}"</p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && candidates.length === 0 && portfolio.pipeline_status === 'ready' && !statusFilter && (
          <div className="text-center py-10 bg-[#FAFAFA] rounded-xl">
            <p className="text-sm font-medium text-[#0D0D0D] m-0 mb-1">No candidates found</p>
            <p className="text-xs text-[#6E6A63] m-0">Try broadening your thesis geography or industry.</p>
          </div>
        )}

        {/* Detail slide-out */}
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onStatusChange={updateCandidateStatus}
            onEnrich={enrichCandidate}
            enriching={enriching === selectedCandidate.id}
            noteDraft={noteDraft}
            onNoteChange={setNoteDraft}
            onNoteSave={() => saveNotes(selectedCandidate.id)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function PipelineStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; cls: string }> = {
    initializing: { label: 'Initializing', cls: 'bg-zinc-100 text-zinc-600' },
    brief_generating: { label: 'Analyzing', cls: 'bg-amber-100 text-amber-700' },
    expanding: { label: 'Searching', cls: 'bg-blue-100 text-blue-700' },
    enriching: { label: 'Enriching', cls: 'bg-purple-100 text-purple-700' },
    scoring: { label: 'Scoring', cls: 'bg-indigo-100 text-indigo-700' },
    ready: { label: 'Ready', cls: 'bg-emerald-100 text-emerald-700' },
    failed: { label: 'Failed', cls: 'bg-red-100 text-red-700' },
    stale: { label: 'Needs Refresh', cls: 'bg-amber-100 text-amber-700' },
  };
  const cfg = configs[status] || { label: status, cls: 'bg-zinc-100 text-zinc-600' };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color?: string }) {
  if (value === 0) return null;
  const colorCls = color ? `text-${color}-700` : 'text-[#0D0D0D]';
  return (
    <span className="flex items-center gap-1">
      <span className={`font-semibold tabular-nums ${colorCls}`}>{value}</span>
      <span>{label}</span>
    </span>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
        active
          ? 'bg-[#D44A78] text-white border-[#D44A78]'
          : 'bg-white text-[#6E6A63] border-[rgba(0,0,0,0.08)] hover:border-[#D44A78]'
      }`}
    >
      {label}
    </button>
  );
}

function TierSection({ tier, label, count, candidates, expanded, onToggle, onSelect, onStatusChange, color }: {
  tier: string;
  label: string;
  count: number;
  candidates: Candidate[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (c: Candidate) => void;
  onStatusChange: (id: number, status: string) => void;
  color: { bg: string; text: string; border: string };
}) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${color.bg} border ${color.border} cursor-pointer transition-colors hover:opacity-90`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${color.text}`}>{label}</span>
          <span className={`text-[10px] font-medium ${color.text} opacity-70`}>({count})</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`${color.text} transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {candidates.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onSelect={() => onSelect(c)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate: c, onSelect, onStatusChange }: {
  candidate: Candidate;
  onSelect: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const statusCfg = STATUS_LABELS[c.pipeline_status] || STATUS_LABELS.new;

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl p-3 border border-[rgba(0,0,0,0.06)] hover:border-[#D44A78]/30 cursor-pointer transition-all"
    >
      <div className="flex items-start gap-2.5">
        {/* Score badge */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          c.total_score >= 75 ? 'bg-emerald-50 text-emerald-700' :
          c.total_score >= 55 ? 'bg-blue-50 text-blue-700' :
          c.total_score >= 35 ? 'bg-amber-50 text-amber-700' :
          'bg-zinc-100 text-zinc-500'
        }`}>
          {c.total_score}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-sm font-semibold text-[#0D0D0D] m-0 truncate">
              {c.name || 'Unknown Business'}
            </h4>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[10px] text-[#6E6A63] mb-1 flex-wrap">
            {c.city && c.state && <span>{c.city}, {c.state}</span>}
            {c.rating != null && (
              <span className="flex items-center gap-0.5">
                <span className="text-amber-500">&#9733;</span>
                {Number(c.rating).toFixed(1)}
                {c.review_count != null && <span className="text-[#A9A49C]">({c.review_count})</span>}
              </span>
            )}
            {c.year_founded && <span>Est. {c.year_founded}</span>}
            {c.estimated_revenue_low_cents && (
              <span className="font-medium text-[#0D0D0D]">
                {formatRevenue(c.estimated_revenue_low_cents, c.estimated_revenue_high_cents)}
              </span>
            )}
          </div>

          {/* Signal chips */}
          <div className="flex items-center gap-1 flex-wrap">
            {c.sba_match && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700">SBA History</span>
            )}
            {c.succession_signals && c.succession_signals.length > 0 && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">Exit Signals</span>
            )}
            {c.recurring_revenue_signals && c.recurring_revenue_signals.length > 0 && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Recurring Rev</span>
            )}
            {c.enrichment_tier < 3 && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">Basic data</span>
            )}
          </div>

          {/* AI summary */}
          {c.ai_score_summary && (
            <p className="text-[10px] text-[#6E6A63] m-0 mt-1 line-clamp-2 leading-relaxed">
              {c.ai_score_summary}
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {c.pipeline_status !== 'pursuing' && (
            <button
              onClick={() => onStatusChange(c.id, 'pursuing')}
              className="text-[9px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border-0 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              Pursue
            </button>
          )}
          {c.pipeline_status !== 'passed' && c.pipeline_status !== 'pursuing' && (
            <button
              onClick={() => onStatusChange(c.id, 'passed')}
              className="text-[9px] font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-500 border-0 cursor-pointer hover:bg-zinc-200 transition-colors"
            >
              Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Candidate Detail Panel ─────────────────────────────────────────

function CandidateDetail({ candidate: c, onClose, onStatusChange, onEnrich, enriching, noteDraft, onNoteChange, onNoteSave }: {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onEnrich: (id: number) => void;
  enriching: boolean;
  noteDraft: string;
  onNoteChange: (v: string) => void;
  onNoteSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl sm:max-w-md max-sm:max-w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.06)] px-5 py-4 z-10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-[#0D0D0D] m-0">{c.name || 'Unknown'}</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center cursor-pointer border-0 bg-transparent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E6A63" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="text-xs text-[#6E6A63]">
            {[c.city, c.state].filter(Boolean).join(', ')}
            {c.phone && <span className="ml-2">{c.phone}</span>}
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Score breakdown */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Score Breakdown</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                c.total_score >= 75 ? 'bg-emerald-50 text-emerald-700' :
                c.total_score >= 55 ? 'bg-blue-50 text-blue-700' :
                c.total_score >= 35 ? 'bg-amber-50 text-amber-700' :
                'bg-zinc-100 text-zinc-500'
              }`}>
                {c.total_score}
              </div>
              <div className="flex-1 text-xs text-[#6E6A63]">
                <span className="font-semibold text-[#0D0D0D]">{c.tier}-Tier</span> candidate
                {c.ai_summary && <p className="m-0 mt-1 leading-relaxed">{c.ai_summary}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="Size Match" value={c.score_size} max={20} />
              <ScoreBar label="Geography" value={c.score_geography} max={15} />
              <ScoreBar label="Industry" value={c.score_industry} max={15} />
              <ScoreBar label="Acq. Signals" value={c.score_acquisition_signals} max={20} />
              <ScoreBar label="Quality" value={c.score_quality} max={15} />
              <ScoreBar label="Risk (inv.)" value={c.score_risk} max={15} />
            </div>
          </div>

          {/* Business details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Business Details</h4>
            <div className="space-y-1.5 text-xs">
              {c.website_url && (
                <DetailRow label="Website">
                  <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-[#D44A78] hover:underline truncate">
                    {c.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </a>
                </DetailRow>
              )}
              {c.rating != null && <DetailRow label="Rating">{Number(c.rating).toFixed(1)}/5 ({c.review_count || 0} reviews)</DetailRow>}
              {c.year_founded && <DetailRow label="Founded">{c.year_founded} ({new Date().getFullYear() - c.year_founded} years)</DetailRow>}
              {c.team_size_estimate && <DetailRow label="Team Size">{c.team_size_estimate}</DetailRow>}
              {c.estimated_revenue_low_cents && (
                <DetailRow label="Est. Revenue">{formatRevenue(c.estimated_revenue_low_cents, c.estimated_revenue_high_cents)}</DetailRow>
              )}
              {c.services && c.services.length > 0 && (
                <DetailRow label="Services">{c.services.join(', ')}</DetailRow>
              )}
            </div>
          </div>

          {/* Signals */}
          {(c.growth_indicators?.length || c.risk_factors?.length || c.succession_signals?.length) && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Signals</h4>
              {c.growth_indicators && c.growth_indicators.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-medium text-emerald-700">Growth:</span>
                  <ul className="m-0 mt-0.5 pl-4 text-[10px] text-[#6E6A63]">
                    {c.growth_indicators.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}
              {c.risk_factors && c.risk_factors.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-medium text-red-700">Risks:</span>
                  <ul className="m-0 mt-0.5 pl-4 text-[10px] text-[#6E6A63]">
                    {c.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {c.succession_signals && c.succession_signals.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-purple-700">Exit signals:</span>
                  <ul className="m-0 mt-0.5 pl-4 text-[10px] text-[#6E6A63]">
                    {c.succession_signals.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Enrich button (for Tier 1-2 candidates) */}
          {c.enrichment_tier < 3 && (
            <button
              onClick={() => onEnrich(c.id)}
              disabled={enriching}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#D44A78] text-white border-0 cursor-pointer hover:bg-[#B03860] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enriching ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing website...
                </>
              ) : (
                'Get More Details'
              )}
            </button>
          )}
          {c.enrichment_tier === 3 && (
            <button
              onClick={() => onEnrich(c.id)}
              disabled={enriching}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#0D0D0D] text-white border-0 cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enriching ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running deep analysis...
                </>
              ) : (
                'Run Deep Analysis'
              )}
            </button>
          )}

          {/* Status actions */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Status</h4>
            <div className="flex flex-wrap gap-1.5">
              {(['new', 'reviewing', 'contacted', 'responded', 'meeting', 'pursuing', 'passed'] as const).map(s => {
                const cfg = STATUS_LABELS[s];
                const isActive = c.pipeline_status === s;
                return (
                  <button
                    key={s}
                    onClick={() => !isActive && onStatusChange(c.id, s)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? `${cfg.color} border-current`
                        : 'bg-white text-[#6E6A63] border-[rgba(0,0,0,0.08)] hover:border-[#D44A78]'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] m-0 mb-2">Notes</h4>
            <textarea
              value={noteDraft}
              onChange={e => onNoteChange(e.target.value)}
              placeholder="Add notes about this candidate..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] text-xs bg-white text-[#0D0D0D] outline-none focus:border-[#D44A78] resize-none"
            />
            {noteDraft !== (c.user_notes || '') && (
              <button
                onClick={onNoteSave}
                className="mt-1.5 px-3 py-1 rounded-lg text-[10px] font-medium bg-[#D44A78] text-white border-0 cursor-pointer hover:bg-[#B03860] transition-colors"
              >
                Save Notes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#6E6A63] w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#EBE7DF] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct >= 30 ? 'bg-amber-500' : 'bg-zinc-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#0D0D0D] font-medium w-8 text-right tabular-nums">{value}/{max}</span>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#6E6A63] shrink-0 w-20">{label}</span>
      <span className="text-[#0D0D0D] min-w-0">{children}</span>
    </div>
  );
}
