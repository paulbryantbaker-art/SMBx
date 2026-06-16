/* ============================================================================
   DealBrief.tsx — the DEAL BRIEF surface, maintained live by Yulia.
   Faithful port of Test 33 / source/workspaces.jsx (WorkAnalysis → DealBrief,
   WorkSourcing → WorkSourcing). Chat-left / canvas-right is the deal workspace;
   this is the canvas. Numbered sections: investment thesis (prose + an
   "Open model" agent note), valuation KPIs + an honest-empty football field,
   and key risks ranked by severity.

   PRESENTATIONAL ONLY — all data arrives via typed props; the integration layer
   wires real data and callbacks later. Honest-empty states (KPI "—" / the
   football-field "No live feed yet") are preserved by design. THE LINE:
   outward/mutating actions render a StagedConfirm — never a bare "send".
   Styling lives in nd.css (.mck-* under .nd-root). Primitives from ../primitives,
   chrome from ../chrome.
   ============================================================================ */
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Ic,
  YuliaMark,
  Avatar,
  Mono,
  Dot,
  Chip,
  Btn,
  IconBtn,
  StatusPill,
  SeverityPill,
} from "../primitives";
import type { AvatarPerson, PillTone } from "../primitives";
import { TopBar, EmptyChart, StagedConfirm } from "../chrome";

/* ---- Prop data shapes (derived from the design's data arrays) ---- */
export interface KpiItem {
  label: string;
  /** Display value; use "—" (or set empty) for honest-empty cells. */
  value: string;
  /** Render the value in muted ink (honest-empty, e.g. Synergy NPV not yet computed). */
  empty?: boolean;
}

export interface RiskItem {
  name: string;
  /** One-line evidence/explanation, e.g. "Top 2 accounts = 38% of FY24 revenue." */
  evidence: string;
  /** Severity label — High → risk, Medium → warn, Low → ok. */
  severity: string;
}

export type DealBriefTab = "Deal brief" | "Financials" | "Diligence" | "Data room";

/** A concrete next step Yulia surfaces for this deal (the deal-level guidance). */
export interface NextMoveItem { title: string; sub?: string; cta?: string; prompt?: string }

export interface DealBriefProps {
  /* deal identity (passed straight through to TopBar) */
  name?: string;
  target?: string;
  side?: string;
  journey?: string;
  stageActive?: string;
  team?: AvatarPerson[];

  /* tab state */
  tab?: DealBriefTab;
  onTab?: (tab: DealBriefTab) => void;

  /* "maintained by Yulia" freshness line */
  updatedLabel?: string;

  /* 00 — what this deal needs from you (leads the brief; the next moves) */
  nextMoves?: NextMoveItem[];
  onMove?: (m: NextMoveItem) => void;

  /* 01 — investment thesis */
  thesis?: ReactNode;
  thesisNote?: ReactNode;
  onOpenModel?: () => void;
  onRerunThesis?: () => void;

  /* 02 — valuation */
  kpis?: KpiItem[];
  /** Football-field range data is intentionally honest-empty until a comps source connects. */
  footballField?: ReactNode;
  onAdjustAssumptions?: () => void;

  /* 03 — key risks */
  risks?: RiskItem[];
  onRescanDataRoom?: () => void;

  /** When embedded in a host workspace that owns the TopBar + tab bar, skip our own. */
  chromeless?: boolean;
}

