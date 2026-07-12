/**
 * /track-record — "About 150 deals. One side of the table." (Paul's copy
 * additions, 2026-07-11). Stat strip → Wrench Group tombstones → JPMorgan
 * Chase → Deloitte → CTA. Role precision is load-bearing: deal captain at
 * Wrench, integration lead at JPMC — do not blur.
 */
import PracticeShell from './PracticeShell';
import { bookHref, bookTarget } from './leads';

export default function TrackRecord() {
  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(40px, 5vw, 70px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div className="pd-badge"><span className="dot" />SELECTED TRANSACTIONS</div>
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: '48px 0 0' }}>About 150 deals. One side of the table.</h1>
          <div className="pd-sub" style={{ margin: '38px auto 0', maxWidth: 660 }}>
            A selection of the acquisitions our founder captained — sourced, negotiated, closed,
            and integrated — before smbX.
          </div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="pd-wrap">
        <div className="pd-stats" style={{ marginTop: 0 }}>
          <div className="pd-stat"><div className="n">150+</div><div className="l">acquisitions closed</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">revenue added</div></div>
          <div className="pd-stat"><div className="n">~$21B</div><div className="l">in transaction value touched</div></div>
          <div className="pd-stat"><div className="n">20</div><div className="l">years on the buy side</div></div>
        </div>
      </section>

      {/* ── Wrench Group ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Wrench Group — building a national platform</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2016–2025 · DIRECTOR, CORPORATE DEVELOPMENT &amp; M&amp;A INTEGRATION</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Recruited to build the M&amp;A engine for a new essential-services platform. Over nine
          years: four founding companies, 36 acquisitions, roughly $2.9B in enterprise value, and a
          national footprint — with Paul as deal captain on every one.
        </div>
        <div className="pd-tombs">
          <div className="pd-tomb">
            <div className="names">
              <span className="grp">Founding platforms (2016):</span> Coolray · Parker &amp; Sons · Abacus · Berkeys
            </div>
          </div>
          <div className="pd-tomb">
            <div className="names">
              <span className="grp">Platform additions:</span> Morris-Jenkins · NexGen Air · Service Champions ·
              Williams Comfort Air · CoolToday · Lindstrom · Baker Brothers · Boothe's · Mountain
              Air · Plumbline Services · Florida Cool · Donovan Heat &amp; Air
            </div>
          </div>
          <div className="pd-tomb">
            <div className="names">
              <span className="grp">Regional tuck-ins:</span> Ragsdale · F.H. Furr · R.S. Andrews · Haller · Thomas
              &amp; Galbraith · Jarboe's · Buckeye · Easy A/C · Collins Comfort Masters · Bellows ·
              Day &amp; Night · Climate Zone · Koolco · Superior Service · Atlanta Water Works · Maine
              Home Services · PlumbRight · Hometown Plumbing · Blanchard &amp; Son
            </div>
          </div>
          <div className="pd-tomb">
            <div className="names">
              <span className="grp">Greenfield:</span> Comfort Wave
            </div>
          </div>
        </div>
      </section>

      {/* ── JPMorgan Chase ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">JPMorgan Chase — integration at scale</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2005–2015 · DIRECTOR, ACQUISITION INTEGRATION</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Led integration on the bank's largest platform and fintech acquisitions, delivering $2B+
          in synergies across 100+ stakeholder touchpoints.
        </div>
        <div style={{ marginTop: 22, fontSize: 15, lineHeight: 1.9, color: 'var(--pd-ink)', maxWidth: '52em' }}>
          <span style={{ color: 'var(--pd-tert)', fontStyle: 'italic' }}>Selected:</span> Bank One · Washington Mutual ·
          Chase Paymentech (JV and buyout) · Collegiate Funding Services · Sears Canada card
          portfolio · Neovest · Vastera · Xign · clearXchange · Bloomspot · GoPago
        </div>
      </section>

      {/* ── Deloitte ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Deloitte Consulting</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2010–2011 · ENGAGEMENT MANAGER, STRATEGY &amp; OPERATIONS</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Advised Fortune 500 clients on inorganic growth strategy, target operating models, and
          post-merger integration.
        </div>
      </section>

      {/* ── Closer ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)', paddingBottom: 'clamp(30px, 4vw, 60px)', textAlign: 'center' }}>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Every deal above was done for a buyer. That hasn't changed.
        </div>
        <div style={{ marginTop: 32 }}>
          <a className="pd-pill-primary pd-pill-lg" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>
            Confidential consultation
          </a>
        </div>
      </section>
    </PracticeShell>
  );
}
