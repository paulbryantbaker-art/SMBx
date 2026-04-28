/* MarketingHomeV23C.tsx — Anthropic / Cowork-style adoption.
 *
 * Mounted by HomeCanvas when `?v=c`. Replaces the Glean-style variant
 * that didn't land. Direct adoption of claude.com/product/cowork's
 * patterns applied with Cowork DL palette already encoded in
 * .impeccable.md (warm cream + Clay).
 *
 * Concept ("Restrained product page"):
 *   Centered hero with one short headline, one subhead, two CTAs,
 *   and a high-fidelity static screenshot of an SMBx working session
 *   below — chat rail on the left with Yulia drafting, canvas on the
 *   right with a CIM page in progress. The screenshot IS the proof.
 *   No persona tabs, no editorial italic foil, no live agent terminal,
 *   no Roman numerals, no fleurons. Tool-utility register, calm and
 *   confident — Anthropic's signature is restraint, not show-stoppers.
 *
 *   Below the hero: a 5-callout capability row (no icons, just type),
 *   and (Phase 2) alternating L/R feature blocks, How it works,
 *   Latest news, Final CTA, Footer.
 *
 * Phase 1 scope (this file):
 *   Masthead · centered hero · high-fidelity product screenshot mock
 *   · 5-callout capability row · placeholder footer.
 *
 * Constraints (per .impeccable.md):
 *   - Cowork DL tokens only — no purple/cyan, no glassmorphism
 *   - No emojis as icons, no robot SVGs
 *   - Italic-serif foil used ONCE max (and Phase 1 doesn't use it)
 *   - Transform/opacity-only animation
 *   - Conservative motion — Anthropic restraint, not editorial drama
 */

import {
  CSSProperties,
  useEffect,
  useState,
} from "react";

interface MarketingHomeV23CProps {
  onSend?: (msg: string) => void;
  onFocusChat?: () => void;
  onStartFree?: () => void;
  onGoJourney?: () => void;
  onGoHowItWorks?: () => void;
  onGoPricing?: () => void;
}

const SECTION_PAD = "56px";

export function MarketingHomeV23C({
  onFocusChat,
  onGoJourney,
  onGoHowItWorks,
}: MarketingHomeV23CProps) {
  return (
    <div
      className="smbx-edition v23c"
      style={{
        background: "var(--canvas-warm)",
        color: "var(--ink-primary)",
        fontFamily: "var(--font-body)",
        minHeight: "100%",
        /* Outer wrapper stays warm so the canvas-card's gutter
           exposes the warm body color (the "desk" the paper sits on). */
      }}
    >
      <PageStyles />
      {/* Canvas card — rounded paper sheet that lifts off the warm body.
          Right + bottom gutters show the warm bg. NO overflow:hidden:
          that's what historically broke sticky elements + floating
          pills. Border-radius alone gives the rounded look at the
          card's exposed edges (top + right/bottom gutters); inner
          sections fill the card width with their own bgs as before. */}
      <div
        className="canvas-card"
        style={{
          position: "relative",
          background: "var(--canvas-paper)",
          borderRadius: 12,
          margin: "8px 16px 32px 0",
          /* Layered shadow — bottom-weighted (Canva-style). The inner
             top highlight reads as paper edge sheen; mid shadows add
             ambient depth; bottom-weighted shadows (negative spread
             offsets) make the canvas feel like paper resting on a
             warm desk surface. */
          boxShadow: [
            "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
            "0 1px 0 rgba(26, 24, 20, 0.04)",
            "0 6px 14px rgba(26, 24, 20, 0.05)",
            "0 16px 36px rgba(26, 24, 20, 0.08)",
            "0 36px 60px -16px rgba(26, 24, 20, 0.14)",
            "0 56px 96px -28px rgba(26, 24, 20, 0.10)",
          ].join(", "),
        }}
      >
        <Hero onFocusChat={onFocusChat} />
        <CapabilityRow />
        <FeatureRecast onGoHowItWorks={onGoHowItWorks} />
        <FeatureCIM onGoHowItWorks={onGoHowItWorks} />
        <FeatureBuyers onGoHowItWorks={onGoHowItWorks} />
        <HowItWorks />
        <LatestNews />
        <FinalCTA onFocusChat={onFocusChat} />
        <SiteFooter />
      </div>
    </div>
  );
}

