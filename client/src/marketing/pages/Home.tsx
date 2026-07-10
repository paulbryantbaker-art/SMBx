/**
 * Homepage `/` — hi-fi 4a. Hero + ink dock, the Blind Equity™ proof card,
 * three seat doors, the judgment close. Copy verbatim from the locked deck.
 */
import { Link } from 'wouter';
import { MarketingShell, HeroDock } from '../MarketingShell';

function BlindEquityCard() {
  return (
    <div className="mk-ink-card" style={{ width: 'min(720px, 100%)', padding: 'clamp(28px, 3.6vw, 44px) clamp(30px, 3.8vw, 52px)' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mk-w)' }}>
        Residential cleaning · Phoenix · $1.8M revenue
      </div>
      <div className="row" style={{ marginTop: 14, fontSize: 15 }}>
        <span style={{ color: 'var(--mk-w3)' }}>Reported SDE</span>
        <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--mk-w)' }}>$320,000</span>
      </div>
      <div className="mk-eyebrow-neon" style={{ margin: '18px 0 4px' }}>Found in the numbers</div>
      <div className="row"><span>Personal vehicles run through the business</span><span className="neon">+$48,000</span></div>
      <div className="row"><span>Family phones and one-time expenses</span><span className="neon">+$27,000</span></div>
      <div className="row"><span>Above-market rent to the owner's own building</span><span className="neon">+$31,000</span></div>
      <div className="row" style={{ borderBottom: 0 }}>
        <span style={{ color: 'var(--mk-w3)' }}>Adjusted SDE</span>
        <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--mk-w)' }}>$426,000</span>
      </div>
      <div style={{ marginTop: 8, paddingTop: 22, borderTop: '1px solid var(--mk-hair-2)', fontSize: 17, color: 'var(--mk-w2)' }}>
        At 3.2× — that's <span className="mk-num-neon" style={{ fontSize: 'clamp(26px, 2.6vw, 34px)' }}>$339,000</span> you
        almost left on the table.
      </div>
      <div style={{ marginTop: 18, fontSize: 13.5, lineHeight: 1.6, color: 'var(--mk-w4)' }}>
        We call that <span style={{ color: 'var(--mk-neon)', fontWeight: 600 }}>Blind Equity™</span> — value that's really
        there, just buried where a buyer won't credit it until someone shows the work.
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <MarketingShell
      page="home"
      placeholder="Tell Yulia about your deal…"
      quickReplies={['How did you get this?', 'What moves this number most?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap mk-center" style={{ gap: 0 }}>
          <h1 className="mk-h1" style={{ maxWidth: 960 }}>
            <span style={{ whiteSpace: 'nowrap' }}>What is a business</span>{' '}
            <span style={{ whiteSpace: 'nowrap' }}><em>really</em> worth?</span>
          </h1>
          <p className="mk-lead" style={{ marginTop: 28, maxWidth: '44em' }}>
            Rarely what the tax return says. Yulia values a business the way a sharp buyer's
            analyst would — finds the earnings hiding in the numbers, checks it against real
            market data, shows every source. Start with yours. The first analysis is free.
          </p>
          <div style={{ marginTop: 52, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <HeroDock
              wide
              chips={[
                { label: "I'm selling", seed: "I'm selling my business — it's a " },
                { label: "I'm buying", seed: "I'm looking to buy a business — " },
                { label: 'I advise', seed: "I'm advising on a deal — " },
              ]}
            />
            <div className="mk-trustline">
              <span><em style={{ fontWeight: 700 }}>No success fees</em>, ever</span>
              <span className="dot">·</span>
              <span>Start free</span>
              <span className="dot">·</span>
              <span>Every number sourced</span>
            </div>
            <div className="mk-sources">
              Built on U.S. Census Bureau · Bureau of Labor Statistics · Federal Reserve (FRED) · SEC EDGAR · SBA · IRS SOI
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center" style={{ gap: 26 }}>
          <div className="mk-eyebrow">A live Yulia analysis · under three minutes · every number sourced</div>
          <BlindEquityCard />
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-doors">
            <Link href="/sell" className="mk-glass mk-door">
              <span className="t">I'm selling a business</span>
              <p>Know the real number. Find what's hidden. Walk in prepared.</p>
              <span className="go">Start here →</span>
            </Link>
            <Link href="/buy" className="mk-glass mk-door">
              <span className="t">I'm buying a business</span>
              <p>Is this the one? Find out before you're in too deep.</p>
              <span className="go">Start here →</span>
            </Link>
            <Link href="/advise" className="mk-glass mk-door">
              <span className="t">I advise on deals</span>
              <p>Do the work of a full analyst team on every deal. Keep being the reason it closes.</p>
              <span className="go">Start here →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center">
          <h2 className="mk-h2" style={{ maxWidth: '22ch', fontSize: 'clamp(28px, 2.6vw, 36px)' }}>
            Yulia does the work. You keep the judgment — <em>and the fee.</em>
          </h2>
          <p className="mk-body" style={{ marginTop: 22, maxWidth: '40em', color: 'var(--mk-ink-3)' }}>
            She does roughly what an investment bank does, minus the parts that need a license.
            She never negotiates for you, never takes a cut, never signs anything. When your deal
            needs a real attorney, CPA, or lender, she tells you and connects you to one.
          </p>
          <p className="mk-body" style={{ marginTop: 16, maxWidth: '40em', color: 'var(--mk-ink-3)' }}>
            Start the conversation above. It's free, and there's no catch — the first real
            analysis costs you nothing but the two minutes it takes to describe your deal.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
