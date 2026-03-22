import { ScrollReveal, ConversationTyping } from './animations';

const FREE_DELIVERABLES = [
  'ValueLens — AI-estimated value range, updated quarterly',
  'Value Readiness Report — seven-factor exit readiness score',
  'Investment Thesis — acquisition blueprint with target criteria',
  'Preliminary SDE/EBITDA — complete add-back identification',
  'Capital Stack Template — SBA loan, equity, seller note, debt service',
  'Deal Scoring — paste any listing URL for instant analysis',
  'CIM — full AI-generated CIM at the owner-operated level',
];

const TIERS = [
  { title: 'Owner-Operated', price: '$999', sde: 'SDE under $500K', desc: 'First-time seller or buyer. SBA-financed.', body: 'All free analysis, plus: full deal execution workspace, all remaining deliverables, deal room, NDA management, buyer/seller matching, DD coordination, closing support, 180-day PMI plan.', context: 'A business broker would charge $15K–$40K in commissions on a deal this size.' },
  { title: 'Established', price: '$1,500', sde: 'SDE $500K–$2M', desc: 'Experienced operator or funded buyer.', body: 'Everything in Owner-Operated, plus: more sophisticated financial modeling, deeper market intelligence, expanded buyer/seller targeting.', context: 'Advisory retainers at this level start at $25K–$75K.' },
  { title: 'Mid-Market', price: '$5,000', sde: 'EBITDA $2M–$5M', desc: 'Institutional buyer interest. PE attention.', body: 'Everything in Established, plus: institutional-quality Living CIM, EBITDA normalization, working capital analysis, QoE framework, full buyer outreach tools, multi-party deal room.', context: 'Investment bank retainers plus success fees at this level run $75K–$200K.' },
  { title: 'Upper Mid-Market', price: '$15,000', sde: 'EBITDA $5M–$10M', desc: 'Board-level process. Multiple bidders.', body: 'Everything in Mid-Market, plus: three-statement modeling, DCF, advanced deal structuring, covenant analysis, institutional buyer mapping, competitive process management.', context: 'A full investment banking engagement at this level costs $150K–$400K.' },
];

const ADVISOR_TIERS = [
  { title: 'Advisor Trial', price: 'Free', desc: 'First three client deals free. Full platform access. Real deals, real data, real deliverables. White-labeled under your brand.' },
  { title: 'Advisor Pro', price: '$299/mo', desc: 'Unlimited client deals. All deliverables. Branded outputs. Client management dashboard.' },
  { title: 'Advisor Enterprise', price: '$499/mo', desc: 'Everything in Pro, plus API access, white-label options, priority support, team seats.' },
];

const FAQS = [
  { q: '"Really free?"', a: "No catch. No credit card. The data is sovereign — collected by federal agencies and published by law. The synthesis takes seconds. We earn trust before we earn revenue." },
  { q: '"Why does pricing vary?"', a: "Because the analytical depth and deal coordination required for a $500K landscaping company and a $15M manufacturer are genuinely different. The fee reflects the complexity, not a markup on deal size." },
  { q: '"How is this different from ChatGPT?"', a: "Yulia has your specific deal data, six sovereign data sources, a structured seven-layer methodology, and memory that compounds over months. ChatGPT knows about M&A. Yulia knows your deal." },
  { q: '"Working with a broker?"', a: "Your broker will appreciate a client who arrives prepared. And if they want to use the platform for their practice, Advisor Trial is free." },
  { q: '"Can I take my data with me?"', a: "Yes. Export anything, anytime. We don't hold your data hostage. We keep you because the platform is more valuable than the documents it produces." },
];

const CONVO_MESSAGES = [
  { role: 'user' as const, text: 'I want to sell my pest control company in Phoenix. About $1.2M revenue.' },
  { role: 'assistant' as const, text: "Let's start with the analysis — that's free. I'll build your ValueLens, identify add-backs, and score your exit readiness.\n\nWhen you're ready to move into deal execution — CIM, deal room, buyer process, DD, closing — the platform fee is $999. That covers everything through the wire.\n\nBut first — what's your approximate net income before you pay yourself?" },
];

