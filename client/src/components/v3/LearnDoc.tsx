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
          DOCUMENT · HOW IT WORKS &amp; PRICING
        </div>
        <h1 style={vL.title}>
          Let's get started! Bring Yulia in on any deal now for free.
          <br/>
          <span style={vL.titleEm}>Your first deliverable is on us. Chat is always free.</span>
        </h1>
        <p style={vL.lede}>
          Yulia is the analyst pod, the associate desk, and the document engine — on subscription. She runs the recast, builds the buyer tree, models the structures, and drafts every piece of work product on the deal. <span style={{ color: "var(--ink-3)" }}>You bring the judgment. You sign the email.</span>
        </p>
        <div style={vL.titleMeta}>
          <span className="mono" style={vL.metaTag}>6 sections</span>
          <span className="mono" style={vL.metaTag}>~5 min read</span>
          <span className="mono" style={vL.metaTag}>updated apr 2026</span>
        </div>
      </div>

      {/* ── §01 How Yulia works ──────────────────────────────────── */}
      <LSec n="01" title="How Yulia works · four steps, every deal" eyebrow="THE DESK">
        <p style={{ ...vL.intro, marginBottom: 18 }}>
          Yulia runs every deal according to time-tested investment-bank and private-equity management practices established over the last 30 years, encompassing billions of dollars in capital management and transactional knowledge. She brings that to your deals — making them smarter and faster.
        </p>
        <div style={vL.fourGrid}>
          <PatternCell
            n="01"
            head="She pulls the work into one place."
            body="Drop in the financials, the tax returns, the CIM, the LOI thread, the diligence requests, the contracts. Yulia recasts the P&L, normalizes owner comp, defends the add-backs against the tax filings, pegs working capital, and builds a clean read of the business inside an hour. The pile becomes a working deal file."
          />
          <PatternCell
            n="02"
            head="She runs the analysis."
            body="The Baseline valuation. Buyer universe with pursuit-rate scoring. SBA SOP 50 10 8 structure check. Quality-of-earnings pre-read. Diligence tracker with the data room mapped to the request list. CIM, teaser, IOI, LOI, engagement letter, board memo, lender package, 100-day plan. Twenty-eight document generators sharing one financial backbone, so every doc on the deal references the same numbers."
          />
          <PatternCell
            n="03"
            head="She lays out the options."
            body="Three live paths, each one costed. Price. Structure. Timing. Tax. Close certainty. Buyer fit. Your role at close and the year after. Side by side, with the math defended. No softball options. No buried recommendation. The same way a senior advisor would frame it across a conference table — except faster and without the hourly rate."
          />
          <PatternCell
            n="04"
            head="You pick the path."
            body="Yulia drafts the next move — the counter, the engagement letter, the CIM section, the buyer outreach, the diligence response, the funds-flow update — to your house style. You read it, mark it up, send it. The leverage stays with you. The labor doesn't."
            accent
          />
        </div>
        <div style={vL.engineCloser}>
          <em style={{ fontSize: 12.5, color: "var(--ink-2)", textWrap: "pretty" }}>
            Yulia leads, guides, and educates the deal team so they can make the best decisions and be better prepared from day one to close.
          </em>
        </div>
      </LSec>

      {/* ── §02 A real interaction ───────────────────────────────── */}
      <LSec n="02" title="A real interaction · names changed, numbers preserved" eyebrow="A REAL INTERACTION">
        <p style={{ ...vL.intro, marginBottom: 14 }}>
          Industrial services founder, 61, considering a sale. Multi-state ops, $28M revenue, $5.4M EBITDA after the recast. He hasn't picked an advisor yet. He wants to walk into the engagement-letter conversation with a view, not a question.
        </p>

        <ExampleAct
          n="01"
          tag="THE QUESTION"
          ctx="$28M revenue · $5.4M EBITDA (recast) · multi-state · founder age 61 · no advisor yet"
        >
          <div style={vL.quote}>
            “What's it worth, and what's the right way to take it to market?”
          </div>
        </ExampleAct>

        <ExampleAct n="02" tag="YULIA'S READ">
          <div style={vL.exampleLead}>
            Recast EBITDA at $5.4M after normalizing $340K of owner comp and supporting $620K of run-rate add-backs against three years of tax returns and the top-10 customer file. Working capital pegged to a 13-month average, net of seasonality. Customer concentration at 18% on the largest account — within range, flagged for diligence.
          </div>

          <div style={vL.optionsGrid}>
            <OptionCard
              n="01"
              mult="5.5×"
              timeline="4–6 mo"
              title="Limited financial-buyer process"
              detail="Three to five qualified buyers. ~85% cash at close. Two-year transition. Founder walks away cleanly. Fastest path to liquidity that doesn't sacrifice fundamentals."
            />
            <OptionCard
              n="02"
              mult="6.8×"
              timeline="6–9 mo"
              title="Broader PE platform process"
              detail="Twenty-plus buyers contacted. 75% cash, 25% rollover into the new platform. Earnout on revenue retention through year one. Founder steps to chair, then exits at the recap."
              chosen
            />
            <OptionCard
              n="03"
              mult="7.5×"
              timeline="8–14 mo"
              title="Strategic consolidator process"
              detail="Six to ten strategics in adjacent geographies. Mixed stock and cash. Two-year operating commit. Highest headline number, longest timeline, most diligence intensity."
            />
          </div>

          <div style={vL.implTable}>
            <div style={vL.implHead}>
              <span className="eyebrow" style={{ fontSize: 9 }}>WHAT EACH PATH COSTS YOU</span>
              <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>4 cols × 3 rows</span>
            </div>
            <div style={{ ...vL.implRow, ...vL.implRowHead }}>
              <span></span>
              <span>Tax treatment</span>
              <span>Close certainty</span>
              <span>Founder's role</span>
              <span>Timeline</span>
            </div>
            {([
              ["01", "Mostly long-term capital gains", "High", "Two-year transition, then out", "4–6 mo", false],
              ["02", "Capital gains + deferred on rollover", "High", "Chair, then exit at next recap", "6–9 mo", true],
              ["03", "Stock at close + cap gains on cash", "Medium", "Two-year operating commit", "8–14 mo", false],
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
            <span style={vL.decisionLabel}>The founder picked</span>
            <span style={vL.decisionPick}>Option 2<span style={{ color: "var(--go)" }}>.</span></span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginTop: 8 }}>
            Yulia drafted the engagement letter to the advisor he'd already been talking to, a kickoff CIM outline tuned to the PE platform audience, and a one-page process plan. He moved the rollover from 25% to 30%, signed the engagement letter, and the advisor went to market the following week with a deal file that was already organized.
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic", marginTop: 10, textWrap: "pretty" }}>
            The decision was the founder's. Yulia's job was finished when the three paths were costed.
          </div>
        </ExampleAct>
      </LSec>

      {/* ── §03 Why this gets sharper deal over deal ─────────────── */}
      <LSec n="03" title="Why this gets sharper deal over deal" eyebrow="THE COMPOUNDING">
        <p style={vL.body}>
          <strong style={{ color: "var(--ink)" }}>Twelve capabilities. One workspace. Two years of integration that compounds with every deal you run.</strong>
        </p>
        <p style={vL.body}>
          Any one capability on this list — the recast, the buyer tree, the QofE pre-read, the structure model — you could probably stitch together with a general-purpose AI, a model template, and a free weekend. <span style={{ color: "var(--ink-3)" }}>Once. For one deal.</span> By Monday morning the file would be inconsistent and the buyer tree would be stale.
        </p>
        <p style={vL.body}>
          What you can't stitch together in a weekend is the connective tissue. The <strong style={{ color: "var(--ink)" }}>22 gates</strong> that decide what runs when — recast before Baseline, Baseline before buyer tree, buyer tree before teaser, teaser before CIM, CIM before LOI review. The <strong style={{ color: "var(--ink)" }}>28 generators</strong> sharing one financial backbone, so the CIM number, the model number, the LOI number, and the lender-package number are the same number. The <strong style={{ color: "var(--ink)" }}>deal room</strong> that classifies what you upload and routes it to the right gate. The <strong style={{ color: "var(--ink)" }}>PMI plan</strong> that pulls the diligence findings forward into the 100-day plan, so what was promised before signing actually gets executed after.
        </p>
        <p style={vL.body}>
          That's the part that compounds. <span style={{ color: "var(--ink-3)" }}>By the third deal Yulia knows your firm's house style — how you frame value, which buyer profiles you trust, which structures you don't waste time on, what your CIMs read like.</span> By the tenth deal, the first draft on a new mandate looks like your firm produced it because, in every way that matters, your firm did.
        </p>
        <div style={vL.moatStrip}>
          <MoatChip n="22" label="gate methodology" />
          <MoatChip n="28" label="document generators" />
          <MoatChip n="12" label="connected capabilities" />
          <MoatChip n="01" label="workspace" />
          <MoatChip n="~2yr" label="of integration engineering" accent />
        </div>
        <div style={vL.engineCloser}>
          <em style={{ fontSize: 12.5, color: "var(--ink-2)", textWrap: "pretty" }}>
            The capabilities are the surface. The integration is the moat.
          </em>
        </div>
      </LSec>

      {/* ── §04 The language ──────────────────────────────────── */}
      <LSec n="04" title="The language · three terms in every Yulia deliverable" eyebrow="THE LANGUAGE">
        <p style={{ ...vL.intro, marginBottom: 14 }}>
          Three terms you'll see in every Yulia deliverable. <span style={{ color: "var(--ink-3)" }}>Each one names a specific kind of work, so you know what you're getting before you open the doc.</span>
        </p>
        <div style={vL.glossGrid}>
          <GlossCard term="The Baseline™" body="The first serious read on the deal. Three or four credible paths, each one costed — price, structure, timing, tax, close certainty, your role at close. Defended against the seller's financials and the current market. Not a recommendation. The map you walk into the engagement-letter conversation with." />
          <GlossCard term="Blind Equity™" body="The value the seller is leaving on the table because nobody's done the recast properly. Owner comp not normalized. Add-backs not defended. Working capital pegged wrong. Customer concentration framed as a risk instead of a story. The first PE diligence team finds it in week two and uses it to retrade the LOI. Yulia finds it in week zero so it goes into the price." />
          <GlossCard term="The Rundown™" body="The deal package. CIM, teaser, buyer tree, structure model, process plan, methodology memo, support files. Branded to your firm, ready for your redlines, defensible against any sophisticated buyer's diligence team. The work product an analyst pod would build over four weeks, drafted in two days." />
        </div>
      </LSec>

      {/* ── Pricing — divider ────────────────────────────────────── */}
      <div style={vL.partBreak}>
        <span style={vL.partRule} />
        <span className="eyebrow" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>PART II · PRICING</span>
        <span style={vL.partRule} />
      </div>

      <LSec n="05" title="Four tiers + enterprise · priced so you don't have to think about it" eyebrow="PRICING">
        <p style={{ ...vL.intro, marginBottom: 18 }}>
          Same Yulia in every paid tier. Same models, same generators, same buyer engine, same deal room, same QofE pre-read. <strong style={{ color: "var(--ink)" }}>You pay more for seats, deal volume, and enterprise infrastructure</strong> — never for the work itself.
        </p>

        {/* Pricing strip — 5 cards */}
        <div style={vL.priceGrid}>
          <PriceCard tier="Free"     price="$0"          built="Try Yulia on a real deal"            seats="1" deals="1" deliv="1 (ever)" />
          <PriceCard tier="Starter"  price="$49"  cad="/mo" built="Solo, one live deal at a time"      seats="1" deals="1" deliv="Unlimited" />
          <PriceCard tier="Pro"      price="$149" cad="/mo" built="Active dealmakers"                  seats="1" deals="Unlimited" deliv="Unlimited" featured />
          <PriceCard tier="Team"     price="$999" cad="/mo" built="Boutiques and partner-led firms"   seats="up to 5" deals="Unlimited" deliv="Unlimited" />
          <PriceCard tier="Enterprise" price="Contact" cad="sales" built="Larger teams, regulated environments" seats="Custom" deals="Unlimited" deliv="Unlimited" muted />
        </div>

        {/* Feature matrix — sectioned by tier-progression */}
        <div style={vL.matrix}>
          <div style={{ ...vL.matrixRow, ...vL.matrixHead }}>
            <span></span>
            <span>Free</span>
            <span>Starter</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Pro</span>
            <span>Team</span>
            <span>Enterprise</span>
          </div>

          {/* The basics — every paid tier */}
          <div style={vL.matrixSection}>The basics — every paid tier</div>
          {([
            ["Yulia chat — unlimited",                "✓",    "✓",     "✓",   "✓",    "✓"],
            ["Recast + Baseline™ valuation",          "✓",    "✓",     "✓",   "✓",    "✓"],
            ["28 document generators",                "✓",    "✓",     "✓",   "✓",    "✓"],
            ["Buyer-list engine",                     "preview","✓",   "✓",   "✓",    "✓"],
            ["SBA + structure modeling",              "preview","✓",   "✓",   "✓",    "✓"],
            ["Deal room + diligence tracker",         "—",    "1 deal","✓",   "✓",    "✓"],
            ["Brand kit on every deliverable",        "—",    "✓",     "✓",   "✓",    "✓"],
            ["180 days post-close PMI",               "—",    "✓",     "✓",   "✓",    "✓"],
            ["Active deals",                          "1",    "1",     "unlimited", "unlimited", "unlimited"],
            ["Finished deliverables",                 "1 (ever)", "unlimited", "unlimited", "unlimited", "unlimited"],
          ] as const).map((row, i) => (
            <MatrixRow key={`basic-${i}`} row={row} />
          ))}

          {/* Pro adds — the associate desk */}
          <div style={vL.matrixSection}>Pro adds — the associate desk</div>
          {([
            ["QofE Lite pre-read (wedge)",            "—", "—", "✓", "✓", "✓"],
            ["Parallel-deal pipeline view",           "—", "—", "✓", "✓", "✓"],
            ["22-gate deal scoring",                  "—", "—", "✓", "✓", "✓"],
            ["Sector-tuned buyer universes",          "—", "—", "✓", "✓", "✓"],
            ["Audience-variant memos (LP, IC, board)","—", "—", "✓", "✓", "✓"],
            ["Negotiation tactics + counter drafting","—", "—", "✓", "✓", "✓"],
            ["Cap table + waterfall modeling",        "—", "—", "✓", "✓", "✓"],
            ["Owner-readiness scoring (CEPA)",        "—", "—", "✓", "✓", "✓"],
            ["API access (standard rate limits)",     "—", "—", "✓", "✓", "✓"],
          ] as const).map((row, i) => (
            <MatrixRow key={`pro-${i}`} row={row} />
          ))}

          {/* Team adds — for firms */}
          <div style={vL.matrixSection}>Team adds — for firms</div>
          {([
            ["Up to 5 seats",                         "—", "—", "—", "✓", "✓"],
            ["Shared deal vault + firm templates",    "—", "—", "—", "✓", "✓"],
            ["Specialist handoff coordination",       "—", "—", "—", "✓", "✓"],
          ] as const).map((row, i) => (
            <MatrixRow key={`team-${i}`} row={row} />
          ))}

          {/* Enterprise adds */}
          <div style={vL.matrixSection}>Enterprise adds — for regulated environments</div>
          {([
            ["Custom seat count",                     "—", "—", "—", "—", "✓"],
            ["SSO · single-tenant · SOC 2",           "—", "—", "—", "—", "✓"],
            ["Higher API rate limits + uptime SLA",   "—", "—", "—", "—", "✓"],
            ["Named account manager",                 "—", "—", "—", "—", "✓"],
          ] as const).map((row, i) => (
            <MatrixRow key={`ent-${i}`} row={row} />
          ))}
        </div>

        {/* The pricing promises — 5 bullets */}
        <div style={vL.rulesBox}>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>THE PROMISES</div>
          {([
            ["No success fees. No per-deal tolls. No retainer hours billed against the work.", "Subscription is the entire cost. Closed deal or broken.", false],
            ["180 days of PMI built into every paid tier.", "Diligence findings, integration milestones, and the value-creation plan all live in the same workspace.", false],
            ["30 days FREE on Pro before you commit.", "14-day opt-out window on every other paid tier. Cancel anytime.", true],
            ["Professional service providers are free, forever.", "Attorneys, real-estate agents, stockbrokers, and deal-team consultants can be brought into any deal at no cost until that deal closes.", false],
            ["No surge pricing on hot mandates. No metered tokens. No \"AI usage\" line item.", "The $149 in March is the $149 in October.", false],
          ] as const).map(([head, tail, accent], i) => (
            <div key={i} style={vL.ruleRow}>
              <span style={{ ...vL.ruleDot, ...(accent ? { background: "var(--ink)", boxShadow: "0 0 0 3px rgba(15,22,35,0.08)" } : null) }} />
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
                <strong style={{ color: "var(--ink)" }}>{head}</strong>{" "}{tail}
              </span>
            </div>
          ))}
        </div>
      </LSec>

      {/* ── §06 FAQ ─────────────────────────────────────────────── */}
      <LSec n="06" title="Frequently asked" eyebrow="FAQ">
        {[
          ["What does Free actually include?",
            "Unlimited chat with Yulia and one finished deliverable, ever. No credit card. The cap is on completed work product, not access — you can run as many conversations as you want against a real deal before you trigger the deliverable."],
          ["What counts as a \"deliverable\"?",
            "Any finished work product — a recast, a Baseline, a CIM draft, a buyer tree, an LOI review, a counter, an engagement letter, a 100-day plan, a lender package. If it's something you'd send to a counterparty or sign, it counts."],
          ["Why is Pro $149 and Team $999?",
            "Pro is one practitioner running unlimited deals. Team is a 2–5 person firm using Yulia as a shared execution layer — shared vault, shared templates, shared house style across seats. Same product, different operating environment."],
          ["Six seats or more?",
            "Enterprise. Quoted against your firm — seat count, deployment model, SOC 2, SSO, support expectations. Talk to Yulia."],
          ["Different plan for advisors vs. brokers vs. searchers?",
            "No. A solo broker uses Starter or Pro. A 3-person M&A boutique uses Team. A 15-person firm uses Enterprise. Same product, configured for the way you work."],
          ["What happens after close?",
            "The subscription continues. 180 days of PMI is included on every paid tier — the diligence findings, the integration milestones, the value-creation plan all live in the same workspace. Most users keep the subscription past 180 days because the next deal starts in the same place the last one closed."],
          ["Annual?",
            "Not at launch. We'll add it once we have three months of cohort retention data, at 16% off. Selling annual before knowing the churn rate is how SaaS companies accidentally refund their first six months."],
          ["What does Yulia handle, and what does my attorney still do?",
            "Yulia handles the analyst-and-associate work — recast, Baseline, buyer tree, CIM, LOI drafts, diligence tracker, structure modeling, lender package, PMI plan. Your attorney handles legal language, escrow, and signing. The labor split is the same as any traditional process. The difference is the analyst pod is on subscription."],
        ].map(([q, a], i) => (
          <FaqRow key={i} q={q} a={a} idx={i} />
        ))}
      </LSec>

      {/* Final CTA */}
      <div style={vL.endCta}>
        <div>
          <div className="eyebrow eyebrow-go" style={{ fontSize: 9.5 }}>READY?</div>
          <div style={vL.endCtaTitle}>Bring her into one live deal.</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
            Upload the materials. Ask the question. See what she produces. Same Yulia that runs in every paid workspace.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              background: "transparent",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.28)",
              fontWeight: 500,
            }}
          >
            Talk to Yulia
          </button>
          <button
            className="btn"
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              background: "#FFFFFF",
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            Start free
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Compliance footnote — small, at the bottom */}
      <div style={vL.footnote}>
        <span className="mono" style={vL.footnoteTag}>FN</span>
        <p style={vL.footnoteText}>
          smbX is software, not a fiduciary or registered broker-dealer. Yulia drafts documents, models structures, and prepares analyses for your review and decision. Funds and escrow run through your attorney. Outputs are presented as ranges with methodology, never guarantees. We sit on the software side of SEC Rule 15(b)(13) — what allows a principal to use Yulia directly, and what allows an advisor to use her inside their firm without competing with her.
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0, flex: 1 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.1em", flexShrink: 0 }}>§{n}</span>
          <h3 className="eyebrow" style={{ fontSize: 11, color: "var(--ink)", margin: 0, letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
        {eyebrow && (
          <span className="mono" style={{
            fontSize: 9.5, color: "var(--ink-4)",
            letterSpacing: "0.1em", textTransform: "uppercase",
            whiteSpace: "nowrap", flexShrink: 0, marginLeft: 12,
          }}>
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
          <span className="eyebrow" style={{ fontSize: 8.5, color: "#FFFFFF", letterSpacing: "0.14em" }}>PRACTITIONERS' CHOICE</span>
        </div>
      )}
      <div className="eyebrow" style={{
        fontSize: 9.5,
        color: featured ? "var(--ink)" : "var(--ink-3)",
        fontWeight: featured ? 600 : 500,
      }}>{tier}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: muted ? 20 : 28,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}>{price}</span>
        {cad && (
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{cad}</span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8, minHeight: 17 }}>{built}</div>
      <div style={vL.priceMeta}>
        <span style={vL.priceMetaItem}>
          <span className="mono" style={{ color: "var(--ink-4)", fontSize: 10, letterSpacing: "0.04em" }}>seats</span>
          <span className="mono" style={{ fontWeight: 500 }}>{seats}</span>
        </span>
        <span style={vL.priceMetaItem}>
          <span className="mono" style={{ color: "var(--ink-4)", fontSize: 10, letterSpacing: "0.04em" }}>deals</span>
          <span className="mono" style={{ fontWeight: 500 }}>{deals}</span>
        </span>
        <span style={vL.priceMetaItem}>
          <span className="mono" style={{ color: "var(--ink-4)", fontSize: 10, letterSpacing: "0.04em" }}>deliverables</span>
          <span className="mono" style={{ fontWeight: 500 }}>{deliv}</span>
        </span>
      </div>
    </div>
  );
}

