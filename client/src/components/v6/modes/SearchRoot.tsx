import { type CSSProperties } from "react";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { DESKTOP_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import {
  studioCompeteButtonItemStyles,
  studioCompeteCardStyles,
  studioListCardStyles,
  studioLiquidGlassFilter,
  studioLiquidGlassShadow,
  studioTextureCardBackground,
  studioTextureCardStyles,
} from "../styles/studioSurfaces";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Category {
  meta: string;
  title: string;
  audience: string;
  detail: string;
  texture: string;
  prompt: string;
}

interface DiscoveryRow {
  icon: "search" | "deal" | "doc" | "chart";
  title: string;
  sub: string;
  pill: string;
  prompt: string;
}

const CATEGORIES: Category[] = [
  {
    meta: "Market lane",
    title: "Targets to buy",
    audience: "Thesis, geography, check size",
    detail: "Target read, source confidence, fit rationale, and first outreach angle.",
    texture: STUDIO_TEXTURES.green,
    prompt: "Find acquisition targets from this thesis: recurring revenue, lower-middle-market services, owner transition risk acceptable.",
  },
  {
    meta: "Buyer lane",
    title: "Buyers and buy-side",
    audience: "Strategics, sponsors, buyer pools",
    detail: "Buyer universe ranked by strategic fit, ability to close, and relationship angle.",
    texture: STUDIO_TEXTURES.rose,
    prompt: "Find likely buyers and buyer pools for Big Fake Deal. Rank strategic fit, ability to close, and relationship angle.",
  },
  {
    meta: "Capital lane",
    title: "PE and lenders",
    audience: "Sponsors, SBA, senior debt",
    detail: "Capital partners matched by mandate, check size, lender fit, and diligence ask.",
    texture: STUDIO_TEXTURES.navy,
    prompt: "Find PE firms, independent sponsors, and senior debt lenders relevant to this deal size and industry.",
  },
  {
    meta: "Provider lane",
    title: "Deal professionals",
    audience: "M&A counsel, QoE, tax, insurance",
    detail: "Provider shortlist with why-now context, fit rationale, and handoff instructions.",
    texture: STUDIO_TEXTURES.blue,
    prompt: "Find deal professionals for this transaction: M&A counsel, QoE, tax, insurance, and real estate support.",
  },
];

const DISCOVERY: DiscoveryRow[] = [
  {
    icon: "search",
    title: "Buyer pool for industrial services",
    sub: "Strategics, PE platforms, and independent sponsors that fit Big Fake Deal.",
    pill: "18 buyers",
    prompt: "Open the buyer pool search for industrial services and tell me who deserves outreach first.",
  },
  {
    icon: "deal",
    title: "Targets from a route-density thesis",
    sub: "Pest, HVAC, and field-service companies clustered by geography.",
    pill: "42 targets",
    prompt: "Build a target list from a route-density thesis in pest, HVAC, and field services.",
  },
  {
    icon: "chart",
    title: "SBA and senior debt lenders",
    sub: "Lenders comfortable with service business cash flow and light collateral.",
    pill: "12 lenders",
    prompt: "Find SBA and senior debt lenders for a lower-middle-market services acquisition.",
  },
  {
    icon: "doc",
    title: "M&A attorneys for seller-side docs",
    sub: "Counsel with lower-middle-market transaction experience.",
    pill: "9 firms",
    prompt: "Find M&A attorneys who can review seller-side documents and data-room workflow.",
  },
];

const EXAMPLES = [
  "Find buyers for Big Fake Deal",
  "Build a target list from my HVAC thesis",
  "Map PE firms active in pest control",
  "Find M&A attorneys near Austin",
];

const MARKET_STACK = [
  {
    title: "Buyer universe",
    sub: "Strategics, platforms, sponsors, and family offices grouped by fit and likely close path.",
  },
  {
    title: "Target list",
    sub: "Companies ranked by thesis match, geography, route density, size, and source confidence.",
  },
  {
    title: "Provider match",
    sub: "Attorneys, QoE, tax, insurance, and diligence partners matched to deal context.",
  },
  {
    title: "Market citations",
    sub: "Every useful answer should carry source trail, date, and reason it belongs in the deal record.",
  },
];

const LIQUID_GLASS_FILTER = "blur(5px) saturate(165%) contrast(1.08) brightness(1.04)";
const SHORTCUT_DARK_GLASS_BACKGROUND =
  "radial-gradient(circle at 20% -18%, rgba(255,255,255,0.24), transparent 42%), linear-gradient(145deg, rgba(21,28,42,0.88), rgba(39,49,70,0.70) 52%, rgba(10,14,22,0.84))";

export function V6SearchRoot({ openTab, onTalkToYulia }: SearchRootProps) {
  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDiscoverySurface = (prompt: string, title = "Market discovery") => {
    openTab({
      kind: "analysis",
      title,
      tool: "market_discovery",
      markdown: [
        `# ${title}`,
        "",
        "Yulia is opening this as a working market-discovery surface, not a document search.",
        "",
        "The output should become ranked buyers, targets, capital providers, or deal professionals with evidence, fit rationale, outreach priority, and next action.",
        "",
        `**Search brief:** ${prompt}`,
      ].join("\n"),
    });
    ask(prompt);
  };

  return (
    <div className="m-fade-up m-page-flow" style={S.page}>
      <section style={S.hero}>
        <div style={S.heroCopy}>
          <h1 style={S.title}>Find the other side of the market.</h1>
          <p style={S.sub}>
            Search here is not document search. It is market discovery: buyers, targets, capital, and the professionals who help deals close.
          </p>
        </div>

        <div className="m-flow-grid" style={S.examples}>
          {EXAMPLES.map(example => (
            <button
              key={example}
              className="m-glint m-glass-control"
              type="button"
              style={S.examplePill}
              onClick={() => {
                openDiscoverySurface(`Run a market discovery search: ${example}`);
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      <section style={S.section}>
        <SectionTitle title="Market lanes" sub="Start broad, then let Yulia narrow by thesis, geography, check size, fit, and relationship angle." />
        <div className="m-flow-grid" style={S.categoryGrid}>
          {CATEGORIES.map(category => (
            <CategoryCard key={category.title} category={category} onClick={() => openDiscoverySurface(category.prompt, category.title)} />
          ))}
        </div>
      </section>

      <section className="m-flow-grid" style={S.discoveryGrid}>
        <div style={S.listCard}>
          <div style={S.listTop}>
            <div>
              <h2 style={S.listTitle}>Searches to reopen</h2>
              <p style={S.listSub}>Recent market maps, buyer pools, lenders, and provider searches.</p>
            </div>
            <button
              style={S.listAction}
              type="button"
              onClick={() => {
                openDiscoverySurface("Open a discovery map for my current sourcing work: buyers, targets, capital providers, and deal professionals grouped by thesis and next action.", "Discovery map");
              }}
            >
              Open map
            </button>
          </div>

          <div className="m-flow-grid" style={S.listStack}>
            {DISCOVERY.map(row => (
              <button
                key={row.title}
                type="button"
                style={S.discoveryRow}
                onClick={() => openDiscoverySurface(row.prompt, row.title)}
              >
                <span style={S.rowIcon}><V6Icon name={row.icon} size={18} /></span>
                <span style={S.rowText}>
                  <strong>{row.title}</strong>
                  <span>{row.sub}</span>
                </span>
                <span style={S.rowPill}>{row.pill}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={S.competesCard}>
          <h2 style={S.competeTitle}>Built for market work that becomes deal work.</h2>
          <div className="m-flow-grid" style={S.competeGrid}>
            {MARKET_STACK.map(item => (
              <button
                key={item.title}
                type="button"
                style={S.competeItem}
                onClick={() => ask(`Use Search to build this market work product: ${item.title}. ${item.sub}`)}
              >
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={S.sectionHead}>
      <h2 style={S.sectionTitle}>{title}</h2>
      <p style={S.sectionSub}>{sub}</p>
    </div>
  );
}

function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      className="m-nudge-soft"
      style={{ ...S.categoryCard, backgroundImage: studioTextureCardBackground(category.texture) }}
      onClick={onClick}
    >
      <span style={S.categoryMeta}>{category.meta}</span>
      <strong style={S.categoryTitle}>{category.title}</strong>
      <span style={S.categoryAudience}>{category.audience}</span>
      <span style={S.categoryDetail}>{category.detail}</span>
      <span style={S.categoryAction}>Open</span>
    </button>
  );
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    position: "relative",
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: 34,
    borderRadius: 24,
    backgroundImage: `linear-gradient(135deg, rgba(20, 83, 77, 0.84) 0%, rgba(49, 113, 95, 0.66) 52%, rgba(214, 163, 92, 0.36) 100%), url('${DESKTOP_TEXTURES.searchHero}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 46px 116px rgba(26, 84, 70, 0.30), 0 20px 46px rgba(26,34,51,0.16), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
    marginBottom: 30,
  },
  heroCopy: {
    maxWidth: 860,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  title: {
    margin: 0,
    fontSize: "clamp(44px, 5vw, 70px)",
    lineHeight: 0.94,
    letterSpacing: "-0.055em",
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
  examples: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 26,
  },
  examplePill: {
    all: "unset",
    minHeight: 34,
    padding: "0 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    background: SHORTCUT_DARK_GLASS_BACKGROUND,
    border: "0.5px solid rgba(255,255,255,0.44)",
    color: "#FFFFFF",
    boxShadow: "0 16px 32px -20px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.36), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.22)",
    backdropFilter: LIQUID_GLASS_FILTER,
    WebkitBackdropFilter: LIQUID_GLASS_FILTER,
    fontSize: 12.5,
    fontWeight: 800,
    textShadow: "0 1px 10px rgba(13,22,32,0.22)",
    cursor: "pointer",
  },
  section: {
    marginBottom: 34,
  },
  sectionHead: {
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  sectionSub: {
    margin: "8px 0 0",
    maxWidth: 760,
    fontSize: 14,
    color: "var(--m-on-surface-mid)",
  },
  categoryGrid: {
    ...studioTextureCardStyles.grid,
  },
  categoryCard: {
    ...studioTextureCardStyles.card,
    cursor: "pointer",
  },
  categoryMeta: studioTextureCardStyles.meta,
  categoryTitle: {
    ...studioTextureCardStyles.title,
  },
  categoryAudience: {
    ...studioTextureCardStyles.audience,
  },
  categoryDetail: {
    ...studioTextureCardStyles.detail,
  },
  categoryAction: {
    ...studioTextureCardStyles.action,
  },
  discoveryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(520px, 100%), 0.95fr) minmax(min(420px, 100%), 1.05fr)",
    gap: 16,
    alignItems: "stretch",
  },
  listCard: {
    ...studioListCardStyles.panel,
  },
  listTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  listTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  listSub: {
    margin: "8px 0 0",
    fontSize: 13.5,
    lineHeight: 1.4,
    color: "var(--m-on-surface-mid)",
  },
  listAction: {
    all: "unset",
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(34, 47, 68, 0.86)",
    border: "0.5px solid rgba(255,255,255,0.28)",
    color: "#FFFFFF",
    boxShadow: studioLiquidGlassShadow,
    backdropFilter: studioLiquidGlassFilter,
    WebkitBackdropFilter: studioLiquidGlassFilter,
    fontSize: 12.5,
    fontWeight: 850,
    cursor: "pointer",
  },
  listStack: {
    ...studioListCardStyles.stack,
    marginTop: 0,
  },
  discoveryRow: {
    all: "unset",
    ...studioListCardStyles.row,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  rowIcon: {
    ...studioListCardStyles.icon,
  },
  rowText: {
    ...studioListCardStyles.body,
    fontSize: 13,
    lineHeight: 1.35,
  },
  rowPill: {
    ...studioListCardStyles.cleanPill,
    whiteSpace: "nowrap",
  },
  competesCard: {
    ...studioCompeteCardStyles.panel,
  },
  competeTitle: {
    margin: 0,
    color: "#1A2233",
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },
  competeGrid: {
    ...studioCompeteCardStyles.grid,
  },
  competeItem: {
    ...studioCompeteButtonItemStyles,
    color: "#60708A",
  },
};