export default function PricingBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A18] selection:bg-[#D4714E] selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Transparent Pricing
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-display italic font-bold text-[48px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-[#1A1A18] max-w-5xl mb-8">
              Start free. Stay because it works.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="max-w-2xl text-xl md:text-2xl text-[#6B6B65] leading-relaxed font-headline italic">
              Before you spend anything — before you create an account — Yulia delivers real analysis from a conversation.
            </p>
          </ScrollReveal>
        </div>
        <div className="absolute -right-20 top-20 w-[600px] h-[600px] bg-[#D4714E]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2. FREE FOREVER ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-7">
              <ScrollReveal>
                <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
                  Free Forever
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-8 leading-tight">
                  These aren&apos;t previews. They&apos;re complete analyses.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#6B6B65] leading-relaxed mb-10">
                  Free forever. No credit card. No catch.
                </p>
              </ScrollReveal>
              <div className="space-y-0">
                {FREE_DELIVERABLES.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.04}>
                    <div className="flex items-start gap-4 py-4 border-t border-[#DCC1B9]/30 first:border-t-0">
                      <div className="w-6 h-6 rounded-full border border-[#D4714E] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-[#D4714E]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <span className="text-[#1A1A18] leading-relaxed">{item}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            <div className="md:col-span-5 sticky top-32">
              <ScrollReveal delay={0.15}>
                <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/30">
                  <span className="font-mono text-6xl font-bold text-[#D4714E] block mb-2">$0</span>
                  <span className="font-sans uppercase tracking-widest text-xs font-bold text-[#6B6B65]">Complete Analysis</span>
                  <p className="text-sm text-[#6B6B65] mt-4 leading-relaxed">Seven deliverables. Real data. Sovereign sources. No credit card required.</p>
                  <div className="mt-8 bg-[#F5F3EF] p-4 rounded-lg">
                    <pre className="font-mono text-[10px] text-[#55433C] leading-tight whitespace-pre">{`// VALUE_ANALYSIS
{
 "deliverables": 7,
 "data_sources": 6,
 "cost": 0,
 "catch": null
}`}</pre>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. PLATFORM FEES ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Platform Fees
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-8 max-w-3xl leading-tight">
              When you&apos;re ready to execute, one fee covers everything.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="text-lg text-[#6B6B65] leading-relaxed max-w-[620px] mb-16">
              One decision. One checkout. Everything through closing.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {TIERS.map((tier, i) => (
              <ScrollReveal key={tier.title} delay={i * 0.06}>
                <div className={`bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-t-4 ${i === 0 ? 'border-[#D4714E]' : 'border-[#DCC1B9]/30'} h-full flex flex-col transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]`}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-bold text-[#1A1A18] text-lg">{tier.title}</h3>
                    <span className="font-mono text-3xl text-[#D4714E] font-bold">{tier.price}</span>
                  </div>
                  <p className="text-xs text-[#6B6B65] uppercase tracking-wider">{tier.sde}</p>
                  <p className="text-sm text-[#6B6B65] mt-1 font-headline italic">{tier.desc}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#6B6B65] flex-1">{tier.body}</p>
                  <p className="mt-4 text-xs text-[#6B6B65]/60 pt-4 border-t border-[#DCC1B9]/20">
                    For context: {tier.context}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <div className="mt-8 bg-[#F5F3EF] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <h3 className="font-bold text-[#1A1A18] text-lg">Institutional</h3>
                  <span className="font-headline italic text-2xl text-[#D4714E]">Custom</span>
                </div>
                <p className="text-xs text-[#6B6B65] uppercase tracking-wider">EBITDA $10M+</p>
                <p className="mt-2 text-sm text-[#6B6B65]">Enterprise engagement. Dedicated support. API access.</p>
              </div>
              <button
                onClick={() => onChipClick('Tell me about institutional pricing')}
                className="shrink-0 border border-[#1A1A18] text-[#1A1A18] px-8 py-3 font-bold uppercase text-sm tracking-wider hover:bg-[#1A1A18] hover:text-white transition-all rounded-xl"
              >
                Contact Sales
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 4. HOW IT SURFACES — Conversation ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#D4714E] mb-6 block">
              How It Works
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-12 max-w-3xl leading-tight">
              You don&apos;t pick a plan. Your deal reveals the fee.
            </h2>
          </ScrollReveal>
          <div className="max-w-[700px]">
            <ScrollReveal delay={0.16}>
              <ConversationTyping messages={CONVO_MESSAGES} />
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-lg text-[#6B6B65] leading-relaxed max-w-[620px]">
              The free analysis is complete on its own. The platform fee surfaces only when you&apos;re ready to run the deal.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 5. FOR ADVISORS ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-20">
            <div className="md:w-1/2">
              <ScrollReveal>
                <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
                  For Advisors
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <h2 className="font-headline italic text-5xl text-[#1A1A18] mb-8 leading-tight">
                  Your expertise multiplied.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="text-lg text-[#6B6B65] leading-relaxed">
                  Your clients pay their own platform fees. Your subscription covers your tools and branded outputs.
                </p>
              </ScrollReveal>
            </div>
            <div className="md:w-1/2 w-full space-y-4">
              {ADVISOR_TIERS.map((tier, i) => (
                <ScrollReveal key={tier.title} delay={0.1 + i * 0.06}>
                  <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#DCC1B9]/20">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-bold text-[#1A1A18] text-lg">{tier.title}</h3>
                      <span className="text-[#D4714E] font-bold font-mono">{tier.price}</span>
                    </div>
                    <p className="text-sm text-[#6B6B65]">{tier.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. HUMAN PROFESSIONALS ═══ */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-headline italic text-4xl md:text-5xl leading-tight text-[#1A1A18] max-w-3xl mb-8">
              When you need a human, Yulia connects you.
            </h2>
          </ScrollReveal>
          <div className="max-w-[620px] space-y-6">
            <ScrollReveal delay={0.08}>
              <p className="text-lg text-[#6B6B65] leading-relaxed">Yulia generates analysis and documents. She doesn&apos;t practice law, prepare tax returns, or hold a broker&apos;s license. When your deal needs a licensed professional — and most do — she connects you to vetted M&amp;A attorneys, transaction CPAs, SBA lenders, and business appraisers.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="text-lg text-[#1A1A18] leading-relaxed font-bold border-l-4 border-[#D4714E] pl-8 italic">
                The platform handles the intelligence and the process. The professionals handle judgment, negotiation, and fiduciary responsibility. That&apos;s not a limitation. That&apos;s how deals should work.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-[#6B6B65] mb-6 block">
              Questions
            </span>
          </ScrollReveal>
          <div className="max-w-[620px] space-y-0">
            {FAQS.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="py-8 border-t border-[#DCC1B9]/30 first:border-t-0">
                  <h3 className="font-bold text-[#1A1A18] text-lg mb-3">{faq.q}</h3>
                  <p className="text-[#6B6B65] leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. DARK CTA ═══ */}
      <section className="py-32 bg-[#1c1917] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4714E] rounded-full opacity-[0.15] blur-[80px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="font-display italic font-bold text-white text-[48px] md:text-[72px] mb-12">
              Start with clarity.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => onChipClick('Tell me about pricing')}
                className="bg-white text-[#0c0a09] px-10 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Start a conversation
              </button>
              <button
                onClick={() => onChipClick('I want to talk to Yulia')}
                className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Message Yulia
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
