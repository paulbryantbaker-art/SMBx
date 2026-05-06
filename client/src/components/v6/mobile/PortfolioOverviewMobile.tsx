/**
 * V6 Mobile PortfolioOverviewMobile — Pipeline tab header (B2.8).
 *
 * Mobile-tokens twin of V6PortfolioOverviewCard. Same data shape from
 * /api/portfolio/summary; layout adapted for narrow column.
 */
import { type CSSProperties } from "react";
import type { User } from "../../../hooks/useAuth";
import { usePortfolioSummary, fmtEv } from "../../../hooks/usePortfolioSummary";

export function PortfolioOverviewMobile({ user }: { user: User | null }) {
  const { data, loading } = usePortfolioSummary(user);
  if (!user) return null;
  if (loading && !data) return null;
  if (!data || data.totalActive === 0) return null;

  return (
    <section style={M.section}>
      <div style={M.head}>
        <span className="mb-mono" style={M.eyebrow}>YOUR PORTFOLIO · {data.totalActive} ACTIVE</span>
      </div>
      <div style={M.evRow}>
        <div style={M.evValue}>{fmtEv(data.weightedEvCents)}</div>
        <div style={M.evLabel}>weighted EV</div>
      </div>
      <div style={M.gateBar} aria-label="Deals by gate">
        {data.byGate.map(g => (
          <div
            key={g.gate}
            style={{ ...M.gateSeg, flex: g.count, background: gateTone(g.gate) }}
            title={`${g.gate}: ${g.count}`}
          >
            <span style={M.gateLabel}>{g.gate} · {g.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function gateTone(gate: string): string {
  const num = parseInt(gate.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num) || num <= 1) return "var(--mb-accent-soft)";
  if (num <= 3) return "var(--mb-accent)";
  if (num === 4) return "var(--mb-accent-2)";
  return "var(--mb-verdict-pursue)";
}

const M: Record<string, CSSProperties> = {
  section: {
    margin: "8px 16px 12px",
    background: "var(--mb-card)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 14,
    padding: "14px 16px",
  },
  head: { marginBottom: 6 },
  eyebrow: {
    fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  evRow: {
    display: "flex", alignItems: "baseline", gap: 8,
    marginBottom: 10,
  },
  evValue: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 26, fontWeight: 700,
    letterSpacing: "-0.025em",
    color: "var(--mb-ink)",
  },
  evLabel: {
    fontSize: 12, color: "var(--mb-ink-3)",
  },
  gateBar: {
    display: "flex", alignItems: "stretch",
    height: 22, borderRadius: 6, overflow: "hidden",
    background: "var(--mb-bg-2)",
  },
  gateSeg: {
    minWidth: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff",
  },
  gateLabel: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
    padding: "0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  },
};
