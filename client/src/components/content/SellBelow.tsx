import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from './animations';

export default function SellBelow() {
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
                75% of owners who sell their business{' '}
                <span className="text-[#b0004a]">profoundly regret it</span> within a year.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className={`space-y-8 editorial text-xl max-w-3xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>That number comes from the Exit Planning Institute. They've surveyed thousands of former owners. The regrets are almost always the same.</p>
                <p>They weren't financially prepared. They left hundreds of thousands on the table — in add-backs they never identified, in tax structures they never modeled, in competitive processes they never ran. They accepted the first offer because they had no way to know if it was fair.</p>
                <p>They didn't have a plan for after. Sixty percent had no idea what they were going to do the Monday morning after the wire hit. Their identity was the business. Without it, they were lost.</p>
                <p>They chose the wrong buyer. Someone who promised to keep the culture, retain the employees, honor the brand. Within a year, it was unrecognizable.</p>
                <p>Here's what's harder to hear: most of this was preventable. The owners who sell well — the ones who look back without regret — share one thing in common. They started preparing long before they went to market.</p>
                <p className={`font-bold text-2xl border-l-4 border-[#b0004a] px-6 italic ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>
                  That's what Yulia is built to do. Not to replace your broker or your attorney. To make sure you're prepared before you sit across the table from anyone.
                </p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-4 sticky top-12">
            <div className={`p-8 rounded-xl shadow-lg space-y-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
              <h3 className="font-headline font-extrabold text-xl uppercase tracking-widest text-[#b0004a]">Action Panel</h3>
              <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Ready to see your real numbers? Start with Yulia today.</p>
              <button onClick={handleCTA} className="w-full bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all border-none cursor-pointer">
                Tell Yulia about your business <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button onClick={handleCTA} className={`w-full py-4 rounded-xl font-bold transition-all border-none cursor-pointer ${dark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-[#eeeef0] text-[#1a1c1e] hover:bg-[#e2e2e5]'}`}>
                Message Yulia
              </button>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. VALUELENS ═══ */}
        <ScrollReveal>
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className={`p-10 rounded-2xl shadow-sm ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-[#b0004a] uppercase">ValueLens Report</span>
                    <h3 className="text-2xl font-headline font-extrabold mt-2 uppercase">Residential Cleaning · Phoenix, AZ</h3>
                  </div>
                  <span className="bg-[#b0004a]/10 text-[#b0004a] px-3 py-1 rounded-full text-xs font-bold">Live</span>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className={`text-xs font-bold uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Revenue</p>
                      <p className="font-headline font-extrabold text-2xl">$1.8M</p>
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>SDE Range</p>
                      <p className="font-headline font-extrabold text-2xl">$360K–$540K</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl ${dark ? 'bg-zinc-900' : 'bg-[#f9f9fc]'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className={`text-xs font-bold uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Estimated Value</p>
                      <p className="text-[#b0004a] font-bold text-sm">3.0×–3.5× SDE</p>
                    </div>
                    <p className="font-headline font-extrabold text-4xl text-[#b0004a]">$1.08M–$1.89M</p>
                  </div>
                  <div className={`flex justify-between text-[10px] font-medium tracking-widest uppercase pt-2 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                    <span>Census NAICS 561720 · BLS Maricopa</span>
                    <span>Updated quarterly</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-headline font-bold tracking-tight">The question that sits unanswered for years</h2>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Every owner has had the same moment. Sometimes it's at 2am. Sometimes it's when they hear a competitor sold for a number that doesn't seem possible.</p>
              <p className="editorial text-lg italic text-[#b0004a] font-medium">The question is always: What is my business actually worth?</p>
              <p className={`editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>And then nothing happens. Because the only way to get a real answer has always been to commit to a process — hire an advisor, sign an engagement letter — before you've even decided whether you want to sell.</p>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <div className={`mb-32 max-w-4xl editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
            <p>Yulia gives you that number in ninety seconds. Not a guess — a range built on Census business counts, BLS wage data, SBA lending activity, and transaction multiples from comparable deals. It updates every quarter.</p>
            <p className={`mt-6 font-bold ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>It's free. It will always be free. Because the decision to sell should start with clarity, not commitment.</p>
          </div>
        </ScrollReveal>

        {/* ═══ 3. ADD-BACKS ═══ */}
        <ScrollReveal>
          <section className="mb-32 py-20 bg-[#2f3133] -mx-6 md:-mx-12 px-6 md:px-12 rounded-3xl text-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h2 className="text-4xl font-headline font-bold leading-tight">The money your CPA doesn't know you're leaving on the table</h2>
                <p className="editorial text-lg text-white/80">Your CPA has been doing exactly the right job. They've minimized your tax burden for years. Personal vehicles. Family cell phones. Travel. Above-market rent. One-time legal bills buried in operating expenses.</p>
                <p className="editorial text-lg text-white/80">The problem is that the number a buyer pays isn't based on taxable income. It's based on earnings after all those personal expenses are added back. I've seen owners with $80K to $200K in add-backs they never knew existed.</p>
              </div>
              <div className="bg-black/30 p-8 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-white font-headline font-bold text-xl">Add-back Discovery</h3>
                    <p className="text-xs text-[#b0004a] uppercase font-bold tracking-widest">Residential Cleaning · Phoenix</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs opacity-50 block uppercase">Reported SDE</span>
                    <span className="text-white font-headline font-extrabold text-xl">$320,000</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    ['Personal vehicles', '$48,000'],
                    ['Family cell phones', '$18,000'],
                    ['One-time legal fee', '$12,000'],
                    ['Above-market rent to own LLC', '$31,000'],
                    ['Personal travel + clubs', '$18,000'],
                  ].map(([label, amount]) => (
                    <div key={label} className="flex justify-between text-sm py-2 border-b border-white/5">
                      <span className="opacity-70">+ {label}</span>
                      <span className="text-[#8ff9a8] font-bold">{amount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm opacity-50 font-bold uppercase">Adjusted SDE</span>
                  <span className="font-headline font-extrabold text-4xl">$<AnimatedCounter value={447000} className="" /></span>
                </div>
                <div className="bg-[#b0004a]/10 border border-[#b0004a]/20 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#b0004a] uppercase">Value Comparison (3.2×)</span>
                    <span className="text-xs text-[#8ff9a8] font-extrabold">+$406,400 RECOVERED</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="opacity-50">
                      <p className="text-[10px] uppercase font-bold">Before</p>
                      <p className="text-lg font-bold line-through">$1,024,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white">After Discovery</p>
                      <p className="text-2xl font-headline font-extrabold text-white">$1,430,400</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. TAX / DEAL STRUCTURE ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <h2 className="text-5xl font-headline font-extrabold mb-12 tracking-tighter text-center">The deal structure that quietly costs more than any negotiation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className={`lg:col-span-7 editorial text-lg space-y-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>A client in San Antonio closed a $2.4M deal. Beautiful number. Then the tax estimate came.</p>
                <p>She was a C-Corp. The buyer wanted an asset purchase. For her, that meant double taxation — the corporation paid capital gains, then she paid personal income tax on the distribution.</p>
                <p className={`font-bold italic ${dark ? 'text-red-400' : 'text-red-600'}`}>The difference between what she expected and what she kept was over $300,000.</p>
                <p>Her attorney and CPA knew the risk. Neither brought it up before the purchase agreement was drafted.</p>
                <p>Yulia models every structure side-by-side before you sign anything. She flags C-Corp exposure the moment you share your entity type. She screens for QSBS automatically. She calculates installment schedules year-by-year.</p>
              </div>
              <div className="lg:col-span-5">
                <div className={`rounded-2xl overflow-hidden shadow-sm ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className={`p-8 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                    <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-1">Structure Comparison</h4>
                    <p className="font-headline font-extrabold text-xl">$2.4M Sale · S-Corp · Texas</p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className={`grid grid-cols-3 text-center text-[10px] font-bold uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      <span></span><span>Asset Sale</span><span>Stock Sale</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-sm font-medium">Federal Tax</span>
                      <span className="text-center font-bold">$312,000</span>
                      <span className="text-center font-bold">$264,000</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-sm font-medium">Deprec. Recapture</span>
                      <span className="text-center font-bold">$48,000</span>
                      <span className="text-center font-bold">$0</span>
                    </div>
                    <div className={`pt-6 grid grid-cols-3 items-center ${dark ? 'border-t border-zinc-800' : 'border-t border-[#eeeef0]'}`}>
                      <span className="text-sm font-bold">Net to Seller</span>
                      <span className={`text-center font-headline font-extrabold text-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>$2,040,000</span>
                      <span className="text-center font-headline font-extrabold text-xl text-[#b0004a]">$2,136,000</span>
                    </div>
                    <div className="bg-[#b0004a] text-white text-center py-4 rounded-xl font-bold text-lg">+$96,000 KEPT</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. EXIT TYPES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-bold mb-4">"Selling" doesn't mean one thing</h2>
            <p className={`text-xl max-w-3xl mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most people assume there's one way to exit: hand over the keys, cash the check. There are six fundamentally different structures.</p>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'check_circle', label: '6–18 months', title: 'Full Sale', desc: 'Clean exit. Maximize the number. Yulia runs the complete process from first data intake to final wire transfer.', highlight: false },
              { icon: 'handshake', label: 'Internal', title: 'Partner Buyout', desc: "One of you wants out. The hard part isn't valuation. It's financing and keeping the personal relationship intact.", highlight: false },
              { icon: 'trending_up', label: 'Expansion', title: 'Capital Raise', desc: "Maybe you don't need to sell. Debt, equity, SBA expansion — every scenario modeled for what you give up.", highlight: false },
              { icon: 'groups', label: 'Tax Advantage', title: 'ESOP', desc: 'Employee ownership with real tax advantages. S-Corp sellers can defer gains under §1042 by reinvesting.', highlight: true },
              { icon: 'pie_chart', label: '"Second Bite"', title: 'Majority Sale', desc: 'Sell 51–80% to PE. Take cash off the table today. Keep skin in the game for the second wealth creation event.', highlight: false },
              { icon: 'content_cut', label: 'Strategic', title: 'Partial Sale', desc: 'Carve out a division. License IP. Sell-leaseback real estate. Creative structures that unlock value without a total exit.', highlight: false },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div
                  className={`p-8 rounded-2xl hover:shadow-md transition-all h-full ${
                    dark
                      ? `bg-[#2f3133] ${card.highlight ? 'border border-[#b0004a]/20' : 'border border-zinc-800'}`
                      : `bg-white ${card.highlight ? 'border border-[#b0004a]/20' : 'border border-[#eeeef0]'}`
                  }`}
                >
                  <div className="flex justify-between mb-6">
                    <span className="material-symbols-outlined text-[#b0004a] text-4xl">{card.icon}</span>
                    <span className={`text-xs font-bold uppercase ${card.highlight ? 'text-[#b0004a]' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.label}</span>
                  </div>
                  <h3 className="font-headline font-bold text-2xl mb-4">{card.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 6. LIVING CIM ═══ */}
        <ScrollReveal>
          <section className="mb-32 bg-[#2f3133] -mx-6 md:-mx-12 px-6 md:px-12 py-20 rounded-3xl text-white">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="text-[#b0004a] font-bold tracking-widest uppercase text-sm">Institutional Standard</span>
                <h2 className="text-4xl font-headline font-bold leading-tight">The document that sells your business — and why it can't be static</h2>
                <p className="editorial text-lg text-white/80">A traditional deal book is frozen the day it's published. In a 12-month exit, your business keeps moving — new contracts, new hires, new quarters. Every buyer is reading a document that describes your business as it was, not as it is.</p>
                <p className="editorial text-lg font-bold">Yulia's deal materials update automatically when your financials change. New quarter closes? Updated. Key hire? Reflected. The documents that represent your business to buyers are always current.</p>
                <div className="flex flex-wrap gap-8 pt-4">
                  {[
                    { icon: 'update', text: 'Auto-Updating' },
                    { icon: 'visibility', text: 'Buyer Tracking' },
                    { icon: 'lock', text: 'Tiered Access' },
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
                  <h4 className="text-white font-headline font-extrabold text-2xl">Confidential Information Memorandum</h4>
                  <p className="text-white/70 uppercase tracking-[0.2em] mt-2 text-xs font-bold">Project Alpha Phoenix</p>
                </div>
                <div className="p-10 space-y-4">
                  <div className={`h-4 rounded w-1/2 ${dark ? 'bg-zinc-700' : 'bg-slate-100'}`}></div>
                  <div className="space-y-2">
                    <div className={`h-3 rounded w-full ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                    <div className={`h-3 rounded w-full ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                    <div className={`h-3 rounded w-3/4 ${dark ? 'bg-zinc-800' : 'bg-slate-50'}`}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    <div className="h-16 bg-[#b0004a]/5 rounded"></div>
                    <div className="h-16 bg-[#b0004a]/5 rounded"></div>
                    <div className="h-16 bg-[#b0004a]/5 rounded"></div>
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
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-6 tracking-tighter">How the process actually works</h2>
              <p className={`text-xl max-w-3xl mx-auto ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Yulia is not waiting for you to ask the right question. She's telling you what comes next, when it needs to happen, and why.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { phase: '01', time: 'Months 1–2', title: 'UNDERSTAND', free: true, desc: "See your business through a buyer's eyes. Financials normalized. Value Readiness Report scored on seven factors.", items: ['ValueLens Report', 'SDE/EBITDA Prelim', 'Industry Benchmarking'], accent: false },
              { phase: '02', time: 'Months 3–12', title: 'OPTIMIZE', free: false, desc: 'Where real value gets created. $50K improvement in EBITDA at 5× = $250K more at closing.', items: ['Risk Mitigation', 'Margin Expansion', 'Clean Books Recon'], accent: false },
              { phase: '03', time: 'Months 6–18', title: 'PREPARE', free: false, desc: 'Professional deal materials that present your business at its best. A secure data room organized for buyer diligence. Targeted outreach strategy mapped to active acquirers in your sector.', items: ['Data Room Setup', 'Buyer List Mapping', 'Vetted Data Access'], accent: false },
              { phase: '04', time: 'Months 12–24', title: 'NEGOTIATE', free: false, desc: 'LOI evaluation. Tax structure optimization. Every deal configuration modeled — earnouts, seller financing, working capital pegs.', items: ['Deal Configuration', 'Competitive Tension', 'Closing Support'], accent: true },
            ].map((p) => (
              <StaggerItem key={p.phase}>
                <div
                  className={`p-8 rounded-3xl flex flex-col h-full ${
                    p.accent
                      ? 'bg-[#b0004a] text-white'
                      : dark
                        ? 'bg-[#2f3133] border border-zinc-800'
                        : 'bg-white border border-[#eeeef0]'
                  }`}
                >
                  <div className="mb-8">
                    <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${p.accent ? 'text-white/70' : p.phase === '01' ? 'text-[#b0004a]' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      Phase {p.phase} · {p.time}
                    </span>
                    <h4 className="font-headline font-extrabold text-2xl mb-1">{p.title}</h4>
                    {p.free && <span className="bg-[#006630]/10 text-[#006630] px-2 py-0.5 rounded text-[10px] font-bold uppercase">FREE</span>}
                  </div>
                  <p className={`text-sm mb-6 flex-grow ${p.accent ? 'text-white/80' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{p.desc}</p>
                  <ul className={`text-[10px] font-bold uppercase space-y-2 ${p.accent ? 'text-white/60' : dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                    {p.items.map((item) => <li key={item}>· {item}</li>)}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 8. DEAL KILLERS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-bold mb-12">Three things kill more deals than price disagreements</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { title: 'The lease.', desc: "Landlord consent is never guaranteed. I've watched landlords use the consent clause to double the rent or collapse deals. Yulia flags lease risk Day 1." },
              { title: 'The licenses.', desc: 'Liquor licenses can take 90+ days. Health certifications take months. Contractor exams may be required. Yulia identifies the timeline so you build it into the deal.' },
              { title: 'Reps and warranties.', desc: "Indemnification escrows — 10–15% of proceeds — are the buyer's insurance. Yulia generates industry-specific preparation so your attorney starts with a framework." },
            ].map((k) => (
              <StaggerItem key={k.title}>
                <div className={`p-10 rounded-2xl border-l-4 border-red-500 shadow-sm h-full ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                  <h4 className="font-headline font-bold text-xl mb-4">{k.title}</h4>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{k.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 9. TIERS ═══ */}
        <ScrollReveal>
          <section className="mb-32 text-center">
            <h2 className="text-4xl font-headline font-extrabold mb-16 tracking-tight">First sale or fifth — Yulia speaks your language</h2>
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
              {[
                { tier: 'Growth-Stage', range: '$1.5M–$5M Revenue', desc: "If this is your first time, you deserve institutional quality guidance. Step-by-step. SBA-focused. Clear language. No jargon until you're ready.", first: true },
                { tier: 'Established', range: '$5M–$50M Revenue', desc: 'The "advisor desert." Too big for Main Street, too small for investment banks. PE firms are hunting you — you need institutional preparation to compete.', first: false },
                { tier: 'Institutional', range: '$50M+ Revenue', desc: "Board-level analysis and documentation. The analytical depth your buyer's deal team expects — valuation methodology, scenario modeling, and covenant structures delivered at institutional speed.", first: false },
              ].map((t) => (
                <StaggerItem key={t.tier}>
                  <div className={`space-y-4 ${!t.first ? (dark ? 'border-l border-zinc-800 pl-12' : 'border-l border-[#eeeef0] pl-12') : ''}`}>
                    <h4 className="text-[#b0004a] font-headline font-extrabold text-xl">{t.tier}</h4>
                    <p className="font-bold">{t.range}</p>
                    <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{t.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </ScrollReveal>

        {/* ═══ 10. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-6xl font-headline font-extrabold leading-tight tracking-tighter">The wire hits. And you know.</h2>
            <div className={`editorial text-xl space-y-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              <p>Not "I hope I got a fair deal." Not that nagging feeling at 3am wondering if you left something on the table.</p>
              <p>You know your number was built on real methodology. You know the add-backs were captured. You know the tax structure was modeled before anyone drafted the purchase agreement.</p>
              <p className={`font-bold text-2xl ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>That's the difference between the 75% who regret it and the 25% who don't.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
              <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">
                Tell Yulia about your business
              </button>
              <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>
                Message Yulia
              </button>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
