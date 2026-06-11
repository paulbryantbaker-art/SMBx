/* V6 Mobile — Shared "Yulia's pick" row.
   Single source of truth for the ranked-pick visual (rank number + YIcon
   + name/sub stack + fit score). Used by both the Brief screen's main
   ranked list and the Today screen's "Review 3 picks" teaser, so the two
   surfaces stay locked to the same design language. */

import { type CSSProperties } from "react";
import { IndustryIcon } from "./IndustryIcon";
import type { Verdict } from "./types";

export interface PickRowProps {
  rank: number;
  name: string;
  sub: string;
  /** Fit numeral — pass null when the deal has no REAL (composite- or
   *  multiple-backed) fit; the numeral block is omitted entirely rather
   *  than showing a fabricated score. */
  fit: number | null;
  kind: Verdict;
  last?: boolean;
  onTap: () => void;
}

export function PickRow({ rank, name, sub, fit, kind, last, onTap }: PickRowProps) {
  const fitColor =
    kind === "pursue" ? "var(--mb-accent)" :
    kind === "pass"   ? "var(--mb-danger)" :
                        "var(--mb-warn)";
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
        padding: "14px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 22, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <div style={S.rank}>{rank}</div>
      <IndustryIcon name={name} verdict={kind} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.pickName}>{name}</div>
        <div style={S.pickSub}>{sub}</div>
      </div>
      {typeof fit === "number" && (
        <div style={S.fitWrap}>
          <div className="mb-mono" style={{ fontSize: 18, fontWeight: 700, color: fitColor, letterSpacing: "-0.5px" }}>{fit}</div>
          <div style={S.fitLabel}>FIT</div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  rank: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 22,
    color: "var(--mb-ink-4)", width: 22,
    flexShrink: 0,
  },
  pickName: {
    fontSize: 16, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.25px",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  pickSub: {
    fontSize: 13.5, color: "var(--mb-ink-3)", marginTop: 2,
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
