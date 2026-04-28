/* HowItWorksCanvas.tsx — /how-it-works in Anthropic-restraint vocabulary.
 *
 * Mounted by AppShell at /how-it-works. Canvas-wrapped paper sheet
 * floats on warm body (matches V23C home + Pricing).
 *
 * Eight sections per V21 copy spec, restrained per .impeccable.md:
 *   1. Hero — "Analysis. Options. Implications. You decide."
 *   2. Mechanical breakdown — 2×2 of pattern beats
 *   3. What Yulia will never do — 5 numbered restraint statements
 *   4. A real redacted example — 3 acts on a $5.4M EBITDA platform
 *   5. Why restraint is positioning — software-side-of-the-line
 *   6. The integration moat — capabilities + workspace lock-in
 *   7. Glossary — 3 cards (Baseline / Blind Equity / Rundown)
 *   8. Final CTA
 *
 * Anthropic restraint applied:
 *   - One italic-foil moment per page max (used on "You decide.")
 *   - Hero scale ≤72px (NOT 124px V21)
 *   - No Roman numerals, no fleurons, no drop caps
 *   - Sans throughout, italic-serif foil only as the single moment
 *   - Conservative motion (hover lifts, FAQ-style expand on glossary)
 *   - Canvas card wraps content; warm body shows in gutters
 */

import { useState } from 'react';

interface Props {
  onStartFree: () => void;
  onContactSales: (msg: string) => void;
  /** AppShell signature compat. */
  dark: boolean;
}

const SECTION_PAD = "56px";

