/**
 * Practice-site landing — CARTA RESTYLE (2026-08-07). Transcribed 1:1 from
 * the binding reference `design_handoff_smbx_carta_restyle/Landing - Carta
 * Style.dc.html` — the markup, the exact inline values, the motion — with the
 * real machinery mounted inside it:
 *
 *  · The Acquisition Engine hero card is the REAL intake (YuliaIntake: SSE
 *    market map, sessionStorage, owner mode, the phone sheet) inside the
 *    reference's framed card. The prototype's scripted ghost only pictured it.
 *  · The pricing band posts to /api/practice/pricing (email-gated brochure,
 *    honest-send law) — the prototype's local state only pictured it.
 *  · The owners chips dispatch smbx:open-owner so the ONE conversation card
 *    up top swaps to the valuation brain (the prototype linked #yulia).
 *  · Lanes/chips/owner trades read their one registers (lanes.ts, OwnerChat)
 *    — the reference lists match them verbatim, which is how it should be.
 *  · Booking links go through leads.ts (bookHref); analytics events carry
 *    over onto the equivalent elements.
 *
 * Section order (reference): nav · hero (H1 + engine card) · lane marquee ·
 * dark proof band (#proof, count-up) · why us (#why, 6 evidence cards) ·
 * how it works (#how, 7-phase explorer with auto-cycle · #sample read ·
 * close) · dark pricing band (#pricing) · who it's for (#who) · sectors
 * (#sectors) · dark whose-side band · owners (#owners) · founder · CTA
 * (#cta) · mega footer (shell).
 *
 * Copy is Paul's approved deck, verbatim from the reference — do not rewrite
 * here. Layout values live INLINE per the transcription doctrine; carta.css
 * carries hover/media/keyframes only.
 */
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import PracticeShell, { Handles, Kicker } from './PracticeShell';
import YuliaIntake from './YuliaIntake';
import { OWNER_LANES } from './OwnerChat';
import { HUNT_LANES, buyerHref, laneHref, SECTOR_NAMES } from './lanes';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

/**
 * The measure for CENTRED section heads (Paul, 2026-08-08: "hero is truncated
 * instead of wide"). Left-aligned heads keep the reference's 880 editorial
 * measure — he excluded those explicitly ("unless a left like the home hero").
 * This value is MEASURED, not chosen: 1080 is the smallest width that lands
 * both centred headlines (#owners, #pricing) on ONE line at every viewport
 * from 1440 down to 1100. Below it they break to two lines inside a column
 * narrower than the content they head, which is the "truncated" read. Kept as
 * one constant so the two centred heads cannot drift apart.
 */
const HEAD_CTR = 1080;

/* ── Why us — six evidence cards (copy verbatim from the reference) ── */
const WHY: { nm: string; bd: string; more: string; xp: React.ReactNode }[] = [
  {
    nm: 'An acquisition machine, not a broker',
    bd: 'The buyers who outperform treat acquisition as a repeatable capability, not an event. We stand that capability up for you — thesis, pipeline, cadence, close — and run it end to end.',
    more: 'THE EVIDENCE',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>McKinsey's two-decade study of the Global 2,000 finds <strong>programmatic acquirers — two or more deals a year — outperform their peers by roughly 20% in total shareholder return over ten years</strong>, with the lowest variance of any strategy. Bain's parallel finding: frequent acquirers now beat inactive peers by about 130%.</p>
        <p style={{ margin: '14px 0 0' }}>The edge isn't a golden deal. It's the system — a thesis tied to strategy, a governed pipeline with stage gates, a weekly cadence, and integration planned before close. That's what we install and run under your name.</p>
      </>
    ),
  },
  {
    nm: 'A target universe in days, not weeks',
    bd: "Our AI stack compresses an analyst pod's month of market mapping into days of a senior operator's supervised work. You see the whole market before most teams finish staffing.",
    more: 'HOW',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>A market map that took an analyst pod two to four weeks now takes hours: AI search across <strong>12M+ private companies</strong>, scored against your buy box. In one McKinsey-documented case, a corp-dev team scored <strong>500+ targets in under a day</strong> — and closed three acquisitions within months.</p>
        <p style={{ margin: '14px 0 0' }}>Across the industry, executives using these tools report roughly 20% lower deal costs, and 40% report cycles running 30–50% faster. Same class of stack here — every output reviewed by the operator before it reaches you.</p>
      </>
    ),
  },
  {
    nm: 'Off-market deals, at better prices',
    bd: 'We reach owners who were never for sale — directly, quietly, under your name. Proprietary deals skip the auction, and they price like it.',
    more: 'THE MATH',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>We run the outreach engine top-quartile buyers run: multi-channel, five to twelve touches per owner over months, under your brand — so the owner sees a serious buyer, not a campaign. Most of the deals we work were never listed anywhere.</p>
        <p style={{ margin: '14px 0 0' }}>The industry rule of thumb — corroborated across sources, and honest as a rule of thumb — is that <strong>owner-direct deals price half a turn to two turns of EBITDA below auctioned ones</strong>. Proprietary sourcing widens the funnel and lowers the entry price at the same time.</p>
      </>
    ),
  },
  {
    nm: 'Senior-only. No junior hand-off.',
    // "the operator who closed the 150" is SANCTIONED verbatim (Paul,
    // 2026-08-07: "150 is ok") — the audits flagged it against the
    // never-unqualified-"closed" rule and he kept it. Do not soften it.
    bd: 'At a bank, a senior wins the mandate and juniors execute. Here, every deal is worked by the operator who closed the 150. The AI replaces the analyst pod — never the judgment.',
    more: 'WHAT THAT MEANS',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>Corp-dev teams have always farmed the grunt work out to junior pods. AI now does that layer faster and more thoroughly — market maps, first-pass models, CIM triage, diligence extraction, memo drafts.</p>
        <p style={{ margin: '14px 0 0' }}>What can't be automated — the thesis, the negotiation, reading a seller across the table — is exactly what you're hiring. Every call, every model review, every LOI: the same senior operator, on every deal.</p>
      </>
    ),
  },
  {
    nm: 'Buy-side only. One client per target.',
    bd: 'No sell-side conflicts, no target shopped to two buyers, no success-fee incentive to push a bad deal across the line. Structurally on your side.',
    more: 'WHY IT MATTERS',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>Most advisors work both sides of the market, and a success fee pays the same whether the deal was good for you or merely closed. Those incentives leak into every recommendation.</p>
        <p style={{ margin: '14px 0 0' }}>We've never taken a sell-side engagement, and while we hunt a lane for you we don't hunt it for anyone else. <strong>When we tell you to walk, walking costs us.</strong> That's the point.</p>
      </>
    ),
  },
  {
    nm: 'A fraction of the cost of in-house',
    bd: 'An in-house corp-dev function runs $500K–$1.5M a year all-in and takes a year to build. We deliver the whole function for a fraction of that — buy-side focused, where most banks live on the sell side.',
    more: 'THE COMPARISON',
    xp: (
      <>
        <p style={{ margin: '18px 0 0' }}>In-house corp dev runs <strong>$500K–$1.5M a year all-in</strong> — before the year it takes to hire and ramp. And most banks are built for the sell side; running a buy-side search is a different job, and rarely their first love.</p>
        <p style={{ margin: '14px 0 0' }}>The modern tooling that replaces the junior pod costs less than one analyst's salary. Those unit economics are the engine of this model — and they're priced into what you pay us.</p>
      </>
    ),
  },
];

