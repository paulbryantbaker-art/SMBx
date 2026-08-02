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
import { bookHref, bookTarget, bookRel } from './leads';
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
  /* The two flagship lanes lead, and they are two DIFFERENT markets (Paul,
     2026-07-29: "residential home services and we also do Commercial MEP —
     don't confuse them, these need to stand out"). They are kept adjacent and
     each one names its boundary in the first line, because "HVAC" belongs to
     both and a reader skimming will otherwise merge them. They cannot be
     separated by a divider element: the zig-zag runs on nth-of-type over
     direct siblings, so anything inserted between blocks flips the alternation
     for every sector after it. The copy carries the distinction instead.
     Theses are drawn from our own published assessments; per this page's copy
     law they state no market sizes. */
  {
    nm: 'Residential home services',
    lead: 'Fragmentation is the thesis, not market size',
    tags: ['HVAC · plumbing · electrical', 'Roofing · pest control · garage doors', 'Homeowner demand'],
    paras: [
      'Service and replacement work sold to homeowners. Roughly nine in ten of these firms employ fewer than twenty people, no single company holds a fifth of any major trade, and the owners are closer to retirement than to a succession plan.',
      'The top of the market has re-rated while add-ons have not, which is the whole arbitrage. Tier-one Sun Belt metros are picked over; platform formation in under-consolidated metros is where the opening still is.',
    ],
    who: 'Family offices, independent sponsors and first-time platforms — plus operators adding density around a business they already run.',
    desk: 'The deepest independent base we cover, and the trade whose consolidation mechanics we have run first-hand.',
  },
  {
    nm: 'Commercial mechanical, HVAC & plumbing',
    lead: 'A construction trade being repriced as infrastructure',
    tags: ['Commercial & institutional buildings', 'Contracted service books', 'Data center · healthcare'],
    paras: [
      'Not the residential trade above, and it does not underwrite like it. The customer is a building owner or a general contractor, the work is bid and contracted, and the prize is the recurring maintenance book hiding inside a project business.',
      'It is genuinely hard to diligence — percentage-of-completion accounting, working-capital pegs, surety transfer, multiemployer pension withdrawal liability. That difficulty is what keeps generalist capital out, which is exactly why it is worth doing properly.',
    ],
    who: 'Sponsors and operator-acquirers who can underwrite contract accounting, and buyers chasing data-center-adjacent service revenue.',
    desk: 'Harder to underwrite than residential, years behind it on the consolidation curve, and the difficulty is the moat.',
  },
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
            {/* An H1, styled as an H2. The page had NO h1 at all — its heading
                outline started at level 2 — which is both a screen-reader
                defect and an SEO one. The type ladder's law is one SIZE per
                role, not one TAG per size, so keeping `.pd-h2` preserves the
                page exactly while giving it a document outline. */}
            <h1 className="pd-h2">Buy-side M&amp;A for acquirers of private companies under $250M in revenue.</h1>
            {/* "We decline the rest" is gone — Paul, 2026-07-29: "we don't
                decline the rest, we never turn down business." It also
                contradicted the CTA at the foot of this same page, which
                offers to take on something new. The lanes below are where we
                are deepest, not a list of what we will accept. */}
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              Institutional-grade corporate development, on demand — retainer plus success fee, paid
              by the acquirer, never the seller. These lanes are where we know the most; bring us a
              market that isn't here and we'll go learn it.
            </p>
          </div>
        </div>
      </section>

      {/* An illustration under the head, and one on the Heritage block below.
          TWO, not fourteen: the report's `hs-accent-*` set draws home-services
          trades, and this page runs fourteen sectors including elevator, NDT
          and MRO distribution. Putting an HVAC condenser beside "Elevator &
          escalator service" would be a picture that lies, which is the same
          rule the numbers follow. Sectors get art only where art exists for
          them. */}
      <section className="pd-wrap" style={{ marginTop: 'clamp(30px, 3.6vw, 52px)' }}>
        <img
          className="pd-accentband"
          src="/industries/trade-home.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1700}
          height={520}
          data-rv
        />
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
              <img
                className="pd-accentband"
                src="/industries/trade-roof.jpg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={1700}
                height={520}
                style={{ marginTop: 'clamp(22px, 2.6vw, 34px)' }}
              />
              {/* Was "Thirty-six acquisitions", which counted platforms and
                  left their add-ons out (Paul, 2026-07-29: "when we add all the
                  platforms and add-ons it was more than a hundred
                  transactions"). "led or co-led" and "selected transactions"
                  stay — Track Record doctrine, non-negotiable — and the
                  attribution shield below travels with the claim. */}
              <div className="b">
                More than a hundred transactions across the residential and commercial services
                trades, counting the platforms and every add-on bolted onto them. I was inside the
                consolidation wave: what a platform pays for, what dies in diligence, what
                integration actually costs.
              </div>
              <div className="b">
                Much of that world is consolidated now, so the current focus applies the same
                mechanics one wave earlier — while still taking mandates here where a genuine lane
                is open, like contract-heavy commercial landscaping. The mechanics haven't changed.
              </div>
              <div className="attr">
                Selected transactions led or co-led in the course of employment at a world-class
                PE-backed aggregator and a global investment bank.
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
              <a className="pd-pill pd-pill-lg-quiet" href={bookHref()} target={bookTarget()} rel={bookRel()} onClick={() => trackEvent('practice_booking_clicked', { placement: 'industries-cta' })}>Book a call</a>
            </div>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
