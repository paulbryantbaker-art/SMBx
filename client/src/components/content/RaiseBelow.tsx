import {
  ScrollReveal, StaggerContainer, StaggerItem,
  AnimatedTimeline, MagneticButton, GlowingOrb, StatBar,
} from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import { LandingCapTableCalc } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function RaiseBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Raise Capital | Dilution Modeling & Capital Structure — smbx.ai',
    description: 'You raise $2M at a $10M pre-money. You own 83%. After liquidation preferences, you get 50% at a $5M exit — not 83%. Model every structure before you sign.',
    canonical: 'https://smbx.ai/raise',
    faqs: [
      {
        question: 'What does 83% ownership actually mean after liquidation preferences?',
        answer: 'Ownership percentage and proceeds percentage are not the same thing. If you raise $2M at a $10M pre-money valuation with 1x participating preferred, the investor gets their $2M back first (liquidation preference) then shares pro rata in what remains. At a $5M exit your 83% ownership translates to 50% of proceeds. At $20M you get 75%. The preferences compress your returns at every exit below the post-money valuation.',
      },
      {
        question: 'How does the dilution and cap table calculator work?',
        answer: 'The cap table calculator lets you input pre-money valuation, investment amount, and liquidation preferences to model what founders actually receive at different exit values. It accounts for participating preferred equity and liquidation waterfalls so you see the real math behind your ownership percentage before signing a term sheet.',
      },
      {
        question: 'What capital structures can I model for raising capital?',
        answer: 'smbx.ai models six capital structures: equity financing (dilutive but fast), debt financing (SBA is cheapest, personal guarantee required), mezzanine (subordinated debt with equity kickers), revenue-based financing (no dilution, higher total cost), ESOP (tax-advantaged employee transfer with Section 1042 benefits), and ROBS (retirement funds as equity, no penalties). Each is modeled with dilution impact and founder retention.',
      },
    ],
  });

  const structures = [
    { icon: 'pie_chart', name: 'Equity', line: 'Dilutive but fast. Best when you have a clear exit horizon and investors who add strategic value.' },
    { icon: 'account_balance', name: 'Debt', line: 'No dilution. SBA is the cheapest path. Personal guarantee required.' },
    { icon: 'layers', name: 'Mezzanine', line: 'Subordinated debt with equity kickers. PE roll-up territory.' },
    { icon: 'sync_alt', name: 'Revenue-Based', line: 'Repay as you earn. No dilution, no personal guarantee, higher total cost.' },
    { icon: 'diversity_3', name: 'ESOP', line: 'Tax-advantaged transfer to employees. Powerful §1042 benefits. Complex setup.' },
    { icon: 'savings', name: 'ROBS', line: 'Retirement funds as equity. No penalties. Your retirement is now your business — for better or worse.' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Raise</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Capital</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-4xl">
              83% ownership doesn't mean{' '}
              <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>83% of the money.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-10 ${dc.muted}`}>
              You raise $2M at a $10M pre-money. You own 83%. After 1x liquidation preferences, a $5M exit pays you 50% — not 83%. The preferences eat your upside at every exit below $50M, and most founders don't model this until after the term sheet is signed.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <StatBar
              stats={[
                { label: 'Average dilution founders underestimate', value: 22, suffix: '%' },
                { label: 'Founders who model their waterfall pre-term sheet', value: 14, suffix: '%' },
                { label: 'Capital structures most never consider', value: 4 },
              ]}
              className="max-w-3xl"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <p className={`font-bold text-2xl border-l-4 border-[#D44A78] pl-6 italic mt-12 max-w-xl ${dc.emphasis}`}>
              The term sheet you sign today determines what you keep in five years. Model it first.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. CAP TABLE CALCULATOR ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Dilution Calculator</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Run your actual numbers. See what you keep.</h2>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                Most founders don't model their liquidation waterfall until after the term sheet is signed. By then it's too late to negotiate. Plug in your pre-money, raise amount, and preference structure — see what you actually take home at every exit value.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <LandingCapTableCalc dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 3. CAPITAL STRUCTURES — 2x3 grid ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Capital Structures</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Six ways to fund your deal. Here's which one fits.</h2>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                Equity isn't the only option. Depending on your deal size, cash flow, and exit timeline, debt, mezzanine, or revenue-based financing might preserve more ownership. Yulia models all six and shows you the math.
              </p>
            </ScrollReveal>
            <div className="lg:col-span-7">
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {structures.map((s) => (
                  <StaggerItem key={s.name}>
                    <div className={`rounded-2xl p-5 h-full ${dc.card}`}>
                      <span className="material-symbols-rounded text-[#D44A78] text-2xl mb-3 block">{s.icon}</span>
                      <h3 className={`font-bold text-base mb-2 ${dc.emphasis}`}>{s.name}</h3>
                      <p className={`text-sm leading-relaxed ${dc.muted}`}>{s.line}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* ═══ 4. YOUR RAISE PROCESS — 5-step timeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Your Raise Process</span>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Five stages. One outcome: you keep what's yours.</h2>
            <p className={`text-lg max-w-2xl mb-12 ${dc.muted}`}>
              Whether you're raising a seed round, SBA financing, or a PE growth equity check — the sequence is the same. Yulia runs each stage.
            </p>
          </ScrollReveal>

          <AnimatedTimeline>
            {[
              { num: '1', title: 'Define the capital need', desc: 'How much, what for, and what the business can service. Yulia models your capacity before you approach anyone.', free: true },
              { num: '2', title: 'Model every structure', desc: 'Equity, debt, mezzanine, RBF, ESOP, ROBS — side by side with dilution impact and founder retention at each exit.' },
              { num: '3', title: 'Build investor materials', desc: 'Pitch deck, financial package, and cap table — generated from your verified numbers, not templates.' },
              { num: '4', title: 'Negotiate the term sheet', desc: 'Yulia red-flags toxic terms, models counter-offers, and shows you what each clause costs over 5 years.' },
              { num: '5', title: 'Close and deploy', desc: 'Closing checklist, funds flow, board setup, and a 90-day deployment plan so the capital hits the business — not overhead.' },
            ].map((step) => (
              <div key={step.num} className="pl-10 pb-8 relative">
                <div className={`absolute left-0 top-0 w-[10px] h-[10px] rounded-full ${step.free ? 'bg-[#006630]' : 'bg-[#D44A78]'}`} />
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{step.title}</h4>
                  {step.free && <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]'}`}>FREE</span>}
                </div>
                <p className={`text-sm ${dc.muted}`}>{step.desc}</p>
              </div>
            ))}
          </AnimatedTimeline>
        </section>

        {/* ═══ 5. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 relative">
            <GlowingOrb size={300} color="rgba(212,74,120,0.15)" top="-100px" right="-80px" />
            <div className={`rounded-3xl p-12 md:p-16 text-center relative z-10 ${dc.darkPanel} text-white`}>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-4">
                Model your raise before you{' '}
                <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>sign anything.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell Yulia how much you need and what it's for. She'll model every structure and show you what you actually keep.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton
                  onClick={() => bridgeToYulia("I'm raising capital for a business acquisition. Help me model the capital structure and understand my dilution.")}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Model Your Raise
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/70">Free capital needs assessment · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
