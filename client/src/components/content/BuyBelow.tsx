import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function BuyBelow({ dark }: { dark: boolean }) {

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <span className="inline-block px-3 py-1 bg-[#C4687A]/10 text-[#C4687A] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Buy</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Acquisition Strategy</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
                The best deals never hit the market.{' '}
                <span className="text-[#C4687A]">You need to find them first.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={`space-y-6 text-xl editorial max-w-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>Eighty percent of small businesses that sell never get formally listed. They change hands through whisper networks — a broker mentions it to three people, a CPA tips off a client, a landlord knows the tenant is tired.</p>
                <p className={`font-bold border-l-4 border-[#C4687A] pl-6 text-2xl italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia screens every deal against real market data before you spend a dollar.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5 mt-4">
            <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-6">Your AI deal team</p>
              <div className="space-y-4">
                {[
                  'Screens targets against real market data before you spend a dollar',
                  'Models SBA eligibility, DSCR, and capital structure for every deal',
                  'Maps market density — establishments, comps, and lending velocity',
                  'Generates deal scoring with risk-adjusted return analysis',
                  'Builds your due diligence checklist — 50 to 100 tracked items',
                  'Drafts LOIs with every economic lever modeled',
                  'Models asset allocation to optimize your 5-year tax impact',
                  'Transitions you to a 180-day owner integration plan at close',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#C4687A] text-lg shrink-0 mt-0.5">check_circle</span>
                    <p className="text-sm text-[#dadadc]/90">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/60 italic">The only thing you do yourself is decide which deal to pursue and sign your name.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WHAT YULIA DOES ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="mb-12">
                <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">What Yulia Does</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Everything a $50K search fund advisor delivers. At a fraction of the cost.</h2>
                <p className="text-lg text-[#dadadc]/60 max-w-2xl">The screening, the modeling, the diligence coordination, the deal structuring. Yulia does all of it. You focus on the decisions that matter.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'monitoring', title: 'Deal screening & underwriting', desc: 'Every target screened against Census NAICS data, BLS wage benchmarks, SBA lending velocity, and transaction comps. Not opinions. Sovereign data.' },
                  { icon: 'map', title: 'Market mapping & density', desc: "Establishment counts, competitive density, growth trends, and listing-to-business ratios by MSA. Know exactly what you're walking into before you make a single call." },
                  { icon: 'account_balance', title: 'SBA bankability modeling', desc: 'DSCR analysis, down payment scenarios, debt service projections, and eligibility screening — modeled before you write the LOI, not after.' },
                  { icon: 'checklist', title: 'Due diligence coordination', desc: 'QofE coordination. Customer concentration. Employee dependency. Technology risk. A 50–100 item DD checklist tracked to completion with deadline alerts.' },
                  { icon: 'gavel', title: 'LOI & deal structuring', desc: 'Purchase price, earnout terms, working capital peg, exclusivity period, seller financing — every economic lever modeled with the math to support it.' },
                  { icon: 'sync', title: 'Post-acquisition integration', desc: "180-day integration plan from Day 0. Knowledge transfer framework. Performance tracking against deal projections. You don't just close — you land." },
                ].map((card) => (
                  <div key={card.title} className="bg-white/5 rounded-2xl border border-white/10 p-8">
                    <span className="material-symbols-outlined text-[#C4687A] text-3xl mb-4">{card.icon}</span>
                    <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                    <p className="text-sm text-[#dadadc]/70">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. ACQUISITION PROCESS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Your Acquisition Process</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Six stages. Yulia manages every one.</h2>
              <p className={`font-bold text-xl border-l-4 border-[#C4687A] pl-6 italic mb-8 ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>You don't need to know the process. You just need to show up for the decisions.</p>
              <p className={dark ? 'text-[#dadadc]/80 leading-relaxed' : 'text-[#5d5e61] leading-relaxed'}>From your first conversation to 180 days after close, every step has specific completion triggers. Yulia advances you when the prerequisite work is done — and not before.</p>
            </ScrollReveal>
            <StaggerContainer className="lg:col-span-7 space-y-4">
              {[
                { num: '1', title: 'Define your thesis', desc: "Tell Yulia what you're looking for — the industry, the geography, the size, the economics. She builds your acquisition criteria and target profile from a conversation.", free: true },
                { num: '2', title: 'Source targets', desc: 'Proprietary deal flow. Yulia maps the full market landscape — establishment counts, competitive density, average deal multiples, SBA lending velocity — and screens targets against real data.', free: true },
                { num: '3', title: 'Underwrite the deal', desc: 'Full financial modeling. SBA bankability. DSCR analysis. Sensitivity scenarios. Capital structure optimization. Every number modeled before you make an offer.' },
                { num: '4', title: 'Run due diligence', desc: 'QofE coordination. Customer concentration. Employee dependency. Technology risk. Working capital analysis. A 50–100 item checklist tracked to completion.' },
                { num: '5', title: 'Structure and close', desc: 'LOI drafting with every economic lever. Asset allocation optimization. Purchase agreement review. Closing checklist. Funds flow coordination.' },
                { num: '6', title: 'Integrate and grow', desc: '180-day post-close integration plan. Knowledge transfer framework. Performance tracking against deal projections. Day 0 operational playbook.' },
              ].map((step) => (
                <StaggerItem key={step.num}>
                  <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${step.free ? 'bg-[#006630]/10 text-[#006630]' : 'bg-[#C4687A]/10 text-[#C4687A]'}`}>{step.num}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{step.title}</h4>
                        {step.free && <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]'}`}>FREE</span>}
                      </div>
                      <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{step.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 4. BUYER TYPE INTELLIGENCE ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Buyer Intelligence</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Whether it's your first deal or your fifteenth</h2>
              <p className={`text-lg max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Yulia adapts her entire analytical framework to your buyer profile — different data, different tools, different depth.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { type: 'First-Time Buyer', icon: 'person', desc: "You've got capital and conviction but no deal experience. Yulia walks you through every step — SBA mechanics, LOI terms, DD scope — in plain language. No jargon until you ask for it." },
              { type: 'Search Funder', icon: 'search', desc: 'Institutional-grade deal screening, financial modeling, and LP reporting throughout the search — built for the pace and rigor your investors expect.' },
              { type: 'Serial Acquirer', icon: 'stacks', desc: "You know what you're doing. You need speed. Yulia screens 50 targets in the time it takes to read one deal package. She flags what matters and ignores what doesn't." },
              { type: 'PE Platform', icon: 'corporate_fare', desc: 'Thesis-driven target screening, add-back validation, synergy modeling, and portfolio-level pipeline management at the speed your deal cadence demands.' },
            ].map((card) => (
              <StaggerItem key={card.type}>
                <div className={`p-8 rounded-2xl h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#C4687A] text-3xl mb-4">{card.icon}</span>
                  <h3 className="font-headline font-bold text-xl mb-3">{card.type}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal delay={0.2}>
            <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#C4687A]/10 border border-[#C4687A]/20' : 'bg-[#C4687A]/5 border border-[#C4687A]/15'}`}>
              <span className="material-symbols-outlined text-[#C4687A] text-2xl shrink-0 mt-1">add_circle</span>
              <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>+5 more buyer profiles</span> — family office, ETA through acquisition, roll-up operator, strategic corporate acquirer, and international buyer. Yulia adapts to each.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 5. DEAL ECONOMICS ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl overflow-hidden text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Financial Breakdown */}
                <div className="lg:col-span-7 p-10 md:p-16">
                  <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Deal Economics</span>
                  <h2 className="text-4xl font-headline font-black tracking-tight mb-4">The math behind the deal</h2>
                  <p className="text-lg text-[#dadadc]/60 mb-10 max-w-lg">Yulia models every scenario — SBA eligibility, capital structure, cash flow projections — before you make an offer.</p>
                  <div className="mb-6">
                    <p className="text-xs text-[#dadadc]/60 uppercase tracking-widest font-bold">SBA Bankability</p>
                    <p className="font-headline font-bold text-xl mt-1">HVAC · Dallas-Fort Worth</p>
                  </div>
                  <div className="space-y-3 mb-8">
                    {[
                      ['Purchase Price', '$2,016,000'],
                      ['Down Payment (10%)', '$201,600'],
                      ['SBA 7(a) Loan', '$1,814,400'],
                      ['Annual Debt Service', '$248,000'],
                      ['Adjusted SDE', '$480,000'],
                      ['DSCR', '1.94×'],
                    ].map(([label, amount]) => (
                      <div key={label} className="flex justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-[#dadadc]/80">{label}</span>
                        <span className="font-bold text-[#8ff9a8]">{amount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#006630]/20 border border-[#006630]/30 p-5 rounded-xl text-center">
                    <span className="material-symbols-outlined text-[#8ff9a8] text-2xl block mb-1">check_circle</span>
                    <p className="text-[#8ff9a8] font-bold">SBA ELIGIBLE</p>
                    <p className="text-[#dadadc]/60 text-xs mt-1">DSCR clears minimum by 0.69× — strong margin of safety</p>
                  </div>
                </div>
                {/* Right: Wealth Creation */}
                <div className="lg:col-span-5 bg-[#C4687A] p-10 md:p-16 flex flex-col justify-center">
                  <p className="text-white/80 uppercase tracking-widest text-xs font-bold mb-8">5-Year Wealth Creation</p>
                  <div className="space-y-6">
                    {[
                      { label: 'Year 1 owner compensation', value: '$232,000' },
                      { label: 'Years 1–5 cumulative cash flow', value: '$1.16M' },
                      { label: 'Equity value at exit (3.2×)', value: '$1.85M' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-white/80 text-xs uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="font-headline font-black text-3xl">{item.value}</p>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-white/20">
                      <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Total 5-year wealth creation</p>
                      <p className="font-headline font-black text-5xl tracking-tight">$3.01M</p>
                      <p className="text-white/80 text-sm mt-2">14.9× return on $201,600 down payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. NEGOTIATION ADVANTAGE ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Negotiation Intelligence</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Every offer backed by data. Every structure modeled.</h2>
              <p className={`leading-relaxed editorial ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most buyers negotiate on instinct. Yulia negotiates on comparable transaction data — real multiples, real structures, real outcomes from deals in your sector and geography. She drafts every communication and models the tax impact of every counter-offer before you send it.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: 'analytics', title: 'Market Comps', desc: "Real transaction data from your sector and MSA — not rules of thumb or broker opinions. Actual multiples. Actual deal structures." },
                  { icon: 'balance', title: 'Working Capital Peg', desc: "Trailing 12-month average vs. seller's proposed peg. The difference is often $40K–$80K in your pocket at close." },
                  { icon: 'speed', title: 'Earnout Structure', desc: 'Risk allocation tied to performance milestones. Yulia models expected value under 3 scenarios — base, upside, downside.' },
                  { icon: 'receipt_long', title: 'Asset Allocation', desc: 'Tax-optimized purchase price allocation across equipment, goodwill, non-compete, and customer lists. The 5-year difference can be $100K+.' },
                ].map((factor) => (
                  <div key={factor.title} className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <span className="material-symbols-outlined text-[#C4687A] text-xl mb-2">{factor.icon}</span>
                    <h4 className="font-bold text-sm mb-1">{factor.title}</h4>
                    <p className={`text-xs ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{factor.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 7. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95]">Sell. Buy. Raise.<br/><span className="text-[#C4687A]">Talk to Yulia.</span></h2>
                <p className="text-lg text-[#dadadc]/60 mt-4">Tell her what you're looking for. She'll show you what the market actually looks like — and what comes next. Free, no account required.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={handleCTA} className="px-10 py-5 bg-gradient-to-r from-[#C4687A] to-[#E09098] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Talk to Yulia</button>
                <p className="text-xs text-[#dadadc]/70">Free screening · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
