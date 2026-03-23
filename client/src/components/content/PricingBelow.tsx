import { useState } from 'react';
import { useDarkMode, DarkModeToggle } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark, setDark] = useDarkMode();

  // Calculator state
  const [journey, setJourney] = useState<'sell' | 'buy' | 'raise'>('sell');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [revenue, setRevenue] = useState('');
  const [sde, setSde] = useState('');

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const parseNum = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  const formatUSD = (n: number) => '$' + n.toLocaleString('en-US');

  const sdeNum = parseNum(sde);
  const calculatedFee = sdeNum > 0 ? Math.max(999, Math.round(sdeNum * 0.001)) : null;

  const goToChat = () => {
    const parts: string[] = [];
    const journeyLabel = { sell: 'selling', buy: 'buying', raise: 'raising capital for' }[journey];
    parts.push("I'm interested in " + journeyLabel);
    if (industry) parts.push('a ' + industry + ' business');
    if (location) parts.push('in ' + location);
    if (revenue) parts.push('with about $' + revenue + ' in annual revenue');
    if (sde) parts.push('and roughly $' + sde + ' in SDE');
    const msg = parts.join(' ') + '.';
    window.location.href = '/?prefill=' + encodeURIComponent(msg);
  };

  const freeDeliverables = [
    { title: 'ValueLens', desc: 'How buyers will view your enterprise risk and opportunity — structural audit of business health and owner dependence.', icon: 'visibility', span: 'col-span-12 md:col-span-4' },
    { title: 'Value Readiness Report', desc: "Comprehensive gap analysis identifying what's holding back your multiple — with specific recommendations for each factor and a priority remediation sequence.", icon: 'fact_check', span: 'col-span-12 md:col-span-8', tags: ['Exit Strategy', 'Gap Analysis', 'Remediation'] },
    { title: 'Investment Thesis', desc: 'Professional narrative outlining the strategic rationale for your deal — the document that makes buyers lean forward.', icon: 'lightbulb', span: 'col-span-12 md:col-span-6' },
  ];

  const bentoSmall = [
    { label: 'Preliminary', title: 'SDE / EBITDA', icon: 'calculate', span: 'col-span-6 md:col-span-3' },
    { label: 'Capital Stack', title: 'Template', icon: 'account_balance', span: 'col-span-6 md:col-span-3' },
    { label: 'AI-Powered', title: 'Deal Scoring', icon: 'scoreboard', span: 'col-span-4' },
    { label: 'Owner-Operated', title: 'CIM Builder', icon: 'description', span: 'col-span-4' },
    { label: 'Unlimited', title: 'Yulia Q&A', icon: 'chat', span: 'col-span-4' },
  ];

  const examples = [
    { label: '$750K SDE', price: '$999', note: 'minimum applies' },
    { label: '$2M SDE', price: '$2,000' },
    { label: '$5M EBITDA', price: '$5,000' },
    { label: '$20M EBITDA', price: '$20,000' },
  ];

  const included = [
    { icon: 'query_stats', title: 'Deal & Market Intelligence', desc: 'Localized comps, buyer and seller landscape mapping, market density analysis, competitive positioning, and industry trend forecasting for your specific sector and geography.' },
    { icon: 'calculate', title: 'Financial Analysis & Modeling', desc: 'Multi-methodology valuation, sensitivity and scenario modeling, capital stack optimization, SBA qualification analysis, and tax-aware deal structuring.' },
    { icon: 'description', title: 'Deliverable Documents', desc: 'Professional CIM, deal memos, pitch decks, LOI templates, term sheets, legal frameworks, and data room organization — all generated from your deal data.' },
    { icon: 'trending_up', title: 'Business Optimization', desc: 'Value driver identification, add-back analysis, operational gap remediation plans, KPI frameworks, and pre-market preparation strategy to maximize your multiple.' },
    { icon: 'handshake', title: 'Deal Execution', desc: 'Secure deal room, negotiation strategy and tactics, due diligence checklists, closing coordination, escrow and wire guidance, and lender matching.' },
    { icon: 'rocket_launch', title: 'Post-Close Integration', desc: 'Custom 180-day plan built from your DD findings, employee and vendor transition playbooks, customer communication strategy, and value creation scorecard.' },
  ];

  const faqs = [
    { q: 'Is the free analysis really free?', a: 'Yes. Engage with Yulia, upload documents, receive full analysis reports — no credit card, no expiration. You only pay when you choose to move into deal execution.' },
    { q: "What's included in the execution fee?", a: 'Everything for one deal: professional CIM generation, deal room, legal template library, advanced financial modeling, closing support, and your 180-day post-close integration plan. No additional charges.' },
    { q: 'Why 0.1%?', a: "The analytical depth, document generation, and deal support scale with complexity. A flat percentage means everyone pays the same rate relative to their deal — and the $999 minimum ensures smaller businesses get the full platform." },
    { q: "What if I'm a broker or M&A advisor?", a: 'advisor' },
    { q: 'Can I take my data with me?', a: 'Always. You own your data. Export your CIM, ValueLens, and financial models in standard formats at any time — even if you never pay the execution fee.' },
    { q: 'What happens if a deal falls through?', a: "The platform fee covers one specific deal engagement. All your free-tier analysis and deliverables remain yours. For a new deal, you'd start a new conversation — free analysis again, new fee only if you execute." },
  ];

  const journeyBtns = [
    { key: 'sell' as const, label: 'Selling' },
    { key: 'buy' as const, label: 'Buying' },
    { key: 'raise' as const, label: 'Raising' },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — 12-col editorial grid ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex gap-2 mb-10">
                <span className="px-4 py-1.5 bg-[#b0004a]/5 text-[#b0004a] text-[11px] font-bold tracking-widest uppercase rounded-full border border-[#b0004a]/10">Pricing</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
                Start free. Stay because <span className="text-[#b0004a]">it works.</span>
              </h1>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2} className="lg:col-span-5 lg:pt-24">
            <p className={`text-xl leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              Every conversation with Yulia starts for free. No credit card. No account. No trial that expires. When you're ready to execute, one payment covers everything through closing.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. FREE DELIVERABLES — asymmetric bento ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Phase One</span>
                <h2 className="font-headline text-4xl font-bold tracking-tight">What's free</h2>
              </div>
              <span className="text-[#b0004a] font-bold tracking-widest text-sm uppercase">Forever</span>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-12 gap-4">
            {freeDeliverables.map((d) => (
              <StaggerItem key={d.title} className={d.span}>
                <div className={`p-8 rounded-xl min-h-[200px] flex flex-col ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-3xl mb-4">{d.icon}</span>
                  <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                  <p className={`text-sm leading-relaxed ${d.tags ? 'max-w-lg' : ''} ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                  {d.tags && (
                    <div className="flex gap-3 mt-auto pt-4">
                      {d.tags.map((tag) => (
                        <span key={tag} className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${dark ? 'bg-zinc-800 text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}

            {bentoSmall.map((item) => (
              <StaggerItem key={item.title} className={item.span}>
                <div className={`p-6 rounded-xl flex flex-col justify-center text-center min-h-[200px] ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a]/40 text-4xl mb-3">{item.icon}</span>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{item.label}</p>
                  <h4 className="text-base font-bold">{item.title}</h4>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 3. INTERACTIVE CALCULATOR + FORMULA ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Phase Two</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight">Deal Execution and Automation Fees</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className={`rounded-3xl overflow-hidden ${dark ? 'bg-[#141517] border border-zinc-800' : 'bg-[#1a1c1e]'}`}>
              {/* Top: Formula + Calculator */}
              <div className="p-12 md:p-16 pb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  {/* Left: Formula */}
                  <div>
                    <div className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white mb-2">0.1%</div>
                    <div className="text-xl text-[#dadadc] font-medium mb-8">of your annual SDE or EBITDA</div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-[#b0004a] px-5 py-2 rounded-xl font-bold text-sm text-white">$999 minimum</div>
                      <span className="text-[#dadadc]/60 text-sm">One-time per deal</span>
                    </div>
                    <p className="text-[#dadadc]/60 text-sm leading-relaxed max-w-sm">The same rate for every business. Analytical depth and automation scale with deal complexity — you pay the same percentage regardless of size.</p>
                  </div>

                  {/* Right: Calculator */}
                  <div className="bg-[#2f3133] rounded-2xl p-8 border border-white/10">
                    <h3 className="text-white font-bold text-lg mb-6">Calculate your fee</h3>

                    {/* Journey selector */}
                    <div className="flex gap-2 mb-6">
                      {journeyBtns.map((j) => (
                        <button
                          key={j.key}
                          onClick={() => setJourney(j.key)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer ${journey === j.key ? 'bg-[#b0004a] text-white' : 'bg-white/5 text-[#dadadc] hover:bg-white/10'}`}
                        >{j.label}</button>
                      ))}
                    </div>

                    {/* Industry */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/50 tracking-widest block mb-2">Industry</label>
                      <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. HVAC, dental, SaaS, manufacturing" className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#dadadc]/30 focus:border-[#b0004a]/50 transition-colors outline-none" />
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/50 tracking-widest block mb-2">Location</label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dallas, TX" className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#dadadc]/30 focus:border-[#b0004a]/50 transition-colors outline-none" />
                    </div>

                    {/* Revenue */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/50 tracking-widest block mb-2">Annual Revenue</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#dadadc]/40 text-sm font-bold">$</span>
                        <input type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="3,200,000" className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder-[#dadadc]/30 focus:border-[#b0004a]/50 transition-colors outline-none" />
                      </div>
                    </div>

                    {/* SDE / EBITDA */}
                    <div className="mb-6">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/50 tracking-widest block mb-2">SDE or EBITDA</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#dadadc]/40 text-sm font-bold">$</span>
                        <input type="text" value={sde} onChange={(e) => setSde(e.target.value)} placeholder="850,000" className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder-[#dadadc]/30 focus:border-[#b0004a]/50 transition-colors outline-none" />
                      </div>
                    </div>

                    {/* Result */}
                    {calculatedFee !== null && (
                      <div className="bg-[#1a1c1e] rounded-xl p-5 border border-white/5 mb-6">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs text-[#dadadc]/50 uppercase font-bold">Your execution fee</span>
                          <span className="text-xs text-[#dadadc]/40">0.1% of SDE</span>
                        </div>
                        <div className="text-4xl font-black text-white">{formatUSD(calculatedFee)}</div>
                        <p className="text-xs text-[#dadadc]/40 mt-2">One-time. Everything included through closing + 180-day integration.</p>
                      </div>
                    )}

                    {/* CTA */}
                    <button onClick={goToChat} className="w-full bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 border-none cursor-pointer">
                      Continue with Yulia <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                    <p className="text-[10px] text-[#dadadc]/30 text-center mt-3">Your inputs carry over to the conversation</p>
                  </div>
                </div>
              </div>

              {/* Bottom: 4 example calculations */}
              <div className="p-12 md:px-16 pt-12">
                <div className="border-t border-white/10 pt-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {examples.map((ex) => (
                      <div key={ex.label}>
                        <div className="text-xs text-[#dadadc]/40 uppercase font-bold tracking-wider mb-2">{ex.label}</div>
                        <div className="text-2xl font-black text-white">{ex.price}</div>
                        {ex.note && <div className="text-[10px] text-[#dadadc]/30 mt-1">{ex.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <p className={`text-sm mt-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>No subscriptions. No per-document charges. Yulia calculates your exact fee from your financials — you see it before you pay.</p>
        </section>

        {/* ═══ 4. WHAT'S INCLUDED ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">What the fee covers</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">Everything from analysis to close — and 180 days after</h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {included.map((card) => (
              <StaggerItem key={card.title}>
                <div className={`p-8 rounded-xl ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-4">{card.icon}</span>
                  <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 5. HOW PRICING SURFACES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">How it works in practice</h2>
              <p className={`text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>You never see a pricing grid inside the product. Yulia calculates your fee from the financials she's already analyzed.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-[#2f3133] rounded-3xl p-10 md:p-12 space-y-6 max-w-4xl">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-sm leading-relaxed max-w-[85%]">Based on the financials you've shared, I've calculated an SDE of $420,000 for your business. Everything I've generated so far — the ValueLens audit, the Value Readiness Report, the preliminary valuation — is yours to keep.</div>
              </div>
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed max-w-[85%]">What's the next step if I want to move toward an LOI?</div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-sm leading-relaxed max-w-[85%]">To unlock the full execution platform — your deal room, professional CIM, legal templates, closing support, and your 180-day integration plan — the deal execution fee for your business is <span className="text-[#ffb2bf] font-bold">$999</span>. That's 0.1% of your SDE, and it covers everything for this deal through closing day. No subscriptions, no additional charges.</div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. FAQ — 2-col grid ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-4xl font-bold tracking-tight mb-16">Common questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <div>
                  <h4 className="text-lg font-bold mb-3">{faq.q}</h4>
                  {faq.a === 'advisor' ? (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      We have dedicated plans for professionals managing multiple client engagements. Visit the{' '}
                      <a href="/advisors" className={`font-semibold hover:underline ${dark ? 'text-[#b0004a]' : 'text-[#b0004a]'}`}>Advisors page</a>{' '}
                      for Advisor Trial, Pro, and Enterprise plans.
                    </p>
                  ) : (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{faq.a}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 7. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">Your deal starts with a <span className="text-[#b0004a] italic">conversation.</span></h2>
              <p className={`text-lg mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Free analysis. No credit card. No commitment.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
      <DarkModeToggle dark={dark} setDark={setDark} />
    </div>
  );
}
