/**
 * Buyer-segment pages — CARTA RESTYLE (2026-08-07, the 1–4 conversion pass).
 * The bundle shipped no reference for these five pages, so they are DERIVED
 * from the Carta system using only grammars the five reference pages already
 * use: centered breadcrumb hero (About) · THE-NUMBER stat block (landing
 * sample read) · dark grid band with plates (About creed / landing proof) ·
 * ruled answer cards (About "Why we built it") · framed numbered register
 * (landing "What separates the 9") · hairline deliverables grid (landing
 * sectors) · light stat strip (Track Record) · centered CTA (Industries).
 *
 * Copy is Paul's reviewed deck via shared/segments.ts, unchanged — including
 * the section headings the old page carried ("The problem", "How smbX
 * answers it", "The heavy lifting, handled. The final judgment, yours.",
 * "How a deal runs for you.", "The deliverables, in your hands."). The one
 * copy correction: the proof strip now carries the SANCTIONED 2026-08-07
 * stat set (150+ · $5B+ · ~$21B · 0 sell-side) — the old page predated it.
 */
import { useEffect, useRef } from 'react';
import { Link, Redirect } from 'wouter';
import PracticeShell, { Handles, Kicker } from './PracticeShell';
import { getSegment } from '@shared/segments';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

function countUp(el: HTMLElement) {
  const orig = el.textContent || '';
  const m = orig.match(/\d[\d,]*/);
  if (!m || !parseInt(m[0].replace(/,/g, ''), 10)) return;
  const target = parseInt(m[0].replace(/,/g, ''), 10);
  const pre = orig.slice(0, m.index), post = orig.slice((m.index ?? 0) + m[0].length);
  const t0 = performance.now(), dur = 1300;
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / dur), e2 = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(target * e2).toLocaleString('en-US') + post;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = orig;
  };
  requestAnimationFrame(tick);
}

