/* MarketingHomeV23B.tsx — The Spread (variant B · E1 direction).
 *
 * Mounted by HomeCanvas when `?v=b`. Coexists with v22b at default URL
 * and the future v23C at `?v=c`.
 *
 * Concept ("The Spread"):
 *   The home reads like four magazine spreads, one per job a reader
 *   has when they walk in:
 *     I.   Make it sellable.        (recast / valuation)
 *     II.  Take it to market.       (CIM / buyer list)
 *     III. Close the deal.          (structure / LOI)
 *     IV.  Build value after close. (PMI)
 *
 *   Each spread is structured like a real magazine article — eyebrow,
 *   editorial headline (italic-foil), drop-cap standfirst, italic-serif
 *   pull quote breaking into the margin, and 2 small artifact tiles
 *   embedded inline as illustrations. The artifacts are color-coded by
 *   industry; ~3 of 8 use full tinted backgrounds (cactus, oat, peach)
 *   so the page has color rhythm without becoming a Robinhood grid.
 *
 *   Why this direction:
 *     · "Address the reader's job, not Yulia's output." Sections are
 *       named by what the reader is trying to do, not by what we make.
 *     · Editorial voice carries. Tiles illustrate, not dominate.
 *     · Color comes from industry tints inside the tiles — keeps the
 *       Cowork DL chrome restrained while bringing variety to the work.
 *
 * Phase 1 scope (this file):
 *   Slim masthead · hero (left + live presence) · secondary CTA banner
 *   · 4 editorial spreads with embedded artifact tiles · "From the
 *   desk" closer. Hero pill input is functional (onSend + focusChat).
 *   Tile click drops a job-specific prompt into the chat rail.
 *
 *   Mock-only: artifacts are designed-from-scratch demos. Phase 2 wires
 *   real Anthropic API streaming into the live presence and one
 *   featured artifact.
 *
 * Constraints:
 *   - Tokens only — no hardcoded colors except the industry tints in
 *     `INDUSTRY` (mineral, sky, cactus, olive) which match Cowork DL's
 *     earth-tone palette.
 *   - 56px horizontal padding contract per section.
 *   - prefers-reduced-motion: skip live-pulse cycling.
 *   - Transform/opacity-only animation; no width/height/top/left.
 */

import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface MarketingHomeV23BProps {
  onSend?: (msg: string) => void;
  onFocusChat?: () => void;
  onStartFree?: () => void;
  onGoJourney?: () => void;
  onGoHowItWorks?: () => void;
  onGoPricing?: () => void;
}

const SECTION_PAD = "56px";

const PERSONAS = [
  { key: "searcher", label: "Searcher" },
  { key: "advisor",  label: "Advisor"  },
  { key: "broker",   label: "Broker"   },
  { key: "sponsor",  label: "Sponsor"  },
  { key: "banker",   label: "Banker"   },
  { key: "planner",  label: "Planner"  },
] as const;

type PersonaKey = (typeof PERSONAS)[number]["key"];

const QUICK_STARTS: Record<PersonaKey, string[]> = {
  searcher: [
    "Screen this teaser",
    "Run QoE Lite on a $4M EBITDA business",
    "Model SBA structure for a roll-up",
    "Score 50 inbound teasers",
  ],
  advisor: [
    "Draft a CIM for a $12M EBITDA platform",
    "Build a buyer tree for industrial services",
    "Generate the pitch for Tuesday's bake-off",
    "Status email to all parties",
  ],
  broker: [
    "Recast this P&L",
    "Run The Baseline on an HVAC business",
    "Draft a marketing package",
    "Pre-qualify a buyer for SBA",
  ],
  sponsor: [
    "Draft IC memo for family office",
    "Model rollover equity at 30%",
    "Build cap table waterfall",
    "Audience-specific deal memos",
  ],
  banker: [
    "Pitch deck for Tuesday",
    "Comp set for healthcare services",
    "Buyer universe — sector-tuned",
    "Diligence Q&A tracker",
  ],
  planner: [
    "Run owner-readiness scorecard",
    "Generate value-gap analysis",
    "100-day value creation plan",
    "Trigger-event prospect list",
  ],
};

export function MarketingHomeV23B({
  onSend,
  onFocusChat,
  onGoJourney,
  onGoHowItWorks,
}: MarketingHomeV23BProps) {
  // Click-an-artifact → drop its prompt into the chat rail and focus
  // it. The rail picks up the topic and Yulia takes it from there.
  const pickArtifact = useCallback(
    (prompt: string) => {
      onSend?.(prompt);
      onFocusChat?.();
    },
    [onSend, onFocusChat]
  );

  return (
    <div
      className="smbx-edition"
      style={{
        background: "var(--canvas-paper)",
        color: "var(--ink-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <PageStyles />
      <Masthead onGoJourney={onGoJourney} onGoHowItWorks={onGoHowItWorks} />
      <HeroWorkshop onSend={onSend} onFocusChat={onFocusChat} />
      <SecondaryCTA onFocusChat={onFocusChat} />
      <SpreadsSection onPickArtifact={pickArtifact} onGoHowItWorks={onGoHowItWorks} />
      <FromTheDesk onGoHowItWorks={onGoHowItWorks} />
    </div>
  );
}

/* Single source of page-specific styles — hoisted out of individual
 * components so the same <style> block doesn't render 4× in the DOM
 * (which it did when each <Spread> shipped its own block). React still
 * lets us co-locate, but we co-locate at the page root instead of the
 * leaf. Keyframes for one-instance widgets (e.g. LivePresence's pulse)
 * stay inline at their component since dedup isn't a concern there. */
function PageStyles() {
  return (
    <style>{`
      /* Hero grid responsive */
      @media (max-width: 1023px) {
        .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      }
      @media (max-width: 639px) {
        .hero-grid > .hero-right { display: none !important; }
      }

      /* Spread internal grids */
      @media (max-width: 1023px) {
        .spread-text-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      }
      @media (max-width: 767px) {
        .spread-tile-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
      }

      /* Tile interaction */
      .spread-tile {
        transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1);
        will-change: transform;
      }
      .spread-tile:hover  { transform: translateY(-5px) scale(1.012); }
      .spread-tile:active { transform: translateY(-2px) scale(1.005); }
      .spread-tile:hover .spread-tile-card {
        box-shadow:
          0 28px 56px rgba(26, 24, 20, 0.16),
          0 8px 16px rgba(26, 24, 20, 0.08);
        border-color: rgba(26, 24, 20, 0.24);
      }
      .spread-tile:hover .spread-tap-hint {
        transform: translateY(0);
        opacity: 1;
      }
      .spread-tap-hint {
        transform: translateY(100%);
        opacity: 0;
        transition:
          transform 320ms cubic-bezier(0.23, 1, 0.32, 1),
          opacity 280ms cubic-bezier(0.23, 1, 0.32, 1);
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .spread-tile,
        .spread-tile:hover,
        .spread-tile:active { transform: none !important; }
        .spread-tap-hint { transition: opacity 200ms ease; }
      }
    `}</style>
  );
}

/* ───────────────────────── Masthead ─────────────────────────
 * Slim utility nav bar — wordmark left, primary nav center-ish, two
 * pill buttons (Sign in / Talk to Yulia) right. Borrows Dribbble's
 * restraint: no big newspaper masthead, no dateline strip. Bottom
 * border is a hairline rule, not 2px.
 */
function Masthead({
  onGoJourney,
  onGoHowItWorks,
}: Pick<MarketingHomeV23BProps, "onGoJourney" | "onGoHowItWorks">) {
  const wrap: CSSProperties = {
    padding: `20px ${SECTION_PAD}`,
    borderBottom: "1px solid var(--rule)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  };
  const navBtn: CSSProperties = {
    all: "unset",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--ink-secondary)",
    cursor: "pointer",
    padding: "6px 0",
  };
  const wordmark: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 21,
    letterSpacing: "-0.04em",
    color: "var(--ink-primary)",
  };

  return (
    <header style={wrap}>
      <span style={wordmark}>
        smbx<span style={{ color: "var(--terra)" }}>.</span>
      </span>
      <nav style={{ display: "flex", gap: 28 }}>
        <button type="button" style={navBtn} onClick={onGoJourney}>Journey</button>
        <button type="button" style={navBtn} onClick={onGoHowItWorks}>How it works</button>
        <button type="button" style={navBtn}>Pricing</button>
        <button type="button" style={navBtn}>Sign in</button>
      </nav>
    </header>
  );
}

/* ───────────────────────── Hero · Workshop ─────────────────────────
 * 12-col grid, hero stack on left 7 cols, live presence widget right
 * 5 cols. On <1024px the right column drops below; on <640 the right
 * column is hidden entirely.
 */
function HeroWorkshop({
  onSend,
  onFocusChat,
}: Pick<MarketingHomeV23BProps, "onSend" | "onFocusChat">) {
  return (
    <section style={{ padding: `80px ${SECTION_PAD} 80px` }}>
      <div
        className="grid hero-grid"
        style={{
          gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)",
          gap: 56,
          alignItems: "start",
        }}
      >
        <HeroLeft onSend={onSend} onFocusChat={onFocusChat} />
        <div className="hero-right">
          <LivePresence />
        </div>
      </div>
    </section>
  );
}

