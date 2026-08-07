/**
 * /industries — CARTA RESTYLE (2026-08-07). Transcribed 1:1 from
 * `design_handoff_smbx_carta_restyle/Industries - Carta Style.dc.html`.
 * Structure: centered hero (kicker · H1 · sub · framed hero photo with the
 * FIFTEEN LANES chip) · fifteen zig-zag sector theses (7fr/4fr, alternating;
 * ruled WHO WE RUN IT FOR / WHY THIS LANE asides, small framed sector photo
 * when one exists) · the Heritage panel (attribution shield per Track Record
 * doctrine) · centered CTA.
 *
 * Copy law: no directional market numbers on this page — only named
 * regulations (NFPA 25/72, RCRA, AS9100, ISO 13485). The sector copy is the
 * reference's, which took it verbatim from the live page — one source.
 */
import PracticeShell, { Handles, Kicker } from './PracticeShell';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

interface Sector {
  nm: string;
  lead: string;
  tags?: string[];
  paras: string[];
  who: string;
  desk: string;
  /** Sector photo. OPTIONAL and honest: a sector renders art only when art
   *  exists FOR IT — elevator, building automation, food co-packing and
   *  energy-adjacent services stay bare. */
  img?: string;
}

const SECTORS: Sector[] = [
  { nm: 'Residential home services', img: '/industries/trade-fleet-sq.jpg', lead: 'Fragmentation is the thesis, not market size', tags: ['HVAC · plumbing · electrical', 'Roofing · pest control · garage doors', 'Homeowner demand'], paras: ['Service and replacement work sold to homeowners. Roughly nine in ten of these firms employ fewer than twenty people, no single company holds a fifth of any major trade, and the owners are closer to retirement than to a succession plan.', 'The top of the market has re-rated while add-ons have not, which is the whole arbitrage. Tier-one Sun Belt metros are picked over; platform formation in under-consolidated metros is where the opening still is.'], who: 'Family offices, independent sponsors and first-time platforms — plus operators adding density around a business they already run.', desk: 'The deepest independent base we cover, and the trade whose consolidation mechanics we have run first-hand.' },
  { nm: 'Commercial mechanical, HVAC & plumbing', img: '/industries/trade-mep-sq.jpg', lead: 'A construction trade being repriced as infrastructure', tags: ['Commercial & institutional buildings', 'Contracted service books', 'Data center · healthcare'], paras: ['Not the residential trade above, and it does not underwrite like it. The customer is a building owner or a general contractor, the work is bid and contracted, and the prize is the recurring maintenance book hiding inside a project business.', 'It is genuinely hard to diligence — percentage-of-completion accounting, working-capital pegs, surety transfer, multiemployer pension withdrawal liability. That difficulty is what keeps generalist capital out, which is exactly why it is worth doing properly.'], who: 'Sponsors and operator-acquirers who can underwrite contract accounting, and buyers chasing data-center-adjacent service revenue.', desk: 'Harder to underwrite than residential, years behind it on the consolidation curve, and the difficulty is the moat.' },
  { nm: 'Fire & life safety', img: '/industries/trade-fire-sq.jpg', lead: 'Revenue that renews because the code says so', paras: ['Sprinkler and alarm inspection, testing and maintenance under NFPA 25 and 72. Suppression, detection, monitoring. Every installed system becomes an inspection obligation — and an annuity.', 'The operator base is deep, independent, and aging. Most of these owners are closer to retirement than to a succession plan.'], who: 'Family offices, independent sponsors, and first-time platforms that want non-discretionary recurring revenue.', desk: 'Code-mandated recurring revenue with a long independent tail. Consolidation here is far from finished.' },
  { nm: 'Elevator & escalator service', lead: 'The compliance annuity with the longest independent tail', paras: ['Maintenance, repair, and modernization under mandated safety inspection. Contract books renew year after year, capex stays light, and independents still carry a large share of the installed base.'], who: 'Buyers who want annuity economics at service-company scale — sponsors, family offices, first-time platforms.', desk: 'Mandated inspections, sticky contracts, aging owners. The earliest-stage lane we cover.' },
  { nm: 'Power & grid infrastructure services', img: '/industries/trade-power-sq.jpg', lead: 'The grid runs on founder-owned shops', paras: ['Transformer repair and refurbishment, substation construction and maintenance, certified electrical testing. Electrification runs on this layer — and most of the companies doing the work are certified, founder-owned, and hard to replicate.'], who: 'Sponsors and family offices entering the power theme at service-company scale.', desk: 'Structural demand, certification gates, and owners who built these firms a generation ago.' },
  { nm: 'Building automation & critical power services', lead: "Recurring service where downtime isn't an option", paras: ['Building automation and controls, commissioning, critical power and cooling service. Data centers and healthcare keep the demand structural — and the service contracts recurring.'], who: 'Sponsors chasing data-center-adjacent services, and operator-acquirers from the mechanical world.', desk: 'Recurring service revenue and technical crews, in demand that is structural rather than cyclical.' },
  { nm: 'Energy-adjacent services, contracting & distribution', lead: 'Energy, entered through the service door', tags: ['Industrial & energy services', 'Fuel, propane & PVF distribution', 'Electrification demand'], paras: ['The electrification and data-center wave runs on ordinary operating companies: industrial and energy service firms — electrical testing, turnaround and outage work, valve and compression field service — and the fuel, propane, PVF and electrical distributors that supply them. Fragmented, founder-owned, technician-constrained, and underwritten the way we already underwrite the trades.', 'The boundary is deliberate, and it protects the client: we work operating-company M&A only. Minerals, royalties, working interests and generation assets are a different profession under different law — when a mandate touches them, we bring in securities counsel and a licensed broker-dealer rather than improvising.'], who: 'Family offices and first-time platform builders entering the energy theme at operating-company scale — capital and conviction, in need of an origination engine.', desk: 'The same buy-side machine we run in the trades, pointed at the demand behind the grid.' },
  { nm: 'Testing, inspection & certification / NDT', img: '/industries/trade-ndt-sq.jpg', lead: 'Certification is the gate', tags: ['Nondestructive testing', 'Code inspection', 'Materials testing labs'], paras: ['Regional specialist labs and field-inspection firms: nondestructive testing, code inspection, materials testing. Demand is written into code, not into budgets.', "The certified workforce is aging faster than it's being replaced. Succession is the story in almost every shop."], who: 'Sponsors seeking certification moats.', desk: "Code-driven demand behind a workforce moat competitors can't hire their way through." },
  { nm: 'Environmental & industrial cleaning services', img: '/industries/trade-enviro-sq.jpg', lead: 'Permits gate entry', paras: ['Permitted industrial and environmental services, remediation, industrial cleaning. RCRA authorizations and state operator certifications keep casual buyers out.', 'Demand is regulation-driven, the businesses rarely reach a broker, and the permit transfer itself is a project — one we plan for from the first call.'], who: 'Sponsors and emerging platforms working below the strategic tier.', desk: "Regulation-driven revenue behind permit gates most buyers can't underwrite." },
  { nm: 'Water & wastewater contract O&M', img: '/industries/trade-water-sq.jpg', lead: 'Revenue as durable as the water bill', paras: ['Contract operations for municipal and industrial water and wastewater systems. Multi-year contracts, non-discretionary demand, and systems aging faster than the towns can staff them.'], who: 'Buyers who want the most durable revenue in the services economy — and can be patient with municipal timelines.', desk: 'Mission-critical recurring contracts that consolidation has barely touched.' },
  { nm: 'Specialty & MRO distribution', img: '/industries/trade-mro-sq.jpg', lead: 'Authorization is the moat', paras: ["Niche industrial product lines, vendor-authorized distribution, VMI and integrated supply. The revenue behaves like a contract — and the authorizations don't transfer casually, which is exactly the diligence we run."], who: "Distribution platforms and holdcos compounding niche product lines that don't compete with each other.", desk: 'Vendor-authorization moats across many non-competing product-line lanes.' },
  { nm: 'Machine shops & precision manufacturing', img: '/industries/trade-machine-sq.jpg', lead: 'Qualification makes revenue stick', paras: ['Certified machine shops and precision manufacturers — AS9100, ISO 13485, defense-qualified. Reshoring is pulling work back to shops that spent years earning their qualifications; those cycles make revenue durable and the businesses hard to value from the outside.'], who: 'Manufacturing-focused sponsors, family offices, and operator-acquirers.', desk: 'The earliest-stage manufacturing lane, with tailwinds that are policy, not fashion.' },
  { nm: 'Food contract manufacturing & co-packing', lead: 'Sticky programs, signed for years', paras: ['Contract manufacturing and co-packing for food brands, held together by multi-year supply agreements and qualification runs. Fragmented nationally — with genuine density in our own backyard.'], who: 'Sponsors and strategics buying capacity, and holdcos collecting sticky supply agreements.', desk: 'Recurring supply agreements, plus regional concentration where we sit.' },
  { nm: 'Non-emergency medical transport', img: '/industries/trade-nemt-sq.jpg', lead: 'Recurring trips, funded by reimbursement', paras: ['Scheduled, recurring, Medicaid- and Medicare-funded transport. Fragmented and early — with payor and reimbursement diligence treated as the deal, not a footnote.'], who: 'Sponsors and holdcos comfortable with reimbursement-funded revenue.', desk: 'Recurring demand and an open runway, entered with eyes open.' },
  { nm: 'Revenue cycle management & medical billing', img: '/industries/trade-billing-sq.jpg', lead: 'Fragmented, clean to diligence, and changing fast', paras: ['Many owners, clean books, active consolidation — and automation reshaping the work, which is why we underwrite the niche before the number.'], who: 'Buyers selective about which billing niches hold as automation compresses the routine work.', desk: 'Fragmentation and fee-friendly deal sizes — in the niches that hold.' },
];

