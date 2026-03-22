import { ScrollReveal, ConversationTyping } from './animations';

const DATA_SOURCES = [
  { source: 'Census Bureau', body: "Business counts by 6-digit NAICS, MSA, and size class. When Yulia says \"847 HVAC businesses in DFW,\" that's verifiable at data.census.gov." },
  { source: 'BLS', body: "Wage benchmarks and employment trends by metro. When she benchmarks your labor costs, it's your MSA — not a national average hiding a 40% variation between markets." },
  { source: 'FRED', body: "Live rates. SBA financing modeled at today's Prime, updated with every Fed decision." },
  { source: 'SEC EDGAR', body: "Public filings, comparable transactions, PE activity. When she identifies fourteen platforms acquiring HVAC in Texas, that's tracked from real filings." },
  { source: 'SBA Lender Activity', body: 'Approval rates, deal sizes, lender preferences by region and industry.' },
  { source: 'IRS SOI', body: 'Industry profitability and deduction patterns. Where the add-back intelligence comes from.' },
];

const SEVEN_LAYERS = [
  { title: 'Industry Structure', body: "Competitive density. Fragmentation vs. consolidation. Who dominates. Who's being acquired." },
  { title: 'Regional Economics', body: 'MSA-level wages, cost of living, business formation, demographics. The local reality national data hides.' },
  { title: 'Financial Normalization', body: 'SDE or EBITDA done properly. Add-backs from IRS benchmarks. Margin benchmarking against your metro.' },
  { title: 'Buyer Landscape', body: "PE platforms, strategic acquirers, SBA individuals, search funds — who's buying in your space right now." },
  { title: 'Deal Architecture', body: 'Structure optimization. SBA bankability. Tax modeling. Earnout design. Purchase price allocation.' },
  { title: 'Risk Assessment', body: 'Customer concentration, owner dependency, key person, regulatory exposure, revenue sustainability.' },
  { title: 'Forward Signals', body: 'Growth projections, wage inflation, rate impacts, regulatory changes, technology disruption. Where the market is heading.' },
];

const CONVO_MESSAGES = [
  { role: 'user' as const, text: 'Thinking about selling my HVAC company. $4.2M revenue, $780K EBITDA. DFW area.' },
  { role: 'assistant' as const, text: 'HVAC in DFW — strong market right now.\n\n$780K EBITDA → current multiples 4.8×–6.2×.\nPreliminary value: $3.74M–$4.84M.\n\n847 HVAC businesses in DFW (Census). Commercial-focused: ~12%. 14 active PE platforms in Texas.\n\nYour margin at 18.6% is below the 21% industry median for DFW. That gap represents ~$101K in potential EBITDA improvement — worth $485K–$626K in additional enterprise value.\n\n[Census 238220 · BLS OES DFW · SBA Q3 2025]' },
];

