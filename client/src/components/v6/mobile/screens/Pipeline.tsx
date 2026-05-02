/* V6 Mobile — Pipeline screen.
   Category chips → NEW TODAY featured hero → Yulia is watching list.
   NEW TODAY featured uses Big Fake Deal · sample for sample-data consistency
   with the desktop seed (per copy-resolution rule). */

import { useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { YIcon } from "../YIcon";
import { MobileIcon } from "../icons";
import type { YIconKind } from "../types";

interface PipelineProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onAvatarClick: () => void;
}

interface ChipDef { id: string; label: string; n: number }
const CHIPS: ChipDef[] = [
  { id: "sourced",   label: "Sourced",   n: 142 },
  { id: "screened",  label: "Screened",  n: 28  },
  { id: "in-review", label: "In review", n: 4   },
  { id: "pursuing",  label: "Pursuing",  n: 2   },
  { id: "watching",  label: "Watching",  n: 87  },
];

interface WatchDeal { id: string; icon: YIconKind; name: string; sub: string; pill: string }
const WATCHING: WatchDeal[] = [
  { id: "wpest",     icon: "cool",    name: "Pest Control Roll-up · FL",   sub: "$4.1M rev · Orlando",     pill: "$1.4M SDE" },
  { id: "welec",     icon: "default", name: "Electrical Contractor · TX",  sub: "$8.7M rev · Austin",      pill: "Watch" },
  { id: "wmarina",   icon: "cool",    name: "Marina Holdings · FL",        sub: "$8.2M rev · Tampa Bay",   pill: "Pursue" },
  { id: "wlogistic", icon: "default", name: "Boutique Logistics · GA",     sub: "$6.7M rev · Atlanta",     pill: "Pursue" },
];

export function PipelineScreen({ isAnon, initials, onOpenDeal, onAvatarClick }: PipelineProps) {
  const [activeChip, setActiveChip] = useState<string>("in-review");

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 140 }}>
      <GlassTopBar title="Pipeline" initials={initials} onAvatarClick={onAvatarClick} />
      <LargeTitle>Pipeline</LargeTitle>

      {/* Logged-out callout */}
      {isAnon && (
        <div style={{ padding: "0 22px 14px" }}>
          <div style={P.calloutText}>
            A live sample pipeline. <span style={{ color: "var(--mb-accent-ink)", fontWeight: 600 }}>Tap any deal</span> to see how Yulia thinks &mdash; your real pipeline lives here once you start.
          </div>
        </div>
      )}

      {/* Category chips */}
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

      {/* New today */}
      <div style={{ padding: "0 22px 8px" }}>
        <div className="mb-section-eyebrow">{isAnon ? "VIEW SAMPLE · NEW TODAY" : "NEW TODAY"}</div>
        <div className="mb-section-title">Big Fake Deal &middot; sample</div>
        <div style={P.subText}>The strongest source this week &mdash; tap to see why.</div>
      </div>

      <div style={{ padding: "12px 16px 4px" }}>
        <div
          className="mb-tap"
          role="button"
          tabIndex={0}
          aria-label="Open Big Fake Deal sample"
          onClick={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDeal("deal-bigfake", "Big Fake Deal · sample");
            }
          }}
          style={P.featured}
        >
          <div style={{ height: 200, position: "relative" }}>
            <div style={P.featuredGlow} aria-hidden="true" />
            <div style={P.featuredCorner}>
              <div className="mb-eyebrow">FIT 92 &middot; PURSUE</div>
              <div style={P.featuredHeadline}>
                Recurring revenue.<br/>Honest capex story.
              </div>
            </div>
            <div style={P.featuredRev}>$5.4M REV</div>
          </div>
          <div style={P.featuredFooter}>
            <YIcon size={42} kind="cool" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={P.featuredName}>Big Fake Deal &middot; sample</div>
              <div style={P.featuredSub}>East Texas &middot; sample seed</div>
            </div>
            <button
              type="button"
              className="mb-get-pill dark"
              style={{ padding: "6px 16px", fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeal("deal-bigfake", "Big Fake Deal · sample");
              }}
            >Dig in</button>
          </div>
        </div>
      </div>

      {/* Yulia is watching */}
      <div style={{ padding: "24px 22px 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <h2 style={P.watchTitle}>Yulia is watching</h2>
          <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />
        </div>
        <div style={P.subText}>Sample sources Yulia revisits weekly &mdash; yours go here.</div>
      </div>

      <div className="mb-as-card" style={{ margin: "12px 16px 0", padding: "4px 0" }}>
        {WATCHING.map((w, i) => (
          <PipeRow
            key={w.id}
            icon={w.icon}
            name={w.name}
            sub={w.sub}
            pill={w.pill}
            last={i === WATCHING.length - 1}
            onTap={() => onOpenDeal(w.id, w.name)}
          />
        ))}
      </div>
    </div>
  );
}

function PipeRow({
  icon, name, sub, pill, last, onTap,
}: { icon: YIconKind; name: string; sub: string; pill: string; last?: boolean; onTap: () => void }) {
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
        padding: "10px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 18, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <YIcon size={48} kind={icon} radius={11} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={P.rowName}>{name}</div>
        <div style={P.rowSub}>{sub}</div>
      </div>
      <button
        type="button"
        className="mb-get-pill"
        style={{ padding: "5px 14px", fontSize: 13, marginRight: 18 }}
        onClick={(e) => { e.stopPropagation(); onTap(); }}
      >{pill}</button>
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
    fontSize: 16, color: "var(--mb-ink-3)", marginTop: 2,
    textWrap: "pretty",
  },
  featured: {
    borderRadius: 18, overflow: "hidden",
    background: "linear-gradient(160deg, #A9C4E5 0%, #7FA8D9 100%)",
    color: "#fff", position: "relative",
    boxShadow: "0 8px 22px -10px rgba(0,0,0,0.25)",
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
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.1, fontWeight: 600,
  },
  featuredFooter: {
    padding: "12px 14px",
    background: "rgba(0,0,0,0.18)",
    display: "flex", alignItems: "center", gap: 12,
  },
  featuredName: {
    fontSize: 14, fontWeight: 600, color: "#fff",
  },
  featuredSub: {
    fontSize: 12, color: "rgba(255,255,255,0.7)",
  },
  watchTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px", margin: 0,
    color: "var(--mb-ink)",
  },
  rowName: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
  },
  rowSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 1,
  },
};
