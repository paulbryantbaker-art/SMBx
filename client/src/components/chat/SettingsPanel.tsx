import { useState, useEffect, useCallback } from 'react';
import { authHeaders, type User } from '../../hooks/useAuth';

interface SettingsPanelProps {
  user: User;
  onLogout: () => void;
  isFullscreen?: boolean;
}

interface UsageDay {
  date: string;
  input_tokens: number;
  output_tokens: number;
  tool_calls: number;
  deliverables_generated: number;
  intelligence_queries: number;
}

interface UsageTotals {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tool_calls: number;
  total_deliverables: number;
  total_queries: number;
}

interface BenchmarkStats {
  naics_code: string;
  industry: string;
  sample_size: number;
  avg_multiple: number;
  median_multiple: number;
  avg_days_to_close: number;
}

export default function SettingsPanel({ user, onLogout, isFullscreen }: SettingsPanelProps) {
  const [tab, setTab] = useState<'account' | 'usage' | 'benchmarks'>('account');

  const [usageDaily, setUsageDaily] = useState<UsageDay[]>([]);
  const [usageTotals, setUsageTotals] = useState<UsageTotals | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageDays, setUsageDays] = useState(30);

  const [benchmarks, setBenchmarks] = useState<BenchmarkStats[]>([]);
  const [benchLoading, setBenchLoading] = useState(true);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await fetch(`/api/flywheel/usage?days=${usageDays}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsageDaily(data.daily || []);
        setUsageTotals(data.totals || null);
      }
    } catch { /* ignore */ }
    finally { setUsageLoading(false); }
  }, [usageDays]);

  useEffect(() => { loadUsage(); }, [loadUsage]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/flywheel/benchmarks/stats', { headers: authHeaders() });
        if (res.ok) setBenchmarks(await res.json());
      } catch { /* ignore */ }
      finally { setBenchLoading(false); }
    })();
  }, []);

  function formatNumber(val: number | null): string {
    if (!val) return '0';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  }

  const TABS = [
    { id: 'account' as const, label: 'Account' },
    { id: 'usage' as const, label: 'Usage' },
    { id: 'benchmarks' as const, label: 'Benchmarks' },
  ];

  return (
    <div style={{ padding: isFullscreen ? '24px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 900 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#EBE7DF] rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors ${
              tab === t.id ? 'bg-white text-[#1A1A18] shadow-sm' : 'bg-transparent text-[#6E6A63] hover:text-[#1A1A18]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {tab === 'account' && (
        <div className="space-y-3">
          <div className="bg-[#FAF9F7] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-3">Profile</h3>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Name</label>
                <p className="text-sm text-[#1A1A18] m-0 px-3 py-1.5 bg-white rounded-lg border border-[#DDD9D1]">{user.display_name || '—'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Email</label>
                <p className="text-sm text-[#1A1A18] m-0 px-3 py-1.5 bg-white rounded-lg border border-[#DDD9D1]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF9F7] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-1.5">Account</h3>
            <p className="text-xs text-[#6E6A63] m-0 mb-3">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-transparent text-red-600 border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {tab === 'usage' && (
        <div>
          <div className="flex gap-1.5 mb-3">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setUsageDays(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors ${
                  usageDays === d ? 'bg-[#D4714E] text-white' : 'bg-[#F3F0EA] text-[#6E6A63] hover:bg-[#EBE7DF]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {usageLoading ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-[#FAF9F7] rounded-xl p-3">
                  <div className="h-2.5 bg-[#EBE7DF] rounded w-2/3 mb-1.5" />
                  <div className="h-5 bg-[#EBE7DF] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#FAF9F7] rounded-xl p-3">
                <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Tokens</p>
                <p className="text-base font-bold text-[#1A1A18] m-0">
                  {formatNumber((usageTotals?.total_input_tokens || 0) + (usageTotals?.total_output_tokens || 0))}
                </p>
              </div>
              <div className="bg-[#FAF9F7] rounded-xl p-3">
                <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Tool Calls</p>
                <p className="text-base font-bold text-[#1A1A18] m-0">{formatNumber(usageTotals?.total_tool_calls || 0)}</p>
              </div>
              <div className="bg-[#FAF9F7] rounded-xl p-3">
                <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Deliverables</p>
                <p className="text-base font-bold text-[#D4714E] m-0">{usageTotals?.total_deliverables || 0}</p>
              </div>
              <div className="bg-[#FAF9F7] rounded-xl p-3">
                <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Queries</p>
                <p className="text-base font-bold text-[#1A1A18] m-0">{usageTotals?.total_queries || 0}</p>
              </div>
            </div>
          )}

          {!usageLoading && usageDaily.length > 0 && (
            <div className="bg-[#FAF9F7] rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-[#1A1A18] m-0 mb-2">Daily Activity</h3>
              <div className="space-y-1.5">
                {usageDaily.map(d => {
                  const totalTokens = (d.input_tokens || 0) + (d.output_tokens || 0);
                  const maxTokens = Math.max(...usageDaily.map(x => (x.input_tokens || 0) + (x.output_tokens || 0)), 1);
                  const pct = Math.round((totalTokens / maxTokens) * 100);
                  return (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6E6A63] w-16 shrink-0">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4714E] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[#A9A49C] w-12 text-right">{formatNumber(totalTokens)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!usageLoading && usageDaily.length === 0 && (
            <div className="text-center py-6 bg-[#FAF9F7] rounded-xl">
              <p className="text-xs text-[#6E6A63] m-0">No usage data for this period.</p>
            </div>
          )}
        </div>
      )}

      {/* Benchmarks Tab */}
      {tab === 'benchmarks' && (
        <div>
          <p className="text-xs text-[#6E6A63] m-0 mb-3">Anonymized transaction benchmarks from closed deals.</p>

          {benchLoading ? (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="animate-pulse bg-[#FAF9F7] rounded-2xl p-4">
                  <div className="h-3 bg-[#EBE7DF] rounded w-1/3 mb-2" />
                  <div className="flex gap-4">
                    <div className="h-6 bg-[#EBE7DF] rounded w-14" />
                    <div className="h-6 bg-[#EBE7DF] rounded w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : benchmarks.length === 0 ? (
            <div className="text-center py-8 bg-[#FAF9F7] rounded-xl">
              <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-0.5">No benchmarks yet</p>
              <p className="text-xs text-[#6E6A63] m-0">Benchmarks appear as deals close.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {benchmarks.map((b, i) => (
                <div key={i} className="bg-[#FAF9F7] rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <h3 className="text-sm font-semibold text-[#1A1A18] m-0">{b.industry || b.naics_code}</h3>
                    <span className="text-[9px] text-[#A9A49C] bg-white px-1.5 py-0.5 rounded-full">n={b.sample_size}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Avg</p>
                      <p className="text-base font-bold text-[#1A1A18] m-0">{b.avg_multiple}x</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Median</p>
                      <p className="text-base font-bold text-[#D4714E] m-0">{b.median_multiple}x</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Days</p>
                      <p className="text-base font-bold text-[#1A1A18] m-0">{b.avg_days_to_close}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
