/**
 * Practice-site landing — v3, the Claude Design handoff (practiceSite/
 * bundle, implemented 2026-07-16). Section order: nav · hero (chat engine,
 * `.pd-hero-fold` so the proof band's curve crests at the fold, `.pd-heromesh`
 * dot-matrix behind the input) · dark proof band with count-up (#proof) ·
 * Why us evidence grid (#why) · 7-phase accordion (#how) · sample read
 * (#sample) · who-it's-for index (#who) · 12-sector teaser (#sectors) ·
 * whose-side band · booking CTA (#cta) · footer. Copy is Paul's approved
 * deck from the bundle — verbatim, do not rewrite here.
 *
 * The chat engine is the REAL intake (YuliaIntake — SSE market map, lead
 * capture, mobile sheet); the prototype's scripted demo only illustrated it.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import PracticeShell from './PracticeShell';
import YuliaIntake from './YuliaIntake';
import { bookHref, bookTarget } from './leads';
import { trackEvent } from '../lib/analytics';

/* ── Who it's for — the interactive index (copy verbatim from the bundle) ── */
const WHO = [
  {
    label: 'Family offices',
    body: 'Direct ownership without the fund overhead. We run the search and the process; you keep the asset, the control, and the relationship — no blind pool, no committee, no clock.',
    link: 'Talk to us about direct deals →',
  },
  {
    label: 'Independent sponsors',
    body: 'Control the deal before you raise a dollar. We help you find it, lock it, and build the numbers your capital partners will actually back — so you walk into that room with a deal, not a pitch.',
    link: 'Talk to us about a live deal →',
  },
  {
    label: 'Search funds & solo acquirers',
    body: "Your first acquisition is the other side's hundredth. We put a senior deal team in your corner — sourcing, diligence, and the negotiation — so you're not learning the hardest lessons with your own money on the line.",
    link: 'Talk to us about your search →',
  },
  {
    label: 'Operators & strategics',
    body: 'Grow by acquisition without standing up a corp-dev team. We source the tuck-ins and adjacencies, price them, and run the process quietly — so you can move on a competitor without tipping the market.',
    link: 'Talk to us about an add-on →',
  },
  {
    label: 'PE firms',
    body: "Add-on sourcing and execution capacity that flexes with your pipeline. For lower-middle-market funds without deep in-house origination — we find and work the proprietary deals your team doesn't have the bandwidth to chase.",
    link: 'Talk to us about origination →',
  },
];

