/**
 * Practice-site landing — corpdevservices layout + Paul's copy deck
 * (2026-07-11) + the intensity pass (2026-07-12): restraint with drama.
 * Scroll: nav · hero + Acquisition Engine · stat band (numbers as the largest
 * objects on the page) · problem table · track record (dark) · the firm
 * (#why) · process as a horizontal sequence (#how) · who it's for (#who) ·
 * industries as a dense list (#industries) · how we find them (statement +
 * asymmetry) · whose-side (dark) · pull-quote · FAQ · final CTA (dark,
 * #book) · footer.
 */
import { useState } from 'react';
import { Link } from 'wouter';
import PracticeShell from './PracticeShell';
import YuliaIntake, { MapDoc, type PartialMap } from './YuliaIntake';
import Mark from './Mark';
import { AttributionLine } from './TrackRecord';
import { BandArt, FootprintMap, Mesh, Swoosh } from './atmo';
import { postPracticeLead, bookHref, bookTarget } from './leads';
import { SEGMENTS } from './segmentData';
import { trackEvent } from '../lib/analytics';

/** The showcase artifact — show the work product, not a claim about it
 *  (Stripe lesson). Content is the Market Map spec's own worked example,
 *  clearly labeled a sample. */
const SAMPLE_MAP: PartialMap = {
  title: 'Commercial Landscaping — Southeast',
  thesis: 'Commercial landscaping · GA, NC, SC, TN · $2–8M EBITDA · commercial-contract mix',
  verdict: 'PROCEED',
  funnel: [
    { n: '~2,400', label: 'landscaping operators in the four-state footprint' },
    { n: '~180', label: 'in your size band' },
    { n: '~55', label: 'with commercial-contract mix above 60% — the ones actually worth your time' },
  ],
  insight: 'Route density is everything here, and almost nobody underwrites it. Two companies with identical EBITDA can be worth very different multiples depending on how tight the routes are. Most buyers underwrite the EBITDA and ignore the drive time — then wonder why margins compress after close.',
};

/** The engagement — what we run, stated as scope, never as comparison
 *  (confidence pass, 2026-07-12: "Never describe a competitor. Describe the
 *  work."). */
const ENGAGEMENT = [
  { k: 'Thesis', v: "What you're really trying to build, translated into a target profile a search can run against." },
  { k: 'Sourcing', v: "Direct, discreet outreach to owners who aren't formally for sale. Most of our deals are never listed." },
  { k: 'Evaluation', v: "The real multiple, the earnings that hold up versus the ones that don't, and the number a lender will actually finance." },
  { k: 'Structure', v: 'The offer, the deal structure, and the financing model your capital partners will underwrite.' },
  { k: 'Diligence & close', v: 'We run the process, coordinate the attorneys, CPAs, and lenders, and drive the negotiation to signing.' },
  { k: 'Integration', v: 'The first 180 days, where a good purchase becomes a functional business.' },
];

/** Value creation, pre & post close (Paul's copy update, 2026-07-12 —
 *  the L-VAL section: the IMO function is part of the pitch). */
const VALUE_PILLARS = [
  {
    num: 'PRE-CLOSE',
    t: 'Diligence for integration',
    b: 'Financial diligence confirms the price; integration diligence secures the value. Before you sign, our team maps the operational gaps, system overlaps, and cultural risks, building a 100-day execution plan while you still have leverage.',
  },
  {
    num: 'POST-CLOSE',
    t: 'The IMO function',
    b: "You don't need standing integration overhead. Our team acts as your on-demand IMO, helping to drive the transition. We manage vendor consolidation, employee onboarding, and operational alignment so your team can focus on the business.",
  },
  {
    num: 'EXECUTION',
    t: 'Synergy capture',
    b: 'The model promised cost savings and cross-sell revenue. We track and execute against those specific targets through the first six months, ensuring the deal you modeled becomes the business you actually get.',
  },
];

