/* ============================================================================
   chrome.tsx — shared smbx.ai app chrome + Yulia chat + patterns/states (nd).
   Ported faithfully from the agent-first desktop prototype (Test 33 / chrome.jsx).
   Everything the surfaces compose from. Yulia = the agent. THE LINE: Yulia shows
   analysis, options & implications; the user decides. Staged-confirm gates
   anything mutating/outward.

   PRESENTATIONAL ONLY: no data fetching, no network hooks. Data arrives via typed
   props; callbacks via props. The integration layer wires real data later.
   Styling lives in nd.css (.mck-* under .nd-root). Primitives from ./primitives.
   ============================================================================ */
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Ic,
  Logo,
  YuliaMark,
  Avatar,
  AvatarStack,
  Mono,
  Dot,
  Chip,
  Btn,
  IconBtn,
} from "./primitives";
import type { IcName, AvatarPerson } from "./primitives";

/* ---------------- journeys (journey-aware nav) ---------------- */
export const JOURNEYS: Record<string, string[]> = {
  BUY: ["Thesis", "Sourcing", "Valuation", "Diligence", "Structuring", "Closing", "PMI"],
  SELL: ["Intake", "Financials", "Valuation", "Packaging", "Market matching", "Closing"],
  RAISE: ["Intake", "Financial package", "Investor materials", "Outreach", "Terms", "Closing"],
  PMI: ["Day 0", "Stabilization", "Assessment", "Optimization"],
};

/* the BUY lifecycle is the hero example; counts are live items per stage.
   The rail is journey-reactive: it shows PIPELINES[activeJourney]. */
export interface PipelineStage {
  key: string;
  label: string;
  ic: IcName;
  count: number;
}
export const PIPELINE: PipelineStage[] = [
  { key: "sourcing", label: "Sourcing", ic: "st_source", count: 34 },
  { key: "analysis", label: "Analysis", ic: "st_analyze", count: 12 },
  { key: "closing", label: "Closing", ic: "st_close", count: 5 },
  { key: "post", label: "Post-merger", ic: "st_post", count: 3 },
];
export const PIPELINES: Record<string, PipelineStage[]> = {
  BUY: PIPELINE,
  SELL: [
    { key: "intake", label: "Intake", ic: "doc", count: 8 },
    { key: "financials", label: "Financials", ic: "bars", count: 6 },
    { key: "packaging", label: "Packaging", ic: "doc", count: 3 },
    { key: "matching", label: "Market matching", ic: "target", count: 2 },
    { key: "closing", label: "Closing", ic: "st_close", count: 1 },
  ],
  RAISE: [
    { key: "intake", label: "Intake", ic: "doc", count: 5 },
    { key: "package", label: "Financial package", ic: "bars", count: 4 },
    { key: "materials", label: "Investor materials", ic: "doc", count: 3 },
    { key: "outreach", label: "Outreach", ic: "target", count: 6 },
    { key: "terms", label: "Terms", ic: "sliders", count: 2 },
  ],
  PMI: [
    { key: "day0", label: "Day 0", ic: "spark", count: 1 },
    { key: "stabilize", label: "Stabilization", ic: "st_post", count: 4 },
    { key: "assess", label: "Assessment", ic: "bars", count: 2 },
    { key: "optimize", label: "Optimization", ic: "sliders", count: 0 },
  ],
};

export interface DealRef {
  /** real deal id — when present, clicking opens the unified deal workspace */
  id?: string;
  name: string;
  sub: string;
  tone?: string;
  live?: boolean;
  journey: "BUY" | "SELL" | "RAISE" | "PMI" | string;
}
const DEALS_C: DealRef[] = [
  { name: "Project Atlas", sub: "Northwind Logistics", tone: "a", live: true, journey: "BUY" },
  { name: "Project Vela", sub: "Cohere Cold Storage", tone: "c", journey: "SELL" },
  { name: "Project Ember", sub: "Atlas Foods", tone: "d", journey: "RAISE" },
  { name: "Project Harbor", sub: "Delta Cold Co · integrating", tone: "c", journey: "PMI" },
];

