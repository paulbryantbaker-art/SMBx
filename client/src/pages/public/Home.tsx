import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const JOURNEYS = [
  {
    title: 'Sell your business',
    description: 'Know what your business is worth.',
    href: '/sell',
    cta: 'Start free \u2192',
  },
  {
    title: 'Buy a business',
    description: 'Find your perfect acquisition.',
    href: '/buy',
    cta: 'Start free \u2192',
  },
  {
    title: 'Raise capital',
    description: 'Raise capital without losing control.',
    href: '/raise',
    cta: 'Start free \u2192',
  },
  {
    title: 'Post-acquisition',
    description: 'You just acquired a business. Now what?',
    href: '/integrate',
    cta: 'Start free \u2192',
  },
];

const HOW_IT_WORKS = [
  {
    title: 'Start a conversation',
    badge: 'FREE',
    description:
      'Tell Yulia about your business. She asks the right questions, organizes your financials, and identifies what matters. No cost, no commitment.',
  },
  {
    title: 'Get deliverables',
    badge: 'FROM $15',
    description:
      'Valuations, CIMs, buyer lists, financial models \u2014 the same work product a $50,000 advisor produces. Each deliverable has a clear price.',
  },
  {
    title: 'Close your deal',
    badge: null,
    description:
      'Yulia guides you through every stage. LOI review, deal structuring, closing checklists. From first conversation to signed documents.',
  },
];

export default function Home() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-3xl md:text-5xl text-text-primary mb-4 font-medium leading-tight"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Sell a business. Buy a business. Raise capital.
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-lg mx-auto">
            Professional M&amp;A advisory that used to cost $50K. Start free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center mt-8 px-8 py-4 bg-terra text-white text-base font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Get started free &rarr;
          </Link>
        </div>
      </section>

      {/* JOURNEY CARDS */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {JOURNEYS.map(j => (
            <Link
              key={j.href}
              href={j.href}
              className="bg-white rounded-2xl border border-border p-6 no-underline transition-shadow hover:shadow-md group"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}
            >
              <h3
                className="text-xl text-text-primary mb-2 font-medium group-hover:text-terra transition-colors"
                style={{ fontFamily: 'ui-serif, Georgia, serif' }}
              >
                {j.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {j.description}
              </p>
              <span className="text-sm text-terra font-medium">
                {j.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl text-text-primary text-center mb-16 font-medium"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            How it works
          </h2>
          <div className="space-y-12">
            {HOW_IT_WORKS.map(step => (
              <div key={step.title}>
                <div className="flex items-center gap-3 mb-3">
                  <h3
                    className="text-xl text-text-primary font-medium m-0"
                    style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                  >
                    {step.title}
                  </h3>
                  {step.badge && (
                    <span className="text-xs text-text-secondary bg-sidebar px-2 py-0.5 rounded-full whitespace-nowrap">
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-base text-text-secondary leading-relaxed m-0">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDIBILITY */}
      <section className="px-6 py-20">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="text-2xl text-text-primary mb-10 font-medium"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Built on institutional methodology
          </h2>
          <p className="text-base text-text-secondary leading-relaxed mb-6">
            80+ industry verticals with current market multiples.
          </p>
          <p className="text-base text-text-secondary leading-relaxed mb-6">
            Every number verified. Every calculation shown.
          </p>
          <p className="text-base text-text-secondary leading-relaxed m-0">
            Adapted to your deal size and complexity.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-20 bg-sidebar">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl md:text-3xl text-text-primary mb-4 font-medium"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Start free. Pay when you see value.
          </h2>
          <p className="text-base text-text-secondary mb-8">
            Your first financial analysis is free. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-terra text-white text-base font-medium rounded-xl hover:bg-terra-hover no-underline transition-colors"
          >
            Get started free &rarr;
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
