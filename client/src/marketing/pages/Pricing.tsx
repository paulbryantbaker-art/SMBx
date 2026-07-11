/**
 * `/pricing` — the July 10 model (copy deck 2026-07-10): one flat fee to run
 * the whole deal, sized by deal league, non-contingent, never a percentage.
 * No tier grid and no published matrix by design — the page shows the shape
 * ("a few thousand to the low tens of thousands"); Yulia quotes the exact
 * number in-conversation right after the free Baseline™. Subscription
 * survives only as the quiet repeat-acquirer volume plan.
 *
 * The league→fee mapping is deliberately NOT committed to the client. In-app
 * billing still runs the locked subscription ladder (SMBX_PRICING_LOCKED.md)
 * until the flat-fee model is ratified — see that file's 2026-07-11 addendum.
 */
import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { MarketingShell, HeroDock, useShell } from '../MarketingShell';

function PriceShapeCard() {
  return (
    <div className="mk-ink-card" style={{ width: 'min(430px, 100%)' }}>
      <div className="mk-eyebrow-neon">One number, for your deal</div>
      <div className="row" style={{ marginTop: 14 }}><span>One fee covers</span><b>The whole deal</b></div>
      <div className="row"><span>Set</span><b>Before you start</b></div>
      <div className="row"><span>Two months or two years</span><b>Same price</b></div>
      <div className="row" style={{ borderBottom: 0 }}>
        <span>Percentage of your outcome</span>
        <span className="neon" style={{ fontWeight: 700 }}>Never</span>
      </div>
      <div style={{ marginTop: 8, paddingTop: 20, borderTop: '1px solid var(--mk-hair-2)', fontSize: 16.5, lineHeight: 1.55, color: 'var(--mk-w2)' }}>
        Most deals: <span style={{ color: 'var(--mk-neon)', fontWeight: 700 }}>a few thousand to the low tens of
        thousands</span>, start to close.
      </div>
      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6, color: 'var(--mk-w4)' }}>
        Your exact number comes from Yulia, right after your free Baseline — no grid to decode.
      </div>
    </div>
  );
}

function BankAnchorCard() {
  return (
    <div className="mk-glass" style={{ width: 'min(420px, 100%)', borderRadius: 22, padding: '30px 34px' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--mk-ink)' }}>
        The same process, through a bank
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: 'var(--mk-ink-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>Fee</span><b style={{ color: 'var(--mk-ink)' }}>5%–10% of the deal</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>Retainer</span><b style={{ color: 'var(--mk-ink)' }}>Monthly, on top</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
          <span>On a $5M sale</span>
          <b style={{ color: 'var(--mk-ink)', fontSize: 24, letterSpacing: '-0.02em' }}>$250K–$500K</b>
        </div>
      </div>
      <p style={{ margin: '18px 0 0', paddingTop: 16, borderTop: '1px solid rgba(15, 15, 14, 0.08)', fontSize: 14, lineHeight: 1.6, color: 'var(--mk-ink-3)' }}>
        Yulia runs the equivalent for <b style={{ color: 'var(--mk-green)' }}>a flat fee in the low five figures</b> —
        and you stay in the driver's seat. Keep the fee, keep control.
      </p>
    </div>
  );
}

function VolumePlan() {
  const { send } = useShell();
  return (
    <div className="mk-prose">
      <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>Running deals regularly?</h2>
      <p className="mk-body">
        If you're a PE firm, a family office, a search fund, or an advisor doing several deals
        a year, you don't want to pay deal by deal. There's a flat monthly plan for that —
        unlimited deals, your brand on the work, built for people who do this for a living.
        Tell Yulia you run deals regularly and she'll set it up.
      </p>
      <p className="mk-body">
        <b style={{ color: 'var(--mk-ink)' }}>Advisors and brokers:</b> your first three client deals are free. After
        that, the monthly plan covers everything you run, and your clients are never charged a
        success fee by smbX.
      </p>
      <button
        type="button"
        className="mk-chip"
        style={{ marginTop: 8, alignSelf: 'flex-start' }}
        onClick={() => send('I run deals regularly — set me up on the volume plan.')}
      >
        I run deals regularly
      </button>
    </div>
  );
}

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Really free to start?',
    a: "Yes. Talk to Yulia, get a real value range, no credit card. The federal data behind it is public by law; the synthesis takes seconds. We'd rather show you the work than sell you a trial.",
  },
  {
    q: 'How much will my deal cost to run?',
    a: 'One flat fee, sized to your deal — most land between a few thousand and the low tens of thousands, start to close. Yulia gives you your exact number right after your free Baseline, so you decide with the price in front of you.',
  },
  {
    q: "Why does a bigger deal cost more — isn't that a percentage?",
    a: "No. A bigger deal is genuinely more work, so its flat fee is higher. But it's a fixed number set before you start, and it does not move based on what your deal closes at. A $5M sale costs the same to run whether it closes at $4.8M or $5.5M. You're paying for the work, never a cut of the outcome — and that's the exact line that keeps us a tool, not a broker.",
  },
  {
    q: 'Why no success fee?',
    a: "Two reasons. We don't hold the licenses required to charge one — smbX is software, firmly on that side of the line. And more important: the moment we take a piece of your deal, we stop being your tool and become another party with an angle. We'd rather be the one team in your deal that has none.",
  },
  {
    q: 'What if my deal takes two years?',
    a: 'Then it takes two years. The fee is for the deal, not the time. Yulia stays with it — and with you afterward, into integration — at no extra charge.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: (
      <>
        ChatGPT knows about M&amp;A in general. Yulia knows <em>your</em> deal — your numbers, six
        federal data sources, a structured methodology, and a math engine that gets the numbers
        right every time. See{' '}
        <Link href="/how-it-works" style={{ color: 'var(--mk-green)', fontWeight: 600, textDecoration: 'none' }}>
          How it works
        </Link>{' '}
        for the full answer.
      </>
    ),
  },
  {
    q: 'Working with a broker or advisor?',
    a: "Good — bring them. A principal who shows up prepared makes their advisor's job easier and their fee more justified. And if your advisor wants to run their own practice on Yulia, their first three deals are free.",
  },
  {
    q: 'Can I take my data with me?',
    a: "Always. It's your deal.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mk-faq">
      {FAQ.map((item, i) => (
        <div className={`mk-faq-item${open === i ? ' open' : ''}`} key={item.q}>
          <button type="button" className="mk-faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <span className="pm">{open === i ? '–' : '+'}</span>
          </button>
          <div className="mk-faq-a"><p>{item.a}</p></div>
        </div>
      ))}
    </div>
  );
}

