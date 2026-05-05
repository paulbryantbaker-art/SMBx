/* V6 Mobile — Brief screen (App Store editorial story).
   Date eyebrow → editorial gradient story card with sparkline → 3 picks list.
   Picks match desktop's Big Fake Deal seed for sample-data consistency. */

import { type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { PickRow } from "../PickRow";
import type { Verdict } from "../types";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import type { MobilePick } from "../../../../hooks/useMobileDeals";

interface BriefProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onAvatarClick: () => void;
  onSearch: () => void;
  /** Authed user's top 3 picks (null = anon or empty → samples render). */
  userPicks: MobilePick[] | null;
}

interface Pick {
  rank: number;
  id: string;
  name: string;
  sub: string;
  fit: number;
  kind: Verdict;
}

const SAMPLE_PICKS: Pick[] = [
  { rank: 1, id: "deal-bigfake",    name: "Big Fake Deal · sample",       sub: "Recurring rev · honest capex story",         fit: 92, kind: "pursue" },
  { rank: 2, id: "deal-pest",       name: "Pest Control · FL",            sub: "92% on monthly contracts · add-back rich",   fit: 84, kind: "pursue" },
  { rank: 3, id: "deal-electrical", name: "Electrical Contractor · TX",   sub: "Margins good but 60% one customer",          fit: 78, kind: "watch"  },
];

export function BriefScreen({ isAnon, initials, onOpenDeal, onAvatarClick, onSearch, userPicks }: BriefProps) {
  const PICKS: Pick[] = userPicks ?? SAMPLE_PICKS;
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Brief" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch} />
      <LargeTitle>Brief</LargeTitle>

      {/* Date + sample callout */}
      <div style={{ padding: "0 22px 12px" }}>
        <div style={Br.dateLine}>
          {isAnon ? "Sample brief · Friday, March 27 · screened from 142 sourced" : "Friday, March 27 · screened from 142 sourced"}
        </div>
        {isAnon && (
          <div style={Br.sampleLine}>
            This is what Yulia sends every morning. <span style={{ color: "var(--mb-accent-ink)", fontWeight: 700 }}>Start free</span> to get yours.
          </div>
        )}
      </div>

      {/* Editorial story card */}
      <div style={{ padding: "8px 16px 0" }}>
        <div
          className="mb-tap"
          role="button"
          tabIndex={0}
          aria-label="Open today's brief"
          onClick={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDeal("deal-bigfake", "Big Fake Deal · sample");
            }
          }}
          style={Br.editorial}
        >
          <div style={{ padding: "24px 22px 12px" }}>
            <div className="mb-eyebrow">YULIA &middot; 3 PICKS &middot; 10 MIN</div>
            <h2 style={Br.editorialH2}>
              Three worth your<br/>10 minutes today
            </h2>
            <p style={Br.editorialDek}>
              Recurring revenue, honest add-backs, and one I&rsquo;d pass on.
            </p>
          </div>
          <div style={{ height: 32 }} aria-hidden="true" />
        </div>
      </div>

      {/* Picks list */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-eyebrow">{isAnon ? "RANKED · SAMPLE" : "RANKED"}</div>
            <div className="mb-section-title">Today&rsquo;s three picks</div>
          </div>
          {PICKS.map((p, i) => (
            <PickRow
              key={p.id}
              rank={p.rank}
              name={p.name}
              sub={p.sub}
              fit={p.fit}
              kind={p.kind}
              last={i === PICKS.length - 1}
              onTap={() => onOpenDeal(p.id, p.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const Br: Record<string, CSSProperties> = {
  dateLine: { fontSize: 14, color: "var(--mb-ink-3)" },
  sampleLine: {
    fontSize: 13, color: "var(--mb-ink-3)",
    marginTop: 6, lineHeight: 1.45, textWrap: "pretty",
  },
  editorial: {
    borderRadius: 22, overflow: "hidden",
    /* Overlay deepened 2025-05-05 — top stop +10%, bottom stop +12%
       so the editorial card pops on a white page like the home hero
       does. Also added blend-mode multiply so the watercolor texture
       reads through more vividly instead of being flatly washed. */
    backgroundImage:
      `linear-gradient(165deg, rgba(140,98,42,0.50) 0%, rgba(85,55,18,0.84) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundBlendMode: "multiply, normal",
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
