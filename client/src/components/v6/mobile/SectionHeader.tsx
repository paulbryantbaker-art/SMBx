/* Mobile shared section header — the App Store "See All" affordance.

   A white list card's header: an optional eyebrow, a bold title, and — when the
   card is a PREVIEW of a larger list — a right-aligned chevron that turns the
   whole header into a tap target opening the full (searchable/filterable) list.
   Standardizing this in one component means every list card reads identically,
   so the gesture is learnable: "title with a › → tap to see all," exactly like
   the App Store. Cards that aren't previews simply omit onSeeAll (no chevron). */
import type { CSSProperties, ReactNode } from "react";
import { MobileIcon } from "./icons";

interface SectionHeaderProps {
  title: ReactNode;
  eyebrow?: string;
  subtitle?: ReactNode;
  /** When provided, the header becomes a tap target with a › chevron → full list. */
  onSeeAll?: () => void;
  /** Accessible label for the see-all tap target (e.g. "See all deals"). */
  seeAllAria?: string;
  /** Wrapper padding. Defaults to the standard card-section inset. */
  padding?: string;
}

export function SectionHeader({ title, eyebrow, subtitle, onSeeAll, seeAllAria, padding = "0 22px 8px" }: SectionHeaderProps) {
  const titleRow = (
    <div style={ROW}>
      <div className="mb-section-title" style={{ minWidth: 0, flex: 1 }}>{title}</div>
      {onSeeAll ? <MobileIcon name="chevron" c="var(--mb-ink-3)" size={13} /> : null}
    </div>
  );
  return (
    <div style={{ padding }}>
      {eyebrow ? <div className="mb-section-eyebrow">{eyebrow}</div> : null}
      {onSeeAll ? (
        <button type="button" onClick={onSeeAll} aria-label={seeAllAria || "See all"} style={BTN}>
          {titleRow}
        </button>
      ) : titleRow}
      {subtitle ? <div style={SUB}>{subtitle}</div> : null}
    </div>
  );
}

const ROW: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 };
const BTN: CSSProperties = { all: "unset", display: "block", width: "100%", cursor: "pointer", WebkitTapHighlightColor: "transparent" };
const SUB: CSSProperties = { fontSize: 13, color: "var(--mb-ink-3)", marginTop: 2, lineHeight: 1.4 };

export default SectionHeader;
