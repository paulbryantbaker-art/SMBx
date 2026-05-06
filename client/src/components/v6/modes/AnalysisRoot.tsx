import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "./cards";
import type { IconName, OpenTab } from "../types";
import { V6ModeRootEmpty } from "./ModeRootEmpty";
import { useHomeDeals } from "../../../hooks/useHomeDeals";
import type { User } from "../../../hooks/useAuth";

type ToneKey = "primary" | "secondary" | "tertiary" | "pursue" | "watch";

interface RecentRun { id: string; title: string; deal: string; updated: string; status: DocStatusKind }

const RECENTS: RecentRun[] = [
  { id: "an-recast", title: "Big Fake Deal · Recast",     deal: "Big Fake Deal · sample", updated: "Mar 25", status: "live"  },
  { id: "an-comps",  title: "Pest Control · Comps",       deal: "Pest Control · FL",      updated: "Mar 20", status: "saved" },
  { id: "an-val",    title: "Electrical · Valuation",     deal: "Electrical · TX",        updated: "Mar 18", status: "saved" },
  { id: "an-buyer",  title: "Big Fake Deal · Buyer fit",  deal: "Big Fake Deal · sample", updated: "Mar 24", status: "live"  },
];

interface Tool { id: string; name: string; sub: string; icon: IconName; tone: ToneKey }

const TOOLS: Tool[] = [
  { id: "tool-recast",  name: "Recast P&L",      sub: "Find honest add-backs",       icon: "chart", tone: "tertiary"  },
  { id: "tool-comps",   name: "Comps",           sub: "Public + private benchmarks", icon: "chart", tone: "primary"   },
  { id: "tool-val",     name: "Valuation model", sub: "DCF, multiples, structure",   icon: "chart", tone: "pursue"    },
  { id: "tool-qoe",     name: "QoE Lite",        sub: "Quality of earnings sweep",   icon: "search",tone: "primary"   },
  { id: "tool-buyer",   name: "Buyer fit",       sub: "Score against your thesis",   icon: "deal",  tone: "secondary" },
  { id: "tool-sba",     name: "SBA structure",   sub: "Model leverage scenarios",    icon: "chart", tone: "watch"     },
];

const TONE_BG: Record<ToneKey, string> = {
  primary:   "var(--m-primary-container)",
  secondary: "var(--m-secondary-container)",
  tertiary:  "var(--m-tertiary-container)",
  pursue:    "var(--m-pursue-container)",
  watch:     "var(--m-watch-container)",
};
const TONE_FG: Record<ToneKey, string> = {
  primary:   "var(--m-on-primary-container)",
  secondary: "var(--m-on-secondary-container)",
  tertiary:  "var(--m-on-tertiary-container)",
  pursue:    "var(--m-pursue-on-cont)",
  watch:     "#3F2E00",
};

export function V6AnalysisRoot({ openTab, user }: { openTab: OpenTab; user?: User | null }) {
  const home = useHomeDeals(user ?? null);
  // UX-57: empty state for authed users with no deals (so no analyses yet).
  if (home.isAuthed && !home.loading && !home.hasData) {
    return <V6ModeRootEmpty noun="analyses" />;
  }
  return _AnalysisBody({ openTab });
}

function _AnalysisBody({ openTab }: { openTab: OpenTab }) {
  return (
    <div className="m-fade-up">
      <V6Section
        eyebrow="ANALYSIS"
        title="Run an analysis"
        sub="Yulia handles the math. You read the result."
        action={
          <button className="m-btn filled" aria-label="New analysis">
            <V6Icon name="plus" size={12} />
            <span style={{ marginLeft: 6 }}>New analysis</span>
          </button>
        }
      >
        <div />
      </V6Section>

      <V6Section eyebrow="TOOLS" title="What can I run">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {TOOLS.map(t => (
            <div
              key={t.id}
              className="m-card m-state tap"
              onClick={() => openTab({ kind: "analysis", title: `New ${t.name}`, tool: t.id })}
              role="button"
              tabIndex={0}
              aria-label={`Run ${t.name} — ${t.sub}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "analysis", title: `New ${t.name}`, tool: t.id }); } }}
              style={{ padding: "18px 20px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...A.toolIcon, background: TONE_BG[t.tone], color: TONE_FG[t.tone] }}>
                  <V6Icon name={t.icon} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={A.toolName}>{t.name}</div>
                  <div style={A.toolSub}>{t.sub}</div>
                </div>
                <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--m-on-surface-mid)" }} aria-hidden="true">
                  <V6Icon name="back" size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="RECENT" title="Recently run" sub="Open any to keep iterating.">
        <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
          {RECENTS.map((r, i) => (
            <div
              key={r.id}
              className="m-state"
              onClick={() => openTab({ kind: "analysis", title: r.title, id: r.id })}
              role="button"
              tabIndex={0}
              aria-label={`${r.title}, ${r.deal}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "analysis", title: r.title, id: r.id }); } }}
              style={{
                display: "grid", gridTemplateColumns: "32px 2fr 2fr 80px 80px",
                alignItems: "center", gap: 16,
                padding: "14px 18px",
                borderBottom: i === RECENTS.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                cursor: "pointer",
              }}
            >
              <V6Icon name="chart" size={14} />
              <div style={A.recentTitle}>{r.title}</div>
              <div style={A.recentDeal}>{r.deal}</div>
              <V6DocStatus status={r.status} />
              <div className="mono" style={A.recentDate}>{r.updated.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

const A: Record<string, CSSProperties> = {
  toolIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: "grid", placeItems: "center",
    flexShrink: 0,
  },
  toolName: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
    letterSpacing: "-0.01em", color: "var(--m-on-surface)",
  },
  toolSub: {
    fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 1,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  recentTitle: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
  },
  recentDeal: { fontSize: 12, color: "var(--m-on-surface-mid)" },
  recentDate: {
    fontSize: 10.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.1em", textAlign: "right",
  },
};
