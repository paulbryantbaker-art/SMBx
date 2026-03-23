import { useDarkMode, DarkModeToggle } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const freeDeliverables = [
    { title: 'ValueLens', desc: 'Deep-dive structural audit of business health and owner dependence.', icon: 'visibility', span: 'md:col-span-4' },
    { title: 'Value Readiness Report', desc: "A comprehensive gap analysis identifying what needs fixing before you take the business to market or sign an LOI.", icon: 'assignment_turned_in', span: 'md:col-span-8', tags: ['Exit Strategy', 'Gap Analysis'] },
    { title: 'Investment Thesis', desc: 'A professional narrative outlining the strategic rationale and synergy potential of the acquisition.', icon: 'lightbulb', span: 'md:col-span-6' },
  ];

  const bentoSmall = [
    { label: 'Preliminary', title: 'SDE/EBITDA' },
    { label: 'Capital Stack', title: 'Template' },
    { label: 'AI-Powered', title: 'Deal Scoring' },
    { label: 'Owner-Operated', title: 'CIM Builder' },
  ];

  const platformFees = [
    { bracket: 'SDE under $500K', price: '$999', comparison: '$15K–$40K', compLabel: 'Traditional broker commissions for this size usually range between' },
    { bracket: 'SDE $500K–$2M', price: '$1,500', comparison: '$25K–$75K', compLabel: 'Market advisory retainers for this bracket typically start at' },
    { bracket: 'EBITDA $2M–$5M', price: '$5,000', comparison: '$75K–$200K', compLabel: 'Investment bank retainers for mid-market deals often exceed' },
    { bracket: 'EBITDA $5M–$10M', price: '$15,000', comparison: '$150K–$400K', compLabel: 'Full investment banking engagements for this scale cost' },
  ];

  const advisorTiers = [
    { name: 'Advisor Trial', price: '$0', period: '/30 days', desc: 'Explore the capabilities.', features: ['3 Business Audits', 'Core Analysis Suite'], cta: 'Start Trial', accent: false },
    { name: 'Advisor Pro', price: '$299', period: '/mo', desc: 'For independent M&A advisors.', features: ['Unlimited Basic Audits', 'White-labeled Reports', 'Advanced Benchmarking'], cta: 'Go Pro', accent: true, badge: 'Recommended' },
    { name: 'Advisor Enterprise', price: '$499', period: '/mo', desc: 'For teams and banks.', features: ['Multi-seat Management', 'Custom AI Training', 'API Access'], cta: 'Contact Sales', accent: false },
  ];

  const faqs = [
    { q: 'Is the free analysis really free?', a: "Yes. You can engage with Yulia, upload documents, and receive all core analysis reports without ever entering a credit card. We believe the value of the platform is so high that you'll choose to execute with us when the time is right." },
    { q: 'What does the "Platform Fee" cover?', a: 'The one-time fee unlocks the deal room, professional-grade CIM generation, legal template library, escrow facilitation, and deep-dive financial modeling for one specific transaction until it closes or is terminated.' },
    { q: "Do I need a subscription for each deal?", a: "No. We don't do recurring subscriptions for buyers or sellers. Each transaction is its own project. You pay the platform fee only for the deals you decide to take into active execution." },
    { q: 'How is "Deal Complexity" determined?', a: "We use a mix of SDE/EBITDA and revenue as primary indicators. If a business is highly complex but has low SDE, Yulia will flag this during the free analysis phase so you have total pricing transparency before you pay." },
    { q: 'Can I use smbX.ai as an advisor?', a: "Absolutely. Our Advisor plans are specifically designed for brokers and M&A consultants who want to use Yulia's analytical power across multiple client engagements with white-labeled reporting." },
    { q: 'What happens if a deal fails to close?', a: 'The platform fee covers the execution environment for that specific business. If the deal fails, the fee remains tied to that specific engagement. For a new business target, a new project would be started.' },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24 max-w-4xl">
          <ScrollReveal>
            <span className="text-[#b0004a] font-bold uppercase tracking-[0.3em] text-xs mb-6 block">Strategic Pricing</span>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-8">
              Start free. Stay because <span className="text-[#b0004a]">it works.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className={`text-xl md:text-2xl leading-relaxed max-w-2xl font-light ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              Before you spend anything — before you create an account — Yulia delivers real analysis from a conversation.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. FREE DELIVERABLES BENTO ═══ */}
        <section className={`mb-32 -mx-6 md:-mx-12 px-6 md:px-12 py-16 ${dark ? 'bg-[#1a1c1e]' : 'bg-[#f3f3f6]'}`}>
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-4">
                <div>
                  <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs">Phased Engagement</span>
                  <h2 className="font-headline text-4xl font-bold mt-4">Free Deliverables</h2>
                </div>
                <div className="text-right">
                  <p className="text-[#b0004a] font-extrabold text-2xl">Free forever.</p>
                </div>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {freeDeliverables.map((d) => (
                <StaggerItem key={d.title} className={d.span}>
                  <div className={`p-8 rounded-xl h-64 flex flex-col justify-between ${dark ? 'bg-[#2f3133] border border-white/5' : 'bg-white shadow-sm hover:shadow-md transition-shadow'}`}>
                    <div>
                      <span className="material-symbols-outlined text-[#b0004a] text-3xl mb-4">{d.icon}</span>
                      <h3 className="text-xl font-bold mb-2">{d.title}</h3>
                      <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                    </div>
                    {d.tags && (
                      <div className="flex gap-3 mt-4">
                        {d.tags.map((tag) => (
                          <span key={tag} className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${dark ? 'bg-white/5 text-gray-300' : 'bg-[#eeeef0] text-[#5d5e61]'}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}

              {/* 2x2 small cards */}
              <StaggerItem className="md:col-span-6">
                <div className="grid grid-cols-2 gap-4 h-64">
                  {bentoSmall.map((item) => (
                    <div key={item.title} className={`p-6 rounded-xl flex flex-col justify-center text-center ${dark ? 'bg-[#2f3133] border border-white/5' : 'bg-white shadow-sm'}`}>
                      <p className={`text-[10px] uppercase font-bold mb-2 ${dark ? 'text-gray-500' : 'text-[#5d5e61]'}`}>{item.label}</p>
                      <h4 className="text-lg font-bold">{item.title}</h4>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ 3. ONE-TIME PLATFORM FEES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="max-w-4xl mb-16">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs">The Transition</span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mt-4 mb-6">When you're ready to execute, one fee covers everything.</h2>
              <p className={`text-xl leading-relaxed font-light ${dark ? 'text-gray-300' : 'text-[#5d5e61]'}`}>
                We've eliminated the friction of monthly subscriptions and opaque retainer models. You pay once when you move from analysis to execution. That single fee unlocks the entire smbX.ai platform for that specific transaction.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFees.map((tier) => (
              <StaggerItem key={tier.bracket}>
                <div className={`p-8 rounded-xl flex flex-col h-full transition-all ${dark ? 'bg-[#2f3133] border border-white/5 hover:border-[#b0004a]/50' : 'bg-white border-t-4 border-[#b0004a] shadow-lg'}`}>
                  <div className="mb-8">
                    <p className={`font-bold uppercase text-[10px] mb-4 ${dark ? 'text-gray-500' : 'text-[#5d5e61]'}`}>{tier.bracket}</p>
                    <h3 className="text-3xl font-extrabold mb-2">{tier.price}</h3>
                    <p className="text-[#b0004a] font-bold text-sm">One-time Platform Fee</p>
                  </div>
                  <div className={`mt-auto pt-8 ${dark ? 'border-t border-white/5' : 'border-t border-[#eeeef0]'}`}>
                    <p className={`text-xs italic leading-relaxed ${dark ? 'text-gray-400' : 'text-[#5d5e61]'}`}>
                      {tier.compLabel} <span className={`font-semibold not-italic ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>{tier.comparison}</span>.
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Institutional Custom row */}
          <ScrollReveal delay={0.1}>
            <div className={`mt-6 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 ${dark ? 'bg-white/5 border border-white/10' : 'bg-[#2f3133] text-white'}`}>
              <div>
                <h4 className={`text-xl font-bold ${dark ? '' : 'text-white'}`}>Institutional Custom</h4>
                <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>Complex structures and EBITDA $10M+ require bespoke intelligence support.</p>
              </div>
              <button onClick={handleCTA} className={`px-10 py-4 rounded-xl font-bold transition-all border-none cursor-pointer shrink-0 ${dark ? 'bg-white text-[#1a1c1e] hover:bg-gray-200' : 'bg-white text-[#1a1c1e] hover:bg-gray-200'}`}>Contact Intelligence Team</button>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 4. YULIA CONVERSATION ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className={`rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch ${dark ? 'bg-[#2f3133] border border-white/5 shadow-2xl' : 'bg-white shadow-2xl'}`}>
              {/* Left — Yulia info */}
              <div className={`md:col-span-5 p-10 md:p-12 flex flex-col justify-center ${dark ? 'bg-black/20' : 'bg-[#1a1c1e]'}`}>
                <h3 className="font-headline text-3xl font-bold text-white mb-4">Conversational Transparency</h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  Yulia isn't just an AI; she's your lead analyst. She explains the math as she builds the deal.
                </p>
              </div>
              {/* Right — conversation */}
              <div className={`md:col-span-7 p-10 md:p-12 ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className={`p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%] ${dark ? 'bg-[#b0004a]/20 text-gray-200' : 'bg-[#b0004a]/10 text-[#1a1c1e]'}`}>
                      "Based on the tax returns you've shared, I've calculated an SDE of $420,000 for the HVAC company. All the analysis I've done so far—the ValueLens audit and the Investment Thesis—is yours to keep for free."
                    </div>
                  </div>
                  <div className="flex gap-4 items-start justify-end">
                    <div className={`p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed max-w-[85%] ${dark ? 'bg-white/5 text-gray-200 border border-white/10' : 'bg-white text-[#1a1c1e] shadow-sm'}`}>
                      "What's the next step if I want to move toward an LOI?"
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className={`p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%] ${dark ? 'bg-[#b0004a]/20 text-gray-200' : 'bg-[#b0004a]/10 text-[#1a1c1e]'}`}>
                      "To unlock the execution dashboard, data room, and professional CIM, there's a one-time platform fee of <span className={`font-bold ${dark ? 'text-[#ffb2bf]' : 'text-[#b0004a]'}`}>$999</span>. No subscriptions. This covers everything for this specific deal until close."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. ADVISOR PRICING ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs">For Professionals</span>
              <h2 className="font-headline text-4xl font-bold mt-4">Advisor Solutions</h2>
              <p className={`mt-4 ${dark ? 'text-gray-400' : 'text-[#5d5e61]'}`}>Scale your practice with Yulia's analytical power.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advisorTiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <div className={`p-8 rounded-2xl flex flex-col h-full transition-all relative ${tier.accent
                  ? `${dark ? 'bg-[#2f3133] border-2 border-[#b0004a]' : 'bg-white shadow-xl ring-2 ring-[#b0004a]'}`
                  : `${dark ? 'border border-white/5 hover:bg-white/5' : 'bg-[#f3f3f6]'}`
                }`}>
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b0004a] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">{tier.badge}</div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className={`text-sm mb-6 ${dark ? 'text-gray-500' : 'text-[#5d5e61]'}`}>{tier.desc}</p>
                  <div className="text-3xl font-extrabold mb-8">{tier.price}<span className={`text-sm font-normal ${dark ? 'text-gray-500' : 'text-[#5d5e61]'}`}> {tier.period}</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${tier.accent ? 'font-medium' : ''} ${dark ? 'text-gray-300' : ''}`}>
                        <span className="material-symbols-outlined text-[#b0004a] text-sm" style={tier.accent ? { fontVariationSettings: "'FILL' 1" } : undefined}>check_circle</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleCTA} className={`w-full py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${tier.accent
                    ? 'bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white shadow-lg shadow-[#b0004a]/20'
                    : `${dark ? 'border border-white/20 bg-transparent text-white hover:bg-white/10' : 'border-2 border-[#b0004a] text-[#b0004a] hover:bg-[#b0004a]/5'}`
                  }`} style={!tier.accent ? { border: dark ? '1px solid rgba(255,255,255,0.2)' : '2px solid #b0004a' } : undefined}>{tier.cta}</button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 6. FAQ ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-16">Frequently Asked Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <div>
                  <h4 className="text-lg font-bold mb-4">{faq.q}</h4>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-[#5d5e61]'}`}>{faq.a}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 7. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133] border border-white/5' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 leading-tight">Stop paying for advice. <span className="text-[#b0004a]">Start paying for results.</span></h2>
              <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${dark ? 'text-gray-400' : 'text-[#5d5e61]'}`}>Free tools to start. One-time fee to transact. No subscriptions, no hidden charges, no percentage of your deal.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Try free — no credit card</button>
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
