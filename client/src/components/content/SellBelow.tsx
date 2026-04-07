import {
  ScrollReveal,
  AnimatedTimeline, InteractiveCalculator, MagneticButton, GlowingOrb,
  StatBar,
} from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import { BaselineCalculator } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function SellBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Sell Your Business | Real SDE Valuation & Exit Planning — smbx.ai',
    description: 'Your CPA optimizes for taxes, not your exit. Find your real SDE, uncover Blind Equity your accountant missed, and get a defensible valuation before you sign anything.',
    canonical: 'https://smbx.ai/sell',
    faqs: [
      { question: 'What is Blind Equity?', answer: 'Blind Equity is the gap between what your tax return says you earn and what a buyer would actually underwrite. It comes from legitimate SDE add-backs — personal vehicles, family phones, one-time legal fees, above-market rent to your own LLC — that your CPA optimized away for tax savings but that increase your business valuation.' },
      { question: 'What is SDE and why does it matter for selling a business?', answer: 'SDE (Seller\'s Discretionary Earnings) is the total financial benefit a single owner-operator takes from the business. It includes net income plus owner salary, personal expenses run through the business, depreciation, amortization, interest, and one-time costs. SDE is the standard earnings metric for valuing businesses under $5M — and it\'s almost always higher than what your tax return shows.' },
      { question: 'How long does it take to sell a business?', answer: 'Most business sales take 6 to 18 months from listing to close. The timeline depends on deal complexity, buyer financing, due diligence scope, and industry. Proper exit planning — financial normalization, CIM preparation, and buyer identification — can significantly reduce time to close.' },
      { question: 'What is the difference between an asset sale and a stock sale?', answer: 'In an asset sale, the buyer purchases individual business assets (equipment, inventory, goodwill, customer lists). In a stock sale, the buyer purchases the owner\'s shares in the entity. The after-tax difference can be hundreds of thousands of dollars depending on purchase price allocation under IRC §1060.' },
      { question: 'What are common SDE add-backs CPAs miss?', answer: 'Common add-backs include owner salary and benefits, personal vehicle expenses, family member compensation above market rate, personal travel, one-time legal or professional fees, above-market rent paid to owner-held real estate, and personal insurance. Properly identifying add-backs can increase your SDE — and your valuation — by 15-30%.' },
    ],
  });

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Sell</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dc.subtleBg} ${dc.muted}`}>Exit Planning</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-4xl">
              Your CPA optimizes for taxes. Not your <span className="text-[#D44A78]">exit.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-10 ${dc.muted}`}>
              Most owners discover their business is worth 15-30% more than they thought — after they've already signed. The add-backs your CPA never flagged. The buyer premium your broker didn't model. The tax structure nobody told you about until it was too late.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <StatBar
              stats={[
                { label: 'Average Blind Equity found per seller', value: 340, prefix: '$', suffix: 'K' },
                { label: 'Owners with no exit plan at all', value: 46, suffix: '%' },
                { label: 'Add-backs the typical CPA misses', value: 5 },
              ]}
              className="max-w-3xl"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <p className={`font-bold text-2xl border-l-4 border-[#D44A78] pl-6 italic mt-12 max-w-xl ${dc.emphasis}`}>
              We've seen $400K walk out the door because the seller's accountant was focused on April 15, not exit day.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. BASELINE CALCULATOR ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">What's Your Baseline?</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Revenue multiples are dangerous. Here's what your business actually earns.</h2>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                Most online valuation tools multiply your revenue by an industry average. That number is wrong — sometimes by $500K. Real valuations start with SDE (what you actually take home after add-backs) and adjust for owner dependency, customer concentration, and growth.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <BaselineCalculator dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 3. BLIND EQUITY — SDE add-back toggle calculator ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Find Your Blind Equity</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">The $124K your CPA missed.</h2>
              <p className={`leading-relaxed editorial ${dc.muted}`}>
                Blind Equity is the gap between what your tax return says and what a buyer would actually underwrite. The personal vehicle, the family phones, the one-time legal fee, the above-market rent you pay your own LLC. Toggle these add-backs and watch your valuation change.
              </p>
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

        {/* ═══ 4. YOUR EXIT PROCESS — 5-step AnimatedTimeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Your Exit Process</span>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Five stages. One outcome: you keep what's yours.</h2>
            <p className={`text-lg max-w-2xl mb-12 ${dc.muted}`}>
              Whether you're 3 years from an exit or 3 months, the sequence matters. You don't need to know the process. You just need to show up for the decisions.
            </p>
          </ScrollReveal>

          <AnimatedTimeline>
            {[
              { num: '1', title: 'Know your number', desc: 'Yulia finds your real SDE, scores your readiness, and gives you a range — free.', free: true },
              { num: '2', title: 'Get deal-ready', desc: 'She tells you what to fix and what each fix adds to your price.' },
              { num: '3', title: 'Build your materials', desc: 'CIM (the deal book buyers actually read), teasers, and deal package — generated from your verified financials.' },
              { num: '4', title: 'Find buyers and negotiate', desc: 'Buyer categories scored. Counter-offers drafted with comp data. Every communication written for you.' },
              { num: '5', title: 'Close and land', desc: "Closing checklist, funds flow, and a 180-day post-close plan so you don't just sell — you land." },
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
                Know your number<br />before you <span className="text-[#D44A78]">commit.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell Yulia about your business. She'll find your Blind Equity, build your Baseline, and show you what comes next.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton
                  onClick={goToChat}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Talk to Yulia
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
