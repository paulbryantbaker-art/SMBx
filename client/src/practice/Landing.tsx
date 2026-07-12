/**
 * Practice-site landing — corpdevservices layout + Paul's copy deck
 * (2026-07-11) + the intensity pass (2026-07-12): restraint with drama.
 * Scroll: nav · hero + Target Mapping Engine · stat band (numbers as the largest
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
    b: "You don't need standing integration overhead. Our team acts as your on-demand IMO, driving the transition. We manage vendor consolidation, employee onboarding, and operational alignment so your team can focus on the business.",
  },
  {
    num: 'EXECUTION',
    t: 'Synergy capture',
    b: 'The model promised cost savings and cross-sell revenue. We track and execute against those specific targets through the first six months, ensuring the deal you modeled is the business you actually get.',
  },
];

const HUNTING = [
  { k: 'Elevator & escalator service', v: 'Code-mandated recurring revenue, 90%+ retention, still mostly independent.' },
  { k: 'Water & wastewater services', v: 'Multi-year municipal contracts and a decade of infrastructure funding behind it.' },
  { k: 'Commercial landscaping & grounds', v: 'Route-based recurring contracts, a vast fragmented base, sane pricing.' },
  { k: 'Fire & life safety', v: 'Mandated inspection revenue; still no dominant player in most regions.' },
  { k: 'Specialty & industrial distribution', v: 'Non-discretionary demand, recurring MRO revenue, real enterprise value.' },
  { k: 'Healthcare RCM & non-clinical', v: 'Recurring, tech-enabled, and free of the regulatory tangle of physician practices.' },
  { k: 'Managed IT / MSP', v: "Contracted recurring revenue in secondary metros the consolidators haven't reached." },
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
        <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.65, color: 'var(--pd-body)' }}>
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

export default function Landing() {
  return (
    <PracticeShell home>
      {/* ── Hero — statement left, the engine right ── */}
      <section className="pd-hero">
        <div className="pd-herosplit">
          <div>
            <h1 className="pd-h1" style={{ margin: 0, fontSize: 'clamp(40px, 5vw, 80px)' }}>
              Rev up your acquisition engine and start adding real value&nbsp;today.
            </h1>
            <div className="pd-sub" style={{ margin: '30px 0 0', maxWidth: '30em', fontSize: 'clamp(17px, 1.5vw, 20px)' }}>
              <b style={{ color: 'var(--pd-ink)', fontWeight: 700 }}>Institutional-grade corporate development, on demand.</b>{' '}
              We execute your M&amp;A vision so you can focus on your business. Through a streamlined
              onboarding process, our senior buy-side team can start mapping targets and building
              your thesis immediately.
            </div>
          </div>
          <div>
            <YuliaIntake />
            <div style={{ marginTop: 16, fontSize: 14.5, color: 'var(--pd-tert)' }}>
              Prefer to speak with our team first?{' '}
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookTarget() ? 'noreferrer' : undefined}
                style={{ color: 'var(--pd-coral-link)', fontWeight: 600, textDecoration: 'underline' }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'hero-link' })}
              >
                Book a confidential consultation →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat band — the proof is the pitch; make it physically dominant ── */}
      <section className="pd-statband">
        <div className="pd-wrap">
          <div className="pd-stats rv-stagger" data-rv>
            <div className="pd-stat"><div className="n">150+</div><div className="l">Acquisitions closed</div></div>
            <div className="pd-stat"><div className="n">$5B+</div><div className="l">In revenue added to buyers</div></div>
            <div className="pd-stat"><div className="n">20</div><div className="l">Years of buy-side execution</div></div>
            <div className="pd-stat accent"><div className="n">1</div><div className="l">Side of the table — always the buyer's</div></div>
          </div>
        </div>
      </section>

      {/* ── The first read — show the artifact itself (sample, clearly
             labeled; content from the Market Map spec's worked example) ── */}
      <section className="pd-wrap pd-section">
        <div className="pd-askew rv-stagger" data-rv>
          <div>
            <MapDoc map={SAMPLE_MAP} headLabel="SAMPLE READ" />
          </div>
          <div className="off">
            <div className="pd-seclabel">The first read</div>
            <h2 className="pd-h2" style={{ maxWidth: 560, fontSize: 'clamp(32px, 3.6vw, 48px)' }}>A real read on your thesis, before you spend a dollar.</h2>
            <div style={{ marginTop: 24, fontSize: 17.5, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '30em' }}>
              Describe what you're buying. The Target Mapping Engine returns a preliminary market
              map — the universe, the economics, the competitive picture, and the risks — in about
              a minute. Our team sends the full version within 24 hours.
            </div>
            <div style={{ marginTop: 36 }}>
              <a
                className="pd-pill-primary pd-pill-lg"
                href="#yulia"
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'sample-showcase' })}
              >
                Build your market map →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── The gap — an observation about the buyer's situation, never a
             complaint about anyone else (confidence pass) ── */}
      <section className="pd-wrap pd-section">
        <div className="pd-ledger-head" data-rv style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 64 }}>
          <h2 className="pd-h2" style={{ maxWidth: 960 }}>Most acquirers under $250M don't have a dedicated deal team.</h2>
          <div className="pd-seclabel right">The gap</div>
        </div>
        <div className="pd-askew rv-stagger" data-rv>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              The companies that buy well have a corporate development function: a permanent team
              whose entire job is finding the right targets, pricing them properly, and getting
              them closed. At scale, it pays for itself many times over.
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              Below a certain size, the math doesn't work. A director of corp dev and an analyst
              runs well past half a million dollars a year — for a function you may only utilize
              twice a year. As a result, the acquisitions that would compound your business get run
              off the side of a desk against a seller who does this professionally.
            </div>
          </div>
          <div className="off">
            <div style={{ fontSize: 'clamp(24px, 2.5vw, 33px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.22 }}>
              smbX is that function, without the permanent overhead.
            </div>
            <div style={{ marginTop: 14, fontSize: 18, lineHeight: 1.6, color: 'var(--pd-body)' }}>
              Structured for your specific mandate — engaged for the deal, with economics tied
              directly to a successful close.
            </div>
          </div>
        </div>
      </section>

      {/* ── Track record — the first dark movement ── */}
      <section className="pd-dark" style={{ marginTop: 'clamp(100px, 12vw, 170px)' }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Track record</div>
          <h2 className="pd-h2" data-rv style={{ maxWidth: 820 }}>We've done this more than 150 times.</h2>
          <div data-rv style={{ marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '46em' }}>
            Two decades driving the deal from inside the buyer — sourcing, negotiating, closing,
            and integrating acquisitions at platform scale.
          </div>
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
            <Link href="/track-record" className="pd-link">Explore the full deal sheet →</Link>
          </div>
        </div>
      </section>

      {/* ── The firm ── */}
      <section id="why" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-firm-grid rv-stagger" data-rv>
          <div>
            <div className="pd-seclabel">The firm</div>
            <h2 className="pd-h2">A corporate development function. Yours when you need it.</h2>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              <div>
                Large acquirers run corporate development in-house — a permanent team that finds
                targets, evaluates them, closes them, and integrates them. Almost nobody buying
                companies under $250M can justify the standing cost of that infrastructure.
              </div>
              <div>
                smbX is that function, engaged deal by deal. We source off-market, run the
                analysis, drive the diligence, and carry the negotiation to close. Led by Paul
                Baker, who has closed more than 150 acquisitions doing exactly this work inside a
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
              <div style={{ fontWeight: 700, fontSize: 19 }}>Firm leadership</div>
              <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.65, color: 'var(--pd-body)' }}>
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

      {/* ── The engagement — scope of service as an institutional index ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-ledger-head" data-rv style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 0 }}>
          <h2 className="pd-h2" style={{ maxWidth: 760 }}>What we run for you.</h2>
          <div className="pd-seclabel right">The engagement</div>
        </div>
        <div className="pd-index rv-stagger" data-rv>
          {ENGAGEMENT.map((e, i) => (
            <div className="pd-indexrow" key={e.k}>
              <div className="no">{String(i + 1).padStart(2, '0')}</div>
              <div className="t">{e.k}</div>
              <div className="b">{e.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process — a timeline: one rule, three nodes ── */}
      <section id="how" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-seclabel">The process</div>
        <h2 className="pd-h2" data-rv style={{ maxWidth: 760 }}>Execution without the friction.</h2>
        <div className="pd-timeline rv-stagger" data-rv>
          <div className="pd-tstep">
            <div className="no">01</div>
            <div className="t">Conversation</div>
            <div className="b">Provide your target criteria to our mapping engine. We map your market instantly and prepare the brief for your consultation.</div>
            <a className="pd-link" href="#yulia">Build your market map →</a>
          </div>
          <div className="pd-tstep">
            <div className="no">02</div>
            <div className="t">Curated targets</div>
            <div className="b">We cover a market in days — a full target landscape, screened and scored, typically inside a week of the mandate. Our team hand-picks the targets that meet your exact criteria.</div>
            <a className="pd-link" href="#why">How we work →</a>
          </div>
          <div className="pd-tstep">
            <div className="no">03</div>
            <div className="t">Close with confidence</div>
            <div className="b">Diligence run, price disciplined, negotiation carried to signing — and managed through the first 180 days after close.</div>
            <a className="pd-link" href="#book">Book a call →</a>
          </div>
        </div>
      </section>

      {/* ── Value creation — the third dark movement; the number is the hero ── */}
      <section className="pd-dark" style={{ marginTop: 'clamp(110px, 12.5vw, 180px)' }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Value creation</div>
          <div className="pd-valgrid rv-stagger" data-rv style={{ marginTop: 24 }}>
            <div>
              <div className="pd-bignum">180</div>
              <div className="pd-bignum-label">DAYS</div>
            </div>
            <div>
              <h2 className="pd-h2" style={{ maxWidth: 720, fontSize: 'clamp(30px, 3.4vw, 44px)' }}>
                Closing is just the beginning. Value is realized in the first 180 days.
              </h2>
              <div style={{ marginTop: 22, fontSize: 17.5, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '44em' }}>
                Most middle-market acquirers don't have a dedicated Integration Management Office
                (IMO). When a deal closes, the transition often gets dumped on the plates of
                executives already running the core business. We stay engaged through the wire to
                execute the integration playbook.
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

      {/* ── Who it's for — segment rows, read like a ledger ── */}
      <section id="who" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-ledger-head" data-rv style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 0 }}>
          <h2 className="pd-h2">You bring the thesis. We bring the team.</h2>
          <div className="pd-seclabel right">Who it's for</div>
        </div>
        <div className="pd-whorows rv-stagger" data-rv>
          {SEGMENTS.map(s => (
            <Link key={s.slug} href={`/buyers/${s.slug}`} className="pd-whorow">
              <div className="t">{s.cardTitle}</div>
              <div className="b">{s.cardBody}</div>
              <div className="arr" aria-hidden>→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Industries — a dense list, not cards ── */}
      <section id="industries" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-seclabel">Industries</div>
        <h2 className="pd-h2" data-rv style={{ maxWidth: 820 }}>We know these markets cold. And we'll learn yours.</h2>
        <div data-rv style={{ marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '46em' }}>
          Deep operating history in the essential-service trades — plus active theses in the
          fragmented, recurring-revenue niches where a disciplined buyer can still buy well.
          Already have a market? We'll work yours.
        </div>
        <div className="pd-scar" data-rv>
          <div className="t" style={{ color: 'var(--pd-coral-link)' }}>Home &amp; essential services</div>
          <div className="b">
            HVAC, plumbing, electrical. Our founder built a national platform here through 36
            acquisitions. We know what these businesses are worth, who's consolidating, and what a
            seller's broker will try.
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'var(--pd-ink)' }}>
          Where we're actively hunting
        </div>
        <div className="pd-indgrid rv-stagger" data-rv>
          {HUNTING.map(h => (
            <div className="pd-ind" key={h.k}>
              <span className="k">{h.k}</span> <span className="v">— {h.v}</span>
            </div>
          ))}
        </div>
        <div data-rv style={{ marginTop: 26, fontSize: 15.5, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: '52em' }}>
          These are theses, not limits. If you're buying in a market we haven't named,{' '}
          <a className="pd-link" href="#yulia" style={{ fontSize: 15 }}>tell us</a> — we've built acquisition
          programs from a blank sheet before.
        </div>
      </section>

      {/* ── How we find them — statement + asymmetry ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-askew rv-stagger" data-rv>
          <div>
            <div className="pd-seclabel">How we find them</div>
            <h2 className="pd-quote">The best targets aren't for sale.</h2>
          </div>
          <div className="off" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              The owner you want to buy is rarely on a broker's list. They don't want their
              employees to find out, their competitors to know, or to sit through a dozen showings
              with tire-kickers. And they certainly don't want to pay a broker 10% to make it
              happen.
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              So they wait. Most will only take a call when someone arrives with a specific buyer,
              a defined thesis, and a serious reason to talk.
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-ink)' }}>
              <b>That is the call our team makes on your behalf.</b> No auction, no bidding war, no
              thirty other buyers who have already seen the book. Just a direct conversation with an
              owner who hasn't been shopped — where price is a strategic discussion, not a
              competition.
            </div>
          </div>
        </div>
      </section>

      {/* ── Whose side — the second dark movement ── */}
      <section className="pd-dark" style={{ marginTop: 'clamp(110px, 12.5vw, 180px)' }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-seclabel">Whose side we're on</div>
          <div className="pd-askew rv-stagger" data-rv style={{ alignItems: 'end' }}>
            <h2 className="pd-quote" style={{ maxWidth: '11em' }}>
              The seller has a broker. Who is working for you?
            </h2>
            <div className="off">
              <div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
                We are. Start to <span style={{ color: 'var(--pd-coral)' }}>finish.</span>
              </div>
              <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: 460 }}>
                We represent buyers, and only buyers — one client per target. You get our full
                attention, unfiltered analysis, and a proprietary deal that stays yours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pull-quote — one statement, nothing else ── */}
      <section className="pd-wrap pd-section-lg">
        <h2 className="pd-quote" data-rv style={{ maxWidth: '13em' }}>
          Your first deal is the other side's hundredth. Even the odds.
        </h2>
      </section>

      {/* ── FAQ ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-seclabel">Straight answers</div>
        <h2 className="pd-h2" data-rv style={{ maxWidth: 760 }}>Common pre-engagement questions.</h2>
        <div className="pd-faq rv-stagger" data-rv>
          {FAQ.map(f => (
            <div className="pd-faq-item" key={f.q}>
              <div className="q">{f.q}</div>
              <div className="a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA — the third dark movement ── */}
      <section id="book" className="pd-dark" style={{ marginTop: 'clamp(110px, 12.5vw, 180px)', scrollMarginTop: 90 }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-cta-grid rv-stagger" data-rv>
            <div>
              <h2 className="pd-cta-h">Let's go find the one.</h2>
              <div style={{ marginTop: 24, fontSize: 18, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: 480 }}>
                Take two minutes with our Target Mapping Engine to build your thesis — or speak
                with our team directly. Confidential either way, and there's no retainer to find
                out if we're a fit.
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
    </PracticeShell>
  );
}
