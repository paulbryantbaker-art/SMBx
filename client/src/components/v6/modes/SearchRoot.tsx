import { useState, type CSSProperties, type FormEvent } from "react";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { RANDOM_TEXTURES } from "../../../lib/randomTextures";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Category {
  eyebrow: string;
  title: string;
  sub: string;
  tone: "gold" | "purple" | "green" | "blue" | "ink" | "aqua";
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
    prompt: "Find acquisition targets from this thesis: recurring revenue, lower-middle-market services, owner transition risk acceptable.",
  },
  {
    eyebrow: "BUYERS",
    title: "Buyers and buy-side",
    sub: "Strategics, PE-backed platforms, family offices, and buyer pools.",
    tone: "purple",
    prompt: "Find likely buyers and buyer pools for Big Fake Deal. Rank strategic fit, ability to close, and relationship angle.",
  },
  {
    eyebrow: "CAPITAL",
    title: "PE and lenders",
    sub: "Sponsors, SBA lenders, senior debt, and flexible capital partners.",
    tone: "blue",
    prompt: "Find PE firms, independent sponsors, and senior debt lenders relevant to this deal size and industry.",
  },
  {
    eyebrow: "PROVIDERS",
    title: "Deal professionals",
    sub: "Attorneys, real estate, QoE, tax, insurance, and diligence help.",
    tone: "green",
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

export function V6SearchRoot({ openTab, onTalkToYulia }: SearchRootProps) {
  const [query, setQuery] = useState("");

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const runSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    ask(`Run a market discovery search: ${trimmed}`);
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
            <button key={example} type="button" style={S.examplePill} onClick={() => { setQuery(example); ask(`Run a market discovery search: ${example}`); }}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <section style={S.section}>
        <SectionTitle eyebrow="BROWSE" title="Categories" sub="Start broad, then let Yulia narrow by thesis, geography, check size, fit, and relationship angle." />
        <div style={S.categoryGrid}>
          {CATEGORIES.map(category => (
            <CategoryCard key={category.title} category={category} onClick={() => ask(category.prompt)} />
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
              onClick={() => openTab({ kind: "analysis", title: "Discovery map" })}
            >
              Open map
            </button>
          </div>

          {DISCOVERY.map((row, index) => (
            <button
              key={row.title}
              type="button"
              style={{ ...S.discoveryRow, borderBottom: index === DISCOVERY.length - 1 ? "none" : "1px solid var(--m-outline-var)" }}
              onClick={() => ask(row.prompt)}
            >
              <span style={S.rowIcon}><V6Icon name={row.icon} size={16} /></span>
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
    <button type="button" style={{ ...S.categoryCard, background: t.bg, color: t.fg, boxShadow: t.shadow }} onClick={onClick}>
      <span className="mono" style={S.categoryEyebrow}>{category.eyebrow}</span>
      <span style={S.categorySpacer} />
      <strong style={S.categoryTitle}>{category.title}</strong>
      <span style={S.categorySub}>{category.sub}</span>
    </button>
  );
}

function tone(name: Category["tone"]) {
  const tones: Record<Category["tone"], { bg: string; fg: string; shadow: string }> = {
    gold: {
      bg: `linear-gradient(145deg, rgba(214,163,92,0.42) 0%, rgba(156,113,40,0.78) 100%), url('${RANDOM_TEXTURES.card}')`,
      fg: "#fffaf3",
      shadow: "0 24px 54px rgba(156,113,40,0.22)",
    },
    purple: {
      bg: `linear-gradient(145deg, rgba(138,154,232,0.46) 0%, rgba(81,70,159,0.78) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
      fg: "#fff",
      shadow: "0 24px 54px rgba(79,96,189,0.22)",
    },
    green: {
      bg: `linear-gradient(145deg, rgba(98,153,135,0.48) 0%, rgba(46,111,89,0.78) 100%), url('${RANDOM_TEXTURES.cardPursue}')`,
      fg: "#F8FFFB",
      shadow: "0 24px 54px rgba(46,111,89,0.20)",
    },
    blue: {
      bg: `linear-gradient(145deg, rgba(127,168,217,0.48) 0%, rgba(46,92,138,0.78) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
      fg: "#fff",
      shadow: "0 24px 54px rgba(46,92,138,0.20)",
    },
    ink: {
      bg: "linear-gradient(145deg, #252B3B 0%, #121722 100%)",
      fg: "#fff",
      shadow: "0 24px 54px rgba(18,23,34,0.22)",
    },
    aqua: {
      bg: "linear-gradient(145deg, #88C7C7 0%, #397B85 100%)",
      fg: "#fff",
      shadow: "0 24px 54px rgba(57,123,133,0.20)",
    },
  };
  return tones[name];
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    position: "relative",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: 30,
    borderRadius: 26,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(242,245,255,0.78) 62%, rgba(238,241,251,0.60) 100%), url('${RANDOM_TEXTURES.baseline}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
    marginBottom: 34,
  },
  heroCopy: {
    maxWidth: 860,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  title: {
    margin: "8px 0 0",
    fontSize: "clamp(44px, 5vw, 72px)",
    lineHeight: 0.92,
    letterSpacing: "-0.06em",
    textWrap: "balance",
    color: "var(--m-on-surface)",
  },
  sub: {
    margin: "16px 0 0",
    maxWidth: 680,
    fontSize: 16,
    lineHeight: 1.55,
    color: "var(--m-on-surface-var)",
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
    background: "#FFFFFF",
    color: "var(--m-on-surface-mid)",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "0 14px 34px rgba(26,34,51,0.08)",
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
    background: "var(--m-primary)",
    color: "var(--m-on-primary)",
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
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.68)",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    fontWeight: 700,
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
    gap: 16,
  },
  categoryCard: {
    all: "unset",
    minHeight: 230,
    borderRadius: 24,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.36)",
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
  },
  categoryEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    opacity: 0.88,
  },
  categorySpacer: {
    flex: 1,
  },
  categoryTitle: {
    display: "block",
    fontSize: 28,
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
  },
  categorySub: {
    display: "block",
    marginTop: 10,
    maxWidth: 310,
    fontSize: 13.5,
    lineHeight: 1.45,
    opacity: 0.82,
  },
  discoveryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 0.75fr) minmax(420px, 1.25fr)",
    gap: 18,
    alignItems: "stretch",
  },
  storyCard: {
    minHeight: 332,
    borderRadius: 26,
    padding: 28,
    backgroundImage: `linear-gradient(145deg, rgba(138,154,232,0.48) 0%, rgba(79,96,189,0.78) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    color: "#fff",
    boxShadow: "0 24px 58px rgba(79,96,189,0.24)",
  },
  storyEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    opacity: 0.84,
  },
  storyTitle: {
    margin: "34px 0 0",
    maxWidth: 440,
    fontSize: 42,
    lineHeight: 0.98,
    letterSpacing: "-0.055em",
    textWrap: "balance",
  },
  storySub: {
    margin: "16px 0 0",
    maxWidth: 420,
    fontSize: 15,
    lineHeight: 1.55,
    opacity: 0.86,
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
    border: "1px solid rgba(255,255,255,0.45)",
    background: "rgba(255,255,255,0.16)",
    fontWeight: 850,
    cursor: "pointer",
  },
  listCard: {
    borderRadius: 26,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,255,0.82)), url('${RANDOM_TEXTURES.card}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
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
    minHeight: 84,
    boxSizing: "border-box",
    padding: "14px 24px",
    cursor: "pointer",
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
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