const HUNTING = [
  { k: 'Elevator & escalator service', v: 'Code-mandated compliance creates highly sticky recurring revenue with 90%+ retention. The market remains heavily fragmented with independent, family-owned operators, offering massive consolidation opportunities and multiple arbitrage before the major OEMs sweep the market.' },
  { k: 'Water & wastewater services', v: 'Driven by multi-year municipal contracts, aging infrastructure, and massive federal funding tailwinds. We target regional operators with locked-in maintenance agreements that provide strict downside protection and highly predictable cash flow during economic downturns.' },
  { k: 'Commercial landscaping & grounds', v: 'Route-based recurring contracts with a vast, fragmented base. The key here is route density — we underwrite the drive time, not just the EBITDA, identifying targets that will immediately drop operational synergies to your bottom line.' },
  { k: 'Fire & life safety', v: 'Non-discretionary, mandated inspection and repair revenue. There is still no dominant national player in most regions, allowing disciplined buyers to acquire highly technical, licensed workforces at sane multiples.' },
  { k: 'Specialty & industrial distribution', v: 'Non-discretionary demand with recurring MRO (Maintenance, Repair, and Operations) revenue. We look for distributors with deep, entrenched customer relationships and proprietary product lines that create real, defensible enterprise value.' },
  { k: 'Healthcare RCM & non-clinical', v: 'Recurring, tech-enabled business services that remain completely free of the regulatory tangle and burnout risks associated with clinical physician practices. High switching costs make these assets incredibly durable.' },
  { k: 'Managed IT / MSP', v: 'Contracted recurring revenue in secondary and tertiary metros that the major consolidators haven’t reached yet. We focus on MSPs with high cloud-migration capabilities and sticky, multi-year SLA contracts.' },
];

const FAQ = [
  {
    q: 'What size deals do you work on?',
    a: "Acquisitions of privately held companies with under $250M in annual revenue. That's the ceiling. Below it, we're comfortable anywhere the deal is real — most of our work lands between $5M and $75M in enterprise value.",
  },
  {
    q: 'Do you replace an investment bank?',
    a: "Different function. A bank runs a sale process — it markets a company and manages an auction, usually for the seller. Corporate development is the buyer's side of the table: finding targets that aren't for sale, pricing them, and closing them. Some of our clients use both, at different moments in a deal. If you need a banker, we'll tell you, and we'll work alongside them.",
  },
  {
    q: "How do you find targets that aren't for sale?",
    a: "Direct, discreet outreach to owners on your behalf — the ones who'd never hire a broker. See How we find them above.",
  },
  {
    q: 'Who actually does the work?',
    a: 'Every mandate is led by a senior deal captain with decades of buy-side experience — the analysis, the seller conversations, and the negotiation.',
  },
  {
    q: 'Do you negotiate for us?',
    a: 'We run the process and drive the negotiation at your direction — but you are the acquirer. You set the limits, you approve the strategy, and you sign. When your deal requires a licensed attorney, a transaction CPA, or a lender, we bring in the right specialists and manage the workflow.',
  },
  {
    q: 'What does it cost?',
    a: 'A retainer for the engagement, and a success fee when we close the deal you wanted — paid by you, for work we did for you. We never take a dollar from the seller or the middle of the transaction. We will scope the economics in our first conversation.',
  },
  {
    q: 'Will you work with a competitor of mine?',
    a: 'Not in your target market. We take one client per target lane, ensuring your thesis and your pipeline remain strictly yours.',
  },
];

/** Who it's for — an interactive index: giant segment names; the hovered or
 *  focused one swaps its brief into the side panel. Names always navigate. */
