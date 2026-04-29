/* V3 — canvas pane: shows different content based on mode.
   Welcome → ambient deal preview. Watch → animates with demo.
   Explore → static finished deal. Start → empty. Learn → LearnDoc.
   Port of dist/source/v3-canvas.jsx. */
import { type CSSProperties, type ReactNode } from "react";
import type { Mode } from "./Workspace";
import { LearnDoc } from "./LearnDoc";

interface CanvasPaneProps {
  mode: Mode;
  demoStep: number;
}

export function CanvasPane({ mode, demoStep }: CanvasPaneProps) {
  const isLearn = mode === "learn";
  return (
    <div style={vp.wrap}>
      <div style={vp.head}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>~/</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>
            {isLearn
              ? "learn/how-it-works.md"
              : mode === "welcome" ? "preview/sample-deal.tx" : "deals/industrial-svc-tx/screen.md"}
          </span>
          {!isLearn && (
            <span className="mono" style={{ fontSize: 9.5, color: "var(--go)", marginLeft: 6 }}>
              ● modified
            </span>
          )}
          {isLearn && (
            <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", marginLeft: 6 }}>
              read-only
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={vp.headBtn} title="Export">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 2v8M3 7l4 4 4-4M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button style={vp.headBtn}>{isLearn ? "Print" : "Open in app"}</button>
        </div>
      </div>

      <div className="thin-scroll" style={vp.body}>
        {isLearn ? (
          <LearnDoc />
        ) : mode === "start" ? (
          <EmptyCanvas />
        ) : (
          <DealCanvas mode={mode} demoStep={demoStep} />
        )}
      </div>

      <div style={vp.foot}>
        {isLearn ? (
          <>
            <span className="mono" style={{ fontSize: 10 }}>READING</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span className="mono" style={{ fontSize: 10 }}>HOW-IT-WORKS · PRICING</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span className="mono" style={{ fontSize: 10 }}>UPDATED 04/26</span>
            <div style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10 }}>v0.4.2 · 7 sections</span>
          </>
        ) : (
          <>
            <span className="mono" style={{ fontSize: 10 }}>READY</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span className="mono" style={{ fontSize: 10 }}>SBA-CLEAR · 7.0×</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span className="mono" style={{ fontSize: 10 }}>VERDICT</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--go)" }}>PURSUE</span>
            <div style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10 }}>UTC 14:32 · LN 1,432</span>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div style={vp.empty}>
      <div style={vp.emptyInner}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="8" width="28" height="24" rx="2" stroke="var(--ink-4)" strokeWidth="1.2" strokeDasharray="2 3"/>
          <path d="M14 16h12M14 20h12M14 24h8" stroke="var(--ink-4)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 3"/>
        </svg>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600,
          color: "var(--ink-2)", marginTop: 16, letterSpacing: "-0.01em",
        }}>
          Your deal canvas
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6, maxWidth: 280, textAlign: "center", lineHeight: 1.55 }}>
          Drop a teaser, P&amp;L, or describe a deal in the thread. The recast, baseline, buyers, and IOI draft will appear here as Yulia builds them.
        </div>
      </div>
    </div>
  );
}