function HeroLeft({
  onSend,
  onFocusChat,
}: Pick<MarketingHomeV23BProps, "onSend" | "onFocusChat">) {
  const [persona, setPersona] = useState<PersonaKey>("searcher");
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Clear any in-flight confirmation timer if the component unmounts
  // mid-flash so we don't setState on an unmounted node.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 1800);
    return () => clearTimeout(t);
  }, [confirming]);

  // Persona context is a UI-side concern — never appears in the chat
  // message itself. Yulia infers persona from the conversation, or asks
  // when she needs to. Prefixing `[searcher] ...` to the user message
  // would read as debug output, breaking the "Yulia speaks like a deal
  // advisor, never like a chatbot" rule.
  const submit = useCallback(
    (text: string) => {
      const msg = text.trim();
      if (!msg) {
        onFocusChat?.();
        return;
      }
      onSend?.(msg);
      onFocusChat?.();
      setDraft("");
      setConfirming(true);
    },
    [onSend, onFocusChat]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(draft);
    }
  };

  const eyebrow: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--ink-tertiary)",
    marginBottom: 18,
  };

  // Magazine-cover scale. At 1920 viewport this clamps to 200px; at
  // 1440 it lands ~158px. The italic foil ("deals") still sits inline
  // — at this scale, the sans/serif contrast becomes the visual event,
  // not just a typographic detail. This is the page's hero moment.
  const h1: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(80px, 11vw, 200px)",
    lineHeight: 0.92,
    letterSpacing: "-0.05em",
    margin: 0,
    textWrap: "balance",
    color: "var(--ink-primary)",
  };

  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  return (
    <div>
      <div style={eyebrow}>For people who do deals · Apr 2026</div>

      <h1 style={h1}>
        Close <span style={italic}>deals</span>{" "}
        <span style={{ color: "var(--terra)" }}>faster.</span>
      </h1>

      <PersonaTabs persona={persona} onChange={setPersona} />

      <PillInput
        value={draft}
        onChange={setDraft}
        onKeyDown={handleKey}
        onSubmit={() => submit(draft)}
        placeholder={`Ask Yulia about a ${PERSONAS.find(p => p.key === persona)?.label.toLowerCase()} workflow…`}
        confirming={confirming}
      />

      <QuickStartChips
        items={QUICK_STARTS[persona]}
        onPick={(text) => submit(text)}
      />
    </div>
  );
}

/* ───────────────────────── Persona tabs ─────────────────────────
 * Six pill tabs above the input. Active = ink-fill + paper text;
 * inactive = paper-fill + ink text + border. Same vocabulary as
 * Dribbble's "Shots / Designers / Services / Agencies" segmentation.
 */
