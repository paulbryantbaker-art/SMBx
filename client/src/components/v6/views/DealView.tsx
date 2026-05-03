import { useEffect, useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "../modes/cards";
import type { OpenTab, TabKind } from "../types";
import { authHeaders } from "../../../hooks/useAuth";

interface Stat { k: string; v: string; sub: string }
interface LinkedFile {
  kind: TabKind;
  title: string;
  status: DocStatusKind;
  sub: string;
  id?: string;
}

/* ─── Sample fallbacks (used when no numeric deal id is in scope) ─── */

const SAMPLE_STATS: Stat[] = [
  { k: "Revenue",   v: "$5.4M",  sub: "TTM" },
  { k: "SDE",       v: "$1.80M", sub: "33% margin" },
  { k: "Asking",    v: "$12.6M", sub: "7.0× SDE" },
  { k: "EBITDA",    v: "$1.45M", sub: "Recast" },
  { k: "Customers", v: "47",     sub: "Top 3 = 38%" },
];

const SAMPLE_LINKED: LinkedFile[] = [
  { kind: "doc",      title: "LOI v3",          status: "draft", sub: "Last edited 3 days ago" },
  { kind: "doc",      title: "QoE Lite report", status: "live",  sub: "Auto-updated last night" },
  { kind: "analysis", title: "Recast P&L",      status: "live",  sub: "5 add-backs surfaced" },
  { kind: "analysis", title: "Comps · 7 deals", status: "saved", sub: "Range: 5.8× — 7.2×" },
  { kind: "analysis", title: "Buyer fit",       status: "live",  sub: "92 against your thesis" },
  { kind: "doc",      title: "Memo v2",         status: "draft", sub: "Awaiting your read" },
];

/* ─── Server response shapes ─── */

interface DealRow {
  id: number;
  business_name: string | null;
  industry: string | null;
  location: string | null;
  league: string | null;
  current_gate: string;
  status: string;
  journey_type: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, any> | null;
  updated_at: string;
  created_at: string;
}

interface DealDetailResp {
  deal: DealRow;
  gates: { gate: string; status: string; completed_at: string | null }[];
  events: { from_gate: string; to_gate: string; event_type: string; created_at: string }[];
  velocity: Record<string, number>;
  deliverableStats: { total: number; completed: number; in_progress: number };
}

interface DeliverableRow {
  id: number;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  menu_item_name?: string;
}

export function V6DealView({ id, title, openTab }: { id: string; title: string; openTab: OpenTab }) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
  const [data, setData] = useState<DealDetailResp | null>(null);
  const [linked, setLinked] = useState<DeliverableRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (numericId === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/deals/${numericId}`,            { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`deal ${r.status}`))),
      fetch(`/api/deals/${numericId}/deliverables`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
    ])
      .then(([detail, dels]) => {
        if (cancelled) return;
        setData(detail as DealDetailResp);
        setLinked(Array.isArray(dels) ? dels : []);
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [numericId]);

  // ─── Derive display data ──────────────────────────────────────────
  const real = data?.deal;
  const stats: Stat[] = real ? buildStats(real) : SAMPLE_STATS;
  const linkedFiles: LinkedFile[] = linked && linked.length > 0
    ? linked.map(deliverableToLinkedFile)
    : SAMPLE_LINKED;

  const heroSub = real
    ? [
        real.revenue ? `${fmtCents(real.revenue)} revenue` : null,
        real.location || null,
        real.industry || null,
      ].filter(Boolean).join(" · ")
    : "$5.4M revenue · East Texas · industrial services rollup target";

  const heroEyebrow = real
    ? `${real.journey_type.toUpperCase()} · ${real.league ?? "—"} · GATE ${real.current_gate}${real.status !== "active" ? ` · ${real.status.toUpperCase()}` : ""}`
    : "DEAL · UPDATED 12 MIN AGO";

  const verdict = real ? deriveVerdict(real) : { kind: "pursue" as const, eyebrow: "VERDICT · PURSUE", text: "Recurring revenue, honest add-backs. The concentration reads as a moat, not a risk.", fit: 92 };
  const yulia = real ? deriveYuliaRead(real) : null;

  return (
    <div className="m-fade-up" style={{ maxWidth: 1180 }}>
      {/* Hero strip */}
      <section style={{ marginBottom: 28 }}>
        <div className="mono" style={D.eyebrow}>{heroEyebrow}</div>
        <div style={D.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={D.h1}>{real?.business_name || title}</h1>
            <div style={D.sub}>{heroSub}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined" type="button">Export</button>
            <button className="m-btn outlined" type="button">Share</button>
            <button className="m-btn filled" type="button">Draft IOI</button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="mono" style={{ fontSize: 11, color: "var(--m-on-surface-mid)", marginBottom: 24 }}>
          LOADING DEAL…
        </div>
      )}
      {error && (
        <div style={{
          padding: "10px 12px", borderRadius: 8, marginBottom: 24,
          background: "var(--m-pass-container)", color: "#4A1410", fontSize: 12.5,
        }}>
          Couldn&rsquo;t load this deal ({error}). Showing reference layout.
        </div>
      )}

      {/* Verdict banner */}
      <section style={{ marginBottom: 32 }}>
        <div className="m-card" style={D.verdict}>
          <div style={D.verdictMark} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 11l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={D.verdictEyebrow}>{verdict.eyebrow}</div>
            <div style={D.verdictText}>{verdict.text}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={D.fitNumber}>{verdict.fit}</div>
            <div className="mono" style={D.fitLabel}>FIT</div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {stats.map(s => (
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
          {linkedFiles.map(f => (
            <div
              key={`${f.title}-${f.id ?? ""}`}
              className="m-card m-state tap"
              role="button"
              tabIndex={0}
              aria-label={`${f.title} (${f.status})`}
              onClick={() => openTab({ kind: f.kind, title: `${real?.business_name || title} · ${f.title}`, id: f.id })}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: f.kind, title: `${real?.business_name || title} · ${f.title}`, id: f.id }); } }}
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

      {yulia && (
        <V6Section eyebrow="YULIA'S READ" title={yulia.title}>
          <div className="m-card" style={{ padding: "24px 28px" }}>
            <div style={D.readBody}>
              {yulia.paragraphs.map((p, i) => (
                <p key={i} style={{ margin: i === yulia.paragraphs.length - 1 ? 0 : "0 0 14px" }}>{p}</p>
              ))}
            </div>
          </div>
        </V6Section>
      )}

      {!yulia && (
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
      )}
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function fmtCents(cents: number | null): string {
  if (!cents) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function buildStats(d: DealRow): Stat[] {
  const margin = d.revenue && d.sde ? `${Math.round((d.sde / d.revenue) * 100)}% margin` : "—";
  const askingMultiple = d.asking_price && d.sde ? `${(d.asking_price / d.sde).toFixed(1)}× SDE` : "—";
  const multiple = (d.financials?.multiple as number | undefined);
  return [
    { k: "Revenue", v: fmtCents(d.revenue),       sub: "TTM" },
    { k: "SDE",     v: fmtCents(d.sde),           sub: margin },
    { k: "Asking",  v: fmtCents(d.asking_price),  sub: askingMultiple },
    { k: "EBITDA",  v: fmtCents(d.ebitda),        sub: multiple ? `${multiple.toFixed(1)}× target` : "Recast" },
    { k: "Gate",    v: d.current_gate,            sub: d.league ?? "—" },
  ];
}

function deriveVerdict(d: DealRow): { kind: "pursue" | "watch" | "pass"; eyebrow: string; text: string; fit: number } {
  // Late-stage active gate → pursue. Stalled → watch. Closed → reference.
  // The note from financials.notes (if any) becomes the verdict text.
  const note = (d.financials?.notes as string | undefined) ||
    (d.status === "closed" ? "Closed reference deal — useful for comps and pattern matching." :
      d.status === "stalled" ? "Stalled mid-process. Yulia recommends a status check before further work." :
      "Active in your pipeline. Open files Yulia has produced for the latest read.");
  const lateActive = /[345]$/.test(d.current_gate) && d.status === "active";
  const stalled = d.status === "stalled";
  const kind: "pursue" | "watch" | "pass" = lateActive ? "pursue" : stalled ? "pass" : "watch";
  const eyebrow = `VERDICT · ${kind.toUpperCase()}`;
  // Fit: late active → 80-92, watch → 65-79, stalled → 40-60.
  const fit = kind === "pursue" ? 88 : kind === "watch" ? 76 : 52;
  return { kind, eyebrow, text: note, fit };
}

function deriveYuliaRead(d: DealRow): { title: string; paragraphs: string[] } | null {
  const note = d.financials?.notes as string | undefined;
  if (!note) return null;
  // Use the seeded note as the first paragraph, append a quantitative summary.
  const summary = [
    d.revenue && d.sde ? `${fmtCents(d.revenue)} revenue at ${fmtCents(d.sde)} SDE` : null,
    d.asking_price ? `asking ${fmtCents(d.asking_price)}` : null,
    d.financials?.multiple ? `roughly ${(d.financials.multiple as number).toFixed(1)}× SDE` : null,
  ].filter(Boolean).join(" · ");
  const paragraphs = [note];
  if (summary) paragraphs.push(`Headline numbers: ${summary}.`);
  return { title: d.status === "closed" ? "Why this is a useful reference" : "Why open this", paragraphs };
}

function deliverableToLinkedFile(d: DeliverableRow): LinkedFile {
  const isAnalysis = /model|valuation|recast|sensitivity|lbo|sba|comp|cap|sde|earnout|covenant|tax/i.test(d.type);
  const status: DocStatusKind = d.status === "complete" ? "live" : d.status === "draft" ? "draft" : "saved";
  return {
    kind: isAnalysis ? "analysis" : "doc",
    title: d.menu_item_name || formatType(d.type),
    status,
    sub: `${formatStatus(d.status)} · ${fmtRelative(d.updated_at)}`,
    id: String(d.id),
  };
}

function formatType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatStatus(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function fmtRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const ms = now - then;
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.round(hr / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch { return ""; }
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
