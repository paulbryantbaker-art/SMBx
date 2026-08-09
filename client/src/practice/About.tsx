/**
 * About — CARTA RESTYLE (2026-08-07). Transcribed 1:1 from
 * `design_handoff_smbx_carta_restyle/About - Carta Style.dc.html`.
 * Structure: breadcrumb hero · Why we built it (three ruled cards) · What we
 * believe (dark creed band, four convictions) · Firm leadership (framed
 * portrait, stat trio, tenure rows, attribution shield) · CTA card.
 *
 * ATTRIBUTION LAW (2026-08-07, naming REVERSED): employers are NAMED —
 * Wrench Group · JPMorgan Chase · Deloitte Consulting — and the stat set is
 * the sanctioned one (150+ · $5B+ · $2B synergies). The italic shield line
 * rides directly under the tenure rows, verbatim from the reference. Do not
 * merge in deal names or figures from any other source.
 */
import PracticeShell, { Handles, Kicker } from './PracticeShell';
import { Link } from 'wouter';
import { bookHref, bookTarget, bookRel, LINKEDIN_URL } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

const WHY_BUILT = [
  { no: '01', t: 'The seller always has someone.', b: 'Sellers have had professional representation for a hundred years — a broker, an advisor, a banker working their number.' },
  { no: '02', t: "The buyer usually doesn't.", b: 'A corporate development team is a luxury of scale. Almost nobody in the lower middle market has one, so the biggest transaction of a career gets run with no one on that side of the table.' },
  { no: '03', t: 'So we became that team.', b: 'Sourcing, evaluation, negotiation, integration — a complete corp-dev function, led by senior dealmakers, pointed at one side of the table. Yours.' },
];

const CREED = [
  { n: 'I', t: 'The buyer deserves a corner', b: "Sellers have had professional representation for a hundred years. In the lower middle market, buyers mostly haven't. That's the gap we exist to close." },
  { n: 'II', t: 'Coverage wins', b: 'The best target is usually not for sale. You find it by covering the whole market — every operator in the segment, not just the companies being shown around.' },
  { n: 'III', t: 'Focus beats breadth', b: 'We advise buyers. Only buyers. One client per target. It makes us less flexible and far more useful.' },
  { n: 'IV', t: "The deal isn't done at close", b: 'Value is made or lost in the first six months after the wire. We built the integration playbook that proves it, and we stay through it.' },
];