function PersonaTabs({
  persona,
  onChange,
}: {
  persona: PersonaKey;
  onChange: (k: PersonaKey) => void;
}) {
  return (
    <div
      style={{
        marginTop: 36,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {PERSONAS.map((p) => {
        const active = p.key === persona;
        const style: CSSProperties = {
          all: "unset",
          cursor: "pointer",
          padding: "9px 16px",
          borderRadius: 999,
          border: active ? "1px solid var(--ink-primary)" : "1px solid var(--rule)",
          background: active ? "var(--ink-primary)" : "transparent",
          color: active ? "var(--canvas-paper)" : "var(--ink-primary)",
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          transition: "background 180ms cubic-bezier(0.23,1,0.32,1), color 180ms cubic-bezier(0.23,1,0.32,1)",
        };
        return (
          <button
            key={p.key}
            type="button"
            style={style}
            onClick={() => onChange(p.key)}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "var(--canvas-cream)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Pill input ─────────────────────────
 * The primary action of the page. Carries Yulia's presence on the
 * left (terra dot + "YULIA" label), big input field in the middle,
 * always-terra send button on the right. Submits to the chat rail.
 *
 * Confirming state: after submit fires, the pill flashes terra-tinted
 * and the placeholder briefly says "Sent — continuing in chat ↙" so
 * the user gets visual feedback that their message moved to the rail.
 * Without that signal users on a wide desktop (rail far left) miss the
 * confirmation entirely.
 */
function PillInput({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  placeholder,
  confirming,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  placeholder: string;
  confirming: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;

  const borderColor = confirming
    ? "var(--terra)"
    : focused
      ? "var(--ink-primary)"
      : "var(--ink-tertiary)";

  const wrap: CSSProperties = {
    marginTop: 32,
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px 10px 16px",
    borderRadius: 999,
    border: `1.5px solid ${borderColor}`,
    background: confirming ? "var(--terra-tint)" : "var(--canvas-paper)",
    boxShadow: focused
      ? "0 12px 36px rgba(26, 24, 20, 0.14), 0 3px 8px rgba(212, 113, 78, 0.12)"
      : "0 6px 18px rgba(26, 24, 20, 0.08)",
    transition:
      "border-color 200ms cubic-bezier(0.23,1,0.32,1), background 220ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1)",
  };
  const yuliaTag: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    padding: "4px 10px 4px 8px",
    borderRadius: 999,
    background: "rgba(212, 113, 78, 0.10)",
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--ink-primary)",
    fontWeight: 700,
  };
  const yuliaDot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "var(--terra)",
    flexShrink: 0,
  };
  const input: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 4px",
    fontFamily: "var(--font-body)",
    fontSize: 16,
    color: "var(--ink-primary)",
  };
  const send: CSSProperties = {
    all: "unset",
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "var(--terra)",
    color: "var(--canvas-paper)",
    opacity: hasText || confirming ? 1 : 0.55,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    transition:
      "opacity 180ms cubic-bezier(0.23,1,0.32,1), transform 120ms cubic-bezier(0.23,1,0.32,1), background 180ms cubic-bezier(0.23,1,0.32,1)",
    flexShrink: 0,
  };

  const visiblePlaceholder = confirming
    ? "Sent — continuing in chat ↙"
    : placeholder;
  return (
    <div style={wrap}>
      <span style={yuliaTag} aria-hidden>
        <span style={yuliaDot} />
        Yulia
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={visiblePlaceholder}
        disabled={confirming}
        style={input}
        aria-label="Ask Yulia"
      />
      <button
        type="button"
        aria-label="Send to Yulia"
        onClick={onSubmit}
        style={send}
        onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {confirming ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ───────────────────────── Quick-start chips ─────────────────────────
 * Pre-loaded common starting prompts. Click a chip → submits the
 * message directly. Removes blank-page panic.
 */
function QuickStartChips({
  items,
  onPick,
}: {
  items: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginRight: 4,
        }}
      >
        Try:
      </span>
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          style={{
            all: "unset",
            cursor: "pointer",
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid var(--rule)",
            background: "var(--canvas-paper)",
            color: "var(--ink-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            transition: "background 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms cubic-bezier(0.23,1,0.32,1), color 160ms cubic-bezier(0.23,1,0.32,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--canvas-cream)";
            e.currentTarget.style.borderColor = "var(--ink-primary)";
            e.currentTarget.style.color = "var(--ink-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--canvas-paper)";
            e.currentTarget.style.borderColor = "var(--rule)";
            e.currentTarget.style.color = "var(--ink-secondary)";
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Live-presence widget ─────────────────────────
 * Small, right-side widget showing Yulia's current activity. Pulses a
 * terra dot. Cycles activity lines on a 2.4s timer. Mocked content;
 * Phase 2 connects to the real platform-pulse stream.
 */
/* Population-level activity feed. Specifically NOT specific —
 * "drafting CIM section 3.2" was theatrical (nobody actually did
 * that exact thing right now), so it read fake to power users. These
 * lines describe what's happening across the platform in aggregate,
 * which is plausible at any moment and harder to disprove. Phase 2
 * replaces with real telemetry. */
const PRESENCE_FEED: { time: string; verb: string; what: string }[] = [
  { time: "now",      verb: "active",   what: "18 conversations across the platform" },
  { time: "1m",       verb: "drafting", what: "advisory CIMs and IC memos" },
  { time: "3m",       verb: "modeling", what: "SBA structures and rollover scenarios" },
  { time: "6m",       verb: "scoring",  what: "buyer universes for live mandates" },
  { time: "today",    verb: "filed",    what: "9 new sourcing teasers · 4 closed LOIs" },
];

function LivePresence() {
  const [head, setHead] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setHead((h) => (h + 1) % PRESENCE_FEED.length), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  const items = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => PRESENCE_FEED[(head + i) % PRESENCE_FEED.length]);
  }, [head]);

  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 12,
        background: "var(--canvas-cream)",
        padding: "20px 22px",
        boxShadow: "0 1px 0 rgba(26, 24, 20, 0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--terra)",
              boxShadow: reduced ? "none" : "0 0 0 0 rgba(212, 113, 78, 0.45)",
              animation: reduced ? "none" : "presence-pulse 1.6s cubic-bezier(0.23,1,0.32,1) infinite",
            }}
          />
          Yulia — working
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            color: "var(--ink-secondary)",
            letterSpacing: "-0.01em",
          }}
        >
          247 dealmakers active · 7 days
        </span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((p, i) => (
          <li
            key={`${head}-${i}`}
            style={{
              opacity: 1 - i * 0.16,
              transition: "opacity 600ms cubic-bezier(0.23,1,0.32,1)",
              paddingTop: i === 0 ? 0 : 10,
              paddingBottom: 10,
              borderBottom: i < items.length - 1 ? "1px dotted var(--rule)" : "none",
              display: "grid",
              gridTemplateColumns: "64px 1fr",
              gap: 10,
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: i === 0 ? "var(--terra)" : "var(--ink-tertiary)",
                whiteSpace: "nowrap",
              }}
            >
              {p.time}
            </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.45, color: "var(--ink-primary)" }}>
              <span
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontStyle: "italic",
                  color: "var(--ink-secondary)",
                  marginRight: 6,
                }}
              >
                {p.verb}
              </span>
              {p.what}
            </span>
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes presence-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(212, 113, 78, 0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(212, 113, 78, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 113, 78, 0); }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Secondary CTA banner ─────────────────────────
 * Soft tinted pill, "NEW" badge in terra. Borrowed directly from
 * Dribbble's "Start a Project Brief" pattern. Subtle, not screaming.
 */
function SecondaryCTA({ onFocusChat }: Pick<MarketingHomeV23BProps, "onFocusChat">) {
  return (
    <section style={{ padding: `0 ${SECTION_PAD} 56px` }}>
      <button
        type="button"
        onClick={onFocusChat}
        style={{
          all: "unset",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
          background: "var(--canvas-cream)",
          border: "1px solid var(--rule)",
          borderRadius: 14,
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          transition: "background 200ms cubic-bezier(0.23,1,0.32,1), border-color 200ms cubic-bezier(0.23,1,0.32,1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--terra-tint)";
          e.currentTarget.style.borderColor = "var(--terra)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--canvas-cream)";
          e.currentTarget.style.borderColor = "var(--rule)";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            borderRadius: 999,
            background: "var(--terra)",
            color: "var(--canvas-paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          New
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--ink-primary)",
          }}
        >
          Start free — see Yulia work in 60 seconds.
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ink-secondary)",
            flex: 1,
            minWidth: 200,
          }}
        >
          One free deliverable. No credit card. The chat on your left is the same Yulia that runs in every paid workspace.
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-primary)",
            whiteSpace: "nowrap",
          }}
        >
          Talk to Yulia <span style={{ color: "var(--terra)" }}>→</span>
        </span>
      </button>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Editorial spreads — 4 magazine-style article spreads, one per job
   ═══════════════════════════════════════════════════════════════════ */

type IndustryKey = "industrial" | "hvac" | "healthcare" | "marine";

const INDUSTRY: Record<IndustryKey, { label: string; color: string }> = {
  industrial: { label: "Industrial",   color: "#629987" }, // mineral
  hvac:       { label: "HVAC",         color: "#6a9bcc" }, // sky
  healthcare: { label: "Healthcare",   color: "#bcd1ca" }, // cactus
  marine:     { label: "Marine",       color: "#788c5d" }, // olive
};

/* Light tonal palette for tinted tile backgrounds. Resolved via CSS
 * vars in the .smbx-edition :root block (index.css), so palette
 * changes live in one place across V22b, V23B, V23C, and journey
 * routes. The keyword keys here just lock down which tints are valid
 * for tile use — the darker earth tones (mineral, sky, olive, fig,
 * plum) stay as accent stripes only because they fail AA against
 * ink-primary as full backgrounds. */
