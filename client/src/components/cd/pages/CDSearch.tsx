/**
 * CDSearch — the Claude Design "Market Intelligence" search/discovery page,
 * ported into the real app and wired to LIVE data. Mounts under `.cd-root`.
 *
 * The page is Portfolio › Market search. It leads with discovery prompts
 * DERIVED from the user's real active pipeline (the gap-ranked logic from
 * SearchRoot.tsx is preserved), each carrying the real market-heat read for
 * that sector and routing to Yulia. Below that sit the evergreen category
 * grid and quick starts. Every value is real (useV6WorkspaceData +
 * /api/intelligence/portfolio-heat) or honestly empty — zero fabrication.
 *
 * The CD mockup (marketintel.jsx) is the VISUAL target only; its window.MA_*
 * demo arrays are never used. Atoms/charts come from the shared CD kit.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import {
  CDIcon,
  CDPill,
  CDCard,
  CDDivider,
  CDLeagueBadge,
  CDHeatBar,
  CDDirGlyph,
  cdDealColor,
} from "../kit/cdUi";

/* ─── props (match what Canvas passes the other CD pages) ──────── */
interface CDSearchProps {
  user: User | null;
  openTab: (t: any) => void;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: any;
}

/* ─── market-heat row from /api/intelligence/portfolio-heat ───── */
interface MarketHeat {
  industry: string;
  score: number; // 1–5
  label: string;
  peActivity: string;
  multipleDirection: string;
  signals: string[];
}

/* ─── evergreen discovery categories (parity with SearchRoot) ──── */
type CategoryTone = "accent" | "pos" | "warn" | "neg" | "neutral";
interface Category {
  tone: CategoryTone;
  icon: string;
  title: string;
  sub: string;
  prompt: string;
}
const CATEGORIES: Category[] = [
  {
    tone: "accent",
    icon: "share",
    title: "Potential buyers",
    sub: "Strategics, sponsors, family offices, buyer pools.",
    prompt:
      "Find likely buyers and buyer pools for a lower-middle-market services company. Include strategics, private equity, family offices, and search funds. Rank by fit and explain why each belongs.",
  },
  {
    tone: "pos",
    icon: "filter",
    title: "Targets to buy",
    sub: "Build a target list from a thesis.",
    prompt:
      "Help me define an acquisition thesis, then find target companies that match it. Start with sector, geography, size, recurring revenue, owner profile, and deal-breakers.",
  },
  {
    tone: "warn",
    icon: "portfolio",
    title: "PE and capital",
    sub: "Sponsors, independent sponsors, lenders.",
    prompt:
      "Find private equity firms, independent sponsors, family offices, and lenders relevant to this deal. Separate equity buyers from debt capital and compare them by likely appetite.",
  },
  {
    tone: "neutral",
    icon: "flag",
    title: "Deal professionals",
    sub: "Attorneys, QoE, tax, insurance, brokers.",
    prompt:
      "Find deal professionals for this transaction: M&A attorneys, QoE providers, tax advisors, insurance brokers, and diligence specialists. Compare experience with lower-middle-market transactions.",
  },
  {
    tone: "neutral",
    icon: "grid",
    title: "Real estate & ops",
    sub: "Facilities, leases, agents, zoning help.",
    prompt:
      "Find real estate and operating specialists for this deal: commercial agents, lease reviewers, environmental diligence, facilities consultants, and zoning or permitting help.",
  },
  {
    tone: "accent",
    icon: "scenario",
    title: "Market maps",
    sub: "Competitors, adjacencies, roll-up themes.",
    prompt:
      "Build a market map for this thesis. Include competitors, adjacencies, roll-up themes, likely acquirers, and signals that a company may be ready to transact.",
  },
];

const QUICK_STARTS = [
  "Find buyers for my company",
  "Build a target list from a thesis",
  "Map PE firms active in this sector",
  "Find deal counsel and diligence help",
];

