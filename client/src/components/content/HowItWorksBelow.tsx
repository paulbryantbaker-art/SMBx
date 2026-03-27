import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function HowItWorksBelow({ dark }: { dark: boolean }) {

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  // Shared class helpers
  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const muted = dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]';
  const codeBg = dark ? 'bg-[#2f3133] text-[#f9f9fc]' : 'bg-[#f3f3f6] text-[#1a1c1e]';
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
    { icon: 'description', title: 'Financial Extraction', desc: 'Zero-hallucination mode. Temperature 0.0. Extracts exact values from tax returns and P&Ls without rounding or calculating. Displays the extracted number next to the PDF source.', mode: 'Mode: JSON_OUTPUT_ONLY · Temp: 0.0' },
    { icon: 'travel_explore', title: 'Market Intelligence', desc: 'Live search grounding. Ignores training data. Pulls current sector multiples, PE activity, and consolidation trends from real-time sources. This is how Yulia knows your industry is "hot."', mode: 'Mode: SEARCH_GROUNDING · Live data' },
    { icon: 'policy', title: 'Legal / Forensic Auditor', desc: 'Walled garden. Answers strictly from your uploaded documents. Returns "NOT FOUND" if it can\'t cite a source. Every claim includes a page reference. Never infers or assumes.', mode: 'Mode: GROUNDED_ONLY · Temp: 0.1' },
    { icon: 'calculate', title: 'Deal Modeling', desc: 'Formula injection into live financial models. DSCR calculations, SBA loan amortization, IRR projections, sensitivity analysis — all from verified inputs, never estimated.', mode: 'Mode: FORMULA_INJECTION · Deterministic' },
    { icon: 'account_tree', title: 'Cap Table / Waterfall', desc: 'Structural reasoning for complex equity. Models Senior Debt → Mezzanine → Preferred → Common waterfalls. Calculates MOIC by investor class across exit scenarios.', mode: 'Mode: REASONING · Multi-class equity' },
    { icon: 'draw', title: 'Document Generation', desc: 'Template-driven drafting for CIMs, LOIs, pitch decks, and deal memos. Maps verified deal terms into league-specific templates — L1 gets plain English, L5 gets rep & warranty insurance clauses.', mode: 'Mode: TEMPLATE_INJECTION · League-specific' },
  ];

  const industries = [
    { name: 'HVAC', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Premium asset, premium price. Best platform play in home services.' },
    { name: 'Pest Control', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Best recurring revenue model in home services. 70%+ monthly contracts.' },
    { name: 'Insurance Agency', badge: 'EXTREMELY ACTIVE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Most undervalued recurring revenue asset class. 90%+ retention rates.' },
    { name: 'IT / MSP', badge: 'VERY ACTIVE PE', trend: 'Expanding ↑', firstTimer: 'Good', sba: 'High', note: 'Hottest SMB vertical. Cybersecurity demand + MRR model = PE premium.' },
  ];

  const comparisonRows = [
    { feature: 'Market conditions', ai: 'Training cutoff', smbx: 'Live data feeds + Market Heat Index' },
    { feature: 'Financial precision', ai: 'Generates numbers', smbx: '6 specialized engines, deterministic math' },
    { feature: 'Local benchmarks', ai: 'National averages', smbx: 'MSA-level Census + BLS data' },
    { feature: 'Industry depth', ai: 'Generic for all sectors', smbx: '35 industries with PE tracking' },
    { feature: 'Deal complexity', ai: 'Same depth for all', smbx: 'League-adaptive L1–L6' },
    { feature: 'Process enforcement', ai: 'None — ask anything', smbx: '22-gate methodology' },
    { feature: 'Verification', ai: 'AI generates, you trust', smbx: 'AI suggests → you verify → engine calculates' },
    { feature: 'Your data', ai: 'Trains the model', smbx: 'Private. Always.' },
  ];

  const ibRows = [
    { ib: 'Business valuation ($2K–$10K)', smbx: '3 methodologies, math shown' },
    { ib: 'CIM / deal materials ($5K–$25K)', smbx: '25–40 pages, league-adapted' },
    { ib: 'Financial modeling ($3K–$10K)', smbx: 'DCF, sensitivity, cap table' },
    { ib: 'Market intelligence ($2K–$5K)', smbx: 'Live data + Market Heat' },
    { ib: 'Buyer identification (included)', smbx: 'Scored & ranked by type' },
    { ib: 'DD coordination (included)', smbx: '50–100 items tracked' },
    { ib: 'Negotiation prep (included)', smbx: 'Comps + counter-offers drafted' },
    { ib: 'Closing coordination (included)', smbx: 'Checklist + funds flow' },
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
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="max-w-4xl">
              <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">How It Works</span>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">Every step of your deal.<br/><span className="text-[#b0004a]">Guided.</span></h1>
              <p className={`text-xl leading-relaxed max-w-2xl ${muted}`}>Selling a business, buying one, raising capital, or integrating an acquisition — each one has a right way to do it. A sequence that protects you. A methodology that catches what you'd miss. We built it. Yulia delivers it through a conversation.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 2. FOUR JOURNEYS OVERVIEW ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: 'storefront', title: 'Sellers', desc: '6 gates from first conversation to wire transfer. Value discovery, add-back identification, deal preparation, buyer matching, negotiation coaching, closing coordination.', timeline: '6 months – 2 years →' },
                { icon: 'shopping_bag', title: 'Buyers', desc: '6 gates from thesis to close + 180 days. Deal screening, financial modeling, SBA qualification, due diligence, negotiation, post-close integration.', timeline: 'Thesis → Close + 180 days →' },
                { icon: 'trending_up', title: 'Founders Raising', desc: '6 gates from readiness to close. Dilution modeling, pitch materials, investor targeting, term sheet analysis, cap table negotiation.', timeline: 'Readiness → Close →' },
                { icon: 'merge', title: 'New Owners', desc: '4 gates across 180 days. Day Zero protocol, employee and customer stabilization, operational assessment, value creation execution.', timeline: 'Day 0 → Day 180 →' },
              ].map((j) => (
                <StaggerItem key={j.title}>
                  <div className={`${card} rounded-2xl p-8 hover:shadow-lg transition-all h-full`}>
                    <span className="material-symbols-outlined text-[#b0004a] text-3xl mb-4">{j.icon}</span>
                    <h3 className="font-headline font-black text-xl mb-2">{j.title}</h3>
                    <p className={`text-sm leading-relaxed ${muted}`}>{j.desc}</p>
                    <p className="text-xs text-[#b0004a] font-bold mt-4">{j.timeline}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="mt-6 text-center">
              <p className={`text-sm ${muted}`}>22 gates. 4 journeys. One methodology. Every user guided through every step — from their first sentence to 180 days after close.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. THE GATE SYSTEM ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Enforced Methodology</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Yulia won't let you skip steps.</h2>
                <div className={`space-y-6 editorial ${muted}`}>
                  <p>Most AI tools let you ask anything in any order. That's fine for general questions. It's dangerous when there's real money on the line.</p>
                  <p>Drafting an LOI before your financials are normalized means negotiating from a wrong number. Presenting deal materials before your value readiness is scored means showing fixable weaknesses to buyers. Skipping due diligence coordination means discovering deal-killers at the closing table.</p>
                  <p className={`${emphasis} font-semibold`}>smbX.ai enforces a gate system. Each gate has specific completion triggers that Yulia verifies from your conversation and your data. She advances you when the prerequisite work is done — and not before.</p>
                  <p>This isn't a limitation. It's the methodology that prevents the mistakes most first-time deal participants make.</p>
                </div>
                <div className={`mt-8 ${darkPanel} rounded-2xl p-6 text-white`}>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">lock</span>What this means in practice</h4>
                  <div className="space-y-3 text-sm text-[#dadadc]/70">
                    <p>→ No valuation until your financials are normalized and add-backs verified</p>
                    <p>→ No deal materials until your Value Readiness Report is scored</p>
                    <p>→ No LOI until the acquisition model clears DSCR at current rates</p>
                    <p>→ No closing coordination until DD items are tracked and resolved</p>
                    <p>→ No post-close plan until the deal actually closes — with real DD findings</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {/* Sell gates */}
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">storefront</span><h4 className="font-headline font-bold">Sell — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {['S0','S1','S2','S3','S4','S5'].map((g, i) => (
                      <div key={g} className="flex-1 text-center">
                        <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'} rounded-lg py-2 px-1 mb-1`}>
                          <span className={`text-[10px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g}</span>
                        </div>
                        <p className={`text-[8px] ${muted}`}>{['Profile','Financials','Valuation','Prepare','Negotiate','Close'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Buy gates */}
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">shopping_bag</span><h4 className="font-headline font-bold">Buy — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {['B0','B1','B2','B3','B4','B5'].map((g, i) => (
                      <div key={g} className="flex-1 text-center">
                        <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'} rounded-lg py-2 px-1 mb-1`}>
                          <span className={`text-[10px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g}</span>
                        </div>
                        <p className={`text-[8px] ${muted}`}>{['Thesis','Source','Underwrite','Diligence','Negotiate','Close'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Raise + Integrate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${card} rounded-2xl p-6`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#b0004a]">trending_up</span><h4 className="font-headline font-bold text-sm">Raise — 6 Gates</h4></div>
                    <div className="flex gap-1">
                      {['R0','R1','R2','R3','R4','R5'].map((g, i) => (
                        <div key={g} className="flex-1 text-center">
                          <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'} rounded-lg py-1.5 mb-1`}>
                            <span className={`text-[9px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`${card} rounded-2xl p-6`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#b0004a]">merge</span><h4 className="font-headline font-bold text-sm">Integrate — 4 Gates</h4></div>
                    <div className="flex gap-1">
                      {['I0','I1','I2','I3'].map((g, i) => (
                        <div key={g} className="flex-1 text-center">
                          <div className={`${i < 1 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#b0004a]/10'} rounded-lg py-1.5 mb-1`}>
                            <span className={`text-[9px] font-bold ${i < 1 ? 'text-[#006630]' : 'text-[#b0004a]'}`}>{g}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <div className={`w-3 h-3 rounded-sm ${dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10'}`} />
                  <span className={`text-[10px] ${muted}`}>Free</span>
                  <div className="w-3 h-3 rounded-sm bg-[#b0004a]/10 ml-3" />
                  <span className={`text-[10px] ${muted}`}>Execution fee</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. CONVERSATION DEMO ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">What It Feels Like</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight">The methodology is delivered through a conversation</h2>
              <p className={`mt-3 max-w-2xl ${muted}`}>No intake forms. No 47-question wizard. You describe your situation in plain language. Yulia guides you through the methodology — one gate at a time — while doing the heavy lifting in the background.</p>
            </div>
            <div className={`${darkPanel} rounded-3xl p-8 md:p-12`}>
              <div className="max-w-4xl mx-auto space-y-6">
                {/* User */}
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">I own a residential cleaning company in Phoenix. About $1.8M revenue. Thinking about selling sometime in the next year.</div>
                </div>
                {/* Yulia initial */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Residential cleaning in Phoenix — I know this market well. Let me run some numbers while we talk.
                    <span className="block mt-3 text-[#dadadc]/60 text-xs italic">Classifying: NAICS 561720 · Maricopa County MSA · Gate S0 initiated · pulling Census, BLS, SBA data...</span>
                  </div>
                </div>
                {/* Yulia analysis */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0" />
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Phoenix residential cleaning trades at 2.8x–3.5x SDE for owner-operated businesses. At $1.8M revenue, your SDE is probably in the $360K–$540K range. That puts your business at roughly <span className="text-[#ffb2bf] font-bold">$1.08M–$1.89M.</span>
                    <span className="block mt-3 font-semibold">But here's what I need to sharpen that range: how much are you paying yourself, and are you running any personal expenses through the business?</span>
                  </div>
                </div>
                {/* Data cards */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0" />
                  <div className="grid grid-cols-3 gap-3 max-w-[80%]">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">SDE Range</p><p className="text-lg font-black text-white">$360K–$540K</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Multiple Range</p><p className="text-lg font-black text-white">2.8x–3.5x</p></div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Est. Value</p><p className="text-lg font-black text-[#ffb2bf]">$1.08M–$1.89M</p></div>
                  </div>
                </div>
                {/* User reply */}
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">My salary is $120K and yeah, there's probably $40–50K in personal stuff — car, phone, some travel.</div>
                </div>
                {/* Yulia refined */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    That changes the picture. With $120K salary add-back and $45K in personal expenses, your adjusted SDE jumps to <span className="text-[#ffb2bf] font-bold">$525K</span>. At current Phoenix multiples, that's <span className="text-[#ffb2bf] font-bold">$1.47M–$1.84M</span>.
                    <span className="block mt-3 font-semibold">Are you paying rent to a property you own? That's one of the most common hidden add-backs in this industry.</span>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-white/10 text-center">
                <p className="text-[#dadadc]/60 text-sm">90 seconds. No signup. No credit card. Yulia is already in Gate S1 — normalizing your financials — and she'll keep going until the picture is complete.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. AI ORCHESTRATION ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">AI Orchestration</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">Yulia isn't one AI. She's six specialized engines working together.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>General-purpose AI does one thing — generate text. smbX.ai routes every task to a purpose-built engine with strict constraints. Financial extraction uses zero-hallucination mode. Market intelligence uses live search grounding. Legal review uses a forensic auditor that only cites from your actual documents.</p>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {engines.map((e) => (
                <StaggerItem key={e.title}>
                  <div className={`${card} rounded-2xl p-6 h-full`}>
                    <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">{e.icon}</span><h4 className="font-bold text-sm">{e.title}</h4></div>
                    <p className={`text-xs mb-3 ${muted}`}>{e.desc}</p>
                    <div className={`${monoBg} rounded-lg px-3 py-2`}><p className={`text-[10px] font-mono ${muted}`}>{e.mode}</p></div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            {/* Author vs Auditor */}
            <div className={`mt-8 ${darkPanel} rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-white`}>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">edit_note</span><h4 className="font-bold">Author Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Creative</span></div>
                <p className="text-sm text-[#dadadc]/60">Generates CIMs, pitch decks, valuation narratives, market summaries. Synthesizes from multiple sources. This is the Yulia who writes the documents that close deals.</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">fact_check</span><h4 className="font-bold">Auditor Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Forensic</span></div>
                <p className="text-sm text-[#dadadc]/60">Verifies add-backs, extracts contract clauses, reviews tax returns. Only cites from your documents — never hallucinates. Returns "NOT FOUND" when information is missing.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. SEVEN DIMENSIONS ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Analytical Framework</span>
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4">Every deal analyzed across seven dimensions. <span className="text-[#b0004a]">Simultaneously.</span></h2>
              <p className={`text-lg max-w-2xl ${muted}`}>Most tools check the financials. That misses six other factors that determine whether a deal closes, at what price, and whether the buyer succeeds after. Yulia runs all seven from your first sentence.</p>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {dimensions.map((d) => (
                <StaggerItem key={d.title}>
                  <div className={`p-8 ${card} rounded-2xl hover:shadow-xl hover:shadow-[#b0004a]/5 transition-all h-full`}>
                    <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">{d.icon}</span>
                    <h3 className="font-headline text-xl font-bold leading-tight mb-3">{d.title}</h3>
                    <p className={`text-sm ${muted}`}>{d.desc}</p>
                  </div>
                </StaggerItem>
              ))}
              <StaggerItem>
                <div className="md:col-span-2 p-8 bg-[#b0004a] text-white rounded-2xl">
                  <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                  <h3 className="font-headline text-3xl font-black mb-3">Forward Signals</h3>
                  <p className="text-lg opacity-90">Where is your industry's multiple heading in the next 12–24 months? Yulia models macro shifts, lending cycles, PE dry powder, and sector-specific catalysts. When she says "move now" or "wait six months" — the data supports it.</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </section>
        </ScrollReveal>

        {/* ═══ 7. MARKET INTELLIGENCE ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Market Intelligence</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Yulia doesn't wait for you to ask. She tells you when the market moves.</h2>
                <div className={`space-y-6 editorial ${muted}`}>
                  <p>When you tell Yulia your industry, she runs a live Market Heat scan — pulling current PE consolidation trends, active buyer platforms, and multiple direction. If your sector is "hot," she increases the defensible valuation range. If it's cooling, she tells you before you overpay.</p>
                  <p>When the Fed changes rates, Yulia recalculates every DSCR model on the platform. If your buying power just dropped $150K, she tells you that morning — not after you've signed the LOI.</p>
                  <p>This isn't a feature you activate. It's running in the background from the moment you describe your deal.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`${darkPanel} rounded-2xl p-6 text-white`}>
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">local_fire_department</span>Market Heat Index</h4>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-xl p-4"><p className="text-[10px] text-[#dadadc]/60 uppercase font-bold mb-1">Sector Alert</p><p className="text-sm text-[#dadadc]/80">"Veterinary is currently a Super-Hot sector. 14 PE-backed platforms actively acquiring. Position this as a platform play, not a standard sale."</p></div>
                    <div className="bg-white/5 rounded-xl p-4"><p className="text-[10px] text-[#dadadc]/60 uppercase font-bold mb-1">Multiple Trend</p><p className="text-sm text-[#dadadc]/80">"HVAC multiples up 0.5x in Q4 — residential service mix above 70% commanding 15% strategic premium."</p></div>
                    <div className="bg-white/5 rounded-xl p-4"><p className="text-[10px] text-[#dadadc]/60 uppercase font-bold mb-1">Rate Impact</p><p className="text-sm text-[#dadadc]/80">"SBA rates up 25bps yesterday. Your buying power reduced by $150K. Updated your affordability model."</p></div>
                  </div>
                </div>
                <div className={`${card} rounded-2xl p-6`}>
                  <h4 className="font-bold text-sm mb-3">4-Layer Context Injection</h4>
                  <p className={`text-xs mb-4 ${muted}`}>Every response Yulia generates is shaped by four layers of real-time context — not just your conversation history.</p>
                  <div className="space-y-2">
                    {[
                      { n: '1', label: 'Constitution', desc: 'Core methodology rules, hard rails, forbidden actions', opacity: '' },
                      { n: '2', label: 'User Context', desc: 'League, role, deal history, risk profile', opacity: '/80' },
                      { n: '3', label: 'Deal Context', desc: 'Current gate, financials, documents, parties', opacity: '/60' },
                      { n: '4', label: 'Market Context', desc: 'Industry heat, regional pricing, macro overlay, recent comps', opacity: '/40' },
                    ].map((l) => (
                      <div key={l.n} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded bg-[#b0004a]${l.opacity} flex items-center justify-center text-white text-[9px] font-bold`}>{l.n}</div>
                        <div><p className="text-xs font-bold">{l.label}</p><p className={`text-[10px] ${muted}`}>{l.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 8. INDUSTRY INTELLIGENCE ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Industry Intelligence</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">35 industries. Opinionated rankings. Updated continuously.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>Yulia doesn't give the same advice to a plumbing company that she gives to a SaaS company. She carries deep knowledge about PE activity, multiple trends, SBA lending appetite, operational complexity, and first-timer suitability for every industry she covers.</p>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {industries.map((ind) => (
                <StaggerItem key={ind.name}>
                  <div className={`${card} rounded-2xl p-6 h-full`}>
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
            <div className={`${subtleBg} rounded-2xl p-6 flex items-start gap-4`}>
              <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">inventory_2</span>
              <div>
                <h4 className="font-bold mb-1">35 industries. 9 buyer profiles. Real math for each.</h4>
                <p className={`text-sm ${muted}`}>From commercial cleaning to SaaS, from first-time SBA buyers to PE-backed platforms — Yulia carries detailed intelligence on PE activity levels, multiple ranges, financing approaches, common mistakes, and specific entry points. Tell her your situation and she'll tell you where the opportunities are.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 9. LOCAL vs NATIONAL ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="border-l-8 border-[#b0004a] pl-8 mb-12">
              <h2 className="font-headline text-4xl font-black tracking-tight">The same business in two cities. Completely different deal.</h2>
              <p className={`text-xl mt-4 ${muted}`}>This is why national averages are dangerous. Every deal is local.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className={`flex-1 bg-white p-10 rounded-3xl border ${borderColor} shadow-sm`}>
                <div className="flex justify-between items-start mb-8">
                  <div><div className="text-xs font-bold text-[#5d5e61] uppercase tracking-widest mb-2">Service Sector</div><h4 className="text-2xl font-black text-[#1a1c1e]">Cleaning in Phoenix</h4></div>
                  <div className="bg-[#b0004a]/10 px-4 py-2 rounded-xl text-[#b0004a] font-bold text-sm">$380K SDE</div>
                </div>
                <div className="space-y-4 mb-8"><div className="flex items-center gap-3"><div className="w-10 h-1 bg-[#b0004a] rounded-full" /><span className="text-sm font-bold text-[#1a1c1e]">Labor Elasticity: HIGH</span></div><p className="text-sm text-[#5d5e61] leading-relaxed">Population growth driving demand, but labor costs rising faster than contract prices. Margin compression risk must be priced in.</p></div>
                <div className="text-4xl font-black text-[#1a1c1e]">3.2x <span className="text-sm font-medium text-[#5d5e61]">Effective Multiple</span></div>
              </div>
              <div className={`flex-1 ${subtleBg} p-10 rounded-3xl`}>
                <div className="flex justify-between items-start mb-8">
                  <div><div className={`text-xs font-bold uppercase tracking-widest mb-2 ${muted}`}>Industrial Sector</div><h4 className="text-2xl font-black">Precision Manufacturing</h4></div>
                  <div className={`${darkPanel} text-white px-4 py-2 rounded-xl font-bold text-sm`}>$12M EBITDA</div>
                </div>
                <div className="space-y-4 mb-8"><div className="flex items-center gap-3"><div className={`w-20 h-1 ${dark ? 'bg-[#f9f9fc]' : 'bg-[#1a1c1e]'} rounded-full`} /><span className="text-sm font-bold">Barriers to Entry: EXTREME</span></div><p className={`text-sm leading-relaxed ${muted}`}>Specialized IP and long-term contracts create a moat. Strategic buyers paying a 25% premium over financial sponsors.</p></div>
                <div className="text-4xl font-black">8.4x <span className={`text-sm font-medium ${muted}`}>Effective Multiple</span></div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 10. LEAGUE-ADAPTIVE INTELLIGENCE ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Adaptive Intelligence</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">A $400K cleaning company and a $40M manufacturer get completely different Yulias.</h2>
              <p className={`text-lg max-w-3xl ${muted}`}>Yulia classifies your deal by complexity and adapts everything — language, metrics, analytical depth, buyer strategy, financial verification rigor, and the documents she produces. You never select a plan. The deal determines everything.</p>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leagues.map((l) => (
                <StaggerItem key={l.title}>
                  <div className={`${card} rounded-2xl overflow-hidden h-full`}>
                    <div className={`bg-[#b0004a]/5 p-6 border-b ${borderColor}`}>
                      <div className="flex items-center gap-3 mb-2"><span className="material-symbols-outlined text-[#b0004a]">{l.icon}</span><h3 className="font-headline font-black text-lg">{l.title}</h3></div>
                      <p className={`text-xs ${muted}`}>{l.range}</p>
                    </div>
                    <div className="p-6 space-y-3">
                      <div><p className={`text-[9px] uppercase font-bold mb-1 ${muted}`}>{l.field1Label}</p><p className={`text-sm ${muted}`}>{l.field1}</p></div>
                      <div><p className={`text-[9px] uppercase font-bold mb-1 ${muted}`}>Verification depth</p><p className={`text-sm ${muted}`}>{l.field2}</p></div>
                      <div className={`${monoBg} p-3 rounded-lg`}><p className={`text-xs italic ${muted}`}>{l.quote}</p></div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className={`${dark ? 'bg-[#b0004a]/10 border border-[#b0004a]/20' : 'bg-[#b0004a]/5 border border-[#b0004a]/15'} rounded-2xl p-6 flex items-start gap-4`}>
                <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">auto_fix_high</span>
                <div><h4 className="font-bold mb-1">Industry Override</h4><p className={`text-sm ${muted}`}>Veterinary, dental, HVAC, managed services, and pest control switch to EBITDA automatically above $1.5M revenue — because PE roll-ups trade on institutional metrics even at small scale.</p></div>
              </div>
              <div className={`${subtleBg} border ${borderColor} rounded-2xl p-6 flex items-start gap-4`}>
                <span className="material-symbols-outlined text-[#b0004a] text-2xl shrink-0 mt-1">verified</span>
                <div><h4 className="font-bold mb-1">You never select a tier</h4><p className={`text-sm ${muted}`}>No "Basic vs Pro vs Enterprise." Yulia classifies from the financials you share and explains the classification in plain language. The deal determines the depth.</p></div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 11. MATH ENGINE + VERIFICATION LOOP ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">The Math Engine</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">AI that interprets. Math that doesn't hallucinate.</h2>
                <div className={`space-y-6 editorial ${muted}`}>
                  <p>The AI layer decides what to calculate. The deterministic engine guarantees the math is right. Every financial claim passes through a three-step verification loop — AI suggests, you verify, engine calculates.</p>
                  <p>This is why your valuation is defensible. It was built the same way a buyer's QoE firm would build it.</p>
                </div>
                <div className={`mt-10 ${darkPanel} rounded-2xl p-6 text-white`}>
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#b0004a] text-lg">sync</span>The Verification Loop</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-lg bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">1</div><div><p className="text-sm font-semibold">AI Identifies</p><p className="text-xs text-[#dadadc]/70">Scans for add-backs — vehicles, rent, travel, one-time legal fees, family payroll — using IRS industry benchmarks.</p></div></div>
                    <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div><div><p className="text-sm font-semibold">You Verify</p><p className="text-xs text-[#dadadc]/70">AI cannot confirm add-backs. You review each one. Your judgment, your numbers. Yulia explains why she flagged it — you decide.</p></div></div>
                    <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">3</div><div><p className="text-sm font-semibold">Engine Calculates</p><p className="text-xs text-[#dadadc]/70">Only verified add-backs enter the formula. Deterministic engine recalculates SDE/EBITDA and updates every downstream model.</p></div></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-4">
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">calculate</span><h4 className="font-bold">SDE (Seller Discretionary Earnings)</h4></div>
                  <div className={`${codeBg} rounded-xl p-4 font-mono text-sm`}>SDE = Net Income + Owner Salary + D&A + Interest + One-Time + Verified Add-Backs</div>
                  <p className={`text-xs mt-3 ${muted}`}>"Verified" = you confirmed it. The AI flagged it; you approved it; the engine counted it.</p>
                </div>
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">monitoring</span><h4 className="font-bold">Adjusted EBITDA</h4></div>
                  <div className={`${codeBg} rounded-xl p-4 font-mono text-sm`}>Adj. EBITDA = Net Income + D&A + Interest + Taxes + Verified Add-Backs − Non-Recurring</div>
                  <p className={`text-xs mt-3 ${muted}`}>GAAP-normalized. The number a PE buyer's QoE firm will verify.</p>
                </div>
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">account_balance_wallet</span><h4 className="font-bold">DSCR (Debt Service Coverage)</h4></div>
                  <div className={`${codeBg} rounded-xl p-4 font-mono text-sm`}>DSCR = EBITDA ÷ Annual Debt Service</div>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#006630]" /><span className={`text-xs ${muted}`}>SBA minimum: 1.25×</span></div>
                    <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${dark ? 'bg-[#f9f9fc]' : 'bg-[#1a1c1e]'}`} /><span className={`text-xs ${muted}`}>Conventional: 1.50×</span></div>
                  </div>
                  <p className={`text-xs mt-3 ${muted}`}>Modeled at current rates. If the deal doesn't clear, Yulia tells you before you waste time.</p>
                </div>
                <div className={`${darkPanel} rounded-2xl p-6 text-white`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#b0004a]">speed</span><h4 className="font-bold">Valuation Defense</h4></div>
                  <div className="bg-white/5 rounded-xl p-4 font-mono text-sm text-[#dadadc]">Value = Base Multiple × Adj. Earnings + Growth Premium + Margin Premium − Risk Discount</div>
                  <p className="text-xs text-[#dadadc]/70 mt-3">Every component sourced from verified comparables and the seven-dimension analysis. A "Defensible Thesis" — not an estimate.</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 12. WHAT CHATGPT CAN'T DO ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-4xl font-black text-center mb-12">What does this do that <span className="text-[#b0004a]">ChatGPT can't?</span></h2>
              <div className={`${card} rounded-2xl overflow-hidden`}>
                <table className="w-full text-left">
                  <thead><tr className={subtleBg}><th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Capability</th><th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Standard AI</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#b0004a]">smbX.ai</th></tr></thead>
                  <tbody className={`divide-y ${borderColor} text-sm`}>
                    {comparisonRows.map((r) => (
                      <tr key={r.feature}>
                        <td className="px-6 py-4 font-semibold">{r.feature}</td>
                        <td className={`px-6 py-4 ${muted}`}>{r.ai}</td>
                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#b0004a] text-sm">check_circle</span>{r.smbx}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 13. IB COVERAGE COMPARISON ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5">
                  <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Coverage Comparison</span>
                  <h2 className="font-headline text-4xl font-black tracking-tight mb-8">90% of what an investment bank does. Everything that doesn't require a license.</h2>
                  <p className={`leading-relaxed editorial mb-6 ${muted}`}>An investment banking engagement gives you an analyst team, a CIM, a buyer outreach process, deal management, and negotiation support — for $150K–$500K. smbX.ai gives you the same analytical coverage. The difference: you run the conversations yourself.</p>
                  <p className={`font-bold text-xl border-l-4 border-[#b0004a] pl-6 italic ${emphasis}`}>Yulia is the analyst, the associate, and the VP. You're the Managing Director.</p>
                </div>
                <div className="lg:col-span-7">
                  <div className={`${card} rounded-2xl overflow-hidden`}>
                    <table className="w-full text-left">
                      <thead><tr className={subtleBg}>
                        <th className={`px-5 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>IB Engagement</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-[#b0004a]">smbX.ai</th>
                      </tr></thead>
                      <tbody className={`divide-y ${borderColor} text-sm`}>
                        {ibRows.map((r) => (
                          <tr key={r.ib}>
                            <td className={`px-5 py-3.5 ${muted}`}>{r.ib}</td>
                            <td className="px-5 py-3.5"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#b0004a] text-sm">check_circle</span>{r.smbx}</span></td>
                          </tr>
                        ))}
                        <tr className={subtleBg}><td className={`px-5 py-3.5 ${muted} font-medium`}>Negotiate on your behalf</td><td className={`px-5 py-3.5 ${muted}`}>You handle this (Yulia preps you)</td></tr>
                        <tr className={subtleBg}><td className={`px-5 py-3.5 ${muted} font-medium`}>Fiduciary representation</td><td className={`px-5 py-3.5 ${muted}`}>Not included (connect to licensed advisor)</td></tr>
                        <tr className={`${darkPanel} text-white`}><td className="px-5 py-4 font-bold">Total (12-month engagement)</td><td className="px-5 py-4 font-bold text-[#b0004a]">$1,788/year vs. $150K–$500K+</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className={`mt-4 ${dark ? 'bg-[#b0004a]/10 border border-[#b0004a]/20' : 'bg-[#b0004a]/5 border border-[#b0004a]/15'} rounded-2xl p-5 flex items-start gap-3`}>
                    <span className="material-symbols-outlined text-[#b0004a] text-lg shrink-0 mt-0.5">info</span>
                    <p className={`text-xs ${muted}`}><span className={`font-bold ${emphasis}`}>This is not an anti-advisor comparison.</span> Many advisors use smbX.ai themselves. The work Yulia produces makes any advisor engagement faster, cheaper, and more effective.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 14. FOUR JOURNEYS CTA ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12"><h2 className="font-headline text-4xl font-bold tracking-tight">Every side of the deal. One platform.</h2><p className={`mt-3 ${muted}`}>Yulia adapts the methodology to your specific journey.</p></div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journeys.map((j) => (
                <StaggerItem key={j.title}>
                  <a href={j.href} className={`${card} p-8 rounded-2xl hover:shadow-lg transition-all group flex gap-6 items-start`}>
                    <span className="material-symbols-outlined text-[#b0004a] text-3xl shrink-0 mt-1 group-hover:scale-110 transition-transform">{j.icon}</span>
                    <div>
                      <h3 className="font-headline text-xl font-black mb-2">{j.title}</h3>
                      <p className={`text-sm leading-relaxed ${muted}`}>{j.desc}</p>
                      <span className="text-[#b0004a] text-xs font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </ScrollReveal>

        {/* ═══ 15. PRIVACY ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className={`${darkPanel} rounded-3xl p-10 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
              <div>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-6">shield</span>
                <h2 className="text-3xl font-black text-white mb-6">Your data never trains a public model.</h2>
                <p className="text-[#dadadc]/60 leading-relaxed mb-4">Every conversation and document is processed in a private instance. Your financial data is encrypted at rest, encrypted in transit, and never used to improve general AI models.</p>
                <p className="text-[#dadadc]/60 leading-relaxed">You can use smbX.ai without creating an account. If you do, your data is siloed and exportable. If you leave, your data goes with you or gets deleted — your choice.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'lock', label: 'AES-256 Encryption' },
                  { icon: 'visibility_off', label: 'No Model Training' },
                  { icon: 'cloud_off', label: 'Private Instances' },
                  { icon: 'download', label: 'Full Data Export' },
                ].map((p) => (
                  <div key={p.icon} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                    <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-2">{p.icon}</span>
                    <h4 className="text-white font-bold text-sm">{p.label}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 16. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`${subtleBg} py-20 px-10 rounded-3xl`}>
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">See for <span className="text-[#b0004a] italic">yourself.</span></h2>
              <p className={`text-xl mb-12 max-w-2xl mx-auto ${muted}`}>Tell Yulia about your deal. Watch the intelligence layer work. Keep everything she finds — free, no account required.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-black text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent border-2 ${dark ? 'border-white hover:bg-white hover:text-[#1a1c1e]' : 'border-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'} rounded-full font-black text-xl transition-all cursor-pointer`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
