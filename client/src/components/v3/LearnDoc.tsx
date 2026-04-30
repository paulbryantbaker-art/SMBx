/* V3 — LearnDoc: combined How it works + Pricing document.
   v0.5 copy — positive frame. The engine is the product.
   Section count: 6 (was 7). Restraints absorbed into FAQ row 08 +
   compliance footnote. Sections: §01 engine, §02 real interaction,
   §03 compounding, §04 language, §05 pricing, §06 faq.
   Port of handoff-how/how.jsx. */
import { useState, type CSSProperties, type ReactNode } from "react";

export function LearnDoc() {
  return (
    <div style={vL.docInner}>
      {/* ── Title block ─────────────────────────────────────────── */}
      <div style={vL.titleBlock}>
        <div className="eyebrow" style={{ fontSize: 9.5 }}>
          DOCUMENT · HOW IT WORKS &amp; PRICING · v0.5
        </div>
        <h1 style={vL.title}>
          The engine.<br/>
          <span style={vL.titleEm}>The price.</span>
        </h1>
        <p style={vL.lede}>
          Yulia is the deal team you hire. She does the analysis, draws the options, lays out the implications, and drafts the message. <span style={{ color: "var(--ink-3)" }}>You make every call that matters.</span> This document explains the engine — and what it costs.
        </p>
        <div style={vL.titleMeta}>
          <span className="mono" style={vL.metaTag}>6 sections</span>
          <span className="mono" style={vL.metaTag}>~5 min read</span>
          <span className="mono" style={vL.metaTag}>updated apr 2026</span>
        </div>
      </div>

      {/* ── §01 The four-step engine ─────────────────────────────── */}
      <LSec n="01" title="The four-step engine · how Yulia works through every deal" eyebrow="THE ENGINE">
        <p style={{ ...vL.intro, marginBottom: 18 }}>
          Every deal Yulia touches runs through the same four steps. The first three are her job. <strong style={{ color: "var(--ink)" }}>The fourth is yours</strong> — and that's where the deal is actually decided.
        </p>
        <div style={vL.fourGrid}>
          <PatternCell
            n="01"
            head="She analyzes."
            body="Reads the documents, runs the numbers, pulls the comps, sources the data. Work that used to take a junior banker a week, done before lunch."
          />
          <PatternCell
            n="02"
            head="She draws the options."
            body={'Three or four real paths, each structured, costed, and defended. No strawmen, no "here’s our recommendation" — real options laid out on the same axes so you can compare them directly.'}
          />
          <PatternCell
            n="03"
            head="She makes the implications clear."
            body="Six axes — price, structure, timing, tax, close certainty, post-close role — in a single matrix, so you see the whole tradeoff in one frame instead of three meetings."
          />
          <PatternCell
            n="04"
            head="You decide."
            body="Every time. You pick the path, Yulia drafts the message, you send it. The judgment that wins deals stays with you."
            accent
          />
        </div>
        <div style={vL.engineCloser}>
          <span style={vL.engineRule} />
          <em style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            The fourth step is the product. The first three are how she earns it.
          </em>
          <span style={vL.engineRule} />
        </div>
      </LSec>

      {/* ── §02 A real interaction (promoted up) ─────────────────── */}
      <LSec n="02" title="A real interaction · names changed, numbers preserved" eyebrow="A REAL INTERACTION">
        <p style={{ ...vL.intro, marginBottom: 14 }}>
          The four steps in motion: a founder asks a question, Yulia draws three options, the founder picks one — <span style={{ color: "var(--ink-3)" }}>done in the time a typical advisor would still be scheduling the kickoff call.</span>
        </p>

        <ExampleAct
          n="01"
          tag="THE QUESTION"
          ctx="Industrial services platform · $28M revenue · $5.4M EBITDA · multi-state · founder age 61"
        >
          <div style={vL.quote}>
            “What’s it worth, and what’s the right way to take it to market?”
          </div>
        </ExampleAct>

        <ExampleAct n="02" tag="YULIA'S ANALYSIS">
          <div style={vL.exampleLead}>
            EBITDA of $5.4M after normalizing $340K of owner-related compensation and defending $620K of run-rate add-backs against three years of tax returns and customer contracts.
          </div>

          <div style={vL.optionsGrid}>
            <OptionCard n="01" mult="5.5×" timeline="4–6 mo" title="Limited financial-buyer process" detail="~85% cash at close. Two-year transition. Founder-friendly buyer profile." />
            <OptionCard n="02" mult="6.8×" timeline="6–9 mo" title="Broader process to PE platform buyers" detail="75% cash + 25% rollover equity. Earnout on revenue retention. Founder steps to chair." chosen />
            <OptionCard n="03" mult="7.5×" timeline="8–14 mo" title="Strategic-buyer process · adjacent geos" detail="Mixed stock and cash. Longest timeline. Highest terminal value. Two-year operating commitment." />
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
            {([
              ["01", "Mostly capital", "High", "Two-year transition", "4–6 mo", false],
              ["02", "Capital + rollover deferred", "High", "Chair, then exit", "6–9 mo", true],
              ["03", "Stock + capital", "Medium", "Two-year operating commit", "8–14 mo", false],
            ] as const).map(([n, tax, cert, role, tl, chosen], i) => (
              <div key={i} style={{
                ...vL.implRow,
                background: chosen ? "var(--go-soft)" : "transparent",
                color: chosen ? "var(--go)" : "var(--ink-2)",
                fontWeight: chosen ? 600 : 400,
              }}>
                <span className="mono" style={{ color: chosen ? "var(--go)" : "var(--ink-4)" }}>OPT {n}</span>
                <span>{tax}</span>
                <span>{cert}</span>
                <span>{role}</span>
                <span className="mono">{tl}</span>
              </div>
            ))}
          </div>
        </ExampleAct>

        <ExampleAct n="03" tag="THE DECISION">
          <div style={vL.decisionLine}>
            <span style={vL.decisionLabel}>Founder chose</span>
            <span style={vL.decisionPick}>Option 2<span style={{ color: "var(--go)" }}>.</span></span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginTop: 8 }}>
            Yulia drafted the engagement letter to the founder's chosen advisor and the kickoff CIM outline. The founder reviewed, adjusted the rollover percentage, and authorized the advisor to begin marketing.
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic", marginTop: 10 }}>
            The decision was the founder’s. The matrix was the deliverable.
          </div>
        </ExampleAct>
      </LSec>

      {/* ── §03 Why this gets faster (was: ChatGPT wrapper / moat) ── */}
      <LSec n="03" title="Why this gets faster the longer you use it" eyebrow="THE COMPOUNDING">
        <p style={vL.body}>
          <strong style={{ color: "var(--ink)" }}>Twelve capabilities live in one workspace, built on two years of integration engineering that compounds every time you run another deal.</strong>
        </p>
        <p style={vL.body}>
          Any single capability on this list — the CIM, the buyer list, the QoE Lite, the structure model — you could probably stitch together with ChatGPT and a weekend. <span style={{ color: "var(--ink-3)" }}>Once, for one deal.</span>
        </p>
        <p style={vL.body}>
          What you can’t stitch together in a weekend is the integration. A <strong style={{ color: "var(--ink)" }}>22-gate methodology</strong> decides which capability runs when. <strong style={{ color: "var(--ink)" }}>Twenty-eight document generators</strong> share a single sourced-financials backbone, so the CIM, the model, and the LOI all reference the same numbers. The <strong style={{ color: "var(--ink)" }}>deal room</strong> classifies what you upload and surfaces the right capability for the right gate. A <strong style={{ color: "var(--ink)" }}>sourcing pipeline</strong> feeds the screening engine that feeds the CIM workflow that feeds the buyer-list engine. And the <strong style={{ color: "var(--ink)" }}>post-close PMI plan</strong> already knows what was promised in diligence.
        </p>
        <p style={vL.body}>
          That’s the part that compounds. <span style={{ color: "var(--ink-3)" }}>Every deal you run teaches Yulia your firm’s house style, your buyer preferences, your structural defaults.</span> Your tenth CIM is sharper than your first. Your hundredth is faster. Two years of integration engineering goes to work, every time.
        </p>
        <div style={vL.moatStrip}>
          <MoatChip n="22" label="gate methodology" />
          <MoatChip n="28" label="document generators" />
          <MoatChip n="12" label="capabilities" />
          <MoatChip n="01" label="workspace" />
          <MoatChip n="~2yr" label="of integration engineering" accent />
        </div>
      </LSec>

      {/* ── §04 Glossary ────────────────────────────────────────── */}
      <LSec n="04" title="The language · three terms in every Yulia deliverable" eyebrow="THE LANGUAGE">
        <p style={{ ...vL.intro, marginBottom: 14 }}>
          Three terms you'll see in every Yulia deliverable. <span style={{ color: "var(--ink-3)" }}>Each one is a specific kind of work, named so you know exactly what you're getting.</span>
        </p>
        <div style={vL.glossGrid}>
          <GlossCard term="The Baseline™" body="A multi-scenario valuation with implications. Three or four paths — each with price, structure, timing, tax, and close certainty defended against the seller's financials and the current market. The starting point for the conversation that decides the deal." />
          <GlossCard term="Blind Equity™" body="The value hiding in financials that an unprepared seller leaves behind. Owner-comp normalization. Defended add-backs. Working-capital pegging. Customer-concentration scoring. The QoE-style work that sets the floor on the seller's price — and surfaces the upside no one was scoring." />
          <GlossCard term="The Rundown™" body="The complete deal intelligence package — CIM, teaser, buyer list, structure model, methodology — branded to your firm. Generated in hours, edited in red pen, sent to the buyer’s data room without rework." />
        </div>
      </LSec>

      {/* ── Pricing — divider ────────────────────────────────────── */}
      <div style={vL.partBreak}>
        <span style={vL.partRule} />
        <span className="eyebrow" style={{ fontSize: 9.5, color: "var(--go)" }}>PART II · PRICING</span>
        <span style={vL.partRule} />
      </div>

      <LSec n="05" title="Four tiers + enterprise · priced so you don't have to think about it" eyebrow="PRICING">
        <p style={{ ...vL.intro, marginBottom: 18 }}>
          Every paid tier delivers every capability Yulia offers. <strong style={{ color: "var(--ink)" }}>You pay for volume, seats, and enterprise infrastructure</strong> — never for Yulia's work itself.
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
            <span style={{ color: "var(--go)" }}>Pro</span>
            <span>Team</span>
            <span>Enterprise</span>
          </div>
          {([
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
          ] as const).map((row, i) => {
            const [label, ...cols] = row;
            return (
              <div key={i} style={vL.matrixRow}>
                <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{label}</span>
                {cols.map((v, j) => (
                  <span key={j} style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: v ? (j === 2 ? "var(--go)" : "var(--ink-2)") : "var(--ink-4)",
                  }}>
                    {v ? "✓" : "—"}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* The promises (positively framed; was "The rules") */}
        <div style={vL.rulesBox}>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>THE PROMISES</div>
          {([
            ["Every paid tier delivers every core capability.", "The same toolkit at $49 as at $999 — pay for volume, seats, and infrastructure, not for capabilities.", false],
            ["Subscription is the entire cost.", "Closed deal or broken.", false],
            ["Post-close support is included in every paid tier.", "180 days of PMI included; subscription continues as long as you do.", false],
            ["30-day free trial of Pro.", "14-day opt-out trial on every paid tier. Cancel anytime.", true],
            ["One-time $99 credit pack", "for a second deliverable when you’re not yet ready for Starter.", false],
            ["Month-to-month flexibility at launch.", "Annual discount lands once retention data earns it.", false],
          ] as const).map(([head, tail, accent], i) => (
            <div key={i} style={vL.ruleRow}>
              <span style={{ ...vL.ruleDot, ...(accent ? { background: "var(--go)", boxShadow: "0 0 0 3px var(--go-soft)" } : null) }} />
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
                <strong style={{ color: accent ? "var(--go)" : "var(--ink)" }}>{head}</strong>{" "}{tail}
              </span>
            </div>
          ))}
        </div>
      </LSec>

      {/* ── §06 FAQ ─────────────────────────────────────────────── */}
      <LSec n="06" title="Frequently asked" eyebrow="FAQ">
        {[
          ["What does Free include?",
            "Unlimited chat with Yulia plus one deliverable — ever — with email registration. No credit card. The deliverable cap is total, not monthly."],
          ["What counts as a \"deliverable\"?",
            "Any finished document Yulia produces — valuation, CIM draft, screening memo, LOI, LP update, 100-day plan."],
          ["Why is Pro $149 but Team $999?",
            "Pro is one person working alone. Team is a 2–5 person firm where Yulia becomes a shared resource — shared workspace, shared deal vault, shared templates. Same product, more seats, more shared infrastructure."],
          ["What if I need six seats or more?",
            "Enterprise. Quoted against your team — seat count, deployment model, compliance needs, SOC 2 / SSO requirements. Talk to sales."],
          ["Do you have a separate tier for advisors or brokers?",
            "No. A solo broker uses Starter or Pro. A 3-person boutique uses Team. A 15-person firm uses Enterprise. Same product, different configuration."],
          ["What happens after I close a deal?",
            "Your subscription continues at your current tier. 180 days of post-close PMI included. Many users stay on permanently — Yulia is where the next deal starts."],
          ["Annual discount?",
            "Not at launch. Introduced later at 16% off once retention data supports it."],
          ["What does Yulia handle, and what does my attorney still do?",
            "Yulia drafts every document on the deal — the LOI, the counter, the engagement letter, the closing checklist. Your attorney reviews, signs, and runs escrow. Yulia is the analyst pod and the document engine. Your attorney is the closer. The handoff is clean and the labor split is the same as it has always been — it's just that the analyst pod is on subscription."],
        ].map(([q, a], i) => (
          <FaqRow key={i} q={q} a={a} idx={i} />
        ))}
      </LSec>

      {/* Final CTA */}
      <div style={vL.endCta}>
        <div>
          <div className="eyebrow eyebrow-go" style={{ fontSize: 9.5 }}>READY?</div>
          <div style={vL.endCtaTitle}>Start free. No credit card.</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
            Yulia is in the chat on your left. Same Yulia that runs in every paid workspace.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 12.5 }}>Talk to sales</button>
          <button className="btn btn-cta" style={{ padding: "8px 14px", fontSize: 12.5 }}>
            Start free
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Compliance footnote — small, at the bottom */}
      <div style={vL.footnote}>
        <span className="mono" style={vL.footnoteTag}>FN</span>
        <p style={vL.footnoteText}>
          smbX is software, not a fiduciary or registered broker-dealer. Yulia drafts documents, models structures, and prepares analyses for your review and decision. Funds and escrow run through your attorney. Outcomes are presented as ranges with methodology — never guarantees. smbX sits on the software side of SEC Rule 15(b)(13). A principal can use Yulia directly without triggering broker-dealer regulation; an advisor can use her inside their firm without competing with her.
        </p>
      </div>
    </div>
  );
}

