import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function HowItWorksBelow() {
  const [dark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const dimensions = [
    { icon: 'hub', title: 'Industry Structure', desc: 'Fragmentation vs. consolidation. Roll-up activity. Supply chain dependencies. Where your sector is in the M&A cycle and what that means for timing.' },
    { icon: 'map', title: 'Regional Economics', desc: 'Local labor markets, population trends, cost of living, commercial real estate dynamics, and zip-code level purchasing power.' },
    { icon: 'balance', title: 'Financial Normalization', desc: 'Owner add-backs identified and categorized. SDE and EBITDA recalculated to what a buyer would actually underwrite — not what the tax return says.' },
    { icon: 'groups_3', title: 'Buyer Landscape', desc: 'Who\'s actively acquiring in your sector. PE platforms, search funds, strategic buyers — their thesis, multiples, and timeline.' },
    { icon: 'architecture', title: 'Deal Architecture', desc: 'Asset vs. stock. Earn-outs. Seller notes. Equity rolls. Working capital pegs. Every structure modeled for after-tax impact on both sides.' },
    { icon: 'report_problem', title: 'Risk Assessment', desc: 'Customer concentration. Key-person dependency. Lease exposure. Regulatory headwinds. The factors that kill deals — quantified before they surprise anyone.' },
  ];

  const comparisonRows = [
    { feature: 'Lending conditions', ai: 'Training cutoff', smbx: 'Live federal data feeds' },
    { feature: 'Financial precision', ai: 'Estimations', smbx: 'Deterministic math engine' },
    { feature: 'Local benchmarks', ai: 'National averages', smbx: 'MSA-level Census + BLS data' },
    { feature: 'Deal structuring', ai: 'Generic templates', smbx: 'Model-ready lending structures' },
    { feature: 'Deal complexity', ai: 'Same depth for all', smbx: 'League-adaptive (L1–L6)' },
    { feature: 'Your data', ai: 'Trains the model', smbx: 'Private. Always.' },
  ];

  const dataSources = [
    { name: 'Census Bureau', desc: 'Business counts by NAICS × geo' },
    { name: 'BLS', desc: 'Wages, employment, labor' },
    { name: 'FRED', desc: 'Rates, lending, macro signals' },
    { name: 'SBA', desc: 'Loan data by MSA + NAICS' },
    { name: 'SEC EDGAR', desc: 'Comparable transactions' },
    { name: 'IRS SOI', desc: 'Industry profitability' },
  ];

  const journeys = [
    { icon: 'storefront', title: 'Sell', href: '/sell', desc: 'Understand your real value. Optimize before you go to market. Prepare materials that withstand buyer scrutiny. Negotiate from knowledge. Close with confidence.' },
    { icon: 'shopping_bag', title: 'Buy', href: '/buy', desc: 'Define your thesis. Screen every deal against real data. Model the economics before you fall in love. Execute diligence. Close and integrate with a 180-day plan.' },
    { icon: 'trending_up', title: 'Raise', href: '/raise', desc: 'Build the financial story investors believe. Create materials that get meetings. Find the right capital. Negotiate terms that protect your equity.' },
    { icon: 'merge', title: 'Integrate', href: '/integrate', desc: 'Stabilize employees and customers. Install controls. Execute the value creation plan — built from what due diligence actually revealed.' },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-8 rounded-sm">How It Works</span>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">You talk. Yulia <span className="text-[#b0004a]">works.</span></h1>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2} className="lg:col-span-5 lg:pt-24">
            <p className={`text-xl leading-relaxed ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>No intake forms. No 47-question wizard. No retainer before you know if this is even worth pursuing. Tell Yulia about your deal in plain language. She does the rest.</p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WATCH IT HAPPEN ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Watch It Happen</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">One sentence starts the entire analysis</h2>
            </div>
            <div className={`rounded-3xl p-8 md:p-12 ${dark ? 'bg-[#0f1012] border border-zinc-800' : 'bg-[#1a1c1e]'}`}>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">I own a residential cleaning company in Phoenix. About $1.8M revenue. Thinking about selling sometime in the next year.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Residential cleaning in Phoenix — I know this market well. Let me run some numbers while we talk.
                    <span className="block mt-3 text-[#dadadc]/40 text-xs italic">Classifying: NAICS 561720 · Maricopa County MSA · pulling Census establishment counts, BLS wage data, SBA lending activity...</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0"></div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    A few things right away. Phoenix residential cleaning trades at 2.8x–3.5x SDE for owner-operated businesses. At $1.8M revenue, if your margins are in line with the MSA average of 20–30%, your SDE is probably in the $360K–$540K range. That puts your business at roughly <span className="text-[#ffb2bf] font-bold">$1.08M–$1.89M.</span>
                    <span className="block mt-3 font-semibold">But here's what I need to sharpen that range: how much are you paying yourself, and are you running any personal expenses through the business?</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0"></div>
                  <div className="grid grid-cols-3 gap-3 max-w-[80%]">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">SDE Range</p><p className="text-lg font-extrabold text-white">$360K–$540K</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">Multiple Range</p><p className="text-lg font-extrabold text-white">2.8x–3.5x</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">Est. Value</p><p className="text-lg font-extrabold text-[#ffb2bf]">$1.08M–$1.89M</p></div>
                  </div>
                </div>
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">My salary is $120K and yeah, there's probably $40–50K in personal stuff — car, phone, some travel.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    That changes the picture. With $120K salary add-back and $45K in personal expenses, your adjusted SDE jumps to roughly <span className="text-[#ffb2bf] font-bold">$525K</span>. At current Phoenix multiples, that's <span className="text-[#ffb2bf] font-bold">$1.47M–$1.84M</span> — and I haven't even looked at your rent situation yet.
                    <span className="block mt-3 font-semibold">Are you paying rent to a property you own? That's one of the most common hidden add-backs in this industry.</span>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-white/10 text-center">
                <p className="text-[#dadadc]/40 text-sm">That entire analysis took less than 90 seconds. No signup. No credit card. The conversation continues until Yulia has built a complete picture of your business.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. THREE STAGES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-16">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Your Journey</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">Conversation → Analysis → Execution</h2>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Conversation', desc: 'Describe your deal in plain language. Yulia classifies your business, identifies your benchmarks, and starts building your financial profile — all while you\'re still talking.', badge: 'Free · No account', badgeColor: 'bg-[#006630]/10 text-[#006630]' },
              { num: '2', title: 'Analysis', desc: 'Add-back discovery. Normalized earnings. Value range. Risk scoring. Market intelligence. Deal-readiness assessment. All yours to keep — even if you stop here.', badge: 'Free · Keep everything', badgeColor: 'bg-[#006630]/10 text-[#006630]' },
              { num: '3', title: 'Execution', desc: 'One payment unlocks everything through closing and 180 days after. Deal room. Professional documents. Negotiation support. Closing logistics. Integration planning.', badge: '0.1% of SDE/EBITDA · $999 min', badgeColor: 'bg-[#b0004a]/10 text-[#b0004a]' },
            ].map((stage) => (
              <StaggerItem key={stage.num}>
                <div className={`rounded-3xl p-10 h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#b0004a] flex items-center justify-center text-white font-extrabold text-lg mb-8">{stage.num}</div>
                  <h3 className="font-headline text-2xl font-extrabold mb-4">{stage.title}</h3>
                  <p className={`leading-relaxed mb-6 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{stage.desc}</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${stage.badgeColor}`}>{stage.badge}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 4. THE INFORMATION DESERT ═══ */}
        <ScrollReveal>
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block">The Problem</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">Bloomberg charges $24,000 a year. You have Google.</h2>
              <p className={`text-lg leading-relaxed ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Institutional investors pay tens of thousands for real-time terminal access to private market data. For everyone else, the "Information Desert" is real — outdated averages, anecdotal advice, and rules of thumb that vary by 40% between markets.</p>
              <div className={`p-6 rounded-2xl space-y-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <div className={`flex justify-between items-center pb-4 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                  <span className={`font-bold ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Traditional Research</span>
                  <span className={`font-bold italic ${dark ? 'text-red-400' : 'text-red-600'}`}>"Good luck"</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">smbX.ai</span>
                  <span className="text-[#b0004a] font-extrabold">Institutional Grade</span>
                </div>
              </div>
              <p className="font-bold text-xl border-l-4 border-[#b0004a] pl-6">The data exists. Nobody connected it. We did.</p>
            </div>
            <div className={`p-12 rounded-3xl text-white space-y-8 ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="text-xs uppercase tracking-[0.3em] text-[#dadadc]/40 font-bold">Sovereign Data Foundation</div>
              <div className="grid grid-cols-2 gap-4">
                {dataSources.map((src) => (
                  <div key={src.name} className="p-4 rounded-xl border border-white/10 text-center">
                    <h4 className="font-bold text-sm">{src.name}</h4>
                    <p className="text-[9px] text-[#dadadc]/40 mt-1">{src.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#dadadc]/30 italic">Starting from sovereign data sources — expanding globally as we enter new markets.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. SEVEN DIMENSIONS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Analytical Framework</span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">A real deal analysis isn't one thing. <span className="text-[#b0004a]">It's seven.</span></h2>
              <p className={`text-lg max-w-2xl ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Every sentence you type triggers all seven simultaneously. By the time you've described your business, Yulia has already benchmarked it against thousands of comparables.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dimensions.map((d) => (
              <StaggerItem key={d.title}>
                <div className={`p-8 rounded-2xl hover:shadow-xl hover:shadow-[#b0004a]/5 transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">{d.icon}</span>
                  <h3 className="text-xl font-bold leading-tight mb-3">{d.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem className="md:col-span-2">
              <div className="p-8 bg-[#b0004a] text-white rounded-2xl h-full">
                <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                <h3 className="font-headline text-3xl font-extrabold mb-3">Forward Signals</h3>
                <p className="text-lg opacity-90">Where is your industry's multiple heading in the next 12–24 months? Yulia models macro shifts, lending cycles, PE dry powder, and sector-specific catalysts to tell you whether to move now or wait.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 6. LOCAL vs NATIONAL ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="border-l-8 border-[#b0004a] pl-8 mb-12">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">The same business in two cities. Completely different deal.</h2>
              <p className={`text-xl mt-4 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>This is why national averages are dangerous. Every deal is local.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0] shadow-sm'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Service Sector</div>
                    <h4 className="font-headline text-2xl font-extrabold">Cleaning in Phoenix</h4>
                  </div>
                  <div className="bg-[#b0004a]/10 px-4 py-2 rounded-xl text-[#b0004a] font-bold text-sm">$380K SDE</div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3"><div className="w-10 h-1 bg-[#b0004a] rounded-full"></div><span className="text-sm font-bold">Labor Elasticity: HIGH</span></div>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Population growth driving demand, but labor costs rising faster than contract prices. Margin compression risk must be priced in.</p>
                </div>
                <div className="text-4xl font-headline font-extrabold">3.2x <span className={`text-sm font-medium ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Effective Multiple</span></div>
              </div>
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Industrial Sector</div>
                    <h4 className="font-headline text-2xl font-extrabold">Precision Manufacturing</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm ${dark ? 'bg-zinc-700 text-white' : 'bg-[#1a1c1e] text-white'}`}>$12M EBITDA</div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3"><div className={`w-20 h-1 rounded-full ${dark ? 'bg-white' : 'bg-[#1a1c1e]'}`}></div><span className="text-sm font-bold">Barriers to Entry: EXTREME</span></div>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Specialized IP and long-term contracts create a moat. Strategic buyers paying a 25% premium over financial sponsors.</p>
                </div>
                <div className="text-4xl font-headline font-extrabold">8.4x <span className={`text-sm font-medium ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Effective Multiple</span></div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 7. LEAGUE-ADAPTIVE INTELLIGENCE ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Adaptive Intelligence</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-4">Yulia doesn't give the same advice to every deal.</h2>
              <p className={`text-lg max-w-2xl ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>A $400K cleaning company and a $40M manufacturing platform both ask "what's my business worth?" If they get the same answer, the answer is wrong for both of them. Yulia classifies your deal by complexity and adapts everything — language, metrics, analytical depth, and buyer strategy.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'school', title: 'The Coach', range: 'Under $2M SDE · Owner-operated',
                metric: 'SDE (Seller Discretionary Earnings)',
                language: '"What you take home" not "discretionary cash flow." Plain language. No jargon until you\'re ready.',
                focus: 'Add-back discovery, SBA qualification, step-by-step guidance through the process.',
                quote: '"Your business is in the owner-operator range. We\'ll focus on your total earnings and find an individual buyer, likely using an SBA loan."',
              },
              {
                icon: 'analytics', title: 'The Analyst', range: '$2M–$10M EBITDA · Lower middle market',
                metric: 'EBITDA (Adjusted)',
                language: 'Institutional terminology. Working capital normalization. GAAP adjustments. Covenant analysis.',
                focus: 'PE buyer mapping, management gap assessment, Quality of Earnings preparation.',
                quote: '"You\'re in the lower middle market. Your buyer pool includes PE firms and funded searchers. We\'ll switch to EBITDA and prepare for institutional diligence."',
              },
              {
                icon: 'account_balance', title: 'The Partner', range: '$10M+ EBITDA · Institutional',
                metric: 'EBITDA + DCF + LBO Modeling',
                language: 'Institutional. Arbitrage spreads, platform plays, synergy assumptions, regulatory considerations.',
                focus: 'Competitive auction process, sensitivity analysis, cross-border structures, board-level documentation.',
                quote: '"This is an institutional deal. We\'ll model this as an LBO, run sensitivity analysis, and likely run a competitive process."',
              },
            ].map((league) => (
              <StaggerItem key={league.title}>
                <div className={`rounded-2xl overflow-hidden h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className={`bg-[#b0004a]/5 p-6 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                    <div className="flex items-center gap-3 mb-2"><span className="material-symbols-outlined text-[#b0004a]">{league.icon}</span><h3 className="font-extrabold text-lg">{league.title}</h3></div>
                    <p className={`text-xs ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{league.range}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div><p className={`text-[9px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Metric</p><p className="font-bold text-sm">{league.metric}</p></div>
                    <div><p className={`text-[9px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Language</p><p className={`text-sm ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{league.language}</p></div>
                    <div><p className={`text-[9px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Focus</p><p className={`text-sm ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{league.focus}</p></div>
                    <div className={`p-3 rounded-lg ${dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}`}><p className={`text-xs italic ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{league.quote}</p></div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal>
            <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#b0004a]/10 border border-[#b0004a]/20' : 'bg-[#b0004a]/5 border border-[#b0004a]/10'}`}>
              <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">auto_fix_high</span>
              <div>
                <h4 className="font-bold mb-1">Industry Override</h4>
                <p className={`text-sm ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Certain industries — veterinary, dental, HVAC, managed services, pest control — trade on institutional metrics even at small scale because PE roll-ups are active. Yulia automatically switches to EBITDA for these sectors above $1.5M revenue, regardless of size classification.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 8. THE MATH ENGINE ═══ */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">The Math Engine</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-8">AI that interprets. Math that doesn't hallucinate.</h2>
              <div className={`space-y-6 leading-[1.75] ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>
                <p>General-purpose AI generates plausible-sounding financial analysis. It also makes up numbers, conflates industries, and can't calculate a debt service coverage ratio correctly.</p>
                <p>smbX.ai uses a <span className={`font-semibold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>hybrid architecture</span>. Yulia reads your context, interprets your situation, and communicates naturally. But every financial calculation runs through a deterministic engine with standardized formulas that don't guess.</p>
                <p className={`font-bold text-xl border-l-4 border-[#b0004a] pl-6 ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>The AI decides what to calculate. The engine guarantees the math is right.</p>
              </div>
            </ScrollReveal>
            <StaggerContainer className="lg:col-span-7 space-y-4">
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">calculate</span><h4 className="font-bold">SDE (Seller Discretionary Earnings)</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${dark ? 'bg-[#3a3c3e] text-[#f9f9fc]' : 'bg-[#f3f3f6] text-[#1a1c1e]'}`}>SDE = Net Income + Owner Salary + D&A + Interest + One-Time Expenses + Verified Add-Backs</div>
                  <p className={`text-xs mt-3 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Used for owner-operated businesses under $2M. Every add-back is flagged by AI, verified by the owner, calculated by the engine.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">monitoring</span><h4 className="font-bold">Adjusted EBITDA</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${dark ? 'bg-[#3a3c3e] text-[#f9f9fc]' : 'bg-[#f3f3f6] text-[#1a1c1e]'}`}>Adj. EBITDA = Net Income + D&A + Interest + Taxes + Verified Add-Backs − Non-Recurring Income</div>
                  <p className={`text-xs mt-3 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Used for institutional deals $2M+. GAAP-normalized with working capital adjustments. The number a PE buyer's QoE firm will verify.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">account_balance_wallet</span><h4 className="font-bold">DSCR (Debt Service Coverage)</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${dark ? 'bg-[#3a3c3e] text-[#f9f9fc]' : 'bg-[#f3f3f6] text-[#1a1c1e]'}`}>DSCR = EBITDA ÷ Annual Debt Service</div>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#006630]"></span><span className={`text-xs ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>SBA minimum: 1.25×</span></div>
                    <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${dark ? 'bg-white' : 'bg-[#1a1c1e]'}`}></span><span className={`text-xs ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Conventional: 1.50×</span></div>
                  </div>
                  <p className={`text-xs mt-3 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Yulia models this at current rates before you write the LOI. If the deal doesn't clear DSCR, she tells you before you waste time.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">speed</span><h4 className="font-bold">Valuation Engine</h4></div>
                  <div className="bg-white/5 rounded-xl p-4 font-mono text-sm text-[#dadadc]">Value = Base Multiple × Adjusted Earnings + Growth Premium + Margin Premium − Risk Discount</div>
                  <p className="text-xs text-[#dadadc]/50 mt-3">The base multiple comes from verified comparables. Premiums and discounts are calculated from the seven-dimension analysis — not estimated.</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 9. CHATGPT COMPARISON ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-4xl font-extrabold text-center mb-12">What does this do that <span className="text-[#b0004a]">ChatGPT can't?</span></h2>
              <div className={`overflow-hidden rounded-2xl ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <table className="w-full text-left">
                  <thead>
                    <tr className={dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}>
                      <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Capability</th>
                      <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Standard AI</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#b0004a]">smbX.ai</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm ${dark ? 'divide-y divide-zinc-800' : 'divide-y divide-[#eeeef0]'}`}>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature}>
                        <td className="px-6 py-4 font-semibold">{row.feature}</td>
                        <td className={`px-6 py-4 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{row.ai}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#b0004a] text-sm">check_circle</span> {row.smbx}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 10. FOUR JOURNEYS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">Every side of the deal. One platform.</h2>
              <p className={`mt-3 ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Yulia adapts the methodology to your specific journey.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journeys.map((j) => (
              <StaggerItem key={j.title}>
                <a href={j.href} className={`p-8 rounded-2xl hover:shadow-lg transition-all group flex gap-6 items-start ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-3xl shrink-0 mt-1 group-hover:scale-110 transition-transform">{j.icon}</span>
                  <div>
                    <h3 className="text-xl font-extrabold mb-2">{j.title}</h3>
                    <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>{j.desc}</p>
                    <span className="text-[#b0004a] text-xs font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 11. PRIVACY ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className={`rounded-3xl p-10 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-6">shield</span>
                <h2 className="text-3xl font-headline font-extrabold text-white mb-6">Your data never trains a public model.</h2>
                <p className="text-[#dadadc]/60 leading-relaxed mb-4">Every conversation and document is processed in a private instance. Your financial data is encrypted at rest, encrypted in transit, and never used to improve general AI models.</p>
                <p className="text-[#dadadc]/60 leading-relaxed">You can use smbX.ai without creating an account. If you do, your data is siloed and exportable. If you leave, your data goes with you or gets deleted — your choice.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'lock', label: 'AES-256 Encryption' },
                  { icon: 'visibility_off', label: 'No Model Training' },
                  { icon: 'cloud_off', label: 'Private Instances' },
                  { icon: 'download', label: 'Full Data Export' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                    <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-2">{item.icon}</span>
                    <h4 className="text-white font-bold text-sm">{item.label}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 12. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-none">See for <span className="text-[#b0004a] italic">yourself.</span></h2>
              <p className={`text-xl mb-12 max-w-2xl mx-auto ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Tell Yulia about your deal. Watch the intelligence layer work. Keep everything she finds — free, no account required.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
