/**
 * Practice-site landing — corpdevservices layout + Paul's copy deck and
 * additions (2026-07-11). Sections: nav · hero + Yulia intake · ticker ·
 * photo band · problem ledger · process (#how) · track record · the firm
 * (#why) · who it's for (#who) · industries (#industries) · how we find them
 * · whose-side band · FAQ · final CTA (#book) · footer.
 */
import { useState } from 'react';
import { Link } from 'wouter';
import PracticeShell from './PracticeShell';
import YuliaIntake from './YuliaIntake';
import ImageSlot from './ImageSlot';
import { postPracticeLead, bookHref, bookTarget } from './leads';
import { SEGMENTS } from './segmentData';

const TICKER = [
  'Deal thesis defined by your needs',
  'Premium off-market outreach',
  'Pipeline management',
  'Due diligence',
  'Document management and dataroom',
  'Full deal life-cycle management',
  'Closed on your terms',
];

function TickerRow() {
  return (
    <div className="pd-ticker-seg" aria-hidden>
      {TICKER.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span className="t">{t}</span>
          <span className="d">●</span>
        </span>
      ))}
    </div>
  );
}

const LEDGER = [
  {
    name: 'Build a team',
    body: 'A lean two-person corp-dev function runs $600K–$1M+ a year, fully loaded — a fixed cost attached to an occasional activity. It sits idle between deals.',
    tag: 'FIXED COST · IDLE CAPACITY',
  },
  {
    name: 'Hire a bank',
    body: 'Retainers, success fees with long tails, and your day-to-day work handed to junior analysts — at a firm working similar deals for other clients at the same time.',
    tag: 'JUNIOR HANDS · SPLIT LOYALTY',
  },
  {
    name: 'Go it alone',
    body: "No fees — and no bandwidth, no process, and an information disadvantage against a seller's broker who does this every week.",
    tag: 'OUTGUNNED · OUT OF TIME',
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
    q: 'How is this different from hiring a bank?',
    a: "A bank sells you a senior name and staffs your deal with analysts, then charges a retainer plus a percentage — often while working similar mandates for other clients. We're the opposite: one senior operator on every piece of your deal, working for you alone on that target. And because we advise buyers only, we're never quietly on the other side of a transaction you care about.",
  },
  {
    q: "How do you find targets that aren't for sale?",
    a: "Direct, discreet outreach to owners on your behalf — the ones who'd never hire a broker. See How we find them above.",
  },
  {
    q: 'Who actually does the work?',
    a: 'Your advisor does. Proprietary AI handles the grind that used to require a bench of analysts — market maps, models, first-pass diligence — which is exactly why a senior operator can be on every part of your deal instead of just the pitch.',
  },
  {
    q: 'Do you negotiate for us?',
    a: "We run the process and drive the negotiation at your direction — but you're the acquirer. You set the price, you approve every move, and you sign. When your deal needs a licensed attorney, a transaction CPA, or a lender, we bring in the right one and manage the work.",
  },
  {
    q: 'What does it cost?',
    a: "A retainer for the engagement, and a success fee when we close the deal you wanted — paid by you, for work we did for you. Never a dollar from the seller or the middle of the transaction. We'll scope it in one conversation.",
  },
  {
    q: 'Will you work with a competitor of mine?',
    a: 'Not on your target. We take one client per target, so your thesis and your pipeline stay yours.',
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
      {/* ── Hero ── */}
      <section className="pd-hero">
        <div aria-hidden>
          <div className="pd-radar-ring" style={{ width: 1300, height: 1300, border: '1px solid rgba(34,34,34,.06)' }} />
          <div className="pd-radar-ring" style={{ width: 960, height: 960, border: '1px solid rgba(34,34,34,.08)' }} />
          <div className="pd-radar-ring" style={{ width: 640, height: 640, border: '1px solid rgba(34,34,34,.10)' }} />
          <div className="pd-radar-dot" style={{ left: '16%', top: '22%', width: 9, height: 9, opacity: 0.8 }} />
          <div className="pd-radar-dot" style={{ left: '82%', top: '18%', width: 7, height: 7, opacity: 0.5 }} />
          <div className="pd-radar-dot" style={{ left: '88%', top: '60%', width: 8, height: 8, opacity: 0.65 }} />
          <div className="pd-radar-dot" style={{ left: '9%', top: '66%', width: 7, height: 7, opacity: 0.4 }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div className="pd-badge"><span className="dot" />BUY-SIDE ONLY</div>
          <h1 className="pd-h1" style={{ margin: '52px 0 0' }}>Stress-free corp dev.</h1>
          <div className="pd-sub" style={{ margin: '44px auto 0', maxWidth: 680 }}>
            A senior deal team that plugs in immediately and runs your whole acquisition — thesis
            to close — tailored to your organizational goals from the ground up.
          </div>
          <YuliaIntake />
          <div style={{ marginTop: 20, fontSize: 14.5, color: 'var(--pd-tert)' }}>
            Prefer a human first?{' '}
            <a href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined} style={{ color: 'var(--pd-coral-link)', fontWeight: 600, textDecoration: 'underline' }}>
              Book advisor call now →
            </a>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="pd-ticker">
        <div className="pd-ticker-track"><TickerRow /><TickerRow /></div>
      </div>

      {/* ── Photo band ── */}
      <div className="pd-bandwrap" style={{ paddingTop: 'clamp(60px, 6.6vw, 96px)' }}>
        <div className="pd-band">
          <ImageSlot caption="PHOTO — advisor + owner walking a shop floor, warm light" />
          <div className="pd-band-overlay">
            <div className="pd-band-h">A person on your side. A full team at your back.</div>
            <a className="pd-band-btn" href="#why">Why smbX →</a>
          </div>
        </div>
      </div>

      {/* ── Problem ledger ── */}
      <section className="pd-wrap pd-section">
        <div className="pd-ledger-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 72 }}>
          <h2 className="pd-h2" style={{ maxWidth: 820 }}>There are three ways to buy a company. We built a fourth.</h2>
          <div className="pd-seclabel right">The problem</div>
        </div>
        <div className="pd-ledger">
          {LEDGER.map(r => (
            <div className="pd-lrow" key={r.name}>
              <div className="pd-lname">{r.name}</div>
              <div className="pd-lbody">{r.body}</div>
              <div className="pd-ltag">{r.tag}</div>
            </div>
          ))}
          <div className="pd-lrow hl">
            <div className="pd-lname">smbX</div>
            <div className="pd-lbody">
              One senior operator doing the work of a full deal team — engaged per deal, aligned to
              you alone, and gone when you're done.
            </div>
            <div className="pd-ltag">SENIOR · ALIGNED · YOURS ALONE</div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="how" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-seclabel">The process</div>
        <h2 className="pd-h2" style={{ maxWidth: 760 }}>Here's what stress-free looks like.</h2>
        <div className="pd-pgrid">
          <div className="pd-pcard">
            <div className="pd-pnum">1</div>
            <div className="t">Conversation</div>
            <div className="b">Tell Yulia what you want to buy. She works your thesis overnight and books you with your advisor — a real senior practitioner, not a call center.</div>
            <a className="pd-link" href="#yulia">Talk to Yulia →</a>
          </div>
          <div className="pd-pcard">
            <div className="pd-pnum">2</div>
            <div className="t">Curated targets</div>
            <div className="b">We map your market — off-market first — and your advisor hand-picks the targets worth your time, with models and memos ready in days, not quarters.</div>
            <a className="pd-link" href="#why">How we work →</a>
          </div>
          <div className="pd-pcard">
            <div className="pd-pnum">3</div>
            <div className="t">Close with confidence</div>
            <div className="b">Diligence triaged, price disciplined, negotiation run by someone on your side of the table — and only yours. Then we scale to zero.</div>
            <a className="pd-link" href="#book">Book a call →</a>
          </div>
        </div>
      </section>

      {/* ── Track record ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-seclabel">Track record</div>
        <h2 className="pd-h2" style={{ maxWidth: 820 }}>We've done this about 150 times.</h2>
        <div style={{ marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '46em' }}>
          smbX is a new firm. The dealmaker isn't. Our founder spent two decades as the deal
          captain inside the buyer — sourcing, negotiating, closing, and integrating acquisitions
          at platform scale.
        </div>
        <div className="pd-stats">
          <div className="pd-stat"><div className="n">150+</div><div className="l">acquisitions closed</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">in revenue added to buyers</div></div>
          <div className="pd-stat"><div className="n">20 yrs</div><div className="l">inside corp dev and the investment bank</div></div>
          <div className="pd-stat"><div className="n">1</div><div className="l">side of the table — always the buyer's</div></div>
        </div>
        <div className="pd-tombs">
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
        <div style={{ marginTop: 32 }}>
          <Link href="/track-record" className="pd-link">See the full track record →</Link>
        </div>
      </section>

      {/* ── The firm ── */}
      <section id="why" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-firm-grid">
          <div>
            <div className="pd-seclabel">The firm</div>
            <h2 className="pd-h2">New firm. Old hands.</h2>
            <div style={{ marginTop: 32, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              smbX launched in 2025 to put a real corp-dev function within reach of buyers who
              could never justify building one. Most buy-side help is a senior name on the pitch
              and a junior analyst on the actual work. We inverted that: proprietary AI does the
              grind a junior bench used to — sourcing, models, first-pass diligence — so the
              senior operator you hired is the one on your deal, reading the numbers, working the
              seller, and running the negotiation. A full team's output. One principal's judgment.
              No hand-offs.
            </div>
            <div className="pd-drows" style={{ marginTop: 56 }}>
              <div className="pd-drow">
                <div className="k">The work</div>
                <div className="v">Market maps, off-market sourcing, CIM triage, financial models, diligence checklists — in days, not quarters.</div>
              </div>
              <div className="pd-drow">
                <div className="k">The practitioner</div>
                <div className="v">Every judgment call, seller conversation, and negotiation handled by a senior operator. There's no one to hand you off to.</div>
              </div>
              <div className="pd-drow">
                <div className="k">Your side</div>
                <div className="v">Buy-side is all we do, and we take one client per target. Your deal gets our full attention — and it stays yours.</div>
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
              <div style={{ fontWeight: 700, fontSize: 19 }}>Your advisor</div>
              <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.65, color: 'var(--pd-body)' }}>
                <b style={{ color: 'var(--pd-ink)' }}>Paul Baker, Founder.</b> Twenty years as a deal captain — Director of
                Corporate Development at Wrench Group, where he built the M&amp;A engine that took a
                startup platform to a national leader through 36 acquisitions, and Director of
                Acquisition Integration at JPMorgan Chase, integrating the bank's largest fintech
                and banking deals. He's sat on the buyer's side of the table for 150+ acquisitions.
                Now he sits on yours.
              </div>
              <div style={{ marginTop: 16 }}>
                <Link href="/about" className="pd-link">More about Paul →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section id="who" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-ledger-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 72 }}>
          <h2 className="pd-h2">You bring the thesis. We bring the team.</h2>
          <div className="pd-seclabel right">Who it's for</div>
        </div>
        <div className="pd-wgrid">
          {SEGMENTS.filter(s => s.slug !== 'operators').map(s => (
            <Link key={s.slug} href={`/buyers/${s.slug}`} className="pd-wcard">
              <div className="t">{s.cardTitle}</div>
              <div className="b">{s.cardBody}</div>
              <span className="pd-link">{s.cardLink}</span>
            </Link>
          ))}
          <Link href="/buyers/operators" className="pd-wcard pd-wcard-wide">
            <div>
              <div className="t">Operators buying competitors</div>
              <div className="b">Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal.</div>
              <span className="pd-link">For operators →</span>
            </div>
            <div className="pd-wphoto">
              <ImageSlot caption="PHOTO — main street storefronts, industrial park" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Industries ── */}
      <section id="industries" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-seclabel">Industries</div>
        <h2 className="pd-h2" style={{ maxWidth: 820 }}>We know these markets cold. And we'll learn yours.</h2>
        <div style={{ marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '46em' }}>
          Deep operating history in the essential-service trades — plus active theses in the
          fragmented, recurring-revenue niches where a disciplined buyer can still buy well.
          Already have a market? We'll work yours.
        </div>
        <div className="pd-scar">
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
        <div className="pd-drows" style={{ marginTop: 20 }}>
          {HUNTING.map(h => (
            <div className="pd-drow" key={h.k}>
              <div className="k">{h.k}</div>
              <div className="v">{h.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, fontSize: 16.5, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: '52em' }}>
          These are theses, not limits. If you're buying in a market we haven't named, tell us —
          we've built acquisition programs from a blank sheet before.
        </div>
      </section>

      {/* ── How we find them ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-seclabel">How we find them</div>
        <h2 className="pd-h2" style={{ maxWidth: 760 }}>The best sellers aren't for sale.</h2>
        <div style={{ marginTop: 28, maxWidth: '46em', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            The owner you want to buy is rarely on a broker's list. They don't want their employees
            to find out. They don't want their competitors to know. They don't want to sit through
            a dozen showings with tire-kickers, and they don't want to pay a broker 10% to make it
            happen.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)' }}>
            So they wait. And most will only take a call when someone arrives with a specific
            buyer, a specific thesis, and a serious reason to talk.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--pd-ink)' }}>
            <b>That's the call we make on your behalf.</b> No auction, no bidding war, no thirty
            other buyers who've already seen the book. Just a direct conversation with an owner who
            hasn't been shopped — where price is a discussion, not a competition.
          </div>
        </div>
      </section>

      {/* ── Whose side ── */}
      <div className="pd-bandwrap" style={{ paddingTop: 'clamp(110px, 12.5vw, 180px)' }}>
        <div className="pd-pledge">
          <div className="label">Whose side we're on</div>
          <div className="h">Yours. Start to <span className="coral">finish.</span></div>
          <div className="sub">
            We represent buyers, and only buyers — one client per target. So you get our full
            attention, straight answers, and a deal that stays yours.
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="pd-wrap pd-section-lg">
        <div className="pd-seclabel">Straight answers</div>
        <h2 className="pd-h2" style={{ maxWidth: 760 }}>Questions people ask before they call.</h2>
        <div className="pd-faq">
          {FAQ.map(f => (
            <div className="pd-faq-item" key={f.q}>
              <div className="q">{f.q}</div>
              <div className="a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="book" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90, paddingBottom: 'clamp(40px, 5vw, 80px)' }}>
        <div className="pd-cta-grid">
          <div>
            <h2 className="pd-cta-h">Let's go find the one.</h2>
            <div style={{ marginTop: 24, fontSize: 18, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: 480 }}>
              Two minutes with Yulia and your market map is underway — or talk to Paul directly.
              Confidential either way, and there's no retainer to find out if we're a fit.
            </div>
            <div style={{ marginTop: 44, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="pd-pill-primary pd-pill-lg" href="#yulia">Start with Yulia →</a>
              <a className="pd-pill pd-pill-lg-quiet" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>Confidential consultation</a>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>
    </PracticeShell>
  );
}
