/* V6 Mobile — Brief screen (App Store editorial story).
   Date line → editorial gradient story card → ranked picks list.

   Honesty rules (2026-06-11):
   - Sample picks render ONLY for anon / dev-bypass preview, and the date
     line labels them "Sample brief".
   - A real signed-in user gets their real picks (useMobileDeals), an
     editorial card that opens their TOP pick, and a dek computed from the
     picks' actual verdict mix — never the sample "Big Fake Deal" copy.
   - The displayed date is computed from Date.now(); the old hardcoded
     "Friday, March 27 · screened from 142 sourced" (a fabricated funnel
     claim) is gone for everyone. */

import { type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { PickRow } from "../PickRow";
import type { Verdict } from "../types";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { DEV_AUTH_BYPASS } from "../../../../hooks/useAuth";
import type { MobilePick } from "../../../../hooks/useMobileDeals";

interface BriefProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onAvatarClick: () => void;
  onSearch: () => void;
  /** Authed user's top 3 picks (null = anon or not loaded). */
  userPicks: MobilePick[] | null;
}

interface Pick {
  rank: number;
  id: string;
  name: string;
  sub: string;
  fit: number;
  /** From MobilePick: false when the fit is a synthetic ranking score (no
   *  composite/multiple). Sample picks omit it (clearly-labeled samples). */
  fitIsReal?: boolean;
  kind: Verdict;
}

const SAMPLE_PICKS: Pick[] = [
  { rank: 1, id: "deal-bigfake",    name: "Big Fake Deal · sample",       sub: "Recurring rev · honest capex story",         fit: 92, kind: "pursue" },
  { rank: 2, id: "deal-pest",       name: "Pest Control · FL",            sub: "92% on monthly contracts · add-back rich",   fit: 84, kind: "pursue" },
  { rank: 3, id: "deal-electrical", name: "Electrical Contractor · TX",   sub: "Margins good but 60% one customer",          fit: 78, kind: "watch"  },
];

const NUM_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five"];
function numWord(n: number): string {
  return NUM_WORDS[n] ?? String(n);
}

/** Today's date, computed at render — never a hardcoded sample date. */
function briefDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** Honest dek computed from the real picks' verdict mix. */
function picksDek(picks: Pick[]): string {
  const count = (k: Verdict) => picks.filter(p => p.kind === k).length;
  const parts: string[] = [];
  if (count("pursue") > 0) parts.push(`${numWord(count("pursue")).toLowerCase()} to pursue`);
  if (count("watch") > 0)  parts.push(`${numWord(count("watch")).toLowerCase()} to watch`);
  if (count("pass") > 0)   parts.push(`${numWord(count("pass")).toLowerCase()} to pass`);
  if (parts.length === 0) return "Ranked by fit.";
  const joined = parts.join(", ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + " — ranked by fit.";
}

export function BriefScreen({ isAnon, initials, onOpenDeal, onAvatarClick, onSearch, userPicks }: BriefProps) {
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Brief" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch} />
      <LargeTitle>Brief</LargeTitle>
      <BriefDigestSection isAnon={isAnon} onOpenDeal={onOpenDeal} userPicks={userPicks} />
    </div>
  );
}

