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
import OwnerChat from './OwnerChat';
import { bookHref, bookTarget, bookRel } from './leads';
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

/* ── Key industry verticals — the hunt-board teaser to /industries. The
   lanes live in lanes.ts (ONE register — the hero chips read the same
   array, so a lane cannot be on the board and missing from the chips). ── */
import { HUNT_LANES as HUNTS } from './lanes';

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

/** The dark proof band — stats stay HIDDEN until they are genuinely in view,
 *  then fade in and roll up together.
 *
 *  The stats deliberately do NOT carry data-rv (2026-08-02, Paul: "it looks
 *  weird when safari address bar and controls are over the numbers — hide
 *  the numbers and reveal when scrolled up"). The shell's generic reveal
 *  fires at 12% intersection, and at rest on a phone the fold's 120px band
 *  crest plus iOS Safari's collapsed chrome put ~30% of the stats grid
 *  "visible" — under the floating toolbar — so the numerals went opaque
 *  half-covered by browser controls. This observer owns the reveal instead:
 *  rootMargin trims the bottom 18% of the viewport (the chrome zone), so
 *  nothing shows until the first numeral is clear of the controls, then the
 *  rv-stagger fade and the count-up run as one moment. The eyebrow keeps
 *  its early data-rv reveal — it IS the crest's teaser. */
function ProofBand() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (host.classList.contains('rv-in')) return;
        host.classList.add('rv-in');
        if (!reduce) host.querySelectorAll<HTMLElement>('.pd-stat .n').forEach(countUp);
      } else if (e.boundingClientRect.top > 0) {
        /* The reveal RESETS when the stats drop back below the viewport
           (2026-08-02, Paul: "hide the reveal honey text when navigating
           back to home or scroll back to top"). A one-shot reveal stuck
           rv-in on, so scrolling back to the top left the numerals opaque
           in the chrome zone again — the exact state the reveal exists to
           prevent. The top>0 guard resets ONLY on the way back up: when
           the stats exit past the viewport TOP while reading deeper, they
           stay revealed rather than visibly fading at the edge. Each
           re-entry replays the fade and the count. */
        host.classList.remove('rv-in');
      }
      /* The -18% bottom margin exists for iOS Safari's floating chrome —
         numerals half-under the toolbar looked broken (2026-08-02). Desktop
         has no chrome zone, and the 2026-08-03 band-as-floor layout parks
         the stats INSIDE the viewport's last fifth at rest — Paul: "the
         numbers are viewable" — so the phone keeps its guard and the
         desktop reveals what is genuinely on screen. */
    }), window.matchMedia('(max-width: 760px)').matches
      ? { threshold: 0.15, rootMargin: '0px 0px -18% 0px' }
      : { threshold: 0.2 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  return (
    <section className="pd-dark bl-tr" id="proof">
      <span className="pd-spark" aria-hidden="true" />
      <div className="pd-wrap pd-dark-pad">
        {/* The band title, in the one band-title voice (Paul, 2026-08-03:
            "make the band title the same font every[where]") — this was the
            lone mono holdout among the dark bands. */}
        <div className="pd-seclabel" data-rv style={{ textAlign: 'center', marginBottom: 0 }}>
          Two decades on the buy side
        </div>
        <div className="pd-stats rv-stagger" ref={ref} style={{ marginTop: 'clamp(32px, 3.8vw, 54px)' }}>
          <div className="pd-stat"><div className="n">150</div><div className="l">Acquisitions closed</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">Enterprise value added</div></div>
          <div className="pd-stat"><div className="n">~$21B</div><div className="l">Transactions touched</div></div>
          <div className="pd-stat accent"><div className="n">0</div><div className="l">Sell-side engagements. Ever.</div></div>
        </div>
      </div>
    </section>
  );
}

/** Who it's for — five giant names, each a REAL LINK to its segment page
 *  (2026-08-02, Paul: "These links don't go anywhere"). They didn't: on a
 *  phone the side panel is display:none and every row's click was
 *  preventDefault + setActive — a visible arrow with no destination. The
 *  five /buyers/<slug> pages have been routed and fully built since the
 *  per-segment pass; this index is now where the site links them. Desktop
 *  keeps the panel as a HOVER preview (mouse-enter swaps it); click
 *  navigates everywhere. The panel's own ask still routes to #cta. */
