import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function RaiseBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-3/5">
              <ScrollReveal y={40}>
                <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter leading-tight mb-12">
                  A 5% difference in dilution today is a{' '}
                  <span className="text-[#b0004a]">$2.5 million</span> difference at exit.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className={`space-y-6 editorial text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                  <p>Raising capital isn't just about the cash hitting your balance sheet. It's an architectural decision that defines the next decade of your life. We've seen founders celebrate a "great valuation" only to realize at exit that the liquidation preference wiped out their entire gains.</p>
                  <p>Complex term sheets are designed to protect the capital, not the creator. From participation rights that double-dip on your exit to anti-dilution clauses that penalize you for market shifts, the fine print is where your equity goes to die.</p>
                  <p>We don't just find you money — we model the waterfall of every provision. Liquidation preferences, board seats, drag-along rights. So you remain in the driver's seat.</p>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.25} className="lg:w-2/5 sticky top-20">
              <div className={`p-8 rounded-xl shadow-lg relative overflow-hidden ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <h3 className="font-bold text-sm tracking-widest uppercase text-[#b0004a] mb-6">Intelligence Report</h3>
                <div className="space-y-4">
                  {[
                    ['Typical Exit Loss', '18–24%', false],
                    ['Term Sheet Risk Index', 'High', true],
                    ['Control Retention', 'Tier 1 Strategy', false],
                  ].map(([label, value, accent]) => (
                    <div key={label as string} className={`flex justify-between items-end pb-2 ${dark ? 'border-b border-zinc-800' : 'border-b border-[#eeeef0]'}`}>
                      <span className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{label}</span>
                      <span className={`text-xl font-bold ${accent ? 'text-[#b0004a]' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleCTA} className="w-full mt-8 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all border-none cursor-pointer">
                  Model My Exit <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 2. FINANCING OPTIONS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline font-extrabold text-4xl tracking-tight">Strategic Financing Vehicles</h2>
              <p className={`mt-2 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Precision instruments for your specific growth stage.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Revenue-based (wide) */}
            <StaggerItem className="md:col-span-8">
              <div className={`p-10 rounded-xl hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="md:w-1/2">
                    <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">trending_up</span>
                    <h3 className="font-headline font-extrabold text-2xl mb-4">Revenue-based financing</h3>
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The ultimate non-dilutive bridge. Ideal for high-margin SaaS or recurring revenue models where you want capital without giving up a single percentage of ownership.</p>
                  </div>
                  <div className="md:w-1/2 flex flex-col justify-center items-end text-right">
                    <div className="mb-2">
                      <span className={`block uppercase text-xs tracking-widest ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Repayment Cap</span>
                      <span className="text-4xl font-headline font-extrabold text-[#b0004a]">1.3x–2.0x</span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg mt-4 ${dark ? 'bg-zinc-800' : 'bg-[#f3f3f6]'}`}>
                      <span className="font-medium">Zero Dilution Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
            {/* SBA */}
            <StaggerItem className="md:col-span-4">
              <div className={`p-10 rounded-xl hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">account_balance</span>
                <h3 className="font-headline font-extrabold text-2xl mb-4">SBA Expansion</h3>
                <p className={`mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Government-backed security for physical expansion or acquisitions.</p>
                <div className="space-y-4 text-sm">
                  {[['Keep', '100% Equity'], ['Rates', '9.75%–12.25%'], ['Limit', 'Up to $5M']].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className={dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}>{label}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
            {/* Equity */}
            <StaggerItem className="md:col-span-4">
              <div className={`p-10 rounded-xl hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">pie_chart</span>
                <h3 className="font-headline font-extrabold text-2xl mb-4">Equity Rounds</h3>
                <p className={`mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Fuel for hyper-growth. Requires modeling dilution through multiple future rounds.</p>
                <ul className={`text-sm space-y-3 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                  {['Liquidation waterfall modeling', 'Governance & Board guidance', 'Strategic investor matching'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b0004a] text-sm">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
            {/* Strategic */}
            <StaggerItem className="md:col-span-4">
              <div className={`p-10 rounded-xl border-t-4 border-t-[#b0004a]/40 hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                <h3 className="font-headline font-extrabold text-2xl mb-4">Strategic Partnership</h3>
                <p className={`mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Smart capital that brings more than money. Distribution, IP, or supply chain synergies.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#b0004a]/10 text-[#b0004a] text-xs font-bold px-3 py-1 rounded-full">Capital</span>
                  <span className="bg-[#b0004a]/10 text-[#b0004a] text-xs font-bold px-3 py-1 rounded-full">Capabilities</span>
                </div>
              </div>
            </StaggerItem>
            {/* Mezzanine */}
            <StaggerItem className="md:col-span-4">
              <div className={`p-10 rounded-xl hover:shadow-lg transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">layers</span>
                <h3 className="font-headline font-extrabold text-2xl mb-4">Mezzanine</h3>
                <p className={`mb-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>The gap filler for mature companies. Subordinated debt with equity-like returns.</p>
                <div className="space-y-4 text-sm">
                  {[['Min. EBITDA', '$2M+'], ['Coupon', '12–20%']].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className={dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}>{label}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 3. PITCH DECK PREPARATION ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline font-extrabold text-4xl tracking-tight leading-tight">
                Your pitch deck gets <span className="text-[#b0004a]">sixty seconds</span> before the next one.
              </h2>
              <p className={`text-lg mt-4 max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                Yulia doesn't just review your materials — she battle-tests them. In the time it takes an investor to scroll through a LinkedIn feed, your entire life's work is judged.
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: 'style', title: '12-Slide Master Deck', desc: 'A tight, compelling narrative that answers the "Why Now" and "Why You" — following the Psychology of the Yes framework.' },
              { icon: 'table_chart', title: 'Hardened Financial Model', desc: 'Three-year projections built on defensible unit economics. Built to withstand the most aggressive institutional due diligence.' },
              { icon: 'account_tree', title: 'Dynamic Cap Table & Use of Funds', desc: 'Live modeling of what happens to your ownership in every exit scenario. Transparent tracking of dilution and precise allocation.' },
              { icon: 'track_changes', title: 'Precision Investor Targeting', desc: 'Custom mapping of partners whose mandates align with your sector, stage, and geography. Curated, not scraped.' },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div className={`p-8 rounded-xl flex items-start gap-6 h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <div className="h-12 w-12 rounded-lg bg-[#b0004a]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#b0004a]">{card.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{card.title}</h4>
                    <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 4. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-6xl font-headline font-extrabold leading-tight tracking-tighter italic">Growth funded. On your terms.</h2>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              Don't let a poorly structured term sheet undo years of sacrifice. Let's build a financing strategy that honors your vision and protects your exit.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
              <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">
                Tell Yulia about your raise
              </button>
              <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>
                Message Yulia
              </button>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
