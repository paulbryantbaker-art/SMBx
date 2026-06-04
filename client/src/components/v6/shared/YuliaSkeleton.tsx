/**
 * YuliaSkeleton — the shared "Yulia is updating" loading state. Greyed
 * placeholder lines that mimic content (title line + thinner text lines at
 * varying widths) with a subtle shimmer, used ANYWHERE a Yulia read/brief is
 * refreshing so the surface never shows scaffold/placeholder content mid-load.
 *
 * Relies on the .wk-skel / .wk-skel-label / .wk-skel-dot tokens in workspace.css.
 * Render inside a `.wk-content` subtree (every mode root is one).
 */
import type { CSSProperties } from "react";

export function YuliaSkeleton({
  rows = 3,
  label = "Yulia is updating…",
  style,
}: {
  rows?: number;
  /** Pulsing footer label; pass null to hide it. */
  label?: string | null;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ padding: "13px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)" }}
        >
          <div className="wk-skel" style={{ height: 11, width: i === 0 ? "58%" : "44%", borderRadius: 6 }} />
          <div className="wk-skel" style={{ height: 9, width: "92%", marginTop: 11, borderRadius: 6 }} />
          <div className="wk-skel" style={{ height: 9, width: i === 0 ? "74%" : "62%", marginTop: 7, borderRadius: 6 }} />
        </div>
      ))}
      {label && (
        <div className="wk-skel-label"><span className="wk-skel-dot" />{label}</div>
      )}
    </div>
  );
}
