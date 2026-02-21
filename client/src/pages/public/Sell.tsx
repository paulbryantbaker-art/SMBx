import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const STAGES = [
  {
    title: 'Intake',
    badge: 'FREE',
    description:
      'Tell Yulia about your business — industry, location, revenue, what makes it special. She classifies your deal and maps the path ahead.',
  },
  {
    title: 'Financial Analysis',
    badge: 'FREE',
    description:
      'Yulia organizes your financials, identifies add-backs, and calculates SDE or EBITDA. Every number verified against your documents.',
  },
  {
    title: 'Valuation',
    badge: 'FROM $15',
    description:
      'A defensible valuation built on real market comps, industry multiples, and your specific financial profile. Not a generic calculator.',
  },
  {
    title: 'Packaging',
    badge: null,
    description:
      'Professional CIM, blind profile, and marketing materials that position your business for maximum value.',
  },
  {
    title: 'Market Matching',
    badge: null,
    description:
      'Qualified buyer lists based on your industry, geography, and deal size. Strategic buyers, PE firms, independent operators — whoever fits.',
  },
  {
    title: 'Closing',
    badge: null,
    description:
      'Deal structuring, LOI review, due diligence coordination, and closing support through the wire transfer.',
  },
];

const DELIVERABLES = [
  {
    title: 'Valuation Report',
    description:
      'Industry-specific multiples, verified financials, defensible methodology.',
  },
  {
    title: 'Confidential Information Memorandum',
    description:
      "A professional CIM that tells your business's story to qualified buyers.",
  },
  {
    title: 'Qualified Buyer List',
    description:
      'Targeted buyers actively acquiring in your industry and geography.',
  },
];

export default function Sell() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl text-text-primary mb-4 font-medium leading-tight"
            style={SERIF}
          >
            Sell your business with confidence.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto mb-10">
            From your first question about valuation to the wire transfer at
            closing &mdash; Yulia guides you through every step.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-3 md:px-10 md:py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start your exit free &rarr;
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
            Selling a business is the biggest financial decision most owners
            ever make.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
            And most go in blind. They don&apos;t know what their business is
            worth. They don&apos;t know who&apos;s buying in their industry.
            They don&apos;t know what due diligence looks like from the other
            side. Traditional advisors can help &mdash; if you can afford $50K
            upfront and your deal is big enough for them to care.
          </p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
            Yulia changes that. She&apos;s an expert M&amp;A advisor that works
            at your pace, at your deal size, for a fraction of the cost.
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
            Your path from &lsquo;what&apos;s it worth?&rsquo; to &lsquo;deal
            closed.&rsquo;
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

      {/* WHAT YOU GET */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl md:text-4xl text-text-primary text-center mb-12 font-medium"
            style={SERIF}
          >
            Real deliverables. Not templates.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {DELIVERABLES.map(item => (
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
            Your first two stages are free.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-10">
            No credit card. No commitment. Start a conversation and see your
            financials organized in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-3 md:px-10 md:py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start your exit &rarr;
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
