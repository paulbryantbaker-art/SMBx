import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedTimeline, TiltCard, BeforeAfterSlider, MagneticButton, GlowingOrb, AnimatedCounter } from './animations';
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
        answer: 'A post-acquisition integration plan is a structured 180-day framework that covers Day 0 protocols, employee retention, customer retention, and operational milestones. Without one, 70% of acquisitions fail to deliver projected returns because execution is unstructured.',
      },
      {
        question: 'What should happen in the first 14 days after closing an acquisition?',
        answer: 'The first 14 days focus on stabilization: meet every employee individually, contact top customers personally, shadow every role, extract tribal knowledge from the seller, and change nothing operationally. Your job in the Day 0 protocol is to listen and understand before making changes.',
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

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — Full-width centered ═══ */}
        <section className="mb-24 text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Integrate</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Post-Acquisition</span>
            </div>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <div className="mb-6">
              <AnimatedCounter
                value={70}
                suffix="%"
                className="font-headline font-black text-7xl md:text-8xl tracking-tighter text-[#D44A78]"
              />
              <span className="font-headline font-black text-7xl md:text-8xl tracking-tighter"> of acquisitions fail.</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className={`space-y-6 text-xl editorial ${dc.muted}`}>
              <p>
                Not because the thesis was wrong. Because post-acquisition integration was unstructured. No Day 0 protocol. No 180-day plan. No tracking against the deal model's projections. The value creation plan existed on a whiteboard that got erased after closing dinner.
              </p>
              <p className={`font-bold border-l-4 border-[#D44A78] pl-6 text-2xl italic text-left ${dc.emphasis}`}>
                Yulia builds your post-close framework from what due diligence actually revealed — not a template. Your plan, your numbers, your milestones.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. THE 180-DAY FRAMEWORK — AnimatedTimeline ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">The Framework</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Four phases. 180 days. Every milestone tracked.</h2>
              <p className={`text-lg max-w-2xl ${dc.muted}`}>
                A structured value creation plan that turns the first 180 days from chaos into a repeatable post-close framework.
              </p>
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
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 0–14</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Stabilize</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    The Day 0 protocol is non-negotiable. Meet every employee individually. Contact top 10 customers personally. Shadow every role for at least 2 hours. Extract tribal knowledge from the seller daily. Change nothing on Day 1 — your job is to listen, not fix. Employee retention starts with how you show up in Week 1.
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
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 15–30</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Quick Wins</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Raise prices where the market supports it. Fire bad customers. Fix the website. Set up financial reporting — monthly P&L, weekly cash flow, daily revenue dashboard. Document the 5 processes that exist only in the seller's head. These quick wins fund the rest of the 180-day plan.
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
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 30–90</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Strengthen</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Hire for critical gaps identified in the first 30 days. Implement technology the business should have had — CRM, scheduling, modern accounting. Build the 12-month operating plan. Complete seller transition. Renegotiate vendor contracts. This is where post-acquisition integration moves from stabilization to building.
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
                    <span className="text-[10px] bg-[#D44A78]/10 text-[#D44A78] px-2 py-1 rounded font-bold">Day 90–180</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">Accelerate</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dc.muted}`}>
                    Launch growth initiatives — new service offerings, marketing channels, customer segments. Establish KPI dashboard and weekly management meeting cadence. Evaluate add-on acquisition opportunities. The business runs on your systems now, not the seller's memory. The value creation plan shifts from defense to offense.
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

        {/* ═══ 3. LIVE MONITORING — BeforeAfterSlider ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Live Monitoring</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Every metric that matters. Flagged before it becomes a problem.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                When a metric deviates from plan, Yulia doesn't wait for you to notice. She flags it, explains the impact, and suggests corrective actions — all before your next lender covenant check. Continuous monitoring replaces the monthly spreadsheet review that catches problems too late.
              </p>
              <div className="space-y-4">
                {[
                  { icon: 'trending_up', label: 'Revenue vs. deal model projections' },
                  { icon: 'group', label: 'Customer retention and churn tracking' },
                  { icon: 'badge', label: 'Employee retention and flight-risk alerts' },
                  { icon: 'hub', label: 'Vendor relationship health' },
                  { icon: 'account_balance_wallet', label: 'Cash flow vs. debt service coverage' },
                  { icon: 'checklist', label: 'Integration milestone completion' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#D44A78] text-lg shrink-0">{metric.icon}</span>
                    <span className={`text-sm ${dc.muted}`}>{metric.label}</span>
                  </div>
                ))}
              </div>
              <div className={`rounded-2xl p-6 mt-8 ${dark ? 'bg-[#D44A78]/10 border border-[#D44A78]/20' : 'bg-[#D44A78]/5 border border-[#D44A78]/15'}`}>
                <p className={`text-sm ${dc.muted}`}>
                  <span className={`font-bold ${dc.emphasis}`}>Proactive, not reactive.</span> Traditional integration consulting checks in monthly. Yulia monitors your post-close framework continuously and only interrupts when something needs attention.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <BeforeAfterSlider
                beforeLabel="Manual monthly check-ins"
                afterLabel="Continuous AI monitoring"
                beforeContent={
                  <div>
                    <p className="font-bold text-base mb-5 text-[#1a1c1e]">The old way</p>
                    <div className="space-y-4">
                      {[
                        { icon: 'schedule', text: 'Monthly reports arrive 3 weeks late' },
                        { icon: 'visibility_off', text: 'Missed metrics until board meeting' },
                        { icon: 'warning', text: 'Surprise covenant breach at quarter-end' },
                        { icon: 'trending_down', text: 'Customer churn discovered months later' },
                        { icon: 'person_off', text: 'Key employee quits without warning' },
                        { icon: 'error', text: 'Integration stalls with no accountability' },
                      ].map((item) => (
                        <div key={item.text} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#EA4335] text-base shrink-0 mt-0.5">{item.icon}</span>
                          <p className="text-sm text-[#5d5e61]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                afterContent={
                  <div>
                    <p className="font-bold text-base mb-5 text-[#1a1c1e]">With Yulia</p>
                    <div className="space-y-4">
                      {[
                        { icon: 'bolt', text: 'Real-time alerts on metric deviations' },
                        { icon: 'auto_graph', text: 'Automated tracking against deal model' },
                        { icon: 'shield', text: 'Proactive covenant compliance warnings' },
                        { icon: 'group_add', text: 'Customer sentiment monitored weekly' },
                        { icon: 'person_check', text: 'Employee engagement risk scoring' },
                        { icon: 'task_alt', text: 'Milestone accountability with deadlines' },
                      ].map((item) => (
                        <div key={item.text} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#34A853] text-base shrink-0 mt-0.5">{item.icon}</span>
                          <p className="text-sm text-[#1a1c1e]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 4. THE 7 MISTAKES — Dark panel ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dc.darkPanel}`}>
              <div className="mb-12">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Avoid These</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">The 7 integration mistakes that destroy post-acquisition value.</h2>
                <p className="text-[#dadadc]/70 max-w-2xl">
                  Every one of these is preventable with a structured post-close framework. Most buyers learn them the expensive way.
                </p>
              </div>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    num: '01',
                    title: 'Changing too much too fast',
                    desc: 'The business works. Don\u2019t break it trying to improve it in the first month. Understand the engine before you rebuild it. The Day 0 protocol exists to prevent this exact mistake.',
                  },
                  {
                    num: '02',
                    title: 'Cutting costs before understanding them',
                    desc: 'Every expense exists for a reason. That \u201Cunnecessary\u201D contractor might be the only person who knows how the HVAC system works. Understand before cutting.',
                  },
                  {
                    num: '03',
                    title: 'Ignoring employee concerns',
                    desc: 'Your employees are scared. They\u2019re googling \u201Cwhat happens when a business gets sold.\u201D Address their fears explicitly, early, and personally. Employee retention is earned in Week 1.',
                  },
                  {
                    num: '04',
                    title: 'Losing key customers during transition',
                    desc: 'Personal outreach to your top customers in Week 1 is non-negotiable. Your competitors know there\u2019s a transition happening. They\u2019re calling your customers. Customer retention requires proactive defense.',
                  },
                  {
                    num: '05',
                    title: 'Fighting with the seller post-close',
                    desc: 'The seller knows things you don\u2019t \u2014 where the bodies are buried, which customers are difficult, which employees are the real MVPs. Treat them well even when the earnout creates tension.',
                  },
                  {
                    num: '06',
                    title: 'Under-investing in the business',
                    desc: 'The worst buyers squeeze margins immediately. The best buyers invest in growth and reap returns in Years 2\u20135. Your acquisition thesis promised growth \u2014 fund it. A value creation plan without capital is just a wish list.',
                  },
                ].map((mistake) => (
                  <StaggerItem key={mistake.num}>
                    <div className="border-t border-white/15 pt-6 h-full">
                      <span className="text-[#D44A78] font-black text-2xl mb-3 block">{mistake.num}</span>
                      <h4 className="font-bold mb-2">{mistake.title}</h4>
                      <p className="text-sm text-[#dadadc]/70">{mistake.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <TiltCard>
                <div className="bg-[#D44A78] rounded-2xl p-8">
                  <span className="text-white font-black text-2xl mb-3 block">07</span>
                  <h4 className="font-bold text-lg mb-2">No financial reporting on Day 1</h4>
                  <p className="text-sm text-white/80">
                    If you can't measure it, you can't manage it. Monthly P&L, weekly cash flow, daily revenue — set up on Day 1 before you change a single thing about the operation. This is the foundation of every successful 180-day plan.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-white/80 italic">
                      Yulia's post-acquisition integration plan is built to prevent every one of these. Not because she's read about them — because they're encoded in the methodology.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. CTA — Journey-specific ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 text-white relative overflow-hidden ${dc.darkPanel}`}>
              <GlowingOrb top="-80px" right="-60px" />
              <GlowingOrb bottom="-100px" right="30%" delay={2} size={240} />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Get Started</span>
                  <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-6">
                    Build Your<br />
                    <span className="text-[#D44A78]">Integration Plan.</span>
                  </h2>
                  <p className="text-lg text-[#dadadc]/70">
                    Just closed? Tell Yulia about the deal and she'll build your 180-day value creation plan — from the financials and risks that due diligence actually revealed. Your post-close framework starts with a conversation.
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
