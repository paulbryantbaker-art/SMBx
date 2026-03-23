import { useDarkMode, DarkModeToggle } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const freeDeliverables = [
    { title: 'ValueLens', desc: 'How buyers will view your enterprise risk and opportunity.', icon: 'visibility', span: 'col-span-12 md:col-span-4' },
    { title: 'Value Readiness Report', desc: "Gap analysis identifying what's holding back your multiple — with specific recommendations.", icon: 'fact_check', span: 'col-span-12 md:col-span-8', maxW: true },
    { title: 'Investment Thesis', desc: 'Professional narrative outlining the strategic rationale for your deal.', icon: 'lightbulb', span: 'col-span-12 md:col-span-6' },
  ];

  const bentoSmall = [
    { label: 'Preliminary', title: 'SDE / EBITDA', span: 'col-span-6 md:col-span-3' },
    { label: 'Capital Stack', title: 'Template', span: 'col-span-6 md:col-span-3' },
    { label: 'AI-Powered', title: 'Deal Scoring', span: 'col-span-6 md:col-span-4' },
    { label: 'Owner-Operated', title: 'CIM Builder', span: 'col-span-6 md:col-span-4' },
    { label: 'Unlimited', title: 'Yulia Q&A', span: 'col-span-12 md:col-span-4' },
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
    { q: "What's included in the execution fee?", a: 'Everything for one deal: professional CIM generation, deal room, legal template library, advanced financial modeling, closing support, and your 180-day post-close integration plan. No additional charges at any point.' },
    { q: 'Why 0.1%?', a: "The analytical depth, document generation, and deal support scale with the complexity of the business. A flat percentage means everyone pays the same rate relative to their deal — and the $999 minimum ensures smaller businesses still get the full platform." },
    { q: "What if I'm a broker or M&A advisor?", a: 'advisor' },
    { q: 'Can I take my data with me?', a: 'Always. You own your data. Export your CIM, ValueLens, and financial models in standard formats at any time — even if you never pay the execution fee.' },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-4xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-20">
          <ScrollReveal y={40}>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-8">
              Start free. Stay because <span className="text-[#b0004a]">it works.</span>
            </h1>
          </ScrollReveal>
        </section>

        {/* ═══ 2. THE PHILOSOPHY ═══ */}
        <ScrollReveal delay={0.1}>
          <section className="mb-24">
            <div className={`space-y-8 text-xl max-w-3xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`} style={{ lineHeight: 1.7, letterSpacing: '-0.01em' }}>
              <p>Every conversation with Yulia starts for free. No credit card. No account. No trial that expires. You tell her about your deal, she gives you real analysis — a preliminary valuation, market intelligence, add-back identification, competitive landscape. That's yours to keep regardless of what happens next.</p>
              <p>When you're ready to move from analysis to execution — the CIM, the deal room, the legal templates, the closing support, the 180-day integration plan — there's a single platform fee. One payment. One deal. Everything included through closing.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. FREE DELIVERABLES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tight">What's free</h2>
              <span className="text-[#b0004a] font-bold tracking-widest text-sm uppercase">Forever</span>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-12 gap-4">
            {freeDeliverables.map((d) => (
              <StaggerItem key={d.title} className={d.span}>
                <div className={`p-8 rounded-xl min-h-[180px] ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-3xl mb-4">{d.icon}</span>
                  <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                  <p className={`text-sm ${d.maxW ? 'max-w-md' : ''} ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                </div>
              </StaggerItem>
            ))}

            {bentoSmall.map((item) => (
              <StaggerItem key={item.title} className={item.span}>
                <div className={`p-6 rounded-xl flex flex-col justify-center text-center min-h-[180px] ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <p className={`text-[10px] uppercase font-bold mb-2 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{item.label}</p>
                  <h4 className="text-base font-bold">{item.title}</h4>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 4. DEAL EXECUTION FEES — THE FORMULA ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">Deal Execution and Automation Fees</h2>
            <p className={`text-lg mb-12 max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>When you're ready to move from analysis to execution, one payment unlocks the full platform for your deal — all deliverables, deal room, closing support, and 180-day integration plan.</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className={`rounded-3xl p-12 md:p-16 text-white ${dark ? 'bg-[#232528] border border-zinc-800' : 'bg-[#1a1c1e]'}`}>
              <div className="max-w-2xl">
                <div className="mb-12">
                  <div className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-2">0.1%</div>
                  <div className="text-xl text-[#dadadc] font-medium">of your annual SDE or EBITDA</div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-12 pb-12 border-b border-white/10">
                  <div className="bg-[#b0004a] px-5 py-2 rounded-xl font-bold text-sm">$999 minimum</div>
                  <span className="text-[#dadadc]/60 text-sm">One-time per deal. Everything included.</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {examples.map((ex) => (
                    <div key={ex.label}>
                      <div className="text-xs text-[#dadadc]/60 uppercase font-bold tracking-wider mb-2">{ex.label}</div>
                      <div className="text-2xl font-black">{ex.price}</div>
                      {ex.note && <div className="text-[10px] text-[#dadadc]/40 mt-1">{ex.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <p className={`text-sm mt-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>No subscriptions. No per-document charges. Yulia calculates your exact fee from your financials — you see it before you pay.</p>
        </section>

        {/* ═══ 5. WHAT'S INCLUDED ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">What's included</h2>
            <p className={`text-lg mb-12 max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Everything you need to go from analysis to closed deal — and the first 180 days after.</p>
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

        {/* ═══ 6. HOW PRICING SURFACES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">How it works in practice</h2>
            <p className={`text-lg mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>You never see a pricing grid inside the product. Yulia calculates your fee from the financials she's already analyzed and tells you exactly what it is before you commit.</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-[#2f3133] rounded-3xl p-10 md:p-12 space-y-6">
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

        {/* ═══ 7. FAQ ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-3xl font-bold mb-12">Common questions</h2>
          </ScrollReveal>
          <StaggerContainer className="space-y-10">
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <div>
                  <h4 className="text-lg font-bold mb-3">{faq.q}</h4>
                  {faq.a === 'advisor' ? (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      We have dedicated plans for professionals managing multiple client engagements. Visit the{' '}
                      <a href="/advisors" className={`font-semibold ${dark ? 'text-[#ffb2bf]' : 'text-[#b0004a]'}`}>Advisors page</a>{' '}
                      for details on our Advisor Trial, Pro, and Enterprise plans.
                    </p>
                  ) : (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{faq.a}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 8. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-6">Your deal starts with a conversation.</h2>
            <p className={`text-lg mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Free analysis. No credit card. No commitment.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
              <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
            </div>
          </section>
        </ScrollReveal>

      </div>
      <DarkModeToggle dark={dark} setDark={setDark} />
    </div>
  );
}