/* ── Why us — six evidence cards ── */
const WHY: { nm: string; bd: string; more: string; xp: React.ReactNode }[] = [
  {
    nm: 'An acquisition machine, not a broker',
    bd: 'The buyers who outperform treat acquisition as a repeatable capability, not an event. We stand that capability up for you — thesis, pipeline, cadence, close — and run it end to end.',
    more: 'THE EVIDENCE',
    xp: (
      <>
        <p>McKinsey's two-decade study of the Global 2,000 finds <strong>programmatic acquirers — two or more deals a year — outperform their peers by roughly 20% in total shareholder return over ten years</strong>, with the lowest variance of any strategy. Bain's parallel finding: frequent acquirers now beat inactive peers by about 130%.</p>
        <p>The edge isn't a golden deal. It's the system — a thesis tied to strategy, a governed pipeline with stage gates, a weekly cadence, and integration planned before close. That's what we install and run under your name.</p>
      </>
    ),
  },
  {
    nm: 'A target universe in days, not weeks',
    bd: 'Our AI stack compresses an analyst pod’s month of market mapping into days of a senior operator’s supervised work. You see the whole market before most teams finish staffing.',
    more: 'HOW',
    xp: (
      <>
        <p>A market map that took an analyst pod two to four weeks now takes hours: AI search across <strong>12M+ private companies</strong>, scored against your buy box. In one McKinsey-documented case, a corp-dev team scored <strong>500+ targets in under a day</strong> — and closed three acquisitions within months.</p>
        <p>Across the industry, executives using these tools report roughly 20% lower deal costs, and 40% report cycles running 30–50% faster. Same class of stack here — every output reviewed by the operator before it reaches you.</p>
      </>
    ),
  },
  {
    nm: 'Off-market deals, at better prices',
    bd: 'We reach owners who were never for sale — directly, quietly, under your name. Proprietary deals skip the auction, and they price like it.',
    more: 'THE MATH',
    xp: (
      <>
        <p>We run the outreach engine top-quartile buyers run: multi-channel, five to twelve touches per owner over months, under your brand — so the owner sees a serious buyer, not a campaign. Most of the deals we work were never listed anywhere.</p>
        <p>The industry rule of thumb — corroborated across sources, and honest as a rule of thumb — is that <strong>owner-direct deals price half a turn to two turns of EBITDA below auctioned ones</strong>. Proprietary sourcing widens the funnel and lowers the entry price at the same time.</p>
      </>
    ),
  },
  {
    nm: 'Senior-only. No junior hand-off.',
    bd: 'At a bank, a senior wins the mandate and juniors execute. Here, every deal is worked by the operator who closed the 150. The AI replaces the analyst pod — never the judgment.',
    more: 'WHAT THAT MEANS',
    xp: (
      <>
        <p>Corp-dev teams have always farmed the grunt work out to junior pods. AI now does that layer faster and more thoroughly — market maps, first-pass models, CIM triage, diligence extraction, memo drafts.</p>
        <p>What can't be automated — the thesis, the negotiation, reading a seller across the table — is exactly what you're hiring. Every call, every model review, every LOI: the same senior operator, on every deal.</p>
      </>
    ),
  },
  {
    nm: 'Buy-side only. One client per target.',
    bd: 'No sell-side conflicts, no target shopped to two buyers, no success-fee incentive to push a bad deal across the line. Structurally on your side.',
    more: 'WHY IT MATTERS',
    xp: (
      <>
        <p>Most advisors work both sides of the market, and a success fee pays the same whether the deal was good for you or merely closed. Those incentives leak into every recommendation.</p>
        <p>We've never taken a sell-side engagement, and while we hunt a lane for you we don't hunt it for anyone else. <strong>When we tell you to walk, walking costs us.</strong> That's the point.</p>
      </>
    ),
  },
  {
    nm: 'A fraction of the cost of in-house',
    bd: 'An in-house corp-dev function runs $500K–$1M a year and takes a year to build. We deliver the whole function for a fraction of that — buy-side focused, where most banks live on the sell side.',
    more: 'THE COMPARISON',
    xp: (
      <>
        <p>In-house corp dev runs <strong>$500K–$1M+ a year fully loaded</strong> — before the year it takes to hire and ramp. And most banks are built for the sell side; running a buy-side search is a different job, and rarely their first love.</p>
        <p>The modern tooling that replaces the junior pod costs less than one analyst's salary. Those unit economics are the engine of this model — and they're priced into what you pay us.</p>
      </>
    ),
  },
];

/* ── How it works — seven phases ── */
const PHASES = [
  { ph: 'Thesis', t: 'We turn "I want to buy something" into a plan you can act on.', bd: 'We turn "I want to buy something" into a plan you can act on — the sector, size, and economics worth your time, and the deal-breakers that aren’t. If the thing you’re chasing isn’t buyable in today’s market, we’ll say so early, and point you somewhere better.' },
  { ph: 'Sourcing', t: 'We find the owners who aren’t looking to sell.', bd: 'We map the market, narrow it to the companies worth a call, and reach them directly and quietly, under your name. Most of the deals we work were never listed anywhere.' },
  { ph: 'Evaluation', t: 'We tell you what a business is really worth, and whether to walk.', bd: 'We rebuild the financials, test the add-backs the seller’s advisor put in, and find the things that don’t show up in a pitch — customer concentration, owner dependence, the maintenance nobody mentioned.' },
  { ph: 'Structure & offer', t: 'We shape the deal and take it to the seller.', bd: 'Price is one piece of it; so are seller notes, earnouts, rollover, and escrows. We build the financing a lender will actually back, write the LOI, and run the negotiation for you.' },
  { ph: 'Diligence & close', t: 'This is where most deals come apart, and where we do the heaviest work.', bd: 'We run diligence across the financials, legal, tax, and operations, keep the accountants and lawyers and lenders on schedule, and hold every thread together through to a signed deal.' },
  { ph: 'Integration', t: 'The price is set at close. The value comes in the six months after.', bd: 'We plan the first hundred days — keeping the people and customers you just paid for — the part most buyers underestimate and most advisors skip.' },
  { ph: 'Value creation · add-on service', t: 'After the close, we can stay on to help the thesis come true.', bd: 'For clients who want it, we stay engaged past the hundred days — tracking performance against the original thesis, building the pricing and operating levers into a plan, and sourcing the add-on acquisitions that turn one deal into a platform. Optional, and scoped separately.' },
];

