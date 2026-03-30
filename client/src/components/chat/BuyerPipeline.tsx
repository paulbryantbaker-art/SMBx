/**
 * Buyer Pipeline View — Thesis + Internal Matches + Discovery Targets
 * Session 12: Buyer OS
 */
import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface ConvictionCheck {
  checks: Array<{ label: string; pass: boolean | null; reason: string | null }>;
  verdict: 'pursue' | 'pass' | 'investigate';
}

interface Target {
  id: number;
  company_name: string;
  industry: string | null;
  location_state: string | null;
  revenue_reported: number | null;
  sde_reported: number | null;
  revenue_estimated_low: number | null;
  revenue_estimated_high: number | null;
  thesis_fit_score: number | null;
  sale_readiness_score: number | null;
  overall_score: number | null;
  buyer_status: 'flagged' | 'reviewing' | 'pursuing' | 'passed';
  source: string;
  source_url: string | null;
  sale_readiness_signals: any[] | null;
  conviction_check: ConvictionCheck | null;
}

interface PipelineData {
  hasThesis: boolean;
  thesis?: any;
  targets?: Target[];
  matchCount?: number;
  stats?: { pursuing: number; reviewing: number; flagged: number };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pursuing: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Pursuing' },
  reviewing: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Reviewing' },
  flagged: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: 'New' },
};

const READINESS_TIERS: Record<string, { color: string; label: string }> = {
  hot: { color: 'text-red-600', label: 'Hot' },
  warm: { color: 'text-yellow-600', label: 'Warm' },
  cold: { color: 'text-gray-500', label: 'Cold' },
};

function getReadinessTier(score: number | null): string {
  if (!score) return 'unknown';
  if (score >= 70) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 25) return 'cold';
  return 'unknown';
}

function formatDollars(cents: number | null): string {
  if (!cents) return 'N/A';
  return '$' + (cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function BuyerPipeline() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch('/api/buyer/pipeline', { headers: authHeaders() });
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  const updateTarget = async (targetId: number, status: string) => {
    setUpdatingId(targetId);
    try {
      await fetch(`/api/buyer/targets/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ buyer_status: status }),
      });
      await fetchPipeline();
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C25572] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.hasThesis) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF0EB] flex items-center justify-center text-2xl">
          {'\u{1F3AF}'}
        </div>
        <h2 className="text-lg font-bold text-[#0D0D0D] mb-2">No Acquisition Thesis Yet</h2>
        <p className="text-sm text-[#6E6A63]">Tell Yulia what you're looking to buy and she'll build your thesis and start matching opportunities.</p>
      </div>
    );
  }

  const { thesis, targets = [], stats } = data;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Thesis Header */}
      <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #EBE7DF' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0D0D0D] m-0 mb-1">Your Acquisition Thesis</h1>
            <p className="text-sm text-[#6E6A63] m-0">
              {thesis.industries?.length ? (Array.isArray(thesis.industries) ? thesis.industries.join(', ') : thesis.industries) : 'Any industry'}
              {' \u00B7 '}
              {thesis.geographies?.length ? (Array.isArray(thesis.geographies) ? thesis.geographies.join(', ') : thesis.geographies) : 'Any location'}
              {thesis.revenue_min || thesis.revenue_max ? ` \u00B7 ${formatDollars(thesis.revenue_min)} - ${formatDollars(thesis.revenue_max)}` : ''}
            </p>
          </div>
          <span className="text-sm font-bold text-[#C25572]">{targets.length} matches</span>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
            <p className="text-xl font-bold text-green-700">{stats.pursuing}</p>
            <p className="text-xs text-green-600">Pursuing</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <p className="text-xl font-bold text-blue-700">{stats.reviewing}</p>
            <p className="text-xs text-blue-600">Reviewing</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
            <p className="text-xl font-bold text-yellow-700">{stats.flagged}</p>
            <p className="text-xs text-yellow-600">New</p>
          </div>
        </div>
      )}

      {/* Targets */}
      <h2 className="text-lg font-bold text-[#0D0D0D] mb-3">Opportunities</h2>
      {targets.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-sm text-[#6E6A63]">No matches yet. Yulia will scan for opportunities matching your thesis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {targets.map(target => {
            const statusInfo = STATUS_COLORS[target.buyer_status] || STATUS_COLORS.flagged;
            const tier = getReadinessTier(target.sale_readiness_score);
            const tierInfo = READINESS_TIERS[tier];

            return (
              <div key={target.id} className="bg-white rounded-xl p-5" style={{ border: '1px solid #EBE7DF' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#0D0D0D] m-0 truncate">{target.company_name}</h3>
                      <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                      {tierInfo && (
                        <span className={`text-[9px] font-bold ${tierInfo.color}`}>
                          {tier === 'hot' ? '\u{1F525}' : ''} {tierInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6A63] m-0">
                      {target.industry || 'Unknown'} &middot; {target.location_state || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#3D3B37]">
                      <span>Revenue: {formatDollars(target.revenue_reported || target.revenue_estimated_low)}</span>
                      {target.sde_reported && <span>SDE: {formatDollars(target.sde_reported)}</span>}
                      {target.thesis_fit_score !== null && (
                        <span className="font-semibold text-[#C25572]">Score: {target.thesis_fit_score}/100</span>
                      )}
                    </div>
                    {/* Conviction Check */}
                    {target.conviction_check && (
                      <div className="mt-2 pt-2 border-t border-[#F5F5F5]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6A63] mb-1">Quick Conviction</p>
                        <div className="space-y-0.5">
                          {target.conviction_check.checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span className={check.pass === true ? 'text-green-600' : check.pass === false ? 'text-red-500' : 'text-yellow-500'}>
                                {check.pass === true ? '+' : check.pass === false ? '\u2013' : '?'}
                              </span>
                              <span className="text-[#3D3B37]">
                                {check.label}{check.reason ? ` \u2014 ${check.reason}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className={`text-[10px] font-semibold mt-1 ${
                          target.conviction_check.verdict === 'pursue' ? 'text-green-600'
                          : target.conviction_check.verdict === 'investigate' ? 'text-yellow-600'
                          : 'text-red-500'
                        }`}>
                          {target.conviction_check.verdict === 'pursue' ? 'Worth a Screening Memo'
                           : target.conviction_check.verdict === 'investigate' ? 'One concern to resolve first'
                           : 'Likely not a fit'}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#A9A49C]">
                      <span>Source: {target.source}</span>
                      {target.source_url && (
                        <a href={target.source_url} target="_blank" rel="noopener" className="text-[#C25572] hover:underline">View listing</a>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {target.buyer_status !== 'pursuing' && (
                      <button
                        onClick={() => updateTarget(target.id, 'pursuing')}
                        disabled={updatingId === target.id}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#C25572] text-white border-0 cursor-pointer hover:bg-[#9E4860] transition-colors disabled:opacity-50"
                        type="button"
                      >
                        Pursue
                      </button>
                    )}
                    {target.buyer_status !== 'reviewing' && target.buyer_status !== 'pursuing' && (
                      <button
                        onClick={() => updateTarget(target.id, 'reviewing')}
                        disabled={updatingId === target.id}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#F5F5F5] text-[#3D3B37] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors disabled:opacity-50"
                        type="button"
                      >
                        Review
                      </button>
                    )}
                    <button
                      onClick={() => updateTarget(target.id, 'passed')}
                      disabled={updatingId === target.id}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-transparent text-[#A9A49C] border border-[#EBE7DF] cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                      type="button"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
