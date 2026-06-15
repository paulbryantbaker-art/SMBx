/**
 * CDDealsList — the "See all" full deals list, ported to the Claude-Design
 * (cool/indigo) language. Visual target is the CD "Ultra Modern Fintech"
 * portfolio list rows (portfolio.jsx): a color rail, name→open, league/journey/
 * gate, asking, and a verdict pill, with a search + journey/stage chip rail and
 * the same 100-row client-side pagination as the V6 predecessor.
 *
 * Data is wired EXACTLY like V6DealsListView: useV6WorkspaceData().deals (the
 * full uncapped /api/deals array), the same SAMPLE_DEALS fallback for logged-out
 * dev, the same journey/stage/query filtering, the same listVerdict tint, and
 * the same `openTab({ kind: "deal", ... })` open. Every value is real or honestly
 * "—": no fabricated multiple, score, or trend. Rows open the deal detail where
 * rich data loads on demand.
 *
 * Mounts under `.cd-root` (cdTokens.css); only `--cd-*` tokens.
 */
import { useMemo, useState, type ReactNode } from "react";
import type { OpenTab } from "../../v6/types";
import { type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import { PIPELINE_STAGES, stageForGate, type PipelineStageId } from "../../../lib/pipelineStages";
import {
  CDIcon, CDPill, CDLeagueBadge,
  cdFmtCents, cdDealColor, type CDTone,
} from "../kit/cdUi";

/* ─── verdict + journey vocabulary (mirrors V6DealsListView / CDPipeline) ─── */
type Verdict = "pursue" | "watch" | "pass";
const VERDICT_TONE: Record<Verdict, CDTone> = { pursue: "pos", watch: "warn", pass: "neg" };
const VERDICT_WORD: Record<Verdict, string> = { pursue: "Pursue", watch: "Watch", pass: "Pass" };
const JOURNEY_TONE: Record<string, CDTone> = { BUY: "accent", SELL: "pos", RAISE: "warn", PMI: "neutral" };
const JOURNEY_LABEL: Record<string, string> = { buy: "Buy", sell: "Sell", raise: "Raise", pmi: "PMI" };

// Mirrors V6DealsListView.listVerdict / PipelineRoot.dealVerdict so the verdict
// pill agrees with the Pipeline ledger for the same deal.
function listVerdict(d: WorkspaceDeal): Verdict {
  const label = String(d.financials?.status_label ?? "").toLowerCase();
  if (/loi|closing|negotiat|pursu|signed/.test(label)) return "pursue";
  if (/pass|cold|drop|reject/.test(label)) return "pass";
  const gate = d.current_gate ?? "";
  if (/[BSR]4|[BSR]5/.test(gate)) return "pursue";
  return "watch";
}

function dealTitle(d: WorkspaceDeal): string {
  return d.business_name?.trim() || `Deal #SMBX-${String(d.id).padStart(4, "0")}`;
}

// Deterministic sample set so the layout (and long-list behavior) is visible in
// local dev / logged-out, where canFetch is false and workspace.deals is empty.
// Identical shape to V6DealsListView.SAMPLE_DEALS.
const SAMPLE_DEALS: WorkspaceDeal[] = Array.from({ length: 60 }, (_, i) => {
  const journeys = ["buy", "sell", "raise", "pmi"];
  const industries = ["HVAC", "Software/SaaS", "Logistics", "Healthcare Tech", "E-commerce", "Manufacturing", "Staffing", "Dental Services"];
  const locs = ["Austin, TX", "Cleveland, OH", "Denver, CO", "Tampa, FL", "Phoenix, AZ", "Boise, ID"];
  const names = ["Apex", "Velocity", "Prime", "Summit", "Global", "Elite", "Tech", "Lakeshore", "Atlas", "Comfort"];
  const leagues = ["L1", "L2", "L3", "L4", "L5"];
  const gates = ["B1", "B2", "B3", "S2", "R2", "PMI1"];
  const statuses = ["active", "active", "active", "stalled", "closed"];
  const ind = industries[i % industries.length];
  return {
    id: 9000 + i,
    business_name: `${names[i % names.length]} ${ind.split("/")[0]} ${100 + i}`,
    industry: ind,
    location: locs[i % locs.length],
    league: leagues[i % leagues.length],
    current_gate: gates[i % gates.length],
    journey_type: journeys[i % journeys.length],
    status: statuses[i % statuses.length],
    revenue: (1 + (i % 9)) * 100_000_000,
    sde: (1 + (i % 5)) * 40_000_000,
    ebitda: (1 + (i % 6)) * 30_000_000,
    asking_price: (2 + (i % 12)) * 80_000_000,
    financials: null,
    updated_at: "2026-05-15",
    created_at: "2026-01-01",
  };
});

type JourneyFilter = "all" | "buy" | "sell" | "raise" | "pmi";

// Full-list pagination law (both platforms): render up to 100 rows, then a
// full-width "Show next 100" button appends the next client-side page.
const PAGE_SIZE = 100;

interface Props {
  view?: "all";
  /** Preselected pipeline-stage filter — set when a Pipeline "See all in
   *  {stage}" link or stage-header click opens this view. The stage chips
   *  let the user change or clear it. */
  initialStage?: string;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

const STAGE_IDS = new Set<string>(PIPELINE_STAGES.map(s => s.id));

export function CDDealsList({ initialStage, openTab, onTalkToYulia, user }: Props) {
  const workspace = useV6WorkspaceData(user);
  const [query, setQuery] = useState("");
  const [journey, setJourney] = useState<JourneyFilter>("all");
  const [stage, setStage] = useState<PipelineStageId | "all">(
    initialStage && STAGE_IDS.has(initialStage) ? (initialStage as PipelineStageId) : "all",
  );
  const [limit, setLimit] = useState(PAGE_SIZE);

  const isSample = !workspace.canFetch;
  const allDeals = isSample ? SAMPLE_DEALS : workspace.deals;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDeals.filter(d => {
      if (journey !== "all" && (d.journey_type || "").toLowerCase() !== journey) return false;
      if (stage !== "all" && stageForGate(d.current_gate || "B2") !== stage) return false;
      if (!q) return true;
      return [d.business_name, d.industry, d.location, d.league, d.current_gate].some(v => (v || "").toLowerCase().includes(q));
    });
  }, [allDeals, query, journey, stage]);

  // Paginate at 100; search + chips narrow within the full set (and reset paging).
  const shown = filtered.slice(0, limit);

  const openDeal = (d: WorkspaceDeal) =>
    openTab({ kind: "deal", id: String(d.id), title: dealTitle(d), dealId: d.id, dealTitle: d.business_name });

  const loading = workspace.canFetch && workspace.loading && allDeals.length === 0;

  const subline = loading
    ? "Loading deals…"
    : filtered.length > shown.length
      ? <>Showing <span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink)" }}>{shown.length}</span> of {filtered.length} deals{isSample ? " · sample data" : ""}</>
      : <><span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink)" }}>{filtered.length}</span>{filtered.length !== allDeals.length ? ` of ${allDeals.length}` : ""} {allDeals.length === 1 ? "deal" : "deals"}{isSample ? " · sample data" : ""}</>;

  return (
    <div className="cd-root cd-scrollable" style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 38, lineHeight: 1.03, letterSpacing: "-0.02em" }}>All deals</h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14 }}>{subline}</p>
        </div>
        {onTalkToYulia && (
          <div style={{ flexShrink: 0 }}>
            <PrimaryBtn onClick={() => onTalkToYulia("Help me source or add a deal to my pipeline.")}>
              <CDIcon name="plus" size={14} color="white" />New deal
            </PrimaryBtn>
          </div>
        )}
      </div>

      {/* search + journey/stage chip rail */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 280px", minWidth: 220, background: "var(--cd-surface)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "10px 14px", boxShadow: "var(--cd-shadow-sm)" }}>
          <CDIcon name="search" size={16} color="var(--cd-ink-3)" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
            placeholder="Search by name, industry, location, league, gate…"
            aria-label="Search deals"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--cd-ink)", fontSize: 13.5, fontFamily: "var(--cd-sans)" }}
          />
        </div>
        <div role="group" aria-label="Filter by journey" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "buy", "sell", "raise", "pmi"] as const).map(j => (
            <FilterChip key={j} active={journey === j} onClick={() => { setJourney(j); setLimit(PAGE_SIZE); }}>
              {j === "all" ? "All" : JOURNEY_LABEL[j]}
            </FilterChip>
          ))}
        </div>
        {/* Stage chips — same five stages the Pipeline groups by, so a
            "See all in Source" link lands here already narrowed. */}
        <div role="group" aria-label="Filter by stage" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <FilterChip active={stage === "all"} onClick={() => { setStage("all"); setLimit(PAGE_SIZE); }}>All stages</FilterChip>
          {PIPELINE_STAGES.map(s => (
            <FilterChip key={s.id} active={stage === s.id} onClick={() => { setStage(s.id); setLimit(PAGE_SIZE); }}>{s.title}</FilterChip>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="cd-skel" style={{ height: 62, borderRadius: "var(--cd-r-lg)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", padding: "44px 24px", textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>{allDeals.length === 0 ? "No deals yet" : "No matching deals"}</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>{allDeals.length === 0 ? "When you add a deal it shows up here." : "Try a different search or filter."}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", overflow: "hidden" }}>
          {/* column header — desktop only */}
          <div className="cd-deals-head" style={{ display: "grid", gridTemplateColumns: "minmax(0,2.4fr) 78px 110px 1fr 1fr 96px", gap: 14, alignItems: "center", padding: "11px 18px", borderBottom: "1px solid var(--cd-line)", background: "var(--cd-surface-2)" }}>
            <HeadCell>Deal</HeadCell>
            <HeadCell>Journey</HeadCell>
            <HeadCell>Stage</HeadCell>
            <HeadCell align="right">SDE</HeadCell>
            <HeadCell align="right">Asking</HeadCell>
            <HeadCell align="right">Verdict</HeadCell>
          </div>

          {shown.map((d, i) => {
            const color = cdDealColor(d.id);
            const verdict = listVerdict(d);
            const journeyKey = (d.journey_type || "").toUpperCase();
            const journeyText = JOURNEY_LABEL[(d.journey_type || "").toLowerCase()] || d.journey_type || "—";
            const league = parseInt(String(d.league || "").replace(/\D/g, ""), 10) || null;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => openDeal(d)}
                className="cd-deal-row"
                style={{
                  all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%",
                  display: "grid", gridTemplateColumns: "minmax(0,2.4fr) 78px 110px 1fr 1fr 96px", gap: 14, alignItems: "center",
                  padding: "13px 18px", borderTop: i === 0 ? "none" : "1px solid var(--cd-line)",
                }}
              >
                {/* Deal — color rail · name · industry · location */}
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <span style={{ width: 7, height: 30, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dealTitle(d)}</span>
                      {league != null && <CDLeagueBadge league={league} />}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                      {[d.industry, d.location].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                </div>

                {/* Journey */}
                <div style={{ minWidth: 0 }}>
                  <CDPill tone={JOURNEY_TONE[journeyKey] || "neutral"}>{journeyText}</CDPill>
                </div>

                {/* Stage / gate */}
                <div style={{ minWidth: 0 }}>
                  <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
                    {d.current_gate || "—"}
                  </span>
                </div>

                {/* SDE */}
                <div className="cd-num" style={{ textAlign: "right", fontSize: 13.5, fontWeight: 600, color: "var(--cd-ink)" }}>{cdFmtCents(d.sde)}</div>

                {/* Asking */}
                <div className="cd-num" style={{ textAlign: "right", fontSize: 13.5, fontWeight: 600, color: "var(--cd-ink)" }}>{cdFmtCents(d.asking_price)}</div>

                {/* Verdict */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <CDPill tone={VERDICT_TONE[verdict]}>{VERDICT_WORD[verdict]}</CDPill>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > shown.length && (
        <button
          type="button"
          onClick={() => setLimit(l => l + PAGE_SIZE)}
          style={{
            all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            width: "100%", padding: "13px 0", background: "var(--cd-surface)",
            border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-sm)",
            cursor: "pointer", color: "var(--cd-accent-strong)", fontWeight: 600, fontSize: 13, fontFamily: "var(--cd-sans)",
          }}
        >
          Show next 100<CDIcon name="chevdown" size={14} color="var(--cd-accent)" />
        </button>
      )}
    </div>
  );
}

/* ─── atoms ──────────────────────────────────────────────────────────────── */
function HeadCell({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <span className="cd-eyebrow" style={{ textAlign: align, display: "block" }}>{children}</span>;
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        all: "unset", boxSizing: "border-box", cursor: "pointer",
        padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, fontFamily: "var(--cd-sans)",
        border: `1px solid ${active ? "var(--cd-accent)" : "var(--cd-line-2)"}`,
        background: active ? "var(--cd-accent)" : "var(--cd-surface)",
        color: active ? "white" : "var(--cd-ink-2)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "9px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap", boxShadow: "var(--cd-shadow-sm)" }}>{children}</button>
  );
}

export default CDDealsList;
