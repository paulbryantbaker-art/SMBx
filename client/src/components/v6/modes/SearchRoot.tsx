/**
 * Desktop Search — SAME items as mobile Search (SearchScreen), in desktop UI:
 *   search input · 6 discovery categories · quick starts.
 * Categories/prompts are the identical set mobile uses so the two match.
 */
import { useState } from "react";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

// Identical to mobile SearchScreen's category set.
const CATEGORIES = [
  { eyebrow: "BUYERS", title: "Potential buyers", sub: "Strategics, sponsors, family offices, buyer pools.", prompt: "Find likely buyers and buyer pools for a lower-middle-market services company. Include strategics, private equity, family offices, and search funds. Rank by fit and explain why each belongs." },
  { eyebrow: "TARGETS", title: "Targets to buy", sub: "Build a target list from a thesis.", prompt: "Help me define an acquisition thesis, then find target companies that match it. Start with sector, geography, size, recurring revenue, owner profile, and deal-breakers." },
  { eyebrow: "PE & CAPITAL", title: "PE and capital", sub: "Sponsors, independent sponsors, lenders.", prompt: "Find private equity firms, independent sponsors, family offices, and lenders relevant to this deal. Separate equity buyers from debt capital and compare them by likely appetite." },
  { eyebrow: "PROFESSIONALS", title: "Deal professionals", sub: "Attorneys, QoE, tax, insurance, brokers.", prompt: "Find deal professionals for this transaction: M&A attorneys, QoE providers, tax advisors, insurance brokers, and diligence specialists. Compare experience with lower-middle-market transactions." },
  { eyebrow: "REAL ESTATE", title: "Real estate & ops", sub: "Facilities, leases, agents, zoning help.", prompt: "Find real estate and operating specialists for this deal: commercial agents, lease reviewers, environmental diligence, facilities consultants, and zoning or permitting help." },
  { eyebrow: "MARKET MAPS", title: "Market maps", sub: "Competitors, adjacencies, roll-up themes.", prompt: "Build a market map for this thesis. Include competitors, adjacencies, roll-up themes, likely acquirers, and signals that a company may be ready to transact." },
] as const;

const QUICK_STARTS = [
  "Find buyers for my company",
  "Build a target list from a thesis",
  "Map PE firms active in this sector",
  "Find deal counsel and diligence help",
];

export function V6SearchRoot({ openTab, onTalkToYulia }: SearchRootProps) {
  const [query, setQuery] = useState("");

  const runSearch = (prompt: string, title = "Market discovery") => {
    const clean = prompt.trim();
    if (!clean) return;
    openTab({
      kind: "analysis",
      title,
      tool: "market_discovery",
      markdown: [`# ${title}`, "", "Yulia is opening this as a working market-discovery surface.", "", `**Search brief:** ${clean}`].join("\n"),
    });
    onTalkToYulia?.(`Run a market discovery search: ${clean}`);
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Search</div>
          <p className="pg-sub">Market discovery — buyers, targets, capital, and the professionals who help you close.</p>
        </div>
      </div>

      {/* Search composer */}
      <form
        onSubmit={e => { e.preventDefault(); runSearch(query); }}
        style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--ink-3)" strokeWidth="1.7" /><path d="M20 20l-3.5-3.5" stroke="var(--ink-3)" strokeWidth="1.7" strokeLinecap="round" /></svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Describe what you're looking for — buyers, targets, capital, advisors…"
          style={{ flex: 1, border: 0, background: "transparent", outline: "none", color: "var(--ink)", font: "inherit", fontSize: "0.95rem" }}
        />
        <button className="wkbtn primary" type="submit">Search</button>
      </form>

      {/* Categories — same 6 as mobile */}
      <div className="wksec">
        <div className="wksec-title">Start a discovery search</div>
        <div className="wkgrid g3" style={{ gap: 12, marginTop: 12 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.title}
              type="button"
              className="wkcard tap"
              style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 6, padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, minHeight: 132 }}
              onClick={() => runSearch(c.prompt, c.title)}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", letterSpacing: "0.1em", color: "var(--ink-3)", fontWeight: 600 }}>{c.eyebrow}</span>
              <strong style={{ color: "var(--ink)", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{c.title}</strong>
              <span style={{ color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.45, flex: 1 }}>{c.sub}</span>
              <span className="wkbtn" style={{ alignSelf: "flex-start", marginTop: 4, padding: "5px 12px", fontSize: "0.82rem" }}>Open</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick starts — same as mobile */}
      <div className="wksec" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", display: "grid", gridTemplateColumns: "minmax(180px, 0.4fr) minmax(0, 1fr)", gap: 20, alignItems: "center" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Quick starts.</div>
        <div className="ynext" style={{ margin: 0 }}>
          {QUICK_STARTS.map(prompt => (
            <button key={prompt} type="button" className="yn" onClick={() => runSearch(prompt)}>
              <span className="yn-t"><b>{prompt}</b></span>
              <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--accent-strong)" }}>↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