function MatrixRow({ row }: { row: readonly [string, string, string, string, string, string] }) {
  const [label, ...cols] = row;
  return (
    <div style={vL.matrixRow}>
      <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{label}</span>
      {cols.map((v, j) => {
        const isCheck = v === "✓";
        const isDash = v === "—";
        const isProCol = j === 2;
        return (
          <span key={j} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: isDash ? "var(--ink-4)" : isProCol ? "var(--ink)" : "var(--ink-2)",
            fontWeight: isCheck && isProCol ? 600 : 400,
            fontSize: isCheck || isDash ? 13 : 11,
            fontFamily: !isCheck && !isDash ? "var(--font-mono)" : undefined,
          }}>
            {v}
          </span>
        );
      })}
    </div>
  );
}

function FaqRow({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx < 2);
  const [hover, setHover] = useState(false);
  const id = `faq-${idx}`;
  return (
    <div style={vL.faqRow}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={open}
        aria-controls={`${id}-answer`}
        style={{
          ...vL.faqBtn,
          color: hover ? "var(--ink)" : undefined,
        }}
        className="faq-btn"
      >
        <span className="mono" style={{ fontSize: 10, color: hover ? "var(--go)" : "var(--ink-4)", marginRight: 12, transition: "color 120ms ease" }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{q}</span>
        <span style={{
          color: hover ? "var(--ink)" : "var(--ink-3)", fontSize: 11,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 180ms cubic-bezier(0.2,0.7,0.2,1), color 120ms ease",
        }}>▾</span>
      </button>
      <div
        id={`${id}-answer`}
        role="region"
        aria-hidden={!open}
        hidden={!open}
        style={vL.faqAnswer}
      >
        {a}
      </div>
    </div>
  );
}

const vL: Record<string, CSSProperties> = {
  docInner: { padding: "28px 36px 48px", maxWidth: 980, margin: "0 auto" },

  titleBlock: { paddingBottom: 22, borderBottom: "1px solid var(--line)" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 22, fontWeight: 600,
    letterSpacing: "-0.025em",
    margin: "8px 0 14px",
    color: "var(--ink)",
    lineHeight: 1.25,
    textWrap: "pretty",
  },
  titleEm: {
    color: "var(--go)",
  },
  engineCloser: {
    display: "flex", justifyContent: "center",
    marginTop: 18, paddingTop: 14,
    borderTop: "1px dashed var(--line)",
    textAlign: "center",
  },
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
    gridTemplateColumns: "repeat(5, minmax(130px, 1fr))",
    gap: 10,
    marginTop: 24,
    marginBottom: 18,
    paddingTop: 14,
    overflowX: "auto",
  },
  priceCard: {
    position: "relative",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "16px 16px 14px",
    boxShadow: "0 1px 2px rgba(15,22,35,0.04)",
    transition: "transform 160ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 160ms",
  },
  priceCardFeatured: {
    background: "var(--surface)",
    borderColor: "var(--ink)",
    boxShadow: "0 0 0 1px var(--ink), 0 8px 24px -12px rgba(15,22,35,0.18), 0 2px 4px rgba(15,22,35,0.06)",
    transform: "translateY(-4px)",
    padding: "18px 16px 16px",
  },
  priceCardMuted: {
    background: "var(--surface-2)",
    borderStyle: "dashed",
    boxShadow: "none",
  },
  priceFeaturedTag: {
    position: "absolute",
    bottom: "calc(100% + 6px)",
    left: 12,
    background: "var(--ink)",
    padding: "4px 10px",
    borderRadius: 3,
    whiteSpace: "nowrap",
  },
  priceMeta: {
    marginTop: 14, paddingTop: 12,
    borderTop: "1px dashed var(--line-2)",
    display: "flex", flexDirection: "column", gap: 6,
    fontSize: 11,
  },
  priceMetaItem: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: 8,
    color: "var(--ink)",
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
  matrixSection: {
    padding: "12px 14px 8px",
    borderBottom: "1px solid var(--line)",
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    letterSpacing: "0.06em",
    color: "var(--ink-2)",
    background: "var(--bg)",
    minWidth: 600,
    fontWeight: 600,
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