/* ─── the page ─────────────────────────────────────────────────── */
export function CDSearch({ user, openTab, onTalkToYulia }: CDSearchProps) {
  const workspace = useV6WorkspaceData(user);
  const [query, setQuery] = useState("");
  const [heat, setHeat] = useState<Record<string, MarketHeat>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/intelligence/portfolio-heat", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { heat?: MarketHeat[] }) => {
        if (cancelled) return;
        const m: Record<string, MarketHeat> = {};
        for (const h of d.heat ?? []) m[h.industry.toLowerCase().trim()] = h;
        setHeat(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /* active set — what the desk is actually sourcing FOR */
  const activeDeals = useMemo(
    () => workspace.deals.filter((d) => (d.status || "").toLowerCase() === "active"),
    [workspace.deals],
  );

  /* median fit over the active set (true median, both middles on an even count) */
  const medianFit = useMemo(() => {
    const vals = activeDeals
      .map((d) => d.seven_factor_composite)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
      .sort((a, b) => a - b);
    if (!vals.length) return null;
    return Math.round(
      vals.length % 2
        ? vals[(vals.length - 1) / 2]
        : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2,
    );
  }, [activeDeals]);

  /* the sectors the book lives in (most-represented first) */
  const topSectors = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of workspace.deals) {
      const i = (d.industry || "").trim();
      if (i) m.set(i, (m.get(i) || 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [workspace.deals]);

  /* route to Yulia as a working market-discovery surface (preserve SearchRoot) */
  const runSearch = (prompt: string, title = "Market discovery") => {
    const clean = prompt.trim();
    if (!clean) return;
    openTab({
      kind: "analysis",
      title,
      tool: "market_discovery",
      markdown: [
        `# ${title}`,
        "",
        "Yulia is opening this as a working market-discovery surface.",
        "",
        `**Search brief:** ${clean}`,
      ].join("\n"),
    });
    onTalkToYulia?.(`Run a market discovery search: ${clean}`);
  };

  const heatFor = (industry: string | null | undefined): MarketHeat | null =>
    heat[(industry || "").toLowerCase().trim()] || null;

  const loading = workspace.canFetch && workspace.loading && activeDeals.length === 0;

  return (
    <div
      className="cd-root cd-scrollable"
      style={{
        background: "var(--cd-canvas)",
        height: "100%",
        overflow: "auto",
        padding: "30px 34px 60px",
        display: "flex",
        flexDirection: "column",
        gap: "var(--cd-gap)",
      }}
    >
      {/* editorial header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--cd-serif)",
            fontWeight: 600,
            fontSize: 36,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          Market <span style={{ fontStyle: "italic" }}>search</span>.
        </h1>
        <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14.5, maxWidth: 640 }}>
          Buyers, targets, capital, and the professionals who help you close — grounded in what your
          book is sourcing for.
        </p>
      </div>

      {/* search composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "11px 14px",
          background: "var(--cd-surface)",
          border: "1px solid var(--cd-line)",
          borderRadius: "var(--cd-r-lg)",
          boxShadow: "var(--cd-shadow-sm)",
        }}
      >
        <CDIcon name="search" size={18} color="var(--cd-ink-3)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for — buyers, targets, capital, advisors…"
          style={{
            flex: 1,
            border: 0,
            background: "transparent",
            outline: "none",
            color: "var(--cd-ink)",
            fontFamily: "var(--cd-sans)",
            fontSize: 14.5,
          }}
        />
        <button
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "var(--cd-accent)",
            color: "white",
            border: "none",
            borderRadius: "var(--cd-r-md)",
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--cd-sans)",
            flexShrink: 0,
          }}
        >
          <CDIcon name="sparkle" size={14} color="white" />
          Search
        </button>
      </form>

      {/* sourcing scorecard — grounds the page in the real portfolio */}
      {activeDeals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--cd-gap)" }}>
          <ScoreStat label="Sourcing for" value={String(activeDeals.length)} sub={`active deal${activeDeals.length === 1 ? "" : "s"}`} />
          <ScoreStat
            label="Median fit"
            value={medianFit !== null ? String(medianFit) : "—"}
            sub={medianFit !== null ? "across the book" : "not scored yet"}
          />
          <ScoreStat
            label="Sectors in play"
            value={String(topSectors.length)}
            sub={topSectors.length ? topSectors.map((s) => s.name).slice(0, 2).join(", ") : "—"}
          />
        </div>
      )}

      {/* ⭐ portfolio-derived discovery — ranked by what the book needs sourced.
          Each card carries the REAL market-heat read for that deal's sector. */}
      {loading ? (
        <CDCard>
          <div className="cd-skel" style={{ height: 96 }} />
        </CDCard>
      ) : activeDeals.length > 0 ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
                Discover for your pipeline
              </h2>
              <CDPill tone="accent">
                <CDIcon name="sparkle" size={12} color="var(--cd-accent)" />
                Built from your deals
              </CDPill>
            </div>
            <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>
              buyer universe · comps · sector pros
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--cd-gap)" }}>
            {rankDeals(activeDeals, heat)
              .slice(0, 4)
              .map((d) => (
                <DiscoveryCard
                  key={d.id}
                  deal={d}
                  heat={heatFor(d.industry)}
                  onRun={() => {
                    const name = d.business_name || `Deal #${d.id}`;
                    const sector = d.industry || "this sector";
                    runSearch(
                      `For ${name} (${sector}${d.location ? `, ${d.location}` : ""}), map the active buyer universe, recent comparable transactions, and the deal professionals working this sector. Ground it in sources.`,
                      `${name} discovery`,
                    );
                  }}
                  onOpen={() =>
                    openTab({ kind: "deal", id: String(d.id), title: d.business_name || `Deal #${d.id}` })
                  }
                />
              ))}
          </div>
        </>
      ) : (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)", padding: "26px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cd-ink)", marginBottom: 6 }}>
            No active mandates to source for yet.
          </div>
          <div style={{ fontSize: 13, color: "var(--cd-ink-3)" }}>
            Start a discovery search below, or open a deal with Yulia to ground search in your book.
          </div>
        </CDCard>
      )}

      {/* evergreen categories — demoted below the portfolio-derived prompts */}
      <CDDivider label={activeDeals.length > 0 ? "Or start from a category" : "Start a discovery search"} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--cd-gap)" }}>
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.title} cat={c} onRun={() => runSearch(c.prompt, c.title)} />
        ))}
      </div>

      {/* quick starts */}
      <CDCard style={{ marginTop: 4 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px, 0.35fr) minmax(0, 1fr)",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--cd-ink)", lineHeight: 1.1 }}>
            Quick starts.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {QUICK_STARTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => runSearch(prompt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  padding: "11px 13px",
                  background: "var(--cd-surface-2)",
                  border: "1px solid var(--cd-line)",
                  borderRadius: "var(--cd-r-md)",
                  cursor: "pointer",
                  fontFamily: "var(--cd-sans)",
                }}
              >
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--cd-ink)" }}>{prompt}</span>
                <CDIcon name="arrowup" size={13} color="var(--cd-accent-strong)" style={{ transform: "rotate(45deg)" }} />
              </button>
            ))}
          </div>
        </div>
      </CDCard>

      {/* THE LINE — discovery routes to Yulia; she shows the field, not a verdict */}
      <div style={{ fontSize: 10.5, color: "var(--cd-ink-4)", marginTop: 2 }}>
        Search opens a working surface with Yulia — she maps the field and the sources, not a transaction recommendation.
      </div>
    </div>
  );
}

