import { useState, Fragment } from "react";
import { V6Icon } from "../icons";
import type { Verdict } from "./cards";
import type { IconName, OpenTab } from "../types";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useTodayOperatingBrief, type TodayDealPulseItem, type TodayDefinitiveDealState, type TodayGateCountdownItem, type TodayModelRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  executeSurfaceAction,
  actionDealTitle,
  pickActionDeal,
  type ActionDeal,
} from "../../../lib/v6ActionContracts";
import type { SurfaceActionId } from "../../../lib/v6SurfaceActions";
import { buildBigFakeInvestmentBoardTab } from "../../../lib/sampleInvestmentBoard";
import { GATE_MAP, getGateV19Requirements, getJourneyGates, getNextGate } from "@shared/gateRegistry";
import { PIPELINE_STAGES, stageForGate, type PipelineStageId } from "../../../lib/pipelineStages";

interface PipelineDeal {
  verdict: Verdict;
  id: string;
  name: string;
  sub: string;
  fit: number;
  sde: string;
  multiple: string;
  note: string;
  league: string;
  journey: "buy" | "sell" | "raise" | "pmi";
  gateId: string;
  gateName: string;
  nextGateName: string;
  stageId: PipelineStageId;
  methodologyProgress: number;
  requiredModels: number;
  requiredCitations: number;
  blocker: string;
  yuliaMove: string;
  modelRefreshCount?: number;
  modelRefreshReason?: string;
  modelRefreshLabel?: string;
  definitive?: TodayDefinitiveDealState;
}

type PipelineSurfaceAction = "drafts" | "analysis" | "buyers";
type PipelineShortcutAction = PipelineSurfaceAction | "rank" | "blockers" | "models" | "files" | "touch";

interface PipelineShortcut {
  action: PipelineShortcutAction;
  title: string;
  sub: string;
  icon: IconName;
  tone: "gold" | "blue" | "green" | "slate" | "rose" | "violet";
}

const PIPELINE_SHORTCUTS: PipelineShortcut[] = [
  { action: "blockers", title: "Show blockers", sub: "List what stops each deal from moving gates.", icon: "pin", tone: "rose" },
  { action: "models", title: "Refresh model stack", sub: "Check required models, citations, and stale outputs.", icon: "chart", tone: "violet" },
  { action: "files", title: "Review files", sub: "Open diligence docs and data-room items needing attention.", icon: "library", tone: "gold" },
  { action: "buyers", title: "Find buyers", sub: "Start discovery from the selected deal thesis.", icon: "search", tone: "green" },
  { action: "touch", title: "Prep next touch", sub: "Draft the next buyer, seller, lender, or counsel note.", icon: "doc", tone: "slate" },
];

const SAMPLE_DEALS: PipelineDeal[] = [
  enrichPipelineDeal({ verdict: "pursue", id: "deal-bigfake", name: "Big Fake Deal", sub: "$5.4M · East Texas", fit: 92, sde: "$1.80M", multiple: "7.0x", note: "Recurring revenue. Honest add-backs. Working-cap language needs one more pass.", league: "L3", gateId: "B3", blocker: "NWC/add-back support" }),
  enrichPipelineDeal({ verdict: "pursue", id: "deal-pest", name: "Pest Control · FL", sub: "$2.1M · recurring route density", fit: 88, sde: "$1.40M", multiple: "6.5x", note: "Route density is stronger than first read. Ask for churn by route before moving up.", league: "L2", gateId: "B2", blocker: "Churn by route" }),
  enrichPipelineDeal({ verdict: "watch", id: "deal-hvac", name: "HVAC platform · CO", sub: "$4.8M · service mix under review", fit: 71, sde: "$0.95M", multiple: "6.8x", note: "Clean financials, but succession risk is still the story.", league: "L3", gateId: "B3", blocker: "Succession risk" }),
  enrichPipelineDeal({ verdict: "watch", id: "deal-electrical", name: "Electrical Contractor · TX", sub: "$8.7M · Austin", fit: 78, sde: "$2.10M", multiple: "6.0x", note: "Margins are good. Customer concentration keeps it from being a pursue yet.", league: "L3", gateId: "B2", blocker: "Customer concentration" }),
  enrichPipelineDeal({ verdict: "pass", id: "deal-dist", name: "Distribution · OH", sub: "$11.2M · Cleveland", fit: 61, sde: "$1.55M", multiple: "8.5x", note: "Asking is rich, margins are thin, and inventory turns are slowing.", league: "L3", gateId: "B1", blocker: "Inventory turns" }),
];

