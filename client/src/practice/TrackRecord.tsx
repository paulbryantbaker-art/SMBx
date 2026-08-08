/**
 * /track-record — CARTA RESTYLE (2026-08-07). Transcribed 1:1 from
 * `design_handoff_smbx_carta_restyle/Track Record - Carta Style.dc.html`.
 *
 * ATTRIBUTION LAW (anonymization REVERSED 2026-08-07 — Paul: "Lets name —
 * i have hidden any deals or other information that is basically not on my
 * resume"). Employers are NAMED: Wrench Group · JPMorgan Chase · Deloitte
 * Consulting. The deal-name lists below are THE CLEARED SET — ported
 * verbatim from the reference, which Paul curated against his résumé. Never
 * merge in names from older versions of this file or any deck/memo; no other
 * source has passed that filter.
 *
 * The standing rules, still binding:
 *  1. Always "led or co-led" — never unqualified "closed".
 *  2. Always "selected transactions" (each register card carries the header).
 *  3. The attribution shield appears WHEREVER the deal names appear — here
 *     it rides in the hero, above the stats, never a footnote.
 *  4. Names, not logos.
 *  5. Never "our clients" for an employment deal.
 *  6. JPMorgan is integration (Director, Acquisition Integration), not
 *     origination.
 * Stat set (sanctioned 2026-08-07): 150+ · $5B+ · ~$21B · 0 sell-side.
 */
import { useEffect, useRef } from 'react';
import PracticeShell, { Handles, Kicker } from './PracticeShell';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

/** The shield — reconciles the stat strip with the register, plainly true. */
export const ATTRIBUTION =
  'Selected transactions led or co-led by Paul Baker in the course of his employment at Wrench Group and at JPMorgan Chase. These transactions were completed by those firms and were not smbx.ai engagements.';

/** Deal-group plate + names row inside a register card. */
function DealGroup({ label, names, first = false }: { label: string; names: string; first?: boolean }) {
  return (
    <div style={first ? undefined : { borderTop: '1px solid #E4DFD3', paddingTop: 18 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', padding: '4px 8px', whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, background: '#FCFAF6', display: 'inline-block' }} />{label}
      </div>
      <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: '#4A4F54' }}>{names}</div>
    </div>
  );
}

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

