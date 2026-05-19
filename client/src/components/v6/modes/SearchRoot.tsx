import { useState, type CSSProperties, type FormEvent } from "react";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { ART_HOUSE_TEXTURES, DESKTOP_TEXTURES } from "../../../lib/randomTextures";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Category {
  eyebrow: string;
  title: string;
  sub: string;
  tone: "gold" | "green" | "blue" | "ink" | "aqua";
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
    eyebrow: "OPPORTUNITIES",
    title: "Targets to buy",
    sub: "Define a thesis and let Yulia build the market map.",
    tone: "gold",
    texture: DESKTOP_TEXTURES.searchOpportunities,
    prompt: "Find acquisition targets from this thesis: recurring revenue, lower-middle-market services, owner transition risk acceptable.",
  },
  {
    eyebrow: "BUYERS",
    title: "Buyers and buy-side",
    sub: "Strategics, PE-backed platforms, family offices, and buyer pools.",
    tone: "ink",
    texture: DESKTOP_TEXTURES.searchBuyers,
    prompt: "Find likely buyers and buyer pools for Big Fake Deal. Rank strategic fit, ability to close, and relationship angle.",
  },
  {
    eyebrow: "CAPITAL",
    title: "PE and lenders",
    sub: "Sponsors, SBA lenders, senior debt, and flexible capital partners.",
    tone: "blue",
    texture: DESKTOP_TEXTURES.searchFinancing,
    prompt: "Find PE firms, independent sponsors, and senior debt lenders relevant to this deal size and industry.",
  },
  {
    eyebrow: "PROVIDERS",
    title: "Deal professionals",
    sub: "Attorneys, real estate, QoE, tax, insurance, and diligence help.",
    tone: "green",
    texture: DESKTOP_TEXTURES.searchProviders,
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

const LIQUID_GLASS_FILTER = "blur(5px) saturate(165%) contrast(1.08) brightness(1.04)";
const LIQUID_GLASS_BACKGROUND =
  "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.08))";
const LIQUID_GLASS_SHADOW =
  "0 18px 36px -24px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.56), inset 0 -1px 0 rgba(255,255,255,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.34)";
const SEARCH_ACTION_GLASS_BACKGROUND =
  "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.18), transparent 40%), linear-gradient(135deg, rgba(14,18,27,0.98), rgba(25,31,46,0.96) 52%, rgba(9,12,18,0.98))";
const STUDIO_SOFT_GLASS =
  "radial-gradient(circle at 18% 0%, rgba(255,255,255,.54), transparent 36%), linear-gradient(135deg, rgba(255,255,255,.58), rgba(245,250,255,.32) 50%, rgba(232,241,252,.20))";
const STUDIO_SOFT_SHADOW =
  "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)";

export function V6SearchRoot({ openTab, onTalkToYulia }: SearchRootProps) {
  const [query, setQuery] = useState("");

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

  const runSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    openDiscoverySurface(`Run a market discovery search: ${trimmed}`);
  };

  return (
    <div className="m-fade-up" style={S.page}>
      <section style={S.hero}>
        <div style={S.heroCopy}>
          <div className="mono" style={S.eyebrow}>SEARCH</div>
          <h1 style={S.title}>Find the other side of the market.</h1>
          <p style={S.sub}>
            Search here is not document search. It is market discovery: buyers, targets, capital, and the professionals who help deals close.
          </p>
        </div>

        <form onSubmit={runSearch} style={S.searchBox}>
          <V6Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Yulia to find buyers, targets, PE, lenders, or deal pros"
            style={S.input}
            aria-label="Market discovery search"
          />
          <button type="submit" style={S.searchButton}>Search</button>
        </form>

        <div style={S.examples}>
          {EXAMPLES.map(example => (
            <button key={example} className="m-glint m-glass-control" type="button" style={S.examplePill} onClick={() => { setQuery(example); openDiscoverySurface(`Run a market discovery search: ${example}`); }}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <section style={S.section}>
        <SectionTitle eyebrow="BROWSE" title="Categories" sub="Start broad, then let Yulia narrow by thesis, geography, check size, fit, and relationship angle." />
        <div style={S.categoryGrid}>
          {CATEGORIES.map(category => (
            <CategoryCard key={category.title} category={category} onClick={() => openDiscoverySurface(category.prompt, category.title)} />
          ))}
        </div>
      </section>

      <section style={S.discoveryGrid}>
        <div style={S.storyCard}>
          <div className="mono" style={S.storyEyebrow}>ASK YULIA</div>
          <h2 style={S.storyTitle}>What is worth sourcing this week?</h2>
          <p style={S.storySub}>Yulia can turn a thesis into ranked companies, likely buyers, capital providers, and outreach notes.</p>
          <button
            type="button"
            className="m-glint m-glass-control"
            style={S.storyButton}
            onClick={() => ask("What is worth sourcing this week based on my current pipeline and deal thesis?")}
          >
            Open the chat <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div style={S.listCard}>
          <div style={S.listTop}>
            <div>
              <div className="mono" style={S.listEyebrow}>RECENT DISCOVERY</div>
              <h2 style={S.listTitle}>Searches to reopen</h2>
            </div>
            <button
              className="m-btn tonal"
              type="button"
              onClick={() => {
                openDiscoverySurface("Open a discovery map for my current sourcing work: buyers, targets, capital providers, and deal professionals grouped by thesis and next action.", "Discovery map");
              }}
            >
              Open map
            </button>
          </div>

          {DISCOVERY.map((row, index) => (
            <button
              key={row.title}
              type="button"
              style={{ ...S.discoveryRow, borderBottom: index === DISCOVERY.length - 1 ? "none" : "1px solid var(--m-outline-var)" }}
              onClick={() => openDiscoverySurface(row.prompt, row.title)}
            >
              <span style={S.rowIcon}><V6Icon name={row.icon} size={18} /></span>
              <span style={S.rowText}>
                <strong>{row.title}</strong>
                <span>{row.sub}</span>
              </span>
              <span style={S.rowPill}>{row.pill}</span>
              <span style={S.chevron} aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={S.sectionHead}>
      <div className="mono" style={S.sectionEyebrow}>{eyebrow}</div>
      <h2 style={S.sectionTitle}>{title}</h2>
      <p style={S.sectionSub}>{sub}</p>
    </div>
  );
}

function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  const t = tone(category.tone);
  return (
    <article style={{ ...S.categoryCard, backgroundImage: t.bg(category.texture), color: t.fg, boxShadow: t.shadow }}>
      <span className="mono" style={S.categoryEyebrow}>{category.eyebrow}</span>
      <span style={S.categorySpacer} />
      <strong style={S.categoryTitle}>{category.title}</strong>
      <span style={S.categorySub}>{category.sub}</span>
      <button type="button" className="m-glint m-glass-control" style={S.categoryAction} onClick={onClick}>
        Open <span aria-hidden="true">›</span>
      </button>
    </article>
  );
}

function tone(name: Category["tone"]) {
  const tones: Record<Category["tone"], { bg: (texture: string) => string; fg: string; shadow: string }> = {
    gold: {
      bg: texture => `linear-gradient(145deg, rgba(107,73,22,0.42) 0%, rgba(198,148,72,0.30) 48%, rgba(57,40,24,0.52) 100%), url('${texture}')`,
      fg: "#FFFFFF",
      shadow: "0 18px 44px rgba(156,113,40,0.18), 0 6px 16px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    },
    green: {
      bg: texture => `linear-gradient(145deg, rgba(14,62,48,0.48) 0%, rgba(63,128,101,0.32) 52%, rgba(10,31,35,0.56) 100%), url('${texture}')`,
      fg: "#FFFFFF",
      shadow: "0 18px 44px rgba(46,111,89,0.18), 0 6px 16px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    },
    blue: {
      bg: texture => `linear-gradient(145deg, rgba(22,65,111,0.48) 0%, rgba(87,137,187,0.32) 50%, rgba(16,35,71,0.56) 100%), url('${texture}')`,
      fg: "#FFFFFF",
      shadow: "0 18px 44px rgba(46,92,138,0.18), 0 6px 16px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    },
    ink: {
      bg: texture => `linear-gradient(145deg, rgba(22,31,48,0.38) 0%, rgba(36,55,70,0.26) 48%, rgba(10,18,31,0.42) 100%), url('${texture}')`,
      fg: "#FFFFFF",
      shadow: "0 18px 44px rgba(18,23,34,0.18), 0 6px 16px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    },
    aqua: {
      bg: texture => `linear-gradient(145deg, rgba(29,100,108,0.48) 0%, rgba(83,151,157,0.32) 52%, rgba(20,52,68,0.56) 100%), url('${texture}')`,
      fg: "#FFFFFF",
      shadow: "0 18px 44px rgba(57,123,133,0.18), 0 6px 16px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    },
  };
  return tones[name];
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
    padding: 30,
    borderRadius: 26,
    backgroundImage: `linear-gradient(135deg, rgba(20, 83, 77, 0.84) 0%, rgba(49, 113, 95, 0.66) 52%, rgba(214, 163, 92, 0.36) 100%), url('${DESKTOP_TEXTURES.searchHero}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "0 46px 116px rgba(26, 84, 70, 0.30), 0 20px 46px rgba(26,34,51,0.16), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
    marginBottom: 34,
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
    margin: "8px 0 0",
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
  searchBox: {
    marginTop: 26,
    maxWidth: 900,
    height: 58,
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    padding: "0 10px 0 18px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.94)",
    color: "rgba(26,34,51,0.62)",
    border: "1px solid rgba(255,255,255,0.58)",
    boxShadow: "0 20px 44px rgba(15, 57, 52, 0.20)",
  },
  input: {
    minWidth: 0,
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 16,
    color: "var(--m-on-surface)",
  },
  searchButton: {
    all: "unset",
    height: 40,
    padding: "0 16px",
    borderRadius: 999,
    background: SEARCH_ACTION_GLASS_BACKGROUND,
    border: "0.5px solid rgba(255,255,255,0.54)",
    color: "var(--m-on-primary)",
    boxShadow: LIQUID_GLASS_SHADOW,
    backdropFilter: LIQUID_GLASS_FILTER,
    WebkitBackdropFilter: LIQUID_GLASS_FILTER,
    fontWeight: 800,
    cursor: "pointer",
  },
  examples: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  examplePill: {
    all: "unset",
    padding: "9px 14px",
    borderRadius: 999,
    background: LIQUID_GLASS_BACKGROUND,
    border: "0.5px solid rgba(255,255,255,0.52)",
    color: "#FFFFFF",
    boxShadow: LIQUID_GLASS_SHADOW,
    backdropFilter: LIQUID_GLASS_FILTER,
    WebkitBackdropFilter: LIQUID_GLASS_FILTER,
    fontSize: 12.5,
    fontWeight: 800,
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
    margin: "4px 0 0",
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  categoryCard: {
    all: "unset",
    minHeight: 206,
    borderRadius: 18,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "default",
    border: "1px solid rgba(255,255,255,0.36)",
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow: "0 18px 44px rgba(42,65,96,.14), inset 0 1px 0 rgba(255,255,255,.28)",
  },
  categoryEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
    opacity: 1,
  },
  categorySpacer: {
    flex: 1,
  },
  categoryTitle: {
    display: "block",
    fontSize: 24,
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
  },
  categorySub: {
    display: "block",
    marginTop: 10,
    maxWidth: 310,
    fontSize: 13.5,
    lineHeight: 1.45,
    color: "#FFFFFF",
    opacity: 1,
  },
  categoryAction: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 18,
    minWidth: 84,
    height: 40,
    padding: "0 15px",
    borderRadius: 999,
    background: LIQUID_GLASS_BACKGROUND,
    border: "0.5px solid rgba(255,255,255,0.52)",
    color: "#FFFFFF",
    boxShadow: LIQUID_GLASS_SHADOW,
    backdropFilter: LIQUID_GLASS_FILTER,
    WebkitBackdropFilter: LIQUID_GLASS_FILTER,
    fontSize: 13,
    fontWeight: 850,
    cursor: "pointer",
  },
  discoveryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 0.75fr) minmax(420px, 1.25fr)",
    gap: 16,
    alignItems: "stretch",
  },
  storyCard: {
    minHeight: 292,
    borderRadius: 24,
    padding: 24,
    backgroundImage: `radial-gradient(circle at 8% 18%, rgba(255,255,255,0.18), transparent 42%), linear-gradient(145deg, rgba(42,103,88,0.26) 0%, rgba(42,78,86,0.30) 46%, rgba(22,32,50,0.46) 100%), url('${ART_HOUSE_TEXTURES.search}')`,
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "center, center, center",
    color: "#FFFFFF",
    boxShadow: "0 28px 74px rgba(26, 84, 70, 0.20), 0 10px 24px rgba(26,34,51,0.10), inset 0 1px 0 rgba(255,255,255,0.24)",
  },
  storyEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
    opacity: 1,
  },
  storyTitle: {
    margin: "24px 0 0",
    maxWidth: 440,
    fontSize: 36,
    lineHeight: 0.98,
    letterSpacing: "-0.055em",
    textWrap: "balance",
    color: "#FFFFFF",
  },
  storySub: {
    margin: "16px 0 0",
    maxWidth: 420,
    fontSize: 15,
    lineHeight: 1.55,
    color: "#FFFFFF",
    opacity: 1,
  },
  storyButton: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    marginTop: 28,
    height: 42,
    padding: "0 16px",
    borderRadius: 999,
    border: "0.5px solid rgba(255,255,255,0.52)",
    background: LIQUID_GLASS_BACKGROUND,
    color: "#FFFFFF",
    boxShadow: LIQUID_GLASS_SHADOW,
    backdropFilter: LIQUID_GLASS_FILTER,
    WebkitBackdropFilter: LIQUID_GLASS_FILTER,
    fontWeight: 850,
    cursor: "pointer",
  },
  listCard: {
    borderRadius: 24,
    background: STUDIO_SOFT_GLASS,
    border: "1px solid rgba(255,255,255,.55)",
    boxShadow: STUDIO_SOFT_SHADOW,
    backdropFilter: "blur(22px) saturate(155%)",
    WebkitBackdropFilter: "blur(22px) saturate(155%)",
    overflow: "hidden",
  },
  listTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "24px 24px 8px",
  },
  listEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  listTitle: {
    margin: "4px 0 0",
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  discoveryRow: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "46px minmax(0, 1fr) auto 20px",
    alignItems: "center",
    gap: 14,
    width: "100%",
    minHeight: 74,
    boxSizing: "border-box",
    padding: "12px 22px",
    cursor: "pointer",
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  rowText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 12.5,
    color: "var(--m-on-surface-mid)",
    lineHeight: 1.35,
  },
  rowPill: {
    borderRadius: 999,
    padding: "7px 11px",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    fontWeight: 850,
    whiteSpace: "nowrap",
  },
  chevron: {
    color: "var(--m-on-surface-mid)",
    fontSize: 28,
    lineHeight: 1,
  },
};