/* ---- local atoms (ported from workspaces.jsx) ---- */
function AgentNote({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="mck-row" style={{ gap: 11, alignItems: "flex-start", padding: "13px 15px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 11 }}>
      <YuliaMark size={22} />
      <span className="mck-grow" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--accent-ink)" }}>{children}</span>
      {action && <button className="mck-btn mck-btn-ink mck-btn-sm" style={{ flex: "0 0 auto" }} onClick={onAction}>{action}<Ic name="arrowRight" size={12} /></button>}
    </div>
  );
}

function SectionHead({ title, n, action, onAction }: { title: string; n: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
      <span className="mck-eyebrow">{n}</span>
      <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>{title}</h2>
      <div className="mck-grow" />
      {action && <Btn variant="quiet" size="sm" icon="agent" onClick={onAction}>{action}</Btn>}
    </div>
  );
}

/* ---- defaults: HONEST-EMPTY (never fabricated). The integrator passes real
   values; if a slot is unprovided we show "—"/empty rather than plausible
   filler. Honesty law (CLAUDE.md #9): every value is real or honestly empty. ---- */
const KPIS_DEFAULT: KpiItem[] = [
  { label: "Enterprise value", value: "—", empty: true },
  { label: "EV / EBITDA", value: "—", empty: true },
  { label: "Synergy NPV", value: "—", empty: true },
  { label: "Implied IRR", value: "—", empty: true },
];

const RISKS_DEFAULT: RiskItem[] = [];

const TABS: { label: DealBriefTab; ic: string }[] = [
  { label: "Deal brief", ic: "doc" },
  { label: "Financials", ic: "bars" },
  { label: "Diligence", ic: "list" },
  { label: "Data room", ic: "grid" },
];

export function DealBrief({
  name = "Project Atlas",
  target = "Northwind Logistics",
  side = "buy-side",
  journey = "BUY",
  stageActive = "Valuation",
  team,
  tab = "Deal brief",
  onTab,
  updatedLabel = "Maintained by Yulia · updated 4m ago",
  thesis,
  thesisNote,
  onOpenModel,
  onRerunThesis,
  kpis = KPIS_DEFAULT,
  footballField,
  onAdjustAssumptions,
  risks = RISKS_DEFAULT,
  onRescanDataRoom,
  nextMoves = [],
  onMove,
  chromeless = false,
}: DealBriefProps) {
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      {!chromeless && <TopBar deal={name} target={target} side={side} journey={journey} stageActive={stageActive} team={team} />}
      {!chromeless && (
        <div className="mck-row" style={{ gap: 4, padding: "8px 22px", borderBottom: "1px solid var(--line)" }}>
          {TABS.map((t) => (
            <span key={t.label} className={"mck-tab" + (tab === t.label ? " is-active" : "")} onClick={() => onTab && onTab(t.label)} style={{ cursor: "pointer" }}>
              <Ic name={t.ic} size={14} />{t.label}
            </span>
          ))}
          <div className="mck-grow" />
          <span className="mck-row" style={{ gap: 7, fontSize: 11.5, color: "var(--ink-3)" }}>
            <Dot tone="accent" pulse /> {updatedLabel}
          </span>
        </div>
      )}

      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "34px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 34px", display: "flex", flexDirection: "column", gap: 34 }}>
          {/* 00 — what this deal needs from you: the next moves lead the brief, so the
               workspace opens on "do this next", not a wall of analysis. */}
          {nextMoves.length > 0 && (
            <div className="mck-card" style={{ padding: 0, overflow: "hidden", borderColor: "var(--accent-line)" }}>
              <div className="mck-row" style={{ gap: 10, padding: "12px 16px", background: "var(--accent-soft)", borderBottom: "1px solid var(--accent-line)" }}>
                <YuliaMark size={20} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--accent-ink)" }}>What this deal needs from you</span>
                <span className="mck-grow" />
                <span className="mck-pill mck-pill-yulia" style={{ fontSize: 10 }}>{nextMoves.length}</span>
              </div>
              {nextMoves.map((m, i) => (
                <button key={i} className="mck-row" onClick={() => onMove && onMove(m)}
                  style={{ width: "100%", textAlign: "left", gap: 12, padding: "13px 16px", borderTop: i ? "1px solid var(--line-2)" : "none", background: "none", cursor: "pointer", alignItems: "flex-start" }}>
                  <span className="mck-task-ic" style={{ marginTop: 1, flex: "0 0 auto" }}><Ic name="arrowRight" size={13} /></span>
                  <span className="mck-col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.title}</span>
                    {m.sub && <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{m.sub}</span>}
                  </span>
                  <span className="mck-btn mck-btn-ghost mck-btn-sm" style={{ flex: "0 0 auto" }}>{m.cta || "Do this"}<Ic name="chevRight" size={12} /></span>
                </button>
              ))}
            </div>
          )}
          <section>
            <SectionHead n="01" title="Investment thesis" action="Re-run" onAction={onRerunThesis} />
            {thesis ? (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 16px" }}>{thesis}</p>
            ) : (
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-3)", margin: "0 0 16px" }}>
                Yulia hasn't written an investment thesis for this deal yet. Ask her to build one and she'll maintain it
                live here — with the supporting model and risks alongside.
              </p>
            )}
            {/* The accent "Yulia note" only renders for REAL synthesis — never fabricated returns. */}
            {thesisNote && (
              <AgentNote action="Open model" onAction={onOpenModel}>{thesisNote}</AgentNote>
            )}
          </section>

          <section>
            <SectionHead n="02" title="Valuation" action="Adjust assumptions" onAction={onAdjustAssumptions} />
            <div className="mck-row" style={{ gap: 13, marginBottom: 16 }}>
              {kpis.map((k) => (
                <div key={k.label} className="mck-card mck-grow" style={{ padding: "13px 15px" }}>
                  <div className="mck-kv">
                    <span className="mck-kv-k">{k.label}</span>
                    <span className="mck-kv-v mck-tnum" style={k.empty || k.value === "—" ? { color: "var(--ink-4)" } : undefined}>{k.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mck-card" style={{ padding: 18 }}>
              <div className="mck-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Football field — implied EV range</span>
                <span className="mck-eyebrow">$M</span>
              </div>
              {footballField ?? (
                <EmptyChart icon="bars" title="No live feed yet"
                  sub="Connect the comps & precedent-transactions source and Yulia will plot the valuation range here." />
              )}
            </div>
          </section>

          <section>
            <SectionHead n="03" title="Key risks" action="Re-scan data room" onAction={onRescanDataRoom} />
            {risks.length === 0 && (
              <EmptyChart icon="target" h={120} title="No risks flagged yet"
                sub="Yulia surfaces risks as she reads the data room. Ask her to re-scan, or upload documents to begin." />
            )}
            <div className="mck-col" style={{ gap: 8 }}>
              {risks.map((r) => (
                <div key={r.name} className="mck-card mck-row" style={{ gap: 14, padding: "14px 16px", alignItems: "flex-start" }}>
                  <span className="mck-task-ic" style={{ marginTop: 1 }}><Ic name="target" size={13} /></span>
                  <span className="mck-col" style={{ gap: 3 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{r.evidence}</span>
                  </span>
                  <span style={{ marginLeft: "auto" }}><SeverityPill level={r.severity} /></span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ SOURCING */
/* ---- Prop data shapes ---- */
export interface SourcingTarget {
  name: string;
  /** Avatar initials/label, e.g. "PL". */
  avatar: string;
  /** Avatar tone key (a|b|c|d). */
  tone?: string;
  location: string;
  revenue: string;
  /** EBITDA; use "—" for honest-empty. */
  ebitda: string;
  ownerSignal: string;
  /** Fit score 0–100. */
  fit: number;
  /** Status label, e.g. "Outreach sent". */
  status: string;
  /** Status pill tone. */
  statusTone: PillTone;
}

export interface SourcingFilter {
  label: string;
  icon?: string;
  active?: boolean;
}

export interface WorkSourcingProps {
  /* header */
  mandateLabel?: string;
  onCriteria?: () => void;
  onSourceMore?: () => void;

  /* Yulia outreach banner — confirm-first (THE LINE) */
  screenedLabel?: ReactNode;
  doneLabel?: ReactNode;
  /** Controlled staged-confirm status: idle (banner) | open (StagedConfirm) | done (sent). */
  confirm?: "idle" | "open" | "done";
  onDraftOutreach?: () => void;
  onDismissOutreach?: () => void;
  onConfirmOutreach?: () => void;
  onCancelOutreach?: () => void;
  /** Lines shown inside the StagedConfirm. */
  outreachLines?: { k: ReactNode; v: ReactNode }[];

  /* toolbar */
  targetCount?: number;
  filters?: SourcingFilter[];
  sortLabel?: string;

  /* table */
  targets?: SourcingTarget[];
  onOpenTarget?: (target: SourcingTarget) => void;
}

const TARGETS_DEFAULT: SourcingTarget[] = [
  { name: "Polar Lane Cold Chain", avatar: "PL", tone: "a", location: "Columbus, OH", revenue: "$62M", ebitda: "$11.4M", ownerSignal: "Founder, 64 · exploring", fit: 94, status: "Outreach sent", statusTone: "yulia" },
  { name: "Tundra Freightways", avatar: "TF", tone: "c", location: "Calgary, AB", revenue: "$48M", ebitda: "$8.1M", ownerSignal: "Founder, 59 · warm intro", fit: 89, status: "Qualified", statusTone: "ok" },
  { name: "Glacier Yard Logistics", avatar: "GY", tone: "c", location: "Reno, NV", revenue: "$31M", ebitda: "$5.6M", ownerSignal: "PE-backed · process", fit: 86, status: "Flagged", statusTone: "risk" },
  { name: "Arctic Route Carriers", avatar: "AR", tone: "d", location: "Fargo, ND", revenue: "$44M", ebitda: "$7.2M", ownerSignal: "Family-owned", fit: 82, status: "Qualified", statusTone: "ok" },
  { name: "Frostline Distribution", avatar: "FD", tone: "c", location: "Boise, ID", revenue: "$27M", ebitda: "—", ownerSignal: "Founder, 61 · exploring", fit: 79, status: "New", statusTone: "neutral" },
  { name: "NorthPole Freight Co.", avatar: "NP", tone: "d", location: "Duluth, MN", revenue: "$38M", ebitda: "$6.0M", ownerSignal: "Founder, 57", fit: 74, status: "New", statusTone: "neutral" },
  { name: "Cryo Cartage Group", avatar: "CC", tone: "d", location: "Omaha, NE", revenue: "$22M", ebitda: "$3.8M", ownerSignal: "Family-owned", fit: 71, status: "Screening", statusTone: "neutral" },
];

const FILTERS_DEFAULT: SourcingFilter[] = [
  { label: "Cold-chain", icon: "check", active: true },
  { label: "$20–80M rev", active: true },
  { label: "Founder-owned", active: true },
  { label: "EBITDA+", active: true },
];

const OUTREACH_LINES_DEFAULT = [
  { k: "Action", v: "Email 8 founder-owned cold-chain targets, personalized" },
  { k: "From", v: "dana@greenhill.com" },
  { k: "Attached", v: "Teaser only — no confidential deal terms" },
];

export function WorkSourcing({
  mandateLabel = "Cold-chain mandate · Northwind",
  onCriteria,
  onSourceMore,
  screenedLabel,
  doneLabel,
  confirm = "idle",
  onDraftOutreach,
  onDismissOutreach,
  onConfirmOutreach,
  onCancelOutreach,
  outreachLines = OUTREACH_LINES_DEFAULT,
  targetCount = 23,
  filters = FILTERS_DEFAULT,
  sortLabel = "Sort · Fit score",
  targets = TARGETS_DEFAULT,
  onOpenTarget,
}: WorkSourcingProps) {
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 13, height: 54, flex: "0 0 54px", padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
        <Ic name="st_source" size={17} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Sourcing</span>
        <Chip icon="chevUpDown">{mandateLabel}</Chip>
        <div className="mck-grow" />
        <Btn variant="ghost" size="sm" icon="sliders" onClick={onCriteria}>Criteria</Btn>
        <Btn variant="ink" size="sm" icon="agent" onClick={onSourceMore}>Source more</Btn>
      </div>

      {/* Yulia banner — confirm-first outreach (THE LINE) */}
      {confirm !== "open" ? (
        <div className="mck-row" style={{ gap: 12, padding: "12px 24px", background: "var(--accent-soft)", borderBottom: "1px solid var(--accent-line)" }}>
          <YuliaMark size={24} />
          <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>
            {confirm === "done"
              ? (doneLabel ?? <>Outreach sent to <b>8 targets</b>. I'll surface replies here as they land.</>)
              : (screenedLabel ?? <>I screened <b>4,210 companies</b> and ranked <b>23 matches</b>. 8 are ready for outreach — want me to draft personalized notes?</>)}
          </span>
          {confirm !== "done" && (
            <div className="mck-row" style={{ gap: 8, marginLeft: "auto" }}>
              <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={onDismissOutreach}>Dismiss</button>
              <button className="mck-btn mck-btn-ink mck-btn-sm" onClick={onDraftOutreach}>Draft outreach to top 8</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
          <StagedConfirm
            title="Send outreach to top 8 targets"
            kv={outreachLines}
            note="Outward-facing — Yulia drafts but never contacts counterparties until you confirm."
            confirmLabel="Send 8"
            onConfirm={onConfirmOutreach}
            onCancel={onCancelOutreach}
          />
        </div>
      )}

      {/* toolbar */}
      <div className="mck-row" style={{ gap: 9, padding: "11px 24px", borderBottom: "1px solid var(--line)" }}>
        <span className="mck-row" style={{ gap: 7, fontSize: 12.5, color: "var(--ink-2)" }}>
          <b style={{ color: "var(--ink)" }}>{targetCount}</b> targets
        </span>
        <span style={{ color: "var(--line)" }}>|</span>
        {filters.map((f) => (
          <Chip key={f.label} icon={f.icon} active={f.active}>{f.label}</Chip>
        ))}
        <Chip icon="plus">Add filter</Chip>
        <div className="mck-grow" />
        <Chip icon="chevUpDown">{sortLabel}</Chip>
        <span className="mck-row" style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
          <span className="mck-iconbtn" style={{ borderRadius: 0, background: "var(--surface-2)", color: "var(--ink)" }}><Ic name="list" size={15} /></span>
          <span className="mck-iconbtn" style={{ borderRadius: 0 }}><Ic name="grid" size={15} /></span>
        </span>
      </div>

      {/* table */}
      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "6px 14px" }}>
        <table className="mck-tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 14 }}>Company</th>
              <th>Location</th>
              <th>Revenue</th>
              <th>EBITDA</th>
              <th>Owner signal</th>
              <th>Fit</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.name} onClick={onOpenTarget ? () => onOpenTarget(t) : undefined} style={onOpenTarget ? { cursor: "pointer" } : undefined}>
                <td style={{ paddingLeft: 14 }}>
                  <div className="mck-row" style={{ gap: 11 }}>
                    <Avatar name={t.avatar} tone={t.tone} size={28} />
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--ink-2)" }}>{t.location}</td>
                <td><Mono className="mck-tnum">{t.revenue}</Mono></td>
                <td><Mono className="mck-tnum" style={{ color: t.ebitda === "—" ? "var(--ink-4)" : "var(--ink-2)" }}>{t.ebitda}</Mono></td>
                <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{t.ownerSignal}</td>
                <td>
                  <div className="mck-row" style={{ gap: 9 }}>
                    <Mono className="mck-tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{t.fit}</Mono>
                    <span className="mck-meter"><span style={{ width: t.fit + "%" }} /></span>
                  </div>
                </td>
                <td><StatusPill tone={t.statusTone} dot={t.statusTone !== "neutral"}>{t.status}</StatusPill></td>
                <td style={{ width: 40 }}><IconBtn name="more" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
