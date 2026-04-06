import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedTimeline, TiltCard, ZigZagSection, MagneticButton, GlowingOrb, AnimatedCounter } from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import { LandingCapTableCalc } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function RaiseBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Raise Capital | Dilution Modeling & Capital Structure — smbx.ai',
    description: 'Model every capital structure — equity, debt, mezzanine, ROBS, ESOP. Build investor-ready materials. AI-powered fundraising intelligence.',
    canonical: 'https://smbx.ai/raise',
    faqs: [
      {
        question: 'What capital structures can I model when raising capital for my business?',
        answer: 'smbx.ai models six capital structures side by side: equity financing (angel, VC, PE, family office), debt financing (SBA, conventional, private credit), mezzanine (subordinated debt with equity kickers), revenue-based financing, ESOP (employee stock ownership plans), and ROBS (Rollover for Business Startups using retirement funds). Each structure is modeled with dilution impact, cost of capital, and founder retention so you can compare them before making a decision.',
      },
      {
        question: 'How does the dilution modeling and cap table tool work?',
        answer: 'The cap table and dilution modeling tool lets you input your pre-money valuation, investment amount, and liquidation preferences to see exactly what founders receive at different exit values. It accounts for participating preferred equity, anti-dilution provisions, and liquidation waterfalls — so you understand the real math behind your ownership percentage before you sign a term sheet.',
      },
      {
        question: 'Can Yulia help me build a pitch deck and investor-ready materials?',
        answer: 'Yes. Yulia generates a complete fundraising package from your verified financials including a pitch deck tailored to your investor audience, an executive summary, a detailed financial model, cap table projections across funding scenarios, and a fully organized data room. These are built from your actual numbers — not templates — so they survive investor scrutiny.',
      },
      {
        question: 'What is the process for raising capital through smbx.ai?',
        answer: 'The raise journey has six structured gates: (1) Readiness assessment including capital needs analysis and timeline planning (free), (2) Financial package with verified financials and growth model, (3) Investor materials including pitch deck and data room, (4) Investor outreach with targeted matching and teaser distribution, (5) Term sheet negotiation with market benchmark comparisons, and (6) Close with DD coordination and final documentation.',
      },
    ],
  });

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — Full-width centered ═══ */}
        <section className="mb-24 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Raise</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Capital</span>
            </div>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
              Most pitch decks never get{' '}
              <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>a second meeting.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className={`space-y-6 text-xl editorial max-w-2xl mx-auto ${dc.muted}`}>
              <p>
                The difference between a funded search fund and a stalled one isn't the opportunity — it's the package. Investors evaluate your pre-money valuation, your cap table, your dilution modeling, and your financial story before they evaluate you. Equity financing, debt financing, mezzanine, ROBS, ESOP, revenue-based financing — each capital structure tells a different story about what you're willing to give up and what you expect in return. Yulia builds the story that gets term sheets.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className={`font-bold border-l-4 border-[#D44A78] pl-6 text-2xl italic mt-10 text-left max-w-2xl mx-auto ${dc.emphasis}`}>
              Yulia builds your fundraising package, models every capital structure, and shows you exactly what you keep. You take the meetings.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. Capital Structure Explorer — ZigZagSection ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Capital Structure Explorer</span>
              <h2 className="font-headline font-black text-4xl tracking-tight mb-4">Six structures. Every trade-off modeled.</h2>
              <p className={`text-lg max-w-2xl mx-auto ${dc.muted}`}>
                Most founders only consider equity financing. There are six fundamentally different ways to raise capital for a business — each with different implications for dilution, control, and what you take home at exit.
              </p>
            </div>
          </ScrollReveal>
          <ZigZagSection
            items={[
              {
                icon: 'pie_chart',
                title: 'Equity Financing',
                body: 'Sell a percentage of ownership to angel investors, venture capital, private equity, family offices, or strategic buyers. Yulia builds your cap table projections showing dilution across multiple funding rounds — so you understand how each equity raise compounds before you sign the term sheet.',
              },
              {
                icon: 'account_balance',
                title: 'Debt Financing',
                body: 'SBA loans, conventional lending, or private credit. No dilution but personal guarantees and debt service obligations. Yulia models your DSCR impact, amortization schedules, and covenant compliance so you know exactly what the debt costs you in cash flow.',
              },
              {
                icon: 'layers',
                title: 'Mezzanine',
                body: 'Subordinated debt with equity kickers — warrants, conversion rights, or participation features. Higher cost of capital than senior debt but significantly less dilution than pure equity financing. Common in PE-backed acquisitions and growth capital structures.',
              },
              {
                icon: 'sync_alt',
                title: 'Revenue-Based Financing',
                body: 'Repay as a percentage of monthly revenue. No dilution, no fixed payment schedule, no personal guarantee in most cases. Higher total cost of capital but maximum flexibility for seasonal or high-growth businesses raising capital without giving up ownership.',
              },
              {
                icon: 'diversity_3',
                title: 'ESOP',
                body: 'Employee Stock Ownership Plan — a tax-advantaged structure that transfers ownership to employees through a trust. Powerful Section 1042 tax benefits for sellers and deductible contributions for the company. Yulia models setup costs, repurchase obligations, and the ongoing cap table impact.',
              },
              {
                icon: 'savings',
                title: 'ROBS (Rollover for Business Startups)',
                body: 'Use your retirement funds as equity injection without early withdrawal penalties or tax consequences. Legitimate under IRS rules but creates concentration risk — your retirement and your business succeed or fail together. Yulia models the trade-offs against conventional equity or debt financing alternatives.',
              },
            ]}
          />
        </section>

        {/* ═══ 3. Know Your Dilution — Split 5/7 with Calculator ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Know Your Dilution</span>
              <h2 className="font-headline font-black text-4xl tracking-tight mb-8">
                Ownership percentage is not the same as what you take home.
              </h2>
              <div className={`space-y-5 leading-relaxed editorial ${dc.muted}`}>
                <p>
                  Most founders raising capital understand they are giving up equity. Very few understand what liquidation preferences, participation rights, and anti-dilution provisions actually cost them when it matters — at exit.
                </p>
                <p>
                  Pre-money valuation determines your ownership percentage. But the cap table waterfall determines what you actually receive. A 1x participating preferred with a $10M pre-money valuation means the investor gets their money back first, then shares in the remaining proceeds proportionally. At lower exit values, your "83% ownership" can translate to 50% of proceeds or less.
                </p>
                <p>
                  Yulia models every dilution scenario before you sign. Drag the sliders. See the real math.
                </p>
              </div>
              <div className={`mt-8 rounded-2xl p-6 ${dark ? 'bg-[#D44A78]/10 border border-[#D44A78]/20' : 'bg-[#D44A78]/5 border border-[#D44A78]/15'}`}>
                <p className={`text-sm ${dc.muted}`}>
                  <span className={`font-bold ${dc.emphasis}`}>The question is not "what percentage am I giving up."</span>{' '}
                  It is "what do I actually receive at a $5M exit vs. a $20M exit vs. a $50M exit — after preferences, participation, and the waterfall."
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <LandingCapTableCalc dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 4. The Raise Process — AnimatedTimeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">The Raise Process</span>
              <h2 className="font-headline font-black text-4xl tracking-tight mb-4">Six gates from readiness to close.</h2>
              <p className={`text-lg max-w-2xl ${dc.muted}`}>
                Every gate has specific completion triggers. Yulia advances you when the prerequisite work is done — and not before. From "how much should I raise?" to "the capital just hit the account."
              </p>
            </div>
          </ScrollReveal>
          <AnimatedTimeline>
            {/* Step 1 — FREE */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#22C55E]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-bold ${dc.emphasis}`}>1. Readiness Assessment</h4>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${dark ? 'bg-[#006630]/20 text-[#22C55E]' : 'bg-[#006630]/10 text-[#006630]'}`}>FREE</span>
                </div>
                <p className={`text-sm ${dc.muted}`}>
                  Capital needs analysis, funding options comparison, timeline planning. "How much do you need, what is it for, and what are you willing to give up?" Yulia evaluates your business against each capital structure — equity financing, debt, mezzanine, revenue-based, ESOP, ROBS — and recommends the path that fits your goals.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <h4 className={`font-bold mb-2 ${dc.emphasis}`}>2. Financial Package</h4>
                <p className={`text-sm ${dc.muted}`}>
                  Verified financials, growth model, use-of-funds detail. The numbers that survive investor scrutiny — because they were built the same way an investor would build them. Includes historical recast, forward projections, and sensitivity analysis across scenarios.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <h4 className={`font-bold mb-2 ${dc.emphasis}`}>3. Investor Materials</h4>
                <p className={`text-sm ${dc.muted}`}>
                  Pitch deck, executive summary, financial model, data room. Everything an investor needs to move from "interesting" to "let's talk terms." Your pitch deck is built from verified financials — not a template — and adapted to your audience. Angel investors get the vision; PE firms get the returns math.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <h4 className={`font-bold mb-2 ${dc.emphasis}`}>4. Investor Outreach</h4>
                <p className={`text-sm ${dc.muted}`}>
                  Targeted list of matched investors from SBIC directories, SEC filings, and search fund networks. Teaser distribution, NDA management, and engagement tracking. Yulia tracks who has engaged, who has passed, and who needs a follow-up — so nothing falls through the cracks.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <h4 className={`font-bold mb-2 ${dc.emphasis}`}>5. Term Sheet Negotiation</h4>
                <p className={`text-sm ${dc.muted}`}>
                  When offers arrive, Yulia compares each term sheet against market benchmarks. Is the pre-money valuation fair? Are the liquidation preferences standard? What does the cap table waterfall look like at different exit values? You negotiate from knowledge — with dilution modeling that shows what each term actually costs you.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <div className={`rounded-2xl p-6 ${dc.card}`}>
                <h4 className={`font-bold mb-2 ${dc.emphasis}`}>6. Close</h4>
                <p className={`text-sm ${dc.muted}`}>
                  Due diligence coordination, final documentation, closing checklist. The capital hits your account and Yulia transitions you to execution mode. Every document, every approval, every wire instruction — managed through a single thread.
                </p>
              </div>
            </div>
          </AnimatedTimeline>
        </section>

        {/* ═══ 5. Worked Example: Dilution at Exit ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Dilution at Exit</span>
              <h2 className="font-headline font-black text-4xl tracking-tight mb-4">
                83% ownership does not mean 83% of proceeds.
              </h2>
              <p className={`text-lg max-w-2xl ${dc.muted}`}>
                Liquidation preferences eat your upside at lower exit values. Here is what a typical raise looks like after the waterfall.
              </p>
            </div>
          </ScrollReveal>
          <TiltCard className="max-w-3xl mx-auto">
            <div className={`rounded-3xl p-8 md:p-10 text-white ${dc.darkPanel}`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-4">Worked example</p>
              <h4 className="font-bold text-lg mb-6">You raise $2M at a $10M pre-money valuation. Here is what you actually keep.</h4>

              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Pre-money</p>
                    <p className="text-xl font-black">$10M</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Investment</p>
                    <p className="text-xl font-black text-[#D44A78]">$2M</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Your stake</p>
                    <p className="text-xl font-black">83.3%</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#dadadc]/60 uppercase tracking-widest font-bold mb-4">What you receive at exit (after 1x participating preferred)</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">Exit Value</th>
                      <th className="text-right py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">Investor Gets</th>
                      <th className="text-right py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">You Get</th>
                      <th className="text-right py-2 text-[#dadadc]/60 font-medium text-xs uppercase tracking-wider">Your %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-[#dadadc]/90">$5M exit</td>
                      <td className="py-3 text-right text-[#dadadc]/90">$2.50M</td>
                      <td className="py-3 text-right font-bold text-white">$2.50M</td>
                      <td className="py-3 text-right text-[#E8709A] font-bold">50%</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-[#dadadc]/90">$10M exit</td>
                      <td className="py-3 text-right text-[#dadadc]/90">$3.33M</td>
                      <td className="py-3 text-right font-bold text-white">$6.67M</td>
                      <td className="py-3 text-right text-[#E8709A] font-bold">67%</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-[#dadadc]/90">$20M exit</td>
                      <td className="py-3 text-right text-[#dadadc]/90">$5.00M</td>
                      <td className="py-3 text-right font-bold text-white">$15.00M</td>
                      <td className="py-3 text-right text-[#E8709A] font-bold">75%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-[#dadadc]/90">$50M exit</td>
                      <td className="py-3 text-right text-[#dadadc]/90">$10.00M</td>
                      <td className="py-3 text-right font-bold text-white">$40.00M</td>
                      <td className="py-3 text-right text-[#E8709A] font-bold">80%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/70 italic">
                  At a $5M exit, your 83% ownership translates to only 50% of proceeds. The 1x participating preferred means the investor recovers their $2M first, then participates pro rata in the remaining $3M. Liquidation preferences compress your returns at every exit below the post-money valuation. Yulia models this before you sign the term sheet.
                </p>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* ═══ 6. CTA — Journey-specific ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-white relative overflow-hidden ${dc.darkPanel}`}>
              <GlowingOrb top="-80px" left="-60px" size={300} color="rgba(212,74,120,0.15)" />
              <GlowingOrb top="40px" left="70%" size={220} color="rgba(232,112,154,0.10)" delay={2} />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-6">
                  Model Your Raise.<br />
                  <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>Know what you keep.</span>
                </h2>
                <p className="text-lg text-[#dadadc]/70 mb-8 max-w-xl mx-auto">
                  Tell Yulia how much you need and what it is for. She will model every capital structure — equity, debt, mezzanine, ROBS, ESOP — build your pitch deck and investor materials, project your cap table, and show you the dilution math before your first meeting.
                </p>
                <MagneticButton
                  onClick={() => bridgeToYulia("I'm raising capital for a business acquisition. Help me model the capital structure and understand my dilution.")}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Model Your Raise
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/50 mt-4">Free readiness assessment. No account required. Your data stays yours.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
