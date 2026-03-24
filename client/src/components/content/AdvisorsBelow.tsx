import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from './animations';

export default function AdvisorsBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="mb-8">
              <span className="bg-[#b0004a] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">[PAUL TO WRITE]</span>
            </div>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
              Scale your advisory <span className="text-[#b0004a]">without adding headcount.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className={`rounded-xl p-12 mt-12 relative overflow-hidden ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <div className="max-w-3xl relative z-10">
                <p className="text-3xl font-medium leading-tight mb-6">You have twelve active listings. Something isn't getting done this week.</p>
                <p className={`text-xl leading-relaxed mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The bottleneck isn't your judgment — it's the sheer volume of data transcription, PDF formatting, and repetitive buyer screening. You're a strategist being used as a clerk.</p>
                <div className="flex gap-4">
                  <button onClick={handleCTA} className="bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:opacity-90 transition-all border-none cursor-pointer">
                    Start with your mandate <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button onClick={handleCTA} className={`px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all border-none cursor-pointer ${dark ? 'bg-[#3a3c3e] text-white' : 'bg-white text-[#1a1c1e]'}`}>
                    Message Yulia
                  </button>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#b0004a]/5 to-transparent"></div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. MULTIPLIED EXPERTISE ═══ */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <ScrollReveal className="lg:col-span-5">
            <h2 className="font-headline text-5xl font-extrabold tracking-tighter mb-8 leading-none">Your expertise isn't being replaced. It's being multiplied.</h2>
            <p className={`text-lg leading-relaxed mb-6 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Most advisory tools are glorified spreadsheets. smbX.ai handles the heavy lifting of data synthesis, so you can focus on the art of negotiation and client relationships.</p>
          </ScrollReveal>
          <StaggerContainer className="lg:col-span-7 grid grid-cols-2 gap-6">
            {[
              { icon: 'speed', title: 'Deal-ready documents in minutes, not weeks', desc: "Upload the financials and let Yulia produce the complete deal package — professional, institutional grade, in your firm's voice. The work that used to consume an analyst for a week, finished before your next meeting." },
              { icon: 'branding_watermark', title: 'White-labeled outputs', desc: "Every report, teaser, and data visualization is exported as your firm's property. Professional, institutional grade, and investor-ready." },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div className={`p-8 rounded-xl shadow-sm h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 3. EFFICIENCY DATA ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className={`p-1 rounded-2xl ${dark ? 'bg-zinc-800' : 'bg-[#1a1c1e]'}`}>
              <div className={`rounded-xl p-10 overflow-hidden ${dark ? 'bg-[#2f3133]' : 'bg-white'}`}>
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <span className="text-[#b0004a] font-bold tracking-widest text-xs uppercase mb-2 block">Efficiency Matrix</span>
                    <h2 className="font-headline text-4xl font-extrabold tracking-tighter">Throughput Comparison</h2>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 bg-[#5d5e61] rounded-sm"></div> Legacy Workflow</div>
                    <div className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 bg-[#b0004a] rounded-sm"></div> smbX.ai</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                    <div className={`relative h-64 flex items-end gap-4 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                      <div className="w-full bg-[#5d5e61]/10 h-[90%] rounded-t-lg relative"><div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold">20 HRS</div></div>
                      <div className="w-full bg-[#b0004a] h-[8%] rounded-t-lg relative"><div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#b0004a]">20 MIN</div></div>
                    </div>
                    <div className="text-center font-bold text-sm tracking-tight">Deal Package Production</div>
                  </div>
                  <div className="space-y-6">
                    <div className={`flex justify-between items-center p-6 rounded-xl ${dark ? 'bg-zinc-800' : 'bg-[#f3f3f6]'}`}>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Deal Capacity Increase</div>
                        <div className="text-4xl font-headline font-extrabold"><AnimatedCounter value={34} suffix="" prefix="" />.<span className="text-4xl">4x</span></div>
                      </div>
                      <span className="material-symbols-outlined text-[#b0004a] text-5xl">trending_up</span>
                    </div>
                    <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The ability to move from data ingestion to a full teaser in under an hour changes your entire deal screening protocol. More deals evaluated, more mandates won, same team.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. PRICING ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-headline text-5xl font-extrabold tracking-tighter mb-4">Choose your operating scale</h2>
              <p className={dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}>Predictable pricing for high-performance firms.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Trial */}
            <StaggerItem>
              <div className={`p-10 rounded-2xl flex flex-col h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <h3 className="text-2xl font-bold mb-2">Advisor Trial</h3>
                <div className="text-4xl font-headline font-extrabold mb-2">$0<span className={`text-lg font-medium ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}> / first 3 deals</span></div>
                <p className={`text-sm mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Full platform access for your first three client engagements.</p>
                <ul className="space-y-4 mb-12 flex-1">
                  {['3 Client Engagements', 'Automated Data Ingestion', 'Core Deal Documents'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-[#b0004a] text-lg">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={handleCTA} className={`w-full py-4 rounded-xl font-bold transition-colors border-none cursor-pointer ${dark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-[#eeeef0] hover:bg-[#f3f3f6] text-[#1a1c1e]'}`} style={dark ? undefined : { border: '1px solid #eeeef0' }}>Start Free Trial</button>
              </div>
            </StaggerItem>
            {/* Pro */}
            <StaggerItem>
              <div className={`p-10 rounded-2xl flex flex-col h-full scale-105 shadow-2xl relative ${dark ? 'bg-gradient-to-br from-[#b0004a] to-[#d81b60] text-white' : 'bg-[#1a1c1e] text-white'}`}>
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#b0004a] text-white text-[10px] font-extrabold tracking-widest px-4 py-1 rounded-full uppercase">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2">Advisor Pro</h3>
                <div className="text-4xl font-headline font-extrabold mb-2">$299<span className="text-lg font-medium text-gray-400"> / month</span></div>
                <p className="text-sm text-gray-400 mb-8">Designed for independent advisors managing multiple active listings.</p>
                <ul className="space-y-4 mb-12 flex-1">
                  {['Unlimited Active Mandates', 'Full Document Suite', 'Smart Buyer Matching', 'Custom Brand Styling'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-[#b0004a] text-lg">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={handleCTA} className="w-full py-4 rounded-xl bg-[#b0004a] font-bold text-white hover:bg-[#d81b60] transition-colors border-none cursor-pointer">Upgrade to Pro</button>
              </div>
            </StaggerItem>
            {/* Enterprise */}
            <StaggerItem>
              <div className={`p-10 rounded-2xl flex flex-col h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <h3 className="text-2xl font-bold mb-2">Advisor Enterprise</h3>
                <div className="text-4xl font-headline font-extrabold mb-2">$499<span className={`text-lg font-medium ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}> / month</span></div>
                <p className={`text-sm mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The full suite for established firms and collaborative teams.</p>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className={`flex items-center gap-3 text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Everything in Pro, plus:</li>
                  {['API Access', 'White-label Options', 'Priority Support & Team Seats'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-[#b0004a] text-lg">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={handleCTA} className={`w-full py-4 rounded-xl font-bold transition-colors border-none cursor-pointer ${dark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white hover:bg-[#f3f3f6] text-[#1a1c1e]'}`} style={dark ? undefined : { border: '1px solid #eeeef0' }}>Contact Sales</button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 5. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-none">Ready to reclaim your <span className="text-[#b0004a] italic">judgment?</span></h2>
              <p className={`text-xl max-w-2xl mx-auto mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Stop spending your strategic hours on data entry and formatting. Let Yulia handle the analytical work so you can focus on closing deals.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Start with your mandate</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
