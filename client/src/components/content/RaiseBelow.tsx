import { ScrollReveal } from './animations';

const CAPITAL_OPTIONS = [
  { title: 'Revenue-Based Financing', body: 'No dilution. Payments flex with revenue. 1.3×–2.0× repayment cap.' },
  { title: 'SBA Expansion', body: 'Keep 100%. 9.75%–12.25%. Up to $5M.' },
  { title: 'Equity', body: 'Dilution modeled through this round and two future rounds. Option pool impact. Liquidation waterfall.' },
  { title: 'Strategic Partnership', body: 'Capital plus capabilities. Less dilutive, more governance complexity.' },
  { title: 'Mezzanine', body: 'For businesses with $2M+ EBITDA. 12–20%. Non-dilutive financing for mature structures.' },
];

const PITCH_ITEMS = [
  'Pitch Deck',
  'Financial Model',
  'Cap Table',
  'Waterfall Analysis',
  'Use of Funds',
  'Investor Targeting',
];

const TERM_CARDS = [
  { title: 'Liquidation Prefs', body: "Does the investor get their money back before you see a dollar? 1x? 2x?" },
  { title: 'Anti-Dilution', body: 'Protecting investor ownership during down rounds at founder expense.' },
  { title: 'Participation Rights', body: "Double-dipping during an exit. Knowing the difference is millions." },
];

