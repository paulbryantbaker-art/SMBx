/**
 * Desktop Search — SAME items as mobile Search (SearchScreen), in desktop UI:
 *   search input · 6 discovery categories · quick starts.
 * Categories/prompts are the identical set mobile uses so the two match.
 */
import { useMemo, useState } from "react";
import { Handshake, Crosshair, Landmark, Scale, Building2, Map as MapIcon } from "lucide-react";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
import { RANDOM_TEXTURES } from "../../../lib/randomTextures";

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

/* Watercolor ornament chips per discovery domain — mobile's categoryTones
 * recipes (LibrarySearch) as 40px tint-over-texture tiles. Legal under the
 * ≤64px ornament exemption (Search has no texture field); no glow at chip
 * scale. The old mono-caps eyebrows are gone (eyebrow lock) — the chip now
 * carries the category identity the label used to shout. */
const CATEGORY_TONE: Record<string, string> = {
  purple: `linear-gradient(160deg, rgba(125,98,170,0.30) 0%, rgba(75,52,128,0.62) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
  sage: `linear-gradient(160deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%), url('${RANDOM_TEXTURES.cardPursue}')`,
  gold: `linear-gradient(160deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%), url('${RANDOM_TEXTURES.card}')`,
  plum: `linear-gradient(160deg, rgba(168,90,124,0.30) 0%, rgba(108,46,76,0.62) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
  slate: `linear-gradient(160deg, rgba(70,90,110,0.30) 0%, rgba(34,48,68,0.66) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
  blue: `linear-gradient(160deg, rgba(60,108,168,0.30) 0%, rgba(25,68,118,0.62) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
};

// Identical to mobile SearchScreen's category set.
const CATEGORIES = [
  { tone: "purple", icon: Handshake, title: "Potential buyers", sub: "Strategics, sponsors, family offices, buyer pools.", prompt: "Find likely buyers and buyer pools for a lower-middle-market services company. Include strategics, private equity, family offices, and search funds. Rank by fit and explain why each belongs." },
  { tone: "sage", icon: Crosshair, title: "Targets to buy", sub: "Build a target list from a thesis.", prompt: "Help me define an acquisition thesis, then find target companies that match it. Start with sector, geography, size, recurring revenue, owner profile, and deal-breakers." },
  { tone: "gold", icon: Landmark, title: "PE and capital", sub: "Sponsors, independent sponsors, lenders.", prompt: "Find private equity firms, independent sponsors, family offices, and lenders relevant to this deal. Separate equity buyers from debt capital and compare them by likely appetite." },
  { tone: "plum", icon: Scale, title: "Deal professionals", sub: "Attorneys, QoE, tax, insurance, brokers.", prompt: "Find deal professionals for this transaction: M&A attorneys, QoE providers, tax advisors, insurance brokers, and diligence specialists. Compare experience with lower-middle-market transactions." },
  { tone: "slate", icon: Building2, title: "Real estate & ops", sub: "Facilities, leases, agents, zoning help.", prompt: "Find real estate and operating specialists for this deal: commercial agents, lease reviewers, environmental diligence, facilities consultants, and zoning or permitting help." },
  { tone: "blue", icon: MapIcon, title: "Market maps", sub: "Competitors, adjacencies, roll-up themes.", prompt: "Build a market map for this thesis. Include competitors, adjacencies, roll-up themes, likely acquirers, and signals that a company may be ready to transact." },
] as const;

const QUICK_STARTS = [
  "Find buyers for my company",
  "Build a target list from a thesis",
  "Map PE firms active in this sector",
  "Find deal counsel and diligence help",
];

export function V6SearchRoot({ openTab, onTalkToYulia, user }: SearchRootProps) {
  const [query, setQuery] = useState("");
  // Workspace scorecard — the page must prove the desk knows what the user
  // is sourcing FOR before offering a generic category picker.
  const workspace = useV6WorkspaceData(user);
  const activeDeals = workspace.deals.filter(d => (d.status || "").toLowerCase() === "active");
  // Median fit over the SAME active set the scorecard counts. True median:
  // average the two middles on an even count (not the upper-middle alone).
  const fitVals = activeDeals
    .map(d => d.seven_factor_composite)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
    .sort((a, b) => a - b);
  const medianFit = fitVals.length
    ? Math.round(
        fitVals.length % 2
          ? fitVals[(fitVals.length - 1) / 2]
          : (fitVals[fitVals.length / 2 - 1] + fitVals[fitVals.length / 2]) / 2,
      )
    : null;
  const topIndustries = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of workspace.deals) { const i = (d.industry || "").trim(); if (i) m.set(i, (m.get(i) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i);
  }, [workspace.deals]);

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

      {/* Workspace scorecard — grounds the search in the real portfolio so
          the page isn't identical for a 0-deal and a 10-deal user. */}
      {activeDeals.length > 0 && (
        <div className="mhead" style={{ marginTop: 16 }}>
          <div className="mh">
            <div className="l">Sourcing for</div>
            <div className="v">{activeDeals.length}</div>
            <div className="s">active deal{activeDeals.length === 1 ? "" : "s"}</div>
          </div>
          {medianFit !== null && (
            <div className="mh">
              <div className="l">Median fit</div>
              <div className="v">{medianFit}</div>
            </div>
          )}
          {topIndustries.length > 0 && (
            <div className="mh" style={{ flex: "2 1 240px" }}>
              <div className="l">Your sectors</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {topIndustries.map(ind => (
                  <button
                    key={ind}
                    type="button"
                    className="wk-tap"
                    onClick={() => runSearch(`Find buyers, comps, and targets for the ${ind} sector — ground it in sources.`, `${ind} discovery`)}
                    style={{ appearance: "none", border: 0, cursor: "pointer", padding: "4px 11px", borderRadius: 999, background: "var(--wk-peri-soft)", color: "var(--wk-peri-ink)", fontSize: "0.78rem", fontWeight: 700 }}
                  >
                    {ind} ›
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories — same 6 as mobile */}
      <div className="wksec">
        <div className="wksec-title">Start a discovery search</div>
        <div className="wkgrid g3" style={{ gap: 12, marginTop: 12 }}>
          {CATEGORIES.map(c => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                type="button"
                className="wkcard tap"
                style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8, padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, minHeight: 138 }}
                onClick={() => runSearch(c.prompt, c.title)}
              >
                <span
                  aria-hidden
                  style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: CATEGORY_TONE[c.tone],
                    backgroundSize: "cover", backgroundPosition: "center",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", flexShrink: 0,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.22)",
                  }}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <strong style={{ color: "var(--ink)", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{c.title}</strong>
                <span style={{ color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.45, flex: 1 }}>{c.sub}</span>
                {/* Periwinkle = the discovery/navigation accent (mobile's
                    explore register) — never a verdict, never a number. */}
                <span style={{ alignSelf: "flex-start", marginTop: 4, padding: "5px 14px", fontSize: "0.82rem", fontWeight: 700, borderRadius: 999, background: "var(--wk-peri-soft)", color: "var(--wk-peri-ink)" }}>Open</span>
              </button>
            );
          })}
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