export default function About() {
  return (
    <PracticeShell>
      <main style={{ background: '#FCFAF6', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(52px, 9vw, 150px) clamp(20px, 4vw, 32px) clamp(31px, 6vw, 90px)', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden="true" data-plx="-0.02" style={{ position: 'absolute', left: '7%', top: 70, width: 110, height: 110, backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', right: '8%', top: 130, width: 90, height: 90, backgroundImage: 'radial-gradient(rgba(10,122,88,.22) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <nav data-hs="0" aria-label="Breadcrumb" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: '#7C8187' }}>
            <Link href="/" className="ca-h-deepgreen" style={{ color: '#0A7A58' }}>SMBX</Link>
            <span style={{ margin: '0 10px' }}>/</span>
            <span style={{ color: '#16181A' }}>ABOUT</span>
          </nav>
          <h1 data-hs="1" style={{ margin: '30px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(32px, 4.6vw, 78px)', lineHeight: 1.05, letterSpacing: '-0.015em', textWrap: 'balance' }}>A new firm. Decades of execution.</h1>
          <p data-hs="2" style={{ margin: '32px auto 0', maxWidth: '37em', fontSize: 18.5, lineHeight: 1.65, color: '#4A4F54' }}>smb<span style={{ color: '#0A7A58' }}>x</span>.ai was built to give buyers in the lower middle market something they have rarely had access to — a dedicated corporate development function, on demand, exclusively on their side of the table.</p>
        </section>

        {/* ══ WHY WE BUILT IT ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(52px, 9vw, 150px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv>
            <Kicker>WHY WE BUILT IT</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.2vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.012em' }}>Over two decades as a buyer and integrator.</h2>
          </div>
          <div data-rv className="rv-stagger" data-tri style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26 }}>
            {WHY_BUILT.map(c => (
              <div key={c.no} style={{ borderTop: '2px solid #16181A', paddingTop: 22, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -2, left: 0, width: 44, height: 2, background: '#0A7A58' }} />
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: '#7C8187' }}>{c.no}</div>
                <div style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 600, fontSize: 24, lineHeight: 1.2 }}>{c.t}</div>
                <p style={{ margin: '14px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#4A4F54' }}>{c.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ WHAT WE BELIEVE — dark band ══ */}
        <section className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(62px, 10vw, 170px) clamp(20px, 4vw, 32px)', marginTop: 'clamp(52px, 9vw, 160px)', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" data-plx="0.025" style={{ position: 'absolute', top: 44, right: '5%', width: 260, height: 160, backgroundImage: 'radial-gradient(rgba(168,240,206,.18) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative' }}>
            <div data-rv><Kicker dark>WHAT WE BELIEVE</Kicker></div>
            <h2 data-rv style={{ margin: '24px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.4vw, 56px)', lineHeight: 1.1, letterSpacing: '-0.012em' }}>Four convictions run the practice.</h2>
            <div data-rv className="rv-stagger" data-creed style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#2A2E29', border: '1px solid #2A2E29', position: 'relative' }}>
              <Handles color="#F4F5F1" />
              {CREED.map(c => (
                <div key={c.n} style={{ background: '#131512', padding: '34px 28px 36px' }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 550, fontSize: 44, lineHeight: 1, color: '#A8F0CE' }}>{c.n}</div>
                  <div style={{ marginTop: 18, fontFamily: SERIF, fontWeight: 600, fontSize: 21, lineHeight: 1.25 }}>{c.t}<span style={{ color: '#0A7A58' }}>.</span></div>
                  <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.65, color: '#ABB2AB' }}>{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FIRM LEADERSHIP ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(62px, 11vw, 180px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-lede style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 72, alignItems: 'start' }}>
            <div data-rv>
              <Kicker>FIRM LEADERSHIP</Kicker>
              <h2 style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(22px, 2.8vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.012em' }}>Paul Baker — Founder</h2>
              <div style={{ marginTop: 32, position: 'relative', width: '100%', maxWidth: 360 }}>
                <img data-rvimg src="/founder-portrait.jpg" alt="Paul Baker, founder of smbX" style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 32%' }} />
                <Handles />
                <span style={{ position: 'absolute', left: 12, bottom: 12, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', padding: '5px 9px', whiteSpace: 'nowrap' }}>
                  <span style={{ width: 7, height: 7, background: '#FCFAF6', display: 'inline-block' }} />FOUNDER
                </span>
              </div>
              {/* The one outbound personal link on the site (Paul, 2026-08-08).
                  It sits under the portrait rather than in the bio column
                  because this block IS the identity — name, face, and where to
                  find him. Tracking param stripped from the URL he sent: a
                  `utm_source=share` on a link we publish would attribute our
                  own site's traffic to whatever share sheet he copied it
                  from. */}
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ca-h-deepgreen"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 22, fontSize: 15.5, fontWeight: 600, color: '#0A7A58', borderBottom: '1.5px solid #0A7A58', paddingBottom: 3 }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'about-linkedin' })}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}>
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0" />
                </svg>
                Connect on LinkedIn
              </a>
            </div>
            <div data-rv>
              <p style={{ margin: '6px 0 0', fontSize: 19, lineHeight: 1.6, color: '#16181A', fontWeight: 500, maxWidth: '26em' }}>Two decades as a deal captain — the person accountable for a transaction from the first conversation to the day it is fully integrated.</p>
              <div data-g3 style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, borderTop: '1px solid #E4DFD3', paddingTop: 28 }}>
                {[['150+', 'ACQUISITIONS & INTEGRATIONS'], ['$5B+', 'ENTERPRISE VALUE ADDED'], ['$2B', 'SYNERGIES CAPTURED']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(29px, 3.4vw, 58px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {n}<span style={{ display: 'block', height: 4, width: 52, background: '#0A7A58', marginTop: 10 }} />
                    </div>
                    <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', color: '#7C8187' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column' }}>
                <div data-deflist style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 28, alignItems: 'baseline', padding: '22px 0', borderTop: '1px solid #E4DFD3' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', color: '#0A7A58' }}>10 YEARS</div>
                  <div style={{ fontSize: 15.5, lineHeight: 1.65, color: '#4A4F54' }}><strong style={{ color: '#16181A' }}>Wrench Group</strong> — PE-backed mid-market buy-and-build consolidator.</div>
                </div>
                <div data-deflist style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 28, alignItems: 'baseline', padding: '22px 0', borderTop: '1px solid #E4DFD3', borderBottom: '1px solid #E4DFD3' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', color: '#0A7A58' }}>10 YEARS</div>
                  <div style={{ fontSize: 15.5, lineHeight: 1.65, color: '#4A4F54' }}><strong style={{ color: '#16181A' }}>JPMorgan Chase</strong> — Mega-cap integration and value capture.</div>
                </div>
              </div>
              <p style={{ margin: '28px 0 0', fontSize: 14.5, lineHeight: 1.65, color: '#4A4F54' }}>Earlier, inorganic growth strategy for Fortune&nbsp;500 clients at Deloitte Consulting. Master of Applied Statistics and a BBA from LeTourneau University; certified Lean Six Sigma Black Belt. Based in Dallas–Fort Worth, deals nationwide.</p>
              <div style={{ marginTop: 28, fontStyle: 'italic', fontSize: 14, lineHeight: 1.65, color: '#7C8187', maxWidth: '48em', borderLeft: '2px solid #0A7A58', paddingLeft: 16 }}>Selected transactions led or co-led by Paul Baker in the course of his employment at Wrench Group and at JPMorgan Chase. These transactions were completed by those firms and were not smbx.ai engagements.</div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section id="cta" style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(62px, 11vw, 180px) clamp(20px, 4vw, 32px) clamp(68px, 12vw, 200px)' }}>
          <div data-cta-grid style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 64, alignItems: 'center' }}>
            <div data-rv>
              <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(27px, 4.2vw, 68px)', lineHeight: 1.06, letterSpacing: '-0.015em', textWrap: 'balance' }}>Start with a confidential conversation.</h2>
              <p style={{ margin: '24px 0 0', maxWidth: '30em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>Thirty minutes with the person who will run your deal. Your ideas, our read on the market, and a straight answer on whether we're the right team for it.</p>
            </div>
            <div data-rv style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #16181A', padding: '32px 34px' }}>
              <Handles />
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 26 }}>Book 30 minutes</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: '#4A4F54' }}>A personal conversation, not a sales call. Come with your ideas — you don't need a finished thesis. Building one together is part of the work.</p>
              <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: '#7C8187' }}>30 MIN · VIDEO CALL · CONFIDENTIAL</div>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-greenbg"
                style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 16, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '15px 26px', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'about-cta' })}
              >
                Pick a time →
              </a>
              <p style={{ margin: '14px 0 0', fontSize: 12.5, color: '#7C8187', textAlign: 'center' }}>Scheduling opens in Google Calendar. No lists sold, no sellers represented.</p>
            </div>
          </div>
        </section>
      </main>
    </PracticeShell>
  );
}
