/**
 * Practice-site landing — pixel-faithful implementation of the approved
 * corpdevservices design (`smbX Landing.dc.html`, direction 3a). Eleven
 * sections: nav · hero+radar+Yulia intake · ticker · photo band · problem
 * ledger · process · the firm · who it's for · pledge · final CTA · footer.
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
          <div className="pd-seclabel right">01 — The problem</div>
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
        <div className="pd-seclabel">02 — The process</div>
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

      {/* ── The firm ── */}
      <section id="why" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-firm-grid">
          <div>
            <div className="pd-seclabel">03 — The firm</div>
            <h2 className="pd-h2">One operator. A full team's output.</h2>
            <div style={{ marginTop: 32, fontSize: 18, lineHeight: 1.7, color: 'var(--pd-body)' }}>
              smbX is one senior practitioner who sources, runs, and closes your acquisition —
              with proprietary AI doing the grind a junior bench used to, so the person on your
              deal is always the senior one. You get a full team's output in days, and one person
              who owns the outcome, start to close.
            </div>
            <div className="pd-drows" style={{ marginTop: 56 }}>
              <div className="pd-drow">
                <div className="k">The work</div>
                <div className="v">Market maps, off-market outreach, CIM triage, financial models, diligence checklists, and the data room — a full team's output, in days, not quarters.</div>
              </div>
              <div className="pd-drow">
                <div className="k">The practitioner</div>
                <div className="v">Every judgment call, seller conversation, and negotiation handled by a senior operator. No hand-offs, no juniors, no committee lag.</div>
              </div>
              <div className="pd-drow">
                <div className="k">Your side</div>
                <div className="v">Buy-side is all we do, and we take one client per target — your deal has our full attention, and it stays yours.</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-founder-photo">
              <img
                src="/founder-portrait.jpg"
                alt="The smbX founder"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%' }}
              />
            </div>
            <div className="pd-advisor-card">
              <div style={{ fontWeight: 700, fontSize: 19 }}>Your advisor</div>
              <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.65, color: 'var(--pd-body)' }}>
                Founder bio goes here — two sentences on operating and deal history, one on why
                buy-side only. <span className="pd-mono" style={{ fontSize: 13 }}>(awaiting resume + deal sheet)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section id="who" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90 }}>
        <div className="pd-ledger-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 72 }}>
          <h2 className="pd-h2">You bring the thesis. We bring the team.</h2>
          <div className="pd-seclabel right">04 — Who it's for</div>
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

      {/* ── Whose side ── */}
      <div className="pd-bandwrap" style={{ paddingTop: 'clamp(110px, 12.5vw, 180px)' }}>
        <div className="pd-pledge">
          <div className="label">05 — Whose side we're on</div>
          <div className="h">Yours. Start to <span className="coral">finish.</span></div>
          <div className="sub">
            We represent buyers, and only buyers — one client per target. So you get our full
            attention, straight answers, and a deal that stays yours.
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <section id="book" className="pd-wrap pd-section-lg" style={{ scrollMarginTop: 90, paddingBottom: 'clamp(40px, 5vw, 80px)' }}>
        <div className="pd-cta-grid">
          <div>
            <h2 className="pd-cta-h">Let's go find the one.</h2>
            <div style={{ marginTop: 24, fontSize: 18, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: 480 }}>
              Two minutes with Yulia and your market map is underway. No retainer to find out if
              we're a fit.
            </div>
            <div style={{ marginTop: 44, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="pd-pill-primary pd-pill-lg" href="#yulia">Start with Yulia →</a>
              <a className="pd-pill pd-pill-lg-quiet" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>Book a call</a>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>
    </PracticeShell>
  );
}
