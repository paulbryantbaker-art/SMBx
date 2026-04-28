/* MarketingHome.tsx — The Edition · Home canvas.
 *
 * Mounted by AppShell at "/" when the user is logged out.
 * Wraps everything in <div className="smbx-edition"> — that class is
 * the only place tokens are scoped, and the only place AppShell's
 * elevation/canvas-card chrome attaches via marketing/index.css.
 *
 *   Geometry contract:
 *     margin-left: clamp(360px, 30vw, 480px) — mirrors YuliaWalkthrough.
 *     On mobile (<1024px) the rail is hidden and the page goes full width.
 *
 *   Sections, in order, all 56px horizontal padding:
 *     0  Masthead             — wordmark + dateline + nav + tabular strip
 *     1  Cover hero           — Close deals faster. + lede + CTA + plate
 *     2  Spine                — three-line pull quote
 *     3  What Yulia does      — 4 capabilities (zigzag rhythm)
 *     4  Consolidation        — 6-cell capability grid
 *     5  The whole arc        — 4-stage horizontal table
 *     6  Pricing              — 5 tiers, Pro elevated
 *     7  Testimonial          — italic blockquote, byline strip
 *     8  Closer               — dark band, "She's already waiting." + CTA
 *
 * Tokens consumed: every var() defined in tokens.css.
 * Layout utilities: Tailwind classes for flex/grid/gap/min-w-0 only;
 * everything else (color, type, shadow, radius, spacing) is inline
 * style with var() per the team convention.
 */

import { CSSProperties } from "react";
import { FolioStamp } from "./shared/FolioStamp";
import { Fleuron } from "./shared/Fleuron";
import { CapRow } from "./shared/CapRow";
import { CapCompact } from "./shared/CapCompact";
import { CIMArtifact } from "./shared/CIMArtifact";
import { SOPArtifact } from "./shared/SOPArtifact";

interface MarketingHomeProps {
  onFocusChat?: () => void;
  onStartFree?: () => void;
  onGoJourney?: () => void;
  onGoHowItWorks?: () => void;
  onGoPricing?: () => void;
}

const SECTION_PAD = "56px";

export function MarketingHome({
  onFocusChat,
  onGoJourney,
  onGoHowItWorks,
}: MarketingHomeProps) {
  return (
    <div
      className="smbx-edition"
      style={{
        background: "var(--canvas-paper)",
        color: "var(--ink-primary)",
        fontFamily: "var(--font-body)",
        /* AppShell margin-left: clamp(360px, 30vw, 480px) is set on the
           parent route container — not here — so this component is
           agnostic to its outer offset. Keep it that way. */
      }}
    >
      <Masthead onGoJourney={onGoJourney} onGoHowItWorks={onGoHowItWorks} />
      <CoverHero onFocusChat={onFocusChat} />
      <SpinePullquote />
      <WhatYuliaDoes />
      <Fleuron />
      <Consolidation />
      <Arc />
      <Fleuron />
      <Pricing />
      <Testimonial />
      <Closer onFocusChat={onFocusChat} onGoHowItWorks={onGoHowItWorks} />
    </div>
  );
}

/* ─────────────────────────── Masthead ─────────────────────────── */
function Masthead({
  onGoJourney,
  onGoHowItWorks,
}: Pick<MarketingHomeProps, "onGoJourney" | "onGoHowItWorks">) {
  const wrap: CSSProperties = { padding: `24px ${SECTION_PAD} 0` };
  const ruleRow: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottom: "2px solid var(--ink-primary)",
  };
  const datelineStrip: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--ink-tertiary)",
  };
  const navItem = (active: boolean): CSSProperties => ({
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: active ? "var(--ink-primary)" : "var(--ink-tertiary)",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    borderBottom: active ? "2px solid var(--ink-primary)" : "2px solid transparent",
    paddingBottom: 4,
    marginBottom: -16,
  });

  return (
    <header style={wrap}>
      <div style={ruleRow}>
        <div className="flex items-baseline" style={{ gap: 22 }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 19,
            letterSpacing: "-0.04em",
          }}>
            smbx<span style={{ color: "var(--terra)" }}>.</span>
          </span>
          <span style={{
            fontFamily: "var(--font-editorial)",
            fontStyle: "italic",
            fontSize: 14.5,
            color: "var(--ink-tertiary)",
          }}>
            The Edition · No. 04 · Apr 2026
          </span>
        </div>
        <nav className="flex" style={{ gap: 18 }}>
          <span style={navItem(true)}>Home</span>
          <span style={navItem(false)} onClick={onGoJourney}>Journey</span>
          <span style={navItem(false)} onClick={onGoHowItWorks}>How it works</span>
          <span style={navItem(false)}>Pricing</span>
        </nav>
      </div>
      <div className="figs-tab" style={datelineStrip}>
        <span>Filed Apr 2026</span>
        <span>For people who do deals for a living</span>
        <span>200+ dealmakers · vol. IV</span>
      </div>
    </header>
  );
}

