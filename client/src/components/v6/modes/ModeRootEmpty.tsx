/**
 * V6ModeRootEmpty — shared empty-state for the four mode roots
 * (Docs / Analysis / Intel / Library) when an authed user has no data yet.
 *
 * UX-57 fix: previously each mode root rendered hardcoded sample arrays
 * regardless of auth state, so a brand-new authed user saw fake "Big Fake
 * Deal · sample" content masquerading as their own. Misleading.
 *
 * Chat-first: the empty state points the user back to Yulia. The mode roots
 * fill in as Yulia generates artifacts (deliverables → Docs, models →
 * Analysis, sourcing briefs → Intel, etc.). The user doesn't need a "create
 * X" button; they need to talk to Yulia.
 */
import { type CSSProperties } from "react";

interface ModeRootEmptyProps {
  /** What this mode contains, e.g., "documents" or "analyses". */
  noun: string;
  /** Headline. Defaults to "Nothing here yet." */
  headline?: string;
  /** Body, defaults to a chat-first prompt referencing Yulia. */
  body?: string;
}

export function V6ModeRootEmpty({ noun, headline, body }: ModeRootEmptyProps) {
  const defaultBody = `As you work with Yulia, your ${noun} land here automatically — generated documents, models, briefs, and the rest. For now, head to chat and start a deal.`;
  return (
    <div className="m-fade-up" style={E.wrap}>
      <div style={E.card}>
        <div className="mono" style={E.eyebrow}>EMPTY</div>
        <h2 style={E.headline}>{headline ?? "Nothing here yet."}</h2>
        <p style={E.body}>{body ?? defaultBody}</p>
      </div>
    </div>
  );
}

const E: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "55vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    maxWidth: 480,
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 14,
    padding: "26px 30px",
    boxShadow: "var(--m-elev-1)",
  },
  eyebrow: {
    fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600,
    color: "var(--m-on-surface-mid)",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.025em",
    margin: "8px 0 8px",
    color: "var(--m-on-surface)",
  },
  body: {
    fontSize: 13.5, lineHeight: 1.55,
    color: "var(--m-on-surface-mid)",
    margin: 0, maxWidth: "55ch",
  },
};
