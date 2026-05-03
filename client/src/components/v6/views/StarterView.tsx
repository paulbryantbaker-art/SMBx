import { type CSSProperties } from "react";

interface StarterViewProps {
  onTalkToYulia?: (prompt: string) => void;
}

const STARTER_PROMPTS: { label: string; prompt: string; eyebrow: string }[] = [
  { eyebrow: "PIPELINE",   label: "What's worth my time today?",     prompt: "Walk me through what's worth my attention in my pipeline today." },
  { eyebrow: "VALUATION",  label: "Run a quick valuation",           prompt: "Help me run a quick valuation. What numbers do you need from me?" },
  { eyebrow: "SOURCING",   label: "Find new opportunities",          prompt: "Help me find new acquisition opportunities. What's my thesis?" },
  { eyebrow: "DOCS",       label: "Draft an LOI / NDA / CIM",        prompt: "I need to draft a deal document. Walk me through the options." },
  { eyebrow: "ANALYSIS",   label: "Compare two deals side-by-side",  prompt: "Help me compare two deals side-by-side." },
  { eyebrow: "WALK ME",    label: "Show me what you can do",         prompt: "Give me a quick tour of what you can do in this app." },
];

export function V6StarterView({ onTalkToYulia }: StarterViewProps) {
  return (
    <div className="m-fade-up" style={{ maxWidth: 720 }}>
      <div className="mono" style={S.eyebrow}>NEW TAB</div>
      <h1 style={S.h1}>What can Yulia help with?</h1>
      <p style={S.tag}>
        Pick a starting point, or just type into the chat. Yulia is aware of every tab you have open.
      </p>

      <div style={S.grid}>
        {STARTER_PROMPTS.map(p => (
          <button
            key={p.label}
            className="m-card filled-tonal m-state tap"
            onClick={() => onTalkToYulia?.(p.prompt)}
            style={S.card}
          >
            <span className="mono" style={S.cardEyebrow}>{p.eyebrow}</span>
            <span style={S.cardLabel}>{p.label}</span>
            <span style={S.cardArrow}>&rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
    fontFamily: "var(--font-mono)",
  },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30,
    letterSpacing: "-0.03em", lineHeight: 1.1, margin: "6px 0 8px",
    color: "var(--m-on-surface)", textWrap: "balance",
  },
  tag: {
    fontSize: 13.5, lineHeight: 1.55, color: "var(--m-on-surface-mid)",
    margin: "0 0 22px", maxWidth: 520, textWrap: "pretty",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 10,
  },
  card: {
    all: "unset",
    cursor: "pointer", boxSizing: "border-box",
    display: "flex", flexDirection: "column", gap: 6,
    padding: "14px 16px",
    minHeight: 88,
    position: "relative",
  },
  cardEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
    fontFamily: "var(--font-mono)",
  },
  cardLabel: {
    fontSize: 13.5, fontWeight: 600,
    color: "var(--m-on-surface)", letterSpacing: "-0.01em",
    lineHeight: 1.35,
  },
  cardArrow: {
    position: "absolute", top: 14, right: 16,
    fontSize: 13, color: "var(--m-primary)",
  },
};
