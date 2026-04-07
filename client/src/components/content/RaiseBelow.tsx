import { ScrollReveal, StaggerContainer, StaggerItem, TiltCard, MagneticButton, GlowingOrb } from './animations';
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
    {
      icon: 'pie_chart',
      name: 'Equity',
      line: 'Dilutive but fast. Best when you have a clear exit horizon and investors who add strategic value.',
    },
    {
      icon: 'account_balance',
      name: 'Debt',
      line: 'No dilution. SBA is the cheapest path. Personal guarantee required.',
    },
    {
      icon: 'layers',
      name: 'Mezzanine',
      line: 'Subordinated debt with equity kickers. PE roll-up territory.',
    },
    {
      icon: 'sync_alt',
      name: 'Revenue-Based',
      line: 'Repay as you earn. No dilution, no personal guarantee, higher total cost.',
    },
    {
      icon: 'diversity_3',
      name: 'ESOP',
      line: 'Tax-advantaged transfer to employees. Powerful \u00A71042 benefits. Complex setup.',
    },
    {
      icon: 'savings',
      name: 'ROBS',
      line: 'Retirement funds as equity. No penalties. Your retirement is now your business — for better or worse.',
    },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO + DILUTION SHOCK ═══ */}
        <section className="mb-24 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Raise</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Capital</span>
            </div>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8">
              83% ownership doesn't mean{' '}
              <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>83% of the money.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className={`space-y-6 text-xl editorial max-w-2xl mx-auto text-left ${dc.muted}`}>
              <p>
                You raise $2M at a $10M pre-money. You own 83%. You think that means 83% of the exit. It doesn't. After 1x liquidation preferences (the investor gets paid first), at a $5M exit you get 50% — not 83%. At $20M you get 75%. The preferences eat your upside at every exit below $50M.
              </p>
            </div>
          </ScrollReveal>

          {/* Worked example table — immediately in hero */}
          <ScrollReveal delay={0.3}>
            <div className="mt-10 max-w-2xl mx-auto">
              <TiltCard className="w-full">
                <div className={`rounded-3xl p-8 md:p-10 text-white ${dc.darkPanel}`}>
                  <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-4">$2M raise at $10M pre-money &middot; 1x liquidation preference</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">Exit Value</th>
                          <th className="text-right py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">You Get</th>
                          <th className="text-right py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">Your %</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-[#dadadc]/90">$5M exit</td>
                          <td className="py-3 text-right font-bold text-white">$2.5M</td>
                          <td className="py-3 text-right text-[#E8709A] font-bold">50%</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-[#dadadc]/90">$20M exit</td>
                          <td className="py-3 text-right font-bold text-white">$15M</td>
                          <td className="py-3 text-right text-[#E8709A] font-bold">75%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#dadadc]/90">$50M exit</td>
                          <td className="py-3 text-right font-bold text-white">$40M</td>
                          <td className="py-3 text-right text-[#E8709A] font-bold">80%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TiltCard>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. CAP TABLE CALCULATOR ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <h2 className="font-headline font-black text-4xl tracking-tight mb-4">
                Run your actual numbers. See what you keep.
              </h2>
              <p className={`text-lg ${dc.muted}`}>
                Most founders don't model their liquidation waterfall until after the term sheet is signed. By then it's too late to negotiate.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <LandingCapTableCalc dark={dark} />
          </ScrollReveal>
        </section>

        {/* ═══ 3. CAPITAL STRUCTURES — 2x3 grid ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <h2 className="font-headline font-black text-4xl tracking-tight mb-4">
                Six ways to fund your deal. Here's which one fits.
              </h2>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {structures.map((s) => (
              <StaggerItem key={s.name}>
                <div className={`rounded-2xl p-6 h-full ${dc.card}`}>
                  <span className="material-symbols-rounded text-[#D44A78] text-2xl mb-3 block">{s.icon}</span>
                  <h3 className={`font-bold text-base mb-2 ${dc.emphasis}`}>{s.name}</h3>
                  <p className={`text-sm leading-relaxed ${dc.muted}`}>{s.line}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 4. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-white relative overflow-hidden ${dc.darkPanel}`}>
              <GlowingOrb top="-80px" left="-60px" size={300} color="rgba(212,74,120,0.15)" />
              <GlowingOrb top="40px" right="10%" size={220} color="rgba(232,112,154,0.10)" delay={2} />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-6">
                  Model your raise before you{' '}
                  <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>sign anything.</span>
                </h2>
                <p className="text-lg text-[#dadadc]/70 mb-8 max-w-xl mx-auto">
                  Tell Yulia how much you need and what it's for. She'll model every structure and show you what you actually keep.
                </p>
                <MagneticButton
                  onClick={() => bridgeToYulia("I'm raising capital for a business acquisition. Help me model the capital structure and understand my dilution.")}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Model Your Raise
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/50 mt-4">Free readiness assessment. No account required.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