/* ---------------- Sidebar (journey-aware) ---------------- */
export interface SidebarUser {
  name: string;
  /** secondary line, e.g. "Greenhill · Pro" */
  sub?: string;
  tone?: string;
  live?: boolean;
}
export interface SidebarProps {
  active?: string;
  journey?: string;
  /** optional per-stage live counts keyed by stage.key; falls back to the stage's own count */
  counts?: Record<string, number>;
  deals?: DealRef[];
  user?: SidebarUser;
  onHome?: () => void;
  onNav?: (key: string) => void;
  /** open a deal's unified workspace by id (preferred over journey-routing) */
  onOpenDeal?: (id: string) => void;
}
export function Sidebar({
  active = "home",
  journey = "BUY",
  counts,
  deals = DEALS_C,
  user = { name: "Dana Okafor", sub: "Greenhill · Pro", tone: "b", live: true },
  onHome,
  onNav,
  onOpenDeal,
}: SidebarProps) {
  return (
    <div className="mck-rail">
      <div className="mck-row" style={{ padding: "4px 8px 2px" }}>
        <button onClick={onHome} style={{ display: "inline-flex", borderRadius: 8 }}><Logo size={19} /></button>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        <button className="mck-btn mck-btn-ink mck-btn-md" style={{ justifyContent: "flex-start", gap: 9 }} onClick={() => onNav && onNav("new")}>
          <Ic name="plus" size={15} /> New deal
        </button>
        <div className="mck-row" style={{ gap: 8, height: 34, padding: "0 10px", color: "var(--ink-3)" }}>
          <Ic name="search" size={15} />
          <span style={{ fontSize: 13 }}>Search</span>
          <Mono style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)" }}>⌘K</Mono>
        </div>
      </div>

      <div className="mck-navsec">Pipeline</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <a className={"mck-nav" + (active === "home" ? " is-active" : "")} onClick={onHome} style={{ cursor: "pointer" }}>
          <span className="mck-nav-ic" style={active === "home" ? { color: "var(--accent)" } : undefined}><Ic name="agent" size={16} /></span>Ask Yulia
        </a>
        <a className={"mck-nav" + (active === "overview" ? " is-active" : "")} onClick={() => onNav && onNav("overview")} style={{ cursor: "pointer" }}>
          <span className="mck-nav-ic"><Ic name="grid" size={16} /></span>Overview
        </a>
      </div>

      <div className="mck-navsec" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{journey} lifecycle</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {(PIPELINES[journey] || PIPELINE).map((s) => {
          const count = counts && s.key in counts ? counts[s.key] : s.count;
          return (
            <a key={s.key} className={"mck-nav" + (active === s.key ? " is-active" : "")}
              onClick={() => onNav && onNav(s.key)} style={{ cursor: "pointer" }}>
              <span className="mck-nav-ic"><Ic name={s.ic} size={16} /></span>{s.label}
              <span className="mck-jcount">{count}</span>
            </a>
          );
        })}
      </div>

      <div className="mck-navsec">Deals</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {deals.map((d) => {
          // Every deal opens the unified, journey-adaptive workspace by id.
          // Fallback (no id / no handler): the old journey-routed nav.
          const route = d.journey === "SELL" ? "sell" : d.journey === "RAISE" ? "raise" : d.journey === "PMI" ? "post" : "deal";
          const open = () => {
            if (d.id && onOpenDeal) onOpenDeal(d.id);
            else if (onNav) onNav(route);
          };
          return (
            <a key={d.id || d.name} className="mck-nav" title={d.name} onClick={open} style={{ height: 40, cursor: "pointer" }}>
              <Avatar name={d.name.replace("Project ", "")} tone={d.tone} size={22} live={d.live} />
              <span className="mck-col" style={{ gap: 0, lineHeight: 1.25, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.sub} · {d.journey}</span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="mck-grow" />
      <div className="mck-hr" style={{ margin: "10px 0" }} />
      <div className="mck-row" style={{ gap: 10, padding: "2px 8px" }}>
        <Avatar name={user.name} tone={user.tone || "b"} size={28} live={user.live} />
        <span className="mck-col" style={{ gap: 0, lineHeight: 1.2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{user.name}</span>
          {user.sub && <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{user.sub}</span>}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Top bar (per-deal identity + breadcrumb) ---------------- */
export interface TopBarProps {
  deal?: string;
  target?: string;
  side?: string;
  journey?: string;
  stageActive?: string;
  team?: AvatarPerson[];
  onHome?: () => void;
  /** Share/more render only when a handler is supplied — no dead buttons (CLAUDE.md C1). */
  onShare?: () => void;
  onMore?: () => void;
}
export function TopBar({
  deal = "Project Atlas",
  target = "Northwind Logistics",
  side = "buy-side",
  journey = "BUY",
  stageActive = "Valuation",
  team = [],
  onHome,
  onShare,
  onMore,
}: TopBarProps) {
  const stages = JOURNEYS[journey] || JOURNEYS.BUY;
  const curIdx = Math.max(0, stages.indexOf(stageActive));
  return (
    <div className="mck-top">
      <Avatar name={deal.replace("Project ", "")} tone="a" size={26} live />
      <span className="mck-col" style={{ gap: 0, lineHeight: 1.2 }} onClick={onHome}>
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{deal}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{target} · {side}</span>
      </span>
      <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 4 }}><Mono style={{ fontSize: 10 }}>{journey}</Mono></span>
      <div className="mck-stageline" style={{ marginLeft: 12, overflow: "hidden" }}>
        {stages.map((s, i) => (
          <span key={s} style={{ display: "contents" }}>
            {i > 0 && <span style={{ color: "var(--ink-4)", fontSize: 11 }}>·</span>}
            <span className={"mck-stage-node " + (i < curIdx ? "is-done" : i === curIdx ? "is-cur" : "")}>{s}</span>
          </span>
        ))}
      </div>
      <div className="mck-grow" />
      <AvatarStack people={team} size={26} />
      {onShare && <Btn variant="ghost" size="sm" icon="link" onClick={onShare}>Share</Btn>}
      {onMore && <IconBtn name="more" onClick={onMore} />}
    </div>
  );
}

/* ---------------- Chat bits ---------------- */
export function YuliaMsg({ time = "9:25", children }: { time?: string; children?: ReactNode }) {
  return (
    <div className="mck-msg">
      <div className="mck-msg-avatar"><YuliaMark size={27} /></div>
      <div className="mck-msg-body">
        <div className="mck-msg-meta">
          <span className="mck-msg-name">Yulia</span>
          <span className="mck-msg-time">{time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
export function UserMsg({ name = "Dana Okafor", tone = "b", time = "9:24", children }: { name?: string; tone?: string; time?: string; children?: ReactNode }) {
  return (
    <div className="mck-msg">
      <div className="mck-msg-avatar"><Avatar name={name} tone={tone} size={27} /></div>
      <div className="mck-msg-body">
        <div className="mck-msg-meta">
          <span className="mck-msg-name">{name}</span>
          <span className="mck-msg-time">{time}</span>
        </div>
        <div className="mck-user-bubble">{children}</div>
      </div>
    </div>
  );
}

export interface TaskProps {
  state?: "done" | "run";
  label: ReactNode;
  sub?: ReactNode;
  tag?: ReactNode;
  onClick?: () => void;
  /** highlights the task as the active/open artifact (accent ring) */
  open?: boolean;
}
export function Task({ state = "done", label, sub, tag, onClick, open }: TaskProps) {
  const clickable = !!onClick;
  return (
    <button className="mck-task" onClick={onClick} disabled={!clickable}
      style={{ width: "100%", textAlign: "left", cursor: clickable ? "pointer" : "default",
        boxShadow: open ? "0 0 0 1.5px var(--accent)" : "none", transition: "box-shadow .12s" }}>
      <span className={"mck-task-ic " + (state === "run" ? "is-run" : "is-done")}>
        {state === "run" ? <Dot tone="accent" pulse size={7} /> : <Ic name="check" size={13} />}
      </span>
      <span className="mck-col" style={{ gap: 1, minWidth: 0 }}>
        <span className="mck-task-label">{label}</span>
        {sub && <span className="mck-task-sub">{sub}</span>}
      </span>
      {tag && (
        <span className="mck-task-tag" style={clickable ? { color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-line)", display: "inline-flex", alignItems: "center", gap: 4 } : undefined}>
          {tag}{clickable && <Ic name="arrowRight" size={11} />}
        </span>
      )}
    </button>
  );
}

export interface ComposerProps {
  /** controlled value of the input */
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (value: string) => void;
  placeholder?: string;
  /** the active scope chip label (e.g. deal/surface name); defaults to "Yulia" */
  scope?: string;
  /** when true, shows THE LINE reassurance line under the composer */
  lawLine?: boolean;
  /** disables send while Yulia is acting */
  busy?: boolean;
}
export function Composer({
  value,
  onChange,
  onSend,
  placeholder = "Ask Yulia to source, analyze, draft, or close…",
  scope,
  lawLine = false,
  busy = false,
}: ComposerProps) {
  const controlled = value !== undefined && onChange !== undefined;
  const empty = !value;
  const submit = () => {
    if (busy || !value || !value.trim()) return;
    onSend && onSend(value);
  };
  return (
    <div>
      <div className="mck-composer">
        <div className="mck-composer-top">
          {controlled ? (
            <input
              className="mck-composer-input"
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", font: "inherit", color: "var(--ink)" }}
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange!(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            />
          ) : (
            <span className="mck-composer-input"><span className="ph">{placeholder}</span></span>
          )}
        </div>
        <div className="mck-composer-bar">
          <Chip icon="attach">Data room</Chip>
          <Chip icon="at">Mention a deal</Chip>
          <div className="mck-grow" />
          <Chip icon="agent" active>{scope || "Yulia"}</Chip>
          <span
            className="mck-send"
            role="button"
            aria-disabled={busy || empty}
            style={busy || empty ? { opacity: 0.5, pointerEvents: "none" } : undefined}
            onClick={submit}
          >
            <Ic name="send" size={15} />
          </span>
        </div>
      </div>
      {lawLine && (
        <div className="mck-row" style={{ justifyContent: "center", gap: 7, marginTop: 11, color: "var(--ink-3)", fontSize: 11, textAlign: "center" }}>
          <Ic name="agent" size={12} /> Yulia can act across Sourcing, Analysis, Closing &amp; Post-merger. She asks before anything irreversible.
        </div>
      )}
    </div>
  );
}

/* mini ranked target preview inside Yulia results */
export interface RankedTarget {
  name: string;
  loc: string;
  rev: string;
  score: number;
  tone?: string;
}
export interface RankedTargetsProps {
  rows?: RankedTarget[];
  title?: string;
}
const RANKED_DEFAULT: RankedTarget[] = [
  { name: "Polar Lane Cold Chain", loc: "Columbus, OH", rev: "$62M", score: 94, tone: "a" },
  { name: "Tundra Freightways", loc: "Calgary, AB", rev: "$48M", score: 89, tone: "c" },
  { name: "Glacier Yard Logistics", loc: "Reno, NV", rev: "$31M", score: 86, tone: "c" },
];
export function RankedTargets({ rows = RANKED_DEFAULT, title = "Top matches" }: RankedTargetsProps) {
  return (
    <div className="mck-card" style={{ overflow: "hidden", marginTop: 4 }}>
      <div className="mck-row" style={{ justifyContent: "space-between", padding: "11px 14px 10px" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</span>
        <span className="mck-eyebrow">ranked by fit</span>
      </div>
      <div className="mck-hr" />
      {rows.map((r, i) => (
        <div key={i} className="mck-row" style={{ gap: 12, padding: "11px 14px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
          <Avatar name={r.name} tone={r.tone || (i === 0 ? "a" : "c")} size={26} />
          <span className="mck-col" style={{ gap: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.loc} · {r.rev} revenue</span>
          </span>
          <div className="mck-row" style={{ gap: 9, marginLeft: "auto" }}>
            <Mono className="mck-tnum" style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.score}</Mono>
            <span className="mck-meter"><span style={{ width: r.score + "%" }} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Staged confirm (THE LINE) ---------------- */
export interface ConfirmKV {
  k: ReactNode;
  v: ReactNode;
}
export type StagedConfirmStatus = "idle" | "open" | "done" | "cancelled";
export interface StagedConfirmProps {
  title?: string;
  kv?: ConfirmKV[];
  note?: string;
  status?: StagedConfirmStatus;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
export function StagedConfirm({
  title = "Confirm before Yulia acts",
  kv = [],
  note = "Outward-facing action — Yulia will not send until you confirm.",
  status = "open",
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: StagedConfirmProps) {
  if (status === "done") {
    return (
      <div className="mck-confirm" style={{ borderColor: "var(--ok-line)" }}>
        <div className="mck-confirm-head" style={{ background: "var(--ok-soft)" }}>
          <span className="mck-task-ic is-done" style={{ background: "var(--ok)" }}><Ic name="check" size={13} /></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ok)" }}>Confirmed — Yulia is proceeding</span>
        </div>
      </div>
    );
  }
  if (status === "cancelled") {
    return (
      <div className="mck-confirm" style={{ borderColor: "var(--line-2)" }}>
        <div className="mck-confirm-head">
          <span className="mck-task-ic is-done" style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}><Ic name="x" size={13} /></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)" }}>Cancelled — Yulia did not act</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mck-confirm">
      <div className="mck-confirm-head">
        <YuliaMark size={22} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-ink)" }}>{title}</span>
        <span className="mck-pill mck-pill-yulia" style={{ marginLeft: "auto" }}><span className="mck-pdot" />needs you</span>
      </div>
      <div className="mck-confirm-body">
        {kv.map((l, i) => (
          <div key={i} className="mck-confirm-kv">
            <span className="k">{l.k}</span>
            <span className="v">{l.v}</span>
          </div>
        ))}
      </div>
      <div className="mck-confirm-foot">
        <span className="mck-confirm-note"><Ic name="agent" size={12} />{note}</span>
        <div className="mck-grow" />
        <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={onCancel}>Cancel</button>
        <button className="mck-btn mck-btn-ink mck-btn-sm" onClick={onConfirm}><Ic name="check" size={13} />{confirmLabel}</button>
      </div>
    </div>
  );
}

/* ---------------- States: loading / empty / error ---------------- */
export interface SkeletonProps {
  lines?: number;
  w?: string[];
}
export function Skeleton({ lines = 3, w = ["90%", "75%", "60%"] }: SkeletonProps) {
  return (
    <div className="mck-col" style={{ gap: 10, width: "100%" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} className="mck-skel" style={{ height: 11, width: w[i % w.length] }} />
      ))}
    </div>
  );
}
export function LoadingBlock({ label = "Yulia is reading the data room…" }: { label?: string }) {
  return (
    <div className="mck-card" style={{ padding: 18 }}>
      <div className="mck-row" style={{ gap: 9, marginBottom: 14 }}>
        <Dot tone="accent" pulse /><span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{label}</span>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}
export interface EmptyChartProps {
  title?: string;
  sub?: string;
  icon?: IcName;
  h?: number;
}
export function EmptyChart({
  title = "No live feed yet",
  sub = "This chart populates once the data source is connected for this deal.",
  icon = "bars",
  h = 150,
}: EmptyChartProps) {
  return (
    <div className="mck-empty" style={{ minHeight: h }}>
      <span className="mck-empty-ic"><Ic name={icon} size={17} /></span>
      <span className="mck-empty-t">{title}</span>
      <span className="mck-empty-s">{sub}</span>
    </div>
  );
}
export interface ErrorStateProps {
  title?: string;
  sub?: string;
  onRetry?: () => void;
}
export function ErrorState({
  title = "Couldn’t reach the sourcing engine",
  sub = "The connection timed out. Your data is safe.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mck-empty" style={{ borderColor: "var(--risk-line)", background: "var(--risk-soft)" }}>
      <span className="mck-empty-ic" style={{ borderColor: "var(--risk-line)", color: "var(--risk)" }}><Ic name="x" size={16} /></span>
      <span className="mck-empty-t" style={{ color: "var(--risk)" }}>{title}</span>
      <span className="mck-empty-s">{sub}</span>
      <button className="mck-btn mck-btn-ghost mck-btn-sm" style={{ marginTop: 4 }} onClick={onRetry}><Ic name="arrowRight" size={13} />Retry</button>
    </div>
  );
}

/* ---------------- Ask-Yulia rail + launcher ----------------
   On any chat-less surface, the "Ask Yulia" launcher (pill, ⌘K) brings the chat
   in as the LEFT rail — the same chat-left / canvas-right split as the deal
   workspace (and Claude Code). The current surface becomes the canvas. */
export interface DockArtifact {
  label: string;
  key: string;
}
export interface DockContext {
  line: string;
  chips: string[];
  artifacts?: DockArtifact[];
}
export const DOCK_CONTEXT: Record<string, DockContext> = {
  Overview: {
    line: "I'm watching all 4 mandates. Ask me anything across the portfolio, or tell me what to work on next.",
    chips: ["What needs me today?", "Which deals are at risk?"],
    artifacts: [{ label: "Open portfolio model", key: "model" }],
  },
  Sourcing: {
    line: "We have 23 ranked targets in the cold-chain mandate. I can refine the criteria, draft outreach, or quickly value a target.",
    chips: ["Refine the criteria", "Find more like Polar Lane"],
    artifacts: [{ label: "Value Polar Lane", key: "model" }, { label: "Open outreach draft", key: "docs" }],
  },
  "Project Atlas": {
    line: "I maintain Atlas's brief live. Ask about the thesis, valuation, or risks — I'll open anything on the canvas beside us.",
    chips: ["Re-run the base case", "What are the top risks?"],
    artifacts: [{ label: "Open the model", key: "model" }, { label: "Open IC memo", key: "docs" }, { label: "Open data room", key: "data" }],
  },
  "Project Vela": {
    line: "Vela is a sell-side mandate. I matched 41 buyers, ranked them by fit & strategic rationale, and can run the process for you.",
    chips: ["Who are the best buyers?", "Draft the CIM"],
    artifacts: [{ label: "Open the CIM", key: "docs" }, { label: "Open the buyer model", key: "model" }],
  },
  "Project Ember": {
    line: "Ember is a Series B raise. I built the investor materials and a ranked investor list — ask me anything about the round.",
    chips: ["Who should we prioritize?", "Refine the deck"],
    artifacts: [{ label: "Open investor deck", key: "docs" }, { label: "Open cap-table model", key: "model" }],
  },
};
export const ARTIFACT_LABEL: Record<string, string> = {
  analysis: "Analysis",
  model: "Model",
  docs: "Documents",
  data: "Data room",
};

export interface YuliaLauncherProps {
  onClick?: () => void;
}
export function YuliaLauncher({ onClick }: YuliaLauncherProps) {
  return (
    <div className="mck-dock">
      <button className="mck-dock-pill" onClick={onClick}>
        <YuliaMark size={32} />
        <span className="mck-dock-label">Ask Yulia</span>
        <span className="mck-dock-kbd">⌘K</span>
      </button>
    </div>
  );
}

export interface YuliaRailProps {
  scope?: string;
  /** override the context (line/chips/artifacts) for this scope; falls back to DOCK_CONTEXT */
  context?: DockContext;
  onClose?: () => void;
  onOpen?: (key: string) => void;
}
export function YuliaRail({ scope = "Overview", context, onClose, onOpen }: YuliaRailProps) {
  const ctx = context || DOCK_CONTEXT[scope] || DOCK_CONTEXT["Overview"];
  return (
    <div className="mck-col" style={{ width: 440, flex: "0 0 440px", height: "100%", background: "var(--bg)", borderRight: "1px solid var(--line)" }}>
      <div className="mck-row" style={{ gap: 9, height: 50, flex: "0 0 50px", padding: "0 12px 0 18px", borderBottom: "1px solid var(--line)" }}>
        <YuliaMark size={23} />
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>Yulia</span>
        <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>{scope}</span>
        <div className="mck-grow" />
        <button className="mck-iconbtn" title="Close chat" onClick={onClose}><Ic name="x" size={15} /></button>
      </div>
      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "24px 16px" }}>
        <YuliaMsg time="now">
          <div className="mck-prose" style={{ fontSize: 13.5, marginBottom: ctx.artifacts ? 12 : 0 }}>{ctx.line}</div>
          {ctx.artifacts && (
            <div className="mck-col" style={{ gap: 7 }}>
              {ctx.artifacts.map((a) => (
                <Task key={a.key} label={a.label} sub="Opens on the canvas beside us" tag="Open" onClick={() => onOpen && onOpen(a.key)} />
              ))}
            </div>
          )}
        </YuliaMsg>
      </div>
      <div style={{ flex: "0 0 auto", padding: "0 16px 18px" }}>
        <div className="mck-row" style={{ gap: 7, flexWrap: "wrap", marginBottom: 11 }}>
          {ctx.chips.map((c) => <Chip key={c} icon="spark">{c}</Chip>)}
        </div>
        <Composer placeholder={`Ask Yulia about ${scope}…`} scope={scope} />
      </div>
    </div>
  );
}

/* the right-hand canvas region when the rail is open: a tab bar whose first tab
   is the surface itself, plus any artifacts Yulia has opened. The artifact bodies
   are supplied by the integrator via renderArtifact (kept out of this layer so
   chrome.tsx stays self-contained — no dependency on the canvas-shell port). */
interface RailCanvasHostProps {
  surfaceLabel: string;
  content: ReactNode;
  openTabs: string[];
  active: string;
  setActive: (key: string) => void;
  onCloseTab: (key: string) => void;
  renderArtifact?: (key: string) => ReactNode;
}
function RailCanvasHost({ surfaceLabel, content, openTabs, active, setActive, onCloseTab, renderArtifact }: RailCanvasHostProps) {
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%", background: active === "surface" ? "transparent" : "var(--surface)" }}>
      <div className="mck-row" style={{ gap: 4, height: 44, flex: "0 0 44px", padding: "0 12px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <span className="mck-eyebrow" style={{ marginRight: 6 }}>Canvas</span>
        <button className={"mck-tab" + (active === "surface" ? " is-active" : "")} onClick={() => setActive("surface")}>
          <Ic name="grid" size={14} />{surfaceLabel}
        </button>
        {openTabs.map((k) => (
          <button key={k} className={"mck-tab" + (active === k ? " is-active" : "")} onClick={() => setActive(k)}>
            <Ic name={k === "model" ? "sliders" : k === "docs" ? "doc" : k === "data" ? "grid" : "bars"} size={14} />
            {ARTIFACT_LABEL[k]}
            <span className="mck-tabclose" onClick={(e) => { e.stopPropagation(); onCloseTab(k); }}><Ic name="x" size={11} /></span>
          </button>
        ))}
        <div className="mck-grow" />
        <span className="mck-pill mck-pill-yulia"><span className="mck-pdot" />opened by Yulia</span>
      </div>
      <div className="mck-grow" style={{ overflow: "hidden", minHeight: 0 }}>
        {active === "surface"
          ? content
          : <div className="mck-grow mck-scrollfade" style={{ height: "100%", overflow: "hidden" }}>{renderArtifact ? renderArtifact(active) : null}</div>}
      </div>
    </div>
  );
}

/* hook: gives a surface a left Yulia rail + a launcher pill + a canvas wrapper.
   Place {rail} right after <Sidebar/>, wrap the main column in wrap(...), and
   drop {launcher} as the last child. ⌘K toggles the rail.

   Presentational: holds only local UI state (open/tabs/active) and keyboard
   binding. Artifact bodies are rendered by the integrator's renderArtifact. */
export interface YuliaRailController {
  open: boolean;
  rail: ReactNode;
  launcher: ReactNode;
  wrap: (content: ReactNode) => ReactNode;
}
export interface UseYuliaRailOptions {
  /** override the rail context for this scope (line/chips/artifacts) */
  context?: DockContext;
  /** render an opened artifact's body on the canvas; integrator wires the real canvas here */
  renderArtifact?: (key: string) => ReactNode;
}
export function useYuliaRail(scope: string, surfaceLabel = "Workspace", options: UseYuliaRailOptions = {}): YuliaRailController {
  const [open, setOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [active, setActive] = useState("surface");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openArtifact = (k: string) => {
    setOpenTabs((t) => (t.includes(k) ? t : [...t, k]));
    setActive(k);
  };
  const closeTab = (k: string) => {
    setOpenTabs((t) => t.filter((x) => x !== k));
    setActive((a) => (a === k ? "surface" : a));
  };

  return {
    open,
    rail: open ? <YuliaRail scope={scope} context={options.context} onClose={() => setOpen(false)} onOpen={openArtifact} /> : null,
    launcher: open ? null : <YuliaLauncher onClick={() => setOpen(true)} />,
    wrap: (content: ReactNode) =>
      open
        ? <RailCanvasHost surfaceLabel={surfaceLabel} content={content} openTabs={openTabs} active={active} setActive={setActive} onCloseTab={closeTab} renderArtifact={options.renderArtifact} />
        : content,
  };
}