export default function HowItWorksCanvas({ onStartFree, onContactSales }: Props) {
  return (
    <div
      className="smbx-edition v23c"
      style={{
        background: "var(--canvas-warm)",
        color: "var(--ink-primary)",
        fontFamily: "var(--font-body)",
        minHeight: "100%",
      }}
    >
      <PageStyles />
      <div
        className="canvas-card"
        style={{
          position: "relative",
          background: "var(--canvas-paper)",
          borderRadius: 12,
          margin: "8px 16px 32px 0",
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
        <Hero onStartFree={onStartFree} />
        <MechanicalBreakdown />
        <NeverDo />
        <RealExample />
        <WhyRestraint />
        <IntegrationMoat />
        <Glossary />
        <FinalCTA onStartFree={onStartFree} onContactSales={onContactSales} />
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
      .v23c .cta-primary:hover { background: var(--terra-hover); box-shadow: 0 14px 30px rgba(212, 113, 78, 0.24); }
      .v23c .cta-primary:active { transform: scale(0.97); }
      .v23c .cta-secondary {
        transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-secondary:hover { border-color: var(--ink-primary); background: var(--canvas-cream); }
      .v23c .cta-secondary:active { transform: scale(0.97); }
      .v23c .glossary-card {
        transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1),
                    box-shadow 280ms cubic-bezier(0.23, 1, 0.32, 1),
                    border-color 280ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .glossary-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 36px rgba(26, 24, 20, 0.10);
        border-color: rgba(26, 24, 20, 0.18);
      }
      @media (max-width: 1023px) {
        .v23c .mech-grid { grid-template-columns: 1fr 1fr !important; }
        .v23c .glossary-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
        .v23c .integration-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 639px) {
        .v23c .mech-grid { grid-template-columns: 1fr !important; }
        .v23c .integration-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

/* ─────────────────── 1. Hero ─────────────────── */
function Hero({ onStartFree }: { onStartFree: () => void }) {
  return (
    <section style={{ padding: `112px ${SECTION_PAD} 88px` }}>
      <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--terra)",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          The pattern
        </div>
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
          Analysis. Options. Implications.{" "}
          <span style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", fontWeight: 400 }}>
            You decide
          </span>
          <span style={{ color: "var(--terra)" }}>.</span>
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
          Yulia is the deal team you hire. She does the work. You make every call
          that matters. That restraint is the product.
        </p>
        <div style={{ marginTop: 36, display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="cta-primary" onClick={onStartFree} style={primaryCta()}>
            Talk to Yulia
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="cta-secondary" style={secondaryCta()}>
            See pricing <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 2. Mechanical breakdown ─────────────────── */
function MechanicalBreakdown() {
  const beats: { label: string; title: string; body: string }[] = [
    {
      label: "Analysis",
      title: "She reads. She reconciles. She sources.",
      body: "Yulia reads the documents you upload, runs the numbers against benchmarks, pulls the comps, and surfaces the data that matters.",
    },
    {
      label: "Options",
      title: "Three or four paths. Not one recommendation.",
      body: "Yulia offers options — each with implications. Quick cash. Structured sale. Strategic process. Each is a real path, not a strawman.",
    },
    {
      label: "Implications",
      title: "Price. Structure. Timing. Tax. Close certainty.",
      body: "Every option carries its consequences — what changes about valuation, structure, tax treatment, and close probability when you pick it.",
    },
    {
      label: "You decide",
      title: "Yulia drafts the message. You send it.",
      body: "Every time. Yulia's job is to clarify the choice. Yours is to make it. The subscription is the entire cost — closed deal or broken.",
    },
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
      <div style={{ textAlign: "center", marginBottom: 64 }}>
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
          The mechanical breakdown
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
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          What the pattern looks like, beat by beat.
        </h2>
      </div>
      <div
        className="mech-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px 36px",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {beats.map((b, i) => (
          <div
            key={b.label}
            style={{
              background: "var(--canvas-paper)",
              border: "1px solid var(--rule)",
              borderRadius: 14,
              padding: "32px 28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: "-0.020em",
                  color: "var(--terra)",
                  fontVariantNumeric: "tabular-nums lining-nums",
                }}
              >
                0{i + 1}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ink-secondary)",
                  fontWeight: 600,
                }}
              >
                {b.label}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: "-0.014em",
                lineHeight: 1.2,
                margin: "0 0 12px",
                color: "var(--ink-primary)",
                textWrap: "balance",
              }}
            >
              {b.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink-secondary)",
                margin: 0,
              }}
            >
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── 3. What Yulia will never do ─────────────────── */
function NeverDo() {
  const statements: { num: string; title: string; body: string }[] = [
    {
      num: "01",
      title: "She will not negotiate on your behalf.",
      body: "She drafts the counter, flags the walk-away, explains the leverage. You send the email.",
    },
    {
      num: "02",
      title: "She will not hold funds.",
      body: "Escrow runs through your attorney — never through smbX.",
    },
    {
      num: "03",
      title: "She will not charge a success fee.",
      body: "The subscription is the entire cost. Closed deal or broken.",
    },
    {
      num: "04",
      title: "She will not represent you as a fiduciary.",
      body: "smbX is software. Yulia is a tool — not your agent.",
    },
    {
      num: "05",
      title: "She will not guarantee an outcome.",
      body: "Ranges with methodology. Every time.",
    },
  ];
  return (
    <section style={{ padding: `112px ${SECTION_PAD}` }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
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
          The restraints
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
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Five things Yulia will never do.
        </h2>
      </div>
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {statements.map((s, i) => (
          <div
            key={s.num}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 28,
              alignItems: "flex-start",
              padding: "28px 0",
              borderBottom: i < statements.length - 1 ? "1px solid var(--rule)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 32,
                letterSpacing: "-0.028em",
                color: "var(--terra)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums lining-nums",
                width: 56,
              }}
            >
              {s.num}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: "-0.014em",
                  lineHeight: 1.22,
                  margin: 0,
                  color: "var(--ink-primary)",
                  textWrap: "balance",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "var(--ink-secondary)",
                  margin: "8px 0 0",
                }}
              >
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── 4. A real redacted example ─────────────────── */
function RealExample() {
  return (
    <section
      style={{
        padding: `112px ${SECTION_PAD}`,
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
          A real interaction
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
          }}
        >
          Names changed. Numbers preserved.
        </h2>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Act 01 — The question */}
        <ActCard
          act="01"
          label="The question"
          context="Industrial services platform · $28M revenue · $5.4M EBITDA · multi-state · founder age 61."
          quote={`"What's it worth, and what's the right way to take it to market?"`}
        />

        {/* Act 02 — Yulia's analysis */}
        <div
          style={{
            background: "var(--canvas-paper)",
            border: "1px solid var(--rule)",
            borderRadius: 14,
            padding: "32px 32px 28px",
          }}
        >
          <ActHeader act="02" label="Yulia's analysis" />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--ink-secondary)",
              margin: "16px 0 24px",
            }}
          >
            EBITDA of $5.4M after normalizing $340K of owner-related compensation and defending $620K of run-rate
            add-backs against three years of tax returns and customer contracts.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <OptionCard
              num="Option 1"
              mult="5.5×"
              time="4–6 mo"
              body="Limited financial-buyer process. ~85% cash at close. Two-year transition. Founder-friendly buyer profile."
            />
            <OptionCard
              num="Option 2"
              mult="6.8×"
              time="6–9 mo"
              body="Broader process to PE platform buyers. 75% cash + 25% rollover equity. Earnout on revenue retention."
              recommended
            />
            <OptionCard
              num="Option 3"
              mult="7.5×"
              time="8–14 mo"
              body="Strategic-buyer process. Mixed stock and cash. Longest timeline, highest terminal value."
            />
          </div>
        </div>

        {/* Act 03 — Decision */}
        <div
          style={{
            background: "var(--canvas-paper)",
            border: "1px solid var(--rule)",
            borderRadius: 14,
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <ActHeader act="03" label="The decision" centered />
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(36px, 4.4vw, 56px)",
              lineHeight: 1,
              letterSpacing: "-0.030em",
              margin: "12px 0 16px",
              color: "var(--ink-primary)",
            }}
          >
            Option 2<span style={{ color: "var(--terra)" }}>.</span>
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--ink-secondary)",
              margin: "0 auto",
              maxWidth: 680,
            }}
          >
            Yulia drafted the engagement letter and the kickoff CIM outline. The founder reviewed, adjusted the
            rollover percentage, and authorized the advisor to begin marketing.
          </p>
          <p
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--ink-tertiary)",
              margin: "20px auto 0",
            }}
          >
            The decision was the user&apos;s. Yulia&apos;s job was finished when the options were clear.
          </p>
        </div>
      </div>
    </section>
  );
}

