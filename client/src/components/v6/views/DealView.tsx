import { useEffect, useState, type CSSProperties } from "react";
import { V6Section } from "../Section";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "../modes/cards";
import type { FileScope, OpenTab, TabKind } from "../types";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayModelRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import type { ModelPreference } from "../../../lib/modelPreference";
import { openSavedModelExecutionAsRerun } from "../../../lib/modelRerunActions";
import {
  fileDeliverableToDataRoom,
  generateDealDeliverable,
  loadDealDataRoom,
  type DealDataRoom,
  type DataRoomDocument,
} from "../../../hooks/useV6WorkspaceData";
import { executeSurfaceAction, runActionAnalysis, type ActionDeal } from "../../../lib/v6ActionContracts";
import { isSurfaceActionId, type SurfaceActionId } from "../../../lib/v6SurfaceActions";
import { getJourneyGates } from "@shared/gateRegistry";
import { useDerivedDisplay } from "../shared/useDerivedDisplay";
import { WorkSeal } from "../shared/WorkSeal";
import { LEAGUE_MULTIPLES } from "../../../lib/calculations/core";
import {
  deriveVerdictKind,
  heroBoxShadow,
  preloadTexture,
  HERO_GHOST_PILL_BG,
  HERO_INNER_CELL,
  HERO_RADIUS,
  VERDICT_MATERIAL,
  type VerdictKind,
} from "../shared/verdictMaterial";

/* ─── Methodology stage progress ─── */
interface StageCell { id: string; name: string; state: "done" | "current" | "upcoming" }
interface StageProgress {
  journeyLabel: string;
  stages: StageCell[];
  currentIndex: number;
  currentName: string;
  total: number;
  nextName: string | null;
  deliverablesDone: number;
  deliverablesTotal: number;
}

interface Stat { k: string; v: string; sub: string }
interface LinkedFile {
  kind: TabKind;
  title: string;
  status: DocStatusKind;
  sub: string;
  id?: string;
}

type FileTone = "private" | "room" | "sent" | "received" | "deferred" | "executed";
type FileSectionKey =
  | "private"
  | "analysis"
  | "drafts"
  | "artifacts"
  | "room-docs"
  | "sent"
  | "received"
  | "deferred"
  | "executed";

interface DealFolder {
  label: string;
  sub: string;
  count: number;
  scope: FileScope;
  tone: FileTone;
}

interface DealFileItem {
  id: string;
  title: string;
  meta: string;
  location: string;
  status: string;
  kind: "doc" | "analysis";
  tone: FileTone;
  scopes: FileScope[];
  section: FileSectionKey;
  deliverableId?: number;
  documentId?: number;
  provenanceLabel?: string;
  modelOutputHash?: string;
  modelType?: string;
  modelTitle?: string;
}

/* ─── Sample fallbacks (used when no numeric deal id is in scope) ─── */