export default function TrackRecord() {
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
  }, []);

  const statNum = { fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(48px, 4.6vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em' } as const;
  const statLabel = { marginTop: 16, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', color: '#7C8187' } as const;
  const lightCell = { background: '#F3F0E9', padding: '38px 28px 34px', textAlign: 'center' } as const;

  return (
    <PracticeShell>
      <main style={{ background: '#FCFAF6', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(100px, 9vw, 150px) 32px 30px', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden="true" data-plx="-0.02" style={{ position: 'absolute', left: '6%', top: 80, width: 110, height: 110, backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', right: '7%', top: 150, width: 90, height: 90, backgroundImage: 'radial-gradient(rgba(10,122,88,.22) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div data-hs="0"><Kicker center>SELECTED TRANSACTION EXPERIENCE</Kicker></div>
          <h1 data-hs="1" style={{ margin: '28px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(44px, 4.6vw, 78px)', lineHeight: 1.05, letterSpacing: '-0.015em', textWrap: 'balance' }}>More than 150 deals. One side of the table.</h1>
          <p data-hs="2" style={{ margin: '28px auto 0', maxWidth: '34em', fontSize: 18.5, lineHeight: 1.65, color: '#4A4F54' }}>A selection of the acquisitions Paul Baker led or co-led over two decades in corporate development.</p>
          <div data-hs="3" style={{ margin: '30px auto 0', maxWidth: '46em', textAlign: 'left', fontStyle: 'italic', fontSize: 14, lineHeight: 1.65, color: '#7C8187', borderLeft: '2px solid #0A7A58', paddingLeft: 16 }}>{ATTRIBUTION}</div>
        </section>

        {/* ══ STAT STRIP ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: '50px 32px 20px' }}>
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
            <div style={{ background: '#131512', padding: '38px 28px 34px', textAlign: 'center' }}>
              <div style={{ ...statNum, color: '#A8F0CE' }}>0</div>
              <div style={{ margin: '16px auto 0', display: 'table', background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', padding: '5px 9px' }}>SELL-SIDE ENGAGEMENTS. EVER.</div>
            </div>
          </div>
        </section>

        {/* ══ THE AGGREGATOR ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(110px, 10vw, 170px) 32px 0' }}>
          <div data-emp data-rv className="rv-stagger" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 64, alignItems: 'start' }}>
            <div>
              <Kicker>CHAPTER 01</Kicker>
              <h2 style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(28px, 2.6vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.012em' }}>Wrench Group</h2>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: '#0A7A58' }}>2016–2025 · DIRECTOR, CORPORATE DEVELOPMENT &amp; M&amp;A INTEGRATION</div>
              <p style={{ margin: '22px 0 0', fontSize: 16, lineHeight: 1.7, color: '#4A4F54' }}>Recruited to build the M&amp;A pipeline and execution engine for a PE-backed mid-market buy-and-build consolidator. Over nine years Paul led or co-led 36 acquisitions representing roughly $2.9B in enterprise value — then built the integration playbook that made them work.</p>
            </div>
            <div style={{ position: 'relative', border: '1px solid #16181A', background: '#FFFFFF', padding: '28px 32px 30px' }}>
              <Handles />
              <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#7C8187' }}>SELECTED TRANSACTIONS</div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <DealGroup first label="FOUNDING PLATFORMS (2016)" names="Coolray · Berkeys · Abacus · Parker & Sons" />
                <DealGroup label="PLATFORM ADDITIONS" names="Baker Brothers · Plumbline Services · Florida Cool · CoolToday · Donovan Heat & Air · Service Champions North · Williams Comfort Air · Boothe's Heating Air & Plumbing · Morris-Jenkins · Mountain Air · NexGen Air Conditioning & Plumbing · Lindstrom Air Conditioning & Plumbing" />
                <DealGroup label="REGIONAL TUCK-INS" names="Easy A/C · Collins Comfort Masters · Jarboe's · Thomas & Galbraith · Buckeye Heating & Cooling · Maine Home Services · Atlanta Water Works · Superior Service · Ragsdale · F.H. Furr · R.S. Andrews · Haller Enterprises · PlumbRight Services · Climate Zone · Day & Night Air Conditioning · Hometown Plumbing · Koolco Mechanical · Bellows Plumbing Heating & Air · Blanchard & Son Plumbing" />
                <DealGroup label="GREENFIELD" names="Comfort Wave" />
              </div>
            </div>
          </div>
        </section>

        {/* ══ THE BANK ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(100px, 9vw, 160px) 32px 0' }}>
          <div data-emp data-rv className="rv-stagger" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 64, alignItems: 'start' }}>
            <div>
              <Kicker>CHAPTER 02</Kicker>
              <h2 style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(28px, 2.6vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.012em' }}>JPMorgan Chase</h2>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: '#0A7A58' }}>2005–2015 · DIRECTOR, ACQUISITION INTEGRATION</div>
              <p style={{ margin: '22px 0 0', fontSize: 16, lineHeight: 1.7, color: '#4A4F54' }}>Led integration on the bank's largest platform and fintech acquisitions, delivering over $2B in synergies across 100+ stakeholder touchpoints.</p>
            </div>
            <div style={{ position: 'relative', border: '1px solid #16181A', background: '#FFFFFF', padding: '28px 32px 30px' }}>
              <Handles />
              <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#7C8187' }}>SELECTED TRANSACTIONS</div>
              <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: '#4A4F54' }}>Bank One · Washington Mutual · Chase Paymentech (JV and buyout) · Collegiate Funding Services · Sears Canada card portfolio · Neovest · Vastera · Xign · clearXchange · Bloomspot · GoPago</div>
            </div>
          </div>
        </section>

        {/* ══ DELOITTE ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(100px, 9vw, 160px) 32px 0' }}>
          <div data-emp data-rv className="rv-stagger" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 64, alignItems: 'start', borderTop: '1px solid #E4DFD3', paddingTop: 64 }}>
            <div>
              <Kicker>CHAPTER 03</Kicker>
              <h2 style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(28px, 2.6vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.012em' }}>Deloitte Consulting</h2>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: '#0A7A58' }}>2010–2011 · ENGAGEMENT MANAGER, STRATEGY &amp; OPERATIONS</div>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#4A4F54', maxWidth: '44em' }}>Advised Fortune 500 clients on inorganic growth strategy, target operating models, and post-merger integration.</p>
          </div>
        </section>

        {/* ══ CLOSER — dark band ══ */}
        <section className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(130px, 11vw, 180px) 32px', marginTop: 'clamp(110px, 10vw, 170px)', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', left: '6%', bottom: 36, width: 280, height: 160, backgroundImage: 'radial-gradient(rgba(168,240,206,.18) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <p data-rv style={{ margin: '0 auto', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(36px, 4vw, 64px)', lineHeight: 1.12, letterSpacing: '-0.014em', textWrap: 'balance' }}>Every transaction above was done for a buyer. That hasn't&nbsp;changed.</p>
            <div data-rv style={{ marginTop: 40 }}>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-mintbg"
                style={{ display: 'inline-block', fontSize: 17, fontWeight: 600, color: '#16181A', background: '#FCFAF6', padding: '16px 30px', borderRadius: 10, whiteSpace: 'nowrap' }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'track-record' })}
              >
                Book a confidential call
              </a>
            </div>
          </div>
        </section>
      </main>
    </PracticeShell>
  );
}
