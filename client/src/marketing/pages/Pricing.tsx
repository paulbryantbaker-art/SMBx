/**
 * `/pricing` — wireframe 5g layout, LOCKED numbers.
 *
 * The wireframe flagged the pricing model "unresolved" — the repo resolved it
 * on 2026-05-27 (SMBX_PRICING_LOCKED.md): monthly subscriptions only, no
 * wallet, no per-deal fees, nothing tied to deal value or outcome. The tier
 * placeholders are filled from lib/pricing (single source of truth).
 *
 * The deal-size slider recomputes the BROKER's Double-Lehman fee — the anchor.
 * Our price never moves with deal size; that contrast is the whole point.
 */
import { useState } from 'react';
import { MarketingShell, HeroDock, useShell } from '../MarketingShell';
import { PRICING_TIERS, tierPriceDollars } from '../../lib/pricing';

/** Double Lehman: 10% of the 1st $1M, 8% of the 2nd, 6% of the 3rd,
 *  4% of the 4th, 2% of everything above. */
function doubleLehman(dealDollars: number): number {
  const bands = [0.10, 0.08, 0.06, 0.04];
  let fee = 0;
  let left = dealDollars;
  for (const rate of bands) {
    const slice = Math.min(left, 1_000_000);
    fee += slice * rate;
    left -= slice;
    if (left <= 0) return fee;
  }
  return fee + left * 0.02;
}

const fmtDeal = (d: number) => (d >= 1_000_000 ? `$${(d / 1_000_000).toFixed(1)}M` : `$${Math.round(d / 1000)}K`);
const fmtFee = (f: number) => (f >= 1_000_000 ? `$${(f / 1_000_000).toFixed(2)}M` : `$${Math.round(f / 1000)}K`);

const TIER_FEATURES: Record<string, string[]> = {
  free: ['Unlimited conversation with Yulia', 'One deliverable, free — The Baseline™', 'No card required'],
  solo: ['Unlimited valuation, scoring, SDE/EBITDA', 'Financing + structuring models', 'PDF / Excel / Word export', 'One supervised agent key'],
  pro: ['CIM and pitch-book generation', 'Deal rooms and market discovery', 'Diligence and LOI scaffolds', 'Three supervised agent keys'],
  team: ['Shared deal vault, firm templates', 'Up to 5 seats', 'Specialist handoff coordination'],
};

function AnchorSlider() {
  const [deal, setDeal] = useState(2_000_000);
  const fee = doubleLehman(deal);
  return (
    <div className="mk-center" style={{ gap: 14 }}>
      <h1 className="mk-h1" style={{ maxWidth: '20ch', fontSize: 'clamp(26px, 3.6vw, 40px)' }}>
        On a <em>{fmtDeal(deal)}</em> sale, a broker takes <s>~{fmtFee(fee)}</s>.<br />
        Yulia takes no cut. Ever.
      </h1>
      <div className="mk-slider-wrap">
        <input
          type="range"
          className="mk-slider"
          min={300_000}
          max={25_000_000}
          step={100_000}
          value={deal}
          onChange={e => setDeal(Number(e.target.value))}
          aria-label="Deal size"
        />
        <span className="mk-note">
          drag the deal size — the broker's fee (Double Lehman) recomputes; our price doesn't move
        </span>
      </div>
    </div>
  );
}

function Tiers() {
  const { send } = useShell();
  const ask = (q: string) => () => send(q);
  return (
    <>
      <div className="mk-tiers">
        {(['free', 'solo', 'pro', 'team'] as const).map(id => {
          const t = PRICING_TIERS[id];
          const featured = id === 'pro';
          return (
            <div className={`mk-card mk-tier${featured ? ' is-featured' : ''}`} key={id}>
              <span className="t-name">{t.name}{featured && <em> · recommended</em>}</span>
              <span className="t-price">
                {tierPriceDollars(id)}
                {id !== 'free' && <small> / month</small>}
              </span>
              <ul>
                {TIER_FEATURES[id].map(f => <li key={f}>{f}</li>)}
              </ul>
              <button type="button" className="mk-chip" onClick={ask(`What does the ${t.name} plan include for my deal?`)}>
                Ask Yulia
              </button>
            </div>
          );
        })}
      </div>
      <div className="mk-ent-strip">
        <div>
          <span className="mk-seclabel">Enterprise · from {tierPriceDollars('enterprise')} / month</span>
          <p>Single-tenant, SSO, API controls, portfolio infrastructure, governed autonomous agent scope.</p>
        </div>
        <button type="button" className="mk-chip" onClick={ask('Tell me about the Enterprise plan.')}>
          Talk to Yulia about Enterprise
        </button>
      </div>
    </>
  );
}

const FAQ = [
  {
    q: 'Why no success fees?',
    a: 'Because the moment a fee scales with your deal, the software has a stake in your outcome. smbX.ai is software: flat monthly pricing, no percentage of deal value, no fee contingent on closing, no referral fees. Ever.',
  },
  {
    q: "What's free?",
    a: 'Unlimited conversation with Yulia, and your first deliverable — The Baseline™ — free. No card required.',
  },
  {
    q: 'When do I pay?',
    a: 'When you want unlimited deliverables and the deeper deal work — subscriptions start at $99/month and cancel anytime.',
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
        <div className="mk-wrap">
          <AnchorSlider />
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <Tiers />
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 6 }}>
        <div className="mk-wrap" style={{ maxWidth: 720 }}>
          <Faq />
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap mk-center">
          <div style={{ width: 'min(520px, 100%)' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
