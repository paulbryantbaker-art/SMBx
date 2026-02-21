import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const STEPS = [
  { num: 'B0', title: 'Thesis', description: 'Define what you are looking for — industry, size, geography, margins, and deal structure.', free: true },
  { num: 'B1', title: 'Sourcing', description: 'Yulia identifies and ranks potential targets that match your thesis, with key financials for each.', free: true },
  { num: 'B2', title: 'Valuation', description: 'Independent valuation of your target using multiple methods so you know what to offer.', free: false },
  { num: 'B3', title: 'Due Diligence', description: 'Structured diligence checklist and findings report covering financials, legal, operations, and risks.', free: false },
  { num: 'B4', title: 'Structuring', description: 'Offer modeling with scenario analysis — asset vs. stock, seller financing, earnouts, SBA terms.', free: false },
  { num: 'B5', title: 'Closing', description: 'Purchase agreement review, closing checklists, and transition planning through to a funded deal.', free: false },
];

export default function Buy() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl text-text-primary mb-4 font-medium leading-tight"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Find and acquire the right business
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
            Define your thesis, source targets, close the deal.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-terra text-white text-base font-medium rounded-lg hover:bg-terra-hover no-underline transition-colors"
          >
            Start your search &rarr;
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div
              key={step.num}
              className="bg-white rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-terra">{step.num}</span>
                {step.free && (
                  <span className="text-xs font-medium text-terra bg-terra/10 px-2 py-0.5 rounded">
                    Free
                  </span>
                )}
              </div>
              <h3
                className="text-lg text-text-primary mb-2 font-medium"
                style={{ fontFamily: 'ui-serif, Georgia, serif' }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed m-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
