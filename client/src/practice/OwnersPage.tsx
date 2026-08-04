/**
 * /owners — the free owner evaluation front door
 * (SELLER_EVALUATION_PLAN.md §2, Paul 2026-08-04: "Get Free Valuation" in the
 * menu; the whole intake + valuation runs in the chat).
 *
 * Same `.pd` scope, Aurora values, unified type ladder — no new design
 * language. The chat IS the tool: the hero leads straight into OwnerChat,
 * which runs lane → free market read → Google gate → figures → report. The
 * bands below it answer the two questions an owner arrives with: "why is
 * this free?" (the honest buy-side positioning — candor is the
 * differentiator, and copy law still bans describing anyone else) and
 * "what happens to my numbers?" (the privacy promise, in plain sentences,
 * because that objection is the one the funnel dies on).
 */
import PracticeShell from './PracticeShell';
import OwnerChat from './OwnerChat';

export default function OwnersPage() {
  return (
    <PracticeShell footerCompact>
      {/* ── Hero — the subpage hero grammar (same as /about, /buyers/*), sized
             by the golden section: .ow-fold reserves the viewport's minor
             segment (38.2%) for nav + statement + sub, so the conversation
             card — the focal element — begins on the φ line and owns the
             major segment. Gaps inside are φ-ladder steps (26 · 42). The card
             is the SAME card as the homepage engine — .pd-chat chrome,
             bubbles, chips, input pill — OwnerChat only swaps the brain. ── */}
      <section className="pd-hero ow-fold">
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="pd-h1" style={{ margin: '0 auto' }}>
            Know what buyers are actually paying for businesses like yours.
          </h1>
          <div className="pd-sub" style={{ margin: '26px auto 0', maxWidth: '40em' }}>
            A market range and a readiness read for your trade, built from published
            transaction data — free, and your financials are never stored.
          </div>
        </div>
      </section>
      <section style={{ padding: '0 var(--pd-pad-x)' }}>
        <div className="pd-wrap">
          <div className="ow-card" data-rv>
            <OwnerChat />
          </div>
          <p className="ow-disc" data-rv>
            This evaluation is a market-data read, not an appraisal or an opinion of value —
            it reports published multiple ranges for your trade and where your business profile
            sits inside them. For a formal valuation, engage a credentialed appraiser.
          </p>
        </div>
      </section>

      {/* ── Why free — the honest positioning, stated plainly ── */}
      <section className="pd-dark" style={{ marginTop: 'clamp(90px, 11vw, 170px)' }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel" data-rv style={{ textAlign: 'center', marginBottom: 0 }}>
            Why this is free
          </div>
          <div className="ow-why" data-rv>
            <p>
              We are buy-side corporate development — acquirers hire us to find and close
              acquisitions, and the acquirer pays us. We never take a fee from an owner,
              we never list businesses, and we never represent sellers.
            </p>
            <p>
              We built this because when a buyer engages us in your lane, we want to already
              know you. Owners who run the evaluation and opt in are the first calls we make.
              That's the whole trade: you get the read buyers use, we get a reason to call
              you first.
            </p>
          </div>
        </div>
      </section>

      {/* ── What you get — three hairline cards ── */}
      <section className="pd-section">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">What you walk away with</div>
          </div>
          <div className="ow-gets rv-stagger">
            <div className="ow-get" data-rv>
              <div className="k">The market range</div>
              <div className="b">
                Where businesses in your trade actually trade — the full band and the market's
                middle, every endpoint cited to published transaction data, never a made-up
                number and never a single magic figure.
              </div>
            </div>
            <div className="ow-get" data-rv>
              <div className="k">The readiness read</div>
              <div className="b">
                What moves a business toward the top of its band — recurring revenue, owner
                dependence, customer concentration, books — and which of those five levers
                is worth your next year of work.
              </div>
            </div>
            <div className="ow-get" data-rv>
              <div className="k">A report you can use</div>
              <div className="b">
                A PDF in your inbox, in the same format as our published market assessments.
                Put it in front of your banker, your CPA, or the next person who cold-calls
                you with an offer.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The privacy promise — the objection the funnel dies on ── */}
      <section className="pd-section" style={{ paddingTop: 0 }}>
        <div className="pd-wrap">
          <div className="ow-privacy" data-rv>
            <div className="k">What we keep, and what we don't</div>
            <p>
              Your revenue, earnings, and every other figure you enter are used to run the
              calculation and are <b>not stored</b> — there is nowhere in our system for them
              to live. When your report is delivered, the chat shows you exactly what is on
              file for your company — general business information and the report itself,
              nothing else — and <b>you decide</b>: keep it and you're on the first-call list
              when a buyer engages us in your lane, or tell us to delete it and it's erased
              on the spot.
            </p>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
