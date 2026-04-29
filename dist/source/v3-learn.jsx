/* V3 — LearnDoc: combined How it works + Pricing document.
   Institutional, document-style. Uses V3's design language exactly:
   §-numbered sections, mono microcopy, accent-soft callouts, tabular numbers.
   Copy from V21. */

function LearnDoc() {
  return (
    <div style={vL.docInner}>
      {/* ── Title block ─────────────────────────────────────────── */}
      <div style={vL.titleBlock}>
        <div className="eyebrow" style={{ fontSize: 9.5 }}>
          DOCUMENT · HOW IT WORKS &amp; PRICING · v0.4.2
        </div>
        <h1 style={vL.title}>
          The pattern.<br/>
          <span style={vL.titleEm}>The price.</span>
        </h1>
        <p style={vL.lede}>
          Yulia is the deal team you hire. She does the work. You make every call that matters. That restraint is the product. <span style={{ color: "var(--ink-3)" }}>This document explains how — and what it costs.</span>
        </p>
        <div style={vL.titleMeta}>
          <span className="mono" style={vL.metaTag}>7 sections</span>
          <span className="mono" style={vL.metaTag}>~6 min read</span>
          <span className="mono" style={vL.metaTag}>updated apr 2026</span>
        </div>
      </div>

      {/* ── §01 The Pattern ──────────────────────────────────────── */}
      <LSec n="01" title="The pattern · analysis → options → implications → you decide">
        <div style={vL.fourGrid}>
          <PatternCell
            n="01"
            head="Analysis."
            body="Yulia reads the documents. Runs the numbers. Pulls the comps. Sources the data."
          />
          <PatternCell
            n="02"
            head="Options."
            body="Three or four paths. Not one recommendation. Each is a real option, not a strawman."
          />
          <PatternCell
            n="03"
            head="Implications."
            body="Price. Structure. Timing. Tax. Close certainty. Post-close role."
          />
          <PatternCell
            n="04"
            head="You decide."
            body="Every time. Yulia drafts the message. You send it."
            accent
          />
        </div>
      </LSec>

      {/* ── §02 The Restraint ────────────────────────────────────── */}
      <LSec n="02" title="What Yulia will never do · five restraints">
        <div style={vL.restraintList}>
          {[
            ["She will not negotiate on your behalf.", "She drafts the counter, flags the walk-away, explains the leverage. You send the email."],
            ["She will not hold funds.", "Escrow runs through your attorney — never through smbX."],
            ["She will not charge a success fee.", "The subscription is the entire cost. Closed deal or broken."],
            ["She will not represent you as a fiduciary.", "smbX is software. Yulia is a tool — not your agent."],
            ["She will not guarantee an outcome.", "Ranges with methodology. Every time."],
          ].map(([head, body], i) => (
            <div key={i} style={vL.restraintRow}>
              <span className="mono" style={vL.restraintN}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ flex: 1 }}>
                <div style={vL.restraintHead}>{head}</div>
                <div style={vL.restraintBody}>{body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={vL.callout}>
          <span className="eyebrow eyebrow-accent" style={{ fontSize: 9 }}>WHY THE RESTRAINT IS THE POSITIONING</span>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.6 }}>
            Every other AI deal tool lives inside a regulated firm. Banks. Law firms. PE funds. smbX doesn't sit inside that relationship — that's what lets a principal use Yulia directly without triggering broker-dealer regulation, and what lets an advisor use her inside their firm without competing with her. <em style={{ color: "var(--ink-3)" }}>The software side of the line is a structural advantage, not a limitation.</em>
          </div>
        </div>
      </LSec>

      {/* ── §03 A Real Redacted Example ──────────────────────────── */}
      <LSec n="03" title="A real interaction · names changed, numbers preserved">
        <ExampleAct
          n="01"
          tag="THE QUESTION"
          ctx="Industrial services platform · $28M revenue · $5.4M EBITDA · multi-state · founder age 61"
        >
          <div style={vL.quote}>
            "What's it worth, and what's the right way to take it to market?"
          </div>
        </ExampleAct>

        <ExampleAct
          n="02"
          tag="YULIA'S ANALYSIS"
        >
          <div style={vL.exampleLead}>
            EBITDA of $5.4M after normalizing $340K of owner-related compensation and defending $620K of run-rate add-backs against three years of tax returns and customer contracts.
          </div>

          <div style={vL.optionsGrid}>
            <OptionCard
              n="01"
              mult="5.5×"
              timeline="4–6 mo"
              title="Limited financial-buyer process"
              detail="~85% cash at close. Two-year transition. Founder-friendly buyer profile."
            />
            <OptionCard
              n="02"
              mult="6.8×"
              timeline="6–9 mo"
              title="Broader process to PE platform buyers"
              detail="75% cash + 25% rollover equity. Earnout on revenue retention. Founder steps to chair."
              chosen
            />
            <OptionCard
              n="03"
              mult="7.5×"
              timeline="8–14 mo"
              title="Strategic-buyer process · adjacent geos"
              detail="Mixed stock and cash. Longest timeline. Highest terminal value. Two-year operating commitment."
            />
          </div>

          <div style={vL.implTable}>
            <div style={vL.implHead}>
              <span className="eyebrow" style={{ fontSize: 9 }}>IMPLICATIONS</span>
              <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>4 cols × 3 rows</span>
            </div>
            <div style={{ ...vL.implRow, ...vL.implRowHead }}>
              <span></span>
              <span>Tax</span>
              <span>Close certainty</span>
              <span>Your role</span>
              <span>Timeline</span>
            </div>
            {[
              ["01", "Mostly capital", "High", "Two-year transition", "4–6 mo"],
              ["02", "Capital + rollover deferred", "High", "Chair, then exit", "6–9 mo", true],
              ["03", "Stock + capital", "Medium", "Two-year operating commit", "8–14 mo"],
            ].map(([n, tax, cert, role, tl, chosen], i) => (
              <div key={i} style={{
                ...vL.implRow,
                background: chosen ? "var(--accent-soft)" : "transparent",
                color: chosen ? "var(--accent)" : "var(--ink-2)",
                fontWeight: chosen ? 600 : 400,
              }}>
                <span className="mono" style={{ color: chosen ? "var(--accent)" : "var(--ink-4)" }}>OPT {n}</span>
                <span>{tax}</span>
                <span>{cert}</span>
                <span>{role}</span>
                <span className="mono">{tl}</span>
              </div>
            ))}
          </div>
        </ExampleAct>

        <ExampleAct
          n="03"
          tag="THE DECISION"
        >
          <div style={vL.decisionLine}>
            <span style={vL.decisionLabel}>Founder chose</span>
            <span style={vL.decisionPick}>Option 2<span style={{ color: "var(--accent)" }}>.</span></span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginTop: 8 }}>
            Yulia drafted the engagement letter to the founder's chosen advisor and the kickoff CIM outline. The founder reviewed, adjusted the rollover percentage, and authorized the advisor to begin marketing.
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic", marginTop: 10 }}>
            The decision was the user's. Yulia's job was finished when the options were clear.
          </div>
        </ExampleAct>
      </LSec>

      {/* ── §04 The Integration Moat ─────────────────────────────── */}
      <LSec n="04" title="The integration moat · why this isn't a ChatGPT wrapper">
        <p style={vL.body}>
          A practitioner can replicate any single capability on this list with ChatGPT and a weekend. The CIM. The buyer list. The QoE Lite. The structure model. <span style={{ color: "var(--ink-3)" }}>Each one, on its own, is a prompt and a Friday.</span>
        </p>
        <p style={vL.body}>
          What you can't replicate in a weekend is the integration. The <strong style={{ color: "var(--ink)" }}>22-gate methodology</strong> that decides which capability runs when. The <strong style={{ color: "var(--ink)" }}>28 document generators</strong> that share a single sourced-financials backbone so the CIM, the model, and the LOI all match. The <strong style={{ color: "var(--ink)" }}>deal room</strong> that classifies what you upload and surfaces the right capability for the right gate. The <strong style={{ color: "var(--ink)" }}>sourcing pipeline</strong> that feeds the screening engine that feeds the CIM workflow that feeds the buyer-list engine. The <strong style={{ color: "var(--ink)" }}>post-close PMI plan</strong> that knows what was promised in diligence.
        </p>
        <div style={vL.moatStrip}>
          <MoatChip n="22" label="gate methodology" />
          <MoatChip n="28" label="document generators" />
          <MoatChip n="12" label="capabilities" />
          <MoatChip n="01" label="workspace" />
          <MoatChip n="~2yr" label="of integration" accent />
        </div>
        <p style={{ ...vL.body, fontStyle: "italic", color: "var(--ink-2)", marginBottom: 0 }}>
          The capabilities are the surface. The integration is the moat.
        </p>
      </LSec>

      {/* ── §05 Glossary ────────────────────────────────────────── */}
      <LSec n="05" title="The language · three terms in every Yulia deliverable">
        <div style={vL.glossGrid}>
          <GlossCard
            term="The Baseline™"
            body="A multi-scenario valuation with implications. Three or four paths — each with price, structure, timing, tax, and close certainty defended against the seller's financials and the current market. Not a recommendation. A starting point for the conversation that decides the deal."
          />
          <GlossCard
            term="Blind Equity™"
            body="The value hiding in financials that an unprepared seller leaves behind. Owner-comp normalization. Defended add-backs. Working-capital pegging. Customer-concentration scoring. The QoE-style work that sets the floor on the seller's price."
          />
          <GlossCard
            term="The Rundown™"
            body="The complete deal intelligence package — CIM, teaser, buyer list, structure model, methodology — branded to your firm. Generated in hours, ready for your red pen, defensible against any sophisticated buyer's diligence."
          />
        </div>
      </LSec>

      {/* ── §06 Pricing — divider ────────────────────────────────── */}
      <div style={vL.partBreak}>
        <span style={vL.partRule} />
        <span className="eyebrow" style={{ fontSize: 9.5, color: "var(--accent)" }}>PART II · PRICING</span>
        <span style={vL.partRule} />
      </div>

      <LSec n="06" title="Four tiers + enterprise · priced so you don't have to think about it">
        <p style={{ ...vL.body, marginBottom: 18 }}>
          Every paid tier delivers every capability Yulia offers. You pay for volume, seats, and enterprise infrastructure — never for Yulia's work itself. <strong style={{ color: "var(--ink)" }}>No success fees. Ever.</strong>
        </p>

        {/* Pricing strip — 5 cards */}
        <div style={vL.priceGrid}>
          <PriceCard tier="Free"     price="$0"          built="Anyone"           seats="1" deals="1" deliv="1 (ever)" />
          <PriceCard tier="Starter"  price="$49"  cad="/mo" built="Solo operators"   seats="1" deals="1" deliv="Unlimited" />
          <PriceCard tier="Pro"      price="$149" cad="/mo" built="Practitioners"    seats="1" deals="Unlimited" deliv="Unlimited" featured />
          <PriceCard tier="Team"     price="$999" cad="/mo" built="Small firms"      seats="up to 5" deals="Unlimited" deliv="Unlimited" />
          <PriceCard tier="Enterprise" price="Contact" cad="sales" built="Custom"     seats="Custom" deals="Unlimited" deliv="Unlimited" muted />
        </div>

        {/* Feature matrix */}
        <div style={vL.matrix}>
          <div style={{ ...vL.matrixRow, ...vL.matrixHead }}>
            <span></span>
            <span>Free</span>
            <span>Starter</span>
            <span style={{ color: "var(--accent)" }}>Pro</span>
            <span>Team</span>
            <span>Enterprise</span>
          </div>
          {[
            ["Document generators (28)",       1, 1, 1, 1, 1],
            ["Financial analysis + QoE Lite",  1, 1, 1, 1, 1],
            ["Buyer-list engine",              1, 1, 1, 1, 1],
            ["SBA + structure modeling",       1, 1, 1, 1, 1],
            ["Deal room + diligence tracking", 1, 1, 1, 1, 1],
            ["Market data + comps",            1, 1, 1, 1, 1],
            ["Post-close / PMI",               0, 1, 1, 1, 1],
            ["Team workspace + shared vault",  0, 0, 0, 1, 1],
            ["SSO · single-tenant · SOC 2",    0, 0, 0, 0, 1],
            ["Named account manager + SLA",    0, 0, 0, 0, 1],
            ["API access",                     0, 0, 0, 0, 1],
          ].map(([label, ...cols], i) => (
            <div key={i} style={vL.matrixRow}>
              <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{label}</span>
              {cols.map((v, j) => (
                <span key={j} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: v ? (j === 2 ? "var(--accent)" : "var(--ink-2)") : "var(--ink-4)",
                }}>
                  {v ? "✓" : "—"}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* The rules */}
        <div style={vL.rulesBox}>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>THE RULES</div>
          {[
            "Every paid tier delivers every core capability. No hero feature is ever gated.",
            "No success fees. Ever. Subscription only.",
            "Post-close support included in every paid tier. 180 days of PMI; subscription continues as long as you do.",
            "14-day opt-out trial on every paid tier. 30-day free trial of Pro. Cancel anytime.",
            "One-time $99 credit pack for a second deliverable without committing to Starter.",
            "No annual pricing at launch. Month-to-month only.",
          ].map((r, i) => (
            <div key={i} style={vL.ruleRow}>
              <span style={vL.ruleDot} />
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{r}</span>
            </div>
          ))}
        </div>
      </LSec>

      {/* ── §07 FAQ ─────────────────────────────────────────────── */}
      <LSec n="07" title="Frequently asked">
        {[
          ["What does Free include?",
            "Unlimited chat with Yulia plus one deliverable — ever — with email registration. No credit card. The deliverable cap is total, not monthly."],
          ["What counts as a \"deliverable\"?",
            "Any finished document Yulia produces — valuation, CIM draft, screening memo, LOI, LP update, 100-day plan."],
          ["Why no success fees?",
            "Two reasons. First, smbX sits on the software side of SEC Rule 15(b)(13) — charging a success fee would move us across that line. Second, success fees change what the product is. Subscription only. Forever."],
          ["Why is Pro $149 but Team $999?",
            "Pro is for one person working alone. Team is for a 2–5 person firm where Yulia becomes a shared resource — shared workspace, shared deal vault, shared templates. Same product, more seats, more shared infrastructure."],
          ["What if I need six seats or more?",
            "Enterprise. Quoted against your team — seat count, deployment model, compliance needs, SOC 2 / SSO requirements. Talk to sales."],
          ["Do you have a separate tier for advisors or brokers?",
            "No. A solo broker uses Starter or Pro. A 3-person boutique uses Team. A 15-person firm uses Enterprise. Same product, different configuration."],
          ["What happens after I close a deal?",
            "Your subscription continues at your current tier. 180 days of post-close PMI included. Many users stay on permanently — Yulia is where the next deal starts."],
          ["Annual discount?",
            "Not at launch. Introduced later at 16% off once retention data supports it."],
        ].map(([q, a], i) => (
          <FaqRow key={i} q={q} a={a} idx={i} />
        ))}
      </LSec>

      {/* Final CTA */}
      <div style={vL.endCta}>
        <div>
          <div className="eyebrow eyebrow-accent" style={{ fontSize: 9.5 }}>READY?</div>
          <div style={vL.endCtaTitle}>Start free. No credit card.</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>
            Yulia is in the chat on your left. Same Yulia that runs in every paid workspace.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 12.5 }}>Talk to sales</button>
          <button className="btn btn-accent" style={{ padding: "8px 14px", fontSize: 12.5 }}>
            Start free
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper, mirrors DealCanvas's <Sec> ───────────────────────
function LSec({ n, title, children }) {
  return (
    <section style={vL.sec}>
      <div style={vL.secHead}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.1em" }}>§{n}</span>
          <h3 className="eyebrow" style={{ fontSize: 11, color: "var(--ink)", margin: 0, letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

// ── Small components ─────────────────────────────────────────────────
function PatternCell({ n, head, body, accent }) {
  return (
    <div style={{
      ...vL.patternCell,
      ...(accent ? vL.patternCellAccent : null),
    }}>
      <span className="mono" style={{
        fontSize: 10.5,
        color: accent ? "var(--accent)" : "var(--ink-4)",
        letterSpacing: "0.1em",
      }}>{n}</span>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 17,
        letterSpacing: "-0.02em",
        marginTop: 8,
        color: accent ? "var(--accent)" : "var(--ink)",
      }}>{head}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)", marginTop: 6 }}>
        {body}
      </div>
    </div>
  );
}

function ExampleAct({ n, tag, ctx, children }) {
  return (
    <div style={vL.act}>
      <div style={vL.actHead}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--accent)", letterSpacing: "0.1em" }}>ACT {n}</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span className="eyebrow" style={{ fontSize: 9.5, color: "var(--ink-2)" }}>{tag}</span>
      </div>
      {ctx && (
        <div style={vL.actCtx}>{ctx}</div>
      )}
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

function OptionCard({ n, mult, timeline, title, detail, chosen }) {
  return (
    <div style={{ ...vL.optCard, ...(chosen ? vL.optCardChosen : null) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="mono" style={{
          fontSize: 10, color: chosen ? "var(--accent)" : "var(--ink-4)",
          letterSpacing: "0.1em",
        }}>OPT {n}</span>
        {chosen && <span className="eyebrow eyebrow-accent" style={{ fontSize: 9 }}>CHOSEN</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span className="mono" style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22,
          letterSpacing: "-0.02em",
          color: chosen ? "var(--accent)" : "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}>{mult}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· {timeline}</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", marginTop: 10, lineHeight: 1.4 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function MoatChip({ n, label, accent }) {
  return (
    <div style={vL.moatChip}>
      <span className="mono" style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 18,
        letterSpacing: "-0.02em",
        color: accent ? "var(--accent)" : "var(--ink)",
        fontVariantNumeric: "tabular-nums",
      }}>{n}</span>
      <span className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>{label}</span>
    </div>
  );
}

function GlossCard({ term, body }) {
  return (
    <div style={vL.glossCard}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 15,
        letterSpacing: "-0.01em",
        color: "var(--ink)",
        marginBottom: 8,
      }}>{term}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function PriceCard({ tier, price, cad, built, seats, deals, deliv, featured, muted }) {
  return (
    <div style={{
      ...vL.priceCard,
      ...(featured ? vL.priceCardFeatured : null),
      ...(muted ? vL.priceCardMuted : null),
    }}>
      {featured && (
        <div style={vL.priceFeaturedTag}>
          <span className="eyebrow" style={{ fontSize: 8.5, color: "#FFFFFF" }}>PRACTITIONERS' CHOICE</span>
        </div>
      )}
      <div className="eyebrow" style={{
        fontSize: 9.5,
        color: featured ? "var(--accent)" : "var(--ink-3)",
      }}>{tier}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: muted ? 18 : 26,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: featured ? "var(--accent)" : "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}>{price}</span>
        {cad && (
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{cad}</span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>{built}</div>
      <div style={vL.priceMeta}>
        <span className="mono" style={vL.priceMetaItem}>
          <span style={{ color: "var(--ink-4)" }}>seats</span>
          <span>{seats}</span>
        </span>
        <span className="mono" style={vL.priceMetaItem}>
          <span style={{ color: "var(--ink-4)" }}>deals</span>
          <span>{deals}</span>
        </span>
        <span className="mono" style={vL.priceMetaItem}>
          <span style={{ color: "var(--ink-4)" }}>deliverables</span>
          <span>{deliv}</span>
        </span>
      </div>
    </div>
  );
}

function FaqRow({ q, a, idx }) {
  const [open, setOpen] = React.useState(idx < 2);
  return (
    <div style={vL.faqRow}>
      <button onClick={() => setOpen(!open)} style={vL.faqBtn}>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginRight: 12 }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{q}</span>
        <span style={{
          color: "var(--ink-3)", fontSize: 11,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 180ms",
        }}>▾</span>
      </button>
      {open && (
        <div style={vL.faqAnswer}>{a}</div>
      )}
    </div>
  );
}

const vL = {
  docInner: { padding: "28px 36px 48px", maxWidth: 980, margin: "0 auto" },

  titleBlock: { paddingBottom: 22, borderBottom: "1px solid var(--line)" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 34, fontWeight: 600,
    letterSpacing: "-0.03em",
    margin: "8px 0 14px",
    color: "var(--ink)",
    lineHeight: 1.05,
  },
  titleEm: { color: "var(--accent)" },
  lede: {
    fontSize: 14.5, lineHeight: 1.6,
    color: "var(--ink)",
    margin: 0, maxWidth: 680,
    textWrap: "pretty",
  },
  titleMeta: {
    display: "flex", gap: 8, marginTop: 14,
  },
  metaTag: {
    fontSize: 9.5,
    padding: "3px 8px",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    borderRadius: 3,
    color: "var(--ink-3)",
    letterSpacing: "0.04em",
  },

  sec: { marginTop: 32 },
  secHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16, paddingBottom: 8,
    borderBottom: "1px solid var(--line)",
  },

  body: {
    fontSize: 13.5, lineHeight: 1.65,
    color: "var(--ink)",
    margin: "0 0 14px",
    textWrap: "pretty",
    maxWidth: 760,
  },

  // §01 pattern
  fourGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 1,
    background: "var(--line)",
    border: "1px solid var(--line)",
    borderRadius: 6, overflow: "hidden",
  },
  patternCell: {
    background: "var(--surface)",
    padding: "20px 18px",
  },
  patternCellAccent: {
    background: "linear-gradient(135deg, var(--accent-soft), transparent 80%), var(--surface)",
  },

  // §02 restraints
  restraintList: { display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" },
  restraintRow: {
    display: "flex", gap: 16,
    padding: "14px 16px",
    background: "var(--surface)",
  },
  restraintN: {
    fontSize: 10, color: "var(--ink-4)",
    letterSpacing: "0.1em",
    width: 22, flexShrink: 0,
    paddingTop: 3,
  },
  restraintHead: {
    fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
    letterSpacing: "-0.01em",
  },
  restraintBody: {
    fontSize: 12.5, color: "var(--ink-2)",
    lineHeight: 1.55, marginTop: 3,
  },
  callout: {
    marginTop: 14, padding: "12px 14px",
    background: "var(--accent-soft)",
    border: "1px solid var(--accent-ring)",
    borderRadius: 6,
  },

  // §03 example
  act: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    padding: "16px 18px",
    marginBottom: 12,
  },
  actHead: {
    display: "flex", alignItems: "center", gap: 8,
  },
  actCtx: {
    fontSize: 11.5, color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed var(--line-2)",
  },
  quote: {
    fontFamily: "var(--font-display)",
    fontSize: 17, fontWeight: 500,
    color: "var(--ink)",
    letterSpacing: "-0.01em",
    fontStyle: "italic",
    padding: "12px 16px",
    borderLeft: "3px solid var(--accent)",
    background: "var(--surface-2)",
    borderRadius: "0 6px 6px 0",
    lineHeight: 1.4,
  },
  exampleLead: {
    fontSize: 13.5, lineHeight: 1.6,
    color: "var(--ink)",
    paddingBottom: 12,
    borderBottom: "1px dashed var(--line-2)",
    marginBottom: 14,
  },
  optionsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  optCard: {
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 5,
    padding: "12px 12px 14px",
  },
  optCardChosen: {
    background: "linear-gradient(180deg, var(--accent-soft), transparent), var(--surface)",
    borderColor: "var(--accent-ring)",
    boxShadow: "0 0 0 1px var(--accent-ring)",
  },
  implTable: {
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 5,
    overflow: "hidden",
  },
  implHead: {
    padding: "8px 12px",
    borderBottom: "1px solid var(--line)",
    background: "var(--surface-2)",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  implRow: {
    display: "grid",
    gridTemplateColumns: "70px 1.4fr 1fr 1.4fr 0.7fr",
    gap: 12,
    padding: "9px 12px",
    fontSize: 11.5,
    borderTop: "1px solid var(--line)",
    fontVariantNumeric: "tabular-nums",
  },
  implRowHead: {
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    borderTop: "none",
    fontWeight: 500,
  },
  decisionLine: {
    display: "flex", alignItems: "baseline", gap: 14,
  },
  decisionLabel: {
    fontSize: 11.5, color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  decisionPick: {
    fontFamily: "var(--font-display)",
    fontWeight: 700, fontSize: 24,
    letterSpacing: "-0.025em",
    color: "var(--ink)",
  },

  // §04 moat
  moatStrip: {
    display: "flex", gap: 0,
    background: "var(--line)",
    border: "1px solid var(--line)",
    borderRadius: 5,
    margin: "16px 0",
    overflow: "hidden",
  },
  moatChip: {
    flex: 1,
    padding: "12px 14px",
    background: "var(--surface)",
    display: "flex", flexDirection: "column",
  },

  // §05 glossary
  glossGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  glossCard: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    padding: "16px 16px 18px",
  },

  // Pricing divider
  partBreak: {
    display: "flex", alignItems: "center", gap: 14,
    margin: "44px 0 8px",
  },
  partRule: {
    flex: 1, height: 1, background: "var(--accent-ring)",
  },

  // §06 pricing
  priceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
    gap: 8,
    marginBottom: 18,
    overflowX: "auto",
  },
  priceCard: {
    position: "relative",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    padding: "14px 14px 14px",
  },
  priceCardFeatured: {
    background: "linear-gradient(180deg, var(--accent-soft), transparent 70%), var(--surface)",
    borderColor: "var(--accent-ring)",
    boxShadow: "0 0 0 1px var(--accent-ring), 0 1px 6px rgba(19,138,90,0.08)",
  },
  priceCardMuted: {
    background: "var(--surface-2)",
    borderStyle: "dashed",
  },
  priceFeaturedTag: {
    position: "absolute", top: -10, left: 14,
    background: "var(--accent)",
    padding: "3px 8px",
    borderRadius: 3,
  },
  priceMeta: {
    marginTop: 12, paddingTop: 10,
    borderTop: "1px dashed var(--line-2)",
    display: "flex", flexDirection: "column", gap: 4,
    fontSize: 10.5,
  },
  priceMetaItem: {
    display: "flex", justifyContent: "space-between",
    color: "var(--ink-2)",
  },

  matrix: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    overflow: "auto",
    marginBottom: 18,
    minWidth: 0,
  },
  matrixRow: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 2.4fr) repeat(5, minmax(70px, 1fr))",
    gap: 0,
    padding: "8px 14px",
    borderBottom: "1px solid var(--line)",
    alignItems: "center",
    minWidth: 600,
  },
  matrixHead: {
    background: "var(--surface-2)",
    fontSize: 10.5,
    fontFamily: "var(--font-mono)",
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 500,
  },

  rulesBox: {
    background: "var(--surface-2)",
    border: "1px dashed var(--line-2)",
    borderRadius: 6,
    padding: "16px 18px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  ruleRow: {
    display: "flex", gap: 10, alignItems: "flex-start",
  },
  ruleDot: {
    width: 5, height: 5, borderRadius: 999,
    background: "var(--accent)",
    marginTop: 8, flexShrink: 0,
  },

  // §07 faq
  faqRow: {
    borderBottom: "1px solid var(--line)",
  },
  faqBtn: {
    all: "unset",
    display: "flex", alignItems: "center",
    width: "100%", boxSizing: "border-box",
    padding: "14px 4px",
    cursor: "pointer",
  },
  faqAnswer: {
    padding: "0 4px 14px 38px",
    fontSize: 12.5, lineHeight: 1.6,
    color: "var(--ink-2)",
    maxWidth: 760,
  },

  endCta: {
    marginTop: 36,
    padding: "20px 22px",
    background: "var(--ink)",
    color: "#FFFFFF",
    borderRadius: 8,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: 16,
  },
  endCtaTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 600, fontSize: 20,
    letterSpacing: "-0.02em",
    color: "#FFFFFF",
    marginTop: 6,
  },
};

Object.assign(window, { LearnDoc });
