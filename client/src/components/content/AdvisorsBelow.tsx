import { ScrollReveal } from './animations';

const CAPABILITIES = [
  { title: 'CIM Generation', icon: 'description', body: 'CIMs in twenty minutes, not twenty hours. White-labeled under your brand. Dynamic — updates automatically when financials change.' },
  { title: 'Financial Normalization', icon: 'calculate', body: 'Complete add-back schedules from IRS benchmarks. SDE/EBITDA done properly with every adjustment documented and defensible.' },
  { title: 'Market Intelligence', icon: 'insights', body: 'Localized to the MSA. Competitive density. PE activity. Wage benchmarks from BLS. SBA lending patterns. Every number sourced.' },
  { title: 'SBA Bankability', icon: 'account_balance', body: "At today's rates with current SOP rules. DSCR, equity injection, seller financing feasibility — modeled before the listing goes live." },
  { title: 'Value Analysis', icon: 'analytics', body: "Reports with visible methodology your client's attorney will respect. Census data, BLS benchmarks, transaction comps — all sourced." },
  { title: 'Buyer Qualification', icon: 'person_search', body: 'Automated NDA tracking, initial financial verification, and SBA pre-qualification for every inquiry that comes through the door.' },
];

const TIERS = [
  { title: 'Advisor Trial', price: 'Free', desc: "First three client deals free. Full platform access. Real deals, real data, real deliverables. White-labeled under your brand. If the quality doesn't meet your standards, you've spent nothing." },
  { title: 'Advisor Pro', price: '$299/mo', desc: "Unlimited client deals. All deliverables. Branded outputs. Client management dashboard. The cost of one analyst hour per month buys unlimited AI-powered analytical capacity." },
  { title: 'Advisor Enterprise', price: '$499/mo', desc: "Everything in Pro, plus API access, white-label options, priority support, team seats. For practices building smbX.ai into their workflow." },
];

