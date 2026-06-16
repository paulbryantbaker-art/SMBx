/* ============================================================================
   Journeys.tsx — the SELL and RAISE journey surfaces (nd).
   Faithful port of Test 33 / source/journeys.jsx. Each surface has working
   secondary tabs and a left Yulia rail + launcher (useYuliaRail). Outward-facing
   actions (send teaser, send deck) are gated by StagedConfirm — THE LINE: Yulia
   drafts but never contacts counterparties until the user confirms. Term-sheet
   comparison ends on "the decision is yours."

   PRESENTATIONAL ONLY — no data fetching, no network. All data arrives via typed
   props; callbacks via props. Honest-empty charts (EmptyChart "No live feed yet")
   are preserved by design; the integrator wires real-vs-empty later. Styling lives
   in nd.css (.mck-* under .nd-root). Primitives from ../primitives, chrome from
   ../chrome.
   ============================================================================ */
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Ic,
  YuliaMark,
  Avatar,
  Mono,
  Chip,
  Btn,
  IconBtn,
  StatusPill,
} from "../primitives";
import type { IcName, PillTone } from "../primitives";
import { Sidebar, TopBar, StagedConfirm, EmptyChart, useYuliaRail } from "../chrome";
import type { DockContext } from "../chrome";

/* ---------------- shared data shapes (derived from the design's arrays) ---------------- */

/** A secondary-tab descriptor for the in-surface Tabs row. */
export interface JourneyTab {
  key: string;
  label: string;
  ic: IcName;
}

/** State of the outward-action banner: idle → open (confirm) → done. */
export type ProcessBannerState = "idle" | "open" | "done";

/** A ranked counterparty row (buyer or investor). The two tables share this shape. */
export interface CounterpartyRow {
  /** Display name, e.g. "Lineage Logistics". */
  name: string;
  /** Avatar initials, e.g. "LL". */
  avatar: string;
  /** Avatar tone key (a|b|c|d). */
  tone?: string;
  /** Category label rendered in the Type column, e.g. "Strategic" / "Growth equity". */
  type: string;
  /** Capacity / check-size string, e.g. "$4.2B rev" or "$40–60M"; "—" renders muted. */
  capacity: string;
  /** Strategic rationale / thesis-fit prose. */
  rationale: string;
  /** Fit score 0–100 (drives the meter). */
  fit: number;
  /** Status label, e.g. "IOI received". */
  status: string;
  /** Status pill tone (neutral|ok|warn|risk|yulia). */
  statusTone: PillTone;
}

/** A row in a status/checklist card (deal materials, closing, investor materials). */
export interface ChecklistRow {
  title: string;
  detail: string;
  tone: PillTone;
  label: string;
}

/** A stage in the SELL process funnel. */
export interface FunnelStage {
  label: string;
  /** Count rendered at the right. */
  count: number;
  /** Bar fill width as a percentage 0–100. */
  width: number;
}

/** A KPI tile in the RAISE financial package. */
export interface PackageKpi {
  label: string;
  value: string;
}

/** A row in the RAISE term-sheet comparison (two offers, a + b). */
export interface TermRow {
  /** Term label, e.g. "Pre-money". */
  term: string;
  /** Value under the first offer (a). */
  a: string;
  /** Value under the second offer (b). */
  b: string;
}

/* ---------------- shared in-surface helpers (presentational) ---------------- */

