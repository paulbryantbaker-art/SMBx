/**
 * CDStarter — the "new tab" / first-run welcome surface, ported to the
 * Claude-Design (cool/indigo) language. Visual target is the CD empty/welcome
 * state (states.jsx › V6EmptyState): a rested centered card with a soft
 * watercolor chip, editorial serif title, and a small set of starting points.
 *
 * This is a static welcome surface — no live data. It mirrors V6StarterView's
 * curated starting points (the same six prompts) but drops the decorative
 * per-card uppercase eyebrows (PIPELINE / VALUATION / …) per the locked
 * no-gratuitous-eyebrow rule. Every card routes into chat via onTalkToYulia;
 * there are no dead-end CTAs. Props match V6StarterView 1:1 (onTalkToYulia?).
 *
 * Mounts under `.cd-root` (cdTokens.css); only `--cd-*` tokens.
 */
import { type CSSProperties } from "react";
import { CDIcon, type CDIconName } from "../kit/cdUi";

interface CDStarterProps {
  onTalkToYulia?: (prompt: string) => void;
}

/* The same starting points V6StarterView offered — each routes to chat.
   `icon` replaces V6's mono eyebrow kicker with a quiet CD line glyph. */
const STARTER_PROMPTS: { icon: CDIconName; label: string; prompt: string }[] = [
  { icon: "portfolio", label: "What's worth my time today?",    prompt: "Walk me through what's worth my attention in my pipeline today." },
  { icon: "scenario",  label: "Run a quick valuation",          prompt: "Help me run a quick valuation. What numbers do you need from me?" },
  { icon: "search",    label: "Find new opportunities",         prompt: "Help me find new acquisition opportunities. What's my thesis?" },
  { icon: "doc",       label: "Draft an LOI / NDA / CIM",       prompt: "I need to draft a deal document. Walk me through the options." },
  { icon: "analysis",  label: "Compare two deals side-by-side", prompt: "Help me compare two deals side-by-side." },
  { icon: "sparkle",   label: "Show me what you can do",        prompt: "Give me a quick tour of what you can do in this app." },
];

export function CDStarter({ onTalkToYulia }: CDStarterProps) {
  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  return (
    <div
      className="cd-root cd-scrollable"
      style={{
        background: "var(--cd-canvas)", height: "100%", overflow: "auto",
        padding: "30px 34px 60px", display: "grid", placeItems: "center",
      }}
    >
      <div style={S.shell}>
        {/* soft watercolor chip — the CD welcome mark */}
        <div style={S.chip} aria-hidden>
          <CDIcon name="sparkle" size={26} color="var(--cd-accent-strong)" />
        </div>

        <div>
          <h1 style={S.h1}>What can Yulia help with?</h1>
          <p style={S.tag}>
            Pick a starting point, or just type into the chat. Yulia is aware of every tab you have open.
          </p>
        </div>

        <div style={S.grid}>
          {STARTER_PROMPTS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => ask(p.prompt)}
              style={S.card}
              className="cd-starter-card"
            >
              <span style={S.cardIcon}>
                <CDIcon name={p.icon} size={17} color="var(--cd-accent)" />
              </span>
              <span style={S.cardLabel}>{p.label}</span>
              <CDIcon name="chevright" size={14} color="var(--cd-ink-4)" style={S.cardArrow} />
            </button>
          ))}
        </div>

        <div style={S.lineNote}>
          Yulia shows analysis &amp; implications — not transaction advice.
        </div>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  shell: {
    width: "100%", maxWidth: 620, display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center", gap: 18,
  },
  chip: {
    width: 64, height: 64, borderRadius: 20, position: "relative",
    display: "grid", placeItems: "center", overflow: "hidden",
    background:
      "radial-gradient(60% 60% at 30% 25%, color-mix(in oklch, var(--cd-accent), #fff 62%), transparent 70%)," +
      "radial-gradient(55% 55% at 75% 70%, color-mix(in oklch, var(--cd-c3), #fff 58%), transparent 70%)," +
      "radial-gradient(50% 50% at 70% 25%, color-mix(in oklch, var(--cd-c4), #fff 62%), transparent 70%)," +
      "var(--cd-accent-soft)",
    boxShadow: "inset 0 0 0 1px var(--cd-line)",
  },
  h1: {
    margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 32,
    lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--cd-ink)",
    textWrap: "balance",
  },
  tag: {
    margin: "10px auto 0", maxWidth: 440, fontSize: 14, lineHeight: 1.55,
    color: "var(--cd-ink-2)", textWrap: "pretty",
  },
  grid: {
    width: "100%", display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "var(--cd-gap)", marginTop: 4,
  },
  card: {
    all: "unset", boxSizing: "border-box", cursor: "pointer",
    position: "relative", display: "flex", alignItems: "center", gap: 12,
    padding: "14px 38px 14px 14px", minHeight: 56,
    background: "var(--cd-surface)", border: "1px solid var(--cd-line)",
    borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-sm)",
    textAlign: "left",
  },
  cardIcon: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--cd-accent-soft)",
  },
  cardLabel: {
    flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600,
    letterSpacing: "-0.01em", lineHeight: 1.35, color: "var(--cd-ink)",
    fontFamily: "var(--cd-sans)",
  },
  cardArrow: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
  },
  lineNote: {
    fontSize: 10.5, color: "var(--cd-ink-4)", marginTop: 2,
  },
};
