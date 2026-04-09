import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedTimeline, TiltCard, MagneticButton, GlowingOrb } from './animations';
import { darkClasses } from './darkHelpers';
import { goToChat } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';

export default function IntegrateBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Post-Acquisition Integration | 180-Day Value Creation Plan — smbx.ai',
    description: 'Structured 180-day integration framework. Day 0 protocols, milestone tracking, employee & customer retention monitoring. AI-guided post-close execution.',
    canonical: 'https://smbx.ai/integrate',
    faqs: [
      {
        question: 'What is a post-acquisition integration plan and why does it matter?',
        answer: 'A post-acquisition integration plan is a structured 180-day framework that covers Day 0 protocols, employee retention, customer retention, and operational milestones. Without one, execution is unstructured and value is destroyed in the first 90 days.',
      },
      {
        question: 'What should happen in the first 14 days after closing an acquisition?',
        answer: 'The first 14 days focus on stabilization: meet every employee individually, contact top customers personally, shadow every role for at least 2 hours, extract tribal knowledge from the seller daily, and change nothing operationally. Your job in the Day 0 protocol is to listen and understand before making changes.',
      },
      {
        question: 'How does smbx.ai help with post-close integration?',
        answer: 'Yulia builds a personalized 180-day value creation plan from your deal financials and due diligence findings. She continuously monitors employee retention, customer retention, revenue vs. deal model projections, and covenant compliance — flagging issues before they become problems.',
      },
      {
        question: 'What are the most common post-acquisition integration mistakes?',
        answer: 'The biggest integration mistakes include changing too much too fast, cutting costs before understanding them, ignoring employee concerns, losing key customers during transition, fighting with the seller post-close, under-investing in the business, and failing to set up financial reporting on Day 1.',
      },
    ],
  });

  const mistakes = [
    {
      num: '01',
      title: 'Changing too much too fast',
      desc: 'The business works. Don\u2019t break it trying to improve it in month one.',
    },
    {
      num: '02',
      title: 'Cutting costs before understanding them',
      desc: 'That \u201Cunnecessary\u201D contractor might be the only person who knows how the HVAC system works.',
    },
    {
      num: '03',
      title: 'Ignoring employee concerns',
      desc: 'Your employees are scared. They\u2019re googling \u201Cwhat happens when a business gets sold.\u201D Address it personally, early.',
    },
    {
      num: '04',
      title: 'Losing key customers',
      desc: 'Your competitors know there\u2019s a transition. They\u2019re calling your customers this week.',
    },
    {
      num: '05',
      title: 'Fighting with the seller',
      desc: 'The seller knows things you don\u2019t. Treat them well even when the earnout creates tension.',
    },
    {
      num: '06',
      title: 'Under-investing in the business',
      desc: 'The worst buyers squeeze margins immediately. The best invest in growth and reap returns in Years 2\u20135.',
    },
  ];

  const monitorItems = [
    { icon: 'trending_up', title: 'Revenue vs. deal model', desc: 'Are you hitting the projections that justified the price?' },
    { icon: 'group', title: 'Customer retention', desc: 'Have you lost any of the top 20 customers since close?' },
    { icon: 'badge', title: 'Employee retention', desc: 'Are key employees staying through transition?' },
    { icon: 'account_balance_wallet', title: 'Cash flow vs. debt service', desc: 'Is the business generating enough to service acquisition debt?' },
    { icon: 'checklist', title: 'Integration milestones', desc: 'Are Day 30/60/90 objectives on track?' },
    { icon: 'handshake', title: 'Seller transition', desc: 'Is knowledge transfer happening on schedule?' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO + 7 MISTAKES ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Integrate</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Post-Acquisition</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <div className="mb-8">
              <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-4xl">
                The 7 mistakes that destroy post-acquisition value.
              </h1>
              <p className={`text-xl editorial max-w-2xl ${dc.muted}`}>
                The deal closed. The wire hit. Now what? Most buyers wing it. They change too much too fast, cut costs before understanding them, and lose their best employees in month one. Here's the playbook that prevents all of it.
              </p>
            </div>
          </ScrollReveal>

          {/* 7 Mistakes — dark panel */}
          <ScrollReveal delay={0.2}>
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dc.darkPanel}`}>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {mistakes.map((mistake) => (
                  <StaggerItem key={mistake.num}>
                    <div className="border-t border-white/15 pt-6 h-full">
                      <span className="text-[#D44A78] font-black text-2xl mb-3 block">{mistake.num}</span>
                      <h4 className="font-bold mb-2">{mistake.title}</h4>
                      <p className="text-sm text-[#dadadc]/70">{mistake.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Mistake #7 — full-width accent card */}
              <TiltCard>
                <div className="bg-[#D44A78] rounded-2xl p-8 text-white">
                  <span className="font-black text-2xl mb-3 block">07</span>
                  <h4 className="font-bold text-lg mb-2">No financial reporting on Day 1</h4>
                  <p className="text-sm text-white/80">
                    If you can't measure it, you can't manage it. Monthly P&L, weekly cash flow, daily revenue — set up before you change a single thing.
                  </p>
                </div>
              </TiltCard>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. 180-DAY FRAMEWORK — AnimatedTimeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">The Framework</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Four phases. 180 days. Every milestone tracked.</h2>
            </div>
          </ScrollReveal>
          <AnimatedTimeline>
            {/* Phase 1: Stabilize */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <ScrollReveal>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all ${dc.card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#D44A78] font-bold text-xs uppercase tracking-widest">Phase 01</span>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 0-14</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Stabilize</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Meet every employee individually. Call your top 10 customers. Shadow every role. Extract everything the seller knows. Change nothing.
                  </p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-[#f3f3f6]'}`}>
                    <div className="h-full bg-[#D44A78] rounded-full transition-all duration-700" style={{ width: '25%' }} />
                  </div>
                  <p className={`text-xs mt-2 ${dc.muted}`}>25% complete</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Phase 2: Quick Wins */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <ScrollReveal delay={0.1}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all ${dc.card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#D44A78] font-bold text-xs uppercase tracking-widest">Phase 02</span>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 15-30</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Quick Wins</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Raise prices where the market supports it. Set up financial reporting. Document the processes that only exist in the seller's head.
                  </p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-[#f3f3f6]'}`}>
                    <div className="h-full bg-[#D44A78] rounded-full transition-all duration-700" style={{ width: '50%' }} />
                  </div>
                  <p className={`text-xs mt-2 ${dc.muted}`}>50% complete</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Phase 3: Strengthen */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <ScrollReveal delay={0.2}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all ${dc.card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#D44A78] font-bold text-xs uppercase tracking-widest">Phase 03</span>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 30-90</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Strengthen</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Hire for critical gaps. Implement the technology the business should have had. Complete seller transition.
                  </p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-[#f3f3f6]'}`}>
                    <div className="h-full bg-[#D44A78] rounded-full transition-all duration-700" style={{ width: '75%' }} />
                  </div>
                  <p className={`text-xs mt-2 ${dc.muted}`}>75% complete</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Phase 4: Accelerate */}
            <div className="pl-10 pb-8 relative">
              <div className="absolute left-0 top-0 w-[10px] h-[10px] rounded-full bg-[#D44A78]" />
              <ScrollReveal delay={0.3}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all ${dc.card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#D44A78] font-bold text-xs uppercase tracking-widest">Phase 04</span>
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 90-180</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Accelerate</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Launch growth initiatives. Establish KPI dashboard. Evaluate add-on acquisitions.
                  </p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-[#f3f3f6]'}`}>
                    <div className="h-full bg-[#D44A78] rounded-full transition-all duration-700" style={{ width: '100%' }} />
                  </div>
                  <p className={`text-xs mt-2 ${dc.muted}`}>100% complete</p>
                </div>
              </ScrollReveal>
            </div>
          </AnimatedTimeline>
        </section>

        {/* ═══ 3. WHAT YULIA MONITORS — 2x3 card grid ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Live Monitoring</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">What Yulia watches so you don't have to.</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitorItems.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className={`rounded-2xl p-8 h-full hover:shadow-lg transition-all ${dc.card}`}>
                  <span className="material-symbols-outlined text-[#D44A78] text-2xl mb-4 block">{item.icon}</span>
                  <h4 className="font-bold text-base mb-2">{item.title}</h4>
                  <p className={`text-sm leading-relaxed ${dc.muted}`}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ 4. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-white relative overflow-hidden ${dc.darkPanel}`}>
              <GlowingOrb top="-80px" right="-60px" />
              <GlowingOrb bottom="-100px" right="30%" delay={2} size={240} />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Get Started</span>
                  <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-6">
                    Just closed? Tell Yulia about the deal.
                  </h2>
                  <p className="text-lg text-[#dadadc]/70">
                    She'll build your 180-day plan from what due diligence actually revealed. Not a template — your plan.
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <MagneticButton
                    onClick={goToChat}
                    className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer"
                  >
                    Build Your Integration Plan
                  </MagneticButton>
                  <p className="text-xs text-[#dadadc]/70">Free analysis -- No account required -- Your data stays yours</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
