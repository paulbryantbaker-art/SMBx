import { ScrollReveal } from './animations';

const PHASES = [
  {
    num: '01',
    phase: 'Stabilize',
    period: 'Day 1–30',
    filled: true,
    body: "Day Zero: passwords, bank accounts, insurance, physical access — forty items most new owners forget. Meet every employee individually. Call the top twenty customers. Secure every vendor relationship. And the hardest discipline of all for a new owner: change nothing. The business works. Learn why before you change how.",
  },
  {
    num: '02',
    phase: 'Optimize',
    period: 'Day 30–90',
    filled: false,
    body: "Now you've learned it from the inside. Capture the quick wins your DD identified. Install financial controls — many acquired businesses have surprisingly loose cash management. Fix the operational gaps. Start measuring the KPIs that actually matter for your thesis.",
  },
  {
    num: '03',
    phase: 'Grow',
    period: 'Day 90–180',
    filled: false,
    body: "Execute the value creation plan. Track monthly: revenue vs. model, EBITDA vs. model, customer retention, employee retention. The scorecard that tells you whether reality is matching what you underwrote — and what to adjust when it isn't.",
  },
];

export default function IntegrateBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A18] selection:bg-[#BA3C60] selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <ScrollReveal>
            <span className="font-sans uppercase tracking-[0.3em] text-xs font-semibold text-[#BA3C60] mb-8 block">
              Post-Close Intelligence
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-[48px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-[#1A1A18] max-w-4xl mb-12">
              The deal doesn&apos;t end at close
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-[#6B6B65] max-w-2xl leading-relaxed">
              70% of acquisitions fail to deliver the returns that justified the price. Not because the thesis was wrong. Because the execution was unstructured.
            </p>
          </ScrollReveal>
        </div>
        <div className="absolute -right-20 top-40 w-96 h-96 bg-[#BA3C60]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2. THE 70% PROBLEM ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-5">
            <ScrollReveal>
              <span className="font-sans uppercase tracking-[0.3em] text-xs font-semibold text-[#6B6B65] mb-6 block">
                The Integration Gap
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] mb-8">
                The intensity of the deal creates a natural letdown the day after close
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20">
                <span className="font-mono text-5xl font-bold text-[#BA3C60] block mb-2">70%</span>
                <span className="font-sans uppercase tracking-widest text-xs font-bold text-[#6B6B65]">Acquisition Failure Rate</span>
              </div>
            </ScrollReveal>
          </div>
          <div className="md:col-span-7 space-y-6">
            <ScrollReveal delay={0.1}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">
                I&apos;ve seen it happen the same way every time. Months of evaluation, negotiation, diligence, financing, legal work — it creates its own gravity. And then it&apos;s done.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.14}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">
                The DD findings that should be driving every decision for the next six months are scattered across email threads and shared folders. The financial model that justified the purchase price is a spreadsheet on someone&apos;s laptop.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <p className="text-lg text-[#1A1A18] leading-relaxed font-medium">
                Nobody has a plan for Monday morning.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.22}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">
                The employees are watching. Some are updating their resumes. The customers haven&apos;t been told. The vendors are wondering if terms change under new ownership. And the new owner is improvising.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. 180-DAY PLAN — Dark Timeline ═══ */}
      <section className="py-32 bg-[#1c1917] text-stone-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mb-24">
            <ScrollReveal>
              <span className="font-sans uppercase tracking-[0.3em] text-xs font-semibold text-[#BA3C60] mb-6 block">
                The 180-Day Plan
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h2 className="font-headline italic text-5xl md:text-6xl leading-tight mb-8 text-white">
                Your plan, built from your deal
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-xl text-stone-400 leading-relaxed">
                When your deal closes on smbX.ai, Yulia doesn&apos;t stop. She carries forward everything — DD findings, risk flags, financial model, operational gaps, customer data — and builds a 180-day plan specific to this business, this deal, these findings.
              </p>
            </ScrollReveal>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {PHASES.map((step, i) => (
              <ScrollReveal key={step.phase} delay={i * 0.08}>
                <div className="space-y-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-mono text-xl font-bold ${
                    step.filled ? 'bg-[#BA3C60] text-white' : 'border border-stone-700 text-stone-400'
                  }`}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-headline italic text-3xl mb-4 text-white">
                      {step.phase.toUpperCase()}{' '}
                      <span className="text-stone-500 text-lg block not-italic font-mono mt-1">({step.period})</span>
                    </h3>
                    <p className="text-stone-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <div className="mt-24 pt-12 border-t border-stone-800 text-center">
              <p className="font-headline italic text-2xl text-stone-500">
                Not a template downloaded from a blog. <span className="text-stone-300">Your plan, built from your deal.</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 4. CLOSING EDITORIAL ═══ */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1">
            <ScrollReveal>
              <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] mb-10">
                The first Monday after close doesn&apos;t have to be terrifying.
              </h2>
            </ScrollReveal>
            <div className="space-y-8 max-w-xl">
              <ScrollReveal delay={0.08}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">
                  If you did the work, that Monday morning is the beginning of something. You have a plan built from months of intelligence. You know this business — the risks, the opportunities, the people — because you studied it from every angle before you committed.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#1A1A18] leading-relaxed font-bold border-l-4 border-[#BA3C60] pl-8 italic">
                  That&apos;s the difference between the 70% who fail to capture value and the 30% who do.
                </p>
              </ScrollReveal>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ScrollReveal delay={0.15}>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#BA3C60]/10 rounded-2xl -rotate-3 scale-105 transition-transform group-hover:rotate-0" />
                <div className="relative z-10 w-full aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-stone-400 text-8xl">business_center</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. CTA ═══ */}
      <section className="py-48 bg-[#F5F3EF] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BA3C60]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-display italic font-bold text-[48px] md:text-[80px] text-[#1A1A18] mb-12">
              Build from day one.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <button
              onClick={() => onChipClick('I need help with integration')}
              className="bg-[#974223] text-white px-12 py-6 rounded-lg font-sans uppercase tracking-[0.2em] text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Tell Yulia about your acquisition
            </button>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
