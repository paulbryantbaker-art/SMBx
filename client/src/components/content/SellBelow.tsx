import { ScrollReveal } from './animations';

/* ── Data ── */

const SIX_EXITS = [
  { title: 'Full Sale', body: 'Clean exit. Maximize the number. Yulia runs the complete process. 6–18 months.' },
  { title: 'Partner Buyout', body: "One of you wants out. The hard part isn't the valuation — it's the financing, the operating agreement, and keeping the personal relationship intact." },
  { title: 'Capital Raise', body: "Maybe you don't need to sell at all. Debt, equity, SBA expansion — every scenario modeled with what you keep and what you give up." },
  { title: 'ESOP', body: 'Employee ownership with real tax advantages. S-Corp sellers can defer gains under §1042 by reinvesting in qualified replacement property.' },
  { title: 'Majority Sale', body: "Sell 51–80% to PE or a strategic buyer. Take significant cash off the table. Keep skin in the game for the second bite." },
  { title: 'Partial Sale', body: 'Carve out a division. License IP. Sell-leaseback real estate. Creative structures that unlock value without a total exit.' },
];

const DEAL_SIZES = [
  { title: 'Owner-Operated', range: '$300K–$2M SDE', mult: '3.0x–4.5x SDE', body: 'The focused exit. Clean financials for SBA-qualified buyers. Step-by-step, clear language.' },
  { title: 'Established', range: '$2M–$10M EBITDA', mult: '5.0x–7.5x EBITDA', body: 'Strategic acquisitions. Optimized for private equity platform plays. 80% of deals over $5M attract three or more offers.', featured: true },
  { title: 'Institutional', range: '$10M+ EBITDA', mult: '8.0x+ EBITDA', body: 'The sophisticated close. Board-level deliverables. DCF. Arbitrage modeling. Covenant analysis.' },
];

