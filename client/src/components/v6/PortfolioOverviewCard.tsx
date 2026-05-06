/**
 * V6 PortfolioOverviewCard — desktop home page (B2.8).
 *
 * Aggregations only: weighted EV, deals by gate, expected close window.
 * NOT individual deal listings (those live in Picks / In-Review / Closed
 * sections below). Hides entirely when the user has zero deals — empty
 * portfolio cards are a UX-01 violation.
 *
 * Per architecture_portfolio_overview_card.md in memory.
 */

import { type CSSProperties } from "react";
import type { User } from "../../hooks/useAuth";
import { usePortfolioSummary, fmtEv } from "../../hooks/usePortfolioSummary";

interface Props {
  user: User | null;
}

export function V6PortfolioOverviewCard({ user }: Props) {
  const { data, loading } = usePortfolioSummary(user);

  // Hide for anon, while loading, or when user has zero deals
  if (!user) return null;
  if (loading && !data) return <SkeletonCard />;
  if (!data || data.totalActive === 0) return null;

  const totalGateCount = data.byGate.reduce((s, g) => s + g.count, 0) || 1;

  return (
    <section style={P.section}>
      <div style={P.head}>
        <div className="mono" style={P.eyebrow}>YOUR PORTFOLIO · {data.totalActive} ACTIVE</div>
        <div style={P.headRight}>
          <div className="mono" style={P.evLabel}>WEIGHTED EV</div>
          <div style={P.evValue}>{fmtEv(data.weightedEvCents)}</div>
        </div>
      </div>

      {/* Gate distribution — small horizontal bar with segments per gate */}
      <div style={P.gateBarWrap}>
        <div className="mono" style={P.subEyebrow}>BY GATE</div>
        <div style={P.gateBar}>
          {data.byGate.map(g => (
            <div
              key={g.gate}
              style={{
                ...P.gateSegment,
                flex: g.count,
                background: gateBarTone(g.gate),
              }}
              title={`${g.gate}: ${g.count} ${g.count === 1 ? "deal" : "deals"}`}
            >
              <span style={P.gateLabel}>{g.gate} · {g.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Close-window distribution */}
      <div style={P.closeRow}>
        <div className="mono" style={P.subEyebrow}>EXPECTED CLOSE</div>
        <div style={P.closeWindowGrid}>
          {data.byCloseWindow.map(w => (
            <div key={w.window} style={P.closeWindowCell}>
              <div style={P.closeWindowCount}>{w.count}</div>
              <div style={P.closeWindowLabel}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return <section style={{ ...P.section, opacity: 0.55 }} aria-hidden="true">
    <div style={{ ...P.gateBar, height: 28, opacity: 0.4 }} />
  </section>;
}

function gateBarTone(gate: string): string {
  // Lavender-to-slate ramp by gate progress so the bar reads left-to-right
  // as "early → late" without being garish.
  const num = parseInt(gate.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return "var(--m-surface-3)";
  if (num <= 1) return "var(--m-surface-3)";
  if (num === 2) return "var(--m-primary-container)";
  if (num === 3) return "var(--m-primary)";
  if (num === 4) return "var(--m-primary)";
  return "var(--m-pursue)";
}

const P: Record<string, CSSProperties> = {
  section: {
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "var(--m-elev-1)",
    marginBottom: 28,
  },
  head: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  headRight: {
    textAlign: "right",
  },
  evLabel: {
    fontSize: 9, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.16em", fontWeight: 600,
  },
  evValue: {
    fontFamily: "var(--font-display)",
    fontSize: 28, fontWeight: 700,
    letterSpacing: "-0.025em",
    color: "var(--m-on-surface)",
    marginTop: 2,
  },
  gateBarWrap: {
    marginBottom: 14,
  },
  subEyebrow: {
    fontSize: 9, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.16em", fontWeight: 600,
    marginBottom: 6,
  },
  gateBar: {
    display: "flex", alignItems: "stretch",
    height: 22, borderRadius: 6, overflow: "hidden",
    background: "var(--m-surface-2)",
  },
  gateSegment: {
    minWidth: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--m-on-primary)",
    transition: "flex 200ms ease",
  },
  gateLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em",
    padding: "0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  },
  closeRow: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  closeWindowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  closeWindowCell: {
    background: "var(--m-surface-tinted)",
    borderRadius: 8,
    padding: "10px 12px",
  },
  closeWindowCount: {
    fontFamily: "var(--font-display)",
    fontSize: 22, fontWeight: 700,
    color: "var(--m-on-surface)",
    letterSpacing: "-0.02em",
  },
  closeWindowLabel: {
    fontSize: 11, color: "var(--m-on-surface-mid)",
    marginTop: 2,
  },
};
