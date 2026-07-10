/**
 * `/buy` — hi-fi 4c. Buyer voice: the Deal Check card, three value props,
 * the roll-up play. Copy verbatim from the locked deck.
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

export default function Buy() {
  return (
    <MarketingShell
      page="buy"
      placeholder="Tell Yulia what you're looking for…"
      quickReplies={['How do I check add-backs?', 'What multiple is normal here?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap mk-center">
          <div className="mk-eyebrow" style={{ marginBottom: 22 }}>For buyers &amp; searchers</div>
          <h1 className="mk-h1 mk-h1-sub" style={{ maxWidth: '18ch' }}>
            Is this the one? Find out before you're in too deep.
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '44em' }}>
            The hardest part of buying a business is knowing what to walk away from. Yulia reads
            a deal the way an experienced buyer does — the real multiple, the real risks, the
            number the bank will actually lend against — in an afternoon, not a month.
          </p>
          <div style={{ marginTop: 44, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow">
            <div className="copy" style={{ width: 'min(500px, 100%)' }}>
              <h2 className="mk-h2" style={{ fontSize: 'clamp(25px, 2.3vw, 32px)' }}>
                The asking price is a starting point, not a fact
              </h2>
              <p className="mk-body">
                Paste a listing and Yulia does the math out loud. She'll tell you the multiple
                the seller is actually asking, how that compares to what the industry trades at,
                and whether the price is fair, rich, or a gift.
              </p>
              <p className="mk-body">
                No spin. Just the number and the comparison, so you know where you stand before
                you make an offer.
              </p>
            </div>
            <div className="card">
              <div className="mk-ink-card" style={{ width: 'min(440px, 100%)' }}>
                <div className="mk-eyebrow-neon">Deal check · live sample</div>
                <div style={{ display: 'flex', gap: 26, marginTop: 18, flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: 12.5, color: 'var(--mk-w4)' }}>Revenue</div><div style={{ fontWeight: 700, fontSize: 17, color: 'var(--mk-w)' }}>$850K</div></div>
                  <div><div style={{ fontSize: 12.5, color: 'var(--mk-w4)' }}>SDE</div><div style={{ fontWeight: 700, fontSize: 17, color: 'var(--mk-w)' }}>$380K</div></div>
                  <div><div style={{ fontSize: 12.5, color: 'var(--mk-w4)' }}>Asking</div><div style={{ fontWeight: 700, fontSize: 17, color: 'var(--mk-w)' }}>$2.5M</div></div>
                </div>
                <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--mk-hair-2)' }}>
                  <span className="mk-num-neon" style={{ fontSize: 40 }}>6.58×</span>
                  <span style={{ fontSize: 15, color: 'var(--mk-w2)' }}> SDE — HVAC typically runs 2.5×–3.5×.</span>
                </div>
                <div style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.65, color: 'var(--mk-w2)' }}>
                  This one's priced like a platform, not a tuck-in. Before you counter, let's see
                  what's really in that $380K.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-doors">
            <div className="mk-glass mk-door" style={{ width: 346 }}>
              <span className="t" style={{ fontSize: 19, lineHeight: 1.25 }}>Know in an afternoon what used to take a month</span>
              <p style={{ fontSize: 14.5 }}>
                Experienced buyers walk away from most deals they look at — the skill is doing it
                fast. Yulia stress-tests the financials, flags the customer concentration, the
                owner-dependence, the add-backs that don't hold up. The dead ones die cheap and
                early.
              </p>
            </div>
            <div className="mk-glass mk-door" style={{ width: 346 }}>
              <span className="t" style={{ fontSize: 19, lineHeight: 1.25 }}>The number the bank will actually see</span>
              <p style={{ fontSize: 14.5 }}>
                Before you sign a personal guarantee, know the deal services its own debt. Yulia
                models the debt structure, the coverage ratio, what an SBA lender will
                underwrite, and what's left for you after the note is paid.
              </p>
            </div>
            <div className="mk-glass mk-door" style={{ width: 346 }}>
              <span className="t" style={{ fontSize: 19, lineHeight: 1.25 }}>Find the ones nobody else is bidding on</span>
              <p style={{ fontSize: 14.5 }}>
                Yulia helps you build a proprietary search — real businesses in your target
                market, actually independent and actually acquirable. You're the only buyer in
                the room, not another name in a bidding war.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mk-glass mk-glass-lg" style={{ width: 'min(880px, 100%)', padding: 'clamp(30px, 4vw, 48px) clamp(30px, 4.2vw, 56px)' }}>
            <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>Buying to build something bigger?</h2>
            <p className="mk-body" style={{ marginTop: 16 }}>
              Searchers, independent sponsors, and family offices increasingly buy a platform and
              grow it by acquisition. Yulia runs that playbook with you — shapes the thesis,
              sources the add-on targets, models what each one does to your combined earnings and
              debt load, and keeps the pipeline moving while you operate the first.{' '}
              <em style={{ fontWeight: 600 }}>The engine that scores one deal scores your whole roll-up.</em>
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center">
          <h2 className="mk-h2" style={{ fontSize: 'clamp(28px, 2.6vw, 34px)' }}>
            Free to start. <em>No success fees, ever.</em>
          </h2>
          <p className="mk-body" style={{ marginTop: 20, maxWidth: '38em', color: 'var(--mk-ink-3)' }}>
            Score your first deal for nothing. When you're ready to run one to close, you pay for
            the work — never a percentage of the purchase price. If you've got a specific listing
            in mind, paste the numbers — you'll have a real read in minutes.
          </p>
          <div style={{ marginTop: 40, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
