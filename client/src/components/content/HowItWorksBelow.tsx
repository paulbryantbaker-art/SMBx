import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function HowItWorksBelow() {
  const [dark, setDark] = useDarkMode();

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const trustSources = ['U.S. Census Bureau', 'BLS', 'FRED', 'SEC EDGAR', 'SBA', 'IRS SOI'];

  const dimensions = [
    { icon: 'hub', title: 'Industry Structure', desc: 'Market concentration, fragmentation vs consolidation trends, and supply chain vulnerability mapping.' },
    { icon: 'map', title: 'Regional Economics', desc: 'Local labor pools, GDP growth, net migration trends, and zip-code level purchasing power.' },
    { icon: 'balance', title: 'Financial Normalization', desc: 'Removing owner discretionary expenses to reveal true SDE and EBITDA performance with surgical precision.' },
    { icon: 'groups_3', title: 'Buyer Landscape', desc: 'Identifying active PE roll-ups, strategic acquirers, and search fund velocity in your specific sector.' },
    { icon: 'architecture', title: 'Deal Architecture', desc: 'Structuring earn-outs, seller notes, and equity rolls to optimize after-tax proceeds for both sides.' },
    { icon: 'report_problem', title: 'Risk Assessment', desc: 'Quantifying customer concentration, key-man dependency, regulatory headwinds, and lease exposure.' },
  ];

  const comparisonRows = [
    { feature: 'Real-time SBA Data', llm: 'Outdated (training cutoff)', smbx: 'Live federal data feeds' },
    { feature: 'Financial Precision', llm: 'General estimations', smbx: 'Tax-code verified normalization' },
    { feature: 'Localized Benchmarks', llm: 'National averages', smbx: 'MSA-level Census + BLS data' },
    { feature: 'Deal Structuring', llm: 'Generic advice', smbx: 'Model-ready SBA 7(a) structures' },
  ];

  return (
    <div className={dark ? 'bg-[#1a1c1e] text-[#dadadc]' : 'bg-[#f9f9fc] text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24 max-w-4xl">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 rounded-sm">The smbX.ai Protocol</span>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-8">
              Bridging the <span className="text-[#b0004a]">Information Desert.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              Public markets have Bloomberg. Private markets have... Google. smbX.ai connects every fragmented data point — Census, BLS, FRED, SEC, SBA, IRS — into a single intelligence layer built for deals.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. TRUST BAR ═══ */}
        <ScrollReveal>
          <section className={`mb-32 py-12 ${dark ? 'border-y border-zinc-800' : 'border-y border-[#eeeef0]'}`}>
            <StaggerContainer className="flex flex-wrap items-center justify-between gap-8 opacity-50">
              {trustSources.map((src) => (
                <StaggerItem key={src}>
                  <span className="text-sm font-bold tracking-widest uppercase">{src}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <p className={`text-center mt-8 text-xs font-medium tracking-widest uppercase ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Sourcing from the bedrock of economic truth</p>
          </section>
        </ScrollReveal>

        {/* ═══ 3. SEVEN DIMENSIONS ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">A real deal analysis isn't one thing. <span className="text-[#b0004a]">It's seven.</span></h2>
              <p className={`max-w-2xl mx-auto ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Every deal is decomposed across seven architectural dimensions before a single LOI is signed.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dimensions.map((d) => (
              <StaggerItem key={d.title}>
                <div className={`p-8 rounded-2xl hover:shadow-xl hover:shadow-[#b0004a]/5 transition-all h-full ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-4xl mb-4">{d.icon}</span>
                  <h3 className="text-xl font-bold leading-tight mb-3">{d.title}</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                </div>
              </StaggerItem>
            ))}
            {/* Forward Signals — accent card spanning 2 cols */}
            <StaggerItem className="md:col-span-2">
              <div className="p-8 bg-[#b0004a] text-white rounded-2xl h-full">
                <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                <h3 className="font-headline text-3xl font-extrabold mb-3">Forward Signals</h3>
                <p className="text-lg opacity-90">Predictive modeling of the next 24 months of industry EBITDA multiples based on macroeconomic shifts, PE dry powder, and lending cycle data.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══ 4. NATIONAL AVERAGES ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="border-l-8 border-[#b0004a] pl-8 mb-12">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">National averages are meaningless in M&A.</h2>
              <p className={`text-xl mt-4 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Why a 3x multiple in one city is a steal, and in another, it's a trap.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cleaning in Phoenix */}
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-[#2f3133] border border-zinc-800 shadow-sm' : 'bg-white border border-[#eeeef0] shadow-sm'}`}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Service Sector</div>
                    <h4 className="font-headline text-3xl font-extrabold">Cleaning in Phoenix</h4>
                  </div>
                  <div className="bg-[#b0004a]/10 px-4 py-2 rounded-xl text-[#b0004a] font-bold">$380K SDE</div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4"><div className="w-12 h-1 bg-[#b0004a] rounded-full"></div><span className="text-sm font-bold">Labor Elasticity: HIGH</span></div>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>High population growth is driving demand, but labor costs are rising faster than contract prices. Valuation must be discounted for margin compression risk.</p>
                  <div className="text-4xl font-headline font-extrabold">3.2x <span className={`text-sm font-medium ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Effective Multiple</span></div>
                </div>
              </div>
              {/* Precision Manufacturing */}
              <div className={`flex-1 p-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Industrial Sector</div>
                    <h4 className="font-headline text-3xl font-extrabold">Precision Manufacturing</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold ${dark ? 'bg-zinc-700 text-white' : 'bg-[#1a1c1e] text-white'}`}>$12M EBITDA</div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4"><div className="w-24 h-1 bg-[#1a1c1e] rounded-full"></div><span className="text-sm font-bold">Barriers to Entry: EXTREME</span></div>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Specialized IP and long-term federal contracts create a moat. Strategic buyers are currently paying a 25% premium over financial sponsors.</p>
                  <div className="text-4xl font-headline font-extrabold">8.4x <span className={`text-sm font-medium ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Effective Multiple</span></div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. YULIA CONVERSATION ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-full bg-[#b0004a] flex items-center justify-center text-white"><span className="material-symbols-outlined">psychology</span></div>
                <div>
                  <h3 className="text-2xl font-bold">Meet Yulia</h3>
                  <p className={`text-sm ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Your AI Deal Architect</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-end">
                  <div className={`px-6 py-4 rounded-2xl rounded-tr-none max-w-lg ${dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}`}>
                    <p className="text-sm leading-relaxed font-medium">I'm looking at an HVAC company in Atlanta. $4M revenue, 22% margin. Is this a good deal?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#2f3133] text-white p-8 rounded-2xl rounded-tl-none max-w-2xl border-l-2 border-[#b0004a]">
                    <p className="text-white/80 text-sm leading-relaxed mb-6">
                      Atlanta HVAC is currently seeing a 4.2x multiple average, but there's a localized labor shortage driving up OpEx by 12% YOY. Based on the 22% margin, they are outperforming the local average of 18%. However, check their commercial vs residential split — Atlanta's commercial permit applications are down 8% this quarter, which suggests a pivot to residential service contracts might be necessary.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1c1e] p-4 rounded-xl">
                        <p className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Local Benchmark</p>
                        <p className="text-lg font-headline font-extrabold text-white">18.4%</p>
                      </div>
                      <div className="bg-[#1a1c1e] p-4 rounded-xl">
                        <p className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Labor Risk</p>
                        <p className="text-lg font-headline font-extrabold text-[#d81b60]">Elevated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. CHATGPT COMPARISON ═══ */}
        <ScrollReveal>
          <section className="mb-32">
            <h2 className="font-headline text-4xl font-extrabold text-center mb-12">What does this do that <span className="text-[#b0004a]">ChatGPT can't?</span></h2>
            <div className={`overflow-hidden rounded-3xl ${dark ? 'border border-zinc-800' : 'border border-[#eeeef0]'}`}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={dark ? 'bg-[#3a3c3e]' : 'bg-[#f3f3f6]'}>
                    <th className={`p-8 text-sm font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Feature</th>
                    <th className={`p-8 text-sm font-bold uppercase tracking-widest ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Standard LLMs</th>
                    <th className="p-8 text-sm font-bold uppercase tracking-widest text-[#b0004a]">smbX.ai</th>
                  </tr>
                </thead>
                <tbody className={dark ? 'divide-y divide-zinc-800' : 'divide-y divide-[#eeeef0]'}>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td className="p-8 font-bold">{row.feature}</td>
                      <td className={`p-8 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{row.llm}</td>
                      <td className="p-8">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#b0004a]">check_circle</span> {row.smbx}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 7. FINAL CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-gradient-to-br from-[#b0004a]/5 to-transparent border border-[#b0004a]/20' : 'bg-gradient-to-br from-[#b0004a]/5 to-transparent border border-[#b0004a]/10'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-6">Ready to see the intelligence?</h2>
              <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Stop guessing with national averages and generic AI responses. Start analyzing with localized, sourced, deal-specific intelligence.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">See for yourself</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
