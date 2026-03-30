import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function SellBelow({ dark }: { dark: boolean }) {

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
                <span className="inline-block px-3 py-1 bg-[#C25572]/10 text-[#C25572] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Sell</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Exit Planning</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
                75% of owners who sell profoundly <span className="text-[#C25572]">regret it</span> within a year.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={`space-y-6 text-xl editorial max-w-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>Not because they sold. Because they weren't ready. Wrong valuation. Wrong timing. Wrong structure. Fixable problems they didn't know existed until after the wire hit.</p>
                <p className={`font-bold border-l-4 border-[#C25572] pl-6 text-2xl italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia makes sure that doesn't happen to you.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5 mt-4">
            <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-6">Your AI deal team</p>
              <div className="space-y-4">
                {[
                  'Builds your valuation with three methodologies — math shown',
                  'Finds every add-back hiding in your financials',
                  'Generates a 25–40 page CIM that looks like a $50K IB deliverable',
                  'Identifies and scores buyer categories against your business',
                  'Manages your deal room, tracks DD, coordinates every party',
                  'Preps you for every negotiation with comp data and counter-offers',
                  'Drafts every communication — to buyers, attorneys, CPAs, lenders',
                  'Transitions you to a 180-day post-close plan the moment the deal funds',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#C25572] text-lg shrink-0 mt-0.5">check_circle</span>
                    <p className="text-sm text-[#dadadc]/90">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/60 italic">The only thing you do yourself is decide which offer to accept and sign your name.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WHAT YULIA DOES ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="mb-12">
                <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">What Yulia Does</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">What an investment bank delivers for $150K–$500K.</h2>
                <p className="text-lg text-[#dadadc]/60 max-w-2xl">The analysis, the documents, the buyer outreach, the process management, the negotiation prep. Yulia does all of it. You focus on the decisions that matter.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'monitoring', title: 'Valuation with the math shown', desc: 'Three methodologies — SDE multiples, comparable transactions, asset floor. Seven-factor quality score. Every number sourced, every assumption documented. Not a range. A defensible thesis.' },
                  { icon: 'search', title: 'Add-back forensics', desc: "The car. The insurance. The one-time legal bill. The family payroll your CPA never flagged. Yulia scans your financials against IRS industry benchmarks and surfaces every dollar that should be added back to your SDE." },
                  { icon: 'description', title: 'Institutional-quality CIM', desc: '25–40 pages. Business overview, 3-year financials, management summary, market analysis, competitive position, investment thesis. Adapted to your league. The document that gets deals done.' },
                  { icon: 'groups', title: 'Buyer identification & scoring', desc: "Strategic acquirers, PE platforms, individual operators, search funds — each category scored against your business profile. Who's buying in your sector, what they're paying, and which ones are the best fit." },
                  { icon: 'folder_managed', title: 'Deal room & DD coordination', desc: "NDA execution, document access control, activity tracking. A 50–100 item DD checklist tracked to completion with deadline alerts. Multi-party coordination between your attorney, CPA, the buyer's team, and the lender." },
                  { icon: 'gavel', title: 'Negotiation intelligence', desc: 'Every negotiation moment — initial offer, counter, working capital adjustment, non-compete terms, earnout structure — Yulia prepares you with comparable transaction data and drafts the exact communication for you to review and send.' },
                ].map((card) => (
                  <div key={card.title} className="bg-white/5 rounded-2xl border border-white/10 p-8">
                    <span className="material-symbols-outlined text-[#C25572] text-3xl mb-4">{card.icon}</span>
                    <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                    <p className="text-sm text-[#dadadc]/70">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. THE DEAL PROCESS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">Your Exit Process</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Eight stages. Yulia manages every one.</h2>
              <p className={`font-bold text-xl border-l-4 border-[#C25572] pl-6 italic mb-8 ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>You don't need to know the process. You just need to show up for the decisions.</p>
              <p className={dark ? 'text-[#dadadc]/80 leading-relaxed' : 'text-[#5d5e61] leading-relaxed'}>From your first conversation to 180 days after close, every step has specific completion triggers. Yulia advances you when the prerequisite work is done — and not before.</p>
            </ScrollReveal>
            <StaggerContainer className="lg:col-span-7 space-y-4">
              {[
                { num: '1', title: 'Know your number', desc: 'ValueLens preliminary valuation + add-back analysis + Value Readiness Report. This is where most people realize their business is worth more than they thought — or less than they hoped.', free: true },
                { num: '2', title: 'Get deal-ready', desc: 'Financial cleanup, documentation gaps, readiness improvements. Yulia tells you exactly what to fix and what each fix is worth in dollars. A $15K improvement to your processes might add $60K to your valuation.' },
                { num: '3', title: 'Build your materials', desc: 'CIM generated from your verified financials. Blind teasers for initial outreach. Every document adapted to your league — L1 gets clear and direct, L5 gets institutional.' },
                { num: '4', title: 'Identify buyers', desc: 'Buyer categories mapped and scored. PE platforms currently acquiring in your sector. Individual operators who match your geography. Search funds with your thesis on their target list.' },
                { num: '5', title: 'Manage interest', desc: 'NDAs executed through the platform. CIMs released with access control. Buyer questions fielded — Yulia drafts your responses, you review and send.' },
                { num: '6', title: 'Evaluate offers', desc: 'Comparison matrix across every term — not just price. Risk-adjusted scoring. Tax implications modeled for each structure. Counter-offer frameworks with the math to support them.' },
                { num: '7', title: 'Close', desc: "Closing checklist tracked to completion. Funds flow coordination. Final document package. Every party knows what's due and when." },
                { num: '8', title: 'Transition', desc: "180-day post-close plan. Knowledge transfer framework. Performance tracking against deal projections. You don't just close — you land." },
              ].map((step) => (
                <StaggerItem key={step.num}>
                  <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${step.free ? 'bg-[#006630]/10 text-[#006630]' : 'bg-[#C25572]/10 text-[#C25572]'}`}>{step.num}</div>
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

        {/* ═══ 4. NEGOTIATION INTELLIGENCE ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">Negotiation Intelligence</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Every counter-offer backed by data. Every communication drafted for you.</h2>
              <p className={`leading-relaxed editorial ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>No other platform tells sellers what comparable deals settled at and drafts counter-offers. Every negotiation moment in your deal — the initial offer, the counter, the working capital adjustment, the non-compete terms, the earnout structure — Yulia prepares you with data from comparable transactions and drafts the exact communication for you to review and send.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
                <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-4">Worked example</p>
                <h4 className="font-bold text-lg mb-6">An offer comes in at $1.6M for your $2.1M valuation.</h4>
                <div className="space-y-3 mb-6">
                  {[
                    { icon: 'analytics', text: 'Offer is', bold: '24% below', after: 'your defensible range' },
                    { icon: 'compare_arrows', text: 'Comparable transactions closed at', bold: '3.1x–3.4x SDE', after: '' },
                    { icon: 'psychology', text: 'Buyer is using a standard opening discount —', bold: 'expected behavior', after: '' },
                    { icon: 'warning', text: 'Working capital peg at $180K —', bold: '$40K below', after: 'your trailing average' },
                  ].map((item) => (
                    <div key={item.icon} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#C25572] text-sm shrink-0 mt-0.5">{item.icon}</span>
                      <p className="text-sm text-[#dadadc]/90">{item.text} <span className="text-white font-bold">{item.bold}</span>{item.after ? ` ${item.after}` : ''}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#dadadc]/60 uppercase tracking-widest font-bold mb-4">Yulia drafts three counter-structures</p>
                <div className="space-y-3">
                  <div className="bg-[#C25572]/20 rounded-xl p-4 border border-[#C25572]/30">
                    <p className="text-sm"><span className="font-bold text-white">Option A:</span> <span className="text-[#dadadc]/90">Full price counter at $2.05M, standard terms</span> <span className="text-[#C25572] font-bold">→ nets $1.82M after tax</span></p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm"><span className="font-bold text-white">Option B:</span> <span className="text-[#dadadc]/90">Concession to $1.9M with earnout kicker</span> <span className="text-white font-bold">→ nets $1.78M + up to $210K</span></p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm"><span className="font-bold text-white">Option C:</span> <span className="text-[#dadadc]/90">Meet at $1.8M with seller note at 5%</span> <span className="text-white font-bold">→ nets $1.72M + $180K over 3yr</span></p>
                  </div>
                </div>
                <p className="text-xs text-[#dadadc]/70 italic mt-4">"Each structure has different tax implications. Here's the after-tax comparison for your state."</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 5. EXIT STRUCTURES ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">Exit Structures</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Six ways to exit. Yulia models all of them.</h2>
              <p className={`text-lg max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most people assume there's one way to sell. There are six fundamentally different structures — and the after-tax difference can be hundreds of thousands of dollars.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'key', title: 'Full Sale', desc: 'Complete exit. Hand over the keys, cash the check. The simplest structure.' },
              { icon: 'handshake', title: 'Partner Buyout', desc: 'Your partner buys your share. Yulia models the valuation methodology and payment structure.' },
              { icon: 'trending_up', title: 'Capital Raise', desc: 'Sell a minority stake (10–49%) while keeping operational control. Different documents, different buyers.' },
              { icon: 'diversity_3', title: 'Employee Buyout (ESOP)', desc: 'Tax-advantaged transfer to your team. Complex but powerful — Yulia models the trust structure and tax benefits.' },
              { icon: 'pie_chart', title: 'Majority Share Sale', desc: 'Sell controlling interest but retain a minority stake. Common in PE roll-ups where they want you to stay.' },
              { icon: 'category', title: 'Partial Stock/Asset Sale', desc: 'Sell specific assets or a division. The most flexible — and most complex — structure.' },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#C25572] text-2xl mb-3">{card.icon}</span>
                  <h3 className="font-bold mb-2">{card.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollReveal delay={0.2}>
            <div className={`mt-8 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#C25572]/10 border border-[#C25572]/20' : 'bg-[#C25572]/5 border border-[#C25572]/15'}`}>
              <span className="material-symbols-outlined text-[#C25572] text-2xl shrink-0 mt-1">auto_fix_high</span>
              <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia models the after-tax impact of each structure before you commit to one.</span> The difference between an asset sale and a stock sale on a $2.4M deal can be $300K in your pocket.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. VALUE READINESS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">Value Readiness</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Most sellers leave 15–30% on the table. Yulia finds it before you go to market.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The Value Readiness Report scores your business on 7 factors and tells you exactly what to fix — with the dollar impact of each improvement. A $15K process documentation effort might add $60K to your valuation. A 90-day customer diversification push might add $120K. Yulia shows you the math before you decide what's worth doing.</p>
              <p className="text-sm text-[#006630] font-bold">This analysis is free. Keep it even if you decide you're not ready to sell yet.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: 'receipt_long', title: 'Financial Documentation', desc: 'Are your books buyer-ready?' },
                  { icon: 'person_off', title: 'Owner Dependency', desc: 'Could the business run without you for 90 days?' },
                  { icon: 'group', title: 'Customer Concentration', desc: 'Does any single customer represent >15% of revenue?' },
                  { icon: 'autorenew', title: 'Revenue Quality', desc: 'Recurring vs. one-time. Contract vs. handshake.' },
                  { icon: 'show_chart', title: 'Growth Trajectory', desc: 'Trending up, flat, or declining?' },
                  { icon: 'settings', title: 'Operational Systems', desc: 'Documented processes or tribal knowledge?' },
                ].map((factor) => (
                  <div key={factor.title} className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <span className="material-symbols-outlined text-[#C25572] text-xl mb-2">{factor.icon}</span>
                    <h4 className="font-bold text-sm mb-1">{factor.title}</h4>
                    <p className={`text-xs ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{factor.desc}</p>
                  </div>
                ))}
                <div className={`sm:col-span-2 rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#C25572] text-xl mb-2">shield</span>
                  <h4 className="font-bold text-sm mb-1">Market Position</h4>
                  <p className={`text-xs ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Competitive moat or commodity service? Yulia assesses your defensibility against buyer alternatives.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 7. DEAL TEAM COMPARISON ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="mb-12">
              <span className="text-[#C25572] font-bold uppercase tracking-widest text-xs block mb-3">Your Deal Team</span>
              <h2 className="text-4xl font-headline font-black tracking-tight">Yulia runs the deal. You make the calls.</h2>
            </div>
            <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-[#2f3133] border-zinc-800' : 'bg-white border-[#eeeef0]'}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>What your deal needs</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#C25572]">What Yulia does</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>What you do</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${dark ? 'divide-zinc-800' : 'divide-[#eeeef0]'}`}>
                  {[
                    ['Business valuation', 'Builds it — three methodologies, math shown', 'Review and approve assumptions'],
                    ['Financial normalization', 'Identifies every add-back, calculates adjusted SDE/EBITDA', 'Confirm which add-backs are real'],
                    ['Deal materials', 'Generates CIM, blind teasers, presentations', 'Review and share'],
                    ['Buyer identification', 'Maps and scores buyer categories for your sector', 'Choose which buyers to engage'],
                    ['Deal room', 'NDA execution, document access, activity tracking', 'Grant access decisions'],
                    ['Offer analysis', 'Scores and compares with risk-adjusted math', 'Pick your preferred structure'],
                    ['Negotiation prep', 'Drafts counter-offers with comparable data', 'Review, edit, send'],
                    ['DD coordination', 'Tracks 50–100 items, manages deadlines', 'Provide requested documents'],
                    ['Closing', 'Checklist, funds flow, document package', 'Sign'],
                    ['Post-close', '180-day value creation plan, milestone tracking', 'Run the transition'],
                  ].map(([need, yulia, you]) => (
                    <tr key={need}>
                      <td className="px-6 py-4 font-semibold">{need}</td>
                      <td className={`px-6 py-4 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{yulia}</td>
                      <td className={`px-6 py-4 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{you}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 8. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95]">Sell. Buy. Raise.<br/><span className="text-[#C25572]">Talk to Yulia.</span></h2>
                <p className="text-lg text-[#dadadc]/60 mt-4">Tell her about your business. She'll tell you what it's worth — and what comes next. Free, no account required.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={handleCTA} className="px-10 py-5 bg-gradient-to-r from-[#C25572] to-[#D9778A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Talk to Yulia</button>
                <p className="text-xs text-[#dadadc]/70">Free analysis · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
