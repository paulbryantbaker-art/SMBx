import { useState } from 'react';
import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark, setDark] = useDarkMode();

  // Calculator state
  const [journey, setJourney] = useState<'sell' | 'buy' | 'raise'>('sell');
  const [industry, setIndustry] = useState('services');
  const [revenue, setRevenue] = useState(3200000);
  const [sde, setSde] = useState(850000);

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const MULTIPLES: Record<string, { low: number; mid: number; high: number; label: string }> = {
    services: { low: 2.5, mid: 3.25, high: 4.0, label: 'Home Services' },
    healthcare: { low: 3.5, mid: 4.5, high: 5.5, label: 'Healthcare' },
    tech: { low: 4.0, mid: 6.0, high: 8.0, label: 'Tech / SaaS' },
    manufacturing: { low: 3.0, mid: 4.0, high: 5.0, label: 'Manufacturing' },
    food: { low: 2.0, mid: 2.5, high: 3.0, label: 'Food & Beverage' },
    professional: { low: 2.0, mid: 2.75, high: 3.5, label: 'Professional Services' },
    construction: { low: 2.5, mid: 3.25, high: 4.0, label: 'Construction / Trades' },
    other: { low: 2.5, mid: 3.5, high: 4.5, label: 'General' },
  };

  const industryOptions: { key: string; btn: string }[] = [
    { key: 'services', btn: 'Home Services' },
    { key: 'healthcare', btn: 'Healthcare' },
    { key: 'tech', btn: 'Tech / SaaS' },
    { key: 'manufacturing', btn: 'Manufacturing' },
    { key: 'food', btn: 'Food & Bev' },
    { key: 'professional', btn: 'Professional Svcs' },
    { key: 'construction', btn: 'Construction' },
    { key: 'other', btn: 'Other' },
  ];

  const fmtM = (n: number) => {
    if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1) + 'B';
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(n % 100_000 === 0 ? (n >= 10_000_000 ? 0 : 1) : 2).replace(/\.?0+$/, '') + 'M';
    return '$' + (n / 1_000).toFixed(0) + 'K';
  };
  const fmtUSD = (n: number) => '$' + n.toLocaleString('en-US');

  const mult = MULTIPLES[industry];
  const basisType = sde >= 2_000_000 ? 'EBITDA' : 'SDE';
  const vLow = Math.round(sde * mult.low);
  const vMid = Math.round(sde * mult.mid);
  const vHigh = Math.round(sde * mult.high);
  const abLow = Math.round(sde * 0.05);
  const abHigh = Math.round(sde * 0.15);
  const abValLow = Math.round(abLow * mult.low);
  const abValHigh = Math.round(abHigh * mult.high);
  const rawFee = Math.round(sde * 0.001);
  const fee = Math.max(999, rawFee);
  const isMinFee = rawFee < 999;
  const feePctOfVal = (fee / vMid) * 100;
  const abMidVal = Math.round(((abLow + abHigh) / 2) * mult.mid);
  const roiMult = Math.round(abMidVal / fee);
  const revPct = ((revenue - 500_000) / (100_000_000 - 500_000)) * 100;
  const sdePct = ((sde - 100_000) / (1_000_000_000 - 100_000)) * 100;

  const goToChat = () => {
    const jLabel = { sell: 'selling', buy: 'buying', raise: 'raising capital for' }[journey] as string;
    const msg = `I'm interested in ${jLabel} a ${mult.label.toLowerCase()} business with about ${fmtM(revenue)} in revenue and ${fmtM(sde)} in ${basisType}.`;
    window.location.href = '/?prefill=' + encodeURIComponent(msg);
  };

  const freeDeliverables = [
    { title: 'ValueLens', desc: 'How buyers will view your enterprise risk and opportunity — structural audit of business health and owner dependence.', icon: 'visibility', span: 'col-span-12 md:col-span-4' },
    { title: 'Value Readiness Report', desc: "Comprehensive gap analysis identifying what's holding back your multiple — with specific recommendations for each factor and a priority remediation sequence.", icon: 'fact_check', span: 'col-span-12 md:col-span-8', tags: ['Exit Strategy', 'Gap Analysis', 'Remediation'] },
    { title: 'Investment Thesis', desc: 'Professional narrative outlining the strategic rationale for your deal — the document that makes buyers lean forward.', icon: 'lightbulb', span: 'col-span-12 md:col-span-6' },
  ];

  const bentoSmall = [
    { label: 'Preliminary', title: 'SDE / EBITDA', icon: 'calculate', span: 'col-span-6 md:col-span-3' },
    { label: 'Capital Stack', title: 'Template', icon: 'account_balance', span: 'col-span-6 md:col-span-3' },
    { label: 'AI-Powered', title: 'Deal Scoring', icon: 'scoreboard', span: 'col-span-6' },
    { label: 'Unlimited', title: 'Yulia Q&A', icon: 'chat', span: 'col-span-6' },
  ];

  const included = [
    { icon: 'query_stats', title: 'Know your market', desc: 'Understand exactly where your deal sits in the market — who\'s buying, what they\'re paying, and whether your timing is right. Yulia maps the competitive landscape so you negotiate from knowledge, not hope.' },
    { icon: 'calculate', title: 'Know your numbers', desc: 'See the deal through a buyer\'s eyes and a lender\'s spreadsheet. Every financial model Yulia builds is stress-tested against real lending criteria, real tax scenarios, and real market benchmarks.' },
    { icon: 'description', title: 'Professional documents that close deals', desc: 'The documents that move deals forward — prepared to the standard buyers, lenders, and attorneys expect. Not templates. Not fill-in-the-blank. Built from your actual deal data by an AI that understands M&A.' },
    { icon: 'trending_up', title: 'Maximize your value before you go to market', desc: 'Most sellers leave $100K–$500K on the table because they go to market before they\'re ready. Yulia identifies exactly what\'s holding back your multiple and builds a remediation plan with dollar impact for each action.' },
    { icon: 'handshake', title: 'Execute with confidence through closing day', desc: 'From the first LOI to the final wire transfer — deal room, negotiation tactics, due diligence coordination, legal frameworks, and closing logistics. Every step managed, every deadline tracked, every document in the right hands.' },
    { icon: 'rocket_launch', title: 'The first 180 days after close', desc: 'The deal doesn\'t end at close — it starts. Employee transitions, customer retention, vendor relationships, operational assessment, and a growth roadmap built from what the due diligence actually revealed. Not generic. Yours.' },
  ];

  const faqs = [
    { q: 'Is the free analysis really free?', a: 'Yes. Engage with Yulia, upload documents, receive full analysis reports — no credit card, no expiration. You only pay when you choose to move into deal execution.' },
    { q: "What's included in the execution fee?", a: 'Everything for one deal — from market intelligence and financial modeling through professional deal documents, negotiation support, closing coordination, and your 180-day post-close integration plan. One payment, no additional charges, no surprises.' },
    { q: 'Why 0.1%?', a: "The analytical depth, document generation, and deal support scale with complexity. A flat percentage means everyone pays the same rate relative to their deal — and the $999 minimum ensures smaller businesses get the full platform." },
    { q: "What if I'm a broker or M&A advisor?", a: 'advisor' },
    { q: 'Can I take my data with me?', a: 'Always. You own your data. Export your analysis, valuations, and financial models in standard formats at any time — even if you never pay the execution fee.' },
    { q: 'What happens if a deal falls through?', a: "The platform fee covers one specific deal engagement. All your free-tier analysis remains yours. For a new deal, you'd start a new conversation — free analysis again, new fee only if you execute." },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#dadadc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO — 12-col editorial grid ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex gap-2 mb-10">
                <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-sm">Pricing</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
                Start free. Stay because <span className="text-[#b0004a]">it works.</span>
              </h1>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2} className="lg:col-span-5 lg:pt-24">
            <p className={`text-xl leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
              Every conversation with Yulia starts for free. No credit card. No account. No trial that expires. When you're ready to execute, one payment covers everything through closing.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. FREE DELIVERABLES — asymmetric bento ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Phase One</span>
                <h2 className="font-headline text-4xl font-bold tracking-tight">What's free</h2>
              </div>
              <span className="text-[#b0004a] font-bold tracking-widest text-sm uppercase">Forever</span>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-12 gap-4">
            {freeDeliverables.map((d) => (
              <StaggerItem key={d.title} className={d.span}>
                <div className={`p-8 rounded-xl min-h-[200px] flex flex-col ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-3xl mb-4">{d.icon}</span>
                  <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                  <p className={`text-sm leading-relaxed ${d.tags ? 'max-w-lg' : ''} ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{d.desc}</p>
                  {d.tags && (
                    <div className="flex gap-3 mt-auto pt-4">
                      {d.tags.map((tag) => (
                        <span key={tag} className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${dark ? 'bg-zinc-800 text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}

            {bentoSmall.map((item) => (
              <StaggerItem key={item.title} className={item.span}>
                <div className={`p-6 rounded-xl flex flex-col justify-center text-center min-h-[200px] ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a]/40 text-4xl mb-3">{item.icon}</span>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{item.label}</p>
                  <h4 className="text-base font-bold">{item.title}</h4>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 3. DEAL INTELLIGENCE CALCULATOR ═══ */}
        <section className="mb-32">
          <style>{`
            .smbx-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer}
            .smbx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:3px solid #b0004a;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:grab;transition:transform .15s}
            .smbx-range::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.15)}
            .smbx-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:3px solid #b0004a;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:grab}
            .smbx-range::-moz-range-track{height:6px;border-radius:3px;background:rgba(255,255,255,0.1)}
          `}</style>
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Deal Intelligence</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight">What's your deal worth?</h2>
              <p className={`text-lg mt-3 max-w-2xl ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Slide to see a preliminary valuation range based on market multiples. Yulia sharpens this with local data, add-back analysis, and buyer landscape intelligence.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className={`rounded-3xl overflow-hidden ${dark ? 'bg-[#141517] border border-zinc-800' : 'bg-[#1a1c1e]'}`}>
              <div className="p-10 md:p-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                  {/* LEFT: Inputs */}
                  <div className="lg:col-span-5">
                    <h3 className="text-white font-bold text-lg mb-8">Your deal profile</h3>

                    {/* Journey */}
                    <div className="mb-8">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/40 tracking-widest block mb-3">I'm looking to...</label>
                      <div className="flex gap-2 flex-wrap">
                        {([['sell', 'Sell a business'], ['buy', 'Buy a business'], ['raise', 'Raise capital']] as const).map(([key, label]) => (
                          <button key={key} onClick={() => setJourney(key)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer ${journey === key ? 'bg-[#b0004a] text-white' : 'bg-white/5 text-[#dadadc] hover:bg-white/10'}`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Industry */}
                    <div className="mb-8">
                      <label className="text-[10px] uppercase font-bold text-[#dadadc]/40 tracking-widest block mb-3">Industry</label>
                      <div className="flex gap-2 flex-wrap">
                        {industryOptions.map((ind) => (
                          <button key={ind.key} onClick={() => setIndustry(ind.key)} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${industry === ind.key ? 'bg-[#b0004a]/20 text-[#b0004a] border border-[#b0004a]/30' : 'bg-white/5 text-[#dadadc]/60 border border-white/10 hover:bg-white/10'}`}>{ind.btn}</button>
                        ))}
                      </div>
                    </div>

                    {/* Revenue slider */}
                    <div className="mb-8">
                      <div className="flex justify-between items-baseline mb-3">
                        <label className="text-[10px] uppercase font-bold text-[#dadadc]/40 tracking-widest">Annual Revenue</label>
                        <span className="text-white font-bold text-lg">{fmtM(revenue)}</span>
                      </div>
                      <input type="range" className="smbx-range" min={500000} max={100000000} step={100000} value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} style={{ background: `linear-gradient(to right, #b0004a ${revPct}%, rgba(255,255,255,0.1) ${revPct}%)` }} />
                      <div className="flex justify-between mt-2"><span className="text-[10px] text-[#dadadc]/25">$500K</span><span className="text-[10px] text-[#dadadc]/25">$100M</span></div>
                    </div>

                    {/* SDE/EBITDA slider */}
                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-3">
                        <label className="text-[10px] uppercase font-bold text-[#dadadc]/40 tracking-widest">SDE or EBITDA</label>
                        <span className="text-white font-bold text-lg">{fmtM(sde)}</span>
                      </div>
                      <input type="range" className="smbx-range" min={100000} max={1000000000} step={50000} value={sde} onChange={(e) => setSde(Number(e.target.value))} style={{ background: `linear-gradient(to right, #b0004a ${sdePct}%, rgba(255,255,255,0.1) ${sdePct}%)` }} />
                      <div className="flex justify-between mt-2"><span className="text-[10px] text-[#dadadc]/25">$100K</span><span className="text-[10px] text-[#dadadc]/25">$1B</span></div>
                    </div>
                  </div>

                  {/* RIGHT: Results */}
                  <div className="lg:col-span-7">
                    {/* Big valuation result */}
                    <div className="bg-[#2f3133] rounded-2xl p-8 md:p-10 border border-white/10 mb-6" style={{ boxShadow: '0 0 60px rgba(176,0,74,0.15), 0 0 120px rgba(176,0,74,0.05)' }}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center"><span className="material-symbols-outlined text-white text-[16px]">monitoring</span></div>
                        <div>
                          <p className="text-[10px] text-[#dadadc]/40 uppercase font-bold tracking-widest">Preliminary Valuation Range</p>
                          <p className="text-[10px] text-[#dadadc]/25">Based on {mult.label} multiples × {basisType}</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-5xl md:text-6xl font-black text-white">{fmtM(vLow)}</span>
                        <span className="text-2xl text-[#dadadc]/30 font-bold">–</span>
                        <span className="text-5xl md:text-6xl font-black text-[#b0004a]">{fmtM(vHigh)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#1a1c1e] rounded-xl p-4"><p className="text-[9px] text-[#dadadc]/30 uppercase font-bold mb-1">Low Multiple</p><p className="text-xl font-black text-white">{mult.low.toFixed(1)}x</p></div>
                        <div className="bg-[#1a1c1e] rounded-xl p-4"><p className="text-[9px] text-[#dadadc]/30 uppercase font-bold mb-1">Mid Multiple</p><p className="text-xl font-black text-white">{mult.mid.toFixed(1)}x</p></div>
                        <div className="bg-[#1a1c1e] rounded-xl p-4"><p className="text-[9px] text-[#dadadc]/30 uppercase font-bold mb-1">High Multiple</p><p className="text-xl font-black text-[#b0004a]">{mult.high.toFixed(1)}x</p></div>
                      </div>
                      <p className="text-[11px] text-[#dadadc]/30 leading-relaxed">This is a ballpark based on broad industry multiples. Yulia refines this with localized market data, add-back analysis, buyer landscape mapping, and risk-adjusted scoring specific to your business.</p>
                    </div>

                    {/* What Yulia finds */}
                    <div className="bg-[#2f3133] rounded-2xl p-6 border border-white/5 mb-6">
                      <p className="text-[10px] text-[#dadadc]/40 uppercase font-bold tracking-widest mb-4">What Yulia typically uncovers</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#1a1c1e] rounded-xl p-4 flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#b0004a] text-xl">search</span>
                          <div><p className="text-[10px] text-[#dadadc]/30">Hidden add-backs</p><p className="text-sm font-bold text-white">{fmtM(abLow)} – {fmtM(abHigh)}</p></div>
                        </div>
                        <div className="bg-[#1a1c1e] rounded-xl p-4 flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#b0004a] text-xl">trending_up</span>
                          <div><p className="text-[10px] text-[#dadadc]/30">Value impact of add-backs</p><p className="text-sm font-bold text-white">{fmtM(abValLow)} – {fmtM(abValHigh)}</p></div>
                        </div>
                        <div className="bg-[#1a1c1e] rounded-xl p-4 flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#b0004a] text-xl">speed</span>
                          <div><p className="text-[10px] text-[#dadadc]/30">Optimization potential</p><p className="text-sm font-bold text-white">Identified in minutes</p></div>
                        </div>
                        <div className="bg-[#1a1c1e] rounded-xl p-4 flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#b0004a] text-xl">shield</span>
                          <div><p className="text-[10px] text-[#dadadc]/30">Deal risk factors</p><p className="text-sm font-bold text-white">Flagged before you commit</p></div>
                        </div>
                      </div>
                    </div>

                    {/* ROI / Cost section */}
                    <div className="bg-[#2f3133] rounded-2xl p-6 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] text-[#dadadc]/40 uppercase font-bold tracking-widest">Your investment vs. return</p>
                        <p className="text-[10px] text-[#dadadc]/25">0.1% of {basisType} · $999 min</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-black text-white">{fmtUSD(fee)}</span>
                            <span className="text-xs text-[#dadadc]/30">{isMinFee ? 'minimum fee' : 'execution fee'}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#b0004a] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.max(feePctOfVal * 10, 1), 15)}%` }}></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[9px] text-[#dadadc]/25">Fee: {feePctOfVal < 0.01 ? '<0.01%' : feePctOfVal.toFixed(2) + '%'} of estimated value</span>
                            <span className="text-[9px] text-[#dadadc]/25">Estimated value →</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-[#dadadc]/30 mb-1">Typical add-back recovery alone</p>
                          <p className="text-xl font-black text-[#b0004a]">{roiMult}× return</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA bar */}
              <div className="bg-[#2f3133] border-t border-white/5 px-10 md:px-14 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-white font-bold">Want the real number?</p>
                  <p className="text-[#dadadc]/40 text-sm">Yulia sharpens this estimate with local market data, add-back discovery, and buyer intelligence — for free.</p>
                </div>
                <button onClick={goToChat} className="shrink-0 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white px-8 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap border-none cursor-pointer">
                  Get your real valuation <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <p className={`text-[11px] mt-4 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Estimates based on broad industry multiple ranges. Actual valuations depend on local market conditions, business-specific factors, and buyer demand. Yulia's analysis is significantly more precise.</p>
        </section>

        {/* ═══ 4. WHAT'S INCLUDED ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">What the fee covers</span>
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">Everything from analysis to close — and 180 days after</h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {included.map((card) => (
              <StaggerItem key={card.title}>
                <div className={`p-8 rounded-xl ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-4">{card.icon}</span>
                  <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 5. HOW PRICING SURFACES ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">How it works in practice</h2>
              <p className={`text-lg ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>You never see a pricing grid inside the product. Yulia calculates your fee from the financials she's already analyzed.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-[#2f3133] rounded-3xl p-10 md:p-12 space-y-6 max-w-4xl">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-sm leading-relaxed max-w-[85%]">Based on the financials you've shared, I've calculated an SDE of $420,000 for your business. Everything I've generated so far — the ValueLens audit, the Value Readiness Report, the preliminary valuation — is yours to keep.</div>
              </div>
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed max-w-[85%]">What's the next step if I want to move toward an LOI?</div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#b0004a] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-sm leading-relaxed max-w-[85%]">To unlock the full execution platform — your deal room, professional deal documents, legal templates, closing support, and your 180-day integration plan — the deal execution fee for your business is <span className="text-[#ffb2bf] font-bold">$999</span>. That's 0.1% of your SDE, and it covers everything for this deal through closing day. No subscriptions, no additional charges.</div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. FAQ — 2-col grid ═══ */}
        <section className="mb-32">
          <ScrollReveal>
            <h2 className="font-headline text-4xl font-bold tracking-tight mb-16">Common questions</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <div>
                  <h4 className="text-lg font-bold mb-3">{faq.q}</h4>
                  {faq.a === 'advisor' ? (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>
                      We have dedicated plans for professionals managing multiple client engagements. Visit the{' '}
                      <a href="/advisors" className={`font-semibold hover:underline ${dark ? 'text-[#b0004a]' : 'text-[#b0004a]'}`}>Advisors page</a>{' '}
                      for Advisor Trial, Pro, and Enterprise plans.
                    </p>
                  ) : (
                    <p className={`leading-relaxed ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>{faq.a}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 7. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-4xl mx-auto">
            <div className={`py-20 px-10 rounded-3xl ${dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]'}`}>
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">Your deal starts with a <span className="text-[#b0004a] italic">conversation.</span></h2>
              <p className={`text-lg mb-12 ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Free analysis. No credit card. No commitment.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleCTA} className="px-12 py-6 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-all shadow-xl border-none cursor-pointer">Talk to Yulia</button>
                <button onClick={handleCTA} className={`px-12 py-6 bg-transparent rounded-full font-headline font-extrabold text-xl transition-all cursor-pointer ${dark ? 'border-2 border-white text-white hover:bg-white hover:text-[#1a1c1e]' : 'border-2 border-[#1a1c1e] text-[#1a1c1e] hover:bg-[#1a1c1e] hover:text-white'}`}>Message Yulia</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
