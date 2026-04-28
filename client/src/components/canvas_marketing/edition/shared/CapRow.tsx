/* CapRow.tsx — full-width capability row.
 *
 * Used for Capability 01 (the CIM) and 04 (the structure).
 * Two-column grid: text left (1fr), artifact right (1.3fr), 48px gap.
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │ 01    THE BOOK                                       │
 *   │       under an hour                                  │
 *   │                                                      │
 *   │       The 100-page sell-side book.                   │
 *   │       First draft before your second coffee.         │   [ artifact ]
 *   │                                                      │
 *   │       Body copy describing the capability …          │
 *   │                                                      │
 *   │       ──────────────────────────────────────         │
 *   │       The same quality a PE buyer expects.           │
 *   └──────────────────────────────────────────────────────┘
 *
 * Tokens: --font-display, --font-editorial, --font-mono, --ink-*, --rule
 */

import { CSSProperties, ReactNode } from "react";

interface CapRowProps {
  n: string;             // "01"
  kicker: string;        // "THE BOOK"
  time: string;          // "under an hour"
  title: ReactNode;      // headline (mixed display + editorial italic)
  body: ReactNode;       // paragraph copy
  meta: string;          // italic kicker line below body (one sentence)
  artifact: ReactNode;   // <CIMArtifact /> or <SOPArtifact />
}

const numeralStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 64,
  color: "var(--ink-primary)",
  letterSpacing: "-0.04em",
  lineHeight: 1,
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
  fontSize: "clamp(24px, 2.6vw, 34px)",
  lineHeight: 1.06,
  margin: "8px 0 16px",
  textWrap: "balance",
  letterSpacing: "-0.02em",
};

const bodyStyle: CSSProperties = {
  fontSize: 15,
  marginBottom: 16,
};

const metaStyle: CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontStyle: "italic",
  fontSize: 13.5,
  color: "var(--ink-tertiary)",
  margin: 0,
  paddingTop: 12,
  borderTop: "1px solid var(--rule)",
};

export function CapRow({ n, kicker, time, title, body, meta, artifact }: CapRowProps) {
  return (
    <div
      className="grid items-center"
      style={{ gridTemplateColumns: "1fr 1.3fr", gap: 48 }}
    >
      <div>
        <div className="flex items-baseline gap-3" style={{ marginBottom: 12 }}>
          <span style={numeralStyle}>{n}</span>
          <div className="flex-1">
            <div className="eyebrow" style={{ marginBottom: 4 }}>{kicker}</div>
            <div style={timeStyle}>{time}</div>
          </div>
        </div>
        <h3 style={titleStyle}>{title}</h3>
        <p className="body" style={bodyStyle}>{body}</p>
        <p style={metaStyle}>{meta}</p>
      </div>
      {artifact}
    </div>
  );
}
