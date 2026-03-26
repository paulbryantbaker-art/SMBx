import { useState } from 'react';
import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark] = useDarkMode();
  const [sdeK, setSdeK] = useState(500); // in thousands

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  // Shared class helpers
  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const muted = dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]';
  const subtleBg = dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';
  const sliderTrack = dark ? '#3a3c3e' : '#e8e8ea';

  // Calculator logic
  const sde = sdeK * 1000;
  const rawFee = sde * 0.001;
  const fee = Math.max(999, Math.round(rawFee));
  const pct = ((sdeK - 100) / (50000 - 100)) * 100;

  const feeContextText = fee <= 999
    ? 'Minimum fee \u00b7 Everything included'
    : 'One time \u00b7 Everything through close + 180 days';

  // Traditional advisor comparison
  const mult = sdeK < 2000 ? 3.0 : 6.0;
  const ev = sdeK * mult;
  const advisorLow = Math.max(25, Math.round(ev * 0.06));
  const advisorHigh = Math.max(50, Math.round(ev * 0.10));

  const formatK = (v: number) => {
    if (v >= 1000) return '$' + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'M';
    return '$' + v + 'K';
  };

  const formatFee = (v: number) => '$' + v.toLocaleString();

  const freeCards = [
    { icon: 'chat', title: 'Yulia', desc: 'Unlimited conversation about your deal, industry, and market' },
    { icon: 'monitoring', title: 'ValueLens', desc: 'Preliminary valuation with market context. Updated live.' },
    { icon: 'checklist', title: 'Value Readiness', desc: '7-factor score with dollar-impact improvement actions' },
    { icon: 'account_balance_wallet', title: 'Capital Stack', desc: 'Funding template, SBA eligibility, buyer thesis blueprint' },
  ];

  const includedLarge = [
    { icon: 'description', title: 'Professional deal documents', desc: "CIM, pitch deck, LOI, deal memos \u2014 generated from your verified financials, adapted to your league. L1 gets plain English. L5 gets rep & warranty insurance clauses." },
    { icon: 'speed', title: 'Defensible valuation', desc: "Multi-methodology with sourced comparables, growth premiums, and risk discounts. Built to survive the scrutiny of a buyer\u2019s QoE review." },
  ];

  const includedMedium = [
    { icon: 'account_balance_wallet', title: 'Financial modeling', desc: 'SBA qualification, DSCR analysis, acquisition models, cap table waterfalls, sensitivity scenarios \u2014 deterministic engines, not estimates.' },
    { icon: 'gavel', title: 'Negotiation coaching', desc: 'League-specific tactics, deal structure analysis, working capital mechanisms, LOI-to-APA guidance \u2014 coaching for both sides of the table.' },
    { icon: 'fact_check', title: 'DD coordination', desc: 'Checklists, risk summaries, QoE preparation, forensic auditor mode \u2014 organized by gate with completion tracking.' },
  ];

  const steps = [
    { num: '1', title: 'Describe your business', desc: 'Industry, revenue, location \u2014 in your own words', green: true, badge: 'FREE' },
    { num: '2', title: 'Yulia normalizes your financials', desc: 'Add-backs identified, owner salary normalized, one-time expenses flagged', green: true, badge: 'FREE' },
    { num: '3', title: 'Preliminary valuation range', desc: 'Market context, comparable multiples, initial estimate \u2014 yours to keep', green: true, badge: 'FREE' },
    { num: '4', title: 'Your fee appears', desc: '\u201cYour execution fee is $X \u2014 want to continue through close?\u201d', green: false, badge: '0.1%' },
    { num: '5', title: 'Everything unlocks', desc: 'Full valuation, documents, negotiation, closing, 180-day integration', green: false, badge: 'ALL' },
  ];

  const faqs = [
    { q: 'What counts as my SDE or EBITDA?', a: 'The adjusted number Yulia calculates with you \u2014 after add-backs are identified and verified. Not the number on your tax return. The real one.' },
    { q: 'When do I pay?', a: "After Yulia has shown you a preliminary valuation range \u2014 all for free. The fee appears at the natural moment when you\u2019re ready for the full analysis." },
    { q: "What if my deal doesn\u2019t close?", a: 'Your fee covers the entire journey \u2014 valuation, documents, negotiation, closing \u2014 regardless of outcome. No success fees. No close fees. Ever.' },
    { q: "What if I\u2019m a buyer?", a: "Same formula. Based on the target company\u2019s SDE or EBITDA once Yulia calculates it. Thesis development and initial screening are free." },
    { q: 'How does this compare to a traditional advisor?', a: "Traditional M&A advisors charge 8\u201312% of deal value on success, plus monthly retainers. For a $2M deal, that\u2019s $160K\u2013$240K. smbX: $999." },
    { q: 'Is there a maximum fee?', a: "No cap. At $50M EBITDA, the fee is $50,000 \u2014 still a fraction of institutional advisory. The methodology scales with your deal\u2019s complexity." },
  ];

  const quickPicks = [
    { label: '$400K', fee: '$999', value: 400 },
    { label: '$2M', fee: '$2,000', value: 2000 },
    { label: '$10M', fee: '$10,000', value: 10000 },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <style>{`
        .smbx-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:8px;outline:none;cursor:pointer}
        .smbx-range::-webkit-slider-thumb{-webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:#b0004a;border:4px solid #fff;box-shadow:0 2px 12px rgba(176,0,74,0.3);cursor:pointer}
        .smbx-range::-moz-range-thumb{width:32px;height:32px;border-radius:50%;background:#b0004a;border:4px solid #fff;box-shadow:0 2px 12px rgba(176,0,74,0.3);cursor:pointer}
      `}</style>

      {/* ═══ 1. HERO — editorial left-aligned with formula card ═══ */}
      <section className="mb-24 mt-12 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">Pricing</span>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                One formula.<br />Every deal.<br /><span className="text-[#b0004a]">No surprises.</span>
              </h1>
              <p className={`text-xl leading-relaxed max-w-lg ${muted}`}>
                0.1% of your SDE or EBITDA. One payment. Everything included — valuation, documents, negotiation coaching, closing coordination, and 180 days of post-close support.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className={`${darkPanel} rounded-3xl p-10 text-white text-center`}>
                <p className="text-[#dadadc]/40 uppercase text-[10px] tracking-[0.3em] font-bold mb-4">Your execution fee</p>
                <div className="text-7xl font-black tracking-tighter mb-2 font-headline">
                  0.1<span className="text-[#b0004a]">%</span>
                </div>
                <p className="text-sm text-[#dadadc]/50">of SDE or EBITDA · $999 minimum</p>
                <div className="w-12 h-[2px] bg-[#b0004a] mx-auto my-6"></div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-xl font-black text-[#b0004a]">$999</p><p className="text-[9px] text-[#dadadc]/30">≤$999K</p></div>
                  <div><p className="text-xl font-black">$2,500</p><p className="text-[9px] text-[#dadadc]/30">$2.5M</p></div>
                  <div><p className="text-xl font-black">$10K</p><p className="text-[9px] text-[#dadadc]/30">$10M</p></div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 2. FREE TIER — dark panel ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className={`${darkPanel} rounded-3xl px-10 md:px-16 py-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
            <div>
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Free Forever</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-6">Start for free.<br />Keep everything Yulia finds.</h2>
              <p className="text-lg text-[#dadadc]/60 leading-relaxed mb-8">
                No credit card. No account required. Everything through your first two gates — including a preliminary valuation range — is free. Not a trial. Not a teaser. Real analysis you can keep.
              </p>
              <p className="text-[#dadadc]/60 font-bold text-xl border-l-4 border-[#b0004a] pl-6">
                If you could Google it, it's free. The moment Yulia tells you something you can't find anywhere else — that's where the value starts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {freeCards.map((c) => (
                <div key={c.title} className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-3">{c.icon}</span>
                  <h4 className="font-bold mb-1">{c.title}</h4>
                  <p className="text-xs text-[#dadadc]/40">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 3. CALCULATOR — side by side editorial ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Calculator</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-6">Slide to your number.</h2>
              <p className={`text-lg leading-relaxed mb-6 ${muted}`}>
                Your SDE or EBITDA determines your fee. One number. One calculation. No tiers, no packages, no hidden charges.
              </p>
              <p className="font-bold text-xl border-l-4 border-[#b0004a] pl-6 mb-8">
                The deal determines the price.<br />Not a dropdown.
              </p>
              <div className={`${subtleBg} rounded-2xl p-6`}>
                <p className={`text-xs uppercase font-bold tracking-widest mb-2 ${muted}`}>Compare</p>
                <div className="flex justify-between items-baseline mb-2">
                  <span className={`text-sm ${muted}`}>Traditional advisor</span>
                  <span className={`text-lg font-black line-through ${dark ? 'text-[#dadadc]/30' : 'text-[#5d5e61]/30'}`}>
                    {formatK(advisorLow)}–{formatK(advisorHigh)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#b0004a]">smbX.ai</span>
                  <span className="text-lg font-black text-[#b0004a]">{formatFee(fee)}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className={`${card} rounded-3xl p-8 md:p-10 shadow-lg`}>
                <div className="flex justify-between items-baseline mb-2">
                  <label className={`text-sm font-bold ${muted}`}>SDE / EBITDA</label>
                  <span className="text-4xl font-black tracking-tight">{formatK(sdeK)}</span>
                </div>
                <input
                  type="range"
                  className="smbx-range w-full mb-2"
                  min={100}
                  max={50000}
                  step={50}
                  value={sdeK}
                  onChange={(e) => setSdeK(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right, #b0004a ${pct}%, ${sliderTrack} ${pct}%)` }}
                />
                <div className="flex justify-between mb-8">
                  <span className={`text-[10px] ${muted}`}>$100K</span>
                  <span className={`text-[10px] ${muted}`}>$50M</span>
                </div>

                <div className={`${darkPanel} rounded-2xl p-8 text-center text-white`}>
                  <p className="text-[10px] text-[#dadadc]/40 uppercase tracking-[0.3em] font-bold mb-2">Your execution fee</p>
                  <p className="text-6xl font-black tracking-tight text-[#b0004a] mb-2">{formatFee(fee)}</p>
                  <p className="text-sm text-[#dadadc]/50">{feeContextText}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  {quickPicks.map((qp) => (
                    <button
                      key={qp.value}
                      onClick={() => setSdeK(qp.value)}
                      className={`${subtleBg} rounded-xl p-3 text-center hover:bg-[#b0004a]/5 transition-all cursor-pointer border-none`}
                    >
                      <p className="text-xs font-bold">{qp.label}</p>
                      <p className={`text-[10px] ${muted}`}>→ {qp.fee}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 4. WHAT'S INCLUDED — zig-zag layout ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="mb-12">
            <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">Included</span>
            <h2 className="font-headline text-4xl font-black tracking-tight">
              One fee. <span className="text-[#b0004a]">Everything</span> through close — plus 180 days after.
            </h2>
          </div>
        </ScrollReveal>

        {/* Row 1: two large cards */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {includedLarge.map((c) => (
            <StaggerItem key={c.title}>
              <div className={`${card} rounded-3xl p-10 flex items-start gap-5`}>
                <span className="material-symbols-outlined text-[#b0004a] text-4xl shrink-0 mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                <div>
                  <h3 className="text-2xl font-black mb-3">{c.title}</h3>
                  <p className={`leading-relaxed ${muted}`}>{c.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Row 2: three medium cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {includedMedium.map((c) => (
            <StaggerItem key={c.title}>
              <div className={`${subtleBg} rounded-2xl p-8`}>
                <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-3">{c.icon}</span>
                <h4 className="font-bold mb-2">{c.title}</h4>
                <p className={`text-sm ${muted}`}>{c.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Row 3: wide accent card — 180 days */}
        <ScrollReveal>
          <div className="bg-[#b0004a] text-white rounded-3xl p-10 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>merge</span>
              <h3 className="font-headline text-3xl font-black mb-3">180 days after close.</h3>
              <p className="text-lg opacity-80">
                Other platforms stop at the wire transfer. smbX continues with a value creation plan built from what due diligence actually revealed — stabilization, operational assessment, and the growth roadmap.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { day: 'Day 0', label: 'Stabilize' },
                { day: 'Day 30', label: 'Assess' },
                { day: 'Day 90', label: 'Optimize' },
                { day: 'Day 180', label: 'Accelerate' },
              ].map((d) => (
                <div key={d.day} className="bg-white/10 rounded-xl p-5 text-center">
                  <p className="text-3xl font-black">{d.day}</p>
                  <p className="text-xs opacity-60">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 5. NATURAL PAYWALL — border-l-8 editorial ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="border-l-8 border-[#b0004a] pl-8">
                <h2 className="font-headline text-4xl font-black tracking-tight mb-6">The price reveals itself naturally.</h2>
                <p className={`text-xl ${muted}`}>
                  No checkout page. No paywall modal. Yulia calculates your SDE or EBITDA — and at that exact moment, she tells you your fee. By then, she's already proven the value.
                </p>
              </div>
            </div>
            <div className={`lg:col-span-7 ${card} rounded-3xl p-8 shadow-sm`}>
              <div className="space-y-0">
                {steps.map((s, i) => (
                  <div key={s.num}>
                    {i === 3 && <div className="w-full border-t border-dashed border-[#b0004a]/30 my-2"></div>}
                    <div className={`flex items-center gap-4 p-4 rounded-xl ${i === 3 ? 'bg-[#b0004a]/5' : ''} transition-all`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${s.green ? 'bg-[#006630]/10 text-[#006630]' : 'bg-[#b0004a]/10 text-[#b0004a]'}`}>
                        {s.num}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${i === 3 ? 'text-[#b0004a]' : ''}`}>{s.title}</p>
                        <p className={`text-xs ${muted}`}>{s.desc}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded font-bold ${s.green ? 'bg-[#006630]/10 text-[#006630]' : 'bg-[#b0004a]/10 text-[#b0004a]'}`}>
                        {s.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 6. ADVISORS — full-bleed tinted band ═══ */}
      <section className={`mb-24 ${subtleBg} px-6 md:px-12 py-20`}>
        <ScrollReveal>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">For Advisors & Brokers</span>
              <h2 className="font-headline text-4xl font-black tracking-tight mb-6">Your first 3 client deals are free.</h2>
              <p className={`text-lg leading-relaxed mb-6 ${muted}`}>
                Full platform access. Full document generation. Full methodology. No time limit. No feature gates. Run three complete client engagements before paying anything.
              </p>
              <p className="font-bold text-lg border-l-4 border-[#b0004a] pl-6">
                If you like it, monthly plans start at $199.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {/* Trial */}
              <div className={`${card} rounded-2xl p-6 text-center shadow-sm`}>
                <h4 className="font-black text-sm mb-3">Trial</h4>
                <p className="text-4xl font-black mb-1">$0</p>
                <p className={`text-[10px] mb-4 ${muted}`}>First 3 client deals</p>
                <div className={`border-t ${dark ? 'border-zinc-800' : 'border-[#eeeef0]'} pt-3`}>
                  <p className={`text-[10px] ${muted}`}>Full platform</p>
                </div>
              </div>
              {/* Pro — Popular */}
              <div className={`${dark ? 'bg-[#2f3133]' : 'bg-white'} rounded-2xl border-2 border-[#b0004a] p-6 text-center shadow-lg relative`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b0004a] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</span>
                <h4 className="font-black text-sm mb-3">Pro</h4>
                <p className="text-4xl font-black mb-1">$199</p>
                <p className={`text-[10px] mb-4 ${muted}`}>/month</p>
                <div className={`border-t ${dark ? 'border-zinc-800' : 'border-[#eeeef0]'} pt-3`}>
                  <p className={`text-[10px] ${muted}`}>Unlimited clients</p>
                </div>
              </div>
              {/* Enterprise */}
              <div className={`${card} rounded-2xl p-6 text-center shadow-sm`}>
                <h4 className="font-black text-sm mb-3">Enterprise</h4>
                <p className="text-4xl font-black mb-1">$399</p>
                <p className={`text-[10px] mb-4 ${muted}`}>/month</p>
                <div className={`border-t ${dark ? 'border-zinc-800' : 'border-[#eeeef0]'} pt-3`}>
                  <p className={`text-[10px] ${muted}`}>Teams + API</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 7. FAQ — two-column magazine ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-headline text-4xl font-black tracking-tight mb-12">Questions</h2>
        </ScrollReveal>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {faqs.map((faq) => (
            <StaggerItem key={faq.q}>
              <div>
                <h4 className="font-bold mb-2">{faq.q}</h4>
                <p className={`text-sm leading-relaxed ${muted}`}>{faq.a}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══ 8. CTA — wide, punchy ═══ */}
      <section className="mb-12 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className={`${darkPanel} rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white`}>
            <div>
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">
                Free until you<br />see the <span className="text-[#b0004a]">value.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 mt-4">Tell Yulia about your deal. Keep everything she finds. Pay only when you're ready for the full journey.</p>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-4">
              <button
                onClick={handleCTA}
                className="px-10 py-5 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer"
              >
                Talk to Yulia
              </button>
              <p className="text-xs text-[#dadadc]/30">No account required · Your data stays yours</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
