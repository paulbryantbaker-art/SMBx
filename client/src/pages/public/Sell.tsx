import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const STEPS = [
  { num: 'S0', title: 'Intake', description: 'Tell Yulia about your business — industry, revenue, team size, and why you are considering a sale.', free: true },
  { num: 'S1', title: 'Financials', description: 'Upload your financials. Yulia organizes them, identifies add-backs, and flags anything a buyer will question.', free: true },
  { num: 'S2', title: 'Valuation', description: 'Full valuation using DCF, comparable transactions, and industry multiples — delivered as a written report.', free: false },
  { num: 'S3', title: 'Packaging', description: 'Your CIM, financial package, and teaser — everything a buyer needs to evaluate your business.', free: false },
  { num: 'S4', title: 'Matching', description: 'A curated list of qualified buyers ranked by fit, financing capacity, and acquisition history.', free: false },
  { num: 'S5', title: 'Closing', description: 'LOI negotiation, purchase agreement review, and closing checklists through to a signed deal.', free: false },
];

export default function Sell() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl text-text-primary mb-4 font-medium leading-tight"
            style={SERIF}
          >
            Sell your business with confidence
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
            From valuation to closing, guided every step.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start your exit &rarr;
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
                <span className="text-base font-semibold text-terra">{step.num}</span>
                {step.free && (
                  <span className="text-sm font-medium text-terra bg-terra/10 px-2 py-0.5 rounded">
                    Free
                  </span>
                )}
              </div>
              <h3
                className="text-xl md:text-2xl text-text-primary mb-2 font-medium"
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
      </section>
    </PublicLayout>
  );
}
