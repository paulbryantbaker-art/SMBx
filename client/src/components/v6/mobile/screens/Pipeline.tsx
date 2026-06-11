/* V6 Mobile — Pipeline screen.
   Category chips filter the deal list below. NEW TODAY featured hero
   stays pinned above as the curated weekly highlight. The "Yulia is
   watching" section heading has a chevron that opens the full Watching
   list page. Sample data comes from sampleDeals.ts. */

import { useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { YIcon } from "../YIcon";
import { IndustryIcon } from "../IndustryIcon";
import { SectionHeader } from "../SectionHeader";
import { VerdictPill } from "../VerdictPill";
import type { Verdict } from "../types";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { DEV_AUTH_BYPASS } from "../../../../hooks/useAuth";
import type { MobileFeatured, MobilePick, MobileStageRow } from "../../../../hooks/useMobileDeals";
import { dealsByStage, type DealStage, type SampleDeal } from "../../../../lib/sampleDeals";
import { PIPELINE_STAGES } from "../../../../lib/pipelineStages";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { BriefDigestSection } from "./Brief";

interface PipelineProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onOpenWatching: () => void;
  onOpenDealsList: () => void;
  onAvatarClick: () => void;
  onSearch: () => void;
  /** Opens the notifications sheet + unread badge count. Omitted → no bell. */
  onNotif?: () => void;
  notifCount?: number;
  /** Authed user's "NEW TODAY" featured hero (null = anon or empty → sample). */
  userFeatured: MobileFeatured | null;
  /** Picks formerly shown on the Brief tab; now appended to Pipeline. */
  userPicks: MobilePick[] | null;
  /** Every deal the user owns, tagged with stage — the full stage-grouped
      pipeline for real signed-in users. */
  userAll: MobileStageRow[] | null;
  /** True ONLY when a signed-in user genuinely has zero deals. Anon/dev
      preview passes false and keeps showing samples. */
  realEmpty?: boolean;
  /** Opens the structured add-deal sheet. When absent, the empty-state CTA
      falls back to its original behavior (onSearch). */
  onAddDeal?: () => void;
}

interface ChipDef { id: DealStage; label: string; n: number }
const CHIPS: ChipDef[] = [
  { id: "sourced",   label: "Sourced",   n: 142 },
  { id: "screened",  label: "Screened",  n: 28  },
  { id: "in-review", label: "In review", n: 4   },
  { id: "pursuing",  label: "Pursuing",  n: 2   },
  { id: "watching",  label: "Watching",  n: 87  },
];

const STAGE_TITLES: Record<DealStage, string> = {
  "sourced":   "Sourced this week",
  "screened":  "Made it through screening",
  "in-review": "Currently in review",
  "pursuing":  "Yulia is pursuing",
  "watching":  "Yulia is watching",
};

const STAGE_SUBS: Record<DealStage, string> = {
  "sourced":   "Raw top-of-funnel — Yulia hasn't read these yet.",
  "screened":  "Passed initial screen — promising on paper.",
  "in-review": "Yulia's actively working these right now.",
  "pursuing":  "Active pursuit — IOIs and conversations underway.",
  "watching":  "Sample sources Yulia revisits weekly — yours go here.",
};

interface FeaturedDef { id: string; name: string; sub: string; revLabel: string; fit: number; verdict: Verdict }
const SAMPLE_FEATURED: FeaturedDef = {
  id: "deal-bigfake",
  name: "Big Fake Deal · sample",
  sub: "East Texas · sample seed",
  revLabel: "$5.4M revenue",
  fit: 92,
  verdict: "pursue",
};

/** Compact money for ledger columns/aggregates — "$2.4M" / "$760K" / "$900".
 *  Returns null for absent/zero values so callers can omit the line entirely
 *  (never an em-dash, never a fabricated zero). */
