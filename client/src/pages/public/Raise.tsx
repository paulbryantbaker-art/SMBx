import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const STEPS = [
  { num: 'R0', title: 'Intake', description: 'Tell Yulia about your business, what you are raising, and where you stand today.', free: true },
  { num: 'R1', title: 'Financial Package', description: 'Yulia structures your financials — revenue model, projections, and unit economics — into an investor-ready format.', free: true },
  { num: 'R2', title: 'Investor Materials', description: 'Pitch deck, executive summary, and supporting documents built and refined for your target audience.', free: false },
  { num: 'R3', title: 'Outreach', description: 'A curated investor list with outreach strategy. Yulia helps you manage introductions and track conversations.', free: false },
  { num: 'R4', title: 'Terms', description: 'Review and compare term sheets. Yulia breaks down what each provision means for your ownership.', free: false },
  { num: 'R5', title: 'Closing', description: 'Final document coordination, condition tracking, and timeline management through wire and signing.', free: false },
];

export default function Raise() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl text-text-primary mb-4 font-medium leading-tight"
            style={SERIF}
          >
            Raise capital on your terms
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
            Build your pitch, find investors, close the round.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-3 md:px-10 md:py-4 bg-terra text-white text-base md:text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Start raising &rarr;
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