/* ─────────────────────────── Cover hero ─────────────────────────── */
function CoverHero({ onFocusChat }: Pick<MarketingHomeProps, "onFocusChat">) {
  const sectionStyle: CSSProperties = { padding: `56px ${SECTION_PAD} 64px` };

  const h1Style: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(56px, 8.4vw, 124px)",
    lineHeight: 0.86,
    letterSpacing: "-0.044em",
    margin: 0,
    textWrap: "balance",
  };

  const ledeStyle: CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: 18,
    lineHeight: 1.55,
    color: "var(--ink-primary)",
    maxWidth: 600,
    margin: 0,
    textWrap: "pretty",
  };

  const proofGrid: CSSProperties = {
    marginTop: 28,
    paddingTop: 16,
    borderTop: "1px solid var(--rule)",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--ink-secondary)",
  };

  const ctaStyle: CSSProperties = {
    background: "var(--terra)",
    color: "#fff",
    border: "none",
    padding: "18px 28px",
    borderRadius: 10,
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    letterSpacing: "-0.005em",
    boxShadow: "0 8px 24px rgba(212, 113, 78, 0.28)",
  };

  return (
    <section style={sectionStyle}>
      <div className="eyebrow" style={{ marginBottom: 22, color: "var(--ink-tertiary)" }}>
        Cover Story · For the people who do deals for a living
      </div>

      <h1 style={h1Style}>
        Close{" "}
        <span style={{
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontWeight: 400,
        }}>
          deals
        </span>
        <br />
        <span style={{ color: "var(--terra)" }}>faster.</span>
      </h1>

      <div
        className="grid items-start"
        style={{ marginTop: 48, gridTemplateColumns: "1.5fr 1fr", gap: 56 }}
      >
        <div>
          <p className="dropcap-v2" style={ledeStyle}>
            Yulia is the AI deal team that compresses weeks into hours —
            drafting the documents, running the numbers, building the buyer
            lists, and moving deals forward while you sleep. Built for the M&amp;A
            professionals who do deals for a living.
          </p>
          <div className="figs-tab" style={proofGrid}>
            <span>No success fees, ever</span>
            <span>Free to start</span>
            <span>Full deal team · subscription</span>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: 22 }}>
          <button onClick={onFocusChat} style={ctaStyle}>
            ↙ Or just start typing in the chat
          </button>
          <CoverPlate />
        </div>
      </div>
    </section>
  );
}

function CoverPlate() {
  return (
    <div className="cover-plate" style={{ width: "100%", fontSize: 9.5 }}>
      <div className="row"><span>Edition</span><strong>No. 04 · Vol. IV</strong></div>
      <div className="row"><span>Filed</span><strong>Apr 2026</strong></div>
      <div className="row"><span>Pricing</span><strong>$0 · $49 · $149 · $999</strong></div>
      <div className="row" style={{ borderBottom: "1px solid var(--ink-primary)" }}>
        <span>Enterprise</span><strong>Contact sales</strong>
      </div>
    </div>
  );
}