const TINT_PALETTE = {
  cactus:  "var(--cactus)",   // sage
  oat:     "var(--oat)",      // warm beige
  peach:   "var(--peach)",    // warm coral
  coral:   "var(--coral)",    // muted rose
  heather: "var(--heather)",  // dusty lavender
} as const;
type TintKey = keyof typeof TINT_PALETTE;

type CIMVariant = "operations" | "qoe" | "quarterly";

interface ArtifactItem {
  id: string;
  type: "cim" | "recast" | "buyers" | "structure" | "loi" | "pmi";
  variant?: CIMVariant;        // only for type === "cim"
  industry: IndustryKey;
  tint?: TintKey;              // if set, full tinted background; if not, paper white + industry stripe
  kicker: string;              // "$5.4M EBITDA · industrial"
  meta: string;                // "drafted in 47 min"
  prompt: string;              // conversation-starter sent to the chat rail on click
}

interface SpreadConfig {
  numeral: string;             // "I", "II", "III", "IV"
  job: string;                 // "MAKE IT SELLABLE" — eyebrow
  headlineMain: string;        // "Make it"  (sans display)
  headlineFoil: string;        // "sellable" (italic serif foil)
  standfirst: string;          // ~80 words drop-cap body
  pullquote: string;           // italic serif, 8–14 words
  artifacts: ArtifactItem[];   // 2 tiles per spread
}

const SPREADS: SpreadConfig[] = [
  {
    numeral: "I",
    job: "Make it sellable",
    headlineMain: "Make it",
    headlineFoil: "sellable",
    standfirst:
      "Before you take a business to market, you make it sellable. Owner comp normalized against benchmarks. Add-backs defended against three years of tax returns. Working capital pegged where a buyer's accountant won't argue. Customer concentration flagged before a buyer's QoE finds it. The diligence you'd pay a firm twenty-five thousand dollars to run — done before you sign anything.",
    pullquote: "An LP-grade QoE before you sign anything.",
    artifacts: [
      {
        id: "recast-01",
        type: "recast",
        industry: "hvac",
        kicker: "$1.8M SDE · HVAC business",
        meta: "3 add-backs defended",
        prompt:
          "Recast a P&L for a $1.8M SDE HVAC business. Normalize owner comp, defend three add-backs against the tax returns, and peg working capital where a buyer's accountant won't argue.",
      },
      {
        id: "qoe-01",
        type: "cim",
        variant: "qoe",
        industry: "marine",
        kicker: "QoE Lite · $5.4M EBITDA",
        meta: "Section 4.1 · marine services",
        prompt:
          "Run QoE Lite on a $5.4M EBITDA marine services business. Defend the add-backs, surface the customer concentration risk, and produce the Section 4.1 Quality of Earnings memo.",
      },
    ],
  },
  {
    numeral: "II",
    job: "Take it to market",
    headlineMain: "Take it",
    headlineFoil: "to market",
    standfirst:
      "When the financials are ready, the market gets the book. A 100-page CIM, branded to your firm, sourced to the seller's filings, structured for the buyer your seller wants. A scored buyer list — strategics, financials, platform plays — pulled from current public filings, ranked against the seller's profile. The outreach that goes out has a response rate.",
    pullquote: "100 pages, redline-ready, in under an hour.",
    artifacts: [
      {
        id: "cim-01",
        type: "cim",
        variant: "operations",
        industry: "industrial",
        kicker: "$5.4M EBITDA · industrial",
        meta: "Section 3.2 · drafted in 47 min",
        prompt:
          "Show me how you'd draft a CIM for a $5.4M EBITDA industrial services platform — three-year operating history, 38% top-five customer concentration. Walk me through Section 3.2 (Operations & Customer Concentration).",
      },
      {
        id: "buyers-01",
        type: "buyers",
        industry: "healthcare",
        tint: "cactus",
        kicker: "Healthcare · platform plays",
        meta: "84 scored · 19% response-rate",
        prompt:
          "Build a scored buyer universe for a healthcare services platform. 60% strategics, 40% financial sponsors with a healthcare thesis. Score against multi-state operating profile.",
      },
    ],
  },
  {
    numeral: "III",
    job: "Close the deal",
    headlineMain: "Close",
    headlineFoil: "the deal",
    standfirst:
      "An LOI is a structure, not a price. SBA SOP 50 10 8 modeling that accounts for the June 2025 rule changes. Seller-note terms that lenders approve. Earnout, R&W insurance, and rollover that survive a sophisticated buyer's diligence. Yulia drafts the structure that turns a handshake into a wire.",
    pullquote: "The structure that turns a handshake into a wire.",
    artifacts: [
      {
        id: "structure-01",
        type: "structure",
        industry: "industrial",
        kicker: "$4.2M EBITDA · SBA + seller note",
        meta: "SOP 50 10 8 compliant",
        prompt:
          "Model an SBA SOP 50 10 8-compliant structure for a $4.2M EBITDA acquisition. 10% equity injection, 70% SBA 7(a), 10% seller note on full standby. Sources & uses with annotated assumptions.",
      },
      {
        id: "loi-01",
        type: "loi",
        industry: "hvac",
        tint: "oat",
        kicker: "Earnout · revenue retention collar",
        meta: "Cycle 2 of 3 · 18-month window",
        prompt:
          "Draft an LOI Section 4 (Earnout) with an 18-month measurement window, 92% revenue retention floor, and a $400K minimum. Show me what survives a sophisticated buyer's diligence.",
      },
    ],
  },
  {
    numeral: "IV",
    job: "Build value after close",
    headlineMain: "Build value",
    headlineFoil: "after close",
    standfirst:
      "The deal closes. The work continues. Day-one readiness, customer comms, systems migration — Yulia drafts the 100-day plan and tracks milestones quarter by quarter. The PMI plan that knew what was promised in diligence. The next deal starts inside the same workspace.",
    pullquote: "Yulia stays with you when the next deal starts.",
    artifacts: [
      {
        id: "pmi-01",
        type: "pmi",
        industry: "marine",
        kicker: "Day 0 → Day 100",
        meta: "13-week · 4 tracks",
        prompt:
          "Build a 100-day post-close plan for a marine services acquisition. Day-1 readiness, customer comms, systems migration, and 100-day milestones across four tracks.",
      },
      {
        id: "update-01",
        type: "cim",
        variant: "quarterly",
        industry: "healthcare",
        tint: "peach",
        kicker: "Q1 2026 · portfolio update",
        meta: "Section 9.1 · quarterly review",
        prompt:
          "Draft a Q1 2026 portfolio update for a healthcare services holding. KPI achievement, milestone progress against the 100-day plan, and surfaced risks for the next quarter.",
      },
    ],
  },
];

/* Per-spread visual variants. The four spreads alternate composition,
 * background, headline treatment, and tile-stage tint so the page
 * doesn't read as four identical boxes. Magazine spreads do this —
 * a cover story, a mirror page, a banner moment, a closing essay
 * each have their own page-craft. The pattern here:
 *   I.   Cover story        — default, paper bg, text-left quote-right
 *   II.  Reverse mirror     — cream bg, quote-left text-right
 *   III. Banner             — paper bg, bigger headline, peach tile stage
 *   IV.  Spotlight (dark)   — warm charcoal bg, italic-led headline,
 *                              cream tile stage for max contrast
 *
 * `tileBandBg` = the small showcase plate behind the artifact tiles.
 * Different from `sectionBg` so the cards always sit on a contrast
 * shift, lifting them visually without needing heavy shadows.
 * `ink` / `inkSecondary` / `rule` get swapped on the dark spread so
 * eyebrows/byline/dividers stay legible.
 */