/* Yulia process banner with confirm-first outward action (StagedConfirm gate). */
interface ProcessBannerProps {
  message: ReactNode;
  confirmTitle: string;
  confirmLines: { k: ReactNode; v: ReactNode }[];
  confirmLabel: string;
  cta: string;
  state: ProcessBannerState;
  setState: (s: ProcessBannerState) => void;
  onDismiss?: () => void;
  onConfirm?: () => void;
}
function ProcessBanner({
  message,
  confirmTitle,
  confirmLines,
  confirmLabel,
  cta,
  state,
  setState,
  onDismiss,
  onConfirm,
}: ProcessBannerProps) {
  if (state === "open") {
    return (
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <StagedConfirm
          title={confirmTitle}
          kv={confirmLines}
          note="Outward-facing — Yulia drafts but never contacts counterparties until you confirm."
          confirmLabel={confirmLabel}
          onConfirm={() => {
            setState("done");
            onConfirm && onConfirm();
          }}
          onCancel={() => setState("idle")}
        />
      </div>
    );
  }
  return (
    <div className="mck-row" style={{ gap: 12, padding: "12px 24px", background: "var(--accent-soft)", borderBottom: "1px solid var(--accent-line)" }}>
      <YuliaMark size={24} />
      <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>
        {state === "done" ? <>Done — outreach is out. I'll surface responses here as they land.</> : message}
      </span>
      {state !== "done" && (
        <div className="mck-row" style={{ gap: 8, marginLeft: "auto" }}>
          <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={onDismiss}>Dismiss</button>
          <button className="mck-btn mck-btn-ink mck-btn-sm" onClick={() => setState("open")}>{cta}</button>
        </div>
      )}
    </div>
  );
}

function FitCell({ score }: { score: number }) {
  return (
    <div className="mck-row" style={{ gap: 9 }}>
      <Mono className="mck-tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{score}</Mono>
      <span className="mck-meter"><span style={{ width: score + "%" }} /></span>
    </div>
  );
}

function Tabs({ tabs, active, onSelect }: { tabs: JourneyTab[]; active: string; onSelect: (key: string) => void }) {
  return (
    <div className="mck-row" style={{ gap: 4, padding: "8px 22px", borderBottom: "1px solid var(--line)" }}>
      {tabs.map((t) => (
        <button key={t.key} className={"mck-tab" + (t.key === active ? " is-active" : "")} onClick={() => onSelect(t.key)}>
          <Ic name={t.ic} size={14} />{t.label}
        </button>
      ))}
      <div className="mck-grow" />
    </div>
  );
}

function ScrollWrap({ children, max = 880 }: { children: ReactNode; max?: number }) {
  return (
    <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", padding: "30px 0" }}>
      <div style={{ maxWidth: max, margin: "0 auto", padding: "0 34px", display: "flex", flexDirection: "column", gap: 28 }}>{children}</div>
    </div>
  );
}

function SecHead({ n, title, action, onAction }: { n: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
      <span className="mck-eyebrow">{n}</span>
      <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>{title}</h2>
      <div className="mck-grow" />
      {action && <Btn variant="quiet" size="sm" icon="agent" onClick={onAction}>{action}</Btn>}
    </div>
  );
}

/* shared counterparty table (buyers + investors share the column shape) */
function CounterpartyTable({ rows, columns }: { rows: CounterpartyRow[]; columns: { name: string; type: string; capacity: string; rationale: string } }) {
  return (
    <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", padding: "6px 14px" }}>
      <table className="mck-tbl">
        <thead>
          <tr>
            <th style={{ paddingLeft: 14 }}>{columns.name}</th>
            <th>{columns.type}</th>
            <th>{columns.capacity}</th>
            <th>{columns.rationale}</th>
            <th>Fit</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.name}>
              <td style={{ paddingLeft: 14 }}>
                <div className="mck-row" style={{ gap: 11 }}>
                  <Avatar name={t.avatar} tone={t.tone} size={28} />
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</span>
                </div>
              </td>
              <td><StatusPill tone="neutral" dot={false}>{t.type}</StatusPill></td>
              <td><Mono className="mck-tnum" style={{ color: t.capacity === "—" ? "var(--ink-4)" : "var(--ink-2)" }}>{t.capacity}</Mono></td>
              <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{t.rationale}</td>
              <td><FitCell score={t.fit} /></td>
              <td><StatusPill tone={t.statusTone} dot={t.statusTone !== "neutral"}>{t.status}</StatusPill></td>
              <td style={{ width: 40 }}><IconBtn name="more" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* shared status/checklist card (deal materials, closing, investor materials).
   When `checked` is true, rows render a done/clock icon (closing variant). */
function ChecklistCard({ rows, checked = false }: { rows: ChecklistRow[]; checked?: boolean }) {
  return (
    <div className="mck-card" style={{ overflow: "hidden" }}>
      {rows.map((r, i) => (
        <div key={r.title} className="mck-row" style={{ gap: 13, padding: "13px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
          <span className={"mck-task-ic " + (checked && r.tone === "ok" ? "is-done" : "")}>
            <Ic name={checked ? (r.tone === "ok" ? "check" : "clock") : "doc"} size={13} />
          </span>
          <span className="mck-col" style={{ gap: 2 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</span>
            <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.detail}</span>
          </span>
          <span style={{ marginLeft: "auto" }}><StatusPill tone={r.tone} dot={r.tone !== "neutral"}>{r.label}</StatusPill></span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ SELL (Project Vela) */

const BUYERS_DEFAULT: CounterpartyRow[] = [
  { name: "Lineage Logistics", avatar: "LL", tone: "a", type: "Strategic", capacity: "$4.2B rev", rationale: "National cold-chain consolidator", fit: 96, status: "IOI received", statusTone: "ok" },
  { name: "Americold Realty", avatar: "AM", tone: "c", type: "Strategic", capacity: "$2.6B rev", rationale: "REIT — warehouse network synergy", fit: 92, status: "Teaser sent", statusTone: "neutral" },
  { name: "Blackstone Infra", avatar: "BX", tone: "c", type: "Financial", capacity: "$1.0B equity", rationale: "Cold-storage platform build-up", fit: 88, status: "NDA signed", statusTone: "ok" },
  { name: "KKR Infrastructure", avatar: "KK", tone: "d", type: "Financial", capacity: "$0.8B equity", rationale: "Logistics roll-up thesis", fit: 84, status: "Reviewing", statusTone: "warn" },
  { name: "Partners Group", avatar: "PG", tone: "d", type: "Financial", capacity: "$0.6B equity", rationale: "Yield + consolidation", fit: 79, status: "Reviewing", statusTone: "warn" },
  { name: "Stonepeak", avatar: "SP", tone: "d", type: "Financial", capacity: "—", rationale: "Passed — sector concentration", fit: 71, status: "Passed", statusTone: "risk" },
];

const SELL_MATERIALS_DEFAULT: ChecklistRow[] = [
  { title: "Blind teaser", detail: "Sent to 6 buyers", tone: "ok", label: "Live" },
  { title: "Information memorandum", detail: "v3 — board approved", tone: "ok", label: "Ready" },
  { title: "Management presentation", detail: "Yulia assembling", tone: "neutral", label: "Draft" },
  { title: "Data room index", detail: "388 files staged", tone: "ok", label: "Ready" },
];

const SELL_FUNNEL_DEFAULT: FunnelStage[] = [
  { label: "Buyers matched", count: 41, width: 100 },
  { label: "NDAs signed", count: 12, width: 60 },
  { label: "Teasers / CIM sent", count: 6, width: 38 },
  { label: "IOIs received", count: 3, width: 22 },
  { label: "LOIs", count: 1, width: 10 },
];

const SELL_CLOSING_DEFAULT: ChecklistRow[] = [
  { title: "Exclusivity granted", detail: "Lineage — 45-day window", tone: "ok", label: "Signed" },
  { title: "Confirmatory diligence", detail: "Buyer in data room", tone: "warn", label: "In progress" },
  { title: "Definitive agreement", detail: "Yulia red-lining v2", tone: "neutral", label: "Draft" },
  { title: "Regulatory", detail: "HSR filing prepared", tone: "neutral", label: "Pending" },
];

function CimPanel({ onAction }: { onAction?: (action: string) => void }) {
  return (
    <ScrollWrap max={760}>
      <section>
        <SecHead n="01" title="Confidential Information Memorandum" action="Re-draft" onAction={() => onAction && onAction("cim-redraft")} />
        <div className="mck-row" style={{ gap: 9, marginBottom: 16 }}>
          <span className="mck-pill mck-pill-yulia"><Ic name="agent" size={11} />drafted by Yulia · v3</span>
          <span className="mck-pill mck-pill-neutral">Confidential</span>
        </div>
        <div className="mck-card" style={{ padding: "28px 30px", maxWidth: 620 }}>
          <span className="mck-eyebrow">For qualified buyers · under NDA</span>
          <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", margin: "10px 0 18px" }}>Cohere Cold Storage — Information Memorandum</h1>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 7px" }}>1 · Business overview</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 18px", color: "var(--ink)" }}>
            Cohere operates <b>11 temperature-controlled facilities</b> across the Pacific Northwest, serving pharma and
            grocery clients with 18M cubic feet of capacity and a 94% utilization rate.
          </p>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 7px" }}>2 · Financial summary</h2>
          <EmptyChart icon="bars" h={120} title="No live feed yet" sub="Revenue & EBITDA bridge plots once the audited financials are linked." />
        </div>
      </section>
      <section>
        <SecHead n="02" title="Deal materials" />
        <ChecklistCard rows={SELL_MATERIALS_DEFAULT} />
      </section>
    </ScrollWrap>
  );
}

function FunnelPanel({ stages, onAction }: { stages: FunnelStage[]; onAction?: (action: string) => void }) {
  return (
    <ScrollWrap>
      <section>
        <SecHead n="01" title="Process funnel" action="Update" onAction={() => onAction && onAction("funnel-update")} />
        <div className="mck-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {stages.map((s) => (
            <div key={s.label} className="mck-row" style={{ gap: 14 }}>
              <span style={{ width: 150, flex: "0 0 150px", fontSize: 12.5 }}>{s.label}</span>
              <div className="mck-grow" style={{ height: 22, borderRadius: 6, background: "var(--surface-3)", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: s.width + "%", background: "var(--ink)", borderRadius: 6 }} />
              </div>
              <Mono className="mck-tnum" style={{ width: 32, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{s.count}</Mono>
            </div>
          ))}
        </div>
      </section>
    </ScrollWrap>
  );
}

export interface SellProps {
  /** Deal identity for the top bar. */
  deal?: string;
  target?: string;
  side?: string;
  stageActive?: string;
  /** Ranked buyer list. */
  buyers?: CounterpartyRow[];
  /** Total qualified buyers (the count beside the filter chips and in the banner). */
  buyerCount?: number;
  /** How many top buyers the teaser would go to. */
  teaserCount?: number;
  /** Deal-materials checklist (Teaser & CIM tab). */
  materials?: ChecklistRow[];
  /** Process-funnel stages (Process tracker tab). */
  funnel?: FunnelStage[];
  /** Closing checklist (Closing tab). */
  closing?: ChecklistRow[];
  /** Override the Yulia rail context for this deal. */
  yuliaContext?: DockContext;
  /** Render an opened artifact body on the canvas (integrator wires the real canvas). */
  renderArtifact?: (key: string) => ReactNode;
  onHome?: () => void;
  onNav?: (key: string) => void;
  /** Fired on confirmed teaser send (after the StagedConfirm gate). */
  onConfirm?: () => void;
  /** Fired when a section action (Re-draft / Update / Re-check) is clicked. */
  onAction?: (action: string) => void;
}
export function Sell({
  deal = "Project Vela",
  target = "Cohere Cold Storage",
  side = "sell-side",
  stageActive = "Market matching",
  buyers = BUYERS_DEFAULT,
  buyerCount = 41,
  teaserCount = 6,
  materials = SELL_MATERIALS_DEFAULT,
  funnel = SELL_FUNNEL_DEFAULT,
  closing = SELL_CLOSING_DEFAULT,
  yuliaContext,
  renderArtifact,
  onHome,
  onNav,
  onConfirm,
  onAction,
}: SellProps) {
  const yulia = useYuliaRail("Project Vela", "Market matching", { context: yuliaContext, renderArtifact });
  const [banner, setBanner] = useState<ProcessBannerState>("idle");
  const [tab, setTab] = useState("buyers");
  const tabs: JourneyTab[] = [
    { key: "cim", label: "Teaser & CIM", ic: "doc" },
    { key: "buyers", label: "Buyer list", ic: "target" },
    { key: "tracker", label: "Process tracker", ic: "bars" },
    { key: "closing", label: "Closing", ic: "st_close" },
  ];
  return (
    <div className="mck">
      <Sidebar active="matching" journey="SELL" onHome={onHome} onNav={onNav} />
      {yulia.rail}
      {yulia.wrap(
        <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
          <TopBar deal={deal} target={target} side={side} journey="SELL" stageActive={stageActive} onHome={onHome} />
          <Tabs tabs={tabs} active={tab} onSelect={setTab} />
          {tab === "buyers" && (
            <>
              <ProcessBanner
                state={banner}
                setState={setBanner}
                message={<>I ranked <b>{buyerCount} qualified buyers</b> by fit &amp; strategic rationale. <b>{teaserCount}</b> are ready for the teaser — want me to run outreach?</>}
                cta={`Run teaser to top ${teaserCount}`}
                confirmTitle={`Send teaser to ${teaserCount} buyers`}
                confirmLabel={`Send ${teaserCount}`}
                confirmLines={[
                  { k: "Action", v: `Send blind teaser to ${teaserCount} ranked buyers` },
                  { k: "From", v: "dana@greenhill.com · staggered, logged" },
                  { k: "Attached", v: "Anonymized teaser — no company name" },
                ]}
                onConfirm={onConfirm}
              />
              <div className="mck-row" style={{ gap: 9, padding: "11px 24px", borderBottom: "1px solid var(--line)" }}>
                <span className="mck-row" style={{ gap: 7, fontSize: 12.5, color: "var(--ink-2)" }}><b style={{ color: "var(--ink)" }}>{buyerCount}</b> buyers</span>
                <span style={{ color: "var(--line)" }}>|</span>
                <Chip icon="check" active>Strategic + Financial</Chip>
                <Chip active>Cold-chain fit</Chip>
                <Chip icon="plus">Add filter</Chip>
                <div className="mck-grow" />
                <Chip icon="chevUpDown">Sort · Fit score</Chip>
              </div>
              <CounterpartyTable rows={buyers} columns={{ name: "Buyer", type: "Type", capacity: "Capacity", rationale: "Strategic rationale" }} />
            </>
          )}
          {tab === "cim" && <CimPanel onAction={onAction} />}
          {tab === "tracker" && <FunnelPanel stages={funnel} onAction={onAction} />}
          {tab === "closing" && (
            <ScrollWrap>
              <section>
                <SecHead n="01" title="To close" action="Re-check" onAction={() => onAction && onAction("closing-recheck")} />
                <ChecklistCard rows={closing} checked />
              </section>
            </ScrollWrap>
          )}
        </div>
      )}
      {yulia.launcher}
    </div>
  );
}

/* ============================================================ RAISE (Project Ember) */

const INVESTORS_DEFAULT: CounterpartyRow[] = [
  { name: "TPG Growth", avatar: "TP", tone: "a", type: "Growth equity", capacity: "$40–60M", rationale: "Consumer scale-up thesis", fit: 95, status: "Term sheet", statusTone: "ok" },
  { name: "L Catterton", avatar: "LC", tone: "c", type: "Consumer PE", capacity: "$30–50M", rationale: "Brand & distribution playbook", fit: 90, status: "IOI received", statusTone: "ok" },
  { name: "General Atlantic", avatar: "GA", tone: "c", type: "Growth equity", capacity: "$50M", rationale: "Category leadership", fit: 86, status: "Reviewing", statusTone: "warn" },
  { name: "Stripes", avatar: "ST", tone: "d", type: "Growth equity", capacity: "$25M", rationale: "Operator-led scaling", fit: 81, status: "Reviewing", statusTone: "warn" },
  { name: "Bain Double Impact", avatar: "BD", tone: "d", type: "Impact PE", capacity: "$20M", rationale: "Sustainable foods mandate", fit: 76, status: "Intro’d", statusTone: "neutral" },
  { name: "CAVU Ventures", avatar: "CV", tone: "d", type: "Venture", capacity: "—", rationale: "Passed — stage fit", fit: 70, status: "Passed", statusTone: "risk" },
];

const RAISE_KPIS_DEFAULT: PackageKpi[] = [
  { label: "ARR", value: "$24.0M" },
  { label: "YoY growth", value: "68%" },
  { label: "Gross margin", value: "61%" },
  { label: "Net burn / mo", value: "$1.2M" },
];

const RAISE_MATERIALS_DEFAULT: ChecklistRow[] = [
  { title: "Series B deck", detail: "v4 — board approved", tone: "ok", label: "Ready" },
  { title: "Cap-table model", detail: "Pre/post-money + dilution", tone: "ok", label: "Ready" },
  { title: "Data room", detail: "142 files staged", tone: "ok", label: "Ready" },
  { title: "Reference list", detail: "Yulia assembling customer refs", tone: "neutral", label: "Draft" },
  { title: "Product demo video", detail: "Not started", tone: "neutral", label: "To do" },
];

const RAISE_TERMS_DEFAULT: TermRow[] = [
  { term: "Pre-money", a: "$210M", b: "$185M" },
  { term: "Round size", a: "$50M", b: "$40M" },
  { term: "Liquidation pref", a: "1× non-part.", b: "1× non-part." },
  { term: "Board seats", a: "1 of 5", b: "1 of 5 + obs." },
  { term: "Option pool", a: "10% post", b: "12% post" },
  { term: "Pro-rata", a: "Yes", b: "Yes" },
];

/** Identity for the two offers compared in the term-sheet table. */
export interface TermOffer {
  name: string;
  avatar: string;
  tone?: string;
  /** Optional status pill (the leading offer shows "Term sheet"). */
  statusLabel?: string;
  statusTone?: PillTone;
}
const TERM_OFFERS_DEFAULT: [TermOffer, TermOffer] = [
  { name: "TPG Growth", avatar: "TP", tone: "a", statusLabel: "Term sheet", statusTone: "ok" },
  { name: "L Catterton", avatar: "LC", tone: "c" },
];

function PackagePanel({ kpis, onAction }: { kpis: PackageKpi[]; onAction?: (action: string) => void }) {
  return (
    <ScrollWrap>
      <section>
        <SecHead n="01" title="Financial package" action="Refresh" onAction={() => onAction && onAction("package-refresh")} />
        <div className="mck-row" style={{ gap: 13, marginBottom: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} className="mck-card mck-grow" style={{ padding: "13px 15px" }}>
              <div className="mck-kv"><span className="mck-kv-k">{k.label}</span><span className="mck-kv-v mck-tnum">{k.value}</span></div>
            </div>
          ))}
        </div>
        <div className="mck-card" style={{ padding: 18 }}>
          <div className="mck-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>ARR trajectory</span>
            <span className="mck-eyebrow">$M</span>
          </div>
          <EmptyChart icon="bars" title="No live feed yet" sub="Connect the billing system and Yulia will plot ARR by month." />
        </div>
      </section>
    </ScrollWrap>
  );
}

function MaterialsPanel({ rows, onAction }: { rows: ChecklistRow[]; onAction?: (action: string) => void }) {
  return (
    <ScrollWrap>
      <section>
        <SecHead n="01" title="Investor materials" action="Refine" onAction={() => onAction && onAction("materials-refine")} />
        <ChecklistCard rows={rows} />
      </section>
    </ScrollWrap>
  );
}

function TermsPanel({ terms, offers, onAction }: { terms: TermRow[]; offers: [TermOffer, TermOffer]; onAction?: (action: string) => void }) {
  const [a, b] = offers;
  return (
    <ScrollWrap>
      <section>
        <SecHead n="01" title="Term sheet comparison" action="Summarize" onAction={() => onAction && onAction("terms-summarize")} />
        <div className="mck-card" style={{ overflow: "hidden" }}>
          <div className="mck-row" style={{ padding: "13px 18px", gap: 14 }}>
            <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-3)" }}>Term</span>
            <span style={{ width: 150, flex: "0 0 150px" }}>
              <div className="mck-row" style={{ gap: 8 }}>
                <Avatar name={a.avatar} tone={a.tone} size={20} />
                <b style={{ fontSize: 12.5 }}>{a.name}</b>
                {a.statusLabel && <StatusPill tone={a.statusTone || "ok"} dot>{a.statusLabel}</StatusPill>}
              </div>
            </span>
            <span style={{ width: 150, flex: "0 0 150px" }}>
              <div className="mck-row" style={{ gap: 8 }}>
                <Avatar name={b.avatar} tone={b.tone} size={20} />
                <b style={{ fontSize: 12.5 }}>{b.name}</b>
                {b.statusLabel && <StatusPill tone={b.statusTone || "ok"} dot>{b.statusLabel}</StatusPill>}
              </div>
            </span>
          </div>
          <div className="mck-hr" />
          {terms.map((t, i) => (
            <div key={t.term} className="mck-row" style={{ padding: "12px 18px", gap: 14, borderTop: i ? "1px solid var(--line-2)" : "none" }}>
              <span style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>{t.term}</span>
              <Mono className="mck-tnum" style={{ width: 150, flex: "0 0 150px", fontSize: 12.5, fontWeight: 600 }}>{t.a}</Mono>
              <Mono className="mck-tnum" style={{ width: 150, flex: "0 0 150px", fontSize: 12.5 }}>{t.b}</Mono>
            </div>
          ))}
        </div>
        <div className="mck-row" style={{ gap: 9, marginTop: 14, padding: "12px 15px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 11 }}>
          <YuliaMark size={22} />
          <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>{a.name} is higher on price; {b.name} offers more operating support. I laid out the dilution implications of each — <b>the decision is yours.</b></span>
        </div>
      </section>
    </ScrollWrap>
  );
}

export interface RaiseProps {
  /** Deal identity for the top bar. */
  deal?: string;
  target?: string;
  side?: string;
  stageActive?: string;
  /** Ranked investor list. */
  investors?: CounterpartyRow[];
  /** Total ranked investors (count beside filter chips and in the banner). */
  investorCount?: number;
  /** How many warm investors the deck would go to. */
  deckCount?: number;
  /** Financial-package KPI tiles. */
  kpis?: PackageKpi[];
  /** Investor-materials checklist. */
  materials?: ChecklistRow[];
  /** Term-sheet comparison rows. */
  terms?: TermRow[];
  /** The two offers compared in the term-sheet header. */
  termOffers?: [TermOffer, TermOffer];
  /** Override the Yulia rail context for this deal. */
  yuliaContext?: DockContext;
  /** Render an opened artifact body on the canvas (integrator wires the real canvas). */
  renderArtifact?: (key: string) => ReactNode;
  onHome?: () => void;
  onNav?: (key: string) => void;
  /** Fired on confirmed deck send (after the StagedConfirm gate). */
  onConfirm?: () => void;
  /** Fired when a section action (Refresh / Refine / Summarize) is clicked. */
  onAction?: (action: string) => void;
}
export function Raise({
  deal = "Project Ember",
  target = "Atlas Foods",
  side = "capital raise",
  stageActive = "Outreach",
  investors = INVESTORS_DEFAULT,
  investorCount = 38,
  deckCount = 6,
  kpis = RAISE_KPIS_DEFAULT,
  materials = RAISE_MATERIALS_DEFAULT,
  terms = RAISE_TERMS_DEFAULT,
  termOffers = TERM_OFFERS_DEFAULT,
  yuliaContext,
  renderArtifact,
  onHome,
  onNav,
  onConfirm,
  onAction,
}: RaiseProps) {
  const yulia = useYuliaRail("Project Ember", "Outreach", { context: yuliaContext, renderArtifact });
  const [banner, setBanner] = useState<ProcessBannerState>("idle");
  const [tab, setTab] = useState("outreach");
  const tabs: JourneyTab[] = [
    { key: "package", label: "Financial package", ic: "bars" },
    { key: "materials", label: "Investor materials", ic: "doc" },
    { key: "outreach", label: "Outreach", ic: "target" },
    { key: "terms", label: "Terms", ic: "sliders" },
  ];
  return (
    <div className="mck">
      <Sidebar active="outreach" journey="RAISE" onHome={onHome} onNav={onNav} />
      {yulia.rail}
      {yulia.wrap(
        <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
          <TopBar deal={deal} target={target} side={side} journey="RAISE" stageActive={stageActive} onHome={onHome} />
          <Tabs tabs={tabs} active={tab} onSelect={setTab} />
          {tab === "outreach" && (
            <>
              <ProcessBanner
                state={banner}
                setState={setBanner}
                message={<>The investor materials are ready and I ranked <b>{investorCount} investors</b> by thesis fit. <b>{deckCount}</b> are warm — want me to send the deck?</>}
                cta={`Send deck to top ${deckCount}`}
                confirmTitle={`Send investor deck to ${deckCount} funds`}
                confirmLabel={`Send ${deckCount}`}
                confirmLines={[
                  { k: "Action", v: `Share data-room link + deck with ${deckCount} ranked investors` },
                  { k: "From", v: "dana@greenhill.com · tracked links" },
                  { k: "Attached", v: "Series B deck v4 — board-approved" },
                ]}
                onConfirm={onConfirm}
              />
              <div className="mck-row" style={{ gap: 9, padding: "11px 24px", borderBottom: "1px solid var(--line)" }}>
                <span className="mck-row" style={{ gap: 7, fontSize: 12.5, color: "var(--ink-2)" }}><b style={{ color: "var(--ink)" }}>{investorCount}</b> investors</span>
                <span style={{ color: "var(--line)" }}>|</span>
                <Chip icon="check" active>Consumer / growth</Chip>
                <Chip active>$15M+ checks</Chip>
                <Chip icon="plus">Add filter</Chip>
                <div className="mck-grow" />
                <Chip icon="chevUpDown">Sort · Fit score</Chip>
              </div>
              <CounterpartyTable rows={investors} columns={{ name: "Investor", type: "Type", capacity: "Check size", rationale: "Thesis fit" }} />
            </>
          )}
          {tab === "package" && <PackagePanel kpis={kpis} onAction={onAction} />}
          {tab === "materials" && <MaterialsPanel rows={materials} onAction={onAction} />}
          {tab === "terms" && <TermsPanel terms={terms} offers={termOffers} onAction={onAction} />}
        </div>
      )}
      {yulia.launcher}
    </div>
  );
}
