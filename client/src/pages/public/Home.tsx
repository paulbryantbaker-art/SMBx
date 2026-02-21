import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const JOURNEYS = [
  {
    title: 'Sell Your Business',
    description: 'Get a valuation, prepare your financials, find qualified buyers, and close the deal.',
    href: '/sell',
  },
  {
    title: 'Buy a Business',
    description: 'Define your acquisition thesis, source targets, run diligence, and structure the deal.',
    href: '/buy',
  },
  {
    title: 'Raise Capital',
    description: 'Build investor materials, model your cap table, and manage the outreach process.',
    href: '/raise',
  },
];

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl text-text-primary mb-4 font-medium leading-tight"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Sell a business. Buy a business. Raise capital.
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
            Your M&amp;A advisor, on demand.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-terra text-white text-base font-medium rounded-lg hover:bg-terra-hover no-underline transition-colors"
          >
            Get started free &rarr;
          </Link>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {JOURNEYS.map(j => (
            <Link
              key={j.href}
              href={j.href}
              className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md no-underline transition-shadow group"
            >
              <h3
                className="text-lg text-text-primary mb-2 font-medium group-hover:text-terra transition-colors"
                style={{ fontFamily: 'ui-serif, Georgia, serif' }}
              >
                {j.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed m-0">
                {j.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
