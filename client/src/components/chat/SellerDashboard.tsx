/**
 * Seller Dashboard — Living Valuation + Value Roadmap Tracker
 * Session 11: Seller OS
 */
import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface ImprovementAction {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  ebitda_impact_cents: number | null;
  valuation_impact_cents: number | null;
  difficulty: string | null;
  timeline_days: number | null;
  status: 'not_started' | 'in_progress' | 'complete';
  completed_at: string | null;
  completion_note: string | null;
}

interface DashboardData {
  hasDeal: boolean;
  deal?: any;
  profile?: any;
  actions?: ImprovementAction[];
  stats?: {
    totalActions: number;
    completedCount: number;
    inProgressCount: number;
    totalValuationImpact: number;
    valuationLow: number | null;
    valuationHigh: number | null;
    valuationUpdatedAt: string | null;
  };
  timeline?: {
    journeyPhase: string;
    estimatedMonths: number;
    exitType: string | null;
  };
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-700 bg-green-50',
  medium: 'text-yellow-700 bg-yellow-50',
  hard: 'text-red-700 bg-red-50',
};

const STATUS_ICONS: Record<string, string> = {
  not_started: '\u25CB',   // ○
  in_progress: '\u25D4',   // ◔
  complete: '\u2713',       // ✓
};


