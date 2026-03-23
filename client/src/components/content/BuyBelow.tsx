import { useDarkMode, DarkModeToggle } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function BuyBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <ScrollReveal y={40}>
              <h1 className="font-headline font-extrabold text-5xl md:text-7xl leading-tight mb-12 tracking-tighter">
                The best deals never hit the market.{' '}
                <span className="text-[#b0004a]">You need to find them first.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className={`space-y-8 editorial text-xl max-w-3xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>Eighty percent of small businesses that sell never get formally listed. They change hands through whisper networks — a broker mentions it to three people, a CPA tips off a client, a landlord knows the tenant is tired.</p>
                <p>If you're waiting for the right business to appear on BizBuySell, you're fishing in 20% of the pond. And that 20% is picked over. The good ones are under LOI within weeks. What's left has been sitting there for a reason.</p>
                <p>The buyers who win — the ones who close at fair multiples on healthy businesses — do two things differently. They search systematically. And they underwrite before they fall in love.</p>
                <p className={`font-bold text-2xl border-l-4 border-[#b0004a] px-6 italic ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>
                  Yulia does both. She maps markets, screens targets, models every deal structure, and tells you when the numbers don't work — before you've spent $30K on due diligence.
                </p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-4 sticky top-12">
            <div className={`p-8 rounded-xl shadow-lg space-y-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
              <h3 className="font-headline font-extrabold text-xl uppercase tracking-widest text-[#b0004a]">Action Panel</h3>
              <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Ready to find your acquisition? Tell Yulia your thesis.</p>
              <button onClick={handleCTA} className="w-full bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all border-none cursor-pointer">
                Tell Yulia what you're looking for <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button onClick={handleCTA} className={`w-full py-4 rounded-xl font-bold transition-all border-none cursor-pointer ${dark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-[#eeeef0] text-[#1a1c1e] hover:bg-[#e2e2e5]'}`}>
                Message Yulia
              </button>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. CONVERSATION EXHIBIT ═══ */}
        <ScrollReveal>
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className={`p-10 rounded-2xl shadow-sm ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-[#b0004a] uppercase">Deal Screening</span>
                    <h3 className="text-2xl font-headline font-extrabold mt-2 uppercase">HVAC · Dallas-Fort Worth</h3>
                  </div>
                  <span className="bg-[#b0004a]/10 text-[#b0004a] px-3 py-1 rounded-full text-xs font-bold">Active</span>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl text-sm ${dark ? 'bg-[#b0004a]/10' : 'bg-[#FFF0EB]'}`}>
                    <p className={`text-xs font-bold mb-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>You</p>
                    <p>I'm looking at an HVAC company in DFW. $2.1M revenue, asking 4.2× SDE. Owner says SDE is $480K. Worth pursuing?</p>
                  </div>
                  <div className={`p-4 rounded-xl text-sm ${dark ? 'bg-zinc-800' : 'bg-[#f5f5f8]'}`}>
                    <p className="text-xs font-bold mb-1 text-[#b0004a]">Yulia</p>
                    <p className={dark ? 'text-[#dadadc]/90' : ''}>A few things to flag before you go further. HVAC in DFW trades at 3.0–3.8× SDE for owner-operated, 4.5–6.0× EBITDA for businesses with a GM and recurring revenue. At $480K SDE and 4.2×, the ask is $2.02M — that's above market unless they have maintenance contracts.</p>
                    <p className={`mt-3 ${dark ? 'text-[#dadadc]/90' : ''}`}>What percentage of revenue is recurring? And is the $480K SDE before or after the owner's above-market salary?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-headline font-bold tracking-tight">The conversation that saves you six figures</h2>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most buyers fall in love with the story before they interrogate the numbers. They spend $15K on a QofE report that confirms what a five-minute analysis would have revealed — the ask was above market from the start.</p>
              <p className="editorial text-lg italic text-[#b0004a] font-medium">Yulia screens every deal against real market data before you spend a dollar.</p>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>She pulls Census NAICS data, BLS wage benchmarks, SBA lending activity by MSA, and transaction comps. Not opinions. Not "industry rules of thumb." Sovereign data.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. SBA RULES (dark) ═══ */}
        <ScrollReveal>
          <section className="mb-32 py-20 bg-[#2f3133] -mx-6 md:-mx-12 px-6 md:px-12 rounded-3xl text-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h2 className="text-4xl font-headline font-bold leading-tight">SBA 7(a) is the most powerful buyer tool in existence — and most buyers use it wrong</h2>
                <p className="editorial text-lg text-white/80">The SBA 7(a) program will lend up to $5M for a business acquisition at 10–15% down. That's leverage no other asset class offers. But the program has rules that kill deals when buyers don't know them upfront.</p>
                <p className="editorial text-lg text-white/80">DSCR must be ≥ 1.25 on historical cash flow. Change of ownership triggers lease assignment. Goodwill amortization affects your debt service for years. Sellers can carry a note — but it must be on full standby.</p>
                <p className="editorial text-lg font-bold">Yulia models SBA eligibility before you write the LOI.</p>
              </div>
              <div className="bg-black/30 p-8 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-white font-headline font-bold text-xl">SBA Bankability</h3>
                    <p className="text-xs text-[#b0004a] uppercase font-bold tracking-widest">HVAC · Dallas-Fort Worth</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs opacity-50 block uppercase">Purchase Price</span>
                    <span className="text-white font-headline font-extrabold text-xl">$2,016,000</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    ['Down payment (10%)', '$201,600', true],
                    ['SBA loan (90%)', '$1,814,400', true],
                    ['Annual debt service', '$248,000', true],
                    ['Historical SDE', '$480,000', true],
                    ['DSCR', '1.94×', true],
                    ['Minimum required', '1.25×', true],
                  ].map(([label, amount, pass]) => (
                    <div key={label as string} className="flex justify-between text-sm py-2 border-b border-white/5">
                      <span className="opacity-70">{label}</span>
                      <span className={`font-bold ${pass ? 'text-[#8ff9a8]' : 'text-red-400'}`}>{amount}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#006630]/20 border border-[#006630]/30 p-6 rounded-xl text-center">
                  <span className="material-symbols-outlined text-[#8ff9a8] text-3xl block mb-2">check_circle</span>
                  <p className="text-[#8ff9a8] font-bold text-lg">SBA ELIGIBLE</p>
                  <p className="text-white/50 text-xs mt-1">DSCR clears minimum by 0.69× — strong margin of safety</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. MARKET MAPPING ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <h2 className="text-5xl font-headline font-extrabold mb-12 tracking-tighter text-center">The market you can't see from a listing site</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className={`lg:col-span-7 editorial text-lg space-y-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>There are 33.2 million small businesses in the United States. In any given year, roughly 10% of owners are thinking about selling. That's 3.3 million potential deals — and fewer than 50,000 get formally listed.</p>
                <p>Yulia maps your target market at the MSA level. She pulls Census business counts by NAICS code, cross-references BLS employment data, overlays SBA lending volume, and identifies markets where the ratio of businesses to active listings is highest.</p>
                <p className={`font-bold ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>Those gaps — markets with lots of businesses and few listings — are where proprietary deal flow lives.</p>
                <p>She'll tell you exactly how many HVAC companies exist in Dallas-Fort Worth, how many employees they average, what they probably do in revenue based on BLS data, and which ones are in the demographic sweet spot for an exit — owners aged 55+ with no succession plan.</p>
              </div>
              <div className="lg:col-span-5">
                <div className={`rounded-2xl overflow-hidden shadow-sm ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className={`p-8 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                    <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-1">Market Density</h4>
                    <p className="font-headline font-extrabold text-xl">HVAC · Top 5 MSAs</p>
                  </div>
                  <div className="p-8 space-y-4">
                    {[
                      { msa: 'Dallas-Fort Worth', count: '2,847', listings: '23', ratio: '124:1' },
                      { msa: 'Houston', count: '3,102', listings: '31', ratio: '100:1' },
                      { msa: 'Phoenix', count: '1,934', listings: '28', ratio: '69:1' },
                      { msa: 'Atlanta', count: '2,215', listings: '42', ratio: '53:1' },
                      { msa: 'Tampa', count: '1,567', listings: '35', ratio: '45:1' },
                    ].map((m, i) => (
                      <div key={m.msa} className={`flex justify-between items-center py-3 ${i < 4 ? (dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]') : ''}`}>
                        <div>
                          <p className="font-bold text-sm">{m.msa}</p>
                          <p className={`text-xs ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>{m.count} businesses · {m.listings} listed</p>
                        </div>
                        <span className={`font-headline font-extrabold text-lg ${i === 0 ? 'text-[#b0004a]' : ''}`}>{m.ratio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. TAX BENEFIT ═══ */}
        <ScrollReveal>
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-headline font-bold tracking-tight">The asset allocation that pays for itself</h2>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>In an asset purchase, how you allocate the price across asset classes — equipment, inventory, goodwill, covenant not to compete, customer lists — determines your depreciation schedule for years.</p>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most buyers let the attorney handle it. Most attorneys default to whatever the seller's side proposes. The difference between an optimized §338(h)(10) allocation and a default one can be $80,000 to $200,000 in present-value tax savings over five years.</p>
              <p className="editorial text-lg italic text-[#b0004a] font-medium">Yulia models every allocation scenario and shows you the five-year cash flow impact before you sign the purchase agreement.</p>
            </div>
            <div className={`rounded-2xl overflow-hidden shadow-sm ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
              <div className={`p-8 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-1">Asset Allocation</h4>
                <p className="font-headline font-extrabold text-xl">$2.0M Acquisition · Asset Purchase</p>
              </div>
              <div className="p-8 space-y-4">
                <div className={`grid grid-cols-3 text-center text-[10px] font-bold uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                  <span className="text-left">Category</span><span>Default</span><span>Optimized</span>
                </div>
                {[
                  ['Equipment', '$200K', '$450K'],
                  ['Goodwill', '$1.4M', '$950K'],
                  ['Non-Compete', '$50K', '$250K'],
                  ['Customer Lists', '$100K', '$200K'],
                  ['Inventory', '$250K', '$150K'],
                ].map(([cat, def, opt]) => (
                  <div key={cat} className="grid grid-cols-3 items-center text-sm">
                    <span className="font-medium">{cat}</span>
                    <span className="text-center">{def}</span>
                    <span className="text-center font-bold">{opt}</span>
                  </div>
                ))}
                <div className={`pt-6 grid grid-cols-3 items-center ${dark ? 'border-t border-zinc-800' : 'border-t border-[#eeeef0]'}`}>
                  <span className="text-sm font-bold">5-Year Tax Savings</span>
                  <span className={`text-center font-headline font-extrabold text-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>$68,000</span>
                  <span className="text-center font-headline font-extrabold text-xl text-[#b0004a]">$187,000</span>
                </div>
                <div className="bg-[#b0004a] text-white text-center py-4 rounded-xl font-bold text-lg">+$119,000 RECOVERED</div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. LOI ═══ */}
        <ScrollReveal>
          <section className="mb-32 bg-[#2f3133] -mx-6 md:-mx-12 px-6 md:px-12 py-20 rounded-3xl text-white">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="text-[#b0004a] font-bold tracking-widest uppercase text-sm">Deal Structure</span>
                <h2 className="text-4xl font-headline font-bold leading-tight">The LOI is where most first-time buyers lose</h2>
                <p className="editorial text-lg text-white/80">A Letter of Intent feels like a formality. It's not. It sets the price, the structure, the exclusivity period, the due diligence scope, the earnout terms, and the working capital peg. Brokers send templates. Attorneys modify language. But the economic terms? Those are yours to set.</p>
                <p className="editorial text-lg font-bold">Yulia drafts LOIs with every economic lever modeled.</p>
                <div className="flex flex-wrap gap-8 pt-4">
                  {[
                    { icon: 'calculate', text: 'Deal Modeling' },
                    { icon: 'gavel', text: 'Term Structuring' },
                    { icon: 'shield', text: 'Risk Analysis' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#b0004a]">{f.icon}</span>
                      <span className="text-sm font-bold">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl p-1 shadow-2xl ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                <div className="bg-[#d81b60] rounded-t-xl p-12 text-center">
                  <h4 className="text-white font-headline font-extrabold text-2xl">Letter of Intent</h4>
                  <p className="text-white/70 uppercase tracking-[0.2em] mt-2 text-xs font-bold">Project Falcon · DFW HVAC</p>
                </div>
                <div className="p-10 space-y-4">
                  <div className={`h-4 rounded w-1/2 ${dark ? 'bg-zinc-700' : 'bg-slate-100'}`}></div>
                  <div className="space-y-2">
                    <div className={`h-3 rounded w-full ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                    <div className={`h-3 rounded w-full ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                    <div className={`h-3 rounded w-3/4 ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="h-16 bg-[#b0004a]/5 rounded flex flex-col items-center justify-center">
                      <span className={`text-[10px] font-bold uppercase ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Purchase Price</span>
                      <span className={`font-headline font-bold ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>$1,920,000</span>
                    </div>
                    <div className="h-16 bg-[#b0004a]/5 rounded flex flex-col items-center justify-center">
                      <span className={`text-[10px] font-bold uppercase ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Earnout</span>
                      <span className={`font-headline font-bold ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>$96,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 7. TIMELINE ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-6 tracking-tighter">From thesis to close — the buyer's timeline</h2>
              <p className={`text-xl max-w-3xl mx-auto ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Yulia doesn't wait for you to ask the right questions. She tells you what comes next, when it matters, and what to watch for.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { phase: '01', time: 'Week 1–2', title: 'THESIS', free: true, desc: "Define what you're buying, why, and the financial profile that makes it work. Yulia builds your acquisition criteria.", items: ['Buy Thesis', 'Target Profile', 'Market Mapping'], accent: false },
              { phase: '02', time: 'Weeks 3–8', title: 'SOURCE', free: true, desc: 'Proprietary deal flow. Yulia identifies targets that match your thesis and screens them against real market data.', items: ['Deal Screening', 'Comp Analysis', 'Owner Outreach'], accent: false },
              { phase: '03', time: 'Weeks 6–12', title: 'UNDERWRITE', free: false, desc: 'Full financial modeling. SBA bankability. Sensitivity analysis. Every scenario modeled before you make an offer.', items: ['SBA Analysis', 'Deal Modeling', 'Risk Assessment'], accent: false },
              { phase: '04', time: 'Weeks 10–16', title: 'DILIGENCE', free: false, desc: 'QofE coordination. Customer concentration. Employee dependency. Technology risk. Yulia generates the DD checklist.', items: ['DD Checklist', 'Red Flag Scan', 'Working Capital'], accent: false },
              { phase: '05', time: 'Weeks 14–24', title: 'CLOSE', free: false, desc: 'Purchase agreement review. Asset allocation optimization. Closing checklist. Transition planning from Day 0.', items: ['LOI Drafting', 'Tax Optimization', 'Closing Support'], accent: true },
            ].map((p) => (
              <StaggerItem key={p.phase}>
                <div
                  className={`p-6 rounded-3xl flex flex-col h-full ${
                    p.accent
                      ? 'bg-[#b0004a] text-white'
                      : dark
                        ? 'bg-[#2f3133] border border-zinc-800'
                        : 'bg-white border border-[#eeeef0]'
                  }`}
                >
                  <div className="mb-6">
                    <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${p.accent ? 'text-white/70' : p.phase === '01' ? 'text-[#b0004a]' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      Phase {p.phase} · {p.time}
                    </span>
                    <h4 className="font-headline font-extrabold text-xl mb-1">{p.title}</h4>
                    {p.free && <span className="bg-[#006630]/10 text-[#006630] px-2 py-0.5 rounded text-[10px] font-bold uppercase">FREE</span>}
                  </div>
                  <p className={`text-sm mb-4 flex-grow ${p.accent ? 'text-white/80' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{p.desc}</p>
                  <ul className={`text-[10px] font-bold uppercase space-y-2 ${p.accent ? 'text-white/60' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                    {p.items.map((item) => <li key={item}>· {item}</li>)}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 8. BUYER PERSONAS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-extrabold mb-16 tracking-tight text-center">Whether it's your first deal or your fifteenth</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'First-Time Buyer', icon: 'person', desc: "You've got capital and conviction but no deal experience. Yulia walks you through every step — SBA mechanics, LOI terms, DD scope — in plain language. No jargon until you ask for it.", highlight: false },
              { type: 'Search Funder', icon: 'search', desc: 'Your investors expect institutional process. Yulia generates the screening memos, financial models, and deal summaries your board needs — at the cadence they expect.', highlight: false },
              { type: 'Serial Acquirer', icon: 'stacks', desc: "You know what you're doing. You need speed. Yulia screens 50 targets in the time it takes to read one CIM. She flags what matters and ignores what doesn't.", highlight: true },
              { type: 'PE Platform', icon: 'corporate_fare', desc: "Roll-up economics. Multiple arbitrage. Integration planning. Yulia models each add-on against the platform and shows you the blended multiple in real time.", highlight: false },
            ].map((card) => (
              <StaggerItem key={card.type}>
                <div
                  className={`p-8 rounded-2xl hover:shadow-md transition-all h-full ${
                    dark
                      ? `bg-[#2f3133] ${card.highlight ? 'border border-[#b0004a]/20' : 'border border-zinc-800'}`
                      : `bg-white ${card.highlight ? 'border border-[#b0004a]/20' : 'border border-[#eeeef0]'}`
                  }`}
                >
                  <div className="flex justify-between mb-6">
                    <span className="material-symbols-outlined text-[#b0004a] text-4xl">{card.icon}</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl mb-4">{card.type}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 9. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-6xl font-headline font-extrabold leading-tight tracking-tighter">The deal that changes everything starts with a conversation.</h2>
            <div className={`editorial text-xl space-y-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              <p>Not a cold email to a broker. Not a form submission on a listing site. Not a $5,000 retainer to a search firm you found on LinkedIn.</p>
              <p>Tell Yulia what you're looking for — the industry, the geography, the size, the economics. She'll show you what the market actually looks like. She'll screen targets before you waste a single hour. She'll model the deal before you write the check.</p>
              <p className={`font-bold text-2xl ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>The best acquisitions aren't found. They're built — methodically, from thesis to close.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
              <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">
                Tell Yulia your thesis
              </button>
              <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>
                Message Yulia
              </button>
            </div>
          </section>
        </ScrollReveal>

      </div>
      <DarkModeToggle dark={dark} setDark={setDark} />
    </div>
  );
}
