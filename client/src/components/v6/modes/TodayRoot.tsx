import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { DESKTOP_TEXTURES } from "../../../lib/randomTextures";
import type { OpenTab } from "../types";
import { V6Icon } from "../icons";

const TODAY_DATE = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

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
  { eyebrow: "DRAFTING", title: "IOI v3", sub: "Recurring revenue framing · ready for review", pct: 76, tone: "gold" as Tone },
  { eyebrow: "WATCHING", title: "87 sources", sub: "4 new HVAC matches since yesterday", pct: 42, tone: "plum" as Tone },
  { eyebrow: "RANKING", title: "Buyer pool", sub: "18 candidates sorted by strategic fit", pct: 58, tone: "cactus" as Tone },
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
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const liveBrief = useSampleData ? null : portfolioBrief;
  const deals = useSampleData ? DEALS : (liveBrief?.deals.length ? liveBrief.deals : realDeals.slice(0, 5).map(dealToTodayDeal));
  const liveDesk = liveBrief?.liveDesk?.length ? liveBrief.liveDesk : WORK;
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
  const marketIntel = liveBrief?.marketIntelligence ?? {
    eyebrow: "MARKET INTELLIGENCE LIVE",
    headline: lead ? `${lead.title} is being read against market, structure, files, and next action.` : "Yulia turns every deal into a live intelligence desk.",
    subhead: lead ? "Industry, buyer universe, financing climate, tax/legal issues, and work product belong in one place." : "Start with a deal or thesis and Yulia builds the market context around it.",
    bullets: [],
    sourceCount: 0,
    confidence: liveBrief ? "Live" : "Demo",
  };
  const heroNotes = liveBrief?.hero.notes?.length
    ? liveBrief.hero.notes
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

  const openDealById = (id: string, title?: string) => {
    const deal = deals.find(item => item.id === id);
    if (deal) {
      openDeal(deal);
      return;
    }
    openTab({ kind: "deal", id, title: title || "Deal" });
  };

  const openDoc = (title: string, id?: string) => {
    openTab({ kind: "doc", title, id: id ?? `doc-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` });
  };

  const livePriorities = liveBrief?.priorities?.length
    ? liveBrief.priorities.map(item => ({
        ...item,
        action: () => {
          if (item.dealId) {
            openDealById(item.dealId, item.dealTitle);
            return;
          }
          if (item.docId || item.docTitle) {
            openDoc(item.docTitle || item.title, item.docId);
            return;
          }
          if (item.tabKind === "search") {
            openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true });
            return;
          }
          ask(item.prompt || `${item.title}: ${item.sub}`);
        },
      }))
    : null;

  const priorities = livePriorities ?? (lead
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
    <div className="m-fade-up" style={T.page}>
      <section style={T.heroGrid}>
        <article style={{ ...T.leadCard, backgroundImage: todayHeroWash(useSampleData) }}>
          <div style={{ ...T.coverRule, background: useSampleData ? "#C98F84" : "#629987" }} />
          <div style={T.leadTop}>
            <div>
              <div className="mono" style={T.eyebrow}>TODAY'S BRIEF</div>
              <div style={T.date}>{TODAY_DATE}</div>
            </div>
            <button style={T.smallGhost} onClick={() => ask("Give me the short version of today's deal brief.")} type="button">
              Ask Yulia <span aria-hidden="true">↗</span>
            </button>
          </div>

          <button
            style={T.marketIntelBand}
            onClick={() => ask("Show me the market intelligence behind today’s read. Include strategy, tax, legal, and source gaps.")}
            type="button"
          >
            <span style={T.marketIntelMarker} />
            <span style={T.marketIntelCopy}>
              <span className="mono" style={T.marketIntelEyebrow}>{marketIntel.eyebrow}</span>
              <strong style={T.marketIntelHeadline}>{marketIntel.headline}</strong>
              <span style={T.marketIntelSub}>{marketIntel.subhead}</span>
            </span>
            <span style={T.marketIntelMeta}>
              {marketIntel.sourceCount > 0 ? `${marketIntel.sourceCount} sources` : marketIntel.confidence}
            </span>
          </button>

          <h1 style={T.headline}>
            {liveBrief?.hero.title || (lead ? (
              <>Yulia's read: <span style={T.headlineSerif}>{leadTitle}</span> needs your eye before the next buyer touch.</>
            ) : (
              <>Yulia is ready when <span style={T.headlineSerif}>your first deal</span> lands.</>
            ))}
          </h1>

          <p style={T.lede}>
            {liveBrief?.hero.lede || (lead
              ? "The deal is still worth pursuing. Review the IOI, answer counsel on the NDA, and keep the buyer search narrow until working capital is buttoned up."
              : "No private workspace data is attached to this account yet. Start with a chat, source file, target, buyer pool, or deal thesis and Yulia will build the right surfaces around it.")}
          </p>

          <div style={T.briefNotes}>
            {heroNotes.slice(0, 3).map(note => (
              <BriefNote key={note.label} label={note.label} text={note.text} />
            ))}
          </div>

          <div style={T.leadActions}>
            <button
              style={T.primaryButton}
              onClick={() => liveBrief?.hero.primaryPrompt
                ? ask(liveBrief.hero.primaryPrompt)
                : lead
                  ? openDoc(`${lead.title} · IOI v3`)
                  : ask("Help me start my first SMBx deal workspace.")}
              type="button"
            >
              {liveBrief?.hero.primaryLabel || (lead ? "Review IOI" : "Start with Yulia")}
            </button>
            <button
              style={T.secondaryButton}
              onClick={() => liveBrief?.hero.secondaryDealId
                ? openDealById(liveBrief.hero.secondaryDealId)
                : lead
                  ? openDeal(lead)
                  : openTab({ kind: "mode-root", modeId: "pipeline", id: "pipeline-root", title: "Pipeline", pinned: true })}
              type="button"
            >
              {liveBrief?.hero.secondaryLabel || (lead ? "Open deal" : "Open pipeline")}
            </button>
          </div>
        </article>

        <aside style={T.livePanel}>
          <div style={T.liveHeader}>
            <div>
              <div className="mono" style={T.eyebrowBlue}>YULIA IS WORKING</div>
              <h2 style={T.panelTitle}>Live desk</h2>
            </div>
            <span style={T.liveDotWrap}><span style={T.liveDot} /> live</span>
          </div>

          <div style={T.workStack}>
            {liveDesk.map(item => (
              <button
                key={item.title}
                style={T.workCard}
                onClick={() => ask(item.prompt || `${item.eyebrow.toLowerCase()}: ${item.title}. What changed and what should I do next?`)}
                type="button"
              >
                <div style={T.workTop}>
                  <span className="mono" style={T.workEyebrow}>{item.eyebrow}</span>
                  <span style={{ ...T.workPct, color: tone(item.tone).ink }}>{item.pct}%</span>
                </div>
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
        <SectionHead eyebrow="PRIORITY QUEUE" title="What needs action" sub="Three moves. Then the day gets quieter." />
        <div style={T.priorityGrid}>
          {priorities.map((item, index) => (
            <PriorityCard key={item.title} index={index + 1} {...item} />
          ))}
        </div>
      </section>

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
            {deals.map(deal => (
              <button key={deal.id} style={T.dealRow} onClick={() => openDeal(deal)} type="button">
                <span style={{ ...T.dealTone, background: tone(deal.tone).soft, color: tone(deal.tone).ink }}>{deal.status}</span>
                <span style={T.dealMain}>
                  <span style={T.dealTitle}>{deal.title}</span>
                  <span style={T.dealMeta}>{deal.meta}</span>
                </span>
                <span style={T.dealStats}>
                  <span>{deal.sde}</span>
                  <span>{deal.multiple}</span>
                  <strong>{deal.fit}</strong>
                </span>
              </button>
            ))}
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
            {files.map((file, index) => (
              <button
                key={`${file.id ?? file.title}-${index}`}
                style={{ ...T.fileRow, borderBottom: index === files.length - 1 ? "none" : "1px solid #E7EBF5" }}
                onClick={() => openDoc(file.title, file.id)}
                type="button"
              >
                <span style={{ ...T.fileIcon, background: tone(file.tone).soft, color: tone(file.tone).ink }}>
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
        </div>
      </section>

      <section style={T.startSection}>
        <div>
          <div className="mono" style={T.eyebrow}>START SOMETHING</div>
          <h2 style={T.startTitle}>Give Yulia a clean sentence.</h2>
        </div>
        <div style={T.quickGrid}>
          {QUICK_STARTS.map(prompt => (
            <button key={prompt} style={T.quickChip} onClick={() => ask(prompt)} type="button">
              {prompt}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
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
  tone: itemTone,
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
  const t = tone(itemTone);
  return (
    <button style={T.priorityCard} onClick={action} type="button">
      <span style={{ ...T.priorityNum, color: t.ink, background: t.soft }}>
        <span className="mono" style={T.priorityNumLabel}>{index}</span>
      </span>
      <span style={T.priorityBody}>
        <span className="mono" style={T.priorityKicker}>{kicker}</span>
        <span style={T.priorityTitle}>{title}</span>
        <span style={T.prioritySub}>{sub}</span>
      </span>
      <span style={{ ...T.priorityCta, color: t.ink, background: t.soft }}>{cta}</span>
    </button>
  );
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

const paperShadow = "0 22px 58px rgba(26, 34, 51, 0.12), 0 2px 10px rgba(26, 34, 51, 0.06)";
const todayHeroWash = (sample: boolean) =>
  sample
    ? `linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,239,234,0.70) 54%, rgba(201,143,132,0.28) 100%), url('${DESKTOP_TEXTURES.todayHeroSample}')`
    : `linear-gradient(135deg, rgba(255,255,255,0.84) 0%, rgba(229,244,237,0.68) 55%, rgba(98,153,135,0.28) 100%), url('${DESKTOP_TEXTURES.todayHeroWorkspace}')`;
const cardWash = `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(246,249,253,0.78) 100%), url('${DESKTOP_TEXTURES.todayCard}')`;

const T: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    margin: "-28px -40px -56px",
    padding: "34px max(44px, calc(50% - 690px)) 72px",
    background: "linear-gradient(180deg, #F6F8FC 0%, #FFFFFF 44%, #EEF2F8 100%)",
    color: "#1A2233",
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
    border: "1px solid #E7EBF5",
    boxShadow: paperShadow,
    padding: 30,
  },
  coverRule: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    background: "#8A9AE8",
  },
  leadTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 700,
    color: "#4F60BD",
  },
  eyebrowBlue: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 700,
    color: "#5967b5",
  },
  date: {
    marginTop: 5,
    fontSize: 13,
    color: "#7A8395",
  },
  smallGhost: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    padding: "0 13px",
    borderRadius: 999,
    background: "#EEF1FB",
    color: "#4F60BD",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  },
  marketIntelBand: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "9px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 14,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 24,
    padding: "15px 17px",
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(26,34,51,0.92), rgba(50,76,90,0.88))",
    color: "#F7FAFC",
    boxShadow: "0 18px 42px rgba(26,34,51,0.20)",
    cursor: "pointer",
  },
  marketIntelMarker: {
    width: 9,
    alignSelf: "stretch",
    minHeight: 64,
    borderRadius: 999,
    background: "linear-gradient(180deg, #D6A35C 0%, #629987 100%)",
    boxShadow: "0 0 0 5px rgba(214, 163, 92, 0.12)",
  },
  marketIntelCopy: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  marketIntelEyebrow: {
    fontSize: 9,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#D9E3F0",
  },
  marketIntelHeadline: {
    fontSize: 18,
    lineHeight: 1.08,
    letterSpacing: "-0.035em",
    color: "#FFFFFF",
  },
  marketIntelSub: {
    fontSize: 12.5,
    lineHeight: 1.35,
    color: "#CAD4E4",
  },
  marketIntelMeta: {
    justifySelf: "end",
    borderRadius: 999,
    padding: "8px 10px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#F7FAFC",
    fontSize: 11,
    fontWeight: 850,
    whiteSpace: "nowrap",
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
    color: "#1A2233",
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
    color: "#555E6F",
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
    backgroundImage: cardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid #E7EBF5",
  },
  noteLabel: {
    fontSize: 9.5,
    letterSpacing: "0.14em",
    color: "#4F60BD",
    fontWeight: 700,
  },
  noteText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 1.45,
    color: "#555E6F",
  },
  leadActions: {
    display: "flex",
    gap: 10,
    marginTop: 24,
  },
  primaryButton: {
    all: "unset",
    height: 42,
    padding: "0 18px",
    borderRadius: 999,
    background: "#D6A35C",
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(214, 163, 92, 0.26)",
  },
  secondaryButton: {
    all: "unset",
    height: 42,
    padding: "0 18px",
    borderRadius: 999,
    background: "#1A2233",
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
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
  },
  liveDotWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    color: "#E7EBF5",
    fontWeight: 700,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#D6A35C",
    boxShadow: "0 0 0 6px rgba(214, 163, 92, 0.18)",
  },
  workStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  workCard: {
    all: "unset",
    display: "block",
    borderRadius: 18,
    padding: 16,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    cursor: "pointer",
  },
  workTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  workEyebrow: {
    fontSize: 9,
    letterSpacing: "0.16em",
    color: "#C8D0E3",
    fontWeight: 700,
  },
  workPct: {
    fontSize: 12,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  workTitle: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: 850,
    letterSpacing: "-0.04em",
  },
  workSub: {
    marginTop: 3,
    color: "#C8D0E3",
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
  },
  priorityCard: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "50px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 14,
    minHeight: 116,
    padding: 18,
    borderRadius: 20,
    backgroundImage: cardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid #E7EBF5",
    boxShadow: "0 14px 34px rgba(26, 34, 51, 0.09)",
    cursor: "pointer",
  },
  priorityNum: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.58), 0 10px 20px rgba(26,34,51,0.07)",
    position: "relative",
    overflow: "hidden",
  },
  priorityNumLabel: {
    fontSize: 13,
    letterSpacing: "0.08em",
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums",
  },
  priorityBody: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  priorityKicker: {
    fontSize: 9,
    letterSpacing: "0.15em",
    color: "#7A8395",
    fontWeight: 700,
  },
  priorityTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 850,
    letterSpacing: "-0.035em",
    color: "#1A2233",
  },
  prioritySub: {
    marginTop: 4,
    color: "#555E6F",
    fontSize: 13,
    lineHeight: 1.4,
  },
  priorityCta: {
    alignSelf: "center",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 850,
    whiteSpace: "nowrap",
  },
  midGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(520px, 100%), 1.1fr) minmax(min(360px, 100%), 0.9fr)",
    gap: 20,
    alignItems: "start",
  },
  dealBoard: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundImage: cardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid #E7EBF5",
    boxShadow: paperShadow,
  },
  dealRow: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "86px minmax(0, 1fr) 172px",
    alignItems: "center",
    gap: 16,
    width: "100%",
    boxSizing: "border-box",
    minHeight: 74,
    padding: "13px 18px",
    borderBottom: "1px solid #E7EBF5",
    cursor: "pointer",
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
    display: "grid",
    gridTemplateColumns: "1fr 1fr 44px",
    gap: 10,
    alignItems: "baseline",
    color: "#555E6F",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  fileCard: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundImage: cardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid #E7EBF5",
    boxShadow: paperShadow,
  },
  fileRow: {
    all: "unset",
    width: "100%",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "42px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    minHeight: 70,
    padding: "12px 16px",
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
  fileText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
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
    marginTop: 36,
    padding: 22,
    borderRadius: 24,
    backgroundImage: `linear-gradient(135deg, rgba(238,241,251,0.90), rgba(255,255,255,0.70)), url('${DESKTOP_TEXTURES.todaySecondary}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid #DDE3F0",
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
  },
  quickGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  quickChip: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 38,
    padding: "0 14px",
    borderRadius: 999,
    background: "#FFFFFF",
    border: "1px solid #DDE3F0",
    color: "#1A2233",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(26, 34, 51, 0.08)",
  },
};
