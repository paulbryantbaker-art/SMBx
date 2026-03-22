import { ScrollReveal } from './animations';

/* ── Data used in rendered cards / tables ── */

const INTEL_METRICS = [
  { label: 'Adjusted DSCR', value: '1.85x', accent: true },
  { label: 'SBA Eligibility', value: 'HIGH', accent: false },
  { label: 'Risk Factor', value: 'LOW', accent: false },
  { label: 'Valuation Score', value: '84/100', accent: false },
];

const TAX_ROWS = [
  { year: '01', amort: '$200,000', shield: '$74,000', impact: '+$74,000' },
  { year: '02', amort: '$200,000', shield: '$74,000', impact: '+$74,000' },
  { year: '03', amort: '$200,000', shield: '$74,000', impact: '+$74,000' },
  { year: '04', amort: '$200,000', shield: '$74,000', impact: '+$74,000' },
  { year: '05', amort: '$200,000', shield: '$74,000', impact: '+$74,000' },
];

const LOI_CARDS = [
  { title: 'Working Capital Peg', icon: 'balance', body: "This is the number that catches buyers off guard at closing. Set wrong, a working capital adjustment can shift $50K–$200K without changing the headline price. Yulia flags the methodology, the target, and models what happens when actuals differ from the peg." },
  { title: 'Earnout Provisions', icon: 'trending_up', body: "In my experience, earnouts are the single most litigated provision in acquisition agreements. They're designed to look achievable and are frequently structured to favor the party that drafted them. Yulia dissects the trigger mechanics before you sign." },
  { title: 'Indemnification Escrow', icon: 'security', body: "Typically 10–15% of the purchase price, locked up for 12–24 months. That's the buyer's insurance against your representations being wrong. Yulia benchmarks the cap, basket, and survival periods against market norms for your deal size." },
  { title: 'Reps & Warranties', icon: 'description', body: "Every representation is a contingent liability. Environmental for manufacturing. HIPAA for healthcare. Employment classification for businesses that use contractors. Yulia identifies what's standard and what's overreach." },
];

const TIMELINE = [
  { num: '01', title: 'Deal Sourcing & Intelligence', body: 'Scrubbing listings, normalizing financials, and identifying structural SBA eligibility. Every deal scored against your thesis before you spend a minute on it.' },
  { num: '02', title: 'LOI Formulation', body: 'Structuring the offer with appropriate working capital pegs, indemnity escrows, and tax-optimized deal configurations.' },
  { num: '03', title: 'Confidential Due Diligence', body: 'QofE, phase 1 environmental reports, deep forensic ledger analysis. Every finding scored: minor, major, deal-breaker.' },
  { num: '04', title: 'Debt Syndication', body: 'Finalizing SBA or conventional financing packages with preferred lenders at live rates.' },
  { num: '05', title: 'Closing & Integration', body: 'Final funds flow, title transfer, and the first 100 days of post-acquisition management.' },
];

const BUYER_TYPES = [
  { title: 'First-Time SBA', body: "If this is your first acquisition, you deserve the same analytical quality that PE firms get. No jargon. Step-by-step, with Yulia explaining every decision point as you reach it." },
  { title: 'Search Fund / ETA', body: "More than half of searchers never close a deal. The analytical work to build conviction takes longer than the timeline allows. Yulia scores every target against your thesis automatically." },
  { title: 'PE Platform / Bolt-On', body: "$530 billion in dry powder aged 2+ years. The bottleneck isn't capital — it's deal-team bandwidth. Feed Yulia a CIM and get a deal screening report in forty minutes." },
  { title: 'Strategic Acquirer', body: "The difference between real operational synergies and the aspirational kind. Integration complexity. Structure optimization. Value creation modeling that starts before close." },
];