/* ── How it works — the seven phases (reference renderVals, verbatim) ── */
const PHASES = [
  { ph: 'Thesis', g: 'SMBXCORPDEV', t: 'We turn "I want to buy something" into a plan you can act on.', bd: 'We turn "I want to buy something" into a plan you can act on — the sector, size, and economics worth your time, and the deal-breakers that aren’t. If the thing you’re chasing isn’t buyable in today’s market, we’ll say so early, and point you somewhere better.' },
  { ph: 'Sourcing', g: 'SMBXCORPDEV', t: 'We find the owners who aren’t looking to sell.', bd: 'We map the market, narrow it to the companies worth a call, and reach them directly and quietly, under your name. Most of the deals we work were never listed anywhere.' },
  { ph: 'Evaluation', g: 'SMBXCORPDEV', t: 'We tell you what a business is really worth, and whether to walk.', bd: 'We rebuild the financials, test the add-backs the seller’s advisor put in, and find the things that don’t show up in a pitch — customer concentration, owner dependence, the maintenance nobody mentioned.' },
  { ph: 'Structure & offer', g: 'SMBXCORPDEV', t: 'We shape the deal and take it to the seller.', bd: 'Price is one piece of it; so are seller notes, earnouts, rollover, and escrows. We build the financing a lender will actually back, write the LOI, and run the negotiation for you.' },
  { ph: 'Diligence & close', g: 'SMBXCORPDEV', t: 'This is where most deals come apart, and where we do the heaviest work.', bd: 'We run diligence across the financials, legal, tax, and operations, keep the accountants and lawyers and lenders on schedule, and hold every thread together through to a signed deal.' },
  { ph: 'Integration', g: 'SMBXCORPDEV PREMIUM', t: 'The price is set at close. The value comes in the six months after.', bd: 'We plan the first hundred days — keeping the people and customers you just paid for — the part most buyers underestimate and most advisors skip.' },
  { ph: 'Value creation', g: 'SMBXCORPDEV PREMIUM', t: 'After the close, we can stay on to help the thesis come true.', bd: 'For clients who want it, we stay engaged past the hundred days — tracking performance against the original thesis, building the pricing and operating levers into a plan, and sourcing the add-on acquisitions that turn one deal into a platform. Part of the Premium engagement, scoped to the deal.' },
];

