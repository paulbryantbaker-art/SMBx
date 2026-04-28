/* CapCompact.tsx — half-width capability card.
 *
 * Used for Capabilities 02 and 03, side-by-side in a 1fr / 1fr grid.
 * No artifact image — just the headline + body + italic meta line.
 *
 *   02    THE NUMBERS    ────────────    while you read this
 *   Three years of financials. Normalized.
 *   Body copy …
 *   Decision-grade numbers. On a Tuesday.
 */

import { CSSProperties, ReactNode } from "react";

interface CapCompactProps {
  n: string;
  kicker: string;
  time: string;
  title: string;
  body: ReactNode;
  meta: string;
}

const numeralStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 42,
  color: "var(--ink-primary)",
  letterSpacing: "-0.036em",
  lineHeight: 1,
};

const ruleStyle: CSSProperties = {
  flex: 1,
  height: 1,
  background: "var(--rule)",
};

const timeStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  color: "var(--ink-tertiary)",
  fontVariantNumeric: "tabular-nums lining-nums",
};

const titleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 24,
  lineHeight: 1.1,
  margin: "6px 0 14px",
  textWrap: "balance",
  letterSpacing: "-0.016em",
};

const bodyStyle: CSSProperties = {
  fontSize: 14.5,
  marginBottom: 14,
};

const metaStyle: CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontStyle: "italic",
  fontSize: 13,
  color: "var(--ink-tertiary)",
  margin: 0,
};

export function CapCompact({ n, kicker, time, title, body, meta }: CapCompactProps) {
  return (
    <div>
      <div className="flex items-baseline gap-3" style={{ marginBottom: 12 }}>
        <span style={numeralStyle}>{n}</span>
        <span className="eyebrow">{kicker}</span>
        <span style={ruleStyle} />
        <span style={timeStyle}>{time}</span>
      </div>
      <h3 style={titleStyle}>{title}</h3>
      <p className="body" style={bodyStyle}>{body}</p>
      <p style={metaStyle}>{meta}</p>
    </div>
  );
}