// ── Section wrapper, mirrors DealCanvas's <Sec> ───────────────────────
function LSec({ n, title, eyebrow, children }: { n: string; title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section style={vL.sec}>
      <div style={vL.secHead}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.1em" }}>§{n}</span>
          <h3 className="eyebrow" style={{ fontSize: 11, color: "var(--ink)", margin: 0, letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
        {eyebrow && (
          <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {eyebrow}
          </span>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}

// ── Small components ─────────────────────────────────────────────────
function PatternCell({ n, head, body, accent }: { n: string; head: string; body: string; accent?: boolean }) {
  return (
    <div style={{ ...vL.patternCell, ...(accent ? vL.patternCellAccent : null) }}>
      <span className="mono" style={{
        fontSize: 10.5,
        color: accent ? "var(--go)" : "var(--ink-4)",
        letterSpacing: "0.1em",
      }}>{n}</span>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 17,
        letterSpacing: "-0.02em",
        marginTop: 8,
        color: accent ? "var(--go)" : "var(--ink)",
      }}>{head}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-2)", marginTop: 6 }}>
        {body}
      </div>
    </div>
  );
}

function ExampleAct({ n, tag, ctx, children }: { n: string; tag: string; ctx?: string; children: ReactNode }) {
  return (
    <div style={vL.act}>
      <div style={vL.actHead}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--go)", letterSpacing: "0.1em" }}>ACT {n}</span>
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

function OptionCard({ n, mult, timeline, title, detail, chosen }: { n: string; mult: string; timeline: string; title: string; detail: string; chosen?: boolean }) {
  return (
    <div style={{ ...vL.optCard, ...(chosen ? vL.optCardChosen : null) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="mono" style={{
          fontSize: 10, color: chosen ? "var(--go)" : "var(--ink-4)",
          letterSpacing: "0.1em",
        }}>OPT {n}</span>
        {chosen && <span className="eyebrow eyebrow-go" style={{ fontSize: 9 }}>CHOSEN</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span className="mono" style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22,
          letterSpacing: "-0.02em",
          color: chosen ? "var(--go)" : "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}>{mult}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· {timeline}</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", marginTop: 10, lineHeight: 1.4 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function MoatChip({ n, label, accent }: { n: string; label: string; accent?: boolean }) {
  return (
    <div style={vL.moatChip}>
      <span className="mono" style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 18,
        letterSpacing: "-0.02em",
        color: accent ? "var(--go)" : "var(--ink)",
        fontVariantNumeric: "tabular-nums",
      }}>{n}</span>
      <span className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>{label}</span>
      {accent && <span style={vL.moatChipUnderline} />}
    </div>
  );
}

function GlossCard({ term, body }: { term: string; body: string }) {
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

interface PriceCardProps {
  tier: string;
  price: string;
  cad?: string;
  built: string;
  seats: string;
  deals: string;
  deliv: string;
  featured?: boolean;
  muted?: boolean;
}

function PriceCard({ tier, price, cad, built, seats, deals, deliv, featured, muted }: PriceCardProps) {
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
        color: featured ? "var(--go)" : "var(--ink-3)",
      }}>{tier}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: muted ? 18 : 26,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: featured ? "var(--go)" : "var(--ink)",
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

function FaqRow({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx < 2);
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

const vL: Record<string, CSSProperties> = {
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
  titleEm: { color: "var(--go)" },
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

  intro: {
    fontSize: 13.5, lineHeight: 1.65,
    color: "var(--ink)",
    margin: 0,
    textWrap: "pretty",
    maxWidth: 760,
  },

  body: {
    fontSize: 13.5, lineHeight: 1.65,
    color: "var(--ink)",
    margin: "0 0 14px",
    textWrap: "pretty",
    maxWidth: 760,
  },

  // §01 engine
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
    background: "linear-gradient(135deg, var(--go-soft), transparent 80%), var(--surface)",
  },
  engineCloser: {
    display: "flex", alignItems: "center", gap: 14,
    margin: "16px 0 0",
  },
  engineRule: {
    flex: 1, height: 1, background: "var(--line)",
  },

  // §02 example
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
    borderLeft: "3px solid var(--go)",
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
    background: "linear-gradient(180deg, var(--go-soft), transparent), var(--surface)",
    borderColor: "var(--go-ring)",
    boxShadow: "0 0 0 1px var(--go-ring)",
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

  // §03 compounding
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
    position: "relative",
  },
  moatChipUnderline: {
    position: "absolute", bottom: 0, left: 14, right: 14,
    height: 2,
    background: "var(--go)",
    borderRadius: "2px 2px 0 0",
  },

  // §04 glossary
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
    flex: 1, height: 1, background: "var(--go-ring)",
  },

  // §05 pricing
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
    background: "linear-gradient(180deg, var(--go-soft), transparent 70%), var(--surface)",
    borderColor: "var(--go-ring)",
    boxShadow: "0 0 0 1px var(--go-ring), 0 1px 6px rgba(19,138,90,0.08)",
  },
  priceCardMuted: {
    background: "var(--surface-2)",
    borderStyle: "dashed",
  },
  priceFeaturedTag: {
    position: "absolute", top: -10, left: 14,
    background: "var(--go)",
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
    display: "flex", flexDirection: "column", gap: 10,
  },
  ruleRow: {
    display: "flex", gap: 10, alignItems: "flex-start",
  },
  ruleDot: {
    width: 5, height: 5, borderRadius: 999,
    background: "var(--go)",
    marginTop: 8, flexShrink: 0,
  },

  // §06 faq
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

  // Compliance footnote
  footnote: {
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1px dashed var(--line-2)",
    display: "flex", gap: 14,
    alignItems: "flex-start",
    maxWidth: 820,
  },
  footnoteTag: {
    fontSize: 9, color: "var(--ink-4)",
    letterSpacing: "0.15em",
    border: "1px solid var(--line)",
    borderRadius: 3,
    padding: "2px 6px",
    background: "var(--surface-2)",
    flexShrink: 0,
    marginTop: 1,
  },
  footnoteText: {
    margin: 0,
    fontSize: 11.5, lineHeight: 1.6,
    color: "var(--ink-3)",
  },
};