/* ── Who it's for — five buyer cards (reference copy, verbatim) ── */
const WHO = [
  { label: 'Family offices', body: 'Direct ownership without the fund overhead. We run the search and the process; you keep the asset, the control, and the relationship — no blind pool, no committee, no clock.', link: 'Talk to us about direct deals →' },
  { label: 'Independent sponsors', body: 'Control the deal before you raise a dollar. We help you find it, lock it, and build the numbers your capital partners will actually back — so you walk into that room with a deal, not a pitch.', link: 'Talk to us about a live deal →' },
  { label: 'Search funds & solo acquirers', body: "Your first acquisition is the other side's hundredth. We put a senior deal team in your corner — sourcing, diligence, and the negotiation — so you're not learning the hardest lessons with your own money on the line.", link: 'Talk to us about your search →' },
  { label: 'Operators & strategics', body: 'Grow by acquisition without standing up a corp-dev team. We source the tuck-ins and adjacencies, price them, and run the process quietly — so you can move on a competitor without tipping the market.', link: 'Talk to us about an add-on →' },
  { label: 'PE firms', body: "Add-on sourcing and execution capacity that flexes with your pipeline. For lower-middle-market funds without deep in-house origination — we find and work the proprietary deals your team doesn't have the bandwidth to chase.", link: 'Talk to us about origination →' },
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

/** The pricing-brochure ask. The brochure is DELIVERED, never linked — the
 *  server holds it outside the public root and attaches it to the email, so
 *  the address is the gate and the lead is the price of the download.
 *  Honest-send law: we never claim an inbox the server said it couldn't
 *  reach. Markup transcribed from the reference's dark pricing band. */
function PricingRequest() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy') return;
    setState('busy');
    trackEvent('practice_cta_clicked', { placement: 'pricing-brochure' });
    try {
      const res = await fetch('/api/practice/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sent) {
        setState('sent');
      } else {
        setState('err');
        setMsg(data.error || "We couldn't send it just now — book a call and we'll walk you through the schedule directly.");
      }
    } catch {
      setState('err');
      setMsg("We couldn't send it just now — please try again in a moment.");
    }
  };
  if (state === 'sent') {
    return (
      <p data-rv style={{ margin: '36px auto 0', fontSize: 17, color: '#A8F0CE' }}>
        Sent — the pricing brochure is on its way to your inbox.
      </p>
    );
  }
  return (
    <div data-rv style={{ margin: '38px auto 0', maxWidth: 520 }}>
      {/* The button is `flex: none` around a 28-character label, so on a phone
          it took 270 of 350px and left the field 145 — wide enough to show
          "you@" and nothing else. `minWidth: 0` was actively making it worse:
          it let the field shrink to whatever was left instead of pushing the
          button onto its own line. A real minimum plus flex-wrap turns the
          squeeze into a stack. Desktop is unaffected — 220 + 10 + ~270 fits
          the 520px cap, so the row never wraps there. */}
      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          type="email"
          required
          placeholder="you@company.com"
          aria-label="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="ca-price-input"
          style={{ flex: '1 1 220px', minWidth: 220, background: '#FFFFFF', border: '1.5px solid #FFFFFF', borderRadius: 10, padding: '15px 18px', fontSize: 16, fontFamily: "'Schibsted Grotesk', sans-serif", color: '#16181A', caretColor: '#16181A', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          className="ca-h-mintbg"
          style={{ flex: 'none', background: '#FCFAF6', color: '#16181A', border: 'none', borderRadius: 10, padding: '15px 22px', fontSize: 15.5, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif", cursor: 'pointer' }}
        >
          {state === 'busy' ? 'Sending…' : 'Email me the pricing brochure'}
        </button>
      </form>
      {state === 'err' && <p style={{ margin: '16px 0 0', fontSize: 15, color: '#D7DBD2' }}>{msg}</p>}
    </div>
  );
}

/** Dark proof band — stats grid with corner handles and the one-shot
 *  count-up when the grid genuinely enters the viewport. */
function ProofBand() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
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
  // Size lives in carta.css under [data-proof] — the chain and the phone
  // grid want different numeral scales and a single inline clamp cannot
  // express "smaller in a rail, larger in a 2-up".
  const num = { fontFamily: SERIF, fontWeight: 550, lineHeight: 1, letterSpacing: '-0.02em' } as const;
  return (
    <section id="proof" className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(62px, 10vw, 170px) clamp(20px, 4vw, 32px) clamp(62px, 10vw, 180px)' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div data-rv><Kicker dark center>TWO DECADES ON THE BUY SIDE</Kicker></div>
        {/* THE PROOF AS A CHAIN (2026-08-08). Five nodes wired, ending on
            the 0 in the accent fill — the same grammar as the funnel and the
            engagement track, so the three read as one house device rather
            than three ideas.
            $2B SYNERGIES CAPTURED joins the band here. It is in the sanctioned
            stat set and already runs on /about; the landing was the only
            surface carrying four of the five.
            TRADE-OFF, STATED: five nodes in a rail means the numerals come
            down from 92px to ~46px, because "~$21B" at 92px is 270px of glyph
            in a 248px node. The band trades scale for sequence.
            Below 900 it drops back to the 2-up GRID it has always been — five
            stacked nodes would cost a phone a full screen for one band, and
            the grid is genuinely better there. The 0 spans the last row on
            its own, which is where it wants to be anyway. */}
        <div ref={ref} data-rv data-chain data-proof className="rv-stagger ch-dark" style={{ marginTop: 'clamp(30px, 5vw, 84px)', position: 'relative' }}>
          <Handles color="#F4F5F1" />
          {[
            { c: '150', v: '150+', l: 'ACQUISITIONS & INTEGRATIONS' },
            { c: '5', v: '$5B+', l: 'ENTERPRISE VALUE ADDED' },
            { c: '21', v: '~$21B', l: 'TRANSACTIONS TOUCHED' },
            { c: '2', v: '$2B', l: 'SYNERGIES CAPTURED' },
            { v: '0', l: 'SELL-SIDE. EVER.', hit: true },
          ].map((n, i) => (
            <Fragment key={n.l}>
              {i > 0 && <span className="ch-wire" aria-hidden="true"><i /></span>}
              <div className={`ch-node${n.hit ? ' ch-hit' : ''}`} style={{ textAlign: 'center' }}>
                <div {...(n.c ? { 'data-count': n.c } : {})} style={{ ...num, color: n.hit ? '#FCFAF6' : undefined }}>{n.v}</div>
                <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', lineHeight: 1.4 }}>{n.l}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The seven-phase explorer: left rail of mono tabs grouped under the two
 *  engagement names, right pane with the active phase. Auto-cycles every
 *  5.2s until the reader interacts with the section (reference behavior). */
function PhaseExplorer() {
  const [phase, setPhase] = useState(0);
  const paused = useRef(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => { if (!paused.current) setPhase(p => (p + 1) % 7); }, 5200);
    const stop = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.('#how')) paused.current = true; };
    document.addEventListener('click', stop);
    return () => { clearInterval(t); document.removeEventListener('click', stop); };
  }, []);
  const active = PHASES[phase];
  const tab = (p: typeof PHASES[number], i: number) => {
    const on = phase === i;
    return (
      <div
        key={p.ph}
        role="button"
        tabIndex={0}
        onClick={() => { paused.current = true; setPhase(i); }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paused.current = true; setPhase(i); } }}
        style={{ cursor: 'pointer', padding: '13px 20px', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', transition: 'background .2s, color .2s', background: on ? '#16181A' : 'transparent', color: on ? '#FCFAF6' : '#4A4F54' }}
      >
        {String(i + 1).padStart(2, '0')}&nbsp;&nbsp;{p.ph.toUpperCase()}
      </div>
    );
  };
  return (
    <div data-rv data-phase style={{ marginTop: 'clamp(29px, 5vw, 84px)', position: 'relative', border: '1px solid #16181A', display: 'grid', gridTemplateColumns: '380px 1fr', background: '#FFFFFF' }}>
      <Handles />
      <div data-phase-rail style={{ borderRight: '1px solid #16181A', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4DFD3', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: '#0A7A58' }} />
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', color: '#7C8187' }}>THE SEVEN PHASES</span>
        </div>
        <div style={{ padding: '12px 20px 4px', fontSize: 13.5, color: '#7C8187' }}>
          <span style={{ fontWeight: 700, color: '#16181A' }}>smb<span style={{ color: '#0A7A58' }}>x</span>CorpDev</span> — The full buy-side engagement — thesis to close.
        </div>
        {PHASES.slice(0, 5).map((p, i) => tab(p, i))}
        <div style={{ padding: '16px 20px 4px', fontSize: 13.5, color: '#7C8187', borderTop: '1px solid #E4DFD3', marginTop: 8 }}>
          <span style={{ fontWeight: 700, color: '#16181A' }}>smb<span style={{ color: '#0A7A58' }}>x</span>CorpDev Premium</span> — Everything above — then the part most advisors skip.
        </div>
        {PHASES.slice(5).map((p, i) => tab(p, i + 5))}
      </div>
      <div data-phase-pane style={{ padding: '44px 48px 48px', minHeight: 430, position: 'relative' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 130, backgroundImage: 'radial-gradient(rgba(10,122,88,.2) 1.1px, transparent 1.1px)', backgroundSize: '15px 15px' }} />
        <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.14em', color: '#0A7A58' }}>PHASE {String(phase + 1).padStart(2, '0')} — {active.g}</div>
        <div style={{ marginTop: 16, fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(22px, 2.6vw, 44px)', lineHeight: 1.12, letterSpacing: '-0.01em', maxWidth: '15em' }}>{active.ph}</div>
        <p style={{ margin: '22px 0 0', fontSize: 18, lineHeight: 1.6, color: '#16181A', fontWeight: 500, maxWidth: '30em' }}>{active.t}</p>
        <p style={{ margin: '16px 0 0', fontSize: 16.5, lineHeight: 1.7, color: '#4A4F54', maxWidth: '34em' }}>{active.bd}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  // Owner mode reaches up from the chat card so the whole fold changes voice
  // (Paul, 2026-08-04: an owner running a valuation shouldn't be staring at
  // the buy-side headline).
  const [ownerHero, setOwnerHero] = useState(false);

  // Hero entrance (data-hs) and dot-field parallax (data-plx) run in the
  // shell — every reference page carries them.

  const marquee = [...HUNT_LANES.map(l => l.nm.toUpperCase()), ...HUNT_LANES.map(l => l.nm.toUpperCase())];

  return (
    <PracticeShell home>
      <main id="top" style={{ background: '#FCFAF6', overflow: 'clip' }}>

        {/* ══ HERO ══ */}
        {/* id="yulia" sits on the SECTION per the reference — YuliaIntake no
            longer carries its own copy of the id (one anchor, one owner). */}
        <section data-hero-grid id="yulia" style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', minHeight: 'calc(100svh - 76px)', padding: 'clamp(60px, 6vh, 110px) clamp(20px, 4vw, 32px) clamp(70px, 8vh, 140px)', display: 'grid', gridTemplateColumns: '1.02fr .98fr', gap: 'clamp(29px, 5vw, 92px)', alignItems: 'center' }}>
          <div>
            {ownerHero ? (
              <h1 data-hs="0" style={{ margin: 0, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(35px, 4.8vw, 92px)', lineHeight: 1.04, letterSpacing: '-0.015em', textWrap: 'balance' }}>Think like a buyer. Exit on your&nbsp;terms.</h1>
            ) : (
              <h1 data-hs="0" style={{ margin: 0, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(35px, 4.8vw, 92px)', lineHeight: 1.04, letterSpacing: '-0.015em', textWrap: 'balance' }}>Buying a business is hard&nbsp;work. We make it&nbsp;easier.</h1>
            )}
            {ownerHero ? (
              <p data-hs="1" style={{ margin: '30px 0 0', maxWidth: '34em', fontSize: 20, lineHeight: 1.65, color: '#4A4F54' }}>Thinking like a buyer is the best way to prepare — and starting here, with your valuation, puts you in front of potential buyers when you're{' '}ready.</p>
            ) : (
              <p data-hs="1" style={{ margin: '30px 0 0', maxWidth: '34em', fontSize: 20, lineHeight: 1.65, color: '#4A4F54' }}>Whether your 1st or your 100th&nbsp;acquisition, we run the process for you, freeing up your time and&nbsp;resources.</p>
            )}
            <div data-hs="2" style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-greenbg"
                style={{ fontSize: 16, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '15px 26px', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'hero' })}
              >
                Book a call
              </a>
              <a
                href="#sample"
                className="ca-h-band"
                style={{ fontSize: 16, fontWeight: 500, color: '#16181A', padding: '14px 24px', border: '1.5px solid #16181A', borderRadius: 10 }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-sample' })}
              >
                See a sample market map
              </a>
            </div>
            <a
              data-hs="3"
              href="#owners"
              className="ca-h-deepgreen"
              style={{ display: 'inline-block', marginTop: 24, fontSize: 15.5, fontWeight: 500, color: '#0A7A58', borderBottom: '1px solid #0A7A58', paddingBottom: 2 }}
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-owner-button' })}
            >
              Are you a business owner? →
            </a>
          </div>

          {/* The Acquisition Engine — the REAL intake, framed as the hero object */}
          <div data-hs="1" style={{ position: 'relative', padding: '28px 0 8px' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: '-10px -20px 30px', backgroundImage: 'radial-gradient(rgba(10,122,88,.22) 1.2px, transparent 1.2px)', backgroundSize: '17px 17px' }} />
            <div aria-hidden="true" data-plx="-0.03" className="ca-orbit" style={{ position: 'absolute', top: -26, right: -8, width: 150, height: 150 }}>
              {/* Spin + entrance both live in carta.css (.ca-orbit > div) —
                  an inline `animation` would outrank the stylesheet and drop
                  the settle-in. */}
              <div style={{ width: 150, height: 150, transformOrigin: '50% 50%' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                  <ellipse cx="75" cy="75" rx="72" ry="30" stroke="#0A7A58" strokeWidth="1.4" strokeDasharray="5 5" opacity=".7" />
                  <ellipse cx="75" cy="75" rx="30" ry="72" stroke="#0A7A58" strokeWidth="1.4" opacity=".55" />
                  <circle cx="75" cy="75" r="71" stroke="#0A7A58" strokeWidth="1.4" opacity=".35" />
                </svg>
              </div>
            </div>
            <div className="ca-engine">
              <Handles />
              <YuliaIntake onOwnerModeChange={setOwnerHero} />
            </div>
          </div>
        </section>

        {/* ══ LANE MARQUEE ══ */}
        <div style={{ borderTop: '1px solid #E4DFD3', borderBottom: '1px solid #E4DFD3', background: '#FCFAF6', overflow: 'hidden' }}>
          <div data-marquee className="ca-marquee" style={{ display: 'flex', width: 'max-content', animation: 'smbxMarquee 46s linear infinite' }}>
            {marquee.map((m, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 26px', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.12em', color: '#4A4F54', whiteSpace: 'nowrap' }}>
                {m}<span aria-hidden="true" style={{ width: 7, height: 7, background: '#0A7A58', display: 'inline-block' }} />
              </span>
            ))}
          </div>
        </div>

        <ProofBand />

        {/* ══ WHY US ══ */}
        <section id="why" style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(68px, 12vw, 200px) clamp(20px, 4vw, 32px) 40px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>WHY US</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(26px, 3.4vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.012em', textWrap: 'balance' }}>The machine serial acquirers build in-house. <span style={{ color: '#0A7A58' }}>Yours</span>, without the headcount.</h2>
            <p style={{ margin: '24px 0 0', maxWidth: '42em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>You already know what you want to buy. The question is who runs the hunt — a team you'd spend a year hiring, a bank with a seller's habits, or us. Here's the case.</p>
          </div>
          {/* No `alignItems: start` (2026-08-08). Grid's default IS stretch,
              and `start` was making every card size to its own copy — so each
              row stepped down left to right and the block's bottom edge came
              out ragged. Carta's equivalent 4-up is flush, and that flushness
              is most of what reads as "tidier" at a glance. Stretch costs
              nothing on a phone, where the grid is one column and every card
              is already full width. */}
          <div data-rv data-g3 className="rv-stagger" style={{ marginTop: 'clamp(29px, 5vw, 84px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26 }}>
            {WHY.map((w, i) => (
              <details key={w.nm} className="ca-h-bandhv" style={{ background: '#F3F0E9', padding: 0 }}>
                <summary style={{ cursor: 'pointer', padding: '26px 26px 24px', display: 'block' }}>
                  {/* THE DOT BAND STAYS (Paul, 2026-08-08: "I like the dot
                      fields actually"). Recorded because the argument for
                      removing them was mine and it was a reasonable one —
                      real carta.com puts dot fields only BEHIND headlines,
                      never inside cards, and six identical 84px bands is the
                      most repetitive texture on the page. Paul looked at that
                      case and kept them. They are also in the approved Carta
                      reference. Do not "tidy" them out on either ground. */}
                  <span aria-hidden="true" style={{ display: 'block', height: 84, backgroundImage: 'radial-gradient(rgba(22,24,26,.16) 1.1px, transparent 1.1px)', backgroundSize: '15px 15px', marginBottom: 20, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, bottom: 0, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', padding: '4px 8px' }}>{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: 23, lineHeight: 1.2 }}>{w.nm}</span>
                  <span style={{ display: 'block', marginTop: 12, fontSize: 15.5, lineHeight: 1.6, color: '#4A4F54' }}>{w.bd}</span>
                  <span style={{ display: 'inline-block', marginTop: 16, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', color: '#0A7A58', borderBottom: '1px solid #0A7A58', paddingBottom: 2 }}>{w.more}</span>
                </summary>
                <div className="ca-why-xp" style={{ padding: '0 26px 26px', fontSize: 15, lineHeight: 1.65, color: '#4A4F54', borderTop: '1px solid #E4DFD3' }}>
                  {w.xp}
                </div>
              </details>
            ))}
          </div>
          {/* flexWrap, because the link is `white-space: nowrap` and wins the
              row: at 390px it took 222 of 350px and left the paragraph a
              104px column running two words to the line. Nothing overflowed,
              so no overflow check would ever have caught it — it just read as
              broken. Wrapping costs desktop nothing (the row is 1296px there
              and never wraps). */}
          <div data-rv style={{ marginTop: 44, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, borderTop: '1px solid #E4DFD3', paddingTop: 26 }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#4A4F54', maxWidth: '44em' }}>And it compounds — every engagement sharpens the thesis, the scorecards, and the playbook the next one runs on.</p>
            <a href="#how" className="ca-h-deepgreen" style={{ flex: 'none', fontSize: 16, fontWeight: 600, color: '#0A7A58', borderBottom: '1.5px solid #0A7A58', paddingBottom: 2, whiteSpace: 'nowrap' }}>See how the machine runs →</a>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(62px, 11vw, 190px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>HOW IT WORKS</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(26px, 3.4vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.012em', textWrap: 'balance' }}>Buying a company is a hundred small decisions. We handle the ones that don't need you.</h2>
            <p style={{ margin: '24px 0 0', maxWidth: '44em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>A good acquisition isn't a single moment — it's months of work, in the right order, usually against someone who does this for a living. Here's what the job actually involves. You make the calls that matter. We do the rest.</p>
          </div>

          {/* THE ENGAGEMENT TRACK (2026-08-08). An overview above the
              interactive explorer: seven links, wired, with the Premium
              boundary carried on colour and named by the bracket beneath.
              It earns its place by showing the one thing the explorer buries
              — where smbXCorpDev ends and Premium begins is invisible when
              you are reading phases one at a time.
              A FRAMED panel rather than a full-bleed band, because this sits
              inside #how's 1360 container and a bleed would need the section
              to break its own rail.
              DESKTOP ONLY — on a phone the explorer below prints the group
              headers inline and states the Premium boundary in words, so the
              track would be the same seven phases twice with nothing new in
              the second telling. Reasoning in full at [data-trackpanel] in
              carta.css. */}
          <div data-rv data-trackpanel style={{ marginTop: 'clamp(29px, 5vw, 84px)', position: 'relative', background: '#131512', padding: 'clamp(26px, 3vw, 40px)' }}>
            <Handles color="#F4F5F1" />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(168,240,206,.13) 1.1px, transparent 1.1px)', backgroundSize: '16px 16px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.14em', color: '#A8F0CE' }}>THE ENGAGEMENT</div>
              <div data-chain data-track className="ch-dark" style={{ marginTop: 20 }}>
                {PHASES.map((p, i) => (
                  <Fragment key={p.ph}>
                    {i > 0 && <span className="ch-wire" aria-hidden="true"><i /></span>}
                    <div className="ch-node" style={{ background: i > 4 ? '#16241E' : undefined, borderColor: i > 4 ? '#2E5F4C' : undefined, textAlign: 'center' }}>
                      <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', color: '#0FA97C' }}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.3, color: '#F4F5F1' }}>{p.ph}</div>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div data-trackbr style={{ display: 'flex', marginTop: 14, fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em' }}>
                <div style={{ flex: '0 0 calc(5 / 7 * 100% + 12px)', paddingTop: 10, borderTop: '1px solid #3A3F38', color: '#8E948B', textAlign: 'center' }}>SMBXCORPDEV</div>
                <div style={{ flex: 1, marginLeft: 18, paddingTop: 10, borderTop: '1px solid #2E5F4C', color: '#A8F0CE', textAlign: 'center' }}>PREMIUM</div>
              </div>
            </div>
          </div>

          <PhaseExplorer />

          {/* Getting started — the sample read */}
          <div id="sample" style={{ paddingTop: 'clamp(50px, 9vw, 150px)' }}>
            <div data-rv style={{ textAlign: 'center' }}>
              <Kicker center>GETTING STARTED</Kicker>
              <div style={{ margin: '22px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(23px, 3vw, 50px)', lineHeight: 1.12, letterSpacing: '-0.012em' }}>Every engagement starts with a read like this.</div>
              <p style={{ margin: '18px auto 0', maxWidth: '38em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>Not a chatbot answer — an institutional market map: the universe, the short list, and the thing most buyers miss.</p>
            </div>
            <div data-rv style={{ margin: '56px auto 0', maxWidth: 820, position: 'relative', background: '#FFFFFF', border: '1px solid #16181A' }}>
              <Handles />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 26px', borderBottom: '1px solid #E4DFD3' }}>
                <img src="/logo-green-x.png" alt="smbX.ai" style={{ height: 22, width: 'auto', display: 'block' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.12em', padding: '5px 9px', whiteSpace: 'nowrap' }}>
                  <span style={{ width: 7, height: 7, background: '#FCFAF6', display: 'inline-block' }} />SAMPLE READ
                </span>
              </div>
              <div data-sample-body style={{ padding: '34px 40px 38px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '-0.01em' }}>Commercial Landscaping — Southeast</div>
                <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.05em', color: '#7C8187' }}>Commercial landscaping · GA, NC, SC, TN · $2–8M EBITDA · commercial-contract mix</div>
                <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>THE FUNNEL</div>
                {/* THE FUNNEL AS A WIRED NODE CHAIN (2026-08-08, the Carta
                    polish pass). It was three flat boxes with → glyphs between
                    them and the payoff — the 9 — stranded in a separate panel
                    below, so the drop that IS the argument never read as one
                    movement.
                    This is our answer to Carta's LP→GP→CFO→CEO→GC chip chain,
                    and it beats theirs on the only axis that matters: their
                    graphic labels an audience, ours carries four real numbers
                    and lands the whole method. 2,400 to 9 in one glance.
                    The terminal node takes the accent fill because it is the
                    conclusion, not another step. The dot field sits BEHIND the
                    chain — composing with it, the same correction made to the
                    whose-side band.
                    Geometry lives in carta.css as the shared chain primitive: a flex row
                    whose connectors are their own children, so the phone flip
                    is `flex-direction: column` plus a wire that turns
                    vertical. No duplicated node markup between the two. */}
                <div data-chain style={{ marginTop: 16, position: 'relative' }}>
                  <div aria-hidden="true" style={{ position: 'absolute', inset: '-14px -10px', zIndex: 0, backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '15px 15px' }} />
                  {[
                    { n: '~2,400', l: 'OPERATORS IN-FOOTPRINT' },
                    { n: '~180', l: 'IN YOUR SIZE BAND' },
                    { n: '~55', l: 'ABOVE 60% CONTRACT MIX' },
                    { n: '9', l: 'WORTH YOUR TIME', hit: true },
                  ].map((s, i) => (
                    <Fragment key={s.l}>
                      {i > 0 && <span className="ch-wire" aria-hidden="true"><i /></span>}
                      <div className={`ch-node${s.hit ? ' ch-hit' : ''}`}>
                        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 32, lineHeight: 1, letterSpacing: '-0.01em' }}>{s.n}</div>
                        <div style={{ marginTop: 9, fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.08em', lineHeight: 1.35 }}>{s.l}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ marginTop: 20, background: '#131512', color: '#F4F5F1', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(168,240,206,.16) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                  {/* The giant "9" that used to sit here is now the chain's
                      terminal node — repeating it beside the sentence that
                      explains it was the redundancy that made the old block
                      read as two graphics arguing. The words are unchanged. */}
                  <div style={{ position: 'relative', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.14em', color: '#A8F0CE' }}>THE DROP</div>
                  <div style={{ position: 'relative', marginTop: 10, fontSize: 15, lineHeight: 1.6, color: '#D7DBD2' }}>Of those 55, the number we'd tell you to spend real time on. The drop from 55 to 9 is the part you can't Google.</div>
                </div>
                <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>WHAT SEPARATES THE 9</div>
                <div style={{ marginTop: 6 }}>
                  <div data-numrow style={{ display: 'grid', gridTemplateColumns: '44px 200px 1fr', gap: 16, padding: '16px 0', borderBottom: '1px solid #E4DFD3' }}>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: '#7C8187' }}>01</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Route density.</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#4A4F54' }}>A crew running 8 stops in 4 miles is a different business than 8 stops across 40. It never shows in EBITDA, and it's the single biggest driver of margin after close. We'd rank the 55 by drive-time density before anything else.</div>
                  </div>
                  <div data-numrow style={{ display: 'grid', gridTemplateColumns: '44px 200px 1fr', gap: 16, padding: '16px 0', borderBottom: '1px solid #E4DFD3' }}>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: '#7C8187' }}>02</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Contract tenure.</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#4A4F54' }}>Month-to-month "commercial" revenue is worth a fraction of 3-year contracted revenue, even at identical margin. A third of the 55 won't survive this test.</div>
                  </div>
                  <div data-numrow style={{ display: 'grid', gridTemplateColumns: '44px 200px 1fr', gap: 16, padding: '16px 0' }}>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: '#7C8187' }}>03</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Crew that stays without the owner.</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#4A4F54' }}>In this trade, the crews often leave with the seller. The ones where they don't are worth a full turn more — and you can check it in diligence before you're committed.</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, border: '1px solid #E4DFD3', background: '#F9F7F1', padding: '20px 24px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>WHAT MOST BUYERS MISS</div>
                  <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>Two companies here with identical EBITDA can be worth two turns apart on route density alone. Most buyers underwrite the earnings, ignore the drive time, and wonder why margins compress the quarter after close. We price the routes first, the EBITDA second.</div>
                </div>
                <div data-split style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 26, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>THE NUMBER</div>
                    <div style={{ marginTop: 6, fontFamily: SERIF, fontWeight: 550, fontSize: 58, lineHeight: 1, letterSpacing: '-0.02em' }}>
                      $6–8M<span style={{ display: 'block', height: 5, width: 76, background: '#0A7A58', marginTop: 10 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>On a $4M-EBITDA target at this size, getting the route-density read wrong is roughly a <strong style={{ color: '#16181A' }}>1.5–2.0x swing in EBITDA multiple</strong> — call it $6–8M of purchase price on a single deal, decided by one variable most buyers never model.</div>
                </div>
                <div style={{ marginTop: 26, borderTop: '1px solid #E4DFD3', paddingTop: 22 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.14em', color: '#0A7A58' }}>OUR READ</div>
                  <div style={{ marginTop: 10, fontSize: 15.5, lineHeight: 1.65, color: '#16181A' }}>This is one of the last genuinely fragmented service niches in the region, and the window is open — but only for a buyer disciplined enough to pay for route quality and walk from the pretty-EBITDA traps. That discipline is the whole game here.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 26px', borderTop: '1px solid #E4DFD3', background: '#F9F7F1' }}>
                <span style={{ fontSize: 13, color: '#7C8187', fontStyle: 'italic' }}>Preliminary sample — illustrative of the deliverable format.</span>
                <a
                  href="#yulia"
                  className="ca-h-greenbg"
                  style={{ fontSize: 15, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '10px 18px', borderRadius: 9 }}
                  onClick={() => trackEvent('practice_cta_clicked', { placement: 'sample-run-yours' })}
                >
                  Run yours →
                </a>
              </div>
            </div>
            <div data-rv style={{ margin: '64px auto 0', maxWidth: 640, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: '#4A4F54' }}>That's the work. Most acquisitions fall apart somewhere in the middle — an add-back that doesn't hold up, a diligence problem caught too late, a negotiation run by the more experienced side of the table.</p>
              <p style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 600, fontSize: 24, lineHeight: 1.35 }}>You make the decisions. We handle the rest, and we get you to the closing table.</p>
              <a
                href="#yulia"
                className="ca-h-greenbg"
                style={{ display: 'inline-block', marginTop: 32, fontSize: 17, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '16px 30px', borderRadius: 10, whiteSpace: 'nowrap' }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'how-close' })}
              >
                Build your market map →
              </a>
              <div style={{ marginTop: 18 }}>
                <a
                  href="/collateral/smbx-corpdev-offering.pdf"
                  download="smbx-corpdev-offering.pdf"
                  className="ca-h-deepgreen"
                  style={{ fontSize: 14.5, color: '#0A7A58', borderBottom: '1px solid #0A7A58', paddingBottom: 2 }}
                  onClick={() => trackEvent('practice_cta_clicked', { placement: 'how-offering-pdf' })}
                >
                  Take this with you — the smbXCorpDev offering (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING — dark band ══ */}
        <section id="pricing" className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(62px, 10vw, 170px) clamp(20px, 4vw, 32px)', marginTop: 'clamp(57px, 10vw, 170px)', position: 'relative' }}>
          <div aria-hidden="true" data-plx="0.02" style={{ position: 'absolute', top: 40, right: '6%', width: 280, height: 190, backgroundImage: 'radial-gradient(rgba(168,240,206,.2) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          {/* HEAD_CTR, not the reference's 840 — same one-line finding as
              #owners. The sub (38em) and the form (520) carry their own caps,
              so only the headline takes the extra width. */}
          <div style={{ maxWidth: HEAD_CTR, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div data-rv><Kicker dark center>PRICING</Kicker></div>
            <h2 data-rv style={{ margin: '26px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(24px, 3.2vw, 54px)', lineHeight: 1.12, letterSpacing: '-0.012em', textWrap: 'balance' }}>Simple, up-front pricing — we'll send you the schedule.</h2>
            <p data-rv style={{ margin: '22px auto 0', maxWidth: '38em', fontSize: 17.5, lineHeight: 1.65, color: '#ABB2AB' }}>One schedule for every client, spelled out in a short brochure — the retainer, the success fee, and how the credit at close works. Nothing to haggle over. Tell us where to send it.</p>
            <PricingRequest />
          </div>
        </section>

        {/* ══ WHO IT'S FOR ══ */}
        <section id="who" style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(68px, 12vw, 200px) clamp(20px, 4vw, 32px) 20px' }}>
          <div data-rv style={{ position: 'relative', textAlign: 'center', padding: '10px 0 26px' }}>
            <div aria-hidden="true" data-whomark data-plx="-0.02" style={{ position: 'absolute', left: '1%', top: -14, width: 110, height: 110, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(22,24,26,.15) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }}>
              <span style={{ position: 'absolute', left: 0, bottom: -12, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', padding: '3px 7px' }}>FAMILY OFFICE</span>
            </div>
            <div aria-hidden="true" data-whomark data-plx="0.025" style={{ position: 'absolute', right: '1%', top: -6, width: 100, height: 100, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(22,24,26,.15) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }}>
              <span style={{ position: 'absolute', right: 0, bottom: -12, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', padding: '3px 7px' }}>PE FIRM</span>
            </div>
            <div aria-hidden="true" data-whomark data-plx="0.04" style={{ position: 'absolute', left: '2%', bottom: -56, width: 86, height: 86, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(22,24,26,.15) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }}>
              <span style={{ position: 'absolute', left: 0, top: -12, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', padding: '3px 7px' }}>SEARCHER</span>
            </div>
            <Kicker center>WHO IT'S FOR</Kicker>
            <h2 style={{ position: 'relative', zIndex: 1, margin: '26px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(32px, 5vw, 84px)', lineHeight: 1.05, letterSpacing: '-0.015em' }}>Built for serious buyers.</h2>
          </div>
          <div data-rv className="rv-stagger" data-who-grid style={{ marginTop: 'clamp(28px, 4.6vw, 76px)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: '#E4DFD3', border: '1px solid #E4DFD3' }}>
            {/* Each card goes to ITS OWN buyer page (2026-08-08, Paul: "if I
                click on any of these I go to book a call instead"). Every one
                of the five carried `href="#cta"`, so five distinct promises —
                direct deals, a live deal, your search — all landed on the same
                booking card. That is the 2026-08-02 lesson verbatim: five
                labels, one destination reads as broken. The nav dropdown was
                fixed then; these were left behind because the Carta reference
                draws them as a hairline grid and the prototype had no pages to
                send them to. We have all five. */}
            {WHO.map(w => (
              <Link
                key={w.label}
                href={buyerHref(w.label)}
                className="ca-h-banddeep"
                style={{ position: 'relative', display: 'block', background: '#F3F0E9', padding: '26px 22px 60px', color: '#16181A' }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'who-index', segment: w.label })}
              >
                <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.15 }}>{w.label}</span>
                <span style={{ display: 'block', marginTop: 14, fontSize: 14, lineHeight: 1.6, color: '#4A4F54' }}>{w.body}</span>
                <span style={{ position: 'absolute', left: 22, bottom: 18, fontSize: 13.5, fontWeight: 600, color: '#0A7A58' }}>{w.link}</span>
                <span aria-hidden="true" style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, background: '#0A7A58', color: '#FCFAF6', display: 'grid', placeItems: 'center', fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ SECTORS ══ */}
        <section id="sectors" style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(62px, 11vw, 190px) clamp(20px, 4vw, 32px) 30px' }}>
          <div data-rv style={{ maxWidth: 880 }}>
            <Kicker>KEY INDUSTRY VERTICALS</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(26px, 3.4vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.012em', textWrap: 'balance' }}>We go deep in a handful of markets. Yours may be one of them.</h2>
            <p style={{ margin: '24px 0 0', maxWidth: '42em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>The sectors we know cold — the operators, the multiples, the diligence traps, and the targets already on our desk. Focus, not limits.</p>
          </div>
          <div data-rv data-g3 className="rv-stagger" style={{ marginTop: 'clamp(28px, 4.6vw, 76px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#E4DFD3', border: '1px solid #E4DFD3' }}>
            {HUNT_LANES.map(l => (
              <Link
                key={l.nm}
                href={laneHref(l.nm, SECTOR_NAMES)}
                className="ca-h-band"
                style={{ position: 'relative', display: 'block', background: '#FCFAF6', padding: '22px 24px 24px', color: '#16181A' }}
                onClick={() => trackEvent('practice_sector_clicked', { sector: l.nm })}
              >
                <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 16.5, lineHeight: 1.3 }}>{l.nm}</span>
                  <span aria-hidden="true" style={{ flex: 'none', color: '#0A7A58', fontSize: 15 }}>→</span>
                </span>
                <span style={{ display: 'block', marginTop: 9, fontSize: 14, lineHeight: 1.55, color: '#7C8187' }}>{l.th}</span>
              </Link>
            ))}
            {/* Fill the last row's remainder (Paul, 2026-08-08: "in markets
                there is a weird dark rectangle"). The grid paints the seam by
                showing its own #E4DFD3 background through a 1px gap, so any
                cell the lanes don't fill renders as a solid tan block — which
                is what appeared the moment MEP took the board from 15 lanes
                (exactly 5 rows of 3) to 16. ONE filler spanning the whole
                remainder, not one per empty cell: separate fillers would draw
                seams between themselves and read as an unfinished table.
                Computed from the register so the next lane added can't bring
                the block back. */}
            {HUNT_LANES.length % 3 !== 0 && (
              <div aria-hidden="true" data-lanefill style={{ gridColumn: `span ${3 - (HUNT_LANES.length % 3)}`, background: '#FCFAF6' }} />
            )}
          </div>
          <div data-rv style={{ marginTop: 38, textAlign: 'center' }}>
            <Link href="/industries" className="ca-h-deepgreen" style={{ fontSize: 16, fontWeight: 600, color: '#0A7A58', borderBottom: '1.5px solid #0A7A58', paddingBottom: 2 }}>Read the full sector theses →</Link>
          </div>
        </section>

        {/* ══ WHOSE SIDE — dark band ══ */}
        <section className="ca-dark" style={{ background: '#131512', color: '#F4F5F1', padding: 'clamp(68px, 11vw, 180px) clamp(20px, 4vw, 32px)', marginTop: 'clamp(57px, 10vw, 170px)', position: 'relative', overflow: 'hidden' }}>
          {/* The dot field sits BEHIND the headline, not marooned in a corner
              (2026-08-08). It was anchored `left: 5%; bottom: 36` — a 300×170
              block alone in the band's bottom-left, aligned to nothing and
              meaning nothing. Carta's dot fields always sit behind the type
              they belong to; that is the difference between an ornament that
              composes and one that decorates.
              Centred on the headline's own axis and wide enough to run past
              it on both sides, so the type reads as sitting ON the field
              rather than next to it. z-index 0 under the content's z-index 1
              — the copy below already carries its own stacking. */}
          <div aria-hidden="true" data-plx="0.03" style={{ position: 'absolute', left: '50%', top: '30%', transform: 'translateX(-50%)', width: 'min(760px, 86%)', height: 200, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(168,240,206,.16) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div data-rv><Kicker dark center>WHOSE SIDE WE'RE ON</Kicker></div>
            {/* TWO-TONE (2026-08-08). The accent lands on the TURN, never on the
                setup — the sentence states a fact, then asks the question that
                is the whole practice. Mint rather than Deal Green because this
                is a dark band: green on #131512 is the low-contrast trap the
                token table already warns about, and mint is the sanctioned
                on-dark accent. The device is not new here — the collateral
                deck builder has drawn hooks this way for months
                (`twoToneHook`); it had simply never reached the site. */}
            <p data-rv style={{ margin: '34px auto 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(27px, 4.2vw, 68px)', lineHeight: 1.1, letterSpacing: '-0.014em', textWrap: 'balance' }}>The seller has a broker. <span style={{ color: '#A8F0CE' }}>Who is working for&nbsp;you?</span></p>
            <p data-rv style={{ margin: '26px auto 0', maxWidth: '38em', fontSize: 17.5, lineHeight: 1.65, color: '#ABB2AB' }}>We represent buyers, and only buyers — one client per target. You get our full attention, unfiltered analysis, and a proprietary deal that stays yours.</p>
            {/* THE LINE, DRAWN (2026-08-08). The band asserted exclusivity in
                prose; this is the same claim as a picture — you, us, and ONE
                company, wired, with the target left unlit because it is the
                thing being worked rather than a party to the engagement.
                The three chips are facts about US, which is the copy law: the
                grievance register stays out, and the reader draws the contrast
                from the headline above, which is already sanctioned. */}
            <div data-rv data-chain className="ch-dark" style={{ margin: '46px auto 0', maxWidth: 760 }}>
              {[
                { t: 'YOU', v: 'The buyer', on: true },
                { t: 'SMBX', v: 'Your corp dev', on: true },
                { t: 'TARGET', v: 'One company' },
              ].map((n, i) => (
                <Fragment key={n.t}>
                  {i > 0 && <span className="ch-wire" aria-hidden="true"><i /></span>}
                  <div className={`ch-node${n.on ? ' ch-hit' : ''}`} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em' }}>{n.t}</div>
                    <div style={{ marginTop: 8, fontFamily: SERIF, fontWeight: 600, fontSize: 21, lineHeight: 1.2 }}>{n.v}</div>
                  </div>
                </Fragment>
              ))}
            </div>
            <div data-rv style={{ margin: '20px auto 0', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['NOT SHOPPED', 'NO SECOND BUYER', 'NO SELL-SIDE FEE'].map(c => (
                <span key={c} style={{ border: '1px dashed #3A3F38', color: '#8E948B', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.08em', padding: '9px 13px' }}>{c}</span>
              ))}
            </div>
            <div data-rv style={{ margin: '22px auto 0', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.14em', color: '#A8F0CE' }}>ONE CLIENT · ONE TARGET · ONE SIDE</div>
            <div data-rv style={{ marginTop: 52, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="#yulia"
                className="ca-h-mintbg"
                style={{ fontSize: 16, fontWeight: 600, color: '#16181A', background: '#FCFAF6', padding: '15px 26px', borderRadius: 10, whiteSpace: 'nowrap' }}
                onClick={() => trackEvent('practice_cta_clicked', { placement: 'whose-side' })}
              >
                Build your market map →
              </a>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-mintline"
                style={{ fontSize: 16, fontWeight: 500, color: '#F4F5F1', padding: '13.5px 24px', border: '1.5px solid #4A4F44', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'whose-side' })}
              >
                Book a call
              </a>
            </div>
          </div>
        </section>

        {/* ══ OWNERS ══ */}
        {/* CENTERED-HEAD MEASURE + TAIL PANEL (Paul, 2026-08-08, on the live
            site: "hero is truncated instead of wide … content feel vertically
            cramped on valuation page"). Both are deliberate departures from
            the reference, which boxed this centred head at 880 over a 1296
            grid — measured, the headline broke to two lines at every desktop
            width while 416px of the row sat empty beside it. 1080 is the
            MEASURED threshold: the minimum width that lands the headline on
            one line at every viewport down to 1100 (see HEAD_CTR below), so
            it goes wide without becoming a full-bleed slab. The sub keeps its
            own 42em cap, so body measure is untouched.
            The tail was three text blocks stacked at 52/26/30 under a
            five-row chip cluster — the cramping Paul felt. It is now ONE
            framed panel with the house corner handles: the same pixels read
            as a deliberate "start here" card instead of a dense drift. */}
        <section id="owners" style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', padding: 'clamp(68px, 12vw, 200px) clamp(20px, 4vw, 32px) 20px' }}>
          <div data-rv style={{ position: 'relative', zIndex: 1, maxWidth: HEAD_CTR, margin: '0 auto', textAlign: 'center' }}>
            <Kicker center>OWN ONE OF THESE BUSINESSES?</Kicker>
            <h2 style={{ margin: '22px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(26px, 3.4vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.012em', textWrap: 'balance' }}>Get the valuation buyers are working from — free.</h2>
            <p style={{ margin: '24px auto 0', maxWidth: '42em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>You'll sit across from a buyer exactly once, and they'll arrive knowing what your business is worth to them. This is that read, from the people who build it for buyers — free, because when one engages us in your lane, we want to already know you.</p>
          </div>
          <div data-rv data-g3 className="rv-stagger" style={{ position: 'relative', zIndex: 1, marginTop: 'clamp(36px, 6vw, 104px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            <div style={{ borderTop: '2px solid #16181A', paddingTop: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.13em', color: '#0A7A58' }}>BUYERS REBUILD YOUR NUMBERS</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>A buyer's accountants don't price the tax return — they rebuild it: owner compensation, one-time costs, personal expenses, owned real estate restated to market rent. Your valuation runs that same walk, line by line, so the number your range applies to is the one a buyer would actually use.</p>
            </div>
            <div style={{ borderTop: '2px solid #16181A', paddingTop: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.13em', color: '#0A7A58' }}>BUYERS PAY FOR WHAT RECURS</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>Two businesses with identical profit can trade turns apart. Maintenance contracts, a team that runs without you, a granular customer base, clean books — these are the drivers buyers price, and your readiness read scores every one and names which is worth your next year of work.</p>
            </div>
            <div style={{ borderTop: '2px solid #16181A', paddingTop: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.13em', color: '#0A7A58' }}>BUYERS PRICE THE TRADE FIRST</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.65, color: '#4A4F54' }}>Every trade has a published band where deals actually clear. Your valuation cites that band — source and vintage named — and shows where your business profile sits inside it. No made-up number, and never a single magic figure.</p>
            </div>
          </div>
          {/* The tail as one framed panel (see the section note above): the
              instruction, the trade chips and the disclaimer are one object
              on the panel tint, wearing the house handles. The chips are
              white, so they still read against #F3F0E9. */}
          <div data-rv style={{ position: 'relative', zIndex: 1, margin: 'clamp(37px, 6vw, 100px) auto 0', maxWidth: HEAD_CTR, background: '#F3F0E9', padding: 'clamp(28px, 3.4vw, 52px) clamp(28px, 3vw, 46px) clamp(28px, 3vw, 46px)' }}>
            {/* Dot texture INSIDE the panel, not flanking it. Side ornaments
                were tried here first and cannot survive: a 1080 head inside a
                1216 content box at 1280px leaves 68px of gutter, so any
                cluster wide enough to read either collides with the headline
                or leaves the viewport. Contained, it works at every width.
                Two traps, both of which would have RENDERED rather than
                errored: the panel must NOT clip its overflow (the handles sit
                at -4px OUTSIDE it and would be sheared off), so the texture
                is inset to 0 instead of bled past the corner; and an
                absolutely-positioned box paints ABOVE static text in the same
                stacking context, so the copy below carries its own
                position:relative rather than sitting under the dots. */}
            <div aria-hidden="true" data-plx="0.02" style={{ position: 'absolute', top: 0, right: 0, width: 190, height: 128, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(22,24,26,.14) 1.1px, transparent 1.1px)', backgroundSize: '14px 14px' }} />
            <Handles />
            {/* The same instructions as a numbered list (Paul, 2026-08-08:
                "let's make the instructions a simple number list on mobile and
                desktop"). It was one centred paragraph of five clauses, which
                on a phone is six lines of prose where the reader is trying to
                work out what happens next.
                The WORDS are Paul's, split at the punctuation he already used
                as beats — the semicolon after "draft", the comma before "and
                from there" — so this is a re-set, not a rewrite.
                A real <ol>, so it is announced as a five-step list rather than
                as five stray lines, and one grid shape that needs no
                breakpoint: a 26px numeral rail holds at 360px and at 1440px
                alike. Left-aligned inside a centred block — numbers down a
                ragged centre would be unreadable as a sequence. */}
            <ol style={{ position: 'relative', zIndex: 1, margin: '0 auto', maxWidth: '34em', padding: 0, listStyle: 'none', display: 'grid', gap: 14, textAlign: 'left' }}>
              {[
                'Pick your trade — the engine above starts your valuation.',
                'The first sitting delivers your draft.',
                'Finishing the walk narrows the range.',
                'Your progress saves, so you can leave and come back.',
                'What stays on file is your call — shown to you in full at the end.',
              ].map((step, i) => (
                <li key={step} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, alignItems: 'baseline' }}>
                  <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', color: '#0A7A58' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 16.5, lineHeight: 1.6, color: '#16181A', fontWeight: 500 }}>{step}</span>
                </li>
              ))}
            </ol>
            <div style={{ position: 'relative', zIndex: 1, margin: '32px auto 0', maxWidth: 1000, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {OWNER_LANES.map(l => (
              <button
                key={l.key}
                type="button"
                className="ca-lanechip"
                onClick={() => {
                  trackEvent('owner_lane_picked', { lane: l.key, via: 'owners-section' });
                  window.dispatchEvent(new CustomEvent('smbx:open-owner', { detail: l }));
                }}
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              className="ca-lanechip alt"
              onClick={() => {
                trackEvent('owner_lane_picked', { lane: 'other', via: 'owners-section' });
                window.dispatchEvent(new CustomEvent('smbx:open-owner', { detail: { other: true } }));
              }}
            >
              Another trade →
            </button>
            </div>
            <p style={{ position: 'relative', zIndex: 1, margin: '34px auto 0', maxWidth: '52em', textAlign: 'center', fontSize: 13, lineHeight: 1.65, color: '#7C8187', fontStyle: 'italic' }}>Published market ranges for your trade, applied to figures you provide, plus the readiness drivers buyers actually price — not a formal appraisal; for one, engage a credentialed appraiser. At the end, the chat shows you exactly what's on file for your company, and you keep it or delete it on the spot.</p>
          </div>
        </section>

        {/* ══ FOUNDER ══ */}
        <section style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(62px, 11vw, 190px) clamp(20px, 4vw, 32px) 0' }}>
          <div data-rv data-fnd className="rv-stagger" style={{ background: '#F3F0E9', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 48, padding: '48px 52px', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 230 }}>
              <img data-rvimg src="/founder-portrait.jpg" alt="Paul Baker" loading="lazy" style={{ display: 'block', width: 230, height: 250, objectFit: 'cover', objectPosition: '50% 0%' }} />
              <span style={{ position: 'absolute', right: -14, bottom: -14, width: 34, height: 34, background: '#0A7A58', color: '#FCFAF6', display: 'grid', placeItems: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 20, fontStyle: 'italic' }}>"</span>
              {/* No ornament over the portrait (2026-08-08, Paul: "there is an
                  arc on my headshot that should not be"). A dashed quarter-arc
                  used to spring off the top-right corner; against a face it
                  read as a defect in the photo rather than as house jewelry.
                  The green quote mark stays — it sits clear of the crop. */}
            </div>
            <div>
              <Kicker>WHO YOU'LL TALK TO</Kicker>
              <p style={{ margin: '20px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(20px, 2.4vw, 38px)', lineHeight: 1.25, letterSpacing: '-0.01em', maxWidth: '22em' }}>Twenty years as the internal deal captain for major platforms. Now running that same playbook for independent buyers.</p>
              <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', color: '#16181A' }}>PAUL BAKER</div>
              <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: '#7C8187' }}>FOUNDER · TWO DECADES ON THE BUY SIDE</div>
              <Link href="/about" className="ca-h-deepgreen" style={{ display: 'inline-block', marginTop: 18, fontSize: 15.5, fontWeight: 600, color: '#0A7A58', borderBottom: '1.5px solid #0A7A58', paddingBottom: 2 }}>Meet Paul →</Link>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section id="cta" style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', padding: 'clamp(68px, 12vw, 200px) clamp(20px, 4vw, 32px) clamp(68px, 12vw, 210px)' }}>
          {/* The closing section carried no mark at all (Paul, 2026-08-08:
              "we can have more whatever these little shapes are called"). The
              orbit is the founder band's gesture, reused here at the page's
              last turn; it sits in the left column's own slack under a
              text-wrap:balance headline, so it cannot crowd the copy. */}
          <div aria-hidden="true" data-cta-orbit data-plx="-0.02" className="ca-orbit" style={{ position: 'absolute', left: 22, bottom: 'clamp(38px, 7vw, 130px)', width: 132, height: 132, zIndex: 0, pointerEvents: 'none' }}>
            {/* Wrapper > animated div > svg is the hero orbit's exact
                structure, kept because the reduced-motion guard in carta.css
                targets `.ca-orbit > div` — a bare svg child would spin
                straight through that preference. */}
            <div style={{ width: 132, height: 132, transformOrigin: '50% 50%' }}>
              <svg width="132" height="132" viewBox="0 0 132 132" fill="none">
                <ellipse cx="66" cy="66" rx="63" ry="26" stroke="#0A7A58" strokeWidth="1.2" strokeDasharray="5 6" opacity=".55" />
                <circle cx="66" cy="66" r="62" stroke="#0A7A58" strokeWidth="1.2" opacity=".3" />
              </svg>
            </div>
          </div>
          <div data-cta-grid style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 64, alignItems: 'center' }}>
            <div data-rv>
              <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(29px, 4.4vw, 72px)', lineHeight: 1.06, letterSpacing: '-0.015em', textWrap: 'balance' }}>Start with a confidential conversation.</h2>
              <p style={{ margin: '24px 0 0', maxWidth: '30em', fontSize: 18, lineHeight: 1.65, color: '#4A4F54' }}>Thirty minutes. Your ideas, our read on the market, and a straight answer on whether we're the right team to run it.</p>
            </div>
            <div data-rv style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #16181A', padding: '32px 34px' }}>
              <Handles />
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 26 }}>Book 30 minutes</div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: '#4A4F54' }}>A personal conversation, not a sales call — pick a time that works and come with your ideas — you don't need a finished thesis. Building one together is part of the work.</p>
              <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: '#7C8187' }}>30 MIN · VIDEO CALL · CONFIDENTIAL</div>
              <a
                href={bookHref()}
                target={bookTarget()}
                rel={bookRel()}
                className="ca-h-greenbg"
                style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 16, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '15px 26px', borderRadius: 10 }}
                onClick={() => trackEvent('practice_booking_clicked', { placement: 'cta-card' })}
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