/* ─────────────────── Page-scoped styles ─────────────────── */
function PageStyles() {
  return (
    <style>{`
      .v23c .cta-primary {
        transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1),
                    box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-primary:hover {
        background: var(--terra-hover);
        box-shadow: 0 14px 30px rgba(212, 113, 78, 0.24);
      }
      .v23c .cta-primary:active {
        transform: scale(0.97);
      }

      .v23c .cta-secondary {
        transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-secondary:hover {
        border-color: var(--ink-primary);
        background: var(--canvas-cream);
      }
      .v23c .cta-secondary:active {
        transform: scale(0.97);
      }

      .v23c .pulse-dot {
        animation: v23cPulseDot 1.6s cubic-bezier(0.23, 1, 0.32, 1) infinite;
      }
      @keyframes v23cPulseDot {
        0%   { box-shadow: 0 0 0 0 currentColor; }
        70%  { box-shadow: 0 0 0 8px rgba(0, 0, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
      }

      .v23c .typing-cursor {
        display: inline-block;
        width: 2px;
        height: 1.05em;
        background: currentColor;
        vertical-align: text-bottom;
        margin-left: 2px;
        animation: v23cTypeCursor 1s steps(2) infinite;
      }
      @keyframes v23cTypeCursor {
        0%, 50%   { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      .v23c .nav-link {
        transition: color 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .nav-link:hover { color: var(--ink-primary); }

      @media (prefers-reduced-motion: reduce) {
        .v23c .pulse-dot { animation: none !important; }
        .v23c .typing-cursor { animation: none !important; opacity: 1; }
      }

      @media (max-width: 1023px) {
        .v23c .screenshot-grid {
          grid-template-columns: 1fr !important;
        }
        .v23c .screenshot-grid > .screenshot-canvas {
          border-left: none !important;
          border-top: 1px solid var(--rule);
        }
        .v23c .capability-row {
          grid-template-columns: 1fr 1fr !important;
        }
      }
      @media (max-width: 639px) {
        .v23c .capability-row {
          grid-template-columns: 1fr !important;
        }
        .v23c .masthead-nav { display: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────── Masthead ─────────────────── */
function Masthead({
  onGoJourney,
  onGoHowItWorks,
  onFocusChat,
}: Pick<MarketingHomeV23CProps, "onGoJourney" | "onGoHowItWorks" | "onFocusChat">) {
  const wrap: CSSProperties = {
    padding: `22px ${SECTION_PAD}`,
    borderBottom: "1px solid var(--rule)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  };
  const navLink: CSSProperties = {
    all: "unset",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: 14.5,
    letterSpacing: "-0.005em",
    color: "var(--ink-secondary)",
    cursor: "pointer",
    padding: "6px 0",
  };

  return (
    <header style={wrap}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.04em",
          color: "var(--ink-primary)",
        }}
      >
        smbx<span style={{ color: "var(--terra)" }}>.</span>ai
      </span>

      <nav className="masthead-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <button type="button" className="nav-link" style={navLink} onClick={onGoJourney}>
          Product
        </button>
        <button type="button" className="nav-link" style={navLink} onClick={onGoHowItWorks}>
          How it works
        </button>
        <button type="button" className="nav-link" style={navLink}>
          Pricing
        </button>
        <button type="button" className="nav-link" style={{ ...navLink, color: "var(--ink-primary)" }}>
          Sign in
        </button>
        <button
          type="button"
          className="cta-primary"
          onClick={onFocusChat}
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 14.5,
            color: "var(--canvas-paper)",
            background: "var(--terra)",
            padding: "10px 18px",
            borderRadius: 999,
            boxShadow: "0 4px 12px rgba(212, 113, 78, 0.18)",
          }}
        >
          Talk to Yulia
        </button>
      </nav>
    </header>
  );
}

/* ─────────────────── Hero ─────────────────── */
function Hero({
  onFocusChat,
}: Pick<MarketingHomeV23CProps, "onFocusChat">) {
  return (
    <section style={{ padding: `112px ${SECTION_PAD} 96px` }}>
      {/* Centered text block */}
      <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(44px, 5.4vw, 72px)",
            lineHeight: 1.04,
            letterSpacing: "-0.028em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
          }}
        >
          Close deals faster<span style={{ color: "var(--terra)" }}>.</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(17px, 1.4vw, 21px)",
            lineHeight: 1.55,
            color: "var(--ink-secondary)",
            margin: "24px auto 0",
            maxWidth: 720,
            textWrap: "pretty",
          }}
        >
          Hand off the deal work. Yulia drafts the documents, models the structures,
          and scores the buyers — while you make every call that matters.
        </p>

        <div
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="cta-primary"
            onClick={onFocusChat}
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 16,
              color: "var(--canvas-paper)",
              background: "var(--terra)",
              padding: "14px 26px",
              borderRadius: 999,
              boxShadow: "0 8px 22px rgba(212, 113, 78, 0.22)",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Talk to Yulia
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cta-secondary"
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 16,
              color: "var(--ink-primary)",
              padding: "13px 22px",
              borderRadius: 999,
              border: "1px solid var(--rule)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Watch the agent
            <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>

      {/* High-fidelity product screenshot mock */}
      <div style={{ marginTop: 88, maxWidth: 1180, margin: "88px auto 0" }}>
        <ProductScreenshot />
      </div>

      {/* Tiny supporting line under the screenshot — Anthropic move */}
      <div
        style={{
          marginTop: 28,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        Live workspace · industrial services · $5.4M EBITDA · drafted in 47 minutes
      </div>
    </section>
  );
}

/* ─────────────────── Product screenshot mock ─────────────────── */
/* The hero centerpiece. Mocked-up SMBx working session: browser chrome
 * + app title bar + chat rail (left) + canvas (right) + status bar.
 * Designed to look like a real screenshot at full size, with subtle
 * live elements (typewriter on Yulia's latest message, pulsing
 * "drafting" dot) so it doesn't feel completely static.
 *
 * Pure CSS/JSX — no images. Matches actual SMBx surfaces (chat rail
 * + tabbed canvas + Yulia + artifact tile) so it's brand-honest.
 */
function ProductScreenshot() {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        boxShadow:
          "0 32px 80px rgba(26, 24, 20, 0.14), 0 12px 24px rgba(26, 24, 20, 0.06)",
      }}
    >
      <BrowserChrome />
      <AppTitleBar />
      <div
        className="screenshot-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
          background: "var(--canvas-paper)",
        }}
      >
        <ChatRail />
        <CanvasPane />
      </div>
      <AppStatusBar />
    </div>
  );
}

/* Browser window chrome — three traffic lights + URL bar */
function BrowserChrome() {
  return (
    <div
      style={{
        height: 38,
        background: "var(--canvas-cream)",
        borderBottom: "1px solid var(--rule)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 16px",
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 7 }}>
        {[
          "rgba(255, 95, 86, 0.55)",
          "rgba(255, 189, 46, 0.55)",
          "rgba(39, 201, 63, 0.55)",
        ].map((c, i) => (
          <span
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: c,
              border: "1px solid rgba(26, 24, 20, 0.10)",
            }}
          />
        ))}
      </div>

      {/* URL bar */}
      <div
        style={{
          flex: 1,
          height: 22,
          maxWidth: 460,
          margin: "0 auto",
          background: "var(--canvas-paper)",
          border: "1px solid var(--rule)",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "-0.005em",
          color: "var(--ink-tertiary)",
        }}
      >
        <span style={{ marginRight: 8, color: "var(--ink-quaternary)" }}>🔒</span>
        smbx.ai/deals/industrial-svc-5400/cim
      </div>

      {/* Filler so the URL bar centers visually */}
      <div style={{ width: 33 }} />
    </div>
  );
}

/* App title bar — deal context + status pill */
function AppTitleBar() {
  return (
    <div
      style={{
        height: 56,
        borderBottom: "1px solid var(--rule)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        background: "var(--canvas-paper)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.028em",
            color: "var(--ink-primary)",
          }}
        >
          smbx<span style={{ color: "var(--terra)" }}>.</span>ai
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          Deals · Industrial Services · $5.4M EBITDA
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(98, 153, 135, 0.14)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#3f6e5f",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#629987" }} />
          gate 04 · CIM in progress
        </span>
        <div
          aria-hidden
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "var(--ink-primary)",
            color: "var(--canvas-paper)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          PB
        </div>
      </div>
    </div>
  );
}

/* Chat rail (left pane) — Yulia thread with typewriter on latest msg */
function ChatRail() {
  const reduced = usePrefersReducedMotion();
  const lastText =
    "Updated. CIM is now 92 pages, redline-ready. I cite-checked Section 3.2 against three years of returns.";
  const [typed, setTyped] = useState(reduced ? lastText : "");

  useEffect(() => {
    if (reduced) {
      setTyped(lastText);
      return;
    }
    setTyped("");
    let i = 0;
    let raf = 0;
    let prev = performance.now();
    const cps = 44;

    const step = (now: number) => {
      const dt = now - prev;
      const adv = Math.floor((dt / 1000) * cps);
      if (adv >= 1) {
        i = Math.min(lastText.length, i + adv);
        prev = now;
        setTyped(lastText.slice(0, i));
      }
      if (i < lastText.length) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const isComplete = typed.length === lastText.length;

  return (
    <div
      style={{
        background: "var(--canvas-cream)",
        padding: "20px 22px 22px",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 460,
      }}
    >
      {/* Rail header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          <span
            className="pulse-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--terra)",
              color: "rgba(212, 113, 78, 0.45)",
            }}
          />
          Yulia · live thread
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          gate 04
        </span>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <ChatRow
          who="yulia"
          ago="14 min"
          text="Section 3.2 (Operations & Customer Concentration) drafted. Want to review?"
        />
        <ChatRow
          who="you"
          ago="6 min"
          text="Tighten the customer concentration paragraph — emphasize renewal, downplay top-five share."
        />
        <ChatRow
          who="yulia"
          ago="now"
          text={typed}
          showCursor={!reduced && !isComplete}
        />
      </div>

      {/* Composer */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 12px",
          borderRadius: 12,
          background: "var(--canvas-paper)",
          border: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            color: "var(--ink-tertiary)",
          }}
        >
          Ask Yulia about Section 3.3…
        </span>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--terra)",
            color: "var(--canvas-paper)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ChatRow({
  who,
  ago,
  text,
  showCursor = false,
}: {
  who: "yulia" | "you";
  ago: string;
  text: string;
  showCursor?: boolean;
}) {
  const isYulia = who === "yulia";
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: isYulia ? "var(--terra)" : "var(--ink-primary)",
          color: "var(--canvas-paper)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "-0.01em",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {isYulia ? "Y" : "P"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 4,
          }}
        >
          {isYulia ? "Yulia" : "You"} · {ago}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "var(--ink-primary)",
          }}
        >
          {text}
          {showCursor && <span className="typing-cursor" aria-hidden />}
        </div>
      </div>
    </div>
  );
}

/* Canvas pane (right) — tab strip + CIM page mock */
function CanvasPane() {
  return (
    <div
      className="screenshot-canvas"
      style={{
        background: "var(--canvas-paper)",
        borderLeft: "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <CanvasTabStrip />
      <CIMPageMock />
    </div>
  );
}

function CanvasTabStrip() {
  const tabs = ["CIM", "Recast", "Buyers", "Structure", "LOI", "PMI"];
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid var(--rule)",
        background: "var(--canvas-cream)",
        padding: "0 12px",
        overflowX: "auto",
      }}
    >
      {tabs.map((t, i) => {
        const active = i === 0;
        return (
          <span
            key={t}
            style={{
              padding: "12px 14px",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              letterSpacing: "-0.005em",
              color: active ? "var(--ink-primary)" : "var(--ink-tertiary)",
              borderBottom: active ? "2px solid var(--terra)" : "2px solid transparent",
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

function CIMPageMock() {
  return (
    <div
      style={{
        flex: 1,
        padding: "32px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Section dateline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          paddingBottom: 12,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span>Confidential · CIM</span>
        <span style={{ color: "var(--terra)" }}>● drafting</span>
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-quaternary)",
          marginTop: 4,
        }}
      >
        Section 3.2
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "-0.022em",
          lineHeight: 1.18,
          color: "var(--ink-primary)",
          margin: 0,
        }}
      >
        Operations &amp; Customer Concentration
      </h3>

      <p
        style={{
          fontFamily: "var(--font-editorial)",
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "var(--ink-secondary)",
          margin: 0,
          textAlign: "justify",
        }}
      >
        The Company&apos;s industrial services revenue is anchored by a thirty-year
        operating history in the East Texas corridor, with a customer base concentrated
        in mid-market manufacturing. The top five accounts represent 38% of trailing-twelve
        revenue — a profile that reflects multi-decade relationships and a pattern of
        contract renewal at or near 100%.
      </p>

      <p
        style={{
          fontFamily: "var(--font-editorial)",
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "var(--ink-secondary)",
          margin: 0,
          textAlign: "justify",
        }}
      >
        Customer concentration historically reads as risk; in the Company&apos;s case
        it reads as moat. No top-five account has churned in the last six years.
      </p>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>page 24 / 92</span>
        <span>cite-checked · redline-ready</span>
      </div>
    </div>
  );
}

/* Status bar at bottom of the screenshot */
function AppStatusBar() {
  return (
    <div
      style={{
        height: 38,
        borderTop: "1px solid var(--rule)",
        background: "var(--canvas-cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-tertiary)",
      }}
    >
      <span>Last edited 2 min ago by Yulia · auto-saved</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span
          className="pulse-dot"
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "var(--terra)",
            color: "rgba(212, 113, 78, 0.45)",
          }}
        />
        Yulia · drafting
      </span>
    </div>
  );
}

/* ─────────────────── Capability row ─────────────────── */
function CapabilityRow() {
  const items: { label: string; body: string }[] = [
    { label: "Recast & value",     body: "Normalize the P&L. Defend the add-backs. Set the Baseline." },
    { label: "Draft the book",     body: "100-page CIM, redline-ready, in under an hour." },
    { label: "Score the buyers",   body: "Strategic, financial, platform — ranked against the seller." },
    { label: "Model the structure", body: "SBA, seller note, R&W, rollover. Sources & uses defended." },
    { label: "Plan the close",     body: "100-day PMI plan that knew what was promised in diligence." },
  ];

  return (
    <section
      style={{
        padding: `96px ${SECTION_PAD} 112px`,
        background: "var(--canvas-cream)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          Power through deal work
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(32px, 3.6vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.026em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
            maxWidth: 820,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Five things Yulia handles before your second coffee.
        </h2>
      </div>

      <div
        className="capability-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 0,
          borderTop: "1px solid var(--rule)",
        }}
      >
        {items.map((it, i) => (
          <div
            key={it.label}
            style={{
              padding: "26px 22px 22px",
              borderRight: i < items.length - 1 ? "1px solid var(--rule)" : "none",
              borderBottom: "1px solid var(--rule)",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--terra)",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              0{i + 1}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "-0.014em",
                lineHeight: 1.18,
                color: "var(--ink-primary)",
                marginBottom: 8,
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--ink-secondary)",
              }}
            >
              {it.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Feature blocks — 3 alternating L/R sections with mini visualizations
   ═══════════════════════════════════════════════════════════════════ */

interface FeatureBlockShellProps {
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  ctaLabel: string;
  onCta?: () => void;
  visual: React.ReactNode;
  visualOnRight: boolean;
  background?: string;
}

function FeatureBlockShell({
  eyebrow,
  headline,
  body,
  ctaLabel,
  onCta,
  visual,
  visualOnRight,
  background = "var(--canvas-paper)",
}: FeatureBlockShellProps) {
  const text = (
    <div style={{ minWidth: 0, maxWidth: 540 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--terra)",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(28px, 3.0vw, 42px)",
          lineHeight: 1.1,
          letterSpacing: "-0.024em",
          margin: 0,
          color: "var(--ink-primary)",
          textWrap: "balance",
        }}
      >
        {headline}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 16.5,
          lineHeight: 1.6,
          color: "var(--ink-secondary)",
          margin: "20px 0 28px",
          textWrap: "pretty",
        }}
      >
        {body}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="cta-secondary"
        style={{
          all: "unset",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 14.5,
          color: "var(--ink-primary)",
          padding: "11px 18px",
          borderRadius: 999,
          border: "1px solid var(--rule)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {ctaLabel}
        <span style={{ color: "var(--terra)" }}>→</span>
      </button>
    </div>
  );

  const visualBlock = (
    <div style={{ minWidth: 0, display: "flex", justifyContent: visualOnRight ? "flex-end" : "flex-start" }}>
      {visual}
    </div>
  );

  return (
    <section
      style={{
        padding: `112px ${SECTION_PAD}`,
        background,
      }}
    >
      <div
        className="feature-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 80,
          alignItems: "center",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {visualOnRight ? text : visualBlock}
        {visualOnRight ? visualBlock : text}
      </div>
    </section>
  );
}

/* ─────────────────── Feature 1: Recast ─────────────────── */
function FeatureRecast({ onGoHowItWorks }: { onGoHowItWorks?: () => void }) {
  return (
    <FeatureBlockShell
      eyebrow="Valuation"
      headline={<>Recast in an hour. List with a defensible <span style={{ color: "var(--terra)" }}>Baseline</span>.</>}
      body="Owner comp normalized against benchmarks. Add-backs defended against three years of tax returns. Working capital pegged where a buyer's accountant won't argue. The diligence you'd pay a firm twenty-five thousand dollars to run — done before you sign anything."
      ctaLabel="How recast works"
      onCta={onGoHowItWorks}
      visualOnRight
      background="var(--canvas-cream)"
      visual={<RecastVisual />}
    />
  );
}

function RecastVisual() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        padding: "28px 30px 26px",
        boxShadow:
          "0 24px 56px rgba(26, 24, 20, 0.10), 0 6px 14px rgba(26, 24, 20, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 22,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>P&amp;L Recast · TTM</span>
        <span style={{ color: "var(--terra)" }}>● defended</span>
      </div>

      {/* Big EBITDA delta */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 18 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 32,
            color: "var(--ink-tertiary)",
            textDecoration: "line-through",
            textDecorationColor: "var(--ink-tertiary)",
            fontVariantNumeric: "tabular-nums lining-nums",
          }}
        >
          $1.50M
        </span>
        <span style={{ color: "var(--terra)", fontSize: 14 }}>→</span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: "-0.028em",
            color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums lining-nums",
            lineHeight: 1,
          }}
        >
          $1.80M
        </span>
      </div>

      {/* Breakdown table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontVariantNumeric: "tabular-nums lining-nums",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                padding: "8px 0",
                borderBottom: "1px dotted var(--rule)",
              }}
            >
              Line
            </th>
            <th
              style={{
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                padding: "8px 0",
                borderBottom: "1px dotted var(--rule)",
              }}
            >
              Reported
            </th>
            <th
              style={{
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                padding: "8px 0",
                borderBottom: "1px dotted var(--rule)",
              }}
            >
              Normalized
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Owner comp",     "(740)", "(400)"],
            ["Add-backs",      "—",      "+620"],
            ["NWC peg",        "(230)", "(180)"],
            ["Normalized SDE", "1,500", "1,800"],
          ].map((r, i) => {
            const isLast = i === 3;
            return (
              <tr key={r[0]}>
                <td
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    fontWeight: isLast ? 700 : 400,
                    padding: "8px 0",
                    borderBottom: "1px dotted var(--rule)",
                    color: "var(--ink-primary)",
                  }}
                >
                  {r[0]}
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    textAlign: "right",
                    padding: "8px 0",
                    borderBottom: "1px dotted var(--rule)",
                    color: "var(--ink-tertiary)",
                  }}
                >
                  {r[1]}
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    textAlign: "right",
                    fontWeight: isLast ? 700 : 400,
                    padding: "8px 0",
                    borderBottom: "1px dotted var(--rule)",
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

      {/* Baseline callout */}
      <div
        style={{
          marginTop: 18,
          padding: "14px 16px",
          background: "rgba(212, 113, 78, 0.10)",
          border: "1px solid rgba(212, 113, 78, 0.28)",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-secondary)",
            marginBottom: 4,
          }}
        >
          The Baseline · multi-scenario
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--ink-primary)",
          }}
        >
          $7.2M – $9.4M · SBA-clearable at $7.8M
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Feature 2: CIM (mirrored) ─────────────────── */
function FeatureCIM({ onGoHowItWorks }: { onGoHowItWorks?: () => void }) {
  return (
    <FeatureBlockShell
      eyebrow="The book"
      headline={<>100 pages of CIM. <span style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", fontWeight: 400 }}>First draft before your second coffee.</span></>}
      body="Branded to your firm. Sourced to the seller's filings. Structured for the buyer your seller wants. Yulia drafts. You red-pen. The book a PE buyer expects, the morning the engagement letter is signed."
      ctaLabel="See a CIM example"
      onCta={onGoHowItWorks}
      visualOnRight={false}
      background="var(--canvas-paper)"
      visual={<CIMVisual />}
    />
  );
}

function CIMVisual() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        boxShadow:
          "0 24px 56px rgba(26, 24, 20, 0.10), 0 6px 14px rgba(26, 24, 20, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        aspectRatio: "5 / 7",
      }}
    >
      {/* Top stripe — confidential dateline */}
      <div
        style={{
          padding: "16px 26px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--canvas-cream)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>Confidential · CIM</span>
        <span style={{ color: "var(--terra)" }}>● drafting</span>
      </div>

      {/* Page body */}
      <div style={{ padding: "28px 30px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-quaternary)",
          }}
        >
          Section 3.2
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.022em",
            lineHeight: 1.18,
            color: "var(--ink-primary)",
            margin: 0,
          }}
        >
          Operations &amp; Customer Concentration
        </h3>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--ink-secondary)",
            margin: 0,
            textAlign: "justify",
          }}
        >
          The Company&apos;s industrial services revenue is anchored by a thirty-year operating
          history in the East Texas corridor, with a customer base concentrated in mid-market
          manufacturing. The top five accounts represent 38% of trailing-twelve revenue —
          a profile that reflects multi-decade relationships and a pattern of contract
          renewal at or near 100%.
        </p>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--ink-secondary)",
            margin: 0,
            textAlign: "justify",
          }}
        >
          Customer concentration historically reads as risk; in the Company&apos;s case
          it reads as moat. No top-five account has churned in the last six years.
        </p>
      </div>

      {/* Footer — page count */}
      <div
        style={{
          padding: "14px 26px",
          borderTop: "1px solid var(--rule)",
          background: "var(--canvas-cream)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>page 24 / 92</span>
        <span>cite-checked · redline-ready</span>
      </div>
    </div>
  );
}

/* ─────────────────── Feature 3: Buyer list ─────────────────── */
function FeatureBuyers({ onGoHowItWorks }: { onGoHowItWorks?: () => void }) {
  return (
    <FeatureBlockShell
      eyebrow="The buyers"
      headline={<>Strategic. Financial. Platform plays. <span style={{ color: "var(--terra)" }}>Scored, not piled.</span></>}
      body="Pulled from current public filings, recent transactions, and live activity — not a database that goes stale between renewals. Scored against the seller's profile so the outreach that goes out has a response rate."
      ctaLabel="How sourcing works"
      onCta={onGoHowItWorks}
      visualOnRight
      background="var(--canvas-cream)"
      visual={<BuyerListVisual />}
    />
  );
}

function BuyerListVisual() {
  const buyers: { name: string; kind: string; score: number; color: string }[] = [
    { name: "Apex Industrial Holdings",  kind: "Strategic", score: 5, color: "#1a1918" },
    { name: "Forge Capital Partners",    kind: "Financial", score: 5, color: "#d97757" },
    { name: "Meridian Platform Co.",     kind: "Platform",  score: 4, color: "#629987" },
    { name: "Caldera Industrial",        kind: "Strategic", score: 4, color: "#1a1918" },
    { name: "Brightline Equity",         kind: "Financial", score: 3, color: "#d97757" },
    { name: "Northridge Holdings",       kind: "Strategic", score: 3, color: "#1a1918" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        boxShadow:
          "0 24px 56px rgba(26, 24, 20, 0.10), 0 6px 14px rgba(26, 24, 20, 0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--canvas-cream)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
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
          Buyer universe · industrial svc
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "-0.012em",
            color: "var(--terra)",
          }}
        >
          21% pursue
        </span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {buyers.map((b, i) => (
          <li
            key={b.name}
            style={{
              display: "grid",
              gridTemplateColumns: "16px 1fr auto auto",
              alignItems: "center",
              gap: 14,
              padding: "14px 24px",
              borderBottom: i < buyers.length - 1 ? "1px solid var(--rule)" : "none",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: b.color,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 14,
                color: "var(--ink-primary)",
                letterSpacing: "-0.005em",
              }}
            >
              {b.name}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
              }}
            >
              {b.kind}
            </span>
            <span style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <span
                  key={j}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: j < b.score ? "var(--terra)" : "var(--rule)",
                  }}
                />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--rule)",
          background: "var(--canvas-cream)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
        }}
      >
        <span>62 scored · top 6</span>
        <span>2.5× platform avg</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   How it works — 3-step process (paper background)
   ═══════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const steps: { n: string; title: string; body: string; visual: React.ReactNode }[] = [
    {
      n: "01",
      title: "Tell Yulia about the deal.",
      body: "Paste a teaser, drop financials, or describe the situation. Yulia infers the gate and asks the right next question.",
      visual: <StepInputVisual />,
    },
    {
      n: "02",
      title: "Yulia drafts the work.",
      body: "Documents, models, buyer lists, structures — drafted in minutes against the deal context. Sourced, cited, ready for your red pen.",
      visual: <StepDraftVisual />,
    },
    {
      n: "03",
      title: "You make the calls that matter.",
      body: "Approve, edit, or send. Yulia produces options with implications. You decide. The subscription is the entire cost — closed deal or broken.",
      visual: <StepDecideVisual />,
    },
  ];

  return (
    <section
      style={{
        padding: `128px ${SECTION_PAD} 144px`,
        background: "var(--canvas-paper)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          How it works
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(32px, 3.6vw, 52px)",
            lineHeight: 1.06,
            letterSpacing: "-0.026em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
            maxWidth: 820,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Three steps from blank deal to first draft.
        </h2>
      </div>

      <div
        className="how-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 56,
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .how-grid { grid-template-columns: 1fr !important; gap: 64px !important; }
          }
        `}</style>
        {steps.map((s) => (
          <div key={s.n} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: "var(--terra)",
                marginBottom: 22,
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {s.n}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.018em",
                lineHeight: 1.18,
                margin: "0 0 12px",
                color: "var(--ink-primary)",
                textWrap: "balance",
              }}
            >
              {s.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink-secondary)",
                margin: "0 0 28px",
              }}
            >
              {s.body}
            </p>
            <div style={{ marginTop: "auto" }}>{s.visual}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Step 1 visual — chat input mock */
function StepInputVisual() {
  return (
    <div
      style={{
        background: "var(--canvas-cream)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 14px rgba(26, 24, 20, 0.06)",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "var(--terra)",
          color: "var(--canvas-paper)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 10,
          flexShrink: 0,
        }}
      >
        Y
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--ink-tertiary)",
        }}
      >
        Paste a teaser, describe a deal…
      </span>
      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: "var(--terra)",
          color: "var(--canvas-paper)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/* Step 2 visual — streaming text mock */
