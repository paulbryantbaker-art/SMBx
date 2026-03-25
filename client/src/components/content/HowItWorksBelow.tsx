import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function HowItWorksBelow() {
  const [dark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  // Shared class helpers
  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const muted = dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]';
  const codeBg = dark ? 'bg-[#3a3c3e] text-[#f9f9fc]' : 'bg-[#f3f3f6] text-[#1a1c1e]';
  const emphasis = dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]';
  const subtleBg = dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]';
  const borderColor = dark ? 'border-zinc-800' : 'border-[#eeeef0]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';
  const monoBg = dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]';

  const dimensions = [
    { icon: 'hub', title: 'Industry Structure', desc: 'Fragmentation vs. consolidation. Roll-up activity. Supply chain dependencies. Where your sector is in the M&A cycle — and what that means for your timing and your price.' },
    { icon: 'map', title: 'Regional Economics', desc: 'Local labor markets, population trends, cost of living, commercial real estate dynamics, and zip-code level purchasing power. National averages hide a 40% variation between markets.' },
    { icon: 'balance', title: 'Financial Normalization', desc: 'Owner add-backs identified from IRS industry benchmarks. SDE and EBITDA recalculated to what a buyer would actually underwrite. Not what the tax return says — what the business actually earns.' },
    { icon: 'groups_3', title: 'Buyer Landscape', desc: 'Who\'s actively acquiring in your sector right now. PE platforms, search funds, strategic buyers. Their thesis, their multiples, their timeline — and whether they\'re bidding up or pulling back.' },
    { icon: 'architecture', title: 'Deal Architecture', desc: 'Asset vs. stock. Earn-outs. Seller notes. Equity rolls. Working capital pegs. Every structure modeled for after-tax impact on both sides — because a $2.4M deal can net $300K differently depending on structure.' },
    { icon: 'report_problem', title: 'Risk Assessment', desc: 'Customer concentration. Key-person dependency. Lease exposure. License transfer timelines. Franchise consent requirements. The factors that kill deals — quantified before they surprise anyone.' },
  ];

  const engines = [
    { icon: 'description', title: 'Financial Extraction', desc: 'Zero-hallucination mode. Extracts exact values from tax returns and P&Ls without rounding or calculating. Displays the extracted number next to the PDF source.', mode: 'Mode: STRUCTURED_EXTRACTION · Verified' },
    { icon: 'travel_explore', title: 'Market Intelligence', desc: 'Government data grounding. Pulls current sector multiples, PE activity, and consolidation trends from Census, BLS, SBA, and FRED sources updated quarterly. This is how Yulia knows your industry is "hot."', mode: 'Mode: GOVERNMENT_DATA · Updated quarterly' },
    { icon: 'policy', title: 'Legal / Forensic Auditor', desc: 'Walled garden. Answers strictly from your uploaded documents. Returns "NOT FOUND" if it can\'t cite a source. Every claim includes a page reference. Never infers or assumes.', mode: 'Mode: GROUNDED_ONLY · Temp: 0.1' },
    { icon: 'calculate', title: 'Deal Modeling', desc: 'Formula injection into live financial models. DSCR calculations, SBA loan amortization, IRR projections, sensitivity analysis — all from verified inputs, never estimated.', mode: 'Mode: FORMULA_INJECTION · Deterministic' },
    { icon: 'account_tree', title: 'Cap Table / Waterfall', desc: 'Structural reasoning for equity scenarios. Models debt-to-equity waterfalls and calculates returns by investor class across exit multiples. Available at L4+ deal complexity.', mode: 'Mode: REASONING · Multi-class equity' },
    { icon: 'draw', title: 'Document Generation', desc: 'Template-driven drafting for CIMs, LOIs, pitch decks, and deal memos. Maps verified deal terms into league-specific templates — L1 gets plain English, L5 gets rep & warranty insurance clauses.', mode: 'Mode: TEMPLATE_INJECTION · League-specific' },
  ];

  const industries = [
    { name: 'HVAC', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Premium asset, premium price. Best platform play in home services.' },
    { name: 'Pest Control', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Best recurring revenue model in home services. 70%+ monthly contracts.' },
    { name: 'Insurance Agency', badge: 'EXTREMELY ACTIVE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Most undervalued recurring revenue asset class. 90%+ retention rates.' },
    { name: 'IT / MSP', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Hottest SMB vertical. Cybersecurity demand + MRR model = PE premium.' },
  ];

  const comparisonRows = [
    { feature: 'Market conditions', ai: 'Training cutoff', smbx: 'Current market data + Market Heat scoring' },
    { feature: 'Financial precision', ai: 'Generates numbers', smbx: '6 specialized engines, deterministic math' },
    { feature: 'Local benchmarks', ai: 'National averages', smbx: 'MSA-level Census + BLS data' },
    { feature: 'Industry depth', ai: 'Generic for all sectors', smbx: '35 industries with PE tracking' },
    { feature: 'Deal complexity', ai: 'Same depth for all', smbx: 'League-adaptive L1–L6' },
    { feature: 'Process enforcement', ai: 'None — ask anything', smbx: '22-gate methodology' },
    { feature: 'Verification', ai: 'AI generates, you trust', smbx: 'AI suggests → you verify → engine calculates' },
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

  const leagues = [
    {
      icon: 'school', title: 'The Coach', range: 'Under $2M SDE · Owner-operated',
      field1Label: 'Speaks your language', field1: '"What you take home" not "discretionary cash flow." Step-by-step. SBA-focused. No jargon.',
      field2: 'Add-back identification, owner salary normalization. Yulia walks you through each one.',
      quote: '"Your SDE is $420K. At 3.2x, that\'s roughly $1.34M. But I found $45K in add-backs you missed — let me show you."',
    },
    {
      icon: 'analytics', title: 'The Analyst', range: '$2M–$10M EBITDA · Lower middle market',
      field1Label: 'Institutional terminology', field1: 'Working capital normalization. GAAP adjustments. Covenant analysis. PE buyer mapping.',
      field2: 'Full QoE framework — add-back schedule, trend analysis, seasonality review, working capital peg calculation.',
      quote: '"Your adjusted EBITDA is $3.4M after working capital normalization. Three PE platforms are active in your sector — let me model the competitive process."',
    },
    {
      icon: 'account_balance', title: 'The Partner', range: '$10M+ EBITDA · Institutional',
      field1Label: 'Board-level rigor', field1: 'LBO modeling, sensitivity analysis, arbitrage spreads, cross-border structures, regulatory considerations.',
      field2: 'Institutional QoE — forensic verification, synergy assumption testing, rep & warranty insurance analysis.',
      quote: '"At 8.5x entry and a 5-year hold, the base case IRR is 22% with two bolt-ons. Let me run the bear case with compressed exit multiples."',
    },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#dadadc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">How It Works</span>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">You talk. Yulia <span className="text-[#b0004a]">works.</span></h1>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2} className="lg:col-span-5 lg:pt-24">
            <p className={`text-xl leading-relaxed ${muted}`}>No intake forms. No 47-question wizard. No retainer before you know if this is even worth pursuing. Tell Yulia about your deal in plain language. She does the rest.</p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WATCH IT HAPPEN ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Watch It Happen</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight">One sentence starts the entire analysis</h2>
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
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">SDE Range</p><p className="text-lg font-black text-white">$360K–$540K</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">Multiple Range</p><p className="text-lg font-black text-white">2.8x–3.5x</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/40 uppercase font-bold mb-1">Est. Value</p><p className="text-lg font-black text-[#ffb2bf]">$1.08M–$1.89M</p></div>
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
              <h2 className="font-headline text-4xl font-black tracking-tight">Conversation → Analysis → Execution</h2>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Conversation', desc: 'Describe your deal in plain language. Yulia classifies your business, identifies your benchmarks, and starts building your financial profile — all while you\'re still talking.', badge: 'Free · No account', badgeColor: dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]' },
              { num: '2', title: 'Analysis', desc: 'Add-back discovery. Normalized earnings. Value range. Risk scoring. Market intelligence. Deal-readiness assessment. All yours to keep — even if you stop here.', badge: 'Free · Keep everything', badgeColor: dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]' },
              { num: '3', title: 'Execution', desc: 'One payment unlocks everything through closing and 180 days after. Deal room. Professional documents. Negotiation support. Closing logistics. Integration planning.', badge: '0.1% of SDE/EBITDA · $999 min', badgeColor: 'bg-[#b0004a]/10 text-[#b0004a]' },
            ].map((stage) => (
              <StaggerItem key={stage.num}>
                <div className={`rounded-3xl p-10 h-full ${dark ? 'bg-white border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#b0004a] flex items-center justify-center text-white font-black text-lg mb-8">{stage.num}</div>
                  <h3 className="font-headline text-2xl font-black mb-4">{stage.title}</h3>
                  <p className={`leading-relaxed mb-6 ${muted}`}>{stage.desc}</p>
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
              <h2 className="font-headline text-4xl font-black tracking-tight">Bloomberg charges $24,000 a year. You have Google.</h2>
              <p className={`text-lg leading-relaxed ${muted}`}>Institutional investors pay tens of thousands for real-time terminal access. For everyone else, the "Information Desert" is real — outdated averages, anecdotal advice, and rules of thumb that vary by 40% between markets.</p>
              <p className={`text-lg leading-relaxed ${muted}`}>smbX.ai connects the same federal data sources that power Wall Street research desks — and makes them conversational.</p>
              <p className={`font-bold text-xl border-l-4 border-[#b0004a] pl-6 ${emphasis}`}>The data exists. Nobody connected it. We did.</p>
            </div>
            <div className={`p-12 rounded-3xl text-white space-y-8 ${darkPanel}`}>
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

        {/* ═══ 5. AI ORCHESTRATION ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">AI Orchestration</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">Yulia isn't one AI. She's six specialized engines working together.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>General-purpose AI does one thing — generate text. smbX.ai routes every task to a purpose-built engine with strict constraints. Financial extraction uses zero-hallucination mode. Market intelligence uses live search grounding. Legal review uses a forensic auditor that only cites from your actual documents.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {engines.map((e) => (
              <StaggerItem key={e.title}>
                <div className={`rounded-2xl p-6 h-full ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">{e.icon}</span><h4 className="font-bold text-sm">{e.title}</h4></div>
                  <p className={`text-xs mb-3 ${muted}`}>{e.desc}</p>
                  <div className={`rounded-lg px-3 py-2 ${monoBg}`}><p className={`text-[10px] font-mono ${muted}`}>{e.mode}</p></div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal>
            <div className={`mt-8 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-white ${darkPanel}`}>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">edit_note</span><h4 className="font-bold">Author Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Creative</span></div>
                <p className="text-sm text-[#dadadc]/60">Generates CIMs, pitch decks, valuation narratives, market summaries. Synthesizes from multiple sources. This is the Yulia who writes the documents that close deals.</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">fact_check</span><h4 className="font-bold">Auditor Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Forensic</span></div>
                <p className="text-sm text-[#dadadc]/60">Verifies add-backs, extracts contract clauses, reviews tax returns. Only cites from your documents — never hallucinates. Returns "NOT FOUND" when information is missing.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. SEVEN DIMENSIONS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Analytical Framework</span>
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4">Every deal analyzed across seven dimensions. <span className="text-[#b0004a]">Simultaneously.</span></h2>
              <p className={`text-lg max-w-2xl ${muted}`}>Most tools check the financials. That misses six other factors that determine whether a deal closes, at what price, and whether the buyer succeeds after. Yulia runs all seven from your first sentence.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dimensions.map((d) => (
              <StaggerItem key={d.title}>
                <div className={`p-8 rounded-2xl hover:shadow-xl hover:shadow-[#b0004a]/5 transition-all h-full ${card}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">{d.icon}</span>
                  <h3 className="text-xl font-bold leading-tight mb-3">{d.title}</h3>
                  <p className={`text-sm ${muted}`}>{d.desc}</p>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem className="md:col-span-2">
              <div className="p-8 bg-[#b0004a] text-white rounded-2xl h-full">
                <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                <h3 className="font-headline text-3xl font-black mb-3">Forward Signals</h3>
                <p className="text-lg opacity-90">Where is your industry's multiple heading in the next 12–24 months? Yulia models macro shifts, lending cycles, PE dry powder, and sector-specific catalysts. When she says "move now" or "wait six months" — the data supports it.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 7. MARKET INTELLIGENCE ENGINE ═══ */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Market Intelligence</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Yulia doesn't wait for you to ask. She tells you when the market moves.</h2>
                <div className={`space-y-6 leading-[1.75] ${muted}`}>
                  <p>When you tell Yulia your industry, she runs a live Market Heat scan — pulling current PE consolidation trends, active buyer platforms, and multiple direction. If your sector is "hot," she increases the defensible valuation range. If it's cooling, she tells you before you overpay.</p>
                  <p>When the Fed changes rates, Yulia recalculates every DSCR model on the platform. If your buying power just dropped $150K, she tells you that morning — not after you've signed the LOI.</p>
                  <p>This isn't a feature you activate. It's running in the background from the moment you describe your deal.</p>
                </div>
              </div>
            </ScrollReveal>
            <StaggerContainer className="space-y-4">
              <StaggerItem>
                <div className={`rounded-2xl p-6 text-white ${darkPanel}`}>
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">local_fire_department</span>Market Heat Index</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Sector Alert', text: '"Veterinary is currently a Super-Hot sector. 14 PE-backed platforms actively acquiring. Position this as a platform play, not a standard sale."' },
                      { label: 'Multiple Trend', text: '"HVAC multiples up 0.5x in Q4 — residential service mix above 70% commanding 15% strategic premium."' },
                      { label: 'Rate Impact', text: '"SBA rates up 25bps yesterday. Your buying power reduced by $150K. Updated your affordability model."' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/5 rounded-xl p-4">
                        <p className="text-[10px] text-[#dadadc]/40 uppercase font-bold mb-1">{item.label}</p>
                        <p className="text-sm text-[#dadadc]/80">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <h4 className="font-bold text-sm mb-3">4-Layer Context Injection</h4>
                  <p className={`text-xs mb-4 ${muted}`}>Every response Yulia generates is shaped by four layers of real-time context — not just your conversation history.</p>
                  <div className="space-y-2">
                    {[
                      { num: '1', opacity: '', title: 'Constitution', desc: 'Core methodology rules, hard rails, forbidden actions' },
                      { num: '2', opacity: '/80', title: 'User Context', desc: 'League, role, deal history, risk profile' },
                      { num: '3', opacity: '/60', title: 'Deal Context', desc: 'Current gate, financials, documents, parties' },
                      { num: '4', opacity: '/40', title: 'Market Context', desc: 'Industry heat, regional pricing, macro overlay, recent comps' },
                    ].map((layer) => (
                      <div key={layer.num} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded bg-[#b0004a]${layer.opacity} flex items-center justify-center text-white text-[9px] font-bold`}>{layer.num}</div>
                        <div><p className="text-xs font-bold">{layer.title}</p><p className={`text-[10px] ${muted}`}>{layer.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 8. INDUSTRY INTELLIGENCE ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Industry Intelligence</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">35 industries. Opinionated rankings. Updated continuously.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>Yulia doesn't give the same advice to a plumbing company that she gives to a SaaS company. She carries deep knowledge about PE activity, multiple trends, SBA lending appetite, operational complexity, and first-timer suitability for every industry she covers.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {industries.map((ind) => (
              <StaggerItem key={ind.name}>
                <div className={`rounded-2xl p-6 h-full ${card}`}>
                  <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-sm">{ind.name}</h4><span className="text-[9px] bg-[#b0004a]/10 text-[#b0004a] px-2 py-1 rounded font-bold">{ind.badge}</span></div>
                  <div className={`space-y-2 text-xs ${muted}`}>
                    <div className="flex justify-between"><span>Multiple Trend</span><span className={`font-bold ${emphasis}`}>{ind.trend}</span></div>
                    <div className="flex justify-between"><span>First-Timer</span><span className="font-bold text-[#006630]">{ind.firstTimer}</span></div>
                    <div className="flex justify-between"><span>SBA Appetite</span><span className={`font-bold ${emphasis}`}>{ind.sba}</span></div>
                  </div>
                  <p className={`text-[10px] mt-3 italic ${muted}`}>{ind.note}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal>
            <div className={`rounded-2xl p-6 flex items-start gap-4 ${subtleBg}`}>
              <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">inventory_2</span>
              <div>
                <h4 className="font-bold mb-1">35 industries. 9 buyer profiles. Real math for each.</h4>
                <p className={`text-sm ${muted}`}>From commercial cleaning to SaaS, from first-time SBA buyers to PE-backed platforms — Yulia carries detailed intelligence on PE activity levels, multiple ranges, financing approaches, common mistakes, and specific entry points. Tell her your situation and she'll tell you where the opportunities are.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 9. LOCAL vs NATIONAL ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="border-l-8 border-[#b0004a] pl-8 mb-12">
              <h2 className="font-headline text-4xl font-black tracking-tight">The same business in two cities. Completely different deal.</h2>
              <p className={`text-xl mt-4 ${muted}`}>This is why national averages are dangerous. Every deal is local.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-white border border-zinc-800 shadow-sm' : 'bg-white border border-[#eeeef0] shadow-sm'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div><div className={`text-xs font-bold uppercase tracking-widest mb-2 ${muted}`}>Service Sector</div><h4 className="font-headline text-2xl font-black">Cleaning in Phoenix</h4></div>
                  <div className="bg-[#b0004a]/10 px-4 py-2 rounded-xl text-[#b0004a] font-bold text-sm">$380K SDE</div>
                </div>
                <div className="space-y-4 mb-8"><div className="flex items-center gap-3"><div className="w-10 h-1 bg-[#b0004a] rounded-full"></div><span className="text-sm font-bold">Labor Elasticity: HIGH</span></div><p className={`text-sm leading-relaxed ${muted}`}>Population growth driving demand, but labor costs rising faster than contract prices. Margin compression risk must be priced in.</p></div>
                <div className="text-4xl font-headline font-black">3.2x <span className={`text-sm font-medium ${muted}`}>Effective Multiple</span></div>
              </div>
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div><div className={`text-xs font-bold uppercase tracking-widest mb-2 ${muted}`}>Industrial Sector</div><h4 className="font-headline text-2xl font-black">Precision Manufacturing</h4></div>
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm ${dark ? 'bg-[#1a1c1e] text-white' : 'bg-[#1a1c1e] text-white'}`}>$12M EBITDA</div>
                </div>
                <div className="space-y-4 mb-8"><div className="flex items-center gap-3"><div className={`w-20 h-1 rounded-full ${dark ? 'bg-[#1a1c1e]' : 'bg-[#1a1c1e]'}`}></div><span className="text-sm font-bold">Barriers to Entry: EXTREME</span></div><p className={`text-sm leading-relaxed ${muted}`}>Specialized IP and long-term contracts create a moat. Strategic buyers paying a 25% premium over financial sponsors.</p></div>
                <div className="text-4xl font-headline font-black">8.4x <span className={`text-sm font-medium ${muted}`}>Effective Multiple</span></div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 10. LEAGUE-ADAPTIVE INTELLIGENCE ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Adaptive Intelligence</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">A $400K cleaning company and a $40M manufacturer get completely different Yulias.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>Yulia classifies your deal by complexity and adapts everything — language, metrics, analytical depth, buyer strategy, financial verification rigor, and the documents she produces. You never select a plan. The deal determines everything.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <StaggerItem key={league.title}>
                <div className={`rounded-2xl overflow-hidden h-full ${card}`}>
                  <div className={`bg-[#b0004a]/5 p-6 border-b ${borderColor}`}>
                    <div className="flex items-center gap-3 mb-2"><span className="material-symbols-outlined text-[#b0004a]">{league.icon}</span><h3 className="font-black text-lg">{league.title}</h3></div>
                    <p className={`text-xs ${muted}`}>{league.range}</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div><p className={`text-[9px] uppercase font-bold mb-1 ${muted}`}>{league.field1Label}</p><p className={`text-sm ${muted}`}>{league.field1}</p></div>
                    <div><p className={`text-[9px] uppercase font-bold mb-1 ${muted}`}>Verification depth</p><p className={`text-sm ${muted}`}>{league.field2}</p></div>
                    <div className={`p-3 rounded-lg ${dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}`}><p className={`text-xs italic ${muted}`}>{league.quote}</p></div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#b0004a]/10 border border-[#b0004a]/20' : 'bg-[#b0004a]/5 border border-[#b0004a]/15'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">auto_fix_high</span>
                <div><h4 className="font-bold mb-1">Industry Override</h4><p className={`text-sm ${muted}`}>Veterinary, dental, HVAC, managed services, and pest control switch to EBITDA automatically above $1.5M revenue — because PE roll-ups trade on institutional metrics even at small scale.</p></div>
              </div>
              <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">verified</span>
                <div><h4 className="font-bold mb-1">You never select a tier</h4><p className={`text-sm ${muted}`}>No "Basic vs Pro vs Enterprise." Yulia classifies from the financials you share and explains the classification in plain language. The deal determines the depth.</p></div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 11. THE MATH ENGINE + VERIFICATION LOOP ═══ */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">The Math Engine</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-8">AI that interprets. Math that doesn't hallucinate.</h2>
              <div className={`space-y-6 leading-[1.75] ${muted}`}>
                <p>The AI layer decides what to calculate. The deterministic engine guarantees the math is right. Every financial claim passes through a three-step verification loop — AI suggests, you verify, engine calculates.</p>
                <p>This is why your valuation is defensible. It was built the same way a buyer's QoE firm would build it.</p>
              </div>
              <div className={`mt-10 rounded-2xl p-6 text-white ${darkPanel}`}>
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">sync</span>The Verification Loop</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                    <div><p className="text-sm font-semibold">AI Identifies</p><p className="text-xs text-[#dadadc]/50">Scans for add-backs — vehicles, rent, travel, one-time legal fees, family payroll — using IRS industry benchmarks.</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                    <div><p className="text-sm font-semibold">You Verify</p><p className="text-xs text-[#dadadc]/50">AI cannot confirm add-backs. You review each one. Your judgment, your numbers. Yulia explains why she flagged it — you decide.</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">3</div>
                    <div><p className="text-sm font-semibold">Engine Calculates</p><p className="text-xs text-[#dadadc]/50">Only verified add-backs enter the formula. Deterministic engine recalculates SDE/EBITDA and updates every downstream model.</p></div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <StaggerContainer className="lg:col-span-7 space-y-4">
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">calculate</span><h4 className="font-bold">SDE (Seller Discretionary Earnings)</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${codeBg}`}>SDE = Net Income + Owner Salary + D&A + Interest + One-Time + Verified Add-Backs</div>
                  <p className={`text-xs mt-3 ${muted}`}>"Verified" = you confirmed it. The AI flagged it; you approved it; the engine counted it.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">monitoring</span><h4 className="font-bold">Adjusted EBITDA</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${codeBg}`}>Adj. EBITDA = Net Income + D&A + Interest + Taxes + Verified Add-Backs − Non-Recurring</div>
                  <p className={`text-xs mt-3 ${muted}`}>GAAP-normalized. The number a PE buyer's QoE firm will verify.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">account_balance_wallet</span><h4 className="font-bold">DSCR (Debt Service Coverage)</h4></div>
                  <div className={`rounded-xl p-4 font-mono text-sm ${codeBg}`}>DSCR = EBITDA ÷ Annual Debt Service</div>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#006630]"></span><span className={`text-xs ${muted}`}>SBA minimum: 1.25×</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1a1c1e]"></span><span className={`text-xs ${muted}`}>Conventional: 1.50×</span></div>
                  </div>
                  <p className={`text-xs mt-3 ${muted}`}>Modeled at current rates. If the deal doesn't clear, Yulia tells you before you waste time.</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className={`rounded-2xl p-6 text-white ${darkPanel}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">speed</span><h4 className="font-bold">Valuation Defense</h4></div>
                  <div className="bg-white/5 rounded-xl p-4 font-mono text-sm text-[#dadadc]">Value = Base Multiple × Adj. Earnings + Growth Premium + Margin Premium − Risk Discount</div>
                  <p className="text-xs text-[#dadadc]/50 mt-3">Every component sourced from verified comparables and the seven-dimension analysis. A "Defensible Thesis" — not an estimate.</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 12. GATE SYSTEM ═══ */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Enforced Methodology</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">22 gates. Four journeys. You can't skip steps.</h2>
                <div className={`space-y-6 leading-[1.75] ${muted}`}>
                  <p>Drafting an LOI before your financials are normalized means negotiating from a wrong number. Building deal materials before your value readiness is scored means presenting fixable weaknesses to buyers. Skipping due diligence coordination means discovering deal-killers at the closing table.</p>
                  <p>Yulia enforces a gate system with specific completion triggers. She advances you when the prerequisite work is done — and not before.</p>
                </div>
                <div className={`mt-8 rounded-2xl p-6 ${subtleBg}`}>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">lock</span>In practice</h4>
                  <div className={`space-y-3 text-sm ${muted}`}>
                    <p>→ No CIM until Value Readiness is scored</p>
                    <p>→ No LOI until the acquisition model clears DSCR</p>
                    <p>→ No closing coordination until DD is resolved</p>
                    <p>→ No post-close plan until the deal actually closes</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <StaggerContainer className="space-y-4">
              {/* Sell gates */}
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">storefront</span><h4 className="font-bold">Sell — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {[{ id: 'S0', label: 'Profile', free: true }, { id: 'S1', label: 'Financials', free: true }, { id: 'S2', label: 'Valuation', free: false }, { id: 'S3', label: 'Prepare', free: false }, { id: 'S4', label: 'Negotiate', free: false }, { id: 'S5', label: 'Close', free: false }].map((g) => (
                      <div key={g.id} className="flex-1 text-center">
                        <div className={`rounded-lg py-2 px-1 mb-1 ${g.free ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'}`}><span className={`text-[10px] font-bold ${g.free ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g.id}</span></div>
                        <p className={`text-[8px] ${muted}`}>{g.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
              {/* Buy gates */}
              <StaggerItem>
                <div className={`rounded-2xl p-6 ${card}`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">shopping_bag</span><h4 className="font-bold">Buy — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {[{ id: 'B0', label: 'Thesis', free: true }, { id: 'B1', label: 'Source', free: true }, { id: 'B2', label: 'Underwrite', free: false }, { id: 'B3', label: 'Diligence', free: false }, { id: 'B4', label: 'Negotiate', free: false }, { id: 'B5', label: 'Close', free: false }].map((g) => (
                      <div key={g.id} className="flex-1 text-center">
                        <div className={`rounded-lg py-2 px-1 mb-1 ${g.free ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'}`}><span className={`text-[10px] font-bold ${g.free ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g.id}</span></div>
                        <p className={`text-[8px] ${muted}`}>{g.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
              {/* Raise + Integrate gates */}
              <StaggerItem>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-2xl p-6 ${card}`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#b0004a]">trending_up</span><h4 className="font-bold text-sm">Raise — 6 Gates</h4></div>
                    <div className="flex gap-1">
                      {['R0', 'R1', 'R2', 'R3', 'R4', 'R5'].map((id) => (
                        <div key={id} className="flex-1 text-center"><div className={`rounded-lg py-1.5 mb-1 ${['R0', 'R1'].includes(id) ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'}`}><span className={`text-[9px] font-bold ${['R0', 'R1'].includes(id) ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{id}</span></div></div>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-2xl p-6 ${card}`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#b0004a]">merge</span><h4 className="font-bold text-sm">Integrate — 4 Gates</h4></div>
                    <div className="flex gap-1">
                      {['I0', 'I1', 'I2', 'I3'].map((id) => (
                        <div key={id} className="flex-1 text-center"><div className={`rounded-lg py-1.5 mb-1 ${id === 'I0' ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'}`}><span className={`text-[9px] font-bold ${id === 'I0' ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{id}</span></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
              <div className="flex items-center gap-3 px-2">
                <div className={`w-3 h-3 rounded-sm ${dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10'}`}></div><span className={`text-[10px] ${muted}`}>Free</span>
                <div className="w-3 h-3 rounded-sm bg-[#b0004a]/10 ml-3"></div><span className={`text-[10px] ${muted}`}>Execution fee</span>
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 13. CHATGPT COMPARISON ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-4xl font-black text-center mb-12">What does this do that <span className="text-[#b0004a]">ChatGPT can't?</span></h2>
              <div className={`overflow-hidden rounded-2xl ${card}`}>
                <table className="w-full text-left">
                  <thead>
                    <tr className={dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}>
                      <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Capability</th>
                      <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Standard AI</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#b0004a]">smbX.ai</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm ${dark ? 'divide-y divide-zinc-800' : 'divide-y divide-[#eeeef0]'}`}>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature}>
                        <td className="px-6 py-4 font-semibold">{row.feature}</td>
                        <td className={`px-6 py-4 ${muted}`}>{row.ai}</td>
                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#b0004a] text-sm">check_circle</span> {row.smbx}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 14. FOUR JOURNEYS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline text-4xl font-bold tracking-tight">Every side of the deal. One platform.</h2>
              <p className={`mt-3 ${muted}`}>Yulia adapts the methodology to your specific journey.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journeys.map((j) => (
              <StaggerItem key={j.title}>
                <a href={j.href} className={`p-8 rounded-2xl hover:shadow-lg transition-all group flex gap-6 items-start ${card}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-3xl shrink-0 mt-1 group-hover:scale-110 transition-transform">{j.icon}</span>
                  <div>
                    <h3 className="text-xl font-black mb-2">{j.title}</h3>
                    <p className={`text-sm leading-relaxed ${muted}`}>{j.desc}</p>
                    <span className="text-[#b0004a] text-xs font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 15. PRIVACY ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className={`rounded-3xl p-10 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${darkPanel}`}>
              <div>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-6">shield</span>
                <h2 className="text-3xl font-headline font-black text-white mb-6">Your data never trains a public model.</h2>
                <p className="text-[#dadadc]/60 leading-relaxed mb-4">Every conversation and document is processed in a private instance. Your financial data is encrypted at rest, encrypted in transit, and never used to improve general AI models.</p>
                <p className="text-[#dadadc]/60 leading-relaxed">You can use smbX.ai without creating an account. If you do, your data is siloed and exportable. If you leave, your data goes with you or gets deleted — your choice.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: 'lock', label: 'Encrypted at Rest & Transit' }, { icon: 'visibility_off', label: 'No Model Training' }, { icon: 'cloud_off', label: 'Isolated Processing' }, { icon: 'download', label: 'Full Data Export' }].map((item) => (
                  <div key={item.label} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                    <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-2">{item.icon}</span>
                    <h4 className="text-white font-bold text-sm">{item.label}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 16. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">See for <span className="text-[#b0004a] italic">yourself.</span></h2>
              <p className={`text-xl mb-12 max-w-2xl mx-auto ${muted}`}>Tell Yulia about your deal. Watch the intelligence layer work. Keep everything she finds — free, no account required.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-black text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-black text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
