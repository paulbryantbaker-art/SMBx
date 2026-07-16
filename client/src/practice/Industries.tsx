/**
 * /industries — the full sector theses (v3 Claude Design handoff,
 * SectorsPage.dc.html). Twelve `.pd-sector` blocks in a zig-zag 7/5 split
 * (nth-of-type alternates — the blocks must stay direct siblings), then the
 * Heritage block styled apart (gray card, first-person, attribution shield
 * line per the Track Record doctrine), then a centered CTA.
 *
 * Copy law (bundle README): no directional market numbers on this page —
 * only named regulations (NFPA 25/72, RCRA, AS9100, ISO 13485). Copy is
 * Paul's approved deck — verbatim.
 */
import PracticeShell from './PracticeShell';
import { trackEvent } from '../lib/analytics';

interface Sector {
  nm: string;
  lead: string;
  tags?: string[];
  paras: string[];
  who: string;
  desk: string;
}

const SECTORS: Sector[] = [
  {
    nm: 'Fire & life safety',
    lead: 'Revenue that renews because the code says so',
    paras: [
      'Sprinkler and alarm inspection, testing and maintenance under NFPA 25 and 72. Suppression, detection, monitoring. Every installed system becomes an inspection obligation — and an annuity.',
      'The operator base is deep, independent, and aging. Most of these owners are closer to retirement than to a succession plan.',
    ],
    who: 'Family offices, independent sponsors, and first-time platforms that want non-discretionary recurring revenue.',
    desk: 'Code-mandated recurring revenue with a long independent tail. Consolidation here is far from finished.',
  },
  {
    nm: 'Elevator & escalator service',
    lead: 'The compliance annuity with the longest independent tail',
    paras: [
      'Maintenance, repair, and modernization under mandated safety inspection. Contract books renew year after year, capex stays light, and independents still carry a large share of the installed base.',
    ],
    who: 'Buyers who want annuity economics at service-company scale — sponsors, family offices, first-time platforms.',
    desk: 'Mandated inspections, sticky contracts, aging owners. The earliest-stage lane we cover.',
  },
  {
    nm: 'Power & grid infrastructure services',
    lead: 'The grid runs on founder-owned shops',
    paras: [
      'Transformer repair and refurbishment, substation construction and maintenance, certified electrical testing. Electrification runs on this layer — and most of the companies doing the work are certified, founder-owned, and hard to replicate.',
    ],
    who: 'Sponsors and family offices entering the power theme at service-company scale.',
    desk: 'Structural demand, certification gates, and owners who built these firms a generation ago.',
  },
  {
    nm: 'Building automation & critical power services',
    lead: "Recurring service where downtime isn't an option",
    paras: [
      'Building automation and controls, commissioning, critical power and cooling service. Data centers and healthcare keep the demand structural — and the service contracts recurring.',
    ],
    who: 'Sponsors chasing data-center-adjacent services, and operator-acquirers from the mechanical world.',
    desk: 'Recurring service revenue and technical crews, in demand that is structural rather than cyclical.',
  },
  {
    nm: 'Testing, inspection & certification / NDT',
    lead: 'Certification is the gate',
    tags: ['Nondestructive testing', 'Code inspection', 'Materials testing labs'],
    paras: [
      'Regional specialist labs and field-inspection firms: nondestructive testing, code inspection, materials testing. Demand is written into code, not into budgets.',
      "The certified workforce is aging faster than it's being replaced. Succession is the story in almost every shop.",
    ],
    who: 'Sponsors seeking certification moats.',
    desk: "Code-driven demand behind a workforce moat competitors can't hire their way through.",
  },
  {
    nm: 'Environmental & industrial cleaning services',
    lead: 'Permits gate entry',
    paras: [
      'Permitted industrial and environmental services, remediation, industrial cleaning. RCRA authorizations and state operator certifications keep casual buyers out.',
      'Demand is regulation-driven, the businesses rarely reach a broker, and the permit transfer itself is a project — one we plan for from the first call.',
    ],
    who: 'Sponsors and emerging platforms working below the strategic tier.',
    desk: "Regulation-driven revenue behind permit gates most buyers can't underwrite.",
  },
  {
    nm: 'Water & wastewater contract O&M',
    lead: 'Revenue as durable as the water bill',
    paras: [
      'Contract operations for municipal and industrial water and wastewater systems. Multi-year contracts, non-discretionary demand, and systems aging faster than the towns can staff them.',
    ],
    who: 'Buyers who want the most durable revenue in the services economy — and can be patient with municipal timelines.',
    desk: 'Mission-critical recurring contracts that consolidation has barely touched.',
  },
  {
    nm: 'Specialty & MRO distribution',
    lead: 'Authorization is the moat',
    paras: [
      "Niche industrial product lines, vendor-authorized distribution, VMI and integrated supply. The revenue behaves like a contract — and the authorizations don't transfer casually, which is exactly the diligence we run.",
    ],
    who: "Distribution platforms and holdcos compounding niche product lines that don't compete with each other.",
    desk: 'Vendor-authorization moats across many non-competing product-line lanes.',
  },
  {
    nm: 'Machine shops & precision manufacturing',
    lead: 'Qualification makes revenue stick',
    paras: [
      'Certified machine shops and precision manufacturers — AS9100, ISO 13485, defense-qualified. Reshoring is pulling work back to shops that spent years earning their qualifications; those cycles make revenue durable and the businesses hard to value from the outside.',
    ],
    who: 'Manufacturing-focused sponsors, family offices, and operator-acquirers.',
    desk: 'The earliest-stage manufacturing lane, with tailwinds that are policy, not fashion.',
  },
  {
    nm: 'Food contract manufacturing & co-packing',
    lead: 'Sticky programs, signed for years',
    paras: [
      'Contract manufacturing and co-packing for food brands, held together by multi-year supply agreements and qualification runs. Fragmented nationally — with genuine density in our own backyard.',
    ],
    who: 'Sponsors and strategics buying capacity, and holdcos collecting sticky supply agreements.',
    desk: 'Recurring supply agreements, plus regional concentration where we sit.',
  },
  {
    nm: 'Non-emergency medical transport',
    lead: 'Recurring trips, funded by reimbursement',
    paras: [
      'Scheduled, recurring, Medicaid- and Medicare-funded transport. Fragmented and early — with payor and reimbursement diligence treated as the deal, not a footnote.',
    ],
    who: 'Sponsors and holdcos comfortable with reimbursement-funded revenue.',
    desk: 'Recurring demand and an open runway, entered with eyes open.',
  },
  {
    nm: 'Revenue cycle management & medical billing',
    lead: 'Fragmented, clean to diligence, and changing fast',
    paras: [
      'Many owners, clean books, active consolidation — and automation reshaping the work, which is why we underwrite the niche before the number.',
    ],
    who: 'Buyers selective about which billing niches hold as automation compresses the routine work.',
    desk: 'Fragmentation and fee-friendly deal sizes — in the niches that hold.',
  },
];

