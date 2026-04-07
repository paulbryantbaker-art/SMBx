import { ScrollReveal, StaggerContainer, StaggerItem, MagneticButton } from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';

export default function PricingBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Pricing | This Used to Cost $500,000 — smbx.ai',
    description: 'The analytical work investment banks charge six figures for — valuation, deal materials, financial modeling, negotiation prep — is now $149/month. Start free.',
    canonical: 'https://smbx.ai/pricing',
    faqs: [
      { question: 'Why is smbx.ai so much cheaper than an investment bank?', answer: 'AI does what used to take an analyst team 400 hours. The math is the same. The labor cost isn\'t. You get the same analytical coverage — valuation, CIM, financial models, negotiation prep — for $149/month instead of $150K-$500K.' },
      { question: 'What\'s the catch with smbx.ai pricing?', answer: 'You run the conversations yourself. Yulia prepares everything — the analysis, the documents, the counter-offers. But the client meeting, the handshake, the judgment call? That\'s yours. We handle the 80% that\'s analytical work. You handle the 20% that requires a human.' },
      { question: 'What if my deal doesn\'t close?', answer: 'Cancel anytime. No success fees. No close fees. Everything Yulia produced is yours to keep — valuations, documents, analysis — regardless of outcome.' },
      { question: 'How is smbx.ai different from ChatGPT?', answer: 'ChatGPT generates plausible text. Yulia runs 6 specialized engines with deterministic math, live market data, and a 22-gate methodology. The difference: Yulia\'s valuations survive buyer scrutiny. Financial data is never estimated — it\'s extracted from your documents and calculated with the same formulas a QoE firm uses.' },
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

        {/* ═══ 1. HERO — The dissonance hook ═══ */}
        <section className="mb-24 max-w-4xl">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">Pricing</span>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8">
              This used to cost<br /><span className="text-[#D44A78]">$500,000.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className={`space-y-4 text-xl leading-relaxed max-w-2xl ${muted}`}>
              <p>The analytical work that investment banks charge six figures for — valuation, deal materials, financial modeling, negotiation prep — is now $149/month.</p>
              <p>Same rigor. Same math. You run the conversations.</p>
              <p>Start free. No credit card. No success fees. Cancel anytime.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. TIER CARDS — Outcome-based bullets ═══ */}
        <section className="mb-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full ${card}`}>
                <h3 className="font-black text-lg mb-1">Free</h3>
                <p className="text-4xl font-black mb-1">$0</p>
                <p className={`text-xs mb-6 ${muted}`}>Forever · Email required</p>
                <div className="space-y-3 flex-1">
                  {[
                    'Talk to Yulia about any deal — unlimited, forever',
                    'Get a preliminary valuation range with real market data',
                    'See your 7-factor readiness score — what\'s strong, what to fix',
                    'One full deliverable included — keep it even if you never pay',
                  ].map((f) => (
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
                  {[
                    'Upload your P&L — Yulia finds every add-back your CPA missed',
                    'SDE and EBITDA normalized to what a buyer would actually underwrite',
                    'Deal scoring for buyers — pursue or pass in 60 seconds',
                    'SBA eligibility modeled before you write the LOI',
                    'Market intelligence with live sector data',
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#006630] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm ${muted}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className={`mt-8 w-full py-3 border-2 rounded-full font-bold text-sm transition-all cursor-pointer ${dark ? 'border-white text-white hover:bg-white hover:text-[#0f1012]' : 'border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Start for $49</button>
              </div>
            </StaggerItem>
            {/* Professional — VISUALLY DOMINANT */}
            <StaggerItem>
              <div className={`rounded-2xl border-2 border-[#D44A78] p-8 flex flex-col h-full relative shadow-lg ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D44A78] text-white text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                <h3 className="font-black text-lg mb-1">Professional</h3>
                <p className="text-4xl font-black text-[#D44A78] mb-1">$149<span className={`text-lg font-medium ${muted}`}>/mo</span></p>
                <p className={`text-xs mb-6 ${muted}`}>Full deal execution · 30-day free trial</p>
                <div className="space-y-3 flex-1">
                  {[
                    'CIM generated from your verified financials — 25-40 pages, not a template',
                    'Buyers identified and scored by fit, not just listed',
                    'Every counter-offer drafted with comparable deal data',
                    'Due diligence coordinated — 50-100 items tracked to completion',
                    'LOI terms modeled for after-tax impact before you send',
                    '180-day post-close integration plan from actual DD findings',
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className={`text-sm font-medium ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA()} className="mt-8 w-full py-3 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer">Try free for 30 days</button>
              </div>
            </StaggerItem>
            {/* Enterprise */}
            <StaggerItem>
              <div className={`rounded-2xl p-8 flex flex-col h-full text-white ${darkPanel}`}>
                <h3 className="font-black text-lg mb-1">Enterprise</h3>
                <p className="text-4xl font-black mb-1">$999<span className="text-lg font-medium text-[#dadadc]/70">/mo</span></p>
                <p className="text-xs text-[#dadadc]/60 mb-6">For teams & practices</p>
                <div className="space-y-3 flex-1">
                  {[
                    'Everything in Professional for your entire team',
                    'White-label output — your brand, your docs, your letterhead',
                    'API access for pipeline integration',
                    'Priority support and dedicated onboarding',
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0 mt-0.5">check_circle</span>
                      <p className="text-sm text-[#dadadc]/90">{f}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleCTA('enterprise')} className="mt-8 w-full py-3 border-2 border-white/30 rounded-full font-bold text-sm hover:bg-white hover:text-[#1a1c1e] transition-all text-white cursor-pointer bg-transparent">Talk to Yulia about your team</button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 3. WHAT PROFESSIONAL INCLUDES — Outcome-focused detail ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${darkPanel}`}>
              <div className="mb-12">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">What You Get</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">$149/month. First conversation to 180 days after close.</h2>
                <p className="text-lg text-[#dadadc]/70 max-w-2xl">Most deals take 6–18 months. Total cost: $894–$2,682. For analytical coverage that would otherwise require a dedicated analyst team.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'description', title: 'Deal documents', desc: 'CIM, pitch deck, LOI, deal memos. Generated from your numbers. Not a template fill.' },
                  { icon: 'speed', title: 'Valuation', desc: 'Three methodologies, math shown, comparables sourced. Built to survive a buyer\'s QoE review.' },
                  { icon: 'calculate', title: 'Financial modeling', desc: 'SBA, DSCR, DCF, sensitivity. Deterministic engines — the calculator is never wrong.' },
                  { icon: 'gavel', title: 'Negotiation prep', desc: 'Comparable deal data for every counter-offer. Working capital analysis. Every communication drafted.' },
                  { icon: 'fact_check', title: 'DD coordination', desc: '50–100 items tracked. Multi-party coordination. Deadline alerts. Nothing falls through.' },
                  { icon: 'merge', title: '180-day integration', desc: '180-day plan from actual DD findings. Milestone tracking against your deal model.' },
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

        {/* ═══ 4. FAQ — Disruptor questions ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-12">Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { q: 'Why is this so cheap?', a: 'AI does what used to take an analyst team 400 hours. The math is the same. The labor cost isn\'t. You get the same analytical coverage — valuation, CIM, financial models, negotiation prep — for $149/month instead of $150K–$500K.' },
              { q: 'What\'s the catch?', a: 'You run the conversations yourself. Yulia prepares everything — the analysis, the documents, the counter-offers. But the client meeting, the handshake, the judgment call? That\'s yours. We handle the 80% that\'s analytical work.' },
              { q: 'What if my deal doesn\'t close?', a: 'Cancel anytime. No success fees. No close fees. Everything Yulia produced is yours to keep — valuations, documents, analysis — regardless of outcome.' },
              { q: 'I\'m a broker. Is this for me?', a: 'Absolutely. Professional for solo practitioners. Enterprise for teams with white-label output. Your clients see your work. Yulia is the engine behind the scenes. Most advisors use it to 3-4x their deal volume.' },
              { q: 'How is this different from ChatGPT?', a: 'ChatGPT generates plausible text. Yulia runs 6 specialized engines with deterministic math, live market data, and a 22-gate methodology. Financial data is never estimated — it\'s extracted from your documents and calculated with the same formulas a QoE firm uses.' },
              { q: 'Can I start free?', a: 'Yes. Talk to Yulia. Get a valuation range, a readiness score, and a full deliverable — before you pay a dollar. Keep everything even if you never upgrade.' },
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

        {/* ═══ 5. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-center text-white ${darkPanel}`}>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-4">
                Start with a <span className="text-[#D44A78]">conversation.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                If Yulia doesn't find something you missed, don't pay us a dollar.
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