/* ─── rank active deals by sourcing urgency ─────────────────────
   Surface the deals that most need the market worked: hotter sectors
   (more buyers / expanding multiples) rank up, then lower-fit deals
   (more ground to cover). Deals with NO heat read fall to honest
   neutral — never fabricated to inflate a rank. */
function rankDeals(deals: WorkspaceDeal[], heat: Record<string, MarketHeat>): WorkspaceDeal[] {
  const score = (d: WorkspaceDeal) => {
    const h = heat[(d.industry || "").toLowerCase().trim()];
    const heatScore = h ? h.score : 0; // 0 when no honest read
    const fit = typeof d.seven_factor_composite === "number" ? d.seven_factor_composite : 50;
    // hot sector first, then where there's more fit-gap to close
    return heatScore * 100 + (100 - fit);
  };
  return [...deals].sort((a, b) => score(b) - score(a));
}

/* ─── a portfolio-derived discovery card ────────────────────────── */
function DiscoveryCard({
  deal,
  heat,
  onRun,
  onOpen,
}: {
  deal: WorkspaceDeal;
  heat: MarketHeat | null;
  onRun: () => void;
  onOpen: () => void;
}) {
  const color = cdDealColor(deal.id);
  const name = deal.business_name || `Deal #${deal.id}`;
  const sector = deal.industry || "—";
  const league = parseInt(String(deal.league || "").replace(/\D/g, ""), 10) || 1;

  return (
    <div
      style={{
        background: "var(--cd-surface)",
        border: "1px solid var(--cd-line)",
        borderRadius: "var(--cd-r-lg)",
        boxShadow: "var(--cd-shadow-md)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* header — sector-tinted */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "13px 16px",
          borderBottom: "1px solid var(--cd-line)",
          background: `linear-gradient(100deg, color-mix(in oklch, ${color}, transparent 93%), var(--cd-surface) 62%)`,
        }}
      >
        <span style={{ width: 8, height: 30, borderRadius: 3, background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onOpen}
              style={{
                margin: 0,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "var(--cd-sans)",
                fontSize: 14.5,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "var(--cd-ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {name}
            </button>
            <CDLeagueBadge league={league} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[sector, deal.location].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      {/* market read — real heat for the sector, or honest empty */}
      <div style={{ padding: "13px 16px", flex: 1 }}>
        <div className="cd-eyebrow" style={{ marginBottom: 9 }}>Sector market read</div>
        {heat ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <CDHeatBar heat={heat.score * 20} />
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{heat.label}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--cd-ink-2)" }}>
                <CDDirGlyph dir={heat.multipleDirection} />
                multiples {heat.multipleDirection}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--cd-ink-2)" }}>
              {heat.peActivity || (heat.signals && heat.signals[0]) || `${heat.label} — ${heat.multipleDirection} multiples.`}
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "var(--cd-ink-3)", lineHeight: 1.5 }}>
            No live sector-heat read yet — search to have Yulia work the buyer universe from sources.
          </p>
        )}
      </div>

      {/* action — route to Yulia as a discovery surface */}
      <button
        onClick={onRun}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderTop: "1px solid var(--cd-line)",
          background: "var(--cd-accent-soft)",
          border: "none",
          borderBottomLeftRadius: "var(--cd-r-lg)",
          borderBottomRightRadius: "var(--cd-r-lg)",
          cursor: "pointer",
          fontFamily: "var(--cd-sans)",
          width: "100%",
        }}
      >
        <CDIcon name="sparkle" size={14} color="var(--cd-accent)" />
        <span style={{ flex: 1, textAlign: "left", fontSize: 12.5, fontWeight: 700, color: "var(--cd-accent-strong)" }}>
          Buyers &amp; comps for {name.length > 22 ? name.slice(0, 22) + "…" : name}
        </span>
        <CDIcon name="chevright" size={14} color="var(--cd-accent-strong)" />
      </button>
    </div>
  );
}

