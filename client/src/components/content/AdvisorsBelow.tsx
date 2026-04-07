import { ScrollReveal, StaggerContainer, StaggerItem, MagneticButton, GlowingOrb } from './animations';
import { darkClasses } from './darkHelpers';
import { goToChat } from './chatBridge';
import { AdvisorROICalc } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function AdvisorsBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'For M&A Advisors & Business Brokers | AI Deal Intelligence — smbx.ai',
    description: 'Your back office, on demand. CIM in 2 hours. Valuation in 5 minutes. Manage 15-20 deals simultaneously. White-label AI deal intelligence for brokers, M&A advisors, CPAs, and attorneys.',
    canonical: 'https://smbx.ai/advisors',
    faqs: [
      { question: 'Will my clients know I\'m using AI?', answer: 'Only if you tell them. Every document carries your branding. White-label on Enterprise. Your clients see your work product.' },
      { question: 'Is client data secure?', answer: 'Every client engagement is siloed. No cross-client data access. No model training on client data. Encrypted at rest and in transit. Full fiduciary compliance.' },
      { question: 'How fast can I generate a CIM?', answer: 'About 2 hours from client financials to deal-ready document. The same CIM that takes most practices 40 hours.' },
    ],
  });

  const handleCTA = goToChat;

  const timeStats = [
    { icon: 'description', label: 'CIM generation', before: '40 hrs', after: '2 hrs' },
    { icon: 'analytics', label: 'Business valuation', before: '1 week', after: '5 min' },
    { icon: 'folder_managed', label: 'Deals managed simultaneously', before: '3-5', after: '15-20' },
    { icon: 'groups', label: 'Buyer outreach list', before: '1 month', after: '1 day' },
  ];

  const advisorTypes = [
    { icon: 'storefront', title: 'Business brokers', desc: 'CIM in 2 hours. Valuation at your first meeting. Buyer list scored before you start outreach.' },
    { icon: 'account_balance', title: 'M&A advisors', desc: 'Deal materials for every engagement. DD coordination across simultaneous transactions.' },
    { icon: 'calculate', title: 'CPAs', desc: 'When your client asks "what\'s my business worth?" — answer in the same meeting.' },
    { icon: 'gavel', title: 'Attorneys', desc: 'Financial context for every deal you advise on. Working capital analysis before closing surprises.' },
    { icon: 'real_estate_agent', title: 'Wealth managers', desc: 'When a client\'s biggest asset is their business, you need deal intelligence, not just financial planning.' },
    { icon: 'search', title: 'Search fund advisors', desc: 'Help your searchers find, evaluate, and close faster.' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — TIME SAVINGS ═══ */}
        <section className="mb-28">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Advisors</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Brokers & Professionals</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-3xl">
              Your back office.<br /><span className="text-[#D44A78]">On demand.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-14 ${dc.muted}`}>
              The CIM that takes 40 hours? Done in 2. The valuation that takes a week? 5 minutes. The pipeline that caps at 3-5 deals? Scales to 15-20. Same quality. Your brand. Your clients never know.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {timeStats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={0.25 + i * 0.08}>
                <div className={`${dc.card} rounded-2xl p-6 flex items-center gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-[#D44A78]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#D44A78] text-2xl">{stat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium mb-1 ${dc.muted}`}>{stat.label}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black line-through decoration-2 opacity-40 ${dc.emphasis}`}>{stat.before}</span>
                      <span className="material-symbols-outlined text-[#D44A78] text-lg">arrow_forward</span>
                      <span className="text-2xl font-black text-[#D44A78]">{stat.after}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ 2. ROI CALCULATOR ═══ */}
        <section className="mb-28">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Your ROI</span>
            <h2 className="font-headline text-4xl font-black tracking-tight mb-4 max-w-2xl">What 3-4x deal volume looks like for your practice.</h2>
            <p className={`text-lg leading-relaxed max-w-2xl mb-10 ${dc.muted}`}>
              The bottleneck in your practice is analytical capacity. Remove it and your deal volume scales with your relationship capacity — which is the part you're actually good at.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <AdvisorROICalc dark={dark} />
          </ScrollReveal>
        </section>

        {/* ═══ 3. HOW IT WORKS — BEFORE / AFTER ═══ */}
        <ScrollReveal>
          <section className="mb-28">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">How It Works</span>
              <h2 className="font-headline text-4xl font-black tracking-tight">80% on relationships instead of 80% on spreadsheets.</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Before */}
              <div className={`${dc.subtleBg} rounded-2xl p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-[#dadadc]/10' : 'bg-[#5d5e61]/10'}`}>
                    <span className={`material-symbols-outlined ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>schedule</span>
                  </div>
                  <h3 className="font-bold text-lg">Before Yulia</h3>
                </div>
                <div className={`space-y-4 text-sm ${dc.muted}`}>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">20%</span><p>Relationships</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">40%</span><p>Analysis</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">25%</span><p>DD coordination</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">15%</span><p>Admin</p></div>
                </div>
                <div className={`mt-6 pt-4 border-t ${dark ? 'border-zinc-800' : 'border-[#eeeef0]'}`}>
                  <p className={`text-sm font-bold ${dc.muted}`}>3-5 active deals. 80% on analysis.</p>
                </div>
              </div>

              {/* After */}
              <div className={`${dark ? 'bg-[#2f3133]' : 'bg-white'} rounded-2xl border-2 border-[#D44A78] p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#D44A78]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#D44A78]">bolt</span>
                  </div>
                  <h3 className="font-bold text-lg">With Yulia</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">60%</span><p className={`font-medium ${dc.emphasis}`}>Relationships</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">15%</span><p className={dc.muted}>Review</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">15%</span><p className={dc.muted}>DD oversight</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">10%</span><p className={dc.muted}>Communications</p></div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D44A78]/20">
                  <p className="text-sm font-bold text-[#D44A78]">15-20 active deals. 80% on relationships.</p>
                </div>
              </div>
            </div>

            {/* White-label callout */}
            <div className={`rounded-2xl p-6 flex items-start gap-4 ${dark ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <span className={`material-symbols-outlined text-2xl shrink-0 mt-0.5 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>visibility_off</span>
              <div>
                <p className={`font-bold text-sm mb-1 ${dc.emphasis}`}>White-label on Enterprise.</p>
                <p className={`text-sm ${dc.muted}`}>Every document carries your brand. Client data is siloed. Full fiduciary compliance.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. WHO USES THIS ═══ */}
        <ScrollReveal>
          <section className="mb-28">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Who Uses This</span>
              <h2 className="font-headline text-4xl font-black tracking-tight">Every type of deal professional.</h2>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisorTypes.map((a) => (
                <StaggerItem key={a.title}>
                  <div className={`${dc.card} rounded-2xl p-8 hover:shadow-lg transition-all h-full`}>
                    <span className="material-symbols-outlined text-[#D44A78] text-2xl mb-3">{a.icon}</span>
                    <h3 className="font-bold mb-2">{a.title}</h3>
                    <p className={`text-sm ${dc.muted}`}>{a.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </ScrollReveal>

        {/* ═══ 5. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`${dc.darkPanel} rounded-3xl p-12 md:p-16 text-white relative overflow-hidden`}>
              <GlowingOrb top="-20%" right="-10%" size={400} color="rgba(212,74,120,0.15)" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] mb-6">
                  Try Professional<br /><span className="text-[#D44A78]">free for 30 days.</span>
                </h2>
                <p className="text-lg text-[#dadadc]/70 mb-10">
                  Run a real client engagement before you decide. Generate a CIM. Build a valuation. See how the pipeline changes.
                </p>
                <MagneticButton
                  onClick={handleCTA}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Start Free Trial
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/50 mt-4">30 days. Full access. No credit card.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