export default function Pricing() {
  return (
    <MarketingShell
      page="pricing"
      placeholder="Tell Yulia about your deal…"
      quickReplies={["What's free?", 'What would my deal cost?']}
    >
      <section className="mk-hero" style={{ paddingBottom: 10 }}>
        <div className="mk-wrap mk-center">
          <h1 className="mk-h1 mk-h1-sub" style={{ maxWidth: 900 }}>
            <span style={{ whiteSpace: 'nowrap' }}>One flat fee.</span>
            <br />
            <em>Your whole deal, start to close.</em>
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '44em' }}>
            No percentage of your deal. No success fee. No monthly bill for a tool you'll use
            once. Start free — and when you're ready, pay one flat fee to run the entire deal,
            valuation through close, however long it takes.
          </p>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center" style={{ gap: 30 }}>
          <h2 className="mk-h2">Start free. Pay when it's real.</h2>
          <div className="mk-price-cols">
            <div className="mk-glass" style={{ width: 'min(410px, 100%)', borderRadius: 22, padding: '32px 36px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                Start free
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--mk-ink-3)' }}>
                Unlimited conversation with Yulia and your <b style={{ color: 'var(--mk-ink)' }}>Baseline™</b> — a real
                value range on your business or your target — free, with just an email. No credit
                card, no time limit. You see exactly what Yulia can do before you pay for
                anything.
              </p>
            </div>
            <div className="mk-glass" style={{ width: 'min(410px, 100%)', borderRadius: 22, padding: '32px 36px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                Pay when it's real
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--mk-ink-3)' }}>
                When you decide to run the deal for real, Yulia quotes you one flat fee, right
                there in the conversation, sized to your deal. You pay once, and the whole
                journey unlocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow">
            <div className="copy" style={{ width: 'min(500px, 100%)' }}>
              <h2 className="mk-h2" style={{ fontSize: 'clamp(25px, 2.3vw, 32px)' }}>
                How the price works
              </h2>
              <p className="mk-body">
                One fee covers the whole deal — every document, every model, every stage from
                first valuation to signed close. Two months or two years, the price is the price.
              </p>
              <p className="mk-body">
                <b style={{ color: 'var(--mk-ink)' }}>Bigger deals cost more, because bigger deals are more work</b> —
                more analysis, more parties, more moving pieces. So the fee scales with the size
                of your deal. But it's always a flat number, set before you start, and it never
                changes based on what your deal actually closes at. You will never pay a
                percentage of your outcome.
              </p>
              <p className="mk-body">
                Most deals run somewhere from a few thousand dollars to the low tens of thousands
                to take all the way to close — a fraction of what the same process costs through
                a bank. Yulia gives you your exact number the moment she's sized your deal, right
                after your free Baseline. No grid to decode, no plan to second-guess — one
                number, for your deal.
              </p>
            </div>
            <div className="card">
              <PriceShapeCard />
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <VolumePlan />
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow">
            <div className="copy" style={{ width: 'min(500px, 100%)' }}>
              <h2 className="mk-h2" style={{ fontSize: 'clamp(25px, 2.3vw, 32px)' }}>
                What this replaces
              </h2>
              <p className="mk-body">
                An investment bank runs this same process for a percentage of the deal — commonly
                5% to 10% at the lower end of the market, often with a monthly retainer on top.
                On a $5M sale, that's $250,000 to $500,000 — and you hand over control of your
                own deal to get it.
              </p>
              <p className="mk-body">
                Yulia runs the equivalent process for a flat fee in the low five figures, and you
                stay in the driver's seat the whole way. That's the trade:{' '}
                <em style={{ fontWeight: 600 }}>keep the fee, keep control.</em>
              </p>
            </div>
            <div className="card">
              <BankAnchorCard />
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 20 }}>
        <div className="mk-wrap" style={{ maxWidth: 880 }}>
          <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)', marginBottom: 28 }}>
            Questions people actually ask
          </h2>
          <Faq />
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center">
          <h2 className="mk-h2" style={{ fontSize: 'clamp(28px, 2.6vw, 34px)' }}>Talk to Yulia.</h2>
          <p className="mk-body" style={{ marginTop: 18, maxWidth: '35em', color: 'var(--mk-ink-3)' }}>
            There's no "contact sales" here and no demo to sit through. The product is the demo.
            Describe your deal, get something real back, and decide from there.
          </p>
          <div style={{ marginTop: 36, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