const TAG_STYLE = { fontFamily: MONO, fontSize: 11, letterSpacing: '0.05em', color: '#0A7A58', background: '#DFF5EC', padding: '6px 10px' } as const;

function Aside({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '2px solid #16181A', paddingTop: 16, position: 'relative', marginTop: k === 'WHO WE RUN IT FOR' ? 0 : 24 }}>
      <span style={{ position: 'absolute', top: -2, left: 0, width: 38, height: 2, background: '#0A7A58' }} />
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.13em', color: '#7C8187' }}>{k}</div>
      <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: '#4A4F54' }}>{children}</p>
    </div>
  );
}

export default function Industries() {
  return (
    <PracticeShell>
      <main style={{ background: '#FCFAF6', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(100px, 9vw, 150px) 32px 0', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden="true" data-plx="-0.02" style={{ position: 'absolute', left: '6%', top: 70, width: 110, height: 110, backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', right: '7%', top: 140, width: 90, height: 90, backgroundImage: 'radial-gradient(rgba(10,122,88,.22) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
          <div data-hs="0"><Kicker center>KEY INDUSTRY VERTICALS</Kicker></div>
          <h1 data-hs="1" style={{ margin: '28px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(36px, 3.6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.013em', textWrap: 'balance' }}>Buy-side M&amp;A for acquirers of private companies under $250M in revenue.</h1>
          <p data-hs="2" style={{ margin: '26px auto 0', maxWidth: '42em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>We work on a retainer plus a success fee, paid by the acquirer, never the seller. These lanes are where we know the most; bring us a market that isn't here and we'll go learn it.</p>
          <div data-hs="3" style={{ margin: '52px auto 0', maxWidth: 1080, position: 'relative' }}>
            <img src="/industries/trade-home.jpg" alt="" style={{ display: 'block', width: '100%', height: 300, objectFit: 'cover' }} />
            <Handles />
            <span style={{ position: 'absolute', left: 14, bottom: 14, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', padding: '5px 9px', whiteSpace: 'nowrap' }}>
              <span style={{ width: 7, height: 7, background: '#FCFAF6', display: 'inline-block' }} />FIFTEEN LANES
            </span>
          </div>
        </section>

        {/* ══ THE THESES ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 32px 0' }}>
          {SECTORS.map((s, i) => {
            const even = i % 2 === 0;
            return (
              <div key={s.nm} data-rv data-sector style={{ display: 'grid', gap: 56, alignItems: 'start', padding: '64px 0', borderBottom: '1px solid #E4DFD3', gridTemplateColumns: even ? '7fr 4fr' : '4fr 7fr' }}>
                <div style={{ order: even ? 1 : 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: '#0A7A58' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ height: 1, flex: 1, background: '#E4DFD3' }} />
                  </div>
                  <h2 style={{ margin: '18px 0 0', fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(26px, 2.5vw, 38px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>{s.nm}</h2>
                  <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: '#16181A' }}>{s.lead}<span style={{ color: '#0A7A58' }}>.</span></div>
                  {s.tags && s.tags.length > 0 && (
                    <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {s.tags.map(t => <span key={t} style={TAG_STYLE}>{t}</span>)}
                    </div>
                  )}
                  <p style={{ margin: '18px 0 0', fontSize: 15.5, lineHeight: 1.7, color: '#4A4F54' }}>{s.paras[0]}</p>
                  {s.paras[1] && <p style={{ margin: '14px 0 0', fontSize: 15.5, lineHeight: 1.7, color: '#4A4F54' }}>{s.paras[1]}</p>}
                </div>
                <div style={{ order: even ? 2 : 1, paddingTop: 46 }}>
                  <Aside k="WHO WE RUN IT FOR">{s.who}</Aside>
                  <Aside k="WHY THIS LANE">{s.desk}</Aside>
                  {s.img && (
                    <div style={{ marginTop: 24, position: 'relative' }}>
                      <img src={s.img} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
                      <Handles small />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Heritage */}
          <div data-rv style={{ marginTop: 80, position: 'relative', background: '#F3F0E9', padding: '52px 56px 56px' }}>
            <Handles />
            <Kicker>HERITAGE</Kicker>
            <h2 style={{ margin: '18px 0 0', fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(28px, 2.7vw, 42px)', lineHeight: 1.12, letterSpacing: '-0.01em' }}>Home &amp; commercial services</h2>
            <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: '#16181A' }}>Where the record was built<span style={{ color: '#0A7A58' }}>.</span></div>
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={TAG_STYLE}>Residential &amp; commercial services trades</span>
              <span style={TAG_STYLE}>Commercial landscaping — contract-heavy only</span>
            </div>
            <div style={{ marginTop: 26, position: 'relative', maxWidth: 900 }}>
              <img src="/industries/trade-roof.jpg" alt="" loading="lazy" style={{ display: 'block', width: '100%', height: 240, objectFit: 'cover' }} />
              <Handles small />
            </div>
            <p style={{ margin: '26px 0 0', fontSize: 15.5, lineHeight: 1.7, color: '#4A4F54', maxWidth: '52em' }}>More than a hundred transactions across the residential and commercial services trades, counting the platforms and every add-on bolted onto them. I was inside the consolidation wave: what a platform pays for, what dies in diligence, what integration actually costs.</p>
            <p style={{ margin: '14px 0 0', fontSize: 15.5, lineHeight: 1.7, color: '#4A4F54', maxWidth: '52em' }}>Much of that world is consolidated now, so the current focus applies the same mechanics one wave earlier — while still taking mandates here where a genuine lane is open, like contract-heavy commercial landscaping. The mechanics haven't changed.</p>
            <div style={{ marginTop: 22, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.65, color: '#7C8187', maxWidth: '48em', borderLeft: '2px solid #0A7A58', paddingLeft: 16 }}>Selected transactions led or co-led in the course of employment at Wrench Group and at JPMorgan Chase.</div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(120px, 11vw, 190px) 32px clamp(130px, 12vw, 200px)', textAlign: 'center' }}>
          <div data-rv>
            <h2 style={{ margin: '0 auto', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(36px, 3.8vw, 62px)', lineHeight: 1.08, letterSpacing: '-0.014em', maxWidth: '14em' }}>Let's talk about what you're buying.</h2>
            <p style={{ margin: '24px auto 0', maxWidth: '38em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>We're happy to dive into opportunities in these industries or take on something new in an area you're interested in.</p>
            <div style={{ marginTop: 38, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/#yulia"
                className="ca-h-greenbg"
                style={{ fontSize: 16.5, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '16px 28px', borderRadius: 10 }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'industries-cta' })}
              >
                Tell us what you're buying →
              </a>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-band"
                style={{ fontSize: 16.5, fontWeight: 500, color: '#16181A', padding: '14.5px 26px', border: '1.5px solid #16181A', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'industries-cta' })}
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
