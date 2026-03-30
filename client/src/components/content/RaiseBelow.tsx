import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function RaiseBelow({ dark }: { dark: boolean }) {

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
                <span className="inline-block px-3 py-1 bg-[#A03050]/10 text-[#A03050] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Raise</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Capital</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
                More than half of search fund operators <span className="text-[#A03050]">never acquire.</span> Most fundraising decks never get a second meeting.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={`space-y-6 text-xl editorial max-w-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>The difference isn't the business or the opportunity. It's the package. Investors make funding decisions based on the quality of your financial story, your market analysis, and your operational plan. Yulia builds all three.</p>
                <p className={`font-bold border-l-4 border-[#A03050] pl-6 text-2xl italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia builds your fundraising package. You take the meetings.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5 mt-4">
            <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-6">Your AI capital team</p>
              <div className="space-y-4">
                {[
                  'Models every capital structure \u2014 equity, debt, mezzanine, revenue-based, ESOP, ROBS',
                  'Generates investor-ready pitch deck from your verified financials',
                  'Builds cap table projections showing dilution across funding scenarios',
                  'Identifies and scores matched investors from SBIC directories, SEC filings, search fund networks',
                  'Manages investor outreach \u2014 teasers, NDAs, data room access',
                  'Compares term sheets against market benchmarks',
                  'Drafts responses to investor questions with supporting data attached',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#A03050] text-lg shrink-0 mt-0.5">check_circle</span>
                    <p className="text-sm text-[#dadadc]/90">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/60 italic">You choose the capital. Yulia builds the case.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WHAT YULIA DOES ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="mb-12">
                <span className="text-[#A03050] font-bold uppercase tracking-widest text-xs block mb-3">What Yulia Does</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">The fundraising package that gets second meetings.</h2>
                <p className="text-lg text-[#dadadc]/70 max-w-2xl">Capital structure modeling, investor-grade materials, cap table projections, investor matching, term sheet analysis, and communication management. Everything you need from "how much should I raise?" to "the capital just hit the account."</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'account_tree', title: 'Capital structure modeling', desc: 'Equity vs. debt vs. mezzanine vs. revenue-based. ESOP. ROBS. Convertible notes. Every structure modeled with dilution impact, cost of capital, and founder retention. Yulia shows you what you keep under each scenario.' },
                  { icon: 'slideshow', title: 'Investor-ready pitch deck', desc: "Not a template. A deck built from your verified financials, market analysis, and operational plan. Adapted to your audience \u2014 angel investors get the vision, PE firms get the returns math." },
                  { icon: 'table_chart', title: 'Cap table projections', desc: "Current ownership \u2192 post-funding ownership across multiple scenarios. Liquidation preferences, participation rights, anti-dilution provisions \u2014 modeled so you understand what you're agreeing to before you sign." },
                  { icon: 'groups', title: 'Investor matching', desc: 'SBIC directories, SEC EDGAR filings, search fund networks, family office databases. Yulia identifies investors active in your sector, at your stage, with your check size \u2014 and scores them on thesis fit.' },
                  { icon: 'compare_arrows', title: 'Term sheet analysis', desc: 'When an offer comes in, Yulia compares it against market benchmarks. Is the valuation fair? Are the preferences standard? What does the liquidation waterfall look like at different exit values? You negotiate from knowledge.' },
                  { icon: 'mail', title: 'Investor communication', desc: "Every question investors ask \u2014 and they ask a lot \u2014 Yulia drafts your response with the supporting data already attached. You review and send. No more scrambling for numbers at 11pm." },
                ].map((card) => (
                  <div key={card.title} className="bg-white/5 rounded-2xl border border-white/10 p-8">
                    <span className="material-symbols-outlined text-[#A03050] text-3xl mb-4">{card.icon}</span>
                    <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                    <p className="text-sm text-[#dadadc]/70">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. THE RAISE PROCESS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#A03050] font-bold uppercase tracking-widest text-xs block mb-3">Your Raise Process</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Six gates from readiness to close.</h2>
              <p className={`font-bold text-xl border-l-4 border-[#A03050] pl-6 italic mb-8 ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Every gate has specific completion triggers. Yulia advances you when the prerequisite work is done — and not before.</p>
              <p className={dark ? 'text-[#dadadc]/80 leading-relaxed' : 'text-[#5d5e61] leading-relaxed'}>From "how much should I raise?" to "the capital just hit the account" — a structured process that prevents the mistakes that kill 80% of fundraising efforts.</p>
            </ScrollReveal>
            <StaggerContainer className="lg:col-span-7 space-y-4">
              {[
                { num: '1', title: 'Readiness assessment', desc: "Capital needs analysis, funding options comparison, timeline planning. \u201CHow much do you need, what's it for, and what are you willing to give up?\u201D", free: true },
                { num: '2', title: 'Financial package', desc: 'Verified financials, growth model, use-of-funds detail. The numbers that survive investor scrutiny \u2014 because they were built the same way an investor would build them.' },
                { num: '3', title: 'Investor materials', desc: "Pitch deck, executive summary, financial model, data room. Everything an investor needs to move from \u201Cinteresting\u201D to \u201Clet's talk terms.\u201D" },
                { num: '4', title: 'Investor outreach', desc: "Targeted list of matched investors. Teaser distribution. NDA management. Yulia tracks who's engaged, who's passed, and who needs a follow-up." },
                { num: '5', title: 'Term sheet negotiation', desc: 'Offers compared against market benchmarks. Dilution modeled. Preferences analyzed. Counter-positions drafted. You negotiate with full visibility into what each term actually costs you.' },
                { num: '6', title: 'Close', desc: 'DD coordination, final documentation, closing checklist. The capital hits your account and Yulia transitions you to execution mode.' },
              ].map((step) => (
                <StaggerItem key={step.num}>
                  <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${step.free ? (dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]') : 'bg-[#A03050]/10 text-[#A03050]'}`}>{step.num}</div>
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

        {/* ═══ 4. DILUTION INTELLIGENCE ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#A03050] font-bold uppercase tracking-widest text-xs block mb-3">Dilution Intelligence</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Know what you're giving up before you sign anything.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most founders understand they're giving up equity. Very few understand what liquidation preferences, participation rights, and anti-dilution provisions actually cost them at different exit values. Yulia models all of it.</p>
              <div className={`rounded-2xl p-6 ${dark ? 'bg-[#A03050]/10 border border-[#A03050]/20' : 'bg-[#A03050]/5 border border-[#A03050]/15'}`}>
                <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>The question isn't "what percentage am I giving up."</span> It's "what do I actually receive at a $5M exit vs. a $20M exit vs. a $50M exit — after preferences, participation, and the waterfall." Yulia shows you the real math.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
                <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-4">Worked example</p>
                <h4 className="font-bold text-lg mb-6">You raise $2M at a $10M pre-money. Here's what you actually keep.</h4>
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Pre-money</p>
                      <p className="text-xl font-black">$10M</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Investment</p>
                      <p className="text-xl font-black text-[#A03050]">$2M</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <p className="text-[10px] text-[#dadadc]/60 uppercase mb-1">Your stake</p>
                      <p className="text-xl font-black">83.3%</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#dadadc]/60 uppercase tracking-widest font-bold mb-4">What you receive at exit (after 1x participating preferred)</p>
                <div className="space-y-3">
                  {[
                    { exit: '$5M exit', amount: '$2.5M', pct: '(50% \u2014 not 83%)', highlight: false },
                    { exit: '$20M exit', amount: '$15M', pct: '(75%)', highlight: false },
                    { exit: '$50M exit', amount: '$40M', pct: '(80%)', highlight: true },
                  ].map((row) => (
                    <div key={row.exit} className={`flex justify-between items-center py-3 ${row.highlight ? '' : 'border-b border-white/10'}`}>
                      <span className="text-sm text-[#dadadc]/70">{row.exit}</span>
                      <div className="text-right">
                        <span className={`font-bold ${row.highlight ? 'text-white' : 'text-[#dadadc]/90'}`}>{row.amount}</span>
                        <span className="text-xs text-[#dadadc]/70 ml-2">{row.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#dadadc]/70 italic mt-6">"83% ownership doesn't mean 83% of proceeds. The preferences eat your upside at lower exits. Yulia models this before you sign the term sheet."</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 5. CAPITAL STRUCTURES ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#A03050] font-bold uppercase tracking-widest text-xs block mb-3">Capital Options</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Every structure modeled. You pick the one that fits.</h2>
              <p className={`text-lg max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most founders only consider equity. There are six fundamentally different capital structures — each with different implications for control, dilution, cost of capital, and your personal risk.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'pie_chart', title: 'Equity', desc: 'Sell a percentage of ownership. Angel, VC, PE, family office, or strategic. Yulia models dilution across multiple rounds.' },
              { icon: 'account_balance', title: 'Debt', desc: 'SBA, conventional, or private credit. No dilution but personal guarantee and debt service. Yulia models DSCR impact.' },
              { icon: 'layers', title: 'Mezzanine', desc: 'Subordinated debt with equity kickers. Higher cost but less dilution than pure equity. Common in PE-backed structures.' },
              { icon: 'sync_alt', title: 'Revenue-Based', desc: 'Repay as a percentage of revenue. No dilution, no fixed payments. Higher total cost but flexible and founder-friendly.' },
              { icon: 'diversity_3', title: 'ESOP', desc: 'Tax-advantaged transfer to employees. Complex trust structure but powerful tax benefits. Yulia models the setup and ongoing obligations.' },
              { icon: 'savings', title: 'ROBS', desc: 'Use retirement funds as equity injection without early withdrawal penalty. Legitimate but creates concentration risk. Yulia models the trade-offs.' },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#A03050] text-2xl mb-3">{card.icon}</span>
                  <h3 className="font-bold mb-2">{card.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal delay={0.2}>
            <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
              <span className="material-symbols-outlined text-[#A03050] text-2xl shrink-0 mt-1">auto_fix_high</span>
              <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia models every structure side by side</span> — dilution impact, cost of capital, founder retention, personal risk, and what you actually take home at different exit values. You pick the one that fits your goals.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95]">Sell. Buy. Raise.<br/><span className="text-[#A03050]">Talk to Yulia.</span></h2>
                <p className="text-lg text-[#dadadc]/70 mt-4">Tell Yulia how much you need and what it's for. She'll model every structure, build the materials, and match you with investors — before your first meeting.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={handleCTA} className="px-10 py-5 bg-gradient-to-r from-[#A03050] to-[#C45878] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Talk to Yulia</button>
                <p className="text-xs text-[#dadadc]/70">Free analysis · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