export default function RaiseBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A18] selection:bg-[#D4714E] selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Capital Architecture
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-[48px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-[#1A1A18] mb-8">
              Growth funded,<br />on your terms
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="max-w-2xl text-xl md:text-2xl text-[#6B6B65] leading-relaxed font-headline italic">
              A 5% difference in dilution today is a $2.5 million difference at exit. Yulia models every structure so you know exactly what you&apos;re giving up.
            </p>
          </ScrollReveal>
        </div>
        <div className="absolute -right-20 top-20 w-[600px] h-[600px] bg-[#D4714E]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2. DILUTION MATH ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-8 space-y-8 text-lg leading-relaxed text-[#6B6B65]">
              <ScrollReveal>
                <p>I&apos;ve watched founders lose millions of dollars at exit because of decisions they made in their first term sheet — decisions they didn&apos;t fully understand at the time.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.06}>
                <p>A $2M raise at a $10M pre-money valuation gives up 17%. The same raise at $15M pre-money: 12%. That 5% gap, over a five-year trajectory ending at a $50M exit, is $2.5 million.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p>The complicated part is everything else in the term sheet. Liquidation preferences — does the investor get their money back before you see a dollar, and is it 1× or 2×? Anti-dilution provisions — if you raise a down round, does the investor&apos;s ownership get protected at your expense? Board seats. Drag-along rights.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.18}>
                <p>These terms compound silently. They surface violently at exactly the moments that matter.</p>
              </ScrollReveal>
              <ScrollReveal delay={0.24}>
                <p className="font-bold text-[#1A1A18]">Most founders negotiate their first term sheet against investors who&apos;ve drafted hundreds. The information asymmetry is staggering. Yulia levels it.</p>
              </ScrollReveal>
            </div>
            <div className="md:col-span-4 sticky top-32">
              <ScrollReveal delay={0.15}>
                <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/30 space-y-12">
                  <div>
                    <span className="font-mono text-5xl font-bold text-[#D4714E]">5%</span>
                    <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Dilution Gap</p>
                  </div>
                  <div className="h-px bg-[#DCC1B9]/30 w-full" />
                  <div>
                    <span className="font-mono text-4xl font-bold text-[#1A1A18]">$2.5M</span>
                    <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Value at Exit</p>
                  </div>
                  <div className="bg-[#E2E2E2] p-4 rounded-lg">
                    <pre className="font-mono text-[10px] text-[#55433C] leading-tight whitespace-pre">{`// SENSITIVITY_ANALYSIS
{
 "exit_valuation": 50000000,
 "equity_delta": 0.05,
 "founder_impact": -2500000
}`}</pre>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. CAPITAL OPTIONS ═══ */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Capital Structures
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-20 max-w-2xl">
              Every option modeled. Every trade-off visible.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CAPITAL_OPTIONS.slice(0, 3).map((opt, i) => (
              <ScrollReveal key={opt.title} delay={i * 0.06}>
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] h-full flex flex-col">
                  <span className="font-mono text-[#D4714E] text-sm block mb-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-[#1A1A18] text-xl mb-4">{opt.title}</h3>
                  <p className="text-[#6B6B65] leading-relaxed text-base flex-1">{opt.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <ScrollReveal delay={0.18}>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] h-full flex flex-col md:col-span-1">
                <span className="font-mono text-[#D4714E] text-sm block mb-6">04</span>
                <h3 className="font-bold text-[#1A1A18] text-xl mb-4">{CAPITAL_OPTIONS[3].title}</h3>
                <p className="text-[#6B6B65] leading-relaxed text-base flex-1">{CAPITAL_OPTIONS[3].body}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.24}>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] h-full flex flex-col md:col-span-2">
                <span className="font-mono text-[#D4714E] text-sm block mb-6">05</span>
                <h3 className="font-bold text-[#1A1A18] text-xl mb-4">{CAPITAL_OPTIONS[4].title}</h3>
                <p className="text-[#6B6B65] leading-relaxed text-base flex-1">{CAPITAL_OPTIONS[4].body}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. PITCH DECK ═══ */}
      <section className="py-32 bg-[#F5F3EF] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="md:w-1/2">
              <ScrollReveal>
                <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-8 leading-tight">
                  Your pitch deck gets sixty seconds before the next one
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="text-lg text-[#6B6B65] leading-relaxed mb-6">
                  Investors see hundreds of pitches. The ones that get past the first minute have one thing in common: the materials make the investor&apos;s decision easy. Clear story. Defensible numbers. Specific ask. Assumptions documented.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">
                  Yulia builds the complete package from your actual data. Pitch deck — 12 slides. Financial model — three-statement, sensitivity analysis. Cap table — through future rounds, with waterfall.
                </p>
              </ScrollReveal>
            </div>
            <div className="md:w-1/2 w-full">
              <ScrollReveal delay={0.15}>
                <div className="bg-[#1c1917] p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <span className="material-symbols-outlined text-[#D4714E] text-4xl">description</span>
                  </div>
                  <h4 className="text-white font-bold text-2xl mb-8">The Complete Package</h4>
                  <ul className="space-y-5">
                    {PITCH_ITEMS.map((item) => (
                      <li key={item} className="flex items-center text-white/80 gap-4">
                        <div className="w-6 h-6 rounded-full border border-[#D4714E] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px] text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                        <span className="font-mono text-sm tracking-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#D4714E]/20 rounded-full blur-3xl" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. TERM SHEET ANALYSIS ═══ */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-12 max-w-4xl mx-auto">
              The terms that compound silently and surface violently
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl leading-relaxed text-[#6B6B65] mb-16">
                Liquidation preferences, anti-dilution ratchets, and participation rights aren&apos;t just legal boilerplate. They determine who gets paid when things go well, and who gets protected when they don&apos;t. We analyze every clause to show you the long-term impact on your equity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left bg-[#F5F3EF] p-12 rounded-2xl border border-[#DCC1B9]/30">
                {TERM_CARDS.map((card) => (
                  <div key={card.title}>
                    <h5 className="font-bold text-[#1A1A18] mb-3">{card.title}</h5>
                    <p className="text-sm text-[#6B6B65]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 6. CLOSING EDITORIAL ═══ */}
      <section className="py-24 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <p className="font-headline italic text-6xl md:text-7xl text-[#1A1A18]/20 select-none">
              Growth funded. On your terms.
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
              Architect your raise.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => onChipClick('I want to raise capital')}
                className="bg-white text-[#0c0a09] px-10 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Get Started Now
              </button>
              <button
                onClick={() => onChipClick('I need help structuring a raise')}
                className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Book Strategy Call
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