const DEAL_FILES: DealFileItem[] = [
  {
    id: "analysis-recast-walkthrough",
    title: "Yulia · Recast walk-through",
    meta: "Analysis · v3 · 2 min ago",
    location: "All Files / Private workspace / Analysis",
    status: "Private",
    kind: "analysis",
    tone: "private",
    scopes: ["all"],
    section: "analysis",
  },
  {
    id: "doc-buyer-fit-memo",
    title: "Buyer fit memo",
    meta: "Memo · you · 1 hr ago · 4 pages",
    location: "All Files / Private workspace / Memos",
    status: "Open",
    kind: "doc",
    tone: "private",
    scopes: ["all"],
    section: "private",
  },
  {
    id: "doc-ioi-v3",
    title: "IOI draft · v3",
    meta: "Yulia drafting · 2 min ago",
    location: "All Files / Private workspace / Drafts",
    status: "Draft",
    kind: "doc",
    tone: "private",
    scopes: ["all"],
    section: "drafts",
  },
  {
    id: "analysis-concentration-risk",
    title: "Concentration risk note",
    meta: "Analysis · Yulia · 18 hr ago",
    location: "All Files / Private workspace / Analysis",
    status: "Private",
    kind: "analysis",
    tone: "private",
    scopes: ["all"],
    section: "analysis",
  },
  {
    id: "room-2024-pl",
    title: "2024 P&L · audited",
    meta: "Excel · 1.2 MB · source artifact",
    location: "All Files / Data Room / Artifacts / Financials",
    status: "View",
    kind: "analysis",
    tone: "room",
    scopes: ["all", "data-room"],
    section: "artifacts",
  },
  {
    id: "room-tax-returns",
    title: "2022-2024 tax returns",
    meta: "PDF packet · uploaded by seller",
    location: "All Files / Data Room / Artifacts / Financials",
    status: "View",
    kind: "doc",
    tone: "room",
    scopes: ["all", "data-room"],
    section: "artifacts",
  },
  {
    id: "room-customer-list",
    title: "Customer list · top 25",
    meta: "CSV · received from seller",
    location: "All Files / Data Room / Artifacts / Commercial",
    status: "Action needed",
    kind: "analysis",
    tone: "received",
    scopes: ["all", "data-room", "shared"],
    section: "received",
  },
  {
    id: "room-mutual-nda",
    title: "Mutual NDA · seller counsel",
    meta: "Sent Apr 04 · 2 markups",
    location: "All Files / Data Room / Legal docs / In review",
    status: "In review",
    kind: "doc",
    tone: "sent",
    scopes: ["all", "data-room", "shared"],
    section: "sent",
  },
  {
    id: "room-security-findings",
    title: "Security findings recap",
    meta: "Received · routed to counsel",
    location: "All Files / Data Room / Artifacts / IT",
    status: "Deferred",
    kind: "doc",
    tone: "deferred",
    scopes: ["all", "data-room", "shared"],
    section: "deferred",
  },
  {
    id: "room-disclosure-schedule",
    title: "Disclosure schedule · v1",
    meta: "Drafted legal doc · preparing for room",
    location: "All Files / Data Room / Drafted legal docs",
    status: "Draft",
    kind: "doc",
    tone: "room",
    scopes: ["all", "data-room"],
    section: "room-docs",
  },
  {
    id: "room-ioi-sent",
    title: "IOI · v2 sent",
    meta: "Sent Apr 22 · awaiting reply",
    location: "All Files / Shared / Sent",
    status: "Awaiting",
    kind: "doc",
    tone: "sent",
    scopes: ["all", "shared"],
    section: "sent",
  },
  {
    id: "room-nda-executed",
    title: "NDA · countersigned",
    meta: "Executed Mar 03 · seller + buyer",
    location: "All Files / Data Room / Executed",
    status: "Immutable",
    kind: "doc",
    tone: "executed",
    scopes: ["all", "data-room", "shared"],
    section: "executed",
  },
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

interface DealBrief {
  /** ISO timestamp the server stamps on every brief (cached or fresh). */
  generatedAt?: string;
  verdict?: { label?: string; score?: number; text?: string };
  marketRead?: {
    headline?: string;
    bullets?: string[];
    sourceSignals?: string[];
    researchNeeded?: string[];
  };
  taxLegal?: {
    tax?: string;
    legal?: string;
    signoffFlags?: string[];
  };
  nextMoves?: Array<{ title?: string; why?: string; prompt?: string; actionId?: string | SurfaceActionId }>;
}

type DealNextMove = NonNullable<DealBrief["nextMoves"]>[number];
type DealMoveAction =
  | { kind: "artifact"; slug: string; label: string; busyKey: string }
  | { kind: "analysis"; analysisType: string; label: string; busyKey: string; menuItemSlug?: string }
  | { kind: "scope"; scope: FileScope; note?: string }
  | { kind: "chat" };

interface DeliverableRow {
  id: number;
  deal_id?: number;
  menu_item_id?: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  generation_time_ms?: number | null;
  generation_model?: string | null;
  slug?: string;
  name?: string;
  description?: string | null;
  tier?: string | null;
  journey?: string | null;
  gate?: string | null;
  folder_category?: string | null;
  artifact_kind?: string | null;
}

/* Reference-layout samples (shown only when no numeric deal id is in scope). */
const SAMPLE_STAGE_PROGRESS: StageProgress = {
  journeyLabel: "BUY",
  stages: [
    { id: "B0", name: "Thesis", state: "done" },
    { id: "B1", name: "Sourcing", state: "done" },
    { id: "B2", name: "Valuation", state: "current" },
    { id: "B3", name: "Due Diligence", state: "upcoming" },
    { id: "B4", name: "Structuring", state: "upcoming" },
    { id: "B5", name: "Closing", state: "upcoming" },
  ],
  currentIndex: 2,
  currentName: "Valuation",
  total: 6,
  nextName: "Due Diligence",
  deliverablesDone: 3,
  deliverablesTotal: 7,
};

const SAMPLE_STATS: Stat[] = [
  { k: "Revenue", v: "$8.4M", sub: "Trailing twelve months" },
  { k: "SDE", v: "$1.9M", sub: "23% of revenue" },
  { k: "EBITDA", v: "$1.6M", sub: "19% margin" },
  { k: "Asking price", v: "$9.2M", sub: "5.8× earnings" },
  { k: "Modeled valuation", v: "$7.6M–$9.1M", sub: "From Yulia's model" },
];

const SAMPLE_LINKED_WORK: { analyses: LinkedFile[]; documents: LinkedFile[] } = {
  analyses: [
    { kind: "analysis", title: "Valuation triangulation", status: "live", sub: "DCF · comps · precedent · 2h ago", id: "sample-val" },
    { kind: "analysis", title: "LBO — base / downside", status: "live", sub: "IRR 24% · MOIC 2.6× · 1d ago", id: "sample-lbo" },
    { kind: "analysis", title: "Working capital peg", status: "saved", sub: "12-mo avg · $486K · 3d ago", id: "sample-wc" },
  ],
  documents: [
    { kind: "doc", title: "IOI draft · v3", status: "draft", sub: "Yulia drafting · 2m ago", id: "sample-ioi" },
    { kind: "doc", title: "Buyer fit memo", status: "live", sub: "4 pages · 1h ago", id: "sample-memo" },
  ],
};

export function V6DealView({
  id,
  title,
  openTab,
  fileScope,
  onTalkToYulia,
  modelPreference,
  user,
}: {
  id: string;
  title: string;
  openTab: OpenTab;
  fileScope?: FileScope;
  onTalkToYulia?: (prompt: string) => void;
  modelPreference?: ModelPreference;
  user?: User | null;
}) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
  const [data, setData] = useState<DealDetailResp | null>(null);
  const [linked, setLinked] = useState<DeliverableRow[] | null>(null);
  const [dataRoom, setDataRoom] = useState<DealDataRoom | null>(null);
  const [dealBrief, setDealBrief] = useState<DealBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [activeFileScope, setActiveFileScope] = useState<FileScope | null>(fileScope ?? null);
  const operating = useTodayOperatingBrief(user ?? null, !!user && numericId !== null);

  // Watercolor verdict hero (fusion Wave C1). Material from
  // shared/verdictMaterial.ts — baseline navy until Yulia's verdict exists;
  // never guess a verdict color from ambiguous text.
  const verdictKind: VerdictKind = deriveVerdictKind(dealBrief?.verdict?.label);
  const heroMat = VERDICT_MATERIAL[verdictKind];
  const [heroTexReady, setHeroTexReady] = useState(false);

  // Decode all four verdict textures when a deal tab mounts so a verdict
  // change never paints white-then-pops (TodayRoot's proven no-flash rule).
  useEffect(() => {
    (Object.keys(VERDICT_MATERIAL) as VerdictKind[]).forEach(kind => preloadTexture(VERDICT_MATERIAL[kind].texture));
  }, []);

  // Mount flat (verdict-tinted solid + overlay), then crossfade the
  // watercolor in once its image has actually decoded.
  useEffect(() => {
    setHeroTexReady(false);
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setHeroTexReady(true); };
    img.src = heroMat.texture;
    if (img.complete) setHeroTexReady(true);
    return () => { cancelled = true; };
  }, [heroMat.texture]);

  useEffect(() => {
    setActiveFileScope(fileScope ?? null);
  }, [fileScope]);

  useEffect(() => {
    if (numericId === null) {
      setDealBrief(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/deals/${numericId}`,            { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`deal ${r.status}`))),
      fetch(`/api/deals/${numericId}/deliverables`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
      loadDealDataRoom(numericId).catch(() => null),
      fetch(`/api/agency/deals/${numericId}/brief`, { headers: authHeaders() }).then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([detail, dels, room, brief]) => {
        if (cancelled) return;
        setData(detail as DealDetailResp);
        setLinked(Array.isArray(dels) ? dels : []);
        setDataRoom(room as DealDataRoom | null);
        setDealBrief(brief as DealBrief | null);
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [numericId]);

  // ─── Derive display data ──────────────────────────────────────────
  const real = data?.deal;
  const stats: Stat[] = real ? buildStats(real) : numericId === null ? SAMPLE_STATS : [];
  // League range band for the Asking-price tile. Real deals need asking +
  // earnings + a league in LEAGUE_MULTIPLES; the sample fallback demonstrates
  // the band with the reference numbers ($9.2M asking / $1.6M EBITDA, L3).
  const leagueBand = real
    ? (real.asking_price && (real.ebitda || real.sde) && real.league
        ? buildLeagueBand(real.league, real.asking_price, (real.ebitda || real.sde)!)
        : null)
    : numericId === null
      ? buildLeagueBand("L3", 920_000_000, 160_000_000)
      : null;
  // Working Paper: no decorative eyebrow — the eyebrow's information (journey,
  // gate, status) folds into the subline under the masthead.
  const heroSub = real
    ? [
        real.revenue ? `${fmtCents(real.revenue)} revenue` : null,
        real.location || null,
        real.industry || null,
        real.journey_type.toUpperCase(),
        `gate ${real.current_gate}`,
        real.status !== "active" ? real.status : null,
      ].filter(Boolean).join(" · ")
    // Honest loading state — never fabricate revenue/location/gate for a deal
    // that hasn't loaded (no-fiction law; was a hardcoded "$5.4M · East Texas…").
    : "Loading deal…";

  const dealName = real?.business_name || title;
  const intelligence = buildDealIntelligence({ dealName, real, dealBrief });
  const portfolioName = samplePortfolioForDeal(id, title);
  const fileItems = numericId !== null && (linked || dataRoom)
    ? buildDealFilesFromReal(linked ?? [], dataRoom, dealName)
    : [];
  const modelRefreshNeeds = (operating.brief?.modelRefreshNeeds ?? [])
    .filter(item => item.dealId === String(numericId));
  const primaryDeliverable = primaryDeliverableForJourney(real?.journey_type);
  const stageProgress = real
    ? buildStageProgress(real, data?.gates ?? [], data?.deliverableStats)
    : numericId === null ? SAMPLE_STAGE_PROGRESS : null;
  const linkedWork = (linked && linked.length > 0)
    ? splitLinkedWork(linked)
    : numericId === null ? SAMPLE_LINKED_WORK : { analyses: [], documents: [] };
  const setDealFileScope = (scope: FileScope | null) => {
    setActiveFileScope(scope);
    openTab({ id, kind: "deal", title: dealName, fileScope: scope ?? undefined });
  };
  const openDealTeam = () => {
    openTab({
      id: `deal-team-${id}`,
      kind: "deal-team",
      title: `${dealName} · Team`,
      dealId: numericId ?? id,
      dealTitle: dealName,
    });
  };
  const refreshDealArtifacts = async () => {
    if (numericId === null) return;
    const [dels, room] = await Promise.all([
      fetch(`/api/deals/${numericId}/deliverables`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
      loadDealDataRoom(numericId).catch(() => null),
    ]);
    setLinked(Array.isArray(dels) ? dels : []);
    setDataRoom(room);
  };
  const runDealDeliverableAction = async (slug: string, label: string, busyKey: string, promptHint?: string) => {
    if (numericId === null) {
      openTab({ kind: "doc", title: `${dealName} · ${label}`, id: `doc-${id}-${slug}` });
      onTalkToYulia?.(promptHint || `On ${dealName}: create the ${label} from the current deal context and open it as work product.`);
      return;
    }
    setBusyAction(busyKey);
    setActionError(null);
    setActionNote(null);
    try {
      const result = await generateDealDeliverable({ dealId: numericId, menuItemSlug: slug, modelPreference });
      setActionNote(`${result.title || label} is queued. Opening the live deliverable tab.`);
      openTab({ kind: "doc", title: `${dealName} · ${result.title || label}`, id: String(result.deliverableId) });
      void refreshDealArtifacts();
    } catch (e: any) {
      if (e?.checkoutUrl) {
        setActionNote(`Opening ${e.requiredPlan || "paid"} checkout${e.priceDisplay ? ` at ${e.priceDisplay}` : ""}.`);
        window.location.href = e.checkoutUrl;
        return;
      }
      setActionError(e?.message || `Could not generate ${label}`);
    } finally {
      setBusyAction(null);
    }
  };
  const runGenerateDeliverable = async () => {
    await runDealDeliverableAction(primaryDeliverable.slug, primaryDeliverable.label, "generate");
  };
  const runMarketBulletAnalysis = async (bullet: string) => {
    const intent = resolveMarketBulletAnalysis(bullet, real?.journey_type);
    await runDealAnalysisAction(
      intent.analysisType,
      intent.label,
      intent.busyKey,
      intent.menuItemSlug,
      `On ${dealName}: use this Yulia market-intelligence note as the trigger for a deeper ${intent.label}: "${bullet}". Combine live deal facts, collected files, seeded/user data, market intelligence, methodology, and tax/legal guardrails. Open an interactive analysis canvas with the right model, evidence, assumptions, sliders where applicable, Yulia's read, and concrete next actions.`,
    );
  };
  const runDealAnalysisAction = async (
    analysisType: string,
    label: string,
    busyKey: string,
    menuItemSlug?: string,
    promptHint?: string,
  ) => {
    if (numericId === null) {
      openTab({
        kind: "analysis",
        title: `${dealName} · ${label}`,
        id: `analysis-${id}-${analysisType}`,
        tool: analysisType,
        markdown: promptHint || `Open a structured ${label} for ${dealName}.`,
      });
      onTalkToYulia?.(promptHint || `On ${dealName}: run ${label} and open the interactive analysis canvas.`);
      return;
    }
    setBusyAction(busyKey);
    setActionError(null);
    setActionNote(null);
    try {
      await runActionAnalysis({
        deal: real ?? { id: numericId, business_name: dealName, journey_type: "buy" },
        analysisType,
        label,
        menuItemSlug,
        openTab,
        modelPreference,
        requestedFrom: "deal_next_move",
        onNote: setActionNote,
      });
    } catch (e: any) {
      setActionError(e?.message || `Could not run ${label}`);
    } finally {
      setBusyAction(null);
    }
  };
  const runRecommendedMove = async (move: DealNextMove) => {
    const action = resolveDealMoveAction(move, real?.journey_type, primaryDeliverable);
    const explicitActionId = isSurfaceActionId(move.actionId) ? move.actionId : null;
    const realActionDeal: ActionDeal | null = numericId !== null
      ? real ?? { id: numericId, business_name: dealName, name: dealName, journey_type: "buy" }
      : null;

    if (explicitActionId && realActionDeal) {
      setBusyAction(action.kind !== "chat" && "busyKey" in action ? action.busyKey : explicitActionId);
      setActionError(null);
      setActionNote(null);
      try {
        await executeSurfaceAction({
          actionId: explicitActionId,
          deal: realActionDeal,
          openTab,
          title: move.title || dealName,
          prompt: move.prompt || `On ${dealName}: ${move.title || "run the next action option"}.`,
          requestedFrom: "deal_next_move",
          modelPreference,
          onNote: setActionNote,
          onTalkToYulia,
        });
        if (explicitActionId === "generate_primary_deliverable" || explicitActionId === "generate_loi") {
          void refreshDealArtifacts();
        }
      } catch (e: any) {
        setActionError(e?.message || `Could not run ${move.title || "next action"}`);
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (action.kind === "scope") {
      setDealFileScope(action.scope);
      setActionNote(action.note ?? null);
      return;
    }
    if (action.kind === "analysis") {
      await runDealAnalysisAction(
        action.analysisType,
        action.label,
        action.busyKey,
        action.menuItemSlug,
        move.prompt || `On ${dealName}: ${move.title || action.label}`,
      );
      return;
    }
    if (action.kind === "artifact") {
      await runDealDeliverableAction(
        action.slug,
        action.label,
        action.busyKey,
        move.prompt || `On ${dealName}: ${move.title || action.label}`,
      );
      return;
    }
    onTalkToYulia?.(move.prompt || `On ${dealName}: ${move.title}`);
  };
  const fileLatestPrivateToRoom = async () => {
    if (numericId === null) return;
    const candidate = fileItems.find(file => file.deliverableId && !file.scopes.includes("data-room"));
    if (!candidate?.deliverableId) {
      setActionNote("No private generated deliverable is ready to file into the data room.");
      return;
    }
    setBusyAction("file");
    setActionError(null);
    setActionNote(null);
    try {
      await fileDeliverableToDataRoom(numericId, candidate.deliverableId, dataRoom?.folders?.[0]?.id ?? null);
      setActionNote(`${candidate.title} was filed into the deal data room.`);
      await refreshDealArtifacts();
    } catch (e: any) {
      setActionError(e?.message || "Could not file deliverable");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="wk-content" style={{ width: "min(100%, 1440px)", maxWidth: 1440, margin: "0 auto", boxSizing: "border-box" }}>
      {/* Hero strip — the verdict watercolor band (fusion Wave C1, flagship #2).
          Carded geometry inside the container; the ONLY texture on this page.
          The FIT numeral renders PLAIN on texture — no DERIVE settle, no
          wk-tick (DERIVE's emerald is a light-surface verification signal).
          The verdict TEXT + THE LINE basis line live in the tonal card below,
          never in glass-on-texture (judges' merged resolution). */}
      <section id="deal-dashboard" style={{ marginBottom: 28 }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: 200,
            padding: "26px 28px 22px",
            boxSizing: "border-box",
            borderRadius: HERO_RADIUS,
            overflow: "hidden",
            color: "#fff",
            backgroundColor: heroFallbackFill(verdictKind),
            backgroundImage: heroMat.overlay,
            boxShadow: heroBoxShadow(verdictKind),
          }}
        >
          {/* Watercolor layer — overlay re-applied above the texture (165deg,
              ~0.30 top keeps the masthead zone bright, ~0.62 bottom gives the
              action pills contrast). Crossfades in once the image decodes. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `${heroMat.overlay}, url('${heroMat.texture}')`,
              backgroundSize: "cover, cover",
              backgroundPosition: "center, center",
              backgroundRepeat: "no-repeat, no-repeat",
              opacity: heroTexReady ? 1 : 0,
              transition: "opacity 320ms ease",
            }}
          />
          {/* Ambient orbs (mobile HeroVisual parity) */}
          <div aria-hidden="true" style={{ position: "absolute", top: -60, right: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)" }} />
          <div aria-hidden="true" style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07), transparent 60%)" }} />

          <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <h1 className="wk-masthead" style={D.h1}>{real?.business_name || title}</h1>
              <div style={D.sub}>{heroSub}</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "12px 2px 14px", minHeight: 24 }}>
              {typeof dealBrief?.verdict?.score === "number" && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Fit</div>
                  {/* PLAIN render on texture — no StatValue, no wk-tick (judges' law) */}
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 52, letterSpacing: -2, lineHeight: 1, color: "#fff", marginTop: 2 }}>{dealBrief.verdict.score}</div>
                </div>
              )}
            </div>
            {/* Glass inner cell — the action row floating inside the hero.
                Same four actions as the old header buttons, byte-identical
                handlers, now ghost pills on texture. */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 8,
                borderRadius: HERO_INNER_CELL.radius,
                background: HERO_INNER_CELL.background,
                backdropFilter: HERO_INNER_CELL.backdropFilter,
                WebkitBackdropFilter: HERO_INNER_CELL.backdropFilter,
                border: HERO_INNER_CELL.border,
                boxShadow: HERO_INNER_CELL.boxShadow,
              }}
            >
              <button className="wk-tap" type="button" style={HERO_ACTION_PILL} onClick={() => setDealFileScope("all")}>Open files</button>
              <button className="wk-tap" type="button" style={HERO_ACTION_PILL} onClick={() => setDealFileScope("data-room")}>Data room</button>
              <button className="wk-tap" type="button" style={HERO_ACTION_PILL} onClick={openDealTeam}>Team</button>
              <button
                className="wk-tap"
                type="button"
                style={{ ...HERO_ACTION_PILL, opacity: busyAction === "generate" ? 0.6 : 1 }}
                onClick={runGenerateDeliverable}
                disabled={busyAction === "generate"}
              >
                {busyAction === "generate" ? "Generating..." : `Generate ${primaryDeliverable.label}`}
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 24 }}>
          LOADING DEAL…
        </div>
      )}
      {error && (
        <div className="wkerr" style={{ marginBottom: 24 }}>
          Couldn&rsquo;t load this deal ({error}). Showing reference layout.
        </div>
      )}
      {actionError && (
        <div className="wkerr" style={D.actionBanner}>{actionError}</div>
      )}
      {actionNote && (
        <div className="wknote" style={D.actionBanner}>{actionNote}</div>
      )}

      {/* Methodology "you are here" — the deal's stage in its journey, what's
          done, and what's next. Driven by gate_progress + current_gate. */}
      {stageProgress && (
        <section style={{ marginBottom: 28 }}>
          <div className="wkcard" style={D.stageCard}>
            <div style={D.stageHead}>
              <div style={{ minWidth: 0 }}>
                <h2 style={D.stageTitle}>Stage {stageProgress.currentIndex + 1} of {stageProgress.total} — {stageProgress.currentName}</h2>
              </div>
              <div style={D.stageMeta}>
                <span style={{ display: "block" }}>{stageProgress.journeyLabel} methodology</span>
                {stageProgress.nextName ? <span>Next: <strong style={{ color: "var(--ink)" }}>{stageProgress.nextName}</strong></span> : <span>Final stage</span>}
                {stageProgress.deliverablesTotal > 0 && (
                  <span style={{ display: "block", marginTop: 3 }}>{stageProgress.deliverablesDone} of {stageProgress.deliverablesTotal} deliverables complete</span>
                )}
              </div>
            </div>
            <div style={D.stageTrack}>
              {stageProgress.stages.flatMap((s, i) => {
                const node = (
                  <div key={s.id} style={D.stageNodeWrap}>
                    <div style={{ ...D.stageNode, ...(s.state === "done" ? D.stageNodeDone : s.state === "current" ? D.stageNodeCurrent : {}) }}>
                      {s.state === "done" ? "✓" : i + 1}
                    </div>
                    <div style={{ ...D.stageNodeLabel, ...(s.state === "current" ? { color: "var(--ink)", fontWeight: 700 } : s.state === "done" ? { color: "var(--ink-2)" } : {}) }}>{s.name}</div>
                  </div>
                );
                if (i === stageProgress.stages.length - 1) return [node];
                return [node, <div key={`c-${s.id}`} style={{ ...D.stageConnector, ...(s.state === "done" ? { background: "#2E8C5A" } : {}) }} />];
              })}
            </div>
          </div>
        </section>
      )}

      {/* Yulia's verdict — her call, rendered straight from the deal brief
          (substrate). No app-computed verdict; honest "analyzing" when her
          read isn't ready. Tonal card (judges' merged resolution): the verdict
          TEXT and THE LINE basis line read on the verdict's soft tone for
          maximum legibility — never on texture or glass. The FIT numeral
          lives in the hero band above. */}
      {dealBrief?.verdict?.label || dealBrief?.verdict?.text ? (
        <section style={{ marginBottom: 28 }}>
          <div
            className="wkcard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: heroMat.tone.soft,
              border: `0.5px solid color-mix(in srgb, ${heroMat.tone.ink} 22%, transparent)`,
              borderRadius: 18,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="wk-masthead" style={{ fontSize: 22, color: heroMat.tone.ink }}>{dealBrief.verdict.label || "Yulia's read"}</div>
              {dealBrief.verdict.text && <p style={{ margin: "6px 0 0", color: "var(--ink)", fontSize: "0.9rem", lineHeight: 1.5 }}>{dealBrief.verdict.text}</p>}
              {/* Basis line — descriptive only, never a recommendation. */}
              <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8 }}>
                From Yulia’s read of this deal · descriptive, not advice
                {dealBrief.generatedAt && fmtRelative(dealBrief.generatedAt) ? ` · ${fmtRelative(dealBrief.generatedAt)}` : ""}
              </div>
            </div>
          </div>
        </section>
      ) : numericId !== null ? (
        <section style={{ marginBottom: 28 }}>
          <div className="wkcard" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)" }}>Yulia is analyzing this deal</div>
              <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.5 }}>Her verdict, market read, and next moves appear once she's read it.</p>
            </div>
            <button className="wkbtn primary" type="button" onClick={() => onTalkToYulia?.(`Give me your read on ${dealName}: your verdict, the key risks, and the next move.`)}>Ask for the read</button>
          </div>
        </section>
      ) : null}

      {/* Stats row — as-card depth (cool iOS stack): tiles rest with the
          4-layer laminated shadow, no .wk-tap (they aren't buttons). DERIVE
          internals (StatValue + wk-tick) untouched — they're on white. */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {stats.map(s => (
            <div key={s.k} className="wkcard" style={D.statTile}>
              <div className="mono" style={D.statLabel}>{s.k.toUpperCase()}</div>
              <StatValue value={s.v} />
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>
              {s.k === "Asking price" && leagueBand && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ position: "relative", height: 4, borderRadius: 2, background: "var(--surface-3)" }}>
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: `${leagueBand.pct}%`,
                        transform: "translate(-50%, -50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: leagueBand.inRange ? "#2E8C5A" : "#C0562F",
                      }}
                    />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
                    league {leagueBand.league}: {leagueBand.min}–{leagueBand.max}× {leagueBand.metric}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={D.intelligenceGrid}>
        <div className="wkcard" style={D.marketCard}>
          <h2 style={D.intelTitle}>Market intelligence</h2>
          <p style={D.intelLead}>{intelligence.marketHeadline}</p>
          <div style={D.marketTileGrid}>
            {intelligence.marketTiles.map(tile => (
              <div key={tile.label} style={D.desktopMarketTile}>
                <div style={D.desktopMarketTileLabel}>{tile.label}</div>
                <div style={D.desktopMarketTileValue}>{tile.value}</div>
              </div>
            ))}
          </div>
          <div style={D.marketBulletStack}>
            {intelligence.marketBullets.map(bullet => (
              <button
                key={bullet}
                type="button"
                style={D.marketBullet}
                onClick={() => { void runMarketBulletAnalysis(bullet); }}
              >
                {bullet}
              </button>
            ))}
          </div>
          {intelligence.researchNeeded.length > 0 && (
            <div style={D.researchBox}>
              <strong style={{ fontSize: 12.5 }}>Source gaps</strong>
              {intelligence.researchNeeded.slice(0, 3).map(gap => <span key={gap}>{gap}</span>)}
            </div>
          )}
        </div>

        <div style={D.intelSideStack}>
          <div className="wkcard" style={D.reviewCard}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Structure read</h3>
            <p style={{ ...D.reviewText, margin: "8px 0 0" }}>How structure, tax, and legal shape this deal before documents move.</p>
            <div style={{ ...D.structureGrid, marginTop: 16 }}>
              <div>
                <span style={D.structureLabel}>Tax</span>
                <p>{intelligence.tax}</p>
              </div>
              <div>
                <span style={D.structureLabel}>Legal</span>
                <p>{intelligence.legal}</p>
              </div>
            </div>
          </div>

          <div className="wkcard" style={D.nextCard}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Yulia recommends</h3>
            {intelligence.nextMoves.map((move, index) => {
              const action = resolveDealMoveAction(move, real?.journey_type, primaryDeliverable);
              const isBusy = action.kind !== "chat" && "busyKey" in action && busyAction === action.busyKey;
              return (
                <button
                  key={move.title}
                  type="button"
                  disabled={!!busyAction}
                  style={{
                    ...D.nextMove,
                    borderBottom: index === intelligence.nextMoves.length - 1 ? "none" : "1px solid var(--line)",
                    opacity: busyAction && !isBusy ? 0.58 : 1,
                  }}
                  onClick={() => { void runRecommendedMove(move); }}
                >
                  <span style={D.nextMoveText}>
                    <strong style={D.nextMoveTitle}>{move.title}</strong>
                    <small style={D.nextMoveSub}>{isBusy ? "Opening Yulia's live analysis..." : move.why}</small>
                  </span>
                  <span style={D.nextArrow}>{isBusy ? "…" : "›"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeFileScope && (
        <DealFileExplorer
          dealTitle={dealName}
          portfolioName={portfolioName}
          activeScope={activeFileScope}
          setActiveScope={(scope) => setDealFileScope(scope)}
          openDealDetail={() => setDealFileScope(null)}
          openTab={openTab}
          onTalkToYulia={onTalkToYulia}
          files={fileItems}
          onFileLatestToRoom={numericId !== null ? fileLatestPrivateToRoom : undefined}
          fileBusy={busyAction === "file"}
          modelRefreshNeeds={modelRefreshNeeds}
        />
      )}

      {/* What Yulia has produced — analyses/models first (DCF, LBO, valuation,
          working capital, QoE), then documents. Each links to open in a tab. */}
      <V6Section
        title="Analyses Yulia has run"
        sub={linkedWork.analyses.length ? "Valuations, models, and diligence analysis — click any to open." : undefined}
      >
        {linkedWork.analyses.length > 0 ? (
          <div style={D.workGrid}>
            {linkedWork.analyses.map(f => (
              <WorkCard key={`a-${f.title}-${f.id ?? ""}`} file={f} dealName={real?.business_name || title} openTab={openTab} />
            ))}
          </div>
        ) : (
          <div className="wkcard" style={D.emptyWork}>
            No DCF, LBO, or valuation modeled for this deal yet. Run one from <strong>Yulia recommends</strong> above, or ask Yulia to value it.
          </div>
        )}
      </V6Section>

      {linkedWork.documents.length > 0 && (
        <V6Section title="Documents Yulia has drafted" sub="CIMs, LOIs, and memos — click any to open.">
          <div style={D.workGrid}>
            {linkedWork.documents.map(f => (
              <WorkCard key={`d-${f.title}-${f.id ?? ""}`} file={f} dealName={real?.business_name || title} openTab={openTab} />
            ))}
          </div>
        </V6Section>
      )}

    </div>
  );
}

function DealFileExplorer({
  dealTitle,
  portfolioName,
  activeScope,
  setActiveScope,
  openDealDetail,
  openTab,
  onTalkToYulia,
  files,
  onFileLatestToRoom,
  fileBusy,
  modelRefreshNeeds,
}: {
  dealTitle: string;
  portfolioName: string;
  activeScope: FileScope;
  setActiveScope: (scope: FileScope) => void;
  openDealDetail: () => void;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  files: DealFileItem[];
  onFileLatestToRoom?: () => void;
  fileBusy?: boolean;
  modelRefreshNeeds: TodayModelRefreshItem[];
}) {
  const [rerunOpenedIds, setRerunOpenedIds] = useState<Set<string>>(() => new Set());
  const visible = files.filter(file => file.scopes.includes(activeScope));
  const folders = foldersForScope(activeScope, visible);
  const sections = sectionsForScope(activeScope, visible);
  const activeModelRefreshNeeds = modelRefreshNeeds.filter(item => !rerunOpenedIds.has(item.id));
  const showReliance = activeScope === "data-room" || activeScope === "shared";
  const counts = {
    all: files.filter(file => file.scopes.includes("all")).length,
    "data-room": files.filter(file => file.scopes.includes("data-room")).length,
    shared: files.filter(file => file.scopes.includes("shared")).length,
  };
  const copy = scopeCopy(activeScope);

  const openFile = (file: DealFileItem) => {
    openTab({ kind: file.kind === "analysis" && !file.deliverableId ? "analysis" : "doc", title: `${dealTitle} · ${file.title}`, id: file.deliverableId ? String(file.deliverableId) : file.id });
  };

  const rerunModelRefresh = (item: TodayModelRefreshItem) => {
    void openSavedModelExecutionAsRerun({
      executionId: item.id,
      dealTitle,
      currentAssumptions: item.currentAssumptions,
      sourceSurface: "data_room_reliance",
      onTalkToYulia,
    }).then(execution => {
      if (execution) setRerunOpenedIds(prev => new Set(prev).add(item.id));
    });
  };

  return (
    <section style={D.fileSystem}>
      <div style={D.fileTop}>
        <div>
          <h2 style={D.fileTitle}>{copy.title}</h2>
          <p style={D.fileSub}>{copy.sub}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="wkbtn"
            onClick={() => onTalkToYulia?.(`Find the right ${dealTitle} file for me. I am looking at ${copy.label}.`)}
          >
            Ask Yulia for a file
          </button>
          {onFileLatestToRoom && (
            <button
              type="button"
              className="wkbtn"
              onClick={onFileLatestToRoom}
              disabled={fileBusy}
            >
              {fileBusy ? "Filing..." : "File latest to room"}
            </button>
          )}
        </div>
      </div>

      <div style={D.scopeRail} role="tablist" aria-label="Deal file scope">
        <button
          type="button"
          style={D.scopeChip}
          onClick={openDealDetail}
        >
          View deal
        </button>
        {([
          ["all", "All Files"],
          ["data-room", "Data Room"],
          ["shared", "Shared"],
        ] as const).map(([scope, label]) => (
          <button
            key={scope}
            type="button"
            role="tab"
            aria-selected={activeScope === scope}
            style={{ ...D.scopeChip, ...(activeScope === scope ? D.scopeChipActive : {}) }}
            onClick={() => setActiveScope(scope)}
          >
            {label}
            <span className="mono" style={{ ...D.scopeCount, ...(activeScope === scope ? D.scopeCountActive : {}) }}>{counts[scope]}</span>
          </button>
        ))}
      </div>

      {showReliance && (
        <DataRoomReliancePanel
          dealTitle={dealTitle}
          scopeLabel={copy.label}
          modelRefreshNeeds={activeModelRefreshNeeds}
          onTalkToYulia={onTalkToYulia}
          onRerunModel={rerunModelRefresh}
        />
      )}

      <div style={D.fileGrid}>
        <aside style={D.folderCard}>
          <strong style={D.folderRoot}>{portfolioName} / {dealTitle}</strong>
          <div style={D.folderRows}>
            {folders.map(folder => (
              <button
                key={`${folder.scope}-${folder.label}`}
                type="button"
                style={D.folderRow}
                onClick={() => setActiveScope(folder.scope)}
              >
                <span style={{ ...D.folderIcon, background: fileTone(folder.tone).soft, color: fileTone(folder.tone).ink }}>
                  <V6Icon name={folder.scope === "data-room" ? "library" : folder.scope === "shared" ? "feed" : "doc"} size={14} />
                </span>
                <span style={D.folderText}>
                  <strong>{folder.label}</strong>
                  <span>{folder.sub}</span>
                </span>
                <span className="mono" style={D.folderCount}>{folder.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div style={D.fileListCard}>
          <div style={D.searchBar}>
            <V6Icon name="search" size={14} />
            <span>Search {dealTitle} {activeScope === "all" ? "files" : activeScope === "data-room" ? "data room" : "shared docs"}</span>
            <kbd style={D.kbd}>⌘K</kbd>
          </div>
          {sections.map(section => (
            <div key={section.title} style={D.fileSection}>
              <div style={D.fileSectionHead}>
                <div>
                  <div className="mono" style={D.fileSectionEyebrow}>{section.eyebrow}</div>
                  <h3 style={D.fileSectionTitle}>{section.title}</h3>
                </div>
                <span className="mono" style={D.fileSectionCount}>{section.rows.length}</span>
              </div>
              <div>
                {section.rows.map((file, index) => (
                  <DealFileRow
                    key={file.id}
                    file={file}
                    last={index === section.rows.length - 1}
                    onClick={() => openFile(file)}
                    relianceWarning={fileRelianceWarning(file, activeModelRefreshNeeds, activeScope)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function fileRelianceWarning(file: DealFileItem, refreshNeeds: TodayModelRefreshItem[], activeScope: FileScope): string | undefined {
  if (activeScope !== "data-room" || refreshNeeds.length === 0) return undefined;
  if (!file.provenanceLabel && file.kind !== "analysis" && !file.deliverableId) return undefined;

  const exact = refreshNeeds.find(item =>
    (file.modelOutputHash && item.outputHash === file.modelOutputHash) ||
    (file.modelType && item.modelType === file.modelType) ||
    (file.modelTitle && item.modelTitle.toLowerCase() === file.modelTitle.toLowerCase())
  );
  const item = exact || refreshNeeds[0];
  return `${item.modelTitle} needs rerun before external reliance`;
}

function DataRoomReliancePanel({
  dealTitle,
  scopeLabel,
  modelRefreshNeeds,
  onTalkToYulia,
  onRerunModel,
}: {
  dealTitle: string;
  scopeLabel: string;
  modelRefreshNeeds: TodayModelRefreshItem[];
  onTalkToYulia?: (prompt: string) => void;
  onRerunModel?: (item: TodayModelRefreshItem) => void;
}) {
  const hasRefreshNeeds = modelRefreshNeeds.length > 0;
  const headline = hasRefreshNeeds
    ? "Model reruns before external reliance"
    : `${scopeLabel} ready for controlled sharing`;
  const body = hasRefreshNeeds
    ? "The room can stay open, but agents should rerun affected models before taking these artifacts back to another system or using them in an IOI, LOI, diligence memo, or IC packet."
    : "No stale model outputs are currently blocking this room. Yulia still preserves source gaps, approvals, and counsel/CPA handoff boundaries before anything is treated as final.";

  const explainPrompt = hasRefreshNeeds
    ? `On ${dealTitle}: explain the model freshness issues blocking data-room reliance. Start with ${modelRefreshNeeds[0]?.modelTitle}, show the changed assumptions, and tell me which model versions to rerun before an agent takes artifacts back to its system.`
    : `On ${dealTitle}: explain why the ${scopeLabel} is ready for controlled sharing, including remaining source gaps, approvals, and THE LINE handoff boundaries.`;

  return (
    <div style={D.reliancePanel}>
      <div style={D.relianceHead}>
        <div>
          <h3 style={D.relianceTitle}>{headline}</h3>
          <p style={D.relianceBody}>{body}</p>
        </div>
        <button
          type="button"
          className="wkbtn"
          onClick={() => onTalkToYulia?.(explainPrompt)}
        >
          Ask Yulia
        </button>
      </div>
      {hasRefreshNeeds && (
        <div style={D.relianceRows}>
          {modelRefreshNeeds.slice(0, 3).map(item => (
            <div
              key={item.id}
              style={D.relianceRow}
            >
              <button
                type="button"
                style={D.relianceRowMain}
                onClick={() => onTalkToYulia?.(`On ${dealTitle}: rerun or explain ${item.modelTitle}. It is marked ${item.statusLabel} because ${item.reason}. Recompute action: ${item.recomputeActionKey || item.recomputeSurfaceActionId || "execute_model"}. ${item.recomputePrompt || "Preserve parent-output lineage and identify downstream artifacts that become current."} Changed inputs: ${item.changedInputs.join(", ") || "not specified"}. Watched inputs: ${item.watchedInputs.join(", ") || "not specified"}.`)}
              >
                <span style={D.relianceRowText}>
                  <strong>{item.modelTitle}</strong>
                  <span>{item.recomputeActionKey ? `${item.reason} Recompute action: ${item.recomputeActionKey}.` : item.reason}</span>
                </span>
                <span className="mono" style={D.reliancePill}>{item.statusLabel}</span>
                <span style={D.fileChevron} aria-hidden="true">›</span>
              </button>
              {onRerunModel && (
                <button
                  type="button"
                  className="wkbtn dark"
                  style={D.relianceRerunButton}
                  onClick={() => onRerunModel(item)}
                >
                  Rerun
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DealFileRow({ file, last, onClick, relianceWarning }: {
  file: DealFileItem;
  last: boolean;
  onClick: () => void;
  relianceWarning?: string;
}) {
  const t = fileTone(file.tone);
  return (
    <button
      type="button"
      style={{ ...D.fileRow, borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onClick}
    >
      <span style={{ ...D.fileIcon, background: t.soft, color: t.ink }}>
        <V6Icon name={file.kind === "analysis" ? "chart" : "doc"} size={17} />
      </span>
      <span style={D.fileRowText}>
        <strong>{file.title}</strong>
        <span>{file.meta}</span>
        {/* Provenance: a real output hash gets the substrate's seal (never an
            "unsigned draft" here — no hash means no seal, just the label). */}
        {file.modelOutputHash ? (
          <WorkSeal
            modelId={file.modelType ? `MODEL.${file.modelType}.v1` : undefined}
            outputHash={file.modelOutputHash}
          />
        ) : file.provenanceLabel ? (
          <span style={D.fileProvenance}>Model provenance: {file.provenanceLabel}</span>
        ) : null}
        {relianceWarning && <span style={D.fileWarning}>Model freshness: {relianceWarning}</span>}
        <span style={D.filePath}>Location: {file.location}</span>
      </span>
      <span style={{ ...D.fileStatus, background: t.soft, color: t.ink }}>{file.status}</span>
      <span style={D.fileChevron} aria-hidden="true">›</span>
    </button>
  );
}

// DERIVE rule for the stat tiles: when the deal data refreshes, the number
// settles from its previous value and flashes the one-shot muted-emerald
// tick (.wk-tick — global in workspace.css, loaded by V6App). The hook's
// first-render rule means initial load shows values instantly — no fake
// motion, no tick on mount.
function StatValue({ value }: { value: string }) {
  const { text, justSettled } = useDerivedDisplay(value);
  return (
    <div className="mono" style={D.statValue}>
      {text}
      <i className={`wk-tick${justSettled ? " on" : ""}`} aria-hidden="true">✓</i>
    </div>
  );
}

// A single produced-work card (analysis/model or document); opens in a tab.
function WorkCard({ file, dealName, openTab }: { file: LinkedFile; dealName: string; openTab: OpenTab }) {
  const open = () => openTab({ kind: file.kind, title: `${dealName} · ${file.title}`, id: file.id });
  return (
    <div
      className="wkcard tap"
      role="button"
      tabIndex={0}
      aria-label={`${file.title} (${file.status})`}
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      style={{ padding: "14px 16px", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <V6Icon name={file.kind === "doc" ? "doc" : "chart"} size={14} />
        <V6DocStatus status={file.status} />
      </div>
      <div style={D.linkedTitle}>{file.title}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{file.sub}</div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

// Renders ONLY Yulia's deal brief (substrate) + real deal facts. No
// fabrication: when Yulia hasn't read the deal, fields say so honestly and
// route to "ask Yulia" rather than inventing a market read / verdict / tax copy.
function buildDealIntelligence({
  dealName,
  real,
  dealBrief,
}: {
  dealName: string;
  real: DealRow | undefined;
  dealBrief: DealBrief | null;
}) {
  const hasRead = !!dealBrief;
  return {
    hasRead,
    marketHeadline: dealBrief?.marketRead?.headline || `Yulia hasn't built a market read for ${dealName} yet.`,
    // Facts from the deal record (not judgment). Sentence-case labels —
    // mono-caps killed in the judged tonal pass.
    marketTiles: [
      { label: "Industry", value: real?.industry || "—" },
      { label: "Geography", value: real?.location || "—" },
      { label: "Revenue", value: fmtCents(real?.revenue ?? null) },
      { label: "Earnings", value: fmtCents(real?.ebitda ?? real?.sde ?? null) },
    ],
    marketBullets: dealBrief?.marketRead?.bullets?.filter(Boolean).slice(0, 3) ?? [],
    researchNeeded: dealBrief?.marketRead?.researchNeeded?.filter(Boolean).slice(0, 3) ?? [],
    reviewLabel: dealBrief?.verdict?.label || (hasRead ? "Yulia's review" : "Review pending"),
    reviewScore: dealBrief?.verdict?.score,
    reviewText: dealBrief?.verdict?.text || "Yulia is analyzing this deal — her review appears once she's read it.",
    tax: dealBrief?.taxLegal?.tax || "Ask Yulia to run the tax & structure read for this deal.",
    legal: dealBrief?.taxLegal?.legal || "Ask Yulia to run the legal issue read for this deal.",
    nextMoves: (dealBrief?.nextMoves?.length
      ? dealBrief.nextMoves.slice(0, 3)
      : [{ title: "Ask Yulia for the next moves", why: "Yulia surfaces the next actions once she's read the deal.", prompt: `On ${dealName}: read this deal and tell me the next moves.`, actionId: "ask_yulia" }]
    ).map(move => ({
      title: move.title || "Open next move",
      why: move.why || "",
      prompt: move.prompt,
      actionId: isSurfaceActionId(move.actionId) ? move.actionId : undefined,
    })),
  };
}

function primaryDeliverableForJourney(journey?: string | null): { label: string; slug: string } {
  switch (journey) {
    case "sell":
      return { label: "CIM", slug: "sell-cim" };
    case "raise":
      return { label: "Pitch deck", slug: "raise-pitch-deck" };
    case "pmi":
      return { label: "100-day plan", slug: "pmi-100-day-plan" };
    case "buy":
    default:
      return { label: "LOI", slug: "buy-loi-draft" };
  }
}

function structureAnalysisForJourney(journey?: string | null): { label: string; slug: string } {
  switch (journey) {
    case "sell":
      return { label: "Deal Structure Analysis", slug: "sell-deal-structure-analysis" };
    case "raise":
      return { label: "Term Sheet Analysis", slug: "raise-term-sheet-analysis" };
    case "pmi":
      return { label: "Value Creation Plan", slug: "pmi-value-creation" };
    case "buy":
    default:
      return { label: "Capital Structure Analysis", slug: "buy-capital-structure" };
  }
}

function riskAnalysisForJourney(journey?: string | null): { label: string; slug: string } {
  switch (journey) {
    case "pmi":
      return { label: "Operations Assessment", slug: "pmi-ops-assessment" };
    case "sell":
      return { label: "Price Gap Analysis", slug: "sell-price-gap-analysis" };
    case "raise":
      return { label: "Term Sheet Analysis", slug: "raise-term-sheet-analysis" };
    case "buy":
    default:
      return { label: "Red Flag Report", slug: "buy-red-flag-report" };
  }
}

function resolveMarketBulletAnalysis(
  bullet: string,
  journey: string | null | undefined,
): Extract<DealMoveAction, { kind: "analysis" }> {
  const text = bullet.toLowerCase();

  if (/\bbuyer\b|\bacquirer\b|\bstrategic\b|\bsponsor\b|\bpe\b|\bplatform\b|\broll[-\s]?up\b|\buniverse\b|\bpool\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "buyer_fit",
      menuItemSlug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard",
      label: "buyer universe analysis",
      busyKey: "buyer-universe",
    };
  }

  if (/\bfinanc|\bdebt\b|\blender\b|\bsba\b|\bbank\b|\bdscr\b|\bcapital\b|\bseller note\b|\bcash to close\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: /\bsba\b/.test(text) ? "sba" : "capital_structure",
      menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-capital-structure",
      label: /\bsba\b/.test(text) ? "SBA structure analysis" : "financing climate model",
      busyKey: /\bsba\b/.test(text) ? "sba" : "capital-structure",
    };
  }

  if (/\btax\b|\blegal\b|\bcounsel\b|\bcpa\b|\breps?\b|\bwarrant|\bstructure\b|\ballocation\b|\bsign[-\s]?off\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "tax_legal_structure",
      menuItemSlug: structureAnalysisForJourney(journey).slug,
      label: "tax and legal implications model",
      busyKey: "tax-legal",
    };
  }

  if (/\bworking[-\s]?cap|\badd[-\s]?back|\bpeg\b|\bar\b|\ba\/r\b|\binventory\b|\bquality of earnings\b|\bqoe\b|\bcohort\b|\bcustomer\b|\bsource gap\b|\bgap\b|\bdiligence\b|\bmissing\b|\brequest\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: /\bworking[-\s]?cap|\bpeg\b|\bar\b|\ba\/r\b|\binventory\b/.test(text) ? "working_capital" : "qoe",
      menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard",
      label: /\bworking[-\s]?cap|\bpeg\b|\bar\b|\ba\/r\b|\binventory\b/.test(text) ? "working-capital analysis" : "diligence gap analysis",
      busyKey: "diligence-gap",
    };
  }

  if (/\bmultiple\b|\bpremium\b|\bpricing\b|\bvaluation\b|\btrend\b|\btransaction\b|\bmarket\b|\bcomp\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "comps",
      menuItemSlug: "universal-comp-analysis",
      label: "market comps analysis",
      busyKey: "market-comps",
    };
  }

  return {
    kind: "analysis",
    analysisType: "market_intelligence",
    menuItemSlug: "universal-market-intelligence",
    label: "market intelligence read",
    busyKey: "market-read",
  };
}

function resolveDealMoveAction(
  move: DealNextMove,
  journey: string | null | undefined,
  primaryDeliverable: { label: string; slug: string },
): DealMoveAction {
  if (isSurfaceActionId(move.actionId)) {
    const explicit = resolveSurfaceDealMoveAction(move.actionId, journey, primaryDeliverable);
    if (explicit) return explicit;
  }

  const text = `${move.title || ""} ${move.why || ""} ${move.prompt || ""}`.toLowerCase();

  if (/\bmarket\b|\bbuyer universe\b|\bsource gap\b|\bresearch\b|\bindustry\b|\bbuyer appetite\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "market_intelligence",
      menuItemSlug: "universal-market-intelligence",
      label: "market intelligence read",
      busyKey: "market-read",
    };
  }

  if (/\bcomps?\b|\bcomparables?\b|\bmultiple\b|\bpricing\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "comps",
      menuItemSlug: "universal-comp-analysis",
      label: "comparable transactions analysis",
      busyKey: "comps",
    };
  }

  if (/\btax\b|\blegal\b|\bstructure\b|\bcounsel\b|\bcpa\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: "tax_legal_structure",
      menuItemSlug: structureAnalysisForJourney(journey).slug,
      label: "tax and legal implications model",
      busyKey: "tax-legal",
    };
  }

  if (/\bcapital\b|\bsba\b|\bfinancing\b|\bterm sheet\b|\bdebt\b|\blender\b/.test(text)) {
    return {
      kind: "analysis",
      analysisType: /\bsba\b/.test(text) ? "sba" : /\bterm sheet\b/.test(text) ? "term_sheet" : "capital_structure",
      menuItemSlug: structureAnalysisForJourney(journey).slug,
      label: "capital structure model",
      busyKey: "structure",
    };
  }

  if (/\brisk\b|\bred flag\b|\bdiligence gap\b|\bcleanup\b|\bissue\b/.test(text)) {
    const next = riskAnalysisForJourney(journey);
    return {
      kind: "analysis",
      analysisType: "red_flags",
      menuItemSlug: next.slug,
      label: next.label,
      busyKey: "risk",
    };
  }

  if (/\bdraft\b|\bloi\b|\bioi\b|\bcim\b|\bpitch\b|\bmemo\b|\b100-day\b|\bplan\b/.test(text)) {
    return { kind: "artifact", slug: primaryDeliverable.slug, label: primaryDeliverable.label, busyKey: "generate" };
  }

  if (/\bdata[-\s]?room\b/.test(text)) {
    return {
      kind: "scope",
      scope: "data-room",
      note: "Opened the shared diligence data room for this deal.",
    };
  }
  if (/\baction\b|\bshared\b|\bsent\b|\breceived\b|\bdeferred\b|\bexecuted\b|\breview\b|\bsignature\b/.test(text)) {
    return {
      kind: "scope",
      scope: "shared",
      note: "Opened the shared/action queue: sent, received, deferred, in-review, and executed items.",
    };
  }
  if (/\bfile\b|\bfiles\b|\bdeliverable\b|\bdeliverables\b/.test(text)) {
    return {
      kind: "scope",
      scope: "all",
      note: "Opened all files for this deal.",
    };
  }

  return { kind: "chat" };
}

function resolveSurfaceDealMoveAction(
  actionId: SurfaceActionId,
  journey: string | null | undefined,
  primaryDeliverable: { label: string; slug: string },
): DealMoveAction | null {
  switch (actionId) {
    case "run_market_intelligence":
      return {
        kind: "analysis",
        analysisType: "market_intelligence",
        menuItemSlug: "universal-market-intelligence",
        label: "market intelligence read",
        busyKey: "market-read",
      };
    case "run_tax_legal_structure":
      return {
        kind: "analysis",
        analysisType: "tax_legal_structure",
        menuItemSlug: structureAnalysisForJourney(journey).slug,
        label: "tax and legal implications model",
        busyKey: "tax-legal",
      };
    case "run_working_capital_analysis":
      return {
        kind: "analysis",
        analysisType: "working_capital",
        menuItemSlug: journey === "sell" ? "sell-working-capital-analysis" : "buy-working-capital-model",
        label: "working-capital analysis",
        busyKey: "working-capital",
      };
    case "run_recast_analysis":
      return {
        kind: "analysis",
        analysisType: "recast",
        menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard",
        label: "recast analysis",
        busyKey: "recast",
      };
    case "run_buyer_fit_analysis":
      return {
        kind: "analysis",
        analysisType: "buyer_fit",
        menuItemSlug: journey === "sell" ? "sell-buyer-list" : "buy-deal-scorecard",
        label: "buyer fit analysis",
        busyKey: "buyer-fit",
      };
    case "run_valuation_analysis":
      return {
        kind: "analysis",
        analysisType: "valuation",
        menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model",
        label: "valuation analysis",
        busyKey: "valuation",
      };
    case "run_comps_analysis":
      return {
        kind: "analysis",
        analysisType: "comps",
        menuItemSlug: "universal-comp-analysis",
        label: "comparable transactions analysis",
        busyKey: "comps",
      };
    case "run_capital_structure_model":
      return {
        kind: "analysis",
        analysisType: "capital_structure",
        menuItemSlug: structureAnalysisForJourney(journey).slug,
        label: "capital structure model",
        busyKey: "structure",
      };
    case "run_sba_analysis":
      return {
        kind: "analysis",
        analysisType: "sba",
        menuItemSlug: "universal-sba-analysis",
        label: "SBA structure analysis",
        busyKey: "sba",
      };
    case "run_red_flags_analysis": {
      const risk = riskAnalysisForJourney(journey);
      return {
        kind: "analysis",
        analysisType: "red_flags",
        menuItemSlug: risk.slug,
        label: risk.label,
        busyKey: "risk",
      };
    }
    case "run_qoe_analysis":
      return {
        kind: "analysis",
        analysisType: "qoe",
        menuItemSlug: journey === "sell" ? "sell-financial-spread" : "buy-deal-scorecard",
        label: "QoE analysis",
        busyKey: "qoe",
      };
    case "run_lbo_analysis":
      return {
        kind: "analysis",
        analysisType: "lbo",
        menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model",
        label: "LBO model",
        busyKey: "lbo",
      };
    case "run_dcf_analysis":
      return {
        kind: "analysis",
        analysisType: "dcf",
        menuItemSlug: journey === "sell" ? "sell-valuation-report" : journey === "raise" ? "raise-pre-post-model" : "buy-valuation-model",
        label: "DCF model",
        busyKey: "dcf",
      };
    case "run_sensitivity_analysis":
      return {
        kind: "analysis",
        analysisType: "sensitivity",
        menuItemSlug: journey === "sell" ? "sell-valuation-report" : "buy-valuation-model",
        label: "sensitivity model",
        busyKey: "sensitivity",
      };
    case "run_earnout_analysis":
      return {
        kind: "analysis",
        analysisType: "earnout",
        menuItemSlug: journey === "sell" ? "sell-deal-structure-analysis" : "buy-earnout-analysis",
        label: "earnout model",
        busyKey: "earnout",
      };
    case "run_tax_impact_analysis":
      return {
        kind: "analysis",
        analysisType: "tax_impact",
        menuItemSlug: structureAnalysisForJourney(journey).slug,
        label: "tax impact model",
        busyKey: "tax-impact",
      };
    case "run_purchase_price_allocation":
      return {
        kind: "analysis",
        analysisType: "purchase_price_allocation",
        menuItemSlug: structureAnalysisForJourney(journey).slug,
        label: "purchase-price allocation",
        busyKey: "ppa",
      };
    case "run_cap_table_analysis":
      return {
        kind: "analysis",
        analysisType: "cap_table",
        menuItemSlug: "raise-cap-table",
        label: "cap table model",
        busyKey: "cap-table",
      };
    case "run_covenant_analysis":
      return {
        kind: "analysis",
        analysisType: "covenant",
        menuItemSlug: journey === "raise" ? "raise-use-of-funds" : "buy-capital-structure",
        label: "covenant model",
        busyKey: "covenant",
      };
    case "generate_loi":
      return { kind: "artifact", slug: "buy-loi-draft", label: "LOI draft", busyKey: "generate" };
    case "generate_primary_deliverable":
      return { kind: "artifact", slug: primaryDeliverable.slug, label: primaryDeliverable.label, busyKey: "generate" };
    case "open_files_data_room":
      return { kind: "scope", scope: "data-room", note: "Opened the shared diligence data room for this deal." };
    case "open_files_shared":
    case "open_files_needing_action":
      return {
        kind: "scope",
        scope: "shared",
        note: "Opened the shared/action queue: sent, received, deferred, in-review, and executed items.",
      };
    case "open_files_all":
      return { kind: "scope", scope: "all", note: "Opened all files for this deal." };
    default:
      return null;
  }
}

function buildDealFilesFromReal(
  deliverables: DeliverableRow[],
  room: DealDataRoom | null,
  dealTitle: string,
): DealFileItem[] {
  const filedDeliverableIds = new Set(
    (room?.documents ?? [])
      .map(doc => doc.deliverable_id)
      .filter((value): value is number => typeof value === "number"),
  );

  const privateFiles = deliverables
    .filter(d => !filedDeliverableIds.has(d.id))
    .map(d => deliverableToFileItem(d, dealTitle));

  const roomFiles = (room?.documents ?? []).map(doc => dataRoomDocToFileItem(doc, dealTitle));
  const unfiledFiles = (room?.unfiledDeliverables ?? [])
    .filter(d => !deliverables.some(existing => existing.id === d.id))
    .map(d => deliverableToFileItem(d as DeliverableRow, dealTitle));

  const merged = [...privateFiles, ...unfiledFiles, ...roomFiles];
  return merged;
}

function deliverableToFileItem(d: DeliverableRow, dealTitle: string): DealFileItem {
  const name = d.name || formatType(d.slug || "deliverable");
  const model = d.folder_category === "models" || /model/i.test(`${d.slug || ""} ${name}`);
  const analysis = model || isAnalysisLike(`${d.slug || ""} ${name}`);
  const draft = /loi|ioi|cim|memo|draft|letter|nda|term/i.test(`${d.slug || ""} ${name}`);
  const section: FileSectionKey = draft && d.status !== "complete" ? "drafts" : analysis ? "analysis" : "private";
  const folder = model ? "Models" : section === "analysis" ? "Analysis" : section === "drafts" ? "Drafts" : "Workspace";
  return {
    id: String(d.id),
    title: name,
    meta: `${model ? "Model artifact" : formatStatus(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
    location: `All Files / Private workspace / ${folder}`,
    status: d.status === "complete" ? "Open" : formatStatus(d.status),
    kind: analysis ? "analysis" : "doc",
    tone: "private",
    scopes: ["all"],
    section,
    deliverableId: d.id,
  };
}

function dataRoomDocToFileItem(doc: DataRoomDocument, dealTitle: string): DealFileItem {
  const legal = /loi|ioi|nda|agreement|disclosure|schedule|term|contract/i.test(doc.name);
  const analysis = isAnalysisLike(`${doc.file_type} ${doc.name}`);
  const executed = ["executed", "locked", "agreed"].includes(doc.status);
  const review = ["review", "approved"].includes(doc.status);
  const section: FileSectionKey = executed ? "executed" : review ? "sent" : legal || doc.file_type === "deliverable" ? "room-docs" : "artifacts";
  const tone: FileTone = executed ? "executed" : review ? "sent" : "room";
  const snapshot = doc.deliverable_snapshot || {};
  const modelTitle = doc.model_execution_title || (typeof snapshot.artifactKind === "string" ? formatStatus(snapshot.artifactKind) : null);
  const modelOutputHash = doc.model_output_hash || (typeof snapshot.outputHash === "string" ? snapshot.outputHash : null);
  const provenanceLabel = modelOutputHash
    ? `${modelTitle || "Model output"} · ${shortHash(modelOutputHash)}`
    : doc.deliverable_folder_category === "models" || snapshot.canvasTabId
      ? `${modelTitle || "Model artifact"} · provenance linked`
      : undefined;
  return {
    id: `room-${doc.id}`,
    title: doc.name,
    meta: `${formatFileType(doc.file_type)} · ${formatStatus(doc.status)} · ${fmtRelative(doc.updated_at || doc.created_at)}`,
    location: `All Files / Data Room / ${section === "artifacts" ? "Artifacts" : section === "executed" ? "Executed" : "Deal documents"}`,
    status: executed ? "Immutable" : review ? "In review" : doc.status === "draft" ? "Draft" : "View",
    kind: analysis ? "analysis" : "doc",
    tone,
    scopes: ["all", "data-room", ...(review || executed ? ["shared" as const] : [])],
    section,
    deliverableId: doc.deliverable_id ?? undefined,
    documentId: doc.id,
    provenanceLabel,
    modelOutputHash: modelOutputHash || undefined,
    modelType: doc.model_execution_type || undefined,
    modelTitle: modelTitle || undefined,
  };
}

function isAnalysisLike(input: string): boolean {
  return /model|valuation|analysis|recast|sba|comp|score|risk|tax|financial|xls|xlsx|csv|p&l|pl/i.test(input);
}

function formatFileType(input: string): string {
  if (!input) return "File";
  if (input.length <= 5) return input.toUpperCase();
  return formatStatus(input);
}

function samplePortfolioForDeal(id: string, title: string): string {
  if (/hvac/i.test(title) || id.includes("hvac")) return "Watchlist";
  return "Buy";
}

function scopeCopy(scope: FileScope): { label: string; title: string; sub: string } {
  if (scope === "data-room") {
    return {
      label: "Data Room",
      title: "Shared diligence drive",
      sub: "Permissioned materials for the deal team: source artifacts, legal docs, review items, and executed records.",
    };
  }
  if (scope === "shared") {
    return {
      label: "Shared",
      title: "Sent, received, and deferred",
      sub: "Workflow view for documents outside your private workspace: sent out, received back, routed to counsel, or executed.",
    };
  }
  return {
    label: "All Files",
    title: "Everything in this deal library",
    sub: "Private working files, analysis, drafts, data-room materials, shared docs, and locked executed records.",
  };
}

function foldersForScope(scope: FileScope, files: DealFileItem[]): DealFolder[] {
  if (scope === "data-room") {
    return [
      folder("Artifacts", "Source files for diligence review", files, "artifacts", "data-room", "room"),
      folder("Drafted legal docs", "Prepared for room sharing", files, "room-docs", "data-room", "room"),
      folder("In review", "Markup or approval in progress", files, "sent", "shared", "sent"),
      folder("Executed", "Immutable data-room records", files, "executed", "shared", "executed"),
    ];
  }
  if (scope === "shared") {
    return [
      folder("Sent", "Awaiting action from another party", files, "sent", "shared", "sent"),
      folder("Received", "Waiting on you or your team", files, "received", "shared", "received"),
      folder("Deferred", "Routed to counsel or another reviewer", files, "deferred", "shared", "deferred"),
      folder("Executed", "Countersigned and locked", files, "executed", "shared", "executed"),
    ];
  }
  return [
    { label: "All Files", sub: "Full deal library", count: files.length, scope: "all", tone: "private" },
    { label: "Private workspace", sub: "Yulia drafts, memos, models", count: files.filter(f => ["private", "analysis", "drafts"].includes(f.section)).length, scope: "all", tone: "private" },
    { label: "Data Room", sub: "Shared drive inside this deal", count: files.filter(f => f.scopes.includes("data-room")).length, scope: "data-room", tone: "room" },
    { label: "Shared", sub: "Sent, received, deferred, executed", count: files.filter(f => f.scopes.includes("shared")).length, scope: "shared", tone: "sent" },
  ];
}

function folder(
  label: string,
  sub: string,
  files: DealFileItem[],
  section: FileSectionKey,
  scope: FileScope,
  tone: FileTone,
): DealFolder {
  return { label, sub, count: files.filter(file => file.section === section).length, scope, tone };
}

function sectionsForScope(scope: FileScope, files: DealFileItem[]): Array<{ eyebrow: string; title: string; rows: DealFileItem[] }> {
  if (scope === "data-room") {
    return [
      fileSection("ARTIFACTS", "Source artifacts", files, ["artifacts", "received", "deferred"]),
      fileSection("LEGAL DOCS", "Drafted and in review", files, ["room-docs", "sent"]),
      fileSection("EXECUTED", "Immutable records", files, ["executed"]),
    ].filter(section => section.rows.length > 0);
  }
  if (scope === "shared") {
    return [
      fileSection("SENT", "Sent and awaiting action", files, ["sent"]),
      fileSection("RECEIVED", "Received and awaiting action", files, ["received"]),
      fileSection("DEFERRED", "Routed to another reviewer", files, ["deferred"]),
      fileSection("EXECUTED", "Locked and auditable", files, ["executed"]),
    ].filter(section => section.rows.length > 0);
  }
  return [
    fileSection("PRIVATE", "Private workspace: models, analysis, drafts", files, ["private", "analysis", "drafts"]),
    fileSection("DATA ROOM", "Shared diligence drive", files, ["artifacts", "room-docs", "received", "deferred"]),
    fileSection("SHARED", "Sent, received, deferred, executed", files, ["sent", "executed"]),
  ].filter(section => section.rows.length > 0);
}

function fileSection(eyebrow: string, title: string, files: DealFileItem[], keys: FileSectionKey[]) {
  return { eyebrow, title, rows: files.filter(file => keys.includes(file.section)) };
}

function fileTone(tone: FileTone): { ink: string; soft: string } {
  const tones: Record<FileTone, { ink: string; soft: string }> = {
    private: { ink: "#00210F", soft: "#CFFFE1" },
    room: { ink: "#3F7D64", soft: "rgba(98,153,135,0.16)" },
    sent: { ink: "#57534A", soft: "rgba(25,24,19,0.07)" },
    received: { ink: "#9C7128", soft: "#FAF1E1" },
    deferred: { ink: "#A85248", soft: "rgba(235,206,206,0.58)" },
    executed: { ink: "#191813", soft: "rgba(25,24,19,0.08)" },
  };
  return tones[tone];
}

function fmtCents(cents: number | null): string {
  if (!cents) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function buildStats(d: DealRow): Stat[] {
  const sdeMargin = d.revenue && d.sde ? `${Math.round((d.sde / d.revenue) * 100)}% of revenue` : "Owner earnings";
  const ebitdaMargin = d.revenue && d.ebitda ? `${Math.round((d.ebitda / d.revenue) * 100)}% margin` : "Operating earnings";
  const earnings = d.ebitda || d.sde || null;
  const askingMultiple = d.asking_price && earnings ? `${(d.asking_price / earnings).toFixed(1)}× earnings` : "Not set";
  const valuation = (d.financials?.valuation_midpoint ?? d.financials?.valuation ?? d.financials?.enterprise_value ?? null) as number | null;
  return [
    { k: "Revenue", v: fmtCents(d.revenue), sub: "Trailing twelve months" },
    { k: "SDE", v: fmtCents(d.sde), sub: sdeMargin },
    { k: "EBITDA", v: fmtCents(d.ebitda), sub: ebitdaMargin },
    { k: "Asking price", v: fmtCents(d.asking_price), sub: askingMultiple },
    { k: "Modeled valuation", v: valuation ? fmtCents(valuation) : "—", sub: valuation ? "From Yulia's model" : "Not modeled yet" },
  ];
}

// League range band for the Asking-price tile: where the deal's implied
// multiple (asking / earnings, both in cents) sits inside the league's
// published multiple range. The marker clamps to the track — an out-of-range
// multiple pins to the 0%/100% edge and flips the dot to the out-of-range
// color rather than overflowing the bar.
interface LeagueBandData {
  league: string;
  min: number;
  max: number;
  metric: "SDE" | "EBITDA";
  implied: number;
  pct: number; // marker position, clamped 0–100
  inRange: boolean;
}

function buildLeagueBand(league: string, askingCents: number, earningsCents: number): LeagueBandData | null {
  const entry = LEAGUE_MULTIPLES[league];
  if (!entry || earningsCents <= 0 || entry.max <= entry.min) return null;
  const implied = askingCents / earningsCents;
  const pct = Math.max(0, Math.min(100, ((implied - entry.min) / (entry.max - entry.min)) * 100));
  return {
    league,
    min: entry.min,
    max: entry.max,
    metric: entry.metric,
    implied,
    pct,
    inRange: implied >= entry.min && implied <= entry.max,
  };
}

// Methodology "you are here": map the deal's journey to its ordered stages and
// mark each done / current / upcoming from gate_progress + current_gate.
function buildStageProgress(
  d: DealRow,
  gates: { gate: string; status: string; completed_at: string | null }[],
  stats?: { total: number; completed: number; in_progress: number },
): StageProgress | null {
  const journeyGates = getJourneyGates(d.journey_type);
  if (journeyGates.length === 0) return null;
  const completedSet = new Set(
    gates.filter(g => g.completed_at || /complete|done|passed/i.test(g.status)).map(g => g.gate),
  );
  const currentIndex = Math.max(0, journeyGates.findIndex(g => g.id === d.current_gate));
  const stages: StageCell[] = journeyGates.map((g, i) => ({
    id: g.id,
    name: g.name,
    state: completedSet.has(g.id) || i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));
  return {
    journeyLabel: d.journey_type.toUpperCase(),
    stages,
    currentIndex,
    currentName: journeyGates[currentIndex]?.name ?? "—",
    total: journeyGates.length,
    nextName: journeyGates[currentIndex + 1]?.name ?? null,
    deliverablesDone: stats?.completed ?? 0,
    deliverablesTotal: stats?.total ?? 0,
  };
}

// Split produced work into analyses/models (DCF, LBO, valuation, working
// capital, QoE…) vs. documents (CIM, LOI, memos) so each can be shown plainly.
const ANALYSIS_KEYWORDS = /valuation|dcf|lbo|capital[-\s]?structure|working[-\s]?capital|\bqoe\b|quality[-\s]?of[-\s]?earnings|sensitivity|earnout|\bsba\b|dscr|comps?\b|scorecard|\bmodel\b|recast|tax[-\s]?impact|financial[-\s]?spread|cap[-\s]?table|covenant/i;

function isAnalysisDeliverable(d: DeliverableRow): boolean {
  if (d.artifact_kind && /model|analysis|snapshot|comparison/i.test(d.artifact_kind)) return true;
  if (d.folder_category && /model|analys/i.test(d.folder_category)) return true;
  return ANALYSIS_KEYWORDS.test(`${d.slug || ""} ${d.name || ""}`);
}

function splitLinkedWork(linked: DeliverableRow[]): { analyses: LinkedFile[]; documents: LinkedFile[] } {
  const analyses: LinkedFile[] = [];
  const documents: LinkedFile[] = [];
  for (const d of linked) {
    const base = deliverableToLinkedFile(d);
    if (isAnalysisDeliverable(d)) analyses.push({ ...base, kind: "analysis" });
    else documents.push(base);
  }
  return { analyses, documents };
}

function deliverableToLinkedFile(d: DeliverableRow): LinkedFile {
  const label = d.name || formatType(d.slug || "deliverable");
  const status: DocStatusKind = d.status === "complete" ? "live" : d.status === "draft" ? "draft" : "saved";
  return {
    kind: "doc",
    title: label,
    status,
    sub: `${formatStatus(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
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

function shortHash(value?: string | null): string {
  if (!value) return "hash pending";
  const clean = String(value).replace(/^sha256:/i, "");
  return clean.length <= 12 ? clean : `${clean.slice(0, 6)}…${clean.slice(-4)}`;
}

/* ── Wave C1 hero material (consumes shared/verdictMaterial.ts) ── */

/* Ghost glass pill on texture (TodayRoot HERO_PILL parity): gradient only,
   no border, no blur. Explicit resets instead of all:unset so the .wk-tap
   class transitions are not overridden by the inline cascade. */
const HERO_ACTION_PILL: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  minHeight: 34,
  padding: "0 14px",
  borderRadius: 999,
  background: HERO_GHOST_PILL_BG,
  color: "#fff",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
};

/* The overlay's dark stop as an opaque pre-decode fill — the hero never
   flashes white (or a wrong verdict color) before its texture decodes. */
function heroFallbackFill(kind: VerdictKind): string {
  const stops = VERDICT_MATERIAL[kind].overlay.match(/rgba\([^)]+\)/g);
  const last = stops?.[stops.length - 1];
  return last ? last.replace(/[\d.]+\)$/, "1)") : "#10243E";
}

const D: Record<string, CSSProperties> = {
  // Masthead register — .wk-masthead supplies the Fraunces serif family.
  // White on the hero's watercolor (the 0.30-alpha top zone stays bright).
  h1: {
    fontSize: 44, fontWeight: 540, letterSpacing: "-0.015em",
    margin: 0, color: "#fff", textWrap: "balance",
  },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.92)", marginTop: 6 },
  // wkbtn classes handle the banner styles; actionBanner provides margin
  actionBanner: {
    marginBottom: 18,
  },
  // Stat tile: as-card physical recipe (lit-from-above top hairline + the
  // 4-layer cool-slate shadow stack). Flat white behind the numerals — depth
  // at rest, never material.
  statTile: {
    padding: "14px 18px",
    borderRadius: "var(--wk-radius-card)",
    border: "var(--wk-as-card-border)",
    borderTopColor: "var(--wk-as-card-border-top)",
    boxShadow: "var(--wk-as-card-shadow)",
  },
  statLabel: {
    fontSize: 10, color: "var(--ink-3)",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  statValue: {
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 27,
    letterSpacing: "-0.02em", color: "var(--ink)",
    marginTop: 4, fontVariantNumeric: "tabular-nums",
  },
  stageCard: { padding: "22px 26px" },
  stageHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 },
  stageTitle: { fontFamily: "var(--font-display)", fontWeight: 750, fontSize: 22, letterSpacing: "-0.02em", margin: 0, color: "var(--ink)" },
  stageMeta: { fontSize: 12.5, color: "var(--ink-3)", textAlign: "right", lineHeight: 1.5, flexShrink: 0 },
  stageTrack: { display: "flex", alignItems: "flex-start", gap: 0 },
  stageNodeWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "0 0 auto", width: 96 },
  stageNode: { width: 30, height: 30, borderRadius: "50%", border: "1.5px solid var(--line-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--ink-3)", background: "var(--surface)", fontVariantNumeric: "tabular-nums" },
  // De-neon (judged): journey progress wears DERIVE's muted emerald, not the
  // brand neon — green stays rationed. Node/connector grammar unchanged.
  stageNodeDone: { background: "#2E8C5A", borderColor: "#2E8C5A", color: "#fff" },
  stageNodeCurrent: { borderColor: "#2E8C5A", color: "#2E8C5A", borderWidth: 2, boxShadow: "0 0 0 4px rgba(46,140,90,.15)" },
  stageNodeLabel: { fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.25, textAlign: "center", maxWidth: 100 },
  stageConnector: { flex: 1, height: 2, background: "var(--line)", marginTop: 14, minWidth: 12, borderRadius: 2 },
  workGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12,
    // Below-fold paint skip for many WorkCards.
    contentVisibility: "auto", containIntrinsicSize: "auto 480px",
  },
  emptyWork: { padding: "18px 20px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 },
  intelligenceGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(360px, 0.85fr)",
    gap: 16,
    marginBottom: 32,
    alignItems: "stretch",
    // Below-fold paint skip — long deal pages stop painting offscreen.
    contentVisibility: "auto",
    containIntrinsicSize: "auto 480px",
  },
  marketCard: {
    padding: "24px 26px",
  },
  intelTitle: {
    margin: 0,
    color: "var(--ink)",
    fontFamily: "var(--font-display)",
    fontWeight: 750,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.035em",
  },
  intelLead: {
    margin: "12px 0 0",
    color: "var(--ink-2)",
    fontSize: 14,
    lineHeight: 1.45,
    maxWidth: 760,
  },
  marketTileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },
  // Info-blue tonal field (baseline trio — informational, not a verdict).
  // Tonal soft ≠ texture; numerals keep the mono verification voice on it.
  desktopMarketTile: {
    borderRadius: 12,
    padding: "12px 13px",
    background: VERDICT_MATERIAL.baseline.tone.soft,
    border: "1px solid var(--line)",
  },
  desktopMarketTileLabel: {
    fontSize: 11,
    color: VERDICT_MATERIAL.baseline.tone.ink,
    fontWeight: 600,
  },
  desktopMarketTileValue: {
    marginTop: 7,
    color: "var(--ink)",
    fontSize: 15,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  marketBulletStack: {
    display: "grid",
    gap: 9,
    marginTop: 16,
  },
  marketBullet: {
    all: "unset",
    display: "block",
    borderRadius: 10,
    padding: "11px 13px",
    background: "var(--surface)",
    border: "1px solid var(--line-2)",
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.35,
    cursor: "pointer",
  },
  researchBox: {
    marginTop: 14,
    display: "grid",
    gap: 5,
    borderRadius: 10,
    padding: "12px 13px",
    background: "var(--st-review-bg)",
    color: "var(--st-review-fg)",
    fontSize: 12.5,
    lineHeight: 1.35,
  },
  intelSideStack: {
    display: "grid",
    gap: 16,
  },
  // Structure read rests on the warm composer elevation stack — depth, zero
  // material.
  reviewCard: {
    padding: "22px 24px",
    boxShadow: "var(--wk-elev-card)",
  },
  reviewTop: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 18,
    alignItems: "start",
    marginTop: 8,
  },
  reviewTitle: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: "-0.035em",
    color: "var(--ink)",
  },
  reviewText: {
    margin: "8px 0 0",
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.42,
  },
  reviewScore: {
    width: 72,
    height: 72,
    borderRadius: 14,
    background: "var(--st-good-bg)",
    color: "var(--st-good-fg)",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: 0,
    textTransform: "uppercase",
    fontSize: 9,
    letterSpacing: "0.12em",
    fontWeight: 750,
  },
  structureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 18,
    color: "var(--ink-2)",
    fontSize: 12.5,
    lineHeight: 1.36,
  },
  // Sentence-case readable label (mono-caps killed in the judged tonal pass).
  structureLabel: {
    display: "block",
    marginBottom: 5,
    color: "var(--ink-3)",
    fontSize: 12,
    fontWeight: 600,
  },
  nextCard: {
    padding: "20px 24px 8px",
  },
  nextMove: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 0",
    color: "var(--ink)",
    cursor: "pointer",
  },
  nextMoveText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  nextMoveTitle: {
    color: "var(--ink)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  nextMoveSub: {
    color: "var(--ink-2)",
    fontSize: 12.2,
    lineHeight: 1.35,
  },
  nextArrow: {
    color: "var(--ink-3)",
    fontSize: 26,
    lineHeight: 1,
  },
  linkedTitle: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
    letterSpacing: "-0.01em", color: "var(--ink)", marginTop: 12,
  },
  fileSystem: {
    marginBottom: 32,
    padding: 22,
    borderRadius: 14,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 1px 2px rgba(25,24,19,.06)",
    // Below-fold paint skip — the file explorer is a long surface.
    contentVisibility: "auto",
    containIntrinsicSize: "auto 480px",
  },
  fileTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 16,
  },
  fileTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--ink)",
  },
  fileSub: {
    margin: "8px 0 0",
    maxWidth: 780,
    color: "var(--ink-3)",
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  scopeRail: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBottom: 16,
    overflowX: "auto",
  },
  scopeChip: {
    all: "unset",
    minHeight: 38,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "0 14px",
    borderRadius: 999,
    background: "var(--surface)",
    border: "1px solid var(--line-2)",
    color: "var(--ink)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.88rem",
  },
  scopeChipActive: {
    background: "var(--ink)",
    color: "#FFFFFF",
    borderColor: "var(--ink)",
  },
  scopeCount: {
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    display: "inline-grid",
    placeItems: "center",
    borderRadius: 999,
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    fontSize: 10,
    fontWeight: 600,
  },
  scopeCountActive: {
    background: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
  },
  reliancePanel: {
    margin: "0 0 16px",
    borderRadius: 12,
    padding: 16,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  relianceHead: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "start",
    gap: 14,
  },
  relianceTitle: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: 19,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    color: "var(--ink)",
  },
  relianceBody: {
    margin: "7px 0 0",
    color: "var(--ink-2)",
    fontSize: 12.5,
    lineHeight: 1.4,
    maxWidth: 860,
  },
  relianceRows: {
    display: "grid",
    gap: 8,
    marginTop: 13,
  },
  relianceRow: {
    minHeight: 58,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 10,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  },
  relianceRowMain: {
    all: "unset",
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto 16px",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },
  relianceRowText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 12,
    lineHeight: 1.32,
    color: "var(--ink-2)",
  },
  reliancePill: {
    borderRadius: 999,
    padding: "5px 9px",
    background: "var(--st-review-bg)",
    color: "var(--st-review-fg)",
    fontSize: 9,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  relianceRerunButton: {
    all: "unset",
    minHeight: 34,
    padding: "0 13px",
    borderRadius: 999,
    background: "var(--ink)",
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid var(--line)",
  },
  fileGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 0.34fr) minmax(0, 1fr)",
    gap: 16,
    alignItems: "start",
  },
  folderCard: {
    borderRadius: 12,
    padding: 16,
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  folderRoot: {
    display: "block",
    color: "var(--ink)",
    fontSize: 14,
    letterSpacing: "-0.02em",
  },
  folderRows: {
    marginTop: 12,
    display: "grid",
    gap: 8,
  },
  folderRow: {
    all: "unset",
    minHeight: 54,
    display: "grid",
    gridTemplateColumns: "34px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 10,
    padding: "8px 9px",
    borderRadius: 10,
    cursor: "pointer",
    color: "var(--ink-3)",
  },
  folderIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
  },
  folderText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 11.5,
    lineHeight: 1.25,
  },
  folderCount: {
    fontSize: 10,
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
  },
  fileListCard: {
    borderRadius: 12,
    border: "1px solid var(--line)",
    overflow: "hidden",
    background: "var(--surface)",
  },
  searchBar: {
    height: 52,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px",
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    borderBottom: "1px solid var(--line)",
    fontSize: 13,
  },
  kbd: {
    marginLeft: "auto",
    minWidth: 30,
    height: 26,
    display: "inline-grid",
    placeItems: "center",
    borderRadius: 6,
    border: "1px solid var(--line-2)",
    background: "var(--surface)",
    color: "var(--ink-3)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
  fileSection: {
    padding: "18px 18px 6px",
    borderBottom: "1px solid var(--line)",
  },
  fileSectionHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  fileSectionEyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    color: "var(--accent-strong)",
    fontWeight: 800,
  },
  fileSectionTitle: {
    margin: "3px 0 0",
    fontSize: 20,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "var(--ink)",
  },
  fileSectionCount: {
    color: "var(--ink-3)",
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
  },
  fileRow: {
    all: "unset",
    width: "100%",
    boxSizing: "border-box",
    minHeight: 70,
    display: "grid",
    gridTemplateColumns: "42px minmax(0, 1fr) auto 18px",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    cursor: "pointer",
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    border: "1px solid var(--line)",
  },
  fileRowText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    color: "var(--ink-3)",
    fontSize: 12,
  },
  filePath: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--ink-3)",
    opacity: 0.78,
  },
  fileProvenance: {
    color: "var(--ink-2)",
    fontWeight: 700,
  },
  fileWarning: {
    color: "var(--st-review-fg)",
    fontWeight: 700,
  },
  fileStatus: {
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  fileChevron: {
    color: "var(--ink-3)",
    fontSize: 24,
    lineHeight: 1,
  },
  readBody: {
    fontSize: 14.5, lineHeight: 1.65,
    color: "var(--ink-2)", textWrap: "pretty",
  },
};