/* ── Key industry verticals — the 12-row teaser to /industries ── */
const HUNTS = [
  { nm: 'Fire & life safety', th: 'NFPA 25 and 72 make inspection the law — every install becomes an annuity.' },
  { nm: 'Elevator & escalator service', th: 'Mandated inspections, sticky contract books, light capex, aging owners.' },
  { nm: 'Power & grid infrastructure services', th: 'Transformer refurb, substations, certified testing — the layer electrification runs on.' },
  { nm: 'Building automation & critical power', th: 'Controls, commissioning, cooling and backup power — recurring service where downtime isn’t an option.' },
  { nm: 'Testing, inspection & certification / NDT', th: 'Demand written into code, behind a certification moat — and succession in almost every shop.' },
  { nm: 'Environmental & industrial cleaning', th: 'Permit-gated, regulation-driven, and rarely brokered.' },
  { nm: 'Water & wastewater contract O&M', th: 'Multi-year municipal contracts — the most durable revenue in the services economy.' },
  { nm: 'Specialty & MRO distribution', th: 'Vendor authorizations and VMI programs that underwrite like contracts.' },
  { nm: 'Machine shops & precision manufacturing', th: 'AS9100 and ISO 13485 qualification cycles make revenue stick; reshoring is the tailwind.' },
  { nm: 'Food contract manufacturing & co-packing', th: 'Multi-year supply agreements, with real density in our backyard.' },
  { nm: 'Non-emergency medical transport', th: 'Recurring, reimbursement-funded trips — underwritten with eyes open.' },
  { nm: 'Revenue cycle management & medical billing', th: 'Fragmented and clean to diligence — we underwrite the niche before the number.' },
];

/** Roll a stat's number up to its value (1300ms cubic ease-out), preserving
 *  prefix/suffix text ("~$21B" counts the 21). Zero stays zero by design. */
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

/** The dark proof band — stats roll up when the band enters the viewport. */
function ProofBand() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!reduce) host.querySelectorAll<HTMLElement>('.pd-stat .n').forEach(countUp);
    }), { threshold: 0.35 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  return (
    <section className="pd-dark bl-tr" id="proof">
      <span className="pd-spark" aria-hidden="true" />
      <div className="pd-wrap pd-dark-pad">
        <div className="pd-mono" data-rv style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pd-tert)', textAlign: 'center' }}>
          Two decades on the buy side
        </div>
        <div className="pd-stats rv-stagger" data-rv ref={ref} style={{ marginTop: 'clamp(32px, 3.8vw, 54px)' }}>
          <div className="pd-stat"><div className="n">150+</div><div className="l">Acquisitions closed</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">Enterprise value added</div></div>
          <div className="pd-stat"><div className="n">~$21B</div><div className="l">Transactions touched</div></div>
          <div className="pd-stat accent"><div className="n">0</div><div className="l">Sell-side engagements. Ever.</div></div>
        </div>
      </div>
    </section>
  );
}