/* ─────────────────────────── Spine ─────────────────────────── */
function SpinePullquote() {
  const sectionStyle: CSSProperties = {
    padding: `88px ${SECTION_PAD}`,
    background: "linear-gradient(180deg, var(--canvas-paper) 0%, var(--canvas-cream) 100%)",
  };

  const line1: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(36px, 4.8vw, 68px)",
    lineHeight: 1.0,
    letterSpacing: "-0.038em",
    margin: 0,
    textWrap: "balance",
    color: "var(--ink-primary)",
  };

  const line2: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: "clamp(24px, 2.8vw, 38px)",
    lineHeight: 1.18,
    letterSpacing: "-0.016em",
    margin: "28px 0 0",
    color: "var(--ink-secondary)",
    textWrap: "balance",
  };

  const line3: CSSProperties = {
    ...line2,
    fontSize: "clamp(20px, 2.4vw, 30px)",
    lineHeight: 1.2,
    letterSpacing: "-0.012em",
    margin: "20px 0 0",
    color: "var(--ink-tertiary)",
  };

  return (
    <>
      <div style={{ padding: `0 ${SECTION_PAD}` }}>
        <div className="rule-engraved"><span /></div>
      </div>
      <section style={sectionStyle}>
        <FolioStamp section="i" label="The Spine" total="06" />
        <div style={{ maxWidth: 880, marginTop: 40 }}>
          <p style={line1}>
            Close deals faster<span style={{ color: "var(--terra)" }}>.</span>
          </p>
          <p style={line2}>
            The AI deal team that compresses weeks into hours
            <span style={{ color: "var(--terra)" }}>.</span>
          </p>
          <p style={line3}>
            Built for M&amp;A professionals who do deals for a living
            <span style={{ color: "var(--terra)" }}>.</span>
          </p>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────── What Yulia does ─────────────────────── */
function WhatYuliaDoes() {
  const sectionStyle: CSSProperties = { padding: `80px ${SECTION_PAD}` };
  const h2: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(36px, 4.8vw, 68px)",
    lineHeight: 0.98,
    letterSpacing: "-0.032em",
    margin: "32px 0 24px",
    textWrap: "balance",
    maxWidth: 980,
  };
  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  return (
    <section style={sectionStyle}>
      <FolioStamp section="ii" label="What Yulia does" total="06" />
      <h2 style={h2}>
        Weeks of work. <span style={italic}>Compressed to a workday.</span>
      </h2>

      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 40, marginBottom: 56 }}>
        <p className="body" style={{ fontSize: 16, margin: 0, maxWidth: 600 }}>
          Four things Yulia does that change how fast you close — and how
          confident you are when you do.
        </p>
        <p className="marginalia" style={{ margin: 0 }}>
          Each capability is a real product surface. Click through to{" "}
          <em>/how-it-works</em> for the worked example.
        </p>
      </div>

      {/* 01 — full row + CIM artifact */}
      <CapRow
        n="01"
        kicker="THE BOOK"
        time="under an hour"
        title={
          <>
            The 100-page sell-side book.
            <br />
            <span style={italic}>First draft before your second coffee.</span>
          </>
        }
        body="The marketing document every serious deal needs — the one your analyst spends three months building — Yulia delivers as a complete first draft in under an hour. Sourced to the seller's financials. Branded to your firm. Structured for the buyer your seller wants. Ready for your red pen."
        meta="The same quality a PE buyer expects. The same morning the engagement letter is signed."
        artifact={<CIMArtifact />}
      />

      {/* 02 + 03 — two-up */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          padding: "60px 0",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          marginTop: 60,
        }}
      >
        <CapCompact
          n="02"
          kicker="THE NUMBERS"
          time="while you read this"
          title="Three years of financials. Normalized."
          body={
            <>
              Owner compensation normalized against benchmarks. Add-backs defended
              against the tax returns. Working capital pegged where a buyer&apos;s
              accountant won&apos;t argue. Customer concentration flagged. The
              diligence you&apos;d pay a firm $25,000 to run — done before you sign
              anything. We call this <strong>Blind Equity™</strong> — the value
              hiding in the financials that an unprepared seller leaves behind.
            </>
          }
          meta="Decision-grade numbers. On a Tuesday."
        />
        <CapCompact
          n="03"
          kicker="THE BUYER LIST"
          time="2.5× pursuit-rate"
          title="The buyer list that actually responds."
          body="Strategic acquirers. Financial buyers. Platform plays. Pulled from current public filings, recent transactions, and live activity — not a database that goes stale between renewals. Scored against the seller's profile so the outreach that goes out has a response rate. Axial data shows a 21% pursuit-rate beats the 8% platform average by more than 2.5×."
          meta="Better than the subscription you're paying for one."
        />
      </div>

      {/* 04 — full row + SOP artifact */}
      <div
        className="grid items-center"
        style={{ paddingTop: 60, gridTemplateColumns: "1fr 1.3fr", gap: 48 }}
      >
        <div>
          <span
            className="figs-tab"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 72,
              color: "var(--ink-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "block",
              marginBottom: 12,
            }}
          >
            04
          </span>
          <div className="eyebrow" style={{ marginBottom: 10 }}>THE STRUCTURE</div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(26px, 2.8vw, 36px)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
              textWrap: "balance",
            }}
          >
            The structure that <span style={italic}>actually closes.</span>
          </h3>
          <p className="body" style={{ fontSize: 15, marginBottom: 16 }}>
            SBA SOP 50 10 8 modeling that accounts for the June 2025 rule
            changes. Seller-note terms that lenders approve. Earnout, R&amp;W
            insurance, and rollover structures that survive due diligence.
            The work that makes the difference between a handshake and a wire.
          </p>
          <p className="eyebrow" style={{ color: "var(--ink-tertiary)" }}>
            Built for closing. Not for paperwork.
          </p>
        </div>
        <SOPArtifact />
      </div>
    </section>
  );
}