interface PipelineRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  modelPreference?: ModelPreference;
}

export function V6PipelineRoot({ openTab, onTalkToYulia, user, modelPreference }: PipelineRootProps) {
  const home = useHomeDeals(user);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<"active" | "pursue" | "watch" | "pass">("active");
  const [query, setQuery] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const useSampleData = !home.isAuthed || DEV_AUTH_BYPASS;
  const operating = useTodayOperatingBrief(user, home.isAuthed && !DEV_AUTH_BYPASS);
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const operatingDeals = operating.brief?.dealPulse ?? [];
  const gateCountdown = useSampleData ? [] : (operating.brief?.gateCountdown ?? []);
  const modelRefreshNeeds = useSampleData ? [] : (operating.brief?.modelRefreshNeeds ?? []);
  const gateCountdownByDeal = new Map(gateCountdown.map(item => [item.dealId, item]));
  const modelRefreshByDeal = groupModelRefreshByDeal(modelRefreshNeeds);
  // Full pipeline: EVERY deal the user owns, grouped by stage below. Deals that
  // also appear in the operating brief get its richer read (DealState, model
  // reruns); the rest map from the base deal record.
  const operatingById = new Map(
    operatingDeals.map(item => [item.dealId, dealPulseToPipelineDeal(item, gateCountdownByDeal.get(item.dealId), modelRefreshByDeal.get(item.dealId) ?? [])]),
  );
  const deals = useSampleData
    ? SAMPLE_DEALS
    : home.all.map(d => operatingById.get(String(d.id)) ?? dealToPipelineDeal(d));

  const pursue = deals.filter(d => d.verdict === "pursue");
  const watch = deals.filter(d => d.verdict === "watch");
  const pass = deals.filter(d => d.verdict === "pass");
  const selectedHomeDeal = useSampleData ? null : pickActionDeal(realDeals);
  const actionDeal = selectedHomeDeal ? homeDealToActionDeal(selectedHomeDeal) : null;
  const actionDeals = realDeals.map(homeDealToActionDeal);

  const runPipelineAction = async (action: PipelineSurfaceAction) => {
    setActionError(null);
    setActionNote(null);

    const actionConfig: Record<PipelineSurfaceAction, {
      actionId: SurfaceActionId;
      error: string;
      prompt: (deal: ActionDeal | null) => string;
      title?: string;
    }> = {
      drafts: {
        actionId: "generate_primary_deliverable",
        error: "Could not open or generate the draft.",
        prompt: deal => deal
          ? `Create or open the draft Yulia thinks needs review first for ${actionDealTitle(deal)}. Use the deal context and open the deliverable surface.`
          : "Create or open the draft Yulia thinks needs review first for the highest-priority deal.",
      },
      analysis: {
        actionId: "run_market_intelligence",
        error: "Could not run the analysis.",
        prompt: deal => deal
          ? `Run the deeper market read for ${actionDealTitle(deal)}. Include comps, buyer appetite, financing climate, tax/legal issues, source gaps, and next actions in an interactive canvas.`
          : "Run the most useful market, tax/legal, buyer, and risk analysis for the highest-priority deal and open it as an interactive canvas.",
      },
      buyers: {
        actionId: "search_buyers",
        error: "Could not start the buyer search.",
        prompt: deal => deal
          ? `Find buyers, buyer pools, lenders, and deal professionals for ${actionDealTitle(deal)}. Use the deal context and return ranked next outreach.`
          : "Find buyers, buyer pools, lenders, and deal professionals for the most promising deal in the pipeline.",
        title: "Buyer search",
      },
    };

    const config = actionConfig[action];
    const deal = actionDeal;
    const prompt = config.prompt(deal);

    if (!deal && useSampleData && action === "analysis") {
      openTab(buildBigFakeInvestmentBoardTab());
      setActionNote("Opened the dev investment board for Big Fake Deal. Live deals will use the backend analysis runner.");
      return;
    }

    if (!deal && action !== "buyers") {
      setActionNote("Yulia needs a live deal before she can create the work product. I sent the intent to chat instead of opening a fake surface.");
      onTalkToYulia?.(prompt);
      return;
    }

    setBusyAction(action);
    try {
      await executeSurfaceAction({
        actionId: config.actionId,
        deal,
        deals: actionDeals,
        openTab,
        modelPreference,
        requestedFrom: "pipeline_root_action",
        prompt,
        title: config.title,
        onNote: setActionNote,
        onTalkToYulia,
      });
    } catch (e: any) {
      setActionError(e?.message || config.error);
    } finally {
      setBusyAction(null);
    }
  };

  const runPipelineShortcut = async (action: PipelineShortcutAction) => {
    setActionError(null);
    setActionNote(null);

    if (action === "buyers") {
      await runPipelineAction(action);
      return;
    }

    if (action === "drafts" || action === "analysis") {
      await runPipelineAction(action);
      return;
    }

    if (action === "models") {
      if (modelRefreshNeeds.length > 0) {
        onTalkToYulia?.(`Show the stale model stack across my pipeline. Start with ${modelRefreshNeeds[0].dealTitle || "the highest-priority deal"} and explain which models need reruns, which assumptions changed, and what to rerun first.`);
        return;
      }
      await runPipelineAction("analysis");
      return;
    }

    const prompts: Record<"rank" | "blockers" | "files" | "touch", string> = {
      rank: "Rank my pipeline by methodology readiness, blockers, fit, urgency, and the next Yulia move for each deal.",
      blockers: "Show the blockers for each deal in my pipeline, grouped by gate, required models, citations, files, and approval needs.",
      files: "Show the files, data-room items, diligence docs, and analyses that are blocking movement in my pipeline.",
      touch: "Prepare the next buyer, seller, lender, or counsel touch for the highest-priority pipeline deal. Use the current gate and blockers.",
    };

    onTalkToYulia?.(prompts[action]);
  };

  const tabbed = tabFilter === "active" ? deals
    : tabFilter === "pursue" ? pursue
      : tabFilter === "watch" ? watch
        : pass;
  const q = query.trim().toLowerCase();
  const rows = tabbed.filter(deal =>
    (!q || deal.name.toLowerCase().includes(q) || deal.sub.toLowerCase().includes(q)) &&
    (!attentionOnly || deal.verdict === "watch" || !!deal.blocker || !!deal.modelRefreshCount)
  );

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Pipeline</div>
          <p className="pg-sub">Every deal you own, grouped by stage, with the next move before it advances.</p>
        </div>
        <div className="pg-actions">
          <button className="kebab" type="button" aria-label="More" onClick={() => onTalkToYulia?.("Summarize my pipeline: counts by verdict, what changed since yesterday, and the single most important deal to move today.")}>⋯</button>
          <button className="wkbtn" type="button" onClick={() => onTalkToYulia?.("Rank my pipeline by methodology readiness, blockers, fit, urgency, and the next Yulia move for each deal.")}>Rank with Yulia</button>
          <button className="wkbtn primary" type="button" onClick={() => onTalkToYulia?.("Help me create my first deal workspace.")}>New deal</button>
        </div>
      </div>

      <div className="segmented">
        {([
          ["active", "All", deals.length],
          ["pursue", "Pursue", pursue.length],
          ["watch", "Watch", watch.length],
          ["pass", "Pass", pass.length],
        ] as const).map(([key, label, count]) => (
          <button key={key} type="button" className={`seg ${tabFilter === key ? "on" : ""}`} onClick={() => setTabFilter(key)}>
            {label} <span className="n">{count}</span>
          </button>
        ))}
      </div>

      <div className="ynext">
        {PIPELINE_SHORTCUTS.map(({ action, title, sub, icon }) => (
          <button key={title} type="button" className="yn" disabled={busyAction === action} onClick={() => { void runPipelineShortcut(action); }}>
            <span className="ic"><V6Icon name={icon} size={15} /></span>
            <span className="yn-t"><b>{busyAction === action ? "Working…" : title}</b><span>{sub}</span></span>
          </button>
        ))}
      </div>
      {(actionError || actionNote) && <div className={actionError ? "wkerr" : "wknote"}>{actionError || actionNote}</div>}

      <div className="filterbar">
        <label className="fsearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search deals…" style={{ border: 0, background: "transparent", outline: "none", color: "var(--ink)", font: "inherit", width: "100%", minWidth: 120 }} />
        </label>
        <button type="button" className={`fchip ${attentionOnly ? "on" : ""}`} onClick={() => setAttentionOnly(v => !v)}>Needs attention</button>
        <span className="grow" />
        <div className="tabletools">
          <button className="wkbtn" type="button" style={{ padding: "7px 12px" }} onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })}>All deals</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="wkcard" style={{ marginTop: 18, textAlign: "center", color: "var(--ink-2)" }}>
          {deals.length === 0 ? (
            <>
              <div className="wkcard-title">No deals yet</div>
              <div className="wkcard-sub">Start with a chat, source file, thesis, target, or buyer pool and Yulia will create the first deal workspace.</div>
              <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => onTalkToYulia?.("Help me create my first deal workspace.")}>Start with Yulia</button>
            </>
          ) : (
            <>
              <div className="wkcard-title">No deals match this view</div>
              <div className="wkcard-sub">Clear the search or filter to see the rest of your pipeline.</div>
            </>
          )}
        </div>
      ) : (
        <>
          <table className="wktable">
            <thead><tr>
              <th>Deal</th>
              <th>Verdict</th>
              <th className="r">SDE</th>
              <th>Stage</th>
              <th className="r">Fit</th>
              <th className="r">Action</th>
            </tr></thead>
            {PIPELINE_STAGES.map(stage => {
              const stageRows = rows.filter(deal => deal.stageId === stage.id);
              if (stageRows.length === 0) return null;
              return (
                <tbody key={stage.id}>
                  <tr className="stage-row">
                    <td colSpan={6}>
                      <span className="stage-name">{stage.title}</span>
                      <span className="stage-count">{stageRows.length}</span>
                      <span className="stage-sub">{stage.sub}</span>
                    </td>
                  </tr>
                  {stageRows.map(deal => (
                    <PipelineDealRow key={deal.id} deal={deal} openTab={openTab} onTalkToYulia={onTalkToYulia} />
                  ))}
                </tbody>
              );
            })}
          </table>
          <div className="tabfoot">
            <span>{rows.length} of {deals.length} {deals.length === 1 ? "deal" : "deals"} across {PIPELINE_STAGES.filter(s => rows.some(d => d.stageId === s.id)).length} stages</span>
            <span>{pursue.length} pursue · {watch.length} watch · {pass.length} pass</span>
          </div>
        </>
      )}

    </div>
  );
}