/* ─── evergreen category card ──────────────────────────────────── */
function CategoryCard({ cat, onRun }: { cat: Category; onRun: () => void }) {
  const TONE_BG: Record<CategoryTone, { bg: string; fg: string }> = {
    accent: { bg: "var(--cd-accent-soft)", fg: "var(--cd-accent-strong)" },
    pos: { bg: "var(--cd-pos-soft)", fg: "var(--cd-pos)" },
    warn: { bg: "var(--cd-warn-soft)", fg: "oklch(0.5 0.13 75)" },
    neg: { bg: "var(--cd-neg-soft)", fg: "var(--cd-neg)" },
    neutral: { bg: "var(--cd-surface-3)", fg: "var(--cd-ink-2)" },
  };
  const t = TONE_BG[cat.tone];
  return (
    <button
      type="button"
      onClick={onRun}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        padding: "16px 18px",
        background: "var(--cd-surface)",
        border: "1px solid var(--cd-line)",
        borderRadius: "var(--cd-r-lg)",
        boxShadow: "var(--cd-shadow-sm)",
        minHeight: 132,
        fontFamily: "var(--cd-sans)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: t.bg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CDIcon name={cat.icon} size={19} color={t.fg} />
      </span>
      <strong style={{ color: "var(--cd-ink)", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
        {cat.title}
      </strong>
      <span style={{ color: "var(--cd-ink-2)", fontSize: 12.5, lineHeight: 1.45, flex: 1 }}>{cat.sub}</span>
      <span
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 11px",
          fontSize: 11.5,
          fontWeight: 700,
          borderRadius: 999,
          background: "var(--cd-accent-soft)",
          color: "var(--cd-accent-strong)",
        }}
      >
        Open
        <CDIcon name="chevright" size={12} color="var(--cd-accent-strong)" />
      </span>
    </button>
  );
}

/* ─── sourcing scorecard stat ──────────────────────────────────── */
function ScoreStat({ label, value, sub, style }: { label: string; value: ReactNode; sub?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--cd-surface)",
        border: "1px solid var(--cd-line)",
        borderRadius: "var(--cd-r-lg)",
        boxShadow: "var(--cd-shadow-sm)",
        padding: "15px 17px",
        minWidth: 0,
        ...style,
      }}
    >
      <div className="cd-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div className="cd-num" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
      {sub != null && (
        <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
