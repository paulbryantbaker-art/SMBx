/**
 * /about — "New firm. Old hands." (Paul's copy additions, 2026-07-11).
 * Why we built it → Your advisor (Paul Baker bio + portrait) → What we believe.
 */
import PracticeShell from './PracticeShell';
import { bookHref, bookTarget } from './leads';

const BELIEFS = [
  {
    k: 'The buyer deserves a corner.',
    v: "Sellers have had professional representation for a hundred years. In the lower middle market, buyers mostly haven't. That's the gap we exist to close.",
  },
  {
    k: "Judgment doesn't scale — so free it up.",
    v: 'Technology should absorb the analytical grind so the experienced human spends their hours on what only judgment can do: price, risk, and the conversation across the table.',
  },
  {
    k: 'Focus beats breadth.',
    v: 'We advise buyers. Only buyers. One client per target. It makes us less flexible and far more useful.',
  },
  {
    k: "The deal isn't done at close.",
    v: 'Value is made or lost in the first six months after the wire. We built the integration playbook that proves it, and we stay through it.',
  },
];

export default function About() {
  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(50px, 6vw, 90px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div className="pd-badge"><span className="dot" />BUY-SIDE ONLY · FOUNDED 2025</div>
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: '48px 0 0' }}>New firm. Old hands.</h1>
          <div className="pd-sub" style={{ margin: '38px auto 0', maxWidth: 680 }}>
            smbX was built to give buyers in the lower middle market something they've never had —
            a real corporate development function, on demand, on their side of the table.
          </div>
        </div>
      </section>

      {/* ── Why we built it ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Why we built it</div>
        <h2 className="pd-h2" style={{ maxWidth: 820 }}>We spent twenty years as the buyer.</h2>
        <div style={{ marginTop: 28, maxWidth: '46em', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            Inside a platform acquirer and inside a global bank, our founder saw the same imbalance
            over and over. The seller always had someone in their corner — a broker, an advisor, a
            banker working their number. The buyer had a corp-dev team, if they were big enough to
            afford one. And almost nobody in the lower middle market is.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            So the family office doing its first direct deal, the sponsor who has to lock up a
            company before anyone will fund it, the operator buying a competitor — they all end up
            running the biggest transaction of their careers with no one on their side.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            smbX exists to be that team. We launched in 2025 with a simple idea: pair a senior
            dealmaker who has closed 150+ acquisitions with technology that does the analytical
            work a bench of junior bankers used to do — and point the whole thing at one side of
            the table. Yours.
          </div>
        </div>
      </section>

      {/* ── Your advisor ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="pd-firm-grid">
          <div>
            <div className="pd-seclabel">Your advisor</div>
            <h2 className="pd-h2">Paul Baker — Founder</h2>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              <div>
                Paul has spent two decades as a deal captain — the person accountable for a
                transaction from the first conversation to the day it's fully integrated.
              </div>
              <div>
                For nearly a decade he was Director of Corporate Development and M&amp;A Integration
                at <b style={{ color: 'var(--pd-ink)' }}>Wrench Group</b>, where he built the acquisition engine that turned
                four founding companies into one of the largest essential-home-services platforms
                in the country. He sourced and screened thousands of targets, ran the process from
                LOI to definitive agreement, and closed{' '}
                <b style={{ color: 'var(--pd-ink)' }}>36 acquisitions across roughly $2.9 billion in enterprise value</b> —
                then owned the integration playbook that made them work. He sat across from
                founders, brokers, bankers, and private equity sponsors on every one.
              </div>
              <div>
                Before that, at <b style={{ color: 'var(--pd-ink)' }}>JPMorgan Chase's Investment Bank</b>, he led
                acquisition integration on some of the largest deals in modern banking — Bank One,
                Washington Mutual, and Chase Paymentech among them — delivering over $2B in
                synergies, and integrating fintech acquisitions from Neovest to Collegiate Funding
                Services to clearXchange. Earlier, he advised Fortune 500 clients on inorganic
                growth strategy at <b style={{ color: 'var(--pd-ink)' }}>Deloitte Consulting</b>.
              </div>
              <div>
                All told: <b style={{ color: 'var(--pd-ink)' }}>150+ acquisitions, $5B+ in revenue added to the buyers he
                worked for.</b> Always on the buy side. Always the one accountable when the deal had
                to close.
              </div>
              <div>
                He holds a Master of Applied Statistics and a BBA from LeTourneau University, and
                is a certified Lean Six Sigma Black Belt. He works out of Dallas–Fort Worth and
                takes deals nationwide.
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <a className="pd-pill-primary pd-pill-lg" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>
                Talk to Paul — confidential consultation
              </a>
            </div>
          </div>
          <div className="pd-founder-photo">
            <img
              src="/founder-portrait.jpg"
              alt="Paul Baker, founder of smbX"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }}
            />
          </div>
        </div>
      </section>

      {/* ── What we believe ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(80px, 9vw, 130px)', paddingBottom: 'clamp(30px, 4vw, 60px)' }}>
        <div className="pd-seclabel">What we believe</div>
        <div className="pd-drows wide" style={{ marginTop: 36, maxWidth: 1000 }}>
          {BELIEFS.map(b => (
            <div className="pd-drow" key={b.k}>
              <div className="k">{b.k}</div>
              <div className="v">{b.v}</div>
            </div>
          ))}
        </div>
      </section>
    </PracticeShell>
  );
}
