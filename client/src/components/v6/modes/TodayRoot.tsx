import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useTodayOperatingBrief, type TodayFirmMemorySnapshot, type TodayGateCountdownItem, type TodayOperatingBrief, type TodayStudioRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { LOGGED_OUT_HERO_COPY } from "../../../lib/copy";
import { DESKTOP_TEXTURES } from "../../../lib/randomTextures";
import { executeSurfaceAction, type ActionDeal } from "../../../lib/v6ActionContracts";
import { isSurfaceActionId, type SurfaceActionId } from "../../../lib/v6SurfaceActions";
import type { OpenTab, StudioFormatId } from "../types";
import { V6Icon } from "../icons";
import {
  studioCompeteCardStyles,
  studioFormatCardBackground,
  studioListCardStyles,
  studioTextureCardStyles,
} from "../styles/studioSurfaces";

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

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const home = useHomeDeals(user);
  const workspace = useV6WorkspaceData(user);
  const [portfolioBrief, setPortfolioBrief] = useState<PortfolioBrief | null>(null);
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
  const waitingForYuliaRead = !useSampleData && !liveBrief;
  const deals = useSampleData ? DEALS : (liveBrief?.deals.length ? liveBrief.deals : realDeals.slice(0, 5).map(dealToTodayDeal));
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
  const isLoggedOutHero = !home.isAuthed;
  const leadTitle = lead?.title ?? "your first deal";
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
            text: "Find targets, buyers, capital, advisors, and market context without leaving the deal desk.",
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
            text: "No card-level recommendation is shown until the briefing layer returns the sourced result.",
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
          action: () => ask("Refresh my live portfolio read and tell me what needs action, with the source behind each recommendation."),
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
          title: "Find buyers, targets, or advisors",
          sub: "Start with a thesis and let Yulia assemble the search surface.",
          cta: "Search",
          tone: "gold" as Tone,
          action: () => openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true }),
        },
      ]);

  return (
    <div className="m-fade-up" style={showLoggedOutMarketing ? { ...T.page, ...T.loggedOutPage } : T.page}>
      <div style={T.pageContent}>
      <section style={T.heroGrid}>
        <article style={{ ...T.leadCard, backgroundImage: todayHeroWash(useSampleData) }}>
          <div style={T.leadTop}>
            <button className="m-glint m-glass-control" style={T.smallGhost} onClick={() => ask("Give me the short version of today's deal brief.")} type="button">
              Ask Yulia <span aria-hidden="true">↗</span>
            </button>
          </div>

          <h1 style={T.headline}>
            {liveBrief?.hero.title || (showLoggedOutMarketing ? (
              <>Connect sourcing, diligence, execution, and value creation in one workflow.</>
            ) : waitingForYuliaRead ? (
              <>Yulia is refreshing <span style={T.headlineSerif}>your portfolio read</span>.</>
            ) : lead ? (
              <>Yulia's read: <span style={T.headlineSerif}>{leadTitle}</span> needs your eye before the next buyer touch.</>
            ) : (
              <>Yulia is ready when <span style={T.headlineSerif}>your first deal</span> lands.</>
            ))}
          </h1>

          <p style={T.lede}>
            {liveBrief?.hero.lede || (showLoggedOutMarketing
              ? "smbX.ai connects institutional deal intelligence, workflow execution, and continuous transaction context across the deal lifecycle — from sourcing and diligence through post-close value realization."
              : waitingForYuliaRead
              ? "The page is holding the surface, but the recommendation copy belongs to Yulia's briefing layer. When it returns, the cards below will reflect her sourced read."
              : lead
              ? "The deal is still worth pursuing. Review the IOI, answer counsel on the NDA, and keep the buyer search narrow until working capital is buttoned up."
              : "No private workspace data is attached to this account yet. Start with a chat, source file, target, buyer pool, or deal thesis and Yulia will build the right surfaces around it.")}
          </p>

          <div style={T.briefNotes}>
            {heroNotes.slice(0, 3).map(note => (
              <BriefNote key={note.label} label={note.label} text={note.text} />
            ))}
          </div>

          <div style={T.heroActionGrid}>
            <button
              className="m-glint m-glass-control"
              style={T.heroGlassAction}
              onClick={() => liveBrief?.hero.primaryPrompt
                ? ask(liveBrief.hero.primaryPrompt)
                : showLoggedOutMarketing
                  ? ask("Help me connect sourcing, diligence, execution, and value creation in one workflow.")
                : lead
                  ? openDoc(`${lead.title} · IOI v3`)
                  : ask("Help me start my first SMBx deal workspace.")}
              type="button"
            >
              <span style={T.yTile}>Y</span>
              <span style={T.heroActionCopy}>
                <strong>{liveBrief?.hero.primaryLabel || (showLoggedOutMarketing ? "Chat with Yulia" : lead ? "Review IOI" : "Start with Yulia")}</strong>
                <span>{showLoggedOutMarketing ? "Start with a thesis, source file, target, buyer, or deal question." : lead ? "Open the work product Yulia wants reviewed first." : "Chat first; Yulia will build the surface around the deal."}</span>
              </span>
              <span style={T.heroActionPill}>{showLoggedOutMarketing ? "Start" : lead ? "Open" : "Start"}</span>
            </button>
            <button
              className="m-glint m-glass-control"
              style={T.heroGlassActionSecondary}
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
              type="button"
            >
              <span>{liveBrief?.hero.secondaryLabel || (showLoggedOutMarketing ? "Try sample deal" : lead ? "Open deal" : "Open pipeline")}</span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </article>

        <aside style={T.marketPanel}>
          <div style={T.liveHeader}>
            <div>
              <div className="mono" style={T.marketEyebrow}>YULIA'S MARKET DESK</div>
              <h2 style={T.panelTitle}>Portfolio intelligence</h2>
            </div>
          </div>

          <div style={T.workStack}>
            <button
              type="button"
              style={T.intelLead}
              onClick={() => ask("Show me the portfolio market intelligence read. Separate market, buyer/capital, tax, legal, and source gaps.")}
            >
              <div className="mono" style={T.intelLeadEyebrow}>{marketIntel.eyebrow}</div>
              <strong style={T.intelLeadTitle}>{marketIntel.headline}</strong>
              <span style={T.intelLeadSub}>{marketIntel.subhead}</span>
            </button>

            {marketIntel.bullets?.length > 0 && marketIntel.bullets.slice(0, 3).map((bullet) => (
                <button
                  key={bullet}
                  type="button"
                  style={T.intelBullet}
                  onClick={() => ask(`Unpack this market intelligence note: ${bullet}`)}
                >
                  {bullet}
                </button>
            ))}

            {liveDesk.map(item => (
              <button
                key={item.title}
                style={T.workCard}
                onClick={() => ask(item.prompt || `${item.eyebrow.toLowerCase()}: ${item.title}. What changed and what should I do next?`)}
                type="button"
              >
                <div style={T.workTitle}>{item.title}</div>
                <div style={T.workSub}>{item.sub}</div>
                <div style={T.meterTrack}>
                  <span style={{ ...T.meterFill, width: `${item.pct}%`, background: tone(item.tone).ink }} />
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section style={T.section}>
        <SectionHead eyebrow="YULIA PRIORITY QUEUE" title="What needs action" sub="Three moves surfaced from the live portfolio read." />
        <div style={T.priorityGrid}>
          {priorities.map((item, index) => (
            <PriorityCard key={item.title} index={index + 1} {...item} />
          ))}
        </div>
      </section>

      {operatingBrief && (
        <section style={T.operatingGrid}>
          <OperatingBriefCard brief={operatingBrief.morningBrief} onAsk={ask} />
          <GateCountdownCard
            items={operatingBrief.gateCountdown}
            onOpenDeal={(dealId, title) => openTab({ kind: "deal", id: dealId, title })}
            onAsk={ask}
          />
          <StudioRefreshCard
            items={operatingBrief.studioRefreshNeeds}
            onOpenBook={openStudioBook}
            onAsk={ask}
          />
          <FirmMemoryCard memory={operatingBrief.firmMemory} onAsk={ask} />
        </section>
      )}

      <section style={T.midGrid}>
        <div style={T.section}>
          <SectionHead eyebrow="PIPELINE PULSE" title="Deals in motion" sub="Not every live deal deserves the same attention." />
          <div style={T.dealBoard}>
            {deals.length === 0 && (
              <div style={T.emptyCard}>
                <strong>No deals yet</strong>
                <span>When you add a deal, Yulia will rank it here by urgency, fit, and next action.</span>
              </div>
            )}
            {deals.length > 0 && (
              <div style={T.listStack}>
                {deals.map(deal => (
                  <button key={deal.id} style={T.dealRow} onClick={() => openDeal(deal)} type="button">
                    <span style={T.dealIcon}>{dealInitials(deal.title)}</span>
                    <span style={T.dealMain}>
                      <span style={T.dealTitle}>{deal.title}</span>
                      <span style={T.dealMeta}>{deal.meta}</span>
                    </span>
                    <span style={T.dealStats}>
                      <span style={{ ...T.dealTone, background: tone(deal.tone).soft, color: tone(deal.tone).ink }}>{deal.status}</span>
                      <span>{deal.sde}</span>
                      <span>{deal.multiple}</span>
                      <strong>{deal.fit}</strong>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={T.section}>
          <SectionHead eyebrow="FILES" title="Files needing your eye" sub="Docs, data room items, and analyses surfaced from today's work." />
          <div style={T.fileCard}>
            {files.length === 0 && (
              <div style={T.emptyCard}>
                <strong>No files yet</strong>
                <span>Generated docs, analyses, uploaded artifacts, and data-room items will appear here.</span>
              </div>
            )}
            {files.length > 0 && (
              <div style={T.listStack}>
                {files.map((file, index) => (
                  <button
                    key={`${file.id ?? file.title}-${index}`}
                    style={T.fileRow}
                    onClick={() => openDoc(file.title, file.id)}
                    type="button"
                  >
                    <span style={T.fileIcon}>
                      <V6Icon name={file.kind === "chart" ? "chart" : "doc"} size={18} />
                    </span>
                    <span style={T.fileText}>
                      <span style={T.fileTitle}>{file.title}</span>
                      <span style={T.fileSub}>{file.sub}</span>
                    </span>
                    <span style={{ ...T.fileStatus, color: tone(file.tone).ink, background: tone(file.tone).soft }}>{file.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={T.startSection}>
        <div>
          <div className="mono" style={T.startEyebrow}>START SOMETHING</div>
          <h2 style={T.startTitle}>Give Yulia a clean sentence.</h2>
        </div>
        <div style={T.quickGrid}>
          {QUICK_STARTS.map(prompt => (
            <button key={prompt} className="m-glint m-glass-control" style={T.quickChip} onClick={() => ask(prompt)} type="button">
              {prompt}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}

function BriefNote({ label, text }: { label: string; text: string }) {
  return (
    <div style={T.note}>
      <div className="mono" style={T.noteLabel}>{label}</div>
      <div style={T.noteText}>{text}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={T.sectionHead}>
      <div className="mono" style={T.eyebrowBlue}>{eyebrow}</div>
      <h2 style={T.sectionTitle}>{title}</h2>
      <p style={T.sectionSub}>{sub}</p>
    </div>
  );
}

function PriorityCard({
  index,
  kicker,
  title,
  sub,
  cta,
  action,
}: {
  index: number;
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  tone: Tone;
  action: () => void;
}) {
  return (
    <button style={{ ...T.priorityCard, backgroundImage: todayTextureCardBackground(index - 1) }} onClick={action} type="button">
      <span className="mono" style={T.priorityKicker}>{kicker}</span>
      <strong style={T.priorityTitle}>{title}</strong>
      <span style={T.prioritySub}>{sub}</span>
      <span style={T.priorityCta}>{cta}</span>
    </button>
  );
}

function OperatingBriefCard({ brief, onAsk }: { brief: TodayOperatingBrief["morningBrief"]; onAsk: (prompt: string) => void }) {
  return (
    <article style={T.operatingPanel}>
      <div style={T.operatingHeader}>
        <h3 style={T.operatingTitle}>{brief.title}</h3>
        <span style={T.operatingFreshness}>{brief.freshness}</span>
      </div>
      <p style={T.operatingCopy}>{brief.lede}</p>
      <div style={T.operatingChips}>
        {brief.chips.slice(0, 4).map(chip => (
          <span key={chip} style={T.operatingChip}>{chip}</span>
        ))}
      </div>
      <button className="m-glass-control" style={T.operatingAction} onClick={() => onAsk(brief.prompt)} type="button">
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
    <article style={T.operatingPanel}>
      <div style={T.operatingHeader}>
        <h3 style={T.operatingTitle}>Gate countdown</h3>
        <span style={T.operatingFreshness}>{items.length || 0}</span>
      </div>
      <div style={T.operatingList}>
        {items.length === 0 && <EmptyOperatingLine text="No active gate blockers surfaced." />}
        {items.slice(0, 3).map(item => (
          <button key={`${item.dealId}-${item.gateId}`} style={T.operatingRow} onClick={() => onOpenDeal(item.dealId, item.title)} type="button">
            <span style={{ ...T.operatingDot, background: tone(item.tone).ink }} />
            <span style={T.operatingRowText}>
              <strong>{item.title}</strong>
              <span>{item.gateId} · {item.gateName} · {item.nextAction}</span>
            </span>
          </button>
        ))}
      </div>
      <button className="m-glass-control" style={T.operatingAction} onClick={() => onAsk("Show my gate countdown with required models, citations, and blockers.")} type="button">
        Read gates <span aria-hidden="true">›</span>
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
    <article style={T.operatingPanel}>
      <div style={T.operatingHeader}>
        <h3 style={T.operatingTitle}>Studio refresh</h3>
        <span style={T.operatingFreshness}>{items.length || 0}</span>
      </div>
      <div style={T.operatingList}>
        {items.length === 0 && <EmptyOperatingLine text="Studio books are clean enough for the next draft pass." />}
        {items.slice(0, 3).map(item => (
          <button key={item.bookId} style={T.operatingRow} onClick={() => onOpenBook(item)} type="button">
            <span style={{ ...T.operatingDot, background: tone(item.tone).ink }} />
            <span style={T.operatingRowText}>
              <strong>{item.title}</strong>
              <span>{item.gaps} {item.gaps === 1 ? "gap" : "gaps"} · {item.reason}</span>
            </span>
          </button>
        ))}
      </div>
      <button className="m-glass-control" style={T.operatingAction} onClick={() => onAsk("Show me Studio drafts that need model refresh, source grounding, or export readiness work.")} type="button">
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
    <article style={{ ...T.operatingPanel, ...T.memoryPanel }}>
      <div style={T.operatingHeader}>
        <h3 style={T.operatingTitle}>Firm memory</h3>
        <span style={T.operatingFreshness}>{memory.stats.total}</span>
      </div>
      <div style={T.operatingList}>
        {items.length === 0 && <EmptyOperatingLine text="Reusable assumptions and house style will accumulate here." />}
        {items.map(item => (
          <div key={item.id} style={T.memoryLine}>
            <strong>{item.label}</strong>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <button className="m-glass-control" style={T.operatingAction} onClick={() => onAsk("Show the firm memory Yulia is using today, and what should be updated.")} type="button">
        Open memory <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function EmptyOperatingLine({ text }: { text: string }) {
  return <div style={T.emptyOperatingLine}>{text}</div>;
}

function tone(key: Tone) {
  const tones: Record<Tone, { ink: string; soft: string }> = {
    gold: { ink: "#9C7128", soft: "#FAF1E1" },
    cactus: { ink: "#3f7d64", soft: "rgba(98, 153, 135, 0.16)" },
    oat: { ink: "#6F7B96", soft: "rgba(238, 241, 251, 0.78)" },
    plum: { ink: "#655fa7", soft: "rgba(130, 125, 189, 0.14)" },
    charcoal: { ink: "#1A2233", soft: "rgba(26, 34, 51, 0.08)" },
  };
  return tones[key];
}

function todayTextureCardBackground(index: number): string {
  return studioFormatCardBackground(TODAY_TEXTURE_CARDS[index % TODAY_TEXTURE_CARDS.length]);
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

const paperShadow = "0 18px 44px rgba(42,65,96,0.10), 0 4px 12px rgba(26,34,51,0.05), inset 0 1px 0 rgba(255,255,255,0.72)";
const whiteCard = "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(247,250,255,0.74))";
const liquidGlass =
  "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.34), transparent 34%), " +
  "linear-gradient(135deg, rgba(255,255,255,0.19), rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.025))";
const liquidGlassFilter = "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)";
const liquidGlassShadow =
  "0 16px 34px -22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.34)";
const liquidDarkGlassShadow =
  "0 16px 34px -22px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.26)";
const todayHeroWash = (sample: boolean) =>
  sample
    ? `linear-gradient(155deg, rgba(77,39,53,0.52) 0%, rgba(183,103,93,0.34) 48%, rgba(29,30,54,0.58) 100%), url('${DESKTOP_TEXTURES.todayHeroSample}')`
    : `linear-gradient(155deg, rgba(18,51,61,0.58) 0%, rgba(78,128,111,0.35) 48%, rgba(13,26,46,0.62) 100%), url('${DESKTOP_TEXTURES.todayHeroWorkspace}')`;
const TODAY_START_TEXTURE = "/textures/desktop/random/texture-random-10.png?v=20260516-start-cool-1";

const T: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    margin: "-28px -40px -56px",
    padding: "34px 40px 72px",
    background: "radial-gradient(circle at 50% -120px, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0) 44%), linear-gradient(180deg, #F6F8FC 0%, #EEF4FA 58%, #E8F0F8 100%)",
    color: "#1A2233",
  },
  pageContent: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  loggedOutPage: {
    background: "radial-gradient(circle at 48% -120px, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0) 42%), linear-gradient(180deg, #FFFFFF 0%, #FEFFFF 54%, #F8FBFF 100%)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(520px, 100%), 1.25fr) minmax(min(360px, 100%), 0.75fr)",
    gap: 20,
    alignItems: "stretch",
  },
  leadCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 48px 118px rgba(52, 63, 90, 0.31), 0 20px 46px rgba(26, 34, 51, 0.16), 0 4px 12px rgba(26, 34, 51, 0.08), inset 0 1px 0 rgba(255,255,255,0.28)",
    padding: 30,
    minHeight: 560,
    display: "flex",
    flexDirection: "column",
  },
  leadTop: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: 20,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  eyebrowBlue: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 700,
    color: "#5967b5",
  },
  smallGhost: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    padding: "0 13px",
    borderRadius: 999,
    background: liquidGlass,
    color: "#FFFFFF",
    border: "0.5px solid rgba(255,255,255,0.36)",
    boxShadow: liquidGlassShadow,
    backdropFilter: liquidGlassFilter,
    WebkitBackdropFilter: liquidGlassFilter,
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  },
  headline: {
    margin: "24px 0 0",
    maxWidth: 900,
    fontFamily: "'Figtree', var(--font-body)",
    fontWeight: 850,
    fontSize: "clamp(38px, 4.5vw, 76px)",
    lineHeight: 0.94,
    letterSpacing: "-0.055em",
    textWrap: "balance",
    color: "#FFFFFF",
    textShadow: "0 2px 18px rgba(26,34,51,0.20)",
  },
  headlineSerif: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontWeight: 400,
    letterSpacing: "-0.035em",
  },
  lede: {
    maxWidth: 680,
    margin: "18px 0 0",
    fontSize: 17,
    lineHeight: 1.55,
    color: "#FFFFFF",
    textWrap: "pretty",
  },
  briefNotes: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 28,
  },
  note: {
    minHeight: 112,
    padding: 16,
    borderRadius: 16,
    background: liquidGlass,
    border: "0.5px solid rgba(255,255,255,0.38)",
    boxShadow: liquidGlassShadow,
    backdropFilter: liquidGlassFilter,
    WebkitBackdropFilter: liquidGlassFilter,
  },
  noteLabel: {
    fontSize: 9.5,
    letterSpacing: "0.14em",
    color: "#FFFFFF",
    fontWeight: 700,
  },
  noteText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 1.45,
    color: "#FFFFFF",
  },
  heroActionGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 12,
    alignItems: "stretch",
    marginTop: "auto",
    paddingTop: 24,
  },
  heroGlassAction: {
    all: "unset",
    minHeight: 72,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "52px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 14,
    padding: "11px 14px",
    borderRadius: 22,
    background: liquidGlass,
    border: "0.5px solid rgba(255,255,255,0.42)",
    boxShadow: liquidGlassShadow,
    color: "#FFFFFF",
    cursor: "pointer",
    backdropFilter: liquidGlassFilter,
    WebkitBackdropFilter: liquidGlassFilter,
  },
  heroGlassActionSecondary: {
    all: "unset",
    minWidth: 138,
    minHeight: 72,
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0 18px",
    borderRadius: 22,
    background: "rgba(26,34,51,0.74)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.20)",
    boxShadow: liquidDarkGlassShadow,
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    backdropFilter: liquidGlassFilter,
    WebkitBackdropFilter: liquidGlassFilter,
  },
  yTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(145deg, #B7D8C6 0%, #5EA77F 100%)",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 900,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 8px 18px rgba(26,34,51,0.13)",
  },
  heroActionCopy: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 13,
    lineHeight: 1.35,
    color: "#FFFFFF",
  },
  heroActionPill: {
    borderRadius: 999,
    padding: "9px 13px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.025))",
    color: "#FFFFFF",
    fontWeight: 850,
    fontSize: 12,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.56)",
  },
  livePanel: {
    borderRadius: 24,
    background: "#1A2233",
    color: "#FFFFFF",
    padding: 22,
    boxShadow: "0 24px 60px rgba(26, 34, 51, 0.22)",
    display: "flex",
    flexDirection: "column",
  },
  marketPanel: {
    ...studioCompeteCardStyles.panel,
    backgroundSize: "100% 100%, 100% 100%, 100% auto",
    backgroundRepeat: "no-repeat, no-repeat, repeat-y",
    backgroundPosition: "center, center, top center",
    color: "#1A2233",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  liveHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  panelTitle: {
    margin: "5px 0 0",
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "#1A2233",
  },
  marketEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#60708A",
  },
  workStack: {
    ...studioCompeteCardStyles.grid,
    flex: 1,
  },
  intelLead: {
    all: "unset",
    ...studioCompeteCardStyles.item,
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    background: "rgba(255,255,255,.72)",
    color: "#60708A",
    cursor: "pointer",
  },
  intelLeadEyebrow: {
    fontSize: 9,
    letterSpacing: "0.16em",
    color: "#60708A",
    fontWeight: 800,
  },
  intelLeadTitle: {
    display: "block",
    marginTop: 9,
    color: "#1A2233",
    fontSize: 22,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    fontWeight: 850,
  },
  intelLeadSub: {
    display: "block",
    marginTop: 8,
    color: "#60708A",
    fontSize: 13,
    lineHeight: 1.42,
  },
  intelBullet: {
    all: "unset",
    ...studioCompeteCardStyles.item,
    display: "block",
    boxSizing: "border-box",
    background: "rgba(255,255,255,.72)",
    color: "#60708A",
    fontSize: 12.2,
    lineHeight: 1.34,
    cursor: "pointer",
  },
  workCard: {
    all: "unset",
    ...studioCompeteCardStyles.item,
    display: "block",
    boxSizing: "border-box",
    background: "rgba(255,255,255,.72)",
    cursor: "pointer",
  },
  workTitle: {
    marginTop: 0,
    color: "#1A2233",
    fontSize: 21,
    fontWeight: 850,
    letterSpacing: "-0.04em",
  },
  workSub: {
    marginTop: 3,
    color: "#60708A",
    fontSize: 13,
    lineHeight: 1.45,
  },
  meterTrack: {
    marginTop: 14,
    height: 6,
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
  },
  meterFill: {
    display: "block",
    height: "100%",
    borderRadius: 999,
  },
  section: {
    marginTop: 34,
  },
  sectionHead: {
    marginBottom: 14,
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: 29,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "#1A2233",
  },
  sectionSub: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "#7A8395",
  },
  priorityGrid: {
    ...studioTextureCardStyles.grid,
  },
  priorityCard: {
    ...studioTextureCardStyles.card,
    cursor: "pointer",
  },
  priorityKicker: {
    ...studioTextureCardStyles.meta,
  },
  priorityTitle: {
    ...studioTextureCardStyles.title,
  },
  prioritySub: {
    ...studioTextureCardStyles.detail,
  },
  priorityCta: {
    ...studioTextureCardStyles.action,
  },
  operatingGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  operatingPanel: {
    minHeight: 206,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    padding: 18,
    borderRadius: 22,
    background: whiteCard,
    border: "1px solid rgba(255,255,255,0.62)",
    boxShadow: paperShadow,
    backdropFilter: "blur(18px) saturate(150%)",
    WebkitBackdropFilter: "blur(18px) saturate(150%)",
    overflow: "hidden",
  },
  memoryPanel: {
    backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.94), rgba(239,244,255,0.72)), url('${TODAY_START_TEXTURE}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
  },
  operatingHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  operatingTitle: {
    margin: 0,
    color: "#1A2233",
    fontSize: 20,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    fontWeight: 850,
  },
  operatingFreshness: {
    flex: "0 0 auto",
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(225,235,250,0.78)",
    color: "#2E5C8A",
    fontSize: 12,
    fontWeight: 850,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  operatingCopy: {
    margin: 0,
    color: "#596477",
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  operatingChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  operatingChip: {
    borderRadius: 999,
    padding: "7px 10px",
    background: "rgba(238, 243, 252, 0.86)",
    color: "#596477",
    fontSize: 12,
    fontWeight: 800,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
  },
  operatingList: {
    display: "grid",
    gap: 8,
    marginTop: 2,
  },
  operatingRow: {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr)",
    gap: 11,
    alignItems: "start",
    padding: "9px 0",
    cursor: "pointer",
  },
  operatingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 7,
    boxShadow: "0 0 0 4px rgba(226,235,249,0.72)",
  },
  operatingRowText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "#6B7486",
    fontSize: 12.5,
    lineHeight: 1.35,
  },
  memoryLine: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "8px 0",
    color: "#6B7486",
    fontSize: 12.5,
    lineHeight: 1.35,
  },
  operatingAction: {
    all: "unset",
    minHeight: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
    borderRadius: 999,
    background: "rgba(34, 47, 68, 0.86)",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 850,
    cursor: "pointer",
    border: "0.5px solid rgba(255,255,255,0.28)",
    boxShadow: liquidDarkGlassShadow,
    backdropFilter: liquidGlassFilter,
    WebkitBackdropFilter: liquidGlassFilter,
  },
  emptyOperatingLine: {
    color: "#7A8395",
    fontSize: 13,
    lineHeight: 1.4,
    padding: "9px 0",
  },
  midGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(520px, 100%), 1.1fr) minmax(min(360px, 100%), 0.9fr)",
    gap: 20,
    alignItems: "start",
  },
  dealBoard: {
    ...studioListCardStyles.panel,
  },
  listStack: {
    ...studioListCardStyles.stack,
  },
  dealRow: {
    all: "unset",
    ...studioListCardStyles.row,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  dealIcon: {
    ...studioListCardStyles.icon,
  },
  dealTone: {
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 850,
    textAlign: "center",
  },
  dealMain: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: 850,
    letterSpacing: "-0.025em",
    color: "#1A2233",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dealMeta: {
    marginTop: 3,
    fontSize: 12.5,
    color: "#7A8395",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dealStats: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    color: "#555E6F",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  fileCard: {
    ...studioListCardStyles.panel,
  },
  fileRow: {
    all: "unset",
    ...studioListCardStyles.row,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  fileIcon: {
    ...studioListCardStyles.icon,
  },
  fileText: {
    ...studioListCardStyles.body,
  },
  fileTitle: {
    color: "#1A2233",
    fontSize: 14.5,
    fontWeight: 850,
    letterSpacing: "-0.025em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSub: {
    marginTop: 2,
    color: "#7A8395",
    fontSize: 12.5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileStatus: {
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 850,
    whiteSpace: "nowrap",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: 20,
    color: "#7A8395",
    fontSize: 13,
    lineHeight: 1.45,
  },
  startSection: {
    ...studioCompeteCardStyles.panel,
    marginTop: 36,
    display: "grid",
    gridTemplateColumns: "minmax(220px, 0.45fr) minmax(0, 1fr)",
    gap: 20,
    alignItems: "center",
  },
  startTitle: {
    margin: "5px 0 0",
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "#1A2233",
  },
  startEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#60708A",
  },
  quickGrid: {
    ...studioCompeteCardStyles.grid,
    marginTop: 0,
  },
  quickChip: {
    all: "unset",
    ...studioCompeteCardStyles.item,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#60708A",
    fontSize: 14,
    fontWeight: 850,
    cursor: "pointer",
  },
};
