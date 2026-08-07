/**
 * /research — CARTA RESTYLE (2026-08-07). Transcribed 1:1 from
 * `design_handoff_smbx_carta_restyle/Research - Carta Style.dc.html`.
 * Structure: hero (PUBLISHED ASSESSMENTS · Research · sub) · facet rows
 * (industry/metro mono chips) · the shelf (framed cards: kicker chip + date,
 * serif title, abstract, ink CTA + mono meta; dark cover panel with the mint
 * dot field) · dark CTA band.
 *
 * Real machinery: cards read REPORT_LIST (shared/reports.ts joined to the
 * build-time markdown meta) — newest first — and link to /research/:slug.
 * The reference's meta line said only "PDF AVAILABLE"; the real register
 * knows the read time, so the card keeps stating it (a 37-minute document
 * should say so before someone commits to it). Facet chips render only once
 * a facet has two or more values — a filter with one option is furniture.
 */
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import PracticeShell, { Handles } from './PracticeShell';
import { REPORT_LIST } from './reports/registry';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const ALL = 'All';

function facetValues(pick: (r: (typeof REPORT_LIST)[number]) => string): string[] {
  return [...new Set(REPORT_LIST.map(pick))];
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{
        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 11.5,
        letterSpacing: '0.06em', padding: '8px 12px', textTransform: 'uppercase',
        border: `1px solid ${on ? '#0A7A58' : '#D8D3C6'}`,
        background: on ? '#0A7A58' : '#FFFFFF',
        color: on ? '#FCFAF6' : '#16181A',
      }}
    >
      {label}
    </button>
  );
}

