/* V6 Mobile — Account / Usage screen.

   Mobile-first account view pushed from the account sheet: identity
   (email + plan), the plan meter, recent activity, and a Manage
   subscription button that opens the Stripe Customer Portal (handler
   lives in V6Mobile and is passed down as onManageBilling).

   The meter is mobile-native rather than reusing V19UsageMeter — that
   component's 3-column metric grid and desktop glass chrome are too
   wide/dense at 375px. We hit the SAME endpoint it uses
   (GET /api/v19/entitlements) and render a simple stacked list:
   counter label, used/limit, thin progress bar. Unlike V19UsageMeter
   we do NOT fall back to invented per-plan numbers when the endpoint
   fails — we say usage isn't available yet. Activity comes from
   GET /api/flywheel/usage?days=N (7/30/90 switch, same endpoint and
   pattern as desktop Settings). Sign-out intentionally NOT here — it
   stays in the account sheet. */

import { type CSSProperties, useEffect, useState } from "react";
import { MobileIcon } from "../icons";
import { authHeaders, type User } from "../../../../hooks/useAuth";

/* ── Server shapes ──────────────────────────────────────────────── */

type Plan = "free" | "solo" | "pro" | "team" | "enterprise";

interface UsageCounter {
  used: number;
  requested: number;
  limit: number | null;
  remaining: number | null;
}

interface EntitlementsResponse {
  usage: {
    plan: Plan;
    periodEnd: string;
    credits: UsageCounter;
    events: {
      model_run: UsageCounter;
      studio_export: UsageCounter;
      studio_book: UsageCounter;
      api_call: UsageCounter;
      tool_call: UsageCounter;
      enterprise_agent_action: UsageCounter;
    };
  };
}

interface ActivityTotals {
  total_input_tokens: number | null;
  total_output_tokens: number | null;
  total_tool_calls: number | null;
  total_deliverables: number | null;
  total_queries: number | null;
}

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
};

