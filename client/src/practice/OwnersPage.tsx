/**
 * /owners — the free owner valuation front door
 * (SELLER_EVALUATION_PLAN.md §2; rebuilt 2026-08-04 under Paul's five-point
 * critique: valuation language not "market read", the site's own look, every
 * vertical offered, honest imagery, and an ambient bloom that actually
 * centers on the content).
 *
 * Layout laws in force here:
 *  • GOLDEN SECTION FOLD — .ow-fold reserves the viewport's minor segment
 *    (38.2%) for nav + statement + sub so the conversation card begins on the
 *    φ line; spacing runs the φ ladder (16 · 26 · 42 · 68 · 110).
 *  • ONE CONTINUOUS BLOOM — .ow-head wraps hero + card and draws a single
 *    ambient wash centered on the card (the hero's own bloom is suppressed
 *    inside it), so the atmosphere belongs to the content instead of dying
 *    at a section boundary.
 *  • THE CHAT IS THE SITE'S CHAT — OwnerChat renders .pd-chat-head/.pd-msgs/
 *    .pd-chips/.pd-chat-inputrow verbatim; only the brain differs.
 *  • HONEST IMAGERY — the green-and-bone trade illustrations already shipped
 *    on /industries; brand art as decoration, never a photo implying an
 *    event that didn't happen.
 */
import PracticeShell from './PracticeShell';
import OwnerChat from './OwnerChat';

export default function OwnersPage() {
  return (
    <PracticeShell footerCompact>
      <div className="ow-head">
        {/* ── The fold: statement in the φ minor segment, card on the line ── */}
        <section className="pd-hero ow-fold">
          <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
            <h1 className="pd-h1" style={{ margin: '0 auto' }}>
              Know what buyers are actually paying for businesses like yours.
            </h1>
            <div className="pd-sub" style={{ margin: '26px auto 0', maxWidth: '40em' }}>
              A full valuation of your business — free, in the chat below, delivered
              as a report you can put in front of anyone.
            </div>
          </div>
        </section>
        <section style={{ padding: '0 var(--pd-pad-x)' }}>
          <div className="pd-wrap">
            <div className="ow-card" data-rv>
              <OwnerChat />
            </div>
            <p className="ow-disc" data-rv>
              Your valuation reports published market ranges for your trade and where your
              business profile sits inside them — it is not a formal appraisal. When you need
              one of those, engage a credentialed appraiser.
            </p>
          </div>
        </section>
      </div>

      {/* ── Trade art — the same green-and-bone set the Industries page carries ── */}
      <section className="pd-wrap" style={{ marginTop: 'clamp(42px, 5vw, 68px)', padding: '0 var(--pd-pad-x)' }}>
        <img
          className="pd-accentband"
          src="/industries/trade-fleet.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1700}
          height={520}
          data-rv
        />
      </section>

      {/* ── Why free — the honest positioning, stated plainly ── */}
      <section className="pd-dark" style={{ marginTop: 'clamp(68px, 8vw, 110px)' }}>
        <span className="pd-spark" aria-hidden="true" />
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
              know you. Owners who run their valuation and opt in are the first calls we make.
              That's the whole trade: you get the read buyers use, we get a reason to call
              you first.
            </p>
          </div>
        </div>
      </section>

      {/* ── What the valuation covers — three cards, each carrying trade art ── */}
      <section className="pd-section">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">What your valuation covers</div>
          </div>
          <div className="ow-gets rv-stagger">
            <div className="ow-get" data-rv>
              <img src="/industries/trade-fleet-sq.jpg" alt="" aria-hidden="true" loading="lazy" />
              <div className="tx">
                <div className="k">The market range</div>
                <div className="b">
                  Where businesses in your trade actually trade — the full band and the market's
                  middle, every endpoint cited to published transaction data, never a made-up
                  number and never a single magic figure.
                </div>
              </div>
            </div>
            <div className="ow-get" data-rv>
              <img src="/industries/trade-ndt-sq.jpg" alt="" aria-hidden="true" loading="lazy" />
              <div className="tx">
                <div className="k">Your earnings, normalized</div>
                <div className="b">
                  The same walk a buyer's accountants run — owner compensation, one-time costs,
                  personal expenses, family payroll, and owned real estate restated to market
                  rent — so the number the range applies to is the one a buyer would use.
                </div>
              </div>
            </div>
            <div className="ow-get" data-rv>
              <img src="/industries/trade-billing-sq.jpg" alt="" aria-hidden="true" loading="lazy" />
              <div className="tx">
                <div className="k">A report you can use</div>
                <div className="b">
                  Your valuation lands in your inbox as a PDF in the same format as our published
                  market assessments — ready for your banker, your CPA, or the next person who
                  cold-calls you with an offer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The privacy promise — the objection the whole funnel dies on ── */}
      <section className="pd-section" style={{ paddingTop: 0, marginTop: 68 }}>
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
          <div className="ow-close" data-rv>
            <p>
              Don't see your trade in the list? It's in the chat — pick "Another trade" and
              name it. If we haven't published valuation data for it yet, we'll say so
              honestly, and you're first in line the day we do.
            </p>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
