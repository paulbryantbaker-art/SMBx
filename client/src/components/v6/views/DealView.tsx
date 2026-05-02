import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "../modes/cards";
import type { OpenTab, TabKind } from "../types";

interface Stat { k: string; v: string; sub: string }

const STATS: Stat[] = [
  { k: "Revenue",   v: "$5.4M",  sub: "TTM" },
  { k: "SDE",       v: "$1.80M", sub: "33% margin" },
  { k: "Asking",    v: "$12.6M", sub: "7.0× SDE" },
  { k: "EBITDA",    v: "$1.45M", sub: "Recast" },
  { k: "Customers", v: "47",     sub: "Top 3 = 38%" },
];

interface LinkedFile {
  kind: TabKind;
  title: string;
  status: DocStatusKind;
  sub: string;
}

const LINKED: LinkedFile[] = [
  { kind: "doc",      title: "LOI v3",          status: "draft", sub: "Last edited 3 days ago" },
  { kind: "doc",      title: "QoE Lite report", status: "live",  sub: "Auto-updated last night" },
  { kind: "analysis", title: "Recast P&L",      status: "live",  sub: "5 add-backs surfaced" },
  { kind: "analysis", title: "Comps · 7 deals", status: "saved", sub: "Range: 5.8× — 7.2×" },
  { kind: "analysis", title: "Buyer fit",       status: "live",  sub: "92 against your thesis" },
  { kind: "doc",      title: "Memo v2",         status: "draft", sub: "Awaiting your read" },
];

export function V6DealView({ title, openTab }: { title: string; openTab: OpenTab }) {
  return (
    <div className="m-fade-up" style={{ maxWidth: 1180 }}>
      {/* Hero strip */}
      <section style={{ marginBottom: 28 }}>
        <div className="mono" style={D.eyebrow}>DEAL · UPDATED 12 MIN AGO</div>
        <div style={D.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={D.h1}>{title}</h1>
            <div style={D.sub}>$5.4M revenue · East Texas · industrial services rollup target</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined">Export</button>
            <button className="m-btn outlined">Share</button>
            <button className="m-btn filled">Draft IOI</button>
          </div>
        </div>
      </section>

      {/* Verdict banner */}
      <section style={{ marginBottom: 32 }}>
        <div className="m-card" style={D.verdict}>
          <div style={D.verdictMark} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 11l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={D.verdictEyebrow}>VERDICT · PURSUE</div>
            <div style={D.verdictText}>
              Recurring revenue, honest add-backs. The concentration reads as a moat, not a risk.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={D.fitNumber}>92</div>
            <div className="mono" style={D.fitLabel}>FIT</div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {STATS.map(s => (
            <div key={s.k} className="m-card" style={{ padding: "14px 18px" }}>
              <div className="mono" style={D.statLabel}>{s.k.toUpperCase()}</div>
              <div className="mono" style={D.statValue}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <V6Section eyebrow="LINKED WORK" title="Files Yulia produced" sub="Click any to open in a new tab.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {LINKED.map(f => (
            <div
              key={f.title}
              className="m-card m-state tap"
              role="button"
              tabIndex={0}
              aria-label={`${f.title} (${f.status})`}
              onClick={() => openTab({ kind: f.kind, title: `${title} · ${f.title}` })}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: f.kind, title: `${title} · ${f.title}` }); } }}
              style={{ padding: "14px 16px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <V6Icon name={f.kind === "doc" ? "doc" : "chart"} size={14} />
                <V6DocStatus status={f.status} />
              </div>
              <div style={D.linkedTitle}>{f.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="YULIA'S READ" title="Why pursue">
        <div className="m-card" style={{ padding: "24px 28px" }}>
          <div style={D.readBody}>
            <p style={{ margin: "0 0 14px" }}>
              The recurring revenue holds up. <strong style={{ color: "var(--m-on-surface)" }}>78% of revenue</strong> comes from monthly service contracts averaging 4.3 years tenure. Add-backs are unusually honest &mdash; owner&rsquo;s salary, family member on payroll, and a one-time legal expense from a 2023 dispute. None of the AI-flag stuff (boats, &ldquo;consulting&rdquo;, phantom mileage).
            </p>
            <p style={{ margin: "0 0 14px" }}>
              The customer concentration looks like a problem on paper. <strong style={{ color: "var(--m-on-surface)" }}>The top three customers are 38% of revenue.</strong> But two of them are decade-long relationships embedded in their operations &mdash; switching costs are real, not hypothetical. Read it as a moat.
            </p>
            <p style={{ margin: 0 }}>
              At <strong style={{ color: "var(--m-on-surface)" }}>$12.6M asking · 7.0× recast SDE</strong>, you&rsquo;re paying market for a clean operator. SBA-clears at 78% LTV with $200k working capital reserve. I&rsquo;d start at 6.5× and meet at 6.8×.
            </p>
          </div>
        </div>
      </V6Section>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  eyebrow: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6,
  },
  headerRow: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20,
  },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36,
    letterSpacing: "-0.025em", margin: 0, color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  sub: { fontSize: 14, color: "var(--m-on-surface-var)", marginTop: 6 },
  verdict: {
    padding: "20px 24px",
    background: "var(--m-pursue-container)",
    color: "var(--m-pursue-on-cont)",
    border: "none",
    display: "flex", alignItems: "center", gap: 24,
  },
  verdictMark: {
    width: 48, height: 48, borderRadius: 12,
    background: "var(--m-pursue)", color: "#fff",
    display: "grid", placeItems: "center", flexShrink: 0,
  },
  verdictEyebrow: { fontSize: 10, letterSpacing: "0.14em", fontWeight: 700, opacity: 0.7 },
  verdictText: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
    letterSpacing: "-0.02em", marginTop: 2, textWrap: "pretty",
  },
  fitNumber: {
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 28,
    letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums",
  },
  fitLabel: { fontSize: 10, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 },
  statLabel: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  statValue: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
    letterSpacing: "-0.02em", color: "var(--m-on-surface)",
    marginTop: 4, fontVariantNumeric: "tabular-nums",
  },
  linkedTitle: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
    letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 12,
  },
  readBody: {
    fontSize: 14.5, lineHeight: 1.65,
    color: "var(--m-on-surface-var)", textWrap: "pretty",
  },
};