function formatDollars(cents: number): string {
  return '$' + (cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function SellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/seller/dashboard', { headers: authHeaders() });
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const updateAction = async (actionId: number, status: string) => {
    setUpdatingId(actionId);
    try {
      await fetch(`/api/seller/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      await fetchDashboard();
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#A03050] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.hasDeal) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF0EB] flex items-center justify-center text-2xl">
          {'\u{1F4CA}'}
        </div>
        <h2 className="text-lg font-bold text-[#0D0D0D] mb-2">No Seller Profile Yet</h2>
        <p className="text-sm text-[#6E6A63]">Start a conversation with Yulia about selling your business to see your value tracker here.</p>
      </div>
    );
  }

  const { deal, stats, actions = [], timeline } = data;
  const PHASES = [
    { key: 'assessing', label: 'Assessing' },
    { key: 'optimizing', label: 'Optimizing' },
    { key: 'ready', label: 'Market Ready' },
    { key: 'in_market', label: 'In Market' },
    { key: 'under_loi', label: 'Under LOI' },
    { key: 'closed', label: 'Closed' },
  ];
  const currentPhase = timeline?.journeyPhase || 'assessing';
  const currentPhaseIndex = PHASES.findIndex(p => p.key === currentPhase);
  const pendingHardActions = (actions as ImprovementAction[]).filter(
    a => a.status !== 'complete' && a.difficulty === 'hard'
  ).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D0D0D] mb-1">Your Business Value Tracker</h1>
        <p className="text-sm text-[#6E6A63]">
          {deal.business_name || 'Your Business'} &middot; {deal.current_gate || 'Getting Started'}
          {stats?.valuationUpdatedAt && (
            <> &middot; Updated {new Date(stats.valuationUpdatedAt).toLocaleDateString()}</>
          )}
        </p>
      </div>

      {/* Journey Phase Indicator */}
      {timeline && (
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63] mb-4">Your Exit Journey</p>
          <div className="flex items-center gap-0">
            {PHASES.map((phase, i) => {
              const isActive = i === currentPhaseIndex;
              const isPast = i < currentPhaseIndex;
              return (
                <div key={phase.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div
                      className={`absolute top-2.5 right-1/2 w-full h-0.5 ${isPast ? 'bg-[#A03050]' : 'bg-[#EBE7DF]'}`}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  {/* Dot */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center relative z-10 ${
                      isActive ? 'border-[#A03050] bg-[#A03050]'
                      : isPast ? 'border-[#A03050] bg-white'
                      : 'border-[rgba(0,0,0,0.08)] bg-white'
                    }`}
                  >
                    {isPast && <span className="text-[9px] text-[#A03050] font-bold">{'\u2713'}</span>}
                    {isActive && <span className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {/* Label */}
                  <span className={`text-[9px] mt-1.5 text-center leading-tight ${
                    isActive ? 'font-bold text-[#A03050]' : isPast ? 'text-[#6E6A63]' : 'text-[#A9A49C]'
                  }`}>
                    {phase.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Timeline estimate */}
          <div className="mt-4 pt-3 border-t border-[#F5F5F5]">
            <p className="text-sm text-[#3D3B37]">
              Estimated time to market-ready: <span className="font-semibold">~{timeline.estimatedMonths} months</span>
            </p>
            {pendingHardActions > 0 && (
              <p className="text-xs text-[#6E6A63] mt-1">
                Complete your {pendingHardActions} remaining high-impact action{pendingHardActions > 1 ? 's' : ''} to accelerate your timeline.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Valuation Range */}
      {stats?.valuationLow && stats?.valuationHigh && (
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63] mb-3">Estimated Value Range</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold text-[#0D0D0D]">{formatDollars(stats.valuationLow)}</span>
            <span className="text-lg text-[#6E6A63] mb-1">—</span>
            <span className="text-3xl font-bold text-[#A03050]">{formatDollars(stats.valuationHigh)}</span>
          </div>
          {/* Range bar */}
          <div className="h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '65%',
                background: 'linear-gradient(90deg, #A03050 0%, #E8956F 100%)',
              }}
            />
          </div>
          {stats.totalValuationImpact > 0 && (
            <p className="text-xs text-green-600 font-semibold mt-2">
              +{formatDollars(stats.totalValuationImpact)} from completed improvements
            </p>
          )}
        </div>
      )}

      {/* Action Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-2xl font-bold text-[#0D0D0D]">{stats?.totalActions || 0}</p>
          <p className="text-xs text-[#6E6A63]">Total Actions</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-2xl font-bold text-[#A03050]">{stats?.inProgressCount || 0}</p>
          <p className="text-xs text-[#6E6A63]">In Progress</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-2xl font-bold text-green-600">{stats?.completedCount || 0}</p>
          <p className="text-xs text-[#6E6A63]">Completed</p>
        </div>
      </div>

      {/* Improvement Actions */}
      <h2 className="text-lg font-bold text-[#0D0D0D] mb-3">Improvement Roadmap</h2>
      {actions.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-sm text-[#6E6A63]">Improvement actions will appear here after your Value Readiness Report is generated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map(action => (
            <div
              key={action.id}
              className={`bg-white rounded-xl p-4 transition-all ${action.status === 'complete' ? 'opacity-70' : ''}`}
              style={{ border: '1px solid #EBE7DF' }}
            >
              <div className="flex items-start gap-3">
                {/* Status toggle */}
                <button
                  onClick={() => {
                    const next = action.status === 'not_started' ? 'in_progress'
                      : action.status === 'in_progress' ? 'complete' : 'not_started';
                    updateAction(action.id, next);
                  }}
                  disabled={updatingId === action.id}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer bg-transparent transition-colors ${
                    action.status === 'complete' ? 'border-green-500 text-green-500 bg-green-50'
                    : action.status === 'in_progress' ? 'border-[#A03050] text-[#A03050]'
                    : 'border-[rgba(0,0,0,0.08)] text-transparent hover:border-[#A03050]'
                  }`}
                  type="button"
                >
                  <span className="text-xs font-bold">{STATUS_ICONS[action.status]}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold m-0 ${action.status === 'complete' ? 'line-through text-[#A9A49C]' : 'text-[#0D0D0D]'}`}>
                    {action.title}
                  </p>
                  {action.description && (
                    <p className="text-xs text-[#6E6A63] m-0 mt-1">{action.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {action.difficulty && (
                      <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[action.difficulty] || ''}`}>
                        {action.difficulty}
                      </span>
                    )}
                    {action.valuation_impact_cents && (
                      <span className="text-[10px] font-semibold text-green-600">
                        +{formatDollars(action.valuation_impact_cents)} value
                      </span>
                    )}
                    {action.timeline_days && (
                      <span className="text-[10px] text-[#A9A49C]">
                        ~{action.timeline_days}d
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
