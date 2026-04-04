import {
  ScrollReveal, StaggerContainer, StaggerItem,
  AnimatedTimeline, TiltCard, BeforeAfterSlider,
  InteractiveCalculator, MagneticButton, GlowingOrb,
  AnimatedCounter, StatBar, ZigZagSection,
} from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import { BaselineCalculator, LandingTaxCalc } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function SellBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Sell Your Business | AI Valuation & Exit Planning — smbx.ai',
    description: 'Find out what your business is worth. AI-powered business valuation calculator, SDE add-back analysis, institutional CIM, and full exit strategy.',
    canonical: 'https://smbx.ai/sell',
    faqs: [
      { question: 'What is Seller\'s Discretionary Earnings (SDE)?', answer: 'Seller\'s Discretionary Earnings (SDE) is the total financial benefit a single owner-operator derives from the business. It includes net income plus owner salary, personal expenses run through the business, depreciation, amortization, interest, and one-time costs. SDE is the standard earnings metric for valuing businesses under $5M.' },
      { question: 'How long does it take to sell a business?', answer: 'Most business sales take 6 to 18 months from listing to close. The timeline depends on deal complexity, buyer financing, due diligence scope, and industry. Proper exit planning — financial normalization, CIM preparation, and buyer identification — can significantly reduce time to close.' },
      { question: 'What is the difference between an asset sale and a stock sale?', answer: 'In an asset sale, the buyer purchases individual business assets (equipment, inventory, goodwill, customer lists). In a stock sale, the buyer purchases the owner\'s shares in the entity. The after-tax difference can be hundreds of thousands of dollars depending on purchase price allocation under IRC §1060.' },
      { question: 'What are common SDE add-backs?', answer: 'Common add-backs include owner salary and benefits, personal vehicle expenses, family member compensation above market rate, personal travel, one-time legal or professional fees, above-market rent paid to owner-held real estate, and personal insurance. Properly identifying add-backs can increase your SDE — and your valuation — by 15-30%.' },
    ],
  });

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — Full-width centered (breaks the 7/5 template) ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Sell</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dc.subtleBg} ${dc.muted}`}>Exit Planning</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-4xl">
              75% of owners who sell profoundly <span className="text-[#D44A78]">regret it</span> within a year.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-10 ${dc.muted}`}>
              Not because they sold. Because they weren't ready. Wrong valuation. Wrong timing. Wrong structure. Fixable problems they didn't know existed until after the wire hit. Most owners asking "what is my business worth" start with a Google search. Yulia starts with your actual financials.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <StatBar
              stats={[
                { label: 'Average value left on the table', value: 340, prefix: '$', suffix: 'K' },
                { label: 'Owners with no succession plan', value: 46, suffix: '%' },
                { label: 'Add-backs missed by typical CPAs', value: 5 },
              ]}
              className="max-w-3xl"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <p className={`font-bold text-2xl border-l-4 border-[#D44A78] pl-6 italic mt-12 max-w-xl ${dc.emphasis}`}>
              Yulia makes sure that doesn't happen to you.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. "WHAT'S YOUR BASELINE?" — Interactive valuation calculator ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">What's Your Baseline?</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Every exit starts with a number. Get yours in 30 seconds.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                A business valuation calculator gives you a range. But the range is only as good as the earnings estimate. Most owners know their revenue — few know their real Seller's Discretionary Earnings (SDE). And valuation multiples by industry can vary by 2x depending on owner dependency, customer concentration, and growth trajectory.
              </p>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                This calculator uses SDE margins by industry and current market multiples to estimate your Baseline. It's a starting point. Yulia goes deeper — she finds every add-back, scores your business on 7 value factors, and builds a defensible valuation with the math shown.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <BaselineCalculator dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 3. "FIND YOUR BLIND EQUITY" — SDE add-back toggle calculator ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Find Your Blind Equity</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">The money hiding in your books that your CPA never flagged.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                Seller's Discretionary Earnings isn't what your tax return says you made. It's what a buyer would actually earn running your business. The difference is your Blind Equity — legitimate SDE add-backs that increase your valuation without changing a thing about how you operate.
              </p>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                The personal vehicle. The family cell phones. The one-time legal bill. The above-market rent you pay yourself. Most CPAs optimize for tax savings, not exit value. Understanding SDE vs EBITDA — and when each metric applies — is the first step to knowing what your business is really worth.
              </p>
              <div className={`rounded-2xl p-6 ${dark ? 'bg-[#D44A78]/10 border border-[#D44A78]/20' : 'bg-[#D44A78]/5 border border-[#D44A78]/15'}`}>
                <p className={`text-sm ${dc.muted}`}><span className={`font-bold ${dc.emphasis}`}>Average Blind Equity found by Yulia: $124,000.</span> That's money that was always there. You just didn't know to count it.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <InteractiveCalculator className={dark ? 'bg-[#2f3133] border border-zinc-800' : undefined} />
              <MagneticButton
                onClick={() => bridgeToYulia("I'd like to find my Blind Equity. Can you walk me through all the potential SDE add-backs for my business?")}
                className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
              >
                Yulia finds add-backs your CPA missed
              </MagneticButton>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 4. EXIT PREPARATION TIMELINE — AnimatedTimeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Your Exit Process</span>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Exit planning for business owners isn't a single event. It's eight stages.</h2>
            <p className={`text-lg max-w-2xl mb-12 ${dc.muted}`}>
              Whether you're 3 years from an exit or 3 months, the sequence matters. Yulia manages every stage — from business succession planning through wire transfer. You don't need to know the process. You just need to show up for the decisions.
            </p>
          </ScrollReveal>

          <AnimatedTimeline>
            {[
              { num: '1', title: 'Know your number', desc: 'ValueLens preliminary valuation + add-back analysis + Value Readiness Report. This is where most people realize their business is worth more than they thought — or less than they hoped.', free: true },
              { num: '2', title: 'Get deal-ready', desc: 'Financial cleanup, documentation gaps, readiness improvements. Yulia tells you exactly what to fix and what each fix is worth in dollars. A $15K improvement to your processes might add $60K to your valuation.' },
              { num: '3', title: 'Build your materials', desc: 'CIM generated from your verified financials — the Confidential Information Memorandum that gets deals done. 25–40 pages. Blind teasers for initial outreach. Every document adapted to your league.' },
              { num: '4', title: 'Identify buyers', desc: 'Buyer categories mapped and scored. PE platforms currently acquiring in your sector. Individual operators who match your geography. Search funds with your thesis on their target list.' },
              { num: '5', title: 'Manage interest', desc: 'NDAs executed through the platform. CIMs released with access control. Buyer questions fielded — Yulia drafts your responses, you review and send.' },
              { num: '6', title: 'Evaluate offers', desc: 'Comparison matrix across every term — not just price. Risk-adjusted scoring. Tax implications modeled for each structure. Counter-offer frameworks with comparable transaction data.' },
              { num: '7', title: 'Close', desc: "Closing checklist tracked to completion. Funds flow coordination. Final document package. A Letter of Intent that protects your interests. Every party knows what's due and when." },
              { num: '8', title: 'Transition', desc: "180-day post-close plan. Knowledge transfer framework. Performance tracking against deal projections. You don't just close — you land." },
            ].map((step) => (
              <div key={step.num} className={`pl-10 pb-8 relative ${dark ? '' : ''}`}>
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

        {/* ═══ 5. NEGOTIATION INTELLIGENCE — BeforeAfterSlider ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Negotiation Intelligence</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Every counter-offer backed by comparable transaction data.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                Most owners sell a business without a broker and negotiate on instinct. Even those with brokers often lack real-time market data. Yulia prepares you with actual multiples, actual deal structures, and actual outcomes from comparable transactions in your sector — and drafts every communication for you.
              </p>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                An offer comes in at $1.6M for your $2.1M valuation. Yulia analyzes it against comps, identifies the working capital gap, and drafts three counter-structures — each with a different after-tax outcome. You pick the one that fits your goals.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <BeforeAfterSlider
                beforeLabel="Negotiating blind"
                afterLabel="Negotiating with Yulia"
                beforeContent={
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#EA4335] text-lg shrink-0 mt-0.5">close</span>
                      <p className="text-sm text-[#dadadc]/90">No idea if the offer price is fair</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#EA4335] text-lg shrink-0 mt-0.5">close</span>
                      <p className="text-sm text-[#dadadc]/90">Working capital peg? "What's that?"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#EA4335] text-lg shrink-0 mt-0.5">close</span>
                      <p className="text-sm text-[#dadadc]/90">Counter-offer based on gut feeling</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#EA4335] text-lg shrink-0 mt-0.5">close</span>
                      <p className="text-sm text-[#dadadc]/90">Tax structure chosen by buyer's attorney</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                      <p className="text-sm text-[#EA4335] font-bold">$340K left on the table</p>
                    </div>
                  </div>
                }
                afterContent={
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#34A853] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">Offer is 24% below defensible range — comps shown</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#34A853] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">Working capital peg $40K below trailing average</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#34A853] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">Three counter-structures drafted with tax math</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#34A853] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">Asset vs stock sale modeled — $300K difference</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                      <p className="text-sm text-[#34A853] font-bold">You keep what's yours</p>
                    </div>
                  </div>
                }
              />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 6. TAX IMPLICATIONS — Interactive tax calculator ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Tax Implications of Selling</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">The difference between an asset sale and a stock sale can be $300K in your pocket.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                Most sellers don't choose their deal structure — the buyer's attorney does. And buyers prefer asset sales because they get to depreciate the purchase price. That's fine for them. But the tax implications of selling a business vary wildly depending on purchase price allocation under IRC §1060, your state's capital gains tax rate, and whether goodwill qualifies for Section 197 amortization.
              </p>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                Yulia models the after-tax impact of every structure before you commit to one. She doesn't replace your CPA — she makes sure you walk into that meeting with the right questions and the right numbers.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <LandingTaxCalc dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 7. EXIT STRUCTURES — ZigZag layout ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Exit Structures</span>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Six ways to exit. Yulia models all of them.</h2>
            <p className={`text-lg max-w-2xl mb-12 ${dc.muted}`}>
              Most people assume there's one way to sell a business. There are six fundamentally different structures — and the after-tax difference can mean hundreds of thousands of dollars.
            </p>
          </ScrollReveal>

          <ZigZagSection
            items={[
              { icon: 'key', title: 'Full Sale', body: 'Complete exit. Hand over the keys, cash the check. The simplest structure — and the one most owners default to without modeling the alternatives.' },
              { icon: 'handshake', title: 'Partner Buyout', body: 'Your partner buys your share. Yulia models the valuation methodology, payment structure, and tax impact for both sides.' },
              { icon: 'trending_up', title: 'Capital Raise', body: 'Sell a minority stake (10–49%) while keeping operational control. Different documents, different buyers, different tax treatment.' },
              { icon: 'diversity_3', title: 'Employee Buyout (ESOP)', body: 'Tax-advantaged transfer to your team. Complex trust structure but powerful tax benefits. Yulia models the setup and ongoing obligations.' },
              { icon: 'pie_chart', title: 'Majority Share Sale', body: 'Sell controlling interest but retain a minority stake. Common in PE roll-ups where they want you to stay and grow.' },
              { icon: 'category', title: 'Partial Stock/Asset Sale', body: 'Sell specific assets or a division. The most flexible — and most complex — structure. Requires careful purchase price allocation.' },
            ]}
          />

          <ScrollReveal delay={0.2}>
            <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#D44A78]/10 border border-[#D44A78]/20' : 'bg-[#D44A78]/5 border border-[#D44A78]/15'}`}>
              <span className="material-symbols-outlined text-[#D44A78] text-2xl shrink-0 mt-1">auto_fix_high</span>
              <p className={`text-sm ${dc.muted}`}><span className={`font-bold ${dc.emphasis}`}>Yulia models the after-tax impact of each structure before you commit to one.</span> The difference between an asset sale and a stock sale on a $2.4M deal can be $300K in your pocket.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 8. CTA — Journey-specific ═══ */}
        <ScrollReveal>
          <section className="mb-12 relative">
            <GlowingOrb size={300} color="rgba(212,74,120,0.15)" top="-100px" right="-80px" />
            <div className={`rounded-3xl p-12 md:p-16 text-center relative z-10 ${dc.darkPanel} text-white`}>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-4">
                Know your number<br />before you <span className="text-[#D44A78]">commit.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell Yulia about your business. She'll find your Blind Equity, build your Baseline valuation, and tell you exactly what comes next. Free, no account required.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton
                  onClick={goToChat}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Tell Yulia about your business
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/70">Free Baseline valuation · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
