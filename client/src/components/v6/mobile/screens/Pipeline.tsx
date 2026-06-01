/* V6 Mobile — Pipeline screen.
   Category chips filter the deal list below. NEW TODAY featured hero
   stays pinned above as the curated weekly highlight. The "Yulia is
   watching" section heading has a chevron that opens the full Watching
   list page. Sample data comes from sampleDeals.ts. */

import { useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { YIcon } from "../YIcon";
import { IndustryIcon } from "../IndustryIcon";
import { MobileIcon } from "../icons";
import type { Verdict } from "../types";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import type { MobileWatchRow, MobileFeatured, MobilePick } from "../../../../hooks/useMobileDeals";
import { dealsByStage, type DealStage, type SampleDeal } from "../../../../lib/sampleDeals";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { BriefDigestSection } from "./Brief";

interface PipelineProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onOpenWatching: () => void;
  onAvatarClick: () => void;
  onSearch: () => void;
  /** Opens the notifications sheet + unread badge count. Omitted → no bell. */
  onNotif?: () => void;
  notifCount?: number;
  /** Authed user's watching list (null = anon or empty → samples render). */
  userWatching: MobileWatchRow[] | null;
  /** Authed user's "NEW TODAY" featured hero (null = anon or empty → sample). */
  userFeatured: MobileFeatured | null;
  /** Picks formerly shown on the Brief tab; now appended to Pipeline. */
  userPicks: MobilePick[] | null;
  /** True ONLY when a signed-in user genuinely has zero deals. Anon/dev
      preview passes false and keeps showing samples. */
  realEmpty?: boolean;
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

interface FeaturedDef { id: string; name: string; sub: string; revLabel: string }
const SAMPLE_FEATURED: FeaturedDef = {
  id: "deal-bigfake",
  name: "Big Fake Deal · sample",
  sub: "East Texas · sample seed",
  revLabel: "$5.4M REV",
};

export function PipelineScreen({ isAnon, initials, onOpenDeal, onOpenWatching, onAvatarClick, onSearch, onNotif, notifCount, userWatching, userFeatured, userPicks, realEmpty }: PipelineProps) {
  const FEATURED: FeaturedDef = userFeatured ?? SAMPLE_FEATURED;
  const [activeChip, setActiveChip] = useState<DealStage>("watching");
  const { isWatched, toggle } = useWatchlist();
  const filtered: SampleDeal[] = dealsByStage(activeChip);

  // A real signed-in user WITH deals: render their live watching list instead
  // of the chip-filtered samples. Anon/dev preview (isAnon) always stays on
  // samples. Real stage data isn't in this shape, so chips are hidden for
  // real users and the live list renders straight from userWatching.
  const hasRealDeals = !isAnon && !!userWatching && userWatching.length > 0;
  // Map each MobileWatchRow → PipeRow props. Verdict derives from the row's
  // icon/pill: cool icon → pursue, explicit Pass pill → pass, else watch.
  const realRows = (userWatching ?? []).map((row): {
    id: string; name: string; sub: string; verdict: Verdict;
  } => ({
    id: row.id,
    name: row.name,
    sub: row.sub,
    verdict: row.icon === "cool" ? "pursue" : row.pill === "Pass" ? "pass" : "watch",
  }));

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

      {/* Category chips — sample-only. Real stage data isn't in the
          watch-row shape, so chips are hidden for real signed-in users
          (live list or honest empty state below). */}
      {!hasRealDeals && !realEmpty && (
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

      {/* New today section — was wrapped in .on-color when the gradient
          carried a gold/sage band; page is white now, default dark text.
          Suppressed for realEmpty: FEATURED falls back to SAMPLE_FEATURED
          when userFeatured is null, and we must not show samples to a
          genuinely empty signed-in user. */}
      {!realEmpty && (
      <div style={{ padding: "0 22px 8px" }}>
        <div className="mb-section-eyebrow">{isAnon ? "VIEW SAMPLE · NEW TODAY" : "NEW TODAY"}</div>
        <div className="mb-section-title">{FEATURED.name}</div>
        <div style={P.subText}>The strongest source this week &mdash; tap to see why.</div>
      </div>
      )}

      {!realEmpty && (
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
              <div className="mb-eyebrow">FIT {userFeatured?.fit ?? 92} &middot; PURSUE</div>
              <div style={P.featuredHeadline}>
                Recurring revenue.<br/>Honest capex story.
              </div>
            </div>
            <div style={P.featuredRev}>{FEATURED.revLabel}</div>
          </div>
          <div style={P.featuredFooter}>
            <YIcon size={42} kind="cool" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={P.featuredName}>{FEATURED.name}</div>
              <div style={P.featuredSub}>{FEATURED.sub}</div>
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

      {/* Stage section — three modes:
          1. realEmpty  → honest empty state + first-deal CTA (signed-in,
             zero deals). No samples.
          2. hasRealDeals → the user's live watching list straight from
             userWatching (no chip filtering — stage data isn't in this shape).
          3. otherwise  → sample, chip-filtered experience (anon/dev preview).
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
            onClick={onSearch}
          >Source a deal</button>
        </div>
      ) : hasRealDeals ? (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 12px" }}>
            <button
              type="button"
              onClick={onOpenWatching}
              aria-label="Open full watching list"
              style={P.headingBtn}
            >
              <h2 style={P.watchTitle}>Yulia is watching</h2>
              <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />
            </button>
            <div style={P.subText}>The deals you&rsquo;re tracking — Yulia revisits these for you.</div>
          </div>
          {realRows.map((d, i) => (
            <PipeRow
              key={d.id}
              name={d.name}
              sub={d.sub}
              verdict={d.verdict}
              watched={isWatched(d.id)}
              last={i === realRows.length - 1}
              onTap={() => onOpenDeal(d.id, d.name)}
              onToggleWatch={() => toggle(d.id, d.name)}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "20px 22px 22px" }}>
          {activeChip === "watching" ? (
            <button
              type="button"
              onClick={onOpenWatching}
              aria-label="Open full watching list"
              style={P.headingBtn}
            >
              <h2 style={P.watchTitle}>{STAGE_TITLES[activeChip]}</h2>
              <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />
            </button>
          ) : (
            <h2 style={P.watchTitle}>{STAGE_TITLES[activeChip]}</h2>
          )}
          <div style={P.subText}>{STAGE_SUBS[activeChip]}</div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--mb-ink-4)", textAlign: "center" }}>
            No deals at this stage right now.
          </div>
        </div>
      ) : (
        <div className="mb-as-card" style={{ margin: "24px 16px 0", padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 12px" }}>
            {activeChip === "watching" ? (
              <button
                type="button"
                onClick={onOpenWatching}
                aria-label="Open full watching list"
                style={P.headingBtn}
              >
                <h2 style={P.watchTitle}>{STAGE_TITLES[activeChip]}</h2>
                <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />
              </button>
            ) : (
              <h2 style={P.watchTitle}>{STAGE_TITLES[activeChip]}</h2>
            )}
            <div style={P.subText}>{STAGE_SUBS[activeChip]}</div>
          </div>
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

      {/* Brief dock — suppressed for realEmpty: BriefDigestSection falls
          back to SAMPLE_PICKS when userPicks is null, and an empty signed-in
          user must not be shown sample picks. */}
      {!realEmpty && (
      <div style={P.briefDock}>
        <div style={{ padding: "0 22px 12px" }}>
          <div className="mb-section-eyebrow">BRIEF</div>
          <div className="mb-section-title">Yulia&rsquo;s ranked read</div>
          <div style={P.subText}>The daily brief now lives with Pipeline, where the deal flow is.</div>
        </div>
        <BriefDigestSection isAnon={isAnon} onOpenDeal={onOpenDeal} userPicks={userPicks} />
      </div>
      )}
    </div>
  );
}

function PipeRow({
  name, sub, verdict, watched, last, onTap, onToggleWatch,
}: {
  name: string;
  sub: string;
  verdict: Verdict;
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
    fontFamily: "var(--mb-font-mono)", fontSize: 11,
    color: "#fff",
    letterSpacing: 0.1, fontWeight: 600,
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
  briefDock: {
    marginTop: 32,
  },
};