export default function SellBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#fbf9f5] text-[#1b1c1a] selection:bg-[#BA3C60]/20 selection:text-[#1b1c1a] font-body">

      {/* ═══ 1. HERO ═══ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="inline-block px-3 py-1 mb-6 border border-[#BA3C60]/20 rounded-full">
              <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60]">Exit Architecture</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-6xl md:text-[88px] leading-[1.1] text-[#1A1A18] mb-8 max-w-4xl">
              Sell with clarity, not hope.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-start-5 md:col-span-8">
                <p className="text-2xl text-[#55433c] leading-relaxed font-light">
                  The difference between the 75% who regret selling and the 25% who don&apos;t is preparation. Yulia makes sure you&apos;re ready before you sit across the table from anyone.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 2. 75% REGRET EDITORIAL ═══ */}
      <section className="py-24 bg-[#f5f3ef] px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <ScrollReveal>
              <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">EPI Research</span>
              <h2 className="font-bold text-3xl md:text-4xl uppercase tracking-widest leading-tight text-[#1A1A18]">
                75% of owners who sell profoundly regret it within a year.
              </h2>
            </ScrollReveal>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ScrollReveal delay={0.12}>
              <div className="space-y-8 text-lg leading-[1.8] text-[#55433c]">
                <p>Most owners focus on the number. They think a big enough wire transfer cures every ill. It doesn&apos;t. Research from the Exit Planning Institute shows that the vast majority of sellers face deep regret shortly after the deal closes.</p>
                <p>They weren&apos;t financially prepared. They left hundreds of thousands on the table — in add-backs they never identified, in tax structures they never modeled, in competitive processes they never ran. They accepted the first offer because they had no way to know if it was fair.</p>
                <p>They didn&apos;t have a plan for after. Sixty percent had no idea what they were going to do the Monday morning after the wire hit. Their identity was the business. Without it, they were lost.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. VALUELENS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">ValueLens</span>
              <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-6">The question that sits unanswered for years.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="text-lg leading-relaxed text-[#55433c] space-y-6">
                <p>Every owner has had the same moment. Sometimes it&apos;s at 2am. Sometimes it&apos;s when they hear a competitor sold for a number that doesn&apos;t seem possible. The question is always: <em className="text-[#1A1A18] font-medium not-italic">What is my business actually worth?</em></p>
                <p>Yulia gives you that number in ninety seconds. Not a guess — a range built on Census business counts, BLS wage data, SBA lending activity, and transaction multiples from comparable deals.</p>
                <p className="text-[#1A1A18] font-medium">It&apos;s free. It will always be free.</p>
              </div>
            </ScrollReveal>
          </div>
          <div className="order-1 lg:order-2">
            <ScrollReveal delay={0.12}>
              <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-3 h-3 rounded-full bg-[#BA3C60]" />
                  <span className="font-mono text-xs uppercase tracking-tighter opacity-50">ValueLens Preview</span>
                </div>
                <pre className="bg-stone-50 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto text-[#1A1A18]">{`RESIDENTIAL CLEANING · PHOENIX, AZ
----------------------------------
GROSS REVENUE:    $2,450,000
SDE (ADJUSTED):   $680,000
MARKET MULTIPLE:  3.2x - 3.8x

EST. ENTERPRISE VALUE:
$2,176,000 - $2,584,000

*Based on 42 recent sector comps`}</pre>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. ADD-BACK DISCOVERY ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
              <pre className="bg-stone-50 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto text-[#1A1A18]">{`FORENSIC ADD-BACK ANALYSIS
----------------------------------
REPORTED NET:       $410,000

+ OWNER SALARY:     $150,000
+ HEALTH INS:       $18,000
+ AUTO EXPENSE:     $12,500
+ DISCRETIONARY:    $45,000

TRUE SDE:           $635,500
MISSING MULTIPLIER: 3.5x
----------------------------------
VALUE RECOVERED:    $789,250`}</pre>
            </div>
          </ScrollReveal>
          <div>
            <ScrollReveal delay={0.08}>
              <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Financial Forensics</span>
              <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-6">The money your CPA doesn&apos;t know you&apos;re leaving on the table.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-lg leading-relaxed text-[#55433c]">
                Your CPA&apos;s job is to minimize your tax liability. They want your profit to look small. But a buyer pays on earnings before personal expenses. Every dollar missed in your add-backs is multiplied against you in the final sale price.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. TAX ARCHITECTURE ═══ */}
      <section className="py-24 bg-[#f5f3ef] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <ScrollReveal>
                <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Tax Architecture</span>
                <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-6">The deal structure that quietly costs more than any negotiation.</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="text-lg leading-relaxed text-[#55433c] mb-8">
                  A client in San Antonio closed a $2.4M deal. Beautiful number. Then the tax estimate came. She was a C-Corp. The buyer wanted an asset purchase. That meant double taxation. The difference was over $300,000. Yulia models every structure side-by-side before you sign anything.
                </p>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-6">
              <ScrollReveal delay={0.12}>
                <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-4 bg-stone-50 rounded-lg">
                      <div className="font-bold text-[#BA3C60] mb-2">ASSET SALE</div>
                      <div className="space-y-1 opacity-70">
                        <p>Double Taxation Risk</p>
                        <p>Step-up for Buyer</p>
                        <p>Ordinary Income Rates</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#1A1A18] text-white rounded-lg">
                      <div className="font-bold text-[#ffb59c] mb-2">STOCK SALE</div>
                      <div className="space-y-1 opacity-70">
                        <p>Single Level Tax</p>
                        <p>Capital Gains Treatment</p>
                        <p>QSBS Eligibility (1202)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. EXIT PATHWAYS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Exit Pathways</span>
            <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-12">&ldquo;Selling&rdquo; doesn&apos;t mean one thing.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SIX_EXITS.map((exit, i) => (
              <ScrollReveal key={exit.title} delay={i * 0.06}>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform h-full">
                  <h3 className="font-bold text-xl mb-4">{exit.title}</h3>
                  <p className="text-[#55433c] text-sm leading-relaxed">{exit.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. LIVING CIM ═══ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ScrollReveal>
              <div className="relative">
                <div className="bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full aspect-[4/5] bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-stone-400 text-8xl">description</span>
                  </div>
                  <div className="p-6 bg-stone-50 rounded-lg border-l-4 border-[#BA3C60] mt-4">
                    <p className="text-xs font-black tracking-widest uppercase mb-2">Confidential Information Memorandum</p>
                    <p className="font-headline italic text-lg">Prepared for Project Legacy</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <ScrollReveal delay={0.08}>
              <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Living CIM</span>
              <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-6">The document that sells your business — and why it can&apos;t be static.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-lg leading-relaxed text-[#55433c]">
                A traditional CIM is frozen the day it&apos;s published. In a 12-month process, the business keeps moving. You have a strong quarter. You land a new contract. None of it matters because every buyer is reading a document that describes the business as it was, not as it is. Yulia&apos;s Living CIM updates automatically when your financials change — with version control, tiered buyer access, and every view tracked.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 8. THE PROCESS ═══ */}
      <section className="py-24 bg-[#f5f3ef] px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">The Process</span>
            <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-16">How it actually works.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Understand (Free)', body: 'Get your ValueLens number, initial add-back discovery, and Value Readiness Report.' },
              { num: '02', title: 'Optimize', body: 'Correct the deal killers. Maximize add-backs. Improve the metrics that drive your multiple.' },
              { num: '03', title: 'Prepare', body: 'Finalize your Living CIM, tax structure, data room, and buyer targeting.' },
              { num: '04', title: 'Negotiate & Close', body: 'Sit at the table with total situational awareness. Every configuration modeled.' },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.08}>
                <div>
                  <div className="font-mono text-4xl font-bold opacity-10 mb-4">{step.num}</div>
                  <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                  <p className="text-sm text-[#55433c]">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. RISK INTELLIGENCE ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Risk Intelligence</span>
            <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-12">Three things kill more deals than price disagreements.</h2>
          </ScrollReveal>
          <div className="space-y-6">
            {[
              { icon: 'description', title: 'The Lease', body: "If the business depends on its location, the lease has to transfer. Landlord consent is required and is never guaranteed. Yulia flags lease risk the day you start." },
              { icon: 'verified_user', title: 'The Licenses', body: "Liquor licenses in some states take 90+ days. Healthcare certifications take months. Contractor licenses may require the new owner to sit for an exam. Yulia identifies which transfer and how long each takes." },
              { icon: 'gavel', title: 'Reps & Warranties', body: "Every representation is a contingent liability. Environmental for manufacturing. HIPAA for healthcare. Employment classification for contractors. Yulia generates industry-specific preparation." },
            ].map((killer, i) => (
              <ScrollReveal key={killer.title} delay={i * 0.08}>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 flex items-start gap-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                  <span className="material-symbols-outlined text-4xl text-[#BA3C60]">{killer.icon}</span>
                  <div>
                    <h3 className="font-bold text-xl mb-1">{killer.title}</h3>
                    <p className="text-[#55433c] leading-relaxed">{killer.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. FOR ADVISORS ═══ */}
      <section className="py-24 bg-[#eae8e4] px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <ScrollReveal>
            <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">For Advisors</span>
            <h2 className="font-bold text-4xl md:text-5xl uppercase tracking-widest text-[#1A1A18] max-w-2xl mx-auto">Working with a broker? Bring your homework.</h2>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 11. DEAL SIZE CARDS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="text-xs font-black uppercase tracking-widest text-[#BA3C60] block mb-4">Every Deal Size</span>
            <h2 className="font-bold text-4xl uppercase tracking-widest text-[#1A1A18] mb-12">First sale or fifth — Yulia speaks your language.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEAL_SIZES.map((size, i) => (
              <ScrollReveal key={size.title} delay={i * 0.08}>
                <div className={`bg-white p-10 rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${size.featured ? 'scale-105 border-[#BA3C60]/20' : ''}`}>
                  <h3 className="font-bold text-lg uppercase tracking-wider mb-2">{size.title}</h3>
                  <p className="text-[#BA3C60] font-mono text-xl font-bold mb-4">{size.range}</p>
                  <p className="text-sm text-[#55433c]">{size.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 12. DARK CTA ═══ */}
      <section className="bg-[#1A1A18] py-32 px-6 text-white overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <ScrollReveal>
                <h2 className="font-display italic text-5xl md:text-7xl mb-8">The wire hits. And you know.</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="text-xl md:text-2xl opacity-80 leading-relaxed mb-12 max-w-2xl">
                  Not &ldquo;I hope I got a fair deal.&rdquo; The absolute certainty that you left nothing on the table and built something that continues to matter. Architect your exit.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <button
                  onClick={() => onChipClick('I want to sell my business')}
                  className="bg-[#BA3C60] text-white text-lg font-bold px-10 py-5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-3"
                >
                  Tell Yulia about your business
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </ScrollReveal>
            </div>
          </div>
        </div>
        {/* SVG geometric pattern */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,400 L400,0 M100,400 L400,100 M200,400 L400,200 M300,400 L400,300 M0,300 L300,0 M0,200 L200,0 M0,100 L100,0" fill="none" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </section>

    </div>
  );
}
