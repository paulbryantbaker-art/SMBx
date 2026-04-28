/* FolioStamp.tsx — section opener.
 *
 * Anchors every <section> with a Roman-numeral / italic label / folio.
 *
 *   I  The Spine                                              §i / 06
 *
 * Layout: flex row, baseline-aligned, hairline filler between label
 * and folio. Sits at the very top of each section, above the headline.
 *
 * Tokens consumed:
 *   --font-display, --font-editorial, --font-mono
 *   --ink-primary, --ink-tertiary, --ink-quaternary
 *   --rule
 */

import { CSSProperties } from "react";

interface FolioStampProps {
  /** Roman-numeral section id, lowercase. e.g. "i", "ii", "iii". */
  section: string;
  /** Italic label, sentence case. e.g. "The Spine". */
  label: string;
  /** Total section count. e.g. "06". */
  total: string;
}

const numeralStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--ink-primary)",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontStyle: "italic",
  fontSize: 14.5,
  color: "var(--ink-tertiary)",
};

const ruleStyle: CSSProperties = {
  flex: 1,
  height: 1,
  background: "var(--rule)",
};

const folioStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--ink-quaternary)",
  fontVariantNumeric: "tabular-nums lining-nums",
};

export function FolioStamp({ section, label, total }: FolioStampProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span style={numeralStyle}>{section.toUpperCase()}</span>
      <span style={labelStyle}>{label}</span>
      <span style={ruleStyle} />
      <span style={folioStyle}>
        §{section} / {total}
      </span>
    </div>
  );
}
