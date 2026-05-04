/* V6 Mobile — Brief screen (App Store editorial story).
   Date eyebrow → editorial gradient story card with sparkline → 3 picks list.
   Picks match desktop's Big Fake Deal seed for sample-data consistency. */

import { type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { YIcon } from "../YIcon";
import type { Verdict, YIconKind } from "../types";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import type { MobilePick } from "../../../../hooks/useMobileDeals";

interface BriefProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onAvatarClick: () => void;
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

export function BriefScreen({ isAnon, initials, onOpenDeal, onAvatarClick, userPicks }: BriefProps) {
  const PICKS: Pick[] = userPicks ?? SAMPLE_PICKS;
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Brief" initials={initials} onAvatarClick={onAvatarClick} />
      <LargeTitle onColor>Brief</LargeTitle>

      {/* Date + sample callout */}
      <div style={{ padding: "0 22px 12px" }}>
        <div style={Br.dateLine}>
          {isAnon ? "Sample brief · Friday, March 27 · screened from 142 sourced" : "Friday, March 27 · screened from 142 sourced"}
        </div>
        {isAnon && (
          <div style={Br.sampleLine}>
            This is what Yulia sends every morning. <span style={{ color: "#fff", fontWeight: 700 }}>Start free</span> to get yours.
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
            <BriefPick
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

function BriefPick({
  rank, name, sub, fit, kind, last, onTap,
}: { rank: number; name: string; sub: string; fit: number; kind: Verdict; last?: boolean; onTap: () => void }) {
  const fitColor =
    kind === "pursue" ? "var(--mb-accent)" :
    kind === "pass"   ? "var(--mb-danger)" :
                        "var(--mb-warn)";
  const iconKind: YIconKind = kind === "pursue" ? "cool" : "default";
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
        padding: "12px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 22, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <div style={Br.rank}>{rank}</div>
      <YIcon size={48} kind={iconKind} radius={11} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={Br.pickName}>{name}</div>
        <div style={Br.pickSub}>{sub}</div>
      </div>
      <div style={Br.fitWrap}>
        <div className="mb-mono" style={{ fontSize: 18, fontWeight: 700, color: fitColor, letterSpacing: "-0.5px" }}>{fit}</div>
        <div style={Br.fitLabel}>FIT</div>
      </div>
    </div>
  );
}

const Br: Record<string, CSSProperties> = {
  dateLine: { fontSize: 14, color: "#fff" },
  sampleLine: {
    fontSize: 13, color: "#fff",
    marginTop: 6, lineHeight: 1.45, textWrap: "pretty",
  },
  editorial: {
    borderRadius: 22, overflow: "hidden",
    backgroundImage:
      `linear-gradient(165deg, rgba(140,98,42,0.40) 0%, rgba(85,55,18,0.72) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    color: "#fff", position: "relative",
    cursor: "pointer",
    boxShadow: "0 12px 28px -12px rgba(0,0,0,0.22)",
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
  rank: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 22,
    color: "var(--mb-ink-4)", width: 22,
    flexShrink: 0,
  },
  pickName: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  pickSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 1,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  fitWrap: {
    display: "flex", alignItems: "center", gap: 4,
    paddingRight: 22, flexShrink: 0,
  },
  fitLabel: {
    fontSize: 9, color: "var(--mb-ink-4)",
    letterSpacing: 0.1, fontWeight: 600,
  },
};
