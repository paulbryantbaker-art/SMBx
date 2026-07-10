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
import { Faq } from '../Faq';
import { doubleLehmanCents, fmtAnchorCents } from '../feeAnchor';

const TIER_FEATURES: Record<string, string[]> = {
  free: ['Unlimited conversation with Yulia', 'One deliverable, free — The Baseline™', 'No card required'],
  solo: ['Unlimited valuation, scoring, SDE/EBITDA', 'Financing + structuring models', 'PDF / Excel / Word export', 'One supervised agent key'],
  pro: ['CIM and pitch-book generation', 'Deal rooms and market discovery', 'Diligence and LOI scaffolds', 'Three supervised agent keys'],
  team: ['Shared deal vault, firm templates', 'Up to 5 seats', 'Specialist handoff coordination'],
};

function AnchorSlider() {
  // Integer cents throughout (money law); $300K–$25M in $100K steps.
  const [dealCents, setDealCents] = useState(200_000_000);
  const feeCents = doubleLehmanCents(dealCents);
  return (
    <div className="mk-center" style={{ gap: 14 }}>
      <h1 className="mk-h1" style={{ maxWidth: '20ch', fontSize: 'clamp(26px, 3.6vw, 40px)' }}>
        On a <em>{fmtAnchorCents(dealCents)}</em> sale, a broker takes <s>~{fmtAnchorCents(feeCents)}</s>.<br />
        Yulia takes no cut. Ever.
      </h1>
      <div className="mk-slider-wrap">
        <input
          type="range"
          className="mk-slider"
          min={30_000_000}
          max={2_500_000_000}
          step={10_000_000}
          value={dealCents}
          onChange={e => setDealCents(Number(e.target.value))}
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
    a: `When you want unlimited deliverables and the deeper deal work — subscriptions start at ${tierPriceDollars('solo')}/month and cancel anytime.`,
  },
];

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
          <Faq items={FAQ} defaultOpen={0} />
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap mk-center">
          <div className="mk-dock-narrow">
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
