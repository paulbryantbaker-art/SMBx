/**
 * `/advise` — hi-fi 4d. Terse practitioner voice: the analyst-grind pitch,
 * the per-engagement math, the human-matters-more close. Copy verbatim.
 *
 * The "first three client deals free" offer is the locked deck's — flagged
 * to Paul as a product commitment the backend doesn't enforce yet.
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

export default function Advise() {
  return (
    <MarketingShell
      page="advise"
      placeholder="Tell Yulia about the deal you're working…"
      quickReplies={['Draft a CIM outline', 'What do you need from me?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap mk-center">
          <div className="mk-eyebrow" style={{ marginBottom: 22 }}>For brokers &amp; advisors</div>
          <h1 className="mk-h1 mk-h1-sub" style={{ maxWidth: '17ch' }}>
            You close the deal.<br />Yulia does everything before it.
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '46em' }}>
            The CIM, the recast, the buyer list, the diligence prep — the forty hours of grind
            behind every engagement — Yulia does in an afternoon, branded to your practice. You
            spend your time where deals are actually won: judgment, negotiation, and the
            relationships no tool will ever replace.
          </p>
          <div style={{ marginTop: 44, width: '100%' }}>
            <HeroDock />
          </div>
          <div className="mk-glass-pill" style={{ marginTop: 24 }}>
            Your first three client deals are&nbsp;<em>free</em>&nbsp;— real engagements, white-labeled under your name
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow">
            <div className="copy" style={{ width: 'min(500px, 100%)' }}>
              <h2 className="mk-h2" style={{ fontSize: 'clamp(25px, 2.3vw, 32px)' }}>
                The math that makes this obvious
              </h2>
              <p className="mk-body">
                Preparing a proper CIM eats 20 to 60 hours — most of it chasing a seller for
                clean financials and recasting them by hand. Meanwhile four out of five listings
                never pay a commission, and half the deals that reach LOI collapse in diligence.
              </p>
              <p className="mk-body">
                Yulia flips the ratio. First complete CIM before your afternoon meeting, sourced
                to the seller's own numbers. Financials recast, add-backs surfaced, buyer list
                built, tire-kickers screened.
              </p>
            </div>
            <div className="card">
              <div className="mk-ink-card" style={{ width: 'min(400px, 100%)' }}>
                <div className="mk-eyebrow-neon">Per engagement</div>
                <div style={{ marginTop: 16 }}>
                  <span className="mk-num-neon" style={{ fontSize: 44 }}>40+ hrs</span>
                  <span style={{ fontSize: 15, color: 'var(--mk-w2)' }}> back</span>
                </div>
                <div className="row" style={{ marginTop: 14, fontSize: 14.5 }}><span>CIM first draft</span><b>an afternoon, not 3 weeks</b></div>
                <div className="row" style={{ fontSize: 14.5 }}><span>What that buys you</span><b>4–6 more deals / yr</b></div>
                <div className="row" style={{ fontSize: 14.5, borderBottom: 0 }}><span>Deal-size floor</span><span className="neon">near zero</span></div>
                <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.6, color: 'var(--mk-w4)' }}>
                  The $400K landscaping company you couldn't justify becomes a clean, fast
                  engagement.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mk-glass mk-glass-lg" style={{ width: 'min(880px, 100%)', padding: 'clamp(30px, 4vw, 48px) clamp(30px, 4.2vw, 56px)' }}>
            <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>
              In an AI world, the skilled human matters more, not less
            </h2>
            <p className="mk-body" style={{ marginTop: 16 }}>
              This is the fear worth naming: that tools like this make the advisor a commodity.
              The opposite is true. Yulia doesn't negotiate, doesn't represent anyone, doesn't
              hold a license, and doesn't have judgment. She does the analyst grind so you're
              free to do the part that was always the real job — reading the room, structuring
              the deal, holding the seller's hand through the hardest financial decision of
              their life.
            </p>
            <p style={{ margin: '14px 0 0', fontSize: 17, lineHeight: 1.6, fontWeight: 600, color: 'var(--mk-ink)' }}>
              Clients don't pay you for the CIM. They pay you for knowing what to do with it.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-prose">
            <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>Your clients never pay us a cut</h2>
            <p className="mk-body">
              You run on a flat monthly plan built for people who do this repeatedly — brokers,
              sell-side advisors, independent sponsors, and small corp-dev teams alike. First
              three client deals free. After that, one flat monthly price no matter how many
              deals you carry — and your clients never pay smbX a success fee. Tell Yulia you run
              deals for a living and she'll set it up.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center">
          <h2 className="mk-h2" style={{ fontSize: 'clamp(28px, 2.6vw, 34px)' }}>
            Start your first client deal <em>free.</em>
          </h2>
          <p className="mk-body" style={{ marginTop: 20, maxWidth: '37em', color: 'var(--mk-ink-3)' }}>
            Bring a live engagement. Watch what Yulia does with it before your next meeting. If
            it doesn't save you a week of work, walk away — you've lost nothing.
          </p>
          <div style={{ marginTop: 40, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