function normalizePlan(plan?: string | null): Plan {
  if (plan === "solo" || plan === "pro" || plan === "team" || plan === "enterprise") return plan;
  return "free";
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function formatCounter(counter: UsageCounter): string {
  if (counter.limit === null) return `${formatNumber(counter.used)} / custom`;
  return `${formatNumber(counter.used)} / ${formatNumber(counter.limit)}`;
}

function formatReset(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "monthly";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ── Screen ─────────────────────────────────────────────────────── */

export function MobileUsageScreen({ user, onBack, onManageBilling }: { user: User | null; onBack: () => void; onManageBilling: () => void }) {
  // Plan meter (monthly entitlements). "unavailable" is an honest end
  // state — no invented numbers when the endpoint 404s/401s/errors.
  const [meter, setMeter] = useState<EntitlementsResponse | null>(null);
  const [meterState, setMeterState] = useState<"loading" | "ready" | "unavailable">("loading");

  // Activity (token/tool/deliverable history) with a 7/30/90d range.
  const [days, setDays] = useState(30);
  const [totals, setTotals] = useState<ActivityTotals | null>(null);
  const [activityState, setActivityState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!user) { setMeterState("unavailable"); return; }
    let alive = true;
    setMeterState("loading");
    fetch("/api/v19/entitlements", { headers: authHeaders() })
      .then(async res => {
        if (!res.ok) throw new Error("entitlements unavailable");
        return res.json() as Promise<EntitlementsResponse>;
      })
      .then(next => {
        if (!alive) return;
        if (!next?.usage?.credits || !next.usage.events) throw new Error("bad shape");
        setMeter(next);
        setMeterState("ready");
      })
      .catch(() => { if (alive) setMeterState("unavailable"); });
    return () => { alive = false; };
  }, [user]);

  useEffect(() => {
    if (!user) { setActivityState("unavailable"); return; }
    let alive = true;
    setActivityState("loading");
    fetch(`/api/flywheel/usage?days=${days}`, { headers: authHeaders() })
      .then(async res => {
        if (!res.ok) throw new Error("usage unavailable");
        return res.json() as Promise<{ totals?: ActivityTotals }>;
      })
      .then(data => {
        if (!alive) return;
        setTotals(data.totals ?? null);
        setActivityState("ready");
      })
      .catch(() => { if (alive) setActivityState("unavailable"); });
    return () => { alive = false; };
  }, [user, days]);

  const planLabel = PLAN_LABELS[meter ? meter.usage.plan : normalizePlan(user?.plan)];

  return (
    <div className="mb-fade-up" style={U.root}>
      {/* 44px top bar: back + title, under the safe area. */}
      <div style={U.topBar}>
        <button type="button" onClick={onBack} aria-label="Back" style={U.backBtn}>
          <MobileIcon name="back" size={15} c="var(--mb-ink-1)" />
        </button>
        <h1 style={U.topTitle}>Account</h1>
        <div style={U.topSpacer} aria-hidden="true" />
      </div>

      <div style={U.body}>
        {!user ? (
          <div className="mb-as-card" style={U.card}>
            <p style={U.emptyText}>Sign in to see your plan, usage, and billing.</p>
          </div>
        ) : (
          <>
            {/* (a) Identity — email + plan. */}
            <div className="mb-as-card" style={U.card}>
              <div style={U.idRow}>
                <div style={{ minWidth: 0 }}>
                  <div style={U.idEmail}>{user.email}</div>
                  {user.display_name && <div style={U.idName}>{user.display_name}</div>}
                </div>
                <span style={U.planPill}>{planLabel}</span>
              </div>
            </div>

            {/* (b) Plan meter — monthly allowance + per-event counters. */}
            <div className="mb-as-card" style={U.card}>
              <div style={U.cardHead}>
                <div style={U.cardTitle}>Plan meter</div>
                {meterState === "ready" && meter && (
                  <span style={U.resetText}>Resets {formatReset(meter.usage.periodEnd)}</span>
                )}
              </div>
              {meterState === "loading" && <LoadingRows count={3} />}
              {meterState === "unavailable" && (
                <p style={U.emptyText}>Usage data isn&rsquo;t available yet.</p>
              )}
              {meterState === "ready" && meter && (
                <div style={{ display: "grid", gap: 14 }}>
                  <MeterRow label="Monthly allowance" counter={meter.usage.credits} strong />
                  <MeterRow label="Model runs" counter={meter.usage.events.model_run} />
                  <MeterRow label="Studio exports" counter={meter.usage.events.studio_export} />
                  <MeterRow label="Studio books" counter={meter.usage.events.studio_book} />
                  <MeterRow label="API/MCP calls" counter={meter.usage.events.api_call} />
                  <MeterRow label="Tool calls" counter={meter.usage.events.tool_call} />
                  <MeterRow label="Agent actions" counter={meter.usage.events.enterprise_agent_action} />
                </div>
              )}
            </div>

            {/* (b cont.) Activity — 7/30/90d totals from usage tracking. */}
            <div className="mb-as-card" style={U.card}>
              <div style={U.cardHead}>
                <div style={U.cardTitle}>Activity</div>
                <div style={U.rangeWrap}>
                  {[7, 30, 90].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      aria-pressed={days === d}
                      style={{
                        ...U.rangeBtn,
                        ...(days === d ? U.rangeBtnOn : null),
                      }}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              {activityState === "loading" && <LoadingRows count={2} />}
              {activityState === "unavailable" && (
                <p style={U.emptyText}>Usage data isn&rsquo;t available yet.</p>
              )}
              {activityState === "ready" && (
                hasActivity(totals) ? (
                  <div style={{ display: "grid", gap: 4 }}>
                    <StatRow label="Tokens" value={formatNumber((Number(totals?.total_input_tokens) || 0) + (Number(totals?.total_output_tokens) || 0))} />
                    <StatRow label="Tool calls" value={formatNumber(Number(totals?.total_tool_calls) || 0)} />
                    <StatRow label="Deliverables" value={formatNumber(Number(totals?.total_deliverables) || 0)} />
                    <StatRow label="Intelligence queries" value={formatNumber(Number(totals?.total_queries) || 0)} />
                  </div>
                ) : (
                  <p style={U.emptyText}>No usage in the last {days} days.</p>
                )
              )}
            </div>

            {/* (c) Manage subscription → Stripe Customer Portal. */}
            <button type="button" onClick={onManageBilling} style={U.manageBtn}>
              Manage subscription
            </button>
            <p style={U.manageHint}>Opens the Stripe billing portal — plan changes, invoices, and payment methods.</p>
          </>
        )}
      </div>
    </div>
  );
}

function hasActivity(totals: ActivityTotals | null): boolean {
  if (!totals) return false;
  return [
    totals.total_input_tokens, totals.total_output_tokens,
    totals.total_tool_calls, totals.total_deliverables, totals.total_queries,
  ].some(v => Number(v) > 0);
}

function MeterRow({ label, counter, strong = false }: { label: string; counter: UsageCounter; strong?: boolean }) {
  const pct = counter.limit === null
    ? 0
    : Math.min(100, Math.round((counter.used / Math.max(counter.limit, 1)) * 100));
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={U.meterTop}>
        <span style={{ ...U.meterLabel, ...(strong ? U.meterLabelStrong : null) }}>{label}</span>
        <span className="mb-mono" style={U.meterValue}>{formatCounter(counter)}</span>
      </div>
      <div style={U.track} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div style={{ ...U.fill, width: `${counter.limit === null ? 100 : pct}%`, ...(counter.limit === null ? U.fillCustom : null) }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={U.statRow}>
      <span style={U.statLabel}>{label}</span>
      <span className="mb-mono" style={U.statValue}>{value}</span>
    </div>
  );
}

function LoadingRows({ count }: { count: number }) {
  return (
    <div style={{ display: "grid", gap: 12 }} aria-label="Loading" role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={U.skeleton} />
      ))}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

