import { useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import type { Verdict } from "./cards";
import type { IconName, OpenTab } from "../types";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useTodayOperatingBrief, type TodayDealPulseItem, type TodayGateCountdownItem } from "../../../hooks/useTodayOperatingBrief";
import { ART_HOUSE_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  executeSurfaceAction,
  actionDealTitle,
  pickActionDeal,
  type ActionDeal,
} from "../../../lib/v6ActionContracts";
import { DefinitiveSurfacePanel } from "../shared/DefinitiveSurfacePanel";
import type { SurfaceActionId } from "../../../lib/v6SurfaceActions";
import { buildBigFakeInvestmentBoardTab } from "../../../lib/sampleInvestmentBoard";
import { GATE_MAP, getGateV19Requirements, getJourneyGates, getNextGate } from "@shared/gateRegistry";

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
}

type PipelineStageId = "source" | "value" | "diligence" | "structure" | "close";

interface PipelineStage {
  id: PipelineStageId;
  title: string;
  sub: string;
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

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "source", title: "Source", sub: "Thesis, intake, first read" },
  { id: "value", title: "Value", sub: "Valuation and finance fit" },
  { id: "diligence", title: "Diligence", sub: "QoE, files, legal watch" },
  { id: "structure", title: "Structure", sub: "Terms, tax, approvals" },
  { id: "close", title: "Close / PMI", sub: "Closing and value creation" },
];

