/**
 * /about — "New firm. Old hands." (Paul's copy additions, 2026-07-11).
 * Why we built it → Your advisor (Paul Baker bio + portrait) → What we believe.
 */
import PracticeShell, { PageCrumb } from './PracticeShell';
import Mark from './Mark';
import { Swoosh } from './atmo';
import { bookHref, bookTarget } from './leads';
import { AttributionLine } from './TrackRecord';

const BELIEFS = [
  {
    n: 'I',
    k: 'The buyer deserves a corner',
    v: "Sellers have had professional representation for a hundred years. In the lower middle market, buyers mostly haven't. That's the gap we exist to close.",
  },
  {
    n: 'II',
    k: 'Coverage wins',
    v: 'The best target is usually not for sale. You find it by covering the whole market — every operator in the segment, not just the companies being shown around.',
  },
  {
    n: 'III',
    k: 'Focus beats breadth',
    v: 'We advise buyers. Only buyers. One client per target. It makes us less flexible and far more useful.',
  },
  {
    n: 'IV',
    k: "The deal isn't done at close",
    v: 'Value is made or lost in the first six months after the wire. We built the integration playbook that proves it, and we stay through it.',
  },
];

export default function About() {
  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(50px, 6vw, 90px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <PageCrumb parent={{ label: 'smbX', href: '/' }} here="About" />
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: 0 }}>A new firm. Decades of execution.</h1>
          <div className="pd-sub" style={{ margin: '38px auto 0', maxWidth: 680 }}>
            <Mark /> was built to give buyers in the lower middle market something they have
            rarely had access to — a dedicated corporate development function, on demand,
            exclusively on their side of the table.
          </div>
        </div>
      </section>

      {/* ── Why we built it — three points, not three paragraphs (Paul,
             2026-08-01: "bigger bullets, less paragraphs, just the
             highlights"). The argument was always three beats; it was just
             buried in prose. ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Why we built it</div>
        <h2 className="pd-h2">We spent two decades as the buyer.</h2>
        <div className="pd-points tri">
          <div className="pd-point">
            <div className="lead">The seller always has someone.</div>
            <p>Sellers have had professional representation for a hundred years — a broker, an advisor, a banker working their number.</p>
          </div>
          <div className="pd-point">
            <div className="lead">The buyer usually doesn't.</div>
            <p>A corporate development team is a luxury of scale. Almost nobody in the lower middle market has one, so the biggest transaction of a career gets run with no one on that side of the table.</p>
          </div>
          <div className="pd-point">
            <div className="lead">So we became that team.</div>
            <p>Sourcing, evaluation, negotiation, integration — a complete corp-dev function, led by senior dealmakers, pointed at one side of the table. Yours.</p>
          </div>
        </div>
      </section>

      {/* ── Your advisor — the record as a register, not a résumé paragraph.
             Employer anonymization is LAW (CLAUDE.md, 2026-07-18): "a global
             investment bank" and "a world-class PE-backed aggregator", never
             the names. Deloitte may stay named. "led or co-led", never
             "closed". The total is 150, with no plus. ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="pd-lede">
          <div>
            <div className="pd-seclabel">Firm leadership</div>
            <h2 className="pd-h2">Paul Baker — Founder</h2>
            <div className="pd-founder-photo" style={{ marginTop: 'clamp(28px, 3vw, 40px)' }}>
              <img
                src="/founder-portrait.jpg"
                alt="Paul Baker, founder of smbX"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }}
              />
            </div>
          </div>
          <div>
            <p className="pd-sub" style={{ margin: 0, maxWidth: '26em' }}>
              Two decades as a deal captain — the person accountable for a transaction from
              the first conversation to the day it is fully integrated.
            </p>

            <div className="pd-record">
              <div className="pd-rec">
                <div className="fig">36</div>
                <div className="txt">
                  <b>acquisitions, ~$2.9B enterprise value.</b> Led or co-led as Director of
                  Corporate Development and M&amp;A Integration at a world-class PE-backed
                  aggregator — the engine that turned four founding companies into a national
                  home-services platform.
                </div>
              </div>
              <div className="pd-rec">
                <div className="fig">$2B+</div>
                <div className="txt">
                  <b>in synergies delivered.</b> Acquisition integration at a global investment
                  bank, on some of the largest deals in modern banking.
                </div>
              </div>
              <div className="pd-rec">
                <div className="fig">150</div>
                <div className="txt">
                  <b>acquisitions all told, $5B+ in revenue added</b> to the buyers he worked
                  for. Always the buy side.
                </div>
              </div>
            </div>

            <p className="pd-body-sm" style={{ marginTop: 26 }}>
              Earlier, inorganic growth strategy for Fortune&nbsp;500 clients at Deloitte
              Consulting. Master of Applied Statistics and a BBA from LeTourneau University;
              certified Lean Six Sigma Black Belt. Based in Dallas–Fort Worth, deals nationwide.
            </p>

            <AttributionLine style={{ marginTop: 26 }} />
          </div>
        </div>
      </section>

      {/* ── What we believe — the creed, the page's one dark movement ── */}
      <div style={{ marginTop: 'clamp(72px, 8vw, 118px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-creed">
        <span className="pd-spark" aria-hidden="true" />
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">What we believe</div>
          <h2 className="pd-h2" data-rv>Four convictions run the practice.</h2>
          <div className="pd-creed rv-stagger" data-rv>
            {BELIEFS.map(b => (
              <div className="pd-tenet" key={b.k}>
                <div className="gn" aria-hidden="true">{b.n}</div>
                <h3 className="k">{b.k}<span className="fs">.</span></h3>
                <p className="v">{b.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Swoosh dir="up" />

      {/* ── The close (2026-08-01, Paul: "the green bleed band is still right
             next to the bottom footer… too weighted at the bottom").
             The page used to end on the creed band, and the only thing between
             it and the deep-green footer was `.pd-footer`'s top margin — ~460px
             of EMPTY bone. Two green masses with a hole between them, which is
             what read as bottom-heavy; the gap was never a breath because
             nothing was in it.
             The landing does not have this problem because its booking card
             sits in exactly that position. So About gets the same close — and
             it also fixes the CTA, which was buried mid-page inside the founder
             block where a visitor reaches it before the argument is made. ── */}
      <section className="pd-section" id="cta">
        <div className="pd-wrap">
          <div className="pd-cta-grid">
            <div>
              <h2 className="pd-cta-h">Start with a confidential conversation.</h2>
              <p className="pd-body" style={{ marginTop: 22 }}>
                Thirty minutes with the person who will run your deal. Your ideas, our read on
                the market, and a straight answer on whether we're the right team for it.
              </p>
            </div>
            <div className="pd-form">
              <div className="t">Book 30 minutes</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--pd-body)' }}>
                A personal conversation, not a sales call. Come with your ideas — you don't need
                a finished thesis. Building one together is part of the work.
              </p>
              <div style={{ marginTop: 18, fontFamily: 'var(--pd-mono)', fontSize: 13, letterSpacing: '0.06em', color: 'var(--pd-tert)' }}>
                30 MIN · VIDEO CALL · CONFIDENTIAL
              </div>
              <a
                className="pd-pill-primary"
                href={bookHref()}
                target={bookTarget()}
                rel={bookTarget() ? 'noopener noreferrer' : undefined}
                style={{ marginTop: 24, display: 'flex', justifyContent: 'center', padding: '15px 26px' }}
              >
                Pick a time →
              </a>
              <p className="pd-caption" style={{ marginTop: 14 }}>
                Scheduling opens in Google Calendar. No lists sold, no sellers represented.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