/** Who it's for — five giant names; the active one swaps the side panel. */
function WhoIndex() {
  const [active, setActive] = useState(0);
  return (
    <div className="pd-whosel" data-rv>
      <div className="names rv-stagger" data-rv>
        {WHO.map((w, i) => (
          <a
            key={w.label}
            href="#who"
            className={`name${i === active ? ' on' : ''}`}
            onClick={e => { e.preventDefault(); setActive(i); }}
          >
            <span>{w.label}</span>
            <span className="arr" aria-hidden>→</span>
          </a>
        ))}
      </div>
      <div className="panel" aria-live="polite">
        <div className="pbody">{WHO[active].body}</div>
        <a className="pd-link" href="#cta">{WHO[active].link}</a>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <PracticeShell home>
      {/* ── Hero — the chat engine front and center; the section height leaves
             room for the proof band's curve to crest at the fold ── */}
      <section className="pd-hero pd-hero-c pd-hero-fold" id="top" style={{ justifyContent: 'center' }}>
        <div className="pd-heromesh" aria-hidden="true" />
        <div className="pd-heroc-inner">
          <h1 className="pd-h1">We'll build and run your business acquisition strategy tailored to your&nbsp;goals.</h1>
          <p className="pd-sub pd-sub-c">Institutional-grade corporate development, on demand.</p>
        </div>
        <div className="pd-showcase">
          <div className="pd-show-stage">
            <YuliaIntake />
          </div>
        </div>
        <div className="pd-hero-below">
          <a className="pd-samplelink" href="#cta" onClick={() => trackEvent('practice_booking_clicked', { placement: 'hero' })}>Or book a call instead</a>
          <span style={{ color: 'var(--pd-faint)' }}>·</span>
          <a className="pd-samplelink" href="#sample" onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-sample' })}>See a sample read →</a>
        </div>
      </section>

      <ProofBand />

      {/* ── Why us — six evidence cards in a hairline grid ── */}
      <section className="pd-section pd-accent al" id="why">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Why us</div>
            <h2 className="pd-h2">The machine serial acquirers build in-house. Yours, without the headcount.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              You already know what you want to buy. The question is who runs the hunt — a team you'd
              spend a year hiring, a bank with a seller's habits, or us. Here's the case.
            </p>
          </div>
          <div className="pd-whygrid rv-stagger" data-rv>
            {WHY.map((w, i) => (
              <details className="pd-why" key={w.nm}>
                <summary>
                  <div className="ix">{String(i + 1).padStart(2, '0')}</div>
                  <div className="nm">{w.nm}</div>
                  <div className="bd">{w.bd}</div>
                  <span className="more"><span className="lb-more">{w.more}</span><span className="lb-less">CLOSE</span></span>
                </summary>
                <div className="xp">{w.xp}</div>
              </details>
            ))}
          </div>
          <div className="pd-why-close" data-rv>
            <p className="pd-body">And it compounds — every engagement sharpens the thesis, the scorecards, and the playbook the next one runs on.</p>
            <a className="pd-link" href="#how" style={{ display: 'inline-block', marginTop: 22 }}>See how the machine runs →</a>
          </div>
        </div>
      </section>

      {/* ── How it works — the seven phases as a vertical accordion ── */}
      <section className="pd-section pd-accent ar" id="how">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">How it works</div>
            <h2 className="pd-h2">Buying a company is a hundred small decisions. We handle the ones that don't need you.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              A good acquisition isn't a single moment — it's months of work, in the right order,
              usually against someone who does this for a living. Here's what the job actually
              involves. You make the calls that matter. We do the rest.
            </p>
          </div>
          <div className="pd-phases rv-stagger" data-rv>
            {PHASES.map((p, i) => (
              <details className="pd-phase" key={p.ph}>
                <summary>
                  <div className="no">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="ph">{p.ph}</div>
                    <div className="t">{p.t}</div>
                  </div>
                  <div className="tog">+</div>
                </summary>
                <div className="bd">{p.bd}</div>
              </details>
            ))}
          </div>
          <div className="pd-phases-close" data-rv>
            <p className="pd-body">
              That's the work. Most acquisitions fall apart somewhere in the middle — an add-back
              that doesn't hold up, a diligence problem caught too late, a negotiation run by the
              more experienced side of the table.
            </p>
            <p className="strong">You make the decisions. We handle the rest, and we get you to the closing table.</p>
            <a className="pd-pill-primary pd-pill-lg" href="#yulia" style={{ marginTop: 34 }} onClick={() => trackEvent('practice_cta_clicked', { placement: 'how-close' })}>Bring us your idea →</a>
          </div>
        </div>
      </section>

      {/* ── Sample read — the flagship artifact, static and clearly labeled ── */}
      <section className="pd-section" id="sample">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Getting started</div>
            <h2 className="pd-h2">Every engagement starts with a read like this.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              Not a chatbot answer — an institutional market map: the universe, the short list, and
              the thing most buyers miss.
            </p>
          </div>
          <div data-rv style={{ marginTop: 'clamp(44px, 5.5vw, 72px)' }}>
            <div className="pd-map" style={{ maxWidth: 760, margin: '0 auto' }}>
              <div className="map-head">
                <img src="/logo-blue-x.png" alt="smbX.ai" style={{ height: 22, width: 'auto', display: 'block' }} />
                <span className="map-label">SAMPLE READ</span>
              </div>
              <div className="map-title">Commercial Landscaping — Southeast</div>
              <div className="map-thesis">Commercial landscaping · GA, NC, SC, TN · $2–8M EBITDA · commercial-contract mix</div>
              <div className="map-flow rv-stagger" data-rv>
                <div className="k">THE FUNNEL</div>
                <div className="f"><span className="n">~2,400</span><span className="l">operators in-footprint</span></div>
                <span className="arr">→</span>
                <div className="f"><span className="n">~180</span><span className="l">in your size band</span></div>
                <span className="arr">→</span>
                <div className="f"><span className="n">~55</span><span className="l">above 60% commercial-contract mix</span></div>
              </div>
              <div className="map-nine" data-rv>
                <div className="n">9</div>
                <div className="l">Of those 55, the number we'd tell you to spend real time on. The drop from 55 to 9 is the part you can't Google.</div>
              </div>
              <div className="map-screens rv-stagger" data-rv>
                <div className="k">WHAT SEPARATES THE 9</div>
                <div className="map-scr"><div className="i">01</div><div className="t">Route density.</div><div className="b">A crew running 8 stops in 4 miles is a different business than 8 stops across 40. It never shows in EBITDA, and it's the single biggest driver of margin after close. We'd rank the 55 by drive-time density before anything else.</div></div>
                <div className="map-scr"><div className="i">02</div><div className="t">Contract tenure.</div><div className="b">Month-to-month "commercial" revenue is worth a fraction of 3-year contracted revenue, even at identical margin. A third of the 55 won't survive this test.</div></div>
                <div className="map-scr"><div className="i">03</div><div className="t">Crew that stays without the owner.</div><div className="b">In this trade, the crews often leave with the seller. The ones where they don't are worth a full turn more — and you can check it in diligence before you're committed.</div></div>
              </div>
              <div className="map-insight" data-rv>
                <div className="k">WHAT MOST BUYERS MISS</div>
                <div className="v">Two companies here with identical EBITDA can be worth two turns apart on route density alone. Most buyers underwrite the earnings, ignore the drive time, and wonder why margins compress the quarter after close. We price the routes first, the EBITDA second.</div>
              </div>
              <div className="map-number" data-rv>
                <div className="k">THE NUMBER</div>
                <div className="big">$6–8M</div>
                <div className="v">On a $4M-EBITDA target at this size, getting the route-density read wrong is roughly a <strong>1.5–2.0x swing in EBITDA multiple</strong> — call it $6–8M of purchase price on a single deal, decided by one variable most buyers never model.</div>
              </div>
              <div className="map-verdict" data-rv>
                <div className="k">OUR READ</div>
                <div className="v">This is one of the last genuinely fragmented service niches in the region, and the window is open — but only for a buyer disciplined enough to pay for route quality and walk from the pretty-EBITDA traps. That discipline is the whole game here.</div>
              </div>
              <div className="map-foot">
                <div className="src">Preliminary sample — illustrative of the deliverable format.</div>
                <a className="map-pdf" href="#yulia" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} onClick={() => trackEvent('practice_cta_clicked', { placement: 'sample-run-yours' })}>Run yours →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="pd-section pd-accent al" id="who">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Who it's for</div>
            <h2 className="pd-h2">Built for serious buyers.</h2>
          </div>
          <WhoIndex />
        </div>
      </section>

      {/* ── Key industry verticals — teaser rows into /industries ── */}
      <section className="pd-section pd-accent ar" id="sectors">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Key industry verticals</div>
            <h2 className="pd-h2">We go deep in a handful of markets. Yours may be one of them.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              The sectors we know cold — the operators, the multiples, the diligence traps, and the
              targets already on our desk. Focus, not limits.
            </p>
          </div>
          <div className="pd-huntboard rv-stagger" data-rv style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
            {HUNTS.map(h => (
              <Link className="pd-hunt" href="/industries" key={h.nm} onClick={() => trackEvent('practice_sector_clicked', { sector: h.nm })}>
                <div className="nm">{h.nm}</div>
                <div className="th">{h.th}</div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'clamp(32px, 4vw, 48px)' }} data-rv>
            <Link className="pd-link" href="/industries">Read the full sector theses →</Link>
          </div>
        </div>
      </section>

      {/* ── Whose side — the second dark movement ── */}
      <section className="pd-dark bl-side" style={{ marginTop: 'clamp(130px, 15vw, 220px)' }}>
        <div className="pd-wrap pd-dark-pad">
          <div className="pd-askew">
            <div data-rv>
              <div className="pd-seclabel">Whose side we're on</div>
              <p className="pd-quote">The seller has a broker. Who is working for you?</p>
            </div>
            <div className="off" data-rv>
              <p className="pd-body">
                We represent buyers, and only buyers — one client per target. You get our full
                attention, unfiltered analysis, and a proprietary deal that stays yours.
              </p>
              <div style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="pd-pill-primary pd-pill-lg" href="#yulia" onClick={() => trackEvent('practice_cta_clicked', { placement: 'whose-side' })}>Build your market map →</a>
                <a className="pd-pill pd-pill-lg-quiet" href="#cta" onClick={() => trackEvent('practice_booking_clicked', { placement: 'whose-side' })}>Book a call</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder — the human behind the booking card (warmth pass
          2026-07-17: reviewers read the page as cold; a real photo, never
          stock — photography law). Copy is Paul's sanctioned announcement
          line; role line matches the footer. ── */}
      <section className="pd-section">
        <div className="pd-wrap">
          <div className="pd-fndband" data-rv>
            <img src="/founder-walking.webp" alt="Paul Baker" loading="lazy" />
            <div>
              <div className="pd-seclabel">Who you'll talk to</div>
              <p className="pd-statement">
                Twenty years as the internal deal captain for major platforms.
                Now running that same playbook for independent buyers.
              </p>
              <div className="fname">Paul Baker</div>
              <div className="frole">Founder · two decades on the buy side</div>
              <Link className="pd-link" href="/about">Meet Paul →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — the booking card, no form ── */}
      <section className="pd-section" id="cta">
        <div className="pd-wrap">
          <div className="pd-cta-grid" data-rv>
            <div>
              <h2 className="pd-cta-h">Start with a confidential conversation.</h2>
              <p className="pd-body" style={{ marginTop: 22 }}>
                Thirty minutes. Your ideas, our read on the market, and a straight answer on whether
                we're the right team to run it.
              </p>
            </div>
            <div className="pd-form">
              <div className="t">Book 30 minutes</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--pd-body)' }}>
                A personal conversation, not a sales call — pick a time that works and come with
                your ideas — you don't need a finished thesis. Building one together is part of the
                work.
              </p>
              <div style={{ marginTop: 18, fontFamily: 'var(--pd-mono)', fontSize: 13, letterSpacing: '0.06em', color: 'var(--pd-tert)' }}>
                30 MIN · VIDEO CALL · CONFIDENTIAL
              </div>
              <a
                className="pd-pill-primary"
                href={bookHref()}
                target={bookTarget()}
                rel="noopener noreferrer"
                style={{ marginTop: 24, display: 'flex', justifyContent: 'center', padding: '15px 26px' }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'cta-card' })}
              >
                Pick a time →
              </a>
              <p className="pd-caption" style={{ marginTop: 14 }}>
                Scheduling opens in Google Calendar. No lists sold, no sellers represented.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PracticeShell>
  );
}
