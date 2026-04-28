/* CIMArtifact.tsx — fake CIM page mock used in Capability 01.
 *
 * Aspect 4:3 white paper card with header strip, headline, justified
 * editorial body copy, and a blinking text cursor at the end (simulates
 * Yulia drafting in real time). Footer strip: page number + status.
 *
 * Animation: cursor blinks via @keyframes type-cursor in tokens.css.
 *
 * Tokens: --canvas-paper, --rule, --ink-*, --font-mono, --font-editorial,
 *         --font-display, --terra
 */

import { CSSProperties } from "react";

const cardStyle: CSSProperties = {
  background: "var(--canvas-paper)",
  border: "1px solid var(--rule)",
  borderRadius: 4,
  overflow: "hidden",
  aspectRatio: "4 / 3",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 22px rgba(26, 24, 20, 0.06)",
};

const stripStyle: CSSProperties = {
  padding: "10px 18px",
  borderBottom: "1px solid var(--rule)",
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "var(--font-mono)",
  fontSize: 9.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
};

const headlineStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: "-0.02em",
  marginBottom: 16,
};

const proseStyle: CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontSize: 14,
  lineHeight: 1.5,
  color: "var(--ink-secondary)",
  margin: 0,
};

const cursorStyle: CSSProperties = {
  display: "inline-block",
  width: 6,
  height: 12,
  background: "var(--ink-primary)",
  verticalAlign: "baseline",
  marginLeft: 1,
  animation: "type-cursor 1s steps(2) infinite",
};

const footerStyle: CSSProperties = {
  padding: "10px 18px",
  borderTop: "1px solid var(--rule)",
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "var(--font-mono)",
  fontSize: 9.5,
  color: "var(--ink-tertiary)",
  letterSpacing: "0.06em",
  fontVariantNumeric: "tabular-nums lining-nums",
};

export function CIMArtifact() {
  return (
    <div style={cardStyle}>
      <div style={stripStyle}>
        <span>Confidential Information Memorandum</span>
        <span style={{ color: "var(--terra)" }}>● drafting</span>
      </div>
      <div style={{ flex: 1, padding: "28px 44px" }}>
        <div className="eyebrow" style={{ marginBottom: 10, fontSize: 9.5 }}>
          SECTION 3.2
        </div>
        <div style={headlineStyle}>Operations &amp; Customer Concentration</div>
        <p style={proseStyle}>
          The Company&apos;s industrial services revenue is anchored by a
          thirty-year operating history in the East Texas corridor, with a
          customer base concentrated in mid-market manufacturing. The top
          five accounts represent 38% of trailing-twelve revenue — a profile
          that, while concentrated, reflects multi-decade relationships and
          a pattern of contract renewal at or near&nbsp;
          <span style={cursorStyle} />
        </p>
      </div>
      <div style={footerStyle}>
        <span>page 24 of 100</span>
        <span>· · · redline-ready</span>
      </div>
    </div>
  );
}
