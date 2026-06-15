/* ============================================================================
   DealCanvas.tsx — the SPLIT analysis canvas: a deal-scoped Yulia chat rail on
   the left, a tabbed canvas (Analysis · Model · Documents · Data room) on the
   right. Artifacts open from chat; the canvas collapses / expands (Claude-style).
   Faithful port of Test 33 / source/canvas_shell.jsx.

   PRESENTATIONAL ONLY — no data fetching, no network hooks. The chat rail body
   and each canvas body arrive via props (the integrator injects the REAL chat
   and real data). Tab selection / view state is local UI state. Honest-empty
   states (EmptyChart "No live feed yet") are preserved by design — the
   integrator wires real-vs-empty via props. THE LINE: any outward/mutating
   action renders a StagedConfirm (from chrome), never a bare send.

   Styling lives in nd.css (.mck-* under .nd-root). Primitives from ../primitives;
   patterns/states from ../chrome.
   ============================================================================ */
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Ic,
  YuliaMark,
  Avatar,
  AvatarStack,
  Mono,
  Dot,
  Chip,
  Btn,
  IconBtn,
  StatusPill,
  SeverityPill,
} from "../primitives";
import type { IcName, PillTone, AvatarPerson } from "../primitives";
import { EmptyChart } from "../chrome";

/* ============================================================================
   Canvas: Analysis
   ============================================================================ */
export interface AnalysisKpi {
  /** Metric label, e.g. "Enterprise value". */
  label: string;
  /** Formatted value, e.g. "$184M". */
  value: string;
}
export interface ThesisRisk {
  title: string;
  /** Detail line, e.g. "Top 2 = 38% of revenue, both renew < 18mo". */
  detail: string;
  /** Severity label — High → risk, Medium → warn, Low → ok. */
  severity: string;
}
export interface CanvasAnalysisProps {
  /** KPI cards across the top. Defaults to the design's sample set. */
  kpis?: AnalysisKpi[];
  /** Football-field title (implied EV range). */
  footballFieldTitle?: string;
  /** Honest-empty football field: title + sub for the EmptyChart. */
  footballFieldEmptyTitle?: string;
  footballFieldEmptySub?: string;
  /** When true, shows the (honest-empty) churn sensitivity card Yulia just added. */
  sensitivity?: boolean;
  /** Thesis-risk rows. Defaults to the design's sample set. */
  risks?: ThesisRisk[];
}

const ANALYSIS_KPIS_DEFAULT: AnalysisKpi[] = [
  { label: "Enterprise value", value: "$184M" },
  { label: "EV / EBITDA", value: "7.4×" },
  { label: "Synergy NPV", value: "$41M" },
  { label: "Implied IRR", value: "24.6%" },
];
const ANALYSIS_RISKS_DEFAULT: ThesisRisk[] = [
  { title: "Customer concentration", detail: "Top 2 = 38% of revenue, both renew < 18mo", severity: "High" },
  { title: "Fleet capex cliff", detail: "42% of tractors past 7yr in FY27 (~$28M)", severity: "Medium" },
];

