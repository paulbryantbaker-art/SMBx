import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow({ dark }: { dark: boolean }) {

  const handleCTA = (plan?: string) => {
    if (plan === 'enterprise') {
      window.location.href = '/chat?message=' + encodeURIComponent("I'm interested in the Enterprise plan for my team.");
    } else {
      window.location.href = '/chat';
    }
  };

  const muted = dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]';
  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">Pricing</span>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8">
                Investment-grade deal intelligence.<br/><span className="text-[#D44A78]">From $0.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className={`text-xl leading-relaxed max-w-lg ${muted}`}>Start free. Upgrade when you're ready for the full journey. No per-deal fees. No success fees. No surprises. Cancel anytime.</p>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5">
            <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <p className={`text-sm mb-3 ${muted}`}>An investment bank engagement costs</p>
              <p className={`text-4xl font-black line-through mb-1 ${dark ? 'text-[#dadadc]/30' : 'text-[#5d5e61]/30'}`}>$150,000–$500,000</p>
              <p className={`text-sm mb-6 ${muted}`}>for the same analytical coverage</p>
              <div className={`w-full h-px mb-6 ${dark ? 'bg-zinc-700' : 'bg-[#eeeef0]'}`} />
              <p className={`text-sm mb-3 ${muted}`}>smbX.ai Professional</p>
              <p className="text-5xl font-black text-[#D44A78]">$149<span className={`text-lg font-medium ${muted}`}>/month</span></p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. TIER CARDS ═══ */}
        <section className="mb-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full ${card}`}>
                <h3 className="font-black text-lg mb-1">Free</h3>
                <p className="text-4xl font-black mb-1">$0</p>
                <p className={`text-xs mb-6 ${muted}`}>Forever · Email required</p>
                <div className="space-y-3 flex-1">
                  {['Unlimited conversation with Yulia', 'ValueLens preliminary valuation', 'Value Readiness Report (7-factor)', 'Investment Thesis (buyers)', '1 deliverable included'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#006630] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm ${muted}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className={`mt-8 w-full py-3 border-2 rounded-full font-bold text-sm transition-all cursor-pointer ${dark ? 'border-white text-white hover:bg-white hover:text-[#0f1012]' : 'border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Start Free</button>
              </div>
            </StaggerItem>
            {/* Starter */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full ${card}`}>
                <h3 className="font-black text-lg mb-1">Starter</h3>
                <p className="text-4xl font-black mb-1">$49<span className={`text-lg font-medium ${muted}`}>/mo</span></p>
                <p className={`text-xs mb-6 ${muted}`}>For early-stage exploration</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Free', 'Full financial normalization', 'Add-back verification loop', 'Deal scoring (buyers)', 'SBA qualification modeling', 'Market intelligence reports'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#006630] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm ${muted}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className={`mt-8 w-full py-3 border-2 rounded-full font-bold text-sm transition-all cursor-pointer ${dark ? 'border-white text-white hover:bg-white hover:text-[#0f1012]' : 'border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Start Starter</button>
              </div>
            </StaggerItem>
            {/* Professional */}
            <StaggerItem>
              <div className={`rounded-2xl border-2 border-[#D44A78] p-8 flex flex-col h-full relative shadow-lg ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D44A78] text-white text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                <h3 className="font-black text-lg mb-1">Professional</h3>
                <p className="text-4xl font-black text-[#D44A78] mb-1">$149<span className={`text-lg font-medium ${muted}`}>/mo</span></p>
                <p className={`text-xs mb-6 ${muted}`}>30-day free trial</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Starter', 'Institutional-quality CIM', 'Full financial modeling (DCF, sensitivity)', 'Buyer identification & scoring', 'Negotiation intelligence & counter-offers', 'Deal room & DD coordination', 'LOI drafting from comparable data', '180-day post-close integration'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm font-medium ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className="mt-8 w-full py-3 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer">Try Professional Free</button>
              </div>
            </StaggerItem>
            {/* Enterprise */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full text-white ${darkPanel}`}>
                <h3 className="font-black text-lg mb-1">Enterprise</h3>
                <p className="text-4xl font-black mb-1">$999<span className="text-lg font-medium text-[#dadadc]/70">/mo</span></p>
                <p className="text-xs text-[#dadadc]/60 mb-6">Unlimited users</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Professional', 'Unlimited team seats', 'API access', 'White-label options', 'Priority support', 'Multi-deal pipeline management'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA('enterprise')} className="mt-8 w-full py-3 border-2 border-white/30 rounded-full font-bold text-sm hover:bg-white hover:text-[#1a1c1e] transition-all text-white cursor-pointer bg-transparent">Start Enterprise</button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 3. IB COVERAGE COMPARISON ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Coverage Comparison</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">What $149/month actually includes.</h2>
              <p className={`text-lg max-w-2xl ${muted}`}>This is the same analytical coverage that a traditional investment banking engagement provides. The difference: you run the conversations yourself. Yulia prepares everything.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className={`rounded-2xl overflow-hidden ${card}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Deliverable</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${muted}`}>Traditional IB</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#D44A78]">smbX.ai Professional</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${dark ? 'divide-zinc-800' : 'divide-[#eeeef0]'}`}>
                  {[
                    ['Business valuation', '$2K\u2013$10K standalone', 'Included \u2014 3 methodologies'],
                    ['CIM / deal materials', '$5K\u2013$25K', 'Included \u2014 25\u201340 pages'],
                    ['Financial modeling', '$3K\u2013$10K', 'Included \u2014 DCF, sensitivity'],
                    ['Market intelligence', '$2K\u2013$5K', 'Included \u2014 live data feeds'],
                    ['Buyer identification', 'Included in retainer', 'Included \u2014 scored & ranked'],
                    ['DD coordination', 'Included in retainer', 'Included \u2014 50\u2013100 items tracked'],
                    ['Negotiation prep', 'Included in retainer', 'Included \u2014 comps + counter-offers drafted'],
                  ].map(([deliverable, ib, smbx]) => (
                    <tr key={deliverable}>
                      <td className="px-6 py-4 font-semibold">{deliverable}</td>
                      <td className={`px-6 py-4 ${muted}`}>{ib}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#D44A78] text-sm">check_circle</span>
                          {smbx}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-6 py-4 font-semibold">Negotiate on your behalf</td>
                    <td className={`px-6 py-4 ${muted}`}>Yes \u2014 licensed advisor</td>
                    <td className={`px-6 py-4 ${muted}`}>You handle this (Yulia preps you)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold">Fiduciary representation</td>
                    <td className={`px-6 py-4 ${muted}`}>Yes \u2014 licensed advisor</td>
                    <td className={`px-6 py-4 ${muted}`}>Not included (connect to licensed advisor)</td>
                  </tr>
                  <tr className={dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}>
                    <td className="px-6 py-4 font-bold">Total cost (12-month engagement)</td>
                    <td className="px-6 py-4 font-bold">$150K\u2013$500K+</td>
                    <td className="px-6 py-4 font-bold text-[#D44A78]">$1,788/year</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={`mt-6 rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-[#D44A78]/10 border border-[#D44A78]/20' : 'bg-[#D44A78]/5 border border-[#D44A78]/15'}`}>
              <span className="material-symbols-outlined text-[#D44A78] text-2xl shrink-0 mt-1">info</span>
              <p className={`text-sm ${muted}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>This is not an anti-advisor comparison.</span> smbX.ai makes sure you're prepared before you hire an advisor — and if you do, the work Yulia has already done makes their engagement faster, cheaper, and more effective. Many advisors use smbX.ai themselves.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 4. WHAT'S FREE ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Free Forever</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Start for free. Keep everything Yulia finds.</h2>
              <p className={`leading-relaxed editorial mb-6 ${muted}`}>No credit card required. Everything through your first gates is free — including a preliminary valuation range with real market data. Not a trial. Not a teaser. Real analysis you keep forever.</p>
              <p className={`font-bold text-xl border-l-4 border-[#D44A78] pl-6 italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>If you could Google it, it's free. The moment Yulia tells you something you can't find anywhere else — that's where the value starts.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'chat', title: 'Yulia', desc: 'Unlimited conversation about your deal, industry, market. Ask anything. Free forever.' },
                  { icon: 'monitoring', title: 'ValueLens', desc: 'Preliminary valuation range with market context. Updated as your financials sharpen.' },
                  { icon: 'checklist', title: 'Value Readiness', desc: 'What $5K\u2013$15K of consulting delivers.' },
                  { icon: 'description', title: 'Buyer Thesis', desc: 'Acquisition blueprint + SBA eligibility + capital stack template. Your complete search strategy.' },
                ].map((item) => (
                  <div key={item.title} className={`rounded-2xl p-6 hover:shadow-lg transition-all ${card}`}>
                    <div className="w-12 h-12 rounded-xl bg-[#006630]/10 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[#006630] text-xl">{item.icon}</span>
                    </div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className={`text-xs ${muted}`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 5. HOW THE PAYWALL WORKS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <ScrollReveal className="lg:col-span-5">
              <div className="border-l-8 border-[#D44A78] pl-8">
                <h2 className="text-4xl font-headline font-black tracking-tight mb-6">The upgrade happens naturally.</h2>
                <p className={`text-xl ${muted}`}>No checkout page. No paywall modal. Yulia delivers free value, then tells you when the next step requires a plan. By then, she's already proven what she can do.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className={`rounded-3xl p-8 shadow-sm ${card}`}>
                <div className="space-y-0">
                  {[
                    { num: '1', title: 'Describe your deal', desc: 'Industry, revenue, location \u2014 plain language', free: true },
                    { num: '2', title: 'Yulia analyzes your financials', desc: 'Add-backs identified, SDE/EBITDA calculated, preliminary range', free: true },
                    { num: '3', title: 'You get real value', desc: 'ValueLens range + Value Readiness Report \u2014 yours to keep', free: true },
                  ].map((step) => (
                    <div key={step.num} className={`flex items-center gap-4 p-4 rounded-xl ${dark ? 'hover:bg-zinc-800' : 'hover:bg-[#f3f3f6]'} transition-all`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[#006630] font-bold shrink-0 ${dark ? 'bg-[#006630]/20' : 'bg-[#006630]/10'}`}>{step.num}</div>
                      <div className="flex-1">
                        <p className="font-bold">{step.title}</p>
                        <p className={`text-xs ${muted}`}>{step.desc}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded font-bold ${dark ? 'bg-[#006630]/20 text-[#006630]' : 'bg-[#006630]/10 text-[#006630]'}`}>FREE</span>
                    </div>
                  ))}
                  <div className="w-full border-t border-dashed border-[#D44A78]/30 my-2" />
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#D44A78]/5">
                    <div className="w-10 h-10 rounded-xl bg-[#D44A78]/10 flex items-center justify-center text-[#D44A78] font-bold shrink-0">4</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#D44A78]">Yulia suggests your plan</p>
                      <p className={`text-xs ${muted}`}>"Ready for the full valuation and deal materials? Here's what comes next."</p>
                    </div>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">$49+</span>
                  </div>
                  <div className={`flex items-center gap-4 p-4 rounded-xl ${dark ? 'hover:bg-zinc-800' : 'hover:bg-[#f3f3f6]'} transition-all`}>
                    <div className="w-10 h-10 rounded-xl bg-[#D44A78]/10 flex items-center justify-center text-[#D44A78] font-bold shrink-0">5</div>
                    <div className="flex-1">
                      <p className="font-bold">Everything unlocks</p>
                      <p className={`text-xs ${muted}`}>Full valuation, CIM, financial models, negotiation, closing, 180-day integration</p>
                    </div>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">ALL</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 6. WHAT PROFESSIONAL INCLUDES ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${darkPanel}`}>
              <div className="mb-12">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Professional Plan</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">$149/month. Everything through close — plus 180 days after.</h2>
                <p className="text-lg text-[#dadadc]/70 max-w-2xl">Your subscription continues through post-close integration. Most deals take 6–18 months. Your total cost for the full journey: $894–$2,682. A traditional advisory engagement for the same coverage: $150K+.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'description', title: 'Professional deal documents', desc: 'CIM, pitch deck, LOI, deal memos \u2014 generated from verified financials, adapted to your league.' },
                  { icon: 'speed', title: 'Defensible valuation', desc: "Multi-methodology with sourced comparables. Built to survive a buyer's QoE review." },
                  { icon: 'calculate', title: 'Financial modeling', desc: 'SBA qualification, DSCR, DCF, sensitivity analysis \u2014 deterministic engines, not AI estimates.' },
                  { icon: 'gavel', title: 'Negotiation intelligence', desc: 'Comparable deal data, counter-offer frameworks, working capital analysis \u2014 every communication drafted.' },
                  { icon: 'fact_check', title: 'DD coordination', desc: '50\u2013100 item checklists tracked to completion. Multi-party coordination. Deadline alerts.' },
                  { icon: 'merge', title: '180-day integration', desc: 'Post-close value creation plan from actual DD findings. Milestone tracking. Metric monitoring.' },
                ].map((item) => (
                  <div key={item.title} className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <span className="material-symbols-outlined text-[#D44A78] text-2xl mb-3">{item.icon}</span>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-[#dadadc]/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 7. FAQ ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-12">Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { q: 'How long do most deals take?', a: 'Seller exits: 6\u201318 months. Buyer acquisitions: 6\u201312 months. Capital raises: 3\u20136 months. Your subscription continues through close and 180 days of post-close support.' },
              { q: "What if my deal doesn't close?", a: "Cancel anytime. No success fees. No close fees. Ever. The work Yulia produced is yours to keep \u2014 valuations, documents, analysis \u2014 regardless of outcome." },
              { q: 'Can I start free and upgrade later?', a: "Yes. Start with a conversation. Yulia delivers real analysis for free. When you're ready for the full journey \u2014 CIM, financial models, negotiation support \u2014 upgrade to the plan that fits." },
              { q: 'Do I still need a broker or attorney?', a: "smbX.ai prepares everything a broker or attorney would review. Many users engage an advisor for the final stages \u2014 and the work Yulia has already done makes that engagement faster and cheaper." },
              { q: "I'm a broker/advisor. Which plan?", a: 'Same platform, same tiers. Solo practitioners typically use Professional ($149/mo). Firms with multiple team members use Enterprise ($999/mo). Try Professional free for 30 days.' },
              { q: 'How does this compare to ChatGPT?', a: 'ChatGPT generates plausible text. smbX.ai runs 6 specialized engines with live market data, deterministic financial calculations, a 22-gate methodology, and 35 industries of deep intelligence. The difference is defensibility.' },
            ].map((faq) => (
              <StaggerItem key={faq.q}>
                <div>
                  <h4 className="font-bold mb-2">{faq.q}</h4>
                  <p className={`text-sm leading-relaxed ${muted}`}>{faq.a}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 8. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white ${darkPanel}`}>
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95]">Free until you<br/>see the <span className="text-[#D44A78]">value.</span></h2>
                <p className="text-lg text-[#dadadc]/70 mt-4">Tell Yulia about your deal. Keep everything she finds. Pay only when you're ready for the full journey.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={() => handleCTA()} className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Talk to Yulia</button>
                <p className="text-xs text-[#dadadc]/70">No credit card required · Cancel anytime</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