const U: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 110px)",
  },
  topBar: {
    position: "sticky", top: 0, zIndex: 10,
    display: "flex", alignItems: "center",
    height: 44,
    paddingTop: "env(safe-area-inset-top, 0px)",
    boxSizing: "content-box",
    background: "rgba(251,250,246,0.86)",
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    borderBottom: "0.5px solid var(--mb-line-2)",
  },
  backBtn: {
    width: 44, height: 44, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  topTitle: {
    flex: 1, textAlign: "center",
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 17, letterSpacing: "-0.3px",
    margin: 0, color: "var(--mb-ink)",
  },
  topSpacer: { width: 44, flexShrink: 0 },
  body: { padding: "16px 16px 0" },
  card: { padding: 16, marginBottom: 14 },
  cardHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    gap: 12, marginBottom: 14,
  },
  cardTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 17,
    color: "var(--mb-ink)", letterSpacing: "-0.3px",
  },
  resetText: { fontSize: 13, color: "var(--mb-ink-3)", fontWeight: 600, flexShrink: 0 },
  idRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  idEmail: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 16,
    color: "var(--mb-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  idName: { fontSize: 14, color: "var(--mb-ink-3)", marginTop: 2 },
  planPill: {
    flexShrink: 0, padding: "6px 13px", borderRadius: 999,
    background: "var(--mb-accent)", color: "var(--mb-accent-ink)",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 14,
  },
  meterTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  meterLabel: { fontSize: 15, color: "var(--mb-ink-2)", fontWeight: 600, minWidth: 0 },
  meterLabelStrong: { fontSize: 16, color: "var(--mb-ink)", fontWeight: 700 },
  meterValue: { fontSize: 14, fontWeight: 700, color: "var(--mb-ink)", flexShrink: 0, whiteSpace: "nowrap" },
  track: {
    width: "100%", height: 6, borderRadius: 999, overflow: "hidden",
    background: "var(--mb-bg-2)",
  },
  fill: { height: "100%", borderRadius: 999, background: "var(--mb-accent-2)" },
  fillCustom: { background: "var(--mb-ink-5)" },
  rangeWrap: { display: "flex", gap: 6, flexShrink: 0 },
  rangeBtn: {
    padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
    background: "var(--mb-bg-2)", color: "var(--mb-ink-2)",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 13,
    WebkitTapHighlightColor: "transparent",
  },
  rangeBtnOn: { background: "var(--mb-ink)", color: "#fff" },
  statRow: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: 12, padding: "9px 0",
    borderBottom: "0.5px solid var(--mb-line-2)",
  },
  statLabel: { fontSize: 15, color: "var(--mb-ink-2)", fontWeight: 600 },
  statValue: { fontSize: 16, fontWeight: 700, color: "var(--mb-ink)" },
  manageBtn: {
    width: "100%", boxSizing: "border-box", height: 48,
    borderRadius: 14, border: "none", cursor: "pointer",
    background: "var(--mb-accent)", color: "var(--mb-accent-ink)",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 16,
    WebkitTapHighlightColor: "transparent",
  },
  manageHint: {
    fontSize: 13, color: "var(--mb-ink-3)", lineHeight: 1.4,
    margin: "10px 4px 0", textAlign: "center",
  },
  emptyText: { fontSize: 15, color: "var(--mb-ink-3)", lineHeight: 1.45, margin: 0 },
  skeleton: {
    height: 14, borderRadius: 999, background: "var(--mb-bg-2)",
  },
};

export default MobileUsageScreen;