export default function AdvisorsBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A18] selection:bg-[#D4714E] selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              For M&amp;A Professionals
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-[48px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-[#1A1A18] max-w-4xl mb-8">
              Your expertise, multiplied
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="max-w-2xl text-xl md:text-2xl text-[#6B6B65] leading-relaxed font-headline italic">
              You have twelve active listings. Something isn&apos;t getting done this week. Yulia handles the analytical work so you can handle what you&apos;re great at.
            </p>
          </ScrollReveal>
        </div>
        <div className="absolute -right-20 top-20 w-[600px] h-[600px] bg-[#D4714E]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2. THE BANDWIDTH PROBLEM ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-7">
            <ScrollReveal>
              <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
                The Reality
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] mb-8">
                Thirty-five to sixty-three hours per listing. Times twelve.
              </h2>
            </ScrollReveal>
            <div className="space-y-6">
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">I don&apos;t need to explain this to you — you live it.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">Normalizing financials for a new listing: four to six hours. Building the CIM: twenty to forty hours. Market comps: two to three hours per deal. SBA bankability check: another hour or two. Valuation model: eight to twelve.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">The CIM that should have been ready Friday isn&apos;t. The buyer who requested financials five days ago is still waiting. The listing that deserves a full competitive process gets a single-bidder sale because there wasn&apos;t bandwidth to build the outreach package.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.24}>
                <p className="text-lg text-[#1A1A18] leading-relaxed font-bold">Those represent real revenue you&apos;re leaving on the table — not because the deals aren&apos;t viable, but because the economics of manual analytical work don&apos;t support serving them at your standards.</p>
              </ScrollReveal>
            </div>
          </div>
          <div className="md:col-span-5 sticky top-32">
            <ScrollReveal delay={0.15}>
              <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/30 space-y-8">
                <div>
                  <span className="font-mono text-5xl font-bold text-[#D4714E]">63h</span>
                  <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Max Hours Per Listing</p>
                </div>
                <div className="h-px bg-[#DCC1B9]/30" />
                <div>
                  <span className="font-mono text-4xl font-bold text-[#1A1A18]">×12</span>
                  <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Active Listings</p>
                </div>
                <div className="h-px bg-[#DCC1B9]/30" />
                <div>
                  <span className="font-mono text-4xl font-bold text-[#D4714E]">756h</span>
                  <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Total Analytical Hours</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. WHAT YULIA DELIVERS ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
              Capabilities
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-20 max-w-3xl">
              The relationships and judgment are yours. Everything else:
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {CAPABILITIES.map((cap, i) => (
              <ScrollReveal key={cap.title} delay={i * 0.06}>
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20 h-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
                  <span className="material-symbols-outlined text-[#D4714E] text-3xl mb-6 block">{cap.icon}</span>
                  <h3 className="font-bold text-[#1A1A18] text-lg mb-3">{cap.title}</h3>
                  <p className="text-[#6B6B65] leading-relaxed text-sm">{cap.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. COMPOUNDING INTELLIGENCE ═══ */}
      <section className="py-32 bg-[#1c1917] text-stone-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl">
            <ScrollReveal>
              <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
                Network Effect
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h2 className="font-headline italic text-5xl md:text-6xl leading-tight mb-8 text-white">
                The platform gets smarter from your own activity
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-xl text-stone-400 leading-relaxed mb-8">
                Your second client&apos;s ValueLens includes industry benchmarks informed by the first client&apos;s data. By your fifth listing, the market intelligence for your region is sharper than anything you could build manually — because you&apos;ve been contributing to and benefiting from the same intelligence engine.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <p className="font-headline italic text-2xl text-stone-500">
                Every deal you run makes <span className="text-stone-300">the next one faster and more accurate.</span>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. PRICING TIERS ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Advisor Plans
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-20 max-w-3xl">
              Your expertise isn&apos;t being replaced. It&apos;s being multiplied.
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {TIERS.map((tier, i) => (
              <ScrollReveal key={tier.title} delay={i * 0.06}>
                <div className={`bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-t-4 ${i === 1 ? 'border-[#D4714E]' : 'border-[#DCC1B9]/30'} h-full flex flex-col transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]`}>
                  <h3 className="font-bold text-[#1A1A18] text-xl">{tier.title}</h3>
                  <span className="font-mono text-3xl text-[#D4714E] font-bold mt-3">{tier.price}</span>
                  <p className="mt-6 text-[#6B6B65] leading-relaxed text-sm flex-1">{tier.desc}</p>
                  <button
                    onClick={() => onChipClick(
                      i === 0 ? "I'm a broker — start my free Advisor Trial" :
                      i === 1 ? 'I want to start Advisor Pro at $299/mo' :
                      'Tell me about Advisor Enterprise options'
                    )}
                    className={`mt-8 w-full py-4 font-bold uppercase text-sm tracking-[0.1em] rounded-xl transition-all duration-300 ${
                      i === 1
                        ? 'bg-[#1A1A18] text-white hover:bg-[#D4714E]'
                        : 'bg-white text-[#1A1A18] border border-[#1A1A18] hover:bg-[#1A1A18] hover:text-white'
                    }`}
                  >
                    {i === 0 ? 'Start Free Trial' : i === 1 ? 'Go Pro' : 'Contact Sales'}
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. CLOSING EDITORIAL ═══ */}
      <section className="py-24 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <p className="font-headline italic text-6xl md:text-7xl text-[#1A1A18]/20 select-none">
              More clients. Better preparation. Deals you used to turn away.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 7. DARK CTA ═══ */}
      <section className="py-32 bg-[#1c1917] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4714E] rounded-full opacity-[0.15] blur-[80px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="font-display italic font-bold text-white text-[48px] md:text-[72px] mb-12">
              Start with your mandate.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => onChipClick("I'm a broker — start my free Advisor Trial")}
                className="bg-white text-[#0c0a09] px-10 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Start with your mandate
              </button>
              <button
                onClick={() => onChipClick('Tell me about advisor plans')}
                className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Message Yulia
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
