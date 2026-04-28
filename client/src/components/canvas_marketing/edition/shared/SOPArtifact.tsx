/* SOPArtifact.tsx — SBA SOP 50 10 8 deal-structure mock used in
 * Capability 04. White card with mono key/value rows and a footer
 * strip showing "lender-approved · financeable" status.
 *
 * Tokens: --canvas-paper, --rule, --ink-*, --font-mono, --terra
 */

import { CSSProperties } from "react";

interface Row {
  k: string;
  v: string;
  flag?: boolean;     // dimmed (var(--ink-tertiary))
}

const ROWS: Row[] = [
  { k: "Purchase price",            v: "$5,400,000" },
  { k: "Buyer equity injection",    v: "$540,000 · 10%" },
  { k: "SBA 7(a) loan",             v: "$3,780,000 · 70%" },
  { k: "Seller note (full standby)",v: "$1,080,000 · 20%" },
  { k: "Personal guarantee",        v: "Required",        flag: true },
  { k: "Phased buyout",             v: "Disallowed",      flag: true },
];

const cardStyle: CSSProperties = {
  background: "var(--canvas-paper)",
  border: "1px solid var(--rule)",
  borderRadius: 4,
  padding: "22px 26px",
  display: "grid",
  gap: 14,
  boxShadow: "0 8px 22px rgba(26, 24, 20, 0.06)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
};

const dateStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 9.5,
  color: "var(--ink-tertiary)",
  fontVariantNumeric: "tabular-nums lining-nums",
};

const footerStyle: CSSProperties = {
  paddingTop: 8,
  borderTop: "1px solid var(--ink-primary)",
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--ink-tertiary)",
  letterSpacing: "0.06em",
};

const rowBaseStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  fontFamily: "var(--font-mono)",
  fontSize: 11.5,
  lineHeight: 1.4,
};

export function SOPArtifact() {
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div className="eyebrow" style={{ fontSize: 9.5 }}>
          SBA SOP 50 10 8 · STRUCTURE
        </div>
        <div style={dateStyle}>Effective Jun 2025</div>
      </div>

      <div className="grid gap-0">
        {ROWS.map((row, i) => (
          <div
            key={row.k}
            style={{
              ...rowBaseStyle,
              borderBottom: i < ROWS.length - 1 ? "1px solid var(--rule)" : "none",
              color: row.flag ? "var(--ink-tertiary)" : "var(--ink-primary)",
            }}
          >
            <span>{row.k}</span>
            <span
              className="figs-tab"
              style={{ fontWeight: row.flag ? 400 : 600 }}
            >
              {row.v}
            </span>
          </div>
        ))}
      </div>

      <div style={footerStyle}>
        <span>↳ Lender-approved · 11 prior closes</span>
        <span style={{ color: "var(--terra)" }}>● financeable</span>
      </div>
    </div>
  );
}