export function BriefDigestSection({
  isAnon,
  onOpenDeal,
  userPicks,
}: {
  isAnon: boolean;
  onOpenDeal: (id: string, title: string) => void;
  userPicks: MobilePick[] | null;
}) {
  // Sample picks ONLY for anon / dev-bypass preview. Real signed-in users
  // get their real picks or an honest empty state — never samples.
  const showSamples = isAnon || DEV_AUTH_BYPASS;
  const PICKS: Pick[] = showSamples ? SAMPLE_PICKS : (userPicks ?? []);
  const top = PICKS[0];

  // Honest empty state for a real signed-in user with no ranked picks yet.
  if (!showSamples && PICKS.length === 0) {
    return (
      <>
        <div style={{ padding: "0 22px 12px" }}>
          <div style={Br.dateLine}>{briefDate()}</div>
        </div>
        <div style={{ padding: "8px 16px 0" }}>
          <div className="mb-as-card" style={{ padding: "24px 22px 26px" }}>
            <h2 style={Br.emptyTitle}>No ranked picks yet</h2>
            <p style={Br.emptyCopy}>
              Add deals to your pipeline and Yulia ranks the strongest ones
              here, refreshed as your deals change.
            </p>
          </div>
        </div>
      </>
    );
  }

  const headline = showSamples
    ? <>Three worth your<br/>10 minutes today</>
    : <>{numWord(PICKS.length)} worth your<br/>10 minutes today</>;
  const dek = showSamples
    ? <>Recurring revenue, honest add-backs, and one I&rsquo;d pass on.</>
    : picksDek(PICKS);
  const openTop = () => { if (top) onOpenDeal(top.id, top.name); };

  return (
    <>
      {/* Date line — computed, with an explicit sample label for guests. */}
      <div style={{ padding: "0 22px 12px" }}>
        <div style={Br.dateLine}>
          {showSamples ? `Sample brief · ${briefDate()}` : briefDate()}
        </div>
        {isAnon && (
          <div style={Br.sampleLine}>
            This is what Yulia sends every morning. <span style={{ color: "var(--mb-accent-ink)", fontWeight: 700 }}>Start free</span> to get yours.
          </div>
        )}
      </div>

      {/* Editorial story card — opens the TOP pick (real for authed users). */}
      <div style={{ padding: "8px 16px 0" }}>
        <div
          className="mb-tap"
          role="button"
          tabIndex={0}
          aria-label={top ? `Open ${top.name}` : "Open today's brief"}
          onClick={openTop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openTop();
            }
          }}
          style={Br.editorial}
        >
          <div style={{ padding: "24px 22px 12px" }}>
            <h2 style={Br.editorialH2}>{headline}</h2>
            <p style={Br.editorialDek}>{dek}</p>
          </div>
          <div style={{ height: 32 }} aria-hidden="true" />
        </div>
      </div>

      {/* Picks list */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-title">
              {PICKS.length === 1 ? "Today's pick" : `Today's ${numWord(PICKS.length).toLowerCase()} picks`}
            </div>
          </div>
          {PICKS.map((p, i) => (
            <PickRow
              key={p.id}
              rank={p.rank}
              name={p.name}
              sub={p.sub}
              // Fit honesty: synthetic (id-hash/ranking-only) fits never
              // render — null omits the numeral. Samples keep theirs.
              fit={p.fitIsReal === false ? null : p.fit}
              kind={p.kind}
              last={i === PICKS.length - 1}
              onTap={() => onOpenDeal(p.id, p.name)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const Br: Record<string, CSSProperties> = {
  dateLine: { fontSize: 14, color: "var(--mb-ink-3)" },
  sampleLine: {
    fontSize: 13, color: "var(--mb-ink-3)",
    marginTop: 6, lineHeight: 1.45, textWrap: "pretty",
  },
  emptyTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 19, fontWeight: 700, margin: 0,
    color: "var(--mb-ink)", letterSpacing: "-0.35px",
  },
  emptyCopy: {
    fontSize: 13.5, color: "var(--mb-ink-3)",
    margin: "8px 0 0", lineHeight: 1.45,
    textWrap: "pretty", maxWidth: 360,
  },
  editorial: {
    borderRadius: 22, overflow: "hidden",
    /* Overlay retuned 2026-05-05 (eve) — sienna-brown stops were muddying
       the gold watercolor texture. Switched to amber/gold (--mb-warn family)
       so the overlay clarifies the texture's hue rather than browning it. */
    backgroundImage:
      `linear-gradient(165deg, rgba(214,163,92,0.28) 0%, rgba(132,90,36,0.62) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    color: "#fff", position: "relative",
    cursor: "pointer",
    /* Verdict-tinted ambient glow (gold here, matching the texture)
       integrates the card with the white page — same recipe as the
       home hero now uses. */
    boxShadow:
      "0 14px 36px -10px rgba(140,98,42,0.32)," +
      "0 8px 20px -8px rgba(0,0,0,0.26)," +
      "inset 0 1px 0 rgba(255,255,255,0.24)," +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
  },
  editorialH2: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 30,
    letterSpacing: "-0.7px", lineHeight: 1.1,
    margin: "8px 0 6px", color: "#fff",
    textWrap: "balance",
  },
  editorialDek: {
    fontSize: 14, color: "#fff",
    margin: 0, lineHeight: 1.4,
    textWrap: "pretty",
  },
};