function WhoSelector() {
  const [active, setActive] = useState(0);
  return (
    <div className="pd-whosel" data-rv>
      <div className="names">
        {SEGMENTS.map((s, i) => (
          <Link
            key={s.slug}
            href={`/buyers/${s.slug}`}
            className={`name${i === active ? ' on' : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <span>{s.cardTitle}</span>
            <span className="arr" aria-hidden>→</span>
          </Link>
        ))}
      </div>
      <div className="panel" aria-live="polite">
        <div className="pbody">{SEGMENTS[active].cardBody}</div>
        <Link className="pd-link" href={`/buyers/${SEGMENTS[active].slug}`}>{SEGMENTS[active].cardLink}</Link>
      </div>
    </div>
  );
}

function LeadForm() {
  const [persona, setPersona] = useState('');
  const [thesis, setThesis] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  const submit = async () => {
    if (state !== 'idle') return;
    if (!email.includes('@') || !thesis.trim()) return;
    setState('busy');
    trackEvent('practice_form_submitted');
    await postPracticeLead({ persona, thesis, email, source: 'landing-form' });
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="pd-form">
        <div className="t">Got it — you're on the map.</div>
        <div style={{ marginTop: 14, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
          We'll come back within 24 hours with a first read on your thesis. Prefer not to wait?{' '}
          <a className="pd-link" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>Book the call now →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-form">
      <div className="t">Or leave your details.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
        <input className="pd-input" placeholder="I'm a… (family office, sponsor…)" value={persona} onChange={e => setPersona(e.target.value)} aria-label="Who you are" />
        <input className="pd-input" placeholder="What are you buying?" value={thesis} onChange={e => setThesis(e.target.value)} aria-label="What you are buying" />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <input className="pd-input" style={{ flex: 1 }} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} aria-label="Email" />
        <button
          type="button"
          className="pd-pill-primary"
          style={{ borderRadius: 99, padding: '15px 28px', opacity: state === 'busy' ? 0.7 : 1 }}
          onClick={submit}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

/** The product showcase — Slack's signature move: a big framed product with a
 *  pill-tab row below that swaps what's shown. Ours toggles the live engine and
 *  a sample market read. */
function HeroShowcase() {
  const [tab, setTab] = useState<'engine' | 'sample'>('engine');
  return (
    <div className="pd-showcase">
      <div className="pd-show-stage">
        {tab === 'engine' ? (
          <YuliaIntake />
        ) : (
          <div style={{ maxWidth: 680 }}>
            <MapDoc map={SAMPLE_MAP} final headLabel="SAMPLE READ" />
          </div>
        )}
      </div>
      <div className="pd-showtabs">
        <button type="button" className={tab === 'engine' ? 'on' : ''} onClick={() => setTab('engine')}>
          Map your market
        </button>
        <button
          type="button"
          className={tab === 'sample' ? 'on' : ''}
          onClick={() => { setTab('sample'); trackEvent('practice_cta_clicked', { placement: 'showcase-sample' }); }}
        >
          See a sample read
        </button>
      </div>
    </div>
  );
}

/** A Slack-style centered section intro: eyebrow label, heading, optional
 *  lede — the consistent rhythm the mid-page now reads on. */
function SectionHead({
  label, title, sub, quote,
}: {
  label?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  quote?: boolean;
}) {
  return (
    <div className="pd-sechead" data-rv>
      {label && <div className="pd-seclabel">{label}</div>}
      <h2 className={quote ? 'pd-quote' : 'pd-h2'}>{title}</h2>
      {sub && <p className="pd-sub">{sub}</p>}
    </div>
  );
}

/** Scenario steps rendered as the numbered index (reused by the landing
 *  overview and — inline — by each segment page). */
function ScenarioSteps({ steps }: { steps: { k: string; v: string }[] }) {
  return (
    <div className="pd-index rv-stagger" data-rv>
      {steps.map((s, i) => (
        <div className="pd-indexrow" key={s.k}>
          <div className="no">{String(i + 1).padStart(2, '0')}</div>
          <div className="t">{s.k}</div>
          <div className="b">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

/** How it works, per situation — centered pill tabs (the hero showcase's
 *  language) swap the tailored scenario for each buyer type. The generic
 *  three-step timeline is retired in favor of this: the same disciplined
 *  process, shown as it actually runs for who you are. */
function HowItWorks() {
  const [active, setActive] = useState(0);
  const seg = SEGMENTS[active];
  return (
    <div className="pd-howcase">
      <div className="pd-showtabs" data-rv role="tablist" aria-label="Buyer situation">
        {SEGMENTS.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? 'on' : ''}
            onClick={() => setActive(i)}
          >
            {s.footerLabel}
          </button>
        ))}
      </div>
      <div className="pd-howstage" aria-live="polite">
        <p className="pd-sub pd-howlede">{seg.scenarioLede}</p>
        <ScenarioSteps steps={seg.scenario} />
        <Link href={`/buyers/${seg.slug}`} className="pd-link pd-howlink">
          See the full walkthrough for {seg.footerLabel.toLowerCase()} →
        </Link>
      </div>
    </div>
  );
}

/** The engagement as Slack's signature feature block: a vertical nav of the
 *  six phases on the left swaps a framed stage panel on the right. Honest —
 *  the stage is a clean description of the phase, not a fabricated screenshot. */
function EngagementShow() {
  const [active, setActive] = useState(0);
  return (
    <div className="pd-feature" data-rv>
      <div className="nav">
        {ENGAGEMENT.map((e, i) => (
          <button
            key={e.k}
            type="button"
            className={`fn${i === active ? ' on' : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            <span className="no">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="nm">{e.k}</span>
              <span className="fbody">{e.v}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="stage" aria-live="polite">
        <div className="sno">{String(active + 1).padStart(2, '0')}</div>
        <div className="st">{ENGAGEMENT[active].k}</div>
        <div className="sb">{ENGAGEMENT[active].v}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <PracticeShell home>
      {/* ── Hero — centered (Slack layout): statement, two CTAs, an honest
             proof row (no fabricated logos), then the product showcase ── */}
      <section className="pd-hero pd-hero-c">
        <div className="pd-heroc-inner">
          <h1 className="pd-h1">
            We'll build and run your business acquisition strategy tailored to your&nbsp;goals.
          </h1>
          <p className="pd-sub pd-sub-c">
            Institutional-grade corporate development, on demand. The acquisition engine builds
            your strategy in minutes; our senior advisors close the deal.
          </p>
          <div className="pd-cta-row">
            <a className="pd-pill-primary pd-pill-lg" href="#yulia" onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero' })}>Build your market map →</a>
            <a className="pd-pill pd-pill-lg-quiet" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined} onClick={() => trackEvent('practice_booking_clicked', { placement: 'hero' })}>Book a call</a>
          </div>
          <div className="pd-proofrow" data-rv>
            <span className="lab">Two decades on the buy side</span>
            <span className="dot">·</span>
            <span className="pf"><b>150+</b> acquisitions</span>
            <span className="pf"><b>$5B+</b> added</span>
            <span className="pf"><b>~$21B</b> touched</span>
            <span className="pf hot"><b>0</b> sell-side. Ever.</span>
          </div>
        </div>
        <HeroShowcase />
      </section>

      {/* ── The gap — centered Slack intro, then a symmetric two-column
             explanation and a centered statement (confidence pass copy) ── */}
      <section className="pd-wrap pd-section pd-accent ar">
        <SectionHead
          label="The gap"
          title={<>Most acquirers under $250M don't have a dedicated deal team.</>}
        />
        <div className="pd-gapcols rv-stagger" data-rv>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            The companies that buy well have a corporate development function: a permanent team
            whose entire job is finding the right targets, pricing them properly, and getting
            them closed. At scale, it pays for itself many times over.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            Below a certain size, however, the math gets difficult. A director of corp dev and an
            analyst can run well past half a million dollars a year — for a function you may only
            utilize twice a year. As a result, the acquisitions that would compound your business
            get run off the side of a desk, against a seller who does this professionally.
          </div>
        </div>
        <div className="pd-gapclose" data-rv>
          <div className="pd-statement" style={{ margin: '0 auto', maxWidth: '18em' }}>
            <Mark /> is that function, without the permanent overhead.
          </div>
          <div className="pd-body" style={{ margin: '14px auto 0', maxWidth: '34em' }}>
            Structured for your specific mandate — engaged for the deal, with economics tied
            directly to a successful close.
          </div>
        </div>
      </section>

      {/* ── Track record — the first dark movement, bracketed by bleed arcs ── */}
      <div style={{ marginTop: 'clamp(80px, 10vw, 150px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-tr">
        <BandArt><FootprintMap /></BandArt>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Selected transaction experience</div>
          <h2 className="pd-h2" data-rv>We've done this about 150 times.</h2>
          <div data-rv className="pd-body" style={{ marginTop: 24, maxWidth: '46em' }}>
            <Mark /> is a new firm. The dealmaker isn't. Paul Baker spent two decades in corporate
            development — building the M&amp;A function inside a national platform and running
            integration on some of the largest bank deals in the country.
          </div>
          <AttributionLine style={{ marginTop: 24 }} />
          <div className="pd-tombs rv-stagger" data-rv>
            <div className="pd-tomb">
              <div className="t">Wrench Group</div>
              <div className="meta">2016–2025 · FOUNDING PLATFORM THROUGH 36 ACQUISITIONS · ~$2.9B ENTERPRISE VALUE</div>
              <div className="names">
                Coolray · Parker &amp; Sons · Morris-Jenkins · NexGen · Service Champions · Williams
                Comfort Air · Abacus · Berkeys · CoolToday · Lindstrom · Baker Brothers · Boothe's ·
                Mountain Air · Plumbline <span className="grp">— and two dozen more.</span>
              </div>
            </div>
            <div className="pd-tomb">
              <div className="t">JPMorgan Chase</div>
              <div className="meta">2005–2015 · INTEGRATION LEAD ON MULTI-BILLION-DOLLAR BANK AND FINTECH ACQUISITIONS</div>
              <div className="names">
                Bank One · Washington Mutual · Chase Paymentech · Collegiate Funding Services ·
                Neovest · Vastera · clearXchange.
              </div>
            </div>
          </div>
          <div data-rv style={{ marginTop: 36 }}>
            <Link href="/track-record" className="pd-link">Explore the full record →</Link>
          </div>
        </div>
      </section>
      <Swoosh dir="up" />

      {/* ── The firm ── */}
      <section id="why" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-firm-grid rv-stagger" data-rv>
          <div>
            <div className="pd-seclabel">The firm</div>
            <h2 className="pd-h2">A corporate development function. Yours when you need it.</h2>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              <div>
                Large acquirers run corporate development in-house — a permanent team that finds
                targets, evaluates them, closes them, and integrates them. Almost nobody buying
                companies under $250M can justify the standing cost of that infrastructure.
              </div>
              <div>
                <Mark /> is that function, engaged deal by deal. We source off-market, run the
                analysis, drive the diligence, and carry the negotiation to close. Led by Paul
                Baker, who has led or co-led more than 150 acquisitions doing exactly this work inside a
                national platform and a global bank, our team brings institutional execution to
                your thesis.
              </div>
              <div>
                We work exclusively on the buy side, and we take one client per target.
              </div>
            </div>
            <div className="pd-drows" style={{ marginTop: 56 }}>
              <div className="pd-drow">
                <div className="k">The function</div>
                <div className="v">Sourcing, valuation, modeling, diligence, negotiation, and the first 180 days after close. The whole acquisition lifecycle, run for you.</div>
              </div>
              <div className="pd-drow">
                <div className="k">The record</div>
                <div className="v">150+ acquisitions closed. $5B+ in revenue added to buyers. Two decades on the buy side.</div>
              </div>
              <div className="pd-drow">
                <div className="k">The focus</div>
                <div className="v">Buyers only, one client per target. It's a narrower practice than most firms run, which ensures our clients get our full strategic bandwidth.</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-founder-photo">
              <img
                src="/founder-portrait.jpg"
                alt="Paul Baker, founder of smbX"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }}
              />
            </div>
            <div className="pd-advisor-card">
              <div style={{ fontWeight: 700, fontSize: 21, letterSpacing: '-0.012em' }}>Firm leadership</div>
              <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
                <b style={{ color: 'var(--pd-ink)' }}>Paul Baker, Founder.</b> Twenty years as a deal captain — Director of
                Corporate Development at Wrench Group, where he built the M&amp;A engine that took a
                startup platform to a national leader through 36 acquisitions, and Director of
                Acquisition Integration at JPMorgan Chase, integrating the bank's largest fintech
                and banking deals. He has sat on the buyer's side of the table for 150+
                acquisitions. Now he anchors the team sitting on yours.
              </div>
              <div style={{ marginTop: 16 }}>
                <Link href="/about" className="pd-link">More about the firm →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The engagement — Slack feature showcase: vertical nav swaps a
             framed stage panel ── */}
      <section className="pd-wrap pd-section-lg">
        <SectionHead
          label="The engagement"
          title={<>What we run for you.</>}
          sub={<>The complete acquisition lifecycle — six phases, one accountable team.</>}
        />
        <EngagementShow />
      </section>

      {/* ── How it works — the same disciplined process, shown as it runs for
             each buyer type (per-situation scenario, pill-tab swapped) ── */}
      <section id="how" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <SectionHead
          label="How it works"
          title={<>How a deal runs — for your situation.</>}
          sub={<>One disciplined process, adapted to how you buy. Fast enough to win the target worth owning — pick your situation.</>}
        />
        <HowItWorks />
      </section>

      {/* ── Value creation — a dark movement; the number is the hero ── */}
      <div style={{ marginTop: 'clamp(96px, 11vw, 168px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-val">
        <span className="pd-spark" aria-hidden="true" />
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Value creation</div>
          <div className="pd-valgrid rv-stagger" data-rv style={{ marginTop: 24 }}>
            <div>
              <div className="pd-bignum">180</div>
              <div className="pd-bignum-label">DAYS</div>
            </div>
            <div>
              <h2 className="pd-h2">
                Closing is just the beginning. Value is realized in the first 180 days.
              </h2>
              <div className="pd-body" style={{ marginTop: 22, maxWidth: '44em' }}>
                Most middle-market acquirers don't have a dedicated Integration Management Office
                (IMO). When a deal closes, the transition is often handed to executives who are
                already stretched thin running the core business. We stay engaged through the
                transition to help execute the integration playbook.
              </div>
            </div>
          </div>
          <div className="pd-steps rv-stagger" data-rv style={{ marginTop: 'clamp(64px, 7vw, 100px)' }}>
            {VALUE_PILLARS.map(p => (
              <div className="pd-step" key={p.num}>
                <div className="num">{p.num}</div>
                <div className="t">{p.t}</div>
                <div className="b">{p.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Swoosh dir="up" />

      {/* ── Who it's for — centered intro, then the interactive segment nav ── */}
      <section id="who" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <SectionHead label="Who it's for" title={<>You bring the thesis. We bring the team.</>} />
        <WhoSelector />
      </section>

      {/* ── Industries — centered intro, then the anchor market + hunt board ── */}
      <section id="industries" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <SectionHead
          label="Industries"
          title={<>We know these markets cold. And we'll learn yours.</>}
          sub={<>
            Deep operating history in the essential-service trades — plus active theses in the
            fragmented, recurring-revenue niches where a disciplined buyer can still buy well.
            Already have a market? We'll work yours.
          </>}
        />
        <div className="pd-anchorcard" data-rv style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}>
          <div className="k">Home &amp; essential services</div>
          <div className="b">
            HVAC, plumbing, electrical. Our founder built a national platform here through 36
            acquisitions. We know what these businesses are worth, who's consolidating, and what a
            seller's broker will try.
          </div>
        </div>
        <div data-rv className="pd-seclabel" style={{ marginTop: 56 }}>
          Where we're actively hunting
        </div>
        <div className="pd-huntboard rv-stagger" data-rv>
          {HUNTING.map((h, i) => (
            <div className="pd-hunt" key={h.k}>
              <span className="no">{String(i + 1).padStart(2, '0')}</span>
              <span className="nm">{h.k}</span>
              <span className="th">{h.v}</span>
            </div>
          ))}
        </div>
        <div data-rv className="pd-body-sm" style={{ marginTop: 26, maxWidth: '52em' }}>
          These are theses, not limits. If you're buying in a market we haven't named,{' '}
          <a className="pd-link" href="#yulia">tell us</a> — we've built acquisition
          programs from a blank sheet before.
        </div>
      </section>

      {/* ── How we find them — centered statement intro, then a 3-up ── */}
      <section className="pd-wrap pd-section-lg pd-accent al">
        <SectionHead label="How we find them" title={<>The best targets aren't for sale.</>} quote />
        <div className="pd-findgrid rv-stagger" data-rv>
          <div className="pd-findcol">
            <div className="k">THE OWNER</div>
            <div className="v">
              The owner you want to buy is rarely on a broker's list. They don't want their
              employees to find out, their competitors to know, or to sit through a dozen showings
              with tire-kickers. And they certainly don't want to pay a broker 10% to make it
              happen.
            </div>
          </div>
          <div className="pd-findcol">
            <div className="k">THE WAIT</div>
            <div className="v">
              So they wait. Most will only take a call when someone arrives with a specific buyer,
              a defined thesis, and a serious reason to talk.
            </div>
          </div>
          <div className="pd-findcol">
            <div className="k">THE CALL</div>
            <div className="v" style={{ color: 'var(--pd-ink)' }}>
              <b>That is the call our team makes on your behalf.</b> No auction, no bidding war, no
              thirty other buyers who have already seen the book. Just a direct conversation with an
              owner who hasn't been shopped — where price is a strategic discussion, not a
              competition.
            </div>
          </div>
        </div>
      </section>

      {/* ── Whose side — a dark movement ── */}
      <div style={{ marginTop: 'clamp(96px, 11vw, 168px)' }}><Swoosh dir="in" /></div>
      <section className="pd-dark bl-side">
        <BandArt><Mesh /></BandArt>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Whose side we're on</div>
          <div className="pd-askew rv-stagger" data-rv style={{ alignItems: 'end' }}>
            <h2 className="pd-quote" style={{ maxWidth: '11em' }}>
              The seller has a broker. Who is working for you?
            </h2>
            <div className="off">
              <div className="pd-statement">
                We are. Start to <span style={{ color: 'var(--pd-coral)' }}>finish.</span>
              </div>
              <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: 460 }}>
                We represent buyers, and only buyers — one client per target. You get our full
                attention, unfiltered analysis, and a proprietary deal that stays yours.
              </div>
            </div>
          </div>
        </div>
      </section>
      <Swoosh dir="up" />

      {/* ── Pull-quote — one statement, centered, nothing else ── */}
      <section className="pd-wrap pd-section-lg">
        <h2 className="pd-quote" data-rv style={{ maxWidth: '15em', margin: '0 auto', textAlign: 'center' }}>
          Your first deal is the other side's hundredth. Even the odds.
        </h2>
      </section>

      {/* ── FAQ — centered intro, then the list ── */}
      <section className="pd-wrap pd-section-lg">
        <SectionHead label="Straight answers" title={<>Common pre-engagement questions.</>} />
        <div className="pd-faq rv-stagger" data-rv>
          {FAQ.map(f => (
            <div className="pd-faq-item" key={f.q}>
              <div className="q">{f.q}</div>
              <div className="a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA — the closing dark movement ── */}
      <div style={{ marginTop: 'clamp(96px, 11vw, 168px)' }}><Swoosh dir="in" /></div>
      <section id="book" className="pd-dark bl-cta" style={{ scrollMarginTop: 90 }}>
        <span className="pd-spark" aria-hidden="true" />
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-cta-grid rv-stagger" data-rv>
            <div>
              <h2 className="pd-cta-h">Let's go find the right fit.</h2>
              <div className="pd-body" style={{ marginTop: 24, maxWidth: 480 }}>
                Take two minutes with our acquisition engine to outline your thesis — or speak
                with our team directly. It's confidential either way, and there's no retainer to
                find out if we're a match.
              </div>
              <div style={{ marginTop: 44, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="pd-pill-primary pd-pill-lg" href="#yulia" onClick={() => trackEvent('practice_cta_clicked', { placement: 'cta-yulia' })}>Build your market map →</a>
                <a
                  className="pd-pill pd-pill-lg-quiet"
                  href={bookHref()}
                  target={bookTarget()}
                  rel={bookTarget() ? 'noreferrer' : undefined}
                  onClick={() => trackEvent('practice_booking_clicked', { placement: 'cta' })}
                >
                  Confidential consultation
                </a>
              </div>
            </div>
            <LeadForm />
          </div>
        </div>
      </section>
      <Swoosh dir="up" />
    </PracticeShell>
  );
}