export default function ReportsIndex() {
  const [industry, setIndustry] = useState(ALL);
  const [metro, setMetro] = useState(ALL);

  const industries = useMemo(() => facetValues(r => r.industry), []);
  const metros = useMemo(() => facetValues(r => r.metro), []);

  // Newest first — the shelf leads with the latest assessment. localeCompare
  // returns 0 on a published-date tie, so the sort stays STABLE and tied
  // reports keep their register order (the previous never-zero comparator
  // let V8 flip the August 2026 pair).
  const list = useMemo(
    () => [...REPORT_LIST].sort((a, b) => b.published.localeCompare(a.published)),
    [],
  );
  const shown = list.filter(
    r => (industry === ALL || r.industry === industry) && (metro === ALL || r.metro === metro),
  );

  const pickIndustry = (v: string) => {
    setIndustry(v);
    trackEvent('report_filter_changed', { facet: 'industry', value: v });
  };
  const pickMetro = (v: string) => {
    setMetro(v);
    trackEvent('report_filter_changed', { facet: 'metro', value: v });
  };

  return (
    <PracticeShell>
      <main style={{ background: '#FCFAF6', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(100px, 9vw, 150px) 32px 20px', position: 'relative' }}>
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', right: '7%', top: 80, width: 130, height: 130, backgroundImage: 'radial-gradient(rgba(10,122,88,.2) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div data-hs="0" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, background: '#0A7A58' }} />
            <span style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.16em', color: '#7C8187' }}>PUBLISHED ASSESSMENTS</span>
          </div>
          <h1 data-hs="1" style={{ margin: '24px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(44px, 4.6vw, 78px)', lineHeight: 1.05, letterSpacing: '-0.015em' }}>Research</h1>
          <p data-hs="2" style={{ margin: '24px 0 0', maxWidth: '40em', fontSize: 18.5, lineHeight: 1.65, color: '#4A4F54' }}>The market assessments we run before taking a mandate. Every figure is attributed to its source, and where analysts disagree we show both numbers rather than picking the flattering one.</p>
        </section>

        {/* ══ FACETS ══ */}
        {(industries.length > 1 || metros.length > 1) && (
          <section style={{ maxWidth: 1360, margin: '0 auto', padding: '36px 32px 0' }}>
            <div data-hs="3" style={{ display: 'flex', flexWrap: 'wrap', gap: 26, borderTop: '1px solid #E4DFD3', borderBottom: '1px solid #E4DFD3', padding: '18px 0' }}>
              {industries.length > 1 && (
                <div role="group" aria-label="Filter by industry" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#7C8187', marginRight: 4 }}>INDUSTRY</span>
                  {[ALL, ...industries].map(v => (
                    <Chip key={v} label={v} on={industry === v} onClick={() => pickIndustry(v)} />
                  ))}
                </div>
              )}
              {metros.length > 1 && (
                <div role="group" aria-label="Filter by metro area" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#7C8187', marginRight: 4 }}>METRO</span>
                  {[ALL, ...metros].map(v => (
                    <Chip key={v} label={v} on={metro === v} onClick={() => pickMetro(v)} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ THE SHELF ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: '56px 32px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {shown.map(r => (
              <article key={r.slug} data-rv data-rcard style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 380px', background: '#FFFFFF', border: '1px solid #16181A' }}>
                <Handles />
                <div style={{ padding: '34px 38px 30px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', padding: '5px 9px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                      <span style={{ width: 7, height: 7, background: '#FCFAF6', display: 'inline-block' }} />{r.kicker}
                    </span>
                    <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', color: '#7C8187', textTransform: 'uppercase' }}>{r.publishedLabel}</span>
                  </div>
                  {/* Plain text per the reference — the card's one doorway is
                      the "Read the assessment" CTA below. */}
                  <h2 style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(26px, 2.4vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                    {r.shortTitle}
                  </h2>
                  <p style={{ margin: '16px 0 0', fontSize: 15.5, lineHeight: 1.68, color: '#4A4F54' }}>{r.abstract}</p>
                  <div style={{ marginTop: 'auto', paddingTop: 26, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <Link
                      href={`/research/${r.slug}`}
                      className="ca-h-greenbg"
                      style={{ fontSize: 15, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '12px 20px', borderRadius: 9 }}
                      onClick={() => trackEvent('report_card_clicked', { slug: r.slug })}
                    >
                      Read the assessment
                    </Link>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', color: '#7C8187' }}>
                      {r.summary.minutes} MIN · {r.summary.words.toLocaleString()} WORDS · PDF AVAILABLE
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', borderLeft: '1px solid #16181A', minHeight: 280, background: '#131512', display: 'grid', placeItems: 'center', padding: 24, overflow: 'hidden' }}>
                  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(168,240,206,.14) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                  {r.ogImage && (
                    <div
                      role="img"
                      aria-label="Report cover"
                      style={{ position: 'relative', width: '100%', maxWidth: 330, height: 300, background: `url("${r.ogImage}") center / contain no-repeat`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,.45))' }}
                    />
                  )}
                </div>
              </article>
            ))}

            {shown.length === 0 && (
              <div data-rv style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ margin: 0, fontSize: 17, color: '#4A4F54' }}>No assessment covers that industry–metro pair yet.</p>
                <button
                  type="button"
                  className="ca-h-tintbg"
                  onClick={() => { setIndustry(ALL); setMetro(ALL); }}
                  style={{ marginTop: 18, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: '#0A7A58', border: '1px solid #0A7A58', background: '#FFFFFF', padding: '9px 14px', cursor: 'pointer' }}
                >
                  SHOW EVERYTHING
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ CTA — dark band ══ */}
        <section id="cta" className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(120px, 10vw, 170px) 32px', marginTop: 'clamp(100px, 9vw, 160px)', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" data-plx="0.025" style={{ position: 'absolute', right: '6%', bottom: 30, width: 260, height: 150, backgroundImage: 'radial-gradient(rgba(168,240,206,.18) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <h2 data-rv style={{ margin: 0, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(34px, 3.6vw, 58px)', lineHeight: 1.1, letterSpacing: '-0.014em' }}>Want this run on your lane?</h2>
            <p data-rv style={{ margin: '24px auto 0', maxWidth: '36em', fontSize: 17.5, lineHeight: 1.65, color: '#ABB2AB' }}>We build the same register for a client's specific market before the first approach goes out. If you're buying, start with a conversation.</p>
            <div data-rv style={{ marginTop: 38 }}>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-mintbg"
                style={{ display: 'inline-block', fontSize: 17, fontWeight: 600, color: '#16181A', background: '#FCFAF6', padding: '16px 30px', borderRadius: 10, whiteSpace: 'nowrap' }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'reports-index' })}
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