function ActCard({ act, label, context, quote }: { act: string; label: string; context: string; quote: string }) {
  return (
    <div
      style={{
        background: "var(--canvas-paper)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        padding: "32px",
      }}
    >
      <ActHeader act={act} label={label} />
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginTop: 14,
          marginBottom: 18,
        }}
      >
        {context}
      </div>
      <blockquote
        style={{
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(22px, 2.4vw, 30px)",
          lineHeight: 1.3,
          letterSpacing: "-0.014em",
          color: "var(--ink-primary)",
          margin: 0,
          paddingLeft: 22,
          borderLeft: "2px solid var(--terra)",
          textWrap: "balance",
        }}
      >
        {quote}
      </blockquote>
    </div>
  );
}

function ActHeader({ act, label, centered }: { act: string; label: string; centered?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        justifyContent: centered ? "center" : "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "-0.020em",
          color: "var(--terra)",
        }}
      >
        Act {act}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-secondary)",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function OptionCard({
  num,
  mult,
  time,
  body,
  recommended,
}: {
  num: string;
  mult: string;
  time: string;
  body: string;
  recommended?: boolean;
}) {
  return (
    <div
      style={{
        background: recommended ? "rgba(212, 113, 78, 0.05)" : "var(--canvas-cream)",
        border: recommended ? "1px solid rgba(212, 113, 78, 0.32)" : "1px solid var(--rule)",
        borderRadius: 12,
        padding: "20px 18px",
        position: "relative",
      }}
    >
      {recommended && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "var(--terra)",
            borderRadius: "12px 12px 0 0",
          }}
        />
      )}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginBottom: 10,
        }}
      >
        {num}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "-0.026em",
            color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums lining-nums",
            lineHeight: 1,
          }}
        >
          {mult}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          {time}
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "var(--ink-secondary)",
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* ─────────────────── 5. Why restraint is positioning ─────────────────── */
function WhyRestraint() {
  return (
    <section style={{ padding: `112px ${SECTION_PAD}` }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
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
          The moat (restated)
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
          Every other AI deal tool lives inside a regulated firm.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--ink-secondary)",
            margin: "28px 0 0",
            textWrap: "pretty",
          }}
        >
          Banks. Law firms. PE funds. When their AI makes a recommendation, it&apos;s made inside a fiduciary
          relationship with a client. smbX doesn&apos;t sit inside that relationship. That&apos;s not a gap —
          that&apos;s what lets a principal use Yulia directly without triggering broker-dealer regulation, and
          what lets an advisor use her inside their firm without competing with her.
        </p>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--ink-tertiary)",
            margin: "20px 0 0",
          }}
        >
          The software side of the line is a structural advantage, not a limitation.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────── 6. The integration moat ─────────────────── */