const PIPELINE_SHORTCUTS: PipelineShortcut[] = [
  { action: "rank", title: "Rank pipeline", sub: "Sort pursue, watch, pass by what deserves today.", icon: "feed", tone: "blue" },
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
  const useSampleData = !home.isAuthed || DEV_AUTH_BYPASS;
  const operating = useTodayOperatingBrief(user, home.isAuthed && !DEV_AUTH_BYPASS);
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const operatingDeals = operating.brief?.dealPulse ?? [];
  const gateCountdown = useSampleData ? [] : (operating.brief?.gateCountdown ?? []);
  const gateCountdownByDeal = new Map(gateCountdown.map(item => [item.dealId, item]));
  const deals = useSampleData
    ? SAMPLE_DEALS
    : operatingDeals.length
      ? operatingDeals.map(item => dealPulseToPipelineDeal(item, gateCountdownByDeal.get(item.dealId)))
      : realDeals.map(dealToPipelineDeal);

  const pursue = deals.filter(d => d.verdict === "pursue");
  const watch = deals.filter(d => d.verdict === "watch");
  const pass = deals.filter(d => d.verdict === "pass");
  const boardStages = PIPELINE_STAGES.map(stage => ({
    ...stage,
    deals: deals.filter(deal => deal.stageId === stage.id),
  }));
  const activeLeagueCount = new Set(deals.map(deal => deal.league)).size;
  const modelCount = deals.reduce((sum, deal) => sum + deal.requiredModels, 0);
  const citationCount = deals.reduce((sum, deal) => sum + deal.requiredCitations, 0);
  const autoMoveCount = deals.filter(deal => deal.requiredModels + deal.requiredCitations > 0).length;
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

  return (
    <div className="m-fade-up m-page-flow" style={P.page}>
      <section style={P.hero}>
        <div style={P.heroCopy}>
          <div className="mono" style={P.eyebrow}>PIPELINE</div>
          <h1 style={P.title}>Run every opportunity against the method.</h1>
          <p style={P.sub}>Pipeline is the deal Kanban: Yulia tracks each opportunity by league, gate, model stack, source gaps, and the next move before it advances.</p>
        </div>
        <div style={P.stats}>
          <PipelineStat label="Pursue" value={pursue.length} tone="#92E1BC" />
          <PipelineStat label="Watch" value={watch.length} tone="#F3D38C" />
          <PipelineStat label="Pass" value={pass.length} tone="#F0A49C" />
        </div>
      </section>

      {gateCountdown.length > 0 && (
        <GateCountdownStrip
          items={gateCountdown}
          openTab={openTab}
          onTalkToYulia={onTalkToYulia}
        />
      )}

      <V6Section eyebrow="YULIA NEXT" title="Pipeline shortcuts">
        {(actionError || actionNote) && (
          <div style={actionError ? P.actionError : P.actionNote}>
            {actionError || actionNote}
          </div>
        )}
        <div className="m-flow-grid" style={P.actionGrid}>
          {PIPELINE_SHORTCUTS.map(({ action, title, sub, icon, tone }) => (
            <button
              key={title}
              style={{ ...P.actionCard, ...pipelineActionTone(tone) }}
              onClick={() => { void runPipelineShortcut(action); }}
              type="button"
              disabled={busyAction === action}
            >
              <span style={P.actionIcon}><V6Icon name={icon} size={16} /></span>
              <span style={P.actionText}>
                <strong>{busyAction === action ? "Working..." : title}</strong>
                <span>{sub}</span>
              </span>
            </button>
          ))}
        </div>
      </V6Section>

      <div style={P.definitivePanel}>
        <DefinitiveSurfacePanel
          surface="pipeline"
          title="DEFINITIVE read for Pipeline."
          onTalkToYulia={onTalkToYulia}
        />
      </div>

      <section style={P.boardShell}>
        <div style={P.boardHeader}>
          <div>
            <h2 style={P.boardTitle}>Opportunity board</h2>
            <p style={P.boardSub}>Stages are methodology gates. League determines how deep Yulia goes before a deal can move forward.</p>
          </div>
          <button className="m-btn tonal" onClick={() => onTalkToYulia?.("Rank my pipeline by methodology readiness, blockers, and the next Yulia move for each deal.")} type="button">
            Rank with Yulia
          </button>
        </div>

        <div className="m-flow-grid" style={P.methodologyStrip}>
          <MethodologyChip label="Leagues" value={activeLeagueCount || 0} />
          <MethodologyChip label="Models watched" value={modelCount} />
          <MethodologyChip label="Citations needed" value={citationCount} />
          <MethodologyChip label="Auto-move checks" value={autoMoveCount} />
        </div>

        <div className="m-flow-grid" style={P.kanbanGrid}>
          {deals.length === 0 ? (
            <div style={P.emptyCard}>
              <strong>No deals yet</strong>
              <span>Start with a chat, source file, thesis, target, or buyer pool and Yulia will create the first deal workspace.</span>
              <button className="m-btn tonal" onClick={() => onTalkToYulia?.("Help me create my first deal workspace.")} type="button">
                Start with Yulia
              </button>
            </div>
          ) : boardStages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              openTab={openTab}
              onTalkToYulia={onTalkToYulia}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function GateCountdownStrip({
  items,
  openTab,
  onTalkToYulia,
}: {
  items: TodayGateCountdownItem[];
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  return (
    <section style={P.gateStrip}>
      <div style={P.gateStripHead}>
        <div>
          <h2 style={P.gateTitle}>Gate countdown</h2>
          <p style={P.gateSub}>Same operating read as Today: blockers, model needs, citations, and the next deal move.</p>
        </div>
        <button
          className="m-btn tonal"
          type="button"
          onClick={() => onTalkToYulia?.("Show my pipeline gate countdown, including blockers, required models, required citations, and next action.")}
        >
          Ask Yulia
        </button>
      </div>
      <div style={P.gateRows}>
        {items.slice(0, 3).map(item => (
          <button
            key={`${item.dealId}-${item.gateId}`}
            type="button"
            style={P.gateRow}
            onClick={() => openTab({ kind: "deal", id: item.dealId, title: item.title })}
          >
            <span style={P.gateBadge}>{item.gateId}</span>
            <span style={P.gateText}>
              <strong>{item.title}</strong>
              <span>{item.gateName} · {item.nextAction}</span>
            </span>
            <span style={P.gateMeta}>{item.blockers[0] || "No blocker surfaced"}</span>
            <span style={P.chevron} aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MethodologyChip({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={P.methodologyChip}>
      <strong style={P.methodologyValue}>{value}</strong>
      <span style={P.methodologyLabel}>{label}</span>
    </div>
  );
}

function KanbanColumn({
  stage,
  openTab,
  onTalkToYulia,
}: {
  stage: PipelineStage & { deals: PipelineDeal[] };
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  return (
    <section style={P.kanbanColumn}>
      <div style={P.kanbanHead}>
        <div>
          <h3 style={P.kanbanTitle}>{stage.title}</h3>
          <p style={P.kanbanSub}>{stage.sub}</p>
        </div>
        <span style={P.kanbanCount}>{stage.deals.length}</span>
      </div>
      <div style={P.kanbanStack}>
        {stage.deals.length === 0 ? (
          <div style={P.kanbanEmpty}>No opportunities at this gate.</div>
        ) : stage.deals.map(deal => (
          <OpportunityCard
            key={deal.id}
            deal={deal}
            onOpen={() => openTab({ kind: "deal", id: deal.id, title: deal.name })}
            onAsk={() => onTalkToYulia?.(`For ${deal.name}, show the current ${deal.league} ${deal.gateId} methodology state, blockers, required models, required citations, and the next Yulia move.`)}
          />
        ))}
      </div>
    </section>
  );
}

function OpportunityCard({
  deal,
  onOpen,
  onAsk,
}: {
  deal: PipelineDeal;
  onOpen: () => void;
  onAsk: () => void;
}) {
  const tone = verdictTone(deal.verdict);

  return (
    <article style={P.opportunityCard}>
      <button type="button" style={P.opportunityMain} onClick={onOpen}>
        <span style={{ ...P.opportunityAccent, background: tone.accent }} />
        <span style={P.opportunityTop}>
          <strong style={P.opportunityName}>{deal.name}</strong>
          <span style={{ ...P.verdictPill, color: tone.ink, background: tone.soft }}>{tone.label}</span>
        </span>
        <span style={P.opportunitySub}>{deal.sub}</span>
        <span style={P.gateLine}>
          <strong>{deal.league}</strong>
          <span>{deal.gateId} · {deal.gateName}</span>
        </span>
        <span style={P.progressTrack}>
          <span style={{ ...P.progressFill, width: `${deal.methodologyProgress}%`, background: tone.accent }} />
        </span>
        <span style={P.opportunityMeta}>
          <span>{deal.requiredModels} models</span>
          <span>{deal.requiredCitations} citations</span>
          <span>Next: {deal.nextGateName}</span>
        </span>
        <span style={P.opportunityNote}>{deal.note}</span>
      </button>
      <button type="button" style={P.yuliaMove} onClick={onAsk}>
        <span>{deal.yuliaMove}</span>
        <span aria-hidden="true">›</span>
      </button>
      <div style={P.blockerLine}>
        <span>Blocking</span>
        <strong>{deal.blocker}</strong>
      </div>
    </article>
  );
}

function PipelineStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div style={P.stat}>
      <strong style={{ ...P.statValue, color: tone }}>{value}</strong>
      <span style={P.statLabel}>{label}</span>
    </div>
  );
}

type PipelineDealSeed = Pick<PipelineDeal, "verdict" | "id" | "name" | "sub" | "fit" | "sde" | "multiple" | "note" | "league" | "gateId" | "blocker">;

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

function stageForGate(gateId: string): PipelineStageId {
  if (/^(S|B|R)[01]$/.test(gateId)) return "source";
  if (/^(S|B|R)2$/.test(gateId)) return "value";
  if (/^(S|B)3$/.test(gateId) || gateId === "R3") return "diligence";
  if (/^(S|B|R)4$/.test(gateId)) return "structure";
  return "close";
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

function verdictTone(verdict: Verdict) {
  const tones: Record<Verdict, { label: string; accent: string; ink: string; soft: string }> = {
    pursue: { label: "Pursue", accent: "#5EA987", ink: "#2F735D", soft: "rgba(111,174,149,.16)" },
    watch: { label: "Watch", accent: "#C39A40", ink: "#8B6422", soft: "rgba(201,162,78,.17)" },
    pass: { label: "Pass", accent: "#B96B64", ink: "#873E37", soft: "rgba(185,107,100,.15)" },
  };
  return tones[verdict];
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

function dealPulseToPipelineDeal(item: TodayDealPulseItem, gateItem?: TodayGateCountdownItem): PipelineDeal {
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
  });
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

const pipelineHeroWash = `linear-gradient(135deg, rgba(8,18,38,0.46) 0%, rgba(46,92,138,0.20) 46%, rgba(10,24,46,0.54) 100%), url('${STUDIO_TEXTURES.navy}')`;
const ART_CARD_WASH = "linear-gradient(145deg, rgba(18,31,48,0.68) 0%, rgba(56,70,83,0.42) 52%, rgba(13,22,37,0.72) 100%)";
const ART_CARD_FRAME: CSSProperties = {
  backgroundSize: "cover, cover",
  backgroundPosition: "center, center",
  color: "#FFFFFF",
  borderColor: "rgba(255,255,255,0.30)",
  boxShadow: "0 30px 76px rgba(31,44,69,0.24), 0 8px 22px rgba(26,34,51,0.12), inset 0 1px 0 rgba(255,255,255,0.24)",
};

function pipelineActionTone(tone: PipelineShortcut["tone"]): CSSProperties {
  const textures: Record<PipelineShortcut["tone"], string> = {
    gold: ART_HOUSE_TEXTURES.pricing,
    blue: ART_HOUSE_TEXTURES.pipeline,
    green: ART_HOUSE_TEXTURES.search,
    slate: ART_HOUSE_TEXTURES.studioPreview,
    rose: STUDIO_TEXTURES.rose,
    violet: STUDIO_TEXTURES.blue,
  };
  return {
    ...ART_CARD_FRAME,
    backgroundImage: `${ART_CARD_WASH}, url('${textures[tone]}')`,
  };
}

const P: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.38fr)",
    alignItems: "stretch",
    gap: 20,
    minHeight: 320,
    marginBottom: 34,
    padding: 30,
    borderRadius: 26,
    backgroundImage: pipelineHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 48px 118px rgba(37,46,82,0.32), 0 20px 46px rgba(17,24,39,0.17), 0 4px 12px rgba(17,24,39,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
  },
  heroCopy: {
    alignSelf: "end",
    maxWidth: 900,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  title: {
    margin: "8px 0 0",
    maxWidth: 880,
    fontSize: "clamp(44px, 5vw, 72px)",
    lineHeight: 0.92,
    letterSpacing: "-0.06em",
    textWrap: "balance",
    color: "#FFFFFF",
  },
  sub: {
    margin: "16px 0 0",
    maxWidth: 680,
    fontSize: 16,
    lineHeight: 1.55,
    color: "#FFFFFF",
  },
  stats: {
    display: "grid",
    gap: 12,
    alignContent: "end",
  },
  stat: {
    minHeight: 76,
    padding: 18,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.24), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
    border: "0.5px solid rgba(255,255,255,0.36)",
    boxShadow: "0 16px 34px -22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.34)",
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
  },
  statLabel: {
    display: "block",
    marginTop: 2,
    fontSize: 15,
    letterSpacing: "-0.02em",
    color: "rgba(255,255,255,.86)",
    fontWeight: 850,
  },
  statValue: {
    display: "block",
    fontSize: 34,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    color: "#FFFFFF",
  },
  gateStrip: {
    margin: "0 0 28px",
    padding: 18,
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.66))",
    border: "1px solid rgba(180, 197, 221, 0.74)",
    boxShadow: "0 26px 76px rgba(41,61,92,0.12), 0 8px 18px rgba(26,34,51,0.07), inset 0 1px 0 rgba(255,255,255,0.76)",
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
  },
  gateStripHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 12,
  },
  gateTitle: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  gateSub: {
    margin: "6px 0 0",
    maxWidth: 720,
    fontSize: 13,
    lineHeight: 1.45,
    color: "var(--m-on-surface-mid)",
  },
  gateRows: {
    display: "grid",
    gap: 8,
  },
  gateRow: {
    all: "unset",
    minHeight: 58,
    display: "grid",
    gridTemplateColumns: "64px minmax(0, 1fr) minmax(160px, 0.32fr) 16px",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(180,197,221,0.62)",
    boxShadow: "0 10px 22px rgba(26,34,51,0.06), inset 0 1px 0 rgba(255,255,255,0.72)",
    cursor: "pointer",
  },
  gateBadge: {
    height: 36,
    minWidth: 52,
    padding: "0 8px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(46,92,138,0.10)",
    color: "var(--m-on-primary-container)",
    fontSize: 12,
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums",
  },
  gateText: {
    minWidth: 0,
    display: "grid",
    gap: 2,
    color: "var(--m-on-surface)",
    fontSize: 14,
    lineHeight: 1.25,
  },
  gateMeta: {
    justifySelf: "end",
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    fontWeight: 760,
  },
  chevron: {
    color: "var(--m-on-surface-mid)",
    fontSize: 24,
    lineHeight: 1,
  },
  boardShell: {
    margin: "0 0 30px",
    padding: 20,
    borderRadius: 26,
    background: "radial-gradient(circle at 12% 0%, rgba(255,255,255,.58), transparent 38%), linear-gradient(135deg, rgba(255,255,255,.78), rgba(239,246,255,.48))",
    border: "1px solid rgba(255,255,255,.62)",
    boxShadow: "0 22px 58px rgba(42,65,96,.11), inset 0 1px 0 rgba(255,255,255,.78)",
    backdropFilter: "blur(22px) saturate(155%)",
    WebkitBackdropFilter: "blur(22px) saturate(155%)",
  },
  definitivePanel: {
    margin: "0 0 28px",
  },
  boardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 14,
  },
  boardTitle: {
    margin: 0,
    color: "var(--m-on-surface)",
    fontSize: 31,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  boardSub: {
    margin: "7px 0 0",
    maxWidth: 820,
    color: "var(--m-on-surface-mid)",
    fontSize: 14,
    lineHeight: 1.45,
  },
  methodologyStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  methodologyChip: {
    minHeight: 58,
    borderRadius: 18,
    padding: "11px 13px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(247,250,255,.72)",
    border: "1px solid rgba(153,176,209,.32)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.72)",
  },
  methodologyLabel: {
    display: "block",
    fontSize: 13,
    letterSpacing: "-0.015em",
    color: "#6B7891",
    fontWeight: 780,
  },
  methodologyValue: {
    display: "block",
    color: "var(--m-on-surface)",
    fontSize: 22,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  kanbanGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(214px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  kanbanColumn: {
    minHeight: 360,
    borderRadius: 22,
    padding: 12,
    background: "rgba(239,245,255,.56)",
    border: "1px solid rgba(153,176,209,.34)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.62)",
  },
  kanbanHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    padding: "4px 4px 10px",
  },
  kanbanTitle: {
    margin: 0,
    color: "var(--m-on-surface)",
    fontSize: 18,
    lineHeight: 1,
    letterSpacing: "-0.035em",
  },
  kanbanSub: {
    margin: "5px 0 0",
    color: "var(--m-on-surface-mid)",
    fontSize: 11.5,
    lineHeight: 1.25,
  },
  kanbanCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 999,
    display: "inline-grid",
    placeItems: "center",
    background: "rgba(255,255,255,.76)",
    color: "var(--m-on-primary-container)",
    fontWeight: 900,
    fontSize: 12,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.82)",
  },
  kanbanStack: {
    display: "grid",
    gap: 10,
  },
  kanbanEmpty: {
    minHeight: 132,
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    borderRadius: 18,
    border: "1px dashed rgba(153,176,209,.42)",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    lineHeight: 1.4,
    padding: 14,
  },
  opportunityCard: {
    position: "relative",
    borderRadius: 18,
    background: "rgba(255,255,255,.82)",
    border: "1px solid rgba(153,176,209,.34)",
    boxShadow: "0 14px 32px rgba(42,65,96,.09), inset 0 1px 0 rgba(255,255,255,.72)",
    overflow: "hidden",
  },
  opportunityMain: {
    all: "unset",
    display: "grid",
    gap: 8,
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    cursor: "pointer",
  },
  opportunityAccent: {
    position: "absolute",
    inset: "0 auto 0 0",
    width: 4,
    opacity: 0.84,
  },
  opportunityTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  opportunityName: {
    minWidth: 0,
    color: "var(--m-on-surface)",
    fontSize: 15,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
  },
  verdictPill: {
    flex: "0 0 auto",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 10,
    fontWeight: 900,
  },
  opportunitySub: {
    color: "var(--m-on-surface-mid)",
    fontSize: 11.5,
    lineHeight: 1.25,
  },
  gateLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--m-on-surface)",
    fontSize: 12,
    lineHeight: 1.2,
  },
  progressTrack: {
    display: "block",
    height: 5,
    borderRadius: 999,
    background: "rgba(198,211,232,.52)",
    overflow: "hidden",
  },
  progressFill: {
    display: "block",
    height: "100%",
    borderRadius: 999,
  },
  opportunityMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    color: "var(--m-on-surface-mid)",
    fontSize: 10.5,
    lineHeight: 1,
  },
  opportunityNote: {
    color: "var(--m-on-surface-var)",
    fontSize: 12,
    lineHeight: 1.35,
  },
  yuliaMove: {
    all: "unset",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 13px",
    color: "var(--m-on-primary-container)",
    background: "rgba(236,243,255,.70)",
    borderTop: "1px solid rgba(153,176,209,.30)",
    fontSize: 12,
    fontWeight: 850,
    cursor: "pointer",
  },
  blockerLine: {
    display: "grid",
    gap: 2,
    padding: "10px 13px 12px",
    borderTop: "1px solid rgba(153,176,209,.24)",
    color: "var(--m-on-surface-mid)",
    fontSize: 10.5,
    lineHeight: 1.25,
  },
  dealGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
  emptyCard: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    padding: 22,
    borderRadius: 18,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-mid)",
    boxShadow: "var(--m-elev-1)",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  actionCard: {
    all: "unset",
    display: "flex",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(106,155,204,0.20)",
    cursor: "pointer",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "rgba(255,255,255,0.62)",
    color: "currentColor",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.80), 0 10px 18px rgba(26,34,51,0.06)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  actionText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "currentColor",
    fontSize: 13,
    lineHeight: 1.4,
  },
  actionNote: {
    margin: "0 0 12px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.9)",
    color: "#246B50",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
  actionError: {
    margin: "0 0 12px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--m-pass-container)",
    color: "#6F241E",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
};