const WHO_SLUGS = ['family-offices', 'independent-sponsors', 'searchers', 'operators', 'pe-firms'];
function WhoIndex() {
  const [active, setActive] = useState(0);
  return (
    <div className="pd-whosel" data-rv>
      <div className="names rv-stagger" data-rv>
        {WHO.map((w, i) => (
          <Link
            key={w.label}
            href={`/buyers/${WHO_SLUGS[i]}`}
            className={`name${i === active ? ' on' : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => trackEvent('practice_cta_clicked', { placement: 'who-index', segment: WHO_SLUGS[i] })}
          >
            <span>{w.label}</span>
            <span className="arr" aria-hidden>→</span>
          </Link>
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
      {/* Vertical centering moved from an inline style into .pd-hero-fold's
          own CSS (2026-08-02): an inline style outranks every stylesheet
          rule, and the phone needs flex-start for the ONE CLUSTER grammar. */}
      <section className="pd-hero pd-hero-c pd-hero-fold" id="top">
        <div className="pd-heromesh" aria-hidden="true" />
        <div className="pd-heroc-inner">
          {/* THE FOLD, settled 2026-08-02 after five passes in one day. All of
              Paul's words; the arrangement is the last thing that moved and the
              thing that made it work.

              The order is now RECOGNITION then INSTRUCTION. The H1 names the
              reader's problem back to them, the sub tells them what to do about
              it. That is the right way round, and it took the whole day to get
              there because every earlier version led with the instruction and
              had nothing underneath it but mechanism:

                "Deploy your tailored business acquisition strategy in as
                 little as three months."      — a vendor verb, and the only
                                                 concrete thing buried at the end
                "Start executing on your business acquisitions today."
                                               — claimed the deals were already
                                                 moving, which is the reading a
                                                 sophisticated buyer prices as
                                                 overreach
                "Get started building your acquisition engine today."
                                               — true, demoted to the sub where
                                                 an instruction belongs, then
                                                 tightened to the line below

              "Today" survives all of it and is deliberate. Paul: "by today I
              mean start setting it up today with a phone call — it's a metaphor
              humans understand; they know it won't be in place today, but they
              can get started today." As a sub it can say that without the H1
              having to carry the promise.

              Recorded because it is the live tension in this pair: "Deploy…
              today" leans on that metaphor harder than "get started building…
              today" did — deploy is what you do to a thing that already exists.
              It is survivable here only because the H1 no longer promises
              anything, so this is the single claim on the fold rather than the
              second of two. If a reader ever reads it as "operational today",
              this is the line to soften, not the headline.

              "Engine" sets up the Why-us H2 three sections down: "The machine
              serial acquirers build in-house. Yours, without the headcount."
              Known cost — the intake tool is publicly the "Acquisition Engine",
              so the word does two jobs one element apart; case and possession
              keep them separate ("your acquisition engine" vs the proper noun),
              and "acquisition program" is the swap if it ever muddles.

              Full stops, not the commas these were written with. Every two-beat
              line on this site takes one — "Buy-side only. One client per
              target.", "Senior-only. No junior hand-off.", "You make the
              decisions. We handle the rest…" — so a splice here would be the
              only one, and to this page's reader it lands as a typo rather than
              as a voice.

              Length check, because an H1 of two sentences invites one: at 50
              characters this is within one of the line it replaced, so the fold
              rhythm `.pd-hero-fold` was tuned for is unchanged. */}
          {/* The two sentences are two spans so the PHONE can break at the
              sentence boundary. Unstyled on desktop (spans are inline, the
              copy is byte-identical); at ≤760px .pd-h1-s2 goes display:block,
              so the stack reads "Buying a business / is hard work. / We make
              it easier." — the free wrap used to land on "…hard work. We /
              make it easier.", a dangling pronoun severed from its verb. */}
          <h1 className="pd-h1"><span className="pd-h1-s1">Buying a business is hard work.</span> <span className="pd-h1-s2">We make it easier.</span></h1>
          {/* Paul's copy (2026-08-03), "1st" matched to "100th" same day
              (Paul: "maybe 1st needs to be 1st to match 100th?" — agreed,
              the paired numerals read as a range). No-break spaces glue "100th
              acquisition" so no wrap severs the ordinal from its noun. */}
          <p className="pd-sub pd-sub-c">Whether your 1st or your 100th{'\u00A0'}acquisition, we run the process for you, freeing up your time and{'\u00A0'}resources.</p>
        </div>
        <div className="pd-showcase">
          <div className="pd-show-stage">
            <YuliaIntake />
          </div>
        </div>
        {/* Booking is a BUTTON here, not a text link (Paul, 2026-07-31). It
            took the weight the header pill used to carry — that pill is gone on
            a phone, so this is now the only standing ask on the fold besides
            the chat bar itself.

            A TINTED CHIP, not an outlined pill and not a solid one (Paul,
            2026-07-31: "the pill button looks out of place — is there a better
            option?"). The outline was the only stroked element on the whole
            fold — every other object is a solid fill, a white card or plain
            text — which is what made it read as borrowed from somewhere else.
            Solid green was the other candidate and loses to the same argument
            as before: the chat bar's send control is solid green a few pixels
            above, and two of those close together read as competing primaries.

            The tint is not a new treatment — it is the chip language already
            on this page for the hunting lanes (greenTint fill, green text, no
            border), so the row now pairs a house chip with a house link
            instead of a button with a link. */}
        <div className="pd-hero-below">
          <a className="pd-hero-book" href={bookHref()} target={bookTarget()} rel={bookRel()} onClick={() => trackEvent('practice_booking_clicked', { placement: 'hero' })}>Book a call</a>
          {/* "sample market map", not "sample read" (2026-08-02 fold pass):
              the artifact the engine delivers is publicly the market map, and
              "read" is practice vocabulary a cold visitor can't parse. */}
          <a className="pd-samplelink" href="#sample" onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-sample' })}>See a sample market map →</a>
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
          <img
            className="pd-accentband"
            src="/industries/trade-van.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1700}
            height={520}
            data-rv
          />
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
          <img
            className="pd-accentband"
            src="/industries/trade-fleet.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1700}
            height={520}
            data-rv
            style={{ marginBottom: 'clamp(10px, 1.4vw, 20px)' }}
          />
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
            <a className="pd-pill-primary pd-pill-lg" href="#yulia" style={{ marginTop: 34 }} onClick={() => trackEvent('practice_cta_clicked', { placement: 'how-close' })}>Build your market map →</a>
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
                <img src="/logo-green-x.png" alt="smbX.ai" width={1584} height={396} style={{ height: 22, width: 'auto', display: 'block' }} />
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
          <img
            className="pd-accentband"
            src="/industries/trade-power.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1700}
            height={520}
            data-rv
          />
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
          <img
            className="pd-accentband"
            src="/industries/trade-hvac.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1700}
            height={520}
            data-rv
          />
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
          <div className="pd-seclabel" data-rv>Whose side we're on</div>
          <div className="pd-askew">
            <div data-rv>
              <p className="pd-quote">The seller has a broker. Who is working for you?</p>
            </div>
            <div className="off" data-rv>
              <p className="pd-body">
                We represent buyers, and only buyers — one client per target. You get our full
                attention, unfiltered analysis, and a proprietary deal that stays yours.
              </p>
              <div style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="pd-pill-primary pd-pill-lg" href="#yulia" onClick={() => trackEvent('practice_cta_clicked', { placement: 'whose-side' })}>Build your market map →</a>
                <a className="pd-pill pd-pill-lg-quiet" href={bookHref()} target={bookTarget()} rel={bookRel()} onClick={() => trackEvent('practice_booking_clicked', { placement: 'whose-side' })}>Book a call</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For owners — the seller side of the buy-side story (#owners;
          2026-08-04, Paul: "maybe it doesn't need its own page, maybe it
          just needs to be its own section" — the standalone /owners page is
          retired, this section is its home and /owners redirects here).
          Placed directly after Whose side deliberately: that band ends on
          "we represent buyers, and only buyers", and this section resolves
          what that loyalty means for an OWNER — the read buyers use, free,
          and the first call when a buyer engages in their lane. The card is
          the site's own conversation card; OwnerChat only swaps the brain
          (scripted valuation walk, figures never persisted). ── */}
      <section className="pd-section pd-accent al" id="owners">
        <div className="pd-wrap">
          <div className="pd-sechead" data-rv>
            <div className="pd-seclabel">Own one of these businesses?</div>
            <h2 className="pd-h2">Get the valuation buyers are working from — free.</h2>
            <p className="pd-sub" style={{ margin: '22px auto 0' }}>
              We never take a fee from an owner. Run your valuation right here — and when
              a buyer engages us in your lane, you're the first call we make. What stays
              on file afterward is your call, shown to you in full at the end.
            </p>
          </div>
          <div className="ow-card" data-rv>
            <OwnerChat />
          </div>
          <p className="ow-disc" data-rv>
            Published market ranges for your trade, applied to figures you provide, plus the
            readiness drivers buyers actually price — not a formal appraisal; for one, engage a
            credentialed appraiser. At the end, the chat shows you exactly what's on file for
            your company, and you keep it or delete it on the spot.
          </p>
        </div>
      </section>

      {/* ── Founder — the human behind the booking card (warmth pass
          2026-07-17: reviewers read the page as cold; a real photo, never
          stock — photography law). Copy is Paul's sanctioned announcement
          line; role line matches the footer. ── */}
      <section className="pd-section">
        <div className="pd-wrap">
          <div className="pd-fndband" data-rv>
            <img src="/founder-portrait.jpg" alt="Paul Baker" loading="lazy" />
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
                rel={bookRel()}
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