type SpreadVariant = {
  sectionBg: string;
  tileBandBg: string;
  ink: string;
  inkSecondary: string;
  inkTertiary: string;
  rule: string;
  mirror: boolean;          // flip 7/5 grid to 5/7
  headlineScale: number;    // 1.0 = default, 1.15 = banner moment
  italicMode: "trail" | "trail-line" | "trail-phrase" | "lead-phrase";
};

const SPREAD_VARIANTS: SpreadVariant[] = [
  // I — Cover Story
  {
    sectionBg: "var(--canvas-paper)",
    tileBandBg: "var(--canvas-cream)",
    ink: "var(--ink-primary)",
    inkSecondary: "var(--ink-secondary)",
    inkTertiary: "var(--ink-tertiary)",
    rule: "var(--rule)",
    mirror: false,
    headlineScale: 1.0,
    italicMode: "trail",
  },
  // II — Reverse Mirror
  {
    sectionBg: "var(--canvas-cream)",
    tileBandBg: "var(--canvas-paper)",
    ink: "var(--ink-primary)",
    inkSecondary: "var(--ink-secondary)",
    inkTertiary: "var(--ink-tertiary)",
    rule: "var(--rule)",
    mirror: true,
    headlineScale: 1.0,
    italicMode: "trail-line",
  },
  // III — Banner
  {
    sectionBg: "var(--canvas-paper)",
    tileBandBg: "var(--peach)",
    ink: "var(--ink-primary)",
    inkSecondary: "var(--ink-secondary)",
    inkTertiary: "var(--ink-tertiary)",
    rule: "var(--rule)",
    mirror: false,
    headlineScale: 1.15,
    italicMode: "trail-phrase",
  },
  // IV — Spotlight (dark)
  {
    sectionBg: "#1f1c18",
    tileBandBg: "var(--canvas-cream)",
    ink: "#F4EEE3",
    inkSecondary: "#cfc9bf",
    inkTertiary: "#928c81",
    rule: "rgba(244, 238, 227, 0.16)",
    mirror: false,
    headlineScale: 1.0,
    italicMode: "lead-phrase",
  },
];

/* Per-artifact hover CTA. Replaces the previous one-size-fits-all
 * "Talk to Yulia about this" — each tile now teaches what the click
 * actually does for that specific artifact, so the overlay isn't
 * 8 identical labels across the page. */
function tileHoverCta(item: ArtifactItem): string {
  if (item.type === "cim") {
    if (item.variant === "qoe")       return "Draft this QoE memo →";
    if (item.variant === "quarterly") return "Draft this update →";
    return "Draft this CIM →";
  }
  switch (item.type) {
    case "recast":    return "Recast this P&L →";
    case "buyers":    return "Score these buyers →";
    case "structure": return "Model this structure →";
    case "loi":       return "Redline this LOI →";
    case "pmi":       return "Build this plan →";
  }
}

/* ───────────────────────── Spreads section ─────────────────────────
 * Renders the 4 editorial spreads, separated by fleurons. Each spread
 * is its own <section> so the global content cap applies — these are
 * meant to read like magazine pages, not bleed.
 */
function SpreadsSection({
  onPickArtifact,
  onGoHowItWorks,
}: {
  onPickArtifact: (prompt: string) => void;
  onGoHowItWorks?: () => void;
}) {
  return (
    <>
      {SPREADS.map((spread, i) => {
        const isLast = i === SPREADS.length - 1;
        return (
          <Fragment key={spread.numeral}>
            <Spread
              spread={spread}
              variant={SPREAD_VARIANTS[i]}
              spreadId={`spread-${i + 1}`}
              nextSpreadId={isLast ? undefined : `spread-${i + 2}`}
              indexOfTotal={`${spread.numeral} / IV`}
              onPickArtifact={onPickArtifact}
              onGoHowItWorks={isLast ? onGoHowItWorks : undefined}
            />
            {!isLast && <SpreadDivider nextNumeral={SPREADS[i + 1].numeral} />}
          </Fragment>
        );
      })}
    </>
  );
}

/* Chapter-mark divider — replaces the timid fleuron with a chapter
 * break that announces the next spread is coming. Big italic-serif
 * Roman numeral, terra horizontal rule, mono "next" hint on the right.
 * Reads as a real magazine page-turn, not just a polite ornament.
 *
 * Takes the next spread's numeral so the marker shows what's coming
 * (e.g. "↓ II" between Spreads I and II). The numeral is generous
 * editorial scale — 96px italic display weight — so it earns its row.
 */
function SpreadDivider({ nextNumeral }: { nextNumeral: string }) {
  return (
    <div style={{ padding: `0 ${SECTION_PAD}` }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          alignItems: "center",
          gap: 32,
          padding: "48px 0",
        }}
      >
        <span
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, var(--rule) 12%, var(--ink-primary) 100%)",
          }}
        />
        <span
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          <span>Next</span>
          <span style={{ color: "var(--terra)" }}>↓</span>
          <span
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 96,
              lineHeight: 0.86,
              letterSpacing: "-0.02em",
              color: "var(--ink-primary)",
              textTransform: "none",
            }}
          >
            {nextNumeral}
          </span>
        </span>
        <span
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, var(--ink-primary) 0%, var(--rule) 88%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────── One spread ─────────────────────────
 * Magazine-article layout, varying per `variant`:
 *   1. Eyebrow row — Roman numeral · Job · Spread X / IV
 *   2. Editorial headline — italic foil placement varies (trail / line /
 *      phrase / lead) so each spread's first read is visually distinct
 *   3. Text grid — standfirst + pull quote, mirrored on II so the eye
 *      travels in the opposite direction across the page
 *   4. Tile stage — wrapped in a tinted "showcase plate" (variant
 *      .tileBandBg) so cards always sit on a contrast shift instead of
 *      a flat field
 *   5. Footer row — Filed byline + Continued ↓ / Read on → link
 *
 * The dark spread (IV) inverts ink/secondary/rule colors so eyebrow,
 * pull quote, and CTA all stay legible on warm charcoal.
 */
