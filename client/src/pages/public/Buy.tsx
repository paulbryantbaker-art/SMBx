import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const STAGES = [
  {
    title: 'Thesis Development',
    badge: 'FREE',
    description:
      'Define your acquisition criteria — industry, geography, deal size, return targets. Yulia helps you build a focused investment thesis, not a wish list.',
  },
  {
    title: 'Target Sourcing',
    badge: 'FREE',
    description:
      'Yulia identifies businesses that match your criteria. Active listings, off-market opportunities, and industries where sellers are motivated.',
  },
  {
    title: 'Target Valuation',
    badge: 'FROM $15',
    description:
      "Before you make an offer, know what the business is actually worth. Industry-specific multiples, DSCR analysis, and a clear picture of what you're buying.",
  },
  {
    title: 'Due Diligence',
    badge: null,
    description:
      "Systematic review of financials, operations, legal, and customers. Yulia flags the risks you'd miss and builds the QoE analysis that protects your investment.",
  },
  {
    title: 'Deal Structuring',
    badge: null,
    description:
      'SBA modeling, seller financing scenarios, earnout structures. Yulia builds the sources and uses that make the deal work for both sides.',
  },
  {
    title: 'Closing',
    badge: null,
    description:
      'LOI drafting, purchase agreement review, closing prorations, and funds flow. Every dollar accounted for, down to the penny.',
  },
];

const BUYER_TYPES = [
  {
    title: 'First-time buyers',
    description:
      'Buying your first business is overwhelming. Yulia walks you through everything — what to look for, how to value it, how to finance it, what questions to ask.',
  },
  {
    title: 'Search fund operators',
    description:
      'You have a thesis and a timeline. Yulia helps you source efficiently, model returns quickly, and build the materials your investors need to see.',
  },
  {
    title: 'Portfolio builders',
    description:
      'Acquiring your second, third, or tenth business? Yulia understands roll-up economics, platform vs. tuck-in dynamics, and EBITDA arbitrage at scale.',
  },
];

export default function Buy() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl text-text-primary mb-4 font-medium leading-tight"
            style={SERIF}
          >
            Find and acquire the right business.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto mb-10">
            Define your thesis, source targets, model the returns, and close
            the deal &mdash; with an advisor that understands what you&apos;re
            building.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start your search free &rarr;
          </Link>
        </div>
      </section>

      {/* THE REALITY */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl text-text-primary mb-8 font-medium"
            style={SERIF}
          >
            Buying a business should be strategic. Usually it&apos;s chaos.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
            You&apos;re scanning BizBuySell, guessing at valuations, building
            spreadsheets from scratch, and hoping your offer is in the right
            range. If you&apos;re lucky, you find a broker who returns your
            calls. If you&apos;re not, you overpay &mdash; or worse, buy the
            wrong business entirely.
          </p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
            Yulia gives you an institutional-quality acquisition process at any
            deal size. She helps you define what you&apos;re looking for,
            evaluates opportunities against your thesis, and builds the
            financial models that tell you whether a deal actually works.
          </p>
        </div>
      </section>

      {/* THE JOURNEY */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-12 font-medium"
            style={SERIF}
          >
            From investment thesis to keys in hand.
          </h2>
          <div className="space-y-8">
            {STAGES.map(stage => (
              <div
                key={stage.title}
                className="bg-white rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3
                    className="text-xl md:text-2xl text-text-primary font-medium m-0"
                    style={SERIF}
                  >
                    {stage.title}
                  </h3>
                  {stage.badge && (
                    <span className="text-sm text-text-secondary bg-[#F0EDE6] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {stage.badge}
                    </span>
                  )}
                </div>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUYER TYPES */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-12 font-medium"
            style={SERIF}
          >
            Built for every kind of buyer.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {BUYER_TYPES.map(item => (
              <div key={item.title}>
                <h3
                  className="text-xl md:text-2xl text-text-primary mb-2 font-medium"
                  style={SERIF}
                >
                  {item.title}
                </h3>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed m-0">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-20 bg-[#F0EDE6]">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl text-text-primary mb-4 font-medium"
            style={SERIF}
          >
            Define your thesis. Find your deal.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-10">
            Start free. No commitment. Yulia helps you build your acquisition
            strategy in your first conversation.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start your search &rarr;
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
