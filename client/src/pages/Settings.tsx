import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { authHeaders, type User } from '../hooks/useAuth';

interface SettingsProps {
  user: User;
  onLogout: () => void;
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

export default function Settings({ user, onLogout }: SettingsProps) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'account' | 'usage' | 'benchmarks'>('account');

  // Usage state
  const [usageDaily, setUsageDaily] = useState<UsageDay[]>([]);
  const [usageTotals, setUsageTotals] = useState<UsageTotals | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageDays, setUsageDays] = useState(30);

  // Benchmark state
  const [benchmarks, setBenchmarks] = useState<BenchmarkStats[]>([]);
  const [benchLoading, setBenchLoading] = useState(true);

  // Load usage
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

  // Load benchmarks
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
    <div className="min-h-dvh bg-[#FAF9F7]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F7]" style={{ borderBottom: '1px solid #DDD9D1' }}>
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

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-extrabold text-[#1A1A18] m-0 mb-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          Settings
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#EBE7DF] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors ${
                tab === t.id ? 'bg-white text-[#1A1A18] shadow-sm' : 'bg-transparent text-[#6E6A63] hover:text-[#1A1A18]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {tab === 'account' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-base font-semibold text-[#1A1A18] m-0 mb-4">Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Name</label>
                  <p className="text-sm text-[#1A1A18] m-0 px-3 py-2 bg-[#FAF9F7] rounded-lg border border-border">{user.display_name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Email</label>
                  <p className="text-sm text-[#1A1A18] m-0 px-3 py-2 bg-[#FAF9F7] rounded-lg border border-border">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-base font-semibold text-[#1A1A18] m-0 mb-2">Account</h3>
              <p className="text-sm text-[#6E6A63] m-0 mb-4">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-red-600 border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {tab === 'usage' && (
          <div>
            {/* Period selector */}
            <div className="flex gap-2 mb-4">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setUsageDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors ${
                    usageDays === d ? 'bg-[#D4714E] text-white' : 'bg-[#F3F0EA] text-[#6E6A63] hover:bg-[#EBE7DF]'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>

            {/* Totals */}
            {usageLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-border">
                    <div className="h-3 bg-[#EBE7DF] rounded w-2/3 mb-2" />
                    <div className="h-6 bg-[#EBE7DF] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-[11px] text-[#A9A49C] m-0 mb-1">Tokens Used</p>
                  <p className="text-lg font-bold text-[#1A1A18] m-0">
                    {formatNumber((usageTotals?.total_input_tokens || 0) + (usageTotals?.total_output_tokens || 0))}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-[11px] text-[#A9A49C] m-0 mb-1">Tool Calls</p>
                  <p className="text-lg font-bold text-[#1A1A18] m-0">{formatNumber(usageTotals?.total_tool_calls || 0)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-[11px] text-[#A9A49C] m-0 mb-1">Deliverables</p>
                  <p className="text-lg font-bold text-[#D4714E] m-0">{usageTotals?.total_deliverables || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-[11px] text-[#A9A49C] m-0 mb-1">Intel Queries</p>
                  <p className="text-lg font-bold text-[#1A1A18] m-0">{usageTotals?.total_queries || 0}</p>
                </div>
              </div>
            )}

            {/* Daily breakdown */}
            {!usageLoading && usageDaily.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-3">Daily Activity</h3>
                <div className="space-y-2">
                  {usageDaily.map(d => {
                    const totalTokens = (d.input_tokens || 0) + (d.output_tokens || 0);
                    const maxTokens = Math.max(...usageDaily.map(x => (x.input_tokens || 0) + (x.output_tokens || 0)), 1);
                    const pct = Math.round((totalTokens / maxTokens) * 100);
                    return (
                      <div key={d.date} className="flex items-center gap-3">
                        <span className="text-[11px] text-[#6E6A63] w-20 shrink-0">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <div className="flex-1 h-3 bg-[#F3F0EA] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4714E] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-[#A9A49C] w-16 text-right">{formatNumber(totalTokens)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!usageLoading && usageDaily.length === 0 && (
              <div className="text-center py-8 bg-white rounded-2xl border border-border">
                <p className="text-sm text-[#6E6A63] m-0">No usage data for this period.</p>
              </div>
            )}
          </div>
        )}

        {/* Benchmarks Tab */}
        {tab === 'benchmarks' && (
          <div>
            <p className="text-sm text-[#6E6A63] m-0 mb-4">
              Anonymized transaction benchmarks from closed deals on the platform.
            </p>

            {benchLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-border">
                    <div className="h-4 bg-[#EBE7DF] rounded w-1/3 mb-3" />
                    <div className="flex gap-6">
                      <div className="h-8 bg-[#EBE7DF] rounded w-16" />
                      <div className="h-8 bg-[#EBE7DF] rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : benchmarks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">No benchmarks yet</p>
                <p className="text-sm text-[#6E6A63] m-0">Transaction benchmarks will appear here as deals close on the platform.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {benchmarks.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-[#1A1A18] m-0">{b.industry || b.naics_code}</h3>
                      <span className="text-[10px] text-[#A9A49C] bg-[#F3F0EA] px-2 py-0.5 rounded-full">
                        n={b.sample_size}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Avg Multiple</p>
                        <p className="text-lg font-bold text-[#1A1A18] m-0">{b.avg_multiple}x</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Median Multiple</p>
                        <p className="text-lg font-bold text-[#D4714E] m-0">{b.median_multiple}x</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Avg Days to Close</p>
                        <p className="text-lg font-bold text-[#1A1A18] m-0">{b.avg_days_to_close}</p>
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
