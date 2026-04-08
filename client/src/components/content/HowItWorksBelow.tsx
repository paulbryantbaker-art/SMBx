import { ScrollReveal, StaggerContainer, StaggerItem, InteractiveCalculator, DSCRCalculator, MagneticButton, GlowingOrb } from './animations';
import { darkClasses } from './darkHelpers';
import { goToChat } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';

export default function HowItWorksBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'How smbx.ai Works | AI Deal Intelligence, 22 Gates, 6 Engines — smbx.ai',
    description: 'Six specialized engines. 22 enforced gates. One conversation from first sentence to 180 days post-close. See how Yulia delivers deal intelligence.',
    canonical: 'https://smbx.ai/how-it-works',
    faqs: [
      { question: 'How is smbx.ai different from ChatGPT for M&A?', answer: 'ChatGPT generates plausible text. smbx.ai runs 6 specialized engines with live market data, deterministic financial calculations, and a 22-gate methodology. Financial data is extracted exactly from your documents — never invented. The difference is defensibility.' },
      { question: 'What is the 22-gate methodology?', answer: 'Each of the 4 journeys (Sell, Buy, Raise, Integrate) has specific gates with completion triggers that Yulia verifies from your conversation and data. No valuation until financials are normalized. No LOI until DSCR clears. This prevents the mistakes that kill deals.' },
      { question: 'What does deal intelligence mean?', answer: 'Deal intelligence combines financial analysis, market data, industry benchmarks, and process management to execute a business transaction. Unlike deal listings or general AI, deal intelligence is purpose-built for evaluating, structuring, and closing transactions.' },
    ],
  });

  const handleCTA = goToChat;

  const muted = dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]';
  const card = dc.card;
  const emphasis = dc.emphasis;
  const darkPanel = dc.darkPanel;
  const borderColor = dc.borderColor;

  const engines = [
    { icon: 'description', title: 'Financial Extraction', desc: 'Pulls exact numbers from your tax returns and P&Ls. Never rounds. Never estimates. Shows you the source.' },
    { icon: 'travel_explore', title: 'Market Intelligence', desc: "Live data on what's selling, at what multiples, in your sector and geography. Not training data — current market." },
    { icon: 'policy', title: 'Legal Auditor', desc: "Reviews your documents and only cites what's actually there. Returns 'NOT FOUND' if it can't verify a claim." },
    { icon: 'calculate', title: 'Deal Modeling', desc: 'SBA eligibility, DSCR, IRR, sensitivity — deterministic math, not AI guesses.' },
    { icon: 'account_tree', title: 'Cap Table', desc: 'Models ownership, dilution, and liquidation waterfall across multiple rounds and exit scenarios.' },
    { icon: 'draw', title: 'Document Generator', desc: "CIMs, LOIs, pitch decks, deal memos — from your verified numbers, adapted to your deal's complexity." },
  ];

  const comparisonRows = [
    { other: 'Generate plausible text', yulia: 'Extract exact numbers from your documents' },
    { other: 'Use training data (stale)', yulia: 'Pull live market data and current multiples' },
    { other: 'Same depth for all deals', yulia: "Adapt to your deal's complexity" },
    { other: 'No process enforcement', yulia: "22-gate methodology — can't skip steps" },
    { other: 'AI generates, you trust', yulia: 'AI suggests → you verify → engine calculates' },
    { other: 'Your data trains the model', yulia: 'Private. Always.' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO + CONVERSATION DEMO ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mb-16">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">How It Works</span>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">Watch Yulia work.</h1>
              <p className={`text-xl leading-relaxed max-w-2xl ${muted}`}>Tell Yulia about your business. Watch the methodology work in real time. No signup. No sales call. Just a conversation.</p>
            </div>

            <div className={`${darkPanel} rounded-3xl p-8 md:p-12`}>
              <div className="max-w-4xl mx-auto space-y-6">
                {/* User */}
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">I own a residential cleaning company in Phoenix. About $1.8M revenue. Thinking about selling sometime in the next year.</div>
                </div>
                {/* Yulia initial */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
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
                  <div className="w-8 h-8 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    That changes the picture. With $120K salary add-back and $45K in personal expenses, your adjusted SDE jumps to <span className="text-[#ffb2bf] font-bold">$525K</span>. At current Phoenix multiples, that's <span className="text-[#ffb2bf] font-bold">$1.47M–$1.84M</span>.
                    <span className="block mt-3 font-semibold">Are you paying rent to a property you own? That's one of the most common hidden add-backs in this industry.</span>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-white/10 text-center">
                <p className="text-[#dadadc]/60 text-sm">90 seconds. No signup. No credit card. Yulia is already normalizing your financials — and she'll keep going until the picture is complete.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 2. GATE SYSTEM ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Enforced Methodology</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Yulia won't let you skip steps.</h2>
                <p className={`leading-relaxed mb-6 ${muted}`}>No valuation until your financials are clean. No CIM until your value readiness is scored. No LOI until the DSCR clears. Each gate has specific triggers that Yulia verifies from your conversation and your data. She advances you when the work is done — and not before.</p>
                <div className={`${darkPanel} rounded-2xl p-6 text-white`}>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[#D44A78] text-lg">lock</span>What this means in practice</h4>
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
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#D44A78]">storefront</span><h4 className="font-headline font-bold">Sell — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {['S0','S1','S2','S3','S4','S5'].map((g, i) => (
                      <div key={g} className="flex-1 text-center">
                        <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#D44A78]/10'} rounded-lg py-2 px-1 mb-1`}>
                          <span className={`text-[10px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#D44A78]'}`}>{g}</span>
                        </div>
                        <p className={`text-[8px] ${muted}`}>{['Profile','Financials','Valuation','Prepare','Negotiate','Close'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Buy gates */}
                <div className={`${card} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#D44A78]">shopping_bag</span><h4 className="font-headline font-bold">Buy — 6 Gates</h4></div>
                  <div className="flex gap-2">
                    {['B0','B1','B2','B3','B4','B5'].map((g, i) => (
                      <div key={g} className="flex-1 text-center">
                        <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#D44A78]/10'} rounded-lg py-2 px-1 mb-1`}>
                          <span className={`text-[10px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#D44A78]'}`}>{g}</span>
                        </div>
                        <p className={`text-[8px] ${muted}`}>{['Thesis','Source','Underwrite','Diligence','Negotiate','Close'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Raise + Integrate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${card} rounded-2xl p-6`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#D44A78]">trending_up</span><h4 className="font-headline font-bold text-sm">Raise — 6 Gates</h4></div>
                    <div className="flex gap-1">
                      {['R0','R1','R2','R3','R4','R5'].map((g, i) => (
                        <div key={g} className="flex-1 text-center">
                          <div className={`${i < 2 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#D44A78]/10'} rounded-lg py-1.5 mb-1`}>
                            <span className={`text-[9px] font-bold ${i < 2 ? 'text-[#006630]' : 'text-[#D44A78]'}`}>{g}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`${card} rounded-2xl p-6`}>
                    <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#D44A78]">merge</span><h4 className="font-headline font-bold text-sm">Integrate — 4 Gates</h4></div>
                    <div className="flex gap-1">
                      {['I0','I1','I2','I3'].map((g, i) => (
                        <div key={g} className="flex-1 text-center">
                          <div className={`${i < 1 ? (dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10') : 'bg-[#D44A78]/10'} rounded-lg py-1.5 mb-1`}>
                            <span className={`text-[9px] font-bold ${i < 1 ? 'text-[#006630]' : 'text-[#D44A78]'}`}>{g}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <div className={`w-3 h-3 rounded-sm ${dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10'}`} />
                  <span className={`text-[10px] ${muted}`}>Free</span>
                  <div className="w-3 h-3 rounded-sm bg-[#D44A78]/10 ml-3" />
                  <span className={`text-[10px] ${muted}`}>Paid</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. SIX ENGINES ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Under the Hood</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">One conversation. Six specialized engines working behind it.</h2>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {engines.map((e) => (
                <StaggerItem key={e.title}>
                  <div className={`${card} rounded-2xl p-6 h-full`}>
                    <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#D44A78]">{e.icon}</span><h4 className="font-bold text-sm">{e.title}</h4></div>
                    <p className={`text-sm leading-relaxed ${muted}`}>{e.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            {/* Author vs Auditor */}
            <div className={`mt-8 ${darkPanel} rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-white`}>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#D44A78]">edit_note</span><h4 className="font-bold">Author Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Creative</span></div>
                <p className="text-sm text-[#dadadc]/60">Generates CIMs, pitch decks, valuation narratives, market summaries. Synthesizes from multiple sources. This is the Yulia who writes the documents that close deals.</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-[#D44A78]">fact_check</span><h4 className="font-bold">Auditor Mode</h4><span className="text-[10px] bg-white/10 px-2 py-1 rounded">Forensic</span></div>
                <p className="text-sm text-[#dadadc]/60">Verifies add-backs, extracts contract clauses, reviews tax returns. Only cites from your documents — never hallucinates. Returns "NOT FOUND" when information is missing.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. TRY IT YOURSELF ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Try It Yourself</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">Try it yourself. No signup.</h2>
              <p className={`text-lg max-w-2xl ${muted}`}>Toggle add-backs to see how they change a valuation. Adjust loan terms to check SBA bankability. These are the same engines that power Yulia's deal intelligence.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 ${muted}`}>SDE Add-Back Calculator</h3>
                <InteractiveCalculator className={dark ? 'bg-[#2f3133] border border-zinc-800' : undefined} />
              </div>
              <div>
                <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 ${muted}`}>DSCR Calculator</h3>
                <DSCRCalculator className={dark ? 'bg-[#2f3133] border border-zinc-800' : undefined} />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. WHAT'S DIFFERENT ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-4xl font-black text-center mb-12">What other tools <span className="text-[#D44A78]">miss.</span></h2>
              <div className={`${card} rounded-2xl overflow-hidden`}>
                <table className="w-full text-left">
                  <thead>
                    <tr className={dc.subtleBg}>
                      <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>What other tools do</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#D44A78]">What Yulia does</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderColor} text-sm`}>
                    {comparisonRows.map((r) => (
                      <tr key={r.other}>
                        <td className={`px-6 py-4 ${muted}`}>{r.other}</td>
                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#D44A78] text-sm">check_circle</span>{r.yulia}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. YOUR DATA ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-headline text-3xl font-black text-center mb-8">Your data stays yours.</h2>
              <div className={`${card} rounded-2xl p-8`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: 'lock', text: 'AES-256 encryption at rest and in transit' },
                    { icon: 'visibility_off', text: 'Your data never trains a public model' },
                    { icon: 'cloud_off', text: 'Private instances — no cross-user access' },
                    { icon: 'download', text: 'Full data export — your data goes with you' },
                  ].map((p) => (
                    <div key={p.icon} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#D44A78] text-xl shrink-0 mt-0.5">{p.icon}</span>
                      <p className={`text-sm leading-relaxed ${emphasis}`}>{p.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 7. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 relative">
            <GlowingOrb size={300} color="rgba(212,74,120,0.15)" top="-100px" right="-80px" />
            <div className={`${darkPanel} rounded-3xl p-12 md:p-16 text-center relative z-10 text-white`}>
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] mb-4">
                Describe your deal.<br /><span className="text-[#D44A78]">Watch the intelligence work.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell her about your business, a deal you're evaluating, or capital you need to raise. No account required.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton
                  onClick={handleCTA}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Talk to Yulia
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/70">Free deal intelligence · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
