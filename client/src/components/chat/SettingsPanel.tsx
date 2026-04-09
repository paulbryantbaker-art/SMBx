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

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  trial_end: string | null;
}

function formatNumber(val: number | null): string {
  if (!val) return '0';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5D5E61] m-0 mb-3">{children}</h3>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5 ${className}`}>{children}</div>;
}

export default function SettingsPanel({ user, onLogout, isFullscreen }: SettingsPanelProps) {
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const [usageDaily, setUsageDaily] = useState<UsageDay[]>([]);
  const [usageTotals, setUsageTotals] = useState<UsageTotals | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await fetch('/api/flywheel/usage?days=30', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsageDaily(data.daily || []);
        setUsageTotals(data.totals || null);
      }
    } catch { /* ignore */ }
    finally { setUsageLoading(false); }
  }, []);

  useEffect(() => { loadUsage(); }, [loadUsage]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/subscriptions/current', { headers: authHeaders() });
        if (res.ok) setSubscription(await res.json());
      } catch { /* ignore */ }
      finally { setSubLoading(false); }
    })();
  }, []);

  const trialEndsAt = (user as any).trial_ends_at;
  const trialActive = trialEndsAt && new Date(trialEndsAt) > new Date();
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000)) : 0;

  const planLabel = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : trialActive ? 'Professional Trial' : 'Free';

  return (
    <div style={{ padding: isFullscreen ? '32px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 720 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>

        {/* ─── Profile ─── */}
        <SectionHeading>Profile</SectionHeading>
        <Card className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#D44A78]/10 flex items-center justify-center shrink-0">
              <span className="text-[#D44A78] font-headline font-bold text-lg">
                {(user.display_name || user.email)[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[#0D0D0D] m-0 truncate">{user.display_name || '—'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-[#5D5E61] m-0 truncate">{user.email}</p>
                {(user as any).email_verified ? (
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200 shrink-0">Verified</span>
                ) : verificationSent ? (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200 shrink-0">Sent</span>
                ) : (
                  <button
                    onClick={async () => {
                      setSendingVerification(true);
                      try {
                        await fetch('/api/auth/send-verification', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } });
                        setVerificationSent(true);
                      } catch { /* ignore */ }
                      finally { setSendingVerification(false); }
                    }}
                    disabled={sendingVerification}
                    className="text-[10px] font-semibold text-[#D44A78] bg-[#D44A78]/5 px-1.5 py-0.5 rounded-full border border-[#D44A78]/20 cursor-pointer hover:bg-[#D44A78]/10 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {sendingVerification ? '...' : 'Verify'}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5D5E61]">
            <span>Joined {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            {user.role === 'admin' && <span className="text-[10px] font-semibold text-[#D44A78] bg-[#D44A78]/5 px-1.5 py-0.5 rounded-full">Admin</span>}
            {user.google_id && <span className="text-[10px] text-[#5D5E61] bg-[#f3f3f6] px-1.5 py-0.5 rounded-full">Google linked</span>}
          </div>
        </Card>

        {/* ─── Plan & Billing ─── */}
        <SectionHeading>Plan & Billing</SectionHeading>
        <Card className="mb-6">
          {subLoading ? (
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-5 bg-[#f3f3f6] rounded w-32" />
              <div className="h-4 bg-[#f3f3f6] rounded w-20" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-base font-bold text-[#0D0D0D]">{planLabel}</span>
                {subscription?.status === 'active' && (
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">Active</span>
                )}
                {trialActive && !subscription?.plan && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">{daysLeft} days left</span>
                )}
              </div>
              {subscription?.current_period_end && (
                <p className="text-xs text-[#5D5E61] m-0 mb-2">
                  {subscription.status === 'active' ? 'Renews' : 'Expires'} {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {trialActive && !subscription?.plan && (
                <p className="text-xs text-[#5D5E61] m-0 mb-2">
                  Trial expires {new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {(!subscription?.plan || subscription.plan === 'free') && (
                  <button className="px-3.5 py-2 rounded-full text-xs font-semibold bg-[#D44A78] text-white border-none cursor-pointer hover:bg-[#B03860] transition-colors">
                    Upgrade Plan
                  </button>
                )}
                {subscription?.plan && subscription.plan !== 'free' && (
                  <button className="px-3.5 py-2 rounded-full text-xs font-medium bg-transparent text-[#5D5E61] border border-[rgba(0,0,0,0.08)] cursor-pointer hover:bg-[#f3f3f6] transition-colors">
                    Manage Billing
                  </button>
                )}
              </div>
            </>
          )}
        </Card>

        {/* ─── Usage (30d) ─── */}
        <SectionHeading>Usage — Last 30 Days</SectionHeading>
        <Card className="mb-6">
          {usageLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-2.5 bg-[#f3f3f6] rounded w-2/3 mb-1.5" />
                  <div className="h-5 bg-[#f3f3f6] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-[11px] text-[#5D5E61] m-0 mb-0.5">Tokens Used</p>
                  <p className="text-lg font-bold text-[#0D0D0D] m-0 tabular-nums">
                    {formatNumber((usageTotals?.total_input_tokens || 0) + (usageTotals?.total_output_tokens || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5D5E61] m-0 mb-0.5">Tool Calls</p>
                  <p className="text-lg font-bold text-[#0D0D0D] m-0 tabular-nums">{formatNumber(usageTotals?.total_tool_calls || 0)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5D5E61] m-0 mb-0.5">Deliverables</p>
                  <p className="text-lg font-bold text-[#D44A78] m-0 tabular-nums">{usageTotals?.total_deliverables || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5D5E61] m-0 mb-0.5">Queries</p>
                  <p className="text-lg font-bold text-[#0D0D0D] m-0 tabular-nums">{usageTotals?.total_queries || 0}</p>
                </div>
              </div>

              {usageDaily.length > 0 && (
                <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
                  <p className="text-[11px] text-[#5D5E61] m-0 mb-2 font-medium">Daily Activity</p>
                  <div className="space-y-1">
                    {usageDaily.slice(-14).map(d => {
                      const totalTokens = (d.input_tokens || 0) + (d.output_tokens || 0);
                      const maxTokens = Math.max(...usageDaily.map(x => (x.input_tokens || 0) + (x.output_tokens || 0)), 1);
                      const pct = Math.round((totalTokens / maxTokens) * 100);
                      return (
                        <div key={d.date} className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5D5E61] w-14 shrink-0 tabular-nums">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <div className="flex-1 h-1.5 bg-[#f3f3f6] rounded-full overflow-hidden">
                            <div className="h-full bg-[#D44A78] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-[#5D5E61] w-12 text-right tabular-nums">{formatNumber(totalTokens)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* ─── Sign Out ─── */}
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-red-500 border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
