/* V6 Mobile — Watching full list screen.
   App Store-style "Indie Games We Love" pattern: hero header at top,
   editorial intro card, then the list. Reachable via the chevron on
   Pipeline's "Yulia is watching" section.

   Data honesty (2026-06-11): a real signed-in user sees ONLY their real
   deals carrying a watch verdict (same /api/deals shaping Pipeline uses
   via useMobileDeals — dealVerdict() maps financials.status_label / gate
   to pursue|watch|pass). The curated sample bank renders ONLY for anon
   and the dev-bypass preview, clearly labeled. V6Mobile mounts this
   screen with nav handlers only, so auth + deals are resolved here. */

import { type CSSProperties, useMemo } from "react";
import { MobileIcon } from "../icons";
import { IndustryIcon } from "../IndustryIcon";
import { VerdictPill } from "../VerdictPill";
import { watchableDeals, type SampleDeal } from "../../../../lib/sampleDeals";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { DEV_AUTH_BYPASS, useAuth } from "../../../../hooks/useAuth";
import { useMobileDeals, type MobileStageRow } from "../../../../hooks/useMobileDeals";

interface WatchingProps {
  onBack: () => void;
  onOpenDeal: (id: string, title: string) => void;
}

export function WatchingScreen({ onBack, onOpenDeal }: WatchingProps) {
  // Real data path — the screen receives only nav props from V6Mobile, so it
  // resolves the signed-in user and their deals itself. useMobileDeals is a
  // no-op (empty, loaded) for anon and dev-bypass, so samples stay sample-only.
  const { user, loading: authLoading } = useAuth();
  const deals = useMobileDeals(user);
  const isRealUser = !!user && !DEV_AUTH_BYPASS;
  // Never flash samples at a real user mid-load: samples render only once
  // auth has resolved to anon (or the dev-bypass preview).
  const showSamples = !authLoading && !isRealUser;
  const realLoading = authLoading || (isRealUser && !deals.loaded);

  // Real rows: the user's deals with a watch verdict, real fits first
  // (descending) — fitless rows keep their fetch order below. `fit` on
  // MobileStageRow is composite-backed or null; never synthetic.
  const realRows: MobileStageRow[] = useMemo(() => {
    if (!isRealUser) return [];
    return deals.all
      .filter(d => d.verdict === "watch")
      .sort((a, b) => (b.fit ?? -1) - (a.fit ?? -1));
  }, [isRealUser, deals.all]);

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      {/* Floating back button — App Store back glass pill at top-left */}
      <FloatingBack onBack={onBack} />

      {/* Hero header: editorial title, lots of breathing room */}
      <div style={W.heroHeader}>
        <h1 style={W.heroTitle}>Deals worth a second look</h1>
        <p style={W.heroSub}>
          {showSamples
            ? "A sample watchlist — strong signals, watchful flags, and the picks you add on your test drive."
            : "Deals in your pipeline with a watch verdict — strong enough to track, not ready to pursue."}
        </p>
      </div>

      {realLoading ? (
        <div className="mb-as-card" style={W.stateCard}>
          <div style={W.stateText}>Loading your watchlist&hellip;</div>
        </div>
      ) : showSamples ? (
        <SampleWatching onOpenDeal={onOpenDeal} />
      ) : realRows.length === 0 ? (
        <div className="mb-as-card" style={W.stateCard}>
          <h2 style={W.emptyTitle}>Nothing on watch right now.</h2>
          <div style={W.stateText}>
            When Yulia marks a deal in your pipeline as watch, it lands here.
          </div>
        </div>
      ) : (
        <>
          {/* Editorial intro card — gold marble, like Brief's hero */}
          <div style={{ padding: "0 16px 8px" }}>
            <div style={W.editorial}>
              <div style={W.editorialBody}>
                <h2 style={W.editorialTitle}>
                  Where the next deal might come from.
                </h2>
                <p style={W.editorialSub}>
                  {realRows.length === 1
                    ? "1 deal on watch"
                    : `${realRows.length} deals on watch`}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-as-card" style={{ margin: "12px 16px 0", padding: "4px 0" }}>
            {realRows.map((d, i) => (
              <RealWatchRow
                key={d.id}
                deal={d}
                last={i === realRows.length - 1}
                onTap={() => onOpenDeal(d.id, d.name)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Real rows (signed-in users) ─────────────────────────── */

function RealWatchRow({
  deal, last, onTap,
}: {
  deal: MobileStageRow;
  last: boolean;
  onTap: () => void;
}) {
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
      <IndustryIcon name={deal.name} verdict={deal.verdict} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={W.rowName}>{deal.name}</div>
        <div style={W.rowSub}>{deal.sub}</div>
      </div>
      <div style={W.rowRight}>
        {/* Fit renders ONLY when composite-backed (fit is null otherwise) */}
        {typeof deal.fit === "number" && (
          <div className="mb-mono" style={W.realFit}>{deal.fit} fit</div>
        )}
        <VerdictPill kind={deal.verdict} onLight />
      </div>
    </div>
  );
}

/* ─── Sample feed (anon / dev-bypass preview only) ────────── */

function SampleWatching({ onOpenDeal }: { onOpenDeal: (id: string, title: string) => void }) {
  const { watched, isWatched, toggle } = useWatchlist();

  // Unified feed: deals the user has hand-picked (newest first), then
  // Yulia's curated bank below — deduped by id so a deal the user
  // watched doesn't appear twice.
  const feed: SampleDeal[] = useMemo(() => {
    const curated = watchableDeals();
    const userIds = new Set(watched.map(w => w.id));
    const userPicks = watched
      .map(w => curated.find(d => d.id === w.id))
      .filter((d): d is SampleDeal => Boolean(d));
    const remaining = curated.filter(d => !userIds.has(d.id));
    return [...userPicks, ...remaining];
  }, [watched]);

  const userCount = feed.length > 0
    ? watched.filter(w => feed.some(d => d.id === w.id)).length
    : 0;

  return (
    <>
      {/* Editorial intro card — gold marble, like Brief's hero */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={W.editorial}>
          <div style={W.editorialBody}>
            <h2 style={W.editorialTitle}>
              Where the next deal might come from.
            </h2>
            <p style={W.editorialSub}>
              {userCount > 0
                ? `Sample deals · ${userCount} on your list • ${feed.length - userCount} from Yulia`
                : "Sample deals · tap Watch on any row to add it to your list."}
            </p>
          </div>
        </div>
      </div>

      {/* Ranked list */}
      <div className="mb-as-card" style={{ margin: "12px 16px 0", padding: "4px 0" }}>
        {feed.map((d, i) => (
          <WatchRow
            key={d.id}
            rank={i + 1}
            deal={d}
            watched={isWatched(d.id)}
            onTap={() => onOpenDeal(d.id, d.name)}
            onToggle={() => toggle(d.id, d.name)}
          />
        ))}
      </div>

      <div style={{ padding: "16px 22px 8px" }}>
        <div style={W.footnote}>
          sample data · watchlist persists in this browser
        </div>
      </div>
    </>
  );
}

function FloatingBack({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      style={W.backBtn}
    >
      <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
    </button>
  );
}

function WatchRow({
  rank, deal, watched, onTap, onToggle,
}: {
  rank: number;
  deal: SampleDeal;
  watched: boolean;
  onTap: () => void;
  onToggle: () => void;
}) {
  const fitColor =
    deal.verdict === "pursue" ? "var(--mb-accent)" :
    deal.verdict === "pass"   ? "var(--mb-danger)" :
                                 "var(--mb-warn)";
  const last = false; // borderBottom set via :last-child if we want; row works fine either way
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
        padding: "12px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 18, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <div style={W.rank}>{rank}</div>
      <IndustryIcon name={deal.name} verdict={deal.verdict} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={W.rowName}>{deal.name}</div>
        <div style={W.rowSub}>{deal.sub}</div>
      </div>
      <div style={W.rowRight}>
        <div className="mb-mono" style={{ ...W.rowFit, color: fitColor }}>{deal.fit}</div>
        <button
          type="button"
          aria-label={watched ? `Remove ${deal.name} from watchlist` : `Add ${deal.name} to watchlist`}
          aria-pressed={watched}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            ...W.watchBtn,
            background: watched ? "var(--mb-accent-ink)" : "var(--mb-blue-soft)",
            color: watched ? "#fff" : "var(--mb-blue-ink)",
          }}
        >
          {watched ? "Watching" : "Watch"}
        </button>
      </div>
    </div>
  );
}

const W: Record<string, CSSProperties> = {
  backBtn: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 12px)",
    left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
    cursor: "pointer",
  },
  heroHeader: {
    padding: "calc(env(safe-area-inset-top, 44px) + 64px) 22px 8px",
  },
  heroTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 32, letterSpacing: "-0.7px", lineHeight: 1.05,
    margin: "6px 0 0", color: "var(--mb-ink)",
    textWrap: "balance",
  },
  heroSub: {
    fontSize: 15, color: "var(--mb-ink-2)",
    margin: "10px 0 18px", lineHeight: 1.45,
    textWrap: "pretty",
  },
  editorial: {
    borderRadius: 22, overflow: "hidden",
    /* Overlay retuned 2026-05-05 (eve) — sienna-brown stops became
       muddy on the gold texture. Switched to amber/gold tones so the
       overlay clarifies hue rather than darkening it into brown. */
    backgroundImage:
      `linear-gradient(165deg, rgba(214,163,92,0.30) 0%, rgba(132,90,36,0.64) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow:
      "0 14px 36px -10px rgba(140,98,42,0.32)," +
      "0 8px 20px -8px rgba(0,0,0,0.26)," +
      "inset 0 1px 0 rgba(255,255,255,0.24)," +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
    minHeight: 180,
    display: "flex", alignItems: "flex-end",
    color: "#fff",
  },
  editorialBody: {
    padding: "22px 22px 24px",
  },
  editorialTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 26, letterSpacing: "-0.5px", lineHeight: 1.1,
    margin: "8px 0 6px", color: "#fff",
    textWrap: "balance",
  },
  editorialSub: {
    fontSize: 13, color: "#fff",
    margin: 0, lineHeight: 1.45,
  },
  rank: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 18,
    color: "var(--mb-ink-4)", width: 18,
    flexShrink: 0, textAlign: "center" as const,
  },
  rowName: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
    whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
  },
  rowSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 1,
    whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
  },
  rowRight: {
    display: "flex", alignItems: "center", gap: 12,
    paddingRight: 18, flexShrink: 0,
  },
  rowFit: {
    fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px",
    minWidth: 24, textAlign: "right" as const,
  },
  /* Real fit numeral — matches Pipeline's ledger fit ("78 fit"), sentence-
     case mono, never caps-micro. */
  realFit: {
    fontSize: 11.5, fontWeight: 650, color: "var(--mb-ink-3)",
    lineHeight: 1.3, whiteSpace: "nowrap" as const,
  },
  watchBtn: {
    fontWeight: 700, fontSize: 13,
    padding: "5px 14px", borderRadius: 999,
    border: "none", cursor: "pointer",
    minWidth: 70,
    transition: "background-color 200ms ease, color 200ms ease",
  },
  footnote: {
    fontSize: 12, color: "var(--mb-ink-4)",
    fontFamily: "var(--mb-font-mono)",
    letterSpacing: "0.03em",
    textAlign: "center" as const,
  },
  /* Honest loading / empty cards (real signed-in users) */
  stateCard: {
    margin: "12px 16px 0",
    padding: "26px 22px",
    textAlign: "center" as const,
  },
  stateText: {
    fontSize: 13.5, color: "var(--mb-ink-3)", lineHeight: 1.5,
    textWrap: "pretty",
  },
  emptyTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 20, letterSpacing: "-0.4px",
    margin: "0 0 6px", color: "var(--mb-ink)",
  },
};