function Spread({
  spread,
  variant,
  spreadId,
  nextSpreadId,
  indexOfTotal,
  onPickArtifact,
  onGoHowItWorks,
}: {
  spread: SpreadConfig;
  variant: SpreadVariant;
  spreadId: string;
  nextSpreadId?: string;
  indexOfTotal: string;
  onPickArtifact: (prompt: string) => void;
  onGoHowItWorks?: () => void;
}) {
  const handleContinued = () => {
    if (!nextSpreadId) return;
    document.getElementById(nextSpreadId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const italicSpan: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const terraDot = <span style={{ color: "var(--terra)" }}>.</span>;

  // Headline layout varies per spread so the "Make it sellable." pattern
  // doesn't repeat verbatim across all four. Each italic mode picks a
  // different rhythm — trail word, trail line, two-period stab, lead phrase.
  const headlineContent = (() => {
    switch (variant.italicMode) {
      case "trail":
        // I — "Make it sellable."
        return (
          <>
            {spread.headlineMain}{" "}
            <span style={italicSpan}>{spread.headlineFoil}</span>
            {terraDot}
          </>
        );
      case "trail-line":
        // II — "Take it to / market." (italic on full second line)
        return (
          <>
            {spread.headlineMain}
            <br />
            <span style={italicSpan}>{spread.headlineFoil}</span>
            {terraDot}
          </>
        );
      case "trail-phrase":
        // III — "Close. / The deal." (two periods, italic on second phrase)
        return (
          <>
            {spread.headlineMain}
            {terraDot}
            <br />
            <span style={italicSpan}>{cap(spread.headlineFoil)}</span>
            {terraDot}
          </>
        );
      case "lead-phrase":
        // IV — "Build value / after close." (italic LEADS, sans trails)
        return (
          <>
            <span style={italicSpan}>{spread.headlineMain}</span>
            <br />
            {spread.headlineFoil}
            {terraDot}
          </>
        );
    }
  })();

  // Spread headlines pushed to magazine cover scale — proportional to
  // the hero h1's 200px shock. Default spreads land 80–116px; banner
  // (Spread III) climbs to 144px. The hero stays bigger so visual
  // hierarchy reads "issue cover → chapter heads" not "all the same."
  const headlineFontSize =
    variant.headlineScale > 1
      ? "clamp(72px, 9.4vw, 144px)"
      : "clamp(56px, 7.4vw, 116px)";

  const standfirstNode = (
    <p
      className="dropcap-v2"
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 17,
        lineHeight: 1.65,
        color: variant.ink,
        margin: 0,
        textWrap: "pretty",
      }}
    >
      {spread.standfirst}
    </p>
  );

  const pullquoteNode = (
    <blockquote
      style={{
        fontFamily: "var(--font-editorial)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "clamp(26px, 3.0vw, 42px)",
        lineHeight: 1.18,
        letterSpacing: "-0.018em",
        color: variant.ink,
        margin: 0,
        paddingLeft: 22,
        borderLeft: "2px solid var(--terra)",
        textWrap: "balance",
      }}
    >
      “{spread.pullquote}”
    </blockquote>
  );

  return (
    <section
      id={spreadId}
      style={{
        padding: `96px ${SECTION_PAD} 112px`,
        background: variant.sectionBg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost numeral — Vogue/Atlantic editorial signature. Sits behind
          the eyebrow row at low opacity, large enough to be felt but
          subtle enough not to compete. Reads as "this is chapter X" the
          way magazine spreads stamp their pages. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(220px, 26vw, 420px)",
          color: variant.ink,
          opacity: variant.sectionBg.startsWith("#1f") ? 0.10 : 0.06,
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
      >
        {spread.numeral}
      </div>

      {/* Content sits above the ghost numeral */}
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Eyebrow row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 12,
          borderBottom: `1px solid ${variant.rule}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "0.18em",
              color: variant.ink,
              marginRight: 14,
            }}
          >
            {spread.numeral}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: variant.inkTertiary,
            }}
          >
            {spread.job}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: variant.inkTertiary,
            fontVariantNumeric: "tabular-nums lining-nums",
          }}
        >
          Spread {indexOfTotal}
        </span>
      </div>

      {/* Headline */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: headlineFontSize,
          lineHeight: 0.96,
          letterSpacing: "-0.034em",
          margin: "32px 0 0",
          textWrap: "balance",
          color: variant.ink,
        }}
      >
        {headlineContent}
      </h2>

      {/* Text grid — mirrored on Spread II */}
      <div
        className="grid spread-text-grid"
        style={{
          marginTop: 36,
          gridTemplateColumns: variant.mirror
            ? "minmax(0, 5fr) minmax(0, 7fr)"
            : "minmax(0, 7fr) minmax(0, 5fr)",
          gap: 56,
          alignItems: "start",
        }}
      >
        {variant.mirror ? (
          <>
            {pullquoteNode}
            {standfirstNode}
          </>
        ) : (
          <>
            {standfirstNode}
            {pullquoteNode}
          </>
        )}
      </div>

      {/* Tile stage — tinted band wraps the artifact tiles so cards
          always sit on a contrast shift, lifting them visually without
          requiring heavy drop shadows. */}
      <div
        style={{
          marginTop: 64,
          background: variant.tileBandBg,
          borderRadius: 18,
          padding: "32px 28px 36px",
          // No outer border when band contrasts with section; subtle hairline
          // when band is flush (rare — happens if variants ever match).
          border:
            variant.tileBandBg === variant.sectionBg
              ? `1px solid ${variant.rule}`
              : "none",
        }}
      >
        {/* Examples eyebrow */}
        <div
          style={{
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--terra)",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
            Examples · Drafted by Yulia
          </span>
          <span
            style={{ flex: 1, height: 1, background: "rgba(26,24,20,0.10)" }}
          />
          <span>
            Click to talk through{" "}
            <span style={{ color: "var(--terra)" }}>↙</span>
          </span>
        </div>

        {/* Tile grid */}
        <div
          className="grid spread-tile-grid"
          style={{
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 28,
          }}
        >
          {spread.artifacts.map((artifact) => (
            <SpreadArtifact
              key={artifact.id}
              item={artifact}
              onPick={onPickArtifact}
            />
          ))}
        </div>
      </div>

      {/* Footer row — byline + continued/read-on link */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 16,
          borderTop: `1px solid ${variant.rule}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: variant.inkTertiary,
          }}
        >
          Filed Apr 2026 · By the editors
        </span>
        {nextSpreadId ? (
          <button
            type="button"
            onClick={handleContinued}
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: variant.inkTertiary,
              padding: "8px 0",
              transition: "color 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = variant.ink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = variant.inkTertiary;
            }}
          >
            Continued <span style={{ color: "var(--terra)" }}>↓</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoHowItWorks}
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: variant.ink,
              padding: "8px 0",
              transition: "color 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--terra)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = variant.ink;
            }}
          >
            Read on · How it works{" "}
            <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        )}
      </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Spread artifact tile ─────────────────────────
 * Smaller tile (~320px wide at desktop) with optional tinted background.
 * Tinted tiles use a light earth-tone color (cactus / oat / peach / coral
 * / heather) as the full card background. Paper tiles get a 3px industry
 * stripe at the top instead. Click drops the artifact's prompt into the
 * chat rail.
 */