function DealCanvas({ mode, demoStep }: { mode: Mode; demoStep: number }) {
  // demoStep: 0=none, 1=teaser, 2=recast visible, 3=baseline, 4=risks, 5=verdict
  const showRecast = mode !== "watch" || demoStep >= 2;
  const showBaseline = mode !== "watch" || demoStep >= 3;
  const showRisks = mode !== "watch" || demoStep >= 4;
  const showVerdict = mode !== "watch" || demoStep >= 5;

  return (
    <div style={vp.docInner}>
      {/* Title block */}
      <div style={vp.docTitle}>
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5 }}>
            CONFIDENTIAL TEASER · CASE C-241B
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: 22,
            letterSpacing: "-0.02em",
            margin: "6px 0 0", color: "var(--ink)",
          }}>
            Industrial Services Co · East Texas
          </h1>
          <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
            <span><span className="mono" style={{ color: "var(--ink-4)" }}>SIC</span> 1731</span>
            <span><span className="mono" style={{ color: "var(--ink-4)" }}>EMP</span> 41</span>
            <span><span className="mono" style={{ color: "var(--ink-4)" }}>FOUNDED</span> 1998</span>
            <span><span className="mono" style={{ color: "var(--ink-4)" }}>CONTACT</span> broker · CONFIDENTIAL</span>
          </div>
        </div>
        {showVerdict && (
          <div className="fade-up" style={vp.verdictBox}>
            <span className="eyebrow" style={{ fontSize: 9 }}>YULIA'S VERDICT</span>
            <div style={vp.verdictTag}>PURSUE</div>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>conviction · 0.78</span>
          </div>
        )}
      </div>

      {/* KPI band */}
      <div style={vp.kpis}>
        <KpiCell label="TTM Revenue" val="$5.4M" />
        <KpiCell label="Normalized SDE" val="$1.80M" accent={showRecast} dim={!showRecast} />
        <KpiCell label="EBITDA margin" val="33.4%" />
        <KpiCell label="Concentration" val="38%" warn />
        <KpiCell label="Asking" val="$8.5M" />
      </div>

      {/* Sections */}
      <Sec n="01" title="Recast walk · reported → SDE" status={showRecast ? "done" : "pending"}>
        {showRecast ? <Recast /> : <Pending label="Yulia is recasting…" />}
      </Sec>

      <Sec n="02" title="Baseline · multi-scenario" status={showBaseline ? "done" : "pending"}>
        {showBaseline ? <Baseline /> : <Pending label="Building baseline range…" />}
      </Sec>

      <Sec n="03" title="Risks &amp; flags" status={showRisks ? "done" : "pending"}>
        {showRisks ? <Risks /> : <Pending label="Scanning for flags…" />}
      </Sec>

      <Sec n="04" title="Suggested next moves">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Run QoE Lite", "Build buyer list", "Model SBA structure", "Draft IOI"].map((s) => (
            <button key={s} style={vp.nextBtn}>
              <span>{s}</span>
              <span style={{ color: "var(--ink-4)" }}>→</span>
            </button>
          ))}
        </div>
      </Sec>
    </div>
  );
}

function KpiCell({ label, val, accent, warn, dim }: { label: string; val: string; accent?: boolean; warn?: boolean; dim?: boolean }) {
  return (
    <div style={vp.kpiCell}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div className="mono" style={{
        fontFamily: "var(--font-display)",
        fontSize: 22, fontWeight: 600,
        letterSpacing: "-0.02em",
        color: dim ? "var(--ink-4)" : accent ? "var(--go)" : warn ? "var(--warn)" : "var(--ink)",
        marginTop: 4,
        fontVariantNumeric: "tabular-nums",
      }}>
        {dim ? "—" : val}
      </div>
    </div>
  );
}

