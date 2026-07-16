/**
 * Buyer-segment pages, recomposed (Paul, 2026-07-13: "re-imagined, laid out
 * better, more engaging, tell a better story"). The arc all five inherit:
 * recognition (asymmetric hero — the segment's bind distilled into a ghost
 * numeral) → the bind (the one dark movement: three pressures under the
 * pain title, mesh in the empty corner) → the turn (askew: the work and the
 * practitioner as definition rows, the loyalty answer offset in the
 * near-black card) → the proof (the record strip these pages never
 * carried) → the ask (dark close). Copy is Paul's reviewed deck, unchanged;
 * each hero stat restates an approved line at display scale.
 */
import { Link, Redirect } from 'wouter';
import PracticeShell, { PageCrumb } from './PracticeShell';
import { getSegment } from './segmentData';
import { Swoosh } from './atmo';

export default function SegmentPage({ slug }: { slug: string }) {
  const seg = getSegment(slug);
  if (!seg) return <Redirect to="/" />;
  const [work, practitioner, side] = seg.answers;

  return (
    <PracticeShell>
      {/* ── Hero — centered, matching every other page (the old off-axis ghost
             numeral was decorative and read as meaningless; removed) ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(56px, 7vw, 110px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <PageCrumb parent={{ label: "Who it's for", href: '/#who' }} here={seg.footerLabel} />
          <h1 className="pd-h1" style={{ margin: '0 auto' }}>{seg.h1}</h1>
          <div className="pd-sub" style={{ margin: '30px auto 0', maxWidth: '36em' }}>{seg.sub}</div>
          <div style={{ marginTop: 44, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="pd-pill-primary pd-pill-lg" href="/#yulia">Build your market map →</a>
            <a className="pd-pill pd-pill-lg-quiet" href="/#cta">Book a call</a>
          </div>
        </div>
      </section>

      {/* ── The bind — the one dark movement before the close ── */}
      <div style={{ marginTop: 'clamp(24px, 3vw, 52px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-side">
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">The problem</div>
          <h2 className="pd-h2" data-rv>{seg.painTitle}</h2>
          <div className="pd-paingrid rv-stagger" data-rv>
            {seg.pains.map(p => (
              <div className="pd-paincol" key={p.name}>
                <div className="tag">{p.tag}</div>
                <div className="nm">{p.name}</div>
                <div className="bd">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Swoosh dir="up" />

      {/* ── The turn — the answers, askew; loyalty carries the offset card ── */}
      <section className="pd-wrap pd-section pd-accent al">
        <div className="pd-seclabel">How smbX answers it</div>
        <div className="pd-askew rv-stagger" data-rv>
          <div>
            <h2 className="pd-h2">The heavy lifting, handled. The final judgment, yours.</h2>
            <div className="pd-drows" style={{ marginTop: 48 }}>
              <div className="pd-drow">
                <div className="k">{work.k}</div>
                <div className="v">{work.v}</div>
              </div>
              <div className="pd-drow">
                <div className="k">{practitioner.k}</div>
                <div className="v">{practitioner.v}</div>
              </div>
            </div>
          </div>
          <div className="off">
            <div className="pd-anchorcard" style={{ marginTop: 0 }}>
              <div className="k">{side.k}</div>
              <div className="b">{side.v}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How a deal runs for you — the engagement, tailored to this buyer ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-sechead" data-rv>
          <div className="pd-seclabel">How it works</div>
          <h2 className="pd-h2">How a deal runs for you.</h2>
          <p className="pd-sub">{seg.scenarioLede}</p>
        </div>
        <div className="pd-index rv-stagger" data-rv>
          {seg.scenario.map((s, i) => (
            <div className="pd-indexrow" key={s.k}>
              <div className="no">{String(i + 1).padStart(2, '0')}</div>
              <div className="t">{s.k}</div>
              <div className="b">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you walk away with — the deliverables ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-sechead" data-rv>
          <div className="pd-seclabel">What you walk away with</div>
          <h2 className="pd-h2">The deliverables, in your hands.</h2>
        </div>
        <div className="pd-gets rv-stagger" data-rv>
          {seg.gets.map(g => (
            <div className="pd-get" key={g}>
              <div className="mk" aria-hidden="true">→</div>
              <div className="t">{g}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The proof — the record behind every engagement ── */}
      <section className="pd-wrap" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="pd-statband">
          <div className="pd-stats rv-stagger" data-rv>
            <div className="pd-stat"><div className="n">150+</div><div className="l">Acquisitions closed</div></div>
            <div className="pd-stat"><div className="n">$5B+</div><div className="l">In revenue added to buyers</div></div>
            <div className="pd-stat"><div className="n">20</div><div className="l">Years of buy-side execution</div></div>
            <div className="pd-stat accent"><div className="n">1</div><div className="l">Side of the table — always the buyer's</div></div>
          </div>
        </div>
        <div data-rv className="pd-body-sm" style={{ marginTop: 22 }}>
          The record behind every engagement — <Link href="/track-record" className="pd-link">explore the full deal sheet →</Link>
        </div>
      </section>

      {/* ── The ask — dark close ── */}
      <div style={{ marginTop: 'clamp(80px, 9vw, 140px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-cta">
        <span className="pd-spark" aria-hidden="true" />
        <div className="pd-wrap pd-dark-pad">
          <h2 className="pd-cta-h" data-rv style={{ maxWidth: 640 }}>{seg.ctaH}</h2>
          <div data-rv className="pd-body" style={{ marginTop: 22, maxWidth: 520 }}>
            {seg.ctaBody}
          </div>
          <div data-rv style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a className="pd-pill-primary pd-pill-lg" href="/#yulia">Build your market map →</a>
            <a className="pd-pill pd-pill-lg-quiet" href="/#cta">Book a call</a>
          </div>
        </div>
      </section>
      <Swoosh dir="up" />
    </PracticeShell>
  );
}
