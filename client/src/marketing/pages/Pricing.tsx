/**
 * `/pricing` — hi-fi 4f layout, LOCKED numbers.
 *
 * The deck's subscription ladder ($79/$199/$499/$2,500) predates the
 * 2026-05-27 pricing lock; SMBX_PRICING_LOCKED.md wins: Solo $99 / Pro $249 /
 * Team $749 / Enterprise from $3,000 via lib/pricing. The deck's à la carte
 * column is omitted (the deck itself marks it removable) — reinstating
 * per-deliverable pricing is a product decision, not a design one.
 */
import { useState } from 'react';
import { MarketingShell, HeroDock, useShell } from '../MarketingShell';
import { tierPriceDollars } from '../../lib/pricing';

function SubscribeCard() {
  const { send } = useShell();
  return (
    <div className="mk-ink-card" style={{ width: 'min(620px, 100%)', borderRadius: 30, padding: 'clamp(30px, 3.4vw, 42px) clamp(30px, 3.6vw, 44px)' }}>
      <div className="mk-eyebrow-neon">Subscribe</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-w)', marginTop: 10 }}>
        For people who do this for a living
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.6, color: 'var(--mk-w3)' }}>
        Unlimited deliverables, one flat price. Every plan includes every capability — you pay
        for volume, seats, and enterprise infrastructure, never for the work Yulia does.
      </p>
      <div className="mk-sub-grid" style={{ marginTop: 26 }}>
        <div className="mk-sub-tier">
          <div className="name">Solo</div>
          <div className="price">{tierPriceDollars('solo')}<small>/mo</small></div>
          <div className="desc">One active deal · 1 seat</div>
        </div>
        <div className="mk-sub-tier is-popular">
          <div className="badge">MOST POPULAR</div>
          <div className="name">Pro</div>
          <div className="price">{tierPriceDollars('pro')}<small>/mo</small></div>
          <div className="desc">Repeat dealmakers · unlimited deals</div>
        </div>
        <div className="mk-sub-tier">
          <div className="name">Team</div>
          <div className="price">{tierPriceDollars('team')}<small>/mo</small></div>
          <div className="desc">Small firms · up to 5 seats · shared vault</div>
        </div>
        <div className="mk-sub-tier">
          <div className="name">Enterprise</div>
          <div className="price" style={{ fontSize: 22 }}>From {tierPriceDollars('enterprise')}<small>/mo</small></div>
          <div className="desc">SSO · single-tenant · API · Talk to Yulia</div>
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--mk-w4)' }}>
        White-label and post-close workflows included on every plan.{' '}
        <span style={{ color: 'var(--mk-neon)' }}>Advisors: your first three client deals are free.</span>
      </div>
      <button
        type="button"
        className="mk-chip"
        style={{ marginTop: 22 }}
        onClick={() => send('Which plan fits my deal?')}
      >
        Ask Yulia which plan fits
      </button>
    </div>
  );
}

const FAQ = [
  {
    q: 'Why does a CIM cost the same whether my deal is $1M or $15M?',
    a: "Because you're paying for the analysis, not a cut of your outcome. We will never price off the size of your deal — no percentages, no success fees, no contingent anything. That's a promise to you, and it's the same line that keeps us cleanly on the software side of the law.",
  },
  {
    q: 'Why no success fees?',
    a: "The moment we take a cut of your deal, we stop being your tool and start being another party with an interest in the outcome. We'd rather be the one team in your deal that has no angle.",
  },
  {
    q: 'Really free?',
    a: "Yes. No credit card, no catch. We'd rather earn your trust with a real deliverable than talk you into a trial. And your data is always yours to take with you.",
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
      quickReplies={["What's free?", 'What plan fits my deal?']}
    >
      <section className="mk-hero" style={{ paddingBottom: 10 }}>
        <div className="mk-wrap mk-center">
          <h1 className="mk-h1 mk-h1-sub" style={{ maxWidth: 900 }}>
            <span style={{ whiteSpace: 'nowrap' }}>Pay for the analysis.</span>
            <br />
            <em>Not the AI.</em>
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '42em' }}>
            Every price reflects what this work costs from a human team — and what it saves you
            in a real transaction. Start free. Upgrade when the work has already proven itself.
          </p>
          <div className="mk-glass-pill" style={{ marginTop: 28 }}>
            Free forever: unlimited conversation + one full deliverable —&nbsp;<em>just an email, no credit card</em>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-price-cols">
            <SubscribeCard />
            <div className="mk-glass" style={{ width: 'min(420px, 100%)', borderRadius: 22, padding: '26px 30px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--mk-ink)' }}>
                What this would cost the old-fashioned way
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.65, color: 'var(--mk-ink-3)' }}>
                A quality-of-earnings analysis from a firm:{' '}
                <b style={{ color: 'var(--mk-ink)' }}>$20,000–$30,000</b>. A CIM from a boutique: weeks of an analyst's
                time. A full sell-side engagement: six figures. Software should be priced like
                infrastructure, not like a percentage of your outcome.
              </p>
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