function Sec({ n, title, status, children }: { n: string; title: string; status?: "pending" | "done"; children: ReactNode }) {
  return (
    <section style={vp.sec}>
      <div style={vp.secHead}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.1em" }}>§{n}</span>
          <h3 className="eyebrow" style={{ fontSize: 11, color: "var(--ink)", margin: 0, letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
        {status === "pending" && (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={vp.spinner} />
            <span className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)" }}>working</span>
          </span>
        )}
        {status === "done" && (
          <span className="eyebrow eyebrow-go" style={{ fontSize: 9 }}>✓ done</span>
        )}
      </div>
      <div style={vp.secBody}>{children}</div>
    </section>
  );
}

function Pending({ label }: { label: string }) {
  return (
    <div style={vp.pending}>
      <span style={vp.spinner} />
      <span className="eyebrow" style={{ fontSize: 10, color: "var(--ink-3)" }}>{label}</span>
    </div>
  );
}

type RecastRow = [label: string, a: string, b: string, sub?: boolean, primary?: boolean];

function Recast() {
  const rows: RecastRow[] = [
    ["Reported pre-tax income", "612", "—"],
    ["+ Owner comp above market", "—", "+184"],
    ["+ Personal vehicle", "—", "+38"],
    ["+ Legal settlement (one-time)", "—", "+62"],
    ["+ Family payroll (non-working)", "—", "+104"],
    ["+ Owner health, country club", "—", "+62"],
    ["= Owner SDE", "—", "1,062", true],
    ["+ Depreciation / amort", "—", "+438"],
    ["+ Interest", "—", "+300"],
    ["= Normalized SDE", "—", "1,800", true, true],
  ];
  return (
    <div className="fade-up" style={vp.recastTable}>
      {rows.map((r, i) => {
        const [label, a, b, sub, primary] = r;
        return (
          <div key={i} className="mono" style={{
            display: "grid", gridTemplateColumns: "1fr 70px 90px",
            padding: "7px 12px",
            borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
            fontSize: 12,
            background: primary ? "var(--go-soft)" : sub ? "var(--surface-2)" : "transparent",
            color: primary ? "var(--go)" : sub ? "var(--ink)" : "var(--ink-2)",
            fontWeight: sub ? 600 : 400,
            fontVariantNumeric: "tabular-nums",
          }}>
            <span style={{ fontFamily: "var(--font-body)" }}>{label}</span>
            <span style={{ textAlign: "right", color: "var(--ink-4)" }}>{a}</span>
            <span style={{ textAlign: "right" }}>{b}</span>
          </div>
        );
      })}
    </div>
  );
}

function Baseline() {
  return (
    <div className="fade-up">
      <div style={vp.baseRow}>
        <span className="eyebrow" style={{ fontSize: 9, width: 100 }}>SBA · 7.0×</span>
        <div style={vp.bar}>
          <div style={{ ...vp.barFill, width: "55%", background: "var(--go)" }} />
          <span className="mono" style={{ ...vp.barLabel, left: "calc(55% + 8px)" }}>$7.8M</span>
        </div>
      </div>
      <div style={vp.baseRow}>
        <span className="eyebrow" style={{ fontSize: 9, width: 100 }}>STRATEGIC · 8.5×</span>
        <div style={vp.bar}>
          <div style={{ ...vp.barFill, width: "70%", background: "var(--info)" }} />
          <span className="mono" style={{ ...vp.barLabel, left: "calc(70% + 8px)", color: "var(--info)" }}>$9.4M</span>
        </div>
      </div>
      <div style={vp.baseRow}>
        <span className="eyebrow" style={{ fontSize: 9, width: 100 }}>SELLER ASK</span>
        <div style={vp.bar}>
          <div style={{ ...vp.barFill, width: "62%", background: "var(--warn)", opacity: 0.6 }} />
          <span className="mono" style={{ ...vp.barLabel, left: "calc(62% + 8px)", color: "var(--warn)" }}>$8.5M</span>
        </div>
      </div>
      <div style={vp.baseRow}>
        <span className="eyebrow" style={{ fontSize: 9, width: 100 }}>ASSET DEAL Δ</span>
        <div style={vp.bar}>
          <div style={{ ...vp.barFill, width: "8%", background: "var(--go)" }} />
          <span className="mono" style={{ ...vp.barLabel, left: "calc(8% + 8px)", color: "var(--go)" }}>+$340K after-tax</span>
        </div>
      </div>
      <div style={{ marginTop: 14, padding: 10, background: "var(--surface-2)", border: "1px dashed var(--line-2)", borderRadius: 6 }}>
        <span className="eyebrow eyebrow-go" style={{ fontSize: 9 }}>YULIA · NOTE</span>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 5, lineHeight: 1.55 }}>
          Asking is reasonable but soft. SBA-clear at $7.8M leaves room. Lead with $7.4M IOI, structure as asset deal, hold $250K seller note for working capital adjustment risk.
        </div>
      </div>
    </div>
  );
}

type Severity = "moderate" | "low" | "clean";

