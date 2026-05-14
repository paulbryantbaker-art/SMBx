import { useEffect, useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "../modes/cards";
import type { FileScope, OpenTab, TabKind } from "../types";
import { authHeaders } from "../../../hooks/useAuth";
import type { ModelPreference } from "../../../lib/modelPreference";
import { findDeal, type MarketIntel } from "../../../lib/sampleDeals";
import {
  fileDeliverableToDataRoom,
  generateDealDeliverable,
  loadDealDataRoom,
  type DealDataRoom,
  type DataRoomDocument,
} from "../../../hooks/useV6WorkspaceData";
import { runActionAnalysis } from "../../../lib/v6ActionContracts";
import { isSurfaceActionId, type SurfaceActionId } from "../../../lib/v6SurfaceActions";

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
}

export function V6DealView({
  id,
  title,
  openTab,
  fileScope,
  onTalkToYulia,
  modelPreference,
}: {
  id: string;
  title: string;
  openTab: OpenTab;
  fileScope?: FileScope;
  onTalkToYulia?: (prompt: string) => void;
  modelPreference?: ModelPreference;
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
  const sampleDeal = findDeal(id);
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
  const dealName = real?.business_name || title;
  const intelligence = buildDealIntelligence({
    dealName,
    real,
    sampleMarket: sampleDeal?.marketIntel,
    sampleVerdictWhy: sampleDeal?.verdictWhy,
    dealBrief,
    verdict,
  });
  const portfolioName = samplePortfolioForDeal(id, title);
  const fileItems = numericId !== null && (linked || dataRoom)
    ? buildDealFilesFromReal(linked ?? [], dataRoom, dealName)
    : DEAL_FILES;
  const primaryDeliverable = primaryDeliverableForJourney(real?.journey_type);
  const setDealFileScope = (scope: FileScope | null) => {
    setActiveFileScope(scope);
    openTab({ id, kind: "deal", title: dealName, fileScope: scope ?? undefined });
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
      setActionError(e?.message || `Could not generate ${label}`);
    } finally {
      setBusyAction(null);
    }
  };
  const runGenerateDeliverable = async () => {
    await runDealDeliverableAction(primaryDeliverable.slug, primaryDeliverable.label, "generate");
  };
  const runMarketIntelligenceRead = async (promptHint?: string) => {
    await runDealAnalysisAction("market_intelligence", "market intelligence read", "market-read", "universal-market-intelligence", promptHint);
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
        requestedFrom: "deal_recommended_action",
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
    <div className="m-fade-up" style={{ maxWidth: 1180 }}>
      {/* Hero strip */}
      <section id="deal-dashboard" style={{ marginBottom: 28 }}>
        <div className="mono" style={D.eyebrow}>{heroEyebrow}</div>
        <div style={D.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={D.h1}>{real?.business_name || title}</h1>
            <div style={D.sub}>{heroSub}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined" type="button" onClick={() => setDealFileScope("all")}>Open files</button>
            <button className="m-btn outlined" type="button" onClick={() => setDealFileScope("data-room")}>Data room</button>
            <button className="m-btn filled" type="button" onClick={runGenerateDeliverable} disabled={busyAction === "generate"}>
              {busyAction === "generate" ? "Generating..." : `Generate ${primaryDeliverable.label}`}
            </button>
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
      {actionError && (
        <div style={D.actionError}>{actionError}</div>
      )}
      {actionNote && (
        <div style={D.actionNote}>{actionNote}</div>
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

      <section style={D.intelligenceGrid}>
        <div className="m-card" style={D.marketCard}>
          <div className="mono" style={D.intelEyebrow}>{intelligence.marketEyebrow}</div>
          <h2 style={D.intelTitle}>Market intelligence</h2>
          <p style={D.intelLead}>{intelligence.marketHeadline}</p>
          <div style={D.marketTileGrid}>
            {intelligence.marketTiles.map(tile => (
              <div key={tile.label} style={D.desktopMarketTile}>
                <div className="mono" style={D.desktopMarketTileLabel}>{tile.label}</div>
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
                onClick={() => { void runMarketIntelligenceRead(`On ${dealName}: unpack this market intelligence note in the canvas: ${bullet}`); }}
              >
                {bullet}
              </button>
            ))}
          </div>
          {intelligence.researchNeeded.length > 0 && (
            <div style={D.researchBox}>
              <div className="mono" style={D.researchEyebrow}>SOURCE GAPS</div>
              {intelligence.researchNeeded.slice(0, 3).map(gap => <span key={gap}>{gap}</span>)}
            </div>
          )}
        </div>

        <div style={D.intelSideStack}>
          <div className="m-card" style={D.reviewCard}>
            <div className="mono" style={D.intelEyebrow}>YULIA REVIEW</div>
            <div style={D.reviewTop}>
              <div>
                <h2 style={D.reviewTitle}>{intelligence.reviewLabel}</h2>
                <p style={D.reviewText}>{intelligence.reviewText}</p>
              </div>
              <div style={D.reviewScore}>
                <strong>{intelligence.reviewScore}</strong>
                <span>fit</span>
              </div>
            </div>
            <div style={D.structureGrid}>
              <div>
                <span className="mono" style={D.structureLabel}>TAX</span>
                <p>{intelligence.tax}</p>
              </div>
              <div>
                <span className="mono" style={D.structureLabel}>LEGAL</span>
                <p>{intelligence.legal}</p>
              </div>
            </div>
          </div>

          <div className="m-card" style={D.nextCard}>
            <div className="mono" style={D.intelEyebrow}>RECOMMENDED NEXT</div>
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
                    borderBottom: index === intelligence.nextMoves.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                    opacity: busyAction && !isBusy ? 0.58 : 1,
                  }}
                  onClick={() => { void runRecommendedMove(move); }}
                >
                  <span style={D.nextMoveText}>
                    <strong style={D.nextMoveTitle}>{move.title}</strong>
                    <small style={D.nextMoveSub}>{isBusy ? "Opening live analysis..." : move.why}</small>
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
        />
      )}

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
}) {
  const visible = files.filter(file => file.scopes.includes(activeScope));
  const folders = foldersForScope(activeScope, visible);
  const sections = sectionsForScope(activeScope, visible);
  const counts = {
    all: files.filter(file => file.scopes.includes("all")).length,
    "data-room": files.filter(file => file.scopes.includes("data-room")).length,
    shared: files.filter(file => file.scopes.includes("shared")).length,
  };
  const copy = scopeCopy(activeScope);

  const openFile = (file: DealFileItem) => {
    openTab({ kind: file.kind === "analysis" && !file.deliverableId ? "analysis" : "doc", title: `${dealTitle} · ${file.title}`, id: file.deliverableId ? String(file.deliverableId) : file.id });
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
            className="m-btn tonal"
            onClick={() => onTalkToYulia?.(`Find the right ${dealTitle} file for me. I am looking at ${copy.label}.`)}
          >
            Ask Yulia for a file
          </button>
          {onFileLatestToRoom && (
            <button
              type="button"
              className="m-btn outlined"
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

      <div style={D.fileGrid}>
        <aside style={D.folderCard}>
          <div className="mono" style={D.folderEyebrow}>HIERARCHY</div>
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

function DealFileRow({ file, last, onClick }: { file: DealFileItem; last: boolean; onClick: () => void }) {
  const t = fileTone(file.tone);
  return (
    <button
      type="button"
      style={{ ...D.fileRow, borderBottom: last ? "none" : "1px solid var(--m-outline-var)" }}
      onClick={onClick}
    >
      <span style={{ ...D.fileIcon, background: t.soft, color: t.ink }}>
        <V6Icon name={file.kind === "analysis" ? "chart" : "doc"} size={17} />
      </span>
      <span style={D.fileRowText}>
        <strong>{file.title}</strong>
        <span>{file.meta}</span>
        <span style={D.filePath}>Location: {file.location}</span>
      </span>
      <span style={{ ...D.fileStatus, background: t.soft, color: t.ink }}>{file.status}</span>
      <span style={D.fileChevron} aria-hidden="true">›</span>
    </button>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function buildDealIntelligence({
  dealName,
  real,
  sampleMarket,
  sampleVerdictWhy,
  dealBrief,
  verdict,
}: {
  dealName: string;
  real: DealRow | undefined;
  sampleMarket?: MarketIntel;
  sampleVerdictWhy?: string;
  dealBrief: DealBrief | null;
  verdict: { kind: "pursue" | "watch" | "pass"; eyebrow: string; text: string; fit: number };
}) {
  const marketHeadline =
    dealBrief?.marketRead?.headline ||
    sampleMarket?.blurb ||
    `${dealName} needs a deal-specific market read tied to industry, geography, buyer universe, financing climate, and current diligence gaps.`;

  const marketTiles = sampleMarket
    ? [
        { label: "AVG MULTIPLE", value: sampleMarket.avgMultiple },
        { label: "AVG DEAL SIZE", value: sampleMarket.avgDealSize },
        { label: "ACTIVE BUYERS", value: sampleMarket.activeBuyers },
        { label: "MARKET TREND", value: sampleMarket.yoyActivity },
      ]
    : [
        { label: "INDUSTRY", value: real?.industry || "Research needed" },
        { label: "GEOGRAPHY", value: real?.location || "Research needed" },
        { label: "REVENUE", value: fmtCents(real?.revenue ?? null) },
        { label: "EARNINGS", value: fmtCents(real?.ebitda ?? real?.sde ?? null) },
      ];

  const marketBullets = dealBrief?.marketRead?.bullets?.length
    ? dealBrief.marketRead.bullets.slice(0, 3)
    : sampleMarket
      ? [
          sampleMarket.blurb,
          `Buyer activity: ${sampleMarket.activeBuyers}.`,
          `Transaction activity: ${sampleMarket.yoyActivity}; typical pricing ${sampleMarket.avgMultiple}.`,
        ]
      : [
          "Generate the market intelligence read before relying on generic industry context.",
          "Yulia should compare buyer universe, capital availability, diligence gaps, and competitive pressure.",
          "Tax and legal implications should be framed as issue spotting before CPA/counsel sign-off.",
        ];

  const nextMoves = dealBrief?.nextMoves?.length
    ? dealBrief.nextMoves.slice(0, 3).map(move => ({
        title: move.title || "Open next move",
        why: move.why || "Yulia has this queued as the next action.",
        prompt: move.prompt,
        actionId: isSurfaceActionId(move.actionId) ? move.actionId : undefined,
      }))
    : [
        {
          title: "Run the deeper market read",
          why: "Comps, buyer appetite, financing climate, and source gaps belong in the deal file.",
          prompt: `On ${dealName}: run the deeper market intelligence read.`,
          actionId: "run_market_intelligence" as const,
        },
        {
          title: "Map tax and legal implications",
          why: "Structure choices need issue spotting before documents move.",
          prompt: `On ${dealName}: map tax, legal, and structure implications. Flag CPA and counsel sign-off points.`,
          actionId: "run_tax_legal_structure" as const,
        },
        {
          title: "Open files needing action",
          why: "Documents are the execution layer behind the read.",
          prompt: `On ${dealName}: show me the files and deliverables that need action.`,
          actionId: "open_files_needing_action" as const,
        },
      ];

  return {
    marketEyebrow: sampleMarket?.naics
      ? `${sampleMarket.industry.toUpperCase()} · NAICS ${sampleMarket.naics}`
      : (real?.industry || "DEAL MARKET").toUpperCase(),
    marketHeadline,
    marketTiles,
    marketBullets,
    researchNeeded: dealBrief?.marketRead?.researchNeeded ?? (!dealBrief?.marketRead && !sampleMarket ? ["Generate a current market intelligence read for this deal."] : []),
    reviewLabel: dealBrief?.verdict?.label || verdict.eyebrow.replace("VERDICT · ", ""),
    reviewScore: dealBrief?.verdict?.score ?? verdict.fit,
    reviewText: dealBrief?.verdict?.text || sampleVerdictWhy || verdict.text,
    tax: dealBrief?.taxLegal?.tax || "Spot purchase-price allocation, rollover/earnout/seller-note timing, entity form, state tax, and working-cap effects before signing.",
    legal: dealBrief?.taxLegal?.legal || "Spot diligence scope, data-room permissions, third-party approvals, draft/review/execute status, and counsel sign-off before external sharing.",
    nextMoves,
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
  return merged.length > 0 ? merged : DEAL_FILES;
}

function deliverableToFileItem(d: DeliverableRow, dealTitle: string): DealFileItem {
  const name = d.name || formatType(d.slug || "deliverable");
  const analysis = isAnalysisLike(`${d.slug || ""} ${name}`);
  const draft = /loi|ioi|cim|memo|draft|letter|nda|term/i.test(`${d.slug || ""} ${name}`);
  const section: FileSectionKey = draft && d.status !== "complete" ? "drafts" : analysis ? "analysis" : "private";
  const folder = section === "analysis" ? "Analysis" : section === "drafts" ? "Drafts" : "Workspace";
  return {
    id: String(d.id),
    title: name,
    meta: `${formatStatus(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
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
    { label: "Private workspace", sub: "Yulia drafts, memos, analysis", count: files.filter(f => ["private", "analysis", "drafts"].includes(f.section)).length, scope: "all", tone: "private" },
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
    fileSection("PRIVATE", "Private workspace", files, ["private", "analysis", "drafts"]),
    fileSection("DATA ROOM", "Shared diligence drive", files, ["artifacts", "room-docs", "received", "deferred"]),
    fileSection("SHARED", "Sent, received, deferred, executed", files, ["sent", "executed"]),
  ].filter(section => section.rows.length > 0);
}

function fileSection(eyebrow: string, title: string, files: DealFileItem[], keys: FileSectionKey[]) {
  return { eyebrow, title, rows: files.filter(file => keys.includes(file.section)) };
}

function fileTone(tone: FileTone): { ink: string; soft: string } {
  const tones: Record<FileTone, { ink: string; soft: string }> = {
    private: { ink: "#4F60BD", soft: "#EEF1FB" },
    room: { ink: "#3F7D64", soft: "rgba(98,153,135,0.16)" },
    sent: { ink: "#655FA7", soft: "rgba(130,125,189,0.14)" },
    received: { ink: "#9C7128", soft: "#FAF1E1" },
    deferred: { ink: "#A85248", soft: "rgba(235,206,206,0.58)" },
    executed: { ink: "#1A2233", soft: "rgba(26,34,51,0.08)" },
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
  actionError: {
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 18,
    background: "var(--m-pass-container)",
    color: "#4A1410",
    fontSize: 12.5,
  },
  actionNote: {
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 18,
    background: "rgba(98,153,135,0.14)",
    color: "#2F604C",
    fontSize: 12.5,
  },
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
  intelligenceGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(360px, 0.85fr)",
    gap: 16,
    marginBottom: 32,
    alignItems: "stretch",
  },
  marketCard: {
    padding: "24px 26px",
    background: "linear-gradient(135deg, rgba(246,249,253,0.98), rgba(255,255,255,0.86))",
    border: "1px solid var(--m-outline-var)",
  },
  intelEyebrow: {
    fontSize: 10,
    letterSpacing: "0.14em",
    fontWeight: 750,
    color: "#5F72C8",
  },
  intelTitle: {
    margin: "6px 0 0",
    color: "var(--m-on-surface)",
    fontFamily: "var(--font-display)",
    fontWeight: 750,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.035em",
  },
  intelLead: {
    margin: "12px 0 0",
    color: "var(--m-on-surface-var)",
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
  desktopMarketTile: {
    borderRadius: 16,
    padding: "12px 13px",
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
  },
  desktopMarketTileLabel: {
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "var(--m-on-surface-mid)",
    fontWeight: 750,
  },
  desktopMarketTileValue: {
    marginTop: 7,
    color: "var(--m-on-surface)",
    fontSize: 15,
    fontWeight: 850,
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
    borderRadius: 15,
    padding: "11px 13px",
    background: "rgba(234,243,251,0.74)",
    border: "1px solid #DDE8F4",
    color: "#344053",
    fontSize: 13,
    lineHeight: 1.35,
    cursor: "pointer",
  },
  researchBox: {
    marginTop: 14,
    display: "grid",
    gap: 5,
    borderRadius: 16,
    padding: "12px 13px",
    background: "rgba(214,163,92,0.12)",
    color: "#7A5A22",
    fontSize: 12.5,
    lineHeight: 1.35,
  },
  researchEyebrow: {
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "#9C7128",
  },
  intelSideStack: {
    display: "grid",
    gap: 16,
  },
  reviewCard: {
    padding: "22px 24px",
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
    color: "var(--m-on-surface)",
  },
  reviewText: {
    margin: "8px 0 0",
    color: "var(--m-on-surface-var)",
    fontSize: 13,
    lineHeight: 1.42,
  },
  reviewScore: {
    width: 72,
    height: 72,
    borderRadius: 18,
    background: "var(--m-pursue-container)",
    color: "var(--m-pursue-on-cont)",
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
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    lineHeight: 1.36,
  },
  structureLabel: {
    display: "block",
    marginBottom: 5,
    color: "#5F72C8",
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
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
    color: "var(--m-on-surface)",
    cursor: "pointer",
  },
  nextMoveText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  nextMoveTitle: {
    color: "var(--m-on-surface)",
    fontSize: 14,
    fontWeight: 850,
    letterSpacing: "-0.02em",
  },
  nextMoveSub: {
    color: "var(--m-on-surface-var)",
    fontSize: 12.2,
    lineHeight: 1.35,
  },
  nextArrow: {
    color: "var(--m-on-surface-mid)",
    fontSize: 26,
    lineHeight: 1,
  },
  linkedTitle: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
    letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 12,
  },
  fileSystem: {
    marginBottom: 32,
    padding: 22,
    borderRadius: 24,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
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
    color: "var(--m-on-surface)",
  },
  fileSub: {
    margin: "8px 0 0",
    maxWidth: 780,
    color: "var(--m-on-surface-mid)",
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
    background: "var(--m-surface-1)",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface)",
    fontWeight: 850,
    cursor: "pointer",
  },
  scopeChipActive: {
    background: "var(--m-on-surface)",
    color: "#FFFFFF",
    borderColor: "var(--m-on-surface)",
  },
  scopeCount: {
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    display: "inline-grid",
    placeItems: "center",
    borderRadius: 999,
    background: "var(--m-surface-2)",
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    fontWeight: 800,
  },
  scopeCountActive: {
    background: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
  },
  fileGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 0.34fr) minmax(0, 1fr)",
    gap: 16,
    alignItems: "start",
  },
  folderCard: {
    borderRadius: 20,
    padding: 16,
    background: "linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%)",
    border: "1px solid var(--m-outline-var)",
  },
  folderEyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    color: "var(--m-on-primary-container)",
    fontWeight: 800,
  },
  folderRoot: {
    display: "block",
    marginTop: 6,
    color: "var(--m-on-surface)",
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
    borderRadius: 14,
    cursor: "pointer",
    color: "var(--m-on-surface-mid)",
  },
  folderIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
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
    color: "var(--m-on-surface-mid)",
    fontWeight: 800,
  },
  fileListCard: {
    borderRadius: 20,
    border: "1px solid var(--m-outline-var)",
    overflow: "hidden",
    background: "#FFFFFF",
  },
  searchBar: {
    height: 52,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px",
    background: "var(--m-surface-1)",
    color: "var(--m-on-surface-mid)",
    borderBottom: "1px solid var(--m-outline-var)",
    fontSize: 13,
  },
  kbd: {
    marginLeft: "auto",
    minWidth: 30,
    height: 26,
    display: "inline-grid",
    placeItems: "center",
    borderRadius: 8,
    border: "1px solid var(--m-outline-var)",
    background: "#FFFFFF",
    color: "var(--m-on-surface-mid)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
  fileSection: {
    padding: "18px 18px 6px",
    borderBottom: "1px solid var(--m-outline-var)",
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
    color: "var(--m-on-primary-container)",
    fontWeight: 800,
  },
  fileSectionTitle: {
    margin: "3px 0 0",
    fontSize: 20,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "var(--m-on-surface)",
  },
  fileSectionCount: {
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    fontWeight: 800,
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
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  fileRowText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
  },
  filePath: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--m-on-surface-mid)",
    opacity: 0.78,
  },
  fileStatus: {
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 850,
    whiteSpace: "nowrap",
  },
  fileChevron: {
    color: "var(--m-on-surface-mid)",
    fontSize: 24,
    lineHeight: 1,
  },
  readBody: {
    fontSize: 14.5, lineHeight: 1.65,
    color: "var(--m-on-surface-var)", textWrap: "pretty",
  },
};
