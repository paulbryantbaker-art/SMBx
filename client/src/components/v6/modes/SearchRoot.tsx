import { V6Icon } from "../icons";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Category {
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
    title: "Targets to buy",
    audience: "Thesis, geography, check size",
    detail: "Target read, source confidence, fit rationale, and first outreach angle.",
    texture: "",
    prompt: "Find acquisition targets from this thesis: recurring revenue, lower-middle-market services, owner transition risk acceptable.",
  },
  {
    title: "Buyers and buy-side",
    audience: "Strategics, sponsors, buyer pools",
    detail: "Buyer universe ranked by strategic fit, ability to close, and relationship angle.",
    texture: "",
    prompt: "Find likely buyers and buyer pools for Big Fake Deal. Rank strategic fit, ability to close, and relationship angle.",
  },
  {
    title: "PE and lenders",
    audience: "Sponsors, SBA, senior debt",
    detail: "Capital partners matched by mandate, check size, lender fit, and diligence ask.",
    texture: "",
    prompt: "Find PE firms, independent sponsors, and senior debt lenders relevant to this deal size and industry.",
  },
  {
    title: "Deal professionals",
    audience: "M&A counsel, QoE, tax, insurance",
    detail: "Provider shortlist with why-now context, fit rationale, and handoff instructions.",
    texture: "",
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
        "The output should become a sourced map of buyers, targets, capital providers, or deal professionals with evidence, fit rationale, outreach options, and next action options.",
        "",
        `**Search brief:** ${prompt}`,
      ].join("\n"),
    });
    ask(prompt);
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>

      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="pg-title">Search</div>
          <p className="pg-sub">
            Search here is not document search. It is market discovery: buyers, targets, capital, and the professionals who help users get deals reviewed and closed.
          </p>
        </div>
        <div className="pg-actions">
          <button
            className="wkbtn primary"
            type="button"
            onClick={() =>
              openDiscoverySurface(
                "Open a discovery map for my current sourcing work: buyers, targets, capital providers, and deal professionals grouped by thesis and next action options.",
                "Discovery map"
              )
            }
          >
            Open discovery map
          </button>
        </div>
      </div>

      {/* Example quick-launch pills */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 20 }}>
        {EXAMPLES.map(example => (
          <button
            key={example}
            className="wkbtn"
            type="button"
            onClick={() => openDiscoverySurface(`Run a market discovery search: ${example}`)}
          >
            {example}
          </button>
        ))}
      </div>

      {/* Market lanes section */}
      <div className="wksec">
        <div className="wksec-title">Market lanes</div>
        <p style={{ margin: "0 0 16px", color: "var(--ink-2)", fontSize: ".92rem", lineHeight: 1.5, maxWidth: "72ch" }}>
          Start broad, then let Yulia narrow by thesis, geography, check size, fit, and relationship angle.
        </p>
        <div className="wkgrid g4">
          {CATEGORIES.map(category => (
            <CategoryCard
              key={category.title}
              category={category}
              onClick={() => openDiscoverySurface(category.prompt, category.title)}
            />
          ))}
        </div>
      </div>

      {/* Recent searches + built-for section */}
      <div
        className="wksec"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(min(520px, 100%), 0.95fr) minmax(min(420px, 100%), 1.05fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Searches to reopen */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
            <div>
              <div className="wkcard-title">Searches to reopen</div>
              <div className="wkcard-sub">Recent market maps, buyer pools, lenders, and provider searches.</div>
            </div>
            <button
              className="wkbtn"
              type="button"
              style={{ whiteSpace: "nowrap" as const, flexShrink: 0 }}
              onClick={() =>
                openDiscoverySurface(
                  "Open a discovery map for my current sourcing work: buyers, targets, capital providers, and deal professionals grouped by thesis and next action options.",
                  "Discovery map"
                )
              }
            >
              Open map
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
            {DISCOVERY.map(row => (
              <button
                key={row.title}
                type="button"
                style={{
                  all: "unset" as const,
                  boxSizing: "border-box" as const,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line)",
                  cursor: "pointer",
                }}
                onClick={() => openDiscoverySurface(row.prompt, row.title)}
              >
                <span
                  style={{
                    flex: "none",
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink-2)",
                  }}
                >
                  <V6Icon name={row.icon} size={16} />
                </span>
                <span style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 2, minWidth: 0 }}>
                  <strong style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--ink)" }}>{row.title}</strong>
                  <span style={{ fontSize: ".8rem", color: "var(--ink-3)", lineHeight: 1.4 }}>{row.sub}</span>
                </span>
                <span
                  className="statpill missing"
                  style={{ whiteSpace: "nowrap" as const, fontFamily: "var(--font-mono)", fontSize: ".76rem" }}
                >
                  {row.pill}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Built for market work */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          <div className="wkcard-title">Built for market work that becomes deal work.</div>
          <div className="wkgrid g2" style={{ marginTop: 0 }}>
            {MARKET_STACK.map(item => (
              <button
                key={item.title}
                type="button"
                className="wkcard tap"
                style={{ padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 6, textAlign: "left" as const }}
                onClick={() => ask(`Use Search to build this market work product: ${item.title}. ${item.sub}`)}
              >
                <strong style={{ fontSize: ".9rem", fontWeight: 600, color: "var(--ink)" }}>{item.title}</strong>
                <span style={{ fontSize: ".82rem", color: "var(--ink-2)", lineHeight: 1.45 }}>{item.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      className="wkcard tap"
      style={{
        all: "unset" as const,
        boxSizing: "border-box" as const,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
        cursor: "pointer",
        transition: "border-color .18s, box-shadow .18s, transform .18s",
        textAlign: "left" as const,
        minHeight: 180,
      }}
      onClick={onClick}
    >
      <strong style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.15 }}>
        {category.title}
      </strong>
      <span style={{ fontSize: ".82rem", color: "var(--accent-strong)", fontWeight: 500 }}>
        {category.audience}
      </span>
      <span style={{ fontSize: ".82rem", color: "var(--ink-2)", lineHeight: 1.45, marginTop: 2, flex: 1 }}>
        {category.detail}
      </span>
      <span
        className="wkbtn"
        style={{ alignSelf: "flex-start" as const, marginTop: 4, padding: "5px 12px", fontSize: ".82rem" }}
      >
        Open
      </span>
    </button>
  );
}