export function CanvasAnalysis({
  kpis = ANALYSIS_KPIS_DEFAULT,
  footballFieldTitle = "Football field — implied EV range",
  footballFieldEmptyTitle = "No live feed yet",
  footballFieldEmptySub = "Connect the comps & precedent-transactions source and Yulia will plot the valuation range here.",
  sensitivity = false,
  risks = ANALYSIS_RISKS_DEFAULT,
}: CanvasAnalysisProps) {
  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="mck-row" style={{ gap: 13 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="mck-card mck-grow" style={{ padding: "14px 16px" }}>
            <div className="mck-kv">
              <span className="mck-kv-k">{kpi.label}</span>
              <span className="mck-kv-v mck-tnum">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mck-card" style={{ padding: 18 }}>
        <div className="mck-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{footballFieldTitle}</span>
          <span className="mck-eyebrow">$M</span>
        </div>
        <EmptyChart icon="bars" title={footballFieldEmptyTitle} sub={footballFieldEmptySub} />
      </div>

      {sensitivity && (
        <div className="mck-card" style={{ overflow: "hidden" }}>
          <div className="mck-row" style={{ gap: 9, padding: "13px 16px" }}>
            <YuliaMark size={22} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Churn sensitivity — IRR</span>
            <span className="mck-pill mck-pill-yulia" style={{ marginLeft: "auto" }}><span className="mck-pdot" />just added</span>
          </div>
          <div className="mck-hr" />
          <div style={{ padding: 16 }}>
            <EmptyChart icon="sliders" h={108} title="Awaiting churn inputs"
              sub="Yulia built the table structure; it fills once the customer-contract terms are confirmed in diligence." />
          </div>
        </div>
      )}

      <div>
        <span className="mck-eyebrow">Thesis risks · {risks.length}</span>
        <div className="mck-col" style={{ gap: 8, marginTop: 10 }}>
          {risks.map((r) => (
            <div key={r.title} className="mck-card mck-row" style={{ gap: 13, padding: "13px 15px" }}>
              <span className="mck-task-ic"><Ic name="target" size={13} /></span>
              <span className="mck-col" style={{ gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</span>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.detail}</span>
              </span>
              <span style={{ marginLeft: "auto" }}><SeverityPill level={r.severity} /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Canvas: Model
   ============================================================================ */
export interface ModelAssumption {
  /** Assumption label, e.g. "Entry multiple". */
  label: string;
  /** Formatted value, e.g. "7.4×". */
  value: string;
  /** Slider fill 0–100 (position of the handle). */
  pct: number;
}
export interface ModelStat {
  label: string;
  value: string;
}
export interface CanvasModelProps {
  assumptions?: ModelAssumption[];
  /** Version tag shown on the Assumptions header, e.g. "v4". */
  version?: string;
  /** Honest-empty returns waterfall: title + sub for the EmptyChart. */
  waterfallEmptyTitle?: string;
  waterfallEmptySub?: string;
  /** Right-column returns stats. */
  stats?: ModelStat[];
}

const MODEL_ASSUMPTIONS_DEFAULT: ModelAssumption[] = [
  { label: "Entry multiple", value: "7.4×", pct: 62 },
  { label: "Net leverage", value: "4.2×", pct: 54 },
  { label: "Revenue CAGR", value: "13.2%", pct: 66 },
  { label: "Hold period", value: "5 yrs", pct: 50 },
  { label: "Exit multiple", value: "8.1×", pct: 70 },
];
const MODEL_STATS_DEFAULT: ModelStat[] = [
  { label: "IRR (5yr)", value: "24.6%" },
  { label: "MOIC", value: "2.9×" },
  { label: "Equity in", value: "$74M" },
  { label: "Equity out", value: "$214M" },
];

export function CanvasModel({
  assumptions = MODEL_ASSUMPTIONS_DEFAULT,
  version = "v4",
  waterfallEmptyTitle = "No live feed yet",
  waterfallEmptySub = "The waterfall renders from the sources & uses once the capital structure is finalized.",
  stats = MODEL_STATS_DEFAULT,
}: CanvasModelProps) {
  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="mck-card" style={{ overflow: "hidden" }}>
        <div className="mck-row" style={{ gap: 9, padding: "14px 18px" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Assumptions</span>
          <span className="mck-pill mck-pill-yulia"><Ic name="agent" size={11} />built by Yulia · editable</span>
          <Btn variant="quiet" size="sm" icon="clock">{version}</Btn>
        </div>
        <div className="mck-hr" />
        <div style={{ padding: "8px 18px 16px" }}>
          {assumptions.map((a, i) => (
            <div key={a.label} className="mck-row" style={{ gap: 16, padding: "12px 0", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
              <span style={{ width: 130, flex: "0 0 130px", fontSize: 13, color: "var(--ink-2)" }}>{a.label}</span>
              <div className="mck-grow" style={{ position: "relative", height: 4, borderRadius: 3, background: "var(--surface-3)" }}>
                <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: a.pct + "%", background: "var(--ink)", borderRadius: 3 }} />
                <span style={{ position: "absolute", left: a.pct + "%", top: "50%", width: 13, height: 13, marginLeft: -6, marginTop: -6.5, borderRadius: "50%", background: "#fff", border: "1.5px solid var(--ink)", boxShadow: "0 1px 2px rgba(0,0,0,.15)" }} />
              </div>
              <Mono className="mck-tnum" style={{ width: 56, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{a.value}</Mono>
            </div>
          ))}
        </div>
      </div>

      <div className="mck-row" style={{ gap: 18, alignItems: "stretch" }}>
        <div className="mck-card mck-grow" style={{ padding: 18 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Returns waterfall</span>
          <div style={{ marginTop: 12 }}>
            <EmptyChart icon="bars" h={138} title={waterfallEmptyTitle} sub={waterfallEmptySub} />
          </div>
        </div>
        <div className="mck-card" style={{ width: 220, flex: "0 0 220px", padding: 18, display: "flex", flexDirection: "column", gap: 13, justifyContent: "center" }}>
          {stats.map((s) => (
            <div key={s.label} className="mck-row" style={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{s.label}</span>
              <Mono className="mck-tnum" style={{ fontSize: 14, fontWeight: 600 }}>{s.value}</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Canvas: Documents
   ============================================================================ */
export interface CanvasDoc {
  /** Doc name, e.g. "IC memo". */
  name: string;
  /** Icon glyph key, e.g. "doc" | "list". */
  icon: IcName;
  /** Marks the active doc in the rail. */
  active?: boolean;
}
export interface DocComment {
  /** Commenter name, e.g. "Mei Lin". */
  name: string;
  tone?: string;
  /** Comment body. */
  text: string;
}
export interface CanvasDocsProps {
  /** Left-rail document list. */
  docs?: CanvasDoc[];
  /** Header — open doc title, e.g. "IC memo — Project Atlas". */
  title?: string;
  /** Status line on the right of the header, e.g. "Yulia drafting". */
  status?: string;
  /** Collaborators shown in the header avatar stack. */
  people?: AvatarPerson[];
  /** The memo body. Provide to override the design's sample memo. */
  children?: ReactNode;
}

const DOCS_DEFAULT: CanvasDoc[] = [
  { name: "IC memo", icon: "doc", active: true },
  { name: "CIM", icon: "doc" },
  { name: "LOI — draft", icon: "doc" },
  { name: "NDA", icon: "doc" },
  { name: "Diligence tracker", icon: "list" },
];
const DOCS_PEOPLE_DEFAULT: AvatarPerson[] = [
  { name: "Dana Okafor", tone: "b", live: true },
  { name: "Mei Lin", tone: "d" },
];

export function CanvasDocs({
  docs = DOCS_DEFAULT,
  title = "IC memo — Project Atlas",
  status = "Yulia drafting",
  people = DOCS_PEOPLE_DEFAULT,
  children,
}: CanvasDocsProps) {
  return (
    <div className="mck-row" style={{ alignItems: "stretch", height: "100%" }}>
      <div className="mck-col" style={{ width: 196, flex: "0 0 196px", borderRight: "1px solid var(--line)", padding: "16px 12px", gap: 3 }}>
        <span className="mck-eyebrow" style={{ padding: "0 8px 6px" }}>Documents</span>
        {docs.map((d) => (
          <a key={d.name} className={"mck-nav" + (d.active ? " is-active" : "")} style={{ height: 34 }}>
            <span className="mck-nav-ic"><Ic name={d.icon} size={15} /></span>
            <span style={{ fontSize: 12.5 }}>{d.name}</span>
          </a>
        ))}
        <div className="mck-grow" />
        <Btn variant="ghost" size="sm" icon="plus">New doc</Btn>
      </div>

      <div className="mck-grow mck-col" style={{ minWidth: 0 }}>
        <div className="mck-row" style={{ gap: 10, padding: "13px 24px", borderBottom: "1px solid var(--line)" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
          <span className="mck-row" style={{ gap: 6, marginLeft: "auto", fontSize: 11.5, color: "var(--ink-2)" }}>
            <Dot tone="accent" pulse /> {status}
          </span>
          <span style={{ color: "var(--line)" }}>|</span>
          <AvatarStack people={people} size={22} />
        </div>
        <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "28px 36px" }}>
          {children ?? <DocsMemoSample />}
        </div>
      </div>
    </div>
  );
}

/* The design's sample IC memo body. The integrator passes real memo content as
   children; absent that, this honest sample renders. */
function DocsMemoSample() {
  return (
    <div style={{ maxWidth: 560 }}>
      <span className="mck-eyebrow">Confidential · for committee</span>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "10px 0 4px" }}>Project Atlas — Investment Committee Memo</h1>
      <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "0 0 22px" }}>Northwind Logistics · Buy-side · Prepared by Yulia · Draft v3</p>

      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>1 · Analysis &amp; implications</h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 18px" }}>
        At <b>$184M enterprise value (7.4× LTM EBITDA)</b>, the base case clears a 24.6% IRR. Below I lay out the
        implications of the entry multiple and the diligence items that would move it — <b>the decision is yours.</b>
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>2 · Key risks</h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
        The primary risk is customer concentration.{" "}
        <span style={{ background: "rgba(90,79,214,0.1)", borderBottom: "2px solid var(--accent)", padding: "1px 2px", position: "relative" }}>
          The top two accounts represent 38% of FY24 revenue, both with contracts renewing inside 18 months
          <span style={{ position: "absolute", top: -9, right: -9, width: 19, height: 19, borderRadius: "50% 50% 50% 2px", background: "var(--accent)", color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
            <Ic name="agent" size={11} />
          </span>
        </span>{" "}
        — a churn sensitivity table is attached in the model.
      </p>
      <div className="mck-row" style={{ gap: 9, marginTop: 14, padding: "11px 14px", background: "var(--surface-2)", borderRadius: 10, maxWidth: 420 }}>
        <Avatar name="Mei Lin" tone="d" size={22} />
        <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}><b style={{ color: "var(--ink)" }}>Mei Lin:</b> add the renewal dates here?</span>
      </div>
    </div>
  );
}

/* ============================================================================
   Canvas: Data room
   ============================================================================ */
export interface DataFolder {
  /** Folder name, e.g. "Financials". */
  name: string;
  /** File count label, e.g. "142 files". */
  count: string;
  /** Status label, e.g. "Reviewed" | "2 flags" | "In review". */
  status: string;
  /** Status pill tone: ok | risk | neutral | warn | yulia. */
  tone: PillTone;
}
export interface CanvasDataProps {
  /** Yulia's review banner copy (rich node — keeps the bolded figures). */
  reviewBanner?: ReactNode;
  /** Label on the banner action button. */
  reviewActionLabel?: string;
  onReviewAction?: () => void;
  /** Folder rows with status pills. */
  folders?: DataFolder[];
  onOpenFolder?: (name: string) => void;
}

/* Honest-empty defaults — the integrator passes real folders + a real banner.
   No fabricated file counts can render. */
const DATA_FOLDERS_DEFAULT: DataFolder[] = [];

export function CanvasData({
  reviewBanner,
  reviewActionLabel,
  onReviewAction,
  folders = DATA_FOLDERS_DEFAULT,
  onOpenFolder,
}: CanvasDataProps) {
  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Yulia's review banner — only when there's real review copy. Action button only when wired. */}
      {reviewBanner && (
        <div className="mck-row" style={{ gap: 12, padding: "12px 15px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 11 }}>
          <YuliaMark size={23} />
          <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>{reviewBanner}</span>
          {onReviewAction && reviewActionLabel && (
            <button className="mck-btn mck-btn-ink mck-btn-sm" style={{ marginLeft: "auto" }} onClick={onReviewAction}>{reviewActionLabel}</button>
          )}
        </div>
      )}
      <div className="mck-card" style={{ overflow: "hidden" }}>
        {folders.map((f, i) => (
          <div key={f.name} className="mck-row" style={{ gap: 13, padding: "13px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
            <span className="mck-task-ic"><Ic name="grid" size={13} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{f.name}</span>
            <Mono style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 8 }}>{f.count}</Mono>
            <span style={{ marginLeft: "auto" }}>
              <StatusPill tone={f.tone} dot={f.tone !== "ok"}>{f.tone === "ok" && <Ic name="check" size={11} />}{f.status}</StatusPill>
            </span>
            {onOpenFolder && <IconBtn name="chevRight" size={14} onClick={() => onOpenFolder(f.name)} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   DealCanvas — assembled split shell (chat rail | tabbed canvas)
   ============================================================================ */
export type CanvasTabKey = "analysis" | "model" | "docs" | "data";
export type CanvasView = "split" | "chatOnly" | "canvasOnly";

export interface CanvasTab {
  key: CanvasTabKey;
  label: string;
  ic: IcName;
}
export const CANVAS_TABS: CanvasTab[] = [
  { key: "analysis", label: "Analysis", ic: "bars" },
  { key: "model", label: "Model", ic: "sliders" },
  { key: "docs", label: "Documents", ic: "doc" },
  { key: "data", label: "Data room", ic: "grid" },
];

export interface DealCanvasProps {
  /** The deal-scoped Yulia chat rail body — injected by the integrator (real chat). */
  chat: ReactNode;
  /** Heading shown in the chat-rail header (Yulia + scope pill). */
  chatScope?: string;
  /** Count shown on the "Open canvas · N" chip when the canvas is collapsed. */
  canvasCount?: number;
  /** Tab definitions. Defaults to Analysis · Model · Documents · Data room. */
  tabs?: CanvasTab[];
  /** Active canvas tab (controlled). Falls back to local state when omitted. */
  active?: CanvasTabKey;
  onTab?: (key: CanvasTabKey) => void;
  /** Layout view (controlled). Falls back to local state when omitted. */
  view?: CanvasView;
  onView?: (view: CanvasView) => void;
  /** Close the canvas (collapse to chat-only). */
  onClose?: () => void;
  /** Expand the canvas (canvas-only) / shrink back to split. */
  onExpand?: () => void;
  onShare?: () => void;
  /** Per-tab canvas bodies — injected by the integrator (real data, honest-empty when absent). */
  analysis?: ReactNode;
  model?: ReactNode;
  docs?: ReactNode;
  data?: ReactNode;
}

export function DealCanvas({
  chat,
  chatScope = "Valuation",
  canvasCount = 3,
  tabs = CANVAS_TABS,
  active,
  onTab,
  view,
  onView,
  onClose,
  onExpand,
  onShare,
  analysis,
  model,
  docs,
  data,
}: DealCanvasProps) {
  const [tabLocal, setTabLocal] = useState<CanvasTabKey>("analysis");
  const [viewLocal, setViewLocal] = useState<CanvasView>("split");
  const tab = active ?? tabLocal;
  const v = view ?? viewLocal;

  const setTab = (k: CanvasTabKey) => { setTabLocal(k); onTab?.(k); };
  const setView = (next: CanvasView) => { setViewLocal(next); onView?.(next); };

  const expanded = v === "canvasOnly";
  const bodies: Record<CanvasTabKey, ReactNode> = {
    analysis: analysis ?? <CanvasAnalysis />,
    model: model ?? <CanvasModel />,
    docs: docs ?? <CanvasDocs />,
    data: data ?? <CanvasData />,
  };

  return (
    <div className="mck-row mck-grow" style={{ minHeight: 0, alignItems: "stretch" }}>
      {/* ---- chat rail (left) ---- */}
      {v !== "canvasOnly" && (
        <div className="mck-col" style={{ width: 520, flex: "0 0 520px", height: "100%", background: "var(--bg)", borderRight: v === "chatOnly" ? "none" : "1px solid var(--line)" }}>
          <div className="mck-row" style={{ gap: 9, height: 46, flex: "0 0 46px", padding: "0 14px 0 20px", borderBottom: "1px solid var(--line)" }}>
            <YuliaMark size={22} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Yulia</span>
            <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>{chatScope}</span>
            <div className="mck-grow" />
            {v === "chatOnly" && <Chip icon="panel" onClick={() => setView("split")}>Open canvas · {canvasCount}</Chip>}
            <IconBtn name="more" />
          </div>
          <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", minHeight: 0 }}>{chat}</div>
        </div>
      )}

      {/* ---- tabbed canvas (right) ---- */}
      {v !== "chatOnly" && (
        <div className="mck-grow mck-col" style={{ minWidth: 0, height: "100%", background: "var(--surface)" }}>
          <div className="mck-row" style={{ gap: 4, height: 46, flex: "0 0 46px", padding: "0 12px 0 14px", borderBottom: "1px solid var(--line)" }}>
            {expanded
              ? <button className="mck-chip" style={{ marginRight: 6 }} onClick={() => setView("split")}><Ic name="comment" size={13} />Chat</button>
              : <span className="mck-eyebrow" style={{ marginRight: 8 }}>Canvas</span>}
            {tabs.map((t) => (
              <button key={t.key} className={"mck-tab" + (t.key === tab ? " is-active" : "")} onClick={() => setTab(t.key)}>
                <Ic name={t.ic} size={14} />{t.label}
              </button>
            ))}
            <div className="mck-grow" />
            <Btn variant="ghost" size="sm" icon="link" onClick={onShare}>Share</Btn>
            <button className="mck-iconbtn" title={expanded ? "Back to split" : "Expand canvas"}
              onClick={() => { setView(expanded ? "split" : "canvasOnly"); onExpand?.(); }}><Ic name={expanded ? "shrink" : "expand"} size={16} /></button>
            <button className="mck-iconbtn" title="Close canvas" onClick={() => { setView("chatOnly"); onClose?.(); }}><Ic name="x" size={15} /></button>
          </div>
          <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", minHeight: 0 }}>
            {bodies[tab]}
          </div>
        </div>
      )}
    </div>
  );
}