function Risks() {
  const flags: { sev: Severity; label: string; note: string }[] = [
    { sev: "moderate", label: "Customer concentration", note: "38% top-5 — but 6yr zero-churn. Read as moat." },
    { sev: "low", label: "NWC peg", note: "Below median for category. Flag for QoE diligence." },
    { sev: "low", label: "Owner key-person", note: "Manager bench is thin. Earnout or seller note recommended." },
    { sev: "clean", label: "Customer contracts", note: "All assignable. No CoC restrictions." },
    { sev: "clean", label: "Environmental", note: "Phase I clean. No regulated discharge." },
  ];
  const sevColor: Record<Severity, string> = {
    moderate: "var(--warn)",
    low: "var(--info)",
    clean: "var(--go)",
  };
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {flags.map((f, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 2fr",
          gap: 12,
          padding: "10px 12px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderLeft: `3px solid ${sevColor[f.sev]}`,
          borderRadius: 4,
          alignItems: "center",
        }}>
          <span className="mono" style={{ fontSize: 9.5, color: sevColor[f.sev], textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            {f.sev}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>{f.label}</span>
          <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{f.note}</span>
        </div>
      ))}
    </div>
  );
}

const vp: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--surface)",
    display: "flex", flexDirection: "column",
    minHeight: 0,
  },
  head: {
    height: 32, flexShrink: 0,
    padding: "0 14px",
    borderBottom: "1px solid var(--line)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "var(--panel)",
  },
  headBtn: {
    all: "unset", padding: "3px 8px",
    border: "1px solid var(--line-2)", borderRadius: 4,
    background: "var(--surface)",
    fontSize: 11, color: "var(--ink-2)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 4,
  },
  body: { flex: 1, overflowY: "auto" },
  foot: {
    height: 24, flexShrink: 0,
    padding: "0 14px",
    borderTop: "1px solid var(--line)",
    background: "var(--panel)",
    display: "flex", alignItems: "center", gap: 10,
    color: "var(--ink-3)",
  },

  empty: {
    height: "100%", display: "grid", placeItems: "center",
    padding: 40,
  },
  emptyInner: {
    display: "flex", flexDirection: "column", alignItems: "center",
  },

  docInner: { padding: "24px 32px 40px" },
  docTitle: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    paddingBottom: 18,
  },
  verdictBox: {
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
  },
  verdictTag: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
    letterSpacing: "0.12em",
    background: "var(--go)", color: "#FFFFFF",
    padding: "5px 14px", borderRadius: 4,
  },
  kpis: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
    gap: 0,
    padding: "12px 0",
    borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
  },
  kpiCell: { padding: "4px 16px 4px 0", borderRight: "1px dotted var(--line)" },

  sec: { marginTop: 24 },
  secHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 10, paddingBottom: 8,
    borderBottom: "1px solid var(--line)",
  },
  secBody: {},

  pending: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "16px 12px",
    background: "var(--surface-2)",
    border: "1px dashed var(--line-2)",
    borderRadius: 6,
  },
  spinner: {
    width: 10, height: 10,
    border: "1.5px solid var(--line-2)",
    borderTopColor: "var(--go)",
    borderRadius: 999,
    display: "inline-block",
    animation: "spin 700ms linear infinite",
  },

  recastTable: {
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    overflow: "hidden",
  },

  baseRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "8px 0",
  },
  bar: {
    flex: 1, height: 24, position: "relative",
    background: "var(--bg)", border: "1px solid var(--line)",
    borderRadius: 3,
  },
  barFill: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    background: "var(--go)",
  },
  barLabel: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    fontSize: 10.5, color: "var(--ink-2)",
    whiteSpace: "nowrap",
  },

  nextBtn: {
    all: "unset", padding: "7px 13px",
    background: "var(--surface-2)", border: "1px solid var(--line-2)",
    borderRadius: 5, fontSize: 12, color: "var(--ink)",
    display: "inline-flex", alignItems: "center", gap: 8,
    cursor: "pointer",
  },
};