function IntegrationMoat() {
  const caps = [
    "22-gate methodology",
    "28 document generators",
    "Sourcing pipeline",
    "Scoring engine",
    "CIM workflow",
    "Buyer-list engine",
    "Structure modeling",
    "Deal room + diligence Q&A",
    "Post-close PMI",
    "Deal-context memory",
    "Cross-deal templates",
    "Yulia conversation",
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
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
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
            Why this isn&apos;t a ChatGPT wrapper
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
              maxWidth: 820,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Twelve capabilities. One workspace. Two years of integration that can&apos;t be cut and pasted.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--ink-secondary)",
              margin: "24px auto 0",
              maxWidth: 760,
              textWrap: "pretty",
            }}
          >
            A practitioner can replicate any single capability with ChatGPT and a weekend. The CIM. The buyer
            list. The QoE Lite. Each one, on its own, is a prompt and a Friday afternoon.{" "}
            <strong style={{ color: "var(--ink-primary)" }}>What you can&apos;t replicate is the integration —</strong>{" "}
            the methodology that decides which capability runs when, against which document, in which order.
          </p>
        </div>
        <div
          className="integration-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {caps.map((c, i) => (
            <div
              key={c}
              style={{
                background: "var(--canvas-paper)",
                border: "1px solid var(--rule)",
                borderRadius: 12,
                padding: "20px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--terra)",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums lining-nums",
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14.5,
                  lineHeight: 1.4,
                  color: "var(--ink-primary)",
                  fontWeight: 500,
                }}
              >
                {c}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--ink-tertiary)",
            }}
          >
            The capabilities are the surface. The integration is the moat.
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 7. Glossary ─────────────────── */
function Glossary() {
  const terms: { tm: string; def: string }[] = [
    {
      tm: "The Baseline™",
      def: "A multi-scenario valuation with implications. Three or four paths — each with price, structure, timing, tax, and close certainty defended against the seller's financials and the current market. Not a recommendation. A starting point for the conversation that decides the deal.",
    },
    {
      tm: "Blind Equity™",
      def: "The value hiding in financials that an unprepared seller leaves behind. Owner-comp normalization. Defended add-backs. Working-capital pegging. Customer-concentration scoring. The QoE-style work that sets the floor on the seller's price.",
    },
    {
      tm: "The Rundown™",
      def: "The complete deal intelligence package — CIM, teaser, buyer list, structure model, methodology — branded to your firm. Generated in hours, ready for your red pen, defensible against any sophisticated buyer's diligence.",
    },
  ];
  return (
    <section style={{ padding: `112px ${SECTION_PAD}` }}>
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
          The language
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
          Three terms you&apos;ll see in every Yulia deliverable.
        </h2>
      </div>
      <div
        className="glossary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 22,
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {terms.map((t) => (
          <article
            key={t.tm}
            className="glossary-card"
            style={{
              background: "var(--canvas-paper)",
              border: "1px solid var(--rule)",
              borderRadius: 14,
              padding: "32px 28px",
              boxShadow: "0 4px 14px rgba(26, 24, 20, 0.04)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: "-0.022em",
                lineHeight: 1.15,
                margin: "0 0 16px",
                color: "var(--ink-primary)",
              }}
            >
              {t.tm}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--ink-secondary)",
                margin: 0,
              }}
            >
              {t.def}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── 8. Final CTA ─────────────────── */
function FinalCTA({
  onStartFree,
  onContactSales,
}: {
  onStartFree: () => void;
  onContactSales: (msg: string) => void;
}) {
  return (
    <section
      style={{
        padding: `144px ${SECTION_PAD} 160px`,
        background: "var(--canvas-paper)",
        textAlign: "center",
        borderTop: "1px solid var(--rule)",
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
          See what she produces<span style={{ color: "var(--terra)" }}>.</span>
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
          Paste a teaser. Describe a deal. Ask her a question. See the options.
        </p>
        <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="cta-primary" onClick={onStartFree} style={primaryCta()}>
            Talk to Yulia
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cta-secondary"
            style={secondaryCta()}
            onClick={() => onContactSales("I'd like to learn more about smbX for our team.")}
          >
            Talk to sales <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Footer ─────────────────── */
function SiteFooter() {
  const columns: { heading: string; links: string[] }[] = [
    { heading: "Product",   links: ["Yulia",     "Pricing",  "Changelog", "Status"] },
    { heading: "Resources", links: ["How it works", "Field guide", "API docs", "Help center"] },
    { heading: "Solutions", links: ["For searchers", "For advisors", "For brokers", "For sponsors", "For bankers", "For planners"] },
    { heading: "Company",   links: ["About", "Press", "Careers", "Contact"] },
    { heading: "Terms",     links: ["Privacy", "Terms of service", "Security", "Compliance"] },
  ];
  return (
    <footer style={{ padding: `80px ${SECTION_PAD} 56px`, background: "var(--canvas-warm)", borderTop: "1px solid var(--rule)" }}>
      <div
        className="footer-grid"
        style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(5, 1fr)", gap: 40, marginBottom: 56 }}
      >
        <style>{`
          @media (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 639px)  { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
        `}</style>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.04em", color: "var(--ink-primary)" }}>
            smbx<span style={{ color: "var(--terra)" }}>.</span>ai
          </span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-tertiary)", margin: "12px 0 0", maxWidth: 280 }}>
            The AI deal team for people who do deals — drafts the documents, models the structures, scores the buyers.
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
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

/* ─────────────────── Shared CTA styles ─────────────────── */
function primaryCta(): React.CSSProperties {
  return {
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
  };
}
function secondaryCta(): React.CSSProperties {
  return {
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
  };
}

// Suppress unused state warning — useState imported for parity with other canvases
void useState;