function fmtM(cents: number | null | undefined): string | null {
  if (typeof cents !== "number" || cents <= 0) return null;
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d)}`;
}

export function PipelineScreen({ isAnon, initials, onOpenDeal, onOpenWatching, onOpenDealsList, onAvatarClick, onSearch, onNotif, notifCount, userFeatured, userPicks, userAll, realEmpty, onAddDeal }: PipelineProps) {
  // Sample content is ONLY for anon and the dev-bypass preview. A real
  // signed-in user never sees "Big Fake Deal" or fabricated chip counts —
  // including mid-load (honest loading card below instead).
  const showSamples = isAnon || DEV_AUTH_BYPASS;
  const isRealFeatured = !showSamples && !!userFeatured;
  const FEATURED: FeaturedDef = userFeatured ?? SAMPLE_FEATURED;
  // Fit honesty: a real user's featured fit renders ONLY when it's backed by
  // a real composite/multiple (fitIsReal). Synthetic fits may pick which deal
  // is featured, but the numeral never displays. Sample hero keeps its
  // clearly-labeled sample fit.
  const showFeaturedFit = !isRealFeatured || (userFeatured?.fitIsReal ?? false);
  const [activeChip, setActiveChip] = useState<DealStage>("watching");
  const { isWatched, toggle } = useWatchlist();
  const filtered: SampleDeal[] = dealsByStage(activeChip);

  // A real signed-in user WITH deals: render their FULL pipeline grouped by
  // stage (same five stages as desktop). Anon/dev preview stays on the
  // chip-filtered samples below.
  const hasRealDeals = !isAnon && !!userAll && userAll.length > 0;

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Pipeline" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch} onNotif={onNotif} notifCount={notifCount} />
      <LargeTitle>Pipeline</LargeTitle>

      {/* Logged-out callout */}
      {isAnon && (
        <div style={{ padding: "0 22px 14px" }}>
          <div style={P.calloutText}>
            A live sample pipeline. <span style={{ color: "var(--mb-accent-ink)", fontWeight: 700 }}>Tap any deal</span> to see how Yulia thinks &mdash; your real pipeline lives here once you start.
          </div>
        </div>
      )}

      {/* Category chips — sample-only (anon/dev preview). The counts are
          sample-seed numbers, so they must never render for a real
          signed-in user — not even mid-load. */}
      {showSamples && !hasRealDeals && (
      <div className="mb-hide-scroll" style={P.chipsRow}>
        {CHIPS.map(c => {
          const isActive = activeChip === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveChip(c.id)}
              style={{
                ...P.chip,
                background: isActive ? "var(--mb-ink)" : "#fff",
                color: isActive ? "#fff" : "var(--mb-ink-1)",
                boxShadow: isActive
                  ? "none"
                  : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
              }}
            >
              {c.label}
              <span
                className="mb-mono"
                style={{
                  ...P.chipCount,
                  background: isActive ? "rgba(255,255,255,0.2)" : "var(--mb-card-2)",
                  color: isActive ? "#fff" : "var(--mb-ink-3)",
                }}
              >{c.n}</span>
            </button>
          );
        })}
      </div>
      )}

      {/* New today section — sample hero for anon/dev preview; for a real
          signed-in user it renders ONLY from their real featured deal
          (highest-fit active deal), with headline/fit/verdict derived from
          that deal — never the hardcoded sample copy. Hidden while the
          deals fetch is in flight and for realEmpty. */}
      {(showSamples || isRealFeatured) && (
      <div style={{ padding: "0 22px 8px" }}>
        <div className="mb-section-title">{FEATURED.name}</div>
        <div style={P.subText}>
          {isRealFeatured
            ? "Your highest-fit active deal — tap to see why."
            : "The strongest source this week — tap to see why."}
        </div>
      </div>
      )}

      {(showSamples || isRealFeatured) && (
      <div style={{ padding: "12px 16px 4px" }}>
        <div
          className="mb-tap"
          role="button"
          tabIndex={0}
          aria-label={`Open ${FEATURED.name}`}
          onClick={() => onOpenDeal(FEATURED.id, FEATURED.name)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDeal(FEATURED.id, FEATURED.name);
            }
          }}
          style={P.featured}
        >
          <div style={{ height: 200, position: "relative" }}>
            <div style={P.featuredGlow} aria-hidden="true" />
            <div style={P.featuredCorner}>
              {/* Visible fit + verdict — replaces the mono-caps eyebrow
                  ("FIT 92 · PURSUE") that the app-wide micro-label kill
                  rule display:none'd. Plain mono numeral + tonal pill. */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {showFeaturedFit && (
                  <span style={P.fitNum}>
                    {FEATURED.fit}
                    <span style={P.fitWord}> fit</span>
                  </span>
                )}
                <VerdictPill kind={FEATURED.verdict} />
              </div>
              <div style={P.featuredHeadline}>
                {isRealFeatured
                  ? FEATURED.sub
                  : <>Recurring revenue.<br/>Honest capex story.</>}
              </div>
            </div>
            <div style={P.featuredRev}>{FEATURED.revLabel}</div>
          </div>
          <div style={P.featuredFooter}>
            <YIcon size={42} kind={FEATURED.verdict === "pursue" ? "cool" : "default"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={P.featuredName}>{FEATURED.name}</div>
              <div style={P.featuredSub}>
                {isRealFeatured ? "Highest-fit active deal in your pipeline" : FEATURED.sub}
              </div>
            </div>
            <button
              type="button"
              className="mb-get-pill dark"
              style={{ padding: "6px 16px", fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeal(FEATURED.id, FEATURED.name);
              }}
            >Dig in</button>
          </div>
        </div>
      </div>
      )}

      {/* Stage section — four modes:
          1. realEmpty  → honest empty state + first-deal CTA (signed-in,
             zero deals). No samples.
          2. hasRealDeals → the user's full pipeline grouped by stage.
          3. real signed-in user, fetch in flight → honest loading card
             (never the sample list).
          4. anon/dev preview → sample, chip-filtered experience.
          Heading + rows live inside one card, App Store-style. */}
      {realEmpty ? (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "28px 22px 26px", textAlign: "center" }}>
          <h2 style={{ ...P.watchTitle, marginBottom: 6 }}>No deals yet</h2>
          <div style={{ ...P.subText, marginTop: 0 }}>
            Source a target or add a deal you&rsquo;re tracking &mdash; Yulia takes it from there.
          </div>
          <button
            type="button"
            className="mb-get-pill solid"
            style={{ marginTop: 18, padding: "11px 26px", fontSize: 15 }}
            onClick={onAddDeal ?? onSearch}
          >Source a deal</button>
        </div>
      ) : hasRealDeals ? (
        <>
          <PipelineKpis deals={userAll ?? []} onOpenDeal={onOpenDeal} />
          {PIPELINE_STAGES.map(stage => {
            const stageAll = (userAll ?? []).filter(d => d.stageId === stage.id);
            if (stageAll.length === 0) return null;
            const stageRows = stageAll.slice(0, 20); // preview cap — chevron opens the full list
            // Right-aligned ledger aggregate: deal count + summed asking
            // price. The ask clause is omitted when no deal in the stage is
            // priced — never a fabricated total.
            const stageAsk = fmtM(stageAll.reduce(
              (sum, d) => sum + (typeof d.askingPrice === "number" && d.askingPrice > 0 ? d.askingPrice : 0), 0,
            ));
            const aggregate =
              `${stageAll.length} ${stageAll.length === 1 ? "deal" : "deals"}` +
              (stageAsk ? ` · ${stageAsk} total ask` : "");
            return (
              <div key={stage.id} className="mb-as-card" style={{ margin: "20px 16px 0", padding: "20px 0 6px" }}>
                <SectionHeader
                  title={
                    <span style={P.stageTitleRow}>
                      <span style={P.stageTitleText}>{stage.title}</span>
                      <span style={P.stageAgg}>{aggregate}</span>
                    </span>
                  }
                  subtitle={stage.sub}
                  onSeeAll={onOpenDealsList}
                  seeAllAria="See all deals"
                  padding="0 22px 12px"
                />
                {stageRows.map((d, i) => (
                  <PipeRow
                    key={d.id}
                    name={d.name}
                    sub={d.sub}
                    verdict={d.verdict}
                    askingPrice={d.askingPrice}
                    sde={d.sde}
                    fit={d.fit}
                    watched={isWatched(d.id)}
                    last={i === stageRows.length - 1}
                    onTap={() => onOpenDeal(d.id, d.name)}
                    onToggleWatch={() => toggle(d.id, d.name)}
                  />
                ))}
              </div>
            );
          })}
        </>
      ) : !showSamples ? (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "26px 22px" }}>
          <div style={{ fontSize: 13.5, color: "var(--mb-ink-3)", textAlign: "center" }}>
            Loading your pipeline&hellip;
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "20px 22px 22px" }}>
          <SectionHeader
            title={STAGE_TITLES[activeChip]}
            subtitle={STAGE_SUBS[activeChip]}
            onSeeAll={activeChip === "watching" ? onOpenWatching : onOpenDealsList}
            seeAllAria="See all deals"
            padding="0"
          />
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--mb-ink-4)", textAlign: "center" }}>
            No deals at this stage right now.
          </div>
        </div>
      ) : (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "20px 0 6px" }}>
          <SectionHeader
            title={STAGE_TITLES[activeChip]}
            subtitle={STAGE_SUBS[activeChip]}
            onSeeAll={activeChip === "watching" ? onOpenWatching : onOpenDealsList}
            seeAllAria="See all deals"
            padding="0 22px 12px"
          />
          {filtered.map((d, i) => (
            <PipeRow
              key={d.id}
              name={d.name}
              sub={d.sub}
              verdict={d.verdict}
              watched={isWatched(d.id)}
              last={i === filtered.length - 1}
              onTap={() => onOpenDeal(d.id, d.name)}
              onToggleWatch={() => toggle(d.id, d.name)}
            />
          ))}
        </div>
      )}

      {/* Brief dock — sample picks for anon/dev preview only; for a real
          signed-in user it renders only when they have real picks (hidden
          for realEmpty and mid-load). */}
      {(showSamples || (userPicks?.length ?? 0) > 0) && (
      <div style={P.briefDock}>
        <div style={{ padding: "0 22px 12px" }}>
          <div className="mb-section-title">Yulia&rsquo;s ranked read</div>
          <div style={P.subText}>The daily brief now lives with Pipeline, where the deal flow is.</div>
        </div>
        <BriefDigestSection isAnon={isAnon} onOpenDeal={onOpenDeal} userPicks={userPicks} />
      </div>
      )}
    </div>
  );
}

/* ─── PipelineKpis ─────────────────────────────────────────
   Compact 2×2 KPI grid above the stage-grouped list (authed users with
   deals only). Every figure is computed from the real rows in memory —
   cells with no data simply don't render. "Strongest source" is the
   highest REAL-fit deal and taps through to it. */
function PipelineKpis({
  deals, onOpenDeal,
}: {
  deals: MobileStageRow[];
  onOpenDeal: (id: string, title: string) => void;
}) {
  if (deals.length === 0) return null;

  const totalAsk = fmtM(deals.reduce(
    (sum, d) => sum + (typeof d.askingPrice === "number" && d.askingPrice > 0 ? d.askingPrice : 0), 0,
  ));

  // Median over REAL fits only (fit is null when no composite/multiple).
  const fits = deals
    .map(d => d.fit)
    .filter((f): f is number => typeof f === "number")
    .sort((a, b) => a - b);
  const medianFit = fits.length === 0
    ? null
    : fits.length % 2 === 1
      ? fits[(fits.length - 1) / 2]
      : Math.round((fits[fits.length / 2 - 1] + fits[fits.length / 2]) / 2);

  const strongest = deals.reduce<MobileStageRow | null>(
    (best, d) => (typeof d.fit === "number" && (best?.fit ?? -1) < d.fit ? d : best),
    null,
  );

  return (
    <div className="mb-as-card" style={{ margin: "20px 16px 0", padding: "8px 6px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={P.kpiCell}>
        <div className="mb-mono" style={P.kpiValue}>{deals.length}</div>
        <div style={P.kpiLabel}>Deals in motion</div>
      </div>
      {totalAsk && (
        <div style={P.kpiCell}>
          <div className="mb-mono" style={P.kpiValue}>{totalAsk}</div>
          <div style={P.kpiLabel}>Total ask</div>
        </div>
      )}
      {medianFit != null && (
        <div style={P.kpiCell}>
          <div className="mb-mono" style={P.kpiValue}>{medianFit}</div>
          <div style={P.kpiLabel}>Median fit</div>
        </div>
      )}
      {strongest && (
        <div
          className="mb-tap"
          role="button"
          tabIndex={0}
          aria-label={`Open ${strongest.name}`}
          onClick={() => onOpenDeal(strongest.id, strongest.name)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDeal(strongest.id, strongest.name);
            }
          }}
          style={{ ...P.kpiCell, cursor: "pointer" }}
        >
          <div style={P.kpiName}>{strongest.name}</div>
          <div style={P.kpiLabel}>Strongest source</div>
        </div>
      )}
    </div>
  );
}

function PipeRow({
  name, sub, verdict, askingPrice, sde, fit, watched, last, onTap, onToggleWatch,
}: {
  name: string;
  sub: string;
  verdict: Verdict;
  /** Financials in CENTS (real stage rows only — sample rows omit). Absent
      values omit their line entirely; nothing renders an em-dash. */
  askingPrice?: number | null;
  sde?: number | null;
  /** REAL fit only (composite/multiple-backed) — callers pass null for
      synthetic fits so they never display. */
  fit?: number | null;
  watched: boolean;
  last?: boolean;
  onTap: () => void;
  onToggleWatch: () => void;
}) {
  // Pill behavior is verdict-driven:
  //   Pursue → "Pursue" pill opens detail (most decisive action)
  //   Watch  → toggles watchlist (Watch ↔ Watching)
  //   Pass   → informational, opens detail to read why Yulia passed
  const isPursue = verdict === "pursue";
  const isPass = verdict === "pass";
  const pillLabel = isPursue ? "Pursue" : isPass ? "Pass" : (watched ? "Watching" : "Watch");
  const pillBg =
    isPursue ? "var(--mb-accent-soft)" :
    isPass   ? "var(--mb-card-2)" :
    watched  ? "var(--mb-accent-ink)" : "var(--mb-blue-soft)";
  const pillColor =
    isPursue ? "var(--mb-accent-ink)" :
    isPass   ? "var(--mb-ink-3)" :
    watched  ? "#fff" : "var(--mb-blue-ink)";
  const onPillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (verdict === "watch") onToggleWatch();
    else onTap();
  };
  // Working Paper ledger stack — asking price (primary), SDE (smaller),
  // real fit numeral. Lines render only when the value exists.
  const askTxt = fmtM(askingPrice);
  const sdeTxt = fmtM(sde);
  const hasMoneyStack = !!askTxt || !!sdeTxt || typeof fit === "number";
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        cursor: "pointer",
      }}
    >
      <IndustryIcon name={name} verdict={verdict} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={P.rowName}>{name}</div>
        <div style={P.rowSub}>{sub}</div>
      </div>
      {hasMoneyStack && (
        <div style={P.rowMoney}>
          {askTxt && <div className="mb-mono" style={P.rowAsk}>{askTxt}</div>}
          {sdeTxt && <div className="mb-mono" style={P.rowSde}>SDE {sdeTxt}</div>}
          {typeof fit === "number" && (
            <div className="mb-mono" style={P.rowFit}>{fit} fit</div>
          )}
        </div>
      )}
      <button
        type="button"
        aria-pressed={verdict === "watch" ? watched : undefined}
        style={{
          padding: "5px 14px", fontSize: 13, marginRight: 18,
          fontWeight: 700, borderRadius: 999, border: "none",
          background: pillBg, color: pillColor,
          minWidth: 78, cursor: "pointer",
          transition: "background-color 200ms ease, color 200ms ease",
        }}
        onClick={onPillClick}
      >{pillLabel}</button>
    </div>
  );
}

const P: Record<string, CSSProperties> = {
  calloutText: {
    fontSize: 13.5, color: "var(--mb-ink-3)", lineHeight: 1.45,
    textWrap: "pretty",
  },
  chipsRow: {
    display: "flex", gap: 8,
    padding: "0 16px 16px",
    overflowX: "auto",
  },
  chip: {
    padding: "9px 16px", borderRadius: 999,
    fontSize: 14, fontWeight: 600,
    fontFamily: "var(--mb-font-body)",
    border: "none",
    whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer",
  },
  chipCount: {
    fontSize: 11, padding: "1px 6px", borderRadius: 999,
    fontFamily: "var(--mb-font-mono)",
  },
  subText: {
    fontSize: 16, color: "var(--mb-ink-2)", marginTop: 2,
    textWrap: "pretty",
  },
  featured: {
    borderRadius: 18, overflow: "hidden",
    /* Overlay reverted 2026-05-05 (eve) — multiply blend was muddying
       the blue. Back to lighter normal-blend stops; verdict-tinted
       glow below carries the integration with the white page. */
    backgroundImage:
      `linear-gradient(160deg, rgba(80,96,62,0.30) 0%, rgba(54,68,45,0.62) 100%), url('${RANDOM_TEXTURES.pipeline}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    color: "#fff", position: "relative",
    boxShadow:
      "0 14px 36px -10px rgba(60,108,168,0.32)," +
      "0 8px 20px -8px rgba(0,0,0,0.26)," +
      "inset 0 1px 0 rgba(255,255,255,0.24)," +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
    cursor: "pointer",
  },
  featuredGlow: {
    position: "absolute", top: -50, right: -30,
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 60%)",
  },
  featuredCorner: { position: "absolute", bottom: 16, left: 22 },
  featuredHeadline: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.7px", color: "#fff", marginTop: 4, lineHeight: 1.05,
  },
  featuredRev: {
    position: "absolute", top: 18, right: 22,
    fontFamily: "var(--mb-font-mono)", fontSize: 12.5,
    color: "#fff",
    fontWeight: 650,
    fontVariantNumeric: "tabular-nums",
  },
  /* Visible fit numeral on the featured hero — plain inline mono (no
     .mb-mono class, no caps) so the micro-label kill rule can't touch it. */
  fitNum: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 15, fontWeight: 700, color: "#fff",
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
  },
  fitWord: {
    fontSize: 12.5, fontWeight: 600, color: "#fff",
  },
  featuredFooter: {
    padding: "12px 14px",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.14), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.018))",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    borderTop: "0.5px solid rgba(255,255,255,0.32)",
    boxShadow:
      "0 12px 28px -20px rgba(0,0,0,0.46), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", gap: 12,
  },
  featuredName: {
    fontSize: 14, fontWeight: 600, color: "#fff",
  },
  featuredSub: {
    fontSize: 12, color: "#fff",
  },
  watchTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px", margin: 0,
    color: "var(--mb-ink)",
  },
  headingBtn: {
    display: "flex", alignItems: "baseline", gap: 6,
    padding: 0, background: "transparent", border: "none",
    cursor: "pointer", textAlign: "left",
  },
  rowName: {
    fontSize: 16, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.25px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowSub: {
    fontSize: 13.5, color: "var(--mb-ink-3)", marginTop: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  /* Right-aligned ledger money stack on real stage rows (matches the
     DealsListScreen money-stack pattern): ask primary, SDE smaller, real
     fit numeral. Visible sentence-case mono — never caps-micro. */
  rowMoney: {
    textAlign: "right" as const, flexShrink: 0,
  },
  rowAsk: {
    fontSize: 14, fontWeight: 700, color: "var(--mb-ink)",
    letterSpacing: "-0.2px", lineHeight: 1.25,
  },
  rowSde: {
    fontSize: 11.5, color: "var(--mb-ink-3)", marginTop: 1,
    lineHeight: 1.3,
  },
  rowFit: {
    fontSize: 11.5, fontWeight: 650, color: "var(--mb-ink-3)", marginTop: 1,
    lineHeight: 1.3,
  },
  /* Stage header: title left, ledger aggregate right — both inside the
     SectionHeader title slot so the see-all chevron stays outermost. */
  stageTitleRow: {
    display: "flex", alignItems: "baseline",
    justifyContent: "space-between", gap: 10, minWidth: 0,
  },
  stageTitleText: {
    minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  stageAgg: {
    fontFamily: "var(--mb-font-mono)", fontSize: 11.5, fontWeight: 600,
    letterSpacing: 0, color: "var(--mb-ink-3)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap" as const, flexShrink: 0,
  },
  /* KPI strip cells — value-first tiles, visible sentence-case labels. */
  kpiCell: {
    padding: "12px 16px", minWidth: 0,
  },
  kpiValue: {
    fontSize: 19, fontWeight: 700, color: "var(--mb-ink)",
    letterSpacing: "-0.4px", lineHeight: 1.15,
  },
  kpiName: {
    fontSize: 15, fontWeight: 650, color: "var(--mb-ink)",
    letterSpacing: "-0.25px", lineHeight: 1.25,
    whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
  },
  kpiLabel: {
    fontSize: 12, fontWeight: 600, color: "var(--mb-ink-3)", marginTop: 2,
  },
  briefDock: {
    marginTop: 32,
  },
};
