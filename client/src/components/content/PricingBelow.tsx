import { ScrollReveal, StaggerContainer, StaggerItem, TiltCard, MagneticButton } from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';

export default function PricingBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Pricing | AI Deal Intelligence from $0 — smbx.ai',
    description: 'The analytical engine behind every deal. IB-grade coverage for $149/month. Free to start. No per-deal fees. Loved by owners, buyers, brokers, and advisors.',
    canonical: 'https://smbx.ai/pricing',
    faqs: [
      { question: 'How long do most deals take?', answer: 'Seller exits: 6–18 months. Buyer acquisitions: 6–12 months. Capital raises: 3–6 months. Your subscription continues through close and 180 days of post-close support.' },
      { question: 'What if my deal doesn\'t close?', answer: 'Cancel anytime. No success fees. No close fees. Ever. The work Yulia produced is yours to keep — valuations, documents, analysis — regardless of outcome.' },
      { question: 'Can I start free and upgrade later?', answer: 'Yes. Start with a conversation. Yulia delivers real analysis for free. When you\'re ready for the full journey — CIM, financial models, negotiation support — upgrade to the plan that fits.' },
      { question: 'How does this compare to ChatGPT?', answer: 'ChatGPT generates plausible text. smbx.ai runs 6 specialized engines with live market data, deterministic financial calculations, a 22-gate methodology, and 35 industries of deep intelligence. The difference is defensibility.' },
    ],
  });

  const handleCTA = (plan?: string) => {
    if (plan === 'enterprise') {
      bridgeToYulia("I'm interested in the Enterprise plan for my team.");
    } else {
      goToChat();
    }
  };

  const muted = dc.muted;
  const card = dc.card;
  const darkPanel = dc.darkPanel;

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — Value-first, not comparison-first ═══ */}
        <section className="mb-24 max-w-4xl">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">Pricing</span>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8">
              The analytical engine<br />behind every <span className="text-[#D44A78]">deal.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-6 ${muted}`}>
              The same analytical rigor that investment banks bring to $50M transactions — applied to yours. Your advisors, brokers, and attorneys still handle what requires a license and a relationship. Yulia handles the 80% that's analytical work.
            </p>
            <p className={`text-xl leading-relaxed max-w-2xl ${muted}`}>
              Start free. No per-deal fees. No success fees. Cancel anytime.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. WHO THIS IS FOR — Everyone sees themselves ═══ */}
        <section className="mb-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'person',
                title: 'Business Owners',
                desc: 'Buying, selling, or raising capital? Get institutional-grade analysis for every decision — valuation, deal structure, negotiation prep, and closing coordination.',
                tag: 'Free → Professional',
              },
              {
                icon: 'groups',
                title: 'Deal Professionals',
                desc: 'Brokers, advisors, CPAs, and attorneys: generate CIMs in hours, screen deals in minutes, manage 3–4x your current pipeline. White-label everything. Your clients see your work.',
                tag: 'Professional → Enterprise',
              },
              {
                icon: 'corporate_fare',
                title: 'Firms & Teams',
                desc: 'PE platforms, family offices, and search funds: portfolio-level deal flow management, multi-seat access, API integration, and the analytical depth your deal cadence demands.',
                tag: 'Enterprise',
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <TiltCard className="h-full">
                  <div className={`rounded-2xl p-8 h-full ${card}`}>
                    <span className="material-symbols-outlined text-[#D44A78] text-3xl mb-4">{item.icon}</span>
                    <h3 className="font-headline font-bold text-xl mb-3">{item.title}</h3>
                    <p className={`text-sm mb-4 ${muted}`}>{item.desc}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]/60'}`}>{item.tag}</span>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 3. TIER CARDS ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Simple pricing. One subscription covers the full journey.</h2>
              <p className={`text-lg max-w-2xl mx-auto ${muted}`}>From first conversation to 180 days after close. No per-deal fees, no success fees, no hidden charges.</p>
            </div>
          </ScrollReveal>

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
                <button onClick={() => handleCTA()} className={`mt-8 w-full py-3 border-2 rounded-full font-bold text-sm transition-all cursor-pointer ${dark ? 'border-white text-white hover:bg-white hover:text-[#0f1012]' : 'border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>See what Yulia finds</button>
              </div>
            </StaggerItem>
            {/* Starter */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full ${card}`}>
                <h3 className="font-black text-lg mb-1">Starter</h3>
                <p className="text-4xl font-black mb-1">$49<span className={`text-lg font-medium ${muted}`}>/mo</span></p>
                <p className={`text-xs mb-6 ${muted}`}>The essentials for a single deal</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Free', 'Full financial normalization', 'Add-back verification loop', 'Deal scoring (buyers)', 'SBA qualification modeling', 'Market intelligence reports'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#006630] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm ${muted}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className={`mt-8 w-full py-3 border-2 rounded-full font-bold text-sm transition-all cursor-pointer ${dark ? 'border-white text-white hover:bg-white hover:text-[#0f1012]' : 'border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Start with Starter</button>
              </div>
            </StaggerItem>
            {/* Professional */}
            <StaggerItem>
              <div className={`rounded-2xl border-2 border-[#D44A78] p-8 flex flex-col h-full relative shadow-lg ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D44A78] text-white text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                <h3 className="font-black text-lg mb-1">Professional</h3>
                <p className="text-4xl font-black text-[#D44A78] mb-1">$149<span className={`text-lg font-medium ${muted}`}>/mo</span></p>
                <p className={`text-xs mb-6 ${muted}`}>Full deal execution · 30-day free trial</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Starter', 'Institutional-quality CIM generation', 'Full financial modeling (DCF, sensitivity)', 'Buyer identification & scoring', 'Negotiation intelligence & counter-offers', 'Deal room & DD coordination', 'LOI drafting from comparable data', '180-day post-close integration'].map((f) => (
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
                <p className="text-xs text-[#dadadc]/60 mb-6">For teams & practices</p>
                <div className="space-y-3 flex-1">
                  {['Everything in Professional', 'Unlimited team seats', 'White-label output — your brand, your docs', 'API access for pipeline integration', 'Priority support & onboarding', 'Multi-deal pipeline management'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA('enterprise')} className="mt-8 w-full py-3 border-2 border-white/30 rounded-full font-bold text-sm hover:bg-white hover:text-[#1a1c1e] transition-all text-white cursor-pointer bg-transparent">Talk to Yulia about Enterprise</button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 4. WHAT PROFESSIONAL INCLUDES — Moved up from position 6 ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${darkPanel}`}>
              <div className="mb-12">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">What You Get</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">$149/month. Everything through close — plus 180 days after.</h2>
                <p className="text-lg text-[#dadadc]/70 max-w-2xl">Your subscription covers the full journey. Most deals take 6–18 months. That's $894–$2,682 total — for institutional-grade analytical coverage that would otherwise require a dedicated analyst team.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'description', title: 'Professional deal documents', desc: 'CIM, pitch deck, LOI, deal memos — generated from verified financials, adapted to the deal\'s league and complexity.' },
                  { icon: 'speed', title: 'Defensible valuation', desc: 'Multi-methodology with sourced comparables. Built to survive a buyer\'s QoE review — or strengthen your own.' },
                  { icon: 'calculate', title: 'Financial modeling', desc: 'SBA qualification, DSCR, DCF, sensitivity analysis — deterministic calculation engines, not AI estimates.' },
                  { icon: 'gavel', title: 'Negotiation intelligence', desc: 'Comparable deal data, counter-offer frameworks, working capital analysis — every communication drafted for you.' },
                  { icon: 'fact_check', title: 'DD coordination', desc: '50–100 item checklists tracked to completion. Multi-party coordination across buyers, sellers, attorneys, and lenders.' },
                  { icon: 'merge', title: '180-day integration', desc: 'Post-close value creation plan from actual DD findings. Milestone tracking against deal model projections.' },
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

        {/* ═══ 5. FOR DEAL PROFESSIONALS — Dedicated section ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">For Deal Professionals</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Your clients don't know Yulia exists. They just think you're fast.</h2>
              <p className={`leading-relaxed editorial mb-6 ${muted}`}>
                Every CIM, valuation, and deal memo Yulia generates can carry your branding, your letterhead, your firm's identity. The analytical work that takes 40 hours takes 2. The pipeline that caps at 3–5 deals scales to 15–20.
              </p>
              <p className={`leading-relaxed editorial mb-6 ${muted}`}>
                No separate "advisor pricing." You use the same platform your clients use — Professional for solo practitioners, Enterprise for teams. The difference is leverage.
              </p>
              <p className={`font-bold text-xl border-l-4 border-[#D44A78] pl-6 italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>
                You focus on relationships and judgment. Yulia handles the spreadsheets.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="space-y-4">
                {[
                  { before: '40 hrs', after: '2 hrs', label: 'CIM generation', icon: 'description' },
                  { before: '1 week', after: '5 min', label: 'Business valuation', icon: 'monitoring' },
                  { before: '3–5', after: '15–20', label: 'Deals managed simultaneously', icon: 'folder_managed' },
                  { before: '1 month', after: '1 day', label: 'Buyer outreach list', icon: 'groups' },
                ].map((row) => (
                  <div key={row.label} className={`flex items-center gap-4 p-5 rounded-2xl ${card}`}>
                    <span className="material-symbols-outlined text-[#D44A78] text-xl shrink-0">{row.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{row.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm tabular-nums line-through ${dark ? 'text-[#dadadc]/30' : 'text-[#5d5e61]/30'}`}>{row.before}</span>
                      <span className="material-symbols-outlined text-[#D44A78] text-sm">arrow_forward</span>
                      <span className="text-sm font-bold tabular-nums text-[#D44A78]">{row.after}</span>
                    </div>
                  </div>
                ))}
                <div className={`rounded-2xl p-5 flex items-start gap-4 ${dark ? 'bg-[#006630]/10 border border-[#006630]/20' : 'bg-[#006630]/5 border border-[#006630]/15'}`}>
                  <span className="material-symbols-outlined text-[#006630] text-xl shrink-0 mt-0.5">visibility_off</span>
                  <div>
                    <p className={`text-sm font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>White-label on Enterprise</p>
                    <p className={`text-xs ${muted}`}>Every document carries your brand. Client data is siloed. No cross-client access. Full fiduciary compliance.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 6. WHAT'S FREE ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Free Forever</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Start with a conversation. Keep everything Yulia finds.</h2>
              <p className={`leading-relaxed editorial mb-6 ${muted}`}>No credit card required. Yulia delivers a preliminary valuation, identifies your add-backs, and scores your readiness — before you pay a dollar. Real analysis. Yours to keep.</p>
              <p className={`font-bold text-xl border-l-4 border-[#D44A78] pl-6 italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Upgrade when the analysis has already proven itself.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'chat', title: 'Unlimited Conversation', desc: 'Talk to Yulia about your deal, industry, or market. Ask anything. Free forever.' },
                  { icon: 'monitoring', title: 'ValueLens Valuation', desc: 'Preliminary valuation range with real market context. Updated as your financials sharpen.' },
                  { icon: 'checklist', title: 'Value Readiness Report', desc: '7-factor analysis of your business\'s deal-readiness. What to fix and what each fix is worth.' },
                  { icon: 'description', title: 'Acquisition Thesis', desc: 'Buyer blueprint + SBA eligibility + capital stack template. A complete search strategy.' },
                ].map((item) => (
                  <div key={item.title} className={`rounded-2xl p-6 ${card}`}>
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

        {/* ═══ 7. THE UPGRADE FLOW ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <ScrollReveal className="lg:col-span-5">
              <div className="border-l-8 border-[#D44A78] pl-8">
                <h2 className="text-4xl font-headline font-black tracking-tight mb-6">The upgrade happens naturally.</h2>
                <p className={`text-xl ${muted}`}>No hard paywall. Yulia delivers free value, then tells you when the next step requires a plan. By then, she's already shown what she can do.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className={`rounded-3xl p-8 shadow-sm ${card}`}>
                <div className="space-y-0">
                  {[
                    { num: '1', title: 'Describe your deal', desc: 'Industry, revenue, location — plain language', free: true },
                    { num: '2', title: 'Yulia analyzes your financials', desc: 'Add-backs identified, SDE/EBITDA calculated, preliminary range', free: true },
                    { num: '3', title: 'You get real value', desc: 'ValueLens + Value Readiness Report — yours to keep', free: true },
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
                      <p className="font-bold text-[#D44A78]">Ready for the full journey?</p>
                      <p className={`text-xs ${muted}`}>Yulia tells you when the next gate requires a plan — with the analysis to prove it's worth it.</p>
                    </div>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">$49+</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-12">Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { q: 'How long do most deals take?', a: 'Seller exits: 6–18 months. Buyer acquisitions: 6–12 months. Capital raises: 3–6 months. Your subscription continues through close and 180 days of post-close support.' },
              { q: "What if my deal doesn't close?", a: "Cancel anytime. No success fees. No close fees. The work Yulia produced is yours to keep — valuations, documents, analysis — regardless of outcome." },
              { q: "I'm a broker/advisor. Which plan?", a: 'Same platform, same tiers. Solo practitioners typically use Professional ($149/mo). Firms use Enterprise ($999/mo) for team seats, white-label, and pipeline management. Try Professional free for 30 days.' },
              { q: 'Do I still need my attorney or CPA?', a: "Absolutely. smbx.ai handles the analytical work — valuations, financial models, deal documents, and coordination. Your attorney handles legal, your CPA handles tax, and your broker handles relationships. The work Yulia produces makes every professional engagement faster and more effective." },
              { q: 'How does this compare to ChatGPT?', a: 'ChatGPT generates plausible text. smbx.ai runs 6 specialized engines with live market data, deterministic financial calculations, a 22-gate methodology, and 35 industries of deep intelligence. The difference is defensibility — Yulia\'s valuations survive buyer scrutiny.' },
              { q: 'Can I start free and upgrade later?', a: "Yes. Start with a conversation. Yulia delivers real analysis for free. Upgrade when you're ready for CIM generation, financial models, negotiation support, and the full deal journey." },
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

        {/* ═══ 9. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-center text-white ${darkPanel}`}>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-4">
                Start with a <span className="text-[#D44A78]">conversation.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell Yulia about your deal. Keep everything she finds. Pay only when the analysis has already proven itself.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton onClick={() => handleCTA()} className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</MagneticButton>
                <p className="text-xs text-[#dadadc]/70">No credit card required · Cancel anytime · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
