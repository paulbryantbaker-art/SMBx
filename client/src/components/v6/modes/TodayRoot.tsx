import { useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useTodayOperatingBrief, type TodayDealPulseItem, type TodayDefinitiveDealState, type TodayFirmMemorySnapshot, type TodayGateCountdownItem, type TodayModelRefreshItem, type TodayOperatingBrief, type TodayStudioRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { openSavedModelExecutionAsRerun } from "../../../lib/modelRerunActions";
import { executeSurfaceAction, type ActionDeal } from "../../../lib/v6ActionContracts";
import { isSurfaceActionId, type SurfaceActionId } from "../../../lib/v6SurfaceActions";
import type { OpenTab, StudioFormatId } from "../types";
import { V6Icon } from "../icons";
import { DefinitiveSurfacePanel } from "../shared/DefinitiveSurfacePanel";

type Tone = "gold" | "cactus" | "oat" | "plum" | "charcoal";

interface TodayDeal {
  id: string;
  title: string;
  meta: string;
  thesis: string;
  status: string;
  fit: number;
  sde: string;
  multiple: string;
  tone: Tone;
  definitive?: TodayDefinitiveDealState;
}

const DEALS: TodayDeal[] = [
  {
    id: "deal-bigfake",
    title: "Big Fake Deal",
    meta: "$5.4M · East Texas · industrial services",
    thesis: "IOI is ready, but the working-cap target still wants one tighter sentence.",
    status: "Pursue",
    fit: 92,
    sde: "$1.80M",
    multiple: "7.0x",
    tone: "cactus",
  },
  {
    id: "deal-pest",
    title: "Pest Control · FL",
    meta: "$2.1M · recurring route density",
    thesis: "Monthly contracts look real. Ask for churn by route before you move it up.",
    status: "Pursue",
    fit: 88,
    sde: "$1.40M",
    multiple: "6.5x",
    tone: "gold",
  },
  {
    id: "deal-hvac",
    title: "HVAC platform · CO",
    meta: "$4.8M · service mix under review",
    thesis: "Clean enough to keep watching. Succession risk is still the story.",
    status: "Watch",
    fit: 71,
    sde: "$0.95M",
    multiple: "6.8x",
    tone: "oat",
  },
];

interface LiveDeskItem {
  eyebrow: string;
  title: string;
  sub: string;
  pct: number;
  tone: Tone;
  prompt?: string;
}

const WORK: LiveDeskItem[] = [
  { eyebrow: "MARKET", title: "Industrial services read", sub: "Buyer appetite, SBA climate, and local density are shaping the pursue call.", pct: 76, tone: "cactus" as Tone },
  { eyebrow: "STRUCTURE", title: "Tax and legal watch", sub: "Working-cap target, add-backs, seller-note timing, and counsel sign-off need daylight.", pct: 64, tone: "gold" as Tone },
  { eyebrow: "PORTFOLIO", title: "One deal driving the day", sub: "Big Fake Deal is the current focus until review and buyer touch are cleared.", pct: 58, tone: "plum" as Tone },
];

interface TodayFile {
  kind: "doc" | "chart";
  title: string;
  sub: string;
  status: string;
  tone: Tone;
  id?: string;
}

const FILES: TodayFile[] = [
  { kind: "doc", title: "IOI draft · v3", sub: "Yulia · updated 2 min ago", status: "Review", tone: "gold" as Tone },
  { kind: "doc", title: "Buyer fit memo", sub: "You · 1 hr ago · 4 pages", status: "Open", tone: "plum" as Tone },
  { kind: "doc", title: "Mutual NDA · seller counsel", sub: "Data room · 2 markups", status: "In review", tone: "cactus" as Tone },
  { kind: "chart", title: "2024 P&L · audited", sub: "Data room · locked artifact", status: "View", tone: "oat" as Tone },
];

const QUICK_STARTS = [
  "What is worth my next 10 minutes?",
  "Review the IOI draft with me.",
  "Find buyers for Big Fake Deal.",
  "Show files that need my eye.",
];

const TODAY_TEXTURE_CARDS: StudioFormatId[] = [
  "buyer-pitch-book",
  "seller-pitch-book",
  "ic-deck",
  "qoe-preview-book",
  "cim-summary-deck",
  "board-update",
  "lender-book",
];

const TODAY_TEXTURE_CARD_FLIPS = [false, false, true, false, false, true, false];

interface PortfolioBriefNote {
  label: string;
  text: string;
}

interface PortfolioBriefHero {
  title: string;
  lede: string;
  primaryLabel: string;
  primaryPrompt?: string;
  secondaryLabel: string;
  secondaryDealId?: string;
  notes: PortfolioBriefNote[];
}

interface PortfolioMarketIntelligence {
  eyebrow: string;
  headline: string;
  subhead: string;
  bullets: string[];
  sourceCount: number;
  confidence: string;
}

interface PortfolioPriority {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  tone: Tone;
  actionId?: SurfaceActionId;
  dealId?: string;
  dealTitle?: string;
  docId?: string;
  docTitle?: string;
  prompt?: string;
  tabKind?: string;
}

interface PortfolioBrief {
  source: "live";
  generatedAt: string;
  modelUsed?: string;
  intelligenceMode?: string;
  marketIntelligence?: PortfolioMarketIntelligence;
  hero: PortfolioBriefHero;
  liveDesk: LiveDeskItem[];
  priorities: PortfolioPriority[];
  files: TodayFile[];
  deals: TodayDeal[];
}

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

// Map tone key to muted statpill class for file/deal status chips
function toneToStatpill(t: Tone): string {
  if (t === "gold") return "review";
  if (t === "cactus") return "diligence";
  if (t === "plum") return "diligence";
  if (t === "charcoal") return "missing";
  return "missing";
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const home = useHomeDeals(user);
  const workspace = useV6WorkspaceData(user);
  const [portfolioBrief, setPortfolioBrief] = useState<PortfolioBrief | null>(null);
  const [rerunOpenedIds, setRerunOpenedIds] = useState<Set<string>>(() => new Set());
  const todayOperating = useTodayOperatingBrief(user, workspace.canFetch);

  useEffect(() => {
    if (!workspace.canFetch) {
      setPortfolioBrief(null);
      return;
    }

    let cancelled = false;
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((brief: PortfolioBrief) => {
        if (!cancelled) setPortfolioBrief(brief);
      })
      .catch(() => {
        if (!cancelled) setPortfolioBrief(null);
      });

    return () => { cancelled = true; };
  }, [workspace.canFetch, user?.id]);

  const useSampleData = !home.isAuthed || !workspace.canFetch;
  const showLoggedOutMarketing = !user && useSampleData;
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const liveBrief = useSampleData ? null : portfolioBrief;
  const operatingBrief = useSampleData ? null : todayOperating.brief;
  const modelRefreshNeeds = operatingBrief?.modelRefreshNeeds.filter(item => !rerunOpenedIds.has(item.id)) ?? [];
  const waitingForYuliaRead = !useSampleData && !liveBrief;
  const operatingDeals = operatingBrief?.dealPulse ?? [];
  const operatingDealMap = useMemo(
    () => new Map(operatingDeals.map(item => [item.dealId, item])),
    [operatingDeals],
  );
  const deals = useSampleData
    ? DEALS
    : liveBrief?.deals.length
      ? liveBrief.deals.map(deal => ({ ...deal, definitive: operatingDealMap.get(deal.id)?.definitive }))
      : operatingDeals.length
        ? operatingDeals.slice(0, 5).map(operatingDealToTodayDeal)
        : realDeals.slice(0, 5).map(dealToTodayDeal);
  const liveDesk = liveBrief?.liveDesk?.length ? liveBrief.liveDesk : useSampleData ? WORK : [];
  const files = useMemo<TodayFile[]>(
    () => {
      if (liveBrief?.files?.length) return liveBrief.files;
      return workspace.canFetch
        ? workspace.deliverables.slice(0, 5).map(deliverableToTodayFile)
        : FILES;
    },
    [liveBrief?.files, workspace.canFetch, workspace.deliverables],
  );
  const lead = deals[0] ?? null;
  const leadTitle = lead?.title ?? "your first deal";
  // First run = real-data path, brief resolved, genuinely zero deals. Render a
  // warm journey picker instead of the sparse generic empty hero. Excludes
  // sample/logged-out (useSampleData) and the loading window (waitingForYuliaRead).
  const firstRun = !useSampleData && !waitingForYuliaRead && deals.length === 0;
  const firstName = ((user as any)?.name || (user as any)?.displayName || "").toString().trim().split(/\s+/)[0] || "";
  const marketIntel = liveBrief?.marketIntelligence ?? {
    eyebrow: waitingForYuliaRead ? "YULIA READ REFRESHING" : "MARKET INTELLIGENCE LIVE",
    headline: waitingForYuliaRead
      ? "Yulia is rebuilding this portfolio read from your live workspace."
      : lead
        ? `${lead.title} is being read against market, structure, files, and next action.`
        : "Yulia turns every deal into a live intelligence desk.",
    subhead: waitingForYuliaRead
      ? "Recommendations will appear after the briefing layer returns a sourced portfolio read."
      : lead
        ? "Industry, buyer universe, financing climate, tax/legal issues, and work product belong in one place."
        : "Start with a deal or thesis and Yulia builds the market context around it.",
    bullets: [],
    sourceCount: 0,
    confidence: liveBrief ? "Live" : "Demo",
  };
  const heroNotes = liveBrief?.hero.notes?.length
    ? liveBrief.hero.notes
    : showLoggedOutMarketing
      ? [
          {
            label: "Source",
            text: "Find targets, buyers, capital, specialists, and market context without leaving the deal desk.",
          },
          {
            label: "Diligence",
            text: "Turn source materials into issue trees, model inputs, evidence trails, and action queues.",
          },
          {
            label: "Execute",
            text: "Carry decisions into documents, data rooms, shared reviews, and post-close value work.",
          },
        ]
    : waitingForYuliaRead
      ? [
          {
            label: "Read",
            text: "Yulia is refreshing the portfolio read from live deals, files, reviews, and market sources.",
          },
          {
            label: "Source",
            text: "No card-level next move is shown until the briefing layer returns the sourced result.",
          },
          {
            label: "Next",
            text: "Ask Yulia for the current read, or open a deal while the portfolio summary refreshes.",
          },
        ]
      : [
        {
          label: lead ? "Why now" : "First step",
          text: lead ? "The buyer call is close enough that weak language will travel." : "Tell Yulia the situation in plain English. She handles the software setup.",
        },
        {
          label: lead ? "Risk" : "Sources",
          text: lead ? "Working-cap target and add-backs need one clean reconciliation." : "Drop in a CIM, teaser, financials, LOI, NDA, or even rough notes.",
        },
        {
          label: lead ? "Move" : "Output",
          text: lead ? "Approve the IOI draft, then let Yulia prepare the buyer note." : "Yulia can create the deal, organize files, and prepare the first analysis.",
        },
      ];

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDeal = (deal: TodayDeal | null = lead) => {
    if (!deal) {
      ask("Help me start my first SMBx deal workspace.");
      return;
    }
    openTab({ kind: "deal", id: deal.id, title: deal.title });
  };

  const openDoc = (title: string, id?: string) => {
    openTab({ kind: "doc", title, id: id ?? `doc-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` });
  };

  const openStudioBook = (item: TodayStudioRefreshItem) => {
    const bookId = Number(item.bookId);
    openTab({
      kind: "marketing-studio",
      modeId: "studio",
      id: Number.isFinite(bookId) ? `studio-book-${bookId}` : `studio-book-${item.bookId}`,
      title: item.title,
      studioView: "canvas",
      studioBookId: Number.isFinite(bookId) ? bookId : null,
    });
  };

  const rerunModelRefresh = (item: TodayModelRefreshItem) => {
    void openSavedModelExecutionAsRerun({
      executionId: item.id,
      dealTitle: item.dealTitle,
      currentAssumptions: item.currentAssumptions,
      sourceSurface: "today_model_refresh",
      onTalkToYulia: ask,
    }).then(execution => {
      if (execution) setRerunOpenedIds(prev => new Set(prev).add(item.id));
    });
  };

  const todayDealToActionDeal = (deal: TodayDeal | null | undefined): ActionDeal | null => {
    if (!deal) return null;
    return {
      id: deal.id,
      business_name: deal.title,
      name: deal.title,
    };
  };

  const actionDealForPriority = (item: PortfolioPriority): ActionDeal | null => {
    if (item.dealId) {
      const matched = deals.find(deal => deal.id === item.dealId);
      if (matched) return todayDealToActionDeal(matched);
      return {
        id: item.dealId,
        business_name: item.dealTitle || item.title,
        name: item.dealTitle || item.title,
      };
    }
    return todayDealToActionDeal(lead);
  };

  const actionDeals = deals.map(todayDealToActionDeal).filter(Boolean) as ActionDeal[];

  const executePriority = (item: PortfolioPriority) => {
    const actionId = isSurfaceActionId(item.actionId) ? item.actionId : null;
    const prompt = item.prompt || `${item.title}: ${item.sub}`;
    if (!actionId) {
      ask(prompt);
      return;
    }

    void executeSurfaceAction({
      actionId,
      deal: actionDealForPriority(item),
      deals: actionDeals,
      document: { id: item.docId, title: item.docTitle || item.title },
      title: item.title,
      prompt,
      openTab,
      requestedFrom: "today_priority",
      onTalkToYulia: ask,
    }).catch(() => ask(prompt));
  };

  const livePriorities = liveBrief?.priorities?.length
    ? liveBrief.priorities.map(item => ({
        ...item,
        action: () => executePriority(item),
      }))
    : null;

  const priorities = livePriorities ?? (waitingForYuliaRead
    ? [
        {
          kicker: "YULIA READ",
          title: "Refresh the live priority queue",
          sub: "Yulia is the source of portfolio priorities. Ask for the read while the briefing layer refreshes.",
          cta: "Ask Yulia",
          tone: "plum" as Tone,
          action: () => ask("Refresh my live portfolio read and tell me what needs action, with the source behind each next move."),
        },
      ]
    : lead
    ? [
        {
          kicker: "READY NOW",
          title: "Review the IOI draft",
          sub: `${lead.title} · Yulia tightened price, timing, and seller-friendly certainty.`,
          cta: "Open draft",
          tone: "gold" as Tone,
          action: () => openDoc(`${lead.title} · IOI v3`),
        },
        {
          kicker: "WAITING ON YOU",
          title: "Answer counsel on the NDA",
          sub: "Seller counsel marked two clauses. One is business, one is legal cleanup.",
          cta: "Review",
          tone: "plum" as Tone,
          action: () => openDoc("Mutual NDA · seller counsel"),
        },
        {
          kicker: "PIPELINE",
          title: `${deals[1]?.title ?? lead.title} moved up`,
          sub: "Recurring route density is stronger than the first read. The churn ask is the next gate.",
          cta: "Open deal",
          tone: "cactus" as Tone,
          action: () => openDeal(deals[1] ?? lead),
        },
      ]
    : [
        {
          kicker: "START",
          title: "Create your first deal workspace",
          sub: "Tell Yulia what you are buying, selling, raising, or evaluating. She will build the working surface around it.",
          cta: "Start",
          tone: "cactus" as Tone,
          action: () => ask("Help me start my first SMBx deal workspace."),
        },
        {
          kicker: "IMPORT",
          title: "Bring in source material",
          sub: "Upload or describe a CIM, teaser, financials, or target profile so Yulia can organize the first analysis.",
          cta: "Ask Yulia",
          tone: "plum" as Tone,
          action: () => ask("Help me import source materials for a new deal."),
        },
        {
          kicker: "SEARCH",
              title: "Find buyers, targets, or specialists",
          sub: "Start with a thesis and let Yulia assemble the search surface.",
          cta: "Search",
          tone: "gold" as Tone,
          action: () => openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true }),
        },
      ]);

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* ── Page header ── */}
      <div className="pg-head">
        <div>
          <div className="pg-title">Today</div>
          <p className="pg-sub">
            {liveBrief?.hero.lede
              || (showLoggedOutMarketing
                ? "smbX connects sourcing, diligence, execution, and value creation in one workflow."
                : waitingForYuliaRead
                  ? "Yulia is refreshing your portfolio read."
                  : lead
                    ? `${lead.title} needs your eye before the next buyer touch.`
                    : "No live workspace yet. Start with a deal, thesis, or source file.")}
          </p>
        </div>
        <div className="pg-actions">
          {/* One meaningful, contextual action. The generic "Ask Yulia" + duplicate
              kebab were removed — the floating FAB is the single Ask-Yulia entry. */}
          <button
            className="wkbtn primary"
            type="button"
            onClick={() => liveBrief?.hero.primaryPrompt
              ? ask(liveBrief.hero.primaryPrompt)
              : showLoggedOutMarketing
                ? ask("Help me connect sourcing, diligence, execution, and value creation in one workflow.")
              : lead
                ? openDoc(`${lead.title} · IOI v3`)
                : ask("Help me start my first SMBx deal workspace.")}
          >
            {liveBrief?.hero.primaryLabel || (showLoggedOutMarketing ? "Chat with Yulia" : lead ? "Review IOI" : "Start with Yulia")}
          </button>
        </div>
      </div>

      {/* ── First-run welcome (authed, zero deals): journey quick-starts ── */}
      {firstRun && (
        <div className="wkcard" style={{ marginTop: 16, marginBottom: 18, padding: "26px 28px 24px" }}>
          <div style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.05rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--ink)", marginBottom: 8 }}>
            {firstName ? `You're set up, ${firstName}. Let's start your first deal.` : "You're set up. Let's start your first deal."}
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 22px", maxWidth: 640 }}>
            Yulia runs the deal work end-to-end — sourcing, recasts, valuation, diligence, packaging, and closing support. Tell her what you're working on and she builds the workspace around it.
          </p>
          <div className="wkgrid g2" style={{ gap: 12 }}>
            {[
              { kicker: "SELL", title: "Sell a business", sub: "Recast the financials, set a defensible range, and build the package.", prompt: "I'm exploring selling my business. Walk me through how we start — what you need from me and what you'll build first." },
              { kicker: "BUY", title: "Acquire a business", sub: "Set a thesis, value a target, and run diligence with Yulia.", prompt: "I'm looking to acquire a business. Help me set up my buy-side workspace and first analysis." },
              { kicker: "RAISE", title: "Raise capital", sub: "Build the financial package and investor materials.", prompt: "I want to raise capital for my business. Help me start the raise workspace and investor materials." },
              { kicker: "EVALUATE", title: "Analyze a deal", sub: "Drop in the numbers — Yulia values it and flags the risks.", prompt: "I have a business to analyze. Help me value it and spot the key risks — I'll share the numbers." },
            ].map(j => (
              <button
                key={j.kicker}
                type="button"
                style={{ all: "unset", cursor: "pointer", display: "block", padding: "14px 16px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12, boxSizing: "border-box" }}
                onClick={() => ask(j.prompt)}
              >
                <div style={{ color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>{j.title}</div>
                <div style={{ color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.4 }}>{j.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="wkbtn primary" type="button" onClick={() => ask("Help me start my first SMBx deal workspace. Ask me what I'm working on.")}>Start with Yulia</button>
            <button className="wkbtn" type="button" onClick={() => openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true })}>Explore the market</button>
          </div>
        </div>
      )}

      {/* ── KPI metric tiles + hero grid (hidden on first run) ── */}
      {!firstRun && (<>
      <div className="mhead">
        <div className="mh">
          <span className="l">Deals active</span>
          <span className="v">{deals.length}</span>
          <span className="s">{deals.filter(d => d.status === "Pursue").length} pursue</span>
        </div>
        <div className="mh">
          <span className="l">Priority queue</span>
          <span className="v" style={{ color: "var(--accent-strong)" }}>{priorities.length}</span>
          <span className="s">items surfaced</span>
        </div>
        <div className="mh">
          <span className="l">Files</span>
          <span className="v">{files.length}</span>
          <span className="s">need your eye</span>
        </div>
        <div className="mh">
          <span className="l">Intel</span>
          <span className="v">{marketIntel.confidence}</span>
          <span className="s">{marketIntel.sourceCount > 0 ? `${marketIntel.sourceCount} sources` : "market desk"}</span>
        </div>
      </div>

      {/* ── Hero + Market desk two-col grid ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 4 }}>
        {/* Hero card */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: "clamp(1.45rem, 2.4vw, 2rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--ink)" }}>
              {liveBrief?.hero.title || (showLoggedOutMarketing ? (
                <>Connect sourcing, diligence, execution, and value creation.</>
              ) : waitingForYuliaRead ? (
                <>Yulia is refreshing your portfolio read.</>
              ) : lead ? (
                <>{leadTitle} needs your eye before the next buyer touch.</>
              ) : (
                <>Yulia is ready when your first deal lands.</>
              ))}
            </div>
          </div>

          {/* Brief notes */}
          <div className="wkgrid g3" style={{ gap: 10 }}>
            {heroNotes.slice(0, 3).map(note => (
              <div key={note.label} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10 }}>
                <div style={{ fontSize: "0.84rem", lineHeight: 1.45, color: "var(--ink-2)" }}>{note.text}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 9, marginTop: "auto" }}>
            <button
              className="wkbtn primary"
              type="button"
              style={{ flex: 1 }}
              onClick={() => liveBrief?.hero.primaryPrompt
                ? ask(liveBrief.hero.primaryPrompt)
                : showLoggedOutMarketing
                  ? ask("Help me connect sourcing, diligence, execution, and value creation in one workflow.")
                : lead
                  ? openDoc(`${lead.title} · IOI v3`)
                  : ask("Help me start my first SMBx deal workspace.")}
            >
              {liveBrief?.hero.primaryLabel || (showLoggedOutMarketing ? "Chat with Yulia" : lead ? "Review IOI" : "Start with Yulia")}
            </button>
            <button
              className="wkbtn"
              type="button"
              onClick={() => {
                const secondaryId = liveBrief?.hero.secondaryDealId;
                if (secondaryId) {
                  const matched = deals.find(d => d.id === secondaryId);
                  openTab({ kind: "deal", id: secondaryId, title: matched?.title || liveBrief?.hero.secondaryLabel || "Deal" });
                  return;
                }
                if (lead) {
                  openDeal(lead);
                  return;
                }
                openTab({ kind: "mode-root", modeId: "pipeline", id: "pipeline-root", title: "Pipeline", pinned: true });
              }}
            >
              {liveBrief?.hero.secondaryLabel || (showLoggedOutMarketing ? "Try sample deal" : lead ? "Open deal" : "Open pipeline")}
            </button>
          </div>
        </div>

        {/* Market desk card */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Portfolio intelligence</div>
          </div>

          {/* Intel lead */}
          <button
            type="button"
            style={{ all: "unset", display: "block", cursor: "pointer", padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, width: "100%", boxSizing: "border-box" }}
            onClick={() => ask("Show me the portfolio market intelligence read. Separate market, buyer/capital, tax, legal, and source gaps.")}
          >
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.94rem", lineHeight: 1.3, fontWeight: 700 }}>{marketIntel.headline}</strong>
            <span style={{ display: "block", marginTop: 5, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.42 }}>{marketIntel.subhead}</span>
          </button>

          {/* Intel bullets */}
          {marketIntel.bullets?.length > 0 && marketIntel.bullets.slice(0, 3).map((bullet) => (
            <button
              key={bullet}
              type="button"
              style={{ all: "unset", cursor: "pointer", display: "block", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 9, color: "var(--ink-2)", fontSize: "0.83rem", lineHeight: 1.38, width: "100%", boxSizing: "border-box" }}
              onClick={() => ask(`Unpack this market intelligence note: ${bullet}`)}
            >
              {bullet}
            </button>
          ))}

          {/* Live desk items */}
          {liveDesk.map(item => (
            <button
              key={item.title}
              type="button"
              style={{ all: "unset", cursor: "pointer", display: "block", padding: "11px 14px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, width: "100%", boxSizing: "border-box" }}
              onClick={() => ask(item.prompt || `${item.eyebrow.toLowerCase()}: ${item.title}. What changed and what should I do next?`)}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.10em", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{item.eyebrow}</div>
              <div style={{ color: "var(--ink)", fontSize: "0.9rem", fontWeight: 600 }}>{item.title}</div>
              <div style={{ color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.45, marginTop: 3 }}>{item.sub}</div>
              {/* Flat progress bar replacing gradient meter */}
              <div style={{ marginTop: 10, height: 4, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${item.pct}%`, background: "var(--accent-strong)" }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      </>)}

      {/* ── Priority queue ── */}
      <div className="wksec">
        <div className="pg-head" style={{ alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="wksec-title" style={{ marginBottom: 0 }}>What needs action</div>
          </div>
          <div className="pg-actions">
            <button className="kebab" type="button" aria-label="More" onClick={() => ask("Show my full priority queue with sources.")}>⋯</button>
          </div>
        </div>
        <div className="wkgrid g3" style={{ gap: 14 }}>
          {priorities.map((item, index) => (
            <button key={item.title} className="wkcard tap" style={{ all: "unset", cursor: "pointer", display: "block", padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxSizing: "border-box", width: "100%", transition: "border-color .18s, box-shadow .18s, transform .18s" }} onClick={item.action} type="button">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-3)" }}>0{index + 1}</span>
              </div>
              <strong style={{ display: "block", color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8 }}>{item.title}</strong>
              <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.45, marginBottom: 14 }}>{item.sub}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: "0.84rem", fontWeight: 600, color: "var(--accent-strong)", background: "var(--accent-soft)", borderRadius: 8, padding: "5px 11px" }}>
                {item.cta} <span aria-hidden="true">›</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── DEFINITIVE surface panel ── */}
      <div className="wksec">
        <DefinitiveSurfacePanel
          surface="today"
          title="DEFINITIVE read for Today."
          compact
          onTalkToYulia={ask}
        />
      </div>

      {/* ── Operating brief cards (only shown when live data available) ── */}
      {operatingBrief && (
        <div className="wksec">
          <div className="wkgrid g4" style={{ gap: 14 }}>
            <OperatingBriefCard brief={operatingBrief.morningBrief} onAsk={ask} />
            <GateCountdownCard
              items={operatingBrief.gateCountdown}
              onOpenDeal={(dealId, title) => openTab({ kind: "deal", id: dealId, title })}
              onAsk={ask}
            />
            <ModelRefreshCard
              items={modelRefreshNeeds}
              onAsk={ask}
              onRerun={rerunModelRefresh}
            />
            <StudioRefreshCard
              items={operatingBrief.studioRefreshNeeds}
              onOpenBook={openStudioBook}
              onAsk={ask}
            />
            <FirmMemoryCard memory={operatingBrief.firmMemory} onAsk={ask} />
          </div>
        </div>
      )}

      {/* ── Deals + Files two-col grid ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 34 }}>
        {/* Pipeline pulse */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div className="wksec-title" style={{ marginBottom: 2 }}>Deals in motion</div>
            <button
              type="button"
              onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })}
              style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
            >
              See all{!useSampleData && workspace.deals.length ? ` ${workspace.deals.length}` : ""} →
            </button>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Not every live deal deserves the same attention.</p>

          {deals.length === 0 ? (
            <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
              <div className="wkcard-title">No deals yet</div>
              <div className="wkcard-sub">When you add a deal, Yulia will rank it here by urgency, fit, and next action.</div>
            </div>
          ) : (
            <table className="wktable">
              <thead><tr>
                <th>Deal</th>
                <th>Status</th>
                <th className="r">SDE</th>
                <th className="r">Fit</th>
              </tr></thead>
              <tbody>
                {deals.map(deal => {
                  const pillCls = deal.status === "Pursue" ? "good" : deal.status === "Watch" ? "review" : "missing";
                  return (
                    <tr key={deal.id} onClick={() => openDeal(deal)}>
                      <td>
                        <div className="cellname">
                          <span className="logo">{dealInitials(deal.title)}</span>
                          <div>
                            <div className="nm">{deal.title}</div>
                            <div className="sub">{deal.meta}</div>
                            {deal.definitive && (
                              <div className="sub" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-strong)", marginTop: 2 }}>
                                {shortReadiness(deal.definitive.readinessLevel)} · {deal.definitive.score}% · {deal.definitive.lifecyclePosition || "DealState"} · {deal.definitive.packetTypes.length} packets
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className={`statpill ${pillCls}`}><span className="d" />{deal.status}</span></td>
                      <td className="r amt">{deal.sde}</td>
                      <td className="r">
                        <span className="fit">
                          <span className="fitn">{deal.fit}</span>
                          <span className="ft"><span className="ff" style={{ width: `${deal.fit}%` }} /></span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Files */}
        <div>
          <div className="wksec-title" style={{ marginBottom: 2 }}>Files needing your eye</div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Docs, data room items, and analyses surfaced from today's work.</p>

          {files.length === 0 ? (
            <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
              <div className="wkcard-title">No files yet</div>
              <div className="wkcard-sub">Generated docs, analyses, uploaded artifacts, and data-room items will appear here.</div>
            </div>
          ) : (
            <table className="wktable">
              <thead><tr>
                <th>File</th>
                <th>Status</th>
                <th className="r">Action</th>
              </tr></thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={`${file.id ?? file.title}-${index}`} onClick={() => openDoc(file.title, file.id)}>
                    <td>
                      <div className="cellname">
                        <span className="logo" style={{ color: "var(--ink-2)" }}>
                          <V6Icon name={file.kind === "chart" ? "chart" : "doc"} size={16} />
                        </span>
                        <div>
                          <div className="nm">{file.title}</div>
                          <div className="sub">{file.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`statpill ${toneToStatpill(file.tone)}`}><span className="d" />{file.status}</span></td>
                    <td className="r"><button type="button" className="reviewbtn" onClick={e => { e.stopPropagation(); openDoc(file.title, file.id); }}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Quick starts ── */}
      <div className="wksec" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", display: "grid", gridTemplateColumns: "minmax(200px, 0.42fr) minmax(0, 1fr)", gap: 20, alignItems: "center", marginTop: 34 }}>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Give Yulia a clean sentence.</div>
        </div>
        <div className="ynext" style={{ margin: 0 }}>
          {QUICK_STARTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              className="yn"
              onClick={() => ask(prompt)}
            >
              <span className="yn-t"><b>{prompt}</b></span>
              <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--accent-strong)" }}>↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OperatingBriefCard({ brief, onAsk }: { brief: TodayOperatingBrief["morningBrief"]; onAsk: (prompt: string) => void }) {
  return (
    <article className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{brief.title}</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", background: "var(--surface-2)", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>{brief.freshness}</span>
      </div>
      <p style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.45 }}>{brief.lede}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {brief.chips.slice(0, 4).map(chip => (
          <span key={chip} style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 600, padding: "4px 9px", background: "var(--surface-2)", borderRadius: 999, color: "var(--ink-2)", border: "1px solid var(--line)" }}>{chip}</span>
        ))}
      </div>
      <button className="wkbtn" style={{ marginTop: "auto", paddingTop: 14, borderTop: "none", background: "transparent", border: 0, cursor: "pointer", textAlign: "left", padding: "14px 0 0", color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }} onClick={() => onAsk(brief.prompt)} type="button">
        Ask for the brief <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function GateCountdownCard({
  items,
  onOpenDeal,
  onAsk,
}: {
  items: TodayGateCountdownItem[];
  onOpenDeal: (dealId: string, title: string) => void;
  onAsk: (prompt: string) => void;
}) {
  return (
    <article className="wkcard" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Gate countdown</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", background: "var(--surface-2)", borderRadius: 999, padding: "3px 9px" }}>{items.length || 0}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.length === 0 && <span style={{ color: "var(--ink-3)", fontSize: "0.84rem", lineHeight: 1.4, padding: "4px 0" }}>No active gate blockers surfaced.</span>}
        {items.slice(0, 3).map(item => (
          <button key={`${item.dealId}-${item.gateId}`} style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "8px minmax(0, 1fr)", gap: 10, alignItems: "start", padding: "8px 0", boxSizing: "border-box", borderBottom: "1px solid var(--line)", width: "100%" }} onClick={() => onOpenDeal(item.dealId, item.title)} type="button">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-strong)", marginTop: 6, display: "block" }} />
            <span style={{ display: "flex", flexDirection: "column", gap: 2, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.35 }}>
              <strong style={{ color: "var(--ink)" }}>{item.title}</strong>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                {item.gateId} · {item.gateName} · {item.nextAction}
                {item.definitive ? ` · ${shortReadiness(item.definitive.readinessLevel)} ${item.definitive.score}%` : ""}
              </span>
              {item.definitive?.nextSuggestedCalls?.[0] && (
                <span style={{ color: "var(--accent-strong)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Next: {item.definitive.nextSuggestedCalls[0].label}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      <button className="wkbtn" style={{ marginTop: "auto", padding: "12px 0 0", background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }} onClick={() => onAsk("Show my gate countdown with required models, citations, and blockers.")} type="button">
        Read gates <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function ModelRefreshCard({
  items,
  onAsk,
  onRerun,
}: {
  items: TodayModelRefreshItem[];
  onAsk: (prompt: string) => void;
  onRerun: (item: TodayModelRefreshItem) => void;
}) {
  return (
    <article className="wkcard" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Model refresh</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", background: "var(--surface-2)", borderRadius: 999, padding: "3px 9px" }}>{items.length || 0}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.length === 0 && <span style={{ color: "var(--ink-3)", fontSize: "0.84rem", lineHeight: 1.4, padding: "4px 0" }}>Saved model outputs are current against tracked deal facts.</span>}
        {items.slice(0, 3).map(item => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8, alignItems: "center", borderBottom: "1px solid var(--line)", padding: "8px 0" }}>
            <button
              style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "8px minmax(0, 1fr)", gap: 10, alignItems: "start", boxSizing: "border-box", width: "100%" }}
              onClick={() => onAsk(`Explain the model refresh need for ${item.dealTitle || "this deal"}: ${item.modelTitle}. Recompute action: ${item.recomputeActionKey || item.recomputeSurfaceActionId || "execute_model"}. ${item.recomputePrompt || "Show changed assumptions, affected outputs, and the first rerun step."}`)}
              type="button"
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.status === "needs_rerun" ? "var(--st-dilig-dot)" : "var(--st-review-dot)", marginTop: 6, display: "block" }} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.35 }}>
                <strong style={{ color: "var(--ink)" }}>{item.modelTitle}</strong>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>{item.dealTitle ? `${item.dealTitle} · ` : ""}{item.statusLabel} · {item.changedInputs.slice(0, 2).join(", ") || item.rerunTriggers[0] || "tracked inputs"}</span>
                {item.recomputeActionKey && (
                  <span style={{ color: "var(--accent-strong)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>Recompute: {item.recomputeActionKey}</span>
                )}
              </span>
            </button>
            <button
              type="button"
              className="reviewbtn"
              onClick={() => onRerun(item)}
            >
              Rerun
            </button>
          </div>
        ))}
      </div>
      <button className="wkbtn" style={{ marginTop: "auto", padding: "12px 0 0", background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }} onClick={() => onAsk("Show stale and superseded model outputs across my deals, including changed assumptions, recompute action keys, and rerun order.")} type="button">
        Review models <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function StudioRefreshCard({
  items,
  onOpenBook,
  onAsk,
}: {
  items: TodayStudioRefreshItem[];
  onOpenBook: (item: TodayStudioRefreshItem) => void;
  onAsk: (prompt: string) => void;
}) {
  return (
    <article className="wkcard" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Studio refresh</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", background: "var(--surface-2)", borderRadius: 999, padding: "3px 9px" }}>{items.length || 0}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.length === 0 && <span style={{ color: "var(--ink-3)", fontSize: "0.84rem", lineHeight: 1.4, padding: "4px 0" }}>Studio books are clean enough for the next draft pass.</span>}
        {items.slice(0, 3).map(item => (
          <button key={item.bookId} style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "8px minmax(0, 1fr)", gap: 10, alignItems: "start", padding: "8px 0", borderBottom: "1px solid var(--line)", boxSizing: "border-box", width: "100%" }} onClick={() => onOpenBook(item)} type="button">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--st-dilig-dot)", marginTop: 6, display: "block" }} />
            <span style={{ display: "flex", flexDirection: "column", gap: 2, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.35 }}>
              <strong style={{ color: "var(--ink)" }}>{item.title}</strong>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>{item.gaps} {item.gaps === 1 ? "gap" : "gaps"} · {item.reason}</span>
            </span>
          </button>
        ))}
      </div>
      <button className="wkbtn" style={{ marginTop: "auto", padding: "12px 0 0", background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }} onClick={() => onAsk("Show me Studio drafts that need model refresh, source grounding, or export readiness work.")} type="button">
        Review Studio <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function FirmMemoryCard({ memory, onAsk }: { memory: TodayFirmMemorySnapshot; onAsk: (prompt: string) => void }) {
  const items = [
    ...memory.assumptions.slice(0, 1),
    ...memory.houseStyle.slice(0, 1),
    ...memory.workflows.slice(0, 1),
    ...memory.providers.slice(0, 1),
    ...memory.dealPatterns.slice(0, 1),
  ].slice(0, 3);

  return (
    <article className="wkcard" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Firm memory</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", background: "var(--surface-2)", borderRadius: 999, padding: "3px 9px" }}>{memory.stats.total}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.length === 0 && <span style={{ color: "var(--ink-3)", fontSize: "0.84rem", lineHeight: 1.4, padding: "4px 0" }}>Reusable assumptions and house style will accumulate here.</span>}
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "7px 0", borderBottom: "1px solid var(--line)", color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.35 }}>
            <strong style={{ color: "var(--ink)" }}>{item.label}</strong>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <button className="wkbtn" style={{ marginTop: "auto", padding: "12px 0 0", background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }} onClick={() => onAsk("Show the firm memory Yulia is using today, and what should be updated.")} type="button">
        Open memory <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function dealInitials(value: string): string {
  return value.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase();
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

function dealToTodayDeal(d: HomeDeal, index: number): TodayDeal {
  const tones: Tone[] = ["cactus", "gold", "oat", "plum", "charcoal"];
  const status = /[345]$/.test(d.current_gate) ? "Pursue" : "Watch";
  const sde = fmtCents(d.sde);
  const multiple = d.financials?.multiple ? `${d.financials.multiple.toFixed(1)}x` : "--";
  return {
    id: String(d.id),
    title: d.business_name || d.industry || `Deal #${d.id}`,
    meta: `${fmtCents(d.revenue)} · ${d.location || d.industry || "active deal"}`,
    thesis: d.financials?.notes || `${sde} SDE · ${d.current_gate}`,
    status,
    fit: fitFromEbitda(d.ebitda),
    sde,
    multiple,
    tone: tones[index % tones.length],
  };
}

function operatingDealToTodayDeal(item: TodayDealPulseItem, index: number): TodayDeal {
  const tones: Tone[] = ["cactus", "gold", "oat", "plum", "charcoal"];
  return {
    id: item.dealId,
    title: item.title,
    meta: `${item.metric} · ${item.urgency}`,
    thesis: item.thesis,
    status: item.status,
    fit: item.fit,
    sde: item.metric,
    multiple: "--",
    tone: item.tone || tones[index % tones.length],
    definitive: item.definitive,
  };
}

function deliverableToTodayFile(d: WorkspaceDeliverable): TodayFile {
  const title = d.name || d.slug.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const analysis = /model|valuation|analysis|sba|comp|risk|tax|financial|score/i.test(`${d.slug} ${title}`);
  return {
    kind: analysis ? "chart" : "doc",
    title,
    sub: `${d.deal_name || "Deal"} · ${d.status === "complete" ? "ready" : d.status}`,
    status: d.status === "complete" ? "Open" : d.status.replace(/_/g, " "),
    tone: d.status === "complete" ? "plum" : d.status === "failed" ? "charcoal" : "gold",
    id: String(d.id),
  };
}

function shortReadiness(level: string): string {
  return level.match(/DRL\d+/)?.[0] || "DRL";
}

// Keep TODAY_TEXTURE_CARD_FLIPS and TODAY_TEXTURE_CARDS accessible for future use
// (they are still referenced in the constants above)
void TODAY_TEXTURE_CARDS;
void TODAY_TEXTURE_CARD_FLIPS;