function StepDraftVisual() {
  return (
    <div
      style={{
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "0 4px 14px rgba(26, 24, 20, 0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--terra)",
          marginBottom: 10,
        }}
      >
        ● drafting · Section 3.2
      </div>
      <div
        style={{
          fontFamily: "var(--font-editorial)",
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--ink-secondary)",
        }}
      >
        The Company's revenue is anchored by a thirty-year operating history with multi-decade
        customer relationships
        <span className="typing-cursor" aria-hidden style={{ color: "var(--ink-secondary)" }} />
      </div>
    </div>
  );
}

/* Step 3 visual — approve / send mock */
function StepDecideVisual() {
  return (
    <div
      style={{
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        gap: 10,
        boxShadow: "0 4px 14px rgba(26, 24, 20, 0.06)",
      }}
    >
      <button
        type="button"
        style={{
          all: "unset",
          flex: 1,
          padding: "10px 14px",
          borderRadius: 999,
          background: "var(--terra)",
          color: "var(--canvas-paper)",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 13,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        Approve &amp; send
      </button>
      <button
        type="button"
        style={{
          all: "unset",
          padding: "10px 14px",
          borderRadius: 999,
          background: "transparent",
          border: "1px solid var(--rule)",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Edit
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Latest news — 3 dated callouts
   ═══════════════════════════════════════════════════════════════════ */

function LatestNews() {
  const items: { date: string; tag: string; title: string; excerpt: string }[] = [
    {
      date: "Apr 2026",
      tag: "Release",
      title: "Yulia 2.0 — sourcing engine ships.",
      excerpt: "Trigger-event detection across Google Places + Census + SBA data. The intern-reading-PDFs loop, automated.",
    },
    {
      date: "Mar 2026",
      tag: "Methodology",
      title: "The Baseline becomes default for Main Street.",
      excerpt: "Multi-scenario valuation with implications now anchors the listing conversation. Recast → range → realistic ask, in one session.",
    },
    {
      date: "Feb 2026",
      tag: "Field note",
      title: "QoE Lite catches 21% of LOI breaks before LOI.",
      excerpt: "The discrepancies that killed deals at Gate 18 in 2025 — surfaced at Gate 10. Saving searchers $40K+ per dead deal.",
    },
  ];

  return (
    <section
      style={{
        padding: `112px ${SECTION_PAD}`,
        background: "var(--canvas-cream)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 56,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-tertiary)",
              marginBottom: 12,
            }}
          >
            From the desk
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(28px, 3.0vw, 42px)",
              lineHeight: 1.1,
              letterSpacing: "-0.024em",
              margin: 0,
              color: "var(--ink-primary)",
              textWrap: "balance",
            }}
          >
            Latest from Yulia&apos;s field guide.
          </h2>
        </div>
        <button
          type="button"
          className="cta-secondary"
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 14.5,
            color: "var(--ink-primary)",
            padding: "11px 18px",
            borderRadius: 999,
            border: "1px solid var(--rule)",
            background: "var(--canvas-paper)",
          }}
        >
          All posts <span style={{ color: "var(--terra)" }}>→</span>
        </button>
      </div>

      <div
        className="news-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 28,
        }}
      >
        <style>{`
          @media (max-width: 1023px) { .news-grid { grid-template-columns: 1fr !important; gap: 24px !important; } }
        `}</style>
        {items.map((it) => (
          <article
            key={it.title}
            style={{
              background: "var(--canvas-paper)",
              border: "1px solid var(--rule)",
              borderRadius: 14,
              padding: "26px 26px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 6px 18px rgba(26, 24, 20, 0.05)",
              transition: "box-shadow 240ms cubic-bezier(0.23, 1, 0.32, 1), transform 240ms cubic-bezier(0.23, 1, 0.32, 1)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 18px 36px rgba(26, 24, 20, 0.10), 0 4px 10px rgba(26, 24, 20, 0.05)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(26, 24, 20, 0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
              }}
            >
              <span style={{ color: "var(--terra)", fontWeight: 600 }}>{it.date}</span>
              <span>·</span>
              <span>{it.tag}</span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: "-0.014em",
                lineHeight: 1.22,
                margin: 0,
                color: "var(--ink-primary)",
                textWrap: "balance",
              }}
            >
              {it.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--ink-secondary)",
                margin: 0,
              }}
            >
              {it.excerpt}
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: 10,
                borderTop: "1px solid var(--rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-primary)",
              }}
            >
              Read <span style={{ color: "var(--terra)" }}>→</span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Final CTA — restated headline + dual CTAs
   ═══════════════════════════════════════════════════════════════════ */

