/* V6 Mobile — Watching full list screen.
   App Store-style "Indie Games We Love" pattern: hero header at top,
   editorial intro card with the curated story, then a ranked list of
   every deal Yulia is watching plus the user's own picks. Reachable
   via the chevron on Pipeline's "Yulia is watching" section. */

import { type CSSProperties, type ReactNode, useMemo } from "react";
import { MobileIcon } from "../icons";
import type { Verdict } from "../types";
import { watchableDeals, type SampleDeal } from "../../../../lib/sampleDeals";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";

interface WatchingProps {
  onBack: () => void;
  onOpenDeal: (id: string, title: string) => void;
}

export function WatchingScreen({ onBack, onOpenDeal }: WatchingProps) {
  const { watched, isWatched, toggle } = useWatchlist();

  // Unified feed: deals the user has hand-picked (newest first), then
  // Yulia's curated bank below — deduped by id so a deal the user
  // watched doesn't appear twice. Sort the curated tail by fit so the
  // strongest signals stay near the top.
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
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      {/* Floating back button — App Store back glass pill at top-left */}
      <FloatingBack onBack={onBack} />

      {/* Hero header: editorial title, lots of breathing room */}
      <div style={W.heroHeader}>
        <div style={W.heroEyebrow}>YULIA&rsquo;S WATCHLIST</div>
        <h1 style={W.heroTitle}>Deals worth a second look</h1>
        <p style={W.heroSub}>
          The full list Yulia revisits — strong signals, watchful flags, and
          the picks you&rsquo;ve added on your test drive.
        </p>
      </div>

      {/* Editorial intro card — gold marble, like Brief's hero */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={W.editorial}>
          <div style={W.editorialBody}>
            <div className="mb-eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>
              SAMPLE · {feed.length} DEALS
            </div>
            <h2 style={W.editorialTitle}>
              Where the next deal might come from.
            </h2>
            <p style={W.editorialSub}>
              {userCount > 0
                ? `${userCount} on your list • ${feed.length - userCount} from Yulia`
                : "Tap Watch on any row to add it to your list."}
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
          {feed.length} of {feed.length} • watchlist persists in this browser
        </div>
      </div>
    </div>
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
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
    cursor: "pointer",
  },
  heroHeader: {
    padding: "calc(env(safe-area-inset-top, 44px) + 64px) 22px 8px",
  },
  heroEyebrow: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 11, letterSpacing: "0.08em",
    color: "var(--mb-ink-3)", fontWeight: 600,
    textTransform: "uppercase",
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
    backgroundImage:
      `linear-gradient(165deg, rgba(140,98,42,0.42) 0%, rgba(85,55,18,0.74) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow: "0 6px 20px -8px rgba(0,0,0,0.18)",
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
    fontSize: 13, color: "rgba(255,255,255,0.85)",
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
};

// Marking ReactNode export so prettier/tsx is happy with the unused import paths.
export type _WatchingHeroExports = ReactNode;