export default function Industries() {
  return (
    <PracticeShell footerCompact>
      {/* ── Hero ── */}
      <section className="pd-section" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Key industry verticals</div>
            <h2 className="pd-h2">Buy-side M&amp;A for acquirers of private companies under $250M in revenue.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              Retainer plus success fee, paid by the acquirer — never the seller. We work a handful
              of lanes, chosen deliberately, and we decline the rest.
            </p>
          </div>
        </div>
      </section>

      {/* ── The theses — sectors must stay direct siblings for the zig-zag ── */}
      <section className="pd-accent ar">
        <div className="pd-wrap">
          {SECTORS.map(s => (
            <div className="pd-sector" data-rv key={s.nm}>
              <div className="nm">{s.nm}</div>
              <div className="split">
                <div className="know">
                  <div className="lead">{s.lead}<span className="fs">.</span></div>
                  {s.tags && (
                    <div className="tags">
                      {s.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                    </div>
                  )}
                  {s.paras.map((p, i) => <div className="b" key={i}>{p}</div>)}
                </div>
                <div className="aside">
                  <div className="who"><div className="k">Who we run it for</div><div className="v">{s.who}</div></div>
                  <div className="desk"><div className="k">Why this lane</div><div className="v">{s.desk}</div></div>
                </div>
              </div>
            </div>
          ))}

          {/* Heritage — where the record was built; the attribution shield
              sentence travels with the deal history (Track Record doctrine). */}
          <div className="pd-sector her" data-rv>
            <div className="nm">Home &amp; commercial services</div>
            <div className="know" style={{ marginTop: 'clamp(20px, 2.5vw, 32px)' }}>
              <div className="lead">Where the record was built<span className="fs">.</span></div>
              <div className="tags">
                <span className="tag">Residential &amp; commercial services trades</span>
                <span className="tag">Commercial landscaping — contract-heavy only</span>
              </div>
              <div className="b">
                Thirty-six acquisitions across the residential and commercial services trades. I was
                inside the consolidation wave: what a platform pays for, what dies in diligence,
                what integration actually costs.
              </div>
              <div className="b">
                Much of that world is consolidated now. We take mandates here selectively — where a
                genuine lane is still open, like contract-heavy commercial landscaping — and decline
                them where the trade is saturated. The mechanics haven't changed. The current focus
                applies them one wave earlier.
              </div>
              <div className="attr">
                Selected transactions led or co-led in the course of employment at Wrench Group and
                JPMorgan Chase.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pd-section">
        <div className="pd-wrap" style={{ textAlign: 'center' }}>
          <div data-rv>
            <h2 className="pd-h2" style={{ margin: '0 auto' }}>Let's talk about what you're buying.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              We're happy to dive into opportunities in these industries or take on something new in
              an area you're interested in.
            </p>
            <div style={{ marginTop: 36, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="pd-pill-primary pd-pill-lg" href="/#yulia" onClick={() => trackEvent('practice_cta_clicked', { placement: 'industries-cta' })}>Tell us what you're buying →</a>
              <a className="pd-pill pd-pill-lg-quiet" href="/#cta" onClick={() => trackEvent('practice_booking_clicked', { placement: 'industries-cta' })}>Book a call</a>
            </div>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
