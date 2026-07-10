/**
 * `/buy` — wireframe 5d. The deal-check artifact leads: paste a listing,
 * get the multiple, the market, and the questions to ask. Context piped:
 * Yulia opens buyer/deal-check from this page.
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
        <div className="mk-wrap">
          <div className="mk-split">
            <div className="mk-split-copy">
              <span className="mk-seclabel">For buyers &amp; searchers</span>
              <h1 className="mk-h1" style={{ maxWidth: '15ch' }}>
                Is that asking price fair? Find out before you offer.
              </h1>
              <p className="mk-hero-sub">
                Paste a listing. Get the multiple, the market, and the questions to ask.
              </p>
              <HeroDock />
            </div>
            <div className="mk-split-aside">
              <div className="mk-card mk-sample">
                <span className="mk-seclabel">Deal check · sample</span>
                <span className="mk-num mk-num-lg">6.58×</span>
                <div className="mk-rows">
                  <div><span>Asking</span><b>$2.5M</b></div>
                  <div><span>SDE</span><b>$380K</b></div>
                  <div><span>HVAC trades at</span><b>2.5–3.5×</b></div>
                </div>
                <span style={{ fontSize: 13.5 }}><em><b>That's rich. Ask about add-backs.</b></em></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <h2 className="mk-h2">What she does at every stage</h2>
          <div className="mk-steps" style={{ paddingTop: 8 }}>
            <div>
              <b>Sourcing</b>
              <p>Screens listings against your thesis, flags what's mispriced, drafts the outreach.</p>
            </div>
            <div>
              <b>Diligence</b>
              <p>Recasts the financials, verifies add-backs, builds the question list the seller has to answer.</p>
            </div>
            <div>
              <b>Structuring &amp; close</b>
              <p>Models SBA and seller-note structures, drafts the LOI scaffold, tracks every open item.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-wrap">
          <p className="mk-band-line">
            Buy-side help without the buy-side fee: <em>flat software pricing.</em>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