function PipelineDealRow({
  deal,
  openTab,
  onTalkToYulia,
}: {
  deal: PipelineDeal;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const pill = verdictStatpill(deal.verdict);
  const flag = deal.modelRefreshCount
    ? `${deal.modelRefreshCount} model ${deal.modelRefreshCount === 1 ? "rerun" : "reruns"} — ${deal.modelRefreshReason || "tracked assumptions changed since the saved output."}`
    : deal.verdict === "watch" && deal.blocker
      ? `${deal.blocker}${deal.yuliaMove ? ` — ${deal.yuliaMove}.` : ""}`
      : null;
  return (
    <Fragment>
      <tr onClick={() => openTab({ kind: "deal", id: deal.id, title: deal.name })}>
        <td>
          <div className="cellname">
            <span className="logo">{dealInitials(deal.name)}</span>
            <div><div className="nm">{deal.name}</div><div className="sub">{deal.sub}</div></div>
          </div>
        </td>
        <td><span className={`statpill ${pill.cls}`}><span className="d" />{pill.label}</span></td>
        <td className="r amt">{deal.sde}</td>
        <td><span className="muted">{deal.league} · {deal.gateId} {deal.gateName}</span></td>
        <td className="r"><span className="fit"><span className="fitn">{deal.fit}</span><span className="ft"><span className="ff" style={{ width: `${deal.fit}%` }} /></span></span></td>
        <td className="r"><button type="button" className="reviewbtn" onClick={e => { e.stopPropagation(); onTalkToYulia?.(yuliaPromptFor(deal)); }}>Review</button></td>
      </tr>
      {flag && (
        <tr><td colSpan={6} style={{ padding: 0 }}>
          <div className="rowflag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            <span>{flag}</span>
          </div>
        </td></tr>
      )}
    </Fragment>
  );
}

function dealInitials(name: string): string {
  const words = String(name || "").replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "··";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function verdictStatpill(verdict: Verdict): { cls: string; label: string } {
  if (verdict === "pursue") return { cls: "good", label: "Pursue" };
  if (verdict === "pass") return { cls: "flag", label: "Pass" };
  return { cls: "review", label: "Watch" };
}

function yuliaPromptFor(deal: PipelineDeal): string {
  return deal.modelRefreshCount
    ? `For ${deal.name}, explain the stale model stack. Show which assumptions changed, which model versions are affected, and rerun the first model that should be refreshed.`
    : `For ${deal.name}, show the current ${deal.league} ${deal.gateId} methodology state, blockers, required models, required citations, and the next Yulia move.`;
}

type PipelineDealSeed = Pick<PipelineDeal, "verdict" | "id" | "name" | "sub" | "fit" | "sde" | "multiple" | "note" | "league" | "gateId" | "blocker"> & {
  definitive?: TodayDefinitiveDealState;
  modelRefreshCount?: number;
  modelRefreshReason?: string;
  modelRefreshLabel?: string;
};

function enrichPipelineDeal(seed: PipelineDealSeed): PipelineDeal {
  const gate = GATE_MAP[seed.gateId] ?? GATE_MAP.B2;
  const nextGateId = getNextGate(gate.id);
  const nextGate = nextGateId ? GATE_MAP[nextGateId] : null;
  const requirements = getGateV19Requirements(gate.id);
  const stageId = stageForGate(gate.id);

  return {
    ...seed,
    journey: gate.journey,
    gateName: gate.name,
    nextGateName: nextGate ? `${nextGate.id} ${nextGate.name}` : "Ready to close",
    stageId,
    methodologyProgress: methodologyProgressForGate(gate.id),
    requiredModels: requirements.requiredModels.length,
    requiredCitations: requirements.requiredCitations.length,
    yuliaMove: yuliaMoveForGate(gate.id, seed.verdict),
  };
}

function methodologyProgressForGate(gateId: string): number {
  const gate = GATE_MAP[gateId];
  if (!gate) return 35;
  const gates = getJourneyGates(gate.journey);
  const lastIndex = Math.max(...gates.map(item => item.index), 1);
  return Math.max(12, Math.round((gate.index / lastIndex) * 100));
}

function yuliaMoveForGate(gateId: string, verdict: Verdict): string {
  if (verdict === "pass") return "Hold until facts change";
  if (/^(S|B|R)[01]$/.test(gateId)) return "Build the first read";
  if (/^(S|B|R)2$/.test(gateId)) return "Run value and finance checks";
  if (/^(S|B)3$/.test(gateId)) return "Pull diligence into the file";
  if (/^(S|B|R)4$/.test(gateId)) return "Resolve structure and approvals";
  return "Prep closing or PMI work";
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fitFromEbitda(ebitda: number | null | undefined): number {
  if (!ebitda) return 68;
  const m = ebitda / 100_000_000;
  if (m >= 5) return 92;
  if (m >= 3) return 86;
  if (m >= 2) return 80;
  if (m >= 1) return 74;
  return 68;
}

function verdictFromGate(gate: string): Verdict {
  if (/[345]$/.test(gate)) return "pursue";
  if (/[12]$/.test(gate)) return "watch";
  return "watch";
}

function dealPulseToPipelineDeal(item: TodayDealPulseItem, gateItem?: TodayGateCountdownItem, modelRefreshNeeds: TodayModelRefreshItem[] = []): PipelineDeal {
  const status = item.status.toLowerCase();
  const verdict: Verdict = status.includes("pursue")
    ? "pursue"
    : status.includes("hold") || status.includes("pass")
      ? "pass"
      : "watch";
  return enrichPipelineDeal({
    verdict,
    id: item.dealId,
    name: item.title,
    sub: `${item.metric} · ${item.urgency}`,
    fit: item.fit,
    sde: item.metric,
    multiple: "--",
    note: item.thesis || item.nextAction,
    league: "L3",
    gateId: gateItem?.gateId || gateForVerdict(verdict),
    blocker: gateItem?.blockers[0] || item.nextAction,
    definitive: item.definitive || gateItem?.definitive,
    modelRefreshCount: modelRefreshNeeds.length,
    modelRefreshReason: modelRefreshNeeds[0]?.reason,
    modelRefreshLabel: modelRefreshNeeds[0]?.modelTitle,
  });
}

function groupModelRefreshByDeal(items: TodayModelRefreshItem[]): Map<string, TodayModelRefreshItem[]> {
  const map = new Map<string, TodayModelRefreshItem[]>();
  for (const item of items) {
    if (!item.dealId) continue;
    const current = map.get(item.dealId) ?? [];
    current.push(item);
    map.set(item.dealId, current);
  }
  return map;
}

function dealToPipelineDeal(d: HomeDeal): PipelineDeal {
  const sde = fmtCents(d.sde);
  return enrichPipelineDeal({
    verdict: verdictFromGate(d.current_gate),
    id: String(d.id),
    name: d.business_name || d.industry || `Deal #${d.id}`,
    sub: `${fmtCents(d.revenue)} · ${d.location || d.industry || "active deal"}`,
    fit: fitFromEbitda(d.ebitda),
    sde,
    multiple: d.financials?.multiple ? `${d.financials.multiple.toFixed(1)}x` : "--",
    note: d.financials?.notes || `${sde} SDE · ${d.current_gate}`,
    league: d.league || inferLeague(d),
    gateId: d.current_gate || "B2",
    blocker: d.financials?.notes || "Next required model/source check",
  });
}

function gateForVerdict(verdict: Verdict): string {
  if (verdict === "pursue") return "B3";
  if (verdict === "pass") return "B1";
  return "B2";
}

function inferLeague(d: HomeDeal): string {
  const ebitda = d.ebitda ?? 0;
  const sde = d.sde ?? 0;
  const revenue = d.revenue ?? 0;

  if (ebitda >= 25_000_000_00) return "L5";
  if (ebitda >= 5_000_000_00) return "L4";
  if (ebitda >= 1_000_000_00) return "L3";
  if (sde >= 300_000_00 || revenue >= 1_000_000_00) return "L2";
  return "L1";
}

function journeyFromHomeDeal(d: HomeDeal): string {
  if (d.current_gate?.startsWith("S")) return "sell";
  if (d.current_gate?.startsWith("R")) return "raise";
  if (d.current_gate?.startsWith("P")) return "pmi";
  return "buy";
}

function homeDealToActionDeal(d: HomeDeal): ActionDeal {
  return {
    id: d.id,
    business_name: d.business_name,
    name: d.business_name || d.industry || `Deal #${d.id}`,
    industry: d.industry,
    location: d.location,
    current_gate: d.current_gate,
    journey_type: journeyFromHomeDeal(d),
  };
}
