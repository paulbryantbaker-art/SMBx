import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function IntegrateBelow({ dark }: { dark: boolean }) {

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <span className="inline-block px-3 py-1 bg-[#C4687A]/10 text-[#C4687A] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Integrate</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Post-Acquisition</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
                The first 180 days determine <span className="text-[#C4687A]">everything.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={`space-y-6 text-xl editorial max-w-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p>70% of acquisitions fail to deliver the returns that justified the price. Not because the thesis was wrong. Because the execution was unstructured. No system for Day 1. No framework for the first 90 days. No tracking against the deal model's projections.</p>
                <p className={`font-bold border-l-4 border-[#C4687A] pl-6 text-2xl italic ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Yulia builds your value creation plan from what due diligence actually revealed. Not a template. Your plan.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5 mt-4">
            <div className={`rounded-3xl p-8 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-6">Your AI integration team</p>
              <div className="space-y-4">
                {[
                  'Generates a 180-day value creation plan from your deal\u2019s financials and thesis',
                  'Tracks integration milestones with deadline management',
                  'Monitors customer retention, employee retention, key vendor relationships',
                  'Compares financial performance against the deal model\u2019s projections',
                  'Sends proactive alerts when metrics deviate from plan',
                  'Provides communication templates for employees, customers, vendors',
                  'Manages the seller transition timeline',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#C4687A] text-lg shrink-0 mt-0.5">check_circle</span>
                    <p className="text-sm text-[#dadadc]/90">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/60 italic">You run the business. Yulia makes sure nothing falls through the cracks.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. THE 180-DAY FRAMEWORK ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">The Framework</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-4">Four phases. 180 days. Every milestone tracked.</h2>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { phase: '01', time: 'Day 0–14', title: 'Stabilize', desc: 'Meet every employee individually. Contact top 10 customers personally. Shadow every role for at least 2 hours. Extract tribal knowledge from the seller daily. Change nothing on Day 1 — your job is to listen, not fix.', progress: 25 },
              { phase: '02', time: 'Day 15–30', title: 'Quick Wins', desc: "Raise prices where the market supports it. Fire bad customers. Fix the website. Set up financial reporting — monthly P&L, weekly cash flow, daily revenue dashboard. Document the 5 processes that exist only in the seller's head.", progress: 50 },
              { phase: '03', time: 'Day 30–90', title: 'Strengthen', desc: 'Hire for critical gaps identified in the first 30 days. Implement technology the business should have had — CRM, scheduling, modern accounting. Build the 12-month operating plan. Complete seller transition. Renegotiate vendor contracts.', progress: 75 },
              { phase: '04', time: 'Day 90–180', title: 'Accelerate', desc: "Launch growth initiatives — new service offerings, marketing channels, customer segments. Establish KPI dashboard and weekly management meeting cadence. Evaluate add-on acquisition opportunities. The business runs on your systems now, not the seller's memory.", progress: 100 },
            ].map((p) => (
              <StaggerItem key={p.phase}>
                <div className={`rounded-2xl p-8 hover:shadow-lg transition-all ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#C4687A] font-bold text-xs uppercase tracking-widest">Phase {p.phase}</span>
                    <span className="text-[10px] bg-[#C4687A]/10 text-[#C4687A] px-2 py-1 rounded font-bold">{p.time}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-black mb-3">{p.title}</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{p.desc}</p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-[#f3f3f6]'}`}>
                    <div className="h-full bg-[#C4687A] rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 3. WHAT YULIA TRACKS ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Live Monitoring</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-8">Every metric that matters. Flagged before it becomes a problem.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>When a metric deviates from plan, Yulia doesn't wait for you to notice. She flags it, explains the impact, and suggests corrective actions — all before your next lender covenant check.</p>
              <div className={`rounded-2xl p-6 ${dark ? 'bg-[#C4687A]/10 border border-[#C4687A]/20' : 'bg-[#C4687A]/5 border border-[#C4687A]/15'}`}>
                <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}><span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>Proactive, not reactive.</span> Traditional integration consulting checks in monthly. Yulia checks every metric continuously and only interrupts you when something needs attention.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: 'trending_up', title: 'Revenue vs. deal model', desc: 'Are you hitting the projections that justified the price? Variance analysis against the pre-close financial model.' },
                  { icon: 'group', title: 'Customer retention', desc: 'Have you lost any of the top 20 customers since close? Churn monitoring and sentiment tracking.' },
                  { icon: 'badge', title: 'Employee retention', desc: 'Are key employees staying through transition? Engagement tracking and flight-risk identification.' },
                  { icon: 'hub', title: 'Vendor relationships', desc: 'Any disruptions to critical supply chains? Contract health and cost monitoring post-transition.' },
                  { icon: 'account_balance_wallet', title: 'Cash flow vs. debt service', desc: 'Is the business generating enough to service the acquisition debt? Covenant compliance and liquidity runway.' },
                  { icon: 'checklist', title: 'Integration milestones', desc: 'Are the Day 30/60/90 objectives on track? Completion tracking with deadline alerts and blocker identification.' },
                ].map((metric) => (
                  <div key={metric.title} className={`rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                    <span className="material-symbols-outlined text-[#C4687A] text-xl mb-3">{metric.icon}</span>
                    <h4 className="font-bold text-sm mb-2">{metric.title}</h4>
                    <p className={`text-xs ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{metric.desc}</p>
                  </div>
                ))}
                <div className={`sm:col-span-2 rounded-2xl p-6 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#C4687A] text-xl mb-3">handshake</span>
                  <h4 className="font-bold text-sm mb-2">Seller transition</h4>
                  <p className={`text-xs ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Is knowledge transfer happening on schedule? Milestone check-ins for departing management. Tribal knowledge documentation status. The seller's exit timeline against your operational readiness.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 4. THE 7 MISTAKES ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl p-10 md:p-16 text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div className="mb-12">
                <span className="text-[#C4687A] font-bold uppercase tracking-widest text-xs block mb-3">Avoid These</span>
                <h2 className="text-4xl font-headline font-black tracking-tight mb-4">The 7 mistakes that destroy post-acquisition value.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { num: '01', title: 'Changing too much too fast', desc: 'The business works. Don\u2019t break it trying to improve it in the first month. Understand the engine before you rebuild it.' },
                  { num: '02', title: 'Cutting costs before understanding them', desc: 'Every expense exists for a reason. That \u201Cunnecessary\u201D contractor might be the only person who knows how the HVAC system works. Understand before cutting.' },
                  { num: '03', title: 'Ignoring employee concerns', desc: 'Your employees are scared. They\u2019re googling \u201Cwhat happens when a business gets sold.\u201D Address their fears explicitly, early, and personally.' },
                  { num: '04', title: 'Losing key customers during transition', desc: 'Personal outreach to your top customers in Week 1 is non-negotiable. Your competitors know there\u2019s a transition happening. They\u2019re calling your customers.' },
                  { num: '05', title: 'Fighting with the seller post-close', desc: 'The seller knows things you don\u2019t \u2014 where the bodies are buried, which customers are difficult, which employees are the real MVPs. Treat them well even when the earnout creates tension.' },
                  { num: '06', title: 'Under-investing in the business', desc: 'The worst buyers squeeze margins immediately. The best buyers invest in growth and reap returns in Years 2\u20135. Your acquisition thesis promised growth \u2014 fund it.' },
                ].map((mistake) => (
                  <div key={mistake.num} className="border-t border-white/15 pt-6">
                    <span className="text-[#C4687A] font-black text-2xl mb-3 block">{mistake.num}</span>
                    <h4 className="font-bold mb-2">{mistake.title}</h4>
                    <p className="text-sm text-[#dadadc]/70">{mistake.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#C4687A] rounded-2xl p-8">
                <span className="text-white font-black text-2xl mb-3 block">07</span>
                <h4 className="font-bold text-lg mb-2">No financial reporting on Day 1</h4>
                <p className="text-sm text-white/80">If you can't measure it, you can't manage it. Monthly P&L, weekly cash flow, daily revenue — set up on Day 1 before you change a single thing about the operation.</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/80 italic">Yulia's integration plan is built to prevent every one of these. Not because she's read about them — because they're encoded in the methodology.</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white ${dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]'}`}>
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95]">Sell. Buy. Raise.<br/><span className="text-[#C4687A]">Talk to Yulia.</span></h2>
                <p className="text-lg text-[#dadadc]/70 mt-4">Just closed an acquisition? Tell Yulia about the deal and she'll build your 180-day plan — from the financials and risks that due diligence actually revealed.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={handleCTA} className="px-10 py-5 bg-gradient-to-r from-[#C4687A] to-[#E09098] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Talk to Yulia</button>
                <p className="text-xs text-[#dadadc]/70">Free analysis · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
