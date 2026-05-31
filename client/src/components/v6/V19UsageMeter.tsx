import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../hooks/useAuth";

type Plan = "free" | "solo" | "pro" | "team" | "enterprise";

interface UsageCounter {
  used: number;
  requested: number;
  limit: number | null;
  remaining: number | null;
}

interface V19UsageMeterResponse {
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
    entitlements: {
      apiMcpAccess: boolean;
      agentUsage: "none" | "supervised" | "autonomous";
    };
  };
}

interface V19UsageMeterProps {
  user: User | null;
  compact?: boolean;
  surface?: "settings" | "studio";
}

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
};

export function V19UsageMeter({ user, compact = false, surface = "settings" }: V19UsageMeterProps) {
  const [data, setData] = useState<V19UsageMeterResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetch("/api/v19/entitlements", { headers: authHeaders() })
      .then(async res => {
        if (!res.ok) throw new Error("Could not load V19 entitlements");
        return res.json() as Promise<V19UsageMeterResponse>;
      })
      .then(next => {
        if (alive) setData(next);
      })
      .catch(() => {
        if (alive) setData(fallbackUsageForUser(user));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [user]);

  const rows = useMemo(() => {
    if (!data) return [];
    const events = data.usage.events;
    return [
      ["Model runs", events.model_run],
      ["Studio exports", events.studio_export],
      ["Studio books", events.studio_book],
      ["API/MCP calls", events.api_call],
      ["Tool calls", events.tool_call],
      ["Agent actions", events.enterprise_agent_action],
    ] as const;
  }, [data]);

  if (!user) {
    return compact ? null : (
      <section style={S.shell}>
        <div style={S.headerRow}>
          <h3 style={S.title}>Plan meter</h3>
          <span style={S.pill}>Sign in</span>
        </div>
        <p style={S.copy}>Create an account to track model runs, exports, Studio books, and agent access.</p>
      </section>
    );
  }

  if (loading && !data) {
    return (
      <section style={{ ...S.shell, ...(compact ? S.compactShell : null) }}>
        <div style={S.headerRow}>
          <h3 style={S.title}>Plan meter</h3>
          <span style={S.pill}>Loading</span>
        </div>
        <div style={S.loadingBar} />
      </section>
    );
  }

  if (!data) return null;

  const usage = data.usage;
  const reset = formatReset(usage.periodEnd);
  const plan = PLAN_LABELS[usage.plan] || usage.plan;
  const apiText = usage.entitlements.apiMcpAccess ? "API/MCP on" : "API/MCP off";
  const agentText = usage.entitlements.agentUsage === "none"
    ? "Agents off"
    : usage.entitlements.agentUsage === "supervised"
      ? "Supervised agents"
      : "Autonomous agents";

  return (
    <section style={{
      ...S.shell,
      ...(compact ? S.compactShell : null),
      ...(surface === "studio" ? S.studioShell : null),
    }}>
      <div style={S.headerRow}>
        <div>
          <h3 style={S.title}>Plan meter</h3>
          {!compact && <p style={S.copy}>Included monthly usage for server models, Studio, and agent-facing calls.</p>}
        </div>
        <span style={S.planPill}>{plan}</span>
      </div>

      <div style={S.creditRow}>
        <div>
          <strong style={S.creditTitle}>Monthly V19 allowance</strong>
          <span style={S.resetText}>Resets {reset}</span>
        </div>
        <strong style={S.creditValue}>{formatCounter(usage.credits)}</strong>
      </div>
      <Progress counter={usage.credits} />

      <div style={compact ? S.compactGrid : S.grid}>
        {rows.slice(0, compact ? 3 : rows.length).map(([label, counter]) => (
          <div key={label} style={S.metric}>
            <div style={S.metricTop}>
              <span style={S.metricLabel}>{label}</span>
              <strong style={S.metricValue}>{formatCounter(counter)}</strong>
            </div>
            <Progress counter={counter} small />
          </div>
        ))}
      </div>

      {!compact && (
        <div style={S.scopeRow}>
          <span style={S.scopePill}>{apiText}</span>
          <span style={S.scopePill}>{agentText}</span>
          <span style={S.scopePill}>No wallet</span>
        </div>
      )}
    </section>
  );
}

function Progress({ counter, small = false }: { counter: UsageCounter; small?: boolean }) {
  const width = counter.limit === null
    ? 100
    : Math.min(100, Math.round((counter.used / Math.max(counter.limit, 1)) * 100));
  return (
    <div style={{ ...S.track, ...(small ? S.smallTrack : null) }}>
      <div style={{ ...S.fill, width: `${width}%` }} />
    </div>
  );
}

function formatCounter(counter: UsageCounter): string {
  if (counter.limit === null) return `${formatNumber(counter.used)} / custom`;
  return `${formatNumber(counter.used)} / ${formatNumber(counter.limit)}`;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function formatReset(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "monthly";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fallbackUsageForUser(user: User): V19UsageMeterResponse {
  const plan = normalizePlan(user.plan);
  const entitlements = ENTITLEMENT_FALLBACK[plan];
  const end = new Date();
  end.setDate(1);
  end.setMonth(end.getMonth() + 1);
  return {
    usage: {
      plan,
      periodEnd: end.toISOString(),
      credits: emptyCounter(entitlements.credits),
      events: {
        model_run: emptyCounter(entitlements.models),
        studio_export: emptyCounter(entitlements.exports),
        studio_book: emptyCounter(entitlements.books),
        api_call: emptyCounter(entitlements.api),
        tool_call: emptyCounter(entitlements.tools),
        enterprise_agent_action: emptyCounter(entitlements.agents),
      },
      entitlements: {
        apiMcpAccess: entitlements.api !== 0,
        agentUsage: entitlements.agentUsage,
      },
    },
  };
}

function normalizePlan(plan?: string | null): Plan {
  if (plan === "solo" || plan === "pro" || plan === "team" || plan === "enterprise") return plan;
  return "free";
}

function emptyCounter(limit: number | null): UsageCounter {
  return { used: 0, requested: 0, limit, remaining: limit };
}

const ENTITLEMENT_FALLBACK: Record<Plan, {
  credits: number | null;
  models: number | null;
  exports: number | null;
  books: number | null;
  api: number | null;
  tools: number | null;
  agents: number | null;
  agentUsage: "none" | "supervised" | "autonomous";
}> = {
  free: { credits: 30, models: 20, exports: 1, books: 1, api: 0, tools: 60, agents: 0, agentUsage: "none" },
  solo: { credits: 600, models: 300, exports: 30, books: 12, api: 0, tools: 600, agents: 0, agentUsage: "none" },
  pro: { credits: 2500, models: 1200, exports: 150, books: 60, api: 2500, tools: 2500, agents: 0, agentUsage: "none" },
  team: { credits: 12000, models: 6000, exports: 600, books: 300, api: 15000, tools: 10000, agents: 250, agentUsage: "supervised" },
  enterprise: { credits: null, models: null, exports: null, books: null, api: null, tools: null, agents: null, agentUsage: "autonomous" },
};

const glass: CSSProperties = {
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
};

const S: Record<string, CSSProperties> = {
  shell: {
    display: "grid",
    gap: 16,
    padding: 20,
    borderRadius: 24,
    color: "var(--ink)",
    background:
      "var(--ink)" +
      "var(--surface)",
    border: "1px solid rgba(255,255,255,.68)",
    boxShadow:
      "0 24px 64px rgba(38,61,93,.12), inset 0 1px 0 rgba(255,255,255,.88), inset 0 0 0 1px rgba(166,190,220,.18)",
    ...glass,
  },
  studioShell: {
    marginTop: 18,
  },
  compactShell: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1,
    letterSpacing: 0,
    fontWeight: 850,
    color: "var(--ink)",
  },
  copy: {
    margin: "7px 0 0",
    maxWidth: 620,
    color: "var(--ink-3)",
    fontSize: 15,
    lineHeight: 1.38,
  },
  pill: {
    flexShrink: 0,
    borderRadius: 999,
    padding: "8px 12px",
    color: "#57534A",
    background: "rgba(234,243,251,.86)",
    border: "1px solid rgba(25,24,19,0.10)",
    fontWeight: 850,
  },
  planPill: {
    flexShrink: 0,
    borderRadius: 999,
    padding: "9px 14px",
    color: "#FFFFFF",
    background:
      "var(--ink)",
    border: "1px solid rgba(255,255,255,.34)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 12px 24px rgba(42,65,96,.14)",
    fontWeight: 850,
  },
  creditRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-end",
  },
  creditTitle: {
    display: "block",
    fontSize: 16,
    lineHeight: 1.1,
  },
  resetText: {
    display: "block",
    marginTop: 4,
    color: "var(--ink-3)",
    fontSize: 13,
    fontWeight: 650,
  },
  creditValue: {
    fontSize: 18,
    whiteSpace: "nowrap",
  },
  track: {
    width: "100%",
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    background: "rgba(198,214,234,.42)",
    boxShadow: "inset 0 1px 2px rgba(26,34,51,.08)",
  },
  smallTrack: {
    height: 6,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    background: "var(--accent)",
    boxShadow: "0 0 0 1px rgba(255,255,255,.25) inset",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  compactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  metric: {
    display: "grid",
    gap: 8,
    minWidth: 0,
    padding: 12,
    borderRadius: 18,
    background: "rgba(255,255,255,.52)",
    border: "1px solid rgba(255,255,255,.62)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.70)",
  },
  metricTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 10,
    color: "var(--ink-3)",
    fontSize: 13,
    fontWeight: 750,
    minWidth: 0,
  },
  metricLabel: {
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  metricValue: {
    flexShrink: 0,
    color: "var(--ink)",
  },
  scopeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  scopePill: {
    borderRadius: 999,
    padding: "8px 11px",
    color: "#57534A",
    background: "rgba(234,243,251,.72)",
    border: "1px solid rgba(166,190,220,.32)",
    fontWeight: 800,
  },
  loadingBar: {
    height: 12,
    borderRadius: 999,
    background: "var(--surface)",
  },
};