export default function HowItWorksBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A18] selection:bg-[#D4714E] selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              The Intelligence Engine
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-[48px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-[#1A1A18] max-w-5xl mb-8">
              Bloomberg charges $24,000 a year. You have Google.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="max-w-2xl text-xl md:text-2xl text-[#6B6B65] leading-relaxed font-headline italic">
              The raw data Bloomberg synthesizes is publicly available. Nobody has built that synthesis for deal decisions between $300K and $50M. Until now.
            </p>
          </ScrollReveal>
        </div>
        <div className="absolute -right-20 top-20 w-[600px] h-[600px] bg-[#D4714E]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2. THE INFORMATION DESERT ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-7 space-y-6">
            <ScrollReveal>
              <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
                The Problem
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.06}>
              <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] mb-8">
                That&apos;s the information desert in M&amp;A.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">The largest financial institutions have Bloomberg terminals, PitchBook seats, Capital IQ teams, and armies of analysts who transform raw data into deal decisions.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.14}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">Business owners selling a $3M company? Brokers managing fifteen listings? Search fund operators evaluating two hundred targets? They have Google, gut instinct, and whatever the broker remembers from last year&apos;s deals.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">Here&apos;s the irony: the raw data Bloomberg synthesizes is publicly available. Census Bureau business counts. BLS wage benchmarks. Federal Reserve rates. SEC filings. SBA lending reports. IRS profitability benchmarks.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.22}>
              <p className="text-lg text-[#1A1A18] leading-relaxed font-bold">Sovereign data. Collected by agencies required by law to publish it. Bloomberg built a $27 billion business not on proprietary data — on the synthesis.</p>
            </ScrollReveal>
          </div>
          <div className="md:col-span-5 sticky top-32">
            <ScrollReveal delay={0.15}>
              <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/30">
                <span className="font-mono text-5xl font-bold text-[#D4714E] block mb-2">$27B</span>
                <span className="font-sans uppercase tracking-widest text-xs font-bold text-[#6B6B65]">Bloomberg&apos;s Market Cap</span>
                <p className="text-sm text-[#6B6B65] mt-4 leading-relaxed">Built not on proprietary data — on the synthesis of publicly available sovereign data.</p>
                <div className="mt-8 h-px bg-[#DCC1B9]/30" />
                <div className="mt-8">
                  <span className="font-mono text-4xl font-bold text-[#1A1A18]">$0</span>
                  <p className="font-sans uppercase tracking-widest text-xs mt-2 text-[#6B6B65]">Cost of Raw Data</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. SIX DATA SOURCES ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
              Sovereign Data
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-20 max-w-2xl">
              Six federal sources. One synthesis.
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DATA_SOURCES.map((src, i) => (
              <ScrollReveal key={src.source} delay={i * 0.06}>
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20 h-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
                  <span className="font-mono text-[#D4714E] text-sm block mb-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-[#1A1A18] text-lg mb-3">{src.source}</h3>
                  <p className="text-[#6B6B65] leading-relaxed text-sm">{src.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. SEVEN LAYERS ═══ */}
      <section className="py-32 bg-[#1c1917] text-stone-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mb-24">
            <ScrollReveal>
              <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
                Seven Dimensions
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h2 className="font-headline italic text-5xl md:text-6xl leading-tight mb-8 text-white">
                A real deal analysis isn&apos;t one thing. It&apos;s seven.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-xl text-stone-400 leading-relaxed">
                A deal is seven dimensions that talk to each other. Your competitive density affects your multiple. Your regional wages affect your margins. Change one and everything downstream shifts.
              </p>
            </ScrollReveal>
          </div>
          <div className="space-y-0">
            {SEVEN_LAYERS.map((layer, i) => (
              <ScrollReveal key={layer.title} delay={i * 0.05}>
                <div className="flex gap-8 py-8 border-t border-stone-800 first:border-t-0 items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm font-bold shrink-0 ${
                    i === 0 ? 'bg-[#D4714E] text-white' : 'border border-stone-700 text-stone-400'
                  }`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-2">{layer.title}</h3>
                    <p className="text-stone-400 leading-relaxed">{layer.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.4}>
            <div className="mt-16 pt-8 border-t border-stone-800">
              <p className="font-headline italic text-2xl text-stone-500">
                When Yulia generates a value estimate, <span className="text-stone-300">all seven layers informed it.</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 5. LEAGUE ADAPTATION ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-20">
            <div className="md:w-1/2">
              <ScrollReveal>
                <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
                  Adaptive Depth
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-8 leading-tight">
                  The same question, answered two completely different ways
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#6B6B65] leading-relaxed mb-6">
                  A $400K landscaping company and a $40M manufacturing platform both ask &ldquo;what&apos;s my business worth?&rdquo; If they get the same answer, the answer is wrong for both of them.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <p className="text-lg text-[#1A1A18] leading-relaxed font-bold">
                  The deal determines the depth. You never select it.
                </p>
              </ScrollReveal>
            </div>
            <div className="md:w-1/2 w-full">
              <ScrollReveal delay={0.15}>
                <div className="bg-white rounded-2xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20">
                  <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
                    Adaptive Response
                  </span>
                  <pre className="font-mono text-[13px] leading-[1.8] text-[#6B6B65] bg-[#F5F3EF] rounded-xl p-6 whitespace-pre-wrap">{`CLEANING · PHOENIX · $380K SDE:
"3.0×–3.5× SDE. Range: $1.14M–$1.33M.
SBA financing at this price..."

MANUFACTURING · $12M EBITDA:
"8.5×–11.0× EBITDA. Enterprise value:
$102M–$132M. Three PE platforms active.
LBO scenarios..."`}</pre>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. MSA LOCALIZATION ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Localized Intelligence
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] max-w-3xl mb-8">
              National averages are meaningless in M&amp;A
            </h2>
          </ScrollReveal>
          <div className="max-w-[620px] space-y-6">
            <ScrollReveal delay={0.12}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">A plumbing company in Phoenix and one in rural Pennsylvania: different competitive density, different wages, different buyer pools, different SBA lending, different growth trajectories.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">The Upper Peninsula of Michigan: 25–40% valuation discount compared to Metro Detroit. Same business. Different market.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg text-[#1A1A18] leading-relaxed font-bold">Every number Yulia generates is localized to the MSA. Not the state. The metropolitan statistical area. Because an estimate built on national data gives you the wrong number — and in M&amp;A, the wrong number costs real money.</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 7. CONVERSATION DEMO ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
              Live Demo
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-12 max-w-2xl">
              This took forty-seven seconds.
            </h2>
          </ScrollReveal>
          <div className="max-w-[700px]">
            <ScrollReveal delay={0.16}>
              <ConversationTyping messages={CONVO_MESSAGES} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 8. VS CHATGPT ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-px bg-[#DCC1B9]/20 overflow-hidden rounded-2xl border border-[#DCC1B9]/20">
            <div className="bg-white p-12">
              <ScrollReveal>
                <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-[#6B6B65] mb-8">Generalist LLMs</h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-[#6B6B65]/60">
                    <span className="material-symbols-outlined text-red-500">close</span>
                    <span>Hallucinates financial data when it lacks context.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#6B6B65]/60">
                    <span className="material-symbols-outlined text-red-500">close</span>
                    <span>Cannot model SBA financing at today&apos;s rates.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#6B6B65]/60">
                    <span className="material-symbols-outlined text-red-500">close</span>
                    <span>Gives the same answer to a $400K company and a $40M manufacturer.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#6B6B65]/60">
                    <span className="material-symbols-outlined text-red-500">close</span>
                    <span>Won&apos;t remember your conversation tomorrow.</span>
                  </li>
                </ul>
              </ScrollReveal>
            </div>
            <div className="bg-white p-12">
              <ScrollReveal delay={0.1}>
                <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-[#D4714E] mb-8">smbx.ai</h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-[#1A1A18]">Deterministic financial calculations backed by source docs.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-[#1A1A18]">Live FRED data and current SBA parameters.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-[#1A1A18]">Classifies the deal and adapts methodology, metrics, vocabulary.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-[#1A1A18]">Builds your deal profile over weeks and months.</span>
                  </li>
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. DARK CTA ═══ */}
      <section className="py-32 bg-[#1c1917] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4714E] rounded-full opacity-[0.15] blur-[80px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="font-display italic font-bold text-white text-[48px] md:text-[72px] mb-12">
              See for yourself.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => onChipClick('How does SMBx work?')}
                className="bg-white text-[#0c0a09] px-10 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-transform"
              >
                See for yourself
              </button>
              <button
                onClick={() => onChipClick('I want to talk to Yulia')}
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