export default function SegmentPage({ slug }: { slug: string }) {
  const seg = getSegment(slug);
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = statsRef.current;
    if (!host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!reduce) host.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    }), { threshold: 0.2 });
    io.observe(host);
    return () => io.disconnect();
  }, [slug]);
  if (!seg) return <Redirect to="/" />;
  const [work, practitioner, side] = seg.answers;

  const statNum = { fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(35px, 4.6vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em' } as const;
  const statLabel = { marginTop: 16, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', color: '#7C8187' } as const;
  const lightCell = { background: '#F3F0E9', padding: '38px 28px 34px', textAlign: 'center' } as const;

  return (
    <PracticeShell>
      <main style={{ background: '#FFFFFF', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(52px, 9vw, 150px) clamp(20px, 4vw, 32px) clamp(31px, 6vw, 90px)', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden="true" data-plx="-0.02" style={{ position: 'absolute', left: '7%', top: 70, width: 110, height: 110, backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', right: '8%', top: 130, width: 90, height: 90, backgroundImage: 'radial-gradient(rgba(10,122,88,.22) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <nav data-hs="0" aria-label="Breadcrumb" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: '#7C8187' }}>
            <Link href="/" className="ca-h-deepgreen" style={{ color: '#0A7A58' }}>SMBX</Link>
            <span style={{ margin: '0 10px' }}>/</span>
            <a href="/#who" className="ca-h-deepgreen" style={{ color: '#0A7A58' }}>WHO IT'S FOR</a>
            <span style={{ margin: '0 10px' }}>/</span>
            <span style={{ color: '#16181A' }}>{seg.footerLabel.toUpperCase()}</span>
          </nav>
          <h1 data-hs="1" style={{ margin: '30px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(29px, 4.2vw, 72px)', lineHeight: 1.06, letterSpacing: '-0.015em', textWrap: 'balance' }}>{seg.h1}</h1>
          <p data-hs="2" style={{ margin: '30px auto 0', maxWidth: '37em', fontSize: 18.5, lineHeight: 1.65, color: '#4A4F54' }}>{seg.sub}</p>
          <div data-hs="3" style={{ marginTop: 40, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/#yulia"
              className="ca-h-greenbg"
              style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', background: '#16181A', padding: '15px 26px', borderRadius: 10 }}
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'segment-hero', segment: seg.slug })}
            >
              Build your market map →
            </a>
            <a
              href={bookHref()}
              target={bookTarget()}
              rel={bookRel()}
              className="ca-h-band"
              style={{ fontSize: 16, fontWeight: 500, color: '#16181A', padding: '14px 24px', border: '1.5px solid #16181A', borderRadius: 10 }}
              onClick={() => trackEvent('practice_booking_clicked', { placement: 'segment-hero', segment: seg.slug })}
            >
              Book a call
            </a>
          </div>
          {/* The segment's bind at display scale — the landing's THE-NUMBER
              grammar: mono kicker, serif numeral over a green bar, the
              approved line as its explanation. */}
          <div data-hs="3" style={{ margin: '56px auto 0', maxWidth: '34em' }}>
            <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>THE NUMBER</div>
            <div style={{ marginTop: 10, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(32px, 4vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {seg.stat.n}
              <span style={{ display: 'block', height: 5, width: 76, background: '#0A7A58', margin: '10px auto 0' }} />
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>{seg.stat.l}</p>
          </div>
        </section>

        {/* ══ THE PROBLEM — dark band ══ */}
        <section className="ca-dark" style={{ background: '#181818', color: '#F4F5F1', padding: 'clamp(57px, 10vw, 160px) clamp(20px, 4vw, 32px)', marginTop: 'clamp(31px, 6vw, 100px)', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" data-plx="0.025" style={{ position: 'absolute', top: 44, right: '5%', width: 260, height: 160, backgroundImage: 'radial-gradient(rgba(168,240,206,.18) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative' }}>
            <div data-rv><Kicker dark>THE PROBLEM</Kicker></div>
            <h2 data-rv style={{ margin: '24px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(23px, 3.2vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.012em', maxWidth: '20em', textWrap: 'balance' }}>{seg.painTitle}</h2>
            <div data-rv className="rv-stagger" data-tri style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#2A2E29', border: '1px solid #2A2E29', position: 'relative' }}>
              <Handles color="#F4F5F1" />
              {seg.pains.map(p => (
                <div key={p.name} style={{ background: '#181818', padding: '34px 28px 36px' }}>
                  <div style={{ display: 'table', background: '#22261F', color: '#D7DBD2', fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', padding: '5px 9px' }}>{p.tag}</div>
                  <div style={{ marginTop: 18, fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.25 }}>{p.name}<span style={{ color: '#0A7A58' }}>.</span></div>
                  <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.65, color: '#ABB2AB' }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW SMBX ANSWERS IT ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(57px, 10vw, 170px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>HOW SMBX ANSWERS IT</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.2vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.012em', textWrap: 'balance' }}>The heavy lifting, handled. The final judgment, yours.</h2>
          </div>
          <div data-rv className="rv-stagger" data-tri style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26 }}>
            {[work, practitioner, side].map(a => (
              <div key={a.k} style={{ borderTop: '2px solid #16181A', paddingTop: 22, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -2, left: 0, width: 44, height: 2, background: '#0A7A58' }} />
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.13em', color: '#0A7A58' }}>{a.k.toUpperCase()}</div>
                <p style={{ margin: '14px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#4A4F54' }}>{a.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW A DEAL RUNS FOR YOU ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(57px, 10vw, 170px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>HOW IT WORKS</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.2vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.012em' }}>How a deal runs for you.</h2>
            <p style={{ margin: '24px 0 0', maxWidth: '42em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>{seg.scenarioLede}</p>
          </div>
          <div data-rv style={{ margin: '52px 0 0', maxWidth: 980, position: 'relative', background: '#FFFFFF', border: '1px solid #16181A', padding: '14px 32px 18px' }}>
            <Handles />
            {seg.scenario.map((s, i) => (
              <div key={s.k} data-numrow style={{ display: 'grid', gridTemplateColumns: '44px 200px 1fr', gap: 16, padding: '18px 0', borderBottom: i < seg.scenario.length - 1 ? '1px solid #E4DFD3' : undefined }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: '#7C8187' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{s.k}.</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#4A4F54' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ WHAT YOU WALK AWAY WITH ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(57px, 10vw, 170px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>WHAT YOU WALK AWAY WITH</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.2vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.012em' }}>The deliverables, in your hands.</h2>
          </div>
          <div data-rv className="rv-stagger" data-tri style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#E4DFD3', border: '1px solid #E4DFD3' }}>
            {seg.gets.map((g, i) => (
              <div key={g} style={{ background: '#FFFFFF', padding: '22px 24px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: '#0A7A58', flex: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.45 }}>{g}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ THE PROOF — the record behind every engagement ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(57px, 10vw, 170px) clamp(20px, 4vw, 32px) 0' }}>
          <div ref={statsRef} data-rv className="rv-stagger" data-stats-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#E4DFD3', border: '1px solid #E4DFD3', position: 'relative' }}>
            <Handles />
            <div style={lightCell}>
              <div data-count="150" style={statNum}>150+</div>
              <div style={statLabel}>ACQUISITIONS &amp; INTEGRATIONS</div>
            </div>
            <div style={lightCell}>
              <div data-count="5" style={statNum}>$5B+</div>
              <div style={statLabel}>ENTERPRISE VALUE ADDED</div>
            </div>
            <div style={lightCell}>
              <div data-count="21" style={statNum}>~$21B</div>
              <div style={statLabel}>TRANSACTIONS TOUCHED</div>
            </div>
            <div style={{ background: '#181818', padding: '38px 28px 34px', textAlign: 'center' }}>
              <div style={{ ...statNum, color: '#A8F0CE' }}>0</div>
              <div style={{ margin: '16px auto 0', display: 'table', background: '#0A7A58', color: '#FFFFFF', fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', padding: '5px 9px' }}>SELL-SIDE ENGAGEMENTS. EVER.</div>
            </div>
          </div>
          <p data-rv style={{ margin: '22px 0 0', fontSize: 15, lineHeight: 1.6, color: '#4A4F54' }}>
            The record behind every engagement — <Link href="/track-record" className="ca-h-deepgreen" style={{ color: '#0A7A58', fontWeight: 600, borderBottom: '1px solid #0A7A58', paddingBottom: 2 }}>explore the full deal sheet →</Link>
          </p>
        </section>

        {/* ══ THE ASK ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(57px, 10vw, 170px) clamp(20px, 4vw, 32px) clamp(68px, 12vw, 200px)', textAlign: 'center' }}>
          <div data-rv>
            <h2 style={{ margin: '0 auto', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(26px, 3.8vw, 62px)', lineHeight: 1.08, letterSpacing: '-0.014em', maxWidth: '16em', textWrap: 'balance' }}>{seg.ctaH}</h2>
            <p style={{ margin: '24px auto 0', maxWidth: '38em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>{seg.ctaBody}</p>
            <div style={{ marginTop: 38, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/#yulia"
                className="ca-h-greenbg"
                style={{ fontSize: 16.5, fontWeight: 600, color: '#FFFFFF', background: '#16181A', padding: '16px 28px', borderRadius: 10 }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'segment-cta', segment: seg.slug })}
              >
                Build your market map →
              </a>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-band"
                style={{ fontSize: 16.5, fontWeight: 500, color: '#16181A', padding: '14.5px 26px', border: '1.5px solid #16181A', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'segment-cta', segment: seg.slug })}
              >
                Book a call
              </a>
            </div>
          </div>
        </section>
      </main>
    </PracticeShell>
  );
}
