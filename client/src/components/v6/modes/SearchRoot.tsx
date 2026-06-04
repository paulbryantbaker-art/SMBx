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
    prompt: "Find likely buyers and buyer pools for my active deal. Rank strategic fit, ability to close, and relationship angle.",
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
