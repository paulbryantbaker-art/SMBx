/**
 * Buyer-segment page template (Paul's reworked deck, 2026-07-11): hero
 * (H1 hook + sub + Yulia CTA) → their specific pain (ledger-style rows) →
 * how smbX answers it (The work / The practitioner / Your side) → final CTA.
 * The repeated pledge strip is gone — the loyalty point is made once, warmly,
 * in "Your side." Chat lives on the landing, so CTAs anchor to /#yulia, /#book.
 */
import PracticeShell from './PracticeShell';
import { getSegment } from './segmentData';
import { Redirect } from 'wouter';

export default function SegmentPage({ slug }: { slug: string }) {
  const seg = getSegment(slug);
  if (!seg) return <Redirect to="/" />;

  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(60px, 7vw, 100px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: 0 }}>{seg.h1}</h1>
          <div className="pd-sub" style={{ margin: '38px auto 0', maxWidth: 660 }}>{seg.sub}</div>
          <div style={{ marginTop: 48, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="pd-pill-primary pd-pill-lg" href="/#yulia">Talk to Yulia →</a>
            <a className="pd-pill pd-pill-lg-quiet" href="/#book">Book a call</a>
          </div>
        </div>
      </section>

      {/* ── The pain ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-ledger-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64 }}>
          <h2 className="pd-h2" style={{ maxWidth: 860 }}>{seg.painTitle}</h2>
          <div className="pd-seclabel right">The problem</div>
        </div>
        <div className="pd-ledger">
          {seg.pains.map(p => (
            <div className="pd-lrow" key={p.name}>
              <div className="pd-lname">{p.name}</div>
              <div className="pd-lbody">{p.body}</div>
              <div className="pd-ltag">{p.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How smbX answers it ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="pd-seclabel">How smbX answers it</div>
        <h2 className="pd-h2" style={{ maxWidth: 780 }}>The grind, handled. The judgment, yours.</h2>
        <div className="pd-drows" style={{ marginTop: 56, maxWidth: 900 }}>
          {seg.answers.map(a => (
            <div className="pd-drow" key={a.k}>
              <div className="k">{a.k}</div>
              <div className="v">{a.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pd-wrap" style={{ paddingTop: 'clamp(80px, 9vw, 130px)', paddingBottom: 'clamp(30px, 4vw, 60px)', textAlign: 'center' }}>
        <h2 className="pd-cta-h" style={{ maxWidth: '16ch', margin: '0 auto' }}>Ready to start looking?</h2>
        <div style={{ margin: '24px auto 0', fontSize: 18, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: 480 }}>
          Two minutes with Yulia and your market map is underway. No retainer to find out if we're a fit.
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="pd-pill-primary pd-pill-lg" href="/#yulia">Start with Yulia →</a>
          <a className="pd-pill pd-pill-lg-quiet" href="/#book">Book a call</a>
        </div>
      </section>
    </PracticeShell>
  );
}
