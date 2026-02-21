import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const HOW_STEPS = [
  {
    num: '01',
    title: 'Sign up free',
    description: 'Your first steps are on us. Explore valuation basics at no cost.',
  },
  {
    num: '02',
    title: 'Top up your wallet',
    description: 'Add funds via Stripe. Bonuses on larger amounts.',
  },
  {
    num: '03',
    title: 'Unlock deliverables',
    description: 'Pay per gate as you advance. Small steps, not big leaps.',
  },
];

const WALLET_BLOCKS = [
  { name: 'Starter', price: 50, bonus: 0, total: 50, discount: '0%' },
  { name: 'Builder', price: 100, bonus: 5, total: 105, discount: '5%', popular: true },
  { name: 'Momentum', price: 250, bonus: 25, total: 275, discount: '10%' },
  { name: 'Accelerator', price: 500, bonus: 75, total: 575, discount: '15%' },
  { name: 'Professional', price: 1_000, bonus: 200, total: 1_200, discount: '20%' },
  { name: 'Scale', price: 2_500, bonus: 625, total: 3_125, discount: '25%' },
  { name: 'Enterprise Lite', price: 5_000, bonus: 1_500, total: 6_500, discount: '30%' },
  { name: 'Enterprise', price: 10_000, bonus: 3_000, total: 13_000, discount: '30%' },
  { name: 'Enterprise Plus', price: 25_000, bonus: 7_500, total: 32_500, discount: '30%' },
  { name: 'Institutional', price: 50_000, bonus: 15_000, total: 65_000, discount: '30%' },
];

const TIERS = [
  { label: 'Free', range: '$0', items: 'Business intake, basic financials review' },
  { label: 'Analyst', range: 'From $5', items: 'Quick valuations, market snapshots' },
  { label: 'Associate', range: 'From $25', items: 'Full CIM drafts, buyer lists, financial models' },
  { label: 'VP', range: 'From $100', items: 'Deep research, full due diligence suites' },
];

const LEAGUES = [
  { league: 'L1', size: '< $500K', multiplier: '1.0\u00d7' },
  { league: 'L2', size: '$500K \u2013 $1M', multiplier: '1.25\u00d7' },
  { league: 'L3', size: '$1M \u2013 $5M', multiplier: '2.0\u00d7' },
  { league: 'L4', size: '$5M \u2013 $10M', multiplier: '3.5\u00d7' },
  { league: 'L5', size: '$10M \u2013 $50M', multiplier: '6.0\u00d7' },
  { league: 'L6', size: '$50M+', multiplier: '10.0\u00d7' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export default function Pricing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl text-text-primary mb-4 font-medium leading-tight"
            style={SERIF}
          >
            Pay as you go. No subscriptions.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto">
            Top up your wallet, spend on what you need. $1 in = $1 of purchasing power.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-10 font-medium"
            style={SERIF}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_STEPS.map(step => (
              <div key={step.num} className="text-center md:text-left">
                <span className="text-base font-semibold text-terra">{step.num}</span>
                <h3
                  className="text-xl md:text-2xl text-text-primary mt-2 mb-2 font-medium"
                  style={SERIF}
                >
                  {step.title}
                </h3>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed m-0">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet top-up blocks */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-4 font-medium"
            style={SERIF}
          >
            Wallet top-ups
          </h2>
          <p className="text-lg md:text-xl text-text-secondary text-center mb-10 max-w-xl mx-auto">
            Buy once, use anytime. Larger blocks include bonus credits. Your credits never expire.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {WALLET_BLOCKS.map(block => (
              <div
                key={block.name}
                className={`rounded-2xl border p-5 flex flex-col ${
                  block.popular
                    ? 'border-terra bg-cream shadow-md'
                    : 'border-border bg-white'
                }`}
              >
                {block.popular && (
                  <span className="text-sm font-semibold text-terra uppercase tracking-wide mb-1">
                    Most Popular
                  </span>
                )}
                <p className="text-base text-text-secondary m-0 mb-1">{block.name}</p>
                <p
                  className="text-2xl text-text-primary m-0 font-medium"
                  style={SERIF}
                >
                  ${fmt(block.price)}
                </p>
                {block.bonus > 0 ? (
                  <p className="text-base text-terra m-0 mt-1">
                    +${fmt(block.bonus)} bonus ({block.discount})
                  </p>
                ) : (
                  <p className="text-base text-text-secondary m-0 mt-1">No minimum</p>
                )}
                <p className="text-sm text-text-secondary m-0 mt-2">
                  ${fmt(block.total)} purchasing power
                </p>
                <Link
                  href="/signup"
                  className="mt-auto pt-4 text-base text-terra font-medium no-underline hover:text-terra-hover transition-colors"
                >
                  Top up &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get at each stage */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-10 font-medium"
            style={SERIF}
          >
            What your credits buy
          </h2>
          <div className="space-y-4">
            {TIERS.map(tier => (
              <div
                key={tier.label}
                className="flex items-start gap-4 bg-white rounded-2xl border border-border p-5"
              >
                <span
                  className="text-xl text-terra font-medium whitespace-nowrap min-w-[90px]"
                  style={SERIF}
                >
                  {tier.range}
                </span>
                <div>
                  <p className="text-base font-semibold text-text-primary m-0">{tier.label}</p>
                  <p className="text-base md:text-lg text-text-secondary m-0 mt-1">{tier.items}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* League multipliers */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-4 font-medium"
            style={SERIF}
          >
            Pricing scales with deal size
          </h2>
          <p className="text-lg md:text-xl text-text-secondary text-center mb-10 max-w-xl mx-auto">
            Your deal size determines your league. Larger deals require deeper analysis, so prices scale proportionally.
          </p>
          <div className="bg-cream rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 text-base font-semibold text-text-primary border-b border-border px-6 py-3">
              <span>League</span>
              <span>Deal Size</span>
              <span className="text-right">Multiplier</span>
            </div>
            {LEAGUES.map(l => (
              <div
                key={l.league}
                className="grid grid-cols-3 text-base text-text-secondary border-b border-border last:border-0 px-6 py-3"
              >
                <span className="font-medium text-text-primary">{l.league}</span>
                <span>{l.size}</span>
                <span className="text-right font-medium text-terra">{l.multiplier}</span>
              </div>
            ))}
          </div>
          <p className="text-base text-text-secondary text-center mt-6">
            A $25 deliverable at L1 costs $25. At L3 it costs $50.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl text-text-primary mb-4 font-medium"
            style={SERIF}
          >
            Ready to start?
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-8">
            Your first conversation is free. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Get started free &rarr;
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