function SpreadArtifact({
  item,
  onPick,
}: {
  item: ArtifactItem;
  onPick: (prompt: string) => void;
}) {
  const industry = INDUSTRY[item.industry];
  const isTinted = !!item.tint;
  const bg = isTinted ? TINT_PALETTE[item.tint!] : "var(--canvas-paper)";

  return (
    <button
      type="button"
      onClick={() => onPick(item.prompt)}
      className="spread-tile"
      aria-label={`Talk to Yulia about: ${item.kicker}`}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
        textAlign: "left",
      }}
    >
      <div
        className="spread-tile-card"
        style={{
          aspectRatio: "3 / 2",
          background: bg,
          border: "1px solid var(--rule)",
          borderRadius: 10,
          overflow: "hidden",
          // Stronger lift at rest — cards read as physical documents
          // stacked on the showcase plate, not flat thumbnails. The
          // tinted tile-band beneath provides the contrast shift; the
          // shadow provides the elevation. Two-layer (long soft + short
          // sharp) gives both ambient and contact depth.
          boxShadow:
            "0 18px 40px rgba(26, 24, 20, 0.12), 0 4px 10px rgba(26, 24, 20, 0.06)",
          transition:
            "box-shadow 320ms cubic-bezier(0.23,1,0.32,1), border-color 320ms cubic-bezier(0.23,1,0.32,1)",
          position: "relative",
        }}
      >
        {/* Industry color stripe — only on paper tiles. Tinted tiles
            don't need it because the whole card is already industry-
            adjacent in feel. */}
        {!isTinted && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: industry.color,
              zIndex: 1,
            }}
          />
        )}

        {item.type === "cim"       && <ArtifactCIM variant={item.variant} />}
        {item.type === "recast"    && <ArtifactRecast />}
        {item.type === "buyers"    && <ArtifactBuyers />}
        {item.type === "structure" && <ArtifactStructure />}
        {item.type === "loi"       && <ArtifactLOI />}
        {item.type === "pmi"       && <ArtifactPMI />}

        {/* Tap-to-talk hint — slides up on hover */}
        <div
          className="spread-tap-hint"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 18px 14px",
            background:
              "linear-gradient(0deg, rgba(26,24,20,0.92) 0%, rgba(26,24,20,0.78) 60%, rgba(26,24,20,0) 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 13.5,
              letterSpacing: "-0.012em",
              color: "var(--canvas-paper)",
            }}
          >
            {tileHoverCta(item)}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "var(--terra)",
              color: "var(--canvas-paper)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Tile metadata strip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 9px",
              borderRadius: 999,
              border: `1px solid ${industry.color}`,
              background: `${industry.color}1A`,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--ink-primary)",
              fontWeight: 600,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 999, background: industry.color }} />
            {industry.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "-0.008em",
              color: "var(--ink-primary)",
              flex: 1,
              minWidth: 0,
            }}
          >
            {item.kicker}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          {item.meta}
        </div>
      </div>
    </button>
  );
}


/* ───────────────────────── Artifact mocks ─────────────────────────
 * Each one designed to look like a real artifact at thumbnail size.
 * Pure CSS — no images, no SVG charts, just typographic structure
 * conveying the document's identity.
 */
function ArtifactCIM({ variant = "operations" }: { variant?: CIMVariant }) {
  const content = CIM_VARIANTS[variant];
  return (
    <div
      style={{
        height: "100%",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span>{content.docLabel}</span>
        <span style={{ color: "var(--terra)" }}>● {content.statusVerb}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-quaternary)",
          marginTop: 12,
          marginBottom: 6,
        }}
      >
        {content.section}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "-0.016em",
          lineHeight: 1.18,
          marginBottom: 10,
          color: "var(--ink-primary)",
        }}
      >
        {content.headline}
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: "var(--font-editorial)",
          fontSize: 11,
          lineHeight: 1.48,
          color: "var(--ink-secondary)",
          textAlign: "justify",
        }}
      >
        {content.body}
      </div>
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>{content.footerL}</span>
        <span>{content.footerR}</span>
      </div>
    </div>
  );
}

const CIM_VARIANTS: Record<CIMVariant, {
  docLabel: string;
  statusVerb: string;
  section: string;
  headline: string;
  body: string;
  footerL: string;
  footerR: string;
}> = {
  operations: {
    docLabel: "Confidential · CIM",
    statusVerb: "drafting",
    section: "Section 3.2",
    headline: "Operations & Customer Concentration",
    body:
      "The Company's industrial services revenue is anchored by a thirty-year operating history in the East Texas corridor, with a customer base concentrated in mid-market manufacturing. The top five accounts represent 38% of trailing-twelve revenue — a profile that reflects multi-decade relationships and a pattern of contract renewal at or near 100%.",
    footerL: "page 24 / 100",
    footerR: "redline-ready",
  },
  qoe: {
    docLabel: "QoE Lite · Memo",
    statusVerb: "defended",
    section: "Section 4.1",
    headline: "Quality of Earnings",
    body:
      "Trailing-twelve EBITDA of $5.4M reflects $340K of normalized owner compensation defended against benchmark surveys, $620K of run-rate add-backs documented against three years of tax returns, and a working-capital peg set where a buyer's accountant would not argue. Customer concentration of 38% top-five flagged as deal-driver, not deal-breaker.",
    footerL: "8 add-backs · 3 defended",
    footerR: "LP-grade",
  },
  quarterly: {
    docLabel: "Portfolio · Q1 2026",
    statusVerb: "filed",
    section: "Section 9.1",
    headline: "Quarterly Portfolio Update",
    body:
      "Healthcare services holding tracking 6.2% above Day-1 plan on revenue retention, 11 of 13 milestones cleared on the 100-day plan, and three new commercial accounts onboarded in Q1. Working capital remains within the diligence-pegged band; covenant compliance comfortable across all three lender tests.",
    footerL: "milestones 11 / 13",
    footerR: "covenant ok",
  },
};

