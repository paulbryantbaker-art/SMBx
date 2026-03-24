import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function IntegrateBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const timeline = [
    { num: '01', title: 'STABILIZE', time: 'Day 1–30', desc: "Day Zero: passwords, bank accounts, insurance, physical access — forty items most new owners forget. Meet every employee individually. Call the top twenty customers. Secure every vendor relationship.", footer: '"The hardest discipline of all for a new owner: change nothing. The business works. Learn why before you change how."', italic: true },
    { num: '02', title: 'OPTIMIZE', time: 'Day 30–90', desc: "Now you've learned it from the inside. Capture the quick wins your DD identified. Install financial controls — many acquired businesses have surprisingly loose cash management.", footer: 'Fix the operational gaps. Start measuring the KPIs that actually matter for your thesis.', italic: false },
    { num: '03', title: 'GROW', time: 'Day 90–180', desc: "Execute the value creation plan. Track monthly: revenue vs. model, EBITDA vs. model, customer retention, employee retention.", footer: "The scorecard that tells you whether reality is matching what you underwrote — and what to adjust when it isn't.", italic: false },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
          <div className="lg:col-span-8">
            <ScrollReveal>
              <div className="flex gap-2 mb-10">
                <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-sm">Integrate</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-zinc-800 text-[#dadadc]/80' : 'bg-[#eeeef0] text-[#5d5e61]'}`}>Post-Acquisition</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.85] mb-8">
                The first 180 days determine <span className="text-[#b0004a]">everything.</span>
              </h1>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2} className="lg:col-span-4 lg:pt-24">
            <p className={`text-xl leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              70% of acquisitions fail to deliver the returns that justified the price. Not because the thesis was wrong. Because the execution was unstructured.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. MANIFEST ═══ */}
        <ScrollReveal>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
            <div className="space-y-10">
              <div className="h-[3px] w-24 bg-[#b0004a]"></div>
              <div className={`space-y-8 editorial text-xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                <p className={`font-medium ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>I've seen it happen the same way every time. The intensity of the deal process — months of evaluation, negotiation, diligence, financing, legal work — creates a natural letdown the day after close.</p>
                <p>The DD findings that should be driving every decision for the next six months are scattered across email threads and shared folders. The financial model that justified the purchase price is a spreadsheet on someone's laptop. <span className={`font-extrabold ${dark ? 'text-white' : 'text-[#1a1c1e]'}`}>Nobody has a plan for Monday morning.</span></p>
              </div>
            </div>
            <div className={`p-12 md:p-16 rounded-3xl relative overflow-hidden flex flex-col justify-center ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-[#f3f3f6]'}`}>
              <div className="relative z-10 space-y-8">
                <span className="material-symbols-outlined text-[#b0004a] text-5xl">warning</span>
                <p className="text-2xl font-semibold leading-snug">The employees are watching. Some are updating their resumes. The customers haven't been told. The vendors are wondering if terms change under new ownership.</p>
                <p className={`text-xl italic ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>And the new owner is improvising.</p>
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none"><span className="material-symbols-outlined text-[320px]">crisis_alert</span></div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. YULIA SPOTLIGHT ═══ */}
        <ScrollReveal>
          <section className="bg-[#2f3133] text-white rounded-3xl p-12 md:p-24 mb-32 overflow-hidden relative">
            <div className="max-w-4xl relative z-10">
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight mb-10 leading-[1.1]">
                When your deal closes on smbX.ai, <span className="text-[#d81b60]">Yulia doesn't stop.</span>
              </h2>
              <p className="text-xl md:text-2xl text-[#dadadc] leading-relaxed mb-16 font-medium">
                She carries forward everything — DD findings, risk flags, financial model, operational gaps, customer data — and builds a <span className="text-white border-b-2 border-[#d81b60]/40">180-day plan specific to this business</span>, this deal, these findings.
              </p>
              <div className="flex flex-wrap gap-x-12 gap-y-8">
                {[
                  { icon: 'verified', label: 'Custom Architecture' },
                  { icon: 'analytics', label: 'Data Continuity' },
                  { icon: 'timer', label: '180-Day Scope' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#d81b60] text-3xl">{f.icon}</span>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#dadadc]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 bg-gradient-to-l from-[#b0004a] to-transparent pointer-events-none"></div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. 180-DAY TIMELINE ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="flex items-center gap-6 mb-20">
              <h3 className={`text-xs font-extrabold tracking-[0.3em] uppercase shrink-0 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The Timeline</h3>
              <div className={`flex-1 h-px ${dark ? 'bg-zinc-800' : 'bg-[#eeeef0]'}`}></div>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {timeline.map((phase) => (
              <StaggerItem key={phase.num}>
                <div className="group">
                  <div className={`rounded-3xl p-10 h-full transition-all flex flex-col ${dark ? 'bg-[#2f3133] border border-zinc-800 hover:shadow-2xl hover:shadow-black/20' : 'bg-white border border-[#eeeef0] hover:shadow-2xl hover:shadow-black/5'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-[#b0004a] flex items-center justify-center text-white text-xl font-extrabold mb-10 group-hover:-translate-y-2 transition-transform">{phase.num}</div>
                    <h4 className="font-headline text-3xl font-extrabold mb-2">{phase.title}</h4>
                    <p className="text-[#b0004a] font-bold text-sm mb-8 tracking-widest">{phase.time}</p>
                    <p className={`leading-relaxed text-lg mb-10 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{phase.desc}</p>
                    <div className={`mt-auto pt-8 ${dark ? 'border-t border-zinc-800' : 'border-t border-[#eeeef0]'}`}>
                      <p className={`text-sm font-bold leading-relaxed ${phase.italic ? 'italic' : ''}`}>{phase.footer}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 5. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 max-w-4xl mx-auto text-center">
            <div className={`py-20 px-8 rounded-3xl shadow-xl ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0] shadow-black/[0.02]'}`}>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 leading-[1.1] tracking-tight">Not a template downloaded from a blog. <span className="text-[#b0004a]">Your plan, built from your deal.</span></h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl flex items-center gap-3 border-none cursor-pointer">
                  Tell Yulia about your acquisition <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>
                  Message Yulia
                </button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