/* ─────────────────────── Consolidation ─────────────────────── */
function Consolidation() {
  const sectionStyle: CSSProperties = {
    padding: `88px ${SECTION_PAD}`,
    background: "var(--canvas-cream)",
    borderTop: "1px solid var(--rule)",
    borderBottom: "1px solid var(--rule)",
  };
  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  const cellLabels = ["Pipeline", "Research", "Data room", "Market data", "Documents", "Analysis"];

  return (
    <section style={sectionStyle}>
      <FolioStamp section="iii" label="The consolidation" total="06" />
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(30px, 3.8vw, 52px)",
        lineHeight: 1.04,
        letterSpacing: "-0.026em",
        margin: "32px 0 24px",
        textWrap: "balance",
        maxWidth: 980,
      }}>
        The tools you already pay for give you raw material.{" "}
        <span style={italic}>Yulia delivers the finished work.</span>
      </h2>
      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
        <p className="body" style={{ fontSize: 16, margin: 0, maxWidth: 700 }}>
          Pipeline software gathers. Research databases catalog. Document
          vaults store. Yulia takes that raw material and produces the actual
          deliverables — CIMs, buyer lists, IC memos, structure models, status
          reports — that your deal needs to move forward.
        </p>
        <p className="marginalia" style={{ margin: 0 }}>
          ONE SUBSCRIPTION. Everything that moves the deal.
        </p>
      </div>

      <div
        className="grid"
        style={{
          marginTop: 48,
          gridTemplateColumns: "repeat(6, 1fr)",
          borderTop: "1px solid var(--ink-primary)",
          marginBottom: 32,
        }}
      >
        {cellLabels.map((label, i) => (
          <div
            key={label}
            style={{
              padding: "32px 12px",
              borderRight: "1px solid var(--rule)",
              borderLeft: i === 0 ? "1px solid var(--rule)" : "none",
              borderBottom: "1px solid var(--rule)",
              textAlign: "center",
            }}
          >
            <div
              className="figs-tab"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--ink-quaternary)",
                letterSpacing: "0.18em",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              cap. {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 14.5,
              letterSpacing: "-0.012em",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <p style={{
        fontFamily: "var(--font-editorial)",
        fontStyle: "italic",
        fontSize: 20,
        color: "var(--ink-secondary)",
        margin: 0,
        maxWidth: 800,
        textWrap: "balance",
      }}>
        Twelve integrated capabilities. One workspace. The integration is the moat.
      </p>
    </section>
  );
}

/* ─────────────────────── Arc ─────────────────────── */
function Arc() {
  const sectionStyle: CSSProperties = { padding: `80px ${SECTION_PAD}` };
  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  const stages: [string, string][] = [
    ["Find",      "Sourcing, screening, evaluating opportunities."],
    ["Prepare",   "Documents, financials, buyer lists, investor memos."],
    ["Transact",  "Offers, counter-offers, diligence, closing."],
    ["Integrate", "Day-one planning, 100-day execution, value creation."],
  ];

  return (
    <section style={sectionStyle}>
      <FolioStamp section="iv" label="The whole arc" total="06" />
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(30px, 3.8vw, 52px)",
        lineHeight: 1.04,
        letterSpacing: "-0.026em",
        margin: "32px 0 24px",
        textWrap: "balance",
        maxWidth: 980,
      }}>
        From the first conversation <span style={italic}>to a year after close.</span>
      </h2>
      <p className="body" style={{ fontSize: 16, margin: "0 0 48px", maxWidth: 700 }}>
        Every deal follows the same arc. Find the opportunity. Prepare it.
        Take it to market. Negotiate. Close. Build value after. Yulia runs the
        arc — and stays with you when the next deal starts.
      </p>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "2px solid var(--ink-primary)",
        }}
      >
        {stages.map(([title, body], i) => (
          <div
            key={title}
            style={{
              padding: "24px 22px 32px",
              borderRight: i < 3 ? "1px solid var(--rule)" : "none",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div className="eyebrow figs-tab" style={{ marginBottom: 12, color: "var(--ink-tertiary)" }}>
              Stage 0{i + 1}
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "-0.024em",
              lineHeight: 1,
              marginBottom: 12,
            }}>
              {title}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-secondary)" }}>
              {body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── Pricing ─────────────────────── */
function Pricing() {
  const sectionStyle: CSSProperties = {
    padding: `88px ${SECTION_PAD}`,
    background: "var(--canvas-cream)",
    borderTop: "1px solid var(--rule)",
    borderBottom: "1px solid var(--rule)",
  };
  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  const tiers = [
    { tier: "Free",       price: "$0",        built: "Meet Yulia",      elevated: false },
    { tier: "Starter",    price: "$49 / mo",  built: "Solo operators",  elevated: false },
    { tier: "Pro",        price: "$149 / mo", built: "Practitioners",   elevated: true  },
    { tier: "Team",       price: "$999 / mo", built: "Small firms",     elevated: false },
    { tier: "Enterprise", price: "Contact",   built: "Custom",          elevated: false },
  ];

  return (
    <section style={sectionStyle}>
      <FolioStamp section="v" label="Pricing" total="06" />
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(30px, 3.8vw, 52px)",
        lineHeight: 1.04,
        letterSpacing: "-0.026em",
        margin: "32px 0 24px",
        textWrap: "balance",
        maxWidth: 980,
      }}>
        Four tiers. <span style={italic}>Built for how you work.</span>
      </h2>
      <p className="body" style={{ fontSize: 16, margin: "0 0 40px", maxWidth: 700 }}>
        Every paid tier delivers every capability. You pay more for volume,
        seats, and enterprise infrastructure — never for Yulia&apos;s work itself.
        No success fees, ever.
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
          borderTop: "2px solid var(--ink-primary)",
        }}
      >
        {tiers.map((t, i) => (
          <div
            key={t.tier}
            style={{
              padding: "24px 18px 28px",
              borderRight: i < tiers.length - 1 ? "1px solid var(--rule)" : "none",
              borderBottom: "1px solid var(--rule)",
              background: t.elevated ? "var(--canvas-paper)" : "transparent",
              position: "relative",
            }}
          >
            {t.elevated && (
              <div style={{
                position: "absolute",
                top: -2, left: 0, right: 0, height: 2,
                background: "var(--terra)",
              }} />
            )}
            <div className="eyebrow" style={{ marginBottom: 12, color: t.elevated ? "var(--terra)" : "var(--ink-tertiary)" }}>
              {t.tier}
            </div>
            <div className="figs-tab" style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.022em",
              lineHeight: 1,
              marginBottom: 10,
            }}>
              {t.price}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-secondary)" }}>
              {t.built}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── Testimonial ─────────────────────── */
function Testimonial() {
  const sectionStyle: CSSProperties = { padding: `88px ${SECTION_PAD}` };

  return (
    <section style={sectionStyle}>
      <FolioStamp section="vi" label="From the floor" total="06" />
      <div style={{ maxWidth: 880, marginTop: 40 }}>
        <blockquote style={{
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(26px, 3.4vw, 44px)",
          lineHeight: 1.14,
          letterSpacing: "-0.016em",
          margin: 0,
          textWrap: "balance",
          color: "var(--ink-primary)",
          hangingPunctuation: "first last",
        }}>
          &ldquo;I used to lose a weekend to every new opportunity. Yulia reads
          the document in ninety seconds and tells me whether it&apos;s worth my
          Tuesday.&rdquo;
        </blockquote>
        <div className="flex" style={{
          marginTop: 36,
          paddingTop: 20,
          borderTop: "1px solid var(--ink-primary)",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14.5,
              letterSpacing: "-0.012em",
            }}>
              Renée Carver
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>
              CARVER &amp; ASSOCIATES · NASHVILLE
            </div>
          </div>
          <div className="text-right">
            <div className="eyebrow">M&amp;A ADVISOR · 14 YRS</div>
            <div style={{
              marginTop: 4,
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: 11.5,
              color: "var(--ink-tertiary)",
            }}>
              Drawn from active beta interviews
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Closer ─────────────────────── */
function Closer({
  onFocusChat,
  onGoHowItWorks,
}: Pick<MarketingHomeProps, "onFocusChat" | "onGoHowItWorks">) {
  const sectionStyle: CSSProperties = {
    padding: `88px ${SECTION_PAD}`,
    background: "linear-gradient(180deg, #1F1B14 0%, #16130E 100%)",
    color: "var(--ink-inverse)",
  };
  const italic: CSSProperties = {
    fontFamily: "var(--font-editorial)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  return (
    <section style={sectionStyle}>
      <div className="flex items-center" style={{
        gap: 12,
        paddingBottom: 22,
        marginBottom: 32,
        borderBottom: "1px solid rgba(244, 238, 227, 0.18)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(244, 238, 227, 0.55)",
        }}>
          End of filing
        </span>
        <span style={{ flex: 1, height: 1, background: "rgba(244, 238, 227, 0.18)" }} />
        <span className="figs-tab" style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(244, 238, 227, 0.55)",
        }}>
          p. 24 / 24
        </span>
      </div>

      <h2 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(56px, 7.6vw, 116px)",
        lineHeight: 0.9,
        letterSpacing: "-0.042em",
        margin: 0,
        textWrap: "balance",
      }}>
        She&apos;s <span style={italic}>already</span>
        <br />
        waiting<span style={{ color: "var(--terra-on-dark)" }}>.</span>
      </h2>

      <div
        className="grid items-end"
        style={{
          marginTop: 48,
          gridTemplateColumns: "1.5fr 1fr",
          gap: 48,
        }}
      >
        <p style={{
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.4,
          color: "rgba(244, 238, 227, 0.78)",
          maxWidth: 600,
          margin: 0,
        }}>
          Yulia is live in the chat on your left — the same Yulia that runs in
          every paid workspace. Ask her anything. Paste a document. Describe a
          deal. See what she produces.
        </p>
        <div className="text-right">
          <button
            onClick={onFocusChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 22px",
              background: "rgba(244, 238, 227, 0.06)",
              border: "1px solid rgba(244, 238, 227, 0.20)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(244, 238, 227, 0.85)",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--terra-on-dark)" }}>↙</span>
            Compose down there
          </button>
          <div style={{ marginTop: 14 }}>
            <a
              onClick={onGoHowItWorks}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(244, 238, 227, 0.55)",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Or see how Yulia works →
            </a>
          </div>
        </div>
      </div>

      <div className="flex" style={{
        marginTop: 64,
        paddingTop: 20,
        borderTop: "1px solid rgba(244, 238, 227, 0.18)",
        justifyContent: "space-between",
        flexWrap: "wrap",
        color: "rgba(244, 238, 227, 0.5)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}>
        <span>smbx · the edition · vol. iv</span>
        <span>filed apr 2026</span>
        <span>free · $49 · $149 · $999</span>
      </div>
    </section>
  );
}