function ArtifactRecast() {
  const rows: [string, string, string][] = [
    ["Revenue",          "28,140",   "28,140"],
    ["COGS",             "(17,640)", "(17,640)"],
    ["SG&A",             "(4,920)",  "(4,580)"],
    ["Owner comp",       "(740)",    "(400)"],
    ["Add-backs",        "—",        "+620"],
    ["Normalized SDE",   "5,020",    "5,400"],
  ];
  return (
    <div
      style={{
        height: "100%",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 8,
        }}
      >
        <span>P&amp;L Recast — TTM</span>
        <span style={{ color: "var(--terra)" }}>● defended</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums lining-nums" }}>
        <thead>
          <tr>
            <th style={recastTh}>Line</th>
            <th style={{ ...recastTh, textAlign: "right" }}>Reported</th>
            <th style={{ ...recastTh, textAlign: "right" }}>Normalized</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isLast = i === rows.length - 1;
            return (
              <tr key={r[0]}>
                <td style={{ ...recastTd, fontWeight: isLast ? 700 : 400 }}>{r[0]}</td>
                <td style={{ ...recastTd, textAlign: "right", color: "var(--ink-tertiary)" }}>{r[1]}</td>
                <td
                  style={{
                    ...recastTd,
                    textAlign: "right",
                    fontWeight: isLast ? 700 : 400,
                    color: isLast ? "var(--terra)" : "var(--ink-primary)",
                  }}
                >
                  {r[2]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
const recastTh: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 8.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
  padding: "6px 0",
  textAlign: "left",
  borderBottom: "1px dotted var(--rule)",
};
const recastTd: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 10.5,
  padding: "6px 0",
  borderBottom: "1px dotted var(--rule)",
  color: "var(--ink-primary)",
};

function ArtifactBuyers() {
  const buyers: { name: string; kind: string; score: number }[] = [
    { name: "Apex Industrial Holdings",   kind: "Strategic", score: 5 },
    { name: "Forge Capital Partners",     kind: "Financial", score: 5 },
    { name: "Meridian Platform Co.",      kind: "Platform",  score: 4 },
    { name: "Caldera Industrial",         kind: "Strategic", score: 4 },
    { name: "Brightline Equity",          kind: "Financial", score: 3 },
    { name: "Northridge Holdings",        kind: "Strategic", score: 3 },
  ];
  return (
    <div style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 8,
        }}
      >
        <span>Buyer universe · healthcare</span>
        <span style={{ color: "var(--terra)" }}>● scored</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column" }}>
        {buyers.map((b) => (
          <li
            key={b.name}
            style={{
              display: "grid",
              gridTemplateColumns: "12px 1fr auto",
              gap: 8,
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px dotted var(--rule)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background:
                  b.kind === "Strategic" ? "var(--ink-primary)" :
                  b.kind === "Financial" ? "var(--terra)" :
                  "var(--ink-tertiary)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10.5,
                color: "var(--ink-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {b.name}
            </span>
            <span style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: i < b.score ? "var(--terra)" : "var(--rule)",
                  }}
                />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArtifactStructure() {
  return (
    <div style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span>Sources &amp; Uses · SBA</span>
        <span style={{ color: "var(--terra)" }}>● compliant</span>
      </div>

      <BarStack
        label="Sources"
        segments={[
          { label: "SBA 7(a)",     pct: 70, color: "var(--ink-primary)" },
          { label: "Seller note",  pct: 10, color: "var(--terra)" },
          { label: "Equity",       pct: 10, color: "var(--ink-secondary)" },
          { label: "Cash",         pct: 10, color: "var(--ink-tertiary)" },
        ]}
      />
      <BarStack
        label="Uses"
        segments={[
          { label: "Purchase",     pct: 86, color: "var(--ink-primary)" },
          { label: "Working cap.", pct: 8,  color: "var(--ink-secondary)" },
          { label: "Closing",      pct: 6,  color: "var(--ink-tertiary)" },
        ]}
      />

      <div
        style={{
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>$4.2M EBITDA · 5.5×</span>
        <span>SOP 50 10 8</span>
      </div>
    </div>
  );
}

function BarStack({
  label,
  segments,
}: {
  label: string;
  segments: { label: string; pct: number; color: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 2, overflow: "hidden", border: "1px solid var(--rule)" }}>
        {segments.map((s) => (
          <span key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 5,
          fontFamily: "var(--font-display)",
          fontSize: 9,
          color: "var(--ink-secondary)",
          flexWrap: "wrap",
        }}
      >
        {segments.map((s) => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />
            {s.label} {s.pct}%
          </span>
        ))}
      </div>
    </div>
  );
}

function ArtifactLOI() {
  return (
    <div style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 10,
        }}
      >
        <span>LOI · §4 · Earnout</span>
        <span style={{ color: "var(--terra)" }}>● redline</span>
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: "var(--font-editorial)",
          fontSize: 11,
          lineHeight: 1.5,
          color: "var(--ink-secondary)",
        }}
      >
        Buyer shall pay an earnout of up to $1,200,000 over the{" "}
        <span
          style={{
            textDecoration: "line-through",
            textDecorationColor: "var(--terra)",
            color: "var(--ink-quaternary)",
          }}
        >
          twelve (12) months
        </span>{" "}
        <span style={{ color: "var(--terra)", fontWeight: 700 }}>eighteen (18) months</span>{" "}
        following Closing, contingent on Company achieving trailing-twelve revenue retention of not less than{" "}
        <span style={{ color: "var(--terra)", fontWeight: 700 }}>92%</span>, measured monthly, with a floor of $400,000.
      </div>
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>cycle 2 of 3</span>
        <span>survives diligence</span>
      </div>
    </div>
  );
}

function ArtifactPMI() {
  const tracks: { label: string; spans: { from: number; to: number; color: string }[] }[] = [
    { label: "Day-1 readiness",   spans: [{ from: 0,  to: 30,  color: "var(--ink-primary)" }] },
    { label: "Customer comms",    spans: [{ from: 5,  to: 45,  color: "var(--terra)" }] },
    { label: "Systems migration", spans: [{ from: 15, to: 80,  color: "var(--ink-secondary)" }] },
    { label: "100-day plan",      spans: [{ from: 60, to: 100, color: "var(--ink-primary)" }] },
  ];
  return (
    <div style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 10,
        }}
      >
        <span>Day 0 → Day 100</span>
        <span style={{ color: "var(--terra)" }}>● scheduled</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {tracks.map((t) => (
          <div key={t.label}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                color: "var(--ink-primary)",
                marginBottom: 4,
              }}
            >
              {t.label}
            </div>
            <div style={{ position: "relative", height: 7, background: "var(--rule)", borderRadius: 999 }}>
              {t.spans.map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${s.from}%`,
                    width: `${s.to - s.from}%`,
                    top: 0,
                    bottom: 0,
                    background: s.color,
                    borderRadius: 999,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>13 weeks · 4 tracks</span>
        <span>industrial svc</span>
      </div>
    </div>
  );
}

/* ───────────────────────── From the desk ─────────────────────────
 * One editorial moment for readers who want voice. Brief — three
 * paragraphs, fleuron divider, byline. Picks up the magazine register
 * after the gallery has done the work.
 */
function FromTheDesk({ onGoHowItWorks }: Pick<MarketingHomeV23BProps, "onGoHowItWorks">) {
  return (
    <section
      style={{
        padding: `112px ${SECTION_PAD} 128px`,
        background: "var(--canvas-cream)",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          From the desk
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(30px, 3.6vw, 52px)",
            lineHeight: 1.04,
            letterSpacing: "-0.028em",
            margin: "0 0 24px",
            textWrap: "balance",
          }}
        >
          The integration is the moat —{" "}
          <span style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", fontWeight: 400 }}>
            and you can&apos;t cut and paste it.
          </span>
        </h2>

        <p
          className="dropcap-v2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--ink-primary)",
            margin: 0,
          }}
        >
          A practitioner can replicate any single capability above with ChatGPT and a weekend.
          The CIM. The buyer list. The QoE Lite. The structure model. Each one, on its own, is
          a prompt and a Friday afternoon.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink-secondary)",
            margin: "20px 0 0",
          }}
        >
          What you can&apos;t replicate in a weekend is the integration. The 22-gate
          methodology that decides which capability runs when, against which document, in
          which order. The 28 generators that share a single sourced-financials backbone so
          the CIM, the model, and the LOI all match. That integration takes about two years
          of engineering. It compounds. It&apos;s why Yulia produces work the practitioner-
          with-ChatGPT cannot — and why the work gets sharper the longer you use her.
        </p>

        <div
          style={{
            margin: "36px 0 28px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          <span style={{ color: "var(--ink-quaternary)", fontFamily: "var(--font-editorial)", fontSize: 18 }}>❦</span>
          <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--ink-tertiary)",
            }}
          >
            Filed by the editors · Apr 2026
          </span>
          <button
            type="button"
            onClick={onGoHowItWorks}
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-primary)",
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid var(--ink-primary)",
              transition: "background 200ms cubic-bezier(0.23,1,0.32,1), color 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ink-primary)";
              e.currentTarget.style.color = "var(--canvas-paper)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-primary)";
            }}
          >
            How it works <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Hooks ───────────────────────── */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default MarketingHomeV23B;