export default function BuyBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#fbf9f5] text-[#1b1c1a] selection:bg-[#BA3C60]/20 selection:text-[#1b1c1a] font-body">

      {/* ═══ 1. HERO ═══ */}
      <section className="py-24 md:py-32 max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-8">
            <ScrollReveal>
              <span className="inline-block text-[#BA3C60] font-bold uppercase tracking-[0.2em] text-xs mb-6">
                Acquisition Intelligence
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-display italic font-bold text-6xl md:text-[88px] leading-[0.95] text-[#1b1c1a] mb-8">
                The deal that looked perfect on paper
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-2xl md:text-3xl font-headline italic text-[#55433c] max-w-2xl">
                In this market, the most expensive mistake isn&apos;t overpaying. It&apos;s time. Good businesses receive multiple offers within thirty days. Get to the truth faster.
              </p>
            </ScrollReveal>
          </div>
          <div className="col-span-12 md:col-span-4 pb-4">
            <ScrollReveal delay={0.25}>
              <button
                onClick={() => onChipClick('I have a listing I want analyzed')}
                className="w-full md:w-auto bg-[#BA3C60] text-white px-8 py-4 rounded-md font-bold uppercase text-sm tracking-widest hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_24px_rgba(186,60,96,0.15)]"
              >
                Analyze a Listing
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 2. PATTERN RECOGNITION ═══ */}
      <section className="py-32 bg-[#f5f3ef]">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-12 gap-12 items-start">
          <div className="col-span-12 md:col-span-8">
            <ScrollReveal>
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-[#1b1c1a] mb-12">
                Pattern Recognition
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="space-y-8">
                <p className="text-3xl md:text-4xl font-headline italic leading-snug text-[#1b1c1a]">
                  Three weeks. Forty hours. Several thousand in fees. On a deal that was never going to work.
                </p>
                <div className="text-lg text-[#55433c] leading-relaxed max-w-xl space-y-6">
                  <p>A buyer finds a listing. The revenue looks strong. The margins look healthy. The asking price seems reasonable. They get excited. They email the broker. They sign the NDA. They start spending time — and money — on diligence.</p>
                  <p>Three weeks in, something surfaces. The SDE was inflated by $150K in add-backs the seller padded. Or the DSCR doesn&apos;t clear 1.25× at current SBA rates. Or there are 2,300 competitors in the MSA.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-12 rounded-2xl shadow-[0_4px_24px_rgba(27,28,26,0.06)] border border-[#dcc1b9]/20 self-center">
            <ScrollReveal delay={0.16}>
              <div className="text-center">
                <div className="font-mono text-7xl text-[#BA3C60] font-bold mb-2">40hrs</div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1b1c1a]">Wasted Per Bad Deal</div>
                <div className="mt-8 pt-8 border-t border-[#dcc1b9]/30 text-sm text-[#55433c] italic">
                  &ldquo;The delta between a listing and reality often costs more than the down payment.&rdquo;
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. DEAL SCORING ═══ */}
      <section className="py-32 bg-[#fbf9f5]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-16 items-center">
            {/* Chat mockup */}
            <div className="col-span-12 md:col-span-5 md:order-1">
              <ScrollReveal>
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(27,28,26,0.06)] space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#BA3C60] flex items-center justify-center text-white text-[10px] font-bold shrink-0">YOU</div>
                    <div className="bg-[#f5f3ef] p-4 rounded-xl rounded-tl-none text-sm text-[#55433c] leading-relaxed">
                      Analyze this Austin Dental Practice. Listing says $1.2M EBITDA.
                    </div>
                  </div>
                  <div className="flex items-start gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-sm">bolt</span>
                    </div>
                    <div className="bg-[#BA3C60] text-white p-4 rounded-xl rounded-tr-none text-sm leading-relaxed">
                      Found $240k in owner add-backs that don&apos;t meet SBA SOP 50 10. Revised DSCR: 1.85x. Listing is overpriced by 18%.
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Intel report */}
            <div className="col-span-12 md:col-span-7 md:order-2">
              <ScrollReveal delay={0.08}>
                <h2 className="text-5xl md:text-6xl font-display italic text-[#1b1c1a] mb-8">
                  Paste any listing.<br />Get the truth in seconds.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <div className="bg-[#f5f3ef] p-10 rounded-2xl">
                  <div className="font-mono text-xs text-[#BA3C60] mb-4 tracking-widest font-bold">INTEL REPORT · V11.1</div>
                  <div className="font-mono text-xl mb-8 border-b border-[#dcc1b9]/30 pb-4 text-[#1b1c1a]">DENTAL PRACTICE · AUSTIN, TX</div>
                  <div className="grid grid-cols-2 gap-8">
                    {INTEL_METRICS.map((m) => (
                      <div key={m.label}>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#55433c] mb-1">{m.label}</div>
                        <div className={`font-mono text-3xl font-bold ${m.accent ? 'text-[#BA3C60]' : 'text-[#1b1c1a]'}`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. SBA RULES ═══ */}
      <section className="py-32 bg-[#f5f3ef]">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-12 gap-16 items-center">
          <div className="col-span-12 md:col-span-6">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-headline italic text-[#1b1c1a] mb-8 leading-tight">
                The SBA rules changed in June 2025.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="text-lg text-[#55433c] space-y-6 leading-relaxed">
                <p>SOP 50 10 8 changed the game. Seller notes used as equity injection must now sit on full standby for the entire loan term. Equity injection is back to 10% minimum. Credit score floor rose to 165.</p>
                <p>Yulia automatically maps every deal against the latest lending mandates, ensuring your LOI doesn&apos;t get rejected at the bank.</p>
              </div>
            </ScrollReveal>
          </div>
          <div className="col-span-12 md:col-span-6">
            <ScrollReveal delay={0.12}>
              <div className="relative">
                <div className="absolute -top-4 -left-4 bg-[#BA3C60] text-white text-[10px] font-bold px-3 py-1 rounded-sm z-10 tracking-widest">SOP 50 10 8 COMPLIANCE</div>
                <div className="bg-white p-12 rounded-2xl shadow-[0_4px_24px_rgba(27,28,26,0.06)] border border-[#dcc1b9]/10">
                  <div className="flex flex-col gap-6">
                    {[
                      ['Seller Equity Rollover', 'PERMITTED (10%)', true],
                      ['Insurance Requirement', 'WAIVED < $500K', false],
                      ['Debt Service Coverage', '1.15x MINIMUM', false],
                      ['Working Capital Inclusion', 'YES', true],
                    ].map(([label, value, accent], i) => (
                      <div key={i} className={`flex justify-between items-center py-4 ${i < 3 ? 'border-b border-[#dcc1b9]/20' : ''}`}>
                        <span className="text-xs font-black uppercase tracking-widest">{label as string}</span>
                        <span className={`font-mono font-bold ${accent ? 'text-[#BA3C60]' : 'text-[#1b1c1a]'}`}>{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. MARKET INTELLIGENCE ═══ */}
      <section className="py-32 bg-[#fbf9f5]">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-12 gap-16 items-center">
          <div className="col-span-12 md:col-span-6 md:order-2">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-headline italic text-[#1b1c1a] mb-8 leading-tight">
                847 HVAC companies in Dallas. What does that mean?
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="text-lg text-[#55433c] space-y-6 leading-relaxed">
                <p>That&apos;s a Census number. NAICS 238220 in the Dallas-Fort Worth MSA. But a number by itself doesn&apos;t tell you anything useful. Is 847 fragmented enough to consolidate? Are fourteen PE platforms actively acquiring HVAC in Texas?</p>
                <p>We analyze hyper-local market density and labor availability for every zip code in the continental US.</p>
              </div>
            </ScrollReveal>
          </div>
          <div className="col-span-12 md:col-span-6 md:order-1">
            <ScrollReveal delay={0.12}>
              <div className="bg-[#f5f3ef] p-1 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(27,28,26,0.06)]">
                <div className="p-8 bg-white rounded-xl">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <div className="text-xs font-bold text-[#BA3C60] uppercase tracking-widest mb-1">Local Intelligence</div>
                      <div className="font-headline italic text-2xl">HVAC · Dallas-Fort Worth MSA</div>
                    </div>
                    <span className="material-symbols-outlined text-[#BA3C60]">location_on</span>
                  </div>
                  <div className="space-y-6">
                    {[
                      ['Market Density', 82, true],
                      ['Labor Availability', 45, false],
                      ['Growth Velocity', 94, true],
                    ].map(([label, pct, accent]) => (
                      <div key={label as string} className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#55433c]">{label as string}</span>
                        <div className="w-1/2 h-2 bg-[#eae8e4] rounded-full overflow-hidden">
                          <div className={`h-full ${accent ? 'bg-[#BA3C60]' : 'bg-[#5e5e5e]'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 6. TAX SHIELD — Dark ═══ */}
      <section className="py-32 bg-stone-900 text-stone-100">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 md:col-span-5">
              <ScrollReveal>
                <span className="text-[#BA3C60] font-bold uppercase tracking-[0.2em] text-xs mb-6 inline-block">Asset Allocation</span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <h2 className="text-4xl md:text-5xl font-headline italic leading-tight mb-8">
                  The acquisition tax benefit that changes the return math.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-stone-400 text-lg leading-relaxed">
                  Under Section 197, intangible assets — including goodwill — are amortizable over 15 years. For an asset sale, this creates a significant non-cash expense that shields operating income, drastically increasing your after-tax cash flow.
                </p>
              </ScrollReveal>
            </div>
            <div className="col-span-12 md:col-span-7">
              <ScrollReveal delay={0.16}>
                <div className="bg-stone-800 p-10 rounded-2xl border border-stone-700">
                  <div className="font-mono text-xs text-[#BA3C60] mb-8 tracking-widest uppercase">5-Year Depreciation Shield Est. ($3M Acquisition)</div>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-sm">
                      <thead>
                        <tr className="text-stone-500 border-b border-stone-700">
                          <th className="text-left py-4 font-normal">YEAR</th>
                          <th className="text-right py-4 font-normal">ASSET AMORT</th>
                          <th className="text-right py-4 font-normal">TAX SHIELD</th>
                          <th className="text-right py-4 font-normal">CASH IMPACT</th>
                        </tr>
                      </thead>
                      <tbody className="text-stone-300">
                        {TAX_ROWS.map((row, i) => (
                          <tr key={row.year} className={i < TAX_ROWS.length - 1 ? 'border-b border-stone-700/50' : ''}>
                            <td className="py-4">{row.year}</td>
                            <td className="text-right">{row.amort}</td>
                            <td className="text-right">{row.shield}</td>
                            <td className="text-right text-[#BA3C60]">{row.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. LOI TERMS ═══ */}
      <section className="py-32 bg-[#fbf9f5]">
        <div className="max-w-[1200px] mx-auto px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-display italic mb-6">The LOI is 3–5 pages.</h2>
              <p className="text-[#55433c] max-w-xl mx-auto">Everyone focuses on the purchase price. The terms that actually determine your net outcome are on the pages nobody reads carefully enough.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {LOI_CARDS.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.06}>
                <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(27,28,26,0.06)] hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="text-[#BA3C60] mb-6">
                    <span className="material-symbols-outlined text-4xl">{card.icon}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-4">{card.title}</h3>
                  <p className="text-[#55433c] leading-relaxed">{card.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. ACQUISITION LIFECYCLE — Dark Timeline ═══ */}
      <section className="py-32 bg-stone-950 text-stone-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BA3C60]/5 blur-[120px] rounded-full" />
        <div className="max-w-[1000px] mx-auto px-8 relative z-10">
          <ScrollReveal>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-20 text-center">Acquisition Lifecycle</h2>
          </ScrollReveal>
          <div className="space-y-16">
            {TIMELINE.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.08}>
                <div className="flex gap-12 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[#BA3C60] flex items-center justify-center font-mono font-bold text-[#BA3C60]">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2 tracking-wide">{step.title}</h3>
                    <p className="text-stone-400">{step.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. BUYER TYPES ═══ */}
      <section className="py-32 bg-[#f5f3ef]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUYER_TYPES.map((type, i) => (
              <ScrollReveal key={type.title} delay={i * 0.06}>
                <div className="bg-[#fbf9f5] p-8 rounded-xl border border-[#dcc1b9]/20 h-full flex flex-col hover:-translate-y-1 transition-all duration-300">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#BA3C60] mb-4">{type.title}</h4>
                  <p className="text-sm text-[#55433c] leading-relaxed">{type.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. CTA — Light with blur orb ═══ */}
      <section className="py-32 bg-[#fbf9f5] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BA3C60]/10 blur-[120px] rounded-full" />
        <div className="max-w-[1200px] mx-auto px-8 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-6xl md:text-7xl font-display italic mb-12 text-[#1b1c1a]">Find the right deal.</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onChipClick('I want to buy a business')}
                className="bg-[#BA3C60] text-white px-10 py-5 rounded-md font-bold uppercase text-sm tracking-widest shadow-[0_4px_24px_rgba(186,60,96,0.15)] hover:scale-[1.02] transition-all"
              >
                Start Searching
              </button>
              <button
                onClick={() => onChipClick('I have a listing I want analyzed')}
                className="bg-transparent text-[#BA3C60] px-10 py-5 rounded-md font-bold uppercase text-sm tracking-widest border border-[#BA3C60]/20 hover:bg-[#BA3C60]/5 transition-all"
              >
                Analyze a Listing
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
