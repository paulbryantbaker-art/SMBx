/* YuliaWalkthroughV22.tsx — Claude Design's V22b chat rail, line-for-line.
 *
 * The canonical Edition chat rail. Fixed-position, transparent, recessive —
 * sits on the warm app background and reads as a margin column, not a
 * panel. AppShell suppresses its own ChatDock + chat column when an
 * Edition route is active; this is the only chat surface a logged-out
 * marketing visitor sees on `/`.
 *
 * No portal. The rail is rendered by AppShell directly inside the
 * isEditionRoute branch and relies on AppShell NOT having a transformed
 * ancestor at the time of render (which it doesn't on desktop without
 * keyboard-lift — `transform: translateY(0)` is skipped, not applied).
 *
 * Geometry / mobile handling are spec'd in client/src/index.css:
 *   .smbx-edition-route { margin-left: clamp(360px, 30vw, 480px); }
 *   @media (max-width: 1023px) { .smbx-yulia-rail { display: none; } }
 *
 * Used by the V22 home route only. V21 routes (/journey, /how-it-works,
 * /pricing) keep using YuliaWalkthroughRail with class .smbx-walkthrough-rail
 * until CD ships V22 versions for those pages.
 *
 * Component body is the v22b spec verbatim. Do not modify — modify the
 * AppShell wiring or the marketing CSS instead.
 */

import { CSSProperties, useState } from "react";

interface YuliaWalkthroughProps {
  onSend?: (text: string) => void;
  onPersonaChange?: (id: string) => void;
}

const wrapStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  /* v22b canonical width. Three CSS rules in client/src/index.css mirror
     this value (the !important width pin, the route's padding-left, and
     the tab strip's margin-left) — keep all four in lockstep. */
  width: "clamp(360px, 30vw, 480px)",
  background: "transparent",
  fontFamily: "var(--font-body)",
  zIndex: 30,
  display: "flex",
  flexDirection: "column",
  padding: "20px 22px 18px 28px",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  paddingBottom: 14,
  borderBottom: "1px solid var(--rule)",
};

const avatarStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "var(--ink-primary)",
  color: "var(--ink-inverse)",
  display: "grid",
  placeItems: "center",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: "-0.02em",
  flexShrink: 0,
};

const nameStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 14.5,
  letterSpacing: "-0.012em",
  color: "var(--ink-primary)",
};

const statusStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 9.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
  marginTop: 2,
};

const dotStyle: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "var(--terra)",
  animation: "pulse-dot 2.4s ease-in-out infinite",
};

const messageWrapStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden auto",
  padding: "18px 0",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const messageStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--ink-secondary)",
  margin: 0,
  textWrap: "pretty",
  letterSpacing: "-0.003em",
};

const composerWrapStyle: CSSProperties = {
  paddingTop: 12,
  borderTop: "1px solid var(--rule)",
};

const composerStyle: CSSProperties = {
  background: "var(--canvas-paper)",
  border: "1px solid var(--rule)",
  borderRadius: 22,
  padding: "6px 6px 6px 16px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 1px 2px rgba(26, 24, 20, 0.04)",
};

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  color: "var(--ink-primary)",
  padding: "8px 0",
};

const subStyle: CSSProperties = {
  marginTop: 10,
  paddingLeft: 4,
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-quaternary)",
};

const PERSONA_PROMPTS: { id: string; label: string }[] = [
  { id: "searcher", label: "I'm hunting a business to buy" },
  { id: "advisor",  label: "I represent the seller" },
  { id: "broker",   label: "Show me a sample CIM" },
];

export function YuliaWalkthroughV22({ onSend, onPersonaChange }: YuliaWalkthroughProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onSend?.(draft.trim());
    setDraft("");
  };

  return (
    <aside className="smbx-edition smbx-yulia-rail" style={wrapStyle}>
      {/* Avatar header */}
      <header style={headerStyle}>
        <div style={avatarStyle}>Y</div>
        <div className="flex-1 min-w-0">
          <div style={nameStyle}>Yulia</div>
          <div style={statusStyle}>
            <span style={dotStyle} />
            ready
          </div>
        </div>
        <button
          aria-label="collapse"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-quaternary)",
            fontSize: 16,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
        >
          ⌄
        </button>
      </header>

      {/* Walk-in messages — three lines framing the page on the right */}
      <div style={messageWrapStyle}>
        <p style={messageStyle}>
          <span className="editorial">Hi.</span> I&apos;m Yulia — the AI deal team you&apos;ll work with on smbx.
        </p>
        <p style={messageStyle}>
          The page on your right is your <em>welcome tour</em>. Scroll it,
          or just talk to me here. I&apos;m already running.
        </p>
        <p style={messageStyle}>
          Try: <em>paste a CIM excerpt</em>, ask about a deal you&apos;re
          working, or tell me what you do. I&apos;ll show you what I can
          produce.
        </p>

        {/* Persona quick-picks */}
        {PERSONA_PROMPTS.map((p) => (
          <PromptChip
            key={p.id}
            onClick={() => {
              setDraft(p.label + ".");
              onPersonaChange?.(p.id);
            }}
          >
            {p.label}
          </PromptChip>
        ))}
      </div>

      {/* Composer */}
      <div style={composerWrapStyle}>
        <div style={composerStyle}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Tell Yulia what you need…"
            style={inputStyle}
          />
          <button
            onClick={submit}
            aria-label="send"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: draft ? "var(--terra)" : "var(--ink-quaternary)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              lineHeight: 1,
              transition: "background 200ms ease",
              boxShadow: draft ? "0 4px 10px rgba(212, 113, 78, 0.30)" : "none",
            }}
          >
            ↑
          </button>
        </div>
        <div style={subStyle}>anonymous · no signup needed</div>
      </div>
    </aside>
  );
}

function PromptChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "rgba(26, 24, 20, 0.04)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        padding: "9px 13px",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        color: "var(--ink-secondary)",
        cursor: "pointer",
        letterSpacing: "-0.003em",
        transition: "background 180ms, border-color 180ms, color 180ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(212, 113, 78, 0.06)";
        e.currentTarget.style.borderColor = "var(--terra)";
        e.currentTarget.style.color = "var(--ink-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(26, 24, 20, 0.04)";
        e.currentTarget.style.borderColor = "var(--rule)";
        e.currentTarget.style.color = "var(--ink-secondary)";
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          color: "var(--terra)",
          marginRight: 4,
        }}
      >
        ↗
      </span>
      {children}
    </button>
  );
}