function FinalCTA({ onFocusChat }: Pick<MarketingHomeV23CProps, "onFocusChat">) {
  return (
    <section
      style={{
        padding: `144px ${SECTION_PAD} 160px`,
        background: "var(--canvas-paper)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 22,
          }}
        >
          Ready?
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(40px, 4.8vw, 64px)",
            lineHeight: 1.04,
            letterSpacing: "-0.028em",
            margin: 0,
            color: "var(--ink-primary)",
          }}
        >
          Hand off the work<span style={{ color: "var(--terra)" }}>.</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 1.4vw, 19px)",
            lineHeight: 1.55,
            color: "var(--ink-secondary)",
            margin: "20px auto 32px",
            maxWidth: 580,
            textWrap: "pretty",
          }}
        >
          The first deliverable is free — no card, no sales call. Talk to Yulia,
          paste a teaser, see what she produces.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="cta-primary"
            onClick={onFocusChat}
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 16,
              color: "var(--canvas-paper)",
              background: "var(--terra)",
              padding: "14px 28px",
              borderRadius: 999,
              boxShadow: "0 8px 22px rgba(212, 113, 78, 0.22)",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Talk to Yulia
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cta-secondary"
            style={{
              all: "unset",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 16,
              color: "var(--ink-primary)",
              padding: "13px 22px",
              borderRadius: 999,
              border: "1px solid var(--rule)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            See pricing <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Footer — sitemap columns + social + copyright
   ═══════════════════════════════════════════════════════════════════ */

function SiteFooter() {
  const columns: { heading: string; links: string[] }[] = [
    { heading: "Product",   links: ["Yulia",     "Pricing",  "Changelog", "Status"] },
    { heading: "Resources", links: ["How it works", "Field guide", "API docs", "Help center"] },
    { heading: "Solutions", links: ["For searchers", "For advisors", "For brokers", "For sponsors", "For bankers", "For planners"] },
    { heading: "Company",   links: ["About", "Press", "Careers", "Contact"] },
    { heading: "Terms",     links: ["Privacy", "Terms of service", "Security", "Compliance"] },
  ];

  return (
    <footer
      style={{
        padding: `80px ${SECTION_PAD} 56px`,
        background: "var(--canvas-warm)",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div
        className="footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr repeat(5, 1fr)",
          gap: 40,
          marginBottom: 56,
        }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .footer-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 639px) {
            .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          }
        `}</style>
        <div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.04em",
              color: "var(--ink-primary)",
            }}
          >
            smbx<span style={{ color: "var(--terra)" }}>.</span>ai
          </span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "var(--ink-tertiary)",
              margin: "12px 0 0",
              maxWidth: 280,
            }}
          >
            The AI deal team for people who do deals — drafts the documents,
            models the structures, scores the buyers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                marginBottom: 14,
              }}
            >
              {col.heading}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      color: "var(--ink-secondary)",
                      textDecoration: "none",
                      transition: "color 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-secondary)"; }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div
        style={{
          paddingTop: 28,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          © 2026 smbx.ai · All rights reserved
        </span>
        <div style={{ display: "flex", gap: 18 }}>
          {["LinkedIn", "X", "YouTube"].map((s) => (
            <a
              key={s}
              href="#"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-secondary)",
                textDecoration: "none",
                transition: "color 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--terra)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-secondary)"; }}
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── Hooks ─────────────────── */
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

export default MarketingHomeV23C;
